# Spielerintelligenz 183: SI-K Integration und Kalibrierung

Stand: 16. Oktober 2026. Branch `feat/si-calibration` (Worktree `work/si-calibration`), abgezweigt von `integration/si-r133` = `ff0bbd8d` (SI-F, B19, B20, SI-0, SI-3, SI-4, SI-7, SI-2, SI-1, SI-5, U-1, B21). Auftrag: [Umsetzungsplan](spielerintelligenz-umsetzungsplan-2026-10-14.md) Abschnitt 10, Zielwerte 2.3 (Torziel 15. Oktober 2026, [Entscheidungen](entscheidungen.md)). Keine Veröffentlichung, keine Fußversion, kein WebGL-Build. Nachtrag 16. Oktober 2026 (Nutzerentscheidungen): Uhrrate all-inclusive einschließlich Torwiederholungen (0,385, Reihe B2), Fernschussanteil gilt nur für das Standardfeld, Spielflanken übernimmt ein Zusatzpaket (Übergabe unten). **Maßgeblich ist Reihe B2.**

## Messaufbau

- **Harness:** `work/measure-si-calibration-v183.cjs` führt `work/measure-si-offball-v183.cjs` (und damit `work/measure-si183.cjs`) unverändert im selben Prozess aus und ergänzt nur lesende Beobachter: Rolle, mentale Werte, Persönlichkeitsgewichte und gegnerischer Torwart je Schuss; Ecken-/Freistoßkennung und Ausgang je Flanke; Spielerzusammenfassung; Abprallerschüsse über die Ledger-Elternkette; Flankenzone und Aufrufe von `v183CrossEstimate`; mit `--traceLimit` Auszüge des flüchtigen Protokolls (Optionswahl, `finish.shot` mit Situation). Keine Zufallsziehung, kein Schreibzugriff. Nachweis: Die Protokollserien sind partieweise digestgleich zu Reihe A (96/96 und 192/192 `stateDigestSha`).
- **Auswertung:** `work/table-si-calibration-v183.cjs <lauf[,lauf]> [<basis>] [--strength]`; Definitionen im Dateikopf. „angekommen“ ist der Motorzähler `crossComplete`/`crosses` (Angreifer gewinnt die Landung: Annahme, Kopfballschuss oder Ablage), Spielflanken ohne Ecken und Freistoßflanken. Abprallerschuss = Schuss desselben Teams ≤5 s nach einem freien Ball, der laut Ledger-Kette aus einem Schuss stammt.
- **Offline-Kalibrierung (a):** `work/calibrate-si-k-finish-v183.cjs` wertet das SI-3-Modell (`v183FinishPlan` der echten `dist`) auf den exakt protokollierten Schusssituationen aus. Auf der Protokollserie p01r132 erwartet es 21,7 % Tore je Schuss bei gemessenen 22,3 %.
- **Lanes:** A (4250), B (4256), C (4262) mit je 6 Seiten, Sperren und Einträge in `work/si-integration/outputs/si183/queue.log`; `dist`-Hash vor und nach jedem Lauf (`distUnchanged: true` in jeder Serie). Rohdaten in `outputs/si183/` (gitignoriert). Keine Partie lief im Pausenzustand (`notLiveStepTicks` 0 in allen Serien).

## Abnahmereihe A (Integrationsstand `ff0bbd8d`, Uhr 0,42)

576 Partien = 96 Vereine × 2 Feldgrößen × 3 Seed-Sätze (`p01r132`, `si183b`, `si183c`), alle Pakete per Vorgabe, Uhr 0,42 per Override (Arbeitsrate aller Paketmessungen; die Endrate folgt in Schritt e). 0 Ausfälle, 0 Engine-Fehler. Läufe `sik-a`, `sik-a-si183b`, `sik-a-si183c`.

| Kennzahl | beide | Standard | groß | Ziel (2.3) | |
| --- | ---: | ---: | ---: | --- | --- |
| Dauer (min) / Anteil 4–6 min / kürzeste | 4,19 / 62 % / 3,09 | 4,21 / 64 % / 3,35 | 4,16 / 61 % / 3,09 | 4,8–5,2; ≥85 %; ≥3,7 | ✗ (Uhr folgt in e) |
| Schüsse / Anteil 10–18 | 13,03 / 85 % | 13,88 / 86 % | 12,18 / 85 % | 12–16; ≥45 % | ✓ |
| aufs Tor | 45 % | 45 % | 45 % | ≥38 % | ✓ |
| Tore (Standardabweichung) | 2,87 (2,07) | 3,05 (2,26) | 2,70 (1,83) | 3–5, ≈4 | ✗ |
| Tore je Schuss | 21,7 % | 21,6 % | 21,8 % | 25–32 % | ✗ |
| 0:0 / 3–5 Tore / ≥7 Tore / höchste Torzahl | 10,2 % / 41 % / 4,5 % / 13 | 11,1 % / 40 % / 6,6 % / 13 | 9,4 % / 41 % / 2,4 % / 9 | ≤6 %; –; 5–15 % | ✗ / – / ✗ |
| Favoriten ≥1 Punkt (N) / ≥2 | 74 % (405) / 81 % | 72 % (199) / 80 % | 76 % (206) / 83 % | ≥62 %, groß ≥60 % | ✓ |
| Tordifferenz je Stärkepunkt | 0,71 | 0,78 | 0,65 | ≥0,35 | ✓ |
| Abschluss ≥14 / <10, Tore je Spielzugschuss | 36 / 13 % (2,68) | 37 / 12 % (2,97) | 35 / 14 % (2,40) | Verhältnis ≥1,8 | ✓ |
| Torwart 10–14 / ≥14, Tore je Schuss aufs Tor | 52 / 38 % (14,1 Punkte) | 52 / 37 % | 52 / 38 % | ≥10 Punkte | ✓ |
| Fernschüsse >22 m: Anteil / von Abschluss ≥13 | 31,8 % / 53 % | 23,3 % / 70 % | 41,6 % / 42 % | 12–20 %; ≥75 % | ✗ |
| Fernschüsse Abschluss ≥14: Tore je Schuss | 19 % | 22 % | 17 % | 15–25 % | ✓ |
| Flanken gesamt / aus dem Spiel | 1,33 / 0,00 | 1,37 / 0,00 | 1,28 / 0,00 | Spiel ≥2,0 | ✗ |
| angekommen (alle Flanken, fast nur Ecken) | 45 % | 49 % | 41 % | ≥45 % | ✓ (knapp) |
| Kopfball-/Volleyschüsse (Tore je Schuss) | 0,51 (32 %) | 0,59 | 0,43 | ≥0,6 | ✗ |
| Ecken / Schüsse ≤10 s danach | 1,35 / 0,06 | 1,39 / 0,07 | 1,31 / 0,05 | 1,2–3,0 | ✓ |
| Abprallergewinn der Angreifer ≤3 s | 26 % | 24 % | 29 % | ≥35 % | ✗ |
| Abprallerschüsse ≤5 s (Kette, Protokollserie p01r132) | 0,60 | 0,66 | 0,55 | ≥0,3 | ✓ |
| Fouls / Freistöße / Elfmeter | 2,77 / 2,87 / 0,03 | 3,21 / 3,27 | 2,34 / 2,46 | Freistöße ≤4,5 | ✓ |
| Raumpässe (angekommen) | 0,85 (0,35) | 0,88 | 0,81 | – | |
| Ballführer Tempo Mittel / Höchstwert je Partie (m/s) | 3,24 / 7,08 | 3,08 / 6,79 | 3,41 / 7,36 | – | |
| Großes Feld / Standard: Schüsse / Tore / Zonenzeit | 87,8 / 88,6 / 85,6 % | | | ≥85 % | ✓ (knapp) |
| Frische nach Abpfiff: Feldspieler / Kondition 9–11 / Torwart (Verbrauch) | 54,1 / 51,3 / 83,2 (16,8) | 54,9 / 51,9 / 83,0 | 53,3 / 50,7 / 83,5 | Feld 40 ± 5 | ✗ (vorbestehend) |
| Rechenzeit je Tick Median / p95 (ms) / je Partie (s) | 3,13 / 3,99 / 16,0 | 2,95 / 4,07 / 15,6 | 3,25 / 3,89 / 16,3 | – | 18 Seiten parallel |

Je Seed-Satz (beide Feldgrößen): Schüsse 13,22 / 13,03 / 12,83, Tore 2,99 / 2,80 / 2,82, Favoriten 72 / 73 / 77 %. Großes Feld / Standard je Seed-Satz (Schüsse / Tore / Zonenzeit): p01r132 88,4 / 89,8 / 76,8 %, si183b 87,8 / 87,1 / 87,8 %, si183c 87,1 / 88,9 / 92,5 %.

**Torverteilung** (Anteil der Partien, beide Feldgrößen): 0 Tore 10,2 %, 1 19,1 %, 2 20,1 %, 3 15,8 %, 4 12,7 %, 5 12,2 %, 6 5,4 %, 7 2,1 %, 8 1,4 %, 9–13 1,0 %. Die Streuung ist breiter als Poisson (Standardabweichung 2,07 bei Mittel 2,87), Spiele mit großem Stärkeabstand (≥3 Punkte) haben im Mittel 4,6 (Standard) bzw. 3,7 Tore (groß).

**Schussquellen** (je Partie, Tore je Schuss): Spielzug ≤22 m 7,14 (26 %), Fernschuss 3,86 (13 %), Kopfball/Volley 0,51 (32 %), Folge eines Freistoßes ≤10 s 1,26 (19 %), Folge einer Ecke 0,06 (53 %), direkte Freistöße 0,15 (18 %), Elfmeter 0,03. Abpraller sind in der Protokollserie getrennt gezählt (0,60 je Partie ≤5 s).

**Fähigkeitsabstufung.** Abschluss: 13 / 18 / 36 % Tore je Spielzugschuss (<10 / 10–14 / ≥14). Torwart: 52 % (10–14) gegen 38 % (≥14) Tore je Schuss aufs Tor. Luftspiel: Kopfball-/Volleytore je Schuss 28 / 28 / 46 % (<10 / 10–14 / ≥14, n 40 / 189 / 67).

**Persönlichkeit** (Feldspieler, 576 Partien). Schüsse je Spieler und Partie nach Rolle: Stoßstürmer 2,87, Torjäger 2,62, Box-to-Box 1,40, Zielspieler 1,05, Dribbler 0,84, Spielmacher 0,49, Abräumer 0,32, Flügel 0,20, Verteidigerrollen 0,16–0,32. Bei gleichem Abschluss (11–14) schießen Spieler im oberen `shootWeight`-Drittel (1,03) 3,17-mal je Partie, im mittleren (0,86) 1,06-mal, im unteren (0,72) 0,97-mal. Rolle und Fähigkeit sind dabei nicht getrennt; das untere Drittel sind überwiegend Verteidiger und Mittelfeldrollen. Unter Druck (Gegner ≤2,5 m) treffen Spieler mit Ruhe ≥12 zu 30 %, mit Ruhe <10 zu 10 % (Ruhe ist mit Rolle und Abschluss korreliert; kein isolierter Effekt).

## Klärung der offenen Punkte vor der Kalibrierung

| Punkt | Befund | Entscheidung |
| --- | --- | --- |
| Ballführertempo-Bremse (`world-offensive-quality-v157.js:64`) | Das Laufziel setzt `v159CarrierTarget` (`world-football-flow-v159.js:250`): bei laufendem Tragen fest 2 m in Tragerichtung. `v157Move` begrenzt das Wunschtempo auf `√(2·Bremse·(d−0,05))`, mit Bremse 10,5·1,25/Masse ≈ 13 m/s² also ≈ 7,1 m/s. Korrektur (nur Paket `offball`, Parameter `offball.carrierBrakeLead` 0,25 m): Das Ziel liegt mindestens 0,25 m hinter dem Bremsweg des Wunschtempos, nie näher als bisher; Annahmezweig (1,4 m) unverändert. Gepaart (192, p01r132): Höchsttempo je Partie +0,23 ±0,07 m/s (groß +0,39 → 7,70), Mittel +0,04, Schüsse +0,06 ±0,36, Tore −0,19 ±0,25 (nicht signifikant). | **behoben** (wird mit Iteration 1 übernommen). `carrierPace` 1,5 und die SI-5-Gains bleiben: Die Bremse wirkte nur auf wenige lange Läufe; der Ergebniseffekt liegt im Rauschen. |
| Messdefinition „angekommene Flanken“ (3 % Messhülle gegen 36 % Szenen) | Die Messhülle zählte Ledger-Flanken mit Ergebnis `received`/`goal`. Ein Kopfballschuss oder eine Ablage setzt keinen Ballbesitzer, das Ledger schreibt `arrived`; gezählt wurden also nur kontrollierte Annahmen. Der Motorzähler `crossComplete` (SI-7 `credit()`) zählt jeden Landungsgewinn des Angreifers. | **behoben (Messung):** neue Definition `crossComplete/crosses`, Reihe A 45 %. |
| Raumpässe 7,9 → 0,6 | Ausführung über dieselbe Funktion `v150SpacePass`, die das Ledger-Feld `intent:'space'` setzt (SI-1 `v183OptExecute`). Die Zählung ist gleich; SI-1 wählt Raumpässe nur noch, wenn ihre geschätzte Ankunft (Mittel 0,28) den Wert trägt. | **echt** (Verhaltensänderung von SI-1, kein Zählfehler). |
| Kopfball-xG gegen Ausführung (SI-7) | Das SI-3-Modell trifft die Kopfbälle in der Ausführung (Protokoll: erwartet 0,34–0,37, gemessen 0,42–0,45 Tore je Kopfballschuss, n 40–91). Niedrig ist dagegen `v183CrossEstimate`: Ankunft im Mittel 0,10 (Landeanteil 0,15, Duell 0,67) und Kopfballwert 0,05, weil der Landeanteil die Bewegung des Empfängers während des Flugs nicht enthält und Empfänger meist weiter als `finishRange` (12 m) vor dem Tor stehen. | **eingeordnet**, Teil des Flankenbefunds unten. |
| Spielflanken ≥2,0 | **Aus dem Spiel gibt es keine Flanken** (p01r132: 260 Flanken, davon 256 Ecken und 4 Freistoßflanken). Ballführer stehen 52-mal je Partie in der Flankenzone (<30 m, >8 m seitlich), aber nur 2,6-mal steht dabei ein Mitspieler innerhalb 16 m vor dem Tor (Bedingung in SI-1); die Abseitsklammer hält Läufer an der Abwehrlinie. `v183CrossEstimate` wird 1,4-mal je Partie mit gültiger Geometrie aufgerufen, eine Flanke ist nie unter den drei besten Optionen. | **Nutzerentscheidung bzw. Folgepaket nötig:** Mit Parametern nicht erreichbar. Nötig ist eine Flanke in den Raum (Ziel Boxpunkt, Läufer startet mit der Flanke, Abseits beim Abspiel, Schätzung mit Laufweg), also eine Änderung in SI-1/SI-2/SI-7. Schritt (c) wird deshalb nur geprüft, nicht gedreht. |
| Abprallerschüsse ≥0,3 und Abprallergewinn ≥35 % | Die Messhülle zählte nur Schüsse, deren direktes Elternereignis der Abpraller ist (0,02). Über die Ledger-Kette sind es 0,60 je Partie. Der Gewinn bleibt bei 26–27 %. | Schüsse **erfüllt** (Messdefinition korrigiert). Gewinn **verschoben** (Paradenrichtung und Positionen; kein Kalibrierhebel ohne Nebenwirkung auf Tore). |
| `counterWindow` (SI-4) | SI-4-Szenenmessung: Rückgewinn ≤3 s mit Fenster 10,7 %, ohne 11,4 % (±1,8). | Entscheidung in Schritt (d). |
| Radius 3 m gegen 9 m (SI-4/SI-7) | Die Werte messen Verschiedenes: 9 m ist die flächengleiche Umrechnung des alten normierten Radius 0,15 und zählt Gegner (Druck auf Passgeber/Ecke). 2,5 m (SI-3, gewichtet) und 3 m (SI-7 Flankenfehler) messen unmittelbaren Druck am Schützen bzw. Flankengeber. `defence.crossPressureRadius`, `shotPressureRadius`, `decisionPressureRadius` haben keinen Abnehmer. | **entschieden:** Werte bleiben getrennt; die drei Schlüssel ohne Abnehmer bleiben wirkungslos (kein Zusammenführen ohne Messbedarf). |
| Kontaktprüfreihenfolge (SI-4 S4) | `v182ContactCheck` läuft nach Bewegung und Entscheidung (`pitch-v56.js:121`); wer im Entscheidungstick abspielt, entgeht dem Zweikampf dieses Ticks. | Schritt (d). |
| SI-5 ohne Reserve; `windowGain` 14–15 | Reihe A: 87,8 % Schüsse, 88,6 % Tore, Zonenzeit 85,6 % (p01r132 76,8 %). | Abnahme hält; Prüfung erneut in Reihe B. |
| Belastung v158 auf dem großen Feld | Frische Feldspieler 53,3 (groß) gegen 54,9 (Standard), Torwart 83,5 / 83,0. Kein Abbruch, keine zurückdatierten Ereignisse. | Großes Feld unauffällig. |
| Torwart- und Feldfrische | Feldspieler 54,1 statt Produktreferenz 40 ± 5, Torwartverbrauch 16,8 statt 40; schon im SI-F-Basisstand so (SI-0). | **verschoben:** Kalibrierung des Belastungsmodells v158 gehört nicht zu den SI-Parametern (Karriere-`loadParameters`); Nutzerentscheidung oder eigenes Paket. |

## Kalibrierungsrunde

Drei Iterationen mit je 192 gepaarten Partien (96 Vereine × 2 Feldgrößen, Seed-Satz `p01r132`, auf Lane A und C geteilt). Die Reihenfolge folgt dem Plan:
- (a) Platzierung und Torwart
- (b) Persönlichkeit und Schussfenster
- (c) Flanken
- (d) Kontakt und Pressing
- (e) zuletzt die Uhr

Basis ist die Protokollserie von Reihe A (`sik-tr-a`/`sik-tr-c`, partieweise digestgleich mit `sik-a`). Die Kandidaten für (a) stammen aus der Offline-Auswertung des SI-3-Modells auf den protokollierten Schüssen der jeweils letzten Serie (`work/calibrate-si-k-finish-v183.cjs`). Sie traf die Messung auf ±0,6 Punkte Tore je Schuss.

| Kennzahl (beide Feldgrößen) | Basis (A, p01r132) | Iteration 1 | Iteration 2 | Iteration 3 = Endwerte | Ziel |
| --- | ---: | ---: | ---: | ---: | --- |
| Uhrrate | 0,42 | 0,42 | 0,42 | **0,36** | – |
| Dauer (min) | 4,22 | 4,33 | 4,28 | 4,98 | 4,8–5,2 |
| Schüsse | 13,22 | 13,08 | 12,98 | 15,46 | 12–16 |
| Tore | 2,99 | 3,57 | 3,36 | 3,94 | 3–5, ≈4 |
| Tore je Schuss | 22,2 % | 27,1 % | 25,6 % | 25,2 % | 25–32 % |
| 0:0 / ≥7 Tore | 9,4 / 6,3 % | 4,7 / 10,9 % | 5,7 / 7,3 % | 4,2 / 15,6 % | ≤6 %; 5–15 % |
| Favoriten ≥1 / Tordifferenz je Stärkepunkt | 72 % / 0,73 | 81 % / 0,87 | 75 % / 0,81 | 80 % / 1,01 | ≥62 %; ≥0,35 |
| Abschlussverhältnis / Torwartabstand | 2,56 / 9,3 | 2,87 / 11,3 | 2,11 / 17,7 | 2,71 / 19,6 | ≥1,8; ≥10 |
| Fernschussanteil / von Abschluss ≥13 / Tore Abschluss ≥14 | 33,6 / 53 / 22 % | 23,0 / 67 / 27 % | 24,4 / 66 / 20 % | 23,1 / 68 / 24 % | 12–20; ≥75; 15–25 % |
| Kopfball-/Volleyschüsse / Ecken / Freistöße | 0,47 / 1,36 / 2,78 | 0,58 / 1,46 / 2,88 | 0,48 / 1,31 / 2,82 | 0,68 / 1,59 / 3,30 | ≥0,6; ≥1,2; ≤4,5 |
| Abprallerschüsse ≤5 s | 0,60 | 0,55 | 0,55 | 0,68 | ≥0,3 |
| Großes Feld / Standard: Schüsse / Tore | 88,4 / 89,8 % | 89,2 / 85,9 % | 88,7 / 78,9 % | 92,4 / 94,8 % | ≥85 % |
| Ballführer Höchsttempo je Partie (m/s) | 7,03 | 7,30 | 7,31 | 7,32 | – |

Gepaarte Differenzen (±95 %):
- Iteration 1 gegen Basis: Tore +0,58 ±0,33, Schüsse −0,14 ±0,45, Fernschüsse −1,40 ±0,35.
- Iteration 2 gegen 1: Tore −0,21 ±0,29.
- Iteration 3 gegen 2: Dauer +0,71 ±0,07 min, Schüsse +2,48 ±0,46, Tore +0,57 ±0,33.

**Iteration 1**
- (a) `finish.spreadBase` 0,037 → 0,032, `spreadSkill` 0,584 → 0,5, `spreadFlat` 2,22 → 1,6, `reachBase` 1,39 → 1,2, `reachGk` 0,066 → 0,08.
- (b) `options.windowBase`/`windowFin` 16/0,55 → 12,5/0,75: über 22 m erst ab wirksamem Abschluss 12,7 statt 10,9, Abschluss 18 reicht bis 26 m. Persönlichkeitsspanne `weightMin`/`weightMax` 0,85–1,15 → 0,8–1,2.
- Ballführer-Laufziel `offball.carrierBrakeLead` 0,25 (siehe Klärung der offenen Punkte).

Ergebnis: Tore je Schuss stiegen wie offline erwartet (26,4 % erwartet, 27,1 % gemessen). Auf dem Standardfeld kommen Fernschüsse fast nur noch von guten Schützen (94 %). Gute Fernschützen trafen mit 27 % zu oft.

**Iteration 2**
- (a) Feinjustierung: `spreadBase` 0,035, `spreadFlat` 1,3, `reachGk` 0,09 und `lateralBase` 3,67 → 3,9 (gegen Fernschüsse).
- (d) `defence.counterWindow`/`counterWindowPress` 2/3 s → 0.

Ergebnis: Fernschüsse mit Abschluss ≥14 sanken auf 20 % Tore je Schuss, der Torwartabstand stieg auf 17,7 Punkte. Das große Feld fiel auf 78,9 % der Tore des Standardfelds. Offline erwartete das Modell für beide Feldgrößen fast gleiche Tore je Schuss (26,0 gegen 26,3 %). Gemessen waren 24,2 gegen 26,8 %; das ist überwiegend Rauschen von 96 Paaren. Trotzdem kostet `lateralBase` beide Feldgrößen ≈0,9 Punkte und trifft das große Feld mit seinen häufigeren Fernschüssen stärker.

**Iteration 3**
- `lateralBase` zurück auf 3,67.
- (e) Uhrrate 0,36 als Vorgabe (`V183_CLOCK_RATE`). Aus 4,28 min bei 0,42 folgt 4,28 · 0,42 / 0,36 ≈ 4,99 min; gemessen wurden 4,98 min.

Mit der langsameren Uhr wachsen Schüsse um rund 19 % und Tore um rund 17 %, weil alle Takte in Echtzeit stehen (SI-0). Nachtrag: Diese Rate erfüllt die Dauer nur ohne Torwiederholungen. Nach der Nutzerentscheidung „all-inclusive einschließlich Torwiederholungen“ ist die Endrate 0,385 (Reihe B2).

**(c) Flankenerreichbarkeit** wurde nicht verstellt. Ohne Spielflanken (siehe Befund oben) hätte eine geänderte Erreichbarkeit nur Ecken betroffen, deren Ankunft das Ziel schon erfüllt (45–50 %).

**(d) Kontaktfenster und Pressingtempo** bleiben bei 0,25 s und 1,58 (B03 wie veröffentlicht). Die Freistöße liegen mit 2,8–3,5 weit unter dem Budget, und weniger Pressing würde die Favoriten weiter stärken. Die Kontaktprüfung vor der Entscheidung (S4) wurde nicht übernommen: Sie verlangt eine Codeänderung, senkt den Angriffserfolg und löst kein verfehltes Ziel.

Damit sind die drei Iterationen verbraucht. Was danach noch fehlt, steht unter „Offene Punkte nach SI-K“.

### Parameteränderungen (Vorgaben neuer Partien)

| Parameter | vorher | SI-K | Wirkung (gemessen) |
| --- | ---: | ---: | --- |
| Uhrrate `match.si.clockRate` (`V183_CLOCK_RATE`, Kern) | 0,78 (`MATCH_SPEED`) | **0,385** (Zwischenstand 0,36) | all-inclusive mit Torwiederholungen 5,02 min, 90 % in 4–6 min (B2); ohne Wiederholungen 4,73 min |
| `finish.spreadBase` / `spreadSkill` / `spreadFlat` | 0,037 / 0,584 / 2,22 | 0,035 / 0,5 / 1,3 | aufs Tor 45 → 51 %, Tore je Schuss +4–5 Punkte; Nahbereich bleibt fähigkeitssteil (Verhältnis 2,57) |
| `finish.reachBase` / `reachGk` | 1,39 / 0,066 | 1,2 / 0,09 | Tore je Schuss aufs Tor 48 → 53 %; Torwartabstand 14 → 17 Punkte |
| `options.windowBase` / `windowFin` | 16 / 0,55 | 12,5 / 0,75 | Fernschüsse 4,1 → 3,4 je Partie trotz +19 % Spielzeit; Standardfeld 15 % Anteil, 93 % von Abschluss ≥13 |
| `options.weightMin` / `weightMax` | 0,85 / 1,15 | 0,8 / 1,2 | Schüsse des oberen `shootWeight`-Drittels bei gleichem Abschluss 3,17 → 3,70 je Partie |
| `offball.carrierBrakeLead` (neu) | – (2 m fest) | 0,25 m | Ballführer-Höchsttempo +0,25 m/s (groß +0,41); Ergebnisse im Rauschen |
| `defence.counterWindow` / `counterWindowPress` | 2 / 3 s | 0 / 0 | Gegenpressing-Fenster aus (SI-4-Szenen ohne Rückgewinn-Vorteil); Mechanismus per Parameter erhalten |

Alle übrigen Vorgaben bleiben. Das gilt nach der Ballführer-Korrektur auch für `carrierPace` 1,5 und die SI-5-Gains (`carrierPaceGain` 1, `carrierCloseGain` 0,5, `runPaceGain` 0,75, `windowGain` 12).

Einziger neuer Schlüssel ist `offball.carrierBrakeLead`. Gespeicherte 183-Partien ohne diesen Schlüssel lesen die Vorgabe 0,25. Weil Kennung 183 noch nicht veröffentlicht ist, gibt es keine Nutzerspielstände mit 183. Gespeicherte 183-Partien behalten ihre gespeicherten Werte einschließlich `clockRate`; `match.si` wird beim Laden nie ergänzt.

## Abnahmereihe B2 (Endwerte, Uhr 0,385, all-inclusive)

Der Nutzer hat entschieden: Die Spieldauer gilt all-inclusive, Torwiederholungen zählen also mit („P01-Ziele 14. Oktober 2026“). Deshalb wurde die Uhrrate (Schritt e) nach Reihe B von 0,36 auf **0,385** gesetzt. Grundlage war die Hochrechnung aus Reihe B: Dauer ∝ 1/Rate, mit 4,56 s je Tor. Sie erwartete 5,02 min und 90,5 % der Partien in 4–6 min; gemessen wurden 5,02 min und 90 %.

Die Messhülle misst die Torwiederholung jetzt selbst. Die Harness schaltet Wiederholungen ab (`v103CanReplay` ist falsch). `v103StartReplay` wird trotzdem in genau dem Moment aufgerufen, in dem das Spiel die Wiederholung starten würde. Ein lesender Wrapper berechnet dort die Dauer wie das Spiel:
- Frames von 2,5 Uhreinheiten vor bis 0,85 nach dem Tor, geteilt durch 0,72;
- 2,2 s bei einem Elfmetertor;
- keine Wiederholung bei weniger als zwei Frames.

Jede Partie speichert diese Dauern (`extras.sik.replays`, `replaySeconds`). „All-inclusive“ ist gerechnete Echtzeit plus Wiederholungen. Der Rauchtest war partieweise digestgleich mit Reihe B, der Wrapper zieht also nicht.

576 Partien (`sik-b2`, `sik-b2-si183b`, `sik-b2-si183c`), Uhr 0,385 per Vorgabe, keine Überschreibungen. 0 Ausfälle, 0 Engine-Fehler, keine Pausenticks, `dist` unverändert.

| Kennzahl | Reihe A | **B2 beide** | Standard | groß | Ziel | |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| Dauer all-inclusive mit Torwiederholungen (min) | – | **5,02** | 5,06 | 4,97 | 4,8–5,2 | ✓ |
| Anteil in 4–6 min (all-inclusive) | – | **90 %** | 89 % | 91 % | ≥85 % | ✓ |
| kürzeste / längste Partie (all-inclusive) | – | 3,57 / 7,64 | 3,84 / 7,64 | 3,57 / 7,00 | keine unter 3,7 | ✗ (1 von 576: ein 0:0 auf dem großen Feld, 3,57 min) |
| Dauer ohne Torwiederholungen (Node) | 4,19 | 4,73 | 4,75 | 4,70 | – | Information |
| Torwiederholung je Tor / je Partie | – | 4,55 s / 17,5 s | 18,4 s | 16,5 s | – | |
| Schüsse / Anteil 10–18 | 13,03 / 85 % | **14,15** / 82 % | 14,88 | 13,43 | 12–16; ≥45 % | ✓ |
| aufs Tor | 45 % | 51 % | 51 % | 50 % | ≥38 % | ✓ |
| Tore (Standardabweichung) | 2,87 (2,07) | **3,84** (2,26) | 4,05 (2,38) | 3,63 (2,11) | 3–5, ≈4 | ✓ |
| Tore je Schuss | 21,7 % | **26,7 %** | 26,7 % | 26,7 % | 25–32 % | ✓ |
| 0:0 | 10,2 % | **2,6 %** | 1,4 % | 3,8 % | ≤6 % | ✓ |
| Partien mit ≥7 Toren / höchste Torzahl | 4,5 % / 13 | **12,8 %** / 14 | 16,3 % / 14 | 9,4 % / 11 | 5–15 % | ✓ (Standardfeld allein 16,3 %) |
| Anteil 3–5 Tore | 41 % | 46 % | 46 % | 45 % | – | |
| Favorit ≥1 Punkt: **Sieg** / Remis / Niederlage (N) | 74 / – / – (405) | **78** / 14 / 8 % (405) | 81 / 11 / 9 % (199) | 76 / 17 / 7 % (206) | Sieg rund 65 % (Grenze ≥62 %; groß ≥60 %) | ✓ Grenze, über 72 % → Hebel unten |
| Favorit ≥2 Punkte: Sieg | 81 % | 86 % | 88 % | 85 % | – | |
| Tordifferenz je Stärkepunkt | 0,71 | 0,86 | 0,91 | 0,81 | ≥0,35 | ✓ |
| Abschluss <10 / 10–14 / ≥14 (Tore je Spielzugschuss) | 13 / 18 / 36 % | 19 / 23 / 40 % | 18 / 23 / 40 % | 19 / 24 / 39 % | – | |
| Verhältnis Abschluss ≥14 / <10 | 2,68 | **2,14** | 2,23 | 2,05 | ≥1,8 | ✓ |
| Torwart <10 / 10–14 / ≥14 (Tore je Schuss aufs Tor) | – / 52 / 38 % | 64 / 57 / 43 % | 60 / 56 / 43 % | 69 / 57 / 42 % | – | |
| Torwartabstand (10–14 gegen ≥14) | 14,1 | **14,3** | 13,6 | 15,1 | ≥10 Punkte | ✓ |
| Fernschüsse: Anteil / von Abschluss ≥13 | 31,8 / 53 % | 22,8 / 64 % | **13,6 / 92 %** | 32,9 / 51 % | Standard 12–20 %; ≥75 % | ✓ (Standard); groß: Information (Entscheidung 16. Oktober) |
| Fernschüsse Abschluss ≥14: Tore je Schuss (aufs Tor) | 19 % | **22 %** (52 %) | 23 % | 20 % | 15–25 % | ✓ |
| Flanken gesamt / aus dem Spiel | 1,33 / 0 | 1,52 / **0** | 1,63 / 0 | 1,41 / 0 | Spiel ≥2,0 | ✗ → Zusatzpaket (B22) |
| angekommen (fast nur Ecken) | 45 % | 48 % | 46 % | 50 % | ≥45 % | ✓ |
| Kopfball-/Volleyschüsse (Tore je Schuss) | 0,51 (32 %) | **0,64** (35 %) | 0,69 | 0,58 | ≥0,6 | ✓ |
| Ecken / Schüsse ≤10 s danach | 1,35 / 0,06 | **1,56** / 0,09 | 1,70 | 1,42 | 1,2–3,0 | ✓ |
| Abprallergewinn der Angreifer ≤3 s | 26 % | 26 % | 25 % | 27 % | ≥35 % | ✗ (verschoben) |
| Abprallerschüsse ≤5 s (Ledger-Kette) | 0,60 (p01r132) | **0,62** | 0,68 | 0,56 | ≥0,3 | ✓ |
| Fouls / Freistöße / Elfmeter | 2,77 / 2,87 / 0,03 | 3,14 / **3,24** / 0,03 | 3,62 / 3,67 | 2,66 / 2,81 | Freistöße ≤4,5 | ✓ |
| Großes Feld / Standard: Schüsse / Tore | 87,8 / 88,6 % | **90,3 / 89,6 %** | | | ≥85 % | ✓ |
| Zonenzeit ≤22 m (s je Team) | 3,19 | 3,93 | 4,41 | 3,46 | groß ≥2,7 s | ✓ |
| Ballführer Tempo Mittel / Höchstwert (m/s) | 3,24 / 7,08 | 3,32 / 7,34 | 3,12 / 6,93 | 3,53 / 7,76 | – | |
| Frische Feldspieler / Kondition 9–11 / Torwart (Verbrauch) | 54,1 / 51,3 / 83,2 (16,8) | 54,1 / 51,4 / 82,4 (17,6) | 55,0 | 53,3 | Feld 40 ± 5 | ✗ (vorbestehend) |
| Rechenzeit je Tick Median / p95 (ms) | 3,13 / 3,99 | 3,63 / 6,28 | | | – | 18 Seiten und parallele Tests |

Gepaart gegen die erste Reihe B (Uhr 0,36, 576 Paare, ±95 %):
- Dauer ohne Wiederholungen −0,33 ±0,04 min.
- Schüsse −0,97 ±0,27, Tore −0,32 ±0,21, Freistöße −0,27 ±0,21.
- Die übrigen Kennzahlen liegen im Rauschen.

Je Seed-Satz (p01r132 / si183b / si183c, beide Feldgrößen):

| Kennzahl | p01r132 | si183b | si183c |
| --- | ---: | ---: | ---: |
| Dauer all-inclusive (min) | 4,95 | 4,98 | 5,12 |
| Anteil in 4–6 min | 92 % | 93 % | 85 % |
| Schüsse | 14,23 | 14,03 | 14,20 |
| Tore | 3,59 | 3,72 | 4,20 |
| Tore je Schuss | 24,8 % | 26,2 % | 29,1 % |
| ≥7 Tore | 9,9 % | 10,4 % | 18,2 % |
| Favorit Sieg / Remis / Niederlage | 75 / 16 / 9 % | 78 / 13 / 10 % | 82 / 14 / 4 % |
| Großes Feld / Standard: Schüsse / Tore | 90,2 / 92,2 % | 90,8 / 92,5 % | 89,8 / 85,1 % |

**Torverteilung**, Anteil der Partien (beide / Standard / groß):

| Tore | beide | Standard | groß |
| --- | ---: | ---: | ---: |
| 0 | 2,6 % | 1,4 % | 3,8 % |
| 1 | 10,2 % | 10,4 % | 10,1 % |
| 2 | 20,0 % | 18,4 % | 21,5 % |
| 3 | 17,5 % | 17,7 % | 17,4 % |
| 4 | 14,9 % | 15,3 % | 14,6 % |
| 5 | 13,2 % | 12,8 % | 13,5 % |
| 6 | 8,7 % | 7,6 % | 9,7 % |
| 7 | 5,9 % | 6,3 % | 5,6 % |
| 8 | 3,8 % | 5,6 % | 2,1 % |
| 9 | 1,4 % | 2,1 % | 0,7 % |
| 10–14 | 1,8 % | 2,4 % | 1,0 % |

Die Streuung bleibt breit (Standardabweichung 2,26); 4:3 und höher kommt in 12,8 % der Partien vor.

**Schussquellen** je Partie (Tore je Schuss):

| Quelle | je Partie | Tore je Schuss |
| --- | ---: | ---: |
| Spielzug ≤22 m | 8,38 | 30 % |
| Fernschuss | 3,00 | 16 % |
| Folge eines Freistoßes ≤10 s | 1,33 | 23 % |
| Kopfball/Volley | 0,64 | 35 % |
| Abpraller ≤5 s | 0,52 | 38 % |
| direkter Freistoß | 0,17 | 23 % |
| Folge einer Ecke | 0,09 | 50 % |
| Elfmeter | 0,03 | – |

**Fähigkeitsabstufung**
- Abschluss: 19 / 23 / 40 % (<10 / 10–14 / ≥14), Verhältnis 2,14.
- Torwart: Tore je Schuss aufs Tor 64 / 57 / 43 % (<10 / 10–14 / ≥14).
- Luftspiel: Kopfball-/Volleytore je Schuss 26 / 31 / 52 % (n 46 / 238 / 82).
- Fernschüsse: Abschluss 10–14 trifft zu 12 %, Abschluss ≥14 zu 22 %.

**Persönlichkeit**
- Schüsse je Spieler und Partie: Stoßstürmer 3,11, Torjäger 2,78 (Fernschüsse 0,95), Box-to-Box 1,62, Zielspieler 1,08, Dribbler 0,87, Spielmacher 0,51, Verteidigerrollen 0,19–0,36.
- Bei gleichem Abschluss (11–14) schießt das obere `shootWeight`-Drittel 3,40-mal je Partie, das mittlere 1,25-mal, das untere 1,04-mal; Fernschüsse 0,89 / 0,25 / 0,13.
- Unter Druck treffen Spieler mit Ruhe ≥12 zu 32 %, mit Ruhe <10 zu 16 %.

**Belastung v158**
- Frische unverändert (Feldspieler 54,1, Torwarte 82,4).
- Kein Abbruch beim Abpfiff.

### Favoriten: Siegquote und Hebel (nicht verstellt)

Die Siegquote des Favoriten (≥1 Punkt Stärkeabstand) liegt bei 78 % (Standard 81 %, groß 76 %), also deutlich über dem Wunsch „rund 65 %“, aber über der Abnahmegrenze 62 %. Remis 14 %, Niederlagen 8 %. Je Stärkeabstand (Tabelle unten): bei 1–2 Punkten 66 % (Standard) bzw. 57 % (groß), bei ≥3 Punkten 92–94 %.

Die Hebel und was sie mitbewegen (nach Wirkung geordnet; keiner wurde verstellt):

1. **Fähigkeitssteilheit des Abschlusses (SI-3):** `finish.spreadSkill`/`spreadPower`, also wie stark die Streuung mit dem Abschluss wächst.
   - Flacher heißt: schwache Schützen treffen häufiger, der Favoritenvorteil sinkt.
   - Grenze: Abschlussverhältnis ≥1,8 (heute 2,14, wenig Reserve).
2. **Torwartabstufung (SI-3):** `finish.reachGk`, `lateralGk`, `reactionGk`.
   - Kleinere Werte heißen: Torwartstärke wirkt weniger.
   - Grenze: Torwartabstand ≥10 Punkte (heute 14,3).
3. **Entscheidungsqualität (SI-1):** `options.noise`, das Bewertungsrauschen nach `dec`.
   - Mehr Rauschen gleicht die Optionswahl beider Teams an und hilft dem Außenseiter.
   - Nebenwirkung: weniger klare Spielzüge, Entscheidungen sichtbar schwächer.
4. **Tempo und Zweikampf:** SI-2 `carrierPace`, SI-4 `pressPace` und `contactWindow`.
   - Schnellere, technisch bessere Teams profitieren vom Ballführertempo.
   - Ein gleichmäßigeres Tempo senkt den Vorteil, verändert aber auch B02 und B03.
5. **Torzahl selbst:** Weniger Tore heißt mehr Remis.
   - Unerwünscht, weil das Torziel 3–5 gilt.

Ein Ziel „Sieg rund 65 %“ verlangt etwa −13 Punkte. Mit den Hebeln 1 und 2 allein reicht das wahrscheinlich nicht, ohne die Abnahmegrenzen für Abschluss und Torwart zu verletzen. Hebel 3 wäre der erste Kandidat für eine gepaarte 192er-Serie. Die Entscheidung liegt beim Nutzer.

### Je Stärkeabstand und Feldgröße (Übergabe an SI-6/P02, Reihe B2)

| Feld | Abstand | Partien | Sieg Favorit | Remis | Niederlage | Tore | Tordifferenz Favorit | Schüsse |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Standard | <1 | 89 | 54 % | 20 % | 26 % | 3,13 | 0,51 | 14,93 |
| Standard | 1–2 | 62 | 66 % | 16 % | 18 % | 3,48 | 1,71 | 14,08 |
| Standard | 2–3 | 50 | 76 % | 14 % | 10 % | 3,56 | 1,80 | 14,24 |
| Standard | ≥3 | 87 | 94 % | 5 % | 1 % | 5,67 | 4,01 | 15,76 |
| groß | <1 | 82 | 43 % | 27 % | 30 % | 3,49 | 0,41 | 13,94 |
| groß | 1–2 | 69 | 57 % | 28 % | 16 % | 2,78 | 0,93 | 12,78 |
| groß | 2–3 | 48 | 73 % | 23 % | 4 % | 3,19 | 1,90 | 12,33 |
| groß | ≥3 | 89 | 92 % | 7 % | 1 % | 4,65 | 3,39 | 14,06 |

Bei „<1“ ist der Favorit das Team mit dem höheren mittleren `ovr`, auch wenn der Abstand klein ist. Rohdaten: `outputs/si183/sik-b2*.json` (gitignoriert). Neu erzeugen mit `work/table-si-calibration-v183.cjs sik-b2,sik-b2-si183b,sik-b2-si183c --strength [--json]`.

## Abnahmereihe B, erste Fassung (Uhr 0,36, Dauer ohne Torwiederholungen)

Vorstufe zu B2. Mit Uhr 0,36 dauerte die Partie in der Node-Messung 5,05 min, aber ohne Torwiederholungen; all-inclusive waren es ≈5,4 min (siehe Wanduhr). Die übrigen Kennzahlen gelten als Vergleich bei 7 % mehr Spielzeit.


576 Partien wie Reihe A, ohne Überschreibungen (`sik-b`, `sik-b-si183b`, `sik-b-si183c`). 0 Ausfälle, 0 Engine-Fehler, keine Pausenticks, `dist` unverändert. Zielspalte: ✓ erfüllt, ✗ verfehlt.

| Kennzahl | Reihe A | Reihe B beide | Standard | groß | Ziel | |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| Dauer (min) / 4–6 min / kürzeste | 4,19 / 62 % / 3,09 | **5,05** / 96 % / 3,72 | 5,08 / 97 % / 4,08 | 5,02 / 95 % / 3,72 | 4,8–5,2; ≥85 %; ≥3,7 | ✓ |
| Schüsse / Anteil 10–18 | 13,03 / 85 % | **15,13** / 80 % | 15,92 / 77 % | 14,33 / 83 % | 12–16; ≥45 % | ✓ |
| aufs Tor | 45 % | 51 % | 52 % | 50 % | ≥38 % | ✓ |
| Tore (Standardabweichung) | 2,87 (2,07) | **4,16** (2,49) | 4,45 (2,52) | 3,86 (2,42) | 3–5, ≈4 | ✓ |
| Tore je Schuss | 21,7 % | **27,1 %** | 27,5 % | 26,6 % | 25–32 % | ✓ |
| 0:0 | 10,2 % | **4,3 %** | 3,5 % | 5,2 % | ≤6 % | ✓ |
| Partien mit ≥7 Toren / höchste Torzahl | 4,5 % / 13 | **17,2 %** / 14 | 19,8 % / 14 | 14,6 % / 13 | 5–15 % | ✗ (knapp) |
| Anteil 3–5 Tore | 41 % | 44 % | 47 % | 42 % | – | |
| Favoriten ≥1 Punkt (N) / ≥2 | 74 % / 81 % | **81 %** (405) / 90 % | 82 % / 91 % | 81 % / 89 % | ≥62 %, groß ≥60 % | ✓ |
| Tordifferenz je Stärkepunkt | 0,71 | 1,03 | 1,06 | 1,00 | ≥0,35 | ✓ |
| Abschluss ≥14 / 10–14 / <10 (Tore je Spielzugschuss) | 36 / 18 / 13 % | 41 / 23 / 16 % | 42 / 23 / 17 % | 41 / 24 / 15 % | – | |
| Verhältnis Abschluss ≥14 / <10 | 2,68 | **2,57** | 2,48 | 2,66 | ≥1,8 | ✓ |
| Torwart 10–14 / ≥14 (Tore je Schuss aufs Tor) | 52 / 38 % | 58 / 41 % | 58 / 40 % | 57 / 42 % | – | |
| Torwartabstand | 14,1 | **17,1** | 18,2 | 15,9 | ≥10 Punkte | ✓ |
| Fernschüsse: Anteil / von Abschluss ≥13 | 31,8 % / 53 % | **23,0 %** / 65 % | 15,0 % / 93 % | 31,7 % / 51 % | 12–20 %; ≥75 % | ✗ (Standard ✓, groß ✗) |
| Fernschüsse Abschluss ≥14: Tore je Schuss (aufs Tor) | 19 % | **24 %** (53 %) | 26 % | 23 % | 15–25 % | ✓ |
| Flanken gesamt / aus dem Spiel | 1,33 / 0 | 1,58 / **0** | 1,71 / 0 | 1,45 / 0 | Spiel ≥2,0 | ✗ |
| angekommen (fast nur Ecken) | 45 % | 46 % | 44 % | 48 % | ≥45 % | ✓ |
| Kopfball-/Volleyschüsse (Tore je Schuss) | 0,51 (32 %) | **0,64** (38 %) | 0,67 | 0,61 | ≥0,6 | ✓ |
| Ecken / Schüsse ≤10 s danach | 1,35 / 0,06 | **1,63** / 0,08 | 1,76 | 1,50 | 1,2–3,0 | ✓ |
| Abprallergewinn der Angreifer ≤3 s | 26 % | 26 % | 24 % | 27 % | ≥35 % | ✗ |
| Abprallerschüsse ≤5 s (Kette) | 0,60 (p01r132) | **0,64** | 0,67 | 0,61 | ≥0,3 | ✓ |
| Fouls / Freistöße / Elfmeter | 2,77 / 2,87 / 0,03 | 3,39 / **3,51** / 0,02 | 3,93 / 3,96 | 2,85 / 3,06 | Freistöße ≤4,5 | ✓ |
| Großes Feld / Standard: Schüsse / Tore / Zonenzeit | 87,8 / 88,6 / 85,6 % | **90,0 / 86,9** / 84,3 % | | | ≥85 % | ✓ (gepoolt) |
| Frische Feldspieler / Kondition 9–11 / Torwart (Verbrauch) | 54,1 / 51,3 / 83,2 (16,8) | 54,2 / 51,5 / 82,1 (17,9) | 55,1 | 53,2 | Feld 40 ± 5 | ✗ (vorbestehend) |
| Rechenzeit je Tick Median / p95 (ms), je Partie (s) | 3,13 / 3,99 / 16,0 | 2,94 / 4,75 / 19,0 | 2,80 | 3,08 | – | 18 Seiten parallel |

Gepaart gegen Reihe A (576 Paare, ±95 %):
- Dauer +0,86 ±0,04 min, Schüsse +2,10 ±0,26, Tore +1,28 ±0,20.
- Fernschüsse −0,67 ±0,21, Ecken +0,28 ±0,16, Kopfball-/Volleyschüsse +0,13 ±0,09, Freistöße +0,64 ±0,20.
- Ballführer-Höchsttempo +0,25 ±0,05 m/s, Frische +0,07 ±0,23.

Je Seed-Satz (p01r132 / si183b / si183c, beide Feldgrößen):

| Kennzahl | p01r132 | si183b | si183c |
| --- | ---: | ---: | ---: |
| Dauer (min) | 4,98 | 5,08 | 5,09 |
| Schüsse | 15,46 | 14,95 | 14,96 |
| Tore | 3,94 | 4,22 | 4,31 |
| Tore je Schuss | 25,2 % | 27,8 % | 28,4 % |
| ≥7 Tore | 15,6 % | 18,8 % | 17,2 % |
| Favoriten | 80 % | 81 % | 82 % |
| Großes Feld / Standard: Schüsse / Tore / Zonenzeit | 92,4 / 94,8 / 93,6 % | 87,0 / 83,7 / 83,0 % | 90,6 / 83,2 / 77,7 % |

Gepoolt liegt das Torverhältnis über 85 %, in zwei der drei Seed-Sätze knapp darunter.

**Torverteilung** (Anteil der Partien):

| Tore | beide | Standard | groß |
| --- | ---: | ---: | ---: |
| 0 | 4,3 % | 3,5 % | 5,2 % |
| 1 | 9,7 % | 8,3 % | 11,1 % |
| 2 | 14,2 % | 10,8 % | 17,7 % |
| 3 | 15,5 % | 15,3 % | 15,6 % |
| 4 | 14,9 % | 17,0 % | 12,8 % |
| 5 | 13,7 % | 14,2 % | 13,2 % |
| 6 | 10,4 % | 11,1 % | 9,7 % |
| 7 | 7,3 % | 9,0 % | 5,6 % |
| 8 | 4,5 % | 3,5 % | 5,6 % |
| 9 | 3,1 % | 3,8 % | 2,4 % |
| 10–14 | 2,3 % | 3,4 % | 0,9 % |

Die Streuung bleibt breit (Standardabweichung 2,49 bei einem Mittel von 4,16); Partien mit 7 oder mehr Toren, etwa 4:3, machen 17 % aus. Viele Tore fallen in ungleichen Partien: Bei ≥3 Punkten Stärkeabstand sind es 6,2 Tore (Standard) bzw. 5,6 Tore (groß).

**Schussquellen** (je Partie, Tore je Schuss):

| Quelle | je Partie | Tore je Schuss |
| --- | ---: | ---: |
| Spielzug ≤22 m | 8,88 | 29 % |
| Fernschuss | 3,23 | 17 % |
| Folge eines Freistoßes ≤10 s | 1,52 | 26 % |
| Kopfball/Volley | 0,64 | 38 % |
| Abpraller ≤5 s (ohne die als Kopfball, Ecken- oder Freistoßfolge gezählten) | 0,55 | 39 % |
| direkter Freistoß | 0,20 | 24 % |
| Folge einer Ecke | 0,08 | 44 % |
| Elfmeter | 0,02 | – |

**Fähigkeitsabstufung**
- Abschluss: 16 / 23 / 41 % Tore je Spielzugschuss (<10 / 10–14 / ≥14), Verhältnis 2,57.
- Torwart: Tore je Schuss aufs Tor 56 % (gk <10), 58 % (10–14), 41 % (≥14).
- Luftspiel: Kopfball-/Volleytore je Schuss 27 / 35 / 49 % (<10 / 10–14 / ≥14, n 48 / 223 / 99).
- Fernschüsse über 22 m: Abschluss 10–14 trifft zu 11 %, Abschluss ≥14 zu 24 % (53 % aufs Tor). Ein Fernschuss wird vor allem dann zum Tor, wenn er genau in die Ecke geht.

**Persönlichkeit**
- Schüsse je Spieler und Partie nach Rolle: Stoßstürmer 3,27, Torjäger 3,19 (davon Fernschüsse 1,08), Box-to-Box 1,74, Zielspieler 1,12, Dribbler 0,81, Spielmacher 0,54, Verteidigerrollen 0,18–0,36.
- Bei gleichem Abschluss (11–14, im Mittel 12,1–12,4) schießen Spieler mit hohem `shootWeight` (1,03) 3,70-mal je Partie, mit mittlerem (0,86) 1,18-mal und mit niedrigem (0,72) 1,10-mal. Fernschüsse: 0,98 gegen 0,15.
- Die Gewichte entstehen aus Rolle, Ruhe und Entscheidungen; Rolle und Position sind dabei nicht getrennt.
- Unter Druck (Gegner ≤2,5 m) treffen Spieler mit Ruhe ≥12 zu 33 %, mit Ruhe <10 zu 13 %. Im Modell dämpft Ruhe nur den Druckanteil der Streuung; der gemessene Unterschied enthält auch Abschluss und Rolle.

**Belastung v158**
- Frische nach Abpfiff unverändert gegenüber Reihe A (+0,07 ±0,23): Feldspieler 54,2 (Standard 55,1, groß 53,2), Torwarte 82,1 (Verbrauch 17,9 statt 16,8).
- Die längere Echtzeit ändert die Feldspieler nicht, weil SI-0 das Zweikampfgewicht mit Rate/0,78 skaliert. Torwarte verbrauchen etwas mehr, weil es mehr Paraden gibt.
- Kein Abbruch beim Abpfiff in 576 Partien (B21).

### Je Stärkeabstand und Feldgröße, erste Fassung (ersetzt durch B2)

Reihe B mit Uhr 0,36; Stärkeabstand = Unterschied des mittleren `ovr` beider Teams.

| Feld | Abstand | Partien | Sieg Favorit | Remis | Tore | Tordifferenz Favorit | Schüsse |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Standard | <1 | 89 | 43 % | 25 % | 3,84 | 0,38 | 16,10 |
| Standard | 1–2 | 62 | 61 % | 19 % | 3,47 | 1,08 | 14,81 |
| Standard | 2–3 | 50 | 82 % | 10 % | 3,76 | 2,36 | 15,08 |
| Standard | ≥3 | 87 | 97 % | 3 % | 6,16 | 4,78 | 17,01 |
| groß | <1 | 82 | 46 % | 27 % | 2,83 | 0,41 | 14,16 |
| groß | 1–2 | 69 | 64 % | 26 % | 3,06 | 1,14 | 13,80 |
| groß | 2–3 | 48 | 73 % | 17 % | 3,50 | 2,00 | 13,77 |
| groß | ≥3 | 89 | 98 % | 1 % | 5,64 | 4,47 | 15,21 |

Rohdaten je Partie liegen in `outputs/si183/sik-b*.json` (gitignoriert). `work/table-si-calibration-v183.cjs sik-b,sik-b-si183b,sik-b-si183c --strength --json` erzeugt die Tabelle neu.

## Wanduhr (10 Browserpartien)

`work/measure-wallclock-si183.cjs` spielt echte Partien im Browser auf der Produktionsschleife (`v65StartLoop`: `setInterval` 40 ms, Schritte auf 50 ms gedeckelt) mit der vorhandenen Unity-WebGL-Ansicht (`outputs/platform/unity-web`, kein neuer Build).
- Die Partien sind all-inclusive gemessen: Torszenen, Torwiederholungen, Banner und Wiederanstöße zählen mit.
- Es gibt keine Taktikpausen: Die Halbzeitpause wird sofort fortgesetzt.
- Die Partien laufen im Querformat 900 × 430; nur dann startet Unity (`v98Orientation`).
- Die Vereine wechseln, Standard- und Großfeld abwechselnd.
- Neben der Wanduhr wird die Summe der tatsächlich gerechneten Echtzeitschritte erfasst. Diese Summe zählt auch die Node-Harness; die Differenz zur Wanduhr ist durch Ruckler verlorene Zeit.
- Unity war in allen Partien bereit. `dist` und der Unity-Build waren vor und nach dem Lauf hashgleich.

| Lauf | Partien | Wanduhr Mittel (min) | Spanne | gerechnete Zeit (min) | Bemerkung |
| --- | ---: | ---: | --- | ---: | --- |
| Software-Rendering (SwiftShader), headless, 2 Seiten parallel | 10 | 5,97 | 4,80–7,37 | – (vor der Erweiterung um die gerechnete Zeit) | Hauptthread blockiert bis 10 s; Zeitverlust durch die 50-ms-Deckelung |
| GPU (ANGLE/D3D11), headless, 1 Seite | 10 | 6,13 | 4,83–6,77 | 5,88 | Ruckler kosten 7–55 s je Partie (Mittel 15 s); Hauptthread bis 15 s blockiert |
| Node-Harness, Reihe B (ohne Torwiederholungen) | 576 | 5,05 | 3,72–7,0 | 5,05 | Harness schaltet `v103CanReplay` ab |
| Reihe B hochgerechnet mit Torwiederholung (3,35 Uhreinheiten / 0,72 ≈ 4,65 s je Tor außer Elfmeter) | 576 | 5,37 | 3,72–7,63 | – | 81 % in 4–6 min |

Die Browserpartien beginnen mit dem ersten Pflichtspiel eines Spitzenvereins und sind deshalb oft ungleich: im Mittel 6,3 Tore (GPU) bzw. 6,4 Tore (Software), etwa 7:0 und 8:0. Ihre Dauer wird deshalb gegen die Node-Regression bei gleicher Torzahl verglichen. Reihe B wächst um 0,18 min je Tor, bei 6,3 Toren sind das 5,44 min. Mit 6,3 Torwiederholungen à 4,65 s ergeben sich 5,92 min; gerechnet wurden 5,88 min, als Wanduhr 6,13 min.

**Befund:** Die Torwiederholung im echten Spiel kostet je Tor etwa 4,7 s. Die Node-Messung enthält sie nicht. All-inclusive liegt eine durchschnittliche Partie (4,16 Tore) deshalb bei ≈5,4 min statt 5,05 min, auf dem Messrechner mit Rucklern bei ≈5,6 min. Das bleibt im Nutzerfenster 4–6 min, aber über dem Ziel 4,8–5,2 min, und nur 81 % statt ≥85 % der Partien liegen im Fenster. Die Dauer ist praktisch proportional zu 1/Rate (SI-0, Iteration 3). Für 5,0 min einschließlich Wiederholungen wäre die Uhrrate **≈0,385–0,39**; die Ereignisse sänken dabei um ≈7 % (≈14 Schüsse, ≈3,9 Tore). Die drei Iterationen sind verbraucht, deshalb bleibt die Vorgabe 0,36. Siehe Nutzerentscheidung unten.

**Umsetzung (16. Oktober 2026):** Die Uhrrate ist jetzt 0,385. Die Messhülle misst die Wiederholungsdauer je Tor selbst (4,55 s im Mittel, siehe B2). Die Browserpartien liefen noch mit 0,36; sie bestätigen das Modell „gerechnete Zeit + Wiederholungen + Ruckler“. Eine erneute Browserserie mit 0,385 wurde nicht gefahren.

## Offene Punkte nach SI-K

| Punkt | Stand | Einordnung |
| --- | --- | --- |
| Ballführertempo-Bremse | Laufziel hinter dem Bremsweg; Höchsttempo +0,25 m/s, großes Feld bis 7,8 m/s | **behoben** |
| Messdefinition angekommene Flanken / Raumpässe / Abprallerschüsse | Motorzähler `crossComplete`; Raumpässe echt; Abprallerschüsse über die Ledger-Kette | **behoben** (Messung) bzw. **geklärt** |
| Kopfball-xG gegen Ausführung | SI-3 trifft die Ausführung; die Flankenschätzung unterschätzt Ankunft und Kopfballwert | **geklärt**, Teil der B22-Übergabe |
| Uhrrate all-inclusive | 0,385; mit Torwiederholungen 5,02 min, 90 % in 4–6 min | **behoben** (Nutzerentscheidung 16. Oktober) |
| Kürzeste Partie ≥3,7 min | 1 von 576 darunter (0:0 auf dem großen Feld, 3,57 min) | **knapp verfehlt.** Kurze Partien sind torlose; mit der Uhr nicht lösbar, ohne das Mittel zu heben |
| Partien mit ≥7 Toren 5–15 % | 12,8 % (Standard 16,3 %, groß 9,4 %) | **erfüllt** nach der Ratenänderung |
| Spielflanken ≥2,0 | 0 je Partie (B22) | **Zusatzpaket „Flanke in den Raum“** (Nutzerentscheidung 16. Oktober); Übergabe unten |
| Fernschussanteil | Standard 13,6 % / 92 % von Abschluss ≥13 ✓; groß 32,9 % / 51 % | **Information** für das große Feld (Nutzerentscheidung 16. Oktober: groß ≥85 % hat Vorrang, mehr Fernschüsse dort in Ordnung) |
| Favoriten „rund 65 % Siege“ | Sieg 78 % (Standard 81 %, groß 76 %), Remis 14 %, Niederlage 8 % | **Grenze ≥62 % erfüllt, Wunsch 65 % verfehlt.** Hebel siehe B2, Entscheidung beim Nutzer |
| Abprallergewinn ≥35 % | 26 % | **verschoben.** Abprallerschüsse erfüllt (0,62); der Gewinn hängt an Paradenrichtung und torseitig stehenden Verteidigern, kein Kalibrierhebel ohne Nebenwirkung. |
| `counterWindow` (SI-4) | 0 (aus) | **entschieden** |
| Radius 3 m gegen 9 m | getrennt, unterschiedliche Größen | **entschieden** |
| Kontaktprüfreihenfolge S4 | nicht übernommen | **verschoben** (kein verfehltes Ziel, senkt den Angriffserfolg) |
| SI-5 ohne Reserve | 90,3 % Schüsse / 89,6 % Tore, je Seed-Satz ≥85,1 % | **erfüllt** |
| Belastung v158, großes Feld | unauffällig, kein Abbruch | **erledigt** |
| Torwart- und Feldfrische | Feld 54 statt 40 ± 5, Torwartverbrauch 18 statt 40 | **verschoben** (Belastungsmodell, nicht SI) |
| SI-2-Boxszene | Mit den SI-K-Werten wählt der Stoßstürmer in der Testszene knapp den Tiefenlauf statt des zweiten Boxpunkts (9,55 gegen 9,45; vorher 9,23 gegen 9,26). Der Test hält die Szene auf ihrem Entwurfsstand (Rate 0,78, SI-3-Werte vor SI-K). | **eingeordnet**, relevant für das Flankenpaket |

## Übergabe an das Zusatzpaket „Flanke in den Raum“ (B22)

Nutzerentscheidung „Flanken und Fernschüsse 16. Oktober 2026“: Die Spielflanken übernimmt ein eigenes Paket nach SI-K. SI-K ändert daran nichts. Zeilenangaben beziehen sich auf `feat/si-calibration`.

**Messbefund.** In Reihe A und B gibt es keine einzige Flanke aus dem Spiel. Alle Flanken sind Ecken oder Freistoßflanken. Die Protokollserie p01r132 (192 Partien, Uhr 0,42) zeigt je Partie:
- 403 Entscheidungen des Ballführers.
- 52 davon in der Flankenzone von SI-1 (<30 m vor dem Tor, >8 m seitlich), 118 in der weiteren Zone von SI-7 (<36 m, >6 m).
- Nur in 2,6 bzw. 3,5 dieser Entscheidungen steht ein Mitspieler innerhalb 16 m vor dem Tor.
- `v183CrossEstimate` wird nur 1,4-mal mit gültiger Geometrie aufgerufen, mit einer Ankunft von im Mittel 0,10 (Landeanteil 0,15, Duell 0,67) und einem Kopfballwert von 0,05.
- Eine Flanke ist nie unter den drei besten Optionen (`options`-Protokoll).

**Ursachen und Stellen**

| Ursache | Stelle | Wirkung |
| --- | --- | --- |
| Empfänger nur, wenn er schon nah am Tor steht | `dist/match-si-options-v183.js:285–287`: Flankenoption nur bei `range<crossMax` (30 m) und `>crossWide` (8 m) seitlich, Empfänger `q` nur bei `v183OptGoalDistance(q,p.t)<16` und nicht im Abseits. Vorgaben `crossMax`/`crossWide` in `:60`. | Das Ziel ist die **aktuelle Position** eines Mitspielers. Ein Läufer, der mit der Flanke in die Box startet, zählt nicht. |
| Abseitsklammer hält die Läufer an der Abwehrlinie | `dist/world-backpedal-v108.js:41–42` (`v121PreparePositioning`): Angreifer erhalten `plan.limit` = Abseitslinie der Verteidiger (zweitletzter Gegner) plus Sicherheitsabstand nach `pos`. Leser: `dist/world-attack-flow-v152.js:52` (Laufziel `p.ty` geklammert) und SI-2 `dist/match-si-offball-v183.js:162` (Angebotspunkte) und `:253–259` (Klammer je Tick, auch während eines Flugs). | Die neutrale Abwehrlinie steht ≈15,7 m (Standard) bzw. 18,9 m (groß) vor dem eigenen Tor. Boxpunkte von SI-2 (`boxNear` 6 m, `boxSpot` 11 m, `boxFar` 7 m, Lücke 10 m; `:140–146`, Vorgaben `:49`) werden auf diese Linie zurückgezogen. Im Testbild der SI-2-Boxszene liegen alle Boxpunkte bei 13–15 m. |
| Flankenschätzung ohne Laufweg des Empfängers | `dist/match-si-setplay-v183.js:292–317` (`v183CrossEstimate`): Eignung `:298` (Flankengeber ≤32 m und ≥6 m seitlich, Ziel ≤20 m vor dem Tor, ≤14 m seitlich, ≥7 m entfernt); Landeanteil `:304` mit `v183AirReach(m,who,2)` (Anlauf 2 m/s) gegen die Fehlerstreuung; Abschlusschance `:312` nur bei Landepunkt ≤`finishRange` (12 m); Kopfballwert `:315` aus SI-3 am Landepunkt. | Der Empfänger kann während des Flugs nicht nachrücken, deshalb ist die Ankunft ≈0,1 statt der in Ecken gemessenen ≈0,45. Steht er >12 m vor dem Tor, ist der Kopfballwert 0. |
| Ausführung zielt auf den Empfänger, nicht auf einen Raum | `dist/match-si-setplay-v183.js:166` (`v183HighPass`: `intended={receiver.x,receiver.y}`); Ausführung aus SI-1 `dist/match-si-options-v183.js:332`. Luftduell und Anwärter: `v122PlanAir` `:192` ff. (Anwärter laufen zum Landepunkt; das funktioniert, siehe Ecken). | Der Flug selbst und das Luftduell sind tragfähig: Ecken kommen zu 45–50 % an, Kopfbälle treffen zu 38 %. |

**Was das Paket ändern muss (Einschätzung)**

1. **Ziel ist ein Raumpunkt, nicht ein Spieler.** Kandidaten sind die SI-2-Boxpunkte (naher Pfosten, Elfmeterpunkt, zweiter Pfosten, Lücke) vor der Abwehrlinie, also 6–12 m vor dem Tor. Der Empfänger ist ein Läufer, der den Punkt bis zur Landung erreicht (Flugzeit `max(flightMin, Meter/crossSpeed)` gegen seine Laufzeit). So arbeitet `v150SpacePass` für Bodenpässe in den Raum.
2. **Abseits beim Abspiel, nicht beim Planen.** Läufer dürfen beim Flankenabspiel auf der Linie stehen (`plan.limit`), die Box wird erst mit dem Abspiel betreten. Die Klammer in SI-2 (`:253–259`) darf für den gewählten Flankenläufer während des Flugs nicht greifen; die Abseitsprüfung bleibt beim Abspiel (`v55OffsideSnapshot`).
3. **Schätzung mit Laufweg.** In `v183CrossEstimate` bekommt der Landeanteil die Reichweite, die der Läufer in der Flugzeit dazugewinnt (wie `v122PlanAir`: Reaktion minus Stellungsspiel, Tempo × `approachPace`). Die Abschlusschance und der SI-3-Kopfballwert werden am Raumpunkt berechnet. Der Verteidiger im Duell rückt ebenso nach.
4. **Auslöser für den Lauf.** SI-2 kennt Grundlinien- und Boxangebote. Der Flankenläufer (Torjäger/Zielspieler, Boxprofil) braucht ein Startsignal (Flankengeber breit innerhalb 30 m mit Raum), damit Flanke und Lauf zusammenfallen, ähnlich dem Doppelpass-Muster.
5. **Abnahme:** Spielflanken ≥2,0 je Partie, angekommen ≥45 %, Kopfball-/Volleyschüsse ≥0,6. Dabei Tore je Schuss, Dauer und Favoriten gegen Reihe B gepaart halten, und das Ziel großes Feld ≥85 % beachten. Flanken verlängern die Partie kaum, aber mehr Tore verlängern sie um die Torwiederholungen.

## Prüfungen

Node 24 (`C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`).

**Endstand (Uhr 0,385, dieser Commit):**
- **SI-Pakettests:** alle grün.
  - `node work/test-si-core-v183.cjs` (28)
  - `test-si-clock-v183` (22; die Vorgaberate ist jetzt 0,385)
  - `test-si-finish-v183` (20)
  - `test-si-defence-v183` (30; neu: Vorgabe `counterWindow` 0 öffnet kein Fenster. Die Mechanismusszenen setzen 2/3 s ausdrücklich.)
  - `test-si-setplay-v183` (18)
  - `test-si-offball-v183` (17; neu: Laufziel hinter dem Bremsweg, `carrierBrakeLead` 0 und Paket aus behalten 2 m. Die Boxszene hält ihren Entwurfsstand.)
  - `test-si-options-v183` (25; Spanne aus `weightMin`/`weightMax`)
  - `test-si-field-v183` (14; Fenster aus den registrierten Vorgaben)
- **Altpartien:**
  - `node work/check-old-matches-v183.cjs`: grün, 340 Szenen bytegleich gegen `e4e531c0`.
  - `node work/check-old-matches-v182.cjs work/tmp-sik/base182` (Basis per `git archive e4e531c0 dist work/test-v41.cjs`): grün, 158 Szenen.
- **Restore:** `node work/check-restore-completeness-v183.cjs --port=4262 --quick` auf Lane C: grün, 10 Läufe.
- **Rauchtest der Messhülle** (Wiederholungsmessung): 4 Partien digestgleich zu Reihe B; der Wrapper ändert keine Partie.

**Workflow-Block „Spieltests ausführen“** aus `.github/workflows/deploy.yml`:
- Auf `15d23adf` (Endwerte mit Uhr 0,36) liefen alle 117 Befehle (115 Node, 2 Python) mit Exit 0, über `work/tmp-sik/run-deploy-tests.cjs` (gitignoriert).
- Seitdem haben sich nur die Vorgaberate, Tests, Messwerkzeuge und Doku geändert. Laut Auftrag gibt es deshalb keinen erneuten Lauf.

**Artefakte zurückgesetzt:** `git checkout -- outputs docs/spieler-nutzer-rig`.

**Rot:** keine.


## Reproduktion

```powershell
$node='C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
# Reihe A (Stand ff0bbd8d, Uhr 0,42 per Override), je Lane ein Seed-Satz
& $node work/measure-si-calibration-v183.cjs --clockRate=0.42 --clubs=96 --workers=6 --port=4250 --label=sik-a
& $node work/measure-si-calibration-v183.cjs --clockRate=0.42 --clubs=96 --workers=6 --port=4256 --seedPrefix=si183b --label=sik-a
& $node work/measure-si-calibration-v183.cjs --clockRate=0.42 --clubs=96 --workers=6 --port=4262 --seedPrefix=si183c --label=sik-a
# Reihe B2 (Endwerte, Uhr 0,385 per Vorgabe, keine Overrides; misst die Torwiederholungen mit)
& $node work/measure-si-calibration-v183.cjs --clubs=96 --workers=6 --port=4250 --label=sik-b2
# … --seedPrefix=si183b (Port 4256) / si183c (Port 4262) wie oben
& $node work/table-si-calibration-v183.cjs sik-b2,sik-b2-si183b,sik-b2-si183c sik-b,sik-b-si183b,sik-b-si183c --strength
# Protokollserie und Offline-Auswertung (a)
& $node work/measure-si-calibration-v183.cjs --clockRate=0.42 --clubs=48 --traceLimit=40000 --port=4250 --label=sik-tr-a
& $node work/measure-si-calibration-v183.cjs --clockRate=0.42 --clubs=48 --offset=48 --traceLimit=40000 --port=4262 --label=sik-tr-c
& $node work/calibrate-si-k-finish-v183.cjs sik-tr-a-trace40000,sik-tr-c-trace40000 '--params={"reachBase":1.2}'
# Wanduhr
& $node work/measure-wallclock-si183.cjs --matches=10 --parallel=1 --port=4251 --gpu
```

Die Harness hängt bei einem Seed-Satz außer `p01r132` dessen Namen und bei `--traceLimit` die Grenze an den Dateinamen an. Die Tabellen dieser Doku nutzen die umbenannten Dateien (`sik-a-si183b.json`, `it1-a.json` usw.). Ausgeführt wurde alles über einen Lane-Wrapper (Sperre und `queue.log` der Integration). Die Iterationen liefen mit `--dist=work/tmp-sik/dev` (Kopie mit der Ballführer-Korrektur) und `--params`. Reihe B lief auf dem Worktree-`dist` ohne Overrides.
