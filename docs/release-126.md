# Release 126 – vollständige Vereinswappen und mobile Sponsorbeträge

Alle 192 Teams geprüft: 144 hatten bereits Bildwappen, 48 zusätzliche Teams der ursprünglichen sechs Länder noch Platzhalter. Die fehlenden Motive sind jetzt individuell gestaltet, einschließlich Dortmund und Leeds sowie aller Pokalvereine. Die bisherigen 144 Bildwappen bleiben erhalten. [Quellen und Reproduktion](wappen-completion/README.md).

Sponsorangebote liefen bei 390 Pixeln intern über, obwohl die Seite keinen horizontalen Überlauf hatte. Lange Beträge vergrößerten die intrinsischen Grid-Spalten. Das flexible Raster stellt Betragsfelder in schmalen Karten untereinander dar. Ziele, Beträge, Auszahlungstermine und Spielstände bleiben unverändert.

## Prüfstand

Lokal bestanden: vollständige 192er-Abdeckung, 48 eindeutige neue Wappen, 288 PNG-Ressourcen, Farbmasken, Umfärbung, zugängliche Beschriftungen, SVG-Kennungen und Offline-Einbettung. Die bisherigen Prüfungen für 48 ursprüngliche Wappen, 96 neue Länderwappen, 36 Sponsoren und die Flutlicht-Anbindung bestehen ebenfalls.

Quellseite und regulärer Build bestehen jeweils 24 Browserfälle: 320/360/390/440/768/1440 Pixel, Deutsch/Englisch, Hell/Dunkel. Der Test reproduziert vorher den internen Kartenüberlauf bei 390 Pixeln. Alle Bonusziele bleiben sichtbar; Darstellung verändert den Weltzustand nicht. Keine Browserfehler. [Quellnachweis](../outputs/release-126/source-mobile.json), [Buildnachweis](../outputs/release-126/build-mobile.json).

Der reguläre Build ist 95.786.071 Byte groß. Haupt-/Detail-PNGs des ergänzten Sets verwenden kompakte Farbpaletten; unveränderte Originale bleiben unter `source/` erhalten. Version 126 steht im Quellfuß, Laufzeitfuß und Build. Produktionslauf und Live-Abnahme folgen vor Abschluss.
