# Vereinsfinanzen über zehn Saisonen

Stand: 5. Oktober 2026. Der bestätigte Zahlungsplan und die reinen Pokal-Simulationsteams sind als Prototyp 106 veröffentlicht. Dieser vollständige Lauf ersetzt die vorherige Auswertung mit wirtschaftenden Pokalvereinen.

## Ergebnis

Am 5. Oktober 2026 als [Prototyp 106 live veröffentlicht](https://fussball.cakamper.at/). [Deployment und alle automatischen Spieltests](https://github.com/thealextd1337-spec/FM/actions/runs/37238139947) erfolgreich. Quellseite, Build und Live-Seite zeigen Version 106; die Live-Datei entspricht dem geprüften Build (SHA-256 `2b121e2deccf1efc5118fa853f209d304e74fd5b448ccb2c2eb61991c303fc8e`). Zwölf Simulationsteams ohne Vereinswirtschaft, 36 Ligavereine, Budgetfolge und DE/EN wurden zusätzlich direkt live mit isoliertem Testspielstand geprüft.

Der neue Zahlungsplan ist umgesetzt. Er gilt ausschließlich für neu gestartete Karrieren. Gehälter bleiben am Saisonende fällig. Bestehende Karrieren behalten ihre bisherigen Zahlungstermine und werden nicht nachberechnet.

Sechs feste Welt-Seeds wurden jeweils zehn Saisonen mit dem bisherigen und dem neuen Ablauf simuliert. Das ergibt 5.760 Vereinsjahre und 31.080 abgeschlossene Partien: 5.040 wirtschaftende Vereinsjahre und 720 Pokalvereinsjahre ohne Vereinswirtschaft. Alle Buchungsabgleiche und Prämienprüfungen bestanden. Kein KI-Verein hatte einen negativen Schlusskontostand; der niedrigste wirtschaftende KI-Schlusskontostand betrug beim neuen Modell 290 Credits.

Ligavereine ohne Europacupteilnahme konnten zunächst Rücklagen aufbauen, gerieten aber gegen Ende des Tests häufiger in Jahresverluste. Ihre durchschnittliche Gehaltslast stieg von 1.733 in Saison 1 auf 2.412 Credits in Saison 10. Als nächster Balanceschritt sollten die wachsende Gehaltslast und die nationalen Betriebsüberschüsse untersucht werden. Die Prämienbeträge und Gehaltsregeln wurden in dieser Änderung nicht neu kalibriert.

Die zwölf reinen Pokalvereine haben in neuen Karrieren keine Einnahmen, Ausgaben, Gehälter, Transfers oder Nachwuchsbudgets. Kader, Statistiken, Auszeichnungen und Trainer bleiben erhalten. Karriereenden zwischen 33 und 38 Jahren werden zum Saisonwechsel kostenlos durch 18- bis 23-jährige Spieler derselben Position ersetzt. Ausgeschiedene Spieler bleiben im Vereinsprofil mit ihren Statistiken abrufbar. Beim Start vorhandene ältere Spieler scheiden frühestens nach ihrer ersten Saison aus. Im Test wurden 425 Karriereenden automatisch ersetzt und archiviert. Sportliche Europacupqualifikation bleibt möglich, erzeugt für diese Simulationsteams aber keine Geldzahlungen.

## Gruppen beim neuen Ablauf

Ein Fall ist ein Verein in einer Welt. Die Gruppen sind für die gesamten zehn Saisonen fest; ein späterer Europacupteilnehmer gehört nicht zur Gruppe „nie Europacup“. Der menschliche Testverein ist aus den KI-Gruppen ausgeschlossen.

| Gruppe | Fälle | Unterschiedliche Vereine | Durchschnittliches Startkapital | Durchschnittlicher Kontostand nach Saison 10 | Durchschnittliche Bilanz in Saison 10 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Ligavereine ohne Europacup in allen zehn Saisonen | 20 | 13 | 1.685 | 2.427 | −174 |
| Ligavereine mit mindestens einer Europacupteilnahme | 190 | 35 | 2.049 | 3.445 | −49 |

Alle Geldbeträge sind Credits und hier auf ganze Credits gerundet. Die 13 beziehungsweise 35 Ligavereine sind je Gruppe über die Welt-Seeds gezählte unterschiedliche Vereinsidentitäten; dieselbe Identität kann in verschiedenen Welten unterschiedliche Teilnahmen haben. Der Unterschied der Gruppen beweist keinen isolierten Europacupeffekt, weil Vereinsprofil, Gehälter, Transfers und sportliche Ergebnisse ebenfalls verschieden sind. Reine Simulationsteams sind aus den Finanzmitteln ausgeschlossen; sie sind keine Finanzgruppe mit einem Nullsaldo.

## Ligavereine, die nie Europacup spielen

| Saison | Durchschnittlicher Schlusskontostand | Durchschnittliche Jahresbilanz | Fälle mit Jahresverlust |
| --- | ---: | ---: | ---: |
| Start | 1.685 | – | – |
| 1 | 2.013 | +328 | 4 von 20 |
| 2 | 2.333 | +320 | 6 von 20 |
| 3 | 2.607 | +274 | 6 von 20 |
| 4 | 2.793 | +186 | 7 von 20 |
| 5 | 3.107 | +314 | 5 von 20 |
| 6 | 2.984 | −123 | 9 von 20 |
| 7 | 2.809 | −175 | 9 von 20 |
| 8 | 2.978 | +169 | 6 von 20 |
| 9 | 2.601 | −378 | 13 von 20 |
| 10 | 2.427 | −174 | 14 von 20 |

In Saison 10 lagen die Schlusskontostände dieser 20 Fälle zwischen 1.071 und 5.655 Credits. Im Mittel standen 2.770 Credits Einnahmen 2.944 Credits Ausgaben gegenüber. Die Gehälter machten durchschnittlich 2.412 Credits aus, das Jugendjahresbudget 313 Credits. Selbst ohne Spielerkäufe und Ausbildungsentschädigungen lag der durchschnittliche nationale Betriebsüberschuss in dieser Saison bei −92 Credits. Der mittlere Kontostand sank von 3.107 Credits nach Saison 5 auf 2.427 Credits nach Saison 10.

## Grafiken und vollständige Vereinsbilanzen

Der [interaktive Finanzbericht](../outputs/finance-v124/finance-report.html) zeigt feste Gruppen, auswählbare Vereine und Welten, Kontostände, gestapelte Einnahmen und Ausgaben sowie Jahresbilanzen. Die Startansicht ist auf Ligavereine ohne Europacup gefiltert. Alle 48 Vereine sind auswählbar; bei den zwölf Simulationsteams erscheint eine Erklärung statt irreführender Finanzgrafiken. Finanzvergleiche enthalten ausschließlich wirtschaftende Ligavereine. Die CSV kennzeichnet die Simulationsteams ausdrücklich.

- [Sämtliche Vereinsjahre als CSV](../outputs/finance-v124/finance-clubs.csv)
- [Messdaten und Quellenprüfsummen als JSON](../outputs/finance-v124/finance-data.json)

Die Grafikvergleiche mit dem bisherigen Ablauf verwenden für einen ausgewählten Verein dieselben Welt-Seeds. Die neuen und bisherigen Gruppen können unterschiedlich groß sein, da die sportlichen Ergebnisse und damit Qualifikationen abweichen können.

## Methode und Grenzen

Die Simulation verwendet die vorhandene Welt-KI für Spiele, Transfers, Vertragsentscheidungen, Sponsoring und Nachwuchs. Europacupteilnahmen werden natürlich ermittelt; es werden keine Ergebnisse, Kontostände oder Prämien erzwungen. Der menschliche Verein `GER-2` bleibt bei seinem Verein, wählt Sponsorangebot 1, investiert bis zu 200 Credits jährlich und ergänzt nötigenfalls seinen Mindestkader über den normalen Markt. Er ist kein gleichwertiges KI-Vergleichsteam und wird deshalb aus den Gruppenmitteln ausgeschlossen.

Die zehn Saisonen werden mit der Welt-KI und nicht mit der aufwendigeren physischen Live-Match-Engine simuliert. Eine vollständige native Partie wurde zusätzlich auf der Quellseite und im Offline-Build geprüft. Der neue Zahlungsplan verändert die Verfügbarkeit des Geldes und kann dadurch KI-Entscheidungen verändern. Neu gestartete Karrieren bezahlen außerdem bereits in Saison 1 ein Jugendjahresbudget nach Sponsorwahl. Die Pokalvereine entfallen aus dem Transfermarkt, während sie im bisherigen Ablauf noch wirtschaften. Der Vergleich berücksichtigt deshalb auch veränderte Marktteilnehmer; er isoliert weder ausschließlich Zahlungstage noch den Europacupeffekt.

Die Prüfung deckt zehn Saisonen und sechs Seeds ab; sie ist keine Aussage über einen unbegrenzten Karriereverlauf. Dass Ende Saison 10 kein KI-Verein insolvent war, bedeutet nicht, dass jeder Verein jährlich einen Überschuss erzielt.

## Reproduktion und Prüfungen

`node work/audit-world-finance-v124.cjs` führt beide Abläufe über sechs Seeds und je zehn Saisonen aus. `node work/render-world-finance-v124.cjs` erzeugt den eigenständigen HTML-Bericht. Die Ergebnisse liegen unter `outputs/finance-v124/`; dieser Ordner ist ein lokales Prüfergebnis außerhalb von Git.

`work/test-world-payments-v124.cjs` prüft Zahlungstage, Prämien-Gesamtsummen, Sponsorzahlung vor Jugendbudget, erlaubtes Nullbudget, Gehaltsfälligkeit, Prognosen, wiederholte Abschlüsse und bestehende Karrieren. Zusätzlich prüft es fehlende Geldbewegungen und Transfers der Simulationsteams, fortgeführte Spieler, positionsgleichen Karriereersatz, archivierte Statistiken und Neuladen. Die bestehenden Wirtschaft-, Nachwuchs-, Transfer- und Speichertests bestanden ebenfalls.

`work/check-world-finance-browser-v124.cjs` prüft Bericht, Filter, Jahresbilanzen, Mobilansicht, neue Budgetfolge, deutsche/englische Oberfläche, Pokalvereinsprofil ohne Finanzen und das Spielerarchiv. Eine vollständige native Partie besteht jeweils auf Quellseite und Offline-Build. Dafür sind die gebündelte Node-Runtime, Playwright und ein isolierter lokaler Prüfserver auf Port 4192 vorgesehen. Es werden keine realen Browser-Spielstände geöffnet.

`node work/verify-world-finance-v124.cjs` gleicht Quellenprüfsummen, vollständige Berichtsdaten, Nullbuchungen, Offline-Quellen und Browserabschluss mit dem Audit ab; das Abschlussmanifest liegt unter `outputs/finance-v124/verification.json`.
