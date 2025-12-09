import { Country, GameMode, LayoutSettings, AnimationSettings } from './types';

// Default layout settings
export const DEFAULT_LAYOUT_SETTINGS: LayoutSettings = {
  fontSize: 24,        // Default text size (2xl = ~24px)
  textPositionX: 0,    // No offset by default
  rankPositionX: 0,    // No offset by default
  rankSize: 1,         // 1x multiplier (default size)
  flagSize: 1,         // 1x multiplier (default size)
  flagPositionX: 0,    // No offset by default
  headerFontSize: 36,  // Default header text size
  headerPositionX: 0,  // No offset by default
};

// Default animation settings (current values used in codebase)
export const DEFAULT_ANIMATION_SETTINGS: AnimationSettings = {
  stiffness: 300,      // Spring stiffness
  damping: 30,         // Spring damping
  mass: 1,             // Spring mass
  layoutDuration: 0.8, // Layout animation duration in seconds
};

const createCountry = (id: string, name: string, isoCode: string, rank: number): Country => ({
  id, name, isoCode, rank
});

const createHeader = (id: string, name: string): Country => ({
  id, name, isoCode: '', rank: 0, isHeader: true
});

export const INITIAL_DATA: Record<GameMode, Country[]> = {
  [GameMode.ROCKET_LEAGUE]: [
    createCountry('rl-1', 'Morocco', 'ma', 1),
    createCountry('rl-2', 'Australia', 'au', 2),
    createCountry('rl-3', 'France', 'fr', 3),
    createCountry('rl-4', 'Malaysia', 'my', 4),
    createCountry('rl-5', 'England', 'gb-eng', 5),
    createCountry('rl-6', 'Belgium', 'be', 6),
    createCountry('rl-7', 'South Africa', 'za', 7),
    createCountry('rl-8', 'Netherlands', 'nl', 8),
    createCountry('rl-9', 'Saudi Arabia', 'sa', 9),
    createCountry('rl-10', 'Oman', 'om', 10),
    createCountry('rl-11', 'USA', 'us', 11),
    createCountry('rl-12', 'Brazil', 'br', 12),
    createCountry('rl-13', 'Chile', 'cl', 13),
    createCountry('rl-14', 'Germany', 'de', 14),
    createCountry('rl-15', 'Italy', 'it', 15),
    createCountry('rl-16', 'Norway', 'no', 16),
  ],
  [GameMode.E_CONSOLE]: [
    createCountry('ec-1', 'Saudi Arabia', 'sa', 1),
    createCountry('ec-2', 'Italy', 'it', 2),
    createCountry('ec-3', 'Brazil', 'br', 3),
    createCountry('ec-4', 'Chile', 'cl', 4),
    createCountry('ec-5', 'Thailand', 'th', 5),
    createCountry('ec-6', 'Türkiye', 'tr', 6),
    createCountry('ec-7', 'Morocco', 'ma', 7),
    createCountry('ec-8', 'Jordan', 'jo', 8),
    createCountry('ec-9', 'Japan', 'jp', 9),
    createCountry('ec-10', 'Poland', 'pl', 10),
    createCountry('ec-11', 'Indonesia', 'id', 11),
    createCountry('ec-12', 'Mexico', 'mx', 12),
  ],
  [GameMode.E_MOBILE]: [
    createCountry('em-1', 'Türkiye', 'tr', 1),
    createCountry('em-2', 'Japan', 'jp', 2),
    createCountry('em-3', 'Morocco', 'ma', 3),
    createCountry('em-4', 'India', 'in', 4),
    createCountry('em-5', 'Colombia', 'co', 5),
    createCountry('em-6', 'Greece', 'gr', 6),
    createCountry('em-7', 'Saudi Arabia', 'sa', 7),
    createCountry('em-8', 'Bahrain', 'bh', 8),
    createCountry('em-9', 'Brazil', 'br', 9),
    createCountry('em-10', 'Thailand', 'th', 10),
    createCountry('em-11', 'Egypt', 'eg', 11),
    createCountry('em-12', 'Malaysia', 'my', 12),
  ],
  [GameMode.E_CONSOLE_GROUP_A]: [
    createHeader('ecga-header', 'GROUP A'),
    createCountry('ecga-1', 'Saudi Arabia', 'sa', 1),
    createCountry('ecga-2', 'Italy', 'it', 2),
    createCountry('ecga-3', 'Brazil', 'br', 3),
    createCountry('ecga-4', 'Chile', 'cl', 4),
    createCountry('ecga-5', 'Thailand', 'th', 5),
    createCountry('ecga-6', 'Türkiye', 'tr', 6),
  ],
  [GameMode.E_CONSOLE_GROUP_B]: [
    createHeader('ecgb-header', 'GROUP B'),
    createCountry('ecgb-1', 'Morocco', 'ma', 1),
    createCountry('ecgb-2', 'Jordan', 'jo', 2),
    createCountry('ecgb-3', 'Japan', 'jp', 3),
    createCountry('ecgb-4', 'Poland', 'pl', 4),
    createCountry('ecgb-5', 'Indonesia', 'id', 5),
    createCountry('ecgb-6', 'Mexico', 'mx', 6),
  ],
  [GameMode.E_MOBILE_GROUP_A]: [
    createHeader('emga-header', 'GROUP A'),
    createCountry('emga-1', 'Saudi Arabia', 'sa', 1),
    createCountry('emga-2', 'Bahrain', 'bh', 2),
    createCountry('emga-3', 'Brazil', 'br', 3),
    createCountry('emga-4', 'Thailand', 'th', 4),
    createCountry('emga-5', 'Egypt', 'eg', 5),
    createCountry('emga-6', 'Malaysia', 'my', 6),
  ],
  [GameMode.E_MOBILE_GROUP_B]: [
    createHeader('emgb-header', 'GROUP B'),
    createCountry('emgb-1', 'Türkiye', 'tr', 1),
    createCountry('emgb-2', 'Japan', 'jp', 2),
    createCountry('emgb-3', 'Morocco', 'ma', 3),
    createCountry('emgb-4', 'India', 'in', 4),
    createCountry('emgb-5', 'Colombia', 'co', 5),
    createCountry('emgb-6', 'Greece', 'gr', 6),
  ]
};

// Layout configuration
export const CELL_WIDTH = 1376;
export const CELL_HEIGHT = 86;
export const CANVAS_WIDTH = 1376;
export const CANVAS_HEIGHT = 1376;
