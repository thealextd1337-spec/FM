# Klares Low-Poly: Browserabnahme des gepackten Kandidaten

Stand 13. Oktober 2026, Sonnet 5.5, Runde 1. Gleiche Harness und gleiche Abschnitte wie bei [Nighttime](nighttime-browser-pruefung.md), gegen das hashgebundene Low-Poly-Paket auf `http://127.0.0.1:4412/`. Alle Ergebnisse sind Claims; Root prüft unabhängig. Alles lokal und unveröffentlicht; Produkt, Unity-Projekt, Paket und Server blieben unverändert (nur gelesen).

Kompakte Zusammenfassung mit allen Hashes, Prüfgruppen und Architekturläufen: [low-poly-browser-pruefung.json](low-poly-browser-pruefung.json). Die vollständigen Berichte, Bilder und Protokolle liegen im Low-Poly-Checkout unter `outputs/style-demos/lowpoly/acceptance-sonnet-r1/` (nicht versioniert).

## Gebundener Stand

| | |
| --- | --- |
| Checkout / Branch | `work/demo-low-poly`, `codex/demo-low-poly-20261013`, sauber, HEAD `d8ae87854aff9f51e3ff0a54338938184c5283ed` |
| `sourceId` | `46a6e081054ba81328e69ba8a01f66daaf0470bb2263b3de17f3f14369f3a4b8` |
| Quellenfingerprint | `7280ec2dce54f27c7b5d3fa3514978a2c776d68c68123dc5177f3cb61734a9b2` |
| HTML | `358d343b7dc044ffdde94cd78addfab8106e72365ae4b0302aacd609ac1f11db` |
| Unity-Manifest | `dc0481f10c25efbcc529a4ddc05b36ff7927199f57301d3dfaca9b10d233336d` |
| Paketmanifest | `023c93bd87c1d0d6ced39050db948b0544063d327a754b01072acd2835b72cc1` |
| Server | PID 90676, vor und nach dem Lauf unverändert (`/__build` Feld für Feld gleich, alle Dateihashes) |
| Harness | `work/style-demos/acceptance-browser.cjs`, Support-Commit `531396c9`, SHA-256 `b1aa5bf27756adffee4baccb0c4e150dd82d2121824ea16de0792662394bf5e1`, sauber committed |
| Umgebung | Node 24.19.0, Edge (headless, echte GPU, ANGLE/D3D11 NVIDIA RTX 4070), isolierte Browserkontexte und Wegwerfprofile |

## Aufruf

Alles aus dem Support-Checkout, Node 24, Server auf 4412 läuft (wird nur gelesen). `<LP>` = Pfad des Low-Poly-Checkouts.

```sh
node work/style-demos/verify-package.cjs --style lowpoly --repo "<LP>" --deep --require-clean --url http://127.0.0.1:4412 --report "<LP>/outputs/style-demos/lowpoly/acceptance-sonnet-r1/verify-before.json"

node work/style-demos/acceptance-browser.cjs --style lowpoly --repo "<LP>" --url http://127.0.0.1:4412 \
  --out "<LP>/outputs/style-demos/lowpoly/acceptance-sonnet-r1/browser" \
  --only build,viewports,flow,goal,parity,reload,fallback,architectures \
  --archViewports 1280x720,844x390,931x448

node work/style-demos/parity-full.cjs --style lowpoly --repo "<LP>" --url http://127.0.0.1:4412 --report "<LP>/outputs/style-demos/lowpoly/acceptance-sonnet-r1/parity-full-lowpoly.json"

# Altsuite, im Checkout, Ausgabe getrennt (schreibt nur nach D6_QA_OUTPUT):
cd "<LP>" && D6_QA_OUTPUT="<LP>/outputs/style-demos/lowpoly/acceptance-sonnet-r1/legacy-world-unity" node work/platform/qa/check-world-unity.cjs

node work/style-demos/verify-package.cjs ... --report ".../verify-after.json"     # gleicher Aufruf wie vorher
```

`--style lowpoly` setzt die Mesherwartung `WorldPlayerLowPoly-v4` (überschreibbar mit `--expectMesh NAME`). `architectures` ist nur auf Anforderung aktiv (nicht in der Standardliste, die für Nighttime unverändert bleibt).

## Erweiterungen der Harness in dieser Runde

- **Mesh-Ladebeweis:** Die Konsole des Unity-Frames wird je Seite mitgeschrieben (`[D6]`-Zeilen). `WorldViewBridge` meldet beim Laden `[D6] match mesh <name> vertices=… base=… mask=…`. Jede geöffnete Partie muss genau das erwartete Mesh melden; ein Originalmesh (`WorldPlayer`) oder jedes andere Mesh lässt die Prüfung `*-mesh` fehlschlagen. Zusammen mit `no-three` (kein `v98Scene`) gibt es keinen stillen THREE-/Originalpfad.
- **Konsolenfehler-Gate:** Jede `console.error` ist mit dem Szenario markiert; erlaubt ist nur der 404 des bewusst blockierten `probe-build.json` (Szenario „missing-build“). Alles andere lässt `console-errors` fehlschlagen.
- **Abschnitt `architectures`:** Echte Karrieren mit anderen Ligavereinen über den unveränderten QA-Helfer `D6QA160.setup` (einmaliger Austausch der Vereinskennung beim nativen `v61CreateCareer`, sonst unverändert: Seed 160112, Marktphase, frühestes echtes Spiel des Vereins). Es gibt keine erfundenen Fixtures, Tore oder Aktionsziele. Je Verein × Qualität × Viewport: Unity aktiv, kein THREE, 12 echte Spieler im ACK, Mesh-Ladezeile, Ladebefehl nennt genau diesen Heimverein (`teams[].home`) mit dem erwarteten Profil aus `ClubStadiumProfiles.cs`, Bilder zum Anstoß und bei Minute 5, die Repository-Labelprüfung `unity-label-readability.js` (`D6LabelQA`: keine Überlappung der echt gerenderten Köpfe, nichts außerhalb des Viewports, Namen/Ringmuster, Nativzustand unverändert).
- Hinweis: Die Anstoßbilder zeigen noch den Countdown „2 … hat Anstoß“; er verdeckt zwei Spieler und deren Namen. Für Lesbarkeit zählen die Bilder bei Minute 5.

## Ergebnis (344 Prüfungen, alle bestanden; 483 s)

| Gruppe | Prüfungen | Inhalt |
| --- | --- | --- |
| `build` | 4 | Stil `lowpoly`, frisches Paket, `probe-build.json`-`sourceId` = `/__build`, sauber/committed |
| `vp` | 36 | 1280×720, 844×390, 931×448 × standard/reduced (GER-2): Unity bereit, kein `lastError`, kein THREE, 12 Spieler/12 Labels, Mesh, Qualität im Ladebefehl, Spiel bis Minute 10, Pause hält als `paused` |
| `flow` | 16 | echte Pause-/Fortsetzen-Taste, eingefrorener Zustand, Halbzeitpause, 2. Halbzeit per Taste, Rückschau (144 aufgezeichnete Bilder, 0 bis 126 s, 7 Marker), Zurückspulen, Live-Rückkehr, Abpfiff gebucht und valide (Digest `fe17ef2e`, 0:0), Verlassen |
| `goal` | 3 | Seed 160112: echtes Tor 0:1 aus der nativen Simulation, Wiederholung mit HUD und `replay`-Bild, danach kein zweites Tor |
| `parity` | 2 | gleiche Aufrufsequenz (20′, Pause, Fortsetzen, Halbzeit, 60′, Checkpoint, Abpfiff) Unity und natives 2D: 1194 Schritte, Digest `38893eb6`, gleiche Nutzdaten |
| `reload` | 17 | isoliertes Profil: `page.reload()` und vollständiger Browserneustart, derselbe `physicalSnapshot`-SHA256 im Speicher, Öffnen per Schaltfläche, Zustand identisch, Fortsetzen |
| `fb` | 9 | freiwilliger 2D-Wechsel und Rückkehr in 3D, fremde Nachricht wirkungslos, erzwungener Unity-Fehler und fehlender Build ergeben sichtbaren 2D-Rückfall mit Meldung, Partie läuft nativ weiter |
| `arch` | 253 | 6 weitere Architekturtypen, siehe unten |
| `network`, `console`, `page` | 4 | vier WebGL-Dateien über hashgebundene URLs mit `X-D6-Sha256` = Paketmanifest, keine HTTP-Fehler außer dem blockierten Manifest, Konsolenfehler nur der erwartete 404, 0 `pageerror` |

**Geladene Nutzdaten (50 Seitenläufe, je 50 Anfragen, alle 200, Header-Hash = Manifest):** `unity-web.data` `eaa475e7efaeed967b96ba92dff1c8f79e24f1ff6017ce792d1addac21bd3f66`, `framework.js` `36ef379127938ada50294ade1111a1380d507e81359591f4156963b0420e1dcb`, `loader.js` `2909e971e5efe53176965433a410d0e296ff3b44b77cf358c66a4ffacdaf1968`, `wasm` `0f956190890ca9dc61e08c33914bb8bf4203242fd9c249a34b89b5ee51636057`. 50 Konsolenzeilen `[D6] match mesh WorldPlayerLowPoly-v4 vertices=6926 base=d6_lowpoly_v4_base mask=d6_lowpoly_v4_mask`, keine mit einem anderen Mesh.

**Vollständige Parität (`parity-full.cjs`, anderes Szenario mit voller Partie):** 2D und Unity je 3037 Schritte, Digest `a6d98d83`, Nutzdaten-SHA256 `d0a8785eb42bef9851f2005fce1fa86e1200eb92a113460ca3dd5d4cd2ee8772`, Stand 0:0; dieselben Werte wie Release 130 und Nighttime.

**`verify-package --deep --require-clean`:** vor und nach dem Lauf 103/103.

**Altsuite `check-world-unity.cjs`** (im Checkout, Ausgabe getrennt): läuft vollständig durch, 21 aufgezeichnete Prüfungen, `errors: []`, einschließlich „Unity review uses the existing recorded match timeline“. Die Prüfung schlug bei Nighttime in zwei früheren Läufen fehl (siehe dort); hier bestand sie in einem einzigen Lauf. Die Ursachenaussage (festes 180-ms-Fenster) bleibt eine Inferenz, kein Beweis.

## Architekturtypen im echten WebGL-Spiel

Nur die sechs Ligavereine je Land lassen sich als Karriereverein übernehmen (`ENG-C1` usw. nicht). Deren frühestes echtes Spiel ist bei den folgenden Vereinen ein Heimspiel, sodass das Stadion das Profil des eigenen Vereins ist. Je Verein 2 Qualitäten × 3 Viewports (36 Läufe, je 7 Prüfungen):

| Verein | Profil (`ClubStadiumProfiles.cs`) | Typ |
| --- | --- | --- |
| GER-2 (Abschnitte `vp`/`flow`/…) | Weser Dock Park, steel-truss | `dockside-ground` |
| ENG-1 | Regent Vale Gardens, brick-arcade | `civic-bowl` |
| ENG-2 | Irwell Arena, metal-fins | `modern-ring` |
| ITA-1 | Centrale Works Stadium, steel-truss | `industrial-shed` |
| ESP-4 | Union Patio Ground, tiled-parapet | `urban-court` |
| ESP-5 | Delta Youth Park, tiled-parapet | `garden-ground` |
| ITA-4 | Collina Terrace, limestone-step | `hillside-ground` |

Sieben von acht Typen sind damit im echten WebGL-Match belegt. **Nicht belegt:** `sun-terraces` (ESP-3, ITA-6, POR-3). Diese Vereine beginnen die Saison auswärts; ein Heimspiel wäre erst später in der Saison erreichbar, und ich habe keine Fixture ausgewählt oder erzeugt. Der Typ bleibt im Editor belegt (Übergabe Opus). Bilder: `browser/shots/arch-*` und Kontaktbögen `browser/sheets/arch-*.png`.

## Sichtprüfung der Screenshots

Angesehen habe ich (Kontaktbögen mit je sechs Bildern, ca. halbe Breite, dazu Einzelbilder in voller Größe):
Architekturen bei Minute 5 für 1280×720 standard, 1280×720 reduced, 844×390 standard und 931×448 reduced (je alle sechs Vereine), die sechs GER-2-Viewportbilder bei Minute 10 und im pausierten Zustand, den Spielfluss (Setup, Echtzeit, Halbzeit, 2. Halbzeit, Rückschau, Abpfiff mit Spielbericht), die Tor-Wiederholung in voller Größe, 2D-Wechsel/Rückkehr/Fehler/fehlender Build, beide Neuladebilder, ein Anstoßbild (ENG-1) in voller Größe. **Nicht angesehen:** die Architekturbilder bei 844×390 reduced, 931×448 standard, die Anstoßbilder der übrigen Vereine und die Seitenlayout-Bilder `page-*`; sie liegen in `browser/shots/`. Die Bilder bei halber Breite sind für Namenslesbarkeit nur eingeschränkt aussagekräftig; dafür dienen die Labelprüfung (`arch-*-label-qa`) und die Einzelbilder.

- Die sieben Stadien sind klar unterscheidbar (Dachform, Tribünenfarben des Heimvereins, Sitzreihen, Fassadenmotive); der Stil ist über alle konsistent. Spieler, Namen, Ringe und Ball sind in allen Größen lesbar.
- Auffällig ist der **dunkle, kontrastreiche Rasen**: Beim Karomuster (GER-2, ESP-5) sind die breiten Felder deutlich sichtbar, einzelne dunkle Trikots stehen auf dunklen Feldern. Die Ringmarkierungen tragen die Lesbarkeit. Das passt zur gemessenen Abweichung (Team↔Rasen 3 bis 6 % unter der Basis), ist aber ein Gestaltungspunkt für Root/Opus, kein Funktionsfehler.
- Aus der Spielkamera sind die Figuren klein; die Meshqualität zeigen die Editor-Nahaufnahmen von Opus, nicht diese Bilder.
- Die Tor-Wiederholung zeigt im HUD den Stand zum Zeitpunkt der Wiederholung (0:0, Uhr 49:07) während der native Stand bereits 0:1 ist; das ist das vorhandene Wiederholungsverhalten und wurde nicht verändert.

## Zeigerklicks und DOM-Aufrufe: Grenzen der Abdeckung

- **Echte Zeigerklicks (Playwright):** sichtbare Pause-/Fortsetzen-Taste inklusive „2. Halbzeit starten“ und Wiederaufnahme nach Neuladen, Öffnen-Schaltfläche der gespeicherten Karriere.
- **Per `element.click()`/Seitenfunktion statt Zeiger:** die Ansichtsschalter `[data-v98-view]` (im Seitenlayout deckt das Unity-iframe die Werkzeugleiste ab), Vollbildlayout (`v132ScreenState`), Verlassen der Partie (`v65Leave`), das Zurückspulen der Rückschau (`v131Seek` und Setzen der Rückschauzeit, kein Ziehen des Schiebereglers), Live-Rückkehr (`D6QA160.returnLive`).
- **Deterministisch statt Echtzeit:** Halbzeit, 2. Halbzeit, Abpfiff, Tor und Parität werden mit festen 0,05-s-Schritten des QA-Helfers (`D6QA160.run`) gespielt; die Echtzeitschleife der Seite läuft nur kurz (Pause-/Fortsetzen-Beweis, 1,5 s Spielzeit). Es ist kein Dauerlauf in Echtzeit.
- Desktop-Kontexte mit den drei Viewportgrößen, **keine** Touch-/Mobilemulation, kein echtes Telefon.

## Anforderungen

| Anforderung | Ergebnis |
| --- | --- |
| `verify --deep --require-clean` vor und nach dem Lauf | **bestanden** (103/103 beide) |
| Gebundene Quelle, `/__build` vor = nach, Server unverändert | **bestanden** |
| Tatsächlich geladene Nutzdaten = Paketmanifest (4 Dateien, 50 Läufe) | **bestanden** |
| `WorldPlayerLowPoly-v4` im Browser geladen, kein Original-/THREE-Fallback | **bestanden** (50/50 Seiten, `v98Scene` nie gesetzt) |
| Pause/Fortsetzen (echte Taste), Halbzeit, 2. Halbzeit, Abpfiff | **bestanden** |
| Rückschau auf aufgezeichneter Zeitleiste, schreibgeschützt | **bestanden** |
| Echtes Tor mit Wiederholung, kein Doppeltreffer | **bestanden** (Seed 160112, 0:1) |
| Speichern, `page.reload()`, Browserneustart im isolierten Profil | **bestanden** |
| 2D-Wechsel/Rückkehr, erzwungener Fehler, fehlender Build | **bestanden** |
| Vollständige 2D/Unity-Parität (`parity-full`, Sequenz-Parität) | **bestanden** (`a6d98d83`, `d0a8785e…`; `38893eb6`) |
| Viewports 1280×720, 844×390, 931×448 × standard/reduced | **bestanden** (Bilder angesehen, siehe oben) |
| Keine Seiten-/Konsolenfehler außer dem bewussten 404 | **bestanden** (0 `pageerror`, 1 erwarteter 404) |
| Mindestens vier Architekturtypen im echten WebGL | **bestanden** (7 von 8) |
| `sun-terraces` im echten WebGL | **nicht belegt** (kein Heimspiel am Saisonbeginn erreichbar) |
| Altsuite `check-world-unity.cjs` | **bestanden** (21 Prüfungen, einmaliger Lauf) |
| R15-Gate 341/342 (`plant-edge@120Hz/receive … joint speed`) | **nicht Teil dieser Abnahme**, weder bewertet noch gelockert; R18-Sperre bleibt offen (Root/Fable) |
| FPS, Android, Speicher, Texturspeicher | **nicht belegt** (kein Auftrag) |

## Offene Grenzen

- Funktionsprüfung auf einer Desktop-GPU, kein FPS-/Android-/Speichernachweis, keine Pixelprüfung; Lesbarkeit ist Sichtprüfung.
- Ein Seed je Szenario (GER-2, Bremen–Köln); für die Architekturen je Verein ein Seed und bis Minute 5. Tore ergeben sich aus der Simulation; kein Elfmeter, Platzverweis oder Verlängerung.
- `parity` und `parity-full` belegen Gleichheit der nativen Zustände, keine Gleichheit der Darstellung.
- Die Altsuite bleibt auf einem ruhigen System zu betreiben (festes Wartefenster).
- Die Ursache des früheren Altsuite-Fehlers ist nicht abschließend geklärt (siehe Nighttime-Dokument).
