# Konzept: Messen, Koppeln, Auswerten

Stand 21.09.2026 · betrifft ADHS-Versorgung, Entwurf zur Abstimmung

Die App kann inzwischen messen. Was fehlt, ist die Verabredung, **wie** gemessen wird und
**wie die Quellen zusammenkommen** — und zwar bevor Daten entstehen. Ein paar der Festlegungen
hier lassen sich später nicht mehr reparieren: Wer eine Nacht dem falschen Tag zuordnet, merkt
das erst nach Monaten, und dann sind alle Auswertungen um einen Tag verschoben.

---

## 1. Das Kopplungsproblem

Die Quellen haben unterschiedliche Zeitbezüge. Das ist der Kern der Sache:

| Quelle | Zeitbezug | Wie oft |
|---|---|---|
| Check-in | Tag | 1× täglich |
| HRV-Messung (Gurt) | Zeitpunkt | 1× täglich, manchmal öfter |
| Atemübung | Zeitpunkt | unregelmäßig |
| Mahlzeit | Zeitpunkt | mehrmals täglich |
| Einnahme | Zeitraum (von–bis) | Dauerzustand |
| Versuchsphase | Zeitraum | Dauerzustand |
| Schlaf, Ruhepuls (Band) | **Nacht** | 1× täglich |
| Labor | Zeitpunkt | alle paar Monate |

### Festlegung 1: Die Analyse-Einheit ist der Tag

Alles wird auf Kalendertage projiziert. Feiner aufzulösen bringt nichts, solange die Hälfte
der Quellen nur täglich vorliegt — und gröber verschenkt die Tagesdynamik.

### Festlegung 2: Eine Nacht gehört zum Aufwachtag

Schlaf von Montag 23:00 bis Dienstag 6:30 zählt zu **Dienstag**.

Begründung: Die Morgenmessung am Dienstag beschreibt den Zustand nach genau dieser Nacht.
Beide gehören zusammen, also müssen sie demselben Tag zugeordnet sein. Die Alternative
(Einschlaftag) würde Schlaf und die dazugehörige HRV-Messung auseinanderreißen.

**Folge für den Import:** Der Band-Export liefert Schlafphasen mit Anfangszeit. Beim Einlesen
muss das Datum auf den Aufwachtag umgerechnet werden — nicht einfach das Startdatum übernehmen.
Das ist die häufigste stille Fehlerquelle bei Schlafdaten.

### Festlegung 3: Die Morgenmessung ist der Anker

Von allen Werten ist die HRV am Morgen der am besten vergleichbare: nüchtern, vor Kaffee,
vor Aufregung, immer im selben Zustand. Alles andere im Tag wird dagegen gelesen.

Deshalb: **HRV morgens, im Bett, vor dem Aufstehen, 2–3 Minuten.** Immer gleich, sonst
misst man den Unterschied zwischen den Messbedingungen statt den zwischen den Tagen.

### Festlegung 4: Dauerzustände werden auf Tage aufgelöst

Einnahmen und Versuchsphasen sind Zeiträume. Für die Auswertung wird pro Tag abgeleitet:
lief an diesem Tag Phase „mit" oder „ohne", welche Stoffe liefen. Das ist reine Rechnung,
keine Erfassung.

---

## 2. Das Aufzeichnungsproblem

Hier entscheidet sich, ob überhaupt etwas auszuwerten ist. Die unbequeme Wahrheit:

> Eine Messgröße, die nicht fast täglich erfasst wird, lässt sich nicht auswerten.
> Und Lücken sind nicht neutral: Wer an schlechten Tagen seltener einträgt,
> verzerrt das Ergebnis in eine bestimmte Richtung.

Der zweite Satz ist bei ADHS der wichtigere. Gerade an den Tagen, an denen wenig geht,
wird nichts eingetragen — und genau diese Tage fehlen dann in der Statistik.

### Das Rückgrat: drei Dinge, jeden Tag

| Wann | Was | Dauer |
|---|---|---|
| Morgens im Bett | HRV messen | 2–3 Min |
| Abends | Check-in: die Messgrößen des laufenden Versuchs | unter 1 Min |
| Abends | Störgrößen: Alkohol, krank, ungewöhnliche Belastung | 3 Tipper |

Mehr nicht. Essen, Labor, Atemübungen sind Kür — wertvoll, aber sie tragen keine Auswertung.

### Störgrößen sind nicht optional

Alkohol senkt die HRV deutlich, teils über zwei Nächte. Eine Infektion ebenso. Ein harter
Trainingstag auch. Wer das nicht miterfasst, sieht in den Daten Rauschen statt Wirkung —
und hält das Rauschen womöglich für die Wirkung des Supplements.

Das ist billig zu erfassen (drei Ja/Nein-Fragen) und macht den Unterschied zwischen
auswertbar und nicht auswertbar.

### Was tun, wenn ein Tag fehlt?

Nicht nachtragen, nicht schätzen. Ein fehlender Tag wird als fehlend behandelt und fällt
aus der Auswertung. Nachgetragene Erinnerungen sind schlechter als gar keine Daten, weil
sie echt aussehen.

Die App sollte allerdings zeigen, **wie vollständig** eine Versuchsphase erfasst ist.
Bei unter etwa zwei Dritteln erfasster Tage ist eine Auswertung nicht belastbar.

---

## 3. Das Auswertungsproblem

### Festlegung 5: Die Messgröße wird vorher festgelegt

Beim Anlegen eines Versuchs steht fest, welche Zahl entscheidet — im Datenmodell ist das
`messgroessen`. Wer hinterher aussucht, welche Größe am besten passt, findet immer etwas.
Das ist der häufigste Selbstbetrug bei Selbstversuchen.

Ebenso gilt weiterhin `bewertung_erst_nach_abschluss`.

### Festlegung 6: Die ersten Tage jeder Phase zählen nicht

Magnesium wirkt nicht über Nacht, und es ist nach dem Absetzen nicht sofort weg.
**Vorschlag: die ersten 5 Tage jeder Phase verwerfen** (Anflutung beziehungsweise Auswaschen).
Für andere Stoffe kann das anders sein; die Zahl gehört pro Versuch einstellbar.

### Festlegung 7: Mehrere Wechsel, nicht einer

Einmal „mit" gegen einmal „ohne" ist wertlos — dazwischen liegt zu viel anderes Leben.
Erst der wiederholte Wechsel (mit-ohne-mit-ohne) trennt Wirkung von Zufall.

**Realistische Größenordnung:** 14 Tage je Phase, 4 Phasen. Davon je 5 Tage Anflutung ab,
bleiben 9 wertbare Tage pro Phase, 18 je Bedingung. **Ein Versuch dauert damit acht Wochen.**

Das ist die ehrliche Zahl. Kürzer geht, aber dann ist das Ergebnis eine Vermutung,
keine Antwort.

### Festlegung 8: Der Maßstab ist die eigene Streuung

Bei einer einzelnen Person ist „statistisch signifikant" irreführend. Sinnvoll ist die Frage:
**Ist der Unterschied größer als das, was ohnehin von Tag zu Tag schwankt?**

Dafür gibt es die Rechnung schon — `vergleicheMitVorgeschichte` misst eine Abweichung in
Standardabweichungen der eigenen Messreihe. Als Faustregel:

- unter 1 Standardabweichung → kein erkennbarer Effekt
- 1 bis 2 → möglicher Effekt, weiterbeobachten
- über 2 → deutlicher Effekt

Diese Schwellen sind eine Konvention, kein Naturgesetz. Sie sollen verhindern, dass jede
zufällige Schwankung als Wirkung gelesen wird.

### Was die App nicht tun sollte

Kein Urteil in „wirkt" oder „wirkt nicht". Sie zeigt die beiden Verteilungen, die Differenz,
die Streuung und die Vollständigkeit der Erfassung. Die Schlussfolgerung zieht der Mensch —
und bei allem, was Behandlung betrifft, die Ärztin.

---

## 4. Was daraus für die App folgt

In der Reihenfolge, in der es gebaut werden sollte:

1. **Störgrößen ins Check-in** (Alkohol, krank, Belastung). Drei Tipper. Ohne sie ist alles
   Weitere weniger wert. — *klein, sofort machbar*
2. **Tagesbild**: eine Funktion, die für einen Tag alle Quellen zusammenführt (HRV, Check-in,
   Schlaf, laufende Phase, Störgrößen). Das ist das Herzstück der Kopplung. — *Kern*
3. **Versuchsauswertung gegen HRV**: Mit- gegen Ohne-Phasen, Anflutung abgezogen,
   Effekt in eigener Streuung, dazu die Erfassungsquote. — *Kern*
4. **Import der Band-Daten** mit der Aufwachtag-Regel. — *wartet auf eine Beispieldatei*
5. **Erfassungsquote sichtbar machen**, solange ein Versuch läuft. Wer sieht, dass ihm
   drei Tage fehlen, trägt den vierten eher ein.

---

## Offen — braucht Martins Entscheidung

- **Wie viel ist an einem schlechten Tag realistisch?** Das Rückgrat oben kostet etwa vier
  Minuten täglich. Wenn das an schlechten Tagen nicht passiert, muss es kleiner werden —
  lieber ein Rückgrat, das wirklich jeden Tag steht, als eines, das die Hälfte der Tage fehlt.
- **Welche Frage zuerst?** In der NEXT.md steht V001 Magnesium. Ein Versuch zur Zeit;
  zwei parallel machen beide unauswertbar.
- **Anflutungszeit von 5 Tagen** — bei Magnesium plausibel, aber nicht belegt. ZU PRÜFEN.

## Ungeprüft

Die Schwellen in Festlegung 8 und die 5 Tage in Festlegung 6 sind begründete Konventionen,
keine Leitlinienwerte. Wer das Ergebnis jemandem vorlegt, muss das dazusagen.
