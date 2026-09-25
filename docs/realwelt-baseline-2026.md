# Realwelt-Baseline für den Welt-Audit

Stand: 25. September 2026. Diese Notiz sammelt **Beobachtungen**, keine
Balanceregeln für Doppel 6. Sie ist der Vergleichsrahmen vor einem späteren
Audit von Trainerwechseln, Kaderbewegung, Jugendminuten und Tabellenverläufen.
Alle Zahlen stammen aus Originalberichten von UEFA oder den betroffenen
Ligen; die Links führen direkt zur jeweiligen Veröffentlichung. Sie betreffen
die üblichen europäischen
11-gegen-11-Ligen mit wesentlich größeren Kadern und längeren Spielzeiten.

## Vergleichbarkeit zuerst

Doppel 6 hat pro Liga sechs Vereine, zehn Ligapartien je Verein und fünf
Feldspieler plus Torwart; die Welt umfasst 48 Vereine in sechs Ländern
(England, Spanien, Italien, Deutschland, Frankreich und Portugal). Die
folgenden 11-gegen-11-Zahlen dürfen daher **nicht** als Sollwerte, absolute
Wechselzahlen oder Punktewerte übertragen werden. Rang 6 und Rang 20 sind
jeweils der letzte Platz, entstehen aber in unterschiedlich großen Ligen mit
unterschiedlich vielen Partien.

Für den späteren Audit werden nur dimensionslose bzw. pro Verein normierte
Messgrößen herangezogen:

| Auditgröße in Doppel 6 | Berechnung im späteren Audit | Wofür sie steht |
| --- | --- | --- |
| Trainerwechselrate | Zahl der tatsächlich vollzogenen Trainerwechsel / Zahl der beobachteten KI-Vereins-Saisons | Kontinuität auf Trainerstelle |
| Spielerfluktuation | Zugänge und Abgänge getrennt, jeweils geteilt durch den Profikader am Saisonstart; zusätzlich Anteil ersetzter Startelfplätze | Kaderbewegung, ohne aus einer realen 25er-Kaderzahl eine Sechser-Kaderzahl abzuleiten |
| U20-Minutenanteil | Ligaminuten von Spielern, die zum Saisonstart jünger als 20 sind / alle Ligaminuten | Direkt vergleichbare Altersgrenze zur UEFA-Quelle; keine Aussage über Akademieherkunft oder Talentstärke |
| Meister-Folgerang | Endrang des Vorjahresmeisters, zusätzlich Absturzindex `(Endrang - 1) / (Ligagröße - 1)` | 0 bedeutet erneuter Titel, 1 bedeutet letzter Platz; Extremabstürze separat zählen |
| Gehaltsquote | Saisongehälter / operative Saisonerträge ohne Transfererlöse; sichere Einnahmen zusätzlich getrennt | finanzielle Tragfähigkeit; Transfererlöse dürfen nicht stillschweigend mit regulären Einnahmen vermischt werden |

Die Tabelle nennt bewusst **keine Grenzwerte**. Die Beobachtungen unten liefern
Kontext; erst ein Audit mehrerer Seeds und Saisons kann zeigen, ob Doppel 6 im
Verhältnis zu seiner kleineren Struktur auffällig wird.

### Die sechs Länder der Spielwelt

Die drei Spalten stammen aus unterschiedlichen UEFA-Erhebungen: Trainerwechsel
2023/24 aus dem [Talentbericht 2024](https://editorial.uefa.com/resources/0292-1c2a6cd356a3-b15a4601a345-1000/european_club_talent_and_competition_landscape_2024_compressed.pdf),
Sommerzugänge 2025 aus dem [Talentbericht 2025](https://editorial.uefa.com/resources/029d-1ebb1aaaa7ca-fb6fe27d6835-1000/uefa_european_club_talent_and_competition_landscape_15_09_25_lowres.pdf)
und U20-Ligaminuten 2023/24 erneut aus dem Talentbericht 2024. Trainer- und
Zugangszahlen sind Durchschnitte je Erstligaverein; U20 ist ein Anteil aller
Ligaminuten. Die Zeiträume und Nenner dürfen nicht zusammengerechnet werden.

| Land | Trainerwechsel je Klub | Klubs mit mindestens einem Trainerwechsel | Senior-Zugänge je Klub im Sommer | U20-Ligaminuten |
| --- | ---: | ---: | ---: | ---: |
| England | 0,5 | 45 % | 8,1 | 4 % |
| Spanien | 1,0 | 55 % | 7,9 | 4 % |
| Italien | 1,4 | 85 % | 10,6 | 3 % |
| Deutschland | 0,8 | 50 % | 7,6 | 3 % |
| Frankreich | 0,9 | 61 % | 8,8 | 8 % |
| Portugal | 1,5 | 78 % | 12,2 | 4 % |

## Beobachtungen aus dem europäischen Profifußball

### 1. Trainerwechsel

| Geografie und Zeitraum | Nenner und Definition | Beobachtung | Originalquelle |
| --- | --- | --- | --- |
| 54 europäische Männer-Erstligen, Saison 2023/24; bei Winterligen 1. Juli 2023–30. Juni 2024, bei Sommerligen Kalenderjahr 2023 | 732 Cheftrainerstellen. Gezählt sind Trainerwechsel während der Saison; Interimsbesetzungen unter 30 Tagen sind ausgeschlossen. Ein Wechsel ist daher nicht automatisch eine Entlassung. | **779** Cheftrainerwechsel; **63 %** der Vereine wechselten mindestens einmal. Das entspricht 1,06 Wechseln je beobachteter Stelle, ohne daraus eine Spielregel abzuleiten. | UEFA Intelligence Centre, *European Club Talent and Competition Landscape 2024*, „Head coach turnover“, veröffentlicht 12.09.2024, [Direkt-PDF](https://editorial.uefa.com/resources/0292-1c2a6cd356a3-b15a4601a345-1000/european_club_talent_and_competition_landscape_2024_compressed.pdf), [UEFA-Mitteilung mit Datum](https://www.uefa.com/news-media/news/0291-1bd655648c06-6b05b0dbe265-1000--new-uefa-lands/). |

**Übertragbarkeit:** Für Doppel 6 ist die Rate „Wechsel pro KI-Verein und
Saison“ aussagekräftiger als 779 oder 1,06. Der UEFA-Zähler trennt außerdem
nicht automatisch Kündigung, Rücktritt, Vertragsende und vereinbarten Wechsel;
der Spiel-Audit sollte diese Ereignisse getrennt protokollieren.

### 2. Kaderfluktuation und Transferaktivität

| Geografie und Zeitraum | Nenner und Definition | Beobachtung | Originalquelle |
| --- | --- | --- | --- |
| Europäische Erstligavereine in der UEFA-Transferauswertung, Sommertransferfenster 2025 | Durchschnitt je Erstligaverein. „Inbound senior players“ umfasst Käufe, Leihen und ablösefreie Zugänge; gemessen werden Zugänge, keine Netto-Kaderänderung und keine Abgänge. | Im Mittel **9,3** neue Seniorenspieler pro Verein, **+3,4 %** gegenüber der vergleichbaren Basis 2024. | UEFA Intelligence Centre, *European Club Talent and Competition Landscape 2025*, Kapitel 2, S. 26, veröffentlicht 15.09.2025, [Direkt-PDF](https://editorial.uefa.com/resources/029d-1ebb1aaaa7ca-fb6fe27d6835-1000/uefa_european_club_talent_and_competition_landscape_15_09_25_lowres.pdf), [UEFA-Mitteilung mit Datum](https://www.uefa.com/news-media/news/029d-1ebb17a852a6-fa4e86c59d7d-1000--five-european-football-trends-from-record-attendances-to/). |

**Übertragbarkeit:** Die 9,3 sind eine Sommerfenster-Zahl großer
11-gegen-11-Kader. Der Audit misst deshalb bei Doppel 6 Zugänge, Abgänge und
ersetzte Startelfplätze getrennt als Anteile des Saisonstartkaders. Ein
Zugang ist nicht gleichbedeutend mit einem Wechsel in die Startelf.

### 3. Jugendintegration

| Geografie und Zeitraum | Nenner und Definition | Beobachtung | Originalquelle |
| --- | --- | --- | --- |
| 20 europäische Topligen, nationale Erstligasaison 2023/24 | Anteil aller Ligaminuten; Alter ist das Alter zum Saisonbeginn, nicht Herkunft aus einer Akademie und nicht das Alter am einzelnen Spieltag. | U20-Spieler spielten **6 %** aller Ligaminuten. In Frankreich waren es **8 %**. | UEFA Intelligence Centre, *European Club Talent and Competition Landscape 2024*, „Domestic league squad profiles“, Tabelle „Total domestic league minutes broken down by player age (2023/24)“, veröffentlicht 12.09.2024, [Direkt-PDF](https://editorial.uefa.com/resources/0292-1c2a6cd356a3-b15a4601a345-1000/european_club_talent_and_competition_landscape_2024_compressed.pdf), [UEFA-Mitteilung mit Datum](https://www.uefa.com/news-media/news/0291-1bd655648c06-6b05b0dbe265-1000--new-uefa-lands/). |

**Übertragbarkeit:** Der spätere Spiel-Audit soll dieselbe U20-Altersgrenze
und ausschließlich Ligaminuten zum direkten Vergleich verwenden. Zusätzlich
kann er Nachwuchsspieler unabhängig vom Alter getrennt betrachten. Minuten
zeigen Einsatz, nicht Fähigkeit. Diese Beobachtung rechtfertigt
also weder direkte Fähigkeitswerte noch eine Quote für starke Jugendspieler.

### 4. Meister- und Rangvolatilität

| Geografie und Zeitraum | Nenner und Definition | Beobachtung | Originalquelle |
| --- | --- | --- | --- |
| Nationale europäische Männer-Erstligen, Saison 2024/25; Vergleich mit 2023/24 | Ein „non-repeat title winner“ ist ein Meister, der den Titel aus der Vorsaison nicht verteidigte. Der Bericht nennt an dieser Stelle keine explizite Gesamtzahl der berücksichtigten Länder. | **31** nicht wiederholte Meister; ebenso viele wie 2023/24. Damit gab es erstmals seit 2011/12 in zwei aufeinanderfolgenden Saisons jeweils mehr als 30 neue Meister. | UEFA Intelligence Centre, *European Club Talent and Competition Landscape 2025*, Kapitel 5, S. 66, veröffentlicht 15.09.2025, [Direkt-PDF](https://editorial.uefa.com/resources/029d-1ebb1aaaa7ca-fb6fe27d6835-1000/uefa_european_club_talent_and_competition_landscape_15_09_25_lowres.pdf), [UEFA-Mitteilung mit Datum](https://www.uefa.com/news-media/news/029d-1ebb17a852a6-fa4e86c59d7d-1000--five-european-football-trends-from-record-attendances-to/). |

**Übertragbarkeit:** Dies misst Wechsel an der Tabellenspitze, keine
Verteilung aller Folgeränge und insbesondere keine Häufigkeit „Meister wird
Letzter“. Der spätere Audit muss deshalb für jeden Vorjahresmeister dessen
relativen Folgerang speichern und Extremereignisse separat zählen. Aus den 31
Titelwechseln folgt kein zulässiger oder erwarteter Letztrang in Doppel 6.

Konkrete Extremfälle zeigen die Spannweite: Der englische Meister Chelsea
fiel von Rang 1 (2014/15) auf Rang 10 von 20 (2015/16), Leicester von Rang 1
(2015/16) auf Rang 12 von 20 (2016/17). Die
[Premier League dokumentiert beide Folgeränge](https://www.premierleague.com/en/news/666133).
Ihre Übersicht über **25 Titelverteidigungen von 1992/93 bis 2016/17** nennt
**keinen letzten Platz** im Folgejahr; diese Null ist aus der
Premier-League-Übersicht gezählt, keine UEFA-Kennzahl. Leeds landete als
frühester Extremfall 1992/93 auf Rang 17.
Der 1967/68 gekürte 1. FC Nürnberg stieg als Titelverteidiger 1968/69 ab;
laut [Bundesliga-Chronik](https://www.bundesliga.com/en/bundesliga/news/all-clubs-that-have-played-in-germany-s-top-flight-bayern-munich-dortmund-24106)
war dies in der Bundesliga einmalig. Das sind Fälle, keine Häufigkeitsverteilung
für die sechs Zielländer und keine Regel für Doppel 6.

### 5. Spiel- und Ergebnisverteilung (ergänzende Plausibilitätsanker)

| Geografie und Zeitraum | Nenner und Definition | Beobachtung | Originalquelle |
| --- | --- | --- | --- |
| Europäische Männer-Erstligen, Saison 2024/25 | UEFA-Wettbewerbsbenchmark: Tore je Ligapartie, Anteil gewonnener Heimspiele sowie Punkte je Ligaspiel des jeweiligen Meisters. Die Kennzahlen haben verschiedene Nenner. | **2,74** Tore je Partie, **43 %** Heimsiege und **2,25** Punkte je Partie des Meisters. | UEFA Intelligence Centre, *European Club Talent and Competition Landscape 2025*, Kapitel 5, S. 67, veröffentlicht 15.09.2025, [Direkt-PDF](https://editorial.uefa.com/resources/029d-1ebb1aaaa7ca-fb6fe27d6835-1000/uefa_european_club_talent_and_competition_landscape_15_09_25_lowres.pdf). |

| Europas Big Five (England, Spanien, Italien, Deutschland, Frankreich), Ligapartien 2024/25 | Anteil aller nationalen Erstligapartien, deren Endergebnis eine Tordifferenz von mindestens drei Toren aufwies. Portugal ist in dieser Gruppe nicht enthalten. | **15,4 %** der Partien endeten mit mindestens drei Toren Differenz (2023/24: 17,8 %; 2022/23: 16,7 %). | UEFA Intelligence Centre, *European Club Talent and Competition Landscape 2025*, Kapitel 5, Tabelle „Evolution of uneven matches“, S. 66, veröffentlicht 15.09.2025, [Direkt-PDF](https://editorial.uefa.com/resources/029d-1ebb1aaaa7ca-fb6fe27d6835-1000/uefa_european_club_talent_and_competition_landscape_15_09_25_lowres.pdf), [UEFA-Mitteilung mit Datum](https://www.uefa.com/news-media/news/029d-1ebb17a852a6-fa4e86c59d7d-1000--five-european-football-trends-from-record-attendances-to/). |

**Übertragbarkeit:** Dieser Wert kann nur als Richtungscheck für die Häufigkeit
deutlicher Ergebnisse dienen. Kleinere 6-gegen-6-Spiele und eine Saison mit nur
zehn Partien je Verein erzeugen eine andere Tor- und Varianzverteilung; aus
15,4 % wird kein Doppel-6-Zielwert.

### 6. Gehaltsquote (ergänzender Finanzanker)

| Geografie und Zeitraum | Nenner und Definition | Beobachtung | Originalquelle |
| --- | --- | --- | --- |
| Mehr als 700 europäische Männer-Erstligavereine, Geschäftsjahr 2023 | „Wage ratio“ = gesamte Lohnkosten geteilt durch Umsatz; es sind nicht nur Spielergehälter und nicht nur die sechs Doppel-6-Länder. | **61 %** Lohnquote; die Lohnkosten stiegen 2023 um **6,8 %**, langsamer als der Umsatz. | UEFA Intelligence Centre, *European Club Finance and Investment Landscape 2024*, Bereich „Club costs“, veröffentlicht 07.03.2025; [Berichtsseite](https://ecfil.uefa.com/2024), [UEFA-Mitteilung mit Datum](https://www.uefa.com/news-media/news/0297-1d383b3db8cf-c39b47ec90cc-1000--record-annual-revenue-increase-reported-in-latest-europe/). |

**Übertragbarkeit:** Die Quelle umfasst auch Trainer-, Technik- und
Verwaltungsgehälter. Doppel 6 sollte dagegen zunächst eine explizit definierte
Spielergehaltsquote berichten und sie nicht mit Transfererlösen verrechnen.
Die 61 % sind wegen abweichender Einnahmestruktur, Kostenarten und Skalierung
kein Spielziel.

## Belegte Lücken und Umgang damit

- **Meister bis Letzter:** Die 25 englischen Titelverteidigungen liefern einen
  konkreten Null-Befund. Es fehlt aber eine gemeinsame 2015–2025-Verteilung
  der Folgeränge früherer Meister in genau den sechs Zielländern. Aus dem
  englischen Befund wird daher keine Wahrscheinlichkeit für Rang 6 abgeleitet.
  Der spätere Audit liefert diese Verteilung zunächst aus Doppel-6-Simulationen
  und weist sie ausdrücklich als Spielmessung aus.
- **Kaderchurn als Netto- und Startelfrate:** Die belastbare UEFA-Zahl misst
  Sommerzugänge, nicht Abgänge, Vertragsenden oder ersetzte Startelfplätze.
  Daher bleiben die genannten Doppel-6-Anteile Messgrößen, keine Vergleiche
  mit einer vorgegebenen Realweltquote.
- **Jugendstärke:** Es gibt hier keinen belastbaren direkten Vergleich für
  Fähigkeiten von Jugendspielern. Einsatzminuten sind ein beobachtbarer Proxy.
  Der spätere Spiel-Audit muss die interne Fähigkeitsverteilung neuer Talente
  zusätzlich mit der etablierter Profis vergleichen, ohne Einzelwerte in der
  Spieloberfläche offenzulegen.
- **Portugal in der Ergebnisreihe:** Der UEFA-Wert zu hohen Siegen umfasst die
  Big Five und lässt Portugal aus. Er ist kein Sechs-Länder-Aggregat.

## Schluss für den späteren Audit

Die Realwelt zeigt gleichzeitig häufige Trainer- und Kaderbewegung,
nachweisbare aber begrenzte sehr junge Einsatzzeit und regelmäßige
Meisterwechsel. Sie liefert keine Rechtfertigung für beliebig schnelle
Kadererneuerung, zahlenmäßig starke Jugendspieler oder einen abrupten
Folgerang des Meisters als Regelfall. Der Audit soll deshalb die oben definierten
Messgrößen pro Land, Saison und Verein ausgeben, mit Ligagröße normalisieren
und die Realweltangaben lediglich danebenstellen.
