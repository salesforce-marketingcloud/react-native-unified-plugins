#import "NotificationService.h"

@implementation NotificationService

// Provide SFNotificationServiceConfig configuration
- (SFMCNotificationServiceConfig *)sfmcProvideConfig {
    SFMCExtensionSdkLogLevel logLevel = SFMCExtensionSdkLogLevelNone;
#if DEBUG
    logLevel = SFMCExtensionSdkLogLevelDebug;
#endif
    return [[SFMCNotificationServiceConfig alloc] initWithLogLevel:logLevel shouldShowCarouselThumbnail:YES];
}

// Custom processing when notification is received
-(void)sfmcDidReceiveRequest:(UNNotificationRequest *)request mutableContent:(UNMutableNotificationContent *)mutableContent withContentHandler:(void (^)(NSDictionary * _Nullable))contentHandler {
    
    [self addMediaToContent:mutableContent completion:^{
        contentHandler(nil);
    }];
}

// Download and attach media
- (void)addMediaToContent:(UNMutableNotificationContent *)mutableContent
               completion:(void (^)(void))completion {
    
    NSString *mediaUrlString = mutableContent.userInfo[@"_mediaUrl"];
    if (mediaUrlString == nil || mediaUrlString.length == 0) {
        completion();
        return;
    }
    
    NSURL *mediaUrl = [NSURL URLWithString:mediaUrlString];
    if (!mediaUrl) {
        completion();
        return;
    }
    
    NSURLSession *session = [NSURLSession sessionWithConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration]];
    
    NSURLSessionDownloadTask *downloadTask = [session downloadTaskWithURL:mediaUrl
                                                        completionHandler:^(NSURL * _Nullable location,
                                                                            NSURLResponse * _Nullable response,
                                                                            NSError * _Nullable error) {
        if (error) {
            completion();
            return;
        }
        
        if (!location || ![response isKindOfClass:[NSHTTPURLResponse class]]) {
            completion();
            return;
        }
        
        NSInteger statusCode = ((NSHTTPURLResponse *)response).statusCode;
        if (statusCode < 200 || statusCode > 299) {
            completion();
            return;
        }
        
        NSString *fileName = mediaUrl.lastPathComponent;
        NSString *destinationPath = [[location.path stringByAppendingString:fileName] copy];
        NSURL *localMediaUrl = [NSURL fileURLWithPath:destinationPath];
        
        [[NSFileManager defaultManager] removeItemAtURL:localMediaUrl error:nil];
        
        NSError *fileError;
        [[NSFileManager defaultManager] moveItemAtURL:location toURL:localMediaUrl error:&fileError];
        if (fileError) {
            completion();
            return;
        }
        
        UNNotificationAttachment *attachment = [UNNotificationAttachment attachmentWithIdentifier:@"SomeAttachmentId"
                                                                                              URL:localMediaUrl
                                                                                          options:nil
                                                                                            error:nil];
        if (attachment) {
            mutableContent.attachments = @[attachment];
        }
        
        completion();
    }];
    
    [downloadTask resume];
}

@end
