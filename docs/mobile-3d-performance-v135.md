# Mobile 3D-Performance v135

Anlass: starkes Ruckeln der 3D-Ansicht auf einem Pixel 9 Pro XL. Am 5. Oktober 2026 als Prototyp 108 veröffentlicht.

## Ursache und Änderung

Der bisherige Renderer aktiviert unabhängig vom Gerät MSAA-Kantenglättung, dynamische Schatten und eine Pixeldichte bis 1,75. Zusätzlich zeichnen der 40-ms-Matchtakt und die interpolierende Bildschirm-Bildschleife jeweils vollständige Szenen. Auf einem Bildschirm mit hoher Wiederholrate steigt damit auch der Aufwand für Rig-Posen.

`pitch-scene-v98.js` erkennt primäre Touchbedienung mit `(pointer:coarse)`. Diese Geräte verwenden Pixeldichte höchstens 1 ohne MSAA oder dynamischen Schattenpass. Die vorhandenen einfachen Spieler-/Ballschatten, Beleuchtung, Stadiongeometrie und vollständigen Meshy-Modelle bleiben erhalten. Desktop behält seine bisherigen Grafikeinstellungen.

`world-pitch3d-v98.js` übernimmt neue Matchzustände weiterhin bei jedem Matchtakt. Wenn bereits ein Bildschirmaufruf geplant ist, zeichnen die regulären `draw`-/Steuerungsaufrufe kein zusätzliches 3D-Bild. Der erste Aufbau, Pause und ausdrückliche Szenenproben zeichnen unmittelbar. Die Animationszeit wird erst beim tatsächlichen Zeichnen fortgeschrieben. Touchgeräte zeichnen höchstens 60 Bilder/s; der Desktop folgt weiterhin der Bildschirmrate. `world-goal-replay-v103.js` begrenzt ebenfalls die mobile Rückschau, deren Zeit unabhängig davon weiterläuft.

Keine Änderung an Simulation, Zufallsziehungen, Matchzeit, Spielerwerten, Modellen oder Karriereformat. Kein Eingriff in bestehende Spielstände.

## Messung und Prüfungen

Isolierter Edge-Testbrowser, mobiles Querformat 915 × 412 CSS-Pixel, emulierte Gerätepixeldichte 3, SwiftShader. Es wurde kein persönliches Browserprofil oder echter Spielstand geöffnet.

| Größe | Vorher | Nachher |
| --- | ---: | ---: |
| Renderpixeldichte | 1,75 | 1 |
| Reguläre Renderfläche | 1470 × 827 | 840 × 473 |
| Pixel pro Bild | 1.215.690 | 397.320 |
| MSAA / dynamische Schatten | an / an | aus / aus |
| Geladene Matchspieler | 12 | 12 |
| Renderaufrufe aus Spieltakt / Bildschleife im fünfsekündigen Lauf | 84 / 11 | 1 / 33 |

Die Pixelzahl sinkt um ungefähr 67 %. Die letzten Renderzahlen belegen die geänderte Aufrufverteilung; sie sind keine Messung der sichtbaren Bildrate auf einem Pixel. SwiftShader, GPU-Warteschlangen und Last des Testrechners begrenzen diesen Vergleich. Die Obergrenze von 60 ist keine Zusage, dass echte Mobilhardware 60 Bilder/s erreicht.

- `node work/test-mobile-performance-v135.cjs`: Produktionscode zur Qualitätswahl und Bildplanung; synthetische 120-Hz-Live- und Rückschaufolgen ergeben jeweils 60 neue Bilder pro Sekunde. Frische Matchzustände, korrekte Animations-/Rückschauzeit, sofortige Pause, Fortsetzen und unveränderte Desktop-Bildrate bestätigt.
- `work/check-mobile-performance-v135.cjs before/after`: echter Renderer mit allen zwölf geladenen Spielern, Pixeldichte/MSAA/Schatten, doppelte Aufrufe, Pause, Vollbild, DE/EN, 2D-/3D-Wechsel und Orientierung. Mobile Vollbild-Renderbreite entspricht 915 CSS-Pixeln; Desktop behält Pixeldichte 1,75 und MSAA/Schatten. Keine Browserfehler.
- `work/run-mobile-regression-v135.cjs parity`: vollständige reproduzierbare 2D-/3D-Partien identisch bei Zeitlinie, Toren, Ereignissen, Wechseln, Statistiken und gebuchtem Ergebnis. Banner, Standards, Halbzeit, Abpfiff, Kontextverlust, Verlassen und eingebetteter Offline-Build ebenfalls geprüft.
- `work/run-mobile-regression-v135.cjs check-fullscreen-tv-v132.cjs`: bestehende Vollbild-/Touchgrößenprüfung auf DE/EN sowie historische TV-Werte, Rückschau-Abspielen, Pause/Fortsetzen und Aufräumen bestanden.
- Bestehende Projektions- und Spielermodelltests bestanden. Der alte eigenständige `test-pitch-motion-v102.cjs` scheitert bereits an seiner fehlenden Fixture-Variable `v127OneTouchRelease`; dieser alte Test wurde nicht verändert. Aktuelle Animationen werden im vollständigen Browservergleich geladen.
- Regulärer Einzeldatei-Build erzeugt und im Browser geprüft. Quellseite und Build zeigen Version 108.

JSON-/Bildnachweise liegen unter `outputs/mobile-performance-v135-{before,after}.*`, `outputs/world3d-parity-v135.json` und `outputs/fullscreen-tv-qa-v135.json`. `outputs/` bleibt außerhalb von Git. Die tatsächliche Flüssigkeit, Erwärmung und längere Laufzeit auf einem Pixel 9 Pro XL sind noch am Gerät zu prüfen.

## Veröffentlichung

Am 5. Oktober 2026 als [Prototyp 108 live veröffentlicht](https://fussball.cakamper.at/). [Deployment](https://github.com/thealextd1337-spec/FM/actions/runs/37348446605) erfolgreich. Quellseite, Build und Live-Seite zeigen Version 108; die Live-Datei stimmt bytegenau mit dem geprüften Build überein: SHA-256 `7c1ef8675e071f0a4ef0df6591670c84eebf24e562eb9a5928e45e4588f4c804`. Mobile Darstellung und deutsche/englische 3D-Hilfe direkt live mit isoliertem Testspielstand geprüft. [Nachweise](release-108-verification.json).
