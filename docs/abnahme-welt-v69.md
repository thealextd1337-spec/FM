# Abnahme der neuen Vereinswelt · Block 8

Stand: 24. September 2026. Der Quellstand in `dist/` wurde vor der Veröffentlichung lokal geprüft.

## Ablauf und Prüfumfang

`node work/audit-world-balance-v68.cjs` spielt standardmäßig sechs feste Welten über je zehn Saisons. Das sind 60 Weltjahre mit je 259 Partien und insgesamt 360 Ligatiteln. Die Prüfung erfasst vor jeder Saison die Kaderstärke als Erwartungsrang und nach der Saison den Tabellenrang. Sie kontrolliert außerdem Aufstellungen, einmalige Spiel- und Finanzereignisse, Spielerzuordnungen, Kadergrößen, KI-Konten und Spielstandgröße. Kopien des Spielstands werden nach der Transferphase, während der Saison und nach dem Abschluss validiert; ein erneuter Fortschritt darf eine abgeschlossene Saison nicht nochmals buchen.

Im Browser wurde eine neue Karriere mit Länder- und Vereinswahl, Profil vor Übernahme, Sponsor, fünf Transfertagen und einem vollständigen sichtbaren Match durchlaufen. Im Match wurden die Taktik geändert und zwei Wechsel vorgemerkt und ausgeführt. Ein pausiertes Match kam nach Neuladen bei 52:30 mit unverändertem Spielstand zurück; der Abpfiff wurde mit dem Endergebnis 1:2 in die Karriere übernommen. Die Wettbewerbsansicht wurde bei 390 × 844 Pixeln mit den sechs bestehenden Reitern geprüft; die Seite hatte kein horizontales Überlaufen. Die zugänglichen Beschriftungen eines Spielerprofils nannten nur Fähigkeitsstufen.

## Ergebnis der Langzeitmessung

| Messgröße | Ergebnis |
| --- | ---: |
| Pokalkader zu Ligakader, Median vor Saison 1 / 10 | 0,74 / 0,81 |
| Pokalabstand, Median über alle zehn Saisons | 0,74–0,81 |
| Meister aus den zwei stärksten / mittleren / schwächsten Startkadern | 251 / 87 / 22 von 360 |
| Verschiedene Ligameister | 34 von 36 Vereinen |
| Längste Titelserie in einer Welt | 6 Saisons |
| Mittlerer Abstand zwischen erwartetem und tatsächlichem Tabellenrang | 1,26 Plätze |
| Pokalsiege reiner Pokalvereine | 23 von 360 |
| Trainerentlassungen / Rücktritte / natürliche Managerangebote | 83 / 34 / 20 |
| Verpflichtungen / Pflichtspielminuten ehemaliger Nachwuchsspieler | 1.647 / 3.282.426 |
| Profikader vor Saisonspielen / niedrigster KI-Kontostand | 10–14 / 356 Credits |
| Größter serialisierter Weltspielstand im Sweep | 5,26 MB |

Favoriten gewinnen überwiegend, Außenseiter und reine Pokalvereine gewinnen gelegentlich. Der Pokalabstand bleibt im Mittel nahe am angestrebten Bereich; einzelne Länder können wegen Transfers und sportlicher Erfolge abweichen. KI-Vereine bleiben in allen sechs Welten zahlungsfähig.

Die häufigsten Meister über alle sechs Welten waren `ESP-1` mit 34 und `GER-1` mit 31 Titeln aus jeweils 60 möglichen Saisons. Die mittlere Varianz des Tabellenrangs je Verein beträgt 2,11. Der Audit gibt die sechs häufigsten Meister mit erwartetem Rang, tatsächlichem Rang und Rangvarianz aus.

## Behobene Befunde

- Der alte Audit verglich den vereinbarten Startabstand der Pokalvereine pauschal über sämtliche späteren Saisons. Er misst jetzt Startwert und saisonale Entwicklung getrennt.
- Die Qualität späterer Kader näherte sich zu stark an. Ligavereine bevorzugen bei normalen Marktgeboten einen stärkeren Kandidatenkreis und halten eine Kostenreserve. Die regionale Grundeinnahme der Pokalvereine wurde auf 100 Credits kalibriert; ihre KI-Nachwuchsbudgets richten sich mit kleineren Beträgen nach der Jugendkultur. Neue Jugendspieler reagieren stärker auf tatsächlich gezahlte Budgets. Bestehende Spieler werden dabei nicht umgerechnet.
- Ein reproduzierbarer KI-Verein verlängerte in Saison 5 Verträge, deren Gehälter seine gesicherten Einnahmen im Folgejahr überstiegen. Die KI prüft vor jeder Verlängerung künftige feste Einnahmen, bestehende Gehälter und eine Reserve. Ein gezielter Regressionstest schützt diesen Fall.

## Freigabekriterien und Grenzen

Der Langzeitaudit, zehnjährige Wirtschafts- und Nachwuchstests, Speicher-, Welt-, Trainer-, Match- und Ansichtstests sowie der Einzeldatei-Build bestehen. `test-v55.cjs` prüft Fähigkeitsstufen auch in zugänglichen Beschriftungen. Die bisherigen Tests für KI-Karriere, zwölfjährige Saison, Transferansicht, Pokal und Matchregeln bestehen ebenfalls. Der sichtbare Matchlauf wurde einmal vollständig im Browser geprüft; die 15.540 Audit-Partien verwenden den kompakten Welt-Matchlauf. Die Langzeitmessung ist reproduzierbar, ihre gemessenen Schrittzeiten sind kein Geräteleistungsversprechen.

Die neue Vereinswelt ist damit ein lokal geprüfter Release-Kandidat. Build und bereitgestellte Live-Version werden im Veröffentlichungsprozess gesondert verglichen.
