import { openDB, type DBSchema, type IDBPDatabase } from "idb";

interface FlashCardsDB extends DBSchema {
  files: { key: string; value: unknown };
}

const DB_NAME = "flashcards-save-data";
const DB_VERSION = 1;
const STORE_NAME = "files";

let dbPromise: Promise<IDBPDatabase<FlashCardsDB>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<FlashCardsDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export type SaveFileKey =
  | "settings"
  | "wallet"
  | "shop"
  | "highscores"
  | "lastConfigurations";

export async function loadFile<T>(key: SaveFileKey, fallback: T): Promise<T> {
  try {
    const db = await getDb();
    const value = await db.get(STORE_NAME, key);
    return (value as T) ?? fallback;
  } catch (err) {
    console.error(`Failed to load save file "${key}"`, err);
    return fallback;
  }
}

export async function saveFile<T>(
  key: SaveFileKey,
  value: T,
): Promise<boolean> {
  try {
    const db = await getDb();
    await db.put(STORE_NAME, value, key);
    return true;
  } catch (err) {
    console.error(`Failed to save file "${key}"`, err);
    return false;
  }
}

export async function deleteFile(key: SaveFileKey): Promise<void> {
  try {
    const db = await getDb();
    await db.delete(STORE_NAME, key);
  } catch (err) {
    console.error(`Failed to delete save file "${key}"`, err);
  }
}
