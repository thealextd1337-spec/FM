# Release 135: Veröffentlichung

Basis Release 134 (`0eb8d8dd`) plus `fix/mobile-jank` (`7854f3c0`: B01, B30, Unity-Wächter); [Releasebericht](../../docs/release-135.md). Nutzerauftrag vom 24. Oktober 2026: „Bring 135 online“ (Merge, Versionserhöhung, Build, Deployment, Live-Abnahme).

- `preflight.json`: alle 129 Befehle des Produktionsworkflows lokal grün, dazu Versionsbindungen, Bytegleichheit vollständiger Partien gegen Release 134 (2D/Unity), R132/R133-Altszenen, Speichern/Fortsetzen, Probelauf der Live-Prüfung gegen den lokalen Build und Offline-Publikationsprobe; Build-Hashes beider HTMLs (bytegleich).
- `workflow-commands.txt`: Status und Dauer je Workflowbefehl.
- `publication-dry-run/publication-dry-run.json`: neun echte Paketdateien, Manifest zuletzt, sieben simulierte HTTP-Prüfungen, kein Netzwerk; Release 135, Unity-Quellenkennung `7ce6f77f...` unverändert.
- `live-check.json`, `live-unity.png`, `live-2d.png` (nach dem Deployment): Live-Bytes von Spielseite, Runtime und Unity-Build laut Manifest gegen den lokalen Stand; isoliertes Browserprofil mit Unity- und 2D-Partie sowie Speichern/Neuladen.

Der GitHub-Actions-Lauf für den Veröffentlichungscommit ist der serverseitige Nachweis. Keine rückwirkende Spielstandumrechnung.
