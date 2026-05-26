#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <ReactCommon/RCTTurboModule.h>
#import <ReactCommon/RCTInteropTurboModule.h>
#import <SFMCSDK/SFMCSDK-Swift.h>
#import "EventUtility.h"

@interface SFMCSdkCoreModule : RCTEventEmitter <RCTBridgeModule, RCTTurboModule>
@end

@implementation SFMCSdkCoreModule

RCT_EXPORT_MODULE(SFMCSdkCoreModule);

- (NSArray<NSString *> *)supportedEvents {
    return @[];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
    return std::make_shared<facebook::react::ObjCInteropTurboModule>(params);
}

RCT_EXPORT_METHOD(addListener:(NSString *)eventName) {}
RCT_EXPORT_METHOD(removeListeners:(double)count) {}

// Core module only: SFMCSdk is initialised in AppDelegate before RN starts — resolve immediately.
RCT_EXPORT_METHOD(requestSfmcSdk:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(nil);
}

// ── Identity — profile ────────────────────────────────────────────────────────

RCT_EXPORT_METHOD(getProfileId:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    id<SFIdentityInfo> info = [SFMCSdk.identity get];
    resolve(info.profileId);
}

RCT_EXPORT_METHOD(setProfileId:(NSString *)profileId) {
    [SFMCSdk.identity editWithIdentity:^id<SFIdentityModifier>(id<SFIdentityModifier> _Nonnull editor) {
        editor.profileId = profileId;
        return editor;
    }];
}

// ── Identity — party identification ──────────────────────────────────────────

RCT_EXPORT_METHOD(getPartyIdentificationName:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    id<SFIdentityInfo> info = [SFMCSdk.identity get];
    resolve(info.partyIdentificationName);
}

RCT_EXPORT_METHOD(setPartyIdentificationName:(NSString *)name) {
    [SFMCSdk.identity editWithIdentity:^id<SFIdentityModifier>(id<SFIdentityModifier> _Nonnull editor) {
        editor.partyIdentificationName = name;
        return editor;
    }];
}

RCT_EXPORT_METHOD(getPartyIdentificationNumber:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    id<SFIdentityInfo> info = [SFMCSdk.identity get];
    resolve(info.partyIdentificationNumber);
}

RCT_EXPORT_METHOD(setPartyIdentificationNumber:(NSString *)number) {
    [SFMCSdk.identity editWithIdentity:^id<SFIdentityModifier>(id<SFIdentityModifier> _Nonnull editor) {
        editor.partyIdentificationNumber = number;
        return editor;
    }];
}

RCT_EXPORT_METHOD(getPartyIdentificationType:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    id<SFIdentityInfo> info = [SFMCSdk.identity get];
    resolve(info.partyIdentificationType);
}

RCT_EXPORT_METHOD(setPartyIdentificationType:(NSString *)type) {
    [SFMCSdk.identity editWithIdentity:^id<SFIdentityModifier>(id<SFIdentityModifier> _Nonnull editor) {
        editor.partyIdentificationType = type;
        return editor;
    }];
}

// ── Identity — attributes ────────────────────────────────────────────────────
// Attribute operations use named selectors on SFIdentityModifier — NOT direct property access.

RCT_EXPORT_METHOD(setAttribute:(NSString *)key value:(NSString *)value) {
    [SFMCSdk.identity editWithIdentity:^id<SFIdentityModifier>(id<SFIdentityModifier> _Nonnull editor) {
        [editor addAttributeWithKey:key value:value];
        return editor;
    }];
}

RCT_EXPORT_METHOD(clearAttribute:(NSString *)key) {
    [SFMCSdk.identity editWithIdentity:^id<SFIdentityModifier>(id<SFIdentityModifier> _Nonnull editor) {
        [editor clearAttributeWithKey:key];
        return editor;
    }];
}

RCT_EXPORT_METHOD(setAttributes:(NSDictionary *)attributes) {
    [SFMCSdk.identity editWithIdentity:^id<SFIdentityModifier>(id<SFIdentityModifier> _Nonnull editor) {
        [editor addAttributesWithAttributes:attributes];
        return editor;
    }];
}

RCT_EXPORT_METHOD(getAttributes:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    id<SFIdentityInfo> info = [SFMCSdk.identity get];
    resolve(info.attributes);
}

RCT_EXPORT_METHOD(clearAllAttributes) {
    [SFMCSdk.identity editWithIdentity:^id<SFIdentityModifier>(id<SFIdentityModifier> _Nonnull editor) {
        [editor clearAllAttributes];
        return editor;
    }];
}

// ── Event tracking ────────────────────────────────────────────────────────────
// Events are parsed by EventUtility which converts JS event dictionaries to SFMCSdkCustomEvent.
// iOS SDK v11 only exposes `CustomEvent` — non-custom JS event types (cart/order/catalog) are
// coerced to CustomEvent with synthesised name and flattened attributes.

RCT_EXPORT_METHOD(track:(NSDictionary *)event) {
    id sdkEvent = [EventUtility eventFromDictionary:event];
    if (sdkEvent) [SFMCSdk trackWithEvent:sdkEvent];
}

RCT_EXPORT_METHOD(sendImmediate:(NSDictionary *)event) {
    id sdkEvent = [EventUtility eventFromDictionary:event];
    if (sdkEvent) [SFMCSdk sendImmediateWithEvent:sdkEvent];
}

RCT_EXPORT_METHOD(flush) {
    [SFMCSdk flush];
}

// ── SDK state + version ───────────────────────────────────────────────────────

// [SFMCSdk state] returns NSString* JSON — parse before resolving so both platforms return an object.
RCT_EXPORT_METHOD(getSdkState:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *stateJson = [SFMCSdk state];
    NSData *data = [stateJson dataUsingEncoding:NSUTF8StringEncoding];
    NSError *error = nil;
    id parsed = data ? [NSJSONSerialization JSONObjectWithData:data options:0 error:&error] : nil;
    resolve(parsed ?: stateJson);
}

// ── Logging ───────────────────────────────────────────────────────────────────
// Selector `setLoggerWithLogLevel:logOutputter:` is from ios discovery.

RCT_EXPORT_METHOD(setLogging:(NSString *)level) {
    NSString *lower = [level lowercaseString];
    SFMCSdkLogLevel logLevel;
    if ([lower isEqualToString:@"debug"]) {
        logLevel = SFMCSdkLogLevelDebug;
    } else if ([lower isEqualToString:@"warn"]) {
        logLevel = SFMCSdkLogLevelWarn;
    } else if ([lower isEqualToString:@"error"]) {
        logLevel = SFMCSdkLogLevelError;
    } else {
        logLevel = SFMCSdkLogLevelNone;
    }
    [SFMCSdk setLoggerWithLogLevel:logLevel logOutputter:nil];
}

@end
