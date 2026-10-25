// Laborwerte in Stufen: MANGEL / grau / normal. Welche Marker es gibt und wo die
// Schwellen liegen, bringt jede App als eigene Registry mit – die Rechnung ist dieselbe.
import type { CheckInBasis, LaborAchse, LaborResult, Stoff } from "./typen";

export type Registry = Record<string, LaborAchse>;
export type Stufe = "MANGEL" | "grau" | "normal" | "ohne Stufenlogik";

export function stufe(wert: number, key: string, registry: Registry): Stufe {
  const st = registry[key]?.stufen;
  if (!st || typeof wert !== "number") return "ohne Stufenlogik";
  if (wert < st.mangel_unter) return "MANGEL";
  if (wert <= st.grau_bis) return "grau";
  return "normal";
}

export interface LaborZeile {
  key: string;
  label: string;
  wert: number;
  einheit: string;
  stufe: Stufe;
  datum: string;
  quelle: string;
  ref?: string;
}

export interface LaborStand {
  zeilen: LaborZeile[];
  fehlt: string[];
  vorbehalt: boolean;
}

/** Jüngster Wert je Marker, plus was von den wichtigen Markern noch fehlt. */
export function laborStand(
  tests: LaborResult[],
  eintraege: CheckInBasis[],
  registry: Registry,
  wichtig: string[],
): LaborStand {
  const letzte = new Map<string, LaborZeile>();
  const sortiert = [...tests].filter((t) => t.typ === "labor").sort((a, b) => a.datum.localeCompare(b.datum));
  for (const r of sortiert) {
    for (const [k, v] of Object.entries(r.werte)) {
      letzte.set(k, {
        key: k,
        label: registry[k]?.label ?? k,
        wert: v,
        einheit: registry[k]?.einheit ?? "",
        stufe: stufe(v, k, registry),
        datum: r.datum,
        quelle: r.quelle,
        ref: r.meta?.ref?.[k],
      });
    }
  }
  return {
    zeilen: [...letzte.values()],
    fehlt: wichtig.filter((k) => !letzte.has(k)).map((k) => registry[k]?.label ?? k),
    vorbehalt: darmVorbehalt(eintraege),
  };
}

/** Beschwerdefreier Darm ist Voraussetzung dafür, dass Ergänzungen überhaupt ankommen. */
export function darmVorbehalt(eintraege: CheckInBasis[], tage = 14) {
  const ci = eintraege.filter((e) => typeof e.darm === "number").slice(-tage);
  return ci.length > 0 && ci.reduce((s, e) => s + (e.darm ?? 0), 0) / ci.length >= 5;
}

export interface LaborTor {
  ok: boolean;
  text: string;
}

/** Labor-Tor: ein Supplement wird erst empfohlen, wenn der Marker es hergibt. */
export function laborTor(s: Stoff, laborZeilen: LaborZeile[], vorbehalt: boolean, registry: Registry): LaborTor {
  if (s.ebene !== "supplement" || !s.voraussetzung_labor) return { ok: true, text: "" };
  const z = laborZeilen.find((l) => l.key === s.voraussetzung_labor!.marker);
  const label = registry[s.voraussetzung_labor.marker]?.label ?? s.voraussetzung_labor.marker;
  if (!z) return { ok: !!s.voraussetzung_labor.optional, text: `${label} noch nicht bestimmt` };
  const passt = s.voraussetzung_labor.stufe.map((x) => x.toLowerCase()).includes(z.stufe.toLowerCase());
  if (vorbehalt) return { ok: false, text: `${label}: ${z.stufe} – aber Darm-Vorbehalt (Aufnahme fraglich)` };
  return { ok: passt, text: `${label}: ${z.wert} ${z.einheit} → ${z.stufe}${passt ? "" : " – keine Grundlage"}` };
}
