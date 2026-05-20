export interface MobileAppMessagingApi {
    getDeviceId(): Promise<string | null>;
  enableAnalytics(): void;
  disableAnalytics(): void;
  isAnalyticsEnabled(): Promise<boolean>;
  setRegistrationCallback(): void;
  unsetRegistrationCallback(): void;
}

export interface Registration {
  deviceId?: string;
  version?: string;
}
