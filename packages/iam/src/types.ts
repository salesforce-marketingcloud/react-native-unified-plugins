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
  | 'bannerTop'
  | 'bannerBottom'
  | 'fullImageFill'
  | 'full'
  | 'modal'
  | 'pushPrimer'
  | 'unknown';

/**
 * A serialized in-app message delivered with lifecycle events.
 *
 * Only `id` is guaranteed; every other field is best-effort and present only
 * when the native SDK supplied it. The JSON-safe scalar fields below are
 * serialized on both Android and iOS with matching shapes; the nested object
 * graph (title/body/media/buttons/styling) is intentionally not serialized.
 */
export interface InAppMessage {
  /** The unique identifier of the in-app message. Always present. */
  id: string;
  /** Message layout/template type, by its shared enum name. */
  type?: IamMessageType;
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
export type IamDismissReason = 'AUTO' | 'BUTTON' | 'CLOSED' | 'UNKNOWN';

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
 * Payload for the {@link IamEvent.UrlActionSelected} event (iOS only).
 * Mirrors the `sfmc_handleURL(_:type:)` URL handling delegate.
 */
export interface IamUrlAction {
  /** The URL associated with the selected action. */
  url: string;
  /** The action type reported by the SDK. */
  type: string;
}

/**
 * A data-driven rule set evaluated natively, per message, inside the
 * synchronous `shouldShowMessage` gate to decide whether each message displays.
 *
 * The native `shouldShowMessage` callback must return a boolean immediately and
 * cannot make an async round trip to JS, so the decision is expressed as data
 * here and applied to each incoming message's fields by the native module.
 */
export interface IamMessageFilter {
  /**
   * Message IDs that must never display. If the incoming message's `id` is in
   * this list, the gate returns `false`. Takes precedence over `allowedIds`.
   */
  blockedIds?: string[];
  /**
   * When provided, only messages whose `id` is in this list may display; any
   * other message is suppressed. Omit (or leave empty) to allow all IDs that
   * are not blocked.
   */
  allowedIds?: string[];
  /**
   * The decision applied when no rule above matches a message.
   * Defaults to `true` (show). Set to `false` to suppress everything by default
   * and opt messages in via `allowedIds`.
   */
  defaultShow?: boolean;
}

/**
 * Event names emitted through the {@link IamModule.getEmitter} event emitter.
 */
export const IamEvent = {
  /**
   * Emitted before a message is displayed, carrying the {@link InAppMessage}.
   * The show/suppress decision itself is made natively via the rules set with
   * {@link IamApi.setMessageFilter}; this event is observational.
   */
  WillShowMessage: 'sfmc_iam_will_show',
  /** Emitted when a message is first shown on screen. */
  DidShowMessage: 'sfmc_iam_did_show',
  /** Emitted when a message is dismissed. */
  DidCloseMessage: 'sfmc_iam_did_close',
  /**
   * iOS only — emitted with an {@link IamUrlAction} when the user selects a URL
   * action in a message and URL handling has been routed to JS via
   * {@link IamApi.setURLHandlingEnabled}.
   */
  UrlActionSelected: 'sfmc_iam_url_action',
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
   * Enables or disables delivery of in-app message lifecycle events
   * ({@link IamEvent.WillShowMessage}, {@link IamEvent.DidShowMessage},
   * {@link IamEvent.DidCloseMessage}) to the JS event emitter. When enabled, the
   * native lifecycle listener/delegate is registered; when disabled, it is
   * removed. Defaults to disabled — call this with `true` before subscribing via
   * {@link IamModule.getEmitter}.
   * @param {boolean} enabled - `true` to receive lifecycle events, `false` to stop.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/inappmessagingfeaturemodule/com.salesforce.marketingcloud.inappmessagingfeature/-in-app-message-manager/set-in-app-message-listener.html |Android Docs}
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/InAppMessagingFeatureSdk/1.0/Classes/InAppMessagingFeature.html#/c:@CM@InAppMessagingFeatureSDK@objc(cs)SFInAppMessagingFeature(im)setEventDelegate: |iOS Docs}
   */
  setEventDelegateEnabled(enabled: boolean): void;

  /**
   * Sets the data-driven rules used by the native `shouldShowMessage` gate to
   * decide, per message, whether each in-app message displays. The native
   * module reads each incoming message's `id` and evaluates it against the
   * filter synchronously: blocked IDs are always suppressed, an `allowedIds`
   * list (when present) restricts display to those IDs, and anything not
   * matched falls back to `defaultShow`.
   *
   * Pass an empty object (or `{ defaultShow: true }`) to allow all messages.
   * Requires {@link IamApi.setEventDelegateEnabled} to be enabled so the native
   * listener is registered.
   * @param {IamMessageFilter} filter - The per-message rule set.
   */
  setMessageFilter(filter: IamMessageFilter): void;

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

  /**
   * Routes URL actions from in-app message buttons to JS via the
   * {@link IamEvent.UrlActionSelected} event instead of letting the SDK open
   * them directly.
   *
   * **iOS only** — no-op on Android, which has no URL handling delegate.
   * @param {boolean} enabled - `true` to route URL actions to JS.
   * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/InAppMessagingFeatureSdk/1.0/Classes/InAppMessagingFeature.html#/c:@CM@InAppMessagingFeatureSDK@objc(cs)SFInAppMessagingFeature(im)setURLHandlingDelegate: |iOS Docs}
   */
  setURLHandlingEnabled(enabled: boolean): void;
}
