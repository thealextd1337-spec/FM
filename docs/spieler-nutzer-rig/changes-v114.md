# Warping-Prüfung im laufenden Spiel – v114

Lokaler Stand vom 4. Oktober 2026, integriert in `dist/` und `outputs/Doppel-6-Fussballmanager.html`. Kein Release, Seitenfuß weiterhin PROTOTYP 105. Modell und 32 Meshy-Clips bleiben erhalten; 0 zusätzliche Credits. Bestehende Partien werden nicht umgerechnet.

## Gefundene Ursachen und Änderungen

- **Eckball und Anstoß nach Toren:** Die bisherige Umstellung konnte Spieler bis zu 44 m in einem Simulationsschritt versetzen. Die Formation ist jetzt ein Ziel; Spieler laufen mit höchstens 6 Szenenmetern pro Sekunde hin. Countdown beziehungsweise Eckballvorbereitung warten auf ihre Ankunft. Der kurze Anstoßpass verwendet in der Vereinswelt einen festen Zielpunkt, zu dem der Empfänger läuft.
- **Ballbesitz und Interpolation:** Alter Besitzer und neue Flug-/Besitzflags gehörten zu verschiedenen Bildern. Alle zugehörigen Flags und Grätschenzustände stammen jetzt aus demselben gepufferten Bild. Das Alter einer Foulreaktion wird ebenfalls interpoliert.
- **Aus- und Einblenden:** Eine versteckte Versetzung wurde als schnelle sichtbare Flugbahn zwischen Ausball und Standardposition interpoliert. Die Position bleibt während des Ausblendens am Ausgangsort und während des Einblendens am Zielort. Anstöße nach Toren behalten zunächst den Ball im Netz und setzen ihn erst unsichtbar zur Mitte.
- **Annahme und Vorbereitung:** Hohe Kontrolle verschiebt nicht mehr sofort die ganze native Figur. Luftkontakt-Versatz blendet ein und aus. Fußkontrolle führt den tatsächlich gezeichneten Ball beim Drehen und bei wechselnder Vorbereitung kontinuierlich zum Ziel; laufende Flugbahnen werden davon nicht begrenzt.
- **Grätschen:** Ballannahme und Schussvorbereitung überschreiben keine liegende Grätschenpose. Körperneigung und Übergang zum nativen Stand laufen aus, statt abrupt zwischen zwei Körperpositionen zu wechseln. Feldspielerblocks behalten ihre präzise Kontaktkorrektur.
- **Torwart:** Gehaltene Bälle behalten in den gepufferten Bildern ihre Fanghöhe, bis die Hände übernehmen. Die zuvor auftretende Zwischenposition am Boden entfällt. Haltebewegungen haben einen kontinuierlichen Zielpunkt; Paradenwahl und Seitenbestimmung verwenden die Ausgangsposition, damit eine spätere Keeperbewegung nicht mitten in der Erholung den Clip tauscht. Hohe Fangaktionen wechseln früher und weich ins Aufstehen.
- **Abstoß nach Flanken und freien Bällen:** Auch diese Ausbälle laufen weiter und blenden aus, bevor der Abstoßball erscheint. Sie starten keine Fangbewegung für einen Ball außerhalb des Felds.
- **Freie Bälle und Klärungen:** Der tatsächliche Kontaktpunkt wird innerhalb des Felds nicht mehr an eine künstliche innere Grenze geklemmt. Luftklärungen verwenden für den sichtbaren Weg dieselbe begrenzte Geschwindigkeit wie der freie Engineball; beim Ende des Luftwegs entsteht dadurch keine Rückversetzung.

Standardvorbereitung, feste Anstoßziele und freie Ballkontakte gelten für neue Ereignisse in der gemeinsamen 2D-/3D-Engine. Grafik verändert keine Zufallsziehungen oder gespeicherten Matchdaten.

## Prüfung

[Baseline](warping-baseline-v114.json) und [Gegenprüfung](warping-qa-v114.json) erfassen zwei vollständige Partien mit den tatsächlichen zwölf nativen Figuren, beiden Halbzeiten, 20 Simulationsschritten und 60 Renderbildern pro Sekunde. Erfasst werden Engineposition, grafischer Root, Skin-Hüfte und tatsächlich gezeichneter Ball. Die längere Messung lässt GPU-Zeichnung aus, arbeitet aber mit der echten Render-/Rig-/Kontaktkette und ihrem zeitlichen Puffer. Sie verändert weder Enginezustand beim Rendern noch einen Nutzerspielstand.

[Torwartübergänge](warping-contacts-v114.json) prüfen niedrige, mittlere und hohe Fangaktionen beider Teams einschließlich Erholung und Haltewechsel. [Prüfläufe](gates-v114.json) enthalten zusätzlich Block-/Klärungs-/Rollkontakte, acht Eckballsituationen, Lokomotion, Ballereignisse, Ballführungsrichtung sowie die reguläre Offline-Match-, Standard- und Wiederholungsregression. Die Eckballprüfung misst ausdrücklich den Spielerweg bei der Umstellung.

Ergebnis der langen Gegenprüfung: **15.768 Renderbilder**, beide Partien vollständig beendet, beide Halbzeiten erfasst, 0 Renderänderungen am Enginezustand. Keine Überschreitung der unten genannten Suchschwellen für Spieler, Skin-Hüfte oder sichtbaren Ball. Die Baseline enthielt bis zu 44,04 m Engineversatz, 14,68 m Rootversatz und 11,77 m sichtbaren Ballweg in einem Bild; im korrigierten Lauf liegen die jeweiligen Maxima bei 0,81 m pro Engine-Schritt, 0,33 m pro Rootbild und 0,94 m pro Ballbild. Die Skin-Hüfte erreicht höchstens 0,65 m pro Bild (vor Rundung unter der Suchschwelle). Das sind Maxima einschließlich Bewegungen und schneller Flugbahnen, keine vermeintlich exakten Teleportdistanzen.

**14 betroffene Prüfläufe bestanden.** [Auslieferungsabgleich](verification-v114.json) bestätigt eingebetteten Quellstand, unverändertes Modell und identische reguläre Offline-Dateien; [Matchvergleich](match-parity-v114.json) bestätigt denselben Verlauf in 2D und 3D. [Wiederholungsnachweis](replay-qa-v114.json), [acht Eckballfälle mit Spielerweg](corner-qa-v114.json) und [Block-/Klärungs-/Rollkontakte](ball-motion-qa-v114.json) sind separat gesichert.

## Grenzen der Messung

Die Markierungen sind Suchschwellen, keine vollständige physikalische Kollisionssimulation: über 1 m pro Engine-Schritt, 0,6 m pro Rootbild, 0,65 m pro Hüftbild und 1 m pro Ballbild. Unsichtbare Ballversetzungen, der Seitenwechsel zur Halbzeit, der Wechsel zur gesonderten Elfmeterszene und der Abpfiff werden als Szenenwechsel behandelt. Die dokumentierte Abseitsanalyse zeigt weiterhin bewusst die eingefrorene Abspielszene; Wiederholungen werden im langen Matchlauf übersprungen und separat geprüft. Rohprojektion und sichtbarer Ball sind getrennte Messgrößen.

Die Tests belegen die aufgeführten Fälle und zwei reproduzierbare Partien; sie sind keine Zusage für jede denkbare Spielsituation oder ein Nachweis der Bildrate auf echter Mobilhardware.

## Verantwortliche Dateien

`game.js`, `set-pieces-v50.js` und `pitch-v57.js` steuern Anstoß und laufende Standardpositionierung. `world-ball-motion-v110.js` hält den freien Ballweg konsistent. `pitch-motion-v102.js` und `world-pitch3d-v98.js` steuern Puffer, sichtbare Kontakte und Luftversatz. `world-pitch-actions-v99.js`, `player-user-ball-actions-v111.js` und `player-user-meshy-v107.js` halten Torwart-/Grätschenübergänge kontinuierlich. Alle liegen unter `dist/`.

[Reguläres Offline-Spiel](../../outputs/Doppel-6-Fussballmanager.html) · [Bewegungsprobe](../../outputs/spieler-nutzer-bewegungsprobe.html)
