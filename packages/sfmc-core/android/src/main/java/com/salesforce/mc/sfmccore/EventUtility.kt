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

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.salesforce.marketingcloud.sfmcsdk.components.events.CartEvent
import com.salesforce.marketingcloud.sfmcsdk.components.events.CatalogEvent
import com.salesforce.marketingcloud.sfmcsdk.components.events.CatalogObject
import com.salesforce.marketingcloud.sfmcsdk.components.events.Event
import com.salesforce.marketingcloud.sfmcsdk.components.events.EventManager
import com.salesforce.marketingcloud.sfmcsdk.components.events.LineItem
import com.salesforce.marketingcloud.sfmcsdk.components.events.Order
import com.salesforce.marketingcloud.sfmcsdk.components.events.OrderEvent

object EventUtility {

    fun toEvent(map: ReadableMap): Event? {
        val objType = if (map.hasKey("objType")) map.getString("objType") else null
        if (objType == null) return null

        // Keep this switch aligned with the TS SFMCEvent union (packages/sfmc-core/src/events.ts)
        // and the iOS EventUtility (packages/sfmc-core/ios/EventUtility.mm). Adding an objType
        // here that isn't in both other places creates a silent platform-parity gap.
        return when (objType) {
            "CustomEvent" -> buildCategoryEvent(map, Event.Category.CUSTOM)
            "EngagementEvent" -> buildCategoryEvent(map, Event.Category.ENGAGEMENT)
            "SystemEvent" -> buildCategoryEvent(map, Event.Category.SYSTEM)
            "CartEvent" -> {
                val subtype = if (map.hasKey("subtype")) map.getString("subtype") else null
                when (subtype) {
                    "add" -> {
                        val items = map.getArray("lineItems") ?: return null
                        val first = items.getMap(0) ?: return null
                        CartEvent.add(toLineItem(first))
                    }
                    "remove" -> {
                        val items = map.getArray("lineItems") ?: return null
                        val first = items.getMap(0) ?: return null
                        CartEvent.remove(toLineItem(first))
                    }
                    "replace" -> {
                        val items = map.getArray("lineItems") ?: return null
                        CartEvent.replace(toLineItemList(items))
                    }
                    else -> null
                }
            }
            "OrderEvent" -> {
                val subtype = if (map.hasKey("subtype")) map.getString("subtype") else null
                val orderMap = map.getMap("order") ?: return null
                val order = toOrder(orderMap)
                when (subtype) {
                    "purchase" -> OrderEvent.purchase(order)
                    "preorder" -> OrderEvent.preorder(order)
                    "cancel" -> OrderEvent.cancel(order)
                    "ship" -> OrderEvent.ship(order)
                    "deliver" -> OrderEvent.deliver(order)
                    "return" -> OrderEvent.returnOrder(order)
                    "exchange" -> OrderEvent.exchange(order)
                    else -> null
                }
            }
            "CatalogEvent" -> {
                val subtype = if (map.hasKey("subtype")) map.getString("subtype") else null
                val catalogMap = map.getMap("catalogObject") ?: return null
                val catalogObject = toCatalogObject(catalogMap)
                when (subtype) {
                    "view" -> CatalogEvent.view(catalogObject)
                    "viewDetail" -> CatalogEvent.viewDetail(catalogObject)
                    "favorite" -> CatalogEvent.favorite(catalogObject)
                    "comment" -> CatalogEvent.comment(catalogObject)
                    "quickView" -> CatalogEvent.quickView(catalogObject)
                    "review" -> CatalogEvent.review(catalogObject)
                    "share" -> CatalogEvent.share(catalogObject)
                    else -> null
                }
            }
            else -> null
        }
    }

    private fun buildCategoryEvent(map: ReadableMap, category: Event.Category): Event? {
        val name = map.getString("name") ?: return null
        val attributes = readAnyAttributes(map, "attributes")
        return EventManager.customEvent(name, attributes, Event.Producer.CUSTOMER_APP, category)
    }

    private fun toLineItem(map: ReadableMap): LineItem {
        val catalogObjectType = map.getString("catalogObjectType") ?: ""
        val catalogObjectId = map.getString("catalogObjectId") ?: ""
        val quantity = if (map.hasKey("quantity")) map.getInt("quantity") else 0
        val price: Double? = if (map.hasKey("price") && !map.isNull("price")) map.getDouble("price") else null
        val currency: String? = if (map.hasKey("currency") && !map.isNull("currency")) map.getString("currency") else null
        val attributes = readAnyAttributes(map, "attributes")
        return LineItem(catalogObjectType, catalogObjectId, quantity, price, currency, attributes)
    }

    private fun toLineItemList(array: ReadableArray): List<LineItem> {
        return (0 until array.size()).mapNotNull { i ->
            array.getMap(i)?.let { toLineItem(it) }
        }
    }

    private fun toOrder(map: ReadableMap): Order {
        val id = map.getString("id") ?: ""
        val lineItems = map.getArray("lineItems")?.let { toLineItemList(it) } ?: listOf()
        val totalValue: Double? = if (map.hasKey("totalValue") && !map.isNull("totalValue")) map.getDouble("totalValue") else null
        val currency: String? = if (map.hasKey("currency") && !map.isNull("currency")) map.getString("currency") else null
        val attributes = readAnyAttributes(map, "attributes")
        return Order(id, lineItems, totalValue, currency, attributes)
    }

    private fun toCatalogObject(map: ReadableMap): CatalogObject {
        val type = map.getString("type") ?: ""
        val id = map.getString("id") ?: ""
        val attributes = readAnyAttributes(map, "attributes")
        val relatedCatalogObjects = readRelatedCatalogObjects(map, "relatedCatalogObjects")
        return CatalogObject(type, id, attributes, relatedCatalogObjects)
    }

    private fun readAnyAttributes(map: ReadableMap, key: String): Map<String, Any> {
        if (!map.hasKey(key) || map.isNull(key)) return mapOf()
        val attrMap = map.getMap(key) ?: return mapOf()
        val result = mutableMapOf<String, Any>()
        val iter = attrMap.keySetIterator()
        while (iter.hasNextKey()) {
            val k = iter.nextKey()
            val v: Any? = when (attrMap.getType(k)) {
                com.facebook.react.bridge.ReadableType.String -> attrMap.getString(k)
                com.facebook.react.bridge.ReadableType.Boolean -> attrMap.getBoolean(k)
                com.facebook.react.bridge.ReadableType.Number -> attrMap.getDouble(k)
                com.facebook.react.bridge.ReadableType.Null -> null
                else -> attrMap.getString(k)
            }
            if (v != null) result[k] = v
        }
        return result
    }

    private fun readRelatedCatalogObjects(map: ReadableMap, key: String): Map<String, List<String>> {
        if (!map.hasKey(key) || map.isNull(key)) return mapOf()
        val relatedMap = map.getMap(key) ?: return mapOf()
        val result = mutableMapOf<String, List<String>>()
        val iter = relatedMap.keySetIterator()
        while (iter.hasNextKey()) {
            val k = iter.nextKey()
            val arr = relatedMap.getArray(k) ?: continue
            val list = (0 until arr.size()).mapNotNull { arr.getString(it) }
            result[k] = list
        }
        return result
    }
}
