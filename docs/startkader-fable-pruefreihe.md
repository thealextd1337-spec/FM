# Fables Prüfvorschläge: native Messreihe

Nutzerauftrag vom 12. Oktober 2026: Vorschläge aus der ersten Fable-Auswertung testen und anschließend erneut von Fable analysieren lassen. 1.200 zusätzliche native kompakte Spiele auf unveränderten Produktquellen und Startkadern. Kein Build oder Veröffentlichung nötig; keine Produktregeln verändert.

## Ergebnis

| Prüfreihe | Spiele | Tore/Spiel | Schüsse/Spiel | Remis | 0:0 | A-S/U/B-S | Tore A:B |
|---|---:|---:|---:|---:|---:|---:|---:|
| Top gegen Top | 100 | 1,35 | 13,59 | 42,0 % | 26,0 % | 22/42/36 | 60:75 |
| Schwache Liga gegen schwache Liga | 100 | 1,03 | 11,58 | 59,0 % | 44,0 % | 16/59/25 | 46:57 |
| Schwache Liga gegen stärkste Pokalvereine | 500 | 1,04 | 11,68 | 46,0 % | 36,4 % | 185/230/85 | 336:184 |
| Große Ligen Rang 3–4 gegen AUT/SUI/TUR Top 2 | 300 | 1,16 | 12,33 | 44,3 % | 31,7 % | 73/133/94 | 156:191 |
| Top gegen schwache Liga · Heimspiegel | 100 | 1,20 | 12,60 | 41,0 % | 31,0 % | 49/41/10 | 88:32 |

Zusätzlich 100 neutrale Kontrollspiele: 100/100 identische Ergebnisse und 100/100 identische erfasste Spielverläufe samt Statistiken im jeweiligen Heim-/Neutralpaar.

## Heimbonus: Codebefund

In `dist/world-match-v64.js`, `v64Step`, enthält die berechnete `chance` Stärkeunterschied, Linien-/Risikoeffekt und Heimbonus. Nur der alte Zweig ohne `state.playerPerformance` verwendet diese Chance. Neue Welten rufen `v155CompactActions` ohne sie auf. Dort erfolgen Schussentstehung, Zielgenauigkeit und Verwertung eigenständig ohne Heim-/Neutralbezug. Der kontrollierte Neutralvergleich bestätigt diesen Befund. Kein allgemeiner Fehlernachweis für die physische Engine.

Die Gruppenverwertung allein kann Abschlussqualität und gegnerische Torwartstärke nicht kausal auseinanderhalten. Dafür wäre ein eigener isolierter Attributvergleich nötig. Die bereits gemessenen 500 Top-gegen-Unten-Spiele ergeben 14,3 % gegenüber 5,2 % Tore pro Schuss.

## Auswahl und Reproduktion

Gruppen nach mittlerer anfänglicher Kaderqualität über 30 Welten, keine Rangprozente als Leistungsmaß. Je 100 Top–Top/Schwach–Schwach-Spiele: zehn Paarungen pro Welt mit beiden Orientierungen, Auswahlzyklus umfasst alle 45 Paare. Liga–Pokal: letzte zehn Ligavereine gegen stärkste zehn Pokalvereine, 100 Paare fünfmal. Überschneidung: fünf A-Ligen Rang 3/4 gegen AUT/SUI/TUR Rang 1/2, 60 Paare fünfmal. Je Verein ausgeglichenes Heimrecht in den Kreuzserien.

Heimtest: zehn gemischte Paarungen pro Welt in beiden Orientierungen, 100 Spiele. Je eine neutrale Kontrollkopie mit unverändertem Seed, Fixture-ID, Seiten, Spielern und Zufallsstrom; einzige Änderung `fixture.neutral`. Kontrollen sind kein zweiter Satz unabhängiger Spiele für eine Signifikanzrechnung.

Volle eigene JSON-Kopie je Spiel, unveränderte 100-Prozent-Anfangsfrische, native KI-Aufstellungen/Taktikwechsel/Wechsel und Belastung aktiv. Keine vorherigen Einsätze, Transfers oder Entwicklung. 1.200 Abpfiffe und fünf zusätzliche exakte Replays bestanden, native Tor-/Schussbuchhaltung und unveränderte Quellen/Startstände geprüft. Fünf Startwelten sind eine Stichprobe; keine behauptete physische 3D-Parität oder Realfußball-Zielquote.

`node work/measure-strength-followup.cjs`, danach `node work/render-strength-followup.cjs` im Produktionscheckout. Bei geänderten Produktquellen zuerst Startkader- und 500-Spiele-Messung erneuern; Hashprüfung verhindert das Vermischen von Quellständen.

[Gesamtnachweis](../outputs/strength-followup/results.json), [alle Einzelspiele](../outputs/strength-followup/einzelspiele.csv), [Ansicht](../outputs/strength-followup/report.html). Die zweite Fable-Auswertung wird separat gespeichert; Änderungsvorschläge sind noch nicht umgesetzt.
