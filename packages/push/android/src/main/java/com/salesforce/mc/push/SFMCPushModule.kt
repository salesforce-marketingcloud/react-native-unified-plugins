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
package com.salesforce.mc.push

import android.util.Log
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

    companion object {
        const val NAME = "SFMCPushModule"
        private const val TAG = "SFMCPushModule"
    }

    private fun sendEvent(name: String, params: com.facebook.react.bridge.WritableMap) {
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
    override fun getPushToken(promise: Promise) {
        PushFeature.requestSdk { promise.resolve(it.getPushMessageManager().getPushToken()) }
    }

    @ReactMethod
    override fun isPushEnabled(promise: Promise) {
        PushFeature.requestSdk { promise.resolve(it.getPushMessageManager().isPushEnabled()) }
    }

    @ReactMethod
    override fun setURLHandlingEnabled(enabled: Boolean) {
        // iOS-only API. Android has no URL handling delegate — no-op for parity.
    }

    @ReactMethod
    override fun addListener(eventName: String) {}

    @ReactMethod
    override fun removeListeners(count: Double) {}
}
