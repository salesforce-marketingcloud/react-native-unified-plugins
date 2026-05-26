import { NativeEventEmitter } from 'react-native';
import NativeModule from './NativeMAMModule';
import type { MobileAppMessagingApi } from './types';

let _api: MobileAppMessagingApi | null = null;
let _emitter: NativeEventEmitter | null = null;

export const MobileAppMessagingModule = {
  async requestSdk(): Promise<MobileAppMessagingApi> {
    if (_api) return _api;
    await NativeModule.requestMamSdk();
    _api = {
      getDeviceId: () => NativeModule.getDeviceId(),
      enableAnalytics: () => NativeModule.enableAnalytics(),
      disableAnalytics: () => NativeModule.disableAnalytics(),
      isAnalyticsEnabled: () => NativeModule.isAnalyticsEnabled(),
      setRegistrationCallback: () => NativeModule.setRegistrationCallback(),
      unsetRegistrationCallback: () => NativeModule.unsetRegistrationCallback(),
    };
    return _api;
  },

  getEmitter(): NativeEventEmitter {
    if (!_emitter) _emitter = new NativeEventEmitter(NativeModule);
    return _emitter;
  },
};
