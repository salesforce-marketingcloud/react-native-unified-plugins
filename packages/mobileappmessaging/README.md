# SFMC MobileAppMessaging SDK

> Salesforce Marketing Cloud MobileAppMessaging SDK for React Native — analytics and registration.

## Installation

```bash
yarn add @salesforce-mc/react-native-mobileappmessaging
# or
npm install @salesforce-mc/react-native-mobileappmessaging
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
import { MobileAppMessagingModule } from '@salesforce-mc/react-native-mobileappmessaging';
import type { MAMApi } from '@salesforce-mc/react-native-mobileappmessaging';

const mam: MAMApi = await MobileAppMessagingModule.requestSdk();
const deviceId = await mam.getDeviceId();
mam.enableAnalytics();

// Registration callback
mam.setRegistrationCallback();
const emitter = MobileAppMessagingModule.getEmitter();
const sub = emitter.addListener('sfmc_mam_registration', (registration) => {
  console.log('MAM registration changed:', registration);
});

// Cleanup
sub.remove();
mam.unsetRegistrationCallback();
```

## API

| Method | Return | Description |
|--------|--------|-------------|
| `getDeviceId()` | `Promise<string \| null>` | Get device identifier |
| `enableAnalytics()` | `void` | Enable analytics |
| `disableAnalytics()` | `void` | Disable analytics |
| `isAnalyticsEnabled()` | `Promise<boolean>` | Check analytics state |
| `setRegistrationCallback()` | `void` | Start receiving registration change events |
| `unsetRegistrationCallback()` | `void` | Stop receiving registration change events |

### Events

| Event Name | Payload | Description |
|------------|---------|-------------|
| `sfmc_mam_registration` | Registration dictionary | Emitted when registration state changes |

## Notes

Installing this package auto-resolves the shared `sfmc-core`, `push`, and `iam` packages.

`MAMModule` is exported as an alias for `MobileAppMessagingModule`. Both reference the same module.

## Versions

- React Native: 0.85.1 (New Architecture mandatory)
- Android: sfmcsdk 3.1.0, mobileappmessagingsdk 1.1.0
- iOS: SFMobileAppMessagingSDK 2.0.0, MarketingCloud-SFMCSdk 4.0.1

## License

MIT
