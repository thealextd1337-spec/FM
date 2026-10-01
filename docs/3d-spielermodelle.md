# Natürlichere 3D-Spielermodelle

Stand: 1. Oktober 2026. Prototyp 105 ist lokal umgesetzt, noch nicht veröffentlicht. Live-Stand der getrennten 3D-Vorschau ist weiterhin 104. Auf Nutzerwunsch hat die Modellqualität Vorrang vor zusätzlichen Zweikampf- und Grätschenanimationen.

## Richtung und Umfang

Die Spieler sollen wie natürlichere Sportspielfiguren wirken und auch im mobilen Querformat praktikabel bleiben. Die Umsetzung verbessert Silhouette, Körperproportionen, Muskeln, Kiefer, Hände und Schuhe innerhalb des bisherigen prozeduralen Gelenkmodells. Die Figuren bleiben stilisiert; Fotorealismus oder eine feste Bildrate sind nicht belegt.

Die bestehende Oberfläche, Vereinsfarben, TV-Kameras und Matchsteuerung bleiben erhalten. Dieser Block ergänzt keine Zweikampf- oder Grätschenbewegungen. Die bisherigen Lauf-, Pass-, Schuss-, Kopfball-, Volley-, Parade- und Wurfposen verwenden weiter ihre vorhandenen Drehpunkte und Kontaktwege.

## Umsetzung

- `dist/player-model-v105.js` ist die gemeinsame Modellfabrik für die Szene. Rumpf, Kiefer und Muskelkonturen werden organisch aufgebaut; Schuhe und Handflächen verwenden rundere Formen.
- `dist/pitch-scene-v98.js` erstellt die Figuren über diese Fabrik. Wurzelmaßstab und bestehende Gelenkpunkte bleiben erhalten, damit Kopf- und Fußkontakte weiter auf denselben Höhen liegen.
- `dist/world-pitch3d-v98.js` übergibt das vorhandene Aussehen aus dem Matchspieler. Hautfarbe (`skinTone`), Haarfarbe (`hairColor`), Frisur (`hairstyle`), Gesichtsform (`faceShape`), Bart (`facialHair`), Nase (`nose`) und Mund (`mouth`) bestimmen die Darstellung.
- Das gespeicherte Aussehen wird weder verändert noch ergänzt. Bei fehlendem Aussehen verwendet ausschließlich die Grafik einen deterministischen Ersatz. Es gibt keine neuen gespeicherten Felder, keinen zusätzlichen Engine-Zufall und keine Migration.
- Die sechs bestehenden Matchtrikotmuster und ihre Vereinsfarben sowie Nummern und Torwarthandschuhe bleiben erhalten.

## Geometrie und Messgrenzen

Statische Details werden mit Vertexfarben je beweglichem Gelenk gebündelt. Eine Figur verwendet 15 Meshes; das Budget liegt unter 3500 Dreiecken je Figur. Die geprüfte Cornrows-Variante verwendet 3048 Dreiecke. Die Trikottextur ist 128 × 128 Pixel groß. Diese Grenzen erlauben mehr Formdetail bei weniger getrennten Zeichenaufrufen.

Der vergleichbare Anfangsbildaufbau derselben Szene liefert:

| Messwert | Ausgangsstand 104 | Lokaler Stand 105 |
| --- | ---: | ---: |
| Zeichenaufrufe | 284 | 194 |
| Geometrien | 322 | 210 |

Eine spätere Aufnahme im Match liefert 210 Zeichenaufrufe, 212 Geometrien und 62.650 Dreiecke. Sie gehört zu einem anderen Bildzeitpunkt und darf nicht als direkter Vergleich zum Anfangsbildaufbau verwendet werden. Die Messwerte beschreiben Grafikkosten unter Software-WebGL. Sie belegen keine stabilen FPS auf einem echten Mobiltelefon.

## Lokale Prüfung und verbleibende Abnahme

`work/test-player-model-v105.cjs` prüft zwölf Modellfälle, darunter zehn Frisuren, deterministische Geometrie, unverändertes gespeichertes Aussehen, endliche Geometriedaten, äußere Rumpfnormalen, erhaltene Gelenkpunkte und das Geometriebudget. `work/check-player-model-v105.cjs` prüft die Zuordnung gespeicherter Identität, Desktop-TV, mobiles Querformat, Hochformat-Rückfall auf 2D und eine Nahansicht ohne Browserfehler.

Die lokale visuelle Prüfung akzeptiert vier Ansichten und bestätigt Verbesserungen an Silhouette, Gesichtern und Schuhen. Diese Prüfung ersetzt nicht die subjektive Freigabe durch den Nutzer. Bildbelege liegen unter `outputs/model105-tv-desktop.png`, `outputs/model105-tv-mobile.png` und `outputs/model105-gallery.png`.

Die abschließenden Prüfungen bestehen: 17 JavaScript-Testdateien und sechs Deploymentfälle, identischer vollständiger 2D/3D-Spielverlauf über 2543 Schritte, 28 Aktions- und 20 Luftduellfälle, Torwiederholungen beider Teams und Halbzeiten, Überspringen und natürlicher Abschluss, Standards, Banner, Taktik, Gerätewechsel und Kontextverlust. Die Sohlenprüfung misst maximal 0,004802 Szeneneinheiten Kontaktabweichung bei 289 Kontakten. Einzeldatei und eigenständiger Kameraprototyp starten ohne Browserfehler. Bestehende Abnahmebedingungen stehen im [3D-Leitfaden](3d-spieldarstellung.md) und im [Animationsplan](3d-spieleranimationen-plan.md).

Offen bleiben die Laufzeitprüfung auf echter Mobilhardware und die subjektive visuelle Freigabe. Für eine Veröffentlichung gelten weiterhin Versionsabgleich von Quelle, Build und Live-Seite sowie die getrennte Freigabe nach `/3d/`.
