export interface IamApi {
    // (no callable methods — module is event-only)
}

export interface InAppMessage {
  id: string;
  priority: number;
  startDateUtc?: string;
  endDateUtc?: string;
  modifiedDateUtc?: string;
  displayLimit: number;
  displayCount: number;
  type: string;
  windowColor?: string;
  displayDuration: number;
  backgroundColor?: string;
  cornerRadius: string;
  layoutOrder: string;
  messageDelaySec: number;
  appLimitOverride: boolean;
}

export interface InAppMessageCloseAction {
  actionType: 'AUTO' | 'BUTTON' | 'CLOSED' | 'UNKNOWN';
  id?: string;
}
