# AP04: nationale Wettbewerbe und Kalender

Stand: 10. Oktober 2026. Im isolierten Arbeitsverzeichnis `work/ligaexpansion-ap03` auf Basis 121 umgesetzt, ohne Veröffentlichung.

## Lieferung

Neue Aufbauwelten können über `D6Expansion.createDomestic(clubId, seed, managerName, matchOptions)` zwölf nationale Ligen und zwölf nationale Pokale anlegen. Jede Liga hat acht Vereine, 14 Spieltage und 56 Paarungen. Jeder Gegner wird einmal zuhause und einmal auswärts getroffen; jeder Verein erhält sieben Heim- und sieben Auswärtsspiele. Die Paarungen verwenden den vorhandenen Seed-/Fixture-Vertrag und werden gespeichert.

Die nationalen Pokale beginnen mit acht Achtelfinalpartien für alle 16 Landesvereine. Nach abgeschlossener Runde werden Viertel- und Halbfinale neu und ungesetzt ausgelost. Finale einzeln und neutral; zuerst gezogener Verein hat ansonsten Heimrecht. Ein vollständiger Pokal enthält 15 Partien, vier für einen Finalisten. `v62CupProgress` leitet nur ausdrücklich als `domestic16` gekennzeichnete Wettbewerbe an diesen Ablauf weiter. Wiederholter Rundenschluss lost nicht erneut. Die gemeinsame Einzelspielauflösung verwendet bei Gleichstand das bestehende Elfmeterschießen ohne Verlängerung. Der kompakte Matchpfad berücksichtigt bei ausdrücklich neutralen neuen Partien keinen Heimbonus.

Der gemeinsame gespeicherte Kalender (`D6Expansion.calendar()`) läuft vom 1. August bis 13. März. Ligapartien liegen samstags, Pokalrunden mittwochs am 14. August, 16. Oktober, 18. Dezember und 19. Februar. Crown-/Horizon-Runden besitzen reservierte Mittwochstermine in anderen Kalenderwochen. Auch für einen Verein mit allen nationalen und internationalen Spielen liegen mindestens zwei volle spielfreie Tage zwischen Partien. Die Kalenderdaten verwenden wie bisher ein festes Referenzjahr zur Anzeige; die Karriere zeigt Saisonnummern.

## Speicherung und Vorschau

Schema 15 / Modell 11 bleibt erhalten. Der neue Vorbereitungsstand trägt `rules.stage: domestic-prepared`, die Regeln einschließlich Kalender und 24 nationale Wettbewerbe mit zunächst 768 Partien: 672 Liga- und 96 Achtelfinalpartien. Die weiteren 84 Pokalpartien entstehen nach tatsächlicher Qualifikation; damit werden national insgesamt 852 Partien erreicht. Der Validator prüft den ungespielten Stand gegen den reproduzierbaren Generator. Manipulierte Tage, Teilnehmer, fehlende Partien oder vorgetäuschte Ergebnisse werden abgewiesen.

Die Entwicklungsvorschau erzeugt diesen Stand und zeigt einen aufklappbaren Kalender des Startvereins. Speichern, Export, Import und erneutes Öffnen verwenden dieselbe Verwaltung. Bestehende AP03-Aufbauwelten und alte 48er-Welten werden nicht ergänzt oder umgerechnet. Die Karrierephase bleibt `world-foundation`; Tagesfortschritt ist gesperrt, bis AP05/06 die internationalen Wettbewerbe und den vollständigen Saisonlauf anbinden. Es wird keine reine nationale Karriere als fertige Expansion ausgegeben.

Lokaler Aufruf im Arbeitsverzeichnis: `$env:SECHSER_PORT='4184'`, danach `node work/server.cjs`; Vorschau unter `http://127.0.0.1:4184/expansion-world-preview.html`.

## Nachweise und Übergabe

- `node work/test-world-expansion-domestic-v164.cjs`: 40 Seeds in zwölf Ländern, insgesamt 480 vollständige synthetische Ländersaisons; Paarungszahlen, sieben Heim-/Auswärtsspiele, vier Pokalrunden, neutrale Finals, wiederholter Rundenschluss, eindeutige Fixture-IDs und Ruheabstände. Beide maximalen internationalen Belastungswege passen in die reservierten Fenster. Dies ist eine Strukturprüfung, kein 852-Partien-Balanceversuch.
- Native neue 192er-Welt aufgebaut, gültig gespeichert und per Export/Import identisch wiederhergestellt. Gemeinsame Elfmeterschießauflösung mit tatsächlich gespeicherten Kadern und wiederholter Auflösung geprüft. Beschädigte Kalender-/Wettbewerbsdaten werden abgelehnt.
- Bestehende Kalenderprüfung über zehn Saisons und Matchprüfung bestanden; weiterhin 259 Partien je alter Saison. AP03-Aufbau-/Speicherprüfung weiterhin bestanden.
- Browser: Innsbruck Sport, 24 Wettbewerbe, 768 vorbereitete Partien, 15 sichtbare Kalendereinträge für den Startverein, ausdrückliche IndexedDB-Speicherung und identischer Weltinhalt nach Neuladen. Bei 390 px Breite keine horizontale Überbreite. Öffnen zeigt den vorbereiteten Kalender.
- Einzeldatei-Build und Assetprüfung bestanden. Seitenfuß weiterhin 121; keine Veröffentlichung oder neuen Unity-Artefakte.

AP05/06 übernehmen ausschließlich die gespeicherten reservierten Fenster. Vor Aktivierung müssen Saisonvorbereitung, Tagesfortschritt, Ligawinner am 14. Spieltag, internationale Runden, Saisonabschluss und Fortsetzung gemeinsam auf den Kalendervertrag umgestellt werden. Der alte Saisonlauf mit `v62Days` darf hierfür nicht unverändert aufgerufen werden. Wirtschaft und Qualifikation bleiben AP07/08, vollständige Karriereoberfläche AP10 und Gesamt-/Geräteabnahme AP11. Die vollständige integrierte Kalenderabnahme erfolgt mit AP05/06.
