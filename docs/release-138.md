# Veröffentlichung 138

Release 138 vom 27. Oktober 2026 enthält Release 137 (einschließlich des lokalen Live-Nachweises `f961c061`) und den Fingerabdruck des App-Signaturschlüssels von Google Play in `dist/.well-known/assetlinks.json`. Der Nutzer hat die App in der Play Console angelegt, das App-Bundle 1.0 hochgeladen und den Fingerabdruck übermittelt. Spiellogik, Matchdateien und Unity-Binärbuild sind unverändert.

## Prüfung

Lokal: `work/test-release-version.cjs`, `generate-privacy-page.cjs --check`, die Deploy-Tests `work/test_deploy_unity_assets.py` und `work/test_deploy_ftps.py`, bytegleiche Einzeldatei-Builds. Die übrigen Spieltests sind gegenüber Release 137 nicht berührt und laufen im Produktionsworkflow vor dem Upload. Nach dem Deployment liest Googles Digital-Asset-Links-Dienst beide Fingerabdrücke, und `work/check-live-r138.cjs` vergleicht die Live-Dateien und spielt die Seite online und offline.

## Grenzen

Die Anzeige ohne Adressleiste in der Store-App ist erst am Gerät nach Installation aus dem geschlossenen Test belegt. Offen bleiben die Play-Zielgruppe, das Datenschutzformular (Entscheidung zu „Spieldaten teilen“ im alten Modus), Handy-Screenshots und der geschlossene Test mit 12 Personen über 14 Tage.
