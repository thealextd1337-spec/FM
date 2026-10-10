# Release 120 – mobile Statistikranglisten

Stand: 10. Oktober 2026. Auf Nutzerauftrag veröffentlicht und auf der tatsächlichen Live-Seite abgenommen. [Doppel 6 live](https://fussball.cakamper.at/).

## Umfang

Statistikranglisten der Vereinswelt verwenden auf Bildschirmen bis 900 Pixel Breite kompakte Zeilen mit Rang links, Spieler/Flagge und Verein in der Mitte sowie Statistikwert rechts. Wiederholte Feldüberschriften entfallen visuell; Tabellenrollen und Spaltenüberschriften bleiben erhalten. Lange Namen umbrechen, Spielerlinks behalten mindestens 44 Pixel Höhe. Liga, Pokal und Europacup verwenden denselben vorhandenen Ranglistenrenderer. Keine Berechnungs-, Speicher- oder Matchänderung. [Details und lokale Nachweise](ui-redesign/mobile-statistics.md).

Quellseite, Footer, DE/EN-Systemhilfe und Einzeldateien tragen Version 120. Die eingefrorene Unity-Laufzeit von Release 119 wird unverändert weiterverwendet; die begonnenen Claude-Animationsänderungen liegen in einem anderen Arbeitsbaum und sind nicht enthalten.

## Prüfung und Grenzen

28 gezielte Layoutfälle über sieben Breiten, zwei Farbschemata und zwei Sprachen bestanden; alle sechs Kategorien und lange Namen geprüft. Auf der echten Quellseite sind Rangliste und Profilklick geprüft. Bei 412 Pixel Breite sinkt eine normale Zeile von 192,53 auf 77,80 Pixel Höhe. Bestehende U01-D-Wettbewerbsprüfung mit 18 Fällen, Statistikmenü, Wettbewerbe, Footer und DE/EN-Systemhilfe bestanden. Regulärer Build mit 26 exakt eingebetteten Flutlicht-Dateien sowie vier FTPS- und sechs Unity-Deploymenttests bestanden.

## Veröffentlichung und Live-Abnahme

Der [Produktionslauf 38042109660](https://github.com/thealextd1337-spec/FM/actions/runs/38042109660) für Produktcommit `4dee33b512e944f86e34a542db7424db7f403955` ist erfolgreich abgeschlossen: 94 Produktionskommandos, Einzeldatei-Build, Unity-Auslieferung vor der neuen Spielseite und FTPS-Upload mit Live-Dateiprüfung. Produktquellen, Build und Workflow blieben während der Abschlussabnahme eingefroren.

Quellseite, Footer, DE/EN-Systemhilfe, Build und Live-Seite tragen Version 120. Beide lokalen HTML-Dateien sind identisch; die frisch mit `Cache-Control: no-cache` geladene Live-Datei hat ebenfalls 50.874.506 Bytes und SHA-256 `10544c64fd8c8696c85e842ba70595c866ae921e86db9fb4a1bea742a869d0ad`. Unity-Manifest, alle vier Builddateien und beide iframe-Dateien stimmen ebenfalls bytegenau überein. Unity-Quellenkennung bleibt `00700557d9800dc579ee021530d76b316eee9cba0498b153aaae07a5cb9d271a`, Manifest-SHA-256 bleibt `832f4c33f46010fa6d59d3723ccc51fa09d414a55cccbd2e53d67e88ba6b0fc7`. [URLs, Dateihashes, Größen und CI-Schritte](../outputs/release-120/live-hashes.json).

Auf der tatsächlichen Live-Seite bestanden acht Browser-Layoutfälle: 320, 412, 844 und 1280 Pixel, jeweils Hell/Dunkel. Alle 18 Liga-/Pokal-/Europacup-Kategorien waren sichtbar: 144 Kategorieprüfungen und 608 gemessene Zeilen. Mobile Spaltenanordnung, Spielerlinks mit mindestens 44 Pixel Höhe und fehlender horizontaler Überlauf bestätigt; Profilklick und unveränderter Karrierezustand bestanden, keine Browserfehler. Die eigene flüchtige Testkarriere verwendete gezielt gesetzte Statistikwerte und einen langen Namen. Bei 412 Pixeln ist dessen Zeile 79,58 Pixel hoch. [Browserergebnis](../outputs/release-120/live-browser.json), [Veröffentlichungsnachweis](../outputs/release-120/publication.json).

Der erste Live-QA-Lauf maß auch durch die voreingestellten Filter ausgeblendete Kategorien mit Höhe null und scheiterte deshalb an der 44-Pixel-Prüfung. Das eigene QA-Script wählt nun über die echten Filter „Alle Wettbewerbe“ und „Alle Kategorien“; sämtliche Sichtbarkeits-, Höhen- und Layoutbedingungen bleiben erhalten. Keine Produktänderung.

Der alte `U01-D/source-check.cjs` findet am ersten Own-Selektor null statt neun Tabellenüberschriften. Derselbe Fehler tritt mit der ursprünglichen und der korrigierten CSS-Datei auf; der gezielte Quellseitennachweis ist separat. Die physische Android-Abnahme übernimmt der Nutzer; ihr Ergebnis steht noch aus. Browser-Viewportprüfungen sind kein physischer Android-Nachweis. Vollständige native/Unity-Partien wurden für diesen reinen CSS-Release nicht zusätzlich live wiederholt; die unveränderte Laufzeit ist durch Dateihashes belegt.
