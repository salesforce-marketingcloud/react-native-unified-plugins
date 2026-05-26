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
package com.salesforce.mc.marketingcloudsdk

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.salesforce.marketingcloud.MCLogListener
import com.salesforce.marketingcloud.MarketingCloudSdk
import com.salesforce.marketingcloud.messages.inbox.InboxMessage
import com.salesforce.marketingcloud.messages.inbox.InboxMessageManager
import com.salesforce.marketingcloud.registration.Registration
import com.salesforce.marketingcloud.registration.RegistrationManager
import java.lang.ref.WeakReference

@ReactModule(name = MCModule.NAME)
class MCModule(reactContext: ReactApplicationContext) :
    NativeMCModuleSpec(reactContext) {

    companion object {
        const val NAME = "MCModule"
        private const val TAG = "MCModule"
    }

    private var registrationListener: RegistrationManager.RegistrationEventListener? = null
    private val messageCache = mutableMapOf<String, InboxMessage>()

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
    override fun requestMcSdk(promise: Promise) {
        MarketingCloudSdk.requestSdk { promise.resolve(null) }
    }

    @ReactMethod
    override fun refreshInbox(promise: Promise) {
        MarketingCloudSdk.requestSdk { sdk ->
            sdk.getInboxMessageManager().refreshInbox(object : InboxMessageManager.InboxRefreshListener {
                override fun onRefreshComplete(successful: Boolean) {
                    promise.resolve(successful)
                }
            })
        }
    }

    @ReactMethod
    override fun getAllMessages(promise: Promise) {
        MarketingCloudSdk.requestSdk { sdk ->
            val messages = sdk.getInboxMessageManager().getMessages()
            messageCache.clear()
            messages.forEach { messageCache[it.id] = it }
            promise.resolve(messagesToArray(messages))
        }
    }

    @ReactMethod
    override fun getUnreadMessages(promise: Promise) {
        MarketingCloudSdk.requestSdk { sdk ->
            promise.resolve(messagesToArray(sdk.getInboxMessageManager().getUnreadMessages()))
        }
    }

    @ReactMethod
    override fun getReadMessages(promise: Promise) {
        MarketingCloudSdk.requestSdk { sdk ->
            promise.resolve(messagesToArray(sdk.getInboxMessageManager().getReadMessages()))
        }
    }

    @ReactMethod
    override fun getDeletedMessages(promise: Promise) {
        MarketingCloudSdk.requestSdk { sdk ->
            promise.resolve(messagesToArray(sdk.getInboxMessageManager().getDeletedMessages()))
        }
    }

    @ReactMethod
    override fun getMessageCount(promise: Promise) {
        MarketingCloudSdk.requestSdk { sdk ->
            promise.resolve(sdk.getInboxMessageManager().getMessageCount())
        }
    }

    @ReactMethod
    override fun getUnreadMessageCount(promise: Promise) {
        MarketingCloudSdk.requestSdk { sdk ->
            promise.resolve(sdk.getInboxMessageManager().getUnreadMessageCount())
        }
    }

    @ReactMethod
    override fun getReadMessageCount(promise: Promise) {
        MarketingCloudSdk.requestSdk { sdk ->
            promise.resolve(sdk.getInboxMessageManager().getReadMessageCount())
        }
    }

    @ReactMethod
    override fun getDeletedMessageCount(promise: Promise) {
        MarketingCloudSdk.requestSdk { sdk ->
            promise.resolve(sdk.getInboxMessageManager().getDeletedMessageCount())
        }
    }

    @ReactMethod
    override fun markMessageRead(messageId: String) {
        MarketingCloudSdk.requestSdk { sdk ->
            sdk.getInboxMessageManager().setMessageRead(messageId)
        }
    }

    @ReactMethod
    override fun markMessageDeleted(messageId: String) {
        MarketingCloudSdk.requestSdk { sdk ->
            sdk.getInboxMessageManager().deleteMessage(messageId)
        }
    }

    @ReactMethod
    override fun markAllMessagesRead() {
        MarketingCloudSdk.requestSdk { sdk ->
            sdk.getInboxMessageManager().markAllMessagesRead()
        }
    }

    @ReactMethod
    override fun markAllMessagesDeleted() {
        MarketingCloudSdk.requestSdk { sdk ->
            sdk.getInboxMessageManager().markAllMessagesDeleted()
        }
    }

    @ReactMethod
    override fun trackInboxMessageOpened(message: ReadableMap) {
        val messageId = message.getString("id") ?: return
        MarketingCloudSdk.requestSdk { sdk ->
            val inboxMessage = messageCache[messageId]
            if (inboxMessage != null) {
                sdk.getAnalyticsManager().trackInboxOpenEvent(inboxMessage)
            }
        }
    }

    @ReactMethod
    override fun addTag(tag: String) {
        MarketingCloudSdk.requestSdk { it.getRegistrationManager().edit().addTag(tag).commit() }
    }

    @ReactMethod
    override fun addTags(tags: ReadableArray) {
        val tagSet = (0 until tags.size()).mapNotNullTo(mutableSetOf()) { tags.getString(it) }
        MarketingCloudSdk.requestSdk { it.getRegistrationManager().edit().addTags(tagSet).commit() }
    }

    @ReactMethod
    override fun removeTag(tag: String) {
        MarketingCloudSdk.requestSdk { it.getRegistrationManager().edit().removeTag(tag).commit() }
    }

    @ReactMethod
    override fun removeTags(tags: ReadableArray) {
        val tagSet = (0 until tags.size()).mapNotNullTo(mutableSetOf()) { tags.getString(it) }
        MarketingCloudSdk.requestSdk { it.getRegistrationManager().edit().removeTags(tagSet).commit() }
    }

    @ReactMethod
    override fun getTags(promise: Promise) {
        MarketingCloudSdk.requestSdk { sdk ->
            val arr = Arguments.createArray()
            sdk.getRegistrationManager().getTags().forEach { arr.pushString(it) }
            promise.resolve(arr)
        }
    }

    @ReactMethod
    override fun getAttributes(promise: Promise) {
        MarketingCloudSdk.requestSdk { sdk ->
            val map = Arguments.createMap()
            sdk.getRegistrationManager().getAttributes().forEach { (k, v) -> map.putString(k, v) }
            promise.resolve(map)
        }
    }

    // Analytics methods — STUBBED. The Android SDK's MC AnalyticsManager interface did not
    // surface any methods in API discovery for v11.0.0, so we cannot verify the actual
    // setter/getter shape against bytecode. The Kotlin compiler rejects every speculative
    // anchor name (setAnalyticsEnabled, enableAnalytics, isAnalyticsEnabled, etc.) when
    // emitted directly. To unblock the build, these methods are no-ops that log a warning.
    // The TS spec preserves cross-platform API parity; iOS implements them correctly.
    // Re-enable once a verified Android API discovery is available.
    @ReactMethod
    override fun enablePiAnalytics() {
        MarketingCloudSdk.requestSdk { sdk ->
            sdk.getAnalyticsManager().enablePiAnalytics()
        }
    }

    @ReactMethod
    override fun disablePiAnalytics() {
        MarketingCloudSdk.requestSdk { sdk ->
            sdk.getAnalyticsManager().disablePiAnalytics()
        }
    }

    @ReactMethod
    override fun isPiAnalyticsEnabled(promise: Promise) {
        MarketingCloudSdk.requestSdk { sdk ->
            promise.resolve(sdk.getAnalyticsManager().arePiAnalyticsEnabled())
        }
    }

    @ReactMethod
    override fun enableAnalytics() {
        MarketingCloudSdk.requestSdk { sdk ->
            sdk.getAnalyticsManager().enableAnalytics()
        }
    }

    @ReactMethod
    override fun disableAnalytics() {
        MarketingCloudSdk.requestSdk { sdk ->
            sdk.getAnalyticsManager().disableAnalytics()
        }
    }

    @ReactMethod
    override fun isAnalyticsEnabled(promise: Promise) {
        MarketingCloudSdk.requestSdk { sdk ->
            promise.resolve(sdk.getAnalyticsManager().areAnalyticsEnabled())
        }
    }

    @ReactMethod
    override fun getDeviceId(promise: Promise) {
        MarketingCloudSdk.requestSdk { sdk ->
            promise.resolve(sdk.getRegistrationManager().getDeviceId())
        }
    }

    @ReactMethod
    override fun getContactKey(promise: Promise) {
        MarketingCloudSdk.requestSdk { sdk ->
            promise.resolve(sdk.getRegistrationManager().getContactKey())
        }
    }

    @ReactMethod
    override fun enableLogging() {
        MarketingCloudSdk.setLogLevel(MCLogListener.VERBOSE)
        MarketingCloudSdk.setLogListener(MCLogListener.AndroidLogListener())
    }

    @ReactMethod
    override fun disableLogging() {
        MarketingCloudSdk.setLogListener(null)
    }

    @ReactMethod
    override fun setRegistrationCallback() {
        MarketingCloudSdk.requestSdk { sdk ->
            // Defense in depth against bridge teardown races: WeakRegistrationListener
            // does not capture `this`, so if invalidate() is skipped (process death,
            // framework bug) the module + ReactApplicationContext can still be GC'd.
            val listener = WeakRegistrationListener(this)
            registrationListener = listener
            sdk.getRegistrationManager().registerForRegistrationEvents(listener)
        }
    }

    internal fun onRegistrationReceived(registration: Registration) {
        sendEvent("sfmc_mc_registration", registrationToWritableMap(registration))
    }

    private class WeakRegistrationListener(
        module: MCModule,
    ) : RegistrationManager.RegistrationEventListener {
        private val ref = WeakReference(module)
        override fun onRegistrationReceived(registration: Registration) {
            ref.get()?.onRegistrationReceived(registration)
        }
    }

    private fun registrationToWritableMap(registration: Registration): WritableMap {
        val map = Arguments.createMap()
        map.putString("signedString", registration.signedString)
        map.putString("deviceId", registration.deviceId)
        map.putString("systemToken", registration.systemToken)
        map.putString("sdkVersion", registration.sdkVersion)
        map.putString("appVersion", registration.appVersion)
        map.putBoolean("dst", registration.dst)
        map.putBoolean("locationEnabled", registration.locationEnabled)
        map.putBoolean("proximityEnabled", registration.proximityEnabled)
        map.putString("platformVersion", registration.platformVersion)
        map.putBoolean("pushEnabled", registration.pushEnabled)
        map.putInt("timeZone", registration.timeZone)
        map.putString("contactKey", registration.contactKey)
        map.putString("platform", registration.platform)
        map.putString("hwid", registration.hwid)
        map.putString("appId", registration.appId)
        map.putString("locale", registration.locale)
        val tagsArray = Arguments.createArray()
        registration.tags.forEach { tagsArray.pushString(it) }
        map.putArray("tags", tagsArray)
        map.putMap("attributes", InboxUtils.stringMapToWritableMap(registration.attributes))
        return map
    }

    @ReactMethod
    override fun unsetRegistrationCallback() {
        MarketingCloudSdk.requestSdk { sdk ->
            registrationListener?.let {
                sdk.getRegistrationManager().unregisterForRegistrationEvents(it)
            }
            registrationListener = null
        }
    }

    override fun invalidate() {
        // Best-effort cleanup if JS never called unsetRegistrationCallback() before
        // bridge teardown. The SFMC SDK is Application-scoped and outlives the bridge,
        // so the requestSdk callback is safe to fire and forget.
        registrationListener?.let { listener ->
            MarketingCloudSdk.requestSdk { sdk ->
                sdk.getRegistrationManager().unregisterForRegistrationEvents(listener)
            }
        }
        registrationListener = null
        messageCache.clear()
        super.invalidate()
    }

    @ReactMethod
    override fun addListener(eventName: String) {}

    @ReactMethod
    override fun removeListeners(count: Double) {
        // Required for RN event emitter parity; module emits no events.
    }

    private fun messagesToArray(messages: List<InboxMessage>): WritableArray {
        return InboxUtils.messagesToArray(messages)
    }
}
