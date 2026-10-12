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

Mobilgerätehardware und Unity-Leistung werden in diesem Release nicht neu gemessen.

## Veröffentlichung und Live-Abnahme

Am 12. Oktober 2026 als Version 129 veröffentlicht: [Produktionslauf 38276353104](https://github.com/thealextd1337-spec/FM/actions/runs/38276353104) für Commit `d2b0b19be3ca604530b02613d1915830b00c80ac` vollständig erfolgreich. Die Produktionspipeline prüft 115 Kommandos sowie den Build und Upload. [Produktionsnachweis](../outputs/release-129/production.json).

Der erste Produktionslauf hielt vor dem Upload an: Die isolierte ältere Direkttransferprüfung lud den neuen Formularhelfer nicht. Der Prüflader verwendet jetzt die echten reinen Rollen-/Formularfunktionen. Die Spielregeln und der geprüfte Build blieben dabei unverändert. Alle 69 anschließenden lokalen Produktionskommandos inklusive Build bestehen ebenfalls. [Lokale Folgeprüfung](../outputs/release-129/remaining-gates.json).

Quelle, Laufzeitfuß, Hilfedaten, beide Builds und öffentliche Seite zeigen 129. Die öffentliche Datei ist bytegleich mit beiden Builds: 95.861.220 Bytes, SHA-256 `a3964c96ebd26f77905284ef785b96bb1c129123a7788c3e1dd8b721c3dad4e6`. [Dateivergleich](../outputs/release-129/live-hash.json), [gemeinsamer Browser](../outputs/release-129/live-preview.json).

Die Live-Funktionsprüfung besteht sechs DE/EN-/Bildschirmfälle bei 320/390/1280 Pixeln, Hell/Dunkel, tatsächliche Verlängerung mit Rollenwahl, Spielzeit-Handlungsbedarf und Neuladen. Die vollständige physische 2D-Livepartie erreicht Minute 100 mit Halbzeit, JSON-Fortsetzung und einmaliger Buchung. Der vollständige Zustandsvergleich `65541a03` ist mit Quelle und Build identisch. [Live-Abnahme](../outputs/release-129/live-squad/browser-checks.json).

[Spiel öffnen](https://fussball.cakamper.at/). Der vollständige veröffentlichte Quellstand liegt lokal im Checkout `work/release-129`; die parallelen Arbeitsstände wurden nicht überschrieben.
