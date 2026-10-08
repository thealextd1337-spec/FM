# Kopfbälle und Luftzweikämpfe v122

Lokal im regulären Spiel integriert, 4. Oktober 2026. Quellstand: `dist/`. Keine Veröffentlichung; Seitenfuß bleibt **PROTOTYP 105**. Bestehende Spielstände, abgeschlossene Partien und ältere Fähigkeitsstudien werden nicht neu berechnet.

## Verhalten

- Hohe Pässe, Flanken und Ecken erhalten je einen erreichbaren Angreifer und Verteidiger als Anlaufkandidaten. Die Planung berücksichtigt Meterabstand, tatsächliche Flugzeit, Laufgeschwindigkeit und eine vom Stellungsspiel abhängige Reaktionsschätzung. Andere Spieler behalten ihre normalen Laufziele. Ein älterer Flankenadapter überschreibt diese Ziele in der Vereinswelt nicht mehr.
- Am Kontakt entscheidet die aktuelle Position: höchstens **0,65 m** zum Ball, erreichbare Kandidaten werden vor der Fähigkeitsauswahl gefiltert. Entfernte Spieler können weder den Ball übernehmen noch einen nahen Kandidaten allein durch ihren Luftspielwert verdrängen. Ein echtes Duell zählt nur, wenn beide Teams den Kontakt erreichen. Luftspiel, Stellungsspiel und tatsächlicher Kontaktabstand beeinflussen den Gewinner.
- Sprungvorbereitung beginnt nur bei zugewiesenen, bereits nahen Kandidaten in den letzten 0,30 Sekunden. Gewinner spielen den Ball, der Gegner landet mit eigenem Ausklang. Die Bildpuffer behalten die Sprungvorbereitung beim Übergang zum Kontakt. Körperkorrektur zum Ball ist auf 0,45 m begrenzt.
- In Tornähe kann der Gewinner köpfen oder direkt volley abschließen. Außerhalb der bereits wertabhängigen Kopfball-Schussweite entsteht kein Distanzkopfball auf das Tor. Eine Ablage per Kopf wählt einen erreichbaren Mitspieler im Umkreis von 14 m; auch Passzielstreuung und vorgesehene Kopfballpasslänge bleiben begrenzt. Luftspiel, Technik und Passspiel beeinflussen die Präzision, Stellungsspiel und Passspiel die Wahl der Ablage.
- Kopfballschüsse und Klärungen verwenden Fähigkeitstempo statt festem 14-/18-m/s-Tempo. Klärungen legen ihre echte Flugzeit aus Strecke und Kopfballtempo fest. In der eigenen Gefahrenzone und unter realem Gegnerdruck wird häufiger geklärt; Technik und Stellungsspiel verbessern die Annahme. Ein verfehlter Luftkontakt bleibt ein freier, weiterfliegender Ball mit kontinuierlicher Höhe und anschließendem Fall.
- Die Abseitsbewertung bleibt am Abspielzeitpunkt; der direkte Eckball ist weiterhin ausgenommen.

## Weitere im Matchtest gefundene Korrekturen

**Eckball nach Spielerwechsel:** Die Anlaufziele waren an das ausgewechselte Spielerobjekt gebunden. Der neue Eckballschütze blieb dadurch am alten Ausgangsort, obwohl die Ecke ausgeführt wurde. Eingewechselte Spieler übernehmen nun das flüchtige Standardziel. Die Ecke wartet auf die Ankunft der Spieler; der Schütze stellt sich hinter den Ball und der Flug startet am Eckpunkt. Im anfänglichen Matchnachweis sprang der sichtbare Ball bei dieser Ecke um 4,43 m pro Bild; der endgültige Lauf verletzt die bestehende Ballgrenze nicht mehr.

**Grätsche → Drehen:** Nach dem Ende einer prozeduralen Grätschenpose konnte das Rig unmittelbar in den nativen Drehclip wechseln. Die Diagnose zeichnet Pose, Clipgewichte, Root, Hüfte und Fußanker auf; sie reproduziert einen Hüftsprung von rund 0,65 m. Der Ausklang übernimmt jetzt die zuletzt gezeichnete lokale Pose und blendet über 0,32 Sekunden in die Lokomotion. Die Warping-Grenzen wurden nicht erhöht.

## Meshy und Assets

Die vorhandene Meshy-Figur und ihre **32 Clips** bleiben erhalten. Kopfball, Absprung und Landung werden am vorhandenen Rig prozedural ausgeführt und auf den Kopfkontakt kalibriert; es wurde **kein neuer Meshy-Kopfballclip erzeugt**. Der GLB-Hash bleibt `39eee0c85c05a93496d1679330c0fcd81a9f5f87d8ad13876c61d29cb3a09cb2`. Keine neuen Credits verbraucht.

## Nachweise

| Prüfung | Ergebnis |
| --- | --- |
| Entfernte Kontakte / verdrängter naher Kandidat | Zwei Kontakte aus 2 m entfernt; naher Kandidat kommt jetzt zum Ball. Baseline und finale Szenen gespeichert. |
| 1.600 Luftduelle mit isoliertem Fähigkeitstausch | Luftspiel-Fixture: 143/400 bzw. 258/400 Siege; Stellungsspiel-Fixture: 177/400 bzw. 225/400. Tatsächliche Duelle jeweils 400. |
| 800 Annahmen, nur Technik variiert | 220/400 bzw. 343/400 erfolgreiche Annahmen bei derselben Szene und gepaarten Zufallsstarts. |
| Kopfballtempo in beiden Spielrichtungen | In den schwachen/starken Fixtures 7,27 bzw. 10,27 m/s statt fester 14/18 m/s. Fernkopfball wird zur Ablage. |
| Freier hoher Ball und Standardausnahme | Kein Höhenreset oder sofortige Ballaufnahme ohne Kontakt; gewöhnliches Abseits gepfiffen, direkter Eckball ausgenommen. |
| Sechs 3D-Luftsequenzen bei 30/60/120 Hz | Kopfballschuss, Ablage und Klärung in beiden Richtungen; endliche Gelenke, unveränderte Engine beim Rendern, Pause, Sprung und Landung. Separate genaue Kontaktpose am bestätigten Ort: Abstand zur skinned Kopfoberfläche 0,108–0,171 m, innerhalb des Ballradius 0,1764 m. |
| Vier native Eckballabläufe | Beide Teams, jeweils mit/ohne Wechsel des Schützen; Ziel geerbt, Ankunft abgewartet, Ausgangspunkt exakt Eckpunkt, Bewegung höchstens 0,06 m pro 10-ms-Schritt. |
| Zwei vollständige native 3D-Partien | Seeds 12345 und 8721, Ergebnisse 0:2 und 2:0; 6.674 Physikschritte, 20.016 gezeichnete Rig-/Ballbilder, keine Verletzung bestehender Warping-Grenzen. |
| Bestehende Regressionen | Ballrollen, erreichbare Blocks, Klärungen, hohe Eckballnachläufe, Fuß-/Handkontakte, Torwartfähigkeit und sieben Keepersequenzen einschließlich Nachschuss bestanden. Lokomotion, Stand/Drehen/Stopp, Bildraten und Legacy-Regeln bestanden. |
| Regulärer Offline-Build | Identische 2D-/3D-Zeitlinie, Tore, Statistik, Wechsel und Ergebnisbuchung; Banner, Pause, Abseits, Elfmeter, Halbzeit/Abpfiff, Orientierung, Kontextverlust, Verlassen und eingebettete Offline-Assets bestanden. |
| Wiederholungen | Vier Torwiederholungen für beide Teams und Feldrichtungen, Pause/Abbruch/Orientierungswechsel, verschobener Wechselbanner, Elfmeterwiederholung und Ton bestanden. |

Die Fähigkeitszahlen sind interne Fixtures und erscheinen nicht als exakte Spielerwerte in der Spieloberfläche. Die beiden Warping-Partien sind keine neue allgemeine Balance- oder 90-Partien-Studie. Absichtlich unsichtbare Ballversetzungen bei Standards und der eingefrorene Abseitsanalyseschnitt werden gesondert erfasst. Eine einfache Körpertrennung bleibt bestehen; die Kopfkontakte sind anhand der genannten Situationen geprüft, keine allgemeine Hautkollisionssimulation. Mobil-Leistung auf echter Hardware wurde nicht neu gemessen. Die kompakte Simulation paralleler KI-Partien bleibt unverändert.

## Dateien und Wiederholung

Quelländerungen: `pitch-v55.js`, `pitch-v56.js`, `pitch-motion-v102.js`, `player-user-meshy-v107.js`, `world-pitch3d-v98.js`, `set-pieces-v50.js`, `world-physical-v65.js` unter `dist/`.

Neue Prüfungen unter `work/`: `check-air-scenarios-v122.cjs`, `check-air-visual-v122.cjs`, `check-air-corners-v122.cjs`, `check-live-air-v122.cjs`, `diagnose-air-turn-v122.cjs`, `run-air-regression-v122.cjs`, `verify-air-block-v122.cjs`. Node aus der gebündelten Codex-Laufzeit verwenden; Browserchecks starten isoliertes Edge mit Software-WebGL. Zuerst `build.cjs`, dann `generate-user-meshy-match.cjs` ausführen. Der Regressionsadapter legt eigene v122-Belege an; Kopfballklärungen werden bis zu ihrer tatsächlichen neuen Landezeit geprüft.

- [Szenen-Baseline](air-scenarios-baseline-v122.json), [finale Fähigkeitsszenen](air-scenarios-qa-v122.json)
- [Rig-, Kontakt- und Bildratenprüfung](air-visual-qa-v122.json), [Eckbälle und Wechsel](air-corners-qa-v122.json)
- [Erster Warping-Lauf](warping-initial-v122.json), [Grätsche-/Drehdiagnose](air-turn-baseline-v122.json), [finale vollständige Partien](warping-qa-v122.json)
- [Ballphysik](ball-motion-qa-v122.json), [native Ballaktionen](ball-actions-qa-v122.json), [Keeper-Szenen](keeper-scenarios-qa-v122.json), [Keeper-Rig](keeper-visual-qa-v122.json), [Lokomotion](locomotion-qa-v122.json)
- [Reguläre Matchparität](match-parity-qa-v122.json), [Wiederholungen](replay-qa-v122.json)
- [Abschlussmanifest und Hashes](verification-v122.json)
- [Reguläres lokales Spiel](../../outputs/Doppel-6-Fussballmanager.html)

Kontaktbilder: [Schuss](../../outputs/air-shot-0-v122.png), [Ablage](../../outputs/air-layoff-0-v122.png), [Klärung](../../outputs/air-clear-0-v122.png). Die Bilder zeigen die separate Kontaktpose; die Kontinuitätsmessung stammt aus den vorher laufenden nativen Sequenzen.
