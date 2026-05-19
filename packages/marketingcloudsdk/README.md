# SFMC MarketingCloud SDK (Engagement)

> Salesforce Marketing Cloud Engagement SDK for React Native — inbox, registration, tags, attributes, analytics.

## Installation

```bash
yarn add @salesforce-mc/react-native-marketingcloudsdk
# or
npm install @salesforce-mc/react-native-marketingcloudsdk
```

iOS:
```bash
cd ios && pod install
```

Android: no additional steps — Gradle autolinking discovers the module automatically.

### Required SDK configuration

- **Android** — initialize in your `MainApplication.kt` via `SFMCSdk.configure(...)`. See `example/android/app/src/main/java/com/sfmcexample/MainApplication.kt` in the bundled example app.
- **iOS** — initialize in your `AppDelegate.swift` via `SFMCSdk.initializeSdk(...)`. See `example/ios/SFMCExample/AppDelegate.swift`.
- Configure Firebase (Android) and APNs (iOS) credentials before push will deliver.

## Usage

```ts
import { MarketingCloudSdkModule, MCModule } from '@salesforce-mc/react-native-marketingcloudsdk';
import type { InboxMessage } from '@salesforce-mc/react-native-marketingcloudsdk';

// Either form resolves to the same module
const mc = await MCModule.requestSdk();

// Inbox
await mc.refreshInbox();
const allMsgs: InboxMessage[] = await mc.getAllMessages();
const unreadCount = await mc.getUnreadMessageCount();
mc.markMessageRead('message-id');

// Tags + attributes
mc.addTag('beta-tester');
const tags = await mc.getTags();

// Device id
const deviceId = await mc.getDeviceId();
```

## Notes

Installing this package auto-resolves the shared `sfmc-core`, `push`, and `iam` packages — install once, get all of them.

## Versions

- React Native: 0.85.1 (New Architecture mandatory)
- Android SFMC SDK: 11.0 umbrella (sfmcsdk 3.1.0, marketingcloudsdk 11.0.0, pushfeaturemodule 2.0.0, inappmessagingfeaturemodule 1.0.0, mobileappmessagingsdk 1.1.0)
- iOS SFMC SDK: 11.0 umbrella (MarketingCloudSDK 11.0.0, MarketingCloud-SFMCSdk 4.0.1, SFPushFeatureSDK 2.0.0, SFInAppMessagingFeatureSDK 1.0.0, SFMobileAppMessagingSDK 2.0.0)

## License

MIT
