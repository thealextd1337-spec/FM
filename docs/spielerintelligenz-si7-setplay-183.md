# Spielerintelligenz 183: SI-7 Flanken, Ecken und Kopfball

Stand: 15. Oktober 2026. Branch `feat/si-setplay` (Worktree `work/si-setplay`) auf `integration/si-r133` (`5ec465e6`, enthält SI-F; nachgezogen auf `ef78fca6`: angepasste gemeinsame Prüfungen, Stubs mit `stub:true`; Merge von `7c6c9e82` mit SI-0, Uhrpaket per Vorgabe an; Merge von `b28e3ab6` mit B19 und SI-3, damit echtes `v183ShotEstimate`/`v183DirectFreeKick`). Umsetzung des Pakets SI-7 aus dem [Umsetzungsplan](spielerintelligenz-umsetzungsplan-2026-10-14.md) (Abschnitte 6.3, 7 „SI-7“, 8.3, 9). Neue Logik wirkt nur bei `v183Active(m,'setplay')`; unmarkierte, 182- und markierte Partien mit ausgeschaltetem Paket laufen byteidentisch weiter.

## Umfang

Ein Modul `dist/match-si-setplay-v183.js`; keine Lade- oder Buildliste geändert. Es umhüllt für aktive Partien:

| Funktion (Altdatei) | Neues Verhalten |
| --- | --- |
| `v55HighPass` (`pitch-v55.js:313-340`) | Flankenfehler fähigkeitsabhängig nach dem B10-Muster (`v183CrossLanding`: Streuung aus Passspiel/Technik und Druck, kleiner Anteil großer Fehler) statt der Pauschalvarianten 19/19/12 %. Ecken behalten `v182CornerLanding` unverändert (B10-Fehlerlogik, gleiche drei Ziehungen). Druckradius in Metern über `v183Radius(m,'setplay.pressureRadius',.15)`. Flugzeit in Echtzeit (`max(flightMin, Meter/Tempo)`, an `fly()` im Altmaß Sekunden × `MATCH_SPEED` übergeben; die SI-0-Flugregel `v115FlightDuration` rechnet auf die Partierate um). Flankenblock durch einen nahen Gegner vor dem Flankengeber (H6): Abpraller ins Toraus (Ecke) oder freier Ball. Ledger-Quelle `cross`, Auslöser `attackFlow.setplay.secondBall` für SI-2 (H8). |
| `v122PlanAir` (`:290-308`) | Kandidaten über Erreichbarkeit statt 0,65 m: Ankunft innerhalb der Flugzeit (Reaktion minus Stellungsspiel, Grundtempo × `approachPace`) plus persönliche Reichweite. Bis zu zwei Anwärter je Team laufen zum Landepunkt; ohne Anwärter verfolgt der schnellste Läufer. |
| `v122ResolveAir` (`:367-400`) | Luftduell mit Reichweite aus Luftspiel, Körpergröße und Anlauf; Siegchance aus Luftspiel, Stellungsspiel, Restreichweite, Anlauf und Größe. Gewinnt der Verteidiger, klärt er mit Wahrscheinlichkeit aus Strafraum/Druck/`air−tec` über `v183Clearance` (SI-4; `out:true` wird als Kopfball über die Linie ausgeführt), sonst Kontrolle. Gewinnt der Angreifer: `v183AirFinish`, sonst Ablage (Kopfballpass) oder Kontrolle; Fehlannahme als freier Ball. Unerreichte Bälle bleiben physische freie Bälle (B10). |
| `v183AirFinish` (Weiche `:391-392`) | Kopfball innerhalb `finishRange` (12 m) und `v115HeaderRange`, Volley bis `volleyRange` (14 m) für technisch starke Spieler; Winkel begrenzt. Chance aus Nähe, `v183ShotEstimate(m,winner,end,{kind}).xg` (SI-3-Torwahrscheinlichkeit je Abschlussart, seit dem Merge von `b28e3ab6` live; ohne Finish-Paket der Stub `v157ShotQuality` mit `stub:true`, der in besetzten Strafräumen meist 0 liefert, weshalb der Abstand den Hauptteil der Chance trägt), Deckung und Druck, skaliert mit (`air` bzw. `fin` + `tec`). Eine Ziehung nur im Fenster. |
| `v183CrossEstimate` | Siehe unten. |
| `v131CornerFormation` (`set-pieces-v50.js:89-101`) | Varianten nah/mittig/weit (+kurz); Zielspieler nach Luftspiel; vierter Angreifer im Rückraum (`cornerBack` 17 m, H8) als `setPiece.cornerBackPid`; Verteidiger decken die drei Strafraumangreifer nach Luftspiel/Stellungsspiel. |
| `v182FreeKickPlan` (`:283-290`), `v50TakeFreeKick` (`pitch-v55.js:521`), `v50BestTaker` (`set-pieces-v50.js:71`) | Ein Besitzer für „bester Schütze“: Schützenbewertung über `v183FinishSkill(p,'direct-free-kick')` (SI-3, `.7·fin+.3·tec`; ohne SI-3 dieselbe Formel). Der direkte Freistoß ist nur für den besten Schützen auf dem Feld innerhalb seines Fensters vorgesehen (mit aktivem Finish-Paket `finish.fkRangeBase+finish.fkRangeFin·fin` von SI-3, sonst `setplay.freeKickRange/RangeFin`; freier Winkel). Bei aktivem Finish-Paket (`v183Active(m,'finish')`) ist der Plan bei der Erzeugung (vor Mauer und Verteidigern) nur vorläufig (`plan.provisional`); bei der Ausführung, wenn die Mauer steht, fragt `v50TakeFreeKick` die Empfehlung `v183DirectFreeKick(m,setPiece)` (Abstand, freier Winkel, Torwahrscheinlichkeit inklusive Block; keine Ziehung) und weicht bei Ablehnung auf die Flanken-/Passvariante aus den aktuellen Positionen aus (`plan.revised='direct'`, Plain-Daten). Ohne Finish-Paket entscheidet bei der Erzeugung eine Ziehung nach `fin`. `v50BestTaker` wählt für Freistöße im Fenster den besten Schützen, für Freistöße mit Flankenvariante (12–36 m, ≥2 Mitspieler nahe am Tor) den besten Flankengeber (`.6·pas+.4·tec`), sonst den bisherigen Ausführenden (sichtbares Versetzen laut Nutzerentscheidung). Die Freistoßflanke wird mit `restart:true` getreten, damit `v157ContinueTurn` die Drehung bei nahem Gegner nicht verwirft. Sonst Flanke auf den besten Kopfballspieler, wenn ≥2 Mitspieler nahe am Tor stehen und der Punkt 12–36 m entfernt liegt (`plan.kind='cross'`, Ausführung als `v55HighPass` mit `cross:true`), sonst der bisherige kurze Pass. Der Plan bleibt Plain-Daten im `setPiece`. |

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

Reichweite `reachBase .9` m (+`reachAir .05`/Punkt, +`reachHeight .01`/cm, +`reachRun .12`/m/s bis `reachRunMax .5`); Planung `reaction .32`, `reactionPos .011`, `approachPace 1.45`, `contenders 2`; Duell `duelAir .035`, `duelPos .008`, `duelDistance .16`, `duelRun .03`, `duelHeight .004`, Grenzen `.12–.88`; Klärung `clearBase .5`, `clearBox .3`, `clearPressure .14`, `clearAirTec .012`; Abschluss `finishRange 12`, `volleyRange 14`, `finishBase .6`, `finishDistance .035`, `finishMarked .15`, `finishPressure .05`, `finishXg 2` (Gewicht auf die SI-3-Torwahrscheinlichkeit, die für Kopfbälle aus 8–11 m etwa 0,02–0,08 beträgt; mit dem Stub, der frei stehende Kopfbälle nahe 0,9 bewertete, lag die Abschlussquote der Flankenszene bei 33 %, mit echtem SI-3 und alten Gewichten bei 19 %, mit den neuen Gewichten bei 28 %); Ablage/Kontrolle `layOffBase .12`, `layOffPas .014`, `controlBase .25`, `controlDistance .25`; Flankenfehler `crossSpread .9`, `crossSpreadSkill .2`, `crossSpreadPressure .5`, `crossLarge .03`, `crossLargeSkill .008`, `crossLargePressure .02`, `crossLargeMax .2`; Flug `crossSpeed 20`, `cornerSpeed 16`, `flightMin .7`; Druck/Block `pressureRadius 3` (Flankenfehler und Schätzung), `cornerPressureRadius 9` (Druckeingang der B10-Eckenlogik, Altwert 0,15 normiert; gemeinsame SI-K-Festlegung mit SI-4), `blockRadius 1.8`, `blockBase .12`, `blockTak .012`, `blockMax .4`, `blockCorner .45`, `blockCornerDepth 20`; Ecke `cornerBack 17`; Freistoß `freeKickRange 14`, `freeKickRangeFin .6`, `freeKickDirectBase .35`, `freeKickDirectFin .04` (nur ohne Finish-Paket; mit Finish-Paket gelten `finish.fkRangeBase`/`finish.fkRangeFin` von SI-3 und `v183DirectFreeKick`), `freeKickCrossAllies 2`; `settle .7` s. Alle Werte sind Kalibriergrößen für SI-K.

## Zufall, Marker, Restore

- Ziehungen des aktiven Pfads sind im Modulkopf benannt (`setplay.landX/landY/landVariant`, `setplay.block/blockDirection`, `setplay.duel`, `setplay.clear/clearLateral`, `setplay.airFinish`, `setplay.layOff/control`, `setplay.cornerVariant`, `setplay.freeKickDirect`). Alte Pfade erhalten keine Ziehung; `v183Clearance` erhält die Ziehung des Aufrufers und zieht selbst nicht.
- Marker-Gating ausschließlich über `v183Active(m,'setplay')`; `v183EnableByDefault('setplay')` schaltet das Paket für neue Partien ein (Abschluss).
- Zustand als Plain-Daten: `setPiece.plan {direct,targetPid,kind}`, `setPiece.cornerBackPid`, `attackFlow.setplay.secondBall {team,at,x,y,kind}`. Der Luftplan je Flug ist flüchtig (während eines Flugs gibt es keinen Speicherpunkt). Restore-Nachweis im Test: Ecken- und Freistoßplan überstehen den JSON-Speicherpunkt und werden danach wie geplant ausgeführt; `secondBall` und `match.si` bleiben gleich, die Partie läuft weiter.

## B10-Folgeball

Eckenprobe aus `work/test-si-setplay-v183.cjs` (Konstruktorpartien, beide Seiten und Teams, Ausführende mit Passspiel/Technik 6/12/18, 12 Seeds; gezählt werden hohe Ecken, kurze Varianten ausgenommen; SI-4 ausgeschaltet, damit nur die Erreichbarkeit von SI-7 gemessen wird und nicht Klärungen ins Seitenaus):

| Erstes Ereignis nach hoher Ecke | Paket aus (182-Regeln) | Paket an |
| --- | ---: | ---: |
| **unerreichter Landepunkt (B10-Maß)** | 6,8 % | **5,3 %** (7/133) |
| unerreicht gelandet und ins Seitenaus gerollt | 15,0 % | 2,3 % (3/133) |
| direkt ins Aus (B10-Fehlermodell, unverändert) | 0,8 % | 0,8 % |
| Angreifer / Verteidiger / Torwart am Ball, Tor (mit SI-3) | – | 55 / 30 / 25 / 16 |

Der Zielwert ≤6 % ist erreicht (Maß: unerreichte Landepunkte; mit eingeschaltetem SI-4 zählen in „ins Seitenaus gerollt“ auch dessen Klärungen über die Linie, deshalb wird dieser Anteil nur bei ausgeschalteter Verteidigung verglichen). Die Fehlerlogik der Ecke (`v182CornerLanding`) und die Folgeballphysik sind unverändert; auch der Druckeingang der Eckenfehlerlogik bleibt beim Altradius (`cornerPressureRadius` 9 m ≈ 0,15 normiert: 7,3 m quer, 11 m längs). Die Verbesserung kommt aus der Erreichbarkeit (Anwärter beider Teams laufen zum Landepunkt, Reichweite statt 0,65 m). Der alte 16-%-Wert stammt aus `test-corner-quality-v182.cjs` (Fixture-Personen, 2.200 Ecken); diese Prüfung bleibt grün, weil sie unmarkierte Partien und 182-Partien misst.

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
| Flanke von außen (20 m) auf Empfänger 9 m vor dem Tor mit Gegenspieler 1,2 m torseitig, 36 Seeds (Stand `b28e3ab6` mit echtem SI-3): angekommen | 5,6 % | 36,1 % |
| … Kopfball-/Volleyschuss | 2,8 % | 27,8 % (mit SI-F-Stub 33,3 %) |
| … unerreicht gelandet | 55,6 % | 2,8 % |
| Luftduell am Landepunkt, 200 Seeds: Siegquote Angreifer Luftspiel 16 gegen 8 / 8 gegen 16 / 12 gegen 12 | – | 88,5 % / 26,0 % / 59,0 % (Abstand 62 Punkte, Ziel ≥15) |

**Kontrolle mit echtem SI-3** (nach dem Merge von `b28e3ab6`; 48 Partien, 24 Vereine × 2 Feldgrößen, Vorgaben der neuen Partie = Uhr + Finish + Setplay, Uhr 0,42, Lane B Port 4258, `si7-si3-smoke48`): 6,94 Schüsse, 2,04 Tore, 0,96 Flanken (0,31 angekommen, 32,6 %), **0,167 Kopfball-/Volleyschüsse je Partie mit 3 von 8 Toren (37,5 %)**, 0,60 Ecken, 0,28 Schüsse ≤10 s nach Ecke je Ecke, Favoriten 67,6 % (N 34). Die Werte sind ungepaart gegen die SI-F-Basis (die Schuss- und Torzunahme stammt aus SI-3, die Freistoß-/Foulzunahme aus dem Integrationsstand) und dienen nur der Plausibilitätskontrolle der Kopfballkette; Kopfbälle werden mit SI-3 in der Ausführung deutlich besser verwertet als vom Stub geschätzt. Mit der SI-3-Torwahrscheinlichkeit als Eingabe wurden die Abschlussparameter neu skaliert (`finishBase .6`, `finishXg 2`, `finishMarked .15`, `finishPressure .05`), weil SI-3 Kopfbälle aus 8–11 m mit 0,02–0,08 bewertet und die Abschlussneigung der Szene sonst von 33 auf 19 % gefallen wäre.

Rohdaten: `outputs/si183/sif-base-r042.json`, `outputs/si183/si7-setplay-r042.json`, `outputs/si183/si7-si3-smoke48.json`, Rauchserien `si7-smoke48-a/b.json` (gitignoriert).

## Prüfungen

Node 24 (`C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`), alle grün, sofern in der Übergabe nicht anders ausgewiesen:

- `node work/test-si-setplay-v183.cjs` (neu, 18 Prüfungen): alter Pfad digestgleich zum 182-Konstruktor (alle Pakete aus) und zu den unverhüllten Basisfunktionen (Flanken- und Eckenszene, gleiche Ziehungen); Flankenszene, Flugzeit in Echtzeit bei zwei Raten, Flankenblock, Luftspielstärke, Klärungsziehungen (Verteidigung aus), Kopfball-/Volleyentscheidung, `v183CrossEstimate`, Eckformation und B10-Folgeball (Verteidigung aus), Freistoßplan mit Schützenwahl nach SI-3-Bewertung, SI-3-Kopplung (vorläufiger Plan, Bestätigung bei Ausführung), Freistoßflanke mit nahen Gegnern (Restart wird getreten, Ball fliegt tatsächlich, bester Flankengeber tritt); Restore von Eckformation, Freistoßplan und `secondBall` über den JSON-Speicherpunkt mit Fortsetzung.
- `node work/check-old-matches-v183.cjs` (340 Szenen byteidentisch gegen `e4e531c0`; Integrationsfassung aus `213ebdf6`, die Altpartien-Gruppe schaltet alle Pakete ausdrücklich aus), `node work/check-old-matches-v182.cjs` (158 Szenen), `node work/test-si-core-v183.cjs` (Integrationsfassung aus `213ebdf6`, die per Vorgabe eingeschaltete Pakete verträgt; die SI-F-Werkzeuge wurden hier nicht verändert).
- Pflichtliste Plan 9: `test-v55`, `test-v56`, `test-v57`, `test-breakaway`, `test-duel-streaks`, `run-native130-tests`, `test-world-match-v64`, `test-world-penalties-v65`, `test-world-goal-scene-v83`, `test-world-physical-instructions`, `test-compact-balance-v178`, `test-player-load-candidate-v158`, `test-native-career-v160`, `test-native-performance-context`, `platform/qa/test-unity-integration-v160`, `platform/qa/test-world-unity-contract`, `test-world-pitch3d-v98`, `test-3d-contacts-v119`, `test-whistle-offside-v119`, `test-keeper-picture-v119`, `platform/qa/test-world-unity-slides`; Release-132-Gates `test-corner-quality-v182`, `test-defensive-pursuit-v182`, `test-freekick-plan-r132`, `test-keeper-hold-v182`, `test-loose-ball-v182`, `test-penalty-quality-v182`, `test-review-fixes-v182`; `node work/build.cjs`.
- Browser-Regressionsschutz `node work/check-match-additions-v148.cjs` nach `node work/build.cjs` und `node work/generate-user-meshy-match.cjs`; Build-Artefakte danach zurückgesetzt.
- Nach dem Merge von SI-0 (`7c6c9e82`) war `node work/test-si-clock-v183.cjs` auf diesem Branch zunächst rot in der Prüfung „clock package at the 182 rate … replays 182 exactly“, weil der Helfer `clockSi` neben `clock` auch die übrigen Vorgabepakete (SI-7) mitlaufen ließ; mit `setplay:false` im Helfer waren alle 22 Prüfungen grün, die vier Rateninvarianz-Prüfungen auch mit SI-7. Seit `58e576be` (in `b28e3ab6`) isoliert der Uhrtest das Uhrpaket selbst; auf dem gemergten Stand läuft er wieder mit.
- Auf dem Stand `b28e3ab6` (B19, SI-0-Korrekturen, SI-3) und erneut nach den Review-Korrekturen (`739686a6`): `node work/check-restore-completeness-v183.cjs --port=4256 --quick` (Lane B) **grün**, 10 Szenen inklusive Ecke, Freistoß und Paketzustand, Fortsetzung bis zum Abpfiff fehlerfrei; keine unklassifizierte WeakMap – SI-7 führt keine eigenen modulweiten WeakMaps, sein Zustand liegt in `setPiece.plan`, `setPiece.cornerBackPid` und `attackFlow.setplay`. Dazu `test-si-finish-v183`, `test-freekick-plan-r132`, `test-corner-quality-v182` und `test-penalty-quality-v182` (siehe Übergabe).
- Probe-Merge mit `feat/si-defence` (SI-4, `05e0bbfe`) in einem temporären Worktree, nicht committet: Pakettest, `test-si-core-v183` und `check-old-matches-v183` auf dem gemergten Stand (Ergebnis in der Übergabe); die SI-4-Isolierung (`defence:false`) in Klärungs- und Eckenszenen stammt aus diesem Befund.

## Geltungsbereich, bewusste Wahlen und SI-K-Punkte

- `v183CrossLanding` gilt für **alle** `v55HighPass`-Aufrufe aktiver Partien, nicht nur Flanken: auch Torwart-Hochbälle und die hohen Bälle `v162TryHighPass` erhalten den fähigkeitsabhängigen Fehler; der Altfall „9 % seitlich ins Aus“ für hohe Bälle entfällt (große Fehler landen als Über- oder Unterschlag, ins Aus nur bei einem Überschlag über die Linie). Ecken behalten `v182CornerLanding`.
- `cornerSpeed` 16 m/s statt der Flugregel 20 m/s ist eine bewusste Wahl (höhere Flugkurve der Ecke, ≈25 % längere Eckenflüge, mehr Zeit für die Anwärter); `crossSpeed` bleibt 20. Beides sind SI-K-Kalibriergrößen.
- Flankenblock: SI-7 löst den Block eines nahen Gegners vor dem Flankengeber in der Ausführung auf (`blockRadius` 1,8 m, Chance nach `tak`, Ecke innerhalb `blockCornerDepth`); die Positionierung des Blockers am Flankengeber gehört SI-4. Beide Seiten sollten in SI-K gemeinsam abgenommen werden, damit Block- und Druckradien zusammenpassen; `pressureRadius` 3 m (Flankenfehler, Schätzung) und `cornerPressureRadius` 9 m (B10) sind dort mit SI-4 festzulegen.
- Flanken aus dem Spiel (ohne Ecken) liegen auf der SI-F-Basis bei ≈0,1 und mit SI-3 bei ≈0,3 je Partie; das Ziel ≥2,0 hängt an der Flankenentscheidung (SI-1 über `v183CrossEstimate`), der Boxbesetzung (SI-2) und den Eckenquellen aus Blocks/Klärungen (SI-4).
- Nachmessungen für SI-K: Kopfball-xG der SI-3-Schätzung gegen die tatsächliche Ausführung (Kontrolle: 37,5 % Tore je Kopfballschuss bei Schätzwerten 0,02–0,08); B10-Maß im Gesamtstand mit SI-4 (dort zählen Klärungen ins Seitenaus getrennt); gepaarte SI-3+SI-7-Serie gegen SI-3 allein (die Harness `measure-si183.cjs` kann einzelne Vorgabepakete bislang nicht abschalten, nur `--packages=none` oder eine Liste zusätzlich eingeschalteter Pakete).

## Weichenbedarf und Hinweise an andere Pakete

- SI-1 (`v157Decide`): Flankenhäufigkeit bleibt bis zum SI-1-Merge die heutige Regel (<26 m, >9 m seitlich, Box besetzt, Chance `.55`); `v183CrossEstimate` steht bereit.
- SI-2: `attackFlow.setplay.secondBall` als Auslöser für den Rückraumläufer (H8); Eckformation besetzt den Rückraum bereits selbst.
- SI-4: `v183Clearance` darf `out:true` liefern; das Modul führt den Kopfball dann über die Linie aus (Ecke/Einwurf).
- SI-0 (gemergt, `7c6c9e82`): `fly()`-Dauern werden im Altmaß (Sekunden × `MATCH_SPEED`) übergeben und von `v115FlightDuration` über `v183Rate(m)` auf die Partierate umgerechnet; Wartezeiten laufen über `v183ClockUnits`. Die Echtzeit der Flanken-, Ecken-, Block- und Klärungsflüge ist damit ratenunabhängig (Test: gleiche Sekunden bei Rate 0,5 und 0,78).
- SI-K: `setplay.pressureRadius` an den SI-4-Druckradius angleichen.
