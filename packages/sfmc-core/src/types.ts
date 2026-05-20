import type { SFMCEvent } from './events';

export interface SFMCSdkApi {
  setProfileId(profileId: string): void;
  setAttribute(key: string, value: string): void;
  clearAttribute(key: string): void;
  setAttributes(attributes: { [key: string]: string }): void;
  getAttributes(): Promise<{ [key: string]: string } | null>;
  clearAllAttributes(): void;
  getProfileId(): Promise<string | null>;
  getPartyIdentificationName(): Promise<string | null>;
  setPartyIdentificationName(name: string): void;
  getPartyIdentificationNumber(): Promise<string | null>;
  setPartyIdentificationNumber(numberValue: string): void;
  getPartyIdentificationType(): Promise<string | null>;
  setPartyIdentificationType(type: string): void;
  track(event: SFMCEvent): void;
  setLogging(level: 'DEBUG' | 'WARN' | 'ERROR' | 'NONE'): void;
  getSdkState(): Promise<{ [key: string]: any }>;
  sendImmediate(event: SFMCEvent): void;
  flush(): void;
}
