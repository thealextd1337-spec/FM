# Entwicklung und Veröffentlichung

## Code, Prüfung und Veröffentlichung

- Quellstand: `dist/`. Die versionierten Skripte werden in der Reihenfolge von `dist/index.html` geladen; neuere Dateien überschreiben teils ältere Funktionen. Vor Änderungen die ganze relevante Aufrufkette prüfen.
- `node work/server.cjs` startet lokal auf Port 4173. `node work/build.cjs` erzeugt die Einzeldatei `outputs/index.html`. `outputs/` und temporäre Dateien bleiben außerhalb von Git.
- Passende Tests aus `work/test-*.cjs` ausführen. `node work/test-v31.cjs` simuliert zwölf Saisonen; `node work/test-v35.cjs` prüft die Transferansicht und den übernommenen Saisonablauf; `node work/test-v36.cjs` prüft die Jugendverpflichtung mit und ohne Scouting. Bei Änderungen an Finanzen, Transfers oder Saisonwechsel mindestens den Dauertest erneut ausführen.
- `node work/test-v41.cjs` prüft Pokalspielplan, getrennte Statistiken, Sieger-Award, einmalige Prämie und Elfmeterschützen.
- `node work/test-v42.cjs` prüft das gespeicherte Elfmeterschießen nach einem Remis und die isolierte Demo.
- `node work/test-v43.cjs` prüft Vereinsrekorde und Awardhistorie.
- `node work/test-v44.cjs` prüft Trikot- und Logowahl, Kontrast und Torwarttrikot.
- `node work/test-v50.cjs` prüft Fouls, Freistöße, Ecken, Blocks, Abpraller, reguläre Elfmeter, Aggressivität, Halbzeit, Spielende und den Pokalübergang.
- `node work/test-v50-balance.cjs` simuliert 108 vollständige Matches mit drei eigenen und drei gegnerischen Aggressivitätsstufen. Der Test prüft die Foulhäufigkeit, Standardsituationen und Spieldauer.
- `node work/test-v51.cjs` prüft gekoppelte Form und Frische, Ermüdung im Match und den gespeicherten Frischewert nach Abpfiff. `node work/generate-status-icons.cjs` erzeugt die SVG-Symbole, die Vorschau und ihre Daten für den Einzeldatei-Build.
- GitHub-Repository: `thealextd1337-spec/FM` (öffentlich). Ein Push auf `main` startet den Deployment-Workflow für `https://fussball.cakamper.at/` auf World4You; der Workflow kann auch manuell gestartet werden. Vor einer Veröffentlichung Build und Live-Version gesondert prüfen. Bestehende Branch-Historie vor Push oder Merge prüfen und nicht mit Force Push überschreiben.
