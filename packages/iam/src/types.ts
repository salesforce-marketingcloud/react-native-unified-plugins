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
 * The layout/template type of an in-app message, normalized to the shared enum
 * names used on both platforms. `unknown` is iOS-only (the SDK reports it when
 * the type can't be resolved).
 */
export type IamMessageType =
  | "bannerTop"
  | "bannerBottom"
  | "fullImageFill"
  | "full"
  | "modal"
  | "pushPrimer"
  | "unknown";

/**
 * An image or video attached to an {@link InAppMessage}.
 *
 * Field names match the cross-platform shape used by the other SFMC unified
 * plugins; every field is best-effort and present only when the SDK supplied
 * it.
 */
export interface InAppMessageMedia {
  /** The media's source URL. */
  url?: string;
  /** Alternate text describing the media. */
  altText?: string;
  /** The media's aspect ratio (e.g. `"16:9"`). */
  aspectRatio?: string;
}

/**
 * A tappable button rendered within an {@link InAppMessage}.
 *
 * Field names match the cross-platform shape used by the other SFMC unified
 * plugins; every field is best-effort and present only when the SDK supplied
 * it.
 */
export interface InAppMessageButton {
  /** The button's identifier. */
  id?: string;
  /** The button's position within the message, starting at 0. */
  index?: number;
  /** The button's display label. */
  text?: string;
  /** The action invoked when the button is tapped (e.g. a URL). */
  action?: string;
  /** The button's background color, as a hex string. */
  backgroundColor?: string;
}

/**
 * A serialized in-app message delivered with lifecycle events.
 *
 * Only `id` is guaranteed; every other field is best-effort and present only
 * when the native SDK supplied it. All fields are serialized on both Android
 * and iOS with matching shapes.
 */
export interface InAppMessage {
  /** The unique identifier of the in-app message. Always present. */
  id: string;
  /** Message layout/template type, by its shared enum name. */
  type?: IamMessageType;
  /** The message's title text. */
  title?: string;
  /** The message's body text. */
  body?: string;
  /** The message's media (image/video), when present. */
  media?: InAppMessageMedia;
  /** The message's buttons, in display order. */
  buttons?: InAppMessageButton[];
  /**
   * Originating SDK module. Note the value set differs by platform: Android
   * reports the `Event.Producer` enum name (e.g. `MCE_MODULE`), iOS reports a
   * `ModuleName` string.
   */
  source?: string;
  /** Number of times the message has been displayed. */
  displayCount?: number;
  /** Maximum number of displays allowed. */
  displayLimit?: number;
  /**
   * Whether the per-app display limit is overridden. (Maps to Android's
   * `appLimitOverride` and iOS's `displayLimitOverride`.)
   */
  displayLimitOverride?: boolean;
  /** Display duration in seconds. */
  displayDuration?: number;
  /** Delay before display, in seconds. */
  messageDelaySec?: number;
  /** Message priority. */
  priority?: number;
  /** Background color of the message, as an ARGB hex string. */
  backgroundColor?: string;
  /** Window (scrim) color, as an ARGB hex string. */
  windowColor?: string;
  /** Display-suppression action identifiers, when present. */
  displaySuppressionAction?: string[];
  /** Start of the message validity window, epoch milliseconds. */
  startDateUtc?: number;
  /** End of the message validity window, epoch milliseconds. */
  endDateUtc?: number;
  /** Last modification time, epoch milliseconds. */
  modifiedDateUtc?: number;
  [key: string]: unknown;
}

/**
 * The reason an in-app message was dismissed, normalized to a shared union
 * across platforms.
 * - `AUTO` — auto-dismissed (e.g. after a timeout)
 * - `BUTTON` — the user tapped a message button
 * - `CLOSED` — the user closed the message (e.g. via the close control)
 * - `UNKNOWN` — the reason could not be determined (Android may report this)
 */
export type IamDismissReason = "AUTO" | "BUTTON" | "CLOSED" | "UNKNOWN";

/**
 * Describes how an in-app message was closed.
 * Mirrors Android's `InAppMessageCloseAction` and iOS's equivalent.
 */
export interface InAppMessageCloseAction {
  /** The dismiss reason, normalized across platforms. */
  type?: IamDismissReason;
  /** The identifier of the button that closed the message, when applicable. */
  buttonId?: string;
}

/**
 * Decides, per message, whether the SDK should display an in-app message —
 * giving the app the final say over the native `shouldShowMessage`/`shouldShow`
 * gate. Receives the full {@link InAppMessage} so the decision can be based on
 * more than the id. Return (or resolve) `true` to display, `false` to suppress.
 * See {@link IamModule.setInAppMessageDecisionHandler}.
 */
export type InAppMessageDecisionHandler = (
  message: InAppMessage,
) => boolean | Promise<boolean>;

/**
 * Event names emitted through the {@link IamModule.getEmitter} event emitter.
 */
export const IamEvent = {
  /**
   * Emitted before a message is displayed, carrying the {@link InAppMessage}.
   * This event is observational; to gate whether a message displays, register a
   * handler via {@link IamModule.setInAppMessageDecisionHandler}.
   */
  WillShowMessage: "sfmc_iam_will_show",
  /** Emitted when a message is first shown on screen. */
  DidShowMessage: "sfmc_iam_did_show",
  /** Emitted when a message is dismissed. */
  DidCloseMessage: "sfmc_iam_did_close",
} as const;

export type IamEventName = (typeof IamEvent)[keyof typeof IamEvent];

/**
 * @class IamApi
 */
export interface IamApi {
  /**
   * Displays a specific in-app message by its identifier.
   * @param  {string} messageId - The identifier of the in-app message to display.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/inappmessagingfeaturemodule/com.salesforce.marketingcloud.inappmessagingfeature/-in-app-message-manager/show-message.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/InAppMessagingFeatureSdk/1.0/Classes/InAppMessagingFeature.html#/c:@CM@InAppMessagingFeatureSDK@objc(cs)SFInAppMessagingFeature(im)showInAppMessageWithMessageId: |iOS Docs}
   */
  showInAppMessage(messageId: string): void;

  /**
   * Sets the font used to render in-app message content.
   * @param {string} name - The PostScript / font family name. On iOS this maps
   *     to `setInAppMessageFont(name:)`; on Android the name is resolved to a
   *     `Typeface`.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/inappmessagingfeaturemodule/com.salesforce.marketingcloud.inappmessagingfeature/-in-app-message-manager/set-typeface.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/InAppMessagingFeatureSdk/1.0/Classes/InAppMessagingFeature.html#/c:@CM@InAppMessagingFeatureSDK@objc(cs)SFInAppMessagingFeature(im)setInAppMessageFontWithName: |iOS Docs}
   */
  setFont(name: string): void;

  /**
   * Sets the status bar color of the in-app message activity.
   *
   * **Android only** — no-op on iOS, which has no equivalent native API.
   * @param {number} color - An ARGB color int (e.g. `0xFF0000FF`).
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/inappmessagingfeaturemodule/com.salesforce.marketingcloud.inappmessagingfeature/-in-app-message-manager/set-status-bar-color.html |Android Docs}
   */
  setStatusBarColor(color: number): void;
}
