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

export interface AnimationSettings {
  stiffness: number;       // Spring stiffness (higher = faster snap)
  damping: number;         // Spring damping (higher = less bounce)
  mass: number;            // Spring mass (higher = slower)
  layoutDuration: number;  // Duration for layout transitions (seconds)
}

export interface BroadcastMessage {
  type: 'UPDATE_RANKINGS';
  gameMode: GameMode;
  countries: Country[];
  layoutSettings?: LayoutSettings;
  animationSettings?: AnimationSettings;
  rankPositionOffsets?: RankPositionOffsets; // Fine-tune Y position per rank number
  timestamp?: number; // Added for sync versioning
}

// Rank position Y offsets: maps rank number (1-16) to Y offset in pixels (-20 to +20)
export type RankPositionOffsets = Record<number, number>;

export const ADMIN_PASSWORD = 'sp2efifa';
export const BROADCAST_CHANNEL_NAME = 'rankings_app_channel';
