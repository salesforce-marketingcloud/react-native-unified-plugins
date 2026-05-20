import NativeModule from './NativeMCModule';
import type { MarketingCloudSdkApi, InboxMessage } from './types';

let _api: MarketingCloudSdkApi | null = null;

export const MarketingCloudSdkModule = {
  async requestSdk(): Promise<MarketingCloudSdkApi> {
    if (_api) return _api;
    await NativeModule.requestMcSdk();
    _api = {
      refreshInbox: () => NativeModule.refreshInbox(),
      getAllMessages: () => NativeModule.getAllMessages() as Promise<InboxMessage[]>,
      getUnreadMessages: () => NativeModule.getUnreadMessages() as Promise<InboxMessage[]>,
      getReadMessages: () => NativeModule.getReadMessages() as Promise<InboxMessage[]>,
      getDeletedMessages: () => NativeModule.getDeletedMessages() as Promise<InboxMessage[]>,
      getMessageCount: () => NativeModule.getMessageCount(),
      getUnreadMessageCount: () => NativeModule.getUnreadMessageCount(),
      getReadMessageCount: () => NativeModule.getReadMessageCount(),
      getDeletedMessageCount: () => NativeModule.getDeletedMessageCount(),
      markMessageRead: (messageId: string) => NativeModule.markMessageRead(messageId),
      markMessageDeleted: (messageId: string) => NativeModule.markMessageDeleted(messageId),
      markAllMessagesRead: () => NativeModule.markAllMessagesRead(),
      markAllMessagesDeleted: () => NativeModule.markAllMessagesDeleted(),
      trackInboxMessageOpened: (messageId: string) => NativeModule.trackInboxMessageOpened(messageId),
      addTag: (tag: string) => NativeModule.addTag(tag),
      addTags: (tags: string[]) => NativeModule.addTags(tags),
      removeTag: (tag: string) => NativeModule.removeTag(tag),
      removeTags: (tags: string[]) => NativeModule.removeTags(tags),
      getTags: () => NativeModule.getTags() as Promise<string[]>,
      getAttributes: () => NativeModule.getAttributes() as Promise<{ [key: string]: string }>,
      enablePiAnalytics: () => NativeModule.enablePiAnalytics(),
      disablePiAnalytics: () => NativeModule.disablePiAnalytics(),
      isPiAnalyticsEnabled: () => NativeModule.isPiAnalyticsEnabled(),
      enableAnalytics: () => NativeModule.enableAnalytics(),
      disableAnalytics: () => NativeModule.disableAnalytics(),
      isAnalyticsEnabled: () => NativeModule.isAnalyticsEnabled(),
      getDeviceId: () => NativeModule.getDeviceId(),
      getContactKey: () => NativeModule.getContactKey(),
      enableLogging: () => NativeModule.enableLogging(),
      disableLogging: () => NativeModule.disableLogging(),
    };
    return _api;
  },
};
