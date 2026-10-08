# Schuss- und Torwartbilanz v117

Stand: 04.10.2026. Lokal im regulären Spiel integriert, Oberfläche weiterhin **PROTOTYP 105**. Keine Veröffentlichung und keine neuen Meshy-Credits. Dieser Schritt schließt die Statistikbefunde der [ursprünglichen 90-Partien-Studie](match-study-v115.md); kleinere Werteabstände und einzelne Fähigkeiten sind noch nicht untersucht.

## Ursachen und Korrektur

Die fünf ursprünglichen Abweichungen wurden vor der Änderung mit denselben Seeds reproduziert. Alle Ergebnisse, damaligen Statistikzähler und Zufallsziehungen waren identisch. Das zusätzliche Flug-/Abpfiffprotokoll steht in [accounting-baseline-v117.json](accounting-baseline-v117.json).

| Paarung / Partie | Ursache | Neue Erfassung |
| --- | --- | --- |
| Gut/gut 24 | Zielschuss im letzten Schritt gestartet, beim Abpfiff mit Flugfortschritt 0 entfernt | Versuch bleibt; unterbrochen, Zielschuss-/Keeperbuchung zurückgenommen |
| Gut/schwach 27 | Flanke landet frei und rollt über die Torlinie | Tor aus anderer Ballbahn, Herkunft Flanke → freier Ball → Tor |
| Schwach/schwach 8 | Flanke fliegt direkt ins Tor | Tor aus Flanke |
| Schwach/schwach 9 | Freier Ball nach Flanke rollt ins Tor | Herkunft Flanke → freier Ball → Tor |
| Schwach/schwach 25 | Pass überschreitet die Torlinie | Tor aus Pass |

Es wurden keine zusätzlichen Schüsse für die vier Pass-/Flankentore erfunden. Die gültigen Torquerungen bleiben erhalten. In der gesamten Wiederholung wurde außerdem ein beim Abpfiff unterbrochener Fehlschuss in gut/schwach 3 gefunden; dieser hatte die Zielschussbilanz nicht verfälscht.

## Neue Statistikdefinitionen

`shots` zählt ausgeführte Schussversuche, einschließlich beim Pfiff unterbrochener Flüge. `shotsInterrupted` kennzeichnet diese Versuche gesondert. Ein nicht abgeschlossener Versuch wird nicht als Zielschuss oder konfrontierter Torwart gezählt. Die Buchung beim Abschuss bleibt für die Animationsmetadaten bestehen und wird bei Unterbrechung vor Bericht und Leistungsbewertung zurückgenommen.

`shotGoals` / `shotConceded` zählen Tore unmittelbar aus einem noch offenen absichtlichen Schuss. `nonShotGoals` / `nonShotConceded` erfassen andere Torwege, etwa Pass, Flanke, weiterrollenden Abpraller und Eigentor. Eine bereits abgewehrte Schussaktion bleibt eine Parade; ein späteres Tor aus ihrem freien Abpraller wird als eigener Ballweg erfasst. Ein absichtlicher Nachschuss erhält dagegen einen neuen Schusseintrag. Eigentore werden keinem Angreifer als persönliches Tor gutgeschrieben.

`savesCaught` und `savesParried` unterscheiden festgehaltene Bälle und Abwehren mit anschließendem Abpraller. Für jede abgeschlossene neue Partie gelten:

```text
faced = saves + shotConceded
conceded = shotConceded + nonShotConceded
saves = savesCaught + savesParried
faced = gegnerische onTarget
```

Elfmeter während der Partie folgen denselben Regeln. Das separate Elfmeterschießen bleibt getrennt. Eine unerwartete echte Torquerung eines Schusses erhält eine Zielschussbuchung, sofern diese nicht bereits beim Abschuss erfolgt ist.

## Ereignisprotokoll und Speicherung

[match-ball-events-v117.js](../../dist/match-ball-events-v117.js) beobachtet die vorhandenen Ballfunktionen. Jeder Flug erhält eine fortlaufende Kennung, Vorgänger, Art, Spieler-/Teamkennung, Startzeit, Positionen und Ergebnis. Schüsse markieren Zielprognose und Torhüter; Tore und freie Bälle verweisen auf ihre Herkunft. Damit sind Fangparade, Abpraller, Nachschuss und Tor entlang einer konkreten Ereigniskette nachvollziehbar.

Das reine Datenprotokoll `match.ballAccounting` wird nur beim Anlegen einer **neuen physischen Vereinswelt-Partie** begonnen. Freie Bälle behalten ihre Herkunft auch über Speichern/Laden. Bericht und Matchdatensatz übernehmen unabhängige Kopien. Alte gespeicherte Partien erhalten keine Rekonstruktion und keine rückwirkenden Werte. Hintergrundsimulationen erhalten kein solches physisches Protokoll. Die bestehende Saisonarchivierung entfernt detaillierte Matchdatensätze weiterhin; das Protokoll ist kein dauerhaftes Karrierearchiv.

Die Integration liegt in `dist/index.html`, `work/build.cjs`, `work/server.cjs` und der Berichtskopie in `world-match-v64.js`. Flugwege, Aktionswahrscheinlichkeiten und Zufallsverbrauch wurden nicht geändert. Korrigierte Abschlussstatistiken können die anschließende Leistungsbewertung eines betroffenen Spielers verändern.

## Abnahme

Die **90 vollständigen Partien** mit denselben Mannschaften, Taktiken und Seeds reproduzieren alle ursprünglichen Spielstände, Schrittzahlen und Zufallsziehungen. Alle neuen Torwartidentitäten stimmen, jeder Schuss ist abgeschlossen oder unterbrochen, jedes Tor verknüpft, Bericht und gebuchter Matchdatensatz stimmen mit dem Live-Protokoll überein. Rohdaten: [JSON mit Ereignisketten](shot-accounting-90-v117.json), [CSV mit Einzelbilanzen](shot-accounting-90-v117.csv). Die [fünf ursprünglichen Fälle](shot-accounting-five-v117.json) wurden zusätzlich auf dem finalen Build nachgespielt.

Beide Teams je Paarung zusammen:

| Je 30 Partien | Versuche | Zielschüsse | Schusstor | Anderer Torweg | Fangparaden | Abpraller-Paraden | Unterbrochen |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Gut/gut | 308 | 191 | 65 | 0 | 63 | 63 | 1 |
| Gut/schwach | 278 | 184 | 80 | 1 | 40 | 64 | 1 |
| Schwach/schwach | 187 | 95 | 22 | 3 | 35 | 38 | 0 |
| Gesamt | 773 | 470 | 167 | 4 | 138 | 165 | 2 |

Weitere Prüfungen:

- [21 gezielte Übergänge](shot-accounting-focused-v117.json): Fangparade, Abpraller, Tor, Fehlschuss, Block/verfehlter Block, Pfiff, wiederholter Abschluss, Kopfball-Umwandlung, Pass-/Flankentor, gespeicherte Ballherkunft, Nachschuss, Eigentor, Elfmeter und nicht erfasster Altstand. Deterministische Funktionsstubs prüfen hier die Statistikzustände, keine Physik.
- [5 Fälle mit echten Spielfunktionen](shot-accounting-native-v117.json): Elfmeter-Tor, Fangen, Abpraller, Fehlschuss und Legacy-Partie ohne Protokoll.
- Bestehende Quell-/Offline-/Asset-Rückfallprüfung, vollständiger 2D-/3D-Matchvergleich einschließlich Statistik, Speichern/Verlassen und Offlinebetrieb sowie vier Torwiederholungen einschließlich Pause bestanden.
- Die gleichen [sieben Kriterien für den Werteeinfluss](player-value-impact-qa-v117.json) bestehen auch mit den korrigierten Daten. Das belegt weiterhin den großen gemeinsamen Abstand aller Fähigkeiten, keinen Einzelattribut- oder mittleren Stärkevergleich.

Reproduktion über `work/test-shot-accounting-v117.cjs`, `work/check-shot-accounting-live-v117.cjs`, `work/study-shot-accounting-v117.cjs` (optional `--audit-accounting`), `work/check-player-value-impact-v117.cjs` und `work/verify-shot-accounting-v117.cjs`. Die Studie verwendet weiterhin die isolierte v115-Versuchsanordnung; historische v115-Rohdaten werden nicht überschrieben. [Build-, Quell- und Prüfmanifest](verification-v117.json).
