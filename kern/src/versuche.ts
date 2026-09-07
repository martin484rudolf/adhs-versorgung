// Versuche: wechsel (mit/ohne im Wechsel) oder vorher_nachher.
// Bewertet wird erst nach Abschluss – das ist der ganze Sinn der Sache.
import type { CheckInBasis, Phase, Versuch } from "./typen";
import { fmt, iso, tageZwischen } from "./datum";

export function phasenplan(beginn: string, tage: number, anzahl: number): Phase[] {
  const plan: Phase[] = [];
  let d = new Date(beginn + "T00:00:00");
  for (let i = 0; i < anzahl; i++) {
    const von = iso(d);
    const bisD = new Date(d);
    bisD.setDate(bisD.getDate() + tage - 1);
    plan.push({ phase: i % 2 === 0 ? "mit" : "ohne", von, bis: iso(bisD) });
    d = new Date(bisD);
    d.setDate(d.getDate() + 1);
  }
  return plan;
}

export interface VersuchStand {
  v: Versuch;
  status: "geplant" | "laeuft" | "fertig";
  tag?: number;
  gesamt?: number;
  phase?: Phase;
  text: string;
}

export function versucheStand(versuche: Versuch[], heute: string): VersuchStand[] {
  return versuche.map((v) => {
    if (heute < v.beginn) return { v, status: "geplant", text: `startet ${fmt(v.beginn)}` };
    if (heute > v.ende) return { v, status: "fertig", text: `abgeschlossen ${fmt(v.ende)} – jetzt auswerten` };
    const tag = tageZwischen(v.beginn, heute) + 1;
    const gesamt = tageZwischen(v.beginn, v.ende) + 1;
    const phase = v.phasen?.find((p) => p.von <= heute && heute <= p.bis);
    return {
      v,
      status: "laeuft",
      tag,
      gesamt,
      phase,
      text: `Tag ${tag} von ${gesamt}` + (phase ? ` · Phase bis ${fmt(phase.bis)}` : ""),
    };
  });
}

export function versuchAuswertung(v: Versuch, eintraege: CheckInBasis[], heute: string) {
  const fertig = heute >= v.ende;
  const mess: Record<string, { mit: [number | null, number]; ohne: [number | null, number] }> = {};
  if (v.typ === "wechsel" && v.phasen) {
    for (const m of v.messgroessen) {
      const mit: number[] = [];
      const ohne: number[] = [];
      for (const ph of v.phasen) {
        const vals = eintraege
          .filter((e) => ph.von <= e.datum && e.datum <= ph.bis)
          .map((e) => (e as unknown as Record<string, unknown>)[m])
          .filter((x): x is number => typeof x === "number");
        (ph.phase === "mit" ? mit : ohne).push(...vals);
      }
      mess[m] = { mit: mittel(mit), ohne: mittel(ohne) };
    }
  }
  return { fertig, mess };
}

const mittel = (a: number[]): [number | null, number] =>
  a.length ? [Math.round((a.reduce((s, x) => s + x, 0) / a.length) * 100) / 100, a.length] : [null, 0];

