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

Vorbereitet als Version 128. Deployment und Live-Abnahme werden nach Abschluss hier ergänzt.
