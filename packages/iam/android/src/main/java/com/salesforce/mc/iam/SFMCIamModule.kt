package com.salesforce.mc.iam

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
// CORRECT imports — InAppMessage (data model) is in .inappmessaging.models.
// InAppMessageCloseAction is colocated with InAppMessagingFeature in the
// feature package, NOT the models package. InAppMessageManager is in the
// feature package (needed for EventListener).
import com.salesforce.marketingcloud.inappmessagingfeature.InAppMessagingFeature
import com.salesforce.marketingcloud.inappmessagingfeature.InAppMessageCloseAction
import com.salesforce.marketingcloud.inappmessagingfeature.InAppMessageManager
import com.salesforce.marketingcloud.inappmessaging.models.InAppMessage

@ReactModule(name = SFMCIamModule.NAME)
class SFMCIamModule(reactContext: ReactApplicationContext) :
    NativeSFMCIamModuleSpec(reactContext) {

    companion object { const val NAME = "SFMCIamModule" }

    private fun sendEvent(name: String, params: WritableMap) {
        if (reactApplicationContext.hasActiveReactInstance()) {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(name, params)
        }
    }

    @ReactMethod
    override fun requestIamSdk(promise: Promise) {
        InAppMessagingFeature.requestSdk { iam ->
            // NOTE: use explicit getter getInAppMessageManager() — not property access iam.inAppMessageManager.
            // The IAM feature module is Java-source with `get`-prefixed accessors; only the unified SFMCSdk
            // core exposes true Kotlin properties (sdk.identity).
            iam.getInAppMessageManager().setInAppMessageListener(object : InAppMessageManager.EventListener {
                override fun shouldShowMessage(message: InAppMessage): Boolean {
                    sendEvent("sfmc_iam_will_show", Arguments.createMap().apply {
                        putString("id", message.id)
                    })
                    return true
                }

                override fun didShowMessage(message: InAppMessage) {
                    sendEvent("sfmc_iam_did_show", Arguments.createMap().apply {
                        putString("id", message.id)
                    })
                }

                // didCloseMessage takes TWO arguments (message + closeAction), not one.
                // closeAction.id is nullable — use ?.let to avoid NullPointerException.
                override fun didCloseMessage(message: InAppMessage, closeAction: InAppMessageCloseAction) {
                    sendEvent("sfmc_iam_did_close", Arguments.createMap().apply {
                        putString("messageId", message.id)
                        putString("actionType", closeAction.actionType.toString())
                        closeAction.id?.let { putString("id", it) }
                    })
                }
            })
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
    override fun addListener(eventName: String) {
        // Required for RN event emitter
    }

    @ReactMethod
    override fun removeListeners(count: Double) {
        // Required for RN event emitter
    }
}
