// Lokaler Speicher: alles bleibt im Browser (localStorage). Kein Backend, keine Cloud.
// Export/Import als JSONL nach dem Datenvertrag, damit das Python-Tool dieselben Daten lesen kann.
//
// Der Speicher ist eine Fabrik: jede App gibt ihr eigenes Schema und ihren eigenen
// localStorage-Schlüssel mit. Zwei Apps auf demselben Gerät stören sich so nicht.
import { useSyncExternalStore } from "react";

/** Ein Schema ist eine Sammlung benannter Listen – genau die *.jsonl-Dateien. */
export type Schema = Record<string, unknown[]>;

export interface SpeicherOptionen<T extends Schema> {
  /** localStorage-Schlüssel, z. B. "adhs-versorgung.v1" */
  key: string;
  /** Präfix der Exportdateien, z. B. "adhs-versorgung" */
  exportPrefix: string;
  /** Leerer Anfangszustand – definiert zugleich, welche Sammlungen es gibt. */
  leer: () => T;
}

export interface Speicher<T extends Schema> {
  COLLECTIONS: (keyof T & string)[];
  getDB: () => T;
  useDB: () => T;
  append: <K extends keyof T>(col: K, row: T[K][number]) => void;
  replaceAll: (next: Partial<T>) => void;
  clearAll: () => void;
  exportAll: () => void;
  exportJSONL: (col: keyof T & string) => void;
  importFile: (name: string, text: string) => string;
}

export function erstelleSpeicher<T extends Schema>(opt: SpeicherOptionen<T>): Speicher<T> {
  const COLLECTIONS = Object.keys(opt.leer()) as (keyof T & string)[];

  const load = (): T => {
    try {
      const raw = localStorage.getItem(opt.key);
      if (!raw) return opt.leer();
      return { ...opt.leer(), ...JSON.parse(raw) };
    } catch {
      return opt.leer();
    }
  };

  let db: T = load();
  const listeners = new Set<() => void>();

  function emit() {
    try {
      localStorage.setItem(opt.key, JSON.stringify(db));
    } catch {
      /* Speicher voll oder blockiert – Daten bleiben im RAM */
    }
    listeners.forEach((l) => l());
  }

  const getDB = () => db;

  function append<K extends keyof T>(col: K, row: T[K][number]) {
    db = { ...db, [col]: [...(db[col] as unknown[]), row] } as T;
    emit();
  }

  function replaceAll(next: Partial<T>) {
    db = { ...opt.leer(), ...db, ...next };
    emit();
  }

  function clearAll() {
    db = opt.leer();
    emit();
  }

  function useDB(): T {
    return useSyncExternalStore(
      (cb) => {
        listeners.add(cb);
        return () => listeners.delete(cb);
      },
      () => db,
    );
  }

  function exportAll() {
    download(`${heuteStempel()}_${opt.exportPrefix}_export.json`, JSON.stringify(db, null, 1));
  }

  function exportJSONL(col: keyof T & string) {
    download(`${heuteStempel()}_${col}.jsonl`, toJSONL(db[col] as unknown[]), "application/x-ndjson");
  }

  /** Importiert .json (Gesamtexport) oder .jsonl (eine Sammlung, per Dateiname erkannt). Ergänzt, überschreibt nicht. */
  function importFile(name: string, text: string): string {
    if (name.endsWith(".json")) {
      const d = JSON.parse(text) as Partial<T>;
      const next: Partial<T> = {};
      let n = 0;
      for (const c of COLLECTIONS) {
        if (Array.isArray(d[c])) {
          const merged = dedupe([...(db[c] as unknown[]), ...(d[c] as unknown[])]);
          n += merged.length - (db[c] as unknown[]).length;
          (next as Record<string, unknown[]>)[c] = merged;
        }
      }
      replaceAll(next);
      return `${n} neue Sätze übernommen`;
    }
    const col = COLLECTIONS.find((c) => name.includes(c));
    if (!col) return `Dateiname muss eine Sammlung enthalten (${COLLECTIONS.join(", ")})`;
    const merged = dedupe([...(db[col] as unknown[]), ...parseJSONL(text)]);
    const n = merged.length - (db[col] as unknown[]).length;
    replaceAll({ [col]: merged } as unknown as Partial<T>);
    return `${n} neue Sätze in ${col}`;
  }

  return { COLLECTIONS, getDB, useDB, append, replaceAll, clearAll, exportAll, exportJSONL, importFile };
}

// ---- JSONL-Werkzeug ----
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

function dedupe(rows: unknown[]) {
  const seen = new Set<string>();
  return rows.filter((r) => {
    const k = JSON.stringify(r);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

const heuteStempel = () => new Date().toISOString().slice(0, 10);
