/*
  Copyright 2026 Salesforce, Inc
  <p>
  Redistribution and use in source and binary forms, with or without modification, are permitted
  provided that the following conditions are met:
  <p>
  1. Redistributions of source code must retain the above copyright notice, this list of
  conditions and the following disclaimer.
  <p>
  2. Redistributions in binary form must reproduce the above copyright notice, this list of
  conditions and the following disclaimer in the documentation and/or other materials provided
  with the distribution.
  <p>
  3. Neither the name of the copyright holder nor the names of its contributors may be used to
  endorse or promote products derived from this software without specific prior written permission.
  <p>
  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR
  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
  FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
  DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
  ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package com.salesforce.mc.iam

import android.graphics.Typeface
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.salesforce.marketingcloud.inappmessagingfeature.InAppMessage
import com.salesforce.marketingcloud.inappmessagingfeature.InAppMessageCloseAction
import com.salesforce.marketingcloud.inappmessagingfeature.InAppMessageManager
import com.salesforce.marketingcloud.inappmessagingfeature.InAppMessagingFeature
import java.lang.ref.WeakReference

@ReactModule(name = SFMCIamModule.NAME)
class SFMCIamModule(reactContext: ReactApplicationContext) :
    NativeSFMCIamModuleSpec(reactContext) {

    companion object {
        const val NAME = "SFMCIamModule"
        private const val TAG = "SFMCIamModule"

        private const val EVENT_WILL_SHOW = "sfmc_iam_will_show"
        private const val EVENT_DID_SHOW = "sfmc_iam_did_show"
        private const val EVENT_DID_CLOSE = "sfmc_iam_did_close"
        // Emitted (decision mode only) to ask JS whether a message should
        // display. JS replies via resolveInAppMessageDecision().
        private const val EVENT_DECISION_REQUEST = "sfmc_iam_decision_request"
    }

    // ── State ───────────────────────────────────────────────────────────────────

    // Defer-then-reshow decision mode (mirrors the Flutter plugin). When JS
    // registers a decision handler, shouldShowMessage() defers to JS. Since the
    // listener callback is
    // synchronous and JS replies asynchronously, we defer: return false now,
    // emit a decision-request event, and re-show via showMessage() if JS
    // approves. approvedIds records ids approved for exactly one re-show so the
    // re-show pass returns true once and does not loop.
    //
    // @Volatile for decisionEnabled and a synchronized set for approvedIds: both
    // are read on the SDK thread (shouldShowMessage) and written on the bridge
    // thread (setDecisionHandlerEnabled / resolveInAppMessageDecision).
    @Volatile
    private var decisionEnabled: Boolean = false
    private val approvedIds = java.util.Collections.synchronizedSet(HashSet<String>())

    private var eventListener: InAppMessageManager.EventListener? = null

    // Count of JS listeners currently attached. The native SDK listener stays
    // registered for the whole session, but JS subscriptions come and go (e.g. a
    // screen unmounts). Emitting with no listeners logs a warning, so sendEvent()
    // gates on this. AtomicInteger because addListener/removeListeners run on the
    // bridge thread while the SDK fires callbacks on its own thread.
    private val listenerCount = java.util.concurrent.atomic.AtomicInteger(0)

    // RN event-emitter listener accounting (the TS spec declares these).
    @ReactMethod
    override fun addListener(eventName: String) {
        listenerCount.incrementAndGet()
    }

    @ReactMethod
    override fun removeListeners(count: Double) {
        // Never drop below zero, even on unexpected over-removal.
        listenerCount.updateAndGet { current -> maxOf(0, current - count.toInt()) }
    }

    // ── Exported JS methods ───────────────────────────────────────────────────────

    @ReactMethod
    override fun requestIamSdk(promise: Promise) {
        InAppMessagingFeature.requestSdk { iam ->
            // Register the lifecycle listener once the module is ready so the
            // shouldShow/didShow/didClose events flow for the whole session
            // (mirrors the Flutter plugin). JS gates emission via its listener
            // count, so there is no separate enable toggle.
            //
            // WeakIamListener does not capture `this`, so the module +
            // ReactApplicationContext can still be GC'd if cleanup is skipped
            // (process death, framework bug).
            if (eventListener == null) {
                val listener = WeakIamListener(this)
                eventListener = listener
                iam.getInAppMessageManager().setInAppMessageListener(listener)
            }
            promise.resolve(null)
        }
    }

    @ReactMethod
    override fun showInAppMessage(messageId: String) {
        InAppMessagingFeature.requestSdk { iam ->
            iam.getInAppMessageManager().showMessage(messageId)
        }
    }

    @ReactMethod
    override fun setFont(name: String) {
        InAppMessagingFeature.requestSdk { iam ->
            // create() falls back to the default family if the name is unknown,
            // so this never throws for a bad font name.
            iam.getInAppMessageManager().setTypeface(Typeface.create(name, Typeface.NORMAL))
        }
    }

    @ReactMethod
    override fun setStatusBarColor(color: Double) {
        // RN bridges JS numbers as Double; the SDK expects an ARGB color int.
        val colorInt = color.toLong().toInt()
        InAppMessagingFeature.requestSdk { iam ->
            iam.getInAppMessageManager().setStatusBarColor(colorInt)
        }
    }

    // Enable/disable the per-message JS decision handler. When enabled,
    // shouldShowMessage() defers to JS. Disabling clears any pending one-shot
    // approvals so a later re-enable starts clean.
    @ReactMethod
    override fun setDecisionHandlerEnabled(enabled: Boolean) {
        decisionEnabled = enabled
        if (!enabled) approvedIds.clear()
    }

    // JS's reply to an EVENT_DECISION_REQUEST. On approval, mark the id for a
    // single re-show and ask the SDK to present it again; the next
    // shouldShowMessage() pass for that id returns true once. On rejection there
    // is nothing to do — the message was already suppressed when
    // shouldShowMessage() returned false.
    @ReactMethod
    override fun resolveInAppMessageDecision(messageId: String, show: Boolean) {
        if (!show) return
        approvedIds.add(messageId)
        InAppMessagingFeature.requestSdk { iam ->
            iam.getInAppMessageManager().showMessage(messageId)
        }
    }

    // ── Lifecycle callbacks (invoked on the SDK thread) ─────────────────────────

    internal fun onShouldShowMessage(message: InAppMessage): Boolean {
        // Re-show pass for a message JS already approved: allow it through once,
        // skipping the observational will-show event (it already fired on the
        // first pass).
        if (decisionEnabled) {
            if (approvedIds.remove(message.id)) return true
            // First pass: defer to JS.
            sendEvent(EVENT_WILL_SHOW, messageToWritableMap(message))
            sendEvent(EVENT_DECISION_REQUEST, messageToWritableMap(message))
            return false
        }
        // No decision handler registered: emit the observational will-show event
        // and let the SDK display the message (default behavior).
        sendEvent(EVENT_WILL_SHOW, messageToWritableMap(message))
        return true
    }

    internal fun onDidShowMessage(message: InAppMessage) {
        sendEvent(EVENT_DID_SHOW, messageToWritableMap(message))
    }

    internal fun onDidCloseMessage(message: InAppMessage, action: InAppMessageCloseAction) {
        val params = messageToWritableMap(message)
        params.putMap("action", closeActionToWritableMap(action))
        sendEvent(EVENT_DID_CLOSE, params)
    }

    // ── Event emission ──────────────────────────────────────────────────────────

    private fun sendEvent(name: String, params: WritableMap) {
        // Skip emission when JS has no listeners (avoids the
        // "Sending `<event>` with no listeners registered" warning).
        if (listenerCount.get() <= 0) return
        if (!reactApplicationContext.hasActiveReactInstance()) return
        try {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(name, params)
        } catch (t: Throwable) {
            // Bridge can be torn down between the active-instance check and emit,
            // or getJSModule may fail if the catalyst instance is unavailable.
            Log.w(TAG, "Failed to emit event '$name'", t)
        }
    }

    // ── Serialization ─────────────────────────────────────────────────────────────

    private fun messageToWritableMap(message: InAppMessage): WritableMap {
        // Surface the JSON-safe scalar fields, kept in sync with the iOS
        // serializer so both platforms emit the same shape. `type`/`source` are
        // normalized to their enum names (matching iOS). The nested object graph
        // (title/body/media/buttons/styling) is intentionally skipped.
        val map = Arguments.createMap()
        map.putString("id", message.id)
        map.putString("type", message.type.name)
        map.putString("source", message.source.name)
        map.putInt("displayCount", message.displayCount)
        map.putInt("displayLimit", message.displayLimit)
        // iOS calls this `displayLimitOverride`; Android's equivalent field is
        // `appLimitOverride`. Emit under the iOS name for a shared JS contract.
        map.putBoolean("displayLimitOverride", message.appLimitOverride)
        // displayDuration is a Long; bridge as Double (RN has no 64-bit int).
        map.putDouble("displayDuration", message.displayDuration.toDouble())
        map.putInt("messageDelaySec", message.messageDelaySec)
        map.putInt("priority", message.priority)
        message.windowColor?.let { map.putString("windowColor", it) }
        message.backgroundColor?.let { map.putString("backgroundColor", it) }
        message.displaySuppressionAction?.let {
            map.putArray("displaySuppressionAction", Arguments.fromList(it))
        }
        // Dates → epoch milliseconds (JSON-safe, locale-independent).
        message.startDateUtc?.let { map.putDouble("startDateUtc", it.time.toDouble()) }
        message.endDateUtc?.let { map.putDouble("endDateUtc", it.time.toDouble()) }
        message.modifiedDateUtc?.let { map.putDouble("modifiedDateUtc", it.time.toDouble()) }
        return map
    }

    private fun closeActionToWritableMap(action: InAppMessageCloseAction): WritableMap {
        val map = Arguments.createMap()
        // Normalized union shared with iOS: AUTO | BUTTON | CLOSED | UNKNOWN.
        // Mapped explicitly (rather than passing the enum's `name` verbatim) so a
        // future rename of an SDK enum constant can't silently change the contract
        // JS depends on. The `when` is exhaustive with no `else`, so adding a new
        // SDK constant becomes a compile error here — a deliberate decision point.
        val type = when (action.actionType) {
            InAppMessageCloseAction.InAppMessageDismissReason.AUTO -> "AUTO"
            InAppMessageCloseAction.InAppMessageDismissReason.BUTTON -> "BUTTON"
            InAppMessageCloseAction.InAppMessageDismissReason.CLOSED -> "CLOSED"
            InAppMessageCloseAction.InAppMessageDismissReason.UNKNOWN -> "UNKNOWN"
        }
        map.putString("type", type)
        action.id?.let { map.putString("buttonId", it) }
        return map
    }

    // ── Teardown ──────────────────────────────────────────────────────────────────

    override fun invalidate() {
        // Best-effort cleanup if the bridge tears down. The IAM feature is
        // Application-scoped and outlives the bridge, so the requestSdk callback
        // is safe to fire and forget.
        if (eventListener != null) {
            InAppMessagingFeature.requestSdk { iam ->
                iam.getInAppMessageManager().setInAppMessageListener(null)
            }
            eventListener = null
        }
        super.invalidate()
    }

    // ── Helper types ──────────────────────────────────────────────────────────────

    private class WeakIamListener(
        module: SFMCIamModule,
    ) : InAppMessageManager.EventListener {
        private val ref = WeakReference(module)

        override fun shouldShowMessage(message: InAppMessage): Boolean =
            ref.get()?.onShouldShowMessage(message) ?: true

        override fun didShowMessage(message: InAppMessage) {
            ref.get()?.onDidShowMessage(message)
        }

        override fun didCloseMessage(message: InAppMessage, action: InAppMessageCloseAction) {
            ref.get()?.onDidCloseMessage(message, action)
        }
    }
}
