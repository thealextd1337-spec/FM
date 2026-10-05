# Stellungsspiel, Verfolgung und Abseits – lokaler Block v121

Der reguläre lokale Offline-Build enthält eine gemeinsame Zuordnung der Abwehr, eindeutige Vorwärtsverfolgung im Meshy-Modell und eine vorausschauende Reaktion auf die Abseitslinie. Bestehende Spielerfähigkeiten bestimmen Ausführung und Entscheidungen. Keine neuen Fähigkeiten, Speicherfelder oder Meshy-Assets; vergangene Ergebnisse werden nicht nachberechnet. Keine Veröffentlichung, Seitenfuß weiterhin PROTOTYP 105.

## Ursachen und Änderungen

- **Doppelte Deckung:** In der engen Dreierabwehr wollten zwei Verteidiger zum selben zentralen Läufer: Ziel-x 0,488 und 0,491. Der linke Läufer bei x 0,18 blieb frei. Die neue Planung verteilt Ballführer und gefährliche Läufer einmal pro Bewegungsschritt auf unterschiedliche Verteidiger. Entfernung wird in Metern gemessen, die gesamte Abwehr verwendet dieselbe Momentaufnahme vor der Bewegung. Die Zuordnung ist unabhängig von der Reihenfolge der Spieler im Array. In der Reproduktion werden nun der linke Läufer, der zentrale Läufer und der Ballführer getrennt gedeckt.
- **Taktische Linie:** Nicht direkt gebundene Verteidiger halten die gewählte tiefe, normale oder hohe Linie. Bei eigenem Ballbesitz rücken sie wie bisher hinter dem Spielaufbau auf; beim Torwartaufbau weniger weit. Tatsächliche Durchbrüche und tiefe Läufer erlauben individuelles Nachgehen. Höheres Stellungsspiel verkleinert den Deckungsabstand und vergrößert die begrenzte Antizipation aus dem beobachteten Spielerweg. Bewegung, Ankunft und bestehende Kontaktregeln bleiben zuständig; die Planung versetzt keine Spieler.
- **Sichtbare Rückwärtsverfolgung:** Der physische Lauf war bereits vorwärts und bei vollem Fähigkeitstempo. Beim Wechsel vom Rückwärtslaufen blieben jedoch kurz Rückwärtsclips und eine Körperrichtung entgegen dem Weg aktiv. Der flüchtige Modus `pursuit` kennzeichnet überspielte Verteidiger. Ihr Modell löst Rückwärtsgewichte und alte Stand-Blickwechsel und begrenzt den Richtungsrückstand während der Bewegung auf 60°. Normales defensives Rückwärtslaufen mit 60 % Tempo bleibt erhalten. Kein neuer Clip oder gespeicherter Animationszustand.
- **Lauf-Timing:** Das bestehende wertabhängige Timing bleibt erhalten; auch schwache Spieler dürfen Läufe richtig timen und Fehler machen. Zusätzlich berücksichtigt das Ziel die gemessene Bewegung des vorletzten Gegners: gute Spieler reagieren mit größerem Vorlauf auf eine vorrückende Abwehrlinie, maximal 1,2 m zusätzliche Absicherung. Die Balllinie bleibt maßgeblich. Nach dem Abspiel wird ein Empfänger weiter zum tatsächlichen Passziel geschickt; die Sicherung stoppt einen legal gestarteten Tiefenlauf nicht hinter der alten Linie.
- **Querpassentscheidung:** Das Stellungsspiel des Passgebers beeinflusst jetzt neben Passspiel und Technik das Erkennen des besser postierten Mitspielers. Zuvor änderte ein isoliert höheres Stellungsspiel diese Entscheidung nicht. Die bestehenden Prüfungen auf Abseits, freien Passweg und besseren Standort bleiben. Gute Spieler schießen weiterhin selbst; schwache können die richtige Passentscheidung treffen. Die Passgenauigkeit bleibt an die vorhandene native Ausführung gebunden.

Quellen: [Planung und Bewegungsmodi](../../dist/world-backpedal-v108.js), [Einbindung vor dem Bewegungsschritt](../../dist/game.js), [Meshy-Verfolgung](../../dist/player-user-motion-v108.js), [Querpasswahl](../../dist/pitch-v55.js).

## Zusätzlich in der Matchprüfung gefunden

Die erste vollständige Warping-Probe mit der neuen Stellungsspielregel machte zwei seltene bestehende Grafikübergänge sichtbar. Diese Reproduktion ist in [warping-initial-v121.json](warping-initial-v121.json) gesichert.

1. **Grätsche → Foulreaktion:** Der Foulclip allein war gleichmäßig; beim Einstieg nach einer prozeduralen Grätsche fehlte aber die zuletzt gezeichnete Pose. Sie wird nun über den vorhandenen lokalen Posepuffer an die Foulreaktion übergeben und innerhalb von 0,13 s überblendet. Im reproduzierten ersten Matchabschnitt sinkt der größte Hüftversatz von 1,69 auf 0,38 m pro Renderbild. Keine Änderung an Foulentscheidung, Freistoß oder Ballbesitz. [Übergang](../../dist/player-user-ball-actions-v111.js), [Poseübergabe](../../dist/player-user-meshy-v107.js), [Diagnose nach Korrektur](warping-foul-diagnosis-v121.json).
2. **Vorbereiteter Block → Abpraller:** Die Kontaktpose wurde beim neuen Block-ID zurückgespult; außerdem drehte die neue ausgehende Ballrichtung die Fuß-/Rootkorrektur. Der Puffer übernimmt jetzt eine bereits vorbereitete Blockpose, und die Reaktion behält die laufend geglättete Körperausrichtung. Ein Zwischenlauf belegt, dass allein das Entfernen des Zurückspulens noch nicht reicht: [warping-intermediate-v121.json](warping-intermediate-v121.json). Erst die korrigierte Ausrichtung beseitigt auch diesen Sprung. [Puffer](../../dist/world-pitch3d-v98.js), [Blockausrichtung](../../dist/pitch-motion-v102.js), [erster korrigierter Blockabschnitt](warping-block-diagnosis-v121.json).

## Gezielte Nachweise

[Native Szenen und Ergebnisdaten](positioning-qa-v121.json), [Baseline vor der Änderung](positioning-baseline-v121.json), [Verfolgungsanimation](pursuit-animation-qa-v121.json), [frühere Grafik im isolierten Test](pursuit-animation-baseline-v121.json).

Alle übrigen Fähigkeiten bleiben bei 12, Alter 25, Form 0, Frische 100. Schwache/starke Profile verwenden 6/18 für den jeweils genannten Wert. Gemeinsame Seeds und spiegelgleiche Situationen prüfen beide Spielrichtungen; die Spiegelungen sind keine unabhängigen statistischen Stichproben.

| Feste Szene, je Spielrichtung | Schwach | Stark |
| --- | ---: | ---: |
| Freien Querpass erkannt, nur Passspiel variiert, 300 Gelegenheiten | 153 / 300 | 252 / 300 |
| Freien Querpass erkannt, nur Stellungsspiel variiert, 300 Gelegenheiten | 185 / 300 | 222 / 300 |
| Tatsächliche Aktionswahl bei Zwei-gegen-eins, Passspiel und Stellungsspiel variiert, 200 Gelegenheiten | 88 Pässe / 112 Schüsse | 180 Pässe / 20 Schüsse |
| Tiefenlauf zeitweise im Abseits, nur Stellungsspiel variiert, 80 Läufe à 4 Sekunden | 40 / 80 | 0 / 80 |

Die letzte Zeile zählt Expositionen anhand der echten Abseitsmomentaufnahme, keine abgepfiffenen Abseitspässe und keine Matchquote. In der Baseline waren es 34 / 80 und 0 / 80; die geänderte Abwehr verändert die Laufgelegenheiten. Keine Kalibrierung der allgemeinen Matchbalance aus dieser kleinen Szenenauswahl.

Weitere Prüfungen: zwei getrennte Deckungsfälle, zwölf Linien-/Besitzkombinationen, zwei Vorwärtsverfolgungen mit tatsächlicher Schrittweite, sechs unzulässige Querpassziele, vier kontrollierte Fälle einer vorrückenden Abseitslinie sowie Abspielmoment und Standardausnahme in beiden Richtungen. Die tatsächliche Aktionswahl wird geprüft, indem die Auswahlziele von Pass/Schuss erfasst werden; daraus wird kein erfundener Passerfolg oder Tor berechnet.

Die Grafikprüfung umfasst zwölf Übergänge bei 30/60/120 Hz, gerade/diagonal und in beiden Richtungen. Ohne Korrektur waren Körper und Root anfangs entgegen der Laufrichtung ausgerichtet und Rückwärtsclips bis 86 % gewichtet. Nach Korrektur beträgt der Richtungsanteil des Roots mindestens 0,5 und des Rumpfs mindestens 0,33; Rückwärtsgewicht 0. Pause stabil, keine nicht-endlichen Gelenke, Matchzustand unverändert. Die Baseline ersetzt nur die neue Verfolgungskorrektur im Speicher des isolierten Testbrowsers; Produktionsdateien bleiben dabei unverändert.

## Abnahme und Reproduktion

Die abschließenden Match-, Kontakt- und Builddaten sind in [verification-v121.json](verification-v121.json) zusammengeführt. Alle Prüfungen bestanden. Zwei vollständige Partien umfassen 6.089 Simulationsschritte und 18.261 Renderbilder; in beiden keine Verletzung der vorab übernommenen Warping-Grenzen (Engine 1 m, Modellroot 0,6 m, Hüfte 0,65 m und sichtbarer Ball 1 m pro Bild/Schritt). Auch Pause, Gelenkendlichkeit und unveränderter Matchzustand beim Rendern sind bestanden.

| Finaler vollständiger Lauf | Größter Engine-Schritt | Größter Root-Schritt | Größter Hüftschritt | Größter sichtbarer Ballschritt |
| --- | ---: | ---: | ---: | ---: |
| Seed 12345 | 0,382 m | 0,417 m | 0,515 m | 0,937 m |
| Seed 8721 | 0,376 m | 0,450 m | 0,522 m | 0,959 m |

[Warping-Daten](warping-qa-v121.json) messen Engine, Modellroot, Hüfte und tatsächlich sichtbaren Ball getrennt, bei 20 Hz Simulation und 60 Hz Rendern. Physische Rohballversetzungen während Standardvorbereitung werden getrennt aufgezeichnet; für den sichtbaren Ball gilt die Ein-/Ausblendung. Torwiederholungen werden in diesem Zahlenlauf übersprungen und im regulären Browsergate geprüft. Die beiden Grafikreparaturen verändern weder Ergebnisse, Simulationsschrittzahlen noch Ereigniszahlen gegenüber dem ersten v121-Lauf.

Regulärer Offline-Build und Alias `outputs/index.html` sind bytegleich: 49.897.331 Bytes, SHA-256 `35b1ec7f8bd1e507608b457d2182b6a45a264666428929557c33d9588fa54988`. Normales 2D/3D-Match identisch bei 2.882 Schritten und 1:0 einschließlich Timeline, Statistik und Ergebnisbuchung. Browsergates für Banner, Pause, Abseits, Wechsel, Elfmeter, Halb-/Abpfiff, Geräteausrichtung, Grafikverlust, Entsorgung und Offline-Audio bestanden. Die wiederverwendeten zehn Ballkontaktfälle sowie 3.000 native Keeperabschlüsse, 400 Zugriffe und sieben Keepersequenzen bleiben bestanden; Modellhash unverändert, 0 Credits. Die gezielte Projektionsprüfung benötigte nur zwei fehlende Abhängigkeits-Stubs im Testharness, keine Änderung an der Spiellogik.

```powershell
node work/build.cjs
node work/generate-user-meshy-match.cjs
node work/test-positioning-v121.cjs
node work/test-defensive-motion-v108.cjs
node work/test-v55.cjs
node work/test-pitch-motion-v102.cjs
node work/test-world-pitch3d-v98.cjs
node work/check-positioning-v121.cjs
node work/check-pursuit-animation-v121.cjs
node work/check-live-warping-v121.cjs
node work/run-positioning-regression-v121.cjs work/check-user-ball-actions-v111.cjs
node work/run-positioning-regression-v121.cjs work/check-keeper-scenarios-v120.cjs
node work/run-positioning-regression-v121.cjs work/check-keeper-visual-v120.cjs
$env:D6_MODEL_TEST_FILE='outputs/Doppel-6-Fussballmanager.html'
node work/check-user-match-regression.cjs work/check-world-pitch3d-browser.cjs
node work/verify-positioning-v121.cjs
```

Die Torwart-/Kontaktadapter schreiben eigene v121-Nachweise und behalten frühere v111/v120-Berichte. `--baseline` beim Stellungsspieltest ist ausschließlich für den ursprünglichen Build gedacht; nicht auf den korrigierten Build anwenden. Die Verfolgungsbaseline rekonstruiert dagegen ausdrücklich nur das frühere Grafikverhalten im Speicher.

Diese Abnahme belegt die festen Szenen und aufgezeichneten Testpartien. Sie ist keine neue 90-/300-Partien-Werte-Studie, kein Hardware-FPS-Test und keine Garantie für jede mögliche Animation. Bestehende einfache Spielerseparation bleibt; vollständige Körperkollisionen gehören nicht zu diesem Block. Kopfball- und Luftzweikampfregeln folgen separat. Die kompakte Simulation der KI-Parallelspiele wird hier nicht geändert.
