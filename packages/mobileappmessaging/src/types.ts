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
 * @class MobileAppMessagingApi
 */
export interface MobileAppMessagingApi {
  /**
   * Returns the deviceId used by Mobile App Messaging to identify the device.
   * @returns {Promise<string | null>} A promise to the device Id.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/mobileappmessaging/index.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MAMSdk/2.0/Classes/MobileAppMessaging.html#/c:@CM@MobileAppMessagingSDK@objc(cs)SFMobileAppMessaging(im)deviceIdentifier |iOS Docs}
   */
  getDeviceId(): Promise<string | null>;

  /**
   * Enables analytics in the Mobile App Messaging SDK.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/mobileappmessaging/index.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MAMSdk/2.0/Classes/MobileAppMessaging.html#/c:@CM@MobileAppMessagingSDK@objc(cs)SFMobileAppMessaging(im)setAnalyticsEnabled: |iOS Docs}
   */
  enableAnalytics(): void;

  /**
   * Disables analytics in the Mobile App Messaging SDK.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/mobileappmessaging/index.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MAMSdk/2.0/Classes/MobileAppMessaging.html#/c:@CM@MobileAppMessagingSDK@objc(cs)SFMobileAppMessaging(im)setAnalyticsEnabled: |iOS Docs}
   */
  disableAnalytics(): void;

  /**
   * Checks if analytics is enabled in the Mobile App Messaging SDK.
   * @returns {Promise<boolean>} A promise to the boolean representation of whether analytics is
   *     enabled.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/mobileappmessaging/index.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MAMSdk/2.0/Classes/MobileAppMessaging.html#/c:@CM@MobileAppMessagingSDK@objc(cs)SFMobileAppMessaging(im)isAnalyticsEnabled |iOS Docs}
   */
  isAnalyticsEnabled(): Promise<boolean>;

  /**
   * Registers a callback to receive registration change events from the SDK.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/mobileappmessaging/index.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MAMSdk/2.0/Classes/MobileAppMessaging.html#/c:@CM@MobileAppMessagingSDK@objc(cs)SFMobileAppMessaging(im)setRegistrationCallback: |iOS Docs}
   */
  setRegistrationCallback(): void;

  /**
   * Unregisters the registration change callback.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/mobileappmessaging/index.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/MAMSdk/2.0/Classes/MobileAppMessaging.html#/c:@CM@MobileAppMessagingSDK@objc(cs)SFMobileAppMessaging(im)unsetRegistrationCallback |iOS Docs}
   */
  unsetRegistrationCallback(): void;
}

export interface Registration {
  deviceId?: string;
  version?: string;
}
