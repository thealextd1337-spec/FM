# Spielerintelligenz 183 nur für neue Spielstände

Stand: 16. Oktober 2026. Branch `feat/si-newworld` (Worktree `work/si-newworld`), abgezweigt von `integration/si-r133` = `c7d13feb`. Grundlage ist die Nutzerentscheidung vom 16. Oktober 2026 („Alte Spielstände sollen bei diesem gesamten Vorgehen nicht berücksichtigt werden“, Zeile „Torjäger, Sponsorziel und Altstände“ in den [Entscheidungen](entscheidungen.md)). Keine Veröffentlichung, keine Fußversion, kein Push.

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
| `v64GridDefaults` (`dist/world-match-v64.js`), Standardzellen der Linien mit vier und mehr Spielern (SI-5) | symmetrische Zellen, Zustandsfeld `state.siGrid`, gesetzt in `v64MakeState` und im Karrierenplan | bisherige Zellen (`v64GridCellsRelease132`), kein neues Zustandsfeld |
| `v66SponsorGoalTarget` (`dist/world-economy-v66.js`) | neues Torziel (unten) | `11 + startingSquad`, in der Zwölf-Länder-Welt mit 14/10 hochgerechnet |

Ohne eigene Weiche, weil sie nur an diesen Markern hängen: `v64Step` (Zweig `shotBalanceRevision===183`), `v183CompactBackground`, `record.teamStats`, die Unity-Darstellung (Bildmarke `siRevision`), `v157Pace`-Schalter, Uhrrate und alle `match-si-*-v183.js`. Nicht gebunden sind die Fehlerbehebungen B19/B21 (Wiederherstellung, Schlusspfiff-Belastung) und die Darstellungsfehler; sie sind keine SI-Regeln.

Prüfstände: `native183-scenes.cjs` und alle SI-Messungen legen Karrieren über `v61CreateCareer` beziehungsweise `v167CreateCareer` an und erhalten den Stempel von selbst. `constructed({stamp:false})` entfernt ihn für Vergleiche mit Release 132.

## Sponsorziel „mindestens N Tore“

Ausgangslage: Ein Verein spielt 14 Ligaspiele. Mit Kennung 178 erzielt ein Ligaverein im Mittel 10,1 Tore (7,5 bei Kaderstufe 1 bis 12,0 bei Stufe 5). Das alte Ziel `ceil((11 + startingSquad) × 1,4)` (17 bis 23) wurde in der Messung nur in **0,3 %** der Vereinssaisons erreicht (zwei Läufe, Standard- und Großfeld, über je drei Saisons: 576 Ligavereinssaisons). Es war schon bei dem alten Torniveau praktisch unerreichbar. Mit Kennung 183 steigt das Mittel auf 27,9 Tore und hängt stark von der Kaderstufe ab (11,8 / 14,6 / 20,6 / 37,2 / 47,2); das alte Ziel wäre für die Stufen 4 und 5 fast sicher und für die Stufen 1 und 2 schwer.

Neues Ziel für Welten mit Stempel: die Toranzahl, die ein Verein derselben Kaderstufe in rund jeder zweiten Saison erreicht (Zielquote 50 bis 60 %), gemessen mit `work/measure-sponsor-goals-v183.cjs` (Seeds `sp-a`, `sp-b`, beide Feldgrößen, 864 Vereinssaisons der neuen Welt) und ausgewertet mit `work/fit-sponsor-goals-v183.cjs`:

| Kaderstufe `startingSquad` | 1 | 2 | 3 | 4 | 5 |
| --- | ---: | ---: | ---: | ---: | ---: |
| altes Ziel (14 Spiele) | 17 | 19 | 20 | 21 | 23 |
| Trefferquote des alten Ziels bei Kennung 178 | 0,0 % | 0,0 % | 0,0 % | 1,8 % | 0,0 % |
| neues Ziel (14 Spiele) | 11 | 13 | 19 | 32 | 44 |
| Trefferquote des neuen Ziels bei Kennung 183 | 53,5 % | 56,2 % | 61,7 % | 56,1 % | 53,5 % |

Insgesamt erreichen 56,8 % der Vereinssaisons ihr Ziel. Seed `sp-a` allein (Anpassung) 55 bis 62 %, `sp-b` (zweiter Seed, nur teilweise gemessen) 36 bis 69 % je Stufe bei 33 bis 99 Vereinssaisons je Stufe; die Streuung kommt aus den kleinen Stufen 1 und 2. Die Tabelle gilt für 14 Spiele und wird für andere Ligagrößen mit `Spiele / 14` skaliert (Sechser-Liga der Schema-14-Welt: 10 Spiele). Das Bonusgeld (240) bleibt. Texte bleiben deutsch („Liga: mindestens N Tore“); `v66SponsorGoalLabel` und die englische Übersetzung nehmen jede Zahl.

**Die Ziele der Stufen 1 und 2 liegen unter den alten Zahlen.** Der Grund ist der Messbefund (altes Ziel schon vorher nicht erreichbar, Vereine der Stufen 1 und 2 erzielen auch jetzt nur 12 bis 15 Tore). Soll das Ziel nie unter den alten Wert fallen, genügt `Math.max(11 + squad …)` in `v66SponsorGoalTarget`; die Trefferquote der Stufen 1 und 2 sinkt dann auf rund 15 bis 25 %.

**Pokalziel unverändert (4 reguläre Tore, nur Vereine ohne Liga).** Diese Vereine spielen im Mittel 1,3 Pokalspiele, 75 % scheiden im ersten Spiel aus und erzielen dort 0,15 Tore. Das Ziel wurde mit Kennung 178 in 1,2 % der Fälle erreicht, mit 183 in 0,3 % bis 1 % (384 beziehungsweise 576 Vereinssaisons). Eine Anhebung würde es endgültig unerreichbar machen und das höhere Torniveau erreicht diese schwachen Vereine nicht. Es betrifft nur KI-Vereine, weil die Nutzerin oder der Nutzer immer einen Ligaverein führt.

Messwerte und Tabellen: `outputs/sponsor-goals-v183/` (Rohdaten je Verein und Saison, `table-old-vs-new.txt`, `fit-table.txt`).

## Prüfungen

- `node work/test-si-newworld-v183.cjs` (im Workflow-Block „Spieltests ausführen“): Stempel aller Anlagewege, Validierung, JSON-Hin-und-zurück, Speichern/Export/Import ohne Stempel für Altstände, Saisontage; kompakte Partie (Kennung, Parametersatz, volle Partie gleich dem eingefrorenen Controller von Release 132, Torniveau); Standardzellen; Sponsorziel beider Welten und späterer Saisons; ausgespielte Partie (Marker, Überschreibungen, 900 Ticks gleich der Partie ohne Marker, Snapshot).
- Einmalig gegen die Release-132-Quelle (`git archive e4e531c0`): `node work/check-old-matches-v183.cjs` (Details im Changelog).

## Risiken und offene Punkte

- Eine bestehende Welt, die in der Aktualisierung weiterläuft, bekommt nie SI 183. Wer 183 will, legt eine neue Welt an (kein Weg, den Stempel nachträglich zu setzen).
- Importierte Dateien einer neuen Welt tragen den Stempel mit; Dateien mit anderem Wert werden als beschädigt abgelehnt.
- Die Sponsorzielzahlen für die Stufen 1 und 2 (siehe oben) sind eine Entscheidung für die Abnahme.
- Der Zweig `feat/si-scorer` ändert Abstimmungswerte in den `match-si-*-v183.js`. Die Weichen dieses Branches liegen außerhalb dieser Dateien und kollidieren nicht.
