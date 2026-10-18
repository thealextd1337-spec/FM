# Clientkorrekturen: lokale Abnahme vom 18. Oktober 2026

Basis `56170c04`; Fehlerarbeit auf `fix/client-r133` in `work/fix-client-r133`. Der [fachliche Bericht](../../docs/client-fixes-r133.md) nennt Ursachen, Korrekturen und Grenzen. Root-Meldungen B21–B25 heißen in der integrierten Bugliste B23–B27.

Die lokale Demo läuft über `node work/serve-client.cjs` unter <http://127.0.0.1:4290/>. Der tatsächliche Einstieg ist `/source/index.html`; Quelle und zugehöriges Unity-Paket stammen aus demselben Arbeitsstand. Der sichtbare Footer bleibt 132; dies ist keine Veröffentlichung.

## Nachweise

| Prüfung | Ergebnis und Beleg |
| --- | --- |
| Finale Produktionssuite | Vollständiger erneuter Lauf: **127 Befehle, null Fehler**, unveränderte finale Produktdateien; abschließender Status in `final-workflow.json` und `final-freeze.json`. Der erste Lauf unter `outputs/release-r132-ci/client-r133/` bleibt mit seinen drei korrigierten Befunden erhalten. |
| Unveränderte Prüfeingaben | `final-source-hashes.json`: 2.154 Quellen-, HTML-, Workflow- und Unity-Paketdateien; `final-freeze.json` vergleicht sie nach der vollständigen Suite erneut. |
| Fünf neue Regressionen | `test-client-{ball,miss,markers,keeper,dribble}-r133.cjs` im Workflow: acht 2D-Ballprojektionen, 16 Schussbilder, zehn enge Spielergruppen, 16 Torwartprojektionen und zwei tatsächliche native Dribbelläufe mit erhaltenen Release-Posen. Fehler vor der jeweiligen Korrektur nachgewiesen. |
| Tatsächlicher Quellenbrowser | `2d-second-half-source.png`; freie Ballposition `(480, 518)` statt des reproduzierten alten `(120, 222)`, nativer Zustand vor/nach Zeichnen identisch. Quellenfooter zur Laufzeit 132. |
| Gebauter Client und echte Unity-Laufzeit | `browser-final-frozen/runtime-tests.json`: 21 Checks, keine ungefangenen Seitenfehler. Quelle, Rückschau, Neuladen/Fortsetzen, Wechsel, Heim-/Auswärtsrecht, 2D/3D-Wechsel und gebautes HTML über HTTP. Vollständige Partie einschließlich Halbzeit, Ereignissen, Statistiken, Karrierebuchungen und Finanzen identisch zur Referenz (2.969 Ticks, 1:1, Minute 100, 14 Spieler im Datensatz). |
| Pausenlayout | `pause-layout.json`: 1632/844/667/390 px, DE/EN, Rollen, Ausrichtung, Teamtaktik, Undo, kein Überlauf, erneutes Öffnen. |
| Altpartien | `old-matches-final.json`: 340 Szenen, keine Abweichung in nativen Zuständen, Fortsetzung, Belastung oder Zufallsfolge. |
| Fortsetzen | `restore-final.json`: zehn reale Browserläufe einschließlich Standards, Halbzeit, Torpause und Wechsel, keine fehlenden nativen Zustände. Bewusst flüchtige Darstellungsdaten bleiben gesondert ausgewiesen. |
| Unity-Quellen | `unity-tests-summary.json`: vollständige `D6Cli.Tests`-Suite grün; 2.020 Bewegungs-, 675 Stütz-, 285 Kontakt-, 20 Kontinuitäts- und 2.318 U-1-Grenzen. Der bekannte r15-Fall bleibt innerhalb seiner bestehenden R18-Sperre. |
| WebGL-Build | `web-build-summary.txt`: Unity 6000.6.4f1, 315,2 s, keine Buildfehler, drei SDK-/Compilerwarnungen. Szenenprüfung bestätigt das echte Low-Poly-Modell. |
| Bytegleiches Paket | `unity-manifest-final.json`: 58 Quellen-, Identitäts-, Datei- und URL-Prüfungen grün; Quellenkennung `7ce6f77fa77d4689e6f9befd4e27ae9bbdfab3ade2dc380d8f000abc9c72c3fe`. Beide Einzeldatei-Builds sind bytegleich. |
| Ergänzende Paketprüfungen | `supplemental/current-results.json`: Buildeinbettung, Wappen, Sponsoren, deaktivierte Spielerbilder und Releasebindung. Der historische R132-Paketcheck verweigert die neue Quellenkennung mit seinem unveränderten alten Standard korrekt; Wiederholung mit ausdrücklich gepinnter neuer Kennung ist grün. |
| Offline-Veröffentlichungsprobe | `publication-dry-run/publication-dry-run.json`: neun echte Dateien, Größen/SHA-256 und bytegleicher Fake-FTPS-Upload, Manifest zuletzt, sieben lokal simulierte HTTP-Prüfungen; kein Netzwerk und kein Upload der Spielseite. |
| B05-Experimente | `b05-experiments.json`: zwei verworfene Varianten mit einer beziehungsweise zwei neuen R132-Grenzverletzungen. Beide vollständig zurückgenommen, keine gelockerten Grenzen. |

## Prüfharness-Korrekturen

Der erste Gesamtlauf zeigte drei Befunde: Der Markerzugriff benötigte im alten Live-Spieler-Harness eine nicht vorhandene DOM-Funktion; die Umschaltung richtet sich jetzt direkt nach dem aktiven Weltcontroller. Ein alter Torwarttest erwartete die fehlerhafte Drehung zum Kontaktpunkt und verwendete im unskalierten Fall eine bereits veränderte Fixture; er prüft jetzt an einer frischen Parade die Torachse und die erhaltene seitliche Reichweite. Die bisherige Höhenkorrektur alter dekorativer Fehlvarianten bleibt erhalten; ein zusätzlicher Check fordert die tatsächliche berechnete SI-Höhe.

Die Browserprüfung des großen Einzeldatei-Builds wurde durch `route.fulfill` an der DevTools-Pipe-Grenze von 100 MiB beendet. Der Prüfserver liefert dieselbe Datei jetzt direkt per HTTP; alle bisherigen Verhaltensassertionen bleiben erhalten. Die vollständige Quellenpartie war bereits davor grün. Die abschließenden 21 Browserchecks verwenden die korrigierte HTTP-Zustellung und die eingefrorenen finalen Quellen.

Die Original- und Versuchslogs liegen lokal in den verlinkten Unterverzeichnissen beziehungsweise `outputs/release-r132-ci/`; die versionierten Zusammenfassungen enthalten keine Unity-Startparameter oder Anmeldedaten.

## Grenzen

B05 bleibt offen. Die Original-Torszene ist ohne damaligen Spielstand nicht exakt wiederholt. Die Positionswechsel betreffen laut Nutzerbestätigung 2D; der dort nachgewiesene Markermechanismus ist korrigiert, die konkrete visuelle Abnahme bleibt offen. Jede konkrete Nutzerabnahme sowie reale Android-/Dauerlastabnahmen bleiben getrennt. Bestehende Ergebnisse und Spielstände wurden nicht rückwirkend umgerechnet.
