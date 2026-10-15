# Spielerintelligenz 183: SI-0 Uhrvertrag und Stillstand

Stand: 15. Oktober 2026. Branch `feat/si-clock` auf `integration/si-r133` (`5ec465e6`, enthält SI-F). Umsetzung des Pakets SI-0 aus dem [Umsetzungsplan](spielerintelligenz-umsetzungsplan-2026-10-14.md) (Abschnitt „SI-0 Uhrvertrag und Stillstand“, 8.3, 9), aufbauend auf dem [Fundament](spielerintelligenz-fundament-183.md). Das Paket schaltet sich für neue Partien selbst ein (`v183EnableByDefault('clock')`); die Uhrrate bleibt bis SI-K bei 0,78 (`MATCH_SPEED`). Partien ohne Marker und 182-Partien bleiben byteidentisch (`check-old-matches-v182/v183`).

## Vertrag

- **Uhrrate.** `match.elapsed` zählt Uhreinheiten (75 = 90 Anzeigeminuten). Eine Partie mit Paket `clock` läuft mit `match.si.clockRate` Einheiten je Echtsekunde; alle anderen Partien mit `MATCH_SPEED`. Beide Feldgrößen teilen eine Rate (Nutzerentscheidung).
- **Zwei Arten von Zeitstellen.**
  - *Umrechnungen* zwischen Uhreinheiten und Sekunden (Flugzeiten, Rollen freier Bälle, Torwartreaktion, Grätschen, Positionsproben, Absichten) folgen der Rate der Partie: `(m.si?v183Rate(m):MATCH_SPEED)`.
  - *Intervalle in Uhreinheiten*, die im Altmaß mit 0,78 geeicht sind (0,75 nach Annahme, 0,55 nach freiem Ball, 0,7 nach Zweikampf, Erholungszeiten, 0,16 Freiball-Sperre, Mindestflugzeiten, 5er-Vorlagenfenster), behalten ihre Echtzeitlänge: `(m.si?x*(v183Rate(m)/MATCH_SPEED):x)`. Bei Rate 0,78 ergibt das exakt `x`.
  - Beide Ausdrücke brauchen außer `MATCH_SPEED` nichts. Testkontexte, die `game.js` nicht laden und nur `MATCH_SPEED` bereitstellen, laufen deshalb unverändert; ein Helfer in `game.js` hätte sie gebrochen.
  - **Argumente von `fly()` sind Altmaß** (Sekunden × `MATCH_SPEED`). `v115FlightDuration` verbindet die Altuntergrenze (skaliert) mit dem physikalischen Minimum (`Strecke/Tempo × Rate`). Neue Pakete übergeben Flugdauern im Altmaß und nicht mit `v183ClockUnits`, sonst würde bei Raten über 0,78 doppelt skaliert.
- **Phasenfunktionen** (`sin(elapsed·k)` für die Abseitsschwankung und die Zielunruhe in `game.js`) laufen über die Altuhr `elapsed·MATCH_SPEED/Rate`, damit ihre Periode in Echtzeit gleich bleibt.
- **Anzeigeminuten bleiben Anzeigeminuten.** Nachspielzeit (höchstens 5 je Halbzeit, v74) und Ermüdung hängen an der virtuellen Minute, nicht an der Echtzeit. Die Halbzeit- und Schlussangriffsverlängerung ist ein Deckel von 20 Echtsekunden (`20·Rate` Einheiten, `halftime-v14.js`, `set-pieces-v50.js`, `finance-v15.js`). Dauerformel: Echtzeit ≈ Uhrende / Rate + Stillstand.
- **Belastung v158.** Sprint- und Pressinganteile sind Anteile der virtuellen Minuten und rate-neutral. Die Zahl der intensiven Zweikämpfe folgt der Echtzeit, die 90 virtuellen Minuten nicht; ihr Gewicht (`events[].units`) beträgt deshalb `Rate / MATCH_SPEED` (`v183ClockLoadUnits`). Torwartereignisse haben im Freshness-Modell ein festes Gewicht und bleiben unverändert.

### Einordnung aller `MATCH_SPEED`-Stellen (Zeilen in `5ec465e6`)

| Datei: Stelle | Behandlung |
| --- | --- |
| `game.js:77` Anstoßpass, `match.next` +1,1 | Intervall im Altmaß |
| `game.js:85` Zielunruhe `sin(elapsed·.8)` | Phasenfunktion über die Altuhr |
| `game.js:76` Schleife der Sechserliga, `:89–93` 2D-`action` | unverändert (alte Liga, toter Pfad) |
| `world-physical-v65.js:436` Live-Schleife | Umrechnung: `step(real·Rate, real)` |
| `pitch-motion-v102.js:67, :103` | Umrechnung; `:54` (vor `fly`, Altmaß, danach überschrieben) unverändert |
| `pitch-v55.js:204, :274, :290, :296` | Umrechnung |
| `pitch-v55.js:74, :208, :217, :354, :364, :400, :494 (2×), :506` | Intervalle im Altmaß (`m.next`); `:506` zusätzlich `.32·Rate` |
| `pitch-v55.js:277` Rollgeschwindigkeit nach verspringender Annahme | `·2.5/(Rate/MATCH_SPEED)`: Geschwindigkeit je Uhreinheit, in Echtzeit gleich |
| `pitch-v55.js:445` `v115FlightDuration` | Altuntergrenze skaliert, physikalisches Minimum `·Rate` |
| `pitch-v55.js:449` Abseitsschwankung | Phasenfunktion über die Altuhr |
| `pitch-v56.js:24, :25, :45, :54, :58, :60, :61, :64` | Erholungs- und Pausenzeiten im Altmaß |
| `pitch-v56.js:47` Grätschendauer `.65·Rate` | Umrechnung |
| `set-pieces-v50.js:191` Jäger, `:394` Deckel 20 s | Umrechnung |
| `set-pieces-v50.js:176` Sperre `.16`, `:195, :210, :271, :274, :307, :308` | Intervalle im Altmaß |
| `set-pieces-v50.js:201` Vorlagenfenster 5 | Intervall im Altmaß |
| `halftime-v14.js:26`, `finance-v15.js:100` Deckel 20 s | Umrechnung |
| `world-attack-flow-v152.js:6, :21`, `world-backpedal-v108.js:12, :48, :74`, `world-ball-motion-v110.js` (alle 15), `world-corner-ball-v109.js:27`, `world-player-roles-v154.js:57, :86, :99` | Umrechnung |
| `world-football-flow-v159.js:46, :82, :168, :236, :258, :269, :275, :301, :333` | Umrechnung |
| `world-offensive-quality-v157.js:159, :169, :219, :224` | Echtzeitwerte `·Rate` |
| `world-offensive-quality-v157.js:139` | unverändert: Altuntergrenze / `MATCH_SPEED` ist konstante Echtzeit |
| `world-pitch-actions-v99.js:18, :19, :104, :114, :142, :295, :329, :336` | Umrechnung (`:142` und `v115FlightDuration` tolerieren fehlendes `match`) |
| `world-pitch-actions-v99.js:25/:35` (jetzt `:27/:37`) Torwart-Haltezeit | **nicht angefasst, gehört SI-3**; siehe Weichenbedarf |
| `world-pitch-actions-v99.js:139` `v101ShotDuration` | unverändert: liefert Altmaß für `fly()` |
| `world-pitch3d-v98.js:44` Grätschenerholung | Fortschritt über das Altmaß-Intervall; Dauer `.6/MATCH_SPEED` bleibt konstante Echtzeit |
| `world-space-passes-v150.js:56` | unverändert: `fly()`-Argument im Altmaß |
| `world-space-passes-v150.js:76, :101, :108, :144` | Intervall im Altmaß bzw. Umrechnung |
| `world-player-load-v158.js:97` | Gewicht intensiver Zweikämpfe (siehe oben) |
| `world-3d-documentation-data-v134.js` | Dokumentationstext, unverändert |

Die Tabelle steht als Gegenprobe im Test (`test-si-clock-v183.cjs`: Anzahl der verbleibenden `MATCH_SPEED` je Datei).

## Stillstand

Parameter in `match.si.params.clock` (Vorgaben in `match-si-clock-v183.js`, Sekunden):

| Parameter | Vorgabe | Altwert | Wirkung |
| --- | --- | --- | --- |
| `teleport` | `true` | – | Freistoß- und Abseitsaufstellung wird sofort gesetzt (`pitch-v57.js`). Nur die Rolle der beiden Foulbeteiligten bleibt, siehe `foulLock`. Ecken behalten die sichtbare Anreise mit 6 m/s. |
| `freeKickScene` | 2,2 | 3,8 | Mindesthaltezeit der Foulszene (`player-ball-events-v111.js`). Freistoß = Szene + 0,25 s Ausblenden + 0,5 s = 2,95 s. |
| `foulLock` | 1,8 | 2,7 | Sperre der beiden Beteiligten. Sie zählt nicht zur Wartezeit; nach dem Ende werden beide gesetzt. |
| `kickoffAdvance` | `true` | – | Nach einem Tor gehen die Spieler schon während der Torszene und des Torbanners mit 6 m/s in die Anstoßaufstellung (`match-si-clock-v183.js`). Der feste Zwei-Sekunden-Countdown des Anstoßes entfällt, es wird nur der Restweg abgewartet (`set-pieces-v50.js`, `kickoff`). Vom Tor bis zum rollenden Ball vergehen dadurch 2,75 bis 3,05 s weniger (Einzelszene), in den Serien 4,8 s weniger je Tor. |

Keine neue Zufallsziehung. Abseits behält den 3-s-Standbildfreeze (sichtbares Fahnenzeichen) und danach die sofort gesetzte Aufstellung.

## Marker, Restore

- Gating über `match.si` und `v183Active(m,'clock')`; ohne Paket liefert jeder Ausdruck exakt den Altwert. Unmarkierte und 182-Partien: `check-old-matches-v182.cjs` und `check-old-matches-v183.cjs` grün.
- Das Paket speichert nichts Neues. Gespeichert sind `match.si` (Rate, Parameter; ein später ergänzter Parameter wird aus der Vorgabe gelesen), die vorhandenen Klartextfelder `setPiece.wait`/`phase`, `countdown`, `goalPause`, `postBanner.wait`, `pendingKickoff`, `rebound.delay`, `recoverUntil` und die Spielerpositionen. Der Anstoßvorlauf ist zustandslos und wird jeden Schritt aus den Positionen berechnet. Flüchtig und nicht gespeichert bleibt die Foulsperre (`v113Fouls`, WeakMap, wie bisher): nach einem Restore werden beide Beteiligte sofort gesetzt.

## Tests und Werkzeuge

- `work/test-si-clock-v183.cjs`: Umrechnungsstellen, Vorgaben, alter Pfad, Echtzeitinvarianz, Freistoß/Anstoß, Gewicht der Zweikämpfe, Restore, Klassifikation der verbleibenden `MATCH_SPEED`.
- **Echtzeitinvarianz.** Raten, die sich um eine Zweierpotenz unterscheiden (0,78/0,39/0,195/1,56), sind in Gleitkomma exakt skalierbar. Die Prüfung spielt dieselbe Partie mit zwei Raten und vergleicht Schritt für Schritt alle numerischen Zustandsfelder (Zahlen gleich oder um das Ratenverhältnis skaliert). Eine nicht umgestellte Zeitstelle weicht sofort ab. Mit Ermüdung außer Kraft (Ermüdung ist absichtlich minutenabhängig) bleiben drei Vereine über eine ganze Halbzeit identisch.
- **Restore-Nachweis.** Der Test nimmt in der Wartezeit eines Freistoßes und mitten in der Torszene (Vorlauf läuft) einen Schnappschuss über die tatsächlichen `v65Snapshot`/`v65Restore` mit JSON-Rundlauf. `match.si` (eingefroren), `setPiece.wait`/`phase`, Torszenenzustand und alle Spielerpositionen sind danach gleich; Freistoß und Anstoß enden zur selben Zeit wie ohne Restore. Ein später ergänzter Parameter wird aus der Vorgabe gelesen. Das B19-Werkzeug `check-restore-completeness-v183.cjs` gibt es in diesem Branch noch nicht.
- `work/table-si-clock-v183.cjs`: gepaarte Tabelle der Serien (Dauer, Stillstand, Freistoßdauer, Frische, Ereignisse je Echtminute).
- `work/measure-si183.cjs`: ergänzt um `extras.fresh` (Kondition, Torwartkennung, Start- und Endfrische) und die Kennzahl `freshField`.
- `work/test-si-core-v183.cjs` und `work/check-old-matches-v183.cjs` setzen die Paketschalter jetzt ausdrücklich (alle aus bzw. Vorgaben der Module). Jedes Paket, das seinen Schalter einschaltet, braucht dieselbe Anpassung.

## Messungen

Gepaarte Serien zu je 192 Partien (96 Vereine × Standard- und Großfeld, Seeds `p01r132`), native Browserharness `measure-si183.cjs` auf Lane A, eingefrorene `dist`-Kopie `78149cb1` (Hashprüfung vor und nach jedem Lauf bestanden, 0 Fehler, 0 Engine-Fehler). Basis = SI-F-Stand `5ec465e6` mit allen Paketen aus. Die Serien 0,78/0,42/0,36 laufen mit `packages=clock,finish` (`finish` als leeres Modul, damit die Torwart-Haltezeit echt 2,4 s dauert, siehe Weichenbedarf). Klammern: Differenz zur Basis, gepaart, ±95 %. Tabellenwerkzeug: `node work/table-si-clock-v183.cjs si0-base-192 si0-r078-192 si0-r042-192 si0-r036-192`.

| Kennzahl | Basis | Rate 0,78 | Rate 0,42 | Rate 0,36 |
| --- | ---: | ---: | ---: | ---: |
| Dauer all-inclusive (min) | 2,68 | 2,22 (−0,46 ±0,05) | 4,17 (+1,49 ±0,07) | 4,84 (+2,16 ±0,07) |
| Partien im Fenster 4–6 min | 0 % | 0 % | 72 % | 100 % |
| Uhrende (Einheiten, mit Nachspielzeit) | 82,6 | 81,3 | 83,0 | 83,3 |
| laufende Uhr (min) = Uhrende / Rate | 1,77 | 1,74 | 3,30 | 3,86 |
| Stillstand (min) | 0,92 | 0,48 | 0,87 | 0,99 |
| Stillstand je Minute laufender Uhr (s) | 31,0 | 16,6 | 15,9 | 15,3 |
| Schüsse | 3,68 | 3,52 (−0,16 ±0,26) | 6,77 (+3,09 ±0,39) | 8,05 (+4,36 ±0,40) |
| aufs Tor | 1,13 | 1,05 | 2,31 | 2,39 |
| Tore | 0,76 | 0,80 (+0,05 ±0,16) | 1,64 (+0,88 ±0,23) | 1,82 (+1,06 ±0,22) |
| Fouls / Freistöße | 3,92 / 4,03 | 4,05 / 4,20 | 7,49 / 7,74 | 8,93 / 9,24 |
| Freistoßdauer (s je Freistoß) | 8,45 | 2,89 | 2,89 | 2,89 |
| Anstoß und Torszene je Tor (s, Regression) | 13,6 | 8,8 | 9,0 | 8,8 |
| Frische bei Abpfiff, Feldspieler | 53,7 | 54,5 (+0,8 ±0,5) | 54,6 (+0,9 ±0,3) | 54,3 (+0,6 ±0,4) |
| Frische bei Abpfiff, Kondition 9–11 | 50,8 | 51,6 | 51,3 | 51,0 |
| Pässe je Echtminute | 20,5 | 24,1 | 23,5 | 23,6 |
| Zweikämpfe je Echtminute | 14,9 | 17,4 | 17,7 | 17,5 |
| Fouls je Echtminute | 1,40 | 1,78 | 1,77 | 1,83 |
| Schüsse je Echtminute | 1,37 | 1,57 | 1,61 | 1,65 |
| Tore je Echtminute | 0,26 | 0,33 | 0,38 | 0,36 |
| Schüsse je Minute laufender Uhr | 2,08 | 2,02 | 2,05 | 2,09 |

Auswertung der Messkriterien:

- **Gleiche Rate 0,78 gibt dieselben Ereignisse.** Mit den 182-Stillstandswerten (`teleport=false, freeKickScene=3.8, foulLock=2.7, kickoffAdvance=false`) sind 48 von 48 Partien digestgleich zur Basis (`identicalStateDigest 48/48`, Zustand, Ledger, Zufallsziehungen): `--compare=si0-smoke48-base,si0-legacy48-r078 --expectIdentical`. Mit den neuen Stillstandswerten fallen Tore innerhalb der Rauschprobe aus (+0,05 ±0,16 gegen ±0,12; die Streuung von 192 Partien ist größer als die geforderte Schranke, der Punktwert liegt darin). Die Ereignisse bleiben gleich, weil nur Stillstand wegfällt: Schüsse je Minute laufender Uhr 2,08 gegen 2,02.
- **Rate 0,78 gegen 0,42/0,36, Ereignisse je Echtminute.** Pässe −2,6 % / −2,0 %, Zweikämpfe +1,8 % / +0,8 %, Fouls −0,6 % / +2,6 %: unter 5 %. Schüsse +2,6 % / +5,4 % (±7 %), Tore +13 % / +9 % (±17 %): innerhalb der Rauschprobe, mit 192 Partien nicht auf 5 % auflösbar. Den Nachweis der Ratenunabhängigkeit liefert deshalb die exakte Echtzeitinvarianz (Test), nicht die Statistik. Je Minute laufender Uhr (ohne Stillstandsanteil) liegen die Schüsse bei 2,02 / 2,05 / 2,09 (±0,15). Die Ereignisse je Partie wachsen mit der Echtzeit: Pässe ×1,83 bei Rate 0,42, Schüsse ×1,92, Tore ×2,04 (Laufzeit der Uhr ×1,90).
- **Freistoß ≤ 3,0 s.** 2,89 s je Freistoß bei jeder Rate (Basis 8,45 s); Soll 2,2 + 0,25 + 0,5 = 2,95 s.
- **Anstoß nach Tor −2 s.** Anstoß und Torszene je Tor 13,6 s → 8,8 s (−4,8 s, Regression der Partien); in der Einzelszene 9,9 s → 6,85 s (−3,05 s) und 9,6 s → 6,85 s (−2,75 s) vom Tor bis zum rollenden Ball. Der Zwei-Sekunden-Countdown entfällt, der Restweg beträgt 0,1 s.
- **Frische.** Ratenneutral: 54,3–54,6 bei allen drei Raten gegen 53,7 in der Basis (+0,6 bis +0,9; geringerer Stillstand, nicht die Rate). Die Zahl der Zweikämpfe wächst mit der Echtzeit (×1,91 bei Rate 0,42); ohne die Gewichtung der intensiven Zweikämpfe mit Rate / 0,78 würde die Belastung entsprechend steigen. **Die Produktreferenz 40 ± 5 erreicht auch die Basis nicht (53,7)**: die Engine erzeugt weniger Sprints, Pressing und Zweikämpfe als das „normale“ Belastungsmodell annimmt. Das ist eine Kalibrierung des Belastungsmodells (SI-K, SI-6), kein Befund des Uhrpakets.
- **Dauerformel.** Echtzeit = Uhrende / Rate + Stillstand gilt. Der Stillstand ist aber keine Konstante (Analyse 5.5: 55 s), sondern wächst mit den Ereignissen: 15–17 s je Minute laufender Uhr bei allen drei Raten (Basis 31 s). Daraus: Echtzeit ≈ Uhrende / Rate × 1,26 bei Teleport. Für 5,0 min mit Uhrende ≈ 83 ergibt das Rate ≈ 0,35; die Messung bei 0,36 liegt bei 4,84 min, bei 0,42 bei 4,17 min. Der Endwert hängt von den Ereignismengen der übrigen Pakete ab (SI-K).
- **Tore je Schuss** (Kontrolle, Mittelwerte): 0,21 / 0,23 / 0,24 / 0,23 (Basis / 0,78 / 0,42 / 0,36); die Torquote verschiebt sich innerhalb der Streuung nicht.

Rauchserien zu 48 Partien (Entwicklung) und die Rohdaten liegen unter `outputs/si183/` (nicht versioniert).

## Weichenbedarf in fremdem Besitz

- **Torwart-Haltezeit (SI-3, `world-pitch-actions-v99.js:27/:37`).** Der Altzweig `2.4*MATCH_SPEED` bzw. `Math.max(2.4,placement)*MATCH_SPEED` bleibt Uhreinheiten. Mit Paket `clock` und einer Rate ungleich 0,78 verlängert er die Haltezeit auf `2,4·0,78/Rate` Sekunden, solange das Paket `finish` aus ist (bei 0,42 4,5 s). Mit eingeschaltetem `finish` (auch als leeres Modul) gilt `v183ClockUnits` und die Zeit ist echt 2,4 s. Alle Messungen und Echtzeittests dieses Pakets laufen deshalb mit `packages=clock,finish`. Vorschlag für SI-3: den Altzweig durch `v183ClockUnits(match,2.4)` bzw. `v183ClockUnits(match,Math.max(2.4,placement))` ersetzen; für unmarkierte und Partien ohne Uhrpaket ist das bitgleich (`seconds*MATCH_SPEED`).
- **Neue Flüge und Pausen anderer Pakete.** Argumente von `fly()` sind Altmaß (Sekunden × `MATCH_SPEED`); `v115FlightDuration` skaliert die Untergrenze selbst. Wer eine Dauer mit `v183ClockUnits` übergibt, skaliert bei Raten über 0,78 doppelt. Neue Takte (`m.next`, `recoverUntil`, Sperren) in Uhreinheiten brauchen `v183ClockUnits(m,sekunden)`; Sekundenwerte in Absichten bleiben `v183Seconds(m)`.
- **Tests und Werkzeuge der SI-F.** `test-si-core-v183.cjs` und `check-old-matches-v183.cjs` setzen die Paketschalter jetzt aus den Registern (Vorgaben) bzw. ausdrücklich auf „alle aus“. Jedes Welle-1-Paket, das seinen Schalter einschaltet, trifft dieselbe Stelle; der Merge löst das mit dem Hilfsausdruck `Object.fromEntries(PACKAGES.map(p=>[p,false]))`.
- **Uhrrate.** Die Vorgabe `clockRate` bleibt `MATCH_SPEED` (SI-F-Konstruktor). SI-K setzt den Endwert. Für 4,8–5,2 min ergibt die gemessene Dauerformel ≈ 0,35–0,36 (siehe Messungen); sie hängt von den Ereignismengen der anderen Pakete ab.
- **Unity.** Die Neustartsprünge (`WorldViewPlayback.Cut`) bleiben wie sie sind. Spielerversetzungen über 10 m schneiden hart, kürzere werden innerhalb von höchstens 0,1 s überblendet. Ein ausdrücklicher Parallelitätslauf mit Unity gehört in U-1.

## Prüfungen (15. Oktober 2026, `dist/` byte-gleich zum gemessenen Stand `78149cb1`)

- Grün: `test-si-clock-v183.cjs` (19 Prüfungen), `test-si-core-v183.cjs`, `check-old-matches-v182.cjs work/tmp-base183` (158 Szenen), `check-old-matches-v183.cjs` (340 Szenen), `test-v55`, `test-v56`, `test-v57`, `test-breakaway`, `test-duel-streaks`, `run-native130-tests`, `test-world-match-v64`, `test-world-penalties-v65`, `test-world-goal-scene-v83`, `test-world-physical-instructions`, `test-compact-balance-v178`, `test-player-load-candidate-v158`, `test-native-career-v160` (20 min), `test-native-performance-context`, `platform/qa/test-unity-integration-v160`, `platform/qa/test-world-unity-contract`, `test-world-pitch3d-v98`, `test-3d-contacts-v119`, `test-whistle-offside-v119`, `test-keeper-picture-v119`, `platform/qa/test-world-unity-slides`, `test-corner-quality-v182`, `test-defensive-pursuit-v182`, `test-freekick-plan-r132`, `test-keeper-hold-v182`, `test-loose-ball-v182`, `test-penalty-quality-v182`, `test-review-fixes-v182`, `test-view-frame-scheduler-v130`.
- Build und Browser (B20-Regressionsschutz): `node work/build.cjs`, `generate-user-meshy-match.cjs`, `check-free-ball-positioning-v124.cjs`, `check-match-additions-v148.cjs`, `test-goal-replay-v103.cjs` grün.
- Unity: `platform/qa/check-world-unity.cjs` (Dateimodus) 24 von 24 Prüfungen einschließlich der vollständigen Partieparität native/Unity, keine Seitenfehler. Mit `--http-build` lief die Parität ebenfalls, danach brach der letzte Teil (96-MB-Build über lokales HTTP) einmal mit „Browser geschlossen“ ab; ein zweiter Lauf scheiterte an einer Prüfung mit festen 180 ms Wartezeit unter Last (`Unity review uses the existing recorded match timeline`). Beides sind Lastfehler der Software-WebGL-Umgebung, nicht reproduzierbar im Dateimodus.
- Nicht ausgeführt: eine gesondert aufgezeichnete Freistoßpartie und ein neuer WebGL-Build (Plan: U-1). Partien enthalten im Mittel etwa vier Freistöße (Serien); die Paritätspartie von `check-world-unity.cjs` spielt Teleport und Foulszene daher in der Regel mit, die Zahl der Freistöße in genau dieser Partie ist nicht einzeln belegt.
- Bestehender Fehler im Basisstand: `test-world-pitch-actions-v99.cjs` bricht schon vor diesem Paket an `v123OwnedBall` ab.
