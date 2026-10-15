# Spielerintelligenz 183: SI-3 Abschluss und Torwart

Stand: 15. Oktober 2026. Branch `feat/si-finish` auf `integration/si-r133` (`5ec465e6` mit SI-F, nachgezogen auf `ef78fca6`). Umsetzung des Pakets SI-3 aus dem [Umsetzungsplan](spielerintelligenz-umsetzungsplan-2026-10-14.md) (Abschnitte 2–6, „SI-3 Abschluss und Torwart“, 8.3, 9) auf dem [Fundament](spielerintelligenz-fundament-183.md). Nutzerentscheidung: Die Torquote hängt an der Platzierung; gut platzierte Fernschüsse dürfen oft treffen.

Das Modul `dist/match-si-finish-v183.js` schaltet das Paket `finish` für neue Partien ein (`v183EnableByDefault('finish')`). Neue Logik wirkt nur bei `v183Active(m,'finish')` in einer Weltpartie. Partien ohne `match.si`, 182-Partien und Partien mit ausgeschaltetem Paket laufen über die umhüllten Vorgängerfunktionen, ohne zusätzliche Zufallsziehung.

## Modell

Alle Größen in Metern im Torrahmen: `lat` seitlich zur Tormitte, `depth` Abstand zur Torlinie, `h` Höhe. Tor 9,71 × 3,24 m, Ballradius 0,18 m.

- **Tor nur bei Unerreichbarkeit.** Ein Schuss ist genau dann ein Tor, wenn der ausgeführte Punkt im Rahmen liegt und der Torwart ihn nicht erreicht. Die pauschalen Würfe „aufs Tor“ und „Tor“ sowie die Mittelregel für Distanzschüsse entfallen im neuen Pfad.
- **Zielwahl (`dec`).** 27 Ziele: 9 seitliche Punkte (±0,92/0,78/0,6/0,35/0 der halben Torbreite) × 3 Höhen (0,45/1,35/2,35 m). Für jedes Ziel wird der Torwert über die eigene Streuung integriert (seitlich geschlossen, in der Höhe über 10 Quantilknoten). Die Wahl ist nach Entscheidungsqualität gedämpft: Gewicht `exp((p−p_best)/τ)`, `τ = aimTemp·(21−dec)/11`. Entscheidungen verändern nie die Ausführung.
- **Streuung.** Winkelstreuung `θ = (spreadBase + spreadSkill·(1−q)^spreadPower) · (1 + pressureGain·Druck·Ruhefaktor) · Art · Körper`, mit `q = Abschlussgüte/20`. Die Abschlussgüte ist je Art die Mischung des Altpfads: Schuss `0,8·fin + 0,2·tec`, Direktabnahme/Volley/Freistoß `0,7·fin + 0,3·tec`, Kopfball `0,45·fin + 0,4·air + 0,15·tec`. Druck ist `Σ(1 − d/pressureRadius)` der Gegner in 2,5 m und ersetzt im neuen Pfad den normierten Radius 0,15 (`pitch-v55.js:403`). Ruhefaktor `clamp(1 + calmDamp·(10 − calm), 0,3, 1,6)` wirkt nur auf den Druckanteil. Körper `1 + bodyGain·turn²` mit `turn` = Abweichung der Körperrichtung (`offenseMotion.heading`) vom Tor / π. Seitliche Streuung an der Linie `θ·Distanz + spreadFlat·(1−q)²`, Höhenstreuung `verticalRatio·θ·Distanz + spreadFlatV·(1−q)²` (je mindestens 0,05 m). Der Nahbereich ist dadurch fähigkeitssteil. Der Ball geht nie unter Bodenhöhe; über der Latte oder neben dem Pfosten ist ein Fehlschuss.
- **Schusstempo.** `speedBase + speedFin·fin + speedTec·tec` (21 + 0,4·fin + 0,2·tec m/s), Kopfball `headerBase + headerAir·air`, Volley × `volleySpeed`, direkter Freistoß × `fkSpeed`. Die Flugdauer des Schusses folgt dem Tempo, ist aber nie kürzer als die bisherige Mindestdauer (27 m/s). Sie wird wie alle `fly()`-Dauern im Altmaß (Sekunden × `MATCH_SPEED`) übergeben.
- **Torwart** in seiner Tiefenebene: Grundreichweite `reachBase + reachGk·(gk−10)` (nur mit Handerlaubnis, sonst `noHandsReach`), Reaktion `max(reactionMin, reactionBase − reactionGk·(gk−10))`, Seitwärtstempo `lateralBase + lateralSpd·(spd−10) + lateralGk·(gk−10)`. Zum Kontaktzeitpunkt `t` ist die seitliche Reichweite `R = reach0 + max(0, t − Reaktion)·Tempo`. In der Höhe zählt der Abstand zur Handhöhe `handsHeight`: darüber `upBase + upGk·(gk−10) + min(jumpMax, Sprungzeit·jumpSpeed)`, darunter `down`. Erreichbar, wenn `(gap/R)² + (dh/Rv)² ≤ 1`; `gap` ist der senkrechte Abstand zur Flugbahn. Hohe Ecken sind dadurch am schwersten, flache Ecken schwerer als halbhohe Bälle.
- **Paraden.** Fangen oder Abwehren: `clamp(parryBase + parrySpeed·(v−27) + parryStretch·Streckung + parryHigh·max(0, h−1,8) − parryGk·(gk−10), parryMin, parryMax)`. Abgewehrte Bälle gehen um den Pfosten ins Toraus (Ecke) mit `clamp(outBase + outPost·Pfostennähe + outStretch·Streckung + outGk·(gk−10)·Pfostennähe, 0,03, 0,9)`, sonst 3,5–8 m vom Kontaktpunkt weg ins Feld, für bessere Torhüter seitlicher (`parryAngle + parryAngleGk·(gk−10)`). Der Torwart fasst also nicht sofort nach; Angreifer können nachsetzen.
- **Direkter Freistoß.** In der Direktzone (zentral, Tiefe < 0,38) schießt der beste Schütze auf dem Feld (`0,7·fin + 0,3·tec`, Gleichstand nach Nähe); er wird bei der Ausführung wie bisher auf den Punkt gesetzt. Der Schuss läuft über dasselbe Modell mit `fkSpread`/`fkSpeed`; Mauer und Block bleiben die bestehende Blockregel. Die Entscheidung „direkt oder nicht“ gehört SI-7 (`v182FreeKickPlan`); dafür liefert `v183DirectFreeKick` die Empfehlung (siehe unten). Bis zur Integration gilt die bisherige 65-%-Wahl.
- **Torwart-Haltezeit.** Parameter `finish.keeperHold` = 1,6 s (H13). Die Weiche in `world-pitch-actions-v99.js:25-28/:38` rechnet für markierte Partien in Echtzeit (`v183ClockUnits`): mit Paket `keeperHold`, ohne Paket 2,4 s. Unmarkierte Partien rechnen unverändert mit `2.4*MATCH_SPEED`.

### Parameter (`match.si.params.finish`, Vorgaben)

| Gruppe | Parameter |
| --- | --- |
| Haltezeit | `keeperHold` 1,6 |
| Streuung | `spreadBase` 0,037, `spreadSkill` 0,584, `spreadPower` 1,61, `spreadFlat` 2,22, `spreadFlatV` 1, `verticalRatio` 1,2 |
| Druck, Ruhe, Körper | `pressureRadius` 2,5, `pressureGain` 0,38, `calmDamp` 0,05, `bodyGain` 0,5 |
| Arten | `headerSpread` 1,3, `volleySpread` 1,2, `oneTouchSpread` 1,1, `fkSpread` 1 |
| Zielwahl | `aimTemp` 0,036 |
| Tempo | `speedBase` 21, `speedFin` 0,4, `speedTec` 0,2, `headerBase` 11, `headerAir` 0,3, `volleySpeed` 1,03, `fkSpeed` 0,92 |
| Torwart | `reachBase` 1,39, `reachGk` 0,066, `noHandsReach` 0,35, `reactionBase` 0,168, `reactionGk` 0,015, `reactionMin` 0,06, `lateralBase` 3,67, `lateralSpd` 0,065, `lateralGk` 0,098, `handsHeight` 1, `upBase` 1,49, `upGk` 0,01, `jumpMax` 0,55, `jumpSpeed` 2,2, `down` 1 |
| Paraden | `parryBase` 0,55, `parrySpeed` 0,02, `parryStretch` 0,35, `parryHigh` 0,1, `parryGk` 0,015, `parryMin` 0,15, `parryMax` 0,9, `outBase` 0,4, `outPost` 0,45, `outStretch` 0,2, `outGk` 0,015, `postZone` 1,8, `parryNear` 3,5, `parryFar` 8, `parryAngle` 0,45, `parryAngleGk` 0,03 |
| Freistoß-Empfehlung | `fkRangeBase` 14, `fkRangeFin` 0,6, `fkMinXg` 0,05 |

Die Werte stammen aus `work/calibrate-si-finish-v183.cjs`: lokale Suche auf den exakt protokollierten Schusssituationen einer 192er-Serie (Ziele: Tore je Schuss der Basis, aufs Tor ≈ 49 %, direkte Freistöße 10 %, Fernschuss Abschluss ≥14 ≈ 20 %, Verhältnis ≥ 2,2, Torwartabstand ≥ 12 Punkte). Endwerte legt SI-K fest.

## Schnittstellen

- **`v183ShotEstimate(m,p,from=p,detail={}) → {xg,aim,window,speed,onTarget,block}`** (SI-1 Optionswert, SI-2 Angebotswert, SI-7 Freistoß/Kopfball). Mit Paket: `xg` ist die **Wahrscheinlichkeit**, dass ein Versuch von `from` ein Tor wird – über die eigene Zielwahl und Streuung gemittelt und mit der Blockchance des ersten erreichbaren Feldspielers in der Bahn verrechnet. Der Stub liefert dagegen `v157ShotQuality`, einen Güteindex 0–≈1,1 und keine Wahrscheinlichkeit. `aim` ist das beste Ziel `{x,y}` auf der Torlinie plus `height` in Metern, `window` heißt „Ziel mit positivem Torwert bei freier Bahn“, `speed` ist das Schusstempo in m/s. `onTarget` und `block` sind Zusatzfelder. `detail.kind` ist `'shot'` (Vorgabe), `'volley'`, `'header'` oder `'direct-free-kick'`, `detail.oneTouch` steht für eine Direktabnahme. Die echte Schätzung setzt kein `stub` (die SI-F-Stubs tragen `stub:true`) und liefert `speed` immer endlich. Deterministisch, ohne Zufallsziehung, schreibt nichts. Rechenzeit in V8 ≈ 0,02–0,05 ms je Aufruf; im `vm`-Testharness wegen der Kontext-Globalen ≈ 3 ms.
- **`v183KeeperReach(m,keeper,range,contact,detail) → Meter`** an allen drei Stellen (`shot-lane`, `open-goal` in `v131OpenGoal`, `keeper-contact`): seitliche Reichweite `reach0 + max(0, range/v − Reaktion)·Tempo` in Handhöhe. `v` ist das Tempo von `detail.shooter`, sonst das des gegnerischen Ballführers, sonst 27 m/s. Handerlaubnis nach `v160KeeperHands` am Kontaktpunkt (bei `keeper-contact` immer). Damit nutzt auch `v131OpenGoal` (Freies-Tor-Prüfung, Weg über `v159ShotLane`) das Torwartmodell.
- **`v183DirectFreeKick(m,setPiece) → {direct,range,limit,xg,estimate} | null`** für SI-7: direkt, wenn der Punkt innerhalb `fkRangeBase + fkRangeFin·fin` Meter liegt, der Winkel frei ist (`|lat| ≤ 0,85·depth + 1`) und `xg ≥ fkMinXg`. Ohne Paket `null`. **Zeitpunkt:** Die Schätzung liest die aktuellen Verteidigerpositionen. Aufrufen, sobald die Mauer steht: bei der Ausführung oder mit den Mauerspielern auf ihren Zielpunkten. Bei Erzeugung des Standards (`v182FreeKickPlan` in `v50Restart`) steht die Mauer noch nicht in der Schussbahn; dann ist `xg` zu hoch und der Block bleibt unberücksichtigt.

## Umhüllungen und Zufall

| Funktion | Neuer Pfad (nur mit Paket) |
| --- | --- |
| `v55Shoot` | Ersetzt den Rumpf von `pitch-v55.js:402-434` und übernimmt die Bereiche der Hüllen v99 (`v99Release`) und v102 (`v102Scoped`); Statistik, Blockregel, Ledger (v117 liegt außen), Anzeige wie bisher. Kopfball außerhalb der Kopfballreichweite bleibt im Altpfad (Kopfballablage). |
| `v115KeeperDeflect` | Paradenrichtung nur für die Parade des eigenen Schussflugs (WeakMap, Abgleich über den eingehenden Flug), sonst Altfunktion. |
| `v50BestTaker` | Nur `freeKick` in der Direktzone. Ecken, Elfmeter und andere Zonen bleiben unverändert. |
| `v183ShotEstimate`, `v183KeeperReach` | Ohne Paket die SI-F-Stubs. |
| Haltezeit-Weiche `world-pitch-actions-v99.js` (eigene Zeilen laut 8.3) | Markierte Partien in Echtzeit, siehe oben; einzige Änderung außerhalb des Moduls. |

Benannte Ziehungen im neuen Pfad, in dieser Reihenfolge: `finish.aim`, `finish.lateral`, `finish.height`, `shot.block` (bestehende Chance, nur mit Blocker in der Bahn), `finish.catch` (nur bei erreichbarem Ball). In der Parade folgen `finish.parryOut` und `finish.parrySpread`.

Anzeige: Endhöhe des Flugs und `over` folgen dem Modell (`v99Flights`, `shotMotion.endHeight`). Paraden gelten als Torwartkontakt, auch wenn der Kontakt weiter als 2,4 m vom Torwart liegt. Schüsse über 22 m erhalten im Ledger die Quelle `long-shot`. Das flüchtige Protokoll erhält `finish.shot` und `finish.parry`. `finish.shot` wird nach der Blockentscheidung geschrieben und enthält erwartetes xg/aufs Tor, Ziel, Ausführung, `blocked`, das tatsächliche Ergebnis und die Situation; ein geblockter Schuss ist nie `goal`/`onTarget`.

## Restore

SI-3 legt keinen Zustand in der Partie an. Zielwahl, Streuung und Paradenplan existieren nur während eines Schussflugs; währenddessen verweigert `v65Snapshot` die Momentaufnahme. Der Paradenplan (WeakMap je Partie) wird bei jedem neuen Schuss gelöscht. Die Parade verbraucht ihn; passt er nicht zum eingehenden Flug oder Torwart, wird er verworfen. Es bleibt also kein Eintrag nach dem Flug stehen; die Einordnung der Map im B19-Werkzeug übernimmt B19. Abpraller liegen wie bisher in `rebound`/`nativeContinuation`, die Parameter in `match.si`. Der Pakettest nimmt an fünf Zeitpunkten Momentaufnahmen über `v65Snapshot`/JSON/`v65Restore` auf und vergleicht den vollständigen Digest (Zustand, Fortsetzung, P02-Last, Zufallsstand). Der Digest ist vor und nach dem Restore gleich, das Paket bleibt aktiv, und die Partie läuft danach über den neuen Pfad weiter.

## Messung

Gepaarte 192er-Serie (96 Vereine × 2 Feldgrößen, Seeds `p01r132`) mit `work/measure-si183.cjs`, beide Seiten auf eingefrorenen Kopien:

- Basis SI-F (`5ec465e6`): `--packages=clock --clockRate=0.42 --label=sif-base-r042`.
- SI-3 (dieser Stand): `--packages=clock,finish --clockRate=0.42 --label=si3-final2-192`. Prüfsummen: `match-si-finish-v183.js` SHA-256 `6888bdfe…`, `world-pitch-actions-v99.js` `3fe680d7…`; `dist` vor und nach dem Lauf unverändert.

Das Uhrpaket ist nur eingeschaltet, damit die Rate 0,42 gilt; sein Modul ist auf diesem Branch leer. Die gemessene Kopie stammt aus der Zeit vor dem Merge von `ef78fca6`. Dieser Merge ergänzt in `match-si-core-v183.js` nur das Feld `stub:true` der Stub-Rückgaben, die eine Partie mit `finish` nie erreicht. Die Nacharbeiten aus dem Review ändern keine Ergebnisse: Protokolleintrag nach der Blockentscheidung, Löschen des Paradenplans und Kommentar ohne `MATCH_SPEED` in `world-pitch-actions-v99.js`. Zehn Konstruktorpartien mit `finish` (je 1.500 Schritte, 15 Schüsse) sind vorher und nachher digestgleich, einschließlich Zufallsstand. Deshalb gibt es keine neue Serie; die gemessenen Prüfsummen gelten für den Stand vor dem Review. Gemessen auf Lane A (Ports 4250–4255), Einträge in `work/si-integration/outputs/si183/queue.log`. Auswertung mit `node work/table-si-finish-v183.cjs sif-base-r042 si3-final2-192`.

| Kennzahl (je Partie bzw. Anteil) | Basis SI-F | SI-3 | gepaart (±95 %) | Kriterium |
| --- | ---: | ---: | ---: | --- |
| Minuten all-inclusive | 4,21 | 4,27 | +0,06 ±0,06 | – |
| Schüsse | 3,09 | 3,09 | −0,01 ±0,23 | – |
| aufs Tor (Anteil der Schüsse) | 1,10 (34,7 %) | 1,52 (48,4 %) | +0,42 ±0,20 | ≥ 38 % erfüllt |
| Tore | 0,80 | 0,80 | 0,00 ±0,17 | – |
| Tore je Schuss | 23,4 % | 24,5 % | +1,1 Punkte | ±2 Punkte erfüllt |
| Tore je Schuss aufs Tor | 67,5 % | 50,5 % | – | – |
| Paraden (gefangen + abgewehrt) | 0,35 | 0,75 | +0,40 ±0,15 | +0,4 erfüllt |
| davon abgewehrt | 0,16 | 0,57 | +0,42 ±0,12 | – |
| Ecken | 0,11 | 0,34 | +0,23 ±0,08 | Ecken aus Paraden +0,2 erfüllt (siehe unten) |
| freie Bälle aus Schüssen | 0,89 | 1,08 | +0,19 ±0,18 | – |
| Spielzugschüsse, Tore je Schuss: Abschluss <10 / 10–14 / ≥14 | 21 / 22 / 42 % | 14 / 22 / 53 % | – | – |
| Verhältnis Abschluss ≥14 / <10 | 2,04 | 3,70 | – | ≥ 1,8 erfüllt |
| Tore je Schuss aufs Tor: Torwart 10–14 / ≥14 (Abstand) | 70 / 62 % (7,6) | 58 / 31 % (26,7) | – | ≥ 10 Punkte erfüllt |
| direkte Freistöße: Tore je Schuss (n) | 8 % (119) | 10 % (128) | – | 8–12 % erfüllt |
| Fernschüsse > 22 m, Abschluss ≥14: Tore je Schuss (n) | 12,5 % (16) | 12,0 % (25) | – | 15–25 %: siehe unten |
| **Favoriten ≥1 Punkt** (n 134) / ≥2 Punkte (n 90) | 43 / 48 % | 46 / 48 % | – | Gate „nicht sinken“ erfüllt |
| Tordifferenz je Stärkepunkt | 0,20 | 0,26 | – | – |

Lesart und Streuung:
- **Fähigkeitsverhältnis.** Die Gruppe Abschluss <10 hat nur 80–90 Schüsse, das Verhältnis streut deshalb stark. Es lag in den drei kalibrierten 192er-Serien zwischen 2,26 und 4,04; Modellerwartung auf den protokollierten Situationen 3,4–3,7.
- **Ecken aus Paraden.** Die Messung ordnet Ecken nicht ihrer Ursache zu. SI-3 ändert außer der Paradenrichtung keine Eckenquelle, deshalb ist die gepaarte Eckendifferenz (+0,23 ±0,08) das Maß. Die Serie mit Protokollexport zählte 0,29 Paraden ins Aus je Partie bei +0,26 Ecken.
- **Fernschüsse.** In der Basis gibt es aus dem Spiel keine Schüsse über 22 m (`v157ShotQuality` endet bei 22 m), nur direkte Freistöße mit Mauer; Spielzug-Fernschüsse kommen erst mit SI-1. Für einen freien Schuss aus 24 m gegen Torwartstärke 12,7 erwartet das Modell 13 % (Abschluss 15) bzw. 25 % (Abschluss 17), im Mittel ≈ 19 %. Die gemessenen Freistöße über 22 m mit Abschluss ≥14 liegen bei 12–18 % (n 25–30 je Serie). Das Kriterium ist damit vorläufig nur über das Modell belegt und in SI-K mit Spielzugschüssen zu prüfen.
- **Paraden +0,4.** Das Kriterium stammt aus Messungen mit ≈ 7,5 Schüssen je Partie. Die SI-F-Basis bei Uhr 0,42 hat nur 3,1 Schüsse; +0,40 Paraden sind hier 13 % aller Schüsse. Mit mehr Schüssen (SI-0/SI-1) steigen Paraden und Ecken proportional.
- **Direkte Freistöße.** Die Schützen sind besser (Abschluss im Mittel 13,1 statt 12,0), weil der beste Schütze schießt. Die Häufigkeit (0,67 je Partie) entscheidet bis zur Integration von SI-7 weiter die 65-%-Regel.

Weitere 192er-Serien mit demselben Modell gegen dieselbe Basis:

| Serie | Unterschied | aufs Tor | Tore/Schuss | Verhältnis | Torwartabstand | Paraden | Ecken | dir. Freistoß | Favoriten |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `si3-r2-192` | `fkSpread` 0,84, Protokollexport | 47,9 % | 24,4 % | 4,04 | 21,9 | +0,41 | +0,26 | 14 % | 52 % |
| `si3-final-192` | `fly()`-Dauern noch über `v183ClockUnits`, Haltezeit-Weiche nur mit Paket | 48,7 % | 24,2 % | 2,26 | 17,4 | +0,41 | +0,19 | 10 % | 48 % |

Dazu kamen die Entwicklungsserien `si3-r1-48` und `si3-trace-192` mit den Startwerten vor der Kalibrierung.

## Prüfungen

Node 24 (`C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`), alle aus dem Worktree:

- `node work/test-si-finish-v183.cjs` – 20 Prüfungen, grün:
  - Anmeldung und Haltezeit, auch die Weiche in Echtzeit;
  - Altpfad: Paket aus = ohne Marker (Digest), Umhüllungen ohne Zusatzziehung;
  - Modell: Wahrscheinlichkeit, deterministisch, Torwartabstufung, Fähigkeitssteilheit (Abschluss 16 gegen 7 aus 10 m: 0,79 gegen 0,21), Ruhe nur gegen Druck, Entscheidungen ohne Einfluss auf die Ausführung, Fernschuss 24 m;
  - Platzierung: Ecke unerreichbar = Tor, Mitte = Parade, über die Latte, neben den Pfosten; kein Ball durch den Torwart (2.400 Ausführungen);
  - Live-Schüsse, Kopfbälle und Volleys im neuen Pfad: benannte Ziehungen, Statistik, Anzeige, Starthöhe, Tempo, Ledger-Art; geblockter Schuss im Protokoll; Kopfball außerhalb der Reichweite; Ledger-Quelle `long-shot`;
  - Torwartreichweite an drei Stellen; Paradenrichtung (ins Aus nahe Pfosten 92 %, zentral 59 % bei Streckung 0,8); kein liegengebliebener Paradenplan;
  - P03-Folge Parade → freier Ball → Torwart fasst nach → Abspiel, aus dem Ledger gelesen;
  - Freistoßschütze und Freistoßschüsse, Schätzschnittstelle;
  - Restore an fünf Zeitpunkten digestgleich, keine Momentaufnahme im Schussflug.

  `SI3_ONLY=<Text>` wählt einzelne Prüfungen.
- `node work/test-si-core-v183.cjs` und `node work/check-old-matches-v183.cjs` in der Integrationsfassung `ef78fca6`: grün (auch nach dem Merge). `check-old-matches-v183` vergleicht 340 Szenen bytegleich gegen `e4e531c0`: unmarkiert, 182, ohne Marker und Marker 183 mit allen Paketen aus.
- `node work/check-old-matches-v182.cjs`: 158 Szenen bytegleich gegen `f2458c1f`, grün. Der erste Lauf scheiterte nur am fehlenden Basisbaum; anlegen mit `git archive f2458c1f dist work/test-v41.cjs` nach `work/tmp-base182`.
- Regressionsschutz `test-goal-replay-v103`, `test-penalty-quality-v182` (Elfmeter unverändert), `test-keeper-hold-v182`, `test-freekick-plan-r132`: grün.
- Pflichtliste Abschnitt 9: grün. Sie umfasst `test-v55`, `test-v56`, `test-v57`, `test-breakaway`, `test-duel-streaks`, `run-native130-tests`, `test-world-match-v64`, `test-world-penalties-v65`, `test-world-goal-scene-v83`, `test-world-physical-instructions`, `test-compact-balance-v178`, `test-player-load-candidate-v158`, `test-native-career-v160`, `test-native-performance-context`, `platform/qa/test-unity-integration-v160`, `platform/qa/test-world-unity-contract`, `test-world-pitch3d-v98`, `test-3d-contacts-v119`, `test-whistle-offside-v119`, `test-keeper-picture-v119`, `platform/qa/test-world-unity-slides`, `test-corner-quality-v182`, `test-defensive-pursuit-v182`, `test-loose-ball-v182` und `test-review-fixes-v182`.
- `node work/build.cjs`: grün. Die erzeugten `outputs/index.html`/`outputs/Doppel-6-Fussballmanager.html` und die von Tests überschriebenen `outputs/`-Dateien sind zurückgesetzt.
- Werkzeuge: `work/table-si-finish-v183.cjs <basis> <variante>` (Kriterientabelle mit gepaarten Differenzen), `work/calibrate-si-finish-v183.cjs <ergebnis> [--params=JSON] [--search=N --local]` (Modellerwartung auf protokollierten bzw. rekonstruierten Situationen, Parametersuche).

## Grenzen und Übergaben

- **SI-7 (Weichenbedarf):** `v182FreeKickPlan` soll bei aktivem Paket `v183DirectFreeKick(m,setPiece)` fragen. Diese Empfehlung ersetzt die 65-%-Wahl. Bis dahin schießt in der Direktzone zwar der beste Schütze, ob direkt geschossen wird, entscheidet aber weiter die Pauschalregel.
- **SI-1:** `v183ShotEstimate().xg` ist mit Paket eine Torwahrscheinlichkeit, im Stub ein Güteindex. Schwellen der Optionswahl nach dem Merge neu einstellen. Spielzug-Fernschüsse und damit das Fernschusskriterium entstehen erst mit SI-1; prüfen in SI-K.
- **SI-0:** `fly()`-Dauern übergibt das Modul im Altmaß (Sekunden × `MATCH_SPEED`), damit SI-0 sie einmal in die Rate umrechnet. Schussflug: nie kürzer als `v101ShotDuration`; Paradenflug 0,32 wie im Altpfad. Die Haltezeit-Weiche in `world-pitch-actions-v99.js` rechnet für markierte Partien ohne `finish` 2,4 s über `v183ClockUnits` (Hinweis aus SI-0). Unmarkierte Partien rechnen weiter mit `2.4*MATCH_SPEED`. Bei Rate 0,78 ist das Ergebnis gleich, weil die Multiplikation kommutativ ist; `check-old-matches-v183` ist grün.
- **Umhüllung `v55Shoot`:** Der neue Pfad ersetzt die Kette unterhalb dieses Moduls (v99/v102 nachgebildet). Eine Hülle, die ein früher geladenes Paket (`clock`, `defence`) um `v55Shoot` legt, würde für Partien mit `finish` übergangen. SI-0 und SI-4 umhüllen `v55Shoot` laut Plan nicht. Konstanten im Rumpf `pitch-v55.js:402-434` wirken im neuen Pfad nicht.
- **Offene SI-K-Entscheidung Schussdruck:** Der neue Pfad wertet Druck als gewichtete Summe `Σ(1 − d/2,5 m)` mit dem eigenen Parameter `finish.pressureRadius`. SI-4 führt für denselben Ort (`pitch-v55.js:403`) `defence.shotPressureRadius` (9 m, Zählung). Beide Größen sind nicht gleichbedeutend; SI-K entscheidet, ob und wie sie zusammengeführt werden (Kalibrierung von `pressureGain` beachten). Blockerwahl und Blockchance bleiben die Altformel.
- **Torwartposition** (`v159KeeperTarget`, `v115KeeperTarget`) unverändert. Die Torwartstärke wirkt über Reichweite, Reaktion und Seitwärtstempo; das gk-abhängige Vorrücken aus Zielbild 4.5 ist nicht umgesetzt und für das Kriterium nicht nötig.
- **Unity:** keine Änderung. Paraden nutzen die vorhandenen Keeper-Clips; Endhöhe und `over` folgen dem Modell. Die Paritätsaufzeichnung einer Parade mit Abpraller in Unity ist nicht durchgeführt (offen für U-1/SI-K). P03: native Folge im Pakettest aufgezeichnet; Nutzerabnahme offen.
- **Messwerkzeug (Weichenbedarf SI-F):** Für die Kalibrierung war ein Export des flüchtigen Protokolls je Partie nötig. Die verwendete Kopie von `measure-si183.cjs` mit Feld `finishTrace` ist nicht eingecheckt; eine Option `--exportTrace` im SI-F-Werkzeug würde SI-K helfen.
- **Gemeinsame SI-F-Prüfungen:** übernommen aus `integration/si-r133` (`213ebdf6`, `ef78fca6`), auf diesem Branch unverändert.
- Keine Spielstandmigration, keine Fähigkeitszahlen in Texten (die Meldungen bleiben die bisherigen), B03 unberührt.
