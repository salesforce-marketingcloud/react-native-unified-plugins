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
 * @class PushApi
 */
export interface PushApi {
  /**
   * Enables push messaging in the native Marketing Cloud SDK.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/pushfeaturemodule/com.salesforce.marketingcloud.pushfeature.push/-push-message-manager/enable-push.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/PushFeatureSdk/2.0/Classes/PushFeature.html#/c:@CM@PushFeatureSDK@objc(cs)SFPushFeature(im)setPushEnabledWithPushEnabled: |iOS Docs}
   */
  enablePush(): void;

  /**
   * Disables push messaging in the native Marketing Cloud SDK.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/pushfeaturemodule/com.salesforce.marketingcloud.pushfeature.push/-push-message-manager/disable-push.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/PushFeatureSdk/2.0/Classes/PushFeature.html#/c:@CM@PushFeatureSDK@objc(cs)SFPushFeature(im)setPushEnabledWithPushEnabled: |iOS Docs}
   */
  disablePush(): void;

  /**
   * Returns the token used by the Marketing Cloud to send push messages to
   * the device.
   * @returns {Promise<string | null>} A promise to the push token string.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/pushfeaturemodule/com.salesforce.marketingcloud.pushfeature.push/-push-message-manager/get-push-token.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/PushFeatureSdk/2.0/Classes/PushFeature.html#/c:@CM@PushFeatureSDK@objc(cs)SFPushFeature(im)deviceToken |iOS Docs}
   */
  getPushToken(): Promise<string | null>;

  /**
   * The current state of the pushEnabled flag in the native Marketing Cloud
   * SDK.
   * @returns {Promise<boolean>} A promise to the boolean representation of whether push is
   *     enabled.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/pushfeaturemodule/com.salesforce.marketingcloud.pushfeature.push/-push-message-manager/is-push-enabled.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/PushFeatureSdk/2.0/Classes/PushFeature.html#/c:@CM@PushFeatureSDK@objc(cs)SFPushFeature(im)isPushEnabled |iOS Docs}
   */
  isPushEnabled(): Promise<boolean>;
}

export interface NotificationMessage {
  id: string;
  title?: string;
  alert?: string;
  subtitle?: string;
  sound?: string;
  type?: string;
  trigger?: string;
  custom?: string;
  customKeys?: { [key: string]: string };
  url?: string;
  media?: { url?: string; alt?: string };
  region?: Region;
}

export interface Region {
  id: string;
  latitude: number;
  longitude: number;
  radius: number;
  proximity?: "enter" | "exit";
}

export interface Action {
  type: "OPEN_APP" | "DEEPLINK" | "URL" | "DISMISS" | "CLOUD_PAGE";
  data?: string;
}
