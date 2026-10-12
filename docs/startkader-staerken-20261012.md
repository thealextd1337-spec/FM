# Neue Startkader: Verteilung und Abnahme

Nutzerauftrag vom 12. Oktober 2026: zuerst messen, dann die Zielkurve festlegen; ausschließlich Startkader, keine Jugendspieler aus dem Jugendpool.

## Prüfstand

30 reproduzierbare native Welten mit je 192 Vereinen (96 Ligavereine und 96 reine Pokalvereine), insgesamt 63.360 Startkaderspieler. Junge vertraglich gebundene Spieler in den Startkadern zählen dazu. Jugendpool, freie Spieler, Entwicklung, Transfers und Folgesaisons sind ausgeschlossen. Beste spielbare Position nach gespeicherten Grundfähigkeiten; Elite-Regel und Farbklassifikation aus dem Produktionscode. Keine Talent- oder Potenzialauswertung. Quellhashes, Seeds, Gruppen und interne Histogramme stehen in [measurement.json](../outputs/start-roster-strength/measurement.json); [interaktive Auswertung](../outputs/start-roster-strength/report.html).

## Ergebnis

| Farbstufe | Ligavereine | Reine Pokalvereine |
| --- | ---: | ---: |
| Sehr schwach | 1,70 % | 100,00 % |
| Schwach | 35,81 % | 0,00 % |
| Durchschnittlich | 46,27 % | 0,00 % |
| Gut | 13,70 % | 0,00 % |
| Sehr gut | 2,53 % | 0,00 % |

Elite: **2,53 %** bei Ligavereinen (800/31680), **0,00 %** bei reinen Pokalvereinen (0/31680). Je Welt schwankt der Ligaanteil von 1,70 % bis 3,31 %. Die schwachen und durchschnittlichen Farbstufen bilden gemeinsam 82,07 % der Ligastartkader.

77,85 % der Ligakader starten ohne Elite-Spieler. Die größte beobachtete Konzentration liegt bei 3 Elite-Spielern in einem Kader mit 11 Spielern (Irwell FC). Die Obergrenzen gelten bereits in der Erzeugung: höchstens drei Elite-Spieler bei A-Spitzenvereinen, höchstens zwei bei allen anderen. Die Stichprobe prüft diese Grenzen; die weltweit gemessene Häufigkeit ist weiterhin keine feste Spielerquote.

## Umsetzung

Auf Nutzerauftrag lokal umgesetzt: strikte Ligaabstufung für Kader und beste Startelf, Überschneidung ab Platz drei, gespeicherte Variation der gesamten Kaderqualität um höchstens ±2,5 Prozent, Elite-Obergrenzen, Altersmix, zwei Torhüter und je drei Spieler pro Feldposition, passende Startschwerpunkte und sportliche Transferpräferenz. [Regeln und vollständige Nachweise](startkader-umsetzung-v177.md). Veröffentlichung steht aus.

## Reproduktion und Nachweis

Im Produktionscheckout:

```powershell
node work/test-start-roster-strength.cjs
node work/measure-start-roster-strength.cjs --worlds=30
node work/render-start-roster-strength.cjs
```

Fünf fokussierte Messprüfungen: native Farb-/Elite-Grenzen, beste spielbare Nebenposition, Unabhängigkeit von Form/Frische/Talent/Potenzial, reine Startkaderzählung ohne Zustandsänderung, Ausschluss gespielter Welten/doppelter IDs/Poolüberschneidung. Alle 30 nativen Welten werden validiert; die erste Welt wird mit demselben Seed erneut erzeugt und vollständig verglichen. Produktquellen werden vor und nach dem Lauf per SHA-256 verglichen. Neue Erzeugung und Wechselpräferenz sind im lokalen Build umgesetzt; bestehende Welten bleiben unverändert.
