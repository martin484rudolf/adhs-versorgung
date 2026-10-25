import { useState } from "react";
import { bluetoothVerfuegbar } from "@versorgung/kern";
import { trennen, useGurt, verbinden } from "../lib/gurtstand";
import { Btn, Card, Chip, H2, Muted, Pill } from "../ui";
import Messen from "./Messen";
import Atmen from "./Atmen";

/**
 * Alles, was am Gurt hängt: eine Verbindung, zwei Anwendungen.
 * Messen liefert die Zahl für später, Atmen die Rückmeldung im Moment.
 */
export default function Gurt() {
  const [ansicht, setAnsicht] = useState<"messen" | "atmen">("messen");
  const { verbindung, live, fehler, verbindet } = useGurt();

  return (
    <div>
      <H2>Gurt</H2>
      <Card>
        {!verbindung ? (
          <>
            <div className="flex flex-wrap gap-2">
              <Btn onClick={() => verbinden(false)} disabled={!bluetoothVerfuegbar() || verbindet}>
                {verbindet ? "Suche …" : "Gurt verbinden"}
              </Btn>
              <Btn kind="s" onClick={() => verbinden(true)}>
                Ohne Gurt ausprobieren
              </Btn>
            </div>
            {!bluetoothVerfuegbar() && (
              <Muted>
                Dieser Browser kann kein Bluetooth. Auf dem iPhone geht es grundsätzlich nicht – auf Android mit Chrome
                schon. Zum Anschauen reicht „ohne Gurt".
              </Muted>
            )}
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Pill kind="gut">{verbindung.name}</Pill>
            {live && <span className="text-3xl font-semibold text-white">{live.hf}</span>}
            {live && <span className="text-sm text-slate-400">Schläge/min</span>}
            {live?.kontakt === false && <Pill kind="warn">kein Hautkontakt</Pill>}
            <Btn kind="ghost" onClick={trennen}>
              Trennen
            </Btn>
          </div>
        )}
        {fehler && <p className="mt-2 text-sm text-amber-300">{fehler}</p>}
      </Card>

      <div className="mt-4 flex gap-2">
        <Chip on={ansicht === "messen"} onClick={() => setAnsicht("messen")}>
          Messen
        </Chip>
        <Chip on={ansicht === "atmen"} onClick={() => setAnsicht("atmen")}>
          Atmen
        </Chip>
      </div>

      {ansicht === "messen" ? <Messen /> : <Atmen />}
    </div>
  );
}
