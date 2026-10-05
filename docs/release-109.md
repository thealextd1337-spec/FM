# Veröffentlichung 109: Halbzeit und Vollbild

Für die Live-Seite vorbereitet: Beim Halbzeitpfiff wird das bisherige Vollbild verlassen und die bestehende Taktikansicht geöffnet. „2. Halbzeit starten“ kehrt zum vorherigen Vollbild zurück, einschließlich mobilem Viewport-Fallback. Ohne vorheriges Vollbild bleibt die normale Ansicht erhalten. Keine Änderung an Simulation oder Spielständen.

Vollständige Veröffentlichungstests, echter Halbzeitpfiff mit beiden Startaktionen, natives Vollbild, mobiler Fallback, 2D/3D, DE/EN, Hoch-/Querformat, Verlassen der Partie und bestehende Vollbild/Rückschau bestanden. Derselbe Matchlauf in 2D, 3D und Offline liefert identische Ereignisse, Zeit, Statistiken und Ergebnis. [Umsetzung und Grenzen](halftime-fullscreen-v136.md), [Prüfnachweise](release-109-verification.json).

Quellseite und Build: Version 109, 50185079 Bytes, SHA-256 `bc787921bf355ebb39d22968018b2e62840e78a8fb0f8958cd81b957e2c09210`. Liveprüfung folgt nach Deployment.
