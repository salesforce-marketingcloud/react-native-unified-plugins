#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <ReactCommon/RCTTurboModule.h>
#import <ReactCommon/RCTInteropTurboModule.h>
#import <UserNotifications/UserNotifications.h>
#import <SFMCSDK/SFMCSDK-Swift.h>
#import <InAppMessagingFeatureSDK/InAppMessagingFeatureSDK-Swift.h>

@interface SFMCIamModule : RCTEventEmitter <RCTBridgeModule, RCTTurboModule, SFMCSdkInAppMessageEventDelegate>
@end

@implementation SFMCIamModule {
    BOOL _hasListeners;
}

RCT_EXPORT_MODULE(SFMCIamModule);

- (NSArray<NSString *> *)supportedEvents {
    return @[ @"sfmc_iam_will_show", @"sfmc_iam_did_show", @"sfmc_iam_did_close" ];
}

- (void)startObserving {
    _hasListeners = YES;
}

- (void)stopObserving {
    _hasListeners = NO;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
    return std::make_shared<facebook::react::ObjCInteropTurboModule>(params);
}

// Required no-ops for TS spec parity (RCTEventEmitter handles ObjC runtime wiring).
RCT_EXPORT_METHOD(addListener:(NSString *)eventName) {}
RCT_EXPORT_METHOD(removeListeners:(double)count) {}

#pragma mark - TurboModule methods

// IAM has independent readiness state — must call requestSdk:, do NOT resolve immediately.
// Selector sourced from discovery: SFInAppMessagingFeature.requestSdk: (class method).
RCT_EXPORT_METHOD(requestIamSdk:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    __weak SFMCIamModule *weakSelf = self;
    [SFInAppMessagingFeature requestSdk:^(id<SFInAppMessagingFeatureApi> _Nullable iam) {
        SFMCIamModule *strongSelf = weakSelf;
        if (iam != nil && strongSelf != nil) {
            // Subscribe this bridge as the IAM lifecycle delegate so JS receives
            // sfmc_iam_will_show / sfmc_iam_did_show / sfmc_iam_did_close events.
            // Selector sourced from discovery: SFInAppMessagingFeature.setEventDelegate:.
            [iam setEventDelegate:strongSelf];
        }
        resolve(nil);
    }];
}

#pragma mark - SFMCSdkInAppMessageEventDelegate

// Discovery: shouldShow(inAppMessage:) → shouldShowInAppMessage: returns Bool.
- (BOOL)shouldShowInAppMessage:(id)inAppMessage {
    if (_hasListeners) {
        [self sendEventWithName:@"sfmc_iam_will_show"
                           body:[SFMCIamModule serializeInAppMessage:inAppMessage]];
    }
    return YES;
}

// Discovery: didShow(inAppMessage:) → didShowInAppMessage: returns Void.
- (void)didShowInAppMessage:(id)inAppMessage {
    if (_hasListeners) {
        [self sendEventWithName:@"sfmc_iam_did_show"
                           body:[SFMCIamModule serializeInAppMessage:inAppMessage]];
    }
}

// Discovery: didClose(inAppMessage:action:) → didCloseInAppMessage:action: returns Void.
- (void)didCloseInAppMessage:(id)inAppMessage action:(id _Nonnull)action {
    if (_hasListeners) {
        NSMutableDictionary *body = [NSMutableDictionary dictionary];
        NSDictionary *messagePayload = [SFMCIamModule serializeInAppMessage:inAppMessage];
        if (messagePayload != nil) {
            [body addEntriesFromDictionary:messagePayload];
        }
        NSDictionary *closePayload = [SFMCIamModule serializeCloseAction:action];
        if (closePayload != nil) {
            body[@"closeAction"] = closePayload;
        }
        [self sendEventWithName:@"sfmc_iam_did_close" body:body];
    }
}

#pragma mark - Serialization helpers

// InAppMessageDetails members were not fully extracted in the v11 docset
// (see ios-api-discoverer warning). Pull only the JS-side documented field
// (`id`) via KVC, falling back to nil when the SDK type does not expose it.
+ (NSDictionary *)serializeInAppMessage:(id)inAppMessage {
    if (inAppMessage == nil) return nil;
    NSMutableDictionary *out = [NSMutableDictionary dictionary];
    @try {
        id messageId = [inAppMessage valueForKey:@"id"];
        if ([messageId isKindOfClass:[NSString class]]) {
            out[@"messageId"] = messageId;
        }
    } @catch (NSException *exception) {
        // KVC miss — leave messageId absent.
    }
    return out;
}

// InAppMessageCloseAction members were not fully extracted in the v11 docset.
// JS-side type declares `actionType` and optional `id`. Pull both via KVC.
+ (NSDictionary *)serializeCloseAction:(id)action {
    if (action == nil) return nil;
    NSMutableDictionary *out = [NSMutableDictionary dictionary];
    @try {
        id actionType = [action valueForKey:@"actionType"];
        if ([actionType isKindOfClass:[NSString class]]) {
            out[@"actionType"] = actionType;
        } else if (actionType != nil) {
            out[@"actionType"] = [actionType description];
        }
    } @catch (NSException *exception) {}
    @try {
        id actionId = [action valueForKey:@"id"];
        if ([actionId isKindOfClass:[NSString class]]) {
            out[@"id"] = actionId;
        }
    } @catch (NSException *exception) {}
    return out;
}

@end
