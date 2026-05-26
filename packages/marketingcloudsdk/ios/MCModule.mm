#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <ReactCommon/RCTTurboModule.h>
#import <ReactCommon/RCTInteropTurboModule.h>
#import <SFMCSDK/SFMCSDK-Swift.h>
#import <MarketingCloudSDK/MarketingCloudSDK-Swift.h>

@interface MCModule : RCTEventEmitter <RCTBridgeModule, RCTTurboModule>
@end

// MCNormaliseMessages — passes through the full SDK dictionary, only transforming:
//   - Date fields (NSDate → "yyyy-MM-dd HH:mm:ss" UTC string)
//   - `keys` array → flattened `customKeys` map (for parity with Android)
//   - `media.url` / `media.altText` dot-notation keys → nested `media` dict
//   - Boolean coercion for `read` and `deleted`/`messageDeleted`
static NSArray * MCNormaliseMessages(NSArray *messages) {
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

@implementation MCModule

RCT_EXPORT_MODULE(MCModule);

- (NSArray<NSString *> *)supportedEvents {
    return @[@"sfmc_mc_registration"];
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

RCT_EXPORT_METHOD(trackInboxMessageOpened:(NSDictionary *)message) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        if (message) [mc trackMessageOpened:message];
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

// ── Registration callback ──────────────────────────────────────────────────────
// iOS: setRegistrationCallback: / unsetRegistrationCallback on MarketingCloudSdk

RCT_EXPORT_METHOD(setRegistrationCallback) {
    __weak typeof(self) weakSelf = self;
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        [mc setRegistrationCallback:^(NSDictionary * _Nonnull registration) {
            [weakSelf sendEventWithName:@"sfmc_mc_registration" body:registration];
        }];
    }];
}

RCT_EXPORT_METHOD(unsetRegistrationCallback) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        [mc unsetRegistrationCallback];
    }];
}

// Best-effort cleanup if JS never called unsetRegistrationCallback before bridge
// teardown. The block uses weakSelf so ARC already releases the module, but the
// SDK keeps invoking the dead block forever — clear it here.
- (void)invalidate {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        [mc unsetRegistrationCallback];
    }];
    [super invalidate];
}

RCT_EXPORT_METHOD(enableLogging) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        [mc setDebugLoggingEnabled:YES];
    }];
}

RCT_EXPORT_METHOD(disableLogging) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        [mc setDebugLoggingEnabled:NO];
    }];
}

@end
