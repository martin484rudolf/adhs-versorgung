// Lokaler Speicher: alles bleibt im Browser (localStorage). Kein Backend, keine Cloud.
// Export/Import als JSONL-Dateien nach dem Datenvertrag, damit das Python-Tool dieselben Daten lesen kann.
import { useSyncExternalStore } from "react";
import type { CheckIn, Einnahme, Versuch, LaborResult, Mahlzeit } from "./types";

export interface DB {
  eintraege: CheckIn[];
  einnahmen: Einnahme[];
  versuche: Versuch[];
  tests: LaborResult[];
  mahlzeiten: Mahlzeit[];
}
export type Collection = keyof DB;
export const COLLECTIONS: Collection[] = ["eintraege", "einnahmen", "versuche", "tests", "mahlzeiten"];
const KEY = "adhs-versorgung.v1";

const empty = (): DB => ({ eintraege: [], einnahmen: [], versuche: [], tests: [], mahlzeiten: [] });

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const d = JSON.parse(raw);
    return { ...empty(), ...d };
  } catch {
    return empty();
  }
}

let db: DB = load();
const listeners = new Set<() => void>();
function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    /* Speicher voll oder blockiert – Daten bleiben im RAM */
  }
  listeners.forEach((l) => l());
}

export function getDB() {
  return db;
}
export function append<K extends Collection>(col: K, row: DB[K][number]) {
  db = { ...db, [col]: [...db[col], row] };
  emit();
}
export function replaceAll(next: Partial<DB>) {
  db = { ...empty(), ...db, ...next };
  emit();
}
export function clearAll() {
  db = empty();
  emit();
}
export function useDB(): DB {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => db,
  );
}

// ---- Export / Import (JSONL je Sammlung, wie daten/*.jsonl im Python-Tool) ----
export function toJSONL(rows: unknown[]) {
  return rows.map((r) => JSON.stringify(r)).join("\n") + (rows.length ? "\n" : "");
}
export function parseJSONL(text: string): unknown[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}
export function download(name: string, content: string, type = "application/json") {
  const blob = new Blob([content], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
export function exportAll() {
  const stamp = new Date().toISOString().slice(0, 10);
  download(`${stamp}_adhs-versorgung_export.json`, JSON.stringify(db, null, 1));
}
export function exportJSONL(col: Collection) {
  const stamp = new Date().toISOString().slice(0, 10);
  download(`${stamp}_${col}.jsonl`, toJSONL(db[col]), "application/x-ndjson");
}
/** Importiert eine .json (Gesamtexport) oder .jsonl (eine Sammlung, per Dateiname erkannt). Ergänzt, überschreibt nicht. */
export function importFile(name: string, text: string): string {
  if (name.endsWith(".json")) {
    const d = JSON.parse(text) as Partial<DB>;
    const next: Partial<DB> = {};
    let n = 0;
    for (const c of COLLECTIONS) {
      if (Array.isArray(d[c])) {
        const merged = dedupe([...(db[c] as unknown[]), ...(d[c] as unknown[])]);
        n += merged.length - db[c].length;
        (next as Record<string, unknown[]>)[c] = merged;
      }
    }
    replaceAll(next);
    return `${n} neue Sätze übernommen`;
  }
  const col = COLLECTIONS.find((c) => name.includes(c));
  if (!col) return "Dateiname muss eine Sammlung enthalten (eintraege, einnahmen, versuche, tests, mahlzeiten)";
  const rows = parseJSONL(text);
  const merged = dedupe([...(db[col] as unknown[]), ...rows]);
  const n = merged.length - db[col].length;
  replaceAll({ [col]: merged } as Partial<DB>);
  return `${n} neue Sätze in ${col}`;
}
function dedupe(rows: unknown[]) {
  const seen = new Set<string>();
  return rows.filter((r) => {
    const k = JSON.stringify(r);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export const heute = () => new Date().toISOString().slice(0, 10);
export const jetztHHMM = () => new Date().toTimeString().slice(0, 5);
