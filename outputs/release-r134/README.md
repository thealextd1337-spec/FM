# Release 134: Veröffentlichung

Basis Release 133 (`5c3ea6b8`) plus optionale Einführung (`7c8c015d`); [Releasebericht](../../docs/release-134.md). Nutzerauftrag: Merge, Versionserhöhung, Build, Deployment und Live-Abnahme.

- `preflight.json`: alle 127 Befehle des Produktionsworkflows lokal grün, dazu Versionsbindungen, Einführungsprüfung mit Build, Karrierestartprüfung und Offline-Publikationsprobe; Build-Hashes beider HTMLs (bytegleich).
- `workflow-commands.txt`: Status und Dauer je Workflowbefehl.
- `publication-dry-run/publication-dry-run.json`: neun echte Paketdateien, Manifest zuletzt, sieben simulierte HTTP-Prüfungen, kein Netzwerk; Release 134, Unity-Quellenkennung `7ce6f77f...` unverändert.
- `live-check.json` und `live-welcome.png` (nach dem Deployment): Live-Bytes von Spielseite und Runtime gegen den lokalen Build, Live-Browser mit Release 134 und gestarteter Einführung.

Der GitHub-Actions-Lauf für den Veröffentlichungscommit ist der serverseitige Nachweis. Keine rückwirkende Spielstandumrechnung.
