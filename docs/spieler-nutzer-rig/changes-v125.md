# Ruhigere Schritte und Richtungswechsel v125

Lokal im regulären [Offline-Spiel](../../outputs/Doppel-6-Fussballmanager.html) integriert, 5. Oktober 2026. Schwerpunkt nach Nutzerentscheidung: hackelige Schritte und Richtungswechsel. Bestehendes Meshy-Rig mit 32 Clips, keine neu erzeugten Clips oder Credits. Seitenfuß weiterhin **PROTOTYP 106**; dieser Animationsblock ist noch nicht veröffentlicht. Matchwege, Fähigkeiten, Ballphysik und gespeicherte Statistiken werden durch diese Änderung nicht angepasst. Balleffet und eine neue 90-Partien-Studie bleiben nachgelagerte Arbeiten.

## Ursache und Korrektur

Die kontrollierte [Diagnose](running-diagnosis-v125.json) vergleicht dieselben neun Laufwege mit voller Darstellung, ohne bewegte Drehclips und ohne Fuß-IK. Die Fußkorrektur erhöht die Bewegungsspitzen beim Aufsetzen: Im 4,5-m/s-Lauf sinkt die Spitze ohne IK von etwa 529 auf 235 m/s². Bei der scharfen Rechtskurve reduziert das Ausnehmen des Drehclips die Spitze von etwa 898 auf 626 m/s². Dies sind aus aufeinanderfolgenden Bildern berechnete Änderungen der dargestellten Fußgeschwindigkeit, keine Messung realer Kräfte.

Die Korrektur liegt in zwei Darstellungsmodulen:

- `player-user-motion-v108.js` interpoliert die Kontaktproben eines Laufclips statt sie nur in 120 diskreten Schritten umzuschalten. Eine zyklische Probe verbindet auch das Ende mit dem Anfang. Die Fußbindung der Feldspieler blendet ein und aus; die vorhandene Boden-/Reichweitenkorrektur bleibt aktiv. Die Torwart-Fußbindung behält ihren zuvor geprüften Ablauf.
- Bewegte Lauf-Drehclips überlagern höchstens 28 % statt 72 % der Gangart. Die durchgehende Schrittphase bleibt erhalten; Standdrehungen und besondere Ballaktionen behalten ihre eigene Bewegung.
- `pitch-motion-v102.js` glättet beim freien Lauf die Änderung der Drehgeschwindigkeit. Der Körper beginnt einen scharfen Richtungswechsel sanfter, während der physische Spielerweg unverändert bleibt. Ballführer- und Verfolgungsregeln verhindern weiterhin die vorher korrigierten Rückwärtsclips; Torwartblick, defensive Rückwärtsausrichtung und spezielle Aktionen behalten ihre gesonderte Ausrichtung.

Die gesicherten Ausgangsquellen unter `work/baseline-locomotion-v125.js` und `work/baseline-pitch-motion-v125.js` stimmen bytegenau mit den jeweiligen Quellenhashes im v124-Manifest überein. Die Baseline wird für Vergleichsläufe ausschließlich im isolierten Testbrowser eingebunden; die Produktionsquelle bleibt die neue Fassung.

## Vergleich und Abnahme

27 identische native Sequenzen prüfen 3,5/4,5/6,5-m/s-Läufe, linke/rechte Kurven, scharfe 90°-Wechsel, eine 180°-Umkehr sowie Antritt und Abbremsen bei 30/60/120 Bildern pro Sekunde. In jedem Fall sinken sowohl Spitze als auch Mittelwert der dargestellten Fußbeschleunigung gegenüber derselben Ausgangssequenz. Bei 60 Hz sinken die Spitzen um etwa 31–60 %:

| Situation, 60 Hz | Spitze vorher | Spitze danach | Verringerung |
|---|---:|---:|---:|
| Lauf 3,5 m/s | 418 | 207 | 50 % |
| Lauf 4,5 m/s | 529 | 276 | 48 % |
| Sprint 6,5 m/s | 671 | 465 | 31 % |
| Scharfe Rechtskurve | 898 | 360 | 60 % |
| 180°-Umkehr | 1.135 | 625 | 45 % |

Einheit der Spitzen: m/s², aus der tatsächlichen Weltposition der Fußgelenke berechnet. Verglichen wird jeweils dieselbe Bildrate; Werte verschiedener Bildraten sind wegen der diskreten Messung nicht direkt vergleichbar. Die Kriterien bleiben für die Abnahme fest: bei 60 Hz mindestens 20 % weniger Spitze und 3 % weniger Mittelwert, bei 30/120 Hz mindestens 10 % beziehungsweise 1 %; außerdem begrenzte Fuß-/Hüftschritte, fortlaufende Gangphase, Bodenabstand, eingefrorene Pause und unveränderte Engine-Daten.

[Baseline](running-turns-baseline-v125.json), [Korrektur](running-turns-qa-v125.json), [visuell geprüfte Kurvenpose](../../outputs/run-turn-cut-left-1.80-qa-v125.png). Die Nahbilder zeigen die bestehende Meshy-Gangart und den reduzierten Drehübergang; die zeitliche Verbesserung wird durch die Sequenzmessung belegt.

Angrenzende Prüfungen:

- [Acht echte Rendererläufe](running-qa-v125.json): mit/ohne Ball bei 30/60/120 Hz und schwankenden Bildzeiten; keine falschen Bremsclips oder Änderungen der Simulation.
- [Gehen, Laufen, Sprint, Antritt/Stopp, Drehen und Rückwärtslaufen](locomotion-qa-v125.json): Bodenkontakt, begrenztes Gleiten, Pausen und Freigabe bei Versetzung/Ballaktionen.
- [15 Boden-/Übergangsszenen](ground-visual-qa-v125.json): Lauf/Stand, Annahme, Grätsche/Foul und bodennaher Keeperausklang bei drei Bildraten.
- [Zehn Ballaktionsszenen](ball-actions-qa-v125.json): Pässe, Flanken, Annahme, Schuss, Dribbling und Keeperkontakte; Pause und Bodenkontakt erhalten.
- [24 Torwart-Nachstellschritte](keeper-sidestep-qa-v125.json): beide Geschwindigkeiten/Richtungen/Tororientierungen; bisherige Kontakte und Ausnahmen bleiben gültig.
- [Zwei vollständige 3D-Partien](warping-qa-v125.json): 4.227 Physikschritte und 12.675 gemessene Bewegungsbilder, keine sichtbaren Sprünge innerhalb der unveränderten Grenzen. Ergebnisse, Schritte und Ereignisse stimmen mit den entsprechenden v124-Partien überein; GPU-Zeichnung wird während dieser Messung ausgelassen.
- [Regulärer Offline-Matchvergleich](../../outputs/world3d-parity-v125.json): 2D/3D mit identischem Ergebnis, Ereignissen, Statistiken und Ergebnisbuchung; zusätzlich Standards, Halbzeit, Wiederholungspause, Wechsel, Orientierung, WebGL-Rückfall, Speichern und Offline-Audio.

[Abschlussmanifest](verification-v125.json) gleicht Quellen, Offline-Build, Modell, historische Nachweise und aktuelle Tests ab. Testprofile verwenden eigene Browserdaten und greifen nicht auf den Spielstand der nutzenden Person zu. Der ältere Browsertest erwartete noch Fußversion 105; der lokale Adapter prüft die aktuelle 106 und bestätigt beim Testaufbau das Jugendbudget mit 0.

Die Abnahme umfasst vorbereitete Sequenzen und zwei feste Match-Seeds. Das ist keine Hardware-FPS-Messung oder allgemeine Garantie für jede Bewegungskombination. Der künstlerische Eindruck kann im normalen Match weiter beurteilt werden; vorhandene Meshy-Clips wurden abgestimmt, kein neues Bewegungsmaterial erzeugt.
