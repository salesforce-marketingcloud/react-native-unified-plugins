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
    return @[@"sfmc_mam_registration"];
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

// ── Registration callback ──────────────────────────────────────────────────────

RCT_EXPORT_METHOD(setRegistrationCallback) {
    __weak typeof(self) weakSelf = self;
    [SFMobileAppMessaging requestSdk:^(id<SFMobileAppMessagingApi> _Nullable mam) {
        [mam setRegistrationCallback:^(NSDictionary * _Nonnull registration) {
            [weakSelf sendEventWithName:@"sfmc_mam_registration" body:registration];
        }];
    }];
}

RCT_EXPORT_METHOD(unsetRegistrationCallback) {
    [SFMobileAppMessaging requestSdk:^(id<SFMobileAppMessagingApi> _Nullable mam) {
        [mam unsetRegistrationCallback];
    }];
}

@end
