---
schirm: eigenstaendig
titel: "ADHS-Versorgung (PWA / Vercel)"
status: "🟢"
status_grund: v0.1 gebaut und getestet 06.09. - Heute (Versuch, Check-in, Mahlzeit), Essen (Woche, Pflanzenvielfalt, 3-Tage-Export), Einnahmen + Versuche, Labor (Dreistufen), Stoffe mit Stimmungsfilter und Labor-Tor, Daten (JSONL-Export/Import). Noch nicht deployt.
naechste_aktion: GitHub-Repo versorgung anlegen, pushen, in Vercel importieren (Root Directory app-adhs, Include files outside root) · V001 Magnesium ab 07.09. in der App anlegen (oder versuche.jsonl aus dem Python-Tool importieren) · Ernaehrungstagebuch 3 Tage fuer InnerBuddies rekonstruieren
wartet_auf: martin
deadline: null
letzte_aenderung: 2026-09-21
meta: "React 19 · Vite · Tailwind · PWA · localStorage · Datenvertrag psychologie-tool · beratend, nicht diagnostisch"
tags: [eigenstaendig, app, react, pwa, vercel, adhs, versorgung, ernaehrung, lokal-first]
---

# ADHS-Versorgung (PWA)

Vercel-Version des Moduls versorgung (psychologie-tool/module_versorgung). Gleiche Daten, gleicher Vertrag, im Browser.

## Stand 21.09.2026 - Atemuebung und gemeinsame Gurtverbindung
- Reiter heisst jetzt **Gurt** und hat zwei Ansichten: **Messen** (Ruhemessung fuer spaeter)
  und **Atmen** (Biofeedback im Moment). Eine Verbindung fuer beide.
- Die Gurtverbindung liegt in `lib/gurtstand.ts` neben React (useSyncExternalStore), nicht
  in einer Komponente. Sonst muesste man beim Wechsel zwischen Messen und Atmen neu koppeln,
  und beim Blick auf "Heute" waere sie weg.
- **Atemuebung**: vier Muster (5-5, 4-6, 4-7-8, 6-6), Kreis atmet vor, darunter die Pulskurve
  Schlag fuer Schlag. Der Punkt ist die Kopplung im Moment - je deutlicher die Welle, desto
  staerker folgt der Puls dem Atem. Wird als `bedingung: "atemuebung"` gespeichert und
  deshalb nie mit Ruhemessungen verglichen.
- Takt laeuft ueber die Uhrzeit, nicht ueber gezaehlte Ticks - sonst verschiebt er sich.
- `AtemPhase` statt `Phase`: "Phase" ist im Datenvertrag schon die Mit-/Ohne-Phase eines Versuchs.
- 18 Rechentests (`npm run test:puls`), Smoke-Test deckt beide Ansichten ab.

## Stand 20.09.2026 - Brustgurt und HRV
- Neuer Bildschirm **Puls**: Gurt ueber Web Bluetooth verbinden, live messen, Kennzahlen
  (RMSSD, SDNN, Puls), speichern mit Bedingung ("morgens im Bett", "im Sitzen" ...).
  Verglichen wird nur innerhalb derselben Bedingung - sonst ist die Zahl Kaffeesatz.
- Im Kern, also fuer beide Apps: `puls.ts` (Datenvertrag HrvSession + TagesWerte,
  Artefaktfilter, RMSSD/SDNN/HF, Vergleich mit der eigenen Vorgeschichte) und
  `gurt.ts` (Web Bluetooth + Simulator).
- **Rohe RR-Intervalle werden mitgespeichert**, nicht nur die Kennzahl - so laesst sich
  spaeter anders rechnen, ohne neu zu messen.
- `npm run test:puls`: 13 Rechentests gegen von Hand nachgerechnete Werte, inklusive
  der Bluetooth-Paketdeutung (RR kommt in 1/1024 s, nicht in ms - der klassische Fehler).
- NICHT GETESTET: die echte Gurt-Verbindung. Hier liegt kein Geraet. Der Simulator
  deckt den Weg davor und danach ab, das Ankoppeln muss Martin pruefen.
- Web Bluetooth gibt es nur auf Android Chrome, nicht auf dem iPhone. Die App sagt das.

## Stand 07.09.2026
- Umgebaut auf das Monorepo `Versorgung`: die App liegt jetzt in `app-adhs/`, die gemeinsame Logik in `kern/`.
  Speicher-Schluessel unveraendert (`adhs-versorgung.v1`), Screens unveraendert, Build und Smoke-Test gruen.

## Stand 06.09.2026
- Gebaut mit `npm run build` (tsc + vite, 0 Fehler), Smoke-Test im Chromium (Einnahme, Versuch, Check-in, Mahlzeit, Labor, Stoffe-Filter, Persistenz nach Reload) ohne Konsolenfehler.
- Bausteine statt Kalorien: 14 Chips, Sofort-Rueckmeldung nach jeder Mahlzeit (Eiweiss? Mikrobiom-Futter? Koffein nach 14 Uhr?), Woche als Balken je Ziel, Pflanzenvielfalt/30, Essensluecke > 6 h.
- Stimmungsfilter "Wie geht es dir gerade?" -> Stoffe nach Ziel, Lebensfuehrung/Kueche zuerst; Supplements zeigen ihr Labor-Tor (Marker, Wert, Stufe, Darm-Vorbehalt); Knopf "Einnahme / Versuch anlegen" springt vorbelegt in den Einnahmen-Bildschirm.
- Ohne Foto, ohne Pflicht: alles ausser Bausteinen ist optional (Martin: je einfacher die Huerde, desto eher erledigt).

## Offen (v0.2)
- Leckere Gerichte + Meal Prep anbieten (Anschluss an mealprep-skill), passend zu den Bausteinen, die diese Woche fehlen.
- Essengehen: Einschaetzung "was ist das, wie gut wird es sein" aus Notiz + Bausteinen (heute nur Sofort-Rueckmeldung).
- Ernaehrungs-Doku im Taschenformat fuer Fachkraefte (heute: 3-Tage-Textexport) -> Bericht mit Woche + Labor + Einnahmen als Druckansicht/PDF.
- Mikrobiom-Ergebnis (InnerBuddies) als typ 'mikrobiom' in tests.
- Auswertung der Versuche gegen HRV (Datenvertrag steht, Rechnung fehlt noch).
- Live-Biofeedback: Atemfuehrung mit Live-Puls - noch nicht gebaut.
- Uhr-Anbindung: **Xiaomi Smart Band 7 Pro** (Mi Fitness). Keine offene API - der Weg ist der
  CSV-Datenexport aus der App bzw. ueber das Xiaomi-Konto. Passt zu lokal-first, ist aber manuell.
  WARTET AUF eine Beispieldatei: das Spaltenformat aendert sich zwischen Versionen, ein Parser
  auf Verdacht waere geraten.
- Foto optional an Mahlzeit (nur lokal).

## Verweise
- Eltern: Code Projekte/Versorgung (Monorepo, seit 07.09. gemeinsamer Kern mit Fit Senior)
- Eltern (alt): Code Projekte · Familie: psychologie-tool/module_versorgung (Python, gleiche Daten), neurodivers (docs/Studienlage, Lancet-PDF), Neuro-Fit
- Muster: Zustaendigkeitskarte (PWA auf Vercel), E-Auto-Rechner
