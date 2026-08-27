import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './firebase';

export interface ProcessedFileData {
  name: string;
  size: number;
  mimeType: string;
  dataUrl?: string;
  previewUrl?: string;
}

// Generate a fast, lightweight thumbnail for instant display across devices (<30KB)
export async function createThumbnail(file: File): Promise<string | undefined> {
  if (!file.type.startsWith('image/')) return undefined;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 320;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.65));
      };
      img.onerror = () => resolve(undefined);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(undefined);
    reader.readAsDataURL(file);
  });
}

// Compress image to fit within Firestore document limits (<500KB)
export async function compressImageForSync(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1400;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Progressive quality to ensure < 500KB
        const quality = file.size > 2 * 1024 * 1024 ? 0.75 : 0.82;
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Process any file or media for universal, zero-lag cross-device sync
export async function processFileForSync(file: File, roomCode: string): Promise<ProcessedFileData> {
  const isImage = file.type.startsWith('image/');
  const thumbnail = isImage ? await createThumbnail(file) : undefined;

  let downloadUrl: string | undefined = undefined;

  // 1. Try Firebase Storage upload for large files (> 600KB)
  if (storage && isFirebaseConfigured && file.size > 600 * 1024) {
    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const sRef = storageRef(storage, `sessions/${roomCode}/${Date.now()}_${cleanFileName}`);
      await uploadBytes(sRef, file);
      downloadUrl = await getDownloadURL(sRef);
    } catch {
      // Storage upload fallback
    }
  }

  // 2. If no storage URL and it's an image, create optimized base64
  let finalDataUrl = downloadUrl;
  if (!finalDataUrl) {
    if (isImage) {
      finalDataUrl = await compressImageForSync(file);
    } else if (file.size <= 800 * 1024) {
      // Small non-image file under 800KB
      finalDataUrl = await new Promise((resolve) => {
        const r = new FileReader();
        r.onload = (e) => resolve(e.target?.result as string);
        r.readAsDataURL(file);
      });
    }
  }

  return {
    name: file.name,
    size: file.size,
    mimeType: file.type || 'application/octet-stream',
    dataUrl: finalDataUrl,
    previewUrl: thumbnail || finalDataUrl,
  };
}
