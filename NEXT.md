---
schirm: eigenstaendig
titel: "Versorgung (Monorepo: ADHS-Versorgung + Fit Senior)"
status: "🟢"
status_grund: Monorepo gebaut, beide Apps laufen (18 Puls-Tests + Build grün). Vercel-Deploys schlagen fehl — Ursache: Vercel findet im Root kein Framework (workspaces-Root ohne vite). Lösung: Root Directory in Vercel auf app-adhs/ bzw. app-fit-senior/ setzen + 'Include source files outside Root' aktivieren.
naechste_aktion: PR #1 reviewen und mergen · Vercel-Dashboard: Root Directory=app-adhs/ (Projekt adhs-versorgung) bzw. app-fit-senior/ (Projekt fit-senior), 'Include source files outside of the Root Directory' aktivieren · Smoke-Test lokal (Chromium fehlt in Sandbox)
wartet_auf: martin (Vercel-Projekt-Einstellungen, Bot-Zugang)
deadline: null
letzte_aenderung: 2026-10-25
meta: "npm workspaces · React 19 · Vite · Tailwind · PWA · localStorage · Datenvertrag psychologie-tool schema_version 1"
tags: [eigenstaendig, monorepo, app, react, pwa, vercel, versorgung, lokal-first]
---

# Versorgung

Ein Stamm, zwei Aeste. Was beide Apps gleich machen, liegt genau einmal in `kern/`.
Was nur eine betrifft - welche Laborwerte, welche Bausteine, welche Fragen - bleibt bei ihr.

```
kern/            Datenvertrag, Speicher, Labor-Stufen, Versuche, Ernaehrung, Oberflaeche
app-adhs/        ADHS-Versorgung (NEXT.md dort)
app-fit-senior/  Fit Senior (NEXT.md dort)
scripts/smoke.mjs
```

## Stand 07.09.2026
- ADHS_Versorgung nach `Versorgung/app-adhs/` umgezogen, Git-Historie vollstaendig erhalten
  (git mv, alle Dateien als Rename gefuehrt).
- Kern extrahiert: Speicher ist jetzt eine Fabrik (jede App bringt Schema und Schluessel mit),
  Labor-Stufen und -Tor nehmen die Registry als Parameter, Ernaehrung rechnet ueber uebergebene
  Bausteine, Oberflaeche kennt zwei Groessen. `logik.ts` der ADHS-App: 172 -> 90 Zeilen.
- Die ADHS-App ist inhaltlich unveraendert: gleicher localStorage-Schluessel, gleiche Screens,
  keine Datenmigration noetig.
- Fit Senior neu gebaut (siehe app-fit-senior/NEXT.md).
- `npm run smoke` klickt beide Apps im Chromium durch: alle Tabs, Persistenz, Rueckmeldung.

## Naechste Schritte
1. PR #1 mergen (Monorepo + Fit Senior).
2. Vercel-Dashboard: zwei Projekte, jedes mit Root Directory auf den App-Ordner:
   - Projekt `adhs-versorgung`: Root Directory = `app-adhs/`
   - Projekt `fit-senior`: Root Directory = `app-fit-senior/`
   - Beides: "Include source files outside of the Root Directory" aktivieren
     (sonst fehlt `kern/` — Vite-Alias zeigt auf `../kern/src/index.ts`)
   - Vercel erkennt Vite automatisch, baut `npm run build`, Output `dist/`
   - Die `vercel.json` in den App-Ordnern greifen und setzen die Header
3. Erst dann inhaltlich weiter (siehe die NEXT.md der beiden Aeste).

## Aufpassen
- Keine `Co-Authored-By:`-Zeile in Commits - Vercel Hobby blockt sonst.
- Kern-Aenderungen wirken sofort in beiden Apps. Nach jeder Kern-Aenderung `npm run smoke`.
