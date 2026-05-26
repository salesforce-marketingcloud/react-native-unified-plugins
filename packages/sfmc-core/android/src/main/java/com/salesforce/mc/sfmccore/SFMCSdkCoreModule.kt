package com.salesforce.mc.sfmccore

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.salesforce.marketingcloud.sfmcsdk.SFMCSdk
import com.salesforce.marketingcloud.sfmcsdk.components.logging.LogLevel
import com.salesforce.marketingcloud.sfmcsdk.components.logging.LogListener.AndroidLogger
import org.json.JSONArray
import org.json.JSONObject

@ReactModule(name = SFMCSdkCoreModule.NAME)
class SFMCSdkCoreModule(reactContext: ReactApplicationContext) :
    NativeSFMCSdkCoreModuleSpec(reactContext) {

    companion object {
        const val NAME = "SFMCSdkCoreModule"
        private const val TAG = NAME
        private const val E_BRIDGE_UNAVAILABLE = "E_BRIDGE_UNAVAILABLE"
    }

    /**
     * Posts [block] to the Native Modules queue so any bridge data structures
     * (WritableMap / WritableArray) and the promise resolution happen on a
     * React-managed thread instead of whichever worker thread invoked us
     * (e.g. SFMCSdk.requestSdk's internal executor).
     *
     * If the catalyst instance has already been torn down, the promise is
     * rejected so callers don't hang forever.
     */
    private fun runOnNativeModulesQueue(promise: Promise, block: () -> Unit) {
        if (!reactApplicationContext.hasActiveReactInstance()) {
            promise.reject(E_BRIDGE_UNAVAILABLE, "React instance is not active")
            return
        }
        try {
            reactApplicationContext.runOnNativeModulesQueueThread {
                try {
                    block()
                } catch (t: Throwable) {
                    Log.w(TAG, "Native modules queue task failed", t)
                    promise.reject(E_BRIDGE_UNAVAILABLE, t)
                }
            }
        } catch (t: Throwable) {
            // runOnNativeModulesQueueThread throws if catalyst was torn down
            // between our hasActiveReactInstance() check and the dispatch.
            Log.w(TAG, "Failed to dispatch to native modules queue", t)
            promise.reject(E_BRIDGE_UNAVAILABLE, t)
        }
    }

    @ReactMethod
    override fun requestSfmcSdk(promise: Promise) {
        SFMCSdk.requestSdk { _ -> promise.resolve(null) }
    }

    @ReactMethod
    override fun setProfileId(profileId: String) {
        SFMCSdk.requestSdk { sdk ->
            sdk.identity.edit { this.profileId = profileId }
        }
    }

    @ReactMethod
    override fun setAttribute(key: String, value: String) {
        SFMCSdk.requestSdk { sdk ->
            sdk.identity.edit { attributes[key] = value }
        }
    }

    @ReactMethod
    override fun clearAttribute(key: String) {
        SFMCSdk.requestSdk { sdk ->
            sdk.identity.edit { attributes.clear(key) }
        }
    }

    @ReactMethod
    override fun setAttributes(attributes: ReadableMap) {
        val map = mutableMapOf<String, String?>()
        val iter = attributes.keySetIterator()
        while (iter.hasNextKey()) {
            val key = iter.nextKey()
            map[key] = attributes.getString(key)
        }
        SFMCSdk.requestSdk { sdk ->
            sdk.identity.edit { this.attributes.putAll(map) }
        }
    }

    @ReactMethod
    override fun getAttributes(promise: Promise) {
        SFMCSdk.requestSdk { sdk ->
            // Snapshot SDK state on the SFMC worker thread, then hop to the
            // Native Modules queue to build the WritableMap and resolve the
            // promise on a React-managed thread.
            val attrsSnapshot = sdk.identity.attributes.toMap()
            runOnNativeModulesQueue(promise) {
                val map = Arguments.createMap()
                for ((key, value) in attrsSnapshot) {
                    map.putString(key, value)
                }
                promise.resolve(map)
            }
        }
    }

    @ReactMethod
    override fun clearAllAttributes() {
        SFMCSdk.requestSdk { sdk ->
            sdk.identity.edit { attributes.clearAll() }
        }
    }

    @ReactMethod
    override fun getProfileId(promise: Promise) {
        SFMCSdk.requestSdk { sdk ->
            promise.resolve(sdk.identity.profileId)
        }
    }

    @ReactMethod
    override fun getPartyIdentificationName(promise: Promise) {
        SFMCSdk.requestSdk { sdk ->
            promise.resolve(sdk.identity.partyIdentificationName)
        }
    }

    @ReactMethod
    override fun setPartyIdentificationName(name: String) {
        SFMCSdk.requestSdk { sdk ->
            sdk.identity.edit { this.partyIdentificationName = name }
        }
    }

    @ReactMethod
    override fun getPartyIdentificationNumber(promise: Promise) {
        SFMCSdk.requestSdk { sdk ->
            promise.resolve(sdk.identity.partyIdentificationNumber)
        }
    }

    @ReactMethod
    override fun setPartyIdentificationNumber(number: String) {
        SFMCSdk.requestSdk { sdk ->
            sdk.identity.edit { this.partyIdentificationNumber = number }
        }
    }

    @ReactMethod
    override fun getPartyIdentificationType(promise: Promise) {
        SFMCSdk.requestSdk { sdk ->
            promise.resolve(sdk.identity.partyIdentificationType)
        }
    }

    @ReactMethod
    override fun setPartyIdentificationType(type: String) {
        SFMCSdk.requestSdk { sdk ->
            sdk.identity.edit { this.partyIdentificationType = type }
        }
    }

    @ReactMethod
    override fun track(event: ReadableMap) {
        EventUtility.toEvent(event)?.let { SFMCSdk.track(it) }
    }

    @ReactMethod
    override fun setLogging(level: String) {
        val logLevel = when (level.uppercase()) {
            "DEBUG" -> LogLevel.DEBUG
            "WARN" -> LogLevel.WARN
            "ERROR" -> LogLevel.ERROR
            "NONE" -> LogLevel.NONE
            else -> LogLevel.WARN
        }
        // AndroidLogger is an open class — instantiate with AndroidLogger(), not the object reference.
        SFMCSdk.setLogging(logLevel, if (logLevel == LogLevel.NONE) null else AndroidLogger())
    }

    @ReactMethod
    override fun getSdkState(promise: Promise) {
        SFMCSdk.requestSdk { sdk ->
            // Capture the JSONObject on the SFMC worker thread, then build the
            // WritableMap on the Native Modules queue so all bridge data
            // mutation + promise resolution happens on a React-managed thread.
            val state = sdk.getSdkState()
            runOnNativeModulesQueue(promise) {
                val map = jsonObjectToWritableMap(state)
                Log.d(TAG, "SDK State: $map")
                promise.resolve(map)
            }
        }
    }

    private fun jsonObjectToWritableMap(json: JSONObject): WritableMap {
        val map = Arguments.createMap()
        val keys = json.keys()
        while (keys.hasNext()) {
            val key = keys.next()
            when (val v = json.get(key)) {
                JSONObject.NULL -> map.putNull(key)
                is JSONObject -> map.putMap(key, jsonObjectToWritableMap(v))
                is JSONArray -> map.putArray(key, jsonArrayToWritableArray(v))
                is String -> map.putString(key, v)
                is Boolean -> map.putBoolean(key, v)
                is Int -> map.putInt(key, v)
                is Long -> map.putDouble(key, v.toDouble())
                is Double -> map.putDouble(key, v)
                else -> map.putString(key, v.toString())
            }
        }
        return map
    }

    private fun jsonArrayToWritableArray(json: JSONArray): WritableArray {
        val array = Arguments.createArray()
        for (i in 0 until json.length()) {
            when (val v = json.get(i)) {
                JSONObject.NULL -> array.pushNull()
                is JSONObject -> array.pushMap(jsonObjectToWritableMap(v))
                is JSONArray -> array.pushArray(jsonArrayToWritableArray(v))
                is String -> array.pushString(v)
                is Boolean -> array.pushBoolean(v)
                is Int -> array.pushInt(v)
                is Long -> array.pushDouble(v.toDouble())
                is Double -> array.pushDouble(v)
                else -> array.pushString(v.toString())
            }
        }
        return array
    }

    @ReactMethod
    override fun sendImmediate(event: ReadableMap) {
        EventUtility.toEvent(event)?.let { SFMCSdk.sendImmediate(it) }
    }

    @ReactMethod
    override fun flush() {
        SFMCSdk.flush()
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
