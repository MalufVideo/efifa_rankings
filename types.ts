export enum GameMode {
  ROCKET_LEAGUE = 'Rocket League',
  E_CONSOLE = 'eConsole',
  E_MOBILE = 'eMobile',
  E_CONSOLE_GROUP_A = 'eConsole Group A',
  E_CONSOLE_GROUP_B = 'eConsole Group B',
  E_MOBILE_GROUP_A = 'eMobile Group A',
  E_MOBILE_GROUP_B = 'eMobile Group B'
}

export interface Country {
  id: string;
  name: string;
  isoCode: string; // Changed from flag emoji to ISO code for API
  rank: number;
  isHeader?: boolean; // True for group header rows
}

export interface LayoutSettings {
  fontSize: number;       // Font size for country name (px)
  textPositionX: number;  // X offset for text (px)
  rankPositionX: number;  // X offset for rank number (px)
  rankSize: number;       // Rank number size multiplier (1 = default)
  flagSize: number;       // Flag size multiplier (1 = default)
  flagPositionX: number;  // X offset for flag (px)
  headerFontSize: number; // Font size for group headers (px)
  headerPositionX: number; // X offset for group headers (px)
}

export interface BroadcastMessage {
  type: 'UPDATE_RANKINGS';
  gameMode: GameMode;
  countries: Country[];
  layoutSettings?: LayoutSettings;
  timestamp?: number; // Added for sync versioning
}

export const ADMIN_PASSWORD = 'sp2efifa';
export const BROADCAST_CHANNEL_NAME = 'rankings_app_channel';
