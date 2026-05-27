# SFMC In-App Messaging

> SFMC In-App Messaging Feature for React Native — SDK readiness and programmatic message display.

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

## Usage

```ts
import { IamModule } from '@salesforce-mc/react-native-iam';
import type { IamApi } from '@salesforce-mc/react-native-iam';

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
