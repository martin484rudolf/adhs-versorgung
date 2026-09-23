import { useEffect, useRef, useState } from "react";
import { kennzahlen, vergleicheMitVorgeschichte, MINDESTDAUER_S, type HrvSession } from "@versorgung/kern";
import { append, heute, jetztHHMM, useDB } from "../lib/store";
import { sammleMit, useGurt } from "../lib/gurtstand";
import { fmt } from "../lib/logik";
import { Btn, Card, Chip, H2, Label, Muted, Pill, inputCls } from "../ui";

/**
 * Eine Ruhemessung für später.
 *
 * Wichtig für die Auswertung: Eine HRV-Zahl ohne Bedingung ist wertlos. Im Sitzen
 * nach dem Kaffee misst man etwas anderes als morgens im Bett. Deshalb wird danach
 * gefragt, bevor gespeichert wird – und verglichen wird nur innerhalb derselben Bedingung.
 */

const BEDINGUNGEN: { key: NonNullable<HrvSession["bedingung"]>; label: string }[] = [
  { key: "morgens", label: "morgens, noch im Bett" },
  { key: "ruhe", label: "im Sitzen, in Ruhe" },
  { key: "vor_schlaf", label: "vor dem Schlafen" },
  { key: "sonstiges", label: "sonstiges" },
];

export default function Messen() {
  const db = useDB();
  const { verbindung } = useGurt();
  const [laeuft, setLaeuft] = useState(false);
  const [sekunden, setSekunden] = useState(0);
  const [bedingung, setBedingung] = useState<NonNullable<HrvSession["bedingung"]>>("ruhe");
  const [notiz, setNotiz] = useState("");
  const [gespeichert, setGespeichert] = useState("");

  // Rohwerte laufen ins Ref, nicht in den State: sonst baut die Anzeige bei jedem
  // Herzschlag neu auf, nur um eine Zahl anzuhängen.
  const rrRef = useRef<number[]>([]);
  const [rrStand, setRrStand] = useState<number[]>([]);

  useEffect(() => {
    if (!laeuft) return;
    const abmelden = sammleMit((rr) => {
      rrRef.current = [...rrRef.current, ...rr];
      setRrStand(rrRef.current);
    });
    const t = setInterval(() => setSekunden((s) => s + 1), 1000);
    return () => {
      abmelden();
      clearInterval(t);
    };
  }, [laeuft]);

  const k = kennzahlen(rrStand);

  const starten = () => {
    rrRef.current = [];
    setRrStand([]);
    setSekunden(0);
    setGespeichert("");
    setLaeuft(true);
  };

  const speichern = () => {
    const s: HrvSession = {
      schema_version: 1,
      datum: heute(),
      uhrzeit: jetztHHMM(),
      typ: "hrv-session",
      quelle: verbindung?.name ?? "unbekannt",
      dauer_s: k.dauer_s,
      rr: rrRef.current,
      bedingung,
      ...(notiz.trim() ? { notiz: notiz.trim() } : {}),
    };
    append("hrv", s);
    setGespeichert(`Gespeichert: RMSSD ${k.rmssd} ms über ${k.dauer_s} s.`);
    rrRef.current = [];
    setRrStand([]);
    setNotiz("");
  };

  // Nur Messungen unter derselben Bedingung taugen zum Vergleich.
  const frueher = db.hrv
    .filter((s) => s.bedingung === bedingung)
    .map((s) => kennzahlen(s.rr).rmssd)
    .filter((x): x is number => x !== null);
  const vergleich = k.rmssd !== null ? vergleicheMitVorgeschichte(k.rmssd, frueher) : null;

  return (
    <div>
      <Card className="mt-3">
        {!laeuft ? (
          <Btn onClick={starten} disabled={!verbindung}>
            Messung starten
          </Btn>
        ) : (
          <Btn onClick={() => setLaeuft(false)}>Messung beenden</Btn>
        )}
        {!verbindung && <Muted>Erst den Gurt verbinden – oder oben „ohne Gurt" zum Ausprobieren.</Muted>}

        {(laeuft || rrStand.length > 0) && (
          <>
            <div className="mt-4 flex flex-wrap items-baseline gap-4">
              <span className="text-4xl font-semibold text-white">{mmss(laeuft ? sekunden : k.dauer_s)}</span>
              <span className="text-sm text-slate-400">{k.schlaege} Schläge</span>
              {k.verworfen > 0 && <Pill kind="warn">{k.verworfen} verworfen</Pill>}
            </div>

            {laeuft && !k.belastbar && (
              <Muted>
                Für eine belastbare HRV sollte die Messung mindestens {MINDESTDAUER_S} Sekunden laufen – besser zwei bis
                fünf Minuten. Ruhig sitzen, normal atmen.
              </Muted>
            )}

            {k.rmssd !== null && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                <Wert label="RMSSD" wert={`${k.rmssd} ms`} />
                <Wert label="SDNN" wert={`${k.sdnn} ms`} />
                <Wert label="Puls" wert={`${k.hf}/min`} />
              </div>
            )}
          </>
        )}

        {!laeuft && k.rmssd !== null && (
          <>
            {!k.belastbar && (
              <p className="mt-3 text-sm text-amber-300">Kurze Messung – die Zahl ist ein Anhaltspunkt, kein Messwert.</p>
            )}
            {vergleich && (
              <p className="mt-3 text-sm text-slate-300">
                Deine bisherigen Messungen unter „{BEDINGUNGEN.find((b) => b.key === bedingung)?.label}" liegen im Mittel
                bei {vergleich.mittel} ms – heute {vergleich.abweichung > 0 ? "+" : ""}
                {vergleich.abweichung} ms
                {vergleich.richtung === "wie sonst" ? ", also im gewohnten Bereich." : "."}
              </p>
            )}

            <Label>Wobei gemessen?</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {BEDINGUNGEN.map((b) => (
                <Chip key={b.key} on={bedingung === b.key} onClick={() => setBedingung(b.key)}>
                  {b.label}
                </Chip>
              ))}
            </div>

            <Label>Notiz</Label>
            <input value={notiz} onChange={(e) => setNotiz(e.target.value)} className={inputCls} />

            <div className="mt-4">
              <Btn onClick={speichern}>Messung speichern</Btn>
            </div>
          </>
        )}

        {gespeichert && <p className="mt-3 text-sm text-emerald-300">{gespeichert}</p>}
      </Card>

      <H2>Bisher gemessen</H2>
      <Card>
        {db.hrv.length === 0 ? (
          <Muted>
            Noch keine Messung. Sinnvoll ist ein fester Zeitpunkt – morgens direkt nach dem Aufwachen ist am besten
            vergleichbar, weil dann am wenigsten dazwischenkommt.
          </Muted>
        ) : (
          <ul className="text-sm">
            {[...db.hrv]
              .sort((a, b) => (b.datum + b.uhrzeit).localeCompare(a.datum + a.uhrzeit))
              .slice(0, 12)
              .map((s, i) => {
                const kk = kennzahlen(s.rr);
                return (
                  <li key={i} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 py-2">
                    <span className="text-slate-300">
                      {fmt(s.datum)} {s.uhrzeit}
                    </span>
                    <span className="text-slate-400">
                      {s.bedingung === "atemuebung" ? "Atemübung" : BEDINGUNGEN.find((b) => b.key === s.bedingung)?.label ?? "—"} ·
                      RMSSD {kk.rmssd ?? "—"} ms · {kk.dauer_s} s
                    </span>
                  </li>
                );
              })}
          </ul>
        )}
      </Card>
    </div>
  );
}

const Wert = ({ label, wert }: { label: string; wert: string }) => (
  <div className="rounded-xl bg-slate-800/60 p-3">
    <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
    <div className="mt-1 text-xl font-semibold text-slate-100">{wert}</div>
  </div>
);

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
