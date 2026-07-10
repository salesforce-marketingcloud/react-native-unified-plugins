/**
 * @license
 * Copyright 2026 Salesforce, Inc
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @class MarketingCloudSdkApi
 */
export interface MarketingCloudSdkApi {
  /**
   * Requests an updated list of Inbox Messages from the Marketing Cloud Servers.
   * @returns {Promise<boolean>} A promise to whether the refresh was successful.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.messages.inbox/-inbox-message-manager/refresh-inbox.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)refreshMessages |iOS Docs}
   */
  refreshInbox(): Promise<boolean>;

  /**
   * Retrieves the list of Active, Read & Unread, not Deleted Inbox Messages.
   * @returns {Promise<InboxMessage[]>} A promise to the array of inbox messages.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.messages.inbox/-inbox-message-manager/get-messages.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)getAllMessages |iOS Docs}
   */
  getAllMessages(): Promise<InboxMessage[]>;

  /**
   * Retrieves the list of Active, Unread, not Deleted Inbox Messages.
   * @returns {Promise<InboxMessage[]>} A promise to the array of unread inbox messages.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.messages.inbox/-inbox-message-manager/get-unread-messages.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)getUnreadMessages |iOS Docs}
   */
  getUnreadMessages(): Promise<InboxMessage[]>;

  /**
   * Retrieves the list of Active, Read, not Deleted Inbox Messages.
   * @returns {Promise<InboxMessage[]>} A promise to the array of read inbox messages.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.messages.inbox/-inbox-message-manager/get-read-messages.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)getReadMessages |iOS Docs}
   */
  getReadMessages(): Promise<InboxMessage[]>;

  /**
   * Retrieves the list of Active, Deleted Inbox Messages.
   * @returns {Promise<InboxMessage[]>} A promise to the array of deleted inbox messages.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.messages.inbox/-inbox-message-manager/get-deleted-messages.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)getDeletedMessages |iOS Docs}
   */
  getDeletedMessages(): Promise<InboxMessage[]>;

  /**
   * Retrieves the total number of not deleted Inbox Messages.
   * @returns {Promise<number>} A promise to the message count.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.messages.inbox/-inbox-message-manager/get-message-count.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)getAllMessagesCount |iOS Docs}
   */
  getMessageCount(): Promise<number>;

  /**
   * Retrieves the total number of unread, not deleted Inbox Messages.
   * @returns {Promise<number>} A promise to the unread message count.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.messages.inbox/-inbox-message-manager/get-unread-message-count.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)getUnreadMessagesCount |iOS Docs}
   */
  getUnreadMessageCount(): Promise<number>;

  /**
   * Retrieves the total number of read, not deleted Inbox Messages.
   * @returns {Promise<number>} A promise to the read message count.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.messages.inbox/-inbox-message-manager/get-read-message-count.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)getReadMessagesCount |iOS Docs}
   */
  getReadMessageCount(): Promise<number>;

  /**
   * Retrieves the total number of deleted Inbox Messages.
   * @returns {Promise<number>} A promise to the deleted message count.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.messages.inbox/-inbox-message-manager/get-deleted-message-count.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)getDeletedMessagesCount |iOS Docs}
   */
  getDeletedMessageCount(): Promise<number>;

  /**
   * Marks an InboxMessage as read in local storage.
   * @param  {string} messageId - The InboxMessage id to mark as read.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.messages.inbox/-inbox-message-manager/set-message-read.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)markMessageWithIdReadWithMessageId: |iOS Docs}
   */
  markMessageRead(messageId: string): void;

  /**
   * Marks an InboxMessage as deleted in local storage.
   * @param  {string} messageId - The InboxMessage id to mark as deleted.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.messages.inbox/-inbox-message-manager/delete-message.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)markMessageWithIdDeletedWithMessageId: |iOS Docs}
   */
  markMessageDeleted(messageId: string): void;

  /**
   * Marks all active, unread InboxMessages as read.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.messages.inbox/-inbox-message-manager/mark-all-messages-read.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)markAllMessagesRead |iOS Docs}
   */
  markAllMessagesRead(): void;

  /**
   * Marks all active InboxMessages as deleted.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.messages.inbox/-inbox-message-manager/mark-all-messages-deleted.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)markAllMessagesDeleted |iOS Docs}
   */
  markAllMessagesDeleted(): void;

  /**
   * Tracks the opening of an InboxMessage for analytics.
   * @param  {InboxMessage} message - The inbox message that was opened.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.analytics/-analytics-manager/track-inbox-open-event.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)trackMessageOpened: |iOS Docs}
   */
  trackInboxMessageOpened(message: InboxMessage): void;

  /**
   * Adds a tag to the list of tags in the registration.
   * @param  {string} tag - The tag to be added.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.registration/-registration-manager/-editor/add-tag.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)addTag: |iOS Docs}
   */
  addTag(tag: string): void;

  /**
   * Adds multiple tags to the list of tags in the registration.
   * @param  {string[]} tags - The tags to be added.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.registration/-registration-manager/-editor/add-tags.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)addTags: |iOS Docs}
   */
  addTags(tags: string[]): void;

  /**
   * Removes a tag from the list of tags in the registration.
   * @param  {string} tag - The tag to be removed.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.registration/-registration-manager/-editor/remove-tag.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)removeTag: |iOS Docs}
   */
  removeTag(tag: string): void;

  /**
   * Removes multiple tags from the list of tags in the registration.
   * @param  {string[]} tags - The tags to be removed.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.registration/-registration-manager/-editor/remove-tags.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)removeTag: |iOS Docs}
   */
  removeTags(tags: string[]): void;

  /**
   * Returns the tags currently set on the device.
   * @returns {Promise<string[]>} A promise to the array of tags currently set in the native SDK.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.registration/-registration-manager/get-tags.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)tags |iOS Docs}
   */
  getTags(): Promise<string[]>;

  /**
   * Enables Predictive Intelligence analytics in the Marketing Cloud SDK.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.analytics/-analytics-manager/enable-pi-analytics.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)setPiAnalyticsEnabled: |iOS Docs}
   */
  enablePiAnalytics(): void;

  /**
   * Disables Predictive Intelligence analytics in the Marketing Cloud SDK.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.analytics/-analytics-manager/disable-pi-analytics.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)setPiAnalyticsEnabled: |iOS Docs}
   */
  disablePiAnalytics(): void;

  /**
   * Checks if Predictive Intelligence analytics is enabled in the Marketing Cloud SDK.
   * @returns {Promise<boolean>} A promise to the boolean representation of whether PI analytics
   *     is enabled.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.analytics/-analytics-manager/are-pi-analytics-enabled.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)isPiAnalyticsEnabled |iOS Docs}
   */
  isPiAnalyticsEnabled(): Promise<boolean>;

  /**
   * Enables analytics in the Marketing Cloud SDK.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.analytics/-analytics-manager/enable-analytics.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)setAnalyticsEnabled: |iOS Docs}
   */
  enableAnalytics(): void;

  /**
   * Disables analytics in the Marketing Cloud SDK.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.analytics/-analytics-manager/disable-analytics.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)setAnalyticsEnabled: |iOS Docs}
   */
  disableAnalytics(): void;

  /**
   * Checks if analytics is enabled in the Marketing Cloud SDK.
   * @returns {Promise<boolean>} A promise to the boolean representation of whether analytics is
   *     enabled.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.analytics/-analytics-manager/are-analytics-enabled.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)isAnalyticsEnabled |iOS Docs}
   */
  isAnalyticsEnabled(): Promise<boolean>;

  /**
   * Returns the deviceId used by the Marketing Cloud to send push messages to the device.
   * @returns {Promise<string | null>} A promise to the device Id.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.registration/-registration-manager/get-device-id.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)deviceIdentifier |iOS Docs}
   */
  getDeviceId(): Promise<string | null>;

  /**
   * Sets the signed string security token used to verify registration. Pass `null`
   * to clear the previously stored value.
   * @param  {string | null} signedString - The signed string token, or `null` to clear it.
   * @returns {Promise<boolean>} A promise to whether the signed string was successfully set.
   * @example
   * const ok = await mc.setSignedString('<signed-token>');
   * // Clear:
   * await mc.setSignedString(null);
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.registration/-registration-manager/-editor/set-signed-string.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)setSignedString: |iOS Docs}
   */
  setSignedString(signedString: string | null): Promise<boolean>;

  /**
   * Returns the value of the last stored signed string security token.
   * @returns {Promise<string | null>} A promise to the current signed string, or `null` if none is set.
   * @example
   * const token = await mc.getSignedString();
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.registration/-registration-manager/get-signed-string.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)signedString |iOS Docs}
   */
  getSignedString(): Promise<string | null>;

  /**
   * Enables verbose logging within the native Marketing Cloud SDK.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sfmcsdk/com.salesforce.marketingcloud.sfmcsdk.components.logging/-log-level/index.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)setDebugLoggingEnabled: |iOS Docs}
   */
  enableLogging(): void;

  /**
   * Disables verbose logging within the native Marketing Cloud SDK.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sfmcsdk/com.salesforce.marketingcloud.sfmcsdk.components.logging/-log-level/index.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)setDebugLoggingEnabled: |iOS Docs}
   */
  disableLogging(): void;

  /**
   * Registers a callback to receive registration change events from the SDK.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.registration/-registration-manager/register-for-registration-events.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)setRegistrationCallback: |iOS Docs}
   */
  setRegistrationCallback(): void;

  /**
   * Unregisters the registration change callback.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sdk/com.salesforce.marketingcloud.registration/-registration-manager/unregister-for-registration-events.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MarketingCloudSdk/11.0/Classes/MarketingCloudSdk.html#/c:@CM@MarketingCloudSDK@objc(cs)SFMarketingCloudSdk(im)unsetRegistrationCallback |iOS Docs}
   */
  unsetRegistrationCallback(): void;
}

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

export interface PiCart {
  cartId?: string;
  items: Array<{ uniqueId: string; quantity: number; price: number }>;
  total?: number;
}

export interface PiOrder {
  orderId: string;
  cart: PiCart;
  orderTotal?: number;
  shippingTotal?: number;
  taxTotal?: number;
}
