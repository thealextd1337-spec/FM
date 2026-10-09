# Saisonabschluss: Finanzen und Vorbereitung

Der bestehende Saisonabschluss setzt sich nach seinen vier Rückblickseiten mit der vollständigen Jahresabrechnung und der bisherigen Vereinsentscheidung fort. Danach bleiben Sponsorwahl, Jugendförderung und Start der folgenden Saison in derselben Abschlussansicht. Die normale Übersicht wird erst mit dem Öffnen der Transfers wieder sichtbar.

`world-payments-ui-v124.js` verwendet die vorhandenen Controller: `v62NextSeason` bereitet wie bisher zuerst die neue Saison und ihren Grundbetrag vor. Danach ist die Sponsorwahl erforderlich, bevor `v124SetYouthBudget` die Jugendförderung bezahlt und die Transfers öffnet. `v67ChooseOffer`, `reviewStep`, die gespeicherten Marktphasen und `v67RunBusy` bleiben maßgeblich. Die Oberfläche erzeugt keine neue Zahlung, Formel, Saisonmigration oder zusätzliche Save-Markierung. Ein gespeicherter Sponsor- oder Budgetzustand nach Saison 1 setzt die Abschlussansicht fort, ohne die früheren Rückblickseiten erneut zu zeigen.

Die Jahresabrechnung liest das bestehende Ledger. Vor dem Saisonwechsel nennt sie die gerade abgeschlossene Saison ausdrücklich; anschließend trennt sie den alten Abschluss von bereits eingegangenen Beträgen und künftigen Gehältern. Saisonnummern werden aus dem aktuellen Zustand gelesen. Die zusätzliche Gestaltung liegt ausschließlich in `ui-flutlicht/views/overview.css` und verwendet die vorhandenen hellen und dunklen Flutlicht-Farben.

## Lokale Prüfung

- `node work/qa-season-close-native119.cjs`: die bestehenden Finance-Close-, Payments- und Youth-/Manager-Suiten bestanden, einschließlich Drei-Saison-Durchlauf, Zahlungszeitpunkten, Budgetpflicht, Gehaltsfälligkeit und gespeicherten Übergängen. Der Runner lädt zusätzlich die inzwischen erforderlichen tatsächlichen reinen Elfmeterschießen-Helfer aus `penalties-v42.js`; unveränderte alte VM-Harnesses lassen diese Abhängigkeit aus.
- `node work/qa-season-close-browser119.cjs`: echte native Saison-1-/Saison-2-Folge in isoliertem Headless-Edge auf eigener Loopback-Seite; 390 × 844 und 931 × 430, jeweils hell und dunkel. Grundbetrag und Jugendförderung werden bei wiederholten Klicks genau einmal gebucht. Sponsorpflicht, JSON-/Reload-Fortsetzung im Budgetschritt, unveränderte künftige Gehälter und gültiger gespeicherter Zustand sind geprüft.
- Vier DOM-Fälle ohne Seitenüberlauf, ohne sichtbares Übersichts-Dashboard während des Abschlusses und ohne JavaScript-Fehler. Zwölf Bilder und Messwerte: `outputs/season-close-119/`. Bildaufnahmen warten auf das Ende der bestehenden Überschriftenanimation.
- Ein zusätzlicher kontrollierter Beschriftungsfall prüft Saison 6. Er ist keine Behauptung über sechs tatsächlich absolvierte Browsersaisons; der native Mehrsaisontest bleibt getrennt.

Quellprüfung und lokale DOM-Abnahme; Produktionsbuild, Veröffentlichung und Live-Abnahme liegen beim Release-Verantwortlichen. Bestehende Tabs, echte Spielstände und Geräte wurden nicht verändert.
