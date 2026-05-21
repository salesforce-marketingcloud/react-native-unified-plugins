package com.salesforce.mc.iam

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.salesforce.marketingcloud.inappmessagingfeature.InAppMessagingFeature

@ReactModule(name = SFMCIamModule.NAME)
class SFMCIamModule(reactContext: ReactApplicationContext) :
    NativeSFMCIamModuleSpec(reactContext) {

    companion object { const val NAME = "SFMCIamModule" }

    @ReactMethod
    override fun requestIamSdk(promise: Promise) {
        InAppMessagingFeature.requestSdk { promise.resolve(null) }
    }

    @ReactMethod
    override fun showInAppMessage(messageId: String) {
        InAppMessagingFeature.requestSdk { iam ->
            iam.getInAppMessageManager().showMessage(messageId)
        }
    }

    @ReactMethod
    override fun addListener(eventName: String) {}

    @ReactMethod
    override fun removeListeners(count: Double) {}
}
