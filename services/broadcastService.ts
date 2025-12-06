import { BROADCAST_CHANNEL_NAME, BroadcastMessage } from '../types';

class BroadcastService {
  private channel: BroadcastChannel;

  constructor() {
    this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }

  public sendMessage(message: BroadcastMessage) {
    this.channel.postMessage(message);
  }

  public onMessage(callback: (message: BroadcastMessage) => void) {
    const handler = (event: MessageEvent) => {
      callback(event.data);
    };
    this.channel.addEventListener('message', handler);
    return () => this.channel.removeEventListener('message', handler);
  }

  public close() {
    this.channel.close();
  }
}

export const broadcastService = new BroadcastService();
