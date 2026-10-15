# Spielerintelligenz 183: SI-2 Freilaufen, Muster und Tempo

Stand: 15. Oktober 2026. Branch `feat/si-offball` (Worktree `work/si-offball`) auf `integration/si-r133` (Fundament SI-F `5ec465e6`, zuletzt `ef78fca6` gemergt). Umsetzung des Pakets SI-2 aus dem [Umsetzungsplan](spielerintelligenz-umsetzungsplan-2026-10-14.md) (Abschnitte 6, 7 „SI-2“, 8.3, 9) und des Zielbilds 4.2/4.3 der [Analyse](spielerintelligenz-analyse-2026-10-14.md). Neue Logik nur für Partien mit `match.si.packages.offball`; der Schalter ist für neue Partien eingeschaltet (`v183EnableByDefault('offball')`). Unmarkierte und 182-Partien sowie markierte Partien mit ausgeschaltetem Paket laufen byteidentisch weiter.

## Modul und Umhüllungen

`dist/match-si-offball-v183.js` (Ladeposition laut SI-F). Umhüllt für aktive Partien:

| Funktion | Neues Verhalten |
| --- | --- |
| `v159Offers` | Angebotsmodell für alle Mitspieler ohne Deckungsaufgabe, Boxbesetzung, Hinterlaufen, Doppelpass-Lauf, Konterfenster |
| `v121RunnerTarget` | Nachsetzen während eines eigenen Schusses (Laufweg in die Abprallerzone), Festhalten des Doppelpass-Punkts je Tick und Abseitsklammer: gespeicherte Angebotspunkte werden je Tick auf das vorhergesagte Abseitslimit zurückgezogen, auch während ein Ball zu einem Mitspieler fliegt (Nachsetzen ausgenommen) |
| `v183ReboundFinish` | Direktabschluss nach gewonnenem Abpraller aus Parade/Block innerhalb 18 m, wenn `v183ShotEstimate` ein Fenster zeigt |
| `v183PaceFactor` | Ballführer 1,6× (situativ 1,6× mit Gegner innerhalb 2,5 m, Parameter), eigene Läufe 1,58×; Pressing/Unterstützung/Basis bleiben bei der Vorgängerfunktion (SI-4) |

`v162RecoverTarget`, `v182LooseChasers` und `v154RoleTarget` bleiben unverändert (Zone, Freiballjagd, Rollenziele). `v183Offers` bleibt der SI-F-Stub (lesende Kopie von `attackFlow.intents`), dessen Einträge jetzt `cat`, `pattern` und `value` tragen. Die tote Laufplanung W2 wird wie bisher nicht erreicht.

Keine Zufallsziehung im Modul. Einzige indirekte Wirkung: `v183ReboundFinish` startet nach mehr freien Bällen den vorhandenen nativen Direktversuch mit dessen eigener Ziehung (nur markierte Partien).

## Angebotsmodell

Bei jedem Angebotszyklus (`offerCycle` 1,05 s; früher bei Besitzerwechsel, zugestelltem oder erreichtem Angebot) bewertet jeder Mitspieler ohne Deckungsaufgabe Kandidatenpunkte in Metern relativ zu Ball, Tor und eigener Position:

| Kategorie | Punkt | Bedingung |
| --- | --- | --- |
| `depth` | 6,5–8 m (+0,07·pos) vor dem Ball, ±3,5 m / 7 m seitlich; höchstens `depthRunners` (2) je Zyklus, auch bei fünf Feldspielern | kein Deckungsspieler, keine Erholung |
| `box` | naher Pfosten (Ballseite, 4 m/6 m), Elfmeterpunkt (11 m), zweiter Pfosten (−4 m/7 m) und die größte Lücke zwischen den Verteidigern in Boxbreite (10 m) | Ball < 30 m vor dem Tor; je Punkt ein Spieler |
| `edge` | Rückraum 18 m mittig (zweiter Ball) | Ball < 30 m, keine Abwehrreihe |
| `wide` | Außenbahn (3 m vor der Seitenlinie), 4 m vor dem Ball | breit verankerter Spieler oder Flügel/Dribbler |
| `byline` | Grundlinienlauf (4 m vor der Torlinie) auf der Ballseite | breiter Ball (> 6 m seitlich) innerhalb 32 m |
| `overlap` | Hinterlaufen: 3,5 m außerhalb und 9 m vor dem breiten Ballführer | Ballführer > 8 m seitlich, Mitspieler innerhalb 14 m hinter/neben ihm |
| `support` | 6 m seitlich / 3 m hinter dem Ball, Absicherung 9 m hinter dem Ball | immer |
| `hold` | aktuelle Position | immer (Haltekosten 0,8; nochmals halten +1) |

Wert = Rollengewicht(Kategorie) × (Raum zum nächsten Gegner (≤10 m) + 1,5 bei freier Passlinie + 0,12/m Raumgewinn + 3·xG aus `v183ShotEstimate`) − 0,08/m Laufweg − Drängeln anderer Angebote (5 m, Box 3 m) − 0,25/m jenseits der Formationsleine (12 m, Angriff 16 m) − Abstand zum Ballführer (< 5 m, > 26 m) − 0,15/m Abseitsklammer + Boni (Konter 2, Box bei breitem Ball 3). Punkte jenseits der vorhergesagten Abseitslinie werden auf das Limit aus `v121PreparePositioning` geklammert, bei der Planung und danach je Tick (`v121RunnerTarget`-Umhüllung), also auch während ein Ball zu einem Mitspieler fliegt und die Abwehrlinie aufrückt; nur Nachsetzläufe sind davon ausgenommen. Der Empfänger eines Passes läuft weiter über `interceptTarget`, Raumpässe über `v150RunTarget`; beides bleibt unverändert. Deckungsspieler (Abwehrreihe, Abräumer, ballspielender Verteidiger, negative Ausrichtung) erhalten nur Unterstützungs-, Rückraum- und Haltepunkte innerhalb ihrer Zone, Zielspieler nur Angebote vom Typ `support` (so bleiben sie mit `v157Prepare` verträglich). Läufer des vorigen Zyklus erholen sich 0,55 s (nur Unterstützungsangebote).

Rollenprofile (Kategoriegewichte, Parameter `profiles`): Torjäger Box 1,4; Stoßstürmer Tiefe 1,3; Flügel Breite 1,35 / Grundlinie 1,4; Dribbler Breite/Grundlinie 1,1; Spielmacher Unterstützung 1,35 / Rückraum 1,2; Box-to-Box Hinterlaufen 1,35 / Rückraum 1,2; Zielspieler Box 1,2 / Unterstützung 1,1; Abräumer und ballspielender Verteidiger Unterstützung 1,3. Ohne Rolle gilt die Reihe (Angriff wie Stoßstürmer, Mittelfeld wie Box-to-Box, Abwehr wie ballspielender Verteidiger). Persönlichkeit wirkt nur über `followWeight` (Nachsetzen); Rollengewichte sind Vorlieben, keine Fähigkeiten.

## Muster

- **Doppelpass:** Der Anschlusslauf des Passgebers (`v152AfterPass`/`v159Follow`) wird, solange der Empfänger den Ball kontrolliert (Fenster 1,2 s nach der Freigabe), hinter den Gegner gelegt, der den Passgeber gepresst hat (2,2 m außen, 4,5 m vor dem Presser, mindestens 6 m vor dem Passgeber). Typ `follow` (Lauftempo), `pattern:'one-two'`. Weil `v157Prepare` den Follow-Punkt je Tick neu schreibt, hält `v121RunnerTarget` den Doppelpass-Punkt aus `attackFlow.offball.oneTwo` je Tick fest. Bei bestätigter Kombination erhält der erste Pass die Ledger-Quelle `one-two`; der Rückpass bleibt Entscheidung von SI-1 (`v183PassEstimate` trägt den Rücklaufbonus).
- **Hinterlaufen:** Kategorie `overlap` (oben), `pattern:'overlap'`.
- **Flügel → Grundlinie → Flanke:** Grundlinienlauf des Flügels (`byline`) und Boxbesetzung (`box`, Bonus bei breitem Ball). Die Flankenentscheidung bleibt `v157Decide`/SI-1, die Flankenausführung SI-7.
- **Konter:** Bei einem Ballgewinn in der eigenen Hälfte, dessen gegnerischer Ballbesitz weniger als 2,5 s zurückliegt (Wiederanstöße und Torwarthalten lassen längere Lücken), öffnet sich für 3 s ein Konterfenster: die zwei schnellsten Mitspieler ohne Deckungsaufgabe laufen tief (14 m vor dem Ball, von weiter vorn stehenden Spielern 5 m vor der eigenen Position), `pattern:'counter'`, Bonus 2, Lauftempo; Ledger-Quelle `counter` am aktuellen Ereignis. Das Fenster steht in `attackFlow.offball.counterTeam/counterUntil`.
- **Nachsetzen (H7):** Während ein eigener Schuss fliegt, laufen bis zu zwei Mitspieler (höchstes `followWeight` aus `v183Personality`, gewichtet mit der Nähe zur Zone, innerhalb 24 m vor dem Tor, nicht der Schütze) in die Abprallerzone: 7 m vor der Torlinie, 3,5 m neben dem Zielpunkt des Schusses auf der Seite, zu der der Torwart abwehren würde, und auf der Gegenseite. Start nach einer Reaktion von 0,35 s − 0,015 s je Antizipationspunkt über 10. Die Absicht (`pattern:'follow'`, Typ `depth`) überlebt die Parade, sodass der Nachsetzende der nächste Jäger (`v182LooseChasers`) ist. Zweiter Ball: Rückraumpunkt `edge` und die vorhandene Absicherung der Freiballjagd.
- **Gegenpressing** gehört SI-4 (`v159DefensiveTarget`); SI-2 liefert nur, dass alle Angebote beim Ballverlust sofort verfallen (`v152PrepareAttack`).

## Abprallerabschluss

`v183ReboundFinish(m,winner,point)`: offenes Tor wie bisher; sonst, wenn der freie Ball laut Ledger-Elternkette aus einem Schuss stammt (Parade, Block, Pfosten), der Gewinner höchstens 18 m vor dem Tor steht und `v183ShotEstimate(m,winner,point).window` gilt, startet der native Direktversuch (`v127TryOneTouch`, eigene Fähigkeitsziehung, kann weiter Pass oder Annahme wählen). Ledger-Quelle `rebound` am Freiballereignis.

## Tempo und B02 (nativer Teil)

`v183PaceFactor`: Ballführer `carrierPace` 1,6 (× (0,78+0,009·tec) wie bisher), bei einem Gegner innerhalb `carrierCloseRadius` 2,5 m `carrierClosePace` (Vorgabe 1,6, also derzeit keine Absenkung; Parameter für SI-K). Eigene Läufe (`depth`/`follow`, Grund `run`/`follow` aus `v183PaceReason`) `runPace` 1,58; Pressing (`press`), Unterstützung (1,35) und Basis (1,15) bleiben bei SI-F/SI-4. Keine Wiedergabebeschleunigung: nur die Zielgeschwindigkeit des nativen Körpers ändert sich; Beschleunigung, Bremsen und Drehrate bleiben `v157Move`.

Messung des nativen Körpers in acht Richtungen (`work/test-si-offball-v183.cjs`, Prüfung „B02“, Spieler spd 14 / tec 14 / 74 kg, Standardfeld, Uhr 0,42):

| Modus | Tempo | Schritt je Tick (0,05 s) | 90 % Tempo nach | Beschleunigung 0–0,5 s | Bremsen bis Stillstand | Richtungswechsel 45° / 90° / 135° / 180° (bis 80 % Tempo) |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Ballführer (1,6×) | 7,53 m/s | 0,377 m | 0,70 s | 10,4 m/s² | 0,65 s / 2,31 m | 0,35 / 0,85 / 1,20 / 1,25 s (Mindesttempo 6,9 / 5,2 / 2,9 / 1,2 m/s) |
| Läufer (1,58×) | 8,15 m/s | 0,407 m | 0,75 s | 10,4 m/s² | 0,70 s / 2,71 m | 0,40 / 0,90 / 1,25 / 1,35 s |
| Unterstützer (1,35×) | 6,96 m/s | 0,348 m | 0,65 s | 10,4 m/s² | 0,60 s / 1,93 m | 0,35 / 0,80 / 1,10 / 1,20 s |

Alle acht Richtungen liefern identische Werte (isotropes Körpermodell). Der Ballführer ist nicht mehr der langsamste Spieler (bisher 1,28× ≈ 5,8 m/s). Clipwechsel und Laufzyklen für diese Tempi gehören zu U-1.

## Zustand, Restore, Schnittstellen

- Laufzustand ausschließlich als Plain-Daten: `attackFlow.intents[pid] = {x,y,type,team,at,until,cat,pattern,value}` (vorhandenes Format plus drei Felder), `attackFlow.offball = {team,since,lastAt,counterTeam,counterUntil,oneTwoAt,oneTwo,follow,lastCats}`, dazu die vorhandenen `paceRecovery`/`paceOffers`/`offerOwner`/`offerUntil`. Keine WeakMap. Zeitstempel (`at`, `until`, Fenster) stehen in denselben Sekunden wie die Absichten und die Kombination, mit denen sie verglichen werden (`v152Seconds`); SI-0 bindet diese Funktion an die gespeicherte Rate, sodass nach dem SI-0-Merge `v152Seconds` und `v183Seconds` für markierte Partien übereinstimmen. Mit `v183Seconds` im Modul passten die Fenster bei eingeschaltetem Uhrpaket (nur in der Messung) nicht zu `combo.releaseAt`; der Doppelpass löste dann nie aus und die Anschlussläufe des Passgebers verfielen beim nächsten Zyklus. `v65Snapshot`/`v65Restore` übernehmen alles unverändert; die Prüfung „restore during running intents“ speichert mitten in laufenden Absichten (JSON-Rundlauf über `v65Snapshot`/`v65Restore`), vergleicht Absichten, SI-2-Zustand und Erholungsfenster vor/nach dem Laden und setzt die Partie 300 Ticks fort.
- Für SI-1 (`v183Offers(m)`): jeder Eintrag `{pid,x,y,type,team,at,until,cat,pattern,value}`. `type` `depth` = Lauf (1,58×), `support` = Station (1,35×), `follow` = Anschlusslauf. `cat` ∈ depth, box, byline, overlap, wide, edge, support, hold, follow, one-two. `pattern` ∈ `counter`, `box`, `overlap`, `one-two`, `follow` oder `null`. `value` ist der Angebotswert (Meterskala, nur zum Vergleich innerhalb eines Zyklus). Ein Konterfenster erkennt SI-1 an `pattern:'counter'` auf den Läufern oder an `m.attackFlow.offball.counterTeam === team && counterUntil > v183Seconds(m)`; dort gilt laut Zielbild 4.3 die um 40 % gesenkte Risikoschwelle (SI-1).
- Protokoll: `v183Trace` erhält je Zyklus `{kind:'offers',…}` und je Musterstart `{kind:'pattern',pattern,…}` (`v183OffballPattern`), dazu `{kind:'rebound-finish'}`. Ledger-Quellen: `counter`, `one-two`, `rebound`.

## Parameter (`match.si.params.offball`, Vorgaben)

`carrierPace` 1,6; `carrierClosePace` 1,6; `carrierCloseRadius` 2,5; `runPace` 1,58; `offerCycle` 1,05; `crowdDelay` 0,45; `crowdRadius` 1,1; `reachRadius` 0,65; `recoverySeconds` 0,55; `turnoverGap` 2,5; `depthRunners` 2; `leadBase` 6,5; `leadDeep` 8; `leadPos` 0,07; `boxRange` 30; `wideBall` 6; `boxNear` [4,6]; `boxSpot` [0,11]; `boxFar` [−4,7]; `boxEdge` [0,18]; `boxTaken` 2; `boxGapWidth` 12; `boxGapRange` 20; `boxGapMin` 5; `boxWideBonus` 3; `bylineDepth` 4; `bylineRange` 32; `touchlineGap` 3; `wideAhead` 4; `wideAnchor` 6; `overlapMinWide` 8; `overlapOutside` 3,5; `overlapAhead` 9; `overlapRange` 14; `supportSide` 6; `supportBack` 3; `safetyBack` 9; `oneTwoSeconds` 2,2; `oneTwoOutside` 2,2; `oneTwoAhead` 4,5; `oneTwoPresser` 6; `oneTwoWindow` 1,2; `counterSeconds` 3; `counterLead` 14; `counterRunners` 2; `counterBonus` 2; `followers` 2; `followDepth` 7; `followSide` 3,5; `followRange` 24; `followReaction` 0,35; `followReactionAnt` 0,015; `followSeconds` 2,5; `reboundFinishRange` 18; `zoneLeash` 12; `zoneLeashAtt` 16; `wZone` 0,25; `wSpace` 1; `spaceCap` 10; `wLane` 1,5; `laneClearance` 1,25; `wProgress` 0,12; `wRun` 0,08; `wCrowd` 1,5; `crowdGap` 5; `crowdGapBox` 3; `wXg` 3; `xgRange` 24; `ownerNear` 5; `wOwnerNear` 0,6; `ownerFar` 26; `wOwnerFar` 0,4; `wOffside` 0,15; `holdCost` 0,8; `holdAgain` 1; `profiles` (Rollengewichte). Gespeicherte 183-Partien ohne einen später ergänzten Schlüssel lesen die Vorgabe (`v183Param`).

## Messung gegen die SI-F-Basis

Werkzeuge: `work/measure-si-offball-v183.cjs` (führt `measure-si183.cjs` unverändert im selben Prozess aus und ergänzt lesende Beobachter: bewegte Mitspieler je Ballbesitz ≥ 2 s (Körpertempo ≥ 2,5 m/s), Abseitspfiffe, Abprallergewinn der Angreifer innerhalb 3 s nach Parade/Block, Boxbesetzung bei Flankenabgabe (≤ 16 m vor dem Tor, ≤ 12 m seitlich), Abprallerschüsse ≤ 5 s, Musterzähler, Ledger-Quellen, Tempi; Ergebnis in `extras.offball`) und `work/table-si-offball-v183.cjs <basis> <lauf> [--size=…]` (gepaart je Verein und Feldgröße, ±95 %, Favoriten ≥ 1 Punkt, Tordifferenz je Stärkepunkt). Basis: `work/tmp-sif-base` = `git archive 5ec465e6 dist`, `--packages=clock --clockRate=0.42`; SI-2: `--packages=clock,offball --clockRate=0.42`; Lane C, Ports 4262–4267, Sperre `lane-C.lock`, Einträge in `outputs/si183/queue.log` der Integration. `dist` wird vor und nach jedem Lauf gehasht.

Abschlussserie: 192 gepaarte Partien (96 Vereine × 2 Feldgrößen, Seeds `p01r132`), Basis `si2-base192` gegen `si2-final192c` (endgültige Vorgaben, Abseitsklammer, Zeitbasis `v152Seconds`; Modulstand des Abschlusscommits). Hinweis zur Basis: Die SI-F-Basis bei Uhr 0,42 ohne SI-0 (Takte noch in Uhreinheiten) liegt bei 3,1 Schüssen und 0,80 Toren je Partie, nicht bei den Werten der Prototyp-Kombination `si-max42-norisk` aus der Analyse.

| Kennzahl (Mittel je Partie) | Basis | SI-2 | Differenz (±95 %) | Kriterium |
| --- | ---: | ---: | ---: | --- |
| Tore | 0,80 | 1,01 | +0,21 ±0,18 | +0,2 bis +0,4: erfüllt (Standardfeld −0,02 ±0,26, großes Feld +0,45 ±0,24) |
| Schüsse / aufs Tor | 3,09 / 1,10 | 3,89 / 1,37 | +0,79 ±0,31 / +0,27 ±0,21 | – |
| aufs Tor je Schuss / Tore je Schuss | 36 % / 26 % | 35 % / 26 % | −1 / ±0 Punkte | – |
| Abseits | 0,19 | 0,12 | −0,08 ±0,08 | ≤ 0,5: erfüllt (Standard 0,10, groß 0,13) |
| bewegte Mitspieler je Ballbesitz (≥ 2 s) | 5,21 | 5,13 | −0,08 ±0,03 | ≥ 4: erfüllt (Standard 4,63, groß 5,63) |
| Abprallergewinn der Angreifer nach Parade/Block (≤ 3 s) | 19 % (1,11 Abpraller) | 16 % (1,44 Abpraller) | −3 Punkte | ≥ 35 %: **nicht erreicht**; Abpraller je Partie +0,33 ±0,23, gewonnene +0,02 ±0,09, Direktversuche nach Abpraller 0,04 (Standard 20 %, groß 11 %) |
| Boxbesetzung ≥ 2 bei Flankenabgabe | 57 % | 86 % | +29 Punkte | ≥ 80 %: erfüllt (Standard 78 %, groß 100 %; Flanken 0,24 bzw. 0,14 je Partie) |
| Flanken / angekommen | 0,21 / 30 % | 0,19 / 19 % | −0,02 ±0,10 / −11 Punkte | SI-7 |
| Ecken | 0,11 | 0,16 | +0,05 ±0,08 | – |
| Favoriten ≥ 1 Punkt (N 134) | 43 % | 49 % | +6 Punkte | nicht senken: erfüllt (Standard 51 → 46 % bei N 65, groß 35 → 51 % bei N 69) |
| Tordifferenz je Stärkepunkt | 0,20 | 0,24 | +0,04 | – |
| 0:0 / 2–3 Tore / 4–6 min | 48 % / 18 % / 69 % | 36 % / 26 % / 71 % | | – |
| Dauer (min) | 4,21 | 4,23 | +0,02 ±0,08 | – |
| Pässe / Raumpässe | 70,4 / 5,31 | 67,0 / 4,56 | −3,3 ±1,0 / −0,8 ±0,5 | Ballführer trägt häufiger |
| Fouls / Freistöße | 3,90 / 4,06 | 3,66 / 3,74 | −0,24 ±0,38 / −0,32 ±0,39 | – |
| Tempo Ballführer / Mitspieler (m/s, Mittel) | 2,71 / 3,40 | 2,97 / 3,17 | +0,27 / −0,24 | Mitspieler laufen seltener im Sprint (0,62 → 0,57 der Zeit ≥ 2,5 m/s): Box-/Haltepunkte an der Abseitslinie |
| Muster je Partie: Konter / Nachsetzen / Hinterlaufen / Anschlusslauf hinter den Presser | – | 11,9 / 2,3 / 0,6 / 41,2 | | – |
| Rechenzeit je Partie (Node/Edge) | 13,8 s | 12,9 s | −0,9 ±0,2 | – |

Großes Feld (96 Paare): Schüsse 2,37 → 3,44 (+1,07 ±0,43), Tore 0,56 → 1,01 (+0,45 ±0,24), aufs Tor je Schuss 35 → 38 %, Favoriten 35 → 51 %, 0:0 59 → 36 %, Abseits 0,16 → 0,13, Boxbesetzung 43 → 100 %; das große Feld profitiert am stärksten (Raum für Ballführer-Tempo und Läufe). Standardfeld: Schüsse 3,82 → 4,33 (+0,51 ±0,45), Tore 1,03 → 1,01 (−0,02 ±0,26), aufs Tor je Schuss 36 → 33 %: mehr Nahschüsse aus dem besetzten Strafraum, die der pauschale Wurf in `v55Shoot` unter Druck häufiger danebensetzt (SI-3 ersetzt ihn durch das Platzierungsmodell).

Einordnung der Rauchserien (96 Paare je Variante gegen `si2-base96`, Modulstand vor Abseitsklammer und Zeitbasis): Angebotsmodell ohne das Ballführer-Tempo (Ballführer 1,28×, `si2-vA96`) Tore +0,01 ±0,24, Schüsse −0,07; mit 1,6× (`si2-vB96`) Tore +0,17 ±0,26, Schüsse +0,75 ±0,43; Dynamik-Variante (Haltekosten 1,2, Raumgewinn 0,14, `si2-vC96`) Tore +0,04 ±0,29 ohne messbar mehr Mitspielertempo. Das Ballführer-Tempo ist der Haupthebel (wie in P01); die Vorgaben bleiben die der Variante B. Die 192er-Serie desselben Modulstands (`si2-final192b`, Abseitsklammer, aber noch `v183Seconds`) ergab Tore +0,19 ±0,18 und Favoriten 56 %; dort verfielen die Anschlussläufe der Passgeber beim nächsten Zyklus (Zeitbasis, siehe oben).

Nicht erreicht: **Abprallergewinn ≥ 35 %.** Die Nachsetzläufe (2,3 je Partie, Reaktion nach Antizipation) stellen Angreifer in die Zone, aber die Parade/der Block landet in 0,8 s meist bei Verteidigern, die torseitig stehen, oder beim Torwart; die Angreifer gewinnen 16–19 % wie in der Basis (die Analyse maß 25 % auf `si-max42-norisk`). Die Paradenrichtung nach `gk` weg vom Torwart (SI-3, H7) und die Blockrichtung (SI-4) sind die fehlenden Hälften dieses Hebels; danach in SI-K nachmessen. Die Direktabschlussweiche wirkt (0,04 Versuche je Partie, Quelle `rebound`), bleibt aber klein, solange es ≈ 1,4 Abpraller je Partie gibt. **Anschlusslauf/Doppelpass:** Die Umlenkung hinter den Presser greift bei fast jedem angenommenen Pass (41 je Partie), weil der Passgeber nach jedem Pass einen Anschlusslauf hat; einen echten Doppelpass macht erst der Rückpass von SI-1 daraus (Rücklaufbonus in `v183PassEstimate`). Ledger-Quelle `one-two` zählt bestätigte Kombinationen mit umgelenktem Lauf.

## Prüfungen

Alle Befehle mit Node 24 (`C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`) im Worktree; Stand des Abschlusscommits, zweimal durchlaufen (vor und nach der Zeitbasis-Korrektur; die zweite Reihe gilt).

| Prüfung | Ergebnis |
| --- | --- |
| `node work/test-si-offball-v183.cjs` (neu; 16 Prüfungen: alter Pfad digestgleich mit `si:false` bei allen Paketen aus, Paket aus = Vorgängerfunktionen, Vorgaben registriert, neuer Pfad Standard/groß (Plain-Absichten, Abseitslimit, Formationsleine, bewegte Mitspieler), keine Zufallsziehung, Konter inkl. Abbruch bei Ballverlust und Wiederanstoßlücke, Boxbesetzung, Hinterlaufen, Nachsetzen, Doppelpass-Umlenkung, Abprallerabschluss, Tempo, Restore während laufender Absichten, B02 in acht Richtungen) | grün |
| `node work/test-si-core-v183.cjs` (Integrationsfassung `ef78fca6`) | grün (28 Prüfungen) |
| `node work/check-old-matches-v183.cjs` (340 Szenen gegen `e4e531c0`: unmarkiert, 182, Konstruktor ohne Marker, Marker 183 mit allen Paketen aus) | grün |
| `node work/check-old-matches-v182.cjs` (158 Szenen gegen `f2458c1f`; Basisbaum `work/tmp-base182` per `git archive`) | grün |
| Pflichtliste Plan 9: `test-v55`, `test-v56`, `test-v57`, `test-breakaway`, `test-duel-streaks`, `run-native130-tests`, `test-world-match-v64`, `test-world-penalties-v65`, `test-world-goal-scene-v83`, `test-world-physical-instructions`, `test-compact-balance-v178`, `test-player-load-candidate-v158`, `test-native-career-v160`, `test-native-performance-context`, `platform/qa/test-unity-integration-v160`, `platform/qa/test-world-unity-contract`, `test-world-pitch3d-v98`, `test-3d-contacts-v119`, `test-whistle-offside-v119`, `test-keeper-picture-v119`, `platform/qa/test-world-unity-slides` | grün |
| Release-132-Gates: `test-corner-quality-v182`, `test-defensive-pursuit-v182`, `test-freekick-plan-r132`, `test-keeper-hold-v182`, `test-loose-ball-v182`, `test-penalty-quality-v182`, `test-review-fixes-v182` | grün |
| `node work/build.cjs` | grün (Einzeldatei erzeugt, Artefakte zurückgesetzt) |
| Regressionsschutz Browser: `node work/build.cjs`, `node work/generate-user-meshy-match.cjs`, `node work/check-free-ball-positioning-v124.cjs` (Edge headless) | grün; die erste Fassung des Moduls fiel hier durch (gespeicherter Haltepunkt blieb während eines Flugs vor der aufrückenden Linie stehen), daher die Abseitsklammer je Tick; `docs/spieler-nutzer-rig/free-ball-positioning-qa-v124.json`, `outputs/index.html` und `outputs/Doppel-6-Fussballmanager.html` nach dem Lauf zurückgesetzt |
| Restore-Nachweis | Prüfung „restore during running intents“: JSON-Checkpoint über `v65Snapshot`/`v65Restore` mitten in laufenden Lauf-Absichten (drei Absichten im Beispiel), `attackFlow.intents`, `attackFlow.offball`, `paceRecovery`, `offerOwner`/`offerUntil` vor und nach dem Laden identisch, Snapshot trägt sie, nach dem Laden steuern dieselben Absichten die Läufer, 300 Ticks Fortsetzung fehlerfrei. B19-Werkzeug bei Erscheinen zusätzlich anwenden. |
| Messung | `node work/measure-si-offball-v183.cjs …` (Basis und SI-2, Lane C), `node work/table-si-offball-v183.cjs si2-base192 si2-final192c`; `dist`-Hash vor/nach jedem Lauf unverändert |

## Weichenbedarf und Hinweise an andere Pakete

- **SI-1 (`v157ContinueTurn`, `world-offensive-quality-v157.js:169`):** Der Prototyp `si-move` (P01, +0,32 Tore) kombinierte das Ballführer-Tempo mit einer kürzeren Passdrehung (Freigabe ab 0,55 rad / 2,5 m/s statt 0,30 rad / 1,2 m/s). Der Drehteil gehört zur Körperstellung des Optionsmodells (H5) und ist hier nicht umgesetzt.
- **SI-1 (`v159Decide`):** Der Grundlinienlauf des breiten Ballführers (Prototyp `cross`: Tragen zur Grundlinie statt zur Tormitte, `world-football-flow-v159.js:272,275`) ist eine Ballführerentscheidung; SI-2 liefert dafür Grundlinien- und Boxangebote.
- **`v157Prepare` (`world-offensive-quality-v157.js:107-110`, kein Eigentümer in 8.3):** schreibt den Follow-Punkt des Passgebers je Tick neu; SI-2 stellt den Doppelpass-Punkt deshalb je Tick wieder her. Eine Weiche an dieser Stelle (Follow nur, wenn kein `pattern`) wäre sauberer; Antrag an SI-F/SI-K.
- **Gemeinsame Werkzeuge:** `work/test-si-core-v183.cjs` und `work/check-old-matches-v183.cjs` in der Integrationsfassung (`213ebdf6` ff.) übernommen; beide laufen mit eingeschaltetem Paket grün. Paketspezifische Prüfungen liegen nur in `work/test-si-offball-v183.cjs`.
- **SI-0 (Zeitbasis):** Das Modul vergleicht Zeitstempel in `v152Seconds`, weil Absichten und Kombination heute dort stehen; sobald SI-0 `v152Seconds` an die gespeicherte Rate bindet (`m.elapsed/(m.si?v183Rate(m):MATCH_SPEED)`), sind beide Zeitbasen für markierte Partien gleich. Die Flugdauer in Uhreinheiten wird über `v183OffballClockUnits` (aus `v152Seconds` abgeleitet) in Sekunden umgerechnet; nach dem SI-0-Merge Nachmessung in SI-K.
- **SI-4:** `v183PaceFactor` bleibt für `press`/`support`/`base` bei der Vorgängerfunktion; die Kette core → defence → … → offball ruft die SI-4-Umhüllung für diese Zwecke auf.
- **SI-5:** Alle Abstände in Metern über `v150Scale`; die Angebotsparameter (Vorlauf, Box, Leine) stehen für die Skalierung aus dem Mitspielerabstand bereit.
- **U-1:** Tempi der Tabelle oben (Ballführer 7,5 m/s, Läufer 8,2 m/s bei spd 14) als Vorgabe für Clipwechsel.
