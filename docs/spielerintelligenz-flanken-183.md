# Spielerintelligenz 183: Zusatzpaket „Flanke in den Raum“ (B22)

Stand: 16. Oktober 2026. Branch `feat/si-crossing` (Worktree `work/si-crossing`), abgezweigt von SI-K `d7857cd5` + `integration/si-r133` (`0c2369ad`, später `45627172` eingemischt). Auftrag: Nutzerentscheidung „Flanken und Fernschüsse 16. Oktober 2026“ ([Entscheidungen](entscheidungen.md)), Übergabe in [SI-K](spielerintelligenz-sik-calibration-183.md) (Abschnitt „Übergabe an das Zusatzpaket“), Bugliste B22. Keine Veröffentlichung, keine Fußversion, kein WebGL-Build. Abnahme gepaart gegen Reihe B2 von SI-K (gleiche Seeds).

## Befund vor dem Paket

Reihe B2: 0 Spielflanken je Partie. Ursachen (SI-K-Übergabe, hier bestätigt): SI-1 flankte nur auf die aktuelle Position eines Mitspielers innerhalb 16 m; die Abseitsklammer hielt Angebote an der Abwehrlinie; `v183CrossEstimate` rechnete ohne den Lauf des Empfängers. Zwei weitere Ursachen kamen in den Messsonden dieses Pakets hinzu:

- Beim breiten Ball im letzten Drittel standen die Mitspieler meist 25–33 m vor dem Tor, also 8–15 m hinter der Abseitslinie (Median 17 m), gebunden an Nachlauf-, Halte- oder Unterstützungsangebote. Ein Boxpunkt war unerreichbar, bevor der Ballführer (nach 1–2 s in der Zone) abspielte.
- Der Landeanteil der Schätzung verglich die Flankenstreuung (±2–3 m) mit der festen Reichweite (≈1,2–1,5 m). Tatsächlich läuft der Anwärter im Luftplan (`v122PlanAir`) zum echten Landepunkt; erreichbar ist alles innerhalb von Laufstrecke plus Reichweite.

## Entwurf

Keine neue Paketkennung: Die Änderungen liegen in den besitzenden Paketen SI-1 (`dist/match-si-options-v183.js`), SI-2 (`dist/match-si-offball-v183.js`) und SI-7 (`dist/match-si-setplay-v183.js`) mit eigenen Parametern (Schlüssel `cross*`/`space*`). Partien ohne Marker und mit Kennung 182 durchlaufen die unveränderten Basisfunktionen; der Paketzustand ist Plain-Data in `attackFlow`.

### SI-7: Ausführung und Schätzung

- `v55HighPass(passer, receiver, {cross:true, space:{x,y}})`: Der Ball zielt auf den Raumpunkt statt auf den Empfänger, geflogen mit `spaceCrossSpeed` (16 m/s wie Ecken statt 20 m/s), damit der Läufer ankommt. Abseits wird wie bei jedem hohen Ball mit der Momentaufnahme **beim Abspiel** beurteilt (`v55OffsideSnapshot`); der Läufer darf die Box erst danach betreten. Fehlerstreuung, Block, Luftduell, Kopfball/Volley, Ablage und Annahme bleiben die SI-7-Modelle.
- Plain-Signal `attackFlow.crossRun = {crosserId, runnerId, x, y, at, kickAt, until, kicked}`: SI-1 schreibt es bei der Entscheidung, SI-7 setzt `kicked` beim Abspiel und entfernt es bei der Landung. Im Luftplan ist der signalisierte Läufer der erste Anwärter seines Teams (er hat die Flanke vor dem Abspiel gelesen).
- `v183CrossEstimate(m, p, point, {runner, space:true, lead, adapt})`: Laufmodell `v183RunCover` (aktuelle Annäherungsgeschwindigkeit, native Beschleunigung `(6,2+0,08·spd)·1,4`, Planungstempo `(3+0,14·spd)·approachPace`, Reaktion `spaceReaction` 0,1 s). Landeanteil = Anteil des Fehlerquadrats um den Punkt innerhalb der Scheibe „Laufstrecke + Reichweite“ um den Läufer (Raster `spaceLandGrid` 9×9), mal `(1−große Fehler)`. Duell mit Restanteil und Annäherungstempo beider Seiten. Ein Punkt jenseits der Laufstrecke wird standardmäßig auf den Laufweg zurückgezogen (`landing` im Ergebnis, bis zu sechs Schritte, weil ein näherer Punkt den Flug verkürzt). `lead` zählt zur Laufzeit des Läufers, nicht zum Flug und nicht zum Verteidiger. Schätzungen ohne `space` sind unverändert.

### SI-1: Option und Startsignal

- Je Mitspieler (nicht abseits, ≤`crossRunnerRange` 28 m vor dem Tor, ≤`crossRunnerWide` 14 m seitlich) und je Boxpunkt `crossSpots` (naher Pfosten 4/6, Elfmeterpunkt 0/11, zweiter Pfosten −4/7 m, ballseitig) eine Option `cross` mit `space:true`; behalten wird je Läufer der beste Punkt. Wert = Ankunft × max(Besitzwert am Punkt, Kopfballwert) × Fokus × Flügelanweisung, Verlust wie bei Flanken; `crossSpaceGain` 1.
- **Wartezeit (Startsignal):** Liegt der Punkt jenseits der Laufstrecke des Läufers im Flug, nimmt die Option die Wartezeit, die ihn mit `crossLeadSlack` 1,5 m Reserve hinbringt, höchstens `crossLead` 1,5 s. Die Wartezeit mindert den Gewinn e-fach je `crossLeadTau` 3 s (der Ballführer treibt weiter, anders als eine Drehung auf der Stelle; `delayed()` behält den Dreh- und Pressanteil). Bei Ausführung mit Wartezeit: Signal schreiben, Ballführer trägt 4 m Richtung Grundlinie, Entscheidung ruht bis `kickAt`; dann prüft `v183OptCrossRun` Abseits und Läufer, schätzt neu (Landepunkt angepasst) und flankt nur bei Ankunft ≥`crossKickMin` 0,12, sonst entscheidet der Ballführer neu (Protokoll `cross-run` mit `abort`).
- Ohne Wartezeit flankt die Option sofort. Eine eingereihte Drehung (`v157QueueTurn`) wird bei Raumflanken nicht durch einen Gegner am Punkt abgebrochen (der Block und das Duell entscheiden), Abseits bricht sie weiterhin ab. Nur mit aktivem Paket `setplay`; `crossSpace` 0 schaltet die Option ab.

### SI-2: Flankenläufer und Klammer

- **Flankenläufer:** Ball innerhalb `crossRunRange` 36 m und breit (>`crossRunWide` 7 m) oder innerhalb `crossRunDeep` 30 m: Beim Eintritt startet sofort ein neuer Angebotszyklus; bis zu `crossRunners` 2 Mitspieler ohne Deckungsaufgabe (bestes Boxprofil × Luftspiel, näher am Tor) erhalten `crossRunBonus` 6 auf ihre Boxpunkte, ein einfacher Nachlauf wird ihnen gelöst, ein Doppelpass bleibt. Der Zykluseintritt wird je Ballführer vermerkt (`offball.crossZoneOwner`) und beim Verlassen gelöscht.
- **Signalisierter Läufer:** Jeden Tick zeigt sein Angebot auf den Raumpunkt (Muster `cross-run`, Lauftempo; Zielspieler als `support`), solange der Flankengeber den Ball hält oder die Flanke fliegt. Bis zum Abspiel hält ihn die Abseitsklammer an der Linie; während des Flugs ist sie für ihn gelöst (die Momentaufnahme des Abspiels gilt). Die Klammer für alle anderen Angebote ist unverändert. `cross-run`-Angebote überleben den Angebotszyklus wie Nachläufe.
- Besitzwechsel löscht `attackFlow.crossRun`; abgelaufene Signale löscht SI-1.

### Parameter (Vorgaben neuer Partien)

| Paket | Schlüssel | Wert | Bedeutung |
| --- | --- | ---: | --- |
| setplay | `spaceCrossSpeed` | 16 | Fluggeschwindigkeit der Raumflanke (m/s) |
| setplay | `spaceReaction` | 0,1 | Reaktion des signalisierten Läufers (s) |
| setplay | `spaceSlackMax` | 2,5 | Reserve-Laufstrecke für den Duellanteil (m, Deckel) |
| setplay | `spaceLandGrid` | 9 | Raster je Achse für den Landeanteil |
| options | `crossSpace` | 3 | Boxpunkte je Läufer (0 = aus) |
| options | `crossSpots` | [[4,6],[0,11],[−4,7]] | Boxpunkte [seitlich ballseitig, Tiefe] m |
| options | `crossRunnerRange` / `crossRunnerWide` / `crossRunnerBack` | 28 / 14 / 2 | Läufer: Torabstand, Breite, Punkt höchstens 2 m weiter vom Tor als der Läufer |
| options | `crossLead` / `crossLeadSlack` / `crossLeadTau` | 1,5 / 1,5 / 3 | längste Wartezeit (s), Reserve (m), Abzinsung der Wartezeit (s) |
| options | `crossKickMin` | 0,12 | Mindestankunft beim Abspiel nach Wartezeit |
| options | `crossSpaceGain` | 1 | Gewichtung des Optionswerts |
| offball | `crossRunRange` / `crossRunWide` / `crossRunDeep` | 36 / 7 / 30 | Zone der Flankenläufer (m) |
| offball | `crossRunners` / `crossRunBonus` | 2 / 6 | Anzahl und Bonus der Flankenläufer |

Gespeicherte 183-Partien ohne diese Schlüssel lesen die Vorgaben (es gibt keine Nutzerspielstände mit 183).

## Messung

Harness und Auswertung wie SI-K (`work/measure-si-calibration-v183.cjs`, `work/table-si-calibration-v183.cjs`), Lanes A (4250) und C (4262), Sperren und Einträge in `work/si-integration/outputs/si183/queue.log`. Die Messhülle exportiert zusätzlich lesend die Protokolleinträge `cross`, `cross-block`, `cross-run`, `air`, `air-finish` (`extras.sik.air`); daraus stammt die Ausgangsverteilung der Raumflanken. Alle Reihen: Uhr 0,385 per Vorgabe, Seed-Satz `p01r132`, soweit nicht anders genannt 48 Vereine × 2 Feldgrößen (96 Partien, Protokollgrenze 40.000).

### Weg zum Mechanismus (Sonden in Vollpartien)

1. Erste Fassung (Raumflanke auf feste Boxpunkte, Läufer läuft erst mit dem Abspiel): 0,04 Spielflanken je Partie (96 Partien). Sonde: In 80 Entscheidungen in der Flankenzone stand in 10 ein Mitspieler innerhalb 26 m; alle übrigen Mitspieler 25–33 m vor dem Tor hinter der Abseitslinie (Median 17 m).
2. Mit Flankenläufern in SI-2 (sofortiger Zyklus beim Eintritt in die Zone) und angepasstem Landepunkt: Läufer erhalten die Boxangebote, erreichen die Linie aber 1–2 s nach dem Eintritt; der Ballführer spielte vorher ab. Ankunftsschätzung 0,1 (Landeanteil 0,1–0,2 bei Reichweite ≈1,3 m gegen Streuung ±2,3 m).
3. Mit Wartezeit (Signal) und dem Landeanteil über die erreichbare Scheibe: Raumflanke in 12 von 29 Zonenentscheidungen angeboten, 4-mal beste Option; 6 Raumflanken in der Sondenpartie.

### Rauchserien und Varianten (96 Partien, Vereine 1–48, gepaart gegen Reihe B2 bzw. untereinander)

| Reihe | Parameter | Spielflanken | angekommen | Kopf-/Volleyschüsse (Tore je Schuss) | Schüsse | Tore | Dauer all-inclusive |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| B2 (Basis, gleiche Vereine) | SI-K | 0 | – | 0,64 (35 %) | 14,2 | 3,8 | 5,02 |
| S2 (Vereine 1–96, 192 Partien) | Mechanismus, Vorgaben | 2,18 (Standard 2,90 / groß 1,46) | 38 % | 1,15 (45 %) | 13,1 | 3,62 | 4,98 |
| V2 | `spaceCrossSpeed` 14 | 2,88 | 38 % | 1,26 (59 %) | 13,2 | 4,17 | – |
| V3 | `crossKickMin` 0,25 | 2,35 | 40 % | 1,31 (43 %) | 13,7 | 3,91 | – |
| V4 | `crossLead` 2, `crossLeadSlack` 3, `crossKickMin` 0,2 | 2,71 (Standard 3,42 / groß 2,00) | 41 % (Spiel 44 %) | 1,29 (54 %) | 13,0 | 3,98 | 5,06 |
| **V5 = Vorgaben** | V4 + `spaceCrossSpeed` 14 | **2,80** (Standard 3,23 / groß 2,38) | **46 %** (Spiel 50 %) | 1,47 (50 %) | 13,2 | 3,83 | 5,04 |

Gepaart V5 gegen S2 (96 Paare): Spielflanken +0,65 ±0,33, angekommene +0,54 ±0,37, Kopf-/Volleyschüsse +0,30 ±0,29, Schüsse −0,36 ±0,53, Tore +0,05 ±0,42. Ausgang der Raumflanken in V5: Läufer gewinnt 57 %, Verteidiger 24 %, unerreicht 19 %; 60 % der gewonnenen Bälle werden direkt abgeschlossen. Die Wartezeit (Deckel 2 s, Reserve 3 m) und der langsamere Ball bringen den Läufer häufiger an den Landepunkt; der Abstand beim Abspiel bleibt bei 6–7 m, weil die Klammer ihn bis zum Abspiel an der Linie hält und der Rest des Wegs im Flug liegt.

Gepaart S2 gegen B2 (192 Paare, ±95 %): Spielflanken +2,18 ±0,24, angekommene Flanken +0,64 ±0,22, Kopf-/Volleyschüsse +0,43 ±0,20, Schüsse −1,13 ±0,46, Tore +0,03 ±0,32, Dauer +0,02 ±0,10 min, Ecken −0,21 ±0,28.

Ausgang der Raumflanken (Protokoll, V2/V3): Läufer gewinnt die Landung 50–51 %, Verteidiger 24–28 %, unerreicht 22–25 %, Block/Aus <1 %. Vom gewonnenen Ball wird 55–57 % direkt abgeschlossen; die übrigen gehen in Ablage oder Annahme, wovon ein Teil verspringt (deshalb „angekommen“ 38–42 % < gewonnen 50 %). Abstand des Läufers zum Punkt beim Abspiel: Median 6–7 m bei 1,2–1,3 s Flug; 21–27 Abbrüche je 96 Partien wegen zu geringer Ankunft beim `kickAt`, 9–11 wegen Abseits.

### Abnahmereihe (576 Partien, gepaart gegen Reihe B2)

96 Vereine × 2 Feldgrößen × 3 Seed-Sätze (`p01r132`, `si183b`, `si183c`), Vorgaben V5 ohne Überschreibungen, Protokollgrenze 40.000, Lanes A und C. 0 Ausfälle, 0 Engine-Fehler, keine Pausenticks, `dist` unverändert. Läufe `b22-f-trace40000`, `b22-f-si183b-trace40000`, `b22-f-si183c-trace40000`.

| Kennzahl | B2 | **B22 beide** | Standard | groß | Ziel | |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| Spielflanken je Partie | 0 | **2,71** | 3,49 | 1,94 | ≥2,0 | ✓ (groß knapp darunter) |
| angekommen: Spielflanken (Ledger) / alle Flanken (Motorzähler) | – / 48 % | **46 % / 43 %** | 47 % / 44 % | 43 % / 41 % | ≥45 % | ✓ knapp / ✗ (2 Punkte) |
| Kopf-/Volleyschüsse (Tore je Schuss) | 0,64 (35 %) | **1,34** (54 %) | 1,65 | 1,03 | ≥0,6 | ✓ (Torquote hoch, siehe Risiken) |
| Dauer all-inclusive (min) / 4–6 min / kürzeste | 5,02 / 90 % / 3,57 | **5,05** / 89 % / 3,35 | 5,11 / 89 % | 4,99 / 89 % | 4,8–5,2; ≥85 %; ≥3,7 | ✓ / ✓ / ✗ (vorbestehend, 0:0-Partien) |
| Schüsse / Anteil 10–18 | 14,15 / 82 % | **12,84** / 80 % | 13,35 | 12,33 | 12–16; ≥45 % | ✓ |
| aufs Tor | 51 % | 52 % | 53 % | 52 % | ≥38 % | ✓ |
| Tore (Streuung) | 3,84 (2,26) | **3,91** (2,20) | 4,15 | 3,68 | 3–5, ≈4 | ✓ |
| Tore je Schuss | 26,7 % | **30,1 %** | 30,6 % | 29,4 % | 25–32 % | ✓ |
| 0:0 / ≥7 Tore | 2,6 % / 12,8 % | **3,6 % / 13,5 %** | 3,5 / 17,4 % | 3,8 / 9,7 % | ≤6 %; 5–15 % | ✓ |
| Favorit ≥1 Punkt: Sieg / Remis / Niederlage | 78 / 14 / 8 % | **85 / 9 / 6 %** | 84 / 10 / 7 % | 86 / 9 / 5 % | rund 65 % (Grenze ≥62 %) | ✓ Grenze; Wunsch weiter verfehlt, Anstieg +7 Punkte |
| Tordifferenz je Stärkepunkt | 0,86 | 0,90 | 0,96 | 0,85 | ≥0,35 | ✓ |
| Verhältnis Abschluss ≥14 / <10 | 2,14 | 1,80 | 1,86 | 1,73 | ≥1,8 | ✓ (knapp) |
| Torwartabstand | 14,3 | 13,7 | 13,1 | 14,4 | ≥10 | ✓ |
| Fernschüsse Standard: Anteil / von Abschluss ≥13 | 13,6 / 92 % | – | **16,1 / 94 %** | 32,7 / 52 % | 12–20 %; ≥75 % | ✓ |
| Ecken | 1,56 | 1,45 | 1,60 | 1,31 | 1,2–3,0 | ✓ |
| Abprallerschüsse ≤5 s | 0,62 | 0,47 | 0,49 | 0,45 | ≥0,3 | ✓ |
| Freistöße | 3,24 | 3,38 | 3,90 | 2,85 | ≤4,5 | ✓ |
| Großes Feld / Standard: Schüsse / Tore | 90,3 / 89,6 % | **92,4 / 88,7 %** | | | ≥85 % | ✓ |
| Zonenzeit ≤22 m (s je Team) | 3,93 | 4,25 | 4,80 | 3,70 | groß ≥2,7 | ✓ |

Gepaarte Differenzen gegen B2 (576 Paare, ±95 %): Spielflanken +2,71 ±0,15, angekommene Flanken +1,05 ±0,14, Kopf-/Volleyschüsse +0,71 ±0,12, Schüsse −1,31 ±0,27, aufs Tor −0,43 ±0,26, Tore +0,08 ±0,19, Dauer all-inclusive +0,04 ±0,06 min, Ecken −0,11 ±0,15, Abprallerschüsse −0,15 ±0,09, Zonenzeit +0,31 ±0,16 s, Fouls +0,13 ±0,20, Frische Feldspieler −0,33 ±0,20. Die Schüsse sinken, weil Raumflanken Angriffe ersetzen, die vorher in Spielzugschüsse mündeten; die Tore bleiben gleich, weil Kopfbälle aus 6–8 m häufiger treffen.

Je Seed-Satz (p01r132 / si183b / si183c): Spielflanken 2,74 / 2,61 / 2,79; angekommen (Spiel) 49 / 46 / 43 %; Kopf-/Volleyschüsse 1,35 / 1,38 / 1,30; Tore 3,76 / 3,93 / 4,06 (gepaart +0,16 ±0,32 / +0,21 ±0,32 / −0,14 ±0,37); Schüsse −1,36 / −1,10 / −1,47; Favorit Sieg 88 / 79 / 88 % (B2 75 / 78 / 82 %); Dauer 4,99 / 5,08 / 5,09 min.

Ausgang der 2,48 Raumflanken je Partie (Protokoll, 576 Partien): Läufer gewinnt die Landung 54 %, Verteidiger 24 %, unerreicht 21 %, Block/Aus unter 1 %. 61 % der gewonnenen Bälle werden direkt abgeschlossen (57 % davon kommen zum Schuss). Je Partie 3,1 Abspiele nach Wartezeit, 0,27 Abbrüche wegen Abseits beim `kickAt` und 0,23 wegen zu geringer Ankunft. Abstand des Läufers zum Landepunkt beim Abspiel: Median 7,1 m, Flug 1,36 s, Landefehler Median 2,7 m, Duellchance 0,43.

**Favoriten (Stärkeabstand ≥1):** Sieg 85 % gegen 78 % in B2, Remis 9 % (14 %), Niederlage 6 % (8 %). Je Abstand (Standard / groß): 0–1 Punkt 51 / 41 %, 1–2 Punkte 71 / 77 %, 2–3 Punkte 84 / 81 %, ≥3 Punkte 93 / 96 % (B2: 1–2 Punkte 66 / 57 %, ≥3 Punkte 92–94 %). Das Paket stärkt die Favoriten, weil Flanke, Lauf und Kopfball an Pass/Technik, Luftspiel und Tempo hängen und die Streuung der Ausführung die stärkere Seite seltener trifft. Das gehört zur nächsten Kalibrierungsrunde (Wunsch rund 65 %); hier wurde nicht darauf gestellt.

### Abnahme

| Ziel | Ergebnis | |
| --- | --- | --- |
| Spielflanken ≥2,0 | 2,71 (Standard 3,49, groß 1,94) | ✓ (Mittel); groß 0,06 darunter |
| angekommen ≥45 % | Spielflanken 46 % (Ledger: erstes eigenes Ereignis nach der Landung), alle Flanken 43 % (Motorzähler , B2-Definition; Ecken unverändert, Ledger 47 % gegen 49 % in B2). Der Motorzähler lässt gewonnene Landungen aus, deren Annahme verspringt; bei Raumflanken sind das rund 3 Punkte. | ✓ knapp / ✗ (2 Punkte) |
| Kopf-/Volleyschüsse ≥0,6 | 1,34 | ✓ |
| Tore 3–5, ≈4; 0:0 ≤6 %; ≥7 Tore 5–15 % | 3,91; 3,6 %; 13,5 % | ✓ |
| Schüsse 12–16; Tore je Schuss 25–32 % | 12,84; 30,1 % | ✓ |
| Dauer 4–6 min all-inclusive ≥85 %, Uhr 0,385 gemeinsam | 5,05 min, 89 %; Rate unverändert | ✓ |
| Großes Feld ≥85 % von Schüssen/Toren | 92,4 / 88,7 % | ✓ |
| Favoriten (Bericht) | 85 % Sieg (+7 Punkte gegen B2) | Information für die Kalibrierung |

## Prüfungen

Node 24 (`C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`), Stand des Abschlusscommits.

- **Mechanismustest** `node work/test-si-crossing-v183.cjs` (10 Prüfungen, Standard und großes Feld): Parameter registriert; keine Raumflanke mit `crossSpace` 0 oder Paket `setplay` aus; Schätzung mit Laufweg über dem stehenden Empfänger, unerreichbarer Punkt 0 bzw. zurückgezogen; Optionsliste mit Raumflanke je Läufer auf einen Boxpunkt; Ausführung (Flug zum Punkt, Läufer erster Anwärter, betritt die Box erst nach dem Abspiel, `crossRun` nur während des Flugs, Ledger `cross`); Abseits beim Abspiel wird gepfiffen; Signal mit Wartezeit (Klammer bis zum Abspiel, gelöst im Flug, Abbruch bei Abseits am `kickAt`); Restore des Signals als JSON; volle Konstruktorpartien mit Raumflanken und Plain-Zustand. Im Workflow-Block „Spieltests ausführen“ eingetragen.
- **SI-Pakettests** `work/test-si-*-v183.cjs`: alle grün (core, clock, defence, finish, setplay, offball, options, field). Die SI-2-Boxszene prüft die Boxbesetzung jetzt an den kalibrierten Vorgaben statt am SI-K-Entwurfsstand (Hinweis des SI-K-Reviews); zwei Boxpunkte werden besetzt.
- **Altpartien:** `node work/check-old-matches-v183.cjs` grün (bytegleich gegen `e4e531c0`); `node work/check-old-matches-v182.cjs <Basis>` grün (Basis per `git archive e4e531c0 dist work/test-v41.cjs`).
- **Restore:** `node work/check-restore-completeness-v183.cjs --port=4262 --quick` auf Lane C grün, 10 Läufe; `attackFlow.crossRun`, `offball.crossZoneOwner` und die `cross-run`-Angebote sind Plain-Data, keine neue WeakMap.
- **Workflow-Block „Spieltests ausführen“** (118 Befehle einschließlich des neuen Tests, Node 24 für `node`, Python für `python3`) über eine gitignorierte Kopie von `run-deploy-tests.cjs`: alle 118 mit Exit 0 auf dem Abschlussstand (nach dem Neustart der Sitzung vollständig wiederholt).
- **Artefakte zurückgesetzt:** `git checkout -- outputs docs/spieler-nutzer-rig`.

## Risiken und offene Punkte

- **Kopfballtorquote 54 %** (B2 35 %, SI-7-Kriterium 18–28 %): Raumflanken landen an Pfosten und Elfmeterpunkt (6–11 m), wo das SI-3-Modell Kopfbälle hoch bewertet. Die Gesamttore bleiben im Band, weil die Schüsse sinken. Hebel ohne Modelländerung: tiefere Boxpunkte (`crossSpots`), `crossSpaceGain`; mit Modelländerung: Kopfballstreuung/Torwart in SI-3. Gehört zur Kalibrierungsrunde.
- **Favoriten 85 %** (B2 78 %): siehe oben; der SI-K-Hebel `options.noise` wirkt auch auf die Flankenwahl.
- **Großes Feld 1,94 Spielflanken**, Ankunft 43 %: längere Wege; `crossRunRange`/`crossLead` könnten auf dem großen Feld über SI-5 skaliert werden (nicht umgesetzt).
- **Kürzeste Partie 3,35 min** (ein 0:0, vorbestehend wie in B2 mit 3,57).
- Rechenzeit je Tick lag in der Reihe höher (4,0 ms Median), weil parallel Tests liefen; die Rauchserien ohne Parallelität zeigten 2,6 ms (B2 3,6 ms, 18 Seiten).

## Reproduktion

```powershell
$node='C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
# Abnahmereihe (Vorgaben, Uhr 0,385), je Seed-Satz 192 Partien, Protokoll für extras.sik.air
& $node work/measure-si-calibration-v183.cjs --clubs=96 --workers=6 --port=4250 --traceLimit=40000 --label=b22-f
& $node work/measure-si-calibration-v183.cjs --clubs=96 --workers=6 --port=4250 --traceLimit=40000 --seedPrefix=si183b --label=b22-f
& $node work/measure-si-calibration-v183.cjs --clubs=96 --workers=6 --port=4262 --traceLimit=40000 --seedPrefix=si183c --label=b22-f
& $node work/table-si-calibration-v183.cjs b22-f-trace40000,b22-f-si183b-trace40000,b22-f-si183c-trace40000 sik-b2,sik-b2-si183b,sik-b2-si183c --strength
# Varianten (48 Vereine): --params=setplay.spaceCrossSpeed=14 bzw. options.crossLead=2,options.crossLeadSlack=3,options.crossKickMin=0.2
```

Die B2-Rohdaten (`sik-b2*.json`) liegen in `work/si-calibration/outputs/si183/` und werden für die Paarung nach `outputs/si183/` kopiert. Der Lane-Wrapper (Sperre, `queue.log`) entspricht dem von SI-K.
