# Release 124 – zuverlässiger Speicherstart

11. Oktober 2026. Nutzerauftrag zur Veröffentlichung der Wappen-/Sponsoränderungen.

Enthält Release 123: 96 individuelle neue Vereinswappen, 36 Sponsoren mit Wortmarken und Symbolen, eingebettete Zurücknavigation sowie vollständige Bonusziele/Beträge in der Sponsorwahl. Der abschließende Live-Neuladetest fand ein Startzeitproblem: IndexedDB konnte gültige Expansionswelten prüfen, bevor deren Validatoren installiert waren. Derselbe gespeicherte Spielstand ist nach dem Modulaufbau gültig.

`v61StartStorage` beginnt das Lesen erst nach `DOMContentLoaded`, wenn der Parser noch läuft; bei bereits geladener Seite startet es unmittelbar. Kein Timer, keine erneute Berechnung, keine Spielstandmigration. Die vorhandenen Lese-, Validierungs- und Schreibregeln bleiben erhalten.

## Prüfung und Veröffentlichung

Eine gezielte Regression prüft mit echter gespeicherter Expansionswelt, dass vor Installation der Validatoren kein IndexedDB-Zugriff erfolgt und danach dieselben Daten gültig geladen werden. Bestehende Speicher-, Wappen- und Sponsorprüfungen bestehen. Produktionslauf und abschließende Live-Abnahme folgen hier nach Abschluss.
