#import "NotificationViewController.h"

@implementation NotificationViewController

- (SFMCContentExtensionConfig *)sfmcProvideConfig {
    SFMCExtensionSdkLogLevel logLevel = SFMCExtensionSdkLogLevelNone;
#if DEBUG
    logLevel = SFMCExtensionSdkLogLevelDebug;
#endif
    return [[SFMCContentExtensionConfig alloc] initWithLogLevel:logLevel timeoutIntervalForRequest:30.0];
}

@end
