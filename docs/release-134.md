# Veröffentlichung 134

Release 134 vom 22. Oktober 2026 enthält Release 133 und die optionale Einführung für neue Vereinswelten. Ausgangspunkt ist `7c8c015d` auf `feat/tutorial` (direkt auf Release 133 `5c3ea6b8`); Veröffentlichung in `work/tutorial` auf `release/r134`. Der Nutzer hat Merge, Versionserhöhung, Build, Deployment und Live-Abnahme ausdrücklich beauftragt.

## Umfang

- Optionale Einführung (`world-tutorial-v186.js/.css`): Erklärungen in jedem Startschritt, Opt-in im Prüfen-Schritt, geführte Kapitel durch Sponsorwahl, Jugendförderung, erste Transferphase mit Kaufen und Verkaufen, Transferschluss, Aufstellung, erstes Spiel und das Vereinsbüro mit News sowie ein Kapitel zur ersten Vertragsverlängerung. Hilfe & Einstellungen erhalten Schalter, Neustart und Kurzglossar. [Produktregel](product.md#optionale-einführung-beim-spielstart), [Plan](tutorial-plan.md), [Texte](tutorial-texte.md).
- Keine Änderung an Matchregeln, Unity-Binärcode oder Spielständen. Der Unity-Build mit Quellenkennung `7ce6f77fa77d4689e6f9befd4e27ae9bbdfab3ade2dc380d8f000abc9c72c3fe` bleibt unverändert; Produktmetadaten werden wie bisher beim Runtime-Aufruf gesetzt.

Footer und `data-d6-release`, Einzeldatei-Build, Runtime-Cache, Unity-Produktmetadaten und 3D-Hilfedaten tragen gemeinsam 134.

## Prüfung und Veröffentlichung

Vor dem Push: `work/test-release-version.cjs`, alle 127 Befehle des Produktionsworkflows lokal, `work/check-tutorial.cjs --build` (20 Prüfungen in Quelle und Einzeldatei-Build), `work/check-career-start-defaults.cjs` und die Offline-Publikationsprobe (`outputs/release-r134/publication-dry-run/`). Der Produktionsworkflow führt die 127 Befehle auf dem Veröffentlichungscommit erneut aus, baut die Seite, lädt zuerst die Unity-Laufzeit und danach die Spielseite hoch. `main` wird ohne Umschreiben der Historie vorgespult.

Nach dem Deployment werden die öffentliche Spielseite und die Runtime-Dateien mit dem lokalen Build über SHA-256 verglichen; der Live-Browser muss Release 134 zeigen und eine neue Karriere mit Einführung starten. Nachweise unter `outputs/release-r134/`.

## Grenzen

Die Spielkapitel der Einführung sind automatisiert mit der 2D-Darstellung (`?engine=browser`) geprüft; mit der Unity-Ansicht und im Vollbild (dort ist das Begleitfenster nicht sichtbar) nicht. Das Ziehen eines Spielers per Touch ist auf dem Handy nicht automatisiert nachgestellt. Bestehende Welten werden nicht umgerechnet; B05 und konkrete Nutzerabnahmen aus Release 133 bleiben offen.
