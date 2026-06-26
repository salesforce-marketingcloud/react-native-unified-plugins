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
import { IamModule, IamEvent } from '@sfmc/react-native-iam';
import type { IamApi, InAppMessage, InAppMessageCloseAction } from '@sfmc/react-native-iam';

const iam: IamApi = await IamModule.requestSdk();

// Programmatically show an in-app message by ID
iam.showInAppMessage('message-id');

// Gate auto-display per message: register a handler that decides whether each
// message displays. Return (or resolve) true to show, false to suppress.
IamModule.setInAppMessageDecisionHandler((message) => {
  return message.id !== 'promo-1';
});
// async is supported too:
// IamModule.setInAppMessageDecisionHandler(async (message) => await shouldShow(message));
// later: IamModule.setInAppMessageDecisionHandler(null); // restore default (show all)

// Style messages
iam.setFont('Helvetica-Bold');
iam.setStatusBarColor(0xff0000ff); // Android only

// Subscribe to lifecycle events (the native delegate is registered for you when
// the SDK is requested)
const emitter = IamModule.getEmitter();
const sub = emitter.addListener(IamEvent.DidShowMessage, (msg: InAppMessage) => {
  console.log('shown', msg.id);
});
// later: sub.remove();
```

## API

| Method | Return | Platform | Description |
|--------|--------|----------|-------------|
| `showInAppMessage(messageId)` | `void` | iOS · Android | Programmatically display an in-app message by ID |
| `IamModule.setInAppMessageDecisionHandler(handler)` | `void` | iOS · Android | Register a handler that decides, per message, whether each one displays (or `null` to clear and show all). The handler may return a `boolean` or `Promise<boolean>` |
| `setFont(name)` | `void` | iOS · Android | Set the font used to render message content |
| `setStatusBarColor(color)` | `void` | Android only | Set the message activity status bar color (ARGB int). No-op on iOS |

## Events

Lifecycle events are delivered through `IamModule.getEmitter()`. The native lifecycle listener is registered for you when the SDK is requested via `IamModule.requestSdk()`, so you only need to add an emitter listener. Event names are exported as `IamEvent`:

| `IamEvent` constant | Name | Payload | Description |
|---------------------|------|---------|-------------|
| `WillShowMessage` | `sfmc_iam_will_show` | `InAppMessage` | A message is about to display. Observational — to gate display, register a handler via `setInAppMessageDecisionHandler` |
| `DidShowMessage` | `sfmc_iam_did_show` | `InAppMessage` | A message was shown on screen |
| `DidCloseMessage` | `sfmc_iam_did_close` | `InAppMessage & { action: InAppMessageCloseAction }` | A message was dismissed |

The `InAppMessage` payload guarantees `id` on both platforms and surfaces the same set of JSON-safe scalar fields on each (`type`, `source`, `displayCount`, `displayLimit`, `displayLimitOverride`, `displayDuration`, `messageDelaySec`, `priority`, `backgroundColor`, `windowColor`, `displaySuppressionAction`, and `startDateUtc`/`endDateUtc`/`modifiedDateUtc` as epoch-ms). Every field other than `id` is best-effort (present only when the SDK supplied it); the nested object graph (title/body/media/buttons/styling) is not serialized.

The close action's `type` is normalized across platforms to `IamDismissReason`: `'AUTO' | 'BUTTON' | 'CLOSED' | 'UNKNOWN'`. (`UNKNOWN` originates from Android; iOS reports only the first three.)

## Notes

- The native `shouldShowMessage` gate is synchronous and cannot block on an async JS reply, so `setInAppMessageDecisionHandler` uses a defer-then-reshow model: the SDK is told *not* to show the message immediately, the handler is invoked with the full message, and if it resolves `true` the message is re-displayed (the same path as `showInAppMessage`). The visible effect is that an approved message appears a few milliseconds later than it would natively. The `willShow` event is still emitted on every gate decision so JS can observe it.
- The lifecycle listener (`InAppMessageManager.EventListener` on Android, `InAppMessageEventDelegate` on iOS) is registered automatically when the SDK is requested via `IamModule.requestSdk()` and stays active for the whole session; it is torn down automatically on bridge teardown. Emission is gated on JS having an active emitter listener, so no events are delivered until you subscribe.

## Versions

- React Native: 0.85.1 (New Architecture mandatory)
- Android: sfmcsdk 3.1.0, inappmessagingfeaturemodule 1.0.0
- iOS: SFInAppMessagingFeatureSDK 1.0.0, MarketingCloud-SFMCSdk 4.0.1

## License

BSD 3-Clause. See [LICENSE](../../LICENSE) for details.

