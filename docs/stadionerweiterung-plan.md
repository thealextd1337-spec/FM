# Stadionerweiterung und feste Vereinszuordnung

Die nächste Low-Poly-Veröffentlichung verwendet die fünf bereits ausgearbeiteten Ligastadien als festen Bestand. Alle 96 Ligavereine erhalten daraus eine Zuordnung passend zu ihrer Vereinsgröße. Die zusätzlichen 91 individuellen Stadionentwürfe werden vorerst zurückgestellt. Heim- und Gästefanblöcke, Vereinsfarben, Fahnen, Tag und Nacht sowie verbesserte Schatten und Tornetze bleiben Teil des laufenden Releases.

Die spätere Erweiterung soll jedem Ligaverein ein eigenes, durch Klub, Land und Größe erkennbares Stadionbild geben. Sie betrifft den grafischen Stadionbestand; Karrierewirtschaft und Spielfeldregeln bleiben bei den vorhandenen Controllern. Nutzerentscheidung vom 13. Oktober 2026.

## Fester Stadionbestand für den nächsten Release

| Vorlage | Größenklasse | Erscheinungsbild | Geplante Ligavereine |
| --- | --- | --- | ---: |
| GER-1 | Groß | Geschlossene Arena mit mehreren Rängen und umlaufendem Dach | 14 |
| GER-2 | Mittel | Hafenstadion mit Tonnendächern und großer offener Heimtribüne | 16 |
| GER-3 | Mittel | Werftstadion mit Sägezahndächern und offenen Ecken | 11 |
| GER-5 | Mittel | Stadtstadion mit getrennten Tribünen und markanten Ecktürmen | 25 |
| GER-6 | Klein | Kompakter Vereinsplatz mit kurzer Haupttribüne und einfachen Terrassen | 30 |

Die fünf ursprünglichen Vereine behalten ihre eigene Vorlage. Andere Vereine teilen die passende Architektur. Sitzfarben, Banner, Fahnen und Fanblöcke tragen jeweils die tatsächliche Vereinsidentität. Geometrie und Umgebung bleiben vorerst Bestandteil der gewählten Vorlage; regionale Einzelentwürfe folgen im späteren Ausbau. Der Name des Vorlagenvereins wird nicht als Identität eines anderen Klubs angezeigt.

Pokalvereine verwenden weiterhin die vorhandenen Standardstadien mit passenden Vereinsfarben. Neutrale nationale und europäische Finals behalten ihre vorhandenen Finalarenen und gleichberechtigten Fanblöcke.

## Größenbestimmung und unveränderliche Zuordnung

Grundlage ist die feste Fanbasis des bestehenden [Vereinskatalogs](ligaexpansion-ap02.md). Sie beschreibt die Reichweite eines Vereins und passt damit besser zur Stadiongröße als seine aktuelle Tabellenposition oder Mannschaftsstärke.

Für die einmalige Zuordnung gilt: Fanbasis 5 erhält die große Arena; 3 und 4 erhalten ein mittleres Stadion; 1 und 2 erhalten den kleinen Vereinsplatz. Fanbasis 3 nutzt die Stadtstadion-Vorlage GER-5. Vereine mit Fanbasis 4 werden innerhalb jedes Landes einmal nach ihrer festen Vereinskennung geordnet und abwechselnd GER-2 oder GER-3 zugeordnet. Die ursprünglichen fünf Vorlagenvereine bleiben ausdrücklich bei ihrem Stadion.

Die vollständige [geplante Zuordnung aller 96 Ligavereine](stadion-zuordnung-geplant.json) enthält 14 große, 52 mittlere und 30 kleine Stadien. Opus übernimmt diese Tabelle in die Darstellung. Danach bleibt sie fest: Saisonergebnisse, Transfers, Budget, Karriere-Zufall und spätere Änderungen am Katalog berechnen sie nicht neu. Ein Wechsel erfolgt durch eine bewusste Änderung der Stadionzuordnung.

Die Darstellung benötigt dafür keine neuen Spielstandfelder. Heimverein, Vereinsfarben und Fanrollen stammen aus den vorhandenen Matchdaten. Speichern, Laden, Halbzeit und Rückschau behalten dieselbe Zuordnung.

## Abnahme des laufenden Umfangs

Vor Veröffentlichung müssen die folgenden Bedingungen erfüllt sein:

- Alle 96 Ligavereine sind genau einer der fünf Vorlagen zugeordnet; Größenklasse und feste Tabelle stimmen überein.
- Heim- und Auswärtsspiele wählen dasselbe Heimstadion unabhängig davon, welchen Verein der Spieler steuert. Pokalvereine und neutrale Finals wählen ihre vorgesehenen Stadien.
- Vereinsfarben und Fanrollen bleiben auch bei Ausweichtrikots korrekt. Fahnen und Jubel folgen der empfangenen Matchzeit und bleiben bei Pause und Rückschau reproduzierbar.
- Tag und Nacht sind in normalen Matchkameras klar erkennbar. Europacup-Partien bleiben Nachtspiele.
- Kleine und große Felder, beide Mannschaftsgrößen sowie Standard und Reduziert erhalten freie Sicht auf Ball und Spieler.
- Der tatsächliche WebGL-Build besteht Browser- und Android-Prüfung. Leistung, Speicher, sichtbare Fanblöcke und Wiederaufnahme werden im laufenden Spiel gemessen.
- Bewegungs- und Kontaktprüfungen sowie native Ergebnisse bleiben unverändert. Quellcode, Git, Build, Versionsnummer und Live-Dateien entsprechen bei Veröffentlichung demselben Stand.

Der bisherige Prototyp besteht 583 Profil-, 1.627 Architektur- und 613 Fanblockprüfungen in Unity. Die erste Galerie umfasst 127 kontrollierte Ansichten. Die neue feste Zuordnung und die laufenden Korrekturen werden anschließend erneut geprüft; diese bisherigen Ergebnisse ersetzen ihre Abnahme nicht.

## Spätere individuelle Stadionerweiterung

Der weitere Ausbau beginnt mit einem Vereinsinventar: bestehende Zuordnung, Vereinsgröße, Stadt, Land, Vereinsgeschichte, Farben und prägende Architekturmerkmale. Daraus entstehen konkrete Entwürfe, die sich auch ohne Namen und Farben unterscheiden.

Die Erweiterung erfolgt in kleinen Gruppen:

1. **Länderbeispiele ausarbeiten.** Zunächst je ein kleines, mittleres und großes Beispiel in ausgewählten Ländern ergänzen. Tribünen, Dächer, Fassaden und Umfeld bilden erkennbare regionale Unterschiede.
2. **Ähnliche Vereine unterscheiden.** Innerhalb eines Landes vergleichbar große Klubs durch Standformen, Dachkonstruktion, Ecken, Zugänge und markante bauliche Elemente auseinanderhalten. Zufällige Detailpositionen erfüllen diese Anforderung nicht.
3. **In echten Matchkameras prüfen.** Jede Gruppe bei Tag und Nacht, auf Mobilgeräten und mit reduzierter Qualität vergleichen. Merkmale müssen in den tatsächlich sichtbaren Ansichten wirken.
4. **Freigegebene Einzelstadien zuordnen.** Neue Profile ersetzen gezielt einzelne Einträge der festen Tabelle. Vereine ohne Einzelstadion behalten ihre bisherige Vorlage.
5. **Den Bestand vervollständigen.** Die Gruppen fortsetzen, bis alle 96 Ligavereine individuell gestaltet sind. Die vorhandenen fünf Entwürfe zählen dazu; Pokal-Standardstadien bleiben zulässig.

Die Reihenfolge richtet sich nach Wiederholungen im sichtbaren Bestand: zuerst Vereine, die dieselbe Vorlage häufig teilen, und Länder mit deutlich anderer Architektur. Der Start dieser weiteren Autorenschaft folgt einem neuen Auftrag; aktuell wird nur der bestehende Bestand eingesetzt.

## Qualitätsmaßstab für neue Einzelstadien

Ein eigenes Stadion muss seine Größenklasse erkennen lassen und mehrere bewusst gestaltete bauliche Unterschiede besitzen. Bei ähnlich großen Vereinen desselben Landes sollen mindestens sechs strukturelle Merkmalsgruppen und davon mindestens drei Merkmale der Silhouette abweichen. Farben, Vereinskennungen, Namen und Zufallswerte zählen dabei nicht als bauliche Unterschiede.

Besondere Fanblöcke gehören zur Vereinsidentität. Neue Dächer und Ecken dürfen ihre Sichtbarkeit und die Matchkamera nicht unbeabsichtigt verschlechtern. Anzahl und Größe der Fahnen bleiben an den gemessenen Browser- und Gerätebudgets orientiert.

Opus 5.5 mit maximaler Denkintensität gestaltet und implementiert neue Stadien. Sonnet prüft Zuordnung, Geometrie, Regressionen und Nachweise unabhängig. Haiku kann Inventare und Zuordnungstabellen prüfen. Fable untersucht größere reproduzierbare Probleme. Eine zuständige Instanz integriert Änderungen und führt Unity-Builds seriell aus.

## Erweiterungsdaten je Verein

Für jedes spätere Einzelstadion werden Vereinskennung, Größenklasse, bisherige Vorlage, Land und Stadt sowie Standformen, Dächer, Ecken, Fassade, Umfeld, markante Bauteile und Fanblockanordnung festgehalten. Hinzu kommen Vergleichsbilder in den Matchkameras, Prüfungen beider Qualitätsstufen und gemessene Laufzeitbudgets.

Neue Vorlagen oder Einzelprofile verändern die Zuordnung nur für ausdrücklich benannte Vereine. Bis eine neue Variante die Qualitätsprüfung besteht, bleibt die vorhandene Zuordnung gültig.
