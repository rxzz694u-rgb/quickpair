import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, memoryLocalCache } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD90hrbD1GhLRlFIKDamTASp9F-eDj_M6M',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'quickpair-9a302.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'quickpair-9a302',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'quickpair-9a302.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1084407085446',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1084407085446:web:fbb822d9af329736f21407',
};

// Check if Firebase is properly configured with environment variables or fallback
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

// Initialize Firebase app if not already initialized
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore with memory cache for ultra-low latency & zero disk I/O lag
export const db = (() => {
  try {
    return initializeFirestore(app, {
      localCache: memoryLocalCache(),
    });
  } catch {
    return getFirestore(app);
  }
})();

// Initialize Firebase Storage for large media and files
export const storage = (() => {
  try {
    return getStorage(app);
  } catch {
    return null;
  }
})();

export { firebaseConfig };
