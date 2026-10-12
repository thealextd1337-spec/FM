# Kompakte Matchabstimmung v178 – lokal umgesetzt

Nutzerauftrag „Führe die Vorschläge aus“. Neue Partien speichern `shotBalanceRevision:178` und die unveränderlich verwendeten Matchparameter `compactBalance`. Gewählt: Torbasis 0.32, Deckel 0.48, Heim-Schussfaktor 1.03. Die Schussentstehung bleibt bei 0,09 vor dem kleinen Heimaufschlag; keine garantierten Tore oder Siegquoten. Fähigkeiten bleiben qualitative Farbstufen. Lokal gebaut, noch nicht veröffentlicht.

## Nachweis und Auswahl

| Vergleich | Spiele | Tore/Spiel vorher | nachher | 0:0 vorher | nachher | Schüsse/Spiel nachher |
|---|---:|---:|---:|---:|---:|---:|
| Top gegen Top | 100 | 1,35 | 1,75 | 26,0 % | 18,0 % | 13,81 |
| Schwache Liga untereinander | 100 | 1,03 | 1,31 | 44,0 % | 39,0 % | 11,74 |
| Top gegen schwache Liga | 500 | 1,22 | 1,53 | 29,2 % | 22,6 % | 12,52 |
| Schwache Liga gegen stärkste Pokalvereine | 500 | 1,04 | 1,32 | 36,4 % | 27,0 % | 11,91 |
| A-Rang 3/4 gegen AUT/SUI/TUR Top 2 | 300 | 1,16 | 1,46 | 31,7 % | 23,3 % | 12,53 |

2.000 Screening-Spiele prüfen Kennung119 exakt gegen gespeicherte alte Ergebnisse/Verlaufshashes sowie getrennt Basis0,30, Basis0,32 und Deckel0,52. Gewählt wird die stärkere Reduktion torloser Spiele bei unverändertem Schusskorridor und sichtbarem Qualitätsgefälle; der isolierte höhere Deckel verbessert diese Stichprobe nicht. Keine feste neue Tor-/Remiszielquote.

1.500 Heimtest-Spiele bilden 500 gekoppelte Paare je Kandidat (+2/+3 Prozent relativ) mit einer gemeinsamen neutralen Kontrollserie. Torbasis bleibt0,27 zur Isolation. Gewählter Faktor: Heimschüsse 3021→3112, Heimtore 296→303, Heimsiege 142→145; 7/500 andere Spielstände. Ein kleiner Bonus bedeutet nicht, dass jedes Paar einen anderen Score liefert.

Abschließend 1.700 tatsächliche native kompakte Partien auf derselben vollständigen bisherigen Matrix, inklusive Top/Unten500, Fable1200 und gekoppelten Neutralfällen. Alle Abpfiffe, Spielminuten, Tor-/Schuss-/On-target-Buchhaltung, Bewertungen, Entwicklung, Belastung und Quell-/Startstanderhalt geprüft. Alle sieben Serien im Schusskorridor10–16. Fünf gemeinsame Startwelten sind eine Stichprobe, kein Signifikanz- oder allgemeiner physischer3D-Nachweis.

## Schussdiagnose

500 Baselinepartien mit 6214 tatsächlichen Schüssen liefern Histogramme für Schwierigkeit, Entfernung, Druck und Einsatzposition. 16,5 % liegen an der oberen Schwierigkeitsgrenze. Die Positionsermittlung wird nicht verändert: Die gezielte Verwertungsanpassung verbessert die geprüften Verteilungen bereits. [Diagnosedaten](../outputs/compact-balance-v178/shot-quality.json).

## Speicherung und Regression

Nur `v155Initialize` für neue Matchzustände setzt die neue Kennung und kopiert Parameter. Vorhandene Performancezustände werden dort nicht zurückgesetzt oder ummarkiert. `v155CompactActions` liest gespeicherte Matchwerte; ältere Kennung119 und unmarkierte Partien bleiben auf ihren bisherigen Schuss-/Torbasisregeln. Es gibt keine Welt-/Spielermigration oder Neuberechnung abgeschlossener Ergebnisse.

Homebonus ausschließlich in `v178CompactShotChance` für Heimseite auf nichtneutralem Feld; keine Übernahme des alten gesamten v64-Chancewerts und keine zweite Qualitätsgewichtung. Gäste/Neutral behalten die Basis; Torbasis und Heimwirkung wurden getrennt gewählt. Strikte Top2-/Pokalstartgrenzen, Eliteverteilung und Startvariation sind unverändert.

Regressionen vergleichen vollständige alte119-/unmarkierte Spiele samt Noten/Entwicklung/Belastung gegen den eingefrorenen Controller, JSON-Fortsetzung, Parameterspeicherung und idempotente Buchung. Der bisherige kontrollierte Kontakt-Test benötigte seine vorhandenen produktiven Geometrie-/Restore-Helfer und `structuredClone` im VM-Sandbox; diese Prüfabhängigkeiten sind ergänzt. Alle24 Kontaktprüfungen bestanden. Weltmatch, v55-Vollpartie und lokale Anlage/Export bestanden. Quellen-/Build-Browserbeleg wird unter `outputs/compact-balance-v178/browser-checks.json` gespeichert.

## Reproduktion

Im Produktionscheckout:

`node work/experiment-compact-balance-v178.cjs`

`node work/experiment-home-balance-v178.cjs`

`node work/validate-compact-balance-v178.cjs`

`node work/test-compact-balance-v178.cjs`

`node work/test-native-performance-context.cjs`

`node work/test-world-match-v64.cjs`

`node work/test-world-local-start.cjs`

`node work/test-v55.cjs`

`node work/build.cjs`

`node work/render-compact-balance-v178.cjs`

[Screening](../outputs/compact-balance-v178/screening.json), [Heimtest](../outputs/compact-balance-v178/home-screening.json), [finale Matrix](../outputs/compact-balance-v178/final-matrix.json), [Regression](../outputs/compact-balance-v178/regression.json), [CSV](../outputs/compact-balance-v178/einzelspiele.csv), [Ansicht](../outputs/compact-balance-v178/report.html).
