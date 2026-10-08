# Bodenspiel, Übergänge und Eigentoranzeige v123

Lokal im regulären Spiel integriert, 4. Oktober 2026. Quellstand `dist/`, Offline-Datei [Doppel-6-Fussballmanager.html](../../outputs/Doppel-6-Fussballmanager.html). Keine Veröffentlichung; Seitenfuß bleibt **PROTOTYP 105**. Bestehende Spielstände, abgeschlossene Partien und ältere Studien werden nicht nachberechnet.

## Lauf und Stopp

Das hakelige freie Laufen wurde in der tatsächlichen Renderkette reproduziert: Bei 20-Hz-Physik und schwankenden Bildzeiten erkannte der Adapter normale Geschwindigkeitsschwankungen als starkes Bremsen. Der erste Laufnachweis enthält 55 falsche Bremsbilder bei 30 Hz und 68 bei unregelmäßigen Bildzeiten. Bremsen verlangt jetzt einen bestätigten Stillstand oder starke Verzögerung bei bereits niedriger Restgeschwindigkeit. Die korrigierte Reihe enthält **null falsche Bremsclips in allen acht Fällen**, jeweils mit/ohne Ball bei 30/60/120 Hz und unregelmäßigen Bildzeiten. [Reproduktion](running-initial-v123.json), [Korrektur](running-qa-v123.json), [Prüfskript](../../work/check-running-v123.cjs).

Beim Stehenbleiben wurde außerdem der breite, nach vorn geneigte Meshy-Sprintstopp auch nach langsamem Gehen eingeblendet. Gehen endet nun im ruhigen Stand; schnelles Stoppen verwendet nur den ruhigeren Clipausklang mit geringerem Gewicht. Nach bestätigtem Stillstand laufen keine eingefrorenen Laufgewichte weiter. Die zuletzt dargestellte Rigpose blendet über 0,32 Sekunden in den Stand; Fußanker werden dabei neu freigegeben. Native Standbilder wurden visuell geprüft. [Stopp-/Bodennachweis](ground-visual-qa-v123.json), [Baseline](ground-visual-baseline-v123.json), [Rohclips](source-ground-v123.json).

## Bodenannahme, Dribbling und Zweikampf

- Bodenpässe und Abfänge werden nur in höchstens **0,80 m** tatsächlicher Kontaktweite übernommen. Früher akzeptierte eine normierte Abstandsschwelle mehrere Meter; dadurch konnte ein entfernter Spieler den Ball übernehmen und dessen Richtung ändern. Die Anlaufplanung berücksichtigt jetzt Meterabstand, echte Flugzeit und Geschwindigkeit. Ein verfehlter Kontakt bleibt ein freier Ball mit dem bisherigen Schwung.
- Der erste Kontakt bleibt am Passendpunkt und geht über 0,30 Sekunden kontinuierlich vor die tatsächliche Bewegungsrichtung. Technik verbessert Kontrolle und Ballnähe; enger Gegnerdruck erhöht die Wahrscheinlichkeit einer verspringenden Annahme. Fehlkontrolle erzeugt einen freien Ball mit eigener Ausgangsgeschwindigkeit statt eines sofortigen Besitzwechsels.
- Ballführer drehen ihr Laufziel schrittweise, Technik beeinflusst die Drehrate und das Bewegungstempo mit Ball. Der sichtbare Dribbelball folgt dem physischen Ball; eine zweite seitliche Grafikbahn entfällt. Die bestehenden Rückwärts-/Vorwärtsverfolgungsregeln bleiben aktiv. Die Grafik verändert keine Simulationspositionen.
- Stehende Zweikämpfe verlangen höchstens 0,95 m Ball- und 1,25 m Körperkontaktweite. Grätschen werden nur bis 2,60 m angesetzt und laufen mit ihrer bestehenden realen Dauer aus. Zweikampf/Stellungsspiel und Technik bestimmen weiterhin Erfolg und Kontrolle; Geschwindigkeit und Frische wirken über die vorhandene Fähigkeitsberechnung. Der stehende Zugriff nutzt einen angepassten vorhandenen Meshy-Fußkontaktclip.
- Hohe Zuspiele unter **7 m** werden als Bodenpass ausgeführt, auch bei entsprechend kurzen Ecken.

[Szenenprüfung](ground-scenarios-qa-v123.json): 2.000 Annahmen, 3.000 Zweikämpfe, Keeper-Ausspielwahl, zwei Abprallerfolgen, nahe/weite Zuspiele, Blockerreichbarkeit und ungestörtes Rollen. Gute Technik kontrolliert unter zwei nahen Gegnern 456/500, schwache 396/500 Annahmen. In 2 bzw. 4 m Entfernung wurden keine stehenden Zweikämpfe angesetzt. [Native Pass-/Ausspiel-Callbacks](ground-flow-qa-v123.json) bestätigen Kontakt bei 0,50 m und freien Weiterlauf bei verfehltem 2-m-Kontakt.

## Torwart und Abwehr

Torhüter wählen kurze freie Verteidiger mit offenem Passweg, andernfalls einen anderen freien Mitspieler für ein längeres Abspiel; fehlt ein sicherer Kandidat, warten sie. Gegner unmittelbar vor dem Empfänger oder im Passkorridor sperren das Ziel. Verteidiger fächern bei sicherem Keeperbesitz auf und laufen eine freie Anspielposition an; es werden nur Ziele geändert, keine Spieler versetzt.

Ein Keeper-Abpraller gilt weiter als gegnerische Gefahr, obwohl der ausgehende Ballflug technisch der Torwartmannschaft gehört. Die Verteidigung hält ihre Zuordnung, bis Keeper/Mitspieler tatsächlich kontrollieren oder das Spiel unterbrochen wird. Dasselbe Prinzip gilt für Feldblocks. Ein langer Keeper-Bodenabstoß erhält auch beim hohen Flug den Fuß-Nachschwung und zeigt keinen gehaltenen Ball.

Die Bodenkorrektur wird nach der Fang-/Armkorrektur erneut durchgeführt; die endgültige Handballposition wird anschließend neu gemessen. Dadurch schwebt die tiefe Fangpose nicht mehr über ihrer Kontaktfläche. Beim Aufstehen nach einem Torwartzugriff entfällt der Griff nach dem alten ankommenden Ballziel. Der dadurch reproduzierte Hüftsprung von 1,365 m sinkt im nativen Zugriffstest auf 0,274 m.

[Sieben native Keepersequenzen](keeper-visual-qa-v123.json): tiefer/hoher Fang, Abwehr links/hoch rechts, Rutschzugriff, freie Aufnahme und Nachschuss; Kontakt, Pause, Boden und Übergang geprüft. [15 Stopp-/Bodensequenzen](ground-visual-qa-v123.json) bei 30/60/120 Hz prüfen den Boden über die gesamte tiefe Fangphase, nicht nur am frühen Kontakt.

## Fernschüsse und Torwartdurchquerung

Die frühere Ziel-/Torwahrscheinlichkeit berücksichtigte die Schussdistanz nicht ausreichend: dieselben Werte lieferten bei 12, 24 und 40 m die gleiche Torquote. Genauigkeit und Verwertung sinken nun mit Entfernung. Ein zentraler niedriger/mittelhoher Fernschuss durch einen bereits richtig stehenden Keeper wird gehalten oder abgewehrt. Erfolgreiche niedrige/mittelhohe Abschlüsse führen an seiner tatsächlichen Körperposition vorbei; physische und sichtbare Zielposition stimmen überein.

3.000 kontrollierte Abschlüsse, je 500 pro Profil/Distanz:

| Entfernung | Schwächerer Abschluss: Tore | Stärkerer Abschluss: Tore |
| --- | --- | --- |
| 12 m | 43/500 | 176/500 |
| 24 m | 10/500 | 42/500 |
| 40 m | 3/500 | 9/500 |

Im Test keine zentralen niedrigen/mittelhohen Fernschusstore durch den gesetzten Keeper. Sechs erfolgreiche native Torbahnen für beide Teams prüfen den Abstand zur **gesamten Skinoberfläche einschließlich Händen**: kleinster Abstand 0,294 m bei Ballradius 0,176 m. [Schussfälle](ground-scenarios-qa-v123.json), [Skinfreiheit](goal-clearance-qa-v123.json). Das ist ein Nachweis für diese vorbereiteten Bahnen, keine allgemeine Mesh-Kollisionssimulation.

## Eigentore und Pokalrunde

Neue Eigentore nennen den tatsächlichen Verursacher: Ergebnis-/Live-Torlisten und Spielbericht zeigen **Name (E.)**, der Torbanner **Name (Eigentor)**. Bei einem weiterrollenden Abpraller wird die vorhandene Ballereigniskette bis zum letzten verursachenden Spieler zurückverfolgt. Ohne eindeutige Ereigniskette bleibt die bestehende Zuordnung erhalten; alte Eigentore werden nicht rekonstruiert.

Die Verursacherkennung wird als `ownGoalPid` getrennt gespeichert. `scorerPid`/normale Torkennung bleiben leer; persönliche Tore, Liga-Torschützenliste, Saisontore und Karrieretore steigen dadurch **nicht**. Das Tor zählt nur für die gegnerische Mannschaft. Der Banner zeigt „Eigentor“ statt einer erhöhten persönlichen Saisontorzahl. Deutsch/Englisch, beide Teams, direkter Ballweg, weiterrollender Block und Keeper-Eigentor sowie normale Tore geprüft. [Native Anzeige-/Bilanzfälle](own-goals-qa-v123.json).

[Abpfiff-/Karriereprüfung](own-goal-career-qa-v123.json) führt die reguläre Ergebnisbuchung aus: Spielstand 0:1, null persönliche Tore im Matchdatensatz und in der neuen Historienzeile, keine Aufnahme in die Liga-Torschützenliste, unveränderte Karrieretore auch nach JSON-Speichern/Laden. Frühere Karrierewerte bleiben erhalten.

Die Pokalüberschrift enthält die Runde: „POKALSPIEL · Viertelfinale“, „· Halbfinale“ bzw. „· Finale“. Alle drei Anzeigen im nativen Match-UI geprüft. [UI-Nachweis](ground-flow-qa-v123.json).

## Vollständige Prüfung und Werteeinfluss

- [90 vollständige physische Partien](match-study-v123.md): je 30 gut/gut, gut/schwach und schwach/schwach, feste Taktiken und gleiche Anfangsbedingungen. Stark gegen schwach: **28 Siege, zwei Remis, 77:7 Tore**. Alle sieben bisherigen Werteeinflusskriterien bestanden; Schuss-/Keeperbilanzen jeder Partie ausgeglichen. Schwach/schwach erzielt nur 0,60 Tore/Partie; diese Balancefrage bleibt dokumentiert.
- Nach der Eigentoranzeige dieselben 90 Partien im endgültigen Build nochmals gespielt: Ergebnis, Mannschaftszähler, Zufallsziehungen, Schrittzahlen und Torverläufe bleiben exakt gleich. [Vergleich](own-goal-outcome-parity-v123.json).
- [Zwei vollständige Warping-Partien](warping-qa-v123.json): insgesamt 5.222 Physikschritte und 15.660 Renderbilder, beide Halbzeiten, null sichtbare Verletzungen der unveränderten Grenzen. Maximal Engine 0,390 m, Root 0,330 m, Hüfte 0,550 m und Ball 0,885 m pro jeweiligem Prüfschritt. Verdeckte Standardversetzungen werden separat erfasst. Lange Zahlenläufe sparen GPU-Zeichnen; sie sind keine Hardware-FPS-Messung.
- [Animationsaudit](animation-audit-qa-v123.json): zwölf Richtungs-/Ballführungsfälle und 3.600 native Matchframes; keine rückwärts laufenden Ballführer oder Ballposition hinter dem bewegten Träger. [Lokomotion](locomotion-qa-v123.json), [Ballkontakte](ball-actions-qa-v123.json), 21 fokussierte Schussbilanzfälle und bestehende Engineprüfungen bestanden.
- Regulärer Offline-Build: vollständige [2D-/3D-Parität](match-parity-qa-v123.json), Pausen, Wechsel, Abseits, Elfmeter, Halb-/Abpfiff, Rotation, Kontextverlust, Entsorgung und Offline-Audio bestanden. [Vier Replayfälle](replay-qa-v123.json) inklusive Pausen und Elfmeterszene bestanden. [Hashes und Abnahme](verification-v123.json).

## Meshy, Dateien und Reproduktion

Vorhandenes Meshy-Modell und **32 Clips** weiterverwendet. Meshy-Katalog und rohe Brems-/Keeperclips geprüft; keine neue Generierung, kein Assetwechsel, **0 zusätzliche Credits**. GLB-Hash `39eee0c85c05a93496d1679330c0fcd81a9f5f87d8ad13876c61d29cb3a09cb2`.

Betroffene Produktionsdateien sind in [verification-v123.json](verification-v123.json) einzeln gehasht; die Prüfung kontrolliert ihren eingebetteten Quelltext im regulären Build. Neue native Tests: `work/check-running-v123.cjs`, `check-ground-visual-v123.cjs`, `check-ground-scenarios-v123.cjs`, `check-ground-flow-v123.cjs`, `check-own-goals-v123.cjs`, `check-own-goal-career-v123.cjs`; vorhandene Clipgates über `run-ground-regression-v123.cjs`, Studienmethode im [Statistikbericht](match-study-v123.md). Abschließende Abnahme: `node work/verify-ground-block-v123.cjs`.

Vorbereitete Szenen und ausgewählte vollständige Partien belegen die Korrekturen. Seltene Situationen anderer Matchverläufe und schwache Offensivbalance benötigen weitere Beobachtung. Die kompakte Hintergrundsimulation wurde in diesem Block nicht umgestellt.
