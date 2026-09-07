import { useEffect, useState } from "react";
import { Darstellung, type Groesse } from "@versorgung/kern";
import Start from "./screens/Start";
import Tag from "./screens/Tag";
import Essen from "./screens/Essen";
import Werte from "./screens/Werte";
import Versorgung from "./screens/Versorgung";
import Daten from "./screens/Daten";

/**
 * Navigation: ein Startbildschirm und Wege, die genau eine Ebene tief gehen.
 *
 * Keine Reiterleiste mehr. Fünf gleichrangige Ziele unten am Rand sind fünf Entscheidungen,
 * bevor irgendetwas passiert – zu viel, wenn man sich bei der Bedienung leicht verliert.
 * Stattdessen: von jedem Bildschirm führt genau ein großer Weg zurück an denselben Ort.
 */

type Seite = "start" | "tag" | "essen" | "werte" | "versorgung" | "daten";

const TITEL: Record<Exclude<Seite, "start">, string> = {
  tag: "Wie war der Tag?",
  essen: "Gegessen",
  werte: "Meine Werte",
  versorgung: "Hilfe & Unterstützung",
  daten: "Meine Daten",
};

const GROESSE_KEY = "fit-senior.groesse";

export default function App() {
  const [seite, setSeite] = useState<Seite>("start");
  // Groß ist die Voreinstellung – wer kleiner will, stellt es um. Umgekehrt fragt niemand danach.
  const [groesse, setGroesse] = useState<Groesse>(() => {
    try {
      return (localStorage.getItem(GROESSE_KEY) as Groesse) ?? "gross";
    } catch {
      return "gross";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(GROESSE_KEY, groesse);
    } catch {
      /* Speicher blockiert – dann gilt die Einstellung nur für diese Sitzung */
    }
  }, [groesse]);

  // Beim Wechsel nach oben scrollen: sonst landet man mitten in einer neuen Seite.
  // Geschweifte Klammern sind Absicht – React hielte einen Rückgabewert für eine Aufräumfunktion.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [seite]);

  return (
    <Darstellung groesse={groesse}>
      <div className="mx-auto min-h-dvh max-w-2xl px-4 pb-10 pt-4">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">{seite === "start" ? "Fit Senior" : TITEL[seite]}</h1>
          <button
            type="button"
            onClick={() => setGroesse((g) => (g === "gross" ? "normal" : "gross"))}
            className="rounded-xl bg-slate-800 px-4 py-2 text-slate-300"
            aria-label="Schrift größer oder kleiner"
          >
            {groesse === "gross" ? "A−" : "A+"}
          </button>
        </header>

        {seite === "start" ? (
          <Start gehZu={setSeite} />
        ) : (
          <>
            {/* Der Weg zurück steht oben und unten – man soll ihn nicht suchen müssen. */}
            <ZurueckKnopf onClick={() => setSeite("start")} />
            {seite === "tag" && <Tag />}
            {seite === "essen" && <Essen />}
            {seite === "werte" && <Werte />}
            {seite === "versorgung" && <Versorgung />}
            {seite === "daten" && <Daten />}
            <div className="mt-8">
              <ZurueckKnopf onClick={() => setSeite("start")} />
            </div>
          </>
        )}

        {seite === "start" && (
          <p className="mt-10 text-center text-base text-slate-600">
            Alles bleibt auf diesem Gerät · beratend, nicht diagnostisch
          </p>
        )}
      </div>
    </Darstellung>
  );
}

function ZurueckKnopf({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-4 w-full rounded-xl bg-slate-800 px-6 py-4 text-left text-lg text-sky-300"
    >
      ← Zurück zum Anfang
    </button>
  );
}
