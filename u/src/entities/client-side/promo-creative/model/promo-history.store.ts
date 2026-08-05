import type { PromoCreativeSource } from "@/entities/client-side/campaign-draft/api/campaign-draft.dto.ts";
import type { PromoLayout } from "./promo-creative.model.ts";

export type PromoHistoryStatus = "approved" | "rejected" | "previous";

export type PromoHistoryEntry = {
  id: string;
  draftId: string;
  asset: Blob;
  source: PromoCreativeSource;
  status: PromoHistoryStatus;
  label: string;
  createdAt: string;
  styleId?: string;
  headline?: string;
  subheadline?: string;
  generator?: string;
  layout?: PromoLayout;
};

const DATABASE_NAME = "soundinfluencers-promo-history";
const DATABASE_VERSION = 1;
const STORE_NAME = "creative-versions";
const MAX_ENTRIES_PER_DRAFT = 30;

let databasePromise: Promise<IDBDatabase> | null = null;

const requestResult = <T>(request: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Promo history request failed"));
  });

const transactionComplete = (transaction: IDBTransaction) =>
  new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Promo history transaction failed"));
    transaction.onabort = () => reject(transaction.error ?? new Error("Promo history transaction was aborted"));
  });

const openDatabase = () => {
  if (!databasePromise) {
    databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("draftId", "draftId", { unique: false });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("Promo history is unavailable"));
    });
  }
  return databasePromise;
};

const entriesForDraft = (store: IDBObjectStore, draftId: string) =>
  requestResult<PromoHistoryEntry[]>(store.index("draftId").getAll(draftId));

export const listPromoHistory = async (draftId: string) => {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readonly");
  const entries = await entriesForDraft(transaction.objectStore(STORE_NAME), draftId);
  return entries.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
};

export const savePromoHistoryBatch = async (
  draftId: string,
  newEntries: PromoHistoryEntry[],
) => {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  const completed = transactionComplete(transaction);
  const store = transaction.objectStore(STORE_NAME);
  const existing = await entriesForDraft(store, draftId);

  existing.forEach((entry) => {
    store.put(entry.status === "approved" ? { ...entry, status: "previous" } : entry);
  });
  newEntries.forEach((entry) => store.put(entry));

  [...existing, ...newEntries]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(MAX_ENTRIES_PER_DRAFT)
    .forEach((entry) => store.delete(entry.id));

  await completed;
};

export const markPromoHistoryApproved = async (draftId: string, entryId: string) => {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  const completed = transactionComplete(transaction);
  const store = transaction.objectStore(STORE_NAME);
  const entries = await entriesForDraft(store, draftId);

  entries.forEach((entry) => {
    if (entry.id === entryId) store.put({ ...entry, status: "approved" });
    else if (entry.status === "approved") store.put({ ...entry, status: "previous" });
  });

  await completed;
};
