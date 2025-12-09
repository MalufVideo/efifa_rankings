import { BroadcastMessage, GameMode, Country, LayoutSettings, AnimationSettings, RankPositionOffsets } from '../types';

// CONFIGURATION
const STORAGE_KEY = 'rankings_app_state';
const POLL_INTERVAL_MS = 2000; 

// TO ENABLE GLOBAL SYNC:
// 1. Create a bin on a service like https://jsonbin.io or https://npoint.io
// 2. Paste the URL below.
// 3. Ensure the Admin page can PUT/POST to it and Broadcast can GET from it.
const REMOTE_API_URL = '/api/rankings'; 

class BroadcastService {
  private channel: BroadcastChannel;
  private listeners: ((message: BroadcastMessage) => void)[] = [];
  private lastTimestamp = 0;

  constructor() {
    this.channel = new BroadcastChannel('rankings_channel');

    // 1. Listener for instant local tab updates
    this.channel.onmessage = (event) => {
      this.handleIncomingData(event.data);
    };

    // 2. Polling for persistent/remote updates
    setInterval(() => this.checkStorageUpdates(), POLL_INTERVAL_MS);
    
    // 3. Listener for same-browser storage events
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        this.checkStorageUpdates();
      }
    });
  }

  // --- ADMIN ACTIONS ---

  public saveState(gameMode: GameMode, countries: Country[], layoutSettings?: LayoutSettings, animationSettings?: AnimationSettings, rankPositionOffsets?: RankPositionOffsets) {
    const message: BroadcastMessage = {
      type: 'UPDATE_RANKINGS',
      gameMode,
      countries,
      layoutSettings,
      animationSettings,
      rankPositionOffsets,
      timestamp: Date.now(),
    };

    // A. Instant Local Notification (BroadcastChannel)
    this.channel.postMessage(message);
    this.handleIncomingData(message);

    // B. Persist to Local Storage (Browser DB)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(message));

    // C. Push to Remote Server (Global Sync)
    if (REMOTE_API_URL) {
      fetch(REMOTE_API_URL, {
        method: 'POST', // or PUT depending on the service
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      }).catch(err => console.error("Cloud sync failed:", err));
    }
  }

  // --- BROADCAST ACTIONS ---

  public subscribe(callback: (message: BroadcastMessage) => void) {
    this.listeners.push(callback);
    // Check for existing state immediately upon load
    this.checkStorageUpdates();
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // --- INTERNAL LOGIC ---

  private handleIncomingData(data: any) {
    // Validate data structure
    if (!data || data.type !== 'UPDATE_RANKINGS' || !data.countries) return;

    const message = data as BroadcastMessage;
    const ts = message.timestamp || 0;

    // Only update if newer or if we have no state yet
    if (ts >= this.lastTimestamp) {
      this.lastTimestamp = ts;
      this.listeners.forEach(cb => cb(message));
    }
  }

  private async checkStorageUpdates() {
    // 1. Try Remote First (if configured)
    if (REMOTE_API_URL) {
      try {
        const res = await fetch(REMOTE_API_URL + '?t=' + Date.now()); // bust cache
        if (res.ok) {
          const remoteData = await res.json();
          this.handleIncomingData(remoteData);
          return;
        }
      } catch (e) {
        // Fail silently and try local
      }
    }

    // 2. Try Local Storage
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        this.handleIncomingData(parsed);
      } catch (e) {
        console.error("Corrupt local state", e);
      }
    }
  }
}

export const broadcastService = new BroadcastService();
