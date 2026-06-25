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

// Gate auto-display per message with data-driven rules (evaluated natively).
// Requires the event delegate to be enabled (see below).
iam.setMessageFilter({ blockedIds: ['promo-1', 'promo-2'] });
// or allow-list only: iam.setMessageFilter({ allowedIds: ['welcome'], defaultShow: false });

// Style messages
iam.setFont('Helvetica-Bold');
iam.setStatusBarColor(0xff0000ff); // Android only

// Subscribe to lifecycle events (must enable delivery first)
iam.setEventDelegateEnabled(true);
const emitter = IamModule.getEmitter();
const sub = emitter.addListener(IamEvent.DidShowMessage, (msg: InAppMessage) => {
  console.log('shown', msg.id);
});
// later: sub.remove(); iam.setEventDelegateEnabled(false);
```

## API

| Method | Return | Platform | Description |
|--------|--------|----------|-------------|
| `showInAppMessage(messageId)` | `void` | iOS · Android | Programmatically display an in-app message by ID |
| `setEventDelegateEnabled(enabled)` | `void` | iOS · Android | Register/unregister the native lifecycle listener that drives the events below and the per-message gate (default off) |
| `setMessageFilter(filter)` | `void` | iOS · Android | Set data-driven rules (`blockedIds` / `allowedIds` / `defaultShow`) evaluated natively per message to decide whether each one displays |
| `setFont(name)` | `void` | iOS · Android | Set the font used to render message content |
| `setStatusBarColor(color)` | `void` | Android only | Set the message activity status bar color (ARGB int). No-op on iOS |
| `setURLHandlingEnabled(enabled)` | `void` | iOS only | Route message URL actions to JS via the `UrlActionSelected` event. No-op on Android |

## Events

Lifecycle events are delivered through `IamModule.getEmitter()` once you have called `setEventDelegateEnabled(true)`. Event names are exported as `IamEvent`:

| `IamEvent` constant | Name | Payload | Description |
|---------------------|------|---------|-------------|
| `WillShowMessage` | `sfmc_iam_will_show` | `InAppMessage` | A message is about to display. Observational — the show/suppress decision is made natively via `setMessageFilter` |
| `DidShowMessage` | `sfmc_iam_did_show` | `InAppMessage` | A message was shown on screen |
| `DidCloseMessage` | `sfmc_iam_did_close` | `InAppMessage & { action: InAppMessageCloseAction }` | A message was dismissed |
| `UrlActionSelected` | `sfmc_iam_url_action` | `IamUrlAction` (`{ url, type }`) | iOS only — a URL action was selected (requires `setURLHandlingEnabled(true)`) |

The `InAppMessage` payload guarantees `id` on both platforms and surfaces the same set of JSON-safe scalar fields on each (`type`, `source`, `displayCount`, `displayLimit`, `displayLimitOverride`, `displayDuration`, `messageDelaySec`, `priority`, `backgroundColor`, `windowColor`, `displaySuppressionAction`, and `startDateUtc`/`endDateUtc`/`modifiedDateUtc` as epoch-ms). Every field other than `id` is best-effort (present only when the SDK supplied it); the nested object graph (title/body/media/buttons/styling) is not serialized.

The close action's `type` is normalized across platforms to `IamDismissReason`: `'AUTO' | 'BUTTON' | 'CLOSED' | 'UNKNOWN'`. (`UNKNOWN` originates from Android; iOS reports only the first three.)

## Notes

- The native `shouldShowMessage` gate is synchronous and cannot make an async round trip to JS, so the per-message show/suppress decision is expressed as data via `setMessageFilter` and evaluated natively against each message's `id`. The `willShow` event is still emitted on every gate decision so JS can observe it.
- The lifecycle listener (`InAppMessageManager.EventListener` on Android, `InAppMessageEventDelegate` on iOS) is opt-in: it is registered when you call `setEventDelegateEnabled(true)`, removed on `setEventDelegateEnabled(false)`, and torn down automatically on bridge teardown.

## Versions

- React Native: 0.85.1 (New Architecture mandatory)
- Android: sfmcsdk 3.1.0, inappmessagingfeaturemodule 1.0.0
- iOS: SFInAppMessagingFeatureSDK 1.0.0, MarketingCloud-SFMCSdk 4.0.1

## License

BSD 3-Clause. See [LICENSE](../../LICENSE) for details.

