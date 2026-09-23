---
schirm: eigenstaendig
titel: "Versorgung (Monorepo: ADHS-Versorgung + Fit Senior)"
status: "🟢"
status_grund: Monorepo am 07.09. aufgebaut, gemeinsamer Kern extrahiert, beide Apps bauen und laufen (Smoke-Test gruen). Noch nicht deployt, noch kein GitHub-Repo.
naechste_aktion: GitHub-Repo versorgung anlegen und pushen · in Vercel zwei Projekte anlegen (Root Directory app-adhs bzw. app-fit-senior, "Include source files outside of the Root Directory" aktivieren)
wartet_auf: martin
deadline: null
letzte_aenderung: 2026-09-07
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
1. GitHub-Repo `versorgung` anlegen, pushen.
2. Vercel: zwei Projekte auf dasselbe Repo. Wichtig - ohne "Include source files outside of the
   Root Directory" fehlt `kern/` und der Build bricht ab.
3. Erst dann inhaltlich weiter (siehe die NEXT.md der beiden Aeste).

## Aufpassen
- Keine `Co-Authored-By:`-Zeile in Commits - Vercel Hobby blockt sonst.
- Kern-Aenderungen wirken sofort in beiden Apps. Nach jeder Kern-Aenderung `npm run smoke`.
