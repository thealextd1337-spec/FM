# Release 119: Stock-Diagnose der Schussgelegenheiten

Stand: 10. Oktober 2026. Zwei vollständige zusätzliche Stock-Proben, keine Kandidaten oder Produktionsänderungen.

## Umfang und Neutralität

Standardfeld mit fünf beziehungsweise sechs Feldspielern, Karriere `shot119-0`, PRNG-Start `169032`, erste eigene Ligapartie `S1:GER:LEAGUE:R1:GER-6-GER-2:1`. Alle geladenen Quellbytes stimmen mit den vorhandenen Passdiagnose-Baselines überein. Beide beobachteten Laufdigests sind exakt gleich den bereits vorhandenen unbeobachteten Kontrollen, einschließlich Ergebnis, Statistiken, Ereignissen, Belastung, physischem Zustand, Fortsetzungszustand sowie PRNG-Endpunkt und Zufallsziehungen.

Erfasst werden die tatsächlichen Aufrufe von `v157Decide`, `v159Decide`, `v157ContinueTurn`, Options-Lane-/Qualitätsprüfungen und gewählten Aktionen. Die unveränderten nativen Funktionen `v159ShotWindow` und `v145ShotChance` werden zusätzlich rein lesend abgefragt. Der Digestvergleich bestätigt die Neutralität dieser Abfragen.

Eine **genuine Gelegenheit** im Report bedeutet: `v159Decide` hat die Entscheidung nicht für Ballannahme/Carry verbraucht, `v157ContinueTurn` hat sie nicht verbraucht und bei Eintritt bestand kein Pending-Turn. Nach einem verworfenen Pending-Turn erreichte Entscheidungen stehen zusätzlich im Gate `opportunity`, werden aber nicht als genuine Gelegenheit gezählt. Entscheidungen und eindeutige Ballkontrollepisoden werden getrennt angegeben.

## Gemessene Befunde

| Beobachtung | Standard 5 | Standard 6 |
| --- | ---: | ---: |
| Vollspiel: Schüsse / aufs Tor | 6 / 2 | 5 / 2 |
| Eigentümerentscheidungen bis 30 m | 131 | 167 |
| Davon Pending-Turn / vorheriger Carry / Ballannahme | 73 / 10 / 0 | 104 / 14 / 0 |
| Genuine Entscheidungen bis 22 m, eindeutige Episoden | 6, aus 4 | 20, aus 8 |
| Genuine bis 22 m: Mittellane blockiert | 0 | 0 |
| Genuine bis 22 m: alle fünf Torsektoren blockiert | 0 | 0 |
| Genuine bis 22 m: Winkel-Hardgate, eindeutige Episoden | 0 | 13, aus 4 |
| Genuine bis 22 m: `v145Chance > 0` trotz Qualität 0 | 0 | 2, aus 1 |
| Genuine Entscheidungen über 22 bis 26 m | 11 | 11 |
| Genuine Entscheidungen über 26 bis 30 m | 16 | 7 |

Die vermutete blockierte nahe Schussgelegenheit ist in diesen beiden Stockfixtures nicht vorhanden: Auch **einschließlich der zuvor verbrauchten Gates** gab es bis 22 m keinen Eigentümerentscheid mit blockierter Mittellane. Deshalb existiert kein belegter Snapshot eines blockierten Abschlusses aus 10–18 m ohne sicheren progressiven Pass. Es wurde kein Beispiel erzeugt oder aus einem anderen Zustand eingesetzt.

Innerhalb 22 m entscheiden die genuine Gelegenheiten bei Standard5 dreimal Schuss, einmal Bodenpass und zweimal Carry. Bei Standard6 sind es dreimal Schuss, viermal Bodenpass, einmal Raumpass und zwölfmal Carry. Direkte native Abschlüsse außerhalb `v157Decide` bleiben in der Vollspielstatistik enthalten, gehören aber nicht zu dieser Gelegenheitstabelle.

Die genuine Gelegenheiten bis 22 m haben im Mittel den nächsten Feldgegner in 1,32/1,78 m Entfernung und einen aktuellen Körperwinkel von 0,65/0,57 rad zum besten vorhandenen nativen Torziel. Diese Werte sind beobachtete Geometrie, keine nachträglichen Qualitäts- oder Ergebnisvorgaben.

## Eng begrenzte Rangfolge

1. **Wenig genuine Gelegenheiten im vorhandenen 22-m-Bereich; viele Entscheidungen gehen zuvor an Pending-Turn.** Das ist der stärkste beobachtete gemeinsame Befund. Die Stock-Probe misst nicht den privaten Stage6-Kandidaten; dessen geänderte Passwege können andere Situationen erzeugen.
2. **Bei Standard6 wiederholt sich ein breiter Abschlusswinkel.** 13 Entscheidungen in vier Kontrollepisoden innerhalb 22 m scheitern an `lateral > depth*.85 + 1`. Zwei davon, in derselben Kontrollepisode, haben bereits eine positive vorhandene `v145ShotChance` und wählen Carry: bei 18,47/17,24 m Entfernung, 12,99/11,32 m Tiefe und 13,13/13,01 m seitlichem Abstand. Die Mittellane und die fünf Sektoren sind dort offen. Dies sind keine blockierten Nahabschlüsse.
3. **Der Block-Hardgate ist im Code vorhanden, in diesen Fixtures aber kein nachgewiesener Engpass.** Eine allgemeine Lockerung oder ein Blockrisiko-Kandidat kann aus dieser Probe nicht begründet werden.
4. **Außerhalb 22 m kommen weitere Entscheidungen vor.** Das beweist keine notwendige Reichweitenerhöhung und rechtfertigt keine Schussquote. Große Winkel und vorherige Gates bleiben teilweise gleichzeitig wirksam; Grundzählungen überlappen.

Ein Abschluss trotz Qualitätswert 0 wurde innerhalb 22 m beobachtet, weil der bestehende `v131OpenGoal`-Weg vor der Qualitätsprüfung abschließt. Ein Qualitäts-Hardgate ist daher nicht gleichbedeutend mit einem vollständigen Verbot jeder Sonderchance.

## Verantwortliche bestehende Stellen

- `dist/world-offensive-quality-v157.js:159`: Qualitäts-Hardgate für Tiefe, 22-m-Reichweite, Winkel und blockierte Mittellane.
- `dist/world-offensive-quality-v157.js:186`: vorherige Ballannahme-/Carry-Entscheidung, anschließend Pending-Turn.
- `dist/world-offensive-quality-v157.js:198`: Schusszweig benötigt Qualität größer 0, bevor die vorhandene Wahrscheinlichkeit zum Einsatz kommt.
- `dist/pitch-v55.js:468`: `v145ShotChance` berücksichtigt blockierte Mittellanen mit reduziertem Risiko statt vollständigem Verbot; Winkel und Reichweite unterscheiden sich vom Qualitätsfilter.
- `dist/match-shot-choice-v159.js:13`: bestehende Auswahl aus fünf Torsektoren.
- `dist/pitch-v55.js:388`: echter Abschluss mit eigenständigen defensiven Blocks, Ausführungsfehler, Torwartreichweite und tatsächlichem Flug.

Root besitzt die Entscheidung über weitere private Kandidaten und Produktion. Diese Diagnose autorisiert keine Parameteränderung. Vor einer Integration bleiben reale Kontakte, gespeicherte Fortsetzung, alte Spielstände, Halbzeit/Abpfiff und eine breitere Balance-Abnahme erforderlich.

## Evidence

- `work/diagnose-contested-shot-windows-v119.cjs`; SHA-256 `4dcb6f4e895bb25bf0cd636c8105a5877dc5971fc48ae390f1333384ce38a603`.
- `outputs/3d-quality/shot-volume-v119/contested-shot-windows.json`: tatsächliche Entscheidungen, Optionen und Sektoren; SHA-256 `e8c372026d11c2c0211d5f9d11fabaa82aa6a8545038161835f446cf243dd4f4`.
- `outputs/3d-quality/shot-volume-v119/contested-shot-window-summary.json`: kompakte Ableitung mit Quellhashes, Kontroll-Episoden, Gate-Aufteilung und Winkelbeispielen; SHA-256 `40a08806dcbc2815d26c1968f8b61e74b85560b8366048d9e2ad7d4a9f76280e`.

Nur ein Seed/Fixture je zwei Feldspieler-Konfigurationen wurde betrachtet. Die Aussage gilt für diesen Stock-Stand; sie ist keine allgemeine Balance- oder Stage6-Abnahme. Alle eigenen Browserkontexte und Serverprozesse wurden geschlossen.
