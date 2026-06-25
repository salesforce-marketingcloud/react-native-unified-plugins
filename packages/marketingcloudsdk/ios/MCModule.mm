// MCModule.mm
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
#import <MarketingCloudSDK/MarketingCloudSDK-Swift.h>
#import "InboxUtility.h"

@interface MCModule : RCTEventEmitter <RCTBridgeModule, RCTTurboModule>
@end

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
        resolve([InboxUtility processInboxMessages:[mc getAllMessages] ?: @[]]);
    }];
}

RCT_EXPORT_METHOD(getUnreadMessages:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        resolve([InboxUtility processInboxMessages:[mc getUnreadMessages] ?: @[]]);
    }];
}

RCT_EXPORT_METHOD(getReadMessages:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        resolve([InboxUtility processInboxMessages:[mc getReadMessages] ?: @[]]);
    }];
}

RCT_EXPORT_METHOD(getDeletedMessages:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        resolve([InboxUtility processInboxMessages:[mc getDeletedMessages] ?: @[]]);
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

// ── Signed string ───────────────────────────────────────────────────────────────
// Discovered selectors: setSignedString: (BOOL return), signedString.
// nil signedString clears the stored token.

RCT_EXPORT_METHOD(setSignedString:(NSString *)signedString
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        resolve(@([mc setSignedString:signedString]));
    }];
}

RCT_EXPORT_METHOD(getSignedString:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFMarketingCloudSdk requestSdk:^(id<MarketingCloudSdkInterface> _Nullable mc) {
        resolve([mc signedString]);
    }];
}

// ── Registration callback ──────────────────────────────────────────────────────
// iOS: setRegistrationCallback: / unsetRegistrationCallback on MarketingCloudSdk

RCT_EXPORT_METHOD(setRegistrationCallback) {
    __weak __typeof(self) weakSelf = self;
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
