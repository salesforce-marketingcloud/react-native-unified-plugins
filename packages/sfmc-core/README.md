# SFMC Core

> Unified SFMC SDK core for React Native — identity, attributes, custom events, logging.

## Installation

```bash
yarn add @salesforce-mc/react-native-sfmc-core
# or
npm install @salesforce-mc/react-native-sfmc-core
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
import { SFMCSdkModule } from '@salesforce-mc/react-native-sfmc-core';
import type { SFMCSdkApi, SFMCEvent } from '@salesforce-mc/react-native-sfmc-core';

const sfmc: SFMCSdkApi = await SFMCSdkModule.requestSdk();
sfmc.setProfileId('user-1234');
sfmc.setAttribute('email', 'sample@example.com');
const profileId = await sfmc.getProfileId();

// Custom event
sfmc.track({ objType: 'CustomEvent', name: 'app_open' });

// Cart event
sfmc.track({
  objType: 'CartEvent',
  subtype: 'add',
  lineItems: [{ catalogObjectType: 'Product', catalogObjectId: 'sku-1', quantity: 2, price: 9.99, currency: 'USD' }],
});
```

## API

| Method | Return | Description |
|--------|--------|-------------|
| `setProfileId(id)` | `void` | Set profile/contact key |
| `getProfileId()` | `Promise<string \| null>` | Get current profile ID |
| `setAttribute(key, value)` | `void` | Set a single attribute |
| `setAttributes(attrs)` | `void` | Set multiple attributes at once |
| `clearAttribute(key)` | `void` | Remove an attribute |
| `clearAllAttributes()` | `void` | Remove all attributes |
| `getAttributes()` | `Promise<object \| null>` | Get all attributes |
| `setPartyIdentificationName(name)` | `void` | Set party identification name |
| `setPartyIdentificationNumber(num)` | `void` | Set party identification number |
| `setPartyIdentificationType(type)` | `void` | Set party identification type |
| `getPartyIdentificationName()` | `Promise<string \| null>` | Get party identification name |
| `getPartyIdentificationNumber()` | `Promise<string \| null>` | Get party identification number |
| `getPartyIdentificationType()` | `Promise<string \| null>` | Get party identification type |
| `track(event)` | `void` | Track a structured event |
| `sendImmediate(event)` | `void` | Send event immediately (bypasses batching) |
| `flush()` | `void` | Flush pending analytics |
| `setLogging(level)` | `void` | Set log level: `'DEBUG'`, `'WARN'`, `'ERROR'`, `'NONE'` |
| `getSdkState()` | `Promise<object>` | Get full SDK state as JSON object |

## Notes

`sfmc-core` is the dependency root for every SFMC RN plugin. Other packages depend on it transitively — installing a product package (`marketingcloudsdk` or `mobileappmessaging`) auto-resolves this.

## Versions

- React Native: 0.85.1 (New Architecture mandatory)
- Android: sfmcsdk 3.1.0
- iOS: MarketingCloud-SFMCSdk 4.0.1

## License

BSD 3-Clause. See [LICENSE](../../LICENSE) for details.
