# R01: lokale Messstrecke

Neue isolierte Browserprofile, keine persönlichen Spielstände, keine Veröffentlichung. `collect.cjs` lädt standardmäßig den aktuellen Stand aus `dist/` über einen kurzlebigen lokalen Server und erstellt eine neue Vereinswelt. Kein Produktcode wird verändert. Benötigt den gebündelten Node-24-Laufzeitpfad und Playwright; Browserpfad bei Bedarf mit `D6_BROWSER`, Playwright mit `D6_PLAYWRIGHT` setzen.

```powershell
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' work/platform/performance/collect.cjs --seconds 30 --headless
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' work/platform/performance/check-invariants.cjs
```

`--headless` vermeidet sichtbare Fenster; ohne diese Option wird ein eigener sichtbarer Browser geöffnet. Der Collector erzwingt keinen Software-Renderer und entfernt Playwrights SwiftShader-Freigabe. Der erkannte WebGL-/ANGLE-Renderer wird protokolliert; Headless ist keine Aussage über einen echten Monitor oder Android.

Für einen gestarteten Vergleichsserver:

```powershell
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' work/platform/performance/collect.cjs --adapter probe --engine browser --seconds 1200 --caches cold --cycle true --cycle-min-seconds 8 --scenario fast-pass-interception-large-6-positive --scenario-duration 8 --cycle-matrix true --headless --label w1-browser-20min --source-root dist --freeze-roots 'work/platform/engine-probe,work/match-next/shared,work/match-next/contacts,outputs/platform/unity-web,prototypes/match-engine-unity,docs/match-contracts'
```

Anschließend **seriell** denselben Befehl mit `--engine unity --label w1-unity-20min` ausführen. Vorher beide Builds/Assets einfrieren. Der Collector erwartet ein bereits geladenes `D6Probe`, `ready === true` sowie `start()`, `pause()`, `reset()` und `stats()`. Asynchrone Methoden werden abgewartet. `--cycle true` startet beendete Proben durch einen nicht überlappenden 100-ms-Beobachter erneut; es erzwingt keine Beendigung und verkürzt keine Rückschau. `--scenario fast-pass-interception-large-6-positive --scenario-duration 8 --cycle-matrix true` wählt eine ausdrücklich synthetische Dauerlastprobe mit acht Sekunden je Durchgang und allen acht Familienkonfigurationen. Die abgeänderten Szenenkonfigurationen und ihr Hash werden im Bericht festgehalten. Simulationszeit, zusätzliche native Spieluhr soweit verfügbar, näherungsweise aktive reale Zeit und Anzahl/Zeiten der Neustarts bleiben getrennt. Einzelne Kontaktproben sind keine vollständigen Partien. Der frühere Integrations-Smoke verwendete `parry-followup`; der finale Dauerlauf verwendet ausdrücklich `fast-pass-interception`.

`--cycle-min-seconds 8` hält jeden Durchgang mindestens acht reale Sekunden sichtbar. Unity beendet manche Kontakte vorher; ein sofortiger Neustart würde eine deutlich höhere Neustartlast als bei der nativen achtsekündigen Probe erzeugen. Frühes Ende, aktive Zeit und Wartezeit nach Szenenende werden getrennt erfasst. Das ist ein gleich getakteter Szenen-/Render-/Neustartvergleich, kein Vergleich identisch aktiver vollständiger Simulationen.

Die Probe-Messung prüft vor dem Start tatsächlichen grünen Feldinhalt und Bilddetails per PNG-Auswertung. WebGL-/Unity-Runtimefehler brechen die Messung ab. Ein bloß wachsender Renderzähler genügt nicht. Die Bildprüfung ersetzt nicht die zusätzliche visuelle Sichtung der zwölf/vierzehn Figuren.

`source-manifest.json` enthält SHA-256 und Bytegröße jeder Datei im Quellordner; zusätzliche Wurzeln erhalten eigene Manifeste. Anfangs-/Endhash zeigen Änderungen während einer Messung. `report.json` enthält Umgebung, WebGL-Renderer, alle Navigation-/Ressourcendaten, Speicherstichproben und verdichtete Zeiten; `cold-raw.json`/`warm-raw.json` bewahren Einzelwerte. Niemals einen Ausgabeordner selbst als einzufrierende Quelle auswählen.

Der native Adapter misst echte Rendereraufruf-Abstände, rAF-Abstände, Simulationsschritt, Nachschritt, Szene/Animation und Renderer-CPU. Die CPU-Bereiche sind verschachtelt, ihre Summen sind keine Gesamtlast. Getrennte Planung/Kontaktanimation, GPU-Dauer/GPU-Speicher und Temperatur werden derzeit nicht gemessen. Im allgemeinen Probe-Adapter bezeichnet rAF die Seite; tatsächliche Enginebildzeiten müssen aus `D6Probe.stats()` kommen. Speicherwerte aus CDP sind JS-Heap, kein Gesamtprozess- oder Grafikspeicher.

Cold bedeutet leerer HTTP-Browsercache im neuen Profil, kein geleerter Betriebssystem-Dateicache. Der eingebaute Messserver setzt bei eingefrorenen Dateien eine Stunde Cachegültigkeit. Warm-Wirkung muss mit `cacheReuseObserved` und tatsächlichen Transferbytes belegt werden. Externe Server können durch ihre Header den Cache verhindern. Localhost ist keine Messung einer normalen Internetleitung.

Ressourcen werden aus Haupt- und Enginefenster erfasst, mit `frameURL`, `frameScope` und eigener Zeitbasis. Die Kindnavigation steht als Metadatum separat; sie wird nicht ein zweites Mal zum bereits vorhandenen iframe-Ressourceneintrag addiert. Damit stehen auch GLB, Unity-data und wasm im Cachebeleg. Die frühen W1-Cacheläufe ohne Suffix `cache-frames` erfassten nur das Dashboard und sind für Gesamttransfer unvollständig.

`check-invariants.cjs` vergleicht 240 feste Simulationsschritte auf identischen Seeds mit 2D/3D, Messung an/aus und Zeichnung jedes/jedes dritten Schritts. Zusätzlich prüft es lesende Schnappschüsse gegen den gesamten Match-/Zustandsdatensatz und Zufallsstand. Das belegt geprüfte Zustandsparität, nicht die Höhe des Messaufwands oder vollständige Matchparität.

`quality-policy.cjs` bleibt inaktiv. Erst ein belegter Engpass und ein kontrollierter Vergleich rechtfertigen einen Qualitätskandidaten. Beide Pixels, vollständige Partien/Rückschau und produktives Aufräumen bleiben eigene Abnahmen. Die lokale Szene mit zwölf/vierzehn Figuren und größerem Feld wird durch Q01 geprüft; ihre Dauerlast durch die gesonderten 20-Minuten-Rohdaten.
