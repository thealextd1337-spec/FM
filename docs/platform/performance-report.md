# R01: PC-Baseline und Messstrecke

Stand: 8. Oktober 2026. Welle 0 und die lokale Welle-1-Messung sind ausgeführt. Beide Engines bestanden je 20 Minuten Render-/Kontaktneustartlast auf der vorhandenen NVIDIA-GPU mit unveränderten Quellen. Die aktive Simulationslast unterscheidet sich stark: **keine Rangfolge der Engines, Vollmatchfreigabe oder Android-Abnahme**. Die native Kurzbaseline und die isolierte W1-Demo sind unterschiedliche Arbeitslasten.

## Umgebung und eingefrorener Stand

- Windows `10.0.26200`, AMD Ryzen 7 7800X3D, Edge `154.0.4258.62`, gebündeltes Node `24.19.0`/Playwright. Isoliertes neues Profil, Headless, 1440×950 CSS-Pixel, Gerätepixeldichte 1. Keine Emulation eines Telefons.
- WebGL: `ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 (0x00002786) Direct3D11 vs_5_0 ps_5_0, D3D11)`. Tatsächlicher Hardwarepfad, kein SwiftShader. Playwrights automatische SwiftShader-Freigabe wird entfernt. Betrieb außerhalb der Windows-Ausführungssandbox war zum Start von Edge notwendig; ein vorheriger gescheiterter Versuch bleibt separat dokumentiert.
- Bestehende Standardqualität: 840×473 Renderpixel, Antialiasing und Schatten aktiv, zwölf Spieler, 60 Draw Calls und 184.124 Dreiecke beim ersten Szenenbild. Standardfeld des Bestandsprodukts, unveränderte Modell-/Animationsdateien.
- Gesamtes `dist/` einschließlich Assets eingefroren durch Dateimanifest: SHA-256 `29c336d01296ff47667f4f8e08b935ec23276cda37e328907cb85bc5e3f44ab5`. Anfangs-/Endmanifest identisch. Quelldateien werden weder kopiert noch verändert; das Manifest identifiziert den konkret gemessenen Stand.
- Leistung am lokalen Arbeitsplatz, sonstige Hintergrundlast nicht kontrolliert. Netz lokal über HTTP; kein Internet-, Mobilfunk- oder Downloadbenchmark. Leistung/Temperatur, GPU-Zeit und GPU-Speicher nicht gemessen.

## Gemessene kurze Spielproben

Maßgeblicher Lauf: [`2026-10-07T22-14-00-999Z-w0-cache-verified`](../../outputs/platform/performance/2026-10-07T22-14-00-999Z-w0-cache-verified/report.json). UTC-Dateiname entspricht dem lokalen 8. Oktober. Zwei echte laufende Partien aus neuen isolierten Karrieren, jeweils etwa 30 Sekunden reale Zeit. Keine vorgespielte Bildschirmschleife.

| Messgröße | Kalter Browsercache | Erneuter Aufruf mit Browsercache |
| --- | ---: | ---: |
| Assetbereitschaft ab Navigation | 335 ms | 234 ms |
| Vorbereitetes erstes Spielbild ab Navigation | 1.232 ms | 642 ms |
| Ressourcen-Transfer laut Resource Timing | 27.227.299 Bytes | 21.445.748 Bytes |
| Ressourcen mit beobachteter Cachewiederverwendung | 0 | 128 |
| Tatsächliche Renderabstände, Anzahl | 1.716 | 1.715 |
| Renderabstand p50 / p95 / p99 | 17,4 / 18,6 / 19,8 ms | 17,4 / 18,5 / 19,6 ms |
| Größter Renderabstand | 21,2 ms | 50,1 ms |
| Renderabstände über 33,34 / 50 / 100 ms | 0 / 0 / 0 | 1 / 1 / 0 |
| Simulationsschritt CPU p50 / p95 / p99 | 0,7 / 1,1 / 2,2 ms | 0,5 / 1,0 / 1,7 ms |
| Szenen-/Animationsaufruf CPU p50 / p95 / p99 | 4,0 / 4,5 / 4,7 ms | 4,1 / 4,7 / 5,1 ms |
| Rendererübergabe CPU p50 / p95 / p99 | 0,7 / 0,8 / 0,9 ms | 0,7 / 0,8 / 0,9 ms |
| JS-Heap, beobachtete Stichproben min–max | 34,2–51,3 MB | 32,3–41,3 MB |

CPU-Bereiche überlappen: Szene/Animation enthält die Rendererübergabe und kann Capture-Aufrufe ohne Zeichnung enthalten. Sie dürfen nicht addiert werden. Rig-/Kontaktanimation und Entscheidungsplanung sind derzeit nicht einzeln instrumentiert. Rendererübergabe ist CPU-Zeit, keine GPU-Dauer. Die Heapstichproben alle fünf Sekunden beweisen weder maximale Speichernutzung noch das Fehlen eines Lecks.

Der Cache ist teilweise warm: `football-v130.glb` mit 21.445.448 Nutzbytes wird auch im zweiten Lauf erneut übertragen; die übrigen 128 Ressourcen kommen ohne beobachteten Transfer. Der lokale Messserver setzt eine Stunde Cachegültigkeit. Ein vorangegangener Lauf mit dem normalen Vorschau-Server ([Rohbericht](../../outputs/platform/performance/2026-10-07T22-11-38-624Z-w0-browser/report.json)) übertrug bei beiden Aufrufen alle Ressourcen; dessen Feld `warm` bedeutet lediglich erneuter Aufruf und **belegt keinen warmen HTTP-Cache**. Diese Erkenntnis wird bewahrt, nicht rückwirkend aus den Rohdaten entfernt.

In beiden Läufen keine JavaScript-Seitenfehler. In der maßgeblichen warmen Probe ein Renderabstand von 50,1 ms; kein Long-Task-Eintrag über der Browsergrenze von 50 ms. Der Unterschied ist erwartbar: Renderabstände und einzelne Browser-Tasks sind verschiedene Größen. Der frühere Wiederholungslauf hatte einen 54-ms-Long-Task.

## Instrumentierung und Invarianten

[`check-invariants.cjs`](../../work/platform/performance/check-invariants.cjs) vergleicht identische Seeds und 240 feste Schritte: 2D/3D, Beobachter aus/an sowie Zeichnung jedes oder jedes dritten Simulationsschritts. Alle sechs Fälle liefern denselben Digest `7ae505d4611a429186855f91931af57f88eef5aaf4e32f7ba66442196267819e` für geprüfte Positions-, Ball-, Ereignis-, Statistik- und Zufallszustände. Drei wiederholte reine Mess-Schnappschüsse lassen zusätzlich den vollständig serialisierten Match-/Zustandsdatensatz und Zufallsstand unverändert. [Rohbeleg](../../outputs/platform/performance/2026-10-07T22-12-57-551Z-invariants/report.json).

Diese Prüfung belegt die untersuchte Zustandsparität. Sie ersetzt weder einen kompletten Matchvergleich noch eine separate Zeitmessung des Instrumentierungsaufwands. Das historische v135-Paket wurde nur gelesen; seine Rohdaten bleiben unverändert.

## Wiederholung und nächste Messfenster

Messprogramme und genaue Aufrufe stehen in der [Messstrecken-Anleitung](../../work/platform/performance/README.md). `collect.cjs` kann sowohl die native Engine als auch `window.D6Probe` beobachten, friert zusätzliche Quellwurzeln ein und schreibt Einzelwerte, Zeitquantile, Speicherverlauf, Cachebelege und Screenshots unter einem neuen Laufnamen. Die Probevariante ruft `start()` auf und kann abgeschlossene Szenen für eine lange Sitzung erneut starten. Enginebildzeiten müssen aus ihren tatsächlichen Renderer-/Unitystatistiken kommen; die rAF-Schleife des Dashboards wird ausdrücklich nur als Seitentakt bezeichnet.

Welle 1 belegt unten je Engine 20 Minuten seriell mit gleichem eingefrorenem Asset-/Parameterstand, zwölf/vierzehn Figuren, beiden Feldgrößen/Richtungen und wiederholtem Szenenstart. Offen bleiben vollständige Partien, vollständige Rückschau und produktives Aufräumen. Kontaktproben dürfen keine vollständige Partie behaupten. Ein Androidziel von stabilen 30 Bildern/s auf Pixel 9a und Pixel 9 Pro XL bleibt bestehen; beide echten Geräte sind hier ungemessen. Temperatur bleibt ohne zugänglichen Sensor nicht verfügbar. Die drei späteren UI-Abnahmen bleiben separat.

Die kurze PC-Baseline zeigt keinen belastbaren Engpass, der bereits eine Qualitätsreduktion rechtfertigt. Der isolierte [`quality-policy.cjs`](../../work/platform/performance/quality-policy.cjs) bleibt deshalb inaktiv. Konkrete MB-/Ausreißerbudgets sowie PC-Grenzen werden aus dem kontrollierten Vergleich und der Dauerlast abgeleitet; diese einzelnen kurzen Stichproben setzen noch keine neuen Produktgrenzen.

## Welle 1: Prüfung der neuen Messanbindung

Die finale Grafik-/Bedienabnahme ist in [Q01](demo-acceptance.md) dokumentiert. Ein zwischenzeitlicher Unity-WebGL-Samplerfehler erzeugte leere Bilder trotz steigender Bildzähler; diese Läufe sind ausdrücklich keine Leistungsbelege. Die folgende Messung verwendet den behobenen Build `build_ba3b5ffa6fa7`, SourceId `3914989081d845c9296ef294fd208fdfe473770ebab9e47ab8f4e64da573893e`, mit echten Feld-/Figurenbildern und ohne kritische Grafikfehler.

Die wiederholten kurzen Cacheproben erfassen nun **alle Fenster** einschließlich GLB/data/wasm im Enginefenster: [Browser](../../outputs/platform/performance/2026-10-07T23-01-29-159Z-w1-browser-cache-frames/report.json), [Unity](../../outputs/platform/performance/2026-10-07T23-02-12-360Z-w1-unity-cache-frames/report.json). Die vorherigen W1-Läufe ohne `cache-frames` erfassten nur das Dashboard und sind für Gesamttransfer unvollständig.

| Lokale W1-Ladeprobe | Browser kalt / wiederholt | Unity kalt / wiederholt |
| --- | ---: | ---: |
| API-/Assetbereitschaft | 737 / 488 ms | 2.845 / 2.678 ms |
| Vorbereitetes erstes Bild | 808 / 577 ms | 2.916 / 2.747 ms |
| Transferbytes sämtlicher Fenster | 30.256.335 / 25.020.685 | 86.325.172 / 85.985.594 |
| Erneut geladene große Assets | GLB 21.445.748 Bytes | data 48.122.842, wasm 34.870.894 Bytes |

Das sind teilweise warme Wiederholungen, keine vollständig aus dem Browsercache geladenen Builds. Unity-Dateien sind hier ein unkomprimierter lokaler Webbuild. Die Zahlen sind weder Downloadzeit über das Internet noch eine Aussage zur späteren Veröffentlichung. Je Probe laufen 20 Sekunden mit zwei Neustarts, mindestens acht reale Sekunden pro Konfiguration, keine verlorenen Bildintervalle oder kritischen Grafik-/Seitenfehler. Die folgenden Dauerläufe verwenden denselben Takt und alle acht Konfigurationen der Familie `fast-pass-interception`.

Der Collector lädt die Stresskonfigurationen direkt über `D6Probe.load()`. Dabei bleiben die oberen Auswahltexte des Dashboards beim anfänglich geladenen Standard. Sie beschreiben in den Mess-Screenshots daher nicht die aktuelle Stresskonfiguration. Maßgeblich sind `probeConfigs`, deren Hash sowie die tatsächlich beobachteten `snapshot.scenarioId`, Geometrie und Figurenanzahl. Der sichtbare Engine-/Szenenwechsel durch reguläre Bedienelemente wird getrennt in Q01 geprüft; während der eingefrorenen Messung wurde das Dashboard nicht verändert.

Ein [20-Sekunden-Smoke-Lauf](../../outputs/platform/performance/2026-10-07T22-23-00-229Z-w1-browser-smoke/report.json) prüft die separate Browserdemo mit Originalmodell, vereinfachter Vergleichsdarstellung und weiterhin tatsächlichen Bestands-Kontaktfunktionen. Eingefrorene Demo-/Fachquellen während des Laufs unverändert. Zwei Neustarts mit wechselnder Konfiguration, 1.141 vollständige echte Rendererintervalle, keine verlorenen Intervalle, keine Seitenfehler. RTX 4070; p50/p95/p99 17,4/18,3/18,7 ms; maximal 116,8 ms einschließlich Szenenneustarts. Das ist eine Integrationsprobe des Collectors, keine Abnahme von 20 Minuten.

Wichtige Grenze: In dieser Schussszene steht die native Spieluhr nach einem Tor bei 10,351 Sekunden, während die äußeren festen Demoticks bis zur achtsekündigen Szenengrenze weiterlaufen. „Aktive“ Demoticks bedeuten somit keine gleichmäßige Last laufender Matchphysik. Folgende Dauerläufe müssen native Spieluhr, äußere Simulationszeit und reale aktive Zeit getrennt ausweisen. Die Messstrecke erfasst dafür zusätzlich `nativeClockAdvancedSeconds`. Wiederholte Schuss-/Renderproben dürfen keine vollständige Partie oder fortlaufendes normales Matchspiel behaupten.

## Finale serielle Dauerläufe

[Browser, 23:03–23:23 UTC](../../outputs/platform/performance/2026-10-07T23-03-19-885Z-w1-browser-20min/report.json) und danach [Unity, 23:23–23:43 UTC](../../outputs/platform/performance/2026-10-07T23-23-22-514Z-w1-unity-20min/report.json). Jeder Ordner enthält unveränderte Rohintervalle, Speicher-/Zustandsstichproben, Einzeldateimanifeste und Endbild. Beide Endbilder wurden visuell geprüft: tatsächliches Feld und Figuren vorhanden. Keine weiteren GPU-Proben oder Builds liefen parallel durch die beteiligten Agenten; sonstige Arbeitsplatzlast bleibt unkontrolliert.

Gemeinsam: Hardware-ANGLE/RTX 4070, 1.358×764 Renderpixel, Antialiasing aus, dieselbe Modellvorlage, Seed 617, Familie `fast-pass-interception`, acht Konfigurationen in Katalogreihenfolge, mindestens acht reale Sekunden pro Durchgang. Die Override-Dauer beträgt acht Simulationssekunden; früh beendete Unity-Kontakte bleiben bis zum nächsten festen Neustart sichtbar. Start ist `current-5-negative`; der Argumentname `large-6-positive` bestimmt die ausgewählte Familie, nicht den ersten Eintrag der aktivierten Matrix. Der Hash aller acht konkreten Eingaben ist in beiden Läufen `ec56e855927c6be3bcf1fe0ef32ce5b26b0f2df5480ad88f5cfcf1d42e4c8d88`.

| Messgröße | Browserdemo | Unity-Webdemo |
| --- | ---: | ---: |
| Beobachtete Dauer | 1.200,0425 s | 1.200,0494 s |
| Abgeschlossene Neustarts / beobachtete Konfigurationen | 148 / 8 | 148 / 8 |
| Tatsächliche Bildintervalle / kumulativer Endzähler | 68.197 / 68.200 | 73.623 / 73.630 |
| Verlorene Intervalle aus Statistikpuffer | 0 | 0 |
| Renderabstand p50 / p95 / p99 | 17,5 / 18,5 / 19,2 ms | 16 / 18 / 18 ms |
| Größter Renderabstand | 208,3 ms | 20 ms |
| Intervalle >33,34 / >50 / >100 ms | 147 / 138 / 2 | 0 / 0 / 0 |
| Erste 3.600 Intervalle: p95 / p99 | 18,5 / 19,3 ms | 18 / 18 ms |
| Letzte 3.600 Intervalle: p95 / p99 | 18,5 / 19,3 ms | 18 / 18 ms |
| JS-Seitenfehler / kritische Renderfehler / Neustartfehler | 0 / 0 / 0 | 0 / 0 / 0 |

Der kumulative Zähler enthält wenige vorbereitende Bilder vor der Messphase. Die Intervalle stammen aus echten Rendereraufrufen beziehungsweise Unity-URP-EndFrameRendering; sie messen keine GPU-Ausführungsdauer. Die Dashboard-rAF-Mediane betragen in beiden Läufen 17,5 ms, p99 18,5 ms. Unity ist auf 60 Bilder/s konfiguriert, Browser auf rAF. Headless liefert **keine physische Monitorfrequenz**; diese Takte und die Unity-Renderintervalle dürfen nicht mit einer gemessenen Displayfrequenz gleichgesetzt werden.

| Tatsächliche Last im 20-Minuten-Fenster | Browserdemo | Unity-Webdemo |
| --- | ---: | ---: |
| Beobachtete API-aktive reale Zeit | 1.198,8393 s (99,90 %) | 50,1225 s (4,18 %) |
| Beobachtete reale Zeit nach Szenenabschluss | 0 s | 1.149,1924 s (95,76 %) |
| Summe fortgeschrittener äußerer Simulationszeit | 1.187,0333 s | 47,1167 s |
| Zusätzlicher Fortschritt nativer Spieluhr | 866,2113 s | Nicht vorhanden |
| Erst beobachteter Szenenabschluss je Durchgang, min–max | 8,0122–8,1154 s | 0,3142–0,3454 s |
| Reale Zyklusdauer, min–max | 8,0122–8,1155 s | 8,0017–8,1140 s |

Die aktive reale Zeit wird durch einen 100-ms-Beobachter angenähert. Kleine Restzeiten entstehen durch Laden/Starten und Messgrenzen; API-aktiv ist bei der nativen Engine nicht mit kontinuierlich laufender Matchphysik gleichzusetzen. **Die bessere Unity-Bildzeit ist damit kein Nachweis einer schnelleren vollständigen Fußballsimulation.** Unity rendert hier überwiegend eine früh abgeschlossene Kontaktszene; die native Engine läuft nach anderer Bestandslogik weiter. Die Messung belegt Stabilität der Darstellung und gleich häufigen Szenenneustarts unter diesen konkreten, ungleich aktiven Arbeitslasten. Eine Engineempfehlung benötigt gleiche fachliche Abdeckung und vergleichbar aktive vollständige Partien.

| Speicherstichproben in Bytes | Browserdemo | Unity-Webdemo |
| --- | ---: | ---: |
| JS-Heap: erste / letzte Stichprobe | 22.555.940 / 39.681.412 | 14.601.728 / 26.081.244 |
| JS-Heap: min / max | 18.624.040 / 46.745.868 | 11.928.740 / 26.620.964 |
| Anzahl JS-Heap-Stichproben | 239 | 238 |
| Unity-Allocated: erste / letzte Stichprobe | Nicht verfügbar | 55.679.483 / 55.777.787 |
| Unity-Allocated: min / max | Nicht verfügbar | 55.646.715 / 56.925.355 |
| Three-Geometrien / Texturen, min–max | 81–83 / 15–17 | Nicht anwendbar |

Der JS-Heap ist kein Gesamtprozess-, WebAssembly- oder GPU-Speichermaß. Unity-Allocated wird zusätzlich durch `Profiler.GetTotalAllocatedMemoryLong()` gemeldet und ist separat zu behandeln. Erste/letzte Heapwerte liegen an unterschiedlichen Speicherbereinigungsphasen; die Reihen schwanken. Die begrenzten Stichproben und stabilen ersten/letzten Bildquantile belegen weder Leckfreiheit noch fehlendes thermisches Drosseln. Speicher-/Temperaturgrenzen für Mobilgeräte lassen sich daraus nicht ableiten. Kein Qualitätsrückbau ist aus dieser ungleichen Lastmessung gerechtfertigt; die Qualitätspolitik bleibt inaktiv.

Alle Anfangs-/Endhashes sind innerhalb **und zwischen** beiden Läufen gleich:

| Eingefrorene Wurzel | SHA-256 |
| --- | --- |
| `dist/` | `29c336d01296ff47667f4f8e08b935ec23276cda37e328907cb85bc5e3f44ab5` |
| `work/platform/engine-probe/` | `b90c595f6580a39d48531f1636a4127816e854fe34cf8f71da3b710d47527c53` |
| `work/match-next/shared/` | `91384b01ca66f7018b947e66cc501c80800112ae99052560d6d8ae8495d88f9d` |
| `work/match-next/contacts/` | `86dc575746336c14090d359fb632937ca41c9c4db6641f879da4bb9a9b8b09bb` |
| `outputs/platform/unity-web/` | `b4e76fd9757c104ea5717dc6f27f66320c44566b0548b66eae9ed1436be7744f` |
| `prototypes/match-engine-unity/` | `bf45839dda919afccafb71f8cb46e51a2fd3d9e9e430d909cebbcc49c1bd963a` |
| `docs/match-contracts/` | `00a8342789d511ea28433447278e0535e925b0c21a06cfb7520d9ddd1294fad6` |

Erwartete Konsolenhinweise bleiben im Rohbericht: fehlendes favicon (404), native Three.js-Deprecation/Mehrfachimport, Unity-Cachehinweis zu Content-Length sowie angekündigte Änderung der persistentDataPath-Synchronisierung. Das sind keine verschwundenen Meldungen; sie werden von JavaScript-Seitenfehlern und den zuvor tatsächlich blockierenden WebGL-/Colliderfehlern unterschieden. Es gab in den finalen Läufen keinen protokollierten kritischen Renderfehler.

Eine [kompakte maschinenlesbare Zusammenfassung](../../outputs/platform/performance/w1-comparison-summary.json) wurde aus beiden unveränderten Rohberichten erzeugt. Zusätzliche Prüfung: je mindestens 1.200 Sekunden, acht beobachtete Konfigurationen, gleiche Parameter-/Quellhashes, null verlorene Intervalle und null kritische Fehler.

Nach Abschluss **beider** Messläufe wurde ausschließlich das Layout der separaten `report.html` angepasst, damit ihre Befundliste vollständig sichtbar ist. Diese Berichtsseite wurde im Dauerlauf nicht geladen. Die obigen Hashes identifizieren den identischen Stand während der beiden Messfenster; sie wurden nicht auf den späteren Berichtsseitenstand umgeschrieben. Engine-, Asset- und Vertragsquellen blieben unverändert.
