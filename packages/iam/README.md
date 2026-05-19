# SFMC In-App Messaging

> SFMC In-App Messaging Feature for React Native — lifecycle events for in-app messages.

## Installation

```bash
yarn add @salesforce-mc/react-native-iam
# or
npm install @salesforce-mc/react-native-iam
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
import { IamModule } from '@salesforce-mc/react-native-iam';
import type { IamApi, InAppMessage } from '@salesforce-mc/react-native-iam';

await IamModule.requestSdk();

// Lifecycle events
const emitter = IamModule.getEmitter();
emitter.addListener('sfmc_iam_will_show', (m) => console.log('IAM will show:', m.id));
emitter.addListener('sfmc_iam_did_show',  (m) => console.log('IAM did show:',  m.id));
emitter.addListener('sfmc_iam_did_close', (m) => console.log('IAM did close:', m));
```

## Notes

The IAM module is event-driven; it emits `sfmc_iam_will_show`, `sfmc_iam_did_show`, and `sfmc_iam_did_close` once `requestSdk()` resolves.

## Versions

- React Native: 0.85.1 (New Architecture mandatory)
- Android SFMC SDK: 11.0 umbrella (sfmcsdk 3.1.0, marketingcloudsdk 11.0.0, pushfeaturemodule 2.0.0, inappmessagingfeaturemodule 1.0.0, mobileappmessagingsdk 1.1.0)
- iOS SFMC SDK: 11.0 umbrella (MarketingCloudSDK 11.0.0, MarketingCloud-SFMCSdk 4.0.1, SFPushFeatureSDK 2.0.0, SFInAppMessagingFeatureSDK 1.0.0, SFMobileAppMessagingSDK 2.0.0)

## License

MIT
