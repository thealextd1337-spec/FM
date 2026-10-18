# Lokale Clientkorrekturen nach dem SI-Gesamtstand

Basis: `56170c04` vom 17. Oktober 2026, laut Nutzerübergabe der vollständig gemergte und geprüfte Stand der Demo auf Port 4290. Fehlerarbeit vom 18. Oktober in `work/fix-client-r133`, Branch `fix/client-r133`. Der Root-Checkout mit seinen lokalen Dokumentänderungen bleibt erhalten. Diese Arbeit veröffentlicht nichts.

## Eindeutige Meldungen

Die Integration verwendete B21 bereits für die Belastungsbuchung beim Schlusspfiff und B22 für fehlende Spielflanken. Beide Einträge bleiben erhalten. Neue Root-Meldungen erhalten folgende IDs:

| Neue ID | Ursprüngliche Root-ID | Meldung |
| --- | --- | --- |
| B23 | B21 | Torbild und Entscheidung Abstoß widersprechen sich |
| B24 | B22 | Dribbling wirkt zappelig |
| B25 | B23 | Torwart springt selten |
| B26 | B24 | Freier 2D-Ball springt auf die andere Feldseite |
| B27 | B25 | Nahe Spieler wechseln konfus Positionen |

Die zwei Originalscreenshots sind unter `docs/bugs/B21-2026-10-17-tor-als-abstoss*.png` erhalten. Sie belegen den visuellen Befund; der damalige Spielstand fehlt. Deshalb wird keine exakte Wiederholung der ursprünglichen Torszene behauptet.

## Reproduzierte Mechanismen und Korrekturen

### B26: Freier 2D-Ball

Der Halbzeit-Wrapper dreht Spieler und `match.ball` vorübergehend um 180 Grad. Der 2D-Zeichner liest einen freien Rollball dagegen aus `rebound`. Dessen unveränderte Koordinaten wurden nach der Halbzeit auf der falschen Seite gezeichnet. Alternative Ballansichten aus Rollball und Eckball erhalten jetzt dieselbe einmalige Projektion wie der Rest des Felds.

`test-client-ball-r133.cjs` verwendet den tatsächlichen Zeichner und Halbzeit-Wrapper mit einer aufzeichnenden Leinwand: vorher `(120, 222)` statt `(480, 518)`, danach acht Fälle für beide Halbzeiten grün. Der native Zustand bleibt nach dem Zeichnen identisch. Derselbe Fall wurde im echten Quellbrowser auf Port 4291 mit `(480, 518)` und unverändertem nativen Zustand bestätigt.

### B23: Fehlschuss erscheint unter der Latte

`v119VisibleShotBall` setzte die sichtbare Höhe jedes Fehlschusses auf höchstens 1,35 m. Ein tatsächlicher hoher Fehlschuss mit 4,2 m Höhe erschien deshalb unter der Latte. SI-Schüsse behalten jetzt ihre berechnete Höhe, sowohl über der Latte als auch seitlich. Das alte „over“ ist bei unmarkierten Schüssen lediglich eine Darstellungsvariante, keine gemessene Schusshöhe; dieser Pfad behält seine bisherige Korrektur. Der bisherige Schutz gegen übertriebene alte seitliche Lobdarstellungen bleibt im dafür vorgesehenen Altpfad erhalten.

`test-client-miss-r133.cjs` scheiterte vorher am hohen Fehlschuss und besteht danach in 16 Varianten: alt/SI, beide Tore, seitlich/hoch, Flug/Auslauf. Torentscheidung und Statistik werden nicht verändert. Die vorhandenen 272 Tornetz-Projektionsfälle bestehen ebenfalls. Ein zusätzlicher nativer Torwertungsfehler ist durch diesen Darstellungsnachweis weder bewiesen noch ausgeschlossen; Originalszene und Nutzerabnahme bleiben offen.

### B27: Enge 2D-Spielermarker

`v44VisualPositions` schob enge Marker mit bis zu 24 Wiederholungen auf 50 Pixel Abstand auseinander. Wechselte die relative Seite zweier sich kreuzender Spieler, wechselte damit die künstliche Ausweichrichtung. Physische Vereinsweltspieler werden jetzt auf ihren tatsächlichen Positionen gezeichnet und angewählt. Der bisherige Sechserliga-Pfad bleibt erhalten.

`test-client-markers-r133.cjs` scheiterte vorher bereits bei zwei nahen Spielern; danach bestehen zehn enge/kreuzende Gruppen sowie die alte Markertrennung. Der Nutzer hat am 18. Oktober bestätigt, dass die Meldung den 2D-Modus betrifft. Damit ist der korrigierte Markermechanismus der gemeldeten Ansicht zugeordnet; die konkrete visuelle Nutzerabnahme bleibt offen.

### B25: Seitliche Torwartparaden

Die Unity-Projektion drehte den Torwart direkt zum Kontaktpunkt. Die Unity-Auswahl berechnet die seitliche Reichweite relativ zu dieser Blickrichtung; dadurch wurde die seitliche Komponente mathematisch null. Selbst seitliche Kontakte wurden als aufrechte Parade klassifiziert. Während einer Parade bleibt die Blickrichtung jetzt zur Torachse ausgerichtet. Native Reichweite, Reaktion, Fang-/Abprallerentscheidung und Ergebnis bleiben unverändert.

`test-client-keeper-r133.cjs` scheiterte vorher an der verlorenen seitlichen Entfernung. Danach bestehen 16 Fälle beider Teams und Halbzeiten mit zentralen sowie links/rechts entfernten Kontakten. Der vorhandene Unity-Vertrag besteht ebenfalls. Die bestehende SI-Finish-Prüfung belegt bereits die native Folge Parade → freier Ball → Nachfassen → Abspiel; die sichtbare vollständige Unity-Folge und Nutzerabnahme sind davon getrennt.

### B24: Erfundenes Schussausholen beim Dribbling

Der generische Entscheidungszeitpunkt `match.next` wurde als Schussvorbereitung ausgegeben, obwohl die KI zu diesem Zeitpunkt auch dribbeln, passen oder weiter warten kann. Der Countdown sprang während des Laufens wiederholt zurück. In der festen nativen Standardpartie waren 228 von 276 Ballführerbildern solche erfundenen Schussansätze. Der physische Flow verwendet den Entscheidungstimer jetzt nicht mehr als Schussanimation. Wirkliche Pass-, Schuss- und Standardaktionen bleiben erhalten.

`test-client-dribble-r133.cjs` spielt die tatsächlichen nativen Controller: vorher rot, danach auf Standard- und Großfeld null erfundene Schussansätze; 257 beziehungsweise 142 Bilder tatsächlicher Release-Aktionen bleiben vorhanden. Die sichtbare Dribbelqualität wird zusätzlich im Browser abgenommen; B05 bleibt ein eigener Befund.

### B20: Pausenlayout und Quellenkennung

Der Flutlicht-Breakpoint bis 900 px stapelte die Pausenbedienung auch im Querformat. Schmales Querformat ab 600 px verwendet nun zwei Spalten mit passendem Mindestplatz für die Bedienung; schmales Hochformat bleibt gestapelt. Die Produktbeschreibung nennt die tatsächlich vorhandenen Rollen und Ausrichtung statt entfernter Anweisungsknöpfe.

Der vorhandene Browsercheck scheiterte vorher bei 844 px. Danach bestehen 1632/844/667/390 px in Deutsch und Englisch: kein Überlauf, Rollenwahl, Ausrichtung, Teamtaktik, Undo, unveränderte Spieluhr und erneutes Öffnen.

Bei der echten Quellenbesichtigung fiel außerdem auf, dass `v58Refresh` die vorbereitete Releasekennung 132 mit 130 überschrieb. Der Refresh liest jetzt die Kennung aus dem HTML-Dokument. `test-release-version.cjs` prüft zusätzlich diesen tatsächlichen Refresh; der Quellbrowser zeigt 132. Das ist keine neue Veröffentlichung.

## Prüfungen und verbleibende Abnahmen

### B05: zwei Änderungen gemessen und verworfen

Die vorhandene Unity-Fassung besteht vor der weiteren Arbeit die vollständige `D6Cli.Tests`-Suite: unter anderem 2.020 allgemeine Bewegungsgrenzen, 675 Stütz-, 285 Kontakt-, 20 Kontinuitäts- und 2.318 U-1-Grenzen. Der bereits dokumentierte r15-Fall bleibt innerhalb seiner R18-Sperre. Dies schließt die offenen absoluten B05-Werte nicht.

Zwei gezielte Versuche wurden auf den identischen gespeicherten R132-Aufnahmen verglichen:

| Variante | Verletzte R132-Regressionsgrenzen | Entscheidung |
| --- | ---: | --- |
| Unveränderte integrierte Fassung | 0 von 368 | Basis erhalten |
| Tackle-Körperclip weiter überblenden, Kontaktlösung unverändert | 1 von 368 | Verworfen: eine Tackle-Eintrittsspitze steigt von 2.241 auf 2.311 °/s und überschreitet die vorhandene Grenze |
| Kniepol bei stehendem Tackle zusätzlich an die bisherige Beugeebene binden | 2 von 368 | Verworfen: Tackle-Kontakte steigen von 7.970 auf 8.554 und von 9.180 auf 9.236 °/s |

Beide Änderungen sind vollständig aus dem Produktcode entfernt. Grenzwerte und Erwartungen wurden nicht gelockert. `outputs/client-r133/b05-experiments.json` enthält die Entscheidungen und betroffenen Messwerte; die vollständigen Vorher-/Versuchsaufnahmen bleiben in den zugehörigen Unterverzeichnissen. B05 ist weiterhin offen. Ein nächster Ansatz muss Clip-Eintritt, aktuelle Kontaktgeometrie und Knieebene gemeinsam messen; eine isolierte weichere Überblendung oder Polbindung genügt nach diesen Daten nicht. Auch die älteren Pass- und Aufstehspitzen werden hier nicht als behoben ausgegeben.

Die fünf neuen Regressionstests sind im Produktionsworkflow enthalten. Vollständiger Testblock, Unity-Messungen, WebGL-Paket und abschließende Browsernachweise werden im lokalen Abschlussprotokoll unter `outputs/client-r133/` zusammengeführt. Der erste Lauf mit seinen drei anschließend korrigierten Befunden bleibt unter `outputs/release-r132-ci/client-r133/` erhalten. Der abschließende Lauf verwendet `outputs/release-r132-ci/client-r133-final/`; seine versionierten Ergebnisse werden zusammen mit Quellenhashes in `outputs/client-r133/` festgehalten.

Konkrete Nutzerabnahme bleibt je Meldung erforderlich. B01 und physische Android-Abnahmen bleiben entsprechend der bisherigen Entscheidung zurückgestellt. Abgeschlossene Partien und Spielstände werden nicht rückwirkend umgerechnet; die Korrekturen betreffen Darstellung und Auswahl der sichtbaren Aktionen.

## Paket und lokale Wiederholung

Der neue WebGL-Build aus den integrierten U-1-Quellen trägt die Quellenkennung `7ce6f77fa77d4689e6f9befd4e27ae9bbdfab3ade2dc380d8f000abc9c72c3fe`. Unity 6000.6.4f1 erzeugte ihn in 315,2 Sekunden ohne Fehler; drei SDK-/Compilerwarnungen bleiben ausgewiesen. 58 Manifestprüfungen bestätigen Quelle und vier Payloaddateien. Beide Einzeldatei-HTMLs sind bytegleich. Der sichtbare Footer bleibt 132, weil keine Veröffentlichung erfolgt.

Die abschließende echte Unity-Browserprüfung umfasst 21 Checks ohne ungefangene Seitenfehler, einschließlich des gebauten HTMLs über HTTP und einer vollständigen Partie mit 2.969 Ticks, 1:1, Minute 100 und identischer nativer Referenz. 340 Altszenen bleiben unverändert; zehn zusätzliche Browserläufe prüfen Fortsetzung und vollständige native Zustände. [Prüfprotokoll](../outputs/client-r133/README.md).

Relevante Wiederholungen im gewählten Checkout mit Node 24 und Python 3:

```text
node work/serve-client.cjs
python work/run-release-ci-r132.py --phase client-r133-repeat
node work/platform/qa/verify-unity-manifest-114.cjs
```

Die Demo läuft unter http://127.0.0.1:4290/ (Weiterleitung auf `/source/index.html` mit zugehörigem Unity-Paket). Der Server verwendet den Fehlerworktree; nach identischer Übernahme kann er ebenso aus `work/si-integration` gestartet werden. Der Root-Checkout samt vorhandenen lokalen Dokumentänderungen bleibt erhalten. Es erfolgt kein Push und kein Deployment.

## Abschluss

Der abschließende vollständige Produktionslauf besteht mit **127 Befehlen und null Fehlern**. Alle 2.154 eingefrorenen Quellen-, HTML-, Workflow- und Paketdateien sind nach dem Lauf unverändert. Die Korrekturen werden als identischer Stand auf `integration/si-r133` in `work/si-integration` übernommen; die lokale Demo bleibt auf Port 4290. B05 und die genannten konkreten Nutzerabnahmen bleiben offen.
