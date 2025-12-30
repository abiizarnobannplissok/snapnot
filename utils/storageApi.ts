// Simple localStorage wrapper API for window.storage
export interface StorageAPI {
  get: (key: string, isGlobal?: boolean) => Promise<string | null>;
  set: (key: string, value: string, isGlobal?: boolean) => Promise<void>;
  delete: (key: string, isGlobal?: boolean) => Promise<void>;
  list: (prefix: string, isGlobal?: boolean) => Promise<string[]>;
}

class LocalStorageWrapper implements StorageAPI {
  async get(key: string, isGlobal?: boolean): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  async set(key: string, value: string, isGlobal?: boolean): Promise<void> {
    try {
      localStorage.setItem(key, value);
      // Dispatch custom event for storage changes
      window.dispatchEvent(new CustomEvent('storage-change', { 
        detail: { key, value } 
      }));
    } catch (error) {
      console.error('Storage set error:', error);
      throw error;
    }
  }

  async delete(key: string, isGlobal?: boolean): Promise<void> {
    try {
      localStorage.removeItem(key);
      // Dispatch custom event for storage changes
      window.dispatchEvent(new CustomEvent('storage-change', { 
        detail: { key, value: null } 
      }));
    } catch (error) {
      console.error('Storage delete error:', error);
      throw error;
    }
  }

  async list(prefix: string, isGlobal?: boolean): Promise<string[]> {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keys.push(key);
        }
      }
      return keys;
    } catch (error) {
      console.error('Storage list error:', error);
      return [];
    }
  }
}

// Initialize and export the storage API
export const storageAPI = new LocalStorageWrapper();

// Define global type
declare global {
  interface Window {
    storage: StorageAPI;
  }
}

// Initialize window.storage
export function initializeStorage() {
  if (typeof window !== 'undefined') {
    window.storage = storageAPI;
    console.log('✅ window.storage API initialized');
  }
}
