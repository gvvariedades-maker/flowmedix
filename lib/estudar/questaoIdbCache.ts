/**
 * IndexedDB L0 — persiste payloads core de questão entre refreshes (fase 11.1).
 */

import type { EstudarQuestaoPayload } from '@/components/lesson/questao-navigation-context';
import {
  ESTUDAR_IDB_DB_NAME,
  ESTUDAR_IDB_DB_VERSION,
  ESTUDAR_IDB_STORE_NAME,
  ESTUDAR_L0_MAX_ENTRIES,
  ESTUDAR_L0_TTL_MS,
  isEstudarIdbL0Enabled,
} from '@/lib/estudar/estudarL0Config';
import { payloadMatchesCacheKey } from '@/lib/estudar/payloadRouteMatch';

export type QuestaoIdbEntry = {
  key: string;
  payload: EstudarQuestaoPayload;
  cachedAt: number;
  expiresAt: number;
  lastAccessAt: number;
};

export function isQuestaoIdbAvailable(): boolean {
  return typeof indexedDB !== 'undefined';
}

function openQuestaoIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(ESTUDAR_IDB_DB_NAME, ESTUDAR_IDB_DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error('idb_open_failed'));
    request.onupgradeneeded = (event) => {
      const db = request.result;
      const upgrade = event as IDBVersionChangeEvent;
      if (upgrade.oldVersion > 0 && upgrade.oldVersion < ESTUDAR_IDB_DB_VERSION) {
        if (db.objectStoreNames.contains(ESTUDAR_IDB_STORE_NAME)) {
          db.deleteObjectStore(ESTUDAR_IDB_STORE_NAME);
        }
      }
      if (!db.objectStoreNames.contains(ESTUDAR_IDB_STORE_NAME)) {
        const store = db.createObjectStore(ESTUDAR_IDB_STORE_NAME, { keyPath: 'key' });
        store.createIndex('lastAccessAt', 'lastAccessAt', { unique: false });
        store.createIndex('expiresAt', 'expiresAt', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

function idbRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('idb_request_failed'));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => Promise<T>,
): Promise<T> {
  const db = await openQuestaoIdb();
  try {
    const tx = db.transaction(ESTUDAR_IDB_STORE_NAME, mode);
    const store = tx.objectStore(ESTUDAR_IDB_STORE_NAME);
    const txDone = new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('idb_tx_failed'));
      tx.onabort = () => reject(tx.error ?? new Error('idb_tx_aborted'));
    });
    const result = await fn(store);
    await txDone;
    return result;
  } finally {
    db.close();
  }
}

async function pruneExpiredAndOverflow(store: IDBObjectStore): Promise<void> {
  const all = await idbRequest<QuestaoIdbEntry[]>(store.getAll());
  const now = Date.now();
  const alive = all.filter((entry) => entry.expiresAt > now);

  for (const entry of all) {
    if (entry.expiresAt <= now) {
      store.delete(entry.key);
    }
  }

  if (alive.length <= ESTUDAR_L0_MAX_ENTRIES) return;

  const sorted = [...alive].sort((a, b) => a.lastAccessAt - b.lastAccessAt);
  for (const entry of sorted.slice(0, alive.length - ESTUDAR_L0_MAX_ENTRIES)) {
    store.delete(entry.key);
  }
}

export async function getQuestaoFromIdb(key: string): Promise<EstudarQuestaoPayload | null> {
  if (!isEstudarIdbL0Enabled() || !isQuestaoIdbAvailable()) return null;

  try {
    return await withStore('readwrite', async (store) => {
      const entry = await idbRequest<QuestaoIdbEntry | undefined>(store.get(key));
      if (!entry || entry.expiresAt <= Date.now()) {
        if (entry) store.delete(key);
        return null;
      }
      if (!payloadMatchesCacheKey(entry.payload, key)) {
        store.delete(key);
        return null;
      }
      entry.lastAccessAt = Date.now();
      store.put(entry);
      return entry.payload;
    });
  } catch {
    return null;
  }
}

export async function setQuestaoInIdb(
  key: string,
  payload: EstudarQuestaoPayload,
): Promise<void> {
  if (!isEstudarIdbL0Enabled() || !isQuestaoIdbAvailable()) return;
  if (!payloadMatchesCacheKey(payload, key)) return;

  const now = Date.now();
  const entry: QuestaoIdbEntry = {
    key,
    payload,
    cachedAt: now,
    expiresAt: now + ESTUDAR_L0_TTL_MS,
    lastAccessAt: now,
  };

  try {
    await withStore('readwrite', async (store) => {
      store.put(entry);
      await pruneExpiredAndOverflow(store);
    });
  } catch {
    // ignore — L0 opcional
  }
}

export async function deleteQuestaoFromIdb(key: string): Promise<void> {
  if (!isQuestaoIdbAvailable()) return;
  try {
    await withStore('readwrite', async (store) => {
      store.delete(key);
    });
  } catch {
    // ignore
  }
}

function matchesQuestaoSlugCacheKey(key: string, slug: string): boolean {
  return key === slug || key.startsWith(`${slug}|`);
}

/** Remove todas as variantes de contexto (`slug|query`) para um slug. */
export async function deleteQuestaoFromIdbBySlug(slug: string): Promise<void> {
  const trimmed = slug.trim();
  if (!trimmed || !isQuestaoIdbAvailable()) return;

  try {
    await withStore('readwrite', async (store) => {
      const all = await idbRequest<QuestaoIdbEntry[]>(store.getAll());
      for (const entry of all) {
        if (matchesQuestaoSlugCacheKey(entry.key, trimmed)) {
          store.delete(entry.key);
        }
      }
    });
  } catch {
    // ignore
  }
}

export async function clearAllQuestaoIdb(): Promise<void> {
  if (!isEstudarIdbL0Enabled() || !isQuestaoIdbAvailable()) return;

  try {
    await withStore('readwrite', async (store) => {
      await idbRequest(store.clear());
    });
  } catch {
    // ignore
  }
}

/** Hidrata LRU em memória com entradas válidas mais recentes. */
export async function hydrateQuestaoLruFromIdb(
  setEntry: (key: string, payload: EstudarQuestaoPayload) => void,
  maxEntries = ESTUDAR_L0_MAX_ENTRIES,
): Promise<number> {
  if (!isEstudarIdbL0Enabled() || !isQuestaoIdbAvailable()) return 0;

  try {
    const entries = await withStore('readwrite', async (store) => {
      const all = await idbRequest<QuestaoIdbEntry[]>(store.getAll());
      const now = Date.now();
      const valid: QuestaoIdbEntry[] = [];

      for (const entry of all) {
        if (entry.expiresAt <= now) {
          store.delete(entry.key);
          continue;
        }
        if (!payloadMatchesCacheKey(entry.payload, entry.key)) {
          store.delete(entry.key);
          continue;
        }
        valid.push(entry);
      }

      return valid;
    });

    const selected = entries
      .sort((a, b) => b.lastAccessAt - a.lastAccessAt)
      .slice(0, maxEntries);

    for (const entry of selected) {
      setEntry(entry.key, entry.payload);
    }
    return selected.length;
  } catch {
    return 0;
  }
}
