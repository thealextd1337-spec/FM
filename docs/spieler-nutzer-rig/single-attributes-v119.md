# Einzelne Spielerfähigkeiten – v119

300 vollständige Live-Partien: 30 gemeinsame Kontrollspiele und je 30 Partien für neun einzeln verbesserte Fähigkeiten. Alle neun Fähigkeiten verbessern ihren passenden Mechanismus in identischen nativen Spielsituationen. Matchausgänge bleiben je nach Fähigkeit und Stichprobe uneindeutig; daraus wird keine automatische Neugewichtung abgeleitet. Spielcode und Offline-Build bleiben auf dem geprüften v118-Stand.

## Matchausgänge

S/U/N, Tore und Punkte beziehen sich auf Team A. Bei jeder Variante wird nur die benannte Fähigkeit von Team A erhöht; Team B entspricht immer der Kontrolle. Die Punkteänderung vergleicht dieselben 30 Seeds und Heim-/Auswärtszuordnungen.

| Fähigkeit | S / U / N | Tore | Punkte/Spiel | Änderung Punkte/Spiel [95%-Intervall] |
| --- | ---: | ---: | ---: | ---: |
| Kontrolle | 8 / 13 / 9 | 21:20 | 1,23 | 0,00 [0,00; 0,00] |
| Geschwindigkeit | 9 / 15 / 6 | 18:11 | 1,40 | 0,17 [-0,27; 0,63] |
| Technik | 10 / 14 / 6 | 25:20 | 1,47 | 0,23 [-0,20; 0,67] |
| Passspiel | 9 / 11 / 10 | 25:24 | 1,27 | 0,03 [-0,30; 0,40] |
| Abschluss | 13 / 10 / 7 | 29:21 | 1,63 | 0,40 [0,13; 0,73] |
| Zweikampf | 7 / 15 / 8 | 18:18 | 1,20 | -0,03 [-0,23; 0,17] |
| Stellungsspiel | 8 / 13 / 9 | 24:19 | 1,23 | 0,00 [-0,53; 0,53] |
| Luftspiel | 10 / 12 / 8 | 23:15 | 1,40 | 0,17 [0,00; 0,37] |
| Kondition | 12 / 9 / 9 | 25:19 | 1,50 | 0,27 [-0,13; 0,70] |
| Torwartspiel | 8 / 11 / 11 | 17:20 | 1,17 | -0,07 [-0,20; 0,07] |

Die Abschlussvariante erzielt 13 statt 8 Siege und 1,63 statt 1,23 Punkte/Spiel; nur hier liegt das explorative Punkteintervall vollständig über Null. Die Zielquote steigt um 11,58 Prozentpunkte. Bei sieben der neun vorab festgelegten Aktionskennzahlen liegt die Verbesserung auch im jeweiligen unbereinigten Intervall in der erwarteten Richtung. Stellungsspiel und Torwartspiel zeigen nur kleine, unsichere Quotenänderungen.

Die Torwartvariante erzielt in dieser Stichprobe sogar weniger Punkte (1,17) und eigene Tore (17 statt 21), obwohl die Fang-/Abwehrquote leicht steigt. Ihr Punkteintervall enthält Null; geänderte Paraden und folgende Entscheidungen ändern den weiteren Spielverlauf. Das ist kein belastbarer Beleg für einen negativen Torwartwert-Effekt, aber auch kein ausreichender positiver Matchnachweis. Stellungsspiel hat unveränderte Punkte bei weniger Abseits. Diese offenen Punkte werden dokumentiert, statt die Gewichtung auf die 30 Ergebnisse zurechtzuschneiden.

## Vorab festgelegte Matchkennzahlen

[Versuchsprotokoll](single-attributes-protocol-v119.json) vor dem ersten Lauf gespeichert. Quoten werden aus summierten Aktionen gebildet. Prozentänderungen sind Prozentpunkte; Frische sind interne technische Testeinheiten. Der Feldspielerweg summiert fünf Feldspieler und alle begrenzten Bewegungsschritte, einschließlich Standardaufstellung. Schritte über 0,5 m werden separat ausgeschlossen. Er misst nicht allein die mögliche Laufgeschwindigkeit.

| Fähigkeit | Kennzahl | Kontrolle → verbessert | Änderung [95%-Intervall] | Aussage |
| --- | --- | ---: | ---: | --- |
| Geschwindigkeit | Feldspielerweg (m/Spiel) | 2362,51 → 2546,01 | 183,51 [111,08; 253,65] | Richtung im Intervall gestützt |
| Technik | Gewonnene Bodenzweikämpfe (%) | 43,62 → 52,99 | 9,36 [2,44; 16,72] | Richtung im Intervall gestützt |
| Passspiel | Passquote (%) | 81,21 → 86,64 | 5,44 [1,70; 9,11] | Richtung im Intervall gestützt |
| Abschluss | Zielquote je abgeschlossenen Versuch (%) | 58,82 → 70,40 | 11,58 [4,25; 19,29] | Richtung im Intervall gestützt |
| Zweikampf | Gewonnene Bodenzweikämpfe (%) | 43,62 → 52,87 | 9,24 [1,01; 17,54] | Richtung im Intervall gestützt |
| Stellungsspiel | Abseits / 100 Pässe | 1,72 → 1,21 | -0,51 [-2,16; 0,92] | Richtung nicht sicher belegt |
| Luftspiel | Gewonnene Luftduelle (%) | 46,75 → 60,53 | 13,77 [5,29; 24,00] | Richtung im Intervall gestützt |
| Kondition | Feldspielerfrische am Ende | 73,66 → 76,08 | 2,42 [2,04; 2,77] | Richtung im Intervall gestützt |
| Torwartspiel | Gehaltene gezielte Schüsse (%) | 80,20 → 81,00 | 0,80 [-1,45; 3,44] | Richtung nicht sicher belegt |

Bodenzweikämpfe umfassen offensive/defensive Stand- und Grätschenkontakte, ohne Luftduelle; Fouls können im Versuchszähler enthalten sein. Pass-, Schuss- und Fangquoten hängen auch von der Auswahl/Schwierigkeit der erreichten Situationen ab. Abseits pro 100 Pässe ist ein Gelegenheitssignal, keine isolierte Fehlerrate pro Tiefenlauf. Frische hängt zusätzlich von Nachspielzeit ab. Laufweg hängt von Matchdauer, Besitz und Zielen ab. Geringe oder umgekehrte Veränderungen dieser Gesamtquoten widerlegen deshalb nicht unmittelbar den passenden Einzelmechanismus.

## Identische native Spielsituationen

Jeweils nur eine Fähigkeit von 12 auf 16 variiert, andere Werte durchgehend 12 ohne Rollenspezialisierung; gleiche Geometrie, Alter, Form, Frische und Zufallsstarts. Echte Spiel-Funktionen statt nachgebauter Wahrscheinlichkeitsformeln. Bei Technik wird die Ballbehauptung des Besitzers geprüft, beim Zweikampf die Balleroberung des Gegners. Foulkontakte werden dort aus dem Siegquotennenner entfernt und separat erfasst. Bei Passspiel wird zusätzlich die Entscheidung für einen besser postierten Mitspieler geprüft. Stellungsspiel misst den tatsächlichen zeitabhängigen Sicherheitsabstand für Tiefenläufe. Kondition misst den verwendeten Belastungswert.

| Mechanismus | Kontrolle → verbessert | Versuche je Wert | Richtung |
| --- | ---: | ---: | --- |
| Laufweg in 0,1 s (m) | 0,47 → 0,52 | 1 | Bestanden |
| Ball behauptet ohne Foul (%) | 81,60 → 90,53 | 1000 | Bestanden |
| Ball im Kontakt erobert ohne Foul (%) | 18,40 → 26,65 | 1000 | Bestanden |
| Mittlerer Pass-Zielfehler (m) | 1,15 → 0,58 | 1000 | Bestanden |
| Freien besseren Mitspieler gewählt (%) | 65,60 → 78,50 | 1000 | Bestanden |
| Abschluss aufs Tor (%) | 63,30 → 70,90 | 1000 | Bestanden |
| Gezielten Abschluss gehalten (%) | 69,51 → 72,35 | 1000 | Bestanden |
| Mittlerer Abstand hinter Abseitslinie (m) | 1,35 → 1,84 | 200 | Bestanden |
| Erreichtes Luftduell gewonnen (%) | 50,30 → 59,70 | 1000 | Bestanden |
| Native Belastung bei gleicher Taktik | 24,80 → 22,40 | 1 | Bestanden |

Alle zehn Prüfungen für neun Fähigkeiten bestanden. [Native Messdaten mit Zählern](single-attributes-native-v119.json). Die beiden Lauf-/Belastungsfälle sind deterministisch; die übrigen verwenden 200 beziehungsweise 1.000 gepaarte Szenen je Wert. Gleiche Seeds garantieren gleiche Anfangsbedingungen, keine identische spätere Zufallsabrufzahl bei veränderten Entscheidungen. Matchzeitbedingte Fähigkeitseffekte bleiben aktiv.

## Kontrollen und Grenzen

Interne Profile: Basis 12 plus gleiche Rollenspezialisierung. Nur die untersuchte Fähigkeit bei Team A um vier Stufen angehoben, Torwartspiel ausschließlich bei dessen Keepern. Sonstige Fähigkeiten und Team B identisch, keine Obergrenze erreicht. Derselbe Kader inklusive Bank, gleiche Aufstellung 2–2–1, neutrale Taktik/Anweisungen, Alter 25, Form 0, Startfrische 100, keine Traineranpassungen oder Auswechslungen. Keine Anzeige exakter Fähigkeiten in Spieleransichten hinzugefügt.

Die Studie läuft in einem separaten Browser. Jede Partie nutzt einen frischen Karriereklon, beide Halbzeiten, reale Live-Engine mit 20 Hz und reguläre Ergebnisbuchung. Physikdelta 0,05 × MATCH_SPEED, reale Schrittzeit 0,05 s. Masse ohne Rendering; die unveränderte Engine hat die vorausgehende 2D-/3D-/Offlineabnahme. Keine neue Aussage über seltene Animationen oder visuelle Bewegungsqualität.

Alle 300 Partien abgeschlossen, Profile und Seeds kontrolliert, Eigentore getrennt, Schuss-/Torwartidentitäten und Ereignisverknüpfungen ausgeglichen; Bericht und gebuchtes Ereignisprotokoll identisch. Build- und Quellhashes bleiben unverändert. Nutzer-Spielstände werden nicht geöffnet oder rückwirkend berechnet. Keine Veröffentlichung oder Meshy-Credits.

Gepaarte Bootstrap-Perzentilintervalle mit 10.000 Wiederholungen resampeln ganze Seed-Paare; bei Quoten werden deren Zähler/Nenner erneut summiert. Die Intervalle sind explorativ, ohne Korrektur für die neun parallelen Vergleiche. Gemeinsam verwendete Kontrollen machen die Variantenvergleiche abhängig. Ein Intervall ohne Null ist hier ein Hinweis, kein universeller oder kausal isolierter Nachweis einer Siegchance. 30 Partien pro Fähigkeit reichen nicht zur sicheren Bewertung kleiner Ergebnisänderungen. Isoliert wird die Fähigkeit einer Mannschaft, nicht eine einzelne Position oder ein einzelner Spieler.

[Zusammenfassung mit Zählern](single-attributes-summary-v119.json), [Einzelspiele als CSV](single-attributes-300-v119.csv), [vollständige Rohdaten mit Ereignisketten](single-attributes-300-v119.json), [Verifikation](verification-v119.json).

Reproduktion: unveränderten v118-Build verwenden; work/study-single-attributes-v119.cjs (optional --resume), work/check-single-attributes-v119.cjs, work/report-single-attributes-v119.cjs und work/verify-single-attributes-v119.cjs. Der Runner nutzt die vorhandene vollständige Versuchsanordnung mit kontrollierten Anpassungen und eigener v119-Ablage. Vor Beginn wird das v118-Engine-Manifest geprüft.
