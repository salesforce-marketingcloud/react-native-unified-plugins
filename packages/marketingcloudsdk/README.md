# SFMC MarketingCloud SDK (Engagement)

> Salesforce Marketing Cloud Engagement SDK for React Native — inbox, registration, tags, attributes, analytics.

## Installation

```bash
yarn add @sfmc/react-native-marketingcloudsdk
# or
npm install @sfmc/react-native-marketingcloudsdk
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

## Usage

```ts
import { MarketingCloudSdkModule } from '@sfmc/react-native-marketingcloudsdk';
import type { MCApi, InboxMessage } from '@sfmc/react-native-marketingcloudsdk';

const mc: MCApi = await MarketingCloudSdkModule.requestSdk();

// Inbox
await mc.refreshInbox();
const allMsgs: InboxMessage[] = await mc.getAllMessages();
const unreadCount = await mc.getUnreadMessageCount();
mc.markMessageRead('message-id');

// Tags + attributes
mc.addTag('beta-tester');
const tags = await mc.getTags();

// Device id
const deviceId = await mc.getDeviceId();

// Registration callback
mc.setRegistrationCallback();
const emitter = MarketingCloudSdkModule.getEmitter();
const sub = emitter.addListener('sfmc_mc_registration', (registration) => {
  console.log('MC registration changed:', registration);
});

// Cleanup
sub.remove();
mc.unsetRegistrationCallback();
```

## API

| Method | Return | Description |
|--------|--------|-------------|
| `refreshInbox()` | `Promise<boolean>` | Trigger server inbox refresh |
| `getAllMessages()` | `Promise<InboxMessage[]>` | Get all inbox messages |
| `getUnreadMessages()` | `Promise<InboxMessage[]>` | Get unread messages |
| `getReadMessages()` | `Promise<InboxMessage[]>` | Get read messages |
| `getDeletedMessages()` | `Promise<InboxMessage[]>` | Get deleted messages |
| `getMessageCount()` | `Promise<number>` | Total message count |
| `getUnreadMessageCount()` | `Promise<number>` | Unread message count |
| `getReadMessageCount()` | `Promise<number>` | Read message count |
| `getDeletedMessageCount()` | `Promise<number>` | Deleted message count |
| `markMessageRead(id)` | `void` | Mark a message as read |
| `markMessageDeleted(id)` | `void` | Mark a message as deleted |
| `markAllMessagesRead()` | `void` | Mark all messages as read |
| `markAllMessagesDeleted()` | `void` | Mark all messages as deleted |
| `trackInboxMessageOpened(message)` | `void` | Track message open analytics (pass the full InboxMessage object) |
| `addTag(tag)` | `void` | Add a tag |
| `addTags(tags)` | `void` | Add multiple tags |
| `removeTag(tag)` | `void` | Remove a tag |
| `removeTags(tags)` | `void` | Remove multiple tags |
| `getTags()` | `Promise<string[]>` | Get all tags |
| `enablePiAnalytics()` | `void` | Enable PI analytics |
| `disablePiAnalytics()` | `void` | Disable PI analytics |
| `isPiAnalyticsEnabled()` | `Promise<boolean>` | Check PI analytics state |
| `enableAnalytics()` | `void` | Enable analytics |
| `disableAnalytics()` | `void` | Disable analytics |
| `isAnalyticsEnabled()` | `Promise<boolean>` | Check analytics state |
| `getDeviceId()` | `Promise<string \| null>` | Get device identifier |
| `setSignedString(signedString)` | `Promise<boolean>` | Set the signed string security token (pass `null` to clear) |
| `getSignedString()` | `Promise<string \| null>` | Get the last stored signed string |
| `enableLogging()` | `void` | Enable debug logging |
| `disableLogging()` | `void` | Disable debug logging |
| `setRegistrationCallback()` | `void` | Start receiving registration change events |
| `unsetRegistrationCallback()` | `void` | Stop receiving registration change events |

### Events

| Event Name | Payload | Description |
|------------|---------|-------------|
| `sfmc_mc_registration` | Registration dictionary | Emitted when registration state changes |

## Notes

Installing this package auto-resolves the shared `sfmc-core`, `push`, and `iam` packages — install once, get all of them.

`MCModule` is exported as an alias for `MarketingCloudSdkModule`. Both reference the same module.

## Versions

- React Native: 0.85.1 (New Architecture mandatory)
- Android: sfmcsdk 3.1.0, marketingcloudsdk 11.0.0
- iOS: MarketingCloudSDK 11.0.0, MarketingCloud-SFMCSdk 4.0.1

## License

BSD 3-Clause. See [LICENSE](../../LICENSE) for details.

