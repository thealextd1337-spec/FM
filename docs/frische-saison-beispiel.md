# Frische über eine Saison – Rechenbeispiel

Stand: 6. Oktober 2026. Illustratives Rechenmodell des geplanten Müdigkeitssystems, keine Auswertung der aktuellen Produktengine und kein vorhandener Spielstand. Kalender und Spielerbelastung sind konstruiert. Offene Modellwerte werden durch diese Rechnung nicht bestätigt.

Historische Referenz: Die hier angenommenen +15 nach Abpfiff und konstanten +7,5 pro Ruhetag wurden inzwischen durch einmalig +10 nach Abpfiff und +3 plus 25 Prozent der fehlenden Frische je vollem spielfreien Tag ersetzt. Die aktuelle Rechnung steht im [Erholungsvergleich](frische-erholung-vergleich.md); die ursprünglichen Vergleichswerte bleiben hier erhalten.

## Modellannahmen

- Derselbe Referenz-Feldspieler spielt jede ausgewählte Partie volle 90 Minuten mit gleicher Belastung. Keine Entwicklung der Kondition während dieses Vergleichs.
- Verbrauch 35 Frischepunkte je Halbzeit ist eine Arbeitsannahme, keine allgemeine festgelegte Verbrauchsformel.
- Halbzeiterholung einmalig +10, höchstens bis 100: bestätigt.
- Direkte Nachspielerholung +15: bislang unbestätigter Vorschlag.
- Jeder volle spielfreie Tag bringt +7,5, höchstens bis 100: Arbeitsannahme. Spieltage erhalten keinen zusätzlichen Tagesbonus. Aus 100 werden nach einem vollen Match 55; sechs volle Ruhetage stellen 100 wieder her. Bei bereits müdem Matchbeginn kann die gesamte Erholung länger dauern.
- Kein Europacup: zehn Ligapartien und drei Pokalpartien bis ins Finale. Mit Europacup: zusätzlich vier Ligaphasen-, zwei Viertelfinal-, zwei Halbfinal- und eine Finalpartie, insgesamt 22. Beide Vereine erreichen das nationale Finale; das Europacupteam erreicht zusätzlich das Europacupfinale.
- Liga am Samstag, Pokal und Europacup am Mittwoch, nie beide in derselben Kalenderwoche; mindestens zwei volle spielfreie Tage zwischen Vereinsmatchs. Saison August bis März.
- Optionaler dritter Vergleich: der Spieler pausiert vor Anpfiff bei Frische unter 70. An einem ausgesetzten Spieltag wird einmal +7,5 als voller Ruhetag angenommen, keine Halbzeit- oder Nachspielgutschrift. Diese Schwelle und Bankregel sind nicht als Produktregel beschlossen.

## Ergebnisse

| Szenario | Einsätze / Minuten | Niedrigste Frische bei Anpfiff | Niedrigste Frische bei Abpfiff | Starts unter 70 | Frische am 31. März |
| --- | ---: | ---: | ---: | ---: | ---: |
| Ohne Europacup | 13 / 1170 | 77,5 | 17,5 | 0 | 100 |
| Mit Europacup, alle Spiele | 22 / 1980 | 37,5 | 0 | 3 | 30 |
| Mit Europacup, Rotation unter 70 | 21 / 1890 | 70 | 10 | 0 | 47,5 |

## Jede Partie

Zellen enthalten **Anpfiff / Abpfiff vor Nachspielerholung / nach angenommener +15-Erholung**. Der Halbzeitsprung beträgt bei jedem Einsatz einmal +10 bis maximal 100. Detaillierte Halbzeitwerte stehen in den verknüpften CSV-/JSON-Daten.

| Datum | Partie | Ohne Europacup | Mit Europacup, alle Spiele | Mit Europacup, Rotation |
| --- | --- | ---: | ---: | ---: |
| 2027-08-14 | Liga 1 | 100 / 40 / 55 | 100 / 40 / 55 | 100 / 40 / 55 |
| 2027-08-28 | Liga 2 | 100 / 40 / 55 | 100 / 40 / 55 | 100 / 40 / 55 |
| 2027-09-08 | Pokal Viertelfinale | 100 / 40 / 55 | 100 / 40 / 55 | 100 / 40 / 55 |
| 2027-09-18 | Liga 3 | 100 / 40 / 55 | 100 / 40 / 55 | 100 / 40 / 55 |
| 2027-10-09 | Liga 4 | 100 / 40 / 55 | 100 / 40 / 55 | 100 / 40 / 55 |
| 2027-10-13 | Europacup Ligaphase 1 | – | 77,5 / 17,5 / 32,5 | 77,5 / 17,5 / 32,5 |
| 2027-11-03 | Pokal Halbfinale | 100 / 40 / 55 | 100 / 40 / 55 | 100 / 40 / 55 |
| 2027-11-10 | Europacup Ligaphase 2 | – | 100 / 40 / 55 | 100 / 40 / 55 |
| 2027-11-13 | Liga 5 | 100 / 40 / 55 | 70 / 10 / 25 | 70 / 10 / 25 |
| 2027-12-04 | Liga 6 | 100 / 40 / 55 | 100 / 40 / 55 | 100 / 40 / 55 |
| 2027-12-08 | Europacup Ligaphase 3 | – | 77,5 / 17,5 / 32,5 | 77,5 / 17,5 / 32,5 |
| 2028-01-15 | Liga 7 | 100 / 40 / 55 | 100 / 40 / 55 | 100 / 40 / 55 |
| 2028-01-19 | Europacup Ligaphase 4 | – | 77,5 / 17,5 / 32,5 | 77,5 / 17,5 / 32,5 |
| 2028-02-09 | Europacup Viertelfinale Hinspiel | – | 100 / 40 / 55 | 100 / 40 / 55 |
| 2028-02-12 | Liga 8 | 100 / 40 / 55 | 70 / 10 / 25 | 70 / 10 / 25 |
| 2028-02-23 | Europacup Viertelfinale Rückspiel | – | 100 / 40 / 55 | 100 / 40 / 55 |
| 2028-03-04 | Liga 9 | 100 / 40 / 55 | 100 / 40 / 55 | 100 / 40 / 55 |
| 2028-03-08 | Europacup Halbfinale Hinspiel | – | 77,5 / 17,5 / 32,5 | 77,5 / 17,5 / 32,5 |
| 2028-03-15 | Europacup Halbfinale Rückspiel | – | 77,5 / 17,5 / 32,5 | 77,5 / 17,5 / 32,5 |
| 2028-03-18 | Liga 10 | 100 / 40 / 55 | 47,5 / 0 / 15 | 47,5 / kein Einsatz / 55 |
| 2028-03-22 | Pokal Finale | 77,5 / 17,5 / 32,5 | 37,5 / 0 / 15 | 77,5 / 17,5 / 32,5 |
| 2028-03-29 | Europacup Finale | – | 60 / 0 / 15 | 77,5 / 17,5 / 32,5 |

## Einordnung und Grenzen

Ohne Europacup gleichen lange Abstände zwischen den meisten Partien den Verlust aus. Trotzdem startet der Spieler vor dem Pokalfinale nach einer engen Ligaspiel-/Pokalfolge mit weniger als 100. Mit Europacup entstehen mehrere belastete Wochen; im März führt jede Partie ohne Rotation zu deutlich schlechterem Zustand. Das Modell zeigt eine Belastungsspitze statt eines gleichmäßigen Abfalls während aller acht Monate.

Ein volles Match aus 100 läuft als 100 beim Anpfiff, 65 vor Halbzeit, 75 nach Halbzeit, 40 bei Abpfiff und 55 nach angenommener erster Erholung. Bei Abpfiff mit Frische 40 beträgt der bestätigte technische Müdigkeitsabzug 6,4 Prozent, bei Zweikampf/Luftspiel 9,6 Prozent und bei Ruhe 12,8 Prozent unter tatsächlichem Druck. Ab Frische 30 gelten die bestätigten Maxima dieser Kurven. Diese Zahlen sind Abschwächungen wirksamer Werte, keine unmittelbaren Fehlerquoten.

Verbrauch hängt in der späteren Umsetzung von Kondition, Einsatzzeit und abgestimmter Belastung ab. Hier bleibt er bewusst konstant, um ausschließlich den Kalendervergleich sichtbar zu machen. Die Untergrenze 0 begrenzt die rechnerische Belastung; eine Partie trotz Erschöpfung wird im Rechenmodell nicht automatisch abgebrochen. Kein medizinisches Modell, keine Verletzungs- oder Zwangsauswechselregel.

Die Rotation unter 70 vermeidet im Beispiel einen Einsatz am 18. März; das ist eine illustrative Trainerentscheidung, kein Beweis für die optimale Rotationsstrategie. Anderer Verbrauch, andere Regeneration, andere Pokalverläufe und andere zulässige Kalender ändern das Ergebnis. +15 nach Abpfiff und +7,5 je vollem Ruhetag müssen noch abgestimmt werden.

## Nachweise

- [Vollständige Werte und Modellannahmen](../outputs/freshness-season-proposal-2026-10-06/results.json).
- [Alle Match- und Halbzeitwerte als CSV](../outputs/freshness-season-proposal-2026-10-06/matches.csv).
- [Reproduzierbare Rechnung](../work/simulate-freshness-season-proposal-2026-10-06.cjs).
- [Müdigkeitsplan](muedigkeit-faehigkeiten-plan.md), [Produktregeln und Kalender](product.md).

Die Rechnung prüft Wettbewerbsmengen, Wochentage, Mindestabstände, getrennte Pokal-/Europacupwochen, Frischegrenzen und Halbzeiterholung. Keine Laufzeitänderung, Veröffentlichung oder Anpassung alter Spielstände.
