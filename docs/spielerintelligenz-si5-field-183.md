# Spielerintelligenz 183: SI-5 Großes Feld und sechs Feldspieler

Stand: 15. Oktober 2026. Branch `feat/si-field` (Worktree `work/si-field`) auf `integration/si-r133` (`972d6201`: SI-F, B19, B20, SI-0, SI-3, SI-4, SI-7, SI-2, SI-1). Umsetzung des Pakets SI-5 aus dem [Umsetzungsplan](spielerintelligenz-umsetzungsplan-2026-10-14.md) (Abschnitte 7 „SI-5“, H15, 8.3, 8.6). Modul `dist/match-si-field-v183.js`; Test `work/test-si-field-v183.cjs`; Tabelle `work/table-si-field-v183.cjs`. Der Schalter `field` ist für neue Partien eingeschaltet (`v183EnableByDefault('field')`). Neue Logik wirkt nur bei `v183Active(m,'field')` **und** einem Feld, das länger als das Standardfeld ist (`geometry.length > 68 m`). Das Standardfeld, unmarkierte und 182-Partien sowie markierte Partien mit ausgeschaltetem Paket laufen byteidentisch weiter.

Korrekturrunde nach dem Review (Opus 5.5, mergefähig): S1 Fenster über eine Weiche statt über `v183Param`, S2 Ballführer nicht schneller als Pressende (Nahbereichsgain, Obergrenzen), H1–H4 und Doku, neue Abnahmeserie.

Die Uhr ist unberührt: beide Feldgrößen laufen mit derselben Rate (Nutzerentscheidung). Die Lücke des großen Felds wird über Tempo und Schussreichweite geschlossen, nie über die Uhr.

## Ergebnis in Kürze

- **Erreicht (nach der Korrekturrunde):** Großes Feld mit Uhr 0,42 und allen Paketen: **88,1 % der Schüsse** (12,29 gegen 13,95) und **88,8 % der Tore** (2,73 gegen 3,07) des Standardfelds, 192 gepaarte Partien je Feldgröße auf zwei Seed-Sätzen. Zeit in der 22-m-Zone **2,83 s je Team** (Ziel ≥ 2,7; Standardfeld 3,46), Favoriten ≥ 1 Punkt **71 %** (Ziel ≥ 60 %). Das Standardfeld ist in beiden Serien **bit-gleich** zur Basis (Differenz 0,00 in jeder Kennzahl). Die Abnahme ist **knapp**: Die untere 95-%-Grenze der Schüsse liegt bei 84,3 %, die der Tore bei 77,6 % (siehe SI-K-Auflage).
- **Planabweichung, gemessen begründet:** Der Plan sah vor, Linienabstand, Blockbreite und Angebotsraster in Metern zu begrenzen bzw. mit dem Mitspielerabstand zu skalieren. Alle drei Mechanismen sind umgesetzt und getestet, **senkten aber in den Messungen Schüsse und Tore** und sind als Parameter vorhanden, aber ausgeschaltet. Den Ausschlag geben **Ballführer-/Lauftempo** und eine **längere Schussreichweite** (aus der Feldlänge abgeleitet; Plan 5, Punkt 10: „aus der Geometrie abgeleiteter Faktor“, wenn die Abnahme sonst verfehlt wird).
- **Ballführer bleibt langsamer als Pressende (Review S2):** Das Nahbereichstempo steigt nur um ×1,10 (1,28 → 1,41 gegenüber Pressing 1,58), das Ballführertempo hat eine Obergrenze von 8,5 m/s, das Lauftempo von 9,5 m/s. Mit Vorgabe 0 für das Nahbereichstempo (Wunsch des Reviews) verfehlte das Paket das Torkriterium (2,40–2,72 Tore, 76–86 %); 0,5 hält es ein.
- **Sechs Feldspieler:** Die Standard-Rasterzellen für Reihen mit vier bis sechs Spielern sind jetzt symmetrisch (bisher linkslastig bzw. mit einer Randzelle 32/22/2). Die Zellen der sieben Sechser-Grundordnungen (jede Reihe ≤ 3 Spieler) bleiben unverändert.
- **Offener Befund:** In der Abnahmeserie brach eine von 384 Partien mit Paket (POR-6, großes Feld, Seed-Satz `si183b`) beim Abpfiff mit einem Fehler des Belastungsmodells ab (siehe Abschnitt „Offener Befund“).

## Modell

### Tempo und Schussreichweite (wirksam, Vorgabe an)

Mit `extra = Feldlänge / 68 m − 1` (0,2 auf dem großen Feld) gilt:

| Größe | Formel | großes Feld |
| --- | --- | --- |
| Ballführer-Tempo, frei | SI-2-Faktor × (1 + `carrierPaceGain` · extra), höchstens `carrierSpeedMax` | ×1,20: 1,50 → 1,80, höchstens 8,5 m/s |
| Ballführer-Tempo, Gegner innerhalb 2,5 m | SI-2-Faktor × (1 + `carrierCloseGain` · extra), höchstens `carrierSpeedMax` | ×1,10: 1,28 → 1,41 (Pressing 1,58) |
| Lauftempo (Tiefen- und Anschlussläufe) | SI-2-Faktor × (1 + `runPaceGain` · extra), höchstens `runSpeedMax` | ×1,15: 1,58 → 1,82, höchstens 9,5 m/s |
| Pressing, Unterstützung, Basis, Abfangen, Zweikampf | × (1 + `pressPaceGain`/`otherPaceGain` · extra), beide 0 | unverändert |
| Schussfenster von SI-1 | `v183OptWindowBase`: gespeichertes `options.windowBase` + `windowGain` · extra | 16 m → 18,4 m (Fenster `16 + 0,55·Abschluss` wird `18,4 + 0,55·Abschluss`) |

Die Obergrenzen sind absolut in m/s (Grundgeschwindigkeit `3 + Tempo · 0,14` mal Faktor, wie `v157Pace`); die Skalierung senkt ein Tempo nie unter den unskalierten Wert. Beispiele (Tempo = Technik 14 / 18): Ballführer frei 8,1 m/s / 8,5 m/s (ohne Obergrenze 9,4 m/s bei 18; unskaliert 6,7 / 7,8 m/s), im Nahbereich 6,3 m/s (unskaliert 5,7); Läufer 9,0 m/s / 9,5 m/s (ohne Obergrenze 10,0 bei 18; unskaliert 7,8 / 8,7); Pressende 7,8 m/s / 8,7 m/s. Der Ballführer liegt im Nahbereich damit immer unter den Pressenden; frei erreicht er bei Tempo 18 etwa Pressendengeschwindigkeit.

Umsetzung: Das Modul umhüllt `v183PaceFactor` als äußerste Schicht (nach SI-2 und SI-4, die ihre Faktoren zuerst liefern). Das Nahbereichstempo erkennt es am selben Ausdruck, den SI-2 für diesen Fall liefert (`carrierClosePace · (0,78 + Technik · 0,009)`). Das Schussfenster läuft über eine ausdrückliche Weiche: SI-1 besitzt `v183OptWindowBase(m)` (standardmäßig der gespeicherte Wert, gelesen in `v183OptParams`, damit in jeder Fensterberechnung), SI-5 umhüllt nur diese Funktion. `v183Param('options.windowBase')` liefert weiter den gespeicherten Wert (SI-F-Vertrag). Das wirksame Fenster steht im SI-1-Trace (`window` in den `options`-Einträgen).

### Form in Metern (umgesetzt, ausgeschaltet)

Alle Regeln sind reine Funktionen aus gespeicherten Parametern, Geometrie und Positionen:

- **Formationsanker** (`v183FormationAnchor`, Weiche `game.js` `team()`): `anchorWidth` begrenzt die seitliche Spannweite der Rasterspalten in Metern (Standard 34,9 m; Vorgabe 0 = aus), `rowGap` den Reihenabstand (Standard 9,1 m), `pin` hält die Linien beim Standard-Abstand vom jeweils nächsten Tor (Tor, Strafraum und Schussfenster haben feste Meter), mit Übergang zur Mittellinie über `pinFull`.
- **Linienbasis** (`v55DefenderY`, Hilfsfunktion von `v55PrepareMovement`) und **Linienpläne** (`v121PreparePositioning`, von SI-4 für SI-5 freigegeben): `defenderLine`/`linePlans` wenden dieselbe Abbildung auf die neutrale Abwehrlinie (heute .75 normalisiert = 18,9 m Abstand vom eigenen Tor auf dem großen Feld, 15,7 m auf dem Standardfeld) und auf die ballabhängigen Linienpunkte an; Deckungspunkte (`mark`) bleiben unberührt.
- Die Abbildung ist auf dem Standardfeld die Identität (keine Abbildung bei `geometry.length ≤ 68`).

### Rasterzellen für sechs Feldspieler (`world-match-v64.js`)

`v64GridCells` liefert für Reihen mit vier und mehr Spielern spiegelsymmetrische Zellen statt einer linksbündigen Reihe mit Randzelle:

| Spieler je Reihe | Abwehr | Mittelfeld | Angriff |
| --- | --- | --- | --- |
| 4 (vorher: 25–28 / 15–18 / 5–8) | 25, 26, 28, 29 | 15, 16, 18, 19 | 5, 6, 8, 9 |
| 5 (vorher: 25–29 / 15–19 / 5–9) | 25–29 | 15–19 | 5–9 |
| 6 (vorher: 25–29 + 32 / 15–19 + 22 / 5–9 + 2) | 25, 27, 29, 30, 32, 34 | 10, 12, 14, 20, 22, 24 | 0, 2, 4, 5, 7, 9 |

Solche Reihen entstehen mit `matchConfig` (beliebige Reihenzahlen, auch Nullreihen, auf **beiden** Feldgrößen: etwa 4–1–0 mit fünf Feldspielern auf dem Standardfeld, oder nach freiem Verschieben im Raster); die sieben Sechser-Grundordnungen haben höchstens drei je Reihe. Die Änderung ist deshalb **nicht auf das große Feld und nicht auf Marker 183 begrenzt**, sondern betrifft auch das Standardfeld, aber nur für Spieler ohne gespeicherte Zelle (Test mit einer Viererreihe bei fünf Feldspielern in `test-si-field-v183`). Gespeicherte Zellen (`state.cells`, `matchPlan.cells`) überschreibt der Standard nie; nur Spieler ohne gespeicherte Zelle erhalten ihn. Die Anzeige (`v64UiPrematchPitch`) zeigt die neuen Zellen daher nur dort, wo bisher noch keine Zelle gespeichert war, also in neuen Partien bzw. neu zusammengestellten Plänen.

## Parameter (`match.si.params.field`)

| Schlüssel | Vorgabe | Bedeutung |
| --- | ---: | --- |
| `carrierPaceGain` | 1 | Ballführer-Tempo frei: 1 + Gain · extra |
| `carrierCloseGain` | 0,5 | dasselbe im Nahbereich (Gegner innerhalb SI-2 `carrierCloseRadius`); 0 hält das Standardtempo 1,28 (gemessen: verfehlt das Torkriterium) |
| `runPaceGain` | 0,75 | Lauftempo der eigenen Läufe |
| `carrierSpeedMax`, `runSpeedMax` | 8,5 / 9,5 | absolute Obergrenzen in m/s für das skalierte Ballführer- bzw. Lauftempo (0 = keine) |
| `pressPaceGain`, `otherPaceGain` | 0 / 0 | Pressing bzw. alle übrigen Zwecke (in der Messung nützte beides nichts) |
| `windowGain` | 12 | Meter Schussfenster je extra (SI-1 `windowBase` über `v183OptWindowBase`; +2,4 m auf dem großen Feld) |
| `anchorWidth`, `rowGap` | 0 / 0 | Meterobergrenzen für Spannweite und Reihenabstand der Formation (0 = aus; Werte für „an“: 35 m / 9,2 m, auf die Standardwerte 34,9 m / 9,1 m aufgerundet, damit das Standardfeld exakt unberührt bleibt) |
| `pin`, `pinFull` | 0 / 0,255 | Anteil der Linien, der den Standard-Abstand zum Tor hält |
| `defenderLine`, `linePlans` | 0 / 0 | Abbildung auch auf die Linienbasis bzw. die Linienpläne; `plan.limit` (Abseitsklammer der Angreifer, Leser `world-attack-flow-v152.js:52`) bleibt dabei unverändert |

Alle Werte sind Vorgaben im Modul und werden mit jeder neuen Partie gespeichert (Kalibrierung SI-K). Neue Schlüssel haben Vorgaben, die für gespeicherte 183-Partien ohne diesen Schlüssel neutral sind: Eine 183-Partie ohne Schalter `field` bleibt aus.

## Zufall und Zustand

Keine Zufallsziehung im Modul, kein eigener Zustand (weder `attackFlow` noch WeakMap): jedes Ergebnis ist eine reine Funktion von `match.si`, Geometrie und Positionen. Ein Restore setzt deshalb nichts. `match.si` wird nie ergänzt.

## Messung

Werkzeug: `work/measure-si-offball-v183.cjs --packages=default,-field` (Basis) gegen `--packages=default` (SI-5) mit `--clockRate=0.42 --clubs=96`, beide Feldgrößen, zwei Seed-Sätze (`p01r132`, `si183b`); `work/table-si-field-v183.cjs <basis> <lauf> [--size=…]` gepaart je Verein und Feldgröße (±95 %) und `work/table-si-field-v183.cjs <lauf>` (Quotient großes Feld / Standardfeld). Lane A (Basis) und Lane C (SI-5), Sperren und `queue.log` der Integration; `dist` vor und nach jedem Lauf gehasht (`distUnchanged: true`).

### Abnahmeserie nach der Korrekturrunde: 192 Partien je Feldgröße (Basis = alle Pakete ohne SI-5)

Lanes A (Basis) und C (SI-5), Läufe `fin2-base-a/b` und `fin2-field-a/b`. Die neu gefahrene Basis ist partieweise bit-gleich zur ersten (die Weiche in SI-1 ändert bei ausgeschaltetem Paket nichts); `dist`-Hash vor und nach jedem Lauf unverändert.

| Kennzahl (Mittel je Partie) | Standardfeld (Basis = SI-5) | Großes Feld, Basis | Großes Feld, SI-5 | Großes Feld SI-5 / Standard (95 %-Spanne) | Kriterium |
| --- | ---: | ---: | ---: | ---: | --- |
| Schüsse | 13,95 | 10,20 (73 %) | **12,29** | **88,1 %** (84,3–92,1) | ≥ 85 % |
| Tore | 3,07 | 2,32 (76 %) | **2,73** | **88,8 %** (77,6–102,2) | ≥ 85 % |
| aufs Tor | 6,39 | 4,69 | 5,58 | 87,3 % | – |
| Zeit mit Ball ≤ 22 m (s je Team) | 3,46 | 2,37 | **2,83** | 81,6 % | ≥ 2,7 s |
| Favoriten ≥ 1 Punkt (N 132 / 136 / 136) | 74 % | 66 % | **71 %** | – | ≥ 60 % |
| Dauer (min) | 4,23 | 4,06 | 4,16 | 98,3 % | – |
| Duelle | 55,4 | 42,7 | 39,2 | 70,7 % | beobachtet |
| gewonnene Tacklings | 5,01 | 3,94 | 3,84 | 76,7 % | beobachtet |
| Pässe | 104,1 | 98,5 | 94,3 | 90,6 % | – |
| 4–6 min / 0:0 / 2–3 Tore / 3–5 Tore | 66 / 11 / 35 / 41 % | 53 / 17 / 37 / 35 % | 61 / 8 / 39 / 43 % | – | – |

Je Seed-Satz (große Feld, gepaart gegen die Basis, Differenz ±95 %):

| Seed-Satz | Schüsse Basis → SI-5 | Tore Basis → SI-5 | Zone ≤ 22 m Basis → SI-5 | Favoriten Basis → SI-5 | Duelle / Tacklings Basis → SI-5 | Schüsse / Tore SI-5 vom Standardfeld |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `p01r132` (96 Paare) | 10,24 → 12,41 (+2,17 ±0,60) | 2,46 → 2,83 (+0,38 ±0,45) | 2,35 → 2,70 (+0,35 ±0,34) | 67 → 74 % (N 69) | 42,6 → 38,8 / 3,99 → 3,81 | 88,4 % / 89,6 % |
| `si183b` (95 Paare, siehe Offener Befund) | 10,17 → 12,18 (+2,01 ±0,55) | 2,18 → 2,62 (+0,44 ±0,39) | 2,40 → 2,96 (+0,56 ±0,30) | 66 → 69 % (N 67) | 42,8 → 39,5 / 3,88 → 3,87 | 87,8 % / 87,6 % |

**Standardfeld (96 + 96 gepaarte Partien): Differenz in jeder Kennzahl exakt 0,00.** Das Paket hebt das Standardfeld nicht an. Weitere Wirkungen auf dem großen Feld: Pässe 98,5 → 94,3 je Partie (der Ballführer trägt häufiger), Raumpässe 0,48 → 0,77, Rechenzeit +1,7 %. Die Duellzahl sinkt von 42,7 auf 39,2 (Standardfeld 55,4): Wer im freien Raum schneller trägt, gerät seltener in Zweikämpfe; die gewonnenen Tacklings erholen sich dagegen auf 3,84 (3,94 in der Basis; in der ersten Fassung mit Nahbereichstempo ×1,2 waren es 3,40 bei 38,9 Duellen).

Lesart: Das Schusskriterium liegt mit dem Punktschätzer (88,1 %) über der Grenze, die untere 95-%-Grenze (84,3 %) knapp darunter; Tore (88,8 %, untere Grenze 77,6 %) und Zonenzeit (2,83 s; Seed-Satz `p01r132`: 2,70 s, also an der Grenze) haben kaum Abstand. **Der unabhängige Seed-Satz `si183b` liegt bei 87,8 % der Schüsse und 87,6 % der Tore (95-%-Spanne der Schüsse in der ersten Fassung 83,0–91,0 %); die Vorgaben wurden auf `p01r132` gewählt.** Reserve: `windowGain` 14–15 bewegt Schüsse ohne Tore (Entwicklungsserie r8: 12,30 Schüsse, 2,63 Tore bei Gain 14, Zonenzeit unverändert).

**SI-K-Auflage:** Abnahmereihe A (576 Partien) prüft das Verhältnis großes Feld / Standardfeld für Schüsse, Tore und Zonenzeit ausdrücklich je Seed-Satz und mit der 95-%-Spanne; verfehlt sie 85 %, ist `windowGain` (Schüsse) bzw. `carrierPaceGain`/`carrierCloseGain` (Tore, Zonenzeit) das Stellrad, nicht die Uhr. Ändert SI-K `carrierPace`, `runPace` oder `windowBase`, zieht das große Feld mit.

### Erste Abnahmeserie (vor dem Review, Nahbereichstempo ×1,20, ohne Obergrenzen, Fenster +2,0 m)

Zum Vergleich: 87,8 % der Schüsse (12,25), 92,2 % der Tore (2,83), Zonenzeit 3,28 s, Favoriten 71 %, Duelle 38,9, gewonnene Tacklings 3,40 (gegen 3,94 in der Basis, `p01r132`: 3,99 → 3,54, Duelle 42,6 → 39,3). Die Korrekturrunde tauscht Tore und Zonenzeit gegen ein Ballführertempo, das unter dem der Pressenden bleibt.

### Entwicklungsserien (großes Feld, 96 Paare, `p01r132`, gegen `f0` = Basis; ±95 % der Schüsse ≈ ±0,6)

| Lauf | Variante | Schüsse | Tore | Zone ≤ 22 m (s) |
| --- | --- | ---: | ---: | ---: |
| f0 | Basis (SI-5 aus) | 10,24 | 2,46 | 2,35 |
| f1 | Formationsanker begrenzt (Breite 35 m, Reihen 9,2 m) | 9,88 | 2,29 | 2,27 |
| f3 | + `pin` 1, Linienbasis, Linienpläne | 10,68 | 2,28 | 2,37 |
| x2 | Angebotsvorlauf, Stützpunkte und Rückraum ×1,2 (SI-2-Parameter) | 10,15 | 2,27 | 2,49 |
| x1 | nur Ballführertempo ×1,10 (1,65 / 1,40) | 11,27 | 2,86 | 3,29 |
| f4–f7 | `pin` + Tempo (Ballführer ×1,10 … ×1,20, Läufe ×1,10 … ×1,15) | 10,94 – 11,47 | 2,54 – 3,10 | 2,89 – 3,79 |
| g1 | f6 + Pressingtempo ×1,2 | 11,63 | 2,51 | 3,18 |
| g2 | f6 + Pressing und alle übrigen Tempi ×1,2 | 11,48 | 2,48 | 3,13 |
| l1 | nur Tempo (Ballführer ×1,2, Läufe ×1,15) | 12,27 | 3,47 | 4,21 |
| l2 | Breite 35 m + `pin` + Linien + Tempo | 11,59 | 2,74 | 3,49 |
| l3 | Tempo + Angebote um den Mitspielerabstand (×1,2) | 11,35 | 2,69 | 3,66 |
| l4 | Tempo ×1,25 / ×1,25 | 11,68 | 2,66 | 3,97 |
| l5 | Tempo + `options.windowBase` 18 m (= erste Abnahmeserie) | 12,48 | 2,94 | 3,29 |
| l6 | Tempo + `windowBase` 20 m | 13,09 | 2,66 | 2,89 |
| r2 | Review: Obergrenze 9 m/s, Nahbereichsgain 0 (Fenster 10) | 11,63 | 2,72 | 2,62 |
| r3 | + Lauf-Obergrenze 9,5, Fenster 14 | 12,39 | 2,40 | 2,33 |
| r4 | Obergrenze 9, Nahbereichsgain 0, Ballführergain 1,5 | 12,67 | 2,57 | 2,76 |
| r6 | Nahbereichsgain 0, Obergrenze 9, Lauf-Gain 1 (Obergrenze 10), Fenster 12 | 12,09 | 2,60 | 2,66 |
| r5 | Nahbereichsgain 0,5, Obergrenzen 9 / 9,5, Fenster 12 | 12,43 | 2,79 | 2,71 |
| r7 | **Nahbereichsgain 0,5, Obergrenzen 8,5 / 9,5, Fenster 12 (= Vorgabe)** | 12,41 | 2,83 | 2,70 |
| r8 | wie r7, Fenster 14 | 12,30 | 2,63 | 2,69 |

Zeilen l1–l6 sind Läufe der ersten Fassung, r2–r8 der Korrekturrunde (Duellzahl und gewonnene Tacklings der r-Läufe: r2 38,8 / 3,84, r3 35,9 / 3,48, r4 37,7 / 3,21, r5 37,6 / 3,64, r6 38,1 / 3,26, r7 38,8 / 3,81, r8 38,8 / 3,35; Basis 42,6 / 3,99). Lauf r1 (Vorgaben der ersten Fassung über die neuen Parameter nachgebildet, Nahbereichsgain 1, keine Obergrenze) ist partieweise **identisch** zur ersten Abnahmeserie und belegt, dass die Weiche das Verhalten nicht ändert.

Befunde (alle Hebel einzeln oder paarweise; Rauschen ±0,6 Schüsse bei 96 Paaren):

1. **Die Lücke entsteht beim Erreichen der Zone**, nicht beim Abschluss: Auf dem Standardfeld enden 13,1 von 28,8 Ballbesitzphasen mit einem Schuss, auf dem großen Feld 9,6 von 23,9; die Phasen erreichen ebenso oft das letzte Drittel (14,4 / 14,2), aber seltener die 22-m-Zone (10,9 / 7,8). Die Ballführer-Zeit innerhalb 30 m vom Tor beträgt 37,9 % statt 26,5 % (VM-Stichprobe, 9 Partien). Schussart und -qualität sind gleich (Entfernung 19,2 / 19,3 m, Winkel, Druck); das Defizit liegt im Band 20–24 m (6,4 gegen 4,8 Schüsse je Partie).
2. **Begrenzen der Form in Metern senkt die Werte** (f1, l2; im VM-Proxy mit 30 Partien: Ballführer innerhalb 30 m 27,3 % Basis, 29,4 % nur Tempo, 26,9 % mit Formationsbegrenzung). Wird die Formation auf Standardmeter verdichtet, rücken die Angriffsreihen vom Tor weg bzw. die Linien zusammen; das Spiel wird enger, nicht offener. Gleich wirkt die Angebotsskalierung (x2, l3: −0,9 Schüsse gegenüber l1).
3. **Das Ballführertempo ist der einzige Hebel mit eindeutigem Signal** (+1,0 Schüsse, +0,4 Tore, Zonenzeit +0,9 s für ×1,10). Ab ×1,2 sättigen die Schüsse bei etwa 11,5–12,3, die Tore steigen weiter (l1: 3,47 = 110 % des Standardfelds). Pressingtempo (g1, g2) holt die Tore zurück (2,5) und nützt den Schüssen kaum.
4. **Das Schussfenster verschiebt Schüsse in den Bereich 20–24 m** (l5, l6): +2 m macht aus l1 (88 % / 110 %) die Kombination 89 % / 93 %. Das ist die Mischung, die beide Kriterien erfüllt.
5. **Das Nahbereichstempo trägt die Tore** (r2–r7): Mit Gain 0 sinken die Tore auf 2,40–2,72 (76–86 % des Standardfelds), weil das Durchdribbeln gegen Pressende ein Haupttorweg des schnellen Ballführers war; mit 0,5 (1,41 statt 1,28, Pressing 1,58) und Obergrenze 8,5 m/s bleiben 2,83 Tore. Die Obergrenze 8,5 gegenüber 9 ändert die Werte im Rauschen; sie ist die strengere der beiden vom Review genannten Werte. Die Lauf-Obergrenze wirkt nur bei Tempo über etwa 16 (Läufer 10,0 m/s unskaliert über der Grenze 9,5) und ist in den Läufen nicht einzeln messbar; sie ist als Schutz gesetzt.

## Prüfungen

Stand nach der Korrekturrunde (SI-1-Weiche, Tempo-Obergrenzen, Zellentest): `test-si-field-v183` (14 Prüfungen), die sieben SI-Tests (mit der Weiche in `match-si-options-v183.js`), `check-old-matches-v183`/`v182`, `check-restore-completeness-v183 --quick`, `test-world-match-v64`, `test-tactics-roster-v130` sind erneut grün: `check-restore-completeness-v183 --quick` auf Lane A (Port 4250) und Lane C (Port 4262) unter Sperre je 10 Läufe, `check-old-matches-v183` 340 Szenen, `check-old-matches-v182` 158 Szenen. Neu in `test-si-field-v183`: Schussfenster über die Weiche (`v183Param` liefert weiter den gespeicherten Wert, wirksames Fenster im SI-1-Trace), Nahbereichsgain und Obergrenzen, Viererreihe bei fünf Feldspielern (4–1–0). Der Workflow-Block lief in der ersten Fassung vollständig grün; die Korrekturrunde ändert außer `match-si-field-v183.js`, `match-si-options-v183.js` und einem Kommentar in `world-match-v64.js` nichts.

Alle Befehle mit Node 24 (`C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`) im Worktree `work/si-field`.

| Prüfung | Ergebnis |
| --- | --- |
| `node work/test-si-field-v183.cjs` (neu, 14 Prüfungen: Vorgaben und Schalter, kein eigener Zustand, Marker ohne Paket = 182-Konstruktor, Standardfeld Paket an = aus (auch mit Extremwerten), Großfeld ändert sich, Umhüllungen reichen bei „Paket aus“ durch, Tempo und Fenster, Anker/Linienbasis/Linienpläne in Metern, keine Zufallsziehung, Rasterzellen 4–6 je Reihe und alle sieben Sechser-Grundordnungen, Restore) | grün |
| `node work/test-si-core-v183.cjs`, `test-si-clock-v183`, `test-si-finish-v183`, `test-si-defence-v183`, `test-si-setplay-v183`, `test-si-offball-v183`, `test-si-options-v183` | grün (mit `field` an) |
| `node work/check-old-matches-v183.cjs` (340 Szenen gegen `e4e531c0`) | grün |
| `node work/check-old-matches-v182.cjs work/tmp-base182` (158 Szenen) | grün |
| `node work/check-restore-completeness-v183.cjs --port=4250 --quick` (Lane A, unter Sperre) | grün (10 Läufe) |
| `node work/test-tactics-roster-v130.cjs`, `test-world-match-v64.cjs`, `test-native-career-v160.cjs` | grün |
| Gesamter Block „Spieltests ausführen“ aus `.github/workflows/deploy.yml` (Zeilen 32–147: 114 `node`-Befehle und die beiden `python`-Tests `test_deploy_ftps.py`/`test_deploy_unity_assets.py`), nacheinander mit Exitcode je Befehl | alle 116 grün (`python3` ist hier nur die Store-Verknüpfung; die beiden Python-Tests liefen mit `python`) |
| `node work/build.cjs`, `test-club-crests`, `test-expansion-crests`, `test-completed-crests`, `test-expansion-sponsors`, `test-no-player-images` (Schritt „Einzeldatei bauen“) | grün |
| UI-Prüfung der Formationsanzeige (Edge, 430 × 900, Karriere mit sechs Feldspielern, großes Feld): `v64UiPrematchPitch` zeigt für alle sieben Sechser-Grundordnungen sechs belegte Rasterzellen, identisch mit den Zellen der Engine (z. B. 2–2–2: 6, 8, 16, 18, 26, 28); eine Mittelfeldreihe mit fünf Spielern erscheint als volle, symmetrische Reihe 15–19; keine Seitenfehler | grün |

Der Restore-Nachweis des Pakets steht in der Prüfung „restore on the large pitch“: JSON-Checkpoint über `v65Snapshot`/`v65Restore` mitten in einer Großfeldpartie mit eingeschalteten Formparametern; Marker, Parameter, Anker und Tempo-/Fensterwerte vor und nach dem Laden gleich, der Snapshot trägt keinen Paketzustand, die Partie läuft 300 Ticks weiter. Eine 183-Partie ohne Schalter `field` (vor dem Paket gespeichert) bleibt aus und läuft weiter.

## Offener Befund: Abbruch beim Abpfiff (Belastungsmodell v158)

In der Abnahmeserie (`si183b`, Lauf `fin2-field-b`) endete **eine von 384 Partien mit Paket** (POR-6, großes Feld) beim Abpfiff mit `RangeError: actual event must occur within played virtual minutes` (`player-freshness.js:166` ← `v158Commit` ← `v158RecoverMatch` ← `v65Finish`); die Basis- und alle früheren Läufe (rund 30 Serien, mehr als 3.000 Partien) hatten den Fehler nie. Er ist reproduzierbar: `node work/measure-si-offball-v183.cjs --label=repro --port=<Lane> --workers=1 --only="POR-6|large" --clockRate=0.42 --clubs=96 --sizes=large --seedPrefix=si183b` unter Lane-Sperre.

Befund aus einer Beobachter-Messung (nicht eingecheckt): Der Spieler `POR-8:8` wurde bei virtueller Minute 97,75 eingewechselt (Intervalle ab 97,75). Ein Zweikampfkontakt (`intense-duel`, Minute 96,85, also `elapsed` 80,706) wird aber erst nach den Intervallen bis Minute 98,02 (`elapsed` 81,684) in `v158QueueAction` eingereiht: Ein verzögert verarbeiteter Kontakt trägt die Zeit des Kontakts (`match.elapsed` 80,706 beim Aufruf), obwohl die Uhr schon bei 81,68 stand, und wird dem Spieler zugeordnet, der inzwischen eingewechselt ist. Die Fehlerstelle liegt im Zusammenspiel von verspätetem Kontaktereignis (SI-0/`v102Scoped`), später Einwechslung (Minute 97,75 bei einer Spielzeit von 98,0) und der Freshness-Prüfung; nach bisherigem Stand ist der SI-5-Code daran nicht beteiligt (er schreibt keinen Zustand und kennt weder Kontakte noch Einwechslungen); ein Gegenbeweis ohne SI-5 steht aus, weil diese Trajektorie nur mit dem Paket entsteht. SI-5 verändert die Spielverläufe, nicht die Kontaktverarbeitung. **Empfehlung:** vor dem Merge von SI-K klären (Eigentümer SI-0/B19: Kontaktereignisse beim Einreihen am Ereignisort der Uhr verankern oder Ereignisse außerhalb der gespielten Minuten des Spielers verwerfen); ein Abbruch bei `v65Finish` wäre im Produktivspiel sichtbar.

## Weichenbedarf und Hinweise

- **SI-1-Weiche (Review S1):** Das Schussfenster läuft über `v183OptWindowBase(m)` (SI-1, `match-si-options-v183.js`, Vorgabe: gespeicherter Wert; gelesen in `v183OptParams` und damit in allen Fensterberechnungen). SI-5 umhüllt nur diese Funktion. Die Umhüllung von `v183Param` ist entfernt; SI-K und Messwerkzeuge lesen mit `v183Param('options.windowBase')` den gespeicherten Wert (16 m) und mit `v183OptWindowBase` den wirksamen (18,4 m auf dem großen Feld). Das wirksame Fenster steht im SI-1-Trace. Altpfad und SI-1-Tests unverändert grün, der Lauf `r1` ist partieweise identisch zur Fassung mit der `v183Param`-Umhüllung.
- **`v121PreparePositioning` (SI-4):** wie in der SI-4-Übergabe vorgesehen umhüllt, aber im Standard ausgeschaltet (`linePlans` 0). Bei eingeschaltetem `linePlans` bleibt `plan.limit` (Abseitsklammer, Leser `world-attack-flow-v152.js:52`) unverändert; die Linienpunkte verschieben sich, die Klammer nicht.
- **Ungemessene Kombinationen (Review H3):** Das Paket schaltet nach der Feldlänge, nicht nach der Spielerzahl. „Groß mit fünf Feldspielern“ und „Standard mit sechs Feldspielern“ sind nicht gemessen (Produktion kennt nur Standard/5 und Groß/6); Groß/5 läuft mit denselben Gains. SI-6 (P02) nimmt die Serie mit `field` als Referenz für das große Feld.
- **Belastung v158 (Review H4):** Auf dem großen Feld sinken die Pässe um 4 je Partie, die Läufe werden schneller (Obergrenzen 8,5 / 9,5 m/s). Das Belastungsmodell (Frische nach Abpfiff, Sprintanteil) ist für das große Feld mit Paket nicht gemessen; SI-K prüft es mit der Abnahmereihe (Plan 10).
- **Wechselwirkung mit SI-K:** Die Gains multiplizieren die dann gültigen Faktoren von SI-2 (`carrierPace`, `carrierClosePace`, `runPace`) und erweitern das Schussfenster von SI-1. Ändert SI-K diese, zieht das große Feld mit; die Verhältnisse (großes Feld / Standardfeld) sind in der Abnahmereihe A nachzumessen (siehe SI-K-Auflage). Das Standardfeld ist durch SI-5 nie beeinflusst.
- **U-1 (aktualisiert):** Tempi auf dem großen Feld in m/s (Beispiel Tempo = Technik 14 / 18): Ballführer frei **8,1 / 8,5 m/s** (Obergrenze 8,5; unskaliert 6,7 / 7,8), Ballführer im Nahbereich **6,3 m/s** (unskaliert 5,7), Läufer **9,0 / 9,5 m/s** (Obergrenze 9,5; unskaliert 7,8 / 8,7), Pressende unverändert 7,8 / 8,7 m/s. Clip-Wechsel dafür sind Sache von U-1 (Tempi analog zur SI-2-Tabelle).
- **Formparameter:** Wer SI-K die Hebel `anchorWidth`/`rowGap`/`pin` neu prüfen lässt, setzt `defenderLine` und `linePlans` mit; die Messwerte oben gelten für die ausgeschalteten Vorgaben. Die Obergrenzen 35 m / 9,2 m sind auf die Standardwerte 34,9 m / 9,1 m aufgerundet.
