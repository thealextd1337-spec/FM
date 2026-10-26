# Release 136: Veröffentlichung

Basis Release 135 (`37a23a9a`) plus `feat/ai-tactics` (`8ba80dd4`, Ballphysik 184 und KI-Trainer 185), `fix/si-defender-drift` (`81c52b59`, B28) und `fix/unity-skin-colors` (`f312c5ce`, B29); [Releasebericht](../../docs/release-136.md). Nutzerauftrag vom 26. Oktober 2026: „Führe A aus, danach B, danach C“ (B = Release 136 zusammenstellen, prüfen, veröffentlichen).

- `preflight.json`: alle 135 Befehle des Produktionsworkflows lokal grün, dazu Versionsbindungen, R132/R133-Altszenen, Unity-Bildvertrag und Wächter, Speichern/Fortsetzen, Probelauf der Live-Prüfung gegen den lokalen Build und Offline-Publikationsprobe; Build-Hashes beider HTMLs (bytegleich).
- `workflow-commands.txt`: Status und Dauer je Workflowbefehl; `logs/` die Ausgaben.
- `publication-dry-run/publication-dry-run.json`: echte Paketdateien, Manifest zuletzt, simulierte HTTP-Prüfungen, kein Netzwerk; Unity-Quellenkennung `b434de96...`.
- `dry-run-live-*`: Probelauf von `work/check-live-r136.cjs` gegen `work/serve-tree.cjs`.
- `live-check.json`, `live-unity.png`, `live-2d.png` (nach dem Deployment): Live-Bytes gegen den lokalen Stand und je eine Unity- und 2D-Partie mit Speichern/Neuladen.

Der GitHub-Actions-Lauf für den Veröffentlichungscommit ist der serverseitige Nachweis. Keine rückwirkende Spielstandumrechnung.
