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

The `InAppMessage` payload guarantees `id` on both platforms and surfaces the same set of fields on each: the scalar fields (`type`, `source`, `displayCount`, `displayLimit`, `displayLimitOverride`, `displayDuration`, `messageDelaySec`, `priority`, `backgroundColor`, `windowColor`, `displaySuppressionAction`, and `startDateUtc`/`endDateUtc`/`modifiedDateUtc` as epoch-ms), plus the content fields `title`, `body`, `media` (`{ url, altText, aspectRatio }`), and `buttons` (`[{ id, index, text, action, backgroundColor }]`). Every field other than `id` is best-effort — present only when the SDK supplied it.

The close action's `type` is normalized across platforms to `IamDismissReason`: `'AUTO' | 'BUTTON' | 'CLOSED' | 'UNKNOWN'`. (`UNKNOWN` originates from Android; iOS reports only the first three.)

## Deciding whether a message should display

You have two ways to control whether an in-app message renders:

1. **`showInAppMessage(id)`** — programmatically request that a specific message be displayed. Useful when you have already decided elsewhere (e.g. after a route change or a user action).
2. **`IamModule.setInAppMessageDecisionHandler(handler)`** — register a global gate that runs for **every** message the SDK is about to show, letting you approve or suppress each one.

### What to expect from `setInAppMessageDecisionHandler`

- **Timing.** Your handler runs *before* the message is drawn. Approved messages appear a few milliseconds later than they would without a handler — the SDK asks natively, waits for your async reply, and only then displays. In practice this is imperceptible unless your handler awaits network I/O.
- **Payload.** Your handler receives the full `InAppMessage` — you can branch on `id`, `type`, `priority`, `buttons`, dates, etc. — not just the id.
- **Return type.** Return a `boolean` or a `Promise<boolean>`. Anything else is coerced to `Boolean`.
- **Fail-closed.** If your handler throws (or the promise rejects), the message is **suppressed** and a warning is logged. Design the happy path to return `true` and only return `false` when you're sure.
- **One handler at a time.** Calling `setInAppMessageDecisionHandler` again replaces the previous handler. Pass `null` to remove it entirely and let all messages display.
- **Lifetime.** The handler is registered globally on the module — it stays active for the entire session (across screens, navigation, foreground/background). Register it once, near your SDK bootstrap.
- **`willShow` still fires.** The `sfmc_iam_will_show` event is emitted for every candidate message regardless of your decision — it is observational only. To *block* display, return `false` from the handler; do not try to intercept from the emitter.

### Example — gate on a customer flag

```ts
import { IamModule } from '@sfmc/react-native-iam';

IamModule.setInAppMessageDecisionHandler(async (message) => {
  // Suppress marketing messages while onboarding is in progress.
  if (userIsOnboarding()) return false;

  // Ask a remote policy service for anything with a "critical" tag.
  if (message.type === 'modal' && message.priority >= 8) {
    return await policyService.allow(message.id);
  }

  // Default to showing everything else.
  return true;
});

// Later, e.g. on sign-out:
IamModule.setInAppMessageDecisionHandler(null);
```

### What *not* to do

- Don't rely on JS-side filtering to hide messages you never want delivered — configure the campaign to not target these users instead. The decision handler is a per-app runtime gate, not a targeting mechanism.
- Don't run long-blocking work in the handler. Every millisecond delays the message display and, if your handler is running when the user backgrounds the app, the SDK may never get the chance to render it. Cache decisions where you can.
- Don't call `showInAppMessage(id)` from inside the handler for the same id — the SDK will re-invoke your handler in a loop.
- Don't register the handler before `IamModule.requestSdk()` resolves — the internal event subscription is set up when the emitter is first used. Handlers registered before `requestSdk()` still work, but if you call `setInAppMessageDecisionHandler(null)` before the SDK is requested, there is nothing to clear.

> Curious how this is wired up under the hood (SDK's synchronous `shouldShow` gate, the defer-then-reshow pattern, threading model)? See [`docs/show-message-internals.md`](./docs/show-message-internals.md). That's a contributor reference, not a customer guide.

## Notes

- The native `shouldShowMessage` gate is synchronous and cannot block on an async JS reply, so `setInAppMessageDecisionHandler` uses a defer-then-reshow model: the SDK is told *not* to show the message immediately, the handler is invoked with the full message, and if it resolves `true` the message is re-displayed (the same path as `showInAppMessage`). The visible effect is that an approved message appears a few milliseconds later than it would natively. The `willShow` event is still emitted on every gate decision so JS can observe it.
- The lifecycle listener (`InAppMessageManager.EventListener` on Android, `InAppMessageEventDelegate` on iOS) is registered automatically when the SDK is requested via `IamModule.requestSdk()` and stays active for the whole session; it is torn down automatically on bridge teardown. Emission is gated on JS having an active emitter listener, so no events are delivered until you subscribe.

## Versions

- React Native: 0.85.1 (New Architecture mandatory)
- Android: sfmcsdk 3.1.0, inappmessagingfeaturemodule 1.0.0
- iOS: SFInAppMessagingFeatureSDK 1.0.0, MarketingCloud-SFMCSdk 4.0.1

## License

BSD 3-Clause. See [LICENSE](../../LICENSE) for details.

