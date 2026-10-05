# Höhere Abwehr und Elfmeter-Schussbutton v126

Lokal im [regulären Offline-Spiel](../../outputs/Doppel-6-Fussballmanager.html) integriert, 5. Oktober 2026. Seitenfuß **PROTOTYP 106**, noch nicht veröffentlicht. Bestehende Ergebnisse und Statistiken werden nicht nachberechnet; das Meshy-Modell mit 32 Clips bleibt erhalten.

## Abwehr beim Ballbesitzwechsel

Die Abwehrplanung setzte beim Ballbesitzverlust sofort ein tieferes Grundziel. Zusätzlich zog die Deckung tief stehender Stürmer die Verteidiger zurück, obwohl die Stürmer im Abseits waren. Im kontrollierten [Ausgangstest](defensive-line-baseline-v126.json) wurde dadurch ein zunächst abseits stehender Stürmer in allen sechs Kombinationen aus Richtung und niedriger/neutraler/hoher Abwehrlinie nach zwei Sekunden wieder anspielbar.

`world-backpedal-v108.js` hält den Block bei entferntem gegnerischem Ballbesitz nun höher. Der Ballabstand wirkt zusätzlich zur taktischen Grundlinie; niedrige, neutrale und hohe Einstellung bleiben unterscheidbar. Mit dem Vorstoß des Balls entfällt das zusätzliche Aufrücken. Entfernte Stürmer ziehen den Block nicht mehr durch Manndeckung zurück. Aktuell abseits stehende untätige Läufer werden anhand derselben Körper-/Ballgrenze wie die eigentliche Abseitsregel aus der Deckungszuordnung genommen.

Nahe Ballführer, echte Durchbrüche und anlaufende Empfänger eines bereits fliegenden Balls verlangen weiterhin Deckung. Der gespeicherte Abspielstatus eines Passes bleibt maßgeblich. Deckungsabstand und Vorhersage hängen weiterhin vom Stellungsspiel ab; eigene Torwart-Ausspieloptionen und defensive Zuordnung nach Abprallern bleiben erhalten.

[54 Korrekturszenen](defensive-line-qa-v126.json): beide Richtungen, drei Linien, ferner Ballbesitzwechsel, nahe legale/abseits stehende Läufer, Durchbruch, Flug, freier Ball, Torwart-Abpraller und eigener Torwartbesitz. In allen sechs Problemfällen bleibt der festgehaltene Stürmer im Abseits. Planung ohne physische Verschiebung und unabhängig von der Spielerreihenfolge; Bewegung mit bestehendem Fähigkeitstempo. Feststehende Angreifer isolieren die Abwehrursache: Im echten Spiel können Stürmer weiterhin aus dem Abseits zurücklaufen. Keine garantiert erfolgreiche Abseitsfalle.

## Elfmeterschießen

Die Oberfläche blendet den ursprünglichen Schussbutton zugunsten einer Kopfzeilenaktion aus. Für Vereinswelt-Elfmeterschießen fehlte diese Ersatzaktion. Der [isolierte Ausgangstest](penalty-controls-baseline-v126.json) reproduziert die vorherige Kopfzeilenregel auf dem aktuellen Build: Desktop und Mobil zeigen keinen bedienbaren Schussbutton.

`world-physical-v65.js` bietet nun **„Schießen“** in der Kopfzeile. Jeder Klick führt genau den nächsten eigenen oder gegnerischen Elfmeter aus. Nach der Entscheidung wechselt die Aktion zu **„Zum Spielbericht“** und verbucht das Ergebnis über den bestehenden Ablauf. Die Schützenwahl behält ihren Bestätigungsdialog. Der funktionslose Match-Pauseknopf entfällt in dieser Szene, damit die Schussaktion auch mobil lesbar bleibt. `i18n-v75.js` ergänzt „Shoot“ für Englisch.

[Desktop-/Mobilprüfung](penalty-controls-qa-v126.json): sichtbarer und vollständig passender Button, ein Schuss pro Klick, Pause und echtes Neuladen mit genau einem erhaltenen Schuss, Fortsetzung bis zur Entscheidung, Wechsel zum Spielbericht und gebuchtes Ergebnis. [Desktopbild](../../outputs/penalty-controls-1270-v126.png), [Mobilbild](../../outputs/penalty-controls-390-v126.png).

## Weitere Abnahme

- [Stellungsspiel und Fähigkeiten](positioning-qa-v126.json): getrennte Deckung, taktische Linien, Vorwärtsverfolgung, Lauf-Timing und Querpasswahl.
- [Freie Bälle und gültige Tiefenläufe](free-ball-positioning-qa-v126.json): Abseitsziele, Kontaktziele der Passempfänger und Standardausnahmen bleiben erhalten.
- [Körpergrenze](offside-body-qa-v126.json): Körper-/Ballgrenze, Grätschen, beide Richtungen und gespeicherter Abspielstatus.
- [Bodenspiel](ground-scenarios-qa-v126.json): verteidigte Abpraller, sichere Torwart-Ausspiele, Zweikampfweite und Distanzschüsse.
- [Zwei vollständige 3D-Partien](warping-qa-v126.json): 4.830 Simulationsschritte, 14.484 dargestellte Bilder. Keine Verletzung der bestehenden Grenzwerte für physische Spielerwege, sichtbare Root-/Hüftbewegung oder sichtbaren Ball; keine Rendereränderung der Simulation. Unsichtbare Ballumstellungen bei Unterbrechungen separat erfasst. GPU-Zeichnen und Wiederholungen sind in dieser Bewegungsmessung ausgenommen.
- [Regulärer 2D-/3D-/Offline-Vergleich](../../outputs/world3d-parity-v126.json): identische Ereignisse, Ergebnis und Statistiken über 2.159 Schritte; Browsergates für Standards, Pause, Wechsel, Halbzeit, Abpfiff, Geräteorientierung und Offline-Ressourcen bestanden.
- `test-positioning-v121.cjs`, `test-world-penalties-v65.cjs` und `test-v42.cjs` bestanden. Die kleine Stellungsspielprüfung lädt jetzt die tatsächliche gemeinsame Abseitsregel.

[Abschlussmanifest](verification-v126.json): eingebettete Quellen, identische Offline-Dateien, Modell und erhaltene historische Nachweise. Eigene v126-Dateien; keine Veröffentlichung oder neuen Credits. Die Abwehränderung kann künftige Matchoutcomes ändern. Zwei vollständige Partien sichern technische Regressionen ab und ersetzen keine neue statistische Balancekalibrierung.
