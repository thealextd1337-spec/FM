# Änderungen

## Noch nicht veröffentlicht

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
