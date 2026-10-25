import { useState } from "react";
import { append, heute, jetztHHMM, useDB } from "../lib/speicher";
import { BAUSTEINE, fmt, mahlzeitFeedback, tagesbild, wochenbild } from "../lib/logik";
import type { Baustein, Mahlzeit } from "../lib/typen";
import { Btn, Card, Chip, H2, Label, Muted, Pill, useInputCls } from "@versorgung/kern";

/**
 * Eine Mahlzeit eintragen. Keine Gramm, keine Kalorien, kein Foto –
 * antippen, was dabei war, fertig. Wer mehr Aufwand verlangt, bekommt keine Einträge.
 */
export function MahlzeitForm({ onFertig }: { onFertig?: (r: string) => void }) {
  const inputCls = useInputCls();
  const [uhrzeit, setUhrzeit] = useState(jetztHHMM());
  const [gewaehlt, setGewaehlt] = useState<Baustein[]>([]);
  const [notiz, setNotiz] = useState("");

  const um = (b: Baustein) => setGewaehlt((g) => (g.includes(b) ? g.filter((x) => x !== b) : [...g, b]));

  const speichern = () => {
    const m: Mahlzeit = {
      schema_version: 1,
      datum: heute(),
      uhrzeit,
      bausteine: gewaehlt,
      ...(notiz.trim() ? { notiz: notiz.trim() } : {}),
    };
    append("mahlzeiten", m);
    onFertig?.(mahlzeitFeedback(m));
    setGewaehlt([]);
    setNotiz("");
    setUhrzeit(jetztHHMM());
  };

  return (
    <div>
      <Label>Wann?</Label>
      <input type="time" value={uhrzeit} onChange={(e) => setUhrzeit(e.target.value)} className={inputCls} />
      <Label>Was war dabei?</Label>
      <div className="mt-2 flex flex-wrap gap-2">
        {BAUSTEINE.map((b) => (
          <Chip key={b.key} on={gewaehlt.includes(b.key)} onClick={() => um(b.key)}>
            {b.label}
          </Chip>
        ))}
      </div>
      <Label>Notiz (freiwillig)</Label>
      <input value={notiz} onChange={(e) => setNotiz(e.target.value)} className={inputCls} placeholder="z. B. bei Anna gegessen" />
      <div className="mt-4">
        <Btn onClick={speichern} disabled={gewaehlt.length === 0}>
          Mahlzeit eintragen
        </Btn>
      </div>
    </div>
  );
}

export default function Essen() {
  const db = useDB();
  const [rueckmeldung, setRueckmeldung] = useState("");
  const heuteStr = heute();
  const heutige = db.mahlzeiten.filter((m) => m.datum === heuteStr);
  const t = tagesbild(heutige);
  const w = wochenbild(db.mahlzeiten, heuteStr);

  return (
    <div>
      <H2>Was gab es?</H2>
      <Card>
        <MahlzeitForm onFertig={setRueckmeldung} />
        {rueckmeldung && <p className="mt-4 text-lg text-emerald-300">{rueckmeldung}</p>}
      </Card>

      <H2>Heute</H2>
      <Card>
        {t.mahlzeiten === 0 ? (
          <Muted>Heute noch nichts eingetragen.</Muted>
        ) : (
          <>
            {/* Zählen, nicht benoten: grün, wenn es rund ist, sonst neutral. Kein Rot. */}
            <div className="flex flex-wrap gap-2">
              <Pill kind={t.eiweissMahlzeiten >= 3 ? "gut" : "n"}>Eiweiß {t.eiweissMahlzeiten}×</Pill>
              <Pill kind={t.gemueseObst >= 2 ? "gut" : "n"}>Gemüse/Obst {t.gemueseObst}×</Pill>
              <Pill kind={t.trinkenMahlzeiten >= 3 ? "gut" : "n"}>Getrunken {t.trinkenMahlzeiten}×</Pill>
            </div>
            {t.maxLuecke > 6 && (
              <p className="mt-3 text-lg text-amber-300">
                Zwischen zwei Mahlzeiten lagen {Math.round(t.maxLuecke)} Stunden. Eine Kleinigkeit zwischendurch hält die Kraft.
              </p>
            )}
            <ul className="mt-3">
              {[...heutige]
                .sort((a, b) => a.uhrzeit.localeCompare(b.uhrzeit))
                .map((m, i) => (
                  <li key={i} className="text-lg text-slate-300">
                    {m.uhrzeit} · {m.bausteine.map((b) => BAUSTEINE.find((d) => d.key === b)?.label ?? b).join(", ")}
                  </li>
                ))}
            </ul>
          </>
        )}
      </Card>

      <H2>Diese Woche</H2>
      <Card>
        <Muted>
          {fmt(w.von)} bis {fmt(w.bis)}
        </Muted>
        <ul className="mt-2">
          {w.tage.map((tag) => (
            <li key={tag.datum} className="flex items-center justify-between border-b border-slate-800 py-2 text-lg">
              <span className="text-slate-300">{fmt(tag.datum).slice(0, 5)}</span>
              <span className="text-slate-400">
                {tag.mahlzeiten === 0 ? "–" : `${tag.mahlzeiten} Mahlzeiten · ${tag.eiweissMahlzeiten}× Eiweiß`}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
