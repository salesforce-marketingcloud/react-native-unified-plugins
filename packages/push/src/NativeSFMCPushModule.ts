import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  requestPushSdk(): Promise<void>;
  enablePush(): void;
  disablePush(): void;
  setPushEnabled(enabled: boolean): void;
  getSystemToken(): Promise<string | null>;
  isPushEnabled(): Promise<boolean>;
  areNotificationsEnabled(): Promise<boolean>;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('SFMCPushModule');
