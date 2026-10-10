# Mobile Statistikranglisten

Stand: 10. Oktober 2026. Als Release 120 auf Nutzerauftrag veröffentlicht und auf der tatsächlichen Live-Seite abgenommen. [Releasebericht](../release-120.md).

Die allgemeine mobile Tabellenansicht teilte jede Ranglistenzeile in eine große Karte mit wiederholten Überschriften. Die Wettbewerbsoberfläche verwendet für ihre Ranglisten bis 900 Pixel Breite jetzt drei Spalten: Rang, Spieler/Verein und Statistikwert. Der Verein steht unter dem Spielernamen; lange Namen umbrechen vollständig. Flaggen sind mittig ausgerichtet, Spielerlinks bleiben mindestens 44 Pixel hoch. Tabellenrollen und Spaltenüberschriften bleiben erhalten, ebenso eigene Vereinsmarkierung, Kategorieauswahl und Profilaktionen. Desktop, Berechnungen und gespeicherte Daten bleiben unverändert.

## Prüfung

- 28 Browser-Layoutfälle: 320, 390, 412, 448, 844, 931 und 1280 Pixel; Hell/Dunkel und DE/EN, alle sechs Kategorien, lange Namen und Vereinsnamen. Kein horizontaler Überlauf, keine verdeckten Werte. [Messungen und Quellenhashes](../../outputs/ui-redesign/mobile-statistics-20261010/checks.json).
- Echte Quellseite mit eigener Testkarriere und Profilklick geprüft. Bei 412 Pixel Breite sinkt die erste Zeile von 192,53 auf 77,80 Pixel Höhe. [Quellseitenprüfung](../../outputs/ui-redesign/mobile-statistics-20261010/source-checks.json).
- Bestehende U01-D-Wettbewerbsprüfung `work/ui-redesign/packages/U01-D/check.cjs` bestanden. Regulärer Einzeldatei-Build und exakte Einbettung aller 26 Flutlicht-Dateien geprüft; beide Offline-Dateien stimmen überein.
- [Produktionslauf](https://github.com/thealextd1337-spec/FM/actions/runs/38042109660) mit 94 Produktionskommandos, Build und beiden Upload-/Live-Prüfschritten erfolgreich. Live-Version 120 und alle acht HTML-/Unity-/iframe-Dateihashes stimmen mit dem eingefrorenen Produktcommit `4dee33b512e944f86e34a542db7424db7f403955` überein. [Hashnachweis](../../outputs/release-120/live-hashes.json).
- Acht echte Live-Browserfälle: 320/412/844/1280 Pixel, Hell/Dunkel, jeweils alle 18 Liga-/Pokal-/Europacup-Kategorien sichtbar; 144 Kategorieprüfungen und 608 Zeilen. Kein horizontaler Überlauf; mobile Spalten, mindestens 44 Pixel hohe Spielerlinks, langer Name, Profilaktion und unveränderte Karriere bestätigt. Keine Browserfehler. [Live-Browserergebnis](../../outputs/release-120/live-browser.json). Der QA-Runner wählt alle Wettbewerbe/Kategorien über die echten Filter, damit ausgeblendete Standardkategorien nicht mit Höhe null gemessen werden; keine gelockerten Prüfbedingungen oder Produktänderungen.
- Der ältere `U01-D/source-check.cjs` erwartet neun Tabellenüberschriften unter seinem ersten Own-Selektor, findet dort aber null. Derselbe Fehler ist auf der echten Seite mit der ursprünglichen CSS-Datei und mit der Korrektur nachgewiesen. Er ist kein bestandener Gesamtnachweis; die gezielte Quellseitenprüfung oben ist separat.

Die Bildschirmprüfungen verwenden Desktop-Chromium mit mobilen Viewports. Ein physischer Android-Nachweis ist damit nicht erbracht; der Nutzer prüft den Live-Stand auf Android selbst. Der eingefrorene Unity-Build aus Release 119 wird unverändert weiterverwendet.
