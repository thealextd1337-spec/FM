# Vollständige Wappenabdeckung der Vereinswelt

Alle 192 Teams geprüft: 96 Ligavereine und 96 Pokalvereine. Vor der Korrektur besaßen 144 Teams Bildwappen; 48 zusätzliche Teams der ursprünglichen sechs Länder verwendeten Platzhalter, darunter Dortmund und Leeds.

Die ursprünglichen 48 und die 96 bereits gestalteten Wappen der sechs neuen Länder bleiben erhalten. Ergänzt werden 48 individuelle Motive: je acht in England, Spanien, Deutschland, Italien, Frankreich und Portugal. Unterschiedliche Formen, Schriftzeichen, Tiere und lokale Architektur teilen matte Druckfarben und einen dezenten Druckfinish.

## Quellen und Reproduktion

- `catalog.json`: Vereinszuordnung, Farben und individuelle Gestaltung.
- `prompts.json`: genaue Prompts; ein nativer Bildgenerierungsaufruf pro Verein.
- `source/`: unveränderte transparente Original-PNGs.
- `manifest.json`: Bildressourcen und Farbmasken.
- `vorschau.html`: alle ergänzten Wappen, Suchfeld und Länderfilter.

`python work/prepare-completed-crests.py` verkleinert die Originale auf 336 × 336 Pixel und erstellt drei Farbmasken sowie Kanten-/Detailressourcen. Hauptbild und Detailbild verwenden kompakte PNG-Farbpaletten. Die bestehenden Renderer und gespeicherten Vereinsfarben bleiben maßgeblich; keine neuen Spielstandfelder oder rückwirkende Berechnung. Registriert werden die Motive in `v61CrestAssets` innerhalb von `world-expansion-v161.js`.

## Prüfung

`node work/test-completed-crests.cjs` prüft die lückenlose Abdeckung aller 192 Teams, 48 eindeutige neue Hauptbilder, 288 PNG-Ressourcen, Umfärbung, zugängliche Namen, eindeutige SVG-Kennungen, unveränderte Vereinsdaten und Offline-Einbettung. Bisherige Wappenprüfungen bleiben zusätzliche Regressionen.

`work/check-crest-completion-mobile.cjs` reproduziert den alten internen Überlauf der Sponsorbeträge bei 390 Pixeln und prüft die Korrektur bei 320/360/390/440/768/1440 Pixeln, Deutsch/Englisch und Hell/Dunkel. Seitenüberlauf allein reicht als Nachweis nicht aus. Der dokumentierte Browserrunner benötigt Node 20+ und die vorhandenen Playwright-/Edge-Laufzeiten.
