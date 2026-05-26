# react-native-unified-plugins

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

## Getting started

```bash
# 1. Install workspace dependencies
yarn install

# 2. Run the example app
cd example
yarn ios          # or: yarn android
```

The `example/` app is a self-contained RN 0.85.1 New Architecture project that imports all 5 packages and demonstrates each module's `requestSdk()` flow.

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

## Requirements

| Platform | Minimum |
|---|---|
| React Native | 0.85.1 (New Architecture enabled) |
| React | 19.2.3 |
| Node | 20+ |
| iOS | 15.1+ (Xcode 16+) |
| Android | minSdk 26, compileSdk 36 |
| Ruby | 3.1.0 (for CocoaPods, see `example/.ruby-version`) |

## Development

```bash
yarn install                          # install root + workspace deps
cd example && yarn android            # build & run Android
cd example && yarn ios                # build & run iOS (runs `pod install` first)
cd example && npx tsc --noEmit        # type-check
cd example && yarn start --reset-cache # Metro with cleared cache
```

### Adding a new method to a package

1. Add the spec method to `packages/<pkg>/src/Native<Name>Module.ts`.
2. Implement the JS wrapper in `packages/<pkg>/src/<Name>Module.ts`.
3. Implement the native side under `packages/<pkg>/android/` and `packages/<pkg>/ios/`.
4. Re-run `pod install` (iOS) and rebuild — codegen regenerates the native interface.

### Workspace tips

- Packages reference each other as `1.0.0` — Yarn workspaces resolve them via symlinks, so changes are picked up immediately.
- `resolutions` in the root `package.json` pin `react`, `react-native`, and `@types/react` across all packages.

## License

MIT
