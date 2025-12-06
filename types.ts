export enum GameMode {
  ROCKET_LEAGUE = 'Rocket League',
  E_CONSOLE = 'eConsole',
  E_MOBILE = 'eMobile'
}

export interface Country {
  id: string;
  name: string;
  isoCode: string; // Changed from flag emoji to ISO code for API
  rank: number;
}

export interface BroadcastMessage {
  type: 'UPDATE_RANKINGS';
  gameMode: GameMode;
  countries: Country[];
  timestamp?: number; // Added for sync versioning
}

export const ADMIN_PASSWORD = 'sp2efifa';
export const BROADCAST_CHANNEL_NAME = 'rankings_app_channel';
