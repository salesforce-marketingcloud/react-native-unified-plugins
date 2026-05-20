package com.salesforce.mc.sfmccore

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.salesforce.marketingcloud.sfmcsdk.SFMCSdk
import com.salesforce.marketingcloud.sfmcsdk.components.logging.LogLevel
import com.salesforce.marketingcloud.sfmcsdk.components.logging.LogListener.AndroidLogger

@ReactModule(name = SFMCSdkCoreModule.NAME)
class SFMCSdkCoreModule(reactContext: ReactApplicationContext) :
    NativeSFMCSdkCoreModuleSpec(reactContext) {

    companion object { const val NAME = "SFMCSdkCoreModule" }

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
            val attrs = sdk.identity.attributes
            val map = Arguments.createMap()
            for ((key, value) in attrs) {
                map.putString(key, value)
            }
            promise.resolve(map)
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
            val json = sdk.getSdkState()
            val map = Arguments.createMap()
            val keys = json.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                when (val v = json.get(key)) {
                    is String -> map.putString(key, v)
                    is Boolean -> map.putBoolean(key, v)
                    is Int -> map.putInt(key, v)
                    is Double -> map.putDouble(key, v)
                    else -> map.putString(key, v.toString())
                }
            }
            promise.resolve(map)
        }
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
