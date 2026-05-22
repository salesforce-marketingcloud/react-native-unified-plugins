export interface PushApi {
    enablePush(): void;
  disablePush(): void;
  getPushToken(): Promise<string | null>;
  isPushEnabled(): Promise<boolean>;
}

// Push notification model. Field set may grow with SDK updates.
export interface NotificationMessage {
  id: string;
  title?: string;
  alert?: string;
  subtitle?: string;
  sound?: string;
  type?: string;
  trigger?: string;
  custom?: string;
  customKeys?: { [key: string]: string };
  url?: string;
  media?: { url?: string; alt?: string };
  region?: Region;
}

export interface Region {
  id: string;
  latitude: number;
  longitude: number;
  radius: number;
  proximity?: 'enter' | 'exit';
}

export interface Action {
  type: 'OPEN_APP' | 'DEEPLINK' | 'URL' | 'DISMISS' | 'CLOUD_PAGE';
  data?: string;
}
