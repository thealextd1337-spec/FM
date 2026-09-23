# Änderungen

## Noch nicht veröffentlicht

## 2026-09-23 (Spielerprofile im Startkader)

- Bei der Startkaderwahl lässt sich jetzt für jeden Kandidaten ein Spielerprofil öffnen. Es zeigt persönliche Angaben, Gehalt und alle acht beziehungsweise neun Fähigkeitswerte, bevor der Verein gegründet wird. Das Öffnen ändert die Auswahl nicht. Geprüft mit dem Startkader- und Fähigkeitentest sowie der mobilen Browseransicht.

## 2026-09-23 (Vollständige Spielerwerte)

- Im Kader und Spielerprofil stehen jetzt alle Fähigkeiten mit den exakten Werten von 1 bis 20; die kurzen Transfer- und Aufstellungskarten bleiben übersichtlich. Neue Torhüter erhalten auch Technik, Abschluss, Zweikampf und Luftspiel. Bei bestehenden Torhütern werden nur diese fehlenden Felder mit den bisherigen Match-Ersatzwerten ergänzt, damit alte Spielstände ihre bisherigen Fähigkeiten und Statistiken behalten. Geprüft mit Spieler-, Kader- und Altstandtests sowie dem Build.

## 2026-09-23 (Spielerfähigkeiten)

- Kader-, Aufstellungs- und Transferkarten zeigen die drei besten bekannten Fähigkeiten jetzt zeilenweise als farbige Namen ohne zusätzliche Wertungswörter. Spielerprofile ordnen alle vorhandenen Fähigkeiten in Bereiche ein und erklären die Farben mit einer Legende; der doppelte Scoutingtext entfällt. Torhüter erhalten eine passende Aufteilung, ungescoutete Jugendspieler bleiben verborgen. Spielwerte und Spielstände ändern sich nicht. Geprüft mit Kader-, Transfer-, Jugend- und Live-Spielertests sowie dem Build.

## 2026-09-23 (Spielerfarben)

- Stärke, Form, Frische und Spielnoten verwenden jetzt einheitlich fünf Stufen: Violettgrau, Blaugrau, Gelb, Orange und Pink. Die Farben erscheinen auch beim Scouting, bei ablösefreien Spielern und am Transfermarkt, in Spielerprofilen, im Live-Spiel und im Spielbericht. Formgesichter und Müdigkeitsbalken wurden passend neu erzeugt. Bestehende Spielwerte und Spielstände bleiben unverändert. Geprüft mit Farb- und Matchtests sowie dem Einzeldatei-Build.

## 2026-09-23 (Spielregeln und Saisonstatistik)

- Für künftige Änderungen ist festgelegt: Gespeicherte Partien und Saisons werden nicht allein für neue Regeln oder Statistiken nachträglich berechnet oder umgerechnet. Altstände bleiben ohne zusätzliche Migrationslogik nutzbar, soweit möglich; Ausnahmen brauchen eine ausdrückliche Entscheidung.
- Parallel simulierte Ligaspiele der Computervereine erfassen jetzt neben Einsätzen, Toren und Schüssen auch Vorlagen, Torwart-Gegentore und Zu-null-Spiele, Fouls sowie verwandelte und verschossene Elfmeter. Das gilt auch für Karrieren mit Pokal; eine Partie wird nur einmal verbucht. Beim Laden älterer Spielstände werden die aus Ergebnissen sicher rekonstruierbaren Torwartwerte einmalig ergänzt. Frühere Vorlagen, Fouls und Elfmeter können nicht exakt nachgetragen werden. Geprüft mit einem deterministischen Liga-Statistiktest.
- Nach einem Abseitspfiff friert die Szene mit Linie und markiertem Spieler 1,5 reale Sekunden ein, während die Spieluhr pausiert. Erst anschließend verschwindet die Markierung und die Mannschaften stellen sich zum Freistoß auf. Geprüft mit dem Abseits- und Freistoßtest.
- Grätschen von hinten sind wieder möglich, werden aber mit geringerer Wahrscheinlichkeit angesetzt. Körperkontakt von hinten ist stets ein Foul mit Freistoß oder Elfmeter; ein schräger, sauberer Ballgewinn bleibt möglich. Fouls werden beim Spieler nur einmal verbucht; Karten und Platzverweise gibt es weiterhin nicht. In 48 deterministischen Matches entstanden 10 reguläre Elfmeter statt zuvor 2 bei vollständigem Ausschluss von Grätschen von hinten. Geprüft mit gezielten Kontakt- und Strafraumszenen, vollständigen Matches und dem Häufigkeitstest.
- Beim regulären Elfmeter steht nur die Elfmeterszene im Vordergrund; der allgemeine Matchbanner bleibt ausgeblendet. Nach einem Treffer wird erst die Szene geschlossen und dann der Torbanner gezeigt. Geprüft mit einem Regressionstest für alle drei Anzeigephasen.
- Die Mittelfeldzone im Aufstellungsraster umfasst jetzt die Reihen 3–5. Spieler in Reihe 5 erhalten automatisch die Einsatzposition Mittelfeld; die sichtbare Trennlinie zur Abwehr liegt darunter. Geprüft mit dem Taktiktausch-Test und dem Build.

## 2026-09-23 (Aufstellung und Statistiken)

- Die Einsatzposition folgt jetzt automatisch der Spielfeldzone. Querlinien trennen Angriff, Mittelfeld und Abwehr; das Positionskürzel am Spielericon aktualisiert sich beim Verschieben. Positionsfremde Spieler sind auf Feld und Startelfliste markiert und erhalten eine Erklärung in der Spielerauswahl. Die manuelle Positionswahl entfällt. Auch Anstoß und Spielnote beachten die Einsatzposition. Bestehende Schema-5-Spielstände übernehmen beim Öffnen die Position ihrer Rasterfelder. Geprüft mit Aufstellungs- und Matchtests, Build und Browseransicht.
- Im Statistik-Reiter sind nun alle sechs Liga- und sechs Pokal-Bestenlisten direkt geöffnet. So lassen sich sämtliche Kategorien ohne Aufklappen durchscrollen. Geprüft mit dem Statistiktest, Build und mobiler Browseransicht.
- Der redundante Statistikabschnitt unter dem Kader entfällt. Spielerprofile zeigen eine Saison auf einmal; ältere Saisons und die Karriereübersicht lassen sich seitlich wischen oder mit Zurück/Weiter öffnen. Geprüft mit dem Saisonstatistiktest, Browseransichten für Mobilgerät und Desktop sowie Build.
- In der mobilen Startkaderwahl stehen farbige Fähigkeiten wieder im Fließtext. Die Trennpunkte erscheinen dadurch nicht mehr allein in eigenen Zeilen. Geprüft in der Browseransicht bei 390 und 320 Pixeln sowie mit dem Aufstellungstest und Build.

## 2026-09-23 (Spielintelligenz, Spielerinfo und Statistik)

### Spielintelligenz und Pokalergebnisse

- Spieler mit freiem Weg zum Tor behalten den Ball für den Lauf und schießen aus geeigneter Nähe, statt unnötig zurückzupassen. Ein Querpass geht nur an einen freien, nicht im Abseits stehenden Mitläufer in besserer Position. Gegner jagen einem Torwart mit sicherem Ballbesitz nicht mehr nach. Geprüft für beide Spielrichtungen und mit gezielten Szenentests sowie vollständigen Matches.
- Die Ergebnisübersicht einer abgeschlossenen Pokalrunde zeigt nun alle Partien einschließlich des eigenen Spiels. Der Turnierbaum bleibt erhalten; geprüft mit dem Pokal-Berichtstest.
- Im Wettbewerb-Reiter entfällt der doppelte, einklappbare Pokalbaum. Liga und „Nationaler Pokal“ sind eigene Abschnitte. Der neue Statistik-Reiter zeigt für Liga und Pokal nur erfasste Spieler pro Kennzahl, maximal die Top 10: Tore, Assists, Zu-null-Spiele der Torhüter, Fouls sowie verwandelte und verschossene Elfmeter. Fouls und reguläre Elfmeter werden während des Matches gespeichert; das Pokal-Elfmeterschießen schreibt Treffer und Fehlschüsse den Schützen zu. Geprüft mit Statistik- und Standardsituationstests.
- Ein Spiel mit noch offener Abpfiff-Markierung endet jetzt auch dann zuverlässig, wenn unmittelbar davor ein Tor oder eine Standardsituation liegt. Der 108-Match-Balancetest hat den zuvor reproduzierbaren Stillstand bei 74,999 Simulationsminuten abgesichert.

### Live-Spielerinfo und Abschlussdialoge

- Während eines Matches öffnen die Spieler-Icons beider Teams und die eigenen Spielerkarten unter dem Feld eine Live-Info mit Form, Müdigkeit und bisherigen Spielwerten. Für eigene Spieler erscheinen auch die bereits bekannten Scouting-Einschätzungen kompakt; unbekannte gegnerische Fähigkeiten bleiben verborgen. Das Spiel steht samt Uhr und Szenen still, bis die Info geschlossen wird, und läuft dann ohne Zeitsprung weiter. Für Liga und Pokal mit dem neuen Live-Spieler-Test geprüft.
- Spielbericht und folgende Ergebnisübersicht haben nun dieselbe Größe; der zentrale Weiter-Button steht in beiden an derselben Stelle. Geprüft im Live-Spieler-Test und im lokalen Browser.

### Spielszenen und Torwarttrikots

- Zweikämpfe wechseln nicht mehr minutenlang zwischen denselben beiden Spielern hin und her: Nach einem verlorenen Ball brauchen Spieler kurz zur Erholung, und ein gescheiterter Angriff auf den Ball lässt den Ballführer weiterspielen. Geprüft mit gezielten Zweikampftests und 24 vollständigen Matchsimulationen.
- Bei Freistößen vom Flügel orientieren sich die Teams zum Tor. Ihre Aufstellung folgt nun den Einsatzpositionen: Angreifer, Mittelfeld und Verteidiger behalten ihre Reihenfolge statt zufällig vor oder hinter dem Ball zu stehen. Geprüft für beide Spielrichtungen und einen tiefen Freistoß.
- Jeder Computerverein erhält ein eigenes festes Torwarttrikot und ein zweites festes Ausweichtrikot. Das eigene gewählte Trikot bleibt erhalten und erhält ebenfalls eine feste Alternative. Im Match wird nur zwischen den beiden Vereinsvarianten gewechselt, wenn es der Kontrast zu Feldspielern und anderem Torwart verlangt; bestehende Karrieren bekommen die neuen Paare beim Laden. Geprüft mit den Torwarttrikot- und Bestandsspielstandtests.
- Eine Neuverpflichtung außerhalb der Transferphase trägt im Bestätigungsdialog „Zwischen den Spieltagen“ statt eines falschen Transfertags. Geprüft mit dem Dialogtest.
- Ein Tor aus einem regulären Elfmeter erscheint im Spielverlauf und im Torbanner ausdrücklich als „ELFMETERTOR!“; normale Tore behalten ihre bisherige Beschriftung. Der Tordatensatz merkt sich die Entstehung. Geprüft mit dem Standardsituationstest; ein direkter Freistoß wurde zusätzlich als mögliches Tor nachgewiesen.

### Karrieremenü und Aufstellung

- Die überflüssige Beschriftung „Dein Team“ neben dem Vereinsnamen über dem Aufstellungsfeld wurde entfernt.
- Das Drei-Striche-Menü bleibt nun direkt neben dem oberen Fortschrittsbutton sichtbar, auch beim Scrollen. Sein Dropdown liegt über der Navigation und behält die bisherigen Aktionen.
- In der Startaufstellung steht „TOR“ statt „Torwart“. Das Alter erscheint bei den Spielerkarten direkt neben dem Positionskürzel; die Ersatzbank nutzt dieselbe Altersanzeige.
- Geprüft mit den Fortschritts- und Aufstellungstests, Build sowie Sichtprüfung im lokalen Browser.

## 2026-09-22 (Karriereführung und Transfers)

### Karriereführung

- Eine feste Leitaktion am oberen Rand zeigt je nach Phase den nächsten Schritt: Sponsorwahl, Transfertag, Transferschluss, Aufstellung, Spielstart, Ergebnisse und Saisonabschluss. Während des laufenden Matches zeigt sie nur den Spielstatus. In Spielbericht und Ergebnisübersicht erscheint dieselbe Aktion innerhalb des Dialogs.
- Doppelte Weiter- und Startbuttons in Karrierezentrale, Match und Saisonabschluss wurden aus der Ansicht entfernt. Die vorzeitige Beendigung der Transferphase bleibt als Nebenaktion im Transferbereich; Entscheidungen und Bestätigungen bleiben eigenständig.
- Geprüft mit `node work/test-progress-v58.cjs`, den Transfer- und Saisonprüfungen, dem Einzeldatei-Build sowie einem vollständigen Browser-Match von Sponsorwahl über Spielbericht und Ergebnisse bis zum nächsten Spieltag.

### Transfers und Aufstellung

- Transferentscheidungen und direkte Neuverpflichtungen erscheinen in einem reparierten Spieldialog, der ausdrücklich bestätigt werden muss. Offene Ergebnisse erscheinen nach Neuladen erneut. Der Transferschluss verwendet nun einen Dialog im Spieldesign und erklärt, dass die Jahresgehälter erst beim Saisonabschluss nach der Platzierungsprämie bezahlt werden.
- Beim Ersetzen auf dem Taktikboard behält der eingewechselte Spieler seine eigene Position. Schnellaufstellungen vergeben jedem Startspieler ein eigenes Rasterfeld, damit sich Spieler nicht überlagern.
- Geprüft mit den neuen Dialog- und Aufstellungstests, den Versionsprüfungen v17, v24, v28, v29, v31, v35, v36 und v55 sowie dem Einzeldatei-Build.

### Stärkenfarben

- Die fünf Stärkestufen von 1–20 verwenden jetzt an allen sichtbaren Fähigkeitseinschätzungen die Farben der Müdigkeitsanzeige und Smilies: Violett, Blau, Grün, Orange und Rot. Das umfasst Startkader, Spielerprofil, Kader, Aufstellung, Transfers und Vergleich, Jugend samt Potenzial sowie Elfmeterschützen. Auch die Stärkehinweise zum Gegner sind farbig. Die bisherigen Wörter und die verborgenen Zahlen bleiben erhalten.
- Geprüft mit den Versionsprüfungen bis v55, Build und Sichtprüfung in Kader und Transfermarkt.

## 2026-09-22 (Freistöße und Abseits)

### Freistöße und Abseits

- Beide Teams laufen bei Freistößen und nach Abseits während des Banners in erkennbare Wiederanstoßpositionen. Die Abseitsentscheidung bleibt zunächst eingefroren; nach dem Ausblenden des Banners folgt eine zusätzliche halbe Sekunde Pause. So lassen sich Ort und Fortsetzung leichter verfolgen. Geprüft mit `node work/test-v50.cjs`, `node work/test-v57.cjs` und Build.

## 2026-09-22 (Zweikämpfe und Spielfeld)

### Zweikämpfe

- Stehende Zweikämpfe brauchen nun tatsächliche Nähe zum Ball und eine erreichbare Position zum Ballführer. Grätschen sind auf dem Feld sichtbar und können den Ball gewinnen, ihn frei spielen, verfehlen oder ein Foul mit Freistoß beziehungsweise Elfmeter auslösen. Spieler weichen sich bei engem Kontakt sanfter aus; bei hohen Bällen verteilen sich die nächsten Akteure um den Landepunkt. Es gibt weiterhin keine Karten, Platzverweise oder Unterzahl. Geprüft mit `node work/test-v56.cjs`, 20 vollständigen simulierten Matches und Build.

### Spielfeld

- Hohe Pässe, Flanken und Ecken fliegen mit sichtbarer Bogenbahn zu einem berechneten Landepunkt. Flanken können zu kurz, zu weit oder ins Aus geraten. Mitspieler nehmen hohe Bälle an, spielen sie per Kopf weiter oder schließen mit Kopfball beziehungsweise Volley ab; Gegner können Luftduelle gewinnen und klären. Spielbericht und Live-Statistik zählen diese Aktionen.
- Abseits wird beim Abspiel erfasst und bei aktiver Beteiligung gepfiffen. Abseitslinie, Spieler und Banner bleiben kurz sichtbar; der anschließende Freistoß wird kurz gespielt. Direkte Einwürfe, Ecken und Abstöße sind ausgenommen.
- Beim Einwurf bleibt der Ball sichtbar hinter der Seitenlinie liegen. Einwerfer und übrige Spieler laufen in Position; die Uhr geht bis zum Wurf langsamer, ohne Banner oder harten Szenenstopp.
- Bodenpässe und Einwürfe geben Ballbesitz erst, wenn der Empfänger den Ball tatsächlich erreicht; verfehlte Zuspiele bleiben frei.
- Die neue Abwehrlinie Tief/Neutral/Hoch bestimmt die Grundhöhe eingesetzter Verteidiger. Stammposition und Einsatzposition sind getrennt; Fremdeinsätze erhalten einen kleinen situationsbezogenen Malus. Die Wahl bleibt im Spielstand erhalten.

### Werte und Spielstände

- Neue Spieler einschließlich aller Computerkader entstehen direkt mit Fähigkeiten von 1 bis 20 und dem Wert Luftspiel. Match, Scouting, Transfers, Gehälter, Saisonereignisse und Elfmeterschießen verwenden diese Skala ohne 100er-Rückrechnung. Alte Speicherstände und Exporte werden auf Nutzerwunsch nicht übernommen; neue Karrieren verwenden Schema 5 und `sechser.saves.v5`.
- Produkt- und Entwicklungsdokumentation beschreiben die neuen Regeln. Geprüft mit `node work/test-v55.cjs`, `node work/build.cjs` und einem vollständigen Browser-Match.

## 2026-09-22 (Update)

### Gespeicherte Spiele

- „Löschen“ zeigt die Bestätigung jetzt direkt im Spiel. Erst „Endgültig löschen“ entfernt den Spielstand; „Abbrechen“ lässt ihn bestehen. Damit hängt das Löschen nicht mehr vom Browser-Bestätigungsdialog ab. Geprüft mit `node work/test-v53-save-menu.cjs` und Build.

### Spielansicht

- Vereinsnamen stehen weiter vom Ergebnis entfernt und bleiben auf gleicher Höhe, auch wenn Torschützen hinzukommen. Die Torschützen stehen in Dreiergruppen untereinander; weitere Namen folgen in der nächsten Spalte.
- Spielermarker werden bei engen Zweikämpfen nur in der Anzeige auseinandergerückt. Die Matchberechnung verwendet weiter ihre tatsächlichen Positionen. Geprüft mit `node work/test-v44.cjs`.
- Nach Anpfiff-, Tor-, Freistoß- und Eckball-Bannern bleibt das Spiel jeweils eine weitere Sekunde stehen. Geprüft mit `node work/test-v50.cjs`.

### Vereinszentrale

- „Menü“ steht nun rechts in der Kopfzeile mit „Sechserliga“. Header und Karriere-Navigation bleiben beim Scrollen gemeinsam oben sichtbar, auch auf Mobilgeräten. Die fünf Bereiche haben einheitliche gezeichnete Symbole statt gemischter Unicode-Zeichen.

### Transfers

- Ungefähre Fähigkeitsbeschreibungen in regulären und ablösefreien Angeboten zeigen jetzt die Farben der fünf Stärkebereiche. Geprüft mit `node work/test-v53.cjs`.

### Spielbericht

- Spieler beider Mannschaften öffnen per Klick ein Popup mit ihren Statistiken aus diesem Spiel. Geprüft mit `node work/test-v47.cjs`.
- „Weiter“ öffnet nach dem Spielbericht eine Übersicht: Liga mit weiteren Ergebnissen, hervorgehobenen Siegern und Tabelle; Pokal mit weiteren Ergebnissen und Turnierbaum. Darunter stehen die Torschützen und Vorlagengeber der jeweiligen Wettbewerbssaison nebeneinander. Geprüft mit `node work/test-v47.cjs`.

### Elfmeterschießen

- Der Sieg erscheint nach dem letzten Schuss als großes Banner mit Sieger und Ergebnis. Die Einblendung berücksichtigt reduzierte Bewegung. Geprüft mit `node work/test-v42.cjs`.

## 2026-09-22

### Gespeicherte Spiele

- Die Startseite zeigt nach dem Laden nur noch Spielstände der aktuellen Stärkeskala. Zuvor blieben ältere, nicht mehr ladbare Einträge mit wirkungslosen Knöpfen sichtbar. „Fortsetzen“ und „Exportieren“ arbeiten wieder mit den angezeigten Spielständen; ein bestätigtes „Löschen“ entfernt den Spielstand aus dem Browserspeicher und sofort aus der Liste. Ältere Spielstände werden nicht automatisch gelöscht. Geprüft mit `node work/test-v53-save-menu.cjs` und lokal im Browser.

### Vereinsgründung

- Zwischen der Logo-Auswahl und „Weiter zur Kaderwahl“ liegt nun etwas mehr Abstand.
- Die drei Vereinsfarben stehen auf Mobilgeräten nebeneinander, und die Vereinsvorschau zeigt Wappen sowie Heim- und Auswärtstrikot kompakter. Die neue Drittfarbe setzt Akzente am Heimtrikot; beim Auswärtstrikot ist die Zweitfarbe Grundfarbe, die Drittfarbe Musterfarbe und die Hauptfarbe Akzent. Ältere Spielstände behalten ihre bisherigen Trikots.

### Spielansicht

- Im laufenden Spiel steht die kleinere Bezeichnung „Ligaspiel“ beziehungsweise „Pokalspiel“ über der Uhr. Der Spielstand ordnet die Teams näher an das Ergebnis; Teamnamen, Formation und Torschützen sind größer und lange Vereinsnamen dürfen umbrechen. Die Startelfliste beginnt mit dem Torwart und folgt dann Verteidigung, Mittelfeld und Angriff. Die Sortierung verändert weder Feldpositionen noch Drag-and-drop. Geprüft mit Match-, Pokal- und Statustests, Build sowie schmaler, mobiler und Desktopansicht.

### Aufstellung

- Die Form- und Frischeanzeige der Startelf steht mit kurzem Abstand direkt neben dem Spielernamen statt am rechten Kartenrand. Beim Torwart beginnt „TOR“ bündig mit dem Namen hinter der Flagge. Geprüft mit Aufstellungs- und Statustests, Build sowie mobiler Ansicht.

### Vereinsübersicht

- Der Kadercheck trägt eine kleinere Überschrift. In der Spielvorschau stehen „Heim“ und „Auswärts“ über den Vereinen mit österreichischen Flaggen statt der Richtungsbeschreibung zur Fünf-Spiele-Form; die Gegnerstärke wird als kurzer Vergleichssatz beschrieben. Ein Tipp auf einen gegnerischen Tabellenplatz öffnet Vereinsdaten, Kader und die zuletzt eingesetzte Startelf. Vor dem ersten Spiel wird ausdrücklich angezeigt, dass noch keine Aufstellung vorliegt. Geprüft mit Vorschau- und Vereinsprofiltest, Build sowie Desktop- und Mobilansicht.
- Das Vereinsprofil wird auch in die veröffentlichte Einzeldatei eingebunden. Ein zusätzlicher Deployment-Test prüft, dass dafür kein externes Skript benötigt wird.
- Die fünf Form-Ergebnisse beider Teams bleiben auf schmalen Mobilansichten jeweils in einer Reihe und stehen auch bei unterschiedlich langen Vereinsnamen auf gleicher Höhe. Geprüft mit Vorschautest, Build und mobilen Breiten von 320 und 375 Pixeln.

### Stärkesystem

- Spielerfähigkeiten werden in neuen Karrieren intern als ganze Werte von 0 bis 20 gespeichert. Die ungefähren Fähigkeitsbeschreibungen bleiben bestehen und erhalten fünf Farben entsprechend Formgesichtern und Müdigkeitsbalken: Violett (0–7), Blau (8–10), Grün (11–13), Orange (14–16), Rot (17–20). Alte Spielstände werden wegen des Skalenwechsels nicht mehr geladen oder importiert. Ein importierbarer Spielstand direkt vor einem Pokalfinale liegt unter `outputs/pokalfinale-staerke-0-20.json`. Geprüft mit `node work/test-v53.cjs` und Build.

### Spielerstatus

- Die zuvor eingeführten Pixelgesichter wurden durch die gewählte Variante A mit klarer, vollflächiger Mimik ersetzt. Sie erscheinen nun direkt an Feldspielern und Torwart im Aufstellungsraster; die Startelfliste zeigt den Status ohne abgeschnittene Namen. Der Frischebalken sinkt im Match stufenlos und ein Gesichtswechsel wird sanft eingeblendet. Eingesetzte Spieler erhalten zwischen Partien einmalig 16 Frischepunkte zurück, Bankspieler weiterhin 24. Der Bericht zeigt die Frische bei Abpfiff, ältere Spielstände werden ab dem nächsten absolvierten Match nach der neuen Regel behandelt. Geprüft mit `node work/test-v52.cjs`, den bestehenden Spieltests, Build sowie Desktop- und Mobilansicht.
- Fünf eigene Formgesichter und fünf Müdigkeitsbalken als skalierbare SVG-Grafiken erstellt und zu einer gemeinsamen Statusanzeige verbunden. Die Aufstellung zeigt den Status aller sechs Startspieler mit ihren drei stärksten Fähigkeiten sowie den Status der Ersatzbank. Im Match verändert sich der Status der eigenen Spieler mit der sinkenden Frische. Hohe Form verlangsamt die Ermüdung leicht; geringe Frische begrenzt die wirksame Form und damit auch die Spielleistung. Die bisherige Ergebnisform bleibt gespeichert. Die Vorschau liegt unter `docs/status-icons-preview.svg`; SVG-Dateien, `node work/test-v51.cjs` und Build wurden geprüft.

### Aufstellung

- Die Torwartbeschriftung auf dem Spielfeld ist so kompakt wie die der Feldspieler; sein senkrechter Frischebalken ist höher und deutlicher abgegrenzt. In den Spielerkarten steht der Form-/Frischestatus neben dem Namen und nutzt die Breite besser. Auf Desktop öffnet ein Klick auf den Startelfnamen die Spielerstatistik; auf schmalen Mobilgeräten wählt der Name nur den Feldspieler aus.
- Bei „Verein gründen“ mit unvollständigem Startkader erscheint die Fehlermeldung direkt bei den Vorgaben. Nur nicht erfüllte Kader-, Positions- und Altersvorgaben werden rot hervorgehoben, und nach einer gültigen Auswahl verschwindet die Meldung. Bestehende Spielstände bleiben unverändert. Geprüft mit `node work/test-v17.cjs`, `node work/test-v51-drag.cjs`, Build und lokaler Desktop-/Mobilansicht.
- Startelf, Torwart und Ersatzbank verwenden jetzt einheitlich aufgebaute Spielerkarten mit Flagge, Form und Frische, Position, Fähigkeiten und Details-Knopf. Die Schnellaufstellungs-Knöpfe haben größere Beschriftungen. Auf dem Spielfeld steht rechts neben jedem Formgesicht ein senkrechter, farblich passender Frischebalken; beim Torwart entfällt der doppelte Müdigkeitstext unter dem Namen. Geprüft mit Aufstellungs- und Statustests, Build sowie lokaler Mobilansicht bei 643 und 390 Pixeln.
- Positionskürzel und Nationalitätsflagge beginnen im Aufstellungsraster nun an derselben linken Kante. Alle fünf Formgesichter verwenden kräftigere Rot-, Orange-, Grün-, Blau- und Violetttöne; die zugehörigen Müdigkeitsbalken bleiben farblich synchron. Geprüft mit `node work/test-v52.cjs`, Build und lokaler Mobilansicht.
- Feldspieler lassen sich nun auch über die Startelf-Karten per Drag-and-Drop mit einem Ersatzspieler tauschen – von der Bank in die Startaufstellung und zurück. Der Torwart bleibt davon ausgenommen. Die bestehende Spielfeld-Interaktion bleibt erhalten. Geprüft mit `node work/test-v51-drag.cjs`, den Aufstellungs- und Statustests sowie Build.
- Die Torwart-Karte der Startaufstellung zeigt Flagge, Status, Fähigkeiten und einen eigenen Details-Knopf nun im Stil der Ersatzbank. Bankkarten nutzen auf Mobilgeräten die verfügbare Breite; Formgesicht und Müdigkeitsbalken stehen mittiger. Der Balken übernimmt die Farbe der aktuellen Formstufe von Violett bis Korallrosa, auch während des Matches. Geprüft mit `node work/test-v24.cjs`, `node work/test-v51.cjs`, `node work/test-v52.cjs`, Build und lokaler Mobilansicht.
- Der Kadercheck steht vor dem nächsten Spiel direkt zwischen der Form der letzten fünf Partien und dem Spielknopf. Seine Hinweise bleiben erhalten; die doppelten Schnellaufstellungs-Knöpfe auf der Übersicht entfallen. Im Vor-Spiel-Bereich stehen „Frischeste“, „Defensiv“, „Offensiv“ und „Zurücksetzen“ nun vor der Startaufstellung. Geprüft mit `node work/test-v17.cjs`, `node work/test-v24.cjs`, `node work/test-v49.cjs` und Build.
- Der Name des Torwarts verwendet auf dem Aufstellungsfeld nun die gleiche Schriftgröße wie die Namen der Feldspieler. Feldspieler zeigen ihr Positionskürzel über Nationalitätsflagge und Namen; die Positionsangabe ist auch für die Vorlesefunktion verfügbar.
- Der Startknopf zeigt nach einem Pokalspiel beim nächsten Ligaspiel wieder „Ligaspiel starten“. Geprüft mit `node work/test-v24.cjs` und `node work/test-v41.cjs`, einschließlich des Wechsels zwischen Pokal und Liga.
- Ein Tipp auf einen Feldspieler zeigt jetzt direkt seine Ausrichtung in der Seitenleiste beziehungsweise auf Mobiltelefonen in einer kompakten unteren Leiste. Das ausführliche Profil öffnet nur über „Profil“. Die Ersatzbank zeigt die drei stärksten Fähigkeiten als ungefähre Einschätzungen. Beim Ziehen scrollt die Seite am Bildschirmrand mit. Lokal mit bestehenden Spielständen sowie Maus-Drag geprüft.

### Transfers

- Der Transferbereich klappt die ablösefreien Spieler beim Öffnen auf und zeigt die Angebote sofort. Lokal mit einem bestehenden Spielstand nach Transferschluss geprüft.

### Spielablauf

- Freistöße, Ecken und Elfmeter erhalten eine längere sichtbare Vorbereitung. Die Elfmeterszene erscheint bereits vor dem Schuss. Der Torwart bewegt sich bei jedem Elfmeter, auch bei Toren und Fehlschüssen; Trefferchancen bleiben gleich. Geprüft mit `node work/test-v42.cjs`, `node work/test-v50.cjs` und 108 simulierten Matches aus `node work/test-v50-balance.cjs`.

### Veröffentlichung

- Bei einem ungültigen FTP-Zielverzeichnis sucht der Workflow nun lesend nach der bereits live geschalteten `index.html` und meldet nur einen eindeutig passenden Ordner. So lässt sich der Zielpfad bestimmen, ohne Zugangsdaten oder fremde Dateien auszugeben; ein Upload in einen geratenen Ordner findet nicht statt. Geprüft mit `work/test_deploy_ftps.py`.
- Der FTPS-Workflow meldet bei Fehlschlag jetzt die betroffene Stufe als GitHub-Fehleranmerkung, ohne Zugangsdaten auszugeben. So lässt sich ein Deployment auch ohne private Job-Logs gezielt prüfen. Geprüft mit `work/test_deploy_ftps.py`.

### Spielablauf

- Fouls führen jetzt zu automatischen Freistößen oder bei Strafraumfouls zu regulären Elfmetern. Geblockte und abgewehrte Schüsse können Abpraller auslösen. Ecken entstehen, wenn ein abgefälschter Ball über die Torlinie geht; Ecken und Freistöße werden sichtbar ausgespielt. Die Elfmeterszene und Trefferberechnung stammen aus dem Pokalmodus, laufen im Match aber ohne Eingabe ab. Ecken, Fouls, Freistöße und Elfmeter erscheinen im Abschlussbericht.
- Vor dem Spiel kann die Aggressivität gewählt werden: Sie beeinflusst eigene Zweikämpfe und das Foulrisiko. Gegner haben feste, vor dem Spiel erkennbare Aggressivitätsprofile mit denselben Auswirkungen. Bestehende Spielstände erhalten für das eigene Team „Normal“; die neuen Teamzahlen gelten ab dem nächsten Match. Geprüft mit `node work/test-v50.cjs`, `node work/test-v50-balance.cjs`, `node work/test-v42.cjs`, `node work/test-v44.cjs`, `node work/test-v47.cjs` und einem vollständigen Testmatch. Der Balancetest simuliert 108 Matches.

### Dokumentation

- Ein gemeinsames Änderungsprotokoll unter `docs/` eingerichtet. Künftige abgeschlossene Änderungen und neue Features werden hier mit Verhalten, möglicher Spielstandwirkung und Prüfung festgehalten.
- Die ausführlichen Produkt- und Entwicklungshinweise aus `AGENTS.md` nach `docs/` verschoben. `AGENTS.md` verweist jetzt gezielt auf die jeweils relevanten Dokumente. Den veralteten Veröffentlichungshinweis an den vorhandenen Deployment-Workflow angepasst. Spielcode und Spielstände bleiben unverändert; verschobene Abschnitte wurden mit dem ursprünglichen Inhalt verglichen.
