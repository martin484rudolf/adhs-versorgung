import { useState } from "react";
import { append, download, heute, jetztHHMM, useDB } from "../lib/store";
import { BAUSTEINE, addTage, fmt, mahlzeitFeedback, tagesbild, wochenbild } from "../lib/logik";
import type { Baustein, Mahlzeit } from "../lib/types";
import { Btn, Card, Chip, H2, Label, Muted, inputCls } from "../ui";

/** Drei Tipper: Uhrzeit ist vorausgefüllt, Bausteine antippen, speichern. Alles andere optional. */
export function MahlzeitForm() {
  const [b, setB] = useState<Baustein[]>([]);
  const [uhr, setUhr] = useState(jetztHHMM());
  const [pflanzen, setPflanzen] = useState("");
  const [notiz, setNotiz] = useState("");
  const [mehr, setMehr] = useState(false);
  const [fb, setFb] = useState("");
  const toggle = (k: Baustein) => setB((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  const save = () => {
    if (!b.length) return;
    const m: Mahlzeit = { schema_version: 1, datum: heute(), uhrzeit: uhr, bausteine: b };
    const pl = pflanzen.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    if (pl.length) m.pflanzen = pl;
    if (notiz.trim()) m.notiz = notiz.trim();
    append("mahlzeiten", m);
    setFb(mahlzeitFeedback(m));
    setB([]); setPflanzen(""); setNotiz(""); setUhr(jetztHHMM());
  };
  const grp = (art: "plus" | "eigen" | "bremse") => BAUSTEINE.filter((x) => x.art === art);
  return (
    <Card>
      <div className="flex items-center gap-3">
        <input className={`${inputCls} mt-0 w-28`} value={uhr} onChange={(e) => setUhr(e.target.value)} />
        <Muted>Was war drin?</Muted>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">{grp("plus").map((x) => <Chip key={x.key} on={b.includes(x.key)} onClick={() => toggle(x.key)}>{x.label}</Chip>)}</div>
      <div className="mt-2 flex flex-wrap gap-2">{grp("eigen").map((x) => <Chip key={x.key} on={b.includes(x.key)} onClick={() => toggle(x.key)}>{x.label}</Chip>)}</div>
      <div className="mt-2 flex flex-wrap gap-2">{grp("bremse").map((x) => <Chip key={x.key} on={b.includes(x.key)} onClick={() => toggle(x.key)}>{x.label}</Chip>)}</div>
      {mehr ? (
        <>
          <Label>Welche Pflanzen? (für die Vielfalt, kommagetrennt)</Label>
          <input className={inputCls} value={pflanzen} onChange={(e) => setPflanzen(e.target.value)} placeholder="Linsen, Paprika, Hafer, Apfel" />
          <Label>Was war es? (optional – auch beim Essengehen)</Label>
          <input className={inputCls} value={notiz} onChange={(e) => setNotiz(e.target.value)} placeholder="Döner mit Salat, Pizza, Linsensuppe …" />
        </>
      ) : (
        <button type="button" className="mt-2 text-sm text-sky-300" onClick={() => setMehr(true)}>+ Pflanzen / Notiz (optional)</button>
      )}
      <div className="mt-3 flex items-center gap-3">
        <Btn onClick={save} disabled={!b.length}>Mahlzeit speichern</Btn>
      </div>
      {fb && <p className="mt-2 rounded-xl bg-slate-800 px-3 py-2 text-sm text-slate-200">{fb}</p>}
    </Card>
  );
}

export default function Ernaehrung() {
  const db = useDB();
  const tag = heute();
  const w = wochenbild(db.mahlzeiten, tag);
  const [exportVon, setExportVon] = useState(addTage(tag, -2));

  const exportTage = () => {
    const bis = addTage(exportVon, 2);
    const rows = db.mahlzeiten.filter((m) => m.datum >= exportVon && m.datum <= bis).sort((a, b) => (a.datum + a.uhrzeit).localeCompare(b.datum + b.uhrzeit));
    const lines = [`Ernährungstagebuch ${fmt(exportVon)} – ${fmt(bis)}`, "", ...rows.map((m) => `${fmt(m.datum)} ${m.uhrzeit}  ${m.bausteine.map((b) => BAUSTEINE.find((x) => x.key === b)?.label ?? b).join(", ")}${m.pflanzen?.length ? `  [${m.pflanzen.join(", ")}]` : ""}${m.notiz ? `  – ${m.notiz}` : ""}`)];
    download(`${exportVon}_ernaehrungstagebuch_3tage.txt`, lines.join("\n"), "text/plain");
  };

  return (
    <div>
      <H2>Jetzt eintragen</H2>
      <MahlzeitForm />

      <H2>Diese Woche</H2>
      <Card>
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-semibold text-emerald-300">{w.pflanzenVielfalt}<span className="ml-1 text-sm text-slate-400">/ 30 Pflanzen</span></div>
          <Muted>{fmt(w.von)} – {fmt(w.bis)}</Muted>
        </div>
        <Muted>Verschiedene Pflanzen pro Woche – der Wert, der im American Gut Project am stärksten mit Mikrobiom-Vielfalt zusammenhing. Zählt nur, wenn du Pflanzen einträgst.</Muted>
        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs">
          {w.tage.map((t) => (
            <div key={t.datum} className="rounded-lg bg-slate-800 p-1">
              <div className="text-slate-400">{t.datum.slice(8)}.</div>
              <Balken v={t.gemueseObst} max={5} title="Gemüse+Obst" color="bg-emerald-500" />
              <Balken v={t.eiweissMahlzeiten} max={3} title="Eiweiß-Mahlzeiten" color="bg-sky-500" />
              <Balken v={t.ballast} max={3} title="Mikrobiom-Futter" color="bg-lime-500" />
              <Balken v={t.bremsen} max={3} title="Bremsen" color="bg-rose-500" />
              <div className="mt-1 text-slate-500">{t.mahlzeiten || "–"}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
          <span><i className="inline-block h-2 w-2 rounded bg-emerald-500" /> Gemüse+Obst (Ziel 5)</span>
          <span><i className="inline-block h-2 w-2 rounded bg-sky-500" /> Eiweiß je Mahlzeit</span>
          <span><i className="inline-block h-2 w-2 rounded bg-lime-500" /> Mikrobiom-Futter</span>
          <span><i className="inline-block h-2 w-2 rounded bg-rose-500" /> Bremsen (Fertig, Süß, Alkohol)</span>
        </div>
        {w.tage.some((t) => t.maxLuecke > 6) && <p className="mt-2 text-sm text-amber-300">An {w.tage.filter((t) => t.maxLuecke > 6).length} Tag(en) lag eine Essenslücke über 6 h – das ist die Unterzucker-Reizbarkeit.</p>}
      </Card>

      <H2>Heute im Detail</H2>
      <Card>
        {(() => {
          const t = tagesbild(db.mahlzeiten.filter((m) => m.datum === tag));
          return t.mahlzeiten ? (
            <ul className="text-sm text-slate-200">
              <li>{t.mahlzeiten} Mahlzeiten, größte Lücke {t.maxLuecke.toFixed(1)} h</li>
              <li>Gemüse/Obst {t.gemueseObst} · Eiweiß bei {t.eiweissMahlzeiten} Mahlzeiten · Mikrobiom-Futter {t.ballast}</li>
              <li>Bremsen {t.bremsen} · Koffein {t.koffein}</li>
            </ul>
          ) : <Muted>Noch nichts eingetragen.</Muted>;
        })()}
      </Card>

      <H2>Für Labor oder Fachkraft</H2>
      <Card>
        <Muted>Drei Tage als Textliste (z. B. InnerBuddies-Ernährungstagebuch, Ernährungsberatung). Startdatum wählen, es werden drei Tage ab dort exportiert.</Muted>
        <div className="mt-2 flex items-center gap-3">
          <input type="date" className={`${inputCls} mt-0 w-44`} value={exportVon} onChange={(e) => setExportVon(e.target.value)} />
          <Btn kind="s" onClick={exportTage}>3 Tage exportieren</Btn>
        </div>
      </Card>
    </div>
  );
}

function Balken({ v, max, title, color }: { v: number; max: number; title: string; color: string }) {
  const pct = Math.min(100, Math.round((v / max) * 100));
  return (
    <div className="mt-1 h-1.5 w-full rounded bg-slate-700" title={`${title}: ${v}`}>
      <div className={`h-1.5 rounded ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
