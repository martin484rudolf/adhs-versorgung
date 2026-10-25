// Puls und Herzratenvariabilität.
//
// Ein Brustgurt liefert nicht nur die Herzfrequenz, sondern die Abstände zwischen zwei
// Herzschlägen – die RR-Intervalle. Deren Schwankung ist die HRV. Sie sagt mehr über
// Erholung und Regulation aus als der Puls allein, und sie ist der Grund, warum sich
// ein Gurt gegenüber jeder Uhr lohnt: Uhren liefern meist nur fertige Mittelwerte.
//
// Alles hier sind reine Funktionen ohne Gerätebezug – gerechnet wird gleich,
// ob die Zahlen live aus dem Gurt kommen oder aus einem Export.
import type { ISODate, HHMM } from "./typen";

/** RR-Intervall in Millisekunden, so wie es vom Gurt kommt. */
export type RR = number;

/**
 * Eine Messung. Die Rohdaten bleiben erhalten, damit sich die Kennzahlen jederzeit
 * neu rechnen lassen – etwa wenn die Artefaktfilterung besser wird.
 */
export interface HrvSession {
  schema_version: 1;
  datum: ISODate;
  uhrzeit: HHMM;
  typ: "hrv-session";
  /** Woher die Zahlen stammen, z. B. "Polar H10" oder "Simulation". */
  quelle: string;
  /** Gemessene Dauer in Sekunden. */
  dauer_s: number;
  /** Rohe RR-Intervalle in ms. */
  rr: RR[];
  /** Was die Person beim Messen getan hat – ohne das ist ein HRV-Wert kaum vergleichbar. */
  bedingung?: "ruhe" | "morgens" | "vor_schlaf" | "atemuebung" | "sonstiges";
  notiz?: string;
}

/**
 * Tageswerte aus einer Uhr. Bewusst grob gehalten: Schlafphasen und
 * "Erholungswerte" der Hersteller sind herstellereigene Rechnungen, die sich
 * zwischen Modellen nicht vergleichen lassen – deshalb stehen hier nur Größen,
 * die jedes Gerät auf dieselbe Weise meint.
 */
export interface TagesWerte {
  schema_version: 1;
  datum: ISODate;
  typ: "tageswerte";
  quelle: string;
  schlaf_h?: number;
  ruhepuls?: number;
  schritte?: number;
  /** Was das Gerät als HRV über Nacht angibt, meist RMSSD in ms. */
  hrv_ms?: number;
}

// ---- Artefakte ----

/**
 * Ein Gurt verliert gelegentlich den Hautkontakt, und dann steht ein einzelner
 * RR-Wert weit daneben. Für RMSSD ist das fatal: die Kennzahl misst gerade die
 * Sprünge zwischen benachbarten Schlägen, ein einziger Ausreißer verfälscht sie.
 *
 * Zwei übliche Filter: ein plausibler Bereich (entspricht etwa 30–200 Schlägen
 * pro Minute) und ein Sprungfilter – wer mehr als ein Fünftel vom Vorgänger
 * abweicht, fliegt raus.
 */
export const RR_MIN = 300;
export const RR_MAX = 2000;
export const SPRUNG_MAX = 0.2;

export interface Bereinigt {
  rr: RR[];
  /** Wie viele Werte verworfen wurden – die Zahl gehört in die Oberfläche. */
  verworfen: number;
}

export function bereinige(rr: RR[]): Bereinigt {
  const roh = rr.filter((x) => x >= RR_MIN && x <= RR_MAX);
  const raus = rr.length - roh.length;
  if (roh.length === 0) return { rr: [], verworfen: rr.length };

  const gut: RR[] = [roh[0]];
  let verworfen = raus;
  for (let i = 1; i < roh.length; i++) {
    const vorher = gut[gut.length - 1];
    if (Math.abs(roh[i] - vorher) / vorher > SPRUNG_MAX) {
      verworfen++;
      continue;
    }
    gut.push(roh[i]);
  }
  return { rr: gut, verworfen };
}

// ---- Kennzahlen ----

export interface Kennzahlen {
  /** Wurzel aus dem mittleren Quadrat aufeinanderfolgender Differenzen, in ms. */
  rmssd: number | null;
  /** Streuung aller RR-Intervalle, in ms. */
  sdnn: number | null;
  /** Mittlere Herzfrequenz in Schlägen pro Minute. */
  hf: number | null;
  /** Wie viele Schläge in die Rechnung eingegangen sind. */
  schlaege: number;
  verworfen: number;
  /** Gemessene Dauer in Sekunden, aus den Intervallen selbst. */
  dauer_s: number;
  /** Unter einer Minute ist RMSSD wacklig – das muss die Oberfläche sagen dürfen. */
  belastbar: boolean;
}

export const MINDESTDAUER_S = 60;

export function kennzahlen(rr: RR[]): Kennzahlen {
  const { rr: rein, verworfen } = bereinige(rr);
  const dauer_s = Math.round(rein.reduce((s, x) => s + x, 0) / 1000);

  if (rein.length < 2) {
    return { rmssd: null, sdnn: null, hf: null, schlaege: rein.length, verworfen, dauer_s, belastbar: false };
  }

  let quadratsumme = 0;
  for (let i = 1; i < rein.length; i++) quadratsumme += (rein[i] - rein[i - 1]) ** 2;
  const rmssd = Math.sqrt(quadratsumme / (rein.length - 1));

  const mittel = rein.reduce((s, x) => s + x, 0) / rein.length;
  const sdnn = Math.sqrt(rein.reduce((s, x) => s + (x - mittel) ** 2, 0) / (rein.length - 1));

  return {
    rmssd: runde(rmssd),
    sdnn: runde(sdnn),
    // Ganze Schläge: eine Nachkommastelle beim Puls wäre Scheingenauigkeit.
    hf: Math.round(60000 / mittel),
    schlaege: rein.length,
    verworfen,
    dauer_s,
    belastbar: dauer_s >= MINDESTDAUER_S,
  };
}

const runde = (x: number) => Math.round(x * 10) / 10;

/**
 * Der eigene Verlauf ist der einzige sinnvolle Maßstab. HRV-Werte streuen zwischen
 * Menschen um ein Vielfaches – eine Einordnung in "gut" oder "schlecht" anhand
 * fremder Normwerte wäre eine Scheingenauigkeit. Deshalb gibt es hier keine
 * Bewertung, sondern nur den Vergleich mit der eigenen Vorgeschichte.
 */
export interface Vergleich {
  mittel: number;
  abweichung: number;
  /** Abweichung in Standardabweichungen der eigenen Messreihe. */
  z: number | null;
  richtung: "darueber" | "darunter" | "wie sonst";
}

export function vergleicheMitVorgeschichte(wert: number, vorher: number[]): Vergleich | null {
  if (vorher.length < 3) return null;
  const mittel = vorher.reduce((s, x) => s + x, 0) / vorher.length;
  const sd = Math.sqrt(vorher.reduce((s, x) => s + (x - mittel) ** 2, 0) / (vorher.length - 1));
  const abweichung = wert - mittel;
  const z = sd > 0 ? abweichung / sd : null;

  // Ohne Streuung in der Vorgeschichte gibt es kein z – dann entscheidet die Abweichung
  // selbst, ab einem Zehntel des bisherigen Mittels. Sonst hieße ein deutlich anderer
  // Wert fälschlich "wie sonst".
  const auffaellig = z === null ? Math.abs(abweichung) > Math.abs(mittel) * 0.1 : Math.abs(z) >= 1;

  return {
    mittel: runde(mittel),
    abweichung: runde(abweichung),
    z: z === null ? null : runde(z),
    richtung: !auffaellig ? "wie sonst" : abweichung > 0 ? "darueber" : "darunter",
  };
}
