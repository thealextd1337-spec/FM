# Mobile Statistikranglisten

Stand: 10. Oktober 2026. Lokal umgesetzt und gebaut; Veröffentlichung als Release 120 auf Nutzerauftrag gestartet.

Die allgemeine mobile Tabellenansicht teilte jede Ranglistenzeile in eine große Karte mit wiederholten Überschriften. Die Wettbewerbsoberfläche verwendet für ihre Ranglisten bis 900 Pixel Breite jetzt drei Spalten: Rang, Spieler/Verein und Statistikwert. Der Verein steht unter dem Spielernamen; lange Namen umbrechen vollständig. Flaggen sind mittig ausgerichtet, Spielerlinks bleiben mindestens 44 Pixel hoch. Tabellenrollen und Spaltenüberschriften bleiben erhalten, ebenso eigene Vereinsmarkierung, Kategorieauswahl und Profilaktionen. Desktop, Berechnungen und gespeicherte Daten bleiben unverändert.

## Prüfung

- 28 Browser-Layoutfälle: 320, 390, 412, 448, 844, 931 und 1280 Pixel; Hell/Dunkel und DE/EN, alle sechs Kategorien, lange Namen und Vereinsnamen. Kein horizontaler Überlauf, keine verdeckten Werte. [Messungen und Quellenhashes](../../outputs/ui-redesign/mobile-statistics-20261010/checks.json).
- Echte Quellseite mit eigener Testkarriere und Profilklick geprüft. Bei 412 Pixel Breite sinkt die erste Zeile von 192,53 auf 77,80 Pixel Höhe. [Quellseitenprüfung](../../outputs/ui-redesign/mobile-statistics-20261010/source-checks.json).
- Bestehende U01-D-Wettbewerbsprüfung `work/ui-redesign/packages/U01-D/check.cjs` bestanden. Regulärer Einzeldatei-Build und exakte Einbettung aller 26 Flutlicht-Dateien geprüft; beide Offline-Dateien stimmen überein.
- Der ältere `U01-D/source-check.cjs` erwartet neun Tabellenüberschriften unter seinem ersten Own-Selektor, findet dort aber null. Derselbe Fehler ist auf der echten Seite mit der ursprünglichen CSS-Datei und mit der Korrektur nachgewiesen. Er ist kein bestandener Gesamtnachweis; die gezielte Quellseitenprüfung oben ist separat.

Die Bildschirmprüfungen verwenden Desktop-Chromium mit mobilen Viewports. Ein physischer Android-Nachweis ist damit nicht erbracht; der Nutzer prüft den Live-Stand auf Android selbst. Der eingefrorene Unity-Build aus Release 119 wird unverändert weiterverwendet.
