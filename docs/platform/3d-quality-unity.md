# Unity: Vereinsstadien und Zweikampfqualität

Stand: 9. Oktober 2026. Lokaler Kandidat auf Release 114, keine Veröffentlichung. Die Simulation, Spielstände, Vereinsstärken und Zufallsfolge bleiben beim bisherigen nativen Match. Dieses Paket erweitert ausschließlich dessen Unity-Darstellung.

## Umgesetzt

`StadiumArchitecture.cs` baut aus den bereits geprüften 48 Vereinsprofilen acht unterschiedliche Stadiontypen. Sitzreihen, gestufte Tribünen, Dächer, Stützen, Fassaden, Eckbauten, Beleuchtung und Umgebung unterscheiden sich strukturell. Dazu gehören Stadtblöcke, Werksbauten, Hafenkräne und Wasser, Bäume oder Hangformen. Die Auswahl erfolgt über den tatsächlichen Heimverein in `WorldConfig.teams[].home`; eine unbekannte ID erhält den dokumentierten neutralen Rückfall. Stadiongröße hat keine Wirkung auf Einnahmen oder Spielregeln.

Meshes werden je Tribünenseite und Material zusammengefasst. Die reduzierte Stufe behält die Grundarchitektur, Dachanordnung und Zuschauerreihen, lässt feine Träger und Umgebungsteile weg. Die Kameraausblendung berücksichtigt die innere Grenze von Dachüberständen und Lichtleisten mit Hysterese. Dachstützen stehen hinter dem Sicherheitsabstand. Rasenmuster und Abnutzung variieren mit dem Stadion; Vertexschattierung und bestehende URP-Licht-/Materialpfade bleiben kompatibel. Neue Meshes und Texturen werden als eigene Darstellungsressourcen entsorgt.

Die empfangenen Aktionen `slide` und `slideRecovery` wählen eine prozedurale Grätsche beziehungsweise deren Aufstehen. Das Rig senkt und neigt den Körper, streckt das ballseitige Bein, faltet das andere und stützt einen Arm. Beinlängen bleiben begrenzt; ein unerreichbares Kontaktziel wird nicht herangezogen. Kniepole halten die Knie oberhalb des Rasens. Während des Einblendens bleiben beide Schuhe an der gemessenen Bodenhöhe des tatsächlichen WorldPlayer-Meshes. Die Pose verändert weder Actorroot noch Ball oder Kontaktentscheidung.

Ein stehender `tackle` erhält Ausfallschritt und ballseitigen Fußkontakt. Der vorhandene `foul_stumble_meshy` zeigt den Foulverursacher im aufrechten Zeitfenster und blendet zurück in den Stand. `keeper_shuffle_meshy` zeigt beobachtete seitliche Torwartbewegung; die Gegenrichtung verwendet den umgekehrten Clip. Die beiden bereits vorhandenen Clips wurden im Probe-Szenenaufbau angebunden. Carrier-Stride-IK greift nur bei normaler Fortbewegung, damit ein gerade erfolgreicher Grätschender seine Erholung auch als neuer Ballbesitzer behält.

Fortschritt und Clipzeit stammen aus den empfangenen Bildern. Keine neue lokale Aktionsuhr, Animationsevents als Spielregeln oder bezahlte Assetgenerierung. Pause und Rückschau behalten dieselbe Pose.

## Tatsächliche Nachweise

- `D6Cli.Tests` bestand mit Unity **6000.6.4f1**. Neben den bisherigen sieben Fußball-/WorldView-Suiten bestanden **396 Profilprüfungen**, **560 Architekturprüfungen** und **34 Zweikampfprüfungen**. [Gesamtlauf](../../outputs/3d-quality/unity/tests-final-2.log).
- Die Architektursuite baut alle 48 Vereine, prüft ihre unterschiedlichen Struktursignaturen, Meshattribute, Heimvereinsauswahl, reduzierte Stufe, unbekannte IDs sowie **10.800 Sichtlinien** der fünf Kameras bei mehreren Balllagen und Entfernungen. Gemessen: 2.886–18.452 Architekturtriangles und 29–51 Architekturrenderer; reduziert 1.614–8.462 Triangles. Dies sind Geometriebudgets, keine gemessenen Frameraten. [Architekturbericht](../../outputs/3d-quality/unity/stadium-architecture-tests.json).
- Die Zweikampfsuite verwendet das echte `WorldPlayer.asset`, Clipgraph und den tatsächlichen `WorldFootballPose`-Selektor. Erreichbare sowie hinter/außerhalb liegende Ziele, linkes/rechtes Bein, Rootkonstanz, Pause, Rückschau, erfolgreiche Grätsche mit sofortigem Ballbesitz, Foulverursacher und Torwartnachstellen wurden ausgeführt. Zwanzig Eintrittsphasen prüfen die gebackenen Schuhvertices; tiefste Schuhsohle −0,029 m bei der festgelegten 0,035-m-Toleranz. [Rigbericht](../../outputs/3d-quality/unity/duel-tests.json).
- `D6Cli.Evidence` erzeugte **48 PNGs** unter Direct3D 11: acht Stadiontypen mit drei Kameras, die moderne Arena mit allen fünf Kameras, reduzierte Arena und zehn Zweikampfphasen jeweils von vorn und der Seite samt Kontaktbogen. Quelle und Shader sind tatsächlich in Unity gerendert. [Renderliste mit Quellkennung](../../outputs/3d-quality/unity/renders/renders.json), [Grätschenbogen](../../outputs/3d-quality/unity/renders/duel-sheet-side.png), [früher Eintritt von vorn](../../outputs/3d-quality/unity/renders/duel-01-slide-0,12-front.png).
- `D6Cli.WebBuild` bestand: **90.653.329 Bytes**, 157,6 Sekunden, **0 Fehler und 3 bekannte Warnungen** (veraltetes `endFrameRendering` zweimal, `RuntimePipelineConfig` einmal). [Buildlog](../../outputs/3d-quality/unity/web-build.log), [Manifest](../../outputs/platform/unity-web/probe-build.json). Quellkennung **`959aea1e62482d85aff5d6c7d1d001f23bb64097f6497fe1389f5cb444128b93`** stimmt mit den aktuell gelesenen Quellbytes, allen 30 Manifestquellen, vier Builddateien und 48 Renderdateien überein. [Hashprüfung](../../outputs/3d-quality/unity/identity-validation.json).

Die Diagnostik nimmt mehrere Posen innerhalb eines Editorframes auf. Unity kann GPU-Skinning innerhalb desselben Frames zwischenspeichern. Deshalb backt sie vor jeder Aufnahme den aktuellen WorldPlayer-Mesh aus den tatsächlich gesampelten Bones und rendert ihn mit denselben Materialien und Transformen. Diese Bilder sind ein Nachweis der Pose und Materialien unter Direct3D 11, **kein eigener Nachweis des laufenden WebGL-GPU-Skinnings**. Diesen prüft die anschließende Browserabnahme.

## Reproduzieren

Vom aktuellen Worktree mit geschlossenem interaktivem Editor; keine ungespeicherten Benutzerszenen schließen:

```powershell
node prototypes/match-engine-unity/generate-identity.cjs
node prototypes/match-engine-unity/sync-unity.cjs --base e630ebc
unity run "G:/unity/My project" -- -nographics -executeMethod D6Cli.Setup -d6repo "<Worktree>" -logFile "<Worktree>/outputs/3d-quality/unity/setup.log"
unity run "G:/unity/My project" -- -nographics -executeMethod D6Cli.Tests -d6repo "<Worktree>" -logFile "<Worktree>/outputs/3d-quality/unity/tests.log"
unity run "G:/unity/My project" -- -executeMethod D6Cli.Evidence -d6repo "<Worktree>" -logFile "<Worktree>/outputs/3d-quality/unity/renders.log"
unity run "G:/unity/My project" -- -executeMethod D6Cli.WebBuild -d6repo "<Worktree>" -logFile "<Worktree>/outputs/3d-quality/unity/web-build.log"
node prototypes/match-engine-unity/build-manifest.cjs
```

Der geschützte Sync überschreibt keine fremden Projektänderungen. `Setup` ergänzt die vorhandenen Szenenreferenzen; keine Änderung an Originalclips, Paketen oder Spielständen. Evidence und WebBuild verwenden den vorgesehenen URP-Web-Pipelinepfad und setzen ihn anschließend zurück. Der WebGL-Kandidat liegt ausschließlich in `outputs/platform/unity-web/`.

## Grenzen und Folgearbeit

Keine Smartphone-, Touchgeräte-, Energie- oder GPU-Frameratenmessung. Die reduzierte Geometrie und Kameras sind geprüft, reale Geräte bleiben eigene Abnahme. Weitere im [A02-Audit](animation-quality-audit.md) festgehaltene Luft-/Einwurf-/Landungs- und Keeper-Verteilungssequenzen sind keine abgeschlossene Arbeit dieses Pakets. Neue Stadionassets sind lokale parametrische Geometrie; die Darstellung bleibt stilisiert. Ergebnisneutralität der nativen Brücke gehört zum [separaten Nachweis](native-slide-presentation.md).

Der WebGL-Kandidat ist fertig und eingefroren. Die anschließende [Browserabnahme des Integrators](3d-quality-validation.md) bestand mit vollständigen Matchvergleichen und zusätzlich sichtbarer nativer Grätsche/Erholung im normalen WebGL-Skinning. Die oben genannten Editorbilder bleiben davon getrennt; reale Geräte und vollständige Variantenabnahme bleiben offen.
