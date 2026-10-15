# Spielerintelligenz 183: SI-5 Großes Feld und sechs Feldspieler

Stand: 15. Oktober 2026. Branch `feat/si-field` (Worktree `work/si-field`) auf `integration/si-r133` (`972d6201`: SI-F, B19, B20, SI-0, SI-3, SI-4, SI-7, SI-2, SI-1). Umsetzung des Pakets SI-5 aus dem [Umsetzungsplan](spielerintelligenz-umsetzungsplan-2026-10-14.md) (Abschnitte 7 „SI-5“, H15, 8.3, 8.6). Modul `dist/match-si-field-v183.js`; Test `work/test-si-field-v183.cjs`; Tabelle `work/table-si-field-v183.cjs`. Der Schalter `field` ist für neue Partien eingeschaltet (`v183EnableByDefault('field')`). Neue Logik wirkt nur bei `v183Active(m,'field')` **und** einem Feld, das länger als das Standardfeld ist (`geometry.length > 68 m`). Das Standardfeld, unmarkierte und 182-Partien sowie markierte Partien mit ausgeschaltetem Paket laufen byteidentisch weiter.

Die Uhr ist unberührt: beide Feldgrößen laufen mit derselben Rate (Nutzerentscheidung). Die Lücke des großen Felds wird über Tempo und Schussreichweite geschlossen, nie über die Uhr.

## Ergebnis in Kürze

- **Erreicht:** Großes Feld mit Uhr 0,42 und allen Paketen: **87,8 % der Schüsse** (12,25 gegen 13,95) und **92,2 % der Tore** (2,83 gegen 3,07) des Standardfelds, **192 gepaarte Partien je Feldgröße** (zwei Seed-Sätze). Zeit in der 22-m-Zone **3,28 s je Team** (Ziel ≥ 2,7; Standardfeld 3,46). Favoriten ≥ 1 Punkt **71 %** (Ziel ≥ 60 %). Das Standardfeld ist in beiden Serien **bit-gleich** zur Basis (Differenz 0,00 in jeder Kennzahl).
- **Planabweichung, gemessen begründet:** Der Plan sah vor, Linienabstand, Blockbreite und Angebotsraster in Metern zu begrenzen bzw. mit dem Mitspielerabstand zu skalieren. Alle drei Mechanismen sind umgesetzt und getestet, **senkten aber in den Messungen Schüsse und Tore** und sind deshalb als Parameter vorhanden, aber ausgeschaltet. Den Ausschlag geben das **Ballführer-/Lauftempo** und eine **um 2 m längere Schussreichweite** (beides aus der Feldlänge abgeleitet, Plan 5, Punkt 10: „aus der Geometrie abgeleiteter Faktor“, wenn die Abnahme sonst verfehlt wird).
- **Sechs Feldspieler:** Die Standard-Rasterzellen für Reihen mit vier bis sechs Spielern sind jetzt symmetrisch (bisher linkslastig bzw. mit einer Randzelle 32/22/2). Die Zellen der sieben Sechser-Grundordnungen (jede Reihe ≤ 3 Spieler) bleiben unverändert.

## Modell

### Tempo und Schussreichweite (wirksam, Vorgabe an)

Mit `extra = Feldlänge / 68 m − 1` (0,2 auf dem großen Feld) gilt:

| Größe | Formel | großes Feld |
| --- | --- | --- |
| Ballführer-Tempo | SI-2-Faktor × (1 + `carrierPaceGain` · extra) | ×1,20: Ballführer frei 1,50 → 1,80, im Nahbereich 1,28 → 1,54 |
| Lauftempo (Tiefen- und Anschlussläufe) | SI-2-Faktor × (1 + `runPaceGain` · extra) | ×1,15: 1,58 → 1,82 |
| Pressing, Unterstützung, Basis, Abfangen, Zweikampf | × (1 + `pressPaceGain`/`otherPaceGain` · extra), beide 0 | unverändert |
| Schussfenster von SI-1 | `options.windowBase` + `windowGain` · extra | 16 m → 18 m (Fenster `16 + 0,55·Abschluss` wird `18 + 0,55·Abschluss`) |

Umsetzung: Das Modul umhüllt `v183PaceFactor` als äußerste Schicht (nach SI-2 und SI-4, die ihre Faktoren zuerst liefern) und skaliert deren Ergebnis; es ändert keine fremde Datei. Das Schussfenster ist ein einzelner Schlüssel von SI-1: das Modul umhüllt `v183Param` und addiert nur für `options.windowBase` das Meterplus; die gespeicherten Parameter bleiben unverändert (Plain-Daten, Restore-neutral).

### Form in Metern (umgesetzt, ausgeschaltet)

Alle Regeln sind reine Funktionen aus gespeicherten Parametern, Geometrie und Positionen:

- **Formationsanker** (`v183FormationAnchor`, Weiche `game.js` `team()`): `anchorWidth` begrenzt die seitliche Spannweite der Rasterspalten in Metern (Standard 34,9 m; Vorgabe 0 = aus), `rowGap` den Reihenabstand (Standard 9,1 m), `pin` hält die Linien beim Standard-Abstand vom jeweils nächsten Tor (Tor, Strafraum und Schussfenster haben feste Meter), mit Übergang zur Mittellinie über `pinFull`.
- **Linienbasis** (`v55DefenderY`, Hilfsfunktion von `v55PrepareMovement`) und **Linienpläne** (`v121PreparePositioning`, von SI-4 für SI-5 freigegeben): `defenderLine`/`linePlans` wenden dieselbe Abbildung auf die neutrale Abwehrlinie (heute .75 normalisiert = 18,9 m Abstand vom eigenen Tor auf dem großen Feld, 15,7 m auf dem Standardfeld) und auf die ballabhängigen Linienpunkte an; Deckungspunkte (`mark`) bleiben unberührt.
- Die Abbildung ist auf dem Standardfeld die Identität (keine Abbildung bei `geometry.length ≤ 68`).

### Rasterzellen für sechs Feldspieler (`world-match-v64.js`)

`v64GridCells` liefert für Reihen mit vier und mehr Spielern (nur nach freiem Verschieben im Raster möglich; die sieben Sechser-Grundordnungen haben höchstens drei je Reihe) spiegelsymmetrische Zellen statt einer linksbündigen Reihe mit Randzelle:

| Spieler je Reihe | Abwehr | Mittelfeld | Angriff |
| --- | --- | --- | --- |
| 4 (vorher: 25–28 / 15–18 / 5–8) | 25, 26, 28, 29 | 15, 16, 18, 19 | 5, 6, 8, 9 |
| 5 (vorher: 25–29 / 15–19 / 5–9) | 25–29 | 15–19 | 5–9 |
| 6 (vorher: 25–29 + 32 / 15–19 + 22 / 5–9 + 2) | 25, 27, 29, 30, 32, 34 | 10, 12, 14, 20, 22, 24 | 0, 2, 4, 5, 7, 9 |

Gespeicherte Zellen (`state.cells`, `matchPlan.cells`) überschreibt der Standard nie; nur Spieler ohne gespeicherte Zelle erhalten ihn. Die Anzeige (`v64UiPrematchPitch`) zeigt die neuen Zellen daher nur dort, wo bisher noch keine Zelle gespeichert war, also in neuen Partien bzw. neu zusammengestellten Plänen.

## Parameter (`match.si.params.field`)

| Schlüssel | Vorgabe | Bedeutung |
| --- | ---: | --- |
| `carrierPaceGain` | 1 | Ballführer-Tempo: 1 + Gain · extra |
| `runPaceGain` | 0,75 | Lauftempo der eigenen Läufe |
| `pressPaceGain`, `otherPaceGain` | 0 / 0 | Pressing bzw. alle übrigen Zwecke (in der Messung nützte beides nichts, siehe unten) |
| `windowGain` | 10 | Meter Schussfenster je extra (SI-1 `windowBase`; +2 m auf dem großen Feld) |
| `anchorWidth`, `rowGap` | 0 / 0 | Meterobergrenzen für Spannweite und Reihenabstand der Formation (0 = aus; Standardwerte 35 / 9,2) |
| `pin`, `pinFull` | 0 / 0,255 | Anteil der Linien, der den Standard-Abstand zum Tor hält |
| `defenderLine`, `linePlans` | 0 / 0 | Abbildung auch auf die Linienbasis bzw. die Linienpläne |

Alle Werte sind Vorgaben im Modul und werden mit jeder neuen Partie gespeichert (Kalibrierung SI-K). Neue Schlüssel haben Vorgaben, die für gespeicherte 183-Partien ohne diesen Schlüssel neutral sind: Eine 183-Partie ohne Schalter `field` bleibt aus.

## Zufall und Zustand

Keine Zufallsziehung im Modul, kein eigener Zustand (weder `attackFlow` noch WeakMap): jedes Ergebnis ist eine reine Funktion von `match.si`, Geometrie und Positionen. Ein Restore setzt deshalb nichts. `match.si` wird nie ergänzt.

## Messung

Werkzeug: `work/measure-si-offball-v183.cjs --packages=default,-field` (Basis) gegen `--packages=default` (SI-5) mit `--clockRate=0.42 --clubs=96`, beide Feldgrößen, zwei Seed-Sätze (`p01r132`, `si183b`); `work/table-si-field-v183.cjs <basis> <lauf> [--size=…]` gepaart je Verein und Feldgröße (±95 %) und `work/table-si-field-v183.cjs <lauf>` (Quotient großes Feld / Standardfeld). Lane A (Basis) und Lane C (SI-5), Sperren und `queue.log` der Integration; `dist` vor und nach jedem Lauf gehasht (`distUnchanged: true`).

### Abnahmeserie: 192 Partien je Feldgröße (Basis = alle Pakete ohne SI-5)

| Kennzahl (Mittel je Partie) | Standardfeld (Basis = SI-5) | Großes Feld, Basis | Großes Feld, SI-5 | Großes Feld SI-5 / Standard (95 %-Spanne) | Kriterium |
| --- | ---: | ---: | ---: | ---: | --- |
| Schüsse | 13,95 | 10,18 (73 %) | **12,25** | **87,8 %** (84,1–91,6) | ≥ 85 % |
| Tore | 3,07 | 2,31 (75 %) | **2,83** | **92,2 %** (80,1–106,0) | ≥ 85 % |
| aufs Tor | 6,39 | 4,67 | 5,77 | 90,2 % | – |
| Zeit mit Ball ≤ 22 m (s je Team) | 3,46 | 2,37 | **3,28** | 94,6 % | ≥ 2,7 s |
| Favoriten ≥ 1 Punkt (N 132 / 137 / 137) | 74 % | 66 % | **71 %** | – | ≥ 60 % |
| Dauer (min) | 4,23 | 4,06 | 4,18 | 98,8 % | – |
| 4–6 min / 0:0 / 2–3 Tore / 3–5 Tore | 66 / 11 / 35 / 41 % | 53 / 17 / 36 / 34 % | 69 / 8 / 45 / 46 % | – | – |

Je Seed-Satz (96 gepaarte Partien großes Feld, Differenz SI-5 − Basis ±95 %):

| Seed-Satz | Schüsse Basis → SI-5 | Tore Basis → SI-5 | Zone ≤ 22 m Basis → SI-5 | Favoriten Basis → SI-5 | Schüsse / Tore SI-5 vom Standardfeld |
| --- | ---: | ---: | ---: | ---: | ---: |
| `p01r132` | 10,24 → 12,48 (+2,24 ±0,62) | 2,46 → 2,94 (+0,48 ±0,46) | 2,35 → 3,29 (+0,94 ±0,36) | 67 → 74 % (N 69) | 88,9 % / 93,0 % |
| `si183b` | 10,13 → 12,02 (+1,90 ±0,60) | 2,17 → 2,73 (+0,56 ±0,40) | 2,38 → 3,26 (+0,87 ±0,36) | 66 → 68 % (N 68) | 86,6 % / 91,3 % |

**Standardfeld (96 + 96 gepaarte Partien): Differenz in jeder Kennzahl exakt 0,00** (Schüsse, Tore, Zonenzeit, Dauer, Pässe, Fouls, Favoriten; die Rechenzeit ist die einzige Größe, die schwankt). Das Paket hebt das Standardfeld nicht an. Weitere Wirkungen auf dem großen Feld: Pässe 98,9 → 93,5 je Partie (der Ballführer trägt häufiger), Raumpässe 0,48 → 0,77, Rechenzeit +1,7 % (innerhalb der Rauschprobe).

Lesart: Das Schusskriterium liegt mit dem Punktschätzer (87,8 %) über der Grenze, die untere 95-%-Grenze (84,1 %) knapp darunter. Die Tore (92 %) und die Zonenzeit (95 %) haben deutlich mehr Abstand. SI-K kann mit Abnahmereihe A (576 Partien) nachziehen: `windowGain` bewegt Schüsse ohne Tore (siehe Entwicklungsserien, Fenster 20 m: 93 % der Schüsse, 84 % der Tore), `carrierPaceGain` bewegt Tore.

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
| l5 | Tempo + `options.windowBase` 18 m (= Abnahmeserie) | 12,48 | 2,94 | 3,29 |
| l6 | Tempo + `windowBase` 20 m | 13,09 | 2,66 | 2,89 |

Befunde (alle Hebel einzeln oder paarweise; Rauschen ±0,6 Schüsse bei 96 Paaren):

1. **Die Lücke entsteht beim Erreichen der Zone**, nicht beim Abschluss: Auf dem Standardfeld enden 13,1 von 28,8 Ballbesitzphasen mit einem Schuss, auf dem großen Feld 9,6 von 23,9; die Phasen erreichen ebenso oft das letzte Drittel (14,4 / 14,2), aber seltener die 22-m-Zone (10,9 / 7,8). Die Ballführer-Zeit innerhalb 30 m vom Tor beträgt 37,9 % statt 26,5 % (VM-Stichprobe, 9 Partien). Schussart und -qualität sind gleich (Entfernung 19,2 / 19,3 m, Winkel, Druck); das Defizit liegt im Band 20–24 m (6,4 gegen 4,8 Schüsse je Partie).
2. **Begrenzen der Form in Metern senkt die Werte** (f1, l2; im VM-Proxy mit 30 Partien: Ballführer innerhalb 30 m 27,3 % Basis, 29,4 % nur Tempo, 26,9 % mit Formationsbegrenzung). Wird die Formation auf Standardmeter verdichtet, rücken die Angriffsreihen vom Tor weg bzw. die Linien zusammen; das Spiel wird enger, nicht offener. Gleich wirkt die Angebotsskalierung (x2, l3: −0,9 Schüsse gegenüber l1).
3. **Das Ballführertempo ist der einzige Hebel mit eindeutigem Signal** (+1,0 Schüsse, +0,4 Tore, Zonenzeit +0,9 s für ×1,10). Ab ×1,2 sättigen die Schüsse bei etwa 11,5–12,3, die Tore steigen weiter (l1: 3,47 = 110 % des Standardfelds). Pressingtempo (g1, g2) holt die Tore zurück (2,5) und nützt den Schüssen kaum.
4. **Das Schussfenster verschiebt Schüsse in den Bereich 20–24 m** (l5, l6): +2 m macht aus l1 (88 % / 110 %) die Kombination 89 % / 93 %. Das ist die Mischung, die beide Kriterien erfüllt.

## Prüfungen

Alle Befehle mit Node 24 (`C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`) im Worktree `work/si-field`.

| Prüfung | Ergebnis |
| --- | --- |
| `node work/test-si-field-v183.cjs` (neu, 13 Prüfungen: Vorgaben und Schalter, kein eigener Zustand, Marker ohne Paket = 182-Konstruktor, Standardfeld Paket an = aus (auch mit Extremwerten), Großfeld ändert sich, Umhüllungen reichen bei „Paket aus“ durch, Tempo und Fenster, Anker/Linienbasis/Linienpläne in Metern, keine Zufallsziehung, Rasterzellen 4–6 je Reihe und alle sieben Sechser-Grundordnungen, Restore) | grün |
| `node work/test-si-core-v183.cjs`, `test-si-clock-v183`, `test-si-finish-v183`, `test-si-defence-v183`, `test-si-setplay-v183`, `test-si-offball-v183`, `test-si-options-v183` | grün (mit `field` an) |
| `node work/check-old-matches-v183.cjs` (340 Szenen gegen `e4e531c0`) | grün |
| `node work/check-old-matches-v182.cjs work/tmp-base182` (158 Szenen) | grün |
| `node work/check-restore-completeness-v183.cjs --port=4250 --quick` (Lane A, unter Sperre) | grün (10 Läufe) |
| `node work/test-tactics-roster-v130.cjs`, `test-world-match-v64.cjs`, `test-native-career-v160.cjs` | grün |
| Gesamter Block „Spieltests ausführen“ aus `.github/workflows/deploy.yml` (Zeilen 32–147: 114 `node`-Befehle und die beiden `python`-Tests `test_deploy_ftps.py`/`test_deploy_unity_assets.py`), nacheinander mit Exitcode je Befehl | alle 116 grün (`python3` ist hier nur die Store-Verknüpfung; die beiden Python-Tests liefen mit `python`) |
| `node work/build.cjs`, `test-club-crests`, `test-expansion-crests`, `test-completed-crests`, `test-expansion-sponsors`, `test-no-player-images` (Schritt „Einzeldatei bauen“) | grün |
| UI-Prüfung der Formationsanzeige (Edge, 430 × 900, Karriere mit sechs Feldspielern, großes Feld): `v64UiPrematchPitch` zeigt für alle sieben Sechser-Grundordnungen sechs belegte Rasterzellen, identisch mit den Zellen der Engine (z. B. 2–2–2: 6, 8, 16, 18, 26, 28); eine Mittelfeldreihe mit fünf Spielern erscheint als volle, symmetrische Reihe 15–19; keine Seitenfehler | grün |

Der Restore-Nachweis des Pakets steht in der Prüfung „restore on the large pitch“: JSON-Checkpoint über `v65Snapshot`/`v65Restore` mitten in einer Großfeldpartie mit eingeschalteten Formparametern; Marker, Parameter, Anker und Tempo-/Fensterwerte vor und nach dem Laden gleich, der Snapshot trägt keinen Paketzustand, die Partie läuft 300 Ticks weiter. Eine 183-Partie ohne Schalter `field` (vor dem Paket gespeichert) bleibt aus und läuft weiter.

## Weichenbedarf und Hinweise

- **`v183Param` (SI-F):** SI-5 umhüllt die SI-F-Schnittstelle für genau einen fremden Schlüssel (`options.windowBase`), weil die Plan-Weichen keine Stelle für geometrieabhängige Parameter vorsehen. Sauberer wäre eine kleine Weiche in SI-1 (`windowBase` über `v183FieldWindow(m)`) oder ein SI-F-Haken für „geometrieabgeleitete Parameter“; Antrag an SI-F/SI-K. Die Umhüllung kostet für andere Schlüssel nur einen Stringvergleich.
- **`v121PreparePositioning` (SI-4):** wie in der SI-4-Übergabe vorgesehen umhüllt, aber im Standard ausgeschaltet (`linePlans` 0).
- **Wechselwirkung mit SI-K:** Die Gains multiplizieren die dann gültigen Faktoren von SI-2 (`carrierPace`, `runPace`) und die Schussweite von SI-1 (`windowBase`). Ändert SI-K diese, zieht das große Feld mit; die Verhältnisse (Quotient großes Feld / Standardfeld) sind in der Abnahmereihe A nachzumessen. Das Standardfeld ist durch SI-5 nie beeinflusst.
- **U-1:** Auf dem großen Feld laufen Ballführer (Faktor 1,80 statt 1,50, im Nahbereich 1,54) und Läufer (1,82 statt 1,58) schneller: bei Abschluss 14 etwa 8,5 m/s bzw. 9,4 m/s. Clip-Wechsel dafür sind Sache von U-1 (Tempi analog zur SI-2-Tabelle).
- **Formparameter:** Wer SI-K die Hebel `anchorWidth`/`rowGap`/`pin` neu prüfen lässt, setzt `defenderLine` und `linePlans` mit; die Messwerte oben gelten für die ausgeschalteten Vorgaben.
