import React, { useEffect, useState, useCallback } from 'react';
import {
    ScrollView,
    View,
    Text,
    Switch,
    TextInput,
    Modal,
    StyleSheet,
    Alert,
    PermissionsAndroid,
    Platform,
    Linking,
    ToastAndroid,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { color } from '../colors';
import type { SFMCSdkApi } from '@sfmc/react-native-sfmc-core';
import { PushModule, PushEvent } from '@sfmc/react-native-push';
import type { PushApi, PushUrlAction } from '@sfmc/react-native-push';
import type { MCApi } from '@sfmc/react-native-marketingcloudsdk';
import type { MAMApi } from '@sfmc/react-native-mobileappmessaging';
import { IamModule, IamEvent } from '@sfmc/react-native-iam';
import type {
    IamApi,
    InAppMessage,
    InAppMessageCloseAction,
    IamUrlAction,
} from '@sfmc/react-native-iam';
import { SectionHeader, Card, Row, PrimaryButton } from '../components';

interface Props {
    sfmc: SFMCSdkApi;
    push: PushApi;
    mc: MCApi;
    mam: MAMApi;
    iam: IamApi;
    loggingEnabled: boolean;
    onLoggingChange: (enabled: boolean) => void;
}

export default function HomeTab({ sfmc, push, mc, mam, iam, loggingEnabled, onLoggingChange }: Props) {
    const [pushToken, setPushToken] = useState<string | null>(null);
    const [mcDeviceId, setMcDeviceId] = useState<string | null>(null);
    const [mamDeviceId, setMamDeviceId] = useState<string | null>(null);
    const [pushEnabled, setPushEnabled] = useState(false);
    const [mcAnalytics, setMcAnalytics] = useState(false);
    const [mamAnalytics, setMamAnalytics] = useState(false);

    // Event modal state
    const [eventModalVisible, setEventModalVisible] = useState(false);
    const [eventName, setEventName] = useState('');
    const [attrKey, setAttrKey] = useState('');
    const [attrValue, setAttrValue] = useState('');
    const [sendImmediate, setSendImmediate] = useState(false);

    // IAM state
    const [iamMessageId, setIamMessageId] = useState('');
    const [iamFontName, setIamFontName] = useState('');
    const [iamLog, setIamLog] = useState('');
    const [iamDefaultShow, setIamDefaultShow] = useState(true);
    const [iamBlockedIds, setIamBlockedIds] = useState('');

    const loadState = useCallback(async () => {
        const [token, mceId, mamId, pushOn, mcOn, mamOn] = await Promise.allSettled([
            push.getPushToken(),
            mc.getDeviceId(),
            mam.getDeviceId(),
            push.isPushEnabled(),
            mc.isAnalyticsEnabled(),
            mam.isAnalyticsEnabled(),
        ]);
        if (token.status === 'fulfilled') setPushToken(token.value);
        if (mceId.status === 'fulfilled') setMcDeviceId(mceId.value);
        if (mamId.status === 'fulfilled') setMamDeviceId(mamId.value);
        if (pushOn.status === 'fulfilled') setPushEnabled(pushOn.value);
        if (mcOn.status === 'fulfilled') setMcAnalytics(mcOn.value);
        if (mamOn.status === 'fulfilled') setMamAnalytics(mamOn.value);
    }, [mc, mam, push]);

    // Prepend timestamped lines so the most recent event is on top; cap the log.
    // Stable identity (functional updater, no captured state) so effects that use
    // it don't need to re-subscribe.
    const logEvent = useCallback((line: string) => {
        const ts = new Date().toLocaleTimeString();
        setIamLog((prev) => [`[${ts}] ${line}`, ...prev.split('\n')].slice(0, 8).join('\n'));
    }, []);

    useEffect(() => {
        loadState();
    }, [loadState]);

    // The event and URL-handling delegates are always enabled in this example so
    // lifecycle events and URL actions are delivered to JS for the whole session.
    useEffect(() => {
        iam.setEventDelegateEnabled(true);
        iam.setURLHandlingEnabled(true);
        // Route push notification URL actions to JS as well (iOS only).
        push.setURLHandlingEnabled(true);
    }, [iam, push]);

    // Subscribe to IAM lifecycle events for the whole session and surface them in
    // the log. The native listener is registered via setEventDelegateEnabled(true)
    // in the effect above.
    useEffect(() => {
        const emitter = IamModule.getEmitter();
        const subs = [
            emitter.addListener(IamEvent.WillShowMessage, (m: InAppMessage) =>
                logEvent(`willShow: ${m.id}`),
            ),
            emitter.addListener(IamEvent.DidShowMessage, (m: InAppMessage) =>
                logEvent(`didShow: ${m.id}`),
            ),
            emitter.addListener(
                IamEvent.DidCloseMessage,
                (m: InAppMessage & { action: InAppMessageCloseAction }) =>
                    logEvent(`didClose: ${m.id} (${m.action?.type ?? 'n/a'})`),
            ),
            emitter.addListener(IamEvent.UrlActionSelected, (a: IamUrlAction) => {
                logEvent(`urlAction: ${a.type} → ${a.url}`);
                // URL handling was routed to JS, so the SDK won't open it — do it here.
                Linking.openURL(a.url).catch((err) =>
                    logEvent(`openURL failed: ${err?.message ?? err}`),
                );
            }),
        ];
        return () => subs.forEach((sub) => sub.remove());
    }, [logEvent]);

    // Subscribe to push notification URL actions (iOS only). URL handling was
    // routed to JS via push.setURLHandlingEnabled(true), so the SDK won't open
    // the URL — do it here.
    useEffect(() => {
        const sub = PushModule.getEmitter().addListener(
            PushEvent.UrlActionSelected,
            (a: PushUrlAction) => {
                logEvent(`pushUrlAction: ${a.type} → ${a.url}`);
                Linking.openURL(a.url).catch((err) =>
                    logEvent(`openURL failed: ${err?.message ?? err}`),
                );
            },
        );
        return () => sub.remove();
    }, [logEvent]);

    function copyToClipboard(label: string, value: string | null | undefined) {
        if (!value) return;
        Clipboard.setString(value);
        if (Platform.OS === 'android') {
            ToastAndroid.show(`${label} copied`, ToastAndroid.SHORT);
        } else {
            Alert.alert('Copied', `${label} copied to clipboard.`);
        }
    }

    async function ensureNotificationPermission(): Promise<boolean> {
        if (Platform.OS !== 'android') return true;
        if ((Platform.Version as number) < 33) return true;

        const perm = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
        const already = await PermissionsAndroid.check(perm);
        if (already) return true;

        const result = await PermissionsAndroid.request(perm, {
            title: 'Allow notifications',
            message: 'Enable notifications to receive push messages from Marketing Cloud.',
            buttonPositive: 'Allow',
            buttonNegative: 'Not now',
        });

        if (result === PermissionsAndroid.RESULTS.GRANTED) return true;

        if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            Alert.alert(
                'Notifications blocked',
                'Notifications are blocked. Enable them in system settings to receive push.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => Linking.openSettings() },
                ],
            );
        }
        return false;
    }

    async function onPushToggle(v: boolean) {
        if (v) {
            const granted = await ensureNotificationPermission();
            if (!granted) {
                setPushEnabled(false);
                return;
            }
            setPushEnabled(true);
            push.enablePush();
        } else {
            setPushEnabled(false);
            push.disablePush();
        }
    }

    function onMcAnalyticsToggle(v: boolean) {
        setMcAnalytics(v);
        if (v) mc.enableAnalytics(); else mc.disableAnalytics();
    }

    function onMamAnalyticsToggle(v: boolean) {
        setMamAnalytics(v);
        if (v) mam.enableAnalytics(); else mam.disableAnalytics();
    }

    function onLoggingToggle(v: boolean) {
        onLoggingChange(v);
        if (v) {
            sfmc.setLogging('DEBUG');
            mc.enableLogging();
        } else {
            sfmc.setLogging('NONE');
            mc.disableLogging();
        }
    }

    function sendEvent() {
        if (!eventName.trim()) {
            Alert.alert('Event name required');
            return;
        }
        const attrs: Record<string, string> = {};
        if (attrKey.trim() && attrValue.trim()) attrs[attrKey.trim()] = attrValue.trim();
        const event = { objType: 'CustomEvent' as const, name: eventName.trim(), attributes: attrs };
        if (sendImmediate) {
            sfmc.sendImmediate(event);
        } else {
            sfmc.track(event);
        }
        const mode = sendImmediate ? 'sent immediately' : 'queued for delivery';
        setEventModalVisible(false);
        setEventName('');
        setAttrKey('');
        setAttrValue('');
        setSendImmediate(false);
        Alert.alert('Event tracked', `"${event.name}" ${mode}.`);
    }

    function triggerIam() {
        if (!iamMessageId.trim()) return;
        iam.showInAppMessage(iamMessageId.trim());
    }

    // Build the data-driven filter from the current UI state and push it to the
    // native gate, which evaluates it per message inside shouldShowMessage.
    function applyIamFilter(next: { defaultShow?: boolean; blockedIds?: string }) {
        const defaultShow = next.defaultShow ?? iamDefaultShow;
        const blockedRaw = next.blockedIds ?? iamBlockedIds;
        const blockedIds = blockedRaw
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        iam.setMessageFilter({ blockedIds, defaultShow });
    }

    function onIamDefaultShowToggle(v: boolean) {
        setIamDefaultShow(v);
        applyIamFilter({ defaultShow: v });
    }

    function applyIamFont() {
        const name = iamFontName.trim();
        if (!name) return;
        iam.setFont(name);
    }

    function applyIamStatusBarColor() {
        // SFMC blue (0xAARRGGBB). Android-only; no-op on iOS.
        iam.setStatusBarColor(0xff0a84ff);
    }

    return (
        <ScrollView
            style={s.scroll}
            contentContainerStyle={s.content}
            keyboardShouldPersistTaps="handled"
        >
            {/* Device */}
            <SectionHeader title="Device" />
            <Card>
                <Row
                    label="Push Token"
                    value={pushToken ? pushToken.substring(0, 16) + '…' : 'none'}
                    onPress={pushToken ? () => copyToClipboard('Push Token', pushToken) : undefined}
                />
                <Row
                    label="MCE Device ID"
                    value={mcDeviceId ?? 'none'}
                    onPress={mcDeviceId ? () => copyToClipboard('MCE Device ID', mcDeviceId) : undefined}
                />
                <Row
                    label="MAM Device ID"
                    value={mamDeviceId ?? 'none'}
                    onPress={mamDeviceId ? () => copyToClipboard('MAM Device ID', mamDeviceId) : undefined}
                />
            </Card>

            {/* Push */}
            <SectionHeader title="Push Notifications" />
            <Card>
                <View style={s.switchRow}>
                    <Text style={s.switchLabel}>Push Enabled</Text>
                    <Switch value={pushEnabled} onValueChange={onPushToggle} />
                </View>
            </Card>

            {/* Analytics */}
            <SectionHeader title="Analytics" />
            <Card>
                <View style={s.switchRow}>
                    <Text style={s.switchLabel}>MCE Analytics</Text>
                    <Switch value={mcAnalytics} onValueChange={onMcAnalyticsToggle} />
                </View>
                <View style={[s.switchRow, s.noBorder]}>
                    <Text style={s.switchLabel}>MAM Analytics</Text>
                    <Switch value={mamAnalytics} onValueChange={onMamAnalyticsToggle} />
                </View>
            </Card>

            {/* Logging */}
            <SectionHeader title="Logging" />
            <Card>
                <View style={[s.switchRow, s.noBorder]}>
                    <Text style={s.switchLabel}>Debug Logging</Text>
                    <Switch value={loggingEnabled} onValueChange={onLoggingToggle} />
                </View>
            </Card>

            {/* Events */}
            <SectionHeader title="Events" />
            <PrimaryButton title="Track Custom Event…" onPress={() => setEventModalVisible(true)} />
            <PrimaryButton title="Flush Events" onPress={() => { sfmc.flush(); Alert.alert('Flushed', 'Event queue flushed.'); }} />

            {/* In-App Messaging */}
            <SectionHeader title="In-App Messaging" />
            <Card>
                <View style={s.inputRow}>
                    <TextInput
                        style={s.textInput}
                        placeholder="Message ID"
                        placeholderTextColor={color('placeholderText')}
                        value={iamMessageId}
                        onChangeText={setIamMessageId}
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                </View>
            </Card>
            <PrimaryButton title="Show In-App Message" onPress={triggerIam} />

            {/* IAM behavior toggles */}
            <Card>
                <View style={[s.switchRow, s.noBorder]}>
                    <Text style={s.switchLabel}>Allow Auto-Display (default)</Text>
                    <Switch value={iamDefaultShow} onValueChange={onIamDefaultShowToggle} />
                </View>
            </Card>

            {/* IAM per-message filter: blocked IDs are suppressed natively */}
            <Card>
                <View style={s.inputRow}>
                    <TextInput
                        style={s.textInput}
                        placeholder="Blocked message IDs (comma-separated)"
                        placeholderTextColor={color('placeholderText')}
                        value={iamBlockedIds}
                        onChangeText={setIamBlockedIds}
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                </View>
            </Card>
            <PrimaryButton title="Apply Message Filter" onPress={() => applyIamFilter({})} />

            {/* IAM styling */}
            <Card>
                <View style={s.inputRow}>
                    <TextInput
                        style={s.textInput}
                        placeholder="Font name (e.g. Helvetica-Bold)"
                        placeholderTextColor={color('placeholderText')}
                        value={iamFontName}
                        onChangeText={setIamFontName}
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                </View>
            </Card>
            <PrimaryButton title="Set Message Font" onPress={applyIamFont} />
            <PrimaryButton title="Set Status Bar Color (Android)" onPress={applyIamStatusBarColor} />

            {iamLog ? (
                <Card>
                    <Text style={s.iamLog}>{iamLog}</Text>
                </Card>
            ) : null}

            <View style={{ height: 32 }} />

            {/* Track Event Modal */}
            <Modal
                visible={eventModalVisible}
                animationType="slide"
                presentationStyle="formSheet"
                onRequestClose={() => setEventModalVisible(false)}
            >
                <View style={s.modal}>
                    <Text style={s.modalTitle}>Track Custom Event</Text>
                    <TextInput
                        style={s.modalInput}
                        placeholder="Event name (required)"
                        placeholderTextColor={color('placeholderText')}
                        value={eventName}
                        onChangeText={setEventName}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TextInput
                        style={s.modalInput}
                        placeholder="Attribute key (optional)"
                        placeholderTextColor={color('placeholderText')}
                        value={attrKey}
                        onChangeText={setAttrKey}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TextInput
                        style={s.modalInput}
                        placeholder="Attribute value (optional)"
                        placeholderTextColor={color('placeholderText')}
                        value={attrValue}
                        onChangeText={setAttrValue}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <View style={s.switchRow}>
                        <Text style={s.switchLabel}>Send Immediate</Text>
                        <Switch value={sendImmediate} onValueChange={setSendImmediate} />
                    </View>
                    <PrimaryButton title="Send Event" onPress={sendEvent} />
                    <PrimaryButton title="Cancel" onPress={() => setEventModalVisible(false)} destructive />
                </View>
            </Modal>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    scroll: { flex: 1, backgroundColor: color('systemGroupedBackground') },
    content: { paddingBottom: 40 },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: color('separator'),
    },
    noBorder: { borderBottomWidth: 0 },
    switchLabel: {
        fontSize: 15,
        color: color('label'),
    },
    inputRow: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    textInput: {
        fontSize: 15,
        color: color('label'),
        paddingVertical: 6,
    },
    iamLog: {
        fontSize: 12,
        color: color('secondaryLabel'),
        padding: 12,
        fontFamily: 'Menlo',
    },
    modal: {
        flex: 1,
        padding: 20,
        backgroundColor: color('systemGroupedBackground'),
        gap: 12,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: color('label'),
        marginBottom: 8,
    },
    modalInput: {
        backgroundColor: color('secondarySystemGroupedBackground'),
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: color('label'),
    },
});
