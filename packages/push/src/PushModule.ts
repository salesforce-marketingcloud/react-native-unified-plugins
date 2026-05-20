import { NativeEventEmitter } from 'react-native';
import NativeModule from './NativeSFMCPushModule';
import type { PushApi } from './types';

let _api: PushApi | null = null;

export const PushModule = {
  async requestSdk(): Promise<PushApi> {
    if (_api) return _api;
    await NativeModule.requestPushSdk();
    _api = {
      enablePush: () => NativeModule.enablePush(),
      disablePush: () => NativeModule.disablePush(),
      setPushEnabled: (enabled: boolean) => NativeModule.setPushEnabled(enabled),
      getSystemToken: () => NativeModule.getSystemToken(),
      isPushEnabled: () => NativeModule.isPushEnabled(),
    };
    return _api;
  },

  getEmitter(): NativeEventEmitter {
    return new NativeEventEmitter(NativeModule);
  },
};
