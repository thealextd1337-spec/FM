# Klares Low-Poly: Vorbereitung der Bodenkorrektur (nur Quellen)

Stand 13. Oktober 2026, Opus 5.5, Runde 2. Branch `codex/demo-low-poly-fix-20261013` im Checkout `work/demo-low-poly-fix`, Basis `d8ae8785`. **Nur Quellstand, nicht in Unity geprüft, nicht gebaut, kein abgenommener Low-Poly-Stand.** Der eingefrorene Kandidat `d8ae8785` (Quellkennung `46a6e081…`, Server 4412) und sein WebGL-Paket bleiben unverändert; die neue Quellkennung gehört zu keinem vorhandenen Build. Grundlage: Fable-Diagnose `outputs/style-demos-20261013/fable-r1/diagnosis.md` (Empfehlung A).

## Problem und Entscheidung

Die R18-Sperre `r15/plant-edge@120Hz/receive 11.158 entry root-relative joint speed deg/s` steigt mit dem Low-Poly-Skin von `2102.81884765625` auf `2103.8837890625`, weil `FootballGround` Standsohle, Clipversätze (`Of(clip)`), Sohlenkontur und den Laufzeit-Bake des Foul-/Keeperstands am **geladenen** Skin misst. Damit hängt die Bewegung vom gezeichneten Mesh ab (Fable: 643/2020 Grundgates verschoben, alle anderen Sätze ebenso).

Umgesetzt ist Fables Option A in der engsten Form: Ein sichtbarer Ersatzskin bekommt pro Akteur einen nicht gezeichneten **Bodenskin** mit `WorldPlayer.asset` an denselben Knochen. Alle Bodenmessungen lesen nur ihn; die gezeichnete Figur bleibt `WorldPlayerLowPoly-v4`. Ohne Bodenskin (Originalmesh, alte Szene, Suiten mit dem Prefab-Mesh) läuft exakt der bisherige Codepfad. Clips, Knochen, Bindposes, Ereigniszeiten, Kontaktziele, Rootmotion, Timer, Testgrenzen und Shader sind unverändert. Option B (Schuh bitgenau erhalten) und C (persistierte Profile) wurden verworfen: B kostet Dreiecke und muss nach jeder Meshänderung neu bewiesen werden, C ändert die Messarchitektur aller Diagnosen.

## Änderungen

| Datei | Änderung |
| --- | --- |
| `FootballAnimation.cs` (`FootballGround`) | `GroundSkinName="d6-ground"`, `IsGroundSkin`, `GroundSkin(actor)`; private `MeasuredSkin`/`Skins(actor,drawn)`. Profilschlüssel (Konstruktor), Konturname, Lesbarkeitsprüfung und Konturmessung in `MeasureSolePoints` sowie `LowestVertex` nutzen den Bodenskin, sonst wie bisher den ersten bzw. alle Skins. Neu `VisibleLowestVertex` (nur gezeichnete Skins). `AttachGroundSkin(actor, ground)`: idempotent; legt nur bei genau einem gezeichneten Skin mit anderem Mesh als `ground` ein Kind an (gleicher Elternteil, gleiche lokale Transformation, gleiche Ebene, dieselben Knochen-Transforms, `rootBone`, `quality`; `enabled=false`, keine Materialien, kein Schatten, keine Motion Vectors); entfernt es wieder, wenn der gezeichnete Skin das Bodenmesh zeigt; verweigert ein Bodenmesh mit anderen Bindposes (Prüfung einmal je Meshpaar). |
| `WorldViewBridge.cs` | Serialisiertes Feld `groundPlayerMesh` (hält `WorldPlayer.asset` im Build); `WorldGround(go)` hängt den Bodenskin an; Konsolenzeile `[D6] match mesh …` endet auf `ground=<Name> vertices=<n>` bzw. `ground=drawn`. |
| `ProbeBridge.cs` | `BuildWorld` ruft `WorldGround(go)` **nach** der Materialschleife und vor Animator/Graph/`FootballAnimation`: die Materialschleife sieht den Bodenskin nicht. |
| `WorldViewEnvironment.cs` | Schattenschalter der Akteure überspringt den Bodenskin. |
| `WorldViewSetup.cs` | setzt `groundPlayerMesh` = `WorldPlayer.asset` (Originalpfad: gleiches Mesh, kein Bodenskin). |
| `LowPolySetup.cs` | `Assign` setzt immer `groundPlayerMesh=WorldPlayer.asset`; `GroundMesh()` verweigert eine Szene mit Ersatzmesh ohne Bodenmesh (kein stiller Rückfall in Tests); `Skin(actor)` skinnt Testakteure wie die Laufzeit. |
| `FootballDuelTests`, `FootballIterationTests`, `FootballKeeperTests`, `FootballPresentation119Tests`, `NaturalMotionDiagnostics.Clips` | `LowPolySetup.Skin(actor)` statt der Schleife mit `MatchMesh()`. `LowestBoot` (Duel, Iteration) misst nur gezeichnete Stiefel. |
| `NaturalMotionDiagnostics.cs` | `s.sole` = `VisibleLowestVertex` (gezeichneter Skin); neu `s.groundSole` und Tracespalte `groundSole` (Bodenskin, `-9` ohne Bodenskin); `LowestBone` nur gezeichnet; Vertexdetail der Kontur nur ohne Bodenskin (Indizes gehören zum Bodenmesh). |
| `LowPolyDiagnostics.cs` | Zensus zählt Bodenskins getrennt (`groundSkins`, `groundSkinsEnabled`, `groundMesh`); Spieler-/Dreieckssummen nur gezeichnet. |
| `LowPolyGroundDiagnostics.cs` (neu, Editor) + `D6Cli.LowPolyGround` | gezielte Prüfung, siehe unten. |
| `ProbeBuildIdentity.cs`, `source-identity.json` | neu erzeugt: `644d9d928be9ea9d3ccd36f7049bbea40a333f9c5cd999dbddcbe5c9cd0211c9`, 46 Quellen (Liste unverändert). |

Erfassung: Alle buildrelevanten geänderten Dateien stehen bereits in `generate-identity.cjs` und in `build-manifest.cjs` (`D6Cli.cs` nur im Manifest, wie bisher). Die neue Diagnose folgt der bestehenden Regel für Tests/Diagnosen (weder Quellkennung noch Manifest) und landet über `sync-unity.cjs` im Ordner `Editor` (Regex `Diagnostics.cs`). Keine neuen Assets: `WorldPlayer.asset` existiert im Projekt und wird jetzt über die Szene referenziert. Kein CHANGELOG-Eintrag, weil die Änderung noch nicht geprüft ist.

## Originalpfad unverändert (statisch begründet)

Ohne Bodenskin gilt: `MeasuredSkin` = `GetComponentInChildren<SkinnedMeshRenderer>()` wie zuvor; `Skins(…,false)` = alle Skins in derselben Reihenfolge (`GetComponentsInChildren(List)`); die Schleife in `LowestVertex` ist zeichengleich; `AttachGroundSkin` legt nichts an, wenn `groundPlayerMesh` null ist oder dem Matchmesh gleicht; die Testhelfer setzen dasselbe Mesh wie zuvor. Die einzigen Ausgabeunterschiede im Originallauf sind die zusätzliche Tracespalte `groundSole` (durchgehend `-9`) und der Konsolenzusatz `ground=drawn`. Der Beweis im Lauf ist `Tests` mit `-d6mesh original` gegen `tests-original` (alle Sätze `differing 0`).

## Grenze: maßgeblicher Boden gegenüber sichtbarer Oberfläche

| Messung | liest | Grund |
| --- | --- | --- |
| Standsohle, `RootHeight`, `Of(clip)`, Gangmaße, Kontur, Laufzeit-Bake `turfStand`, `MeasuredSole`, `turf-bake-ms` | Bodenskin | Bewegung und Kosten wie Release 130 |
| NaturalMotion `s.sole` und daraus: `skinned sole lowest (m)` (≥ −0,02), `skinned sole, highest lowest vertex (m)` (≤ 0,05), `sole below turf frames` (= 0, unter −1 cm), `…/locomotion sole below turf frames`, `…/whole lowest sole incl. actions and contact pictures m` (≥ −`SoleTolerance` 0,02), R20-Countdown `… lowest sole m`, Supportproben `soleMin/soleBelow`, Tracespalte `sole` | gezeichneter Skin | echte Sichtprüfung des Low-Poly-Fußes; Grenzen unverändert |
| `LowestBoot` (Duel: Offender-Stiefel ±2/5 cm; Iteration: Luft/Landung) | gezeichneter Skin | sichtbare Stiefel |
| Bild-Captures (Evidence-, SmallView-, LowPoly-, NaturalMotion-Renderings) | gezeichneter Skin | überspringen deaktivierte Skins bereits |
| Glide, Burst, Supportfreiheit, Kontaktfehler, Gelenkgeschwindigkeiten, R15/R18/R20/R21-Bewegungsgates | Rig/Kontur (Boden) | müssen bitgleich zu `tests-original` werden |

Erwartung nach dem Unity-Lauf: Alle Bewegungs- und Kontaktgates gleichen `tests-original` exakt, die Sperre ist wieder `2102.81884765625`. Nur die oben als sichtbar markierten Sohlengates dürfen abweichen; sie messen ehrlich den gezeichneten Low-Poly-Fuß bei Original-Bewegung (Fable: bis ≈ 2–4 mm in gerollten Posen) und behalten ihre Grenzen. Eine Verletzung dort ist ein echter Befund am Mesh, kein Anlass zur Lockerung. `FootballGaitTests` und `FootballClipDiagnostics` skinnen ihren Akteur nicht um und messen wie bisher nur das Prefab-Mesh.

## Neue Prüfung `D6Cli.LowPolyGround`

`LowPolyGroundDiagnostics` baut aus `bridge.playerPrefab` und `FootballClips()` drei Akteure wie `BuildWorld` (Release, Kandidat mit Bodenskin, Legacy = `d8ae8785`-Pfad) und leert vor jedem den Profilcache, damit jedes Profil frisch gemessen wird. Pflicht (sonst `FAILED`): Szene referenziert `WorldPlayer.asset` (auch als gespeicherte Szenenabhängigkeit), Matchmesh ist `WorldPlayerLowPoly-v4`; genau ein deaktivierter, materialloser Bodenskin mit Elternteil/Transformation/Ebene/Knochen/Root/Qualität des gezeichneten Skins, ohne Knochen darunter; erneutes Anhängen wiederverwendet ihn; Wechsel Original→Low-Poly→Original legt ihn an und entfernt ihn; fremdes Rig wird verweigert; deaktivierter Bake = aktivierter Bake = Release-Bake (bitgleich); alle Profilwerte (Sohle, Knöchel, Zeh, Kontur, je Clip Offset, Brustversatz, Gang, 2×48 Freiheiten) bitgleich zum Release; in 14 Clips × 24 Zeiten plus 6 Grätschenposen Knochen, `GroundShift`, `TurfShift` und Bodenmessung bitgleich; zwei echte `WorldCommand`-Loads mit je einem deaktivierten Bodenskin und einem aktiven Renderer pro Akteur. Berichtet: `Of(walking)` für Release/Kandidat/Legacy (Fable erwartet Legacy − Release ≈ 4,5·10⁻⁵ m; das wäre die erste direkte Messung), Legacy-Abweichungen, sichtbare Sohle je Pose gegen die bestehenden Grenzen (Verletzung nur des Kandidaten = `FAILED`; verletzt auch der Release-Skin dieselbe Clipprobe, wird das getrennt als `releaseAlsoViolates` geführt), Stiefel- und Handschuhabweichung gezeichnet↔Boden, Handschuhabstand zum gehaltenen Ball. Ausgabe `outputs/style-demos/lowpoly-fix/unity/lowpoly-ground.json`. Clipproben ersetzen nicht die nativen Gates.

## Unbekannt bis zum Unity-Lauf

- `BakeMesh` an einem deaktivierten `SkinnedMeshRenderer` (Unity-Verhalten erwartet, hier nicht belegt; direkt geprüft). Ausweg falls nein: aktiv mit `forceRenderingOff`, Kosten dann messen.
- `GetComponentsInChildren` liefert deaktivierte Komponenten (erwartet; sonst findet `GroundSkin` nichts und die Prüfung schlägt an, kein stiller Erfolg).
- Kein Skinning-/Speicheraufwand eines deaktivierten Skins pro Bild (Profiler/WebGL-Messung offen); Download wächst um `WorldPlayer.asset` (Größe nach dem Build messen); Draw Calls sollen gleich bleiben (129/130 laut Fable).
- `SceneManager.MoveGameObjectToScene` vor `SetParent` in Preview-Szenen der Suiten.
- Sichtbare Low-Poly-Sohle bei Original-Bewegung gegen die Grenzen −1/−2 cm.

## Risiken

Niedrig bis mittel. Namensbasierte Erkennung `d6-ground` (kollidiert mit keinem Bestandsnamen). Der Laufzeit-Bake liest wieder 9.725 statt 6.926 Vertices (Release-Kosten). Diagnosen/Werkzeuge außerhalb dieses Branches, die alle Skins eines Akteurs zählen, sehen einen zweiten (deaktivierten) Skin. Die alte Szene im Projekt hat das Feld noch nicht: bis `MatchMesh -d6mesh lowpoly` erneut läuft, misst die Laufzeit am Low-Poly-Skin (`ground=drawn` in der Konsole) und die Suiten verweigern den Lauf.

## Statische Prüfungen dieser Runde

- C#-Kompilat mit Unitys Roslyn (`Editor/Data/DotNetSdk`) gegen Unity-6000.6.4f1-Referenzen und die URP/Core-Skriptassemblies des Low-Poly-Projekts (nur gelesen): Basis `d8ae8785` und Korrektur je Editor-Assembly (alle 53/54 Quellen, `UNITY_EDITOR`) und Player-Assembly (20 Laufzeitquellen, `UNITY_WEBGL`) **0 Fehler**; einzige neue Warnungen zwei `CS0618` (`FindFirstObjectByType`, wie im Bestand). Skript und Logs unter `outputs/style-demos/lowpoly-fix-preparation/`.
- Quellkennung zweimal erzeugt, identisch; Sync-Ziele per Regel aus `sync-unity.cjs` ausgewertet (kein Sync ausgeführt).
- Keine Unity-, Editor-, GPU-, Browser- oder Buildläufe; keine Tests als bestanden behauptet.

## Nächster Unity-Lauf (Root, nach Sonnets Abschluss)

Voraussetzungen: Sonnet-Browserlauf beendet; kein Editor auf `G:/unity/Doppel6-LowPoly-Demo`; Validierungs-Checkout auf diesem Commit; ignorierte Eingabe `outputs/platform/world-unity/contract-fixture.json` (SHA-256 `73ca92d6fdfb36f14fdb6277493c91dffcee6e4b45c707dae440227fc47022f2`, im Root und in `work/demo-low-poly` vorhanden) in den Checkout kopieren. Node 24: `C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`. Aus dem Checkout `work/demo-low-poly-fix`:

```sh
NODE=C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe
mkdir -p outputs/platform/world-unity && cp ../../outputs/platform/world-unity/contract-fixture.json outputs/platform/world-unity/
# Projektkopie trägt d8ae8785: einmalig mit expliziter Basis synchronisieren (bricht bei Fremdänderungen ab)
"$NODE" prototypes/match-engine-unity/sync-unity.cjs "G:/unity/Doppel6-LowPoly-Demo" --base d8ae8785
# danach seriell, Skript erzwingt -projectPath G:/unity/Doppel6-LowPoly-Demo und -d6repo dieses Checkouts
work/platform/qa/lowpoly-unity.sh 40-ping Ping
work/platform/qa/lowpoly-unity.sh 41-matchmesh-original MatchMesh -d6mesh original
work/platform/qa/lowpoly-unity.sh 42-tests-original-fix Tests -d6output outputs/style-demos/lowpoly-fix/tests-original-fix
work/platform/qa/lowpoly-unity.sh 43-matchmesh-lowpoly MatchMesh -d6mesh lowpoly
work/platform/qa/lowpoly-unity.sh 44-lowpoly-ground LowPolyGround -d6output outputs/style-demos/lowpoly-fix/unity
work/platform/qa/lowpoly-unity.sh 45-tests-v4-ground Tests -d6output outputs/style-demos/lowpoly-fix/tests-v4-ground
"$NODE" ../../outputs/style-demos-20261013/fable-r1/compare-motion-reports.cjs . ../demo-low-poly/outputs/style-demos/lowpoly/tests-original/natural-motion-gates outputs/style-demos/lowpoly-fix/tests-original-fix/natural-motion-gates
"$NODE" ../../outputs/style-demos-20261013/fable-r1/compare-motion-reports.cjs . ../demo-low-poly/outputs/style-demos/lowpoly/tests-original/natural-motion-gates outputs/style-demos/lowpoly-fix/tests-v4-ground/natural-motion-gates
```

`tests-original` (Log 10) entstand vor einigen Low-Poly-Commits; Fable nutzt es als Bewegungsbasis. Weicht 42 dort ab, zuerst gegen einen frischen Originallauf aus `d8ae8785` vergleichen, bevor ein Fehler der Korrektur angenommen wird. Erwartet: 41/42 Originalpfad `differing 0` in allen Sätzen; 43 meldet `ground=D6 kit rest coordinates`; 44 `failed=0`, Profil `0/… differ`, alle Posen exakt; 45 alle Suiten grün, Sperre `2102.81884765625`, Abweichungen nur in den sichtbaren Sohlengates der Tabelle. Danach mit Grafikgerät `NaturalMotion` (Rendering, sichtbare Füße), `KeeperEvidence`, `LowPoly` (vier Architekturtypen), `WebBuild` → `build-manifest.cjs` → Paket `--style lowpoly` → Browser (Konsolenzeile mit `ground=`, Draw Calls, Download, Bildzeit). Projektpfad nie `G:/unity/My project` oder die Nighttime-Kopie; keine historischen Runner mit festen Pfaden.
