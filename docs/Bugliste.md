# Bugliste

Stand: 14. Oktober 2026. Release 132 ist lokal auf `release/r132` vorbereitet; Push, Deployment und Live-Abnahme übernimmt die Integration. Technisch behobene Meldungen bleiben bis zur konkreten Nutzerabnahme gekennzeichnet. Backlogeinträge starten keinen Folgeauftrag. Physische Android-Abnahmen bleiben getrennt von Browserprüfungen.

## Offene Fehler und Qualitätsprobleme

| ID | Priorität | Problem und aktueller Stand | Nächster Schritt und Abnahme |
| --- | --- | --- | --- |
| B01 | Hoch | Browserpartien ruckeln laut Nutzer. **Offen; auf Nutzerentscheidung in Release 132 nicht behandelt.** Frühere Desktop-/Schedulernachweise sind keine Android-Freigabe. | Flüssigkeit auf dem Nutzergerät und physisch auf den Pixels einschließlich Hintergrundwechsel, Vollbild und Wachhalten messen. |
| B02 | Hoch | Spieler wirken starr; native Analyse vorhanden. **Offen.** Die zusätzliche situative Tempowahl wurde wegen Nebenwirkungen zurückgenommen. | Geschwindigkeit, Beschleunigung, Bremsen und Clipwechsel in acht Richtungen gemeinsam messen; kein bloßes Beschleunigen der Wiedergabe. |
| B05 | Hoch | **Teilweise korrigiert, weiter offen:** Knieflips behoben. Tackles mit 9.180/7.970/4.398 °/s und Pässe bei 69,75/69,10 s bleiben offen. Absolute Beckengeschwindigkeit beim Foul 52,10 s: 1,566 > 1,5 m/s, vorbestehend seit Release 131. | Fußkontakte, Standfußtransfer und Übergänge auf identischen Eingaben abnehmen; die verbleibenden Messfehler ausdrücklich erhalten. Kein vollständiger Animationsabschluss. |

## Release 132: technisch behoben, Nutzerabnahme offen

Neue Matchregeln verwenden ausschließlich neue Partien mit Kennung 182. Bestehende gespeicherte Partien werden nicht ummarkiert oder nachberechnet. Darstellungskorrekturen sind von nativen Regeländerungen getrennt.

| ID | Status | Korrektur und verbleibende Abnahme |
| --- | --- | --- |
| B03 | Mit Release 132 behoben, Nutzerabnahme offen | Verteidiger verfolgen Durchbrüche und reagieren auf Richtungswechsel; Kontaktversuche sind pro Tick gesperrt. Grätschen von hinten mit Körperkontakt bleiben Foul. Konkrete Spielszenen beziehungsweise Bedienung auf dem Nutzergerät bestätigen. |
| B04 | Mit Release 132 behoben, Nutzerabnahme offen | Neue Freistöße entscheiden Schuss beziehungsweise Passziel schon bei der Vorbereitung; Körperrichtung und Kontakt folgen diesem gespeicherten Plan. Konkrete Spielszenen beziehungsweise Bedienung auf dem Nutzergerät bestätigen. |
| B06 | Mit Release 132 behoben, Nutzerabnahme offen | Die Unity-Projektion berücksichtigt tatsächlich beobachtete Bewegung statt entgegenstehender Restgeschwindigkeit; sinnvolles Rückwärtslaufen bleibt erhalten. Konkrete Spielszenen beziehungsweise Bedienung auf dem Nutzergerät bestätigen. |
| B07 | Mit Release 132 behoben, Nutzerabnahme offen | Bestätigte Torwartbälle bleiben beim Weg zum Abstoßpunkt an der Hand; Übergabe an den Fuß folgt der nativen Aktion. Konkrete Spielszenen beziehungsweise Bedienung auf dem Nutzergerät bestätigen. |
| B09 | Mit Release 132 behoben, Nutzerabnahme offen | Fähigkeitsabhängige Elfmeterqualität mit gemäßigten Unterschieden; ausgespieltes und kompaktes Elfmeterschießen mit drei Schützen und anschließender Paarentscheidung. Konkrete Spielszenen beziehungsweise Bedienung auf dem Nutzergerät bestätigen. |
| B10 | Mit Release 132 behoben, Nutzerabnahme offen | Ecken verwenden eine eigene fähigkeitsabhängige Fehlerlogik. Grenze: rund 16 % hoher Ecken landen unerreicht und rollen anschließend ins Seitenaus (Folgeballverhalten). Konkrete Spielszenen beziehungsweise Bedienung auf dem Nutzergerät bestätigen. |
| B11 | Mit Release 132 behoben, Nutzerabnahme offen | Foulverursacher erhalten die korrigierte Pose und Rückkehr; native132 nutzt die r22-Korrektur auch außerhalb der Oberflächenprobe. Konkrete Spielszenen beziehungsweise Bedienung auf dem Nutzergerät bestätigen. |
| B12 | Mit Release 132 behoben, Nutzerabnahme offen | Freie Boden-/Luftbälle und Abpraller erhalten einen Hauptjäger je Team und getrennte Unterstützung; Ziele und Sperren überleben JSON-Restore. Konkrete Spielszenen beziehungsweise Bedienung auf dem Nutzergerät bestätigen. |
| B13 | Mit Release 132 behoben, Nutzerabnahme offen | Wirksamer Halbzeit-/Schlusspfiff entfernt die alte Ballaktion; nach Seitenwechsel bleibt keine alte Flugbahn aktiv. Konkrete Spielszenen beziehungsweise Bedienung auf dem Nutzergerät bestätigen. |
| B14 | Mit Release 132 behoben, Nutzerabnahme offen | 3D- und Browseranzeige ordnen Namen, Wappen und Tore nach tatsächlichem Heim-/Auswärtsrecht zu. Konkrete Spielszenen beziehungsweise Bedienung auf dem Nutzergerät bestätigen. |
| B15 | Mit Release 132 behoben, Nutzerabnahme offen | Die obere Finanzaktion scrollt zur unteren Bestätigung und nennt den erforderlichen Schritt, auch ab Saison 2; sie bucht keine Förderung. Konkrete Spielszenen beziehungsweise Bedienung auf dem Nutzergerät bestätigen. |
| B16 | Mit Release 132 behoben, Nutzerabnahme offen | Eigene Angebote können bis zum vollzogenen Wechsel zurückgezogen werden, auch nach Ablöseeinigung; danach ist sofort ein neues Angebot möglich. Konkrete Spielszenen beziehungsweise Bedienung auf dem Nutzergerät bestätigen. |
| B17 | Mit Release 132 behoben, Nutzerabnahme offen | Tageswechsel zeigt tatsächliche Vereins-/Spielerantworten als Popup, einschließlich Gegenforderungen; mehrere Antworten werden vollständig gespeichert und einzeln bestätigt. Konkrete Spielszenen beziehungsweise Bedienung auf dem Nutzergerät bestätigen. |
| B18 | Mit Release 132 behoben, Nutzerabnahme offen | Zeigerklick markiert, verschiebt oder tauscht aber nicht; Maus-/Touch-Drag bleibt aktiv, ebenso Tastatur- und assistive Bedienung. Konkrete Spielszenen beziehungsweise Bedienung auf dem Nutzergerät bestätigen. |

B08 wurde auf Nutzerwunsch gestrichen und wird nicht wieder eröffnet.

## Zusätzlich festgehaltene vorbestehende Fehler

| ID | Problem und Basisnachweis | Nächster Schritt |
| --- | --- | --- |
| B19 | Gesamtpartie-Restore-Parität weicht ab: 3.540 gegenüber 3.676 Ticks, beide 1:0. Bereits auf Basis `57f7e939` vorhanden. Einzelne markergebundene Restore-Gates schließen diese Gesamtpartie-Lücke nicht. | Ursache der vollständigen Fortsetzungsabweichung isolieren; nicht als Release-132-Regression oder bestandenes Gate ausweisen. |
| B20 | Alte Prüfungen bereits auf dem Basisstand rot: `check-free-ball-positioning-v124` (`retreat>0`), `check-pause-layout-v128` (shoot-Selektor), `check-fullscreen-tv-v132` (Canvas y=-66), `check-match-additions-v148` („No restart focus throw“), `test-goal-replay-v103` („v50Restart is not defined“). | Produkt- und Testursache jeweils gesondert untersuchen; keine pauschale Abschwächung. Diese Checks gehören nicht zum grünen Workflow-Schritt „Spieltests ausführen“. |

## Offene Abstimmung und Prüfungen

| ID | Aufgabe | Noch erforderlich |
| --- | --- | --- |
| P01 | Vollständige physische 3D-Partie: 4–6 Minuten ohne Taktikpausen; durchschnittlich 10–16 Schüsse beider Teams. | Weiter offen. 40 gepaarte Vollpartien: Basis 3,24 min / 4,7 Schüsse / 1,98 aufs Tor / 1,5 Tore; neu 2,86 / 3,85 / 1,35 / 1,13. Native Simulationszeit einschließlich Unterbrechungen, keine gemessene Geräte-Wandzeit. Ziel nicht erreicht; [Releasebericht](release-132.md). Analyse mit Ursachen, Prototypmessungen und Nutzerfragen: [P01-Analyse vom 14. Oktober 2026](p01-analyse-2026-10-14.md). |
| P02 | Unterschiede zwischen kompakt simulierten und ausgespielten Ergebnissen, Remis schwacher Teams und sportliche Wirkung der Spielstile. | Die drei Vergleichsreihen der [Matchagenda](kadermechanik-und-matchagenda.md#offene-matchagenda) durchführen, anschließend begründete Änderungskandidaten prüfen. |
| P03 | Natürliche Torwartfolge Parade → Abpraller → Nachfassen → Aufstehen → Abspiel. | Eine echte native vollständige Folge aufzeichnen und abnehmen. In 60 untersuchten Fixtures wurde die vollständige Parade-/Abpraller-/Nachfassfolge nicht beobachtet; dies ist eine Prüflücke, kein Beleg, dass die Folge unmöglich ist. |
| P04 | Vereinsstadien und Erkennbarkeit auf kleinen Bildschirmen. | Release 131 verwendet fünf feste Low-Poly-Stadionvorlagen für 96 Ligavereine. Die [Zuordnung](stadionerweiterung-plan.md) und tatsächliche Heimidentität erhalten; weitere individuelle Modelle sind zurückgestellt. Frühere Prüfungen von 48 Profilen sind historische Belege. |
| P05 | Offene Flutlicht-Besichtigung aus U01/Q01. | Echter 200-Prozent-Browserzoom, reale Smartphone-/Screenreaderbedienung einschließlich Tastatur und Dialogen sowie gemeinsame visuelle Besichtigung von Lesbarkeit, Abständen und Bedienung. [Nachprüfung](ui-redesign/feedback-2026-10-08.md). |
| P06 | Reale Plattform-/Dauerlastabnahme aus R01/Q01. | Pixel 9a und Pixel 9 Pro XL: stabile 30 Bilder/s, kalter/warmer Start, beide Feldgrößen und Mannschaftsgrößen, vollständige Rückschau, mindestens 20 Minuten Sitzung, Speicherverlauf und Hintergrund/Rückkehr. PC-Ladeziel von 10–15 Sekunden gesondert messen. B01 ist Teil dieser offenen Abnahme. |
| P07 | Installierbare und aktualisierbare Android-Testfassung aus E01/S01/I04/Q01. | Appweg, Paketkennung, Signierung, Versionsfolge und Downloadort festlegen; erste signierte APK und mindestens zwei aufeinanderfolgende Lieferungen auf beiden Pixels als echte Updates prüfen, mit Erhalt neuer Karrieren/Einstellungen und ohne doppelte Buchungen. Hauptmenü-Updatehinweis mit Versionsnummer/Downloadknopf gehört zum geplanten Umfang. Im Projekt wurde keine APK-Datei gefunden; Umsetzung und Geräteabnahme sind nicht belegt. [Installations-/Updateplan](android-installation-update-plan.md). |

Der damalige [Abgleich aller 20 Agentenpakete](history/status-2026-10-13.md) ist inhaltlich aus dem gesicherten Release-130-Arbeitsstand erhalten, seine relativen Links sind angepasst; er ist eine historische Einordnung und kein aktueller Auftrag. Der [historische Auftragskatalog](agentenauftraege/README.md) führt zu den Paketquellen. Die P-/B-IDs dieser Bugliste sind unabhängig von gleichnamigen Paket-IDs im Agentenplan.

Accounts mit eigenem EU-Server folgen nach der 3D-Abnahme. Budget, Updates und Backups stehen im [Account-Betriebspaket](platform/account-provider-options.md); dies ist ein offenes Produktvorhaben, kein aktueller Spielfehler.

## Release 130: historischer Status nach Nutzerbesichtigung

| Meldung | Korrektur und Grenze |
| --- | --- |
| Foul-Täter schwebt beziehungsweise wirkt wie in einer T-Pose. | **Wieder offen (B11).** Eine Korrektur an Hüfte und Sprintübergang wurde veröffentlicht, die Foul-/T-Pose tritt laut Nutzer weiterhin auf. |
| Torhüter erreicht freie Bodenbälle zu spät. | Neue Partien verwenden die geprüfte Torwartjagd 180. Bestehende gespeicherte Matchkennungen bleiben unverändert; Luftbälle und strenge Fangfakten wurden nicht pauschal gelockert. |
| Spieler 12/13 beziehungsweise weitere Vereinsroster-Spieler fehlen in der Aufstellungsauswahl. | **Behoben, vom Nutzer bestätigt.** Matchplan und Spielvorbereitung zeigen zusätzliche Spieler unter einer Trennlinie. Start-/Banktausch über Maus, Touch und Tastatur sowie Positionsfarben sind lokal geprüft. Beide mobilen Live-Ansichten bestehen den tatsächlichen Bank-/Feldtausch und unveränderte Speicherung nach Neuladen. Gültiger Vereinsrosterdeckel bleibt 14; nach Anpfiff bleibt die Spieltagsauswahl gesperrt. |
| Rückwärtsbewegung bei Wiederanstoß und falsche Richtung bei langsamem Pass. | **Weiter beobachten (B04/B06).** Korrekturen sind veröffentlicht; der Nutzer bestätigt noch keinen vollständigen Abschluss. |

[Release 130 mit Abnahme und Veröffentlichungsstand](release-130.md), [weitere geplante Match-Erweiterungen](3d-offene-themen.md).

Bestehende Spielstände werden für diese Arbeiten nicht rückwirkend berechnet oder umgerechnet. Ein Punkt wird erst geschlossen, wenn seine konkrete Abnahme vorliegt.

## Einordnung nach Release 131 (historisch)

Low-Poly, Tag/Nacht, feste Stadionzuordnung und Tornetz sind in [Release 131](release-131.md) integriert. Der GPU-Aufwand des Netzes wurde nicht gesondert gemessen. Historische Meldungen bleiben bis zu ihrer konkreten Abnahme offen; spätere Befunde werden nicht aus einer allgemeinen Releaseabnahme abgeleitet. P05 hier bezeichnet die offene Flutlicht-Besichtigung und ist von der historischen Spieler-/Taktik-Paketkennung P05 im [Auftragskatalog](agentenauftraege/README.md) zu unterscheiden.
