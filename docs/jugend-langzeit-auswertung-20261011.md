# Nachwuchs und Kaderqualität über 20 Saisons

**Historische Quelle — inaktiv.** Einordnung vom 13. Oktober 2026: Der folgende Text dokumentiert den damaligen Auftrag, Entwurf oder Prüfstand. Alte Startprompts, Modellzuweisungen, Worktreepfade und Folgevorschläge starten keine weitere Arbeit. Aktueller Umfang und Implementierungsstand stehen in [Entscheidungen](entscheidungen.md), [Produktregeln](product.md) und [Release 131](release-131.md). Fachliche Präferenzen, nicht verworfene Ideen und historische Messwerte bleiben als Referenz erhalten.

Stand: 11. Oktober 2026. Lokale, reproduzierbare Auswertung des eingefrorenen Zwölf-Länder-Spielerstands aus `work/ligaexpansion-ap03/dist/`. Drei unabhängige Karrieren (`youth20-a`, `youth20-b`, `youth20-c`), je 20 vollständige Saisons, insgesamt **59.460 tatsächlich kompakt simulierte und verbuchte Partien**. Keine Produktregeln geändert und keine Veröffentlichung.

## Ergebnis

Die mittlere dauerhafte Kaderqualität der 95 KI-Ligavereine je Welt liegt nach Saison 20 **+3,1 % gegenüber ihrem eigenen Startstand**. Die nach einheitlicher Formation gewählte KI-Aufstellung liegt bei **+5,0 %**. Die drei Welten liegen beim gesamten Kader zwischen +1,9 % und +4,4 %.

Das ist ein Mittel über unterschiedliche Vereinsentwicklungen: Von 285 Vergleichen desselben Vereins innerhalb derselben Welt sind 154 stärker, 129 schwächer und 2 annähernd unverändert (Toleranz 0,1 Prozent). Die Ländertabelle unten zeigt die jeweiligen Mittel, keine Garantie für jeden Verein.

Der Generationswechsel ist dabei noch nicht vollständig: 20,3 % der Endkader gehören weiterhin zur Startgeneration. Der älteste aktive Ligaspieler ist 53 Jahre alt. Für Ligaprofis fehlt der bei reinen Pokalvereinen vorhandene feste Karriereendpfad. Das ist eine wesentliche Grenze für die Interpretation als langfristige Nachwuchswelt.

Jugendspieler entwickeln sich durch Einsätze deutlich. Die anfängliche Länderdifferenz bleibt im Test jedoch nicht erhalten: Stufe A startet mit +5,2 % gegenüber D; nach zehn Saisons sind es -1,3 % und nach 20 Saisons -4,5 %. Diese Angabe vergleicht die mittlere Kaderqualität beider Gruppen; Europacupergebnisse folgen zusätzlich Aufstellungen, Taktik und Matchverlauf.

## Messung und Grenzen

Gemessen wird der bestätigte gewichtete Mittelwert der dauerhaften Grundfähigkeiten auf der Hauptposition eines Spielers. Ein Verein erhält den Mittelwert seiner Profis; Vereine werden gleich gewichtet. Form und Frische fließen in dieses Maß nicht ein. Alle öffentlich dargestellten Zahlen sind relative Vergleiche oder Häufigkeiten; exakte Spielerfähigkeiten, Talent und Entwicklungspunkte bleiben in den internen Auditdaten.

Die zweite Messung verwendet die native KI-Auswahl für eine feste Formation mit fünf Feldspielern und Torwart. Dafür wird die Qualität auf der zugewiesenen Position gemessen. Sie beschreibt die Qualität dieser standardisierten Auswahl, einschließlich der bestehenden Auswahlregeln.

Innsbruck Sport (AUT-5) wird mit einer einfachen Auditstrategie geführt: bleiben, bis zu 200 gedeckte Credits Nachwuchs, fällige Verträge verlängern und nur bei Bedarf den Mindestkader auffüllen. In Saison 1–19 sind es jeweils 200 Credits. Beim Einstieg in Saison 20 verhindert die reguläre Finanzprüfung diese Ausgabe in allen drei Welten; nach Diagnose wird vom gespeicherten Saison-19-Abschluss mit dem zulässigen Budget von 0 fortgesetzt. Dieser Verein ist aus den KI-Ligamitteln ausgeschlossen; Österreich umfasst daher sieben statt acht Vereine je Welt. Transfers zwischen allen Vereinen laufen weiter. Reine Pokalvereine werden separat ausgewertet. Land bezeichnet Liga bzw. Herkunftsakademie, die Nationalität des Spielers ist ein eigenes Merkmal.

Die Läufe verwenden die echte kompakte KI-Matchsimulation mit tatsächlichen Minuten, Rollenleistungen, Entwicklung, Alterung, Transfers, Gehältern und Nachwuchsaufnahmen. Die Matchdarstellung in Unity/3D wird durch diesen Audit nicht gemessen. Drei Seeds liefern eine nachvollziehbare Stichprobe; die angegebene Spannweite ist die Streuung dieser drei Welten und kein Konfidenzintervall. Der Stand umfasst 20 Spielzeiten mit den regulären Alterswechseln zwischen ihnen.

## Verlauf gegenüber den ursprünglichen Startkadern

| Abschluss | Gesamter Kader | Standardaufstellung | Spannweite der drei Welten: Kader |
| --- | ---: | ---: | ---: |
| Ursprünglicher Start | 0,0 % | 0,0 % | 0,0 % bis 0,0 % |
| 5 | +2,8 % | +3,7 % | +2,7 % bis +2,9 % |
| 10 | +2,0 % | +4,4 % | +0,8 % bis +2,7 % |
| 15 | +3,2 % | +4,8 % | +2,5 % bis +4,3 % |
| 20 | +3,1 % | +5,0 % | +1,9 % bis +4,4 % |

## Unterschiede nach Liga

| Liga / feste Länderstufe | Kader S5 | Kader S10 | Kader S20 | Aufstellung S20 | Nachwuchsherkunft im Kader S20 |
| --- | ---: | ---: | ---: | ---: | ---: |
| England (A) | +1,1 % | +1,2 % | -3,2 % | -1,0 % | 63,6 % |
| Spanien (A) | +2,5 % | +0,1 % | -0,5 % | +1,1 % | 69,0 % |
| Deutschland (A) | -0,4 % | +0,5 % | +1,6 % | +4,3 % | 64,6 % |
| Italien (A) | -0,1 % | -6,2 % | -5,3 % | -2,2 % | 61,6 % |
| Frankreich (A) | +3,5 % | +3,0 % | +5,3 % | +7,9 % | 66,9 % |
| Portugal (B) | +1,7 % | -0,6 % | +2,6 % | +4,1 % | 62,4 % |
| Niederlande (B) | +5,6 % | +1,5 % | +2,0 % | +4,4 % | 65,4 % |
| Belgien (C) | +2,6 % | +6,3 % | +8,2 % | +8,6 % | 65,9 % |
| Österreich (C) | +6,2 % | +4,8 % | +5,1 % | +6,1 % | 66,7 % |
| Schweiz (D) | +5,5 % | +7,6 % | +13,3 % | +14,5 % | 71,6 % |
| Türkei (C) | +0,5 % | +2,4 % | +4,4 % | +5,3 % | 65,9 % |
| Griechenland (D) | +5,8 % | +4,9 % | +5,9 % | +8,4 % | 62,6 % |

„Nachwuchsherkunft“ umfasst im Spiel erzeugte Jugendspieler, die später im Profikader stehen, einschließlich Transfers aus anderen Akademien. Die Startgeneration umfasst ursprünglich erzeugte Profis, auch wenn sie inzwischen bei einem anderen Verein spielen. Die regelmäßige Einführung freier Spieler ist ein weiterer eigener Erzeugungsweg.

## Wie stark beginnt der Nachwuchs?

Zwölf zusätzliche neue Welten liefern 13.458 Startprofis und 6.122 Jugendkandidaten in den Ligavereinen. Das ist eine Erzeugungsmessung mit der vorhandenen Vereins- und Förderstruktur, vor der späteren Auswahl erfolgreicher Profis. Der Altersunterschied ist hier bewusst enthalten: Neu erzeugte Jugendspieler sind 17; für den späteren Ersatzvergleich wird zusätzlich mit ursprünglichen 24–29-jährigen Profis verglichen.

| Akademieland | Jugendkandidaten | Bei Erzeugung gegenüber allen Startprofis | Gegenüber Startprofis mit 24–29 |
| --- | ---: | ---: | ---: |
| England | 525 | -24,6 % | -27,0 % |
| Spanien | 540 | -22,6 % | -26,6 % |
| Deutschland | 533 | -21,7 % | -26,0 % |
| Italien | 516 | -26,5 % | -29,9 % |
| Frankreich | 535 | -19,0 % | -22,1 % |
| Portugal | 515 | -20,2 % | -23,5 % |
| Niederlande | 501 | -18,0 % | -20,8 % |
| Österreich | 475 | -15,8 % | -20,5 % |
| Belgien | 491 | -17,4 % | -21,1 % |
| Türkei | 511 | -17,2 % | -20,8 % |
| Schweiz | 488 | -15,7 % | -19,0 % |
| Griechenland | 492 | -16,2 % | -18,6 % |

Der niedrigere Startstand ist für Entwicklung vorgesehen. Entscheidend ist, ob die Spieler rechtzeitig passende Einsätze und gute Leistungen erhalten und anschließend einen nutzbaren Profistand erreichen.

## Tatsächlich erreichte Entwicklung bis 24

Die folgenden Zahlen betreffen Jugendspieler aus den ersten zehn Erzeugungssaisons, die bis zum 24. Geburtstag im aktiven Profikader oder freien Spielerbestand bleiben. Für alle diese frühen Jahrgänge ist bis Ende Saison 20 genügend Beobachtungszeit vergangen. Je Spieler wird der Stand genau einmal beim Übergang auf Alter 24 erfasst. Die eigene Akademie von AUT-5 ist auch hier ausgeschlossen.

Insgesamt erreichen 2.066 von 15.189 erfassten frühen Kandidaten diesen Beobachtungspunkt (13,6 %). Die übrigen Kandidaten verschwinden vorher aus dem aktiven Bestand. Diese Quote beschreibt Verbleib bis 24; sie ist keine Startelfquote und keine garantierte Ausbildungsrendite.

| Akademieland | Bis 24 beobachtet | Mittlerer Zuwachs gegenüber Erzeugung | Gegenüber ursprünglichen 24–29-jährigen Profis¹ | Median Einsatzminuten bis 24 |
| --- | ---: | ---: | ---: | ---: |
| England | 161 | +17,6 % | -2,1 % | 5.049 |
| Spanien | 153 | +16,8 % | -1,4 % | 4.413 |
| Deutschland | 179 | +18,9 % | -1,0 % | 5.430 |
| Italien | 137 | +18,7 % | -2,6 % | 4.892 |
| Frankreich | 180 | +19,3 % | +11,6 % | 6.400 |
| Portugal | 174 | +17,2 % | +0,8 % | 4.580 |
| Niederlande | 171 | +18,3 % | +7,6 % | 6.097 |
| Belgien | 196 | +17,3 % | +11,5 % | 5.454 |
| Österreich | 136 | +16,6 % | +6,2 % | 6.173 |
| Schweiz | 199 | +17,2 % | +9,5 % | 5.571 |
| Türkei | 187 | +18,0 % | +7,8 % | 5.674 |
| Griechenland | 193 | +17,3 % | +7,1 % | 5.314 |

¹ Die Referenz wird nach der Hauptposition der beobachteten Jugendspieler gewichtet und aus derselben Welt genommen; bei einem leeren Positionssample wird die gemeinsame Landes-/Positionsreferenz der drei Welten verwendet. Die Auswahl der verbleibenden Spieler ist wesentlich: Diese Gruppe begann bereits +13,7 % über dem Mittel aller erfassten Kandidaten dieser frühen Jahrgänge. Ihr späterer Stand darf nicht auf den durchschnittlichen ungesichteten Kandidaten übertragen werden. Der Zuwachs vergleicht dagegen dieselben Spieler mit ihrem eigenen Erzeugungsstand.

### Entwicklung nach Position

| Hauptposition | Beobachtete Spieler | Mittlerer Zuwachs bis 24 | Median des individuellen Zuwachses | Median Minuten bis 24 |
| --- | ---: | ---: | ---: | ---: |
| Torwart | 239 | +24,0 % | +25,4 % | 4.483 |
| Abwehr | 712 | +11,9 % | +9,0 % | 3.455 |
| Mittelfeld | 618 | +19,3 % | +20,5 % | 6.816 |
| Angriff | 497 | +21,5 % | +20,5 % | 6.324 |

Diese Unterschiede entstehen gemeinsam aus Startprofil, Auswahl, Einsatzzeit, Rollenbewertung und der Verteilung des Lernens auf Fähigkeiten. Der Lauf isoliert keinen dieser Einflüsse einzeln. Ein ergänzender, ausdrücklich idealisierter Rechnerfall mit 240 Jugendspielern, sieben Jahren mit je 28 vollen Einsätzen, durchgehend Note 7 und positionsproportional verteiltem Lernen ergibt +47,0 % mittleren Qualitätszuwachs. Dieser Rechnerfall beschreibt günstige Lernbedingungen; die nativen Karrieren oben liefern den tatsächlich erreichten Stand.

## Startgeneration und Alterung

Nach 20 Saisons sind weiterhin Spieler der ursprünglichen Startgeneration aktiv. Über alle drei KI-Welten stehen 736 von 3.195 Profis im Alter von mindestens 40 Jahren in den Kadern (23,0 %); der älteste erfasste Ligaprofi ist 53. Damit enthält der Endstand auch erhaltene und gealterte Startprofis.

Der Code legt das gespeicherte Karriereende für reine Simulationsteams fest. Für Ligaprofis fehlt dieser entsprechende verbindliche Karriereendpfad; sie verbleiben bei fortgesetzten Verträgen trotz fortgeschrittener Alterung. Für eine vollständig erneuerte Generation wäre ein gesonderter, abgestimmter Karriereendpfad relevant. Dieser Audit verändert ihn nicht.

## Reine Pokalvereine getrennt betrachtet

Diese Vereine besitzen keine Nachwuchs- und Transferwirtschaft. Sie ersetzen Karriereenden durch neu erzeugte Erwachsene desselben Positionsslots; dieser Weg behält seine vereins- und länderbezogenen Erzeugungsparameter. Die Veränderungen sind deshalb mit den Ligavereinen nur unter Berücksichtigung dieses anderen Erneuerungswegs vergleichbar.

| Land | Mittlere Kaderveränderung der reinen Pokalvereine nach S20 |
| --- | ---: |
| England | -2,8 % |
| Spanien | -4,1 % |
| Deutschland | -4,5 % |
| Italien | +2,1 % |
| Frankreich | -3,1 % |
| Portugal | -8,9 % |
| Niederlande | -2,5 % |
| Belgien | -7,6 % |
| Österreich | -3,7 % |
| Schweiz | +1,6 % |
| Türkei | -5,9 % |
| Griechenland | -2,3 % |

## Was der Code und die kontrollierten Vergleiche erklären

1. **Förderbudget verbessert bisher unmittelbar die Menge.** 1.000 identische Erzeugungsvergleiche mit 0 bzw. dauerhaft 400 Credits liefern jeweils identische Fähigkeiten, persönliche Grenzen und verborgenes Talent. Die Spielerintegration ersetzt das zuvor budgetabhängige Profil durch ein Profil nach der festen Jugendstufe des Vereins. Die größere Kandidatenzahl erhöht die Auswahlchance. Bei dauerhaft 0 Credits entstehen jährlich ein bis zwei Kandidaten, bei geglätteten 400 Credits vier bis fünf; die Förderung wird über drei Jahre mit 45/35/20 Prozent geglättet. Ab geglätteten 550 Credits entstehen bereits garantiert die maximal sechs Kandidaten. Darüber hinaus entfällt im aktuellen Modell auch der zusätzliche Mengeneffekt.
2. **Das Akademieland hat bei gleichem Profil keinen eigenen Qualitätsfaktor.** 3.300 Vergleiche mit gleicher Spieleridentität und Jugendstufe liefern über unterschiedliche Akademieländer identische Profile. Im Expansionsparameterpfad wird die Länder-/Vereinsverschiebung für Nachwuchs ausdrücklich ausgenommen. Länder unterscheiden sich damit durch ihre konkreten Vereine, deren Jugendarbeit, Finanzierung, Auswahl und spätere Laufbahnen.
3. **Startkader und spätere Erzeugungswege sind unterschiedlich gewichtet.** Die Startkader erhalten Länder-/Vereinsverschiebungen. Die jährlichen freien Spieler entstehen unter eigenen synthetischen Vereinskennungen, für die keine gespeicherten realen Vereinsverschiebungen vorliegen. Das trägt plausibel zum Angleichen bei; die Größe dieses einzelnen Beitrags wurde nicht als Gegenmodell isoliert.
4. **Die KI-Bewertung verwendet ein älteres Potenzialfeld.** `v67AiTalentScore` liest `player.potential`. Das neue Modell löscht dieses Feld und speichert Grenzen unter `player.playerModel.caps`. Dadurch fällt der dortige Potenzialanteil auf aktuelle Qualität zurück. Das ist eine konkrete Integrationsschwachstelle; ihr Einfluss auf Aufnahmen und Weltqualität ist in diesem unveränderten Lauf nicht einzeln quantifiziert.

## Wie Länder unterscheidbar werden könnten

Für die nächste Abstimmung würde ich drei Größen getrennt behandeln: durchschnittliches sportliches Niveau, Ausbildungscharakter und wirtschaftliche Bindungskraft. Ein Landesmerkmal sollte die Bandbreite von Vereinswegen beeinflussen; außergewöhnliche Spieler und gute Ausbildungsvereine bleiben überall möglich.

- **Sportlicher Rahmen:** Wenn A–D auch langfristig als grobe Hierarchie gewünscht ist, müssen die Nachrückerwege zum gleichen Rahmen passen. Kleine, überlappende Gewichtungen der normalen Qualitätsverteilung bei Jugend und freien Spielern wären ein Testkandidat. Starre Höchstgrenzen oder garantierte Spitzenjahrgänge würden die bestätigte Durchlässigkeit aufheben.
- **Ausbildungscharakter:** Länder können unterschiedliche Mischungen von Ausbildungsvereinen, sofort nutzbarem Nachwuchs und größerer Kandidatenbreite besitzen. Ein starkes Jugendprofil in einem kleinen Land darf eine schwache Akademie eines reichen Landes übertreffen. Bestehende handgestaltete Vereinsprofile bilden dafür die Grundlage.
- **Wirtschaftliche Bindungskraft:** Reichere Vereine sollten über tatsächliche Gehaltsangebote, Ruf und Kaderplätze häufiger fertige Spitzenspieler halten oder erwerben können. Ausbildungsvereine können zugleich über Einsätze und spätere Verkäufe erfolgreich sein. Spielerfähigkeiten bleiben beim Transfer erhalten; die Nationalität benötigt dafür keinen Fähigkeitsbonus.
- **Spürbare Förderung:** Nachhaltige bezahlte Förderung könnte künftig zusätzlich die Verteilung der Startqualität neuer Kandidaten beeinflussen. Bestehende Spieler bleiben unverändert. Zuerst wären dieser Budgetpfad und die KI-Potenziallesung gezielt zu prüfen; die beobachtete Entwicklung durch echte Einsätze funktioniert bereits.
- **Sichtbare Ausbildungsbilanz:** Eine jährliche Übersicht über Kandidaten, Aufnahmen, Einsatzminuten, Veränderungen der Fähigkeitsfarbstufen und Transfererlöse würde den Nutzen beobachtbar machen. Die Budgetwahl sollte den geglätteten Förderstand und die erreichbare Kandidatenzahl zeigen, insbesondere die bereits erreichte Mengenobergrenze.
- **Vollständiger Generationswechsel:** Ein bei der Erzeugung gespeichertes, positionsabhängiges Karriereende für neue Ligaprofis würde Ausbildungs- und Ersatzbedarf verlässlich machen. Ein entsprechender Kandidat sollte ausdrücklich für neue Welten getestet werden, ohne bestehende Spielstände nachträglich umzurechnen.

Vor einer Balanceänderung sollten zwei Varianten mit denselben Seeds verglichen werden: ein langfristig stabilerer A–D-Rahmen und eine bewusst durchlässigere Welt, deren Landesunterschiede vor allem aus Jugendarbeit und Transferwirtschaft entstehen. Die vorliegende Auswertung testet den unveränderten aktuellen Stand.

## Nachweise und Wiederholung

Der Quellstand ist mit Datei-SHA-256 unter `outputs/youth-20years-20261011/source-manifest.json` eingefroren. `harness-equivalence.json` dokumentiert den bytegleichen Welt- und Managerstand einer vollständigen ersten Saison zwischen dem offiziellen VM-Harness und dem schnelleren Hauptkontext-Harness. Die vollständige Weltvalidierung besteht in jedem Seed nach Saison 1, 10 und 20. Die Saisoncheckpoints und genauen Spielerwerte sind lokale interne Auditdaten.

Aus dem Projekt-Hauptverzeichnis, mit Node 24:

```powershell
node --max-old-space-size=2048 --expose-gc work/audit-youth-20years-20261011.cjs --seed=youth20-a --seasons=20 --resume --fast
node --max-old-space-size=2048 --expose-gc work/audit-youth-20years-20261011.cjs --seed=youth20-b --seasons=20 --resume --fast
node --max-old-space-size=2048 --expose-gc work/audit-youth-20years-20261011.cjs --seed=youth20-c --seasons=20 --resume --fast
node work/audit-youth-controls-20261011.cjs
node work/summarize-youth-20years-20261011.cjs --quiet
node work/render-youth-20years-20261011.cjs
node work/write-youth-report-20261011.cjs
```

Mit `--resume` wird am gespeicherten Abschluss weitergearbeitet; für einen unabhängigen Neulauf einen neuen Seed verwenden und dessen Ergebnisse gesondert auswerten. Quellen nur einmal ausdrücklich mit `--freeze` sichern; bestehende Prüfquellen nicht während eines Laufes überschreiben.

[Interaktive Auswertung](../outputs/youth-20years-20261011/report.html). Maßgebliche Codepfade im eingefrorenen Stand: `world-expansion-v161.js` (Länder-/Vereinsgewichtungen), `world-player-foundation-v153.js` (Erzeugungsintegration), `world-youth-manager-v67.js` (Menge und KI-Aufnahmen), `world-player-performance-v155.js` und `player-development.js` (tatsächliche Entwicklung), `world-payments-v124.js` (Simulationsteam-Ersatz).
