# Arbeitspakete: Vereinswelt, Crown Cup und Horizon Cup

Stand: 10. Oktober 2026. AP00 und AP01 auf Nutzerauftrag abgeschlossen, AP02 als vollständiger redaktioneller Katalog umgesetzt; externe AP02-Namensabnahme und weitere Pakete offen, keine begonnene Laufzeitimplementierung oder Veröffentlichung. Produktgrundlage: [Ligaexpansionsplan](ligaexpansion-plan.md). Die gewählten internationalen Namen sind **Crown Cup** (Europacup 1) und **Horizon Cup** (Europacup 2). Eine öffentliche Namensvorprüfung liegt vor; vollständige Register-/Ähnlichkeitsprüfung und rechtliche Freigabe bleiben offen.

## Ziel und Grenzen

- Zwölf Länder: England, Spanien, Italien, Deutschland, Frankreich, Portugal, Niederlande, Belgien, Österreich, Schweiz, Türkei und Griechenland.
- Je acht spielbare Ligavereine und acht KI-Pokalvereine: 192 Vereine. Die bestehenden 48 Vereine bleiben erhalten; 60 neue Ligavereine und 84 neue Pokalvereine kommen hinzu.
- Liga: 14 Spieltage. Nationaler Pokal: 16 Teilnehmer ab Achtelfinale, Einzelspiele und neutrales Finale.
- Crown Cup: bestätigte 26 Teilnehmer aus 24 nationalen Plätzen und zwei zusätzlichen Titelverteidigerplätzen. Fünf Ligaphasenspiele, Top 8 direkt ins Viertelfinale ohne Play-offs, Viertel-/Halbfinale mit Hin-/Rückspiel, einzelnes Finale. Maximal zehn Partien je Finalist.
- Horizon Cup: 32 Teilnehmer ab Sechzehntelfinale, Hin-/Rückspiele und einzelnes Finale. Maximal neun Partien je Finalist.
- Rollierende Drei-Saisons-Wertung: acht Länder mit drei Horizon-Plätzen, vier mit zwei. Vereinsbüro, persönliche Karrieregeschichten und vollständige Awardgrafiken ergänzen die Welt.
- Ausschließlich neue Karrieren erhalten die Expansion. Bestehende Welten bleiben spielbar, mit ihrem bisherigen Umfang und ihren gespeicherten Regeln; keine Erweiterung oder rückwirkende Ereignisberechnung.
- Fähigkeiten einschließlich zugänglicher Beschriftungen bleiben Farbstufen. Keine Spielerporträts oder Jubelbilder, keine Änderungen an `freekickdemo/`.
- Die bisherige Priorität 3D-Erlebnis/Stadien vor Accounts bleibt bestehen. Diese Pakete ordnen die Expansion intern; sie geben ihr keinen Vorrang vor der bestehenden Agenda.

## Durchführung

Ein Integrationsverantwortlicher klärt vor jeder Umsetzung den aktuellen Quellstand und reserviert die betroffenen Dateien. Die lokale Kopie darf nicht ohne Prüfung als aktueller Live-/Unity-Stand behandelt werden; vorhandene Änderungen bleiben erhalten. Die unten genannten Module sind Orientierung anhand des lokalen Stands, keine Aussage über fehlende Funktionen im aktuellen Hauptzweig.

Die Reihenfolge ist: AP00 → AP01 → AP02 → AP03. Danach können AP04, AP05, AP06 und AP09 getrennt vorbereitet werden. AP07 und AP08 nutzen die vereinbarten Wettbewerbsergebnisse; AP10 führt die Oberflächen zusammen; AP11 prüft den vollständigen Stand. Unabhängige Vorbereitung ist möglich, gemeinsame Produktdateien werden seriell integriert. Dieser Plan startet keine Agenten automatisch.

## AP00 – Aktueller Stand und Integrationsverträge

**Status: abgeschlossen am 10. Oktober 2026.** [Bestandsprüfung, Integrationsvertrag und Prüffälle](ligaexpansion-ap00.md). Die lokale Kopie steht auf 97, aktueller Hauptzweig und bytegleich nachgebautes Live-HTML auf 121. Sieben Bestandstests bestanden; Zusatzlauf der nativen Karriere nur teilweise geprüft. Die technischen Verträge sind Folgepaketziele, noch keine implementierte Expansion.

**Verantwortung:** Integration. **Abhängigkeit:** keine.

**Lieferung:** Dokumentierter aktueller Code-, Build- und Live-Stand; Bestandsliste der vorhandenen Welt-, Match-, Speicher- und Darstellungswege. Vereinbarte stabile Kennungen für Länder, Vereine, beide Cups, Ergebnisse, Awards und Storyereignisse. Klare Unterscheidung alter Welten und neuer Expansion bei Anlage, Laden und Export/Import.

**Abnahme:** Die konkreten zuständigen Module und Dateibesitzer sind bekannt. Je eine bisherige und eine neue Welt können als isolierte Prüffälle beschrieben werden. Neue Schnittstellen ändern keine gespeicherten alten Daten; Fortschritt, Speicher und Matchanbindung haben eindeutige Verantwortliche.

**Orientierung:** `docs/development.md`, `dist/world-foundation-v61.js`, `dist/world-competition-v62.js`, `dist/world-physical-v65.js`, aktive neuere Adapter nach Bestandsprüfung.

## AP01 – Offene Regeln und Saison-1-Grundlage

**Status: Entscheidungsvorlage abgeschlossen am 10. Oktober 2026.** [Regeln, Länderstufen und Saison-1-Grundlage](ligaexpansion-ap01.md), [vollständige Startdaten](ligaexpansion-saison1.json), [Namensvorprüfung](ligaexpansion-namenspruefung.md). Heimverteilung, Länderstufen, Startreihenfolge mit Österreich auf Rang 8 und Horizon-Regeln sind vom Nutzer bestätigt; nationale Duelle dort ab Viertelfinale erlaubt. Redaktionelle Vorgeschichte und Teilnehmer sind vollständig, 18.360 Qualifikationsfälle geprüft. Quantitative Kalibrierung und vollständige Namensprüfung bleiben ausdrücklich mit Folgepaketen zugeordnet; keine Laufzeitimplementierung oder rechtliche Freigabe.

**Verantwortung:** Produkt/Redaktion. **Abhängigkeit:** AP00.

**Lieferung:** Entscheidungsvorlage zu den noch offenen Punkten: Heim-/Auswärtsverteilung der fünf Crown-Ligaphasenspiele; sportliche und wirtschaftliche Länderstufen; Startreihenfolge der Drei-Saisons-Wertung; Crown-/Horizon-Auslosung und Setzung einschließlich möglicher nationaler Paarungen in K.-o.-Runden. Fiktive nationale Vorsaison und beide internationale Vorjahressieger festlegen. Crown Cup und Horizon Cup auf identische/ähnliche Rechte für die beabsichtigten Veröffentlichungsgebiete prüfen; belegte Ergebnisse getrennt von rechtlicher Freigabe dokumentieren.

**Abnahme:** Jeder Punkt ist entweder ausdrücklich entschieden oder mit seinen konkret betroffenen Teilpaketen als offen markiert. Keine erfundenen alten Partien, Prämien oder Länderwertungspunkte. Keine stillschweigende Einführung zusätzlicher persönlicher internationaler Awards. Die Startplätze sind vollständig und überschneidungsfrei erklärbar.

## AP02 – 192 Vereinsidentitäten und zwölf Länder

**Status: Redaktion und Daten umgesetzt am 10. Oktober 2026; vollständige Abnahme offen.** [AP02-Ergebnis und Übergabe](ligaexpansion-ap02.md), [192 Vereinsidentitäten](ligaexpansion-vereinskatalog.md), [JSON-Katalog](ligaexpansion-vereinskatalog.json), [Namensvorprüfung](ligaexpansion-ap02-namenspruefung.md). Je 16 Vereine mit 8/8-Verteilung, drei Farben, sechs Profilen und mindestens einem Stadtderby sind geprüft; die bisherigen 48 Identitäten bleiben erhalten. AUT-5 heißt auf Nutzerentscheid Innsbruck Sport. Externe Namensfreigabe und tatsächliche Profilwirkung in AP03 bleiben offen.

**Verantwortung:** Vereinsredaktion/Daten. **Abhängigkeit:** AP01 für Länderstufen; unabhängig davon können Namens- und Stadtentwürfe vorbereitet werden.

**Lieferung:** Vollständiger Vereinskatalog mit stabilen IDs, realen Städten, fiktiven Namen, drei Farben, eigener Geschichte und getrennten Profilen für Tradition, Fans, Jugend, Risiko, Geduld und Startkader. Zwölf Ergänzungen in bestehenden Ligen, 48 Ligavereine in neuen Ländern und 84 neue Pokalvereine. Länderabstufung mit Überschneidungen: starke Vereine kleinerer Länder dürfen größere Ligen sportlich herausfordern. Pro Land mindestens ein Stadtderby.

**Abnahme:** Genau 16 Vereine pro Land, davon acht spielbar. Die vorhandenen IDs und Identitäten bleiben erhalten. Vereinsrollen bilden unterscheidbare Entscheidungen statt einer überall kopierten Rangfolge. Namen haben eine dokumentierte Verwechslungsprüfung; keine realen Vereinswappen werden übernommen. Profile beeinflussen echte Startkader und Mittel, keine unmittelbaren Torboni.

**Orientierung:** `docs/vereinskatalog-entwurf.md`, `docs/vereinsmodell-entwurf.md`, `dist/world-catalog-v61.js`, `work/generate-world-catalog-v61.cjs`.

## AP03 – Weltaufbau, Herkunft, Ausstattung und Speicherung

**Stand AP03:** Technischer Weltaufbau, Herkunft, Ausstattung und Speicherung sind als Entwicklungsvorschau im isolierten 121er-Arbeitsverzeichnis umgesetzt und geprüft. Individuelle neue Unity-Stadien, Wappen-Endabnahme und externe Identitätsprüfung bleiben offen; vollständige Abnahme noch ausstehend. [Umsetzung und Nachweise](ligaexpansion-ap03.md).

**Verantwortung:** Weltdaten/Integration. **Abhängigkeit:** AP00, AP02.

**Lieferung:** Neue Welten mit zwölf Ländern, 192 Vereinen, passenden Kadern, Trainern, Verträgen, Nachwuchs und Finanzgrundlagen. Herkunfts- und Partnergewichte für die sechs neuen Ligen; bestehende Nationalitätsflaggen und Namenspools nach Prüfung wiederverwenden. Wappen, Heim-/Auswärtsmuster, zwei Torwarttrikots und nationale Sponsoridentitäten ergänzen. Assetumfang je Verein im Sinne der bestehenden Stadionagenda abstimmen. Speichern, Import und Export auf die größere Welt vorbereiten.

**Abnahme:** Alle 192 Vereine sind eindeutig und positionsgerecht besetzt; Sponsor- und Identitätsdaten sind vollständig. Aufbau mit gleichem Seed ist reproduzierbar. Alte Sechs-Länder-Welten werden weiterhin korrekt geöffnet und exportiert, ohne neue Vereine, Herkunftsdaten oder Regelumrechnung. Ein global geänderter Länderkatalog darf sie nicht ungültig machen. Neuladen zieht keine neuen Spieler oder Startmittel.

**Orientierung:** Weltgrundlage, Trainer, Wirtschaft, Jugend, Nationalitäten, Trikots, Sponsoren und bestehende Speicherverwaltung; konkrete aktive Module aus AP00.

## AP04 – Nationale Wettbewerbe und gemeinsamer Kalender

**Stand:** Nationale Erzeugung, Pokalrunden und gemeinsame reservierte Kalenderfenster als speicherbare Vorschau umgesetzt und geprüft. Vollständiger aktiver Saisonlauf und integrierte Kalenderabnahme folgen zusammen mit AP05/06. [Lieferung und Nachweise](ligaexpansion-ap04.md).

**Verantwortung:** Wettbewerbe/Kalender. **Abhängigkeit:** AP03; Cup-Schnittstellen aus AP00, abschließende Integration mit AP05/AP06.

**Lieferung:** Allgemeiner Spielplan für acht Ligavereine mit 14 Spieltagen und nationaler Pokal ab Achtelfinale für 16 Vereine. Bestehende Pokal-Auslosungsregeln sinnvoll auf die zusätzliche Runde übertragen und neue Details in AP01 entscheiden lassen. Gemeinsamer Kalender für Liga, nationalen Pokal und beide Europacups.

**Abnahme:** Jeder Ligaverein trifft jeden Gegner genau einmal zuhause und einmal auswärts: 56 Ligapartien je Land. Jeder nationale Pokal enthält 15 Partien, höchstens vier pro Verein. Liga am Wochenende mit höchstens einem Ligaspiel pro Wochenende; nationale Pokale und Europacups unter der Woche in getrennten Kalenderwochen. Mindestens zwei volle spielfreie Tage zwischen Pflichtspielen desselben Vereins. Saisonziel August bis März auch bei maximaler Pokalbelastung prüfen. Keine Auswärtstorregel, keine Verlängerung, korrekte Elfmeterschießen.

## AP05 – Crown Cup

**Stand:** Erzeugung, Heimverteilung, K.-o.-Rundenschluss, Vorschau und Speicherung umgesetzt und geprüft. Vollständiger aktiver Saisonlauf sowie physische Match-/Gesamtabnahme folgen mit AP06/AP11. [Lieferung und Nachweise](ligaexpansion-ap05.md).

**Verantwortung:** Internationaler Wettbewerb 1. **Abhängigkeit:** AP01, AP03 und Wettbewerbsschnittstellen; Kalenderintegration AP04.

**Lieferung:** Ligaphase ohne feste Sechs-Länder-Paarung: fünf verschiedene ausländische Gegner je Verein, Heim-/Auswärtsverteilung gemäß AP01. Top 8 direkt ins Viertelfinale, keine Play-offs. Bestehende Rangtiebrecher, Viertelfinalsetzung, Halbfinalbaum und Rückspiel-Heimrecht übernehmen, soweit neue Regeln sie nicht ersetzen. Finalort neutral.

**Abnahme:** Alle 26 Teilnehmer haben genau fünf gültige Ligaphasenspiele, keine nationalen Ligaphasenduelle und keine Doppelgegner: 65 Ligaphasenpartien. Heimrechte sind gemäß AP01 verteilt. Top 8 erreichen das Viertelfinale direkt, Platz 9–26 scheiden aus. Es gibt 78 Partien insgesamt und zehn je Finalist; keine Play-off-Partien. Ergebnisbuchung, Hin-/Rückspiel-Gesamtstand, Pause, Fortsetzung und Elfmeterschießen funktionieren einmalig.

## AP06 – Horizon Cup

**Stand:** Horizon-Runden und aktive erste Expansionssaison lokal umgesetzt. Alle 991 Partien und 26 Wettbewerbe im nativen Saisonlauf abgeschlossen; mobiler Einstieg, Speicherung und Neuladen einer laufenden pausierten 2D-Partie geprüft. Folgejahr und Länderwertung bleiben AP07; physische Gesamtabnahme AP11. [Lieferung und Nachweise](ligaexpansion-ap06.md).

**Verantwortung:** Internationaler Wettbewerb 2. **Abhängigkeit:** AP01, AP03 und Wettbewerbsschnittstellen; Kalenderintegration AP04, Platzkontingente AP07.

**Lieferung:** Vollständiger 32er-Baum ab Sechzehntelfinale. Alle Runden bis Halbfinale mit Hin-/Rückspiel; Finale einzeln und neutral. Auslosung/Setzung gemäß AP01; keine Vorqualifikation, keine Freilose. Wettbewerbsansichten und Matchadapter erhalten eine eigenständige stabile Cup-Kennung.

**Abnahme:** Genau 32 unterschiedliche Vereine, kein Crown-Teilnehmer im selben Feld. 61 Partien insgesamt, neun je Finalist. Alle Runden und Gesamtstände bleiben nach Speichern/Neuladen eindeutig. Eigene und parallel simulierte Partien verbuchen Statistiken, Belastung und Ergebnisse mit demselben Wettbewerbsbezug.

## AP07 – Drei-Saisons-Wertung, Qualifikation und Wirtschaft

**Stand:** Lokal für neue Expansionskarrieren umgesetzt. Exakte Drei-Saisons-Wertung, Vereinsbeiträge, 26/32 Folgequalifikation, Wirtschaftsstand und wiederholter Karrierewechsel integriert. Vier vollständige native Saisons, 15 synthetische Saisons, Speicherung und mobiler Saison-/Vertragsablauf bestanden. Bestehende Welten behalten ihre Regeln. Breite physische Balance und Geräteabnahme bleiben AP11. [Lieferung und Nachweise](ligaexpansion-ap07.md).

**Verantwortung:** Saisonabschluss/Balance. **Abhängigkeit:** AP01 und Ergebnisverträge aus AP04–AP06; ausführbare Gesamtprüfung nach deren Integration.

**Lieferung:** Internationale Länderpunkte und nachvollziehbare Vereinsbeiträge; feste Teilnehmernenner pro Saison; rollierende Summe über drei Saisons. Sieg 2, Remis 1; Bonus je Viertelfinale, Halbfinale, Finale und Titel. Elfmeterschießen erzeugt keinen zusätzlichen Siegpunkt. Top 8 erhalten drei Horizon-Plätze, die übrigen vier zwei. Überschneidungen überspringen, nächstberechtigte Ligavereine aufnehmen. Startkontingente stammen aus AP01; Folgekontingente gelten erst nächste Saison. Neue Länderstufen, Sponsoren, Torziele, Wettbewerbsprämien und Einsatz-Zusagen auf den längeren Kalender abstimmen.

**Abnahme:** Horizon hat in jedem geprüften Folgejahr 32 eindeutige Teilnehmer. Ein Land kann Rang 8/9 wechseln und erhält erst im Folgejahr den anderen Umfang. Dritte/vierte Wertungssaison, identische Summen, Remis mit Elfmeterschießen und Bonusvergaben sind gezielt geprüft; Neuladen/Saisonabschluss bucht nichts doppelt. Mehrjahresläufe zeigen finanzierbare Kader, sinnvolle Vereinswechsel und keine garantierten Ländertitel. Zeitgewichtete Gehälter, Jugendentwicklung und Minutenzusagen nutzen tatsächliche Spieltermine. Alte Welten bekommen keine neue Wertung oder Wirtschaftsumrechnung.

## AP08 – Storyereignisse und Vereinsbüro

**Status: lokal abgeschlossen am 10. Oktober 2026, nicht veröffentlicht.** [Lieferung, Datenvertrag, Prüfungen und redaktionelle Entwürfe](ligaexpansion-ap08.md). Neue Karrieren speichern belegte Meilensteine; Büro und Chronik verwenden dieselben Daten. 991-Partien-Testsaison, Folgejahr, Export/Import und mobiler Browserpfad mit 48 nativen Partien bestanden. Gründungslegenden bleiben ausdrücklich nicht freigegebene Entwürfe.

**Verantwortung:** Karriereereignisse/Redaktion. **Abhängigkeit:** AP00 und AP04–AP07 für belegte Ereignisse; Textentwürfe können vorher entstehen.

**Lieferung:** Einmalig gespeicherte Meilensteine: erste Europateilnahme, erster internationaler Halbfinal-/Finaleinzug oder Titel, entscheidendes Tor eines nachweisbaren Eigengewächses, relevantes Wiedersehen und Beitrag zu zusätzlichen Länderplätzen. Bestehendes Karriereereignisprotokoll nutzen, wo es die Information bereits trägt. Vereinsbüro als Newsanzeige mit chronologischen Karten, Ungelesen-Hinweis und Links zu Verein, Spieler, Partie oder erforderlicher Entscheidung. Relevanzfilter und Begrenzung auf prägende Ereignisse ausarbeiten. Entwürfe für die Gründungslegenden beider Cups.

**Abnahme:** Jeder Text ist aus gespeicherten Fakten belegbar. Keine wiederholten Ereignisse beim Neuladen und keine erfundenen Vereinsbeiträge. Gewöhnliche Informationsmeldungen blockieren die Karriere nicht. Trainerwechsel bleiben nach bestehender Relevanz gefiltert. Ein Ereignis kann von Büro, Vorschau, Chronik und Rückblick verwendet werden; unwahre Beispielsätze werden nicht als tatsächliche Meldungen ausgespielt. Die Legendenvorschläge sind vor Aufnahme als feste Weltgeschichte freizugeben.

## AP09 – Trophäen, persönliche Awards und Wiedererkennung

**Status: lokal umgesetzt am 10. Oktober 2026, nicht veröffentlicht.** [Lieferung und Nachweise](ligaexpansion-ap09-ap10.md). Grafikentwürfe und Paketintegration geprüft; endgültige grafische Freigabe sowie umfassende Gesamt-/Geräteabnahme bleiben vor Veröffentlichung offen.

**Verantwortung:** Awardgrafiken/Art. **Abhängigkeit:** AP01 für Namensprüfung und Awardumfang; unabhängig vorbereitbar nach Motivvertrag AP00.

**Lieferung:** Nationale Sets für alle zwölf Länder: Meisterschaft, nationaler Pokal, Torschützenkönig, Spieler der Saison und Man of the Match. Vorhandene sechs Sets prüfen und erhalten; sechs neue Sets erstellen. Eigene Crown- und Horizon-Trophäen, passende internationale Matchmedaillen sowie große und kompakte transparente Varianten. Kronenmotiv und Horizont-/Aufbruchmotiv als Gestaltungsentwürfe ausarbeiten; diese Bilddetails sind noch keine erteilte grafische Freigabe.

**Abnahme:** Beide Cup-Trophäen und alle Awardtypen sind auch klein unterscheidbar. Nationale Identität ist über Flaggen und eigene Silhouetten sichtbar. Motive funktionieren auf hellem/dunklem Hintergrund, im bestehenden 16-Bit-Stil und ohne Spielerporträts. Manifest enthält eindeutige Zuordnung, Quellen, Nutzungsrechte und beide Größen; keine fehlenden Dateien. Eine Sichtprüfung umfasst Tabellenzeichen, Profile, Siegerfeier, Vereinsbüro und Chronik. Neue Grafiken ändern keine Awardvergaberegeln.

## AP10 – Oberfläche, Erinnerungen und Sprachen

**Status: lokal umgesetzt am 10. Oktober 2026, nicht veröffentlicht.** [Lieferung, Statistikvertrag und Nachweise](ligaexpansion-ap09-ap10.md). Regulärer Start, sechs Karrierebereiche, 54 Sprach-/Viewportfälle, Archivstatistiken und Rückkehr-/Lesestatus geprüft. Physische Geräte- und Langzeitabnahme bleiben AP11.

**Verantwortung:** Karriereoberfläche. **Abhängigkeit:** AP04–AP09 und UI-Verträge AP00.

**Lieferung:** Zwölf-Länder-Auswahl, erweiterte Tabellen/Pokalbäume, beide international benannte Wettbewerbe und Drei-Saisons-Wertung mit Vereinsbeiträgen und künftigen Plätzen. Vereinsbüro an geeigneter Stelle der Karrierezentrale einbinden, besondere Vorschaukarten, dauerhaft verlinkte Chronik, Managerstationen und höchstens drei prägende Saisonmomente. Awardgrafiken in vorhandene Profile, Berichte, Titelarchive und Siegerfeiern anbinden. Alle neuen UI-Texte Deutsch/Englisch, Wettbewerbsnamen als Eigennamen erhalten.

**Abnahme:** Auf schmalen Mobilansichten und Desktop bleiben Navigation, Weiter-Aktion und Tabellen bedienbar. Crown Cup und Horizon Cup haben separate Kalender-, Statistik- und Siegeransichten. Nachricht→Profil/Spielbericht→Zurück erhält den Kontext. Ungelesen-Status übersteht Neuladen. Grafik und zugänglicher Text identifizieren dasselbe Award-/Wettbewerbsobjekt; Fähigkeiten bleiben ausschließlich qualitative Farbstufen. Sprache kann auch nach dynamischen Ansichtswechseln gewechselt werden.

## AP11 – Gesamtprüfung und Veröffentlichungsvorbereitung

**Stand: lokale Gesamtprüfung abgeschlossen, Geräteabnahme offen.** Zehn aktuelle native und zwanzig synthetische Saisons, laufende Browserpartie mit Pause/Reload/Abschluss, echter 67,4-MB-IndexedDB-Import mit Backup, vollständige aktuelle Unity-/2D-Parität und tatsächlicher Vereinswechsel geprüft. USB-Freigabe vorhanden, aktuelle Androidabnahme noch offen. 64 detaillierte Meshy-Motive und zwei Pokalüberarbeitungen erstellt; Grafikfreigabe bleibt offen. [AP11-Nachweise](ligaexpansion-ap11.md), [anschließender Veröffentlichungsplan](ligaexpansion-veroeffentlichungsplan.md).

**Verantwortung:** Integration/Abnahme. **Abhängigkeit:** AP03–AP10, alle releasewirksamen Entscheidungen aus AP01.

**Lieferung:** Prüfnachweise für mehrere Seeds und mehrjährige Karrieren, Browserdurchgänge, Mobilmessungen und Export/Import der größeren Welt. Laufzeit-, Fortschritts- und Speicherbudgets anhand des aktuellen 192-Vereine-Stands messen und begründen, statt alte 48-Vereine-Grenzen blind zu übernehmen. Aktive Match-/Unity-Anbindung und Referenzgeräte gemäß aktuellem Entwicklungsstand einbeziehen.

**Abnahme:** Ein vollständiger Saisonlauf einschließlich beider Cups, nationalem Pokal, Wertungswechsel, Nachrücken, Vereinswechsel, Nachrichten, Siegerfeiern und Saisonrückblick ist nachgewiesen. Mindestens vier Saisons prüfen das Herausfallen des ältesten Wertungsjahrs; zehn Saisons prüfen Langzeitwirtschaft, Speicher und Ereigniswachstum. Ein bisheriger Spielstand bleibt ohne Migration unverändert spielbar. Unterbrochenes Match und Saisonabschluss laufen ohne doppelte Buchung weiter. Neue Assets/Skripte sind in aktiver HTML-, Server- und Buildliste enthalten. Keine offenen Konflikte, unbestätigten Regeln oder fehlenden Geräteprüfungen als erledigt ausgeben.

Bei einer tatsächlich beauftragten Veröffentlichung: Changelog fertigstellen, Fußversion anheben und denselben Stand in Quellcode, Build und Live-Seite nachweisen. Der vorliegende Plan enthält keinen Veröffentlichungsauftrag.

## Noch offene Produktentscheidungen

Heimverteilung, Länderstufen, Startreihenfolge, Auslosungsregeln und redaktionelle Saison-1-Vorgeschichte sind in AP01 ausgearbeitet. Offen bleiben:

1. Externe Vereinsnamensprüfung und grafische Umsetzung sowie quantitative Länder-/Wirtschaftskalibrierung und Profilwirkung (AP02/03/07). Der redaktionelle 192er-Katalog ist vollständig.
2. Grafische Motive, Büroplatzierung und konkrete Gründungslegenden (AP08/09/10).
3. Tatsächliche Veröffentlichungsgebiete, vollständige Register-/Ähnlichkeitsprüfung und getrennte Bewertung der Cupnamen (AP01-Namensabschluss/AP09/AP11).
4. Konkrete Termine und technische Auslosungs-/Kalenderabnahme unter den bestätigten Regeln (AP04/05/06).

## Übergabe je Paket

Eine Übergabe nennt Ergebnis/Status, bearbeitete Dateien, festgelegte Schnittstellen, vorhandene Nachweise und noch offene Punkte. „Fertig“ bedeutet bestandene Paketabnahme, nicht nur erstellte Dateien. Gemeinsame Grundlagen werden nur durch den benannten Integrationsverantwortlichen zusammengeführt. Nicht gestartete Pakete bleiben als geplant gekennzeichnet.
