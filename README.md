# Versorgung

Ein Stamm, zwei Äste. Beide Apps schreiben dieselbe Art von Daten, rechnen mit derselben Logik
und laufen ohne Backend – alles bleibt im Browser des Geräts.

```
Versorgung/
├── kern/               @versorgung/kern – Datenvertrag, Speicher, Labor, Versuche, Ernährung, Oberfläche
├── app-adhs/           ADHS-Versorgung  – Ernährung, Einnahmen, Versuche, Labor, Stoffe
├── app-fit-senior/     Fit Senior       – Essen & Trinken, Werte, Bedarfe, Versorgungsleistungen
└── scripts/smoke.mjs   klickt beide Apps im Chromium durch
```

## Warum ein Monorepo

Die beiden Apps unterscheiden sich in dem, was sie fragen – nicht darin, wie sie rechnen.
Stufenlogik fürs Labor, Phasenplan für Versuche, Bausteine statt Kalorien, JSONL-Export:
das ist bei beiden dasselbe und liegt deshalb genau einmal in `kern/`.

Was eine App allein betrifft, bleibt bei ihr: die Labor-Registry (ADHS schaut auf Ferritin und
Omega-3, Fit Senior auf B12, Albumin und Nierenwerte), die Bausteine (dort Koffein, hier Trinken),
die Bildschirme.

## Entwickeln

```
npm install            # einmal im Root, installiert beide Apps
npm run dev:adhs       # http://localhost:5173
npm run dev:senior
npm run build          # baut beide
npm run smoke          # Smoke-Test beider Apps (einmalig: npx playwright install chromium)
```

Der Kern wird nicht gebaut, sondern als Quelle eingebunden – über einen Alias in `vite.config.ts`
und `tsconfig.json` jeder App. Eine Änderung in `kern/` wirkt sofort in beiden, ohne Zwischenschritt.

## Datenvertrag

`psychologie-tool/DATENMODELL.md`, schema_version 1. Beide Apps exportieren `*.jsonl` je Sammlung;
die Dateien lassen sich im Python-Tool an `daten/*.jsonl` anhängen. Import ergänzt, überschreibt nicht.

Gemeinsame Sammlungen: `eintraege`, `einnahmen`, `versuche`, `tests`, `mahlzeiten`.
Nur Fit Senior: `bedarfe`, `leistungen`.

Die Apps nutzen getrennte localStorage-Schlüssel (`adhs-versorgung.v1`, `fit-senior.v1`) und stören
sich auf demselben Gerät nicht.

## Deploy

Live:
- ADHS-Versorgung: https://adhs-versorgung.vercel.app
- Fit Senior: https://fit-senior.vercel.app

Deployt wird **aus dem Wurzelverzeichnis**, nicht aus dem App-Ordner. Der Grund: Vercel lädt nur
hoch, was unter dem Deploy-Verzeichnis liegt – aus `app-adhs/` heraus fehlte `kern/`, und der Build
bricht ab. Welche App gebaut wird, steht in einer eigenen Konfigurationsdatei je App:

```
vercel link --yes --project adhs-versorgung
vercel --prod --local-config vercel.adhs.json

vercel link --yes --project fit-senior
vercel --prod --local-config vercel.senior.json
```

Das `vercel link` davor ist nötig, weil `.vercel/project.json` den Ordner an genau ein Projekt
bindet – vor jedem Deploy also auf das richtige umschalten.

Die Sicherheits-Header (noindex, Frame-Options, Referrer-Policy) stehen in beiden Wurzel-Konfigurationen;
die `vercel.json` in den App-Ordnern greift bei diesem Weg **nicht** und bleibt nur für einen
möglichen Dashboard-Import liegen.

Keine `Co-Authored-By:`-Zeile in Commits (Vercel Hobby blockt sonst).

## Für beide Äste gilt

Beratend, nicht diagnostisch. Keine Diagnose, keine Therapieempfehlung, keine Cloud.
