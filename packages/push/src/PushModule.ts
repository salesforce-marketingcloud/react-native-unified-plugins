import { NativeEventEmitter } from 'react-native';
import NativeModule from './NativeSFMCPushModule';
import type { PushApi } from './types';

let _api: PushApi | null = null;
let _emitter: NativeEventEmitter | null = null;

export const PushModule = {
  async requestSdk(): Promise<PushApi> {
    if (_api) return _api;
    await NativeModule.requestPushSdk();
    _api = {
      enablePush: () => NativeModule.enablePush(),
      disablePush: () => NativeModule.disablePush(),
      getSystemToken: () => NativeModule.getSystemToken(),
      isPushEnabled: () => NativeModule.isPushEnabled(),
    };
    return _api;
  },

  getEmitter(): NativeEventEmitter {
    if (!_emitter) _emitter = new NativeEventEmitter(NativeModule);
    return _emitter;
  },
};
