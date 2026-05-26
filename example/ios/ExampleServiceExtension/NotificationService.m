#import "NotificationService.h"
#import <UserNotifications/UserNotifications.h>
#import <CoreGraphics/CoreGraphics.h>
#import <UniformTypeIdentifiers/UniformTypeIdentifiers.h>

NSString * const CUSTOM_KEY = @"ObjCTestServiceExtensionCustomKey";
NSString * const CUSTOM_VALUE = @"ObjCTestServiceExtensionCustomValue";

static NSString * const MEDIA_URL_KEY = @"_mediaUrl";
static NSString * const ALT_TEXT_KEY = @"_mediaAlt";
static NSString * const DEFAULT_MEDIA_EXTENSION = @".jpg";

@interface NotificationService ()

@end

@implementation NotificationService

- (SFMCNotificationServiceConfig *)sfmcProvideConfig {
    return [[SFMCNotificationServiceConfig alloc] initWithLogLevel:SFMCExtensionSdkLogLevelDebug shouldShowCarouselThumbnail:YES];
}

- (void)sfmcDidReceiveRequest:(UNNotificationRequest *)request mutableContent:(UNMutableNotificationContent *)mutableContent withContentHandler:(void (^)(NSDictionary *))contentHandler {
    NSString *mediaUrlString = mutableContent.userInfo[MEDIA_URL_KEY];
    if (mediaUrlString) {
        __weak typeof(self) weakSelf = self;
        [self downloadMediaAndSetAttachmentForMediaUrl:mediaUrlString
                                        mutableContent:mutableContent
                                     completionHandler:^(BOOL isAttachmentAddSuccess) {
            __strong typeof(weakSelf) strongSelf = weakSelf;
            if (!strongSelf) {
                contentHandler(nil);
                return;
            }
            
            if (!isAttachmentAddSuccess) {
                [strongSelf setAltTextForMutableContent:mutableContent];
            }
            
            contentHandler(@{CUSTOM_KEY: CUSTOM_VALUE});
        }];
    } else {
        // No media URL found in the payload
        contentHandler(@{CUSTOM_KEY: CUSTOM_VALUE});
    }
}

- (void)downloadMediaAndSetAttachmentForMediaUrl:(NSString *)mediaUrlValue
                                  mutableContent:(UNMutableNotificationContent *)mutableContent
                               completionHandler:(void (^)(BOOL isAttachSuccess))completionHandler {
    NSURL *mediaUrl = [NSURL URLWithString:mediaUrlValue];
    if (!mediaUrl) {
        completionHandler(NO);
        return;
    }
    
    NSURLSessionConfiguration *config = [NSURLSessionConfiguration defaultSessionConfiguration];
    NSURLSession *session = [NSURLSession sessionWithConfiguration:config];
    
    __weak typeof(self) weakSelf = self;
    NSURLSessionDownloadTask *downloadTask = [session downloadTaskWithURL:mediaUrl
                                                        completionHandler:^(NSURL *location, NSURLResponse *response, NSError *error) {
        __strong typeof(weakSelf) strongSelf = weakSelf;
        [strongSelf handleDownloadTaskResponseWithMutableContent:mutableContent
                                                        location:location
                                                        response:response
                                                           error:error
                                               completionHandler:completionHandler];
    }];
    [downloadTask resume];
}

- (void)handleDownloadTaskResponseWithMutableContent:(UNMutableNotificationContent *)mutableContent
                                            location:(NSURL *)location
                                            response:(NSURLResponse *)response
                                               error:(NSError *)error
                                   completionHandler:(void (^)(BOOL isAttachSuccess))completionHandler {
    NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
    
    if (!httpResponse || httpResponse.statusCode < 200 || httpResponse.statusCode > 299 || !location) {
        completionHandler(NO);
        return;
    }
    
    NSString *fileExtension = [self fileExtensionFromMimeType:httpResponse.MIMEType];
    NSURL *localMediaUrl = [NSURL fileURLWithPath:[location.path stringByAppendingString:fileExtension]];
    
    // Remove file if it exists
    [[NSFileManager defaultManager] removeItemAtURL:localMediaUrl error:nil];
    
    NSError *moveError = nil;
    if (![[NSFileManager defaultManager] moveItemAtURL:location toURL:localMediaUrl error:&moveError]) {
        completionHandler(NO);
        return;
    }
    
    UNNotificationAttachment *mediaAttachment = [self createMediaAttachmentForLocalUrl:localMediaUrl];
    if (!mediaAttachment) {
        completionHandler(NO);
        return;
    }
    
    mutableContent.attachments = @[mediaAttachment];
    completionHandler(YES);
}

- (UNNotificationAttachment *)createMediaAttachmentForLocalUrl:(NSURL *)localMediaUrl {
    CGRect clipRect = CGRectZero;
    NSDictionary *options = @{
        UNNotificationAttachmentOptionsThumbnailHiddenKey: @NO,
        UNNotificationAttachmentOptionsThumbnailClippingRectKey: (__bridge id)CGRectCreateDictionaryRepresentation(clipRect)
    };
    
    NSError *error = nil;
    UNNotificationAttachment *attachment = [UNNotificationAttachment attachmentWithIdentifier:@"attachmentIdentifier"
                                                                                          URL:localMediaUrl
                                                                                      options:options
                                                                                        error:&error];
    return attachment;
}

- (NSString *)fileExtensionFromMimeType:(NSString *)mimeType {
    NSString *fileExtension = DEFAULT_MEDIA_EXTENSION;
    
    if (!mimeType) {
        return fileExtension;
    }
    
    if (@available(iOS 14.0, *)) {
        UTType *type = [UTType typeWithMIMEType:mimeType];
        NSString *ext = type.preferredFilenameExtension;
        if (ext) {
            fileExtension = [@"." stringByAppendingString:ext];
        }
    }
    
    return fileExtension;
}

- (void)setAltTextForMutableContent:(UNMutableNotificationContent *)mutableContent {
    NSString *mediaAltText = mutableContent.userInfo[ALT_TEXT_KEY];
    if (mediaAltText && mediaAltText.length > 0) {
        mutableContent.body = mediaAltText;
    }
}

@end
