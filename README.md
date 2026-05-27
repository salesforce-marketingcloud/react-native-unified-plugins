# Salesforce Unified React Native Plugin

Unified React Native plugins for the **Salesforce Marketing Cloud SDK** — a Yarn workspace monorepo that wraps the native Android and iOS libraries behind a single, modular TypeScript surface built for React Native's New Architecture (TurboModules).

## Why

Historically, integrating Marketing Cloud features into a React Native app required stitching together separate SDKs and bridge modules per feature. This monorepo consolidates Push, In-App Messaging, MarketingCloud Engagement, and MobileAppMessaging behind one consistent `requestSdk()` API — install one product package and get all transitively required pieces.

## Packages

| Package | Description |
|---|---|
| [`@salesforce-mc/react-native-sfmc-core`](./packages/sfmc-core) | Foundation: identity, custom attributes, structured events, logging |
| [`@salesforce-mc/react-native-push`](./packages/push) | Push registration & notifications |
| [`@salesforce-mc/react-native-iam`](./packages/iam) | In-App Messaging SDK readiness & programmatic display |
| [`@salesforce-mc/react-native-marketingcloudsdk`](./packages/marketingcloudsdk) | MarketingCloud Engagement: inbox, tags, attributes, analytics, registration |
| [`@salesforce-mc/react-native-mobileappmessaging`](./packages/mobileappmessaging) | MobileAppMessaging: analytics, registration |

`marketingcloudsdk` and `mobileappmessaging` are **product** packages — they declare transitive dependencies on `sfmc-core`, `push`, and `iam`, so consumers only install one.

## Architecture

- **React Native 0.85.1** with the **New Architecture / TurboModules** (mandatory — there is no legacy bridge fallback).
- **Yarn workspaces** — each package is independently versioned and publishable; the example app consumes packages via workspace symlinks.
- **`requestSdk()` pattern** — every package exposes a `Module` whose `requestSdk()` lazily initializes the native SDK and resolves to a typed JS API. Subsequent calls return the cached instance.
- **Native event emission** — modules expose `getEmitter(): NativeEventEmitter` for streaming events (push token refresh, IAM lifecycle, registration changes, etc.).
- **Codegen-driven specs** — each package ships a `Native<Name>Module.ts` TurboModule spec; React Native codegen produces the Java/ObjC++ glue at build time.
- **Native package names**: `com.salesforce.mc.{sfmccore,push,iam,marketingcloudsdk,mobileappmessaging}`.

```
packages/
├── sfmc-core/                        # foundation: identity, events, logging
├── push/                             # push tokens & permissions
├── iam/                              # in-app messaging
├── marketingcloudsdk/                # product: engagement (depends on core+push+iam)
└── mobileappmessaging/               # product: MAM (depends on core+push+iam)
example/                              # RN 0.85.1 New Arch demo app (Android + iOS)
```

## Installation

```bash
yarn add @salesforce-mc/react-native-marketingcloudsdk
# or
npm install @salesforce-mc/react-native-marketingcloudsdk
```

> Installing a product package (`marketingcloudsdk` or `mobileappmessaging`) auto-resolves all shared dependencies (`sfmc-core`, `push`, `iam`).

### Android Setup

1. **Add the Marketing Cloud SDK Maven repository** to your project-level `android/build.gradle`.
2. **Provide Firebase Cloud Messaging credentials** — place your `google-services.json` in `android/app/` and apply the Google Services plugin.
3. **Configure the SDK** in your `MainApplication.kt` using the multi-module `ConfigBuilder` pattern. See [Initialize the SDK](https://developer.salesforce.com/docs/marketing/mobile-unified-sdk/guide/android-sdk-integration.html#initialize-the-sdk).

For full setup instructions, see the [Android SDK Integration Guide](https://developer.salesforce.com/docs/marketing/mobile-unified-sdk/guide/android-sdk-integration.html).

### iOS Setup

1. **Install CocoaPods dependencies** — run `cd ios && pod install`.
2. **Configure APNs** — set up an Authentication Key (`.p8`) or Certificate (`.p12`) in your Apple Developer account and upload to MobilePush Administration.
3. **Configure the SDK** in your `AppDelegate.swift` using the multi-module `ConfigBuilder` pattern. See [Configure the SDK](https://developer.salesforce.com/docs/marketing/mobile-unified-sdk/guide/ios-sdk-integration.html#configure-the-sdk).
4. **[Enable push notifications](https://developer.salesforce.com/docs/marketing/mobile-unified-sdk/guide/ios-sdk-integration.html#enable-push-notifications)** in Xcode: Push Notifications and Background Modes (Remote Notifications).

For full setup instructions, see the [iOS SDK Integration Guide](https://developer.salesforce.com/docs/marketing/mobile-unified-sdk/guide/ios-sdk-integration.html).

## Usage

```ts
import { SFMCSdkModule } from '@salesforce-mc/react-native-sfmc-core';
import { MarketingCloudSdkModule } from '@salesforce-mc/react-native-marketingcloudsdk';

// Initialize core
const sdk = await SFMCSdkModule.requestSdk();
sdk.setProfileId('user-123');
sdk.setAttribute('plan', 'pro');
sdk.track({ objType: 'CustomEvent', name: 'purchase', attributes: { amount: '49.99' } });

// Use the engagement product
const mc = await MarketingCloudSdkModule.requestSdk();
const unread = await mc.getUnreadMessages();
if (unread.length > 0) {
  mc.markMessageRead(unread[0].id);
}
```

See each package's README for full API documentation with links to native SDK docs.

## Requirements

| Platform | Minimum |
|---|---|
| React Native | 0.85.1 (New Architecture enabled) |
| React | 19.2.3 |
| Node | 20+ |
| iOS | 15.1+ (Xcode 16+) |
| Android | minSdk 26, compileSdk 36 |
| Ruby | 3.1.0 (for CocoaPods, see `example/.ruby-version`) |

## 3rd Party Product Language Disclaimers

Where possible, we changed noninclusive terms to align with our company value of Equality. We retained noninclusive terms to document a third-party system, but we encourage the developer community to embrace more inclusive language. We can update the term when it's no longer required for technical accuracy.

## License

BSD 3-Clause. See [LICENSE](./LICENSE) for details.
