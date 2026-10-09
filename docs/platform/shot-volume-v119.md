# Abschlussmenge: Diagnose und private Versuche

Nutzerziel: durchschnittlich **10–16 Abschlüsse insgesamt für beide Mannschaften** pro vollständiger Partie. Einzelne Spiele dürfen davon abweichen. Es werden keine Abschlüsse oder Tore erzwungen. Die Zahl ist ein Ziel für eine Verteilung, keine feste Quote.

## Reproduzierter Unterschied

Dieser Diagnoseabschnitt hält den damaligen Zwischenstand vor der finalen Halbzeitkorrektur und Kompaktabstimmung fest; seine Zähler sind keine Abschlusswerte des finalen 119-Builds.

`work/diagnose-shot-volume-v119.cjs` spielt dieselben drei vollständigen Ausgangsbegegnungen wie die Unity-Abnahme im tatsächlich geladenen nativen Controller. Eine unabhängige Kopie derselben Karriere, Aufstellung und Begegnung wird im Kompaktmodell ausgespielt. Die zusätzliche Beobachtung verändert keine Zufallsziehungen oder Produktionsdateien.

| Platz / Feldspieler | Native Abschlüsse | Kompakt | Native Entscheidungen | Positive Schussfenster | Ballbesitzzeit innerhalb 22 m |
| --- | ---: | ---: | ---: | ---: | ---: |
| bisherig / 5 | 3 | 41 | 325 | 46 | 8,80 s |
| größer / 5 | 3 | 32 | 385 | 19 | 4,35 s |
| größer / 6 | 6 | 37 | 274 | 26 | 11,30 s |

Im nativen Spiel scheitern 259/351/221 Entscheidungen bereits an der 22-m-Grenze von `v157ShotQuality`. Der Spieler mit Ball ist insgesamt nur 45,35/50,35/46,85 echte Simulationssekunden im ununterbrochenen Feldspiel am Ball. Die übrige Zeit entfällt unter anderem auf Flüge, lose Bälle und Unterbrechungen.

Ein vorhandenes positives Schussfenster führt ebenfalls häufig nicht zum Abschluss. Für die drei Partien lauten die Fensterentscheidungen:

- Bisheriger Platz, fünf Feldspieler: 28 zunächst nicht getrennte Folgeentscheidungen einschließlich wartender Passdrehungen, acht vorgezogene freie Angriffe mit Ball, acht Pässe, ein hoher Pass, ein Abschluss.
- Größerer Platz, fünf Feldspieler: 14 solche Folgeentscheidungen, zwei Pässe, drei Abschlüsse.
- Größerer Platz, sechs Feldspieler: 14 vorgezogene freie Angriffe mit Ball, sieben solche Folgeentscheidungen, zwei Pässe, drei Abschlüsse.

Die tatsächlichen Gesamtabschlüsse enthalten zusätzlich Standards und direkte Ballkontakte. Die meisten Fenster liegen zwischen 18 und 22 m. `v159Decide` zieht einen freien Stürmer zwischen 12 und 30 m zunächst Richtung Tor, bevor die Schussentscheidung betrachtet wird. `v157Decide` beendet danach jede eigene Entscheidung, sodass die ältere Schusschance bis 30 m nicht mehr zum Zug kommt. Ein besser bewerteter Querpass steht vor der Schussentscheidung.

Ein weiterer Unterschied: Die Fensterqualität prüft nur die mittige Torlinie, die tatsächliche Schussausführung wählt dagegen aus fünf Torsektoren. Eine versperrte Mitte kann deshalb einen vorhandenen seitlichen Abschluss ausschließen. Die Passkontakte funktionieren grundsätzlich: 45/53, 44/52 und 40/45 verbuchte Pässe werden abgeschlossen.

Im Kompaktmodell wird dagegen bisher für jede Seite und Minute dieselbe Abschlussziehung gegen 0,22 geprüft. Das erklärt die wesentlich größere Menge ohne Bezug zu den tatsächlichen nativen Schussfenstern. Eine künftige Absenkung muss neu angelegte Match-Ledger kennzeichnen; laufende unmarkierte Partien behalten ihre alte Regel.

## Kompaktmodell abgeschlossen

Eine separate Instanz hat 192 tatsächliche vollständige Kompaktpartien für die Kandidaten 0,22/0,07/0,08/0,09 geprüft. Root hat **0,09** für neu angelegte Ledger mit `playerPerformance.shotBalanceRevision=119` integriert. Die tatsächliche Produktionsprüfung umfasst 48 neue Partien, 48 markierte JSON-Fortsetzungen und 48 Kontrollen des unveränderten unmarkierten 0,22-Pfads. Alle aufgelösten Zufallsziehungen und Ergebnisse der Fortsetzungen stimmen exakt überein. Alte Kontroll-Spielstände werden nicht nachgekennzeichnet.

Der Durchschnitt beträgt **12,625 Abschlüsse insgesamt**. Die vier Konfigurationen erreichen 12,83 / 12,50 / 12,92 / 12,25; einzelne Partien liegen bei 7–18. Die Ergebnis-/Torwahrscheinlichkeit erhält keinen zusätzlichen Bonus. Dies ist eine Stichprobenkalibrierung, keine garantierte Anzahl pro Partie.

Belege: `compact-matrix.json`, `compact-summary.json`, `compact-production.json`, `compact-production-summary.json` im selben Ausgabeordner. Produktionsquelle `world-player-performance-v155.js`: SHA-256 `262ad562b2f8730aef2c816f56bb832796cf53169349a9a8b25a10d5437a8271`. Dieser Kompakt-Nachweis ersetzt keine native Kalibrierung.

## Finale Matchzähler

Die abschließenden drei nativen/Unity-Paare des HTML-Builds `ecd3d875e5561f5e488c3e8d480a32a4cf43abb90108c5837db9293ad5d8950f` stimmen in allen 14 Zustands-/Buchungsteilen überein. Für Standard/fünf, groß/fünf und groß/sechs lauten die physischen Zähler jeweils **6/0/0**, **3/2/1** und **4/2/0** (Schüsse/aufs Tor/Tore, beide Teams zusammen). Die unabhängigen kompakten Partien derselben Ausgangskarrieren liefern **17/8/2**, **16/9/3** und **13/6/1**. Alle physischen Schussereignisse sind abgeschlossen. Einzelpaarungen belegen keine Verteilungsfreigabe; die zusätzliche [Zwölf-Partien-Weltstichprobe](../agentenauftraege/d6-119-world-shot-sample.md) bestätigt mit Ø 3,75 weiterhin die offene physische Abstimmung.

## Private native Kandidaten

Produktionsdateien werden während dieser Versuche nicht verändert. Die beiden abgeänderten Module werden ausschließlich im isolierten Browser über Request-Routen ersetzt. Beide Varianten gelten nur bei vorhandenem `paceRevision=119`. Präzision, reale Gegnerkontakte, Torhüterreichweite, Belastung und Tore bleiben im bestehenden Controller.

Der erste Kandidat erweitert nützliche, freie Fenster auf 26 m, wertet die Qualität mit `(26-Entfernung)/14`, nutzt nützliche Fenster bis 18 m sofort und lässt eine hinreichend nützliche Abschlusschance vor der freien Stürmer-Trageentscheidung zu. Er wurde nach dem klaren negativen Befund angehalten:

| Beobachtete fertige Partien | Vorher Ø | Kandidat Ø |
| --- | ---: | ---: |
| bisheriger Platz / 5, acht Seeds | 5,25 | 5,88 |
| bisheriger Platz / 6, sieben Seeds | 6,71 | 4,71 |

Diese Teilmenge erfüllt das Ziel nicht. Größere Plätze und vollständige JSON-Parität sind für diesen verworfenen Versuch nicht belegt. Die ehrliche Teilaufzeichnung steht in `candidate-partial.json`.

Der zweite Kandidat verwendet die vorhandene Fünfsektor-Auswahl für die Schussfensterqualität. Ein nützliches Fenster bis 22 m kommt vor einem nur spekulativ besseren Querpass zum Zug; ein tatsächlich naher Empfänger unter 10 m mit mindestens 0,4 besserer Qualität bleibt bevorzugt. Die ersten fünf fertigen Vergleichspaare ergeben 8/9/6/5/6 Abschlüsse im Kandidaten. Auch dies ist noch keine bestätigte Zielkalibrierung.

## Echter Halbzeitfehler aus dem zweiten Versuch

Der zweite Versuch wurde bei bisherigem Platz, fünf Feldspielern und Seed `shot119-5` durch eine reale P02-Prüfung beendet. Zwei tatsächliche Zweikampfereignisse `contact:618` werden bei **50,0468 virtuellen Minuten** erzeugt. Anschließend wird die Spieluhr auf **50,0** zurückgestellt und die Belastung verbucht. Beide Spieler haben bereits gespielte Bereiche `[0,50]`; neue Bereiche fehlen. Die Belastungsprüfung lehnt die außerhalb des Bereichs liegenden Ereignisse korrekt ab.

Betroffene Spieler: `shot119-5:GER-2:11` und `shot119-5:GER-5:Y1:1`. `match.elapsed=41,666666666666664` entspricht beim Abbruch genau Minute 50, während der Karrierestatus vor `v65AfterStep` noch Minute 49 zeigt. Ursache ist die Halbzeitbegrenzung nach dem Kontakt, nicht eine falsche Belastungsprüfung. Der Kontakt muss vor einer möglichen Uhr-Rückstellung verhindert werden, oder die Uhr muss vor dem Kontakt korrekt an der Grenze begrenzt werden. Ereignisse werden nicht verworfen und die P02-Invariante wird nicht gelockert.

Der enge Versuch `work/diagnose-shot-p02-v119.cjs` reproduzierte dies mit dem tatsächlichen Controller. Root hat den zukünftigen 119-Pfad in `halftime-v14.js` und `set-pieces-v50.js` korrigiert: tatsächlich bereits gespielte Zeit wird als Halbzeitende/Verlängerung erhalten. Kontakte werden nicht verworfen oder umgeschrieben, der Altpfad bleibt unverändert. 18 fokussierte Root-Prüfungen bestehen. Der enge Kandidatenlauf beendet danach die Partie mit sieben Abschlüssen ohne P02-Fehler.

Root hat `p02-failure.json` durch diesen erfolgreichen Folgelauf ersetzt. Die exakten zuvor aus der Fehlerdatei gelesenen Ereignis-/Intervallwerte sind deshalb in `original-p02-event-summary.json` als historische Extraktion gekennzeichnet; die ursprüngliche zweite Kandidatenmatrix `candidate-sectors.json` enthält weiterhin ihren echten Fehlerstack und die abgeschlossenen Teilpartien.

Der dritte Kandidat wurde auf zwei Seeds in allen vier Konfigurationen geprüft. Ein Unterstützer bietet sich vier Meter voraus an, wenn dort mindestens 2,5 m Gegnerabstand und die bestehende freie Passlinie vorliegen; andernfalls bleibt der hintere Auslass erhalten. Die Mittelwerte vorher/nachher sind 6,5/7,5; 6/5; 5/3,5; 2/5. Der Kandidat erfüllt das Ziel nicht und bleibt privat.

Eine zunächst gemeldete standard/6-JSON-Abweichung betrifft ausschließlich die doppelten Karrieremetadaten unter `match.slide.victim`. Vor dem Speichern verweist dessen flache Kopie auf den echten Kader; nach JSON ist sie getrennt. Eine separate enge Prüfung vergleicht die vollständigen physischen Personenwerte des Slides wie bei `people`, zusätzlich sämtliche echten Kaderdaten für Fähigkeiten, Erscheinungen, Entwicklung, Frische, Rollenroutine und gespielte Tage sowie P02. Diese Prüfung besteht exakt. Spielzustand, Positionen, Zufallsstrom, Ergebnis und tatsächliche Karrierebuchung weichen nicht ab; die doppelte Slide-Historie ist keine Buchungsautorität. Die originale fehlgeschlagene Screen-Datei bleibt als Befund erhalten.

## Genauere Bewegungsdiagnose

`work/diagnose-owner-progression-v119.cjs` trennt nach der Uhrkorrektur die Passdrehungen von echter Trageentscheidung. In zwei vollständigen Originalpartien treten 188/224 wartende Passdrehungsentscheidungen auf; sechs von 18 bzw. 14 von 23 positiven Fensterentscheidungen liegen in solchen Drehungen. Nur drei bzw. zwei entfallen tatsächlich auf den ursprünglichen Trage-Fallback. Eine reine Ausweitung der Schusswahrscheinlichkeit löst diese Vorbereitung nicht.

Die Quelltextvermutung, dass `v121RunnerTarget` einen ballführenden Unterstützer vier Meter zurückschickt, ist **im tatsächlichen Stock-Controller nicht bestätigt**: 82/169 Aufrufe für ballführende Unterstützer erzeugen keinen einzigen solchen Rückwärts-Zielpunkt. Der vorhandene `plan.limit`-Schutz schließt den Ballführer aus. Diese Vermutung führt deshalb zu keiner Produktionsänderung. Der Ballführer legt 73,81/102,93 m vorwärts und 17,02/21,14 m rückwärts zurück; Rückwärtsziele aus anderen Pfaden betreffen etwa fünf Prozent der finalen Zielabfragen.

Ein vierter privater Versuch darf ein tatsächlich nützliches Schussfenster anstelle einer nur spekulativen Passvorbereitung wählen. Er behält die vorhandene körperliche Drehung und wartet bis zur tatsächlichen Zielausrichtung sowie höchstens 1,2 m/s Geschwindigkeit vor der normalen Schussausführung. Ein neuer plain `pendingTurn.kind='shot'` benötigt einen ausdrücklich passenden Target-Guard; es gibt weder serialisierte Callbacks noch eine neue Belastungsuhr. Dieser Versuch ist noch keine Produktionsfreigabe.

Dieser vierte Screen umfasst zwei Seeds für alle vier Konfigurationen und vier tatsächliche JSON-Fortsetzungen. Alle physischen und autoritativen Karriere-/P02-Daten stimmen nach der Fortsetzung exakt überein. Die Abschlussmittelwerte vorher/nachher betragen jedoch 6,5/5,5; 6/8; 5/4; 2/4,5. Auch dieser Kandidat wird nicht integriert. Beleg: `candidate-shotturn-screen.json`. Ein neuer Screenshot oder weitere Zeit auf dem Android-Gerät wäre kein Ersatz für die fehlende native Verteilungskalibrierung.

Alle Dateien liegen unter `outputs/3d-quality/shot-volume-v119/`. Drei diagnostische Partien und angehaltene private Kandidaten sind keine breite Balancefreigabe, kein Unity-/Android-Bildnachweis und keine Veröffentlichung.

## Fünfter privater Pilot: vorhandene 30-m-Reichweite

Der fünfte Versuch prüft zwei Seeds mit fünf und sechs Feldspielern auf dem Standardplatz: freie tatsächliche Fünfsektor-Fenster bis 30 m, mäßig fallende Qualität `(30-Entfernung)/18`, sofortige nützliche Abschlüsse bis 22 m und der bestehende Passdrehungsablauf. Der Versuch wird nach dem klaren Befund beendet; größere Felder und acht Seeds werden nicht mehr gemessen. Keine Produktionsquelle wurde geändert.

| Standardplatz | Vorher Ø Abschlüsse | Kandidat Ø | Vorher/Kandidat aufs Tor | Vorher/Kandidat Tore |
| --- | ---: | ---: | ---: | ---: |
| 5 Feldspieler, zwei Seeds | 6,5 | 7,0 | 2,0 / 1,5 | 1,5 / 1,0 |
| 6 Feldspieler, zwei Seeds | 6,0 | 5,5 | 2,0 / 2,5 | 2,0 / 1,5 |

Die nominal positiven Fensterentscheidungen steigen bei fünf Spielern von 15/10 auf 80/81 und bei sechs von 15/28 auf 63/81. Diese Zählung umfasst wiederholte Entscheidungen derselben Vorbereitung, keine unabhängigen Torchancen. Das Reichweitenfenster allein liefert daher weiterhin keinen tragfähigen Zielnachweis. Ein nächster enger Befund trennt echte Zielausrichtung und Bremswartezeit der vorhandenen Passvorbereitung.

Die originale Screen-Datei enthält eine rohe JSON-Digest-Abweichung für Standard/6. Die enge Diagnose isoliert ausschließlich acht doppelte Karrieremetadatenpfade unter `match.whistleAttackCarrier`. Dessen vollständige physische Person wird anschließend wie `people` verglichen; sämtliche maßgeblichen Kaderdaten einschließlich Routine, Entwicklung, Geschichte, Frische sowie P02 werden separat exakt geprüft. Beide tatsächlichen Fortsetzungen ergeben identische kanonische Daten und Zufallsströme. Der native Welt-Abpfiff liest aus dieser Referenz die Mannschaft; die doppelte Karrierehistorie bucht keine Erscheinung. Es gibt dafür keine Produktionsänderung. Originalbefund und normalisierter Nachweis bleiben getrennt gespeichert.

Belege: `candidate-thirty-screen.json`, `candidate-thirty-summary.json`, `candidate-thirty-json-raw.json`, `thirty-json-diff-summary.json` und `candidate-thirty-json-diff.json`; Runner `work/experiment-shot-volume-thirty-v119.cjs` und `work/diagnose-thirty-json-v119.cjs`.

## Sechster privater Versuch: konsistente Passvorbereitung

Die [separate Ablaufdiagnose](../agentenauftraege/d6-119-pass-preparation-diagnosis.md) belegt wiederholte Abbrüche: Die Optionen und die Ausführung prüfen einen Laufpunkt vor dem Empfänger, die Drehvorbereitung dagegen dessen aktuelle Position. Der sechste Kandidat verwendet deshalb für die anfängliche Winkelprüfung, die tatsächliche Pivot-Ausrichtung sowie Lane und Winkel bei der Fortsetzung denselben vorhandenen `v157PassLead`. Dies gilt ausschließlich für gewöhnliche Bodenpässe mit frischem `paceRevision=119`. Standards, freigestellte Pässe, hohe Bälle, Raum- und Kopfbälle behalten ihre bestehenden Ziele. Besitzer-, Slide-, Abseits- und Lane-Guards bleiben erhalten; Geschwindigkeit 1,2 m/s, Winkeltoleranz 0,30 rad, tatsächliche Ausführungsfehler und Kontakte bleiben unverändert. Neue Plainfelder oder Zufallsziehungen fehlen.

Der Versuch startet mit den unveränderten Produktionsregeln für Schüsse, Tragen und Angebote. Keiner der zuvor verworfenen Kandidaten wird übernommen. Zwei Seeds je vier Konfigurationen liefern 16 vollständige Vergleichspartien sowie vier tatsächliche JSON-Fortsetzungen. Alle Fortsetzungen stimmen in physischen Daten, Zufallsstrom, Ergebnis, Ereignissen, Karrierebuchungen und P02 exakt mit ihrem ununterbrochenen Kandidatenlauf überein. Die bereits isolierten doppelten Karrieremetadaten in Slide-Personen und `whistleAttackCarrier` werden wie bei den anderen physischen Personen getrennt von den vollständigen maßgeblichen Kaderdaten verglichen. Alle 157 Produktionsdateien im Root von `dist/` mit Endung JS/CSS/HTML behalten während der Messung ihre Hashes.

| Konfiguration, jeweils zwei Seeds | Abschlüsse vorher / Kandidat | Aufs Tor vorher / Kandidat | Tore vorher / Kandidat | Pässe vorher / Kandidat | Bestätigte Pässe vorher / Kandidat |
| --- | ---: | ---: | ---: | ---: | ---: |
| Standard / 5 | 6,5 / 5,5 | 2,0 / 2,5 | 1,5 / 1,5 | 56,0 / 54,0 | 49,5 / 51,0 |
| Standard / 6 | 6,0 / 5,5 | 2,0 / 3,0 | 2,0 / 2,0 | 51,0 / 52,5 | 46,5 / 46,0 |
| Groß / 5 | 5,0 / 2,5 | 0,5 / 0,5 | 0,5 / 0,5 | 49,5 / 49,5 | 43,5 / 39,5 |
| Groß / 6 | 2,0 / 2,5 | 1,0 / 1,5 | 0,5 / 1,5 | 52,0 / 55,5 | 42,5 / 48,5 |

Die beobachteten Fortsetzungsabbrüche sinken im Mittel von 32,5 auf 11; 33 auf 11; 15,5 auf 5,5; 13,5 auf 8. Wartende Drehungsentscheidungen verändern sich dagegen von 169 auf 230,5; 214,5 auf 180; 203 auf 175,5; 218 auf 192. Die Zähler umfassen alle vorhandenen Passdrehungsarten; sie sind weder einzigartige Torchancen noch eine gemessene Zeitdauer. Die Zielkonsistenz reduziert damit den konkreten wiederholten Lane-Abbruch, verbessert Tempo oder Abschlüsse aber nicht allgemein. Das Abschlussziel wird weiterhin klar verfehlt. Eine größere Acht-Seed-Matrix wird nicht gestartet. Root bewertet eine mögliche eigenständige Konsistenzkorrektur getrennt von der weiterhin offenen nativen Chancenbalance.

Belege im selben Ausgabeordner: `candidate-passlead-screen.json`, `candidate-passlead-summary.json` und `candidate-passlead-sources.json`. Letztere enthält die exakten privaten Quellbytes für die Root-Review, SHA-256 `45b2f6e2391baed4d885fbf463a69824b48af022dbeb83a23d7b27650778bdb9`. Rohreport SHA-256 `63ea4cbe4a1e881d559983ec590422602a85cfacbc8cd71d37be3a2db00d90c6`; Runner `work/experiment-shot-volume-passlead-v119.cjs` SHA-256 `ebc7f26577deb989dcaba1e8f1e9b50caa92ead145eaf887e7b46e1268050a2a`. Keine Produktionsänderung oder Veröffentlichung gehört zu diesem Versuch.

## Siebter privater Versuch: freie frühere Abschlussfenster

Die [zusätzliche neutrale Schussdiagnose](../agentenauftraege/d6-119-shot-window-diagnosis.md) zeigt wenig tatsächliche Abschlussgelegenheiten im bisherigen 22-m-Fenster. Ein neuer privater Kandidat kombiniert deshalb die Bodenpass-Zielkonsistenz des sechsten Versuchs mit freier Fünfsektor-Qualität bis 26 m, `(26-Entfernung)/14`, und sofortiger Ausführung eines tatsächlich nützlichen freien Fensters bis 24 m. Ein wirklich naher Empfänger unter 10 m mit um mindestens 0,4 besserer Qualität bleibt bevorzugt. Die freie Stürmer-Trageentscheidung kommt unter 26 m bei positiver realer Qualität später. Schusswinkel, Blocker, tatsächliche Präzision, Zufallsziehungen, Torhüter und Ergebnisregeln erhalten keine Lockerung. Ein versperrter oder qualitativ wertloser Abschluss wird nicht erzwungen.

Die Baseline ist der tatsächliche unveränderte Produktionsstand. Der Vergleich umfasst zwei Seeds je vier Konfigurationen sowie vier tatsächliche JSON-Fortsetzungen, insgesamt 20 vollständige Partien. Alle vier Fortsetzungen stimmen exakt in physischen Daten, Zufallsstrom, Ereignissen, Ergebnis, vollständigen maßgeblichen Karrierebuchungen und P02 überein. Alle 157 eingefrorenen Produktionsdateien bleiben unverändert.

| Konfiguration, zwei Seeds | Abschlüsse vorher / Kandidat | Aufs Tor vorher / Kandidat | Tore vorher / Kandidat | Pässe vorher / Kandidat | Bestätigte Pässe vorher / Kandidat |
| --- | ---: | ---: | ---: | ---: | ---: |
| Standard / 5 | 6,5 / 7,5 | 2,0 / 3,5 | 1,5 / 2,5 | 56,0 / 56,0 | 49,5 / 49,0 |
| Standard / 6 | 6,0 / 8,0 | 2,0 / 3,0 | 2,0 / 1,5 | 51,0 / 51,0 | 46,5 / 45,0 |
| Groß / 5 | 5,0 / 4,5 | 0,5 / 1,5 | 0,5 / 0,5 | 49,5 / 49,0 | 43,5 / 41,0 |
| Groß / 6 | 2,0 / 2,5 | 1,0 / 0,5 | 0,5 / 0,0 | 52,0 / 49,5 | 42,5 / 43,0 |

Der ausgewogene Gesamtdurchschnitt der acht Vergleichsfixtures steigt von **4,875 auf 5,625 Abschlüsse**; aufs Tor von 1,375 auf 2,125, Tore bleiben bei 1,125. Das Nutzerziel von 10–16 bezieht sich auf beide Teams zusammen im Populationsdurchschnitt; es verlangt keine feste Quote je Partie oder Konfiguration. Auch der Gesamtdurchschnitt dieses Screens liegt deutlich darunter. Es wird keine größere Acht-Seed-Matrix gestartet. Zwei Seeds sind eine private Vorprüfung und keine abschließende Balancefreigabe.

Alle 39 bzw. 45 beobachteten Schussaufrufe entsprechen den tatsächlich gebuchten Abschlüssen. Die Entfernung beim Aufruf steigt im Mittel von 18,54 auf 19,96 m; die Bereiche sind 8,35–30,28 m vorher und 9,13–26,01 m im Kandidaten. Die Anzahl tatsächlicher Gegner innerhalb von 2,5 m beim Aufruf steigt von 0,564 auf 0,8 je Abschluss. Dies ist eine Ortsbeobachtung und ersetzt nicht den vorhandenen internen Druckterm. Die Einzelaufrufe mit Entfernung, Gegneranzahl und Aktionsart bleiben im Rohreport erhalten.

Belege: `candidate-finish-window-screen.json`, `candidate-finish-window-summary.json`, `candidate-finish-window-sources.json`; Runner `work/experiment-shot-volume-finish-window-v119.cjs`. Rohreport SHA-256 `e2fee8027661b3bcab499ab0bdf1f88fc24c99c716b4df62f47d8f2d68051c1a`; exakte private Quellbytes SHA-256 `1ac0641384516cdc84584e53922cca9e61f5151f1371c0c51ec03f15f1eee1f9`. Die native Chancenbalance bleibt offen; Produktionsdateien wurden nicht geändert.

## Achter privater Versuch: dynamischere Ballführung

Dieser Versuch verwendet die Zielkonsistenz gewöhnlicher Bodenpässe aus Stage6, ergänzt aber keine Abschlussänderung aus Stage7. Die einzige zusätzliche Variable ist der Besitzerfaktor in `v157Pace`: bei frischem `paceRevision=119` 1,65 statt 1,28. Der Faktor `.78+tec*.009`, Grundtempo/Speedfähigkeit, vorhandene P02-Anpassung, Beschleunigung, Bremsung, Kontaktregeln, Verteidigung und Abschlussentscheidungen bleiben erhalten. Unmarkierte Partien behalten 1,28. Bei maximaler Technik beträgt das Verhältnis ungefähr 1,584; es gibt keine garantierten gewonnenen Duelle oder erzwungenen Chancen.

Die echte Livebaseline bleibt Stock. Zwei Seeds je vier Konfigurationen plus vier tatsächliche JSON-Fortsetzungen ergeben 20 volle Partien. Alle vier Fortsetzungen sind exakt einschließlich physischen Zustands, Zufallsstrom, vollständiger maßgeblicher Kaderdaten und nativer `playerLoad`-/P02-Ledger. Zusätzlich stimmen alle acht neu beobachteten Stock-Digests exakt mit den vorhandenen Stage7-Stock-Digests überein: die zusätzlichen Bewegungsbeobachter verändern den Verlauf nicht. Alle 157 Produktionshashes bleiben unverändert.

| Konfiguration, zwei Seeds | Abschlüsse Stock / Kandidat | Aufs Tor Stock / Kandidat | Tore Stock / Kandidat | Pässe Stock / Kandidat | Bestätigte Pässe Stock / Kandidat |
| --- | ---: | ---: | ---: | ---: | ---: |
| Standard / 5 | 6,5 / 6,5 | 2,0 / 2,5 | 1,5 / 2,0 | 56,0 / 53,5 | 49,5 / 46,0 |
| Standard / 6 | 6,0 / 5,5 | 2,0 / 2,0 | 2,0 / 1,5 | 51,0 / 49,0 | 46,5 / 41,0 |
| Groß / 5 | 5,0 / 3,0 | 0,5 / 1,0 | 0,5 / 1,0 | 49,5 / 45,5 | 43,5 / 39,0 |
| Groß / 6 | 2,0 / 4,0 | 1,0 / 2,0 | 0,5 / 1,5 | 52,0 / 48,0 | 42,5 / 41,5 |

Der ausgewogene Gesamtschnitt beträgt **4,875 Stock gegenüber 4,75 Kandidat**. Aufs Tor steigt er von 1,375 auf 1,875, Tore von 1,125 auf 1,5. Das Abschlussziel von 10–16 insgesamt wird nicht erreicht; keine größere Matrix wird gestartet.

Die ausgewählte Besitzer-Maximalgeschwindigkeit aus dem tatsächlich aufgerufenen `v157Pace`, nach vorhandener P02-Anpassung, steigt im Mittel von 5,02 auf 6,52 m/s; die beobachteten Maxima von 5,73 auf 7,47 m/s. Dies ist der gewählte Geschwindigkeitsrahmen, keine Behauptung über die tatsächlich erreichte Körpergeschwindigkeit. Tatsächliche Besitzerbewegung in `v157Move` beträgt im Mittel 97,32/103,84 m vorwärts und 18,59/15,46 m rückwärts, insgesamt 142,70/147,55 m. Der Zähler erfasst Bewegung, solange derselbe Spieler Besitzer bleibt; zusätzliche Separationskorrekturen sind darin nicht enthalten. Gebuchte Tackleversuche ändern sich von 26,375 auf 23,625, gewonnene Tackles von 4,5 auf 3,875. Die Verteidigungsregeln selbst werden nicht geändert.

Eine zusätzliche historische Ein-Variablen-Referenz vergleicht diesen Kandidaten mit Stage6 auf exakt denselben Seeds und identischen 157 Produktionshashes. Gegenüber Stage6 steigt der Abschlussmittelwert von **4,0 auf 4,75**: 5,5→6,5 / 5,5→5,5 / 2,5→3 / 2,5→4. Dies ist ein kleiner positiver Bewegungseffekt relativ zur Lead-Konsistenz, keine Zielkalibrierung. Die historische Stage6-Referenz und die neue tatsächliche Stock-Baseline sind im Summary getrennt ausgewiesen.

Belege: `candidate-carrier-pace-screen.json`, `candidate-carrier-pace-summary.json`, `candidate-carrier-pace-sources.json`; Runner `work/experiment-shot-volume-carrier-pace-v119.cjs`. Rohreport SHA-256 `aa10dc45298f2b06507509d8f3f7e247fe42f77fada1343710d7c95f89ee5779`; exakte private Quellbytes SHA-256 `6e45e99b771b77656c35642ae944f2c96b1c77197d158e697969efb7f2a52d6b`. Alle eigenen Browserkontexte und Server sind geschlossen. Keine Produktionsänderung oder Veröffentlichung gehört zu diesem Versuch.

## Neunter privater Versuch: längere Bindung an Angebote

Die [neutrale Ablaufdiagnose](../agentenauftraege/d6-119-offer-lifecycle-diagnosis.md) belegt echte auslaufende Tiefenangebote mit anschließender Recovery. Sie präzisiert zugleich die Grenze des ursprünglichen Distanzbefunds: Bei drei von vier bzw. elf von dreizehn untersuchten Ablaufzielen liegt das ungekappt gedachte Ziel hinter der tatsächlichen Formationsbegrenzung. Restdistanz zum Wunschziel ist deshalb keine belegte frei nutzbare Chance. Acht bzw. 29 andere reine Intent-Löschungen geschehen bei `owner=null`, etwa während eines Passes; sie sind kein Beweis für den Abbruch einer durchgehenden Ballführung.

Der neunte Kandidat verwendet Stock plus Stage6-Passzielkonsistenz. Die einzige weitere Variable ist `offerUntil`: frisch markierte 119-Angebote halten 2,2 statt 1,05 Sekunden, unmarkierte behalten 1,35. Crowding, Erreichen, Rollen, Formation, Abseits, bestehende Recovery von 0,55 Sekunden, Geschwindigkeit, Zufallsziehungen und Abschlüsse bleiben unverändert. Kein Spieler darf wegen dieser Variante eine tatsächliche Grenze überschreiten.

Zwei Seeds je vier Konfigurationen plus vier reale JSON-Fortsetzungen ergeben 20 volle Partien. Alle vier Fortsetzungen stimmen in sämtlichen physischen und maßgeblichen Karriere-/P02-/Zufallsdaten exakt überein. Alle acht Stock-Digests mit zusätzlichen Offer-Beobachtern stimmen exakt zur vorhandenen Stock-Baseline. Alle 157 Produktionshashes bleiben gleich.

| Konfiguration, zwei Seeds | Abschlüsse Stock / Kandidat | Aufs Tor Stock / Kandidat | Tore Stock / Kandidat | Pässe Stock / Kandidat | Bestätigte Pässe Stock / Kandidat |
| --- | ---: | ---: | ---: | ---: | ---: |
| Standard / 5 | 6,5 / 4,0 | 2,0 / 1,0 | 1,5 / 0,5 | 56,0 / 52,5 | 49,5 / 45,5 |
| Standard / 6 | 6,0 / 4,5 | 2,0 / 2,5 | 2,0 / 2,0 | 51,0 / 54,0 | 46,5 / 46,0 |
| Groß / 5 | 5,0 / 4,0 | 0,5 / 0,0 | 0,5 / 0,0 | 49,5 / 47,0 | 43,5 / 41,5 |
| Groß / 6 | 2,0 / 4,0 | 1,0 / 1,0 | 0,5 / 1,0 | 52,0 / 47,5 | 42,5 / 40,0 |

Der ausgewogene Gesamtdurchschnitt beträgt **4,875 Stock / 4,125 Kandidat**. Aufs Tor liegt er bei 1,375 / 1,125, Tore bei 1,125 / 0,875. Gegenüber der separat ausgewiesenen historischen Stage6-Referenz unter denselben 157 Produktionshashes steigt der Schnitt nur von 4,0 auf 4,125. Eine relevante Annäherung an 10–16 Abschlüsse ist nicht belegt. Root verwirft die Integration; keine größere Matrix folgt.

Der Offer-Beobachter erfasst insgesamt 75 / 16 Ablauf-Tiefenläufe mit gleicher registrierter Besitzer-ID am Laufende wie bei der Zuweisung. Er beweist keine durchgehende Besitzerkontinuität für jeden Zwischenframe. Die mittlere Wunsch-Restdistanz beträgt 7,90 / 3,52 m, die registrierte Laufdauer 1,057 / 2,216 Sekunden. Auslaufende Offer-Resets ohne neuen Tiefenläufer sinken von 61 auf neun. Diese Timerverbesserung belegt keine entsprechende Torchancenzunahme. Die Rohdaten erhalten Start-/Endbesitzer, Wunschziel, Anfangs- und Restdistanz sowie echten Abschlussgrund; sie werden nicht als erlaubte Wegstrecke ausgegeben.

Belege: `candidate-offer-commit-screen.json`, `candidate-offer-commit-summary.json`, `candidate-offer-commit-sources.json`; Runner `work/experiment-shot-volume-offer-commit-v119.cjs`. Rohreport SHA-256 `b987afedd4a398a7a43332519be66d36fa858cb180716fa7015c54b92388a7a0`; exakte private Quellbytes SHA-256 `2c8db605c41df4bca6680fc8816692cc9fb1638fd3b3a021167f773b7c864353`. Keine Produktionsänderung; eigene Prozesse sind beendet.

## Diagnostischer Dauerpilot: globale Konstante nur auf isolierten Seiten

Die Dauerfrage wird zunächst unabhängig von sämtlichen Stage6–9-Kandidaten geprüft. Auf einer isolierten Seite ersetzt ausschließlich eine Request-Route in `game.js` die lexikalische Konstante `MATCH_SPEED=.78` durch `.39`. Alle anderen Quellen bleiben Stock. Der Versuch umfasst einen Seed auf Standard5 und Standard6, jeweils Stock, hypothetischen Kandidaten und tatsächliche JSON-Fortsetzung: sechs volle Partien. Jede Partie wird neu mit den vorhandenen 119-Markern erzeugt. Dies ist keine Implementierung einer nur für neue Partien geltenden Dauer und enthält keine Freigabe für alte Spielstände.

| Standardfeld, Seed0 | Simulation Stock / .39 | Abschlüsse | Aufs Tor | Tore | Pässe | Bestätigte Pässe |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 5 Feldspieler | 218,55 / 384,65 s | 6 / 10 | 2 / 5 | 1 / 4 | 57 / 100 | 49 / 87 |
| 6 Feldspieler | 210,35 / 363,60 s | 5 / 7 | 2 / 2 | 2 / 3 | 49 / 91 | 44 / 78 |

Das entspricht 3:38,55 / 6:24,65 bzw. 3:30,35 / 6:03,60 Minuten. Gemessen wird `ticks*.05` bei automatischem Fortsetzen der Taktikpause; es ist keine Browser-/Geräte-Wanduhrmessung und enthält keine manuelle Verweilzeit im Taktikmenü. Der Mittelwert dieser beiden Fixtures steigt von 214,45 auf 374,125 Sekunden und von 5,5 auf 8,5 Abschlüsse. Ein Seed auf zwei Standardkonfigurationen liefert weder eine allgemeine Verteilung noch eine Zielkalibrierung.

Halbzeit wird tatsächlich bei Minute50 erreicht, beide Partien enden bei Minute100. Die tatsächlichen Schussaufrufe entsprechen allen gebuchten Abschlüssen. Beide .39-JSON-Fortsetzungen stimmen vollständig in physischen Daten, Zufallsstrom, Karrierebuchungen und P02 überein. Die zwei Stock-Digests mit zusätzlicher Phasenbeobachtung entsprechen exakt den früheren Stock-Baselines. Sämtliche 157 Produktionshashes bleiben gleich. Die tatsächlichen Halbzeit-/Abpfiffphasen, `elapsed`, virtuelle Minuten, P02-Sequenzen und vollständigen Zufallsendstände bleiben im Rohreport erhalten.

### Nur lesende Prüfung der Uhren und einer möglichen späteren Implementierung

`MATCH_SPEED` ist keine isolierte Produkt-Dauereinstellung. `v65Tick` gibt `realDelta*MATCH_SPEED` an den nativen Schritt. Die gemeinsame Matchzeit und Spielminuten laufen damit langsamer, während `v157Move` mit realem `dt` und `v102Clock` mit realen Kontaktschritten arbeiten. Markierte Angebote, Annahmefristen und Entscheidungen über `v152Seconds=elapsed/MATCH_SPEED` behalten bei einer konsistenten Änderung grundsätzlich ihre reale Dauer. Andere Stellen mischen feste Matchzeitwerte mit physikalischen Sekunden:

| Verantwortliche Stelle | Folge der hypothetischen globalen Änderung / erforderliche spätere Entscheidung |
| --- | --- |
| `game.js:6`, `world-physical-v65.js:427` | Globaler Faktor betrifft auch bestehende Kontexte. Eine spätere neue-Partien-Regel braucht eine ausdrücklich gespeicherte optionale Rate bei Creation und unveränderten alten Fallback; keine Ergänzung beim Restore. |
| `world-attack-flow-v152.js:6`, `world-football-flow-v159.js`, `world-offensive-quality-v157.js` | Sekunden und `next`-Fristen müssen denselben expliziten Matchkontext verwenden. Eine zusätzliche Matchrate darf keine bestehenden Intent-Zeitpunkte neu interpretieren. |
| `pitch-motion-v102.js:74`, `world-pitch-actions-v99.js` | Kontakt-/Posealter laufen real, Flight-/Keeperzeiten werden aus Matchdauer geteilt durch Rate abgeleitet. Gespeicherte Aktionslocks und Contactclock müssen unverändert zu ihren Einheiten passen. |
| `pitch-v55.js:430`, `world-pitch-actions-v99.js:97` | Flugregel `max(raw duration, Strecke/Tempo*Rate)` und rohe Mindestdauer `.14` verlängern bei kleinerer Rate kurze tatsächliche Flugzeiten. Die längere Partie ist deshalb kein reiner Zeitmultiplikator identischer Aktionen. |
| `set-pieces-v50.js:207`, `pitch-v55.js:217`, `world-space-passes-v150.js:76` | Rohe `next+=.75`-Wartezeiten werden real länger. Es muss getrennt entschieden werden, welche bestehenden Fristen Match- und welche Aktionssekunden darstellen. |
| `world-ball-motion-v110.js`, `world-space-passes-v150.js`, `world-backpedal-v108.js` | Rebounds, Luftballfall, Rollwiderstand, verfügbare Abfangzeit und Geschwindigkeitsschätzungen konvertieren mit demselben Faktor. Einzelne Ersatzstellen würden die tatsächlichen Kontaktbedingungen auseinanderziehen. |
| `world-player-load-v158.js:97`, `:132` | P02 verwendet `elapsed*90/75` für echte virtuelle Minuten und Ereigniszeitpunkte, realen Weg/dt für Sprint-/Pressing-Erkennung. Mehr reale Aktionen pro virtueller Minute dürfen echte Ereignislast verändern; es gibt keinen zweiten Belastungsabzug und keine Lockerung der Intervallinvariante. |
| `match-presentation-v74.js`, `game.js:9`, `world-physical-v65.js:175`, `halftime-v14.js`, `finance-v15.js` | Eine alternative längere Periodengrenze bei konstantem Physikfaktor braucht eine gemeinsam definierte Minutenabbildung statt unkoordinierter Änderungen an `75`, `37.5`, `72`, Nachspielzeit und Abpfiffgrenzen. |
| `world-physical-v65.js:86`, `:104` | Der Plain-Snapshot kann ein künftiges neues optionales Feld erhalten. Alte gespeicherte Kontakte, Ziele, `next` und Ergebnisse werden nicht nachberechnet; neuer und alter Fortsetzungspfad müssten separat tatsächlich geprüft werden. |

Es wurde keiner dieser späteren Wege implementiert. Die sechs Diagnosepartien beantworten ausschließlich die Beziehung zwischen längerer Gesamtspielzeit und mehr tatsächlichen Aktionen unter der hypothetischen globalen Konstante. Root entscheidet über Dauerpräferenz, Umfang und einen geeigneten Matchvertrag.

Belege: `candidate-duration-pilot.json`, `candidate-duration-pilot-summary.json`, `candidate-duration-pilot-sources.json`; Runner `work/experiment-shot-volume-duration-v119.cjs`. Rohreport SHA-256 `55e82348202f59c1da987d2d3dd79e2f874706469f0951200fc02c12238e901c`; exakte private Quellbytes SHA-256 `a16a1490dcbdcfa2f78954fe9c3368c3d3ae5247797e5861f5c0efc20e330116`. Keine Produktionsänderung, größere Matrix, Geräteprüfung oder Veröffentlichung. Eigene Prozesse sind geschlossen.
