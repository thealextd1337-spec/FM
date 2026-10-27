# Veröffentlichung 137

Release 137 vom 27. Oktober 2026 enthält Release 136 (einschließlich der lokalen Abnahme-Checkliste `edc1a53f`) und die Vorbereitung der Android-App. Veröffentlicht wird aus `work/release-r136` auf `release/r137`. Beauftragt hat der Nutzer das am 27. Oktober 2026 mit „ja“ auf den Play-Store-Plan: erste Play-Version ohne Account, Werbung und Kauf, Trusted Web Activity, Anlage des Signierschlüssels, Phase 1 als Release 137. Spiellogik, Matchdateien und Unity-Binärbuild sind unverändert gegenüber 136.

## Umfang

- **Installierbarkeit:** `manifest.webmanifest` mit Symbolen in 192 und 512 px (auch maskierbar), verlinkt in der Spielseite.
- **Offline-Start:** `sw.js` startet Seite und, nach einem 3D-Spiel, Unity-Partien auch ohne Netz. Die Seite kommt zuerst aus dem Netz, damit keine alte Version hängen bleibt. Der Service Worker gilt auf der HTTPS-Seite für alle Besucher. Einzelheiten in [Android-App](android-app.md#offline-start).
- **Domainnachweis:** `.well-known/assetlinks.json` für Paket `at.cakamper.doppel6` und den neuen Upload-Schlüssel.
- **Datenschutzseite:** `datenschutz.html` mit Impressum, Datenschutz und Speicherhinweisen, erzeugt aus `dist/legal-v38.js`. Die Spieltexte nennen jetzt IndexedDB, den Offline-Zwischenspeicher und die Android-App (Deutsch und Englisch).
- **Deploy:** `work/deploy_unity_assets.py` lädt die Dateien aus `work/app-files.json` vor der Spielseite hoch und prüft sie per HTTP.
- **App-Hülle:** `work/platform/android-twa/`; signierte `app-release.apk` und `app-release.aab` (versionCode 1, versionName 1.0) lokal gebaut, nicht verteilt und nicht hochgeladen.
- **Store-Entwurf:** [Eintrag und Formulare](play-store/eintrag.md), Symbol und Vorstellungsgrafik.

## Prüfung

Vor dem Push liefen `work/test-release-version.cjs` und alle Befehle des Produktionsworkflows lokal. Dazu kamen:

- `work/check-app-offline.cjs`: Manifest und Symbole, App-Dateien, Kontrolle durch den Service Worker, Offline-Neustart mit Unity-Partie, danach online eine frische Seite;
- ein Probelauf von `work/check-live-r137.cjs` gegen `work/serve-tree.cjs`: alle 15 Dateien bytegleich, Unity- und 2D-Partie, Speichern und Neuladen, Offline-Neustart mit Unity;
- die Offline-Publikationsprobe: 17 Uploads, App-Dateien und Unity-Manifest vor der Spielseite, die Seite zuletzt umbenannt;
- `generate-privacy-page.cjs --check`;
- `apksigner verify` (Zertifikat SHA-256 `C9:54:82:…:19:75` gleich `assetlinks.json`).

Nachweise liegen unter `outputs/release-r137/`.

## Grenzen

Kein Test auf einem echten Android-Gerät, kein Play-Konto, kein Upload. Offen sind Paketname/Domain, Play-Zielgruppe (Familienrichtlinie) und Handy-Screenshots. Der Offline-Start mit Unity braucht ein 3D-Spiel nach dem ersten Besuch. Die Zurück-Taste verhält sich wie in Chrome und ist am Gerät zu prüfen. Nutzerabnahmen aus [Release 136](abnahme-release-136.md) bleiben offen.
