import { NativeEventEmitter } from 'react-native';
import NativeModule from './NativeSFMCIamModule';
import type { IamApi } from './types';

let _api: IamApi | null = null;
let _emitter: NativeEventEmitter | null = null;

export const IamModule = {
  async requestSdk(): Promise<IamApi> {
    if (_api) return _api;
    await NativeModule.requestIamSdk();
    _api = {
      showInAppMessage: (messageId: string) => NativeModule.showInAppMessage(messageId),
    };
    return _api;
  },

  getEmitter(): NativeEventEmitter {
    if (!_emitter) _emitter = new NativeEventEmitter(NativeModule);
    return _emitter;
  },
};
