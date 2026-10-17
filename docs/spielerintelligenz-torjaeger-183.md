# Spielerintelligenz 183: Torjäger, Remis und Kopfbälle (Torjäger-Runde)

Stand: 16. Oktober 2026. Branch `feat/si-scorer` (Worktree `work/si-scorer`), abgezweigt von `integration/si-r133` = `c7d13feb` (SI-Wellen bis SI-K2 und SI-6 kompakt). Auftrag: Nutzerentscheidung „Torjäger, Sponsorziel und Altstände 16. Oktober 2026“ ([Entscheidungen](entscheidungen.md)), zuerst im ausgespielten Spiel. Die Kompaktsimulation wird in einer eigenen Aufgabe neu angeglichen; dafür liegt die Referenzreihe `sb-f` vor (Abschnitt Referenzreihe).

Nur Partien mit Marker 183. Partien ohne Marker und mit Kennung 182 sind bytegleich (Prüfungen unten). Keine Veröffentlichung, keine Fußversion.

## Ergebnis in Kürze

- **Remis:** 20,5 % statt 16,3 % (Referenzreihe, 576 Partien, beide Feldgrößen rund 20 %).
  - Enge Duelle (Abstand <1): 35 % statt 25 %, über dem Wunsch von 25–30 %.
  - Über vier gleichwertige Abnahmereihen (2.304 Partien): 20,1 % und 31 %.
  - Ursache: späte Vorsicht bei Gleichstand und Ergebnisverwaltung des Führenden. Im ausgespielten Spiel gab es vorher keinen Aufholeffekt.
- **Zielkonflikt Favoriten:** Der Favorit gewinnt bei 1,5 Punkten geglättet 60 % [55–64] statt 64 %.
  - Standardfeld 56 %, großes Feld 64 %; über alle vier Reihen 60 %.
  - Klasse 1–2 Punkte: 65 % (Standard) bzw. 58 % (groß).
  - Ab 3 Punkten 94 % bzw. 97 %.
  - Mehr Remis kosten hier rund 4 Punkte Favoritenquote. Einen Hebel, der nur enge Spiele trifft, gibt es nicht (Abschnitt Risiken).
- **Tore:** 3,53 statt 3,86 (Standard 3,67, groß 3,40), Schüsse 12,0 statt 13,1.
  - 0:0: 6,6 % (großes Feld 7,6 %, Ziel ≤6 %, knapp darüber).
  - Partien mit mindestens 7 Toren: 10,6 % statt 13,5 %.
  - Der Torverlust der Spielstandsvorsicht ist über eine leicht genauere Schussstreuung (`finish.spreadBase` 0,028) zum Teil ausgeglichen.
- **Kantersiege:** etwas seltener. Der Favorit trifft bei zwei Toren Führung 3,13 statt 3,45 Mal je Partie. Die Ausgleichshebung hebt die Führungsrate wieder an.
- **Unbedrängte Luftabschlüsse aus dem Spiel:** 5,1 % aller Tore statt 7,1 % (Standard 6,2 %, groß 3,9 %) und 63 % Tore je Schuss aufs Tor statt 77 %. Das liegt im Rahmen des Nutzers.
  - Freistoßflanken unbedrängt: 15 Tore bei 24 Schüssen aufs Tor statt 24 bei 25; der Torwart steht im Median 0,44 m statt 1,55 m neben der Schusslinie.
  - Ecken: 32 % Tore je Schuss (K2 29 %).
- **Torjäger (weiches Ziel):** Toranteil des besten Abschlussspielers 58 % (Standard) bzw. 53 % (groß) statt 57 bzw. 47 %. Der Ligatorschützenkönig liegt geschätzt bei 31 bzw. 26 statt 32 bzw. 25 Toren. Ohne künstliche Hebel ist das mit fünf Feldspielern nicht zu senken (Abschnitt Befunde).
- **Halteziele:**
  - Dauer 4,97 min all-inclusive, 88 % in 4–6 min.
  - Spielflanken 2,70 (Standard 3,53).
  - Großes Feld: 95 % der Schüsse und 92 % der Tore des Standardfelds.
  - Fernschüsse Standard 16,5 %; Fernschüsse Abschluss ≥14 treffen zu 24 %; Abschlussverhältnis 2,52.
  - B03 und Farbstufen unberührt.

## Nutzersteuerung während der Runde (16. Oktober)

- **Torjäger als weiches Ziel:** „Das mit den vielen Toren bei einem Spieler werden wir mit 5 Feldspielern wohl nicht in den Griff bekommen.“ Toranteil des besten Spielers, Tore des besten Torschützen und Dreierpacks wurden zum weichen Ziel. Keine künstlichen Hebel (Verteidiger in Abschlüsse drängen, Schützenwahl gegen die Position, Stürmer unterdrücken).
- **Kopfbälle:** Maßgeblich ist der Anteil an allen Toren, nicht die Quote je Schuss aufs Tor. Der Stand von K2 (7,1 % aller Tore) ist „vollkommen ok“; unter etwa 4 % wäre überkorrigiert.
- **Vorrang:** mehr Remis und weniger Kantersiege auf realistische Weise, alle Halteziele unverändert.

## Befunde vor den Änderungen (K2, 576 Partien)

**Torjäger.** Der beste Abschlussspieler einer Mannschaft erzielt 57 % (Standard) bzw. 47 % (groß) ihrer Tore. Er ist in rund 70 % der Mannschaften der Stürmer (Rolle Stoßstürmer, Torjäger oder Zielspieler). Er schießt 3,9 (Standard) bzw. 3,0 (groß) mal je Partie, der Zweitbeste 1,4.

- 48 % seiner Schüsse folgen einem Pass, den er 14–22 m vor dem Tor annimmt; auf dem großen Feld kommen 38 % aus über 22 m.
- Eine VM-Probe (8 Partien) zeigt: Wenn ein Stürmer schießt, steht der nächste Mittelfeldspieler im Mittel 27 m vor dem Tor. Mittelfeldspieler innerhalb ihres Schussfensters spielen Steilpässe (Wert 0,4–0,8) statt selbst zu schießen.
- Die Konzentration ist deshalb **räumlich** (fünf Feldspieler, meist ein Stürmer vorn), nicht eine Frage der Abschlussbewertung.

**Kopfbälle aus dem Spiel.** Die „unbedrängten Kopfbälle mit 78 % Toren je Schuss aufs Tor“ sind zu 87 % **Volleys** nach Flanken (261 von 302; etwa 9 m, rund 28 m/s). Kopfballhebel (`headerSpread`, `headerBase`) wirken dort nicht. Streuung und Schussgeschwindigkeit senken die Tore je Schuss, kaum aber die Tore je Schuss aufs Tor. Entscheidend ist der Torwart: Er stand bei Spielflanken im Median 1,3 m neben der Schusslinie (SI-K2-Anteil 0,4).

**Spielstand.** Im ausgespielten Spiel gab es keinen Aufholeffekt. Zurückliegende Mannschaften trafen nicht häufiger als bei Gleichstand (Favorit 2,37 gegen 2,49 Tore je Partie, Außenseiter 0,94 gegen 0,97). Führende trafen häufiger (Favorit +2: 3,45). Favoriten ab 3 Punkten: 4,4 Tore je Partie bei zwei Toren Führung.

## Werkzeuge

- **Tabelle:** `work/table-si-calibration-v183.cjs` hat neue Abschnitte:
  - Torschützen je Gruppe (alle, Favorit ab 3, Favorit 1–2, eng) nach den Definitionen des SI-6-Reviews;
  - Remis je Stärkeklasse;
  - geglättete Favoritenquote (logistisch, Bootstrap);
  - unbedrängte Luftabschlüsse aus dem Spiel: Quote und Anteil an allen Toren;
  - Ligatorschützenkönig-Schätzung.
- **Ligaschätzung:** Die 96 Vereine der Reihe bilden ihre 12 Ligen (acht Vereine, 14 Spiele). Je Spiel kommen die Tore der drei besten Abschlussspieler eines Vereins aus einer Mannschaftspartie der Reihe mit ähnlichem Stärkeabstand (eine der 15 nächsten). Gezählt wird der Bestwert je Liga im Mittel über 200 Saisons sowie das Saisonmaximum. Für K2 ergibt das 31,9 (Standard) bzw. 24,5 (groß) und trifft die SI-6-Saisonen (32,2 / 27,0).
- **Offline-Modell des Spielverlaufs:** Torrate je Mannschaft aus dem Stärkeabstand (Poisson-Regression auf der Reihe), simuliert mit Faktoren je Spielstand (gitignoriert, `work/tmp-sisc/markov.cjs`). Es gibt K2 wieder (Remis 15,2 % gegen 16,3 %, Tore 3,86). Ergebnis des Modells:
  - Vorsicht des Führenden allein bringt kaum Remis, kostet aber Tore.
  - Remis entstehen durch späte Vorsicht bei Gleichstand (und einen Aufholdruck, siehe Hebel).
- **Luftabschlüsse offline:** `work/tmp-sisc/headers.cjs` wertet die protokollierten K2-Luftabschlüsse mit dem echten `v183FinishPlan` aus.

## Hebel und Entscheidung

Alle Schlüssel sind Plain-Data-Parameter des gespeicherten Satzes (`match.si` eingefroren). Kein neuer Zustand, keine neue Ziehung. Gespeicherte 183-Partien ohne die Schlüssel lesen die Vorgaben; es gibt keine Nutzerspielstände mit 183.

### Übernommen

| Paket | Schlüssel | vorher | jetzt | Bedeutung |
| --- | --- | ---: | ---: | --- |
| options | `leadCap` / `leadEarly` | – | 2 / 0,5 | Führungsintensität: min(Führung, 2)/2, beim Anstoß halb, zum Abpfiff voll |
| options | `leadShoot` / `leadRisk` | – | 0,5 / 0,5 | Schuss- und Risikogewicht des Führenden × (1 − Wert × Intensität) |
| options | `levelRisk` | – | 0,6 | Risikogewicht bei Gleichstand × (1 − 0,6 × (Zeit/Spieldauer)²) |
| offball | `leadPace` / `levelPace` | – | 0,25 / 0,25 | Tempo von Ballführer und Läufern (Führung bzw. später Gleichstand) |
| offball | `leashLead` | – | 4 m | Zonenleine der Angebote des Führenden kürzer (Form halten) |
| offball | `zoneLeash` | 12 m | 15 m | Grundleine außer Sturm: Mittelfeld rückt nach |
| setplay | `keeperShiftOpen` | (`keeperShift` 0,4) | 1 | Torwart bei hohen Bällen außer Ecken ganz auf die Linie Landepunkt–Tor |
| setplay | `keeperShift` | 0,4 | 0,4 | gilt jetzt nur noch für Ecken |
| finish | `volleySpread` | 1,2 | 1,6 | Streuung von Volleys (nur nach Flanken) |
| finish | `spreadBase` | 0,035 | 0,028 | Grundstreuung aller Schüsse (Ausgleich des Torverlusts) |

**Spielstand (SI-1, `dist/match-si-options-v183.js:103` `v183ScoreState`, `:111` `v183OptStateWeights`):**

- Die Führungsintensität ist min(Führung, `leadCap`)/`leadCap`, mal `leadEarly` beim Anstoß, linear steigend bis 1 zum Abpfiff.
- Die Gleichstandsintensität ist (Spielzeit/Spieldauer)², nur bei Gleichstand.
- Gelesen werden nur Spielstand und Uhr.
- Wirkung im Optionsmodell (Bewertung und Schuss aus der Drehung, `:354`, `:486`): Schussgewicht × (1 − `leadShoot`·Führung), Risikogewicht × (1 − `leadRisk`·Führung) × (1 − `levelRisk`·Gleichstand).

**Tempo und Zonenleine (SI-2, `dist/match-si-offball-v183.js`):**

- Tempo von Ballführer und Läufern (`:343` `v183OffballLeadPace`, Aufrufe `:359`, `:361`): × (1 − `leadPace`·Führung) × (1 − `levelPace`·Gleichstand).
- Zonenleine der Angebote des Führenden (`:349` `v183OffballLeashShift`, Aufruf `:219`): − `leashLead` m × Führung.
- Grundleine des Mittelfelds `zoneLeash` 12 → 15 m (`:63`): Das Mittelfeld rückt nach.

**Torwart bei hohen Bällen (SI-7, `dist/match-si-setplay-v183.js:106`, `:271`):**

- Eine Ecke erkennt der Torwart daran, dass das Flugende dem letzten `attackFlow.setplay.secondBall` der Art `corner` entspricht. Dieser Plain-Data-Datensatz wird beim Schuss geschrieben.
- Bei Ecken bleibt `keeperShift` 0,4.
- Bei allen anderen hohen Bällen gilt `keeperShiftOpen` 1: Spielflanken, Freistoßflanken, Raumflanken und hohe Bälle.

**Abschluss (SI-3, `dist/match-si-finish-v183.js:59`, `:61`):**

- `spreadBase` 0,035 → 0,028 gleicht den Torverlust durch die Spielstandsvorsicht aus.
- `volleySpread` 1,2 → 1,6: Volleys nach Flanken streuen stärker.

**Zusammenspiel SI-2/SI-5 (`dist/match-si-field-v183.js:137`):** SI-5 erkennt das Zweikampftempo des Ballführers an der exakten Gleichheit mit dem SI-2-Ausdruck. Der Spielstandsfaktor wird dort mitgerechnet. Ohne das bekam ein Ballführer im Zweikampf auf dem großen Feld bei Führung oder spätem Gleichstand den offenen Tempoaufschlag (Versuch 3).

### Verworfen (gemessen, ohne Wirkung oder mit Nebenwirkung)

| Hebel | Messung | Befund |
| --- | --- | --- |
| Wahrgenommener Abschluss: Mitspieler und eigener Schuss zur Mannschaftsmitte gezogen (`mateFin` 0, `selfFin` 0,5, `xgFin` 0) | S1, 192 | Toranteil des Besten 56,6 % (K2 56,5 %); Schüsse je Rang unverändert. Mechanik per Test bestätigt, also echte Nullwirkung. Code entfernt. |
| Rollen-Schussgewicht eingeebnet (`roleShoot` 0), flacheres Schussfenster (`windowBase` 15, `windowFin` 0,55) | S3, 192 | 59,9 % (mehr statt weniger). Entfernt. |
| Laufprofile Mittelfeld (Box/Tiefe höher), `depthRunners` 3 | S2, 192 | 57,0 %. Nicht übernommen. |
| Aufholdruck: Schuss- und Risikogewicht, Tempo und Zonenleine des Zurückliegenden | G1–G4, 192 | Torraten Zurückliegender unverändert (Favorit −1: 1,86–2,58, Außenseiter −1: 0,61–1,03 je Partie, K2 2,01 / 1,04). Entfernt. |
| Spätere Vorsicht bei Gleichstand stärker (`levelRisk` 0,8, `levelPace` 0,35) | v1, 192 | Remis 25,5 %, aber Favorit bei 1,5 Punkten 51 %, enge Spiele 38 % Remis, 0:0 7,8 %. Verworfen. |
| Abschluss allgemein über `spreadBase` 0,024 und `volleySpread` 2,4 | Abnahmeversuch 1, 576 | Unbedrängte Luftabschlüsse nur noch 3,1 % aller Tore (überkorrigiert), Fernschüsse Abschluss ≥14 28 %, Luft nach Ecken 36 %. Nachgestellt. |
| `spreadSkill` 0,44 statt `spreadBase`, `levelRisk` 0,65 / `levelPace` 0,3 | Abnahmeversuch 2, 576 | Remis 20,8 %, Favorit bei 1,5 Punkten 59 % (Standard 57 %), Abschlussverhältnis Standard 1,84. Nachgestellt. |

### Screening (192 Partien, Seed-Satz `p01r132`, gepaart mit K2)

| Reihe | Hebel | Tore | Schüsse | Remis / eng | Favorit 1,5 / 4 P. | bester Abschluss Toranteil | Luft unbedrängt je aufs Tor / Anteil Tore |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| K2 (Basis) | – | 3,78 | 13,1 | 16,7 / 29 % | 64 / 93 % | 56,5 % | 76 / 8,0 % |
| S1 | mateFin 0, selfFin .5, xgFin 0 (+ Torwart/Volley 1 / 1,6) | 3,63 | 13,0 | 14,1 / 24 % | 65 / 92 % | 56,6 % | 61 / 7,2 % |
| S2 | Laufprofile Mittelfeld, depthRunners 3 (+ T/V) | 3,72 | 12,9 | 22,4 / 31 % | 59 / 95 % | 57,0 % | 66 / 5,0 % |
| S3 | roleShoot 0, windowBase 15, windowFin .55 (+ T/V) | 3,69 | 13,1 | 19,3 / 33 % | 66 / 93 % | 59,9 % | 62 / 4,5 % |
| L1 | Führung: leadShoot/Risk .5, leadPace .25, Cap 3 (+ T/V) | 3,38 | 12,6 | 17,2 / 24 % | 65 / 92 % | 56,3 % | 65 / 5,2 % |
| G1 | Führung 0,6/0,6/0,3 Cap 2, Rückstand 0,4/0,8/0,2, Gleichstand 0,4/0,15, `volleySpread` 2 | 3,28 | 12,5 | 16,1 / 22 % | 67 / 93 % | 61,5 % | 52 / 3,6 % |
| G2 | wie G1, Rückstand 0,6/1/0,3, Gleichstand 0,6/0,25 | 3,28 | 12,4 | 22,4 / 34 % | 61 / 92 % | 61,5 % | 58 / 4,2 % |
| G3 | G1 mit Gleichstand 0,6/0,25, Leine Rückstand +12 / Führung −4, `zoneLeash` 15 | 3,28 | 12,5 | 21,9 / 28 % | 57 / 91 % | 58,6 % | 73 / 4,4 % |
| G4 | G1 mit Gleichstand 0,6/0,25, Leine Rückstand +20 / Führung −4 | 3,29 | 11,9 | 21,4 / 33 % | 63 / 91 % | 58,5 % | 53 / 3,1 % |

T/V = Torwart bei Spielflanken auf der Linie (`keeperShiftOpen` 1) und `volleySpread` 1,6. G2–G4 enthalten die Gleichstandsvorsicht 0,6/0,25; G3/G4 zusätzlich Leinenverschiebungen.

Kandidaten auf den Seed-Sätzen `si183b` und `si183c` (384 Partien) und Abnahmereihen (576):

| Reihe | Hebel | Tore | Schüsse | Remis / eng | Favorit 1,5 / 4 P. | bester Abschluss Toranteil | Luft unbedrängt je aufs Tor / Anteil Tore |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| K2 b+c | – | 3,90 | 13,1 | 16,1 / 23 % | 65 / 91 % | 50,2 % | 78 / 6,7 % |
| C1 (384) | Führung 0,5/0,5/0,25 Cap 2, Gleichstand 0,6/0,25, `spreadBase` 0,024, `volleySpread` 2, `zoneLeash` 15, `leashLead` 4 | 3,74 | 12,2 | 19,8 / 29 % | 64 / 92 % | 51,1 % | 69 / 4,3 % |
| C2 (384) | wie C1 ohne Leinenänderung | 3,77 | 12,2 | 22,7 / 40 % | 60 / 95 % | 53,7 % | 63 / 5,1 % |
| K2 (576) | – | 3,86 | 13,1 | 16,3 / 25 % | 64 / 92 % | 52,3 % | 77 / 7,1 % |
| Versuch 1 (576) | wie C1, `volleySpread` 2,4 | 3,67 | 12,2 | 18,6 / 26 % | 64 / 94 % | 54,6 % | 59 / 3,1 % |
| Versuch 2 (576) | `spreadBase` 0,035, `spreadSkill` 0,44, `volleySpread` 1,6, Gleichstand 0,65/0,3 | 3,61 | 12,1 | 20,8 / 30 % | 59 / 92 % | 52,6 % | 61 / 4,5 % |
| Versuch 3 (576) | Endvorgaben, aber mit dem SI-5-Tempofehler (großes Feld) | 3,59 | 11,9 | 20,5 / 33 % | 56 / 94 % | 54,8 % | 67 / 5,3 % |
| Referenz sb-f (576) | Endvorgaben | 3,53 | 12,0 | 20,5 / 35 % | 60 / 95 % | 55,7 % | 63 / 5,1 % |
| Versuche 1–3 + Referenz (2.304) | gleiche Spielstandshebel, verschiedene Abschlusshebung | 3,60 | 12,0 | 20,1 / 31 % | 60 / 94 % | 54,4 % | 63 / 4,5 % |

Versuch 3 lief mit den Endvorgaben, aber mit einem Fehler im Zusammenspiel von SI-2 und SI-5 (Abschnitt Prüfungen). Das Standardfeld ist partieweise gleich der Referenz.

## Referenzreihe `sb-f` (576 Partien, Endvorgaben)

96 Vereine × 2 Feldgrößen × 3 Seed-Sätze (`p01r132`, `si183b`, `si183c`), Vorgaben ohne Überschreibungen, `dist`-Kopie des Stands `db94d0c7`, Protokollgrenze 40.000. Läufe `sb-f-trace40000`, `sb-f-si183b-trace40000`, `sb-f-si183c-trace40000` in `outputs/si183/` (gitignoriert); 0 Ausfälle, keine Pausenticks, `dist` unverändert. Diese Reihe ist die Grundlage für die neue Kompaktangleichung (SI-6, eigene Aufgabe); die Fixtures sind dieselben wie in K2.

**Neue Ziele** (K2 → Referenz):

| Kennzahl | Standard | groß | Ziel |
| --- | --- | --- | --- |
| Remis gesamt | 15,3 % → **20,1 %** | 17,4 % → **20,8 %** | ≥ rund 20 % |
| Remis enge Duelle (Abstand <1) | 25 % → **34 %** | 26 % → **37 %** | 25–30 % |
| Remis je Klasse 1–2 / 2–3 / ≥3 | 18 % / 18 % / 2 % → **21 % / 22 % / 5 %** | 20 % / 15 % / 9 % → **26 % / 19 % / 3 %** | – |
| Partien mit ≥7 Toren | 16,3 % → **11,8 %** | 10,8 % → **9,4 %** | weniger Kantersiege |
| Toranteil bester Abschlussspieler | 56,9 % → **58,3 %** | 47,1 % → **52,9 %** | ≤ rund 40 % (weich) |
| Favorit ab 3: Tore bester Torschütze | 3,25 → **3,03** | 2,56 → **2,69** | ≤ rund 1,6 (weich) |
| Favorit ab 3: Spieler mit ≥3 Toren | 64 % → **55 %** | 42 % → **51 %** | ≤ rund 15 % (weich) |
| Ligatorschützenkönig (Schätzung, 14 Spiele) / Saisonmaximum | 31,9 / 46,8 → **30,7 / 44,3** | 24,5 / 37,7 → **26,3 / 39,7** | rund 14–20 (weich) |
| Luft unbedrängt Spielzug: Tore je Schuss aufs Tor | 82 % (177) → **65 % (163)** | 70 % (103) → **59 % (109)** | 45–60 % (nachrangig) |
| Luft unbedrängt Spielzug: Anteil an allen Toren | 8,9 % → **6,2 %** | 5,2 % → **3,9 %** | ≥ rund 4 %, ≤ 5–6 % (Nutzer) |
| Luft nach Ecken: Tore je Schuss | 28 % (171) → **36 % (160)** | 30 % (151) → **27 % (117)** | rund 29 % |

**Halteziele:**

| Kennzahl | Standard | groß | Ziel |
| --- | --- | --- | --- |
| Tore (Streuung) | 4,05 (2,42) → **3,67 (2,31)** | 3,67 (2,20) → **3,40 (2,25)** | 3–5, ≈4 |
| 0:0 / 3–5 Tore | 5,2 % / 43 % → **5,6 % / 42 %** | 3,5 % / 52 % → **7,6 % / 44 %** | 0:0 selten (≤6 %) |
| Schüsse / Tore je Schuss | 13,41 / 29,6 % → **12,28 / 29,1 %** | 12,76 / 28,5 % → **11,71 / 28,6 %** | 12–16; 25–32 % |
| Favorit 1,5 Punkte geglättet [95 %] | 67 % [61–73] → **56 % [49–63]** | 62 % [56–68] → **64 % [57–70]** | rund 65 % (60–70) |
| Favorit Klasse 1–2: Sieg | 65 % → **65 %** | 64 % → **58 %** | rund 65 % |
| Favorit 4 Punkte geglättet / Klasse ≥3: Sieg | 93 % / 94 % → **95 % / 94 %** | 90 % / 91 % → **95 % / 97 %** | ≥ rund 90 % |
| Dauer all-inclusive (min) / Anteil 4–6 min | 5,10 / 88 % → **5,01 / 89 %** | 5,00 / 90 % → **4,93 / 87 %** | 4–6 min (4,8–5,2; ≥85 %) |
| Fernschüsse: Anteil / von Abschluss ≥13 | 14,8 % / 93 % → **16,5 % / 92 %** | 32,0 % / 52 % → **31,6 % / 53 %** | Standard 12–20 %; groß Information |
| Fernschüsse Abschluss ≥14: Tore je Schuss | 27 % → **27 %** | 20 % → **20 %** | 15–25 % (gepoolt) |
| Spielflanken je Partie | 3,19 → **3,53** | 1,77 → **1,88** | ≥2 (Standard) |
| Verhältnis Abschluss ≥14/<10 / Torwartabstand | 2,15 / 16,8 → **2,33 / 19,5** | 1,91 / 12,2 → **2,73 / 17,7** | ≥1,8 / ≥10 |
| Freistöße / Fouls | 4,00 / 3,94 → **4,26 / 4,20** | 3,00 / 2,81 → **3,15 / 2,92** | Freistöße ≤4,5 |
| Großes Feld / Standard: Schüsse / Tore | 95,2 / 90,7 % → **95,3 / 92,4 %** | | ≥85 % (Vorrang) |

**Je Stärkeabstand** (Sieg / Remis / Niederlage des Favoriten, Tore je Partie; K2 → Referenz):

| Feld | Abstand | Partien | Sieg | Remis | Niederlage | Tore | Tordifferenz Favorit |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Standard | <1 | 89 | 51 % → **28 %** | 25 % → **34 %** | 25 % → **38 %** | 3,46 → **2,88** | 0,67 → **-0,07** |
| Standard | 1–2 | 62 | 65 % → **65 %** | 18 % → **21 %** | 18 % → **15 %** | 3,13 → **3,24** | 1,13 → **1,34** |
| Standard | 2–3 | 50 | 80 % → **74 %** | 18 % → **22 %** | 2 % → **4 %** | 3,58 → **3,28** | 2,26 → **1,88** |
| Standard | ≥3 | 87 | 94 % → **94 %** | 2 % → **5 %** | 3 % → **1 %** | 5,57 → **5,02** | 4,33 → **3,97** |
| groß | <1 | 82 | 43 % → **45 %** | 26 % → **37 %** | 32 % → **18 %** | 2,88 → **2,60** | 0,29 → **0,48** |
| groß | 1–2 | 69 | 64 % → **58 %** | 20 % → **26 %** | 16 % → **16 %** | 2,96 → **2,62** | 1,10 → **0,97** |
| groß | 2–3 | 48 | 73 % → **75 %** | 15 % → **19 %** | 13 % → **6 %** | 3,38 → **2,96** | 1,71 → **1,71** |
| groß | ≥3 | 89 | 91 % → **97 %** | 9 % → **3 %** | 0 % → **0 %** | 5,12 → **4,97** | 3,57 → **3,80** |

**Torschützen je Gruppe** (Mannschaft je Partie; K2 → Referenz):

| Gruppe | Feld | Toranteil bester Abschlussspieler | Tore bester Torschütze | ≥3 Tore eines Spielers | H der Tore |
| --- | --- | ---: | ---: | ---: | ---: |
| alle | Standard | 56,9 % → 58,3 % | 1,45 → 1,35 | 19 % → 16 % | 0,454 → 0,478 |
| alle | groß | 47,1 % → 52,9 % | 1,24 → 1,22 | 11 % → 14 % | 0,378 → 0,446 |
| Favorit ab 3 | Standard | 53,7 % → 60,8 % | 3,25 → 3,03 | 64 % → 55 % | 0,461 → 0,465 |
| Favorit ab 3 | groß | 47,4 % → 49,0 % | 2,56 → 2,69 | 42 % → 51 % | 0,358 → 0,368 |
| Favorit 1–2 | Standard | 62,6 % → 63,8 % | 1,60 → 1,66 | 18 % → 19 % | 0,529 → 0,530 |
| Favorit 1–2 | groß | 42,8 % → 50,8 % | 1,39 → 1,30 | 10 % → 12 % | 0,382 → 0,413 |
| Abstand <1 | Standard | 59,0 % → 58,1 % | 1,27 → 1,16 | 12 % → 8 % | 0,434 → 0,529 |
| Abstand <1 | groß | 48,5 % → 59,0 % | 1,05 → 1,05 | 5 % → 8 % | 0,387 → 0,527 |

Beide Feldgrößen: Remis 16,3 % → 20,5 %, Favorit 1,5 Punkte 64 % → 60 % [55–64], Tore 3,86 → 3,53, Dauer 5,05 → 4,97 min (88 % in 4–6 min), kürzeste Partie 3,34 min (vorbestehend, 0:0).

In der Klasse „Abstand <1“ ist der Favorit nur das Team mit dem höheren Mittelwert. Auf dem Standardfeld ist sie mit 28/34/38 % fast zufällig und zieht die geglättete Kurve bei 1,5 Punkten nach unten; die Klasse 1–2 selbst liegt bei 65 %.

Torraten je Spielstand (Tore je volle Partie, alle Klassen; K2 → Referenz):
- Favorit gleichauf 2,49 → 2,40, +1: 2,69 → 2,46, +2: 3,45 → 3,13.
- Außenseiter gleichauf 0,97 → 0,80, −1: 0,94 → 1,00.

## Prüfungen

Node 24, Endstand `db94d0c7` (Code) plus Dokumentation. Alle Prüfungen liefen nach den Messreihen ohne parallele Lane.

**SI-Pakettests** `work/test-si-*-v183.cjs`, alle grün: core 28, clock 22, finish 20, defence 30, setplay, offball 19, options, field 14, crossing 16, scorer 8 (neu).

Neu in `test-si-scorer-v183` (im Workflow-Block):
- Vorgaben registriert.
- Führungs- und Gleichstandsintensität aus Spielstand, Grenze und Uhr.
- Wirkung auf Schuss- und Risikogewicht (SI-1) sowie auf Tempo und Zonenleine des Führenden (SI-2); neutral ohne Parameter.
- Torwartziel bei Ecken (`keeperShift`) und sonst (`keeperShiftOpen`), auch mit einem fremden Eckendatensatz.
- Keine neuen Zustandsschlüssel; ganze Konstruktorpartien auf beiden Feldgrößen.
- Regression (Review): Ein führender Ballführer im Zweikampf auf dem großen Feld erhält in SI-5 den Zweikampfaufschlag (), nicht den offenen (); gegen den Stand vor der Korrektur schlägt die Prüfung fehl (Tempo 1,007 statt 0,839).

Angepasste Tests:
- `test-si-crossing`: Die SI-K2-Torwartprüfung nutzt `keeperShiftOpen` (1 / 0,4 / 0). Die Bewacherszene läuft ohne Spielstandstempo; mit ihm kommen nur 5 von 10 Flanken, der Effekt bleibt (1,16 gegen 2,20 m).
- `test-si-offball`, `test-si-field`: exakte Tempowerte; die Szenen laufen ohne Spielstandstempo, das `test-si-scorer` prüft.
- `test-si-finish`: Die Modellgrenze „Fernschuss eines guten Schützen“ (Idealsituation, Torwart 0,3 m neben der Linie) liegt jetzt bei ≤0,40 statt ≤0,30. Abschluss 15/17 ergibt 0,22/0,40 (vorher schon 0,16/0,297). Das Live-Ziel (Fernschüsse Abschluss ≥14: 15–25 % Tore je Schuss) hält mit 24 % in `sb-f`.

**Altpartien:**
- `node work/check-old-matches-v183.cjs`: grün, 340 Szenen bytegleich gegen `e4e531c0` (unmarkiert, 182, 183 mit allen Paketen aus).
- `node work/check-old-matches-v182.cjs work/tmp-sisc/base182` (Basis per `git archive e4e531c0 dist work/test-v41.cjs`): grün, 158 Szenen.

**Restore:** `node work/check-restore-completeness-v183.cjs --port=4262 --quick` auf Lane C: grün, 10 Läufe (Stand Versuch 1). Die späteren Änderungen sind Parameterwerte und eine reine Funktion in SI-5; kein neuer Zustand, keine WeakMap.

**Workflow-Block „Spieltests ausführen“** aus `.github/workflows/deploy.yml`: alle 120 Befehle mit Exit 0 (Node 24 für `node`, Python für `python3`), einschließlich der neuen Zeile `node work/test-si-scorer-v183.cjs`.

**Artefakte zurückgesetzt:** `git checkout -- outputs docs/spieler-nutzer-rig`.

**Last:** höchstens zwei Lanes (A 4250–4255, C 4262–4267) mit je 6 Seiten, angemeldet in `work/si-integration/outputs/si183/` (Sperrverzeichnis und `queue.log`). Zwei Serien wurden durch den Neustart des Rechners um 19:26Z abgebrochen und wiederholt.

## Risiken und offene Punkte

- **Favoritenquote gegen Remis.** Über vier gleichwertige Reihen (2.304 Partien) kosten 20 % Remis rund 4 Punkte Favoritenquote bei 1,5 Punkten Abstand (64 → 60 %). Die Referenz liegt auf dem Standardfeld bei 56 % [49–63], auf dem großen Feld bei 64 %; die Klasse 1–2 Punkte bei 65 % bzw. 58 %.
  - Eine einzelne 576er-Reihe schwankt hier um ±4 Punkte (gleiche Konfiguration: 64 % in Versuch 1, 56–60 % in den späteren).
  - Stärkere Gleichstandsvorsicht (v1: `levelRisk` 0,8) brachte 25 % Remis, aber 51 % Favoritenquote.
  - Wer die Favoritenquote voll halten will, senkt `options.levelRisk`/`offball.levelPace`: bei 0,4/0,15 (G1) Remis rund 16–18 %, Favorit rund 65 %.
  - Entscheidung des Nutzers nötig: 20 % Remis mit Favorit rund 60 % oder etwa 18 % Remis mit rund 64 %.
- **Enge Duelle 35 % Remis** (Wunsch 25–30 %). Die Gleichstandsvorsicht wirkt am stärksten, wo Gleichstand am häufigsten ist. Eine Stärkung nur für ungleiche Duelle widerspräche dem Ziel, Favoriten nicht zu schwächen.
- **Tore 3,53** (Standard 3,67, groß 3,40), 0:0 6,6 % (groß 7,6 %), knapp über ≤6 %. Mehr Ausgleich über `spreadBase` hebt Fernschüsse guter Schützen (Versuch 1: 28 %) und Kopfbälle nach Ecken (36 %).
- **Kantersiege nur wenig seltener.** Die Ausgleichshebung hebt die Führungsrate wieder an. Der Favorit ab 3 Punkten schießt 5,0 Tore je Partie, sein bester Torschütze 3,03 (Standard) bzw. 2,69 (groß).
- **Aufholdruck fehlt weiter.** Zurückliegende treffen nicht häufiger. Keiner der versuchten Hebel (Schuss, Risiko, Tempo, Zonenleine) änderte das messbar. Ein echter Aufholeffekt bräuchte eine tiefere Abwehr des Führenden; die Abwehrlinie ist eine Taktikeinstellung des Nutzers (`match.defenseLines`) und wurde deshalb nicht spielstandsabhängig gemacht.
- **Torjäger:** weiches Ziel, unverändert hoch (Abschnitt Befunde). Der Ligatorschützenkönig der Kompaktsimulation wird nach der Neuangleichung ähnlich hoch bleiben (Schätzung aus der Reihe: Standard 31, groß 26).
- **Ecken:** Luftabschlüsse nach Ecken auf dem Standardfeld 36 % (K2 28 %), groß 27 %, beide 32 %. Der Torwart steht bei Ecken unverändert (1,85 m neben der Linie). Die Hebung kommt aus der allgemein genaueren Schussstreuung.
- **Kürzeste Partie** 3,34 min (vorbestehend, 0:0-Partien), Abprallergewinn und Frische wie in SI-K2 offen.
- **Sponsorziel „mindestens N Tore“:** nicht Teil dieser Runde (Entscheidung 16. Oktober: Anhebung für neue Spielstände).

## Reproduktion

```powershell
$node='C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
# Referenzreihe (Vorgaben), höchstens zwei Lanes gleichzeitig
& $node work/measure-si-calibration-v183.cjs --clubs=96 --workers=6 --port=4250 --traceLimit=40000 --label=sb-f
& $node work/measure-si-calibration-v183.cjs --clubs=96 --workers=6 --port=4262 --traceLimit=40000 --seedPrefix=si183b --label=sb-f
& $node work/measure-si-calibration-v183.cjs --clubs=96 --workers=6 --port=4250 --traceLimit=40000 --seedPrefix=si183c --label=sb-f
& $node work/table-si-calibration-v183.cjs sb-f-trace40000,sb-f-si183b-trace40000,sb-f-si183c-trace40000 k2-f-trace40000,k2-f-si183b-trace40000,k2-f-si183c-trace40000 --strength
```
