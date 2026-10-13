# Klares Low-Poly: Übergabe des lokalen Kandidaten

Stand 13. Oktober 2026, Opus 5.5. Lokaler, nicht veröffentlichter Unity/WebGL-Kandidat nach [Klares Low-Poly](klares-low-poly-opus55.md) und [Kompatibilität](kompatibilitaet.md). Branch `codex/demo-low-poly-20261013` im Checkout `work/demo-low-poly`, Unity-Projekt `G:/unity/Doppel6-LowPoly-Demo` (6000.6.4f1). Getrennt von Nighttime; Beleuchtung des Release-130-Ankers unverändert. Keine Änderung an `dist/`, Matchregeln, Speicherung, Animationsauswahl, Clips, Rig oder Originalassets. Ergebnisse sind Claims; Root prüft unabhängig.

## Anker und Bindung

- Basis: vorbereiteter Commit `7288d6a8` auf Produkt `1063ed6f`, Unity-Quellkennung `3442dee8…`, [eigene Basissicherung](basis-low-poly-release130.json). Erster Sync: 0 abweichende Dateien.
- Kandidat: Quellkennung `46a6e081054ba81328e69ba8a01f66daaf0470bb2263b3de17f3f14369f3a4b8` (47 Identitätsdateien: die 41 bisherigen plus `LowPolySetup.cs`, `build_lowpoly.py` und die drei Low-Poly-Assets). Buildmanifest `outputs/platform/unity-web/probe-build.json` (SHA-256 `dc0481f1…336d`): data `eaa475e7…`, framework `36ef3791…` (unverändert), loader `2909e971…`, wasm `0f956190…`; 91.229.907 Bytes Download (Basis 91.399.039, −169 KB). 33 Manifestquellen und neues Feld `lowPolyAssets` mit den Asset-Hashes.
- Reihenfolge wie im aktuellen Pfad: Quellen → `generate-identity.cjs` → `sync-unity.cjs <Projekt>` → `D6Cli.WebBuild` → `build-manifest.cjs` → Paket. Unity-Läufe ausschließlich über `work/platform/qa/lowpoly-unity.sh` (fester Low-Poly-Projektpfad, Lockprüfung, Sync vor jedem Lauf). Einmalig nötig: `sync-unity.cjs … --base 7288d6a8`, weil die Projektkopie von `ProbeBuildIdentity.cs` noch den Basisstand trug (bytegleich geprüft).
- Basisbuild bleibt in Git und als Kopie `outputs/style-demos/lowpoly/baseline-unity-web/` (Manifest `3262df27…` = Release 130).
- Paket: `node work/style-demos/package-demo.cjs --style lowpoly --require-clean --include work/style-demos` aus Commit `d494cb5b`, Fingerprint `7280ec2d…`; `verify-package --deep --require-clean`: 103/103 bestanden (`outputs/style-demos/lowpoly/verify.json`). Lokaler Server `http://127.0.0.1:4412/` (`/__build`).

## Spielerfigur: echtes Low-Poly-Mesh auf dem bestehenden Rig

Reproduzierbar mit `blender --background --factory-startup --python work/platform/assets/lowpoly/build_lowpoly.py -- --version v4 --target 2600 --smooth .45` (Blender 5.2.2), Quelle ausschließlich `dist/players/football-v130.glb` (`5a2ae8bd…`, nur gelesen).

1. glTF-Nahtduplikate verschweißt (6.334 Vertices, UV-Nähte bleiben pro Ecke).
2. Dichtegesteuertes Collapse-Decimate mit X-Symmetrie: Erlaubnisgruppe hält mehr Kanten an Schulter, Ellbogen, Handgelenk, Hüfte, Knie, Knöchel und Hals (Schutz 0,62), fast die ganze Sohle (0,9), Schuh (0,35), Hand/Daumen (0,5) und Gesichtsflächen (0,4); Haar, Rumpfflächen und Oberschenkel vereinfachen am stärksten. Hinweis: Der Berichtstext nennt für Finger noch „.25“; im Code gilt 0,5 für die ganze Hand.
3. Hautgewichte an jeder neuen Vertexposition erneut vom Originalmesh übertragen (nächste Fläche, interpoliert), höchstens vier Einflüsse, normalisiert (Summe 1 ± 2·10⁻⁷, 0 ungewichtete Vertices).
4. Eigene Abwicklung; BaseColor und Kleidungsmaske (R Trikot, G Hose, B Stutzen) per Cycles-Bake vom Original übernommen (1024², Maske nächster Wert + Schwelle 0,5, 12 px Rand, Kopf/Haar doppelte Texeldichte). Grund: v2 mit interpolierten Original-UVs zeigte im Render blaue Flecken/falsche Kleidungsregionen, weil große Flächen konkave UV-Inseln überspannten.
5. Facetten: starre Segmente flach schattiert, nur 167 stark gemischte Gelenkfalten (Biegeanteil ≥ 0,45) weich. Export FBX (gleiche Achsen-/Skalen-Einstellungen wie `export_fbx.py`, ohne Animation) und GLB-Beleg; FBX-Rücklesung 28 Knochen, gleiche Dreiecke.

| | Original `WorldPlayer` | Low-Poly `WorldPlayerLowPoly-v4` |
| --- | --- | --- |
| Dreiecke | 12.668 | 2.592 |
| Vertices (Unity, geteilt nach Normale/UV) | 9.725 | 6.926 (1.296 verschweißt) |
| Knochen / Bindposes | 28 | 28, max. Abweichung 0,000000 |
| Texturen im Matchpfad | BaseColor 4096², Maske 2048² | BaseColor 1024² (1,07 MB PNG), Maske 1024² (50 KB) |
| Oberfläche zum Original | – | Ø 0,7 mm, p95 3,2 mm, max 8,7 mm (Original→Low max 18 mm: Haarspitzen/Finger) |
| Sohle (Ruhepose) | 0,0 mm | −0,3 mm |
| Szene GER-2 (12 Spieler) | 172.680 Dreiecke | 51.768 Dreiecke (Spieler 152.016 → 31.104) |

Unity (`LowPolySetup.cs`, `D6Cli.LowPolyMesh`): baut `WorldPlayerLowPoly-v4.asset` wie `WorldViewSetup` das Original — Knochenreihenfolge des Akteurs (`football-v130.fbx`), dessen Bindposes nach Gleichheitsprüfung, TEXCOORD2 = Ruheposkoordinaten. Regionsvergleich je Vertex gegen den nächsten Originalvertex mit derselben Shaderlogik (Maske, Pigment, Position): 95,8 % gleich, Abweichungen an Regionsgrenzen. Rückweg: `D6Cli.MatchMesh -d6mesh original` setzt Mesh, Maske und BaseColor zurück; `WorldPlayer.asset` und alle Originale bleiben unverändert. Im WebGL meldet die Konsole beim Laden `[D6] match mesh WorldPlayerLowPoly-v4 vertices=6926 base=d6_lowpoly_v4_base mask=d6_lowpoly_v4_mask` (im Kandidatenlauf belegt; kein stiller Originalpfad).

Sohle: `FootballSetup.GenerateSoleContour` erzeugt jetzt pro Mesh einen eigenen Eintrag; der Originaleintrag (`low_poly_unwrapped`/`WorldPlayer`) ist datengleich zum Basisstand, neu ist `WorldPlayerLowPoly-v4`. Browserkalibrierung `calibration-v130.json` und die Original-GLB gehören zum THREE-Pfad außerhalb der Unity-Vereinsweltansicht und bleiben unverändert; der Unity-Pfad nutzt die neu erzeugte Sohlenkontur und misst die Standsohle zur Laufzeit am geladenen Mesh.

## Material- und Umfeldstil

Ein globaler Schalter `_D6LowPoly` (`ProbeBridge.LowPolyStyle`, Standard an; 0 rechnet exakt wie Release 130):

- **Spieler (`WorldKit`):** weniger gemalte Stofffalten (Faktor 0,90 + 0,13·Pigment statt 0,78 + 0,22·Pigment), ruhigere Haut/Haare, weniger Wrap (0,25 statt 0,35) für unterscheidbare Facettentöne, matter Stoff. Masken, Muster, Nummern, Haut-/Haar-/Handschuhregeln unverändert.
- **Rasen (`D6Pitch`):** halb so viele, breite Bänder desselben Vereinsmusters (Streifen/Karo/Diagonal), knappe antialiasierte Kanten, 30 % mehr Tonabstand, kein Querschnitt, kaum Rauschen, weniger Abnutzung. Linien unverändert.
- **Glanz (`D6Common`):** breiterer, schwächerer Reflex (Exponent 14 statt 48, 55 %) für Metall, Dach, Glas, Wasser.
- **Stadion:** erzeugte Beton-, Ziegel-, Verkleidungs-, Laub- und Bodentexturen mit einem Drittel der Mottelung; Zuschauer ohne Reihenverlauf. Geometrie, acht Architekturtypen, Vereinsprofile, Sitze, Sponsor-/LED-Flächen unverändert.
- `_D6Facet`: Ableitungsnormalen für den reversiblen Facettenvergleich am unveränderten Original (Zwischenstand, keine Meshreduktion; nur Diagnose).

## Nachweise

Pfade relativ zu `work/demo-low-poly/`, Logs in `outputs/style-demos/lowpoly/logs/`.

- **Editor-Vergleich** (`D6Cli.LowPoly`, `LowPolyDiagnostics.cs`): je 79 Bilder für `baseline` (Release-130-Renderer, Original), `facet` (Original + Ableitungsfacetten), `meshv3` (Low-Poly-Mesh ohne Stil) und `candidate`; acht Heimvereine decken alle acht Architekturtypen ab, GER-2 zusätzlich dunkel/hell-Trikots, Nah-/Keeperkamera, standard/reduced, 1280×720, 844×390, 931×448. Vergleiche `outputs/style-demos/lowpoly/editor/*/compare/`. Szenenzensus je Lauf mit geladenem Mesh und Hash.
- **Lesbarkeit** (Mittel über 79 Bilder, sRGB-Abstand): Feldhelligkeit 0,217 → 0,217, Team A↔Rasen 0,296 → 0,287, Team B↔Rasen 0,234 → 0,220 (davon 0,221 schon allein durch das Mesh bei der Punktprobe auf Facetten), Team↔Team 0,057 → 0,061, Ball↔Rasen 0,645 → 0,633, Keeper↔Rasen 0,441 → 0,578. Die Team↔Rasen-Werte liegen 3–6 % unter der Basis; ich habe nach zwei begrenzten Korrekturen (Wrap, Stoffhelligkeit) gestoppt statt weiter zu polieren.
- **WebGL im echten Match** (`work/platform/qa/check-lowpoly-webgl.cjs`, Edge headless, ANGLE D3D11, RTX 4070): GER-2-Karriere, gesetzter `Math.random`, feste 0,05-s-Ticks, Vollbildlayout, Anstoß und drei Spielzeitpunkte × standard/reduced × drei Größen, 12/12 Namen überall, keine Seitenfehler. Basis- und Kandidatenbuild mit identischem Harness: `outputs/style-demos/lowpoly/webgl/{baseline,candidate,compare}`. Ich habe die WebGL-Bilder angesehen.
- **Native Parität (gleicher Harness):** an Tick 600/1200/2400/4213 identische Spielzeit, Stände, Ereigniszahl, Ball, Zufallsziehungen (37/94/172/311) und Ereignis-/Torlog-Hashes; identische Aktionsfundstellen der Clipsuche.
- **Vollständige 2D/Unity-Parität** (`work/style-demos/parity-full.cjs --style lowpoly --url http://127.0.0.1:4412`, gegen das gebundene Paket): beide Partien 3037 Schritte, Digest `a6d98d83`, Nutzdaten-SHA-256 `d0a8785eb42bef9851f2005fce1fa86e1200eb92a113460ca3dd5d4cd2ee8772` – dieselben Werte wie Release 130/Nighttime (`outputs/style-demos/lowpoly/parity-lowpoly.json`).
- **Aktionsclips WebGL** (animiertes WebP + Kontaktbogen, je Basis/Kandidat): Pass, Schuss, Grätsche (normal/reduced), Keeper bis zum Tor 1:0 (normal/reduced), Tackling, Kopfball. Aus der Spielkamera sind Figuren klein; Verformung zeigen die Nahaufnahmen unten.
- **Nahaufnahmen Editor auf dem Low-Poly-Mesh:** `D6Cli.NaturalMotion` (Report-Modus) 55 Bilder + 84 GIFs (`outputs/style-demos/lowpoly/motion/candidate/candidate/`: Gehen/Joggen/Sprint vor/zurück/seitlich, Kurven, Stopps, Pass-/Schuss-/Annahmekontakte mit Fuß-Nahaufnahmen, Keeper-Shuffle). `D6Cli.KeeperEvidence` 162 Bilder für Low-Poly und Original (`outputs/style-demos/lowpoly/keeper/{candidate,original}`: Hechten, Paraden, Fangen, Aufnehmen, Abstoß). Keepermesswerte zwischen beiden Meshes gleich bis auf Hüfthöhe (max 0,75 mm, Bodenausgleich der Sohle); Handschuhfehler, Halte-/Paradeflags und Schatten identisch. Zusätzlich Blender-Posen Original vs. Low-Poly (`outputs/style-demos/lowpoly/blender/v2/`, Sprint, Schuss, Hechten, Foulfall, Bremsen, Drehung).
- **Unity-Suiten** (`D6Cli.Tests`, gleiche Werkzeuge, Original vs. Low-Poly zugewiesen): Stadium 706, Duel 43, Iteration 106, Keeper 160, Presentation119 437 bestehen mit beiden. NaturalMotion: 2020/2020, Support 675/675, Kontakt 285/285, Kontinuität 20/20, R20 642/642 bei beiden. R15 341/342 bei beiden mit demselben historischen Gate `r15/plant-edge@120Hz/receive … joint speed`: Original 2102,82 °/s (= R18-Sperrwert), Low-Poly 2103,88 °/s (+0,05 %). Weil die R18-Sperre exakt (1e-4) ist, bricht `D6Cli.Tests` mit dem Low-Poly-Mesh deshalb als FAILED ab. Ursache: Der Bodenausgleich liest die tiefste Vertexhöhe des geladenen Meshes; kein Gate wurde gelockert. Übrige Berichtsunterschiede < 1 cm, z. B. Foulstolpern Stiefel −3,3 → −2,7 cm unter Rasen.
- **Leistung, gleiche Hardware, 1280×720, 12 s Spiel:** Framezeit Median 14,7/14,8 ms, p95 17,7/17,6 ms (standard) und 14,8/14,8, 17,7/17,7 ms (reduced) – vsync-begrenzt; WebGL-Draw-Calls Median 130 → 129 (standard), 113 → 112 (reduced).

## Assetentscheidung

| Bestandteil | Entscheidung |
| --- | --- |
| Spieler/Keeper-Hülle | Ersetzt durch `d6_lowpoly_v4` (FBX `54a3e763…`, GLB `2dd64b26…`, Base `e128bcc1…`, Maske `b399ac5e…`) auf demselben Rig. Original bleibt Rückweg. |
| Rig, 34 Originalclips, 2 Pilotclips, prozedurale Bonezugriffe | Unverändert (Projektdateien bytegleich zur Basissicherung). |
| `WorldPlayer.asset`, `cloth-mask.png`, `Player.mat`, Original-GLB, Kalibrierung | Unverändert; neues Mesh mit eigenem Asset, eigener Maske/BaseColor, eigener Sohlenkontur. |
| Ball, Tore, Netz | Unverändert übernommen. |
| Rasen | Shader erweitert (breite ruhige Bänder). |
| Stadion, Publikum, Vegetation | Generatoren unverändert, ruhigere erzeugte Texturen; Architekturgeometrie bereits blockhaft. |
| Licht | Release 130 unverändert. |

Unity-Projekt: 151 von 166 Basisimporten bytegleich; die 15 Abweichungen sind genau die geänderten Quellen und `Probe.unity` (Meshzuweisung). Neu: `d6_lowpoly_v4.fbx`, `_base.png`, `_mask.png`, `WorldPlayerLowPoly-v4.asset`.

## Geerbte und offene Grenzen

- Geerbt aus Release 130 und unverändert: Kontakt-/Übergangsruckler, Direktfreistoß-Vorbereitung, Live-Verfolgung, Tempowahl ([Bugliste](../Bugliste.md)); das R15-Altgate (siehe oben, mit dem Low-Poly-Mesh +1,07 °/s über dem exakten Sperrwert). In `controlled-catch-held` liegt der gehaltene Ball auf Hüft-/Kniehöhe – mit Original-Mesh identisch, also kein Low-Poly-Befund.
- Nicht gemessen: Android-/Mobil-GPU, Wasm-Heap und Texturspeicher im Browser; Werte stammen von einer Desktop-GPU mit vsync. Die 4096²-BaseColor bleibt über `Player.mat` (Probe-Pfad) im Build; Entfernen wäre eine weitere Downloadersparnis, aber eine Änderung am gemeinsamen Pfad.
- Nur GER-2 (dockside-ground) im WebGL-Match; die übrigen sieben Architekturtypen sind im Editor belegt.
- Gestalterisch offen: Gesicht bleibt texturbasiert (Augen/Brauen aus dem Bake), Füße binden wegen Sohlenschutz ein Drittel der Dreiecke; Stadiongeometrie wurde nicht neu modelliert, nur beruhigt. Ein heller Tageslichtvergleich ist nicht Teil dieses Kandidaten.

## Nächster Schritt

Root/Sonnet: Browserabnahme mit `acceptance-browser.cjs --style lowpoly` gegen `http://127.0.0.1:4412/` (Pause, Halbzeit, Rückschau, Tor-Wiederholung, Neuladen, 2D-Rückfall – von mir nicht ausgeführt), Entscheidung über das R15-Altgate (+0,05 %), danach Gestaltungsrückmeldung.
