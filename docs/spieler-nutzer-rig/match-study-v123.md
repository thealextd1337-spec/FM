# 90 Partien nach dem Bodenspielblock v123

4. Oktober 2026. **Alle sieben bisherigen Kriterien für einen deutlichen Werteeinfluss sind erneut bestanden.** Das unveränderte gute Team A gewinnt gegen den schwachen Gegner 28/30 statt 8/30 gegen den gleich starken Gegner: +66,7 Prozentpunkte. Die Bilanz beträgt 77:7 Tore. Taktiken, Startfrische, Form, Alter, Seedfolge und Heimverteilung sind identisch; nur die Fähigkeiten des Gegners sinken gemeinsam. Nicht veröffentlicht, keine Nutzerkarriere verändert.

## Ergebnisse

| Paarung | Siege A | Remis | Siege B | Tore A:B | Tore/Partie |
| --- | --- | --- | --- | --- | --- |
| Gut gegen gut | 8 | 10 | 12 | 26:27 | 1,77 |
| Gut gegen schwach | 28 | 2 | 0 | 77:7 | 2,80 |
| Schwach gegen schwach | 7 | 14 | 9 | 8:10 | 0,60 |

| Bisheriges Kriterium | Mindestwert | Gemessen | Ergebnis |
| --- | --- | --- | --- |
| Siege des stärkeren Teams | 80,00 % | 93,33 % | bestanden |
| Untere Wilson-95%-Grenze der Siegquote | 75,00 % | 78,68 % | bestanden |
| Siegquotenanstieg bei unverändertem Team A gegenüber gut/gut | 30,00 Prozentpunkte | 66,67 Prozentpunkte | bestanden |
| Mittlerer Torvorsprung des stärkeren Teams | 1,00 Tore/Partie | 2,33 Tore/Partie | bestanden |
| Passquotenvorsprung | 10,00 Prozentpunkte | 18,10 Prozentpunkte | bestanden |
| Zweikampfquotenvorsprung | 20,00 Prozentpunkte | 62,65 Prozentpunkte | bestanden |
| Verhältnis registrierter Zielschüsse stark/schwach | 2,00 Faktor | 17,30 Faktor | bestanden |

Die Schwellen stammen aus der früheren v115-Abnahme und wurden für diesen Lauf nicht verändert. Sie wurden ursprünglich nach einer explorativen Reihe festgelegt. Die Wilson-Grenze beschreibt die Unsicherheit der Siegquote in dieser kontrollierten Stichprobe; sie garantiert keine Karriere-Siegchance. Gute Teams erreichen gegen schwache weiter sehr hohe Dominanz. Schwach/schwach liefert nur 0,60 Tore pro Partie: eine offene Balancefrage, kein Anlass, die Werte für diese Reihe automatisch nachzujustieren. Kleinere Abstände und einzelne Fähigkeiten wurden hier nicht erneut untersucht; ältere v118/v119-Berichte beziehen sich auf ihren damaligen Engine-Stand.

## Spielstatistik

| Paarung | Schüsse A:B | Zielschüsse A:B | Passquote A:B | Zweikampfquote A:B | Paraden A:B | Abpraller A:B | Abseits A:B |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Gut gegen gut | 146:159 | 78:104 | 79,71 % / 77,95 % | 46,28 % / 49,40 % | 77:52 | 35:26 | 5:3 |
| Gut gegen schwach | 237:53 | 173:10 | 85,89 % / 67,79 % | 78,99 % / 16,34 % | 8:99 | 4:61 | 5:3 |
| Schwach gegen schwach | 104:90 | 38:29 | 63,26 % / 66,87 % | 48,51 % / 46,53 % | 25:35 | 12:18 | 10:7 |

Alle übrigen Mannschaftszähler, Einzelresultate und Outcomes: [CSV](match-study-v123.csv), [Rohdaten mit Profilen und Torverläufen](match-study-v123.json), [Aggregat](match-study-summary-v123.json), [Kriterien](player-value-impact-qa-v123.json). Zwei Eigentore sind im Spielstand enthalten, keinem Schützen gutgeschrieben. Die erste Fortsetzung stoppte an der alten Testannahme „Schützentore = Spielstand“; nach Prüfung des Ereignisverlaufs berücksichtigt der Test Eigentore wie bereits v118. Kein Enginewechsel, kein verworfenes Ergebnis. [Native Eigentorkette](match-study-own-goal-v123.json).

Für sämtliche 90 Partien stimmen Schützen plus zugeteilte Eigentore mit dem Score; außerdem gelten faced = saves + shotConceded, saves = caught + parried, conceded = shotConceded + nonShotConceded und faced = gegnerische onTarget. Diese Definitionen unterscheiden Schusstor, Pass-/Flankentor und freien Abpraller. Beide Halbzeiten, Ergebnisbuchung, beobachtete Schusszähler und null Browserfehler geprüft.

## Methode und Reproduktion

Je Gruppe 30 vollständige native physische Vereinswelt-Ligapartien, 15 Heim-/15 Auswärtsspiele für A, dieselben Seeds `20261004 + i * 104729`. Frische Kopie einer isolierten Karriere je Partie; kein Nutzer-Spielstand. 20 Physikschritte/s, unverändertes MATCH_SPEED 0,78, reguläre Halbzeit und Buchung, Renderer aus. Keine zusätzliche Grafik-Zufallsziehung. Formation 2–2–1, ausgeglichenes Pressing, variables Passspiel, neutrale Abwehrlinie, normale Aggression, identische Rollen/Anweisungen; adaptive Trainer und Wechsel ausgeschaltet. Alter 25, Form neutral, Startfrische 100; Ermüdung während des Matches aktiv. Technische Testprofile: Basis 16 bzw. 6 auf allen neun Fähigkeiten, identische rollenbezogene Zuschläge gemäß Rohdaten. Exakte Werte erscheinen weiterhin nicht in Spieleransichten.

Offline-Build: `outputs\Doppel-6-Fussballmanager.html`, SHA-256 `977163d289cc6707ec6342048e10f396fc35a81fd5ec94b9b4932e33fca72522`. [Quell-/Build-/Prüfverifikation](verification-v123.json), [gesamte Änderungen](changes-v123.md).

`node work/study-ground-matches-v123.cjs` startet die Reihe; `--resume` akzeptiert nur denselben Build. `node work/report-ground-matches-v123.cjs` prüft Bilanzen/Kriterien und erzeugt Bericht/CSV erneut. Beide schreiben ausschließlich diese v123-Studienartefakte. Statistikreihe ohne GPU ist kein Bildraten- oder Animationsnachweis; dafür liegen separate native Bewegungs- und vollständige Matchprüfungen vor.
