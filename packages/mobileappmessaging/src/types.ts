export interface MobileAppMessagingApi {
    getDeviceId(): Promise<string | null>;
  enableAnalytics(): void;
  disableAnalytics(): void;
  isAnalyticsEnabled(): Promise<boolean>;
}

export interface Registration {
  deviceId?: string;
  version?: string;
}
