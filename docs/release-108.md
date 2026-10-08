# Veröffentlichung 108: Mobile 3D-Performance

Am 5. Oktober 2026 als [Prototyp 108 live veröffentlicht](https://fussball.cakamper.at/). [Deployment](https://github.com/thealextd1337-spec/FM/actions/runs/37348446605) erfolgreich. Quellseite, Build und Live-Seite zeigen Version 108; die Live-Datei stimmt bytegenau mit dem geprüften Build überein: SHA-256 `7c1ef8675e071f0a4ef0df6591670c84eebf24e562eb9a5928e45e4588f4c804`. Mobile Darstellung und deutsche/englische 3D-Hilfe direkt live mit isoliertem Testspielstand geprüft. [Nachweise](release-108-verification.json).

Primäre Touchgeräte verwenden Pixeldichte höchstens 1 ohne MSAA oder dynamische Schatten. Bodenschatten, vollständige Modelle und Beleuchtung bleiben erhalten. Der Matchtakt liefert neue Zustände an die Bildschirm-Bildschleife; mobile Live-Ansicht und Rückschau zeichnen höchstens 60 Bilder/s. Das letzte Rückschau-Bild wird auch beim Erreichen der Grenze sofort gezeichnet. Desktop behält seine Grafikeinstellungen. Keine Änderung an Simulation oder Spielständen.

[Umsetzung und Messgrenzen](mobile-3d-performance-v135.md). Vollständige Veröffentlichungstests, aktuelle mobile Bildplanung bei synthetischen 120 Hz, 2D-/3D-/Offlineparität und Vollbild/Rückschau bestanden. Zusätzlich direkt live bestätigt: zwölf Spielermodelle, mobile Pixeldichte 1 ohne MSAA/dynamische Schatten, Pause/Fortsetzen, mobiles Vollbild, Sprach-/Ansichtswechsel und Orientierung sowie unveränderte Desktop-Qualität. Keine Browserfehler. Die tatsächliche Bildrate und Erwärmung auf einem Pixel 9 Pro XL bleiben am Gerät zu prüfen.

Release-Commit: [57de5e4](https://github.com/thealextd1337-spec/FM/commit/57de5e465b24e417dd99121dce38a6e2e32cacd5). Build-/Live-Datei: 50.183.508 Bytes. freekickdemo ist nicht Bestandteil der Veröffentlichung.
