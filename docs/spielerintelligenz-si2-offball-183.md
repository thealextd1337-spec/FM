# Spielerintelligenz 183: SI-2 Freilaufen, Muster und Tempo

Stand: 15. Oktober 2026. Branch `feat/si-offball` (Worktree `work/si-offball`) auf `integration/si-r133` (`5ec465e6`, Fundament SI-F). Umsetzung des Pakets SI-2 aus dem [Umsetzungsplan](spielerintelligenz-umsetzungsplan-2026-10-14.md) (Abschnitte 6, 7 „SI-2“, 8.3, 9) und des Zielbilds 4.2/4.3 der [Analyse](spielerintelligenz-analyse-2026-10-14.md). Neue Logik nur für Partien mit `match.si.packages.offball`; der Schalter ist für neue Partien eingeschaltet (`v183EnableByDefault('offball')`). Unmarkierte und 182-Partien sowie markierte Partien mit ausgeschaltetem Paket laufen byteidentisch weiter.

## Modul und Umhüllungen

`dist/match-si-offball-v183.js` (Ladeposition laut SI-F). Umhüllt für aktive Partien:

| Funktion | Neues Verhalten |
| --- | --- |
| `v159Offers` | Angebotsmodell für alle Mitspieler ohne Deckungsaufgabe, Boxbesetzung, Hinterlaufen, Doppelpass-Lauf, Konterfenster |
| `v121RunnerTarget` | Nachsetzen während eines eigenen Schusses (Laufweg in die Abprallerzone) und das Festhalten des Doppelpass-Punkts je Tick |
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

Wert = Rollengewicht(Kategorie) × (Raum zum nächsten Gegner (≤10 m) + 1,5 bei freier Passlinie + 0,12/m Raumgewinn + 3·xG aus `v183ShotEstimate`) − 0,08/m Laufweg − Drängeln anderer Angebote (5 m, Box 3 m) − 0,25/m jenseits der Formationsleine (12 m, Angriff 16 m) − Abstand zum Ballführer (< 5 m, > 26 m) − 0,15/m Abseitsklammer + Boni (Konter 2, Box bei breitem Ball 3). Punkte jenseits der vorhergesagten Abseitslinie werden auf das Limit aus `v121PreparePositioning` geklammert; `v157Target` hält sie dort, solange der Ball geführt wird. Deckungsspieler (Abwehrreihe, Abräumer, ballspielender Verteidiger, negative Ausrichtung) erhalten nur Unterstützungs-, Rückraum- und Haltepunkte innerhalb ihrer Zone, Zielspieler nur Angebote vom Typ `support` (so bleiben sie mit `v157Prepare` verträglich). Läufer des vorigen Zyklus erholen sich 0,55 s (nur Unterstützungsangebote).

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

- Laufzustand ausschließlich als Plain-Daten: `attackFlow.intents[pid] = {x,y,type,team,at,until,cat,pattern,value}` (vorhandenes Format plus drei Felder), `attackFlow.offball = {team,since,lastAt,counterTeam,counterUntil,oneTwoAt,oneTwo,follow,lastCats}`, dazu die vorhandenen `paceRecovery`/`paceOffers`/`offerOwner`/`offerUntil`. Keine WeakMap. `v65Snapshot`/`v65Restore` übernehmen alles unverändert; die Prüfung „restore during running intents“ speichert mitten in laufenden Absichten (JSON-Rundlauf über `v65Snapshot`/`v65Restore`), vergleicht Absichten, SI-2-Zustand und Erholungsfenster vor/nach dem Laden und setzt die Partie 300 Ticks fort.
- Für SI-1 (`v183Offers(m)`): jeder Eintrag `{pid,x,y,type,team,at,until,cat,pattern,value}`. `type` `depth` = Lauf (1,58×), `support` = Station (1,35×), `follow` = Anschlusslauf. `cat` ∈ depth, box, byline, overlap, wide, edge, support, hold, follow, one-two. `pattern` ∈ `counter`, `box`, `overlap`, `one-two`, `follow` oder `null`. `value` ist der Angebotswert (Meterskala, nur zum Vergleich innerhalb eines Zyklus). Ein Konterfenster erkennt SI-1 an `pattern:'counter'` auf den Läufern oder an `m.attackFlow.offball.counterTeam === team && counterUntil > v183Seconds(m)`; dort gilt laut Zielbild 4.3 die um 40 % gesenkte Risikoschwelle (SI-1).
- Protokoll: `v183Trace` erhält je Zyklus `{kind:'offers',…}` und je Musterstart `{kind:'pattern',pattern,…}` (`v183OffballPattern`), dazu `{kind:'rebound-finish'}`. Ledger-Quellen: `counter`, `one-two`, `rebound`.

## Parameter (`match.si.params.offball`, Vorgaben)

`carrierPace` 1,6; `carrierClosePace` 1,6; `carrierCloseRadius` 2,5; `runPace` 1,58; `offerCycle` 1,05; `crowdDelay` 0,45; `crowdRadius` 1,1; `reachRadius` 0,65; `recoverySeconds` 0,55; `turnoverGap` 2,5; `depthRunners` 2; `leadBase` 6,5; `leadDeep` 8; `leadPos` 0,07; `boxRange` 30; `wideBall` 6; `boxNear` [4,6]; `boxSpot` [0,11]; `boxFar` [−4,7]; `boxEdge` [0,18]; `boxTaken` 2; `boxGapWidth` 12; `boxGapRange` 20; `boxGapMin` 5; `boxWideBonus` 3; `bylineDepth` 4; `bylineRange` 32; `touchlineGap` 3; `wideAhead` 4; `wideAnchor` 6; `overlapMinWide` 8; `overlapOutside` 3,5; `overlapAhead` 9; `overlapRange` 14; `supportSide` 6; `supportBack` 3; `safetyBack` 9; `oneTwoSeconds` 2,2; `oneTwoOutside` 2,2; `oneTwoAhead` 4,5; `oneTwoPresser` 6; `oneTwoWindow` 1,2; `counterSeconds` 3; `counterLead` 14; `counterRunners` 2; `counterBonus` 2; `followers` 2; `followDepth` 7; `followSide` 3,5; `followRange` 24; `followReaction` 0,35; `followReactionAnt` 0,015; `followSeconds` 2,5; `reboundFinishRange` 18; `zoneLeash` 12; `zoneLeashAtt` 16; `wZone` 0,25; `wSpace` 1; `spaceCap` 10; `wLane` 1,5; `laneClearance` 1,25; `wProgress` 0,12; `wRun` 0,08; `wCrowd` 1,5; `crowdGap` 5; `crowdGapBox` 3; `wXg` 3; `xgRange` 24; `ownerNear` 5; `wOwnerNear` 0,6; `ownerFar` 26; `wOwnerFar` 0,4; `wOffside` 0,15; `holdCost` 0,8; `holdAgain` 1; `profiles` (Rollengewichte). Gespeicherte 183-Partien ohne einen später ergänzten Schlüssel lesen die Vorgabe (`v183Param`).

## Messung gegen die SI-F-Basis

Werkzeuge: `work/measure-si-offball-v183.cjs` (führt `measure-si183.cjs` unverändert im selben Prozess aus und ergänzt lesende Beobachter: bewegte Mitspieler je Ballbesitz ≥ 2 s (Körpertempo ≥ 2,5 m/s), Abseitspfiffe, Abprallergewinn der Angreifer innerhalb 3 s nach Parade/Block, Boxbesetzung bei Flankenabgabe (≤ 16 m vor dem Tor, ≤ 12 m seitlich), Abprallerschüsse ≤ 5 s, Musterzähler, Ledger-Quellen, Tempi; Ergebnis in `extras.offball`) und `work/table-si-offball-v183.cjs <basis> <lauf> [--size=…]` (gepaart je Verein und Feldgröße, ±95 %, Favoriten ≥ 1 Punkt, Tordifferenz je Stärkepunkt). Basis: `work/tmp-sif-base` = `git archive 5ec465e6 dist`, `--packages=clock --clockRate=0.42`; SI-2: `--packages=clock,offball --clockRate=0.42`; Lane C, Ports 4262–4267, Sperre `lane-C.lock`, Einträge in `outputs/si183/queue.log` der Integration. `dist` wird vor und nach jedem Lauf gehasht.

MESSTABELLE

## Prüfungen

PRUEFUNGEN

## Weichenbedarf und Hinweise an andere Pakete

- **SI-1 (`v157ContinueTurn`, `world-offensive-quality-v157.js:169`):** Der Prototyp `si-move` (P01, +0,32 Tore) kombinierte das Ballführer-Tempo mit einer kürzeren Passdrehung (Freigabe ab 0,55 rad / 2,5 m/s statt 0,30 rad / 1,2 m/s). Der Drehteil gehört zur Körperstellung des Optionsmodells (H5) und ist hier nicht umgesetzt.
- **SI-1 (`v159Decide`):** Der Grundlinienlauf des breiten Ballführers (Prototyp `cross`: Tragen zur Grundlinie statt zur Tormitte, `world-football-flow-v159.js:272,275`) ist eine Ballführerentscheidung; SI-2 liefert dafür Grundlinien- und Boxangebote.
- **`v157Prepare` (`world-offensive-quality-v157.js:107-110`, kein Eigentümer in 8.3):** schreibt den Follow-Punkt des Passgebers je Tick neu; SI-2 stellt den Doppelpass-Punkt deshalb je Tick wieder her. Eine Weiche an dieser Stelle (Follow nur, wenn kein `pattern`) wäre sauberer; Antrag an SI-F/SI-K.
- **Gemeinsame Werkzeuge:** `work/test-si-core-v183.cjs` (Konstruktorvorgabe: Schalter je Paket boolesch statt „alle aus“; Tempo- und Digestvergleich mit ausdrücklich ausgeschalteten Paketen) und `work/check-old-matches-v183.cjs` (Gruppe `si183-off` konstruiert mit allen Paketen ausdrücklich aus) wurden angepasst, weil Welle-1-Pakete ihre Schalter in neuen Partien einschalten. Jedes andere Paket braucht dieselbe Anpassung; bei der Integration zusammenführen.
- **SI-4:** `v183PaceFactor` bleibt für `press`/`support`/`base` bei der Vorgängerfunktion; die Kette core → defence → … → offball ruft die SI-4-Umhüllung für diese Zwecke auf.
- **SI-5:** Alle Abstände in Metern über `v150Scale`; die Angebotsparameter (Vorlauf, Box, Leine) stehen für die Skalierung aus dem Mitspielerabstand bereit.
- **U-1:** Tempi der Tabelle oben (Ballführer 7,5 m/s, Läufer 8,2 m/s bei spd 14) als Vorgabe für Clipwechsel.
