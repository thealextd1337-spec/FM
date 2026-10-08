# Fußballerlebnis v159

Lokaler Stand vom 8. Oktober 2026. Quellcode in `dist/`, Offline-Fassung in `outputs/index.html`, tatsächlicher Unity-WebGL-Build in `outputs/platform/unity-web/`. Keine Veröffentlichung; der Seitenfuß bleibt Prototyp 110. Diese begrenzte Iteration erfüllt nicht den gesamten geplanten M01–M03-Ausbau.

## Abschlusswahl und Torhäufigkeit

Der gemeldete Querpassfehler war reproduzierbar: Bei einem nicht erzielten Tor konnte der bisherige Schusspfad sein Ziel nachträglich zum Keeper verschieben, selbst wenn dieser das freie Tor nicht mehr abdeckte. Neue Partien wählen einen freien Torsektor und lösen die tatsächliche Schussausführung vor Block und Keeperreichweite auf. Ein als Parade gewerteter Ball bleibt auf dieser gewählten Linie. Ein nicht erreichbarer Keeper erhält keine Parade; ein ungehinderter genauer Ball überquert die Torlinie. Ungenaue Ausführung kann weiterhin vorbeigehen.

Die erste Korrektur war zu großzügig: Der beste freie Zielsektor wurde stets perfekt ausgeführt. Der erste 20er-Kandidat erzielte 63 Tore bei 64 Schüssen aufs Tor und wurde nicht als Endstand angenommen. Die vorhandene Platzierungsziehung erzeugt jetzt Ausführungsstreuung nach Abschluss/Technik beziehungsweise Luftspiel, Nahdruck und Entfernung. Ein Ball außerhalb des tatsächlichen Torraums einschließlich Ballradius zählt als Fehlabschluss; er wird nicht auf den Pfosten zurückgezogen.

Die anschließende Messung zeigte schlechte Keeperwinkel: Ein Keeper stand bei einem Abschluss aus 18,9 Metern seitlich 5,1 Meter neben der Tormitte. Neue Keeper halten bei gedeckten Angreifern einen beobachteten Ball-Tor-Winkel, gewöhnlich 1,4–2,7 Meter vor der Linie und höchstens 1,8 Meter seitlich. Ein tatsächlicher freier Durchbruch innerhalb von 13 Metern behält den bisherigen Abfang-/Kontaktpfad. Bereits laufende Schussreaktionen und begonnene Abfangaktionen werden dadurch nicht ersetzt; Zieländerungen verwenden die vorhandene Körperbewegung.

Die [endgültige Torserie](../../outputs/platform/football-v159/flow/goal-study.json) besteht aus 20 identischen gepaarten Ausgangslagen, zehn Vereinen in fünf Ländern, unveränderten Rollen/P02-Parametern und der tatsächlichen Produktgröße 44 × 68 Meter mit fünf Feldspielern und Keeper. Alle 40 Partien sind vollständig beendet. Nur die neue v159-Kennzeichnung unterscheidet die beiden Pfade.

| Messwert | Vorheriger Pfad | Neuer Pfad |
| --- | ---: | ---: |
| Tore in 20 Partien | 8 | 33 |
| Tore je Partie | 0,40 | 1,65 |
| Torlose Partien | 14 | 1 |
| Schüsse | 122 | 115 |
| Schüsse aufs Tor | 59 | 40 |

Dies ist eine belegte Verbesserung für diese Stichprobe, keine abschließende Balancefreigabe. Im neuen Pfad wurden sieben tatsächlich erreichbare genaue Abschlüsse gehalten; 33 nicht erreichbare genaue Abschlüsse trafen. Die Trefferquote von 82,5 Prozent unter Schüssen aufs Tor bleibt hoch. Der Reach-Rechner verwendet eine vereinfachte gemessene Fluglinie und Reaktions-/Laufreichweite; eine vollständige laufende Kontaktauflösung, vertikale Reichweite und eine größere Saison-/Stärkenstichprobe bleiben weitere Arbeit. Es gibt keinen pauschalen Torzuschlag oder garantierte Mindestzahl. Die [erste Kandidatin](../../outputs/platform/football-v159/flow/goal-study-first-candidate.json) und [Positionsdiagnose](../../outputs/platform/football-v159/flow/goal-diagnosis-before-keeper.json) bleiben erhalten.

## Annahme, Laufwege und Aufmerksamkeit

Nur neu erzeugte physische Partien mit `attackFlow.flowVersion=159` verwenden die neuen Absichten. Ein tatsächlicher Ballkontakt speichert Kontrollpunkt/-richtung und eine kurze Vorbereitung von 0,14–0,48 Sekunden. Doppelpassfenster beginnen erst nach legalem Empfang. Tiefen-/Diagonalangebote bleiben kurz bestehen; der Passgeber läuft nach, sofern Rolle und Absicherung dies erlauben.

Ein ungedeckter Stürmer aus 12–30 Metern trägt durch eine aktuell freie Vorwärtsgasse näher zum Tor. Ein Gegner im Weg, eine deutlich bessere freie Anspielstation oder die Nähe zum Tor beenden dieses zusätzliche Tragen. Verteidiger lesen den aktuellen Ballbesitz und die freigegebene Flugrichtung. Die nächsten beiden greifen den Ballweg an; andere decken erkennbare Empfänger zur Torseite. Das Reaktionsintervall hängt von wirksamer Positionierung ab und bleibt begrenzt. Diese Entscheidungen garantieren weder Ballbesitz noch Passerfolg und kennen keine künftigen gegnerischen Aktionen.

Gewicht, Antritt, Bremsen und Körperdrehung stammen weiterhin aus dem bestehenden gemeinsamen Bewegungsmodell. P02 bleibt das einzige Belastungsmodell. Alte aktive Partien werden nicht gekennzeichnet, historische Ergebnisse und Formwerte nicht nachgerechnet.

## Unity und Kamera

Unity dreht den Ball aus tatsächlich empfangenem horizontalem Weg und Ballradius; Stillstand erzeugt keine Rotation, Sitzungswechsel und Rückschau-Sprünge setzen die Darstellungsbasis zurück. Laufclips teilen eine weiterlaufende Schrittphase, auch bei Dreh-/Bremsüberlagerungen. Begrenzte Oberkörperneigung und Übergänge verändern keine native Position. Eine bereits beobachtete Keeperaktion erscheint mit dem ankommenden Bild und ihrer Kontaktpose, ohne zukünftige Aktionen vorherzusagen. Die Namensschilder bleiben an den nach dem Rendern zurückgegebenen Köpfen verankert.

Die Standardkamera ist näher am Spiel. Das Darstellungsmenü bietet TV nah, TV weit, Seitenlinie, Diagonal und Hintertor sowie einen Nähe-Regler von 0–100 Prozent. Perspektive und Abstand bleiben getrennt von Karrieren im Browser gespeichert. Das Menü bleibt über dem Spielfeld und passt in den Viewport; Maus, Tastatur und eine Touch-Landschaftsansicht sind geprüft. Ein authentifizierter Tipp im Unity-iframe blendet ausschließlich die Bedienung ein. Verlassen, Ansichtswechsel und Escape schließen das Menü passend.

Der [Unity-Nachweis](../../outputs/platform/football-v159/unity/evidence.json) enthält 396 C#-Prüfungen, 28 exakte Quellabgleiche zwischen Repository und Editor, 14 unveränderte Masterassets und den zurückgesetzten Editorzustand. Build-ID: `95eb4c7224a55115dd2e2aa4dccb3f9e27f5096bdde0ee23073c5cfbb3076f3e`. Der tatsächliche WebGL-Build hat null Buildfehler und drei vorhandene Warnungen. Keine neuen Meshy-Aufträge oder Assetkosten.

## Spielbericht und Ergebnisfolge

Native Spielberichte, Spielerstatistik und die folgende Ergebnisübersicht verwenden Flutlicht in Hell/Dunkel. Liga- und Gruppenberichte lesen die aktuellen Tabellenplätze der zugehörigen Karriere-Tabelle; K.-o.-Runden zeigen keinen Rang. Ein historischer Bericht speichert deshalb keinen alten Rang. Die Übersicht zeigt die letzten fünf tatsächlich abgeschlossenen Spiele aller Wettbewerbe von alt nach neu, einschließlich tatsächlichem Elfmeterschießen-Sieger. Fehlende historische Daten bleiben nicht erfasst. [UI-Abnahme und Bilder](../../outputs/ui-redesign/U01-D/v159/README.md).

## Speicherung, Prüfung und Grenzen

Ein während der Annahme gespeicherter Matchzustand führte zunächst zu einem anderen späteren Ergebnis. Ursache war die beim JSON-Laden auf null zurückgesetzte native Kontaktuhr. Neue sichere Snapshots speichern `nativeContactClock`; Restore setzt dieselbe Basis, bevor die Partie weiterläuft. Die [Diagnose](../../outputs/platform/football-v159/flow/restore-first-divergence.json) und der echte Vorher-/Nachher-Lauf bleiben dokumentiert. Es werden keine alten Ereignisse rekonstruiert und keine Renderposen gespeichert.

Die [gesamte Lieferung](../../outputs/platform/football-v159/delivery.json) verbindet eingefrorene Eingaben, Berichte und Buildhashes. Die [native Abnahme](../../outputs/platform/football-v159/flow/README.md) umfasst je neun vollständige physische und zwei kompakte Partien in Quelle und Build; Scores, Statistiken, Matchberichte und P02 sind exakt gleich. Tatsächliche Querpass-/Annahme-/Direktabschlussfälle werden getrennt von zufälligen Vollpartien geprüft. Die echte JSON-Fortsetzung bei Ballannahme entspricht vollständig dem ununterbrochenen Lauf.

Weitere aktuelle Prüfungen: 43 Unity-Browserfälle einschließlich vollständiger nativer/Unity-Parität (2:0), tatsächlicher vergrößerter Halbzeit und zweiter Hälfte, Ersatzspieler, Rückschau, Netz, Fehler-Rückweg und lokalem HTML-Build; 20 Kamerabrowserfälle und 542 reine Kameraprüfungen; 43 Schussziel-/Ausführungsprüfungen; je 16 UI-Layoutfälle und acht Datengruppen in Quelle/Build. P02 besteht 3.203 kontrollierte Quellprüfungen sowie je 2.886 Snapshotprüfungen in Quelle/Build. 59 zusätzliche Autosaves beeinflussen die vollständige Partie nicht; auch diese Endzustände sind zwischen Quelle/Build exakt gleich. Die beiden Offline-HTML-Dateien und alle 26 eingebetteten Flutlicht-Assets stimmen überein.

Die größere Geometrie und sechs Feldspieler sind weiterhin ausschließlich kontrollierte Harnessfälle. Es gibt noch keine entsprechende Produkt-/Karrierenauswahl; im künstlichen Siebenerfall wird der noch auf sechs Gesamtspieler begrenzte automatische Formationswechsel ausgelassen. Das ist keine Freigabe des gesamten M01-Geometrieblocks. Kompakte KI-Partien bleiben ein eigener Adapter, nicht dieselbe physische Simulation.

Die drei späteren UI-Besichtigungen bleiben offen: tatsächlicher 200-Prozent-Zoom, echtes Smartphone/Screenreader und gemeinsame visuelle Besichtigung. Browser-Viewportprüfungen ersetzen diese nicht. Die bestehende Speichergrenze des localStorage-Ersatzpfads für große wave3-Karrieren gehört weiterhin zum offenen Speicherblock; IndexedDB und die vorhandenen Speicherfehler bleiben maßgeblich. Die vorangegangene v158-Quellbasis ist eingefroren; kein vollständiges bytegenaues Archiv aller alten v158-WebGL-Binärdateien wird behauptet.
