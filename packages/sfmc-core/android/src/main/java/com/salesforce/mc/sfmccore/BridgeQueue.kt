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
package com.salesforce.mc.sfmccore

import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext

/**
 * Shared helper for hopping work onto the React Native Modules queue.
 *
 * Bridge data structures (WritableMap / WritableArray) and Promise resolution
 * must run on a React-managed thread, not whichever worker thread invoked the
 * native module callback (e.g. SFMCSdk / MarketingCloudSdk / MAM internal
 * executors). Use this helper from any module method that builds bridge
 * payloads inside a SDK callback.
 *
 * Lives in sfmc-core because every product package (marketingcloudsdk, MAM,
 * push, iam) declares a transitive dependency on it.
 */
object BridgeQueue {
    private const val TAG = "BridgeQueue"
    private const val E_BRIDGE_UNAVAILABLE = "E_BRIDGE_UNAVAILABLE"

    /**
     * Promise-aware variant: rejects [promise] if the catalyst instance has
     * already been torn down, so callers don't hang.
     */
    fun runOnNativeModulesQueue(
        reactContext: ReactApplicationContext,
        promise: Promise,
        block: () -> Unit,
    ) {
        if (!reactContext.hasActiveReactInstance()) {
            promise.reject(E_BRIDGE_UNAVAILABLE, "React instance is not active")
            return
        }
        try {
            reactContext.runOnNativeModulesQueueThread {
                try {
                    block()
                } catch (t: Throwable) {
                    Log.w(TAG, "Native modules queue task failed", t)
                    promise.reject(E_BRIDGE_UNAVAILABLE, t)
                }
            }
        } catch (t: Throwable) {
            Log.w(TAG, "Failed to dispatch to native modules queue", t)
            promise.reject(E_BRIDGE_UNAVAILABLE, t)
        }
    }

    /**
     * Fire-and-forget variant for event-emission paths (no Promise to reject).
     * Drops the work if the bridge is gone — events are best-effort.
     */
    fun runOnNativeModulesQueue(
        reactContext: ReactApplicationContext,
        block: () -> Unit,
    ) {
        if (!reactContext.hasActiveReactInstance()) return
        try {
            reactContext.runOnNativeModulesQueueThread {
                try {
                    block()
                } catch (t: Throwable) {
                    Log.w(TAG, "Native modules queue task failed", t)
                }
            }
        } catch (t: Throwable) {
            Log.w(TAG, "Failed to dispatch to native modules queue", t)
        }
    }
}
