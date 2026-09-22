# Änderungen

## Noch nicht veröffentlicht

## 2026-09-22

### Aufstellung

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
