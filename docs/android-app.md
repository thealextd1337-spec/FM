# Android-App (Trusted Web Activity)

Stand: 27. Oktober 2026. Nutzerentscheidung vom 27. Oktober 2026: Die erste Play-Store-Version ist das Spiel wie im Browser, kostenlos, ohne Account, Werbung und Kauf. Sie ist eine Trusted Web Activity (TWA), kein Capacitor-Paket. Der Nutzer hat außerdem die Anlage des Signierschlüssels erlaubt. Die Entscheidung ändert für Android die Reihenfolge aus dem [Installations-/Updateplan](android-installation-update-plan.md) („PC-Browser zuerst, Accountpflicht“). Accounts, Elternfreigabe, Werbung und der Werbefrei-Kauf bleiben spätere App-Updates.

## Funktionsweise

Die App öffnet `https://fussball.cakamper.at/` in Chrome ohne Adressleiste. Jeder Push auf `main` aktualisiert damit auch das Spiel in der App; ein neuer Store-Upload ist nur für Änderungen an der App-Hülle nötig. Spielstände liegen im Speicher dieser Website in Chrome, auf demselben Handy also gemeinsam für Chrome und App.

| Teil | Datei | Zweck |
| --- | --- | --- |
| Web-Manifest | `dist/manifest.webmanifest`, `dist/icons/icon-*.png` | Name, Symbole, Startadresse |
| Service Worker | `dist/sw.js`, Registrierung in `work/build.cjs` | Offline-Start (siehe unten) |
| Domainnachweis | `dist/.well-known/assetlinks.json` | Chrome zeigt die App nur ohne Adressleiste, wenn Paketname und Zertifikat hier stehen |
| Datenschutzseite | `dist/datenschutz.html`, erzeugt von `work/generate-privacy-page.cjs` aus `dist/legal-v38.js` | Öffentliche Adresse für Google Play |
| App-Hülle | `work/platform/android-twa/` | Gradle-Projekt mit `androidbrowserhelper` 2.7.4, Paket `at.cakamper.doppel6` |

`work/app-files.json` listet die Dateien, die an derselben Stelle auf der Website liegen. Der Deploy (`work/deploy_unity_assets.py`) lädt sie mit der Unity-Laufzeit vor der neuen Spielseite hoch und prüft jede per HTTP. `work/serve-tree.cjs` liefert sie lokal ebenso aus.

## Offline-Start

Der Service Worker registriert sich nur auf der HTTPS-Seite; lokale QA-Server schalten ihn mit `?d6sw=1` zu, damit die übrigen Browserprüfungen unverändert laufen.

- Spielseite, Unity-Laufzeit und übrige Dateien: zuerst Netz (`cache: no-cache`, also mit Revalidierung), sonst die gespeicherte Kopie. Online kommt so immer die aktuelle Version. Die 92-MB-Seite wird nur neu gespeichert, wenn ETag oder Last-Modified sich ändern.
- Unity-Build (`/unity/Build/*?v=<sha256>`): zuerst Speicher, weil der Inhalt am Hash hängt; eine neue Fassung ersetzt die alte.
- Der Service Worker behandelt nur Spielseite, `/unity/`, `/unity-match/`, Symbole, Manifest und Datenschutzseite. Die alte Vorschau unter `/3d/` und `/api/` bleiben außen vor.
- Die Startseite wird bei der Installation des Service Workers gespeichert. Der Unity-Build wird erst beim nächsten 3D-Spiel einer kontrollierten Seite gespeichert. Offline-3D setzt also ein 3D-Spiel nach dem ersten Besuch voraus.
- Das gilt für alle Browserbesucher der Seite, nicht nur für die App. Sie belegen dafür bis zu rund 180 MB im Browser-Zwischenspeicher.

Prüfung: `node work/build.cjs && node work/check-app-offline.cjs`. Sie prüft Manifest, Symbole und App-Dateien, die Kontrolle durch den Service Worker, einen Offline-Neustart mit Unity-Partie und, wieder online, eine frische Seite vom Server. Die Live-Prüfung `work/check-live-r137.cjs` vergleicht zusätzlich die App-Dateien bytegenau und startet die Live-Seite offline neu.

## Bauen und signieren

Voraussetzungen auf diesem Rechner: Android-SDK `H:\dev\android-sdk` (Plattform 36), JDK 21, Gradle 9.7 über `gradlew`.

```
cd work/platform/android-twa
./gradlew assembleRelease   # APK für die private Installation
./gradlew bundleRelease     # AAB für Google Play
```

Der Upload-Schlüssel liegt außerhalb des Repositorys in `H:\dev\keys\doppel6-upload.jks`, Passwörter in `H:\dev\keys\doppel6-upload.properties` (eine andere Datei per `D6_ANDROID_SIGNING`). Ohne diese Dateien entstehen nur unsignierte Builds. **Schlüssel und Passwortdatei gehören in eine eigene Sicherung des Betreibers.** Ohne sie lassen sich installierte APKs nicht mehr aktualisieren. Ist Google Play App Signing eingerichtet, setzt Google einen neuen Upload-Schlüssel ein.

Zertifikat SHA-256: `C9:54:82:31:83:F2:23:6E:85:C3:37:7D:2E:B4:2D:CA:0F:0E:26:A8:F8:5F:66:9B:DB:C7:39:CF:D0:DC:19:75`. Mit Play App Signing signiert Google die ausgelieferte App mit einem eigenen Schlüssel. Dessen Fingerabdruck (Play Console → App-Integrität) muss danach **zusätzlich** in `assetlinks.json`, sonst zeigt die Store-App eine Adressleiste.

Versionen: `versionCode` steigt mit jeder hochgeladenen Hülle (jetzt 1, `versionName` 1.0). Die Fußversion der Website (137) zählt getrennt weiter.

## Installation am Pixel

Per USB mit aktiviertem USB-Debugging: `adb install -r app-release.apk`. Alternativ kann der Nutzer die APK-Datei herunterladen und mit dem Android-Installer öffnen. `-r` aktualisiert eine vorhandene Installation; Spielstände bleiben, weil sie in Chrome liegen. Zu prüfen sind: Start ohne Adressleiste (sonst stimmt `assetlinks.json` nicht), eine volle Partie in 2D und 3D, Zurück-Taste (Chrome schließt offene Dialoge, am Startbildschirm beendet sie die App), Hintergrund und Rückkehr, Offline-Start nach einem Online-3D-Spiel.

## Offen

- Paketname `at.cakamper.doppel6` ist ein Vorschlag. Er ist nach dem ersten Play-Upload endgültig und an die Domain gebunden. Bis dahin kostet eine Änderung nur eine Neuinstallation der Test-APK; die Spielstände bleiben in Chrome.
- Zielgruppe für die Play-Familienrichtlinie (Kinder unter 14 laut [Produktregeln](product.md)).
- Play-Konto (25 US-Dollar, Identitäts- und Gerätebestätigung) und geschlossener Test mit 12 Personen über 14 Tage: Nutzeraufgaben, siehe [Store-Eintrag](play-store/eintrag.md).
- Die Play-Regeln (Testpflicht, Ziel-API) stammen aus der Recherche vom 7. und 15. Oktober 2026 und werden vor der Kontoanlage erneut geprüft.
