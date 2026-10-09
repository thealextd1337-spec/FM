# Android-Abnahme des 3D-Modus

`work/platform/qa/android-3d-acceptance.cjs` prüft ein echtes, per USB verbundenes Android-Gerät mit stabilem Chrome. Eine Desktop-Touchsimulation ersetzt diese Abnahme nicht. Der Runner lädt den aktuellen lokalen HTML-/Unity-Build auf einem eigenen Loopback-Ursprung und legt eine neue QA-Seite an. Bestehende Chrome-Tabs werden weder ausgelesen noch geschlossen; Live-Spielstände werden nicht angefasst.

## Voraussetzungen und Aufruf

- Bereits vorhandene Android Platform Tools: `adb` im PATH oder `--adb` mit absolutem Pfad. Der Runner lädt kein SDK herunter.
- Physisches USB-Gerät, USB-Debugging freigegeben, entsperrt und wach. Netzwerkgeräte und Emulatoren werden abgelehnt. Chrome vorab am Gerät öffnen.
- Aktuell erzeugte `outputs/index.html` und Unity-Artefakte unter `outputs/platform/unity-web/`. Build und Quellenkennung vor der Geräteabnahme einfrieren; ein neuer Build braucht eine neue Messung.
- Node mindestens 20; der vorhandene lokale Runtime-Pfad liefert Node 24. Playwright wird aus derselben bereits installierten Runtime geladen.
- Gerät im gewünschten Querformat fixieren. Messung ohne Berührung und ohne Wechsel zu anderen Apps laufen lassen.

Aus dem Repository-Stamm:

```powershell
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' work/platform/qa/android-3d-acceptance.cjs --probe
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' work/platform/qa/android-3d-acceptance.cjs --run --seconds 90 --adb 'C:/Android/platform-tools/adb.exe'
```

Bei mehreren USB-Geräten wählt `--serial <Gerät>` eines explizit aus. Seriennummern und fremde Tab-Inhalte gehören nicht in veröffentlichte Nachweise. Der Runner schreibt sie nicht in seinen Report. Jeder Aufruf erzeugt einen neuen Unterordner unter `outputs/3d-quality/android-device-prerequisites/`, einschließlich einer ehrlichen Probe bei fehlendem ADB oder Gerät. `prerequisites-ready` bedeutet nur, dass die Voraussetzungen vorliegen; `pass` und `hardwarePass` bleiben ausdrücklich `false`.

## Was tatsächlich gemessen wird

Der Runner verwendet `D6QA160.setup` auf `/native-build.html` mit großem Feld und sechs Feldspielern pro Team: 14 tatsächlich bestätigte Spieler einschließlich Torwarten. Er liest die tatsächlich übergebene und bestätigte `reduced`-Ladekonfiguration, Viewport-/Projektionsmaße, Gerätemodell, Android-/SDK-Stand und Chrome-Version. Anschließend startet er über Pause/Fortsetzen den vorhandenen nativen Timer. `D6QA160.run` und beschleunigte Simulation werden nicht verwendet. Die Messung dauert 60–180 Sekunden. Halbzeit-/Spielpausen bleiben native Spielphasen; der Runner überspringt sie nicht.

HTML, Manifest und die vier Unity-Builddateien werden vor und nach dem Aufruf mit SHA-256 erfasst; die vier Dateien müssen außerdem exakt zum Manifest passen. Ein während der Messung veränderter Build sperrt den Befund. Die Ladezeit umfasst Navigation beziehungsweise Harness-Erstellung bis Unity-Bestätigung, einschließlich QA-Karriere und Marktphase. Es läuft ein vorhandener Chrome-Prozess mit vorhandenem Profil und frischem QA-Ursprung; Caches werden nicht gelöscht. Diese Zeit ist keine isolierte Downloadmessung und kein belegter Kaltstart.

Der Vollbildknopf erhält ein CDP-Touchereignis. Der Report prüft `isTrusted` sowie das tatsächlich erreichte native Vollbild oder dessen vorhandenen Viewport-Rückfall. Schlägt dies am Gerät fehl, gibt es keinen Vollbildnachweis: Vollbild direkt auf dem Gerät öffnen und separat manuell protokollieren.

Die optionale Unity-Telemetrie muss in der tatsächlich geladenen Projektion `renderFrame` und `renderTime` enthalten. Nur monotone Werte erlauben die durchschnittliche Unity-Schleifenrate aus Zählerdifferenz und Unity-Echtzeit. Der Gesamtmittelwert umfasst sämtliche beobachteten Phasen einschließlich Pause und ist deshalb kein Gameplay-Benchmark. `liveIntervalUnityLoop` erfasst zusätzlich nur Abtastintervalle mit laufender nativer Uhr und sichtbarem aktivem Unity an beiden Enden; Übergänge zwischen den ungefähr zwei Sekunden auseinanderliegenden Stichproben bleiben unbeobachtet. Diese Zahlen beweisen weder tatsächlich dargestellte GPU-Bilder noch GPU-Frametimes/p95. Ohne die echten Felder lautet der Befund `not-measured`. Browser-rAF-Intervalle und beobachtete Projektionsänderungen werden getrennt benannt und niemals als Unity-FPS ausgegeben. Es gibt keinen erfundenen Leistungs-Schwellenwert.

Für Bildschirm-Wachhalten liest der Runner `screen_off_timeout`, den bestehenden Lade-Wachhaltemodus, Batteriestromquelle und `dumpsys power`; er verändert keine Systemeinstellungen. Wenn der Timeout bekannt ist, höchstens 165 Sekunden beträgt und kein einschlägiges globales Wachhalten beim Laden aktiv ist, verlängert er die Messung auf mindestens Timeout + 15 Sekunden. Nach dem Vollbild-Tap erfolgen keine weiteren Eingaben. Ein bestandener Einzelcheck verlangt währenddessen sichtbare QA-Seite, gehaltenen Wake Lock, Vollbild und gemessenen Zustand `Awake`/`ON` über den Timeout hinaus. Der zulässige Messbereich umfasst laufendes Spiel und gewöhnliche Pause im Vollbild. Native Halbzeit, Abpfiff, verlorene Sichtbarkeit oder verlassenes Vollbild unterbrechen diesen Messbereich: `wake.status` lautet dann `not-measured`, ergänzt um `interrupted: true` und den konkreten Grund. Daraus wird weder ein Fehler des Wachhaltens noch eine bestandene Hardware-Abnahme abgeleitet. Der Runner setzt eine Halbzeit nicht automatisch fort und stellt Vollbild nicht künstlich wieder her. Unbekannte Power-Ausgabe, längerer Timeout oder globales Lade-Wachhalten ergeben ebenfalls keinen positiven Wachhaltebeleg. Andere OS-Wachhalter können die Ursache weiterhin beeinflussen.

## Manueller Rest der Geräteabnahme

Der Runner automatisiert keinen Home-/Appwechsel: Chrome kann dabei auf fremde Nutzertabs zurückkehren. Auf einer eigenen QA-Seite separat prüfen und mit Zeitpunkten protokollieren:

1. Vollbild direkt antippen, Systemtimeout ohne weitere Eingabe überschreiten; Bildschirm muss an bleiben.
2. Zu einer anderen App wechseln und zurück zur selben QA-Seite. Wake Lock muss bei sichtbarer aktiver Partie wieder erworben werden; es darf keine zusätzliche simulierte Nachholzeit oder beschädigte Partie entstehen. Android kann dabei natives Vollbild verlassen; erneuten Vollbildeinstieg separat prüfen.
3. Namen, Ballhilfe und unterschiedliche Teamringmuster bei 14 Spielern im Querformat beurteilen; kleine Bedienflächen, Rückschau/Pause und Torwart-Fang-/Abwehr-/Aufstehphasen besichtigen.

Diese manuellen Schritte und eine vereinbarte Leistungsbewertung fehlen einem automatischen Report weiterhin. Deshalb ist `measured-manual-acceptance-outstanding` keine vollständige Android-Freigabe. Der Runner schließt nur seine eigene QA-Seite, trennt seine CDP-Verbindung und entfernt ausschließlich selbst angelegte, unverändert gebundene ADB-Weiterleitungen. Vorhandene Bindings bleiben erhalten; Konflikte werden abgelehnt. Ein Prozessabbruch durch hartes Beenden kann eine eigene Weiterleitung zurücklassen: anhand des lokalen Ports prüfen und gezielt entfernen, niemals `--remove-all` verwenden.

Die Verbindung folgt der offiziellen [Chrome-USB-Debugging-Dokumentation](https://developer.chrome.com/docs/devtools/remote-debugging) und der [Playwright-CDP-Schnittstelle](https://playwright.dev/docs/api/class-browsertype#browser-type-connect-over-cdp). Lokaler HTTP-Server und Harness verwenden die bestehenden Repository-Bausteine `work/ui-redesign/serve.cjs` und `unity-integration-v160.js`.
