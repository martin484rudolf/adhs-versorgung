---
schirm: eigenstaendig
titel: "Fit Senior (PWA / Vercel)"
status: "🟡"
status_grund: v0.2 (07.09.) - Navigation auf einen Startbildschirm umgebaut, Ton von Bewertung auf Erinnerung umgestellt, Eintragen ohne Speichern-Knopf. Build und Smoke-Test gruen. Offen: Hilfe-Bereich auf "was steht schon zu" drehen, Leistungsdaten pruefen.
naechste_aktion: Hilfe-Bereich umdrehen: laufender Pflegegrad, also "was steht zu und verfaellt" statt "wie beantragen" · Leistungsdaten gegen SGB XI / SGB V pruefen · v0.2 dem Vater zeigen und zusehen, wo er haengenbleibt
wartet_auf: martin
deadline: null
letzte_aenderung: 2026-09-07
meta: "React 19 · Vite · Tailwind · PWA · localStorage · Kern @versorgung/kern · beratend, nicht diagnostisch"
tags: [eigenstaendig, app, react, pwa, vercel, senioren, versorgung, ernaehrung, pflege, lokal-first]
---

# Fit Senior (PWA)

Der zweite Ast am Versorgungs-Baum. Gleiche Basis wie ADHS-Versorgung, zugeschnitten auf aeltere
Menschen: Essen und Trinken, Werte, Bedarfe und Versorgungsleistungen. Primaer fuer die Person
selbst gedacht, mit einer Schnittstelle fuer die Absprache mit Angehoerigen und Fachkraeften.

## Stand 07.09.2026
- Monorepo `Versorgung` aufgebaut: `kern/` (Datenvertrag, Speicher, Labor, Versuche, Ernaehrung,
  Oberflaeche), `app-adhs/`, `app-fit-senior/`. Die ADHS-App laeuft unveraendert weiter auf dem Kern.
- Fuenf Bildschirme gebaut und im Chromium durchgeklickt: Heute (Glaeser, draussen, Kontakt, Sturz,
  Schmerz, Gewicht, Tagesblick), Essen (Bausteine mit Trinken und Fisch statt Koffein), Werte
  (Labor-Registry fuer Aeltere), Hilfe (Bedarfe nach acht Bereichen + 18 Leistungen mit Antragsstand),
  Daten (JSONL-Export/Import).
- Grosse Darstellung ist Voreinstellung; Umschalter A+/A- oben rechts. Groesse steckt im Kern, damit
  beide Apps dieselben Bausteine nutzen.
- Gewichtsverlust ueber 5 % wird als Hinweis markiert - das ernsteste Zeichen, das man selbst bemerkt.
- Bedarfsblatt "Was ich brauche" als Textexport fuer Gespraech oder MD-Begutachtung.

## Stand 07.09.2026 (v0.2) - Navigation und Ton
- **Ein Startbildschirm statt Reiterleiste.** Trinken direkt dort (haeufigste Handlung, kein Umweg),
  darunter "Gegessen" und "Wie war der Tag?", darunter abgesetzt das Seltenere. Jeder Weg geht genau
  eine Ebene tief, und von jeder Seite fuehrt oben und unten derselbe grosse Knopf zurueck.
- **Kein Speichern-Knopf mehr.** Jede Antwort landet im Moment des Tippens im Speicher
  (`lib/tag.ts`). Kein "ist das jetzt angekommen?".
- **Ton umgestellt: erinnern statt bewerten.** Aus "Erst 3 Glaeser getrunken - wenig fuer einen
  ganzen Tag" wurde "Ein Glas Wasser waere jetzt gut". Kein Rot mehr beim Essen, keine
  "Eher Bremse"-Note, kein Zaehler fuer Bremsen. Der Kern kann Kopfzeilen weiterhin - die ADHS-App
  nutzt sie, Fit Senior nicht (`mahlzeitFeedback(..., kopf?)`).
- Der Smoke-Test prueft das jetzt mit: jede Kachel auf und zurueck, Sofort-Speichern,
  und dass im Text keine Benotung auftaucht.

## Zielperson: Martins Vater (seit 07.09. bekannt)
- **Bedient Smartphone/Tablet selbst, aber unsicher.** Kann tippen, verliert sich aber leicht.
  → Fuenf Reiter sind zu viel. Ein Startbildschirm, von dem aus alles Weitere erreichbar ist.
  Der Rest darf bleiben, aber nicht mehr gleichrangig unten stehen.
- **Noch gut zu Fuss, Vorsorge-Gedanke.** Essen, Trinken, Bewegung, Werte tragen den Alltag.
- **Pflegegrad laeuft bereits.** Das dreht den Hilfe-Bereich um: nicht "wie beantrage ich",
  sondern "was steht schon zu und bleibt ungenutzt". Kandidaten: Entlastungsbetrag (monatlich,
  verfaellt — Uebertragungsregel pruefen), Verhinderungspflege, Pflegehilfsmittel zum Verbrauch,
  Wohnumfeldverbesserung (vor dem Umbau beantragen). Der Status-Schalter je Leistung ist da,
  die Reihenfolge und die Ansprache noch nicht.

## Offen, bevor das jemand ernsthaft benutzt
- **Leistungsdaten pruefen** (`src/data/leistungen.ts`): 18 Eintraege aus Grundwissen, Stand
  ungeprueft, Betraege bewusst nicht hinterlegt. Muster: ZU_PRUEFEN aus dem Patent-Projekt.
- **Labor-Schwellen absichern** (`src/data/labor.ts`) gegen eine benannte Leitlinie.
- Eigene Icons (aktuell Platzhalter aus der ADHS-App).
- Die fuenf Check-in-Fragen sind Entwurf. Am Vater pruefen, was davon wirklich eingetragen wird.

## Vielleicht spaeter
- Medikationsplan / Polypharmazie - der groesste fehlende Baustein, bewusst nicht in v0.1.
- Erinnerungen (Trinken, Medikamente) - braucht eine Entscheidung ueber Benachrichtigungen in der PWA.
- Angehoerigen-Ansicht: heute nur der Textexport, kein zweiter Zugang. Bewusst so, solange nichts
  das Geraet verlaesst.

## Verweise
- Eltern: Code Projekte/Versorgung (Monorepo)
- Geschwister: app-adhs (gleicher Kern, gleicher Datenvertrag)
- Muster: Zustaendigkeitskarte (PWA auf Vercel), E-Auto-Rechner
