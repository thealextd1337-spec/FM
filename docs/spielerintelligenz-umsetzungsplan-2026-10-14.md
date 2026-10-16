# Spielerintelligenz: Anforderungsprüfung und paralleler Umsetzungsplan

Stand: 14. Oktober 2026. Planungsdokument ohne Produktänderung; `dist/` ist unverändert (Hashprüfung in jedem Messlauf). Worktree `work/p01-analysis`, Branch `analysis/p01-r132`, Basis `9abccdd5` auf dem veröffentlichten Release-132-Stand `e4e531c0`. Zeilenangaben beziehen sich auf `dist/` in `e4e531c0`.

Bezug: [Spielerintelligenz-Analyse](spielerintelligenz-analyse-2026-10-14.md) (Architektur W1–W13, Zielbild, Prototypen), [P01-Analyse](p01-analyse-2026-10-14.md), [Entscheidungen](entscheidungen.md) (Zeilen „P01-Ziele“ und „Spielerintelligenz-Entscheidungen“ vom 14. Oktober 2026), [Bugliste](Bugliste.md), [Mentale Fähigkeiten](mentale-faehigkeiten-plan.md), [Entwicklung](development.md#spielstände-beim-neuen-weltmodell).

## 1. Ergebnis in Kürze

- **Keine neuen Nutzerfragen.** Alle offenen Punkte aus Abschnitt 8 der Analyse sind beantwortet oder lassen sich mit begründetem Standard entscheiden (Abschnitt 5). Deshalb folgt direkt der parallele Plan.
- **Mentale Werte existieren bereits.** `calm` (Ruhe), `ant` (Antizipation), `dec` (Entscheidungen) und `str` (Körperkraft) gehören zu `D6PlayerGeneration.SKILL_KEYS` (`player-generation.js:9`). Sie werden mit Positionsgewichten erzeugt (`:13-16`), entwickeln sich im Erwachsenenmodell und laufen durch `D6EffectiveAbilities` (`player-effective-abilities.js:8, 50-52`). Die Matchengine nutzt sie heute nur für Elfmeter (`penalties-v42.js:13`) und den Reaktionsverlust bei Müdigkeit (`world-player-load-v158.js:81`). Persönlichkeit lässt sich deshalb deterministisch aus Rolle und diesen Werten berechnen. Es sind keine neuen Spielerdaten und keine Umrechnung nötig.
- **Nachmessung in diesem Durchgang.** Vier gepaarte Serien zu je 192 Partien auf `si-max42-norisk` (Abschnitt 3). Sie korrigieren drei Annahmen der Analyse:
  - Die Abprallerverwertung ist kein großer Schusshebel. Je Partie gibt es nur 0,9–1,2 Paraden/Blocks; eine Abschlussregel allein wirkt nicht.
  - Das Platzierungsmodell macht Torwart und Schützen sichtbar, gleicht aber in einfacher Form schwache Schützen an. Es braucht eine fähigkeitssteile Ausführung.
  - Eine langsamere Uhr allein (0,36: 4,76 min, 98 % im Fenster) bringt nur die Hälfte der erwarteten Ereignisse (+0,64 Schüsse), solange Takte in Uhreinheiten stehen. Die Echtzeit-Takte aus SI-0 sind deshalb Voraussetzung.
- **Größte zusätzliche Hebel** (Abschnitt 4):
  1. Dauerfenster bis ≈5 min ausnutzen (gemeinsame Uhr ≈0,35–0,37).
  2. Flanke → Kopfball: 0,33 angekommene Flanken ergeben heute nur 0,06 Kopfballschüsse; der Luftball ist nur in 0,65 m erreichbar.
  3. Schussfreude guter Schützen aus der Distanz über Persönlichkeit.
  4. Schuss aus der Drehung statt „drehen, dann passen“.
  5. Ecken aus geblockten Flanken, Klärungen und Paraden.
  6. Kontaktlose Foulprobe entfernen: 6,1 Freistöße je Partie.
- **Rechnerischer Zielpfad:** ≈11–12 Schüsse, ≈2,4–2,6 Tore, Favoriten ≥65 %, ≈5 min (Abschnitt 4.2).
- **Plan:** ein kleines Fundament-Paket SI-F. Danach sechs parallele Pakete in Welle 1 (SI-0, SI-1, SI-2, SI-3, SI-4 und neu SI-7 Flanken/Ecken/Kopfball), jeweils in einem eigenen Modul. Welle 2 bringt SI-5 und die Unity-Begleitung, anschließend folgen Integration/Kalibrierung und SI-6 (P02). Dazu kommen drei Begleitpakete für B19, B20 und Unity B02/B05 (Abschnitte 6–11).

## 2. Anforderungsprüfung

### 2.1 Anforderung gegen Zielbild und Pakete

Spalte „heute“ = `si-max42-norisk` (beste gemessene Kombination, Analyse 5.3), beide Feldgrößen, 192 Partien.

| Nutzeranforderung | heute | Lücke, Schwäche, Widerspruch | Zusätzlicher Hebel → Paket |
| --- | --- | --- | --- |
| 4–6 min all-inclusive, Minute darf länger dauern | 4,18 min, 65 % im Fenster | Fenster wird nur unten genutzt. Mehr Laufzeit bringt nur dann proportional mehr Ereignisse, wenn die Takte in Echtzeit stehen (gemessen, Abschnitt 3) | H1 Uhrziel ≈5,0 min, Endkalibrierung im Integrationslauf → SI-0/SI-K |
| Eine gemeinsame Uhrrate | erfüllt (Prototyp) | Großes Feld hat bei gleicher Uhr 20–25 % weniger Schüsse | Lücke wird über Raum/Tempo geschlossen, nie über die Uhr → SI-5 |
| 2–3 Tore | 1,64 | +0,7–0,9 Tore nötig | Ereignismenge (H1, H3, H4, H5) statt höherer Torquote je Schuss → SI-0/1/7 |
| Mehr Schüsse (Arbeitsannahme 10–14), Tore ≤3 | 7,5, 18 % im Fenster 10–16 | Zusätzliche Schüsse müssen ≈15–20 % Torquote haben, sonst kippen die Tore über 3 oder fallen | Mischung aus Distanzschüssen guter Schützen (≈22 %), Kopfbällen (≈20–25 %), Eckenfolgen; Abnahmekriterium „Tore/Schuss 17–23 %“ → SI-K |
| Schussqualität erhöhen | 34 % aufs Tor | Aufs-Tor-Quote entsteht aus einem pauschalen Wurf, nicht aus der Platzierung | H2 Platzierungsmodell → SI-3 |
| Gute Schützen aus der Distanz | 11 % Fernschüsse, Schützen ≈14,3 Abschluss | Fernschussfenster vorhanden, aber Häufigkeit nicht nach Schussfreude | H4 Schussfreude (Rolle + `fin`/`calm`/`dec`) → SI-1 |
| Fernschüsse treffen oft, wenn genau in der Ecke | 22–26 m, Abschluss ≥14: 23 % Tore je Schuss | Ein Tor entsteht heute entweder über zwei pauschale Würfe (aufs Tor `pitch-v55.js:417`, Tor mit e^(−(d−12)/13) `:420`) oder über die Unerreichbarkeit (`:426`); die Platzierung ist nur einer von zwei Wegen | H2: Tor genau dann, wenn der getroffene Punkt für den Torwart unerreichbar ist; Ecke nach `dec`, Streuung nach `fin`/`tec`/`calm` → SI-3 |
| Favoriten ≈65 % | 66 % (±8 Punkte bei 134 Partien) | Stärke hängt an Ereignismenge; Platzierungsmodell in einfacher Form senkt auf 59 % | Fähigkeitssteile Ausführung als Abnahmekriterium; Abnahmereihe 576 Partien (±4,5 Punkte) → SI-3/SI-K |
| Verteidigern entkommen, Spielmacher mehr Risiko | Risiko pauschal schädlich (25 %) | Risiko muss Erwartungswert mit Fähigkeit sein | Persönlichkeit wirkt auf die Risiko*bereitschaft*, Fähigkeit auf die Ankunfts*wahrscheinlichkeit* → SI-1; Freilaufmuster → SI-2 |
| Freistöße zügiger, Teleport ohne Kaschieren | 2,9 s je Freistoß, aber 6,1 Freistöße | Viele Freistöße stammen aus der kontaktlosen Foulprobe (`set-pieces-v50.js:160-170`, W5) | H11 Foul nur bei Kontakt → SI-4; Teleport → SI-0 |
| Mehr Abpraller | 2,3 freie Bälle aus Schüssen | Nur 0,9 Paraden/Blocks je Partie, Angreifer gewinnen 25 % davon (Abschnitt 3) | H7 Nachsetzen als Laufweg und Paradenrichtung nach Torwartspiel → SI-2/SI-3 |
| Mehr Ecken | 0,27 | Ecken entstehen fast nur aus Paraden ins Aus | H6 geblockte Flanken, Klären unter Druck, Paraden um den Pfosten → SI-4/SI-3/SI-7 |
| Mehr Flanken | 1,52, davon 0,33 angekommen, 0,06 Kopfballschüsse | Luftball nur in 0,65 m erreichbar (`pitch-v55.js:368`); Flankenfehler pauschal (W12) | H3 Erreichbarkeit aus Sprung/Anlauf, Fehlermodell wie B10, Kopfball-/Volleyabschluss → SI-7 |
| Spielerstärken sichtbar | Tordiff. je Stärkepunkt 0,38 | Torwartstärke kaum sichtbar (gk ≥14: 47 % Tore je Schuss aufs Tor, 10–14: 63 %) | gk-Reichweite + Paradenrichtung → SI-3; `ant` für Nachsetzen/Abpraller → SI-2 |
| Persönlichkeit aus Rolle + mentalen Werten | nicht modelliert | Werte vorhanden (Abschnitt 1), Engine liest sie nicht | `v183Personality(p)` im Fundament, Nutzung in SI-1/SI-2/SI-3 |
| P02: kompakt folgt ausgespielt | 11,7–13,8 Schüsse kompakt | Kennzahlen stehen erst nach Kalibrierung fest | SI-6 nach SI-K |
| Großes Feld + 6 Feldspieler | 6,9 Schüsse, 1,60 Tore, 67 % | Zone gleich groß, Weg 20 % länger, Angebote nicht skaliert | H15 Mannschaftsform in Metern → SI-5 |
| B03 bleibt, Fähigkeiten nur Farbstufen, Marker nur im Konstruktor | — | — | Feste Grenzen in jedem Paket (Abschnitt 6.2) |

### 2.2 Zielkonflikte und ihre Auflösung

1. **Mehr Schüsse gegen 2–3 Tore.** Bei 12 Schüssen und 2,5 Toren liegt die Torquote bei ≈21 % je Schuss. Das entspricht etwa der heutigen Quote von 22 %. Neue Schussquellen dürfen deshalb im Mittel nicht schlechter als ≈15 % sein. Das schließt Distanzschüsse schwacher Schützen und blinde Abprallerschüsse aus. Zulässig sind Distanzschüsse guter Schützen, Kopfbälle nach Flanken, Schüsse aus Eckenfolgen und Abschlüsse aus der Drehung.
2. **Fernschüsse treffen oft gegen Torwart sichtbar.** Beides passt, wenn ausschließlich die Platzierung entscheidet. Gut platzierte Schüsse in die Ecke sind unerreichbar, mittige werden gehalten, starke Torhüter verkleinern den unerreichbaren Bereich. Ein pauschaler Torwurf je Distanz widerspricht beiden Zielen und fällt weg.
3. **Passrisiko gegen 65 % Favoriten.** Risiko ist Varianz; Varianz nützt dem Außenseiter (gemessen 25 %). Persönlichkeit darf deshalb nur die Bereitschaft verschieben, einen Pass mit positivem Erwartungswert zu spielen. Die Ankunftswahrscheinlichkeit hängt an `pas`/`tec`, die Treffsicherheit der Einschätzung an `dec`. Ein schwacher Risikospieler spielt dann nicht mehr riskante Pässe, sondern schätzt sie schlechter ein.
4. **Gemeinsame Uhr gegen großes Feld.** Die Uhr gleicht das große Feld ausdrücklich nicht aus. SI-5 schließt die Lücke über Raumaufteilung und Angebote; Abnahme: großes Feld ≥85 % der Schüsse und Tore des Standardfelds.
5. **Dynamisch wirkend gegen langsamere Uhr.** Die Uhr ändert nur die Umrechnung von Echtzeit in Anzeigeminuten, wenn alle Takte und Mindestflugzeiten in Echtzeit stehen (W6, H13). Bewegung und Entscheidungen bleiben gleich schnell. Ohne diese Bereinigung verlangsamt eine Uhr von 0,36 alle Uhreinheiten-Takte auf das 2,2-Fache.
6. **Persönlichkeit gegen „Vorliebe verbessert kein Können“** ([Mentale Fähigkeiten](mentale-faehigkeiten-plan.md)). `v183Personality` verändert ausschließlich Gewichte der Optionswahl, nie Streuung, Reichweite oder Erfolgswahrscheinlichkeit. Ruhe begrenzt nur den zusätzlichen Druckverlust, Antizipation nur Erkennen und Vorbereitung, Entscheidungen nur die Wahlqualität. Es gibt keine doppelten Boni.

### 2.3 Zielwerte für die Abnahme

| Kennzahl | Ziel (Mittel, beide Feldgrößen) | Grenze |
| --- | --- | --- |
| Dauer all-inclusive | 4,8–5,2 min | ≥85 % der Partien in 4–6 min, keine unter 3,7 min |
| Schüsse beider Teams | 12–16 (vorläufig, Torziel 15. Oktober) | ≥45 % der Partien in 10–18 |
| aufs Tor | ≥38 % der Schüsse | — |
| Tore | 3–5, Mittel ≈4 (Nutzerentscheidung 15. Oktober 2026, ersetzt 2,2–2,8) | 0:0 ≤6 %; Partien mit ≥7 Toren (z. B. 4:3) 5–15 % |
| Tore je Schuss | 25–32 % (vorläufig, aus Torziel und Schusszahl abgeleitet; SI-K legt fest) | — |
| Favoriten ≥1 Punkt | ≥62 % (576 Partien) | Tordifferenz je Stärkepunkt ≥0,35 |
| Abschluss ≥14 gegen <10, Tore je Schuss | Verhältnis ≥1,8 | — |
| Torwart ≥14 gegen 10–14, Tore je Schuss aufs Tor | ≥10 Punkte Abstand | — |
| Fernschüsse >22 m | 12–20 % der Spielzugschüsse, ≥75 % von Schützen mit Abschluss ≥13 | Torquote Abschluss ≥14: 15–25 % |
| Flanken / angekommen / Kopfball-/Volleyschüsse | ≥2,0 / ≥45 % / ≥0,6 | — |
| Ecken | ≥1,2 | ≤3,0 |
| Abprallerschüsse ≤5 s nach Parade/Block | ≥0,3 | — |
| Freistöße | ≤4,5 je Partie, ≤3,0 s je Freistoß | Fouls nur mit Kontakt |
| Großes Feld (6 Feldspieler) | ≥85 % von Schüssen/Toren des Standardfelds | Favoriten ≥60 % |
| Altpartien (unmarkiert, 182) | byteidentisch zum Basisstand | — |

## 3. Nachmessung in diesem Durchgang

Gleiche 192 Begegnungen und Seeds wie die Analyse (96 Vereine × 2 Feldgrößen). Die Differenzen in Klammern sind gepaart gegen `si-max42-norisk` (±95 %). Varianten liegen in `work/patch-si-harness.cjs`, Rohdaten in `outputs/si-r132/` (gitignoriert).

| Variante | Änderung in der Kopie |
| --- | --- |
| si-place | Platzierungsmodell: aufs Tor nur, wenn der gestreute Punkt im Tor liegt und kein Höhenfehler eintritt; Höhenfehler gekoppelt an Abschlussqualität, Distanz, Druck und Ruhe. Tor nur, wenn der Punkt für den Torwart unerreichbar ist; der pauschale Torwurf und die Mittelregel entfallen. Seitliche Streuung wächst mit der Distanz (×(0,55+d/26)); der Druckanteil wird durch Ruhe gedämpft. Für die Torwartreichweite gilt ein Schusstempo von 21+0,4·fin+0,2·tec m/s; die Flugdarstellung bleibt unverändert (`match-shot-choice-v159.js:9,24`, `pitch-v55.js:417,420`) |
| si-follow | Feldspieler, die einen zuletzt vom Gegner berührten freien Ball (Parade, Block, Klärung) innerhalb 18 m gewinnen, versuchen den nativen Direktabschluss bzw. die Ablage, nicht nur bei freiem Tor (`world-ball-motion-v110.js:76`). Paraden springen breiter und weiter vom Torwart weg (`:23`) |
| si-place-follow | beides |
| si-max36-norisk | `si-max42-norisk` mit Uhr 0,36 statt 0,42 |

| Kennzahl | si-max42-norisk | si-place | si-follow | si-place-follow | si-max36-norisk |
| --- | ---: | ---: | ---: | ---: | ---: |
| Minuten (4–6 min) | 4,18 (65 %) | 4,20 (69 %) | 4,18 (66 %) | 4,20 (72 %) | 4,76 (98 %, +0,58 ±0,07) |
| Schüsse | 7,49 | 7,70 (+0,21 ±0,39) | 7,47 (−0,02 ±0,22) | 7,60 (+0,11 ±0,38) | 8,13 (+0,64 ±0,42) |
| aufs Tor (Tor, gefangen, abgewehrt) | 2,58 (34 %) | 3,14 (41 %, +0,56 ±0,32) | 2,58 (35 %, +0,01 ±0,17) | 3,18 (42 %, +0,61 ±0,31) | 2,77 (34 %, +0,20 ±0,31) |
| Tore | 1,64 | 1,72 (+0,08 ±0,25) | 1,67 (+0,03 ±0,13) | 1,73 (+0,10 ±0,24) | 1,71 (+0,07 ±0,25) |
| Paraden (gefangen + abgewehrt) | 1,08 | 1,58 (+0,50 ±0,23) | 1,07 (−0,01 ±0,11) | 1,60 (+0,52 ±0,22) | 1,16 (+0,07 ±0,21) |
| Ecken | 0,27 | 0,37 (+0,10 ±0,12) | 0,28 (+0,01 ±0,05) | 0,34 (+0,07 ±0,12) | 0,31 (+0,04 ±0,11) |
| Tor je Schuss aufs Tor (Tabellenwerkzeug) | 58 % | 50 % | 58 % | 50 % | 58 % |
| 0:0 / 2–3 Tore | 21 % / 36 % | 18 % / 44 % | 19 % / 40 % | 15 % / 42 % | 22 % / 42 % |
| Favoriten ≥1 (N 134) | 66 % | 59 % | 66 % | 60 % | 62 % |
| Tordiff. je Stärkepunkt | 0,38 | 0,31 | 0,39 | 0,32 | 0,35 |
| Schüsse je Minute laufender Uhr (Echtzeit) | 2,30 | – | – | – | 2,13 |
| Großes Feld: Schüsse / Tore | 6,94 / 1,60 | 6,93 / 1,58 | 6,78 / 1,55 | 7,05 / 1,60 | 7,78 / 1,74 |

**Schussverwertung nach Abschluss und Torwart** (Spielzugschüsse, Tore je Schuss):

| Gruppe | si-max42-norisk | si-place |
| --- | ---: | ---: |
| ≤14 m, Abschluss <10 / 10–14 / ≥14 | 22 / 31 / 45 % | 38 / 36 / 49 % |
| 14–22 m, Abschluss <10 / 10–14 / ≥14 | 14 / 18 / 30 % | 16 / 16 / 30 % |
| >22 m, Abschluss 10–14 / ≥14 (aufs Tor) | 7 / 23 % (29 / 36 %) | 9 / 22 % (25 / 53 %) |
| alle, Abschluss <10 / ≥14 (Verhältnis) | 16 / 31 % (1,9) | 22 / 32 % (1,5) |
| Torwart 10–14 / ≥14, Tore je Schuss aufs Tor | 63 / 47 % | 55 / 47 % |

**Abpraller nach Parade/Block** (`si-max42-norisk` / `si-follow` / `si-place`): 0,92 / 0,95 / 1,19 Ereignisse je Partie. Angreifer gewinnen den nächsten Ballbesitz innerhalb 3 s in 25 / 21 / 22 % der Fälle, im Median 14–17 m vor dem Tor. Ein Schuss desselben Teams folgt innerhalb 5 s in 20 / 15 / 20 % der Fälle, das sind 0,19 / 0,15 / 0,23 je Partie.

**Flanken und Standards** (`si-max42-norisk`): 1,52 Flanken, 0,33 angekommen, 0,06 Kopfballschüsse. Dazu 0,27 Ecken mit 0,07 Schüssen ≤10 s danach und 6,08 Freistöße mit 17,6 s Stillstand. Direkte Freistöße: 0,95 je Partie mit 9 % Toren; im Platzierungsprototyp sind es nur 3 %.

Lesart:
- **Platzierungsmodell (si-place).** Mehr Schüsse gehen aufs Tor (34 → 41 %) und es gibt +0,5 Paraden; die Torwartstärke wird damit erstmals in Paraden sichtbar. Die Torzahl bleibt gleich (+0,08), gute Fernschützen treffen unverändert ≈22 % – jetzt aber über die Platzierung (53 % aufs Tor). In dieser einfachen Form gleicht das Modell schwache Nahschützen an (22 → 38 %), weil nahe Schüsse kaum streuen. Damit sinken Favoritenquote und Stärkebild (66 → 59 %, 0,38 → 0,31). Die Favoritenquote allein liegt innerhalb der Streuung; Tordifferenz je Stärkepunkt und Fähigkeitsverhältnis (1,9 → 1,5) bestätigen aber die Richtung. Folge für SI-3: Die Ausführungsstreuung muss im Nahbereich fähigkeitssteil sein, mit Druck, Eile und Körperstellung; die Eckwahl folgt `dec`. Direkte Freistöße brauchen eigene Kalibrierung (Mauer, Anlauf). Abnahme über das Verhältnis 1,8 (Abschnitt 2.3).
- **Abschlussregel für Abpraller (si-follow) wirkt nicht** (±0). Engpass ist nicht die Entscheidung nach dem Ballgewinn, sondern die Zahl der Paraden/Blocks (≈1 je Partie) und die Position der Angreifer (Verteidiger stehen torseitig). Selbst bei 50 % Ballgewinn und 60 % Abschluss wären es nur ≈+0,3 Schüsse. **Korrektur zur Analyse (5.3, SI-3):** Die Abprallerverwertung ist nicht der größte verbleibende Hebel. Sie wird als Laufweg „Nachsetzen“ (SI-2) und als Paradenrichtung nach `gk` (SI-3) umgesetzt, mit kleinem Zielwert (≥0,3 Abprallerschüsse).
- **Uhr 0,36 (si-max36-norisk), ohne Echtzeit-Takte.** Die Partie wird 0,58 min länger, 98 % liegen im Fenster 4–6 min. Bei +17 % laufender Echtzeit gibt es aber nur +0,64 Schüsse (+8,5 %) und +0,07 Tore; die Schüsse je Minute laufender Uhr sinken von 2,30 auf 2,13. Ursache sind die Takte in Uhreinheiten (W6): Die Pause nach einer Annahme (`.75`) dauert bei 0,36 schon 2,1 s, bei 0,42 1,8 s und bei 0,78 nur 0,96 s. Folge: H1 wirkt erst zusammen mit SI-0 vollständig. Mit Takten in Echtzeit sind bei gleicher Laufzeit ≈8,8 Schüsse (+1,3) und ≈1,9 Tore zu erwarten. SI-0 ist damit Voraussetzung für die Dauer-Hebel, nicht nur Dauerkosmetik.

## 4. Zusätzliche Hebel

### 4.1 Liste

Wirkung je Partie, beide Feldgrößen. „gemessen“ = Abschnitt 3 oder Analyse; sonst begründete Schätzung aus den Messdaten.

| # | Hebel | Befund im Code / in den Daten | erwartete Wirkung | Paket |
| --- | --- | --- | --- | --- |
| H1 | **Dauerfenster ausnutzen:** gemeinsame Uhr so kalibrieren, dass das Mittel ≈5,0 min erreicht (statt 4,2) | Echtzeit ≈ 83/Rate + 55–65 s (Analyse 5.5); Ereignisse skalieren mit laufender Uhr, solange alle Takte in Echtzeit stehen | gemessen bei Uhr 0,36 ohne Echtzeit-Takte: +0,58 min, +0,64 Schüsse, +0,07 Tore; mit SI-0 erwartet ≈+1,3 Schüsse und ≈+0,3 Tore | SI-0 (Vertrag), SI-K (Endwert) |
| H2 | **Platzierungsmodell:** Ziel (Eckwahl nach `dec` und eigener Streuung), Streuung seitlich und in der Höhe nach `fin`/`tec`, Druck×(1−Ruhe) und Distanz; Schusstempo nach `fin`/`tec`; Tor genau dann, wenn der Punkt unerreichbar ist; Torwartreichweite, Reaktion und Seitwärtstempo nach `gk` | Heute zwei pauschale Würfe (`pitch-v55.js:417,420`) und eine Mittelregel (`:423`); Fenster mit fünf Zielpunkten (`match-shot-choice-v159.js:13-18`) | gemessen: +7 Punkte aufs Tor, +0,5 Paraden, Tore ±0; mit steiler Nahstreuung Favoriten wieder ≥65 % (Ziel) | SI-3 |
| H3 | **Flanke → Kopfball:** Erreichbarkeit des Luftballs aus Sprunghöhe, Anlauf und Ankunftszeit (`air`, Körpergröße), nicht aus 0,65 m um den Landepunkt; Flankenfehler fähigkeitsabhängig wie die B10-Ecke (`v182CornerLanding`) statt 50 % Pauschalvariante; Kopfball-/Volleyabschluss bei Ankunft ≤12 m | `v122ResolveAir` (`pitch-v55.js:367-400`), Flankenvarianten `:330`; 0,33 angekommen → 0,06 Kopfballschüsse | +0,5–0,8 Schüsse, +0,1–0,2 Tore; senkt auch den B10-Folgeball (16 % unerreichte hohe Ecken) | SI-7 |
| H4 | **Schussfreude guter Schützen:** Schussgewicht aus Rolle (Torjäger/Stoßstürmer) und `fin`, `calm`, `dec`; Fernschüsse vor allem bei Abschluss ≥13 | Fernschussfenster `16+0,7·fin` vorhanden (Prototyp `decide`), Häufigkeit 0,72 je Partie | +0,5–0,8 Schüsse bei ≈22 % Torquote (gemessen für Abschluss ≥14) | SI-1 |
| H5 | **Schuss aus der Drehung:** Körperstellung als Eigenschaft jeder Option statt Drehen vor jedem Pass (`v157ContinueTurn`, `world-offensive-quality-v157.js:159-171`) | 10,5 Drehzustände je Partie bei 18–22 m (Analyse 5.6) | +0,5–1,0 Schüsse, Dynamik sichtbar | SI-1 |
| H6 | **Ecken aus mehr Quellen:** geblockte Flanken (nächster Verteidiger am Flankengeber), Klären ins Toraus unter Druck in der eigenen Box, Paraden um den Pfosten bei harten Schüssen in die Ecke (nach `gk`), Blockrichtung | Ecken fast nur aus Torwartabwehr ins Aus (`world-ball-motion-v110.js:23`) und Blocks (`set-pieces-v50.js:215`) | 0,27 → 1,2–1,8 Ecken; +0,3 Schüsse; +6 s Stillstand je Ecke | SI-4 (Block/Klären), SI-3 (Parade), SI-7 (Ausführung) |
| H7 | **Nachsetzen:** Stürmer mit hoher Antizipation laufen beim Schuss in die Abprallerzone (5–8 m vor dem Tor); Paraden fähigkeitsabhängig zur Seite oder ins Feld | si-follow wirkungslos; Angreifer gewinnen 25 % der Paraden/Blocks | +0,2–0,4 Schüsse, Antizipation sichtbar | SI-2 (Lauf), SI-3 (Richtung) |
| H8 | **Zweiter Ball (Rückraum):** ein Mittelfeldspieler besetzt bei Flanke/Ecke den Rückraum (16–20 m mittig) | Kopfballklärungen landen 7+0,2·air m vor dem Klärenden (`pitch-v55.js:387`), meist ohne Angreifer | +0,2 Schüsse | SI-2 (Position), SI-7 (Auslöser) |
| H9 | **Gegenpressing:** nach Ballverlust im letzten Drittel 2–3 s Druck durch die zwei nächsten Spieler, Stärke nach Teamtaktik „Pressing“ und Rolle, B03-konform | „Ballgewinn vorn“ 0,85 Schüsse (Analyse 5.6) | +0,2–0,4 Schüsse aus kurzer Distanz | SI-4 |
| H10 | **Konter:** nach Ballgewinn in der eigenen Hälfte 3 s erhöhte Risikobereitschaft und zwei Tiefenläufer | bereits Zielbild 4.3 | +0,2–0,3 | SI-2 |
| H11 | **Foul nur bei Kontakt:** kontaktlose Foulprobe (`set-pieces-v50.js:160-170`) für neue Partien entfernen; Fouls entstehen nur über die Kontaktprüfung | 6,08 Freistöße, 17,6 s Stillstand je Partie | −2 Freistöße, −6 s Stillstand (≈+3 % Spielzeit bei gleicher Dauer); weniger direkte Freistöße | SI-4 |
| H12 | **Direkter Freistoß mit Schützenbezug:** bester Freistoßschütze auf dem Feld, Fenster nach `fin`, über das Platzierungsmodell; sonst schnelle Ausführung oder Flanke | 65-%-Regel (`set-pieces-v50.js:285`); 9 % Tore, im Platzierungsprototyp 3 % | weniger, aber bessere Freistoßschüsse; Torquote 8–12 % | SI-3 (Schuss), SI-7 (Varianten) |
| H13 | **Stillstand und Mindestzeiten in Echtzeit:** Mindestflugzeiten in Uhreinheiten (`.14` Schuss `world-pitch-actions-v99.js:137`, `.25` Block `set-pieces-v50.js:221`, `.32` Parade `world-ball-motion-v110.js:25`, Freiball-Sperre `.16` `set-pieces-v50.js:178`); Anstoßaufstellung schon während der Torszene; Torwartabspiel 2,4 → 1,6 s bei freiem Mitspieler (`world-pitch-actions-v99.js:25`) | Bei Uhr 0,36 wird eine Parade 0,9 s statt 0,4 s lang | Dynamik bei langsamer Uhr; −5–8 s Stillstand | SI-0 (Zeiten), SI-3 (Torwartabspiel) |
| H14 | **Entscheidungsqualität nach `dec`:** Rauschen nur auf der Bewertung (Nutzenschätzung), nie auf der Ausführung; Risiko- und Schussgewicht aus `v183Personality` | Prototyp `skillgate`: Rauschen allein hebt keine Favoriten (Analyse 5.7) | Stärke sichtbar über bessere Wahl der Starken; Kriterium Favoriten | SI-1 |
| H15 | **Großes Feld: Mannschaftsform in Metern:** Abstand der Linien und Breite des Blocks in Metern begrenzen, Angebotsraster und Laufvorlauf mit dem tatsächlichen Mitspielerabstand skalieren, Rasterzellen für sechs Spieler gleichmäßig | Analyse 6: Zeit in der 22-m-Zone 2,1–2,3 s statt 2,8–3,1 s; Skalierung der Passfilter allein +0,37 Schüsse | großes Feld ≥85 % des Standardfelds | SI-5 |
| H16 | **Entscheidungsprotokoll und Ledger-Quellen:** `decisionTrace` (flüchtig) und Quellen „Flanke“, „Kopfball“, „Distanzschuss“, „Abpraller“, „Konter“, „Doppelpass“ im Ball-Ledger v117 | heute nur Statistik | Messbarkeit aller Hebel, spätere Berichtstexte möglich | SI-F |

### 4.2 Rechnerischer Zielpfad

Ausgehend von `si-max42-norisk` (7,5 Schüsse / 1,64 Tore, 4,2 min):

| Schritt | Schüsse | Tore |
| --- | ---: | ---: |
| H1 Dauer ≈5,0 min (Faktor ≈1,17 auf laufende Uhr; setzt SI-0 voraus) | 8,8 | 1,92 |
| H3 Flanke/Kopfball +0,5 (≈25 %) | 9,3 | 2,04 |
| H4 Schussfreude guter Schützen +0,6 (≈22 %) | 9,9 | 2,17 |
| H5 Schuss aus der Drehung +0,6 (≈20 %) | 10,5 | 2,29 |
| H6 Ecken +0,3 (≈20 %), H7/H8 Abpraller/zweiter Ball +0,5 (≈25 %) | 11,3 | 2,48 |
| H9/H10 Gegenpressing/Konter +0,4 (≈25 %) | 11,7 | 2,58 |
| H2 Platzierung (Tore ±0, Verteilung zugunsten der Starken) | 11,7 | 2,6 |

Die Dauer steigt durch zusätzliche Tore (+1 Tor ≈ +10 s), Ecken (+6 s je Ecke) und Wiederanstöße. H11 und H13 senken den Stillstand. Die Endrate liegt daher bei ≈0,35–0,37 und wird erst in SI-K festgelegt.

## 5. Entscheidungen zu offenen Punkten

Keine dieser Entscheidungen ist eine neue Produktfrage; sie folgen aus den Nutzerzielen, den Produktregeln und den Messungen.

| Punkt (Analyse 8) | Entscheidung | Begründung |
| --- | --- | --- |
| 1 Uhrrate je Feldgröße | beantwortet: eine Rate | Nutzer |
| 2 Distanzschüsse | beantwortet: Platzierung | Nutzer; Modell H2 |
| 3 Persönlichkeit | beantwortet: Rolle + mentale Werte; Werte vorhanden, keine neuen Spielerdaten | Code (Abschnitt 1) |
| 4 B03-Kalibrierung | Regel bleibt (Grätsche von hinten mit Körperkontakt = Foul). Kontaktfenster (heute 250 ms, Prototyp 400 ms) und Pressingtempo (1,58×, Prototyp 1,45×) werden gespeicherte Parameter der neuen Partie und in SI-K kalibriert. Gate: `test-defensive-pursuit-v182.cjs` und B03-Szenen grün | Keine Regeländerung, nur Kalibrierung; Nutzerabnahme von B03 bleibt unabhängig offen |
| 5 Teleport sichtbar | beantwortet: kein Kaschieren | Nutzer |
| 6 Direkter Freistoß | Schützenbezug statt 65 %: direkter Schuss nur durch den besten Schützen auf dem Feld innerhalb `14+0,6·fin` m und bei freiem Winkel, Ergebnis über H2; sonst Flanke oder kurze Ausführung | Folgt aus „Torquote an Platzierung/Abschlussqualität koppeln“ und „Schussqualität erhöhen“ |
| 7 Entscheidungsprotokoll | Flüchtiger Ringpuffer (64 Einträge) für Tests und Fehlersuche, nie gespeichert und nie von Entscheidungen gelesen; Quellen als Plain-Daten im Ledger. Sichtbarer Spielberichtstext ist nicht Teil dieses Vorhabens | Keine UI-Änderung ohne Auftrag; das Ledger erlaubt sie später |
| 8 Reihenfolge | Fundament → parallele Welle 1 → großes Feld/Unity → Integration/Kalibrierung → P02 | Abschnitt 8 |
| 9 Schusslücke | Arbeitsannahme des Nutzers: 10–14 Schüsse, Tore ≤3 | Nutzer |
| 10 Großes Feld | Alle Radien in Metern, Mannschaftsform in Metern, Angebote aus dem tatsächlichen Mitspielerabstand; keine eigenen Konstanten je Feldgröße. Erst wenn die Abnahme (≥85 %) verfehlt wird, kommt ein aus der Geometrie abgeleiteter Faktor hinzu | Gemeinsame Uhr verlangt räumliche Lösung; Skalierung der Passfilter allein war zu schwach (Analyse 5.7) |
| neu: Dauerziel | Mittel ≈5,0 min innerhalb des Nutzerfensters 4–6 min | Mehr Ereignisse ohne Verhaltensänderung (H1) |
| neu: Spieler ohne mentale Werte | Lesender Rückfall 10 (neutral) für fehlende `calm`/`ant`/`dec`, nichts wird geschrieben | [Spielstände](development.md#spielstände-beim-neuen-weltmodell): keine Umrechnung, fehlende Werte gelten als nicht erfasst |

## 6. Architektur der parallelen Umsetzung

### 6.1 Module statt Streuänderungen

Die Engine erweitert sich seit Jahren durch Dateien, die globale Funktionen umhüllen (z. B. `v50Deflect=function…` in `world-ball-motion-v110.js:14`). Diesem Muster folgend erhält jedes Paket **ein eigenes neues Modul**. Darin übernimmt es seine Funktionen für markierte Partien per Umhüllung; für unmarkierte Partien ruft es die Basisfunktion auf. Nur Teilformeln *innerhalb* einer Funktion, die sich nicht umhüllen lassen, erhalten eine Weiche. Diese Weichen setzt SI-F vorab und gesammelt. Dadurch ändern parallele Pakete keine gemeinsamen langen Codezeilen. Ausnahmen sind die Zeitkonstanten (SI-0) und die Dateien, die ein Paket allein besitzt (8.3).

| Modul (neu, `dist/`) | Paket |
| --- | --- |
| `match-si-core-v183.js` | SI-F (Marker, Konfiguration, Uhr-Helfer, Persönlichkeit, Protokoll, Schnittstellen-Stubs) |
| `match-si-clock-v183.js` | SI-0 |
| `match-si-options-v183.js` | SI-1 |
| `match-si-offball-v183.js` | SI-2 |
| `match-si-finish-v183.js` | SI-3 |
| `match-si-defence-v183.js` | SI-4 |
| `match-si-setplay-v183.js` | SI-7 |
| `match-si-field-v183.js` | SI-5 |

SI-F trägt alle sieben Module auf einmal als leere Stubs in `dist/index.html` (daraus liest `work/server.cjs`), `work/build.cjs` und die eigene Skriptliste der nativen Testharness `work/native130-harness.cjs:20` (genutzt von `native182-scenes.cjs` und den Release-132-Gates) ein (development.md: „Der Build und der lokale Server müssen neue Skripte in ihrer Dateiliste führen“). Dadurch ändert danach kein Paket mehr Lade- oder Buildlisten. Die Ladereihenfolge bestimmt die Umhüllungskette und ist fest: core → clock → defence → finish → setplay → offball → options → field.

### 6.2 Marker, Konfiguration und Restore

- **Konstruktor:** `v65CreateMatch` (`world-physical-v65.js:52`) schreibt für neue Partien ein Plain-Objekt `match.si = {revision:183, clockRate, packages:{clock,options,offball,finish,defence,setplay,field}, params:{…}}`. Die Pakete lesen nur `v183Active(m,'finish')` usw. Jedes Modul meldet seine Parametervorgaben über `v183RegisterDefaults(pkg, {...})` an; der Konstruktor setzt sie bei Erzeugung zusammen und speichert sie. Pakete besitzen damit ihre Vorgaben, ohne den Konstruktor zu ändern. Die Messharness überschreibt `packages`/`params` über einen Konstruktorparameter. So sind Paket-Einzelmessungen ohne Kopien möglich, und die Kalibrierung ändert nur Vorgaben. Gespeicherte Partien behalten ihre Parameter, wie bei `compactBalance` v178.
- **Restore:** `v65Restore` (`world-physical-v65.js:103`) kopiert `match.si` unverändert und ergänzt es nie. Partien ohne `si` laufen mit den Regeln 182 bzw. älter. Neue Laufzustände (Absichten, Nachsetzen, Freistoßplan, Gegenpressing-Fenster) liegen als Plain-Daten in `attackFlow` und damit in `nativeContinuation`. Das Protokoll liegt in einer WeakMap und wird nicht gespeichert.
- **Zufall:** Jede Ziehung ist benannt und im Modul dokumentiert. Alte Pfade erhalten keine zusätzliche Ziehung; markerlose und 182-Partien bleiben byteidentisch.
- **Feste Grenzen:** B03-Regel bleibt; Fähigkeiten nur als Farbstufen (Protokoll und Ledger sind intern, keine Zahlen in UI-Texten); keine Spielstandmigration; Uhr gemeinsam für beide Feldgrößen.

### 6.3 Gemeinsame Schnittstellen (SI-F legt sie fest, Stubs liefern heutiges Verhalten)

| Schnittstelle | Eigentümer der Implementierung | Nutzer | Stub bis zur Integration |
| --- | --- | --- | --- |
| `v183Active(m,pkg)`, `v183Param(m,key)` | SI-F | alle | — |
| `v183Rate(m)`, `v183Seconds(m)`, `v183ClockUnits(m,seconds)` | SI-F (Formel), SI-0 (Nutzung) | alle Takte | `MATCH_SPEED` |
| `v183Personality(p) → {shootWeight, riskWeight, dribbleWeight, followWeight, holdWeight}` aus `tacticalRole` + `calm`/`ant`/`dec` (+`fin`/`pas`/`tec` nur als Bezug, nie als Bonus) | SI-F | SI-1, SI-2, SI-3 | neutrale 1,0 |
| `v183ShotEstimate(m,p,from) → {xg, aim, window, speed}` | SI-3 | SI-1 (Optionswert), SI-2 (Angebotswert) | `v157ShotQuality` |
| `v183CrossEstimate(m,p,target) → {arrival, headerXg}` | SI-7 | SI-1, SI-2 | heutige Flankenbedingung |
| `v183PassEstimate(m,p,q,target) → {arrival, value}` | SI-1 | SI-2 (Angebote), SI-7 | `v157Lane`-Score |
| `v183Offers(m)` (Angebote/Muster als `attackFlow.intents`) | SI-2 | SI-1 (liest Ziele) | `v159Offers` |
| `v183Trace(m,entry)`, `v183LedgerSource(event,tag)` | SI-F | alle | — |
| `v183Radius(m,metres)` | SI-F | SI-4, SI-5 | normalisierte Altwerte |
| `v183PaceFactor(m,p,purpose)` (Weiche in `v157Pace`, `world-offensive-quality-v157.js:42`) | SI-F (Weiche), Faktoren als Parameter: Ballführer SI-2, Pressing SI-4 | SI-2, SI-4 | 1,28 / 1,58 / 1,35 / 1,15 |
| `v183Clearance(m,defender,point,context) → {target, out}`; Auswertungsmodus `context.evaluate:true` = deterministische Mitte ohne Zufallsziehung | SI-4 | SI-7 (Luftduell), SI-3 (Block) | heutige Klärung (`pitch-v55.js:383-389`) |
| `v183ReboundFinish(m,winner,point)` (Weiche `world-ball-motion-v110.js:76`) | SI-2 | — | `v131OpenGoal` |
| `v183KeeperReach(m,keeper,range,contact,detail)` (Weiche `match-shot-choice-v159.js:9`, `pitch-v55.js:231` in `v131OpenGoal`, `:447` in `v115KeeperContact`) | SI-3 | SI-1 (über `v183ShotEstimate`) | Altwert der Stelle (`detail.reach`) |
| `v183AirFinish(m,winner,end,detail)` (Kopfball-/Volleyentscheidung `pitch-v55.js:391-392`); Klärzweig `:386-387` ruft `v183Clearance` | SI-7 (Entscheidung mit `v183ShotEstimate`) | — | heutige Regel |
| Parameter `finish.keeperHold` (Weiche `world-pitch-actions-v99.js:25` und `:35`) | SI-3 | — | 2,4 s |
| `v183RegisterDefaults(pkg, obj)` | SI-F | alle | — |

## 7. Pakete

Jedes Paket nennt Ziel, Messkriterien, Dateien/Funktionen, Marker-/Restore-Verhalten, Tests, Unity und zugeordnete Bugs. Gemeinsame Pflichtprüfungen stehen in Abschnitt 9.

Für alle Pakete gilt dasselbe Marker-Gating: Neue Logik wirkt nur, wenn `v183Active(m,'<paket>')` gilt, also bei `match.si.revision===183` mit gesetztem Paketschalter aus dem Konstruktor. Partien ohne `si` (unmarkiert oder 182) durchlaufen unverändert die Basisfunktion. Restore übernimmt `match.si` und die Plain-Daten des Pakets in `attackFlow` und ergänzt nichts (6.2).

### SI-F Fundament (seriell, vor allen anderen)

- **Ziel:** Marker 183, Konfiguration, Schnittstellen und Messwerkzeug, damit Welle 1 parallel arbeiten kann.
- **Inhalt:** `match.si` im Konstruktor samt `v183RegisterDefaults`; die Schnittstellen aus 6.3 mit Stubs; die Weichen für nicht umhüllbare Teilformeln (`v183PaceFactor` in `world-offensive-quality-v157.js:42`, Formationsanker in `game.js:59`; weitere nur auf Antrag eines Pakets vor dessen Start); die sieben leeren Module samt Lade-/Buildlisten; `v183Personality` (Formel und Tests, siehe unten); `decisionTrace`; Ledger-Quellen (H16); das Szenenwerkzeug `work/native183-scenes.cjs` nach dem Muster von `native182-scenes.cjs`; `work/check-old-matches-v183.cjs` (markerlose **und** 182-Partien byteidentisch gegen `e4e531c0`); native Messharness `work/measure-si183.cjs` ohne Kopien (aus `measure-si-r132.cjs`, `--packages=`/`--params=` statt Ersetzungen, Ports 4250–4269).
- **Persönlichkeit (Startformel, in SI-K kalibriert):** `shootWeight = rolle(Torjäger 1,25, Stoßstürmer 1,15, Dribbler/Flügel 1,0, Mittelfeld 0,9, Verteidiger 0,7) × (0,85 + 0,015·(calm−10) + 0,01·(dec−10))`; `riskWeight = rolle(Spielmacher 1,25, Box-to-Box/Flügel 1,1, Abräumer/Verteidiger 0,8) × (0,9 + 0,01·(dec−10))`. Ruhe dämpft nur Druckverluste (SI-3), Antizipation nur Lesefenster/Nachsetzen (SI-2), Entscheidungen nur das Bewertungsrauschen (SI-1). Rückfall 10 bei fehlenden Werten; es wird nichts geschrieben.
- **Messkriterien:** mit allen Paketen aus: Partien mit `si` und `packages` alle `false` digestgleich zu 182 (abgesehen vom Feld `si`); Altpartien byteidentisch; Restore-Rundlauf zustandsvollständig (Nutzerentscheidung B19: kein bitgleicher Verlauf gefordert).
- **Dateien:** `world-physical-v65.js:52` (Konstruktor, einzige Markerstelle), `:86/:103` nur lesend prüfen; `dist/index.html`, `work/build.cjs`, `work/native130-harness.cjs:20`; `match-ball-events-v117.js` (Ledger-Quellenfeld, additiv).
- **Unity:** keine.

### SI-0 Uhrvertrag und Stillstand

- **Ziel:** Eine Uhrrate je neuer Partie (`match.si.clockRate`), alle Takte und Mindestzeiten in Echtzeit, zügige Standards.
- **Inhalt:** Alle 68 `MATCH_SPEED`-Stellen in 19 Dateien werden eingeordnet. Echtzeit-Umrechnungen nutzen `v183Rate(m)`. Uhreinheiten-Takte (`.75` Annahme `pitch-v55.js:217`, `.55` freier Ball `set-pieces-v50.js:195`, `.7` Zweikampf `pitch-v56.js:24`, `.5` Torwart, Torwartabspiel `.75` `set-pieces-v50.js:210`) werden in Echtzeit überführt. Ebenso die Mindestflugzeiten (H13) und die Grätschendauer in der Projektion (`world-pitch3d-v98.js:44`). Freistoß/Abseits: Teleport ohne Gesperrte in der Wartezeit, Szene 2,2 s, Sperre 1,8 s (Prototyp `teleport`, `pitch-v57.js:48-49`, `player-ball-events-v111.js:17-23`). Anstoßaufstellung beginnt mit der Torszene (`set-pieces-v50.js:80-84`, `world-goal-scene-v83.js:3`). Halbzeitverlängerung und Nachspielzeit in Echtzeit-Deckeln (`set-pieces-v50.js:391-399`). Für das Belastungsmodell v158 werden Ereignisgewichte je virtueller Minute an die Rate gebunden (`world-player-load-v158.js:99-108, 125-143`), gespeichert in den `playerLoad.parameters` der neuen Partie.
- **Messkriterien:** Bei gleicher Rate wie 182 (0,78) liegen Entscheidungen und Ereignisse innerhalb der Rauschprobe (±0,12 Tore). Zwischen Rate 0,78 und 0,40 ändern sich die Ereignisse je Echtminute um weniger als 5 %. Freistoß ≤3,0 s, Anstoß nach Tor −2 s. Frische nach Abpfiff bei Kondition 10 und normaler Belastung 40 ± 5 (Produktreferenz). Dauerformel bestätigt (Echtzeit ≈ Uhrende/Rate + Stillstand).
- **Restore:** Rate gespeichert; Restore setzt nichts.
- **Tests:** neu `test-si-clock-v183.cjs` (Takt in Echtzeit bei zwei Raten, Teleport, Gesperrte, Anstoß, Restore während Freistoß); bestehend `test-v57.cjs`, `test-freekick-plan-r132.cjs`, `test-world-goal-scene-v83.cjs`, `test-whistle-offside-v119.cjs`, `test-player-load-candidate-v158.cjs`, `test-view-frame-scheduler-v130.cjs`.
- **Unity:** Prüfen, dass Teleportbilder als Neustart springen (`WorldViewPlayback.cs:16` „Restarts and seeks snap“). Je eine Partie mit Freistoß in der Unity-Parität aufzeichnen (`work/platform/qa/check-world-unity.cjs`).

### SI-1 Optionsmodell des Ballführers

- **Ziel:** eine Bewertungsfunktion statt der Reihenfolge W7: Schuss, Pass, Raumpass, Flanke, Dribbling/Tragen, Halten, jeweils mit Körperstellung.
- **Inhalt:** Zielbild 4.1. Schusswert aus `v183ShotEstimate`, Flankenwert aus `v183CrossEstimate`, Passwert aus Ankunftswahrscheinlichkeit (`pas`, `tec`, Linie, Gegnertempo) × Empfängerwert (Angebot und xG in 1 s). Persönlichkeitsgewichte (H4, Risikobereitschaft) und Bewertungsrauschen nach `dec` (H14). Spielstand/Restzeit gehen als Risikogewicht ein. Körperstellung ist Kostenterm jeder Option; Schuss/Pass aus der Drehung, wenn der Winkel reicht (H5). Takt 0,25 s Echtzeit. Die toten Bäume W1/W3 werden nur für neue Partien umgangen, der Code bleibt für alte Partien unverändert. Angriffsfokus/Direktspiel (heute im toten Baum) gehen als Gewichte in die Bewertung ein.
- **Messkriterien** (gegen SI-F-Basis mit SI-3-Stub und Uhr 0,42; Endwerte in SI-K): Schüsse +0,8 bis +1,5; Tore je Schuss ≥18 %; Fernschüsse 12–20 %, davon ≥75 % Abschluss ≥13; Raumpässe nicht über 7; Favoriten nicht unter der Referenz; Drehzustände bei 18–22 m −50 %; Rechenzeit je Entscheidung ≤0,3 ms in Node (Mobilbudget).
- **Dateien:** umhüllt `v157Decide` (`world-offensive-quality-v157.js:197-223`), `v159Decide` (`world-football-flow-v159.js:267-279`), `v157ContinueTurn` (`:159-171`); liest `v150TrySpacePass` (`world-space-passes-v150.js:37-50`), `v154TryDribble` (`world-player-roles-v154.js:76-88`).
- **Restore:** Entscheidungsabsicht (gewählte Option, Bindung, Ablauf) als Plain-Daten in `attackFlow.decision`.
- **Tests:** `test-si-options-v183.cjs` mit Szenen aus [Mentale Fähigkeiten](mentale-faehigkeiten-plan.md#längerfristige-absichten-und-situationsabhängiges-umplanen) (freier/zugestellter Passweg, Querpass, Abpraller, kein Wechsel zwischen fast gleichwertigen Zielen); gleiche Fähigkeit/andere Persönlichkeit und umgekehrt; `test-breakaway.cjs`, `test-v55.cjs`, `test-world-physical-instructions.cjs`.
- **Unity:** keine neuen Aktionsarten; Schuss aus der Drehung nutzt vorhandene Clips (B05-Passkontakte beobachten).

### SI-2 Freilaufen, Muster und Tempo

- **Ziel:** 4–5 bewegte Mitspieler, koordinierte Muster, Ballführer schneller als heute.
- **Inhalt:** Zielbild 4.2/4.3. Angebote für alle Mitspieler ohne Deckungsaufgabe, Boxbesetzung (naher Pfosten, Elfmeterpunkt, zweiter Pfosten) und Rückraum (H8). Doppelpass, Hinterlaufen, Flügel → Grundlinie, Konter (H10), Nachsetzen nach `ant` (H7). Zwei Tiefenläufer auch bei fünf Feldspielern. Ballführer-Tempo 1,6× nach `tec` (`v157Pace`, `world-offensive-quality-v157.js:34-42`) als Parameter. Die tote Laufplanung W2 (`world-attack-flow-v152.js:24-45`) wird für neue Partien umgangen.
- **Messkriterien:** Tore +0,2 bis +0,4 gegenüber SI-F-Basis; Abseits ≤0,5 je Partie; bewegte Mitspieler je Ballbesitz ≥4; Abprallergewinn der Angreifer nach Parade/Block ≥35 % (heute 25 %); Boxbesetzung bei breitem Ball ≥2 Spieler in 80 % der Flanken.
- **Dateien:** umhüllt `v159Offers` (`world-football-flow-v159.js:186-222`), `v162RecoverTarget` (`:18-35`), `v182LooseChasers` (`:57-71`) und `v154RoleTarget` (`world-player-roles-v154.js:89-125`), `v121RunnerTarget` (`world-backpedal-v108.js:58-68`, Abseitslimit lesend) sowie den Direktabschluss nach Abpraller (`world-ball-motion-v110.js:76`); Ballführertempo als Parameter über `v183PaceFactor` (`world-offensive-quality-v157.js:42`).
- **B02 (nativer Teil):** Geschwindigkeit, Beschleunigung, Bremsen und Richtungswechsel in acht Richtungen messen und mit dem neuen Tempo gemeinsam abnehmen (Bugliste B02). Keine bloße Wiedergabebeschleunigung. Clipwechsel gehören zu U-1.
- **Restore:** Muster und Angebote als `attackFlow.intents` (vorhandenes Format).
- **Tests:** `test-si-offball-v183.cjs` (Muster laufen ab und brechen bei Ballverlust ab, Abseitslegalität, keine Formationsauflösung), `test-duel-streaks.cjs`, `test-v56.cjs`, `test-loose-ball-v182.cjs`.
- **Unity:** höhere Laufgeschwindigkeiten → U-1.

### SI-3 Abschluss und Torwart

- **Ziel:** Torquote aus Platzierung (Nutzerentscheidung), sichtbare Schützen- und Torwartstärke, bessere Paraden.
- **Inhalt:** H2 mit den Lehren aus Abschnitt 3:
  - Nahbereichsstreuung fähigkeitssteil (Druck, Eile, Körperstellung, schwacher Fuß nicht modelliert), Eckwahl nach `dec` und eigener Streuung.
  - Höhe als zweite Dimension (Winkel oben schwerer erreichbar), Schusstempo nach `fin`/`tec`, Reichweite/Reaktion/Seitwärtstempo nach `gk` (Zielbild 4.5).
  - Paradenrichtung und Fang/Abklatschen aus Schusshärte, Höhe und `gk`; um den Pfosten ins Aus bei harten Eckschüssen (H6); weg vom Torwart, damit er nicht sofort nachfasst (H7).
  - Direkter Freistoß mit Schützenbezug (H12, mit Mauer), Torwartabspiel 1,6 s (H13).
  - Stellt `v183ShotEstimate` bereit (gleiche Formel wie die Ausführung, ohne Zufall).
- **Messkriterien** (gegen SI-F-Basis, Uhr 0,42): aufs Tor ≥38 %; Tore je Schuss ±2 Punkte zur Basis; Verhältnis Abschluss ≥14/<10 ≥1,8; Torwart ≥14 gegen 10–14 ≥10 Punkte Abstand; Paraden +0,4; Ecken aus Paraden +0,2; direkte Freistoßtore 8–12 % je Freistoßschuss; Fernschüsse Abschluss ≥14: 15–25 % Tore.
- **Dateien:** umhüllt `v55Shoot` (`pitch-v55.js:402-434`; heute Würfe `:417`/`:420`, Mittelregel `:423`, Unerreichbarkeit `:426`), `match-shot-choice-v159.js` (gesamt, 27 Zeilen), `v115ParryChance`/`v115KeeperContact` (`pitch-v55.js:446-447`), `v115KeeperDeflect` (`world-ball-motion-v110.js:21-25`), `v159KeeperTarget` (`world-football-flow-v159.js:280-292`), `v115KeeperTarget` (`world-backpedal-v108.js:70-100`), Ausführung des direkten Freistoßes in `v55Shoot` (`kind='direct-free-kick'`) einschließlich Mauer, Torwartabspiel (`world-pitch-actions-v99.js:25`). Die Wahl der Freistoßvariante (`v182FreeKickPlan`) gehört SI-7 und fragt `v183ShotEstimate`.
- **P03:** Die natürliche Torwartfolge Parade → Abpraller → Nachfassen wird hier messbar. Eine vollständige native Folge aufzeichnen (Bugliste P03).
- **Restore:** reine Funktionen; Parade-/Abpraller-Zustand liegt bereits in `rebound`/`nativeContinuation`.
- **Tests:** `test-si-finish-v183.cjs` (Ecke unerreichbar = Tor, Mitte erreichbar = Parade, gk-Abstufung, Höhenfehler, Ruhe unter Druck, kein Ball durch den Torwart), `test-keeper-hold-v182.cjs`, `test-keeper-picture-v119.cjs`, `test-3d-contacts-v119.cjs`, `test-penalty-quality-v182.cjs` (Elfmeter unverändert), `test-world-penalties-v65.cjs`.
- **Unity:** Paradenrichtung über vorhandene Keeper-Clips; Paritätsaufzeichnung einer Parade mit Abpraller.

### SI-4 Verteidigung, Radien und Fouls

- **Ziel:** Zielbild 4.4 mit B03 unverändert; Fouls nur bei Kontakt; neue Ecken- und Ballgewinnquellen.
- **Inhalt:**
  - Druck-/Foulradien in Metern (W4): SI-4 legt die Meterwerte als Parameter für `v183Radius` fest und stellt `set-pieces-v50.js:163` und `pitch-v55.js:192` um; `:328`, `:403` und `:494` stellen die Eigentümer der umhüllten Funktionen um (8.3).
  - Ein Kontaktweg (W5: `v182ContactCheck` `world-football-flow-v159.js:155-162`; `v56MaybeChallenge` `pitch-v56.js:80` nur noch über die Tickprüfung); kontaktlose Foulprobe aus (H11).
  - Zuteilung: Pressender, Absicherer, Deckung.
  - Gegenpressing (H9) über `v159DefensiveTarget` (`:311-361`); Flankenblock durch den nächsten Verteidiger am Flankengeber.
  - Klären ins Toraus unter Druck (H6) als Schnittstelle `v183Clearance`, die SI-7 im Luftduell und SI-3 beim Block aufrufen.
  - Kontaktfenster und Pressingtempo als Parameter (Abschnitt 5, Punkt 4; Pressingfaktor über `v183PaceFactor`).
- **Messkriterien:** Freistöße ≤4,5 je Partie; Fouls nur mit Kontaktereignis (100 %); Ecken aus Blocks/Klärungen +0,5; Ballgewinne im letzten Drittel +20 %; B03-Szenen unverändert grün; Großfeld-Fouls nicht über Standard.
- **Dateien:** `v159DefensiveTarget`, `v182ContactCheck`, `v182PressPoint` (`world-football-flow-v159.js:97-162, 311-361`), `v121PreparePositioning` (`world-backpedal-v108.js:8-43`), Foulprobe `action` (`set-pieces-v50.js:156-170`), Zweikampf `pitch-v56.js:22-80, 111-121`, Blockrichtung (`set-pieces-v50.js:215`); `v183Clearance` im eigenen Modul (Luftduell selbst gehört SI-7).
- **Tests:** `test-si-defence-v183.cjs`, `test-defensive-pursuit-v182.cjs`, `run-defensive-regression-v182.cjs`, `test-v56.cjs`, `test-penalty-frequency.cjs`, `test-duel-streaks.cjs`.
- **Unity:** Grätschen-/Foulposen unverändert; B05-Tacklewinkel weiter offen (U-1).

### SI-7 Flanken, Ecken und Kopfball (neu)

- **Ziel:** H3, H6 (Ausführung), H8 (Auslöser), H12 (Varianten), B10-Folgeball.
- **Inhalt:**
  - Luftball-Erreichbarkeit aus Ankunftszeit, Sprunghöhe (`air`, Körpergröße) und Anlauf statt 0,65 m (`v122ResolveAir`, `pitch-v55.js:367-370`).
  - Flankenfehler fähigkeitsabhängig nach dem Muster `v182CornerLanding` (`:313-323`) statt der Pauschalvarianten (`:330`).
  - Kopfball-/Volleyabschluss bei Ankunft im Abschlussbereich (`:391-392`) mit `v183ShotEstimate`.
  - Eckenvarianten mit Zielspieler nach Luftspiel (`v131CornerFormation`, `set-pieces-v50.js:89-101`), kurze Ecke und Rückraum.
  - Unerreichte hohe Ecken werden seltener; der Folgeball (`world-corner-ball-v109.js`) bleibt physisch (B10).
  - Freistoßvarianten Flanke/kurz (`v182FreeKickPlan`, nicht der Schussteil).
  - Stellt `v183CrossEstimate` bereit.
- **Messkriterien:** Flanken ≥2,0, angekommen ≥45 %, Kopfball-/Volleyschüsse ≥0,6 je Partie mit 18–28 % Toren; unerreichte hohe Ecken ≤6 % (heute ≈16 %); Schüsse ≤10 s nach Ecke ≥0,3 je Ecke; Luftspielstärke sichtbar (Kopfballduellsieg `air` ≥14 gegen <10 ≥15 Punkte).
- **Dateien:** `pitch-v55.js:313-400` (Flanke, Ecke, Luftduell; der Klärzweig ruft `v183Clearance` von SI-4), `set-pieces-v50.js:89-101` (Eckformation) und `:283-290` (Freistoßvarianten, direkter Schuss über `v183ShotEstimate`), `world-corner-ball-v109.js`.
- **Tests:** `test-si-setplay-v183.cjs`, `test-corner-quality-v182.cjs`, `measure-air-followups-v182.cjs`, `test-v57.cjs`.
- **Unity:** Kopfballclips vorhanden; Paritätsaufzeichnung von Flanke → Kopfball und Ecke → Kopfball.

### SI-5 Großes Feld und sechs Feldspieler (Welle 2)

- **Ziel:** großes Feld ≥85 % der Schüsse und Tore des Standardfelds bei gleicher Uhr.
- **Inhalt:** H15; gleichmäßige Rasterzellen für sechs Spieler (`v160SixFormations`, `world-match-v64.js:5, 137`; die KI-Formationswechsel `:276` bleiben). Angebotsraster und Laufvorlauf aus dem tatsächlichen Mitspielerabstand; Linienabstand/Blockbreite in Metern (`v55PrepareMovement` `pitch-v55.js:72`, `v121PreparePositioning` Linienbasis).
- **Messkriterien:** je Feldgröße 192 Partien; Zeit in der 22-m-Zone groß ≥2,7 s je Team; Favoriten groß ≥60 %; Standardfeld unverändert innerhalb der Rauschprobe.
- **Dateien:** besitzt `world-match-v64.js:5-12, 137`; umhüllt `v55PrepareMovement` (`pitch-v55.js:72`); Formationsanker aus `game.js:59` über die SI-F-Weiche; Parameter der SI-2-Angebote.
- **Abhängigkeit:** nach Merge von SI-2 und SI-4, weil es deren Läufer-, Angebots- und Positionierungsparameter skaliert.
- **UI:** Formationsanzeige zeigt die neuen Zellen nur für neue Partien; Taktikansicht prüfen (`test-tactics-roster-v130.cjs`).

### SI-6 P02: kompakte Simulation an das ausgespielte Spiel (nach SI-K)

- **Ziel:** Analyse 7.1; Kennzahlen aus der Abnahmereihe SI-K übernehmen.
- **Inhalt:** neue `compactBalance`-Kennung (z. B. `shotBalanceRevision:183`) nur in `v155Initialize` neuer Partien. Schussquellen (Spielzug, Standard, Flanke/Kopfball, Abpraller, Ecke), aufs Tor, Tor je Schuss aufs Tor mit `gk`-Hebel, Favoritenquote je Stärkeabstand, Tor- und Assistverteilung nach Rolle, Fouls/Ecken/Flanken für Statistik, Belastungsprofil v158 (`v158CompactRun/Contact`, `world-player-load-v158.js:188-213`).
- **Dateien:** `world-player-performance-v155.js:4, 91-121`, `world-match-v64.js:285-313`, `world-player-load-v158.js:188-213`.
- **Messkriterien:** je Stärkeabstand und Feldgröße Abweichung zur physischen Abnahmereihe ≤10 % bei Schüssen/Toren, ≤5 Punkte bei Favoritenquote; 1.700-Fixture-Matrix wie v178; Remis schwacher Teams gegen physisch ±5 Punkte.
- **Tests:** `test-compact-balance-v178.cjs` (alte Kennung eingefroren), neu `test-compact-balance-v183.cjs`, `validate-compact-balance-v178.cjs`-Muster, `audit-world-balance-v68.cjs`, `DOPPEL_SEASONS=10`-Läufe aus dem Workflow.

### Begleitpakete

| Paket | Inhalt | Lage |
| --- | --- | --- |
| **B19 Restore-Vollständigkeit** | Nutzerentscheidung 14. Oktober 2026: Fortsetzen am letzten sicheren Speicherpunkt bleibt, kein Zu-Ende-Simulieren; bitgleicher Gesamtverlauf (3.540 gegen 3.676 Ticks) ist nicht mehr gefordert. Stattdessen Zustandsvollständigkeit nachweisen und eine Prüfung bereitstellen, die SI-Pakete für ihren eigenen Zustand nutzen; Eigentümer `v65Snapshot`/`v65Restore` (`world-physical-v65.js:86-103+`) und `nativeContinuation` | Welle 0 parallel zu SI-F; Abnahme: Restore an fünf Zeitpunkten erhält Spielstand, Uhr, Marker, Absichten/Laufziele und `match.si`-Zustand vollständig, Fortsetzung läuft fehlerfrei zu Ende; abweichender Verlauf zulässig |
| **B20 Altchecks** | Die fünf roten Altprüfungen einzeln einordnen (Produkt- oder Testursache), ohne sie pauschal abzuschwächen; besonders `check-free-ball-positioning-v124`, `check-match-additions-v148`, `test-goal-replay-v103`, weil SI-0/SI-3 diese Bereiche berühren | Welle 0, nur `work/`-Dateien; Ergebnis: grün oder begründet ausgewiesen, als Regressionsschutz für Welle 1 verfügbar |
| **U-1 Unity-Bewegung (B02/B05)** | Clipwechsel und Laufzyklen für Ballführer 1,6×, Grundlinienläufe, Nachsetzen; Tacklewinkel und Passkontakte (B05-Messfehler ausdrücklich erhalten); Teleport-Neustart; nur `prototypes/match-engine-unity/` und Darstellungsprojektion in `dist/world-unity-v151.js` | Welle 2 nach SI-2/SI-4; Unity-Kopie `G:/unity/Doppel6-Fix-R132` (Digestfalle beim Sync beachten), Offline-C#-/Shaderprüfung; neuer WebGL-Build nur bei Bedarf |

## 8. Abhängigkeiten, Wellen und Dateibesitz

### 8.1 Abhängigkeitsgraph

```
Welle 0   SI-F Fundament ──────────────┬────────────  B19 Restore   B20 Altchecks
                                       ▼
Welle 1   SI-0  SI-4  SI-3  SI-7  SI-2  SI-1          (parallel, gegen SI-F-Stubs)
          Merge: SI-0 → SI-4 → SI-3 → SI-7 → SI-2 → SI-1
                                       ▼
Welle 2   SI-5 Großes Feld (nach SI-2, SI-4)   U-1 Unity (nach SI-2, SI-4)
                                       ▼
Welle 3   SI-K Integration und Kalibrierung (alle Pakete, B19)
                                       ▼
Welle 4   SI-6 P02 (Endwerte aus SI-K)
```

| Fachliche Abhängigkeit | über | Übergang bis zum Merge |
| --- | --- | --- |
| SI-1 nutzt den Schusswert von SI-3 | `v183ShotEstimate` | Stub `v157ShotQuality` |
| SI-1 nutzt den Flankenwert von SI-7 | `v183CrossEstimate` | heutige Flankenbedingung |
| SI-1 liest die Angebote von SI-2 | `v183Offers`/`attackFlow.intents` | `v159Offers` |
| SI-2 und SI-7 nutzen den Passwert von SI-1 | `v183PassEstimate` | `v157Lane`-Score; nach SI-1-Merge Nachmessung in SI-K |
| SI-7 und SI-3 nutzen die Klärung von SI-4 | `v183Clearance` | heutige Klärung |
| SI-2 und SI-4 teilen die Tempozeile | `v183PaceFactor` (Weiche SI-F) | heutige Faktoren |
| alle Pakete nutzen die Echtzeit | `v183Seconds`/`v183ClockUnits` | `MATCH_SPEED`, ab SI-0-Merge echt |
| Restore-Gates der Welle 1 | B19 | Zustandsvollständigkeit statt „bitgleich“ (Nutzerentscheidung); Prüfwerkzeug aus B19 nutzen, sobald gemergt |

SI-1 entwickelt gegen die Stubs aus SI-F und wird **nach** SI-3, SI-7 und SI-2 gemergt, weil es deren Schätzungen konsumiert. Kalibrierte Gewichte entstehen erst in SI-K.

### 8.2 Wellen

| Welle | Pakete (parallel) | Dauer (Richtwert) | Abschluss |
| --- | --- | --- | --- |
| 0 | SI-F (seriell kritisch); B19, B20 parallel | 1–1,5 Tage | SI-F gemergt in `integration/si-r133`; B19/B20 Befund |
| 1 | SI-0, SI-3, SI-7, SI-4, SI-2, SI-1 | 3–4 Tage | jedes Paket: Paketkriterien gegen SI-F-Basis, Pflichtprüfungen, Review |
| 2 | SI-5, U-1 | 2 Tage | Großfeldkriterien, Unity-Parität |
| 3 | SI-K Integration und Kalibrierung | 2–3 Tage | Abnahmereihe (Abschnitt 10) |
| 4 | SI-6 P02 | 2 Tage | Kompaktmatrix |

### 8.3 Dateibesitz-Matrix

Kürzel:
- O = Eigentümer; darf die Altdatei an dieser Stelle markergebunden ändern.
- U = übernimmt die Funktion für markierte Partien per Umhüllung bzw. über die SI-F-Weiche im eigenen Modul; ändert die Altdatei nicht.
- R = nur lesen.

Je Funktion gibt es höchstens einen U-Eigentümer. Neue Logik liegt immer im eigenen Modul aus 6.1.

| Datei / Funktion | SI-F | SI-0 | SI-1 | SI-2 | SI-3 | SI-4 | SI-7 | SI-5 | B19 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `world-physical-v65.js:52` Konstruktor | O | R | R | R | R | R | R | R | R |
| `world-physical-v65.js:86-110` Snapshot/Restore | R | R | — | — | — | — | — | — | O |
| `world-physical-v65.js:433-437` Schleife, `game.js:6` `MATCH_SPEED` | R | O | — | — | — | — | — | — | — |
| `game.js:79-87` step/fly/Laufziele | O (Weichen) | O (Takte) | — | — | — | — | — | U (Anker `:59`) | — |
| `dist/index.html`, `work/build.cjs`, `work/native130-harness.cjs:20` | O | — | — | — | — | — | — | — | — |
| `world-offensive-quality-v157.js:197-223` `v157Decide`, `:159-171` Drehung | R | O (Takte `:157, 167, 222`) | U | — | — | — | — | — | — |
| `world-offensive-quality-v157.js:42` Tempofaktoren | O (Weiche `v183PaceFactor`) | — | — | R (Parameter) | — | R (Parameter) | — | — | — |
| `world-offensive-quality-v157.js:48-73` `v157Move` | — | O (Takte) | — | R | — | — | — | — | — |
| `world-offensive-quality-v157.js:172-177` Schussqualität | — | — | R | — | U (`v183ShotEstimate`) | — | — | — | — |
| `world-football-flow-v159.js:186-222` `v159Offers`, `:18-35` Recover | — | O (Takte) | R | U | — | — | — | R (Parameter) | — |
| `world-football-flow-v159.js:267-279` `v159Decide` | — | O (Takte) | U | — | — | — | — | — | — |
| `world-football-flow-v159.js:97-162, 311-361` Verteidigung | — | O (Takte) | — | — | — | U | — | R | — |
| `world-football-flow-v159.js:280-292` Keeperziel | — | — | — | — | U | — | — | — | — |
| `world-football-flow-v159.js:40-71` freie Bälle (B12) | — | O (Takte) | — | U (`v182LooseChasers`, Nachsetzen) | R | — | — | — | — |
| `pitch-v55.js:402-434` `v55Shoot`, `:446-447` Parade (Reichweite `:447` über `v183KeeperReach`) | O (Weiche `:447`) | O (Takte) | — | — | U | — | — | — | — |
| `pitch-v55.js:225-235` `v131OpenGoal` (Reichweite `:231` über `v183KeeperReach`), `match-shot-choice-v159.js:9` | O (Weichen) | — | R | R (`v183ReboundFinish`) | U (`v183KeeperReach`, `v131OpenGoal`) | — | — | — | — |
| `pitch-v55.js:313-400` Flanke/Ecke/Luftduell (Weichen `:386-392`: `v183Clearance`, `v183AirFinish`) | O (Weichen) | O (Takte) | — | — | — | R (`v183Clearance`) | U | — | — |
| `pitch-v55.js:188-221` Bodenpass | — | O (Takt `:217`) | R | — | — | O (Druckradius `:192`) | — | — | — |
| `pitch-v55.js:72` `v55PrepareMovement` | — | — | — | — | — | — | — | U | — |
| `match-shot-choice-v159.js` | — | — | R | — | O | — | — | — | — |
| `set-pieces-v50.js:156-170` Foulprobe | — | — | — | — | — | U | — | — | — |
| `set-pieces-v50.js:80-84, 105-110, 178-210, 391-442` Restart, Wartezeiten, Takte | — | O | — | — | — | — | — | — | — |
| `set-pieces-v50.js:89-101` Eckformation, `:283-290` Freistoßplan | — | — | — | — | R (Schätzung) | — | U | — | — |
| `set-pieces-v50.js:213-225` Block-Abpraller | — | O (Flugzeit `:221`) | — | — | — | O (Richtung `:215`) | — | — | — |
| `pitch-v57.js:16-51`, `player-ball-events-v111.js:17-23` | — | O | — | — | — | — | — | — | — |
| `world-ball-motion-v110.js:21-25` Parade | — | O (Flugzeit `:25`) | — | — | U | — | — | — | — |
| `world-ball-motion-v110.js:40-80` freie Bälle, Direktabschluss `:76` | O (Weiche `:76`) | O (Zeiten) | — | U (Direktabschluss über `v183ReboundFinish`) | — | — | — | — | — |
| `world-pitch-actions-v99.js:25, 35` Torwart-Haltezeit | O (Weiche) | — (lässt diese Zeilen aus) | — | — | U (Parameter `finish.keeperHold`) | — | — | — | — |
| `world-space-passes-v150.js`, `world-player-roles-v154.js` | — | O (Takte) | R (Passoption) | U (Laufziele) | — | — | — | — | — |
| `world-backpedal-v108.js:8-43` Positionierung | — | O (Takte) | — | — | — | U | — | R | — |
| `world-backpedal-v108.js:58-68` Läufer | — | — | — | U | — | — | — | R | — |
| `world-backpedal-v108.js:70-100` Torwart | — | — | — | — | U | — | — | — | — |
| `world-match-v64.js:5-12, 137` Geometrie, Formationen | — | — | — | — | — | — | — | O | — |
| `world-player-load-v158.js:99-143` Belastung | — | O | — | — | — | — | — | — | — |
| `match-ball-events-v117.js` Ledger | O (Quellenfeld) | — | — | — | — | — | — | — | — |
| `world-pitch3d-v98.js:44` | — | O | — | — | — | — | — | — | — |

Außerhalb der Matrix gilt:
- U-1 besitzt `prototypes/match-engine-unity/` und die Darstellungsprojektion in `world-unity-v151.js`.
- SI-6 besitzt `world-player-performance-v155.js`, den Kompaktteil von `world-match-v64.js:285-313` und `world-player-load-v158.js:188-213`.
- B20 ändert nur `work/`.

**SI-0 ist der einzige Querschnittseigentümer.** Er ändert in den Altpfaden nur Zeitkonstanten in Ausdrücken, keine Logik. Umhüllungen der anderen Pakete verwenden für markierte Partien von Anfang an `v183Seconds`/`v183ClockUnits`.

**Druckradien in umhüllten Funktionen** stellen die jeweiligen Eigentümer mit den SI-4-Parametern über `v183Radius` um: `pitch-v55.js:328` SI-7, `:403` SI-3, `:494` SI-1.

**Merge und Konflikte:** SI-0 wird zuerst gemergt; danach rebasen alle Welle-1-Pakete, Konflikte löst das spätere Paket. Braucht ein Paket eine fremde Konstante, wird sie als Parameter über `v183RegisterDefaults` geführt und nicht in der fremden Datei geändert.

### 8.4 Branches, Worktrees, Messlanen

- Integrationsbranch `integration/si-r133` in `work/si-integration`, vom veröffentlichten R132-Stand `e4e531c0` plus Doku-Merge von `analysis/p01-r132`.
- Paketbranches von `integration/si-r133` nach SI-F-Merge: `feat/si-clock` (`work/si-clock`), `feat/si-options` (`work/si-options`), `feat/si-offball` (`work/si-offball`), `feat/si-finish` (`work/si-finish`), `feat/si-defence` (`work/si-defence`), `feat/si-setplay` (`work/si-setplay`), danach `feat/si-field` (`work/si-field`), `feat/si-unity` (`work/si-unity`), `feat/si-compact` (`work/si-compact`); `fix/si-b19` (`work/si-restore`), `fix/si-b20` (`work/si-legacy-checks`). `feat/si-foundation` (`work/si-foundation`) zuerst.
- **Messlanen:** höchstens 3 Lanes × 6 Seiten gleichzeitig (Ports 4250–4269). Lane A gehört SI-0/SI-3, Lane B SI-7/SI-4, Lane C SI-2/SI-1. Während der Entwicklung reichen 48-Partien-Rauchserien; 192-Partien-Serien gibt es zum Paketabschluss über eine Warteschlange in `outputs/si183/queue.log`. Keine Messung ohne `dist`-Hashprüfung.
- Kein Push, kein Merge auf `main`; Veröffentlichung (Release 133, Fußversion, Unity-Metadaten, Live-Abnahme) ist ein eigener späterer Auftrag.

### 8.5 Merge-Reihenfolge

1. SI-F → `integration/si-r133`
2. B20 (nur `work/`), B19 (Restore)
3. SI-0 (Takte zuerst, weil alle Pakete die Echtzeitbasis messen)
4. SI-4 → SI-3 → SI-7 (Physik und Ausführung vor den Entscheidern)
5. SI-2 → SI-1 (Entscheider zuletzt, rebased auf die echten Schätzungen)
6. SI-5 → U-1
7. SI-K-Kalibrierung (nur `match.si.params`-Vorgaben im Konstruktor und Moduldefaults)
8. SI-6

Nach jedem Merge laufen die Pflichtprüfungen (Abschnitt 9) und eine gepaarte 192-Partien-Serie gegen den vorigen Integrationsstand. Fällt eine Kennzahl außerhalb der Rauschprobe (±0,12 Tore, ±8 Punkte Favoriten), wird vor dem nächsten Merge geklärt.

### 8.6 Integrationsstand Welle 1 (15. Oktober 2026)

`integration/si-r133` enthält SI-F, B20, B19, SI-0, SI-3, SI-4, SI-7, SI-2 und SI-1. Die Merges von SI-4, SI-7, SI-2 und SI-1 liefen konfliktfrei. Nach jedem dieser Merges waren grün: die SI-Tests, `check-old-matches-v183` (340 Szenen), `check-old-matches-v182` gegen R132 `e4e531c0` (158 Szenen) und `check-restore-completeness-v183 --quick`. Eine einzige Testanpassung war nötig: Die Tempo-Prüfung in `test-si-defence-v183` schaltet SI-2 jetzt ab, weil SI-2 das Ballführertempo besitzt.

Statt einer Serie je Merge lief eine gepaarte Gesamtserie, weil jedes Paket bereits eigene Serien hatte: `int-w1-base` (nur Uhr) gegen `int-w1-all` (alle Pakete). Beide mit Uhr 0,42, 96 Vereine × 2 Feldgrößen, `work/measure-si-offball-v183.cjs`, ohne Ausfälle.

| Kennzahl (Mittel beider Feldgrößen) | nur Uhr | alle Pakete | Ziel (2.3) |
| --- | ---: | ---: | --- |
| Dauer | 4,23 min | 4,17 min | 4,8–5,2 (Uhrrate in SI-K) |
| Schüsse / aufs Tor | 6,8 / 34 % | 12,1 / 48 % | 12–16 / ≥38 % ✓ |
| Tore / je Schuss | 1,64 / 24 % | 2,81 / 23 % | 3–5 / 25–32 % ✗ (seit Torziel 15. Oktober) |
| 0:0 | 22 % | 15 % | ≤6 % ✗ |
| Favoriten ≥1 Punkt (N 134) | 50 % | 68 % | ≥62 % ✓ |
| Tordifferenz je Stärkepunkt | 0,25 | 0,75 | ≥0,35 ✓ |
| Flanken / Ecken | 0,36 / 0,21 | 1,35 / 1,36 | ≥2,0 ✗ / ≥1,2 ✓ |
| angekommene Flanken (Messhülle) | 16 % | 3 % | ≥45 % ✗ (Messdefinition prüfen) |
| Fouls / Freistöße | 7,5 / 7,8 | 2,6 / 2,7 | ≤4,5 ✓ |
| Abprallerschüsse | 0,05 | 0,22 | ≥0,3 ✗ |
| Großes Feld: Schüsse / Tore vom Standardfeld | 73 % / 67 % | 73 % / 78 % | ≥85 % ✗ → SI-5 |

Offene Punkte für SI-5 und SI-K:

- Das große Feld liegt mit 10,2 Schüssen und 2,46 Toren gegen 14,0 und 3,16 auf dem Standardfeld unter der Zielgrenze. Das ist Aufgabe von SI-5.
- Torziel 15. Oktober 2026 (3–5 Tore): Das Standardfeld liegt mit 3,16 Toren am unteren Rand, das große Feld mit 2,46 darunter. SI-K hebt die Tore über Torquote je Schuss (a) und Schussmenge (b), ohne die breite Streuung zu verlieren (4:3 soll vorkommen).
- Die Zahl der Raumpässe sinkt von 7,9 auf 0,6; zu klären ist, ob das an der Absichtszählung von SI-1 liegt oder echt ist.
- Bei angekommenen Flanken liegt die Messhülle bei 3 %, die SI-7-Szenen bei 36 %. Die Definition muss vor SI-K abgeglichen werden.
- Ballführertempo wird im Spiel gedeckelt. In echten Partien erreicht der Ballführer höchstens etwa 7,1 m/s, auf beiden Feldgrößen, obwohl `v157Pace` mit SI-2/SI-5 bis 8,5 m/s liefert. Ursache ist die Bremswegbegrenzung in `world-offensive-quality-v157.js:64` (`Math.sqrt(2*brake*(d-.05))+follow`) bei einem Laufziel etwa 2 m voraus (U-1-Review vom 15. Oktober). SI-K klärt, wo das Laufziel des Ballführers gesetzt wird. Erst danach werden `carrierPace` und die SI-5-Gains bewertet.
- SI-5-Abnahme ohne Reserve: Das große Feld erreicht 88 % der Schüsse und 89 % der Tore des Standardfelds. Abnahmereihe A prüft das Verhältnis ausdrücklich; Reserve ist `field.windowGain` 14–15.

## 9. Tests

**Pflicht für jedes Paket vor Merge** (aus `.github/workflows/deploy.yml` „Spieltests ausführen“, matchrelevanter Ausschnitt): `test-v55.cjs`, `test-v56.cjs`, `test-v57.cjs`, `test-breakaway.cjs`, `test-duel-streaks.cjs`, `run-native130-tests.cjs`, `test-world-match-v64.cjs`, `test-world-penalties-v65.cjs`, `test-world-goal-scene-v83.cjs`, `test-world-physical-instructions.cjs`, `test-compact-balance-v178.cjs`, `test-player-load-candidate-v158.cjs`, `test-native-career-v160.cjs`, `test-native-performance-context.cjs`, `platform/qa/test-unity-integration-v160.cjs`, `platform/qa/test-world-unity-contract.cjs`, `test-world-pitch3d-v98.cjs`, `test-3d-contacts-v119.cjs`, `test-whistle-offside-v119.cjs`, `test-keeper-picture-v119.cjs`, `platform/qa/test-world-unity-slides.cjs`; dazu die Release-132-Gates `test-corner-quality-v182.cjs`, `test-defensive-pursuit-v182.cjs`, `test-freekick-plan-r132.cjs`, `test-keeper-hold-v182.cjs`, `test-loose-ball-v182.cjs`, `test-penalty-quality-v182.cjs`, `test-review-fixes-v182.cjs`, `check-old-matches-v182.cjs`; neu `check-old-matches-v183.cjs` und `node work/build.cjs`.

**Vor dem Integrationsabschluss:** der vollständige Workflow-Block „Spieltests ausführen“ (alle Befehle in `deploy.yml`), Build, `run-full-matches-v182.cjs`-Muster als `run-full-matches-v183.cjs`, ein vollständiger Browser-Match (development.md: Spiellogikänderungen), Speichern/Laden einer laufenden neuen Partie an fünf Zeitpunkten.

**Neue Prüfungen je Paket:** `test-si-<paket>-v183.cjs` mit Szenen aus `native183-scenes.cjs`. Jeder Test prüft den alten Pfad (Marker fehlt → bitgleich) und den neuen Pfad; Restore während der neuen Absicht erhält die gespeicherte Absicht vollständig und setzt sie fort (B19: Zustandsvollständigkeit, kein bitgleicher Verlauf gefordert).

## 10. Integration und Kalibrierung (SI-K), danach P02

1. **Abnahmereihe A (nach Merge 1–6):** 576 Partien = 96 Vereine × 2 Feldgrößen × 3 Seedsätze (`p01r132`, `si183b`, `si183c`); Favoritenstreuung ±4,5 Punkte. Native Harness ohne Kopien, `dist`-Hash vor/nach. Kennzahlen aus 2.3 je Feldgröße, Schussquellen, Fähigkeitsabstufung (Abschluss, Torwart, Luftspiel), Persönlichkeitseffekte (gleiche Fähigkeit, andere Rolle/mentale Werte), Belastung v158 (Frische nach Abpfiff), Rechenzeit je Tick.
2. **Kalibrierungsrunde:** höchstens drei Iterationen mit je 192 gepaarten Partien. Feste Reihenfolge: (a) Platzierungsstreuung und Torwartreichweite (Tore je Schuss, Fähigkeitsverhältnis), (b) Persönlichkeitsgewichte (Schussmenge, Fernschussanteil, Favoriten), (c) Flankenerreichbarkeit (Kopfballschüsse), (d) Kontaktfenster/Pressingtempo (Fouls, Freistöße), (e) **zuletzt die Uhrrate** auf 4,8–5,2 min. Alle Werte stehen in `match.si.params`-Vorgaben; es gibt keine Konstanten in den Modulen.
3. **Abnahmereihe B:** Wiederholung von A mit den Endwerten. Zusätzlich 10 Browserpartien mit Unity-Ansicht für die echte Wanduhr (all-inclusive, ohne Taktikpausen), getrennt von Node-Zeit, sowie `check-old-matches-v183.cjs`. Mobile Geräte bleiben P06 (Android ausgeklammert).
4. **SI-6:** übernimmt die Kennzahlen aus Reihe B je Stärkeabstand und Feldgröße (Analyse 7.1).

**Stand SI-K (16. Oktober 2026, `feat/si-calibration`):** Reihen A und B, drei Iterationen, Endwerte und offene Punkte in der [SI-K-Doku](spielerintelligenz-sik-calibration-183.md). Maßgeblich ist Reihe B2 (Uhr 0,385): 5,02 min all-inclusive einschließlich Torwiederholungen, 14,2 Schüsse, 3,84 Tore, Favorit gewinnt 78 %. Spielflanken übernimmt das Zusatzpaket „Flanke in den Raum“ (B22); der Fernschussanteil gilt nur für das Standardfeld (Entscheidungen 16. Oktober 2026).

## 11. Modelle und Reviews

Nutzerentscheidung 14. Oktober 2026: Claude arbeitet primär (Claude-Max-Plan 20x aktiv). Umsetzung und Reviews laufen mit Claude-Modellen; Review immer durch ein anderes Modell als die Umsetzung. Codex (GPT-6.1-Sol) bleibt nur Ausweichweg, falls ein Claude-Nutzungslimit eine Welle blockiert.

| Paket | Umsetzung | Review (anderes Modell) | Begründung |
| --- | --- | --- | --- |
| SI-F Fundament | Claude Opus 5.5 | Claude Fable 5.1 | Querschnitt aus Schnittstellen, Marker, Harness und Restore-Regeln |
| B19 Restore-Vollständigkeit | Claude Sonnet 5.5 | Claude Opus 5.5 | systematischer Zustandsabgleich mit wenigen Läufen |
| B20 Altchecks | Claude Sonnet 5.5 | Claude Fable 5.1 | abgegrenzte Einzelanalysen, kein Produktcode ohne Befund |
| SI-0 Uhr/Stillstand | Claude Sonnet 5.5 | Claude Opus 5.5 | viele Stellen mechanisch, aber fehleranfällig; Review prüft jede Einordnung |
| SI-1 Optionsmodell | Claude Opus 5.5 | Claude Fable 5.1 | schwierigstes Design mit starker Kalibrierkopplung |
| SI-2 Freilaufen/Muster/Tempo | Claude Fable 5.1 | Claude Opus 5.5 | Fable kennt Analyse und Prototypen; B02-Bezug |
| SI-3 Abschluss/Torwart | Claude Opus 5.5 | Claude Fable 5.1 | geometrisch-numerisches Modell; Review gegen Nutzerentscheidung Platzierung |
| SI-4 Verteidigung | Claude Sonnet 5.5 | Claude Opus 5.5 | klar begrenzter Umbau; Review mit B03-Kenntnis |
| SI-7 Flanken/Ecken/Kopfball | Claude Fable 5.1 | Claude Sonnet 5.5 | baut auf dem B10-Muster auf |
| SI-5 Großes Feld | Claude Sonnet 5.5 | Claude Opus 5.5 | Geometrie- und Formationsarbeit nach festen Kriterien |
| U-1 Unity (B02/B05) | Claude Opus 5.5 | Claude Sonnet 5.5 | Animation ausdrücklich durch Opus (Nutzerwunsch Release 132) |
| SI-K Integration/Kalibrierung | Claude Opus 5.5 | Claude Fable 5.1 | paketübergreifende Abwägung, Messreihen, Endwerte |
| SI-6 P02 | Claude Sonnet 5.5 | Claude Opus 5.5 | statistische Angleichung nach festen Zielwerten |

Review-Runden je Paket: (1) Entwurfsreview der Moduldatei, der Umhüllungen und Weichen vor der ersten Messung; (2) Abschlussreview mit Messbericht, Prüfbelegen und Diff gegen `integration/si-r133`. Jede Runde ist ein eigener Auftrag mit Originalauftrag, früheren Befunden und offenen Einwänden.

## 12. Aufwand und Risiken

**Aufwand (Agenten-Arbeitstage, Richtwerte):** SI-F 1–1,5; B19 0,5–1; B20 1; SI-0 1,5–2; SI-1 3–4; SI-2 3; SI-3 2–3; SI-4 2; SI-7 2–3; SI-5 1,5–2; U-1 2–3; SI-K 2–3; SI-6 2. Summe ≈ 24–30 Agententage. Messrechenzeit: ≈10 min je 192-Partien-Serie und Lane, Abnahmereihe A/B je ≈1 h auf drei Lanes.

**Kalenderdauer neu berechnet (14. Oktober 2026, Claude primär, Max-Plan 20x):** Die Agententage sind eine Arbeitsmenge, keine Wanduhrzeit. Release 132 hat sieben parallele Pakete samt Reviews in rund 1–1,5 Tagen Wanduhrzeit geschafft, gebremst vor allem durch Claude-Nutzungslimits. Mit 20x entfällt diese Bremse weitgehend; Engpässe sind dann die drei Messlanen, die seriellen Merges mit je einer 192-Partien-Serie und die Kalibrierrunden. Richtwerte bei Durchlauf rund um die Uhr: Welle 0 ≈ 0,5 Tag; Welle 1 ≈ 1,5–2 Tage (sechs Pakete teilen drei Lanes, danach sechs serielle Merges à ≈ 30–45 min); Welle 2 ≈ 0,5–1 Tag (Unity langsamer); Welle 3 ≈ 0,5–1 Tag (2–4 Kalibrierrunden à ≈ 1 h Messung); Welle 4 ≈ 0,5 Tag. Summe ≈ **4–6 Kalendertage** bis zum abnahmefähigen Integrationsstand, zuzüglich Nutzerabnahme und Veröffentlichung. Nicht eingerechnet: Wartezeit auf Nutzerentscheidungen, Wochenlimit des Max-Plans, Zusatzrunden, falls die Kalibrierung die Ziele verfehlt.

| Risiko | Wirkung | Gegenmaßnahme |
| --- | --- | --- |
| Textkonflikte in langen minifizierten Zeilen | Mergeaufwand, versteckte Regressionen | Module je Paket, Umhüllung statt Zeilenänderung, Weichen gesammelt durch SI-F, Dateibesitz 8.3 |
| Kalibrierkopplung (Platzierung ↔ Optionswahl ↔ Uhr) | Pakete verfehlen ihre Zielwerte einzeln, erreichen sie aber gemeinsam (oder umgekehrt) | Paketkriterien als Richtung gegen SI-F-Basis; Endwerte nur in SI-K; Parameter in `match.si.params` |
| Favoritenquote verrauscht (±8 Punkte bei 134 Partien) | Fehlentscheidungen zwischen Varianten | Abnahme mit 576 Partien, Tordifferenz je Stärkepunkt als zweite Größe |
| Restore-Zustand unvollständig | Neue Absichten gehen nach Fortsetzen verloren | B19-Vollständigkeitsprüfung in Welle 0; jedes Paket weist seinen Zustand darin nach |
| Mobile Rechenzeit des Optionsmodells | Ruckeln auf Geräten | Budget je Entscheidung, Takt 0,25 s, Angebote verteilt; Messung in SI-K, Geräte bleiben P06 |
| Belastungsmodell v158 bei langsamer Uhr | Frische weicht von den Produktreferenzen ab | SI-0-Kriterium Frische 40 ± 5 |
| Unity-Clips bei höherem Tempo (B02/B05) | sichtbar steife oder rutschende Bewegungen | U-1 nach SI-2; Messfehler ausdrücklich erhalten |
| Platzierungsmodell nivelliert schwache Schützen | Favoriten sinken (gemessen 59 %) | Verhältniskriterium 1,8, steile Nahstreuung, `dec`-Eckwahl |
| Mehr Ecken/Tore verlängern den Stillstand | Dauer über 6 min | Uhrrate zuletzt kalibrieren, H11/H13 senken den Stillstand |

## 13. Reproduktion der Nachmessung

```powershell
$node='C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
& $node work/patch-si-harness.cjs     # erzeugt work/measure-si-r132.cjs inkl. si-place/si-follow/si-place-follow/si-max36-norisk
& $node work/measure-si-r132.cjs --variant=si-place --clubs=96 --workers=6 --port=4265
& $node work/measure-si-r132.cjs --variant=si-follow --clubs=96 --workers=6 --port=4266
& $node work/measure-si-r132.cjs --variant=si-place-follow --clubs=96 --workers=6 --port=4267
& $node work/measure-si-r132.cjs --variant=si-max36-norisk --clubs=96 --workers=6 --port=4268
& $node work/table-si-r132.cjs si-max42-norisk si-place si-follow si-place-follow si-max36-norisk
& $node work/table-si-r132.cjs --size=large si-max42-norisk si-place si-follow si-place-follow si-max36-norisk
```

Rohdaten liegen unter `outputs/si-r132/` (gitignoriert). Gepaarte Differenzen gegen `si-max42-norisk`, Verwertung nach Abschluss/Torwart, Abpraller und Flanken stammen aus Ad-hoc-Auswertungen der gespeicherten `rec.shots`/`rec.phases`/`extras` je Partie, gepaart über Verein und Feldgröße.
