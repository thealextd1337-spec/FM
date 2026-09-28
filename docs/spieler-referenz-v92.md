# Spielerreferenz 92

## Stand

Erster Referenzentwurf für die Qualitätsüberarbeitung. Die [Jugendspieler-Demo](../dist/player-creation-demo-v90.html) startet mit einem zusammenhängend gezeichneten Paar: frontales Porträt und derselbe Spieler mit zurückgebundenen Haaren und einer Faust vor der Brust. Die andere Hand zeigt nicht nach oben. Der Entwurf ersetzt noch keine Spieler der Vereinswelt.

Das [Masterbild](../dist/sprites/player-reference-v92.png) enthält beide Ansichten auf transparentem Hintergrund. Der Renderer `dist/player-reference-v92.js` verwendet feste, von Hand gesetzte SVG-Farbregionen in den Koordinaten dieses Bilds. Die Bildfarben werden nicht zur Erkennung der Regionen benutzt. Die Originalschattierung liefert die Helligkeit für die Umfärbung. Gesichtsdetails werden nicht zusätzlich aufgesetzt und Köpfe nicht aus anderen Vorlagen montiert.

Die Regionen sind ein erster Entwurf, keine visuell freigegebenen Produktionsmasken. Die Referenz verwendet vorerst einfarbige Trikots mit Kragen und Ärmelbesatz; die sechs Vereinsmuster sind noch nicht umgesetzt. Die gespeicherten Spielermerkmale und der Produktionsrenderer bleiben unverändert.

## Prüfung

- `node work/generate-player-creation-demo-v90.cjs` erzeugt die eigenständige Demo einschließlich Masterbild.
- `node work/test-player-reference-v92.cjs` prüft 168 Kombinationen aus sechs Hautfarben, sieben Haarfarben und vier Trikoteinstellungen, gültige Farbmatrizen, eingebettete Bilddaten, getrennte Ansichten, eindeutige Masken-IDs, Vereinswechsel, zwölf Jugendspieler und Rückkehr zur Referenz.
- `node work/test-world-sprites-v82.cjs` prüft weiterhin den bestehenden Produktionsrenderer.
- Das generierte Masterbild wurde gesichtet. Eine visuelle Browserprüfung der fertigen Umfärbung ist offen: Der Browserzugriff auf die lokale `file://`-Seite wurde durch die Browser-Sicherheitsrichtlinie blockiert. Die technischen Prüfungen ersetzen diese Sichtprüfung nicht.

## Nächste Abnahme und Ausbau

1. Referenz in der Demo mit hellem, dunklem und rotem Trikot sowie den Haut- und Haarfarben prüfen. Besonders Maskenränder an Kragen, Haaransatz, Gesicht und Faust betrachten. Farbregionen bei sichtbaren Nähten korrigieren.
2. Kopfgröße, Pixelwirkung und Wiedererkennbarkeit in Profil- und Torbannergröße auf 320 und 375 Pixel breiten Ansichten abnehmen. Auch die endgültige Bannerintegration ist noch offen.
3. Trikotmuster als posegerecht gezeichnete Flächen hinzufügen und hinter Faust und Armen begrenzen.
4. Nach Stilabnahme die weiteren neun Frisuren in derselben Pose ergänzen. Erst dann weitere Gesichtsvarianten und die Einbindung in die Erzeugung neuer Spieler ausbauen. Alte gespeicherte Gesichter nicht umdeuten.

## Bildherkunft und Prompt

Erzeugt mit dem eingebauten Imagegen-Werkzeug. Referenz: vierte Zeile von `dist/sprites/player-atlas-b.png`. Das Ergebnis wurde unverändert in das Projekt kopiert; Umfärbung und Auswahl der beiden Ansichten erfolgen im Renderer.

```text
Create a production reference sprite pair for football browser game Doppel 6. Reference image: use ONLY the young footballer in row four, brown hair tied back, as identity and general 16-bit aesthetic reference. Output a transparent wide PNG with exactly two equally sized square panels side by side, no panels drawn, no text. Left: frontal bust portrait, right: SAME young male player in three-quarter view celebrating with ONE clenched fist touching his chest and other arm lowered, no pointing. Both framed from waist up with full hair and shoulders, same head size, consistent face and brown tied-back hair, light-medium skin, plain green short-sleeved football shirt with white collar and cuff, no numbers logos or stripes. Carefully drawn crisp pixel art, limited coherent palette, deliberate chunky pixel clusters, no painterly noise, no stray disconnected pixels. Anatomically clean hands, identical lighting and outline weight, generous transparent margin. This will be the master paired asset reviewed before expanding hairstyles. Do not include any other players from the reference.
```
