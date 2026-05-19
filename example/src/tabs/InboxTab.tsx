import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Alert,
} from 'react-native';
import { color } from '../colors';
import type { MCApi, InboxMessage } from '@salesforce-mc/react-native-marketingcloudsdk';

type Segment = 'all' | 'unread' | 'read' | 'deleted';

interface Props {
    mc: MCApi;
    onActionsReady: (actions: InboxActions) => void;
}

export interface InboxActions {
    markAllRead: () => void;
    deleteAll: () => void;
    refresh: () => void;
}

const InboxTab = forwardRef<InboxActions, Props>(({ mc, onActionsReady }, _ref) => {
    const [segment, setSegment] = useState<Segment>('all');
    const [messages, setMessages] = useState<InboxMessage[]>([]);
    const [counts, setCounts] = useState({ all: 0, unread: 0, read: 0, deleted: 0 });
    const [loading, setLoading] = useState(true);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [allMsgs, [all, unread, read, deleted]] = await Promise.all([
                fetchSegment('all'),
                Promise.all([
                    mc.getMessageCount(),
                    mc.getUnreadMessageCount(),
                    mc.getReadMessageCount(),
                    mc.getDeletedMessageCount(),
                ]),
            ]);
            setMessages(allMsgs);
            setCounts({ all, unread, read, deleted });
        } finally {
            setLoading(false);
        }
    }, [mc, segment]);

    async function fetchSegment(seg: Segment): Promise<InboxMessage[]> {
        switch (seg) {
            case 'all':     return mc.getAllMessages();
            case 'unread':  return mc.getUnreadMessages();
            case 'read':    return mc.getReadMessages();
            case 'deleted': return mc.getDeletedMessages();
        }
    }

    const loadSegment = useCallback(async (seg: Segment) => {
        setLoading(true);
        try {
            const msgs = await fetchSegment(seg);
            setMessages(msgs);
        } finally {
            setLoading(false);
        }
    }, [mc]);

    useEffect(() => {
        fetchAll();
    }, []);

    useEffect(() => {
        loadSegment(segment);
    }, [segment]);

    const refresh = useCallback(async () => {
        await mc.refreshInbox();
        await fetchAll();
    }, [mc, fetchAll]);

    const markAllRead = useCallback(() => {
        mc.markAllMessagesRead();
        fetchAll();
    }, [mc, fetchAll]);

    const deleteAll = useCallback(() => {
        Alert.alert('Delete All', 'Mark all inbox messages as deleted?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete All', style: 'destructive', onPress: () => { mc.markAllMessagesDeleted(); fetchAll(); } },
        ]);
    }, [mc, fetchAll]);

    useEffect(() => {
        onActionsReady({ markAllRead, deleteAll, refresh });
    }, [markAllRead, deleteAll, refresh]);

    function onLongPress(item: InboxMessage) {
        Alert.alert(item.subject ?? 'Message', undefined, [
            {
                text: item.read ? 'Already Read' : 'Mark Read',
                onPress: () => { mc.markMessageRead(item.id); fetchAll(); },
                style: item.read ? 'default' : 'default',
            },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => { mc.markMessageDeleted(item.id); fetchAll(); },
            },
            { text: 'Cancel', style: 'cancel' },
        ]);
    }

    const SEGMENTS: { key: Segment; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'unread', label: 'Unread' },
        { key: 'read', label: 'Read' },
        { key: 'deleted', label: 'Deleted' },
    ];

    return (
        <View style={s.container}>
            {/* Segmented control */}
            <View style={s.segBar}>
                {SEGMENTS.map(seg => (
                    <TouchableOpacity
                        key={seg.key}
                        style={[s.segBtn, segment === seg.key && s.segBtnActive]}
                        onPress={() => setSegment(seg.key)}
                        activeOpacity={0.7}
                    >
                        <Text style={[s.segLabel, segment === seg.key && s.segLabelActive]}>
                            {seg.label}
                        </Text>
                        <Text style={[s.segCount, segment === seg.key && s.segLabelActive]}>
                            {counts[seg.key]}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <ActivityIndicator style={s.spinner} />
            ) : (
                <FlatList
                    data={messages}
                    keyExtractor={item => item.id}
                    contentContainerStyle={messages.length === 0 ? s.emptyContainer : s.listContent}
                    ListEmptyComponent={<Text style={s.emptyText}>No messages</Text>}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={s.messageRow}
                            onLongPress={() => onLongPress(item)}
                            activeOpacity={0.7}
                        >
                            <View style={s.messageLeft}>
                                {!item.read && <View style={s.unreadDot} />}
                            </View>
                            <View style={s.messageBody}>
                                <Text style={s.messageSubject} numberOfLines={1}>
                                    {item.subject ?? '(No subject)'}
                                </Text>
                                <Text style={s.messageDate}>
                                    {item.startDateUtc ? new Date(item.startDateUtc.replace(' ', 'T') + 'Z').toLocaleDateString() : '—'}
                                </Text>
                            </View>
                            <Text style={s.messageId} numberOfLines={1}>{item.id}</Text>
                        </TouchableOpacity>
                    )}
                    ItemSeparatorComponent={() => <View style={s.separator} />}
                />
            )}
        </View>
    );
});

export default InboxTab;

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: color('systemGroupedBackground') },
    segBar: {
        flexDirection: 'row',
        backgroundColor: color('tertiarySystemFill'),
        margin: 12,
        borderRadius: 10,
        padding: 2,
    },
    segBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 6,
        borderRadius: 8,
        gap: 1,
    },
    segBtnActive: {
        backgroundColor: color('secondarySystemGroupedBackground'),
    },
    segLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: color('secondaryLabel'),
    },
    segCount: {
        fontSize: 14,
        fontWeight: '600',
        color: color('secondaryLabel'),
    },
    segLabelActive: {
        color: color('label'),
    },
    spinner: { marginTop: 40 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: {
        color: color('tertiaryLabel'),
        fontSize: 16,
    },
    listContent: { paddingHorizontal: 16, paddingBottom: 32 },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: color('secondarySystemGroupedBackground'),
        borderRadius: 10,
        padding: 12,
        gap: 8,
    },
    messageLeft: {
        width: 10,
        alignItems: 'center',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: color('systemBlue'),
    },
    messageBody: { flex: 1, gap: 2 },
    messageSubject: {
        fontSize: 15,
        fontWeight: '500',
        color: color('label'),
    },
    messageDate: {
        fontSize: 12,
        color: color('secondaryLabel'),
    },
    messageId: {
        fontSize: 10,
        color: color('tertiaryLabel'),
        maxWidth: 80,
    },
    separator: {
        height: 6,
    },
});
