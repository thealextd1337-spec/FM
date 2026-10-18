# Entwicklungsdokumentation

Aktueller Fehlerarbeitsstand vom 18. Oktober 2026: Clientkorrekturen auf Basis des fertigen SI-Gesamtstands `56170c04`, erarbeitet in `work/fix-client-r133` auf `fix/client-r133` und auf `work/si-integration` / `integration/si-r133` übernommen. Die fünf neuen Meldungen heißen kollisionsfrei B23–B27. Nachgewiesene Ursachen sind korrigiert; Pausenlayout B20 ebenfalls. Der Nutzer bestätigt 2D als betroffene Ansicht von B27. Nutzerabnahme, B05 und die ausdrücklich genannten Grenzen bleiben offen. [Änderungen und Nachweise](client-fixes-r133.md). Keine Veröffentlichung in diesem Auftrag.

Historischer Release-132-Hinweis vom 14. Oktober 2026: Release 132 ist im Worktree `work/release-r132` lokal vorbereitet; Hauptcheckout/Live bleiben bis zur Integration auf Release 131. Aktueller Nutzerauftrag und geprüfter Checkout bestimmen die Arbeit.

- [Produktregeln](product.md): geltende Spielregeln und ausdrücklich gekennzeichnete offene Wünsche.
- [Entwicklung](development.md): Quellstand, Git-Übergabe, Prüfungen, Build und Veröffentlichung.
- [Bugliste](Bugliste.md): bekannte Fehler und offene Prüfungen; kein automatischer Arbeitsauftrag.
- [Entscheidungen](entscheidungen.md): aktueller Umfang, zurückgestellte Ideen und verworfene Fortsetzungen.
- [Spielerintelligenz 183 nur für neue Spielstände](spielerintelligenz-neue-spielstaende-183.md): Stempel `world.siRevision`, Entscheidungspunkte, Sponsorziel.
- [Release 132](release-132.md): Umfang, lokale Prüfungen und offene Grenzen vor der Integration.
- [Release 131](release-131.md): damalige Veröffentlichung und Nachweise.
- [Archivindex](history/README.md): frühere Dokumentation und inaktive Auftragspläne.
- [Changelog](CHANGELOG.md): abgeschlossene Änderungen.

## Änderungen dokumentieren

Neue abgeschlossene Änderungen oben unter „Noch nicht veröffentlicht“ eintragen. Kurz Verhalten, Grund, relevante Prüfungen und gegebenenfalls Auswirkungen auf Spielstände nennen. Bei Veröffentlichung die betreffenden Einträge unter eine datierte Releaseüberschrift verschieben. Unfertige Arbeit erhält keinen Fertigeintrag.
