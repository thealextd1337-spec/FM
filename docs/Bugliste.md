# Bugliste

Stand: 13. Oktober 2026, Release 130 in der abschließenden lokalen Abnahme. Die 3D-Qualität hat Vorrang vor Accounts. „Lokal korrigiert“ bedeutet noch keine bestätigte Veröffentlichung oder Android-Abnahme.

## Offene Fehler und Qualitätsprobleme

| ID | Priorität | Problem und aktueller Stand | Nächster Schritt und Abnahme |
| --- | --- | --- | --- |
| B01 | Hoch | Browserpartien ruckeln unmittelbar nach Spielbeginn, sowohl im T3-Preview als auch in Chrome. Das Begrenzen paralleler Tests auf vier CPU-Kerne brachte laut Nutzer keine Verbesserung. Eine produktive Bildzeitplanung ist lokal eingebaut; ein eigener Chrome-Lauf erreicht rund 57 FPS auf diesem PC. | Den finalen Build und die Live-Seite prüfen, anschließend auf dem Pixel messen. Hintergrundwechsel, Pause, Vollbild und Rückkehr dürfen weder Bildstillstand noch doppelte Spielschritte verursachen. Desktop-Messung gilt nicht als Android-Freigabe. |
| B02 | Hoch | Spieler wirken noch starr; Laufgeschwindigkeit und Übergänge zwischen Gehen, Traben und maximalem Sprint sollen natürlicher und dynamischer werden. Eine native Analyse liegt vor; eine zusätzliche situative Tempowahl ist noch nicht umgesetzt. | Tatsächliche Geschwindigkeit, Beschleunigung, Bremsen und Clipwechsel gemeinsam messen. Kurze Sprints, diagonale Läufe, Antritt und Stopps in allen acht Richtungen vergleichen; keine bloße Beschleunigung der Wiedergabe. |
| B03 | Hoch | Verteidiger reagieren auf durchgebrochene Stürmer teilweise zu spät, verlieren die Verfolgung nach Richtungswechseln und foulen erst von hinten. | Verfolgungsziel, Abfangweg und Reaktionszeit auf denselben nativen Spielszenen prüfen; beide Angriffsrichtungen und unterschiedliche Spielerqualität abnehmen. Von der separat korrigierten Torwartjagd unterscheiden. |
| B04 | Hoch | Direkte Freistöße können während der Vorbereitung noch mit unpassender Körperrichtung erscheinen. Langsame Passausführung und beobachtete Wiederanstoßbewegung sind lokal korrigiert; die direkte Schussvorbereitung vor Bekanntwerden des nativen Zielpunkts bleibt offen. | Vorbereitung, Schusskontakt und Rückkehr bildweise vergleichen. Die Darstellung muss zum tatsächlich empfangenen Ziel passen, ohne Kontaktzeit, Blickfakten oder Spielregeln zu erfinden. |
| B05 | Hoch | Einzelne Fußkontakte und Aktionsübergänge rucken weiterhin. 15 Kontaktfenster sind gegenüber einem früheren, unveröffentlichten Unity-Kandidaten schlechter. Fünf historische Diagnosefehler bleiben ausgewiesen, obwohl die aktuellen Kontaktverträge bestehen. | Zuerst Passvorbereitung → Schussbewegung und danach extremes Tackling auf identischen Eingaben prüfen. Root-relative Gelenkbewegung, echte Meshsohlen, Bodenkontakt und Standfußtransfer messen; Grenzen und problematische Zeitfenster erhalten. Keine Behauptung, sämtliche Animationen seien abgeschlossen. |
| B06 | Hoch | Grundlos wirkendes Rückwärtslaufen ist vom Nutzer weiter beobachtet. Die lokale Restart-Projektion nutzt nun die tatsächlich abgeschlossene Bewegung statt alter Restgeschwindigkeit; das deckt nicht jede Verfolgungs- oder Ballannahmeszene ab. | Verbleibende Szenen aufnehmen und native Laufrichtung, Körperblick und Animationsrichtung getrennt vergleichen. Taktisch sinnvolles Rückwärtslaufen erhalten. |
| B07 | Mittel | Beim Übergang vom bestätigten gehaltenen Torwartball zum Abstoßpunkt sind native Positionssprünge von etwa 0,32–3,70 m dokumentiert. | Native Übergabe untersuchen. Bestätigter Ball bleibt in den Handschuhen; den Sprung nicht durch vorzeitiges Fangen oder eine zweite Balluhr verdecken. |
| B08 | Hoch | Kamera, unterer Bildrand, Bedienbalken und mobile Leistung benötigen noch die physische Android-Abnahme. Breite Kamera und nahe Seitenlinie sind lokal korrigiert; die Geräteprüfung wurde auf Nutzerwunsch verschoben. | Pixel 9 Pro XL: Hoch-/Querformat, Vollbild, Randaktionen, kompakte Steuerung, mindestens 75 Sekunden ohne Eingabe, Wachhalten sowie Appwechsel und Rückkehr prüfen. |

## Offene Abstimmung und Prüfungen

| ID | Aufgabe | Noch erforderlich |
| --- | --- | --- |
| P01 | Vollständige physische 3D-Partie: 4–6 Minuten ohne Taktikpausen; im Durchschnitt 10–16 Schüsse beider Teams zusammen. | Native Spielzeit und Chancenentstehung auf vollständigen Partien abstimmen. Schüsse, Schüsse aufs Tor, Tore und tatsächliche Laufzeit getrennt berichten. Kompakte Simulation und ausgespieltes Spiel nicht vermischen; Statistiken oder Wiedergabe nicht künstlich angleichen. |
| P02 | Unterschiede zwischen kompakt simulierten und ausgespielten Ergebnissen, Remis schwacher Teams und sportliche Wirkung der Spielstile. | Die drei Vergleichsreihen der [Matchagenda](kadermechanik-und-matchagenda.md#offene-matchagenda) durchführen, anschließend begründete Änderungskandidaten prüfen. |
| P03 | Natürliche Torwartfolge Parade → Abpraller → Nachfassen → Aufstehen → Abspiel. | Eine echte native vollständige Folge aufzeichnen und abnehmen. In 60 untersuchten Fixtures wurde die vollständige Parade-/Abpraller-/Nachfassfolge nicht beobachtet; dies ist eine Prüflücke, kein Beleg, dass die Folge unmöglich ist. |
| P04 | Vereinsstadien und Erkennbarkeit auf kleinen Bildschirmen. | Die vorhandenen 48 Stadionprofile erhalten, echte Heimzuordnung und mobile Ansichten weiter prüfen. Geprüfte Ansichten für Roma, Milano, Torino und Bologna bedeuten keine neuen individuellen Stadionmodelle für alle Vereine. |

Accounts mit eigenem EU-Server folgen nach der 3D-Abnahme. Budget, Updates und Backups stehen im [Account-Betriebspaket](platform/account-provider-options.md); dies ist ein offenes Produktvorhaben, kein aktueller Spielfehler.

## Lokal korrigiert und zur Veröffentlichung vorgesehen

| Meldung | Korrektur und Grenze |
| --- | --- |
| Foul-Täter schwebt beziehungsweise wirkt wie in einer T-Pose. | Die zu hohe Hüfte des vorhandenen Foulclips und dessen Eintritt aus dem Sprint sind korrigiert. Ein falsch zugeordneter T-Pose-Clip war nicht die nachgewiesene Ursache. Weitere Kontakt-Ruckler bleiben unter B05. |
| Torhüter erreicht freie Bodenbälle zu spät. | Neue Partien verwenden die geprüfte Torwartjagd 180. Bestehende gespeicherte Matchkennungen bleiben unverändert; Luftbälle und strenge Fangfakten wurden nicht pauschal gelockert. |
| Spieler 12/13 beziehungsweise weitere Vereinsroster-Spieler fehlen in der Aufstellungsauswahl. | Matchplan und Spielvorbereitung zeigen zusätzliche Spieler unter einer Trennlinie. Start-/Banktausch über Maus, Touch und Tastatur sowie Positionsfarben sind lokal geprüft. Gültiger Vereinsrosterdeckel bleibt 14; nach Anpfiff bleibt die Spieltagsauswahl gesperrt. |
| Rückwärtsbewegung bei Wiederanstoß und falsche Richtung bei langsamem Pass. | Beobachtete native Restart-Bewegung und tatsächliche Passausrichtung werden korrekt projiziert. Die allgemeineren Restfälle B04/B06 sind dadurch nicht vollständig geschlossen. |

[Release 130 mit Abnahme und Veröffentlichungsstand](release-130.md), [weitere geplante Match-Erweiterungen](3d-offene-themen.md).

Bestehende Spielstände werden für diese Arbeiten nicht rückwirkend berechnet oder umgerechnet. Ein Punkt wird erst geschlossen, wenn seine konkrete Abnahme vorliegt.
