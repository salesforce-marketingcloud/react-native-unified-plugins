// Product packages MUST NOT re-export sibling packages. Customers import shared
// modules (PushModule, IamModule, SFMCSdkModule) directly from their own packages.
// We do export each name twice (canonical + short alias matching iOS RN bridge class)
// so example apps that use either form resolve to the same value.
export { MarketingCloudSdkModule, MarketingCloudSdkModule as MCModule } from './MarketingCloudSdkModule';
export type { MarketingCloudSdkApi, MarketingCloudSdkApi as MCApi } from './types';
export type { InboxMessage, PiCart, PiOrder } from './types';
