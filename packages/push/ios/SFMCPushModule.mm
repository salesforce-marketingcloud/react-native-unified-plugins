#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <ReactCommon/RCTTurboModule.h>
#import <ReactCommon/RCTInteropTurboModule.h>
#import <UserNotifications/UserNotifications.h>
#import <SFMCSDK/SFMCSDK-Swift.h>
#import <PushFeatureSDK/PushFeatureSDK-Swift.h>

@interface SFMCPushModule : RCTEventEmitter <RCTBridgeModule, RCTTurboModule>
@end

@implementation SFMCPushModule

RCT_EXPORT_MODULE(SFMCPushModule);

- (NSArray<NSString *> *)supportedEvents {
    return @[];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
    return std::make_shared<facebook::react::ObjCInteropTurboModule>(params);
}

RCT_EXPORT_METHOD(addListener:(NSString *)eventName) {}
RCT_EXPORT_METHOD(removeListeners:(double)count) {}

// ── Push readiness ────────────────────────────────────────────────────────────
// Push has independent readiness state — must call requestSdk:, do NOT resolve immediately.
RCT_EXPORT_METHOD(requestPushSdk:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFPushFeature requestSdk:^(id<SFPushFeatureApi> _Nullable push) {
        resolve(nil);
    }];
}

// ── Push toggle ───────────────────────────────────────────────────────────────
// enablePush/disablePush do NOT exist on SFPushFeatureApi.
// The only selector is setPushEnabledWithPushEnabled:(BOOL) — verified from discovery.

RCT_EXPORT_METHOD(enablePush) {
    [SFPushFeature requestSdk:^(id<SFPushFeatureApi> _Nullable push) {
        [push setPushEnabledWithPushEnabled:YES];
    }];
}

RCT_EXPORT_METHOD(disablePush) {
    [SFPushFeature requestSdk:^(id<SFPushFeatureApi> _Nullable push) {
        [push setPushEnabledWithPushEnabled:NO];
    }];
}

RCT_EXPORT_METHOD(isPushEnabled:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFPushFeature requestSdk:^(id<SFPushFeatureApi> _Nullable push) {
        resolve(@([push isPushEnabled]));
    }];
}

// ── Device token ──────────────────────────────────────────────────────────────
// Verified from discovery: deviceToken selector on SFPushFeatureApi (returns String?).

RCT_EXPORT_METHOD(getSystemToken:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFPushFeature requestSdk:^(id<SFPushFeatureApi> _Nullable push) {
        resolve([push deviceToken]);
    }];
}

@end
