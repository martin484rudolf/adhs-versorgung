// Logik – 1:1 zu skripts/versorgung.py. Daten sind dumm, hier wird gerechnet.
import type { CheckIn, Einnahme, LaborResult, Mahlzeit, Phase, Stoff, Versuch, Baustein } from "./types";
import { LABOR, LABOR_WICHTIG } from "../data/labor";
import stoffeJson from "../data/stoffe.json";

export const STOFFE = stoffeJson.stoffe as Stoff[];
export const STOFFE_META = stoffeJson.meta as { rote_flaggen: string[]; medizinischer_hinweis: string };
export const stoff = (key: string) => STOFFE.find((s) => s.key === key);

export type Stufe = "MANGEL" | "grau" | "normal" | "ohne Stufenlogik";
export function stufe(wert: number, key: string): Stufe {
  const st = LABOR[key]?.stufen;
  if (!st || typeof wert !== "number") return "ohne Stufenlogik";
  if (wert < st.mangel_unter) return "MANGEL";
  if (wert <= st.grau_bis) return "grau";
  return "normal";
}

export interface LaborZeile { key: string; label: string; wert: number; einheit: string; stufe: Stufe; datum: string; quelle: string; ref?: string }
export function laborStand(tests: LaborResult[], eintraege: CheckIn[]) {
  const letzte = new Map<string, LaborZeile>();
  for (const r of [...tests].filter((t) => t.typ === "labor").sort((a, b) => a.datum.localeCompare(b.datum))) {
    for (const [k, v] of Object.entries(r.werte)) {
      letzte.set(k, { key: k, label: LABOR[k]?.label ?? k, wert: v, einheit: LABOR[k]?.einheit ?? "", stufe: stufe(v, k), datum: r.datum, quelle: r.quelle, ref: r.meta?.ref?.[k] });
    }
  }
  const zeilen = [...letzte.values()];
  const fehlt = LABOR_WICHTIG.filter((k) => !letzte.has(k)).map((k) => LABOR[k].label);
  return { zeilen, fehlt, vorbehalt: darmVorbehalt(eintraege) };
}
export function darmVorbehalt(eintraege: CheckIn[], tage = 14) {
  const ci = eintraege.filter((e) => typeof e.darm === "number").slice(-tage);
  return ci.length > 0 && ci.reduce((s, e) => s + (e.darm ?? 0), 0) / ci.length >= 5;
}

export function einnahmenLaufend(einnahmen: Einnahme[]) {
  const last = new Map<string, Einnahme>();
  for (const r of einnahmen) last.set(r.stoff, r);
  return [...last.values()].filter((r) => !r.ende);
}

export function phasenplan(beginn: string, tage: number, anzahl: number): Phase[] {
  const plan: Phase[] = [];
  let d = new Date(beginn + "T00:00:00");
  for (let i = 0; i < anzahl; i++) {
    const von = iso(d);
    const bisD = new Date(d); bisD.setDate(bisD.getDate() + tage - 1);
    plan.push({ phase: i % 2 === 0 ? "mit" : "ohne", von, bis: iso(bisD) });
    d = new Date(bisD); d.setDate(d.getDate() + 1);
  }
  return plan;
}
export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export function addTage(datum: string, n: number) { const d = new Date(datum + "T00:00:00"); d.setDate(d.getDate() + n); return iso(d); }
export function tageZwischen(a: string, b: string) { return Math.round((new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime()) / 86400000); }

export interface VersuchStand { v: Versuch; status: "geplant" | "laeuft" | "fertig"; tag?: number; gesamt?: number; phase?: Phase; text: string }
export function versucheStand(versuche: Versuch[], heute: string): VersuchStand[] {
  return versuche.map((v) => {
    if (heute < v.beginn) return { v, status: "geplant", text: `startet ${fmt(v.beginn)}` };
    if (heute > v.ende) return { v, status: "fertig", text: `abgeschlossen ${fmt(v.ende)} – jetzt auswerten` };
    const tag = tageZwischen(v.beginn, heute) + 1, gesamt = tageZwischen(v.beginn, v.ende) + 1;
    const phase = v.phasen?.find((p) => p.von <= heute && heute <= p.bis);
    return { v, status: "laeuft", tag, gesamt, phase, text: `Tag ${tag} von ${gesamt}` + (phase ? ` · Phase bis ${fmt(phase.bis)}` : "") };
  });
}
export function versuchAuswertung(v: Versuch, eintraege: CheckIn[], heute: string) {
  const fertig = heute >= v.ende;
  const mess: Record<string, { mit: [number | null, number]; ohne: [number | null, number] }> = {};
  if (v.typ === "wechsel" && v.phasen) {
    for (const m of v.messgroessen) {
      const mit: number[] = [], ohne: number[] = [];
      for (const ph of v.phasen) {
        const vals = eintraege.filter((e) => ph.von <= e.datum && e.datum <= ph.bis).map((e) => (e as unknown as Record<string, unknown>)[m]).filter((x): x is number => typeof x === "number");
        (ph.phase === "mit" ? mit : ohne).push(...vals);
      }
      mess[m] = { mit: mittel(mit), ohne: mittel(ohne) };
    }
  }
  return { fertig, mess };
}
const mittel = (a: number[]): [number | null, number] => (a.length ? [Math.round((a.reduce((s, x) => s + x, 0) / a.length) * 100) / 100, a.length] : [null, 0]);
export const fmt = (d: string) => { const [y, m, t] = d.split("-"); return `${t}.${m}.${y}`; };

// ---- Ernährung: Bausteine statt Kalorien ----
export const BAUSTEINE: { key: Baustein; label: string; art: "plus" | "bremse" | "eigen" }[] = [
  { key: "gemuese", label: "Gemüse", art: "plus" },
  { key: "obst", label: "Obst", art: "plus" },
  { key: "eiweiss", label: "Eiweiß", art: "plus" },
  { key: "vollkorn", label: "Vollkorn", art: "plus" },
  { key: "huelsenfruechte", label: "Hülsenfrüchte", art: "plus" },
  { key: "nuesse", label: "Nüsse/Saaten", art: "plus" },
  { key: "milch", label: "Milchprodukt", art: "plus" },
  { key: "pilze", label: "Pilze", art: "eigen" },
  { key: "sprossen", label: "Sprossen", art: "eigen" },
  { key: "eigenes", label: "Eigene Zucht", art: "eigen" },
  { key: "fertig", label: "Fertig/Fastfood", art: "bremse" },
  { key: "suess", label: "Süß", art: "bremse" },
  { key: "koffein", label: "Koffein", art: "bremse" },
  { key: "alkohol", label: "Alkohol", art: "bremse" },
];
const BALLAST: Baustein[] = ["gemuese", "obst", "vollkorn", "huelsenfruechte", "nuesse", "pilze", "sprossen"];

/** Tagesbild aus den Mahlzeiten eines Tages – vier Ziele, zwei Bremsen. */
export function tagesbild(mz: Mahlzeit[]) {
  const sorted = [...mz].sort((a, b) => a.uhrzeit.localeCompare(b.uhrzeit));
  const count = (b: Baustein) => sorted.filter((m) => m.bausteine.includes(b)).length;
  const pflanzen = new Set<string>();
  sorted.forEach((m) => (m.pflanzen ?? []).forEach((p) => pflanzen.add(p.trim().toLowerCase())));
  const eiweissMahlzeiten = sorted.filter((m) => m.bausteine.includes("eiweiss")).length;
  const ballast = sorted.filter((m) => m.bausteine.some((b) => BALLAST.includes(b))).length;
  let maxLuecke = 0;
  for (let i = 1; i < sorted.length; i++) {
    const [h1, m1] = sorted[i - 1].uhrzeit.split(":").map(Number), [h2, m2] = sorted[i].uhrzeit.split(":").map(Number);
    maxLuecke = Math.max(maxLuecke, (h2 * 60 + m2 - h1 * 60 - m1) / 60);
  }
  return {
    mahlzeiten: sorted.length,
    gemueseObst: count("gemuese") + count("obst"),
    eiweissMahlzeiten,
    ballast,
    pflanzen: [...pflanzen],
    maxLuecke,
    bremsen: count("fertig") + count("suess") + count("alkohol"),
    koffein: count("koffein"),
  };
}
/** Wochenbild: Pflanzenvielfalt (Ziel 30 verschiedene, American Gut Project) und Mittelwerte. */
export function wochenbild(mahlzeiten: Mahlzeit[], bisDatum: string) {
  const von = addTage(bisDatum, -6);
  const tage: Record<string, Mahlzeit[]> = {};
  for (let i = 0; i < 7; i++) tage[addTage(von, i)] = [];
  mahlzeiten.filter((m) => m.datum >= von && m.datum <= bisDatum).forEach((m) => tage[m.datum]?.push(m));
  const pflanzen = new Set<string>();
  const tb = Object.entries(tage).map(([datum, mz]) => {
    const t = tagesbild(mz);
    t.pflanzen.forEach((p) => pflanzen.add(p));
    return { datum, ...t };
  });
  return { von, bis: bisDatum, tage: tb, pflanzenVielfalt: pflanzen.size };
}
/** Sofort-Rückmeldung nach einer Mahlzeit – Information, die man berücksichtigen kann. */
export function mahlzeitFeedback(m: Mahlzeit): string {
  const plus = m.bausteine.filter((b) => BAUSTEINE.find((x) => x.key === b)?.art !== "bremse").length;
  const bremse = m.bausteine.filter((b) => BAUSTEINE.find((x) => x.key === b)?.art === "bremse").length;
  const tipps: string[] = [];
  if (!m.bausteine.includes("eiweiss")) tipps.push("Eiweiß fehlt – Ei, Quark, Linsen, Fisch dazu hält länger satt");
  if (!m.bausteine.some((b) => BALLAST.includes(b))) tipps.push("nichts fürs Mikrobiom dabei – Gemüse, Vollkorn oder Hülsenfrüchte");
  if (m.bausteine.includes("koffein") && m.uhrzeit > "14:00") tipps.push("Koffein nach 14 Uhr schiebt den Schlaf");
  if (m.bausteine.includes("suess") && !m.bausteine.includes("eiweiss")) tipps.push("Süß allein = Zuckerkurve; mit Eiweiß oder Nüssen flacher");
  const head = plus >= 3 && bremse === 0 ? "Gute Mahlzeit." : bremse >= 2 ? "Eher Bremse." : "Okay.";
  return [head, ...tipps].join(" ");
}

// ---- Stimmung → was jetzt hilft (nur Küche/Lebensführung ohne Labor; Supplement mit Labor-Tor) ----
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
export interface LaborTor { ok: boolean; text: string }
export function laborTor(s: Stoff, laborZeilen: LaborZeile[], vorbehalt: boolean): LaborTor {
  if (s.ebene !== "supplement" || !s.voraussetzung_labor) return { ok: true, text: "" };
  const z = laborZeilen.find((l) => l.key === s.voraussetzung_labor!.marker);
  const label = LABOR[s.voraussetzung_labor.marker]?.label ?? s.voraussetzung_labor.marker;
  if (!z) return { ok: !!s.voraussetzung_labor.optional, text: `${label} noch nicht bestimmt` };
  const passt = s.voraussetzung_labor.stufe.map((x) => x.toLowerCase()).includes(z.stufe.toLowerCase());
  if (vorbehalt) return { ok: false, text: `${label}: ${z.stufe} – aber Darm-Vorbehalt (Aufnahme fraglich)` };
  return { ok: passt, text: `${label}: ${z.wert} ${z.einheit} → ${z.stufe}${passt ? "" : " – keine Grundlage"}` };
}
