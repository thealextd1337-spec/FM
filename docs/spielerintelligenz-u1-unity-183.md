# Spielerintelligenz 183: U-1 Unity-Bewegung (B02/B05)

Stand: 15. Oktober 2026. Branch `feat/si-unity` auf `integration/si-r133` (`972d6201`; SI-5-Runde nach dem Merge von `e479f640`, Abschnitt „Großes Feld (SI-5)“). Begleitpaket U-1 aus dem [Umsetzungsplan](spielerintelligenz-umsetzungsplan-2026-10-14.md) (Begleitpakete, 8.3–8.6, 9, Risiken). Übernommen aus [SI-0](spielerintelligenz-si0-clock-183.md) (Foulsperre 1,8 s, Teleportbilder), [SI-2](spielerintelligenz-si2-offball-183.md) (Tempi), [SI-4](spielerintelligenz-si4-defence-183.md) (Grätschen/Fouls, B03 unverändert), [SI-3](spielerintelligenz-si3-finish-183.md) und [SI-7](spielerintelligenz-si7-setplay-183.md) (Paraden, Kopfbälle, Ecken: keine neuen Clips). Geändert sind nur `prototypes/match-engine-unity/`, die Darstellungsprojektion in `dist/world-unity-v151.js` und Messwerkzeuge in `work/`. Spiellogik, Spielstände und UI-Texte sind unberührt.

## Änderungen

| Bereich | Änderung | Altpartien |
| --- | --- | --- |
| Projektion `dist/world-unity-v151.js` | Bilder einer Partie mit SI-Marker (`match.si.revision` 183, alle neuen Partien) tragen `siRevision: 183` (Rahmenfeld, gesetzt in der vorhandenen `v98PitchFrame`-Hülle). | Bilder ohne Marker unverändert (Feld fehlt). |
| Vertrag `WorldViewContract.cs`, `WorldViewPlayback.cs` | `WorldFrame.siRevision` (fehlend = 0); `Blend` reicht es durch. | – |
| Laufzyklus `FootballLocomotion.cs`, `FootballAnimation.cs` | **B02:** Oberhalb des Autorentempos des schnellsten Vorwärtsclips (`running`, 7,4 m/s, 4,7 m je Zyklus) verlängert der Höchsttempo-Schritt (Sprintband) seine Schrittlänge um die Wurzel des Tempoverhältnisses, höchstens `MaxStrideStretch` 1,08; die Kadenz trägt den Rest. Der Zyklus folgt weiter dem empfangenen Weg, der Standfuß behält die Bodengeschwindigkeit. Langsamere Bänder behalten ihren Schritt (dort übernimmt ein schnellerer Clip). `Directional` erlaubt Skalen bis 1,08. **SI-5-Runde:** Ballführer (Band `run`) erhalten oberhalb 7,4 m/s dieselbe Streckung mit eigenem Höchstwert `MaxCarrierStretch` 1,05 und zeigen `running` erst ab 6,6 m/s (Hysterese 6,2 m/s, `CarrierTop`), darunter `run_fast4` (ein Lauf ohne Ball nutzt `run_fast4` nur bis zum Sprintband, etwa 5 m/s, danach `sprint_forward`; ein Ballführer erreicht das Sprintband nie und bleibt bis 6,6 m/s auf `run_fast4`). Torhüter mit Ball sind davon und von der Streckung ausgenommen (Folgeschritt). | Nur bei `siRevision` ≥ 183 (Streckung und Ballführer-Zwischenband). Ohne Marker bitgleich (die Streckung verschiebt den gemeinsamen Schrittzyklus aller späteren Bilder; ohne Bindung änderten sich 195 der 368 R132-Fußaktionsfenster der alten Aufnahmen, fünf über ihre R131-Sperre). |
| Foulfenster `FootballDuel.cs`, `FootballPresentation.cs` | Das Fenster ist die Dauer der Foulaktion, wenn sie bekannt ist (`durationKnown`, SI-0: 1,8 s), sonst 2,7 s. **Opfer: keine Änderung der Darstellung.** Schon vorher ergab `progress · 2,7` mit `progress = age / 1,8` eine gleichmäßige Stauchung wie three.js (`age · 2,7 / duration`); U-1 liest die Dauer jetzt ausdrücklich, die Werte sind vor und nach U-1 identisch. **Täter (die einzige sichtbare Änderung):** Stolperclip und Ausfallschritt in Echtzeit, das Absetzen in den Stand (0,6 s) am Ende des Fensters; der Stolperteil wird gekürzt statt beschleunigt. | Ohne `durationKnown` (und bei bekannten 2,7 s) bitgleich `progress · 2,7`. |
| Diagnose `NaturalMotionDiagnostics.cs` | Neue Fallgruppe „native-body“ (identische Eingabe: nativer Körperverlauf aus der versionierten Fixtur `prototypes/match-engine-unity/fixtures/native183-body/body-183.json`, 258 KB mit den Großfeld-Fällen, oder einer gleichnamigen Datei `native183-body/body-183.json` im Laufordner, die Vorrang hat; der Lauf schreibt die gelesene Quelle als `[D6 U-1] native body source: …` ins Log, als `u1Body=…` in die Ergebniszeile und als `u1BodySource` in `natural-motion.json`), Ganganalyse (`Gait`: Clipfolge, Wiedergaberate, Schrittskala), Opferfenster (`Victims`, nur Bericht), U-1-Grenzwerte (`U1Gates`), Marker aus nativen Aufnahmen. | Bestehende Fälle und Grenzwerte unverändert. |
| Tests | `FootballDuelTests` (+8: Foulfenster 1,8 s, Altpfad bitgleich), `FootballLocomotionTests` (+13; Folgeschritt +5: Bandhysterese, Ballwechsel bei 7,0 und 6,5 m/s über die echte `StrideClip`-Wahl, Torhüter; davor +8: Streckung, Grenze, Ballführer und Altbild ohne Streckung; SI-5: Ballführer 8,5 m/s, Ballführer ohne Marker, Ballführer-Zwischenband), `WorldViewTests` (+4: Teleport-Neustart). | – |
| Werkzeuge `work/` | `capture-native-body-u1-v183.cjs` (nativer Körper als Eingabe; schreibt standardmäßig die Fixtur, bytegleich reproduzierbar), `summarize-u1-body-v183.cjs` (Tabelle), `check-unity-freekick-u1-v183.cjs` (Freistoß im echten Unity-WebGL), `capture-native-motion-r132.cjs` (Marker `si` in der Meta, `siRevision` je Bild), `platform/qa/check-world-unity.cjs` (Port über `D6_QA_PORT`, Foulzahl der Paritätspartie im Bericht), `platform/qa/test-world-unity-contract.cjs` (Marker nur mit SI, sonst bitgleiches Bild). | – |

Keine Weiche in der Engine nötig; die Brücke reichte `duration`/`durationKnown` der Foulaktion bereits durch.

## B02: Tempo, Beschleunigung, Bremsen und Clipwechsel

**Identische Eingabe.** `work/capture-native-body-u1-v183.cjs` lässt die echten `dist`-Regler (`v157Move` mit den Paketen `offball` und `clock`, Spieler spd 14 / tec 14 / 74 kg, Standardfeld) laufen und schreibt jeden nativen Schritt (0,05 s): Ruhe, Antritt, Lauf, Richtungswechsel um 0°, ±45°, ±90°, ±135° oder 180° relativ zum Lauf und Halt auf einem Ziel in Bremsdistanz, danach Ruhe. Der Körperkurs ist das empfangene Blickziel (die Brücke sendet für laufende Spieler die Laufrichtung). Unity spielt diese Bilder mit der echten `WorldViewPlayback.Blend` bei 60 Hz ab. Zusätzlich läuft dasselbe gerade Tempoprofil in den acht körperbezogenen Richtungen unter festem Blick (Belastungsprobe: nativ dreht der Körper vor dem Laufen, Rückwärts- oder Seitlauf mit 7–8 m/s kommt praktisch nicht vor).

| Modus | Tempo | 90 % nach | Beschleunigung 0–0,5 s | Halt (Ziel in Bremsdistanz) |
| --- | ---: | ---: | ---: | --- |
| Ballführer frei (1,50×) | 7,06 m/s | 0,65 s | 10,4 m/s² | 0,60 s / 1,74 m |
| Ballführer, Gegner ≤ 2,5 m (1,28×) | 6,03 m/s | 0,55 s | 10,4 m/s² | 0,50 s / 1,24 m |
| Eigener Lauf (1,58×) | 8,15 m/s | 0,75 s | 10,4 m/s² | 0,65 s / 2,34 m |

Gemessen: Nahbereichsführer 6,03 m/s; das entspricht 7,06 · 1,28 / 1,50. Die Ursache der 5,80 m/s in der SI-2-Tabelle ist unklar (Hinweis an SI-2/SI-K, keine Darstellungsfrage).

Darstellung je Richtung (Lauf `final-si`, alt = vor U-1, neu = mit U-1; ohne Angabe gleich). Fenster: Start 0,5–1,4 s, Lauf 1,4 s bis zum Richtungswechsel (2,2 s) bzw. Halt (3,2 s), Halt = Richtungswechsel und Halt bis zum Ende.

- *Clipwechsel*: Wechsel des gezeigten Clips während der Bewegung (einschließlich Brems- und Drehclips über dem Schrittclip). *Bandwechsel*: Wechsel des Schrittbands (Gehen/Laufen/Sprint/Rückwärts).
- *Rate*: mittlere Wiedergaberate des Schrittclips im Lauffenster (1 = Autorentempo). *Schrittskala*: gezeigter Anteil der vor-/rückwärtigen Fußauslenkung im Lauffenster.
- *Gleiten*: **mittlere** Bodengeschwindigkeit der tragenden Sohle (Welt, nicht wurzelbezogen) im Lauf- bzw. Haltfenster. Die Spitzen innerhalb eines Fensters sind nicht gegatet (nur das Mittel im Lauffenster, ≤ 0,25 m/s): etwa `carrier128-turn+180` Halt 0,14 → 1,43 m/s (SI-5-Runde), gerader Läufer Halt 0,05 → 3,21 m/s (erste U-1-Runde, ein Bild beim Umdrehen nach dem Halt, `turn_walk_right` bei 0,5 m/s, Folge der Phasenverschiebung); offen. „0,000“ gilt für das **Lauf**fenster; im Haltfenster gibt es kleine Werte (Tabelle).
- *Gelenk*: **Fenstermaximum** der wurzelbezogenen Gelenkgeschwindigkeit (acht Knochen, die empfangene Wurzeldrehung entfernt) in Start / Lauf / Halt; Grenze 1.600 °/s.

| Fall | Clipwechsel | Bandwechsel | Rate alt / neu | Schrittskala | Gleiten Lauf | Gleiten Halt (alt → neu) | Gelenk Start / Lauf / Halt °/s (alt → neu) |
| --- | ---: | ---: | --- | ---: | ---: | --- | --- |
| Ballführer 1,50× gerade | 9 | 2 | 0,95 / 0,95 | 1,00 | 0,000 | 0,000 | 1553 / 1140 / 1034 |
| Ballführer 1,50× ±45° | 9 | 2 | 0,95 / 0,95 | 1,00 | 0,000 | 0,058 / 0,007 | 1553 / 1140 / 1250, 1080 |
| Ballführer 1,50× ±90° | 11 | 2 | 0,95 / 0,95 | 1,00 | 0,000 | 0,000 | 1553 / 1140 / 1048 |
| Ballführer 1,50× ±135° | 13 | 2 | 0,95 / 0,95 | 1,00 | 0,000 | 0,034 / 0,000 | 1553 / 1140 / 1088, 1081 |
| Ballführer 1,50× 180° | 15 | 4 | 0,95 / 0,95 | 1,00 | 0,000 | 0,000 | 1553 / 1140 / 1063 |
| Ballführer 1,28× gerade | 9 | 2 | 0,81 / 0,81 | 1,00 | 0,000 | 0,000 | 1553 / 1017 / 730 |
| Ballführer 1,28× ±45° … 180° | 9–15 | 2–4 | 0,81 / 0,81 | 1,00 | 0,000 | ≤ 0,003 | 1553 / 900 / 1064–1204 |
| Läufer 1,58× gerade | 12 | 4 | 1,10 / 1,05 | 1,05 | 0,000 | 0,001 → 0,080 | 1100 / 1295 → 1383 / 1002 → 1112 |
| Läufer 1,58× ±45° | 12 | 4 | 1,10 / 1,05 | 1,05 | 0,000 | 0,000 | 1100 / 1133 → 1148 / 1286, 1260 → 1206, 1172 |
| Läufer 1,58× ±90° | 16 | 4 | 1,10 / 1,05 | 1,05 | 0,000 | 0,000, 0,020 → 0,005, 0,000 | 1100 / 1133 → 1148 / 1199 → 1121 |
| Läufer 1,58× ±135° | 20 | 6 | 1,10 / 1,05 | 1,05 | 0,000 | 0,040, 0,069 → 0,000 | 1100 / 1133 → 1148 / 1441, 1446 → 1278, 1287 |
| Läufer 1,58× 180° | 23 | 9 | 1,10 / 1,05 | 1,05 | 0,000 | 0,000 → 0,009 | 1100 / 1133 → 1148 / 1305 → 1183 |

Die Ballführerzeilen zeigen den Stand der ersten U-1-Runde; seit der SI-5-Runde zeigen Ballführer unter 6,6 m/s `run_fast4` und haben andere Start- und Haltwerte (Abschnitt „Großes Feld (SI-5)“). In der ersten Runde waren die Ballführerfälle vor und nach U-1 identisch (unter 7,4 m/s griff die Streckung nicht). Beim Läufer verschiebt die Streckung die Schrittphase, deshalb ändern sich auch die Haltfenster in beide Richtungen; das Haltgleiten des geraden Läufers steigt von 0,001 auf 0,080 m/s (unter der Lauf-Grenze von 0,25 m/s, die für Haltfenster nicht gilt), seine Lauf-Gelenkspitze von 1.295 auf 1.383 °/s.

Belastungsprobe (feste Blickrichtung, acht Richtungen, keine Gleitgrenze, weil Rückwärts- und Seitlauf mit 7–8 m/s in Partien praktisch nicht vorkommen): Ballführer unverändert; Läufer vorwärts und seitlich Rate 1,10 → 1,05 bei Schrittskala 1,05; `body-run158-rel-right` (seitlich rechts) Haltgleiten 0,009 → 0,565 m/s, `rel-left` 0,095 → 0,025 m/s; rückwärts (±135°, 180°) bei allen drei Tempi `back_right` mit gedeckelter Kadenz, Rate 1,44, Laufgleiten bis 0,10 m/s (Läufer rückwärts-links, unverändert), Gelenke ≤ 1.410 °/s. Alle 873 U-1-Grenzwerte (Sohle, Gelenk, Oberschenkelschritt je Fenster und Übergang, Stützgleiten im Lauf der Körperfälle) bestehen vor und nach U-1; sie laufen jetzt in jedem `D6Cli.Tests`-Lauf mit (Fixtur).

Einordnung:

- **Kein Rutschen bei 1,50×:** Laufgleiten 0,000 m/s in allen acht Richtungen; der Ballführer spielt `running` mit 0,95 seines Autorentempos bei voller Schrittlänge. In den Haltfenstern bleiben kleine Werte bis 0,058 m/s (unverändert gegenüber vorher).
- **Kein bloßes Beschleunigen:** Der eigene Lauf (8,15 m/s) lief vor U-1 mit 1,10-facher (Spitze 1,17-facher) Wiedergabe bei gedeckeltem Schritt; jetzt 1,05-fache Kadenz und 1,05-facher Schritt, ohne Gleiten. Kniepol und Sohle bleiben im Rahmen (Lauf gerade: Kniepol im Mittel 11,0 → 9,4°, Sohle ≥ 1,7 cm).
- **Clipwechsel beim Antritt:** `idle → walking → run_fast6 → running` (Ballführer bis zur SI-5-Runde, 0,62/0,85/1,07 s; seither mit `run_fast4` vor `running`) bzw. zusätzlich `sprint_forward` vor `running` (Läufer, Wechsel bei 0,62/0,85/1,07/1,25 s). Jeder Wechsel ist phasengleich und blendet 0,12 s; die höchste Gelenkgeschwindigkeit des Starts ist 1.553 °/s (Ballführer, `running`-Eintritt bei 5,7 m/s) unter der Grenze. Der Gehclip steht beim harten Antritt rund 0,23 s; eine Haltezeit für das Gehband wurde in Release 132 wegen Nebenwirkungen zurückgenommen und ist hier nicht wieder eingeführt.
- **Bremsen:** `brake_meshy` über dem abklingenden Schrittband (`running → sprint_forward → run_fast4 → run_fast6 → walking`), danach Stand. Der native Körper überläuft das Ziel um rund 0,2 m und dreht danach um; Unity zeigt dafür `turn_idle`/`turn_walk` (natives Verhalten der Anlaufregel, nicht kaschiert).
- **Richtungswechsel:** 180° beim Läufer: Abbremsen, kurz `back_left`/`back_walk` (der Körper dreht langsamer als er abbremst), dann neuer Antritt. Alle Fenster unter 1.600 °/s.
- **Ballführer über 7,4 m/s: erledigt in der SI-5-Runde** (siehe „Großes Feld (SI-5)“): Ballführerstreckung bis 1,05, Rate 1,13–1,15 → 1,08–1,09.

**Echte Partien.** Auf den SI-Aufnahmen (Seeds 160112 Standard/5 und 160114 Groß/6, alle Pakete außer `field`, Uhr 0,78) laufen freie Spieler bis 8,40 m/s, Ballführer bis 7,10 m/s (16 % der Ballführerbilder über 6,5 m/s im großen Feld). Bandwechsel je Bewegungsminute: 68,9 (alte Aufnahmen) bzw. 74,4 (SI-Aufnahmen); kurze Verweildauern unter 0,25 s: 605 bzw. 474. Diese Größen sind Kennzahlen, keine Grenzwerte.

## Großes Feld (SI-5)

Mit dem Merge von SI-5 (`integration/si-r133` `e479f640`, [SI-5](spielerintelligenz-si5-field-183.md)) laufen auf dem großen Feld Ballführer (frei ×1,20 bis `carrierSpeedMax` 8,5 m/s, Nahbereich 1,41×) und eigene Läufe (×1,15 bis `runSpeedMax` 9,5 m/s) schneller. Ballführer bleiben im Band `run` und spielten `running` dort ohne Streckung mit Rate 1,13–1,15.

**Änderungen (nur mit Marker `siRevision` 183):**
- Ballführerstreckung oberhalb 7,4 m/s mit eigenem Höchstwert `MaxCarrierStretch` 1,05 (Läufe 1,08).
- Ballführer-Zwischenband: `running` erst ab 6,6 m/s (Hysterese 6,2), darunter `run_fast4` (6,3 m/s, 4,2 m je Zyklus). Ein Lauf ohne Ball nutzt `run_fast4` nur bis zum Sprintband (etwa 5 m/s) und wechselt dann auf `sprint_forward`; ein Ballführer erreicht das Sprintband nie und bleibt bis 6,6 m/s auf `run_fast4`. Torhüter mit Ball sind ausgenommen (die Darstellung zählt sie nicht als Ballführer). Ohne dieses Band wechselte ein Ballführer bei 4,2 m/s von `run_fast6` (3,0 m/s, 2,5 m) direkt auf `running` (7,4 m/s, 4,7 m). Mit den Großfeld-Eingaben überschritt das schon im unveränderten Code die Grenze: Start des Ballführers mit spd/tec 18 1.609 °/s, 180°-Wende im Nahbereich 1.643 °/s (36 von 2.318 U-1-Grenzwerten rot). Mit dem Band sind alle 2.318 grün.

**Höchstwert bestimmt per Messung** (Lauffenster, gerader Lauf; 1,05 gegen 1,08): Bei 1,08 stellt sich die Streckung ungedeckelt auf 1,07 ein (Rate 1,06–1,07 statt 1,08–1,09). Die Spitzen beim Dribbeln steigen dabei aber: Kniepol 42,1/60,9 → 57,1/72,6°, Fußachse 40,9/60,1 → 55,4/68,9° (spd/tec 16/18), Oberschenkelschritt 14,2/15,4 → 16,9/16,3° je 1/60 s; die Gelenkspitzen schwanken phasenbedingt in beide Richtungen. Für Kniepol- und Fußachsenspitzen gibt es keinen Grenzwert (gegatet ist nur das Kniepolmittel der kontrollierten Fälle); die Wahl **1,05** ist konservativ: etwas höhere Kadenz beim Dribbeln, kürzerer Schritt. Verliert ein Ballführer über etwa 8,2 m/s den Ball, springt die Schrittskala einmal von 1,05 auf bis zu 1,08 (≈ 3 % der vor-/rückwärtigen Fußauslenkung) – Hinweis, keine Grenzwertverletzung.

**Native Körperverläufe** (`v157Move` mit `field`, großes Feld; der schnellste Spieler des Großfeld-Kaders hat spd/tec 16, zusätzlich spd/tec 18 an den Obergrenzen):

| Modus | Tempo | 90 % nach | Halt (Ziel in Bremsdistanz) |
| --- | ---: | ---: | --- |
| Ballführer frei (spd/tec 16) | 8,40 m/s | 0,75 s | 0,70 s / 2,49 m |
| Ballführer frei (spd/tec 18, Obergrenze) | 8,50 m/s | 0,75 s | 0,70 s / 2,56 m |
| Ballführer im Nahbereich 1,41× (16) | 6,57 m/s | 0,60 s | 0,55 s / 1,49 m |
| Eigener Lauf (16) | 9,27 m/s | 0,85 s | 0,75 s / 3,06 m |
| Eigener Lauf (18, Obergrenze) | 9,50 m/s | 0,85 s | 0,75 s / 3,21 m |

Darstellung vorher → nachher (gleiche Größen wie in der B02-Tabelle; Gleiten im Lauffenster in allen Fällen 0,000 m/s):

| Fall | Tempo | Clipwechsel | Rate | Schrittskala | Gleiten Halt | Gelenk Start / Lauf / Halt °/s |
| --- | ---: | --- | --- | ---: | --- | --- |
| Großfeld-Ballführer (16) gerade | 8,40 | 9 → 11 | 1,13 → 1,08 | 1,05 | 0,000 → 0,000 | 1536 / 1301 / 1026 → 1070 / 1436 / 907 |
| … ±45° | 8,40 | 9 → 11 | 1,13 → 1,08 | 1,05 | ≤ 0,095 → ≤ 0,009 | 1536 / 1301 / 1303–1316 → 1070 / 1195 / 1208–1243 |
| … ±90° | 8,40 | 11 → 15 | 1,13 → 1,08 | 1,05 | ≤ 0,007 → ≤ 0,010 | 1536 / 1301 / 1172–1190 → 1070 / 1195 / 1121 |
| … ±135° | 8,40 | 13 → 17 | 1,13 → 1,08 | 1,05 | 0,000 → ≤ 0,002 | 1536 / 1301 / 1201 → 1070 / 1195 / 1241–1261 |
| … 180° | 8,40 | 17 → 21 | 1,13 → 1,08 | 1,05 | 0,012 → 0,007 | 1536 / 1301 / 1302 → 1070 / 1195 / 1338 |
| Großfeld-Ballführer (18) gerade | 8,50 | 9 → 11 | 1,15 → 1,09 | 1,05 | 0,000 → 0,010 | **1609** / 1300 / 1067 → 1085 / 1417 / 973 |
| … ±45° … 180° | 8,50 | 9–17 → 11–21 | 1,15 → 1,09 | 1,05 | ≤ 0,019 → ≤ 0,019 | **1609** / 1289 / 1097–1369 → 1085 / 1417 / 1137–1433 |
| Großfeld-Nahbereich 1,41× gerade | 6,57 | 9 → 9 | 0,89 → 1,04 (`run_fast4`) | 1,00 | 0,001 → 0,024 | 1536 / 1144 / 1002 → 966 / 1178 / 999 |
| … ±45° … 180° | 6,57 | 9–15 → 9–15 | 0,89 → 1,04 | 1,00 | ≤ 0,022 → ≤ 0,002 | 1536 / 1144 / 1166–**1643** → 966 / 1174 / 1160–1291 |
| Großfeld-Läufer (16) gerade / Wenden | 9,27 | 13–24 (gleich) | 1,15–1,16 (gleich) | 1,08 | ≤ 0,03 (gleich) | 1032 / 1251–1256 / 1045–1255 (gleich) |
| Großfeld-Läufer (18) gerade / Wenden | 9,50 | 13–21 (gleich) | 1,18 (gleich) | 1,08 | ≤ 0,05 (gleich) | 1140 / 1321 / 1063–1305 (gleich) |
| Standard-Ballführer 1,50× (7,06) | 7,06 | 9–15 → 11–19 | 0,95 → 0,95 | 1,00 | ≤ 0,058 → ≤ 0,025 | 1553 / 1140 / 1034–1250 → 991 / 1134 / 975–1243 |
| Standard-Nahbereich 1,28× (6,03) | 6,03 | 9–15 (gleich) | 0,81 → 0,96 (`run_fast4`) | 1,00 | ≤ 0,003 → ≤ 0,033 | 1553 / 900–1017 / 730–1204 → 972 / 1065–1088 / 905–1232 |

Das Zwischenband wirkt auch auf dem Standardfeld (gleicher Marker): Die Startspitze der Ballführer sinkt dort von 1.553 auf 972–991 °/s, und Ballführer unter 6,6 m/s zeigen `run_fast4` mit Rate 0,96 statt `running` mit 0,81. Dafür steigt im Nahbereich die Fußachsenspitze im Lauf (ungegatet): Standard 1,28× 30 → 72° (gerade) bzw. 20 → 68° (±45°), Großfeld 1,41× 41 → 71°; die Kniepolspitze 32 → 50° (Standard, gerade). **Verhalten an der Bandgrenze** (Tests): Rampe 6,0 → 7,0 → 6,4 → 6,1 m/s zeigt `run_fast4` → `running` → `running` → `run_fast4`; ein Ballwechsel bei 7,0 m/s wechselt den Clip nicht (mit und ohne Ball `running`); bei 6,5 m/s zeigt ein von unten kommender Ballführer `run_fast4`, ohne Ball `running` (Sprintband) und nach Rückgewinn wieder `run_fast4`; ein von oben kommender Ballführer bleibt auf `running`, zeigt nach einem Ballverlust `running` und nach Rückgewinn `run_fast4` (`CarrierTop` folgt nur dem Ballführer). Die Haltfenster ändern sich phasenbedingt in beide Richtungen. Belastungsprobe (feste Blickrichtung) und Läuferfälle ohne Ball sind unverändert. Alle 2.318 U-1-Grenzwerte sind grün und laufen über die Fixtur in jedem `D6Cli.Tests`-Lauf mit.

**Neu bewertet, offen:** Großfeld-Läufer mit 9,27–9,50 m/s erreichen die Schrittgrenze 1,08 und laufen mit Rate 1,15–1,18 (ohne U-1 1,25). Ein höherer Höchstwert ist nicht gemessen; nach den Ballführerwerten steigen dann Kniepol und Fußachse.

**Echte Großfeld-Partie (Hinweis an SI-5/SI-K).** Neu aufgenommen: 160114 Groß/6 mit allen Paketen einschließlich `field` (Lane A, `work/u1/si3/native132`, 74 s, 1:1). Freie Spieler laufen bis 9,10 m/s (ohne `field` 8,40). Ballführer erreichen dagegen höchstens **7,10 m/s**, genau wie ohne `field`: 34 Bilder desselben Spielers (GER-2:10, spd 16,3 / tec 12,8) liegen auf diesem Plateau. `v157Pace` liefert für ihn in derselben Partie 8,5 m/s (`field` an, extra 0,2; `v158Movement` begrenzt nicht). Die SI-5-Ballführerwerte kommen in dieser Partie also nicht im Bild an. Das Plateau entspricht 5,92 m/s im 68×44-Bildmaß × 1,2. Die Ursache liegt außerhalb der Darstellung und ist nicht untersucht; die Unity-Seite deckt Ballführer bis 8,5 m/s über die Körperfälle ab.

**B05 auf der Feld-Aufnahme** (dieselbe Aufnahme vor/nach der SI-5-Runde): 49 Fußaktionen, davon 9 mit einem Fenster über 1.600 °/s (vorher 9); 65 von 196 Fenstern ändern sich durch die Phasenverschiebung (Rauschen). Höchste Werte: Tackle Feld 2, 69,30 s 6.110 → 4.021 °/s; Pass Feld 5, 3,65 s 3.601 (Anstoß, unverändert); Pass Feld 6, 72,35 s 3.356 (unverändert). r21 12/12.

## Foulfenster (SI-0, 1,8 s)

Gemessen auf der SI-Aufnahme 160114 Groß/6 mit zwei Fouls (18,05 s und 27,65 s, je 1,8 s), Messfenster vom ersten bis zum letzten Foulbild (Täter bis 1 s danach, wie die B11-Messung); „gleichmäßig“ ist der Stand vor U-1 (`progress · 2,7` mit `progress = age / 1,8`, identisch mit three.js):

| Größe | 2,7 s (alte Aufnahmen, Referenz) | 1,8 s gleichmäßig (vor U-1) | 1,8 s nur Liegen gekürzt (verworfen) | 1,8 s U-1 |
| --- | ---: | ---: | ---: | ---: |
| Opfer: Gelenk °/s / Becken m/s | 2298 / 3,06 | 2309 / 4,48 | 2770 / 4,74 | 2309 / 4,48 |
| Täter 27,65 s: Gelenk / Becken | – | 878 / 0,94 | – | 878 / 0,77 |
| Täter 18,05 s: Gelenk / Becken | – | 499 / 1,364 | – | 498 / 1,369 |

**Beim Opfer ändert U-1 nichts:** Die Darstellung war schon vor U-1 eine gleichmäßige Stauchung; 2.309 °/s und 4,48 m/s sind vor und nach U-1 identisch, U-1 liest die Dauer nur ausdrücklich aus der Foulaktion. **Geändert ist nur der Täter** (Becken 0,94 → 0,77 m/s bzw. 1,364 → 1,369 m/s, Gelenke gleich). Fallen, Liegen und Aufstehen laufen vollständig in 1,8 s; der Täter steht am Ende des Fensters (Gewicht 0, Ausfallschritt 0). Die verworfene Variante kürzte nur das Liegen und spielte Fallen und Aufstehen 1,21-fach; `foul_fall_meshy` bewegt sich nach dem Bodenkontakt weiter, das gedrängte Liegen erzeugte die höheren Werte. Die B11-Grenzwerte (Schweben, Arme, Gewichtssumme) bestehen in allen Foulfenstern. Offen (in B05 geführt): Das gestauchte Aufstehen hebt die Spitze der vertikalen Beckengeschwindigkeit des Opfers von 3,06 m/s (2,7 s) auf 4,48 m/s (1,8 s), vor und nach U-1 gleich; ein kürzerer Aufstehclip wäre ein Assetauftrag. Die Sichtflächenprüfung meldet in beiden 1,8-s-Opferfenstern dieselbe Low-Poly-Abweichung wie vor U-1 (Körper 1,9 mm tiefer als die Release-Haut beim Aufstehen; die gleiche Klasse ist für Release 131 mit 2,7 mm geführt).

## B05: Tacklewinkel, Passkontakte, Fußkontakte

**Identische Eingaben (alte Aufnahmen, Release 132).** `motion-160112-standard-5` und `motion-160114-large-6` aus `fix/r132-anim` (Seeds wie R20/R21). Mit U-1 sind alle Messgrößen, R132-Fußaktionsfenster und die Sichtflächenprüfung **bitgleich** zum Stand vor U-1 (die Bilder tragen keinen Marker). Die bekannten Messfehler sind damit unverändert erhalten und neu gemessen:

| Fenster | Wert vor U-1 | mit U-1 |
| --- | ---: | ---: |
| Tackle 160114 Feld 11, 68,85 s (Kontakt, LeftLeg) | 9.180 °/s | 9.180 °/s |
| Tackle 160112 Feld 8, 7,80 s (Kontakt) | 7.970 °/s | 7.970 °/s |
| Tackle 160112 Feld 7, 39,10 s (Eintritt) | 4.398 °/s | 4.398 °/s |
| Pass 160112 Feld 8, 69,75 s (Eintritt) | 2.144 °/s | 2.144 °/s |
| Pass 160114 Feld 5, 69,10 s (Eintritt) | 1.893 °/s | 1.893 °/s |
| Becken Täter 160112 Feld 11, 52,10 s | 1,566 m/s (Grenze 1,5) | 1,566 m/s |

29 von 368 Fußaktionsfenstern über 1.600 °/s, alle innerhalb ihrer R131-Sperre (368/368); r21: 54/55 (rot bleibt das Becken 1,566 m/s).

**Ursachen (Traces `-d6trace`, offen).** (1) Tackle 9.180 °/s: Während des Lead-Reach (0,033 und 0,017 s vor dem Kontakt) und im Kontaktbild entsteht die Spitze in der letzten Stufe, der Kontaktlösung des linken Fußes; der Kniewinkel springt 47° → 97° → 61° → 167°, der gewählte Knie-Swivel weicht vom Pol ab (167° gegen −124°). (2) Tackles 7.970 und 4.398 °/s: Der Tackle-Clip `receive_ground_meshy` tritt im Kontaktbild mit Gewicht 1 aus Brems-/Sprintschritt ein (Spitze schon in Stufe 1, 9.510 bzw. 8.605 °/s), im nächsten Bild folgt die Kontaktlösung (7.372 °/s). (3) Pässe 69,75/69,10 s: Eintritt aus `passReady`, Oberschenkel. Keine dieser Stellen ist durch U-1 berührt.

**Neue SI-Aufnahmen.** 114 Fußaktionen; die Streckung verschiebt die Schrittphase, 202 von 456 Fenstern ändern sich in beide Richtungen. Aktionen mit einem Fenster über 1.600 °/s: 32 vor, 30 mit U-1 – Rauschen der Phasenverschiebung, keine Verbesserung. Ebenso neutral zu lesen: Tackle 160112 Feld 4, 36,45 s 6.093 → 7.127 °/s, Tackle 160112 Feld 3, 34,75 s 6.280 → 5.920 °/s; Annahme 160114 Feld 11, 31,65 s 4.966 °/s (unverändert), Pass 160112/160114 Feld 5, 3,65 s 3.601 (unverändert, Anstoß). Gleiches Muster wie oben (Tackle aus dem Sprint, Lead-Reach). Fußkontakte und Standfußtransfer der kontrollierten Abläufe (Stütz-, Kontakt-, Kontinuitäts-, r15-, r20-Gates) sind unverändert grün: 2.020/2.020, 675/675, 285/285, 20/20, r15 341/342 (der eine bekannte R18-Lock, nicht über R18), 642/642.

**Offen bleibt (ausdrücklich):** Tacklewinkel aus dem Sprint (Clip-Eintritt mit vollem Gewicht, Knie-Swivel in der Kontaktlösung), die beiden Passeintritte, das Täterbecken 1,566 m/s beim Foul 52,10 s, die Beckenspitze des Opfers beim gestauchten Aufstehen (4,48 m/s bei 1,8 s gegen 3,06 m/s bei 2,7 s), Ballführer über 7,4 m/s ohne Streckung, die Rückwärts-Kadenzgrenze in der Belastungsprobe und der kurze Gehclip beim harten Antritt. Ein vollständiger Animationsabschluss ist nicht Teil von U-1.

## Teleport-Neustart (Freistoß)

Nutzerentscheidung: Der Freistoß-Teleport wird nicht kaschiert; eine kurze Überblendung unter 10 m ist zulässig, die Schwelle von `WorldViewPlayback.Cut` bleibt unverändert. SI-0 setzt die Freistoßformation im Foulbild und das Foulpaar am Ende der Sperre; die SI-Aufnahme 160114 zeigt Sprünge bis 27,9 m (harter Schnitt) und 9,07 m (Überblendung im Bildintervall).

- `WorldViewTests` (Unity, echte `WorldViewPlayback`): 27,9 m → `Cut`, sofort das neue Bild; 9,07 m → kein Schnitt, innerhalb des 0,05-s-Bildes gezeigt, nie extrapoliert; nach einer längeren nativen Lücke höchstens 0,1 s; `FootballLocomotion` setzt bei der Versetzung zurück (kein 181-m/s-Schritt, kein Bremsclip).
- `work/check-unity-freekick-u1-v183.cjs` (Lane B, Port 4259, echtes Unity-WebGL des veröffentlichten Builds, neue Partie mit allen Standardpaketen): Grätsche und Foul 49,85 s, Foulbilder ab 49,90 s, die Formation springt im Bild 49,95 s (acht Spieler, bis 15,0 m, Schnitt), das Foulpaar am Sperrende im Bild 51,75 s (17,7 m, Schnitt), Freistoßpass 52,90 s. Unity bestätigte jedes der Bilder einzeln; in der ersten danach gerenderten Projektion zeigen alle versetzten Spieler `idle` mit Tempo 0. Bilder vor/nach dem Sprung in `work/u1/freekick/`. Diese Aufzeichnung enthält nur harte Schnitte (14,99 und 17,67 m); der Fall unter 10 m (Überblendung) ist nur im C#-Test `WorldViewTests` abgedeckt.
- `work/platform/qa/check-world-unity.cjs` (Lane B, `D6_QA_PORT=4260`): 21 Prüfungen grün, keine Seitenfehler. Die Vollpartie (neue Partie, alle Standardpakete, 2:0, 2.636 Schritte, Halbzeit) enthält genau ein Foul mit Freistoß und ist native und in Unity identisch (Ereignisse, Statistik, Karriere, Finanzen). Der Bericht nennt jetzt die Foulzahl der Paritätspartie (`parity.fouls`).
- Beide Browserläufe prüfen den **vorhandenen** WebGL-Build (ohne U-1-Code). Neuer Build und Geräteabnahme stehen bei der Veröffentlichung aus.

## Prüfungen

Unity-Kopie `G:/unity/Doppel6-Fix-R132` (6000.6.4f1), nach jedem Sync mit `diff` gegen alle 75 Quelldateien geprüft (identisch).

| Prüfung | Ergebnis |
| --- | --- |
| `D6Cli.Tests` (alle Suiten, Natural-Motion-Gates erzwungen) | grün. NaturalMotionGates 2.020/2.020, Stütz 675/675, Kontakt 285/285, Kontinuität 20/20, r15 341/342 (der bekannte R18-Lock, nicht darüber; wie Release 132), r20 642/642, r21 11/11. DuelTests 57 (Release 132: 49), WorldViewTests und LocomotionTests mit den neuen U-1-Prüfungen, U-1 873/873 aus der Fixtur (Korrekturrunde). |
| `D6Cli.NaturalMotion` alte Aufnahmen (`native132`, `-d6pictures 1600`) | r132 368/368; r21 54/55 (rot: Becken 1,566 m/s, unverändert); Sichtfläche 7 Abweichungen wie vor U-1; alle Messgrößen bitgleich zum Stand vor U-1. |
| SI-5-Runde: `D6Cli.Tests` | grün; NaturalMotionGates 235 Fälle, **U-1 2.318/2.318** (alle Körperfälle beider Feldgrößen aus der Fixtur), übrige Werte unverändert (2.020/2.020, 675, 285, 20, r15 341/342 wie Release 132, 642, r21 11/11); DuelTests 57. |
| SI-5-Runde: alte Aufnahmen (`native132`) | r132 368/368, r21 54/55 (Becken 1,566 m/s), alle Messgrößen bitgleich zum Stand vor U-1. |
| SI-5-Runde: Feld-Aufnahme 160114 und Körperfälle | U-1 2.318/2.318, r21 12/12, r132 185/196 (11 Fenster über 1.600 °/s ohne R131-Sperre, Bericht). |
| SI-5-Runde: `check-old-matches-v183` / `-v182` (Basisbaum `e4e531c0`), Vertragstest | grün (340 / 158 Szenen) |
| `D6Cli.NaturalMotion` SI-Aufnahmen und Körperfälle (vor der SI-5-Runde) | U-1 873/873; r21 44/44; r132 420/456 (36 Fenster über 1.600 °/s ohne R131-Sperre: Bericht, keine Sperre für neue Aufnahmen); Sichtfläche 2 Opferbilder (siehe Foulfenster). |
| `work/check-unity-freekick-u1-v183.cjs` (Lane B) | 5/5 |
| `work/platform/qa/check-world-unity.cjs` (Lane B) | 21/21 |
| `check-old-matches-v183.cjs` | grün, 340 Szenen |
| `check-old-matches-v182.cjs work/tmp-base182` (Basisbaum `e4e531c0`) | grün, 158 Szenen |
| `node work/build.cjs` | grün (Artefakte zurückgesetzt) |
| Workflow-Block „Spieltests ausführen“ (114 Befehle, Node 24) | vor der SI-5-Runde 114/114 grün (41 min); SI-5-Runde (nach dem Merge von `e479f640`) 114/114 grün (39 min); danach jeweils `git checkout -- outputs docs/spieler-nutzer-rig` |

## Reproduktion

```bash
N=C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe
$N work/capture-native-body-u1-v183.cjs          # schreibt die versionierte Fixtur (bytegleich)
$N work/capture-native-motion-r132.cjs --port 4258 --out work/u1/si2/native132     # SI-Aufnahmen mit Marker
$N prototypes/match-engine-unity/sync-unity.cjs G:/unity/Doppel6-Fix-R132          # danach diff gegen das Projekt prüfen
unity run G:/unity/Doppel6-Fix-R132 --no-tail -- -nographics -executeMethod D6Cli.NaturalMotion \
  -d6output work/u1/si2 -d6label final-si -d6gates report -d6only "native132|^body-" -d6pictures 1600 -d6repo <worktree> -logFile <log>
$N work/summarize-u1-body-v183.cjs work/u1/si2/final-si
$N work/summarize-native-motion-r132.cjs work/u1/old/final-old 30                  # alte Aufnahmen aus fix/r132-anim
$N work/check-unity-freekick-u1-v183.cjs --port 4259 --out work/u1/freekick
```

## WebGL-Build und Übergaben

- **Neuer WebGL-Build:** für diese Prüfung nicht nötig (alle Darstellungsmessungen im Unity-Editor auf identischen Eingaben; die WebGL-Aufzeichnung nutzt den vorhandenen Build, dessen Schnitt-/Überblendungslogik unverändert ist). Für die Auslieferung der U-1-Änderungen (Foulfenster, Schrittstreckung) braucht die Integration bzw. Veröffentlichung einen neuen Build mit Unity-Metadaten und Digestprüfungen; der vorhandene Build ignoriert `siRevision` und zeigt neue Partien wie bisher.
- **SI-2/SI-K:** Nahbereichstempo des Ballführers gemessen 6,03 m/s (spd/tec 14, = 7,06 · 1,28 / 1,50); Ursache der 5,80 m/s der SI-2-Tabelle unklar.
- **SI-5/SI-K:** Ballführer erreichen in der echten Großfeld-Partie nur 7,10 m/s (Plateau, mit und ohne `field`), obwohl `v157Pace` 8,5 m/s liefert; Ursache prüfen (Abschnitt „Großes Feld (SI-5)“).
- **SI-K/Animation:** offene B05-Punkte oben; eine Tackle-Überblendung aus dem Sprint und eine Swivel-Bindung der Kontaktlösung wären die nächsten Hebel.
