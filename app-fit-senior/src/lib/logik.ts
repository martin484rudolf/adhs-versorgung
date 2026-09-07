// Fit-Senior-Logik: was nur für diesen Ast gilt. Gerechnet wird im Kern (@versorgung/kern).
//
// Leitgedanke: im Alter kippt selten alles auf einmal. Es kippt leise – zu wenig getrunken,
// zu wenig Eiweiß, weniger rausgegangen, niemanden gesprochen. Genau diese fünf Dinge
// schaut die App an, und sonst nichts.
import * as kern from "@versorgung/kern";
import type { Bausteindef, FeedbackRegel } from "@versorgung/kern";
import { LABOR, LABOR_WICHTIG } from "../data/labor";
import type { Baustein, Bedarf, CheckIn, LaborResult, Mahlzeit, Versuch } from "./typen";

// ---- Datum, Versuche, Einnahmen: unverändert aus dem Kern ----
export const { iso, addTage, tageZwischen, fmt, phasenplan, einnahmenLaufend } = kern;
export type { Stufe, LaborZeile, LaborTor, VersuchStand } from "@versorgung/kern";
export const versucheStand = (versuche: Versuch[], heute: string) => kern.versucheStand(versuche, heute);
export const versuchAuswertung = (v: Versuch, eintraege: CheckIn[], heute: string) =>
  kern.versuchAuswertung(v, eintraege, heute);

// ---- Labor mit der Registry dieser App ----
export const stufe = (wert: number, key: string) => kern.stufe(wert, key, LABOR);
export const laborStand = (tests: LaborResult[], eintraege: CheckIn[]) =>
  kern.laborStand(tests, eintraege, LABOR, LABOR_WICHTIG);

// ---- Essen und Trinken ----
// Gegenüber der ADHS-App: Trinken ist ein eigener Baustein, Fisch auch, Koffein fällt weg.
// Im Alter ist zu wenig trinken das häufigere Problem als zu viel Kaffee.
export const BAUSTEINE: Bausteindef<Baustein>[] = [
  { key: "eiweiss", label: "Eiweiß (Ei, Quark, Fleisch)", art: "plus" },
  { key: "milch", label: "Milchprodukt", art: "plus" },
  { key: "fisch", label: "Fisch", art: "plus" },
  { key: "gemuese", label: "Gemüse", art: "plus", ballast: true },
  { key: "obst", label: "Obst", art: "plus", ballast: true },
  { key: "vollkorn", label: "Vollkorn", art: "plus", ballast: true },
  { key: "huelsenfruechte", label: "Hülsenfrüchte", art: "plus", ballast: true },
  { key: "nuesse", label: "Nüsse/Saaten", art: "plus", ballast: true },
  { key: "trinken", label: "Etwas getrunken", art: "plus" },
  { key: "fertig", label: "Fertiggericht", art: "bremse" },
  { key: "suess", label: "Süß", art: "bremse" },
  { key: "alkohol", label: "Alkohol", art: "bremse" },
];

const REGELN: FeedbackRegel<Baustein>[] = [
  {
    wenn: (m) => !m.bausteine.some((b) => b === "eiweiss" || b === "milch" || b === "fisch"),
    text: "Quark, Käse oder ein Ei dazu hält die Muskeln.",
  },
  { wenn: (m) => !m.bausteine.includes("trinken"), text: "Ein Glas Wasser dazu?" },
  {
    wenn: (m) => !m.bausteine.some((b) => BAUSTEINE.find((d) => d.key === b)?.ballast),
    text: "Etwas Gemüse oder Obst tut der Verdauung gut.",
  },
];

/** Tagesbild dieser App: Eiweiß, Trinken, Pflanzliches, Bremsen, Essenslücke. */
export function tagesbild(mz: Mahlzeit[]) {
  const t = kern.tagesbild(mz, BAUSTEINE);
  return {
    mahlzeiten: t.mahlzeiten,
    eiweissMahlzeiten: t.proBaustein.eiweiss + t.proBaustein.milch + t.proBaustein.fisch,
    trinkenMahlzeiten: t.proBaustein.trinken,
    gemueseObst: t.proBaustein.gemuese + t.proBaustein.obst,
    ballast: t.ballast,
    bremsen: t.bremsen,
    pflanzen: t.pflanzen,
    maxLuecke: t.maxLuecke,
  };
}

export const wochenbild = (mahlzeiten: Mahlzeit[], bisDatum: string) =>
  kern.wochenbild(mahlzeiten, bisDatum, tagesbild);

export const mahlzeitFeedback = (m: Mahlzeit) => kern.mahlzeitFeedback(m, BAUSTEINE, REGELN);

// ---- Der Tagesblick: Erinnerung, keine Bilanz ----
export interface Hinweis {
  text: string;
  art: "gut" | "warn" | "rot";
}

/**
 * Was jetzt guttun würde. Der Ton ist die halbe Miete: Diese App ist eine
 * Gedächtnisstütze, kein Prüfbericht. Sie zählt nicht auf, was gefehlt hat,
 * sondern schlägt vor, was als Nächstes gut wäre – so, wie ein Zettel am
 * Kühlschrank es täte. Wer sich kontrolliert fühlt, hört auf zu tippen.
 *
 * Deshalb: kein "erst drei Gläser", kein "kein Eiweiß dabei", keine Note.
 * Höchstens drei Vorschläge, und jeder muss sich in fünf Minuten erledigen lassen.
 *
 * Die Schwellen sind Alltagsorientierung, keine Grenzwerte: Trinkmenge und
 * Eiweißbedarf gehören ärztlich geklärt, besonders bei Herz oder Niere.
 */
export function tagesblick(ci: CheckIn | undefined, mz: Mahlzeit[]): Hinweis[] {
  const h: Hinweis[] = [];
  const tb = tagesbild(mz);

  // Der Sturz ist die einzige Sache, die deutlich dasteht - er gehört besprochen.
  if (ci?.sturz === "gestuerzt")
    h.push({ text: "Ein Sturz gehört in der Praxis erwähnt, auch wenn nichts weh tut.", art: "rot" });
  else if (ci?.sturz === "beinahe")
    h.push({ text: "Wenn das öfter vorkommt: Physiotherapie hilft beim sicheren Gehen.", art: "warn" });

  if (typeof ci?.getrunken === "number") {
    if (ci.getrunken < 4) h.push({ text: "Ein Glas Wasser wäre jetzt gut.", art: "warn" });
    else if (ci.getrunken >= 6) h.push({ text: "Gut getrunken heute.", art: "gut" });
  }

  if (tb.mahlzeiten > 0 && tb.eiweissMahlzeiten === 0)
    h.push({ text: "Ein Quark oder ein Ei wäre gut für die Muskeln.", art: "warn" });
  else if (tb.eiweissMahlzeiten >= 3) h.push({ text: "Schön über den Tag verteilt gegessen.", art: "gut" });

  if (ci?.draussen === false) h.push({ text: "Ein paar Schritte vor die Tür tun gut.", art: "warn" });
  if (ci?.kontakt === false) h.push({ text: "Vielleicht jemanden anrufen?", art: "warn" });

  return h.slice(0, 3);
}

/**
 * Ungewollter Gewichtsverlust ist das ernsteste Zeichen, das man selbst bemerken kann:
 * mehr als 5 % in einem halben Jahr gilt als abklärungsbedürftig.
 */
export function gewichtsverlauf(eintraege: CheckIn[]) {
  const mit = eintraege.filter((e) => typeof e.gewicht_kg === "number").sort((a, b) => a.datum.localeCompare(b.datum));
  if (mit.length < 2) return null;
  const erst = mit[0];
  const letzt = mit[mit.length - 1];
  const diff = (letzt.gewicht_kg ?? 0) - (erst.gewicht_kg ?? 0);
  const prozent = (diff / (erst.gewicht_kg || 1)) * 100;
  return {
    von: erst.datum,
    bis: letzt.datum,
    start: erst.gewicht_kg ?? 0,
    aktuell: letzt.gewicht_kg ?? 0,
    diff: Math.round(diff * 10) / 10,
    prozent: Math.round(prozent * 10) / 10,
    auffaellig: prozent <= -5,
  };
}

// ---- Bedarfe ----
export const BEREICHE: { key: Bedarf["bereich"]; label: string; frage: string }[] = [
  { key: "haushalt", label: "Haushalt", frage: "Was im Haushalt fällt schwer?" },
  { key: "einkauf", label: "Einkauf & Essen", frage: "Wie kommt das Essen ins Haus?" },
  { key: "koerperpflege", label: "Körperpflege", frage: "Was beim Waschen oder Anziehen ist mühsam?" },
  { key: "mobilitaet", label: "Unterwegs", frage: "Wo kommen Sie nicht mehr hin?" },
  { key: "gesundheit", label: "Gesundheit", frage: "Was ist bei Arzt, Medikamenten oder Terminen offen?" },
  { key: "geld", label: "Geld & Papiere", frage: "Welche Post oder welches Formular liegt herum?" },
  { key: "gesellschaft", label: "Gesellschaft", frage: "Wen würden Sie gern öfter sehen?" },
  { key: "wohnen", label: "Wohnung", frage: "Wo in der Wohnung ist es unpraktisch oder gefährlich?" },
];

export const DRINGLICHKEIT: { key: Bedarf["dringlichkeit"]; label: string; art: "n" | "warn" | "rot" }[] = [
  { key: "irgendwann", label: "irgendwann", art: "n" },
  { key: "bald", label: "bald", art: "warn" },
  { key: "dringend", label: "dringend", art: "rot" },
];

const RANG: Record<Bedarf["dringlichkeit"], number> = { dringend: 0, bald: 1, irgendwann: 2 };

/** Offene zuerst, Dringendes oben – so liest es sich vor einem Gespräch von selbst richtig. */
export function bedarfeSortiert(bedarfe: Bedarf[]) {
  return [...bedarfe].sort((a, b) => {
    const offen = (x: Bedarf) => (x.status === "erledigt" ? 1 : 0);
    return offen(a) - offen(b) || RANG[a.dringlichkeit] - RANG[b.dringlichkeit] || b.datum.localeCompare(a.datum);
  });
}

export const neueId = () => Math.random().toString(36).slice(2, 10);
