# Spielerintelligenz 183: SI-K Integration und Kalibrierung

Stand: 15. Oktober 2026. Branch `feat/si-calibration` (Worktree `work/si-calibration`), abgezweigt von `integration/si-r133` = `ff0bbd8d` (SI-F, B19, B20, SI-0, SI-3, SI-4, SI-7, SI-2, SI-1, SI-5, U-1, B21). Auftrag: [Umsetzungsplan](spielerintelligenz-umsetzungsplan-2026-10-14.md) Abschnitt 10, Zielwerte 2.3 (Torziel 15. Oktober 2026, [Entscheidungen](entscheidungen.md)). Keine Veröffentlichung, keine Fußversion, kein WebGL-Build.

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
