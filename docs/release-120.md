# Release 120 – mobile Statistikranglisten

Stand: 10. Oktober 2026. Auf Nutzerauftrag zur Veröffentlichung vorbereitet; Live-Abnahme folgt separat.

## Umfang

Statistikranglisten der Vereinswelt verwenden auf Bildschirmen bis 900 Pixel Breite kompakte Zeilen mit Rang links, Spieler/Flagge und Verein in der Mitte sowie Statistikwert rechts. Wiederholte Feldüberschriften entfallen visuell; Tabellenrollen und Spaltenüberschriften bleiben erhalten. Lange Namen umbrechen, Spielerlinks behalten mindestens 44 Pixel Höhe. Liga, Pokal und Europacup verwenden denselben vorhandenen Ranglistenrenderer. Keine Berechnungs-, Speicher- oder Matchänderung. [Details und lokale Nachweise](ui-redesign/mobile-statistics.md).

Quellseite, Footer, DE/EN-Systemhilfe und Einzeldateien tragen Version 120. Die eingefrorene Unity-Laufzeit von Release 119 wird unverändert weiterverwendet; die begonnenen Claude-Animationsänderungen liegen in einem anderen Arbeitsbaum und sind nicht enthalten.

## Prüfung und Grenzen

28 gezielte Layoutfälle über sieben Breiten, zwei Farbschemata und zwei Sprachen bestanden; alle sechs Kategorien und lange Namen geprüft. Auf der echten Quellseite sind Rangliste und Profilklick geprüft. Bei 412 Pixel Breite sinkt eine normale Zeile von 192,53 auf 77,80 Pixel Höhe. Bestehende U01-D-Wettbewerbsprüfung bestanden. Regulärer Build und exakte UI-Einbettung werden für den endgültigen Versionsstand erneut geprüft.

Der alte `U01-D/source-check.cjs` findet am ersten Own-Selektor null statt neun Tabellenüberschriften. Derselbe Fehler tritt mit der ursprünglichen und der korrigierten CSS-Datei auf; der gezielte Quellseitennachweis ist separat. Die Geräteabnahme auf dem Pixel ist weiterhin auf Nutzerwunsch verschoben. Browser-Viewportprüfungen sind kein physischer Android-Nachweis.
