#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <ReactCommon/RCTTurboModule.h>
#import <ReactCommon/RCTInteropTurboModule.h>
#import <UserNotifications/UserNotifications.h>
#import <SFMCSDK/SFMCSDK-Swift.h>
#import <InAppMessagingFeatureSDK/InAppMessagingFeatureSDK-Swift.h>

@interface SFMCIamModule : RCTEventEmitter <RCTBridgeModule, RCTTurboModule>
@end

@implementation SFMCIamModule

RCT_EXPORT_MODULE(SFMCIamModule);

- (NSArray<NSString *> *)supportedEvents {
    return @[];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
    return std::make_shared<facebook::react::ObjCInteropTurboModule>(params);
}

RCT_EXPORT_METHOD(addListener:(NSString *)eventName) {}
RCT_EXPORT_METHOD(removeListeners:(double)count) {}

RCT_EXPORT_METHOD(requestIamSdk:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [SFInAppMessagingFeature requestSdk:^(id<SFInAppMessagingFeatureApi> _Nullable iam) {
        resolve(nil);
    }];
}

RCT_EXPORT_METHOD(showInAppMessage:(NSString *)messageId) {
    [SFInAppMessagingFeature requestSdk:^(id<SFInAppMessagingFeatureApi> _Nullable iam) {
        [iam showInAppMessageWithMessageId:messageId];
    }];
}

@end
