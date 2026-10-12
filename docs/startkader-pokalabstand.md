# Mindestabstand der Pokalvereine beim Start

Aktueller Veröffentlichungsstand: Die beschriebenen Regeln sind als [Release 129 veröffentlicht und live abgenommen](release-129.md). Die folgenden lokalen Mess-/Prüfberichte dokumentieren den vorausgehenden Nachweis.

Nutzerpräzisierung vom 12. Oktober 2026, lokal umgesetzt und gebaut: Jeder reine Pokalverein liegt bei Kaderqualität und bester zulässiger Startelf mindestens zehn Prozent unter jedem Ligaverein. Es zählt die interne gemittelte Positionsqualität; die lineare Prozent-Rangliste beschreibt ausschließlich den Rang. Die Regel gilt beim Anlegen und garantiert keine Spielergebnisse.

Neue Expansionswelten erhalten Erzeugungskennung 3. Pokal-Budgets werden proportional abgesenkt; ein konservativer persönlicher Qualitätsdeckel mit Reserve für Stamm-/Ersatzspieler sichert auch die Startelfgrenze. Vorhandene Reihenfolge, Alters-/Positionsmix und kleine gespeicherte Startvariation bleiben erhalten. Keine anfänglichen Pokal-Elites. Ligakader werden identisch zu Kennung 2 erzeugt. Die Konstruktion prüft die tatsächlichen Kader und optimalen Startelfzuordnungen gegen den jeweils schwächsten Ligaverein.

Kennungen 1 und 2 bleiben unverändert gültig; Laden berechnet keine Werte neu und ergänzt keine Kennung. Transfer-, Jugend- und Ersatzpfade erkennen Kennung 3 als dieselbe Startkaderfamilie. Spätere Entwicklung und Transfers können den Startabstand ändern.

## Nachweise

- 60 weitere Stresswelten bestehen Kader-/Startelfgrenzen, Budget, Variation, Alters-/Positionsmix, Transfer- und Ersatzpfade. Kennung-2-Welten bleiben gültig; gleiche Seeds erzeugen identische Ligakader in Kennung 2 und 3. Ein gezielt zu starker Pokalkader wird zurückgewiesen. [Stressbeleg](../outputs/start-rosters-v177/checks.json).
- 30 erneuerte Messwelten: 276.480 Liga-/Pokalpaarungen je Qualitätsmaß bestehen. Kleinster Abstand **26,38 % im Kader**, **23,38 % in der besten Startelf**. Der konservative Puffer erzeugt größere Abstände als das verlangte Minimum. Alle 31.680 Pokalspieler der Stichprobe liegen in der Farbstufe „Sehr schwach“, ohne Elite. Liga-Elite-Anteil unverändert 2,53 %. [Pokalvergleich](../outputs/cup-start-gap/checks.json).
- Lokaler Start/Export, gemischte Speicherung, Messmethoden, v55-Vollpartie und aktueller Einzeldatei-Build bestanden. Vollständige physische native 2D-Browserpartie in Quelle und Build: identischer Abpfiff bei 1:1, Minute 101; gültige verbuchte Welt, identische Ereignis-/Statistik-/Entwicklungs-/Finanzhashes. [Browserbeleg](../outputs/cup-start-gap/browser-checks.json). Noch nicht veröffentlicht.

## Reproduktion

Im Produktionscheckout:

```powershell
node work/test-start-rosters-v177.cjs --worlds=60
node work/measure-start-roster-strength.cjs --worlds=30
node work/measure-league-strength-shape.cjs --check-hierarchy
node work/render-start-roster-strength.cjs
node work/render-league-strength-shape.cjs
node outputs/club-relative-strength/build-list.cjs
node work/measure-top-bottom-matches.cjs
node work/render-top-bottom-matches.cjs
node work/test-world-expansion-v161.cjs
node work/test-world-local-start.cjs
node work/test-v55.cjs
node work/build.cjs
```

Die aktualisierte [Vereinsliste](../outputs/club-relative-strength/vereinsstaerken.csv) führt alle 96 Ligavereine vor den 96 reinen Pokalvereinen. Der [500-Spiele-Vergleich](startkader-matchvergleich-20261012.md) verwendet ausschließlich Ligavereine und die native kompakte Weltpartien-Engine.
