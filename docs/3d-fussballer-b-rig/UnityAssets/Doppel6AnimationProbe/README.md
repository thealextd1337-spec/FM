# Unity-Import: Doppel 6 Animation Probe

Vorbereitete FBX-Assets, noch nicht im Unity-Editor getestet. Empfohlen ist zunächst eine separate Unity-6.3-LTS-Testszene. Kopiere diesen Ordner in deren `Assets/`-Verzeichnis.

## Import und Testszene

1. `Footballer-Rig.fbx`: Rig → Animation Type **Generic**, Avatar Definition **Create From This Model**, Root Node **Root**. Anwenden. Die Datei enthält das neutrale Skinning ohne Clip. Humanoid-Mapping ist ein späterer separater Test.
2. `Idle.fbx`, `Run.fbx`, `Pass.fbx`: Generic, Avatar Definition **Copy From Other Avatar**; Avatar des neutralen Rigs auswählen. Im Animation-Tab die Clips Idle, Run und Pass benennen. Idle und Run als Schleife, Pass ohne Schleife importieren. Die eingebetteten Takes tragen derzeit den Blender-Szenennamen; die Dateinamen unterscheiden die Clips eindeutig.
3. Ein gemeinsames Material mit `PlayerPalette.png` als Base Map beziehungsweise Albedo zuweisen. Textur als sRGB, Filter Point und ohne Mipmaps importieren; Metallic 0, glatte matte Oberfläche. Dadurch bleiben die kleinen Farbfelder getrennt. Die `.fbm`-Unterordner enthalten vom FBX-Exporter kopierte Texturen; die zentrale PNG ist die maßgebliche Palette.
4. Das neutrale Modell auf eine Bodenfläche setzen. Einen Animator Controller mit Idle, Run und Pass erstellen und die drei importierten Clips zuweisen. Apply Root Motion deaktivieren. Run ist am Ort angelegt; Ortsbewegung separat steuern. Bei Clipgeschwindigkeit 1 passt etwa 0,9333 m/s zur Standphase. Root-/Beckenpositionen und Höhe zunächst unverändert aus den Clips übernehmen, damit die Fußkontakte erhalten bleiben.
5. Einen separaten Ball mit Radius 0,111 m verwenden. Der rechte Innenseitkontakt erfolgt 14/24 s nach Beginn des 1,5-s-Passclips, normalisierte Zeit etwa 0,388889. Ballfreigabe und Kontakt dürfen beim Übergangsmischen zeitlich nicht verschoben werden. Position und Richtung nach dem Kontakt bestimmt bei der späteren Spielintegration die bestehende Matchengine.

## Abnahme

Zuerst Maßstab, Ausrichtung, Palettenfarben und T-Pose prüfen; danach Laufnaht, Standfuß, Beckenbewegung, Knie, Passkontakt und Rückkehr zum Stand. Die Blender-Probe `../../Lauf-Pass-Probe.mp4` dient als Vergleich. Die gesamte Bewegungsprobe ist eine Blender-Action; die FBX-Dateien enthalten die drei separat nutzbaren Clips.

Anschließend Web-Build erstellen und auf einem echten iPhone und Android-Gerät Startzeit, Speicherverbrauch, Bildrate und Rückkehr nach Tabwechsel messen. Das Assetpaket enthält kein fertiges Unity-Projekt, keine bestätigte Humanoid-Konfiguration und keine Spielintegration.
