# Fit Senior

Der zweite Ast am Versorgungs-Baum: dieselbe Basis wie ADHS-Versorgung, zugeschnitten auf
ältere Menschen. Läuft im Browser, alles bleibt auf dem Gerät.

## Für wen

Primär für die ältere Person selbst – große Schrift, große Knöpfe, wenige Fragen, alles freiwillig.
Groß ist die Voreinstellung; wer kleiner will, stellt oben rechts um.

Dazu die Schnittstelle zur Absprache: unter *Hilfe → Zum Weitergeben* entsteht aus den eingetragenen
Bedarfen eine Textseite für das Gespräch mit den Kindern, dem Hausarzt oder beim Termin des
Medizinischen Dienstes. Sie verlässt das Gerät nur, wenn die Person die Datei selbst weitergibt.

## Was drin ist

| Bildschirm | Wofür |
|---|---|
| **Start** | Gläser direkt zählen, dazu höchstens drei Vorschläge. Von hier geht jeder Weg genau eine Ebene tief. |
| **Wie war der Tag?** | Draußen gewesen, jemanden gesprochen, gestürzt, Schmerzen, Gewicht. Alles freiwillig, alles speichert sofort. |
| **Essen** | Mahlzeit antippen statt wiegen. Eiweiß über den Tag, Trinken, Pflanzliches, Essenslücken. |
| **Werte** | Blutbefund abtippen, Einordnung in MANGEL / grau / normal – Orientierung, kein Befund. |
| **Hilfe** | Was ich brauche (Bedarfe nach Bereichen) und was es gibt (Leistungen, Antragsstand). |
| **Daten** | Sichern, zurückholen, löschen. JSONL nach dem gemeinsamen Datenvertrag. |

## Der Ton ist Teil der Funktion

Die App ist eine **Erinnerung, keine Kontrolle**. Sie zählt nicht auf, was gefehlt hat, sondern
schlägt vor, was jetzt gut wäre – Maßstab ist der Zettel am Kühlschrank, nicht der Prüfbericht.
Wer sich kontrolliert fühlt, hört auf zu tippen, und dann nützt die beste Auswertung nichts.

Deshalb: kein „erst drei Gläser", kein „kein Eiweiß dabei", keine Note unter der Mahlzeit,
kein Rot außer beim Sturz. Und die App meldet nichts an Dritte – sie ist kein Berichtsweg.

## Woran sich der Zuschnitt entscheidet

Im Alter kippt selten alles auf einmal – es kippt leise. Zu wenig getrunken, zu wenig Eiweiß,
seltener rausgegangen, niemanden gesprochen, unbemerkt Gewicht verloren. Genau diese Dinge fragt
die App, und sonst nichts. Jede weitere Frage kostet Einträge.

Gegenüber der ADHS-App fällt weg: Koffein-Timing, Stimmungsfilter, Reizlast, RSD.
Dazu kommt: Trinkmenge, Sturz, Gewichtsverlauf, Bedarfe, Leistungen.

## Noch offen

- **Leistungsdaten sind ungeprüft** (`src/data/leistungen.ts`). Grundwissen, keine Rechtsauskunft;
  Beträge stehen bewusst nirgends. Vor ernsthaftem Gebrauch gegen SGB XI / SGB V und die Seiten
  der Pflegekassen verifizieren.
- **Labor-Schwellen** (`src/data/labor.ts`) gegen eine benannte Leitlinie absichern.
- Eigene Icons – aktuell die der ADHS-App als Platzhalter.
- Medikationsplan (Polypharmazie) ist bewusst nicht drin; wäre der nächste große Baustein.

Entwickelt wird aus dem Repo-Root: `npm run dev:senior`.
