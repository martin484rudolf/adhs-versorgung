---
schirm: eigenstaendig
titel: "Versorgung (Monorepo: ADHS-Versorgung + Fit Senior)"
status: "🟢"
status_grund: Monorepo gebaut, beide Apps laufen (271 Tests in 800volt-Parallele, hier: 18 Puls-Tests + Build grün). Vercel-Deploy der PR-Branch-Deploys schlug fehl — Ursache: README beschrieb CLI-Workflow (--local-config), der bei Git-Integration nicht greift. Fix in Arbeit (Root-vercel.json + README-Korrektur).
naechste_aktion: PR #1 reviewen und mergen · danach Vercel-Projekt-Einstellungen prüfen (Build/Output: build:adhs→app-adhs/dist, build:senior→app-fit-senior/dist, Root Directory=/) · Sicherheits-Header in Projekt-Einstellungen eintragen · Smoke-Test lokal (Chromium fehlt in Sandbox)
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
2. Vercel: zwei Projekte auf dasselbe Repo, Root Directory = `/` (Repo-Wurzel).
   Build/Output in den Projekt-Einstellungen: `build:adhs` → `app-adhs/dist`,
   `build:senior` → `app-fit-senior/dist`. Ohne Wurzel als Root Directory fehlt
   `kern/` und der Build bricht ab.
3. Sicherheits-Header (noindex etc.) in den Projekt-Einstellungen unter
   Settings → Headers eintragen — die App-vercel.json greifen bei Root-Deploy nicht.
4. Erst dann inhaltlich weiter (siehe die NEXT.md der beiden Aeste).

## Aufpassen
- Keine `Co-Authored-By:`-Zeile in Commits - Vercel Hobby blockt sonst.
- Kern-Aenderungen wirken sofort in beiden Apps. Nach jeder Kern-Aenderung `npm run smoke`.
