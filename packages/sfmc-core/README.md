# SFMC Core

> Unified SFMC SDK core for React Native — identity, attributes, custom events, logging.

## Installation

```bash
yarn add @salesforce-mc/react-native-sfmc-core
# or
npm install @salesforce-mc/react-native-sfmc-core
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
import { SFMCSdkModule } from '@salesforce-mc/react-native-sfmc-core';
import type { SFMCSdkApi, SFMCEvent } from '@salesforce-mc/react-native-sfmc-core';

const sfmc: SFMCSdkApi = await SFMCSdkModule.requestSdk();
await sfmc.setProfileId('user-1234');
sfmc.setAttribute('email', 'sample@example.com');
const profileId = await sfmc.getProfileId();

// Custom event
sfmc.track({ objType: 'CustomEvent', name: 'app_open' });

// Cart event
sfmc.track({
  objType: 'CartEvent',
  subtype: 'add',
  lineItem: { catalogObjectType: 'Product', catalogObjectId: 'sku-1', quantity: 2, price: 9.99, currency: 'USD' },
});
```

## Notes

`sfmc-core` is the dependency root for every SFMC RN plugin. Other packages depend on it transitively — installing a product package (`marketingcloudsdk` or `mobileappmessaging`) auto-resolves this.

## Versions

- React Native: 0.85.1 (New Architecture mandatory)
- Android SFMC SDK: 11.0 umbrella (sfmcsdk 3.1.0, marketingcloudsdk 11.0.0, pushfeaturemodule 2.0.0, inappmessagingfeaturemodule 1.0.0, mobileappmessagingsdk 1.1.0)
- iOS SFMC SDK: 11.0 umbrella (MarketingCloudSDK 11.0.0, MarketingCloud-SFMCSdk 4.0.1, SFPushFeatureSDK 2.0.0, SFInAppMessagingFeatureSDK 1.0.0, SFMobileAppMessagingSDK 2.0.0)

## License

MIT
