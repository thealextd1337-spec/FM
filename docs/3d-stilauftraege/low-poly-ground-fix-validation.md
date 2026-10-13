# Klares Low-Poly: Unity-Validierung und Build der Bodenkorrektur

Stand 13. Oktober 2026, Opus 5.5, Runde 3. Branch `codex/demo-low-poly-fix-20261013` im Checkout `work/demo-low-poly-fix`, Unity-Projekt `G:/unity/Doppel6-LowPoly-Demo` (6000.6.4f1). Quellstand und Begründung: [Vorbereitung](low-poly-ground-fix-preparation.md) (Runde 2, historisch; dort steht „47“ Identitätsdateien für den alten Kandidaten, richtig sind 46). Ergebnisse sind Claims; die abschließende Browserabnahme macht Root/Sonnet. Der eingefrorene Kandidat `d8ae8785` (Quellkennung `46a6e081…`, Server 4412) und sein Paket blieben unberührt.

**Runde 4 (unten):** Beide P2-Befunde aus Sonnets Review sind mit Code, Negativlauf und Messung geschlossen; Laufzeit und Quellkennung unverändert, WebGL neu gebaut. **Ergebnis Runde 3:** Die Korrektur funktioniert in Unity ohne Quelländerung gegenüber `e7754f4c`. Mit dem Low-Poly-Mesh sind alle 4.001 Bewegungs-, Support-, Kontakt-, Kontinuitäts-, R15-, R20- und Determinismusgates bitgleich zum Originallauf; die R18-Sperre steht wieder exakt auf `2102.81884765625`. Keine Grenze wurde verändert. Sichtbare Low-Poly-Sohlen werden am gezeichneten Skin gemessen: absolut mit den bestehenden Grenzen bei Fortbewegung und gewöhnlichen Aktionen (Stiefel); gekoppelt (höchstens 1 cm schlechter als das Original im selben Bild, ab Runde 5 zusätzlich höchstens 1 cm Formabweichung in beide Richtungen) bei Ball, Keeperparaden und Rutschen. Das ist eine zusätzliche QA-Grenze für ein kontrolliertes Retopologie-Mesh, keine bestehende Controller-Grenze und kein Nachweis „bitgleicher Geometrie“.

## Runde 5: Quellenkorrektur der QA nach Sonnets Review R3 (nur Quellen, in Unity noch nicht ausgeführt)

Stand 13. Oktober 2026, Sonnet 5.5, Basis `a6289dc3`, Branch `codex/demo-low-poly-surface-qa-20261013` (Checkout `work/demo-low-poly-surface-qa`). Review: `outputs/style-demos-20261013/sonnet-ground-review-r3/review.md` (0 P1, 2 P2). Geändert sind nur `LowPolyGroundDiagnostics.cs` (`VisibleSurfaceProbe`, Wächter) und `NaturalMotionDiagnostics.cs` (Editor, nicht in Quellkennung/Manifest): `sourceId` bleibt `644d9d92…` (46 Dateien); WebGL-Payload, Laufzeit, Rig, Clips, Bewegungs- und Kontaktgates und Spielstände unverändert, kein neuer Build. Statisch kompiliert (Unity-Roslyn gegen 6000.6.4f1, Editor 54 Dateien, Player 20 Dateien: je 0 Fehler). **Die neuen Wächter und Grenzen sind noch in keinem Unity-Lauf ausgeführt.** Ob der echte Kandidat sie besteht, zeigt erst der nächste Lauf; überschreitet ein Wert 1 cm, wird das berichtet, die Grenze nicht aufgeweicht.

**Korrigierte Aussage.** Absolut (bestehende Grenzen, streng) gelten die Stiefel bei Fortbewegung (−1 cm) und gewöhnlichen Aktionen (−2 cm) sowie beim Rutschen für Stiefel (−3,5 cm). Gekoppelt gegen das Original im selben Bild (höchstens 1 cm) gelten: Stiefel und Körper in Keeperparaden, Körper beim Rutschen, Stiefelfläche am Ball und Handschuhfläche am Ball; dort scheitert das Original selbst an den absoluten Grenzen. Die Paarung ist eine gewählte QA-Konvention (1 cm), kein abgeleiteter Vertrag. Aufgezeichnete Abweichungen: 1 Kandidat-nur-Überschreitung (Fuß–Ball −3,117 statt −2,989 cm bei 3 cm, 1,3 mm), 17 Fuß–Ball- und 48 Rutsch-Bilder schlechter als das Original (≤ 2,9 mm), Keeperkörper bis 8 mm (Körper > 4 cm über dem Rasen, kein Kontakt). Handschuh am Ball: nur 1 Bild (kontrollierter Fang); Fuß am Ball: nur der rechte Fuß (der linke ist nicht belegt); native Wiederholungen messen nur jedes 6. Bild, und die verglichenen Formen sind ausgewählt. Das ist kein Nachweis über alle Bilder und kein Beleg bitgleicher oder durchgehend absolut bestandener Geometrie.

### P2-1 Einseitige Paarungsmetrik – Quelle behoben

- **Fuß- und Handschuhlücke:** Die gekoppelte Prüfung verlangt jetzt zusätzlich die vorzeichenbehaftete Differenz |Kandidat − Original| ≤ `PairTolerance` (0,01 m) statt |c|−|r|. Ein Ballabstand, der das Vorzeichen wechselt (Kandidat +0,05 / Original −0,05, gleicher Betrag), fällt jetzt durch; vorher war der Mehrbetrag 0.
- **Je Hand:** Der Handschuh am Ball wird je angeforderter Hand gegen dieselbe Hand des Originals bewertet (`left|right glove surface to held/contact ball surface m`), nicht mehr als Wert der Hand mit dem größeren Betrag. Eine Hand kann keine andere verdecken.
- **Schwebende Stiefel:** Der tiefste Stiefelpunkt je Fuß (absolut und gekoppelt) hat zusätzlich die zweiseitige Schranke |Kandidat − Original| ≤ 0,01 m. Die absoluten Grenzen (Fortbewegung −1 cm, Aktion −2 cm, Rutschen −3,5 cm, strenger Mehrbetrag 1e-4 m) und die Klassifikation bleiben unverändert; die Verschiebung steht getrennt im Bericht (`shift`, `shiftWorst`, `shapeFailed`). Der tiefste Körperpunkt bleibt unverändert (keine Formschranke).
- **Wächter** (bestehende Tests in `LowPolyGround`, kein neues Framework): (1) Skalarfälle der Formel (Vorzeichenwechsel am Ball, schwebender Stiefel, 10,3 mm scheitert, 10,0 mm und die gemessenen 5,1 mm bestehen); sie belegen die mathematische Lücke der alten Regel, nicht die Abdeckung echter nativer Kontakte. (2) Echtes Mesh auf dem vorhandenen Sentinel-Rig und Bodenskin: Stiefel 4 cm höher im Stand (absolute Grenze besteht, Formschranke scheitert). (3) Beide Handschuhe am Ball, nur der rechte 8 cm aufgeblasen: die rechte Hand scheitert für sich. Beibehalten: Stiefel 4 cm tiefer, Handschuhe aufgeblasen, geerbter Pfad. Zusätzlich muss `LowPolyGround` Galerie (342) und Rutschen (150) vollständig gemessen haben.
- **Statische Datenprüfung** (`outputs/style-demos/lowpoly-surface-qa-preparation/static-shape-fit.json`, nur Lesen der eingefrorenen Berichte von `work/demo-low-poly-fix`): In den 684 Stiefelbildern der Clipgalerie (`all`) weicht der Kandidat höchstens +5,1 mm / −1,5 mm vom Original ab, 0 Verstöße. Von den übrigen Berichten liegen nur gespeicherte Einträge vor (Rutsch-Hüllkurve 4, natürliche Bewegung 161, davon 153 Fuß–Ball, Keeper 21): 0 Verstöße, höchste Abweichung 3,6 mm (Fuß–Ball). Die nicht gespeicherten Bilder (die meisten der 14.670 und 561) und die Handschuhe je Hand sind damit nicht belegt.

### P2-2 Aussagen – qualifiziert

Kopfsatz oben und CHANGELOG sind qualifiziert (absolut / gekoppelt, Ausnahmen, Bildzahlen). Die Tabellen in Runde 4 bleiben als Messergebnisse dieser Runde korrekt; „nur bestehende Grenzen“ gilt dort für die absoluten Größen, die Paarung und die Formschranke sind zusätzliche QA-Grenzen. Die Läufe aus Runde 4 werden nicht rückwirkend als Beleg der neuen Schranken gelesen.

### Weitere Absicherung

`NaturalMotion` (unfiltert, erzwungen) scheitert, wenn die Szene ein Ersatzmesh samt Bodenmesh hat und `VisibleSurfaceProbe.Pictures==0` ist; der Originalpfad ohne Bodenskin bleibt ohne Messung. Es wird nicht verlangt, dass es Kontaktbilder gibt.

### Nächste Prüfung (nicht gelaufen)

Nach Sync des Quellstands ins Unity-Projekt `G:/unity/Doppel6-LowPoly-Demo` (Root, nach Fast-Forward), je `Unity.exe -batchmode -projectPath G:/unity/Doppel6-LowPoly-Demo -logFile <log> -d6repo <Repo> -executeMethod …`:

1. `D6Cli.LowPolyGround -d6output outputs/style-demos/lowpoly-fix/unity-r5`: Wächter, Zahlenregeln, `gallery`/`slides` mit `shiftWorst`/`shapeFailed` (erwartet 0), `sentinelFloat`, `sentinelHands`.
2. `D6Cli.Tests -d6output outputs/style-demos/lowpoly-fix/tests-v4-r5`: Keeper-Suite mit je Hand gepaartem Fang (`visible-surface-keeper.json`).
3. `D6Cli.NaturalMotion -d6output outputs/style-demos/lowpoly-fix/motion-r5 -d6label gates`, erzwungen: `visible-surface.json` mit Formabweichungen der 14.670 Bilder und der Abdeckungsprüfung.

Danach `shiftWorst` je Größe dokumentieren; Abweichungen über 1 cm werden berichtet, nicht verbreitert.

## Runde 4: Antwort auf Sonnets Review (2 × P2)

Stand 13. Oktober 2026, Opus 5.5, Start `833dba25`. Review: `outputs/style-demos-20261013/sonnet-ground-review-r2/review.md`. Laufzeitquellen unverändert: `sourceId` bleibt `644d9d92…` (46 Dateien; Git-Objekte = Arbeitsbytes, Roots `verify-git-identity.cjs HEAD` und `check-identity-git-objects.cjs HEAD` bestanden). Geändert sind nur Editor-Code (`D6Cli.cs`, `LowPolyGroundDiagnostics.cs`, `NaturalMotionDiagnostics.cs`, `FootballKeeperTests.cs`) und der damit neu gebaute WebGL-Stand. Logs `outputs/style-demos/lowpoly/logs/60…73-*.log`.

### P2-1 Build ohne Bodenmesh – behoben

- `D6Cli.WebBuild` ruft vor jeder Einstellungsänderung `D6Cli.WebBuildPreflight(Probe.unity)` auf. Die Prüfung öffnet die gespeicherte Szene von der Platte: Ein Ersatz-Matchmesh braucht `WorldPlayer.asset` als Bodenmesh mit identischen Bindposes, und beide Meshes müssen gespeicherte Szenenabhängigkeiten sein; das Releasemesh braucht keines (oder sich selbst). Sonst bricht der Build ab, bevor `BuildPipeline` startet. Der Originalpfad ohne Ersatzmesh ist unverändert.
- **Echter Negativlauf** (`outputs/style-demos/lowpoly-fix/tools/webbuild-negative.sh`, Log 72): Szene in den d8ae8785-Zustand gesetzt (`groundPlayerMesh: {fileID: 0}`), echter `D6Cli.WebBuild`-Aufruf → `FAILED Build preflight: match mesh WorldPlayerLowPoly-v4 has no ground mesh …` nach 11 s, kein Buildschritt im Log, `outputs/platform/unity-web` bytegleich, Szene danach bytegleich zurückgesetzt (`0cb721dd…`).
- In `LowPolyGround` zusätzlich: gespeicherte Szenenkopie im d8ae8785-Zustand verweigert; sieben Speichervarianten (ohne Boden, Boden = Matchmesh, fremdes Bodenmesh, Release mit fremdem Boden verweigert; Low-Poly mit `WorldPlayer`, Release ohne/mit sich selbst akzeptiert); Szene danach unverändert und nicht dirty.
- Positiver Lauf (Log 73): `WebBuild preflight: match mesh WorldPlayerLowPoly-v4, ground WorldPlayer (9725 vertices, 28 bind poses), both saved scene dependencies`, danach Build erfolgreich.
- Optionaler Laufzeitwurf nicht eingebaut (würde die Quellkennung ändern; der Build ist die maßgebliche Stelle).

### P2-2 Sichtbare Oberfläche – neue gekoppelte Prüfung

`VisibleSurfaceProbe` (in `LowPolyGroundDiagnostics.cs`) misst je Bild den gezeichneten Low-Poly-Skin gegen den Bodenskin desselben Akteurs. Der Bodenskin ist das Releasemesh auf denselben Knochen in derselben Pose (Bake bitgleich zum Releaseskin, Posen 342/342 und Rutschungen 150/150 bitgleich), also eine Releasereferenz im selben Bild. Regionen nach Hauptknochen: Stiefel (Foot/ToeBase/Toe_End), Handschuh (Hand und Finger), Körper (alles außer Stiefeln, Handschuhe eingeschlossen). Ohne Bodenskin (Originalpfad) wird nichts gemessen und keine Datei geschrieben.

Zwei Gate-Arten, nur bestehende Grenzen:

| Art | Größe | Grenze | Regel |
| --- | --- | --- | --- |
| absolut | tiefster Stiefelpunkt | Fortbewegung −1 cm (natural-motion), Rutschen −3,5 cm (Duel, Stiefel im Rutscheinstieg), sonst −2 cm (r11) | innerhalb besteht; außerhalb nur „geerbt“, wenn die Releasereferenz ebenfalls außerhalb liegt und der Kandidat höchstens 1e-4 m schlechter ist; Kandidat-allein und Kandidat-schlechter scheitern |
| absolut | tiefster Körperpunkt (mit Handschuhen) | Fortbewegung −1 cm, sonst −2 cm (die r11-Hautsohle) | wie oben (natural-motion, Clipgalerie außer Rutschen) |
| gekoppelt | Stiefelfläche zum angenommenen Ball (nächstes Dreieck zum Ballmittelpunkt minus Radius), Handschuhfläche zum gehaltenen/Kontaktball, Stiefel und Körper in Keeperparaden, Körper beim Rutschen | 3 cm bzw. −2 cm werden je Bild klassifiziert und berichtet | Kandidat höchstens 0,01 m schlechter als die Releasereferenz im selben Bild |

Warum gekoppelt: Für diese Größen erfüllt schon die gezeichnete Releasefläche die bestehende Grenze nicht – die Grenze kann den Kandidaten dort nicht beurteilen. Die r11-Kontaktregel (3 cm) ist auf einem Knochenmodell definiert (Knochen + 4 cm Stiefel; die bestehende r11-Prüfung bleibt unverändert und besteht); die gezeichnete Releasestiefelfläche liegt in 152 von 356 nativen Kontaktbildern 3,0–5,2 cm im Ball. Der gehaltene Ball liegt im Original 9,1 cm in den Handschuhen. Releasestiefel in Paraden reichen bis 8,9 cm unter den Rasen, die Stützhand beim Rutschen bis 23,6 cm. 0,01 m ist die engste bestehende sichtbare Grenze (Fortbewegungssohle) und strenger als die 3-cm-Kontaktgrenze. Jede absolute Überschreitung bleibt je Bild mit Kandidat, Referenz, Mehrbetrag und Knochen im Bericht (`pairedBeyondEntries`) und in der Konsolenzeile.

Antwort auf die Einzelpunkte:

- **(b) Ausnahme `releaseAlsoViolates`:** entfernt. Sonnets Beispiel (Release −0,0101, Kandidat −0,035 bei −0,01) ist jetzt ein Fehler; als Zahlenregel in `LowPolyGround` geprüft. Für absolute Größen entschuldigt eine geerbte Verletzung höchstens 1e-4 m.
- **Die Grätsche `slide right 1,00` (−6,45 cm):** Die neue Regionsmessung zeigt, dass der tiefste Punkt die Fingerspitze der Stützhand ist (`LeftHandMiddle4`), kein Stiefel. Die Stiefel liegen in dieser Pose bei +0,96/+3,17 cm. Release −6,16 cm, Kandidat −6,45 cm, Mehrbetrag 2,9 mm. Die Pose ist kein künstlicher Schnitt: Sie entspricht dem vollen Rutschen, das die Präsentation 80 % der Rutschdauer zeigt (`FootballDuelTiming.Slide`). Neu geprüft auf nativer Hüllkurve (beide Seiten, Einstieg, Halten, Aufstehen, 60 Hz, fortlaufende Uhr, 150 Bilder): Stiefel absolut bestanden (tiefste −0,69 cm bei −3,5 cm Grenze), Körper 50 Bilder unter −2 cm (Release ebenso; schlimmste Release −23,62 cm, Kandidat −23,77 cm im Aufstehen), Kandidat höchstens 2,9 mm tiefer. **Nicht als bestanden ausgewiesen:** `FAILED` bleibt je Bild als `paired candidate-worse` im Bericht stehen.
- **(a) `bootDeviationMax` ≈ 4,4 cm:** entfernt, keine Grenze darauf gesetzt. Die Messung verglich Nächster-Vertex-Abstände zwischen verschieden zugeordneten Knochengruppen und war ein Auswahlartefakt. Ersetzt durch Flächenabstände (nächstes Dreieck) zum echten nativen Ball und tiefste Punkte je Region.
- **(a) Handschuhabstand:** nur noch am echten gehaltenen Fang (`controlled catch within reach`, beide Hände auf dem Ball) und an Paradenkontakten. Release −9,09 cm (bekannter geerbter Fehler: Ball in den Handschuhen), Kandidat −9,06 cm, also 0,3 mm besser. Keine Prüfung auf geschnittenen Keeperposen ohne Ball.

### Messergebnisse (gezeichnete Low-Poly-Oberfläche gegen Release im selben Bild)

| Lauf | Bilder | gescheitert | absolute Ergebnisse | gekoppelt: über der bestehenden Grenze |
| --- | --- | --- | --- | --- |
| natural-motion (Tests, alle Raten) | 14.670 | 0 | Stiefel/Körper 0 Verletzungen, 0 geerbt (tiefste Stiefel −3,9 mm Fortbewegung, −3,2 mm Aktion) | rechter Stiefel am Ball: 152 von 356 (davon Release ebenso darüber: 151; 1 nur Kandidat: −3,117 statt −2,989 cm; 17 Kandidat tiefer, Mehrbetrag ≤ 2,0 mm, Median −0,6 mm) |
| Keeper (9 native Sequenzen + Fang) | 561 | 0 | – | Stiefel 21 Bilder unter −2 cm (Release ebenso; Mehrbetrag ≤ 1,2 mm), Körper 0 (Mehrbetrag ≤ 8,0 mm, Körper > 4 cm über dem Rasen), Handschuh 1 (geerbt, Kandidat besser) |
| Clipgalerie (`LowPolyGround`) | 342 | 0 | 0 Verletzungen, 0 geerbt | Körper beim Rutschen: 1 (Stützhand, siehe oben) |
| native Rutsch-Hüllkurve | 150 | 0 | Stiefel 0 | Körper 50 (Stützhand, Mehrbetrag ≤ 2,9 mm) |

**Wächter (Sentinel):** Ein Low-Poly-Mesh mit 4 cm tieferen Stiefeln und 8 cm entlang der Normalen aufgeblasenen Handschuhen wird auf demselben Rig und Bodenskin abgelehnt: Stiefel beidseitig (nur Kandidat), Stiefel am Ball, Handschuh am Ball und der geerbte Pfad (Grenze 1 mm über der Referenz → `candidate-worse`). Der echte Kandidat besteht dieselben drei Bilder.

**Lücken:** Die Kontrollfixtures enthalten nur Kontakte mit dem rechten Fuß; native Spielaufzeichnungen (`native-motion`, `native-contract`, `native129-rig`) liegen in keinem lokalen Checkout. Linke Fußkontakte werden deshalb nur über die absolute Stiefelmessung, nicht am Ball geprüft. Für Rutschen und Keeper gibt es nur die Selector-/Hüllkurvenwege der bestehenden Suiten, keine aufgezeichneten Spielszenen. Neue Nahaufnahmen wurden nicht gerendert: Laufzeit und Mesh sind seit Runde 3 unverändert, deren Fuß-/Kontaktnahaufnahmen gelten weiter.

**Neu gefundene geerbte Fehler aus Release 130** (nicht Low-Poly, keine Bewegungsänderung in dieser Runde): Stützhand beim Rutschen und Aufstehen bis 23,6 cm unter dem Rasen; Keeperstiefel in Paraden/Hechten bis 8,9 cm unter dem Rasen; gezeichneter Stiefel an nativen Kontaktbildern bis 5,2 cm im Ball; gehaltener Ball 9,1 cm in den Handschuhen. Für Root zur Bugliste.

### Läufe Runde 4

| Schritt | Ergebnis |
| --- | --- |
| 60 `Ping` (Sync: 4 Editor-Dateien) | kompiliert, 0 Fehler |
| 61–66 `LowPolyGround` | iterativ; zuerst Regionsfehler entdeckt (Körper ohne Hände), Handschuh-Wächter falsch angelegt, eine falsche Erwartung in der Zahlenregel; Endstand 66: **48/48** Pflichtprüfungen |
| 64/65 `Tests` | zeigten die gekoppelte Lage (Keeper-Stiefel, Ballkontakt) – Anlass für die gekoppelte Regel; keine Grenze gelockert |
| 67 `Tests` (Low-Poly) | OK; alle Gatesätze gegen Runde 3 (`tests-v4-ground`) 0 Abweichungen bei gleichen Namen/Anzahlen/Grenzen, R18-Sperre `2102.81884765625`; anders nur Wanduhrzeiten, zwei neue Dateien `visible-surface*.json`, eine neue Keeperprüfung (161 statt 160) |
| 68/69/70 `MatchMesh original` → `Tests` → `MatchMesh lowpoly` | Originalpfad gegen Runde 3 (`tests-original-fix`): alle Gatesätze 0 Abweichungen, keine Sichtbar-Datei, Keeper 160 Prüfungen, nur Wanduhrzeiten; Szene danach bytegleich `0cb721dd…` |
| 71 `NaturalMotion` (Kontaktfälle, gerendert) | Gates bestanden; gleiche gekoppelte Werte |
| 72 `WebBuild` negativ | verweigert, siehe P2-1 |
| 73 `WebBuild` | erfolgreich, siehe Build |

Vergleichsberichte: `outputs/style-demos/lowpoly-fix/compare/r3-v4-vs-r4-v4.json`, `r3-original-vs-r4-original.json`.

### Build Runde 4

`generate-identity.cjs` (unverändert `644d9d92…`) → Sync → `MatchMesh lowpoly` → `WebBuild` mit Vorprüfung → `build-manifest.cjs`. `unity-web.wasm` (`2de6a7d5…`), `framework.js` (`36ef3791…`) und `loader.js` (`c49fdcbc…`) sind bytegleich zu Runde 3. Neu ist `unity-web.data` `00058f632661c735322a2d0f7d61918e83c28dab5226cc814014809ba94821f8` mit 56.050.907 B (Runde 3: 56.050.915 B). Im Datenpaket unterscheiden sich `boot.config` (neue Build-GUID) und `data.unity3d` (8 B). Unitys Buildbericht listet als einzige Änderung einen Skript-Metadateneintrag weniger (`InputSystem/…/InputEventStream.cs`, 0,1 kB); Meshes 2,3 MB, Shader 634,5 kB und Gesamtgröße sind gleich. `probe-build.json`: `D6Cli.cs`-Hash `7115b7f9…`. Alle 33 Quell-, 4 Build- und 3 Low-Poly-Asset-Hashes stimmen mit den Git-Objekten überein.

Echtes WebGL (`check-lowpoly-webgl.cjs`, Edge headless, ANGLE D3D11, RTX 4070, `outputs/style-demos/lowpoly-fix/webgl/groundfix-r4/`): Konsole `match mesh WorldPlayerLowPoly-v4 vertices=6926 … ground=WorldPlayer vertices=9725`, 0 Fehler, 6 Bildsätze; native Parität an Tick 600/1200/2400/4213 identisch zu Runde 3. Angesehen: Spielbild 844×390 standard.

## Ablauf (Runde 3)

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

Sichtbare Oberfläche (Clipproben, gezeichneter Low-Poly-Skin): 0 Verletzungen nur des Kandidaten. **Eine Probe verletzt die Grenze bei beiden Meshes** und wird als `releaseAlsoViolates` geführt: `slide right 1,00` (statische Grätschenpose mit voller Gewichtung auf `sprint_forward`), gezeichnete Sohle −6,45 cm, Release-Skin −6,16 cm, Grenze −2 cm. *(Runde 4 korrigiert diese Deutung: Der Punkt ist die Fingerspitze der Stützhand in der echten vollen Rutschpose, kein Stiefel und kein Schnittartefakt; die Ausnahme ist entfernt, siehe oben.)* Der Low-Poly-Fuß liegt dort 2,9 mm tiefer als der Originalfuß. Sohlenabweichung gezeichnet ↔ Release über alle Posen −6,3 … +5,1 mm; tiefster Stiefelpunkt je Fuß gegenüber dem Bodenskin −1,4 … +5,1 mm (Median 0). *(Runde 4: Messung entfernt.)* Die ausgewiesene „Stiefelabweichung“ von ≈ 4,4 cm ist über alle Posen konstant und stammt aus unterschiedlicher Knochengruppenzugehörigkeit der Vertices beider Meshes (Hauptgewicht Fuß/Zeh), nicht aus der Form. Handschuhabstand zum gehaltenen Ball gezeichnet vs. Release: Unterschiede ≤ 4 mm.

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

Bodenmaßgeblich (Bodenskin): Standsohle, `RootHeight`, `Of(clip)`, Gang, Kontur, Laufzeit-Bake. Sichtbar (gezeichneter Skin): `s.sole`/Tracespalte `sole`, `sole below turf frames`, die Skinanteile von `lowest sole incl. actions`, R20-Countdown-Sohle, `LowestBoot` (Duel/Iteration), alle Renderings. Keine Grenze wurde gelockert, keine sichtbare Messung auf den Bodenskin umgestellt. Runde 4: Die gekoppelte Prüfung `VisibleSurfaceProbe` liest beide Skins im selben Bild; der Bodenskin dient dort nur als Releasereferenz, gemessen und beurteilt wird der gezeichnete Skin.

## Offene und geerbte Grenzen

- Geerbt aus Release 130: historisches R15-1600-Gate (scheitert auch im Original), Kontakt-/Übergangsruckler, Direktfreistoß-Vorbereitung, gehaltener Ball tief in `controlled-catch-held`, siehe [Bugliste](../Bugliste.md).
- Rutschen: Stützhand bei Release und Low-Poly unter dem Rasen (bis −23,6 / −23,8 cm), Low-Poly bis 2,9 mm tiefer; Keeperparaden: Stiefel bis −8,9 cm (beide); native Kontaktbilder: gezeichneter Stiefel bis 5,2 cm im Ball (beide); gehaltener Ball 9,1 cm in den Handschuhen (beide). Alle gekoppelt geprüft (Kandidat ≤ 0,01 m schlechter) und je Bild berichtet, nicht als bestanden gegen die absolute Grenze ausgewiesen.
- Linke Fußkontakte am Ball nicht gemessen (Kontrollfixtures nur rechts, keine nativen Spielaufzeichnungen lokal).
- Kein Android-/Mobilgerät verfügbar: keine Gerätefreigabe, keine mobile GPU-Messung.
- Download wächst um `WorldPlayer.asset` (siehe Build); Laufzeit-Bake wieder auf Release-Niveau.
- Abschließende Browserabnahme (344 Prüfungen, Lebenszyklus, Architekturen, volle Parität) durch Sonnet/Root steht aus.

## Übergabe Runde 4

- Commits auf `codex/demo-low-poly-fix-20261013` nach `833dba25`: `b43df36a` (Build-Vorprüfung, `VisibleSurfaceProbe`, Haken in natural-motion/Keeper), `16e93a65` (gekoppelte Gates, WebGL-Build, Manifest), danach dieses Dokument, CHANGELOG. Nicht gepusht, kein Main-/Deploy-Schritt.
- Geänderte Dateien: `prototypes/match-engine-unity/D6Cli.cs` (im Buildmanifest), `LowPolyGroundDiagnostics.cs`, `NaturalMotionDiagnostics.cs`, `FootballKeeperTests.cs` (Editor; nicht in Quellkennung/Manifest), `outputs/platform/unity-web/Build/unity-web.data`, `outputs/platform/unity-web/probe-build.json`, `docs/CHANGELOG.md`, dieses Dokument. Nachweise (nicht versioniert, `outputs/*` ignoriert): `outputs/style-demos/lowpoly-fix/{unity-r4,tests-v4-r4b,tests-original-r4,motion-r4,preflight,webgl/groundfix-r4,compare}`, Logs `outputs/style-demos/lowpoly/logs/60…73`, Werkzeug `tools/webbuild-negative.sh`.
- Paket, Server-PID und Fingerprint: `outputs/style-demos/lowpoly-fix/progress.json` (Paket aus dem Commit mit diesem Dokument, `--require-clean`).
- Nächster Schritt: Sonnets frisches Review und volle Browserabnahme (344) gegen 4413, wie unten; danach Roots Entscheidung.

## Übergabe Runde 3

- Commits auf `codex/demo-low-poly-fix-20261013`: `e7754f4c` (Quellkorrektur, Runde 2, unverändert), `2e1d0fdc` (WebGL-Build + Messhelfer), `3b29d9ee` (Leckprüfung in `LowPolyGroundDiagnostics`, Nachweise, Doku, CHANGELOG), danach nur dieses Übergabedokument/`progress.json`. Nicht gepusht; kein Main-/Deploy-Schritt.
- Geänderte Dateien dieser Runde: `outputs/platform/unity-web/Build/*` (data, loader, wasm), `outputs/platform/unity-web/probe-build.json`, `work/platform/qa/check-lowpoly-webgl.cjs` (`--unthrottled`, Wasm-Speicher), `prototypes/match-engine-unity/LowPolyGroundDiagnostics.cs` (Editor, nicht in Quellkennung/Manifest), `docs/CHANGELOG.md`, dieses Dokument, Nachweise unter `outputs/style-demos/lowpoly-fix/` (Werkzeuge `tools/compare-test-reports.cjs`, `tools/check-imports.cjs`). Laufzeitquellen gegenüber `e7754f4c` unverändert; `sourceId` `644d9d92…` gehört jetzt zu diesem Build.
- Unity-Projekt: 3/3 Originalassets im Repo und alle Nicht-Quell-Importe (Meshes, FBX, Clips, Texturen, Metadateien) bytegleich zur [Basissicherung](basis-low-poly-release130.json); die 18 abweichenden Importe sind genau synchronisierte Quellen/Shader und `Probe.unity` (`outputs/style-demos/lowpoly-fix/imports-after-sync.json`). Die Szene zeigt `WorldPlayerLowPoly-v4` mit Bodenmesh `WorldPlayer`.
- Paket `outputs/style-demos/lowpoly-fix/package`: Quelle `3b29d9ee`, Fingerprint `1d6f25f0b6676ca27ddf57ffd9a812f5eb88fd1d26dd4549ce39c195e4e430f0`, `demo-package.json` `ae688c8694298d272314cfa886550f54a69f5cc8e3506b5e718588d186473deb`, HTML `358d343b…` (unverändert), Unity-Manifest `f6978979…`. `verify-package --deep --require-clean` 103/103 (lokal und gegen den Server).
- Server: `http://127.0.0.1:4413/`, PID 85396, gestartet aus diesem Checkout (`serve-demo.cjs --style lowpoly --out outputs/style-demos/lowpoly-fix/package --port 4413`), läuft weiter für Root/Sonnet; beenden nur über diese PID. Server 4412 (PID 90676, `d8ae8785`) und 4411 (PID 62324, Nighttime) unverändert; `work/demo-low-poly` sauber auf `d8ae8785`.
- Nächster Schritt (Root/Sonnet): volle Browserabnahme gegen 4413 mit `acceptance-browser.cjs --style lowpoly --only build,viewports,flow,goal,parity,reload,fallback,architectures --archViewports 1280x720,844x390,931x448`, `parity-full.cjs --style lowpoly --url http://127.0.0.1:4413` und `check-world-unity.cjs`; danach Entscheidung, ob 4413 den alten Kandidaten 4412 ersetzt. Optional: CPU-Profil im Browser für die Bildkosten.
