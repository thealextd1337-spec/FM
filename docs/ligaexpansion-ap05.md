# AP05: Crown Cup

Stand: 10. Oktober 2026. Crown-Erzeugung und Rundenschluss lokal auf Basis 121 umgesetzt, ohne Veröffentlichung. Voller Saisonlauf folgt zusammen mit Horizon in AP06.

## Umsetzung

`v165Crown(entrants, clubs, season, seed)` erstellt den eigenständigen Wettbewerb `S{season}:CROWN`, `type: europe`, `format: crown`. Das vorhandene Tabellen-, Fixture-, Hin-/Rückspiel- und Elfmeterschießmodell bleibt maßgeblich. Der bisherige Europacup wird nicht geändert.

26 unterschiedliche Vereine bekommen fünf vollständige Runden mit je 13 Partien. Die deterministische Auslosung sucht vollständige Paarungen mit begrenztem Backtracking und gegebenenfalls einer neuen Gesamtziehung. Sie lockert weder die nationale Sperre noch das Verbot doppelter Gegner. Unmögliche Felder, insbesondere mehr als 13 Vereine eines Landes, werden vorab abgewiesen. Gleichverteilung über alle theoretischen Spielpläne wird nicht behauptet.

Alle 26 Knoten des Gegnergraphen haben Grad fünf. Ein Hilfsknoten mit einer zusätzlichen Kante pro Verein ermöglicht eine Eulerorientierung. Nach Entfernen der Hilfskanten verbleiben genau 13 Vereine mit drei Heimspielen und 13 mit zwei Heimspielen. Die fünf Ligaphasentermine kommen unverändert aus dem gespeicherten AP04-Kalender.

Nach allen 65 Ergebnissen wird die bestehende Tabelle eingefroren: Punkte, Tordifferenz, Tore, Siege, reproduzierbares Los. Rang 1–4 spielt gegen ausgeloste Ränge 5–8; Rang 9–26 scheidet aus. Die Viertelfinals 0/1 und 2/3 bilden die beiden Halbfinals. Die bessere ursprüngliche Ligaphasenplatzierung hat jeweils das Rückspiel zuhause. Nationale Duelle sind im gesamten K.-o.-Weg erlaubt. Kein Play-off, keine Verlängerung oder Auswärtstorregel. Das einzelne Finale ist neutral. Insgesamt 78 Partien und zehn für einen Finalisten.

`v62EuropeProgress` leitet nur Wettbewerbe mit `format: crown` an diesen Ablauf weiter. Unvollständige Runden dürfen keine nächste Runde erzeugen. Wiederholter Abschluss erzeugt weder neue Paarungen noch zusätzliche Partien. Paarungen, Rangliste, Halbfinalweg und Ergebnisse sind gewöhnliche gespeicherte JSON-Daten.

## Vorschau und Speicherung

`D6Expansion.createCrown(clubId, seed, managerName, matchOptions)` erstellt eine neue Welt mit nationalen Wettbewerben und der Crown-Ligaphase. Die Teilnehmer stammen aus der gespeicherten fiktiven AP01-Ausgangsquelle, einschließlich Titelverteidigern und den vereinbarten Nachrückern. Keine alten Ergebnisse, Titel oder Zahlungen werden erfunden.

Der Stand trägt `rules.stage: crown-prepared`, Schema 15 / Modell 11 und 25 Wettbewerbe mit zunächst 833 Partien. Der Validator erlaubt zunächst nur den reproduzierbar erzeugten ungespielten Vorbereitungsstand. Änderungen an Teilnehmern, Tagen, Ranglisten oder Paarungen werden abgelehnt. Alte Aufbau-, nationale Vorbereitungs- und 48er-Welten bleiben unverändert gültig.

Die Vorschau unter `http://127.0.0.1:4184/expansion-world-preview.html` zeigt den Startvereinskalender, alle 26 Teilnehmer und die 65 Ligaphasenpartien. Crown-Spiele sind ausdrücklich als Crown Cup beschriftet. Speichern, Export/Import und Öffnen verwenden die gemeinsame Verwaltung. Der Karrierefortschritt bleibt bis zur Horizon-/Saisonintegration gesperrt. Für den lokalen Server im Arbeitsverzeichnis `work/ligaexpansion-ap03`: `$env:SECHSER_PORT='4184'`, danach `node work/server.cjs`.

## Nachweise

- `node work/test-world-expansion-crown-v165.cjs`: 300 reproduzierbare Ziehungen über das echte Startfeld und vier Konzentrationsfälle, einschließlich 13/13-Vereinen aus zwei Ländern. Fünf unterschiedliche ausländische Gegner, vollständige Runden und exakt 13/13 Heimverteilung geprüft.
- 25 vollständige synthetische K.-o.-Verläufe: 78 Partien, Top-8-Auswahl, Rückspiel-Heimrecht, fester Halbfinalweg, zehn Partien je Finalist, neutrales Finale und wiederholter Rundenschluss. Ein gesonderter Konzentrationsfall erzeugt ausschließlich nationale Viertelfinalduelle und bestätigt ihre Zulässigkeit.
- Eine native kompakte Crown-Partie nach 15 Spielminuten pausiert und per JSON fortgesetzt: identischer Spielbericht, einmalige Spieler-/Belastungsbuchung. Ein Rückspiel mit 2:1 und 1:0 ergibt trotz verschiedener Auswärtstore einen Gleichstand 2:2 und das gemeinsame Elfmeterschießen; erneute Auflösung verändert nichts. Dies ist kein Unity-/physischer Vollmatchnachweis.
- Neue Crown-Vorschauwelt gültig erzeugt und per Export/Import identisch wiederhergestellt; beschädigte Daten abgewiesen. Native alte Welt vor/nach Modulinstallation identisch. AP04-Struktur-/Speicherprüfung, alter Kalender über zehn Saisons und Build-/Assetprüfung bestanden.
- Browser mit 390 px Breite: 25 Wettbewerbe, 833 vorbereitete Partien, 26 Teilnehmer, 65 Crown-Ligaphasenpartien, keine horizontale Überbreite. Nationale und Crown-Vorbereitung gleichzeitig in IndexedDB gültig gespeichert; Opening zeigt Crown ohne Match-Leitaktion. Weltinhalt nach erneutem Laden per SHA-256 identisch.

Prüfbericht: `outputs/ligaexpansion-ap05/check.json`. Seitenfuß bleibt 121; keine Live-Veröffentlichung oder neuen Unity-Artefakte.

## Übergabe

AP06 bindet Horizon und den gesamten aktiven Kalender ein. Dabei sind die AP04-Integrationsbedingungen für Vorbereitung, Fortschritt, nationale Ligawinner, Saisonabschluss und nächste Saison zu erfüllen. Die Vorbereitung enthält bereits den Crown-Spielplan; Laden darf keine neue Ziehung auslösen. Dynamische Folgesaisonqualifikation bleibt AP07, Länderwertung AP07, Awards/volle Karriereoberfläche AP09/10 und reale Geräte-/Gesamtabnahme AP11.
