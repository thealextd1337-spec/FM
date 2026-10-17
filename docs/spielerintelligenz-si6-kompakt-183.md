# Spielerintelligenz 183: Kompaktsimulation folgt dem ausgespielten Spiel (SI-6, P02)

Stand: 16. Oktober 2026. Branch `feat/si-compact` (Worktree `work/si-compact`), abgezweigt von `integration/si-r133` = `a95fe8d2` (alle SI-Pakete, B22 und die Schlusskalibrierung SI-K2). Auftrag: Paket SI-6 des [Umsetzungsplans](spielerintelligenz-umsetzungsplan-2026-10-14.md) (Abschnitt „SI-6 P02“), Analyse 7.1 der [Spielerintelligenz-Analyse](spielerintelligenz-analyse-2026-10-14.md). Keine Veröffentlichung, keine Fußversion, kein WebGL-Build, kein Push; den Merge übernimmt die Integration.

**Neuanpassung 17. Oktober 2026 (Branch `feat/si-compact2`):** Die Parameter- und Ergebnistabellen bis zum Review beschreiben den Stand von SI-6 gegen die Reihe SI-K2. Der aktuelle Parametersatz und die aktuellen Zahlen gegen die Endstufe `sb2-f` stehen im Abschnitt „Neuanpassung an sb2-f“ (Konstanten, Kriterien, Saisonebene, Prüfungen).

Gilt nur für neue Partien (Kennung `shotBalanceRevision` 183). Bestehende Spielstände, laufende Partien und Partien mit Kennung 178, 119 oder ohne Kennung bleiben bytegleich; es gibt keine Umrechnung gespeicherter Ergebnisse. Die alte Sechserliga ist unberührt. Fähigkeiten bleiben Farbstufen, die Oberfläche zeigt keine neuen Zahlen.

## Ergebnis in Kürze

- **Neue Kompaktsimulation** für alle Partien, die der Manager nicht ausspielt (Liga, Pokal, Europacup): Die erwarteten Schüsse je Mannschaft folgen dem Stärkeabstand, jeder Schuss hat eine Quelle (Spielzug, Fernschuss, Kopfball/Volley, Abpraller, Ecke, Freistoßfolge, direkter Freistoß), einen nach Rolle und Fähigkeit gewichteten Schützen und ein Ergebnis aus Abschluss und Torwart (`gk`-Hebel). Ecken, Flanken, Fouls und Freistöße entstehen als Mannschaftsstatistik, das Belastungsprofil ist nachkalibriert.
- **Gegen die physische Abnahmereihe SI-K2** (dieselben 567 Fixtures, 16 kompakte Wiederholungen je Fixture = 9.072 Partien): Schüsse -0,9 % (Standard) / -1,0 % (groß), Tore -3,7 % / -1,5 %, aufs Tor -1,0 % / -1,5 %. Favoritensiege bei 1,5 Punkten Abstand geglättet 68 % / 64 % (physisch 67 % / 61 %), bei 4 Punkten 94 % / 90 % (93 % / 90 %). Remis schwacher Teams -0,2 Punkte (beide Felder, 118 physische Partien). Torkonzentration auf den besten Abschlussspieler einer Mannschaft wie im ausgespielten Spiel (Abschnitt Review). Frischeverbrauch je Linie und je Ausdauerklasse auf ±0,6 Punkte, Fouls, Ecken und Flanken auf ±2 %.
- **Kriterien des Plans:** alle erfüllt.
- **Wirkung auf die Welt:** Tore je Partie in der Vereinswelt steigen von 1,4 (Kennung 178) auf 4,0 (183), entsprechend dem Torziel 3–5 vom 15. Oktober. Das ist die gewollte Folge von „kompakt folgt ausgespielt“, aber die größte sichtbare Änderung: Torschützenkönig der Ligen im Mittel 6 → 30 Tore (ausgespielt ist der beste Abschlussspieler ebenso stark beteiligt, Abschnitt Review), 0:0 25,6 % → 3,4 %, Punktspanne der Tabellen 16,1 → 30,9 (Abschnitt Saisonebene).
- **Nur neue Partien, keine Veröffentlichung:** Kennung 178, 119 und unmarkierte Partien sind gegen den eingefrorenen Controller bytegleich; Test `work/test-compact-balance-v183.cjs` neu im Workflow-Block.

## Entwurf

### Kennung und Schaltung

- `v155Initialize` (`dist/world-player-performance-v155.js`) setzt für neue Matchzustände `shotBalanceRevision:183` und `compactBalance` = tiefe Kopie der Konstanten `v183CompactBalance` für die Feldgröße der Welt (`career.world.matchConfig.fieldSize`; Welten ohne Matchkonfiguration zählen als Standardfeld). Der Aktionsweg liest nur diese gespeicherte Kopie; Fortsetzung nach JSON-Laden bleibt exakt, spätere Neukalibrierungen ändern keine laufende Partie.
- `v155CompactActions` leitet die Kennung 183 in der ersten Zeile an `v183CompactActions` weiter. Kennung 178, 119 und „ohne Kennung“ laufen unverändert den alten Weg (`v178CompactShotChance`, Tor-/Torwartformeln von v178); bestehende Performancezustände werden nie neu markiert.
- `v64Step` (`dist/world-match-v64.js:301-303`) überspringt bei Kennung 183 die bisher ungenutzte Stärke-/Chanceberechnung des Kompaktschritts und ruft die Aktion direkt auf. Der Nachspielzeitwurf (16 % je Minute und Seite) bleibt. `v64FinishFixture` (`dist/world-match-v64.js:326`) legt bei 183 `record.teamStats` an (Kopie der Mannschaftsstatistik).
- Physische Partien (eigene Spiele) durchlaufen denselben Matchkonstruktor und tragen die Kennung ebenfalls, nutzen aber ihren Ledger und nie den Kompaktschritt; ihre Engine ist unverändert (`check-old-matches-v183` grün).

### Modell je Minute und Mannschaft

1. **Erwartete Schüsse** λ = `shotBase` · exp(`shotSlope` · Stärkeabstand) · 1,03 (nur Heimseite auf nichtneutralem Platz) · Faktor der tiefen Abwehrlinie des Gegners (`defense`=Tief); ab 5,5 Punkten Abstand wirkt der Abstand nur noch zu 15 %, und bei diesen Abständen zählt der Teil über einem Plateau (11,5 Schüsse im Standardfeld, 10 im großen) nur noch zu einem Zehntel (Einblendung über 0,5 Punkte). Beides setzt die Referenz fort, in der die Favoritenschüsse bei 4–7 Punkten Abstand bei rund 11,7 (Standardfeld) auslaufen; darüber gibt es nur 22 physische Partien (über 6 Punkten 9). Stärkeabstand = Mittel der acht Feldfähigkeiten (spd, tec, pas, fin, tak, pos, air, sta) der aktiven Feldspieler beider Seiten, gespeicherte Werte; dieselbe Größe `ovr` wie in der physischen Reihe. Pro Minute und Seite fällt ein Schuss mit λ/97,7 (mittlere Spieldauer).
2. **Quelle** des Schusses aus dem Mix der Feldgröße: Spielzug, Fernschuss, Kopfball/Volley, Abpraller, Ecke, Freistoßfolge, direkter Freistoß.
3. **Schütze** unter den Feldspielern: Gewicht = Rollenfaktor · exp(Steigung · (Fähigkeit − 10)). Fähigkeit ist der Abschluss, bei Kopfbällen und Ecken die Luftstärke. Rollenfaktoren und Steigungen sind eine Poisson-Anpassung an 8.600 Spielerzeilen der Reihe K2 (Spielzug 0,185, Fernschuss 2,4/0,8, Kopfball 0,18, Abpraller 0,4, Freistoß 0,159 je Fähigkeitspunkt) und danach so skaliert, dass der Schussanteil je Rolle dem physischen entspricht.
4. **Ergebnis:** aufs Tor mit σ(Basis[Quelle] + 0,196·(Abschluss − 10) + 0,06·Stärkeabstand), Tor mit σ(Basis[Quelle] + 0,173·(Abschluss − 10) − 0,148·(Torwart `gk` − 10)). Abschluss und Torwart sind die wirksamen Werte mit Frische und Form des Belastungsmodells (`v158Ability`). Der Torwart wirkt also über seine Fähigkeit; es gibt keinen festen Deckel mehr. Die Abschlusshebel sind über alle Mannschaften angepasst; innerhalb einer Mannschaft trifft der beste Abschlussspieler im ausgespielten Spiel kaum besser als seine Mitspieler (Spielzug 28 % gegen 29 %). Deshalb zählt als Abschluss der erwartete Schütze der Mannschaft für diese Quelle (gleiche Gewichte wie die Schützenwahl) plus nur 30 % (`levers.finSelf`) der eigenen Abweichung davon (`v183ShooterFinishing`, Review).
5. **Vorlage:** je Quelle ein Anteil der Tore ist vorbereitet (Spielzug 80 %, Fernschuss 15 %, Kopfball 90 %, Freistoßfolge 60 %, Abpraller und direkter Freistoß 0 %); Geber nach den bisherigen Rollengewichten (Spielmacher, Flügel, Zielspieler doppelt). Das ausgespielte Spiel zählt keine Vorlagen, es gibt dort keinen Vergleichswert.
6. **Passkette und Zweikampf:** Eine Schussminute beginnt mit einem vollendeten Pass; jede andere Minute behält den Passversuch mit Erfolgswahrscheinlichkeit und den Zweikampf von Kennung 178. Damit bleiben Passereignisse, Belastungseinträge und Noten in Art und Menge gleich.
7. **Statistik:** Ecken, Flanken, Fouls und Freistöße laufen auf eigenen Minutenwürfen mit den Raten der physischen Reihe je Feldgröße. Jeder Kopfball-/Eckschuss zählt eine Flanke. Fouls werden dem foulenden Spieler (Abwehr stärker, Zweikampfwert) gutgeschrieben und stehen in seiner Spielerzeile; die Mannschaftswerte stehen im Matchzustand (`compactStats`) und im Spielbericht (`record.teamStats`).
8. **Belastung:** Das Laufen der Spieler ohne eigenes Ereignis (Positionsspiel, Doppeln, Pressing) fehlte im Kompaktmodell. `v183CompactBackground` (`dist/world-player-load-v158.js:226`) bucht je Linie Laufeinheiten (`load.background`), gesammelt und alle fünf Minuten als ein Ereignis. `v158CompactOffers`/`-Contact` bleiben unverändert.

Was bewusst gleich bleibt: kleiner relativer Heimaufschlag (1,03, neutral keiner), der Nachspielzeitwurf, KI-Wechsel und -Taktik, Noten (`D6MatchRatings`), Entwicklung und Buchung sowie alle Welt- und Pokalregeln (Pokalvereine mindestens 10 % schwächer, strenge Ligaspitzen, seltene Elite). Kein Ergebnis wird gesetzt: Tore und Siege folgen ausschließlich aus Schussmenge, Abschluss und Torwart.

### Parameter (Vorgaben neuer Partien, Standardfeld / großes Feld; Stand SI-6, aktuell siehe „Neuanpassung an sb2-f“)

| Schlüssel | Standardfeld | großes Feld | Bedeutung |
| --- | ---: | ---: | --- |
| `shotBase` | 5,754 | 5,656 | erwartete Schüsse eines Teams bei gleicher Stärke (ohne Heimaufschlag, durch 1,015 geteilt) |
| `shotSlope` | 0,1293 | 0,1001 | Logarithmus der Schusszahl je Stärkepunkt Abstand |
| `gapKnee` / `gapOver` / `gapFade` | 5,5 / 0,15 / 0,5 | gleich | ab 5,5 Punkten Abstand wirkt der Abstand nur noch mit dem Faktor 0,15 (die Referenz hat über 5,5 Punkten 22 Partien, über 6 Punkten 9; die Schüsse des Favoriten laufen dort bei rund 11,7 aus) |
| `shotKnee` / `shotOver` | 11,5 / 0,1 | 10 / 0,1 | über dieser Schusszahl zählt nur noch der Anteil `shotOver` (Plateau der Favoritenschüsse in der Referenz: rund 11,7 im Standardfeld, 10 im großen) |
| `homeShotFactor` | 1,03 | gleich | relativer Heimaufschlag, nur Heimseite, nie neutral (Produktregel unverändert) |
| `deepDefenceShots` | 1,41 | 1,37 | Faktor auf die Schüsse des Gegners einer Mannschaft mit tiefer Linie (physisch gemessen, Konterstil) |
| `matchMinutes` | 97,7 | gleich | mittlere Spielminuten einschließlich Nachspielzeit |
| Mix Schüsse je Partie | open 7,57, long 1,79, header-volley 1,60, rebound 0,47, corner 0,12, free-kick-follow 1,55, direct-free-kick 0,28 | open 6,12, long 3,79, header-volley 1,18, rebound 0,44, corner 0,03, free-kick-follow 1,03, direct-free-kick 0,15 | Schussquellen |
| `levers` | aufs Tor 0,196/Abschlusspunkt, 0,06/Abstandspunkt; Tor 0,173/Abschlusspunkt, -0,148/Torwartpunkt; eigene Abweichung vom erwarteten Schützen der Mannschaft zählt mit `finSelf` 0,3 | gleich | Hebel aus der Anpassung an die K2-Schüsse |
| Basis aufs Tor je Quelle (Logit) | open -0,340, long -0,937, header-volley 0,218, rebound -0,082, corner 0,218, free-kick-follow -0,383, direct-free-kick -1,075 | open -0,228, long -0,871, header-volley -0,019, rebound 0,114, corner -0,019, free-kick-follow -0,274, direct-free-kick -1,301 | |
| Basis Tor je Quelle (Logit) | open 0,095, long -0,832, header-volley 0,983, rebound 1,136, corner 0,983, free-kick-follow -0,064, direct-free-kick -1,136 | open 0,506, long -0,886, header-volley 1,072, rebound 0,742, corner 1,072, free-kick-follow 0,225, direct-free-kick -0,705 | |
| Schützensteigung je Fähigkeitspunkt | Spielzug 0,185, Fernschuss 2,4, Kopfball 0,18, Abpraller 0,4, Freistoß 0,159, direkt 0,9 | Fernschuss 0,8 | Auswahlgewicht exp(Steigung·(Fähigkeit−10)) |
| Ecken, Flanken (ohne Kopfballschüsse), Fouls, Freistöße (zusätzlich) je Team und Partie | 0,845 / 1,6 / 1,97 / 0,03 | 0,7 / 1 / 1,4 / 0,095 | Raten der physischen Reihe je Feldgröße |
| Laufeinheiten je Minute (Abwehr / Mittelfeld / Angriff / Torwart) | 0,176 / 0,272 / 0,152 / 0,026 | 0,198 / 0,287 / 0,176 / 0,026 | Hintergrundlaufen, auf den Frischeverbrauch der Referenz kalibriert |
| Vorlagenanteil je Quelle | open 0,8, long 0,15, header-volley 0,9, rebound 0, corner 0,9, free-kick-follow 0,6, direct-free-kick 0 | gleich | |

## Messaufbau

- **Referenz** ist die Abnahmereihe SI-K2 ([SI-K2](spielerintelligenz-sik2-calibration-183.md)): 576 vollständige physische Partien, 96 Vereine × 2 Feldgrößen × 3 Seed-Sätze (`outputs/si183/k2-f*-trace40000.json`, gitignoriert). Je Partie liegen Mannschaftswerte (`ovr`, Fähigkeiten, Torwart), Mannschaftsstatistik und Schussdaten vor.
- **Dieselben Fixtures:** `work/measure-compact-physical-v183.cjs` baut die Welten der 576 Partien in Node nach (gleicher Welt-Seed, Verein, Feldgröße; erstes Pflichtspiel; synchroner Aufbau wie `measure-si-r132`) und spielt jede Partie 16-mal kompakt. Kontrolle: Die Stärke beider Mannschaften muss dem physischen Eintrag entsprechen; 9 Fixtures, deren KI-Gegner in der Browserreihe eine andere Elf hatte, bleiben auf beiden Seiten außen vor. Die Wiederholungen verwenden eine abgewandelte Spiel-ID, so dass nur die Zufallsfolge wechselt.
- **Klassen** wie in `table-si-calibration-v183 --strength`: Favorit = Mannschaft mit höherem `ovr`, Stärkeabstand in Punkten (0–1, 1–2, 2–3, ab 3). Die Klassen der physischen Reihe sind klein (47–88 Partien, 95-%-Intervall des Siegeranteils rund ±12 Punkte); deshalb wird zusätzlich die logistische Anpassung P(Favorit siegt) über den Abstand verglichen.
- **Last:** Nur Node, bis zu vier Prozesse; keine Browserseite, keine neue physische Reihe.

Auswertung: `work/table-compact-physical-v183.cjs rv` (Ausgabe unten unverändert übernommen; Stand nach dem Review mit `levers.finSelf` 0,3, Abschnitt Review).

## Ergebnis: kompakt gegen physisch

### Standardfeld (physisch 284, kompakt 4544)

| Kennzahl | physisch | kompakt | Abweichung |
| --- | ---: | ---: | ---: |
| Schüsse je Partie | 13,40 | 13,28 | -0,9 % |
| aufs Tor | 7,24 | 7,17 | -1,0 % |
| Tore je Partie | 4,03 | 3,88 | -3,7 % |
| Streuung der Tore | 2,41 | 2,39 | -1,2 % |
| 0:0 | 5,3 % | 3,6 % | -1,7 P. |
| ≥ 7 Tore | 16,2 % | 13,1 % | -3,1 P. |
| Ecken | 1,69 | 1,69 | +0,0 % |
| Flanken | 4,86 | 4,90 | +1,0 % |
| Fouls | 3,93 | 3,95 | +0,5 % |
| Freistöße | 4,00 | 4,01 | +0,4 % |
| Tore je Schuss | 30,1 % | 29,2 % | -0,8 P. |
| aufs Tor je Schuss | 54,1 % | 54,0 % | -0,1 P. |

| Abstand | Partien phys / komp | Sieg Favorit phys → komp | Remis phys → komp | Niederlage phys → komp | Tore phys → komp | Schüsse Favorit/Außenseiter phys → komp | Tore Favorit/Außenseiter phys → komp |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0-1 | 88 / 1408 | 51 % → 50 % (-1,4 P.) | 24 % → 22 % (-1,4 P.) | 25 % → 28 % | 3,43 → 3,12 | 7,4/5,8 → 6,6/5,8 | 2,06/1,38 → 1,83/1,29 |
| 1-2 | 62 / 992 | 65 % → 69 % (+4,8 P.) | 18 % → 17 % (-1,1 P.) | 18 % → 14 % | 3,13 → 3,29 | 8,1/4,6 → 8,1/5,0 | 2,13/1,00 → 2,38/0,92 |
| 2-3 | 48 / 768 | 79 % → 80 % (+0,7 P.) | 19 % → 13 % (-5,7 P.) | 2 % → 7 % | 3,58 → 3,57 | 8,5/3,8 → 8,9/4,5 | 2,92/0,67 → 2,84/0,73 |
| >=3 | 86 / 1376 | 94 % → 94 % (-0,1 P.) | 2 % → 4 % (+2,1 P.) | 3 % → 1 % | 5,55 → 5,27 | 11,0/3,6 → 10,6/3,6 | 4,93/0,62 → 4,76/0,51 |

Geglättet (logistische Anpassung): Favorit bei 1,5 Punkten 67 % → 68 % (+0,9 P.), bei 4 Punkten 93 % → 94 % (+1,4 P.)

Schwache Teams (beide Mannschaften unter 10,5 Punkten): Partien 46 / 736, Remis 28 % → 24 % (-4,5 P.), Tore 2,78 → 2,71

| Schussquelle | je Partie phys | je Partie komp | Tore je Schuss phys | Tore je Schuss komp | Schützenwert Abschluss phys | Abschluss komp |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| open | 7,56 | 7,46 | 29 % | 29 % | 12,53 | 12,48 |
| long | 1,79 | 1,80 | 23 % | 17 % | 15,18 | 13,53 |
| header-volley | 1,61 | 1,61 | 42 % | 42 % | 11,29 | 11,40 |
| rebound | 0,47 | 0,46 | 50 % | 47 % | 13,14 | 12,80 |
| corner | 0,12 | 0,12 | 56 % | 42 % | 12,42 | 11,41 |
| free-kick-follow | 1,55 | 1,55 | 25 % | 26 % | 11,98 | 12,51 |
| direct-free-kick | 0,28 | 0,28 | 13 % | 13 % | 13,90 | 13,15 |

| Rolle | Schüsse-Anteil phys | komp | Tor-Anteil phys | komp | Assist-Anteil komp |
| --- | ---: | ---: | ---: | ---: | ---: |
| striker | 37,5 % | 35,3 % | 34,2 % | 34,3 % | 4,7 % |
| poacher | 21,3 % | 21,0 % | 19,7 % | 21,3 % | 3,2 % |
| box-to-box | 12,8 % | 13,5 % | 13,8 % | 13,6 % | 8,1 % |
| playmaker | 8,2 % | 8,0 % | 9,2 % | 7,3 % | 22,6 % |
| target-player | 6,0 % | 6,8 % | 6,1 % | 6,1 % | 3,7 % |
| cover-defender | 4,4 % | 4,7 % | 6,4 % | 5,9 % | 15,5 % |
| ball-winner | 3,0 % | 3,0 % | 3,5 % | 3,0 % | 9,4 % |
| stopper | 2,7 % | 3,2 % | 2,7 % | 3,6 % | 17,3 % |
| ball-playing-defender | 1,9 % | 2,3 % | 2,4 % | 2,9 % | 12,5 % |
| dribbler | 1,8 % | 2,0 % | 1,8 % | 1,7 % | 1,4 % |
| winger | 0,3 % | 0,3 % | 0,2 % | 0,3 % | 1,7 % |

Assists je Tor (komp): 0,69; im ausgespielten Spiel werden keine Vorlagen gezählt.

| Verbrauch (Frischepunkte, volle Partie) | physisch | kompakt |
| --- | ---: | ---: |
| Abwehr | 53,6 | 53,7 |
| Mittelfeld | 55,1 | 54,8 |
| Angriff | 58,4 | 58,3 |
| Torwart | 17,4 | 17,6 |
| Ausdauer 0–8 | 66,3 | 65,7 |
| Ausdauer 8–10 | 61,1 | 61,2 |
| Ausdauer 10–12 | 55,5 | 55,8 |
| Ausdauer 12–14 | 50,6 | 50,8 |
| Ausdauer 14–21 | 42,7 | 43,0 |

### großes Feld (physisch 283, kompakt 4528)

| Kennzahl | physisch | kompakt | Abweichung |
| --- | ---: | ---: | ---: |
| Schüsse je Partie | 12,77 | 12,64 | -1,0 % |
| aufs Tor | 6,67 | 6,57 | -1,5 % |
| Tore je Partie | 3,68 | 3,62 | -1,5 % |
| Streuung der Tore | 2,21 | 2,19 | -0,9 % |
| 0:0 | 3,5 % | 4,3 % | +0,7 P. |
| ≥ 7 Tore | 11,0 % | 9,9 % | -1,1 P. |
| Ecken | 1,41 | 1,42 | +1,1 % |
| Flanken | 3,16 | 3,17 | +0,2 % |
| Fouls | 2,83 | 2,81 | -0,7 % |
| Freistöße | 3,02 | 2,99 | -1,0 % |
| Tore je Schuss | 28,8 % | 28,7 % | -0,1 P. |
| aufs Tor je Schuss | 52,2 % | 52,0 % | -0,2 P. |

| Abstand | Partien phys / komp | Sieg Favorit phys → komp | Remis phys → komp | Niederlage phys → komp | Tore phys → komp | Schüsse Favorit/Außenseiter phys → komp | Tore Favorit/Außenseiter phys → komp |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0-1 | 81 / 1296 | 42 % → 46 % (+4,3 P.) | 26 % → 23 % (-2,8 P.) | 32 % → 31 % | 2,88 → 3,01 | 6,7/6,0 → 6,4/5,8 | 1,58/1,30 → 1,68/1,33 |
| 1-2 | 68 / 1088 | 63 % → 65 % (+1,4 P.) | 21 % → 19 % (-1,7 P.) | 16 % → 16 % | 2,99 → 3,22 | 7,4/5,0 → 7,4/5,1 | 2,04/0,94 → 2,20/1,02 |
| 2-3 | 47 / 752 | 72 % → 77 % (+4,8 P.) | 15 % → 14 % (-1,1 P.) | 13 % → 9 % | 3,38 → 3,39 | 7,6/4,0 → 7,9/4,7 | 2,53/0,85 → 2,63/0,76 |
| >=3 | 87 / 1392 | 91 % → 90 % (-0,6 P.) | 9 % → 8 % (-1,6 P.) | 0 % → 2 % | 5,13 → 4,64 | 9,5/4,2 → 9,2/4,0 | 4,33/0,79 → 4,04/0,60 |

Geglättet (logistische Anpassung): Favorit bei 1,5 Punkten 61 % → 64 % (+2,9 P.), bei 4 Punkten 90 % → 90 % (+0,5 P.)

Schwache Teams (beide Mannschaften unter 10,5 Punkten): Partien 72 / 1152, Remis 18 % → 21 % (+2,5 P.), Tore 2,67 → 2,75

| Schussquelle | je Partie phys | je Partie komp | Tore je Schuss phys | Tore je Schuss komp | Schützenwert Abschluss phys | Abschluss komp |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| open | 6,15 | 6,04 | 34 % | 34 % | 12,08 | 12,14 |
| long | 3,77 | 3,80 | 15 % | 15 % | 13,35 | 13,03 |
| header-volley | 1,17 | 1,16 | 39 % | 39 % | 11,32 | 11,27 |
| rebound | 0,45 | 0,45 | 45 % | 44 % | 12,63 | 12,46 |
| corner | 0,03 | 0,03 | 0 % | 44 % | 12,13 | 11,26 |
| free-kick-follow | 1,02 | 1,02 | 28 % | 30 % | 11,68 | 12,17 |
| direct-free-kick | 0,16 | 0,15 | 14 % | 15 % | 13,31 | 13,06 |

| Rolle | Schüsse-Anteil phys | komp | Tor-Anteil phys | komp | Assist-Anteil komp |
| --- | ---: | ---: | ---: | ---: | ---: |
| striker | 38,0 % | 35,9 % | 30,8 % | 36,2 % | 8,2 % |
| poacher | 22,8 % | 22,4 % | 21,0 % | 21,7 % | 5,5 % |
| box-to-box | 13,5 % | 14,0 % | 18,9 % | 16,2 % | 8,4 % |
| dribbler | 6,2 % | 6,5 % | 3,3 % | 3,8 % | 1,5 % |
| playmaker | 6,0 % | 6,3 % | 10,0 % | 6,6 % | 22,4 % |
| target-player | 5,4 % | 5,1 % | 5,9 % | 4,4 % | 4,6 % |
| stopper | 2,2 % | 2,1 % | 2,6 % | 2,6 % | 14,7 % |
| cover-defender | 2,0 % | 3,2 % | 3,5 % | 4,2 % | 13,2 % |
| ball-winner | 1,8 % | 1,9 % | 1,8 % | 1,9 % | 8,1 % |
| ball-playing-defender | 1,3 % | 1,5 % | 1,4 % | 1,8 % | 9,9 % |
| winger | 0,7 % | 1,0 % | 0,7 % | 0,6 % | 3,4 % |

Assists je Tor (komp): 0,64; im ausgespielten Spiel werden keine Vorlagen gezählt.

| Verbrauch (Frischepunkte, volle Partie) | physisch | kompakt |
| --- | ---: | ---: |
| Abwehr | 53,5 | 53,5 |
| Mittelfeld | 54,6 | 54,3 |
| Angriff | 59,4 | 59,2 |
| Torwart | 17,2 | 17,3 |
| Ausdauer 0–8 | 66,1 | 66,0 |
| Ausdauer 8–10 | 60,4 | 60,7 |
| Ausdauer 10–12 | 55,1 | 55,4 |
| Ausdauer 12–14 | 50,1 | 50,5 |
| Ausdauer 14–21 | 42,2 | 42,8 |

### Beide Feldgrößen

Schüsse 13,08 → 12,96 (-0,9 %), Tore 3,86 → 3,75 (-2,6 %); schwache Teams (beide unter 10,5 Punkten): Partien 118 / 1888, Remis 22 % → 22 % (-0,2 P.), Tore 2,71 → 2,73

### Kriterien (Plan SI-6)

| Kriterium | Standard | groß | beide | Urteil |
| --- | ---: | ---: | ---: | --- |
| Schüsse je Partie (≤ 10 %) | -0,9 % | -1,0 % | -0,9 % | ✓ |
| Tore je Partie (≤ 10 %) | -3,7 % | -1,5 % | -2,6 % | ✓ |
| Favorit bei 1,5 Punkten geglättet (≤ 5 Punkte) | +0,9 P. | +2,9 P. | – | ✓ |
| Favorit bei 4 Punkten geglättet (≤ 5 Punkte) | +1,4 P. | +0,5 P. | – | ✓ |
| Remis schwacher Teams (± 5 Punkte) | -4,5 P. (46 physische Partien) | +2,5 P. (72) | -0,2 P. (118) | ✓ |
| aufs Tor (Anteil der Schüsse) | -0,1 P. | -0,2 P. | – | ✓ |
| Tore je Schuss | -0,8 P. | -0,1 P. | – | ✓ |

Je Stärkeabstand und Feldgröße (Abweichung kompakt gegen physisch):

| Feld | Abstand | physische Partien | Schüsse | Tore | Sieg Favorit | Remis |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Standard | 0-1 | 88 | -6,1 % ✓ | -9,1 % ✓ | -1,4 P. ✓ | -1,4 P. |
| Standard | 1-2 | 62 | +2,3 % ✓ | +5,3 % ✓ | +4,8 P. ✓ | -1,1 P. |
| Standard | 2-3 | 48 | +8,9 % ✓ | -0,4 % ✓ | +0,7 P. ✓ | -5,7 P. |
| Standard | >=3 | 86 | -2,6 % ✓ | -5,0 % ✓ | -0,1 P. ✓ | +2,1 P. |
| groß | 0-1 | 81 | -4,9 % ✓ | +4,7 % ✓ | +4,3 P. ✓ | -2,8 P. |
| groß | 1-2 | 68 | +1,1 % ✓ | +7,8 % ✓ | +1,4 P. ✓ | -1,7 P. |
| groß | 2-3 | 47 | +8,8 % ✓ | +0,2 % ✓ | +4,8 P. ✓ | -1,1 P. |
| groß | >=3 | 87 | -3,6 % ✓ | -9,6 % ✓ | -0,6 P. ✓ | -1,6 P. |

Die Tabellen sind die Auswertung; hier die Einordnung der Abweichungen:

- Keine Klasse liegt außerhalb der Grenzen.
- Knapp an der Grenze (über 80 % des erlaubten Abstands): Tore Standard 0-1 (-9,1 %); Favoritensieg Standard 1-2 (+4,8 Punkte); Schüsse Standard 2-3 (+8,9 %); Favoritensieg groß 0-1 (+4,3 Punkte); Favoritensieg groß 2-3 (+4,8 Punkte); Schüsse groß 2-3 (+8,8 %); Tore groß >=3 (-9,6 %). Das sind die Klassen mit den kleinsten physischen Stichproben.
- Das Intervall der physischen Klassen ist groß: 47–88 Partien je Klasse bedeuten rund ±12 Punkte beim Siegeranteil (95 %). Dieselbe Klasse schwankte zwischen gleichwertigen physischen Reihen um bis zu 20 Punkte (siehe SI-K2). Die kompakten Klassen haben 16-mal so viele Partien und sind genau; die Abweichung kommt zu großen Teilen vom Stichprobenfehler der Referenz. Die geglättete Anpassung (alle Partien, nicht je Klasse) weicht bei 2,9 Punkten oder weniger ab.
- Remis schwacher Teams: Standardfeld -4,5 Punkte (46 physische Partien), großes Feld +2,5 Punkte (72), beide Felder -0,2 Punkte (118). „Schwach“ heißt: beide Mannschaften unter 10,5 Punkten Stärke (untere Hälfte der Reihe).
- Torwarthebel (`gk`): Physisch gewinnt ein Schütze gegen Torwart 10–14 in 59 % der Schüsse aufs Tor, gegen Torwart ab 14 in 44 % (Abstand 14,6 Punkte, SI-K2). Das kompakte Ergebnismodell liefert bei Abschluss 12,5 und Torwart 12 gegen 16,5 im Spielzug 56 → 39 % (Standardfeld; großes Feld 66 → 49 %), bei Kopfbällen 75 → 61 % und bei Fernschüssen 33 → 20 %, also 13–17 Punkte Abstand; der Test prüft die Spanne 10–20 Punkte. Die Abschlusssteilheit (Abschluss ≥ 14 gegen < 10) folgt aus den Hebeln 0,196 und 0,173 je Punkt.
- Keine Tore, Siege oder Quoten sind gesetzt: Die Kompaktpartie zieht Schüsse, Quellen, Schützen und Ergebnisse aus den Fähigkeiten; die Tabellen zeigen die Folge, nicht die Eingabe.

## 1.700-Fixture-Matrix (wie v178)

`work/validate-compact-balance-v183.cjs` spielt die archivierten 1.700 Fixtures der v178-Matrix (fünf Startwelten, Top/Unten 500, Fable 1.200, gekoppelte Neutralfälle) nativ mit Kennung 183; jede Partie auf einer frischen Weltkopie. Sie sind Startwelten ohne Matchkonfiguration, also Standardfeld. Geprüft werden nur Produktkorridore (10–16 Schüsse je Partie in jeder der sieben Serien, Top schlägt Unten, Tore im Band der physischen Klassen 2–6); das Vergleichsbild ist die v178-Matrix, kein Ziel.

| Serie | Spiele | Schüsse/Spiel 178 → 183 | Tore/Spiel 178 → 183 | 0:0 178 → 183 | A-Siege / Remis / B-Siege (183) |
| --- | ---: | ---: | ---: | ---: | --- |
| Top gegen Top | 100 | 13,81 → 13,97 | 1,75 → 4,82 | 18,0 % → 1,0 % | 47 / 20 / 33 |
| Schwache Liga untereinander | 100 | 11,74 → 12,92 | 1,31 → 2,26 | 39,0 % → 12,0 % | 40 / 29 / 31 |
| Top gegen schwache Liga | 500 | 12,52 → 15,42 | 1,53 → 6,66 | 22,6 % → 0,6 % | 496 / 4 / 0 |
| Schwache Liga gegen stärkste Pokalvereine | 500 | 11,91 → 14,77 | 1,32 → 2,97 | 27,0 % → 7,2 % | 400 / 71 / 29 |
| A-Rang 3/4 gegen AUT/SUI/TUR Top 2 | 300 | 12,53 → 13,37 | 1,46 → 3,50 | 23,3 % → 4,0 % | 65 / 56 / 179 |
| Heimspiegel | 100 | 12,79 → 15,64 | 1,50 → 6,71 | 21,0 % → 0,0 % | 100 / 0 / 0 |
| Neutrale Kontrolle | 100 | 12,61 → 15,54 | 1,49 → 6,69 | 21,0 % → 0,0 % | 100 / 0 / 0 |
| alle | 1700 | 12,39 → 14,66 | 1,45 → 4,65 | 24,5 % → 3,8 % | |

Mannschaftsstatistik je Partie (beide Teams, alle 1.700 Partien): Schüsse 14,66, aufs Tor 7,76, Ecken 1,78, Flanken 5,10, Fouls 4,00, Freistöße 4,06. Pro Spiel 14,66 Schüsse liegen im Produktkorridor 10–16; die v178-Matrix hatte 1,45 Tore je Spiel, die neue 4,65.

## Saisonebene

`work/measure-compact-seasons-v183.cjs` spielt vollständige Saisonen der neuen Vereinswelt (12 Länder, 991 Partien je Saison, der Manager spielt nicht aus) einmal mit Kennung 183 und einmal mit 178 auf denselben Welten (standard: si6-season-a; large: si6-season-b). Die Werte der Kennung 183 stammen aus dem Lauf nach dem Review (`finSelf` 0,3); dieser Lauf lief parallel zu anderen Messungen, seine Rechenzeit (170 s / 190 s) ist deshalb nicht vergleichbar, die Rechenzeitzeile zeigt den ungestörten Lauf vor dem Review.

### Standardfeld (3 Saisonen, Welt si6-season-a, Verein AUT-5)

| Kennzahl (Mittel der Saisonen) | Kennung 178 | Kennung 183 |
| --- | ---: | ---: |
| Tore je Partie (alle Wettbewerbe) | 1,39 | 4,03 |
| Tore je Ligaspiel | 1,39 | 3,94 |
| Streuung der Tore | 1,19 | 2,41 |
| 0:0 | 25,4 % | 3,5 % |
| Heimsiege | 30,2 % | 43,2 % |
| Remis | 38,1 % | 14,3 % |
| Punktspanne Tabelle (Erster − Letzter, Mittel der zwölf Ligen) | 16,1 | 32,1 |
| Punkte des Meisters | 26,9 | 37,1 |
| Punkte des Letzten | 10,7 | 5,0 |
| Torschützenkönig der Ligen (Mittel der zwölf Ligen) | 5,7 | 32,2 |
| Torschützenkönig der Ligen (höchster Wert je Saison, Mittel) | 8 | 50 |
| Torschützenkönig aller Wettbewerbe einschließlich Pokale (Mittel) | 4,2 | 21,3 |
| Vorlagenkönig der Ligen (Mittel) | 5,7 | 12,0 |
| Note Mittel (Einsätze ab 20 min) | 8,02 | 8,05 |
| Note Streuung | 0,69 | 0,75 |
| Noten ≥ 8 | 54,8 % | 58,4 % |
| Noten < 5 | 0,0 % | 0,0 % |
| Frische aller Spieler am Saisonende | 99,0 | 98,6 |
| Rechenzeit je Saison (s) | 92 | 104 |

Favoritensieg und Remis der Ligaspiele je Stärkeabstand (Mittel der Startelf wie in der physischen Reihe):

| Abstand | Ligaspiele 178 / 183 | Sieg Favorit 178 → 183 | Remis 178 → 183 |
| --- | ---: | ---: | ---: |
| 0-1 | 658 / 635 | 32 % → 47 % | 39 % → 21 % |
| 1-2 | 481 / 476 | 36 % → 60 % | 37 % → 20 % |
| 2-3 | 375 / 364 | 40 % → 82 % | 39 % → 10 % |
| >=3 | 490 / 529 | 44 % → 93 % | 35 % → 4 % |

Mannschaftsstatistik je Partie (Saison 1): shots 13,41, onTarget 7,63, corners 1,75, crosses 4,97, fouls 3,86, freeKicks 3,92.

### großes Feld (3 Saisonen, Welt si6-season-b, Verein AUT-5)

| Kennzahl (Mittel der Saisonen) | Kennung 178 | Kennung 183 |
| --- | ---: | ---: |
| Tore je Partie (alle Wettbewerbe) | 1,42 | 3,96 |
| Tore je Ligaspiel | 1,43 | 3,87 |
| Streuung der Tore | 1,22 | 2,30 |
| 0:0 | 25,8 % | 3,2 % |
| Heimsiege | 31,8 % | 43,1 % |
| Remis | 39,1 % | 16,1 % |
| Punktspanne Tabelle (Erster − Letzter, Mittel der zwölf Ligen) | 16,0 | 29,7 |
| Punkte des Meisters | 26,7 | 35,6 |
| Punkte des Letzten | 10,7 | 5,9 |
| Torschützenkönig der Ligen (Mittel der zwölf Ligen) | 5,5 | 27,0 |
| Torschützenkönig der Ligen (höchster Wert je Saison, Mittel) | 8 | 37 |
| Torschützenkönig aller Wettbewerbe einschließlich Pokale (Mittel) | 3,9 | 18,2 |
| Vorlagenkönig der Ligen (Mittel) | 5,2 | 10,1 |
| Note Mittel (Einsätze ab 20 min) | 7,96 | 7,96 |
| Note Streuung | 0,65 | 0,70 |
| Noten ≥ 8 | 51,6 % | 52,4 % |
| Noten < 5 | 0,0 % | 0,0 % |
| Frische aller Spieler am Saisonende | 98,7 | 98,2 |
| Rechenzeit je Saison (s) | 105 | 118 |

Favoritensieg und Remis der Ligaspiele je Stärkeabstand (Mittel der Startelf wie in der physischen Reihe):

| Abstand | Ligaspiele 178 / 183 | Sieg Favorit 178 → 183 | Remis 178 → 183 |
| --- | ---: | ---: | ---: |
| 0-1 | 648 / 643 | 31 % → 44 % | 40 % → 23 % |
| 1-2 | 492 / 484 | 31 % → 59 % | 39 % → 21 % |
| 2-3 | 331 / 335 | 39 % → 76 % | 43 % → 13 % |
| >=3 | 531 / 540 | 44 % → 88 % | 38 % → 9 % |

Mannschaftsstatistik je Partie (Saison 1): shots 13,50, onTarget 7,42, corners 1,38, crosses 3,31, fouls 2,79, freeKicks 2,99.

## Prüfungen

Node 24 (`C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`), Endstand dieses Branches. Nach den Messläufen liefen die Prüfungen nacheinander ohne parallele Messreihe.

| Prüfung | Ergebnis |
| --- | --- |
| `work/test-compact-balance-v183.cjs` (neu, im Workflow-Block) | 13 Prüfungen grün (nach dem Review): Snapshot und Feldgrößenwahl, Marker bleibt bei bestehendem Zustand, Schussrate (Abstand, 3 % Heimaufschlag nur Heimseite, Tief-Faktor, Plateau), Hebel (Abschluss, `gk`, Abstand), Anteil der eigenen Abschlussabweichung (`finSelf`), Heimzweig in gespielten Partien, volle Partien mit Kennung 178, 119 und ohne Kennung gleich dem eingefrorenen Controller samt JSON-Fortsetzung, Kennung 183 (gespeicherter Parametersatz zählt, JSON-Fortsetzung exakt, Buchung idempotent), Statistik/Quellen/Spielerzeilen konsistent, Rollentabellen vollständig, Belastungsband |
| `work/test-compact-balance-v178.cjs` | grün (5 Prüfungen; stellt Kennung 178 ausdrücklich wieder her) |
| `work/test-si-{core,clock,finish,defence,setplay,offball,options,field,crossing}-v183.cjs` | alle grün |
| `work/check-old-matches-v183.cjs` | grün: 340 Szenen bytegleich gegen `e4e531c0` (unmarkiert, 182, 183 mit allen Paketen aus) |
| Workflow-Block „Spieltests ausführen“ aus `.github/workflows/deploy.yml` | 119 Befehle (118 bisherige und `test-compact-balance-v183`), alle Exit 0; darunter `audit-world-balance-v68.cjs` (152 s), `DOPPEL_SEASONS=10 test-world-economy-v66` (17 s), `DOPPEL_SALES=1 DOPPEL_SEASONS=10 test-world-economy-v66` (18 s), `DOPPEL_SEASONS=10 test-world-youth-manager-v67` (13 s), `test-native-career-v160` (327 s), `test-world-match-v64`, `test-v55`, `test-world-local-start`. Hinweis: `audit-world-balance-v68` und die `DOPPEL_SEASONS`-Läufe laden das Spielermodell nicht und berühren Kennung 183 nicht; für sie gilt der Nachweis „bestehende Regeln unverändert“. |
| `work/validate-compact-balance-v183.cjs` | 1.700 Partien, alle Behauptungen bestanden (Abschnitt Matrix) |
| `work/measure-compact-physical-v183.cjs` + `table-compact-physical-v183.cjs` | 576 Fixtures, 9.072 kompakte Partien (Abschnitt Ergebnis) |
| `work/measure-compact-seasons-v183.cjs` | 3 Saisonen × 2 Welten × 2 Kennungen (Abschnitt Saisonebene) |

Ablauf der Kalibrierung (alle Schritte Node, keine Browserreihe, höchstens neun gleichzeitige Prozesse): physische Reihe zerlegen (Schüsse je Mannschaft, Quellen, Schützen je Rolle, Trefferketten, Verbrauch), Parameter anpassen, 576 Fixtures mit 4–16 Wiederholungen nachspielen, Abweichungen je Abstand und Feldgröße lesen, nachstellen. Drei Nachjustierungen entstanden erst aus der Matrix: der Faktor der tiefen Linie wurde neu gefittet (er steckte vorher doppelt in der Basis), die Rollenfaktoren wurden auf die physischen Schussanteile skaliert, und die Schussmenge der Favoriten läuft ab 5,5 Punkten Abstand in ein Plateau (die Matrix hat Paarungen mit bis zu 8 Punkten, die Referenz endet bei 6).

Artefakte der Prüfläufe wurden mit `git checkout -- outputs docs/spieler-nutzer-rig` zurückgesetzt.

## Reproduktion

```powershell
$node='C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
# Kompakt gegen physisch (576 Fixtures, 4 Prozesse à 16 Wiederholungen), danach Tabelle
0..3 | ForEach-Object { Start-Process $node "work/measure-compact-physical-v183.cjs --shard=$_ --shards=4 --k=16 --label=f" }
& $node work/table-compact-physical-v183.cjs f
# 1.700-Fixture-Matrix, Saisonen, Test
& $node work/validate-compact-balance-v183.cjs
& $node work/measure-compact-seasons-v183.cjs --marker=183 --seed=si6-season-a --size=standard --seasons=3
& $node work/measure-compact-seasons-v183.cjs --marker=178 --seed=si6-season-a --size=standard --seasons=3
& $node work/test-compact-balance-v183.cjs
```

Dateien: `dist/world-player-performance-v155.js` (Konstanten `v183CompactBalance`, `v183CompactSnapshot`, `v183ShotRate`, `v183CompactActions`), `dist/world-match-v64.js` (Kompaktschritt, Spielbericht), `dist/world-player-load-v158.js` (`v183CompactBackground`), `work/test-compact-balance-v183.cjs` (im Workflow-Block), `outputs/compact-balance-v183/baseline-v178-controller.js` (eingefrorener Controller für den Test), `work/compact-balance-harness-v178.cjs` und die v178-Prüfungen (stellen die Kennung 178 ausdrücklich wieder her).

Nachweise im Repository (`outputs/compact-balance-v183/`): [Tabelle kompakt gegen physisch](../outputs/compact-balance-v183/kompakt-gegen-physisch.md) (und `.json`), [Matrix](../outputs/compact-balance-v183/final-matrix.json) mit [Einzelspielen](../outputs/compact-balance-v183/einzelspiele.csv), `seasons/` (Saisonläufe), `workflow-block.json` (119 Befehle mit Laufzeit), `pruefungen.txt`, `baseline-v178-controller.js` (eingefrorener Controller). Die physischen Rohdaten (`outputs/si183/k2-*.json`) sind gitignoriert und stammen aus [SI-K2](spielerintelligenz-sik2-calibration-183.md).

## Review: Konzentration der Torschützen (16. Oktober 2026)

Anlass: Torschützenkönig der Ligen 33 Tore in 14 Spielen (höchster Wert 57). Prüfung gegen dieselben 567 physischen Fixtures je Spieler (`work/review-concentration-v183.cjs` + `review-concentration-table-v183.cjs`, je Fixture 6 kompakte Wiederholungen; bester Abschlussspieler = höchster Abschluss der eingesetzten Feldspieler; H = unverzerrter Herfindahl-Index der Torverteilung einer Mannschaft mit mindestens zwei Toren).

| Kennzahl (Mannschaft je Partie) | physisch | kompakt vor dem Review | kompakt nach dem Review |
| --- | ---: | ---: | ---: |
| Schussanteil des besten Abschlussspielers, Standard / groß | 58,0 % / 46,8 % | 56,7 % / 47,6 % | 56,7 % / 47,6 % |
| Toranteil des besten Abschlussspielers, Standard / groß | 57,3 % / 47,2 % | 61,2 % / 49,8 % | 57,1 % / 45,5 % |
| H der Tore, Standard / groß | 0,458 / 0,377 | 0,505 / 0,409 | 0,459 / 0,368 |
| Tore des besten Torschützen, Favorit ab 3 Punkten (beide Felder) | 2,91 | 2,89 | 2,82 |
| Mindestens drei Tore eines Spielers, Favorit ab 3 Punkten | 52,6 % | 49,3 % | 48,0 % |

- **Befund:** Die Schussverteilung auf die Spieler war richtig, die Torverteilung zu eng: Toranteil des besten Abschlussspielers beide Felder 55,7 % gegen 52,5 % physisch (90-%-Intervall des Unterschieds +1,3 bis +4,8 Punkte, Bootstrap über Fixtures). Ursache: Die Abschlusshebel 0,196/0,173 stammen aus allen Schüssen über alle Mannschaften und enthalten den Mannschaftsunterschied. Innerhalb einer Mannschaft trifft der beste Abschlussspieler im ausgespielten Spiel kaum besser (Spielzug Standard 28 % gegen 29 % der Mitspieler bei 1,8 Punkten mehr Abschluss), kompakt 31,5 % gegen 24 %.
- **Änderung:** `v183ShooterFinishing` setzt den Abschluss eines Schusses auf den erwarteten Schützen der Mannschaft für diese Quelle (gleiche Gewichte wie die Schützenwahl) plus 30 % der eigenen Abweichung (`levers.finSelf` 0,3, Teil des gespeicherten Parametersatzes; ohne den Wert gilt 1 wie vorher). Frische und Form bleiben im wirksamen Wert. Kein zusätzlicher Zufallswurf. Getestete Werte: 1 (vorher), 0,3, 0; 0,3 trifft beide Feldgrößen.
- **Wirkung:** Toranteile wie physisch (Tabelle), alle Kriterien weiter erfüllt (Abschnitt Kriterien). Tore je Partie Standard −3,7 % statt −2,9 %. Saisonebene: Torschützenkönig der Ligen 33,3 → 32,2 (Standard) und 28,0 → 27,0 (groß).
- **Warum der Torschützenkönig hoch bleibt:** Die Konzentration stammt aus dem ausgespielten Spiel. Mit fünf oder sechs Feldspielern und einem Mittelstürmer erzielt der beste Abschlussspieler physisch 57 % (Standard) bzw. 47 % (groß) der Tore seiner Mannschaft; als Favorit ab 3 Punkten schießt der beste Torschütze einer Mannschaft im Mittel 2,9 Tore je Partie, in 53 % dieser Partien gelingen einem Spieler mindestens drei Tore. Über 14 Ligaspiele eines Spitzenvereins ergibt das 30–40 Tore. Ein niedrigerer Wert setzt eine Entscheidung zum ausgespielten Spiel voraus (Schützenwahl oder Torquote der Favoriten); die Kompaktsimulation folgt ihm.
- **Vorlagen:** 0,67–0,69 Vorlagen je Tor, Vorlagenkönig der Ligen 10–12. Ohne physischen Vergleichswert plausibel; unverändert.

## Neuanpassung an sb2-f (17. Oktober 2026)

Branch `feat/si-compact2` (Worktree `work/si-compact2`), abgezweigt von `integration/si-r133` = `f6b1efdd` (alle SI-Wellen, Torjäger-Runde, Endstufe der Gleichstandsvorsicht, Neue-Welt-Stempel). Anlass: Das ausgespielte Spiel hat sich seit SI-K2 geändert (Spielstandeffekte, schwächere Gleichstandsvorsicht nach der Nutzerentscheidung „Remis und Sponsorquote 17. Oktober 2026“); die Kompaktsimulation war noch auf SI-K2 angepasst. Kennung bleibt 183 (unveröffentlicht, der Parametersatz neuer Partien darf sich ändern); Kennung 178, 119 und unmarkierte Partien sind weiter bytegleich (`test-compact-balance-v178`, `check-old-matches-v183`, Test gegen den eingefrorenen Controller).

### Referenz und Methode

- **Referenz:** `sb2-f` (Endvorgaben, 576 vollständige physische Partien, 96 Vereine × 2 Feldgrößen × 3 Seed-Sätze; `outputs/si183/sb2-f-trace40000.json`, `-si183b-` und `-si183c-`, gitignoriert). Gegenüber SI-K2 (`k2-f`): Tore 3,46 statt 3,86 (Standard 3,60, groß 3,32), Remis 17,6 % statt 16,3 % (Standard 16,2 %, enge Duelle 21,6 %), Favorit bei 1,5 Punkten geglättet 64 % (Standard 65 %), ab 3 Punkten 93 % (Standard) und 99 % (groß), Schüsse 12,26 / 11,47 je Partie statt 13,40 / 12,77.
- **Dieselben 567 Fixtures** wie in SI-6 (`work/measure-compact-physical-v183.cjs`, 9 mit abweichender KI-Elf ausgelassen), 16 Wiederholungen = 9.072 kompakte Partien je Lauf, Auswertung `work/table-compact-physical-v183.cjs <label> --series=sb2-f-trace40000,sb2-f-si183b-trace40000,sb2-f-si183c-trace40000`.
- **Werkzeuge (neu):** `work/fit-compact-physical-v183.cjs` (Poisson-Anpassung der Schüsse je Mannschaft mit Plateau und Heimaufschlag, Schussquellen, Logit-Anpassung von „aufs Tor“ und „Tor“ je Quelle; gibt einen Vorschlag aus, schreibt nichts nach `dist`); `measure-compact-physical-v183.cjs --variants="name:pfad=wert,…;name2:…"` (mehrere Parametervarianten je Fixture mit einmaligem Weltaufbau und gleichen Wiederholungsseeds, `--size=large`, `groß/pfad=wert` für nur eine Feldgröße); `review-concentration-v183.cjs --series=…`. Ein Lauf mit 6 Prozessen und 16 Wiederholungen dauert rund 9 Minuten, eine Variante mit 8 Wiederholungen rund 3 Minuten.
- **Vorgehen:** (1) Regression auf den physischen Schüssen (Vorschlag für `shotBase`, `shotSlope`, `deepDefenceShots`, Quellenmix, Achsenabschnitte), (2) Wiederholung der Fixtures, (3) Achsenabschnitte je Quelle und Klasse nachziehen, (4) Prüfung, ob der Spielstand im Kompaktmodell gebraucht wird, (5) Hebel je Feldgröße, (6) Konzentration der Torschützen.

### Befund vor der Neuanpassung

Die Kompaktsimulation von SI-6 gegen die neue Referenz (gleiche Fixtures, unveränderter Stand `f6b1efdd`):

| Kriterium | Standard | groß | beide |
| --- | ---: | ---: | ---: |
| Schüsse je Partie (≤ 10 %) | +8,3 % | **+10,3 %** | +9,2 % |
| Tore je Partie (≤ 10 %) | +7,9 % | +9,2 % | +8,5 % |
| Remis schwacher Teams (± 5 Punkte) | +6,4 P. (n = 46) | −12,8 P. (n = 72) | −5,3 P. (n = 118) |
| Remis insgesamt | 14,1 % statt 16,2 % | 15,8 % statt 19,1 % | 15,0 % statt 17,6 % |
| Partien mit Torabstand ≥ 3 | 41,2 % statt 32,4 % | 34,7 % statt 32,5 % | 37,9 % statt 32,5 % |

Die Kompaktsimulation spielte also zu viele Schüsse und Tore und zu einseitige Partien; die Remisquote lag 2,6 Punkte unter der Referenz.

### Muss die Kompaktsimulation den Spielstand kennen?

Ja, in kleiner Form. Das ausgespielte Spiel führt Spielstandeffekte: Gegenüber dem Erwartungswert aus der Stärke schießt der Führende rund 10–13 % weniger (mittleres Verhältnis der Schüsse zur Modellrate aus dem Stärkeabstand: Führung mit einem Tor 0,90 (Standard) / 0,93 (groß), mit zwei und mehr Toren 0,87 / 0,83), die zurückliegende Mannschaft rund 12 % mehr (Rückstand um ein Tor 1,13 / 1,10, um zwei und mehr 1,12 / 1,15), bei Gleichstand fallen die Schüsse im letzten Sechstel auf 0,75 (Gesamtmittel bei Gleichstand 1,04). Auswertung: Schüsse je Zeiteinheit gegen die stärkebasierte Modellrate (nicht gegen die eigene Rate der Partie, um die Auswahl durch die Tore zu vermeiden). Die reine Neuanpassung der bestehenden Hebel (alle Achsenabschnitte neu, kein Spielstand) reicht für die Abnahmekriterien; der Term verbessert nur die Verteilung der Ergebnisse (Kontrolle unten).

Gewählt ist ein Term in `v183ScoreFactor` (`dist/world-player-performance-v155.js:78`, `scoreState` im gespeicherten Parametersatz): Faktor auf die erwarteten Schüsse der Mannschaft nach der Tordifferenz: Führung −10 % (bei einem wie bei zwei Toren), Rückstand +10 %; der Gleichstandsterm (`level`, `levelFrom`) ist vorhanden, steht aber auf 0, weil er Remis über das Ziel hebt und auf dem großen Feld den Favoriten kostet. Gespeicherte Parametersätze ohne den Block bleiben wirkungslos (Faktor 1).

### Kontrolle: derselbe Satz ohne Spielstandterm

Gleiche Fixtures und Wiederholungsseeds, 8 Wiederholungen (4.536 Partien je Variante). Die Variante ohne Term läuft mit `shotBase` × 0,955, damit die Tore gleich bleiben (bei gleicher Basis fallen die Tore mit dem Term um rund 4,5 % niedriger aus).

| Kennzahl | physisch | ohne Term | mit Term (Stand) |
| --- | ---: | ---: | ---: |
| Tore je Partie (Standard / groß / beide) | 3,60 / 3,32 / 3,46 | 3,59 / 3,30 / 3,44 | 3,63 / 3,35 / 3,49 |
| Remis (Standard / groß / beide) | 16,2 / 19,1 / 17,6 % | 14,9 / 16,6 / 15,8 % | 16,4 / 17,9 / 17,2 % |
| Torabstand 1 (beide) | 28,9 % | 29,0 % | 29,7 % |
| Torabstand ≥ 3 (Standard / groß / beide) | 32,4 / 32,5 / 32,5 % | 36,0 / 34,2 / 35,1 % | 33,4 / 32,5 / 33,0 % |
| Torabstand ≥ 4 (beide) | 19,8 % | 21,8 % | 19,4 % |

Die Abnahmekriterien werden auch ohne den Term erfüllt (Remis −1,8 Punkte gegen ±3 erlaubt). Er bringt aber die Remisquote (+1,4 Punkte) und die Kantersiege (Torabstand ≥ 3: −2,1 Punkte) an das ausgespielte Spiel heran; deshalb bleibt er (zwei Zahlen und ein Faktor in `v183CompactActions`). Der Gleichstandsterm `level` (−0,3 bis zum Ende, ab Spielhälfte linear) hob die Remisquote um weitere 2,8 Punkte (zu viel) und senkte die geglättete Favoritenquote des großen Feldes bei 4 Punkten auf 87 % (physisch 96 %); verworfen.

### Geänderte Konstanten (`dist/world-player-performance-v155.js`)

| Konstante | vorher (Standard / groß) | jetzt (Standard / groß) | Stelle | Grund |
| --- | ---: | ---: | --- | --- |
| `shotBase` | 5,754 / 5,656 | 5,452 / 5,090 | :28 / :29 | Schüsse 12,26 / 11,47 je Partie, Poisson-Anpassung (nach Abzug des Spielstandterms) |
| `shotSlope` | 0,1293 / 0,1001 | 0,122 / 0,125 | :28 / :29 | Anpassung 0,122 / 0,112; groß auf 0,125, weil die Klassen des großen Feldes steiler verlaufen (Favoritenquote ab 3 Punkten 99 %) |
| `deepDefenceShots` | 1,41 / 1,37 | 1,401 / 1,351 | :28 / :29 | Anpassung |
| Quellenmix (Schüsse je Partie, ohne Elfmeter) | 13,39 / 12,75 | 12,20 / 11,44 | :28 / :29 | gemessene Quellen: Spielzug 6,56 / 5,36, Fernschuss 1,82 / 3,36, Kopfball 1,46 / 1,19, Abpraller 0,36 / 0,38, Ecke 0,08 / 0,04, Freistoßfolge 1,62 / 0,95, direkt 0,31 / 0,17 |
| `on` und `goal` je Quelle (Logit) | siehe Tabelle oben | Standard: `on` Spielzug −0,295, Fernschuss −0,896, Kopfball/Ecke 0,003, Abpraller −0,172, Freistoßfolge −0,172, direkt −0,221; `goal` 0,081 / −0,213 / 0,597 / 0,954 / 0,597 / 0,255 / −0,351. Groß: `on` −0,148 / −0,75 / −0,069 / −0,089 / −0,069 / −0,22 / −1,033; `goal` 0,189 / −1,155 / 0,537 / 0,723 / 0,537 / 0,189 / −0,822 | :28 / :29 | Achsenabschnitte der Logit-Anpassung bei den gespeicherten Hebeln, danach per Wiederholung auf Tore je Schuss und aufs Tor je Schuss je Quelle nachgezogen (Fernschüsse im Standardfeld +0,45, weil die kompakten Schützen im Mittel 1,7 Abschlusspunkte unter den physischen Fernschützen liegen); Ecke wie Kopfball (zu wenige Ecken für eine eigene Anpassung) |
| `levers.onGap` | 0,06 | 0,03 / 0,06 | :15 / :29 | Standard: die Anpassung ergibt 0,047, flacher bringt die geglättete Favoritenquote auf −0,4 / +0,6 Punkte; groß behält 0,06 (steilere Klassen) |
| `levers` des großen Feldes | gemeinsam: 0,196 / 0,173 / −0,148 | `onFin` 0,21, `goalFin` 0,24, `goalGk` −0,14 | :29 | Anpassung auf dem großen Feld: Abschluss 0,20 / 0,22, Torwart −0,09 bis −0,13 |
| `levers.finSelf` | 0,3 | 1 | :15 / :29 | Konzentration der Torschützen (unten); der Mechanismus bleibt für gespeicherte Sätze |
| `scoreState` | – | Führung −0,1, Rückstand +0,1, Gleichstand 0 | :16, :78, :103 | s. o. |
| `corners`, `crossExtra`, `fouls`, `freeKickExtra` | 0,845 / 1,6 / 1,97 / 0,03 (groß 0,7 / 1 / 1,4 / 0,095) | 0,79 / 1,71 / 2,05 / 0,03 (groß 0,675 / 1,0 / 1,38 / 0,115) | :28 / :29 | Mannschaftsstatistik der Referenz |

Unverändert: `matchMinutes`, `homeShotFactor`, `gapKnee`/`gapOver`/`gapFade`, `shotKnee`/`shotOver` (Plateau 11,5 / 10 Schüsse reichen weiter: Favoritenschüsse ab 3 Punkten −4,9 % / −3,0 %), Schützenrollen und -steigungen, Vorlagenanteile, Hintergrundlaufen (Frischeverbrauch je Linie ±0,4 Punkte).

### Ergebnis: kompakt gegen sb2-f

Vollständige Tabellen (Standard und groß, 9.072 Partien, Läufe `f5`): [kompakt gegen sb2-f](../outputs/compact-balance-v183/kompakt-gegen-physisch-sb2.md) (`.json`), der Stand vor der Neuanpassung: [vorher](../outputs/compact-balance-v183/kompakt-gegen-physisch-sb2-vor-neuanpassung.md).

Gegen die Referenz, vorher (Stand `f6b1efdd`) → nachher, je Feldgröße und Stärkeabstand (✓ = Grenze des Plans eingehalten: Schüsse und Tore ±10 %, Favoritensieg ±5 Punkte):

| Feld | Abstand | physische Partien | Schüsse vorher → nachher | Tore vorher → nachher | Sieg Favorit vorher → nachher | Remis vorher → nachher |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Standard | 0-1 | 88 | +5,9 % → -0,0 % ✓ | +1,3 % → -0,6 % ✓ | -1,4 P. → -2,9 P. ✓ | +0,9 P. → +3,4 P. |
| Standard | 1-2 | 62 | +12,9 % → +5,8 % ✓ | +0,1 % → -2,8 % ✓ | +1,6 P. → -1,2 P. ✓ | -5,9 P. → -3,3 P. |
| Standard | 2-3 | 48 | +13,3 % → +4,8 % ✓ | +11,2 % → +3,6 % ✓ | +11,1 P. → +7,3 P. ✗ | -3,6 P. → -0,1 P. |
| Standard | >=3 | 86 | +5,0 % → -4,9 % ✓ | +15,3 % → +2,1 % ✓ | +1,1 P. → -2,0 P. ✓ | -1,4 P. → +1,2 P. |
| groß | 0-1 | 81 | +10,8 % → -0,2 % ✓ | +23,2 % → +9,1 % ✓ | +6,8 P. → +5,2 P. ✗ | -13,9 P. → -9,1 P. |
| groß | 1-2 | 68 | +11,9 % → +0,6 % ✓ | +25,0 % → +14,1 % ✗ | +8,7 P. → +8,1 P. ✗ | -10,5 P. → -7,5 P. |
| groß | 2-3 | 47 | +14,2 % → +2,4 % ✓ | +9,1 % → -4,0 % ✓ | -3,7 P. → -4,3 P. ✓ | +5,3 P. → +8,9 P. |
| groß | >=3 | 87 | +6,7 % → -3,0 % ✓ | -4,0 % → -8,0 % ✓ | -8,7 P. → -6,7 P. ✗ | +7,6 P. → +6,4 P. |

Kriterien und Kennzahlen insgesamt:

| Kriterium | Standard vorher → nachher | groß vorher → nachher | beide vorher → nachher |
| --- | ---: | ---: | ---: |
| Schüsse je Partie | +8,3 % → +0,3 % | +10,3 % → -0,5 % | +9,2 % → -0,1 % |
| Tore je Partie | +7,9 % → +0,6 % | +9,2 % → +0,3 % | +8,5 % → +0,5 % |
| aufs Tor je Partie | +8,9 % → +0,2 % | +6,1 % → -0,0 % | – |
| 0:0 (Anteil, Punkte) | -0,2 P. → +0,0 P. | -2,8 P. → -1,7 P. | – |
| Favorit bei 1,5 Punkten geglättet | +3,2 P. → -0,4 P. | +0,3 P. → +0,2 P. | – |
| Favorit bei 4 Punkten geglättet | +3,4 P. → +0,6 P. | -5,8 P. → -4,1 P. | – |
| Remis schwacher Teams | +6,4 P. → +6,1 P. (n=46) | -12,8 P. → -7,1 P. (n=72) | -5,3 P. → -2,0 P. (n=118) |
| Tore je Schuss | -0,1 P. → +0,1 P. | -0,3 P. → +0,2 P. | -0,2 P. → +0,2 P. |
| Ecken | +7,1 % → +0,4 % | +5,0 % → +1,1 % | – |
| Flanken | -1,3 % → +0,5 % | -2,2 % → -0,9 % | – |
| Fouls | -3,7 % → +0,3 % | +1,3 % → -0,1 % | – |
| Freistöße | -2,9 % → +1,1 % | -0,5 % → -0,5 % | – |


Standardfeld, Klassen nachher (physisch / kompakt):

| Abstand | Partien phys / komp | Sieg Favorit phys → komp | Remis phys → komp | Niederlage phys → komp | Tore phys → komp | Schüsse Favorit/Außenseiter phys → komp | Tore Favorit/Außenseiter phys → komp |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0-1 | 88 / 1408 | 51 % → 48 % (-2,9 P.) | 22 % → 25 % (+3,4 P.) | 27 % → 27 % | 3,08 → 3,06 | 6,4/5,4 → 6,2/5,6 | 1,75/1,33 → 1,75/1,31 |
| 1-2 | 62 / 992 | 68 % → 67 % (-1,2 P.) | 23 % → 19 % (-3,3 P.) | 10 % → 14 % | 3,29 → 3,20 | 7,3/4,3 → 7,3/4,9 | 2,37/0,92 → 2,20/0,99 |
| 2-3 | 48 / 768 | 69 % → 76 % (+7,3 P.) | 17 % → 17 % (-0,1 P.) | 15 % → 7 % | 3,21 → 3,32 | 7,7/4,1 → 7,9/4,5 | 2,40/0,81 → 2,54/0,79 |
| >=3 | 86 / 1376 | 93 % → 91 % (-2,0 P.) | 6 % → 7 % (+1,2 P.) | 1 % → 2 % | 4,57 → 4,66 | 9,9/3,7 → 9,1/3,7 | 4,01/0,56 → 4,07/0,59 |

Großes Feld, Klassen nachher:

| Abstand | Partien phys / komp | Sieg Favorit phys → komp | Remis phys → komp | Niederlage phys → komp | Tore phys → komp | Schüsse Favorit/Außenseiter phys → komp | Tore Favorit/Außenseiter phys → komp |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0-1 | 81 / 1296 | 40 % → 45 % (+5,2 P.) | 37 % → 28 % (-9,1 P.) | 23 % → 27 % | 2,44 → 2,67 | 6,0/5,0 → 5,8/5,2 | 1,40/1,05 → 1,50/1,16 |
| 1-2 | 68 / 1088 | 56 % → 64 % (+8,1 P.) | 29 % → 22 % (-7,5 P.) | 15 % → 14 % | 2,57 → 2,94 | 6,8/4,4 → 6,6/4,6 | 1,68/0,90 → 2,02/0,92 |
| 2-3 | 47 / 752 | 81 % → 77 % (-4,3 P.) | 9 % → 17 % (+8,9 P.) | 11 % → 6 % | 3,11 → 2,98 | 7,2/3,9 → 7,1/4,2 | 2,43/0,68 → 2,35/0,63 |
| >=3 | 87 / 1392 | 99 % → 92 % (-6,7 P.) | 0 % → 6 % (+6,4 P.) | 1 % → 1 % | 4,83 → 4,44 | 8,8/3,5 → 8,5/3,5 | 4,25/0,57 → 3,94/0,50 |

Schussquellen nachher, Standardfeld:

| Schussquelle | je Partie phys | je Partie komp | Tore je Schuss phys | Tore je Schuss komp | Schützenwert Abschluss phys | Abschluss komp |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| open | 6,57 | 6,55 | 28 % | 29 % | 12,49 | 12,38 |
| long | 1,80 | 1,87 | 25 % | 24 % | 15,21 | 13,47 |
| header-volley | 1,46 | 1,51 | 31 % | 34 % | 11,18 | 11,31 |
| rebound | 0,36 | 0,35 | 42 % | 43 % | 12,96 | 12,80 |
| corner | 0,08 | 0,08 | 36 % | 34 % | 12,04 | 11,38 |
| free-kick-follow | 1,62 | 1,63 | 30 % | 32 % | 12,24 | 12,40 |
| direct-free-kick | 0,31 | 0,31 | 26 % | 27 % | 13,52 | 13,14 |

Großes Feld:

| Schussquelle | je Partie phys | je Partie komp | Tore je Schuss phys | Tore je Schuss komp | Schützenwert Abschluss phys | Abschluss komp |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| open | 5,36 | 5,31 | 35 % | 34 % | 12,38 | 12,17 |
| long | 3,38 | 3,38 | 15 % | 17 % | 13,29 | 13,06 |
| header-volley | 1,18 | 1,18 | 36 % | 34 % | 11,41 | 11,29 |
| rebound | 0,37 | 0,38 | 45 % | 42 % | 12,77 | 12,46 |
| corner | 0,04 | 0,04 | 45 % | 33 % | 12,96 | 11,20 |
| free-kick-follow | 0,95 | 0,94 | 29 % | 34 % | 11,46 | 12,22 |
| direct-free-kick | 0,17 | 0,17 | 21 % | 20 % | 14,24 | 13,10 |

Zusammengefasst (Favoritensieg, Punkte Abweichung kompakt gegen physisch): Standard 0–3 Punkte 60,6 → 60,7 %, 1–3 Punkte 68,2 → 70,7 %, ab 2 Punkte 84,3 → 85,7 %, alle 70,4 → 69,9 %; groß 0–2 Punkte 47,0 → 53,5 %, 1–3 Punkte 66,1 → 69,1 %, ab 2 Punkte 92,5 → 86,7 %, alle 68,6 → 69,2 %.

### Kriterien (Plan SI-6, neu gegen sb2-f)

- **Erfüllt:**
  - Schüsse (−0,1 % beide, +0,3 % / −0,5 %) und Tore (+0,5 %, +0,6 % / +0,3 %) insgesamt und je Feld, Schüsse je Klasse alle, Tore je Klasse bis auf die Klasse 1–2 Punkte auf dem großen Feld (+14,1 %).
  - Favorit bei 1,5 Punkten geglättet −0,4 (Standard) / +0,2 (groß) Punkte, bei 4 Punkten +0,6 / −4,1 Punkte (groß mit 0,9 Punkten Reserve).
  - Remis insgesamt 17,5 % gegen 17,6 % (Standard 16,9 gegen 16,2, groß 18,1 gegen 19,1; erlaubt ±3 Punkte), Remis schwacher Teams in beiden Feldern −2,0 Punkte (118 Partien).
  - Schussquellen: Schüsse je Partie ±0,07, Tore je Schuss ±3 Punkte (Ausnahme: Spielzug-Fernschüsse und Ecken, siehe unten); Torwarthebel: 12 gegen 16,5 Punkte Torwart senkt die Tore je Schuss aufs Tor um 16,5 Punkte (Standard, Spielzug; physisch rund 15 Punkte bei 14,6 Punkten Abstand), großes Feld 15,5 Punkte.
  - Nicht gebrochen: Heimaufschlag, Plateau der Favoritenschüsse, Rollenanteile (Tore je Rolle ±3 Punkte: im Standardfeld Mittelstürmer 19,9 → 22,7 %, Spielmacher 8,8 → 6,3 %), Hintergrundlaufen: Frischeverbrauch je Linie ±0,4 Punkte, je Ausdauerklasse ±0,8 Punkte (SI-6: ±0,6; die Klassen 0–8 und 14–21 waren schon vor der Anpassung um −0,7 und +0,8 Punkte verschoben, die Referenz hat sich dort geändert).
- **Nicht erfüllt, mit Einordnung:**
  - Favoritensieg je Klasse (±5 Punkte): Standard 2–3 Punkte +7,3 (48 physische Partien); groß 0–1 Punkte +5,2 (81), 1–2 Punkte +8,1 (68), ab 3 Punkten −6,7 (87). Remis schwacher Teams je Feld: Standard +6,1 (46 Partien), groß −7,1 (72), gegenläufig und zusammen −2,0.
  - **Die Klassen sind klein und die physische Form ist nicht logistisch:** 47–88 Partien je Klasse bedeuten ein 95-%-Intervall von ±11–14 Punkten. Standard: 51 / 68 / 69 / 93 % (die Klasse 2–3 liegt unter dem Verlauf der Nachbarn, in SI-K2 waren es 79 %); groß: 40 / 56 / 81 / 99 % (K2: 42 / 63 / 72 / 91 %). Der kompakte Verlauf ist glatt (45 / 64 / 77 / 92 %). Mehrere Klassen zusammen liegen auf dem Standardfeld innerhalb von 2,5 Punkten (Tabelle oben), auf dem großen Feld bei +6,5 (0–2 Punkte), +3,0 (1–3), −5,8 (ab 2).
  - **Versuche, das große Feld steiler zu machen** (zu viel für die mittleren Klassen, zu wenig für die oberste): stärkere Abschlusshebel (0,26 / 0,22 / −0,15; ab 3 Punkten −5,8 Punkte, 1–2 Punkte +8,2), Torwahrscheinlichkeit mit Stärkeabstand (`goalGap` 0,04–0,10: geglättet bei 1,5 Punkten +2,6 bis +4,7, bei 4 Punkten −2,9 bis −1,6, Klasse 1–2 Punkte +9 bis +11), steilere Schussneigung (0,14: +2,7 / −2,6). Gewählt ist der Kompromiss oben (Schussneigung 0,125, Hebel 0,21 / 0,24 / −0,14).
  - **Tore je Schuss bei Spielzug-Fernschüssen** (Standardfeld): 24 % gegen 25 %; die kompakten Fernschützen haben im Mittel 13,5 gegen 15,2 Abschlusspunkte, der Achsenabschnitt (+0,45 gegenüber der reinen Anpassung) gleicht das aus. Ecken: 0,08 / 0,04 Schüsse je Partie, zu wenige Ereignisse für eine eigene Anpassung (Kopfballwerte übernommen).
- **Remis schwacher Teams:** physisch 17 % (46 Partien) und 33 % (72) bei Toren 2,41 / 1,88; kompakt 2,66 / 2,35 Tore. Die schwachen Mannschaften des großen Feldes treffen im ausgespielten Spiel deutlich seltener als der Stärkeabstand und die Fähigkeiten erwarten lassen (K2: 2,67 Tore bei denselben Fixtures). Die Referenz hat dort 72 Partien, der Unterschied zu K2 beträgt grob geschätzt drei Standardfehler; ein Modellfehler der Kompaktsimulation ist nicht belegt.

### Torschützen und Konzentration

Die Verteilung der Tore auf die Spieler einer Mannschaft (`work/review-concentration-v183.cjs --series=sb2-f-…`, 8 Wiederholungen je Fixture, bester Abschlussspieler = höchster Abschluss der eingesetzten Feldspieler, H = unverzerrter Herfindahl-Index der Tore einer Mannschaft mit mindestens zwei Toren):

| Kennzahl (Mannschaft je Partie), Standard / groß | physisch sb2-f | kompakt mit `finSelf` 0,3 (SI-6) | kompakt `finSelf` 1 (Stand) |
| --- | ---: | ---: | ---: |
| Toranteil des besten Abschlussspielers | 63,3 % / 52,1 % | 59,3 % / 46,3 % | 63,3 % / 51,6 % |
| Schussanteil des besten Abschlussspielers | 58,6 % / 49,9 % | 57,1 % / 47,1 % | 57,0 % / 47,1 % |
| H der Tore | 0,524 / 0,448 | 0,476 / 0,368 | 0,526 / 0,419 |
| Tore des besten Torschützen | 1,37 / 1,21 | 1,31 / 1,10 | 1,35 / 1,15 |
| Zwei Tore eines Spielers | 34,5 % / 30,4 % | 32,5 % / 26,1 % | 34,1 % / 27,9 % |
| Drei Tore eines Spielers | 15,0 % / 12,0 % | 13,6 % / 10,1 % | 14,6 % / 11,2 % |
| Favorit ab 3 Punkten (beide Felder): Tore des besten Schützen / mindestens drei Tore | 2,79 / 46,8 % | 2,57 / 42,2 % | 2,63 / 43,7 % |

- **Befund:** Im ausgespielten Spiel der Endstufe trifft der beste Abschlussspieler wieder besser als seine Mitspieler (63 % der Mannschaftstore aus 59 % der Schüsse; im SI-6-Review der Reihe K2 waren es 57,3 % der Tore bei 58,0 % der Schüsse und 28 % gegen 29 % Torquote im Spielzug). Mit dem damaligen Anteil `finSelf` 0,3 lag der kompakte Wert 4,0 / 5,8 Punkte darunter. Die Ursache liegt im ausgespielten Spiel (Torjäger-Runde: Torwartposition bei Flanken, Streuung) und wurde nicht weiter untersucht.
- **Änderung:** `levers.finSelf` 1 (kein Abschlussschrumpf innerhalb der Mannschaft, `v183ShooterFinishing` gibt den Wert unverändert zurück). Die Tore stiegen dadurch um rund 1 %; die Achsenabschnitte der Torwahrscheinlichkeit wurden um −0,03 / −0,01 (Standard / groß) nachgezogen. Der Mechanismus bleibt für gespeicherte Sätze mit 0,3.
- Ligatorschützenkönig nach der Neuanpassung (Saisonebene unten): 30,1 Tore (Standard) / 28,4 (groß) in 14 Spielen, höchster Wert einer Saison 46 / 39. Das ist das Niveau der Referenz (Schätzung aus der Reihe: 30 / 26 Tore) und weiterhin ein Verhalten des ausgespielten Spiels mit fünf Feldspielern (weiches Ziel der Torjäger-Runde); die Kompaktsimulation folgt ihm.
- Rollenanteile Standardfeld (Tore, physisch → kompakt): Stürmer 35,2 → 35,8 %, Mittelstürmer (Poacher) 19,9 → 22,7 %, Box-to-box 12,9 → 13,0 %, Spielmacher 8,8 → 6,3 %, Zielspieler 6,6 → 6,6 % (vollständige Tabelle in der Auswertungsdatei).

### Saisonebene

`work/measure-compact-seasons-v183.cjs --marker=183` (drei Saisons der neuen Vereinswelt, 12 Länder, 991 Partien je Saison, der Manager spielt nicht aus, dieselben Welten wie in SI-6: `si6-season-a` Standard, `si6-season-b` groß, Verein AUT-5). Die Werte der Kennung 178 und der Kennung 183 vor der Neuanpassung (SI-6, Referenz K2) stammen aus den archivierten Läufen `outputs/compact-balance-v183/seasons/`; die neuen Läufe `seasons-183-sb2-*.json` liefen parallel zu anderen Messungen (Rechenzeit nicht vergleichbar).

| Kennzahl (Mittel der Saisonen) | Standard 178 | Standard 183 SI-6 | **Standard 183 jetzt** | groß 178 | groß 183 SI-6 | **groß 183 jetzt** |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Tore je Partie (alle Wettbewerbe) | 1,39 | 4,03 | **3,78** | 1,42 | 3,96 | **3,70** |
| Tore je Ligaspiel | 1,39 | 3,94 | **3,72** | 1,43 | 3,87 | **3,60** |
| Streuung der Tore | 1,19 | 2,41 | **2,22** | 1,22 | 2,30 | **2,27** |
| 0:0 | 25,4 % | 3,5 % | **4,0 %** | 25,8 % | 3,2 % | **4,2 %** |
| Heimsiege | 30,2 % | 43,2 % | **41,2 %** | 31,8 % | 43,1 % | **42,2 %** |
| Remis | 38,1 % | 14,3 % | **17,8 %** | 39,1 % | 16,1 % | **18,2 %** |
| Punktspanne Tabelle (Erster − Letzter, Mittel der zwölf Ligen) | 16,1 | 32,1 | **30,6** | 16,0 | 29,7 | **30,7** |
| Punkte des Meisters | 26,9 | 37,1 | **36,2** | 26,7 | 35,6 | **35,5** |
| Punkte des Letzten | 10,7 | 5,0 | **5,6** | 10,7 | 5,9 | **4,8** |
| Torschützenkönig der Ligen (Mittel der zwölf Ligen) | 5,7 | 32,2 | **30,1** | 5,5 | 27,0 | **28,4** |
| Torschützenkönig der Ligen (höchster Wert je Saison, Mittel) | 8 | 50 | **46** | 8 | 37 | **39** |
| Torschützenkönig aller Wettbewerbe (Mittel) | 4,2 | 21,3 | **20,0** | 3,9 | 18,2 | **18,8** |
| Vorlagenkönig der Ligen (Mittel) | 5,7 | 12,0 | **10,4** | 5,2 | 10,1 | **9,8** |
| Note Mittel (Einsätze ab 20 min) | 8,02 | 8,05 | **8,04** | 7,96 | 7,96 | **7,95** |
| Frische aller Spieler am Saisonende | 99,0 | 98,6 | **98,6** | 98,7 | 98,2 | **98,2** |

Favoritensieg und Remis der Ligaspiele je Stärkeabstand (Mittel der Startelf wie in der physischen Reihe), Kennung 183 jetzt:

| Abstand | Standard: Ligaspiele | Favorit | Remis | groß: Ligaspiele | Favorit | Remis |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 0-1 | 661 | 43 % | 26 % | 594 | 44 % | 27 % |
| 1-2 | 469 | 60 % | 21 % | 519 | 60 % | 23 % |
| 2-3 | 343 | 73 % | 19 % | 353 | 77 % | 14 % |
| ≥ 3 | 531 | 92 % | 7 % | 536 | 91 % | 7 % |

Mannschaftsstatistik je Partie (Saison 1): Standard Schüsse 12,37, aufs Tor 7,02, Ecken 1,62, Flanken 4,98, Fouls 4,04, Freistöße 4,09; groß Schüsse 12,10, aufs Tor 6,99, Ecken 1,32, Flanken 3,34, Fouls 2,74, Freistöße 2,98.

Wirkung gegenüber dem Stand von SI-6: 6 % weniger Tore je Partie, Remis 17,8 / 18,2 % statt 14,3 / 16,1 %, Punktspanne 30,6 / 30,7 statt 32,1 / 29,7 Punkte, Meister 36 Punkte, Letzter 5–6, Torschützenkönig im Mittel 30 / 28 Tore. Die Liga bleibt eine Spitzenliga (siehe Risiken); sie ist etwas weniger einseitig.

### Prüfungen

(Ergebnisse der Prüfläufe folgen)

### Reproduktion

```powershell
$node='C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
$ser='sb2-f-trace40000,sb2-f-si183b-trace40000,sb2-f-si183c-trace40000'
& $node work/fit-compact-physical-v183.cjs $ser sb2            # Regression, Vorschlag
0..5 | ForEach-Object { Start-Process $node "work/measure-compact-physical-v183.cjs --shard=$_ --shards=6 --k=16 --label=f5 --series=$ser" }
& $node work/table-compact-physical-v183.cjs f5 --series=$ser --json
# Varianten: --variants="a:scoreState.lead1=-.1,shotBase=*1.02;b:levers.onGap=.025" (Weltaufbau einmal je Fixture)
0..5 | ForEach-Object { Start-Process $node "work/review-concentration-v183.cjs --shard=$_ --shards=6 --k=8 --label=sb2" }
& $node work/review-concentration-table-v183.cjs --label=sb2 --shards=6
```

## Risiken und offene Punkte

- **Neuanpassung sb2-f (17. Oktober 2026):** Die Kompaktsimulation hängt an einer einzelnen 576er-Referenzreihe; die Favoritenquote einer Klasse schwankt zwischen gleichwertigen Reihen um bis zu 20 Punkte (SI-K2 gegen sb2-f: Standard 2–3 Punkte 79 → 69 %, groß ab 3 Punkten 91 → 99 %). Vier von acht Klassen liegen deshalb über den fünf Punkten (Abschnitt „Kriterien“), die geglätteten Werte und alle Gesamtwerte nicht. Ändert sich das ausgespielte Spiel noch einmal, ist ein Lauf mit `work/measure-compact-physical-v183.cjs` fällig; ein Parameterwechsel betrifft nur neue Partien, laufende behalten ihren gespeicherten Satz.
- **Schwache Teams im großen Feld:** Das ausgespielte Spiel erzielt dort 1,88 Tore (72 Partien), die Kompaktpartie 2,35. Die Remisquote dieser Gruppe liegt −7,1 Punkte, auf dem Standardfeld +6,1 (46 Partien), zusammen −2,0. Nicht weiter nachgezogen, weil die Reihe zu klein ist und neue Welten das Standardfeld verwenden.
- **Spielstandterm:** Er kennt nur Führung, Rückstand und (auf 0 gestellt) späten Gleichstand und wirkt auf die Schussmenge. Zeit der Führung, Torwartwechsel oder Spielerverletzungen kennt die Kompaktpartie nicht.
- **Die Liga wird zur Spitzenliga der stärksten Vereine (größte sichtbare Folge).** Mit dem Torniveau und den Favoritenquoten der physischen Reihe wächst die Punktspanne der Ligen von rund 16 auf rund 30 Punkte (14 Spiele je Verein: Meister 37 statt 27 Punkte, Letzter 5–6 statt 11), der Torschützenkönig einer Liga von im Mittel 6 auf 27–32 Tore (höchster Wert einer Saison 56), Vorlagenkönige von 5–6 auf 10–12, Heimsiege von 30 % auf 42 %, Remis von 38 % auf 15 %. Das ist keine Vorgabe, sondern die Antwort der Kompaktpartie auf den Stärkeabstand der Weltvereine (Startkader mit strengen Ligaspitzen und seltenen Elite-Spielern); die physische Reihe liefert dort 94 % Favoritensiege und 5,5 Tore. Wer das Tabellenbild weicher will, muss die Favoritenquote im ausgespielten Spiel ändern und die Kompaktpartie danach neu anpassen (Entscheidung „Favoritenquote 16. Oktober 2026“ nennt Siege von rund 90 % und mehr ab 3 Punkten).
- **Tore je Partie in der Welt steigen auf rund das Zweieinhalbfache** (1,4 mit Kennung 178, 3,8 mit 183 nach der Neuanpassung, 4,0 vorher). Das folgt dem Torziel 3–5 (Nutzerentscheidung 15. Oktober 2026) und der physischen Reihe, ändert aber Torschützenlisten, Tordifferenzen, Torquoten je Spieler und die 0:0-Quote (25 % auf 3,5 %) sichtbar. Bereits laufende Saisons behalten ihre Ergebnisse; neue Partien einer bestehenden Welt folgen der neuen Kennung, so dass eine laufende Saison zwei Torniveaus mischt. Eine Umrechnung wäre eine Spielstandmigration und ist nicht Teil des Auftrags.
- **Sponsorziel „mindestens N Tore“** (`dist/world-economy-v66.js:134`, Liga ab `11 + startingSquad`, Pokal 4 reguläre Tore) wird mit dem höheren Torniveau von beiden Seiten leichter erreicht. Die Schwelle wurde für 1,4 Tore je Partie gewählt und nicht angefasst. Angepasst in `feat/si-newworld` (nur neue Spielstände) und am 17. Oktober 2026 nach der Neuanpassung neu gemessen: nach Kaderstufe 13 / 16 / 23 / 34 / 48 Tore, Trefferquote 36–39 % auf dem Standardfeld ([Dokument](spielerintelligenz-neue-spielstaende-183.md)).
- **Abstand über der Messreihe:** Die physische Reihe enthält nur 22 Partien mit mehr als 5,5 und 9 mit mehr als 6 Punkten Abstand. Darüber wirkt der Abstand nur noch mit dem Faktor 0,15 und die Favoritenschüsse laufen in ein Plateau (`gapKnee` 5,5, `gapOver` 0,15, `shotKnee` 11,5 bzw. 10, `shotOver` 0,1), damit die Schüsse im Korridor von 10–16 bleiben. Die Tore der extremsten Paarungen (Spitzenklub gegen letzten Klub aller 96, kommt in der Liga nicht vor) liegen dort bei rund 6,7 je Partie und entstehen aus den Abschluss- und Torwartwerten, nicht aus einer Vorgabe. Eine neue physische Reihe mit größeren Abständen würde diesen Teil belegen.
- **Fernschüsse im Standardfeld:** Die physischen Fernschützen haben im Mittel 15,2 Abschlusspunkte, kompakt 13,5, weil jede Mannschaft nur fünf Feldspieler hat und das Auswahlgewicht die besten nicht schärfer trennen kann. Tore je Fernschuss 18 % statt 23 % (rund 0,1 Tore je Partie, im Gesamtmittel durch Freistoßfolgen und Kopfbälle ausgeglichen, die 1–2 Punkte darüber liegen). Großes Feld: 15 % gegen 15 %.
- **Klassen mit wenigen physischen Partien:** Standard 1–2 Punkte (+4,8 Punkte Favoritensieg, 62 Partien) und großes Feld 2–3 Punkte (+4,8 Punkte, 47 Partien) liegen knapp unter der Grenze von 5 Punkten; das 95-%-Intervall der physischen Klassen ist rund ±12 Punkte breit, die geglättete Anpassung weicht um höchstens 3,0 Punkte ab. Tore je Klasse: Standard 0–1 −9,1 % und groß ab 3 −9,6 % liegen knapp innerhalb der 10 %; ein Aufschlag auf die Torbasis (+0,05 / +0,02) hob die Gesamttore auf −1,7 % / −0,7 %, schob aber den Favoritensieg Standard 1–2 auf +5,3 Punkte und wurde verworfen. Ein Hebel für eine einzelne Klasse würde die benachbarten Klassen verschieben und wurde nicht eingeführt. Remis schwacher Teams im Standardfeld allein: −4,5 Punkte gegen 46 physische Partien (28 % gegen 24 %); beide Felder zusammen −0,2 Punkte (118 Partien).
- **Keine physischen Vorlagen:** Das ausgespielte Spiel schreibt keine Vorlagen (`assistPid: null`). Die Vorlagenverteilung der Kompaktpartien (rund 0,65–0,7 Vorlagen je Tor, Geber Spielmacher, Flügel, Zielspieler doppelt gewichtet) hat deshalb keinen Vergleichswert und folgt den bisherigen Rollengewichten.
- **Müdigkeit und Form wirken nicht auf die Schussmenge,** sondern über die wirksamen Abschluss-, Pass- und Torwartwerte der einzelnen Aktionen. Die physische Reihe startet alle Spieler frisch; ein Einfluss auf die Schusszahl ließ sich dort nicht messen und wird nicht erfunden.
- **Spielstile:** Gemessen und übernommen ist nur die tiefe Abwehrlinie des Gegners (+41 % Schüsse für den Gegner im Standardfeld, +37 % im großen, 180 physische Mannschaftspartien, Konterstil Abwartend/Direkt/Tief). Pressing- und Aggressionsstile ließen sich in der Reihe nicht von der Mannschaftsstärke trennen (die Trainerstile liegen als feste Bündel vor) und bleiben ohne Wirkung auf die Schussmenge; die KI-Formationswechsel in der Partie wirken wie bisher nur über die Aufstellung.
- **Rechenzeit:** Kompakter Schritt 85,6 statt 77,2 ms je Partie in Node (+11 %), eine Saison der Welt dauert gleich lang (Standard 104 s gegen 92 s, groß 118 s gegen 105 s unter paralleler Last). Das Buchen der Hintergrundläufe je Minute kostete 138 ms je Partie, weil das Belastungsbuch bei jedem Ereignis alle bisherigen Ereignisse eines Spielers durchsucht; deshalb wird alle fünf Minuten ein Ereignis gebucht.
- **Eingefrorener Altcontroller:** `outputs/compact-balance-v183/baseline-v178-controller.js` ist ein Auszug des Stands `a95fe8d2`. Wer `v64Step` oder die Kompaktaktion der Kennungen 178/119 ändert, muss den Test bewusst gegen diesen Stand halten; die Kennung 183 ist nicht eingefroren und darf neu kalibriert werden (neue Matchzustände speichern ihren Parametersatz).
