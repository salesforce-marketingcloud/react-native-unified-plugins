# CLAUDE.md

Yarn-workspace monorepo wrapping the Salesforce Marketing Cloud native SDKs (Android + iOS) behind React Native TurboModules. **React Native 0.85.1, New Architecture only** — there is no legacy bridge fallback.

## Packages

`packages/{sfmc-core, push, iam, marketingcloudsdk, mobileappmessaging}`. `sfmc-core` is the foundation; the others depend on it. `example/` is the manual test harness app (Android + iOS).

## The 4-layer pattern (read before adding/changing any API method)

Every feature crosses the same layers. To add or change one method, touch them in this order:

1. `packages/<pkg>/src/NativeSFMC<Name>Module.ts` — TurboModule **spec** (codegen source of truth; method must be declared here or it won't exist natively).
2. `packages/<pkg>/src/<Name>Module.ts` — JS wrapper; wire the method into the API object returned by `requestSdk()`.
3. `packages/<pkg>/src/types.ts` — the `*Api` interface, plus any event-name consts and payload types.
4. `packages/<pkg>/src/index.ts` — public exports (export new types/consts here).
5. Native impls:
   - iOS: `packages/<pkg>/ios/SFMC<Name>Module.mm`
   - Android: `packages/<pkg>/android/src/main/java/com/salesforce/mc/<pkg>/SFMC<Name>Module.kt`

Native namespace: `com.salesforce.mc.{sfmccore,push,iam,marketingcloudsdk,mobileappmessaging}`.

## Conventions

- **`requestSdk()` pattern** — every package exposes a `Module` whose `requestSdk()` lazily inits the native SDK and resolves to a typed JS API; subsequent calls return the cached instance.
- **Platform parity** — a method that only one platform supports is still declared in the spec and implemented as a **no-op on the other platform**, with a comment saying so (e.g. `setURLHandlingEnabled` is iOS-only; the Android override is an explicit no-op "for parity").
- **Delegates are owned by the JS/RN layer, not AppDelegate** — register SDK delegates on demand from JS (e.g. `push.setURLHandlingEnabled(true)`), not natively in `example/ios/SFMCExample/AppDelegate.swift`.
- **Native event emitters** — modules extend `RCTEventEmitter` (iOS) / emit via `RCTDeviceEventEmitter` (Android) and expose `getEmitter()`. Gotchas:
  - iOS: gate emissions on a `_hasListeners` flag driven by `startObserving`/`stopObserving`; `addListener`/`removeListeners` must chain to `super` — empty stubs silently drop all events.
  - Android: track a listener count with `AtomicInteger` and skip emit when zero (avoids the "no listeners registered" warning).
  - Both: clear delegates in the `invalidate()` teardown (override it and call `super`).

## Gotchas

- **Prettier reports the whole repo as failing.** There is no prettier config, so `yarn lint` defaults to double quotes, but the codebase uses **single quotes**. Match surrounding single-quote style; do not reformat to satisfy prettier.
- **No package-level `tsconfig.json`** — only `example/tsconfig.json`. Running `tsc` over package `src` surfaces only pre-existing react-native lib type mismatches, not real errors.

## Commands

- `yarn lint` / `yarn format` — prettier (root; see quote caveat above).
- `yarn ios` / `yarn android` — build & run the `example/` app.
- `cd example/ios && pod install` — after any iOS native change.
- `example/src/tabs/HomeTab.tsx` exercises most APIs; native SDK config (app IDs, capabilities) lives in `example/ios/SFMCExample/AppDelegate.swift`.

Per-package API docs and version pins live in each package's `README.md` — keep them as the source of truth rather than duplicating here.
