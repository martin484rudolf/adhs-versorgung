// Speicher dieser App – Schema und localStorage-Schlüssel. Die Mechanik steckt im Kern.
import { erstelleSpeicher } from "@versorgung/kern";
import type { Einnahme, Versuch, LaborResult, HrvSession, TagesWerte } from "@versorgung/kern";
import type { CheckIn, Mahlzeit } from "./types";

export interface DB {
  eintraege: CheckIn[];
  einnahmen: Einnahme[];
  versuche: Versuch[];
  tests: LaborResult[];
  mahlzeiten: Mahlzeit[];
  /** Messungen mit dem Brustgurt, Rohdaten inklusive. */
  hrv: HrvSession[];
  /** Tageswerte aus einer Uhr (Schlaf, Ruhepuls, Schritte). */
  tageswerte: TagesWerte[];
  [k: string]: unknown[];
}
export type Collection = "eintraege" | "einnahmen" | "versuche" | "tests" | "mahlzeiten" | "hrv" | "tageswerte";

const speicher = erstelleSpeicher<DB>({
  key: "adhs-versorgung.v1",
  exportPrefix: "adhs-versorgung",
  leer: () => ({ eintraege: [], einnahmen: [], versuche: [], tests: [], mahlzeiten: [], hrv: [], tageswerte: [] }),
});

export const COLLECTIONS = speicher.COLLECTIONS as Collection[];
export const { getDB, useDB, append, replaceAll, clearAll, exportAll, exportJSONL, importFile } = speicher;
export { toJSONL, parseJSONL, download, heute, jetztHHMM } from "@versorgung/kern";
