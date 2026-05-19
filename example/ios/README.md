# example-ios template

Minimal iOS example app scaffold so `rn-build-verifier` can exercise the generated iOS bridges with `pod install` + `xcodebuild`.

## Files

- `Podfile` — references the five SFMC packages by `:path`. New Architecture is **enabled** (`fabric_enabled: true, new_arch_enabled: true`). SFMC bridge modules use `RCT_EXPORT_MODULE` (ObjC++) and conform to `RCTTurboModule` via the RN 0.85 interop layer — `TurboModuleRegistry.getEnforcing` resolves them correctly.
- `SFMCExample/AppDelegate.swift.template` — rendered to `AppDelegate.swift`. Implements the full LearningApp pattern: file protection, SDK init, push registration, data-protection re-init, foreground notification presentation, and IAM lifecycle delegate.
- `SFMCExample/Info.plist` — minimum viable plist with NSLocation* keys (required by CoreLocation linkage from SFMC SDK) and background modes for push.
- `project.yml` — xcodegen spec used by `rn-build-verifier` to generate `SFMCExample.xcodeproj`. Not committed.

## AppDelegate design (LearningApp pattern)

The template follows the Salesforce LearningApp reference implementation:

1. **File protection** — `configureFileProtection()` called before SDK init, sets `.completeUntilFirstUserAuthentication` on the application support directory. Prevents SDK SQLite access errors during background wakeup on a locked device.

2. **Analytics enabled** — both `mcConfig` and `mamConfig` call `.setAnalyticsEnabled(true)`.

3. **SDK init + IAM delegate** — `SFMCSdk.initializeSdk(_:completion:)` completion block calls `setupInAppMessaging()` which registers the IAM event delegate. The `UNUserNotificationCenter.current().delegate = self` assignment goes immediately after initializeSdk (not inside the callback).

4. **Push token registration** — `didRegisterForRemoteNotificationsWithDeviceToken` → `PushFeature.setDeviceToken(_:)`.

5. **Data protection re-init** — `applicationProtectedDataDidBecomeAvailable` re-calls `configureSFMCSdk()`. Required when the app wakes in background before first device unlock.

6. **Notification center delegate** (UNUserNotificationCenterDelegate):
   - `didReceive(_:withCompletionHandler:)` → `push.setNotificationResponse(response)` via requestSdk
   - `willPresent(_:withCompletionHandler:)` → returns `[.banner, .sound, .badge]` so foreground pushes are visible

7. **IAM lifecycle delegate** (InAppMessageEventDelegate):
   - `shouldShow(inAppMessage:)` → returns `true`
   - `didShow(inAppMessage:)` and `didClose(inAppMessage:action:)` → empty stubs

## What is NOT in this template

- **`SFMCExample.xcodeproj/`** — the pbxproj is generated at build time by `xcodegen generate`. Not committed.
- **Asset catalog (`Assets.xcassets/`)** — not required for a debug simulator build.
- **LaunchScreen storyboard** — `Info.plist` references `LaunchScreen` but it is absent; Xcode 15+ falls back to a generic launch screen.

## Known configuration requirements

- **Keychain Sharing** — must be added in Xcode → Signing & Capabilities before running on a physical device. Simulator builds do not need it.
- **APNs environment** — Debug builds must use the Development APNs environment in Engagement UI; Release builds must use Production.
- **Node path** — create `example/ios/.xcode.env` with `export NODE_BINARY=$(command -v node)` so Xcode build phase scripts can find Node when launched outside a terminal.
- **Credential substitution** — all `{{MC_*}}` and `{{MAM_*}}` placeholders must be replaced before running. Grep for them: `grep -r '16586d33-807c-4e1a-9a73-feb54a5c4ad1' example/ios/`.

## Podfile `require_relative` path

In a Yarn workspaces monorepo, `react-native` is hoisted to the workspace root, not to `example/node_modules/`. The Podfile uses:

```ruby
require_relative '../../node_modules/react-native/scripts/react_native_pods'
```

Two levels up from `example/ios/` → workspace root `node_modules/`. If `react-native` is NOT hoisted (check `example/node_modules/react-native`), adjust to `'../node_modules/react-native/...'`.
