# Fable Assetprüfung für Nighttime und Klares Low-Poly

Fable 5.1 hat am 12. Oktober 2026 die vorhandenen 3D-Assets des lokalen Doppel-6-Redesigns lesend geprüft. Der Bestand ist für beide Stilaufträge wiederverwendbar. **Nighttime** beginnt mit den bestehenden Modellen und der vorhandenen Abendbeleuchtung. **Klares Low-Poly** beginnt mit einem Material-/Facettenprototyp; echte Meshvereinfachung oder Ersatzmodelle folgen, wenn Form und Silhouette dies benötigen. Rigs, Clips und native Matchregeln bleiben erhalten.

## Lokaler Anker und Stand der Übergabe

Der Anker liegt in [work/claude-natural-motion](../../work/claude-natural-motion/) auf `codex/claude-natural-motion-20261010`. Fable erfasste HEAD `a1453ff0` mit lokalen Arbeitsänderungen. Die relevanten 55 Runtime-, Editor-, Shader- und Artquellen waren mit `G:/unity/My project/Assets/Doppel6EngineProbe` hashgleich; vier ältere Probe-Testdateien im Editorordner wichen ab. Diese Aussage beschreibt die geprüften Dateien, nicht eine vollständige Gleichheit sämtlicher Projektdateien.

Zum Prüfzeitpunkt war R20 der letzte vollständig übergebene Kandidat; R21 war ein neuerer Arbeitsstand ohne vollständige Übergabe. Die R21-Quellkennung lautete `3442dee81cd9a3abbca2083cb3d0c02fcf19efa20ec7a0868204134191d12d82`. Der Assetbestand und die betroffenen Shader/Importschritte waren gegenüber den älteren geprüften Kandidaten unverändert.

Für eine spätere Umsetzung nimmt Opus den **zu diesem Zeitpunkt neuesten fertig übergebenen Stand dieses lokalen Redesigns** und sichert dessen Quellen-/Asset-/Buildbindung. Ein noch bearbeiteter Editorstand wird nicht ohne Übergabe geändert. Die Version auf der Live-Seite ist kein Ersatzanker. Die vorhandenen R20-/R21-Belege dienen der Zuordnung und werden vor Umsetzung erneut gelesen:

- [R20 Übergabe](../../work/claude-natural-motion/outputs/3d-quality/claude-natural-motion-20261010/r20-unity-contract/handoff.md).
- [R21 Fortschritt](../../work/claude-natural-motion/outputs/3d-quality/claude-natural-motion-20261010/r21-user-animation-defects/progress.json).
- [Aktuelle Quellenkennung](../../work/claude-natural-motion/prototypes/match-engine-unity/source-identity.json).
- [Assetmanifest](../../work/claude-natural-motion/work/platform/assets/manifest.json).

## Geprüfter Assetbestand

Pfade in dieser Aufstellung beziehen sich auf `work/claude-natural-motion/`; Editorpfade sind Kopien beziehungsweise abgeleitete Assets.

- **Feldspieler und Keeper:** `dist/players/football-v130.glb`, 21.445.448 Bytes, SHA-256 `5a2ae8bdc6606b00178d4861893fb008edadc05b4597c34459d7030ebb6e7fd1`. Mesh `low_poly_unwrapped`: 9.725 Vertices und 12.668 Dreiecke. Das Modell besitzt 28 Rig-Gelenke, `mixamorig:*`-Bindings und die Wurzel `target_character`. Keeper verwenden dasselbe Modell mit eigener Material-/Posezuordnung.
- **Animationen:** 34 Originalclips, davon 30 im vorhandenen Kalibrierbestand, sowie zwei separate Pilotclips `pass_inside_meshy` und `receive_ground_meshy`. Generic-Transformbindings; die aktive Auswahl erfolgt über vorhandene Quellen und PlayableGraph.
- **Unity-Import:** `Art/football-v130.fbx` im Editor, erzeugt über den vorhandenen `work/platform/assets/export_fbx.py`-Pfad. Exportreproduzierbarkeit wurde nicht durch einen neuen Exportlauf geprüft.
- **Texturen:** BaseColor `image-0` mit 4096²; Metallic/Roughness `image-1` und Normal `image-3` mit 2048². In der Matchansicht wertet `WorldKit` nur die BaseColor samt Kleidungsmaske aus. Vorhandene PBR-Importdateien belegen deshalb noch keine PBR-Wirkung im tatsächlichen Matchshader.
- **Kleidungsmaske:** `dist/players/cloth-mask.png`, UV0-basiert, R = Trikot, G = Hose, B = Stutzen. Haut-/Haarerkennung verwendet zusätzliche Pigment- und Positionsheuristiken.
- **Abgeleitete Spielermeshdaten:** `WorldPlayer.asset` enthält Bindpose-Vertices in TEXCOORD2. `FootballSoleContour.cs` enthält meshbezogene Sohlenkonturen. Browserkalibrierung in `calibration-v130.json` verwendet ebenfalls Mesh-/Vertexdaten.
- **Ball, Tore und Netz:** prozedurale Geometrie, keine separat zu kaufenden Modelle. Der Ball folgt vorhandenem Anker und vorhandener Rotation; das Netz folgt der vorhandenen nativen Netzdarstellung.
- **Rasen, Stadion und Publikum:** prozedurale Geometrie beziehungsweise zur Laufzeit erzeugte Texturen. `StadiumArchitecture.cs` besitzt acht Architekturtypen; `ClubStadiumProfiles.cs` liefert vorhandene Vereinsprofile. Die tatsächlich übergebene Vereinszuordnung bleibt maßgeblich.
- **Beleuchtung:** bereits vorhandener dunkler Himmel, Hauptlicht, Umgebungsbeleuchtung, Lampen-/Bandenemission und normale/reduzierte Stufen. Zusatzlichter sind in der untersuchten WebGL-Pipeline ausgeschaltet.

## Übernahmeentscheidung je Stil

| Bestandteil | Nighttime | Klares Low-Poly |
| --- | --- | --- |
| Spieler und Keeper | Zunächst vorhandene Modelle übernehmen; Stoff-/Hautglanz und Lichtwirkung abstimmen. Ersatz bei belegter Form-/Materiallücke erlaubt. | Zuerst auf bestehendem Mesh Facetten-/Materialprototyp vergleichen. Für einfachere Silhouetten und tatsächliche Topologiereduktion neues Mesh am bestehenden Rig erstellen. |
| Rig, Originalclips, Pilotclips | Erhalten. | Erhalten, auch bei neuem Mesh. |
| BaseColor und Kleidungsmaske | Zunächst erhalten; Materialreaktion im Matchshader anpassen. | Zunächst erhalten und Pigmentvariation beruhigen. Bei UV-/Formänderung Masken passend neu erzeugen; bei unveränderten UVs trotzdem die Abdeckung prüfen. |
| WorldPlayer, Sohlenkontur, Browserkalibrierung | Bei unverändertem Mesh übernehmen. | Bei neuem Mesh alle drei Datenpfade regenerieren beziehungsweise aktualisieren und nachweisen. |
| Ball | Vorhandene Geometrie übernehmen oder optional Panelball als sichtbare Hülle ergänzen. | Vereinfachte sichtbare Geometrie möglich; Größe, Anker und Rotationsdaten erhalten. |
| Tore und Netz | Übernehmen, Materialwirkung abstimmen. | Übernehmen oder sichtbare Geometrie behutsam vereinfachen; Netzverformung erhalten. |
| Rasen | Bestehenden Shader weiterverwenden; Farben, Abnutzung und Lichtkontrast abstimmen. | Ruhigere Variation und klare breite Mähstreifen; bestehende Vereinsmuster berücksichtigen. |
| Stadion und Umfeld | Architektur erhalten, Beton/Metall/Leuchten abstimmen. | Generatoren erhalten; kleinere Texturen oder Farbflächen und vereinfachte Modellvarianten nutzen. |
| Publikum | Bestehende Darstellung zuerst erhalten. | Ruhigere, einfachere Figuren-/Atlaswirkung entwickeln. |
| Himmel und Licht | Vorhandene Abendbeleuchtung zu Nighttime weiterentwickeln. | Zunächst Ankerbeleuchtung erhalten. Heller Tageslichtvergleich ist ein optionaler eigener Stiltest, keine automatische Nighttime-Kombination. |

Die Shader-Facettierung ist eine **Empfehlung für einen schnellen Sichtvergleich**, keine vorhandene Funktion und kein Beweis für eine geringere Polygonzahl. Ein Derivative-Normal-Prototyp in `WorldKit` verändert nur die Lichtreaktion vorhandener Dreiecke. Wenn ihre Verteilung oder Silhouette den Zielstil nicht ergibt, übernimmt Blender die echte Meshgestaltung.

## Kritische Bindungen

Die belegten Quellen befinden sich im [lokalen Unity-Quellordner](../../work/claude-natural-motion/prototypes/match-engine-unity/).

- `ProbeSetup.cs:13`: Generic-Import. `FootballAnimation.cs` sucht Fuß-/Zehen-/Handbones nach Namen. Ungeprüftes Humanoid-Retargeting ist keine passende Übernahme.
- `WorldViewSetup.cs:15`: `WorldPlayer.asset` wird nur bei fehlendem Asset angelegt. Ersatzmeshes als neue versionierte Kandidaten erzeugen oder den zuständigen Generierungsweg gezielt aktualisieren; die Originale bleiben erhalten.
- `WorldKit.shader:43–64`: Kleidungsregionen, Kragen, Nummern, Haare, Augen und Handschuhe hängen an Maske, Pigment und Bindposeposition. Reine Flächenfarben benötigen eine weiterhin eindeutige Haut-/Haarzuordnung.
- `FootballSoleContour.cs` und `FootballAnimation.cs`: Sohlenkonturen hängen an Meshnamen. Fehlende Konturen können im WebGL auf einen schwächeren Pfad zurückfallen. Neue Meshnamen und tatsächliche generierte Konturen ausdrücklich überprüfen.
- `FootballSetup.cs`, `ProbeBridge.cs`: vorhandene Modell-/Actor-Skalierung und Körperhöhe übernehmen; Kontakte werden nicht durch größere native Reichweiten repariert.
- `ProbeWebBuild.cs:26` und `D6Common.hlsl:9`: zusätzliche Lichtbeiträge sind im untersuchten Pfad nicht aktiv. Sichtbare Emission ist keine echte zusätzliche Lichtquelle.
- `work/platform/assets/manifest.json`: die Original-GLB, Maske und Kalibrierung gehören zur Assetbindung. Eine isoliert geänderte Editor-FBX ist keine vollständige, reproduzierbare Übernahme.

## Empfohlener Werkzeugweg

**Blender MCP** eignet sich für lesende Mesh-/Rigprüfung, neue Modellvarianten, kontrollierte Retopologie, Gewichtstransfer und Export auf das bestehende Skeleton. Der Import einer vorhandenen Figur erfolgt in einer eigenen Kopie. Original-Bonehierarchie, Bindpose und Clipdaten bleiben Referenz.

**Unity MCP** eignet sich für Assetimport, Varianten-/Materialzuordnung, Rig-/Mesh-/Maskenprüfung, Console, vorhandene Tests und Renderaufnahmen. Vor Zugriff Projekt, Bridge und aktuelle Editorzuständigkeit lesen; danach den bestehenden Import-/Sync-/Buildpfad verwenden. Toolverfügbarkeit allein beweist keine verbundene, exklusive Editorsitzung.

**Meshy** ist optional für neue sichtbare Modellideen, etwa sauberere Haare/Schuhe, Stadionbausteine oder einen Ersatzspieler. Generierte Modelle werden zunächst als geometrische Vorschläge behandelt. Ein automatisch erzeugtes Meshy-Rig oder neue Meshy-Animationen ersetzen das vorhandene Generic-Rig und die vorhandenen Clips nicht. Blender bereitet geeignete Modelle für den bestehenden Vertrag auf, Unity prüft deren tatsächliche Anbindung. Kosten und verfügbare Generierungsoptionen werden vor einem konkreten Generierungsauftrag anhand der Tools geprüft.

## Prüfgrenzen und Abnahme

Fables Ergebnis ist eine lesende Asset-/Quellprüfung. Keine neuen Modelle, Shader oder Builds wurden erstellt; es wurden keine neuen Match-/Animations-/Gerätetests ausgeführt. Vorhandene WebGL-Bilder belegen den bisherigen Look, nicht den Zielstil.

Die künftige Abnahme folgt [Kompatibilität](kompatibilitaet.md): bestehender Clipkatalog und aktive prozedurale Posen, Fuß-/Hand-/Keeperkontakte, beide Spielrichtungen, Pause/Rückschau/Neuladen, alle betroffenen Kameras, mehrere Vereinsstadien, normal/reduced, echte WebGL-Laufzeit und native Ereignis-/Ergebnisparität.

Offen waren bei Fables Prüfung die fertige Übergabe von R21, die direkte Binärprüfung des Namens in `WorldPlayer.asset`, die Rolle von `image-2` und die nachgemessene Skalierungsbeziehung zur Feldgeometrie. Diese Punkte sind Import-/Übernahmeprüfungen für Opus und kein Anlass, den geeigneten Assetbestand neu zu erzeugen.
