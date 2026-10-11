# Sponsoren der sechs neuen Länder

36 individuelle Marken, jeweils als Wortmarke und kompaktes Symbol. Native Bildgenerierung anhand der bestehenden Sponsorennamen und unterschiedlicher Markenbriefs; gemeinsamer matter Druckfinish. `catalog.json`, `prompts.json` und `symbol-prompts.json` halten Zuordnung und Briefs fest. Die sechs transparenten Quelltafeln (`group-*.png`, `group-*-symbols.png`) und `manifest.json` dokumentieren die Herkunft.

Reproduktion: `uv run --with pillow --with numpy --with scipy python work/package-expansion-sponsors.py`, danach `node work/build.cjs`. Wortmarken werden komponentenweise freigestellt; Symbole stammen aus separat generierten vollständigen Motiven. 72 transparente PNGs: 480 × 180 bzw. 192 × 192. Der gemeinsame Renderer nutzt bestehende Marken-IDs ohne neue Spielstandfelder.

`node work/test-expansion-sponsors.cjs` prüft Zuordnungen, beide Größen, Offline-Einbettung, vollständige Bonusbedingungen/Beträge/Gesamtsummen/Auszahlungshinweise sowie unveränderte Angebote. Browser: Deutsch/Englisch, 390/1440 Pixel, kein horizontaler Überlauf; tatsächlicher Auswahlklick wechselt zum Jugendbudget und bucht genau das gewählte Fixum (670 Credits). In Release 123 enthalten; Veröffentlichung vom Nutzer beauftragt.
