# Klares Low-Poly: Unity-Validierung und Build der Bodenkorrektur

Stand 13. Oktober 2026, Opus 5.5, Runde 3. Branch `codex/demo-low-poly-fix-20261013` im Checkout `work/demo-low-poly-fix`, Unity-Projekt `G:/unity/Doppel6-LowPoly-Demo` (6000.6.4f1). Quellstand und Begründung: [Vorbereitung](low-poly-ground-fix-preparation.md) (Runde 2, historisch; dort steht „47“ Identitätsdateien für den alten Kandidaten, richtig sind 46). Ergebnisse sind Claims; die abschließende Browserabnahme macht Root/Sonnet. Der eingefrorene Kandidat `d8ae8785` (Quellkennung `46a6e081…`, Server 4412) und sein Paket blieben unberührt.

**Ergebnis:** Die Korrektur funktioniert in Unity ohne Quelländerung gegenüber `e7754f4c`. Mit dem Low-Poly-Mesh sind alle 4.001 Bewegungs-, Support-, Kontakt-, Kontinuitäts-, R15-, R20- und Determinismusgates bitgleich zum Originallauf; die R18-Sperre steht wieder exakt auf `2102.81884765625`. Keine Grenze wurde verändert. Sichtbare Low-Poly-Sohlen werden weiter am gezeichneten Skin gemessen und bestehen dieselben Grenzen.

## Ablauf

Alle Unity-Läufe seriell über `work/platform/qa/lowpoly-unity.sh` (fester Projektpfad `G:/unity/Doppel6-LowPoly-Demo`, Lockprüfung, Sync vor jedem Lauf, `-d6repo` = dieser Checkout). Kein Editor war auf dem Projekt offen (`Temp/` fehlte). Andere Unity-Prozesse auf dem Rechner wurden nicht angefasst. Logs: `outputs/style-demos/lowpoly/logs/40…49-*.log` in diesem Checkout.

| Schritt | Ergebnis |
| --- | --- |
| `sync-unity.cjs G:/unity/Doppel6-LowPoly-Demo --base d8ae8785` | 15 Dateien kopiert (genau die geänderten Quellen), 0 Konflikte |
| 40 `Ping` | kompiliert, 0 Fehler |
| 41 `MatchMesh -d6mesh original` | `match mesh=WorldPlayer ground=WorldPlayer`, 9.725/12.668, Hash `2fef7351…` |
| 42 `Tests` (Original) | OK; siehe Vergleich |
| 43 `MatchMesh -d6mesh lowpoly` | `match mesh=WorldPlayerLowPoly-v4 ground=WorldPlayer`, 6.926/2.592, Hash `4f4c3945…`; `Probe.unity` serialisiert `matchPlayerMesh` (GUID `a279102b…`) und `groundPlayerMesh` (GUID `adb35185…` = `WorldPlayer.asset`) |
| 44 `LowPolyGround` | OK, 25/25 Pflichtprüfungen |
| 45 `Tests` (Low-Poly + Bodenskin) | OK; siehe Vergleich |
| 46 `NaturalMotion` (Gates erzwungen, mit Rendering) | OK, alle Gates wie 45, 55 Bilder + 84 GIFs |
| 47 `KeeperEvidence` | OK, 162 Renderings, 144 Messbilder |
| 48 `LowPoly` (Stilnachweis gegen Release-130-Basis) | OK, 79 Bilder, 16 Szenen, 79 Vergleiche |
| 49 `WebBuild` | siehe Build |
| 50 `LowPolyGround` (erweitert um szenenweite Leckprüfung) | OK, 28/28 Pflichtprüfungen, übrige Werte wie 44 |

## Originalpfad unverändert (41/42)

Unabhängiger Vergleich `outputs/style-demos/lowpoly-fix/tools/compare-test-reports.cjs` (vergleicht jede JSON-Datei rekursiv und die Gatesätze von `natural-motion.json` als Namensmengen: fehlend, zusätzlich, doppelt, Wert, `passed`, Grenze). Basis: alter Originallauf `work/demo-low-poly/outputs/style-demos/lowpoly/tests-original` (nur gelesen).

- Alle Gatesätze: gleiche Anzahl und Namen, **0** Wert-/`passed`-/Grenzabweichungen (determinism 2, gates 2.020, support 675, contact 285, continuity 20, r15 342, r20 642, r20Checks 15, r21 0).
- Übrige Abweichungen nur Wanduhrzeiten (`turf-bake-ms`, µs je Fußlösung) und die neue Tracespalte `groundSole` (ohne Bodenskin durchgehend `-9`). Bericht: `outputs/style-demos/lowpoly-fix/compare/old-original-vs-fix-original.json`.

## Bodenskin direkt geprüft (44 `LowPolyGround`)

`outputs/style-demos/lowpoly-fix/unity/lowpoly-ground.json`. Alle Pflichtprüfungen bestanden (Lauf 44: 25, Lauf 50 mit szenenweiter Leckprüfung: 28), u. a.:

- Szene referenziert `WorldPlayer.asset` als Bodenmesh, auch als gespeicherte Szenenabhängigkeit (Voraussetzung, dass es im WebGL-Build bleibt); Matchmesh ist `WorldPlayerLowPoly-v4`.
- Genau ein Bodenskin je Akteur: deaktiviert, keine Materialien, kein Schatten, keine Motion Vectors; gleicher Elternteil, Transformation, Ebene, dieselben 28 Knochen-Transforms, `rootBone` und Qualität; keine Knochen darunter; Bindposes identisch.
- Lebenszyklus: erneutes Anhängen nutzt ihn wieder; Original → Low-Poly → Original legt ihn an und entfernt ihn; ein Bodenmesh auf fremdem Rig wird verweigert.
- **Deaktivierter Skin bakt bitgleich wie aktivierter und wie der Release-Skin** (offener Punkt aus Runde 2, jetzt belegt).
- Profil (Sohle, Knöchel, Zeh, Kontur, je Clip Versatz/Brust/Gang, Freiheiten): **0/3.231 Werte abweichend** zum Release; Legacy-Pfad (`d8ae8785`) 13 abweichend.
- 342 Posen (14 Clips × 24 Zeiten, 6 Grätschenposen): Knochen, `GroundShift`, `TurfShift` und Bodenmessung **342/342 bitgleich** zum Release-Akteur.
- Zwei echte `WorldCommand`-Loads: je 12 Akteure, 12 deaktivierte Bodenskins, 12 aktive Renderer.
- **Fables Mechanismus jetzt direkt gemessen:** `Of(walking)` Release = Kandidat = `0.06938185`, Legacy `0.0693369359` (Δ = 4,49·10⁻⁵ m, wie gefolgert). Legacy wich außerdem bei `pass_inside`, `keeper_high`, `sprint_forward`, `run_fast6`, `back_left`, `turn_idle_left`, `turn_walk_left`, `celebrate_fist`, `foul_fall`, `keeper_shuffle` und in der Konturpunktzahl (77 statt 119/129) ab; Legacy-Knochen max. 1,8 mm (`keeper_shuffle`, Kopf).

Sichtbare Oberfläche (Clipproben, gezeichneter Low-Poly-Skin): 0 Verletzungen nur des Kandidaten. **Eine Probe verletzt die Grenze bei beiden Meshes** und wird als `releaseAlsoViolates` geführt: `slide right 1,00` (statische Grätschenpose mit voller Gewichtung auf `sprint_forward`), gezeichnete Sohle −6,45 cm, Release-Skin −6,16 cm, Grenze −2 cm. Das ist eine Eigenschaft der geschnittenen Diagnosepose, die auch das Original zeigt; die maßgeblichen nativen Grätschenbilder liegen in Duel-/NaturalMotion-Gates (bestanden). Der Low-Poly-Fuß liegt dort 2,9 mm tiefer als der Originalfuß. Sohlenabweichung gezeichnet ↔ Release über alle Posen −6,3 … +5,1 mm; tiefster Stiefelpunkt je Fuß gegenüber dem Bodenskin −1,4 … +5,1 mm (Median 0). Die ausgewiesene „Stiefelabweichung“ von ≈ 4,4 cm ist über alle Posen konstant und stammt aus unterschiedlicher Knochengruppenzugehörigkeit der Vertices beider Meshes (Hauptgewicht Fuß/Zeh), nicht aus der Form. Handschuhabstand zum gehaltenen Ball gezeichnet vs. Release: Unterschiede ≤ 4 mm.

## Low-Poly mit Bodenskin (45)

Vergleich gegen den alten Originallauf und gegen 42 (`compare/old-original-vs-fix-v4.json`, `compare/fix-original-vs-fix-v4.json`):

| Satz | Anzahl | Abweichungen | fehlgeschlagen |
| --- | --- | --- | --- |
| determinism | 2 | 0 | 0 |
| gates | 2.020 | 0 | 0 |
| supportGates | 675 | 0 | 0 |
| contactGates | 285 | 0 | 0 |
| continuityGates | 20 | 0 | 0 |
| r15Gates | 342 | 0 | 1 (historisches 1600-Gate, wie Original; `r15BeyondR18=0`) |
| r20Gates / r20Checks | 642 / 15 | 0 / 0 | 0 |
| r21Gates | 0 | – | – |

- **R18-Sperre:** `r15/plant-edge@120Hz/receive 11.158 entry root-relative joint speed deg/s` = `2102.81884765625` (alter Low-Poly-Stand `2103.8837890625`). Grenze 1600 und Sperrtoleranz 1e-4 unverändert; das 1600-Gate scheitert historisch auch im Original.
- Gezählte R21-Gates sind 0 in beiden Berichten; die R21-Prüfung liegt in der Duel-Suite (43/43 bestanden).
- Suiten: Stadium 706, Duel 43, Iteration 106, Keeper 160, Presentation119 437, Football/Locomotion/Momentum/Action/Motion/WorldView/Gait/ClubStadiumProfiles bestanden.
- **Sichtbare Messungen (dürfen abweichen, gleiche Grenzen):** Tracespalte `sole` (gezeichneter Skin) weicht in 97 von 106 Traces ab, alle anderen Tracespalten (Knochen, Gelenke, Knöchel, Kontakt) und alle `peaks` sind bitgleich. Fallweise `soleMin` Low-Poly − Original −0,26 … +3,2 mm; das Minimum über alle Fälle ist bei beiden gleich (Fortbewegung −3,93 mm, Aktionen −3,18 mm; Grenzen −10/−20 mm). Die 106 Gates „lowest sole incl. actions and contact pictures“ messen das Minimum aus Bodenkontur und gezeichnetem Skin und bleiben bitgleich, weil die Kontur bzw. ein gleicher Standvertex das Minimum bestimmt (7 Fenster in beiden Läufen am Skin). Alle 492 Gates „sole below turf frames“ (gezeichneter Skin, unter −1 cm) = 0.
- Duel: sichtbarer Offender-Stiefel −3,3 → −2,7 cm (Prüfung „boots stay on the turf“ bestanden), Hüfte gleich. Iteration: `lowestBoot` ≤ 0,2 mm anders, Hüfte gleich. Keeper/Presentation: identisch.
- Laufzeit-Bake des Foul-/Keeperstands: 0,610 ms (Original 0,606 ms, alter Low-Poly-Stand 0,420 ms) – er bakt wieder das Release-Mesh, also wieder Release-Kosten.

## Grafiknachweise (46–48)

- **NaturalMotion** (`outputs/style-demos/lowpoly-fix/motion/lowpoly-ground/`): Fuß-Nahaufnahmen Annahme, Pass, Schuss, Rückwärtsstopp (abrollender Schuh), Keeper-Shuffle, Richtungen Gehen/Joggen/Sprint, Kurven, Stopps; 84 GIFs. Angesehen: Annahme-, Schuss-, Rückwärtsstopp-Nahaufnahme und Keeper-Shuffle – Sohlen stehen auf dem Rasen, kein sichtbares Einsinken oder Schweben, beide Füße.
- **KeeperEvidence** (`keeper/lowpoly-ground/`): alle Messwerte der 144 Bilder **identisch zum Originalmesh** (alter Low-Poly-Stand: 27 Hüftabweichungen bis 0,75 mm). Angesehen: Hechten mit Tor, Diagonalschritt, Fangen/Halten. Der gehaltene Ball auf Hüft-/Kniehöhe in `controlled-catch-held` ist geerbt (Original identisch).
- **LowPoly** (`editor/groundfix/`, Vergleich gegen `work/demo-low-poly/.../editor/baseline`): acht Architekturtypen (dockside-ground, civic-bowl, modern-ring, industrial-shed, urban-court, garden-ground, sun-terraces, hillside-ground), standard/reduced, 1280×720, 844×390, 931×448, Nah-/Keeper-/Weitkamera. Szenenzensus aller 16 Szenen identisch zum alten Kandidaten (GER-2 standard: 131 Renderer, 39 Materialien, 66 Schattenwerfer, 51.768 Dreiecke, 12 × 2.592 Spielerdreiecke) plus `groundSkins=12`, `groundSkinsEnabled=0`, `groundMesh=WorldPlayer`. Lesbarkeitsproben bitgleich zum alten Kandidaten. Angesehen: GER-2 Nahpaar, ESP-3 (sun-terraces) 844×390 reduced, ITA-4 (hillside) weit, ENG-2 (modern-ring) Torkamera. Stil, Licht und Shader unverändert; keine ästhetische Überarbeitung in dieser Runde.

## Build, Paket und WebGL (49 ff.)

Reihenfolge wie im aktuellen Pfad: `generate-identity.cjs` (unverändert `644d9d92…`, 46 Quellen) → Sync (0 Dateien) → `D6Cli.WebBuild` (0 Fehler, 3 Warnungen wie im Bestand: zwei `CS0618`, Emscripten-Hinweise) → `build-manifest.cjs` → Commit `2e1d0fdc` → Paket → Server.

| | alter Kandidat `d8ae8785` | Korrektur |
| --- | --- | --- |
| `sourceId` | `46a6e081…` | `644d9d928be9ea9d3ccd36f7049bbea40a333f9c5cd999dbddcbe5c9cd0211c9` |
| `unity-web.data` | `eaa475e7…` 55.402.057 B | `cb9d77d7ca75423c363ac0a1a500deed14c586fdc8106410d14abea5f00bf83f` 56.050.915 B |
| `unity-web.wasm` | `0f956190…` 35.499.037 B | `2de6a7d5d76fec7e6a7449f019b0127164723256fadfe06aaa5eb7ede1ca94ab` 35.521.508 B |
| `unity-web.loader.js` | `2909e971…` 27.907 B | `c49fdcbccf2b061a7f611e0b6cc56ce24bb4b5cdeb6a08fc6f8444939dea620f` 27.914 B |
| `unity-web.framework.js` | `36ef3791…` | unverändert `36ef379127938ada50294ade1111a1380d507e81359591f4156963b0420e1dcb` |
| Download gesamt | 91.229.907 B | 91.901.243 B (+671.336 B; Release-130-Basis 91.399.039 B) |
| `probe-build.json` | `dc0481f1…` | `f6978979682daa5340c64b899e82865c26d40fe309e4c291b3063ef7f5e3fd0b` |

- Buildbericht: `WorldPlayer.asset` (950,9 KB unkomprimiert) ist jetzt im Build; im alten Kandidaten fehlte es vollständig (nur `WorldPlayerLowPoly-v4.asset`, 532,1 KB). Die Szenenreferenz `groundPlayerMesh` übersteht also das WebGL-Stripping. Meshes im Build 1,3 → 2,3 MB.
- `pipeline-validation.json` wird von `ProbeWebBuild.Configure` bei jedem Lauf mit neuer `instanceID` überschrieben; vor dem Paket auf den committeten Stand zurückgesetzt (kein Bestandteil von Quellkennung/Manifest).
- **Echtes WebGL** (`work/platform/qa/check-lowpoly-webgl.cjs`, Edge headless, ANGLE D3D11, RTX 4070; `outputs/style-demos/lowpoly-fix/webgl/groundfix/`): Konsole `[D6] match mesh WorldPlayerLowPoly-v4 vertices=6926 base=d6_lowpoly_v4_base mask=d6_lowpoly_v4_mask ground=WorldPlayer vertices=9725`; 6 Bildsätze (standard/reduced × 1280×720/844×390/931×448, je 12 Namen), 8 Aktionsclips (Sprint-Pass, Schuss, Grätsche normal/reduced, Keeper normal/reduced, Tackling, Kopfball), 0 Seitenfehler. Native Parität an Tick 600/1200/2400/4213 (Zeit, Stand, Ereignisse, Ball, Zufallsziehungen, Ereignis-/Torlog-Hashes) **identisch** zum alten Kandidaten und zur Release-130-Basis. Angesehen: Spielbild 844×390 standard, Grätschen-Kontaktbogen.
- **Paket/Server:** `package-demo.cjs --style lowpoly --require-clean --include work/style-demos --out outputs/style-demos/lowpoly-fix/package`; `verify-package --deep --require-clean` 103/103, auch gegen den laufenden Server. Server `http://127.0.0.1:4413/` (siehe Abschnitt Übergabe für PID und Paketwerte). Port 4412 (alter Kandidat, PID 90676) und 4411 (Nighttime) unberührt.
- **Browser-Kurzprobe** mit Sonnets unveränderter Harness (`work/demo-style-support`, `acceptance-browser.cjs --only build,viewports`, nur gelesen): 44/44 bestanden – Unity aktiv, kein THREE, 12 Spieler/Labels, Meshzeile `WorldPlayerLowPoly-v4` in allen 6 Läufen, Qualität im Ladebefehl, Pause hält, alle vier WebGL-Dateien über hashgebundene URLs mit `X-D6-Sha256` = Manifest, keine Konsolen-/Seitenfehler. Die vollständigen 344 Prüfungen (Lebenszyklus, Architekturen, volle Parität) habe ich nicht wiederholt.
- **Kein Speicherleck der Bodenskins** (`LowPolyGround`, Lauf 50): nach jedem von zwei Loads szenenweit 24 Skins (12 gezeichnet + 12 Boden), 12 gültige Graphen; nach dem Verwerfen 0 Bodenskins.

## Kosten (gleiche Hardware, nacheinander, kein anderer GPU-Tab)

`check-lowpoly-webgl.cjs --only perf` (1280×720, 12 s Spiel, gleiches Fixture), alter Build direkt aus `work/demo-low-poly/outputs/platform/unity-web` (nur gelesen), Berichte `outputs/style-demos/lowpoly-fix/webgl/perf/*`:

| | alt standard | neu standard | alt reduced | neu reduced |
| --- | --- | --- | --- | --- |
| Bildzeit Median / p95 (vsync) | 14,8 / 17,7 ms | 14,7 / 17,8 ms | 14,9 / 17,9 ms | 14,7 / 17,7 ms |
| WebGL-Draw-Calls Median / p95 | 129 / 142 | 129 / 142 | 113 / 126 | 113 / 126 |
| Wasm-Speicher | 289 MB | 289 MB | 289 MB | 289 MB |

- Draw Calls gleich: der deaktivierte Bodenskin zeichnet nicht (auch Editor-Zensus: Renderer/Materialien/Schattenwerfer/Dreiecke gleich). Die früher berichteten 130/113 des Basisbuilds gegen 129/112 sind Lauf-zu-Lauf-Streuung; in dieser Sitzung liefern alt und neu dieselben Werte.
- Die Bildzeit ist vsync-begrenzt und zeigt Mehrkosten unter ≈ 2 ms nicht. Ein ungedrosselter Modus (`--unthrottled`, neu im Helfer) ergab zweigeteilte rAF-Zeiten (Callbacks ohne Unity-Bild), also keine belastbare Bildkostenzahl; Bildaufrufe je 12 s alt 4.265/4.365 (standard), neu 4.219/4.329, Unterschied innerhalb der Streuung des alten Builds. **Offen:** CPU-Skinning-/Bildkosten im Browser-Profiler; der Wasm-Speicher ist vorreserviert und zeigt ≈ 1 MB Mesh nicht.
- Erwartete Kosten nach Konstruktion: einmal `WorldPlayer.asset` (9.725 Vertices) im Speicher; je Akteur ein deaktivierter `SkinnedMeshRenderer` ohne Materialien (kein Skinning, kein Zeichnen pro Bild); Kalibrierungs-Bakes einmal je Sitzung am Release-Mesh; Laufzeit-Bake im Foul-/Keeper-Übergang 0,61 ms statt 0,42 ms (Editor). Kein Android-/Mobilgerät: keine Gerätefreigabe.

## Geprüfte Grenze: maßgeblicher Boden gegenüber sichtbarer Oberfläche

Bodenmaßgeblich (Bodenskin): Standsohle, `RootHeight`, `Of(clip)`, Gang, Kontur, Laufzeit-Bake. Sichtbar (gezeichneter Skin): `s.sole`/Tracespalte `sole`, `sole below turf frames`, die Skinanteile von `lowest sole incl. actions`, R20-Countdown-Sohle, `LowestBoot` (Duel/Iteration), alle Renderings. Keine Grenze wurde gelockert, keine sichtbare Messung auf den Bodenskin umgestellt.

## Offene und geerbte Grenzen

- Geerbt aus Release 130: historisches R15-1600-Gate (scheitert auch im Original), Kontakt-/Übergangsruckler, Direktfreistoß-Vorbereitung, gehaltener Ball tief in `controlled-catch-held`, siehe [Bugliste](../Bugliste.md).
- Diagnose-Clipprobe `slide right 1,00` unter −2 cm bei beiden Meshes (siehe oben).
- Kein Android-/Mobilgerät verfügbar: keine Gerätefreigabe, keine mobile GPU-Messung.
- Download wächst um `WorldPlayer.asset` (siehe Build); Laufzeit-Bake wieder auf Release-Niveau.
- Abschließende Browserabnahme (344 Prüfungen, Lebenszyklus, Architekturen, volle Parität) durch Sonnet/Root steht aus.
