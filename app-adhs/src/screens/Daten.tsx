import { useRef, useState } from "react";
import { COLLECTIONS, clearAll, exportAll, exportJSONL, importFile, useDB } from "../lib/store";
import { Btn, Card, H2, Muted } from "../ui";

export default function Daten() {
  const db = useDB();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const [confirm, setConfirm] = useState(false);
  const onFile = async (f: File | undefined) => {
    if (!f) return;
    try { setMsg(importFile(f.name, await f.text())); } catch (e) { setMsg("Import fehlgeschlagen: " + String(e)); }
    if (fileRef.current) fileRef.current.value = "";
  };
  return (
    <div>
      <H2>Deine Daten</H2>
      <Card>
        <ul className="text-sm">{COLLECTIONS.map((c) => <li key={c}>{c}: {db[c].length} Sätze</li>)}</ul>
        <Muted>Alles liegt nur in diesem Browser (localStorage). Kein Server, keine Cloud. Browserdaten löschen = Daten weg – deshalb regelmäßig exportieren.</Muted>
      </Card>
      <H2>Export</H2>
      <Card>
        <div className="flex flex-wrap gap-2">
          <Btn onClick={exportAll}>Alles als JSON</Btn>
          {COLLECTIONS.map((c) => <Btn key={c} kind="s" onClick={() => exportJSONL(c)}>{c}.jsonl</Btn>)}
        </div>
        <Muted>Die .jsonl-Dateien entsprechen daten/*.jsonl im Psychologie-Tool (Datenvertrag schema_version 1) – dort einfach anhängen.</Muted>
      </Card>
      <H2>Import</H2>
      <Card>
        <input ref={fileRef} type="file" accept=".json,.jsonl" className="text-sm" onChange={(e) => onFile(e.target.files?.[0])} />
        <Muted>Gesamtexport (.json) oder eine Sammlung (.jsonl, Dateiname enthält eintraege / einnahmen / versuche / tests / mahlzeiten). Ergänzt, überschreibt nicht.</Muted>
        {msg && <p className="mt-2 text-sm text-emerald-300">{msg}</p>}
      </Card>
      <H2>Löschen</H2>
      <Card>
        {confirm ? (
          <div className="flex gap-2"><Btn kind="s" onClick={() => { clearAll(); setConfirm(false); }}>Wirklich alles löschen</Btn><Btn kind="ghost" onClick={() => setConfirm(false)}>Abbrechen</Btn></div>
        ) : <Btn kind="ghost" onClick={() => setConfirm(true)}>Alle Daten auf diesem Gerät löschen…</Btn>}
      </Card>
    </div>
  );
}
