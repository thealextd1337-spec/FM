# SECHSER – Fußballmanager

Ein mobil spielbarer 6-gegen-6-Fußballmanager als statische Browseranwendung. Die Dateien in `dist/` sind der Quellstand der aktuellen Version. Spielstände liegen lokal im Browser.

Ab Saison 2 gibt es Jugendscouting mit kostenpflichtiger Sichtung und Entwicklung durch Ligaspiele.

Der Saisonabschluss zeigt nach der Finanzbilanz den verbleibenden Kader einschließlich verpflichteter Jugendspieler. Kaufangebote für eigene Spieler sind auf zwei pro Saison begrenzt.

Feste Produktregeln und Hinweise für neue Entwicklungsinstanzen stehen in [AGENTS.md](AGENTS.md).

## Lokal starten

```sh
node work/server.cjs
```

Danach `http://127.0.0.1:4173/` öffnen. Mit `SECHSER_PORT` lässt sich ein anderer Port wählen.

## Einzeldatei für den Webspace erstellen

```sh
node work/build.cjs
```

Der Build schreibt `outputs/index.html` und `outputs/Sechser-Fussballmanager.html`. `outputs/` enthält erzeugte Dateien und wird nicht committet. Für die bestehende World4You-Seite wird `outputs/index.html` in das Verzeichnis der Subdomain hochgeladen.

## Tests

```sh
node work/test-v32.cjs
node work/test-v31.cjs
node work/test-v34.cjs
```

Weitere Regressionstests liegen als `work/test-*.cjs` vor. `test-v31.cjs` simuliert zwölf vollständige Saisonen.
