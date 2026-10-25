import { useState } from "react";
import { append, heute, useDB } from "../lib/speicher";
import { LABOR } from "../data/labor";
import { fmt, laborStand } from "../lib/logik";
import type { LaborResult } from "../lib/typen";
import { Btn, Card, H2, Label, Muted, Pill, useInputCls } from "@versorgung/kern";

export default function Werte() {
  const db = useDB();
  const inputCls = useInputCls();
  const stand = laborStand(db.tests, db.eintraege);
  const [offen, setOffen] = useState(false);
  const [datum, setDatum] = useState(heute());
  const [quelle, setQuelle] = useState("Hausarzt");
  const [werte, setWerte] = useState<Record<string, string>>({});

  const speichern = () => {
    const zahlen: Record<string, number> = {};
    for (const [k, v] of Object.entries(werte)) {
      const n = Number(String(v).replace(",", "."));
      if (v !== "" && !Number.isNaN(n)) zahlen[k] = n;
    }
    if (Object.keys(zahlen).length === 0) return;
    const r: LaborResult = { schema_version: 1, datum, typ: "labor", quelle, werte: zahlen };
    append("tests", r);
    setWerte({});
    setOffen(false);
  };

  return (
    <div>
      <H2>Ihre Werte</H2>
      <Card>
        {stand.zeilen.length === 0 ? (
          <Muted>Noch keine Werte eingetragen. Der nächste Blutbefund lässt sich hier abtippen.</Muted>
        ) : (
          <ul>
            {stand.zeilen.map((z) => (
              <li key={z.key} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 py-3">
                <span className="text-lg text-slate-200">{z.label}</span>
                <span className="flex items-center gap-3">
                  <span className="text-lg text-slate-300">
                    {z.wert} {z.einheit}
                  </span>
                  <Pill kind={z.stufe === "MANGEL" ? "rot" : z.stufe === "grau" ? "warn" : z.stufe === "normal" ? "gut" : "n"}>{z.stufe}</Pill>
                </span>
              </li>
            ))}
          </ul>
        )}
        {stand.fehlt.length > 0 && (
          <p className="mt-3 text-lg text-slate-400">Noch nicht bestimmt: {stand.fehlt.join(", ")}</p>
        )}
        <Muted>
          Die Einordnung ist Orientierung aus der Literatur, kein Befund. Was Ihre Werte bedeuten, sagt Ihnen Ihre Ärztin –
          der Referenzbereich des Labors hat immer Vorrang.
        </Muted>
      </Card>

      <H2>Befund eintragen</H2>
      <Card>
        {!offen ? (
          <Btn onClick={() => setOffen(true)}>Werte eintragen</Btn>
        ) : (
          <>
            <Label>Datum der Blutentnahme</Label>
            <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} className={inputCls} />
            <Label>Wo?</Label>
            <input value={quelle} onChange={(e) => setQuelle(e.target.value)} className={inputCls} />
            {Object.entries(LABOR).map(([key, achse]) => (
              <div key={key}>
                <Label>
                  {achse.label} {achse.einheit ? `(${achse.einheit})` : ""}
                </Label>
                <input
                  inputMode="decimal"
                  value={werte[key] ?? ""}
                  onChange={(e) => setWerte((w) => ({ ...w, [key]: e.target.value }))}
                  className={inputCls}
                  placeholder="leer lassen, wenn nicht bestimmt"
                />
                {achse.hinweis && <p className="mt-1 text-base text-slate-500">{achse.hinweis}</p>}
              </div>
            ))}
            <div className="mt-4 flex gap-2">
              <Btn onClick={speichern}>Speichern</Btn>
              <Btn kind="ghost" onClick={() => setOffen(false)}>
                Abbrechen
              </Btn>
            </div>
          </>
        )}
      </Card>

      {db.tests.length > 0 && (
        <>
          <H2>Frühere Befunde</H2>
          <Card>
            <ul>
              {[...db.tests]
                .sort((a, b) => b.datum.localeCompare(a.datum))
                .map((t, i) => (
                  <li key={i} className="border-b border-slate-800 py-2 text-lg text-slate-300">
                    {fmt(t.datum)} · {t.quelle} · {Object.keys(t.werte).length} Werte
                  </li>
                ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
