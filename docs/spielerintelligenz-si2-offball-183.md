# Spielerintelligenz 183: SI-2 Freilaufen, Muster und Tempo

Stand: 15. Oktober 2026. Branch `feat/si-offball` (Worktree `work/si-offball`) auf `integration/si-r133` (Fundament SI-F `5ec465e6`; zuletzt `b28e3ab6` mit SI-0, B19 und SI-3 gemergt, Merge `a08747af`). Umsetzung des Pakets SI-2 aus dem [Umsetzungsplan](spielerintelligenz-umsetzungsplan-2026-10-14.md) (Abschnitte 6, 7 „SI-2“, 8.3, 9) und des Zielbilds 4.2/4.3 der [Analyse](spielerintelligenz-analyse-2026-10-14.md). Neue Logik nur für Partien mit `match.si.packages.offball`; der Schalter ist für neue Partien eingeschaltet (`v183EnableByDefault('offball')`). Unmarkierte und 182-Partien sowie markierte Partien mit ausgeschaltetem Paket laufen byteidentisch weiter.

## Modul und Umhüllungen

`dist/match-si-offball-v183.js` (Ladeposition laut SI-F). Umhüllt für aktive Partien:

| Funktion | Neues Verhalten |
| --- | --- |
| `v159Offers` | Angebotsmodell für alle Mitspieler ohne Deckungsaufgabe, Boxbesetzung, Hinterlaufen, Doppelpass-Lauf, Konterfenster |
| `v121RunnerTarget` | Nachsetzen während eines eigenen Schusses (Laufweg in die Abprallerzone), Festhalten des Doppelpass-Punkts je Tick und Abseitsklammer: gespeicherte Angebotspunkte werden je Tick auf das vorhergesagte Abseitslimit zurückgezogen, auch während ein Ball zu einem Mitspieler fliegt (Nachsetzen ausgenommen) |
| `v183ReboundFinish` | Direktabschluss nach gewonnenem Abpraller aus Parade/Block innerhalb 18 m, wenn `v183ShotEstimate` ein Fenster zeigt |
| `v183PaceFactor` | Ballführer 1,50× (`carrierPace`), innerhalb 2,5 m zum nächsten Gegner 1,28× (`carrierClosePace`, bisheriges Zweikampftempo), eigene Läufe 1,58×; Pressing/Unterstützung/Basis bleiben bei der Vorgängerfunktion (SI-4) |

`v162RecoverTarget`, `v182LooseChasers` und `v154RoleTarget` bleiben unverändert (Zone, Freiballjagd, Rollenziele). `v183Offers` bleibt der SI-F-Stub (lesende Kopie von `attackFlow.intents`), dessen Einträge jetzt `cat`, `pattern` und `value` tragen. Die tote Laufplanung W2 wird wie bisher nicht erreicht.

Keine Zufallsziehung im Modul. Einzige indirekte Wirkung: `v183ReboundFinish` startet nach mehr freien Bällen den vorhandenen nativen Direktversuch mit dessen eigener Ziehung (nur markierte Partien).

## Angebotsmodell

Bei jedem Angebotszyklus (`offerCycle` 1,05 s; früher bei Besitzerwechsel, zugestelltem oder erreichtem Angebot) bewertet jeder Mitspieler ohne Deckungsaufgabe Kandidatenpunkte in Metern relativ zu Ball, Tor und eigener Position:

| Kategorie | Punkt | Bedingung |
| --- | --- | --- |
| `depth` | 6,5–8 m (+0,07·pos) vor dem Ball, ±3,5 m / 7 m seitlich; höchstens `depthRunners` (2) je Zyklus, auch bei fünf Feldspielern | kein Deckungsspieler, keine Erholung |
| `box` | naher Pfosten (Ballseite, 4 m/6 m), Elfmeterpunkt (11 m), zweiter Pfosten (−4 m/7 m) und die größte Lücke zwischen den Verteidigern innerhalb ±12 m Breite (`boxGapWidth`), 10 m vor der Torlinie | Ball < 30 m vor dem Tor; je Punkt ein Spieler |
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

`v183PaceFactor`: Ballführer `carrierPace` 1,50 (× (0,78+0,009·tec) wie bisher; Review: mit 1,6 kamen 85–90 % des Torzuwachses aus getragenen Nahschüssen und der Wert drohte mit SI-1 über 3 Tore; 1,40 brachte in der Nachmessung keinen messbaren Zuwachs, siehe Review-Serie), bei einem Gegner innerhalb `carrierCloseRadius` 2,5 m `carrierClosePace` 1,28 (das bisherige Zweikampftempo). Eigene Läufe (`depth`/`follow`, Grund `run`/`follow` aus `v183PaceReason`) `runPace` 1,58; Pressing (`press`), Unterstützung (1,35) und Basis (1,15) bleiben bei SI-F/SI-4. Ladereihenfolge: SI-2 ist die äußerste Umhüllung von `v183PaceFactor` (core → … → defence → … → offball) und kehrt für `carrier` und eigene Läufe zurück, bevor SI-4 (`coverPace`, Pressing) den Aufruf sieht; alle anderen Zwecke reicht SI-2 an SI-4 weiter. Keine Wiedergabebeschleunigung: nur die Zielgeschwindigkeit des nativen Körpers ändert sich; Beschleunigung, Bremsen und Drehrate bleiben `v157Move`.

Messung des nativen Körpers in acht Richtungen (`work/test-si-offball-v183.cjs`, Prüfung „B02“, Spieler spd 14 / tec 14 / 74 kg, Standardfeld, Uhr 0,42):

| Modus | Tempo | Schritt je Tick (0,05 s) | 90 % Tempo nach | Beschleunigung 0–0,5 s | Bremsen bis Stillstand | Richtungswechsel 45° / 90° / 135° / 180° (bis 80 % Tempo) |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Ballführer frei (1,50×) | 7,06 m/s | 0,353 m | 0,65 s | 10,4 m/s² | 0,60 s / 1,98 m | 0,35 / 0,80 / 1,10 / 1,20 s (Mindesttempo 6,5 / 4,8 / 2,7 / 1,2 m/s) |
| Ballführer im Nahbereich (1,28×) | 5,80 m/s | 0,290 m | wie bisher | 10,4 m/s² | – | – |
| Läufer (1,58×) | 8,15 m/s | 0,407 m | 0,75 s | 10,4 m/s² | 0,70 s / 2,71 m | 0,40 / 0,90 / 1,25 / 1,35 s |
| Unterstützer (1,35×) | 6,96 m/s | 0,348 m | 0,65 s | 10,4 m/s² | 0,60 s / 1,93 m | 0,35 / 0,80 / 1,10 / 1,20 s |

Alle acht Richtungen liefern identische Werte (isotropes Körpermodell). Der freie Ballführer liegt jetzt knapp über dem Unterstützer und deutlich unter dem Läufer; im Zweikampfnahbereich gilt das alte Tempo (5,8 m/s). Clipwechsel und Laufzyklen für diese Tempi gehören zu U-1.

## Zustand, Restore, Schnittstellen

- Laufzustand ausschließlich als Plain-Daten: `attackFlow.intents[pid] = {x,y,type,team,at,until,cat,pattern,value}` (vorhandenes Format plus drei Felder), `attackFlow.offball = {team,since,lastAt,counterTeam,counterUntil,oneTwoAt,oneTwo,follow,lastCats}`, dazu die vorhandenen `paceRecovery`/`paceOffers`/`offerOwner`/`offerUntil`. Keine WeakMap. Zeitstempel (`at`, `until`, Fenster) sind Echtsekunden `v183Seconds`; Uhreinheiten (Flugdauer) werden über `v183Rate(m)` umgerechnet (SI-0-Regel). Seit SI-0 steht auch die Absichtsuhr der Altmodule (`v152Seconds`, Kombination `combo.releaseAt`) auf der gespeicherten Rate, sodass beide Zeitbasen für markierte Partien übereinstimmen. Vor dem SI-0-Merge passten die Fenster bei eingeschaltetem Uhrpaket nicht zu `combo.releaseAt` (der Doppelpass löste nie aus, die Anschlussläufe verfielen beim nächsten Zyklus); die Serie `si2-final192c` lief mit dem Zwischenstand auf `v152Seconds`, der mit dem gemergten Stand gleichwertig ist. `v65Snapshot`/`v65Restore` übernehmen alles unverändert; die Prüfung „restore during running intents“ speichert mitten in laufenden Absichten (JSON-Rundlauf über `v65Snapshot`/`v65Restore`), vergleicht Absichten, SI-2-Zustand und Erholungsfenster vor/nach dem Laden und setzt die Partie 300 Ticks fort.
- Für SI-1 (`v183Offers(m)`): jeder Eintrag `{pid,x,y,type,team,at,until,cat,pattern,value}`. `type` `depth` = Lauf (1,58×), `support` = Station (1,35×), `follow` = Anschlusslauf. `cat` ∈ depth, box, byline, overlap, wide, edge, support, hold, follow, one-two. `pattern` ∈ `counter`, `box`, `overlap`, `one-two`, `follow` oder `null`. `value` ist der Angebotswert (Meterskala, nur zum Vergleich innerhalb eines Zyklus). Ein Konterfenster erkennt SI-1 an `pattern:'counter'` auf den Läufern oder an `m.attackFlow.offball.counterTeam === team && counterUntil > v183Seconds(m)`; dort gilt laut Zielbild 4.3 die um 40 % gesenkte Risikoschwelle (SI-1).
- Protokoll: `v183Trace` erhält je Zyklus `{kind:'offers',…}` und je Musterstart `{kind:'pattern',pattern,…}` (`v183OffballPattern`), dazu `{kind:'rebound-finish'}`. Ledger-Quellen: `counter`, `one-two`, `rebound`.

## Parameter (`match.si.params.offball`, Vorgaben)

`carrierPace` 1,5; `carrierClosePace` 1,28; `carrierCloseRadius` 2,5; `runPace` 1,58; `offerCycle` 1,05; `crowdDelay` 0,45; `crowdRadius` 1,1; `reachRadius` 0,65; `recoverySeconds` 0,55; `turnoverGap` 2,5; `depthRunners` 2; `leadBase` 6,5; `leadDeep` 8; `leadPos` 0,07; `boxRange` 30; `wideBall` 6; `boxNear` [4,6]; `boxSpot` [0,11]; `boxFar` [−4,7]; `boxEdge` [0,18]; `boxTaken` 2; `boxGapWidth` 12; `boxGapRange` 20; `boxGapMin` 5; `boxWideBonus` 3; `bylineDepth` 4; `bylineRange` 32; `touchlineGap` 3; `wideAhead` 4; `wideAnchor` 6; `overlapMinWide` 8; `overlapOutside` 3,5; `overlapAhead` 9; `overlapRange` 14; `supportSide` 6; `supportBack` 3; `safetyBack` 9; `oneTwoSeconds` 2,2; `oneTwoOutside` 2,2; `oneTwoAhead` 4,5; `oneTwoPresser` 6; `oneTwoWindow` 1,2; `counterSeconds` 3; `counterLead` 14; `counterRunners` 2; `counterBonus` 2; `followers` 2; `followDepth` 7; `followSide` 3,5; `followRange` 24; `followReaction` 0,35; `followReactionAnt` 0,015; `followSeconds` 2,5; `reboundFinishRange` 18; `zoneLeash` 12; `zoneLeashAtt` 16; `wZone` 0,25; `wSpace` 1; `spaceCap` 10; `wLane` 1,5; `laneClearance` 1,25; `wProgress` 0,12; `wRun` 0,08; `wCrowd` 1,5; `crowdGap` 5; `crowdGapBox` 3; `wXg` 3; `xgRange` 24; `ownerNear` 5; `wOwnerNear` 0,6; `ownerFar` 26; `wOwnerFar` 0,4; `wOffside` 0,15; `holdCost` 0,8; `holdAgain` 1; `profiles` (Rollengewichte). Gespeicherte 183-Partien ohne einen später ergänzten Schlüssel lesen die Vorgabe (`v183Param`).

## Messung

Werkzeuge: `work/measure-si-offball-v183.cjs` (führt `measure-si183.cjs` unverändert im selben Prozess aus und ergänzt lesende Beobachter: bewegte Mitspieler je Ballbesitz ≥ 2 s (Körpertempo ≥ 2,5 m/s), Abseitspfiffe, Abprallergewinn der Angreifer innerhalb 3 s nach Parade/Block, Boxbesetzung bei Flankenabgabe (≤ 16 m vor dem Tor, ≤ 12 m seitlich), Abprallerschüsse ≤ 5 s, Musterzähler, Ledger-Quellen, Tempi; Ergebnis in `extras.offball`; `--packages=default,-offball` schaltet ein per Vorgabe aktives Paket ausdrücklich ab) und `work/table-si-offball-v183.cjs <basis> <lauf> [--size=…]` (gepaart je Verein und Feldgröße, ±95 %, Favoriten ≥ 1 Punkt, Tordifferenz je Stärkepunkt). Lane C, Ports 4262–4267, Sperre `lane-C.lock`, Einträge in `outputs/si183/queue.log` der Integration; `dist` wird vor und nach jedem Lauf gehasht. Die Musterzähler zählen Starts bzw. Umlenkungen: „Anschlusslauf“ ist die Zahl der je Pass umgelenkten Follow-Punkte (bei fast jedem angenommenen Pass), kein Doppelpass-Zähler; Doppelpässe entstehen erst mit dem Rückpass von SI-1.

### Haupttabelle: gemergter Stand (SI-0, B19, SI-3), Ballführer 1,6×

192 gepaarte Partien auf `a08747af` (Integration `b28e3ab6`: Uhrpaket und `finish` per Vorgabe an, Uhr 0,42 per Override), Basis `si2-base192m` = derselbe `dist`-Stand ohne die SI-2-Vorgabe gegen `si2-final192m` (SI-2 mit `carrierPace` 1,6). Die Basis liegt mit SI-0-Takten und SI-3-Platzierung bei 6,4 Schüssen und 1,67 Toren.

| Kennzahl (Mittel je Partie) | Basis | SI-2 (1,6×) | Differenz (±95 %) | Kriterium |
| --- | ---: | ---: | ---: | --- |
| Tore | 1,67 | 2,39 | +0,71 ±0,25 | +0,2 bis +0,4: zu viel (Review: 85–90 % aus `carrierPace` 1,6, getragene Nahschüsse 8–12 m 1,04 → 2,76); daher Vorgabe 1,50 mit Nahbereich 1,28, siehe Review-Serie unten |
| Schüsse / aufs Tor | 6,39 / 2,94 | 8,13 / 4,16 | +1,73 ±0,42 / +1,22 ±0,33 | – |
| aufs Tor je Schuss / Tore je Schuss | 46 % / 26 % | 51 % / 29 % | +5 / +3 Punkte | – |
| Abseits | 0,27 | 0,18 | −0,08 ±0,10 | ≤ 0,5: erfüllt |
| bewegte Mitspieler je Ballbesitz | 5,27 | 5,20 | −0,07 ±0,03 | ≥ 4: erfüllt (Standard 4,73) |
| Abprallergewinn der Angreifer (≤ 3 s) | 27 % (2,93) | 31 % (3,42) | +4 Punkte; Direktversuche 0,14 | ≥ 35 %: **nicht erreicht**, Richtung stimmt mit SI-3-Paraden |
| Boxbesetzung ≥ 2 bei Flankenabgabe | 78 % | 88 % | +10 Punkte | ≥ 80 %: erfüllt (Standard 90 %, groß 85 %) |
| Flanken / Ecken | 0,83 / 0,66 | 0,93 / 0,83 | +0,09 ±0,17 / +0,17 ±0,16 | – |
| Favoriten ≥ 1 Punkt (N 134) | 62 % | 68 % | +6 Punkte | nicht senken: erfüllt (Standard 63 → 71 %, groß 61 → 65 %) |
| Tordifferenz je Stärkepunkt | 0,41 | 0,54 | +0,13 | – |
| 0:0 / 2–3 Tore / 4–6 min | 24 % / 43 % / 81 % | 12 % / 46 % / 90 % | | – |
| Dauer (min) | 4,29 | 4,40 | +0,11 ±0,06 | – |
| Fouls / Freistöße | 7,51 / 7,70 | 6,53 / 6,64 | −0,98 ±0,48 / −1,06 ±0,49 | – |
| Pässe / Raumpässe | 100,5 / 7,98 | 94,9 / 7,69 | −5,6 ±1,2 / −0,3 ±0,6 | Ballführer trägt häufiger |
| Tempo Ballführer / Mitspieler (m/s) | 2,86 / 3,77 | 3,33 / 3,75 | +0,46 / −0,03 | Sprintanteil der Mitspieler 0,72 → 0,70 |
| Muster je Partie: Konter / Nachsetzen / Hinterlaufen / Anschlusslauf (Umlenkungen) | – | 12,3 / 5,1 / 1,0 / 53,1 | | – |
| Rechenzeit je Partie | 12,8 s | 11,7 s | −1,1 ±0,1 | – |

Großes Feld (96 Paare): Schüsse 5,81 → 7,64, Tore 1,40 → 2,14, Favoriten 61 → 65 %, Abseits 0,33 → 0,20.

### Review-Serie: Ballführer 1,40× gegen 1,50× (Nahbereich 1,28×)

48 gepaarte Partien (24 Vereine × 2 Feldgrößen) auf dem Review-Stand (Konterläufer-Filter, Nahbereichsregel wirksam), Basis `si2-r48-off` = derselbe `dist` mit `--packages=default,-offball`, Uhr 0,42; die Vorgabe wurde zwischen 1,40 und 1,50 nach dieser Serie gewählt.

| Kennzahl (Mittel je Partie) | Basis | SI-2 1,40× (`si2-r48-on`) | SI-2 1,50× (`si2-r48-on150`) |
| --- | ---: | ---: | ---: |
| Tore | 2,13 | 2,23 (+0,10 ±0,59) | 2,52 (+0,40 ±0,53) |
| Schüsse / aufs Tor | 7,15 / 3,79 | 6,90 / 3,50 (−0,25 / −0,29) | 7,81 / 4,06 (+0,67 ±0,69 / +0,27) |
| Tore je Schuss | 30 % | 32 % | 32 % |
| Abseits | 0,29 | 0,33 | 0,31 |
| bewegte Mitspieler je Ballbesitz | 5,29 | 5,22 | 5,24 |
| Abprallergewinn (≤ 3 s) / Direktversuche | 31 % / – | 30 % / 0,08 | 32 % / 0,19 |
| Boxbesetzung ≥ 2 bei Flanke / Flanken | 80 % / 0,96 | 83 % / 0,50 | 92 % / 0,75 |
| Favoriten ≥ 1 (N 34) / Tordiff. je Stärkepunkt | 68 % / 0,49 | 82 % / 0,65 | 71 % / 0,57 |
| 0:0 / 2–3 Tore | 15 % / 40 % | 13 % / 40 % | 10 % / 44 % |
| Tempo Ballführer (m/s) | 2,98 | 3,04 (+0,07) | 3,14 (+0,17) |
| Standardfeld Tore / großes Feld Tore | 2,25 / 2,00 | 2,25 / 2,21 | 2,92 / 2,13 |

Entscheidung **1,50**: Mit 1,40 ist der Zuwachs (+0,10) nicht vom Rauschen zu unterscheiden und das mittlere Ballführertempo steigt nur um 0,07 m/s, weil die Nahbereichsregel (1,28 bis 2,5 m zum Gegner) den Ballführer meist auf dem alten Tempo hält; mit 1,50 liegt der Zuwachs (+0,40, Schüsse +0,67) am oberen Rand des Zielfensters, Favoriten und 0:0 bessern sich. Beide Werte liegen bei 48 Paaren innerhalb der Rauschprobe; der Endwert ist Parameter und wird in SI-K zusammen mit SI-1 gesetzt (1,40 bleibt der dokumentierte Rückfall, falls die Summe mit SI-1 über 3 Tore geht). Die Flankenzahl schwankt in den 48er-Serien stark (±0,3–0,4); auf 192 Paaren mit 1,6× war sie +0,09 ±0,17.

### Frühere Serien auf der reinen SI-F-Basis

Vor SI-0/SI-3 (Basis `5ec465e6`, Uhr 0,42 ohne Echtzeit-Takte, 3,1 Schüsse / 0,80 Tore) ergab SI-2 mit 1,6× in 192 Paaren Tore +0,21 ±0,18, Abseits 0,19 → 0,12, Boxbesetzung 57 → 86 %, Favoriten 43 → 49 %, Abprallergewinn 19 → 16 % (`si2-base192`/`si2-final192c`). Die 96er-Rauchserien zeigten dieselbe Richtung: ohne Ballführertempo Tore +0,01, mit 1,6× +0,17, Dynamik-Variante (Haltekosten 1,2, Raumgewinn 0,14) +0,04 ohne messbar mehr Mitspielertempo; das Ballführertempo war schon dort der Haupthebel.

Nicht erreicht: **Abprallergewinn ≥ 35 %.** Die Nachsetzläufe stellen Angreifer in die Zone, aber Parade/Block landen meist bei torseitig stehenden Verteidigern oder beim Torwart; Paradenrichtung (SI-3) und Blockrichtung (SI-4) sind die fehlenden Hälften, Nachmessung in SI-K.

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
| Restore-Nachweis | Prüfung „restore during running intents“: JSON-Checkpoint über `v65Snapshot`/`v65Restore` mitten in laufenden Lauf-Absichten (drei Absichten im Beispiel), `attackFlow.intents`, `attackFlow.offball`, `paceRecovery`, `offerOwner`/`offerUntil` vor und nach dem Laden identisch, Snapshot trägt sie, nach dem Laden steuern dieselben Absichten die Läufer, 300 Ticks Fortsetzung fehlerfrei. B19-Werkzeug (`work/check-restore-completeness-v183.cjs`, gemergter Stand, Browser-Engine): `--quick` (zehn Szenen inkl. „paketzustand“) grün; fünf SI-2-Szenen über `checkScenes` (Auslöser: Konterfenster mit Konterläufern, ≥ 2 Boxangebote, Anschlusslauf `one-two`, Nachsetzlauf `follow` nach dem Schuss, Angebotszyklus mit Erholungsfenstern) je Standard- und Großfeld grün: Zustand vor/nach Snapshot → JSON → Restore pfadgleich, nur die vom Werkzeug begründeten flüchtigen WeakMaps weichen ab, Fortsetzung bis zum Abpfiff fehlerfrei. |
| Nach dem Merge von SI-0/B19 (`570dcc54`) | `test-si-offball-v183` (16, Konstruktorszenen mit `clock:true, clockRate:.42`) grün; `test-si-clock-v183` zunächst rot (Konstruktorvorgabe in `clockSi`, siehe Weichenbedarf), `test-si-core-v183` grün; `check-free-ball-positioning-v124` nach Build und Seitenerzeugung grün; `check-old-matches-v183` (340 Szenen) und `check-old-matches-v182` (158 Szenen) grün; Pflichtliste aus Plan 9 mit den Release-132-Gates und `test-native-career-v160` grün (30 Prüfungen). |
| Nach dem Review (Tempo 1,50/1,28, Konterläufer-Filter, Messwerkzeug) | `test-si-offball-v183` (16, Vorgaben 1,5/1,28, Nahbereichsregel senkt das Tempo, eigene Läufe schneller als der Ballführer), `test-si-core-v183`, `test-si-clock-v183`, `test-si-finish-v183`, `check-old-matches-v183` (340 Szenen) grün; `node work/check-restore-completeness-v183.cjs --port=4262 --quick` unter Lane-C-Sperre grün (10 Läufe); gepaarte 48er-Serien `si2-r48-off`/`si2-r48-on`/`si2-r48-on150` unter Lane-C-Sperre (siehe Review-Serie). Artefakte zurückgesetzt. |
| Nach dem Merge von SI-3 (`a08747af` auf `b28e3ab6`) | Gesamte Reihe erneut auf dem gemergten Stand: `test-si-offball-v183` (16), `test-si-core-v183`, `test-si-clock-v183` (Integrationsfassung mit eigenem Pin), `test-si-finish-v183`, `check-old-matches-v183` (340 Szenen), `check-old-matches-v182` (158 Szenen), die Pflichtliste aus Plan 9 inklusive Release-132-Gates und `test-native-career-v160`: 34 Prüfungen grün, keine rote. `node work/check-restore-completeness-v183.cjs --port=4262 --quick` auf Lane C mit Sperre grün (10 Läufe, Absichten nur in `attackFlow`). `check-free-ball-positioning-v124` nach Build und Seitenerzeugung grün, Artefakte zurückgesetzt. Abschlussserie gegen die neue Basis: Nachtrag oben. |
| Messung | `node work/measure-si-offball-v183.cjs …` (Basis und SI-2, Lane C), `node work/table-si-offball-v183.cjs si2-base192 si2-final192c`; `dist`-Hash vor/nach jedem Lauf unverändert |

## Weichenbedarf und Hinweise an andere Pakete

- **SI-1 (`v157ContinueTurn`, `world-offensive-quality-v157.js:169`):** Der Prototyp `si-move` (P01, +0,32 Tore) kombinierte das Ballführer-Tempo mit einer kürzeren Passdrehung (Freigabe ab 0,55 rad / 2,5 m/s statt 0,30 rad / 1,2 m/s). Der Drehteil gehört zur Körperstellung des Optionsmodells (H5) und ist hier nicht umgesetzt.
- **SI-1 (`v159Decide`):** Der Grundlinienlauf des breiten Ballführers (Prototyp `cross`: Tragen zur Grundlinie statt zur Tormitte, `world-football-flow-v159.js:272,275`) ist eine Ballführerentscheidung; SI-2 liefert dafür Grundlinien- und Boxangebote.
- **`v157Prepare` (`world-offensive-quality-v157.js:107-110`, kein Eigentümer in 8.3):** schreibt den Follow-Punkt des Passgebers je Tick neu; SI-2 stellt den Doppelpass-Punkt deshalb je Tick wieder her. Eine Weiche an dieser Stelle (Follow nur, wenn kein `pattern`) wäre sauberer; Antrag an SI-F/SI-K.
- **Gemeinsame Werkzeuge:** `work/test-si-core-v183.cjs` und `work/check-old-matches-v183.cjs` in der Integrationsfassung (`213ebdf6` ff.) übernommen; beide laufen mit eingeschaltetem Paket grün. Paketspezifische Prüfungen liegen nur in `work/test-si-offball-v183.cjs`.
- **SI-0 (gemergt):** Fristen in `v183Seconds`, Uhreinheiten über `v183Rate(m)`; `v152Seconds` ist seit SI-0 an die Rate gebunden. Die erste SI-0-Fassung von `work/test-si-clock-v183.cjs` ließ in `clockSi` die übrigen Paketschalter auf der Konstruktorvorgabe und verglich deshalb mit SI-2 per Vorgabe an eine SI-2-Partie mit einer unmarkierten (rot); die Integrationsfassung (`b28e3ab6`) schaltet die übrigen Pakete ausdrücklich aus, die lokale Pin-Zeile wurde verworfen. Nachmessung mit SI-0-Takten in SI-K.
- **SI-3 (gemergt):** `v183ShotEstimate.xg` ist jetzt eine Torwahrscheinlichkeit einschließlich Blockchance (0–1). SI-2 verwendet sie unverändert als Angebotswert (`wXg` 3) und als Fenster des Abprallerabschlusses (`window`); die Gewichtung gegen Raum und Passlinie gehört in die SI-K-Kalibrierung.
- **SI-4:** `v183PaceFactor` bleibt für `press`/`support`/`base` bei der Vorgängerfunktion; die Kette core → defence → … → offball ruft die SI-4-Umhüllung für diese Zwecke auf. Ladereihenfolge-Abhängigkeit: SI-2 liegt außen und kehrt für `carrier` und eigene Läufe (`run`/`follow`) zurück, bevor SI-4 (`coverPace`) den Aufruf sieht; würde SI-4 außen liegen, müsste es diese Zwecke durchreichen.
- **SI-5:** Alle Abstände in Metern über `v150Scale`; die Angebotsparameter (Vorlauf, Box, Leine) stehen für die Skalierung aus dem Mitspielerabstand bereit.
- **U-1:** Tempi der Tabelle oben (Ballführer frei 7,1 m/s, im Nahbereich 5,8 m/s, Läufer 8,2 m/s bei spd 14) als Vorgabe für Clipwechsel.
- **Offen für SI-K:** (1) Zusammenspiel Konterfenster (zwei Tiefenläufer für 3 s) mit dem SI-4-Gegenpressing nach Ballverlust: beide greifen am selben Ballgewinn, Dauer und Läuferzahl gegeneinander kalibrieren. (2) `attackFlow.setplay.secondBall` von SI-7 wird von SI-2 nicht gelesen; der Rückraumpunkt `edge` entsteht unabhängig davon, Abgleich nach dem SI-7-Merge. (3) SI-1 liest `pattern:'counter'` noch nicht und führt stattdessen einen neutralen Parameter `counterOffer`; Risikoschwelle im Konterfenster (Zielbild 4.3) dort anschließen. (4) `wXg` gegen die SI-3-Torwahrscheinlichkeit und `carrierPace` 1,40–1,50 zusammen mit SI-1 kalibrieren.
