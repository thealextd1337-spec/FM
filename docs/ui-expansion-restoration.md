# Vertraute Oberfläche der erweiterten Vereinswelt

Die Ligaerweiterung hatte die gewohnte Flutlicht-Oberfläche für Expansionskarrieren abgeschaltet und den Karriere-Renderer umgangen. Dadurch fehlten eigenständige Kader-, Transfer- und Statistikbereiche; Vereinsinformationen waren hinter einem zusätzlichen Profilknopf verborgen. Auf Nutzerauftrag wird die bisherige Oberfläche wieder angebunden.

## Verhalten

- Die vorhandenen Hauptbereiche Übersicht, Kader, Matchplan, Transfers, Wettbewerbe, Kalender, Statistik, Verein sowie Hilfe und Einstellungen verwenden wieder dieselbe Gestaltung, Navigation und Bedienelemente wie vor der Ligaerweiterung.
- Kader, Verträge und Nachwuchs sowie Spielersuche, Vereinsangebote, eigene Transferliste, Verhandlungen und Transferbilanz sind wieder direkt über ihre Unterbereiche erreichbar. Der Länderfilter für Vereinsangebote berücksichtigt alle zwölf Länder.
- Wettbewerbe haben Unterbereiche für Liga, nationalen Pokal, Crown Cup, Horizon Cup, andere Länder, Länderwertung und Titelarchiv. Beide internationalen Wettbewerbe behalten ihre tatsächlichen Formate und getrennten Identitäten. Kalender und Statistik bieten passende Wettbewerbsfilter.
- Vereinsprofil, Finanzen, Sponsor, Chronik/Erfolge und Managerlaufbahn verwenden die vorhandenen Ansichten. Das gespeicherte Vereinsbüro und höchstens drei Saisonmomente ergänzen die Übersicht.
- Der vorhandene Saisonrückblick und Saisonwechsel sind wieder bedienbar; Crown und Horizon erscheinen getrennt mit ihren richtigen Trophäen. Gespeicherte Wettbewerbsstatistiken bleiben im Archiv sichtbar.
- Zwölf Länder, 192 Vereine, die bestätigten Spielregeln, Innsbruck Sport und die freigegebenen Wappen, Sponsoren und Trophäen bleiben erhalten. Die Korrektur betrifft die Darstellung und verwendet die vorhandenen Spielcontroller. Bestehende Spielstände sind auf Nutzerwahl keine Abnahmebedingung; keine zusätzliche Migration oder Nachberechnung.

## Umsetzung und Prüfung

`world-expansion-flutlicht-v175.js` liefert die Expansionsinhalte an den vorhandenen Karriere-Renderer. Der bisherige Sonderrenderer bleibt nur für historische Vorbereitungsstände zuständig. Der Flutlicht-Adapter nimmt reguläre Expansionskarrieren wieder an; die Unterbereiche werden anhand der tatsächlichen Wettbewerbskennungen zusammengestellt. Änderungen an `world-youth-ui-v67.js` betreffen die Darstellung beider internationaler Wettbewerbe im Rückblick.

Die fokussierte Regression `node work/test-world-expansion-flutlicht-v175.cjs` prüft getrennte Cup-/Wertungsbereiche, beide Statistikansichten und unveränderte Karrierefakten beim Lesen. Vorhandene Weltansichts-, Transferlisten-, Zahlungs- und AP09/AP10-Prüfungen ergänzen die Abnahme.

Die Browserprüfung läuft über den regulären Spielstart bei 390 und 1440 Pixeln in Deutsch und Englisch: alle Haupt-/Unterbereiche, Sponsorwahl, Jugendförderung, fünf Transfertage, Neuladen und native Spielvorbereitung. Sie prüft außerdem den vierseitigen Saisonrückblick, Saison 2, beide Titelarchive und gespeicherte Cupstatistiken. Voraussetzung für den Saisonprüfstand ist `node work/test-world-expansion-presentation-v172.cjs`.

```text
node work/check-expansion-flutlicht-v175.cjs
node work/build.cjs
node work/check-expansion-flutlicht-v175.cjs --build
node work/ui-redesign/shared/verify-build.cjs
```

Die Einzeldatei wird für die Abnahme über HTTP gestreamt. Die Übertragung ihrer rund 92 MB mit Playwright `route.fulfill` schloss den Browser beim Laden; regulärer HTTP-Abruf funktioniert. Quelle, gebaute Einzeldatei und Veröffentlichung sind getrennte Nachweise. Die ursprünglichen lokalen Berichte und Ansichten stehen unter `outputs/ui-restore/`; der abschließende veröffentlichte Stand 125 ist unter `outputs/release-125/` dokumentiert.

Lokale Abnahme bestanden: beide Browserberichte bestätigen 390/1440 Pixel, Deutsch/Englisch, sämtliche Haupt- und Unterbereiche, Matchvorbereitung, vier Rückblickseiten, Saison 2, beide Cuparchive und den erneuten regulären Karrierebeginn. Die Einzeldateien sind identisch; alle 26 Flutlicht-Assets sind exakt eingebettet. Die native Matchlogik und die Expansionsregeln/-wirtschaft bleiben bytegleich zum Ausgangsstand. Veröffentlichung zusammen mit den Layoutkorrekturen in [Release 125](release-125.md).
