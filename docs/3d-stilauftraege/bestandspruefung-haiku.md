# Bestandsprüfung Release 130 für Nighttime und Klares Low-Poly

Lesende Prüfung durch Haiku 5.5 am 13. Oktober 2026. Checkout `work/demo-low-poly`, Branch `codex/demo-low-poly-20261013`, Basis-HEAD `f7744f19`; Produktbasis `1063ed6f96d507bfa14b0b8a8cfd764646771bb6` ist Vorfahre. Kein Code, kein Editor, keine neuen Modelle, Texturen oder Builds. Maschinenlesbare Fassung: [bestandspruefung-haiku.json](bestandspruefung-haiku.json). Alle Zahlen wurden direkt geprüft, sofern nicht als „offen“ oder „historisch“ markiert.

## Ergebnis in Kürze

- **Quellen und Importe sind belegt:** 41/41 Quellen hashgleich zum Checkout; 166/166 Importdateien hashgleich zur Nighttime-Unitykopie; `sourceId 3442dee8…` reproduziert sich exakt nach dem Algorithmus aus `generate-identity.cjs`.
- **Hash-Bindung teilweise offen:** `manifestSha256 3262df…`, `liveProof.htmlSha256 358d343b…` und die vier `buildFiles` sind lokal nicht reproduzierbar (siehe Abschnitt „Offen“). Vor einer Kandidatenbindung muss der Root das klären.
- **Der Matchshader nutzt nur zwei Texturen.** Normal-, Metallic-/Roughness- und `metallic-smoothness`-Daten erreichen den Matchpfad nicht. Nighttime-Materialwirkung muss daher über den Shader laufen.
- **Zusatzlichter sind im Web-Pfad aus.** Nighttime-Lichter sind nur über Hauptlicht, Umgebungslicht und Emission möglich.
- **„Low-Poly“ ist im Asset nicht vorhanden.** Das Mesh `low_poly_unwrapped` hat 12.668 Dreiecke, und das Manifest nennt „Full master, no decimation“.

## Assettabelle

Hashes sind vollständig aus Basis-JSON bzw. Manifest übernommen. „Übernehmen“ heißt: unverändert in den Stil übernehmen.

| Asset | Originalpfad | SHA-256 (Anfang) | Nighttime | Low-Poly | Begründung |
| --- | --- | --- | --- | --- | --- |
| Spieler-/Keepermodell | `dist/players/football-v130.glb` | `5a2ae8bd…` (21.445.448 B) | Übernehmen. Materialwirkung über Shader. Ersatz nur bei im Capture belegter Silhouetten-/Hand-/Schuh-/Materiallücke | Nicht als Low-Poly übernehmen. Erst Facetten-Prototyp am selben Mesh; echte Vereinfachung nur als neues Mesh am bestehenden Rig | Rig, Clips, Maske und Bindpose bilden den getesteten Vertrag. Vertrag: „Full master, no decimation“ (`manifest.json:contract.geometry`) |
| Kalibrierung | `dist/players/calibration-v130.json` | `3c3d05ac…` (341.831 B) | Übernehmen | Bei jeder Mesh-/Vertexänderung neu erzeugen | Sohlen-SampleVertices, Scale 1,45, rootScale 1,12 hängen am Mesh |
| Kleidungsmaske | `dist/players/cloth-mask.png` | `a12f08d3…` (75.111 B) | Übernehmen | Übernehmen, solange UV0 gleich bleibt | 2048² RGB, 8 Bit. R = Trikot, G = Hose, B = Stutzen (`WorldKit.shader:46`) |
| BaseColor `image-0.png` | `Art/textures/image-0.png` (GLB index 0) | `cfd59dfe39aaff42…` (9.834.749 B) | Übernehmen; Tonwerte über Shader | Übernehmen; Pigmentberuhigung nur als gemessener Einzelschritt | Einzige Textur, die der Matchpfad liest (`WorldViewBridge.cs:58`). 4096², 9,8 MB als Downloadrisiko |
| MetallicRoughness `image-1.jpg` | `Art/textures/image-1.jpg` (GLB index 1) | `ce490897…` (1.214.077 B) | Nicht verwenden, solange der Shader sie nicht wertet | Nicht nötig | GLB-Material verweist darauf; Unity-`Player.mat` nicht; Matchshader nicht |
| `image-2.jpg` | `Art/textures/image-2.jpg` (GLB index 2) | `e3126b5f…` (1.935.304 B) | Nicht verwenden | Nicht verwenden | Keine GLB-Materialreferenz; GUID `253550bb…` in den durchsuchten Unity-Dateitypen nicht gefunden. Ungenutzt, Entfernung erst nach Importprüfung |
| Normal `image-3.png` | `Art/textures/image-3.png` (GLB Normal, `Player.mat _BumpMap`) | `03c2426b8c99f6d35daee294657acc2db2cc7e029f1ef8dfdca81746cd7bec13` (2.961.306 B) | Nur mit Shader-Erweiterung | Nicht verwenden; Facetten sollen aus Geometrie kommen | Matchshader wertet keine Normalmap aus |
| `metallic-smoothness.png` | `Art/textures/metallic-smoothness.png` (nur Unity) | `59f5bc76…` (2.941.102 B) | Nicht verwenden | Nicht nötig | Nur in `Player.mat` (`_MetallicGlossMap`, Zeile 71–72); im Matchpfad nicht gelesen |
| Spieler-FBX (Unity) | `Art/football-v130.fbx` | `e79f62f4…` (10.858.636 B) | Übernehmen | Bei neuem Mesh ersetzen; Exportreproduktion nicht geprüft | Meta: Generic (`animationType: 2`, Zeile 107), Kompression aus (Zeile 26) |
| Pilot-FBX (Kontakt) | `Art/football-contact-pilot.fbx` | `cbbac9f5…` (572.620 B) | Übernehmen | Prüfen, falls Rig/Mesh ändert | Enthält `pass_inside_meshy` und `receive_ground_meshy`; nicht im GLB-Manifest |
| WorldKit-Shader | `prototypes/match-engine-unity/WorldKit.shader` (= Unity `Art/WorldKit.shader`) | `c1e92e7e…` (6.489 B) | Additive Parameter für Glanz, Tonung und Lichtreaktion | Unverändert; `TEXCOORD2` bleibt Pflichtkanal | Kleidungs-, Haut-, Haar- und Handschuhregionen hängen an Maske, Pigment und Bindposition |
| WorldPlayer-Asset | `Art/WorldPlayer.asset` | `98b1a139…` (1.956.767 B) | Übernehmen | Bei neuem Mesh neu erzeugen (`WorldViewSetup.cs:15` aktualisiert vorhandenes Asset nicht) | Bindpose-Koordinaten in TEXCOORD2 |
| Umgebung, Stadion, Ball, Netz | `StadiumArchitecture.cs`, `WorldViewEnvironment.cs`, `D6Env/D6Pitch/D6Blob/D6TeamRing.shader`, `D6Common.hlsl` | siehe `basis-release130.json:sources` | Übernehmen; Licht-, Himmel-, Emissions- und Materialparameter anpassen | Geometrie optional vereinfachen; Ballanker, Rotation und Netz erhalten | Prozedural und bereits nachtnah (Hintergrund `0.05/0.09/0.14`, `WorldViewEnvironment.cs:33`) |

## Rig, Clips und Mesh (belegt)

- **Skin:** 1 Skin „Armature“ mit 28 Joints (`mixamorig:*`, `headfront`, `HeadTop_End`, Zehen-/Handenden), 30 Nodes, Wurzel `target_character` (GLB-JSON, `manifest.json:skins`).
- **Unity-Rigtyp:** Generic (`animationType: 2`).
- **Clips:** 34 im GLB und Manifest; 30 kalibriert. Unkalibriert: `Charged_Spell_Cast`, `celebrate_fist`, `celebrate_arms`, `celebrate_victory`. Zusätzlich 2 Pilot-Clips nur in der Unity-Kopie (`pass_inside_meshy`, `receive_ground_meshy`).
- **Mesh:** `low_poly_unwrapped`, 1 Primitive, 9.725 Vertices, 12.668 Dreiecke (38.004 Indizes), 1 Materialslot `Doppel6_Meshy_2K`, 4 Bilder, 3 Sampler.

## Shader-Kanalbindung

- **Texturen im Matchshader:** `_BaseMap` (UV0, `WorldKit.shader:41`), `_ClothMask` (UV0, `WorldKit.shader:42`). Genau zwei Samples.
- **Laufzeitbindung:** `WorldViewBridge.cs:58` übernimmt `_BaseMap` aus `Player.mat` und setzt `_ClothMask`.
- **Körperkoordinaten:** `o.body` aus `TEXCOORD2` (`WorldKit.shader:20`, `:43`).
- **Farbparameter:** `_Main`, `_Trim`, `_Accent`, `_Skin`, `_Hair`, `_NumberColor`, `_NumberEdge`, `_Glove`. Floats: `_Style`, `_Number`, `_Keeper`.
- **Licht:** `D6Light(color, world, n, wrap 0.35, rim 0, fabric)` (`WorldKit.shader:75`). Hauptlicht mit Schatten (`D6Common.hlsl:9`) und `SampleSH` (`D6Common.hlsl:13`).
- **Emission:** im Spielershader nicht vorhanden. Lampenemission nur in der Umgebung (`WorldViewEnvironment.cs:69–70`, Lampenfarbe `1.6/1.5/1.3` bei Zeile 156).

## Lichtfähigkeit des vorhandenen Pfads

- **Hauptlicht:** ja. Sonne `(54, −32, 0)`, Farbe `(1, 0.96, 0.90)`, Intensität 1,45 (`WorldViewEnvironment.cs:31`). Schattenkarte 2048 (`ProbeWeb.asset:46`); reduced: 1024, 70 m, harte Schatten (`WorldViewEnvironment.cs:31`, `:34`).
- **Umgebungslicht:** ja, benutzerdefinierte SH-Probe (`WorldViewEnvironment.cs:29–30`).
- **Zusatzlichter:** nein. `m_AdditionalLightsRenderingMode: 0` (`ProbeWeb.asset:47`), Zusatzlicht-Schatten aus (`ProbeWeb.asset:49`), erzwungen durch `ProbeWebBuild.cs:25–26`. `D6Light` kennt keine Zusatzlichter-Schleife.
- **Nachtgrade vorhanden:** Hintergrund `(0.05, 0.09, 0.14)` (`WorldViewEnvironment.cs:33`); Grading Kontrast 6, Sättigung −6, PostExposure 0,1 (`:38`); Bloom Schwelle 0,93, Intensität 0,35 (`:40`), aus bei reduced (`:43`). Reduced-Erkennung in `:24`.

## Prüfmatrix: vier vorhandene Stadien

Heimverein-ID kommt aus `WorldViewEnvironment.cs:98–99` (`homeTeam.id` → `ClubStadiumProfiles.Resolve`). Unbekannte IDs fallen auf neutral `garden-ground` zurück (`ClubStadiumProfiles.cs:33–34`). Die vier IDs existieren im nativen Vereinskatalog `dist/world-catalog-v61.js`.

| Heimverein-ID | Verein | Stadion | Architekturtyp | Quellen |
| --- | --- | --- | --- | --- |
| ENG-1 | Regent Vale FC | Regent Vale Gardens | `civic-bowl` (Fassade brick-arcade, 4 Dachseiten) | `world-catalog-v61.js:5`; `ClubStadiumProfiles.cs:71` |
| ENG-2 | Irwell FC | Irwell Arena | `modern-ring` (metal-fins, 4 Dachseiten) | `world-catalog-v61.js:20`; `ClubStadiumProfiles.cs:72` |
| ENG-4 | Birmingham Works FC | Works Assembly Park | `industrial-shed` (steel-truss, 3 Dachseiten) | `world-catalog-v61.js:50`; `ClubStadiumProfiles.cs:74` |
| ENG-6 | Wandle Town | Wandle Meadow | `garden-ground` (timber-rib, 1 Dachseite, kleinste Tribüne) | `world-catalog-v61.js:80`; `ClubStadiumProfiles.cs:76` |

Ausweichkandidaten: ENG-3 `dockside-ground` (`ClubStadiumProfiles.cs:73`), GER-4 `hillside-ground` (`:101`), ESP-3 `sun-terraces` (`:82`). Es gibt 8 Architekturtypen (`StadiumArchitecture.cs:63`).

**Matrix:** 4 Stadien × {normal, reduced} × {nah, weit} × {Desktop, 844×390, 931×448} = **48 Aufnahmen**. Die Desktop-Größe ist in den Quellen nicht festgelegt; der Root muss sie bestimmen.

## Vorhandene Fixtures und Runner

Keine Ereignisse erfunden. Alle Dateien sind getrackt; keine davon wurde in diesem Audit ausgeführt.

- **Keeper:** `outputs/3d-quality/keeper-next/keeper-fixtures.json` mit 9 Sequenzen: goalkick-out, goalkick-out-turned, parry-mid, parry-high, parry-large, parry-central, goal-dive, goal-high, goal-central. Dazu `docs/spieler-nutzer-rig/keeper-sidestep-qa-v130.json` und `keeper-scenarios-qa-high-v131.json`.
- **Slide:** `docs/spieler-nutzer-rig/slide-visual-baseline-v124.json` mit 6 Fällen (30/60/120 fps × Blickrichtung 0 und π/2). Testlogik in `FootballDuelTests.cs:49–68` (slide-right, slide-left) und Timing in `FootballDuel.cs:19`.
- **Action:** `docs/spieler-nutzer-rig/ball-actions-qa-v130.json`, `play-actions-qa-v133.json`, `motion-actions-qa-v113.json`, `pitch-actions-qa-v112.json`.
- **Runner:** `prototypes/match-engine-unity/D6Cli.cs:23–37` (Batchmode-Suiten: FootballActionTests `:26`, FootballDuelTests `:32`, FootballKeeperTests `:34`, NaturalMotionGates `:37`), Einzel-Einstiege `:65` und `:80`.

## Geerbte Fehler (Release 130, nicht als Stilregression werten)

Quelle: `docs/Bugliste.md` und `docs/release-130.md:32`.

- **B01 (hoch):** Browserpartien ruckeln nach Spielbeginn (`Bugliste.md:9`).
- **B02 (hoch):** Gehen, Traben und Sprint starr; keine situative Tempowahl (`:10`).
- **B03 (hoch):** Verteidiger verlieren Verfolgung nach Richtungswechseln (`:11`).
- **B04 (hoch):** Direkter Freistoß mit falscher Körperrichtung; Schussvorbereitung vor nativem Ziel offen (`:12`).
- **B05 (hoch):** Fußkontakte rucken; 15 Kontaktfenster schlechter als früherer Kandidat; 5 historische Diagnosefehler (`:13`, `release-130.md:32`).
- **B06 (hoch):** Grundlos wirkendes Rückwärtslaufen; Restart-Projektion nur teilweise (`:14`).
- **B07 (mittel):** Positionssprünge 0,32–3,70 m bei Torwart-Ballübergabe (`:15`).
- **B08 (hoch):** Physische Android-Abnahme offen (`:16`).
- **Live-Verfolgung:** nicht umgesetzt (`release-130.md:32`).

## Fable-Befunde (historisch) gegen Bestand geprüft

- **Bestätigt:** 9.725/12.668; 28 Joints; 34 + 2 Pilot-Clips; 30 kalibriert; nur BaseMap und Kleidungsmaske im Shader; Zusatzlichter aus; 8 Architekturtypen.
- **Nicht hier geprüft:** R20/R21-Übergabestand; 55-Quellen-Gleichheit des Ankers `claude-natural-motion`; `ProbeSetup.cs:13`.
- **Korrigiert:** Die Fable-Angabe „Rolle von image-2 offen“ ist teilweise beantwortet: keine Materialreferenz im GLB und in den durchsuchten Unity-Dateitypen.

## Offen

- **`manifestSha256 3262df2786…` nicht reproduziert.** Arbeitskopie `work/platform/assets/manifest.json` hat `31dcbf08…` (41.083 B, CRLF). Git-Blob `f2ee3c48…` (LF, 39.408 B) ergibt `9439eff5…`. Auch der Anker `claude-natural-motion` hat `31dcbf08…`. Herkunft von `3262df…` unklar.
- **`liveProof.htmlSha256 358d343b…` nicht gefunden.** Kein `dist/*.html` im Checkout hat diesen Hash; `dist/index.html` ist `0ecdc47f…`. Live-Seite nicht abgerufen.
- **`buildFiles` (unity-web.data/framework/loader/wasm) lokal nicht vorhanden.** Hashes nur aus Basis-JSON.
- **Unity-Shader-GUID von `Player.mat`** (`933532a4…`) nicht im Editor verifiziert; vermutlich URP Lit.
- **Konzeptbilder** nur als Dateiliste geprüft (`07-flutlicht.png`, `12-low-poly.png` vorhanden). Keine Bildbewertung.
- **Desktop-Viewport** fehlt in den Quellen.
- **Laufzeit-, Animations- und GPU-Abnahme** ist aus diesen Quellen nicht möglich; Android-Gerätebefund bleibt getrennt offen (B08).

## Fragen an Opus

1. **Nighttime-Material:** Soll `WorldKit` additiv Glanz-/Rauheitsparameter bekommen, obwohl Normal- und MR-Texturen nicht gelesen werden?
2. **Ersatzkriterium:** Welche konkrete Lücke im Nighttime-Capture rechtfertigt einen Mesh-Ersatz?
3. **Low-Poly-Zwischenstand:** Genügt der Facettenprototyp am bestehenden 12.668-Dreieck-Mesh, oder ist echte Retopologie mit Neugenerierung von `WorldPlayer.asset` und Kalibrierung Pflicht?
4. **Manifest:** Sollen `pass_inside_meshy` und `receive_ground_meshy` ins Manifest (34 vs. 36 Clips)?
5. **Altbestand:** `image-2` und `metallic-smoothness.png` entfernen oder als Altbestand belassen?
