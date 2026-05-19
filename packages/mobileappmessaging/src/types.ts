export interface MobileAppMessagingApi {
    getDeviceId(): Promise<string | null>;
  enableAnalytics(): void;
  disableAnalytics(): void;
  isAnalyticsEnabled(): Promise<boolean>;
  getVersion(): Promise<string>;
}

export interface Registration {
  deviceId?: string;
  version?: string;
}
