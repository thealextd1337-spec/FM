# Änderungen

## 2026-09-22

### Spielerstatus

- Die zuvor eingeführten Pixelgesichter wurden durch die gewählte Variante A mit klarer, vollflächiger Mimik ersetzt. Sie erscheinen nun direkt an Feldspielern und Torwart im Aufstellungsraster; die Startelfliste zeigt den Status ohne abgeschnittene Namen. Der Frischebalken sinkt im Match stufenlos und ein Gesichtswechsel wird sanft eingeblendet. Eingesetzte Spieler erhalten zwischen Partien einmalig 16 Frischepunkte zurück, Bankspieler weiterhin 24. Der Bericht zeigt die Frische bei Abpfiff, ältere Spielstände werden ab dem nächsten absolvierten Match nach der neuen Regel behandelt. Geprüft mit `node work/test-v52.cjs`, den bestehenden Spieltests, Build sowie Desktop- und Mobilansicht.
- Fünf eigene Formgesichter und fünf Müdigkeitsbalken als skalierbare SVG-Grafiken erstellt und zu einer gemeinsamen Statusanzeige verbunden. Die Aufstellung zeigt den Status aller sechs Startspieler mit ihren drei stärksten Fähigkeiten sowie den Status der Ersatzbank. Im Match verändert sich der Status der eigenen Spieler mit der sinkenden Frische. Hohe Form verlangsamt die Ermüdung leicht; geringe Frische begrenzt die wirksame Form und damit auch die Spielleistung. Die bisherige Ergebnisform bleibt gespeichert. Die Vorschau liegt unter `docs/status-icons-preview.svg`; SVG-Dateien, `node work/test-v51.cjs` und Build wurden geprüft.

### Aufstellung

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
