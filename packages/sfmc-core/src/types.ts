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

import type { SFMCEvent } from "./events";

/**
 * @class SFMCSdkApi
 */
export interface SFMCSdkApi {
  /**
   * Sets the profile identifier for the device's user.
   * @param  {string} profileId - The value to be set as the profile id of
   *     the device's user.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sfmcsdk/com.salesforce.marketingcloud.sfmcsdk.components.identity/-identity-editor/profile-id.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/SFMCSdk/11.0/Protocols/IdentityModifier.html#/c:@M@SFMCSDK@objc(pl)SFIdentityModifier(py)profileId |iOS Docs}
   */
  setProfileId(profileId: string): void;

  /**
   * Sets the value of an attribute in the identity.
   * @param  {string} key - The name of the attribute to be set in the
   *     identity.
   * @param  {string} value - The value of the `key` attribute to be set in
   *     the identity.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sfmcsdk/com.salesforce.marketingcloud.sfmcsdk.components.identity/-attributes-editor/put.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/SFMCSdk/11.0/Protocols/IdentityModifier.html#/c:@M@SFMCSDK@objc(pl)SFIdentityModifier(im)addAttributeWithKey:value: |iOS Docs}
   */
  setAttribute(key: string, value: string): void;

  /**
   * Clears the value of an attribute in the identity.
   * @param  {string} key - The name of the attribute whose value should be
   *     cleared from the identity.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sfmcsdk/com.salesforce.marketingcloud.sfmcsdk.components.identity/-attributes-editor/clear.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/SFMCSdk/11.0/Protocols/IdentityModifier.html#/c:@M@SFMCSDK@objc(pl)SFIdentityModifier(im)clearAttributeWithKey: |iOS Docs}
   */
  clearAttribute(key: string): void;

  /**
   * Sets multiple attributes in the identity at once.
   * @param  {Object.<string, string>} attributes - A key/value map of attributes to be set.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sfmcsdk/com.salesforce.marketingcloud.sfmcsdk.components.identity/-attributes-editor/set.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/SFMCSdk/11.0/Protocols/IdentityModifier.html#/c:@M@SFMCSDK@objc(pl)SFIdentityModifier(im)addAttributesWithAttributes: |iOS Docs}
   */
  setAttributes(attributes: { [key: string]: string }): void;

  /**
   * Returns the maps of attributes set in the identity.
   * @returns {Promise<Object.<string, string> | null>} A promise to the key/value map of attributes
   *     set in the identity.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sfmcsdk/com.salesforce.marketingcloud.sfmcsdk.components.identity/-identity/attributes.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/SFMCSdk/11.0/Protocols/IdentityInfo.html#/c:@M@SFMCSDK@objc(pl)SFIdentityInfo(py)attributes |iOS Docs}
   */
  getAttributes(): Promise<{ [key: string]: string } | null>;

  /**
   * Clears all attributes from the identity.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sfmcsdk/com.salesforce.marketingcloud.sfmcsdk.components.identity/-identity/-builder/clear-attributes.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/SFMCSdk/11.0/Protocols/IdentityModifier.html#/c:@M@SFMCSDK@objc(pl)SFIdentityModifier(im)clearAllAttributes |iOS Docs}
   */
  clearAllAttributes(): void;

  /**
   * Returns the profile identifier currently set on the device.
   * @returns {Promise<string | null>} A promise to the current profile id.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sfmcsdk/com.salesforce.marketingcloud.sfmcsdk.components.identity/-identity/profile-id.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/SFMCSdk/11.0/Protocols/IdentityInfo.html#/c:@M@SFMCSDK@objc(pl)SFIdentityInfo(py)profileId |iOS Docs}
   */
  getProfileId(): Promise<string | null>;

  /**
   * Returns the party identification name currently set on the device.
   * @returns {Promise<string | null>} A promise to the current party identification name.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sfmcsdk/com.salesforce.marketingcloud.sfmcsdk.components.identity/-identity/party-identification-name.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/SFMCSdk/11.0/Protocols/IdentityInfo.html#/c:@M@SFMCSDK@objc(pl)SFIdentityInfo(py)partyIdentificationName |iOS Docs}
   */
  getPartyIdentificationName(): Promise<string | null>;

  /**
   * Sets the party identification name for the device's user.
   * @param  {string} name - The display name or full name of the user.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sfmcsdk/com.salesforce.marketingcloud.sfmcsdk.components.identity/-identity-editor/party-identification-name.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/SFMCSdk/11.0/Protocols/IdentityModifier.html#/c:@M@SFMCSDK@objc(pl)SFIdentityModifier(py)partyIdentificationName |iOS Docs}
   */
  setPartyIdentificationName(name: string): void;

  /**
   * Returns the party identification number currently set on the device.
   * @returns {Promise<string | null>} A promise to the current party identification number.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sfmcsdk/com.salesforce.marketingcloud.sfmcsdk.components.identity/-identity/party-identification-number.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/SFMCSdk/11.0/Protocols/IdentityInfo.html#/c:@M@SFMCSDK@objc(pl)SFIdentityInfo(py)partyIdentificationNumber |iOS Docs}
   */
  getPartyIdentificationNumber(): Promise<string | null>;

  /**
   * Sets the party identification number for the device's user.
   * @param  {string} numberValue - A unique identifier number for the user.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sfmcsdk/com.salesforce.marketingcloud.sfmcsdk.components.identity/-identity-editor/party-identification-number.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/SFMCSdk/11.0/Protocols/IdentityModifier.html#/c:@M@SFMCSDK@objc(pl)SFIdentityModifier(py)partyIdentificationNumber |iOS Docs}
   */
  setPartyIdentificationNumber(numberValue: string): void;

  /**
   * Returns the party identification type currently set on the device.
   * @returns {Promise<string | null>} A promise to the current party identification type.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sfmcsdk/com.salesforce.marketingcloud.sfmcsdk.components.identity/-identity/party-identification-type.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/SFMCSdk/11.0/Protocols/IdentityInfo.html#/c:@M@SFMCSDK@objc(pl)SFIdentityInfo(py)partyIdentificationType |iOS Docs}
   */
  getPartyIdentificationType(): Promise<string | null>;

  /**
   * Sets the party identification type for the device's user.
   * @param  {string} type - The category or classification for the user.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sfmcsdk/com.salesforce.marketingcloud.sfmcsdk.components.identity/-identity-editor/party-identification-type.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/SFMCSdk/11.0/Protocols/IdentityModifier.html#/c:@M@SFMCSDK@objc(pl)SFIdentityModifier(py)partyIdentificationType |iOS Docs}
   */
  setPartyIdentificationType(type: string): void;

  /**
   * This method helps to track events, which could result in actions such as an InApp Message
   * being displayed.
   *
   * @param {SFMCEvent} event - The event to be tracked.
   *
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sfmcsdk/com.salesforce.marketingcloud.sfmcsdk/-s-f-m-c-sdk/-companion/track.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/SFMCSdk/11.0/Classes/SFMCSdk.html#/c:@CM@SFMCSDK@objc(cs)SFMCSdk(cm)trackWithEvent: |iOS Docs}
   */
  track(event: SFMCEvent): void;

  /**
   * Sets the log level for the native Marketing Cloud SDK and Unified SFMC SDK.
   * @param  {string} level - The log level to set. One of 'DEBUG', 'WARN', 'ERROR', or 'NONE'.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sfmcsdk/com.salesforce.marketingcloud.sfmcsdk.components.logging/-log-level/index.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/SFMCSdk/11.0/Classes/SFMCSdk.html#/c:@M@SFMCSDK@objc(cs)SFMCSdk(cm)setLoggerWithLogLevel:logOutputter: |iOS Docs}
   */
  setLogging(level: "DEBUG" | "WARN" | "ERROR" | "NONE"): void;

  /**
   * Instructs the native SDK to return the SDK state as an object. This content can help
   * diagnose most issues within the SDK and will be requested by the Marketing Cloud
   * support team.
   * @returns {Promise<Object>} A promise to the SDK state object.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sfmcsdk/com.salesforce.marketingcloud.sfmcsdk/-s-f-m-c-sdk/get-sdk-state.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/SFMCSdk/11.0/Classes/SFMCSdk.html#/c:@M@SFMCSDK@objc(cs)SFMCSdk(cm)state |iOS Docs}
   */
  getSdkState(): Promise<{ [key: string]: any }>;

  /**
   * Tracks an event and sends it immediately without waiting for the next batch cycle.
   *
   * @param {SFMCEvent} event - The event to be tracked and sent immediately.
   *
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sfmcsdk/com.salesforce.marketingcloud.sfmcsdk/-s-f-m-c-sdk/-companion/send-immediate.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/SFMCSdk/11.0/Classes/SFMCSdk.html#/c:@CM@SFMCSDK@objc(cs)SFMCSdk(cm)sendImmediateWithEvent: |iOS Docs}
   */
  sendImmediate(event: SFMCEvent): void;

  /**
   * Flushes all queued events to the Marketing Cloud servers immediately.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sfmcsdk/com.salesforce.marketingcloud.sfmcsdk/-s-f-m-c-sdk/-companion/flush.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/SFMCSdk/11.0/Classes/SFMCSdk.html#/c:@CM@SFMCSDK@objc(cs)SFMCSdk(cm)flush |iOS Docs}
   */
  flush(): void;
}
