# Nighttime: Browserabnahme des gepackten Kandidaten

Werkzeug und Ablauf der Browserabnahme (Runde 3) gegen das gepackte, hashgebundene Demo-Paket eines Stils. Ergebnisse stehen im jeweiligen Bericht (`acceptance.json`) und sind Claims; Root prüft unabhängig. Voraussetzungen und Paketwerkzeuge: [Demo-Start und Paketprüfung](demo-start-und-pruefung.md). Alles lokal und unveröffentlicht.

## Aufruf

Node 24, ein laufender Demo-Server (Standard `4411` für Nighttime), ein isolierter Browser je Szenario. Der Server wird nur gelesen (`GET /__build`, Seiten und WebGL-Dateien); Paket, Quellen und Server bleiben unverändert.

```sh
node work/style-demos/acceptance-browser.cjs --style nighttime \
  --repo "<Checkout mit work/platform/qa/unity-integration-v160.js>" \
  --url http://127.0.0.1:4411 \
  --out "<Checkout>/outputs/style-demos/nighttime/acceptance-sonnet-r3/browser" \
  [--only build,viewports,flow,goal,parity,reload,fallback] [--software] [--seed N]
```

`--out` ist Pflicht und muss unter `outputs/style-demos/` des Repos oder des Support-Checkouts liegen. Standardmäßig echte GPU (Edge, ANGLE/D3D11); `--software` nutzt SwiftShader. Ausgabe: `acceptance.json` (`d6-style-demo-acceptance-1`, mit Harness-SHA256, Commit, `/__build` vor und nach dem Lauf, Netzwerkprotokoll) und `shots/*.png`. Exit 0 nur, wenn alle Prüfungen und Abschnitte bestehen, 2 bei Fehlschlag, 1 bei Aufruffehlern.

Zusätzlich, unabhängig von dieser Harness: `verify-package.cjs --style nighttime --deep --require-clean`, `parity-full.cjs --style nighttime --repo <Checkout> --url http://127.0.0.1:4411 --report <Datei>` und die bestehende Suite `work/platform/qa/check-world-unity.cjs` (mit `D6_QA_OUTPUT=<Ordner>`, im Checkout ausgeführt).

## Abschnitte

Die Harness treibt die echte Seite (`/?engine=unity`) und den dokumentierten QA-Helfer `D6QA160`. Es gibt keine zweite Spielautorität; Tore und Ereignisse stammen aus der nativen Simulation, keine wird erzeugt.

| Abschnitt | Was bewiesen wird |
| --- | --- |
| `build` | `/__build` (Stil, frisch, sauber), `probe-build.json`-`sourceId` = `/__build`-`sourceId`. Am Ende: `/__build` vor/nach identisch; der Browser hat die vier WebGL-Dateien über die hashgebundenen URLs geladen, `X-D6-Sha256` = Paketmanifest; keine HTTP-Fehler; keine `pageerror`. |
| `viewports` | 1280×720, 844×390, 931×448 × `standard`/`reduced`: Unity aktiv, kein `lastError`, kein `v98Scene` (kein stiller THREE-Fallback), 12 echte Spieler im ACK, 12 Labels, der Ladebefehl trägt die Qualität, Spiel bis Minute 10, Pause hält das Bild als `paused`. Bilder in Seitenlayout und Vollbildlayout. |
| `flow` | Sichtbare Pause-/Fortsetzen-Taste mit echter Echtzeitschleife (Uhr, Stand, Positionen, Ball, Ereignisse eingefroren; gleiche Sitzung, keine Neuladung), echte Halbzeitpause und Start der zweiten Halbzeit per Taste, Rückschau auf der tatsächlich aufgezeichneten Zeitleiste (Seek, Zurückspulen, Live-Rückkehr, Ergebnis unverändert), Abpfiff mit gebuchtem Ergebnis, validem Spielstand und Spielbericht, Verlassen entfernt den Renderer. |
| `goal` | Läuft Seeds (160112, 1, 2, 3, 5, 8), bis die native Partie ein echtes Tor mit Wiederholung liefert; HUD, `replay`-Bild in Unity, danach endet die Wiederholung ohne zweites Tor. Ohne Tor in allen Seeds: Prüfung schlägt fehl (nicht „bestanden“). |
| `parity` | Dieselbe Aufrufsequenz (`D6QAScenario`: 20′, Pause, Fortsetzen, Halbzeit, 60′, Checkpoint, Abpfiff) in Unity und im nativen 2D: gleicher Digest und gleiche Nutzdaten-SHA256. Ergänzt `parity-full.cjs` (anderes Szenario) um Pause, Halbzeit und Checkpoint. |
| `reload` | Isoliertes Browserprofil (Wegwerfordner): Pause bei Minute 25, Karriere gespeichert. Danach `page.reload()` **und** kompletter Browserneustart: derselbe `physicalSnapshot` (SHA256) im Speicher, Karriere über die sichtbare Öffnen-Schaltfläche, Uhr/Stand/Aufstellung/Positionen/Ball/Ereignisse wie vorher, Unity ohne Fehler, Fortsetzen per Taste. |
| `fallback` | Freiwilliger Wechsel auf 2D und zurück auf 3D über die Ansichtsschalter; fremde `window`-Nachricht ohne Wirkung; erzwungener Fehler aus dem Unity-Frame → sichtbarer 2D-Rückfall mit Meldung, Partie läuft nativ weiter; fehlender Build (`probe-build.json` 404) → 2D mit Meldung, 12 Spieler, spielbar. |

Der Schalter `[data-v98-view]` wird per `click()` im DOM ausgelöst: Im Seitenlayout deckt das Unity-iframe die Werkzeugleiste ab, ein Zeigerklick träfe das iframe. Die Pause-/Fortsetzen-Taste und die Öffnen-Schaltfläche werden mit echten Zeigerklicks bedient.

## Befund zur Altsuite `check-world-unity.cjs`

Die Prüfung „Unity review uses the existing recorded match timeline“ (`check-world-unity.cjs` Zeile 110) schlug bei Opus auf Release-130-Basis und Kandidat gleichermaßen fehl; mit demselben Quellstand besteht die ganze Suite (23 Prüfungen) bei der Abnahme. Ursache ist ein Zeitfenster der Prüfung, kein Produktfehler:

- Die Prüfung ruft `v131Seek(...)` auf, wartet **fest 180 ms** und liest dann `D6UnityMatch.picture.replay`. Das Bild trägt `replay` erst, wenn die Seite das nächste Bild an Unity sendet (`paint`, höchstens alle 50 ms und nur nach dem ACK des vorigen). Bei ausgelastetem Rechner (parallele Unity-Editor-Läufe, Software-WebGL) dauert das länger als 180 ms.
- Die Zeitleiste selbst ist vorhanden: In der Sonde war `v103ReplayState(match).timeline` mit 10 bis 13 aufgezeichneten Bildern gefüllt (6 Bilder je Spielsekunde), `review` war gesetzt; nur `picture.replay` war im Fenster noch `false`. Einmal unter voller CPU-Auslastung reproduziert; unbelastet und in einem weiteren belasteten Lauf bestanden (Sondenprotokolle `acceptance-sonnet-r3/legacy-review-diagnosis/`).
- Die Altsuite wurde nicht verändert. Die neue Harness wartet stattdessen mit `waitForFunction` auf `picture.replay` und `review` und prüft zusätzlich, dass Uhr, Stand, Aufstellung, Positionen, Ball und Ereignisse unverändert bleiben.

Weitere Eigenheit des Helfers: `D6QA160.run()` bricht bei gesetztem `lastError` ab. Nach einem Unity-Fehler beweist die Harness das native Weiterspielen deshalb mit der Seitenschleife (`v65StartLoop`) bzw. der sichtbaren Fortsetzen-Taste.

## Grenzen

- Funktionsprüfung auf einer Desktop-GPU (oder Software-WebGL), kein FPS-, Android- oder Mobil-GPU-Nachweis, keine Aussage über Speicherverbrauch.
- Ein Seed je Szenario (Karriere GER-2, Heimspiel, Bremen–Köln); Tore ergeben sich aus der Simulation und werden nicht erzwungen. Die Abnahme deckt ein Spiel je Abschnitt ab, nicht alle Spielsituationen (Elfmeter, Platzverweis, Verlängerung).
- Bildbeurteilung (Lesbarkeit, Stimmung) bleibt eine Sichtprüfung der Screenshots; die Harness prüft keine Pixel.
- `parity` und `parity-full.cjs` belegen Gleichheit der nativen Zustände zwischen 2D und Unity, keine Gleichheit der Darstellung.
- Die Altsuite braucht weiterhin ein ruhiges System; die feste 180-ms-Wartezeit bleibt dort als Flakerisiko bestehen.
