# SECHSER: Projektkontext für neue Instanzen

Lies dieses Dokument und danach nur die für die Aufgabe relevanten Dateien. Der Code ist die Quelle für den aktuellen Implementierungsstand; neue Nutzerentscheidungen haben Vorrang vor diesem Dokument. Halte diese Datei kurz und aktualisiere sie, wenn sich eine feste Produktentscheidung ändert.

## Produkt und feste Regeln

- SECHSER ist ein mobil spielbarer Fußballmanager im Browser: fünf Feldspieler und ein Torwart pro Team, sechs Ligateams, zehn Spieltage je Saison. Ein Match dauert ungefähr 100 reale Sekunden und zeigt zwei Mal 45 Ingame-Minuten.
- Aufstellung, Rasterpositionen, offensive/defensive Spielerrolle und Teamtaktik werden **vor** dem Spiel gewählt. Nach Anpfiff gibt es keine Änderungen oder Auswechslungen.
- Keine Verletzungen und vorerst kein Training. Spieler altern; Form, Tempo und Kondition beeinflussen Leistung und Rotation. Die internen Grundwerte sind Technik, Passspiel, Abschluss, Zweikampf, Stellungsspiel, Geschwindigkeit und Kondition. Scouting beschreibt Fähigkeiten nur ungefähr; exakte Werte gehören nicht in die normale Spieleransicht.
- Spielerleistung wird anhand von Pässen, Schüssen, Toren, Zweikämpfen und Torwartaktionen erfasst. Statistiken sollen für aktuelle Saison, Vorsaison und Karriere nachvollziehbar bleiben.
- Der Spielablauf soll Fußballregeln erkennbar beachten: Anstoß an der Mittellinie mit Spielern in ihren Hälften und Countdown, klarer Halbzeitpfiff mit neuem Anstoß, Ballbesitz kann verloren gehen und der Ball frei liegen. Torhüter spielen Abstoß kurz; Passabfänge erfordern einen erreichbaren Spieler im tatsächlichen Passweg. Bewahre die bewusst ruhige Spielgeschwindigkeit.
- Vereinsfarben bestimmen Heim- und Auswärtstrikots. Spieler haben Identität und Nationalitätsflagge. Die Oberfläche muss auf Mobiltelefonen bedienbar bleiben.

## Karriere und Wirtschaft

- Spielstände liegen lokal im Browser. Bestehende Spielstände und Karrierestatistiken bei Schemaänderungen erhalten. Freiwillige Spielzusammenfassungen dürfen nur nach ausdrücklichem Opt-in übertragen werden.
- Nach dem letzten Spieltag folgt ein gespeicherter Ablauf: Saisonbilanz, Karriereenden, Finanzabschluss, nächste Saison. Wiederholtes Öffnen oder Neuladen darf Zufallsentscheidungen und Buchungen nicht duplizieren.
- Ab 34 Jahren liegt die Chance auf Karriereende bei 50 %, danach steigt sie jährlich um zehn Prozentpunkte bis höchstens 100 %.
- Zu Saisonbeginn wird einer von drei Hauptsponsoren gewählt. Das Fixum kommt sofort, mögliche Boni zum Saisonende. Sieg und Remis bringen feste Credits. Platzierungsprämien für Rang 1 bis 6: 900, 750, 600, 450, 325, 250 Credits. Sie werden vor den einmal jährlich fälligen Gehältern gebucht. Negativer Schlusskontostand bedeutet Game Over. Die Wirtschaft soll knapp bleiben, damit Transfers echte Entscheidungen sind.
- Reguläre Transfers haben fünf Transfertage; Gebote werden am folgenden Tag entschieden und Angebote laufen ab. Nach Transferschluss bleiben ablösefreie Spieler verfügbar, auch zwischen den Spieltagen der ersten Saison.
- Jugendarbeit ist **noch nicht implementiert**. Vorgeschlagener nächster Spielblock: wenige gescoutete Nachwuchsspieler pro Saison, begrenzte Übernahme und Entwicklung durch Einsätze statt Training. Werte und Kosten müssen erst festgelegt und über mehrere Saisonen getestet werden.

## Code, Prüfung und Veröffentlichung

- Quellstand: `dist/`. Die versionierten Skripte werden in der Reihenfolge von `dist/index.html` geladen; neuere Dateien überschreiben teils ältere Funktionen. Vor Änderungen die ganze relevante Aufrufkette prüfen.
- `node work/server.cjs` startet lokal auf Port 4173. `node work/build.cjs` erzeugt die Einzeldatei `outputs/index.html`. `outputs/` und temporäre Dateien bleiben außerhalb von Git.
- Passende Tests aus `work/test-*.cjs` ausführen. `node work/test-v31.cjs` simuliert zwölf Saisonen; `node work/test-v32.cjs` prüft die aktuelle Vereinszentrale. Bei Änderungen an Finanzen, Transfers oder Saisonwechsel mindestens den Dauertest erneut ausführen.
- GitHub-Repository: `thealextd1337-spec/FM` (öffentlich). Ein GitHub-Commit veröffentlicht **nicht** automatisch auf `https://fussball.cakamper.at/`; die Live-Seite liegt auf World4You. Vor einer Veröffentlichung Build und Live-Version gesondert prüfen. Bestehende Branch-Historie vor Push oder Merge prüfen und nicht mit Force Push überschreiben.
