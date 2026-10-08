# Entwicklungsdokumentation

- [Release 111](release-111.md): Flutlicht und Unity-Fußball, vollständige WebGL-Auslieferung und Veröffentlichungsprüfung.

- [Fußballerlebnis v159](platform/football-experience-v159.md): Schussziele und Ausführung, Keeperwinkel, Ballannahme und Anschlussläufe, defensive Aufmerksamkeit, Unity-Ballrotation/Schrittphasen, Kameras und aktuelle Spielberichte.

- [Belastung, Erholung und Unity-Bewegung](platform/freshness-load-v158.md): tatsächliche Lauf-/Aktionslast, einmalige Match- und Kalendererholung, gemeinsame Fähigkeiten, neue Saisonfrische/-form und speicherschonende Einsatzgrenzen.

- [Offensivspiel und Bewegungsdynamik](platform/offensive-quality.md): schnellere Läufe mit Masse und Trägheit, sichtbare Passvorbereitung, erreichbarer Vorlauf, Anschlussangebote und parallele UI-Korrekturen.

- [Rollen, Taktik und Unity-Aktionsiteration](platform/roles-tactics-football.md): neue lokale Rollenkarriere, echte Leistungsnoten mit Lernen, gemeinsame Taktikcontroller und laufende Ballaktionen; Vergleichspartien und Prüfgrenzen.

- [Schneller Unity-Fußball](platform/unity-fast-football.md): frühe offensive Laufangebote, Passgeberläufe und schnelle Anschlüsse, passende Bestandsbewegungen und vollständiger Partieabgleich.
- [Welle 2: Rechner und lokale Prüfkarriere](player-contracts/integration.md): P01–P03 geliefert, getrennte neue Kandidatenwelt, sichere Farbstufen und verbleibende Rollen-/Belastungsgates.

- [Unity-Fußballpilot](platform/unity-football-pilot.md): eigene Bodenpass-/Annahmebewegungen, sichtbare Kontakt- und Standfußkorrektur, kurze Übergänge und wiederverwendete Torwartbewegungen; tatsächliche Meshy-Kosten, lokale Demo-/Vereinsweltprüfungen und erhaltene Simulationszuständigkeit.

- [Unity-3D-Iteration](platform/unity-3d-iteration.md): dezente Namen an tatsächlichen Kopfpositionen, gemeinsames Bewegungsbild, Fußballmarkierungen und nachgestellte Halbzeitkorrektur in vergrößerter Ansicht; lokale Prüfnachweise und Animationsgrenzen.

- [Echte Vereinswelt-Partie mit Unity](platform/vereinswelt-unity.md): tatsächliche Teams, Trikots, Aufstellung, Wechsel, Pause, Checkpoint und Rückschau; vollständige lokale Partievergleichsdaten, Datei-Aufruf und klare Zuständigkeit der bestehenden Simulation. Neue Rollen-/Taktikregeln und mobile Abnahme folgen separat.

- [Flutlicht-Nachprüfung nach Nutzerbesichtigung](ui-redesign/feedback-2026-10-08.md): vollständiger Menürundgang, Untermenüs, Start/Vereinserstellung, Übersicht, direkter Angebotsdialog und Ladeanzeige; aktuelle Quell-/Offline-Buildbelege und klare Abgrenzung zur späteren Taktiküberarbeitung P05.

## Inhalt

- [Welle 0/1 – lokale Vergleichsdemo](platform/local-demo.md): Browser und Unity mit gemeinsamen Szenen, Originalfigur, Bedienung, Zwischenständen und getrennten Messungen; [Engine-/Androidweg](platform/engine-probe.md), [Fachvertrag](match-contracts/shared.md), [Assets](platform/asset-inventory.md) und [Abnahme](platform/demo-acceptance.md). Kein Enginewechsel oder Release.

- [Flutlicht – lokale Integration](ui-redesign/integration.md): neu implementierter Rahmen und sechs Ansichtsbereiche, [Datenverträge](ui-redesign/contracts.md), [Bestandsinventar](ui-redesign/inventory.md) und [unabhängige Abnahme](ui-redesign/acceptance.md). Geräte-/Screenreaderfreigaben werden getrennt dokumentiert; keine Veröffentlichung.

- [Einmaliger Werbefrei-Kauf und Banner – Agentenaufträge](agentenauftraege/05-monetarisierung.md): gemeinsame kostenlose App mit wenigen Bannern und accountgebundene Werbefrei-Freischaltung für etwa vier bis fünf Euro einmalig bestätigt. B01/B02 enthalten Kauf-/Restore-/Refundstatus, Anbieter-/Lifecyclegrenzen, parallele Stubs und spätere echte Abnahme. PC-/Androidgeltung für denselben Account bestätigt; Preis, technische Wiederherstellung und erster Releaseumfang offen; Umsetzung gestoppt.

- [Werbeerlös bei 1.000 aktiven Accounts – Rechenszenarien](werbeerloes-szenarien.md): wenige Banner, Nutzungs- und eCPM-Annahmen, beispielhaft 8–40 Euro Monatseinnahmen bei 40.000 gezählten Einblendungen, Abgrenzung zu Monatskosten und älteren mobilen Benchmarks sowie zusätzliche Bruttobeispiele für einmalige Käufe; kostenlose und werbefreie Accounts getrennt. Keine Tarif-, Anzeigenhäufigkeits- oder Gewinnzusage.

- [Android: frühe Installation und Updates](android-installation-update-plan.md): installierbare App-Testfassungen schon parallel zum PC-Ausbau, Folgeupdates ohne Deinstallationszwang und Erhalt neuer Karrieren/Einstellungen auf Pixel 9a und Pixel 9 Pro XL. Kleine reale Testbasis statt Pflichtgruppe von 20–50; Verteilung bestätigt: zunächst APK-Downloads mit manuellen Updates, später Google Play; Updatehinweis im Hauptmenü mit Versionsnummer und Downloadknopf bestätigt, Downloadort/Prüftakt/Signierungszuständigkeit noch offen, öffentliche Storefolge bleibt separat. Nur Planung.

- [UI-Referenz für Übersicht und Untermenüs](ui-referenz/README.md): Flutlicht aus vier Varianten gewählt, mit Geräteautomatik für Hell/Dunkel, Dummy-Saisonwechsel, kompaktem mobilen Kader, Sponsorstatus, Ergebnisfolgen und ewigen Vereinsranglisten. Mobilefähig; [früherer Vergleich](ui-referenz/varianten.html) und Inhaltszuordnung vom Bestand bleiben erhalten. Keine Spiel-/Spielfelddarstellung oder Änderung am laufenden Spiel.

- [Accounterstellung und Adminstatistiken – Planung](account-admin-statistik-plan.md): Pflichtaccounts bereits für den ersten geplanten PC-Release, Offline-Spiel nach Anmeldung ohne Gastmodus, bestätigte 30-Tage-Frist ab erfolgreicher Onlineprüfung und keine Übernahme bestehender Karrieren; private lesende Gesamtübersicht und einzelne echte Nutzeraccounts mit übertragenen Karrierestatistiken, Datenstand, Zugriffsrechte, bestätigte aktive Spielzeiterfassung im Vordergrund und Fünf-Minuten-Inaktivitätspause mit Ausnahme laufender Matches, Save-Titel für eine ausschließlich private Adminrangliste, bestätigter privater CSV-Export für eigene Auswertungen, automatische Statistikübertragung verknüpfter Karrieren nach Spiel-/Saisonabschluss, bestätigte Elternfreigabe für Onlineaccounts unter 14 und Altersgruppenabfrage statt vollständigem Geburtsdatum, Kennzahlenvorschläge und zwei zusätzliche Agentenpakete. Vollständige Cloudfortsetzung weiterhin separat; Umsetzung gestoppt.

- [Agenten-Masterplan – U01 und lokale Welle 0/1 geliefert](agentenauftraege/README.md): 20 Fachaufträge plus zentrale Integration, exklusive Dateizuständigkeiten, Schnittstellen, Abhängigkeiten, drei parallele Fachslots, Entscheidungsgates und Abnahmekriterien. Aufträge getrennt für Spieler/Karriere/Taktik, Matchregeln/Absichten, Plattform/Assets/Abnahme, Accounts/Adminstatistik und Kauf/Werbung. [Flutlicht-Redesign](agentenauftraege/06-ui-redesign.md) als Dachauftrag mit Inventar, Rahmen und sechs getrennten Ansichtsaufträgen, frühem Testzugang und eigenständiger lokaler Browserabnahme. Ein späterer Gesamtstart umfasst die zugehörigen technischen Wellen; aktuell sind U01 lokal umgesetzt und Welle 0/1 als lokale PC-Demo mit Browser-/Unity-Abnahme geliefert; weitere Fachpakete bleiben ungestartet.

- [Stürmerentwicklung mit sechs vollen Spielen](stuermer-sechs-spiele-entwicklung.md): Rechenbeispiel mit Startalter 17, Positionsqualität 10 und mittlerem Talent 16; bei durchgehend guten Noten bis 24 insgesamt 14,15 verteilte Fähigkeitspunkte und im illustrativen Profil Positionsqualität 11,76. Verlauf als vorläufige Arbeitsgrundlage akzeptiert; Feintuning später, keine neue Festlegung von Häufigkeitsverteilung oder Rollenlerngewichten.

- [Jugendentwicklung und Matchnoten – Planung](jugendentwicklung-noten-plan.md): Noteneinfluss, minutengewichtetes Dreierfenster und Notengrenzen 6,5 für Wachstum und 5,5 für möglichen Rückgang bestätigt; Rückgang setzt drei einzeln schwache bewertete Einsätze voraus. Ausgangswerte 0,5 für positive und 0,1 für negative Entwicklung, Rollen-/Aktionsbezug sowie interne Fähigkeitsbruchteile bestätigt. Verdecktes Hintergrundtalent 10–22 soll nach Nutzerkorrektur die Gesamtentwicklung variieren; direkte Zuordnung im Vier-Saison-Beispiel bestätigt. Einmalige Festlegung, lebenslang unveränderte ganze Talentwerte und globale Häufigkeitsverteilung mit 0,5 Prozent für Talent 22 bestätigt. Gewichtung hoher Talente 20–22 durch Jugendarbeit mit relativen Auswahlgewichten 0,5/1/2 bestätigt; globale Anteile erhalten und konkrete Profilzuordnung noch abstimmen. Positive Altersstaffel 100/80/50 Prozent bis 19/20–21/22–23 bestätigt; ab 24 separates Erwachsenenmodell. Proportionale Normalisierung der Lernmenge mit Talent/19 bestätigt. Saisonstaffel mit voller Rate für die ersten 900 tatsächlichen Minuten, 25 Prozent für die nächsten 900 und danach keinem zusätzlichen positiven Matchzuwachs bestätigt. Auf Nutzerkorrektur zählen alle Einsatzminuten kumuliert, auch Kurzeinsätze ohne sichtbare Note. Interne Bewertung solcher Einsätze innerhalb des Dreierfensters bestätigt. Mindestens 90 kumulierte Minuten einer ununterbrochen schwachen Einsatzserie als zusätzliche Voraussetzung für Rückgang bestätigt, weiterhin mindestens drei schwache Einsätze. Höchstens ein Gesamtpunkt leistungsbedingter Rückgang pro Spieler und Saison bestätigt. Wiederaufbau verlorener Fähigkeiten mit normaler Lernrate innerhalb des regulären Saisonlernvolumens bestätigt. Spielnoten primär nach Erfüllung der zugewiesenen Rolle bestätigt. Verzicht auf pauschale Notenboni oder -abzüge allein durch das Mannschaftsergebnis bestätigt. Bewertung von Aktionen nach situativer Schwierigkeit und taktischem Nutzen bestätigt. Umverteilung positiver Lernreste an persönlichen Fähigkeitsgrenzen auf weitere rollen- und aktionsbezogen passende Fähigkeiten bestätigt. Unveränderte Lernrate bis zur persönlichen Grenze ohne zusätzlichen Potenzialnähe-Faktor bestätigt. Positive Erwachsenenentwicklung von 24–29 auf Nutzerkorrektur ausschließlich geistig. Stellungsspiel zusätzlich zu Ruhe, Antizipation und Entscheidungen als Empfänger bestätigt; Lernrate von 20 Prozent der frühen Jugendlernrate bestätigt. Geistige Weiterentwicklung ab 30 mit 10 Prozent bis zum Karriereende bestätigt. Ab 24 keine dauerhaften Fähigkeitsabzüge allein wegen schwacher Matchnoten bestätigt. Keine Laufzeitänderung.

- [Körperlicher Altersabbau – Planung](spieler-alterung-plan.md): Beginn ab 30 für Feldspieler und Tormänner bestätigt; Beschränkung auf Schnelligkeit, Kondition und Körperkraft bestätigt. Jährliche Abzüge ab 33 bestätigt: Schnelligkeit −1, Kondition −0,5 und Körperkraft −1. Halbe Abzüge von 30–32 bestätigt. Einmalige Buchung beim Saisonwechsel anhand des Alters in der neuen Saison bestätigt. Karriereende auf Nutzerentscheidung wie bisher; vorgeschlagene neue Rücktrittsfenster verworfen. Individuelle Alterungsunterschiede weiter offen. Geistige Weiterentwicklung bleibt getrennt; keine Laufzeitänderung.

- [Frischeerholung – aktueller Plan und Modellvergleich](frische-erholung-vergleich.md): bestätigte Tageserholung +3 plus 25 Prozent der fehlenden Frische und einmalig +10 direkt nach Abpfiff; Referenzverlauf bei Kondition 10 und normaler Belastung bestätigt. Saisonrechnung und historische Vergleiche erhalten; allgemeine Verbrauchsformel offen, keine Laufzeitänderung.

- [Frische über eine Saison – Rechenbeispiel](frische-saison-beispiel.md): historischer Vergleich ohne Europacup, mit 22 Pflichtspielen und mit beispielhafter Rotation; vollständige Match-/Halbzeitwerte und reproduzierbare Rechnung mit damaligen Erholungsannahmen. Aktuelle Erholung im Erholungsvergleich, keine Laufzeitänderung.

- [Müdigkeit und Fähigkeiten – Planung](muedigkeit-faehigkeiten-plan.md): Wirkungen und maximale Abzüge je Fähigkeit bestätigt, nichtlineare Kurven für Ruhe und technische Fähigkeiten; Stellungsspiel ohne eigenen Abzug. Verbrauchsgrundlage aus Spielminuten, Sprints, intensiven Zweikämpfen und Pressing mit Dämpfung durch Kondition sowie Erholungsmengen bestätigt. Verbrauchsmengen, weitere Bewegungskurven und technische Integration offen; keine Laufzeitänderung.

- [Körpergröße – bestätigte Eigenschaft](koerpergroesse-plan.md): Bereich 165–205 cm, ausgewogener Einfluss auf Luftduelle, positions-/profilabhängige Verteilung mit Ausnahmen und endgültige unveränderliche Größe auch bei Jugendspielerstellung; Wahrscheinlichkeiten, Formeln und Modellabbildung offen, keine Laufzeitänderung.

- [Körperkraft – bestätigte Fähigkeit](koerperkraft-plan.md): Abgrenzung zu Zweikampf und Luftspiel, Abschirmen bei Kontakt, Rollenbezug und Einführung für neue Welten; Formeln, Erzeugung und Entwicklung offen, keine Laufzeitänderung.

- [Konkretes Jugendspielerbeispiel – Entwurf](beispiel-jugendspieler-entwicklung.md): alle Fähigkeiten und Potenzialgrenzen, vier Saisonverläufe, interne Rollenformeln und vollständige Beispieldaten; Entwicklungstempo als Planungsgrundlage bestätigt, Einzelmechanik offen, keine Laufzeitänderung.

- [Spielererstellung und Qualität – Entwurf](spieler-erstellung-rollen-plan.md): zusammenhängende Rollenrepertoires und neue vereinsabhängige Kader ausschließlich für neue Welten; Positionsqualität aus Grundfähigkeiten und die Gewichte aller vier Positionen einschließlich 12 Prozent Ruhe für Stürmer bestätigt, Form und Frische wirken separat auf Matchleistung. Gewichteter arithmetischer Mittelwert bestätigt, Elite-Mindestgrenze 16 bestätigt, native Zehn-Seed-Baseline hoher Farbstufen und offene Qualitätsziele. Normaler Startbereich 7–10 Positionsqualität für 17-Jährige bestätigt; Gewichtung der aktuellen Startqualität nach Jugendarbeit im Vereinsprofil bestätigt; beste im Profil spielbare Position als Bezug der notwendigen Elite-Mindestgrenze bestätigt; Eliteeinordnung ohne zusätzliche Einzelfähigkeitsgrenzen bestätigt; Vereinsstärke als Gewicht unterschiedlicher Kaderqualitäten bestätigt; begrenzte plausible Positionsvielseitigkeit neuer Feldspieler bestätigt; Tormänner ausschließlich mit Profilposition Tormann bestätigt; Profilpositionen dauerhaft fest, spätere Erweiterung verworfen; profilabhängige persönliche Fähigkeitsgrenzen bestätigt, genaue Verteilungen für spätere Tests offen.

- [Taktische Archetypen und Rolleneignung – Plan](spieler-archetypen-plan.md): Grundaufgaben aller 13 Rollen bestätigt, einschließlich beider Tormannrollen; relevante Fähigkeiten und Vergleichsszenen festgehalten, genaue Gewichte offen. Trainerrolle über dem Spieler, passende Empfehlungen im Profil und gemeinsame Zonenmarkierung mit defensiver, neutraler oder offensiver Ausrichtung. Rollenübernahme bei Auswechslungen bestätigt; beim Spielertausch bleiben Rolle und Ausrichtung am Platz, beim freien Verschieben bleiben Spieler und Rolle zusammen, soweit die Rolle in der Zielzone zulässig ist. Für gewöhnliche Profile meist ein bis drei passende Empfehlungen pro spielbarer Position bestätigt; seltene echte Vielseitigkeit bleibt möglich. Automatische Änderung der Rollenempfehlungen bei Entwicklung oder Alterung verworfen. Aktualisierung der Eignungsfarbstufen anhand dauerhafter Fähigkeiten und zusätzlicher Positionseingespieltheit bestätigt; genaue Gewichtung und Reihenfolge der übrigen Empfehlungen offen. Aufbau der Eingespieltheit durch tatsächliche Minuten je Position und Erhalt bei Rollenwechsel innerhalb derselben Position bestätigt. Wirkung auf tatsächliche Laufwege, Timing und Abstimmung im Match bestätigt. Positionsroutine bei Vereinswechsel vollständig erhalten bestätigt. Dauerhafter Erhalt auch bei längerer Nichtnutzung einer Position bestätigt. Volle Eingespieltheit auf der Hauptposition von Beginn an für alle neu erzeugten Spieler einschließlich Jugend bestätigt; Altersstaffelung dort verworfen. Grundroutine auf spielbaren Nebenpositionen und fehlende Routine auf fremden Einsatzpositionen bestätigt; genaue Grundroutinewerte offen. Aktualisierung der besten Rolle innerhalb der festen Empfehlungen bestätigt. Beibehalten der bisherigen besten Rolle bei annähernd gleicher Eignung bestätigt; genaue Wechselgrenze offen. Rollen außerhalb der Empfehlungen nur in passender Aufstellungszone wählbar bestätigt; geringe Eignung allein sperrt dort nicht. Bei unzulässiger bisheriger Rolle nach Zonenwechsel automatisch zufällige zulässige Rolle wählen bestätigt; verpflichtende manuelle Auswahl verworfen. Freies Verschieben setzt die Ausrichtung bestätigt auf den Standard neutral, auch bei erhaltener Rolle; bisherige Ausrichtung beibehalten verworfen. Flügelspieler nur in seitlichen Mittelfeld- und Angriffszonen bestätigt. Spielmacher, Abräumer und Box-to-Box-Spieler nur in der zentralen Mittelfeldzone bestätigt. Torjäger, Stoßstürmer und Zielspieler nur in der zentralen Angriffszone bestätigt. Dribbler in zentralen und seitlichen Angriffszonen bestätigt. Alle drei Verteidigerrollen in der gesamten Abwehrzone bestätigt. Mittlere 50 Prozent und seitliche 25 Prozent der Feldbreite für die Auswahlzonen in Mittelfeld und Angriff bestätigt. Ein erster Druckspieler und Absicherung nach Ballverlust bestätigt. Abgestimmte kurze Angebote, Tiefenläufe und Absicherung im eigenen Ballbesitz bestätigt. Am Passzeitpunkt und an der Abseitslinie ausgerichtete Tiefenläufe ohne garantierte Abseitsvermeidung bestätigt. Ändern vorbereiteter Aktionen vor Ballkontakt mit zeitlichem Aufwand bestätigt. Bevorzugter Direktabschluss bei guter Chance und passender Vorbereitung nach Querpass oder Abpraller bestätigt. Fester bevorzugter Fuß als Spielereigenschaft mit Wirkung auf Pass- und Schussvorbereitung bestätigt. Unterschiedliche Qualität der Ballannahme mit freien Bällen bei misslungener Kontrolle bestätigt. Situationsabhängige Abwehrwahl zwischen Stellen, Zweikampf im Stehen und Grätsche bestätigt. Situationsabhängige Tormannwahl zwischen Fangen und Abwehren bestätigt. Einfluss von Spielstand und Restzeit auf das situative Risiko innerhalb der Teamtaktik bestätigt. Situationsabhängige Wahl von Kopfballabschluss, Ablage oder Klärung bestätigt. Rückpassregel einschließlich Ausnahmen bestätigt. Normaler Jugend-Startbereich 7–10 für 17-Jährige bestätigt; Einfluss der Jugendarbeit auf aktuelle Startqualität bestätigt; beste Profilposition für die notwendige Elite-Mindestgrenze bestätigt; Eliteeinordnung ohne zusätzliche Einzelfähigkeitsgrenzen bestätigt; unterschiedliche Kaderqualitäten nach Vereinsstärke bestätigt; Positionsvielseitigkeit neuer Feldspieler bestätigt; Tormänner ausschließlich mit Profilposition Tormann bestätigt; Profilpositionen dauerhaft fest, spätere Erweiterung verworfen, siehe Erzeugungsplan. Individuelle Einzelanweisungen vorerst durch Rolle/Ausrichtung ersetzt, Mannschaftstaktiken erhalten; spätere Neubewertung anhand von Tests möglich. Längszonen 30 Prozent Abwehr/40 Prozent Mittelfeld/30 Prozent Angriff vom eigenen Tor bestätigt, gemeinsame technische Grenzkonvention festgehalten. Noch keine Umsetzung.

- [Meshy-Arbeitspakete für den Matchausbau](meshy-match-auftraege.md): vorhandene Figur und 34 Clips, mobile Assetvarianten, Pass-/Annahmepilot, weitere Fußballanimationen und gemeinsamer Liefervertrag für Browser/Unity. Aufträge festgelegt, noch nicht ausgeführt.

- [Match-Ausbauplan](match-ausbau-plan.md): PC-Browser und beide Stores, Platz-/Mannschaftsvarianten beim Karrierestart mit vier Kombinationen, offene Nutzerentscheidungen, Engine-/Performancevergleich, Kontaktlogik, Spielerabsichten und drei parallele Umsetzungsspuren mit Integration. Reine Planung.

- [Raumpässe v150](raumpaesse-v150.md): freie Raumziele, Verfolgung beider Teams, echte Kontakte, Abseits und gespeicherte neue Passabsicht; Szenen und vollständige Matchprüfungen. Lokal, noch nicht veröffentlicht.

- [Veröffentlichung 110](release-110.md): Matchbedienung, Animationen, gemeinsame Taktikvorlagen, Elfmeter, Distanzschüsse und Vereinsübersicht.

- [Veröffentlichung 109](release-109.md): Halbzeit aus dem Vollbild in die Taktikansicht, Rückkehr beim Start der zweiten Hälfte und Release-Prüfungen.

- [Offene Match-/3D-Themen](3d-offene-themen.md): Balleffet und eigenständige Pässe in freien Raum, Spielerwerte, Kontakte und Abnahmeszenen; außerdem Mobilhardware und Animationsqualität.

- [3D-System](3d-system.md) und [englische Fassung](3d-system-en.md): Simulation, Meshy-Rig, Animationen, Kontakte, Torwartkette, Kamera, Rückschau und Wartung; im Spiel unter „3D-Hilfe“ eingebunden.
- [Veröffentlichung 107](release-107.md): aktueller 3D-Stand im Hauptspiel, Dokumentationsintegration und Release-Prüfungen.

- [Bildvergrößerung, Grätschen und Torwartausrichtung v133](spieler-nutzer-rig/changes-v133.md): Bildfläche innerhalb der Seite vergrößern, meterbasierte Grätschenkontakte und offene Torwartbereitschaft ohne überlagernde Drehclips; lokale Prüfungen.

- [Rückschau, frühe Ballverfolgung und mobiles Vollbild v132](spieler-nutzer-rig/changes-v132.md): vollständige Sitzungsaufnahme, Ereignismarker mit drei Sekunden Vorlauf, Abspielen/Pause, kompakte TV-Einblendung und ausblendende Bedienung direkt im Spielfeld; lokale Tests und Grenzen.

- [Torwartkette, Ballführung und pausierte Rückschau v131](spieler-nutzer-rig/changes-v131.md): hohe und seitliche Paraden aus der aktuellen Position, kontinuierlicheres Dribbling, Direktabschlüsse, Ecken, Schlussphasen, Trikot-/Nummernkontrast und Rückschau-Slider; lokale Prüfungen und Grenzen.

- [Meshy-Torwartbereitschaft nach Bildvorlage](spieler-nutzer-rig/changes-keeper-v130.md): neuer Meshy-Auftrag für 10 Credits, gebeugte Bereitschaft mit tiefen offenen Händen und Fußkontakt bei Sidesteps; Retargeting auf das bestehende Rig, native Kontakt- und Offlineprüfung.

- [Finanzabschluss am Saisonübergang v130](finanzabschluss-v130.md): Jahresabrechnung mit bezahlten Gehältern, Übertrag nach separater Sponsorwahl, feste Jugendförderung und Gehaltsprojektion; lokal integriert.

- [Einheitliche Spielvorbereitung und Torwart-Handhaltung v129](ui-torwart-v129.md): Tabellenplatz direkt hinter dem Namen, Runde im Vorschaukopf und großer Finalpokal; Vorbereitung und Matchplan wie die Matchpause angeordnet, natürliche Bereitschaftshände bei Sidesteps.
- [Taktikspalte und Wettbewerbsvorschau v128](ui-anpassungen-v128.md): individuelle Spieleranweisungen im Querformat neben dem Feld; aktueller Platz im gespielten Wettbewerb beziehungsweise K.-o.-Runde.
- [Mentale Spielerfähigkeiten – Entwurf](mentale-faehigkeiten-plan.md): Ruhe, Antizipation und Entscheidungen als interne Werte sowie längerfristige Absichten mit situationsabhängigem Umplanen; Abgrenzung, Einführungsfolge und Balanceprüfung. Noch nicht implementiert.
- [Unity-/Match-Engine-Entwurf](unity-match-engine-plan.md): Vergleich der vorhandenen Browserengine mit einem möglichen Unity-Matchprototyp; Zuständigkeiten, Mobilbrowser, Kontakte, langfristige Absichten und Messkriterien. Noch kein Enginewechsel.

- [Ballführung, Direktaktionen und Saisonprofil v127](spieler-nutzer-rig/changes-v127.md): ruhigeres Dribbling, direkte Bodenpässe/-schüsse mit Kontakt, Keeper-Herauslaufen, Ausprüfung des kontrollierten Balls und Saisonstatistik im Profil; native Vergleiche und vollständige Matchprüfungen.

- [Höhere Abwehr und Elfmeter-Schussbutton v126](spieler-nutzer-rig/changes-v126.md): Abwehr bei entferntem Ballbesitzwechsel, keine Deckung untätiger Abseitsläufer, Schießen/Spielbericht in der Kopfzeile und native Match-/Speicherprüfungen.

- [Ruhigere Schritte und Richtungswechsel](spieler-nutzer-rig/changes-v125.md): weichere Fußbindung, kontinuierliche Kontaktproben und sanftere Lauf-Drehübergänge; 27 Vergleichssequenzen, tatsächliche Matchläufe, angrenzende Kontakte und zwei vollständige 3D-Partien.

- [Laufziele, Abseits, Torwart-Nachstellschritte und Ballaufsprung](spieler-nutzer-rig/changes-v124.md): mitlaufende Angreifer auch bei freiem Ball, torseitige Körpergrenze, bodennahe Grätsche, seitliche Paraden und Nachstellschritte, energiegerechtes Aufspringen und sofortige Aufstellung zur zweiten Halbzeit; native Prüfungen und regulärer Offline-Build.

- [Bodenspiel, Übergänge und Eigentoranzeige](spieler-nutzer-rig/changes-v123.md): ruhiger Lauf/Stopp, echte Pass-/Zweikampfkontakte, sichere Keeper-Ausspiele und verteidigte Abpraller, bodennahe Fangphasen und Fernschüsse; Eigentorbeschriftung ohne persönliche Torgutschrift, Pokalrunde, native Abnahme und neue [90-Partien-Statistik](spieler-nutzer-rig/match-study-v123.md).

- [Finanzsystem – Zahlungsplan](finanzsystem-plan.md): bestätigte Zahlungstermine, Prämienteilzahlungen, Jugendbudget nach Sponsorwahl und Gehälter am Saisonende; nur für neue Karrieren.
- [Vereinsfinanzen über zehn Saisonen](finanzsystem-test-v124.md): sechs Welt-Seeds, interaktive Kontostände und Einnahmen/Ausgaben je Ligaverein, Fokus auf Vereine ohne Europacup; zwölf reine Pokalvereine ohne Vereinswirtschaft mit fortgeführten Kadern und automatischem Karriereersatz.

- [Kopfbälle und Luftzweikämpfe](spieler-nutzer-rig/changes-v122.md): erreichbare Anlaufziele und Kopfkontakte, situative Ablagen/Klärungen/Abschlüsse und Fähigkeitstempo; Absprung und Landung am bestehenden Rig, Eckball nach Wechsel und Grätschenausklang, native Szenen und vollständige Warping-/Offlineprüfung.

- [Stellungsspiel, Vorwärtsverfolgung und Abseits](spieler-nutzer-rig/changes-v121.md): getrennte Deckung, taktische Abwehrlinie, antizipierte Läufe und wertabhängige Querpasswahl; Meshy-Verfolgung und Foul-/Blockübergänge, native Szenen und Match-/Warping-Nachweise.

- [Torwartaktionen, freie Ballaufnahme und Nachschüsse](spieler-nutzer-rig/changes-v120.md): reale Kontaktweite und Laufgeschwindigkeit, erreichbares Herauslaufen, hohe einhändige Abwehr, bodennaher Fangübergang. Schwache/starke Keeper in 3.000 Abschlüssen und 400 Zugriffen, sieben native 3D-Sequenzen und regulärer Offline-Build abgenommen.

- [Einzelne Fähigkeiten: 300 Partien und native Szenen](spieler-nutzer-rig/single-attributes-v119.md): neun Fähigkeiten getrennt variiert, gleichbleibender Gegner und Kontrollen; Aktionsquoten, Matchausgänge und gepaarte Unsicherheitsintervalle. Alle neun Einzelmechanismen bestätigt; Stellungsspiel und Torwartspiel im Match noch unsicher. Unveränderte Engine, eigene CSV-/JSON-Nachweise.

- [Kleine und mittlere Stärkeunterschiede: 120 Partien](spieler-nutzer-rig/moderate-gaps-v118.md): vier kontrollierte Gruppen, Punkte-/Tor-/Pass-/Zweikampfbilanzen, vorab definierte Kriterien und gepaarte Unsicherheitsintervalle. Gefundenen Einwurfkonflikt beim Halbzeitwechsel korrigiert und im regulären Offline-Spiel geprüft; keine Änderung der Wertebalance oder Veröffentlichung.

- [Schuss- und Torwartbilanz mit Ereignisketten](spieler-nutzer-rig/changes-v117.md): unterbrochene Versuche, Schuss-/Pass-/Flankentore, Fangparaden, Abpraller und Nachschüsse eindeutig erfasst. Fünf Ursachen geklärt, 90 unveränderte Outcomes mit ausgeglichenen Bilanzen; Fokus-/Native-/2D-/3D-/Offlineprüfung. Neue physische Partien, keine Nachberechnung oder Veröffentlichung.

- [Richtige Torwarthandschuhe und Abnahme des Werteeinflusses](spieler-nutzer-rig/changes-v116.md): anatomische Finger-/Daumenabdeckung, Latexfläche, gepolsterter Handrücken und Verschluss für beide Keeper. Fang-/Paraden-/Offlineprüfungen; sieben explizite Kriterien für einen deutlichen Einfluss der Spielerfähigkeiten auf den Matchausgang. Lokal integriert, keine Regeländerung oder Veröffentlichung.

- [90-Partien-Statistikprüfung der Spielerfähigkeiten](spieler-nutzer-rig/match-study-v115.md): je 30 echte Live-Partien gut/gut, gut/schwach und schwach/schwach mit gleichen Taktiken und gepaarten Seeds. Ergebnisse, Pässe, Abseits, Zweikämpfe, Standards und Torwartaktionen; Einzelspiele als CSV/JSON, fünf gezielte Bilanznachprüfungen und offene Balance-/Statistikbefunde. Keine Regeländerung oder Veröffentlichung.

- [Fähigkeiten, Fußballentscheidungen und Animationsabläufe](spieler-nutzer-rig/changes-v115.md): wertabhängige Querpässe, Lauf-Timing und Abseitsrisiko, engere Deckung und Vorwärtsverfolgung, Torwartzugriff und einhändige Abpraller. Meshy-Stopp geprüft, Bodenabstoß/Anstoß/Einwurf korrigiert, Tempo und Kopfballreichweite abgestimmt, Torquerungen und freie Luftballlandung; lokale Integration ohne neue Credits oder Spielstandumrechnung.

- [Warping-Prüfung im laufenden Spiel](spieler-nutzer-rig/changes-v114.md): Spieler, Skin und sichtbarer Ball getrennt gemessen; kontinuierliche Standardpositionierung, Ballannahme, Grätschen-/Keeperübergänge, Fanghöhe und Ausball. Baseline, zwei vollständige Partien, Kontakt-/Match-/Wiederholungsbelege und Grenzen; 0 zusätzliche Credits, keine Veröffentlichung.

- [Ballannahme, Torwartkontakte, Foulreaktionen und Abwehrlinie](spieler-nutzer-rig/changes-v113.md): Paraden von der aktuellen Position, Fangkontakt vor dem Torwart, auslaufende Fehlschüsse, natürlicher Stand und echte Foulreichweite. Zwei neue Meshy-Reaktionen für 6 Credits, insgesamt 32 Clips; Aufrücken bei eigenem Besitz und stärkere taktische Linienbindung gegen den Ball. Reguläres lokales Offline-Spiel, Belege und Grenzen.

- [Reguläre 3D-Integration und geprüfte Änderungen](spieler-nutzer-rig/changes-v112.md): neue Feldspieler/Torhüter und komplette bisherige Bewegungsbasis in Quellseite und normalem Offline-Build; gemeinsamer Lader, keine Testkarriere oder Speichermigration, unabhängiger Grafikzufall und funktionsfähiger Asset-Rückfall. Animationskorrektur und Quell-/Offline-/Match-/Replay-Nachweise; 0 zusätzliche Credits, keine Veröffentlichung.

- [Animationsprüfung: Ballführung und Richtungswechsel](spieler-nutzer-rig/README.md): reproduziertes Rückwärtslaufen mit Ball durch verzögerten Blick-/Clipwechsel korrigiert; zwölf Fälle bei 30/60/120 Hz und 3600 Matchframes, defensives Rückwärtslaufen weiterhin vorhanden. Lokale Probe mit Ballführungswende, 0 neue Credits, keine Veröffentlichung.

- [Ballaktionen, Torwartparaden, Fangen und passender Ballmaßstab](spieler-nutzer-rig/README.md): 29 Meshy-Clips, vier neue für 12 Credits; Dribbling, Pass, Flanke und Annahme mit vorhandenen Clips und Kontaktkorrektur, beidhändiges Fangen, Seitenparaden und Aufstehen. 26 Situationen in der Bewegungsprobe; Ball ungefähr ein Achtel der Spielerhöhe, 30 % kleiner als zuvor. Lokale Integration mit Kontakt-/Browser-/Offlineprüfungen; keine Veröffentlichung.

- [Vollständiger Stand/Schuss, neue Torhüter und rollende Abpraller](spieler-nutzer-rig/README.md): lokale Nutzercharakter-Probe mit zwölf Meshy-Modellen und 25 Clips (9 zusätzliche Credits), vollständigem Schussausklang, Handschuhen und nativem Torwartblick. Freie Bälle behalten Schwung; Feldspielerblocks benötigen tatsächlichen Kontakt. Neue Vereinswelt-Regeln ohne Umrechnung vergangener Spiele; Browser-/Kontakt-/Offlineprüfungen, separate Blender-Datei und offene Mobil-/Handschuhfeinarbeit. Noch nicht veröffentlicht.

- [Ballnachlauf vor Eckbällen](spieler-nutzer-rig/README.md): ausgehender Ball rollt/fliegt über die Linie weiter und wird erst unsichtbar an die Ecke versetzt; 2D/3D und Pause, unveränderte Standardwartezeit, acht Eckballfälle und bestehende Browsergates. Noch nicht veröffentlicht, 0 zusätzliche Meshy-Credits.

- [Impressum, Datenschutz, Speicherung, Werbung und Kinder – Releaseanalyse](recht-datenschutz-release-analyse.md): Abgleich mit dem aktuellen Quellstand und österreichischen/EU-Vorgaben sowie Google-Play-/Apple-Regeln; Betreiber als Privatperson in Österreich, kostenlose Werbefinanzierung und Kinder unter 14 als bestätigte Planungsgrundlage. Konkrete Lücken und Reihenfolge vor Veröffentlichung.

- [Eigene Domain, Hosting, Google-/Apple-Login und App-Stores](hosting-login-store-plan.md): Preisvergleich, geprüfter Domainkandidat, Kontovoraussetzungen und vorgeschlagene Reihenfolge bis zu Android-/iOS-Tests und Veröffentlichung. Recherche und Planung, noch keine Integration oder Bestellung.

- [Nutzercharakter mit Meshy-Textur und Bewegungen im Match](spieler-nutzer-rig/README.md): 22 Clips, kalibrierte Laufphasen/Fußanker und Bewegungsprobe mit Zeitlupe; 13 neue Meshy-Clips für 39 zusätzliche Credits. Defensives Rückwärtslaufen bei 60 % Tempo, Torwartblick zum Ball und 10 % kleinerer Ball. Lokale Testpartie mit zehn Feldspielern, Vereinsfarben, Rückennummern und Jubel; Sohlen, Ballaktionen, vollständiger 2D-/3D-Matchvergleich, Wiederholungen und Offlinebetrieb geprüft. Separate GLB/Blender-Datei; langsames Gehen, genaue Kopfballberührung und Mobil-Leistung bleiben offen. Frühere Kopfiteration 20 Credits, Bewegungs-Ausbau 23 Credits und Texturpass separat.

- [A5 – korrigierter Kragenabschluss](spieler-a5-mehransichten/README.md): lokaler Rundkragen mit sauberer Haut-Trikot-Grenze, Vergleich mit A4, erhaltene Körperoberfläche, native Blender-Datei und Prüfbelege; 0 neue Meshy-Credits.

- [A3 → erste Qualitätsfassung A4](spieler-a4-mehransichten/README.md): lokale Gesichts-/Haar-/Kragenbereinigung bei erhaltener Körperform, einmalige 4K-Retexture für 10 Credits, native Blender-Datei, tatsächlicher Detailvergleich und offene Texturfehler.

- [Spieler A3 – längerer Hals und schlankere Arme](spieler-a3-mehransichten/README.md): vier korrigierte Referenzen, neue Meshy-Fassung, drehbarer Vergleich mit A2, GLB-Download, 30 Credits und Prüfbelege.

- [Spieler A2 – Proportionsiteration in Meshy](spieler-a2-mehransichten/README.md): vier korrigierte Ansichten, neue Rekonstruktion, drehbarer Vergleich mit A, Modell-Download, 30 Credits und Grenzen der Armkorrektur.

- [Spieler A aus vier Blickwinkeln](spieler-a-mehransichten/README.md): ausgewählte Proportionsvariante, gemeinsam erzeugte erste Meshy-Fassung, drehbarer Referenzvergleich, gesicherte Task/Geometrie, Kosten und offene Modellabnahme. [Vier Bildvarianten](spieler-proportionen-v1/README.md).

- [Neuer Meshy-Musterspieler](spieler-meshy-neustart/README.md): neue A-Pose, texturierte Figur mit Rig, zwei Trikotfarben und drehbare Offline-Bewegungsprobe; Kosten, Prüfungen und offene Stil-/Matchabnahme.

- [Meshy-Mannschaften und Rumpffassung 6](meshy-concept-b/squad-torso-v6.md): zehn Feldspieler, gespeicherte Haut-/Haarfarben und Frisuren, Vereinsmuster und Rückennummern, gemeinsam genutzte Ressourcen, ruhigere Bewegungen und korrigierte Rücken-/Bauch-/Saumkontur. Lokale Offline-Matchprobe; noch nicht veröffentlicht.

- [Bewegung und Animationsübergänge – Analyse und lokaler Ausbau](movement-animation-analysis.md): Ursachen der bisherigen Lauf-/Gestenwirkung, tatsächlich implementierte Idle-/Walk-/Run-Gewichte, Anlaufen, Bremsen, Richtungswechsel und Ausklang; Match-/Browserbelege sowie offene kontinuierliche Sicht- und Hardwareabnahme. Noch nicht veröffentlicht.

- [Meshy-Workflow](meshy-workflow.md): verbundene API, tatsächlich abgerechnete Modellläufe und sichere Task-Fortsetzung. [Spieler aus Konzept B](meshy-concept-b/README.md) mit texturierter GLB, Rig und Geh-/Laufclips; [lokale Matchprobe mit engerem Trikot und angepassten Ellenbogen](meshy-concept-b/shirt-elbows-match-v5.md) integriert einen Testspieler mit den bestehenden Bewegungen und Matchtrikotfarben. Noch nicht veröffentlicht.

- [Fußballer B – verbesserte Figur und Bewegungen](3d-fussballer-b-rig-v2/README.md): neu aufgebaute Schulter-, Kleidungs- und Gelenkgeometrie, kompaktere Hände und Gesichtszüge, überarbeitete Lauf-/Passclips. Native Datei, FBX-Assets und neue Bewegungsprobe mit 244 geprüften Deformationsbildern.

- [Fußballer B – Test-Rig und Lauf-/Passprobe](3d-fussballer-b-rig/README.md): neutrale T-Pose, 22 Knochen, drei FBX-Bewegungsclips und gerenderte 6,5-Sekunden-Probe; Blender und FBX-Rückimport geprüft, Unity-Editorprüfung noch offen.
- [Unity oder Unreal – Engineempfehlung](unity-unreal-entscheidung.md): offizieller Quellenvergleich für den mobilen Browsermanager; Unity-Web-Probe empfohlen, Offline-Verpackung und Matchanbindung separat zu prüfen.

- [Fußballer B – vollständig neuer Aufbau](3d-fussballer-b-neu/README.md): über Blender MCP neu modellierte facettierte Figur nach der aktuellen Bildvorlage; native Datei und vier Renderansichten, statische Ballpose ohne Animationsrig oder Spielintegration.

- [Neues Figurenkonzept – Athlet](3d-neukonzept/README.md): neue Konzepttafel, eigener Graukörper und bekleideter Blender-Entwurf mit Polotrikot, Shorts, Stutzen und Fußballschuhen auf G:. Fünf tatsächliche Renderansichten; statische Modellstudie, noch ohne Produktionsrig, Bewegungsclips oder bestätigte Stilabnahme.
- [Verworfener Musterspieler B – Stufe 1](3d-musterspieler-b/README.md): frühere eigenständige Blender-Figur mit fünf gerenderten Blickwinkeln, Stilvergleich und Blender-/GLB-Dateien. Vom Nutzer verworfen; bleibt als Verlauf erhalten.
- [3D-Darstellung echter Vereinswelt-Partien](3d-spieldarstellung.md): veröffentlichte getrennte Vorschau mit Anbindung an die bestehende Match-Engine, gemeinsame Steuerung, Offline-Build und Reichweite der Abnahme.
- [3D-Spielermodelle – Stilplanung und Umsetzung](3d-spielermodelle.md): eigener Stilentwurf B und weiterer lokaler Athletik-Entwurf mit kräftigeren Armen und Beinen, engerer Taille und asymmetrischer Ballkontrollhaltung unter `G:\Blenderassets\FM`; außerdem verworfene Entwürfe, frühere Bewegungsproben, Geometriebudgets und veröffentlichter Stand 105. Gesicht und Stoffformen erreichen die Zeichnung noch nicht vollständig; künstlerische Nutzerfreigabe, Bewegungsclips und Mobiloptimierung stehen aus.
- [Detailliertere 3D-Spieleranimationen – Umsetzung 102–105](3d-spieleranimationen-plan.md): flüssiges Laufen, Gelenkmodell, Pass-, Schuss- und Kopfballbewegungen mit Ballkontakt; die Modellqualität hat vor weiteren Zweikampf- und Grätschenanimationen Vorrang.

- [3D-Kameraprototyp im Querformat](kameraprototyp-3d.md): eigenständige lokale TV-Kamera mit synthetischem Spielablauf, SuperCollider-Sounds und vollständig eingebetteter Offline-Datei.

- [Sponsoren – sechs nationale Kataloge](sponsoren-entwuerfe/README.md): 36 eigene Namen und SVG-Logos, kompakte Bildzeichen und interaktive Angebotskarten mit Länderwechsel und Werbebandenvorschau.

- [Vereinswappen – 48 neue Entwürfe](wappen-entwuerfe/README.md): sechs Ländertafeln mit unterschiedlichen Bildzeichen, Formen und Schriftstilen; Gestaltungsvorschläge vor der technischen Übernahme.

- [Spielstart, Accounts, Spielstände, Hall of Fame und App-Stores – Plan](speicherstaende-hall-of-fame-store-plan.md): Startablauf und Parametermatrix, Karriereverwaltung, Accountwiederherstellung, Serverkarrieren, Gerätewechsel, offene Entscheidungen und Abnahme; [offizielle Rechts- und Storequellen](speicherung-store-recherche.md).

- [Spielerreferenz 92](spieler-referenz-v92.md): neues Referenzpaar, Farbprüfung, Bildherkunft und offene visuelle Abnahme vor dem Ausbau des Pools.
- [Produktregeln](product.md): feste Entscheidungen zu Spiel, Karriere, Oberfläche und Pokal.
- [Toranimationen, Spieler-Sprites und Trikots – Plan](toranimationen-spielersprites-plan.md): abgestimmte Regeln, Umsetzungsschritte und Abnahme für die Vereinswelt.
- [Vereinstrikots – Vorschau](vereinstrikots-vorschau.html): Heim-, Auswärts- und Torwarttrikots aller 48 Vereine als kleine Datenvorschau.
- [Spielerfrisuren – visuelle Beispiele](spielerfrisuren-beispiele.md): zehn Frisuren, frontale Profilansichten und vier Jubelposen als Sprite-Vorlagen.
- [Spieler-Sprites – Laufzeitvorschau](spieler-sprites-vorschau.html): gerenderte Profil- und Jubelansichten aus gespeicherten Merkmalen und Trikots.
- [Spieler-Sprites – drei Beispiele](spieler-sprites-beispiele.svg): Profil und Jubelansicht von drei Spielern in Spielgröße.
- [Vier hochwertige Spielerbildpaare](../dist/player-pair-preview.html): frontales Profil und feste Jubelpose je Motiv mit aktuellen Trikot-, Haut- und Haarfarben; [alle vier Ansichten](spieler-bildpaar-v87.png) sowie Bannerbeispiele für [Arme weit](spieler-bildpaar-banner-b-mobil-v87.png), [Faust vor der Brust](spieler-bildpaar-banner-c-mobil-v87.png) und [zwei Zeigefinger](spieler-bildpaar-banner-d-mobil-v87.png) sind ohne lokalen Server sichtbar.
- [Erweiterter Spieler-Bildpool](../dist/player-pool-preview-v88.html): acht Bildpaare, je zwei Gesichter für vier Jubelposen, in Profil- und Bannergröße; [Standbild](spieler-bildpool-v88.png).
- [Spieler-Bildpool mit 16 Paaren](../dist/player-pool-preview-v89.html): acht weitere Frisur- und Jubel-Kombinationen mit zwei Trikot- und Farbvarianten; [vollständiges Standbild](spieler-bildpool-v89.png) und [neues mobiles Torbanner](spieler-bildpaar-banner-e-mobil-v89.png).
- [Jugendspieler-Demo](../dist/player-creation-demo-v90.html): Verein wählen und per Knopfdruck echte Jugendspieler mit Profil- und Jubelbild ohne gezeichnete Nummer erzeugen; eigenständige HTML-Datei ohne Server. [Mobiles Beispiel](spieler-erstellung-faust-brust-v91.png).
- [Farbmaskenprüfung](../dist/player-mask-variants-v87.html): vier Bildpaare mit hellem, dunklem und rotem Trikot sowie verschiedenen Haut-, Haar- und Nummernwerten; [Standbild aller zwölf Varianten](spieler-masken-varianten-v87.png).
- [Torbanner – Laufzeitvorschau](../dist/goal-banner-preview.html): aktueller Banner mit „Faust vor der Brust“, Vereinswappen und fünf Ligatoren; [animiertes Beispiel](torbanner-animation-faust-brust-v91.gif), [Ansicht bei 320 Pixeln](torbanner-faust-brust-schmal-v91.png), [mobile Ansicht](torbanner-faust-brust-mobil-v91.png) und [breite Ansicht](torbanner-faust-brust-breit-v91.png) sind ohne lokalen Server sichtbar.

![Animierter Torbanner mit M. Berger und Faust vor der Brust](torbanner-animation-faust-brust-v91.gif)
- [Trophäen-Sprites der Vereinswelt](trophy-sprites-plan.md): Länder- und Awardmotive, Flaggen und Grafikdateien.
- [Nationalitäten und Herkunft – Plan](nationalitaeten-plan.md): Länderpool und Generierung von Spielerherkunft, Namen und Flaggen.
- [KI-Vereine und Trainer – Entwurf](ki-vereine-trainer-entwurf.md): Plan für Computervereine, Trainerkarrieren und taktische Entscheidungen.
- [Vereinsmodell – Entwurf](vereinsmodell-entwurf.md): Identität, 36 unterschiedliche Startprofile, langsame Entwicklung und Balance der fiktiven Vereine.
- [Vereinskatalog – Entwurf](vereinskatalog-entwurf.md): 48 redaktionell festgelegte fiktive Namen, Farben und eigenständige Hintergründe für Liga- und Pokalvereine.
- [Spielerverträge – Entwurf](spielervertraege-entwurf.md): befristete Profiverträge, Gehalt, Ablauf und Marktfolgen im neuen Modell.
- [Welt-KI – Umsetzungsreferenz](ki-umsetzung.md): Datenmodell, Module, Ereignisfolge und Prüfschritte der neuen Vereinswelt.
- [Abnahme der neuen Vereinswelt](abnahme-welt-v69.md): Zehn-Saisons-Messung, Browserdurchgang und Freigabekriterien.
- [Entwicklung und Veröffentlichung](development.md): Quellstand, Tests, Build und Deployment.
- [Änderungsprotokoll](CHANGELOG.md): abgeschlossene Änderungen und neue Features.

## Änderungen dokumentieren

Abgeschlossene Änderungen und neue Features stehen in [CHANGELOG.md](CHANGELOG.md). Neue Einträge kommen oben unter „Noch nicht veröffentlicht“ hinzu. Bei einer Veröffentlichung werden die betreffenden Einträge unter eine Überschrift mit Datum verschoben.

Beschreibe pro Änderung kurz das sichtbare Verhalten, den Grund und bei Bedarf Auswirkungen auf bestehende Spielstände. Nenne relevante Tests oder manuelle Prüfungen. Halte Einträge für Spieler und Entwickler verständlich; Dateilisten allein erklären eine Änderung nicht.

Vorhandene, noch unfertige Änderungen im Arbeitsverzeichnis werden erst nach ihrer Fertigstellung dokumentiert.
