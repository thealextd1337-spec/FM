# Fußballer B: verbesserte Geometrie und Bewegungen

Stand: 2. Oktober 2026. Überarbeitung der [ersten Rig-Probe](../3d-fussballer-b-rig/README.md) nach der Anweisung, Aussehen und Funktion zu verbessern. Beide vorherigen Blender-Dateien bleiben erhalten. Die neue Version liegt in diesem Ordner.

## Sichtbare Änderungen

- Trikot und Ärmel sind direkt in der neutralen Pose neu aufgebaut. Eine zusammenhängende Oberfläche und abgestufte Schultergewichte vermindern die starken Kanten beim Senken der Arme. Die Bruststreifen bleiben erhalten.
- Arme, Ellenbogen, Oberschenkel, Knie und Waden erhalten neue Querschnitte und zusätzliche Ringe um die Gelenke. Hände und Daumen sind kompakter; die Shorts sind enger und erhalten seitliche helle Einsätze.
- Kragen liegt auf der neutralen Brust; Hautfarben sind wärmer. Augenflächen sind kleiner, die Frisur ist niedriger und erhält abgestufte Seitenflächen. Die bisherige Gesichts- und Schuhgeometrie wird gezielt weiterverwendet.
- Laufbewegung ergänzt eine kleine Gegendrehung des Rumpfs; beim Pass öffnen sich die Arme zum Ausgleich. Ortsbewegung, Brems-Standfuß und tatsächlicher Schuh-/Ballkontakt behalten ihre geprüften Bahnen.

## Dateien

- [Blender-Datei](Fussballer-B-Verbessert.blend): 22 Knochen, ein deformierbares Spieler-Mesh, 1.744 Vertices und 3.054 Dreiecke, ein Spieler-Material mit gepackter Palettentextur. Stilvorlage und Umsetzungsskripte sind eingebettet.
- [Neue Bewegungsprobe](Lauf-Pass-Probe.mp4): 6,5 Sekunden, 720 × 720 Pixel, 24 Bilder/s; Laufen, Bremsen, Stand, Pass und Ausschwingen.
- [T-Pose](Neutral-T-Pose.png), [Gesicht](Gesicht.png), [Profil](Profil-Neutral.png), [Laufen](Laufpose.png), [Passkontakt](Passkontakt.png), [Ausschwingen](Ausschwingen.png).
- [Unity-FBX-Assets und Importhinweise](UnityAssets/Doppel6AnimationProbe/README.md): neutrales Rig, Idle, Run und Pass sowie neue Palettentextur.
- [Prüfprotokoll](rig-pruefung.json). Umsetzung in `work/polish-footballer-b.py` auf Grundlage von `work/rig-footballer-b.py`.

## Funktion geprüft

Normalisierte Gewichte, endliche Knochenmatrizen, identische Laufnaht, bodennahe Sohle, ruhiger Standfuß beim Laufen und Bremsen sowie rechter Innenseitkontakt gegen den tatsächlichen Ballradius bestehen erneut. Der Kontakt liegt weiterhin bei Passframe 15 beziehungsweise Frame 111 der Gesamtprobe. Die vier Actions sind in der nativen Datei als `B_V2_Idle`, `B_V2_Run`, `B_V2_Pass` und `B_V2_Lauf_Pass_Probe` gespeichert.

Zusätzlich wurden die tatsächlich deformierten Mesh-Vertices und Dreiecke in insgesamt 244 gebackenen Bildern geprüft. Alle Positionen sind endlich; kein geprüftes Dreieck kollabiert auf eine Fläche von null. Diese Prüfung beweist keine vollständige Kollisionsfreiheit.

Alle vier FBX-Dateien wurden erneut importiert. Geometrie, Knochen, Gewichte und Clipbereiche stimmen; die größte an vier Zeitpunkten je Clip gemessene Vertexabweichung beträgt rund 0,00000061 m. Blenders automatisch abgeleitete Knochenverbindungen wurden für diesen Rückimport ausgeschaltet, damit animierte Knochenverschiebungen erhalten bleiben; der Zeitoffset steht auf null. Die native Datei wurde erneut geöffnet und geprüft. Stand-, Profil-, Gesichts- und Bewegungsbilder wurden visuell geprüft.

Die zusätzliche Geometrie steigt von 1.894 auf 3.054 Dreiecke; Anzahl der Spieler-Materialien und Knochen bleibt gleich. Mobil-Leistung ist damit nicht zugesichert. Unity-Editorimport, Avatar, Animator, Web-Build und echte Geräte sind weiterhin ungetestet; diese Überarbeitung verbessert das Blender-Asset und seine FBX-Clips. Eine Spielintegration und die subjektive Stil-/Bewegungsabnahme stehen aus.
