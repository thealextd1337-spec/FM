# Änderungen

## Noch nicht veröffentlicht

## 2026-09-22

### Veröffentlichung

- Bei einem ungültigen FTP-Zielverzeichnis sucht der Workflow nun lesend nach der bereits live geschalteten `index.html` und meldet nur einen eindeutig passenden Ordner. So lässt sich der Zielpfad bestimmen, ohne Zugangsdaten oder fremde Dateien auszugeben; ein Upload in einen geratenen Ordner findet nicht statt. Geprüft mit `work/test_deploy_ftps.py`.
- Der FTPS-Workflow meldet bei Fehlschlag jetzt die betroffene Stufe als GitHub-Fehleranmerkung, ohne Zugangsdaten auszugeben. So lässt sich ein Deployment auch ohne private Job-Logs gezielt prüfen. Geprüft mit `work/test_deploy_ftps.py`.

### Spielablauf

- Fouls führen jetzt zu automatischen Freistößen oder bei Strafraumfouls zu regulären Elfmetern. Geblockte und abgewehrte Schüsse können Abpraller auslösen. Ecken entstehen, wenn ein abgefälschter Ball über die Torlinie geht; Ecken und Freistöße werden sichtbar ausgespielt. Die Elfmeterszene und Trefferberechnung stammen aus dem Pokalmodus, laufen im Match aber ohne Eingabe ab. Ecken, Fouls, Freistöße und Elfmeter erscheinen im Abschlussbericht.
- Vor dem Spiel kann die Aggressivität gewählt werden: Sie beeinflusst eigene Zweikämpfe und das Foulrisiko. Gegner haben feste, vor dem Spiel erkennbare Aggressivitätsprofile mit denselben Auswirkungen. Bestehende Spielstände erhalten für das eigene Team „Normal“; die neuen Teamzahlen gelten ab dem nächsten Match. Geprüft mit `node work/test-v50.cjs`, `node work/test-v50-balance.cjs`, `node work/test-v42.cjs`, `node work/test-v44.cjs`, `node work/test-v47.cjs` und einem vollständigen Testmatch. Der Balancetest simuliert 108 Matches.

### Dokumentation

- Ein gemeinsames Änderungsprotokoll unter `docs/` eingerichtet. Künftige abgeschlossene Änderungen und neue Features werden hier mit Verhalten, möglicher Spielstandwirkung und Prüfung festgehalten.
- Die ausführlichen Produkt- und Entwicklungshinweise aus `AGENTS.md` nach `docs/` verschoben. `AGENTS.md` verweist jetzt gezielt auf die jeweils relevanten Dokumente. Den veralteten Veröffentlichungshinweis an den vorhandenen Deployment-Workflow angepasst. Spielcode und Spielstände bleiben unverändert; verschobene Abschnitte wurden mit dem ursprünglichen Inhalt verglichen.
