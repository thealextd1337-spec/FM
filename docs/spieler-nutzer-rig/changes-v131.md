# Matchblock v131: Torwartkette, Ballführung und Rückschau

Stand: 5. Oktober 2026, lokal integriert und geprüft. Der reguläre Offline-Build ist [Doppel-6-Fussballmanager.html](../../outputs/Doppel-6-Fussballmanager.html). Keine Veröffentlichung, keine neuen Meshy-Aufträge und keine rückwirkende Berechnung alter Spiele. Das vorhandene Meshy-Rig mit 34 Clips bleibt erhalten.

## Torwartbewegungen und Torabdeckung

Die Kette verbindet Bereitschaft, Nachstellschritte, Absprung, Fangen beziehungsweise einhändige Abwehr, Bodenphase, Aufstehen und Rückkehr in die Bereitschaft. Während eines ausreichend langen Schussflugs darf der Keeper zunächst mit seinem normalen, geschwindigkeitsabhängigen Tempo nachstellen. Die Reaktionsverzögerung hängt vom Torwartspiel ab; die eigentliche Parade beginnt ungefähr 0,30 Sekunden vor dem Kontakt und verwendet die erreichte Position als Ursprung. Weite Paraden erhalten einen begrenzten seitlichen Weg. Hohe Bälle verwenden den vorhandenen hohen Meshy-Clip mit begrenzter Körper- und Handkorrektur. Auch seitliche und niedrige Paraden gehen in den Aufstehclip über.

Ein im vollständigen Match reproduzierter Fehler ließ die Parade einen Simulationsschritt vor dem gespeicherten Absprung beginnen und anschließend zurückspringen. Der Absprung wird jetzt nach dem Fortschritt des Ballflugs festgehalten, bevor die erste Parade gezeichnet wird. Der größte Hüftschritt in dieser Partie sank von 0,666 m auf 0,534 m. Bei pausierter bodennaher Aufnahme wurde außerdem die Ballposition des vorherigen Renderbilds erneut verwendet; dieser Kontaktabgleich läuft jetzt nur bei laufender Animation.

**Abdeckung ist zeitabhängig:** 80 native Sequenzen prüfen beide Tore, fünf seitliche Ziele bis ±4,75 m, vier Ballhöhen von 0,60 bis 3,05 m und Fangen/Abwehren. Bei 1,4 Sekunden Vorlauf, 0,19 Sekunden Reaktion und höchstens 3,77 m/s Nachstelltempo erreichen alle getesteten Handschuhe den Ball. Der minimale gemessene Körperabstand zum Boden beträgt 0,103 m. Die reale Engineprobe bestätigt 3,31 m Nachstellweg und einen Paradebeginn bei Fortschritt 0. Hohe pfostennahe Bälle sind damit grundsätzlich erreichbar; ein kurzer Schuss aus ungünstiger Ausgangsposition bleibt berechtigt schwer oder unerreichbar. Die Stichprobe ist kein Beweis für jede Flugbahn und garantiert keine Parade.

Die bestehende wertabhängige Schussentscheidung bleibt erhalten. Je 3.000 normale und hohe Schussfälle prüfen drei Geometrien mit schwachem/starkem Torwart: bessere Werte erhöhen die Paradequote; Fangparaden und Abpraller kommen in beiden Gruppen vor. Im zentralen Test steigt die Quote von 65,7 % auf 78,3 %. Höhe und Animation erzeugen keine automatische Fanggarantie.

## Weitere Änderungen des Blocks

- **Ballführung:** Kurze Geschwindigkeitspausen werden während des Dribblings nicht mehr als echtes Abbremsen behandelt. Die Schrittphase läuft mit gefiltertem Tempo weiter; ein bestätigter Stillstand geht weiterhin in die Standanimation. Die zusätzliche Lauf-Drehüberlagerung wird beim Ballführen unterdrückt. In den gepaarten Pulssequenzen bei 30/60/120 Bildern pro Sekunde sinken die falschen Phasenstopps von 37/76/153 auf jeweils 0 und die falschen Bremsübergänge von jeweils 1 auf 0. Extreme Richtungswechsel und die Qualität der vorhandenen Grundclips bleiben Grenzen.
- **Direktabschluss auf ein freies Tor:** Die Wahl prüft erreichbaren Kontakt, Eingangsrichtung, Schussbahn und die tatsächliche Torwartposition. Ein klares freies Tor hat Vorrang vor einer weiteren Annahme oder Ablage. Auch ein kurzer erreichbarer Abpraller kann direkt geschossen werden. Abschluss, Technik und Stellungsspiel wirken weiter auf die Entscheidung; Schussqualität, Ereignisse und Torwartentscheidung verwenden den normalen Schusspfad. Entfernte, verdeckte oder physisch unpassende Kontakte lösen keinen Direktabschluss aus.
- **Ecken:** Varianten für ersten Pfosten, zweiten Pfosten, zentrale Besetzung und kurze Ecke, ohne unmittelbare Wiederholung. Luftspiel und Stellungsspiel bestimmen Zielspieler/Deckung; die kurze Variante verlangt passende Ausrichtung oder Pass-/Technikqualität. Normale begrenzte Anlaufwege und Freigabe nach Ankunft bleiben erhalten.
- **Schlussphasen:** Strafraumbesitz, ein freier Durchbruch und zugehörige Pässe/Schüsse/Abpraller dürfen vor Halbzeit- und Schlusspfiff auslaufen. Ballverlust oder Ende der Gefahr beendet die Fortsetzung. Eine begrenzte Zusatzzeit verhindert endloses Hinauszögern. Standards behalten ihren bestehenden Abschlussweg.
- **Gegnerische Stürmer während eines Passes:** Ihre defensiven beziehungsweise Konterziele bleiben an die eigene Abseitsgrenze gebunden. Der Ballbesitz des anderen Teams wird beim Flug nicht zur falschen Angriffsreferenz.
- **Trikotunterscheidung:** Die Wahl bewertet auch breite Muster und deren sichtbaren Helligkeits-/Farbeindruck. Madrid behält Weiß/Gold; Vigo erhält in der geprüften Paarung Schiefergrau/Weiß. Von 4.512 geordneten Vereins-/Heimkontexten unterschreiten vorher 1.594, jetzt 148 die interne Ähnlichkeitsschwelle. 1.526 bisherige Konflikte werden verbessert, keiner verschlechtert. Mit den fest vorhandenen Trikotpaletten lässt sich nicht jede Vierergruppe vollkommen trennen. Bereits gespeicherte Matchtrikots bleiben erhalten.
- **Nummern:** Taktik-/Aufstellungsmarkierungen wählen helle oder dunkle Ziffern anhand der tatsächlichen Trikotfarbe; Keeper verwenden ihr Matchtrikot. 30 gerenderte Markierungen mit fünf Farben geprüft.
- **Speichermenü:** Der Rahmen wechselt beim normalen Wechsel zwischen „gespeichert“ und „Speicherung ausstehend“ nicht mehr die Farbe. Fehleranzeige und Tastaturfokus bleiben sichtbar.

## Pausierte Rückschau

Unter dem 3D-Feld führt ein Slider durch die bereits aufgenommenen Szenen. Beim Verschieben pausiert die Partie sofort, einschließlich eines laufenden Ballflugs. „Zurück zu Live“ stellt die aktuelle Spielszene wieder her und setzt die Partie fort. Der Slider kann nur innerhalb der Aufnahme vor- und zurückspringen; er erzeugt keine zukünftigen Spielzüge und setzt kein Ergebnis zurück.

Aufgenommen werden fertige Ball- und Rigposen mit sechs Bildern pro Sekunde; Zwischenbilder werden interpoliert. Bis zu zehn Minuten der aktuellen Browser-Sitzung bleiben verfügbar. Die Aufnahme wird nicht im Karrierespielstand gespeichert. Die bestehende 3D-Beschränkung auf Querformat gilt auch für diese Rückschau; im Hochformat bleibt die vorhandene 2D-Ansicht aktiv. Deutsch/Englisch und Desktop/mobiles Querformat geprüft.

![Trikots und Rückschau](../../outputs/match-kits-review-v131.png)

## Prüfungen und Reproduktion

| Prüfung | Nachweis |
| --- | --- |
| 80 native Torwartketten, 18 gepaarte Laufsequenzen | [Native Ergebnisse](../../outputs/native-block-qa-v131.json), `work/check-native-block-v131.cjs` |
| Direktwahl, 64 Eckformationen, Pass-Abseitsziele, Halb-/Schlusspfiff, eingefrorene Rückschau, Nummern, Rahmen | [Szenenprüfung](../../outputs/match-block-qa-v131.json), `work/check-match-block-v131.cjs` |
| Reale Keeper-Vorbereitung, DE/EN, Desktop/mobil, Live-Rückkehr | [UI-Prüfung](../../outputs/block-ui-qa-v131.json), `work/check-block-ui-v131.cjs` |
| 4.512 Trikotkontexte, gespiegelte Auswahl, unveränderte Vereinsdaten | [Trikotvergleich](../../outputs/kit-contrast-qa-v131.json), `work/test-kit-contrast-v131.cjs` |
| Sieben native Keeperabläufe, Kontakt, Nachschuss und Pause | [Visuelle Keeperprüfung](keeper-visual-qa-v131.json) |
| Normale und hohe Schüsse, Zugriff, Fang-/Abprallbilanz | [Keeperfälle](keeper-scenarios-qa-v131.json), [hohe Schüsse](keeper-scenarios-qa-high-v131.json) |
| Zwei vollständige native Partien, 16.701 Renderbilder | [Warpingprüfung](warping-qa-v131.json); keine Grenzverletzung bei sichtbaren Spielern/Ball, beide Halbzeiten abgeschlossen |
| Identische 2D-/3D-Outcomes und regulärer Offline-Build | [Matchvergleich](../../outputs/world3d-parity-v131.json), `work/run-match-parity-v131.cjs` |
| Quell-/Offline-/fehlendes Modell | [Integration](model-integration-qa-v131.json) |

Regressionen über `work/run-match-regression-v131.cjs` ausführen; der Adapter legt neue v131-Nachweise an und bewahrt ältere Berichte. Bestehende `test-v55.cjs` und `test-world-kits-v81.cjs` bestehen ebenfalls. Abschließend prüft `work/verify-match-block-v131.cjs` Quell-/Buildgleichheit, Modellhash und die Nachweise; [Manifest](verification-v131.json).

Die vollständigen Matchtests verwenden zwei feste Zufallsstarts, keine neue Saison-Balancekalibrierung. Die neuen Entscheidungen können künftige Ergebnisse ändern. Bestehende Match-/Saisonstatistiken werden nicht neu berechnet. Die lokale Arbeit ändert die veröffentlichte Version 106 nicht; ein neuer Versionsstand ist erst bei einer Veröffentlichung erforderlich.
