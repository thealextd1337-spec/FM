# Fußballer B: Test-Rig und Lauf-/Passprobe

Stand: 2. Oktober 2026. Der auf Nutzerwunsch vollständig neu modellierte [Fußballer B](../3d-fussballer-b-neu/README.md) besitzt jetzt eine neutrale T-Pose, ein Deformationsskelett und eigene Bewegungsclips. Umsetzung direkt über Blender MCP. Unity ist die empfohlene Zielengine für die nächste isolierte Probe; [Begründung und Quellen](../unity-unreal-entscheidung.md).

## Dateien und Umfang

- [Native Blender-Datei](Fussballer-B-TestRig.blend): eine eigenständige Szene, 22 Knochen, ein Spieler-Mesh mit 1.894 Dreiecken, ein Palettenmaterial, eingebettete Textur und Stilvorlage. Die frühere statische Datei bleibt erhalten.
- [Bewegte Probe](Lauf-Pass-Probe.mp4): 6,5 Sekunden, 720 × 720 Pixel, 24 Bilder/s; Laufen, Abbremsen, ruhiger Stand, rechter Innenseitpass und Ausschwingen. Die Kamera fährt mit. Die Ballbewegung ist für diese isolierte Kontaktprobe angelegt.
- [Neutralpose](Neutral-T-Pose.png), [Laufpose](Laufpose.png), [Passkontakt](Passkontakt.png).
- [Unity-Assetpaket und Importhinweise](UnityAssets/Doppel6AnimationProbe/README.md): neutrales Rig sowie getrennte Idle-, Run- und Pass-FBX-Dateien mit Palettentextur.
- [Messprotokoll](rig-pruefung.json): Gewichtung, Laufnaht, Standfuß, Bremsphase, Ballkontakt und FBX-Rückimport.
- Umsetzungsskript: `work/rig-footballer-b.py`; außerdem in der Blender-Datei eingebettet. Es ergänzt die ursprüngliche Modellstudie und ist kein Spielmodul.

## Bewegungen

| Action | Dauer | Verwendung |
| --- | --- | --- |
| B_Idle | 1 s | ruhiger Stand, Schleife |
| B_Run | 1 s | Laufzyklus am Ort, Schleife |
| B_Pass | 1,5 s | rechter Innenseitpass, einmalig |
| B_Lauf_Pass_Probe | 6,5 s | vollständige Blender-Probe mit Ortsbewegung |

Der Laufzyklus passt zu einer Ortsgeschwindigkeit von etwa 0,9333 m/s bei normaler Clipgeschwindigkeit. Der Standfuß bleibt in seiner Standphase bei dieser Ortsbewegung stabil. Während der Bremsphase wird das linke Standbein auf der Kontaktposition gehalten. Der Passkontakt liegt bei Clipframe 15, also 14/24 s nach Clipbeginn; in der vollständigen Probe bei Frame 111. Kontakt wird an einem tatsächlich deformierten Schuhvertex gegen den Ballradius geprüft.

## Prüfung und Grenzen

Gewichte sind normalisiert; alle geprüften Posen sind endlich. Anfang und Ende des Laufzyklus stimmen überein. Die größte gemessene Änderung des Standfußes zwischen den geprüften Laufbildern beträgt rund 0,0000002 m, beim Bremsen rund 0,00000017 m. Die tiefste Laufsohle liegt etwa 1,45 mm über dem Boden. Das sind Prüfungen an den gebackenen Bildern, keine umfassende Kollisions- oder Bewegungsabnahme.

Alle vier FBX-Dateien wurden in Blender erneut importiert. Knochen, Gewichte, Geometrie und Clipbereiche stimmen; die an vier Zeitpunkten je Clip verglichenen deformierten Vertices weichen maximal rund 0,00000057 m vom Original ab. Beim Rückimport musste Blenders automatisch abgeleitete Knochenoption „Connected“ ausgeschaltet werden: Sie sperrt sonst animierte Knochenverschiebungen, insbesondere am Becken. FBX-Zeitoffset wurde für den Vergleich auf null gesetzt. Dies ist ein Blender-Rückimporttest, kein Unity-Test.

Die native Datei wurde erneut geöffnet und geprüft. Das MP4 enthält 156 Bilder mit 24 Bildern/s. Standbilder und Blender-Kameraansicht wurden visuell geprüft. Ein Unity-Editor war in den geprüften Standardpfaden und Installationsregistrierungen nicht auffindbar. Unity-Import, Avatar, Animator, Web-Build und Mobilgeräte-Leistung sind daher noch ungetestet. Die vorhandene Matchengine ist nicht angebunden; Stil- und Bewegungsabnahme bleiben offen.

## Nächster Schritt

Eine kleine Unity-Testszene mit dieser Figur, Rasen, Ball, Licht und naher TV-Kamera erstellen. Zuerst Generic-Rig verwenden, Idle/Run/Pass abspielen und Kontakt sowie Übergänge prüfen. Danach einen Web-Build auf echtem iPhone und Android prüfen. Erst anschließend die vorhandene JavaScript-Matchengine über Positions- und Aktionsdaten anbinden; eine vollständige Portierung der Berechnung ist ein eigener Umfang.
