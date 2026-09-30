# 3D-Darstellung echter Vereinswelt-Partien

Die getrennte Vorschau zeigt echte Partien der Vereinswelt im Querformat mit einer erhöhten TV-Kamera. Im Hochformat bleibt die 2D-Darstellung aktiv; im Querformat kann die spielende Person zwischen „3D · TV“ und „2D“ wechseln. Bei fehlender WebGL-Unterstützung oder verlorenem Grafikkontext fällt die Ansicht auf 2D zurück. Version 98 ist unter [Spiel öffnen](https://fussball.cakamper.at/3d/) veröffentlicht. Die kommende Version 99 ergänzt Paraden, Würfe und hohe Schüsse. [ZIP herunterladen](https://fussball.cakamper.at/3d/doppel6.zip) und [Downloadseite](https://fussball.cakamper.at/3d/download.html) liegen im gleichen getrennten Bereich. Eine eigene Subdomain ist noch nicht eingerichtet.

Die Kameraauswahl bietet „TV nah · Mitfahrt“ als Startansicht und „TV weit · Übersicht“. Die nahe Kamera steht tiefer und näher am Feld, fährt seitlich nur leicht mit und richtet ihren Blick auf die Mitte der aktuellen Spielhälfte und die Ballseite. Ab der Halbmitte schwenkt sie stärker zum Tor. Beide Hälften gehen beim Überqueren der Mittellinie fließend ineinander über. Seitliche Fahrt und Blickrichtung werden getrennt gedämpft; dadurch bleibt die Kamera ruhig und reagiert trotzdem auf Pässe. Die weite Kamera bleibt zum Vergleich verfügbar. Die Auswahl verändert keine Karriere- oder Matchdaten.

3D liest den bestehenden physischen Matchzustand. Regeln, Zufallsentscheidungen, Spielzeit, Ereignisse, Statistik, Ergebnis und Speicherung bleiben in der bisherigen Engine. Taktik, Formation, Rollen, Spieleranweisungen, Angriffsfokus, Pausen, Positions- und Bankwechsel, Rückgängig und Live-Spielerinfo verwenden die gemeinsame Oberfläche. Auch Tor- und Wechselbanner, Standards, Abseits, Halbzeit, Abpfiff und Elfmeterszenen bleiben an die tatsächlichen Ereignisse gebunden.

Die kompakteren Namensfelder verwenden 8-Pixel-Schrift. Bei ununterbrochenem Ballbesitz wird ausschließlich der sichtbare Ball auf 0,65 Szenenmeter Abstand zum Spieler gesetzt; Ballflug, Standards und die physischen Koordinaten bleiben erhalten. Vier 3D-Banden neben den Toren zeigen das bestehende Heim-Sponsorenlogo mit Vertragsnamen, unabhängig vom eigenen Heim- oder Auswärtsstatus. Die alten 2D-Banden bleiben für 2D und zugänglichen Text erhalten. Der gemeinsame Torbanner wartet 0,5 Sekunden laufender Spielzeit; Pause und Spielerinfo halten diese Wartezeit an. Ein neuer Hinweis oder Ausblenden verwirft eine ausstehende Einblendung. Wechselbanner lassen eine unbekannte Minute aus.

Der [isolierte Kameraprototyp](kameraprototyp-3d.md) zeigt weiterhin eine synthetische 28-Sekunden-Sequenz. Seine Szenenknöpfe steuern keine echte Partie. Demo und Vereinswelt verwenden jetzt dieselbe 3D-Szene; ihre Abläufe bleiben getrennt.

Der Eckbutton unten rechts schaltet eine größere Spielfläche ein und aus. Werbebanden mit hochaufgelösten Sponsorwortmarken stehen nur an beiden Längsseiten. Torbanner werden vor Wechselbannern gezeigt, ohne die Ausführung der Wechsel zu verschieben. Hohe Schüsse und Schüsse über die Latte sind visuelle Varianten der vorhandenen Tor-/Fehlschussentscheidung; die Engine bleibt maßgeblich.

## Aufbau

- [dist/pitch-scene-v98.js](../dist/pitch-scene-v98.js) baut Spielfeld, Rasen, Tribünen, Tore und Spieler für Demo und echte Partien auf. Die Kameraseite bleibt ohne Dach, damit die Übersicht frei bleibt.
- [dist/world-pitch3d-v98.js](../dist/world-pitch3d-v98.js) projiziert den vorhandenen Matchzustand in die Szene, einschließlich Seitenwechsel, hoher Bälle, Torszene und Abseits. Grafikzufall verbraucht keine Zufallswerte der Simulation; die Darstellung verändert den Matchzustand nicht.
- `dist/world-pitch-actions-v99.js` ergänzt Wurf- und Paradeposen und Flugkurven aus bestehenden Ereignissen. Flüchtige Daten werden nicht gespeichert; Pausen halten die Erholung an.
- Three.js r160 und seine MIT-Lizenz liegen unter `dist/camera-prototype/vendor/`. Die sechs optionalen SuperCollider-Sounds stammen aus `dist/camera-prototype/audio/`; Erzeugung und Format sind im Kameraprototyp dokumentiert. Ton wird durch eine Nutzeraktion eingeschaltet.

## Lokal starten und offline bauen

Im Projektverzeichnis einen eigenen Server starten:

```powershell
$env:SECHSER_PORT = '4190'
node work/server.cjs
```

Die Anwendung ist unter [127.0.0.1:4190](http://127.0.0.1:4190/) erreichbar. Für Browserprüfungen nur eigens angelegte Testkarrieren verwenden. Den vollständigen Offline-Build in einem weiteren Terminal erzeugen:

```powershell
node work/build.cjs
```

[outputs/Doppel-6-Fussballmanager.html](../outputs/Doppel-6-Fussballmanager.html) enthält die Anwendung einschließlich Three.js, gemeinsamer 3D-Szene und aller sechs Sounds. Die Datei lässt sich ohne Internet per Doppelklick öffnen. Dieser Build ist keine Veröffentlichung.

## Abnahme und Reichweite der Nachweise

Die gezielten Prüfungen lassen sich aus dem Projektverzeichnis wiederholen. Der Browserdurchgang erwartet den laufenden Server auf Port 4190 sowie den aktuellen Offline-Build und verwendet ein isoliertes Browserprofil:

```powershell
node work/test-world-pitch3d-v98.cjs
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' work/check-world-pitch3d-camera.cjs
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' work/check-world-pitch3d-browser.cjs
```

Der Browserdurchgang wurde mit der gebündelten Node-Laufzeit 24.19.0 und Edge ausgeführt; das normale `node` auf diesem Rechner ist 18.14.2. Auf anderen Rechnern lassen sich Playwright-Modul, Browserpfad und Testadresse über `D6_PLAYWRIGHT`, `D6_BROWSER` und `D6_TEST_URL` setzen. Dafür eine mit dem verwendeten Playwright kompatible Node-Laufzeit verwenden.

Der erste Test prüft Projektion, Seitenwechsel, Ballflug, Tor und Abseits sowie unveränderten Matchzustand und unabhängigen Grafikzufall. Der vollständige Vergleich einer wiederholbaren Partie mit und ohne 3D ergab identische Zeitleiste, Ereignisse, Tore, Wechsel, Statistiken und verbuchtes Ergebnis. Das belegt diese Fixture; es ist keine umfassende Prüfung aller möglichen Partien.

Der Kameratest verwendet standardmäßig Port 4173 (`D6_TEST_URL` kann die Adresse ersetzen). Er prüft die Ballprojektion an 15 Feldpositionen und bei einem schnellen langen Pass, die nahe/weite Auswahl, mobile Breite und englische Beschriftungen. Vergleichsbilder liegen in `outputs/camera-near-half.png`, `outputs/camera-wide-half.png` und `outputs/camera-near-mobile.png`.

Der isolierte Browserdurchgang prüft außerdem gezielt ausgelöste Engine- und UI-Pfade: Torbanner und angehaltene Torszene, Abseits, Bankwechsel durch Ziehen samt ausgeführtem Wechsel und korrekter Minutenanzeige, Elfmeterszene, Halbzeit und Abpfiff, Tablet-Hochformat, Grafikkontextverlust mit Wiederaufnahme und Verlassen der Partie. Im eingebetteten Offline-Build wurden der Start einer echten 3D-Partie, das Dekodieren der SuperCollider-Sounds und die Stadionatmosphäre geprüft. Die bestehenden zehn Match-, UI-, Trikot- und Speichertests sind ebenfalls erfolgreich; sie ergänzen die Integrationsprüfung.

Die abschließende Browserprüfung ist erfolgreich: Die echte Abseitsfunktion zeigt die drei vorgesehenen Fahnenposen aus dem bestehenden Szenenablauf ohne zentralen Banner. Deutsch → Englisch → Deutsch wurde in derselben Partie einschließlich Navigation sowie zugänglicher Spielfeld- und Spielerbeschriftungen geprüft. Die Wechselminute verwendet bei fehlender Ereignisminute die vorhandene Matchminute; gezielte Prüfungen decken 17′ und 0′ ab, ohne gespeicherte Partien zu verändern. Maßgeblich sind die verbindlichen Regeln in [product.md](product.md) und die Abnahmebedingungen in [development.md](development.md).

Browsergrößen werden auf einem Desktop emuliert. Die bestätigte Funktion der ersten Kamerademo auf einem Mobiltelefon ersetzt keine Hardwareprüfung dieser Integration. Leistung der neuen Grafik auf echten Telefonen und eine Hörprüfung bleiben offen; eine feste Bildrate ist nicht zugesichert. Lokale Prüfergebnisse stehen in `outputs/world3d-parity.json`, die Screenshots unter `outputs/world3d-*.png`.
