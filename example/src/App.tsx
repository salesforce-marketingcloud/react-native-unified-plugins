import React, { Component, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    StyleSheet,
} from 'react-native';
import { color } from './colors';
import { SFMCSdkModule } from '@salesforce-mc/react-native-sfmc-core';
import type { SFMCSdkApi } from '@salesforce-mc/react-native-sfmc-core';
import { PushModule } from '@salesforce-mc/react-native-push';
import type { PushApi } from '@salesforce-mc/react-native-push';
import { IamModule } from '@salesforce-mc/react-native-iam';
import type { IamApi } from '@salesforce-mc/react-native-iam';
import { MCModule } from '@salesforce-mc/react-native-marketingcloudsdk';
import type { MCApi } from '@salesforce-mc/react-native-marketingcloudsdk';
import { MAMModule } from '@salesforce-mc/react-native-mobileappmessaging';
import type { MAMApi } from '@salesforce-mc/react-native-mobileappmessaging';
import HomeTab from './tabs/HomeTab';
import RegistrationTab from './tabs/RegistrationTab';
import InboxTab from './tabs/InboxTab';
import type { InboxActions } from './tabs/InboxTab';
import DebugTab from './tabs/DebugTab';
import { StatusBadge } from './components';

// ─────────────────────────────────────────────────────────────────────────────
// Error Boundary
// ─────────────────────────────────────────────────────────────────────────────

interface EBState { error: Error | null }

class ErrorBoundary extends Component<{ children: React.ReactNode }, EBState> {
    state: EBState = { error: null };
    static getDerivedStateFromError(error: Error): EBState { return { error }; }
    render() {
        if (this.state.error) {
            return (
                <View style={eb.container}>
                    <Text style={eb.title}>Something went wrong</Text>
                    <Text style={eb.message}>{this.state.error.message}</Text>
                </View>
            );
        }
        return this.props.children;
    }
}

const eb = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#c0392b', justifyContent: 'center', padding: 24 },
    title: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 12 },
    message: { color: '#ffe0e0', fontSize: 14, fontFamily: 'Menlo' },
});

// ─────────────────────────────────────────────────────────────────────────────
// Tab definitions
// ─────────────────────────────────────────────────────────────────────────────

type Tab = 'home' | 'identity' | 'inbox' | 'debug';

const TABS: { key: Tab; icon: string; label: string }[] = [
    { key: 'home',     icon: '⌂', label: 'Home' },
    { key: 'identity', icon: '✎', label: 'Identity' },
    { key: 'inbox',    icon: '✉', label: 'Inbox' },
    { key: 'debug',    icon: '⚙', label: 'Debug' },
];

const TITLES: Record<Tab, string> = {
    home:     'SFMC SDK',
    identity: 'Identity',
    inbox:    'Inbox',
    debug:    'Debug',
};

// ─────────────────────────────────────────────────────────────────────────────
// AppInner
// ─────────────────────────────────────────────────────────────────────────────

interface SDKState {
    sfmc: SFMCSdkApi | null;
    push: PushApi | null;
    iam: IamApi | null;
    mc: MCApi | null;
    mam: MAMApi | null;
}

interface InitWarning { module: string; message: string }

function AppInner() {
    const [sdks, setSdks] = useState<SDKState>({ sfmc: null, push: null, iam: null, mc: null, mam: null });
    const [initializing, setInitializing] = useState(true);
    const [warnings, setWarnings] = useState<InitWarning[]>([]);
    const [activeTab, setActiveTab] = useState<Tab>('home');

    // Inbox nav bar actions — ref to avoid re-renders, state flag to trigger nav bar render
    const inboxActionsRef = useRef<InboxActions | null>(null);
    const [inboxActionsReady, setInboxActionsReady] = useState(false);

    useEffect(() => {
        initAll();
    }, []);

    async function initAll() {
        const results = await Promise.allSettled([
            SFMCSdkModule.requestSdk(),
            PushModule.requestSdk(),
            IamModule.requestSdk(),
            MCModule.requestSdk(),
            MAMModule.requestSdk(),
        ]);

        const modules = ['Core', 'Push', 'IAM', 'MarketingCloud', 'MAM'];
        const newWarnings: InitWarning[] = [];
        const [sfmc, push, iam, mc, mam] = results.map((r, i) => {
            if (r.status === 'rejected') {
                newWarnings.push({ module: modules[i], message: r.reason?.message ?? String(r.reason) });
                return null;
            }
            return r.value;
        });

        setSdks({ sfmc, push, iam, mc, mam } as SDKState);
        setWarnings(newWarnings);
        setInitializing(false);
    }

    if (initializing) {
        return (
            <View style={s.loadingContainer}>
                <ActivityIndicator size="large" color={color('systemBlue')} />
                <Text style={s.loadingText}>Initializing SFMC SDK…</Text>
            </View>
        );
    }

    const showInboxActions = activeTab === 'inbox' && inboxActionsReady && inboxActionsRef.current;

    return (
        <View style={s.root}>
            {/* Nav bar */}
            <View style={s.navBar}>
                {showInboxActions && (
                    <TouchableOpacity
                        style={s.navLeft}
                        onPress={() => inboxActionsRef.current?.refresh()}
                    >
                        <Text style={s.navAction}>↻</Text>
                    </TouchableOpacity>
                )}
                <Text style={s.navTitle}>{TITLES[activeTab]}</Text>
                {showInboxActions && (
                    <View style={s.navRight}>
                        <TouchableOpacity onPress={() => inboxActionsRef.current?.markAllRead()}>
                            <Text style={s.navAction}>✓ All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => inboxActionsRef.current?.deleteAll()}>
                            <Text style={[s.navAction, s.navDestructive]}>Del All</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Warning banners */}
            {warnings.map(w => (
                <View key={w.module} style={s.warnBanner}>
                    <StatusBadge status="warn" label={`${w.module}: ${w.message}`} />
                </View>
            ))}

            {/* Tab content */}
            <View style={s.content}>
                {activeTab === 'home' && sdks.sfmc && sdks.push && sdks.mc && sdks.mam && sdks.iam && (
                    <HomeTab sfmc={sdks.sfmc} push={sdks.push} mc={sdks.mc} mam={sdks.mam} iam={sdks.iam} />
                )}
                {activeTab === 'identity' && sdks.sfmc && sdks.mc && (
                    <RegistrationTab sfmc={sdks.sfmc} mc={sdks.mc} />
                )}
                {activeTab === 'inbox' && sdks.mc && (
                    <InboxTab
                        mc={sdks.mc}
                        onActionsReady={(actions) => {
                            inboxActionsRef.current = actions;
                            setInboxActionsReady(true);
                        }}
                    />
                )}
                {activeTab === 'debug' && sdks.sfmc && (
                    <DebugTab sfmc={sdks.sfmc} />
                )}
                {/* Fallback if primary module failed */}
                {activeTab === 'home' && (!sdks.sfmc || !sdks.push || !sdks.mc || !sdks.mam || !sdks.iam) && (
                    <View style={s.unavailable}>
                        <Text style={s.unavailableText}>One or more SDK modules failed to initialise. See warnings above.</Text>
                    </View>
                )}
            </View>

            {/* Tab bar */}
            <View style={s.tabBar}>
                {TABS.map(t => (
                    <TouchableOpacity
                        key={t.key}
                        style={s.tabItem}
                        onPress={() => setActiveTab(t.key)}
                        activeOpacity={0.7}
                    >
                        <Text style={[s.tabIcon, activeTab === t.key && s.tabIconActive]}>{t.icon}</Text>
                        <Text style={[s.tabLabel, activeTab === t.key && s.tabLabelActive]}>{t.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// App root
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
    return (
        <ErrorBoundary>
            <View style={{ flex: 1, backgroundColor: color('systemGroupedBackground') }}>
                <SafeAreaView style={{ flex: 1 }}>
                    <AppInner />
                </SafeAreaView>
            </View>
        </ErrorBoundary>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: color('systemGroupedBackground'),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        backgroundColor: color('systemGroupedBackground'),
    },
    loadingText: {
        fontSize: 15,
        color: color('secondaryLabel'),
    },
    navBar: {
        height: 44,
        backgroundColor: color('secondarySystemGroupedBackground'),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: color('separator'),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    navTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: color('label'),
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
    },
    navLeft: {
        position: 'absolute',
        left: 12,
        zIndex: 1,
    },
    navRight: {
        position: 'absolute',
        right: 12,
        flexDirection: 'row',
        gap: 12,
        zIndex: 1,
    },
    navAction: {
        fontSize: 15,
        color: color('systemBlue'),
        fontWeight: '500',
    },
    navDestructive: {
        color: color('systemRed'),
    },
    warnBanner: {
        backgroundColor: color('systemOrange'),
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    content: { flex: 1 },
    unavailable: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    unavailableText: {
        color: color('secondaryLabel'),
        fontSize: 15,
        textAlign: 'center',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: color('secondarySystemGroupedBackground'),
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: color('separator'),
        paddingBottom: 4,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 4,
        gap: 2,
    },
    tabIcon: {
        fontSize: 20,
        color: color('tertiaryLabel'),
    },
    tabIconActive: {
        color: color('systemBlue'),
    },
    tabLabel: {
        fontSize: 10,
        color: color('tertiaryLabel'),
    },
    tabLabelActive: {
        color: color('systemBlue'),
        fontWeight: '500',
    },
});
