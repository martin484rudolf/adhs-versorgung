---
schirm: eigenstaendig
titel: "ADHS-Versorgung (PWA / Vercel)"
status: "🟢"
status_grund: v0.1 gebaut und getestet 06.09. - Heute (Versuch, Check-in, Mahlzeit), Essen (Woche, Pflanzenvielfalt, 3-Tage-Export), Einnahmen + Versuche, Labor (Dreistufen), Stoffe mit Stimmungsfilter und Labor-Tor, Daten (JSONL-Export/Import). Noch nicht deployt.
naechste_aktion: GitHub-Repo adhs-versorgung anlegen, pushen, in Vercel importieren (Vite, dist) · V001 Magnesium ab 07.09. in der App anlegen (oder versuche.jsonl aus dem Python-Tool importieren) · Ernaehrungstagebuch 3 Tage fuer InnerBuddies rekonstruieren
wartet_auf: martin
deadline: null
letzte_aenderung: 2026-09-06
meta: "React 19 · Vite · Tailwind · PWA · localStorage · Datenvertrag psychologie-tool · beratend, nicht diagnostisch"
tags: [eigenstaendig, app, react, pwa, vercel, adhs, versorgung, ernaehrung, lokal-first]
---

# ADHS-Versorgung (PWA)

Vercel-Version des Moduls versorgung (psychologie-tool/module_versorgung). Gleiche Daten, gleicher Vertrag, im Browser.

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
- HRV aus Neuro-Fit als hrv-session importieren; Auswertung der Versuche gegen HRV.
- Foto optional an Mahlzeit (nur lokal).

## Verweise
- Eltern: Code Projekte · Familie: psychologie-tool/module_versorgung (Python, gleiche Daten), neurodivers (docs/Studienlage, Lancet-PDF), Neuro-Fit
- Muster: Zustaendigkeitskarte (PWA auf Vercel), E-Auto-Rechner
