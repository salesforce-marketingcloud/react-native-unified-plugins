import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  requestSfmcSdk(): Promise<void>;
  setProfileId(profileId: string): void;
  setAttribute(key: string, value: string): void;
  clearAttribute(key: string): void;
  setAttributes(attributes: Object): void;
  getAttributes(): Promise<Object | null>;
  clearAllAttributes(): void;
  getProfileId(): Promise<string | null>;
  getPartyIdentificationName(): Promise<string | null>;
  setPartyIdentificationName(name: string): void;
  getPartyIdentificationNumber(): Promise<string | null>;
  setPartyIdentificationNumber(number: string): void;
  getPartyIdentificationType(): Promise<string | null>;
  setPartyIdentificationType(type: string): void;
  track(event: Object): void;
  setLogging(level: string): void;
  getSdkState(): Promise<Object>;
  sendImmediate(event: Object): void;
  flush(): void;
  getVersion(): Promise<string>;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('SFMCSdkCoreModule');
