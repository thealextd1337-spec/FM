# Vorhandene Figur – Welle 0 / A01

Stand: 8. Oktober 2026. Lokale Freigabe für die PC-Vergleichsdemo; keine neue Meshy-Generierung, keine Veröffentlichung. Kosten: 0 neue Credits.

## Gemessener Bestand

Der tatsächliche Bootstrap `dist/player-user-bootstrap-v112.js` lädt `football-v130.glb`, `calibration-v130.json` und `cloth-mask.png`. Die Masterdateien bleiben unverändert. Ausgabe unter `outputs/platform/assets/5a2ae8bdc6606b00178d4861893fb008edadc05b4597c34459d7030ebb6e7fd1/`.

| Merkmal | Gemessen |
| --- | --- |
| GLB | 21.445.448 Bytes, SHA-256 `5a2ae8bdc6606b00178d4861893fb008edadc05b4597c34459d7030ebb6e7fd1` |
| Geometrie | 1 Skin, 28 Gelenke, 9.725 Vertices, 12.668 Dreiecke, 1 Material, UV0 |
| Bindepose-Bounds | x −0,839887 bis 0,837961; y 0 bis 1,700000; z −0,175020 bis 0,171293 |
| Animation | 34 erhaltene Clips, davon 30 mit Kalibrierung |
| Bilder | Basecolor 4096² PNG; Metallic/Roughness 2048² JPEG; zusätzlich archiviertes 2048² JPEG; Normal 2048² PNG |

Alle Clipnamen, Zeiten, Gelenknamen/-hierarchie, Bindetransformationen, Kontaktreferenzen, Bild- und Quellhashes stehen maschinenlesbar in `work/platform/assets/manifest.json`. `Charged_Spell_Cast` und die drei Jubelclips besitzen keine Laufkalibrierung. Der historische Spell-Clip bleibt archiviert und wird nicht als Fußballaktion aktiviert. Das zweite JPEG ist eingebettet, wird vom vorhandenen Material jedoch nicht referenziert.

## Browser-/Unity-Vertrag

Browser erhält die byteidentische GLB. Unity erhält daraus lokal erzeugtes `football-v130.fbx`, alle 34 benannten Takes und extrahierte Originalbildbytes. Kein Remesh, Retargeting oder neues Rig. Die FBX wurde mit Blender 5.2.2 LTS in einer separaten Hintergrundinstanz erzeugt; eine offene Nutzerszene wurde nicht verändert.

Quelle: Meterkonvention, +Y oben, +Z vorwärts, Sohle in Bindepose y≈0, Modellhöhe 1,70. Der bestehende Browseradapter setzt zusätzlich Skala 1,45 und Höhe +0,08; damit ist die sichtbare Bindeposenhöhe 2,465 Szeneneinheiten. Diese Szeneinheiten nicht stillschweigend als eine neue Produkthöhe festlegen. Kalibrierungswerte scale=1,45, rootScale=1,12, ground=0,105 getrennt erhalten; rootScale ist kein zusätzlich blind anzuwendender Importfaktor. Blender arbeitet intern Z-up, der FBX-Export verwendet -Z forward/Y up. Unity muss nach Import die tatsächliche Höhe und Blickrichtung prüfen.

Unity: Generic-Rig, keine Humanoid-Neuberechnung, Animationskompression für den ersten Vergleich aus, keine zusätzlichen Blattknochen, 30 Samples/s. Root Motion ist aus; Simulation besitzt Position, Richtung, Ball und Ergebnis. Takes tragen die Originalnamen; Werkzeuge können `target_character|` voranstellen. Clip-Suffix statt numerischem Index zuordnen. Individuelle Skelette und Animationszustände pro Figur, geteilte Geometrie und Texturen für zwölf beziehungsweise vierzehn Figuren.

Materialadapter: `textures/image-0.png` sRGB Basecolor, `image-1.jpg` lineare glTF-Packingsemantik G=Roughness/B=Metallic, `image-3.png` Tangent-Space-Normal. URP benötigt einen eigenen Adapter; FBX Standardmaterial kann die glTF-Metallic/Roughness-Packung nicht automatisch vollständig übertragen. Maskenkanäle R=Trikot/G=Hose/B=Stutzen beibehalten. Vereinsmuster, Nummern, Haut-/Haarfarben, Torwarthandschuhe und Kontakt-IK entstehen im bestehenden Browserrenderer; sie sind nicht im Master eingebettet. Ein bloßer FBX-Import ersetzt diese Funktionen nicht. Für faire erste Basis identische Grundtextur verwenden und fehlende Zusatzadapter sichtbar dokumentieren.

## Prüfung und Reproduktion

`node work/platform/assets/derive.cjs` inventarisiert und exportiert reproduzierbar; `D6_BLENDER` kann den Blenderpfad überschreiben. Separat prüft `node work/platform/assets/validate.cjs` Master-/Kopiehashes, Bildbytes, Geometrie, Rig und Rückimportbericht.

FBX-Rückimport bestätigt 28 Gelenke, 34 Takes, 9.725 Vertices, 12.668 Dreiecke und UVMap. Je Clip Anfang/Mitte/Ende: 102 Posen, alle Gelenkpositionen geprüft, größte Abweichung 0,000002994 Meter (Toleranz 0,002). Referenzierte Basecolor-/Normalbilder werden aus vorhandenen Dateien geladen. Rohdaten: `fbx-validation.json`, `validation.json`, Exportlogs im Ausgabeverzeichnis. Die ursprünglichen internen Blender-Bildpfade lösten beim Export Warnungen aus; der Rückimport bestätigt die gültigen extrahierten Basecolor-/Normalpfade.

Die anschließende E01-Probe bestätigt den tatsächlichen Unityimport (6000.6.4f1): 34 Clips, 28 Gelenke, 9.725 Vertices, 12.668 Dreiecke; Bericht `prototypes/match-engine-unity/import-validation.json`. Kamerabilder der aufrechten, texturierten Figur stehen daneben. Browser-/Unity-Silhouette, Knie-/Schulterverformung, Hand-/Fußruhe und sichtbare Kontaktmarker bleiben gesonderte Abnahmepunkte; diese numerische Konvertierungsprüfung ist kein universeller Animations- oder Kontaktbeweis. 1K/2K und 6k/3k bleiben spätere mobile Kandidaten; für den ersten PC-Vergleich bleiben volle Geometrie und Originaltexturen erhalten. Lizenz-/Herkunftsdokumentation folgt den bestehenden Nutzerfigur-/Meshy-Nachweisen; keine neue Lizenzprüfung oder neue Generierungsherkunft behauptet.
