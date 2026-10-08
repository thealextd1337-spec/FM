# Matchkorrekturen v139

Der erste Klick auf den bisherigen Rückschauknopf startete automatisch bei der ersten Aufnahme. Jetzt pausiert er im Livezustand die vorhandene Simulation und setzt sie an derselben Stelle fort; ein bewusst ausgewählter älterer Zeitpunkt behält die Rückschaufunktion. Fertige Partien lassen sich weiterhin gezielt rückblickend ansehen.

Bei Standdrehungen behielten beide Füße alte Weltpositionen und Orientierungen bei, während sich die Hüfte drehte. Das wurde am vorhandenen Meshy-Rig vor und nach der Änderung gemessen. Die Bindung wird während stationärer Feldspielerdrehungen mit der vorhandenen Glättung gelöst, Bodenkorrektur bleibt aktiv, danach werden neue Kontakte gesetzt. Die Simulation bleibt identisch.

Zwölf Drehproben bei 30/60/120 Hz mit ±90° und ±174°: zuvor erzwungene Fußkorrekturen bis über 130°, danach unter 18°, Positionskorrektur unter 0,12 m, keine gekreuzte Fußstellung, beide Kontakte nach der Drehung wieder gesetzt. Pausenpose und Matchdaten bleiben eingefroren. Browser mit Software-WebGL, keine Aussage zu echten Pixel-Frameraten.

Drei eigene Zonenbezeichnungen ersetzen die alten Grenzbeschriftungen: Verteidigung, Mittelfeld, Angriff. Mobil-Hochformat, schmale und breite Queransicht, Vorbereitung, Karriereplan und Taktikpause auf Deutsch/Englisch geprüft. Lange Namen können in schmalen Zonen auf zwei Zeilen stehen.

Meshy-Verbindung und öffentlicher Katalog erfolgreich geprüft: Idle Turn Left (576), Idle Turn Right (586); bestehende Clips weiterverwendet. CLI meldete nach erfolgreichem JSON-Ergebnis einen Windows-Shutdown-Fehler; keine neue Generierung oder Credits.

Als [Prototyp 110 live veröffentlicht](release-110.md). Vollständige automatische Release-Abnahme bestanden; Quellseite, Build und Live-Datei identisch.

## Ergänzungen v140–149

Gemeinsame Teamtaktik- und Vorlagenbedienung in allen drei Taktikansichten, Speicherung und Wiederladen des vollständigen eigenen Plans, keine Änderung am Gegnerplan; Speicherausfall stellt den Zustand wieder her. Pausenladen respektiert höchstens zwei Wechsel und die vorhandenen Ein-/Auswechselregeln sowie Rückgängig. Drei Bildschirmbreiten und DE/EN: 18 sichtbare gemeinsame Ansichten; 16 Vorbereitungsfälle inklusive Heim/Auswärts, dauerhaftem Wiederladen und Speicherausfall. Spielernamen zeigen den ersten Buchstaben des Vornamens mit vollständiger zugänglicher Profilbeschriftung.

TV-Spieltag und Rückspiel-Gesamtergebnis sind Teil der vorhandenen Broadcast- und Rückschaukette. Die TV-Anzeige bleibt auch im Hochformat sichtbar. Der Ergebnisdialog benennt den Liga-Spieltag. Reguläre Elfmeter: vier Sekunden Schiedsrichteranzeige, danach zwei Sekunden ruhige Toransicht, danach unveränderte Schuss-/Ergebnisfolge; beiderseitig in 2D/3D einschließlich Pause geprüft. Der zusätzliche 44-Pixel-Schussbutton neben dem Schützen verwendet genau denselben Schussablauf wie die vorhandene Aktion und verschwindet nach dem Ende.

Bei Weltmatches ersetzt Entfernung/Winkel/Schussweg die starre automatische Fernschussgrenze; offene Tore, freie Läufe, Kopfball und Standards behalten ihre eigenen Entscheidungen. Vier vollständige feste Seeds vor/nach der Änderung: offene Distanzschüsse über 20 Meter sinken von zwölf auf einen; dies ist eine gezielte Probe, keine repräsentative Saisonstatistik. Vergangene Partien werden nicht verändert.

Native Rig-Diagnose zeigt die Fußverankerung als Ursache zusätzlicher Dribbelschritte. Laufende Ballführer behalten nun die native Schrittfolge mit Bodenkorrektur und begrenzten Ballkontakten, ohne Weltanker an die Füße zu ziehen. Bei 60 Hz sinkt die maximale Fußbeschleunigung auf den geprüften geraden/kurvigen Wegen um rund 28–38 Prozent. Stand, Empfang, Schuss, Grätschen und Torwartaktionen behalten ihre bestehenden Kontakte. Einwurf/Ecke/Abstoß geben wartenden Nicht-Schützen den Ball als Blickziel; beide Spielfeldrichtungen geprüft, ohne Matchdaten zu verändern.

Aktive eigene Pokalvereine sind grün markiert; ausgeschiedene Vereine, beendete Wettbewerbe und frühere Saisons erhalten die Markierung nicht. Die letzten fünf Spiele fehlen nur als separate Übersichtsliste. Sponsoreninformationen stehen kompakt unter dem nächsten Gegner; Titel verwenden dieselbe vorhandene Titelverteidigerlogik wie die Tabelle. „Verlängern“ heißt englisch „Renew contract“; Statistikspalten benennen ihre Kategorie. AGENTS.md erlaubt den vollen verfügbaren Meshy-Funktionsumfang; keine neue Assetgenerierung für diese Korrekturen.
