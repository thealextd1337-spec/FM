# Nationalitäten und Herkunft – Plan

Status: Länderregister, Herkunftserzeugung für Jugend, Startprofis und freie Spieler sowie Marktfilter und Nationalitätsanzeige umgesetzt. Eine neue portugiesische Karriere wurde im Browser auf Deutsch und Englisch, nach Neuladen und bei 375 Pixeln Breite geprüft. Export/Import und Transfers bestanden die gezielten Node-Tests; der direkte Import über die Browseroberfläche bleibt vor der Freigabe zu prüfen. Gilt für neu angelegte Vereinswelten. Vorhandene Spielstände sind kein Teil dieser Planung. Die sechs bestehenden Ligen und ihre 48 Vereine bleiben bestehen.

## Länderpool

Der Pool umfasst **101 Nationalitäten**. Die Zugehörigkeit zur UEFA zählt nach Verband, nicht nach geografischer Lage. Für Südamerika zählen die zwölf souveränen Staaten einschließlich Guyana und Suriname; beide gehören fußballerisch zur CONCACAF. Die neun asiatischen Länder sind ausdrücklich ausgewählt. Die mittelamerikanischen Top 5 und afrikanischen Top 15 werden einmalig nach der offiziellen FIFA-Männerrangliste vom **20. Juli 2026** festgelegt. Spätere Ranglistenänderungen ändern die Auswahl auch in neuen Karrieren nicht. Australien zählt separat.

| Gruppe | Anzahl | Nationalitäten |
| --- | ---: | --- |
| UEFA | 55 | Albanien, Andorra, Armenien, Aserbaidschan, Belarus, Belgien, Bosnien und Herzegowina, Bulgarien, Dänemark, Deutschland, England, Estland, Färöer, Finnland, Frankreich, Georgien, Gibraltar, Griechenland, Irland, Island, Israel, Italien, Kasachstan, Kosovo, Kroatien, Lettland, Liechtenstein, Litauen, Luxemburg, Malta, Moldau, Montenegro, Niederlande, Nordirland, Nordmazedonien, Norwegen, Österreich, Polen, Portugal, Rumänien, Russland, San Marino, Schottland, Schweden, Schweiz, Serbien, Slowakei, Slowenien, Spanien, Tschechien, Türkei, Ukraine, Ungarn, Wales, Zypern |
| Nordamerika | 3 | USA, Kanada, Mexiko |
| Südamerika | 12 | Argentinien, Bolivien, Brasilien, Chile, Ecuador, Guyana, Kolumbien, Paraguay, Peru, Suriname, Uruguay, Venezuela |
| Asien, feste Auswahl | 9 | Japan, Südkorea, China, Iran, Indien, Saudi-Arabien, Tadschikistan, Kirgisistan, Thailand |
| Ozeanien | 2 | Australien, Neuseeland |
| Mittelamerika, Top 5 | 5 | Panama, Costa Rica, Honduras, Guatemala, El Salvador |
| Afrika, Top 15 | 15 | Marokko, Senegal, Ägypten, Nigeria, Algerien, Elfenbeinküste, DR Kongo, Kamerun, Mali, Südafrika, Tunesien, Burkina Faso, Kap Verde, Ghana, Guinea |

Auswahlquellen: [UEFA-Mitgliedsverbände](https://www.uefa.com/nationalassociations/), [CONCACAF-Mitgliedsverbände](https://www.concacaf.com/inside-concacaf/member-associations), [CAF-Mitgliedsverbände](https://www.cafonline.com/en/inside-caf/about-us/official-documents/member-associations/) und [FIFA-Männerrangliste vom 20. Juli 2026](https://inside.fifa.com/fifa-rankings/world-ranking/men). Als Mittelamerika gelten hier Belize, Costa Rica, El Salvador, Guatemala, Honduras, Nicaragua und Panama; die fünf zum Stichtag bestplatzierten stehen oben. Die afrikanischen Top 15 sind die bestplatzierten CAF-Verbände am selben Stichtag. Ihre Weltränge in Tabellenreihenfolge: 6, 18, 24, 26, 29, 31, 41, 43, 53, 54, 57, 62, 64, 65 und 81. Guinea liegt damit auf Platz 15 der CAF-Auswahl. Die neun asiatischen Länder sind eine feste Nutzerentscheidung und keine aus der Rangliste abgeleitete Top-5-Gruppe. Alle zwölf souveränen südamerikanischen Staaten bleiben enthalten, auch wenn Guyana und Suriname in der CONCACAF spielen.

## Herkunft neuer Spieler

- **Jugendspieler:** Pro neu erzeugtem Spieler zuerst die Herkunftsgruppe ziehen: 60 % Nationalität des Vereinslandes, 30 % aus der festen Nachbar- und Partnergruppe, 10 % aus dem übrigen Pool. Vereinsland und Partnergruppe sind aus der letzten Gruppe ausgeschlossen. Jede Nationalität ihrer Gruppe erhält eine positive, kuratierte Wahrscheinlichkeit. Die 60/30/10 beziehen sich auf Erzeugungen über viele Karrieren, nicht auf jeden einzelnen kleinen Nachwuchskader.
- Für fünf Ligastandorte besteht die 30-%-Gruppe aus direkten Landnachbarn: England: Schottland, Wales. Spanien: Andorra, Frankreich, Gibraltar, Portugal. Italien: Frankreich, Österreich, San Marino, Schweiz, Slowenien. Deutschland: Belgien, Dänemark, Frankreich, Luxemburg, Niederlande, Österreich, Polen, Schweiz, Tschechien. Frankreich: Andorra, Belgien, Deutschland, Italien, Luxemburg, Spanien, Schweiz. Grenzen über See und außereuropäische Gebiete zählen hier nicht. **Portugal erhält die ausdrücklich gewünschte Ausnahme:** Spanien und Brasilien bilden seine 30-%-Gruppe. Brasilien ist hier Herkunftspartner, kein geografisches Nachbarland.
- **Startprofis und neue freie Spieler:** Beide Erzeugungswege nutzen eigene, je Liga festgelegte Heimatanteile und regionale Routen. Heimische und regionale Nationalitäten sind häufiger; alle 101 bleiben möglich. Die Gewichte sind redaktionelle Näherungen anhand von [CIES-Migrationsrouten](https://football-observatory.com/Football-s-major-migration-routes-revealed) und [CIES-Exportdaten](https://football-observatory.com/IMG/sites/b5wp/2025/wp546/en/), keine amtlichen Nationalitätsquoten. Die FIFA-Rangliste bestimmt weder diese Gewichte noch Fähigkeiten, Potenzial oder Marktwert. Die Jugendquote von 60/30/10 gilt hier nicht.
- **Transfers:** Die gespeicherte Nationalität bleibt erhalten. Vereinswechsel, Trikot und Wohnort würfeln keine Herkunft neu. Es gibt keine Ausländerquote und keinen Nationalitätsbonus im Match.

## Namen und Darstellung

- Jede Nationalität bekommt kuratierte Vor- und Nachnamen mit landesüblichen Schreibweisen und Varianten. Erst die Nationalität, dann unabhängig davon Vor- und Nachname ziehen. Größere Pools der sechs Ligastandorte und eine Dublettenprüfung pro Verein reduzieren Serien wie „Pérez“; weitere Namensdaten können redaktionell ergänzt werden.
- Flagge, Landesname, Suchfilter und Spielerprofil verwenden dieselbe zentrale Länderregistrierung. Sie enthält einen stabilen Spielcode und einen passenden Flaggen- bzw. ISO-2-Code; England, Schottland, Wales und Nordirland benötigen eigene Fußballflaggen. Unbekannte Codes erhalten einen neutralen Fallback.
- Nationalität ist kein eindeutiger Hinweis auf Hautton oder Frisur. Das geplante Sprite-System verwendet breite, sanft gewichtete Verteilungen mit Ausnahmen für jede Nationalität. Alle Hauttöne, Haarfarben und Frisuren bleiben möglich. Diese Gewichte sind redaktionelle Annäherungen an den Fußballspielerpool, keine amtlichen demografischen Aussagen.

## Umsetzung in fünf Etappen

### 1. Stammdaten und Schnittstelle

- Eine eigene, versionierte Nationalitäten-Datei in `dist/` anlegen und **vor** `world-foundation-v61.js` laden. `dist/index.html`, `work/build.cjs` und die betroffenen Node-Testkontexte laden dieselbe Datei in derselben Reihenfolge. Die konkrete Versionsendung wird beim Implementieren festgelegt.
- Jeder Eintrag enthält stabilen Spielcode, deutschen und englischen Namen, Flaggenkennung, Gruppe und Namensdaten. Die sechs Liga-Codes in `v61Countries` bleiben getrennt. `career.world.countries` enthält weiterhin genau sechs Einträge. Trainer und ihre bestehende Sechs-Länder-Namenswahl bleiben zunächst unverändert; `v61Names` darf deshalb erst entfernt werden, wenn diese Aufrufstelle umgestellt ist.
- Ein Datencheck prüft exakt 101 eindeutige Codes, neun fest ausgewählte asiatische Länder, die afrikanischen Top 15, vollständige Namen und Flaggen sowie die sechs gültigen Nachbar- und Partnertabellen. Der FIFA-Stichtag und die Ranglistenauswahl werden als feste Daten dokumentiert; es gibt keinen Netzwerkabruf zur Laufzeit.

### 2. Namensdaten und Ziehung

- Für jede Nationalität kuratierte Vor- und Nachnamen als lokale Daten ergänzen. Akzente und mehrteilige Namen bleiben erhalten. Besonders die bisherigen sechs Länder erhalten größere Listen; damit sinkt die Wiederholung von häufigen Namen wie „Pérez“. Vorname und Nachname werden getrennt gezogen, vollständige Dubletten innerhalb eines Vereins werden neu gezogen.
- Eine gemeinsame Funktion erhält `Spieler-ID`, `Vereinsland` und `Erzeugungsart` und liefert Nationalität und Namen. Ihre Zufallsquelle ist von Fähigkeiten, Potenzial, Alter, Vereinswirtschaft und Matchresultaten getrennt. Für freie Spieler zählt ihre **endgültige** Spieler-ID, nicht eine vorläufige ID des Hilfskaders.
- Kleine Länder bleiben erreichbar, ohne dass ein einzelner Name übermäßig oft erscheint. Die Namenslisten werden redaktionell auf Schreibweise, unnötige Dopplungen und falsche Länderzuordnung geprüft.

### 3. Drei Erzeugungswege

- `dist/world-youth-manager-v67.js`: Bei jedem **neu erzeugten** Jugendspieler zuerst die Herkunftsgruppe mit 60/30/10 ziehen, danach innerhalb der Gruppe die Nationalität. Für den Restpool Vereinsland und Partnergruppe ausschließen. Die vorhandene Talent- und Budgetberechnung unverändert lassen.
- `dist/world-foundation-v61.js`: Startkader neuer Karrieren anhand eigener Liga-Profile erzeugen; die sechs Liga-Codes weiterhin für Vereine und Wettbewerbe nutzen. Nation und Name aus getrenntem Zufall beziehen.
- `dist/world-economy-v66.js`: Zahl und Positionen der freien Spieler bleiben wie bisher. Die sechs Produktionsgruppen dienen nur der Marktmenge; die Spielernationalität wird anschließend aus dem 101er-Pool gezogen. Damit entstehen keine 101 Produktionsgruppen oder zusätzlichen Spieler pro Saison.
- Profis und freie Spieler nutzen getrennte feste Heimatanteile, dieselben ligaabhängigen Herkunftsrouten und den gewichteten Restpool. Die Tabellen werden gegen veröffentlichte CIES-Migrationswege und Expatriiertenanteile auf Plausibilität geprüft; sie bilden keine Statistik exakt ab. Die FIFA-Nationalmannschaftsrangliste wird dafür nicht verwendet.

### 4. Anzeigen und neue Karrieren

- `v61FlagSVG` und alle Vereinswelt-Spielerprofile, Nachwuchs- und Transferansichten verwenden die neue Spielerregistrierung. Liga- und Pokaltexte behalten die sechs Vereinsländer. Für England, Schottland, Wales und Nordirland gibt es bewusst gepflegte Fußballflaggen statt ungültiger Drei-Buchstaben-Emoji. Ein unbekannter Code zeigt einen neutralen Namen und eine neutrale Flagge statt leerer Ausgabe.
- Der Marktfilter trennt „Vereinsland“ für gebundene Profis von „Nationalität“ für freie Spieler. Alle 101 Nationalitäten sind bei freien Spielern auswählbar; Filter mit null Treffern bleiben verständlich. Neue sichtbare Texte erhalten Deutsch und Englisch über `dist/i18n-v75.js` oder die zentrale Registrierungsfunktion.
- In neu angelegten Karrieren bleiben `nation`, `name` und `pid` beim Speichern, Laden, Exportieren, Importieren und Transfer erhalten. Das Spielerobjektformat wird für diese Daten nicht erweitert.

### 5. Abnahme und Freigabe

- Neuer gezielter Node-Test: alle 101 Einträge, Nachbarn, Gruppen ohne Überschneidung, Namenslisten, Flaggen, reproduzierbare Ziehung und jede Nationalität über feste Seeds erreichbar. Mindestens 20.000 Jugendziehungen aus den sechs Vereinsländern prüfen die Gruppenquoten mit enger, vorab festgelegter Toleranz; jede Herkunftsgruppe besitzt pro Verein gültige Kandidaten.
- Tests für Weltgründung, Jugend, Wirtschaft und Speichern neu angelegter Karrieren ausführen. Prüfen: weiter sechs Ligen, 48 Vereine, 10 Start-Freie und unveränderte Positionsmischung. `node work/build.cjs` muss die neue Datendatei in die Einzeldatei übernehmen.
- Im Browser Deutsch/Englisch, Spielerprofile, Jugendpool, freien Marktfilter und schmale Bildschirmbreiten durchgehen. Nach Abschluss einen Eintrag unter „Noch nicht veröffentlicht“ in `docs/CHANGELOG.md` ergänzen. Keine Veröffentlichung ist Teil dieser Etappen.

## Kalibrierung der Jugendherkunft

Die folgenden Werte sind **Entwurfsgewichte innerhalb der 30-%-Gruppe**, keine gemessenen Bevölkerungs- oder Spielernationalitätsquoten. Die übergeordnete Jugendverteilung bleibt 60/30/10. Jede Zeile summiert sich auf 100 %. Portugal behandelt Brasilien als Herkunftspartner; dort führen 60 % der 30-%-Gruppe zu Brasilien und 40 % zu Spanien, also über viele Erzeugungen ungefähr 18 % brasilianische und 12 % spanische Jugendspieler.

| Vereinsland | Gewichte innerhalb der 30-%-Gruppe |
| --- | --- |
| England | Schottland 65 %, Wales 35 % |
| Spanien | Frankreich 55 %, Portugal 43 %, Andorra 1 %, Gibraltar 1 % |
| Italien | Frankreich 49 %, Schweiz 24 %, Österreich 14 %, Slowenien 12 %, San Marino 1 % |
| Deutschland | Frankreich 20 %, Niederlande 17 %, Polen 16 %, Tschechien 12 %, Österreich 11 %, Belgien 9 %, Dänemark 8 %, Schweiz 5 %, Luxemburg 2 % |
| Frankreich | Deutschland 25 %, Spanien 22 %, Belgien 18 %, Schweiz 16 %, Italien 15 %, Luxemburg 3 %, Andorra 1 % |
| Portugal | Brasilien 60 %, Spanien 40 % |

**Restgruppe (10 %):** Nach Ausschluss von Vereinsland und Partnergruppe erhält jedes verbleibende Land einen kuratierten Wert von 1, 2, 4, 8 oder 16 Punkten. Die groben Exportstärkestufen orientieren sich am [CIES-Exportbericht vom 1. Mai 2026](https://football-observatory.com/IMG/sites/b5wp/2025/wp546/en/), bilden dessen Rangfolge aber nicht exakt ab. Die Punkte werden innerhalb jedes Vereinslands neu normiert und bleiben als lokale Datentabelle eingefroren. So bleiben auch kleine Länder möglich, während große Fußball-Exportländer häufiger erscheinen. Für Portugal wird Brasilien vor dieser Ziehung ausgeschlossen, da es bereits in der 30-%-Gruppe liegt.

Die [CIES-Migrationsdaten](https://football-observatory.com/-Tools-) zählen Spieler nach dem Verband, in dem sie aufgewachsen sind; das Spiel speichert eine Nationalität. Die Daten sind deshalb ein **Proxy**, keine direkte Nationalitätsstatistik. Die starke Verbindung Brasilien–Portugal stützt die [CIES-Auswertung 2026](https://football-observatory.com/IMG/sites/b5wp/2025/wp546/en/), die Portugal als wichtigstes Ziel brasilianischer Exporte nennt. Das Verhältnis 60/40 und die übrigen Nachbargewichte sind redaktionelle Spielwerte und werden durch Stichproben geprüft.

**Prüfung:** Je Vereinsland mindestens 20.000 feste Seed-Ziehungen. Kontrollieren: 60/30/10 innerhalb vorab festgelegter Toleranz, Tabellen zu 100 %, kein Land in zwei Gruppen, alle 101 Nationalitäten über alle Vereinsländer erreichbar, plausible Häufigkeiten seltener Länder und keine übermäßige Wiederholung einzelner Namen. Die getrennten Heimatanteile für Startprofis und freie Spieler werden ebenfalls über feste Seeds geprüft; die Jugendwerte gelten dort nicht. Der 20. Juli 2026 bleibt ausschließlich Stichtag für die mittelamerikanischen Top 5 und afrikanischen Top 15.

## Startprofis und freie Spieler

| Vereinsland | Heimatanteil Startkader | Heimatanteil neue freie Spieler | Bevorzugte Auslandsrouten |
| --- | ---: | ---: | --- |
| England | 40 % | 25 % | Frankreich, Schottland, Wales, Nordirland, Irland, Spanien, Deutschland, Portugal |
| Spanien | 60 % | 38 % | Frankreich, Portugal, Argentinien, Kolumbien, Uruguay, Marokko |
| Italien | 38 % | 25 % | Frankreich, Argentinien, Albanien, Rumänien, Serbien, Kroatien, Brasilien |
| Deutschland | 45 % | 32 % | Frankreich, Österreich, Schweiz, Niederlande, Polen, Tschechien, Türkei |
| Frankreich | 50 % | 35 % | Brasilien, Belgien, Schweiz, Marokko, Algerien, Tunesien, Senegal, Elfenbeinküste, Kamerun |
| Portugal | 40 % | 25 % | Brasilien, Spanien, Kap Verde, Frankreich, Argentinien, Kolumbien |

Nach dem Heimatentscheid wird jedes andere Land aus dem 101er-Pool mit positivem Gewicht gezogen. Bevorzugte Routen multiplizieren dessen Grundgewicht; Brasilien ist für Portugal besonders stark gewichtet. Die Heimatanteile sind feste Spielwerte. [CIES](https://football-observatory.com/Record-high-for-expatriate-players-in-European) meldete für die großen Ligen Unterschiede im Anteil auswärts ausgebildeter Spieler, aber dieser Anteil ist keine direkte Nationalitätsquote. Der freie Markt erhält bewusst niedrigere Heimatanteile als Startkader. Spielerwerte, Marktmenge und Positionen hängen nicht von der Nationalität ab. Für freie Spieler zählt die endgültige Spieler-ID als Zufallsbasis.
