/**
 * IndexedDB 래퍼 — elims-archive
 *
 * Stores:
 *   runners  { id, addedAt, memo?, tags? }
 *   costumes { id, addedAt, memo?, status: "owned"|"wishlist" }
 *   stories  { id, readAt }
 *   maps     { id, clearedAt?, personalBest? }
 */

const DB_NAME = "elims-archive";
const DB_VERSION = 1;

export interface RunnerEntry {
  id: number;
  addedAt: number;
  memo: string;
  tags: string[];
}

export interface CostumeEntry {
  id: number;
  addedAt: number;
  memo: string;
  status: "owned" | "wishlist";
}

export interface StoryEntry {
  id: number;
  readAt: number;
  scrollProgress?: number;
}

export interface MapEntry {
  id: number;
  clearedAt: number | null;
  personalBest: string;
}

type StoreName = "runners" | "costumes" | "stories" | "maps";

let dbPromise: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("runners")) {
        db.createObjectStore("runners", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("costumes")) {
        db.createObjectStore("costumes", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("stories")) {
        db.createObjectStore("stories", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("maps")) {
        db.createObjectStore("maps", { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

// ── Generic helpers ──────────────────────────────────

async function getAll<T>(store: StoreName): Promise<T[]> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function get<T>(store: StoreName, id: number): Promise<T | undefined> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).get(id);
    req.onsuccess = () => resolve(req.result ?? undefined);
    req.onerror = () => reject(req.error);
  });
}

async function put<T>(store: StoreName, value: T): Promise<void> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function remove(store: StoreName, id: number): Promise<void> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ── Public API ───────────────────────────────────────

export const db = {
  runners: {
    getAll: () => getAll<RunnerEntry>("runners"),
    get: (id: number) => get<RunnerEntry>("runners", id),
    put: (entry: RunnerEntry) => put("runners", entry),
    remove: (id: number) => remove("runners", id),
  },
  costumes: {
    getAll: () => getAll<CostumeEntry>("costumes"),
    get: (id: number) => get<CostumeEntry>("costumes", id),
    put: (entry: CostumeEntry) => put("costumes", entry),
    remove: (id: number) => remove("costumes", id),
  },
  stories: {
    getAll: () => getAll<StoryEntry>("stories"),
    get: (id: number) => get<StoryEntry>("stories", id),
    put: (entry: StoryEntry) => put("stories", entry),
    remove: (id: number) => remove("stories", id),
  },
  maps: {
    getAll: () => getAll<MapEntry>("maps"),
    get: (id: number) => get<MapEntry>("maps", id),
    put: (entry: MapEntry) => put("maps", entry),
    remove: (id: number) => remove("maps", id),
  },

  /** 전체 데이터 JSON export (백업/공유용) */
  async exportAll() {
    const [runners, costumes, stories, maps] = await Promise.all([
      getAll<RunnerEntry>("runners"),
      getAll<CostumeEntry>("costumes"),
      getAll<StoryEntry>("stories"),
      getAll<MapEntry>("maps"),
    ]);
    return { runners, costumes, stories, maps, exportedAt: Date.now() };
  },

  /** JSON import (복원용) */
  async importAll(data: {
    runners?: RunnerEntry[];
    costumes?: CostumeEntry[];
    stories?: StoryEntry[];
    maps?: MapEntry[];
  }) {
    const ops: Promise<void>[] = [];
    for (const r of data.runners ?? []) ops.push(put("runners", r));
    for (const c of data.costumes ?? []) ops.push(put("costumes", c));
    for (const s of data.stories ?? []) ops.push(put("stories", s));
    for (const m of data.maps ?? []) ops.push(put("maps", m));
    await Promise.all(ops);
  },
};

// ── localStorage → IndexedDB 마이그레이션 ────────────

const LEGACY_KEY = "elims-favorites";

export async function migrateFromLocalStorage(): Promise<void> {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    const now = Date.now();
    const ops: Promise<void>[] = [];

    if (Array.isArray(parsed.runners)) {
      for (const id of parsed.runners) {
        if (typeof id === "number") {
          ops.push(
            db.runners.put({ id, addedAt: now, memo: "", tags: [] }),
          );
        }
      }
    }
    if (Array.isArray(parsed.costumes)) {
      for (const id of parsed.costumes) {
        if (typeof id === "number") {
          ops.push(
            db.costumes.put({ id, addedAt: now, memo: "", status: "wishlist" }),
          );
        }
      }
    }

    await Promise.all(ops);
    localStorage.removeItem(LEGACY_KEY);
  } catch {}
}
