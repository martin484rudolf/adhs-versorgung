// ADHS-Logik: das, was nur für diesen Ast gilt. Gerechnet wird im Kern (@versorgung/kern),
// hier stehen die Bausteine, die Stimmungen und die Labor-Registry dieser App.
import * as kern from "@versorgung/kern";
import type { Bausteindef, FeedbackRegel } from "@versorgung/kern";
import { LABOR, LABOR_WICHTIG } from "../data/labor";
import stoffeJson from "../data/stoffe.json";
import type { Baustein, CheckIn, LaborResult, Mahlzeit, Stoff, Versuch } from "./types";

export const STOFFE = stoffeJson.stoffe as Stoff[];
export const STOFFE_META = stoffeJson.meta as { rote_flaggen: string[]; medizinischer_hinweis: string };
export const stoff = (key: string) => STOFFE.find((s) => s.key === key);

// ---- Datum und Versuche: unverändert aus dem Kern ----
export const { iso, addTage, tageZwischen, fmt, phasenplan, einnahmenLaufend } = kern;
export type { Stufe, LaborZeile, LaborTor, VersuchStand } from "@versorgung/kern";
export const versucheStand = (versuche: Versuch[], heute: string) => kern.versucheStand(versuche, heute);
export const versuchAuswertung = (v: Versuch, eintraege: CheckIn[], heute: string) =>
  kern.versuchAuswertung(v, eintraege, heute);

// ---- Labor: Registry dieser App vorgeben, sonst gleiche Rechnung ----
export const stufe = (wert: number, key: string) => kern.stufe(wert, key, LABOR);
export const laborStand = (tests: LaborResult[], eintraege: CheckIn[]) =>
  kern.laborStand(tests, eintraege, LABOR, LABOR_WICHTIG);
export const darmVorbehalt = kern.darmVorbehalt;
export const laborTor = (s: Stoff, laborZeilen: kern.LaborZeile[], vorbehalt: boolean) =>
  kern.laborTor(s, laborZeilen, vorbehalt, LABOR);

// ---- Ernährung: Bausteine statt Kalorien ----
export const BAUSTEINE: Bausteindef<Baustein>[] = [
  { key: "gemuese", label: "Gemüse", art: "plus", ballast: true },
  { key: "obst", label: "Obst", art: "plus", ballast: true },
  { key: "eiweiss", label: "Eiweiß", art: "plus" },
  { key: "vollkorn", label: "Vollkorn", art: "plus", ballast: true },
  { key: "huelsenfruechte", label: "Hülsenfrüchte", art: "plus", ballast: true },
  { key: "nuesse", label: "Nüsse/Saaten", art: "plus", ballast: true },
  { key: "milch", label: "Milchprodukt", art: "plus" },
  { key: "pilze", label: "Pilze", art: "eigen", ballast: true },
  { key: "sprossen", label: "Sprossen", art: "eigen", ballast: true },
  { key: "eigenes", label: "Eigene Zucht", art: "eigen" },
  { key: "fertig", label: "Fertig/Fastfood", art: "bremse" },
  { key: "suess", label: "Süß", art: "bremse" },
  { key: "koffein", label: "Koffein", art: "bremse" },
  { key: "alkohol", label: "Alkohol", art: "bremse" },
];

const REGELN: FeedbackRegel<Baustein>[] = [
  { wenn: (m) => !m.bausteine.includes("eiweiss"), text: "Eiweiß fehlt – Ei, Quark, Linsen, Fisch dazu hält länger satt" },
  {
    wenn: (m) => !m.bausteine.some((b) => BAUSTEINE.find((d) => d.key === b)?.ballast),
    text: "nichts fürs Mikrobiom dabei – Gemüse, Vollkorn oder Hülsenfrüchte",
  },
  { wenn: (m) => m.bausteine.includes("koffein") && m.uhrzeit > "14:00", text: "Koffein nach 14 Uhr schiebt den Schlaf" },
  {
    wenn: (m) => m.bausteine.includes("suess") && !m.bausteine.includes("eiweiss"),
    text: "Süß allein = Zuckerkurve; mit Eiweiß oder Nüssen flacher",
  },
];

/** Tagesbild dieser App: die Kern-Zählung, übersetzt in die vier Ziele und zwei Bremsen. */
export function tagesbild(mz: Mahlzeit[]) {
  const t = kern.tagesbild(mz, BAUSTEINE);
  return {
    mahlzeiten: t.mahlzeiten,
    gemueseObst: t.proBaustein.gemuese + t.proBaustein.obst,
    eiweissMahlzeiten: t.proBaustein.eiweiss,
    ballast: t.ballast,
    pflanzen: t.pflanzen,
    maxLuecke: t.maxLuecke,
    bremsen: t.proBaustein.fertig + t.proBaustein.suess + t.proBaustein.alkohol,
    koffein: t.proBaustein.koffein,
  };
}

/** Wochenbild: Pflanzenvielfalt (Ziel 30 verschiedene, American Gut Project) und Tagesbilder. */
export const wochenbild = (mahlzeiten: Mahlzeit[], bisDatum: string) =>
  kern.wochenbild(mahlzeiten, bisDatum, tagesbild);

const KOPF = (plus: number, bremse: number) =>
  plus >= 3 && bremse === 0 ? "Gute Mahlzeit." : bremse >= 2 ? "Eher Bremse." : "Okay.";

export const mahlzeitFeedback = (m: Mahlzeit) => kern.mahlzeitFeedback(m, BAUSTEINE, REGELN, KOPF);

// ---- Stimmung → was jetzt hilft (Küche/Lebensführung ohne Labor, Supplement mit Labor-Tor) ----
export const STIMMUNGEN: { key: string; label: string; ziele: string[] }[] = [
  { key: "unruhig", label: "unruhig / aufgedreht", ziele: ["unruhe", "schlaf"] },
  { key: "muede", label: "müde / antriebslos", ziele: ["energie", "aufmerksamkeit"] },
  { key: "gereizt", label: "gereizt / dünnhäutig", ziele: ["stimmung", "unruhe"] },
  { key: "hungrig", label: "hungrig / unterzuckert", ziele: ["energie"] },
  { key: "verkrampft", label: "Krämpfe", ziele: ["kraempfe"] },
  { key: "darm", label: "Darm rebelliert", ziele: ["darm"] },
  { key: "schlaf", label: "schlecht geschlafen", ziele: ["schlaf"] },
  { key: "training", label: "vor dem Training", ziele: ["ausdauer", "kraft"] },
];
