# Einheitliche Spielvorbereitung und Torwart-Handhaltung v129

Lokal umgesetzt am 5. Oktober 2026. Der reguläre [Offline-Build](../outputs/Doppel-6-Fussballmanager.html) enthält die Änderungen. Nicht veröffentlicht; der veröffentlichte Versionsfuß bleibt 106. Vor dem Neuladen eine laufende Karriere speichern.

## Sichtbare Änderungen

- Gegner-Vorschau, Spielvorbereitung und Live-Match setzen den aktuellen Tabellenplatz direkt hinter den Namen: `Madrid Central CF (1.)`. Liga und Europacup-Ligaphase verwenden dieselbe Berechnung für den tatsächlich gespielten Wettbewerb. K.-o.-Partien erhalten keinen erfundenen Tabellenplatz.
- Spieltag beziehungsweise Viertelfinale, Halbfinale oder Finale stehen oben in der Gegner-Vorschau und der Spielvorbereitung. Die Runde wird nicht mehr unter beiden Vereinsnamen wiederholt. Eine Finalvorschau zeigt den großen Pokal des entsprechenden Landes beziehungsweise des Europacups.
- Vorbereitung und permanenter Matchplan folgen derselben Bedienanordnung wie die editierbare Matchpause: im Querformat Feld und Bank links, Aufstellungs-/Taktikreiter und Bedienelemente rechts. Im Hochformat stehen die Bedienelemente darunter. Die Bank bleibt auch beim Teamtaktikreiter sichtbar.
- Der Torwart hält beim seitlichen Nachstellen die Arme locker vor dem Körper und die Hände getrennt. Die Fangflächen zeigen zum Ball. Die Haltung blendet mit dem bestehenden Sidestep-Gewicht ein und aus.

## Ursache der Torwart-Haltung

Die Sidesteps verwenden eine prozedurale Haltung auf dem vorhandenen Meshy-Rig. Die Oberarmwinkel führten beide Handschuhe zur Körpermitte; der Abstand der Handgelenke betrug im eingespielten Seitwärtsschritt nur etwa 14,5 cm. Die übernommenen Handgelenksrotationen richteten die Fangflächen zusätzlich nach hinten.

Die Oberarme erhalten jetzt neutrale seitliche Winkel bei weiterhin gebeugten Ellenbogen. Eine auf den Seitwärtsschritt begrenzte Drehung um die Unterarmachse richtet Hand und Fingerspitze nach vorne aus. Sie versetzt weder Handgelenke noch den Spieler und greift nicht während Ballhalten, Paraden, anderen Aktionen oder Jubel ein. Der eingespielte Handgelenksabstand beträgt nun etwa 61,4 cm.

Verwendet werden die vorhandenen Modelle, Handschuhe und Meshy-Clips; keine neue Generierung und keine zusätzlichen Credits. Matchregeln, Spielerwerte und gespeicherte Spielstände werden nicht umgerechnet.

## Verantwortliche Dateien

- [Wettbewerbsvorschau](../dist/world-competition-v62.js): gemeinsame Tabellenplatz-/Rundenhelfer und Finalpokal.
- [Spielvorbereitung](../dist/world-match-ui-v64.js), [permanenter Matchplan](../dist/world-career-plan-v64.js), [Live-Matchanzeige](../dist/world-physical-v65.js) und [Layout](../dist/world-start-v61.css): gemeinsame Namensanzeige und Anordnung.
- [Seitwärtshaltung](../dist/pitch-motion-v102.js) und [Handkorrektur am Meshy-Rig](../dist/player-user-ball-actions-v111.js): ausschließlich Torwart-Bereitschaftshaltung.

## Prüfungen und Belege

- [Tabellenplatzprüfung](../outputs/rank-labels-qa-v129.json): Liga, Europacup-Ligaphase und beide K.-o.-Kontexte in Vorschau und Vorbereitung, unabhängiger Tabellenabgleich und echte Live-Anzeige. Desktop und Mobil, DE/EN, keine Mutation durch die Darstellung.
- [Finale und Layout](../outputs/plan-preview-qa-v129.json): sieben passende Pokalbilder, geladene eingebettete Bilder, Runde nur oben, kein Pokal außerhalb eines Finales. Beide Reiter in Vorbereitung und Matchplan bei 1632×956, 844×390, 667×375 und 390×844; Seiten ohne Überbreite.
- Native Torwartsequenzen: zwei Geschwindigkeiten, 30/60/120 Hz, beide Torseiten und beide Startbewegungen, jeweils Seitenwechsel, Stopp und Pause. [Baseline](spieler-nutzer-rig/keeper-sidestep-qa-baseline-v129.json) und [Ergebnis](spieler-nutzer-rig/keeper-sidestep-qa-v129.json) messen echte Knochen und Skin. Alle 24 Sequenzen bestanden: getrennte Hände, Fangflächen vorwärts, begrenzte Übergänge, unveränderte Hüftbewegung und Fußbindung gegenüber der Baseline, unveränderter Matchzustand und pausierte Pose. Die größten relativen Handgelenksbewegungen sind in allen Sequenzen kleiner als vorher. Ein anfänglicher pauschaler 15-cm-Schrittgrenzwert war bei 30 Hz bereits in der Baseline überschritten; die endgültige Prüfung verwendet eine zeitbezogene Grenze von 7 m/s und zusätzlich den Vergleich jeder Sequenz mit ihrer Baseline.
- [Angrenzende Ballaktionen](spieler-nutzer-rig/ball-actions-qa-v129.json): Pass, Flanke, Annahme, Schuss, Dribbling, niedrige/hohe Fänge, beide Seitenparaden und Ballhalten. Bestehende Kontakt-, Skin- und Pausenprüfungen bestanden; Matchdaten unverändert.
- Bestehende reine Prüfungen `work/test-world-career-plan.cjs` und `work/test-world-grid-v71.cjs` bestanden. [Buildabgleich](../outputs/ui-torwart-verification-v129.json) prüft die aktuellen Quelldateien im Offline-Build, identische reguläre Ausgabedateien und den Versionsfuß.

Die Animation wurde am tatsächlichen Rig mit isolierten Sequenzen geprüft. Die natürliche Wirkung im laufenden Nutzermatch bleibt eine visuelle Abnahme; der Nutzer-Spielstand wurde für diese Tests nicht geöffnet oder verändert. Der vorher dokumentierte schmale Kopfzeilenüberhang der editierbaren Matchpause auf 390 px ist kein Bestandteil dieser Änderung.

## Bilder

[Finalvorschau](../outputs/final-preview-1632-de-v129.png) · [Vorbereitung](../outputs/shared-preparation-1632-v129.png) · [Matchplan](../outputs/shared-matchplan-1632-v129.png) · [mobile Vorbereitung](../outputs/shared-preparation-390-v129.png)

Torwart vorher:

![Torwart mit zu eng zusammengeführten Handschuhen](../outputs/keeper-sidestep-qa-baseline-v129.png)

Torwart nachher:

![Torwart mit geöffneten Armen und Fangflächen zum Ball](../outputs/keeper-sidestep-qa-v129.png)
