import { useState } from "react";
import { heute, useDB } from "../lib/store";
import { STIMMUNGEN, STOFFE, laborStand, laborTor, einnahmenLaufend } from "../lib/logik";
import type { Stoff } from "../lib/types";
import { Btn, Card, Chip, H2, Muted, Pill } from "../ui";

const EBENE: Record<Stoff["ebene"], string> = { lebensfuehrung: "Lebensführung", kueche: "Küche", supplement: "Supplement", medikament: "Medikament (Arzt)" };
const EVIDENZ: Record<Stoff["evidenz"], "gut" | "warn" | "n" | "rot"> = { stark: "gut", mittel: "gut", schwach: "warn", vorlaeufig: "warn", keine: "rot" };

export default function Stoffe({ onEinnahme }: { onEinnahme: (key: string) => void }) {
  const db = useDB();
  const [stimmung, setStimmung] = useState<string | null>(null);
  const [ebene, setEbene] = useState<Stoff["ebene"] | null>(null);
  const [q, setQ] = useState("");
  const [offen, setOffen] = useState<string | null>(null);
  const lab = laborStand(db.tests, db.eintraege);
  const laufend = new Set(einnahmenLaufend(db.einnahmen).map((r) => r.stoff));
  const ziele = STIMMUNGEN.find((s) => s.key === stimmung)?.ziele ?? null;

  let liste = STOFFE.filter((s) => !ebene || s.ebene === ebene);
  if (ziele) liste = liste.filter((s) => s.ziel.some((z) => ziele.includes(z)));
  if (q) liste = liste.filter((s) => (s.name + " " + (s.effekt ?? "") + " " + (s.hinweis ?? "")).toLowerCase().includes(q.toLowerCase()));
  const ordnung: Stoff["ebene"][] = ["lebensfuehrung", "kueche", "supplement", "medikament"];
  liste = [...liste].sort((a, b) => ordnung.indexOf(a.ebene) - ordnung.indexOf(b.ebene));

  return (
    <div>
      <H2>Wie geht es dir gerade?</H2>
      <div className="flex flex-wrap gap-2">
        {STIMMUNGEN.map((s) => <Chip key={s.key} on={stimmung === s.key} onClick={() => setStimmung(stimmung === s.key ? null : s.key)}>{s.label}</Chip>)}
      </div>
      {ziele && <Muted>Zuerst kommt, was ohne Labor geht (Lebensführung, Küche). Supplements zeigen ihr Labor-Tor.</Muted>}
      <div className="mt-3 flex flex-wrap gap-2">
        {ordnung.map((e) => <Chip key={e} on={ebene === e} onClick={() => setEbene(ebene === e ? null : e)}>{EBENE[e]}</Chip>)}
        <input className="ml-auto rounded-full border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-slate-100" placeholder="suchen" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="mt-4 space-y-2">
        {liste.map((s) => {
          const tor = laborTor(s, lab.zeilen, lab.vorbehalt);
          const auf = offen === s.key;
          return (
            <Card key={s.key}>
              <button type="button" className="flex w-full items-start justify-between gap-2 text-left" onClick={() => setOffen(auf ? null : s.key)}>
                <div>
                  <div className="font-semibold">{s.name}{laufend.has(s.key) && <span className="ml-2 text-xs text-emerald-300">läuft</span>}</div>
                  <div className="mt-1 flex flex-wrap gap-1"><Pill>{EBENE[s.ebene]}</Pill><Pill kind={EVIDENZ[s.evidenz]}>Evidenz {s.evidenz}</Pill>{s.ziel.map((z) => <Pill key={z}>{z}</Pill>)}</div>
                </div>
                <span className="text-slate-500">{auf ? "▾" : "▸"}</span>
              </button>
              {auf && (
                <div className="mt-3 space-y-2 text-sm text-slate-200">
                  {s.effekt && <p>{s.effekt}</p>}
                  {s.dosis && <p><b>Dosis:</b> {s.dosis}</p>}
                  {s.obergrenze && <p className="text-amber-300"><b>Obergrenze:</b> {s.obergrenze}</p>}
                  {s.hinweis && <p><b>Hinweis:</b> {s.hinweis}</p>}
                  {s.wechselwirkung?.length ? <p><b>Wechselwirkung:</b> {s.wechselwirkung.join(", ")}</p> : null}
                  {s.ebene === "supplement" && s.voraussetzung_labor && (
                    <p className={tor.ok ? "text-emerald-300" : "text-rose-300"}><b>Labor-Tor:</b> {tor.text || "offen"}</p>
                  )}
                  {s.quellen?.length ? <Muted>Quellen: {s.quellen.join(" · ")}</Muted> : null}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {s.ebene === "medikament" ? (
                      <Muted>Information für das Arztgespräch. Keine Dosierung in der App.</Muted>
                    ) : s.ebene === "supplement" ? (
                      <Btn kind={tor.ok ? "p" : "s"} onClick={() => onEinnahme(s.key)}>{tor.ok ? "Einnahme / Versuch anlegen" : "Trotz Labor-Tor anlegen"}</Btn>
                    ) : s.versuch === "wechsel" ? (
                      <Btn kind="s" onClick={() => onEinnahme(s.key)}>Als Versuch anlegen</Btn>
                    ) : null}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
        {!liste.length && <Muted>Nichts gefunden.</Muted>}
      </div>
      <p className="mt-6 text-xs text-slate-500">Stand der Stoffdatenbank: {heute() > "2026-09-06" ? "06.09.2026" : "heute"} · Quelle: Studienlage + Recherche, siehe psychologie-tool/module_versorgung/stoffe.yaml</p>
    </div>
  );
}
