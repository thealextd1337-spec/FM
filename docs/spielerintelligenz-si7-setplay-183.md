# Spielerintelligenz 183: SI-7 Flanken, Ecken und Kopfball

Stand: 15. Oktober 2026. Branch `feat/si-setplay` (Worktree `work/si-setplay`) auf `integration/si-r133` (`5ec465e6`, enthält SI-F; nachgezogen auf `ef78fca6`: angepasste gemeinsame Prüfungen, Stubs mit `stub:true`). Umsetzung des Pakets SI-7 aus dem [Umsetzungsplan](spielerintelligenz-umsetzungsplan-2026-10-14.md) (Abschnitte 6.3, 7 „SI-7“, 8.3, 9). Neue Logik wirkt nur bei `v183Active(m,'setplay')`; unmarkierte, 182- und markierte Partien mit ausgeschaltetem Paket laufen byteidentisch weiter.

## Umfang

Ein Modul `dist/match-si-setplay-v183.js`; keine Lade- oder Buildliste geändert. Es umhüllt für aktive Partien:

| Funktion (Altdatei) | Neues Verhalten |
| --- | --- |
| `v55HighPass` (`pitch-v55.js:313-340`) | Flankenfehler fähigkeitsabhängig nach dem B10-Muster (`v183CrossLanding`: Streuung aus Passspiel/Technik und Druck, kleiner Anteil großer Fehler) statt der Pauschalvarianten 19/19/12 %. Ecken behalten `v182CornerLanding` unverändert (B10-Fehlerlogik, gleiche drei Ziehungen). Druckradius in Metern über `v183Radius(m,'setplay.pressureRadius',.15)`. Flugzeit in Echtzeit (`max(flightMin, Meter/Tempo)` über `v183ClockUnits`; die Untergrenze `v115FlightDuration` in Uhreinheiten bleibt bis SI-0). Flankenblock durch einen nahen Gegner vor dem Flankengeber (H6): Abpraller ins Toraus (Ecke) oder freier Ball. Ledger-Quelle `cross`, Auslöser `attackFlow.setplay.secondBall` für SI-2 (H8). |
| `v122PlanAir` (`:290-308`) | Kandidaten über Erreichbarkeit statt 0,65 m: Ankunft innerhalb der Flugzeit (Reaktion minus Stellungsspiel, Grundtempo × `approachPace`) plus persönliche Reichweite. Bis zu zwei Anwärter je Team laufen zum Landepunkt; ohne Anwärter verfolgt der schnellste Läufer. |
| `v122ResolveAir` (`:367-400`) | Luftduell mit Reichweite aus Luftspiel, Körpergröße und Anlauf; Siegchance aus Luftspiel, Stellungsspiel, Restreichweite, Anlauf und Größe. Gewinnt der Verteidiger, klärt er mit Wahrscheinlichkeit aus Strafraum/Druck/`air−tec` über `v183Clearance` (SI-4; `out:true` wird als Kopfball über die Linie ausgeführt), sonst Kontrolle. Gewinnt der Angreifer: `v183AirFinish`, sonst Ablage (Kopfballpass) oder Kontrolle; Fehlannahme als freier Ball. Unerreichte Bälle bleiben physische freie Bälle (B10). |
| `v183AirFinish` (Weiche `:391-392`) | Kopfball innerhalb `finishRange` (12 m) und `v115HeaderRange`, Volley bis `volleyRange` (14 m) für technisch starke Spieler; Winkel begrenzt. Chance aus Nähe, `v183ShotEstimate(m,winner,end,{kind}).xg` (SI-3-Torwahrscheinlichkeit je Abschlussart; bis zum SI-3-Merge der Stub `v157ShotQuality` mit `stub:true`, der in besetzten Strafräumen meist 0 liefert, weshalb der Abstand den Hauptteil der Chance trägt), Deckung und Druck, skaliert mit (`air` bzw. `fin` + `tec`). Eine Ziehung nur im Fenster. |
| `v183CrossEstimate` | Siehe unten. |
| `v131CornerFormation` (`set-pieces-v50.js:89-101`) | Varianten nah/mittig/weit (+kurz); Zielspieler nach Luftspiel; vierter Angreifer im Rückraum (`cornerBack` 17 m, H8) als `setPiece.cornerBackPid`; Verteidiger decken die drei Strafraumangreifer nach Luftspiel/Stellungsspiel. |
| `v182FreeKickPlan` (`:283-290`), `v50TakeFreeKick` (`pitch-v55.js:521`), `v50BestTaker` (`set-pieces-v50.js:71`) | Direkter Freistoß nur durch den besten Schützen auf dem Feld innerhalb `14+0,6·fin` m bei freiem Winkel. Mit SI-3 (`feat/si-finish`) ist der Plan bei der Erzeugung (vor Mauer und Verteidigern) nur vorläufig (`plan.provisional`); bei der Ausführung, wenn die Mauer steht, fragt `v50TakeFreeKick` die Empfehlung `v183DirectFreeKick(m,setPiece)` (Abstand, freier Winkel, Torwahrscheinlichkeit inklusive Block; keine Ziehung) und weicht bei Ablehnung auf die Flanken-/Passvariante aus den aktuellen Positionen aus (`plan.revised='direct'`, Plain-Daten). Ohne SI-3 (`typeof v183DirectFreeKick!=='function'`) entscheidet bei der Erzeugung eine Ziehung nach `fin` im selben Fenster. Der beste Schütze wird für solche Freistöße Ausführender (sichtbares Versetzen laut Nutzerentscheidung). Sonst Flanke auf den besten Kopfballspieler, wenn ≥2 Mitspieler nahe am Tor stehen und der Punkt 12–36 m entfernt liegt (`plan.kind='cross'`, Ausführung als `v55HighPass` mit `cross:true`), sonst der bisherige kurze Pass. Der Plan bleibt Plain-Daten im `setPiece`. |

Nicht verändert: Schussmodell (`v55Shoot`, SI-3), Klärungsziel (`v183Clearance`, SI-4), Flankenentscheidung des Ballführers (`v157Decide`, SI-1), Folgeballphysik (`world-ball-motion-v110.js`, `world-corner-ball-v109.js` nur Darstellung).

## `v183CrossEstimate(m,p,target)`

Deterministisch, keine Zufallsziehung. `target` ist ein Mitspieler oder ein Punkt; ohne Mitspieler gilt der nächste eigene Feldspieler am Punkt als Empfänger.

| Feld | Bedeutung |
| --- | --- |
| `eligible` | Geometrie erlaubt eine Flanke: Flankengeber ≤32 m vom Tor und ≥6 m seitlich, Ziel im Feld, ≤20 m vom Tor, ≤14 m seitlich, ≥7 m entfernt (näher wird ein Bodenpass). |
| `arrival` | Wahrscheinlichkeit, dass ein Mitspieler den Ball am Landepunkt gewinnt: `(1−block) × land × duel`. `land` = Anteil der Fehlerstreuung innerhalb der Reichweite des Empfängers (ohne große Fehler); `duel` = Siegchance gegen den nächsten Verteidiger, der bis zur Landung noch herankommt (0,92 ohne einen solchen). 0 bei Abseits (`offside:true`). |
| `headerXg` | Torerwartung des Abschlusses **bedingt auf Ankunft**: Abschlusschance nach Distanz × Verwertung. Verwertung = `v183ShotEstimate(m,Empfänger,Landepunkt,{kind:'header'}).xg` (Torwahrscheinlichkeit des SI-3-Platzierungsmodells), solange nur der Stub (`stub:true`) vorliegt eine Formel aus `fin`/`air` und Distanz (0,04–0,35). Optionswert für SI-1/SI-2 = `arrival × headerXg`. |
| `landing`, `receiverPid`, `block`, `land`, `duel`, `pressure`, `spread` | Diagnose. |

Bei inaktivem Paket liefert die Funktion den SI-F-Stub (heutige Flankenbedingung, Ankunft 0,5, seit `ef78fca6` mit `stub:true`); die echte Schätzung trägt kein Feld `stub`, daran erkennt SI-1 den Unterschied.

## Parameter (`match.si.params.setplay`, Vorgaben im Modul)

Reichweite `reachBase .9` m (+`reachAir .05`/Punkt, +`reachHeight .01`/cm, +`reachRun .12`/m/s bis `reachRunMax .5`); Planung `reaction .32`, `reactionPos .011`, `approachPace 1.45`, `contenders 2`; Duell `duelAir .035`, `duelPos .008`, `duelDistance .16`, `duelRun .03`, `duelHeight .004`, Grenzen `.12–.88`; Klärung `clearBase .5`, `clearBox .3`, `clearPressure .14`, `clearAirTec .012`; Abschluss `finishRange 12`, `volleyRange 14`, `finishBase .5`, `finishDistance .035`, `finishMarked .18`, `finishPressure .07`, `finishXg .5`; Ablage/Kontrolle `layOffBase .12`, `layOffPas .014`, `controlBase .25`, `controlDistance .25`; Flankenfehler `crossSpread .9`, `crossSpreadSkill .2`, `crossSpreadPressure .5`, `crossLarge .03`, `crossLargeSkill .008`, `crossLargePressure .02`, `crossLargeMax .2`; Flug `crossSpeed 20`, `cornerSpeed 16`, `flightMin .7`; Druck/Block `pressureRadius 3`, `blockRadius 1.8`, `blockBase .12`, `blockTak .012`, `blockMax .4`, `blockCorner .45`; Ecke `cornerBack 17`; Freistoß `freeKickRange 14`, `freeKickRangeFin .6`, `freeKickDirectBase .35`, `freeKickDirectFin .04`, `freeKickCrossAllies 2`; `settle .7` s. Alle Werte sind Kalibriergrößen für SI-K.

## Zufall, Marker, Restore

- Ziehungen des aktiven Pfads sind im Modulkopf benannt (`setplay.landX/landY/landVariant`, `setplay.block/blockDirection`, `setplay.duel`, `setplay.clear/clearLateral`, `setplay.airFinish`, `setplay.layOff/control`, `setplay.cornerVariant`, `setplay.freeKickDirect`). Alte Pfade erhalten keine Ziehung; `v183Clearance` erhält die Ziehung des Aufrufers und zieht selbst nicht.
- Marker-Gating ausschließlich über `v183Active(m,'setplay')`; `v183EnableByDefault('setplay')` schaltet das Paket für neue Partien ein (Abschluss).
- Zustand als Plain-Daten: `setPiece.plan {direct,targetPid,kind}`, `setPiece.cornerBackPid`, `attackFlow.setplay.secondBall {team,at,x,y,kind}`. Der Luftplan je Flug ist flüchtig (während eines Flugs gibt es keinen Speicherpunkt). Restore-Nachweis im Test: Ecken- und Freistoßplan überstehen den JSON-Speicherpunkt und werden danach wie geplant ausgeführt; `secondBall` und `match.si` bleiben gleich, die Partie läuft weiter.

## B10-Folgeball

Eckenprobe aus `work/test-si-setplay-v183.cjs` (Konstruktorpartien, beide Seiten und Teams, Ausführende mit Passspiel/Technik 6/12/18, 12 Seeds; gezählt werden hohe Ecken, kurze Varianten ausgenommen):

| Erstes Ereignis nach hoher Ecke | Paket aus (182-Regeln) | Paket an |
| --- | ---: | ---: |
| unerreicht gelandet und ins Seitenaus gerollt (B10-Folgeball) | 15,0 % | **3,8 %** (5/133) |
| unerreichter Landepunkt insgesamt | 6,8 % | 4,5 % |
| direkt ins Aus (B10-Fehlermodell, unverändert) | 0,8 % | 0,8 % |
| Angreifer / Verteidiger / Torwart am Ball, Tor | – | 67 / 31 / 20 / 8 |

Der Zielwert ≤6 % ist erreicht. Die Fehlerlogik der Ecke (`v182CornerLanding`) und die Folgeballphysik sind unverändert; die Verbesserung kommt aus der Erreichbarkeit (Anwärter beider Teams laufen zum Landepunkt, Reichweite statt 0,65 m). Der alte 16-%-Wert stammt aus `test-corner-quality-v182.cjs` (Fixture-Personen, 2.200 Ecken); diese Prüfung bleibt grün, weil sie unmarkierte Partien und 182-Partien misst.

## Messung

Gepaarte 192er-Serie (`work/measure-si183.cjs`, 96 Vereine × 2 Feldgrößen, Seeds `p01r132`, Uhr 0,42 per Override, Lane B Port 4258). Basis: SI-F-Stand `5ec465e6` aus `work/tmp-sif-base` mit `--packages=clock`; Variante: aktueller Stand mit `--packages=clock,setplay`. `dist`-Hashes vor und nach jedem Lauf gleich, 0 Fehler. Auswertung `work/table-si-setplay-v183.cjs sif-base-r042 si7-setplay-r042` (Differenz je Partie, ±95 %).

| Kennzahl je Partie | Basis | SI-7 | Differenz | Ziel SI-7 |
| --- | ---: | ---: | ---: | --- |
| Dauer (min) | 4,21 | 4,25 | +0,04 ±0,07 | – |
| Schüsse | 3,09 | 2,89 | −0,20 ±0,29 | – |
| aufs Tor | 1,10 | 1,11 | +0,01 ±0,20 | – |
| Tore | 0,80 | 0,85 | +0,06 ±0,17 | – |
| Flanken (inkl. Ecken, `stats.crosses`) | 0,21 | 0,17 | −0,04 ±0,08 | ≥2,0 (nicht erreichbar, siehe unten) |
| Flanken angekommen (Anteil) | 0,047 (22,5 %) | 0,068 (39,4 %) | +0,02 ±0,05 | ≥45 % |
| Kopfball-/Volleyschüsse | 0,010 | 0,026 | +0,016 ±0,031 | ≥0,6 |
| Kopfball-/Volleytore | 0 | 0,016 (3 von 5) | +0,016 ±0,018 | 18–28 % |
| Luftduelle | 4,76 | 6,94 | **+2,18 ±0,53** | – |
| Ecken | 0,109 | 0,083 | −0,03 ±0,05 | – |
| Schüsse ≤10 s nach Ecke je Ecke | 0,24 | 0,25 | – | ≥0,3 |
| Freistöße | 4,06 | 4,36 | +0,30 ±0,33 | – |
| Fouls | 3,90 | 4,14 | +0,25 ±0,33 | – |
| Favoriten ≥1 Punkt (N 134) | 42,5 % | 52,2 % | +9,7 Punkte (Rauschprobe ±8) | nicht senken |
| Tordifferenz je Stärkepunkt | 0,204 | 0,228 | – | – |
| Partien in 4–6 min | 68,8 % | 70,3 % | – | – |

Je Feldgröße: Standard Schüsse 3,82 → 3,64, Tore 1,03 → 0,97, Favoriten 50,8 → 60,0 %; groß Schüsse 2,37 → 2,15, Tore 0,56 → 0,74, Favoriten 34,8 → 44,9 %. Alle Differenzen außer den Luftduellen liegen innerhalb der Rauschprobe.

Einordnung: Die SI-F-Basis spielt nur 0,21 Flanken je Partie (die Flankenentscheidung ist die heutige Regel in `v157Decide`, Paket SI-1; der Prototyp der Analyse lag mit eigener Flankenregel bei 1,52). Die Zielwerte „Flanken ≥2,0“ und „Kopfballschüsse ≥0,6“ sind deshalb erst mit SI-1 (Flankenwert über `v183CrossEstimate`) und SI-2 (Boxbesetzung) erreichbar; SI-7 liefert dafür die Ausführung. Messbar sind im vollen Spiel die Luftduelle (+2,2 je Partie, signifikant) und die Ankunftsquote der Flanken (22 → 39 %). Die kontrollierten Szenen der Testsuite zeigen die Paketwirkung direkt:

| Szene (`test-si-setplay-v183.cjs`) | Paket aus | Paket an |
| --- | ---: | ---: |
| Flanke von außen (20 m) auf Empfänger 9 m vor dem Tor mit Gegenspieler 1,2 m torseitig, 36 Seeds: angekommen | 5,6 % | 41,7 % |
| … Kopfball-/Volleyschuss | 2,8 % | 33,3 % (Tore 4 von 12) |
| … unerreicht gelandet | 55,6 % | 2,8 % |
| Luftduell am Landepunkt, 200 Seeds: Siegquote Angreifer Luftspiel 16 gegen 8 / 8 gegen 16 / 12 gegen 12 | – | 88,5 % / 26,0 % / 59,0 % (Abstand 62 Punkte, Ziel ≥15) |

Rohdaten: `outputs/si183/sif-base-r042.json`, `outputs/si183/si7-setplay-r042.json`, Rauchserien `si7-smoke48-a/b.json` (gitignoriert).

## Prüfungen

Node 24 (`C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`), alle grün, sofern in der Übergabe nicht anders ausgewiesen:

- `node work/test-si-setplay-v183.cjs` (neu, 16 Prüfungen): alter Pfad digestgleich zum 182-Konstruktor und zu den unverhüllten Basisfunktionen (Flanken- und Eckenszene, gleiche Ziehungen); Flankenszene, Flankenblock, Luftspielstärke, Klärungsziehungen, Kopfball-/Volleyentscheidung, `v183CrossEstimate`, Eckformation und B10-Folgeball, Freistoßplan; Restore von Eckformation, Freistoßplan und `secondBall` über den JSON-Speicherpunkt mit Fortsetzung.
- `node work/check-old-matches-v183.cjs` (340 Szenen byteidentisch gegen `e4e531c0`; Integrationsfassung aus `213ebdf6`, die Altpartien-Gruppe schaltet alle Pakete ausdrücklich aus), `node work/check-old-matches-v182.cjs` (158 Szenen), `node work/test-si-core-v183.cjs` (Integrationsfassung aus `213ebdf6`, die per Vorgabe eingeschaltete Pakete verträgt; die SI-F-Werkzeuge wurden hier nicht verändert).
- Pflichtliste Plan 9: `test-v55`, `test-v56`, `test-v57`, `test-breakaway`, `test-duel-streaks`, `run-native130-tests`, `test-world-match-v64`, `test-world-penalties-v65`, `test-world-goal-scene-v83`, `test-world-physical-instructions`, `test-compact-balance-v178`, `test-player-load-candidate-v158`, `test-native-career-v160`, `test-native-performance-context`, `platform/qa/test-unity-integration-v160`, `platform/qa/test-world-unity-contract`, `test-world-pitch3d-v98`, `test-3d-contacts-v119`, `test-whistle-offside-v119`, `test-keeper-picture-v119`, `platform/qa/test-world-unity-slides`; Release-132-Gates `test-corner-quality-v182`, `test-defensive-pursuit-v182`, `test-freekick-plan-r132`, `test-keeper-hold-v182`, `test-loose-ball-v182`, `test-penalty-quality-v182`, `test-review-fixes-v182`; `node work/build.cjs`.
- Browser-Regressionsschutz `node work/check-match-additions-v148.cjs` nach `node work/build.cjs` und `node work/generate-user-meshy-match.cjs`; Build-Artefakte danach zurückgesetzt.

## Weichenbedarf und Hinweise an andere Pakete

- SI-1 (`v157Decide`): Flankenhäufigkeit bleibt bis zum SI-1-Merge die heutige Regel (<26 m, >9 m seitlich, Box besetzt, Chance `.55`); `v183CrossEstimate` steht bereit.
- SI-2: `attackFlow.setplay.secondBall` als Auslöser für den Rückraumläufer (H8); Eckformation besetzt den Rückraum bereits selbst.
- SI-4: `v183Clearance` darf `out:true` liefern; das Modul führt den Kopfball dann über die Linie aus (Ecke/Einwurf).
- SI-0: `v115FlightDuration` (Uhreinheiten) begrenzt Flankenflüge weiterhin von unten; die SI-7-Flugzeit steht bereits in Echtzeit.
- SI-K: `setplay.pressureRadius` an den SI-4-Druckradius angleichen.
