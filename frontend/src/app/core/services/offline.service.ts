import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface GroceryTrackDB extends DBSchema {
  groceries: {
    key: string;
    value: any;
    indexes: { 'by-expiration': string };
  };
  'pending-actions': {
    key: number;
    value: {
      id?: number;
      url: string;
      method: string;
      headers: any;
      data: any;
      timestamp: number;
    };
    indexes: { timestamp: number };
  };
}

@Injectable({
  providedIn: 'root'
})
export class OfflineService {
  private db: IDBPDatabase<GroceryTrackDB> | null = null;

  async initDB() {
    this.db = await openDB<GroceryTrackDB>('grocerytrack-db', 1, {
      upgrade(db) {
        // Groceries store
        const groceryStore = db.createObjectStore('groceries', { keyPath: '_id' });
        groceryStore.createIndex('by-expiration', 'expirationDate');

        // Pending actions store
        const actionsStore = db.createObjectStore('pending-actions', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        actionsStore.createIndex('timestamp', 'timestamp');
      }
    });
  }

  async saveGroceries(groceries: any[]) {
    const tx = this.db!.transaction('groceries', 'readwrite');
    await Promise.all(groceries.map(g => tx.store.put(g)));
  }

  async getGroceries() {
    return await this.db!.getAll('groceries');
  }

  async addPendingAction(action: any) {
    await this.db!.add('pending-actions', {
      ...action,
      timestamp: Date.now()
    });

    // Register background sync
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-groceries');
    }
  }

  async isOnline() {
    return navigator.onLine;
  }
}