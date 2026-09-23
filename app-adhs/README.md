# ADHS-Versorgung

PWA für den Ergänzungsteil des ADHS-Support-Tools: Check-in, Ernährung (Bausteine statt Kalorien), Einnahmen,
Versuche (wechsel / vorher_nachher), Laborwerte in drei Stufen, Stoffdatenbank mit Labor-Tor.
Beratend, nicht diagnostisch. Alle Daten bleiben im Browser (localStorage), kein Backend, keine Cloud.

Stack: React 19, Vite, TypeScript, Tailwind, vite-plugin-pwa. Gehostet auf Vercel (Hobby), verbunden mit dem
GitHub-Repo: jeder Push auf `main` deployt. Konfiguration in `vercel.json`.

## Entwickeln
```
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/
npm run preview
```

## Stoffdatenbank
Quelle ist `psychologie-tool/module_versorgung/stoffe.yaml`. Kopie liegt in `data/stoffe.yaml`;
`npm run stoffe` erzeugt daraus `src/data/stoffe.json`. Nach jeder Änderung der YAML: kopieren, `npm run stoffe`, committen.

## Daten
Datenvertrag = `psychologie-tool/DATENMODELL.md` (schema_version 1). Export unter „Daten" als
`*.jsonl` je Sammlung (eintraege, einnahmen, versuche, tests, mahlzeiten) – die Dateien lassen sich
im Python-Tool an `daten/*.jsonl` anhängen. Import ergänzt, überschreibt nicht.
Neu gegenüber dem Python-Tool: `mahlzeiten` (Bausteine, Pflanzen, Notiz).

## Deploy
Repo `adhs-versorgung` auf GitHub anlegen, Code pushen, in Vercel „Import Project" → Framework Vite,
Build `npm run build`, Output `dist`. Keine `Co-Authored-By:`-Zeile in Commits (Vercel Hobby blockt sonst).
