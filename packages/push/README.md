# SFMC Push

> SFMC Push Feature for React Native — FCM/APNs registration, push enable/disable, and push token events.

## Installation

```bash
yarn add @sfmc/react-native-push
# or
npm install @sfmc/react-native-push
```

iOS:
```bash
cd ios && pod install
```

Android: no additional steps — Gradle autolinking discovers the module automatically.

### Required SDK configuration

- **Android** — initialize in your `MainApplication.kt` via `SFMCSdk.configure(...)`. See the [Android SDK Integration Guide](https://developer.salesforce.com/docs/marketing/mobile-unified-sdk/guide/android-sdk-integration.html).
- **iOS** — initialize in your `AppDelegate.swift` via `SFMCSdk.initializeSdk(...)`. See the [iOS SDK Integration Guide](https://developer.salesforce.com/docs/marketing/mobile-unified-sdk/guide/ios-sdk-integration.html).
- Configure Firebase (Android) and APNs (iOS) credentials before push will deliver.

### Notification display decision

The SFMC push SDK lets the **host app** decide, per notification, whether an
incoming push is displayed (allow-lists, quiet hours, per-channel prefs, a
server flag cached locally, and so on).

**This decision must be made in native code, not JavaScript.** On an app-killed
FCM cold-start the OS boots the process straight into your `MainApplication`
(`SFMCSdk.configure(...)`) to handle the message — the React Native JS runtime
is not started in that path, so a JS handler cannot be consulted reliably.

**Android** — register a `NotificationManager.ShouldShowNotificationListener`
on the `PushFeatureConfig` at SDK-configuration time:

```kotlin
pushFeatureModuleConfig = PushFeatureConfig.builder()
    // ...other push config...
    .setShouldShowNotificationListener(
        ExampleShouldShowNotificationListener(this@MainApplication))
    .build()
```

See the example app's
[`ExampleShouldShowNotificationListener.kt`](../../example/android/app/src/main/java/com/sfmcexample/ExampleShouldShowNotificationListener.kt)
for a reference implementation that combines an app-owned "notifications
enabled" flag (read from `SharedPreferences`) with a content rule. Replace its
`shouldShow` logic with your own.

## Usage

```ts
import { PushModule } from '@sfmc/react-native-push';
import type { PushApi } from '@sfmc/react-native-push';

const push: PushApi = await PushModule.requestSdk();
push.enablePush();
const token = await push.getPushToken();
const enabled = await push.isPushEnabled();

// Subscribe to token refresh events
const sub = PushModule.getEmitter().addListener('sfmc_push_token_refreshed', ({ token }) => {
  console.log('Token refreshed:', token);
});
```

## API

| Method | Return | Description |
|--------|--------|-------------|
| `enablePush()` | `void` | Enable push notifications |
| `disablePush()` | `void` | Disable push notifications |
| `isPushEnabled()` | `Promise<boolean>` | Check if push is enabled |
| `getPushToken()` | `Promise<string \| null>` | Get the current device push token |

### Events

| Event Name | Payload | Platform | Description |
|------------|---------|----------|-------------|
| `sfmc_push_token_refreshed` | `{ token: string }` | Android only | Emitted when the push token is refreshed |

> **iOS note:** The `sfmc_push_token_refreshed` event is not emitted on iOS. Token refresh on iOS is handled natively via `AppDelegate.application(_:didRegisterForRemoteNotificationsWithDeviceToken:)`, which passes the token directly to `PushFeature.setDeviceToken(_:)`. Use `getPushToken()` to read the current token on demand.

## Notes

Push registration requires Firebase configuration on Android (`google-services.json` in the example app). On iOS, ensure the example target has Push Notifications and Background Modes (Remote Notifications) capabilities enabled in your Apple Developer account.

## Versions

- React Native: 0.85.1 (New Architecture mandatory)
- Android: sfmcsdk 3.1.0, pushfeaturemodule 2.0.0
- iOS: SFPushFeatureSDK 2.0.0, MarketingCloud-SFMCSdk 4.0.1

## License

BSD 3-Clause. See [LICENSE](../../LICENSE) for details.

