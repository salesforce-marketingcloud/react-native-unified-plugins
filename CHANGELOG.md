# Change Log

All notable, user-visible changes to the `@sfmc/react-native-*` packages are
recorded here. Each release heading is a git tag; each package block under a
release names the package version that shipped to npm on that date.

Packages that had no user-visible change in a given release are omitted (their
source may still have moved for cross-cutting reasons — org rename, podspec
relocation, autolinking config — without a version bump or republish).

## Unreleased

### `@sfmc/react-native-marketingcloudsdk` — 2.0.0 (pending)

- Added `enableLocation()` / `disableLocation()` / `isLocationEnabled()` — geofence and coordinate watching master toggle (iOS `MarketingCloudSdk.setLocationEnabled`, Android `RegionMessageManager.enableGeofenceMessaging`).
- Added `startWatchingLocation()` / `stopWatchingLocation()` / `isWatchingLocation()` for coordinate watching.
- Added `getLastKnownLocation()` returning the SDK's last known coordinate, or `null` if location has never resolved.
- Added `enableProximityMessaging()` / `disableProximityMessaging()` / `isProximityMessagingEnabled()` (Android only; iOS proximity is bundled under `enableLocation`).
- Added `setSignedString(token | null)` / `getSignedString()` for signed-string registration security.
- **BREAKING:** Removed deprecated `getAttributes()` and `getContactKey()` from the MC module. Migrate to `SFMCSdkApi.getAttributes()` and `SFMCSdkApi.getProfileId()` in `@sfmc/react-native-sfmc-core`.

### `@sfmc/react-native-iam` — pending

- Added `setFont(name)` and `setStatusBarColor(color)` for in-app message chrome customization.
- Added `setInAppMessageDecisionHandler(handler | null)` — defer-then-reshow model that lets the app veto messages after native `shouldShowMessage` has already fired. Handlers that throw or reject fail closed (message suppressed).
- Fixed: "app decides display" toggle now persists across tab switches and app launches.
- Fixed: corrected `InAppMessage` import in the Android module.

### `@sfmc/react-native-push` — pending

- Added missing Push APIs (see package `README.md`).
- Fixed broken push URL handling in the Android example app.

### `@sfmc/react-native-mobileappmessaging` — pending

_Internal-only changes (Jest test coverage). No user-visible surface change; no republish planned._

### `@sfmc/react-native-sfmc-core` — pending

_Internal-only changes (Jest test coverage, event serializer cleanup). No user-visible surface change; no republish planned._

---

## Release `1.0.0.262.1` — 2026-05-29

### `@sfmc/react-native-sfmc-core` — 1.0.1

- Moved podspec out of `ios/` to package root so React Native autolinking discovers it.
- Renamed npm org from `salesforce-mc` to `sfmc` (published under `@sfmc/react-native-sfmc-core`).

_Other packages unchanged from `1.0.0.262.0` — their podspecs and org name moved in source, but no version bump or republish._

---

## Release `1.0.0.262.0` — 2026-05-27

Initial hybrid plugins 1.0.0 release. Five packages published to npm together
under the new `@sfmc` scope, built for React Native 0.85.1 New Architecture
(TurboModules).

### All packages — 1.0.0

- `@sfmc/react-native-sfmc-core` — foundation: identity, custom attributes, structured events, logging.
- `@sfmc/react-native-push` — push registration and notifications.
- `@sfmc/react-native-iam` — In-App Messaging readiness and programmatic display.
- `@sfmc/react-native-marketingcloudsdk` — MarketingCloud Engagement: inbox, tags, attributes, analytics, registration, location, proximity.
- `@sfmc/react-native-mobileappmessaging` — MobileAppMessaging: analytics, registration.

**Requirements:** React 19, React Native 0.85.1 (New Architecture only), iOS 15.1+, Android minSdk 26.

### Native SDK versions pinned by this release

- Android `com.salesforce.marketingcloud:marketingcloudsdk` 11.0.+
- Android `com.salesforce.marketingcloud:mobileappmessagingsdk` 1.1.+
- Android `com.salesforce.marketingcloud:sfmcsdk` 3.1.+
- iOS `MarketingCloudSDK` ~> 11.0.0
- iOS `MarketingCloud-SFMCSdk` ~> 4.0.0
- iOS `SFPushFeatureSDK` ~> 2.0.0
- iOS `SFInAppMessagingFeatureSDK` ~> 1.0.0
- iOS `SFMobileAppMessagingSDK` ~> 2.0.0
