import { useRef, useState } from "react";
import { COLLECTIONS, clearAll, exportAll, exportJSONL, importFile, useDB } from "../lib/speicher";
import { Btn, Card, H2, Muted } from "@versorgung/kern";

export default function Daten() {
  const db = useDB();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const [confirm, setConfirm] = useState(false);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    try {
      setMsg(importFile(f.name, await f.text()));
    } catch (e) {
      setMsg("Import fehlgeschlagen: " + String(e));
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      <H2>Ihre Daten</H2>
      <Card>
        <ul className="text-lg">
          {COLLECTIONS.map((c) => (
            <li key={c}>
              {c}: {db[c].length} Sätze
            </li>
          ))}
        </ul>
        <Muted>
          Alles liegt nur in diesem Browser. Kein Server, keine Cloud, niemand liest mit. Wer die Browserdaten löscht,
          löscht auch diese – deshalb ab und zu exportieren.
        </Muted>
      </Card>

      <H2>Sichern</H2>
      <Card>
        <div className="flex flex-wrap gap-2">
          <Btn onClick={exportAll}>Alles sichern</Btn>
          {COLLECTIONS.map((c) => (
            <Btn key={c} kind="s" onClick={() => exportJSONL(c)}>
              {c}.jsonl
            </Btn>
          ))}
        </div>
        <Muted>
          Die .jsonl-Dateien folgen demselben Datenvertrag wie ADHS-Versorgung und das Python-Tool (schema_version 1).
        </Muted>
      </Card>

      <H2>Zurückholen</H2>
      <Card>
        <input ref={fileRef} type="file" accept=".json,.jsonl" className="text-lg" onChange={(e) => onFile(e.target.files?.[0])} />
        <Muted>Gesamtsicherung (.json) oder eine einzelne Sammlung (.jsonl). Ergänzt, überschreibt nicht.</Muted>
        {msg && <p className="mt-2 text-lg text-emerald-300">{msg}</p>}
      </Card>

      <H2>Löschen</H2>
      <Card>
        {confirm ? (
          <div className="flex flex-wrap gap-2">
            <Btn
              kind="s"
              onClick={() => {
                clearAll();
                setConfirm(false);
              }}
            >
              Wirklich alles löschen
            </Btn>
            <Btn kind="ghost" onClick={() => setConfirm(false)}>
              Abbrechen
            </Btn>
          </div>
        ) : (
          <Btn kind="ghost" onClick={() => setConfirm(true)}>
            Alle Daten auf diesem Gerät löschen …
          </Btn>
        )}
      </Card>
    </div>
  );
}
