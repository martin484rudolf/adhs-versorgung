import { useDB } from "../lib/speicher";
import { heutigerEintrag, trinkenAendern } from "../lib/tag";
import { heute } from "../lib/speicher";
import { tagesblick } from "../lib/logik";
import { Card } from "@versorgung/kern";

/**
 * Der Startbildschirm. Alles, was täglich passiert, ist von hier aus einen Tipper weit weg –
 * Trinken sogar ohne Umweg, weil es die häufigste Handlung ist.
 *
 * Bewusst keine gleichrangige Reiterleiste mehr: wer sich leicht verliert, braucht einen Ort,
 * an dem er immer wieder ankommt, und Wege, die nur eine Ebene tief gehen.
 */

const WOCHENTAGE = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const MONATE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

const gruss = () => {
  const h = new Date().getHours();
  if (h < 11) return "Guten Morgen";
  if (h < 18) return "Guten Tag";
  return "Guten Abend";
};

function Kachel({ titel, unten, onClick }: { titel: string; unten?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-slate-700/60 bg-slate-900/70 px-6 py-6 text-left"
    >
      <span className="block text-2xl font-semibold text-slate-100">{titel}</span>
      {unten && <span className="mt-1 block text-lg text-slate-400">{unten}</span>}
    </button>
  );
}

export default function Start({ gehZu }: { gehZu: (ziel: "essen" | "tag" | "werte" | "versorgung" | "daten") => void }) {
  const db = useDB();
  const heuteStr = heute();
  const ci = heutigerEintrag(db);
  const mahlzeiten = db.mahlzeiten.filter((m) => m.datum === heuteStr);
  const hinweise = tagesblick(ci, mahlzeiten);
  const getrunken = ci?.getrunken ?? 0;
  const d = new Date();

  return (
    <div>
      <p className="text-2xl text-slate-200">{gruss()}.</p>
      <p className="mb-5 text-lg text-slate-500">
        {WOCHENTAGE[d.getDay()]}, {d.getDate()}. {MONATE[d.getMonth()]}
      </p>

      {hinweise.length > 0 && (
        <Card className="mb-5">
          {hinweise.map((h, i) => (
            <p
              key={i}
              className={`py-1 text-xl ${h.art === "rot" ? "text-rose-300" : h.art === "warn" ? "text-amber-300" : "text-emerald-300"}`}
            >
              {h.text}
            </p>
          ))}
        </Card>
      )}

      {/* Trinken direkt hier: die häufigste Handlung soll keinen Umweg haben. */}
      <div className="select-none rounded-2xl border border-slate-700/60 bg-slate-900/70 px-6 py-6">
        <span className="block text-2xl font-semibold text-slate-100">Getrunken</span>
        <div className="mt-4 flex items-center gap-5">
          <button
            type="button"
            onClick={() => trinkenAendern(-1)}
            className="h-20 w-20 rounded-2xl bg-slate-800 text-4xl text-slate-200"
            aria-label="Ein Glas weniger"
          >
            −
          </button>
          <span className="min-w-14 text-center text-5xl font-semibold text-white">{getrunken}</span>
          <button
            type="button"
            onClick={() => trinkenAendern(1)}
            className="h-20 w-20 rounded-2xl bg-sky-700 text-4xl text-white"
            aria-label="Ein Glas mehr"
          >
            +
          </button>
          <span className="text-xl text-slate-400">Gläser</span>
        </div>
      </div>

      <div className="mt-3 space-y-3">
        <Kachel
          titel="Gegessen"
          unten={mahlzeiten.length === 0 ? "noch nichts eingetragen" : `${mahlzeiten.length} heute`}
          onClick={() => gehZu("essen")}
        />
        <Kachel titel="Wie war der Tag?" unten="draußen, Besuch, Schmerzen" onClick={() => gehZu("tag")} />
      </div>

      <p className="mb-2 mt-8 text-lg text-slate-500">Seltener gebraucht</p>
      <div className="space-y-3">
        <Kachel titel="Meine Werte" unten="Blutwerte vom Arzt" onClick={() => gehZu("werte")} />
        <Kachel titel="Hilfe & Unterstützung" unten="was ich brauche, was mir zusteht" onClick={() => gehZu("versorgung")} />
        <Kachel titel="Meine Daten" unten="sichern und zurückholen" onClick={() => gehZu("daten")} />
      </div>
    </div>
  );
}
