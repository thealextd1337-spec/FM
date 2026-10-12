# Top 10 gegen letzte 10 Ligavereine

500 native kompakte Spiele aus dem lokalen Produktionsstand. Je Paarung fünf Partien in fünf Startwelten; jeder Verein 50 Spiele, davon 25 zuhause und 25 auswärts. Die Gruppen sind nach durchschnittlicher Startkaderqualität über 30 neue Welten festgelegt. Nur Ligavereine, keine reinen Pokalvereine.

## Ergebnis

Topteam-Siege: 249 (49,8 %), Remis: 198 (39,6 %), Außenseitersiege: 53 (10,6 %). Tore 458:154, 1,22 pro Spiel. 146 Partien enden 0:0. Schüsse 3205:2958.

Die Topteams gewinnen häufiger und erzielen deutlich mehr Tore. Die hohe Remisquote begrenzt die Siegquote trotz deutlichem Qualitätsvorsprung. Dies ist eine Bestandsmessung ohne festgelegte Zielquote oder Änderung der Matchengine.

| Ligarang | Verein | Spiele | S | U | N | Tore | Punkte |
|---:|---|---:|---:|---:|---:|---:|---:|
| 1 | Madrid Central CF | 50 | 29 | 14 | 7 | 58:17 | 101 |
| 2 | FC München Isar | 50 | 25 | 21 | 4 | 39:11 | 96 |
| 3 | Newcastle Tyne FC | 50 | 26 | 21 | 3 | 52:16 | 99 |
| 4 | FC Dortmund Emscher | 50 | 28 | 20 | 2 | 51:11 | 104 |
| 5 | Barcelona Mar FC | 50 | 22 | 23 | 5 | 46:20 | 89 |
| 6 | Paris Central FC | 50 | 25 | 15 | 10 | 43:16 | 90 |
| 7 | Milano Ferro FC | 50 | 20 | 23 | 7 | 38:18 | 83 |
| 8 | Irwell FC | 50 | 26 | 20 | 4 | 48:16 | 98 |
| 9 | Marseille Union | 50 | 24 | 22 | 4 | 38:13 | 94 |
| 10 | Torino Centrale FC | 50 | 24 | 19 | 7 | 45:16 | 91 |
| 87 | Wandle Town | 50 | 6 | 24 | 20 | 12:35 | 42 |
| 88 | Vigo Atlantic FC | 50 | 11 | 10 | 29 | 26:56 | 43 |
| 89 | SV München Au | 50 | 4 | 22 | 24 | 12:37 | 34 |
| 90 | Aveiro Costa FC | 50 | 4 | 21 | 25 | 9:41 | 33 |
| 91 | Amsterdam Westhaven FC | 50 | 1 | 22 | 27 | 9:46 | 25 |
| 92 | Wiener SC Fortuna | 50 | 5 | 22 | 23 | 17:44 | 37 |
| 93 | Bruxelles Parc FC | 50 | 8 | 20 | 22 | 20:47 | 44 |
| 94 | Antalya Kıyı SK | 50 | 8 | 16 | 26 | 23:58 | 40 |
| 95 | Volos Pelion FC | 50 | 3 | 24 | 23 | 15:39 | 33 |
| 96 | Zürich Sihl FC | 50 | 3 | 17 | 30 | 11:55 | 26 |

## Reproduktion und Grenzen

`node work/measure-top-bottom-matches.cjs` und `node work/render-top-bottom-matches.cjs` im Produktionscheckout. Vorher bei geänderten Quellen die 30-Welten-Messung mit `node work/measure-start-roster-strength.cjs --worlds=30` erneuern.

Die produktiven Controller v64, v155 und v158 laufen unverändert. Jede Partie verwendet einen eigenen JSON-Startstand ohne vorherige Entwicklung, Transfers oder Belastung. Native KI-Coaches, Rollen, Form, Taktikwechsel, Auswechslungen und Belastung innerhalb der Partie bleiben wirksam. Keine synthetischen Ergebniswürfe, keine physischen Unity-Spiele. Ein separater vollständiger physischer Browsermatch prüft die neue Pokal-Erzeugung in Quelle und Build; er gehört nicht zu diesen 500 Spielen.

Alle 100 Paare spielen fünfmal; jeder Verein hat 25 Heim- und 25 Auswärtsspiele. Fünf exakte Replayprüfungen, unveränderte Startwelten und Quellhashes sowie vollständige Ergebnis-/Torbuchhaltung bestanden. Die kleine Einzelvereinsstichprobe begründet keine dauerhafte Rangfolge nach Siegquoten.

[Gesamtnachweis](../outputs/top-bottom-matches/results.json), [alle 500 Spiele als CSV](../outputs/top-bottom-matches/einzelspiele.csv), [100 Paarungen](../outputs/top-bottom-matches/paarungen.csv), [Vereinsauswertung](../outputs/top-bottom-matches/vereine.csv), [Ansicht](../outputs/top-bottom-matches/report.html).
