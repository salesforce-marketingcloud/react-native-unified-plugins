// InboxUtility.m
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

#import "InboxUtility.h"

@implementation InboxUtility

+ (NSArray *)processInboxMessages:(NSArray *)messages {
    NSDateFormatter *df = [[NSDateFormatter alloc] init];
    [df setDateFormat:@"yyyy-MM-dd HH:mm:ss"];
    [df setTimeZone:[NSTimeZone timeZoneWithAbbreviation:@"UTC"]];
    df.locale = [NSLocale localeWithLocaleIdentifier:@"en_US_POSIX"];

    NSMutableArray *result = [NSMutableArray arrayWithCapacity:messages.count];
    for (NSDictionary *m in messages) {
        NSMutableDictionary *item = [m mutableCopy];

        // Date fields — convert NSDate to UTC string
        for (NSString *dateKey in @[@"startDateUtc", @"endDateUtc", @"sendDateUtc",
                                    @"lastShownDateUtc", @"nextAllowedShowDateUtc"]) {
            id v = item[dateKey];
            if ([v isKindOfClass:[NSDate class]]) {
                item[dateKey] = [df stringFromDate:v];
            }
        }

        // Boolean coercion
        item[@"read"] = @([m[@"read"] boolValue]);
        item[@"deleted"] = @([m[@"messageDeleted"] boolValue] || [m[@"deleted"] boolValue]);

        // keys → customKeys: flatten [{key, value}] array to flat map
        NSArray *keys = m[@"keys"];
        if ([keys isKindOfClass:[NSArray class]] && keys.count > 0) {
            NSMutableDictionary *customKeys = [NSMutableDictionary dictionaryWithCapacity:keys.count];
            for (NSDictionary *kv in keys) {
                NSString *k = kv[@"key"];
                id v = kv[@"value"];
                if ([k isKindOfClass:[NSString class]] && v) customKeys[k] = v;
            }
            if (customKeys.count > 0) item[@"customKeys"] = customKeys;
        }
        [item removeObjectForKey:@"keys"];

        // media dot-notation keys → nested media dict
        NSString *mediaUrl = m[@"media.url"];
        NSString *mediaAlt = m[@"media.altText"];
        if (mediaUrl || mediaAlt) {
            NSMutableDictionary *media = [NSMutableDictionary dictionary];
            if (mediaUrl) media[@"url"] = mediaUrl;
            if (mediaAlt) media[@"altText"] = mediaAlt;
            item[@"media"] = media;
        }
        [item removeObjectForKey:@"media.url"];
        [item removeObjectForKey:@"media.altText"];

        [result addObject:item];
    }
    return result;
}

@end
