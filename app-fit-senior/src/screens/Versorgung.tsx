import { useState } from "react";
import { append, download, heute, replaceAll, useDB } from "../lib/speicher";
import { BEREICHE, DRINGLICHKEIT, bedarfeSortiert, fmt, neueId } from "../lib/logik";
import { BEREICH_LABEL, LEISTUNGEN, leistung, type Leistungsdef } from "../data/leistungen";
import type { Bedarf, Leistung } from "../lib/typen";
import { Btn, Card, Chip, H2, Label, Muted, Pill, useInputCls } from "@versorgung/kern";

type Ansicht = "bedarf" | "zusteht";

/**
 * Schlüssel sind zum Speichern da, nicht zum Lesen. "geprueft" stand vorher wörtlich
 * auf dem Knopf – ohne Umlaut und in einer Sprache, die niemand spricht.
 */
const STATUS_LABEL: Record<Leistung["status"], string> = {
  unbekannt: "offen",
  geprueft: "angesehen",
  beantragt: "beantragt",
  bewilligt: "bewilligt",
  abgelehnt: "abgelehnt",
};

const BEDARF_LABEL: Record<Bedarf["status"], string> = {
  offen: "offen",
  besprochen: "besprochen",
  beantragt: "beantragt",
  erledigt: "erledigt",
};

/**
 * Bedarfe erfassen. Der Gedanke dahinter: Beim Begutachtungstermin und im Gespräch
 * mit den Kindern fällt einem nie ein, was tatsächlich schwerfällt – im Moment selbst
 * spielt man es herunter. Aufgeschrieben, wenn es passiert, stimmt die Liste.
 */
function BedarfForm({ onFertig }: { onFertig: () => void }) {
  const inputCls = useInputCls();
  const [bereich, setBereich] = useState<Bedarf["bereich"]>("haushalt");
  const [titel, setTitel] = useState("");
  const [eigeneWorte, setEigeneWorte] = useState("");
  const [dringlichkeit, setDringlichkeit] = useState<Bedarf["dringlichkeit"]>("bald");

  const frage = BEREICHE.find((b) => b.key === bereich)?.frage ?? "";

  const speichern = () => {
    if (!titel.trim()) return;
    const b: Bedarf = {
      schema_version: 1,
      id: neueId(),
      datum: heute(),
      bereich,
      titel: titel.trim(),
      ...(eigeneWorte.trim() ? { eigene_worte: eigeneWorte.trim() } : {}),
      dringlichkeit,
      status: "offen",
    };
    append("bedarfe", b);
    setTitel("");
    setEigeneWorte("");
    onFertig();
  };

  return (
    <div>
      <Label>Worum geht es?</Label>
      <div className="mt-2 flex flex-wrap gap-2">
        {BEREICHE.map((b) => (
          <Chip key={b.key} on={bereich === b.key} onClick={() => setBereich(b.key)}>
            {b.label}
          </Chip>
        ))}
      </div>
      <p className="mt-3 text-lg text-sky-300">{frage}</p>
      <input value={titel} onChange={(e) => setTitel(e.target.value)} className={inputCls} placeholder="z. B. Wäsche in den Keller tragen" />

      <Label>In eigenen Worten (freiwillig)</Label>
      <input
        value={eigeneWorte}
        onChange={(e) => setEigeneWorte(e.target.value)}
        className={inputCls}
        placeholder="z. B. Auf der Treppe wird mir schwindelig"
      />

      <Label>Wie eilig?</Label>
      <div className="mt-2 flex gap-2">
        {DRINGLICHKEIT.map((d) => (
          <Chip key={d.key} on={dringlichkeit === d.key} onClick={() => setDringlichkeit(d.key)}>
            {d.label}
          </Chip>
        ))}
      </div>

      <div className="mt-4">
        <Btn onClick={speichern} disabled={!titel.trim()}>
          Eintragen
        </Btn>
      </div>
    </div>
  );
}

/** Eine Leistung mit dem Stand, den man selbst gesetzt hat. */
function LeistungKarte({
  l,
  status,
  onStatus,
}: {
  l: Leistungsdef;
  status: Leistung["status"];
  onStatus: (s: Leistung["status"]) => void;
}) {
  return (
    <Card className="mt-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-lg font-semibold text-slate-100">{l.name}</span>
        <span className="flex flex-wrap gap-2">
          {l.verfaellt && <Pill kind="warn">{l.verfaellt === "monatlich" ? "jeden Monat neu" : "jedes Jahr neu"}</Pill>}
          {status !== "unbekannt" && (
            <Pill kind={status === "bewilligt" ? "gut" : status === "abgelehnt" ? "rot" : "warn"}>{STATUS_LABEL[status]}</Pill>
          )}
        </span>
      </div>
      <p className="mt-2 text-lg text-slate-300">{l.wofuer}</p>
      <p className="mt-2 text-lg text-slate-400">
        <span className="text-slate-500">Wo: </span>
        {l.wo}
      </p>
      <p className="mt-1 text-lg text-slate-400">
        <span className="text-slate-500">Voraussetzung: </span>
        {l.voraussetzung}
      </p>
      {l.hinweis && <p className="mt-2 text-lg text-amber-300">{l.hinweis}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {(["geprueft", "beantragt", "bewilligt", "abgelehnt"] as const).map((x) => (
          <Chip key={x} on={status === x} onClick={() => onStatus(status === x ? "unbekannt" : x)}>
            {STATUS_LABEL[x]}
          </Chip>
        ))}
      </div>
    </Card>
  );
}

export default function Versorgung() {
  const db = useDB();
  const [ansicht, setAnsicht] = useState<Ansicht>("bedarf");
  const [offen, setOffen] = useState(false);
  const bedarfe = bedarfeSortiert(db.bedarfe);

  const statusSetzen = (id: string, status: Bedarf["status"]) =>
    replaceAll({ bedarfe: db.bedarfe.map((b) => (b.id === id ? { ...b, status } : b)) });

  const leistungStatus = (key: string) => db.leistungen.filter((l) => l.key === key).at(-1)?.status ?? "unbekannt";

  // Läuft ein Pflegegrad, dreht sich die Seite um: erst was zusteht, dann der Rest.
  const pflegegradLaeuft = leistungStatus("pflegegrad") === "bewilligt";
  const laufende = pflegegradLaeuft ? LEISTUNGEN.filter((l) => l.verfaellt) : [];
  const uebrige = LEISTUNGEN.filter((l) => !laufende.includes(l));

  const leistungSetzen = (key: string, status: Leistung["status"]) => {
    const l: Leistung = { schema_version: 1, id: neueId(), datum: heute(), key, status };
    append("leistungen", l);
  };

  /** Die Absprache-Schnittstelle: eine Seite Text, die man ausdrucken oder verschicken kann. */
  const bedarfsblattExportieren = () => {
    const zeilen = [
      "Was ich brauche",
      `Stand ${fmt(heute())}`,
      "",
      "Diese Liste ist von der betroffenen Person selbst geführt.",
      "Sie ersetzt keine Begutachtung, aber sie sagt, worum es im Alltag geht.",
      "",
    ];
    for (const b of BEREICHE) {
      const meine = bedarfe.filter((x) => x.bereich === b.key && x.status !== "erledigt");
      if (meine.length === 0) continue;
      zeilen.push(`## ${b.label}`);
      for (const m of meine) {
        zeilen.push(`- ${m.titel} (${m.dringlichkeit}${m.wer ? `, kümmert sich: ${m.wer}` : ", noch niemand"})`);
        if (m.eigene_worte) zeilen.push(`  "${m.eigene_worte}"`);
      }
      zeilen.push("");
    }
    const beantragt = db.leistungen.length > 0;
    if (beantragt) {
      zeilen.push("## Stand der Anträge");
      for (const l of LEISTUNGEN) {
        const s = leistungStatus(l.key);
        if (s !== "unbekannt") zeilen.push(`- ${l.name}: ${s}`);
      }
    }
    download(`${heute()}_was-ich-brauche.txt`, zeilen.join("\n"), "text/plain;charset=utf-8");
  };

  return (
    <div>
      <div className="mt-2 flex gap-2">
        <Chip on={ansicht === "bedarf"} onClick={() => setAnsicht("bedarf")}>
          Was ich brauche
        </Chip>
        <Chip on={ansicht === "zusteht"} onClick={() => setAnsicht("zusteht")}>
          {pflegegradLaeuft ? "Was mir zusteht" : "Was es gibt"}
        </Chip>
      </div>

      {ansicht === "bedarf" ? (
        <>
          <H2>Was ich brauche</H2>
          <Card>
            {offen ? (
              <BedarfForm onFertig={() => setOffen(false)} />
            ) : (
              <>
                <Btn onClick={() => setOffen(true)}>Etwas eintragen</Btn>
                <Muted>
                  Aufschreiben, wenn es passiert. Im Gespräch mit der Familie oder beim Begutachtungstermin fällt einem
                  sonst nichts davon ein.
                </Muted>
              </>
            )}
          </Card>

          {bedarfe.length > 0 && (
            <Card className="mt-3">
              <ul>
                {bedarfe.map((b) => (
                  <li key={b.id} className="border-b border-slate-800 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill kind={b.dringlichkeit === "dringend" ? "rot" : b.dringlichkeit === "bald" ? "warn" : "n"}>
                        {BEREICHE.find((x) => x.key === b.bereich)?.label}
                      </Pill>
                      <span className={`text-lg ${b.status === "erledigt" ? "text-slate-500 line-through" : "text-slate-200"}`}>
                        {b.titel}
                      </span>
                    </div>
                    {b.eigene_worte && <p className="mt-1 text-lg text-slate-400">„{b.eigene_worte}“</p>}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(["offen", "besprochen", "beantragt", "erledigt"] as const).map((s) => (
                        <Chip key={s} on={b.status === s} onClick={() => statusSetzen(b.id, s)}>
                          {BEDARF_LABEL[s]}
                        </Chip>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <H2>Zum Weitergeben</H2>
          <Card>
            <Btn kind="s" onClick={bedarfsblattExportieren} disabled={bedarfe.length === 0}>
              Liste als Textdatei
            </Btn>
            <Muted>
              Eine Seite zum Ausdrucken oder Verschicken – für das Gespräch mit den Kindern, mit dem Hausarzt oder beim
              Termin des Medizinischen Dienstes. Es verlässt nichts das Gerät, außer Sie verschicken die Datei selbst.
            </Muted>
          </Card>
        </>
      ) : (
        <>
          {/*
            Bei bestehendem Pflegegrad ist "wie beantrage ich" die falsche Frage.
            Dann zählt: was läuft schon auf und bleibt ungenutzt liegen.
            Die App entscheidet das nicht selbst, sondern liest es am gesetzten Stand ab.
          */}
          {pflegegradLaeuft ? (
            <>
              <H2>Das steht Ihnen schon zu</H2>
              <Card>
                <p className="text-lg text-slate-300">
                  Der Pflegegrad ist bewilligt. Diese Leistungen laufen von allein weiter auf – wer sie nicht
                  abruft, verschenkt sie. Sie müssen dafür nichts neu beantragen.
                </p>
                <Muted>
                  Wie viel es ist und ob sich Nicht­genutztes übertragen lässt, sagt Ihnen die Pflegekasse. Die
                  Pflegeberatung ist kostenlos und hilft beim Abrufen.
                </Muted>
              </Card>
              {laufende.map((l) => (
                <LeistungKarte key={l.key} l={l} status={leistungStatus(l.key)} onStatus={(x) => leistungSetzen(l.key, x)} />
              ))}
            </>
          ) : (
            <>
              <H2>Was es gibt</H2>
              <Card>
                <Muted>
                  Überblick, keine Rechtsauskunft: Beträge stehen bewusst nirgends, weil sie sich ändern. Wer sich
                  durchfragen will, ruft die Pflegeberatung an – die ist kostenlos und unabhängig.
                </Muted>
              </Card>
            </>
          )}

          {(Object.keys(BEREICH_LABEL) as (keyof typeof BEREICH_LABEL)[]).map((bereich) => {
            // Was oben schon steht, kommt unten nicht noch einmal.
            const meine = uebrige.filter((l) => l.bereich === bereich);
            if (meine.length === 0) return null;
            return (
              <div key={bereich}>
                <H2>{BEREICH_LABEL[bereich]}</H2>
                {meine.map((l) => (
                  <LeistungKarte key={l.key} l={l} status={leistungStatus(l.key)} onStatus={(x) => leistungSetzen(l.key, x)} />
                ))}
              </div>
            );
          })}

          <Card className="mt-4">
            <Muted>
              Quellenstand ungeprüft – die Angaben stammen aus allgemeinem Wissen und sind noch nicht gegen SGB XI, SGB V
              und die Seiten der Pflegekassen verifiziert. Vor dem ernsthaften Gebrauch prüfen. Genannte Leistungen:{" "}
              {LEISTUNGEN.length}, davon Pflege: {LEISTUNGEN.filter((l) => l.bereich === "pflege").length}.
              {leistung("pflegeberatung") ? " Erster Anruf: Pflegeberatung nach § 7a." : ""}
            </Muted>
          </Card>
        </>
      )}
    </div>
  );
}
