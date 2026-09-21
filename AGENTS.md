# Doppel 6: Projektkontext für neue Instanzen

Lies dieses Dokument und danach nur die für die Aufgabe relevanten Dateien. Der Code ist die Quelle für den aktuellen Implementierungsstand; neue Nutzerentscheidungen haben Vorrang vor diesem Dokument. Halte diese Datei kurz und aktualisiere sie, wenn sich eine feste Produktentscheidung ändert.

## Produkt und feste Regeln

- Doppel 6 ist ein mobil spielbarer Fußballmanager im Browser: fünf Feldspieler und ein Torwart pro Team, sechs Ligateams, zehn Spieltage je Saison. Ein Match dauert ungefähr 100 reale Sekunden und zeigt zwei Mal 45 Ingame-Minuten.
- Aufstellung, Rasterpositionen, offensive/defensive Spielerrolle und Teamtaktik werden **vor** dem Spiel gewählt. Nach Anpfiff gibt es keine Änderungen oder Auswechslungen.
- Keine Verletzungen und vorerst kein Training. Spieler altern; Form, Tempo und Kondition beeinflussen Leistung und Rotation. Die internen Grundwerte sind Technik, Passspiel, Abschluss, Zweikampf, Stellungsspiel, Geschwindigkeit und Kondition. Scouting beschreibt Fähigkeiten nur ungefähr; exakte Werte gehören nicht in die normale Spieleransicht.
- Spielerleistung wird anhand von Pässen, Schüssen, Toren, Zweikämpfen und Torwartaktionen erfasst. Statistiken sollen für aktuelle Saison, Vorsaison und Karriere nachvollziehbar bleiben.
- Der Spielablauf soll Fußballregeln erkennbar beachten: Anstoß an der Mittellinie mit Spielern in ihren Hälften und Countdown, klarer Halbzeitpfiff mit neuem Anstoß, Ballbesitz kann verloren gehen und der Ball frei liegen. Torhüter spielen Abstoß kurz; Passabfänge erfordern einen erreichbaren Spieler im tatsächlichen Passweg. Bewahre die bewusst ruhige Spielgeschwindigkeit.
- Vereinsfarben bestimmen Heim- und Auswärtstrikots. Spieler haben Identität und Nationalitätsflagge. Die Oberfläche muss auf Mobiltelefonen bedienbar bleiben.
- Bei der Vereinsgründung sind Logoform und Verzierung direkt in einer Vorschau sichtbar. Ein Torwarttrikot wird aus sechs Varianten gewählt und gespeichert; im Match wird bei ähnlichen Farben eine kontrastierende Variante angezeigt.
- Die Karrierezentrale hat fünf Bereiche: Übersicht, Kader, Transfers, Wettbewerbe und Verein. Auf Mobiltelefonen liegt die Bereichsnavigation unten. Aktives Match und Saisonabschluss bleiben eigene Ansichten.

## Karriere und Wirtschaft

- Spielstände liegen lokal im Browser. Bestehende Spielstände und Karrierestatistiken bei Schemaänderungen erhalten. Die bisherigen `sechser.*`-Speicherschlüssel bleiben für bestehende Spielstände erhalten. Freiwillige Spielzusammenfassungen dürfen nur nach ausdrücklichem Opt-in übertragen werden.
- Impressum, Datenschutz- und Speicherhinweise sind von jedem Spielbildschirm aus erreichbar. Doppel 6 setzt im Spielcode keine Cookies und lädt keine Schriften von Drittanbietern. Die freiwillige Übertragung von Spielstatistiken bleibt standardmäßig aus und ist jederzeit umstellbar.
- Nach dem letzten Spieltag folgt ein gespeicherter Ablauf: Saisonbilanz, Karriereenden, Finanzabschluss, nächste Saison. Der aktuelle Kader ist während der Transfertage als einklappbarer Bereich sichtbar. Wiederholtes Öffnen oder Neuladen darf Zufallsentscheidungen und Buchungen nicht duplizieren.
- Ab 34 Jahren liegt die Chance auf Karriereende bei 50 %, danach steigt sie jährlich um zehn Prozentpunkte bis höchstens 100 %.
- Zu Saisonbeginn wird einer von drei Hauptsponsoren gewählt. Das Fixum kommt sofort, mögliche Boni zum Saisonende. Sieg und Remis bringen feste Credits. Platzierungsprämien für Rang 1 bis 6: 900, 750, 600, 450, 325, 250 Credits. Sie werden vor den einmal jährlich fälligen Gehältern gebucht. Negativer Schlusskontostand bedeutet Game Over. Die Wirtschaft soll knapp bleiben, damit Transfers echte Entscheidungen sind.
- Reguläre Transfers haben fünf Transfertage; Gebote werden am folgenden Tag entschieden und Angebote laufen ab. Spieler mit Ablöse und Angebote für eigene Spieler stehen in einklappbaren Bereichen; die Angebote für eigene Spieler stehen unter den ablösefreien Spielern und sind scrollbar. Für eigene Spieler entstehen höchstens zwei Kaufangebote pro Saison, nie mehr als eines gleichzeitig. Nach Transferschluss bleiben ablösefreie Spieler verfügbar, auch zwischen den Spieltagen der ersten Saison.
- Ab Saison 2 erscheinen zwölf junge Feldspieler pro Saison in der Transferphase. Ihre Fähigkeiten bleiben bis zum bezahlten Scouting unbekannt; danach werden aktuelle Fähigkeiten und Potenzial nur ungefähr beschrieben. Scouting ist für 40 Credits optional; eine sofortige Verpflichtung ohne Scouting kostet 100 Credits. Es gibt keine eigene Jugendquote, aber Budget und Kaderlimit gelten.
- Das Zielprofil eines Jugendspielers steht von Beginn an fest. Einsätze entwickeln seine aktuellen Fähigkeiten bis zu diesen Zielwerten: mit 17–19 nach jedem zweiten, mit 20–21 nach jedem dritten und mit 22–23 nach jedem fünften Einsatz jeweils bis zu zwei Fähigkeitspunkte. Ab 24 endet die Jugendentwicklung. Form aus den letzten fünf Spielen und Frische beeinflussen die Matchleistung zusätzlich; junge Spieler erhalten keinen doppelten Altersabzug.

## Pokal und Auszeichnungen

- Neue Karrieren spielen neben der Liga einen KO-Pokal mit allen sechs Vereinen. Zwei Vereine erhalten ein Freilos; Auftaktrunde, Halbfinale und Finale folgen nach den Ligaspieltagen 2, 5 und 8. Pokalspiele ändern weder Ligatabelle noch Ligaspieltag oder Ligastatistik. Ältere Spielstände erhalten den neuen Pokal nicht nachträglich.
- Bei Remis gibt es Elfmeterschießen: drei Schützen je Team, danach abwechselnd bis zur Entscheidung. Alle sechs Spieler einschließlich Torwart müssen antreten, bevor jemand ein zweites Mal schießt. Die Reihenfolge des eigenen Teams wird nach den 90 Minuten in einem Popup gewählt; Abschluss, Ruhe und Frische werden ungefähr beschrieben. Jeder Schuss und der offene Ablauf bleiben gespeichert.
- Im Pokalfinale laufen beide Mannschaften ein und stehen an der Mittellinie bis zum Start. Nach dem Finale erhält der Sieger eine Feier mit Konfetti in seinen Vereinsfarben. Pokalsieger und Saison-Awards erscheinen im Saisonabschluss und in der Awardhistorie.
- Auf der Startseite gibt es eine isolierte Elfmeterschießen-Demo mit zwei starken und zwei schwächeren Mannschaften. Sie bucht keine Karriereergebnisse, Awards oder Credits.
- Die Liga vergibt Torschützenkönig und besten Spieler nach Saisonleistung, Formbewertungen über die Ligaspiele und Assists. Jede gewonnene Spielerauszeichnung erscheint als eigene Medaille in der Spielerstatistik. Der Meister trägt einen Pokal in der Abschlusstabelle; der Pokalsieger trägt ein anderes Pokalicon in der folgenden Ligasaison.
- „Awards & Vereinsrekorde“ ist von der Vereinszentrale erreichbar. Tor- und Einsatzrekorde zählen Liga und Pokal für aktuelle sowie ehemalige Vereinsspieler.
- Bei der Vereinsgründung werden Heim- und Auswärtstrikot aus sechs Mustern sowie Logoform und Verzierung gewählt. Die Auswahl gehört zum Spielstand. Dunkle Vereinsfarben brauchen lesbare UI-Akzente; Torhüter tragen im Elfmeterschießen eigene Trikots.

## Code, Prüfung und Veröffentlichung

- Quellstand: `dist/`. Die versionierten Skripte werden in der Reihenfolge von `dist/index.html` geladen; neuere Dateien überschreiben teils ältere Funktionen. Vor Änderungen die ganze relevante Aufrufkette prüfen.
- `node work/server.cjs` startet lokal auf Port 4173. `node work/build.cjs` erzeugt die Einzeldatei `outputs/index.html`. `outputs/` und temporäre Dateien bleiben außerhalb von Git.
- Passende Tests aus `work/test-*.cjs` ausführen. `node work/test-v31.cjs` simuliert zwölf Saisonen; `node work/test-v35.cjs` prüft die Transferansicht und den übernommenen Saisonablauf; `node work/test-v36.cjs` prüft die Jugendverpflichtung mit und ohne Scouting. Bei Änderungen an Finanzen, Transfers oder Saisonwechsel mindestens den Dauertest erneut ausführen.
- `node work/test-v41.cjs` prüft Pokalspielplan, getrennte Statistiken, Sieger-Award, einmalige Prämie und Elfmeterschützen.
- `node work/test-v42.cjs` prüft das gespeicherte Elfmeterschießen nach einem Remis und die isolierte Demo.
- `node work/test-v43.cjs` prüft Vereinsrekorde und Awardhistorie.
- `node work/test-v44.cjs` prüft Trikot- und Logowahl, Kontrast und Torwarttrikot.
- GitHub-Repository: `thealextd1337-spec/FM` (öffentlich). Ein GitHub-Commit veröffentlicht **nicht** automatisch auf `https://fussball.cakamper.at/`; die Live-Seite liegt auf World4You. Vor einer Veröffentlichung Build und Live-Version gesondert prüfen. Bestehende Branch-Historie vor Push oder Merge prüfen und nicht mit Force Push überschreiben.
