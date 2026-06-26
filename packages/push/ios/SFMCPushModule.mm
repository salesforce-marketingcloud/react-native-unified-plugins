// SFMCPushModule.mm
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

RCT_EXPORT_METHOD(getPushToken:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFPushFeature requestSdk:^(id<SFPushFeatureApi> _Nullable push) {
        resolve([push deviceToken]);
    }];
}

@end
