export interface UserSettings {
  autoLockMinutes: number;
  clipboardClearSeconds: number;
  showFavicons: boolean;
  compactMode: boolean;
}

export type UpdateSettingsPayload = Partial<UserSettings>;
