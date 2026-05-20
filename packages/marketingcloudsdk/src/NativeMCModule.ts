import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  requestMcSdk(): Promise<void>;
  refreshInbox(): Promise<boolean>;
  getAllMessages(): Promise<Object[]>;
  getUnreadMessages(): Promise<Object[]>;
  getReadMessages(): Promise<Object[]>;
  getDeletedMessages(): Promise<Object[]>;
  getMessageCount(): Promise<number>;
  getUnreadMessageCount(): Promise<number>;
  getReadMessageCount(): Promise<number>;
  getDeletedMessageCount(): Promise<number>;
  markMessageRead(messageId: string): void;
  markMessageDeleted(messageId: string): void;
  markAllMessagesRead(): void;
  markAllMessagesDeleted(): void;
  trackInboxMessageOpened(messageId: string): void;
  addTag(tag: string): void;
  addTags(tags: string[]): void;
  removeTag(tag: string): void;
  removeTags(tags: string[]): void;
  getTags(): Promise<string[]>;
  getAttributes(): Promise<Object>;
  enablePiAnalytics(): void;
  disablePiAnalytics(): void;
  isPiAnalyticsEnabled(): Promise<boolean>;
  enableAnalytics(): void;
  disableAnalytics(): void;
  isAnalyticsEnabled(): Promise<boolean>;
  getDeviceId(): Promise<string | null>;
  getContactKey(): Promise<string | null>;
  enableLogging(): void;
  disableLogging(): void;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('MCModule');
