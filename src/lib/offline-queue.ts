import Dexie, { Table } from 'dexie';

export interface QueuedPhoto {
  id?: number;
  blob: Blob;
  name: string;
  type: string;
  timestamp: number;
  status: 'pending' | 'uploading' | 'failed';
  itemId?: string; // If associated with an existing item
  groupId?: string; // For batch grouping
}

export class NexusDB extends Dexie {
  photos!: Table<QueuedPhoto>;

  constructor() {
    super('NexusDB');
    this.version(1).stores({
      photos: '++id, status, groupId, itemId, timestamp'
    });
  }
}

export const db = new NexusDB();

/**
 * Adds a photo to the offline queue
 */
export async function queuePhoto(blob: Blob, name: string, type: string) {
  return await db.photos.add({
    blob,
    name,
    type,
    timestamp: Date.now(),
    status: 'pending'
  });
}

/**
 * Gets all pending photos in the queue
 */
export async function getPendingPhotos() {
  return await db.photos.where('status').equals('pending').toArray();
}

/**
 * Marks a photo as uploading or failed
 */
export async function updatePhotoStatus(id: number, status: 'pending' | 'uploading' | 'failed') {
  return await db.photos.update(id, { status });
}

/**
 * Removes a photo from the queue after successful upload
 */
export async function removePhoto(id: number) {
  return await db.photos.delete(id);
}

/**
 * Checks if the device is currently on Wi-Fi (if supported by browser)
 * Falls back to simple 'online' check if Network Information API is missing
 */
export function isWifiConnection() {
  if (typeof navigator === 'undefined') return false;
  
  // @ts-ignore - Network Information API is experimental
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (connection) {
    // 'wifi', 'ethernet' are generally considered "unmetered"
    return connection.type === 'wifi' || connection.type === 'ethernet';
  }
  
  return navigator.onLine; // Default fallback
}
