#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <ReactCommon/RCTTurboModule.h>
#import <ReactCommon/RCTInteropTurboModule.h>
#import <SFMCSDK/SFMCSDK-Swift.h>
#import <MarketingCloudSDK/MarketingCloudSDK-Swift.h>

@interface MCModule : RCTEventEmitter <RCTBridgeModule, RCTTurboModule>
@end

// MCNormaliseMessages — maps NSDictionary inbox messages to the cross-platform InboxMessage shape.
//
// iOS-specific transformation rules:
//   - Boolean fields (`read`, `deleted`) → extract via `@([m[@"x"] boolValue])`.
//   - Date fields (`startDateUtc`, `endDateUtc`, `sendDateUtc`) → if NSDate, format to
//     "yyyy-MM-dd HH:mm:ss" UTC; if NSString, pass through.
//   - `keys` (iOS) → SDK returns array of [{key, value}] dicts. Flatten into `customKeys` map
//     for parity with Android's native Map<String, String>.
//   - `media`, `notificationMessage` → NSDictionary on iOS, pass through as objects.
//   - `subject` and `title` are independent — do NOT coalesce.
//   - Do NOT fall back to internal push-payload keys (`_m_`, `_r_`, `messageId`).
static NSArray * MCNormaliseMessages(NSArray *messages) {
    NSDateFormatter *df = [[NSDateFormatter alloc] init];
    [df setDateFormat:@"yyyy-MM-dd HH:mm:ss"];
    [df setTimeZone:[NSTimeZone timeZoneWithAbbreviation:@"UTC"]];
    df.locale = [NSLocale localeWithLocaleIdentifier:@"en_US_POSIX"];

    NSMutableArray *result = [NSMutableArray arrayWithCapacity:messages.count];
    for (NSDictionary *m in messages) {
        NSMutableDictionary *item = [NSMutableDictionary dictionary];

        // Public InboxMessage string / object fields — pass through if present.
        for (NSString *key in @[@"id", @"subject", @"title", @"alert", @"sound", @"url",
                                @"custom", @"subtitle", @"inboxMessage", @"inboxSubtitle",
                                @"messageType", @"media", @"notificationMessage"]) {
            if (m[key]) item[key] = m[key];
        }

        // Boolean fields — always emit, extracting via boolValue
        item[@"read"] = @([m[@"read"] boolValue]);
        item[@"deleted"] = @([m[@"deleted"] boolValue]);

        // Date fields — format NSDate to UTC string, pass through NSString
        for (NSString *dateKey in @[@"startDateUtc", @"endDateUtc", @"sendDateUtc"]) {
            id v = m[dateKey];
            if ([v isKindOfClass:[NSDate class]]) {
                item[dateKey] = [df stringFromDate:v];
            } else if ([v isKindOfClass:[NSString class]]) {
                item[dateKey] = v;
            }
        }

        // keys → customKeys: flatten [{key, value}] array to flat map (iOS-specific)
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

        [result addObject:item];
    }
    return result;
}

// MCFindMessage — looks up a message NSDictionary by JS-side id string.
// Used by trackInboxMessageOpened which requires a dict (not a by-id selector).
static NSDictionary * MCFindMessage(NSArray *messages, NSString *messageId) {
    for (NSDictionary *m in messages) {
        if ([m[@"id"] isEqualToString:messageId]) return m;
    }
    return nil;
}

@implementation MCModule

RCT_EXPORT_MODULE(MCModule);

- (NSArray<NSString *> *)supportedEvents {
    return @[];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
    return std::make_shared<facebook::react::ObjCInteropTurboModule>(params);
}

// RCTEventEmitter no-op stubs — required for TS spec parity even though no events are emitted.
RCT_EXPORT_METHOD(addListener:(NSString *)eventName) {}
RCT_EXPORT_METHOD(removeListeners:(double)count) {}

// ── SDK ready ───────────────────────────────────────────────────────────────────

RCT_EXPORT_METHOD(requestMcSdk:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        resolve(nil);
    }];
}

// ── Inbox — refresh ─────────────────────────────────────────────────────────────
// Discovered selector: refreshMessages (BOOL return).

RCT_EXPORT_METHOD(refreshInbox:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        resolve(@([mc refreshMessages]));
    }];
}

// ── Inbox — message lists ───────────────────────────────────────────────────────

RCT_EXPORT_METHOD(getAllMessages:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        resolve(MCNormaliseMessages([mc getAllMessages] ?: @[]));
    }];
}

RCT_EXPORT_METHOD(getUnreadMessages:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        resolve(MCNormaliseMessages([mc getUnreadMessages] ?: @[]));
    }];
}

RCT_EXPORT_METHOD(getReadMessages:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        resolve(MCNormaliseMessages([mc getReadMessages] ?: @[]));
    }];
}

RCT_EXPORT_METHOD(getDeletedMessages:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        resolve(MCNormaliseMessages([mc getDeletedMessages] ?: @[]));
    }];
}

// ── Inbox — counts ──────────────────────────────────────────────────────────────

RCT_EXPORT_METHOD(getMessageCount:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        resolve(@([mc getAllMessagesCount]));
    }];
}

RCT_EXPORT_METHOD(getUnreadMessageCount:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        resolve(@([mc getUnreadMessagesCount]));
    }];
}

RCT_EXPORT_METHOD(getReadMessageCount:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        resolve(@([mc getReadMessagesCount]));
    }];
}

RCT_EXPORT_METHOD(getDeletedMessageCount:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        resolve(@([mc getDeletedMessagesCount]));
    }];
}

// ── Inbox — mark operations ─────────────────────────────────────────────────────
// Discovered selectors: markMessageWithIdReadWithMessageId: / markMessageWithIdDeletedWithMessageId:
// (by-id variants — preferred over the dict-taking selectors).

RCT_EXPORT_METHOD(markMessageRead:(NSString *)messageId) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        [mc markMessageWithIdReadWithMessageId:messageId];
    }];
}

RCT_EXPORT_METHOD(markMessageDeleted:(NSString *)messageId) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        [mc markMessageWithIdDeletedWithMessageId:messageId];
    }];
}

RCT_EXPORT_METHOD(markAllMessagesRead) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        [mc markAllMessagesRead];
    }];
}

RCT_EXPORT_METHOD(markAllMessagesDeleted) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        [mc markAllMessagesDeleted];
    }];
}

// trackMessageOpened: requires a message dict — look up by id from getAllMessages.
RCT_EXPORT_METHOD(trackInboxMessageOpened:(NSString *)messageId) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        NSDictionary *msg = MCFindMessage([mc getAllMessages] ?: @[], messageId);
        if (msg) [mc trackMessageOpened:msg];
    }];
}

// ── Tags ────────────────────────────────────────────────────────────────────────
// Discovery: addTag:, addTags:, removeTag:, tags. NO `removeTags:` plural — loop locally.

RCT_EXPORT_METHOD(addTag:(NSString *)tag) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        [mc addTag:tag];
    }];
}

RCT_EXPORT_METHOD(addTags:(NSArray<NSString *> *)tags) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        [mc addTags:tags];
    }];
}

RCT_EXPORT_METHOD(removeTag:(NSString *)tag) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        [mc removeTag:tag];
    }];
}

// removeTags: no plural removeTags: selector on iOS SDK — loop over removeTag:.
RCT_EXPORT_METHOD(removeTags:(NSArray<NSString *> *)tags) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        for (NSString *tag in tags) { [mc removeTag:tag]; }
    }];
}

RCT_EXPORT_METHOD(getTags:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        resolve([[mc tags] allObjects] ?: @[]);
    }];
}

// ── Attributes ──────────────────────────────────────────────────────────────────

RCT_EXPORT_METHOD(getAttributes:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        resolve([mc attributes] ?: @{});
    }];
}

// ── Analytics — PI ──────────────────────────────────────────────────────────────

RCT_EXPORT_METHOD(enablePiAnalytics) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        [mc setPiAnalyticsEnabled:YES];
    }];
}

RCT_EXPORT_METHOD(disablePiAnalytics) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        [mc setPiAnalyticsEnabled:NO];
    }];
}

RCT_EXPORT_METHOD(isPiAnalyticsEnabled:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        resolve(@([mc isPiAnalyticsEnabled]));
    }];
}

// ── Analytics — general ─────────────────────────────────────────────────────────

RCT_EXPORT_METHOD(enableAnalytics) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        [mc setAnalyticsEnabled:YES];
    }];
}

RCT_EXPORT_METHOD(disableAnalytics) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        [mc setAnalyticsEnabled:NO];
    }];
}

RCT_EXPORT_METHOD(isAnalyticsEnabled:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        resolve(@([mc isAnalyticsEnabled]));
    }];
}

// ── Device / contact ────────────────────────────────────────────────────────────
// Discovered instance methods on MarketingCloudSdkInterface: deviceIdentifier, contactKey.

RCT_EXPORT_METHOD(getDeviceId:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        resolve([mc deviceIdentifier]);
    }];
}

RCT_EXPORT_METHOD(getContactKey:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        resolve([mc contactKey]);
    }];
}

// ── SDK version (platform-asymmetric stub) ──────────────────────────────────────
// iOS discovery has NO `moduleVersion` / version selector on SFMarketingCloudSdk and no
// public version selector on SFMCSdk. Emitted as a stub returning empty string per the
// platform-asymmetry rule. See sdk-patterns.md "MarketingCloudSdkInterface flat protocol".

RCT_EXPORT_METHOD(getSdkVersionName:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSLog(@"[MCModule] getSdkVersionName: not available in iOS SDK 11.0 discovery — returning empty string");
    resolve(@"");
}

@end
