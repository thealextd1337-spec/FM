# Doppel 6 – Fußballmanager

Ein mobil spielbarer 6-gegen-6-Fußballmanager als statische Browseranwendung. Die Dateien in `dist/` sind der Quellstand der aktuellen Version. Spielstände liegen lokal im Browser.

Ab Saison 2 gibt es Jugendscouting mit optionaler kostenpflichtiger Sichtung, sofortiger Verpflichtung auch ohne Scouting und Entwicklung durch Ligaspiele.

Neue Karrieren enthalten einen KO-Pokal mit Auftaktrunde, Halbfinale und Finale. Bei einem Unentschieden entscheidet ein Elfmeterschießen. Pokalspiele haben eigene Spielerstatistiken. Zum Saisonende werden Torschützenkönig, bester Spieler, Meister und Pokalsieger ausgezeichnet; die Erfolge bleiben in der Awardhistorie sichtbar.

In der Vereinszentrale öffnet „Awards & Vereinsrekorde“ die Auszeichnungen und die Rekordspieler für Tore und Einsätze. Die Rekorde zählen Liga und Pokal sowie ehemalige Spieler des Vereins.

Bei der Vereinsgründung lassen sich Heim- und Auswärtstrikot aus je sechs Mustern sowie Form und Verzierung des Vereinslogos wählen. Dunkle Vereinsfarben erhalten einen lesbaren UI-Akzent. Im Elfmeterschießen trägt der Torwart ein eigenes Trikot.

Das Vereinslogo wird während der Auswahl direkt über den Formen angezeigt. Ein Torwarttrikot lässt sich aus sechs Varianten wählen; bei zu ähnlichen Farben nutzt der Torwart im Match eine kontrastierende Variante.

Die Karrierezentrale hat fünf Bereiche: Übersicht, Kader, Transfers, Wettbewerbe und Verein. Auf Mobilgeräten liegt die Navigation am unteren Bildschirmrand. Speichern, Speicheroptionen und rechtliche Hinweise sind über „Menü“ erreichbar. Auf dem Startbildschirm liegen Demo und weitere Optionen unter „Extras & Einstellungen“.

Die Ersatzbank zeigt Flagge, Position und Müdigkeit direkt an. Im laufenden Spiel stehen die Teamkürzel über den Seitenlinien-Statistiken. Nach Abpfiff zeigt ein Spielbericht die Teamwerte sowie die Noten, Tore und Vorlagen beider Aufstellungen. Vorlagen werden bereits im Spiel erfasst.

Nach einem Pokalremis wählst du die sechs Elfmeterschützen in einem Popup und spielst die Schüsse einzeln aus. Die Startseite enthält außerdem eine Elfmeterschießen-Demo mit vier Teams; Demoergebnisse ändern keinen Spielstand.

Impressum, Datenschutz- und Speicherhinweise sind über die Links unter dem Spiel erreichbar. Der Spielcode setzt keine Cookies. Spielstände und die Wahl zur freiwilligen Datenübertragung liegen lokal im Browser; externe Google-Schriftarten werden nicht mehr geladen.

Während der Transfertage sind der aktuelle Kader, Spieler mit Ablöse und Kaufangebote für eigene Spieler einklappbar. Die Kaufangebote für eigene Spieler stehen unter den ablösefreien Spielern und sind auf zwei pro Saison begrenzt.

Feste Produktregeln und Hinweise für neue Entwicklungsinstanzen stehen in [AGENTS.md](AGENTS.md).

Abgeschlossene Änderungen und neue Features werden unter [docs/](docs/README.md) dokumentiert.

## Lokal starten

```sh
node work/server.cjs
```

Danach `http://127.0.0.1:4173/` öffnen. Mit `SECHSER_PORT` lässt sich ein anderer Port wählen.

## Einzeldatei für den Webspace erstellen

```sh
node work/build.cjs
```

Der Build schreibt `outputs/index.html` und `outputs/Doppel-6-Fussballmanager.html`. `outputs/` enthält erzeugte Dateien und wird nicht committet. Für die bestehende World4You-Seite wird `outputs/index.html` in das Verzeichnis der Subdomain hochgeladen.

## Automatisches Deployment

Der Workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) prüft bei jedem Push auf `main` die wichtigsten Spieltests, erstellt `outputs/index.html`, lädt ausschließlich diese Datei per verschlüsseltem FTPS hoch und vergleicht anschließend die Live-Datei mit dem Build. Er kann unter **Actions → Doppel 6 deploy → Run workflow** auch manuell gestartet werden. Der Upload verändert keine anderen Dateien im Webspace, insbesondere nicht `api/`.

Im GitHub-Repository unter **Settings → Environments → production → Environment secrets** sind folgende Werte nötig:

| Secret | Inhalt |
| --- | --- |
| `W4Y_FTP_HOST` | FTP-Servername aus dem World4You-Kundenbereich, ohne `ftp://` |
| `W4Y_FTP_USER` | FTP-Benutzername |
| `W4Y_FTP_PASSWORD` | FTP-Passwort |
| `W4Y_FTP_REMOTE_DIR` | Verzeichnis der Subdomain, im bisherigen WebFTP `/fussball` |

Der FTP-Zugang muss **explizites FTP über TLS (FTPS)** unterstützen. Der Workflow prüft das Serverzertifikat und verschlüsselt auch die Datenverbindung. Zugangsdaten gehören ausschließlich in GitHub-Secrets, nicht in Dateien oder Commit-Nachrichten. Der erste erfolgreiche Lauf bestätigt den tatsächlichen Servernamen und Zielpfad.

## Tests

```sh
node work/test-v32.cjs
node work/test-v31.cjs
node work/test-v34.cjs
node work/test-v35.cjs
node work/test-v36.cjs
node work/test-v41.cjs
node work/test-v42.cjs
node work/test-v43.cjs
node work/test-v44.cjs
node work/test-v45.cjs
node work/test-v47.cjs
```

Weitere Regressionstests liegen als `work/test-*.cjs` vor. `test-v31.cjs` simuliert zwölf vollständige Saisonen.
