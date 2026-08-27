// Real-time synchronization service for Instant Zero-Delay Mesh, Firestore Cloud E2EE, 5-day auto-expiring sessions, and multi-device pairing

import { EncryptedPayload, encryptRoomPacket, decryptRoomPacket } from './crypto';
import { sounds } from './audio';
import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';

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

function cleanData<T extends object>(data: T): any {
  return JSON.parse(JSON.stringify(data));
}

class PeerSyncEngine {
  private channel: BroadcastChannel | null = null;
  private roomCode: string = 'main';
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
  private firestoreUnsubs: Unsubscribe[] = [];
  private lastTypingSent: number = 0;

  constructor() {
    this.deviceId = 'dev_' + Math.random().toString(36).substring(2, 9);
    
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;

      // 1. Determine Room Code: URL param > saved preference > instant default 'main'
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room');
      
      if (urlRoom && urlRoom.trim()) {
        this.roomCode = urlRoom.trim().toUpperCase();
      } else {
        const savedRoom = localStorage.getItem('quickpair_active_room');
        this.roomCode = savedRoom && savedRoom.trim() ? savedRoom.trim().toUpperCase() : 'main';
      }

      // 2. Identify Device Profile (iOS, Android, Mac, Windows)
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

      // 3. Initialize Services
      this.initStorage();
      this.initBroadcast();
      this.initFirestore();
      this.initNetworkListeners();
      this.initFocusAndVisibilityListeners();
      this.initExpirationWatcher();
      this.initUnloadListener();
    } else {
      this.roomCode = 'main';
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
      this.initFirestore(); // Re-establish Firestore stream immediately
      this.sendHeartbeat();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyNetwork();
    });
  }

  private initFocusAndVisibilityListeners() {
    if (typeof window === 'undefined') return;

    const handleActiveState = () => {
      if (document.visibilityState === 'visible') {
        this.unreadCount = 0;
        document.title = this.originalTitle;
        this.sendHeartbeat();
        // If listeners fell asleep on mobile backgrounding, re-verify
        if (this.firestoreUnsubs.length === 0) {
          this.initFirestore();
        }
      }
    };

    window.addEventListener('focus', handleActiveState);
    document.addEventListener('visibilitychange', handleActiveState);
  }

  // Clean peer presence on tab close/unload
  private initUnloadListener() {
    if (typeof window === 'undefined') return;

    const cleanupPeer = () => {
      if (isFirebaseConfigured && this.isOnline) {
        try {
          const peerDocRef = doc(db, 'sessions', this.roomCode, 'peers', this.deviceId);
          deleteDoc(peerDocRef).catch(() => {});
        } catch {}
      }
    };

    window.addEventListener('beforeunload', cleanupPeer);
    window.addEventListener('pagehide', cleanupPeer);
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

  private unsubFirestore() {
    this.firestoreUnsubs.forEach((unsub) => {
      try {
        unsub();
      } catch {}
    });
    this.firestoreUnsubs = [];
  }

  // Real-Time Cloud Firestore Sync under /sessions/{sessionId}/
  private initFirestore() {
    if (typeof window === 'undefined' || !isFirebaseConfigured) return;

    this.unsubFirestore();

    try {
      const sessionId = this.roomCode;

      // 1. Instant Real-Time Items Listener: /sessions/{sessionId}/items/
      const itemsRef = collection(db, 'sessions', sessionId, 'items');

      const unsubItems = onSnapshot(
        itemsRef,
        (snapshot) => {
          let hasNewIncoming = false;
          let incomingSender = '';
          let incomingType = 'item';

          const remoteItems: SharedItem[] = [];

          snapshot.docs.forEach((docSnap) => {
            const data = docSnap.data();
            if (!data) return;

            if (data.id && data.content !== undefined) {
              const itemObj: SharedItem = {
                id: data.id,
                type: data.type || 'text',
                content: data.content,
                title: data.title || undefined,
                fileData: data.fileData || undefined,
                secretPayload: data.secretPayload || undefined,
                senderDevice: data.senderDevice || 'Other Device',
                timestamp: Number(data.timestamp) || Date.now(),
                expiresAt: Number(data.expiresAt) || Date.now() + FIVE_DAYS_MS,
                isBurned: Boolean(data.isBurned),
                isQueued: false,
                isEncrypted: Boolean(data.isEncrypted),
              };
              remoteItems.push(itemObj);

              if (itemObj.senderDevice !== this.deviceName && !this.items.some((i) => i.id === itemObj.id)) {
                hasNewIncoming = true;
                incomingSender = itemObj.senderDevice;
                incomingType = itemObj.type || 'item';
              }
            }
          });

          // Sort descending by timestamp
          remoteItems.sort((a, b) => b.timestamp - a.timestamp);

          // Preserve optimistic local items while merging remote
          const localQueued = this.items.filter((i) => i.isQueued);
          const combinedMap = new Map<string, SharedItem>();

          localQueued.forEach((item) => combinedMap.set(item.id, item));
          remoteItems.forEach((item) => combinedMap.set(item.id, item));

          this.items = Array.from(combinedMap.values()).sort((a, b) => b.timestamp - a.timestamp);
          this.pruneExpiredItems();
          this.saveStorage();
          this.notify();

          if (hasNewIncoming) {
            this.triggerIncomingNotification(incomingSender, incomingType);
          }
        },
        (error) => {
          console.warn('[QuickPair] Firestore items stream notice:', error.message);
        }
      );
      this.firestoreUnsubs.push(unsubItems);

      // 2. Real-Time Peer Presence Listener: /sessions/{sessionId}/peers/
      const peersRef = collection(db, 'sessions', sessionId, 'peers');
      const unsubPeers = onSnapshot(
        peersRef,
        (snapshot) => {
          const now = Date.now();
          snapshot.docs.forEach((docSnap) => {
            const peer = docSnap.data() as PeerInfo;
            if (peer && peer.id && peer.id !== this.deviceId) {
              if (now - (peer.lastSeen || 0) < 8000) {
                this.peers.set(peer.id, {
                  id: peer.id,
                  name: peer.name || 'Connected Device',
                  type: peer.type || 'desktop',
                  lastSeen: peer.lastSeen,
                  networkType: 'wifi',
                });
              } else {
                this.peers.delete(peer.id);
              }
            }
          });
          this.notify();
        },
        (error) => {
          console.warn('[QuickPair] Firestore peers stream notice:', error.message);
        }
      );
      this.firestoreUnsubs.push(unsubPeers);

      // 3. Real-Time Typing Listener: /sessions/{sessionId}/typing/
      const typingRef = collection(db, 'sessions', sessionId, 'typing');
      const unsubTyping = onSnapshot(
        typingRef,
        (snapshot) => {
          const now = Date.now();
          snapshot.docs.forEach((docSnap) => {
            if (docSnap.id !== this.deviceId) {
              const data = docSnap.data();
              if (data && now - (data.timestamp || 0) < 4000) {
                this.typingListeners.forEach((cb) => cb(data.senderDevice, data.isTyping, data.textPreview));
              } else if (data && !data.isTyping) {
                this.typingListeners.forEach((cb) => cb(data.senderDevice, false));
              }
            }
          });
        },
        (error) => {
          console.warn('[QuickPair] Firestore typing stream notice:', error.message);
        }
      );
      this.firestoreUnsubs.push(unsubTyping);

      // Send immediate initial heartbeat
      this.sendHeartbeat();
    } catch (err) {
      console.warn('[QuickPair] Firestore stream initialization notice:', err);
    }
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

          case 'ADD_ITEM':
            if (msg.item && !this.items.some((i) => i.id === msg.item.id)) {
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
            this.items = this.items.filter((i) => i.id !== msg.id);
            this.saveStorage();
            this.notify();
            break;

          case 'BURN_ITEM':
            this.items = this.items.map((i) => (i.id === msg.id ? { ...i, isBurned: true, content: '[Destroyed]' } : i));
            this.saveStorage();
            this.notify();
            break;

          case 'CLEAR_ALL':
            this.items = [];
            this.saveStorage();
            this.notify();
            break;

          case 'TYPING_INDICATOR':
            this.typingListeners.forEach((cb) => cb(msg.senderDevice, msg.isTyping, msg.textPreview));
            break;
        }
      };

      if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = window.setInterval(() => {
        this.sendHeartbeat();
        this.cleanupDeadPeers();
      }, 2500);
    } catch {
      // BroadcastChannel fallback
    }
  }

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

  public setRoom(newRoomCode: string, updateUrl: boolean = true) {
    const formatted = newRoomCode.trim().toUpperCase() || 'MAIN';
    if (formatted === this.roomCode) return;

    // Clean up current presence in old room
    if (isFirebaseConfigured && this.isOnline) {
      const oldPeerDoc = doc(db, 'sessions', this.roomCode, 'peers', this.deviceId);
      deleteDoc(oldPeerDoc).catch(() => {});
    }

    this.roomCode = formatted;
    localStorage.setItem('quickpair_active_room', formatted);
    this.peers.clear();
    this.initStorage();
    this.initBroadcast();
    this.initFirestore();

    if (updateUrl && typeof window !== 'undefined' && window.history) {
      const url = new URL(window.location.href);
      if (this.roomCode === 'MAIN') {
        url.searchParams.delete('room');
      } else {
        url.searchParams.set('room', this.roomCode);
      }
      window.history.replaceState({}, '', url.toString());
    }

    this.sendHeartbeat();
    this.notify();
  }

  public generateNewRoomCode(): string {
    const newCode = generateRandomRoomCode();
    this.setRoom(newCode, true);
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
    // 1. BroadcastChannel heartbeat
    if (this.channel) {
      this.channel.postMessage({
        type: 'HEARTBEAT',
        peer: {
          id: this.deviceId,
          name: this.deviceName,
          type: this.deviceType,
          networkType: 'wifi',
        },
      });
    }

    // 2. Firestore peer presence under /sessions/{sessionId}/peers/{deviceId}
    if (typeof window !== 'undefined' && isFirebaseConfigured && this.isOnline) {
      const sessionId = this.roomCode;
      const peerDocRef = doc(db, 'sessions', sessionId, 'peers', this.deviceId);
      setDoc(
        peerDocRef,
        cleanData({
          id: this.deviceId,
          name: this.deviceName,
          type: this.deviceType,
          lastSeen: Date.now(),
          networkType: 'wifi',
        }),
        { merge: true }
      ).catch(() => {});
    }
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
    this.listeners.forEach((listener) => listener([...this.items], peerList, this.roomCode));
  }

  private notifyNetwork() {
    this.networkListeners.forEach((listener) => listener(this.isOnline, this.offlineQueue.length));
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
    const now = Date.now();
    // Throttle typing heartbeats to max once per 600ms unless stopped
    if (isTyping && now - this.lastTypingSent < 600) return;
    this.lastTypingSent = now;

    if (this.channel) {
      this.channel.postMessage({
        type: 'TYPING_INDICATOR',
        senderDevice: this.deviceName,
        isTyping,
        textPreview,
      });
    }

    if (typeof window !== 'undefined' && isFirebaseConfigured && this.isOnline) {
      const sessionId = this.roomCode;
      const typingDocRef = doc(db, 'sessions', sessionId, 'typing', this.deviceId);
      setDoc(
        typingDocRef,
        cleanData({
          senderDevice: this.deviceName,
          isTyping,
          textPreview: textPreview || '',
          timestamp: now,
        })
      ).catch(() => {});
    }
  }

  public async addItem(item: QueuedItem, forceOnlineSend: boolean = false): Promise<SharedItem> {
    const now = Date.now();
    const expiresAt = now + FIVE_DAYS_MS;

    // Offline queue handling
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

    // Instant optimistic update on sender device (0ms delay)
    this.items = [newItem, ...this.items.filter((i) => !i.isQueued || i.content !== item.content)];
    this.saveStorage();
    this.notify();

    // BroadcastChannel local broadcast
    if (this.channel) {
      this.channel.postMessage({
        type: 'ADD_ITEM',
        item: newItem,
      });
    }

    // Cloud Firestore instant write under /sessions/{sessionId}/items/{itemId}
    if (typeof window !== 'undefined' && isFirebaseConfigured && this.isOnline) {
      const sessionId = this.roomCode;
      const itemDocRef = doc(db, 'sessions', sessionId, 'items', newItem.id);

      const payload = {
        id: newItem.id,
        type: newItem.type,
        content: newItem.content,
        title: newItem.title || '',
        fileData: newItem.fileData || null,
        secretPayload: newItem.secretPayload || null,
        senderDevice: newItem.senderDevice,
        timestamp: newItem.timestamp,
        expiresAt: newItem.expiresAt,
        isBurned: false,
        isQueued: false,
        isEncrypted: true,
      };

      setDoc(itemDocRef, cleanData(payload)).catch((err) => {
        console.warn('[QuickPair] Firestore item write notice:', err);
      });
    }

    return newItem;
  }

  public deleteItem(id: string) {
    this.items = this.items.filter((i) => i.id !== id);
    this.saveStorage();

    if (this.channel) {
      this.channel.postMessage({
        type: 'DELETE_ITEM',
        id,
      });
    }

    // Firestore delete under /sessions/{sessionId}/items/{itemId}
    if (typeof window !== 'undefined' && isFirebaseConfigured && this.isOnline) {
      const sessionId = this.roomCode;
      const itemDocRef = doc(db, 'sessions', sessionId, 'items', id);
      deleteDoc(itemDocRef).catch(() => {});
    }

    this.notify();
  }

  public burnItem(id: string) {
    this.items = this.items.map((i) => (i.id === id ? { ...i, isBurned: true, content: '[Destroyed]' } : i));
    this.saveStorage();

    if (this.channel) {
      this.channel.postMessage({
        type: 'BURN_ITEM',
        id,
      });
    }

    // Firestore burn/purge under /sessions/{sessionId}/items/{itemId}
    if (typeof window !== 'undefined' && isFirebaseConfigured && this.isOnline) {
      const sessionId = this.roomCode;
      const itemDocRef = doc(db, 'sessions', sessionId, 'items', id);
      deleteDoc(itemDocRef).catch(() => {});
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

    // Firestore purge all items under /sessions/{sessionId}/items/
    if (typeof window !== 'undefined' && isFirebaseConfigured && this.isOnline) {
      const sessionId = this.roomCode;
      const itemsRef = collection(db, 'sessions', sessionId, 'items');
      getDocs(itemsRef)
        .then((snapshot) => {
          const batch = writeBatch(db);
          snapshot.docs.forEach((d) => batch.delete(d.ref));
          batch.commit().catch(() => {});
        })
        .catch(() => {});
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
