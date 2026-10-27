# Nachweise Release 137

- `workflow-commands.txt`: Status und Dauer je Befehl des Produktionsworkflows; `logs/` die Ausgaben.
- `check-app-offline.txt`: `work/check-app-offline.cjs` (Manifest, Symbole, App-Dateien, Service Worker, Offline-Neustart mit Unity, danach online frische Seite).
- `publication-dry-run.json`: echte Paketdateien durch beide Deploy-Skripte mit simuliertem FTPS und HTTP; App-Dateien und Unity-Manifest vor der Spielseite, die Seite zuletzt.
- `dry-run-live-*`: Probelauf von `work/check-live-r137.cjs` gegen `work/serve-tree.cjs`.
- `android/`: signierte `doppel6-1.0.apk` und `doppel6-1.0.aab` (Paket `at.cakamper.doppel6`, versionCode 1), nicht verteilt und nicht hochgeladen.
- `live-check.json`, `live-unity.png`, `live-2d.png` (nach dem Deployment): Live-Bytes einschließlich App-Dateien, Unity- und 2D-Partie, Speichern/Neuladen, Offline-Neustart.

Der GitHub-Actions-Lauf für den Veröffentlichungscommit ist der serverseitige Nachweis.
