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
 * @class MarketingCloudSdkModule
 */

import { NativeEventEmitter } from "react-native";
import NativeModule from "./NativeMCModule";
import type {
  MarketingCloudSdkApi,
  InboxMessage,
  LastKnownLocation,
} from "./types";

let _api: MarketingCloudSdkApi | null = null;
let _emitter: NativeEventEmitter | null = null;

export const MarketingCloudSdkModule = {
  async requestSdk(): Promise<MarketingCloudSdkApi> {
    if (_api) return _api;
    await NativeModule.requestMcSdk();
    _api = {
      refreshInbox: () => NativeModule.refreshInbox(),
      getAllMessages: () =>
        NativeModule.getAllMessages() as Promise<InboxMessage[]>,
      getUnreadMessages: () =>
        NativeModule.getUnreadMessages() as Promise<InboxMessage[]>,
      getReadMessages: () =>
        NativeModule.getReadMessages() as Promise<InboxMessage[]>,
      getDeletedMessages: () =>
        NativeModule.getDeletedMessages() as Promise<InboxMessage[]>,
      getMessageCount: () => NativeModule.getMessageCount(),
      getUnreadMessageCount: () => NativeModule.getUnreadMessageCount(),
      getReadMessageCount: () => NativeModule.getReadMessageCount(),
      getDeletedMessageCount: () => NativeModule.getDeletedMessageCount(),
      markMessageRead: (messageId: string) =>
        NativeModule.markMessageRead(messageId),
      markMessageDeleted: (messageId: string) =>
        NativeModule.markMessageDeleted(messageId),
      markAllMessagesRead: () => NativeModule.markAllMessagesRead(),
      markAllMessagesDeleted: () => NativeModule.markAllMessagesDeleted(),
      trackInboxMessageOpened: (message: InboxMessage) =>
        NativeModule.trackInboxMessageOpened(message as unknown as Object),
      addTag: (tag: string) => NativeModule.addTag(tag),
      addTags: (tags: string[]) => NativeModule.addTags(tags),
      removeTag: (tag: string) => NativeModule.removeTag(tag),
      removeTags: (tags: string[]) => NativeModule.removeTags(tags),
      getTags: () => NativeModule.getTags() as Promise<string[]>,
      enablePiAnalytics: () => NativeModule.enablePiAnalytics(),
      disablePiAnalytics: () => NativeModule.disablePiAnalytics(),
      isPiAnalyticsEnabled: () => NativeModule.isPiAnalyticsEnabled(),
      enableAnalytics: () => NativeModule.enableAnalytics(),
      disableAnalytics: () => NativeModule.disableAnalytics(),
      isAnalyticsEnabled: () => NativeModule.isAnalyticsEnabled(),
      getDeviceId: () => NativeModule.getDeviceId(),
      setSignedString: (signedString: string | null) =>
        NativeModule.setSignedString(signedString),
      getSignedString: () => NativeModule.getSignedString(),
      enableLogging: () => NativeModule.enableLogging(),
      disableLogging: () => NativeModule.disableLogging(),
      setRegistrationCallback: () => NativeModule.setRegistrationCallback(),
      unsetRegistrationCallback: () => NativeModule.unsetRegistrationCallback(),
      enableLocation: () => NativeModule.enableLocation(),
      disableLocation: () => NativeModule.disableLocation(),
      isLocationEnabled: () => NativeModule.isLocationEnabled(),
      startWatchingLocation: () => NativeModule.startWatchingLocation(),
      stopWatchingLocation: () => NativeModule.stopWatchingLocation(),
      isWatchingLocation: () => NativeModule.isWatchingLocation(),
      getLastKnownLocation: () =>
        NativeModule.getLastKnownLocation() as Promise<LastKnownLocation | null>,
      enableProximityMessaging: () => NativeModule.enableProximityMessaging(),
      disableProximityMessaging: () => NativeModule.disableProximityMessaging(),
      isProximityMessagingEnabled: () =>
        NativeModule.isProximityMessagingEnabled(),
    };
    return _api;
  },

  getEmitter(): NativeEventEmitter {
    if (!_emitter) _emitter = new NativeEventEmitter(NativeModule);
    return _emitter;
  },
};
