# Finanzsystem: Zahlungsplan für die Vereinswelt

Stand: 4. Oktober 2026. Die Zahlungstermine sind bestätigt und für Prototyp 106 umgesetzt. Der neue Ablauf gilt nur für neu gestartete Karrieren; bestehende Karrieren bleiben unverändert. Der [Zehn-Saisonen-Test mit grafischem Finanzbericht](finanzsystem-test-v124.md) dokumentiert Ergebnisse und Grenzen.

## Bestätigte Entscheidungen

In neuen Karrieren führen ausschließlich die 36 Ligavereine eine Vereinswirtschaft. Die zwölf reinen Pokalvereine sind Simulationsteams ohne Einnahmen, Ausgaben, Gehälter, Transfers oder Nachwuchsbudgets. Ihre Kader und Statistiken bleiben erhalten; Karriereenden zwischen 33 und 38 Jahren werden zum Saisonwechsel kostenlos durch junge Spieler derselben Position ersetzt. Ausgeschiedene Spieler bleiben im Vereinsprofil mit ihrer Historie abrufbar. Auch eine sportliche Europacupqualifikation löst für diese Teams keine Geldzahlung aus. Diese Entscheidung verändert gegenüber dem bisherigen Modell auch die Marktteilnehmer; der erneute Zehn-Saisonen-Vergleich berücksichtigt das ausdrücklich.

Spielergehälter werden weiterhin gesammelt am Saisonende bezahlt. Unterjährige Vertragsabschlüsse, Verkäufe und Verlängerungen verändern die anteilige Gehaltspflicht, lösen aber keine sofortige Gehaltszahlung aus. Bereits vereinbarte Gehälter bleiben verbindlich.

## Ausgangslage

Maßgeblich sind `dist/world-economy-v66.js`, `dist/world-youth-manager-v67.js` und `dist/world-competition-v62.js` sowie die [Produktregeln](product.md).

Der Code bucht den Jahresgrundbetrag zu Saisonbeginn für alle Vereine, auch für den menschlich geführten Verein. Das Sponsorfixum folgt bei der Sponsorwahl. Ablösen und Ausbildungsentschädigungen werden bei tatsächlichen Wechseln sofort bezahlt; Sieg- und Remis-Credits folgen dem abgeschlossenen Match. Das Jugendbudget wird zu Saisonbeginn vollständig abgezogen. Ligaprämien, nationale Pokalprämien, Europacupprämien und erfüllte Sponsorboni werden am Saisonende vor den Gehältern gebucht.

Der Spielkalender beginnt am 1. August und endet am Saisontag 224. Die Saison ist keine zwölfmonatige Simulation. Gehälter beziehen sich weiterhin auf die Spiel-Saison.

Das Hauptproblem ist die Planbarkeit: Der Kontostand enthält Geld, das später für bereits vereinbarte Gehälter benötigt wird. Außerdem bleiben schon verdiente Wettbewerbsprämien bis zum allgemeinen Saisonabschluss unbezahlt.

## Bestätigte Zahlungstermine

Die folgende Tabelle ist für wirtschaftende Ligavereine bestätigt. Spielergehälter bleiben gesammelt am Saisonende fällig. Der neue Zahlungsplan wird ausschließlich beim Anlegen einer neuen Karriere aktiviert; reine Simulationsteams erhalten keine dieser Zahlungen.

| Zahlung | Zeitpunkt | Betrag und Bedingung |
| --- | --- | --- |
| Jahresgrundbetrag | Beginn der neuen Saison | Einmalige feste Einnahme des Vereins. |
| Sponsorfixum | Sofort nach Sponsorwahl | Vertraglich zugesagtes Fixum vollständig. |
| Jugendbudget | Nach Sponsorwahl, vor dem ersten Transfertag | Gewähltes Saisonbudget vollständig; Grundbetrag und Sponsorfixum stehen vorher zur Verfügung. |
| Ablöse beim Kauf oder Verkauf | Bei endgültigem Transferabschluss | Erst nach Vereins- und Spielerzustimmung; eine bloße Einigung über die Ablöse bewegt noch kein Geld. |
| Ausbildungsentschädigung | Bei Übernahme eines eigenen Jugendspielers | Sofort vollständig. Das Gehalt kommt anteilig in die Jahresabrechnung. |
| Ablösefreie Verpflichtung | Keine sofortige Transferzahlung | Kein Handgeld; das anteilige Gehalt wird für den Saisonabschluss vorgemerkt. |
| Sieg- und Remis-Credits | Nach endgültigem Matchabschluss | Wie bisher unmittelbar; auch KI-simulierte eigene Partien müssen dieselbe Buchung auslösen. |
| Ligaplatzierungsprämie | Nach Abschluss aller Spiele der jeweiligen Liga | Endgültiger Tabellenplatz, auch wenn Pokal oder Europacup noch laufen. |
| Nationale Pokalprämie | Bei erster Teilnahme und beim Erreichen der nächsten Runde | Nur zusätzliche Teilbeträge, keine doppelte Gesamtprämie am Saisonende. |
| Europacupprämie | Nach jeder abgeschlossenen eigenen Europacuppartie | Bestehender Betrag pro Partie; Titelbonus nach dem gewonnenen Finale. |
| Sponsorboni | Saisonabschluss, vor den Gehältern | Jedes erfüllte Ziel einmal. Die bisherigen Sponsorbedingungen bleiben bestehen. |
| Spielergehälter | Saisonabschluss, nach allen fälligen Einnahmen | Gesamte tatsächlich entstandene Gehaltspflicht; kein zweiter Abzug bereits abgerechneter Beträge. |

Beim Saisonwechsel wird zuerst ein möglicher Vereinswechsel entschieden. Grundbetrag, Sponsorwahl und Jugendbudget gehören anschließend zum jeweiligen Verein. Eine Änderung der bisherigen Budgetwahl-Reihenfolge ist Teil des Vorschlags.

## Prämien zunächst nur zeitlich verteilen

Der erste Ausbau verändert Zahlungszeitpunkte, nicht gleichzeitig die Höhe aller Einnahmen. Damit lässt sich erkennen, ob eine Verbesserung aus der zeitlichen Verteilung oder aus höheren Summen entsteht.

Die aktuellen Ligaprämien bleiben zunächst 560, 430, 330, 250, 190 und 140 Credits für Platz 1 bis 6.

Die nationalen Pokalprämien lassen sich ohne Änderung der aktuellen Gesamtsummen aufteilen:

| Anspruch | Neue Teilzahlung | Gesamtsumme bis dahin |
| --- | ---: | ---: |
| Erste Viertelfinalpartie abgeschlossen | 40 Credits | 40 Credits |
| Halbfinale erreicht | 50 Credits | 90 Credits |
| Finale erreicht | 60 Credits | 150 Credits |
| Pokal gewonnen | 120 Credits | 270 Credits |

Im Europacup bleiben zunächst 42 Credits pro tatsächlich abgeschlossener Partie und 350 Credits zusätzlich für den Titel. Reguläre Sieg- und Remis-Credits bleiben eine getrennte Einnahme; der Umbau erzeugt keine weitere Matchprämie.

## Finanzplanung in der Oberfläche

Die Finanzansicht zeigt den aktuellen Kontostand, die nächste Zahlung mit Fälligkeit, die erwartete gesamte Gehaltsabrechnung sowie eine Saisonprognose. Eine Buchungsliste nennt Datum, Anlass, Betrag und den daraus folgenden Kontostand.

Die Prognose trennt garantierte Ansprüche von möglichen Erfolgsprämien. Bereits bezahlte Einnahmen sind im Kontostand enthalten und werden nicht nochmals addiert. Bei Wettbewerben zählt als sicher nur der bereits garantierte Mindestanspruch; der maximale Erfolg ist ein eigenes Szenario.

Die sichere Schlussprognose lautet: aktueller Kontostand plus noch unbezahlte garantierte Einnahmen minus noch unbezahlte verbindliche Kosten. Die umgesetzte Finanzansicht zeigt zusätzlich die Prognose mit noch erreichbaren Sponsorboni. Weitere ungewisse sportliche Einnahmen sind darin nicht enthalten. Der Vorschlag, beide Prognosen zusätzlich unmittelbar in Kauf- und Verlängerungsdialogen zu zeigen, bleibt ein eigener möglicher Oberflächenschritt.

Der menschliche Verein darf weiterhin mit möglichen Erfolgsprämien planen. Eine negative sichere Prognose ist ein sichtbarer Hinweis, keine neue automatische Transfersperre. KI-Vereine dürfen weiterhin keine neuen Schulden aufnehmen und müssen ihre zugesagten Gehälter bei Ausgaben berücksichtigen.

## Saisonabschluss und Sanierung

1. Alle Wettbewerbe und Sponsorziele abschließen.
2. Noch offene, tatsächlich verdiente Prämien und Sponsorboni buchen. Bereits bezahlte Teilprämien nicht erneut zahlen.
3. Alle Gehaltsabschnitte je Verein addieren und einmal kaufmännisch auf ganze Credits runden.
4. Gehälter abbuchen und den Schlusskontostand feststellen.
5. Sanierung beginnen, fortsetzen oder beenden. Danach Vertragsenden und Saisonwechsel verarbeiten.

Die bestehende Sanierungsregel bleibt bestehen: Ein negativer Schlusskontostand wird zinsfrei vorgetragen; Käufe mit Ablöse sind gesperrt. Die Sperre endet frühestens bei einem folgenden Saisonabschluss mit mindestens null Credits. Neue Saisoneinnahmen können den Fehlbetrag verringern, beenden die Sperre aber nicht sofort.

## Umsetzung und Abnahme

Zahlungstermine, Buchungsereignisse, Jugendbudgetfolge und Finanzansicht sind lokal umgesetzt. Die Beträge werden erst in einem getrennten Balanceschritt verändert. Das erste Jugendjahresbudget wird in neuen Karrieren nun ebenfalls nach der ersten Sponsorwahl festgelegt und bezahlt.

Jede Zahlung benötigt eine eindeutige Buchungskennung und das tatsächliche Ereignisdatum. Ergebnisdialoge, Neuladen und erneutes Öffnen dürfen keine Zahlung wiederholen. Runde und Anspruch müssen endgültig feststehen, bevor Geld gebucht wird.

Die Umsetzung prüft insbesondere: gleiche Saison-Gesamtsummen bei unveränderten Ergebnissen; keine Doppelzahlung von Pokal- und Europacupprämien; anteilige Gehälter bei Verkauf, Verpflichtung und Verlängerung; korrekte Sanierung; kein neuer Schuldenaufbau bei KI-Vereinen; gespeicherte Zahlungszustände nach Neuladen und Import; Vereinswechsel ohne Übertragung von Vereinsgeld.

Bestehende Spielstände und vergangene Buchungen werden nicht rückwirkend berechnet oder umgerechnet. Auf Nutzerentscheidung gilt das Modell ausschließlich für neu gestartete Karrieren. Laufende Karrieren behalten ihre Regeln auch bei späteren Saisonwechseln.

Die frühere Auszahlung der Wettbewerbsprämien und die Jugendbudgetzahlung nach Sponsorwahl sind bestätigt. Gehälter am Saisonende und die bestehenden Sanierungsregeln bleiben die Grundlage. Aus dem Test folgt als nächste offene Frage die Kalibrierung der nationalen Betriebsüberschüsse, besonders bei Pokalvereinen; daraus wurden noch keine neuen Geldbeträge abgeleitet.
