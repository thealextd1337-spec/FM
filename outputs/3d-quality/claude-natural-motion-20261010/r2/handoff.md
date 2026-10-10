# Unity-Paket 07, Runde r2: lokale Übergabe an Root

Stand: 10. Oktober 2026. Arbeitsbaum `work/claude-natural-motion`, Branch `codex/claude-natural-motion-20261010`, HEAD `b38e13342b86c9b37ce1fbca6e04892ead290112` (git cwd und Branch geprüft). Es gibt keinen Commit, keinen Push und keine Veröffentlichung. Der Unity-Editor `G:/unity/My project` (6000.6.4f1) war beim Start frei; es liefen nur die idle `unity mcp`-Hilfsprozesse von Codex. Der Editor wurde ausschließlich seriell im Batchmodus genutzt. Fremde Änderungen (Root-Dokumente, mobile CSS/HTML, `dist/`) sind unberührt.

## Kennungen

| | Wert |
|---|---|
| Fingerprint vor r2 (Checkpoint, 40 Quellen) | `c52b7dcbe3bf9dd42aabcc397fa184978562eb65507ebe7948df848f9e2e574a` (neu berechnet, identisch) |
| **Neue Quellenkennung (41 Quellen)** | `affd013bcc8e6b8528ba407f9d24f860221dad19af14416509ac5e0461371032` |
| `source-identity.json`, `ProbeBuildIdentity.cs`, `probe-build.json` | identisch mit der Neuberechnung |
| Manifest `outputs/platform/unity-web/probe-build.json` SHA-256 | `b7d544824c39a514a2fff3c085e5e10d26323b677e311b4e44c92538a0541f52` |
| loader.js | `aed089a2e2daaa427d3f95f5b0502eca6942a388fe7e7d82d348fa5f6be5d577` (27 914 B) |
| data | `8065e1385bfa93644f8608327d708c802f1d406ca5b389fdac64fc411010b2b0` (55 558 795 B) |
| framework.js | `36ef379127938ada50294ade1111a1380d507e81359591f4156963b0420e1dcb` (unverändert) |
| wasm | `6617c13f764dbeef8b9f1b144807213d5c52cc102a90901c2ee06eedac879d35` (35 422 698 B) |

Die 41. Quelle ist die neue Laufzeitdatei `FootballSoleContour.cs`. Sie ist in `generate-identity.cjs` und in `sourceFiles` von `build-manifest.cjs` (jetzt 32 Einträge) aufgenommen. `final/verification.json` belegt die Prüfung: Neuberechnung = Identität = ProbeBuildIdentity = Manifest = alle fünf Evidenzberichte; vier Builddateien passen zum Manifest; 32/32 Quelldateien passen; 59 Unity-Projektkopien sind identisch mit dem Repo. Der Build lief ausschließlich in diesen Arbeitsbaum, mit 0 Fehlern und den 3 bekannten Toolchain-Warnungen (WebGPU/Firefox, `$stackTrace`).

## Prüfkommandos und Ergebnisse (alle auf `affd013b…`)

```
node prototypes/match-engine-unity/generate-identity.cjs
node prototypes/match-engine-unity/sync-unity.cjs
Unity.exe -batchmode -quit -projectPath "G:/unity/My project" -executeMethod D6Cli.Tests -d6repo <wt> -d6output outputs/3d-quality/claude-natural-motion-20261010/r2/final/tests
Unity.exe … -executeMethod D6Cli.NaturalMotion -d6output outputs/3d-quality/claude-natural-motion-20261010 -d6label r2/final/natural-motion
Unity.exe … -executeMethod D6Cli.KeeperEvidence -d6output …/r2/final/keeper-chains -d6fixture …/r2/keeper-chains/keeper-chain-fixtures.json
Unity.exe … -executeMethod D6Cli.SmallViews -d6output …/r2/final/small-views
Unity.exe … -executeMethod D6Cli.WebBuild
node prototypes/match-engine-unity/build-manifest.cjs
node outputs/3d-quality/claude-natural-motion-20261010/r2/tools/verify-candidate.cjs
```

- **`D6Cli.Tests`: alle 14 registrierten Suiten bestanden** (Exit 0, keine Kompilierfehler, nur bekannte CS0618-Obsolete-Warnungen). Einzelzahlen: Football 23, Locomotion 215, Momentum 78, Action 22, Motion 42, WorldView 24, Gait 75, ClubStadiumProfiles 396, StadiumArchitecture 706, Duel 34, Iteration 106, Keeper 160, Presentation119 (inkl. Offside) 437. Zusammen sind das 2 318 Prüfungen. Dazu kommt die neu registrierte Suite **NaturalMotionGates mit 1071/1071 Qualitätsgates**.
- `D6Cli.NaturalMotion` (gerendert): 143 Fälle, 26 Determinismusprüfungen, **1071/1071 Gates**, 11 Bilder, 16 GIFs (normal/langsam). Gates brechen den Lauf ab (`-d6gates report` nur zur Diagnose).
- `D6Cli.KeeperEvidence`: 157 Bilder, 139 Aufnahmen, 18 Sequenzen.
- `D6Cli.SmallViews`: 630 Ansichten, 120 Bilder. Ressourcenfreigabe ist hart geprüft: Dreifaches Neuladen je Stadion hält Meshes/Materialien/GameObjects konstant (z. B. Roma 61/156/502).
- Natives, Spielregeln, Tempo, RNG/P02, Pause, Rückschau und Seek sind unverändert und strikt; es gibt keine zweite Aktionsuhr, keine Vorhersage und keine Matchzufallsziehung. `dist/` wurde nicht geändert, die nativen Aufnahmen liefen nur lesend.

## 1. Natürliche Bewegung in acht Richtungen

Weiterentwicklung des r1-Zwischenstands (nicht neu begonnen). Echte Qualitätsgates statt bloßer Gelenkänderung. Grenzen in `NaturalMotionDiagnostics.GateNote`:

- keine Sohle mehr als 1 cm unter dem Rasen (gemessen am gerenderten Mesh);
- Hüft-/Bein-/Rumpfgelenke höchstens 1600°/s in Antritt, Fahrt und Stopp (≈1,5× authored Sprint);
- Oberschenkel höchstens 25° je 1/60 s;
- Gleiten des tragenden Fußes höchstens 15 % der Geschwindigkeit und 0,25 m/s;
- keine Doppelschwebe unter 1,9 m/s (Ferse, Ballen, Zehenspitze);
- Brust höchstens 15° zur empfangenen Blickrichtung, Kniepol höchstens 20°;
- Hände nie über den Schultern und nie näher als 0,22 m am Kopf;
- 0 Dreh-Neustarts im stetigen Bogen, höchstens 1 Familienwechsel an der 117°-Grenze;
- native Fortbewegung: keine Sohle unter dem Rasen, höchstens 0,5 Doppelschwebe-Frames je bewegter Sekunde.

Alle Gates gelten bei **30, 60 und 120 Hz** derselben 20-Hz-Bilder. Seitlauf wird als eigene Familie gezählt.

Behobene, gemessene Ursachen:

- **Seitlauf-Oberkörper:** Der `idle_ready`-Ganzkörperclip hielt eine Hand am Gesicht. Jetzt gibt es eine eigene Armebene `FootballRig.SideArms`: Arme locker auf Hüfthöhe, Ellbogen nach hinten, leichtes Mitschwingen mit dem Schrittzyklus. Bild: `final/natural-motion/directions-walk.png` (Spalten 3/7) gegenüber `candidate-19/directions-walk.png`.
- **Seitjog-Bremse 2542°/s → 1269°/s, Rückwärts-Stopp 2430 → 830°/s, Sprint-Seitstopp 2900 → 750°/s:**
  - `LegYaw` sprang beim Familienwechsel um ~39°/Frame (Fuß 0,4 m). Jetzt ist es ratenbegrenzt (480°/s).
  - Beim Bremsen wechselt keine Familie mehr zum Seitschritt.
  - Das Richtungsgewicht hängt nicht mehr vom Wegfallen des Basisclips ab; nur Aktionsclips (Pass/Schuss/Annahme) reduzieren es.
  - Ein unerreichbarer Zehenlock gibt weich frei, statt zwischen Heel-off und Ziehen zu wechseln.
- **Doppelschwebe/Rückwärtsgehen:** `back_walk` setzt den linken Fuß im Clip nie auf (Minimum 2,3 cm). Lösung:
  - Stützfuß-Erdung im Gehbereich (`SupportWeight`, vor und nach dem Fußlock, höchstens 7 cm);
  - Lock-Schwellen relativ zur gemessenen Clip-Schwebe (nur im Gehbereich).
  - Ergebnis: walk-back Doppelschwebe 37 → 0, Stützfuß-Gleiten 0,16 m/s; native Partie field-1 84 → 4 Frames.
- **Sohle im Rasen:** Neue exakte Sohlenkontur. 248 Stiefelvertices werden im Editor aus Mesh, Bindposen und Gewichten erzeugt (`D6Cli.SoleContour` → `FootballSoleContour.cs`) und zur Laufzeit per Linear-Blend-Skinning ausgewertet. Das funktioniert auch im WebGL-Player, wo das Mesh nicht lesbar ist (`isReadable=False`); mit dem alten Standpose-Ansatz wäre es dort stillschweigend auf zwei Punkte zurückgefallen.
- **Brustversatz der diagonalen Rückwärtsclips:** gemessener mittlerer Clip-Brustversatz, ausgeglichen über die Wirbelsäule (Sprint rückwärts 16,8° → unter 15°).
- Kennzahlen Baseline → r1/19 → r2: `final/before-after.json`. Beispiele:

  | Fall | Wert | Baseline | r1/19 | r2 |
  |---|---|---|---|---|
  | Kurve 150°/s | Gleiten | 3,56 m/s | 0,14 m/s | 0,14 m/s |
  | Kurve 150°/s | Dreh-Neustarts | 5,8/s | 0 | 0 |
  | 117°-Grenze | Familienwechsel | 7 | 0 | 0 |
  | Keeper-Nachstellen 1,1 m/s | Doppelschwebe | 45 | 0 | 0 |
  | Jog rechts, Fahrt | Gleiten | 0,98 m/s | 0,05 m/s | 0,05 m/s |

## Geänderte Tests (Vertrag fachlich angepasst, keine Assertion gelöscht)

- `FootballMomentumTests`: genau eine Dreh-Episode über dem erhaltenen Schritt (Blend echt zwischen 0 und 1). Neu: ein stetiger Bogen mit 150°/s über 2 s bei 30/60/120 Hz, Prüfung auf ≤1 Episode, monotone Schrittphase und Banking.
- `FootballPresentation119Tests`: anhaltender diagonaler Rückwärtslauf (Glättung/Hysterese, Achse relativ zum gemessenen Rückwärtsclip) plus neue Probe gegen Grenzflattern.
- `FootballDuelTests`, `OffsidePresentation119Tests`: Der Keeper-Seitschritt nutzt die Bereitschaftshaltung plus prozeduralen Seitschritt; `keeper_shuffle_meshy` zeigt gemessen nur 0,19 m/s. Rechts wird gespiegelt statt rückwärts abgespielt, ohne zusätzliche Becken-/Beindrehung. Der gerenderte Fuß entspricht der Pose bis auf den gemessenen Fußlock-Versatz (bewusstes Frame-Gedächtnis); Pause friert exakt ein.

## 2. Keeper-Ketten (natürlich und kontrolliert getrennt)

Neue Lese-Aufnahmen aus 20 Seeds (160117–160136, 95 Minuten, Seite `/source`, Unity nicht geladen, `dist`-Hashes unverändert) mit `r2/tools/capture-keeper-chains.cjs`. Die Klassifikation stützt sich ausschließlich auf empfangene Fakten: `r2/keeper-chains/chains.json`.

- **Natürlich (5 Ketten):** Fang/Nachfassen → gehalten → Abstoß warten → Abstoß. Darunter eine mit nativem `save/pickup` (Nachfassen), Seed 160119. Dazu 4 Paraden und 18 Gegentore natürlich. Ein natürlicher Ablauf Parade → Abpraller → Nachfassen wurde **nicht** beobachtet.
- **Kontrolliert (bestehende Fixtures):** Fang mit Halten, Nachfassen am Boden, Smother sowie Parade- und Unbekannt-Schutzfälle.
- **Gemessener Übergangssprung beim Anheften:** Der sichtbare Ball sprang 0,96–1,34 m in einem nativen Schritt, weil die Handschuhe sofort an der Brust waren. Behoben: Die Handschuhe nehmen den Ball am empfangenen Ballpunkt auf (soweit die Arme reichen, Oberkörper neigt sich begrenzt bis 30° vor) und ziehen ihn über die ersten 30 % der nativen Erholung (~0,47 s) zur Brust. Der Ball liegt immer exakt zwischen den Handschuhen (Fehler 0,0000), Anheft-Bild und Kontaktzeit bleiben unverändert, es gibt keinen Recovery-Blend des Balls aus den Handschuhen. Restabstand nativer Ball ↔ Handschuhe beim Anheften: 0–0,69 m (vorher 0,43–1,04 m); der native Kontakt liegt 1,1–1,9 m vom Keeper-Root, also jenseits der Armreichweite. Vorher/Nachher: `keeper-chains/renders-1` gegenüber `final/keeper-chains` (`*-sheet.png`, Spuren in `renders.json/tracks`).

## 3. Kleine Kameraansichten und Heimstadien

`D6Cli.SmallViews` (neu, `SmallViewDiagnostics.cs`). Vier strukturell verschiedene Heimstadien mit echten Katalogfarben am Heimtrikot:

- Roma Capitol FC `ITA-3` civic-bowl, Flieder/Elfenbein;
- Milano Ferro FC `ITA-2` modern-ring, Blau/Schwarz;
- Torino Centrale FC `ITA-1` industrial-shed, Schwarz/Weiß;
- Bologna Collina AC `ITA-4` hillside-ground, Oliv/Weiß.

Geprüft wurden alle fünf Kameras, standard/reduced, bei 844×390, 931×448 und 1280×720. Die Kamera ist eine 1:1-C#-Portierung von `v98CameraAim` (near 60), angewendet über die echte Brücke. Ein belegter Stadionfehler wurde nicht gefunden; deshalb gibt es keine Architektur- oder Profiländerung, die 48 Identitäten sind unverändert.

**Kamerabefund (bestätigt Roots Rechnung mit der echten Unity-Projektion):** Ball am nahen Seitenrand (x=0, z=20,5, Boden):

| Kamera | 844×390 | 931×448 | 1280×720 |
|---|---|---|---|
| Follow | y −0,135 (unter dem Bild) | −0,110 | −0,043 |
| Seitenlinie | −0,139 | −0,113 | −0,046 |

Nahe Ecke (x=31) und Diagonal/Tor/Weit sind sichtbar; die Seitenlinie liegt in der nahen Ecke bei 844×390 im 12-%-Band (0,117).

**Schmaler JS-Vorschlag für Root** (`dist/world-pitch3d-v98.js`, `v98CameraAim`, nach der Distanzschleife, vor `return pose`):

```js
if(mode==='follow'||mode==='sideline'){const pan=Math.max(0,ball.z-13)*.65;pose.position.z+=pan;pose.target.z+=pan;}
```

In Unity mit derselben Projektion geprüft (`-guard`-Zeilen in `final/small-views/small-views.json`, Bilder `Roma-…-follow-guard-*`): Der nahe Seitenrand liegt dann bei y 0,149–0,226 (über Band + 2 %), die nahe Ecke bei 0,32–0,41. Mitte, ferne Seite und hohe Bälle sind unverändert. `v98BlendCamera` glättet den Schwenk. Das ist keine zweite Kamera und keine CSS-Kompensation.

Abnahmefälle für Root: die Ballpositionen Mitte, naher Seitenrand, nahe Ecke, ferner Seitenrand und hoher Ball (6 m), jeweils Follow und Seitenlinie bei 844×390, 931×448 und Desktop. Ziel: Ball über 14 % der Höhe, HUD-Band frei.

## Bekannte Grenzen

- **Natives Halten → Abstoß warten:** Der native Ball springt in einem Schritt 0,65–1,77 m von der Haltestelle auf den Abstoßpunkt; sichtbar sind das bis 1,8 m. Unity kann das faktenkonform nicht glätten. Wunsch an Root: eine native Ablegephase (~0,3 s, Ball von den Händen zum Boden).
- **Restabstand beim Anheften:** bis 0,69 m, weil der native Kontakt außerhalb der Armreichweite liegt.
- **Ungegatete Spitzen:**
  - Native Fortbewegungsbilder: 25/26 Spieler über 1600°/s, Spitzen bei nativen Drehungen auf der Stelle (`turn_walk_*`/`turn_idle_*`), wo die empfangene Blickrichtung pro Bild springt. Die Diagnose misst Weltrotation einschließlich nativer Wurzeldrehung. Nächster Schritt: wurzelrelative Messung.
  - Richtungswechsel-Fixture, letzter Stopp außerhalb der gegateten Fenster: 1874°/s.
- **Metrikänderung:** Die native Familienwechsel-Zählung stieg (13 → 24), weil der Seitschritt jetzt als eigene Familie zählt.
- **Nur Editorbelege:** Software- bzw. Editor-Direct3D11, keine Android-, GPU- oder WebGL-Laufzeitabnahme. Root prüft WebGL im Browser, der Nutzer prüft auf Android.
- **Schussvolumen:** Die physische Stichprobe (Ø3,75 gegenüber kompakt 12,625) ist unverändert und nicht durch Darstellung vorgetäuscht. Der 4–6-Minuten-Vertrag liegt bei Root; es gibt kein Unity-Tempo und keine Zeitlupe.
- **Dateisperre:** `ProbeWebBuild.Configure` traf zweimal Win32 1224 auf `pipeline-validation.json` (fremder Dateibeobachter im Arbeitsbaum). Jetzt gibt es dort einen begrenzten Wiederholungsversuch (höchstens 40 × 250 ms). `pipeline-validation.json` ist auf HEAD zurückgesetzt, weil nur Instanz-IDs abwichen.

## Dateien

- **Geändert (`prototypes/match-engine-unity/`):** `FootballAnimation.cs`, `FootballLocomotion.cs`, `FootballPresentation.cs`, `FootballSetup.cs`, `WorldViewBridge.cs` (r1), `ProbeWebBuild.cs`, `D6Cli.cs`, `KeeperEvidenceDiagnostics.cs`, `FootballMomentumTests.cs`, `FootballPresentation119Tests.cs`, `FootballDuelTests.cs`, `OffsidePresentation119Tests.cs`, `generate-identity.cjs`, `build-manifest.cjs`, `source-identity.json`, `ProbeBuildIdentity.cs`.
- **Neu:** `FootballSoleContour.cs` (generiert), `NaturalMotionDiagnostics.cs`, `SmallViewDiagnostics.cs`.
- **Build:** `outputs/platform/unity-web/Build/*` und `probe-build.json`, nur in diesem Arbeitsbaum.
- **Evidenz:** `outputs/3d-quality/claude-natural-motion-20261010/r2/` (final/, keeper-chains/, tools/, logs/, Zwischenkandidaten nur mit Messdaten). Historische Baseline- und r1-Ordner sind unverändert.
- **Unity-Projekt:** Die Szene `Probe.unity` trägt seit r1 `readyClip=idle_ready` und `backRunClip=back_right` (`D6Cli.Setup`).
