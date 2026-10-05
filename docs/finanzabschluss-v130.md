# Finanzabschluss am Saisonübergang

Stand: 5. Oktober 2026. Lokal in Spiel und Offline-Build integriert; noch nicht veröffentlicht.

Nach Saisonrückblick und Vereinsentscheidung beginnt die neue Saison. Die bestehende Sponsorwahl bleibt ein eigener Schritt. Nach ihrer Bestätigung zeigt die Übersicht den Finanzabschluss mit Jugendförderung, bevor die Transferphase geöffnet wird. Andere Übersichtskarten bleiben während dieser Entscheidung ausgeblendet und erscheinen nach der Budgetzahlung wieder. Der Ablauf gilt für Karrieren mit dem bereits eingeführten Zahlungsplan; Karrieren ohne diesen Marker behalten ihre bisherige Oberfläche und Reihenfolge.

## Abrechnung und Vorbereitung

Die Jahresabrechnung enthält Anfangskontostand, sämtliche Einnahmen und Ausgaben nach Herkunft, Jahresbilanz und Schlusskontostand. Transfererlöse, Transferausgaben und Ausbildungsentschädigungen bei Jugendübernahmen werden separat ausgewiesen. Weitere Buchungsarten erscheinen unter weiteren Einnahmen beziehungsweise Ausgaben, sodass keine Geldbewegung aus den Summen verschwindet. Angefallene Jahresgehälter stehen mit dem tatsächlichen gezahlten Betrag und dem Hinweis auf die abgeschlossene Zahlung in der Abrechnung.

Der Schlusskontostand wird als Übertrag in die neue Saison gezeigt. Danach folgen der bereits gebuchte Jahresgrundbetrag, das bereits eingegangene Fixum des zuvor gewählten Sponsors und der aktuelle Kontostand. Bei einem Vereinswechsel beziehen sich Abrechnung und Übertrag auf den jetzt geführten Verein. In Saison 1 wird stattdessen der Karrierestart mit Startkapital gezeigt; eine vergangene Saison wird nicht erfunden.

Für den menschlich geführten Verein ersetzen drei feste Stufen die freie Sliderwahl: Förderpause mit 0 Credits, Basisförderung mit 200 Credits und intensive Förderung mit 400 Credits. Nicht gedeckte Stufen sind deaktiviert; unter 200 Credits wird die Förderpause vorausgewählt. Die Auswahl aktualisiert Kontostand nach Budgetzahlung und Rest nach den derzeit vereinbarten Gehältern. Ein negativer Rest wird sichtbar hervorgehoben. Die Förderung wird erst bei Bestätigung bezahlt; der bestehende Buchungsschutz verhindert eine zweite Zahlung.

Die projizierten Gehälter gehören ausdrücklich zur neuen Saison, werden erst an deren Ende bezahlt und ändern sich bei neuen Verträgen oder Transfers. Die einfache Restberechnung enthält keine weiteren Einnahmen oder Transfers; unverdiente Sponsorboni werden nicht als verfügbares Geld behandelt. Die bestehende sichere Schlussprognose in der Vereinsansicht bleibt zusätzlich erhalten.

## Technik und Prüfung

`dist/world-payments-ui-v124.js` liest die für die vorige Saison vollständig aufbewahrten Buchungen. Die Abschlussanzeige subtrahiert bereits gebuchte Zahlungen der neuen Saison vom aktuellen Kontostand, statt Grundbetrag und Sponsorfixum der alten Saison zuzuschlagen. Das Lesen verändert den Spielstand nicht; neue Speicherfelder, rückwirkende Buchungen und zusätzliche Zahlungen werden nicht eingeführt. Die bisherigen Regeln für KI-Budgets, Nachwuchserzeugung und Spielerentwicklung bleiben für diese UI-Integration bestehen.

`work/test-finance-close-v130.cjs` gleicht Einnahmen, Ausgaben, Anfangs- und Schlusskontostände aller 48 Vereine ab, prüft Gehaltsbuchungen, zusätzliche Buchungsarten, unveränderte Karrieredaten, gedeckte Förderstufen und einmalige Zahlung. Die vorhandenen Zahlungs-, Nachwuchs-, Speicher- und Übersetzungsprüfungen bestanden ebenfalls.

`work/check-finance-close-v130.cjs` prüft Quellseite und Offline-Build jeweils mit einer isolierten Testkarriere über den ersten Saisonwechsel. Sponsorwahl davor, Karrierestart, tatsächliche bezahlte Jahresgehälter, Übertrag, neue Gehaltsprojektion, Auswahl und Zahlung, Speichern/Neuladen sowie Deutsch/Englisch und 320/390/1280 Pixel wurden geprüft. [Browsernachweis](../outputs/finance-close-v130/browser-check.json), [deutsche Mobilansicht](../outputs/finance-close-v130/source-de-mobile.png), [englische Desktopansicht](../outputs/finance-close-v130/source-en-desktop.png).

## Ergänzung der Zehn-Saisonen-Auswertung

Der [Finanzbericht](../outputs/finance-v124/finance-report.html) enthält für den gewählten Verein eine eigene Jahrestabelle mit Anzahl der Jugendübernahmen, gezahlten Ausbildungsentschädigungen, Transfereinnahmen, Transferausgaben und Transfersaldo. CSV und JSON führen die Anzahl als `youthPromotions` zusätzlich zu den vorhandenen Geldbeträgen. Sie wird bei jedem Audit aus den tatsächlichen Übernahmebuchungen gezählt. Beim Mittel über mehrere Welten dürfen Bruchteile erscheinen; einzelne Vereinsjahre enthalten ausschließlich ganzzahlige Vorgänge. Pokal-Simulationsteams haben keine Jugendübernahmen oder Transfers.

## Beschlossene Weiterentwicklung der Jugendarbeit

Die neue Akademie ist ein eigener, noch nicht implementierter Regelbaustein: pro Saison 5–10 zunächst ungesichtete Kandidaten, bis zum letzten Transfertag höchstens zwei Aufnahmen insgesamt in Akademie oder Kampfmannschaft und Fähigkeiten erst nach bezahlter Sichtung als Farbstufen. Sofort einsatzfähige Spieler sollen selten bleiben. Abrechnungsansicht und Förderstufen setzen diese Nachwuchsregeln noch nicht um. Sichtungsgebühr pro Spieler beziehungsweise Jahrgang und die Entwicklung ohne Profieinsätze sind noch offen; danach folgen Implementierung und erneute Zehn-Saisonen-Prüfung.
