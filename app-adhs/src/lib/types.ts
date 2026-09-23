// Was ADHS-spezifisch ist. Der gemeinsame Datenvertrag steht im Kern (@versorgung/kern).
import type { CheckInBasis, MahlzeitBasis } from "@versorgung/kern";

export type { ISODate, Einnahme, Phase, Versuch, LaborResult, Stoff, LaborAchse } from "@versorgung/kern";

/** Check-in mit den Skalen, die für ADHS zählen. */
export interface CheckIn extends CheckInBasis {
  reizlast?: number;
  soziale_energie?: number;
  rsd_episoden?: number;
  krampf?: number;
}

export type Baustein =
  | "gemuese" | "obst" | "eiweiss" | "vollkorn" | "huelsenfruechte" | "milch"
  | "nuesse" | "fertig" | "suess" | "alkohol" | "koffein" | "pilze" | "sprossen" | "eigenes";

export type Mahlzeit = MahlzeitBasis<Baustein>;
