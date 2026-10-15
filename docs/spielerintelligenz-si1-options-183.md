# Spielerintelligenz 183: SI-1 Optionsmodell des Ballführers

Stand: 15. Oktober 2026. Branch `feat/si-options` (Worktree `work/si-options`) auf `integration/si-r133` (`b28e3ab6`: Fundament SI-F, SI-0 Uhr, B19 Restore, SI-3 Abschluss). Umsetzung des Pakets SI-1 aus dem [Umsetzungsplan](spielerintelligenz-umsetzungsplan-2026-10-14.md) mit den [Vorgaben aus dem Fundament](spielerintelligenz-fundament-183.md#vorgaben-für-si-1-und-si-k). Code: `dist/match-si-options-v183.js`; Test: `work/test-si-options-v183.cjs`. Das Paket ist per `v183EnableByDefault('options')` für neue Partien eingeschaltet.

## Modell

Für `v183Active(m,'options')` ersetzt eine Bewertung die feste Reihenfolge von `v157Decide` (W7). Jede Option wird in derselben Einheit bewertet: der Torwahrscheinlichkeit des Folgezustands.

| Option | Gewinn | Verlust (Risiko) |
| --- | --- | --- |
| Schuss | Torwahrscheinlichkeit aus `v183ShotEstimate` (SI-3, einschließlich Blockchance und Körperdrehung), nur im Fenster `16 + 0,55·Abschluss` m; beim SI-F-Stub abgewertet, wenn das Tor außerhalb von 1,2 rad zur Körperrichtung liegt | — |
| Bodenpass | Ankunft × Empfängerwert (`v183PassEstimate`), Taktikgewicht | (1 − Ankunft) × Gegnerwert am Verlustort |
| Raumpass | Kandidaten aus `v150Candidates` (drei beste), Ankunft aus Zeitvorsprung, `pas` und Länge | wie Pass, am Zielpunkt |
| Hoher Ball | Option aus `v162HighOption` (über eine Mittelfeldsperre) | wie Pass |
| Flanke | Ankunft × Kopfballwert aus `v183CrossEstimate` | wie Pass, im Strafraum |
| Tragen | Behaltwahrscheinlichkeit × Haltewert 1 s voraus (Positionsanteil × `carryFactor`); Richtungen: Tormitte, geradeaus, zwei Diagonalen (±34°), für die Rolle Dribbler zusätzlich das Umspielen aus `v154TryDribble` | (1 − Behalten) × Gegnerwert am Ort |
| Halten | Behalten × Haltewert am Ort (Positionsanteil × `holdFactor`; Abschirmen auf der Stelle) | wie Tragen |

- **Nutzen** = Gewinn × Körperstellungsabschlag − Verlust / Risiko. Positionswert `0,3·e^(−d/16)` (d = Meter zum Tor, flacher Winkel bis zur Hälfte); der Gegnerwert nach Ballverlust zählt mit Gewicht 1,6 (Konter).
- **Haltewert (symmetrisch für Pass und Tragen):** Wert des Ballbesitzes eines Spielers an einem Punkt, sobald er den Ball dort hat = max(Positionswert × (0,6 + 0,4·Raum) × Positionsfaktor, eigener Schuss × Raum). Raum = nächster Feldgegner, der bis dahin (Flugzeit bzw. 1 s Tragen bzw. 0,5 s Halten) mit der Hälfte seines Tempos nachrückt (`close`); 0,25 (gedeckt) bis 1 (frei). Empfänger, Tragezielpunkt und Halten werden damit gleich bewertet; ein Lauf in gedeckten Raum ist nicht mehr wert als ein Pass dorthin. Der spätere Schuss des Empfängers bzw. nach dem Tragen hat keinen weiteren Abschlag (`recvShot`, `carryShot` = 1): Raum, Ankunft und Behalten decken die Unsicherheit ab. Der Positionsfaktor gilt nur für Tragen (0,75) und Halten (0,65). Für die Tragepunkte schätzt SI-1 einen Schuss je Entscheidung (den eigenen oder den am Tragepunkt Richtung Tor) und rechnet ihn mit `e^(−Δd/9 m)` auf die anderen Punkte um (`xgFalloff`); das hält die Rechenzeit mit der echten SI-3-Schätzung unter 0,3 ms.
- **Ankunft** (`v183PassEstimate`) spiegelt die native Ausführung (`v55GroundPass`): erster Abfangkandidat auf der Linie (geglättet über 0,6 m bzw. 0,8 m) mit seiner Abfangchance, Passfehler aus `pas` und Druck gegen die Reichweite des Empfängers, Fehlannahme aus `tec` und Gegnern in 2,5 m. Muss sich der Passgeber erst drehen, rücken die Gegner in dieser Zeit nach (Abfangreichweite und Gegner am Ziel). Sie hängt nur an Fähigkeiten und Geometrie. Flugsekunden = Uhreinheiten aus `v115FlightDuration` / `v183Rate(m)`.
- **Behalten** beim Tragen: Jeder Gegner, der die Laufstrecke in 1 s erreicht (Reaktion nach `pos` wie B03), greift zweimal mit der heutigen Standtackling-Chance an (`engage 2`, die Kontaktprüfung erlaubt bis zu vier Versuche je Sekunde); von hinten halb so oft (B03 bleibt). Der Torwart greift nur im Strafraum an. Das Umspielen der Dribbler-Rolle zählt einen Angriff des einen Gegners.
- **Körperstellung**: Ein Pass außerhalb des bisherigen Warteschlangenwinkels (1,05 rad, `v157QueueTurn`) kostet die Drehzeit bis 0,55 rad und 2,5 m/s. Diese Zeit geht in die Ankunft ein (siehe oben); der Gewinn wird zusätzlich mild mit `e^(−t/1,5 s)` abgezinst und der Verlust in dieser Zeit eingerechnet. Eine laufende Drehung wird bei 0,55 rad und 2,5 m/s ausgelöst (bisher 0,30 rad und 1,2 m/s). Alle 0,25 s prüft der Ballführer während der Drehung den Schuss gegen den wartenden Pass und schießt, wenn der Schuss um 15 % besser ist (**Schuss aus der Drehung**).
- **Persönlichkeit** (`v183Personality`, Rolle und `calm`/`dec`): `shootWeight` gewichtet nur den Schussgewinn, `dribbleWeight` den Tragegewinn, `holdWeight` den Haltegewinn, `riskWeight` nur den Verlustterm. Linienbreite und Ankunft bleiben unberührt. Bis zur ersten 192er-Serie gelten die Gewichte relativ zum neutralen Spieler und auf 0,85–1,15 begrenzt (die Rohwerte aus `v183Personality` bleiben unverändert).
- **Spielstand/Restzeit**: Rückstand erhöht, Führung senkt das Risikogewicht bis ±15 % zum Spielende (quadratisch mit der Spielzeit).
- **Spieleranweisungen und Teamtaktik** (`docs/product.md`: gleiche Wirkung für Mensch und KI):

  | Anweisung / Taktik | Wirkung |
  | --- | --- |
  | Abschluss suchen (Anweisung bzw. Rolle Torjäger/Stoßstürmer) | Schussgewinn × `shootInstruction` (1,25), auch beim Schuss aus der Drehung; im Altpfad Schusschance × 1,5 |
  | Außenbahn & Flanken | Flankengewinn × `wingInstruction` (1,25); Laufweg außen (Rollenziel) unverändert |
  | Tiefenlauf | Läuferauswahl in den Angeboten (`v159Offers`, SI-2) → Angebotszuschlag auf den Empfängerwert; Tiefenlauf-Bonus der Raumpass-Kandidaten (`v150Candidates`) und Passvorhalt der Ausführung unverändert |
  | Anspielbar bleiben | Unterstützungsangebot (`v159Offers`) und Ausschluss als Raumpass-Läufer unverändert |
  | Angriffsfokus Außen/Mitte | Pass-, Raumpass- und Flankenziele ±10 % (`focus`) |
  | Passspiel Direkt | Vorwärtspässe bis +25 % bei 15 m Raumgewinn (`direct`) |
  | Pressing, Aggressivität, Abwehrlinie | Verteidigung, außerhalb des Optionsmodells unverändert wirksam |

- **Angebote**: Mitspieler mit gültigem Tiefen- oder Nachrücklauf aus `v183Offers` (SI-2, bis dahin Stub) erhalten einen Zuschlag `offer` auf den Empfängerwert; ein bestätigter Doppelpass-Rückweg +0,03.
- **Bewertungsrauschen nach `dec`**: Wahl per Softmax über die Optionen im Rauschband, Temperatur `0,15·(20−dec)/10` des besten Nutzens (mindestens 0,006). `dec` 20 wählt ohne Rauschen; fehlendes `dec` gilt als 10. Über die SI-F-Persönlichkeitsformel hinaus wirkt `dec` nur hier.
- **Bindung**: Die zuletzt gewählte Option desselben Spielers erhält +8 % des besten Nutzens, solange ihre Absicht gilt (kein Wechsel zwischen fast gleichwertigen Zielen). Nach einem Tragen gilt der Zuschlag nur gegenüber den anderen Trage-Richtungen (Richtung bleibt stabil, Tragen klebt nicht gegenüber Pässen); Halten erhält keinen.
- **Takt**: Nach Tragen/Halten entscheidet der Ballführer nach 0,25 s Echtzeit (`v183ClockUnits`), während einer Drehung alle 0,08 s. Die Annahmevorbereitung (`v159ReceivePlan`) und das freie Tor (`v131OpenGoal`, sofortiger Schuss) bleiben vorgeschaltet.

### SI-F-Stub-Brücke

Der Stub von `v183ShotEstimate` (erkennbar an `stub:true`, seit `ef78fca6`) liefert die Schussqualität von `v157ShotQuality` mit hartem 22-m-Fenster. Er gilt nur noch, wenn das Paket `finish` ausgeschaltet ist. SI-1 liest ihn deshalb an dem Punkt derselben Schusslinie, dessen Torentfernung `Entfernung × 22 / Fenster` beträgt, und skaliert mit `stubScale` 0,6 auf die SI-3-Skala. Der Wert ist das geometrische Mittel des Verhältnisses SI-3/Stub für freie Schützen mit Abschluss 8–12 zwischen 14 und 22 m (`work/tmp-si1/xgscale.cjs`, Faktor ≈ 1,5 auf die bisherigen 0,4). Die steilere Fähigkeitsabhängigkeit der SI-3-Schätzung (Abschluss 16: das Doppelte des Stubs) bildet der Stub nicht ab. Ein Verteidiger zwischen Schütze und diesem Punkt halbiert den Wert, zwei heben ihn auf (der Stub sieht nur die Linie dahinter). Kopfballwerte aus dem Flankenstub (`v183CrossEstimate` bis SI-7) zählen `headerXg × stubScale × crossConv` = 0,6 × 0,67 ≈ 0,4, wie in den Messungen. Eine echte Schätzung (ohne `stub:true`, auch mit `speed` 0 oder `null`) wird unverändert verwendet; das Fähigkeitsfenster bleibt als Grenze.

### Eingestellt gegen die SI-3-Skala

SI-3 liefert `v183ShotEstimate.xg` als Torwahrscheinlichkeit einschließlich Blockchance; die Stub-Brücke (`stubRange`, Fensterumrechnung), der Blockabschlag `laneOne` und die Körperrichtung `shotFree`/`shotTurn` wirken damit nur noch ohne `finish`. Die echte Skala ist steil: ein freier Schütze mit Abschluss 16 erreicht aus 10 m 0,80, aus 22 m 0,28 und aus 26 m 0,16. Mit den bisherigen Schwellen schoss SI-1 deshalb aus der Distanz, statt näher heranzugehen (60 % Fernschüsse, 15 % Tore je Schuss; Serie S1 unten). Geändert:

| Parameter | vorher | jetzt | Grund |
| --- | ---: | ---: | --- |
| `carryShot` | 0,55 | 1 | Der Schuss nach dem Tragen hatte zusätzlich zu Raum und Behalten einen Abschlag; mit der steilen Skala war Heranlaufen selten besser als der Fernschuss. |
| `recvShot` | 0,85 | 1 | dasselbe für den Empfänger (Querpass vor dem Tor) |
| `windowFin` | 0,7 | 0,55 | Fenster 16 + 0,55·Abschluss: Abschluss 10 bis 21,5 m, 14 bis 23,7 m, 18 bis 25,9 m |
| `carryFactor`, `holdFactor` | 0,55 / 0,5 | 0,75 / 0,65 | Positionsanteil von Tragen und Halten; Serie S2 gegen S1: Tore je Schuss 17,4 statt 15,0 %, Favoriten 70 statt 62 % |
| `stubScale` | 0,4 | 0,6 | Stub-Brücke auf die SI-3-Skala (oben) |
| `crossConv` | 1 | 0,67 | hält den Kopfballwert des Flankenstubs bei 0,4 |
| `counter`, `threat`, `threatLength` | 1,6 / 0,3 / 16 | unverändert | `counter` 1,2 (VM) brachte weniger Schüsse ohne mehr Pässe; `threat` 0,35/20 m (Serie T2) senkte Tore und Favoritenquote |

Offen für SI-7 und SI-K: `crossConv` gegen eine echte `headerXg`; die Persönlichkeitsspanne `weightMin`/`weightMax`, `shootInstruction` und `switchMargin` wurden nicht verändert.

## `v183PassEstimate(m,p,q,target)`

Ohne aktives Paket der unveränderte SI-F-Stub. Mit Paket: `{seconds, arrival, value, receiver, loss, intercept, lane, returnRun, target, gain}`; `seconds` = Flugzeit in Echtsekunden (Uhreinheiten / `v183Rate(m)`).

- `arrival` (0–1): Wahrscheinlichkeit, dass der Bodenpass auf `target` (Standard: Laufvorhalt `v157PassLead`) ankommt und kontrolliert wird; siehe Modell.
- `receiver`: Wert des Ballbesitzes von `q` am Ziel (Positionswert oder sein Schuss dort, je nach Raum um ihn; +`oneTwo` bei bestätigtem Rückweg).
- `loss`: Gegnerwert × 1,6 an der Mitte der Passlinie.
- `value = arrival·receiver − (1−arrival)·loss` – objektiv, ohne Persönlichkeit und ohne Angebotszuschlag. SI-2 und SI-7 erhalten damit eine vergleichbare Passbewertung; das Risikogewicht des Passgebers wendet nur SI-1 an.
- `lane` ist der bisherige Test `v157Lane` (nur für Aufrufer von außen; die Bewertung braucht ihn nicht), `intercept` die Abfangwahrscheinlichkeit, `gain` der Raumgewinn in Metern.
- Druck auf den Passgeber wie in `v55GroundPass`: Gegner im Radius `defence.passPressureRadius` (Meter, SI-4) bei aktivem Paket `defence`, sonst normalisiert 0,15 (W4). In der Bewertung einmal je Entscheidung vorberechnet.

## Umhüllungen und toter Entscheidungsbaum

- `v157Decide`: markiert und aktiv → Annahmevorbereitung (`v159Decide`), laufende Drehung (`v157ContinueTurn`), freies Tor, dann die Bewertung; gibt für jeden Feldspieler `true` zurück. Sonst die bisherige Funktion.
- `v159Decide`: markiert und aktiv → nur das Warten auf die Annahme (über die Vorgängerfunktion); das Stürmer-Tragen (W7) ist eine Option der Bewertung.
- `v157ContinueTurn`: markiert und aktiv (ohne Standardsituationen) → Freigabe bei `turnRelease`/`turnSpeed`, Schuss aus der Drehung; Prüfung von Empfänger, Abseits und Linie wie bisher.
- `v183PassEstimate`: siehe oben.
- Der zweite Entscheidungsbaum in `pitch-v55.js` (`action` nach `v157Decide`, W1) und die toten Pfade W3 werden für neue Partien wie bisher nie erreicht, weil `v157Decide` für jeden Feldspieler entscheidet. Ihr Code bleibt unverändert für Partien vor 157. Angriffsfokus und Direktspiel wirken als Gewichte (oben).
- Gelesen, nicht geändert: `v150Candidates`/`v150SpacePass`, `v162HighOption`/`v162TryHighPass`, `v157PassLead`, `v157Lane`, `v157QueueTurn`, `v55HasClearRun`.
- Für eine Bewertung werden `ability`, `v150Pace` und `v150Delay` je Person und Schlüssel einmal gelesen (Zwischenspeicher nur während der Bewertung, vor jeder Ausführung zurückgesetzt).

## Zustand, Restore und Zufall

- `attackFlow.decision = {playerId, kind, ref, target, at, until, checkAt, value}` (Plain-Daten, Zeiten in `v183Seconds`): Bindung und nächste Schussprüfung während einer Drehung. Gespeichert und wiederhergestellt mit der Partie; Restore ergänzt nichts.
- Tragen/Halten nutzen das bestehende `attackFlow.carry` (Fristen auf `v152Seconds`, Umrechnung ohne Annahme über diese Uhr), Drehungen das bestehende `pendingTurn`.
- Keine WeakMap, kein Modulzustand; das Protokoll (`v183Trace`, Typ `options`: Option, Bezug, Nutzen, Ankunft, Entfernung, Anzahl, Ziehung, drei beste) ist flüchtig.
- Rückfall: Ist ein gewählter hoher Ball bei der Ausführung nicht mehr verfügbar (`v162TryHighPass` lehnt ab), hält der Spieler; das Protokoll trägt `fallback:'high', executed:'hold'`, die Entscheidung wird als Halten gespeichert.
- Zufall: genau eine benannte Ziehung `options.choice`, nur wenn mindestens zwei Optionen im Rauschband liegen. Ausgeführte Aktionen behalten ihre eigenen Ziehungen. Unmarkierte und 182-Partien erhalten keine zusätzliche Ziehung.

## Parameter (`options.*`, gespeichert in neuen Partien)

| Schlüssel | Wert | Bedeutung |
| --- | ---: | --- |
| `cadence` | 0,25 | Entscheidungstakt (s Echtzeit) nach Tragen/Halten |
| `weightMin`, `weightMax` | 0,85 / 1,15 | wirksame Persönlichkeitsspanne |
| `windowBase`, `windowFin` | 16 / 0,55 | Schussfenster in Metern |
| `stubRange`, `stubScale` | 22 / 0,6 | Stub-Brücke (nur ohne `finish`) |
| `threat`, `threatLength` | 0,3 / 16 | Positionswert |
| `counter` | 1,6 | Gewicht des Gegnerwerts nach Ballverlust |
| `recvShot`, `offer`, `oneTwo` | 1 / 0,3 / 0,03 | Empfängerwert |
| `passMin`, `passMax` | 2,5 / 32 | Passlängen (m) |
| `turnRelease`, `turnSpeed`, `turnTick`, `turnCheck`, `turnTau` | 0,55 / 2,5 / 0,08 / 0,25 / 1,5 | Drehung |
| `shotFree`, `shotTurn`, `switchMargin` | 1,2 / 0,5 / 0,15 | Körperrichtung (Stub), Schuss aus der Drehung |
| `carryHorizon`, `carryMin`, `carryMax`, `carryShot`, `engage`, `carryFactor` | 1 / 2,5 / 6 / 1 / 2 / 0,75 | Tragen |
| `holdFactor`, `close`, `xgFalloff` | 0,65 / 0,5 / 9 | Halten, nachrückende Gegner, Schusswert der Tragepunkte (m) |
| `crossConv`, `crossMax`, `crossWide`, `laneOne` | 0,67 / 30 / 8 / 0,5 | Flanke, Stub-Block |
| `spaceCount`, `spaceBase` | 3 / 0,15 | Raumpässe (Ankunftsbasis gegen die gemessene Annahmequote) |
| `noise`, `noiseFloor`, `commit` | 0,15 / 0,006 / 0,08 | Rauschen, Bindung |
| `scoreRisk`, `focus`, `direct` | 0,15 / 0,1 / 0,25 | Spielstand, Taktik |
| `shootInstruction`, `wingInstruction` | 1,25 / 1,25 | Spieleranweisungen |

## Messung

Native Browser-Engine (`work/measure-si183.cjs`, Edge, Lane C), gepaart nach Verein und Feldgröße (Seeds `p01r132`, ±95 %), Uhr 0,42. Basis ist jeweils derselbe Baum ohne das Paket `options`. `dist` wurde vor und nach jedem Lauf gehasht und blieb unverändert.

**Definitionen.**

- **Tore je Schuss:** Schüsse mit Ergebnis Tor geteilt durch alle Schüsse aus `rec.shots` (Spielzug, Kopf- und Volleyschüsse, Elfmeter, direkte Freistöße). „Spielzug“ lässt Elfmeter und direkte Freistöße weg.
- **Fernschuss:** Spielzugschuss aus mehr als 22 m.
- **Favorit:** Mannschaft mit dem höheren Mittelwert von `teams[].ovr` bei mindestens 1 Punkt Abstand; gezählt werden Siege.
- **Zone:** 18–32 m Torentfernung des Ballführers.
- **Pässe/Tragen in der Zone (Ledger):** Aufrufe von `v157Decide` aus `rec.decisions`. Pässe sind sofort gespielte Pässe und Pässe mit vorheriger Drehung (`pass-*`); Tragen sind `tragen`, `halten` und `durchbruch`. Der Ledger zählt jede Entscheidung, und SI-1 entscheidet beim Tragen alle 0,25 s neu.
- **Tragestrecken (SI-1-Protokoll):** Aufeinanderfolgende Trageentscheidungen desselben Spielers zählen als eine Aktion. Erhoben mit einer Harness-Kopie, die das Protokoll zusammenfasst (`work/tmp-si1/measure-si1x.cjs`, `--traceLimit=20000`).

### Endstand auf SI-3 (`b28e3ab6`), 192 Partien

Basis `si1s-base192` (`--packages=clock,finish`), SI-1 `si1s-final192` (`--packages=clock,finish,options`, Vorgaben dieses Stands).

| Kriterium | Ziel | Basis | SI-1 | Ergebnis |
| --- | --- | ---: | ---: | --- |
| Favoriten ≥1 Punkt (N 134) | ≥60 % (Gate) | 61,9 % | 75,4 % | erfüllt |
| Tore je Schuss | ≥18 % | 22,8 % | 21,6 % (Standard 21,7, groß 21,4) | erfüllt |
| Fernschüsse Abschluss ≥14: Tore je Schuss (n) | 15–25 % | – (0) | 18,5 % (238) | erfüllt |
| Schüsse | ≥ +2 | 6,39 | 12,60 (+6,21 ±0,49) | erfüllt |
| Flanken | ≥ Basis | 0,83 | 1,30 (+0,46 ±0,22) | erfüllt |
| Pässe gegen Tragen in der Zone | Pässe deutlich darüber | Ledger 59,7 / 47,8 | Protokoll 49,2 Pässe / 12,7 Tragestrecken; Ledger 59,5 / 55,6 | als Aktionen erfüllt, je Entscheidung gleichauf |
| Fernschussanteil (Spielzug) | 12–20 % (Plan) | 0,1 % | 24,8 % (2,91 je Partie, 13,2 % Tore) | darüber |
| Raumpässe | ≤7 | 7,98 | 1,07 | erfüllt |
| Drehzustände 18–22 m („Drehung läuft“) | −50 % | 19,5 | 2,44 (−17,1 ±2,0, −87 %) | erfüllt |
| Rechenzeit je Bewertung (Node) | ≤0,3 ms | – | Median 0,078 ms, p90 0,123 ms | erfüllt |

Weitere Kennzahlen (Basis → SI-1):

- Tore 1,67 → 2,74 (+1,07 ±0,28), aufs Tor 2,94 → 6,03, Minuten 4,29 → 4,25, 0:0 24,5 → 8,3 %.
- Spielzugschüsse je Partie (Tore je Schuss): bis 14 m 1,64 (42,9 %) → 2,06 (48,0 %), 14–22 m 3,18 (19,3 %) → 6,77 (18,7 %), über 22 m 0,01 → 2,91 (13,2 %).
- Pässe 100,5 → 103,9 (+3,4 ±1,4), abgefangen 7,8 → 5,3, Ballverluste durch Fehlpass 21,2 → 14,1, hohe Bälle 5,6 → 0,2.
- Fouls 7,5 → 4,1, Ecken 0,66 → 1,30, direkte Freistöße 1,49 → 0,84.
- Favoriten ≥2 Punkte (N 90) 67,8 → 83,3 %, Tordifferenz je Stärkepunkt 0,41 → 0,73.
- Standardfeld: Schüsse 6,97 → 14,49, Tore 1,95 → 3,18, Favoriten 63,1 → 76,9 %. Großes Feld: Schüsse 5,81 → 10,71, Tore 1,40 → 2,30, Favoriten 60,9 → 73,9 %.
- Protokoll: mittlere Ankunft gewählter Bodenpässe 0,86, geschätzte Ankunft gewählter Raumpässe 0,28 (angenommen 0,42 von 1,07 je Partie); kein Rückfall eines hohen Balls.

**Fernschussanteil.** SI-3 bewertet freie Fernschüsse guter Schützen hoch; das folgt der SI-3-Nutzerentscheidung „gut platzierte Fernschüsse dürfen oft treffen“. Ein Schütze mit Abschluss 16 erreicht aus 22 m frei 0,28. Gemessen treffen Fernschüsse mit Abschluss ≥14 zu 18,5 %. Der Positionswert dort beträgt 0,3·e^(−22/16) ≈ 0,08, deshalb ist der Schuss nach der Schätzung oft die beste Option. Das engere Fenster und `carryShot`/`recvShot` 1 senkten den Anteil von 60 auf 25 %. Weiter senken ließe er sich nur mit einem Fernschussabschlag gegen die eigene Schätzung oder mit einer steileren SI-3-Kurve; das entscheidet SI-K.

**Pässe gegen Tragen.** Im Review-Stand (erste Fassung) standen in der Zone 15 Pass- gegen 55 Trageentscheidungen. Jetzt sind es 59,5 Pass- gegen 55,6 Trageentscheidungen; die Pässe liegen damit auf Basisniveau (59,7). Je Aktion gezählt spielt der Ballführer in der Zone 49 Pässe gegen 13 Tragestrecken. Eine Tragestrecke umfasst im Mittel vier Entscheidungen, weil SI-1 beim Tragen alle 0,25 s neu bewertet.

**Risiko nach Fähigkeit und Rolle** (Protokoll aus 12 konstruierten VM-Partien mit Rollenzyklus, `work/tmp-si1/rolerisk.cjs`; die v61-Spieler haben keine mentalen Werte): Gewählte Pässe mit Ankunft unter 0,8 kommen bei Passspiel ≥14 zu 40 % vor, bei 10–13 zu 30 % (mittlere Ankunft 0,84 gegen 0,88). Gute Passgeber spielen also mehr riskante Pässe, weil diese für sie einen positiven Erwartungswert haben. Nach Rollen streut der Anteil zwischen 20 % (Zielspieler) und 50 % (Flügelspieler), Spielmacher 47 %. Er folgt mehr Position und Passwegen der Rolle als dem Risikogewicht, dessen Spanne eng ist (0,85–1,15). Die Testszene zeigt den Rolleneffekt isoliert: gleicher Pass, höherer Nutzen beim Spielmacher. Nach dieser Serie darf SI-K die Spanne (`weightMin`/`weightMax`) weiten.

### Varianten auf SI-3 (96 Partien, gepaart gegen `si1s-base192`)

| Serie | Änderung gegenüber S1 | Schüsse | Tore/Schuss | Fernanteil (Tore Abschluss ≥14) | Pässe/Tragen Zone (Ledger) | Flanken | Favoriten (N 61) | 0:0 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| S1 | Vorgaben nach dem SI-0-Merge | 13,16 | 15,0 % | 59,7 % (16,9 %) | 63,3 / 22,9 | 1,42 | 62,3 % | 18,8 % |
| S2 | Tragen 0,75, Halten 0,65 | 13,90 | 17,4 % | 59,2 % (19,2 %) | 55,7 / 34,5 | 1,20 | 70,5 % | 13,5 % |
| T1 | S2 + Fenster 0,55 | 12,32 | 18,3 % | 41,0 % (24,0 %) | 61,9 / 43,2 | 1,40 | 73,8 % | 18,8 % |
| T2 | T1 + Positionswert 0,35/20 m | 11,20 | 17,4 % | 39,2 % (19,7 %) | 67,5 / 41,8 | 1,22 | 63,9 % | 15,6 % |
| U1 | T1 + `carryShot`/`recvShot` 1 | 13,26 | 23,4 % | 30,2 % (17,4 %) | 54,8 / 54,3 | 1,50 | 77,0 % | 7,3 % |
| U2 | T1 + `carryShot` 1,1 | 12,85 | 21,6 % | 27,6 % (24,0 %) | 54,3 / 58,4 | 1,31 | 77,0 % | 14,6 % |

Der Endstand ist U1 mit `stubScale` 0,6 und `crossConv` 0,67 (gleicher Kopfballwert). U2 senkt den Fernanteil kaum weiter, und ein Faktor über 1 hätte keine Bedeutung als Abschlag. Die 96 Partien der Varianten (48 Vereine × 2 Feldgrößen) sind in der 192er-Serie enthalten. Dort liegt der Fernanteil wie in U1 bei 30,2 %, in den übrigen 96 Partien bei 18,7 %; die 96er-Varianten überschätzen ihn also.

### Verlauf über die Integrationsstände (alt → neu)

| Stand | Serie | Schüsse | Tore/Schuss | Fernanteil | Pässe/Tragen Zone (Ledger) | Flanken | Favoriten | 0:0 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| SI-F `5ec465e6`, Stub | Basis | 3,09 | 23,4 % | 0 % | 31,8 / 11,8 | 0,21 | 42,5 % | 47,9 % |
| | erste Fassung (`si1-final-b192`) | 7,13 | 19,9 % | 15,4 % | 15,1 / 55,1 | 0,13 | 65,7 % | 22,4 % |
| | Nacharbeit vor dem Merge (`si1-rework-192`) | 5,25 | 17,6 % | 28,8 % | 33,3 / 16,3 | 0,16 | 45,5 % | 41,7 % |
| SI-0 `7c6c9e82`, Stub | Basis | 6,50 | 22,0 % | 1,0 % | 52,9 / 42,2 | 0,33 | 55,2 % | 19,8 % |
| | erste Fassung (96) | 11,51 | 20,2 % | 25,2 % | 26,0 / 83,1 | 0,15 | 60,7 % | 14,6 % |
| | Nacharbeit (96) | 9,44 | 19,3 % | 40,4 % | 69,2 / 26,5 | 0,15 | 68,9 % | 18,8 % |
| SI-3 `b28e3ab6` | Basis | 6,39 | 22,8 % | 0,1 % | 59,7 / 47,8 | 0,83 | 61,9 % | 24,5 % |
| | Endstand (`si1s-final192`) | 12,60 | 21,6 % | 24,8 % | 59,5 / 55,6 | 1,30 | 75,4 % | 8,3 % |

Die 192er-Serien zählen 134 Favoritenpartien, die 96er 61. Auf dem SI-F-Stand verfehlte die Nacharbeit die Favoritenquote (45,5 %). Mit der Uhr von SI-0 erreichte das symmetrische Modell die Gate-Werte; mit SI-3 hängt die Wahl an der echten Torwahrscheinlichkeit. Die Planannahme „+0,8 bis +1,5 Schüsse“ ging von der Prototyp-Basis aus und wurde gegen keine dieser Basen erreicht. In der ersten Fassung senkte keine geprüfte Stellschraube (Altpfad-Takt, `stubScale` 0,3, `engage`) die Menge in die Nähe des Bands, ohne Torquote, Fernschussanteil oder Favoriten zu verschlechtern.

## Rechenzeit

Gemessen wird die reine Bewertung (alle Optionen ohne Ausführung) auf 600 echten Spielständen (Schnellmodus 200) aus vier konstruierten Partien beider Feldgrößen mit Uhr 0,42 und den Paketen `clock`, `options` und `finish` (Vorgabe; `D6_SI1_FINISH=0` misst ohne SI-3). Je Zustand zählt der schnellste von fünf Blöcken mit je vier Bewertungen, in Nodes normalem globalem Kontext (Kindprozess ohne Sandbox; in der VM-Sandbox des Harness ist jeder globale Zugriff etwa achtmal langsamer, auch im Altpfad). Der Test prüft Median und p90 gegen 0,3 ms und berichtet das Mittel.

Ergebnis ohne Last: Median 0,078 ms, p90 0,123 ms, Mittel 0,085 ms. Im Schnellmodus parallel zur 192er-Browserserie (200 Zustände) waren es Median 0,08–0,09 ms und p90 0,13–0,14 ms.

Teuer ist die SI-3-Schätzung, etwa 0,07 ms je Aufruf. SI-1 ruft sie je Bewertung für den Ballführer, je Empfänger und Flankenziel sowie einmal als Anker für alle Tragepunkte auf. Ohne den Anker lag p90 bei 0,33 ms. `ability`, `v150Pace` und `v150Delay` werden je Person und Schlüssel nur einmal gelesen (Zwischenspeicher nur während einer Bewertung).

## Tests

Alle Läufe auf dem gemergten Stand (`3593b5e5` + diese Nacharbeit), Node 24.

- `node work/test-si-options-v183.cjs` (23 Checks, `--quick` für die Entwicklung), alle bestanden:
  - Altpfad: Mit ausgeschalteten Optionen sind Konstruktorpartien digestgleich zu Regeln 182, mit allen Paketen aus wie mit nur `options:false`. Stub und durchgereichte Umhüllungen sind bitgleich.
  - Schuss: Fernschuss guter und schwacher Schützen (Fenster), Schusswert mit SI-3 und mit Stub-Brücke, Blocker.
  - Stub-Erkennung nur über `stub:true`; eine echte Schätzung mit `speed` 0 oder `null` wird nicht umgerechnet.
  - Flugsekunden über `v183Rate(m)`: Uhrpaket an (`clockRate` 0,42) und aus (`MATCH_SPEED`), auch für einen echten Pass.
  - Pass und Risiko: Passschätzung (Linie, `pas`, Rolle ohne Einfluss), gleiche Fähigkeit mit anderer Rolle oder anderem `dec`, Spanne, Querpass.
  - Abpraller und freies Tor; Drehung (Freigabe bei 0,55 rad, früher als die Altfreigabe bei 0,30 rad); Schuss aus der Drehung.
  - Bindung, Rauschen und Ziehungen, Teamtaktik, Spieleranweisungen „Abschluss suchen“ und „Außenbahn & Flanken“, Umspielen der Dribbler-Rolle.
  - Symmetrie: Tragepunkt und Passziel werden gleich bewertet (gleicher Raumabschlag, nachrückende Gegner).
  - Rückfall des hohen Balls auf Halten mit Protokollvermerk; Protokoll und Entscheidung als Plain-Daten.
  - Volle Partien beider Feldgrößen (Uhr 0,42 und Vorgabe), Restore, Rechenzeit.
- `test-si-core-v183` 28/28, `test-si-clock-v183` 22/22, `test-si-finish-v183` 20/20.
- `check-old-matches-v182.cjs` (Basis `work/tmp-base182`): 158/158 bytegleich. `check-old-matches-v183.cjs` (Basis `e4e531c0`): 340/340 (unmarkiert 158, 182-markiert 158, Konstruktor ohne Marker 12, Marker 183 mit allen Paketen aus 12).
- `check-restore-completeness-v183.cjs --port=4262 --quick` (Lane C mit Sperre): 10/10 Läufe bestanden, keine Abweichung in `attackFlow`.
- Plan 9 Pflichtliste: alle 29 mit Exit 0, danach die erzeugten Artefakte in `outputs/` zurückgesetzt: `test-v55/56/57`, `test-breakaway`, `test-duel-streaks`, `run-native130-tests`, `test-world-match-v64`, `test-world-penalties-v65`, `test-world-goal-scene-v83`, `test-world-physical-instructions`, `test-compact-balance-v178`, `test-player-load-candidate-v158`, `test-native-career-v160`, `test-native-performance-context`, `platform/qa/test-unity-integration-v160`, `platform/qa/test-world-unity-contract`, `test-world-pitch3d-v98`, `test-3d-contacts-v119`, `test-whistle-offside-v119`, `test-keeper-picture-v119`, `platform/qa/test-world-unity-slides`, `test-corner-quality-v182`, `test-defensive-pursuit-v182`, `test-freekick-plan-r132`, `test-keeper-hold-v182`, `test-loose-ball-v182`, `test-penalty-quality-v182`, `test-review-fixes-v182`, `build`.

## Restore

Der eigene Test speichert `attackFlow.decision` und ein laufendes `pendingTurn` per JSON-Checkpoint (`v65Snapshot`/`v65Restore`), einmal während eines Tragens und einmal während einer Drehung. Danach sind Entscheidung, Drehung, `carry`, Ballführer, `next`, Uhr und `match.si` tief gleich, und das Paket ist aktiv. Die Drehung wird nach dem Restore aufgelöst, und die Partie läuft 1.500 Ticks fehlerfrei weiter. Das B19-Werkzeug (`check-restore-completeness-v183.cjs`, gemergt mit `011be373`) vergleicht den ganzen Spielzustand nach einem Restore in zehn Situationen (Spielzug, Absichten, Raumpass, Freistoß, Ecke, Halbzeit- und Torpause, Wechsel, Elfmeter, Paketzustand) und besteht. SI-1 braucht dort keine Einordnung, weil es weder WeakMap noch Modulzustand nutzt.

## Weichenbedarf und Hinweise für die Integration

- **SI-3 (gemergt):** SI-1 nutzt `v183ShotEstimate` unverändert; die Stub-Erkennung hängt an `stub:true`. Eine Schätzung kostet mit Paket etwa 0,07 ms. Je Bewertung ruft SI-1 sie für den Ballführer, je Empfänger und Flankenziel sowie einmal als Anker für die Tragepunkte auf. Für SI-K wäre ein günstigerer Bewertungsmodus der Schätzung hilfreich (Weichenwunsch an SI-3, nicht geändert). Die gemessene Fernschussquote gehört zur SI-3-Kalibrierung; SI-1 entscheidet nach der geschätzten Torwahrscheinlichkeit.
- **SI-4:** Die Ankunftsschätzung zählt den Druck auf den Passgeber wie `v55GroundPass` im Radius `defence.passPressureRadius` (`v183Radius`, Meter), solange das Paket `defence` aktiv ist, sonst normalisiert 0,15 (W4). SI-4 muss diesen Schlüssel anmelden. Der Radius in `action` (`pitch-v55.js`, Plan `:494`) wird in markierten Partien nur vom toten Baum gelesen; SI-1 braucht dort keine Weiche.
- **SI-7:** `headerXg` aus `v183CrossEstimate` wird auf derselben Skala wie die Schussschätzung erwartet (Torwahrscheinlichkeit); bis dahin skaliert `crossConv` den Stub. Die Flankenmenge hängt mehr an der Strafraumbesetzung (SI-2-Läufe) als an der Bewertung.
- **SI-2:** SI-1 liest aus `v183Offers` Einträge `{pid, type, team, until}` mit Typ `depth` oder `follow`. `v183PassEstimate` ist objektiv (ohne Persönlichkeit und Angebotszuschlag) und kostet je Aufruf eine Schussschätzung des Empfängers.
- **SI-0 (gemergt):** Eigene Fristen nutzen `v183Seconds`/`v183ClockUnits`, Flugsekunden `v183Rate(m)`. Fristen für Altcode (`carry`) werden über `v152Seconds` umgerechnet (linear in der verstrichenen Uhr, siehe `v183OptLegacyAfter`). Das Warten auf die Annahme läuft über die Vorgängerfunktion von `v159Decide`.
- Halten bedeutet Abschirmen auf der Stelle. Es wird selten gewählt, kann einen Spieler im Mittelfeld ohne Anspielstation aber kurz stehen lassen, bis SI-2-Angebote wirken.

## Reproduktion

```powershell
$node='C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
git archive b28e3ab6 dist | tar -x -C work/tmp-si1/base-si3     # SI-3-Basisbaum ohne SI-1
& $node work/measure-si183.cjs --dist=work/tmp-si1/base-si3 --packages=clock,finish --clockRate=0.42 --clubs=96 --workers=6 --port=4262 --label=si1s-base192
& $node work/tmp-si1/measure-si1x.cjs --packages=clock,finish,options --clockRate=0.42 --clubs=96 --workers=6 --port=4262 --label=si1s-final192 --traceLimit=20000
& $node work/measure-si183.cjs --packages=clock,finish,options --clockRate=0.42 --clubs=48 --workers=6 --port=4262 --label=si1s-u1-96 --params='{"options":{"carryFactor":0.75,"holdFactor":0.65,"windowFin":0.55,"carryShot":1,"recvShot":1}}'
& $node work/table-si-finish-v183.cjs si1s-base192 si1s-final192-trace20000
& $node work/test-si-options-v183.cjs
```

`work/tmp-si1/` ist gitignoriert; die Hilfswerkzeuge dort sind nicht eingecheckt, weil der Auftrag nur Modul, Test und Doku umfasst. `measure-si1x.cjs` ist die Kopie von `work/measure-si183.cjs` mit der Zusammenfassung des SI-1-Protokolls (`work/tmp-si1/make-si1x.cjs` baut sie neu). Die 96 gemeinsamen Partien von U1 (`measure-si183.cjs`) und der Endserie (Kopie, Protokollgrenze 20.000) sind bis auf eine zustandsgleich (`stateDigestSha`, alle Ergebnisse gleich). Die eine Abweichung kommt vom Kopfballwert 0,6 × 0,67 = 0,402 statt 0,4; Kopie und Protokoll ändern die Partien also nicht. Varianten S1–U2 laufen mit `--clubs=48` und den Overrides aus der Variantentabelle. Fernschüsse, Drehzustände, Zonen und Favoriten stammen aus den gespeicherten Partiedaten, abgegrenzt wie oben unter Definitionen.

Rohdaten liegen in `outputs/si183/` (gitignoriert).
