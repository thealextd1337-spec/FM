# Spielerintelligenz-Analyse: Denk- und Priorisierungsprozess der nativen Matchsimulation

Stand: 14. Oktober 2026. Reine Analyse auf dem veröffentlichten Release-132-Stand (`e4e531c0`) mit den Nutzerzielen vom 14. Oktober ([Entscheidungen](entscheidungen.md), Zeile „P01-Ziele“). Worktree `work/p01-analysis`, Branch `analysis/p01-r132`. Keine Produktänderung: `dist/` ist unverändert (Hashprüfung in jedem Messlauf). Prototypen ändern ausschließlich Kopien einzelner Dateien im Arbeitsspeicher des Messbrowsers. Android, Unity-Darstellung und Geräte-Wandzeit sind ausgeklammert.

Bezug: [P01-Analyse](p01-analyse-2026-10-14.md) (Messbasis, Ursachen, erste Prototypen), [Bugliste P01/P02/B02/B05](Bugliste.md), [Produktregeln](product.md), [Release 132](release-132.md), [kompakte Abstimmung v178](kompakte-matchabstimmung-v178.md).

Zeilenangaben beziehen sich auf `dist/` in `e4e531c0`. Alle Metriken sind Szenenmeter (`v122Metres`, `v150Scale`), sofern nicht „normalisiert“ steht (Feldkoordinaten 0–1).

## 1. Zusammenfassung

**Kernbefunde.**

1. **Es gibt keine Priorisierung, sondern eine Reihenfolge.** Der Ballführer prüft Optionen in einer festen Kaskade über fünf Dateien (Foul → Zweikampf → Tragen → Drehung → freies Tor → Querpass → Schuss → hoher Ball → Vorwärtspass → Raumpass → Dribbling → Durchbruch → Notpass → Flanke → Weitertragen). Die erste Option, die ihre eigenen Schwellen erfüllt, gewinnt. Nutzen und Risiko werden nie gegeneinander abgewogen; ein mittelmäßiger Vorwärtspass schlägt eine gute Flanke, ein Trageweg schlägt einen Schuss aus 15 m.
2. **Die Optionen sehen nur den aktuellen Tick.** Schussqualität (`v157ShotQuality`) ist ein Geometriefilter mit harter 22-m-Grenze ohne Fähigkeitsfenster; Passwert ist „Raumgewinn minus Länge“; Dribbling existiert nur für die Rolle „Dribbler“ bei exakt einem Gegner. Antizipation (wo wird der Raum in einer Sekunde sein), Teamkoordination (Doppelpass, Hinterlaufen, Boxbesetzung) und Persönlichkeit (Risikofreude eines Spielmachers, Schussfreude eines Torjägers) sind nicht modelliert; Rollen wirken nur über Laufziele.
3. **Freilaufen ist auf drei Spieler begrenzt.** `v159Offers` plant je Ballbesitz einen (Standardfeld) oder zwei (großes Feld) Tiefenläufer und einen Unterstützer; alle übrigen Mitspieler „erholen“ sich in ihre Formationszone. Mit fünf Feldspielern laufen damit zwei bis drei Spieler überhaupt nicht an.
4. **Vier Überlagerungen entscheiden doppelt oder sind tot.** `v152PrepareAttack` plant Läufe, die `v159Offers` sofort überschreibt; `action` in `pitch-v55.js` enthält hinter `v157Decide` einen kompletten zweiten Entscheidungsbaum, der für neue Partien nie erreicht wird; Zweikämpfe werden pro Tick (`v182ContactCheck`) und pro Entscheidung (`v56MaybeChallenge`) ausgelöst; Druck wird teils in Metern, teils in normalisierten Einheiten gemessen und skaliert damit mit der Feldgröße.
5. **Dauer und Dynamik hängen an versteckten Einheiten.** Entscheidungstakte stehen teils in Uhreinheiten (`.75`, `.55`), teils in Echtzeit (`.24*MATCH_SPEED`); Freistöße dauern nicht wegen der Formation, sondern weil die zwei foulgesperrten Spieler 2,7 s stehen und danach ihre Laufzeit in die Wartezeit eingeht (gemessen 8,7 s je Freistoß).
6. **Großes Feld:** Formationsanker, Abwehrlinie, Druck- und Foulradien sind normalisiert (skalieren um 20 %), Pass-, Lauf- und Schussreichweiten stehen in Metern. Deshalb sind Mitspieler weiter weg als die Passoptionen reichen, die Zone wird seltener erreicht (3,05 statt 4,05 Schüsse) und Druck wirkt stärker. Ein zweiter Tiefenläufer gibt es nur dort.

**Zielbild in Kürze (Abschnitt 4).** Ein einheitliches Bewertungsmodell je Ballführer-Option (Schuss-xG, Passwert mit Risiko und Empfängerfreiheit, Dribbling-/Tragewert) mit Rollen- und Persönlichkeitsgewichten; ein Freilaufmodell für alle Mitspieler mit Boxbesetzung und koordinierten Mustern; ein Torwartmodell mit echter Fähigkeitswirkung; Standards mit Teleport und fester Wartezeit; ein Uhrvertrag je Partie in Echtzeit; Marker-gebunden für neue Partien, deterministisch und restore-fähig, mit Entscheidungsprotokoll für Erklärbarkeit.

**Beste gemessene Kombination.** Siehe Abschnitt 5.3 (wird aus der Messreihe `outputs/si-r132/` ergänzt).

## 2. Architekturkarte

### 2.1 Schleife, Wrapper-Kette und Takt

Die Simulation ist ein Basismodul (`game.js`) plus 20 Dateien, die dessen globale Funktionen (`step`, `action`, `fly`, `kickoff`, `shoot`, `ability`, `v50Restart`, `v50LooseBall`, …) nacheinander umhüllen. Die Ladereihenfolge aus `dist/index.html` bestimmt die Aufrufreihenfolge (außen nach innen):

| Funktion | Kette (außen → innen) | Bemerkung |
| --- | --- | --- |
| `step` | `pitch-motion-v102.js:74` (Kontaktuhr) → `world-pitch-actions-v99.js:239` (Aktionssperren altern) → `world-goal-scene-v83.js:58` (Torszene) → `pitch-v57.js:53` (Freistoßformation) → `pitch-v56.js:111` (P02-Beginn, Grätsche, danach Kontaktprüfung und Trennung) → `pitch-v55.js:76` (Einwurf, `v55PrepareMovement`) → `set-pieces-v50.js:417` (Banner, Torpause, Standards, danach freie Bälle) → `game.js:79` (Uhr, Laufziele, Bewegung, Flug, `action`) | Nur `game.js:79` zählt die Uhr hoch; alle Standards/Banner laufen in Echtzeit ohne Uhr |
| `action` | `pitch-v56.js:80` (Zweikampf) → `set-pieces-v50.js:160` (Foulprobe, normalisierter Radius .135) → `pitch-v55.js:491` (`v157Decide`, dahinter alter Baum) → `game.js:89` (tot) | Wird nur aufgerufen, wenn `m.elapsed>=m.next` (`game.js:86`) |
| `fly` | `match-ball-events-v117.js:51` (Ledger) → `world-corner-ball-v109.js:13` → `pitch-motion-v102.js:47` (Flugmeta) → `world-pitch-actions-v99.js:202` (Schuss-/Torwartmeta) → `player-ball-events-v111.js:4` → `game.js:87` | Fünf Hüllen für einen Ballflug; `v115FlightDuration` setzt Mindestflugzeit nach Ballart (16/20/27 m/s, `pitch-v55.js:444`) |
| `ability` | `world-physical-v65.js:470` (P02 `v158Ability`, sonst Frische/Ermüdung) → `set-pieces-v50.js:39` (Aggressivität) → `strength-v55.js:80` (Alter, Form, Frische, Ermüdung, Positionsfremd) → `game.js:62` (tot) | In P02-Welten liefert `v158Ability` den Wert, die Fallbacks werden nie erreicht |
| Laufziele | in `game.js:85` je Spieler: Basisziel → `v115KeeperTarget` → `v113DefenderTarget` → `v121RunnerTarget` → `v152AttackTarget` → `v154RoleTarget` → `v157Target` (ruft `v159CarrierTarget`, `v182LooseTarget`, `v159DefensiveTarget`, Intent oder `v162RecoverTarget`) → Abfangziel → `v150RunTarget` → Sperren → `v123DribbleTarget` (tot) → `v157Move` | Jeder spätere Schritt überschreibt `p.tx/p.ty`; die tatsächliche Autorität liegt bei `v157Target`, der Rest ist Vorbelegung |

**Takt.** Entscheidungen des Ballführers laufen nur bei `m.elapsed>=m.next`. Die Wartezeiten mischen Einheiten: Uhreinheiten (`m.next=m.elapsed+.75` nach Passannahme `pitch-v55.js:217`, `.55` nach freiem Ball `set-pieces-v50.js:195`, `.7` nach Zweikampfgewinn `pitch-v56.js:24`, `.5` Torwart wartet) und Echtzeit (`.24*MATCH_SPEED` Tragen `world-football-flow-v159.js:275`, `.28*MATCH_SPEED` Weitertragen `world-offensive-quality-v157.js:222`, `.04*MATCH_SPEED` Drehung `:157/:167`, `2.4*MATCH_SPEED` Torwartball `world-pitch-actions-v99.js:25`). Bei `MATCH_SPEED=.78` sind .75 Uhreinheiten 0,96 s; bei einer Uhrrate .45 wären es 1,67 s. Eine langsamere Uhr verlangsamt also unbeabsichtigt die Entscheidungen nach Annahme, Zweikampf und freiem Ball. Das Annahme-Fenster (`v159ReceivePlan`, `world-football-flow-v159.js:234`) liegt mit 0,14–0,48 s Echtzeit richtig.

### 2.2 Ballführer: Schuss, Pass, Dribbling, Halten

Reihenfolge für Feldspieler in neuen Partien (alle Kennungen aus `v65CreateMatch`, `world-physical-v65.js:52`):

1. **Zweikampf gegen ihn** (`pitch-v56.js:66-78`): stehender Gegner seitlich/vorn in 0,95 m Ballnähe (`info.ball<30.4` Pixel ≙ 0,95 m) → `v56StandingTackle`; Foul mit `v50FoulChance·0,8` (`:22`), Gewinn `clamp(.18+(tak−tec)·.022+(pos−spd)·.006+Aggr·.04, .08,.55)` (`:23`). Sonst Grätsche mit 18 % (von hinten 9 %, bei Mitlaufen ×0,35) (`:75`).
2. **Foulprobe** (`set-pieces-v50.js:160-170`): nächster Gegner in normalisiert .135 (5,9 m Standard, 7,1 m groß) foult mit `.045+Pressing·.01+Aggr·.025+(tak−tec)·.003` (`:158`), gedeckelt .015–.13 — pro Entscheidung, unabhängig von Kontakt.
3. **`v157Decide`** (`world-offensive-quality-v157.js:197-223`):
   1. `v159Decide` (`world-football-flow-v159.js:267-279`): Annahme abwarten; **Stürmer 12–30 m tragen** Richtung Tormitte, wenn ein 5-m-Korridor frei ist (kein Gegner <1,8 m, Linie <1,7 m) und kein Mitspieler 6 m näher mit +0,25 Schussqualität steht. Dauer 0,34 s, Entscheidung in 0,24 s.
   2. Laufende Drehung (`v157ContinueTurn`, `:159-171`): Pass erst bei ≤0,30 rad Abweichung und ≤1,2 m/s; davor alle 0,04 s erneut.
   3. Freies Tor (`v131OpenGoal`, `pitch-v55.js:225-236`): Fenster ≤22 m, Torwartabstand >1,5 m über Reichweite → Schuss.
   4. **Passoptionen** (`:203-206`): alle nicht abseitsstehenden Mitspieler; Ziel = Laufvorlauf (`v157PassLead`, Geschwindigkeit × Flugzeit); `score = gain·.11 − distance·.028 + quality·.9 + Rücklauf·.65`; Filter: 3–20 m (25 m bei „Direkt“), Linie frei mit 1,4 m Abstand und kein Gegner <1,8 m am Ziel (`v157Lane`, `:149-151`).
   5. **Querpass**, wenn ein Empfänger +0,22 Schussqualität und 2 m näher am Tor hat (`:207-208`).
   6. **Schuss** (`:210`): `shot>0` und (≤14 m sicher, sonst Zufall < max(`v145ShotChance`, shot·0,65)). `v157ShotQuality` (`:172-177`): 0 bei >22 m, seitlich > Tiefe·0,85+1 m oder einem Feldspieler <1,4 m neben der Linie zur Tormitte; sonst `(22−d)/12 · (.55+(fin+tec)/80)`. `v145ShotChance` (`pitch-v55.js:482-489`): ≤14 m .75, 20 m .24, 25 m .10, 30 m .03; × 1,5 bei „Abschluss suchen“ (Torjäger/Stoßstürmer), × 0,3 bei verstellter Linie.
   7. Hoher Ball über eine Mittelfeldsperre (`v162TryHighPass`, `:178-196`): nur ≥22 m vom Tor, 14–32 m lang, ≥9 m Gewinn, 4 s Sperre.
   8. **Vorwärtspass**: erste Option mit Rücklauf oder `gain≥3 && score>.05` (`:212-213`).
   9. **Raumpass** (`v150TrySpacePass`, `world-space-passes-v150.js:37-43`): bestes Raumziel (Abschnitt 2.3) mit Chance `clamp(.08+pas·.012+pos·.005+Direkt·.10+Tiefenlauf·.10, .12,.58)`; davor Mindestscore .14.
   10. **Dribbling** (`v154TryDribble`, `world-player-roles-v154.js:76-88`): nur Rolle Dribbler, genau ein Gegner 2,3–6 m vor ihm, kein nützlicher Pass → 4 m schräg vor, 0,32 s.
   11. Durchbruch (`v55HasClearRun`, `pitch-v55.js:472-479`): kein Gegner <2,3 m und keiner 0–9 m vor ihm in 2,1 m Breite → `breakawayCarrier`, 0,24 s.
   12. Notpass auf die beste Option, wenn ein Gegner <3,5 m (`:218`).
   13. **Flanke** (`:220`): <26 m, ≥9 m seitlich, Mitspieler <16 m vor dem Tor, Chance `.55·(.65+.65·q)`.
   14. Weitertragen 0,28 s (`:222`) — Laufziel aus `game.js:85`: leicht zur Mitte, 0,1 normalisiert nach vorn.

**Zufall und Fähigkeit.** Die Optionen 1–5, 7, 8, 10, 11 sind deterministisch aus Geometrie; Zufall entscheidet nur bei Schuss (6), Raumpass (9), Flanke (13) und beim Zweikampf. Fähigkeiten wirken auf Schwellen (Schussqualität, Raumpasschance), stark aber erst in der Ausführung: Passstreuung `clamp((20−pas)·.003+Druck·.015,.005,.1)` normalisiert, längenskaliert (`v157PassError`, `:141-148`); Abfangchance `.11+pos·.016+spd·.004−pas·.011` (`pitch-v55.js:205`); Annahmefehler `.015+(20−tec)·.006+Druck·(.025+(20−tec)·.002)` (`:276`).

**Hinter `v157Decide` liegt ein zweiter, toter Baum** (`pitch-v55.js:497-515`): freies Tor, `v115BetterSquare`, Raumpass/`v152ForwardPass` ab 18 m, Durchbruch-Finish (10–13 m), Flanke ab 66 % Feldtiefe, `v145ShotChance`, Dribbling, `v55ChooseTarget` mit „Direkt“/„Fokus Außen/Mitte“. Die Teamtaktik **Angriffsfokus** wirkt nur in diesem toten Baum und im Raumpass-Score (`world-space-passes-v150.js:31`); „Direktes Spiel“ wirkt nur über die 25-m-Passgrenze und den Raumpasszuschlag.

### 2.3 Passwahl und -ausführung

| Passart | Entscheidung | Ausführung | Befund |
| --- | --- | --- | --- |
| Bodenpass | Abschnitt 2.2 (4, 8, 12) | `v55GroundPass` (`pitch-v55.js:188-221`): Vorlauf, Streuung, Abfangkandidat (Gegner erreicht Linie in Flugzeit·t, `:204`), Chance `.05–.55`; Empfänger muss <0,8 m am Endpunkt sein, sonst freier Ball (`:215`); Abseits beim Abspiel (`:216`); Direktabnahme (`v127TryOneTouch`, `:250-259`) | Risiko kommt ausschließlich aus Geometrie; ein Spielmacher wählt nicht anders als ein Verteidiger. Rückpässe sind nie bewertet (kein Gewinnmalus, kein Sicherheitsbonus) |
| Raumpass v150 | 9 Rasterziele je Läufer (4/7/10 m Tiefe, ±3 m), 8–32 m, Läufer vor dem Ball (`world-space-passes-v150.js:9-36`); Score `gain·.035 + margin·.65 − Verspätung·.65 − range·.012 + Tiefenlauf·.22 + Direkt·.12 + Fokus` | Streuung `.18+(20−q)·.095+Druck·(20−tec)·.025` m, Dosierung ±(.3+(20−pas)·.12)·range/15 (`:49-50`); 2 Verfolger je Team (`:94-118`) | Gute Idee, aber Unterstützer (Spielmacher, Zielspieler, Abräumer) sind als Läufer ausgeschlossen (`:12`), Marge ≥0,10 s und Chance ≤58 % machen ihn selten (P01: 0 bis wenige je Partie) |
| Hoher Ball | nur über Sperre ab 22 m (`:178-196`) oder Torwart >23 m (`v123KeeperOutlet`) | `v55HighPass` (`pitch-v55.js:324-340`): <7 m → Bodenpass; Fehler `(20−pas)·.007+Druck·.024` normalisiert; **Flankenvarianten**: 19 % zu kurz, 19 % zu weit, 12 % ins Aus (`:330`); Luftduell `v122ResolveAir` (`:367-400`): Kopfball ≤ `8+air·.28` m, Volley, Weiterleitung, Annahme | Eine Flanke verfehlt in 50 % der Fälle ihr Ziel per Pauschalvariante, unabhängig von Passspiel; die Ecke hat seit B10 eine eigene Fehlerlogik (`v182CornerLanding`, `:313-323`), die Flanke nicht |
| Rückpass/Kombination | `combination` nach Pass (`v157AfterPass`, `:121-125`): Passgeber erhält Anschlusslauf (`v159Follow`, `world-football-flow-v159.js:177-185`), Rücklauf +0,65 Score nach bestätigtem Kontakt | — | Doppelpass entsteht nur zufällig: der Anschlusslauf zielt 6,5 m vor, 2,5–4 m seitlich; es gibt keinen Plan „Pass–Lauf–Rückpass“ |

### 2.4 Laufwege ohne Ball

- **Angebote** (`v159Offers`, `world-football-flow-v159.js:186-222`): alle 1,05 s (bis zu 1,35 s) je Ballführer: 1 Tiefenläufer bei <5 Mitspielern (Standardfeld), sonst 2 (`:207`); Kandidaten sortiert nach Tiefenlauf-Anweisung, Angriffsreihe, Ausrichtung; Zielpunkte 6,5–8 m + pos·0,07 vor dem Ballführer, ±3,5/7 m seitlich; Score = freier Raum − Laufweg·.15 − Überlappung + Linie frei 1,2 − Zonenabstand>10 m·.12. Ein Unterstützer (Rolle Spielmacher/Zielspieler/Abräumer oder Mittelfeld) 5,5 m seitlich, 2 m hinter dem Ball (`:214-219`). Alle übrigen: `v162RecoverTarget` (`:18-35`) in die Formationszone mit 28 % Ballverschiebung.
- **Tote Planung** (`v152PrepareAttack`, `world-attack-flow-v152.js:24-45`): wird nach `v159Offers` (immer `true`) nie erreicht.
- **Läufer-Grenzen** (`v121RunnerTarget`, `world-backpedal-v108.js:58-68`): Vorlauf nach Anweisung (Unterstützen −4 m, Tiefe 6–8 m, Angriff 4–6 m + Ausrichtung) und **Abseitslimit** aus `v121PreparePositioning` (`:38`): vorhergesagte Linie plus Sicherheitsmarge `v115OffsideMargin` (`pitch-v55.js:448`, 1,5–3,2 % mit Zeitschwingung). Konterspieler bleiben an der gegnerischen Linie (`:42`).
- **Rollen** (`v154RoleTarget`, `world-player-roles-v154.js:89-125`): Flügel an der Seitenlinie (3 m), Zielspieler 3 m seitlich/5 m vor dem Ball, Abräumer 8 m hinter, ballspielender Verteidiger 6 m seitlich; defensiv Stopper/Stoßstürmer/Torjäger/Abräumer mit Deckungs- oder Pressingziel. Koordination über `positionRoutine`-Blend (`:121-124`).
- **Anweisungen** sind nur noch Rollenabbildungen (`v154RoleIntent`, `:44-48`): Flügel = Außenbahn, Spielmacher/Zielspieler/Abräumer = Anspielbar, Torjäger/Stoßstürmer/Box-to-Box/Dribbler = Tiefenlauf, Torjäger/Stoßstürmer = Abschluss suchen. Cover-Defender, Stopper, ballspielender Verteidiger und Linientormann tragen keine Angriffsabsicht.
- **Formationsanker**: `team()` (`game.js:59`) legt `bx,by` normalisiert aus dem 5×7-Raster, `v55PrepareMovement` (`pitch-v55.js:72`) setzt Verteidiger auf die Abwehrlinie (`v55DefenderY` .63/.75/.87 normalisiert) und schiebt Mitspieler des Ballbesitzers vor die Abseitslinie.

### 2.5 Verteidigung

- **Planung** (`v121PreparePositioning`, `world-backpedal-v108.js:8-43`): Abwehrlinie je Team aus Basis (.21/.31/.41 normalisiert = 15/22/30 m vor dem eigenen Tor) und Ballhöhe; bei Ball <0,23 Tiefe folgt die Linie dem Ball mit 3,3 m Abstand (`:20`). Nächster Verteidiger deckt den Ballführer, weitere decken Läufer mit Antizipation `.12+pos·.01` s (`:27-35`).
- **Lesen und Zuteilung** (`v159DefensiveTarget`, `world-football-flow-v159.js:311-361`): je Spieler ein Lesefenster `clamp(.34−(pos−1)·.01+Reaktionsverlust, .12,.45)` s; Zwecke: `press` (nächster bereiter Spieler ≤6 m zum Ball bzw. B03-Verfolgung), `ball` (Flug: zwei nächste zum Ballpunkt), `incoming-receiver`, `receiver` (nächster Passempfänger in 13 m), sonst Zone; Formationsleine 12 m (Abwehr) / 16 m (`:358`), bei Pressing/Durchbruch aufgehoben.
- **B03-Verfolgung** (`:97-162`): Richtungswechsel ≥20° werden nach `clamp(.3−(pos−1)·.01, .1,.32)` s erkannt; Pressingpunkt seitlich/vor dem Ball auf der Torlinie (`v182PressPoint`), Verfolger halten das Tempo (`v182Follow`); Kontaktprüfung je Tick mit 250 ms Sperre (`v182ContactCheck`, `:155-162`); Grätsche von hinten bei Körperkontakt immer Foul (`pitch-v56.js:53`).
- **Tempo**: Pressender/zum Ball laufender Spieler 1,58×, Unterstützer 1,35×, sonst 1,15× Grundtempo; Ballführer 1,28×(.78+tec·.009) ≈ 1,1× (`world-offensive-quality-v157.js:42`).
- **Zweikampfwege doppelt**: `v182ContactCheck` nach jeder Bewegung (`pitch-v56.js:121`) und `v56MaybeChallenge` bei jeder Ballführer-Entscheidung (`:80`), beide über `v182ChallengeAttempt` auf einen Versuch je Kontaktuhr-Tick begrenzt. Zusätzlich die Foulprobe in `set-pieces-v50.js:160` ohne Kontakt.

### 2.6 Torwart

- **Positionierung**: Basis auf der Linie mit 30 % Ballverschiebung (`game.js:85`); `v159KeeperTarget` (`world-football-flow-v159.js:280-292`) auf der Ball-Tor-Linie 1,4–2,7 m vor dem Tor, außer bei ungedecktem Durchbruch <13 m; dann `v115KeeperTarget` (`world-backpedal-v108.js:70-94`): Herauslaufen bis 15 m, Zugriff bei <1,45+q·.65 m mit `.48+gk·.025−tec·.013` (`:100`). Mitspielender Tormann (`v154KeeperDepthTarget`) fängt lange Bälle vor dem Strafraum ab.
- **Schuss** (`v55Shoot`, `pitch-v55.js:402-434`): aufs Tor `clamp((.36+fin·.019+tec·.004−Druck·.004)·e^(−(d−16)/45), .08,.82)` **und** Zielpunkt im Rahmen (`v159WithinMouth`, Streuung `.018+(1−q)·.13+Druck·.012+(d−16)·.001`); Tor `clamp((.13+fin·.022+tec·.004−gk·.011−Druck·.002)·e^(−(d−12)/13), .003,.62)`; **unerreichbarer Schuss aufs Tor = Tor** (`:426`), Reichweite `0,8 m + max(0, Flugzeit−Reaktion)·(2,6+spd·.065)` mit Reaktion `.28−gk·.005` (`match-shot-choice-v159.js:9`). Parade statt Fangen `clamp(.30+(20−gk)·.013+fin·.007+(d<12)·.12, .30,.72)` (`pitch-v55.js:446`).
- **Abspiel**: kurz auf einen freien Verteidiger ≤23 m, sonst hoch (`v123KeeperOutlet`, `:490`); Haltezeit 2,4 s Echtzeit (`world-pitch-actions-v99.js:25`).
- Befund (P01 2.7): Torwartspiel +4 ändert Gegentore nicht; die Reichweitenformel hängt kaum von `gk` ab, und die automatische Torwertung umgeht ihn.

### 2.7 Standards

- Wartezeiten in `v50Restart` (`set-pieces-v50.js:110`): Freistoß 1,8 s, Ecke 2 s, Elfmeter 2,5 s (Welt: 4 s, `world-pitch-actions-v99.js:48`), Abseits 4,1 s; Freistoß danach 0,25 s Ausblenden + 0,5 s (`:440-441`), Ecke/Einwurf 1 s Banner (`:442`).
- **Freistoßformation** (`v57PositionFreeKick`, `pitch-v57.js:16-51`): alle laufen mit `3+spd·.14` m/s (`v55Approach`, `pitch-v55.js:73`) in Zielpunkte (Angriff 0,16, Mittelfeld 0,015, Abwehr −0,24 normalisiert zur Ausführung); `piece.wait = max(wait, Restlaufzeit+.15)` (`:49`). Foulopfer und Täter sind 2,7 s gesperrt (`v113FoulLocked`, `player-ball-events-v111.js:19`), die Szene hält mindestens 3,8 s (`:17`). **Weil die Gesperrten in die Restlaufzeit eingehen, dauert jeder Freistoß ≥ 2,7 s + Laufzeit der beiden Gesperrten.** Gemessen: 8,45 s je Freistoß in der Basis; Teleport der übrigen Spieler allein ändert nichts (4,6 s im Rauchtest), erst ohne die Gesperrten in der Wartezeit sinkt er auf 2,84 s (Abschnitt 5).
- Freistoßplan (`v182FreeKickPlan`, `set-pieces-v50.js:283-290`): 65 % direkt, wenn <0,38 Feldtiefe und zentral (x .18–.82), unabhängig von Schützenfähigkeit und Entfernung (P01: 41 % aller Schüsse, Distanz 24 m, 8 % Tor).
- Ecken (`v131CornerFormation`, `:89-101`): vier Varianten (nah/mitte/fern/kurz) mit Zielspieler nach Luftspiel; Ausführung B10.
- Einwurf: Uhr läuft mit 18 % (`pitch-v55.js:74`), Laufen in Position.
- Anstoß nach Tor: Torszene 4,05 s (`world-goal-scene-v83.js:3`) + 1 s + Laufen mit 6 m/s in Aufstellung (`v114RememberRestart`, `set-pieces-v50.js:80-84`) + Banner 1,65 s.

### 2.8 Freie Bälle und Abpraller (B12)

- `v50LooseBall` (`set-pieces-v50.js:172-180`): Ball frei mit 0,16 Uhreinheiten Sperre; `world-ball-motion-v110.js:41-63` gibt ihm die Ankunftsgeschwindigkeit (max. 18 m/s), Flughöhe und Aufprall (Restitution 0,42, Bodendämpfung 0,82); Rollen mit Dämpfung 2,3/s (`:70`).
- Jäger (`v182LooseChasers`, `world-football-flow-v159.js:57-71`): je Team der früheste Ankömmling (Abfangpunkt über 3 s, `v182Intercept`) plus ein Absicherer torseitig; Wechsel nur bei ≥0,4 s Vorteil; Tempo 1,58×.
- Aufnahme bei <0,8 m (`v50ChaseLooseBall`, `:194`); Torwart sichert im Strafraum per Hand; nach Aufnahme Direktabschluss, wenn freies Tor (`world-ball-motion-v110.js:76-78`).
- **Quellen**: Block (`v55Shoot:413-415`, Chance `.09+tak·.012`), Parade (`parry` 30–72 %, sonst Fangen), Annahmefehler, verfehlte Pässe, Kopfballklärungen. Abprall-Richtung nach Block: `endY = y + vorwärts·(Zufall−.3)·.3` normalisiert (`set-pieces-v50.js:215`) → 30 % hinter die Grundlinie (Ecke), 70 % ins Feld; Torwartabwehr 28 % ins Aus (`world-ball-motion-v110.js:23`). Gemessen (P01): 0,03 Abprallerschüsse, 0,11 Ecken je Partie — weil es nur 1,1 Schüsse aufs Tor und 0,2 Paraden gibt.

### 2.9 Tempo und Beschleunigung (v157Pace/Move)

- `v157Move` (`world-offensive-quality-v157.js:48-73`): Körper mit Masse (52–108 kg), Drehrate `(3.5+tec·.055)·1.32/√m/(1+v·.055)` rad/s, Beschleunigung `(6.2+spd·.08)·1.40/m`, Bremsen `10.5·1.25/m`; Zielgeschwindigkeit `min(Pace·Faktor, √(2·Bremse·(d−.05)) + Mitlaufen)`; Vorwärtsläufer folgen der Körperkurve (`alignment=cos`), Rückwärtsläufer behalten den Fokus mit 60 % Tempo (`v108BackwardSpeed`).
- Grundtempo `3+spd·.14` m/s (spd 10: 4,4 m/s; spd 18: 5,5 m/s). Multiplikatoren Abschnitt 2.5. P02 begrenzt Höchstgeschwindigkeit (−15 % bei Frische 0) und Beschleunigung (−25 %) (`player-effective-abilities.js:72-79`).
- Befund: Der Ballführer ist der langsamste Spieler auf dem Feld (1,1× gegen 1,58× Pressing); die Passvorbereitung bremst auf 1,2 m/s. P01 maß +0,28 Tore bei Ballführer 1,45×.

### 2.10 Frische und Belastung (P02, v158)

- Je Tick (`v158BeginNative/EndNative`, `world-player-load-v158.js:125-143`): Intervalle in virtuellen Minuten; Sprint = Geschwindigkeit >1,15× Grundtempo; Pressing = Annäherung an den gegnerischen Ballführer <14 m mit >0,8 m/s; beides in `running[sprint|pressing|both]` als Minutenanteile; intensive Zweikämpfe, Torwartsprünge und Elfmeter als Ereignisse (`:99-108`, `:218-228`).
- Wirkung: `D6EffectiveAbilities` (`player-effective-abilities.js:43-70`): quadratische Verluste unter Frische 80 (tec/pas/fin/gk −10 %, tak/air −15 %, Ruhe −20 % unter Druck, Antizipation/Entscheidung −15 %); `v158ReactionLoss` verlängert Lesefenster und Annahmezeiten.
- Konsequenz für eine langsamere Uhr: Sprint-/Pressinganteile bleiben Anteile (uhrneutral), Ereignisse pro virtueller Minute steigen (mehr Zweikämpfe je Minute → mehr Verbrauch). Kompakte Partien verbrauchen über `v158CompactRun/Contact` (`:188-213`) nach demselben Vertrag.

### 2.11 Uhr und Unterbrechungen

- `MATCH_SPEED=.78` (`game.js:6`) in 19 Dateien, 68 Verwendungen; Uhr bis 75 Einheiten = 90 Anzeigeminuten (`game.js:9-13`), Halbzeit bei 37,5 mit Verlängerung für gefährliche Angriffe (`set-pieces-v50.js:391-399`, Deckel 20 Echtsekunden), Nachspielzeit aus Unterbrechungen (`v64Step`-Logik in `world-match-v64.js:305` für kompakte, `match.addedMinutes` nativ).
- Liveschleife `setInterval(40 ms)`, Schritt gedeckelt 50 ms (`world-physical-v65.js:433-437`); Simulation nur im Zustand „live“; Autosicherung alle 700 ms Wanduhr ohne Flug/Grätsche (`:194`).
- Zeitbudget (P01 2.3): 161 s je Partie = 105 s laufende Uhr + 56 s Stillstand (34 s Freistöße, 14 s Anstöße, 5 s Einwürfe, 4 s Torszenen).

### 2.12 Widersprüche, Doppelungen und tote Pfade

| # | Befund | Ort | Wirkung |
| --- | --- | --- | --- |
| W1 | Zweiter Entscheidungsbaum hinter `v157Decide` nie erreicht; dort liegen Angriffsfokus, Durchbruch-Finish, Flankenregel ab 66 % Tiefe, Direktspiel | `pitch-v55.js:497-515` | Taktik „Angriffsfokus“ wirkt faktisch nur auf Raumpässe |
| W2 | `v152PrepareAttack`-Laufplanung tot (nach `v159Offers`) | `world-attack-flow-v152.js:24-45` | Doppelte Intent-Logik, Pflegeaufwand |
| W3 | `v123DribbleTarget`, `v55BreakawaySquare`, `v152ForwardPass`, `game.js:action/shoot` tot in neuen Partien | `pitch-v55.js:279-285, 458-465`, `world-attack-flow-v152.js:63-74`, `game.js:89-93` | — |
| W4 | Druck/Foulradien normalisiert (.135/.15/.16), Schuss-/Passreichweiten in Metern | `set-pieces-v50.js:163`, `pitch-v55.js:192,328,403,494` | Großes Feld: 20 % größere Druckradien, mehr Fouls/Streuung |
| W5 | Zweikampfauslösung pro Tick und pro Entscheidung, plus Foulprobe ohne Kontakt | `pitch-v56.js:80,121`, `set-pieces-v50.js:160` | Foulquote hängt am Entscheidungstakt, nicht am Kontakt |
| W6 | Entscheidungstakte in Uhreinheiten und Echtzeit gemischt | Abschnitt 2.1 | Uhrrate verändert das Spielverhalten |
| W7 | Stürmer-Tragen vor jeder Schussprüfung; Schussfenster erst nach Querpass; Flanke als vorletzte Option | `world-football-flow-v159.js:271`, `world-offensive-quality-v157.js:207-220` | Keine Abwägung, Reihenfolge entscheidet |
| W8 | Nur 1–2 Tiefenläufer + 1 Unterstützer; Rest kehrt in die Zone zurück; Unterstützer nie Raumpassziel | `world-football-flow-v159.js:205-219`, `world-space-passes-v150.js:12` | Wenig Anspielbarkeit, kaum Freilaufen |
| W9 | Freistoßdauer = Foulsperre + Laufzeit der Gesperrten (nicht die Formation) | `pitch-v57.js:49`, `player-ball-events-v111.js:17-19` | fastRestart (P01) blieb wirkungslos |
| W10 | Direkter Freistoß 65 % ohne Fähigkeits-/Distanzbezug | `set-pieces-v50.js:285` | 18,5 % aller Schüsse mit 8 % Torquote |
| W11 | Schussqualität ohne Fähigkeitsfenster (22 m hart), Torwartreichweite praktisch ohne `gk` | `world-offensive-quality-v157.js:174`, `match-shot-choice-v159.js:9` | Gute Schützen schießen nicht aus der Distanz; Torwartspiel wirkungslos |
| W12 | Flankenfehler pauschal (50 % Fehlvariante), Ecken fähigkeitsabhängig | `pitch-v55.js:330` | Inkonsistent, Flanken unattraktiv |
| W13 | Rollenintention ersetzt Anweisungen; Verteidigerrollen ohne Angriffsabsicht; Flügelrolle zieht an die Seitenlinie, aber kein Grundlinienlauf | `world-player-roles-v154.js:44-48, 103` | Flügel liefern keine Flanken |

## 3. Bewertung gegen die Nutzerziele

| Ziel | Stand R132 (P01) | Was die Architektur verhindert |
| --- | --- | --- |
| 4–6 min all-inclusive | 2,7 min; 65 % laufende Uhr | Uhrrate fest (`MATCH_SPEED`), Takte in Uhreinheiten (W6); Unterbrechungen sind kurz, Freistöße dominieren über die Foulsperre (W9) |
| 10–16 Schüsse, 2–3 Tore, hohe Qualität | 3,6 Schüsse, 30 % aufs Tor, 0,8 Tore | Reihenfolge statt Abwägung (W7); Ballführer langsamster Spieler (2.9); Schusszone wird selten erreicht; 41 % Standardschüsse |
| Gute Schützen aus der Distanz | 0 Spielzugschüsse >22 m | Hartes 22-m-Fenster ohne `fin` (W11) |
| Favoriten ≈65 % | 37 % | Wenige Ereignisse; Fähigkeiten wirken auf Ausführung, kaum auf Entscheidung; Torwart ohne Wirkung |
| Freilaufen, Tiefe, Dribbling, Risiko | 1–2 Läufer; Dribbling nur Dribbler; Risiko nicht modelliert | W8, W13, Abschnitt 2.2 (10), Lane 1,4 m für alle |
| Freistöße zügiger, Teleport | 8,7 s je Freistoß | W9 |
| Abpraller, Ecken, Flanken | 0,03 / 0,11 / 0,2 je Partie | Zu wenige Schüsse aufs Tor und Paraden; Flanke vorletzte Option mit Pauschalfehler (W12); keine Boxbesetzung |
| Großes Feld / 6 Spieler | 3,05 Schüsse (Standard 4,05) | W4; Pass-/Laufreichweiten nicht skaliert; Abschnitt 6 |
| Erklärbarkeit | keine | Kein Entscheidungsprotokoll; Ergebnis nur aus Statistik rekonstruierbar |

## 4. Zielbild „Spielerintelligenz neu“

Grundidee: **eine** Bewertungsfunktion je Spieler und Tick statt vierzehn Reihenfolgeregeln. Alle Module lesen denselben Weltzustand (Positionen, beobachtete Geschwindigkeiten, Abseitslinie, Rollen, Fähigkeiten) und schreiben nur serialisierbare Absichten (`attackFlow.*`). Zufall wird ausschließlich an definierten Stellen gezogen (Optionswahl bei nahen Nutzenwerten, Ausführungsfehler), damit JSON-Restore und Digests unverändert funktionieren.

### 4.1 Optionsmodell für den Ballführer

Je Entscheidung werden alle Optionen mit demselben Maß bewertet: **erwarteter Torbeitrag minus Risiko**, 0–1.

| Option | Nutzen | Risiko | Fähigkeiten/Persönlichkeit |
| --- | --- | --- | --- |
| Schuss | xG(d, Winkel, Blocker, Torwartposition) · Qualität; Distanzfenster `16 m + 0,7 m·fin` (fin 8: 21,6 m; fin 14: 25,8 m; fin 18: 28,6 m) | Ballverlust nach Fehlschuss (Abstoß) | `fin`, `tec`; Torjäger/Stoßstürmer +Gewicht; Ruhe (geplant) senkt Druckmalus |
| Pass (Boden/hoch/Raum) | Empfängerwert = xG-Potenzial am Zielpunkt in 1 s (Antizipation) + Raumgewinn | Abfangwahrscheinlichkeit aus Linienabstand, Flugzeit, Gegnertempo; Empfängerdruck | `pas`, `pos`; **Spielmacher**: Risikoschwelle −30 %, Lane 1,0 m statt 1,4 m, 26 m Reichweite; Abräumer/Verteidiger: Sicherheitsbonus für Rückpass |
| Dribbling/Tragen | Positionsgewinn in 1 s entlang des freien Korridors (Grundlinie für Flügel, Tormitte für Stürmer) | Zweikampfwahrscheinlichkeit des nächsten Gegners | `tec`, `spd`; Dribbler +Gewicht; Ballführer-Tempo 1,45–1,6× |
| Halten/Abschirmen | kleiner Grundwert, steigt wenn alle Optionen riskant sind | Druck | Zielspieler +Gewicht |

Entscheidung: beste Option, bei Nutzenabstand <0,05 gewichteter Zufall (eine Ziehung). Takt 0,25 s Echtzeit für alle Ballführer, Annahmefenster bleibt. Ergebnis wird als `decisionTrace` (Option, Nutzenwerte, Grund) in einen flüchtigen Ringpuffer geschrieben — Erklärbarkeit für Tests, Spielbericht („nach Doppelpass“) und spätere UI.

### 4.2 Freilaufmodell ohne Ball

Jeder Mitspieler ohne Deckungsaufgabe bewertet alle 0,5–1 s ein Angebotsraster (vor/seitlich/hinter dem Ball, Box, Grundlinie) nach: Abstand zum nächsten Gegner, offene Passlinie, Abseitslegalität in der Zukunft, Rollenpräferenz, Abstand zu anderen Angeboten, Laufweg. Rollenprofile: Torjäger → Box/zweiter Pfosten; Stoßstürmer → tiefe Zone vor dem Ball; Flügel → Breite, dann Grundlinie; Spielmacher → Anspielstation 8–12 m hinter/neben dem Ball; Box-to-Box → Hinterlaufen; ballspielender Verteidiger → Aufbaustation. Alle Angebote sind Absichten mit Ablauf (wie heute `intents`). Ergebnis: 4–5 bewegte Mitspieler statt 2–3.

### 4.3 Koordinierte Angriffsmuster

Muster werden als Absicht mit zwei Rollen gestartet und laufen deterministisch ab, bis Kontakt oder Abbruch:

- **Doppelpass**: Pass + Anschlusslauf hinter den Gegner + Rückpassbonus (heute nur zufällig).
- **Hinterlaufen**: Flügel am Ball, Box-to-Box läuft außen vorbei; Ballführer erhält die Option „Pass in den Lauf“ mit hohem Nutzen.
- **Flügel → Grundlinie → Flanke + Boxbesetzung**: breiter Ballführer trägt zur Grundlinie (Prototyp Abschnitt 5), Torjäger/Stoßstürmer/Mittelfeld besetzen nahen Pfosten, Elfmeterpunkt, zweiten Pfosten; Flankenfehler fähigkeitsabhängig wie Ecken (B10).
- **Konter**: nach Ballgewinn in der eigenen Hälfte 3 s lang Risikoschwelle −40 % und zwei Tiefenläufer.

### 4.4 Verteidigung

B03 bleibt (Verfolgung, Grätsche von hinten = Foul). Ergänzt wird nur die Zuteilung: ein Pressender, ein Absicherer, Rest in Deckung oder Zone (heute: nächster + zwei Verfolger ohne Absicherung bei Durchbruch). Kontaktversuche nur auf einem Weg (Tick-Prüfung), Foul nur bei Kontakt (W5). Druckradien in Metern (W4). Pressingtempo 1,45× als Testparameter, keine pauschale Entschärfung.

### 4.5 Torwartmodell

Reichweite `0,55 + 0,035·gk` m, Reaktion `0,30 − 0,011·gk` s, Seitwärtstempo `+0,08·gk` m/s; Position auf der Ball-Tor-Linie mit `gk`-abhängigem Vorrücken; Fang- gegen Abklatschentscheidung aus Schusshärte, Höhe und `gk`; Abpraller als freie Bälle mit Richtung (Abschnitt 4.6). Die automatische Torwertung unerreichbarer Bälle bleibt, wird aber durch die Reichweite seltener.

### 4.6 Abpraller-, Ecken- und Flankenquellen

Mehr Schüsse aufs Tor und mehr Paraden erzeugen Abpraller und Ecken von selbst; zusätzlich: Blocks mit Richtung zur Grundlinie (Zufall −.2 statt −.3), Torwartabwehr 38 % ins Aus, Paradenanteil +8 %, Flanken früher und mit Boxbesetzung (4.3). Jäger B12 bleibt.

### 4.7 Standards mit Teleport

Freistoß/Abseits: Spieler außer Opfer/Täter werden in die Formation gesetzt (`v50Spot`), Gesperrte zählen nicht zur Wartezeit und werden nach 1,8 s gesetzt; Foulszene 2,2 s; direkte Freistöße nur mit Schützenbezug (`fin`, Distanz ≤26 m, Winkel). Ecken behalten die 6-m/s-Anreise (sichtbar), Anstoß nach Tor bleibt.

### 4.8 Uhr- und Dauermodell all-inclusive

Neue Partien erhalten `match.clockRate` (Echtzeit-Sekunden je Uhreinheit) in `v65CreateMatch`; alle Takte in Echtzeit (W6 bereinigen); Budget: Laufzeit ≈ 75/Rate + Unterbrechungen (≈ 0,45–0,5 → 4,5–5 min mit Teleport, Messung Abschnitt 5). Keine adaptive Uhr (Determinismus), aber eine Nachspielzeit aus tatsächlichen Unterbrechungen wie heute. Eine Spielminute darf länger dauern (Nutzerentscheid), die 90-Minuten-Anzeige bleibt.

### 4.9 Rahmenbedingungen

- **Determinismus und Restore**: alle Absichten als Plain-Daten in `attackFlow` (wie `intents`, `carry`, `pursuitReads`); keine WeakMap-Entscheidungen; Zufall nur an benannten Stellen; Digest-Tests wie in Release 132.
- **Marker**: `attackFlow.intelligenceRevision=183` (oder je Paket 183–187) nur in `v65CreateMatch`; Restore ergänzt nie; alte Partien behalten jede Regel.
- **Performance (mobil)**: Optionsbewertung je Ballführer ≤ 12 Optionen × 10 Gegner pro 0,25 s; Angebotsraster 6 Punkte × 4 Spieler je 0,5 s — unter dem heutigen Aufwand von `v150Candidates` (9 Punkte × 4 Läufer × 10 Gegner je Entscheidung).
- **Unity/2D**: keine neuen Darstellungsfelder nötig; Grundlinienläufe und Flanken nutzen vorhandene Clips (B02/B05 bleiben offen für höhere Tempi).
- **Erklärbarkeit**: `decisionTrace` (flüchtig, letzte 64 Entscheidungen) und Spielberichtsquellen („Flanke“, „Doppelpass“, „Distanzschuss“, „Abpraller“) über den Ballereignis-Ledger v117.

## 5. Prototyp-Messungen

Jede Variante spielt dieselben 192 Begegnungen wie die Basis (96 Vereine × 2 Feldgrößen, Seeds `p01r132-<Verein>`); Differenzen sind gepaart (Mittel ±95 %). Die Basis ist bitgleich zur P01-Basis. Prototypen sind Größenordnungsbelege in Kopien, keine fertigen Implementierungen. Rohdaten: `outputs/si-r132/<Variante>.json`, Tabellen: `node work/table-si-r132.cjs …`.

### 5.1 Varianten

| Kürzel | Änderung in der Kopie (Datei:Zeile der Basis) |
| --- | --- |
| decide | Schussqualität mit Fähigkeitsfenster `16+0,7·fin` m, Winkelfaktor, ein Blocker erlaubt (×0,5) statt 22-m-Grenze (`world-offensive-quality-v157.js:174-176`); Schuss gegen beste Passoption abgewogen (`shot ≥ 0,7·Passwert`, Zufall < `2,2·shot`), Querpass ab +0,12 statt +0,22 (`:207,210`); Stürmer tragen nur, wenn kein Fenster ≥0,18 (`world-football-flow-v159.js:271`) |
| risk | Spielmacher/Passspiel ≥14: Linie 1,0 statt 1,4 m, 26 m Reichweite, Gewinn ≥2 m, Score >−0,05 (`:206,212`); Raumpass: Marge ≥0,02 s, Gegner >1,8 m, Score ≥0,10, Chance `.10+pas·.022+…+Spielmacher .15` bis 0,80 (`world-space-passes-v150.js:30,39,40`) |
| runners2 | zwei Tiefenläufer auch bei fünf Feldspielern (`world-football-flow-v159.js:207`) |
| offers | alle übrigen Mitspieler ohne Deckungsrolle erhalten ein Freiraumangebot (6 Kandidaten, Score aus Gegnerabstand, Linie, Vorwärtsbias, Abstand zu anderen Angeboten); bei breitem Ball <30 m besetzen Nicht-Verteidiger Boxpunkte (naher Pfosten, Elfmeterpunkt, zweiter Pfosten) (`:220`) |
| cross | breiter Ballführer (>6 m seitlich, 9–32 m) flankt bei besetzter Box (<20 m, <12 m seitlich) mit Chance `.7·q` (Flügel .85) vor hohem Ball/Vorwärtspass (`world-offensive-quality-v157.js:211`); späte Flanke .75 statt .55 (`:220`); breite Stürmer tragen zur Grundlinie statt zur Tormitte (`world-football-flow-v159.js:272,275`) |
| si-move | Ballführer 1,45× statt 1,28× (`world-offensive-quality-v157.js:42`); Pass ab 0,55 rad / 2,5 m/s statt 0,30 rad / 1,2 m/s (`:167`) — P01-Varianten carrier145 + turn |
| gk | Torwartreichweite `.55+.035·gk` m statt 0,8, Reaktion `.30−.011·gk`, Seitwärtstempo +`.08·gk` (`match-shot-choice-v159.js:9`) |
| aim | Schussstreuung `.012+(1−q)·.085` statt `.018+(1−q)·.13` (`:24`) — P01 |
| teleport | Freistoß-/Abseitsformation wird gesetzt statt gelaufen (`pitch-v57.js:48`), Gesperrte zählen nicht zur Wartezeit (`:49`), Foulszene 2,2 statt 3,8 s, Sperre 1,8 statt 2,7 s (`player-ball-events-v111.js:17-23`) |
| rebound | Blockabpraller stärker zur Grundlinie (`set-pieces-v50.js:215`), Torwartabwehr 38 statt 28 % ins Aus (`world-ball-motion-v110.js:23`), Paradenanteil +0,08 (`pitch-v55.js:446`) |
| b03soft | Kontaktfenster 400 statt 250 ms (`world-football-flow-v159.js:158`), Pressingtempo 1,45× statt 1,58× (`world-offensive-quality-v157.js:42`) |
| speedXX | `MATCH_SPEED` 0,78 → 0,50 / 0,45 / 0,42 / 0,40 (`game.js:6`) |
| **si-brain** | decide + risk + runners2 + offers + cross (nur Entscheidung und Laufwege, keine Tempo- oder Uhränderung) |
| **si-attack** | si-brain + si-move |
| **si-attack-gk** | si-attack + gk + aim |
| **si-fullXX** | si-attack-gk + speedXX + teleport + rebound |
| si-full50-c160 / -b03soft | si-full50 mit Ballführer 1,6× bzw. mit b03soft |
| si-max42 | si-full42 mit Ballführer 1,6× und b03soft |
| si-full45-scale | si-full45 mit großfeld-skalierter Passreichweite, Raumpassreichweite und Laufvorlauf (×`v150Scale().x/48,53`) |

### 5.2 Pakete

Beide Feldgrößen, 192 Partien je Zeile; in Klammern gepaarte Differenz zur Basis (±95 %).

| Variante | Min. | Schüsse | aufs Tor | Tore | Abpraller | Ecken | Flanken | Raumpässe | Fouls | 0:0 | 2–3 Tore | Fav. ≥1 | Fav. ≥2 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **Basis R132** | 2,68 | 3,68 | 1,13 | 0,76 | 1,06 | 0,11 | 0,17 | 4,33 | 3,92 | 52 % | 18 % | 37 % | 44 % |
| si-brain | 2,70 (+0,02) | 3,92 (+0,23 ±0,29) | 1,40 (+0,28 ±0,20) | **0,99 (+0,24 ±0,17)** | 1,11 | 0,10 | **0,52 (+0,35 ±0,12)** | 5,32 (+0,99) | 3,57 (−0,35) | 37 % | 22 % | 42 % | 44 % |
| si-attack | 2,61 (−0,07) | 4,08 (+0,40 ±0,30) | 1,29 (+0,17) | 0,88 (+0,13 ±0,18) | 1,05 | 0,08 | 0,51 | 5,09 | 3,20 (−0,72) | 41 % | 19 % | 31 % | 37 % |
| si-attack-gk | 2,60 (−0,08) | 3,86 (+0,18) | 1,31 (+0,18) | 0,78 (+0,02) | 1,12 | 0,10 | 0,59 | 5,21 | 3,27 (−0,65) | 43 % | 16 % | 43 % | 48 % |
| si-full50 | 3,52 (+0,83 ±0,08) | 6,14 (+2,45 ±0,34) | 2,07 (+0,94 ±0,28) | 1,25 (+0,49 ±0,22) | **1,96 (+0,91 ±0,25)** | 0,21 (+0,09) | 1,09 (+0,93 ±0,16) | 6,97 (+2,64) | 5,29 (+1,37) | 34 % | 31 % | 43 % | 50 % |
| si-full50-c160 | 3,52 (+0,83) | 6,38 (+2,70 ±0,36) | 2,32 (+1,19 ±0,27) | 1,39 (+0,63 ±0,22) | 1,93 | 0,24 | 1,13 | 7,00 | 4,87 (+0,95) | – | – | – | – |
| si-full50-b03soft | 3,49 (+0,81) | 6,08 (+2,40 ±0,35) | 2,11 (+0,99) | 1,29 (+0,53 ±0,21) | 1,80 | 0,18 | 0,95 | 6,63 | 4,78 (+0,85) | 30 % | 33 % | 47 % | 54 % |
| si-full45 | 3,92 (+1,24 ±0,08) | 6,51 (+2,83 ±0,35) | 2,34 (+1,22 ±0,26) | 1,50 (+0,74 ±0,23) | 1,99 (+0,93) | 0,27 (+0,15 ±0,09) | 1,23 (+1,06 ±0,18) | 7,45 (+3,12) | 5,60 (+1,68) | 26 % | 44 % | 49 % | 54 % |
| **si-full42** | **4,18 (+1,49 ±0,07)** | **6,72 (+3,04 ±0,36)** | **2,36 (+1,23 ±0,24)** | **1,51 (+0,75 ±0,21)** | 2,02 (+0,96) | 0,25 (+0,14) | 1,23 (+1,07) | 7,42 (+3,08) | 6,21 (+2,29) | 26 % | 43 % | **54 %** | **57 %** |

Je Feldgröße (si-full42 / si-full45 / Basis):

| Kennzahl | Standardfeld 42 | Standard 45 | Standard Basis | Großes Feld 42 | Groß 45 | Groß Basis |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Minuten | 4,25 | 3,99 | 2,71 | 4,11 | 3,85 | 2,66 |
| Schüsse | 7,48 | 7,45 | 4,07 | 5,96 | 5,57 | 3,29 |
| aufs Tor | 2,79 | 2,73 | 1,19 | 1,93 | 1,96 | 1,06 |
| Tore | 1,73 | 1,73 | 0,77 | 1,28 | 1,27 | 0,74 |
| 2–3 Tore | 50 % | 47 % | 19 % | 35 % | 42 % | 18 % |
| 10–16 Schüsse | 18 % | 20 % | 0 % | 4 % | 2 % | 0 % |
| 4–6 min | 79 % | 48 % | 0 % | 60 % | 27 % | 0 % |
| Flanken | 1,18 | 1,30 | 0,17 | 1,29 | 1,16 | 0,17 |
| Favoriten ≥1 (N 65/69) | 51 % | 58 % | 29 % | 57 % | 41 % | 43 % |
| Tordifferenz je Stärkepunkt | 0,27 | 0,31 | 0,07 | 0,26 | 0,16 | 0,23 |

Lesart:
- **Das Entscheidungsmodell allein (si-brain) bringt bei gleicher Uhr ein Viertel mehr Tore**, 0:0 von 52 auf 37 %, Fernschüsse von 1 auf 13 % und dreimal so viele Flanken, bei weniger Fouls. Die Schusszahl steigt nur wenig (+0,23): Die Zone wird nicht öfter erreicht, aber die Abschlüsse sind besser gewählt (aufs Tor 30 → 35 %).
- **Ballführer-Tempo und kürzere Passdrehung (si-move) heben die Schusszahl** (+0,40), kosten im Paket mit si-brain aber Tore (0,88) und Favoritensiege (31 %); die Differenz zu si-brain liegt innerhalb der Streuung (±0,18 Tore). Mit 1,6× (si-full50-c160) sind es +0,14 Tore und +0,25 aufs Tor gegenüber 1,45×.
- **Torwartmodell (gk+aim) kostet planmäßig Tore** (Tor je Schuss aufs Tor 62 → 54 %), verdoppelt die Paraden (0,24 → 0,46 je Torwart) und erhöht damit Abpraller und Ecken erst in Verbindung mit mehr Schüssen.
- **Uhr und Teleport** liefern die Dauer und vervielfachen alle Ereignisse: si-full42 verdoppelt Schüsse und Tore, Abpraller und Ecken, versiebenfacht Flanken. 70 % der Partien liegen in 4–6 min, 43 % haben 2–3 Tore, aber nur 11 % erreichen 10–16 Schüsse.
- **b03soft** (Kontaktfenster 400 ms, Pressing 1,45×) ändert Schüsse und Tore nicht messbar (−0,06 / +0,04), senkt Fouls um 0,5 und Flanken um 0,14. Die Verteidigung ist nach den Angriffsänderungen nicht mehr der Engpass; eine pauschale Entschärfung ist nicht nötig (Nutzerziel).
- **Großes Feld**: gleiche Dauer, aber 20 % weniger Schüsse und 25 % weniger Tore als auf dem Standardfeld; nur 2–4 % der Partien erreichen 10 Schüsse. Favoritenquote streut stark (41–57 % bei 69 Partien). Abschnitt 6 und die Skalierungsvariante (5.7).

### 5.3 Beste gemessene Kombination

<!-- BEST -->

### 5.4 Einzelhebel (gepaart gegen die Basis)

<!-- LEVERS -->

### 5.5 Dauer-Modell all-inclusive

Die Laufzeit zerfällt in laufende Uhr (`Uhrende/Rate`) und Stillstand. Gemessen je Partie (Echtsekunden):

| Variante | gesamt | laufende Uhr | Freistöße (je Freistoß) | Anstöße | Torszenen | Einwürfe | Ecken/Abseits | Uhrende (Einheiten) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Basis (0,78) | 161 | 106 | 34,1 (8,45) | 13,7 | 3,8 | 4,6 | 0,7 | 82,6 |
| si-full50 | 211 | 163 | 15,8 (2,88) | 19,5 | 6,3 | 7,2 | 1,3 | 82,4 |
| si-full45 | 235 | 182 | 16,7 (2,84) | 22,4 | 7,6 | 7,5 | 1,7 | 82,6 |
| si-full42 | 251 | 197 | 18,5 (2,84) | 23,1 | 7,6 | 7,1 | 3,3 | 82,9 |

Der Teleport senkt die Freistoßdauer von 8,45 auf 2,84 s (≈ 3,8 s Foulszene ohne Laufen + Ausblenden/Pause); dadurch bleibt der Stillstand trotz 50 % mehr Fouls, doppelt so vielen Toren und 25 % mehr Anstößen bei 53–55 s. Faustformel: **Echtzeit ≈ 83 Einheiten / Rate + 55 s**. Für 4,5 min ist eine Rate von ≈0,38 nötig, für 5,0 min ≈0,34 (si-full40 in der Nachserie, Abschnitt 5.7). Eine Spielminute dauert dann 2,7–3,3 s statt 1,07 s; die Entscheidungstakte in Uhreinheiten (Abschnitt 2.1) müssen vorher in Echtzeit überführt werden, sonst verlangsamt die Uhr auch die Annahme- und Zweikampfpausen.

### 5.6 Schussqualität, Stärke und Torwart

**Schussherkunft je Partie** (Basis → si-full45): Aufbau 0,91 → 1,59; Konter 0,57 → 1,48; Ballgewinn vorn 0,48 → 0,85; Standardfolge 0,99 → 1,63; direkter Freistoß 0,68 → 0,88; Abprallerschuss ≤5 s 0,03 → 0,04 trotz 2,0 freier Bälle aus Schüssen (die Jäger erreichen den Ball zu spät oder der Verteidiger zuerst — Hebel für SI-3). Fernschüsse >22 m aus dem Spiel: 0,04 → 0,60 je Partie, geschossen von Spielern mit Abschluss 14,3 (Mittel aller Schützen 12,4), 32 % aufs Tor, 11 % Tore.

**Schützen nach Abschluss** (si-full45): <10: 15,5 m mittlere Distanz, 0,6 % Fernschüsse, 35 % aufs Tor, 24 % Tore; 10–14: 17,0 m, 9 %, 38 %, 21 %; ≥14: 18,8 m, 21 %, 42 %, 27 %. Gute Schützen schießen also aus der Distanz und treffen trotzdem häufiger — das Nutzerziel ist mit dem Fähigkeitsfenster erreichbar, ohne die Torquote zu drücken (Basis: 32 % Tore bei ≥14, 15 % bei <10).

**Stärke** (si-full42, je Team): Favoriten mit ≥1 Punkt Vorsprung schießen 4,6-mal (Außenseiter 2,1), treffen 1,16-mal (0,37) und gewinnen 54 % (Basis 37 %) bei 36 % Remis (49 %). Je Stufe: ≥2 Punkte 54–57 % Siege, 1–2 Punkte 39 %. Tordifferenz je Stärkepunkt 0,26 (Basis 0,15). Für 65 % fehlen vor allem Tore bei kleinen Abständen (1–2 Punkte); Hebel sind mehr Ereignisse (Schüsse 10+) und eine Entscheidungsqualität, die selbst von Fähigkeiten abhängt (Zielbild 4.1: Antizipation/Entscheidung als Gewicht statt nur Ausführungsfehler).

**Torwart** (si-full45): Torhüter ≥14 kassieren 52 % der Schüsse aufs Tor, 10–14 64 % (Basis 53/67 %); Paraden je Torwart 0,46 statt 0,24. Die automatische Torwertung unerreichbarer Bälle bleibt der Grund, warum 60 % der Schüsse aufs Tor Tore sind (Fußball ≈30 %); mit 2–3 Toren je Partie als Ziel ist das vertretbar, sichtbar machen Torwartstärke aber erst Paraden mit Abprallern.

**Entscheidungsstruktur** (Aufrufe je Partie, 18–22 m, si-full45): Drehung läuft 10,5, Tragen 4,0, Pass nach Drehung 3,6, Schuss 1,9, Pass 1,9, Durchbruch 1,1. Auch mit lockerer Passdrehung bleibt die Drehvorbereitung der häufigste Zustand vor der Schusszone — der Wechsel von „drehen, dann passen“ zu „Option mit Körperstellung bewerten“ (4.1) ist der nächste Hebel für Dynamik.

### 5.7 Nachserie

<!-- EXTRA -->

## 6. Großes Feld und sechs Feldspieler

**Geometrie** (`v160WorldGeometry`, `world-match-v64.js:12`): Länge 81,6 m, Breite 52,8 m (×1,2); **Tor, Strafraum und Ballradius bleiben konstant** (Tor 4,85 m, Strafraum 10,6 m tief, 24,3 m breit). Spielpositionen sind normalisiert (`team()`, `game.js:59`): Rasterabstände wachsen von 7,9 m auf 9,5 m (Breite) und von 8,5 m auf 10,2 m (Tiefe).

| Größe | normalisiert (skaliert ×1,2) | in Metern (unverändert) |
| --- | --- | --- |
| Formationsanker, Abwehrlinie (.21/.31/.41), Abseits-Sicherheitsmarge, Einwurf-/Anstoßaufstellung | ja | — |
| Foulradius .135, Druckradius .15 (Pass, hoher Ball, Schuss), Zweikampfradius Basis | ja (W4) | — |
| Passreichweiten 20/25 m, Lane 1,4 m, Raumpass 8–32 m, Flankenbedingung 9 m seitlich, Schussfenster 22 m, Torwart 16,5/12 m, Verfolgung 20/40 m, Leine 12/16 m, Sprint-/Grundtempo | — | ja |

Folgen: (1) Mitspieler stehen 20 % weiter auseinander, die Passfilter nicht → weniger gültige Optionen, längeres Halten, mehr Fehlpässe (Passquote 84,6 % statt 88 %). (2) Die 22-m-Zone ist absolut gleich groß, der Weg dorthin 20 % länger bei gleichem Tempo → 3,05 statt 4,05 Schüsse (P01 2.9). (3) Druck- und Foulradien sind größer → Fouls dennoch seltener (3,5 statt 4,4), weil Spieler seltener in Kontakt kommen. (4) **Formationen**: die 6er-Grundordnungen (`v160SixFormations`, `world-match-v64.js:5`) belegen die Rasterzellen `[25,26,27,28,29,32]`/`[15..19,22]`/`[5..9,2]` (`:137`); der sechste Spieler landet je nach Reihe auf einer Randzelle (32 = Reihe 7 Mitte, 22 = Reihe 5 Mitte, 2 = Reihe 1 Mitte), nicht auf einer gleichmäßigen Verteilung — bei 2–2–2 stehen beide Angreifer auf 6/8, bei 1–2–3 ein Stürmer auf Zelle 9 (ganz rechts). Rollen bleiben zonenbezogen (`D6TacticTransitions`), die KI-Formationswechsel bei Rückstand/Führung nutzen 1–2–3/3–2–1 (`world-match-v64.js:276`). (5) **Zweiter Tiefenläufer nur hier** (`:207`), Unterstützer wie Standard; das zusätzliche Angebot wird durch die größeren Abstände aufgezehrt.

Bewertung: Formationen und Rollen funktionieren auf dem großen Feld, aber die Raumaufteilung nicht: Ein Feld von 1,44-facher Fläche mit 1,2-fach Spielern braucht entweder meter-skalierte Reichweiten (Passlänge ×1,1, Angebotsraster ×1,2, Zone bleibt) oder normalisierte Druckradien in Metern. Das Zielbild (Abschnitt 4) definiert alle Radien in Metern und skaliert nur Angebotsraster und Passreichweite mit `v150Scale`. Ob das große Feld eigene Parameter (z. B. Uhrrate) braucht, zeigt die Messung je Feldgröße in Abschnitt 5.

## 7. Umsetzungsplan in Paketen

Jedes Paket: eigener Marker in `v65CreateMatch`, nur neue Partien; Prüfung mit ≥192 gepaarten Vollpartien (beide Feldgrößen, echte Welt, synchrones Setup, Simulation nur bei „live“), JSON-Fortsetzung bitgleich, Altpartien-Digest unverändert, Unity-Parität je einer Partie.

| Paket | Inhalt | Abhängigkeit | Risiko | Tests/Marker |
| --- | --- | --- | --- | --- |
| **SI-0 Uhrvertrag** | `match.clockRate` je neuer Partie; alle Takte in Echtzeit (W6); Teleport-Freistoß mit fester Wartezeit (4.7); P02-Lastprüfung | keine | gemischte Einheiten übersehen (68 `MATCH_SPEED`-Stellen) | `clockRevision=183`; Dauertest all-inclusive im Browser (Wanduhr) und Node |
| **SI-1 Ballführer-Optionsmodell** | 4.1 inkl. Schussfenster nach `fin`, Passrisiko nach Rolle, Dribbling-/Tragewert, Querpass; toter Baum W1/W3 entfernen; `decisionTrace` | SI-0 | Verschiebung zu Distanzschüssen (P01 „attack“), Animationen B02 | `intelligenceRevision=184`; Schusshistogramm, Torquote je Schuss |
| **SI-2 Freilaufen und Muster** | 4.2, 4.3 (Doppelpass, Hinterlaufen, Flügel/Flanke/Box, Konter); zwei Läufer auch bei fünf Spielern; Flankenfehler wie Ecken | SI-1 | Abseitshäufung, Formationsauflösung; Unity-Laufclips | `intelligenceRevision=185`; Flanken/Boxbesetzung je Partie, Abseits je Partie |
| **SI-3 Torwart und Abpraller** | 4.5, 4.6; Parade-/Fangentscheidung; Paradenanimation P03 | SI-1 | P03 offen; Keeper-Masse/Clips | `keeperRevision=186`; Tor/aufs Tor, Paraden, Ecken je Partie |
| **SI-4 Verteidigung und Radien** | 4.4; Radien in Metern (W4); ein Kontaktweg (W5); Pressingtempo als Parameter | SI-1 | B03-Abnahme offen; Foulquote | `pursuitRevision=187`; Fouls, Zweikampfquote |
| **SI-5 Großes Feld** | meter-skalierte Angebote/Passreichweite; Rasterverteilung für sechs Spieler | SI-2, SI-4 | Formationsumbau in UI | Messung je Feldgröße, Ziel gleiche Kennzahlen |
| **SI-6 P02-Angleich** | kompakte Simulation an die neuen physischen Kennzahlen (Abschnitt 7.1) | SI-0…SI-4 gemessen | Schema der Compact-Parameter (`shotBalanceRevision`) | neue `compactBalance`-Kennung, 1.700-Partien-Matrix wie v178 |

### 7.1 Was für P02 aus dem ausgespielten Spiel abgeleitet werden muss

Die kompakte Simulation (`v64Step`, `world-match-v64.js:285-313`; `v155CompactActions`, `world-player-performance-v155.js:91-121`) erzeugt je Minute und Team genau eine abstrakte Aktion: Pass (Erfolg `.77+(pas−10)·.009−Druck·.16`), danach mit 9 % (Heim 9,27 %) ein Schuss, aufs Tor `.48+(fin−10)·.013−Druck·.13`, Tor `.32+(fin−gk)·.012−Schwierigkeit·.08` (Deckel .48). Daraus 11,7–13,8 Schüsse, 1,3–1,75 Tore, 18–39 % 0:0 (v178). Nach der Angleichung der physischen Partie sind zu übernehmen (je Team und Partie, getrennt nach Stärkeabstand und Feldgröße):

1. Schüsse je Partie und ihre Verteilung auf Spielzug, Standards, Abpraller, Flanken (heute hat die kompakte Simulation keine Abpraller/Ecken).
2. Anteil aufs Tor, Tor je Schuss aufs Tor, Torwartwirkung (`gk`-Hebel) — heute 62 % physisch gegen ~28 % kompakt.
3. Favoritensiegquote je Stärkeabstand (Ziel ≈65 % bei ≥1 Punkt) und Remisquote.
4. Torverteilung nach Rolle (Torjäger/Stoßstürmer-Gewicht 2:1 im Compact) und Assists nach Rolle (Spielmacher/Flügel/Zielspieler).
5. Fouls, Ecken, Flanken je Partie für Statistik/Belastung (`v158CompactContact` nutzt heute nur Zweikämpfe).
6. Belastungsprofil (Sprint-/Pressinganteile je Minute) nach neuer Uhrrate, damit `v158CompactRun` denselben Verbrauch erzeugt.

## 8. Offene Fragen

1. **Uhrrate je Feldgröße**: gleiche Rate für beide Feldgrößen oder je Größe (Abschnitt 5/6)?
2. **Distanzschüsse**: Welche Torquote je Fernschuss ist akzeptabel (Prototyp: Fenster `16+0,7·fin` m)?
3. **Persönlichkeit**: Sollen Risikofreude/Schussfreude aus Rollen (Spielmacher, Torjäger) oder aus den geplanten mentalen Werten (Ruhe, Antizipation, Entscheidungen) kommen? Letzteres braucht die Spielerdaten-Erweiterung.
4. **B03-Kalibrierung**: Pressingtempo 1,45× und 400 ms Kontaktfenster sind Prototypwerte; Nutzerabnahme von B03 steht aus.
5. **Teleport sichtbar**: Alle außer Opfer/Täter werden gesetzt; soll ein kurzes Einblenden (0,3 s) die Teleportation kaschieren?
6. **Direkter Freistoß**: Soll die 65-%-Regel durch Schützenbezug ersetzt werden (weniger, aber bessere Freistoßschüsse)?
7. **Entscheidungsprotokoll**: nur Tests/Debug oder auch als Spielberichtstext („nach Flanke von …“)?
8. **Reihenfolge**: SI-0 und SI-1 zuerst (größter Hebel), oder SI-0 mit Teleport allein als schnelle Zwischenversion?

## 9. Messmethode und Reproduktion

Harness `work/measure-si-r132.cjs` (aus `work/measure-p01-r132.cjs` durch `work/patch-si-harness.cjs` erzeugt): echte 12-Länder-Welt, 96 Vereine × 2 Feldgrößen, erstes Pflichtspiel, synchrones Setup, Simulation nur bei „live“ (`notLiveStepTicks` immer 0), 50-ms-Schritte, Halbzeit sofort fortgesetzt. Laufzeit = Schritte × 0,05 s einschließlich Torszenen, Banner, Standards und Einwürfe (all-inclusive ohne Taktikpause). Prototypen sind exakt einmalige Ersetzungen in Kopien (`/v/<Variante>/`), `dist/` wird vor und nach jedem Lauf per Hash geprüft. Die Basis reproduziert die P01-Basis bitgleich (Digest-Vergleich in `outputs/si-r132/smoke-baseline.json`). Zusatzmetriken je Partie: Abpraller (freie Bälle mit Schussursprung über den Ledger), Ecken, Flanken, Raumpässe, Schussergebnisse, Zeitkategorien.

```powershell
$node='C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
& $node work/patch-si-harness.cjs                    # erzeugt work/measure-si-r132.cjs
& $node work/run-si-series-r132.cjs --set=all        # 19 Varianten, Ports 4262-4264
& $node work/table-si-r132.cjs si-full45 si-full50 si-attack si-brain   # Tabellen (beide Feldgrößen)
& $node work/table-si-r132.cjs --size=large si-full45 si-full50         # je Feldgröße
```

Ergebnisse liegen lokal unter `outputs/si-r132/` (gitignoriert).
