// Der heutige Eintrag, sofort gespeichert.
//
// Kein "Speichern"-Knopf: jede Antwort landet im Moment des Tippens im Speicher.
// Wer sich bei der Bedienung unsicher fühlt, soll sich nie fragen müssen, ob etwas
// angekommen ist – und nichts verlieren, wenn die App zwischendurch weggelegt wird.
import { getDB, heute, replaceAll } from "./speicher";
import type { CheckIn } from "./typen";

export const heutigerEintrag = (db: { eintraege: CheckIn[] }): CheckIn | undefined =>
  db.eintraege.find((e) => e.datum === heute());

/** Ergänzt den heutigen Eintrag um die übergebenen Felder. Ein Eintrag je Tag. */
export function tagSetzen(patch: Partial<CheckIn>) {
  const db = getDB();
  const h = heute();
  const bestehend = db.eintraege.find((e) => e.datum === h);
  const neu: CheckIn = { schema_version: 1, datum: h, quelle: "self", ...bestehend, ...patch };
  replaceAll({ eintraege: [...db.eintraege.filter((e) => e.datum !== h), neu] });
}

/**
 * Gläser hoch- oder runterzählen.
 *
 * Rechnet bewusst vom gespeicherten Stand aus, nicht von dem, was gerade auf dem Bildschirm
 * steht: wer dreimal schnell hintereinander tippt, käme sonst trotzdem nur auf eins, weil alle
 * drei Tipper denselben veralteten Wert gelesen hätten. Genau das passiert, wenn jemand unsicher
 * tippt und zur Sicherheit nochmal drückt.
 */
export function trinkenAendern(delta: number) {
  const aktuell = getDB().eintraege.find((e) => e.datum === heute())?.getrunken ?? 0;
  tagSetzen({ getrunken: Math.max(0, aktuell + delta) });
}
