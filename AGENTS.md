# Doppel 6: Hinweise für Entwicklungsinstanzen

Doppel 6 ist ein mobil spielbarer Fußballmanager im Browser. Der aktuelle Quellstand liegt in `dist/`; der Code ist für den Implementierungsstand maßgeblich. Neue Nutzerentscheidungen haben Vorrang vor der Dokumentation.

`freekickdemo/` ist ein eigenständiges Projekt. Änderungen und Veröffentlichungen von Doppel 6 beziehen diesen Ordner nicht ein.

Die bisherige Sechserliga wird nicht weiterentwickelt. Neue Produktfunktionen gehören zur Vereinswelt; Details stehen in `docs/product.md`.

Lies nur die für die Aufgabe relevanten Dateien:

- Bei Spielregeln, Karriere, Transfers, Pokal, Auszeichnungen oder UI: `docs/product.md`.
- Bei Codeänderungen, Tests, Build oder Veröffentlichung: `docs/development.md`.
- Bei abgeschlossenen Änderungen und neuen Features: Eintrag in `docs/CHANGELOG.md` ergänzen; Format in `docs/README.md`.

Bei jeder Veröffentlichung die Versionsnummer im Seitenfuß anheben und den gleichen Stand in Quellcode, Build und Live-Seite prüfen.

Für künftige Änderungen gilt: Bestehende Spielstände nicht rückwirkend berechnen oder umrechnen, wenn dafür Zusatzlogik nötig wäre. Details und Ausnahmen stehen in `docs/development.md`.

Spielerfähigkeiten in allen Ansichten einschließlich zugänglicher Beschriftungen nur als Farbstufen zeigen. Exakte Fähigkeitswerte und Entwicklungspunkte bleiben intern; Details stehen in `docs/product.md`.

Halte diese Datei als Wegweiser kurz. Pflege feste Produktentscheidungen in `docs/product.md` und Entwicklungsregeln in `docs/development.md`.
