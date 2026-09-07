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

Vercel, ein Projekt je App, beide auf dieses Repo:
Root Directory `app-adhs` beziehungsweise `app-fit-senior`, dazu **Include source files outside of
the Root Directory** aktivieren – sonst fehlt `kern/`. Framework Vite, Build `npm run build`, Output `dist`.
Keine `Co-Authored-By:`-Zeile in Commits (Vercel Hobby blockt sonst).

## Für beide Äste gilt

Beratend, nicht diagnostisch. Keine Diagnose, keine Therapieempfehlung, keine Cloud.
