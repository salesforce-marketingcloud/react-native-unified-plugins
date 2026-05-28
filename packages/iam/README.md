# SFMC In-App Messaging

> SFMC In-App Messaging Feature for React Native — SDK readiness and programmatic message display.

## Installation

```bash
yarn add @sfmc/react-native-iam
# or
npm install @sfmc/react-native-iam
```

iOS:
```bash
cd ios && pod install
```

Android: no additional steps — Gradle autolinking discovers the module automatically.

### Required SDK configuration

- **Android** — initialize in your `MainApplication.kt` via `SFMCSdk.configure(...)`. See the [Android SDK Integration Guide](https://developer.salesforce.com/docs/marketing/mobile-unified-sdk/guide/android-sdk-integration.html).
- **iOS** — initialize in your `AppDelegate.swift` via `SFMCSdk.initializeSdk(...)`. See the [iOS SDK Integration Guide](https://developer.salesforce.com/docs/marketing/mobile-unified-sdk/guide/ios-sdk-integration.html).

## Usage

```ts
import { IamModule } from '@sfmc/react-native-iam';
import type { IamApi } from '@sfmc/react-native-iam';

const iam: IamApi = await IamModule.requestSdk();

// Programmatically show an in-app message by ID
iam.showInAppMessage('message-id');
```

## API

| Method | Return | Description |
|--------|--------|-------------|
| `showInAppMessage(messageId)` | `void` | Programmatically display an in-app message by ID |

## Notes

IAM lifecycle events (will show, did show, did close) are handled on the native side via `InAppMessageEventDelegate` (iOS) and `InAppMessageManager.EventListener` (Android), configured in your AppDelegate/Application class. The bridge module provides SDK readiness and programmatic message display only.

## Versions

- React Native: 0.85.1 (New Architecture mandatory)
- Android: sfmcsdk 3.1.0, inappmessagingfeaturemodule 1.0.0
- iOS: SFInAppMessagingFeatureSDK 1.0.0, MarketingCloud-SFMCSdk 4.0.1

## License

BSD 3-Clause. See [LICENSE](../../LICENSE) for details.
