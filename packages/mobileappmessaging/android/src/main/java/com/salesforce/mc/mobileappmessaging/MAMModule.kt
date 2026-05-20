package com.salesforce.mc.mobileappmessaging

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.salesforce.marketingcloud.mobileappmessaging.MobileAppMessaging
import com.salesforce.marketingcloud.mobileappmessaging.registration.RegistrationManager

@ReactModule(name = MAMModule.NAME)
class MAMModule(reactContext: ReactApplicationContext) :
    NativeMAMModuleSpec(reactContext) {

    companion object { const val NAME = "MAMModule" }

    private var registrationListener: RegistrationManager.RegistrationEventListener? = null

    private fun sendEvent(name: String, params: com.facebook.react.bridge.WritableMap) {
        if (reactApplicationContext.hasActiveReactInstance()) {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(name, params)
        }
    }

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
    override fun setRegistrationCallback() {
        MobileAppMessaging.requestSdk { mam ->
            val listener = RegistrationManager.RegistrationEventListener { registration ->
                sendEvent("sfmc_mam_registration", Arguments.makeNativeMap(registration.toMap()))
            }
            registrationListener = listener
            mam.getRegistrationManager().registerForRegistrationEvents(listener)
        }
    }

    @ReactMethod
    override fun unsetRegistrationCallback() {
        MobileAppMessaging.requestSdk { mam ->
            registrationListener?.let {
                mam.getRegistrationManager().unregisterForRegistrationEvents(it)
            }
            registrationListener = null
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
