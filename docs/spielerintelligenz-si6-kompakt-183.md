# Spielerintelligenz 183: Kompaktsimulation folgt dem ausgespielten Spiel (SI-6, P02)

Stand: 16. Oktober 2026. Branch `feat/si-compact` (Worktree `work/si-compact`), abgezweigt von `integration/si-r133` = `a95fe8d2` (alle SI-Pakete, B22 und die Schlusskalibrierung SI-K2). Auftrag: Paket SI-6 des [Umsetzungsplans](spielerintelligenz-umsetzungsplan-2026-10-14.md) (Abschnitt „SI-6 P02“), Analyse 7.1 der [Spielerintelligenz-Analyse](spielerintelligenz-analyse-2026-10-14.md). Keine Veröffentlichung, keine Fußversion, kein WebGL-Build, kein Push; den Merge übernimmt die Integration.

Gilt nur für neue Partien (Kennung `shotBalanceRevision` 183). Bestehende Spielstände, laufende Partien und Partien mit Kennung 178, 119 oder ohne Kennung bleiben bytegleich; es gibt keine Umrechnung gespeicherter Ergebnisse. Die alte Sechserliga ist unberührt. Fähigkeiten bleiben Farbstufen, die Oberfläche zeigt keine neuen Zahlen.

## Ergebnis in Kürze

- **Neue Kompaktsimulation** für alle Partien, die der Manager nicht ausspielt (Liga, Pokal, Europacup): Die erwarteten Schüsse je Mannschaft folgen dem Stärkeabstand, jeder Schuss hat eine Quelle (Spielzug, Fernschuss, Kopfball/Volley, Abpraller, Ecke, Freistoßfolge, direkter Freistoß), einen nach Rolle und Fähigkeit gewichteten Schützen und ein Ergebnis aus Abschluss und Torwart (`gk`-Hebel). Ecken, Flanken, Fouls und Freistöße entstehen als Mannschaftsstatistik, das Belastungsprofil ist nachkalibriert.
- **Gegen die physische Abnahmereihe SI-K2** (dieselben 567 Fixtures, 16 kompakte Wiederholungen je Fixture = 9.072 Partien): Schüsse -0,9 % (Standard) / -1,0 % (groß), Tore -2,9 % / -1,0 %, aufs Tor -1,3 % / -1,7 %. Favoritensiege bei 1,5 Punkten Abstand geglättet 68 % / 63 % (physisch 67 % / 61 %), bei 4 Punkten 94 % / 91 % (93 % / 90 %). Remis schwacher Teams +0,2 Punkte (beide Felder, 118 physische Partien). Frischeverbrauch je Linie und je Ausdauerklasse auf ±0,6 Punkte, Fouls, Ecken und Flanken auf ±2 %.
- **Kriterien des Plans:** alle erfüllt.
- **Wirkung auf die Welt:** Tore je Partie in der Vereinswelt steigen von 1,4 (Kennung 178) auf 4,0 (183), entsprechend dem Torziel 3–5 vom 15. Oktober. Das ist die gewollte Folge von „kompakt folgt ausgespielt“, aber die größte sichtbare Änderung: Torschützenkönig der Ligen im Mittel 6 → 31 Tore, 0:0 25,6 % → 3,5 %, Punktspanne der Tabellen 16,1 → 30,8 (Abschnitt Saisonebene).
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
4. **Ergebnis:** aufs Tor mit σ(Basis[Quelle] + 0,196·(Abschluss − 10) + 0,06·Stärkeabstand), Tor mit σ(Basis[Quelle] + 0,173·(Abschluss − 10) − 0,148·(Torwart `gk` − 10)). Abschluss und Torwart sind die wirksamen Werte mit Frische und Form des Belastungsmodells (`v158Ability`). Der Torwart wirkt also über seine Fähigkeit; es gibt keinen festen Deckel mehr.
5. **Vorlage:** je Quelle ein Anteil der Tore ist vorbereitet (Spielzug 80 %, Fernschuss 15 %, Kopfball 90 %, Freistoßfolge 60 %, Abpraller und direkter Freistoß 0 %); Geber nach den bisherigen Rollengewichten (Spielmacher, Flügel, Zielspieler doppelt). Das ausgespielte Spiel zählt keine Vorlagen, es gibt dort keinen Vergleichswert.
6. **Passkette und Zweikampf:** Eine Schussminute beginnt mit einem vollendeten Pass; jede andere Minute behält den Passversuch mit Erfolgswahrscheinlichkeit und den Zweikampf von Kennung 178. Damit bleiben Passereignisse, Belastungseinträge und Noten in Art und Menge gleich.
7. **Statistik:** Ecken, Flanken, Fouls und Freistöße laufen auf eigenen Minutenwürfen mit den Raten der physischen Reihe je Feldgröße. Jeder Kopfball-/Eckschuss zählt eine Flanke. Fouls werden dem foulenden Spieler (Abwehr stärker, Zweikampfwert) gutgeschrieben und stehen in seiner Spielerzeile; die Mannschaftswerte stehen im Matchzustand (`compactStats`) und im Spielbericht (`record.teamStats`).
8. **Belastung:** Das Laufen der Spieler ohne eigenes Ereignis (Positionsspiel, Doppeln, Pressing) fehlte im Kompaktmodell. `v183CompactBackground` (`dist/world-player-load-v158.js:226`) bucht je Linie Laufeinheiten (`load.background`), gesammelt und alle fünf Minuten als ein Ereignis. `v158CompactOffers`/`-Contact` bleiben unverändert.

Was bewusst gleich bleibt: kleiner relativer Heimaufschlag (1,03, neutral keiner), der Nachspielzeitwurf, KI-Wechsel und -Taktik, Noten (`D6MatchRatings`), Entwicklung und Buchung sowie alle Welt- und Pokalregeln (Pokalvereine mindestens 10 % schwächer, strenge Ligaspitzen, seltene Elite). Kein Ergebnis wird gesetzt: Tore und Siege folgen ausschließlich aus Schussmenge, Abschluss und Torwart.

### Parameter (Vorgaben neuer Partien, Standardfeld / großes Feld)

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
| `levers` | aufs Tor 0,196/Abschlusspunkt, 0,06/Abstandspunkt; Tor 0,173/Abschlusspunkt, -0,148/Torwartpunkt | gleich | Hebel aus der Anpassung an die K2-Schüsse |
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

Auswertung: `work/table-compact-physical-v183.cjs f10` (Ausgabe unten unverändert übernommen).

## Ergebnis: kompakt gegen physisch

### Standardfeld (physisch 284, kompakt 4544)

| Kennzahl | physisch | kompakt | Abweichung |
| --- | ---: | ---: | ---: |
| Schüsse je Partie | 13,40 | 13,28 | -0,9 % |
| aufs Tor | 7,24 | 7,15 | -1,3 % |
| Tore je Partie | 4,03 | 3,91 | -2,9 % |
| Streuung der Tore | 2,41 | 2,37 | -1,9 % |
| 0:0 | 5,3 % | 3,5 % | -1,7 P. |
| ≥ 7 Tore | 16,2 % | 12,9 % | -3,3 P. |
| Ecken | 1,69 | 1,69 | -0,0 % |
| Flanken | 4,86 | 4,90 | +1,0 % |
| Fouls | 3,93 | 3,95 | +0,5 % |
| Freistöße | 4,00 | 4,01 | +0,4 % |
| Tore je Schuss | 30,1 % | 29,5 % | -0,6 P. |
| aufs Tor je Schuss | 54,1 % | 53,8 % | -0,2 P. |

| Abstand | Partien phys / komp | Sieg Favorit phys → komp | Remis phys → komp | Niederlage phys → komp | Tore phys → komp | Schüsse Favorit/Außenseiter phys → komp | Tore Favorit/Außenseiter phys → komp |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0-1 | 88 / 1408 | 51 % → 50 % (-1,3 P.) | 24 % → 23 % (-1,0 P.) | 25 % → 27 % | 3,43 → 3,16 | 7,4/5,8 → 6,6/5,8 | 2,06/1,38 → 1,85/1,31 |
| 1-2 | 62 / 992 | 65 % → 69 % (+4,6 P.) | 18 % → 16 % (-1,3 P.) | 18 % → 14 % | 3,13 → 3,33 | 8,1/4,6 → 8,1/5,0 | 2,13/1,00 → 2,40/0,93 |
| 2-3 | 48 / 768 | 79 % → 79 % (+0,0 P.) | 19 % → 14 % (-4,9 P.) | 2 % → 7 % | 3,58 → 3,61 | 8,5/3,8 → 8,9/4,5 | 2,92/0,67 → 2,86/0,75 |
| >=3 | 86 / 1376 | 94 % → 94 % (-0,1 P.) | 2 % → 4 % (+2,0 P.) | 3 % → 2 % | 5,55 → 5,28 | 11,0/3,6 → 10,6/3,6 | 4,93/0,62 → 4,74/0,53 |

Geglättet (logistische Anpassung): Favorit bei 1,5 Punkten 67 % → 68 % (+0,6 P.), bei 4 Punkten 93 % → 94 % (+1,3 P.)

Schwache Teams (beide Mannschaften unter 10,5 Punkten): Partien 46 / 736, Remis 28 % → 23 % (-4,9 P.), Tore 2,78 → 2,78

| Schussquelle | je Partie phys | je Partie komp | Tore je Schuss phys | Tore je Schuss komp | Schützenwert Abschluss phys | Abschluss komp |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| open | 7,56 | 7,46 | 29 % | 29 % | 12,53 | 12,48 |
| long | 1,79 | 1,80 | 23 % | 18 % | 15,18 | 13,53 |
| header-volley | 1,61 | 1,60 | 42 % | 43 % | 11,29 | 11,40 |
| rebound | 0,47 | 0,46 | 50 % | 47 % | 13,14 | 12,81 |
| corner | 0,12 | 0,12 | 56 % | 43 % | 12,42 | 11,41 |
| free-kick-follow | 1,55 | 1,55 | 25 % | 27 % | 11,98 | 12,51 |
| direct-free-kick | 0,28 | 0,28 | 13 % | 13 % | 13,90 | 13,15 |

| Rolle | Schüsse-Anteil phys | komp | Tor-Anteil phys | komp | Assist-Anteil komp |
| --- | ---: | ---: | ---: | ---: | ---: |
| striker | 37,5 % | 35,2 % | 34,2 % | 35,2 % | 4,4 % |
| poacher | 21,3 % | 21,0 % | 19,7 % | 22,4 % | 3,0 % |
| box-to-box | 12,8 % | 13,5 % | 13,8 % | 13,5 % | 8,1 % |
| playmaker | 8,2 % | 8,0 % | 9,2 % | 6,5 % | 22,8 % |
| target-player | 6,0 % | 6,9 % | 6,1 % | 6,5 % | 3,5 % |
| cover-defender | 4,4 % | 4,7 % | 6,4 % | 5,9 % | 15,6 % |
| ball-winner | 3,0 % | 2,9 % | 3,5 % | 2,4 % | 9,4 % |
| stopper | 2,7 % | 3,1 % | 2,7 % | 3,0 % | 17,3 % |
| ball-playing-defender | 1,9 % | 2,3 % | 2,4 % | 2,7 % | 12,8 % |
| dribbler | 1,8 % | 2,0 % | 1,8 % | 1,8 % | 1,4 % |
| winger | 0,3 % | 0,3 % | 0,2 % | 0,2 % | 1,8 % |

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
| aufs Tor | 6,67 | 6,56 | -1,7 % |
| Tore je Partie | 3,68 | 3,64 | -1,0 % |
| Streuung der Tore | 2,21 | 2,20 | -0,6 % |
| 0:0 | 3,5 % | 4,0 % | +0,4 P. |
| ≥ 7 Tore | 11,0 % | 10,1 % | -0,8 P. |
| Ecken | 1,41 | 1,42 | +1,1 % |
| Flanken | 3,16 | 3,17 | +0,2 % |
| Fouls | 2,83 | 2,81 | -0,7 % |
| Freistöße | 3,02 | 2,99 | -1,0 % |
| Tore je Schuss | 28,8 % | 28,8 % | -0,0 P. |
| aufs Tor je Schuss | 52,2 % | 51,9 % | -0,4 P. |

| Abstand | Partien phys / komp | Sieg Favorit phys → komp | Remis phys → komp | Niederlage phys → komp | Tore phys → komp | Schüsse Favorit/Außenseiter phys → komp | Tore Favorit/Außenseiter phys → komp |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0-1 | 81 / 1296 | 42 % → 45 % (+3,2 P.) | 26 % → 24 % (-1,7 P.) | 32 % → 31 % | 2,88 → 3,03 | 6,7/6,0 → 6,4/5,8 | 1,58/1,30 → 1,68/1,35 |
| 1-2 | 68 / 1088 | 63 % → 64 % (+1,2 P.) | 21 % → 19 % (-1,8 P.) | 16 % → 17 % | 2,99 → 3,25 | 7,4/5,0 → 7,4/5,2 | 2,04/0,94 → 2,21/1,03 |
| 2-3 | 47 / 752 | 72 % → 77 % (+4,8 P.) | 15 % → 13 % (-1,5 P.) | 13 % → 9 % | 3,38 → 3,38 | 7,6/4,0 → 7,9/4,7 | 2,53/0,85 → 2,60/0,78 |
| >=3 | 87 / 1392 | 91 % → 90 % (-0,6 P.) | 9 % → 7 % (-2,1 P.) | 0 % → 3 % | 5,13 → 4,66 | 9,5/4,2 → 9,2/4,0 | 4,33/0,79 → 4,05/0,61 |

Geglättet (logistische Anpassung): Favorit bei 1,5 Punkten 61 % → 63 % (+2,4 P.), bei 4 Punkten 90 % → 91 % (+0,8 P.)

Schwache Teams (beide Mannschaften unter 10,5 Punkten): Partien 72 / 1152, Remis 18 % → 21 % (+3,4 P.), Tore 2,67 → 2,77

| Schussquelle | je Partie phys | je Partie komp | Tore je Schuss phys | Tore je Schuss komp | Schützenwert Abschluss phys | Abschluss komp |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| open | 6,15 | 6,03 | 34 % | 34 % | 12,08 | 12,14 |
| long | 3,77 | 3,80 | 15 % | 15 % | 13,35 | 13,03 |
| header-volley | 1,17 | 1,16 | 39 % | 39 % | 11,32 | 11,28 |
| rebound | 0,45 | 0,45 | 45 % | 43 % | 12,63 | 12,46 |
| corner | 0,03 | 0,03 | 0 % | 46 % | 12,13 | 11,26 |
| free-kick-follow | 1,02 | 1,02 | 28 % | 30 % | 11,68 | 12,17 |
| direct-free-kick | 0,16 | 0,15 | 14 % | 15 % | 13,31 | 13,07 |

| Rolle | Schüsse-Anteil phys | komp | Tor-Anteil phys | komp | Assist-Anteil komp |
| --- | ---: | ---: | ---: | ---: | ---: |
| striker | 38,0 % | 35,9 % | 30,8 % | 36,4 % | 8,2 % |
| poacher | 22,8 % | 22,3 % | 21,0 % | 22,2 % | 5,4 % |
| box-to-box | 13,5 % | 14,1 % | 18,9 % | 16,7 % | 8,3 % |
| dribbler | 6,2 % | 6,5 % | 3,3 % | 3,8 % | 1,6 % |
| playmaker | 6,0 % | 6,4 % | 10,0 % | 6,2 % | 22,6 % |
| target-player | 5,4 % | 5,1 % | 5,9 % | 4,5 % | 4,5 % |
| stopper | 2,2 % | 2,1 % | 2,6 % | 2,1 % | 14,7 % |
| cover-defender | 2,0 % | 3,2 % | 3,5 % | 4,1 % | 13,1 % |
| ball-winner | 1,8 % | 1,9 % | 1,8 % | 1,5 % | 8,1 % |
| ball-playing-defender | 1,3 % | 1,5 % | 1,4 % | 1,8 % | 9,8 % |
| winger | 0,7 % | 1,0 % | 0,7 % | 0,6 % | 3,6 % |

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

Schüsse 13,08 → 12,96 (-0,9 %), Tore 3,86 → 3,78 (-2,0 %); schwache Teams (beide unter 10,5 Punkten): Partien 118 / 1888, Remis 22 % → 22 % (+0,2 P.), Tore 2,71 → 2,77

### Kriterien (Plan SI-6)

| Kriterium | Standard | groß | beide | Urteil |
| --- | ---: | ---: | ---: | --- |
| Schüsse je Partie (≤ 10 %) | -0,9 % | -1,0 % | -0,9 % | ✓ |
| Tore je Partie (≤ 10 %) | -2,9 % | -1,0 % | -2,0 % | ✓ |
| Favorit bei 1,5 Punkten geglättet (≤ 5 Punkte) | +0,6 P. | +2,4 P. | – | ✓ |
| Favorit bei 4 Punkten geglättet (≤ 5 Punkte) | +1,3 P. | +0,8 P. | – | ✓ |
| Remis schwacher Teams (± 5 Punkte) | -4,9 P. (46 physische Partien) | +3,4 P. (72) | +0,2 P. (118) | ✓ (Standard allein knapp) |
| aufs Tor (Anteil der Schüsse) | -0,2 P. | -0,4 P. | – | ✓ |
| Tore je Schuss | -0,6 P. | -0,0 P. | – | ✓ |

Je Stärkeabstand und Feldgröße (Abweichung kompakt gegen physisch):

| Feld | Abstand | physische Partien | Schüsse | Tore | Sieg Favorit | Remis |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Standard | 0-1 | 88 | -6,1 % ✓ | -7,9 % ✓ | -1,3 P. ✓ | -1,0 P. |
| Standard | 1-2 | 62 | +2,4 % ✓ | +6,4 % ✓ | +4,6 P. ✓ | -1,3 P. |
| Standard | 2-3 | 48 | +8,9 % ✓ | +0,7 % ✓ | +0,0 P. ✓ | -4,9 P. |
| Standard | >=3 | 86 | -2,6 % ✓ | -4,8 % ✓ | -0,1 P. ✓ | +2,0 P. |
| groß | 0-1 | 81 | -4,9 % ✓ | +5,3 % ✓ | +3,2 P. ✓ | -1,7 P. |
| groß | 1-2 | 68 | +1,1 % ✓ | +8,8 % ✓ | +1,2 P. ✓ | -1,8 P. |
| groß | 2-3 | 47 | +8,7 % ✓ | -0,2 % ✓ | +4,8 P. ✓ | -1,5 P. |
| groß | >=3 | 87 | -3,6 % ✓ | -9,2 % ✓ | -0,6 P. ✓ | -2,1 P. |

Die Tabellen sind die Auswertung; hier die Einordnung der Abweichungen:

- Keine Klasse liegt außerhalb der Grenzen.
- Knapp an der Grenze (über 80 % des erlaubten Abstands): Favoritensieg Standard 1-2 (+4,6 Punkte); Schüsse Standard 2-3 (+8,9 %); Tore groß 1-2 (+8,8 %); Schüsse groß 2-3 (+8,7 %); Favoritensieg groß 2-3 (+4,8 Punkte); Tore groß >=3 (-9,2 %). Das sind die Klassen mit den kleinsten physischen Stichproben.
- Das Intervall der physischen Klassen ist groß: 47–88 Partien je Klasse bedeuten rund ±12 Punkte beim Siegeranteil (95 %). Dieselbe Klasse schwankte zwischen gleichwertigen physischen Reihen um bis zu 20 Punkte (siehe SI-K2). Die kompakten Klassen haben 16-mal so viele Partien und sind genau; die Abweichung kommt zu großen Teilen vom Stichprobenfehler der Referenz. Die geglättete Anpassung (alle Partien, nicht je Klasse) weicht bei 2,4 Punkten oder weniger ab.
- Remis schwacher Teams: Standardfeld -4,9 Punkte (46 physische Partien), großes Feld +3,4 Punkte (72), beide Felder +0,2 Punkte (118). „Schwach“ heißt: beide Mannschaften unter 10,5 Punkten Stärke (untere Hälfte der Reihe).
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

`work/measure-compact-seasons-v183.cjs` spielt vollständige Saisonen der neuen Vereinswelt (12 Länder, 991 Partien je Saison, der Manager spielt nicht aus) einmal mit Kennung 183 und einmal mit 178 auf denselben Welten (standard: si6-season-a; large: si6-season-b).

### Standardfeld (3 Saisonen, Welt si6-season-a, Verein AUT-5)

| Kennzahl (Mittel der Saisonen) | Kennung 178 | Kennung 183 |
| --- | ---: | ---: |
| Tore je Partie (alle Wettbewerbe) | 1,39 | 4,05 |
| Tore je Ligaspiel | 1,39 | 3,95 |
| Streuung der Tore | 1,19 | 2,44 |
| 0:0 | 25,4 % | 3,7 % |
| Heimsiege | 30,2 % | 42,1 % |
| Remis | 38,1 % | 15,0 % |
| Punktspanne Tabelle (Erster − Letzter, Mittel der zwölf Ligen) | 16,1 | 32,1 |
| Punkte des Meisters | 26,9 | 36,9 |
| Punkte des Letzten | 10,7 | 4,8 |
| Torschützenkönig der Ligen (Mittel der zwölf Ligen) | 5,7 | 33,3 |
| Torschützenkönig der Ligen (höchster Wert je Saison, Mittel) | 8 | 48 |
| Torschützenkönig aller Wettbewerbe einschließlich Pokale (Mittel) | 4,2 | 22,2 |
| Vorlagenkönig der Ligen (Mittel) | 5,7 | 11,9 |
| Note Mittel (Einsätze ab 20 min) | 8,02 | 8,05 |
| Note Streuung | 0,69 | 0,75 |
| Noten ≥ 8 | 54,8 % | 58,1 % |
| Noten < 5 | 0,0 % | 0,0 % |
| Frische aller Spieler am Saisonende | 99,0 | 98,6 |
| Rechenzeit je Saison (s) | 92 | 104 |

Favoritensieg und Remis der Ligaspiele je Stärkeabstand (Mittel der Startelf wie in der physischen Reihe):

| Abstand | Ligaspiele 178 / 183 | Sieg Favorit 178 → 183 | Remis 178 → 183 |
| --- | ---: | ---: | ---: |
| 0-1 | 658 / 660 | 32 % → 44 % | 39 % → 23 % |
| 1-2 | 481 / 479 | 36 % → 64 % | 37 % → 19 % |
| 2-3 | 375 / 361 | 40 % → 81 % | 39 % → 11 % |
| >=3 | 490 / 504 | 44 % → 95 % | 35 % → 3 % |

Mannschaftsstatistik je Partie (Saison 1): shots 13,41, onTarget 7,63, corners 1,75, crosses 4,97, fouls 3,86, freeKicks 3,92.

### großes Feld (3 Saisonen, Welt si6-season-b, Verein AUT-5)

| Kennzahl (Mittel der Saisonen) | Kennung 178 | Kennung 183 |
| --- | ---: | ---: |
| Tore je Partie (alle Wettbewerbe) | 1,42 | 3,93 |
| Tore je Ligaspiel | 1,43 | 3,83 |
| Streuung der Tore | 1,22 | 2,29 |
| 0:0 | 25,8 % | 3,4 % |
| Heimsiege | 31,8 % | 43,2 % |
| Remis | 39,1 % | 15,8 % |
| Punktspanne Tabelle (Erster − Letzter, Mittel der zwölf Ligen) | 16,0 | 29,4 |
| Punkte des Meisters | 26,7 | 35,4 |
| Punkte des Letzten | 10,7 | 6,1 |
| Torschützenkönig der Ligen (Mittel der zwölf Ligen) | 5,5 | 28,0 |
| Torschützenkönig der Ligen (höchster Wert je Saison, Mittel) | 8 | 35 |
| Torschützenkönig aller Wettbewerbe einschließlich Pokale (Mittel) | 3,9 | 19,0 |
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
| 0-1 | 648 / 606 | 31 % → 46 % | 40 % → 21 % |
| 1-2 | 492 / 517 | 31 % → 59 % | 39 % → 20 % |
| 2-3 | 331 / 360 | 39 % → 73 % | 43 % → 17 % |
| >=3 | 531 / 519 | 44 % → 90 % | 38 % → 7 % |

Mannschaftsstatistik je Partie (Saison 1): shots 13,50, onTarget 7,42, corners 1,38, crosses 3,31, fouls 2,79, freeKicks 2,99.

## Prüfungen

Node 24 (`C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`), Endstand dieses Branches. Nach den Messläufen liefen die Prüfungen nacheinander ohne parallele Messreihe.

| Prüfung | Ergebnis |
| --- | --- |
| `work/test-compact-balance-v183.cjs` (neu, im Workflow-Block) | 12 Prüfungen grün: Snapshot und Feldgrößenwahl, Marker bleibt bei bestehendem Zustand, Schussrate (Abstand, 3 % Heimaufschlag nur Heimseite, Tief-Faktor, Plateau), Hebel (Abschluss, `gk`, Abstand), Heimzweig in gespielten Partien, volle Partien mit Kennung 178, 119 und ohne Kennung gleich dem eingefrorenen Controller samt JSON-Fortsetzung, Kennung 183 (gespeicherter Parametersatz zählt, JSON-Fortsetzung exakt, Buchung idempotent), Statistik/Quellen/Spielerzeilen konsistent, Rollentabellen vollständig, Belastungsband |
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

## Risiken und offene Punkte

- **Die Liga wird zur Spitzenliga der stärksten Vereine (größte sichtbare Folge).** Mit dem Torniveau und den Favoritenquoten der physischen Reihe wächst die Punktspanne der Ligen von rund 16 auf rund 30 Punkte (14 Spiele je Verein: Meister 37 statt 27 Punkte, Letzter 5–6 statt 11), der Torschützenkönig einer Liga von im Mittel 6 auf 28–33 Tore (höchster Wert einer Saison 57), Vorlagenkönige von 5–6 auf 10–12, Heimsiege von 30 % auf 42 %, Remis von 38 % auf 15 %. Das ist keine Vorgabe, sondern die Antwort der Kompaktpartie auf den Stärkeabstand der Weltvereine (Startkader mit strengen Ligaspitzen und seltenen Elite-Spielern); die physische Reihe liefert dort 94 % Favoritensiege und 5,5 Tore. Wer das Tabellenbild weicher will, muss die Favoritenquote im ausgespielten Spiel ändern und die Kompaktpartie danach neu anpassen (Entscheidung „Favoritenquote 16. Oktober 2026“ nennt Siege von rund 90 % und mehr ab 3 Punkten).
- **Tore je Partie in der Welt steigen auf rund das Dreifache** (1,4 mit Kennung 178, rund 4,0 mit 183). Das folgt dem Torziel 3–5 (Nutzerentscheidung 15. Oktober 2026) und der physischen Reihe, ändert aber Torschützenlisten, Tordifferenzen, Torquoten je Spieler und die 0:0-Quote (25 % auf 3,5 %) sichtbar. Bereits laufende Saisons behalten ihre Ergebnisse; neue Partien einer bestehenden Welt folgen der neuen Kennung, so dass eine laufende Saison zwei Torniveaus mischt. Eine Umrechnung wäre eine Spielstandmigration und ist nicht Teil des Auftrags.
- **Sponsorziel „mindestens N Tore“** (`dist/world-economy-v66.js:138`, Liga ab `11 + startingSquad`, Pokal 4 reguläre Tore) wird mit dem höheren Torniveau von beiden Seiten leichter erreicht. Die Schwelle wurde für 1,4 Tore je Partie gewählt und nicht angefasst; ein Folgeauftrag müsste sie an das neue Niveau anpassen.
- **Abstand über der Messreihe:** Die physische Reihe enthält nur 22 Partien mit mehr als 5,5 und 9 mit mehr als 6 Punkten Abstand. Darüber wirkt der Abstand nur noch mit dem Faktor 0,15 und die Favoritenschüsse laufen in ein Plateau (`gapKnee` 5,5, `gapOver` 0,15, `shotKnee` 11,5 bzw. 10, `shotOver` 0,1), damit die Schüsse im Korridor von 10–16 bleiben. Die Tore der extremsten Paarungen (Spitzenklub gegen letzten Klub aller 96, kommt in der Liga nicht vor) liegen dort bei rund 6,7 je Partie und entstehen aus den Abschluss- und Torwartwerten, nicht aus einer Vorgabe. Eine neue physische Reihe mit größeren Abständen würde diesen Teil belegen.
- **Fernschüsse im Standardfeld:** Die physischen Fernschützen haben im Mittel 15,2 Abschlusspunkte, kompakt 13,5, weil jede Mannschaft nur fünf Feldspieler hat und das Auswahlgewicht die besten nicht schärfer trennen kann. Tore je Fernschuss 18 % statt 23 % (rund 0,1 Tore je Partie, im Gesamtmittel durch Freistoßfolgen und Kopfbälle ausgeglichen, die 1–2 Punkte darüber liegen). Großes Feld: 15 % gegen 15 %.
- **Klassen mit wenigen physischen Partien:** Standard 1–2 Punkte (+4,6 Punkte Favoritensieg, 62 Partien) und großes Feld 2–3 Punkte (+4,8 Punkte, 47 Partien) liegen knapp unter der Grenze von 5 Punkten; das 95-%-Intervall der physischen Klassen ist rund ±12 Punkte breit, die geglättete Anpassung weicht um höchstens 2,4 Punkte ab. Ein Hebel für eine einzelne Klasse würde die benachbarten Klassen verschieben und wurde nicht eingeführt. Remis schwacher Teams im Standardfeld allein: −4,9 Punkte gegen 46 physische Partien (28 % gegen 23 %); beide Felder zusammen +0,2 Punkte (118 Partien).
- **Keine physischen Vorlagen:** Das ausgespielte Spiel schreibt keine Vorlagen (`assistPid: null`). Die Vorlagenverteilung der Kompaktpartien (rund 0,65–0,7 Vorlagen je Tor, Geber Spielmacher, Flügel, Zielspieler doppelt gewichtet) hat deshalb keinen Vergleichswert und folgt den bisherigen Rollengewichten.
- **Müdigkeit und Form wirken nicht auf die Schussmenge,** sondern über die wirksamen Abschluss-, Pass- und Torwartwerte der einzelnen Aktionen. Die physische Reihe startet alle Spieler frisch; ein Einfluss auf die Schusszahl ließ sich dort nicht messen und wird nicht erfunden.
- **Spielstile:** Gemessen und übernommen ist nur die tiefe Abwehrlinie des Gegners (+41 % Schüsse für den Gegner im Standardfeld, +37 % im großen, 180 physische Mannschaftspartien, Konterstil Abwartend/Direkt/Tief). Pressing- und Aggressionsstile ließen sich in der Reihe nicht von der Mannschaftsstärke trennen (die Trainerstile liegen als feste Bündel vor) und bleiben ohne Wirkung auf die Schussmenge; die KI-Formationswechsel in der Partie wirken wie bisher nur über die Aufstellung.
- **Rechenzeit:** Kompakter Schritt 85,6 statt 77,2 ms je Partie in Node (+11 %), eine Saison der Welt dauert gleich lang (Standard 104 s gegen 92 s, groß 118 s gegen 105 s unter paralleler Last). Das Buchen der Hintergrundläufe je Minute kostete 138 ms je Partie, weil das Belastungsbuch bei jedem Ereignis alle bisherigen Ereignisse eines Spielers durchsucht; deshalb wird alle fünf Minuten ein Ereignis gebucht.
- **Eingefrorener Altcontroller:** `outputs/compact-balance-v183/baseline-v178-controller.js` ist ein Auszug des Stands `a95fe8d2`. Wer `v64Step` oder die Kompaktaktion der Kennungen 178/119 ändert, muss den Test bewusst gegen diesen Stand halten; die Kennung 183 ist nicht eingefroren und darf neu kalibriert werden (neue Matchzustände speichern ihren Parametersatz).
