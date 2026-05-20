package com.salesforce.mc.mobileappmessaging

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
// CORRECT import — Kotlin package is mobileappmessaging, NOT mobileappmessagingsdk
import com.salesforce.marketingcloud.mobileappmessaging.MobileAppMessaging

@ReactModule(name = MAMModule.NAME)
class MAMModule(reactContext: ReactApplicationContext) :
    NativeMAMModuleSpec(reactContext) {

    companion object { const val NAME = "MAMModule" }

    @ReactMethod
    override fun requestMamSdk(promise: Promise) {
        MobileAppMessaging.requestSdk { promise.resolve(null) }
    }

    @ReactMethod
    override fun getDeviceId(promise: Promise) {
        MobileAppMessaging.requestSdk { mam ->
            promise.resolve(mam.getRegistrationManager().getDeviceId())
        }
    }

    @ReactMethod
    override fun enableAnalytics() {
        MobileAppMessaging.requestSdk { it.getAnalyticsManager().enableAnalytics() }
    }

    @ReactMethod
    override fun disableAnalytics() {
        MobileAppMessaging.requestSdk { it.getAnalyticsManager().disableAnalytics() }
    }

    @ReactMethod
    override fun isAnalyticsEnabled(promise: Promise) {
        // CORRECT: MAM analytics manager exposes areAnalyticsEnabled(), NOT isAnalyticsEnabled().
        MobileAppMessaging.requestSdk { promise.resolve(it.getAnalyticsManager().areAnalyticsEnabled()) }
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
