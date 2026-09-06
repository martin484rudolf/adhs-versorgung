// Datenvertrag – identisch mit psychologie-tool/DATENMODELL.md (schema_version 1).
// Alle Sätze sind append-only JSONL-kompatibel; der Browser-Speicher hält sie als Arrays.

export type ISODate = string; // YYYY-MM-DD

export interface CheckIn {
  schema_version: 1;
  datum: ISODate;
  quelle: "self";
  stimmung?: number;
  reizlast?: number;
  soziale_energie?: number;
  schlaf_h?: number;
  rsd_episoden?: number;
  medikation?: string;
  krampf?: number;
  darm?: number;
  hunger?: number;
  einschlaf_min?: number;
  bett_uhrzeit?: string;
  einnahmen?: string[];
  freitext?: string;
}

export interface Einnahme {
  schema_version: 1;
  datum: ISODate;
  stoff: string;
  beginn: ISODate;
  ende: ISODate | null;
  form?: string | null;
  dosis?: string | null;
  zeitpunkt?: string | null;
  quelle: "kauf" | "eigenzucht" | "apotheke" | "rezept";
  notiz?: string;
}

export interface Phase {
  phase: "mit" | "ohne";
  von: ISODate;
  bis: ISODate;
}

export interface Versuch {
  schema_version: 1;
  datum: ISODate;
  id: string;
  typ: "wechsel" | "vorher_nachher";
  variable: string;
  frage?: string | null;
  messgroessen: string[];
  stoergroessen: string[];
  beginn: ISODate;
  ende: ISODate;
  status: "geplant" | "laeuft" | "fertig";
  evidenzstufe: string;
  bewertung_erst_nach_abschluss: true;
  phasen?: Phase[];
  labor_vorher?: ISODate | null;
  labor_nachher_ab?: ISODate;
}

// TestResult mit typ "labor" (tests.jsonl)
export interface LaborResult {
  schema_version: 1;
  datum: ISODate;
  typ: "labor";
  quelle: string;
  werte: Record<string, number>;
  meta?: { ref?: Record<string, string>; beleg?: string };
}

// Neu in der App: Mahlzeit (mahlzeiten.jsonl) – Bausteine statt Kalorien.
export type Baustein =
  | "gemuese" | "obst" | "eiweiss" | "vollkorn" | "huelsenfruechte" | "milch"
  | "nuesse" | "fertig" | "suess" | "alkohol" | "koffein" | "pilze" | "sprossen" | "eigenes";

export interface Mahlzeit {
  schema_version: 1;
  datum: ISODate;
  uhrzeit: string; // HH:MM
  bausteine: Baustein[];
  pflanzen?: string[]; // verschiedene Pflanzen (fuer Vielfalt/Woche)
  menge?: "klein" | "normal" | "gross";
  notiz?: string;
}

export interface Stoff {
  key: string;
  name: string;
  ebene: "lebensfuehrung" | "kueche" | "supplement" | "medikament";
  ziel: string[];
  evidenz: "stark" | "mittel" | "schwach" | "vorlaeufig" | "keine";
  effekt?: string;
  dosis?: string;
  obergrenze?: string;
  hinweis?: string;
  voraussetzung_labor?: { marker: string; stufe: string[]; optional?: boolean };
  wechselwirkung?: string[];
  versuch?: "wechsel" | "vorher_nachher" | "keiner";
  dauer_tage?: number;
  quellen?: string[];
}

export interface LaborAchse {
  label: string;
  einheit?: string;
  stufen?: { mangel_unter: number; grau_bis: number };
  hinweis?: string;
}
