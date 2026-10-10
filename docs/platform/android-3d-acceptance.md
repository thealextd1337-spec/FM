# Android-Abnahme des 3D-Modus

Aktueller Nutzerentscheid vom 10. Oktober 2026: **„Android-Test später“**. Der vorgeschlagene abschließende Release-119-Test über 75 Sekunden mit anschließendem manuellen Appwechsel wird jetzt nicht gestartet. Software-/Live-Prüfungen sind bestanden; die physische Pixel-Abnahme bleibt offen und benötigt später erneut bestätigte Gerätebereitschaft.

`work/platform/qa/android-3d-acceptance.cjs` prüft ein echtes, per USB verbundenes Android-Gerät mit stabilem Chrome. Eine Desktop-Touchsimulation ersetzt diese Abnahme nicht. Der Runner lädt den aktuellen lokalen HTML-/Unity-Build auf einem eigenen Loopback-Ursprung und legt eine neue QA-Seite an. Bestehende Chrome-Tabs werden weder ausgelesen noch geschlossen; Live-Spielstände werden nicht angefasst.

## Voraussetzungen und Aufruf

- Bereits vorhandene Android Platform Tools: `adb` im PATH oder `--adb` mit absolutem Pfad. Der Runner lädt kein SDK herunter.
- Physisches USB-Gerät, USB-Debugging freigegeben, entsperrt und wach. Netzwerkgeräte und Emulatoren werden abgelehnt. Chrome vorab am Gerät öffnen.
- Aktuell erzeugte `outputs/index.html` und Unity-Artefakte unter `outputs/platform/unity-web/`. Build und Quellenkennung vor der Geräteabnahme einfrieren; ein neuer Build braucht eine neue Messung.
- Node mindestens 22 mit globalem `WebSocket`; der vorhandene lokale Runtime-Pfad liefert Node 24. Playwright wird für diesen Geräteweg nicht benötigt.
- Gerät im gewünschten Querformat fixieren. Messung ohne Berührung und ohne Wechsel zu anderen Apps laufen lassen.

Aus dem Repository-Stamm:

```powershell
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' work/platform/qa/android-3d-acceptance.cjs --probe
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' work/platform/qa/android-3d-acceptance.cjs --run --seconds 90 --adb 'C:/Android/platform-tools/adb.exe'
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' work/platform/qa/android-3d-acceptance.cjs --run --seconds 75 --manual-seconds 90 --adb 'C:/Android/platform-tools/adb.exe'
```

Bei mehreren USB-Geräten wählt `--serial <Gerät>` eines explizit aus. Seriennummern und fremde Tab-Inhalte gehören nicht in veröffentlichte Nachweise. Der Runner schreibt sie nicht in seinen Report. Jeder Aufruf erzeugt einen neuen Unterordner unter `outputs/3d-quality/android-device-prerequisites/`, einschließlich einer ehrlichen Probe bei fehlendem ADB oder Gerät. `prerequisites-ready` bedeutet nur, dass die Voraussetzungen vorliegen; `pass` und `hardwarePass` bleiben ausdrücklich `false`.

## Was tatsächlich gemessen wird

Der Runner verwendet `D6QA160.setup` auf `/native-build.html` mit großem Feld und sechs Feldspielern pro Team: 14 tatsächlich bestätigte Spieler einschließlich Torwarten. Er liest die tatsächlich übergebene und bestätigte `reduced`-Ladekonfiguration, Viewport-/Projektionsmaße, Gerätemodell, Android-/SDK-Stand und Chrome-Version. Anschließend startet er über Pause/Fortsetzen den vorhandenen nativen Timer. `D6QA160.run` und beschleunigte Simulation werden nicht verwendet. Die Messung dauert 60–180 Sekunden. Halbzeit-/Spielpausen bleiben native Spielphasen; der Runner überspringt sie nicht.

HTML, Manifest und die vier Unity-Builddateien werden vor und nach dem Aufruf mit SHA-256 erfasst; die vier Dateien müssen außerdem exakt zum Manifest passen. Ein während der Messung veränderter Build sperrt den Befund. Die Ladezeit umfasst Navigation beziehungsweise Harness-Erstellung bis Unity-Bestätigung, einschließlich QA-Karriere und Marktphase. Es läuft ein vorhandener Chrome-Prozess mit vorhandenem Profil und frischem QA-Ursprung; Caches werden nicht gelöscht. Diese Zeit ist keine isolierte Downloadmessung und kein belegter Kaltstart.

Der Vollbildknopf erhält ein CDP-Touchereignis. Der Report prüft `isTrusted` sowie das tatsächlich erreichte native Vollbild oder dessen vorhandenen Viewport-Rückfall. Schlägt dies am Gerät fehl, gibt es keinen Vollbildnachweis: Vollbild direkt auf dem Gerät öffnen und separat manuell protokollieren.

Nach der automatischen Messung wird die eigene sichtbare QA-Seite als `automatic-fullscreen.png` aufgenommen. Der Report erfasst dazu den tatsächlich vorliegenden Vollbildstatus, Viewport-/VisualViewport-Maße, Match-/Host-/iframe-/Canvas-Rechtecke und Projektions-/Canvas-Rendermaße. Damit können etwa freie oder farbige Streifen innerhalb der Seite untersucht werden. `Page.captureScreenshot` läuft ausschließlich in der eigenen Session und bildet keine fremden Tabs, Chrome-Bedienelemente oder Android-Systemleisten ab. Eine zu diesem Zeitpunkt bereits beendete Vollbildphase wird ehrlich im Layout protokolliert. Bei unsichtbarer Seite oder Aufnahmefehler gibt es keinen Bildnachweis.

Die optionale Unity-Telemetrie muss in der tatsächlich geladenen Projektion `renderFrame` und `renderTime` enthalten. Nur monotone Werte erlauben die durchschnittliche Unity-Schleifenrate aus Zählerdifferenz und Unity-Echtzeit. Der Gesamtmittelwert umfasst sämtliche beobachteten Phasen einschließlich Pause und ist deshalb kein Gameplay-Benchmark. `liveIntervalUnityLoop` erfasst zusätzlich nur Abtastintervalle mit laufender nativer Uhr und sichtbarem aktivem Unity an beiden Enden; Übergänge zwischen den ungefähr zwei Sekunden auseinanderliegenden Stichproben bleiben unbeobachtet. Diese Zahlen beweisen weder tatsächlich dargestellte GPU-Bilder noch GPU-Frametimes/p95. Ohne die echten Felder lautet der Befund `not-measured`. Browser-rAF-Intervalle und beobachtete Projektionsänderungen werden getrennt benannt und niemals als Unity-FPS ausgegeben. Es gibt keinen erfundenen Leistungs-Schwellenwert.

Für Bildschirm-Wachhalten liest der Runner `screen_off_timeout`, den bestehenden Lade-Wachhaltemodus, Batteriestromquelle und `dumpsys power`; er verändert keine Systemeinstellungen. Wenn der Timeout bekannt ist, höchstens 165 Sekunden beträgt und kein einschlägiges globales Wachhalten beim Laden aktiv ist, verlängert er die Messung auf mindestens Timeout + 15 Sekunden. Nach dem Vollbild-Tap erfolgen keine weiteren Eingaben. Ein bestandener Einzelcheck verlangt währenddessen sichtbare QA-Seite, gehaltenen Wake Lock, Vollbild und gemessenen Zustand `Awake`/`ON` über den Timeout hinaus. Der zulässige Messbereich umfasst laufendes Spiel und gewöhnliche Pause im Vollbild. Native Halbzeit, Abpfiff, verlorene Sichtbarkeit oder verlassenes Vollbild unterbrechen diesen Messbereich: `wake.status` lautet dann `not-measured`, ergänzt um `interrupted: true` und den konkreten Grund. Daraus wird weder ein Fehler des Wachhaltens noch eine bestandene Hardware-Abnahme abgeleitet. Der Runner setzt eine Halbzeit nicht automatisch fort und stellt Vollbild nicht künstlich wieder her. Unbekannte Power-Ausgabe, längerer Timeout oder globales Lade-Wachhalten ergeben ebenfalls keinen positiven Wachhaltebeleg. Andere OS-Wachhalter können die Ursache weiterhin beeinflussen.

## Manueller Rest der Geräteabnahme

Der Runner automatisiert keinen Home-/Appwechsel: Chrome kann dabei auf fremde Nutzertabs zurückkehren. Optional hält `--manual-seconds 0..180` nach der automatischen Messung ausschließlich die eigene QA-Seite und den lokalen QA-Server offen; Standard ist 0. Sobald stdout `phase: manual-ready` meldet, kann der Nutzer Apps manuell wechseln und zu derselben QA-Seite zurückkehren. Der Runner zeichnet separat unter `manualObservations` Ausgangs-/Endzustand und ungefähr alle zwei Sekunden Sichtbarkeit, native Zeit/Phase, Wake-Lock- und Vollbildstatus dieser eigenen Seite auf. Er öffnet keine andere App oder Seite und erzwingt keine Wiederaufnahme oder Vollbildrückkehr. Daraus entsteht keine automatische Abnahme; Nutzerfeedback bleibt erforderlich. Eine zweite Aufnahme `manual-return.png` erfolgt nur, wenn die eigene QA-Seite am Ende wieder sichtbar ist. Die ursprüngliche automatische Messung und ihre Phasenbewertung bleiben getrennt.

Auf dieser eigenen QA-Seite prüfen und mit Zeitpunkten protokollieren:

1. Vollbild direkt antippen, Systemtimeout ohne weitere Eingabe überschreiten; Bildschirm muss an bleiben.
2. Zu einer anderen App wechseln und zurück zur selben QA-Seite. Wake Lock muss bei sichtbarer aktiver Partie wieder erworben werden; es darf keine zusätzliche simulierte Nachholzeit oder beschädigte Partie entstehen. Android kann dabei natives Vollbild verlassen; erneuten Vollbildeinstieg separat prüfen.
3. Namen, Ballhilfe und unterschiedliche Teamringmuster bei 14 Spielern im Querformat beurteilen; kleine Bedienflächen, Rückschau/Pause und Torwart-Fang-/Abwehr-/Aufstehphasen besichtigen.

Diese manuellen Schritte und eine vereinbarte Leistungsbewertung fehlen einem automatischen Report weiterhin. Deshalb ist `measured-manual-acceptance-outstanding` keine vollständige Android-Freigabe. Der Runner schließt nur seine eigene QA-Seite, trennt seine CDP-Verbindung und entfernt ausschließlich selbst angelegte, unverändert gebundene ADB-Weiterleitungen. Vorhandene Bindings bleiben erhalten; Konflikte werden abgelehnt. Ein Prozessabbruch durch hartes Beenden kann eine eigene Weiterleitung zurücklassen: anhand des lokalen Ports prüfen und gezielt entfernen, niemals `--remove-all` verwenden.

Geht die Antwort auf `Target.createTarget` verloren oder kommt sie erst nach dem Timeout, ist die erzeugte Zielkennung nicht verlässlich bekannt. Der Runner markiert den Cleanup dann mit `ownTargetCreationVerified: false` und `own-target-creation-unverifiable-manual-close-may-be-needed`; eine verspätete Antwort wird nicht als erfolgreicher Cleanup ausgegeben. Er sucht keine fremden Zielkennungen, um dies zu reparieren. Eine möglicherweise verbliebene eigene leere QA-Seite muss gegebenenfalls manuell geschlossen werden, sofern sie eindeutig zuordenbar ist.

Die Verbindung folgt der offiziellen [Chrome-USB-Debugging-Dokumentation](https://developer.chrome.com/docs/devtools/remote-debugging) und dem [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/index.html). Der Runner liest lediglich den Browser-Endpunkt aus `/json/version`, erzeugt per `Target.createTarget` eine eigene leere Seite und hängt per `Target.attachToTarget` ausschließlich deren neue Kennung an. Alle Runtime-/Page-/Input-Aufrufe verwenden diese eigene Session. Er verwendet weder Zielauflistung noch Discovery oder globale AutoAttach-Konfiguration; beim Aufräumen schließt er ausschließlich die erzeugte Zielkennung und trennt den WebSocket. `Browser.close` wird nicht verwendet. Lokaler HTTP-Server und Harness verwenden die bestehenden Repository-Bausteine `work/ui-redesign/serve.cjs` und `unity-integration-v160.js`.

Der historische erste Geräteversuch `run-2026-10-09T20-13-38-099Z` scheiterte während des Desktop-Playwright-Bootstraps nach bereits erfolgreicher WebSocket-Verbindung. Er enthält keine laufende Partie oder Leistungs-/Wachhaltemessung und ist kein Beleg eines Geräte- oder Spielfehlers. Android unterstützt am geprüften Gerät die Erstellung über `Target.createTarget`; der HTTP-Aufruf `PUT /json/new` war dort nicht unterstützt. Der aktuelle Runner verwendet deshalb den direkt belegten Target-Weg.

Wenn `dumpsys power` statt eines Bildschirmzustands lediglich ein `Display Power:`-Callbackobjekt ausgibt, liest der Runner ergänzend `dumpsys display`. Er wertet ausschließlich das exakte `mScreenState` im aktuellen `Display Power State` innerhalb des `Display Power Controller`/`Thread State` für Display 0 aus. Historische `state=`-Werte und andere Displays sind keine Ersatzbelege; uneindeutige Ausgabe bleibt unbekannt. Dieses Ausgabeformat folgt [AOSP DisplayPowerState](https://android.googlesource.com/platform/frameworks/base/+/master/services/core/java/com/android/server/display/DisplayPowerState.java).

Reine Parser-/Protokollprüfungen ohne ADB oder Browser:

```powershell
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' work/platform/qa/test-android-3d-acceptance.cjs
```

## Tatsächlicher Pixel-Nachweis für Release 118

Der Lauf [20:37:57 UTC](../../outputs/3d-quality/android-device-prerequisites/run-2026-10-09T20-37-57-401Z/report.json) verwendet das physische Pixel 9 Pro XL, Android 17/SDK 37 und Chrome 154.0.8037.126. 14 echte Spieler und `reduced` sind bestätigt. Buildhashes bleiben während des gesamten Aufrufs unverändert, Cleanup ohne Fehler.

75.018 Millisekunden durchgehend sichtbares Vollbild im laufenden Spiel überschreiten den unveränderten Systemtimeout von 60.000 Millisekunden. Alle Bildschirmproben melden `ON`/`Awake`, der Wake Lock bleibt gehalten; der durchgehende Wachhaltenachweis besteht. Die Unity-Schleifenrate beträgt 60,055/s über 75,031 Sekunden, keine Messung ausgelieferter GPU-Bilder. Der frühere 90-Sekunden-Lauf wurde durch die native Halbzeit unterbrochen und bleibt ausdrücklich ohne Wachhaltefreigabe.

Die [eigene Vollbildaufnahme](../../outputs/3d-quality/android-device-prerequisites/run-2026-10-09T20-37-57-401Z/automatic-fullscreen.png) zeigt einen echten unteren grünen Streifen: Matchbereich und Spielfläche sind 931,111 × 448 CSS-Pixel groß; Unityhost und iframe haben dieselbe Höhe, liegen aber bei `y=-71,111`. Die Canvas-/Projektionsmaße stimmen mit 931 × 448 überein. Es ist somit eine verschobene sichtbare Oberfläche, kein aus den Rendermaßen abgeleiteter GPU-Fehler. Die Korrektur gehört zu Release 119.

Das anschließende 120-Sekunden-Fenster weist keine beobachtete Hintergrundphase auf; später erreicht das Spiel seine native Halbzeit und verlässt Vollbild regulär. Der Nutzer hat den tatsächlichen Appwechsel nicht bestätigt. Appwechsel/Rückkehr, allgemeine Sichtabnahme sowie GPU-/Speicherleistung bleiben offen; `hardwarePass` bleibt `false`.
