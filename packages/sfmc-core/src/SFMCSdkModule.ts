import { NativeEventEmitter } from 'react-native';
import NativeModule from './NativeSFMCSdkCoreModule';
import type { SFMCSdkApi } from './types';
import type { SFMCEvent } from './events';

let _api: SFMCSdkApi | null = null;

export const SFMCSdkModule = {
  async requestSdk(): Promise<SFMCSdkApi> {
    if (_api) return _api;
    await NativeModule.requestSfmcSdk();
    _api = {
      setProfileId: (profileId: string) => NativeModule.setProfileId(profileId),
      setAttribute: (key: string, value: string) => NativeModule.setAttribute(key, value),
      clearAttribute: (key: string) => NativeModule.clearAttribute(key),
      setAttributes: (attributes: { [key: string]: string }) => NativeModule.setAttributes(attributes),
      getAttributes: () => NativeModule.getAttributes() as Promise<{ [key: string]: string } | null>,
      clearAllAttributes: () => NativeModule.clearAllAttributes(),
      getProfileId: () => NativeModule.getProfileId(),
      getPartyIdentificationName: () => NativeModule.getPartyIdentificationName(),
      setPartyIdentificationName: (name: string) => NativeModule.setPartyIdentificationName(name),
      getPartyIdentificationNumber: () => NativeModule.getPartyIdentificationNumber(),
      setPartyIdentificationNumber: (numberValue: string) => NativeModule.setPartyIdentificationNumber(numberValue),
      getPartyIdentificationType: () => NativeModule.getPartyIdentificationType(),
      setPartyIdentificationType: (type: string) => NativeModule.setPartyIdentificationType(type),
      track: (event: SFMCEvent) => NativeModule.track(event as unknown as Object),
      setLogging: (level: 'DEBUG' | 'WARN' | 'ERROR' | 'NONE') => NativeModule.setLogging(level),
      getSdkState: () => NativeModule.getSdkState() as Promise<{ [key: string]: any }>,
      sendImmediate: (event: SFMCEvent) => NativeModule.sendImmediate(event as unknown as Object),
      flush: () => NativeModule.flush(),
    };
    return _api;
  },

  getEmitter(): NativeEventEmitter {
    return new NativeEventEmitter(NativeModule);
  },
};
