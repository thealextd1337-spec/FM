# Veröffentlichung 109: Halbzeit und Vollbild

Am 5. Oktober 2026 als [Prototyp 109 live veröffentlicht](https://fussball.cakamper.at/). [Deployment](https://github.com/thealextd1337-spec/FM/actions/runs/37353724518) erfolgreich. Quellseite, Build und Live-Seite zeigen Version 109; die Live-Datei stimmt bytegenau mit dem geprüften Build überein: SHA-256 `bc787921bf355ebb39d22968018b2e62840e78a8fb0f8958cd81b957e2c09210`. Halbzeit-Taktikansicht und Vollbildrückkehr direkt live in einem isolierten Testspielstand geprüft. [Nachweise](release-109-verification.json).

Beim Halbzeitpfiff wird das bisherige Vollbild verlassen und die bestehende Taktikansicht geöffnet. „2. Halbzeit starten“ kehrt zum vorherigen Vollbild zurück, einschließlich mobilem Viewport-Fallback. Ohne vorheriges Vollbild bleibt die normale Ansicht erhalten. Keine Änderung an Simulation oder Spielständen.

Vollständige Veröffentlichungstests, echter Halbzeitpfiff mit beiden Startaktionen, natives Vollbild, mobiler Fallback, 2D/3D, DE/EN, Hoch-/Querformat, Verlassen der Partie und bestehende Vollbild/Rückschau bestanden. Derselbe Matchlauf in 2D, 3D und Offline liefert identische Ereignisse, Zeit, Statistiken und Ergebnis. [Umsetzung und Grenzen](halftime-fullscreen-v136.md), [Prüfnachweise](release-109-verification.json).

Quellseite und Build: Version 109, 50185079 Bytes, SHA-256 `bc787921bf355ebb39d22968018b2e62840e78a8fb0f8958cd81b957e2c09210`. Liveprüfung bestätigt identische Dateibytes und alle fünf Halbzeit-/Vollbildfälle einschließlich Bereinigung.

Release-Commit: [1e48990](https://github.com/thealextd1337-spec/FM/commit/1e48990cb7ed1dedd03736c18ab09025f29c7f3d).
