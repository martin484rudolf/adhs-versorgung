import { useEffect, useRef, useState } from "react";
import {
  ATEMMUSTER,
  PHASENTEXT,
  atemStand,
  kennzahlen,
  zykluslaenge,
  type AtemMuster,
  type HrvSession,
} from "@versorgung/kern";
import { append, heute, jetztHHMM } from "../lib/store";
import { sammleMit, useGurt } from "../lib/gurtstand";
import { Btn, Card, Chip, H2, Muted, Pill } from "../ui";

/**
 * Atemübung mit Live-Puls.
 *
 * Der Nutzen steht nicht am Ende als Zahl, sondern läuft währenddessen: Man atmet im
 * vorgegebenen Takt und sieht, wie der Puls mitschwingt – beim Einatmen hoch, beim
 * Ausatmen runter. Deshalb liegen Atemkreis und Pulskurve untereinander auf einem Bildschirm.
 */
export default function Atmen() {
  const { verbindung, live, kurve } = useGurt();
  const [muster, setMuster] = useState<AtemMuster>(ATEMMUSTER[0]);
  const [laeuft, setLaeuft] = useState(false);
  const [sekunden, setSekunden] = useState(0);
  const [fertig, setFertig] = useState("");

  const rrRef = useRef<number[]>([]);
  const startRef = useRef(0);

  // Der Takt läuft über die Uhrzeit, nicht über gezählte Ticks – sonst verschiebt sich
  // die Atemführung mit jeder verzögerten Bildwiederholung.
  useEffect(() => {
    if (!laeuft) return;
    startRef.current = Date.now();
    const abmelden = sammleMit((rr) => {
      rrRef.current = [...rrRef.current, ...rr];
    });
    const t = setInterval(() => setSekunden((Date.now() - startRef.current) / 1000), 100);
    return () => {
      abmelden();
      clearInterval(t);
    };
  }, [laeuft]);

  const stand = atemStand(muster, sekunden);

  const starten = () => {
    rrRef.current = [];
    setSekunden(0);
    setFertig("");
    setLaeuft(true);
  };

  const beenden = () => {
    setLaeuft(false);
    const kk = kennzahlen(rrRef.current);
    if (kk.rmssd !== null && rrRef.current.length > 10) {
      const zuege = Math.floor(sekunden / zykluslaenge(muster));
      const s: HrvSession = {
        schema_version: 1,
        datum: heute(),
        uhrzeit: jetztHHMM(),
        typ: "hrv-session",
        quelle: verbindung?.name ?? "unbekannt",
        dauer_s: kk.dauer_s,
        rr: rrRef.current,
        bedingung: "atemuebung",
        notiz: `${muster.label}, ${zuege} Atemzüge`,
      };
      append("hrv", s);
      setFertig(`Gespeichert: ${kk.dauer_s} s, RMSSD ${kk.rmssd} ms.`);
    } else {
      setFertig("Zu kurz zum Speichern.");
    }
  };

  return (
    <div>
      <Card className="mt-3">
        <div className="flex flex-wrap gap-2">
          {ATEMMUSTER.map((m) => (
            <Chip key={m.key} on={muster.key === m.key} onClick={() => !laeuft && setMuster(m)}>
              {m.label}
            </Chip>
          ))}
        </div>
        {muster.hinweis && <Muted>{muster.hinweis}</Muted>}

        {/* Der Kreis atmet vor: groß beim Einatmen, klein beim Ausatmen. */}
        <div className="flex h-60 items-center justify-center">
          <div
            className="flex h-48 w-48 items-center justify-center rounded-full bg-sky-600/20 ring-2 ring-sky-400/70 transition-transform duration-100 ease-linear motion-reduce:transition-none"
            style={{ transform: `scale(${laeuft ? 0.45 + stand.fuellung * 0.55 : 0.6})` }}
          >
            <div className="text-center">
              <div className="text-xl font-semibold text-sky-100">{laeuft ? PHASENTEXT[stand.phase] : "bereit"}</div>
              {laeuft && <div className="mt-1 text-4xl font-semibold text-white">{stand.restSekunden}</div>}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {live && <Pill kind="n">{live.hf} Schläge/min</Pill>}
          {laeuft && <Pill kind="n">{stand.zug}. Atemzug</Pill>}
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {!laeuft ? (
            <Btn onClick={starten} disabled={!verbindung}>
              Übung starten
            </Btn>
          ) : (
            <Btn onClick={beenden}>Beenden</Btn>
          )}
        </div>
        {!verbindung && <Muted>Die Übung geht auch ohne Gurt – aber erst mit ihm sieht man, was sie bewirkt.</Muted>}
        {fertig && <p className="mt-3 text-center text-sm text-emerald-300">{fertig}</p>}
      </Card>

      {kurve.length > 3 && (
        <>
          <H2>Puls, Schlag für Schlag</H2>
          <Card>
            <Pulskurve werte={kurve} />
            <Muted>
              Je deutlicher die Welle, desto stärker folgt der Puls dem Atem. Das ist der Punkt der Übung – nicht ein
              möglichst hoher Wert am Ende.
            </Muted>
          </Card>
        </>
      )}
    </div>
  );
}

/** Schlichte Linie über die letzten Schläge, auf die eigene Spanne skaliert. */
function Pulskurve({ werte }: { werte: number[] }) {
  const breite = 300;
  const hoehe = 90;
  const min = Math.min(...werte);
  const max = Math.max(...werte);
  const spanne = Math.max(max - min, 4); // bei sehr flachem Puls nicht ins Rauschen zoomen
  const punkte = werte
    .map((w, i) => {
      const x = (i / Math.max(werte.length - 1, 1)) * breite;
      const y = hoehe - ((w - min) / spanne) * (hoehe - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${breite} ${hoehe}`} className="h-24 w-full" role="img" aria-label="Pulsverlauf der letzten Schläge">
        <polyline points={punkte} fill="none" stroke="currentColor" strokeWidth="2" className="text-sky-400" />
      </svg>
      <div className="flex justify-between text-xs text-slate-500">
        <span>{min} min</span>
        <span>{werte.length} Schläge</span>
        <span>{max} max</span>
      </div>
    </div>
  );
}
