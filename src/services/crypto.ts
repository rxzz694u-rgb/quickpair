// Web Crypto API client-side AES-GCM 256-bit encryption for End-to-End Encryption & Secret Notes

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  salt: string;
  expiresAt?: number;
  burnAfterRead: boolean;
}

export interface RoomEncryptedPacket {
  ciphertext: string;
  iv: string;
  salt: string;
  version: 'e2ee-v1';
}

const keyCache: Map<string, CryptoKey> = new Map();

export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const cacheKey = `${password}_${Array.from(salt).join(',')}`;
  if (keyCache.has(cacheKey)) {
    return keyCache.get(cacheKey)!;
  }

  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const derived = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  keyCache.set(cacheKey, derived);
  return derived;
}

// Room-level End-to-End Encryption (AES-GCM 256-bit)
export async function encryptRoomPacket(plainData: string, roomCode: string): Promise<RoomEncryptedPacket> {
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const secretPass = `quickpair_e2ee_room_${roomCode.toUpperCase()}`;
  const key = await deriveKey(secretPass, salt);

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
    },
    key,
    enc.encode(plainData)
  );

  const ciphertext = btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer)));
  const ivBase64 = btoa(String.fromCharCode(...iv));
  const saltBase64 = btoa(String.fromCharCode(...salt));

  return {
    ciphertext,
    iv: ivBase64,
    salt: saltBase64,
    version: 'e2ee-v1',
  };
}

// Room-level End-to-End Decryption (AES-GCM 256-bit)
export async function decryptRoomPacket(packet: RoomEncryptedPacket, roomCode: string): Promise<string> {
  const salt = Uint8Array.from(atob(packet.salt), (c) => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(packet.iv), (c) => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(packet.ciphertext), (c) => c.charCodeAt(0));

  const secretPass = `quickpair_e2ee_room_${roomCode.toUpperCase()}`;
  const key = await deriveKey(secretPass, salt);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource,
      },
      key,
      ciphertext as unknown as BufferSource
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch (err) {
    throw new Error('Failed to decrypt: Invalid room key or corrupted payload.');
  }
}

// Secret Note Encryption (Burn-on-Read / Passphrase)
export async function encryptSecretNote(
  plainText: string,
  passphrase?: string,
  burnAfterRead: boolean = true
): Promise<EncryptedPayload> {
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const effectivePass = passphrase || 'quickpair_burn_secret_' + Math.random().toString(36).substring(2);
  const key = await deriveKey(effectivePass, salt);

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
    },
    key,
    enc.encode(plainText)
  );

  const ciphertext = btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer)));
  const ivBase64 = btoa(String.fromCharCode(...iv));
  const saltBase64 = btoa(String.fromCharCode(...salt));

  return {
    ciphertext,
    iv: ivBase64,
    salt: saltBase64,
    burnAfterRead,
    expiresAt: Date.now() + 10 * 60 * 1000,
  };
}

export async function decryptSecretNote(
  payload: EncryptedPayload,
  passphrase?: string
): Promise<string> {
  const salt = Uint8Array.from(atob(payload.salt), (c) => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(payload.iv), (c) => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(payload.ciphertext), (c) => c.charCodeAt(0));

  const effectivePass = passphrase || 'quickpair_burn_secret_';
  const key = await deriveKey(effectivePass, salt);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource,
      },
      key,
      ciphertext as unknown as BufferSource
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch (err) {
    throw new Error('Failed to decrypt: Invalid passphrase or corrupted note.');
  }
}
