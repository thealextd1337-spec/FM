# Transparente Trophäenmotive

64 freigegebene Motive, einzeln mit dem eingebauten `image_gen`-Werkzeug bearbeitet; kein CLI-Fallback und keine lokale Hintergrundentfernung. PNG-Ergebnisse unverändert als `{key}.png` hier gesichert. Herkunft/Zuordnung: [generation-manifest.json](generation-manifest.json); ursprüngliche Editziele: [../cutout-inputs.json](../cutout-inputs.json).

## Promptvorgaben

Je Editziel: Die freigegebene Trophäe bzw. Medaille freistellen; weißen Studiohintergrund durch echte Transparenz ersetzen. Form, Material, Gold-/Silberflächen, Reflexe, Sockel, nationale Farben, Plakette, Band und Bildkomposition möglichst genau erhalten. Helle Metallflächen gehören zum Motiv und bleiben erhalten; nur Hintergrund und leere Zwischenräume transparent. Keine Neugestaltung, zusätzlichen Texte, neuen Objekte oder Hintergrundflächen. `transparent_background: true`, jeweils ein Original als Editziel.

Gezielte Korrektur `ita-player-of-season`: Die helle metallische Fläche im Fußball ist Bestandteil des Motivs. Den Ball vollständig erhalten, nur den äußeren Hintergrund entfernen. Die erste Fassung ist nicht ausgewählt. Generative Freistellung garantiert keine pixelidentische Reproduktion des Originals.

## Produktdateien und Prüfung

`dist/trophies-expansion/{key}.webp` (320 Pixel) und `{key}-small.webp` (96 Pixel, Anzeige 24 Pixel). Größenanpassung/Kompression mit Sharp, erzeugtes Alpha erhalten. 128 Varianten, zusammen 2.130.132 Bytes. Beide Varianten sind im Offline-HTML eingebettet. Zwei bestehende EU-Motive bleiben separat als SVGs.

[Integrationsnachweis](integration-checks.json), [Browsernachweis](browser-checks.json), [vollständige Galerie](gallery-1440.png), [mobile Galerie](gallery-390.png). Quelle und Build lokal geprüft; keine Veröffentlichung. Die physische Android-Abnahme fand vor diesem Grafikbuild statt.
