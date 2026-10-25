// Was bei Fit Senior anders ist als bei ADHS. Der gemeinsame Datenvertrag steht im Kern.
import type { CheckInBasis, ISODate, MahlzeitBasis } from "@versorgung/kern";

export type { ISODate, HHMM, Einnahme, Phase, Versuch, LaborResult, Stoff, LaborAchse } from "@versorgung/kern";

/**
 * Tages-Check-in für ältere Menschen. Bewusst wenige Fragen, alle freiwillig:
 * was die Literatur bei Älteren als Warnzeichen führt – zu wenig trinken, zu wenig
 * Eiweiß, Bewegungsmangel, Vereinsamung, Stürze – und sonst nichts.
 */
export interface CheckIn extends CheckInBasis {
  /** Gläser/Tassen über den Tag – der häufigste stille Mangel im Alter. */
  getrunken?: number;
  /** War heute draußen. */
  draussen?: boolean;
  /** Hat mit jemandem gesprochen (nicht nur Fernsehen). */
  kontakt?: boolean;
  /** Bewegung in Minuten, grob. */
  bewegung_min?: number;
  /** Gestürzt oder fast gestürzt – jeder Eintrag ist ein Gesprächsanlass. */
  sturz?: "nein" | "beinahe" | "gestuerzt";
  /** Schmerzen 1–10. */
  schmerz?: number;
  /** Gewicht in kg, wenn gewogen – ungewollter Verlust ist das wichtigste Alarmzeichen. */
  gewicht_kg?: number;
  /**
   * Wadenumfang in cm, an der dicksten Stelle im Sitzen gemessen.
   * Einer der wenigen Werte, die man selbst mit einem Maßband erheben kann und die
   * etwas aussagen: er dient als Anhaltspunkt für die Muskelmasse.
   */
  wade_cm?: number;
}

export type Baustein =
  | "gemuese" | "obst" | "eiweiss" | "milch" | "vollkorn" | "huelsenfruechte" | "nuesse"
  | "fisch" | "trinken" | "fertig" | "suess" | "alkohol";

export type Mahlzeit = MahlzeitBasis<Baustein>;

/**
 * Ein Bedarf: etwas, das jemand braucht oder geregelt haben will.
 * Der Kern der "Versorgung organisieren"-Seite und zugleich die Grundlage
 * der Absprache mit Angehörigen – deshalb steht hier, wer das sieht und wer es tut.
 */
export interface Bedarf {
  schema_version: 1;
  id: string;
  datum: ISODate;
  bereich: "haushalt" | "einkauf" | "koerperpflege" | "mobilitaet" | "gesundheit" | "geld" | "gesellschaft" | "wohnen";
  titel: string;
  /** Wie es sich anfühlt, nicht wie es verwaltet wird: eigene Worte der Person. */
  eigene_worte?: string;
  dringlichkeit: "irgendwann" | "bald" | "dringend";
  /** Wer kümmert sich – leer heißt: noch niemand. */
  wer?: string;
  status: "offen" | "besprochen" | "beantragt" | "erledigt";
  notiz?: string;
}

/** Eine Leistung, die zustehen könnte – Antragsstand und was noch fehlt. */
export interface Leistung {
  schema_version: 1;
  id: string;
  datum: ISODate;
  /** Schlüssel aus data/leistungen.ts */
  key: string;
  status: "unbekannt" | "geprueft" | "beantragt" | "bewilligt" | "abgelehnt";
  seit?: ISODate;
  notiz?: string;
}
