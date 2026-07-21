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

import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

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
  trackInboxMessageOpened(message: Object): void;
  addTag(tag: string): void;
  addTags(tags: string[]): void;
  removeTag(tag: string): void;
  removeTags(tags: string[]): void;
  getTags(): Promise<string[]>;
  enablePiAnalytics(): void;
  disablePiAnalytics(): void;
  isPiAnalyticsEnabled(): Promise<boolean>;
  enableAnalytics(): void;
  disableAnalytics(): void;
  isAnalyticsEnabled(): Promise<boolean>;
  getDeviceId(): Promise<string | null>;
  setSignedString(signedString: string | null): Promise<boolean>;
  getSignedString(): Promise<string | null>;
  enableLogging(): void;
  disableLogging(): void;
  setRegistrationCallback(): void;
  unsetRegistrationCallback(): void;
  registerInboxResponseListener(): void;
  unregisterInboxResponseListener(): void;
  enableLocation(): void;
  disableLocation(): void;
  isLocationEnabled(): Promise<boolean>;
  startWatchingLocation(): void;
  stopWatchingLocation(): void;
  isWatchingLocation(): Promise<boolean>;
  getLastKnownLocation(): Promise<{ [key: string]: string } | null>;
  enableProximityMessaging(): void;
  disableProximityMessaging(): void;
  isProximityMessagingEnabled(): Promise<boolean>;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>("MCModule");
