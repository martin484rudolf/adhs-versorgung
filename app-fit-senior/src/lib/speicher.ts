// Speicher dieser App. Eigener Schlüssel – ADHS-Versorgung und Fit Senior stören
// sich auf demselben Gerät nicht, teilen aber denselben Datenvertrag.
import { erstelleSpeicher } from "@versorgung/kern";
import type { Einnahme, LaborResult, Versuch } from "@versorgung/kern";
import type { Bedarf, CheckIn, Leistung, Mahlzeit } from "./typen";

export interface DB {
  eintraege: CheckIn[];
  einnahmen: Einnahme[];
  versuche: Versuch[];
  tests: LaborResult[];
  mahlzeiten: Mahlzeit[];
  bedarfe: Bedarf[];
  leistungen: Leistung[];
  [k: string]: unknown[];
}
export type Collection = "eintraege" | "einnahmen" | "versuche" | "tests" | "mahlzeiten" | "bedarfe" | "leistungen";

const speicher = erstelleSpeicher<DB>({
  key: "fit-senior.v1",
  exportPrefix: "fit-senior",
  leer: () => ({ eintraege: [], einnahmen: [], versuche: [], tests: [], mahlzeiten: [], bedarfe: [], leistungen: [] }),
});

export const COLLECTIONS = speicher.COLLECTIONS as Collection[];
export const { getDB, useDB, append, replaceAll, clearAll, exportAll, exportJSONL, importFile } = speicher;
export { toJSONL, parseJSONL, download, heute, jetztHHMM } from "@versorgung/kern";
