# Entwicklungsdokumentation

Aktueller Veröffentlichungsstand vom 18. Oktober 2026: Release 133 in `work/release-r133`, Branch `release/r133`, auf dem vollständig geprüften SI-/Clientstand `086275ef`. Die Veröffentlichung ist vom Nutzer beauftragt und erfolgt über `main` und den Produktionsworkflow. Quelle ist `dist/`; Footer, Build, Runtime-Cache, Unity-Produktmetadaten und Hilfedaten tragen 133. [Releasebericht und Prüfungen](release-133.md). B05 und konkrete Nutzerabnahmen bleiben offen; Bestandsspielstände werden nicht umgerechnet.

Historischer Release-132-Hinweis vom 14. Oktober 2026: Release 132 ist im Worktree `work/release-r132` lokal vorbereitet; Hauptcheckout/Live bleiben bis zur Integration auf Release 131. Aktueller Nutzerauftrag und geprüfter Checkout bestimmen die Arbeit.

- [Produktregeln](product.md): geltende Spielregeln und ausdrücklich gekennzeichnete offene Wünsche.
- [Entwicklung](development.md): Quellstand, Git-Übergabe, Prüfungen, Build und Veröffentlichung.
- [Bugliste](Bugliste.md): bekannte Fehler und offene Prüfungen; kein automatischer Arbeitsauftrag.
- [Entscheidungen](entscheidungen.md): aktueller Umfang, zurückgestellte Ideen und verworfene Fortsetzungen.
- [Spielerintelligenz 183 nur für neue Spielstände](spielerintelligenz-neue-spielstaende-183.md): Stempel `world.siRevision`, Entscheidungspunkte, Sponsorziel.
- [Release 133](release-133.md): gesamter SI-Stand, Clientkorrekturen und neue Unity-Laufzeit.
- [Release 132](release-132.md): Umfang, lokale Prüfungen und offene Grenzen vor der Integration.
- [Release 131](release-131.md): damalige Veröffentlichung und Nachweise.
- [Archivindex](history/README.md): frühere Dokumentation und inaktive Auftragspläne.
- [Changelog](CHANGELOG.md): abgeschlossene Änderungen.

## Änderungen dokumentieren

Neue abgeschlossene Änderungen oben unter „Noch nicht veröffentlicht“ eintragen. Kurz Verhalten, Grund, relevante Prüfungen und gegebenenfalls Auswirkungen auf Spielstände nennen. Bei Veröffentlichung die betreffenden Einträge unter eine datierte Releaseüberschrift verschieben. Unfertige Arbeit erhält keinen Fertigeintrag.
