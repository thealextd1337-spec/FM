# Release 126 – vollständige Vereinswappen und mobile Sponsorbeträge

Alle 192 Teams geprüft: 144 hatten bereits Bildwappen, 48 zusätzliche Teams der ursprünglichen sechs Länder noch Platzhalter. Die fehlenden Motive sind jetzt individuell gestaltet, einschließlich Dortmund und Leeds sowie aller Pokalvereine. Die bisherigen 144 Bildwappen bleiben erhalten. [Quellen und Reproduktion](wappen-completion/README.md).

Sponsorangebote liefen bei 390 Pixeln intern über, obwohl die Seite keinen horizontalen Überlauf hatte. Lange Beträge vergrößerten die intrinsischen Grid-Spalten. Das flexible Raster stellt Betragsfelder in schmalen Karten untereinander dar. Ziele, Beträge, Auszahlungstermine und Spielstände bleiben unverändert.

## Prüfstand

Lokal bestanden: vollständige 192er-Abdeckung, 48 eindeutige neue Wappen, 288 PNG-Ressourcen, Farbmasken, Umfärbung, zugängliche Beschriftungen, SVG-Kennungen und Offline-Einbettung. Die bisherigen Prüfungen für 48 ursprüngliche Wappen, 96 neue Länderwappen, 36 Sponsoren und die Flutlicht-Anbindung bestehen ebenfalls.

Quellseite und regulärer Build bestehen jeweils 24 Browserfälle: 320/360/390/440/768/1440 Pixel, Deutsch/Englisch, Hell/Dunkel. Der Test reproduziert vorher den internen Kartenüberlauf bei 390 Pixeln. Alle Bonusziele bleiben sichtbar; Darstellung verändert den Weltzustand nicht. Keine Browserfehler. [Quellnachweis](../outputs/release-126/source-mobile.json), [Buildnachweis](../outputs/release-126/build-mobile.json).

Der reguläre Build ist 95.786.071 Byte groß. Haupt-/Detail-PNGs des ergänzten Sets verwenden kompakte Farbpaletten; unveränderte Originale bleiben unter `source/` erhalten. Version 126 steht im Quellfuß, Laufzeitfuß und Build. Auf Nutzerauftrag veröffentlicht: [Produktionslauf 38158645241](https://github.com/thealextd1337-spec/FM/actions/runs/38158645241) für Commit 16d1df745ca8dbdf440d926b7360a4927c06f875 erfolgreich. 106 Node-Kommandos, regulärer Build, Wappen-/Sponsorenprüfungen, Laufzeit-Upload und Dateiprüfung bestanden. [Produktionsnachweis](../outputs/release-126/production.json).

Live bestätigt: Fußversion 126; alle 192 Wappen erfolgreich als Bilder dekodiert, einschließlich Dortmund und Leeds. Kein fehlendes Vereinsmotiv. Zusätzlich alle 24 mobilen Sponsorprüfungen live bestanden, ohne Browserfehler oder Weltänderung. [Live-Wappen](../outputs/release-126/live-decoded.json), [Live-Layout](../outputs/release-126/live-mobile.json). Eingebettete PNGs werden in den Nachweisen durch ihren SHA-256-Hash dokumentiert.

Die Live-Datei ist mit dem lokalen Build bytegleich: 95.786.071 Byte, SHA-256 25efdec257f0d973b4cedf7630b89f6d6e1208f8f4b3bd81158596585a2e446b. [Live-Dateivergleich](../outputs/release-126/live-hash.json).
