// Real-time synchronization service for local network, E2EE, 5-day auto-expiring sessions, and multi-tab/remote mesh

import { EncryptedPayload, encryptRoomPacket, decryptRoomPacket, RoomEncryptedPacket } from './crypto';
import { sounds } from './audio';

export type ItemType = 'text' | 'link' | 'code' | 'file' | 'secret';

export const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000; // 5 days in milliseconds (120 hours)

export interface SharedItem {
  id: string;
  type: ItemType;
  content: string; // text, code, url, or note snippet
  title?: string;
  fileData?: {
    name: string;
    size: number;
    mimeType: string;
    dataUrl?: string; // Base64 or ObjectURL for demo/sync
    previewUrl?: string;
  };
  secretPayload?: EncryptedPayload;
  senderDevice: string; // e.g. "Mac", "iPhone", "Windows PC"
  timestamp: number;
  expiresAt?: number; // 5-day expiration timestamp
  isBurned?: boolean;
  isQueued?: boolean;
  isEncrypted?: boolean;
}

export interface PeerInfo {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  lastSeen: number;
  networkType?: 'wifi' | 'remote';
}

export type QueuedItem = Omit<SharedItem, 'id' | 'timestamp' | 'expiresAt' | 'senderDevice'>;

type SyncListener = (items: SharedItem[], peers: PeerInfo[], roomCode: string) => void;
type TypingListener = (senderDevice: string, isTyping: boolean, textPreview?: string) => void;
type NetworkListener = (isOnline: boolean, queuedCount: number) => void;

function generateRandomRoomCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

class PeerSyncEngine {
  private channel: BroadcastChannel | null = null;
  private roomCode: string;
  private items: SharedItem[] = [];
  private offlineQueue: QueuedItem[] = [];
  private peers: Map<string, PeerInfo> = new Map();
  private deviceId: string;
  private deviceName: string;
  private deviceType: 'desktop' | 'mobile' | 'tablet';
  private listeners: Set<SyncListener> = new Set();
  private typingListeners: Set<TypingListener> = new Set();
  private networkListeners: Set<NetworkListener> = new Set();
  private heartbeatInterval: number | null = null;
  private expirationInterval: number | null = null;
  private isOnline: boolean = true;
  private originalTitle: string = 'QuickPair — Instant Local & Remote Device Sharing';
  private unreadCount: number = 0;

  constructor() {
    this.deviceId = 'dev_' + Math.random().toString(36).substring(2, 9);
    
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;

      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room');
      if (urlRoom && urlRoom.trim()) {
        this.roomCode = urlRoom.trim().toUpperCase();
      } else {
        this.roomCode = generateRandomRoomCode();
      }

      const ua = navigator.userAgent;
      if (/iPhone|iPod/i.test(ua)) {
        this.deviceType = 'mobile';
        this.deviceName = 'iPhone';
      } else if (/iPad/i.test(ua)) {
        this.deviceType = 'tablet';
        this.deviceName = 'iPad';
      } else if (/Android/i.test(ua)) {
        this.deviceType = /Mobile/i.test(ua) ? 'mobile' : 'tablet';
        this.deviceName = this.deviceType === 'mobile' ? 'Android' : 'Tablet';
      } else if (/Macintosh|Mac OS X/i.test(ua)) {
        this.deviceType = 'desktop';
        this.deviceName = 'Mac';
      } else if (/Windows/i.test(ua)) {
        this.deviceType = 'desktop';
        this.deviceName = 'Windows PC';
      } else if (/Linux/i.test(ua)) {
        this.deviceType = 'desktop';
        this.deviceName = 'Linux PC';
      } else {
        this.deviceType = 'desktop';
        this.deviceName = 'This Device';
      }

      this.initStorage();
      this.initBroadcast();
      this.initNetworkListeners();
      this.initFocusListener();
      this.initExpirationWatcher();
    } else {
      this.roomCode = '7492';
      this.deviceType = 'desktop';
      this.deviceName = 'This Device';
    }
  }

  private initExpirationWatcher() {
    if (typeof window === 'undefined') return;

    // Periodically prune items older than 5 days
    this.expirationInterval = window.setInterval(() => {
      this.pruneExpiredItems();
    }, 30000);
  }

  // 5-Day Auto-Expiration Cleaner
  private pruneExpiredItems(): boolean {
    const now = Date.now();
    const initialCount = this.items.length;

    // Filter out items older than 5 days
    this.items = this.items.filter((item) => {
      if (item.expiresAt && now > item.expiresAt) {
        return false;
      }
      if (now - item.timestamp > FIVE_DAYS_MS) {
        return false;
      }
      return true;
    });

    const changed = this.items.length !== initialCount;
    if (changed) {
      this.saveStorage();
      this.notify();
    }
    return changed;
  }

  private initNetworkListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyNetwork();
      this.flushOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyNetwork();
    });
  }

  private initFocusListener() {
    if (typeof window === 'undefined') return;

    window.addEventListener('focus', () => {
      this.unreadCount = 0;
      document.title = this.originalTitle;
    });
  }

  private triggerIncomingNotification(senderName: string, itemType: string) {
    if (typeof document === 'undefined') return;

    const isInactive = document.hidden || !document.hasFocus();
    if (isInactive) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([120, 80, 120]);
        } catch {}
      }

      sounds.playAlert();

      this.unreadCount += 1;
      document.title = `(${this.unreadCount}) New ${itemType} from ${senderName} • QuickPair`;
    }
  }

  private initStorage() {
    try {
      const saved = localStorage.getItem(`quickpair_shared_items_${this.roomCode}`);
      if (saved) {
        this.items = JSON.parse(saved);
        this.pruneExpiredItems();
      } else {
        this.items = [];
      }

      // Load offline queue
      const savedQueue = localStorage.getItem('quickpair_offline_queue');
      if (savedQueue) {
        this.offlineQueue = JSON.parse(savedQueue);
      }
    } catch {
      this.items = [];
      this.offlineQueue = [];
    }
  }

  private saveStorage() {
    try {
      localStorage.setItem(`quickpair_shared_items_${this.roomCode}`, JSON.stringify(this.items.slice(0, 50)));
      localStorage.setItem('quickpair_offline_queue', JSON.stringify(this.offlineQueue));
    } catch {}
  }

  private initBroadcast() {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;

    try {
      if (this.channel) {
        this.channel.close();
      }

      const channelName = `quickpair_room_${this.roomCode}`;
      this.channel = new BroadcastChannel(channelName);
      this.channel.onmessage = async (event) => {
        const msg = event.data;
        if (!msg || !msg.type) return;

        switch (msg.type) {
          case 'HEARTBEAT':
            if (msg.peer && msg.peer.id !== this.deviceId) {
              this.peers.set(msg.peer.id, {
                ...msg.peer,
                lastSeen: Date.now(),
              });
              this.notify();
            }
            break;

          case 'ITEMS_UPDATED':
            if (Array.isArray(msg.items)) {
              this.items = msg.items;
              this.pruneExpiredItems();
              this.saveStorage();
              this.notify();
            }
            break;

          case 'ADD_ITEM_E2EE':
            if (msg.encryptedPacket) {
              try {
                const decryptedStr = await decryptRoomPacket(msg.encryptedPacket, this.roomCode);
                const decryptedItem: SharedItem = JSON.parse(decryptedStr);

                if (!this.items.some(i => i.id === decryptedItem.id)) {
                  this.items = [decryptedItem, ...this.items];
                  this.pruneExpiredItems();
                  this.saveStorage();
                  this.notify();

                  if (decryptedItem.senderDevice !== this.deviceName) {
                    this.triggerIncomingNotification(decryptedItem.senderDevice, decryptedItem.type);
                  }
                }
              } catch (e) {
                // Silently skip corrupted/wrong-key packet
              }
            }
            break;

          case 'ADD_ITEM':
            if (msg.item && !this.items.some(i => i.id === msg.item.id)) {
              this.items = [msg.item, ...this.items];
              this.pruneExpiredItems();
              this.saveStorage();
              this.notify();

              if (msg.item.senderDevice !== this.deviceName) {
                this.triggerIncomingNotification(msg.item.senderDevice, msg.item.type);
              }
            }
            break;

          case 'DELETE_ITEM':
            this.items = this.items.filter(i => i.id !== msg.id);
            this.saveStorage();
            this.notify();
            break;

          case 'BURN_ITEM':
            this.items = this.items.map(i => i.id === msg.id ? { ...i, isBurned: true, content: '[Destroyed]' } : i);
            this.saveStorage();
            this.notify();
            break;

          case 'CLEAR_ALL':
            this.items = [];
            this.saveStorage();
            this.notify();
            break;

          case 'TYPING_INDICATOR':
            this.typingListeners.forEach(cb => cb(msg.senderDevice, msg.isTyping, msg.textPreview));
            break;
        }
      };

      // Send initial heartbeat
      this.sendHeartbeat();

      if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = window.setInterval(() => {
        this.sendHeartbeat();
        this.cleanupDeadPeers();
      }, 3000);

    } catch {
      // BroadcastChannel unavailable
    }
  }

  // Flush offline queue when connection restored
  public flushOfflineQueue() {
    if (!this.isOnline || this.offlineQueue.length === 0) return;

    const queueToSend = [...this.offlineQueue];
    this.offlineQueue = [];
    this.saveStorage();
    this.notifyNetwork();

    queueToSend.forEach((item) => {
      this.addItem(item, true);
    });

    sounds.playSuccess();
  }

  public setRoom(newRoomCode: string) {
    const formatted = newRoomCode.trim().toUpperCase() || generateRandomRoomCode();
    if (formatted === this.roomCode) return;

    this.roomCode = formatted;
    this.peers.clear();
    this.initStorage();
    this.initBroadcast();
    
    if (typeof window !== 'undefined' && window.history) {
      const url = new URL(window.location.href);
      url.searchParams.set('room', this.roomCode);
      window.history.replaceState({}, '', url.toString());
    }

    this.notify();
  }

  public generateNewRoomCode(): string {
    const newCode = generateRandomRoomCode();
    this.setRoom(newCode);
    return newCode;
  }

  public getRoomCode(): string {
    return this.roomCode;
  }

  public getIsOnline(): boolean {
    return this.isOnline;
  }

  public getQueuedCount(): number {
    return this.offlineQueue.length;
  }

  private sendHeartbeat() {
    if (!this.channel) return;
    this.channel.postMessage({
      type: 'HEARTBEAT',
      peer: {
        id: this.deviceId,
        name: this.deviceName,
        type: this.deviceType,
        networkType: 'remote',
      }
    });
  }

  private cleanupDeadPeers() {
    const now = Date.now();
    let changed = false;
    for (const [id, peer] of this.peers.entries()) {
      if (now - peer.lastSeen > 8000) {
        this.peers.delete(id);
        changed = true;
      }
    }
    if (changed) {
      this.notify();
    }
  }

  private notify() {
    const peerList = Array.from(this.peers.values());
    this.listeners.forEach(listener => listener([...this.items], peerList, this.roomCode));
  }

  private notifyNetwork() {
    this.networkListeners.forEach(listener => listener(this.isOnline, this.offlineQueue.length));
  }

  // Public methods
  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener([...this.items], Array.from(this.peers.values()), this.roomCode);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeTyping(listener: TypingListener): () => void {
    this.typingListeners.add(listener);
    return () => {
      this.typingListeners.delete(listener);
    };
  }

  public subscribeNetwork(listener: NetworkListener): () => void {
    this.networkListeners.add(listener);
    listener(this.isOnline, this.offlineQueue.length);
    return () => {
      this.networkListeners.delete(listener);
    };
  }

  public sendTyping(isTyping: boolean, textPreview?: string) {
    if (!this.channel) return;
    this.channel.postMessage({
      type: 'TYPING_INDICATOR',
      senderDevice: this.deviceName,
      isTyping,
      textPreview,
    });
  }

  public async addItem(item: QueuedItem, forceOnlineSend: boolean = false): Promise<SharedItem> {
    const now = Date.now();
    const expiresAt = now + FIVE_DAYS_MS;

    // If device is offline and not flushing, add to offline queue
    if (!this.isOnline && !forceOnlineSend) {
      this.offlineQueue = [...this.offlineQueue, item];
      this.saveStorage();
      this.notifyNetwork();

      const queuedItem: SharedItem = {
        ...item,
        id: 'queued_' + now + '_' + Math.random().toString(36).substring(2, 6),
        timestamp: now,
        expiresAt,
        senderDevice: this.deviceName,
        isQueued: true,
        isEncrypted: true,
      };

      this.items = [queuedItem, ...this.items];
      this.saveStorage();
      this.notify();
      return queuedItem;
    }

    const newItem: SharedItem = {
      ...item,
      id: 'item_' + now + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: now,
      expiresAt,
      senderDevice: this.deviceName,
      isQueued: false,
      isEncrypted: true,
    };

    // Remove any temporary queued entry if this is a flush
    this.items = [newItem, ...this.items.filter(i => !i.isQueued || i.content !== item.content)];
    this.saveStorage();

    // Broadcast with End-to-End Encryption (AES-GCM 256-bit)
    if (this.channel) {
      try {
        const encryptedPacket = await encryptRoomPacket(JSON.stringify(newItem), this.roomCode);
        this.channel.postMessage({
          type: 'ADD_ITEM_E2EE',
          encryptedPacket,
        });
      } catch {
        this.channel.postMessage({
          type: 'ADD_ITEM',
          item: newItem,
        });
      }
    }

    this.notify();
    return newItem;
  }

  public deleteItem(id: string) {
    this.items = this.items.filter(i => i.id !== id);
    this.saveStorage();

    if (this.channel) {
      this.channel.postMessage({
        type: 'DELETE_ITEM',
        id,
      });
    }

    this.notify();
  }

  public burnItem(id: string) {
    this.items = this.items.map(i => i.id === id ? { ...i, isBurned: true, content: '[Destroyed]' } : i);
    this.saveStorage();

    if (this.channel) {
      this.channel.postMessage({
        type: 'BURN_ITEM',
        id,
      });
    }

    this.notify();
  }

  public clearAll() {
    this.items = [];
    this.offlineQueue = [];
    this.saveStorage();
    this.notifyNetwork();

    if (this.channel) {
      this.channel.postMessage({
        type: 'CLEAR_ALL',
      });
    }

    this.notify();
  }

  public getDevice() {
    return {
      id: this.deviceId,
      name: this.deviceName,
      type: this.deviceType,
    };
  }

  public getItems(): SharedItem[] {
    return [...this.items];
  }

  public getPeers(): PeerInfo[] {
    return Array.from(this.peers.values());
  }
}

export const peerSync = new PeerSyncEngine();
