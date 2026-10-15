# Spielerintelligenz 183: SI-4 Verteidigung, Radien und Fouls

Stand: 15. Oktober 2026. Branch `feat/si-defence` auf `integration/si-r133` (SI-F `5ec465e6`). Umsetzung des Pakets SI-4 aus dem [Umsetzungsplan](spielerintelligenz-umsetzungsplan-2026-10-14.md) (Abschnitte 7, 8.3, 9) auf dem [Fundament](spielerintelligenz-fundament-183.md). Modul `dist/match-si-defence-v183.js`; der Schalter `defence` ist für neue Partien eingeschaltet (`v183EnableByDefault('defence')`). Partien ohne `si` oder mit ausgeschaltetem Paket laufen unverändert (B03 bleibt: Grätsche von hinten mit Körperkontakt ist immer ein Foul).

## Befunde, die den Plan präzisieren

- **Die kontaktlose Foulprobe ist in der Produktionsladereihenfolge nicht erreichbar.** `pitch-v55.js:492` ersetzt `action`, ohne `v50BaseAction` aufzurufen; `set-pieces-v50.js:160-170` wird deshalb nie ausgeführt (Prüfung: `action.toString()` enthält `v50FoulChance` nicht; 0 Probe-Aufrufe in den 384 Partien der finalen Serien). Die „6,1 Freistöße“ stammen nicht aus der Probe, sondern ausschließlich aus Zweikampfkontakt. „Fouls nur mit Kontaktereignis“ gilt damit schon vor SI-4 strukturell; SI-4 weist es im Protokoll nach (siehe Kontaktweg) und senkt die Kontaktfouls.
- **Herkunft der Fouls im SI-F-Stand (Uhr 0,42, 192 Partien):** 3,90 Fouls je Partie, davon 1,39 aus stehenden Zweikämpfen (37,5 Versuche, 3,7 % Foulquote) und 2,52 aus Grätschen (5,55 Starts, 45 % Fouls, 12 % Ballgewinne, 42 % ohne Wirkung). In der 48-Partien-Probe beginnen 45 % der Grätschen von hinten (46 % Fouls, 6 % Gewinne).
- **Blocks und Klärungen sind selten:** 0,057 Blocks und 0,72 Kopfballklärungen je Partie im SI-F-Stand (bei 3,1 Schüssen). Ein Blockabpraller erreicht die Torlinie schon heute in 58 % der Fälle (Zufall −0,3); die Menge, nicht die Richtung, begrenzt die Ecken. In der eigenen Box gewinnen Verteidiger 1,27 Bälle je Partie (Zweikampf 0,52, Abfangen 0,26, freier Ball 0,49) – das ist die Obergrenze für Klärungen aus Ballgewinnen.

## Änderungen

| Datei / Funktion | Änderung (nur markierte Partien mit Paket `defence`) |
| --- | --- |
| `match-si-defence-v183.js` | neu: Parameter, Kontaktweg, Rollen, Gegenpressing, Tempo, `v183Clearance`, `v183BlockAim` |
| `v182ContactCheck` | umhüllt: einziger Weg, einen Zweikampf zu eröffnen (`v183DefContactTick`) |
| `v56MaybeChallenge` | umhüllt: der Entscheidungsweg (`action`) eröffnet keine Zweikämpfe mehr |
| `v56StandingTackle`, `v56AdvanceSlide` | umhüllt: heben die Kontaktmarke (`v183DefContact`); Logik unverändert |
| `v50Foul` | umhüllt: protokolliert jedes vergebene Foul (`foul` mit Abstand ≤ 43/32 m und `contact`, ob es aus `v56StandingTackle`/`v56AdvanceSlide` kam); das Entfernungstor von `v50Foul` selbst bleibt |
| `v50FoulChance` | umhüllt: Faktor `standingFoulScale` |
| `v159DefensiveTarget` | umhüllt: Absicherer und Gegenpressing; Presser und Deckung bleiben die B03-Logik |
| `v183PaceFactor` | umhüllt: `pressPace` (Grund `press`) und `coverPace` (Absicherer) |
| `v183Clearance` | umhüllt: Klärung unter Druck, Auswertungsmodus |
| `pitch-v55.js:192` (`v55GroundPass`) | Weiche: `v183Radius(m,'defence.passPressureRadius',.15)` statt `distance<.15` (Druck beim Bodenpass); Altpfad exakt wie bisher |
| `set-pieces-v50.js:215` (`v50Deflect`) | Weiche: `v183BlockAim(match,defender)` liefert Zufallsversatz und Streuung (Altwert `.3`/`.3`) |
| `set-pieces-v50.js:156-170` (Foulprobe) | nicht geändert: nicht erreichbar (siehe Befunde) |
| `world-backpedal-v108.js:8-43` (`v121PreparePositioning`) | nicht geändert (siehe Übergabe, SI-5) |

Neue Hilfsfunktionen tragen den Präfix `v183Def*`; `v183BlockAim(m,defender)` ist die einzige zusätzliche öffentliche Funktion.

## Kontaktweg und Fouls (W5, H11)

- **Ein Weg:** Ein Zweikampf entsteht nur noch in `v183DefContactTick` (je Tick nach der Bewegung, auch an Entscheidungsticks). Das Kontaktfenster `contactWindow` (heute 0,25 s) sperrt nach jedem Versuch; im Gegenpressing-Fenster gilt `counterContactWindow` (höchstens `contactWindow`). Stehende Zweikämpfe nutzen die Kandidaten- und Entfernungsregeln von `v56MaybeChallenge` unverändert (0,95 m Ball, 1,25 m Körper, nicht von hinten); ein Test hält die Konstanten mit `pitch-v56.js` gleich.
- **Grätschen** werden höchstens alle `slideInterval` Sekunden erwogen (bisher bei jeder Entscheidung). Eine Vorhersage mit der Kinematik von `v56StartSlide`/`v56AdvanceSlide` (Grätschziel am Ball plus 0,18/0,25 m, Ball und Gegner behalten die beobachtete Geschwindigkeit, Dauer 0,65 Echtsekunden, unabhängig von der Uhrrate) entscheidet: `slideForecast` 1 erlaubt nur Grätschen, die den Ball vor dem Körper erreichen; 2 (Vorgabe) auch Grätschen, die vorbeirutschen, außer von hinten; ein vorhergesagtes Foul wird nie versucht. Die Zufallsziehung der Grätschenwahrscheinlichkeit bleibt die vorhandene von `v56MaybeChallenge`.
- **Kontaktnachweis:** `v50Foul` vergibt wie bisher nur bis 43/32 m Körperkontakt. Mit dem Paket steht jedes vergebene Foul im flüchtigen Protokoll (`foul`: Abstand, `contact` = kam aus einer Kontaktfunktion); `contact:false` kennzeichnet fremde Aufrufer (z. B. Szenenskripte). Die Produktionsaufrufer sind genau die zwei Kontaktfunktionen: in der 192er-Serie kamen 100 % der vergebenen Fouls aus Kontaktwegen (Stack-Klassifikation der Messhülle, 0 andere). Eine Ablehnung fremder Aufrufer gibt es nicht (sie hatte `test-si-clock-v183.cjs` blockiert, das ein Foul direkt über `v50Foul` erzeugt).
- **B03:** `v56AdvanceSlide` ist unverändert; ein Test deckt die Grätsche von hinten mit Körperkontakt für beide Teams ab. Kontaktfenster und Pressingtempo sind gespeicherte Parameter (Vorgaben = B03 wie veröffentlicht: 0,25 s, 1,58).

## Rollen (Zuteilung)

- **Presser:** der nächste bereite Spieler; unverändert die B03-Logik (`v182PressPoint`, Tempo, Leine).
- **Absicherer:** der zweitnächste bereite Spieler, wenn der Ballführer näher als `coverZone` (40 m) am eigenen Tor und der Spieler näher als `coverRange` (14 m) am Ballführer ist. Zielpunkt auf der Linie Ballführer → eigenes Tor, `coverDepth` (4 m) hinter dem Presser (4,5–12 m vom Ballführer, nie hinter der Torlinie), begrenzt auf `coverLeash` (18 m) vom Formationsanker. Die Wahl ist klebrig (anderer Spieler erst bei mehr als 1,5 m Vorsprung), Tempo `coverPace`.
- **Deckung/Zone:** alle anderen unverändert (nächster Passempfänger, sonst Zone).

## Gegenpressing (H9)

Ein Ballwechsel (Ballführer wechselt das Team, kein Torwart) innerhalb `counterZone` (24 m) vor dem angegriffenen Tor der Verliererseite öffnet ein Fenster von `counterWindow` (2 s), mit früher Pressingtaktik `counterWindowPress` (3 s). Darin bearbeiten die `counterPressers` (2) nächsten bereiten Spieler in `counterRange` (14 m), gewichtet nach Rolle (`V183_DEF_COUNTER_ROLE`, Torwartrollen nie), den neuen Ballführer: der erste an B03-Pressingpunkt, der zweite um `counterWide` (1,4 m) seitlich versetzt, ohne Formationsleine. `counterCutters` (1) weitere Spieler stehen auf der Linie vom nächsten Mitspieler des Ballführers zum Ballführer (`counterLane` = 0,35 vom Mitspieler). Das Fenster endet mit Ballrückgewinn, Zeit oder Standardsituation. Zustand: `attackFlow.defence.counter`.

## Radien in Metern (W4)

`v183Radius(m,'defence.<name>',legacy)` mit flächengleichen Kreisen zum bisherigen normalisierten Ellipsenradius .15 (7,3 × 11,0 m im Standardfeld, 20 % größer im großen Feld): alle vier Schlüssel 9 m. Umgestellt ist hier `pitch-v55.js:192`; die anderen drei Stellen stellen ihre Eigentümer um:

| Schlüssel | Stelle | Eigentümer |
| --- | --- | --- |
| `defence.passPressureRadius` | `pitch-v55.js:192` (`v55GroundPass`, Druck auf den Passgeber) | SI-4 (erledigt) |
| `defence.crossPressureRadius` | `pitch-v55.js:328` (`v55HighPass`) | SI-7 |
| `defence.shotPressureRadius` | `pitch-v55.js:403` (`v55Shoot`) | SI-3 |
| `defence.decisionPressureRadius` | `pitch-v55.js:494` (`action`, Druck der Entscheidung; SI-1 spiegelt zusätzlich den Radius der Ankunftsschätzung von `v55GroundPass`) | SI-1 |

Ein Foulradius entfällt (Foulprobe nicht erreichbar; die Kontaktentfernungen stehen schon in Metern).

## `v183Clearance(m,defender,point,context) → {target,out[,outChance]}`

- **Kontext:** `kind` `'header'` (Vorgabe, Luftduell SI-7) oder `'block'` (SI-3); `lateralDraw` (Ziehung des Aufrufers), `air`, `ownBox`, `pressure` (Zahl der Gegner in 2 m); fehlende Werte berechnet die Funktion selbst.
- **Mitte:** wie der SI-F-Stub (Kopfball: 7 + 0,2·`air` m, Block: 3 + 0,1·`air` m nach vorn, seitlich (Ziehung − 0,5)·6 m).
- **Aus:** Chance `(clearOutBase + clearOutPressure·min(2,Druck) + clearOutBox)·(1 − clearCalm·(Ruhe − 10))`, höchstens `clearOutMax`; Block `blockOutBase + blockOutBox`. Bei „aus“ liegt `target` hinter der eigenen Torlinie neben dem Pfosten (Ecke, wenn die Klärung in der eigenen Box höchstens 22 m vor der Linie geschieht und die Ziehung `clearance.kind` < 0,6 ist), sonst jenseits der Seitenlinie (Einwurf). Die vorhandene Freiballbahn führt den Ball hinaus (`v55Exit`/`v55Out`); der Test belegt Ecke und Einwurf für beide Teams.
- **Auswertungsmodus** `context.evaluate:true`: deterministische Mitte (Ziehung 0,5), `out:false`, zusätzlich `outChance`; keine Zufallsziehung.
- **Ziehungen:** `clearance.lateral` (nur ohne `lateralDraw`), `clearance.out` (bei Chance > 0), `clearance.kind` (nur in der eigenen Box nahe der Linie).
- **`v183BlockAim(m,defender)`:** liefert `{bias,spread}` für `v50Deflect` (Altwert 0,3/0,3). Mit Paket `blockBias` (0,2) + (`pos` − 10)·`blockSkill`; ein besserer Verteidiger lenkt weg von der Torlinie.

## Parameter (`match.si.params.defence`)

| Schlüssel | Vorgabe | Bedeutung |
| --- | ---: | --- |
| `passPressureRadius`, `crossPressureRadius`, `shotPressureRadius`, `decisionPressureRadius` | 9 | Druckradien in m (oben) |
| `contactWindow` | 0,25 | Sperre in s nach einem Zweikampfversuch (B03 wie veröffentlicht; Prototyp 0,4) |
| `slideInterval` | 0,5 | Sekunden zwischen zwei Grätschenentscheidungen |
| `slideForecast` | 2 | 0 aus, 1 nur Ballerreichung, 2 auch Vorbeirutschen außer von hinten |
| `standingFoulScale` | 1 | Faktor auf die Foulchance stehender Zweikämpfe |
| `pressPace`, `coverPace` | 1,58 / 1,35 | Tempofaktoren (Pressing wie veröffentlicht; Prototyp 1,45) |
| `coverZone`, `coverRange`, `coverDepth`, `coverLeash` | 40 / 14 / 4 / 18 | Absicherer (m) |
| `counterWindow`, `counterWindowPress` | 2 / 3 | Fenster (s) ohne/mit früher Pressingtaktik |
| `counterZone`, `counterRange` | 24 / 14 | Ballwechselzone vor dem Tor, Reichweite der Presser (m) |
| `counterPressers`, `counterWide`, `counterCutters`, `counterLane`, `counterContactWindow` | 2 / 1,4 / 1 / 0,35 / 0,15 | Presser, Versatz, Passwegschneider, Anteil, Kontaktfenster im Fenster |
| `clearOutBase`, `clearOutPressure`, `clearOutBox`, `clearOutMax`, `clearCalm` | 0,08 / 0,12 / 0,12 / 0,5 / 0,025 | Klärung: Aus-Chance |
| `blockOutBase`, `blockOutBox` | 0,35 / 0,15 | Block: Aus-Chance |
| `blockBias`, `blockSpread`, `blockSkill` | 0,2 / 0,3 / 0,004 | Richtung der Blockablenkung |

Alle Zeiten sind die native Kontaktuhr `v102Clock` (Echtzeit); die Parameter sind Vorgaben im Modul und werden mit jeder neuen Partie gespeichert (Kalibrierung SI-K).

## Restore (Plain-Daten)

Laufzustand in `m.attackFlow.defence = {tick, poss, counter:{team,at,until}|null, cover:[pid|null,pid|null], slideAt|null}` (nur JSON-Werte, Pids statt Objekte, `null` statt unendlich). Die Leseaufzeichnung `attackFlow.defenseReads` trägt das Feld `kind`. Der Zustand liegt in `attackFlow` und wird mit `nativeContinuation` gespeichert; `v65Snapshot`/`v65Restore` blieben unverändert. Das Protokoll (`v183Trace`) ist flüchtig. B19-Werkzeug (`work/check-restore-completeness-v183.cjs`): `--quick` 10 Szenen grün; `work/check-restore-defence-v183.cjs` prüft mit dem Werkzeug Absicherer, Gegenpressing-Fenster und Grätschenkadenz im echten Browserspiel (Standard- und Großfeld, Snapshot → JSON → Restore, tiefer Zustandsvergleich, Fortsetzung bis zum Abpfiff): 6 von 6 Szenen ausgelöst und grün. Das Paket besitzt keine modulweite WeakMap.

## Messung (192 gepaarte Partien, 96 Vereine × 2 Feldgrößen, Uhr 0,42, SI-F-Basis = `--packages=clock,-defence`, gleiche `dist`-Kopie)

| Kennzahl | SI-F-Basis | SI-4 | Differenz (±95 %) |
| --- | ---: | ---: | ---: |
| Minuten | 4,22 | 3,85 | −0,37 (±0,08) |
| Freistöße (+ Elfmeter 0,03 / 0,01) | 4,06 | 2,17 | −1,89 (±0,35) |
| Fouls (Kontaktfouls) | 3,90 (100 %) | 2,04 (100 %) | −1,86 (±0,35) |
| davon stehend / Grätsche | 1,39 / 2,52 | 1,32 / 0,72 | |
| Grätschen: Starts / gewonnen | 5,55 / 0,69 | 3,19 / 0,43 | −2,36 (±0,42) / −0,27 (±0,14) |
| Schüsse (direkter Freistoß) | 3,12 (0,63) | 2,59 (0,30) | −0,53 (±0,29) |
| Tore | 0,81 | 0,67 | −0,15 (±0,17) |
| Ecken | 0,109 | 0,120 | +0,01 (±0,07) |
| Ecken aus Klärung (rollt hinaus) / Block / Parade | 0,010 / 0,021 / 0,073 | 0,068 / 0,010 / 0,036 | +0,06 / −0,01 / −0,04 |
| Ballgewinne gesamt | 14,30 | 13,72 | −0,58 (±0,70) |
| Ballgewinne im letzten Drittel | 0,573 | 0,599 | +0,03 (±0,17), Standardfeld +0,12 (±0,25), großes Feld −0,06 (±0,23) |
| Rückgewinn ≤3 s nach Verlust im letzten Drittel | 0,50 | 0,58 | +0,08 (±0,15) |
| Freistöße Standard / groß | 4,41 / 3,71 | 2,29 / 2,05 | großes Feld nicht über Standard |
| Favoriten (Stärkeabstand ≥1, N 134): Siege / ungeschlagen | 43,3 % / 93,3 % | 40,3 % / 94,8 % | innerhalb der Streuung (±8,5 Punkte) |
| Tordifferenz je Stärkepunkt | 0,209 | 0,159 | n. s. |

Bewertung gegen die Kriterien:

- **Freistöße ≤ 4,5:** erfüllt (2,17; im SI-F-Stand ohne Paket 4,06). Die Plananteile „−2 Freistöße“ treffen ein (−1,89), allerdings aus Grätschfouls, nicht aus der Foulprobe.
- **Fouls nur mit Kontaktereignis (100 %):** erfüllt (alle 392 vergebenen Fouls aus `v56StandingTackle`/`v56AdvanceSlide`, 0 Probe/andere; Invariante im Code).
- **B03:** unveränderte Szenen grün (`test-defensive-pursuit-v182.cjs`); Grätsche von hinten mit Körperkontakt bleibt Foul.
- **Großfeld-Fouls nicht über Standard:** erfüllt (1,91 gegenüber 2,18).
- **Ecken aus Blocks/Klärungen +0,5:** nicht erreicht (Ecken gesamt +0,01 ±0,07; aus Klärungen +0,06 ±0,04, aus Blocks −0,01, aus Paraden −0,04 wegen weniger Schüssen). Einordnung unten.
- **Ballgewinne im letzten Drittel +20 %:** nicht belegt (+4,5 % ±30 %, Standardfeld +21 % ±47 %, großes Feld −10 %). Einordnung unten.
- **Favoritenquote nicht senken:** nicht gesenkt im statistischen Sinn (Siege 43,3 → 40,3 % bei ±8,5, ungeschlagen 93,3 → 94,8 %), die Richtung der Siege ist leicht negativ. Ursache sind vor allem die 0,33 Freistoßschüsse weniger je Partie; die Schüsse aus dem Spiel sinken nur von 2,49 auf 2,29.

### Einordnung der zwei verfehlten Kriterien

**Ecken (+0,5 → +0,06): die Auslöser fehlen nicht, die Planannahme passt nicht zu den Mengen im SI-F-Stand.**

- Verdrahtung: `v183Clearance` wird über die SI-F-Weiche im Luftduell (`pitch-v55.js:386`) schon aufgerufen, ein SI-7-Stub fehlt dafür nicht; Blocks laufen über `v50Deflect` mit `v183BlockAim`, das der Blockpfad von SI-3 (`v55Shoot` → `v50Deflect`) ohnehin durchläuft. Nicht verdrahtet bleibt nur der Flankenblock am Flankengeber (SI-7-Code, siehe Übergabe).
- Menge: 0,82 Kopfballklärungen und 0,06 Blocks je Partie. Selbst wenn **jede** Klärung hinausginge und 60 % davon die Torlinie träfen, ergäben sich 0,49 Ecken; die gemessene Aus-Quote von 19–42 % je nach Druck (11–25 % Ecke je Klärung) liefert 0,1–0,2. Ein Block erreicht die Torlinie schon im Altpfad in 58 % (jetzt 64 %): Der Richtungshebel bringt nur +6 Punkte je Block, die Ecken kommen aus der Menge der Blocks.
- Mit den Mengen des Zielbilds (Flanken ≥ 2,0, rund 11 Schüsse, 0,6–0,9 Blocks, 1,5–2 Klärungen) sind aus Blocks rund 0,4–0,6 Ecken (davon 0,04 durch SI-4) und aus Klärungen rund 0,3 zu erwarten; der Zuwachs durch SI-4 allein bleibt bei 0,15–0,3. Die übrigen Ecken stammen aus Paraden (SI-3) und Flanken (SI-7).
- Geprüfter Hebel: Klärung nach Ballgewinn in der eigenen Box (H6). Obergrenze 1,27 Ballgewinne je Partie dort (Zweikampf 0,52, Abfangen 0,26, freier Ball 0,49); mit 60 % Klärung, 40 % Aus und 60 % Torlinie bleiben 0,18 Ecken. Das erreicht +0,5 nicht und gibt den Ball bei jedem Fall aus der Hand (Risiko für Favoritenquote und Spielfluss); nicht umgesetzt. Kalibrierhebel für SI-K: `clearOutBase`, `clearOutPressure`, `clearOutBox`, `clearOutMax`, `blockBias`.

**Ballgewinne im letzten Drittel (+4,5 % ±30 %): Die Planannahme „Gegenpressing hebt die Ballgewinne“ trifft in dieser Engine nicht zu, und die Serie kann +20 % nicht auflösen.**

- Auflösung: 0,57 Gewinne je Partie, Standardabweichung der gepaarten Differenz 1,22. Für +20 % (+0,11) bei 95 % Sicherheit wären 434 Partien nötig, für ±0,05 rund 2.300; 192 Partien lösen nur ±0,17 auf.
- Wirkung des Fensters (Szenenvergleich, 1.200 Wiederholungen mit zufälligen Positionen und Fähigkeiten, Ballverlust im letzten Drittel, Rückgewinn ≤ 3 s): Paket aus 13,6 % (±1,9), Paket ohne Fenster 11,4 % (±1,8), mit Fenster 10,7 % (±1,8); ein Presser statt zwei 11,7 %, zwei Presser ohne Passwegschneider 10,6 % (je ±1,8). Weitere Varianten (600 Wiederholungen, ±2,7): Pressingtempo 1,8 12,8 %, drei Presser mit 20 m Reichweite, 3–4 s Fenster und Tempo 1,8 12,0 %, Grätschenkadenz 0,25 s 11,8 %, Kontaktfenster 0,15 s 11,7 %. Keine Variante übertrifft „Fenster aus“ (11,4 %).
- Ursachen in den Engineregeln, nicht in fehlenden Auslösern oder Stubs: (1) Der neue Ballführer spielt nach 0,4–1 s ab (1,75 Pässe je Szene), die nächsten Presser stehen 4–8 m entfernt und brauchen aus dem Stand rund 1 s. (2) Der B03-Pressingpunkt liegt auf der Seite des eigenen Tores, also vor dem Ballführer; ein Gegenpresser muss den Ballführer erst umlaufen. (3) `v55GroundPass` würfelt das Abfangen nur für den ersten Kandidaten an der Passlinie (eine Ziehung); mehr Verteidiger an der Linie erhöhen die Abfangchance nicht, und wer vom Empfänger abgezogen wird, fehlt dort (Abfangen 0,135 → 0,113 je Szene). (4) Die Umstellung auf einen Kontaktweg mit Grätschenvorhersage kostet etwa 2 Punkte Rückgewinn, weil weniger und gefilterte Grätschen (0,043 → 0,018 Grätschgewinne je Szene) den Gewinn beim Foulbudget (−1,9 Freistöße) bezahlen.
- Folgerung: Das Fenster ist neutral bis leicht negativ und bleibt als Parametersatz erhalten (`counterWindow` = 0 schaltet es ab). Ein Hebel, der die Ballgewinne vorn messbar hebt, liegt außerhalb von SI-4 (höhere Ausgangspositionen und Kompaktheit nach Ballverlust: SI-2/SI-5; Pressingtaktik) oder erfordert, Grätschen mehr Foulbudget zu geben (`slideForecast` 0, `slideInterval`), was die Freistöße wieder anhebt. Das entscheidet SI-K mit einer Abnahmereihe von mindestens 450 Partien.

Rechenzeit: 14,3 s gegenüber 13,2 s je Partie im Browser unter Last (+8 %, ganze Engine).

### Kontrolle auf dem Integrationsstand (SI-0 und SI-3 aktiv)

48 gepaarte Partien (24 Vereine × 2 Feldgrößen), Uhr 0,42, Pakete `clock` und `finish` an, Stand `b28e3ab6`. Mit SI-0 (Echtzeit-Erholungszeiten) steigen die Grätschen und Fouls im Basisstand stark an; SI-4 ist dort das Gegengewicht.

| Kennzahl | `defence` aus | Vorgaben (`slideForecast` 2) | `slideForecast` 0 |
| --- | ---: | ---: | ---: |
| Freistöße | 8,52 | 2,63 (−5,9 ±1,0) | 4,27 (−4,3 ±0,8) |
| davon Fouls aus Grätschen / stehend | 7,1 / 1,15 | 1,23 / 1,21 | – |
| Grätschenstarts / gewonnen | 12,8 / 2,29 | 3,6 / – | 6,5 / 1,13 |
| Schüsse | 7,23 | 4,90 (−2,3 ±0,7) | 5,69 (−1,5 ±0,8) |
| Tore | 2,23 | 1,48 (−0,75 ±0,5) | 1,85 (−0,38 ±0,45) |
| Direkte Freistoßschüsse | 1,60 | 0,40 | – |
| Ballgewinne im letzten Drittel | 0,81 | 0,58 (−0,23 ±0,35) | 0,69 (−0,13 ±0,31) |
| Favoriten (N 34) Siege | 64,7 % | 70,6 % | – |

Folgerung für SI-K: Das Foulbudget (≤ 4,5) ist mit den Vorgaben deutlich unterschritten; der Verlust an Freistoßschüssen und folgenden Angriffen kostet dort 0,75 Tore. `defence.slideForecast` = 0 erreicht 4,27 Freistöße mit nur −0,38 Toren und ist der naheliegende Ausgangspunkt der Kalibrierung (Grätschen von hinten bleiben dann Fouls nach B03, werden aber wieder gewählt). Alle Werte sind Vorgaben im Modul und per Konstruktor überschreibbar; 48 Partien lösen Differenzen unter etwa 0,4 Toren nicht auf.

## Tests

- `node work/test-si-defence-v183.cjs` (28 Prüfungen): Vorgaben und Schalter, alter Pfad (Paket aus: digestgleich zum 182-Konstruktor; ohne Marker; `v50Foul` wie bisher), Radius (Ellipse vs. Meter, beide Feldgrößen), ein Kontaktweg, Kontaktfenster, Foul nur im Kontakt mit Protokoll, B03 für beide Teams, Grätschenvorhersage und -kadenz, Filterstufen, Konstantengleichlauf mit `pitch-v56.js`, Rollen (Absicherer, Zonen, Klebrigkeit), Gegenpressing (Fenster, Rollen, Passwegschneider, Auslaufen, Rückgewinn), Tempo, `v183Clearance` (Auswertung, Ziehungen, Ecke/Einwurf durch die Freiballbahn), Blockrichtung, keine Zufallsziehungen in Planern, Restore (Szene und Gesamtpartie an fünf Zeitpunkten). Dazu `node work/check-restore-defence-v183.cjs --port=4256` (B19-Szenen, Lane B mit Lock).
- Messwerkzeuge: `work/measure-si-defence-v183.cjs` (Hülle um `measure-si183.cjs` mit lesenden Beobachtern; ändert die Harness nicht), `work/table-si-defence-v183.cjs` (gepaarte Tabelle, Favoriten), `work/measure-si-defence-scenes-v183.cjs` (Ballverlustszenen), `work/measure-si-defence-conversions-v183.cjs` (Mechanismusraten), `work/si-defence-scenes-v183.cjs` (Szenenbau).

## Übergabe und Weichenbedarf

- **SI-1:** `defence.passPressureRadius` (9 m) ersetzt den normalisierten Druckradius .15 in `v55GroundPass`; die Ankunftsschätzung sollte `v183Radius(m,'defence.passPressureRadius',.15)` verwenden. Für `pitch-v55.js:494` gilt `defence.decisionPressureRadius`.
- **SI-3:** `pitch-v55.js:403` mit `defence.shotPressureRadius`; Blockrichtung optional über `v183Clearance(m,blocker,point,{kind:'block'})`, sonst wirkt `v183BlockAim`.
- **SI-7:** `pitch-v55.js:328` mit `defence.crossPressureRadius`; `v183Clearance` ist über die vorhandene Weiche aktiv. Ein Flankenblock am Flankengeber (H6) braucht einen Aufruf in `v55HighPass` (ihr Besitz): Vorschlag `v183Clearance(m,nächsterVerteidiger,Flankenpunkt,{kind:'block'})` und bei `out` Ecke.
- **SI-5:** `v121PreparePositioning` ist nicht umhüllt. Die Linienbasis steht normalisiert in `world-backpedal-v108.js:15` (.21/.31/.41 = 15/22/30 m Standard, 18/27/36 m groß); für Meter braucht SI-5 eine Weiche an dieser Stelle oder die Freigabe, die Funktion zu umhüllen.
- **SI-0:** Die Grätschenvorhersage rechnet in Echtsekunden (`V183_DEF_SLIDE_SECONDS` = 0,65; `pitch-v56.js:47` nach SI-0: Fortschritt je Echtsekunde `1/.65` bei jeder Rate); das Modul enthält kein `MATCH_SPEED` mehr. Vor dem SI-0-Merge ist die Engine-Grätsche bei Rate ≠ 0,78 langsamer, die Vorhersage dann zu schnell; die 192er-Serie lief vor dem SI-0-Merge mit der damaligen ratenabhängigen Formel (Rate 0,42), also konsistent zur damaligen Engine. `test-si-defence-v183.cjs` prüft mit `packages.clock:true` und `clockRate:.42`, dass die Vorhersage ratenunabhängig ist; ist die Engine bereits auf Echtzeit (SI-0), prüft er zusätzlich 1,538 Fortschritt je Echtsekunde bei 0,78 und 0,42 (mit `feat/si-clock` gemergt: 28/28 grün). Die Konstanten aus `v56MaybeChallenge` prüft der Gleichlauftest weiterhin. Alle Zeiten des Pakets sind `v102Clock` (Echtzeit).
- **Alle:** Neue Aufrufer von `v50Foul` laufen unverändert durch das Entfernungstor (≤ 43/32 m) und erscheinen im Protokoll mit `contact:false`.
- **Gemeinsame Prüfungen:** `test-si-core-v183.cjs` und `check-old-matches-v183.cjs` sind die unveränderten Integrationsfassungen (`f2d53ab3`/`ef78fca6` gemergt); mit eingeschaltetem `defence`: 28/28 bzw. 340 Szenen byteidentisch, `check-old-matches-v182.cjs` 158 Szenen identisch.
