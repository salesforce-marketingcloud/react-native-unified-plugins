// EventUtility.mm
//
// Copyright (c) 2026 Salesforce, Inc
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// Redistributions of source code must retain the above copyright notice, this
// list of conditions and the following disclaimer. Redistributions in binary
// form must reproduce the above copyright notice, this list of conditions and
// the following disclaimer in the documentation and/or other materials
// provided with the distribution. Neither the name of the nor the names of
// its contributors may be used to endorse or promote products derived from
// this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.

#import "EventUtility.h"
#import <SFMCSDK/SFMCSDK-Swift.h>

@implementation EventUtility

+ (id)eventFromDictionary:(NSDictionary *)dict {
    NSString *objType = dict[@"objType"];
    if (!objType) return nil;

    if ([objType isEqualToString:@"CustomEvent"]) {
        return [self customEventFromDictionary:dict];
    } else if ([objType isEqualToString:@"EngagementEvent"]) {
        return [self customEventFromDictionary:dict];
    } else if ([objType isEqualToString:@"SystemEvent"]) {
        return [self systemEventFromDictionary:dict];
    } else if ([objType isEqualToString:@"CartEvent"]) {
        return [self cartEventFromDictionary:dict];
    } else if ([objType isEqualToString:@"OrderEvent"]) {
        return [self orderEventFromDictionary:dict];
    } else if ([objType isEqualToString:@"CatalogEvent"]) {
        return [self catalogEventFromDictionary:dict];
    }

    return nil;
}

#pragma mark - Custom / Category Events

+ (id)customEventFromDictionary:(NSDictionary *)dict {
    NSString *name = dict[@"name"];
    if (!name) return nil;
    NSDictionary *attributes = dict[@"attributes"];
    return [[SFMCSdkCustomEvent alloc] initWithName:name attributes:attributes];
}

+ (id)systemEventFromDictionary:(NSDictionary *)dict {
    NSString *name = dict[@"name"];
    if (!name) return nil;
    NSDictionary *attributes = dict[@"attributes"];
    return [[SFMCSdkSystemEvent alloc] initWithName:name attributes:attributes];
}

#pragma mark - Cart Events

+ (id)cartEventFromDictionary:(NSDictionary *)dict {
    NSString *subtype = dict[@"subtype"];
    if (!subtype) return nil;

    NSArray<SFMCSdkLineItem *> *items = [self lineItemsFromArray:dict[@"lineItems"]];
    if (!items || items.count == 0) return nil;

    if ([subtype isEqualToString:@"add"]) {
        return [[SFMCSdkAddToCartEvent alloc] initWithLineItem:items.firstObject];
    } else if ([subtype isEqualToString:@"remove"]) {
        return [[SFMCSdkRemoveFromCartEvent alloc] initWithLineItem:items.firstObject];
    } else if ([subtype isEqualToString:@"replace"]) {
        return [[SFMCSdkReplaceCartEvent alloc] initWithLineItems:items];
    }

    return nil;
}

#pragma mark - Order Events

+ (id)orderEventFromDictionary:(NSDictionary *)dict {
    NSString *subtype = dict[@"subtype"];
    if (!subtype) return nil;

    SFMCSdkOrder *order = [self orderFromDictionary:dict[@"order"]];
    if (!order) return nil;

    if ([subtype isEqualToString:@"purchase"]) {
        return [[SFMCSdkPurchaseOrderEvent alloc] initWithOrder:order];
    } else if ([subtype isEqualToString:@"preorder"]) {
        return [[SFMCSdkPreorderEvent alloc] initWithOrder:order];
    } else if ([subtype isEqualToString:@"cancel"]) {
        return [[SFMCSdkCancelOrderEvent alloc] initWithOrder:order];
    } else if ([subtype isEqualToString:@"ship"]) {
        return [[SFMCSdkShipOrderEvent alloc] initWithOrder:order];
    } else if ([subtype isEqualToString:@"deliver"]) {
        return [[SFMCSdkDeliverOrderEvent alloc] initWithOrder:order];
    } else if ([subtype isEqualToString:@"return"]) {
        return [[SFMCSdkReturnOrderEvent alloc] initWithOrder:order];
    } else if ([subtype isEqualToString:@"exchange"]) {
        return [[SFMCSdkExchangeOrderEvent alloc] initWithOrder:order];
    }

    return nil;
}

#pragma mark - Catalog Events

+ (id)catalogEventFromDictionary:(NSDictionary *)dict {
    NSString *subtype = dict[@"subtype"];
    if (!subtype) return nil;

    SFMCSdkCatalogObject *co = [self catalogObjectFromDictionary:dict[@"catalogObject"]];
    if (!co) return nil;

    if ([subtype isEqualToString:@"comment"]) {
        return [[SFMCSdkCommentCatalogObjectEvent alloc] initWithCatalogObject:co];
    } else if ([subtype isEqualToString:@"view"]) {
        return [[SFMCSdkViewCatalogObjectEvent alloc] initWithCatalogObject:co];
    } else if ([subtype isEqualToString:@"quickView"]) {
        return [[SFMCSdkQuickViewCatalogObjectEvent alloc] initWithCatalogObject:co];
    } else if ([subtype isEqualToString:@"viewDetail"]) {
        return [[SFMCSdkViewCatalogObjectDetailEvent alloc] initWithCatalogObject:co];
    } else if ([subtype isEqualToString:@"favorite"]) {
        return [[SFMCSdkFavoriteCatalogObjectEvent alloc] initWithCatalogObject:co];
    } else if ([subtype isEqualToString:@"share"]) {
        return [[SFMCSdkShareCatalogObjectEvent alloc] initWithCatalogObject:co];
    } else if ([subtype isEqualToString:@"review"]) {
        return [[SFMCSdkReviewCatalogObjectEvent alloc] initWithCatalogObject:co];
    }

    return nil;
}

#pragma mark - Model Parsers

+ (SFMCSdkLineItem *)lineItemFromDictionary:(NSDictionary *)dict {
    if (!dict || ![dict isKindOfClass:[NSDictionary class]]) return nil;

    NSString *catalogObjectType = dict[@"catalogObjectType"] ?: @"";
    NSString *catalogObjectId = dict[@"catalogObjectId"] ?: @"";
    NSInteger quantity = [dict[@"quantity"] integerValue];
    NSDecimalNumber *price = dict[@"price"] ? [NSDecimalNumber decimalNumberWithString:[dict[@"price"] stringValue]] : nil;
    NSString *currency = dict[@"currency"] ?: @"";
    NSDictionary *attributes = dict[@"attributes"];

    return [[SFMCSdkLineItem alloc] initWithCatalogObjectType:catalogObjectType
                                              catalogObjectId:catalogObjectId
                                                     quantity:quantity
                                                        price:price
                                                     currency:currency
                                                   attributes:attributes];
}

+ (NSArray<SFMCSdkLineItem *> *)lineItemsFromArray:(NSArray *)array {
    if (!array || ![array isKindOfClass:[NSArray class]]) return nil;

    NSMutableArray<SFMCSdkLineItem *> *items = [NSMutableArray new];
    for (NSDictionary *dict in array) {
        SFMCSdkLineItem *li = [self lineItemFromDictionary:dict];
        if (li) [items addObject:li];
    }
    return items;
}

+ (SFMCSdkCatalogObject *)catalogObjectFromDictionary:(NSDictionary *)dict {
    if (!dict || ![dict isKindOfClass:[NSDictionary class]]) return nil;

    NSString *type = dict[@"type"] ?: @"";
    NSString *objectId = dict[@"id"] ?: @"";
    NSDictionary *attributes = dict[@"attributes"];
    NSDictionary *relatedCatalogObjects = dict[@"relatedCatalogObjects"];

    return [[SFMCSdkCatalogObject alloc] initWithType:type
                                                   id:objectId
                                           attributes:attributes
                                relatedCatalogObjects:relatedCatalogObjects];
}

+ (SFMCSdkOrder *)orderFromDictionary:(NSDictionary *)dict {
    if (!dict || ![dict isKindOfClass:[NSDictionary class]]) return nil;

    NSString *orderId = dict[@"id"] ?: @"";
    NSArray<SFMCSdkLineItem *> *lineItems = [self lineItemsFromArray:dict[@"lineItems"]] ?: @[];
    NSDecimalNumber *totalValue = dict[@"totalValue"] ? [NSDecimalNumber decimalNumberWithString:[dict[@"totalValue"] stringValue]] : nil;
    NSString *currency = dict[@"currency"] ?: @"";
    NSDictionary *attributes = dict[@"attributes"];

    return [[SFMCSdkOrder alloc] initWithId:orderId
                                  lineItems:lineItems
                                 totalValue:totalValue
                                   currency:currency
                                 attributes:attributes];
}

@end
