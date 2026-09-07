import { useState } from "react";
import { append, heute, jetztHHMM, useDB } from "../lib/store";
import { versucheStand, einnahmenLaufend, fmt, STOFFE_META } from "../lib/logik";
import type { CheckIn } from "../lib/types";
import { Btn, Card, H2, Label, Muted, Pill, Skala, inputCls } from "../ui";
import { MahlzeitForm } from "./Ernaehrung";

export default function Heute() {
  const db = useDB();
  const tag = heute();
  const stand = versucheStand(db.versuche, tag);
  const laufend = einnahmenLaufend(db.einnahmen);
  const heutigeEintraege = db.eintraege.filter((e) => e.datum === tag);
  const mzHeute = db.mahlzeiten.filter((m) => m.datum === tag);

  return (
    <div>
      <p className="text-sm text-slate-400">{fmt(tag)} · beratend, nicht diagnostisch · alles bleibt auf diesem Gerät</p>

      {stand.length > 0 && (
        <>
          <H2>Versuch</H2>
          {stand.map(({ v, status, phase, text }) => (
            <Card key={v.id} className="mb-2">
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold">{v.id} · {v.variable}</div>
                <Pill kind={status === "laeuft" ? "gut" : status === "fertig" ? "warn" : "n"}>{status}</Pill>
              </div>
              {v.frage && <Muted>{v.frage}</Muted>}
              {status === "laeuft" && phase && (
                <div className={`mt-2 rounded-xl px-3 py-2 text-base font-semibold ${phase.phase === "mit" ? "bg-emerald-900/60 text-emerald-100" : "bg-slate-800 text-slate-200"}`}>
                  Heute: {phase.phase === "mit" ? "EINNEHMEN" : "PAUSE"}
                </div>
              )}
              <p className="mt-1 text-sm text-slate-300">{text}</p>
            </Card>
          ))}
        </>
      )}

      <H2>Check-in</H2>
      {heutigeEintraege.length > 0 && <Muted>{heutigeEintraege.length} Eintrag heute gespeichert – ein zweiter ergänzt, überschreibt nicht.</Muted>}
      <CheckInForm laufend={laufend.map((r) => r.stoff)} />

      <H2>Gegessen</H2>
      <Muted>{mzHeute.length ? `${mzHeute.length} Mahlzeit(en) heute.` : "Noch nichts eingetragen – drei Tipper reichen."}</Muted>
      <MahlzeitForm />

      <Card className="mt-6">
        <Muted>Rote Flaggen: {STOFFE_META.rote_flaggen.join(", ")} → Einnahme abbrechen, Arzt. {STOFFE_META.medizinischer_hinweis}</Muted>
      </Card>
    </div>
  );
}

function CheckInForm({ laufend }: { laufend: string[] }) {
  const [e, setE] = useState<Partial<CheckIn>>({ einnahmen: laufend });
  const [ok, setOk] = useState("");
  const set = (k: keyof CheckIn, v: unknown) => setE((s) => ({ ...s, [k]: v }));
  const toggle = (stoff: string) => set("einnahmen", (e.einnahmen ?? []).includes(stoff) ? (e.einnahmen ?? []).filter((x) => x !== stoff) : [...(e.einnahmen ?? []), stoff]);
  const save = () => {
    const rec: CheckIn = { schema_version: 1, datum: heute(), quelle: "self" };
    for (const [k, v] of Object.entries(e)) if (v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0)) (rec as unknown as Record<string, unknown>)[k] = v;
    append("eintraege", rec);
    setOk("Gespeichert.");
    setE({ einnahmen: laufend });
    setTimeout(() => setOk(""), 2000);
  };
  const num = (k: keyof CheckIn) => (v: number | undefined) => set(k, v);
  return (
    <Card>
      <Label>Stimmung</Label><Skala value={e.stimmung} onChange={num("stimmung")} />
      <Label>Reizlast</Label><Skala value={e.reizlast} onChange={num("reizlast")} />
      <Label>Hunger / unterzuckert</Label><Skala value={e.hunger} onChange={num("hunger")} />
      <Label>Darm (Durchfall, Krämpfe, Blähungen)</Label><Skala value={e.darm} onChange={num("darm")} />
      <Label>Muskelkrämpfe heute (Anzahl)</Label><Skala value={e.krampf} onChange={num("krampf")} min={0} max={6} />
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Schlaf (h)</Label><input className={inputCls} inputMode="decimal" value={e.schlaf_h ?? ""} onChange={(ev) => set("schlaf_h", ev.target.value ? Number(ev.target.value.replace(",", ".")) : undefined)} /></div>
        <div><Label>Einschlafen (min)</Label><input className={inputCls} inputMode="numeric" value={e.einschlaf_min ?? ""} onChange={(ev) => set("einschlaf_min", ev.target.value ? Number(ev.target.value) : undefined)} /></div>
      </div>
      {laufend.length > 0 && (
        <>
          <Label>Heute genommen</Label>
          <div className="mt-1 flex flex-wrap gap-2">
            {laufend.map((s) => (
              <button key={s} type="button" onClick={() => toggle(s)} className={`rounded-full border px-3 py-1.5 text-sm ${(e.einnahmen ?? []).includes(s) ? "border-emerald-400 bg-emerald-900/60 text-emerald-100" : "border-slate-600 bg-slate-800 text-slate-300"}`}>
                {(e.einnahmen ?? []).includes(s) ? "✓ " : ""}{s}
              </button>
            ))}
          </div>
        </>
      )}
      <Label>Notiz (optional)</Label>
      <input className={inputCls} value={e.freitext ?? ""} onChange={(ev) => set("freitext", ev.target.value)} placeholder="Ereignis, Trigger, was geholfen hat" />
      <div className="mt-3 flex items-center gap-3">
        <Btn onClick={save}>Check-in speichern</Btn>
        <span className="text-sm text-emerald-300">{ok}</span>
      </div>
    </Card>
  );
}

export { jetztHHMM };
