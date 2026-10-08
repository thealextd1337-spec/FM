# Bildvergrößerung, Grätschenkontakt und Torwartausrichtung v133

Stand: 5. Oktober 2026. Lokal integriert im [Offline-Spiel](../../outputs/Doppel-6-Fussballmanager.html).

## Änderungen

Der neue Lupenknopf unten rechts vergrößert die Spielfeldansicht innerhalb der Seite von maximal 840 auf 1.280 Pixel, soweit Platz vorhanden ist. Er schaltet wieder zur normalen Größe zurück. Der vorhandene Vollbildknopf bleibt separat. Beide Knöpfe gehören zur ausblendenden Spielfeldbedienung; Deutsch/Englisch und zugängliche Beschriftungen sind ergänzt. Matchzustand und Kameraausrichtung ändern sich durch die Bildvergrößerung nicht.

Bei Grätschen wurde der Nachlauf zum Ball als normalisierter Feldanteil berechnet. Das konnte den Zielpunkt mehrere Meter hinter den Ball legen. Frontaler Ballkontakt kam dadurch teilweise überhaupt nicht zustande; die Entscheidung wartete bis zum Ende der 0,65 Sekunden langen Bewegung. Die Vereinswelt verwendet jetzt 18 beziehungsweise 25 Zentimeter Nachlauf. Foul und Ballgewinn werden weiterhin beim tatsächlichen Körper-/Ballkontakt entschieden. Reichweite, Fähigkeiten, Erfolgschance und die anschließende Freistoßvorbereitung bleiben erhalten. Eine vollständig verfehlte Grätsche kann weiterhin erst beim Ausklang sicher abgeschlossen werden.

Ein stehender Torwart bleibt auch bei entfernten Bällen in seiner Meshy-Bereitschaftshaltung mit gebeugten Knien und tiefen, offenen Händen. Die bisherige 24-Meter-Grenze ließ ihn beispielsweise bei Ecken in die unpassende Feldspieler-Standpose wechseln. Allgemeine Lauf-/Stand-Drehclips und die Feldspieler-Ausrichtung im Verfolgungsmodus überlagern seine eigene Ballausrichtung nicht mehr. Paraden und Fangaktionen behalten ihre gesonderten Kontakte und Abläufe.

## Prüfungen

- [Grätschen vorher](../../outputs/slide-decision-baseline-v133.json) und [nachher](../../outputs/slide-decision-qa-v133.json): beide Teamrichtungen, frontal/seitlich/von hinten, bewegter Gegner und ausgewichener Ballführer. Frontale Ballkontakte nach 0,16 Sekunden statt falschem Fehlschlag nach 0,66 Sekunden; Körperkontakte führen ohne zusätzliche Entscheidungswartezeit zur Foulpose. Kein entferntes Foul beim Ausweichen.
- [Torwart vorher](../../outputs/keeper-facing-baseline-v133.json) und [nachher](../../outputs/keeper-facing-qa-v133.json): 24 native Sequenzen, beide Ausrichtungen und 30/60/120 Bilder pro Sekunde. Eckballentfernung, abrupter Ballseitenwechsel, naher Ball und Besitzerzustand. Beim Seitenwechsel sinkt der maximale Richtungsfehler nach einer Sekunde von rund 1,4 auf unter 0,01 Radiant. Bereitschaftshände bleiben unter dem Becken, vor dem Körper und zum Ball geöffnet. Matchdaten unverändert.
- [Meshy-Bereitschaft und Sidesteps](keeper-sidestep-qa-v133.json): 24 Bewegungssequenzen bei drei Bildraten; Fußkontakte, Knie, Oberkörperneigung und Handflächen. [Ansicht von vorne](../../outputs/keeper-reference-front-v133.png).
- [Sieben native Torwartaktionen](keeper-visual-qa-v133.json): seitliche/hohe Abwehr, tiefer/hoher Fang, Herauslaufen, Aufnahme und Nachschuss. Keine durch das Rendering veränderten Matchdaten; Kontakt, Bodennähe und Pausierbarkeit geprüft.
- [Bildvergrößerung](../../outputs/image-enlarge-qa-v133.json): 2D/3D und DE/EN, 840 → 1.280 → 840 Pixel, unveränderter Matchzustand und unabhängiger Vollbildknopf. [Vergrößerte Ansicht](../../outputs/image-enlarge-3d-de-v133.png).
- [Aktionsregeln](play-actions-qa-v133.json), [Grätschenpose](slide-visual-qa-v133.json) und [Foulausklang](foul-exit-qa-v133.json) als angrenzende Prüfungen.
- [Zwei vollständige 3D-Partien](warping-qa-v133.json): 15.972 Bilder, keine neuen sichtbaren Spieler-/Ball-Sprünge oder Änderungen der Simulation durch das Rendering.
- [2D-/3D-/Offlinevergleich](../../outputs/world3d-parity-v133.json) und [Quell-/Build-/Modellprüfung](verification-v133.json).

## Dateien und Grenzen

Änderungen in `dist/world-goal-replay-v103.js`, `dist/pitch-v56.js`, `dist/pitch-motion-v102.js` und `dist/player-user-motion-v108.js`; reguläre Offline-Dateien neu erzeugt. Vorherquellen und aktuelle Prüfberichte liegen getrennt unter v133. Bestehendes Meshy-Rig mit 34 Clips; keine neuen Credits oder Veröffentlichung.

Bereits aufgezeichnete Rückschauszenen bewahren ihre damaligen Posen. Die Korrektur wirkt auf neu gerenderte Szenen nach dem Neuladen. Die konkret abgebildete ältere Szene lässt sich ohne ihre flüchtige Aufnahme nicht exakt wiederholen; verwandte Ecken-/Ballseitenwechsel wurden reproduziert. Die Prüfungen laufen im isolierten Desktopbrowser; echte Mobilhardware wurde nicht verwendet. Spielstände und ältere Statistikdaten werden nicht nachberechnet.
