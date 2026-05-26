// MAMModule.mm
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
    __weak __typeof(self) weakSelf = self;
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

// Best-effort cleanup if JS never called unsetRegistrationCallback before bridge
// teardown. The block uses weakSelf so ARC already releases the module, but the
// SDK keeps invoking the dead block forever — clear it here.
- (void)invalidate {
    [SFMobileAppMessaging requestSdk:^(id<SFMobileAppMessagingApi> _Nullable mam) {
        [mam unsetRegistrationCallback];
    }];
    [super invalidate];
}

@end
