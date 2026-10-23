# B01-Diagnose: Ruckeln auf Mobilgeräten (2D und Unity), 23. Oktober 2026

Nur Diagnose, kein Fix. Stand Release 134 (`0eb8d8dd`), Worktree `work/perf-mobile`, Branch `diag/mobile-jank`. Einzeldatei-Build `outputs/index.html` (Release 134, SHA-256 `a10cd8e7…00f9`) mit Unity-WebGL aus `outputs/platform/unity-web/`, lokaler Server wie im Android-Runner (Port 4250).

**Kein Android-Gerät angeschlossen** (`adb devices` leer). Alle Werte stammen aus Desktop-Edge mit Emulation (915 × 412, DPR 3, Touch, Android-UA, `(pointer:coarse)` → Unity `reduced`) und CPU-Drosselung 4×/6×. Desktop-GPU, Bildschirm ~56 Hz. Das ist keine Pixel-Messung. 4× liegt ungefähr bei einem Pixel 9 Pro XL, 6× entspricht einem warmen oder gedrosselten Gerät.

Messskript: `work/diag-mobile-jank.cjs` (rein beobachtende Wrapper um `step`, `v65AfterStep`, `draw`, `v64UiSave`, `v61StorageClone`, `v61ValidCareers`, `v61FlushStorage`, Unity-Bridge; Long Tasks/LoAF; CDP-Tracing für GC; CDP-Profiler). Partie: `D6QA160.setup` großes Feld, 6 Feldspieler, neue Welt (SI-183 aktiv), danach natürlicher 40-ms-Timer der Produktion. Weil `D6QA160` die Karriere nicht speichert, legt das Skript sie im isolierten Profil ab (`v61SaveCareers`). Nur so arbeitet der Autosave wie im echten Spiel. Rohdaten: `outputs/diag-mobile-jank/*.json`, `*.cpuprofile` (nicht versioniert).

## Ursachen-Rangliste

| # | Ursache | 2D | Unity | Beleg (6×, gespeicherte Karriere 2,4 MB) |
|---|---|---|---|---|
| 1 | Autosave der **gesamten** Karriere alle ~0,7 s Live-Spiel (`v65AfterStep` → `v65Snapshot` → `v64UiSave` → `v61SaveCareers`: JSON-Kopie aller Welten, Validierung, IndexedDB-Put von Stand + Backup) | ja | ja | 268 ms je Save, 53/min; 3 Welten (6,3 MB): **765 ms je Save**, 37/min, 28 s Spielzeit/min verloren. 4×: 172 ms je Save. Linear ≈ 120 ms/MB (6×) bzw. 70 ms/MB (4×). Profil: 23 % Hauptthread |
| 2 | Unity und Engine teilen sich den Hauptthread; die Unity-Schleife läuft ungebremst (`targetFrameRate=60` wirkt im rAF-Modus nicht; die Bildpumpe `view-frame-scheduler-v130.js` feuert Timer **und** rAF) | – | ja | ungedrosselt 112 Unity-Renders/s bei 56-Hz-Bildschirm; 4×: 10 ms CPU je Unity-Bild, Hauptthread-Bild Ø 52 ms (98 % > 33 ms), 16 s Spielzeit/min verloren; 6×: Unity 16 Bilder/s, 18 ms/Bild, Profil 28 % |
| 3 | Verdeckte 2D-Leinwand wird im Unity-Modus bei jedem Takt voll gezeichnet (`visibility:hidden`, 1200 × 1480) | – | ja | 12,3 ms (4×) / 22 ms (6×) je Takt; Profil 17,6 % |
| 4 | Erzwungene Layouts und DOM-Schreibvorgänge je Takt/Bild: `v92PrepareCanvas` (`offsetWidth`), `v98Toolbar → v132FullscreenUI` (`getBoundingClientRect`), `v131ReviewUI` (viele Attribute + `offsetHeight`), `paintLabels`, `v25UpdateLiveBoard`, i18n-MutationObserver | ja | ja | 2D-Profil: `v92PrepareCanvas` 10 %, `getBoundingClientRect` 7,5 %; Unity-Profil: `v131ReviewUI` 9,7 %, `getBoundingClientRect` 8,9 % |
| 5 | 2D zeigt nur Takt-Zustände: 25 Hz per `setInterval(40)`, keine Interpolation, Taktabstand schwankt auch ohne Last (p50 36–40, p95 54 ms) | ja | – | neue Bildinhalte nur in 41 % der 60-Hz- bzw. 21 % der 120-Hz-Bilder (ohne Last); mit Last 22–35 % / 11–18 % |
| 6 | Unity-Bildversorgung: Bild nur nach Quittung und ≥ 50 ms per rAF; Abspielpuffer interpoliert über die Takt-Uhrdifferenz (≤ 0,1 s) und hält danach an | – | ja | ungedrosselt 18,7 Bilder/s, Uhrschritt 41/82 ms im Wechsel, 20 % der Displaybilder > ±50 % Sollgeschwindigkeit; 4×: 9,6 Bilder/s, 23 % eingefrorene Bewegtbilder; 6×: 3,5–3,9 Bilder/s, 55–60 % eingefroren |
| 7 | Major-GC 30–170 ms, 2–5/min (vor allem Garbage aus den Save-Kopien) | ja | ja | 2D 4×: 14 Major-GC in 180 s, max 115 ms |
| – | Match-Engine (SI-183, Raumpässe, Flanken usw.) | klein | klein | `step` inkl. aller Wrapper 3,5 ms (4×) / 5,7–9,6 ms (6×) je Takt, Profil ~10–12 %; SI-Dateien zusammen < 1 % Eigenzeit |

Der 40-ms-Timer gibt höchstens 0,05 s Echtzeit pro Takt weiter. Ist der Hauptthread überlastet, läuft die Partie deshalb langsamer (4–37 s Spielzeit pro Minute verloren). Das ist eine Folge der Last, keine eigene Ursache.

**Seit wann:** R132 (vor SI-183) und R133 sind innerhalb der Messstreuung gleich wie R134 (2D 6×: `step` 6,8 / 7,0 / 5,7 ms, Zeichnen 13,1 / 13,1 / 13,1 ms, Save 274 / 275 / 268 ms; Unity 6×: R132 und R134 je ~16 Unity-Bilder/s, Hauptthread-Bild Ø 119/120 ms). Das Ruckeln ist also **keine Regression durch SI-183**. Die Bildpumpe (Ursache 2) kam mit Release 130. Die einzige Pixel-Messung (Release 118, 60,06 Unity-Schleifen/s) stammt von davor.

## Messtabellen

Hauptthread-Bilder = native rAF-Abstände der Seite; LoAF = Long Animation Frames; „verloren“ = Spielzeit, die wegen der 0,05-s-Grenze pro Minute verfällt.

| Lauf | rAF Ø/p95/p99 ms | > 33 ms | LoAF n (p50) | Taktabstand p50/p95 | Takt-Arbeit Ø/p99 | step Ø | draw Ø | Save Ø | verloren s/min |
|---|---|---|---|---|---|---|---|---|---|
| 2D 4×, ungespeichert, 180 s | 17,9/18,1/18,5 | 0,4 % | 11 (92) | 36/54 | 13,4/23 | 3,8 | 9,1 | – | 1,3 |
| 2D 4×, gespeichert 2,0 MB, 120 s | 21,2/18,1/178 | 2,9 % | 121 (200) | 36/57 | 19,9/199 | 3,5 | 7,9 | 172 | 9,7 |
| 2D 6×, gespeichert, 90 s | 25,8/35,8/300 | 11,0 % | 104 (307) | 39/77 | 32/309 | 5,7 | 13,1 | 268 | 15,0 |
| 2D 6×, 3 Welten 6,3 MB, 90 s | 36,8/35,6/797 | 10,0 % | 60 (814) | 39/98 | 56/816 | 6,0 | 12,7 | 765 | 28,5 |
| Unity 4×, ungespeichert, 180 s | 52,3/71,5/88,5 | 98,5 % | 1705 (58) | 64/96 | 15,7/28 | 3,0 | 12,3 | – | 16,3 |
| Unity 6×, gespeichert, 90 s | 120/335/370 | 100 % | 753 (99) | 101/347 | 51/325 | 8,5 | 22,1 | 267 | 35,0 |
| R132 2D 6×, gespeichert | 26,6/36,1/301 | 13,4 % | 91 (313) | 40/58 | 33/316 | 6,8 | 13,1 | 274 | 14,9 |
| R133 2D 6×, gespeichert | 24,8/35,9/302 | 10,7 % | 98 (310) | 39/57 | 31/320 | 7,0 | 13,1 | 275 | 12,7 |
| R132 Unity 6×, gespeichert | 119/337/357 | 100 % | 755 (94) | 97/352 | 54/332 | 7,2 | 21,2 | 271 | 34,9 |

| Unity-Lauf | Unity-Bilder/s | CPU je Unity-Bild Ø/p95 | Bilder an Unity/s | Bildabstand p50/p95 | eingefrorene Bewegtbilder | Bridge (Bild + postMessage + Handler) |
|---|---|---|---|---|---|---|
| 1×, 10 s | 112 | 1,7/2,5 | 18,7 | 53/60 | 1 % (20 % > ±50 %) | < 1 ms |
| 4× | 38 | 10,0/16,0 | 9,6 | 102/137 | 23 % | 0,1 + 0,2 + 2,9 ms |
| 6×, gespeichert | 16 | 18,0/29,6 | 3,9 | 204/536 | 55 % | 0,2 + 0,3 + 3,2 ms |

Speicher: Heap über 180 s stabil (2D 226 → 199 MB, Unity 300 → 298 MB); kein Wachstum gemessen. Mit 3 Welten 274 → 430 MB in 90 s (Save-Kopien vor der GC).

## Fixvorschläge

„Bytegleich“ bezieht sich auf die reproduzierbaren Prüfpartien mit festen 0,05-s-Schritten (`D6QA160`, `run-mobile-regression-v135 parity`, R132/R133-Altchecks). Echte Live-Partien hängen schon heute über die variable Timer-Schrittweite von der Bildlast ab und sind nicht bytegleich reproduzierbar.

1. **Autosave entschärfen** (größte Wirkung, 2D und Unity). Während des Live-Spiels seltener speichern (z. B. ≥ 15 s oder nur an Minutengrenzen bzw. Ereignissen). Pause, Halbzeit, Verlassen und `visibilitychange` speichern weiterhin; der Unity-Wrapper pausiert bei `hidden` bereits mit Snapshot. Zweite Stufe: nur die aktive Welt kopieren und validieren statt aller gespeicherten Welten; Live-Checkpoint getrennt und klein ablegen. Aufwand: Stufe 1 klein (ein Intervall in `world-physical-v65.js`), Stufe 2 mittel. Risiko: Stufe 1 gering (bei einem Absturz ohne `visibilitychange` gehen bis zu N s Partie verloren), Stufe 2 mittel (Speicherpfad, Backup-Semantik). Bytegleich: ja. Der Snapshot wird nur geschrieben, nicht in die Simulation zurückgelesen; nur Neuladen nach einem Absturz setzt an einem älteren Stand an. Speicherformat bei Stufe 1 unverändert.
2. **Unity-Bildrate begrenzen.** Die Pumpe sollte auch native rAF-Aufrufe auf die Periode drosseln (keine zwei Läufe pro Vsync, kein 120 Hz). Auf Touch/`reduced` 30 Bilder/s erwägen: das halbiert Unitys Hauptthreadanteil. Aufwand klein (Pumpe plus `test-view-frame-scheduler-v130.cjs`); 30 fps braucht einen Unity-Build oder eine Pumpenperiode. Risiko gering bis mittel: Die Pumpe lässt sich nicht einfach entfernen; der Gegenversuch ohne Pumpe fiel bei 6× nach 10 s ohne Quittung auf 2D zurück. Bytegleich: ja (nur Darstellung).
3. **Verdeckte 2D-Leinwand im Unity-Modus nicht zeichnen.** Nur das Malen der Leinwand überspringen. Zustandsnahe Teile der `draw`-Kette bleiben erhalten (`v100SyncPenaltyBall`, Torszenen/Banner, Rückschau-Aufzeichnung), bis jede Hülle einzeln geprüft ist. Aufwand mittel. Risiko mittel. Bytegleich: ja, sofern keine `draw`-Hülle Matchzustand oder `Math.random` berührt; vor dem Merge mit Paritätsläufen 2D/Unity belegen.
4. **Layout-Thrashing beseitigen.** Größen per `ResizeObserver` cachen statt `offsetWidth`/`getBoundingClientRect` je Takt lesen. UI-Texte und Attribute (`v131ReviewUI`, `v98Toolbar`, `v25UpdateLiveBoard`, Labels) nur bei Änderung schreiben, Lesezugriffe vor Schreibzugriffe bündeln. Aufwand mittel. Risiko gering bis mittel (Vollbild/Rückschau-UI; bestehende Vollbild-/Touchprüfungen). Bytegleich: ja.
5. **2D flüssig darstellen.** Zeichnen vom Timer lösen: per rAF zwischen den letzten beiden Simulationszuständen interpolieren, wie `v102` es für THREE tut; die Simulation bleibt auf ihrem Takt. Aufwand mittel bis groß. Risiko mittel (Overlays sind an den Takt gebunden). Bytegleich: ja, wenn die Interpolation nur liest. Den Simulationstakt selbst auf rAF umzustellen, ändert Live-Schrittweiten; das gilt nicht als ergebnisneutral und braucht eine Nutzerentscheidung.
6. **Unity-Bildversorgung und Abspielpuffer.** Pro Simulationstakt ein Bild senden statt per rAF und ≥ 50 ms. Unity spielt mit fester kleiner Verzögerung zwischen zwei empfangenen Bildern nach Uhrzeit ab (Snapshot-Interpolation), statt nach der Uhrdifferenz anzuhalten. Aufwand mittel bis groß (C#, neuer Unity-Build, Quellenkennung, R20-Vorlauflogik in `Blend`). Risiko mittel (R132/R133-Präsentationssperren neu belegen). Bytegleich: ja (nur Darstellung).
7. **GC** sinkt automatisch mit Fix 1. Kein eigener Fix nötig.

Empfohlene Reihenfolge: 1 (Stufe 1) → 3 → 4 → 2. Danach eine Gerätemessung, dann über 5/6 entscheiden.

## Nicht geprüft

- Echtes Pixel 9 Pro XL (kein ADB-Gerät): GPU-Zeit, 120-Hz-Verhalten der Pumpe auf Android, Wärmedrosselung, Akkulaufzeit. Hintergrund-/Wake-Lock-Wechsel ebenfalls nicht geprüft.
- Echte große Spielstände (7–22 MB laut Doku). Gemessen wurden nur die frische QA-Welt (2,0–2,8 MB) und drei Kopien davon (6,3 MB); größere Stände sind linear hochgerechnet.
- Volle 90-Minuten-Heapkurve: höchstens 3 Minuten am Stück gemessen. Die Rückschau-Zeitleiste (`timeline.push`, 6/s) wird nicht gekürzt; über 3 min war kein Wachstum messbar.
- THREE-Ersatzrenderer, Torrückschau-Wiedergabe, Elfmeterschießen, kleines Feld/5 Spieler, Release 131 und älter.
- Pixel-genaue Bildpräsentation: Unity-Glätte wurde aus gemessenen Ankunftszeiten mit der C#-Regel aus `WorldViewPlayback.cs` auf einem idealen 60-Hz-Raster nachgerechnet, nicht vom Bildschirm abgelesen.
