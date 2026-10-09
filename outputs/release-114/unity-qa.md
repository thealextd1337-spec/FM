# Release 114 · Unity-Befund und Laufzeitprüfung (Claude)

Stand 9. Oktober 2026, final 12:15. Zuständigkeit: `dist/world-unity-v151.js`, Unity-Quellen/Build/Manifest, eigene QA-Skripte. Native Dateien (`world-physical-v65.js`, `set-pieces-v50.js`, `pitch-v55.js`, `world-offensive-quality-v157.js`) gehören dem Parent und wurden von mir nicht geändert. Keine Commits, kein Push, keine Versionsnummer.

## 1. Reload während der 3D-Partie („ANPFIFF/Countdown, Partie steht, Fortsetzen reagiert nicht“)

**Ursache gefunden (nativ, vom Parent behoben).** Bis zum Parent-Patch setzte `v65Restore` `match=saved.match` und löschte `ownerPid`/`kickerPid`/`supportPid`/`takerPid` direkt im gespeicherten `state.physicalSnapshot.match`. Jede Speicherung nach dem Laden und vor dem nächsten `v65Snapshot` schrieb dadurch Spielerobjekte ohne IDs. Beim nächsten Reload fehlte `kickoff.kicker` bzw. `setPiece.taker`:

| Repro (echter Reload, isoliertes Edge-Profil) | vor Parent-Patch | nach Parent-Patch |
|---|---|---|
| Anstoß wartet → Pause → Reload → Öffnen → Speichern → Reload → Öffnen → Fortsetzen | gespeichert `kickerPid:null`, Kicker-Objekt; nach Fortsetzen `live`, Countdown bleibt „5 · … hat Anstoß“, `elapsed` steht, Seitenfehler `reading 'pid'` | `kickerPid` erhalten, kein Alias, Countdown läuft, keine Fehler |
| dasselbe mit wartendem Freistoß | `takerPid:null`; jeder Tick wirft `v55Approach → distance(undefined.x)`, Tick-catch setzt still `paused`, `#v65-error` fehlt → „Fortsetzen reagiert nicht“ | (Variante `save` siehe Grenzen) |
| bereits falsch gespeicherter Snapshot (Objekt statt ID, künstlich erzeugt) | – | Kicker/Taker über `.pid` gebunden, Anstoß erreicht ANPFIFF bzw. Freistoß wird ausgeführt, Uhr 6,12 → 8,65, keine Fehler |

Belege: `double-reload-*.json/.png`, Skript `work/platform/qa/repro-double-reload-114.cjs` (Varianten `showStart|save|role|corrupt`).

Echte UI-Pfade, die ohne `v65Snapshot` speichern: Rollenwechsel in der Pause (`world-tactics-ui-v156.js:33`) und Taktikvorlage in der Pause (`world-career-plan-v64.js:81`). Mit dem Parent-Patch sind beide ungefährlich (Alias besteht nicht mehr). `v61ShowStart` (zurück zum Start) erzeugte schon vorher einen frischen Snapshot.

**Nicht reproduziert:** Einfacher Reload (live Minute 18, Pause Minute 18, alle angehaltenen Zustände Anstoß/Freistoß/postBanner, Altkarriere/Standard-5/Groß-6) lief in allen Läufen ohne Hänger (`unity-reload-repro-*.json`, `unity-kickoff-restore-explore.json`). Der Nutzerfall braucht also die zusätzliche Speicherung zwischen zwei Reloads; der genaue Klickweg des Nutzers ist nicht belegt.

Beobachtung ohne Bewertung: Ein Anstoß nach Reload benötigt (wie ohne Reload) etwa 6–9 s inklusive Laufwegen und 1,65 s ANPFIFF-Banner; während des Anstoßes steht `elapsed` nativ. In einem Lauf wartete ein Freistoß nach Fortsetzen > 20 s (`elapsed` 9,865); das liegt im vom Parent bearbeiteten Freistoßpfad.

## 2. Native Uhr wartet auf Unity (`dist/world-unity-v151.js`)

Solange die ausgewählte, sichtbare Unity-Ansicht dieser Partie lädt (Erststart, Reload, neue Sitzung nach Checkpoint), werden native Schritte wie bei der Torwiederholung angehalten (`step` und `v65AfterStep`; Muster aus v103). Phase, Pause, Halbzeit und Spielerprofil werden nie verändert oder automatisch fortgesetzt. Freigabe mit der ersten bestätigten Unity-Aufnahme, die alle gesendeten Spieler enthält (`players` und `ids`); bei Abweichung 2D-Rückweg. 2D-Wahl, Unity-Fehler/120-s-Ladefrist, `engine=browser` und Hochformat halten nie. `D6UnityMatch.clockHeld` ist lesbar. Halbzeit-Taktikansicht: Unity lädt (bestehendes Suspend) erst nach „2. Halbzeit starten“; bis dahin ist die Partie ohnehin pausiert.

Prüfung `work/platform/qa/check-unity-clock-gate-114.cjs` (echte Reloads, echter `setInterval`-Loop, Unity-Download per Routing um 9 s verzögert):

- Lauf 1: 22 PASS, dann Abbruch im Halbzeitfall (Erwartung falsch: Unity lädt in der Taktikansicht absichtlich nicht).
- Lauf 2: 34 PASS, 7 FAIL – Testfehler: Fortschritt nur an `elapsed` gemessen, das während eines Anstoß-Countdowns nativ steht; Minute nach Reload um Autosave-Takt zu streng; 2D-Schalter in verborgener Toolbar; erwarteter Loader-Fehler beim simulierten Abbruch.
- Lauf 3 (Fortschrittssignatur aus Uhr, Countdowns, Banner, allen Positionen): 41/42 PASS; einzig `switch-2d` mit vergessener Schwelle +0,5 s bei korrektem Verhalten (2D, nicht gehalten, Anstoß `rolling`, `elapsed` 0 → 0,34). Einzelwiederholung nach Schwellenkorrektur 3/3 PASS (`unity-clock-gate-switch-2d.json`). Die JSON dieses Laufs wurde vom finalen Parent-Lauf überschrieben; die Zeilen oben sind aus der Konsolenausgabe übernommen.
- **Finaler Lauf (Parent, unverändertes Skript): ALL 42 PASSED, exit 0** – `unity-clock-gate.json`, `clock-gate-final.log`.
- Abgedeckt: Reload live Minute 18 bis Abpfiff, Reload pausiert (keine Autofortsetzung, Fortsetzen per Nutzer), Reload Halbzeit + 2. Halbzeit, frischer Partiestart, Unity-Ausfall → 2D läuft, 2D während des Ladens, reine 2D-Seite.
- Strukturprüfung des Parents (80 Prüfungen, vier Konfigurationen, wiederholte Restores, gespeicherte Bytes unverändert): `reload-snapshot-source.json`.

## 3. Spielerdarstellung (Leuchten, Unterscheidbarkeit)

Ursache: `WorldKit.shader` rendert mit `Cull Off`; Innenflächen (Ärmel, Kragen, dünne Silhouetten) hatten zur Kamera abgewandte Normalen, `D6Light` gab dort volle Fresnel-Kante (`rim .55 × Umgebungslicht × 2`) → weiße/bläuliche Pixelflecken auf der ganzen Figur. Rückschau zusätzlich mit Sättigung −28 → violett/weiß verschwammen.

Änderung (nur Spielerfiguren und Rückschau-Grading, keine globale Neugestaltung):
- `WorldKit.shader`: Normale zur Kamera gedreht, Kante 0,3 statt 0,55 und Richtung Trikotfarbe getönt. Haut/Weiß/Identität unverändert.
- `WorldViewEnvironment.cs`: Rückschau Sättigung −10 statt −28, Kontrast 8 statt 10; Vignette/Filter unverändert.

Build-Pipeline unverändert: `generate-identity` → `sync-unity` (keine fremden Projektänderungen) → `D6Cli.Tests` (Football 23, Locomotion 215, Momentum 72, Action 22, WorldView 24, Gait 75, 0 Fehler, wie 112) → `D6Cli.WebBuild` (0 Fehler, 3 bekannte Warnungen, 184 s) → `build-manifest`.

- Quellkennung: `3388667d932d3f6987281afb901c52e6c526e49a05c559ef761d736e3b374677` (vorher 112: `28badd2c…`)
- `unity-web.data` 53.719.313 B `bd01a34d1c43592c4e90ca4f8477c685fd11f6e4f8f5bdb5eb1a61a8eaf122f0`
- `unity-web.wasm` 35.069.894 B `b58895f7c0a9ade98ad8d5faec37c23bea6d3aeca9c93ef80876509351333a96`
- `unity-web.loader.js` 27.914 B `4072a920a0928aba9e3f2ef95f82684c3e78a62e11e074443db34d83303c3f66`
- `unity-web.framework.js` 300.906 B `36ef379127938ada50294ade1111a1380d507e81359591f4156963b0420e1dcb` (unverändert)

Bilder (echtes GPU-Edge, gleiche Partie/Szene, alter 112-Build per Routing aus `git HEAD`): `unity-kits/old112-*` gegen `after-*`, jeweils `standard`/`reduced`, Spiel und Rückschau, Nahansicht und Pixelzoom (`*-zoom*.png`), dazu violett/weiß (`*-violet-*`). Ergebnis: deutlich weniger weiße Flecken, Stutzen/Kanten in Trikotfarbe, Rückschau behält Teamfarben. Frühe `before-*`-Bilder stammen aus einem anderen Spielablauf (nativer Code des Parents änderte sich zwischenzeitlich) und sind nur eingeschränkt vergleichbar.

## 4. Vollständige Native/Unity-Parität

`work/platform/qa/check-unity-parity-114.cjs`: fünf Konfigurationen (Alt, Standard 5/6, Groß 5/6), je unveränderte `D6QAScenario`-Folge (20′, Pause, Rückschau, Halbzeit, 60′, JSON-Checkpoint, Abpfiff) mit Unity und nativ 2D, Vergleich aller 14 Digest-Teile (score, events, stats, fresh, minutes, report, ratings, ballAccounting, geometry, people, finances, development, fixtures, world) und `all`.

**Lauf 1** (`unity-parity-run1.json`, ohne Wartebedingung): Alt, Standard 5, Groß 6 alle Teile gleich; Standard 6 alle Teile gleich, aber Unity fiel gegen Ende auf 2D (`Unity ist nicht verfügbar`, Ursache nicht protokolliert, vermutlich parallele GPU-Last) – daher keine Paritätsaussage; **Groß 5: 9 von 14 Teilen verschieden** (stats, fresh, report, ratings, ballAccounting, people, development, fixtures, world) bei gleichem Ergebnis 0:1.

**Ursachenisolierung Groß 5** (alle nativ ohne Unity, sofern nicht anders genannt):

| Prüfung | Ergebnis |
|---|---|
| nativ gegen nativ (`parity-native-determinism.json`) | gleich (`b2da8c03`), Standard 6 ebenfalls |
| Unity gegen Unity (`parity-unity-determinism-large5.json`) | gleich, aber `99aace1d` |
| Autosave nie / normal / nach jedem Schritt; `v65RenderReport` nach jedem Schritt (`snapshot-side-effects-large-5.json`) | alle `b2da8c03` – Snapshot und Bericht nebenwirkungsfrei |
| Bildpfad `v98PitchFrame`/`v131RecordRendered`/`v103ReplayFrame` alle 3 Schritte (`render-side-effects-large-5.json`) | alle `b2da8c03` |
| Lesezugriffe `v65Context`/`v62Fixtures`/`v64ActiveFixture`/Welt-JSON (`read-side-effects-large-5.json`) | alle `b2da8c03` |
| Schritt per Busy-Wait verlangsamt (`wallclock-large-5.json`) | `b2da8c03` |
| 1,5 s Leerlauf nach irgendeiner Stufe, auch erst nach dem Checkpoint | jeweils `99aace1d` |
| Leerlauf-Callbacks (`idle-callbacks-large-5.json`) | kein Callback ändert JSON-Zustand |
| erster abweichender Schritt (`first-divergence-large-5.json`) | Schritt 33 nach Checkpoint: `match` gleich, nur `v102Motion`-Pose `pass` Dauer 0,40 gegen 0,62 |

**Ursache:** Die native Simulation liest `window.D6UserMeshyPlayer.nativeBall/nativeShot` (`pitch-motion-v102.js:14` Posendauern, `world-pitch-actions-v99.js:175/229`, `player-ball-events-v111.js:4/6/8` Annahme-/Kontrollaktionen, `world-ball-motion-v110.js:101` kickReady). Diese Flags setzt erst `player-user-meshy-v107.js` in `install()`, nachdem `player-user-bootstrap-v112.js` das 3D-Spielermodell asynchron geladen hat. Im schnellen nativen QA-Lauf lief die Partie bis 60′ mit `D6UserModelStatus='loading'` (Flags `undefined`); `install()` kam erst nach 1,78 s. Der Unity-Lauf startet langsamer und spielt schon mit installierten Flags. Damit hängen Regeln/Ergebnisse vom Ladezeitpunkt eines Darstellungsmoduls ab – auch in Produktion (erste Sekunden nach Seitenstart/Reload, langsames Netz, fehlgeschlagener Modellabruf). Unity, Uhr-Gate und Snapshots sind nicht die Ursache.

Engster nativer Fix (Parent-Datei, nicht von mir umgesetzt): die regelrelevanten Werte nicht vom Modul-Ladezustand abhängig machen, z. B. für neue Partien beim Anlegen festschreiben (`match`-Feld, mit Snapshot gespeichert) oder als feste Konstanten für die Simulation behandeln; die Darstellung darf weiter `D6UserMeshyPlayer` lesen. Bestehende Spielstände werden dabei nicht umgerechnet.

**Lauf 2 mit Start erst nach Modellinstallation** (`D6_WAIT_MODEL=1`): Ein erster Versuch endete nach Alt und Standard 5 (beide PASS) ohne JSON; der Prozess wurde von außen beendet. Wiederholt seriell in zwei Teilen (`unity-parity-model-ready-a.json`, `-b.json`):

| Konfiguration | Unity/nativ `all` | abweichende Teile | Unity bis Abpfiff aktiv | Checkpoint mit Unity-Neuladen | Seitenfehler | Unity-Bilder / max. Positionsfehler |
|---|---|---|---|---|---|---|
| Alt (68 × 44) | `f92c0da5` = `f92c0da5` | keine | ja | ja (2 Ladevorgänge) | 0 | 276 / 0 |
| Standard 5 | `304bc024` = `304bc024` | keine | ja | ja | 0 | 337 / 0 |
| Standard 6 | `7d65c467` = `7d65c467` | keine | ja | ja | 0 | 433 / 0 |
| Groß 5 | `99aace1d` = `99aace1d` | keine | ja | ja | 0 | 450 / 0 |
| Groß 6 | `44417dc8` = `44417dc8` | keine | ja | ja | 0 | 586 / 0 |

Beide Seiten jeweils `D6UserModelStatus=ready`, `nativeBall=true`, `nativeShot=true`. Damit ist die Unity-Darstellung mit Uhr-Gate in allen fünf Konfigurationen paritätisch zur nativen Partie, alle 14 Teile einschließlich `world`. Die Abweichung aus Lauf 1 ist vollständig durch den Modell-Ladezeitpunkt erklärt. Lauf 2 dient nur der Diagnose und ist kein Freigabenachweis. Der Lauf, den ich vor dem Fix gestartet hatte (PID 39996), wurde von mir beendet, weil er Alt- und Neucode gemischt hätte. Die Dateien `-a/-b.json` (11:46/11:49) stammen nicht aus meiner finalen Runde.

**Nativer Fix (Parent, von mir read-only geprüft, Befund: keiner):** `pitch-motion-v102.js:14/15`, `world-pitch-actions-v99.js:175/229`, `player-ball-events-v111.js:4/6/8` (4 Stellen) und `world-ball-motion-v110.js:101` werten `current.attackFlow?.flowVersion===159 || D6UserMeshyPlayer.*` aus. Damit gelten die Regeln für neue Vereinswelt-Partien (`world-physical-v65.js:52` legt `flowVersion:159` an) fest. Unmarkierte Altpartien behalten den bisherigen optionalen Pfad. Keine neuen Speicherfelder. Die übrigen Flag-Reads sind reine Darstellung: `player-user-meshy-v107.js:4/5/96` und der unveränderte Render-Guard `pitch-motion-v102.js:232`. Im Runner bleibt `D6_WAIT_MODEL` als gekennzeichnete Diagnoseoption. Die finalen Läufe liefen ohne ihn.

**Finale Läufe nach Fix, eingefrorener Quellstand, ohne Wartebedingung, seriell, ohne parallele GPU/UI-Last meinerseits:**

| Lauf | Konfiguration | Unity = nativ `all` | abweichende Teile | Ergebnis |
|---|---|---|---|---|
| Quelle `/source/index.html` (`unity-parity-final.json/.log`, 11:38–11:49) | Alt | `f92c0da5` | 0 | PASS 1:0 |
| | Standard 5 | `304bc024` | 0 | PASS 0:2 |
| | Standard 6 | `7d65c467` | 0 | PASS 3:3 |
| | Groß 5 | `99aace1d` | 0 | PASS 0:1 |
| | Groß 6 | `44417dc8` | 0 | PASS 0:2 |
| Build `/native-build.html` = `outputs/index.html` (`unity-parity-build-final.json/.log`, 11:50–11:57) | Standard 6 | `7d65c467` | 0 | PASS 3:3 |
| | Groß 5 | `99aace1d` | 0 | PASS 0:1 |
| | Groß 6 | `44417dc8` | 0 | PASS 0:2 |

Beide Läufe enden mit Exit 0. Alle 14 Teile plus `all` sind gleich. Keine Seitenfehler, `lastFailure` null, Unity bereit in Setup und nach dem Checkpoint, `loads` 2. Entscheidend: In jedem finalen Lauf stand `D6UserModelStatus` beim Start auf `loading` (Flags `null`). Trotzdem sind die Digests identisch mit Lauf 2, also mit fertig installiertem Modell. Die Regeln hängen damit nicht mehr vom Ladezeitpunkt des Modells ab, und Quelle und Build stimmen überein. Das deckt sich mit dem Parent-Befund (`99aace1d` für alle vier Flag-Varianten).

## 5. Unity-Vollbild bis Abpfiff und Spielbericht

Skript `work/platform/qa/shot-unity-fullscreen-report-114.cjs`: frische QA-Karriere Groß 6 im isolierten Browserprofil (Speicher vorher nur `doppel6.language`, keine Nutzerkarriere), Build `/native-build.html?engine=unity`. Ablauf mit unverändertem `D6QA160` bis 88′, dann `v132RevealControls` und echter Klick auf `#v99-expand`, danach Spiel bis Abpfiff.

- Lauf 1, unbegrenzt (`unity-fullscreen-report/result.json`, 12:06): ok.
- Lauf 2, begrenzt (`unity-fullscreen-report-swiftshader/result.json`, 12:10): ok. Spiel in Blöcken mit Tick-Limit, jeder Seitenaufruf mit Zeitlimit (Timer werden nach dem Aufruf gelöscht), Gesamtfrist 20 min, Fortschrittsausgabe.
- Ergebnis: echtes Element-Vollbild (`document.fullscreenElement = match-area`, Layout `v132-fullscreen`), Unity-iframe 1280×800, Unity bereit, `lastError` null, Uhr-Gate nicht gehalten. Abpfiff bei 2:0 (Minute 99 intern), TV-Leiste „90:00 +5 ABPFIFF“. Der Dialog `#v47-match-report` („Spielbericht · Spielende“, Man of the Match, Teamstatistik, „Weiter“) ist im Vollbild offen. Nach dem Abpfiff antwortet die Seite in 0–4 ms (6 Pings), rAF 8 pro 2 s (SwiftShader), keine Long Tasks, keine Seiten- oder Konsolenfehler. Der Zustand ist nach 6 s unverändert. Bilder: `at88-fullscreen.png`, `after-whistle.png`, `after-whistle-6s.png`.
- **T3-Preview, ungeklärt, kein Nachweis:** Im sichtbaren T3-Tab (isolierter Speicher, gleicher Ablauf) kam ich bis zum Vollbild-Layout und zum Abpfiff (`stage finished`). Danach lief jeder Snapshot- und Evaluate-Aufruf in das 15-s-Zeitlimit der Automation. Im ersten Tab hing die Automation schon früher: Ich hatte `v132ToggleFullscreen()` ohne Nutzergeste per Evaluate aufgerufen. Dort war das Panel `visible:false`, rAF lief mit ~1 Bild/s, und `fullscreenElement` war `null`. Ob Automation oder Renderer die Ursache ist, bleibt offen. Das ist weder ein bestätigter Produktfehler noch ein bestandener T3-Test. Im reproduzierbaren Projekt-QA-Lauf trat das Problem nicht auf.

## 6. Unity-Build, Manifest, C#-Tests, Kits

- `work/platform/qa/verify-unity-manifest-114.cjs` (read-only, `unity-manifest-verify.json`): **45/45 PASS**. Geprüft werden die neu berechnete Quellkennung (36 Dateien, Verfahren wie `generate-identity.cjs`) gegen `source-identity.json`, `ProbeBuildIdentity.cs` und `probe-build.json`, alle 27 Quell-Hashes, die 4 Build-Dateien (Größe und SHA-256), die `?v=`-URLs, `assetHash` und `catalogHash`, außerdem alle 9 `flowVersion===159`-Stellen in `outputs/index.html` und `outputs/Doppel-6-Fussballmanager.html`. Die Hashes der nativen Dateien und Builds stehen in derselben Datei.
- C#-Quellen und Unity-Build sind seit dem Pipeline-Lauf am 9. 10. 2026 unverändert (Identität oben bestätigt). Tests `outputs/unity-cli/tests-114.log` (10:33): 117 Testeinträge `passed: true`, 0 `false` (Suiten wie in Abschnitt 3). WebBuild `build-114.log` (10:37): „Build Finished, Result: Success“. Kein erneuter C#-Lauf und kein neuer Build, weil keine Unity-Quelle geändert wurde.
- Kits 112 gegen 114: `unity-kits/old112-*` und `after-*` (10:38–10:44) entstanden nach dem aktuellen Unity-Build (10:37) in derselben Szene. Sie bleiben gültig, Bewertung siehe Abschnitt 3.

## Grenzen

- Der Nutzerklickweg zwischen den beiden Reloads ist nicht belegt; belegt sind Ursache, Mechanismus und zwei reale Speicherpfade.
- Variante `setPiece save` brach vor dem Reload in meinem Testlauf ab (`RangeError: actual event must occur within played virtual minutes` beim schnellen Vorspulen bis zum Freistoß, ohne Halbzeitbehandlung im Testlauf) – Testartefakt, nicht wiederholt; Freistoß-Fall stattdessen über `corrupt` belegt.
- Vereinzelte bläuliche Pixel auf Trikots bleiben bei sehr kleinen Figuren (Texturpigment/fehlendes MSAA in `reduced`).
- Spielerzahl-Abweichung im ersten Unity-Ack (2D-Rückweg) ist nur per Code geprüft, nicht im Browser provoziert.
- Zeitabhängige Gate-Prüfungen liefen bei hoher CPU-Last (headless SwiftShader); Wiederholung nur bei anderem GPU-Test sinnvoll.
- Keine Mobilgeräteprüfung. Parity- und Vollbildläufe liefen headless auf SwiftShader (virtuelle GPU). Echte Mobil-/GPU-Hardware und physisches Vollbild auf Geräten wurden nicht gemessen und waren für die Freigabe nicht gefordert.
- Pixelgenaue Kit-Bewertung nur für `standard`/`reduced` am Desktop. Die `reduced`-Stufe zeigt bei kleinen Figuren weiter einzelne bläuliche Pixel (s. o.).
- T3-Preview-Zeitlimits nach dem Abpfiff sind ungeklärt (Abschnitt 5).
- Die Build-Parity deckt Standard 6, Groß 5 und Groß 6 ab. Alt und Standard 5 sind nur aus der Quelle belegt, der Build ist dafür per Hash identisch.
