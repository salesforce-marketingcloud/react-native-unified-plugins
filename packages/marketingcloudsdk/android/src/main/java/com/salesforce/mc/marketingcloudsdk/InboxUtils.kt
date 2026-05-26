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

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.salesforce.marketingcloud.messages.inbox.InboxMessage
import com.salesforce.marketingcloud.notifications.NotificationMessage
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

internal object InboxUtils {

    private val utcDateFormat: SimpleDateFormat =
        SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US).apply {
            timeZone = TimeZone.getTimeZone("UTC")
        }

    fun formatDate(date: Date?): String? = date?.let { utcDateFormat.format(it) }

    fun stringMapToWritableMap(src: Map<String, String>?): WritableMap? {
        if (src == null) return null
        val map = Arguments.createMap()
        src.forEach { (k, v) -> map.putString(k, v) }
        return map
    }

    fun mediaToMap(media: InboxMessage.Media?): WritableMap? {
        if (media == null) return null
        val map = Arguments.createMap()
        media.altText?.let { map.putString("altText", it) } ?: map.putNull("altText")
        media.url?.let { map.putString("url", it) } ?: map.putNull("url")
        return map
    }

    fun notificationMessageToMap(nm: NotificationMessage?): WritableMap? {
        if (nm == null) return null
        val map = Arguments.createMap()
        map.putString("id", nm.id)
        map.putString("alert", nm.alert)
        nm.title?.let { map.putString("title", it) } ?: map.putNull("title")
        nm.subtitle?.let { map.putString("subtitle", it) } ?: map.putNull("subtitle")
        nm.custom?.let { map.putString("custom", it) } ?: map.putNull("custom")
        map.putMap("customKeys", stringMapToWritableMap(nm.customKeys))
        nm.mediaUrl?.let { map.putString("mediaUrl", it) } ?: map.putNull("mediaUrl")
        nm.mediaAltText?.let { map.putString("mediaAltText", it) } ?: map.putNull("mediaAltText")
        if (nm.payload != null) map.putMap("payload", stringMapToWritableMap(nm.payload)) else map.putNull("payload")
        nm.url?.let { map.putString("url", it) } ?: map.putNull("url")
        map.putString("sound", nm.sound.name)
        nm.soundName?.let { map.putString("soundName", it) } ?: map.putNull("soundName")
        map.putString("type", nm.type.name)
        map.putString("trigger", nm.trigger.name)
        nm.region?.let { map.putString("region", it.toString()) } ?: map.putNull("region")
        nm.richFeatures?.let { map.putString("richFeatures", it.toString()) } ?: map.putNull("richFeatures")
        return map
    }

    fun messagesToArray(messages: List<InboxMessage>): WritableArray {
        val array = Arguments.createArray()
        messages.forEach { msg ->
            val map = Arguments.createMap()
            map.putString("id", msg.id)
            msg.subject?.let { map.putString("subject", it) } ?: map.putNull("subject")
            msg.title?.let { map.putString("title", it) } ?: map.putNull("title")
            msg.alert?.let { map.putString("alert", it) } ?: map.putNull("alert")
            msg.sound?.let { map.putString("sound", it) } ?: map.putNull("sound")
            if (msg.media != null) map.putMap("media", mediaToMap(msg.media)) else map.putNull("media")
            formatDate(msg.startDateUtc)?.let { map.putString("startDateUtc", it) } ?: map.putNull("startDateUtc")
            formatDate(msg.endDateUtc)?.let { map.putString("endDateUtc", it) } ?: map.putNull("endDateUtc")
            formatDate(msg.sendDateUtc)?.let { map.putString("sendDateUtc", it) } ?: map.putNull("sendDateUtc")
            msg.url?.let { map.putString("url", it) } ?: map.putNull("url")
            msg.custom?.let { map.putString("custom", it) } ?: map.putNull("custom")
            if (msg.customKeys != null) map.putMap("customKeys", stringMapToWritableMap(msg.customKeys)) else map.putNull("customKeys")
            msg.subtitle?.let { map.putString("subtitle", it) } ?: map.putNull("subtitle")
            msg.inboxMessage?.let { map.putString("inboxMessage", it) } ?: map.putNull("inboxMessage")
            msg.inboxSubtitle?.let { map.putString("inboxSubtitle", it) } ?: map.putNull("inboxSubtitle")
            if (msg.notificationMessage != null) map.putMap("notificationMessage", notificationMessageToMap(msg.notificationMessage)) else map.putNull("notificationMessage")
            if (msg.messageType != null) map.putInt("messageType", msg.messageType!!) else map.putNull("messageType")
            map.putBoolean("read", msg.read)
            map.putBoolean("deleted", msg.deleted)
            array.pushMap(map)
        }
        return array
    }
}
