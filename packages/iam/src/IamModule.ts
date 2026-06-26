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
 * @class IamModule
 */

import { NativeEventEmitter } from "react-native";
import type { EmitterSubscription } from "react-native";
import NativeModule from "./NativeSFMCIamModule";
import type {
  IamApi,
  InAppMessage,
  InAppMessageDecisionHandler,
} from "./types";

// Internal event the native module emits (decision mode only) to ask JS whether
// a message should display. Not part of the public IamEvent set — it is an
// implementation detail of setInAppMessageDecisionHandler.
const DECISION_REQUEST_EVENT = "sfmc_iam_decision_request";

let _api: IamApi | null = null;
let _emitter: NativeEventEmitter | null = null;

let _decisionHandler: InAppMessageDecisionHandler | null = null;
let _decisionSub: EmitterSubscription | null = null;

export const IamModule = {
  async requestSdk(): Promise<IamApi> {
    if (_api) return _api;
    await NativeModule.requestIamSdk();
    _api = {
      showInAppMessage: (messageId: string) =>
        NativeModule.showInAppMessage(messageId),
      setFont: (name: string) => NativeModule.setFont(name),
      setStatusBarColor: (color: number) =>
        NativeModule.setStatusBarColor(color),
    };
    return _api;
  },

  getEmitter(): NativeEventEmitter {
    if (!_emitter) _emitter = new NativeEventEmitter(NativeModule);
    return _emitter;
  },

  /**
   * Registers a handler that decides, per message, whether the SDK should
   * display an in-app message — giving the app the final say over the native
   * `shouldShowMessage`/`shouldShow` gate.
   *
   * The native gate is synchronous and cannot block on an async JS reply, so
   * this uses a defer-then-reshow model: when a handler is registered the SDK
   * is told *not* to show the message immediately; instead {@link handler} is
   * invoked with the full message, and if it resolves `true` the message is
   * re-displayed via the same path as {@link IamApi.showInAppMessage}. The
   * visible effect is that an approved message appears a few milliseconds later
   * than it would natively.
   *
   * Pass `null` to clear the handler and restore default SDK behavior (every
   * message displays). Requires the SDK to have been requested via
   * {@link IamModule.requestSdk}.
   *
   * @param {InAppMessageDecisionHandler | null} handler - The per-message
   *     decision callback, or `null` to clear it.
   */
  setInAppMessageDecisionHandler(
    handler: InAppMessageDecisionHandler | null,
  ): void {
    _decisionHandler = handler;

    if (handler) {
      // Subscribe once; the listener reads the latest _decisionHandler so a
      // handler swap does not need to re-subscribe.
      if (!_decisionSub) {
        _decisionSub = this.getEmitter().addListener(
          DECISION_REQUEST_EVENT,
          (message: InAppMessage) => {
            const current = _decisionHandler;
            // Default to suppressing if the handler was cleared between the
            // native emit and this callback.
            Promise.resolve(current ? current(message) : false)
              .then((show) =>
                NativeModule.resolveInAppMessageDecision(message.id, !!show),
              )
              .catch(() =>
                // A throwing handler suppresses the message (fail closed).
                NativeModule.resolveInAppMessageDecision(message.id, false),
              );
          },
        );
      }
      NativeModule.setDecisionHandlerEnabled(true);
    } else {
      NativeModule.setDecisionHandlerEnabled(false);
      _decisionSub?.remove();
      _decisionSub = null;
    }
  },
};
