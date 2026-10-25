// Ernährung ohne Kalorienzählen: eine Mahlzeit ist eine Handvoll Bausteine.
// Welche Bausteine eine App kennt und was sie als "füttert das Mikrobiom" wertet,
// steht im Profil der App – gezählt und gruppiert wird hier.
import type { MahlzeitBasis } from "./typen";
import { addTage, stundenZwischen } from "./datum";

export type Art = "plus" | "bremse" | "eigen";

export interface Bausteindef<B extends string = string> {
  key: B;
  label: string;
  art: Art;
  /** Zählt für die Mikrobiom-/Ballaststoff-Rechnung. */
  ballast?: boolean;
}

export interface Tagesbild<B extends string = string> {
  mahlzeiten: number;
  /** Wie viele Mahlzeiten diesen Baustein enthielten. */
  proBaustein: Record<B, number>;
  /** Mahlzeiten mit mindestens einem Ballast-Baustein. */
  ballast: number;
  /** Summe der Bremsen (Fertig, Süß, Alkohol …) über den Tag. */
  bremsen: number;
  pflanzen: string[];
  /** Größte Lücke zwischen zwei Mahlzeiten in Stunden. */
  maxLuecke: number;
}

export function tagesbild<B extends string>(mz: MahlzeitBasis<B>[], defs: Bausteindef<B>[]): Tagesbild<B> {
  const sorted = [...mz].sort((a, b) => a.uhrzeit.localeCompare(b.uhrzeit));
  const proBaustein = Object.fromEntries(defs.map((d) => [d.key, 0])) as Record<B, number>;
  for (const m of sorted) for (const b of new Set(m.bausteine)) if (b in proBaustein) proBaustein[b] += 1;

  const ballastKeys = defs.filter((d) => d.ballast).map((d) => d.key);
  const bremsenKeys = defs.filter((d) => d.art === "bremse").map((d) => d.key);

  const pflanzen = new Set<string>();
  sorted.forEach((m) => (m.pflanzen ?? []).forEach((p) => pflanzen.add(p.trim().toLowerCase())));

  let maxLuecke = 0;
  for (let i = 1; i < sorted.length; i++) {
    maxLuecke = Math.max(maxLuecke, stundenZwischen(sorted[i - 1].uhrzeit, sorted[i].uhrzeit));
  }

  return {
    mahlzeiten: sorted.length,
    proBaustein,
    ballast: sorted.filter((m) => m.bausteine.some((b) => ballastKeys.includes(b))).length,
    bremsen: bremsenKeys.reduce((s, k) => s + proBaustein[k], 0),
    pflanzen: [...pflanzen],
    maxLuecke,
  };
}

/** Sieben Tage bis einschließlich bisDatum, je Tag das Bild der App, plus Pflanzenvielfalt. */
export function wochenbild<B extends string, T extends { pflanzen: string[] }>(
  mahlzeiten: MahlzeitBasis<B>[],
  bisDatum: string,
  bildFuerTag: (mz: MahlzeitBasis<B>[]) => T,
) {
  const von = addTage(bisDatum, -6);
  const tage: Record<string, MahlzeitBasis<B>[]> = {};
  for (let i = 0; i < 7; i++) tage[addTage(von, i)] = [];
  mahlzeiten.filter((m) => m.datum >= von && m.datum <= bisDatum).forEach((m) => tage[m.datum]?.push(m));

  const pflanzen = new Set<string>();
  const tb = Object.entries(tage).map(([datum, mz]) => {
    const t = bildFuerTag(mz);
    t.pflanzen.forEach((p) => pflanzen.add(p));
    return { datum, ...t };
  });
  return { von, bis: bisDatum, tage: tb, pflanzenVielfalt: pflanzen.size };
}

/** Eine Rückmeldung, die man berücksichtigen kann – kein Urteil, keine Punkte. */
export interface FeedbackRegel<B extends string = string> {
  wenn: (m: MahlzeitBasis<B>) => boolean;
  text: string;
}

/**
 * Ein zusammenfassender Satz vorweg ("Gute Mahlzeit.") ist eine Note – und ob eine App
 * Noten vergeben darf, entscheidet die App, nicht der Kern. Ohne `kopf` gibt es nur
 * die Vorschläge.
 */
export type Kopfzeile = (plus: number, bremse: number) => string | undefined;

export function mahlzeitFeedback<B extends string>(
  m: MahlzeitBasis<B>,
  defs: Bausteindef<B>[],
  regeln: FeedbackRegel<B>[],
  kopf?: Kopfzeile,
): string {
  const art = (b: B) => defs.find((d) => d.key === b)?.art;
  const plus = m.bausteine.filter((b) => art(b) !== "bremse").length;
  const bremse = m.bausteine.filter((b) => art(b) === "bremse").length;
  const teile = [kopf?.(plus, bremse), ...regeln.filter((r) => r.wenn(m)).map((r) => r.text)];
  return teile.filter(Boolean).join(" ");
}
