package com.salesforce.mc.push

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
// CORRECT import — Kotlin package is pushfeature, NOT pushfeaturemodule
import com.salesforce.marketingcloud.pushfeature.PushFeature

@ReactModule(name = SFMCPushModule.NAME)
class SFMCPushModule(reactContext: ReactApplicationContext) :
    NativeSFMCPushModuleSpec(reactContext) {

    companion object { const val NAME = "SFMCPushModule" }

    private fun sendEvent(name: String, params: com.facebook.react.bridge.WritableMap) {
        if (reactApplicationContext.hasActiveReactInstance()) {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(name, params)
        }
    }

    @ReactMethod
    override fun requestPushSdk(promise: Promise) {
        PushFeature.requestSdk { push ->
            push.getPushMessageManager().registerTokenRefreshListener { token ->
                sendEvent("sfmc_push_token_refreshed", Arguments.createMap().apply {
                    putString("token", token)
                })
            }
            promise.resolve(null)
        }
    }

    @ReactMethod
    override fun enablePush() {
        PushFeature.requestSdk { it.getPushMessageManager().enablePush() }
    }

    @ReactMethod
    override fun disablePush() {
        PushFeature.requestSdk { it.getPushMessageManager().disablePush() }
    }

    @ReactMethod
    override fun setPushEnabled(enabled: Boolean) {
        PushFeature.requestSdk {
            if (enabled) it.getPushMessageManager().enablePush()
            else it.getPushMessageManager().disablePush()
        }
    }

    @ReactMethod
    override fun getSystemToken(promise: Promise) {
        PushFeature.requestSdk { promise.resolve(it.getPushMessageManager().getPushToken()) }
    }

    @ReactMethod
    override fun isPushEnabled(promise: Promise) {
        PushFeature.requestSdk { promise.resolve(it.getPushMessageManager().isPushEnabled()) }
    }

    @ReactMethod
    override fun addListener(eventName: String) {}

    @ReactMethod
    override fun removeListeners(count: Double) {}
}
