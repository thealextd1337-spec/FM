# Spielerintelligenz 183: Kalibrierungsrunde SI-K2 (nach B22)

Stand: 16. Oktober 2026. Branch `feat/si-calibration-2` (Worktree `work/si-calibration2`), abgezweigt von `integration/si-r133` = `ff5a15df` (SI-K, B22) plus Entscheidungszeile `6fcf222b`. Auftrag: letzte Kalibrierungsrunde der Spielerintelligenz (Marker 183) nach dem Flankenpaket B22. Sie umfasst:

- Mechanikkorrekturen aus dem B22-Review;
- die Favoritenquote nach der Nutzerentscheidung „Favoritenquote 16. Oktober 2026“ (Variante A, [Entscheidungen](entscheidungen.md));
- eine Wanduhrreihe bei der Endrate.

Keine Veröffentlichung, keine Fußversion, kein WebGL-Build. Vorgänger: [SI-K](spielerintelligenz-sik-calibration-183.md) (Reihe B2) und [Flanke in den Raum](spielerintelligenz-flanken-183.md) (B22). **Maßgeblich ist die Abnahmereihe K2 unten.**

## Ergebnis in Kürze

- **Kopfbälle:** Kopf- und Volleyschüsse treffen zu 41 % statt 53 % (B22), bei 1,39 Luftschüssen je Partie.
- **Ursache:** Der Torwart stand während hoher Bälle rund 3 m neben der Schusslinie. Er rückt jetzt zum Teil auf die Linie vom Landepunkt zum Tor.
- **Favoriten bei 1–2 Punkten Stärkeabstand** (Variante A, Ziel rund 65 %):

  | | Standardfeld | großes Feld |
  | --- | ---: | ---: |
  | Siege je Klasse (Stichprobe) | 65 % | 64 % |
  | geglättet bei 1,5 Punkten | 67 % | 62 % |
  | geglättet bei 4 Punkten | 93 % | 90 % |

- **Ab 3 Punkten** gewinnen Favoriten 94 % (Standard) bzw. 91 % (groß).
- Erreicht hat das die Korrektur des Kopfballs, nicht ein zusätzlicher Hebel. Der einzige wirksame Hebel (Entscheidungsrauschen) kostet 2,4 Schüsse und 0,7 Tore je Partie und reißt das Ziel für das große Feld. Er wurde verworfen.
- **Übrige Ziele:** Tore 3,86, Schüsse 13,1, 29,1 % Tore je Schuss. Dauer 5,05 min all-inclusive, 89 % der Partien in 4–6 min. Spielflanken 2,48, angekommen 46 % (Motorzähler) bzw. 49 % (Ledger). Großes Feld 95 % der Schüsse und 91 % der Tore des Standardfelds. Uhrrate unverändert 0,385 für beide Feldgrößen.

## Mechanikkorrekturen (nur Marker 183)

Alle Änderungen liegen in den besitzenden Paketen. Partien ohne Marker und mit Kennung 182 sind bytegleich (Prüfungen unten). Die neuen Laufzustände sind Plain-Data in `match.attackFlow`, `match.si` bleibt eingefroren.

### a) Kopfballquote: Torwart und Bewacher

**Befund (B22-Daten, 576 Partien).** Bei Luftabschlüssen stand der Torwart im Median 2,8–3,0 m neben der Linie vom Schützen zum Tor, bei Bodenschüssen unter 12 m 0,5 m. Das galt für Ecken genauso wie für Flanken. Gesetzt wird das Ziel in `game.js:85`: Während eines Flugs gilt das Formationsziel (30 % des seitlichen Ballversatzes auf der Grundlinie). `v115KeeperTarget` (`world-backpedal-v108.js:70`), `v159KeeperTarget` und `v154KeeperDepthTarget` kehren bei einem hohen Ball vorzeitig zurück. Raumflanken trafen zu 62–64 %, Ecken zu 36–40 %.

**Torwart (SI-7, `dist/match-si-setplay-v183.js:261`–`282`).** `v183KeeperFlightTarget` und der Wrapper um `v115KeeperTarget` arbeiten bei jedem hohen Ball der Gegner (Flanke, Raumflanke, Ecke, hoher Ball), der innerhalb von `keeperShiftRange` 20 m vor dem Tor landet:

- Nach der Lesezeit (`keeperRead` 0,25 s minus 0,01 s je Torwartpunkt über 10) rückt er um den Anteil `keeperShift` auf die Linie vom Landepunkt zur Tormitte.
- Seine Tiefe ist `keeperStand` 1,2 m plus 0,06 m je Meter, den der Landepunkt innerhalb von 16 m liegt, höchstens 2 m.
- Landepunkt ist das öffentliche Flugziel des Luftplans, zu dem auch die Anwärter laufen.
- Er läuft mit seinem nativen Tempo; ob er ankommt, entscheiden Flugzeit und Tempo.
- Keine Ziehung, kein Zustand.

Der Anteil 1 stellte ihn genau auf die Linie (Median 0,1–0,3 m daneben). Dann trafen Ecken nur noch zu 20 % und Raumflanken zu 42 %; der Wert ist deshalb **0,4** (Median 1,3–1,9 m).

**Bewacher des Flankenläufers (SI-4, `dist/match-si-defence-v183.js:229`, Aufruf `:277`).** Je Startsignal `attackFlow.crossRun` folgt ein Verteidiger dem sichtbaren Lauf: der nächste einsatzbereite Feldspieler zum Läufer, außer dem Presser des Flankengebers.

- Er wird einmal je Signal gewählt (Plain-Record `attackFlow.defence.mark {runnerId, at, markerId}`).
- Nach `crossMarkReaction` 0,4 s (minus 0,02 s je `pos`-Punkt über 10) steht er `crossMarkGap` m vom Läufer in Richtung Punkt, im Flug in Richtung Landepunkt. Er läuft im Pressingtempo.
- Ein Anwärter des Luftplans läuft weiterhin zum Ball.

Gepaart (192 Partien) kostete der Wert 0 (auf Höhe des Läufers) 8 Punkte Ankunft der Spielflanken (41 % statt 49 %). Der Wert −1 (1 m hinter ihm) hält die Ankunft von B22. Vorgabe ist **−1**. Damit ist der Bewacher praktisch neutral: Duellanteil 30 % und Verteidigergewinn 24 % wie in B22. Die Senkung der Kopfballquote kommt vom Torwart (siehe Risiken).

### b) Optionsschätzung: Verteidiger während der Wartezeit

`v183CrossEstimate` (`dist/match-si-setplay-v183.js:423`–`424`) rechnete die Wartezeit vor dem Abspiel (`lead`) nur dem Läufer an. Deshalb bekamen 98 % der Raumflankenoptionen den Duellwert 0,92 („Verteidiger kommt nicht hin“). Jetzt läuft auch der nächste Verteidiger in der Wartezeit (`flight + lead − 0,3` s). Der Anteil mit 0,92 sinkt auf 75 %; der Rest sind Punkte ohne erreichbaren Verteidiger.

### c) Rechenzeit: eine Abseitsaufnahme je Bewertung

`v183CrossEstimate` nimmt die Abseitsmenge des Aufrufers (`detail.offside`, `:395`). SI-1 reicht die Aufnahme seiner Bewertung weiter (`dist/match-si-options-v183.js:280`, `:306`, `:363`); die Ergebnisse sind unverändert. Im Szenentest sind die Optionslisten in 12 Szenen identisch; die Abseitsaufnahmen je Bewertung sinken von 7 auf 3. Die Zeitmessung von `test-si-options-v183` hat jetzt eine eigene Stichprobe der Flankenzone (Node, schnellster Block je Zustand):

| Stichprobe | Median | p90 |
| --- | ---: | ---: |
| alle Entscheidungen | 0,08–0,14 ms | 0,14–0,28 ms |
| Flankenzone | 0,09–0,18 ms | 0,41–0,73 ms |

Grenzen: Median und p90 ≤ 0,3 ms für alle Entscheidungen; Median ≤ 1 ms in der Flankenzone. Die Spanne stammt aus mehreren Läufen unter wechselnder Rechnerlast.

### d) Kleinere Korrekturen

- **Protokoll „kick“** (`dist/match-si-options-v183.js:314`): `cross-run` am `kickAt` wird erst nach `v55HighPass` geschrieben:
  - `kick:true`, wenn der Flankenzähler stieg (auch bei einem Block am Fuß);
  - `queued:true`, wenn das Abspiel hinter einer Körperdrehung wartet;
  - sonst `abort:'declined'`.

  B22 zählte 3,1 Abspiele nach Wartezeit je Partie; tatsächlich sind es 0,7 sofort und 2,1 nach der Drehung. Der eigentliche Abschlag steht weiter im Eintrag `cross` mit `space:true`.
- **`crossZoneOwner`** (`dist/match-si-offball-v183.js:189`): Die Marke wird gelöscht, sobald der Ballbesitzer außerhalb der Flankenzone ist, auch nach einem Pass. Vorher löschte nur das Verlassen durch denselben Ballführer die Marke; ein Flankengeber, der den Ball in der Zone zurückbekam, startete keinen neuen Zyklus.
- **Boxszene** (`work/test-si-offball-v183.cjs`): Eine neue Variante mit `crossRunBonus` 0 prüft die einfachen Boxangebote. Geprüft wird außerdem, dass die Flankenläufer Stoßstürmer und Torjäger sind und die Boxpunkte halten.

### e) Landestreuung der Raumflanke (optional, umgesetzt)

Neuer Schlüssel `setplay.spaceSpread`: Faktor auf die gleichmäßige Landestreuung einer Raumflanke gegenüber einer Flanke auf den Spieler. Er gilt in Ausführung und Schätzung (`:207`, `:395`), die Vorgabe ist **0,6**. Unerreichte Raumflanken: 20 % → 17 %, Läufer gewinnt 57 % → 59 %, Motorzähler über alle Flanken 43 % → 46 %.

## Messaufbau und Last

Harness und Auswertung wie SI-K und B22: `work/measure-si-calibration-v183.cjs` (Protokollgrenze 40.000) und `work/table-si-calibration-v183.cjs`. Neu ist die Zusatzauswertung der Favoriten: eine logistische Anpassung von P(Sieg des Favoriten) an den Stärkeabstand je Feldgröße, Wert bei 1,5 und 4 Punkten mit Bootstrap-Intervall (300 Ziehungen).

**Warum die Glättung:** Die Klassen „1–2 Punkte“ umfassen nur 62 bzw. 69 Partien, ihr 95-%-Intervall ist ±12 Punkte breit. Dieselbe Klasse schwankte zwischen gleichwertigen Reihen um bis zu 20 Punkte (groß: B2 57 %, B22 77 %, m1 54 %). Rohdaten in `outputs/si183/k2-*.json` (gitignoriert).

**Last:** Auf Nutzerwunsch liefen ab 10:56Z höchstens zwei Lanes gleichzeitig (A und C), zeitweise mit 3, zuletzt mit 6 Seiten je Lane. Während einer Reihe liefen keine schweren Node-Prüfungen.

## Mechanikreihen (192 Partien, Seed-Satz `p01r132`, gepaart mit B22)

| Reihe | Parameter | Torwart neben Linie (Median Ecke / Spielflanke) | Luft Tore je Schuss Ecke / Spielflanke | Spielflanken angekommen (Ledger) | Raumflanken: Läufer / Verteidiger / unerreicht | Tore |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| B22 | – | 2,86 / 2,81 m | 36 / 62 % | 49 % | 57 / 23 / 20 % | 3,76 |
| m1 | `keeperShift` 1, `crossMarkGap` 1 | 0,11 / 0,29 m | 24 / 42 % | 37 % | 45 / 34 / 19 % | 3,51 |
| v1 | `keeperShift` 0,6 | 1,02 / 0,63 m | 24 / 38 % | 35 % | 45 / 36 / 19 % | 3,66 |
| v2 | v1 + `spaceSpread` 0,7 | 1,00 / 0,73 m | 21 / 39 % | 40 % | 48 / 36 / 16 % | 3,49 |
| v3 | v2 + `crossMarkReaction` 0,6 | 1,07 / 0,68 m | 28 / 39 % | 40 % | 49 / 36 / 15 % | 3,53 |
| v4 | `keeperShift` 0,3, `spaceSpread` 0,6, `crossMarkGap` 0 | 2,04 / 1,78 m | 30 / 57 % | 41 % | 52 / 30 / 18 % | 3,78 |
| v5 | `keeperShift` 0,3, `spaceSpread` 0,6, `crossMarkGap` −1 | 2,04 / 1,81 m | 27 / 48 % | 49 % | 58 / 25 / 16 % | 3,70 |

m1 lief zusätzlich auf allen drei Seed-Sätzen (576 Partien, gepaart gegen B22):

| Kennzahl | m1 gegen B22 |
| --- | ---: |
| Tore | −0,25 ±0,17 |
| Kopf-/Volleyschüsse | −0,33 ±0,11 |
| angekommene Flanken | −0,28 ±0,13 |
| Favorit 1–2 Punkte geglättet (Standard / groß) | 69 / 61 % |

Die Endwerte liegen zwischen v1 und v5: `keeperShift` 0,4, `spaceSpread` 0,6, `crossMarkGap` −1.

## Favoriten (Variante A)

**Ausgangslage.** B2 (vor B22) lag bei 1,5 Punkten geglättet bei 68 % (Standard) und 60 % (groß), B22 bei 69 % und 69 %. Zerlegung bei 1–2 Punkten in B22 (Mittel beider Feldgrößen):

| | Favorit | Außenseiter |
| --- | ---: | ---: |
| Schüsse | 7,8 | 4,7 |
| Tore je Schuss | 30,5 % | 20,8 % |

Gegenüber B2 stieg vor allem die Trefferquote des Favoriten (26 → 31 %). Das ist die Kopfballquote der Raumflanken: Starke Teams haben bessere Flankengeber, Luftspieler und Läufer.

**Gepaarte Hebel** (576 Partien, gleiche Seeds):

| Hebel | Wirkung | Entscheidung |
| --- | --- | --- |
| Mechanikkorrektur (a, b, e), Reihe K2 gegen B22 | Favorit bei 1,5 Punkten 69/69 → 67/62 %; Sieg je Klasse 1–2: 71/77 → 65/64 %; ≥3: 93/96 → 94/91 %; Tore −0,05 ±0,18 | **übernommen** (Variante A erfüllt) |
| SI-1 `options.noise` 0,15 → 0,3 (c1 gegen K2) | Favorit bei 1,5 Punkten 67/62 → 61/62 %; Schüsse −2,43 ±0,28 (groß −3,03), Tore −0,68 ±0,18, Dauer −0,18 min; großes Feld nur noch 84 % der Schüsse und 77 % der Tore des Standardfelds | **verworfen** (Ziel großes Feld ≥85 % verletzt, Tore unter 3,2) |
| SI-3 Abschlusssteilheit `spreadSkill`/`spreadPower` (offline auf den protokollierten Schüssen von K2, Schüsse fest) | Flacher bei gleichem Mittel: ±1 Punkt Favoritenquote. Die Quote folgt vor allem der Gesamttrefferquote (+1 Punkt Tore je Schuss ≈ +0,6 Punkte Favorit). | **nicht verstellt** (kein Hebel) |
| SI-3 Torwartabstufung `reachGk` 0,09 → 0,07 (offline) | Favoritenquote −0,3 Punkte | **nicht verstellt** |

**Ergebnis.** Der Favoritenvorteil entsteht über die Schussmenge (Raum, Passspiel, Tempo), nicht über Abschluss oder Torwart. Ein Hebel, der nur enge Duelle staucht, fand sich nicht. Mit der Kopfballkorrektur liegen beide Feldgrößen im Band 60–70 %, der Favorit bleibt ab 3 Punkten bei ≥90 %. Tordifferenz je Stärkepunkt 0,90 (Ziel ≥0,35).

## Endparameter (Vorgaben neuer Partien)

| Paket | Schlüssel | vorher | SI-K2 | Bedeutung |
| --- | --- | ---: | ---: | --- |
| setplay | `keeperShift` | – | 0,4 | Anteil des Wegs auf die Linie Landepunkt–Tor |
| setplay | `keeperRead` / `keeperReadGk` | – | 0,25 s / 0,01 s | Lesezeit des Flugs, minus je Torwartpunkt über 10 |
| setplay | `keeperStand` / `keeperStandDepth` / `keeperStandMax` | – | 1,2 / 0,06 / 2 m | Tiefe vor der Linie |
| setplay | `keeperShiftRange` | – | 20 m | nur bei Landepunkten so nah am Tor |
| setplay | `spaceSpread` | – (1) | 0,6 | Landestreuung der Raumflanke |
| defence | `crossMark` | – | 1 | Bewacher an (0 aus) |
| defence | `crossMarkReaction` / `crossMarkPos` | – | 0,4 s / 0,02 s | Reaktion auf den Lauf |
| defence | `crossMarkGap` | – | −1 m | Abstand zum Läufer Richtung Punkt (negativ: dahinter) |

Alle übrigen Vorgaben bleiben, auch die Uhrrate 0,385 (`V183_CLOCK_RATE`) und `options.noise` 0,15. Gespeicherte 183-Partien ohne die neuen Schlüssel lesen die Vorgaben. Es gibt keine Nutzerspielstände mit 183, keine Umrechnung.

## Abnahmereihe K2 (576 Partien)

96 Vereine × 2 Feldgrößen × 3 Seed-Sätze (`p01r132`, `si183b`, `si183c`), Vorgaben ohne Überschreibungen, Worktree-`dist` auf `c8cd5c6c`. Läufe `k2-f-trace40000`, `k2-f-si183b-trace40000`, `k2-f-si183c-trace40000`: 0 Ausfälle, keine Pausenticks, `dist` unverändert.

Die Reihe ist partieweise digestgleich (576/576 `stateDigestSha`) zur Kandidatenreihe c0. c0 lief auf einer `dist`-Kopie, die sich nur durch einen Kommentar unterscheidet.

| Kennzahl | B2 | B22 | **K2 beide** | Standard | groß | Ziel | |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Dauer all-inclusive (min) / 4–6 min | 5,02 / 90 % | 5,05 / 89 % | **5,05 / 89 %** | 5,10 / 88 % | 5,00 / 90 % | 4,8–5,2; ≥85 % | ✓ |
| kürzeste Partie (min) | 3,57 | 3,35 | 3,50 | 3,50 | 3,69 | ≥3,7 | ✗ (vorbestehend, 0:0-Partien) |
| Schüsse / Anteil 10–18 | 14,15 / 82 % | 12,84 / 80 % | **13,09 / 81 %** | 13,41 | 12,76 | 12–16; ≥45 % | ✓ |
| Tore (Streuung) | 3,84 (2,26) | 3,91 (2,20) | **3,86 (2,32)** | 4,05 | 3,67 | 3–5, ≈4 | ✓ |
| Tore je Schuss | 26,7 % | 30,1 % | **29,1 %** | 29,6 % | 28,5 % | 25–32 % | ✓ |
| 0:0 / ≥7 Tore | 2,6 / 12,8 % | 3,6 / 13,5 % | **4,3 / 13,5 %** | 5,2 / 16,3 % | 3,5 / 10,8 % | ≤6 %; 5–15 % | ✓ |
| Favorit ≥1 Punkt: Sieg / Remis / Niederlage | 78 / 14 / 8 % | 85 / 9 / 6 % | **80 / 13 / 8 %** | 81 / 11 / 8 % | 78 / 14 / 8 % | Information (Ziel gilt je Abstand) | – |
| Favorit 1–2 Punkte: Sieg je Klasse | 66 / 57 % | 71 / 77 % | **65 / 64 %** | 65 % | 64 % | rund 65 % (60–70 %), beide Felder | ✓ |
| Favorit bei 1,5 Punkten geglättet [95 %] | 68 / 60 % | 69 / 69 % | **64 % [59–68]** | 67 % [61–73] | 62 % [55–68] | rund 65 % | ✓ |
| Favorit ≥3 Punkte: Sieg je Klasse | 94 / 92 % | 93 / 96 % | **93 %** | 94 % | 91 % | rund 90 % und mehr | ✓ |
| Tordifferenz je Stärkepunkt | 0,86 | 0,90 | **0,90** | 0,98 | 0,81 | ≥0,35 | ✓ |
| Verhältnis Abschluss ≥14 / <10 | 2,14 | 1,80 | **2,01** | 2,15 | 1,91 | ≥1,8 | ✓ |
| Torwartabstand (Punkte) | 14,3 | 13,7 | **14,6** | 16,8 | 12,2 | ≥10 | ✓ |
| Fernschüsse Standard: Anteil / von Abschluss ≥13 | 13,6 / 92 % | 16,1 / 94 % | – | **14,8 / 93 %** | 32,0 / 52 % | Standard 12–20 %; ≥75 % | ✓ |
| Fernschüsse Abschluss ≥14: Tore je Schuss | 22 % | 20 % | **23 %** | 27 % | 20 % | 15–25 % | ✓ (Standard allein 27 %) |
| Spielflanken je Partie | 0 | 2,71 | **2,48** | 3,19 | 1,77 | ≥2,0 | ✓ (groß darunter, wie B22) |
| angekommen: alle Flanken (Motorzähler) / Spielflanken (Ledger) | 48 % / – | 43 / 46 % | **46 / 49 %** | 45 / 49 % | 47 / 49 % | ≥45 % | ✓ |
| Kopf-/Volleyschüsse (Tore je Schuss) | 0,64 (35 %) | 1,34 (53 %) | **1,39 (41 %)** | 1,60 (43 %) | 1,18 (39 %) | ≥0,6; deutlich unter 54 %, etwa 35–40 % | ✓ / knapp darüber |
| davon Ecken / Spielflanken / Freistoßflanken (Tore je Schuss) | 36 % / – / – | 40 / 63 / 59 % | **29 / 49 / 56 %** | | | – | |
| Ecken / Schüsse ≤10 s danach | 1,56 / 0,09 | 1,45 / 0,08 | **1,55 / 0,08** | 1,69 | 1,40 | 1,2–3,0 | ✓ |
| Abprallerschüsse ≤5 s / Gewinn | 0,62 / 26 % | 0,47 / 24 % | **0,55 / 27 %** | 0,59 | 0,52 | ≥0,3; ≥35 % | ✓ / ✗ (verschoben seit SI-K) |
| Freistöße / Fouls | 3,24 / 3,14 | 3,38 / 3,26 | **3,50 / 3,38** | 4,00 | 3,00 | Freistöße ≤4,5 | ✓ |
| Großes Feld / Standard: Schüsse / Tore | 90,3 / 89,6 % | 92,3 / 88,7 % | **95,2 / 90,7 %** | | | ≥85 % | ✓ (je Seed-Satz Tore 87,6 / 92,3 / 92,3 %) |
| Zonenzeit ≤22 m (s je Team) | 3,93 | 4,25 | **4,11** | 4,57 | 3,65 | groß ≥2,7 | ✓ |
| Frische Feldspieler / Torwart | 54,1 / 82,4 | – | **54,0 / 82,5** | | | Feld 40 ± 5 | ✗ (vorbestehend, nicht SI) |

Gepaart gegen B22 (576 Paare, ±95 %):

| Kennzahl | Differenz |
| --- | ---: |
| Tore | −0,05 ±0,18 |
| Schüsse | +0,24 ±0,26 |
| Spielflanken | −0,23 ±0,15 |
| angekommene Flanken | +0,05 ±0,13 |
| Kopf-/Volleyschüsse | +0,05 ±0,12 |
| Abprallerschüsse | +0,08 ±0,08 |
| Dauer all-inclusive | −0,00 ±0,05 min |

Gegen B2: Schüsse −1,07 ±0,27, Tore +0,02 ±0,20, Spielflanken +2,48 ±0,14, Kopf-/Volleyschüsse +0,76 ±0,11.

### Je Stärkeabstand und Feldgröße (K2, Übergabe an SI-6)

| Feld | Abstand | Partien | Sieg Favorit | Remis | Niederlage | Tore | Tordifferenz Favorit | Schüsse | B22 Sieg | B2 Sieg |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Standard | <1 | 89 | 51 % | 25 % | 25 % | 3,46 | 0,67 | 13,27 | 51 % | 54 % |
| Standard | 1–2 | 62 | **65 %** | 18 % | 18 % | 3,13 | 1,13 | 12,74 | 71 % | 66 % |
| Standard | 2–3 | 50 | 80 % | 18 % | 2 % | 3,58 | 2,26 | 12,30 | 84 % | 76 % |
| Standard | ≥3 | 87 | **94 %** | 2 % | 3 % | 5,57 | 4,33 | 14,67 | 93 % | 94 % |
| groß | <1 | 82 | 43 % | 26 % | 32 % | 2,88 | 0,29 | 12,79 | 41 % | 43 % |
| groß | 1–2 | 69 | **64 %** | 20 % | 16 % | 2,96 | 1,10 | 12,38 | 77 % | 57 % |
| groß | 2–3 | 48 | 73 % | 15 % | 13 % | 3,38 | 1,71 | 11,54 | 81 % | 73 % |
| groß | ≥3 | 89 | **91 %** | 9 % | 0 % | 5,12 | 3,57 | 13,70 | 96 % | 92 % |

Bei „<1“ ist der Favorit das Team mit dem höheren mittleren `ovr`. Neu erzeugen: `work/table-si-calibration-v183.cjs k2-f-trace40000,k2-f-si183b-trace40000,k2-f-si183c-trace40000 b22-f-trace40000,b22-f-si183b-trace40000,b22-f-si183c-trace40000 --strength`.

**Raumflanken (Protokoll, 576 Partien):** 2,27 je Partie. Läufer gewinnt die Landung 59 %, Verteidiger 24 %, unerreicht 17 %; Luftduell in 30 %. Am `kickAt`: 0,74 sofortige Abspiele, 2,14 nach Drehung, 0,17 Abbrüche wegen Ankunft, 0,29 wegen Abseits je Partie.

## Wanduhr

Gemessen mit `work/measure-wallclock-si183.cjs` wie in SI-K: echte Browserpartien auf der Produktionsschleife (`setInterval` 40 ms, Schritte auf 50 ms gedeckelt).

- **Ansicht:** Unity-WebGL im Querformat 900 × 430, weil nur dort Torwiederholungen laufen. GPU (ANGLE/D3D11), headless, eine Seite, keine weitere Messung parallel.
- **Partien:** 10 Partien, erste Pflichtspiele der Vereine ENG-1 … GER-2, Standard und groß abwechselnd, Vorgaben der neuen Partie (Uhr 0,385).
- **Gezählt:** all-inclusive mit Torszenen, Torwiederholungen, Bannern und Wiederanstößen, ohne Taktikpausen.
- **Nachweise:** Unity in allen Partien bereit, keine Seitenfehler, `dist` und Unity-Build vor und nach dem Lauf hashgleich. Rohdaten `outputs/si183/wallclock-k2.json`.

| Lauf | Partien | Wanduhr Mittel (min) | Spanne | in 4–6 min | gerechnete Zeit (min) | Tore je Partie |
| --- | ---: | ---: | --- | ---: | ---: | ---: |
| GPU, 1 Seite, Uhr 0,385 (K2) | 10 | **5,37** | 4,33–6,02 | 9 von 10 | 5,27 | 5,5 |
| Node-Harness K2, all-inclusive (Mittel) | 576 | 5,05 | 3,50–7,38 | 89 % | – | 3,86 |
| Node-Harness K2, Regression bei 5,5 Toren (+0,26 min je Tor) | – | 5,48 | – | – | – | 5,5 |

Die Browserpartien sind wie in SI-K oft ungleich (8:1, 8:0, 7:0). Bei gleicher Torzahl erwartet die Node-Messung 5,48 min, der Browser lag bei 5,37 min. Ruckler kosteten im Mittel 0,10 min je Partie (Wanduhr minus gerechnete Zeit; SI-K mit Uhr 0,36: 0,25 min). Die Uhrrate 0,385 bleibt für beide Feldgrößen.

## Prüfungen

Node 24 (`C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`), Endstand `c8cd5c6c` (Code) plus diese Doku. Alle Prüfungen liefen nacheinander und ohne parallele Messreihe.

**SI-Pakettests** `work/test-si-*-v183.cjs`, alle grün:

| Test | Prüfungen | Neu in SI-K2 |
| --- | ---: | --- |
| core | 28 | – |
| clock | 22 | – |
| finish | 20 | – |
| defence | 30 | – |
| setplay | 18 | – |
| offball | 19 | Flankenzonenmarke nach Pass; Boxszene ohne `crossRunBonus` |
| options | 25 | Stichprobe Flankenzone: alle 0,082 / 0,141 ms, Flankenzone 0,104 / 0,360 ms (Median / p90) |
| field | 14 | – |
| crossing | 16 | siehe unten |

Neu in `test-si-crossing-v183` (im Workflow-Block):

- Torwartabstand zur Linie Landepunkt–Tor bei der Landung, Anteil 1 / Vorgabe / 0:
  - Standard 0,04 / 0,68 / 1,34 m;
  - groß 0,04 / 0,55 / 1,06 m;
  - reines Ziel ohne Ziehung.
- Bewacher-Record als Plain-Data; Mechanik bei `crossMarkGap` 0: nächster Verteidiger an der Landung 1,84 m statt 1,94 m.
- Schätzung mit Wartezeit unter dem Duellwert 0,92.
- Gemeinsame Abseitsmenge: gleiche Optionslisten, weniger Aufnahmen.
- `spaceSpread` skaliert Schätzung und Landefehler.
- Protokoll am `kickAt` mit `kick` oder `queued`.

**Altpartien:**

- `node work/check-old-matches-v183.cjs`: grün, 340 Szenen bytegleich gegen `e4e531c0`. Unmarkiert, 182 und 183 mit allen Paketen aus.
- `node work/check-old-matches-v182.cjs work/tmp-sik2/base182` (Basis per `git archive e4e531c0 dist work/test-v41.cjs`): grün, 158 Szenen.
- Beide liefen auf dem Mechanikstand und erneut auf dem Endstand.

**Restore:** `node work/check-restore-completeness-v183.cjs --port=4262 --quick` auf Lane C: grün, 10 Läufe. `attackFlow.defence.mark` ist Plain-Data; das Torwartziel ist flüchtig (aus Flug und Luftplan); keine neue WeakMap.

**Workflow-Block „Spieltests ausführen“** aus `.github/workflows/deploy.yml`: alle 118 Befehle (Node 24 für `node`, Python für `python3`) mit Exit 0, über eine gitignorierte Kopie von `run-deploy-tests.cjs`. Keine neue Testdatei, der Block ist unverändert.

**Artefakte zurückgesetzt:** `git checkout -- outputs docs/spieler-nutzer-rig`.

**Laufzeiten dieser Runde (UTC, 16. Oktober 2026):**

| Schritt | Zeit | Dauer | Last |
| --- | --- | ---: | --- |
| Mechanikserie m1 (576 Partien) | 10:21–10:36 | 15 min | 3 Lanes × 6 Seiten; danach Lastgrenze des Nutzers |
| Varianten v1–v3 | 10:38–10:53 | 15 min | 3 Lanes × 6 Seiten |
| Abgebrochene Varianten | 10:53–10:56 | 3 min | vom Nutzer beendet |
| Varianten v4/v5 (je 192) | 10:58–11:12 | 14 min | 2 Lanes × 3 Seiten |
| Kandidaten c0/c1 (je 576) | 11:13–11:46 | 33 min | 2 Lanes × 6 Seiten |
| Abnahmereihe K2 (576) | 11:47–12:05 | 18 min | 2 Lanes × 6 Seiten |
| Wanduhr (10 Browserpartien) | 12:06–12:57 | 51 min | 1 Seite, allein |
| Restore, SI-Tests und Workflow-Block | 12:57–13:21 | 24 min | nacheinander |
| Altpartien erneut | 13:21–13:30 | 9 min | – |

Gesamt ab Lastgrenze (10:56) rund 2,5 Stunden.

## Risiken und offene Punkte

- **Kopfbälle aus dem Spiel weiter hoch:** Spielflanken treffen per Luftschuss zu 49 %, Ecken zu 29 %, gesamt 41 %. Unbedrängte Luftschüsse (kein Gegner ≤2,5 m) treffen zu 78 % der Schüsse aufs Tor. Der Bewacher ist mit `crossMarkGap` −1 praktisch neutral. Auf Höhe des Läufers (0) senkt er die Kopfballquote weiter, kostet aber 8 Punkte Ankunft (Ziel ≥45 %). Zielkonflikt zwischen den beiden Vorgaben, hier zugunsten der Ankunft entschieden.
- **Ecken:** Der Torwart rückt auch bei Ecken. Kopfballtore je Schuss aus Ecken sinken von 36–40 % auf 29 %. Für Ecken gilt kein Quotenziel, Anzahl und Folgeschüsse bleiben im Band.
- **Favoriten:** Das Ziel ist ohne eigenen Hebel erfüllt. Die Klassen je Feldgröße haben ±12 Punkte Stichprobenfehler; die geglättete Schätzung liegt bei 67 % (Standard) und 62 % (groß). Das Standardfeld liegt in allen Reihen 5–8 Punkte über dem großen. Ein Hebel nur für eine Feldgröße wäre eine SI-5-Skalierung (nicht umgesetzt).
- **Großes Feld:** 1,77 Spielflanken je Partie (B22 1,94), Mittel beider Felder 2,48.
- **Fernschüsse Abschluss ≥14 auf dem Standardfeld:** 27 % (Ziel 15–25 % gepoolt erfüllt, 23 %).
- **Unverändert offen seit SI-K:** kürzeste Partie (0:0) unter 3,7 min, Abprallergewinn 27 %, Frische (Belastungsmodell).

## Reproduktion

```powershell
$node='C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
# Abnahmereihe (Vorgaben), höchstens zwei Lanes gleichzeitig
& $node work/measure-si-calibration-v183.cjs --clubs=96 --workers=6 --port=4250 --traceLimit=40000 --label=k2-f
& $node work/measure-si-calibration-v183.cjs --clubs=96 --workers=6 --port=4262 --traceLimit=40000 --seedPrefix=si183b --label=k2-f
& $node work/measure-si-calibration-v183.cjs --clubs=96 --workers=6 --port=4250 --traceLimit=40000 --seedPrefix=si183c --label=k2-f
& $node work/table-si-calibration-v183.cjs k2-f-trace40000,k2-f-si183b-trace40000,k2-f-si183c-trace40000 b22-f-trace40000,b22-f-si183b-trace40000,b22-f-si183c-trace40000 --strength
# Varianten (192 Partien, Seed-Satz p01r132)
& $node work/measure-si-calibration-v183.cjs --clubs=96 --workers=6 --port=4250 --traceLimit=40000 --label=k2-v5 '--params=setplay.keeperShift=0.3,setplay.spaceSpread=0.6,defence.crossMarkGap=-1'
# Hebel Entscheidungsrauschen (576 Partien wie oben)
& $node work/measure-si-calibration-v183.cjs --clubs=96 --workers=6 --port=4262 --traceLimit=40000 --label=k2-c1 --params=options.noise=0.3
# Wanduhr
& $node work/measure-wallclock-si183.cjs --matches=10 --parallel=1 --port=4251 --gpu --out=outputs/si183/wallclock-k2.json
```

Die B22- und B2-Rohdaten (`b22-f*-trace40000.json`, `sik-b2*.json`) wurden für die Paarung nach `outputs/si183/` kopiert. Die logistische Anpassung und die Auswertungen der Luftschüsse und Raumflanken liefen über gitignorierte Hilfsskripte (`work/tmp-sik2/favfit.cjs`, `hdr2.cjs`, `space.cjs`, `fav-finish.cjs`). Die Formeln stehen im Abschnitt Messaufbau.
