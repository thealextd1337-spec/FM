# Das 3D-System von Doppel 6

Systemstand: Kleinfelditeration v162 mit Unity-Darstellung, Spielversion 120. Maßgeblich ist der Quellcode unter dist/. Dieses Dokument beschreibt das reguläre Vereinswelt-Spiel; der Kameraprototyp und freekickdemo sind getrennte Projekte.

## Unity-Darstellung

Der veröffentlichte HTTP-Build verwendet Unity für die 3D-Spielansicht. world-unity-v151.js übergibt ausschließlich echte Matchbilder an die WebGL-Laufzeit. Beschriftungen folgen den von Unity gemeldeten Kopfpositionen; Ballrotation entsteht aus dem tatsächlichen Ballweg. Fünf Kameraansichten und ein Nähe-Regler verändern nur die Darstellung. Die Simulation bleibt maßgeblich für Tore, Kontakte, Statistik und Speicherung. Bei einem Darstellungsfehler bleibt der 2D-Rückweg erhalten. Die nachfolgenden Angaben zu THREE, Schatten und IK beschreiben den vorhandenen Browserrenderer, der über engine=browser weiter erreichbar ist.

Seit Spielversion 112 zeigt Unity einen Flutlichtabend mit echten Schatten, Rasenshader und Stadion mit ausblendbaren Tribünen. Lauf, Sprint, Bremsen und Drehungen folgen gemessenen Schrittlängen der vorhandenen Clips; Füße stehen gemessen auf dem Rasen. Hand-, Kopf- und Fußkorrekturen gelten nur für bestätigte native Ball- und Keeperkontakte. Trikots zeigen Vereinsfarben, Muster, Hosenfarbe und die echte Rückennummer; Torhüter tragen Handschuhe. Rückschauen erhalten eine eigene ruhigere Bildfarbe, Namensschilder weichen einander aus. Touchgeräte starten mit einer reduzierten Qualitätsstufe ohne Kantenglättung und Bloom mit kleineren Schatten; ?quality=standard oder reduced erzwingt eine Stufe. Eine vorhandene native match.geometry (Version 1) wird unverändert übernommen, ohne sie bleibt 68 × 44 Meter.

Neue physische Partien erhalten den offensiven Ablauf v159: erreichbare Ballannahmen und Anschlussläufe, freie Stürmerläufe zum Tor, ball- und empfängerbezogene Abwehrreaktionen sowie Schussziele getrennt von der Keeperreichweite. Gespeicherte Ergebnisse werden nicht neu berechnet. Die gemessene Torquote ist verbessert; vollständige mobile Hardwareabnahme und abschließende Saisonbalance stehen weiterhin aus.

## Gemeinsame Simulation und Darstellung

Die Teams tragen Fußringe in Vereinsfarben mit heller/dunkler Kante und durchgehendem beziehungsweise segmentiertem Muster. Namensschilder verwenden dieselben Team-Muster, bleiben am Bildrand und verbinden verschobene Namen dezent mit dem Kopf. Im Menü „Darstellung und Ton“ lässt sich die Ballhilfe ausschalten: Sie setzt nur um sehr kleine Bälle einen Kontrastring an der tatsächlich dargestellten Position. Diese Einstellung wird unabhängig von Karrieren gespeichert. Vollbild hält laufende sowie pausierte Begegnungen über die unterstützte Wake-Lock-API wach; Hintergrund und Matchende geben die Sperre frei. Physische Android-Abnahme bleibt gesondert.

Neue Karrieren bieten beide Feldgrößen und fünf oder sechs Feldspieler plus Torwart. Größer/fünf ist voreingestellt. Die gespeicherte Wahl gilt dauerhaft für die ganze Vereinswelt. Größer bedeutet 20 Prozent mehr Länge und Breite in der bisherigen nativen Rechenskala; Tore, Strafräume, Körper und Ball behalten ihre physischen Größen. Neue Spieler verwenden das vorhandene Fähigkeiten-, Rollen-, Entwicklungs-, Alters- und Belastungsmodell mit gespeicherten Kandidatenparametern. Bestehende Welten und Ergebnisse werden nicht umgerechnet; ohne Weltwahl bleibt bisherig/fünf.

2D und 3D zeigen dieselbe physische Vereinswelt-Partie. Tore, Kontakte, Besitz, Abseits, Standards, Fähigkeiten, Statistik und Karrierebuchungen werden in der Simulation entschieden. Der Renderer liest diesen Zustand und darf ihn weder verändern noch zusätzliche Simulationszufallszahlen verbrauchen. Parallel gespielte KI-Partien verwenden den kompakten Matchlauf und sind keine aufgezeichneten 3D-Partien.

Der Lauf in world-physical-v65.js ruft die Simulation ungefähr alle 40 Millisekunden auf. Er begrenzt das tatsächlich vergangene Zeitstück auf 0,05 Sekunden. MATCH_SPEED ist der interne Faktor für die Simulationszeit; die sichtbare Matchuhr rechnet diese in die dargestellten Fußballminuten um. Pausen dürfen keine nachträglichen Zeitsprünge erzeugen.

Auf Geräten mit primärer Touchbedienung rendert die 3D-Ansicht mit einfacher Bildschirmauflösung, ohne zusätzliche Kantenglättung oder dynamische Schatten. Die vorhandenen Bodenschatten und vollständigen Spielermodelle bleiben sichtbar. Der Matchtakt liefert neue Zustände an die Bildschirm-Bildschleife, statt zusätzliche 3D-Bilder zu zeichnen. Live-Ansicht und Rückschau zeichnen mobil höchstens 60 Bilder pro Sekunde; die tatsächliche Leistung hängt vom Gerät ab. Simulation und Rückschauzeit bleiben davon unabhängig.

Die physischen Positionen sind normalisierte Feldkoordinaten. Weltkontakte werden für die Vereinswelt in Meter umgerechnet: 44 Meter Breite und 68 Meter Länge innerhalb der definierten Feldgrenzen. world-pitch3d-v98.js projiziert sie auf X/Z, dreht die Ansicht nach dem Halbzeitwechsel und ergänzt die Ballhöhe. Die eigentlichen Simulationskoordinaten werden dafür nicht gedreht.

## Datenfluss und Zuständigkeiten

- world-physical-v65.js: physisches Match erstellen, Zeitschritte, Pause, Wechsel und Ergebnisbuchung mit der Karriere verbinden.
- game.js und pitch-v55.js: Laufwege, Ballführung, Pässe, Schüsse, direkte Aktionen, Luftballplanung und Abseitskontakte.
- pitch-v56.js und set-pieces-v50.js: erreichbare Zweikämpfe, Grätschen, Foulentscheidungen und Standards.
- world-backpedal-v108.js: taktische Abwehrziele, Deckung, Rückwärts-/Vorwärtsverfolgung, freie Ballverfolgung und Torwartzugriff.
- world-pitch-actions-v99.js und player-ball-events-v111.js: bestätigte Ereignisse in flüchtige Aktionsphasen und Kontakte übersetzen.
- world-ball-motion-v110.js und world-corner-ball-v109.js: freie vertikale/horizontale Ballbewegung, Aufspringen, Rollreibung und sichtbarer Auslauf vor Standards.
- pitch-motion-v102.js: gemeinsame pausierbare Animationsuhr, Kontaktmetadaten, Bildpuffer, Interpolation und prozedurale Posen.
- world-pitch3d-v98.js und pitch-scene-v98.js: Spieler-/Ballbilder, Kamera, Stadion, Trikots, Namensfelder, Schatten, Ton und Ressourcenverwaltung.
- player-user-bootstrap-v112.js und player-user-meshy-v107.js: Meshy-Datei laden, Modellfabrik installieren, individuelle Skelette und Materialien anlegen.
- player-user-motion-v108.js: Laufphasen, Übergänge, Fußanker und begrenzter Hüftausgleich.
- player-user-ball-actions-v111.js: Schuss-/Pass-/Einwurf-/Foul-/Torwartclips mit tatsächlichen Fuß- und Handkontakten verbinden.
- world-goal-replay-v103.js: Torwiederholung, vollständige Sitzungsrückschau, Ereignismarker, Bildvergrößerung, Vollbild und TV-Anzeige.
- match-ball-events-v117.js: Schuss, Parade, Abpraller und Tor mit eindeutigen Ereignisbilanzen erfassen.

Die Aktions- und Darstellungsmetadaten liegen überwiegend in WeakMaps und gehören zum jeweiligen Match beziehungsweise Ballflug. Sie sind keine neue Karriere-Speichermigration.

## Bildpuffer und Animationsuhr

Die Szene läuft über requestAnimationFrame unabhängig vom Simulationstakt. v98PitchFrame erzeugt ein Bild mit Spielern, Besitzer, Ballhöhe, Aktionsphasen, Bewegungsmodus, Abseitsmarkierung und historischer TV-Information. Der Puffer hält aufeinanderfolgende Bilder; v102Interpolate verbindet sie für die Darstellung. Unsichtbare Standardrücksetzungen werden nicht als sichtbare Flugbahn ausgegeben.

Die Meshy-Animationen sind keine zweite Spiellogik und steuern nicht die physischen Spielerwege. Laufphasen folgen der zurückgelegten Strecke beziehungsweise bei Ballführung dem geglätteten Bewegungstempo. Clipgewichte, Drehung, Fußbindung und Kontaktkorrekturen bilden die Bewegung ab. Bei Ballführung werden defensive Rückwärtsclips und unpassende Stopp-/Stand-Drehungen unterdrückt.

Pause, geöffnete Live-Spielerinformation beziehungsweise 3D-Hilfe, verborgenes Dokument und unzulässige Darstellung stoppen die Fortschreibung der betreffenden Animation. Bei Ansichtwechsel, Matchende oder Szenenabbau werden Schleifen, Spielerressourcen und Audio freigegeben beziehungsweise angehalten.

## Meshy-Modell und Assets

Das reguläre Spiel lädt football-v130.glb, calibration-v130.json und cloth-mask.png aus dist/players/. Das Rig enthält 34 Clips. Feldspieler und beide Torhüter verwenden dieselbe Modellgrundlage, jeweils mit eigenem Skelett. Trikotfarben folgen der gespeicherten Matchkombination; die Stoffmaske trennt Kleidung und Haut. Handschuhe sind skinnbare Geometrie mit den tatsächlichen Handgewichten.

Der Loader stellt Status loading, ready oder failed bereit. Fehlt ein Asset, bleibt die vorhandene prozedurale Modellfabrik verwendbar. Bei erfolgreichem Laden wird eine bereits offene Szene mit demselben Matchzustand neu aufgebaut. Lokale Three.js-Module und Grafikzufall bleiben vom Matchzufall getrennt. Der Offline-Build bettet Modell, Kalibrierung, Maske, Module und Audiodateien ein; es gibt keine Meshy-API-Anfrage während einer Partie.

Die Kalibrierung liefert Clipdauer, Phasen, Schrittmaße und Kontaktproben. Fußanker begrenzen Gleiten; inverse Gelenkkorrekturen führen Fuß- und Handketten zu bestätigten Kontakten. Die Korrektur darf nicht beliebige fehlende Reichweite oder entfernte Ballgewinne erfinden.

## Ball, Schüsse und Kontakte

Besitz, Flug und freier Ball sind unterschiedliche Zustände. Ein Empfänger darf den Ball erst bei erreichbarem tatsächlichem Kontakt kontrollieren. Direkte Pässe und Schüsse planen die Bewegung vor der Ankunft; der reale Kontakt gibt die Aktion frei. Passspiel, Technik, Abschluss, Luftspiel, Stellungsspiel und Druck wirken je nach Aktion. Die Oberfläche zeigt Fähigkeiten weiterhin ausschließlich als Farbstufen.

Freie hohe Bälle besitzen vertikale Geschwindigkeit. Beim Bodenaufprall geht Energie verloren, danach wirkt Rollreibung; ein abgewehrter Ball startet am bestätigten Kontakt statt erneut beim Schützen. Der sichtbare Ballradius beträgt 0,1764 Szenenmeter. Ballflug, Torquerung und Auslinie werden in der gemeinsamen Simulation bewertet.

Bei einer Grätsche prüft die Engine Körper- und Ballnähe während der Bewegung. Der Welt-Nachlauf liegt 18 beziehungsweise 25 Zentimeter hinter dem Ball. Ein Körperkontakt löst unmittelbar die Foulentscheidung aus; ein tatsächlicher Ballkontakt entscheidet über Gewinn oder freien Ball. Eine verfehlte Grätsche endet erst beim Ausklang. Die anschließende Standardvorbereitung ist ein eigener Ablauf.

## Pässe in den freien Raum

world-space-passes-v150.js bewertet freie Ziele, Passwege und Ankunftszeiten getrennt vom bisherigen empfängerbezogenen Pass. Passspiel bestimmt Streuung und Dosierung; Technik ergänzt die Ausführung unter Druck. Stellungsspiel beeinflusst die Laufreaktion, Geschwindigkeit und Kondition das Erreichen. Teamtaktik und Tiefen-/Außenläufe gewichten die Wahl. Beide Teams verfolgen erreichbare Punkte der verbleibenden Bahn. Der gemeinsame Bewegungsschritt prüft die tatsächlichen Ball- und Spielerwege; auch ein anderer Mitspieler oder Torwart kann zuerst Kontakt herstellen. Ohne Kontakt rollt der Ball frei weiter. Abseits wird beim Abspiel gespeichert und erst bei Beteiligung gepfiffen. Nur neue noch freie Raumpässe speichern einen einfachen Absichtsdatensatz für das Fortsetzen nach dem Laden; historische Ereignisse werden nicht rekonstruiert. [Prüfungen und Grenzen](raumpaesse-v150.md).

## Torwartkette

Die Unity-Bilder enthalten vorhandene Fang-/Abwehrergebnisse, Nachfasskennungen und die native Abspielphase. Ein abgewehrter Schuss zählt als Parade, aber nicht als gehaltener Ball. Beim bestätigten Nachfassen folgt die Darstellung dessen eigenem Kontaktpunkt. Die Simulation entscheidet weiterhin Besitz, Flug und Abspiel; es gibt keinen neuen Wurf-/Rollauslöser oder zusätzliche Torwartuhr. Geräteprüfungen unterscheiden Unity-Schleifenrate und Browser-Bildtakt; eine echte Android-Freigabe erfordert weiterhin angeschlossene Hardware.

Bereitschaft und Sidesteps richten den Körper zum Ball aus. Stationärer Torwartstand verwendet auch bei entfernten Bällen tiefe offene Hände und gebeugte Knie; allgemeine Feldspieler-Drehclips überschreiben diese Ausrichtung nicht.

Eine Parade startet an der aktuellen Torwartposition. Anlauf, Absprung, begrenzter Seitenweg, Handkontakt, Fang oder Abpraller, Bodenphase und Aufstehen folgen dem bestätigten Aktionsplan. Fähigkeit, Flugzeit, Höhe und Reichweite begrenzen die Abwehr. Geometrische Torabdeckung bedeutet nicht, dass jeder Schuss gehalten wird.

Beim Fang liegt der sichtbare Ball zwischen den tatsächlichen Handschuhen. Beim einhändigen Abpraller löst sich die Hand früh vom alten Kontaktziel, der Ball bleibt frei. Die Verteidigung arbeitet weiter, bis Kontrolle oder Unterbrechung bestätigt ist. Abstoß vom Boden und Ausspiel aus der Hand sind getrennt.

## Kamera, Bedienung und Rückschau

Querformat erlaubt 3D-TV und bewussten Wechsel zu 2D. Hochformat bleibt 2D. WebGL-Ausfall oder Kontextverlust aktiviert den 2D-Fallback. Die nahe TV-Kamera fährt gedämpft mit der Ballseite, die weite Kamera zeigt die Übersicht. Ansicht und Kamera beeinflussen keine Matchentscheidung.

Die Lupe vergrößert die Bildfläche innerhalb der Seite bis maximal 1.280 Pixel. Der separate Vollbildknopf verwendet Browser-Vollbild oder einen Viewport-Fallback. Auf Mausgeräten erscheinen die kleinen Bedienelemente bei Mouse-over und faden beim Verlassen aus. Touch zeigt sie kurz nach Antippen; Tastaturfokus bleibt sichtbar. TV-Uhr, Spielstand und Wettbewerbstyp bleiben eingeblendet.

Die Rückschau hält die tatsächlich gerenderten Rig- und Ballposen mit ungefähr sechs Aufnahmen pro Sekunde für die ganze aktuelle 3D-Sitzung. Sie interpoliert zwischen Aufnahmen und simuliert das Spiel nicht neu. Verschieben und Abspielen pausieren die Partie. Tore, Ecken, Freistöße, Abseits und Elfmeter erhalten Marker mit drei Sekunden Vorlauf. Das Ende bleibt pausiert; Live führt zum aktuellen Stand zurück.

Die Aufnahme ist flüchtig. Fehlende 2D-/Hochformatabschnitte, frühere Sitzungen und bereits verworfene Szenen werden nicht rekonstruiert. Neuladen oder Verlassen verliert die Aufnahme; sie ist kein exportiertes Video. Bereits aufgezeichnete Posen werden durch spätere Animationskorrekturen nicht verändert.

## Prüfung und Wartung

Neue Regeln werden zuerst in reproduzierbaren Szenen mit beiden Teamrichtungen geprüft. Native Animationstests verwenden unter anderem 30, 60 und 120 Bilder pro Sekunde; Messung mit ausgelassenem GPU-Zeichnen ist kein Hardware-Leistungsnachweis. Reale Kontakte, Bodenfreiheit, Pausenstabilität, Darstellung ohne Matchmutation sowie Ressourcenabbau sind eigenständige Kriterien.

Die v133-Abnahme enthält 24 neue Torwart-Ausrichtungssequenzen, angrenzende Meshy-/Foul-/Grätschenprüfungen und zwei vollständige Partien mit 15.972 Renderbildern ohne neue sichtbare Warps. Der 2D-/3D-/Offlinevergleich bestätigt identische Ereignisse, Statistiken und Ergebnisse. Die früheren v131/v132-Prüfberichte decken Torwartketten, direkte Aktionen, Luftbälle, Rückschau und mobiles Vollbild ab. Szenenprüfungen belegen weder universelle Fehlerfreiheit noch Leistung auf echter Mobilhardware.

Neue Module müssen in dist/index.html, work/build.cjs und work/server.cjs eingebunden werden. Für Assets müssen Quellserver und Einzeldatei-Build dieselbe Grundlage liefern. Vor Veröffentlichung werden Footer-Version, Quellseite, Build und Live-Datei verglichen; freekickdemo bleibt ausgeschlossen. Vorhandene Spielstände und historische Werte werden nicht rückwirkend neu berechnet.

Ein im Vollbild angesehenes Match verlässt zur Halbzeit das Vollbild und öffnet die Taktikansicht. Der Start der zweiten Hälfte stellt das vorherige Vollbild wieder her; Browser ohne native Unterstützung verwenden den Viewport-Fallback.

Der Knopf unter dem Live-Spielfeld pausiert die Partie und setzt sie an derselben Stelle fort. Nach bewusster Auswahl einer früheren Szene spielt er die Rückschau. An deren Endposition kehrt er zum Live-Match zurück. Bei Standdrehungen lösen Feldspieler die alte Fußbindung sanft und setzen danach neu auf.

Spielstand 110: Standards richten wartende Spieler zum Ball aus. Laufende Ballführer behalten die native Schrittfolge mit Bodenkorrektur, ohne horizontale Weltfußanker. Die gemeinsame Simulation gewichtet Distanzschüsse nach Entfernung, Winkel und freiem Schussweg. Reguläre Elfmeter zeigen nach der Entscheidung eine zusätzliche zweisekündige Toransicht.
