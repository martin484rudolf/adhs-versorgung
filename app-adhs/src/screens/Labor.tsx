import { useState } from "react";
import { append, heute, useDB } from "../lib/store";
import { LABOR } from "../data/labor";
import { fmt, laborStand } from "../lib/logik";
import type { LaborResult } from "../lib/types";
import { Btn, Card, H2, Label, Muted, Pill, inputCls } from "../ui";

export default function Labor() {
  const db = useDB();
  const st = laborStand(db.tests, db.eintraege);
  const [datum, setDatum] = useState(heute());
  const [quelle, setQuelle] = useState("labor:");
  const [w, setW] = useState<Record<string, string>>({});
  const [ref, setRef] = useState<Record<string, string>>({});
  const [ok, setOk] = useState("");

  const save = () => {
    const werte: Record<string, number> = {};
    for (const [k, v] of Object.entries(w)) { const n = Number(String(v).replace(",", ".")); if (v !== "" && !Number.isNaN(n)) werte[k] = n; }
    if (!Object.keys(werte).length) return;
    const rec: LaborResult = { schema_version: 1, datum, typ: "labor", quelle: quelle || "labor", werte };
    const r = Object.fromEntries(Object.entries(ref).filter(([k, v]) => v && werte[k] !== undefined));
    if (Object.keys(r).length) rec.meta = { ref: r };
    append("tests", rec);
    setW({}); setRef({}); setOk("Gespeichert.");
    setTimeout(() => setOk(""), 2000);
  };
  const kind = (s: string) => (s === "MANGEL" ? "rot" : s === "grau" ? "warn" : s === "normal" ? "gut" : "n");

  return (
    <div>
      <H2>Stand</H2>
      <Card>
        {st.vorbehalt && <p className="mb-2 text-sm text-amber-300">Vorbehalt: Darmbeschwerden im Check-in (Schnitt ≥ 5 über 14 Tage) – Aufnahme fraglich, Werte nur eingeschränkt bewertbar.</p>}
        {st.zeilen.length ? (
          <ul className="divide-y divide-slate-800 text-sm">
            {st.zeilen.map((z) => (
              <li key={z.key} className="flex items-center justify-between gap-2 py-2">
                <div><div>{z.label}</div><Muted>{fmt(z.datum)} · {z.quelle}{z.ref ? ` · Ref ${z.ref}` : ""}</Muted></div>
                <div className="text-right"><div className="font-semibold">{z.wert} <span className="text-xs text-slate-400">{z.einheit}</span></div><Pill kind={kind(z.stufe)}>{z.stufe}</Pill></div>
              </li>
            ))}
          </ul>
        ) : <Muted>Noch keine Laborwerte.</Muted>}
        {st.fehlt.length > 0 && <p className="mt-3 text-sm text-amber-300">Fehlt für eine Ergänzungsentscheidung: {st.fehlt.join(", ")}</p>}
        <Muted>Stufen sind Orientierung aus der Literatur, der Referenzbereich des Labors hat Vorrang. Ergänzt wird nur bei Mangel oder Grau und nur mit Evidenz.</Muted>
      </Card>

      <H2>Befund erfassen</H2>
      <Card>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Blutentnahme</Label><input type="date" className={inputCls} value={datum} onChange={(e) => setDatum(e.target.value)} /></div>
          <div><Label>Labor / Einsender</Label><input className={inputCls} value={quelle} onChange={(e) => setQuelle(e.target.value)} placeholder="labor:Name" /></div>
        </div>
        <Muted>Nur eintragen, was auf dem Befund steht. Referenz nur, wenn sie vom Labor angegeben ist.</Muted>
        {Object.entries(LABOR).map(([k, a]) => (
          <div key={k} className="mt-2 grid grid-cols-[1fr_7rem_7rem] items-end gap-2">
            <div className="text-sm text-slate-300">{a.label}<span className="ml-1 text-xs text-slate-500">{a.einheit}</span></div>
            <input className={`${inputCls} mt-0`} inputMode="decimal" placeholder="Wert" value={w[k] ?? ""} onChange={(e) => setW({ ...w, [k]: e.target.value })} />
            <input className={`${inputCls} mt-0`} placeholder="Ref" value={ref[k] ?? ""} onChange={(e) => setRef({ ...ref, [k]: e.target.value })} />
          </div>
        ))}
        <div className="mt-3 flex items-center gap-3"><Btn onClick={save}>Speichern</Btn><span className="text-sm text-emerald-300">{ok}</span></div>
      </Card>
    </div>
  );
}
