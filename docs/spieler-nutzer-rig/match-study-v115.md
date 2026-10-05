# 90-Partien-Prüfung der Spielerfähigkeiten – v115

Stand: 4. Oktober 2026. Lokale Statistikprüfung, keine Veröffentlichung oder Änderung der Spielregeln.

Nachtrag v117: Die fünf damaligen Bilanzabweichungen sind inzwischen erklärt und für neue physische Partien korrigiert: ein beim Abpfiff unterbrochener Zielschuss und vier Tore aus Pass-/Flankenbahnen. Die Wiederholung aller 90 Partien ergibt identische Outcomes bei vollständigen Torwartbilanzen. [Korrektur, Ereignisketten und neue Rohdaten](changes-v117.md). Die folgenden Tabellen und v115-Rohdaten dokumentieren weiterhin den ursprünglichen Messstand.

Alle **90 angeforderten Partien** wurden mit dem echten physischen Live-Spielablauf vollständig ausgespielt, einschließlich zweiter Halbzeit, Nachspielzeit, Standards und Ergebnisbuchung. Die vereinfachte Weltspiel-Simulation wurde nicht verwendet.

## Ergebnis und Outcome

| Paarung | Spiele | A gewinnt / Remis / B gewinnt | Tore A:B gesamt | Tore/Partie | 0:0 | Heim / Remis / Auswärts |
| --- | --- | --- | --- | --- | --- | --- |
| Gut gegen gut | 30 | 8 / 10 / 12 | 29:36 | 2,17 | 3 | 8 / 10 / 12 |
| Gut gegen schwach | 30 | 30 / 0 / 0 | 80:1 | 2,70 | 0 | 15 / 0 / 15 |
| Schwach gegen schwach | 30 | 7 / 13 / 10 | 11:14 | 0,83 | 11 | 12 / 13 / 5 |

A bezeichnet in „Gut gegen schwach“ immer das gute Team; in den gleich starken Paarungen sind A und B lediglich feste Bezeichnungen. Die Heimposition wechselt nach jedem Spiel.

- **Großer Stärkeabstand dominiert:** Das gute Team gewinnt alle 30 Spiele gegen das schwache, erzielt 80 Tore und kassiert eines. Das ist ein extremer Benchmark mit zehn internen Fähigkeitspunkten Abstand, keine Aussage über jede reale Vereinsbegegnung. 30 Siege beweisen keine allgemeine Siegchance von 100 %; das Wilson-95%-Intervall für diese Stichprobe liegt bei ungefähr 88,6–100 %.
- **Schwache Teams erzeugen wenig Abschlüsse und Tore:** Schwach/schwach kommt auf 0,83 Tore pro Spiel und 11 torlose Unentschieden. Gute Teams gegeneinander erreichen 2,17 Tore pro Spiel.
- **Qualität zeigt sich besonders unter starkem gegnerischem Druck:** Im gemischten Paar gewinnt das gute Team 73,9 % seiner registrierten Zweikämpfe, das schwache 19,0 %. Hohe Pässe gelingen zu 68,0 % gegenüber 17,0 %.
- **Passquote hängt auch vom Gegner ab:** Schwache Teams haben gegeneinander eine gemeinsame Passquote von 81,3 %; daraus folgt nicht, dass ihre Passfähigkeit kaum wirkt. Gegen starke Gegner liegt die Quote des schwachen Teams bei 75,2 %. Das schwache Team versucht im gemischten Paar sogar mehr Pässe (652 gegenüber 587), erzeugt damit aber erheblich weniger Abschlüsse.
- **Abseitsrisiko muss nach Angriffssituationen bewertet werden:** Schwach/schwach erzeugt 26 Abseitspfiffe gegenüber sechs bei gut/gut. Im gemischten Paar steht das starke Team öfter im Abseits (9:5), hat jedoch erheblich mehr Angriffe. Absolute Pfiffe allein belegen keine individuelle Abseitswahrscheinlichkeit.
- **Einige Fußballaktionen bleiben sehr selten:** Über 90 Spiele gibt es vier Kopfballabschlüsse, keine Volleys, 14 Torwart-Zugriffsversuche und nur einen registrierten Feldspielerblock. Das sind Kandidaten für eine spätere Prüfung der Aktionsgelegenheiten; 90 Standardpartien ersetzen keine gezielten Situationsprüfungen.

## Abnahme: Spielerwerte müssen den Matchausgang deutlich beeinflussen

Ziel der Prüfung ist ein **materieller Einfluss der Spielerfähigkeiten auf die Siegchance**, neben den Aktionsstatistiken. Die folgenden Mindestkriterien wurden nach der ersten explorativen Messung festgelegt; sie sind keine vorab registrierten statistischen Hypothesen und keine zugesicherte Gewinnchance für spätere Karrieren.

| Kriterium | Mindestwert | Gemessen | Abnahme |
| --- | --- | --- | --- |
| Siege des stärkeren Teams | 80,0 % | 100,0 % | bestanden |
| Untere Wilson-95%-Grenze der Siegquote | 75,0 % | 88,6 % | bestanden |
| Siegquotenanstieg bei unverändertem Team A gegenüber gut/gut | 30,00 Prozentpunkte | 73,33 Prozentpunkte | bestanden |
| Mittlerer Torvorsprung des stärkeren Teams | 1,00 Tore/Partie | 2,63 Tore/Partie | bestanden |
| Passquotenvorsprung | 10,00 Prozentpunkte | 15,31 Prozentpunkte | bestanden |
| Zweikampfquotenvorsprung | 20,00 Prozentpunkte | 54,98 Prozentpunkte | bestanden |
| Verhältnis registrierter Zielschüsse stark/schwach | 2,00 × | 9,82 × | bestanden |

**Abnahme bestanden für den gemeinsamen großen Abstand aller neun Fähigkeiten.** Team A bleibt beim Vergleich gut/gut → gut/schwach unverändert; nur die neun Werte des gegnerischen Testkaders sinken jeweils um zehn Punkte. A gewinnt gegen den gleich starken Gegner 8/30 und gegen den schwachen Gegner 30/30 Partien: +73,3 Prozentpunkte. Identische Taktik, Anfangsform, Frische, Seeds und Heimverteilung stützen die Zuordnung zum Werteunterschied. Einzelne Werte, moderate Abstände und echte Vereinsprofile sind damit noch nicht separat geprüft.

Reproduzierbare Abnahme: `node work/check-player-value-impact-v115.cjs`; [Ergebnis der sieben Kriterien](player-value-impact-qa-v115.json). Der Test verweigert diese Abnahme, wenn die geprüften physischen Engine-Dateien seit der Studie verändert wurden. Die anschließend ergänzten Torwarthandschuhe ändern ausschließlich die Grafik; sie erfordern keine neue Ergebnisreihe.

## Spielstatistik

| Paarung / Seite | Tore/Spiel | Schüsse/Spiel | aufs Tor/Spiel | Passquote (erfolgreich/Versuche) | Besitzanteil* | Zweikampfquote |
| --- | --- | --- | --- | --- | --- | --- |
| Gut gegen gut / A | 0,97 | 4,73 | 3,03 | 81,9 % (483/590) | 49,9 % | 48,7 % (116/238) |
| Gut gegen gut / B | 1,20 | 5,53 | 3,37 | 85,5 % (494/578) | 50,1 % | 47,1 % (112/238) |
| Gut gegen schwach / A | 2,67 | 7,47 | 5,57 | 90,5 % (531/587) | 53,1 % | 73,9 % (156/211) |
| Gut gegen schwach / B | 0,03 | 1,80 | 0,57 | 75,2 % (490/652) | 46,9 % | 19,0 % (40/211) |
| Schwach gegen schwach / A | 0,37 | 2,77 | 1,27 | 82,0 % (518/632) | 53,6 % | 47,7 % (74/155) |
| Schwach gegen schwach / B | 0,47 | 3,47 | 1,90 | 80,5 % (454/564) | 46,4 % | 49,7 % (77/155) |

*Besitzanteil: Anteil an der vom Engine-Zähler erfassten Besitzerzeit. Flugbahnen, freie Bälle und verschiedene Unterbrechungen zählen nicht; ruhiges Halten durch den Torwart zählt. Dieser Wert ist kein Anteil an der gesamten Spielzeit und kein isolierter Dribblingwert. Raten werden aus den aufsummierten Ereignissen gebildet, nicht aus dem Mittel individueller Prozentwerte. Die Zweikampfquote verwendet die registrierten Spielerzähler; offene/abgebrochene Duelle können dazu führen, dass die Quoten beider Seiten nicht exakt 100 % ergeben.

| Ereignis (Summe aus 30 Spielen) | Gut/gut A · B | Gut/schwach A · B | Schwach/schwach A · B |
| --- | --- | --- | --- |
| Ballverluste | 121 · 104 | 49 · 190 | 113 · 108 |
| Progressive Pässe | 264 · 237 | 237 · 275 | 271 · 246 |
| Hohe Pässe | 79 · 76 | 97 · 53 | 65 · 72 |
| Erfolgreiche hohe Pässe | 37 · 40 | 66 · 9 | 20 · 18 |
| Flanken | 14 · 16 | 24 · 3 | 23 · 17 |
| Erfolgreiche Flanken | 4 · 3 | 12 · 0 | 4 · 3 |
| Gewählte Pässe zum besser postierten Mitspieler | 5 · 1 | 16 · 0 | 3 · 1 |
| Abseits | 4 · 2 | 9 · 5 | 16 · 10 |
| Abgefangene Bälle | 71 · 85 | 110 · 26 | 53 · 38 |
| Grätschversuche | 24 · 26 | 34 · 32 | 17 · 26 |
| Gewonnene Grätschen | 10 · 10 | 24 · 0 | 6 · 11 |
| Luftduelle | 89 · 89 | 63 · 63 | 41 · 41 |
| Gewonnene Luftduelle | 39 · 50 | 49 · 14 | 21 · 20 |
| Kopfballabschlüsse | 1 · 1 | 1 · 0 | 1 · 0 |
| Kopfballpässe | 9 · 10 | 21 · 3 | 5 · 9 |
| Volleyabschlüsse | 0 · 0 | 0 · 0 | 0 · 0 |
| Fouls begangen | 5 · 3 | 3 · 12 | 1 · 3 |
| Eckbälle erhalten | 10 · 10 | 13 · 1 | 5 · 7 |
| Freistöße erhalten (inkl. Abseits) | 5 · 9 | 17 · 12 | 12 · 17 |
| Einwürfe erhalten | 8 · 10 | 13 · 11 | 12 · 17 |
| Elfmeter erhalten | 0 · 0 | 0 · 0 | 1 · 0 |
| Elfmeter verwandelt | 0 · 0 | 0 · 0 | 1 · 0 |
| Elfmeter nicht verwandelt | 0 · 0 | 0 · 0 | 0 · 0 |
| Feldspielerblocks | 0 · 0 | 0 · 1 | 0 · 0 |
| Torwart-Zugriffsversuche | 3 · 2 | 0 · 9 | 0 · 0 |
| Torwartparaden | 64 · 62 | 16 · 88 | 44 · 29 |
| Davon Abpraller | 33 · 30 | 7 · 57 | 20 · 18 |

Freistöße enthalten auch Abseits. Hohe Pässe und Flanken sind Teilmengen der Pässe; Kopfballpässe sind keine Kopfballabschlüsse. „Besser postierter Mitspieler“ zählt die tatsächlich gewählte spezielle Querpassentscheidung, nicht alle guten Pässe. „Torwart-Zugriff“ zählt den Beginn eines Herauskommen-/Rutschversuchs, nicht automatisch einen erfolgreichen Ballgewinn. Abpraller umfassen die tatsächlichen Torwart-Abwehrkontakte; der Zähler trennt ein- und beidhändige Abwehr nicht. Die Summe der Spieler-Clean-Sheet-Marker aus den Rohdaten ist keine Mannschaftsstatistik; oben werden Zu-null-Spiele direkt aus dem Ergebnis gezählt.

## Torwartbilanz und Messgrenzen

| Paarung / Torwart | Zielschüsse gegen ihn | Paraden | Gegentore | Roh-Paradenquote* | Abpraller/Paraden | Zu-null-Spiele |
| --- | --- | --- | --- | --- | --- | --- |
| Gut gegen gut / A | 101 | 64 | 36 | 63,4 % | 51,6 % | 7 |
| Gut gegen gut / B | 91 | 62 | 29 | 68,1 % | 48,4 % | 11 |
| Gut gegen schwach / A | 17 | 16 | 1 | 94,1 % | 43,8 % | 29 |
| Gut gegen schwach / B | 167 | 88 | 80 | 52,7 % | 64,8 % | 0 |
| Schwach gegen schwach / A | 57 | 44 | 14 | 77,2 % | 45,5 % | 18 |
| Schwach gegen schwach / B | 38 | 29 | 11 | 76,3 % | 62,1 % | 21 |

*Roh-Paradenquote = registrierte Paraden / registrierte Zielschüsse. Diese Bilanz ist nicht vollständig geschlossen: Tore können auch aus anderen Ballwegen entstehen, und mindestens ein registrierter Zielschuss hat keinen entsprechenden Endzähler. Sie wird hier unverändert gezeigt und nicht als vollständig geprüfte Fangwahrscheinlichkeit interpretiert.

Fünf Partien mit abweichender Torwartbilanz wurden zusätzlich mit identischen Seeds nachgespielt. Ergebnis, sämtliche Statistikzähler und Zahl der Zufallsziehungen stimmen jeweils exakt mit der Hauptreihe überein. Die Nachprüfung zählt **nicht** zu den 90 Stichprobenpartien.

| Paarung / Partie | Seed | Paraden + Gegentore − Zielschüsse (A · B) | Nachprüfung |
| --- | --- | --- | --- |
| Gut gegen gut / 24 | 22669771 | -1 · 0 | Eine Zielschussbuchung ohne Parade/Gegentor; Ursache offen |
| Gut gegen schwach / 27 | 22983958 | 0 · 1 | Zusätzlicher Treffer ohne aktiven Flug beim Torereignis; Ballweg nicht vollständig protokolliert |
| Schwach gegen schwach / 8 | 20994107 | 1 · 0 | Tor aus Flanke, ohne zusätzlichen Schusszähler |
| Schwach gegen schwach / 9 | 21098836 | 0 · 1 | Zusätzlicher Treffer ohne aktiven Flug beim Torereignis; Ballweg nicht vollständig protokolliert |
| Schwach gegen schwach / 25 | 22774500 | 0 · 1 | Tor aus Pass, ohne zusätzlichen Schusszähler |

Die Flanken-/Passtore sind im Ergebnis enthalten, aber kein zusätzlicher Schuss im Schusszähler. Für die beiden Treffer ohne aktiven Flug ist die vollständige Vorgeschichte aus diesem Protokoll nicht ableitbar. Bei gut/gut, Partie 24, bleibt eine Zielschussbuchung ungeklärt. **Offener Befund:** Ein konsistentes Aktions-/Ergebnisprotokoll für Schüsse, Abpraller und Tore fehlt; aus dieser Reihe sollte deshalb keine präzise Schussverwertungs- oder Fangmodellkalibrierung abgeleitet werden. Die Ergebnisbuchung selbst stimmt in allen 90 Spielen.

## Schussarten und Distanzen

| Schusstyp | Gut/gut | Gut/schwach | Schwach/schwach | Distanz Ø / Maximum (Szenenmeter) |
| --- | --- | --- | --- | --- |
| shot | 306 | 275 | 185 | 15,13 / 30,91 |
| header | 2 | 1 | 1 | 10,13 / 12,45 |
| direct-free-kick | 0 | 2 | 0 | 20,73 / 23,49 |
| penalty | 0 | 0 | 1 | 9,45 / 9,45 |

Distanzen sind die zum Aktionsbeginn verwendeten Szenenmeter der Engine, keine nachträglich vermessenen realen Meter. Ein wegen zu großer Distanz in einen Kopfballpass umgewandelter Versuch zählt nicht als Schuss. Elfmeter werden separat am tatsächlichen Ausführungsabschluss gezählt.

## Einzelresultate

| Paarung | Ergebnis A:B → Häufigkeit |
| --- | --- |
| Gut gegen gut | 0:1 → 6; 1:1 → 5; 0:0 → 3; 2:1 → 3; 1:0 → 2; 1:2 → 2; 1:3 → 2; 2:0 → 2; 0:2 → 1; 0:4 → 1; 2:2 → 1; 3:1 → 1; 3:3 → 1 |
| Gut gegen schwach | 3:0 → 10; 2:0 → 7; 1:0 → 6; 4:0 → 4; 3:1 → 1; 5:0 → 1; 6:0 → 1 |
| Schwach gegen schwach | 0:0 → 11; 0:1 → 8; 1:0 → 5; 0:2 → 2; 1:1 → 2; 2:0 → 2 |

Die [CSV mit allen 90 Partien](match-study-v115.csv) enthält Paarung, Seed, Heimseite, Ergebnis, Outcome, Dauer und sämtliche Mannschaftszähler getrennt für A/B. [Rohdaten und Profile](match-study-v115.json), [aggregierte Werte](match-study-summary-v115.json) und [gezielte Bilanznachprüfung](match-study-accounting-v115.json) bleiben daneben erhalten.

## Reproduzierbare Methode

- Regulärer lokaler Offline-Build: `outputs/Doppel-6-Fussballmanager.html`, Oberfläche PROTOTYP 105, integrierter Fußballstand v115. SHA-256: `c522f4f6fe80580cf58d34ad4970ec619c2ccb4ae9c40d7ffd0afde4cb3395d3`. Dies ist der Hash des zum Messzeitpunkt verwendeten Builds gemäß [v115-Verifikation](verification-v115.json). Die anschließende Handschuhgrafik v116 verändert den aktuellen Build, nicht die physische Simulation.
- Isoliertes, frisches Headless-Edge-Profil; keine Nutzerkarriere gelesen oder verändert. Matchsteuerung über `v65CreateMatch/v65Show`, `step`, `v65AfterStep`, reguläre Halbzeitfortsetzung und Ergebnisbuchung. Renderer ausgeschaltet; dieselbe physische Logik in 2D und 3D wurde zuvor in v115 auf Parität geprüft. Die Untersuchung hier ist eine Statistikprüfung, keine weitere Sichtprüfung der Animationen.
- 20 Physikschritte pro realer Simulationssekunde: `step(0.05 * MATCH_SPEED, 0.05)`, unverändertes `MATCH_SPEED = 0.78`. Keine echten Wartezeiten zwischen Schritten; Pausen/Standardzeiten bleiben in der Engine. Mittlere dargestellte Laufzeit einschließlich solcher Phasen: Gut gegen gut 149,7 s; Gut gegen schwach 163,2 s; Schwach gegen schwach 138,6 s.
- 30 gemeinsame Seeds pro Paarung: `20261004 + i * 104729`, `i = 0…29`. LCG: `s = (1664525*s + 1013904223) >>> 0`, Zufallswert `s / 2^32`. Seed wird erst nach Karriere-/Kader-/Taktikvorbereitung gesetzt. Gleiche Seeds schaffen einen vergleichbaren Ausgangspunkt; verschiedene Entscheidungen führen anschließend zu unterschiedlichen Zufallspfaden.
- Jedes Spiel erhält eine frische Kopie derselben isolierten Karriere und eine Ligapartie ohne Elfmeterschießen. Team A spielt 15-mal zu Hause und 15-mal auswärts; Teamzuordnung, physische Seiten und gebuchte Heim-/Auswärtsergebnisse werden geprüft. Es wurde keine zusätzliche Heimstärke eingeführt.
- Je Mannschaft sechs aktive Spieler: ein Torwart, zwei Verteidiger, zwei Mittelfeldspieler und ein Stürmer; fünf positionsgerechte Ersatzspieler, keine Wechsel. Identische Formation 2–2–1, ausgeglichenes Pressing, variables Passspiel, neutrale Abwehrlinie, normale Aggression und variabler Fokus. Adaptiver Trainer ausgeschaltet, damit beide Teams dieselben Rahmenbedingungen behalten.
- Identische Anweisungen: linker Mittelfeldspieler Außenbahn/Flanken + anspielbar bleiben; rechter Mittelfeldspieler anspielbar bleiben; Stürmer Tiefenlauf + Abschluss suchen. Abwehr und Torwart Standard. Standardraster und rollenübliche Orientierung; kein Positionsmalus.
- Alle Spieler starten mit Alter 25, neutraler Form und Frische 100. Ermüdung und ausdauerabhängige Leistungsänderungen bleiben im Spiel aktiv. Form, Fitness und Resultate werden nicht von einer Partie zur nächsten übernommen.
- Interne Testprofile: gut = Basis 16, schwach = Basis 6 für alle neun Fähigkeiten. Torwart: Torwartwert +2, Stellungsspiel/Luftspiel +1; Abwehr: Zweikampf/Stellungsspiel +2, Luftspiel +1; Mittelfeld: Pass/Technik +2, Ausdauer +1; Sturm: Abschluss/Tempo +2, Stellungsspiel/Luftspiel +1. Diese technischen Werte dienen nur der internen reproduzierbaren Studie; die Spieleransichten behalten Farbstufen. Es handelt sich um kontrollierte Testkader, keine ausgewählten realen Vereinsroster.
- Zusatzzähler beobachten tatsächliche Aufrufe, ohne weitere Zufallszahlen zu verbrauchen oder Entscheidungen zu ändern. Die Elfmeterzählung wurde nach einer fehlgeschlagenen Instrumentierungsprüfung ergänzt; die bereits abgeschlossenen 76 Partien blieben erhalten, die restlichen 14 wurden fortgesetzt. Keine Partie aus der endgültigen Reihe wurde wegen ihres Ergebnisses ausgeschlossen.
- Abnahme: 90/90 abgeschlossen; beide Halbzeiten; feste Taktik; null Wechsel; Mannschaftstore und Heim-/Auswärtsbuchung identisch; beobachtete Schüsse einschließlich Elfmeter entsprechen den Spielerzählern; keine Browser-Skriptfehler.

Ausführen im Projektverzeichnis mit dem vorhandenen Node-Runtime: `node work/study-match-statistics-v115.cjs`. Bei Unterbrechung: `--resume` (nur bei identischem Build). Nachprüfung: `--audit-accounting`. Auswertung: `node work/report-match-statistics-v115.cjs`. Eine vollständige Neuberechnung überschreibt ausschließlich die lokalen Studienartefakte.

## Empfohlener nächster Balanceblock

1. Schuss-/Tor-/Paradenereignisse konsistent verknüpfen und die ungeklärte Zielschussbuchung isolieren. Erst danach Verwertung und Torwartquoten präzise abstimmen.
2. Stärkeabstand und schwache Offensiven mit mittleren sowie echten Vereinsprofilen prüfen. 80:1 und nur 0,83 Tore pro schwacher Paarung sind prüfwürdig; diese extremen Profile allein begründen noch keine pauschale Abschwächung guter Spieler.
3. Gelegenheiten für Volley, Kopfballabschluss, Feldblock und Torwartzugriff getrennt von erfolgreicher Ausführung messen. Spezialaktionen sollen aus passenden Spielsituationen entstehen, nicht durch eine globale Häufigkeitserhöhung.

Die Studie hat keine Regeln nachjustiert, keine bisherigen Spielstände umgerechnet, keine Meshy-Credits verbraucht und keinen Build veröffentlicht.
