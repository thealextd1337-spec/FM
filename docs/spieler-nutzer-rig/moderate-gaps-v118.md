# Mittlere Stärkeunterschiede – v118

120 vollständige physische Partien auf dem v117-Offline-Build mit gezielter Halbzeitkorrektur. Je 30 Partien gleich stark sowie kleiner, mittlerer und größerer Abstand. Statistikprüfung und Korrektur eines gefundenen Einwurf-/Halbzeitfehlers; keine Änderung der Wertebalance, Veröffentlichung, Altstand-Nachberechnung oder Meshy-Credits.

## Ergebnisse

Team A bleibt in allen Gruppen identisch. S/U/N und Torbilanz beziehen sich auf Team A. Pass- und Zweikampfquoten stammen aus den summierten Aktionen beider Teams, nicht aus gemittelten Einzelquoten.

| Gruppe | S / U / N | Tore | Punkte/Spiel | Tordifferenz/Spiel | Passquote A / B | Zweikampfquote A / B |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Gleich stark | 5 / 15 / 10 | 17:25 | 1,00 | -0,27 | 82,9 % / 86,6 % | 46,7 % / 44,8 % |
| Kleiner Abstand | 5 / 16 / 9 | 28:31 | 1,03 | -0,10 | 84,3 % / 84,6 % | 46,5 % / 44,3 % |
| Mittlerer Abstand | 12 / 10 / 8 | 30:25 | 1,53 | 0,17 | 84,8 % / 83,8 % | 54,2 % / 40,7 % |
| Größerer Abstand | 18 / 10 / 2 | 39:11 | 2,13 | 0,93 | 87,2 % / 79,6 % | 62,9 % / 32,6 % |

## Einordnung

Die gleiche Mannschaft erzielt mit sinkender Gegnerstärke zunächst fast unveränderte, dann bessere Ergebnisse: 1,00 → 1,03 → 1,53 → 2,13 Punkte je Spiel. Alle vier vorab gewählten Mittelwertkriterien sind erfüllt. Der größere Abstand zeigt auch in beiden gepaarten Unsicherheitsintervallen einen positiven Effekt. Beim mittleren Abstand liegen Verbesserungen vor, aber beide Intervalle enthalten Null; 30 Partien liefern hier noch keinen sicheren positiven Nachweis. Der kleinste Abstand bleibt praktisch auf Kontrollniveau.

Das Ergebnis rechtfertigt derzeit keine Änderung der Wertegewichtung. Gute Werte helfen, ohne bei kleinen Abständen automatisch Siege zu garantieren. Die ungleiche Kontrollbilanz (5 Siege/10 Niederlagen trotz gleicher Fähigkeitsprofile) wird durch den gepaarten Kontrollvergleich berücksichtigt; diese Stichprobe ist keine allgemeine Soll-Siegquote. Vor einer feineren Balanceentscheidung wäre der mittlere Bereich mit weiteren vorab festgelegten Seeds zu erweitern.

## Vergleich mit derselben Kontrollpartie

Jeder neue Testseed wird mit seinem Kontrollspiel bei gleicher Heim-/Auswärtszuordnung verglichen. Die folgenden Werte sind Mittelwertänderungen mit gepaarten Bootstrap-95%-Perzentilintervallen (10.000 Wiederholungen, getrennte feste Analyse-Zufallsfolge). Diese Intervalle beschreiben die Unsicherheit dieser Stichprobe; sie beweisen keine universelle Siegchance.

| Gruppe | Punktegewinn/Spiel [Intervall] | Verbesserung Tordifferenz/Spiel [Intervall] |
| --- | ---: | ---: |
| Kleiner Abstand | 0,03 [-0,50; 0,57] | 0,17 [-0,33; 0,67] |
| Mittlerer Abstand | 0,53 [-0,07; 1,10] | 0,43 [-0,20; 1,07] |
| Größerer Abstand | 1,13 [0,67; 1,57] | 1,20 [0,73; 1,67] |

## Vorab festgelegte Kriterien

[Protokoll](moderate-gaps-protocol-v118.json) wurde vor dem ersten Testlauf gespeichert. Die Grenzen sind Produkt-Abnahmekriterien, keine aus echten Fußballligen abgeleiteten Kalibrierwerte. Ein erfüllter Mittelwert und ein klar positives Unsicherheitsintervall werden getrennt ausgewiesen. Für den kleinsten Abstand gilt keine harte Siegquotengrenze.

| Kriterium | Minimum | Gemessen | Mittelwertkriterium | Unsicherheit |
| --- | ---: | ---: | --- | --- |
| gap2-points | 0,20 | 0,53 | Bestanden | Intervall enthält Null |
| gap2-goals | 0,20 | 0,43 | Bestanden | Intervall enthält Null |
| gap4-points | 0,40 | 1,13 | Bestanden | Positiver Effekt im Intervall |
| gap4-goals | 0,50 | 1,20 | Bestanden | Positiver Effekt im Intervall |

Keine vorab definierten Warnzeichen für zu deterministische kleine Abstände oder einen fallenden Stichprobentrend.

## Gefundener Halbzeitfehler

Der erste Lauf blieb bei Einwürfen über den Halbzeitwechsel hängen. Vier gezielte Fälle (links/rechts, laufendes Aufstellen/angehobener Ball) bestätigen die Ursache: Nach dem Halbzeitpfiff bleibt der Einwurf aktiv, während der zweite Anstoß die Spieler zur Mitte führt. Beide Aufstellungen konkurrieren; nach 600 Schritten gibt es keinen Wiederanpfiff.

Die Korrektur in `dist/set-pieces-v50.js` beendet einen noch offenen Einwurf beim tatsächlichen Halbzeitpfiff in der Vereinswelt. Alle vier Fälle führen anschließend innerhalb von 81 Schritten zum rollenden Wiederanstoß. Ein laufender Elfmeter wird weiterhin vor dem Pfiff abgeschlossen. [Baseline](half-time-throw-baseline-v118.json), [korrigierte Fälle](half-time-throw-qa-v118.json).

Die erfolgreichen Teilspiele des unterbrochenen Versuchs wurden [separat archiviert](moderate-gaps-attempt-before-fix-v118.json) und gehen nicht in die 120 Ergebnisse ein. Alle vier Gruppen wurden vollständig frisch auf demselben korrigierten Build gespielt. Gruppen, Seeds und Abnahmekriterien aus dem vorab gespeicherten Protokoll blieben unverändert; dessen ursprünglicher Buildhash ist im [Engine-Manifest](moderate-gaps-engine-v118.json) als Vorher-Stand ausgewiesen. Die Korrektur verändert weder Wertegewichtung noch Zufallsentscheidungen; sie kann zukünftige Partien über einen zuvor blockierten Halbzeitwechsel hinaus fortsetzen. Bestehende Ergebnisse werden nicht nachberechnet.

## Methode und Gültigkeitsbereich

Vier feste interne Testprofile: Team A Basis 14, Team B Basis 14/13/12/10; gleiche Rollenspezialisierung auf beiden Seiten. Damit werden alle neun Fähigkeiten gemeinsam um 0/1/2/4 Stufen variiert, ohne Obergrenzen zu treffen. Die Zahlen beschreiben ausschließlich die technische Versuchsanordnung; Spieleransichten zeigen weiterhin nur Farbstufen.

Die 30 Seeds und 15 Heim-/15 Auswärtsspiele je Gruppe entsprechen der bisherigen Versuchsanordnung. Gleiche Aufstellung 2–2–1, identische Taktik und Anweisungen, Frische 100, Alter 25, Form 0, keine Traineranpassungen und Auswechslungen; Frischeverbrauch während der Partie aktiv. Jede Partie nutzt einen frischen Karriereklon und beide Halbzeiten der echten Live-Engine. Kein Rendern in der Massensimulation; die Engine wurde im vorausgehenden Schritt für 2D/3D geprüft. 20 Hz, Simulationsdelta 0,05 × MATCH_SPEED, reale Schrittzeit 0,05 Sekunden. Seed-Kontrolle verringert unnötige Unterschiede; veränderte Fähigkeiten führen trotzdem zu anderen Aktionen und Zufallsabrufzahlen. Es wird keine identische Szenenfolge vorausgesetzt.

Alle 120 Ergebnisse wurden regulär gebucht. Eigentore werden gesondert geprüft: Der Spielstand entspricht persönlichen Toren plus zugunsten des Teams gefallenen Eigentoren. Sie erhalten keine persönliche Torgutschrift für einen Angreifer. Ein echter Fall ist als [Eigentorbeleg](moderate-gaps-own-goal-example-v118.json) gespeichert. Schusszähler stimmen mit beobachteten Abschlüssen; alle Torwartidentitäten und Ereignisverknüpfungen sind geprüft, Bericht und gebuchtes Protokoll identisch. Quell- und Buildhash entsprechen dem geprüften v118-Engine-Manifest; gegenüber v117 wurde ausschließlich der Halbzeit-Einwurf in set-pieces-v50.js korrigiert. Nutzer-Spielstände und historische v115-/v117-Messungen bleiben unverändert.

30 Partien je Gruppe erlauben eine erste Aussage über die gemeinsame Stärkeabstufung. Sie isolieren keine einzelne Fähigkeit, Position, Taktik oder Ermüdung. Heim-/Auswärtswerte und Aktionsdaten stehen in der [Zusammenfassung](moderate-gaps-summary-v118.json), Einzelspiele als [CSV](moderate-gaps-120-v118.csv) und [JSON mit Ereignisketten](moderate-gaps-120-v118.json).

Reproduktion: `work/study-moderate-gaps-v118.cjs` (optional --resume bei identischem Build), danach `work/report-moderate-gaps-v118.cjs`. Der Runner verwendet die eingefrorene v115-Versuchsanordnung mit v117-Bilanzprüfung und schreibt eigene v118-Dateien.

Die gezielte Korrektur und der reguläre Build sind zusätzlich mit den bestehenden Anstoß-/Einwurf-/Abseits-/Stoppprüfungen und dem vollständigen 2D-/3D-/Speicher-/Offlineablauf abgenommen. [Verifikation](verification-v118.json). Zur vollständigen Wiederholung: Build und Modellprobe erzeugen, `check-half-time-throw-v118.cjs`, `prepare-moderate-engine-v118.cjs`, Studienrunner, Bericht und `verify-moderate-gaps-v118.cjs` ausführen.
