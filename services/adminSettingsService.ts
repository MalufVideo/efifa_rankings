import { GameMode, Country, LayoutSettings, RankPositionOffsets } from '../types';

const API_URL = '/api/admin-settings';

export interface AdminSettings {
  draftRankings: Record<GameMode, Country[]>;
  liveRankings: Record<GameMode, Country[]>;
  layoutSettings: LayoutSettings;
  selectedMode: GameMode;
  rankPositionOffsets?: RankPositionOffsets; // Fine-tune Y position per rank number (-20 to +20 px)
  timestamp: number;
}

class AdminSettingsService {
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;
  private pendingSettings: AdminSettings | null = null;

  // Load settings from server
  async loadSettings(): Promise<AdminSettings | null> {
    try {
      const res = await fetch(API_URL + '?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.error('Failed to load admin settings:', err);
    }
    return null;
  }

  // Save settings to server (debounced to avoid too many writes)
  saveSettings(settings: AdminSettings): void {
    this.pendingSettings = { ...settings, timestamp: Date.now() };

    // Debounce saves by 500ms to avoid excessive writes during rapid changes
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      if (this.pendingSettings) {
        this.persistSettings(this.pendingSettings);
        this.pendingSettings = null;
      }
    }, 500);
  }

  // Immediate save (called on ANIMA button press)
  async saveSettingsImmediate(settings: AdminSettings): Promise<boolean> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    return this.persistSettings({ ...settings, timestamp: Date.now() });
  }

  private async persistSettings(settings: AdminSettings): Promise<boolean> {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to save admin settings:', err);
      return false;
    }
  }
}

export const adminSettingsService = new AdminSettingsService();
