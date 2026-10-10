# AP07: Länderwertung, Folgequalifikation und Wirtschaft

Stand: 10. Oktober 2026. Lokal im isolierten Arbeitsverzeichnis `work/ligaexpansion-ap03` auf Basis 121. Neue Karrieren aus der Entwicklungsvorschau verwenden `world.progressionVersion: 167` und den gespeicherten Wirtschaftsstand 1. Laden ergänzt diese Kennung nicht. Bestehende AP06-Karrieren behalten die erste Saison und deren Folgesaisonsperre; alte Vereinswelten und Vorbereitungsstände werden nicht umgerechnet.

## Länderwertung und Qualifikation

Beide Europacups liefern zwei Punkte für einen regulären Sieg und einen Punkt für ein reguläres Remis. Maßgeblich ist jede einzelne Partie einschließlich beider Spiele einer K.-o.-Paarung. Ein Elfmeterschießen verändert die Spielpunkte nicht. Je erreichtem Viertelfinale, Halbfinale, Finale und Titel gibt es einmal einen Bonuspunkt. Vereinsbeiträge sind mit Wettbewerb, Spielpunkten und Bonuspunkten gespeichert und in der Karriereansicht nachlesbar.

Die Saisonpunkte eines Landes werden durch alle tatsächlich gestarteten Vereine beider Cups geteilt, einschließlich Titelverteidigern. Dieser Nenner bleibt während der Saison fest; ausgeschiedene Vereine werden nicht herausgerechnet. Insgesamt sind es 58 Teilnehmer. Die letzten höchstens drei abgeschlossenen Saisonwerte werden addiert. Die Berechnung verwendet gekürzte Brüche; die Anzeige rundet auf drei Nachkommastellen. Gleichstand entscheidet der jüngste Saisonwert, dann der vorherige Länderrang. Saison 1 beginnt ohne erfundene Vorjahrespunkte.

Nach Abschluss aller Wettbewerbe wird die Wertung einmalig gebucht. Die neue Reihenfolge gilt ausschließlich für die folgende Qualifikation: Rang 1–8 bekommt drei Horizon-Plätze, Rang 9–12 zwei. Aktuelle Teilnehmerfelder ändern sich nicht. Die beiden Titelverteidiger und alle direkten nationalen Crown-Teilnehmer werden zuerst reserviert. Überlappende nationale Plätze bekommen erst danach den nächsten berechtigten Ligaverein. Beim nationalen Double bekommt der Pokalfinalist den zweiten nationalen Platz. Reine Pokalvereine dürfen sich über einen tatsächlichen Pokalsieg qualifizieren. Horizon nimmt anschließend die übrigen Ligavereine auf. Jede Saison hat 26 Crown- und 32 Horizon-Teilnehmer ohne Überschneidung.

`qualifications` speichert Teilnehmer und ihre Abschlussquelle je Saison; `countrySeasonValues` die tatsächlichen Wertungsbeiträge. Die bestehenden Wettbewerbsarchive behalten ihre Ergebnisse. Der Validator rekonstruiert alle Qualifikationen, Spielpläne, K.-o.-Rundenschlüsse und Wertungsbeiträge aus diesen Ergebnissen, einschließlich dritter und vierter Wertungssaison. Bei archivierten Partien bleibt die bestehende Verdichtung der Matchberichte erhalten; sie wird nicht rückgängig gemacht.

## Saisonwechsel und Karriere

Der abgeschlossene Saisonstand zeigt Vereinsentscheidung und Länderwertung. Nach Bleiben oder Annahme eines verfügbaren Stellenangebots lässt sich das nächste Jahr beginnen. Die vorhandenen Karrierepfade altern Spieler und Trainer einmal, archivieren Statistiken, ergänzen Trainerkandidaten und erzeugen die 26 neuen Wettbewerbe. Sponsorwahl, Jugendbudget und fünf Transfertage folgen in derselben gespeicherten Karriere. Physische eigene Partien nutzen weiterhin den gemeinsamen Matchadapter.

Die kompakte Expansionsansicht zeigt nun auch Verträge mit Verlängerungsaktionen, Finanzen/Jahresabrechnung und den vorhandenen Nachwuchspool. Nach abgeschlossenem Finanzjahr sind Nachwuchsübernahmen bis zum neuen Saisonbeginn gesperrt. Die Angebotsversuche für Vertragsverlängerungen werden in neuen AP07-Karrieren pro Saison zurückgesetzt; angenommene Verlängerungen dürfen spätere Vertragsjahre nicht dauerhaft sperren. Reine Simulationsteams behalten ihre Wirtschaftsausnahme und werden bei Spielerersatz aus dem richtigen 192er-Katalog erzeugt.

## Wirtschaftsstand 1

Diese konkreten Parameter sind die lokale Kalibrierung des AP07-Auftrags. Die bestätigten Länderstufen und überlappenden Vereinsprofile bleiben Grundlage; ein neuer Wertungsrang verändert weder die Finanzstufe noch die Matchstärke.

| Bereich | Neue AP07-Karrieren |
| --- | --- |
| Jahresgrundbetrag | bisheriger, bereits nach Länderstufe gewichteter Betrag × 1,08, auf zehn Credits gerundet |
| Sponsorfixum | bisheriges stufengewichtetes Fixum × 1,10, auf zehn Credits gerundet |
| Sponsorboni | bisheriger Bonus × 1,15 × Länderfaktor, auf zehn Credits gerundet |
| Liga-Sponsorziele | zurückhaltend Platz 6, ambitioniert Platz 3 statt Platz 4/2 bei sechs Vereinen |
| Liga-Torziele | bisheriges Zehn-Spiele-Ziel × 14/10, aufgerundet; nur tatsächlich erzielte reguläre Tore |
| Ligaprämien Platz 1–8 | 700 / 550 / 430 / 340 / 270 / 210 / 165 / 130 Credits |
| Nationaler Pokal | Teilnahme R16: 25; QF: 45; SF erreicht: 60; Finale erreicht: 75; Titel: 150 Credits, jeweils zusätzlich |
| Crown Cup | 55 Credits je Partie; Titelbonus 400 |
| Horizon Cup | 40 Credits je Partie; Titelbonus 280 |
| Jahresgehälter | vorhandene native Gehaltsberechnung; tatsächliche Vertragsabschnitte über 225 Kalendertage gewichtet |
| Einsatz-Zusagen | Auswahl 0–14; anfängliche Zusagen auf den 14er-Kalender skaliert; tatsächliche Einsätze und Vertragsbeginn maßgeblich |
| Entwicklung | tatsächliche bewertete Minuten; volle Entwicklungsstaffel bis 1.260 Minuten, reduzierte bis 2.520, keine zusätzliche Fortschrittsbuchung |

Prämien haben weiterhin eindeutige native Buchungskennungen und werden beim jeweiligen Ereignis bezahlt. Der Finanzplan nutzt den tatsächlichen Cup und die neue niedrigste Ligaprämie. Jahresgehälter werden nicht pro zusätzlichem Spiel vervielfacht. Ein Vertrag ab Tag 112 mit 225 Credits Jahresgehalt verursacht 113 Credits bis Jahresende; getrennte Vertragsabschnitte ergeben denselben Gesamtbetrag.

Für Einsatz-Zusagen zählen internationale Minuten mit Faktor 1,5, nationale Pokalminuten vor dem Finale mit 0,75 und sonstige Minuten mit 1. Ab 45 gewichteten Minuten zählt ein Einsatz; kürzere Einsätze werden zusammengefasst. Der erwartete Anteil einer Saison-Zusage folgt den tatsächlich abgeschlossenen Ligaterminen seit Vertragsbeginn, bezogen auf die 14 Ligaspiele. Später angelegte K.-o.-Runden verwässern diesen Anteil nicht. Die Prüfung erfolgt weiterhin regelmäßig und zusätzlich am letzten Ligatermin.

## Nachweise und Grenzen

- `node work/test-world-expansion-rules-v167.cjs`: native Erstellung, unveränderte AP06-Karriere, 18.336 Titelüberschneidungen, Rangwechsel 8/9, exakte Gleichstände, Herausfallen der viertältesten Wertung, Remis mit Elfmeterschießen, alle Rundenboni, Teilnehmernenner und Minutenstaffel.
- `node work/test-world-expansion-contracts-v168.cjs`: anteilige Zusagen und Gehälter, beschädigte Wertungs-/Qualifikationsstände, Abschluss-Sperre, gezielter Managerwechsel über den nativen Stellenpfad und saisonbezogene Verlängerungsversuche.
- `node work/test-world-expansion-seasons-v167.cjs`: drei Seeds mit je fünf Saisons, 14.865 synthetische Spielstände durch die native Ergebnis-, Finanz-, Trainer- und Saisonwechselkette. Die 15 Abschlüsse und Export-/Import-Rundläufe bestehen. Minimum der KI-/Vereinskonten: 1.465 Credits, Maximum: 16.455. Fünf Abschlüsse liefern natürliche Stellenangebote; die Crown-Titel verteilen sich im Szenariotest auf zehn Länder. [Szenarien](../outputs/ligaexpansion-ap07/scenarios.json).
- `node work/test-world-expansion-seasons-v167.cjs --native`: vier Saisons mit echter nativer kompakter Matchsimulation und 3.964 vollständig gebuchten Partien bestanden. Vereinskonten liegen an den Abschlüssen zwischen 1.995 und 12.284 Credits; kein KI-Verein ist zahlungsunfähig. Die Crown-Titel gehen an drei Länder; ein Abschluss liefert natürliche Stellenangebote. Alle vier Wertungen und Export-/Import-Rundläufe bestehen. [Nativer Nachweis](../outputs/ligaexpansion-ap07/native.json). `check-world-expansion-native-checkpoint-v167.cjs` lädt diesen echten Abschluss mit dem endgültigen Code, beginnt Saison 5 und prüft Verlängerungsreset, Wertung und Speicherung erneut. [Saison-5-Start](../outputs/ligaexpansion-ap07/native-checkpoint.json).
- `work/check-world-expansion-browser-v167.cjs`: frischer lokaler Edge-Testkontext bei 390 × 844. Neue Karriere, sichtbare Wertung, Saisonwechsel 1→2, unveränderte Punkt-/Ereigniszahl, Neuladen, Sponsor/Budget/Transferphase, Finanzen, Nachwuchs, Verlängerungsdialog mit 15 Zusagenoptionen und vorbereitete Aufstellung bestehen ohne Browserfehler oder horizontalen Überlauf. Der gespeicherte Abschluss für diesen UI-Test stammt aus 991 synthetischen Ergebnissen mit nativer Buchung. Der gemeinsame Browser scheiterte zweimal am Snapshot-Timeout. [Browsernachweis](../outputs/ligaexpansion-ap07/browser.json). Zusätzlich besteht der echte 2D-Pause-/Neuladeablauf einer neuen AP07-Karriere mit identischer Spielzeit, Ergebnis und Spieleridentitäten. [Physischer Nachweis](../outputs/ligaexpansion-ap07/physical/browser.json).
- Bestehende Zahlungs-, Wirtschafts-, Nachwuchs- und AP06-Spielstandsprüfungen sowie alle 18 Entwicklungs-Testgruppen bestanden. Der historische Entwicklungs-Beispielfall benötigte seine vorhandene JSON-Quelldatei aus dem Hauptarbeitsverzeichnis. Build und Assetprüfung erfassen alle drei neuen Module.

Die Szenariomessung beweist keine physische Matchbalance oder globale Gewinnverteilung. Native Mehrjahresmessungen ergänzen sie; umfangreiche Spielbalance, Unity-/Android-Gesamtabnahme und vollständige Oberflächenintegration bleiben AP10/11. Neue Cup-Grafiken und Storyereignisse sind weiterhin AP09 beziehungsweise AP08. Versionsfuß und Build bleiben 121; keine Veröffentlichung.
