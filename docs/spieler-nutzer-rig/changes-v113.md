# Ballkontakte, Torwart, Foulreaktionen und Abwehrlinie – v113

Lokaler Stand vom 4. Oktober 2026. Die Änderungen sind in `dist/index.html` und im regulären Offline-Spiel `outputs/Doppel-6-Fussballmanager.html` integriert. Keine Veröffentlichung; Seitenfuß weiterhin PROTOTYP 105. Bestehende Spielstände werden nicht umgerechnet.

## Was korrigiert wurde

- **Ballannahme:** Empfang und niedrige Kontrolle lassen die Schrittphase weiterlaufen. Ballführer übernehmen keine Rückwärtsgewichte, orientieren sich an ihrem Weg und haben den sichtbaren Ball vor der Bewegungsrichtung. Die Annahme blendet nur einen kleinen Schussclip-Anteil ein; eine Fußkorrektur hält nicht mehr beide Beine fest. Hohe Kopf-/Luftkontakte bleiben eigene Aktionen.
- **Torwartposition:** Ein gehaltener Schuss endet 65 cm vor der tatsächlichen Torwartposition in Richtung Schütze. Während der Reaktion bleibt der Torwart dort, statt weiterhin dem Ball seitlich zu folgen. Native Paraden bekommen keinen zusätzlichen Root-Versatz zur Torlinie; Ganzkörperkorrektur und Armreichweite sind begrenzt.
- **Fangkontakt:** Niedrige Bälle werden am erreichbaren Fangpunkt aufgenommen. Beide Hände übernehmen den Ball unmittelbar am Kontakt; die frühe Rückkehr zum Stand hält ihn weiterhin. Der zuvor verwendete Rückfall auf nur eine Hand im ersten Fangbild entfällt.
- **Tore und Fehlschüsse:** Fang-IK greift bei erfolgreichen Toren nicht. Bei Bedarf verläuft deren Darstellungsbahn seitlich am Torwartkörper vorbei, innerhalb des Torrahmens. Die Engine entscheidet weiterhin vor dem Flug über das Ergebnis; dies ist keine neue dynamische Torwart-Kollisionssimulation. Fehlschüsse starten keine Fangparade. Der sichtbare Ball fliegt kurz weiter, blendet aus und beim Abstoß wieder ein, statt sofort in den Händen zu erscheinen.
- **Fouls:** Die Vereinswelt misst Körper-/Ballkontakte im selben Metermaß wie das 3D-Feld. Stehende Fouls benötigen höchstens rund 1,34 m Körperabstand; Grätschen treffen erst bei engem Kontakt. Die allgemeine Spielertrennung hält etwa 80 cm statt der bisherigen großen Symbolabstände. Ein Foul zählt erst nach der zentralen Reichweitenprüfung. Fall-/Abfangreaktionen bleiben am Kontaktort; Standardpositionierung versetzt die Beteiligten nicht sofort. Andere Spieler laufen in die Freistoßordnung, die Beteiligten nach ihrer Reaktion. Zwei echte Meshy-Reaktionen und vorhandenes Aufstehen sind angebunden.
- **Stand:** Ein aufrechter Ausschnitt des vorhandenen Meshy-Aufstehclips ersetzt die bisherigen Standvarianten mit auffälliger Hand-/Beinhaltung. Geschlossene Schleife, Arme neben dem Körper und Bodenkontakt; keine zusätzlichen Credits dafür.
- **Abwehr:** Bei eigenem Ballbesitz rücken eingesetzte Verteidiger geschlossen auf. Gegen den Ball bestimmt die gewählte Abwehrlinie ihre Grundhöhe deutlich stärker; die bisherige Manndeckung kann nicht die gesamte Linie bis ans Tor ziehen. Bei einem tatsächlichen Durchbruch deckt der nächste Verteidiger den Ballführer, während die übrigen gestaffelt absichern. Beide Teams und positionsfremd eingesetzte Verteidiger verwenden dieselbe Regel. Spieler laufen zu diesen Zielen; sie werden nicht dorthin versetzt.

Neue Kontaktmaße, Abwehrziele, Flugzeiten und Foulvorbereitung können zukünftige Partien verändern. 2D und 3D verwenden dieselbe Match-Engine. Animationen und Übergänge verbrauchen keinen zusätzlichen Simulationszufall.

## Dateien und Meshy

| Bereich | Verantwortliche Dateien |
|---|---|
| Ballannahme, Stand und Schritte | `dist/player-user-motion-v108.js`, `dist/player-user-ball-actions-v111.js`, `dist/pitch-motion-v102.js` |
| Schuss-/Fangpunkt und Torwartstellung | `dist/pitch-v55.js`, `dist/game.js`, `dist/world-pitch-actions-v99.js`, `dist/world-pitch3d-v98.js` |
| Fouls und Standardvorbereitung | `dist/pitch-v56.js`, `dist/set-pieces-v50.js`, `dist/pitch-v57.js`, `dist/player-ball-events-v111.js` |
| Abwehrlinie und Aufrücken | `dist/world-backpedal-v108.js`, `dist/game.js` |
| Modell, Kalibrierung und Einbettung | `dist/players/football-v113.glb`, `dist/players/calibration-v113.json`, `dist/player-user-bootstrap-v112.js`, `work/build.cjs`, `work/server.cjs` |
| Reproduktion und Bewegungsprobe | `work/prepare-contact-assets-v113.cjs`, `work/user-locomotion-lab-v108.js`, `work/generate-user-meshy-match.cjs` |

Meshy-Aufgabe `01a106a6-77ec-75c1-bb63-28ea39ebf2c3`, vorhandenes Rig `01a10156-b12b-74d3-baef-6e0b4054a2b9`: Falling Down (366) und Sliding Stumble (519), **tatsächlich 6 Credits**. Der Adapter verwendet passende Abschnitte und Boden-/Übergangskorrekturen; der volle 11,37-Sekunden-Stumble wird nicht vollständig in einen kurzen Zweikampf abgespielt. Originale Meshy-Datei separat gesichert.

Das neue Asset enthält **32 Clips**: die bisherigen 29 unverändert, zwei neue Reaktionen und eine wiederverwendete, gekürzte Standbewegung. Geometrie, Rig und Texturen bleiben erhalten. [Assetprüfung und Herkunft](contact-assets-v113.json), [Blender-Datei mit 32 Aktionen, gepackten Texturen und Wiederöffnungsprüfung](contact-native-qa-v113.json).

- [Reguläres Offline-Spiel](../../outputs/Doppel-6-Fussballmanager.html)
- [Bewegungsprobe einschließlich Foulreaktionen](../../outputs/spieler-nutzer-bewegungsprobe.html)
- [GLB](../../meshy_output/user-character-2026-10-03/character-football-v113.glb)
- [Blender-Datei](../../meshy_output/user-character-2026-10-03/contact-v113/Doppel6-Nutzercharakter-Foul-Stand-v113.blend)

## Nachweise und Grenzen

- [Reproduzierte Fehler](contact-baseline-v113.json): rückwärts gerichtete Annahme, bis 52 % Rückwärtsclipgewicht und eingefrorene Schrittphase; bei dem bodennahen Fehlschuss bis 13,6 m Skin-Versatz außerhalb des Tors; Foul aus 2,43 m Abstand.
- [Korrigierte Annahme und Schüsse](contact-qa-v113.json): Annahmen bei 30/60/120 Hz mit fortlaufender Phase, 0 Rückwärtsgewicht und Ball vor der Bewegung; beide Mannschaften mit gehaltenem Schuss, Tor, hohem und seitlichem Fehlschuss; kein entferntes Foul.
- [Fangen, Taktik und Foulreaktionen](flow-qa-v113.json): sechs tatsächliche Schuss-/Fangabschlüsse mit beiden Handschuhen am Ball, höchstens 9,1 cm Übergangsversatz; beide Teams mit allen drei Linien, jeweils Aufrücken bei eigenem Ballbesitz; zulässiges Foul bleibt am Kontaktort. Native Fall-/Aufsteh-/Abfangposen und Stand bleiben über dem Rasen und bei Pause stabil.
- [Torwartkörper bei Toren](goal-clearance-qa-v113.json): sechs tiefe, mittlere und hohe erfolgreiche Abschlüsse beider Mannschaften; Ballabstand zum tatsächlichen Skin größer als der Ballradius, auch im Bereich des Torwartkörpers.
- [Echte Bewegungsschritte und Fehlschuss-Neustarts](keeper-origin-misses-qa-v113.json): Torwartposition bleibt während realer Engine-Schritte bis zum Fang erhalten; seitliche und hohe Fehlschüsse beider Teams bewegen sich nach dem Abschluss weiter, ohne sofortigen Fang, mit unsichtbarem Wechsel zur Abstoßvorbereitung.
- [Aufstehen nach hohen Gegentoren](goal-recovery-qa-v113.json): Beide Torhüter verwenden den Aufstehclip ohne Fangkorrektur oder gehaltenen Ball; endliche Gelenke und unveränderte Matchdaten.
- [Prüfläufe](gates-v113.json): gezielte Kontakte, Schritte, Besitzwechsel, 3600 Matchbilder, Quell-/Offline-/Asset-Ausfall, Bewegungsprobe samt Download, Roll-/Block-/Eckballregressionen und vollständige Match-/Wiederholungsprüfungen. `work/run-contact-gates-v113.cjs` führt die Gates aus; `--final` prüft die zuletzt betroffenen Ballübergänge und gemeinsamen Browsergates erneut.
- [Abschlussprüfung und Prüfsummen](verification-v113.json): identisches Quell-/Offline-Modell mit allen 32 Clips, bewahrte 29 Ausgangsclips, vollständig eingebettete Datei und erneut geöffnete Blender-Datei. [Finaler Matchvergleich](regression-v113.json), [Wiederholungen](replay-qa-v113.json), [Fuß-/Luftkontakte](motion-actions-qa-v113.json), [3600 Matchbilder](animation-audit-qa-v113.json), [Quell-/Offline-/Asset-Ausfall](model-integration-qa-v113.json), [Stand/Schritte](locomotion-qa-v113.json) und [Bewegungsprobe](motion-lab-qa-v113.json).

Die Sichtprüfung umfasst echten Stand, Fallen, Bodenkontakt, Aufstehen und Abfangbewegung; die Zahlenprüfung enthält weitere Kontakt- und Matchfälle. Sie beweist nicht, dass jede zufällige Spielszene fehlerfrei aussieht oder auf jedem Mobilgerät flüssig läuft. Lauf-/Pass-/Foulclips bleiben retargetierte Meshy-Bibliotheksbewegungen mit gezielten Korrekturen, keine Motion-Capture-Aufnahme echter Fußballzweikämpfe.

![Aktuelle Standpose im Spiel](../../outputs/contact-idle-v113.png)
