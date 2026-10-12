# Demo-Start und Paketprüfung

Lokale Werkzeuge für die Stildemos (`baseline`, `nighttime`, `lowpoly`) in `work/style-demos/`. Sie paketieren den Standardbuild plus Unity-WebGL-Build eines Checkouts in ein isoliertes, hashgebundenes `site/`-Paket, liefern es nur über Loopback aus und prüfen es. Sie bringen keine zweite Build- oder Matchautorität mit: HTML kommt aus `work/build.cjs`, WebGL aus dem Unity-Build des jeweiligen Checkouts, die Matchsimulation bleibt nativ.

Alles ist **lokal und unveröffentlicht**. Statische Datei-/HTTP-Prüfungen sind **keine Matchabnahme**: Kein Browser, keine Unity-Laufzeit, keine GPU. Die Browser-Abnahme ist ein getrennter Auftrag (siehe Folgeprüfung unten).

## Voraussetzungen

- Node 20+, lokal Node 24: `C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe` (nicht das Node 18 im PATH). Die Befehle unten schreiben `node` und meinen diese Datei; der PowerShell-Wrapper wählt sie selbst (überschreibbar mit `D6_NODE24`).
- Alle Befehle laufen im Checkout, der den Stil enthält (z. B. `work/demo-nighttime`). `--style` ist immer Pflicht. `--repo` ist standardmäßig der Checkout, in dem das Werkzeug liegt; ein fremder Checkout wird nur durch ausdrückliches `--repo` angefasst.
- Voraussetzung für Paketieren: fertiger Unity-WebGL-Build in `outputs/platform/unity-web/` (Buildreihenfolge des Checkouts: `sync-unity.cjs`, `generate-identity.cjs`, WebBuild, `build-manifest.cjs`) und gebautes `outputs/index.html`.

| Stil | Port | Standardpaket |
| --- | --- | --- |
| `baseline` | 4410 | `outputs/style-demos/baseline/` |
| `nighttime` | 4411 | `outputs/style-demos/nighttime/` (`site/` + `demo-package.json`) |
| `lowpoly` | 4412 | `outputs/style-demos/lowpoly/` |

`--out` darf nur unter `<Checkout>/outputs/style-demos/` liegen.

## Befehle

```sh
# 1. Paketieren (optional --build führt zuerst `node work/build.cjs` im Checkout aus)
node work/style-demos/package-demo.cjs --style nighttime --build
node work/style-demos/package-demo.cjs --style nighttime --require-clean    # Übergabestand: nur aus committetem Stand

# 2. Starten (Loopback 127.0.0.1, Port aus der Tabelle oder --port N; --port 0 = freier Port)
node work/style-demos/serve-demo.cjs --style nighttime
powershell -File work/style-demos/start-demo.ps1 -Style nighttime            # gleiche Funktion mit Node 24
powershell -File work/style-demos/start-demo.ps1 -Style nighttime -Action package -Extra '--build'

# 3. Prüfen (eigener temporärer Server, oder laufenden Server per --url)
node work/style-demos/verify-package.cjs --style nighttime --deep --report outputs/style-demos/nighttime/verify.json
node work/style-demos/verify-package.cjs --style nighttime --url http://127.0.0.1:4411
node work/style-demos/verify-package.cjs --style nighttime --require-clean --deep    # Übergabeprüfung
```

`start-demo.ps1` kennt `-Style`, `-Action serve|package|verify`, `-Repo`, `-Out`, `-Port` und `-Extra '<Flags>'` (durch Leerzeichen getrennt, keine Pfade).

Exitcodes: 0 ok, 1 Aufruf/Umgebung, 2 Paket/Prüfung fehlgeschlagen oder veraltet, 3 Port belegt. Bei belegtem Port nennt `serve-demo` den Besitzer (liefert dieser `/__build`: Stil, PID, Commit), beendet aber nichts.

## Was `package-demo` verlangt, bevor es etwas schreibt

Jede Prüfung ist hart; bei einem Fehler bleibt ein bestehendes Paket unverändert:

- Unity-`sourceId` aus allen Identitätsdateien (Release 130: 41) neu berechnet = `source-identity.json`; `ProbeBuildIdentity.cs` trägt sie.
- `probe-build.json`: gleiche `sourceId`, alle Manifestquellen (32) entsprechen den aktuellen Dateien, `assetHash`/`catalogHash` aktuell, alle Originalassets (3) entsprechen `work/platform/assets/manifest.json`.
- Genau die vier WebGL-Dateien (`unity-web.data|framework.js|loader.js|wasm`) mit Hash und hashgebundenen URLs (`/unity/Build/…?v=<sha>`).
- `outputs/index.html` = `outputs/Doppel-6-Fussballmanager.html`, trägt `PROTOTYP <Version>` und `unity-match/runtime.html?v=<Version>`, kein `local-preview-frame.js`.
- **Kein alter Build:** Jedes von `work/build.cjs` eingebettete Skript/Stylesheet (Release 130: 174 Dateien) muss unverändert im HTML stehen (mit den Umschreibungen des Builds für Versionsnummer und PNG-Inlining). `player-user-bootstrap-v112.js` ist wegen seiner Ersetzungen davon ausgenommen.
- Frame-Scheduler: `dist/unity-match/runtime.js` trägt `dist/view-frame-scheduler-v<N>.js` bytegleich im Präfix; im Paket ist derselbe Block bytegleich im Eltern-HTML eingebettet.
- Dann wird in einem Staging-Ordner kopiert, das Paket mit denselben Prüfungen wie `verify-package` kontrolliert, der Quellenfingerprint vor/nach dem Kopieren verglichen und erst dann ausgetauscht. Läuft noch ein Server auf dem alten Paket, schlägt der Austausch unter Windows fehl: zuerst stoppen.
- Ein Branch muss `codex/demo-*` heißen (oder per `--allow-branch NAME` ausdrücklich freigegeben werden). Auf `main` verweigert das Werkzeug Paketieren und Bauen.

## Quellenfingerprint und Dirty-Stand

`demo-package.json` (Schema `d6-style-demo-package-1`) enthält `source`: `commit`, `branch`, `dirty`, `dirtyCount`, `dirtyPaths` (höchstens 40), `fingerprint`, `fingerprintFiles` und die `inputs`.

Der Fingerprint ist SHA-256 über sortierte `Pfad + SHA-256 des Dateiinhalts` aller versionierten und unversionierten, nicht ignorierten Dateien der Eingabepfade (Standard: `dist`, `prototypes/match-engine-unity`, `work/build.cjs`, `work/generate-3d-documentation.cjs`, `work/ui-redesign/shared`, `work/platform`, `work/match-next/contacts/catalog.json`, `docs/3d-system.md`, `docs/3d-system-en.md`; erweiterbar mit wiederholtem `--include PFAD`, das im Manifest steht). Er bildet Arbeitsänderungen ab. Dirty heißt: diese Pfade weichen von `HEAD` ab. Gleicher Inhalt ergibt denselben Fingerprint, ob committet oder nicht; ein später committeter, inhaltsgleicher Stand bleibt also „frisch“, das Manifest sagt aber weiter ehrlich `dirty: true`. Für die Übergabe daher erst committen, dann `package-demo --require-clean` und `verify-package --require-clean`.

Frischeprüfung (Start und Verifier, außer `--allow-stale`): Fingerprint des Checkouts = Paketfingerprint, und `outputs/index.html`, `probe-build.json` und die vier WebGL-Dateien des Checkouts sind byteweise die Paketdateien. Ein neuer Unity-Build derselben Quellen macht das Paket also ebenfalls veraltet. `serve-demo` startet ein veraltetes oder verändertes Paket nicht; `--allow-stale` überspringt nur die Frischeprüfung, nicht die Integrität, und `/__build` zeigt dann `freshness.state: "skipped"`.

## Server

Nur `127.0.0.1`, nur `GET` und `HEAD`, nur im Manifest aufgeführte Dateien (alles andere 404), `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, `X-D6-Style` und `X-D6-Sha256`. Richtige Typen (`application/wasm`, `.data` als `application/octet-stream`, JS/HTML mit UTF-8). Pfadtraversal (`..`, `%2e%2e`, Backslash, NUL, `//host`) → 400, fremder Host-Header → 403, andere Methoden → 405. Der Server prüft beim Start alle Dateihashes und bei jeder Anfrage Größe/Änderungszeit gegen den Startstand. Kein Range-Support, keine Kompression.

`GET /__build` liefert Stil, Version, URL, PID, Start, `sourceCommit`, `sourceBranch`, `sourceDirty`, `sourceDirtyPaths`, `sourceFingerprint`, `sourceId`, `htmlSha256`, `unityManifestSha256`, `packageManifestSha256`, Integritäts- und Frischestand sowie alle Dateien mit SHA-256 und Größe. Der Startblock der Konsole zeigt dasselbe.

## Was `verify-package` prüft

Lokal: Dateisatz von `site/` = Manifest exakt, alle SHA-256/Größen, `sourceId` Manifest = `probe-build.json`, Manifestquellen-Anzahl, vier WebGL-Dateien samt hashgebundenen URLs, HTML-Version und Runtime-Adresse, Scheduler-Bindung, Frischeprüfung; mit `--deep` zusätzlich die vollständige Repo-Prüfung wie beim Paketieren; mit `--require-clean` committeter Paketstand, sauberer Checkout auf dem Paketcommit.
HTTP: `/__build` gegen das Manifest, GET und HEAD jeder Datei (Hash, Größe, Content-Type, no-store, Content-Length), `/` und die vier Hash-URLs aus `probe-build.json`, zehn Ablehnungsfälle (Traversal, nicht gelistete Pfade, POST, fremder Host) sowie erneute Dateiprüfung nach den Anfragen. Der Bericht (`--report`, JSON `d6-style-demo-verify-1`) nennt dieselben Kennungen und den Geltungsbereich.

## Folgeprüfung: vollständige 2D/Unity-Parität

`work/style-demos/parity-full.cjs` ist die parametrisierte Fassung von `outputs/release-130/final-browser/check-parity.cjs` (gleiches Szenario, Helper `work/platform/qa/unity-integration-v160.js`, gleiche Aussagen: identischer Digest und identische Nutzdaten-SHA256 von nativem 2D und Unity, Keeper 180 / Pace 119). Zusätzlich verlangt sie einen frisch gepackten Server und bindet den Bericht an `/__build` vor und nach dem Lauf.

```sh
node work/style-demos/parity-full.cjs --style nighttime --url http://127.0.0.1:4411
```

Chrome-Pfad und Playwright-Ordner sind über `--chrome` und `--playwright` einstellbar (Standard: lokale Codex-Laufzeit). **Nicht ausgeführt:** Der Adapter wurde nur syntaktisch geprüft (`node --check`), weil Browser-/GPU-Läufe nicht parallel zur Unity-Arbeit stattfinden sollten. Er ist ein Startpunkt für den getrennten Browserabnahme-Auftrag; Bewegungs-, Sicht-, Lebenszyklus- und Leistungsprüfungen deckt er nicht ab.

## Grenzen

- Der Fingerprint umfasst nur Dateien im Checkout und die genannten Eingaben. Unity-Library/Temp, importierte Assets außerhalb des Repos (z. B. `G:/unity/Doppel6-Nighttime-Demo`) und ignorierte Dateien fließen nicht ein; der WebGL-Build ist über seine Hashes gebunden, nicht reproduzierbar abgeleitet. Neue Quellordner für einen Stil mit `--include` aufnehmen.
- Die Einbettungsprüfung belegt, dass die Skripte/Stylesheets des Standardbuilds unverändert im HTML stehen; sie ersetzt keinen Byte-Neubau. Dafür `--build` verwenden.
- `.gitignore` ignoriert `work/*`; Dateien in `work/style-demos/` müssen mit `git add -f` aufgenommen werden (oder Root ergänzt eine Ausnahme).
- Ein Eintrag in `docs/CHANGELOG.md` gehört nicht zu diesem Werkzeugauftrag und fehlt bewusst.
- Keine Veröffentlichung, kein Android-/GPU-/Leistungsnachweis. Die gezeigten Prüfungen laufen nur gegen das Release-130-Referenzpaket des Support-Checkouts (Stil `baseline`).
- `package-demo --build` (ruft `work/build.cjs` auf) und der PowerShell-Wrapper im Modus `package` wurden nicht ausgeführt, um dist und Referenzbuild nicht zu verändern; geprüft sind Paketieren ohne `--build`, Verifier, Server und Wrapper-Modi `serve`/`verify`.
