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

static NSString *const kEventUrlAction = @"sfmc_push_url_action";

@interface SFMCPushModule : RCTEventEmitter <RCTBridgeModule, RCTTurboModule,
                                             SFMCSdkURLHandlingDelegate>
@end

@implementation SFMCPushModule {
    // Tracks whether JS currently has listeners attached. The native delegate
    // stays registered until JS disables it, but JS subscriptions come and go
    // (e.g. a screen unmounts). Emitting with no listeners logs a warning, so we
    // gate emissions on this flag, set via start/stopObserving.
    BOOL _hasListeners;
}

RCT_EXPORT_MODULE(SFMCPushModule);

- (NSArray<NSString *> *)supportedEvents {
    return @[kEventUrlAction];
}

- (void)startObserving {
    _hasListeners = YES;
}

- (void)stopObserving {
    _hasListeners = NO;
}

// Emit only when JS has listeners attached, avoiding the
// "Sending `<event>` with no listeners registered" warning.
- (void)emitEvent:(NSString *)name body:(id)body {
    if (!_hasListeners) return;
    [self sendEventWithName:name body:body];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
    return std::make_shared<facebook::react::ObjCInteropTurboModule>(params);
}

// The TS spec declares these; chain to RCTEventEmitter so its listener counting
// runs and start/stopObserving fire (which drive _hasListeners). Overriding with
// empty bodies would suppress that counting and silently drop all events.
RCT_EXPORT_METHOD(addListener:(NSString *)eventName) {
    [super addListener:eventName];
}
RCT_EXPORT_METHOD(removeListeners:(double)count) {
    [super removeListeners:count];
}

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

// ── URL handling ────────────────────────────────────────────────────────────
// Routes URLs from push notifications to JS via the kEventUrlAction event
// instead of letting the SDK open them directly. iOS-only; Android has no URL
// handling delegate.

RCT_EXPORT_METHOD(setURLHandlingEnabled:(BOOL)enabled) {
    __weak __typeof(self) weakSelf = self;
    [SFPushFeature requestSdk:^(id<SFPushFeatureApi> _Nullable push) {
        [push setURLHandlingDelegate:enabled ? weakSelf : nil];
    }];
}

#pragma mark - SFMCSdkURLHandlingDelegate
// Selector: sfmc_handleURL:type: — receives the tapped URL and a type string.

- (void)sfmc_handleURL:(NSURL *)url type:(NSString *)type {
    [self emitEvent:kEventUrlAction
               body:@{ @"url": url.absoluteString ?: [NSNull null],
                       @"type": type ?: [NSNull null] }];
}

#pragma mark - Teardown

// Best-effort cleanup if JS never disabled the delegate before bridge teardown.
- (void)invalidate {
    [SFPushFeature requestSdk:^(id<SFPushFeatureApi> _Nullable push) {
        [push setURLHandlingDelegate:nil];
    }];
    [super invalidate];
}

@end
