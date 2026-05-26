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
package com.salesforce.mc.mobileappmessaging

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.salesforce.marketingcloud.mobileappmessaging.MobileAppMessaging
import com.salesforce.marketingcloud.mobileappmessaging.registration.RegistrationManager
import org.json.JSONArray
import org.json.JSONObject

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
                sendEvent("sfmc_mam_registration", jsonToWritableMap(registration))
            }
            registrationListener = listener
            mam.getRegistrationManager().registerForRegistrationEvents(listener)
        }
    }

    private fun jsonToWritableMap(json: JSONObject): WritableMap {
        val map = Arguments.createMap()
        val keys = json.keys()
        while (keys.hasNext()) {
            val key = keys.next()
            when (val value = json.opt(key)) {
                null, JSONObject.NULL -> map.putNull(key)
                is JSONObject -> map.putMap(key, jsonToWritableMap(value))
                is JSONArray -> map.putArray(key, jsonToWritableArray(value))
                is Boolean -> map.putBoolean(key, value)
                is Int -> map.putInt(key, value)
                is Long -> map.putDouble(key, value.toDouble())
                is Double -> map.putDouble(key, value)
                is String -> map.putString(key, value)
                else -> map.putString(key, value.toString())
            }
        }
        return map
    }

    private fun jsonToWritableArray(json: JSONArray): com.facebook.react.bridge.WritableArray {
        val array = Arguments.createArray()
        for (i in 0 until json.length()) {
            when (val value = json.opt(i)) {
                null, JSONObject.NULL -> array.pushNull()
                is JSONObject -> array.pushMap(jsonToWritableMap(value))
                is JSONArray -> array.pushArray(jsonToWritableArray(value))
                is Boolean -> array.pushBoolean(value)
                is Int -> array.pushInt(value)
                is Long -> array.pushDouble(value.toDouble())
                is Double -> array.pushDouble(value)
                is String -> array.pushString(value)
                else -> array.pushString(value.toString())
            }
        }
        return array
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
