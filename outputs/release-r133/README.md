# Release 133: Veröffentlichung

Veröffentlichungsbasis `086275ef`, vollständiger SI- und Clientstand; [Releasebericht](../../docs/release-133.md). Nutzerauftrag: alle integrierten Änderungen live setzen.

- `preflight.json`: 13 Versions-, Build-, Bugregressions-, Manifest- und Assetbefehle grün.
- `release-scope.json`: 2.154 Dateien gegen den vollständig geprüften Ausgangsstand verglichen; ausschließlich die sechs erwarteten Release-/HTML-Dateien geändert. Beide HTMLs bytegleich, SHA-256 enthalten.
- `unity-manifest.json`: alle 58 Quellen-/Paketprüfungen grün, Quellenkennung `7ce6f77f...`.
- `publication-dry-run/publication-dry-run.json`: neun echte Paketdateien, Manifest zuletzt, sieben simulierte HTTP-Prüfungen, kein Netzwerk; ausdrückliche neue Quellenkennung und Release 133.
- Die zehn Python-Deploymenttests bestehen. Der vollständige Ausgangsstand mit 127 grünen Produktionsbefehlen bleibt unter `outputs/client-r133/` versioniert; der Produktionsworkflow führt dieselben 127 Befehle auf dem Veröffentlichungscommit erneut aus.

Die lokalen Rohlogs, abschließenden Live-Hashes und Browseraufnahmen liegen ebenfalls hier. Der GitHub-Actions-Lauf für den Veröffentlichungscommit ist der serverseitige Nachweis. Offene Nutzerabnahmen und B05 bleiben bestehen; keine rückwirkende Spielstandumrechnung.
