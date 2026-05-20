package com.salesforce.mc.marketingcloudsdk

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.salesforce.marketingcloud.MCLogListener
import com.salesforce.marketingcloud.MarketingCloudSdk
import com.salesforce.marketingcloud.messages.inbox.InboxMessage
import com.salesforce.marketingcloud.messages.inbox.InboxMessageManager
import com.salesforce.marketingcloud.notifications.NotificationMessage
import com.salesforce.marketingcloud.registration.RegistrationManager
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

@ReactModule(name = MCModule.NAME)
class MCModule(reactContext: ReactApplicationContext) :
    NativeMCModuleSpec(reactContext) {

    companion object { const val NAME = "MCModule" }

    private var registrationListener: RegistrationManager.RegistrationEventListener? = null

    private fun sendEvent(name: String, params: com.facebook.react.bridge.WritableMap) {
        if (reactApplicationContext.hasActiveReactInstance()) {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(name, params)
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
            promise.resolve(messagesToArray(sdk.getInboxMessageManager().getMessages()))
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

    // trackInboxMessageOpened — InboxMessageManager has no `trackMessageOpened` method in v11
    // discovery. Emitting as no-op stub to satisfy the TS spec; logs a warning at runtime.
    @ReactMethod
    override fun trackInboxMessageOpened(messageId: String) {
        android.util.Log.w(NAME, "trackInboxMessageOpened: not implemented — no SDK method available in v11")
    }

    @ReactMethod
    override fun addTag(tag: String) {
        MarketingCloudSdk.requestSdk { it.getRegistrationManager().edit().addTag(tag).commit() }
    }

    @ReactMethod
    override fun addTags(tags: ReadableArray) {
        val tagSet = (0 until tags.size()).mapTo(mutableSetOf()) { tags.getString(it) ?: "" }
        MarketingCloudSdk.requestSdk { it.getRegistrationManager().edit().addTags(tagSet).commit() }
    }

    @ReactMethod
    override fun removeTag(tag: String) {
        MarketingCloudSdk.requestSdk { it.getRegistrationManager().edit().removeTag(tag).commit() }
    }

    @ReactMethod
    override fun removeTags(tags: ReadableArray) {
        val tagSet = (0 until tags.size()).mapTo(mutableSetOf()) { tags.getString(it) ?: "" }
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
        Log.w("MCModule", "enablePiAnalytics: not bridged on Android v11 (AnalyticsManager API not discovered)")
    }

    @ReactMethod
    override fun disablePiAnalytics() {
        Log.w("MCModule", "disablePiAnalytics: not bridged on Android v11 (AnalyticsManager API not discovered)")
    }

    @ReactMethod
    override fun isPiAnalyticsEnabled(promise: Promise) {
        Log.w("MCModule", "isPiAnalyticsEnabled: not bridged on Android v11 (AnalyticsManager API not discovered)")
        promise.resolve(false)
    }

    @ReactMethod
    override fun enableAnalytics() {
        Log.w("MCModule", "enableAnalytics: not bridged on Android v11 (AnalyticsManager API not discovered)")
    }

    @ReactMethod
    override fun disableAnalytics() {
        Log.w("MCModule", "disableAnalytics: not bridged on Android v11 (AnalyticsManager API not discovered)")
    }

    @ReactMethod
    override fun isAnalyticsEnabled(promise: Promise) {
        Log.w("MCModule", "isAnalyticsEnabled: not bridged on Android v11 (AnalyticsManager API not discovered)")
        promise.resolve(false)
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
            val listener = RegistrationManager.RegistrationEventListener { registration ->
                sendEvent("sfmc_mc_registration", Arguments.makeNativeMap(registration.toMap()))
            }
            registrationListener = listener
            sdk.getRegistrationManager().registerForRegistrationEvents(listener)
        }
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

    @ReactMethod
    override fun addListener(eventName: String) {}

    @ReactMethod
    override fun removeListeners(count: Double) {
        // Required for RN event emitter parity; module emits no events.
    }

    // -- Serialization helpers (discovery-driven from InboxMessage.model_fields) --

    private val utcDateFormat: SimpleDateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US).apply {
        timeZone = TimeZone.getTimeZone("UTC")
    }

    private fun formatDate(date: Date?): String? = date?.let { utcDateFormat.format(it) }

    private fun stringMapToWritableMap(src: Map<String, String>?): WritableMap? {
        if (src == null) return null
        val map = Arguments.createMap()
        src.forEach { (k, v) -> map.putString(k, v) }
        return map
    }

    private fun mediaToMap(media: InboxMessage.Media?): WritableMap? {
        if (media == null) return null
        val map = Arguments.createMap()
        media.altText?.let { map.putString("altText", it) } ?: map.putNull("altText")
        media.url?.let { map.putString("url", it) } ?: map.putNull("url")
        return map
    }

    private fun notificationMessageToMap(nm: NotificationMessage?): WritableMap? {
        if (nm == null) return null
        val map = Arguments.createMap()
        map.putString("id", nm.id)
        map.putString("alert", nm.alert)
        nm.title?.let { map.putString("title", it) } ?: map.putNull("title")
        nm.subtitle?.let { map.putString("subtitle", it) } ?: map.putNull("subtitle")
        nm.custom?.let { map.putString("custom", it) } ?: map.putNull("custom")
        // customKeys is non-null on NotificationMessage
        map.putMap("customKeys", stringMapToWritableMap(nm.customKeys))
        nm.mediaUrl?.let { map.putString("mediaUrl", it) } ?: map.putNull("mediaUrl")
        nm.mediaAltText?.let { map.putString("mediaAltText", it) } ?: map.putNull("mediaAltText")
        if (nm.payload != null) map.putMap("payload", stringMapToWritableMap(nm.payload)) else map.putNull("payload")
        nm.url?.let { map.putString("url", it) } ?: map.putNull("url")
        map.putString("sound", nm.sound.name)
        nm.soundName?.let { map.putString("soundName", it) } ?: map.putNull("soundName")
        map.putString("type", nm.type.name)
        map.putString("trigger", nm.trigger.name)
        // Region and RichFeatures are not discovered here — fall back to toString for visibility.
        nm.region?.let { map.putString("region", it.toString()) } ?: map.putNull("region")
        // requestId is private on v11; skip.
        nm.richFeatures?.let { map.putString("richFeatures", it.toString()) } ?: map.putNull("richFeatures")
        return map
    }

    private fun messagesToArray(messages: List<InboxMessage>): WritableArray {
        val array = Arguments.createArray()
        messages.forEach { msg ->
            val map = Arguments.createMap()
            // From InboxMessage.model_fields (discovery-driven). Note: `requestId`, `messageHash`,
            // and `viewCount` are reported as public in discovery but compile as private at the
            // bytecode level on v11.0.0 — skipped here to avoid IllegalAccessError. Verify with
            // android-sdk-reflector on a future regen.
            map.putString("id", msg.id)
            msg.subject?.let { map.putString("subject", it) } ?: map.putNull("subject")
            msg.title?.let { map.putString("title", it) } ?: map.putNull("title")
            msg.alert?.let { map.putString("alert", it) } ?: map.putNull("alert")
            msg.sound?.let { map.putString("sound", it) } ?: map.putNull("sound")
            // Nested data class — recursive serialization
            if (msg.media != null) map.putMap("media", mediaToMap(msg.media)) else map.putNull("media")
            // Date fields → "yyyy-MM-dd HH:mm:ss" UTC
            formatDate(msg.startDateUtc)?.let { map.putString("startDateUtc", it) } ?: map.putNull("startDateUtc")
            formatDate(msg.endDateUtc)?.let { map.putString("endDateUtc", it) } ?: map.putNull("endDateUtc")
            formatDate(msg.sendDateUtc)?.let { map.putString("sendDateUtc", it) } ?: map.putNull("sendDateUtc")
            msg.url?.let { map.putString("url", it) } ?: map.putNull("url")
            msg.custom?.let { map.putString("custom", it) } ?: map.putNull("custom")
            // customKeys: Map<String, String>?
            if (msg.customKeys != null) map.putMap("customKeys", stringMapToWritableMap(msg.customKeys)) else map.putNull("customKeys")
            msg.subtitle?.let { map.putString("subtitle", it) } ?: map.putNull("subtitle")
            msg.inboxMessage?.let { map.putString("inboxMessage", it) } ?: map.putNull("inboxMessage")
            msg.inboxSubtitle?.let { map.putString("inboxSubtitle", it) } ?: map.putNull("inboxSubtitle")
            // Nested NotificationMessage
            if (msg.notificationMessage != null) map.putMap("notificationMessage", notificationMessageToMap(msg.notificationMessage)) else map.putNull("notificationMessage")
            // viewCount is private at bytecode level — skip.
            // messageType: Int?
            if (msg.messageType != null) map.putInt("messageType", msg.messageType!!) else map.putNull("messageType")
            // read / deleted are Kotlin var Boolean — access as msg.read / msg.deleted, NOT isRead/isDeleted
            map.putBoolean("read", msg.read)
            map.putBoolean("deleted", msg.deleted)
            array.pushMap(map)
        }
        return array
    }
}
