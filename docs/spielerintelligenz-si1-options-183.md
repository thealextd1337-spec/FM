# Spielerintelligenz 183: SI-1 Optionsmodell des Ballführers

Stand: 15. Oktober 2026. Branch `feat/si-options` (Worktree `work/si-options`) auf `integration/si-r133` (`5ec465e6`, Fundament SI-F). Umsetzung des Pakets SI-1 aus dem [Umsetzungsplan](spielerintelligenz-umsetzungsplan-2026-10-14.md) mit den [Vorgaben aus dem Fundament](spielerintelligenz-fundament-183.md#vorgaben-für-si-1-und-si-k). Code: `dist/match-si-options-v183.js`; Test: `work/test-si-options-v183.cjs`. Das Paket ist per `v183EnableByDefault('options')` für neue Partien eingeschaltet.

## Modell

Für `v183Active(m,'options')` ersetzt eine Bewertung die feste Reihenfolge von `v157Decide` (W7). Jede Option wird in derselben Einheit bewertet: der Torwahrscheinlichkeit des Folgezustands.

| Option | Gewinn | Verlust (Risiko) |
| --- | --- | --- |
| Schuss | xG aus `v183ShotEstimate`, nur im Fenster `16 + 0,7·Abschluss` m; abgewertet, wenn das Tor außerhalb von 1,2 rad zur Körperrichtung liegt | — |
| Bodenpass | Ankunft × Empfängerwert (`v183PassEstimate`), Taktikgewicht | (1 − Ankunft) × Gegnerwert am Verlustort |
| Raumpass | Kandidaten aus `v150Candidates` (drei beste), Ankunft aus Zeitvorsprung, `pas` und Länge | wie Pass, am Zielpunkt |
| Hoher Ball | Option aus `v162HighOption` (über eine Mittelfeldsperre) | wie Pass |
| Flanke | Ankunft × Kopfballwert aus `v183CrossEstimate` | wie Pass, im Strafraum |
| Tragen | Behaltwahrscheinlichkeit × Haltewert 1 s voraus × `carryFactor`; Richtungen: Tormitte, geradeaus, zwei Diagonalen (±34°), für die Rolle Dribbler zusätzlich das Umspielen aus `v154TryDribble` | (1 − Behalten) × Gegnerwert am Ort |
| Halten | Behalten × Haltewert am Ort × `holdFactor` (Abschirmen auf der Stelle) | wie Tragen |

- **Nutzen** = Gewinn × Körperstellungsabschlag − Verlust / Risiko. Positionswert `0,3·e^(−d/16)` (d = Meter zum Tor, flacher Winkel bis zur Hälfte); der Gegnerwert nach Ballverlust zählt mit Gewicht 1,6 (Konter).
- **Haltewert (symmetrisch für Pass und Tragen):** Wert des Ballbesitzes eines Spielers an einem Punkt, sobald er den Ball dort hat = max(Positionswert × (0,6 + 0,4·Raum), eigener Schuss × Faktor × Raum). Raum = nächster Feldgegner, der bis dahin (Flugzeit bzw. 1 s Tragen bzw. 0,5 s Halten) mit der Hälfte seines Tempos nachrückt (`close`); 0,25 (gedeckt) bis 1 (frei). Empfänger, Tragezielpunkt und Halten werden damit gleich bewertet; ein Lauf in gedeckten Raum ist nicht mehr wert als ein Pass dorthin.
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

Der Stub von `v183ShotEstimate` (erkennbar an `stub:true`, seit `ef78fca6`) liefert die Schussqualität von `v157ShotQuality` mit hartem 22-m-Fenster. SI-1 liest ihn deshalb an dem Punkt derselben Schusslinie, dessen Torentfernung `Entfernung × 22 / Fenster` beträgt, und skaliert mit 0,4 auf eine Torwahrscheinlichkeit. Ein Verteidiger zwischen Schütze und diesem Punkt halbiert den Wert, zwei heben ihn auf (der Stub sieht nur die Linie dahinter). Kopfballwerte aus `v183CrossEstimate` erhalten dieselbe Skalierung, solange die Flankenschätzung oder die Schussschätzung der Stub ist. Eine echte Schätzung (ohne `stub:true`, auch mit `speed` 0 oder `null`) wird unverändert verwendet; das Fähigkeitsfenster bleibt als Grenze. Nach dem Rebase auf SI-3/SI-7 sind `stubScale` und die Gewichte gegen die echten Schätzungen nachzumessen (SI-K).

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
| `windowBase`, `windowFin` | 16 / 0,7 | Schussfenster in Metern |
| `stubRange`, `stubScale` | 22 / 0,4 | Stub-Brücke |
| `threat`, `threatLength` | 0,3 / 16 | Positionswert |
| `counter` | 1,6 | Gewicht des Gegnerwerts nach Ballverlust |
| `recvShot`, `offer`, `oneTwo` | 0,85 / 0,15 / 0,03 | Empfängerwert |
| `passMin`, `passMax` | 2,5 / 32 | Passlängen (m) |
| `turnRelease`, `turnSpeed`, `turnTick`, `turnCheck`, `turnTau` | 0,55 / 2,5 / 0,08 / 0,25 / 0,7 | Drehung |
| `shotFree`, `shotTurn`, `switchMargin` | 1,2 / 0,5 / 0,15 | Schuss und Körperrichtung |
| `carryHorizon`, `carryMin`, `carryMax`, `carryShot`, `engage` | 1 / 2,5 / 6 / 0,4 / 2 | Tragen |
| `holdFactor`, `crossConv`, `crossMax`, `crossWide`, `laneOne`, `spaceCount` | 0,9 / 0,6 / 30 / 8 / 0,5 / 3 | Halten, Flanke, Stub-Block, Raumpässe |
| `noise`, `noiseFloor`, `commit` | 0,15 / 0,006 / 0,08 | Rauschen, Bindung |
| `scoreRisk`, `focus`, `direct` | 0,15 / 0,1 / 0,25 | Spielstand, Taktik |

## Messung

Native Browser-Engine (`work/measure-si183.cjs`, Edge, Lane C), 192 gepaarte Partien (96 Vereine × 2 Feldgrößen, Seeds `p01r132`), Uhr 0,42 per Override, SI-3-Stub. Basis ist der SI-F-Baum `5ec465e6` mit `--packages=clock --clockRate=0.42`. Die Basisdatei stammt aus der Lane-A-Serie `sif-base-r042` (SI-3) und reproduziert die eigene 48er-Basis bitgleich (48/48 Zustandsdigests, gleiche `dist`-Hashes). SI-1 läuft mit `--packages=clock,options --clockRate=0.42` (Label `si1-final-b192`); das Ergebnis ist identisch zur Serie mit `engage 2` als Override (192/192). `dist` wurde vor und nach jedem Lauf gehasht und blieb unverändert. Differenzen sind gepaart nach Verein und Feldgröße (±95 %).

| Kriterium (Plan) | Ziel | Basis | SI-1 | Ergebnis |
| --- | --- | ---: | ---: | --- |
| Schüsse | +0,8 bis +1,5 | 3,09 | 7,14 (+4,04 ±0,30) | **verfehlt (darüber)** |
| Tore je Schuss | ≥18 % | 23,4 % | 19,9 % (Standard 21,2 %, groß 18,3 %) | erfüllt |
| Fernschüsse >22 m (Spielzug) | 12–20 % | 0 % | 15,4 % (1,03 je Partie, 18,8 % Tore) | erfüllt |
| davon Abschluss ≥13 | ≥75 % | – | 84,8 % | erfüllt |
| Raumpässe | ≤7 | 5,31 | 1,03 | erfüllt |
| Favoriten ≥1 Punkt (N 134) | nicht unter Referenz | 42,5 % | 65,7 % | erfüllt (Gate) |
| Drehzustände 18–22 m („Drehung läuft“) | −50 % | 4,84 | 0,61 (−4,23 ±0,73, −87 %) | erfüllt |
| Rechenzeit je Bewertung (Node) | ≤0,3 ms | – | Mittel 0,08 ms, p90 0,13 ms | erfüllt |

Weitere Kennzahlen (Basis → SI-1):

- Tore 0,80 → 1,44 (+0,64 ±0,18), aufs Tor 1,10 → 2,39, Minuten 4,21 → 4,09.
- Pässe 70,4 → 57,5, abgefangene Pässe 6,7 → 3,0, Ballverluste durch Fehlpass 16,9 → 11,2.
- Fouls 3,9 → 2,7, Ecken 0,11 → 0,12, Flanken 0,21 → 0,13.
- Drehbeginn 18–22 m 1,93 → 0,56, alle laufenden Drehzustände 38,9 → 6,4.
- Favoriten ≥2 Punkte (N 90) 47,8 → 72,2 %, Tordifferenz je Stärkepunkt 0,20 → 0,38.
- Standardfeld: Schüsse 3,82 → 7,95, Tore 1,03 → 1,71, Favoriten 50,8 → 66,2 %. Großes Feld: Schüsse 2,37 → 6,32, Tore 0,56 → 1,17, Favoriten 34,8 → 65,2 %.

**Schussmenge.** Das Plus kommt aus dem Entscheidungsmodell, nicht aus dem schnelleren Takt. Eine Kontrollserie mit Altpfad-Takt (`cadence 0.52`, das entspricht 0,28 Uhreinheiten bei Rate 0,42; 192 Partien) bringt ebenfalls +4,03 Schüsse, aber nur 56,0 % Favoriten und 10,7 % Fernschüsse. Der Ballführer verliert den Ball seltener (abgefangen −3,7 je Partie), erreicht die 22-m-Zone öfter und dreht nicht mehr vor jedem Pass. Die Planannahme „+0,8 bis +1,5“ ging von der Prototyp-Basis `si-max42-norisk` mit 7,5 Schüssen aus; die SI-F-Basis hat bei Uhr 0,42 nur 3,1. Keine geprüfte Stellschraube senkte die Menge in die Nähe des Bands, ohne Torquote, Fernschussanteil oder Favoriten zu verschlechtern. Die 48er-Rauchserien (Basis 48: 3,42 Schüsse, 52,9 % Favoriten):

| Variante (48 Partien) | Schüsse | Tore/Schuss | Fernschüsse | Favoriten |
| --- | ---: | ---: | ---: | ---: |
| v1: Positionswert 0,35/12 m, Tragen-Schuss 0,8, Zweikampf ×0,85 | +5,17 | 27,2 % | 0,5 % | 76,5 % |
| v2a: Tragen-Schuss 0,5 | +4,94 | 18,7 % | 7,7 % | 55,9 % |
| v3a: 0,3/16 m, Tragen-Schuss 0,4, `engage 1` | +4,85 | 22,4 % | 16,7 % | 76,5 % |
| v3a mit Takt 0,52 | +4,69 | 18,5 % | 9,7 % | 55,9 % |
| **v3c: `engage 2` (Vorgabe)** | +4,33 | 21,8 % | 23,0 % | 70,6 % |
| v3d: `stubScale 0.3` | +4,40 | 27,5 % | 6,9 % | 64,7 % |

Für SI-K: Wird die Gesamtmenge mit SI-0, SI-2 und SI-7 zu hoch, wirken `engage` (mehr Pässe, weniger Tragen), `stubScale` (nach SI-3 eine Schussgewichtung) und `noise` auf die Menge. Ein eigenes Band für SI-1 allein ist gegen diese Basis nicht sinnvoll erreichbar.

**Risiko nach Fähigkeit und Rolle.** Ausgewertet wurde das Protokoll von 12 konstruierten VM-Partien mit Rollenzyklus; die v61-Spieler haben keine mentalen Werte. Gewählte Pässe mit Ankunft unter 0,8 kommen bei Passspiel ≥14 zu 37 % vor, bei 10–13 zu 20 % (mittlere Ankunft 0,85 gegen 0,90). Gute Passgeber spielen also mehr riskante Pässe, weil diese für sie einen positiven Erwartungswert haben. Der Rolleneffekt ist mit der engen Spanne klein (Spielmacher 30 % gegen 28 % im Mittel aller Rollen). Die Testszene zeigt ihn isoliert: gleicher Pass, höherer Nutzen beim Spielmacher. Nach dieser ersten 192er-Serie darf SI-K die Spanne (`weightMin`/`weightMax`) weiten.

## Rechenzeit

Gemessen wurde die reine Bewertung (alle Optionen ohne Ausführung) auf 600 echten Spielständen aus vier konstruierten Partien beider Feldgrößen. Je Zustand zählt der schnellste von drei Blöcken mit je fünf Bewertungen; gemessen in Nodes normalem globalem Kontext. Ergebnis: Mittel 0,08 ms, Median 0,08 ms, p90 0,13 ms; unter Volllast der drei Messlanen 0,20 / 0,16 / 0,30 ms. In der VM-Sandbox des Harness ist jeder globale Zugriff etwa achtmal langsamer, auch im Altpfad; deshalb misst der Test in einem Kindprozess ohne Sandbox. Der Zwischenspeicher für `ability`, `v150Pace` und `v150Delay` gilt nur während einer Bewertung.

## Tests

- `node work/test-si-options-v183.cjs` (17 Checks, `--quick` für die Entwicklung), alle bestanden:
  - Altpfad: Mit ausgeschalteten Optionen sind Konstruktorpartien digestgleich zu Regeln 182, mit allen Paketen aus wie mit nur `options:false`. Stub und durchgereichte Umhüllungen sind bitgleich.
  - Schuss: Fernschuss guter und schwacher Schützen, Schusswert und Blocker.
  - Pass und Risiko: Passschätzung (Linie, `pas`, Rolle ohne Einfluss), gleiche Fähigkeit mit anderer Rolle oder anderem `dec`, Spanne, Querpass.
  - Abpraller und freies Tor.
  - Drehung: Freigabe bei höchstens 0,55 rad und früher als die Altfreigabe bei 0,30 rad; Schuss aus der Drehung.
  - Bindung, Rauschen und Ziehungen, Taktikgewichte, Protokoll.
  - Volle Partien beider Feldgrößen, Restore, Rechenzeit.
- Plan 9 Pflichtliste, alle Exit 0; erzeugte Artefakte danach zurückgesetzt: `test-v55/56/57`, `test-breakaway`, `test-duel-streaks`, `run-native130-tests`, `test-world-match-v64`, `test-world-penalties-v65`, `test-world-goal-scene-v83`, `test-world-physical-instructions`, `test-compact-balance-v178`, `test-player-load-candidate-v158`, `test-native-career-v160`, `test-native-performance-context`, `platform/qa/test-unity-integration-v160`, `platform/qa/test-world-unity-contract`, `test-world-pitch3d-v98`, `test-3d-contacts-v119`, `test-whistle-offside-v119`, `test-keeper-picture-v119`, `platform/qa/test-world-unity-slides`, `test-corner-quality-v182`, `test-defensive-pursuit-v182`, `test-freekick-plan-r132`, `test-keeper-hold-v182`, `test-loose-ball-v182`, `test-penalty-quality-v182`, `test-review-fixes-v182`, `build`.
- `check-old-matches-v182.cjs` (Basis `work/tmp-base182` = `git archive f2458c1f dist work/test-v41.cjs`): 158/158 bytegleich.
- `check-old-matches-v183.cjs`: unmarkiert 158, 182-markiert 158 und Konstruktor ohne Marker 12 bytegleich. **Rot ist die Gruppe `si183-off` (12).** Sie baut mit der Konstruktorvorgabe und erwartet „alle Pakete aus“; nach `v183EnableByDefault('options')` trägt die Vorgabe `options:true`. Die Aussage „alle Pakete aus = Regeln 182“ prüft `test-si-options-v183` mit ausdrücklichem Override.
- `test-si-core-v183.cjs`: **Rot** beim ersten Check „Konstruktorvorgabe: alle Pakete aus, leere Parametersätze“, danach Abbruch. Eine nicht eingecheckte Kopie mit fünf angepassten SI-F-Zustandsannahmen besteht alle 28 Checks. Angepasst wurden: Vorgabepakete und -parameter, `options` in der Override-Prüfung, „alle Pakete aus“ per Override, die Stub-Prüfung und der Doppelpass-Bonus mit `options:false`.

## Restore

Der Test speichert `attackFlow.decision` und ein laufendes `pendingTurn` per JSON-Checkpoint (`v65Snapshot`/`v65Restore`), einmal während eines Tragens und einmal während einer Drehung. Danach sind Entscheidung, Drehung, `carry`, Ballführer, `next`, Uhr und `match.si` tief gleich, und das Paket ist aktiv. Die Drehung wird nach dem Restore aufgelöst, und die Partie läuft 1.500 Ticks fehlerfrei weiter. Das B19-Werkzeug (`check-restore-completeness-v183.cjs`) ist noch nicht gemergt. Es prüft `attackFlow` generisch und braucht für SI-1 keine Einordnung, weil SI-1 keine WeakMap nutzt.

## Weichenbedarf und Hinweise für die Integration

- **SI-F (Werkzeuge):** `check-old-matches-v183.cjs` sollte die Gruppe `si183-off` mit `si:{packages:{…alle false}}` bauen und die Markerprüfung daran ausrichten. `test-si-core-v183.cjs` setzt an fünf Stellen den SI-F-Zustand voraus (siehe Tests). Das betrifft jedes Paket, das Vorgaben anmeldet oder einschaltet. Beides ist fremder Besitz und wurde nicht geändert.
- **SI-4:** Die Ankunftsschätzung zählt den Druck auf den Passgeber wie `v55GroundPass` mit dem normalisierten Radius 0,15 (W4). Stellt SI-4 diese Stelle über `v183Radius` auf Meter um, muss SI-1 beim Rebase denselben Parameterschlüssel nutzen. Der Radius in `action` (`pitch-v55.js`, Plan `:494`) wird in markierten Partien nur vom toten Baum gelesen; SI-1 braucht dort keine Weiche.
- **SI-3/SI-7 (Rebase):** Die Stub-Erkennung hängt an `speed:null`; die echte Schätzung muss `speed` setzen. Danach sind `stubScale` und `stubRange` ohne Wirkung, und Gewichte, `carryShot` und `counter` sind gegen die echte xG-Skala nachzumessen. `headerXg` aus `v183CrossEstimate` wird auf derselben Skala wie die Schussschätzung erwartet.
- **SI-2:** SI-1 liest aus `v183Offers` Einträge `{pid, type, team, until}` mit Typ `depth` oder `follow`. `v183PassEstimate` ist objektiv (ohne Persönlichkeit und Angebotszuschlag) und kostet je Aufruf eine Schussschätzung.
- **SI-0:** Eigene Fristen nutzen `v183Seconds`/`v183ClockUnits`. Fristen für Altcode (`carry`) werden ohne Annahme über `v152Seconds` umgerechnet. Das Warten auf die Annahme läuft über die Vorgängerfunktion von `v159Decide`.
- Halten bedeutet Abschirmen auf der Stelle. Es wird selten gewählt (Positionswert ×0,9), kann einen Spieler im Mittelfeld ohne Anspielstation aber kurz stehen lassen, bis SI-2-Angebote wirken.

## Reproduktion

```powershell
$node='C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
git archive 5ec465e6 dist | tar -x -C work/tmp-si1/base      # SI-F-Basisbaum
& $node work/measure-si183.cjs --dist=work/tmp-si1/base --packages=clock --clockRate=0.42 --clubs=96 --workers=6 --port=4262 --label=si1-base192
& $node work/measure-si183.cjs --packages=clock,options --clockRate=0.42 --clubs=96 --workers=6 --port=4263 --label=si1-final-b192
& $node work/measure-si183.cjs --packages=clock,options --clockRate=0.42 --clubs=96 --workers=6 --port=4262 --label=si1-cadence52-192 --params='{"options":{"cadence":0.52}}'
& $node work/measure-si183.cjs --compare=si1-base192,si1-final-b192
& $node work/test-si-options-v183.cjs
```

Fernschüsse, Drehzustände und Favoriten stammen aus den gespeicherten Partiedaten, abgegrenzt wie in `work/table-si-r132.cjs`:

- Fernschüsse: `rec.shots` ohne Elfmeter und direkte Freistöße, Entfernung >22 m.
- Drehzustände: `rec.decisions`, Bucket `18-22`, Ausgang `drehung-laeuft`.
- Favorit: höherer Mittelwert von `teams[].ovr` bei einem Abstand von mindestens 1.

Rohdaten liegen in `outputs/si183/` (gitignoriert).
