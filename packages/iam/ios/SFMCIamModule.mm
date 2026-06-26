// SFMCIamModule.mm
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
// provided with the distribution. Neither the name of the copyright holder nor
// the names of its contributors may be used to endorse or promote products
// derived from this software without specific prior written permission.
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
#import <InAppMessagingFeatureSDK/InAppMessagingFeatureSDK-Swift.h>

// Generated header for this pod's Swift sources (SFMCIamSerializer). The
// message/close-action serialization lives in Swift so it can call the typed
// SFMCSDK API directly — the close-action accessors are plain Swift (non-@objc)
// and unreachable via KVC, and the message `type` is an Int-backed enum that KVC
// would surface as an opaque number rather than its string name.
// The framework-qualified path resolves under use_frameworks!; the bare name is
// the fallback for a static-library build.
#if __has_include(<SFMCIam/SFMCIam-Swift.h>)
#import <SFMCIam/SFMCIam-Swift.h>
#else
#import "SFMCIam-Swift.h"
#endif

static NSString *const kEventWillShow = @"sfmc_iam_will_show";
static NSString *const kEventDidShow = @"sfmc_iam_did_show";
static NSString *const kEventDidClose = @"sfmc_iam_did_close";
// Emitted (decision mode only) to ask JS whether a message should display. JS
// replies via resolveInAppMessageDecision:show:. See the decision-handler block.
static NSString *const kEventDecisionRequest = @"sfmc_iam_decision_request";

@interface SFMCIamModule : RCTEventEmitter <RCTBridgeModule, RCTTurboModule,
                                            SFMCSdkInAppMessageEventDelegate>
@end

@implementation SFMCIamModule {
    // Tracks whether JS currently has listeners attached. The native delegate
    // stays registered for the whole session, but JS subscriptions come and go
    // (e.g. a screen unmounts). Emitting with no listeners logs a warning, so we
    // gate emissions on this flag, set via start/stopObserving.
    BOOL _hasListeners;

    // Defer-then-reshow decision mode (mirrors the Flutter plugin). When JS
    // registers a decision handler, shouldShow can no longer answer from the
    // static filter — it must ask JS. Since the delegate is synchronous and JS
    // replies asynchronously, we defer: return NO now, emit a decision-request
    // event, and re-show via showInAppMessage if JS approves. _approvedIds
    // records ids approved for exactly one re-show so the re-show pass returns
    // YES once and does not loop.
    //
    // All three are guarded by _decisionLock: _decisionEnabled and _approvedIds
    // are read on the SDK thread (shouldShow) and written on the bridge thread
    // (setDecisionHandlerEnabled / resolveInAppMessageDecision).
    BOOL _decisionEnabled;
    NSMutableSet<NSString *> *_approvedIds;
    NSLock *_decisionLock;
}

RCT_EXPORT_MODULE(SFMCIamModule);

#pragma mark - TurboModule / RCTEventEmitter setup

- (instancetype)init {
    if (self = [super init]) {
        _hasListeners = NO;
        _decisionEnabled = NO;
        _approvedIds = [NSMutableSet set];
        _decisionLock = [[NSLock alloc] init];
    }
    return self;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[kEventWillShow, kEventDidShow, kEventDidClose, kEventDecisionRequest];
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

#pragma mark - Exported JS methods

RCT_EXPORT_METHOD(requestIamSdk:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    __weak __typeof(self) weakSelf = self;
    [SFInAppMessagingFeature requestSdk:^(id<SFInAppMessagingFeatureApi> _Nullable iam) {
        // Register the lifecycle delegate once the module is ready so the
        // shouldShow/didShow/didClose events flow for the whole session
        // (mirrors the Flutter plugin). JS gates emission via its listener
        // count, so there is no separate enable toggle.
        [iam setEventDelegate:weakSelf];
        resolve(nil);
    }];
}

RCT_EXPORT_METHOD(showInAppMessage:(NSString *)messageId) {
    [SFInAppMessagingFeature requestSdk:^(id<SFInAppMessagingFeatureApi> _Nullable iam) {
        [iam showInAppMessageWithMessageId:messageId];
    }];
}

RCT_EXPORT_METHOD(setFont:(NSString *)name) {
    [SFInAppMessagingFeature requestSdk:^(id<SFInAppMessagingFeatureApi> _Nullable iam) {
        [iam setInAppMessageFontWithName:name];
    }];
}

RCT_EXPORT_METHOD(setStatusBarColor:(double)color) {
    // Android-only API. iOS has no status bar color control on the IAM feature —
    // no-op for parity.
}

// Enable/disable the per-message JS decision handler. When enabled, shouldShow
// defers to JS (see the delegate below) instead of the static filter. Disabling
// clears any pending one-shot approvals so a later re-enable starts clean.
RCT_EXPORT_METHOD(setDecisionHandlerEnabled:(BOOL)enabled) {
    [_decisionLock lock];
    _decisionEnabled = enabled;
    if (!enabled) [_approvedIds removeAllObjects];
    [_decisionLock unlock];
}

// JS's reply to a kEventDecisionRequest. On approval, mark the id for a single
// re-show and ask the SDK to present it again; the next shouldShow pass for that
// id returns YES once. On rejection there is nothing to do — the message was
// already suppressed when shouldShow returned NO.
RCT_EXPORT_METHOD(resolveInAppMessageDecision:(NSString *)messageId
                  show:(BOOL)show) {
    if (!show || messageId == nil) return;
    [_decisionLock lock];
    [_approvedIds addObject:messageId];
    [_decisionLock unlock];
    [SFInAppMessagingFeature requestSdk:^(id<SFInAppMessagingFeatureApi> _Nullable iam) {
        [iam showInAppMessageWithMessageId:messageId];
    }];
}

#pragma mark - SFMCSdkInAppMessageEventDelegate
// Selectors: shouldShowInAppMessage: / didShowInAppMessage: /
// didCloseInAppMessage:action: — each receives an InAppMessageDetails.

- (BOOL)shouldShowInAppMessage:(id)message {
    NSDictionary *serialized = [self serializeMessage:message];
    id rawId = serialized[@"id"];
    NSString *messageId = [rawId isKindOfClass:[NSString class]] ? rawId : nil;

    [_decisionLock lock];
    BOOL deciding = _decisionEnabled;
    // Re-show pass for a message JS already approved: allow it through once.
    BOOL preApproved = messageId != nil && [_approvedIds containsObject:messageId];
    if (preApproved) [_approvedIds removeObject:messageId];
    [_decisionLock unlock];

    if (deciding) {
        // First pass: defer to JS. The pre-approved re-show pass skips the
        // observational will-show event (it already fired on the first pass)
        // and returns YES so the SDK displays the message now.
        if (preApproved) return YES;
        [self emitEvent:kEventWillShow body:serialized];
        [self emitEvent:kEventDecisionRequest body:serialized];
        return NO;
    }

    // No decision handler registered: emit the observational will-show event and
    // let the SDK display the message (default behavior).
    [self emitEvent:kEventWillShow body:serialized];
    return YES;
}

- (void)didShowInAppMessage:(id)message {
    [self emitEvent:kEventDidShow body:[self serializeMessage:message]];
}

- (void)didCloseInAppMessage:(id)message action:(SFMCSdkInAppMessageCloseAction *)action {
    NSMutableDictionary *body = [[self serializeMessage:message] mutableCopy];
    body[@"action"] = [self serializeCloseAction:action];
    [self emitEvent:kEventDidClose body:body];
}

#pragma mark - Serialization
// Both message and close-action serialization are delegated to the Swift shim
// (SFMCIamSerializer): it reads the typed SFMCSDK API directly, surfaces the
// JSON-safe scalar fields of InAppMessageDetails, normalizes the Int-backed
// `type` to its string name, and skips the nested object graph
// (title/body/media/buttons/styling), which JS treats as a loose passthrough.

- (NSDictionary *)serializeMessage:(id<SFMCSdkInAppMessageDetails>)message {
    if (!message) return @{ @"id": [NSNull null] };
    return [SFMCIamSerializer serializeMessage:message];
}

- (NSDictionary *)serializeCloseAction:(SFMCSdkInAppMessageCloseAction *)action {
    // InAppMessageCloseAction exposes its data only via getDismissReason() /
    // getId(), which are plain Swift (non-@objc) methods over private stored
    // properties — unreachable from Objective-C++ through respondsToSelector: or
    // KVC. The Swift shim calls the typed API and normalizes the dismiss reason
    // to the union shared with Android (AUTO | BUTTON | CLOSED | UNKNOWN).
    if (!action) return @{};
    return [SFMCIamSerializer serializeCloseAction:action];
}

#pragma mark - Teardown

// Best-effort cleanup if JS never disabled the delegate before bridge teardown.
- (void)invalidate {
    [SFInAppMessagingFeature requestSdk:^(id<SFInAppMessagingFeatureApi> _Nullable iam) {
        [iam setEventDelegate:nil];
    }];
    [super invalidate];
}

@end
