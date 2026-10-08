# Enginevergleich und späterer Android-Appweg

Stand: 8. Oktober 2026. Geliefert wird die [lokale PC-Demo](local-demo.md). Sie prüft die vorhandene Browserengine und einen begrenzten Unity-Kontaktkern mit derselben Figurenbasis. Messwerte und Abnahme stehen im [Leistungsbericht](performance-report.md) und in der [Prüfmatrix](demo-acceptance.md). Nutzerentscheidung vom 8. Oktober 2026: Unity wird der Hauptpfad für den weiteren 3D-Ausbau. Der Browserpfad bleibt als Bestands- und Vergleichsgrundlage erhalten. Die visuelle Wahl ist keine neue Vollspiel-/Android-Leistungsmessung. Die [zusammenhängenden Spielzüge](connected-play.md) sind lokal geliefert; als nächstes folgt die abgegrenzte Unity-Anbindung an echte Vereinswelt-Partien mit Pause, Zwischenstand und Rückschau.

## Was läuft

Der lokale Managerrahmen lädt Szenen mit stabilen IDs und Parametern. Start, Pause, Fortsetzen, Kamerawechsel, Rücksetzen, Zwischenstand und Export sind über dieselbe Bedienung erreichbar. Je Engine besitzt genau eine Simulation Zeit, Ball, Akteure und Ereignisse. Die Darstellung liest diese Zustände. Unity antwortet auf jeden Befehl mit dessen Kennung; Fehler werden sichtbar weitergereicht.

Unity verwendet feste Schritte und analytische kontinuierliche Kontaktvolumen. Der Laufzeittyp enthält keine Soll-Ergebnisse des Katalogs. Die Browserseite ruft die tatsächlichen Bestandsfunktionen auf und zeigt deren Abweichungen: unterschiedliche Keeperboxen, vorgewählte Schussausgänge und eine nur grafische Vergrößerung des Felds. Die vorgegebenen Bewegungsskripte sind deshalb keine identischen Rechenlasten. Die Leistungszahlen vergleichen die konkreten Proben, keine vollständigen gleichwertigen Match-KIs.

Unity sichert den vollständigen begrenzten Demozustand; der Browser stellt seinen Stand durch deterministische Neuausführung und anschließenden Zustandsvergleich wieder her. Beide binden Zwischenstände an ihre Quellenfassung. Das demonstriert sichere lokale Unterbrechung, noch keine produktive Karrierespeicherung oder plattformübergreifende Cloudfortsetzung. Eine fertig gemeldete Szene erzeugt im Unity-Ledger genau ein Ergebnisereignis; es werden keine Karrierepunkte verbucht.

## Eine zusätzliche kleine Regel

Als gemeinsamer Erweiterungsfall dient das verbotene Keeper-Handspiel nach kontrolliertem eigenem Rückpass. Unity prüft die Ballherkunft vor Fang/Parade und beendet einen tatsächlichen verbotenen Kontakt mit einem Regelereignis. Unabhängige Negativfälle prüfen Rückpass und Kontakt außerhalb des eigenen Strafraums. Der Browser meldet offen, dass seine untersuchte Bereichsfunktion diese Herkunftssperren nicht prüft. Eine Produktionskorrektur braucht dort einen gemeinsamen Herkunftsdatensatz und die Anpassung aller tatsächlichen Handkontaktwege, nicht nur der Demoanzeige. Der Vergleich liefert damit eine konkrete Integrationsaufgabe; er behauptet keine gemessene Personenstunden-Schätzung.

## Android-Kandidat für den Browser

Im Doppel-6-Bestand wurde kein vorhandenes Capacitor-/Gradle-/AndroidManifest-Projekt gefunden. Ein konkreter nächster Prototypkandidat ist eine eigene Capacitor-Hülle mit lokal gebündelten Webdateien. Capacitor stellt eine Android-Laufzeit für JavaScript/native Kommunikation bereit und verwaltet das Androidprojekt über Android Studio. [Offizielle Android-Dokumentation](https://capacitorjs.com/docs/android), geprüft am 8. Oktober 2026.

Für eine spätere Umsetzung: eine statische Ausgabe des Browserwegs mit Assets und finaler `index.html` erzeugen und als `webDir` konfigurieren. Die momentanen dynamischen localhost-Routen und Bootstrap-Ergänzungen müssten dabei in die statische Ausgabe überführt werden. Die Desktop-Serveradresse wird nicht als Appinhalt vorausgesetzt. Capacitor dokumentiert `server.url` für Live Reload; die gebündelten Dateien sind der passende Kandidat für diese Offlineprobe. [Konfiguration](https://capacitorjs.com/docs/config).

Danach getrennt prüfen: Pause bei Hintergrundwechsel, Prozessabbruch und Wiederaufnahme, Touch/Vollbild, identische Szenen und Seeds, Update über bestehende Installation sowie Asset-/Speicherlast. Erst echte Läufe auf Pixel 9a und Pixel 9 Pro XL können das gesetzte Ziel von stabilen 30 Bildern/s bestätigen. Paketierung allein ist kein Geschwindigkeitsnachweis. App-ID, Signierung und Aktualisierungsweg folgen dem [bestätigten Installationsplan](../android-installation-update-plan.md).

## Android-Kandidat für Unity

Das vorhandene Unityprojekt besitzt Web- und Windows-Unterstützung, aber kein Androidmodul. Die jetzige `.jslib`-Verbindung ist für WebGL. Für einen nativen Androidvergleich braucht der begrenzte C#-Kern einen eigenen Transport zum Manager und einen getesteten Lebenszyklus; die vorhandene HTML-Verwaltung wird dadurch nicht automatisch zur nativen Oberfläche.

Unity beschreibt APK- und AAB-Ausgaben, Android-Buildprofile und getrennte Signierung. Eine spätere APK-Probe setzt die dazugehörige Android-Werkzeugkette voraus. Diese Welle installiert sie nicht und erzeugt keine APK. [Unity: Android-Buildprozess](https://docs.unity3d.com/6000.0/Documentation/Manual/android-BuildProcess.html). Reproduzierbarer aktueller Webbuild: [Unity-Anleitung](../../prototypes/match-engine-unity/README.md).

## Frühere offene Engineentscheidung (durch die Nutzerwahl abgelöst)

Vor der Enginewahl fehlen gleiche vollständige Spielsituationen mit Rollen-/Aktionsplanung, sichtbare Hand-/Fußkontakte, vollständige Partien und Rückschau sowie Android-Hardwaremessungen. Der nächste begrenzte Ausbauschritt sollte diese nachgewiesenen Unterschiede gezielt verkleinern. Neue vollständige Match-KIs in beiden Engines parallel sind weiterhin nicht vorgesehen.


## Ergänzung: Ballphysik und Kontaktansicht

Die sechs isolierten Ballphysikfamilien laufen in beiden lokalen Webdemos mit identischen Parametern. 48 Fälle und Zwischenstände sowie tatsächliche Webbedienung sind geprüft. Hoher Flug, Ausrollen, Bodenaufprall, Pfosten, Latte und Tor/Netz bleiben separate Proben ohne Spielerkontakte. Die übrige Browserprobe verwendet weiterhin ihre Bestands-Matchfunktionen. Die Kontaktkamera zeigt auch Mittelfeldkontakte; beide Renderer verwenden dieselbe kanonische Blickrichtung. [Finale Abnahme, Build und Grenzen](demo-acceptance.md#ballphysik-und-kontaktkamera). Keine neue Leistungs- oder Engineentscheidung und keine Veröffentlichung.
