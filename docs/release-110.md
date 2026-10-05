# Veröffentlichung 110: Matchkorrekturen und Vereinsübersicht

Am 5. Oktober 2026 als [Prototyp 110 live veröffentlicht](https://fussball.cakamper.at/). [Deployment](https://github.com/thealextd1337-spec/FM/actions/runs/37367809301) erfolgreich. Quellseite, Build und Live-Seite zeigen Version 110; die veröffentlichte Datei stimmt bytegenau mit dem geprüften Build überein: SHA-256 `7ed1c1e98a7c66dbcb2a4d77b4e2acffd3a7964c4de5256366b36428e715274b`. Live-Pause, Halbzeit-/Vollbildübergang, Taktikzonen und Vorlagen einschließlich Speicherung und Wiederladen direkt live in isolierten Testspielständen geprüft.

Live-Pause setzt die Partie am aktuellen Zeitpunkt fort. Standdrehungen und Dribbling lösen die problematischen Fußanker; Einwurf, Ecke und Abstoß richten wartende Spieler zum Ball aus. Karriereplan, Vorbereitung und Pause teilen Teamtaktik und kompakte Vorlagenbedienung. TV und Ergebnisdialog zeigen den Spieltag, die TV-Anzeige außerdem das Rückspiel-Gesamtergebnis. Reguläre Elfmeter erhalten zwei Sekunden Toransicht vor dem Schuss; das Elfmeterschießen einen zusätzlichen Button neben dem Schützen. Distanzschüsse berücksichtigen Entfernung, Winkel und Schussweg.

Die Vereinsübersicht zeigt aktuelle Titel und den kompakten Sponsor unter dem nächsten Gegner. Die Liste der letzten fünf Spiele entfällt; aktive eigene Pokalvereine sind hervorgehoben. Englische Vertragsverlängerung und konkrete Statistikspalten ergänzt. AGENTS.md enthält die vollständige Meshy-Freigabe. [Details und Grenzen](match-corrections-v139.md), [Prüfnachweise](release-110-verification.json).

Vollständige Release-Tests, gezielte native Browserproben in DE/EN und Mobil-/Desktopgrößen, Speicherfehler und Wechselgrenzen, Rückschau, Vollbild, Halbzeit sowie dieselbe vollständige Partie in 2D/3D/Offline bestanden. Animationen wurden am tatsächlichen Rig mit Software-WebGL geprüft; echte Pixel-Frameraten wurden nicht gemessen.

Quellseite und Build: Prototyp 110, 50201782 Bytes, SHA-256 `7ed1c1e98a7c66dbcb2a4d77b4e2acffd3a7964c4de5256366b36428e715274b`. Live-Abnahme bestätigt.

Release-Commit: [4e618d2](https://github.com/thealextd1337-spec/FM/commit/4e618d2bada14bffc12b93c779312950834435ea).
