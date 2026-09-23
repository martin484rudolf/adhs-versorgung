// Datenvertrag – gemeinsam für alle Apps auf diesem Kern.
// Quelle der Wahrheit: psychologie-tool/DATENMODELL.md (schema_version 1).
// Alle Sätze sind append-only JSONL-kompatibel; der Browser-Speicher hält sie als Arrays.
//
// Was hier steht, gilt für jede App. Was nur eine App braucht (RSD-Episoden bei ADHS,
// Trinkmenge bei Fit Senior), kommt in deren eigene typen.ts und erweitert die Basis.

export type ISODate = string; // YYYY-MM-DD
export type HHMM = string; // HH:MM

/** Tagescheck-in. Jede App erweitert das um ihre eigenen Skalen. */
export interface CheckInBasis {
  schema_version: 1;
  datum: ISODate;
  quelle: "self";
  stimmung?: number;
  schlaf_h?: number;
  darm?: number;
  hunger?: number;
  einschlaf_min?: number;
  bett_uhrzeit?: HHMM;
  medikation?: string;
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

/** TestResult mit typ "labor" (tests.jsonl) */
export interface LaborResult {
  schema_version: 1;
  datum: ISODate;
  typ: "labor";
  quelle: string;
  werte: Record<string, number>;
  meta?: { ref?: Record<string, string>; beleg?: string };
}

/** Mahlzeit – Bausteine statt Kalorien. Welche Bausteine es gibt, legt die App fest. */
export interface MahlzeitBasis<B extends string = string> {
  schema_version: 1;
  datum: ISODate;
  uhrzeit: HHMM;
  bausteine: B[];
  pflanzen?: string[];
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
