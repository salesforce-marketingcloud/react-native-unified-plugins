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
import type { SFMCSdkApi } from '@salesforce-mc/react-native-sfmc-core';
import type { PushApi } from '@salesforce-mc/react-native-push';
import type { MCApi } from '@salesforce-mc/react-native-marketingcloudsdk';
import type { MAMApi } from '@salesforce-mc/react-native-mobileappmessaging';
import type { IamApi } from '@salesforce-mc/react-native-iam';
import { SectionHeader, Card, Row, PrimaryButton } from '../components';

interface Props {
    sfmc: SFMCSdkApi;
    push: PushApi;
    mc: MCApi;
    mam: MAMApi;
    iam: IamApi;
}

export default function HomeTab({ sfmc, push, mc, mam, iam }: Props) {
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

    // IAM state
    const [iamMessageId, setIamMessageId] = useState('');
    const [iamLog, setIamLog] = useState('');

    useEffect(() => {
        loadState();
    }, []);

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

    function sendEvent() {
        if (!eventName.trim()) {
            Alert.alert('Event name required');
            return;
        }
        const attrs: Record<string, string> = {};
        if (attrKey.trim() && attrValue.trim()) attrs[attrKey.trim()] = attrValue.trim();
        sfmc.track({ objType: 'CustomEvent', name: eventName.trim(), attributes: attrs });
        setEventModalVisible(false);
        setEventName('');
        setAttrKey('');
        setAttrValue('');
        Alert.alert('Event tracked', `"${eventName.trim()}" queued for delivery.`);
    }

    function triggerIam() {
        if (!iamMessageId.trim()) {
            setIamLog('Enter a message ID first.');
            return;
        }
        iam.showInAppMessage(iamMessageId.trim());
        setIamLog(`Showing in-app message: "${iamMessageId.trim()}"`);
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

            {/* Events */}
            <SectionHeader title="Events" />
            <PrimaryButton title="Track Custom Event…" onPress={() => setEventModalVisible(true)} />

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
                {iamLog ? <Text style={s.iamLog}>{iamLog}</Text> : null}
            </Card>
            <PrimaryButton title="Show In-App Message" onPress={triggerIam} />

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
        paddingHorizontal: 16,
        paddingBottom: 8,
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
