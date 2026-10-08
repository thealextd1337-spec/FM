# Q01: unabhängige lokale Demoabnahme

Stand: 8. Oktober 2026. Welle 0/1 umfasst eine lokale PC-Vergleichsdemo. Keine Veröffentlichung, Androidinstallation, Storefreigabe oder Übernahme bestehender Karrieren.

## Nachlauf und Tornetze

Ergänzung vom 8. Oktober 2026: Die nachfolgenden ursprünglichen Abnahmen und Leistungsmessungen bleiben historische Belege. Aktueller WebGL-Build `build_11cea1f2edb0`, SourceId `5df56b10296b78ae4a2ae45de5ca9164f959a5f2cfec6abd050bec27e7155591`: [Buildbericht](../../outputs/platform/followthrough-build/build-report.json), 0 Fehler, drei bekannte Warnungen, 83.354.711 Bytes. Vorhandene SampleScene, Desktop-Buildziel, Quality-/Pipelinezuordnungen und PlayerSettings sind anschließend wiederhergestellt.

- [Browser: zehn Prüfgruppen](../../outputs/platform/qa/2026-10-08T09-00-23-973Z-browser/report.json) und [Unity: elf Prüfgruppen](../../outputs/platform/qa/2026-10-08T09-02-45-660Z-unity/report.json) bestanden, ohne Seiten-/kritische Grafikfehler. Geprüft: sichtbare Erst-/Reset-/Restorebilder, zwölf/vierzehn Figuren, beide Felder/Richtungen, Abschluss nach zusätzlichem Nachlauf, Pause/Fortsetzung und tatsächlicher Zwischenstand-Roundtrip **während** des Nachlaufs.
- [Vier gezielte Unity-Nachlauffälle](../../prototypes/match-engine-unity/follow-through-tests.json): Tore in beiden Richtungen behalten ihre Eingangsbewegung, erreichen das Netz, geben das Ergebnis genau einmal ab und laufen drei Sekunden weiter. Fang bleibt gehalten; Parade besitzt eine freie Setzphase. Pause, quellengebundener Restore und atomare Ablehnung eines manipulierten Nachlaufendes geprüft. Die [288 ursprünglichen Kontakt-/Checkpointfälle](../../prototypes/match-engine-unity/selftest.json) bleiben mit Nachlaufparameter 0 bestanden.
- Der [erste neue Unity-Browserlauf](../../outputs/platform/qa/2026-10-08T09-01-12-140Z-unity/report.json) deckte bei einem gespeicherten Netzkontakt eine JSON-Rundung der Ereignisposition um 2,78e-17 auf. Die bereits bestehende physikalische Toleranz 1e-10 gilt jetzt auch für Ereignisposition und Ereigniszeit. Ereigniskennungen, Typen, Ticks, Elternbezüge, Metadaten, Ergebnis und Akteursidentitäten bleiben exakt geprüft. Die Änderung betrifft den Prüfvergleich; die Simulation wurde dafür nicht verändert.
- Tatsächliche Nahbilder wurden visuell gesichtet: [Browsernetz](../../outputs/platform/qa/2026-10-08T09-00-23-973Z-browser/camera-contact.png), [Unitynetz](../../outputs/platform/qa/2026-10-08T09-02-45-660Z-unity/camera-contact.png). Netze haben Seiten, Rückwand und Dach; keine generierten Beispielbilder. WebGL-Datei-URLs tragen Inhaltshashes, Demolader eine neue Revision, damit alte Cachedateien nicht als neuer Stand erscheinen.

**Physikgrenze:** Unity ergänzt erst nach dem feststehenden Kontaktresultat Schwerkraft, Bodenreibung und eine gedämpfte starre Netzhülle. Die vorherige lineare Kontaktprobe bleibt erhalten. Netzverformung, Pfostenkollision und vollständige Luftball-/Matchphysik sind weiterhin offen. Das Browsernetz ist Darstellung; seine Ballbewegung kommt aus der Bestandsengine. Neue Dauer-/Leistungsmessungen wurden nicht durchgeführt. Eindeutige Namen und die Kontaktkamera wurden anschließend umgesetzt, siehe Ballphysik und Kontaktkamera weiter unten. Die zusätzliche Pfosten-/Lattenphysik gehört zu eigenen Proben; diese ursprünglichen Kontaktproben bleiben getrennt. Die vom Nutzer gemeldeten Ladeprobleme sind nach seiner Rückmeldung erledigt.

## Vorliegende Evidenz

| Prüfung | Stand | Beleg / Grenze |
| --- | --- | --- |
| Gemeinsames Schema, eindeutige Szenenkennungen, vollständige Mannschaften | Bestanden | 288 Szenen, 36 Familien, acht Konfigurationen je Familie |
| Koordinatenhin-/rückweg für beide Felder, Mannschaftsgrößen und Richtungen | Bestanden | Fehlergrenze 1e-10; unveränderte Tor-/Strafraummaße |
| Reproduzierbare Zufallsfolge und Wiederherstellung | Bestanden | Gleiche Folge vor/nach Rücksetzen auf gespeicherten Zustand |
| Ereignisledger: Wiederholung, defensive Kopien, Wiederherstellung | Bestanden | Doppelte Kennung erzeugt keinen zweiten Eintrag |
| Sämtliche analytischen Katalogerwartungen einschließlich Folgekontakte | Bestanden | Prüft nur Orakel-/Katalogkonsistenz; **kein Nachweis eines Enginekontakts** |
| Reale Browserbedienung, Lade-Rennen, Kamera, Pause/Fortsetzung, Zwischenstand, Export | Bestanden | Neun Prüfgruppen inklusive tatsächlicher Feldbilder |
| Dieselben Bedien-/Zustandsprüfungen in Unity-Web | Bestanden | Zehn Prüfgruppen inklusive beschädigtem Checkpoint; Grafik- und Transportfehler behoben |
| Sichtbarer Enginewechsel Browser→Unity→Browser | Bestanden | Dieselbe Seite, jeweils richtige Engine, zwölf Figuren und bedienbares Start/Pause |
| Vollständige fachliche Gleichwertigkeit der Engines | Offen | Beobachtete Demoergebnisse sind protokolliert; native Abweichungen und fehlende Fälle bleiben ausdrücklich sichtbar. Keine erwarteten Ereignisse werden in den Renderer geschrieben. |
| Mindestens 20 Minuten pro Engine, seriell, gleicher Stand | Bestanden für Render-/Kontaktneustarts | Je 148 Neustarts, alle acht Konfigurationen, unveränderte Hashes, keine kritischen Fehler; aktive Last stark unterschiedlich |
| Vollständige Partie und vollständige Rückschau, Aufräumen | Offen | Kontaktproben und wiederholte Starts sind keine vollständige Partie |
| Pixel 9a / Pixel 9 Pro XL | Offen | Keine Geräte- oder APK-Abnahme in dieser Welle |

Analytischer unabhängiger Lauf: [`2026-10-07T22-17-12-380Z-contract/report.json`](../../outputs/platform/qa/2026-10-07T22-17-12-380Z-contract/report.json). Der Bericht enthält Hashes der gemeinsamen Quellen und fünf getrennte Prüfgruppen. Das Fachorakel wird als Eingabe konsumiert; Q01 schreibt keine Fachfixtures oder Produktquellen um.

Browserlauf: [`2026-10-07T22-22-45-161Z-browser/report.json`](../../outputs/platform/qa/2026-10-07T22-22-45-161Z-browser/report.json), dazu Screenshot und exportierter Messstand. Start/Pause/Fortsetzen, zustandstreue Pause, deterministischer Zwischenstand, sichtbare Konfigurationswahl auf 14 und zurück auf zwölf Figuren sowie Abschluss/Reset und Export bestanden, keine Seitenfehler. Die native Meldung `FIELD_PROJECTION_ONLY` bleibt erhalten: Das größere Feld vergrößert derzeit die Darstellung, die Bestandsphysik rechnet weiter mit ihrer ursprünglichen Geometrie. Auch abweichende Keeperboxen und native Ergebnisvorwahl bleiben sichtbare Fachbefunde.

Erweiterter finaler Browserlauf: [`2026-10-07T22-34-40-077Z-browser/report.json`](../../outputs/platform/qa/2026-10-07T22-34-40-077Z-browser/report.json), acht Prüfgruppen bestanden. Bei künstlich um zwei Sekunden verzögertem Assetstart gewinnt die letzte der noch während der Initialisierung ausgelösten Ladeanfragen. Die Kontaktkamera verändert das Bild und bewahrt den pausierten physikalischen Zustand. Keeper-Herkunftssperre und Abseits bleiben in diesen nativen Katalogproben ausdrücklich nicht unterstützt; die Oberfläche zeigt die tatsächliche Lücke an und erfindet kein Regelereignis. Das Bestehen dieser Sichtbarkeitsprüfung ist keine Regelabnahme. Die Hashes von Demo inklusive Server, gemeinsamen Quellen und Katalog sind im Lauf unverändert.

Erster Unity-Weblauf: [`2026-10-07T22-37-40-758Z-unity/report.json`](../../outputs/platform/qa/2026-10-07T22-37-40-758Z-unity/report.json). Acht Gruppen bestanden, einschließlich tatsächlicher Handberechtigungs-/Abseitsmeldungen und dauerhaft sichtbarer Fehlermeldung beim beschädigten Checkpoint; keine Seitenfehler. Ein **gültiger** Checkpoint wurde jedoch mit `Incompatible checkpoint` abgelehnt. Der [isolierte Browser-Roundtrip](../../outputs/platform/qa/2026-10-07T22-39-13-923Z-checkpoint/report.json) reproduziert dies direkt nach Speicherung ohne weiteren Simulationsfortschritt; [Original-Checkpoint](../../outputs/platform/qa/2026-10-07T22-39-13-923Z-checkpoint/checkpoint.json). Dieser Fehler blockierte damals die Langläufe bis zum gezielten Fix und erneuter unabhängiger Abnahme.

Der Fix des Transportpfads nimmt gültige Checkpoints an. Im [Nachlauf](../../outputs/platform/qa/2026-10-07T22-48-16-797Z-unity/report.json) beträgt die größte JSON-Rundungsabweichung physikalischer Werte 3,55e-15. Ausschließlich Zeit und Positions-/Geschwindigkeitsvektoren dürfen beim Unity-Checkpoint-Roundtrip um höchstens 1e-10 abweichen; Kennungen, Ticks, Aktionen, Ereignisse, Ergebnis und übrige Projektionsfelder bleiben exakt. Pause und Kamerawechsel behalten weiterhin vollständige exakte Zustandsvergleiche.

Die Kamerabilder zeigten jedoch nur Hintergrund. [Vier Bildzustände mit Unity-Konsole](../../outputs/platform/qa/2026-10-07T22-49-56-460Z-unity-render/report.json) und ein [isolierter WebGL-Hook](../../outputs/platform/qa/2026-10-07T22-52-14-326Z-webgl-trace/trace.json) belegen den Fehler schon beim Erstladen: `sampler2DShadow` für zusätzliche Lichtschatten war an eine SRGB8_ALPHA8-Farbtextur ohne Tiefenvergleich gebunden. `glDrawElements` scheitert, obwohl URP-Bildzähler steigen. Der vorher scheinbar bestandene Bildwechsel war daher kein tragfähiger Renderbeleg. Künftig prüfen zusätzliche PNG-Pixel-/Detailgates Erstladen, Reset, Restore sowie zwölf/vierzehn Figuren; WebGL-/Runtimefehler sperren Abnahme und Messung. Keine guten FPS aus leeren Bildern akzeptieren.

Zwei vorherige Versuche bleiben dokumentiert: Ein außerhalb der Sandbox gestarteter Browser konnte den dort laufenden Server auf Port 4300 nicht erreichen; der Test verwendet deshalb standardmäßig denselben Server in seinem eigenen Prozess auf einem freien lokalen Port. Ein früher Bereitschaftswait war schwächer als die echte Bedienbereitschaft und lieferte einmal einen noch fehlenden Snapshot; der finale Test wartet auf API-Bereitschaft **und** aktivierten Startknopf. Die restlichen vier Prüfgruppen dieses Vorlaufs waren bereits bestanden.

## Wiederholung

Finale Abnahme nach beiden Fehlerkorrekturen: [Browser, neun Gruppen](../../outputs/platform/qa/2026-10-07T22-57-01-654Z-browser/report.json), [Unity, zehn Gruppen](../../outputs/platform/qa/2026-10-07T22-56-04-779Z-unity/report.json), [sichtbarer Enginewechsel](../../outputs/platform/qa/2026-10-07T22-59-16-682Z-engine-switch/report.json). Alle bestanden, keine Seiten- oder kritischen Grafikfehler. Echte Feldbilder nach Erstladen, Reset und Restore enthalten deutliches Spielfeld und Figuren; beide Bilder mit vierzehn Figuren wurden zusätzlich visuell gesichtet. Die historischen Fehlversuche oben bleiben Diagnosebelege, sind aber keine Beschreibung des finalen Builds `build_ba3b5ffa6fa7`, SourceId `3914989081d845c9296ef294fd208fdfe473770ebab9e47ab8f4e64da573893e`.

Die [finalen seriellen Dauerläufe](performance-report.md#finale-serielle-dauerläufe) liefen je mindestens 20 Minuten mit 148 Neustarts und allen acht Feld-/Mannschafts-/Richtungskonfigurationen. Ende-Bilder weiterhin mit echtem Feld/Figuren, keine Seiten-/Render-/Neustartfehler, keine verlorenen Intervalle, Quellen unverändert. Der beobachtete API-aktive Anteil beträgt Browser 99,90 %, Unity 4,18 %: frühe Unity-Kontakte rendern bis zum nächsten Neustart weiter. Damit ist lokale Render-/Neustartstabilität belegt, weder gleiche Simulationslast noch eine Engine-Rangfolge. Vollständige Partien und Rückschau bleiben offen.

```powershell
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' work/platform/qa/check-contract.cjs
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' work/platform/qa/check-demo.cjs browser
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' work/platform/qa/check-demo.cjs unity
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' work/platform/qa/check-engine-switch.cjs
```

Die beiden Browserläufe starten standardmäßig den unveränderten lokalen Vergleichsserver auf einem freien Port im selben Prozess; `D6_PROBE_URL` kann einen vorhandenen Server auswählen. Jeder Lauf öffnet ein eigenes leeres Profil und schreibt einen neuen Belegordner. Sichtbare Start-/Pause-/Fortsetzen-/Laden-/Zwischenstand-/Exportknöpfe werden tatsächlich bedient. Geprüft werden Fortschritt, Zustandstreue in der Pause, Wiederherstellung, zwölf/vierzehn Figuren, beide Felder/Richtungen und JSON-Download. Fachliche Resultate werden als tatsächliche Zustände mit Ereignissen und Befunden protokolliert, nicht aus dem Orakel als bestandene Engineergebnisse übernommen.

Der native Demozwischenstand ist eine deterministische Neuausführung mit anschließendem Zustandsvergleich. Er ist ausdrücklich kein Nachweis eines produktiven Karriere-Snapshotformats. Engineübergreifend müssen Fachinvarianten gelten; eine bitgleiche physische Flugbahn zwischen JavaScript und Unity wird nicht verlangt.

Die späteren drei UI-Punkte bleiben ausdrücklich separat: echter 200-%-Browserzoom, Smartphone-/Screenreaderprüfung einschließlich Tastatur/Dialogen und gemeinsame visuelle Besichtigung von Lesbarkeit, Abständen und Bedienung. Diese lokale Vorprüfung schließt keinen dieser Punkte stillschweigend ab.


## Ballphysik und Kontaktkamera

Abnahme vom 8. Oktober 2026: **42 unterschiedliche sichtbare Szenentitel** bei unveränderten Kennungen der 36 ursprünglichen Familien. Sechs zusätzliche Familien mit acht Konfigurationen ergeben **48 isolierte Ballphysikfälle**. Die Kontaktansicht verwendet Ballbahn und tatsächlich vorgesehene Beteiligte; Mittelfeldkontakte werden im Mittelfeld gezeigt. Physikproben beziehen die aktuelle Ballposition im Nachlauf ein. Die Pfostenprobe enthält den ganzen Torrahmen und das Netz im Bild; Kamerawechsel verändern keine Simulation. Die Browserdarstellung berücksichtigt den Unterschied der Koordinatenorientierung zu Unity; beide zeigen die Szene von derselben Seite. Deutsche Beschriftungen und kleine Fensterbreite wurden zusätzlich geprüft. Dies ersetzt keinen der drei späteren UI-Besichtigungspunkte.

| Prüfung | Ergebnis | Nachweis |
| --- | --- | --- |
| JavaScript: 48 Physikfälle, deterministische Wiederholung, unabhängiger Scheitelpunkt/Ausrollweg, schneller Rahmenkontakt, Vorbeiflug und Bewegung vom Rahmen weg | Bestanden | [JavaScript-Prüfung](../../outputs/platform/physics/js-tests.json) |
| Unity: 48 Physikfälle, Pause, Zwischenstand durch tatsächliche JSON-Hülle, Fortsetzung, genau eine Ergebnisübergabe und Torwertung | Bestanden | [Unity-Prüfung](../../prototypes/match-engine-unity/physics-tests.json) |
| Vergleich der Ballzustände über Verlaufsschnappschüsse und Endzustände aller 48 Fälle | Bestanden | Maximaler Positions-/Geschwindigkeitsunterschied 1,07e-14, Prüfgrenze 1e-8; gleicher Tick, Ereignistyp/-grund und Score. Gilt nur für diese gleich parametrisierten isolierten Demokerne. |
| Bisherige Kontaktfälle und Nachlauf | Bestanden | [288 Kontaktfälle inkl. Wiederherstellung](../../prototypes/match-engine-unity/selftest.json), [vier Nachlauffälle](../../prototypes/match-engine-unity/follow-through-tests.json) |
| Browser: bisherige Bedienung, Bilder, Laden, Zwischenstand, Kamera und Export | Bestanden | [10 Prüfgruppen](../../outputs/platform/qa/2026-10-08T09-45-40-664Z-browser/report.json) |
| Unity-Web: dieselben Bedienprüfungen einschließlich Fehlerfall | Bestanden | [11 Prüfgruppen](../../outputs/platform/qa/2026-10-08T09-41-38-087Z-unity/report.json) |
| Neue Proben über sichtbare Webbedienung, tatsächlicher Pause/Restore, drei Sekunden Nachlauf, 42 eindeutige Titel, Kontaktkamera und schmale Ansicht | Bestanden in beiden | [Browser, sechs Szenen](../../outputs/platform/qa/2026-10-08T09-45-06-471Z-browser-physics/report.json), [Unity, sechs Szenen](../../outputs/platform/qa/2026-10-08T09-42-06-993Z-unity-physics/report.json) |
| Browser → Unity → Browser im finalen Stand | Bestanden | [Enginewechsel](../../outputs/platform/qa/2026-10-08T09-46-48-251Z-engine-switch/report.json) |

Finaler Unity-Webbuild `build_a8e0beb4a25d`, SourceId `8b2c5051edf80381647b2f3a6f6ff3977b2d4839d1140005479f0b37551f111f`: 83.360.458 Bytes, 84,36 Sekunden, null Fehler und die drei bekannten Warnungen (RuntimePipelineConfig der Werkzeugverbindung, zweimal veralteter endFrameRendering-Hook). [Buildbericht](../../outputs/platform/physics-build-utf8/build-report.json), [ausgelieferte lokale Dateihashes](../../outputs/platform/unity-web/probe-build.json). Unity-Projekteinstellungen sind auf den vorgefundenen Stand zurückgestellt: StandaloneWindows64, PC-Pipeline/Qualität 1, 1024×768, Brotli, runInBackground=false; SampleScene bleibt unverändert und sauber.

Die PC-Demo ist lokal bereitgestellt. Keine Produktions-, Karriere-, Android- oder Leistungsabnahme: Spielerkontakte, vollständige Match-KI, Spin/Luftwiderstand und Netzverformung sind in diesen Ballphysikproben offen. Bestehende Kontaktproben werden nicht nachträglich als physikalisch vollständige Szenen dargestellt. Die bisherigen Leistungsmessungen bleiben archiviert; es wurde kein neuer Leistungssieger bestimmt. Die drei UI-Besichtigungspunkte bleiben später.

Wiederholen: `node work/platform/qa/check-ball-physics.cjs`, Unity-Editor `ProbePhysicsTests.Run(repository)`, danach `node work/platform/qa/check-physics-demo.cjs browser` und `node work/platform/qa/check-physics-demo.cjs unity`.

## Nachgiebige Tornetze

Aktuellster Stand vom 8. Oktober 2026, ersetzt den zuvor starren Netzkontakt: Der Ball drückt das Netz lokal nach außen und wird währenddessen abgebremst. Nach dem Kontakt schwingt das Netz gedämpft zurück. Seiten, Dach und Rückwand können sich verformen; die Ränder bleiben befestigt. Unterteilte Netzstränge verändern ihre tatsächlichen Meshvertices in beiden Renderern. In der Standard-Netzprobe beträgt die maximale Eindrücktiefe 0,7733 m. Das ist eine kalibrierte Feder-/Dämpfernäherung mit lokalen Kontaktflächen, keine vollständige Stoffsimulation. [Gemeinsame Parameter und Zustandsvertrag](../match-contracts/shared.md#ergänzung-nachgiebiges-tornetz).

| Prüfung | Ergebnis | Nachweis |
| --- | --- | --- |
| JavaScript: acht Netzkonfigurationen, allmähliches Bremsen, Rückschwingen, Ausklingen, feste Ränder und genau eine Tor-/Kontaktwertung; alle vier Netzflächen separat | Bestanden | [Netzprüfungen](../../outputs/platform/soft-net/js-tests.json) |
| Unity: acht Netzkonfigurationen, derselbe Verlauf, tatsächlicher JSON-Zwischenstand während der Verformung, Fortsetzung und atomare Ablehnung beschädigter Netzwerte | Bestanden | [Unity-Netzprüfungen](../../prototypes/match-engine-unity/net-tests.json) |
| 48 Ballphysikfälle beider Demokerne, inklusive Netzposition/-geschwindigkeit/-Spitze in Verlauf und Endzustand | Bestanden | [Vergleich](../../outputs/platform/physics/js-tests.json), maximale Abweichung 1,07e-14 bei Prüfgrenze 1e-8 |
| Bestehende 288 Kontaktfälle mit Zwischenständen und vier Nachlauffälle | Bestanden | [Kontaktprüfungen](../../prototypes/match-engine-unity/selftest.json), [Nachlauf](../../prototypes/match-engine-unity/follow-through-tests.json) |
| Tatsächliche Netzmeshverformung im Web, beide Richtungen, Pause, Zwischenstand, Ausklingen und Rücksetzen | Bestanden, beide Bilder visuell gesichtet | [Browser](../../outputs/platform/qa/2026-10-08T10-04-39-244Z-browser-soft-net/report.json), [Unity](../../outputs/platform/qa/2026-10-08T10-08-52-785Z-unity-soft-net/report.json) |
| Bisherige sichtbare Bedien-, Bild- und Fehlerprüfungen | Bestanden | [Browser: zehn Gruppen](../../outputs/platform/qa/2026-10-08T10-04-52-521Z-browser/report.json), [Unity: elf Gruppen](../../outputs/platform/qa/2026-10-08T10-09-06-136Z-unity/report.json) |
| Browser → Unity → Browser mit aktualisiertem Build | Bestanden | [Enginewechsel](../../outputs/platform/qa/2026-10-08T10-09-34-857Z-engine-switch/report.json) |

Unity-Webbuild `build_5f3d508ca057`, SourceId `d9dbfab3aadea54d1ab8bf810eb5296b06250c740b10dfb3c4ea55b0a40d38b3`: 83.366.335 Bytes, 95,10 Sekunden, null Fehler und drei bekannte Werkzeug-/Rendering-Hook-Warnungen. [Buildbericht](../../outputs/platform/soft-net-build/build-report.json), [lokal ausgelieferte Dateihashes](../../outputs/platform/unity-web/probe-build.json). Danach auf StandaloneWindows64, PC-Pipeline/Qualität 1, 1024×768, Brotli und runInBackground=false zurückgestellt; SampleScene bleibt sauber.

Die gekoppelte Netzphysik gilt für die isolierten Ballphysikproben und den Unity-Nachlauf. Der native Browsernachlauf behält seine bisherige Ballphysik; dort folgt ausschließlich die Netzverformung der Ballansicht. Produktionsquelle, Karrieren und Veröffentlichungsstand bleiben unverändert. Keine neue Dauer-/Mobilmessung und keine Engineentscheidung; die drei verschobenen UI-Besichtigungen bleiben offen.

Wiederholen: `node work/platform/qa/check-soft-net.cjs`, Unity-Editor `ProbeNetTests.Run(repository)`, anschließend `node work/platform/qa/check-soft-net-demo.cjs browser` und `node work/platform/qa/check-soft-net-demo.cjs unity`.


## Zusammenhängende Spielzüge und Unity-Priorität

Nutzerentscheidung vom 8. Oktober 2026: Unity wird der Hauptpfad für den weiteren 3D-Ausbau. Der Browserpfad bleibt als Bestands- und Vergleichsgrundlage erhalten. Die visuelle Wahl ist keine neue Vollspiel-/Android-Leistungsmessung. Die [zusammenhängenden Spielzüge](connected-play.md) sind lokal geliefert; als nächstes folgt die abgegrenzte Unity-Anbindung an echte Vereinswelt-Partien mit Pause, Zwischenstand und Rückschau.
