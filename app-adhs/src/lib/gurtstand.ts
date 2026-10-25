// Die Gurtverbindung gehört keinem einzelnen Bildschirm.
//
// Messen und Atmen brauchen beide denselben Gurt. Läge die Verbindung in der Komponente,
// müsste man beim Wechsel neu koppeln – und beim Blick auf "Heute" wäre sie weg.
// Deshalb steht sie hier neben React und wird über useSyncExternalStore abonniert,
// genau wie der Datenspeicher.
import { useSyncExternalStore } from "react";
import { simuliereGurt, verbindeGurt, type Messwert, type Verbindung } from "@versorgung/kern";

export interface GurtStand {
  verbindung: Verbindung | null;
  live: Messwert | null;
  /** Momentanpuls je Herzschlag, die letzten 90 – daran sieht man die Atemkopplung. */
  kurve: number[];
  fehler: string;
  verbindet: boolean;
}

let stand: GurtStand = { verbindung: null, live: null, kurve: [], fehler: "", verbindet: false };
const hoerer = new Set<() => void>();

function setze(teil: Partial<GurtStand>) {
  stand = { ...stand, ...teil };
  hoerer.forEach((h) => h());
}

/** Alle laufenden Messungen, die Rohdaten sammeln wollen. */
const sammler = new Set<(rr: number[]) => void>();

export function sammleMit(fn: (rr: number[]) => void) {
  sammler.add(fn);
  return () => void sammler.delete(fn);
}

function beiWert(w: Messwert) {
  const neu = w.rr.map((rr) => Math.round(60000 / rr));
  setze({ live: w, kurve: neu.length ? [...stand.kurve, ...neu].slice(-90) : stand.kurve });
  if (w.rr.length) sammler.forEach((fn) => fn(w.rr));
}

export async function verbinden(simulieren: boolean) {
  setze({ fehler: "", verbindet: true });
  try {
    const v = simulieren
      ? simuliereGurt(beiWert)
      : await verbindeGurt(beiWert, () => setze({ fehler: "Verbindung verloren.", verbindung: null, live: null }));
    setze({ verbindung: v, verbindet: false });
  } catch (e) {
    // Wer die Geräteauswahl abbricht, hat keinen Fehler gemacht.
    const text = String(e);
    setze({
      verbindet: false,
      fehler: /NotFoundError|cancelled|User cancelled/i.test(text) ? "Keine Auswahl getroffen." : text,
    });
  }
}

export async function trennen() {
  await stand.verbindung?.trennen();
  setze({ verbindung: null, live: null, kurve: [], fehler: "" });
}

export function useGurt(): GurtStand {
  return useSyncExternalStore(
    (cb) => {
      hoerer.add(cb);
      return () => void hoerer.delete(cb);
    },
    () => stand,
  );
}
