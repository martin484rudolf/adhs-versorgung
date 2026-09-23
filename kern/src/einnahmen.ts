// Einnahmen: der jüngste Satz je Stoff gilt. Ohne Enddatum heißt "läuft noch".
import type { Einnahme } from "./typen";

export function einnahmenLaufend(einnahmen: Einnahme[]) {
  const last = new Map<string, Einnahme>();
  for (const r of einnahmen) last.set(r.stoff, r);
  return [...last.values()].filter((r) => !r.ende);
}
