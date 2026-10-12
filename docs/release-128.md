# Release 128: kompakte Vereinsoberfläche und Subnavigation

Nutzerauftrag vom 12. Oktober 2026: die Astra-Vorschläge umsetzen, mobile Tabellen verdichten, die Namenssuche im Kader entfernen, kontextabhängige Subnavigation einbauen, redundante Navigationsfeatures entfernen und veröffentlichen.

Die Unterbereiche von Kader, Transfers, Wettbewerben und Verein stehen in einer gemeinsamen unteren Leiste. Mobil liegt sie direkt oberhalb der Hauptnavigation; am Desktop ergänzt sie die Seitenleiste. Die Übersicht bietet Begegnung, Vereinsbüro und Finanzen als Sprungziele. Lange Leisten können horizontal gescrollt werden. Es gibt keine zusätzlichen Bereichs-Dropdowns oder Transfer-Sprunglisten. Die ursprünglichen Tabknoten mit ihren Aktionen, Tastaturwegen und ARIA-Verknüpfungen werden verschoben, nicht kopiert. Inaktive Leisten bleiben verborgen und unerreichbar; Profilrückwege und fachliche Filter bleiben vorhanden.

Enthalten sind die kompakte Begegnung, Karriereendhinweise mit Namen und Vertragslink im Büro, die mobile Reihenfolge Begegnung → Büro, Kader-/Profilgestaltung, Vertragsfilter „Handlungsbedarf“, kompakte Transferfilter und mobile Tabellen mit allen ursprünglichen Werten. Fähigkeiten erscheinen ausschließlich als Farbstufen. Neue Karrieren starten auf dem Standardfeld mit fünf Feldspielern plus Torwart; vorhandene Karrieren behalten ihre Regeln.

Der Release wird isoliert von `origin/main` (Release 127, `bd7ad964`) gebaut. Parallel bearbeitete Startkader-, Jugend- oder Transferregeln werden nicht übernommen. `freekickdemo/` bleibt außerhalb des Releases.

## Prüfung

- `node work/check-ui-modernization.cjs` sowie `--build`: je 24 Bildschirmfälle, sämtliche Tabziele, Tastatur, Fokus, Scrollposition, feste untere Navigation, DE/EN, Hell/Dunkel, Mobil/Desktop, mögliche/bestätigte Abschiede und unveränderte Karrieredaten mit Speicherung/Neuladen. [Quelle](../outputs/ui-modernization/source/checks.json), [Build](../outputs/ui-modernization/build/checks.json).
- `node work/check-career-start-defaults.cjs`: echter Karrierestart auf Quelle/Build, entfernte Regelauswahl, Zusammenfassung, Rücknavigation, DE/EN, Speicherung/Export und Neuladen. [Nachweis](../outputs/career-start-defaults/checks.json).
- `node work/ui-redesign/packages/I00-save-check/check.cjs`: native Speicherung, Export/Import, Recovery und Fehlerfälle auf Quelle/Offline-Build.
- `node work/check-release-128.cjs`: alle Testkommandos der Produktionspipeline, einschließlich Wirtschafts-/Mehrjahresprüfungen und Deploymenttests. [Nachweis](../outputs/release-128/tests/checks.json).
- Unabhängige lesende Q01-Diffprüfung der Subnavigation; Buildgleichheit und anschließende Live-Prüfung sind Teil der Freigabe.

## Veröffentlichung

Veröffentlicht am 12. Oktober 2026: [Deployment 38249906943](https://github.com/thealextd1337-spec/FM/actions/runs/38249906943) zu Quellcommit `ae9932ffaa9573ebe05e1007c693f3e3b1d31f10` erfolgreich. Alle 111 lokalen Produktionskommandos bestanden; der erste lokale native Karrieretest erreichte nach fünf erfolgreichen Saisons die anfängliche Harness-Zeitgrenze von 300 Sekunden. Die Wiederholung bestand alle sechs Saisons; die serverseitige Prüfung bestand ebenfalls.

Quelle, beide Builds und Live-Seite zeigen Version 128. Die öffentliche Datei ist mit beiden Builds bytegleich: 95.840.954 Bytes, SHA-256 `e95a81711e77be78c2dfa1023be018d13ede6c0097957a9361e211f5b60ccbe3`. [Dateiprüfung](../outputs/release-128/live-bytes.json), [Deploymentnachweis](../outputs/release-128/deployment.json).

Auch `node work/check-ui-modernization.cjs --live` bestand alle 24 Live-Ansichtsfälle sowie Unterbereiche, Tastatur, Fokus, Scrollposition, Vertragsnavigation, Filter, native Sortierung und Speicherung/Neuladen ohne Karrieredatenänderung. Zusammen mit Quelle und Build sind 72 Bildschirmfälle bestanden. [Live-Prüfung](../outputs/ui-modernization/live/checks.json), [unabhängige Schlussprüfung](../outputs/release-128/review.json), [native Mehrjahresprüfung](../outputs/release-128/native-multiseason.json).
