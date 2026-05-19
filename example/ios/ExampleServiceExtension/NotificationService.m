#import "NotificationService.h"

@implementation NotificationService

- (SFMCNotificationServiceConfig *)sfmcProvideConfig {
    enum SFMCExtensionSdkLogLevel logLevel = SFMCExtensionSdkLogLevelNone;
#if DEBUG
    logLevel = SFMCExtensionSdkLogLevelDebug;
#endif
    return [[SFMCNotificationServiceConfig alloc] initWithLogLevel:logLevel
                                       shouldShowCarouselThumbnail:YES];
}

@end
