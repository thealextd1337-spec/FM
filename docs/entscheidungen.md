# Entscheidungen und aktueller Umfang

Stand: 13. Oktober 2026. Maßgeblich sind aktueller Nutzerauftrag und tatsächlich geprüfter Checkout. Diese Liste hält Entscheidungen, historische Ideen und Grenzen auseinander; Backlogeinträge starten keine Arbeit.

| Thema | Geltender Stand und Referenz |
| --- | --- |
| Aktuelle Quelle | Hauptcheckout mit übernommenem Release 131, `dist/`; [Entwicklung](development.md), [Releasebericht](release-131.md). Nutzer bestätigt Release 131 live; diese Bereinigung enthält keinen Deploy oder neuen Livecheck. |
| Low-Poly | In Release 131 integriert: Tag/Nacht, fünf feste Stadionvorlagen für alle 96 Ligavereine, tatsächliche Vereinsidentität und Tornetz. [Produktregeln](product.md#low-poly-darstellung-seit-release-131), [Stadionzuordnung](stadionerweiterung-plan.md). |
| Nighttime als alternative Stilidee | Getrennte Nighttime-/Low-Poly-Anleitungen vom 12. Oktober 2026 sind historische Vorschläge. Nighttime ist als alternative Idee erhalten und nicht verworfen; seine bloße Erwähnung beauftragt keine Umsetzung. Historische Quellen im [früheren Index](history/index-before-cleanup-20261013-links.md). Nighttime-Stilidee und integrierte Nachtspiele sind unterschiedliche Aussagen. |
| Licht-/Stadionfortsetzungen | Der Nutzer hat die fehlerhaften Fortsetzungen in `work/lowpoly-live-lighting` und `work/lowpoly-live-stadiums` verworfen und ihre Entfernung beauftragt. Die gesicherten Rohfassungen dokumentieren Herkunft; sie werden nicht weitergeführt oder in Release 131 übernommen. Die Bereinigung ändert den Release-131-Produktcode nicht. |
| Tornetz und Leistung | Netz integriert. Sein gesonderter GPU-Aufwand ist ungemessen; Funktions- und Browsernachweise sind keine GPU-Messung. [Release 131](release-131.md), [Bugliste](Bugliste.md). |
| Stadionausbau | Zusätzliche 91 Einzelentwürfe vorerst zurückgestellt; fünf feste Vorlagen gelten. Spätere Individualisierung bleibt als Idee erhalten, ohne aktuellen Auftrag. [Stadionplan](stadionerweiterung-plan.md). |
| Fehler und Wünsche | B09–B18/P05–P07 aus der späteren Release-130-Besichtigung bleiben im [Backlog](Bugliste.md); B11 ist wieder geöffnet. B15–B18 sind ausdrücklich noch nicht umgesetzte Nutzerwünsche. Historische Auftrags-ID P05 und aktuelle Bugprüf-ID P05 sind getrennte Kennungen. |
| Frühere Pläne und Prompts | [Auftragskatalog](agentenauftraege/README.md) und [Archivindex](history/README.md) sind inaktiv. Bestätigte Präferenzen und nicht verworfene Ideen bleiben erhalten; alte Timer, Modellzuweisungen und Restschritte starten nichts. |
| Vereinswelt | Neue Produktfunktionen gehören zur Vereinswelt. Die bisherige Sechserliga wird nicht weiterentwickelt. [Produktregeln](product.md). |
| Freekickdemo | Eigenständiges Projekt; kein Teil von Doppel-6-Änderung, Aufräumen oder Veröffentlichung. |
| Bestandsspielstände und Fähigkeiten | Keine rückwirkende Neuberechnung/Umrechnung mit zusätzlicher Altstandslogik gemäß [Entwicklung](development.md). Fähigkeiten auch in zugänglichen Texten ausschließlich als Farbstufen; exakte Werte bleiben intern. |
| Meshy | Bei entsprechend beauftragter Assetarbeit nutzbar; verfügbare Credits und historische Assetpläne sind kein Generierungsauftrag. [Workflow](meshy-workflow.md). |

## Herkunft und Sicherung

Der Root-Abgleich vom 13. Oktober 2026 bewahrt die fünf lokal geänderten Originaldokumente sowie abweichende unversionierte Root-Dokumente außerhalb des Repositorys mit SHA-256-Manifesten. Frühere 127-/129-Quellen- und Veröffentlichungsaussagen werden nicht als aktueller Stand übernommen. Ihre Fachregeln und Ideen sind durch Release 131 oder die historische Dokumentation erhalten. Entfernte Arbeitsstände bleiben über die externen Sicherungsmanifeste wiederherstellbar.

Bei einer beauftragten Wiederherstellung zuerst `H:/Doppel6-Sicherung-20261013/WIEDERHERSTELLUNG-AKTUELL.md` lesen. Dieser Einstieg verbindet die ursprünglichen Archive mit den Nachträgen; die genaue Licht-/Stadion-Zuordnung steht unter `nachtrag-licht-stadion/review-evidence/INVENTORY.json`. Immer in ein isoliertes Ziel wiederherstellen und die Manifestprüfsummen vergleichen.
