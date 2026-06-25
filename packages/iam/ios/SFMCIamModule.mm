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
static NSString *const kEventUrlAction = @"sfmc_iam_url_action";

#pragma mark - Message filter (immutable snapshot)

// An immutable snapshot of the JS-supplied per-message rules. Mirrors Android's
// MessageFilter: the whole object is swapped atomically and never mutated in
// place, so the shouldShow delegate (called on the SDK thread) always reads one
// consistent set of rules even while setMessageFilter (bridge thread) replaces
// it. See _filter below.
@interface SFMCIamMessageFilter : NSObject
@property (nonatomic, readonly) NSSet<NSString *> *blockedIds;
@property (nonatomic, readonly, nullable) NSSet<NSString *> *allowedIds;  // nil = no allow-list restriction
@property (nonatomic, readonly) BOOL defaultShow;
- (instancetype)initWithBlockedIds:(NSSet<NSString *> *)blockedIds
                        allowedIds:(nullable NSSet<NSString *> *)allowedIds
                       defaultShow:(BOOL)defaultShow;
- (BOOL)shouldShowMessageId:(nullable NSString *)messageId;
@end

@implementation SFMCIamMessageFilter
- (instancetype)initWithBlockedIds:(NSSet<NSString *> *)blockedIds
                        allowedIds:(NSSet<NSString *> *)allowedIds
                       defaultShow:(BOOL)defaultShow {
    if (self = [super init]) {
        _blockedIds = blockedIds;
        _allowedIds = allowedIds;
        _defaultShow = defaultShow;
    }
    return self;
}

// Evaluate the rules against a single message id (blocked wins, then the
// allow-list restricts, otherwise fall back to defaultShow).
- (BOOL)shouldShowMessageId:(NSString *)messageId {
    if (messageId && [_blockedIds containsObject:messageId]) return NO;
    if (_allowedIds != nil) return messageId != nil && [_allowedIds containsObject:messageId];
    return _defaultShow;
}
@end

@interface SFMCIamModule : RCTEventEmitter <RCTBridgeModule, RCTTurboModule,
                                            SFMCSdkInAppMessageEventDelegate,
                                            SFMCSdkURLHandlingDelegate>
// Per-message rules read synchronously inside the shouldShow delegate callback
// (SDK thread); JS replaces them via setMessageFilter (bridge thread). `atomic`
// guarantees the pointer read/write is safe across those threads, and because
// the filter object is immutable, a reader always sees a complete, consistent
// snapshot — never a torn mix of old/new fields.
@property (atomic, strong) SFMCIamMessageFilter *filter;
@end

@implementation SFMCIamModule {
    // Tracks whether JS currently has listeners attached. The native delegate
    // stays registered for the whole session, but JS subscriptions come and go
    // (e.g. a screen unmounts). Emitting with no listeners logs a warning, so we
    // gate emissions on this flag, set via start/stopObserving.
    BOOL _hasListeners;
}

RCT_EXPORT_MODULE(SFMCIamModule);

#pragma mark - TurboModule / RCTEventEmitter setup

- (instancetype)init {
    if (self = [super init]) {
        // Default: no block-list, no allow-list restriction, show everything.
        self.filter = [[SFMCIamMessageFilter alloc] initWithBlockedIds:[NSSet set]
                                                            allowedIds:nil
                                                           defaultShow:YES];
        _hasListeners = NO;
    }
    return self;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[kEventWillShow, kEventDidShow, kEventDidClose, kEventUrlAction];
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
    [SFInAppMessagingFeature requestSdk:^(id<SFInAppMessagingFeatureApi> _Nullable iam) {
        resolve(nil);
    }];
}

RCT_EXPORT_METHOD(setEventDelegateEnabled:(BOOL)enabled) {
    __weak __typeof(self) weakSelf = self;
    [SFInAppMessagingFeature requestSdk:^(id<SFInAppMessagingFeatureApi> _Nullable iam) {
        [iam setEventDelegate:enabled ? weakSelf : nil];
    }];
}

RCT_EXPORT_METHOD(setURLHandlingEnabled:(BOOL)enabled) {
    __weak __typeof(self) weakSelf = self;
    [SFInAppMessagingFeature requestSdk:^(id<SFInAppMessagingFeatureApi> _Nullable iam) {
        [iam setURLHandlingDelegate:enabled ? weakSelf : nil];
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

RCT_EXPORT_METHOD(setMessageFilter:(NSDictionary *)filter) {
    id blocked = filter[@"blockedIds"];
    NSSet *blockedIds = [blocked isKindOfClass:[NSArray class]] ? [NSSet setWithArray:blocked] : [NSSet set];

    id allowed = filter[@"allowedIds"];
    // An empty array means "no allow-list restriction" (per the JS contract),
    // not "allow zero messages" — treat it the same as omitting the key.
    NSSet *allowedIds = ([allowed isKindOfClass:[NSArray class]] && [allowed count] > 0)
        ? [NSSet setWithArray:allowed]
        : nil;

    id def = filter[@"defaultShow"];
    BOOL defaultShow = [def isKindOfClass:[NSNumber class]] ? [def boolValue] : YES;

    // Build the new rules off-thread-safe locals, then publish them in a single
    // atomic pointer swap so the SDK-thread reader never sees a partial update.
    self.filter = [[SFMCIamMessageFilter alloc] initWithBlockedIds:blockedIds
                                                        allowedIds:allowedIds
                                                       defaultShow:defaultShow];
}

#pragma mark - SFMCSdkInAppMessageEventDelegate
// Selectors: shouldShowInAppMessage: / didShowInAppMessage: /
// didCloseInAppMessage:action: — each receives an InAppMessageDetails.

- (BOOL)shouldShowInAppMessage:(id)message {
    NSDictionary *serialized = [self serializeMessage:message];
    [self emitEvent:kEventWillShow body:serialized];
    // The decision must be returned regardless of whether JS is listening.
    // Read the filter once: the atomic getter hands back a consistent immutable
    // snapshot even if setMessageFilter swaps it concurrently.
    id messageId = serialized[@"id"];
    return [self.filter shouldShowMessageId:[messageId isKindOfClass:[NSString class]] ? messageId : nil];
}

- (void)didShowInAppMessage:(id)message {
    [self emitEvent:kEventDidShow body:[self serializeMessage:message]];
}

- (void)didCloseInAppMessage:(id)message action:(SFMCSdkInAppMessageCloseAction *)action {
    NSMutableDictionary *body = [[self serializeMessage:message] mutableCopy];
    body[@"action"] = [self serializeCloseAction:action];
    [self emitEvent:kEventDidClose body:body];
}

#pragma mark - SFMCSdkURLHandlingDelegate
// Selector: sfmc_handleURL:type: — receives the tapped URL and a type string.

- (void)sfmc_handleURL:(NSURL *)url type:(NSString *)type {
    [self emitEvent:kEventUrlAction
               body:@{ @"url": url.absoluteString ?: [NSNull null],
                       @"type": type ?: [NSNull null] }];
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

// Best-effort cleanup if JS never disabled the delegates before bridge teardown.
- (void)invalidate {
    [SFInAppMessagingFeature requestSdk:^(id<SFInAppMessagingFeatureApi> _Nullable iam) {
        [iam setEventDelegate:nil];
        [iam setURLHandlingDelegate:nil];
    }];
    [super invalidate];
}

@end
