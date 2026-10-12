# Release 129 – Startstärken und Kaderrollen

Veröffentlichung auf Nutzerauftrag vom 12. Oktober 2026. Der Kandidat baut isoliert auf dem veröffentlichten Release 128 (`80b125b4`) auf. Dessen Navigation, Tastatur-/Fokuskorrekturen, UI und bisherige Spielstände bleiben erhalten. `freekickdemo/` und ein neuer Unity-Build gehören nicht zur Lieferung.

## Verhalten

Neue Karrieren erhalten elf Profis mit zwei Torhütern und je drei Spielern in Abwehr, Mittelfeld und Angriff, ausgewogenem Altersmix, gespeicherter Startschwankung und seltenen Elite-Spielern. Die Top 2 der großen Ligen stehen zu Beginn strikt über den Top 2 Österreichs, der Schweiz und der Türkei; ab ungefähr Platz drei überschneiden sich die Stärken. Reine Pokalvereine starten bei Kader und bester Startelf mindestens zehn Prozent unter allen Ligavereinen. Gut entwickelte Spieler gewichten das sportliche Niveau eines Zielvereins zusätzlich zu Gehalt und zugesagten Einsätzen.

Die vorhandene Einsatz-Zusage bestimmt Stammspieler, Rotation oder Ersatz. Neue Anfangsverträge verwenden normalerweise zehn, sechs oder zwei anrechenbare Einsätze. Rollen, tatsächliche Anrechnung, anteiliges Ziel, Rückstände und direkte Positionsreserve sind sichtbar. Die Vertragsauswahl benennt die Rolle; Rückstände gehören zum Handlungsbedarf. KI-Trainer berücksichtigen offene Zusagen bei ähnlich geeigneten Spielern. Bestehende Vertragszahlen und vorbereitete Aufstellungen werden nicht umgerechnet.

Enthalten ist außerdem die bereits geprüfte kompakte Matchabstimmung v178: erhöhte Torverwertung und kleiner Heim-Schussfaktor für neu begonnene kompakte Partien. Gespeicherte ältere Partien behalten ihre Regeln. Physische Spielaktionen werden dadurch nicht geändert.

[Vollständiger Fachvertrag und Stärkezusammensetzung](kadermechanik-und-matchagenda.md), [Startkader](startkader-umsetzung-v177.md), [Pokalabstand](startkader-pokalabstand.md), [kompakte Matchabstimmung](kompakte-matchabstimmung-v178.md). Die drei weiteren Matchdiagnosen bleiben dokumentierte offene Vorhaben.

## Abnahme

- Native Rollen-, Vertrags-, Transfer-, Speicher-, Form- und KI-Prüfungen sowie Legacy-Fortsetzung der kompakten Simulation.
- Stärkezusammensetzung: bestehender 60-Welten-Beleg und unabhängige 30-Welten-Messung; keine Jugendspieler in der Startkaderanalyse.
- Tatsächliche Quellen-/Buildoberfläche: DE/EN, Hell/Dunkel, Mobil/Desktop, Verlängerung, Handlungsbedarf und Neuladen. Vollständige physische 2D-Partien mit Halbzeit und JSON-Fortsetzung in getrennten Prüfprofilen.
- Aktuelle Produktionspipeline einschließlich der neuen Kader-/Matchregressionen; Upload erst nach erfolgreichen Prüfungen.
- Version 129 in Quellfuß, Laufzeitfuß und Build; anschließend öffentlicher Dateivergleich und tatsächliche Live-Funktionsprüfung.

Die endgültigen Produktions- und Live-Nachweise werden nach der Veröffentlichung ergänzt. Mobilgerätehardware und Unity-Leistung werden in diesem Release nicht neu gemessen.
