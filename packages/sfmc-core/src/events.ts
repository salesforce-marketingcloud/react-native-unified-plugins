/**
 * @license
 * Copyright 2026 Salesforce, Inc
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

export interface LineItem {
  catalogObjectType: string;
  catalogObjectId: string;
  quantity: number;
  price: number;
  currency: string;
  attributes?: Record<string, string | number | boolean>;
}

export interface CatalogObject {
  type: string;
  id: string;
  attributes?: Record<string, string | number | boolean>;
  relatedCatalogObjects?: Record<string, string[]>;
}

export interface Order {
  id: string;
  lineItems: LineItem[];
  totalValue: number;
  currency: string;
  attributes?: Record<string, string | number | boolean>;
}

/**
 * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-Android/javadocs/SFMCSdk/11.0/sfmcsdk/com.salesforce.marketingcloud.sfmcsdk.components.events/index.html |Android Docs}
 * @see  {@link https://salesforce-marketingcloud.github.io/MarketingCloudSDK-iOS/appledocs/SFMCSdk/11.0/Classes/CustomEvent.html |iOS Docs}
 */
export interface CustomEvent {
  objType: 'CustomEvent';
  name: string;
  attributes?: Record<string, string | number | boolean>;
}

export interface EngagementEvent {
  objType: 'EngagementEvent';
  name: string;
  attributes?: Record<string, string | number | boolean>;
}

export interface SystemEvent {
  objType: 'SystemEvent';
  name: string;
  attributes?: Record<string, string | number | boolean>;
}

/**
 * @deprecated Use {@link CustomEvent} instead with an appropriate event name and attributes.
 */
export interface CartEvent {
  objType: 'CartEvent';
  subtype: 'add' | 'remove' | 'replace';
  lineItems: LineItem[];
}

/**
 * @deprecated Use {@link CustomEvent} instead with an appropriate event name and attributes.
 */
export interface OrderEvent {
  objType: 'OrderEvent';
  subtype:
    | 'purchase'
    | 'preorder'
    | 'cancel'
    | 'ship'
    | 'deliver'
    | 'return'
    | 'exchange';
  order: Order;
}

/**
 * @deprecated Use {@link CustomEvent} instead with an appropriate event name and attributes.
 */
export interface CatalogObjectEvent {
  objType: 'CatalogEvent';
  subtype:
    | 'comment'
    | 'view'
    | 'quickView'
    | 'viewDetail'
    | 'favorite'
    | 'share'
    | 'review';
  catalogObject: CatalogObject;
}

export type SFMCEvent =
  | CustomEvent
  | EngagementEvent
  | SystemEvent
  | CartEvent
  | OrderEvent
  | CatalogObjectEvent;
