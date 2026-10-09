# Torszene: Abprall vor dem sichtbaren Netz

## Befund vor der Korrektur

Die Ross-Anmerkung zeigt nur einen einzelnen Bildausschnitt. Tor, Parade und Flugverlauf sind daraus nicht sicher zu unterscheiden. Ein eigener kontrollierter Versuch reproduziert jedoch einen konkreten Darstellungsfehler nach korrekt gebuchten Toren: Der Ball trifft eine unsichtbare Begrenzung vor dem sichtbaren Netz und springt zurück.

`work/test-goal-net-diagnosis-v119.cjs` erzeugt mit dem tatsächlich geladenen nativen Controller 72 Abschlüsse: beide Mannschaften, beide Platzgrößen, beide Bildrichtungen, 5/10/18 Meter Entfernung und die drei vorhandenen Höhenvarianten. Die vorhandene Flug-Abschlussfunktion bucht das Tor. Anschließend werden die tatsächlich aktivierte Unity-Projektion `v98PitchFrame` und `D6WorldUnityContract.picture` gelesen. Es wird weder ein Unity-Build noch ein Editor oder Gerät gestartet.

Alle 72 Tore werden einmal gebucht. Keine Bildabfrage verändert Schussdaten, Tore, Ergebnis oder Zufallsverbrauch. In allen 72 Fällen liegt die berechnete Balloberfläche beim Rückprall noch **11,36 bis 18,44 cm** vor der entsprechenden unbewegten Netzfläche. Der Kontakt erfolgt nach **0,019 bis 0,086 Sekunden**; die Netzbewegung verwendet einen separaten Verlauf mit Maximum erst bei **0,6 Sekunden**. Acht Fälle verlassen anschließend den sichtbaren Netzraum.

| Stelle | Tatsächliche Abweichung |
| --- | --- |
| `world-pitch-actions-v99.js`, `v101GoalTravel` | Radius 0,29 m statt dargestellter 0,1764 m; Rückwandkontakt bei 1,91 m statt sichtbarer Netztiefe 2,2 m; zusätzliche Dachneigung, obwohl das sichtbare Dach waagrecht ist. |
| `world-unity-v151.js`, Erweiterung von `v98PitchFrame` | Netzpunkt und Zeitablauf kommen aus `v83GoalPosition`; Kontakthöhe ist konstant 0,8 m, unabhängig vom tatsächlichen Ballkontakt. |
| `WorldViewBridge.cs`, `RenderWorldNet` | Nur die Rückwand verformt sich; ein Dach- oder Seitenkontakt erzeugt trotzdem dieselbe Rückwandbewegung. |

Ein Beispiel: Der hohe Abschluss aus fünf Metern trifft die rechnerische Dachbegrenzung bei 2,915 m Höhe nach 0,022 Sekunden. Zum sichtbaren waagrechten Dach bleibt dabei noch 14,41 cm Abstand zwischen Balloberfläche und Netz. Der Ball fällt anschließend zurück. Der native Welt-Torrahmen ist hier **3,235 m** hoch; die bestehende 2,7-m-Schusshöhe ist deshalb zulässig. Eine zunächst vermutete Überschreitung eines 2,44-m-Tores wurde durch die echte Geometrie widerlegt.

Die reguläre Unity-Weltansicht empfängt Ballbilder und legt diese auf `ballView.position`; sie simuliert dafür keine zusätzliche Torwand. Primitive-Kollisionselemente werden entfernt. Die auffällige Begrenzung entsteht in der nachträglichen JS-Torbildbewegung, nicht durch eine neue Unity-Spielphysik. Die native Schussauswertung und freie Ball-Torlinienprüfung bleiben eigenständige Autoritäten.

## Korrektur und Nachweis

Root hat ausschließlich die sichtbare Kopie der bestehenden Torbewegung an die sichtbare Geometrie angepasst: 2,2 m tiefes Netz, 0,1764 m Ballradius, waagrechtes Dach. Netzpunkt und Kontaktzeit stammen aus derselben Kopie. Rückwandbewegung beginnt erst nach tatsächlichem Rückwandkontakt; Seiten-/Dachkontakt erzeugt kein Rückwandpaket. Ein reines Begrenzen des sichtbaren Auslaufens hält den Ball auch nach weiteren gedachten Kontakten im Netzraum. Der bereits vorhandene Torbanner-Fallback funktioniert nach Entfernen der Szene weiter. Gespeicherte Torbewegung, Schussauswertung, Ballautorität, Ergebnis und Wiederanstoß bleiben unverändert.

Die 72 Wiederholungen nach der Korrektur bestehen: **0 vorzeitige Kontakte, 0 Austritte aus dem Netzraum**. Der Fehler zur tatsächlichen Kontaktfläche liegt unter `9e-15` m. Zeitpunkte 0, Kontakt, Kontakt + 40 ms, 0,6/1,5/2,45/4,05 Sekunden und der Banner ohne Szene werden geprüft. 288 Negativprüfungen lassen fertige Partien, fehlende Szene, fehlende aufgezeichnete Torbewegung und einen Paradebanner unberührt. Die Hashes sämtlicher tatsächlicher Schuss- und Torbuchungsdaten sind vor/nach der Bildkorrektur für alle 72 Fälle identisch; beide Quellstände bleiben während ihrer Messung unverändert.

Die Vorher-Daten und Quellhashes liegen in `outputs/3d-quality/goal-net-diagnosis-v119/native-before.json`, der erfolgreiche korrigierte Lauf in `native.json`. Für den Vorher-Vergleich werden ausschließlich die beiden neuen Bildänderungen im isolierten Browser durch den exakt rekonstruierten alten Quelltext ersetzt; dessen Hashes stimmen mit den bei der Erstdiagnose gelesenen Dateien überein (`v98: 90e1e360…`, `v151: 25756fc1…`). Es werden keine Produktionsdateien zurückgesetzt. Aufruf: `D6_QA_BEFORE_NET=1` für Vorher, ohne Variable für Nachher; dieser Windows/Edge-Runner gehört nicht zur browserfreien Ubuntu-CI.

Diese Diagnose beweist eine passende Ursache, jedoch nicht den historischen Ross-Flug aus dem Screenshot. Die native vollständige Matchmatrix ist separat dokumentiert; ein physischer Android-/Unity-Bildvergleich steht separat aus.
