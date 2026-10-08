# Musterspieler B – Stufe 1

Stand: 1. Oktober 2026. Eigenständige Blender-Musterfigur nach dem ausgewählten [Stilentwurf B](../3d-stilreferenz-b.png). Die zuvor gezeigte lokale Bewegungsprobe wurde vom Nutzer wegen unzureichender Grafikqualität zurückgewiesen. Diese Figur ist eine neue Stilprobe für Proportionen, Gesicht, Frisur und Sportkleidung.

**Nutzerabnahme: verworfen.** Auch Modellrevision 5 wurde am 1. Oktober 2026 wegen unzureichender Grafikqualität zurückgewiesen. Die technischen Prüfungen bleiben Messbelege, bestätigen aber keinen passenden Grafikstil. Der nächste Versuch soll über das lokale Blender MCP erfolgen und eine geeignete Charaktergrundlage verwenden. Die Dateien bleiben als verworfener Entwurf verfügbar.

[Ansichten öffnen](vorschau.html) · [Blender-Datei](spieler.blend) · [GLB-Szene](spieler.glb) · [Interaktive 3D-Szene](https://higgsfield.ai/3d-jutsu/106f0660-cb99-42fe-a9ec-004e61d3c884)

## Inhalt

Die Figur besitzt einen geformten Kopf mit integrierten Wangen- und Kieferflächen, eine kompakte asymmetrische Frisur, grün-weißes Trikot mit Kragen, zusammenhängende dunkelblaue Shorts, weiße Stutzen und Fußballschuhe mit Stollen. Gesicht, Haar, Kleidung und Körperteile bleiben in Blender getrennt bearbeitbar. Ein ruhiger Rasenabschnitt dient der Kontakt- und Silhouettenprüfung.

Fünf tatsächliche Modellrender zeigen Dreiviertel-, Vorder-, Profil- und Rückansicht sowie das Gesicht. Die Bilder wurden aus derselben gespeicherten Modellrevision mit Cycles, 32 Samples und Entrauschung gerendert. Das Stilkonzept daneben bleibt als Konzept gekennzeichnet.

Die Szene wurde über die Blender-Werkzeuge von Higgsfield / 3D Jutsu erstellt. Projekt-ID: `106f0660-cb99-42fe-a9ec-004e61d3c884`; übergebene Modellrevision: **5**. Lokale Dateien sind dauerhafte Kopien der entsprechenden Blender- und GLB-Exporte.

## Öffnen und weiterbearbeiten

- `spieler.blend` in Blender öffnen. Die Sammlung `D6_Musterspieler_Stufe1` enthält die Figur, `D6_Stilpruefung` enthält Boden, Kameras und Licht. `Kamera_Dreiviertel` ist die Lieferkamera.
- `spieler.glb` enthält die exportierte Szene samt Figur, Prüfgrundfläche, Kameras und portablem Licht. Weltbeleuchtung und Renderer können bei GLB von den Blender-Bildern abweichen.
- `node work/serve-player-style.cjs` startet die lokale Bildvorschau unter `http://127.0.0.1:4208/`. `D6_STYLE_PORT` überschreibt den Port. Die Vorschau funktioniert auch als lokal geöffnete HTML-Datei.
- `work/blender-player-stage1.py` rekonstruiert die Modellierung in einer neuen Blender-Szene und ersetzt dabei deren vorhandene Objekte. `work/blender-player-stage1-render.py` ist die separate Renderprüfung für das 3D-Jutsu-Werkzeug mit dessen `artifacts`-Registry.

## Umfang und Abnahme

Stufe 1 liefert eine erste editierbare Musterfigur zur Nutzer-Stilprüfung. Sie enthält noch kein Skelett und keine Bewegungsclips. Die Figur ist nicht in die Matchdarstellung eingebunden. Regeln, Taktiken, Banner, gespeicherte Spieleridentitäten und bisherige Spieldarstellung werden durch diesen Auftrag nicht geändert; das unabhängige Projekt `freekickdemo/` wird nicht einbezogen.

Geprüft sind endliche Geometrie, Bodenkontakt, Export und fünf Renderansichten. Die Figur verwendet 3668 Dreiecke und 85 bearbeitbare Meshes. Der GLB-Export enthält zusätzlich die Prüfgrundfläche und Feldlinie, ist 274.816 Bytes groß und benötigt keine externen Pufferdateien. Die Bildvorschau lädt alle fünf Ansichten ohne Browserfehler und ohne horizontalen Überlauf bei 390 Pixeln Breite. Messwerte und Datei-SHA-256 stehen in [pruefung.json](pruefung.json).

Eine unabhängige Sichtprüfung hatte Revision 5 als vorzeigbare erste Musterfigur beurteilt. Die anschließende Nutzerrückmeldung verwirft diese Einschätzung für den gewünschten Grafikstil. Eine Stilfreigabe liegt nicht vor. Die Prüfung belegt keine endgültige Modellqualität, Animation oder Laufzeit auf Mobilhardware. Die vielen getrennten Modellteile sind für Bearbeitung ausgelegt; Bündelung und Skelettanbindung gehören zur späteren Integration.
