import { useState } from "react";
import { append, heute, useDB } from "../lib/store";
import { STOFFE, einnahmenLaufend, fmt, phasenplan, versuchAuswertung, versucheStand, addTage, stoff as findStoff } from "../lib/logik";
import type { Einnahme, Versuch } from "../lib/types";
import { Btn, Card, H2, Label, Muted, Pill, inputCls } from "../ui";

export default function Einnahmen({ vorwahl }: { vorwahl?: string }) {
  const db = useDB();
  const tag = heute();
  const laufend = einnahmenLaufend(db.einnahmen);
  const stand = versucheStand(db.versuche, tag);
  const [e, setE] = useState<Partial<Einnahme>>({ stoff: vorwahl ?? "", quelle: "kauf", zeitpunkt: "abends" });
  const [v, setV] = useState<{ typ: "wechsel" | "vorher_nachher"; variable: string; frage: string; mess: string; phasen: number; anzahl: number; dauer: number; beginn: string }>({
    typ: "wechsel", variable: vorwahl ?? "", frage: "", mess: "krampf", phasen: 14, anzahl: 4, dauer: 90, beginn: addTage(tag, 1),
  });
  const set = (k: keyof Einnahme, val: string) => setE((s) => ({ ...s, [k]: val }));

  const starten = () => {
    if (!e.stoff) return;
    append("einnahmen", { schema_version: 1, datum: tag, stoff: e.stoff, beginn: tag, ende: null, form: e.form || null, dosis: e.dosis || null, zeitpunkt: e.zeitpunkt || null, quelle: (e.quelle as Einnahme["quelle"]) || "kauf" });
    setE({ stoff: "", quelle: "kauf", zeitpunkt: "abends" });
  };
  const beenden = (r: Einnahme) => append("einnahmen", { ...r, ende: tag, datum: tag });
  const versuchAnlegen = () => {
    if (!v.variable) return;
    const id = `V${String(db.versuche.length + 1).padStart(3, "0")}`;
    const base: Versuch = { schema_version: 1, datum: tag, id, typ: v.typ, variable: v.variable, frage: v.frage || null, messgroessen: v.mess.split(",").map((s) => s.trim()).filter(Boolean), stoergroessen: ["schlaf_h", "medikation", "ereignisse"], beginn: v.beginn, ende: v.beginn, status: "geplant", evidenzstufe: "Fallbeobachtung (unverblindet)", bewertung_erst_nach_abschluss: true };
    if (v.typ === "wechsel") { base.phasen = phasenplan(v.beginn, v.phasen, v.anzahl); base.ende = base.phasen[base.phasen.length - 1].bis; }
    else { base.labor_vorher = null; base.labor_nachher_ab = addTage(v.beginn, v.dauer); base.ende = base.labor_nachher_ab; }
    append("versuche", base);
  };
  const stoffeWahl = STOFFE.filter((s) => s.ebene === "supplement" || s.ebene === "kueche" || s.ebene === "lebensfuehrung");

  return (
    <div>
      <H2>Laufende Einnahmen</H2>
      {laufend.length ? laufend.map((r) => (
        <Card key={r.stoff} className="mb-2 flex items-center justify-between gap-3">
          <div>
            <div className="font-semibold">{findStoff(r.stoff)?.name ?? r.stoff}</div>
            <Muted>seit {fmt(r.beginn)} · {[r.form, r.dosis, r.zeitpunkt, r.quelle].filter(Boolean).join(" · ")}</Muted>
          </div>
          <Btn kind="s" onClick={() => beenden(r)}>heute beenden</Btn>
        </Card>
      )) : <Muted>Keine.</Muted>}

      <H2>Einnahme beginnen</H2>
      <Card>
        <Label>Stoff</Label>
        <select className={inputCls} value={e.stoff ?? ""} onChange={(ev) => set("stoff", ev.target.value)}>
          <option value="">– wählen –</option>
          {stoffeWahl.map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Form</Label><input className={inputCls} value={e.form ?? ""} onChange={(ev) => set("form", ev.target.value)} placeholder="Bisglycinat, Saft, frisch" /></div>
          <div><Label>Dosis</Label><input className={inputCls} value={e.dosis ?? ""} onChange={(ev) => set("dosis", ev.target.value)} placeholder="250 mg elementar" /></div>
          <div><Label>Zeitpunkt</Label><select className={inputCls} value={e.zeitpunkt ?? ""} onChange={(ev) => set("zeitpunkt", ev.target.value)}>{["abends", "morgens", "mittags", "vor_training"].map((z) => <option key={z}>{z}</option>)}</select></div>
          <div><Label>Quelle</Label><select className={inputCls} value={e.quelle ?? "kauf"} onChange={(ev) => set("quelle", ev.target.value)}>{["kauf", "eigenzucht", "apotheke", "rezept"].map((z) => <option key={z}>{z}</option>)}</select></div>
        </div>
        {e.stoff && findStoff(e.stoff)?.obergrenze && <p className="mt-2 text-sm text-amber-300">Obergrenze: {findStoff(e.stoff)!.obergrenze}</p>}
        <div className="mt-3"><Btn onClick={starten} disabled={!e.stoff}>Beginnen</Btn></div>
      </Card>

      <H2>Versuche</H2>
      {stand.map(({ v: vv, status, text }) => {
        const aw = versuchAuswertung(vv, db.eintraege, tag);
        return (
          <Card key={vv.id} className="mb-2">
            <div className="flex items-center justify-between"><div className="font-semibold">{vv.id} · {vv.typ} · {vv.variable}</div><Pill kind={status === "laeuft" ? "gut" : status === "fertig" ? "warn" : "n"}>{status}</Pill></div>
            {vv.frage && <Muted>{vv.frage}</Muted>}
            <p className="mt-1 text-sm">{text}</p>
            {vv.phasen && <p className="text-xs text-slate-400">{vv.phasen.map((p) => `${p.phase} ${fmt(p.von)}–${fmt(p.bis)}`).join(" · ")}</p>}
            {vv.typ === "wechsel" && (
              <ul className="mt-2 text-sm">
                {Object.entries(aw.mess).map(([m, x]) => (
                  <li key={m}>{m}: {aw.fertig ? `mit ${x.mit[0] ?? "–"} (n=${x.mit[1]}) · ohne ${x.ohne[0] ?? "–"} (n=${x.ohne[1]})` : `Tage erfasst: mit ${x.mit[1]}, ohne ${x.ohne[1]} – Bewertung erst nach Abschluss`}</li>
                ))}
              </ul>
            )}
            {aw.fertig && <Muted>Unverblindet, kein Placebo → Fallbeobachtung. Störgrößen prüfen: {vv.stoergroessen.join(", ")}.</Muted>}
          </Card>
        );
      })}

      <Card className="mt-2">
        <div className="font-semibold">Neuen Versuch anlegen</div>
        <Muted>Wechsel = schnell wirkend, umkehrbar (Magnesium, L-Theanin, Melatonin, Rote Bete). Vorher/nachher = langsam mit Labor (Eisen, Omega-3, Vitamin D, B12). Eine Variable zur Zeit.</Muted>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Typ</Label><select className={inputCls} value={v.typ} onChange={(ev) => setV({ ...v, typ: ev.target.value as "wechsel" | "vorher_nachher" })}><option value="wechsel">wechsel</option><option value="vorher_nachher">vorher_nachher</option></select></div>
          <div><Label>Variable</Label><select className={inputCls} value={v.variable} onChange={(ev) => setV({ ...v, variable: ev.target.value })}><option value="">– Stoff –</option>{stoffeWahl.map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}</select></div>
          <div><Label>Beginn</Label><input type="date" className={inputCls} value={v.beginn} onChange={(ev) => setV({ ...v, beginn: ev.target.value })} /></div>
          <div><Label>Messgrößen (Check-in-Felder)</Label><input className={inputCls} value={v.mess} onChange={(ev) => setV({ ...v, mess: ev.target.value })} placeholder="krampf, darm, einschlaf_min" /></div>
          {v.typ === "wechsel" ? (<>
            <div><Label>Tage je Phase</Label><input className={inputCls} inputMode="numeric" value={v.phasen} onChange={(ev) => setV({ ...v, phasen: Number(ev.target.value) || 14 })} /></div>
            <div><Label>Anzahl Phasen</Label><input className={inputCls} inputMode="numeric" value={v.anzahl} onChange={(ev) => setV({ ...v, anzahl: Number(ev.target.value) || 4 })} /></div>
          </>) : (
            <div><Label>Gabe-Dauer (Tage)</Label><input className={inputCls} inputMode="numeric" value={v.dauer} onChange={(ev) => setV({ ...v, dauer: Number(ev.target.value) || 90 })} /></div>
          )}
        </div>
        <Label>Frage</Label><input className={inputCls} value={v.frage} onChange={(ev) => setV({ ...v, frage: ev.target.value })} placeholder="Weniger Krämpfe unter Magnesium?" />
        <div className="mt-3"><Btn onClick={versuchAnlegen} disabled={!v.variable}>Versuch anlegen</Btn></div>
      </Card>
    </div>
  );
}
