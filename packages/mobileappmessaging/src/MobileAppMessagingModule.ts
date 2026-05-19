import NativeModule from './NativeMAMModule';
import type { MobileAppMessagingApi } from './types';

let _api: MobileAppMessagingApi | null = null;

export const MobileAppMessagingModule = {
  async requestSdk(): Promise<MobileAppMessagingApi> {
    if (_api) return _api;
    await NativeModule.requestMamSdk();
    _api = {
      getDeviceId: () => NativeModule.getDeviceId(),
      enableAnalytics: () => NativeModule.enableAnalytics(),
      disableAnalytics: () => NativeModule.disableAnalytics(),
      isAnalyticsEnabled: () => NativeModule.isAnalyticsEnabled(),
      getVersion: () => NativeModule.getVersion()
    };
    return _api;
  },
};
