# Nighttime: Übergabe des lokalen Kandidaten

Stand 13. Oktober 2026, Opus 5.5. Lokaler, nicht veröffentlichter Unity/WebGL-Kandidat nach [Nighttime](nighttime-opus55.md) und [Kompatibilität](kompatibilitaet.md). Branch `codex/demo-nighttime-20261013` im Checkout `work/demo-nighttime`, Unity-Projekt `G:/unity/Doppel6-Nighttime-Demo` (6000.6.4f1). Keine Veröffentlichung, keine Änderung an `dist/`, Matchregeln, Speicherung, Animationsauswahl oder Assets. Ergebnisse sind Claims; Root prüft unabhängig.

## Anker und Bindung

- Basis: Produktcommit `1063ed6f`, Plancommit `f7744f19`, Unity-Quellkennung `3442dee81cd9a3abbca2083cb3d0c02fcf19efa20ec7a0868204134191d12d82`. `sync-unity.cjs` mit explizitem Projektpfad meldete vor Beginn 0 abweichende Dateien.
- Kandidat: Quellkennung `3422e9fb1258deffd276c0a4c956f60a4aaabefc13323ce918f023a85eddf330`. Buildmanifest `outputs/platform/unity-web/probe-build.json`: data `0c4a9183…452d`, framework `36ef3791…1dcb` (unverändert), loader `06aad6b8…34d8`, wasm `60ee45e0…b85d`; 91.435.267 Bytes Download (Basis 91.399.039, +36 KB).
- Reihenfolge wie im aktuellen Pfad: Quellen → `generate-identity.cjs` → `sync-unity.cjs <Projekt>` → `D6Cli.WebBuild` → `build-manifest.cjs` → Browserladung über `/unity/probe-build.json`. Der neue Shader `D6Glow.shader` steht in Quellkennung und Buildmanifest.
- Der Basisbuild bleibt in Git (`f7744f19`) und als lokale Kopie `outputs/style-demos/nighttime/baseline-unity-web/` (Hashes = Release-130-Manifest).

## Gestaltung

Ausgerichtet an der erhöhten Spielkamera: Das Feld ist die hell beleuchtete Bühne, Ränge und Umgebung treten zurück, der Himmel ist ruhig dunkelblau.

- **Licht:** ein hohes, fast weißes Hauptlicht (1,85, 58°) mit weichen Schatten, kühle Himmelsfüllung, grüner Rasenreflex. `D6Floodlit` lässt das Hauptlicht außerhalb von Feld und Rängen weich abfallen; Bäume, Hügel und Bebauung werden dunkle Silhouetten, beleuchtete Fenster bleiben sichtbar. Keine Zusatzlichter, keine automatische Belichtung, kein Tageszeitsystem.
- **Lampen:** `D6Glow` zeichnet kamerazugewandte Halos vor jeder vorhandenen Lampenfläche (Mastköpfe, Dachschienen) – je Tribünengruppe ein Mesh, verborgen mit ihrer Tribüne. Sie sind auch in `reduced` ohne Bloom sichtbar und beleuchten nichts. Bloom bleibt optional und nur in `standard`.
- **Rasen:** Vereinsmähmuster beibehalten, Streifenkontrast beruhigt, vier weiche Lichtinseln der Strahlerbänke mit leichtem Randabfall, feine Halmkörnung nur in Nahkameras, schwacher Glanz ohne Nässe-/Reibungswirkung.
- **Spieler (`WorldKit`):** Stoff matt mit feinem, nur nah sichtbarem Gewebe und weichem Streifglanz statt Kunststoff-Glanzpunkt; Haut mit breiterem Wrap, warmem Übergang und breitem schwachem Glanz; Haar und Handschuhe eigene schwache Reaktion; kühler Gegenlicht-Rim der gegenüberliegenden Strahlerbank, mit Trikotfarbe gemischt. Masken, Muster, Nummern, Haut-/Haarregeln und Handschuhe unverändert. Ohne gesetzte Nighttime-Globals rechnet der Shader exakt wie zuvor.
- **Umfeld:** kühler Beton (128 px, Fugen, wenige Witterungsspuren), lackiertes Metall mit Kantenreflex, gedämpfte Sitze und Publikum, dunklere Dächer und Vegetation, weißere Lampenflächen.
- **Ball:** gleiche Paneltextur und UVs auf dem Stadionshader mit kleinem Eigenanteil und schmalem Glanzpunkt; behält seinen echten Schatten.
- **Grading:** statisch, Kontrast 15, Weißabgleich −6, leicht kühle Schatten, neutrale Lichter, Vignette 0,27. Cleanup setzt Globals, Licht und Volume zurück.

## Assetentscheidung

| Bestandteil | Entscheidung |
| --- | --- |
| Feldspieler/Keeper (`football-v130.fbx`, 28 Gelenke) | Übernommen, Material angepasst (`WorldKit`). Kein Ersatz: keine belegte Formlücke aus der Spielkamera. |
| Originalclips (34) und Pilotclips (2) | Übernommen, unverändert. |
| BaseColor, Kleidungsmaske, `WorldPlayer.asset`, Sohlenkontur, `calibration-v130.json` | Übernommen, unverändert (unverändertes Mesh). |
| Ball | Geometrie übernommen, Material angepasst. |
| Tore/Netz | Übernommen (URP-Lit, Lichtwirkung über Hauptlicht). |
| Rasen | Shader übernommen und erweitert. |
| Stadion | Architektur übernommen, Material/Licht angepasst; `StadiumArchitecture.cs` unverändert. |
| Publikum | Übernommen, gedämpft. |
| Himmel | Generator erweitert (Nachtverlauf, Wolkenbänke). |

SHA-256 (gekürzt) im Demo-Projekt = Originalprojekt (nur gelesen): `football-v130.fbx` e79f62f4, `.meta` 221fe747, `football-contact-pilot.fbx` cbbac9f5, `pass_inside_meshy.anim` 545475ab, `receive_ground_meshy.anim` 920bbf73, `cloth-mask.png` a12f08d3, `WorldPlayer.asset` 98b1a139, `Player.mat` fecedf91. `git diff f7744f19` über `dist/`, `outputs/platform/assets/`, `FootballAnimation.cs`, `FootballSoleContour.cs`, `FootballSetup.cs`, `WorldViewSetup.cs`, `ProbeSetup.cs`: leer.

## Nachweise

Pfade relativ zu `work/demo-nighttime/`; Logs in `outputs/style-demos/nighttime/logs/`.

- **Editor-Vergleich** (`D6Cli.Nighttime`, neues `NighttimeDiagnostics.cs`): Basis aus den Renderquellen von `f7744f19` (`D6_BASELINE_REF=f7744f19 bash work/platform/qa/nighttime-unity.sh …`, Quellkennung 3442dee8 im Bericht), Kandidat aus dem Arbeitsstand. Gleiches Fixture, gleiches Layout, gleiche Kameras (1:1 `v98CameraAim`). Acht Heimvereine decken alle acht Architekturtypen ab (GER-2 Musterstadion, ENG-1, ENG-2, ITA-1, ESP-4, ENG-6, ESP-3, ITA-4); GER-2 zusätzlich mit dunkel/hell-Trikots, Nah-/Keeperkamera, `standard`/`reduced`, 1280×720, 844×390, 931×448. 79 Bilder je Stand, 79 Vergleichsbilder: `outputs/style-demos/nighttime/editor/{baseline,candidate,candidate/compare}`, Übersichten `editor/archetypes-{baseline,candidate}-goal.png`.
- **Lesbarkeit** (Mittel über 79 Bilder, sRGB-Abstand Brust↔Rasen): Team A 0,296 → 0,300, Team B 0,234 → 0,234, Team↔Team 0,057 → 0,064, Ball↔Rasen 0,645 → 0,727, Keeper↔Rasen 0,441 → 0,476; Feldhelligkeit 0,217 → 0,222; Himmel 0,119 → 0,056. Keine Kennzahl unter der Basis außer dunkle/helle Trikotluminanz (−0,001). Werkzeug: `outputs/style-demos/nighttime/compare-metrics.cjs`.
- **WebGL im echten Match** (`work/platform/qa/check-nighttime-webgl.cjs`, Edge headless, ANGLE D3D11 auf RTX 4070): echte GER-2-Karriere, Heimspiel, gesetzter `Math.random`, feste 0,05-s-Ticks, Vollbildlayout der Seite (`v132ScreenState`), Namen sichtbar (12/12). Bilder `outputs/style-demos/nighttime/webgl/{baseline,candidate}/`, Vergleich `webgl/compare/` (Anstoß und drei Spielzeitpunkte, beide Qualitätsstufen, drei Größen). Ich habe die tatsächlichen WebGL-Bilder angesehen.
- **Native Parität:** Basis- und Kandidatenbuild liefern an Tick 600/1200/2400/3190 identische Spielzeit, Spielstände, Ereigniszahl, Zufallsziehungen (39/120/264/346) und Ereignis-/Torlog-Hashes. Der Kamerarahmen unterscheidet sich bei kurzer Wartezeit, weil die Seite die Kamera wanduhrabhängig glättet; native Zustände sind gleich.
- **Aktionsclips** (animiertes WebP + Kontaktbogen, Nahkamera `near=100`, deterministische Bildfolgen à 0,1 s, je Basis und Kandidat): Pass, Schuss, Grätsche (normal/reduced), Keeper bis zum Tor 1:0 (normal/reduced), Tackling, Kopfball. `webgl/{candidate,baseline}-video/`. Gleiche Seeds/Ticks, gleiche Ereignisse in beiden Builds. Playwright-Video (webm) war nicht verfügbar, weil dessen ffmpeg fehlt; keine Installation vorgenommen.
- **Unity-Suiten** (`D6Cli.Tests`): Kandidat und Basis identisch – Stadium 706, Duel 43, Iteration 106, Keeper 160, Presentation119 437, NaturalMotion 2020/2020, Support 675/675, Kontakt 285/285, Kontinuität 20/20, R20 642/642, R15 341/342. Das eine R15-Gate ist die dokumentierte R18-Altlast (`R15Historical`, beyondR18=0), nicht neu.
- **Leistung, gleiche Hardware, 1280×720, 12 s Spiel:** Framezeit Median 14,7/14,7 ms, p95 17,7 → 17,6 ms (standard) und 17,6/17,6 ms (reduced); WebGL-Draw-Calls Median 140/140 (standard), 123/123 (reduced). Editor-Szenen: +1–2 Renderer (Halos), +1 Material, Schattenwerfer 66/66, Dreiecke +16, Stadiontexturen 1,14 → 1,61 MB (Himmel 256×128, Beton 128²).

## Geerbte und offene Grenzen

- Geerbt aus Release 130 und unverändert: R20/R21-Kontakt-/Übergangsruckler und Diagnosebefunde, Direktfreistoß-Vorbereitung vor bekanntem Ziel, Live-Verfolgung und Geh-/Traben-/Sprintwahl ([Bugliste](../Bugliste.md)); das R15-Altgate. Nighttime verdeckt oder ändert diese Befunde nicht.
- Nicht gemessen: Android-/Mobil-GPU, Wasm-Heap/Texturspeicher im Browser (nur Seiten-JS-Heap und Editor-Texturbytes), Software-WebGL. Die Browserwerte stammen von einer Desktop-GPU bei vsync-begrenzter Bildrate und belegen keine Smartphoneleistung.
- Bestehende Suite `work/platform/qa/check-world-unity.cjs` (Software-WebGL): mit Kandidat und mit Basisbuild bestehen dieselben neun Prüfungen (echtes Fixture, exakte Startspieler, Namen, pausiertes Rendern ohne Uhr-/Ballfortschritt, Checkpoint mit frischer Sitzung, Uhr/Stand/Aufstellung, Wechsel, Bewegung und maßgebliche Uhr); beide brechen identisch bei „Unity review uses the existing recorded match timeline“ ab (geerbte Suite-Abweichung zu Release 130, Logs `17-` und `18-check-world-unity*.log`). Halbzeit, Rückschau, Tor-Wiederholung, Neuladen, 2D-Rückfall und die vollständige 2D/Unity-Partie sind damit für den Kandidaten nicht nachgewiesen; Nighttime ändert keinen dieser Wege. Root/Sonnet prüfen sie mit der Release-130-Paketwerkzeugkette.
- Gestalterisch offen: Mehrfachschatten der vier Strahlerbänke, feuchte Glanzlichter und Dunst sind nicht umgesetzt; Bäume heben sich nur schwach vom Nachthimmel ab.

## Nächster Schritt

Root: unabhängige Browserabnahme mit `check-nighttime-webgl.cjs` (oder Sonnets Startwerkzeug) gegen den Kandidatenbuild, bestehende Browser-Suiten für Pause/Rückschau/Neuladen/2D, danach Gestaltungsrückmeldung. Danach Klares Low-Poly im eigenen Checkout.
