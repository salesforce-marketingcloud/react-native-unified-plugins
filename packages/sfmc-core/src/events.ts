export interface LineItem {
    catalogObjectType: string;
    catalogObjectId: string;
    quantity: number;
    price: number;
    currency: string;
    attributes?: Record<string, string>;
}

export interface CatalogObject {
    type: string;
    id: string;
    attributes?: Record<string, string>;
    relatedCatalogObjects?: Record<string, string[]>;
}

export interface Order {
    id: string;
    lineItems: LineItem[];
    totalValue: number;
    currency: string;
    attributes?: Record<string, string>;
}

export interface CustomEvent {
    objType: 'CustomEvent';
    name: string;
    attributes?: Record<string, string>;
}

export interface EngagementEvent {
    objType: 'EngagementEvent';
    name: string;
    attributes?: Record<string, string>;
}

export interface SystemEvent {
    objType: 'SystemEvent';
    name: string;
    attributes?: Record<string, string>;
}

export interface CartEvent {
    objType: 'CartEvent';
    subtype: 'add' | 'remove' | 'replace';
    lineItems: LineItem[];
}

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
