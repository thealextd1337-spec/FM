# Klares Low-Poly: Browserabnahme auf dem korrigierten Stand (Runde 4)

Stand 13. Oktober 2026, Sonnet 5.5. Gleiche Harness und gleiche Abschnitte wie in [Runde 1](low-poly-browser-pruefung.md), jetzt gegen das hashgebundene Paket des Fix-Kandidaten auf `http://127.0.0.1:4413/`. Alles sind Claims; Root entscheidet nach seiner Prüfung. Alles lokal und unveröffentlicht. Produkt, Unity-Projekt, Paket, Server und Git des Kandidaten blieben unverändert (nur gelesen, `git status` des Kandidaten vor und nach dem Lauf leer).

Kompakte Zusammenfassung: [low-poly-browser-pruefung-r4.json](low-poly-browser-pruefung-r4.json). Berichte, Bilder und Protokolle liegen im Kandidaten-Checkout unter `outputs/style-demos/lowpoly-fix/acceptance-sonnet-r4/` (nicht versioniert).

## Gebundener Stand

| | |
| --- | --- |
| Checkout / Branch | `work/demo-low-poly-fix`, `codex/demo-low-poly-fix-20261013`, sauber, HEAD `a6289dc32046875ca13974f7457ff3e608fbaa8d` |
| Paket | `outputs/style-demos/lowpoly-fix/package` (eigener `--out`), Server PID 78116, vor und nach dem Lauf `/__build` Feld für Feld gleich |
| `sourceId` | `644d9d928be9ea9d3ccd36f7049bbea40a333f9c5cd999dbddcbe5c9cd0211c9` |
| Quellenfingerprint | `b1ccfc9d81d5ada0a16b2e2d5c34a0c66616249d5a4568e8af288591c3098979` |
| Paketmanifest / Unity-Manifest | `b91ff0e6…0cdd2` / `f51e0226…6169` |
| HTML | `358d343b7dc044ffdde94cd78addfab8106e72365ae4b0302aacd609ac1f11db` |
| Harness | `work/style-demos/acceptance-browser.cjs`, Support-Commit `7c5f6e8e0e318e4085647d8034fd08eb380c4bdb`, SHA-256 `d9b330d7be7e4bddd9e845f76f3597a8734a6a2b2363ef5054f84c039825ca8b`, beim Lauf sauber committed |
| Umgebung | Node 24.19.0, Edge headless, echte GPU (ANGLE/D3D11 NVIDIA RTX 4070), isolierte Browserkontexte und Wegwerfprofile; kein Nutzerprofil, keine Nutzertabs |

## Änderung der Harness (Support-Commit 7c5f6e8e)

Nur der nötige generische Beweis, der Rest unverändert:

- Neue optionale Argumente `--expectGroundMesh NAME`, `--expectMeshVertices N`, `--expectGroundVertices N`. Ohne `--expectGroundMesh` läuft die Prüfung nicht (Nighttime und historische Pakete loggen das Feld nicht).
- Mit `--expectGroundMesh` muss auf **jeder** Seite, die `bindingChecks` durchläuft, die Konsolenzeile des Unity-Frames `[D6] match mesh WorldPlayerLowPoly-v4 vertices=6926 base=… mask=… ground=WorldPlayer vertices=9725` lauten (Prüfung `*-ground`). `ground=drawn`, ein fehlendes `ground=`-Feld (wie im Vorgängerstand `d8ae8785`), ein anderes Bodenmesh, andere Vertexzahlen oder ein Originalmesh als sichtbares Mesh lassen sie fehlschlagen. Die bestehende Prüfung `*-mesh` (sichtbares Mesh `WorldPlayerLowPoly-v4`) bleibt.
- Prädikat in `lib.cjs` (`matchMeshLines`), Test ohne Browser: `node work/style-demos/test-mesh-line.cjs` (12 von 12, darunter `ground=drawn` abgelehnt und Altformat ohne Bodenfeld bei Erwartung abgelehnt).
- Neues kleines Werkzeug `work/style-demos/contact-sheet.cjs` für Kontaktbögen zur Sichtprüfung (legt vorhandene Bilder nur verkleinert nebeneinander).

## Aufrufe

Alles aus dem Support-Checkout, Node 24. `<FIX>` = Kandidaten-Checkout, `<R>` = `<FIX>/outputs/style-demos/lowpoly-fix/acceptance-sonnet-r4`.

```sh
node work/style-demos/verify-package.cjs --style lowpoly --repo "<FIX>" --out "<FIX>/outputs/style-demos/lowpoly-fix/package" --deep --require-clean --url http://127.0.0.1:4413 --report "<R>/verify-before.json"

node work/style-demos/acceptance-browser.cjs --style lowpoly --repo "<FIX>" --url http://127.0.0.1:4413 --out "<R>/browser" \
  --only build,viewports,flow,goal,parity,reload,fallback,architectures --archViewports 1280x720,844x390,931x448 \
  --expectMeshVertices 6926 --expectGroundMesh WorldPlayer --expectGroundVertices 9725

node work/style-demos/parity-full.cjs --style lowpoly --repo "<FIX>" --url http://127.0.0.1:4413 --report "<R>/parity-full-lowpoly-fix.json"

# Altsuite im Kandidaten-Checkout; eigener Kurzzeitserver auf Port 4361 (nicht der Server auf 4413), Ausgabe getrennt:
cd "<FIX>" && D6_QA_OUTPUT="<R>/legacy-world-unity" node work/platform/qa/check-world-unity.cjs

node work/style-demos/verify-package.cjs …  --report "<R>/verify-after.json"   # gleicher Aufruf wie vorher

# Negativbeweis im echten Browser (falsche Erwartung, erwartet Fehlschlag, Exitcode 2):
node work/style-demos/acceptance-browser.cjs --style lowpoly --repo "<FIX>" --url http://127.0.0.1:4413 --out "<R>/negative-ground" --only fallback \
  --expectMeshVertices 6926 --expectGroundMesh WorldPlayerLowPoly-v4 --expectGroundVertices 6926
```

## Ergebnis

**Browserlauf: 390 Prüfungen, alle bestanden, 496 s, alle acht Abschnitte `pass`** (Runde 1: 344; die Mehrzahl entsteht durch die 46 neuen `*-ground`-Prüfungen, Bindung und Nutzdaten sind unverändert). Bericht `browser/acceptance.json`.

| Gruppe | bestanden | Inhalt |
| --- | --- | --- |
| `build` | 4 | Stil `lowpoly`, frisch, `probe-build.json`-`sourceId` = `/__build`, sauber/committed |
| `vp` | 42 | 1280×720, 844×390, 931×448 × standard/reduced (GER-2): Unity bereit, kein `lastError`, kein THREE, 12 Spieler/12 Labels, Mesh und Bodenmesh, Qualität im Ladebefehl, Spiel bis Minute 10, Pause hält als `paused` |
| `flow` | 17 | echte Pause-/Fortsetzen-Taste, eingefrorener Zustand, Halbzeit, 2. Halbzeit, Rückschau auf aufgezeichneter Zeitleiste (schreibgeschützt, Zurückspulen, Live-Rückkehr), Abpfiff gebucht und valide, Verlassen |
| `goal` | 3 | Seed 160112: echtes Tor aus der nativen Simulation (0:1), Wiederholung mit HUD und `replay`-Bild, kein zweites Tor |
| `parity` | 2 | gleiche Aufrufsequenz Unity und natives 2D: Digest `38893eb6`, gleiche Nutzdaten (wie Runde 1) |
| `reload` | 19 | isoliertes Profil: `page.reload()` und Browserneustart, gleicher `physicalSnapshot`-SHA256, Öffnen per Schaltfläche, Zustand identisch, Fortsetzen |
| `fb` | 10 | freiwilliger 2D-Wechsel und Rückkehr in 3D, fremde Nachricht wirkungslos, erzwungener Unity-Fehler und fehlender Build ergeben sichtbaren 2D-Rückfall, Partie läuft nativ weiter |
| `arch` | 289 | 6 Vereine × 2 Qualitäten × 3 Viewports, je 8 Prüfungen (inkl. Labelprüfung des Repositorys, 36 von 36 bestanden) |
| `network`, `console`, `page` | 4 | vier WebGL-Dateien über hashgebundene URLs mit `X-D6-Sha256` = Paketmanifest, Konsolenfehler nur der erwartete 404 des blockierten `probe-build.json`, 0 `pageerror` |

**Geladene Nutzdaten** (50 Seitenläufe, je 50 Anfragen pro Datei, alle 200, Header-Hash = Manifest): `unity-web.data` `00058f632661c735322a2d0f7d61918e83c28dab5226cc814014809ba94821f8`, `framework.js` `36ef379127938ada50294ade1111a1380d507e81359591f4156963b0420e1dcb`, `loader.js` `c49fdcbccf2b061a7f611e0b6cc56ce24bb4b5cdeb6a08fc6f8444939dea620f`, `wasm` `2de6a7d5d76fec7e6a7449f019b0127164723256fadfe06aaa5eb7ede1ca94ab`.

**Mesh-/Bodenbeweis:** 50 Konsolenzeilen `[D6] match mesh WorldPlayerLowPoly-v4 vertices=6926 base=d6_lowpoly_v4_base mask=d6_lowpoly_v4_mask ground=WorldPlayer vertices=9725`, alle gleich lautend, keine mit einem anderen Mesh oder `ground=drawn`. 46 Seiten laufen durch die Bindungsprüfungen und bestehen jeweils `*-mesh` und `*-ground`; `v98Scene` war nie gesetzt (kein THREE-Pfad). Vier weitere Seitenläufe ohne eigene Bindungsprüfung (u. a. Tor und Parität) haben dieselbe Zeile geloggt; sie ist in den 50 Zeilen enthalten. Negativ: dieselbe Harness mit falscher Erwartung (Bodenmesh `WorldPlayerLowPoly-v4`, 6926) schlägt im echten Browser mit genau `fb-ground` fehl (`ground=WorldPlayer statt WorldPlayerLowPoly-v4`, Exitcode 2, `negative-ground/`); das Prädikat lehnt `ground=drawn` im Test ab. Die Vorgängerversion `d8ae8785` wurde nicht erneut im Browser geladen (Server 4412 nicht angefasst).

**Vollständige Parität (`parity-full.cjs`):** 2D und Unity je 3037 Schritte, Digest `a6d98d83`, Nutzdaten-SHA256 `d0a8785eb42bef9851f2005fce1fa86e1200eb92a113460ca3dd5d4cd2ee8772`, Stand 0:0 – identisch zu Release 130, Nighttime und `d8ae8785`. Die Sequenzparität (`38893eb6`) ebenso.

**`verify-package --deep --require-clean`:** vor und nach dem Lauf 103/103, mit `--out` des Pakets und HTTP gegen 4413.

**Altsuite `check-world-unity.cjs`** (Kandidaten-Checkout, eigener Kurzzeitserver auf Port 4361 mit `dist/` und `outputs/platform/unity-web` des Kandidaten, dessen `probe-build.json` den Hash `f51e0226…` trägt, also dasselbe Unity-Manifest wie der Server auf 4413): Exitcode 0, 21 aufgezeichnete Prüfungen, `errors: []`, darunter „Unity review uses the existing recorded match timeline“, „Missing Unity build falls back to a playable 2D match“, „No uncaught page errors“. Das ist ein getrennter Lauf, kein Beleg für Port 4413; die Altsuite lädt keine Meshzeile. Die frühere Fehlschlagsursache bleibt eine Inferenz (festes Wartefenster), kein Beweis.

## Architekturtypen im echten WebGL-Spiel

Wie Runde 1 (Heimvereine, frühestes echtes Spiel, einmaliger Austausch der Vereinskennung beim nativen `v61CreateCareer` durch den QA-Helfer; keine erfundenen Fixtures oder Aktionsziele). Profile aus `ClubStadiumProfiles.cs`:

| Verein | Typ | Läufe (2 Qualitäten × 3 Viewports) |
| --- | --- | --- |
| GER-2 (`vp`/`flow`/…) | `dockside-ground` | 6 + Lebenszyklus |
| ENG-1 | `civic-bowl` | 6 |
| ENG-2 | `modern-ring` | 6 |
| ITA-1 | `industrial-shed` | 6 |
| ESP-4 | `urban-court` | 6 |
| ESP-5 | `garden-ground` | 6 |
| ITA-4 | `hillside-ground` | 6 |

Sieben von acht Typen; `sun-terraces` (ESP-3, ITA-6, POR-3) bleibt **nicht belegt** (diese Vereine beginnen die Saison auswärts; ich habe keine Fixture ausgewählt oder erzeugt). Je Lauf: Unity aktiv, 12 echte Spieler, Mesh und Bodenmesh, Ladebefehl nennt genau den Heimverein, Bilder zum Anstoß und bei Minute 5, Repository-Labelprüfung (`D6LabelQA`: keine Überlappung echt gerenderter Köpfe, nichts außerhalb des Viewports, Namen/Ringmuster, Nativzustand unverändert).

## Sichtprüfung

Angesehen habe ich Kontaktbögen (`browser/sheets/`, je sechs Bilder, 620 px breit) für GER-2 (Minute 10) und die sechs Vereine bei Minute 5, jeweils alle drei Viewports × standard/reduced (42 Bilder), dazu in voller Größe: ENG-1 1280×720 standard, ESP-4 844×390 reduced, Tor-Wiederholung, Rückschau, Halbzeit, erzwungener Fehler (2D-Rückfall), Neuladen nach Browserneustart und Abpfiff mit Spielbericht. **Nicht einzeln angesehen:** die Anstoßbilder (`*-kickoff`, Countdown verdeckt zwei Spieler), die `page-*`-Seitenlayoutbilder, `fallback-missing-build`, `fallback-2d-switch`, `fallback-return-3d`, `flow-01/02/04`, die Neuladebilder `reload-page.reload`.

- Alle sieben Stadien sind unterscheidbar; Spieler, Namen, Ringe und Ball sind bei allen drei Größen in standard und reduced lesbar. Zwischen standard und reduced ist der Unterschied klein (weniger Schatten/Kontur).
- **Dunkler, kontrastreicher Rasen** wie in Runde 1 (Karomuster GER-2/ESP-5, Querschnitte in ENG-2/ITA-1): dunkle Trikots stehen teils auf dunklen Feldern; Ringe und Namensbalken tragen die Lesbarkeit. Gestaltungsbeobachtung für Root/Opus, kein Funktionsfehler.
- **Bedienelemente und Namen:** Bei ESP-4 844×390 (standard und reduced) liegt der Name „Leroy“ am rechten Rand teilweise unter der Pause-/Vollbildtaste, und der Spieler dahinter wird von der Zeitleiste überdeckt. Die Labelprüfung (nur Viewportgrenzen und Überlappung der Köpfe) meldet das nicht; es handelt sich um bestehendes UI-Überlappen an der Bildecke, nicht um Mesh oder Rasen. In ENG-2 (844×390, 931×448) sind die Bedienelemente beim Screenshot im Ausblendzustand (halbtransparent).
- Spieler sind aus der Spielkamera klein; Verformungen und Kontaktqualität lassen sich aus diesen Bildern nicht beurteilen (Editor-Nahaufnahmen von Opus sind das Mittel).
- Die Rückschau- und Wiederholungsbilder zeigen den Stand zum Zeitpunkt der Wiederholung (HUD 0:0 bei Tor-Wiederholung, nativer Stand bereits 0:1), das vorhandene Verhalten.
- Der Flow-Lauf endet hier 0:1 (Runde 1: 0:0, Digest `fd35a898` statt `fe17ef2e`): Der Flow enthält echte Echtzeit-Schleifenabschnitte (Pause/Fortsetzen), deren Spielzeit nicht festgelegt ist. Der Digest ist deshalb kein Paritätsbeweis; Parität belegen `parity` und `parity-full`.

## Zeigerklicks und DOM-Aufrufe: Grenzen der Abdeckung

Unverändert gegenüber Runde 1. **Echte Zeigerklicks (Playwright):** sichtbare Pause-/Fortsetzen-Taste inklusive „2. Halbzeit starten“, Öffnen-Schaltfläche der gespeicherten Karriere nach Neuladen/Neustart. **Per `element.click()` oder Seitenfunktion:** Ansichtsschalter `[data-v98-view]`, Vollbildlayout (`v132ScreenState`), Verlassen (`v65Leave`), Rückschau-Zurückspulen (`v131Seek`), Live-Rückkehr (`D6QA160.returnLive`). **Deterministisch statt Echtzeit:** Halbzeit, 2. Halbzeit, Abpfiff, Tor und Parität mit festen 0,05-s-Schritten des QA-Helfers; Echtzeitschleife nur kurz. Desktop-Kontexte der drei Größen, keine Touch-/Mobilemulation.

## Anforderungen

| Anforderung | Ergebnis |
| --- | --- |
| `verify --deep --require-clean` vor und nach dem Lauf (eigener `--out`, HTTP 4413) | **bestanden** (103/103 beide) |
| Gebundener Stand, `/__build` vor = nach, Server und Kandidat unverändert | **bestanden** |
| Tatsächlich geladene Nutzdaten = Paketmanifest (4 Dateien, 50 Läufe) | **bestanden** |
| Sichtbares Mesh `WorldPlayerLowPoly-v4` (6926) und Bodenmesh `WorldPlayer` (9725) in der Konsole der Seiten, kein Original-/THREE-Fallback | **bestanden** (46 Seiten geprüft, 50 Zeilen gleich) |
| `ground=drawn`/fehlendes Bodenmesh schlägt fehl | **bestanden** (Prädikattest 12/12, Negativlauf im Browser) |
| Pause/Fortsetzen (echte Taste), Halbzeit, 2. Halbzeit, Abpfiff | **bestanden** |
| Rückschau auf aufgezeichneter Zeitleiste, schreibgeschützt | **bestanden** |
| Echtes Tor mit Wiederholung, kein Doppeltreffer | **bestanden** (Seed 160112, 0:1) |
| Speichern, `page.reload()`, Browserneustart im isolierten Profil | **bestanden** |
| 2D-Wechsel/Rückkehr, erzwungener Fehler, fehlender Build | **bestanden** |
| Vollständige 2D/Unity-Parität (`parity-full`, Sequenz) | **bestanden** (`a6d98d83`, `d0a8785e…`; `38893eb6`) |
| Viewports 1280×720, 844×390, 931×448 × standard/reduced, Bilder angesehen | **bestanden** (Auswahl siehe Sichtprüfung) |
| Keine Seiten-/Konsolenfehler außer dem bewussten 404 | **bestanden** (0 `pageerror`, 1 erwarteter 404) |
| Mindestens vier Architekturtypen im echten WebGL | **bestanden** (7 von 8) |
| `sun-terraces` im echten WebGL | **nicht belegt** |
| Altsuite `check-world-unity.cjs` | **bestanden** (21 Prüfungen, einmaliger Lauf, anderer Port) |
| Linksfuß-Kontakt aus nativen 20-Hz-Bildern für Folgegeometrie | **nicht belegt** (siehe unten) |
| Kontaktgeometrie des Meshs (Ball/Handschuhe/Rasen) | **nicht Teil dieser Abnahme**; Paritätsbeweis betrifft Nativbuchung, nicht Meshkontakt; Surface-Probe-Policy liegt bei Root |
| R15-Gate 341/342, R18-Sperre | **nicht bewertet**, nicht gelockert |
| FPS, Android, Speicher, Texturspeicher | **nicht belegt** (kein Auftrag) |

## Linksfuß-Kontakt: nicht belegt

Gesucht habe ich ein natives Feld für den Fuß der Ballberührung in den 20-Hz-Bildern oder im Vertrag (`WorldViewContract`, QA-Helfer, `dist`). Es gibt keins: Die Fußseite (`pose.kind` = `foot` oder `left-foot`) wird erst in Unity aus der Geometrie von Akteur und Kontaktpunkt abgeleitet (`FootballPresentation.cs`). Eine Aufzeichnung „natives Linksfußbild“ ließe sich daher nur aus Unity-Zustand ableiten, nicht aus Nativdaten; ich habe deshalb keine Seedsuche gestartet und nichts erfunden oder gespiegelt. Linksfußkontakt bleibt „nicht belegt“ (die Controlled-Surface-Fixtures von Opus sind rechtsfüßig).

## Offene Grenzen

- Funktionsprüfung auf einer Desktop-GPU: kein FPS-, Android-, Speicher- oder Pixelnachweis; Lesbarkeit ist Sichtprüfung einer Auswahl.
- Ein Seed je Szenario; Architekturen je Verein ein Seed bis Minute 5; kein Elfmeter, Platzverweis oder Verlängerung.
- `parity`/`parity-full` belegen Gleichheit der nativen Zustände, nicht der Darstellung oder des Meshkontakts.
- Ob die Bodenhaut sichtbar bleibt oder wegfällt, ist Sache der Unity-Prüfung von Opus/Root; der Browser belegt nur die geladene Zuordnung (Zeile `ground=WorldPlayer`), keine Bodenberechnung.
