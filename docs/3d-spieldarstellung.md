# 3D-Darstellung echter Vereinswelt-Partien

Die getrennte Vorschau zeigt echte Partien der Vereinswelt im Querformat mit einer erhöhten TV-Kamera. Im Hochformat bleibt die 2D-Darstellung aktiv; im Querformat kann die spielende Person zwischen „3D · TV“ und „2D“ wechseln. Bei fehlender WebGL-Unterstützung oder verlorenem Grafikkontext fällt die Ansicht auf 2D zurück. Version 104 ist unter [Spiel öffnen](https://fussball.cakamper.at/3d/) veröffentlicht. Version 103/104 verfeinert Laufkontakt und Aktionsübergänge und ergänzt überspringbare Torwiederholungen. Die Pass-, Flanken-, Schuss-, Volley- und Kopfballanimationen aus 102 bleiben erhalten. [ZIP herunterladen](https://fussball.cakamper.at/3d/doppel6.zip) und [Downloadseite](https://fussball.cakamper.at/3d/download.html) liegen im gleichen getrennten Bereich. Eine eigene Subdomain ist noch nicht eingerichtet.

Version 103 zeigt nach dem Torbanner den aufgezeichneten Angriff bis zum Netzeinschlag mit „Überspringen“. Die Wiederholung hält Berechnung und Spielzeit an; danach folgen anstehende Wechsel und der Anstoß. Pause, Spielerinfo und verborgenes Tab halten die Wiedergabe an; Wechsel auf 2D, Hochformat oder Kontextverlust beendet sie. Beim Elfmeter wird die tatsächlich entschiedene Schussanimation wiederholt. Die bestehenden SuperCollider-Dateien bleiben erhalten; ein Bassfilter, Dynamikkompressor und höhere Kontakt-/Jubelpegel verbessern den Browser-Mix. Neue Soundgenerierung ist auf Nutzerwunsch zurückgestellt.

Die Kameraauswahl bietet „TV nah · Mitfahrt“ als Startansicht und „TV weit · Übersicht“. Die nahe Kamera steht tiefer und näher am Feld, fährt seitlich nur leicht mit und richtet ihren Blick auf die Mitte der aktuellen Spielhälfte und die Ballseite. Ab der Halbmitte schwenkt sie stärker zum Tor. Beide Hälften gehen beim Überqueren der Mittellinie fließend ineinander über. Seitliche Fahrt und Blickrichtung werden getrennt gedämpft; dadurch bleibt die Kamera ruhig und reagiert trotzdem auf Pässe. Die weite Kamera bleibt zum Vergleich verfügbar. Die Auswahl verändert keine Karriere- oder Matchdaten.

Version 102 zeichnet Spieler, Ball, Aktionsphasen und Kamera unabhängig vom unveränderten 40-ms-Simulationstakt. Ein gemeinsamer Bildpuffer interpoliert Zwischenpositionen; Strecke, Knie, Füße, Ellenbogen und Hals bestimmen die Lauf- und Aktionsbewegung. Pass, Flanke, Schuss, direkter Freistoß, Volley und Kopfball sind durch unterschiedliche Gesten erkennbar. Die bestehende Engine entscheidet Luftduelle und liefert bestätigte Kontakte für Kopfballpass, Kopfballschuss, Klärung oder Annahme. Pause, Spielerinfo, 2D, Hochformat, verborgenes Tab, unsichtbares Matchfeld und Kontextverlust stoppen die Grafikschleife. Umsetzung und ursprüngliche Planung stehen unter [3D-Spieleranimationen](3d-spieleranimationen-plan.md).

Version 100 bündelt Darstellung, Kamera und Ton in einem kleinen aufklappbaren Menü oben rechts am Feld. Escape schließt es und setzt den Tastaturfokus zurück; ein Klick außerhalb schließt ebenfalls. Nach dem Halbzeitfortsetzen scrollt die Ansicht zum Feld und richtet die Kamera neu aus. Die Torszene dauert jetzt 4,05 Sekunden; das Torbanner erscheint nach 0,5 Sekunden und bleibt dadurch 3,55 Sekunden sichtbar. Wechselanzeigen folgen weiterhin danach.

Vor einem kurzen Torwartabspiel warten Torhüter 2,4 Sekunden, während Mitspieler in Position laufen. Ein erfolgreiches Tor gelangt schnell ins Netz; die erfolglose Parade zieht den Torwart nicht künstlich in die Schussbahn. Die Tore sind höher mit dem Verhältnis 3:1. Hohe Fehlschüsse setzen ihre Flugrichtung hinter dem Tor fort und fallen erst dort herunter. Bei Elfmeterfouls zeigt ein großer Schiedsrichter die Entscheidung vier Sekunden lang, danach folgt die Ausführung. Seitliche Elfmeterfehlschüsse passieren den Außenpfosten und fliegen weiter hinter das Tor. Die längeren Standardtimer gelten für neue Ereignisse in 2D und 3D; Chancen, historische Ergebnisse und Spielstände werden nicht umgerechnet.

Version 101 verbindet den Schuss mit dem Ballflug im Tor: Position und Geschwindigkeit bleiben an der Torlinie kontinuierlich; erst am Rück-, Seiten- oder Dachnetz wird der Ball gebremst und prallt kurz zurück. Freie Abschlüsse aus kurzer Distanz fliegen schneller. Der Torwart steht vor dem Abspiel still, holt aus und schwingt beim tatsächlichen Kurzpass durch; eine Ballannahme startet das Ausschwingen nicht erneut. Nach jeder Taktikpause scrollt „Fortsetzen“ direkt zum Spielfeld unter der fixierten Kopfleiste. Die gewählte 2D-/3D-Darstellung bleibt erhalten. Neue Flugzeiten und der Stillstand wirken auf künftige Aktionen; gespeicherte Ereignisse und Torwahrscheinlichkeiten bleiben unverändert.

3D liest den bestehenden physischen Matchzustand. Regeln, Zufallsentscheidungen, Spielzeit, Ereignisse, Statistik, Ergebnis und Speicherung bleiben in der bisherigen Engine. Taktik, Formation, Rollen, Spieleranweisungen, Angriffsfokus, Pausen, Positions- und Bankwechsel, Rückgängig und Live-Spielerinfo verwenden die gemeinsame Oberfläche. Auch Tor- und Wechselbanner, Standards, Abseits, Halbzeit, Abpfiff und Elfmeterszenen bleiben an die tatsächlichen Ereignisse gebunden.

Die kompakteren Namensfelder verwenden 8-Pixel-Schrift. Bei ununterbrochenem Ballbesitz wird ausschließlich der sichtbare Ball auf 0,65 Szenenmeter Abstand zum Spieler gesetzt; Ballflug, Standards und die physischen Koordinaten bleiben erhalten. Zwölf 3D-Banden außerhalb der beiden Längsseiten zeigen wiederholte Wortmarken des bestehenden Heimsponsors, unabhängig vom eigenen Heim- oder Auswärtsstatus. Die alten 2D-Banden bleiben für 2D und zugänglichen Text erhalten. Der gemeinsame Torbanner wartet 0,5 Sekunden laufender Spielzeit; Pause und Spielerinfo halten diese Wartezeit an. Ein neuer Hinweis oder Ausblenden verwirft eine ausstehende Einblendung. Wechselbanner lassen eine unbekannte Minute aus.

Der [isolierte Kameraprototyp](kameraprototyp-3d.md) zeigt weiterhin eine synthetische 28-Sekunden-Sequenz. Seine Szenenknöpfe steuern keine echte Partie. Demo und Vereinswelt verwenden jetzt dieselbe 3D-Szene; ihre Abläufe bleiben getrennt.

Der Eckbutton unten rechts schaltet eine größere Spielfläche ein und aus. Werbebanden mit hochaufgelösten Sponsorwortmarken stehen nur an beiden Längsseiten. Torbanner werden vor Wechselbannern gezeigt, ohne die Ausführung der Wechsel zu verschieben. Hohe Schüsse und Schüsse über die Latte sind visuelle Varianten der vorhandenen Tor-/Fehlschussentscheidung; die Engine bleibt maßgeblich.

Die Veröffentlichung von Version 102 ist geprüft: Quellbuild, öffentliche Live-Datei und HTML im ZIP haben denselben SHA-256 `b97eaedf333f12a917af6ed70559138b5676845e7063590c74658e925a74f56b`. Das ZIP liefert HTTP 200 mit 12.438.002 Bytes; Downloadseite und Seitenfuß zeigen 102. Workflow [36779413338](https://github.com/thealextd1337-spec/FM/actions/runs/36779413338) veröffentlichte Runtime-Commit `1791724` erfolgreich ausschließlich im getrennten 3D-Bereich. Das Hauptspiel blieb bytegleich. Die Live-Abnahme prüfte 28 Aktionsfälle und 20 entschiedene Luftduelle in beiden Richtungen und Halbzeiten sowie Pause, Orientierungswechsel, 2D-Umschaltung, Tab-Sichtbarkeit und WebGL-Ausfall ohne Browserfehler. Lokale vollständige 2D/3D-Matchparität, Offline-Build samt SuperCollider-Sounds sowie die vorhandenen Aktions-, Standard-, Banner- und Taktikprüfungen bestanden.


## Aufbau

- [dist/pitch-scene-v98.js](../dist/pitch-scene-v98.js) baut Spielfeld, Rasen, Tribünen, Tore und Spieler für Demo und echte Partien auf. Die Kameraseite bleibt ohne Dach, damit die Übersicht frei bleibt.
- [dist/world-pitch3d-v98.js](../dist/world-pitch3d-v98.js) projiziert den vorhandenen Matchzustand in die Szene, einschließlich Seitenwechsel, hoher Bälle, Torszene und Abseits. Grafikzufall verbraucht keine Zufallswerte der Simulation; die Darstellung verändert den Matchzustand nicht.
- `dist/world-pitch-actions-v99.js` ergänzt Wurf- und Paradeposen und Flugkurven aus bestehenden Ereignissen. Flüchtige Daten werden nicht gespeichert; Pausen halten die Erholung an.
- `dist/pitch-motion-v102.js` bindet bestätigte Feldspieleraktionen und Luftduellkontakte an flüchtige Posen und Ballhöhen. Es enthält auch die reine Interpolation und Gelenkbewegung; Daten werden nicht gespeichert.
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
node work/test-world-pitch-actions-v99.cjs
node work/test-pitch-motion-v102.cjs
$env:D6_TEST_URL = 'http://127.0.0.1:4190/'
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' work/check-pitch-motion-v102.cjs
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' work/check-world-pitch-ui-v100.cjs
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' work/check-world-pitch-restarts-v101.cjs
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' work/check-world-pitch3d-camera.cjs
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' work/check-world-pitch3d-browser.cjs
```

Der Browserdurchgang wurde mit der gebündelten Node-Laufzeit 24.19.0 und Edge ausgeführt; das normale `node` auf diesem Rechner ist 18.14.2. Auf anderen Rechnern lassen sich Playwright-Modul, Browserpfad und Testadresse über `D6_PLAYWRIGHT`, `D6_BROWSER` und `D6_TEST_URL` setzen. Dafür eine mit dem verwendeten Playwright kompatible Node-Laufzeit verwenden.

Der erste Test prüft Projektion, Seitenwechsel, Ballflug, Tor und Abseits sowie unveränderten Matchzustand und unabhängigen Grafikzufall. Der vollständige Vergleich einer wiederholbaren Partie mit und ohne 3D ergab identische Zeitleiste, Ereignisse, Tore, Wechsel, Statistiken und verbuchtes Ergebnis. Das belegt diese Fixture; es ist keine umfassende Prüfung aller möglichen Partien.

Der zusätzliche Browserlauf `work/check-world-pitch-ui-v100.cjs` verwendet standardmäßig Port 4195 oder `D6_TEST_URL`. Er prüft das Menü samt Escape, Enter und Außenklick, tatsächliche Spielerbewegung vor dem Torwartabspiel, die Torproportionen, zwei Sekunden Schiedsrichteranzeige, den seitlichen Elfmeterball außerhalb des Pfostens, Halbzeitfokus und verlängertes Torbanner. Desktop und mobiles Querformat sowie englische Beschriftungen wurden ohne Browserfehler geprüft. Der vollständige Vergleich für Version 100 ergibt in beiden Ansichten 2.591 Schritte und 1:0 mit identischem verbuchtem Ergebnis; auch der Offline-Build samt SuperCollider-Audio wurde geprüft.

Der Kameratest verwendet standardmäßig Port 4173 (`D6_TEST_URL` kann die Adresse ersetzen). Er prüft die Ballprojektion an 15 Feldpositionen und bei einem schnellen langen Pass, die nahe/weite Auswahl, mobile Breite und englische Beschriftungen. Vergleichsbilder liegen in `outputs/camera-near-half.png`, `outputs/camera-wide-half.png` und `outputs/camera-near-mobile.png`.

Der isolierte Browserdurchgang prüft außerdem gezielt ausgelöste Engine- und UI-Pfade: Torbanner und angehaltene Torszene, Abseits, Bankwechsel durch Ziehen samt ausgeführtem Wechsel und korrekter Minutenanzeige, Elfmeterszene, Halbzeit und Abpfiff, Tablet-Hochformat, Grafikkontextverlust mit Wiederaufnahme und Verlassen der Partie. Im eingebetteten Offline-Build wurden der Start einer echten 3D-Partie, das Dekodieren der SuperCollider-Sounds und die Stadionatmosphäre geprüft. Die bestehenden zehn Match-, UI-, Trikot- und Speichertests sind ebenfalls erfolgreich; sie ergänzen die Integrationsprüfung.

Die abschließende Browserprüfung ist erfolgreich: Die echte Abseitsfunktion zeigt die drei vorgesehenen Fahnenposen aus dem bestehenden Szenenablauf ohne zentralen Banner. Deutsch → Englisch → Deutsch wurde in derselben Partie einschließlich Navigation sowie zugänglicher Spielfeld- und Spielerbeschriftungen geprüft. Die Wechselminute verwendet bei fehlender Ereignisminute die vorhandene Matchminute; gezielte Prüfungen decken 17′ und 0′ ab, ohne gespeicherte Partien zu verändern. Maßgeblich sind die verbindlichen Regeln in [product.md](product.md) und die Abnahmebedingungen in [development.md](development.md).

Browsergrößen werden auf einem Desktop emuliert. Die bestätigte Funktion der ersten Kamerademo auf einem Mobiltelefon ersetzt keine Hardwareprüfung dieser Integration. Leistung der neuen Grafik auf echten Telefonen und eine Hörprüfung bleiben offen; eine feste Bildrate ist nicht zugesichert. Lokale Prüfergebnisse stehen in `outputs/world3d-parity.json`, die Screenshots unter `outputs/world3d-*.png`.

Der vollständige Vergleich für Version 101 ergibt in 2D und 3D identische 2.543 Schritte und 0:0 mit demselben verbuchten Ergebnis. Der neue Browserlauf prüft außerdem die bewusste 2D-Wahl beim Fortsetzen und trifft Rück- und Dachnetz. Der gezielte Aktionstest prüft zusätzlich Seitennetzkontakt und die unveränderte Ausschwingzeit bei der Ballannahme. Neue Flugzeiten können den späteren Verlauf gegenüber älteren Versionen ändern; der Vergleich beweist Gleichheit der Ansichten innerhalb des aktuellen Stands.

## Live-Abnahme 104 (1. Oktober 2026)

Der [Vorschau-Workflow](https://github.com/thealextd1337-spec/FM/actions/runs/36884844932) veröffentlichte Version 104 ausschließlich nach `/3d/`. Quell-Build, Live-HTML und die Datei `doppel6.html` in der heruntergeladenen ZIP sind bytegleich: SHA-256 `838fe81492a5cb6c49ca571f5654a2d0a2853ce2777eaca6b3d3f7eb27e8684f`; ZIP 12.440.291 Bytes. Die Hauptseite ist gegenüber dem Stand vor 103 unverändert.

Die isolierte Live-Browserprüfung bestätigt Bodenabstand, 28 Aktions- und 20 Luftduellfälle sowie Torwiederholungen für beide Teams/Halbzeiten, Überspringen, natürliches Ende, Pause, Hochformat-Abbruch, nachfolgende Wechsel, Elfmeter und den bestehenden Audio-Lebenszyklus ohne Browserfehler. `work/check-gait-ground-v104.cjs` misst an 289 Standkontakten höchstens 0,00481 Szenenmeter Sohlenabstand zur Rasenhöhe; in der mittleren Schwungphase liegt die Sohle mindestens 0,172 Szenenmeter hoch. 284 Zeichenaufrufe und 322 Geometrien entsprechen dem Stand 102. Die Messung verwendet Software-WebGL, keine echte Mobilhardware. Neue Sounderzeugung wurde nach dem gemeldeten nativen scsynth-Absturz auf Nutzerwunsch beendet und vollständig aus den veröffentlichten Assets zurückgenommen.
