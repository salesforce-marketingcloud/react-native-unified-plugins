// Product packages MUST NOT re-export sibling packages. Customers import shared
// modules (PushModule, IamModule, SFMCSdkModule) directly from their own packages.
// We do export each name twice (canonical + short alias matching iOS RN bridge class)
// so example apps that use either form resolve to the same value.
export { MobileAppMessagingModule, MobileAppMessagingModule as MAMModule } from './MobileAppMessagingModule';
export type { MobileAppMessagingApi, MobileAppMessagingApi as MAMApi } from './types';
export type { Registration } from './types';
