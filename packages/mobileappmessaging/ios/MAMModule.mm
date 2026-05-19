#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <ReactCommon/RCTTurboModule.h>
#import <ReactCommon/RCTInteropTurboModule.h>
#import <SFMCSDK/SFMCSDK-Swift.h>
#import <MobileAppMessagingSDK/MobileAppMessagingSDK-Swift.h>

@interface MAMModule : RCTEventEmitter <RCTBridgeModule, RCTTurboModule>
@end

@implementation MAMModule

RCT_EXPORT_MODULE(MAMModule);

- (NSArray<NSString *> *)supportedEvents {
    return @[];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
    return std::make_shared<facebook::react::ObjCInteropTurboModule>(params);
}

// RN event-emitter parity stubs (TS spec declares these — required for Step 7 cross-check)
RCT_EXPORT_METHOD(addListener:(NSString *)eventName) {
    // Handled by RCTEventEmitter
}

RCT_EXPORT_METHOD(removeListeners:(double)count) {
    // Handled by RCTEventEmitter
}

// ── requestMamSdk ─────────────────────────────────────────────────────────────
// MAM has independent readiness state — must call requestSdk:, do NOT resolve immediately.
RCT_EXPORT_METHOD(requestMamSdk:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFMobileAppMessaging requestSdk:^(id<SFMobileAppMessagingApi> _Nullable mam) {
        resolve(nil);
    }];
}

// ── Device ID ─────────────────────────────────────────────────────────────────
// deviceIdentifier is a read-only method on the flat protocol — selector matches name directly.
RCT_EXPORT_METHOD(getDeviceId:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFMobileAppMessaging requestSdk:^(id<SFMobileAppMessagingApi> _Nullable mam) {
        resolve([mam deviceIdentifier]);
    }];
}

// ── Analytics ─────────────────────────────────────────────────────────────────
// Discovery: setAnalyticsEnabled:(BOOL) / isAnalyticsEnabled on SFMobileAppMessagingApi.

RCT_EXPORT_METHOD(enableAnalytics) {
    [SFMobileAppMessaging requestSdk:^(id<SFMobileAppMessagingApi> _Nullable mam) {
        [mam setAnalyticsEnabled:YES];
    }];
}

RCT_EXPORT_METHOD(disableAnalytics) {
    [SFMobileAppMessaging requestSdk:^(id<SFMobileAppMessagingApi> _Nullable mam) {
        [mam setAnalyticsEnabled:NO];
    }];
}

RCT_EXPORT_METHOD(isAnalyticsEnabled:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFMobileAppMessaging requestSdk:^(id<SFMobileAppMessagingApi> _Nullable mam) {
        resolve(@([mam isAnalyticsEnabled]));
    }];
}

// ── Version ───────────────────────────────────────────────────────────────────
// STUB: SFMobileAppMessagingApi (v2.0) does not expose a version selector in iOS discovery.
// Android exposes mam.getVersionName(); the iOS protocol/class has no equivalent class method
// or instance method documented. Emitted as a stub per platform-asymmetry decision —
// returns an empty string so JS consumers receive a defined value.
RCT_EXPORT_METHOD(getVersion:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSLog(@"[MAMModule] getVersion not available in iOS MobileAppMessagingSDK 2.0 — returning empty string");
    resolve(@"");
}

@end
