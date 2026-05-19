# SFMC Push

> SFMC Push Feature for React Native — FCM/APNs registration, push enable/disable, and push token events.

## Installation

```bash
yarn add @salesforce-mc/react-native-push
# or
npm install @salesforce-mc/react-native-push
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
import { PushModule } from '@salesforce-mc/react-native-push';
import type { PushApi } from '@salesforce-mc/react-native-push';

const push: PushApi = await PushModule.requestSdk();
await push.setPushEnabled(true);
const token = await push.getSystemToken();
const enabled = await push.isPushEnabled();

// Subscribe to token refresh events
const sub = PushModule.getEmitter().addListener('sfmc_push_token_refreshed', ({ token }) => {
  console.log('Token refreshed:', token);
});
```

## Notes

Push registration requires Firebase configuration on Android (`google-services.json` in the example app). On iOS, ensure the example target has Push Notifications and Background Modes (Remote Notifications) capabilities enabled in your Apple Developer account.

## Versions

- React Native: 0.85.1 (New Architecture mandatory)
- Android SFMC SDK: 11.0 umbrella (sfmcsdk 3.1.0, marketingcloudsdk 11.0.0, pushfeaturemodule 2.0.0, inappmessagingfeaturemodule 1.0.0, mobileappmessagingsdk 1.1.0)
- iOS SFMC SDK: 11.0 umbrella (MarketingCloudSDK 11.0.0, MarketingCloud-SFMCSdk 4.0.1, SFPushFeatureSDK 2.0.0, SFInAppMessagingFeatureSDK 1.0.0, SFMobileAppMessagingSDK 2.0.0)

## License

MIT
