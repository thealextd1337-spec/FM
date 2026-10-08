# Taktikspalte und Wettbewerbsvorschau v128

Stand: 5. Oktober 2026. Lokal umgesetzt, nicht veröffentlicht. Veröffentlichungsnummer im Seitenfuß bleibt 106.

## Sichtbare Änderungen

- In der bearbeitbaren Spielpause stehen Aufstellung beziehungsweise Teamtaktik im Querformat oben rechts neben dem Feld. Individuelle Ausrichtung, Spielanweisungen und Positionstausch liegen direkt beim gewählten Feldspieler. Ersatzbank bleibt unter dem Feld; Spielstatistik folgt darunter.
- Auf schmalem Hochformat folgen die Bedienfelder weiterhin nach Feld und Bank. Kleine Querformatansichten verwenden eine schmalere Spalte, lesbare Ausrichtungsknöpfe und Teamtaktik in einer Spalte.
- Die nächste Gegner-Vorschau nennt für beide Vereine den aktuellen Platz aus der Tabelle des gespielten Wettbewerbs: nationale Liga oder Europacup-Ligaphase. Bei Pokal- und Europacup-K.-o.-Spielen steht stattdessen die Runde. Keine fremde Ligaplatzierung wird als Pokaltabelle ausgegeben.
- [Mentale Fähigkeiten](mentale-faehigkeiten-plan.md) sind als Entwurf dokumentiert: Ruhe, Antizipation und Entscheidungen mit getrennten Zuständigkeiten. Diese Fähigkeiten sind noch nicht eingebaut.

## Umsetzung

`dist/world-physical-v65.js` gruppiert das Pausenfeld und verschiebt die vorhandenen Reiter und Bedienfelder in dessen rechte Spalte. Beim Fortsetzen kehren dieselben Elemente in ihre bisherige Umgebung zurück. Die bestehenden Ereignishandler bleiben zuständig; keine zweite Auswahl oder kopierte Bedienelemente.

`dist/world-start-v61.css` definiert die responsive Anordnung nach den bestehenden Feld-Breakpoints. `dist/world-competition-v62.js` verwendet die gleiche Tabellenberechnung und Teilnehmerauswahl wie die Wettbewerbstabelle. Bestehende Übersetzungen für Platz und Runde werden weiterverwendet.

Keine Matchregel, Spielerfähigkeit, Statistik oder Speicherung geändert. Historische Partien werden nicht nachgerechnet. Keine Meshy-Aufträge, Credits oder Veröffentlichung.

## Prüfung

- [Layoutprüfung](../outputs/pause-layout-qa-v128.json): 1632×956, 844×390, 667×375 und 390×844. Querformatspalte am oberen Feldrand; Hochformat darunter; kein Überlauf der Spielfeld-/Taktikfläche. Individuelle Ausrichtung, Anweisung, Rückgängig, Teamtaktik, DE/EN, tatsächliches Fortsetzen, erneutes Öffnen und Feldspielerauswahl geprüft. Während der Bearbeitung bleiben Spielzeit und Ergebnis gleich.
- [Vorschauprüfung](../outputs/preview-standing-qa-v128.json): Desktop und Mobil, DE/EN; Ränge vor dem ersten Ergebnis und nach Resultaten mit der regulären Tabelle abgeglichen; Europacup verwendet seine zwölf Teilnehmer statt der nationalen Liga. Viertelfinale, Halbfinale und Finale geprüft. Rendern verändert den Spielstand nicht.
- Bestehende Raster-, Spieleranweisungs- und Übersetzungstests erfolgreich. Der ältere physische Anweisungstest benötigt im isolierten VM-Test den inaktiven Weltadapter-Schalter; `run-instruction-regression-v128.cjs` ergänzt ausschließlich diesen Testkontext und behält alle Assertions und aktuellen Produktionsquellen. Der unangepasste Test brach vorher mit fehlendem `v65WorldActive` ab.
- Regulären Offline-Build neu erzeugt; Quellmodule sind enthalten und `outputs/index.html` entspricht der Einzeldatei. Keine neue vollständige Match- oder Balanceprüfung: Die Änderung betrifft Darstellung und reine Tabellenabfrage.

Separater Befund: Im schmalen Hochformat meldet die Pausen-Kopfzeile einen horizontalen Textüberlauf. Die Messdaten trennen diesen Kopfzeilenbefund von der geprüften Feld-/Taktikfläche. Dies wurde in diesem Layoutblock nicht verändert.

## Ansichten und Dateien

- [Desktop-Taktikpause](../outputs/pause-layout-1632-de-v128.png)
- [Mobiles Querformat](../outputs/pause-layout-667-de-v128.png)
- [Mobile Wettbewerbsvorschau](../outputs/preview-standing-390-de-v128.png)
- [Layouttest](../work/check-pause-layout-v128.cjs), [Vorschaustest](../work/check-preview-standing-v128.cjs), [physischer Regressionsadapter](../work/run-instruction-regression-v128.cjs)
- [Lokale Browserdatei](../outputs/Doppel-6-Fussballmanager.html)
