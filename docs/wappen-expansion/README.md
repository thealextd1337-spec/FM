# Wappen der sechs neuen Länder

96 individuelle Bildwappen für Niederlande, Österreich, Belgien, Türkei, Schweiz und Griechenland, einschließlich aller Pokalvereine. Schriftlogos, historische Siegel, freie Tiermotive und geometrische Zeichen teilen denselben matten Druckfinish. Die aktuelle Fassung wurde mit dem eingebauten Bildgenerator erstellt; `art-directions-v2.json` und `prompts-v2.json` dokumentieren die Einzelbriefs. Die sechs transparenten Originaltafeln bleiben hier erhalten; die erste Fassung liegt unter `erste-fassung/`.

[Vorschau aller Wappen und Sponsoren](vorschau.html). `catalog.json` enthält Zuordnung und Farbpaletten; `manifest.json` dokumentiert Bildausschnitte, Zielassets und Farbmasken. Reproduktion: `uv run --with pillow --with numpy --with scipy python work/prepare-expansion-crests.py`. Verbundene Bildkomponenten werden pro Motiv isoliert und im vorhandenen 336-Pixel-Wappenvertrag paketiert. Keine gespeicherten Vereinsdaten werden geändert.

Die 48 ursprünglichen Wappen bleiben bytegleich. Zusätzliche Vereine der ursprünglichen sechs Länder gehören nicht zu diesem Grafikauftrag. [36 neue Sponsoren](sponsors/README.md). In Release 123 enthalten; Veröffentlichung vom Nutzer beauftragt.

Prüfung: `node work/test-expansion-crests.cjs` bestätigt 96 unterschiedliche Motive, 576 PNG-Assets, Umfärbung, zugängliche Namen, eindeutige SVG-IDs und Offline-Einbettung. Bestehende Wappen-/Expansions-/Präsentationsprüfungen bestehen. Browserprüfung bei 320/390/1440 Pixeln und Deutsch/Englisch prüft Kopfzeile, Rückweg und dekodierbare Wappen.
