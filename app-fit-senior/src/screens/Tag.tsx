import { useDB } from "../lib/speicher";
import { heutigerEintrag, tagSetzen } from "../lib/tag";
import { fmt, gewichtsverlauf, wadenverlauf } from "../lib/logik";
import type { CheckIn } from "../lib/typen";
import { Card, H2, Label, Muted, Skala, useInputCls } from "@versorgung/kern";

/**
 * Die Tagesfragen. Alle freiwillig, jede Antwort speichert sich sofort –
 * kein Knopf, kein "habe ich das jetzt abgeschickt?".
 * Nochmal antippen nimmt die Antwort zurück.
 */

function Wahl<T extends string | boolean>({
  wert,
  optionen,
  onWahl,
}: {
  wert: T | undefined;
  optionen: { wert: T; label: string }[];
  onWahl: (v: T | undefined) => void;
}) {
  return (
    <div className="mt-2 flex gap-2">
      {optionen.map((o) => (
        <button
          key={String(o.wert)}
          type="button"
          onClick={() => onWahl(wert === o.wert ? undefined : o.wert)}
          className={`flex-1 rounded-xl px-4 py-4 text-lg ${
            wert === o.wert ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-300"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function Tag() {
  const db = useDB();
  const inputCls = useInputCls();
  const ci = heutigerEintrag(db);
  const gew = gewichtsverlauf(db.eintraege);
  const wade = wadenverlauf(db.eintraege);

  return (
    <div>
      <H2>Wie war der Tag?</H2>
      <Card>
        <Label>Waren Sie heute draußen?</Label>
        <Wahl<boolean>
          wert={ci?.draussen}
          optionen={[
            { wert: true, label: "Ja" },
            { wert: false, label: "Nein" },
          ]}
          onWahl={(v) => tagSetzen({ draussen: v })}
        />

        <Label>Haben Sie mit jemandem gesprochen?</Label>
        <Wahl<boolean>
          wert={ci?.kontakt}
          optionen={[
            { wert: true, label: "Ja" },
            { wert: false, label: "Nein" },
          ]}
          onWahl={(v) => tagSetzen({ kontakt: v })}
        />

        <Label>Gestürzt oder fast gestürzt?</Label>
        <Wahl<NonNullable<CheckIn["sturz"]>>
          wert={ci?.sturz}
          optionen={[
            { wert: "nein", label: "Nein" },
            { wert: "beinahe", label: "Fast" },
            { wert: "gestuerzt", label: "Gestürzt" },
          ]}
          onWahl={(v) => tagSetzen({ sturz: v })}
        />
      </Card>

      <H2>Wenn Sie mögen</H2>
      <Card>
        <Label>Schmerzen (1 wenig – 10 stark)</Label>
        <Skala value={ci?.schmerz} onChange={(v) => tagSetzen({ schmerz: v })} />

        <Label>Gewicht in kg, falls gewogen</Label>
        <input
          inputMode="decimal"
          defaultValue={ci?.gewicht_kg ?? ""}
          onBlur={(e) => {
            const n = Number(e.target.value.replace(",", "."));
            tagSetzen({ gewicht_kg: e.target.value && !Number.isNaN(n) ? n : undefined });
          }}
          className={inputCls}
          placeholder="z. B. 72,5"
        />

        <Label>Wadenumfang in cm</Label>
        <input
          inputMode="decimal"
          defaultValue={ci?.wade_cm ?? ""}
          onBlur={(e) => {
            const n = Number(e.target.value.replace(",", "."));
            tagSetzen({ wade_cm: e.target.value && !Number.isNaN(n) ? n : undefined });
          }}
          className={inputCls}
          placeholder="z. B. 34"
        />
        <p className="mt-1 text-base text-slate-500">
          Mit dem Maßband an der dicksten Stelle, im Sitzen. Alle paar Wochen genügt – immer dasselbe Bein.
        </p>

        <Label>Sonst noch etwas?</Label>
        <input
          defaultValue={ci?.freitext ?? ""}
          onBlur={(e) => tagSetzen({ freitext: e.target.value.trim() || undefined })}
          className={inputCls}
        />
        <Muted>Alles freiwillig. Was Sie eintragen, bleibt auf diesem Gerät.</Muted>
      </Card>

      {wade && (
        <>
          <H2>Wade</H2>
          <Card>
            <p className="text-lg text-slate-300">
              {wade.aktuell} cm, gemessen {fmt(wade.gemessen)}
              {wade.veraenderung !== null && (
                <>
                  {" "}
                  · {wade.veraenderung > 0 ? "+" : ""}
                  {wade.veraenderung} cm seit {fmt(wade.seit)}
                </>
              )}
            </p>
            {wade.messungen === 1 && (
              <Muted>Beim nächsten Mal sehen Sie hier, ob sich etwas verändert hat. Darauf kommt es an.</Muted>
            )}
            {wade.unterRichtwert && (
              <p className="mt-2 text-lg text-amber-300">
                Beim nächsten Arztbesuch wäre die Wade einen Satz wert – zusammen mit dem Eiweiß beim Essen.
              </p>
            )}
          </Card>
        </>
      )}

      {gew && (
        <>
          <H2>Gewicht</H2>
          <Card>
            <p className="text-lg text-slate-300">
              {gew.start} kg ({fmt(gew.von)}) → {gew.aktuell} kg ({fmt(gew.bis)}) · {gew.diff > 0 ? "+" : ""}
              {gew.diff} kg
            </p>
            {gew.auffaellig && (
              <p className="mt-2 text-lg text-amber-300">
                Das sind {gew.prozent} %. Beim nächsten Arztbesuch wäre das einen Satz wert.
              </p>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
