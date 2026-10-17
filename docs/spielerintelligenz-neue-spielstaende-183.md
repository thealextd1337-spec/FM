# Spielerintelligenz 183 nur für neue Spielstände

Stand: 16. Oktober 2026, Sponsorziel neu gemessen am 17. Oktober 2026 (Branch `feat/si-compact2`). Branch `feat/si-newworld` (Worktree `work/si-newworld`), abgezweigt von `integration/si-r133` = `c7d13feb`. Grundlage ist die Nutzerentscheidung vom 16. Oktober 2026 („Alte Spielstände sollen bei diesem gesamten Vorgehen nicht berücksichtigt werden“, Zeile „Torjäger, Sponsorziel und Altstände“ in den [Entscheidungen](entscheidungen.md)). Keine Veröffentlichung, keine Fußversion, kein Push.

## Regel

Alles, was die Spielerintelligenz-Umstellung (Kennung 183) ändert, gilt nur für Vereinswelten, die nach dieser Änderung angelegt werden. Eine bestehende Vereinswelt (Release 132 oder älter) behält vollständig das bisherige Verhalten, auch für Partien, die nach der Aktualisierung neu entstehen:

- ausgespielte Partie ohne `match.si` (Regeln 182, alte Uhr, alte Entscheidungen),
- kompakte Partie mit Kennung 178 (v178-Parameter),
- bisherige Standardzellen der Linien mit vier und mehr Spielern,
- bisheriges Sponsorziel „mindestens N Tore“.

Gespeicherte Partien behalten ihre Kennung wie bisher. Es gibt keine Migration und keine Umrechnung.

## Das Stempelfeld

`world.siRevision` (Wert 183) markiert eine neue Welt.

| Stelle | Aufgabe |
| --- | --- |
| `v61CreateCareer` (`dist/world-foundation-v61.js`) | Schreibt das Feld als einzige Stelle beim Anlegen. Alle Neuanlagen laufen hier durch: `v161CreateCareer` (Expansion), `v164`/`v165`/`v166` (Vorbereitungsstufen), `v167CreateCareer` (Startablauf `v172`) und der ursprüngliche Startablauf von `v61`. |
| `v61ValidateCareer` | Erlaubt das Feld nur fehlend oder mit Wert 183. Prüft nur, schreibt nie. |
| Laden, Speichern, Import, Export, Saisonwechsel | Reichen das Feld unverändert durch (reines JSON-Objekt). Sie fügen es nie hinzu. |
| `v183WorldSi(career)` (`dist/world-match-v64.js`) | Einziger Lesezugriff. Ohne Feld, ohne Karriere oder mit anderem Wert ergibt er `false`. |

Fehlt die Funktion (Testkontexte ohne `world-match-v64.js`), gilt der Altpfad. Sicherer Standard: nichts erreichbar bedeutet altes Verhalten.

## Entscheidungspunkte

Alle Orte, an denen für eine neue Partie Kennung 183 gewählt wurde, hängen jetzt am Stempel.

| Ort | Neue Welt | Bestehende Welt |
| --- | --- | --- |
| `v65CreateMatch` (`dist/world-physical-v65.js`), schreibt als einzige Stelle `match.si` | `match.si` Kennung 183 mit Paketen, Uhr 0,385 und Parametersatz | kein `match.si`. Alle SI-Pfade (`m.si`-Zweige in Uhr, Entscheidungen, Standardsituationen, Torwart, Laufwege, Foul, Unity-Bildmarke `siRevision`) bleiben aus. Ein ausdrückliches `options.si` (nur Prüfstände) gilt weiter |
| `v155Initialize` (`dist/world-player-performance-v155.js`), kompakte Partie | `shotBalanceRevision` 183, Parametersatz je Feldgröße, `compactStats`, Hintergrundbelastung | `shotBalanceRevision` 178 mit Kopie von `v178CompactBalance`, exakt wie Release 132 |
| `v64GridDefaults` (`dist/world-match-v64.js`), Standardzellen der Linien mit vier und mehr Spielern (SI-5) | symmetrische Zellen, Zustandsfeld `state.siGrid`, gesetzt in `v64MakeState`, im Karrierenplan (`v64CareerPlanDefault`) und im Matchplan-Editor (`v64CareerPlanContext`) | bisherige Zellen (`v64GridCellsRelease132`), kein neues Zustandsfeld |
| `v66SponsorGoalTarget` (`dist/world-economy-v66.js`) | neues Torziel (unten) | `11 + startingSquad`, in der Zwölf-Länder-Welt mit 14/10 hochgerechnet |

Ohne eigene Weiche, weil sie nur an diesen Markern hängen: `v64Step` (Zweig `shotBalanceRevision===183`), `v183CompactBackground`, `record.teamStats`, die Unity-Darstellung (Bildmarke `siRevision`), `v157Pace`-Schalter, Uhrrate und alle `match-si-*-v183.js`. Nicht gebunden sind die Fehlerbehebungen B19/B21 (Wiederherstellung, Schlusspfiff-Belastung) und die Darstellungsfehler; sie sind keine SI-Regeln.

Prüfstände: `native183-scenes.cjs` und alle SI-Messungen legen Karrieren über `v61CreateCareer` beziehungsweise `v167CreateCareer` an und erhalten den Stempel von selbst. `constructed({stamp:false})` entfernt ihn für Vergleiche mit Release 132.

## Sponsorziel „mindestens N Tore“

Ausgangslage: Ein Verein spielt 14 Ligaspiele. Mit Kennung 178 erzielt ein Ligaverein im Mittel 10,1 Tore (7,5 bei Kaderstufe 1 bis 12,0 bei Stufe 5). Das alte Ziel `ceil((11 + startingSquad) × 1,4)` (17 bis 23) wurde in der Messung nur in **0,3 %** der Vereinssaisons erreicht (zwei Läufe, Standard- und Großfeld, über je drei Saisons: 576 Ligavereinssaisons). Es war schon bei dem alten Torniveau praktisch unerreichbar. Mit Kennung 183 steigt das Mittel auf rund 26 Tore und hängt stark von der Kaderstufe ab (Standardfeld nach der Neuanpassung der Kompaktsimulation: 12,2 / 14,8 / 21,1 / 34,2 / 44,3 Tore je Saison für die Stufen 1 bis 5); das alte Ziel wäre für die Stufen 4 und 5 fast sicher (92 % und 96 %) und für die Stufen 1 und 2 schwer (13 % und 22 %).

**Zielvorgabe (Nutzerentscheidung 17. Oktober 2026, [Entscheidungen](entscheidungen.md)):** Ein Verein seiner Kaderstufe soll das Ziel in rund 35–40 % der Saisons erreichen („schaffbar, aber nicht selbstverständlich“, die Wirtschaft bleibt knapp). Gemessen wird auf dem **Standardfeld**, weil neue Vereinswelten immer das Standardfeld verwenden (Nutzerentscheidung 12. Oktober 2026); das große Feld ist mitgemessen.

Neues Ziel für Welten mit Stempel (`v66SponsorGoals183` in `dist/world-economy-v66.js:136`, ausgewertet mit `work/fit-sponsor-goals-v183.cjs`, Rohdaten `work/measure-sponsor-goals-v183.cjs`, Kompaktsimulation nach der Neuanpassung an `sb2-f`, Abschnitt „Neuanpassung an sb2-f“ in [SI-6 kompakt](spielerintelligenz-si6-kompakt-183.md)):

| Kaderstufe `startingSquad` | 1 | 2 | 3 | 4 | 5 |
| --- | ---: | ---: | ---: | ---: | ---: |
| altes Ziel (Release 132, 14 Spiele) | 17 | 19 | 20 | 21 | 23 |
| Trefferquote des alten Ziels bei Kennung 178 (Altwelt) | 0,0 % | 0,0 % | 0,0 % | 1,8 % | 0,0 % |
| Tabelle vom 16. Oktober (11 / 13 / 19 / 32 / 44), Trefferquote Standardfeld bei Kennung 183 neu | 60,2 % | 61,1 % | 63,7 % | 44,4 % | 46,1 % |
| **neues Ziel (14 Spiele)** | **13** | **16** | **23** | **34** | **48** |
| Trefferquote Standardfeld (7 Seeds, 2.016 Vereinssaisons: 231 / 357 / 567 / 399 / 462) | 38,5 % | 38,4 % | 35,6 % | 36,8 % | 37,4 % |
| Trefferquote großes Feld (3 Seeds, 864 Vereinssaisons) | 23,2 % | 27,5 % | 23,9 % | 35,1 % | 36,9 % |
| Trefferquote beide Felder zusammen | 33,9 % | 35,1 % | 32,1 % | 36,3 % | 37,3 % |

Standardfeld insgesamt 37,1 % der Vereinssaisons, beide Felder 34,9 % (2.880). Die Tabelle gilt für 14 Spiele und wird für andere Ligagrößen mit `Spiele / 14` skaliert (Sechser-Liga der Schema-14-Welt: 10 Spiele). Das Bonusgeld (240) bleibt. Texte bleiben deutsch („Liga: mindestens N Tore“); `v66SponsorGoalLabel` und die englische Übersetzung nehmen jede Zahl.

**Messung:** Je Seed eine vollständige neue Vereinswelt (12 Länder, 96 Ligavereine, 3 Saisons, Manager spielt nicht aus, alles kompakt mit Kennung 183). `sp-a` und `sp-b` wurden auf beiden Feldgrößen vollständig gemessen (beim ersten Lauf war `sp-b` unvollständig), dazu `sp-c` auf beiden Feldern und `sp-d` bis `sp-g` auf dem Standardfeld, um die kleinen Stufen 1 und 2 abzusichern. Streuung einzelner Seeds auf dem Standardfeld: Stufe 1 24–48 %, Stufe 2 24–55 %, Stufe 3 25–41 %, Stufe 4 26–44 %, Stufe 5 29–42 % bei 33 bis 99 Vereinssaisons je Seed und Stufe; die Zielvorgabe gilt für den Mittelwert über alle Seeds (Standardfehler 2–3 Punkte). `sp-a` und `sp-b` allein: Standardfeld 42 / 41 / 37 / 37 / 38 % und 24 / 28 / 37 / 35 / 36 %, großes Feld 33 / 39 / 25 / 33 / 35 % und 15 / 16 / 24 / 37 / 35 %.

**Warum die Zahlen gegenüber dem 16. Oktober steigen und fallen:** Die Tabelle vom 16. Oktober (11 / 13 / 19 / 32 / 44) war auf 50–60 % Trefferquote gerichtet, gemessen mit dem damaligen Kompaktstand (rund 4,0 Tore je Partie in Welten mit starken Spitzen). Die Nutzerentscheidung vom 17. Oktober verlangt 35–40 %; die Neuanpassung der Kompaktsimulation an das ausgespielte Spiel der Endstufe (3,46 statt 3,86 Tore je Partie, `finSelf` 1) senkt die Toranzahl der Vereine um rund 5 %. Beides zusammen ergibt die Tabelle 13 / 16 / 23 / 34 / 48. Die Ziele der Stufen 1 und 2 liegen weiter unter den alten Zahlen (17 und 19), weil die alten Zahlen nie erreicht wurden und kleine Vereine auch jetzt nur 12 bis 15 Tore erzielen. Soll das Ziel nie unter den alten Wert fallen, genügt `Math.max(11 + squad …)` in `v66SponsorGoalTarget`; die Trefferquote der Stufen 1 und 2 sinkt dann auf rund 13 bis 22 %.

**Pokalziel unverändert (4 reguläre Tore, nur Vereine ohne Liga).** Diese Vereine spielen im Mittel 1,3 Pokalspiele, 75 % scheiden im ersten Spiel aus und erzielen dort 0,15 Tore. Das Ziel wurde mit Kennung 178 in 1,2 % der Fälle erreicht, mit 183 in 0,3 % bis 1 %. Eine Anhebung würde es endgültig unerreichbar machen und das höhere Torniveau erreicht diese schwachen Vereine nicht. Es betrifft nur KI-Vereine, weil die Nutzerin oder der Nutzer immer einen Ligaverein führt.

Messwerte und Tabellen: `outputs/sponsor-goals-v183/` (Rohdaten je Verein und Saison, `table-old-vs-new.txt` mit den Altwelt-Läufen des 16. Oktober, `fit-table.txt`).

## Prüfungen

- `node work/test-si-newworld-v183.cjs` (im Workflow-Block „Spieltests ausführen“): Stempel aller Anlagewege, Validierung, JSON-Hin-und-zurück, Speichern/Export/Import ohne Stempel für Altstände, Saisontage; kompakte Partie (Kennung, Parametersatz, volle Partie gleich dem eingefrorenen Controller von Release 132, Torniveau); Standardzellen; Sponsorziel beider Welten und späterer Saisons; ausgespielte Partie (Marker, Überschreibungen, 900 Ticks gleich der Partie ohne Marker, Snapshot).
- Einmalig gegen die Release-132-Quelle (`git archive e4e531c0`): `node work/check-old-matches-v183.cjs` (Details im Changelog).

## Risiken und offene Punkte

- Eine bestehende Welt, die in der Aktualisierung weiterläuft, bekommt nie SI 183. Wer 183 will, legt eine neue Welt an (kein Weg, den Stempel nachträglich zu setzen).
- Importierte Dateien einer neuen Welt tragen den Stempel mit; Dateien mit anderem Wert werden als beschädigt abgelehnt.
- Die Sponsorzielzahlen für die Stufen 1 und 2 (siehe oben) sind eine Entscheidung für die Abnahme. Auf dem großen Feld (nur für Prüfstände und alte Konfigurationen, neue Welten verwenden das Standardfeld) liegen die Trefferquoten der Stufen 1 bis 3 bei 23–28 %, weil dort weniger Tore fallen.
- Die Tabelle gilt für die Kompaktsimulation dieses Stands. Ändert sich die Torzahl der Kompaktpartie (neue Neuanpassung), muss `work/measure-sponsor-goals-v183.cjs` neu laufen; die Trefferquote ändert sich um rund 1–1,5 Punkte je 1 % Torzahl.
- Der Zweig `feat/si-scorer` ändert Abstimmungswerte in den `match-si-*-v183.js`. Die Weichen dieses Branches liegen außerhalb dieser Dateien und kollidieren nicht.
