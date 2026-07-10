// SFMCIamSerializer.swift
//
// Copyright (c) 2026 Salesforce, Inc
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// Redistributions of source code must retain the above copyright notice, this
// list of conditions and the following disclaimer. Redistributions in binary
// form must reproduce the above copyright notice, this list of conditions and
// the following disclaimer in the documentation and/or other materials
// provided with the distribution. Neither the name of the copyright holder nor
// the names of its contributors may be used to endorse or promote products
// derived from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.

import Foundation
import SFMCSDK

/// Bridges the SFMC in-app message types into JSON-safe dictionaries for the JS
/// layer.
///
/// The `.mm` module could read most of `InAppMessageDetails` via KVC (the
/// protocol is `@objc`), but two things make a Swift shim the better home for
/// this: `InAppMessageCloseAction` exposes its data only through plain Swift
/// (non-`@objc`) accessors that KVC can't reach, and `type` is an `Int`-backed
/// enum that KVC would surface as an opaque number rather than the string name
/// the JS contract (and Android) use. Doing it in Swift lets us call the typed
/// API directly and normalize once.
@objc(SFMCIamSerializer)
public final class SFMCIamSerializer: NSObject {

    /// Serializes the JSON-safe scalar fields of an in-app message into a
    /// dictionary the Objective-C++ module can forward as-is.
    ///
    /// `id` is always present; `type` is normalized to its string name (shared
    /// with Android, e.g. `"modal"`). The nested content fields
    /// (title/body/media/buttons) use the same keys and shapes as Android so the
    /// JS contract is identical on both platforms; each is included only when
    /// the SDK supplied it.
    @objc(serializeMessage:)
    public static func serialize(_ message: InAppMessageDetails) -> [String: Any] {
        var map: [String: Any] = [:]

        map["id"] = message.id
        map["type"] = typeName(message.type)
        map["displayCount"] = message.displayCount
        map["displayLimit"] = message.displayLimit
        map["displayLimitOverride"] = message.displayLimitOverride
        map["displayDuration"] = message.displayDuration
        map["messageDelaySec"] = message.messageDelaySec
        map["priority"] = message.priority

        if let source = message.source {
            map["source"] = source
        }
        if let title = message.title?.text {
            map["title"] = title
        }
        if let body = message.body?.text {
            map["body"] = body
        }
        if let media = serializeMedia(message.media) {
            map["media"] = media
        }
        if let buttons = message.buttons, !buttons.isEmpty {
            map["buttons"] = buttons.map(serializeButton)
        }
        if let backgroundColor = message.backgroundColor {
            map["backgroundColor"] = backgroundColor
        }
        if let windowColor = message.windowColor {
            map["windowColor"] = windowColor
        }
        if let suppression = message.displaySuppressionAction {
            map["displaySuppressionAction"] = suppression
        }

        // Dates → epoch milliseconds (JSON-safe, locale-independent).
        if let start = message.startDateUtc {
            map["startDateUtc"] = epochMillis(start)
        }
        if let end = message.endDateUtc {
            map["endDateUtc"] = epochMillis(end)
        }
        if let modified = message.modifiedDateUtc {
            map["modifiedDateUtc"] = epochMillis(modified)
        }

        return map
    }

    /// Serializes a close action into `{ type, buttonId? }`.
    ///
    /// `type` is normalized to the union shared with Android
    /// (`AUTO | BUTTON | CLOSED | UNKNOWN`); `buttonId` is included only when the
    /// SDK reports one.
    @objc(serializeCloseAction:)
    public static func serialize(_ action: InAppMessageCloseAction) -> [String: Any] {
        var map: [String: Any] = [:]

        switch action.getDismissReason() {
        case .auto: map["type"] = "AUTO"
        case .button: map["type"] = "BUTTON"
        case .closed: map["type"] = "CLOSED"
        @unknown default: map["type"] = "UNKNOWN"
        }

        if let buttonId = action.getId() {
            map["buttonId"] = buttonId
        }

        return map
    }

    // MARK: - Helpers

    /// Serializes a message's media into `{ url?, altText?, aspectRatio? }`,
    /// matching the Android shape. Returns `nil` when there is no media or no
    /// populated field, so the key is omitted entirely.
    private static func serializeMedia(_ media: InAppMessageMedia?) -> [String: Any]? {
        guard let media = media else { return nil }
        var map: [String: Any] = [:]
        if let url = media.url {
            map["url"] = url
        }
        if let altText = media.altText {
            map["altText"] = altText
        }
        if let aspectRatio = media.aspectRatio {
            map["aspectRatio"] = aspectRatio
        }
        return map.isEmpty ? nil : map
    }

    /// Serializes a single button into
    /// `{ id?, index?, text?, action?, backgroundColor? }`, matching the Android
    /// shape.
    private static func serializeButton(_ button: InAppMessageButton) -> [String: Any] {
        var map: [String: Any] = [:]
        if let id = button.id {
            map["id"] = id
        }
        map["index"] = button.index
        if let text = button.text {
            map["text"] = text
        }
        if let action = button.action {
            map["action"] = action
        }
        if let backgroundColor = button.backgroundColor {
            map["backgroundColor"] = backgroundColor
        }
        return map
    }

    /// Maps the `Int`-backed `InAppMessageType` to its string name, matching the
    /// Android `InAppMessage.Type` enum names so the JS contract is identical on
    /// both platforms.
    private static func typeName(_ type: InAppMessageType) -> String {
        switch type {
        case .bannerTop: return "bannerTop"
        case .bannerBottom: return "bannerBottom"
        case .fullImageFill: return "fullImageFill"
        case .full: return "full"
        case .modal: return "modal"
        case .pushPrimer: return "pushPrimer"
        case .unknown: return "unknown"
        @unknown default: return "unknown"
        }
    }

    private static func epochMillis(_ date: Date) -> Int64 {
        Int64(date.timeIntervalSince1970 * 1000.0)
    }
}
