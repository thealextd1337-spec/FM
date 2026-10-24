# Veröffentlichung 135

Release 135 vom 24. Oktober 2026 enthält Release 134 und den Stand `fix/mobile-jank` (`7854f3c0`). Veröffentlicht wird aus `work/perf-mobile` auf `release/r135`. Der unveröffentlichte Live-Nachweis von Release 134 (`c3fd5a88`) ist mit übernommen. Der Nutzer hat Merge, Versionserhöhung, Build, Deployment und Live-Abnahme ausdrücklich beauftragt („Bring 135 online“).

## Umfang

- **B01, flüssigere Live-Partien:** Der Autosave während der laufenden Partie läuft höchstens alle 15 s. Pause, Halbzeit, Abpfiff, Verlassen, Verbergen und `pagehide` speichern sofort. Die unsichtbare 2D-Leinwand wird im Unity-/3D-Modus nicht gemalt. Bedienleisten schreiben nur geänderte Werte, Größen kommen aus ResizeObservern. Die Unity-Bildpumpe ruft höchstens einmal je Bildschirmbild. [Diagnose, Umsetzung und Messungen](diag-mobile-jank-2026-10-23.md).
- **B30:** Das Unity-Bild trägt `holding` nur beim Einwurf. Unity fällt bei Torwart-Aufnehmen und -Halten nicht mehr auf 2D zurück.
- **Unity-Wächter:** Eine eingefrorene Seite gilt nicht als stumme Unity. Von einer Malpause zählt nur der Teil über 1 s nicht zur Antwortfrist, so wird eine wirklich stumme Unity auch unter Last erkannt. `v65SaveSoon` wird nach jedem erfolgreichen Snapshot und beim Abpfiff zurückgesetzt.
- Nicht enthalten: Ballphysik 184, B28, KI-Trainer 185, Kimodo-Animationen, Gesichtsfarben B29.
- Keine Änderung an Matchregeln, Spielständen oder dem Unity-Binärbuild (Quellenkennung `7ce6f77fa77d4689e6f9befd4e27ae9bbdfab3ade2dc380d8f000abc9c72c3fe`). Die ausgelieferte `unity-match/runtime.js` enthält die geänderte Bildpumpe und die Produktversion 135.

Footer und `data-d6-release`, Einzeldatei-Build, Runtime-Cache, Unity-Produktmetadaten und 3D-Hilfedaten tragen gemeinsam 135.

## Prüfung und Veröffentlichung

Vor dem Push laufen `work/test-release-version.cjs` und alle Befehle des Produktionsworkflows lokal, dazu die Browserprüfungen `test-world-unity-picture-contract.cjs` und `test-world-unity-watchdog.cjs` (nur lokal: sie brauchen Edge/Playwright und laufen nicht im GitHub-Workflow; der erste Deploy-Lauf 40036733855 scheiterte daran, ohne etwas hochzuladen). Dazu kommen die Bytegleichheit vollständiger Partien gegen Release 134 (`work/check-mobile-jank-parity.cjs`: 2D/Unity × vorher/nachher), die R132/R133-Altszenen (`check-old-matches-v182/v183.cjs`), Speichern/Fortsetzen (`work/check-mobile-jank-save.cjs`) und die Offline-Publikationsprobe. Nachweise liegen unter `outputs/release-r135/`. `main` wird ohne Umschreiben der Historie vorgespult; der Produktionsworkflow wiederholt die Prüfungen, lädt zuerst die Unity-Laufzeit und danach die Spielseite hoch.

Nach dem Deployment vergleicht `work/check-live-r135.cjs` die öffentliche Spielseite, die Runtime-Dateien und die Unity-Builddateien laut Manifest per SHA-256 mit dem lokalen Stand. Dazu startet es in einem isolierten Browserprofil je eine Partie in Unity und in 2D und prüft Speichern und Neuladen.

## Grenzen

Leistungswerte stammen aus Desktop-Emulation (CPU 4×/6×), nicht vom Pixel; die Nutzerabnahme am Gerät steht für B01 und B30 aus. Pro 15 s bleibt ein Speicherhänger (0,2–0,8 s je nach Spielstandgröße). 2D zeigt weiterhin nur die 25-Hz-Takte; Interpolation ist eine offene Nutzerentscheidung. Bestehende Welten werden nicht umgerechnet; B05 und weitere Nutzerabnahmen bleiben offen.
