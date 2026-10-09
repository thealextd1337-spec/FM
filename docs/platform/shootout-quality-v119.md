# Elfmeterschießen: Fähigkeiten in KI-Partien, Releasekandidat 119

Lokaler Quellstand, noch keine Veröffentlichung. `dist/world-competition-v62.js` ersetzt bei neu aufgelösten unentschiedenen Pokal-/Europacup-Einzelspielen und ausgeglichenen Europacup-Rückspielen die bisherigen gleichverteilten Endergebnisse durch tatsächliche simulierte Schüsse. Bereits vorhandene `result.penalties`, einschließlich sichtbarer eigener Elfmeterschießen, bleiben unverändert. Keine Nachberechnung abgeschlossener Ergebnisse, Kadererzeugung oder Spielstandmigration.

## Gemeinsame Berechnung

Die Simulation verwendet die tatsächlich geladene Funktion `v42PenaltyChance` und `v42Sorted` aus `penalties-v42.js`. Die Quellseite lädt `strength-v55.js`; die historische Umrechnung in `strength-v53.js` ist hier nicht aktiv. Es gibt keine zweite Chancenformel und keinen zusätzlichen Frische-/Formabzug.

Die gemeinsame Chance ist intern auf 25–90 Prozent begrenzt: Ausgangswert 0,50; Abschlussabweichung von 12 × 0,025; Schützenruheabweichung × 0,015; Form × 0,02; fehlende Frische × −0,0012; Tormannspielabweichung × −0,015; Tormannruheabweichung × −0,005. Der separate Root-Eingriff in `v42Composure` verwendet gespeicherte `calm`, sofern vorhanden; ohne diesen Wert bleibt die bisherige explizite oder aus Identität/Alter abgeleitete Ruhe bestehen. Die öffentliche Darstellung erhält keine exakten Fähigkeitswerte.

Die aufgelöste Mannschaft stammt aus den gespeicherten Startspielern und den tatsächlich ausgeführten Wechseln im `matchRecord`. Unbenutzte Ersatzspieler und ausgewechselte Spieler schießen nicht. Der tatsächlich eingewechselte Tormann zählt. Ohne Matchbericht darf die vorhandene Spielplanung verwendet werden; fehlende Spieler/Tormänner werden nicht erfunden. `v42Player` bekommt unabhängige flache Kopien, damit die bisherige Ruheableitung keine vorhandenen Kader verändert. Gespeicherte Fähigkeiten, aktuelle Form und Frische bleiben maßgeblich; keine zusätzliche effektive Fähigkeitsberechnung.

## Ablauf und Begrenzung

Für kompakte KI-Partien: fünf reguläre Schüsse je Seite, sofortige Entscheidung bei mathematisch uneinholbarem Vorsprung, danach vollständige Schusspaare bis zur Entscheidung. Alle sechs beziehungsweise sieben tatsächlich berechtigten Spieler einschließlich Tormann kommen zum Zug, bevor jemand erneut schießt. Dieselbe Regel gilt für Heim- und Auswärtsseite. Der Zufallsgenerator verwendet ausschließlich Weltseed und Spielkennung; kein globaler Zufallszustand oder UI-Zufall.

Nach 100 zusätzlichen unentschiedenen Paaren wird einmal ein entscheidendes Paar aus derselben Chancenverteilung bedingt auf unterschiedliche Ergebnisse gezogen: Heim-Treffer/Auswärts-Fehlschuss hat Gewicht `pHome * (1-pAway)`, das umgekehrte Ergebnis `(1-pHome) * pAway`. Dadurch endet auch ein pathologischer Zufallsverlauf spätestens nach 212 Schüssen ohne künstlichen zusätzlichen Torpunkt oder Heimvorteil. Dieser sehr seltene Grenzfall überspringt weitere Gleichstände; er ist ausdrücklich keine unbegrenzte Wiederholung identischer Zufallsziehungen.

Der sichtbare eigene Ablauf bleibt bestehen und verwendet bereits dieselbe Chancenfunktion; seine bisherige Anzahl regulärer Schützen wird durch diesen KI-Eingriff nicht geändert. Die lokalen internen Schussbeobachtungen dienen der Prüfung; das bestehende Ergebnisfeld speichert weiterhin nur den Endstand. Vorhandene Spielerstatistiken werden durch diese begrenzte Änderung nicht zusätzlich nachgebucht.

## Nachweise

`node work/test-shootout-quality-v119.cjs` benötigt Node 20+, keinen Browser. Zwölf Prüfgruppen verwenden die tatsächlichen Produktionsfunktionen:

- Endaufstellung einschließlich Feldspieler-/Tormannwechsel; keine unbenutzten Ersatzspieler.
- Tatsächliche gemeinsame Chancen für Abschluss, Tormannspiel, Ruhe, Form und Frische; keine Änderung alter Kader durch fehlende Ruhe.
- JSON-Fortsetzung und Wiederholung für sechs/sieben Spieler, frühe Entscheidung, tatsächlich wechselnde Schützen, Sudden Death und beide Seiten des bedingten Grenzfalls.
- Beide Auflösungswege, Erhalt vorhandener Ergebnisse und keine Elfmetersimulation bei entschiedenem Normal-/Gesamtergebnis.
- Vier Szenarien mit je 1.000 Weltseeds durch den tatsächlichen Auflösungsweg: schwacher/starker Heimabschluss und schwacher/starker Auswärtstormann.

Die beobachtete Heim-Trefferquote steigt beim Abschlussvergleich von 31,1 auf 60,9 Prozent; die Heim-Siege steigen von 301 auf 738. Gegen den stärkeren Tormann sinkt die Trefferquote von 54,2 auf 37,2 Prozent; Heim-Siege sinken von 633 auf 385. Diese Szenarien halten übrige Fähigkeiten und Zustände konstant. Sie sind ein Wirksamkeitsnachweis, keine allgemeine Balancekalibrierung.

Messwerte und Quellhashes: `outputs/3d-quality/shootout-quality-v119/native.json`. Syntaxprüfung und zeilenendenbewusste Diffprüfung gehören zum lokalen Nachweis. Gemeinsame vollständige native Partien und Veröffentlichungsprüfungen erfolgen nach der getrennten Halbzeitkorrektur; alte Ergebnisdigests werden für diese absichtlich neuen Elfmeterschießergebnisse nicht als Sollparität behauptet.
