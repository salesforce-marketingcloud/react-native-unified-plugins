export interface MarketingCloudSdkApi {
    refreshInbox(): Promise<boolean>;
  getAllMessages(): Promise<InboxMessage[]>;
  getUnreadMessages(): Promise<InboxMessage[]>;
  getReadMessages(): Promise<InboxMessage[]>;
  getDeletedMessages(): Promise<InboxMessage[]>;
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
  getAttributes(): Promise<{ [key: string]: string }>;
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
}

// Inbox messaging model — generated from Android SDK InboxMessage discovery.
export interface InboxMessage {
  id: string;
  subject?: string;
  title?: string;
  alert?: string;
  sound?: string;
  subtitle?: string;
  startDateUtc?: string;
  endDateUtc?: string;
  sendDateUtc?: string;
  read: boolean;
  deleted: boolean;
  url?: string;
  media?: { url?: string; altText?: string };
  custom?: string;
  customKeys?: { [key: string]: string };
  messageType?: number;
  inboxMessage?: string;
  inboxSubtitle?: string;
  notificationMessage?: { [key: string]: any };
}

// Personalization Insights cart wrapper for analytics. Plain object passed through to native.
export interface PiCart {
  cartId?: string;
  items: Array<{ uniqueId: string; quantity: number; price: number; }>;
  total?: number;
}

export interface PiOrder {
  orderId: string;
  cart: PiCart;
  orderTotal?: number;
  shippingTotal?: number;
  taxTotal?: number;
}
