# Release 122 – zwölf Länder, Crown und Horizon

Stand: 11. Oktober 2026. Veröffentlichung vom Nutzer beauftragt; veröffentlicht und auf der echten Live-Seite abgenommen.

Neue Vereinswelten umfassen 192 Vereine in zwölf Ländern. Crown Cup und Horizon Cup folgen den freigegebenen Auslosungsregeln, die Länderwertung bestimmt Folgequalifikationen. Karriereoberfläche, Vereinsbüro, Chronik und künftige Statistikarchive sind integriert. Innsbruck Sport ist der bestätigte Vereinsname. Alle 64 freigegebenen detaillierten Trophäenmotive sind mit dem Bildgenerator freigestellt und als 128 transparente Varianten offline eingebettet.

Bestehende Vereinswelten behalten ihre gespeicherten Regeln; keine nachträgliche Berechnung. Die Unity-Laufzeit und mobile Kamera aus Release 121 bleiben enthalten. `freekickdemo/` gehört nicht zu diesem Release.

## Abnahme

[AP11](ligaexpansion-ap11.md) dokumentiert zehn native und zwanzig synthetische Saisons, physische Android-Partie, Nutzerfeedback, 75 Sekunden pausiertes Vollbild-Wachhalten sowie Import/Backup/Reload eines 67,4-MB-Spielstands auf dem Pixel. GPU-Frametimes, Spitzen-RAM und fünf gleichzeitige große Welten sind nicht gemessen. Die Androidbelege stammen vom Stand vor dem Grafikaustausch; die Grafikvarianten werden im Browser und Offline-Build separat geprüft.

106 lokale Produktionskommandos bestehen. Zwei Release-Browserfälle (390/1440 Pixel) prüfen echten neuen Start, Innsbruck Sport, Marktfortschritt, sechs Karrierebereiche, Deutsch/Englisch, beide Cups, archivierte Statistiken, identische Länderwerte nach Neuladen und 128 eingebettete transparente Bilder. Eine aktuelle native Partie besteht Pause/Neuladen/Abschluss mit unveränderten Spieler- und Buchungsdaten. Alle 140 übrigen Dateien der früheren nativen Zehn-Saisons-Abnahme sind bytegleich; geändert sind seitdem ausschließlich Versionsanzeige, Hilfedaten und Awardrenderer. Die native Saison- und Mehrjahresprüfung ist zusätzlich im Produktionslauf enthalten. Das lokale SSL-Problem betraf ausschließlich einen Offline-Auslieferungstest, dessen TLS-Kontext nun wie beim vorhandenen HTML-Test isoliert ist. Produktiver FTPS-Code ist unverändert. Der erste Produktionslauf wurde vor Build/Upload gestoppt, weil der Vertragstest eine lokale QA-Datei voraussetzte. Dieser Test erzeugt jetzt seine vollständige abgeschlossene Saison in einem unabhängigen Harness im Speicher und besteht erneut; keine Produktänderung. Der zweite Produktionslauf und die Live-Abnahme sind erfolgreich abgeschlossen. Vorherige verifizierte Live-HTML ist lokal als Rückfallstand gesichert; unveränderte Unityassets bleiben über den Release-121-Manifeststand verfügbar.


## Veröffentlichung und Live-Abnahme

Der [Produktionslauf 38093065856](https://github.com/thealextd1337-spec/FM/actions/runs/38093065856) für Commit `c0f7a458973d2ae67cc7c8a23c1869f4d0b1c2c8` ist erfolgreich: 106 Produktionskommandos, Einzeldatei-Build, Unity-Auslieferung mit öffentlicher Hashprüfung und danach HTML-Upload. Quelle, beide Builddateien und tatsächliche Live-Seite zeigen Version 122. HTML-SHA-256: `012d5247313adc52b058d1c063158c8212b60b29949a3165839aea1ae597ce58`. Vier WebGL-Dateien, Runtime-HTML/-JS und Manifest sind bytegleich mit dem geprüften Kandidaten; Unity-Quellenkennung bleibt aus Release 121 erhalten.

Zwei echte Live-Browserfälle bei 390/1440 Pixeln bestätigen regulären Zwölf-Länder-Start, 192 Vereine, Innsbruck Sport, Sponsor-/Marktfortschritt, sechs Karrierebereiche, Deutsch/Englisch, Crown und Horizon, gespeicherte Archivstatistiken, höchstens drei Saisonmomente und unveränderte Länderwerte nach Neuladen. Alle 128 eingebetteten transparenten WebP-Varianten dekodieren fehlerfrei. Eine bestehende 48er-Welt bleibt validierbar und beim Rendern unverändert.

Eine separate native Live-Partie besteht nichttriviale Pause und echtes Neuladen mit identischer Spielzeit, Ergebnis, Spieler-IDs und Buchungsdaten. Fortsetzung endet regulär, Ergebnis wird genau einmal verbucht und die gespeicherte Welt bleibt gültig. Keine Browserfehler oder fehlenden Netzdateien. Quellen und Build sind nach der Abnahme unverändert.

[Produktionsnachweis](../outputs/release-122/deployment.json), [öffentliche Dateiprüfung](../outputs/release-122/live-hashes.json), [Live-Browserfälle](../outputs/release-122/live-browser.json), [native Live-Fortsetzung](../outputs/release-122/browser-current.json). Die oben dokumentierten Grenzen der physischen Android-Abnahme bleiben bestehen.
