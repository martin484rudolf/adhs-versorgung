// Atemführung fürs Biofeedback.
//
// Der Gedanke: Beim Einatmen wird der Herzschlag schneller, beim Ausatmen langsamer.
// Diese Kopplung heißt respiratorische Sinusarrhythmie, und sie ist am stärksten, wenn
// man langsam und gleichmäßig atmet – bei den meisten Menschen um sechs Atemzüge pro
// Minute herum. Wer in diesem Takt atmet, sieht den eigenen Puls im Rhythmus mitschwingen.
// Genau dieses Sichtbarwerden ist das Training: nicht die Zahl am Ende, sondern die
// Rückmeldung im Moment.
//
// Die genaue Resonanzfrequenz ist individuell; die Vorgaben hier sind übliche
// Ausgangspunkte, keine Messwerte. Wer mag, verstellt sie, bis die Kurve am deutlichsten
// mitschwingt – das ist die eigene.

export interface AtemMuster {
  key: string;
  label: string;
  /** Sekunden einatmen. */
  ein: number;
  /** Sekunden halten nach dem Einatmen. */
  halten: number;
  /** Sekunden ausatmen. */
  aus: number;
  hinweis?: string;
}

export const ATEMMUSTER: AtemMuster[] = [
  {
    key: "5-5",
    label: "5 ein, 5 aus",
    ein: 5,
    halten: 0,
    aus: 5,
    hinweis: "Sechs Atemzüge pro Minute – der übliche Ausgangspunkt.",
  },
  {
    key: "4-6",
    label: "4 ein, 6 aus",
    ein: 4,
    halten: 0,
    aus: 6,
    hinweis: "Längeres Ausatmen beruhigt stärker. Gut zum Herunterkommen.",
  },
  {
    key: "4-7-8",
    label: "4 ein, 7 halten, 8 aus",
    ein: 4,
    halten: 7,
    aus: 8,
    hinweis: "Deutlich langsamer. Wenn es anstrengt, lieber eines der kürzeren nehmen.",
  },
  {
    key: "6-6",
    label: "6 ein, 6 aus",
    ein: 6,
    halten: 0,
    aus: 6,
    hinweis: "Fünf Atemzüge pro Minute – für die meisten schon recht langsam.",
  },
];

// "Phase" ist im Datenvertrag schon die Mit-/Ohne-Phase eines Versuchs.
export type AtemPhase = "ein" | "halten" | "aus";

export interface AtemStand {
  phase: AtemPhase;
  /** Wie weit die laufende Phase fortgeschritten ist, 0 bis 1. */
  anteil: number;
  /** Verbleibende Sekunden der laufenden Phase, aufgerundet. */
  restSekunden: number;
  /** Wie voll die Lunge gerade sein soll, 0 bis 1 – für die Anzeige. */
  fuellung: number;
  /** Wievielter Atemzug seit dem Start. */
  zug: number;
}

export const zykluslaenge = (m: AtemMuster) => m.ein + m.halten + m.aus;

/**
 * Wo im Atemzyklus man nach `sekunden` steht. Reine Rechnung ohne Timer,
 * damit sie testbar bleibt und die Anzeige selbst bestimmt, wie oft sie nachfragt.
 */
export function atemStand(m: AtemMuster, sekunden: number): AtemStand {
  const zyklus = zykluslaenge(m);
  const zug = Math.floor(sekunden / zyklus) + 1;
  const t = sekunden % zyklus;

  if (t < m.ein) {
    const anteil = m.ein > 0 ? t / m.ein : 1;
    return { phase: "ein", anteil, restSekunden: Math.ceil(m.ein - t), fuellung: anteil, zug };
  }
  if (t < m.ein + m.halten) {
    const imHalten = t - m.ein;
    const anteil = m.halten > 0 ? imHalten / m.halten : 1;
    return { phase: "halten", anteil, restSekunden: Math.ceil(m.ein + m.halten - t), fuellung: 1, zug };
  }
  const imAus = t - m.ein - m.halten;
  const anteil = m.aus > 0 ? imAus / m.aus : 1;
  return { phase: "aus", anteil, restSekunden: Math.ceil(zyklus - t), fuellung: 1 - anteil, zug };
}

export const PHASENTEXT: Record<AtemPhase, string> = {
  ein: "Einatmen",
  halten: "Halten",
  aus: "Ausatmen",
};
