# Bewegung und Animationsübergänge: Analyse und lokaler Ausbau

Stand: 2. Oktober 2026. Die Analyse und der anschließende Ausbau betreffen die bestehende prozedurale 3D-Spielansicht der Vereinswelt. Maßgeblich sind `dist/pitch-motion-v102.js` (`v102RunPose`, `v102ActionPose` und die `v106`-Hilfen) sowie ihre Anwendung in `dist/world-pitch3d-v98.js`. Die `v106`-Funktionsnamen kennzeichnen einen lokalen Arbeitsstand; dieser Ausbau ist nicht veröffentlicht. Der veröffentlichte Stand bleibt Prototyp 105. Die eigenständigen Blender-Figuren und Unity-Assetproben sind separat dokumentiert.

## Befund vor diesem Ausbau

Die bisherige Grafik besaß bereits einen eigenen Zeichentakt, streckenabhängige Schritte, geglättete Geschwindigkeit und gemeinsame Interpolation von Spieler, Ball und Kontakt. Die vor dieser Änderung gesicherten Dateien liegen unter `outputs/motion106-baseline/`; sie enthalten bereits die zuvor lokal vorgenommenen Änderungen an Proportionen und Beinberechnung. Sie sind deshalb kein unveränderter Vergleich mit der veröffentlichten Version 105.

| Ursache im bisherigen Arbeitsstand | Sichtbare Folge | Lokale Änderung |
| --- | --- | --- |
| Eine gemeinsame Gangform für alle Geschwindigkeiten; Geschwindigkeit änderte vor allem die Amplitude | Langsames Gehen wirkte wie verkleinertes Laufen | Unterschiedliche Gewichte und Schrittweiten für Idle, Walk und Run |
| Kein eigener Stillstand und keine Schwellen mit Hysterese | Wenig Leben im Stand; empfindliche Wechsel bei geringer Bewegung | Zustandslabel mit Hysterese, kontinuierliche Gewichtung, Atembewegung und begrenzter Blick zum Ball |
| Geschwindigkeitsglättung ohne Beschleunigungsgewicht | Anlaufen und Bremsen hatten wenig sichtbare Gewichtsverlagerung | Exponentielle Glättung mit getrennten Anlauf-/Bremsraten und beschleunigungsabhängiger Körperneigung |
| Richtungsänderung vor allem als Drehung der ganzen Figur | Wenig Vorbereitung durch Rumpf und Blick | Gedämpfte Richtung, Rumpfdrehung, Halsdrehung und kleine Fußkorrektur |
| Sonderaktionen überschrieben Körper und Gliedmaßen unmittelbar; Gelenke wurden zurückgesetzt | Abbruch oder Ende konnte abrupt in die Laufpose wechseln | Kurzer Ausklang aus der letzten vollständigen Pose; Folgeaktionen können ihn sofort ablösen |
| Räumliche Reichweitenkorrektur von Kopfball-/Volleyposen ohne vollständige Gewichtung | Körperkorrektur konnte im Übergang stärker wirken als die übrige Pose | Kontaktkorrektur erhält dasselbe Aktionsgewicht |

Die segmentierte Figur bleibt eine Grenze: Körperteile bewegen sich weitgehend starr, und die Grafik besitzt keinen separat deformierenden Becken-/Brustkorbaufbau. Mehr Rumpfdrehung ersetzt diese Geometrie nicht. Diese Einschränkung ist kein Gestaltungsgesetz für künftige Figuren.

## Tatsächliche Bewegungsregeln im lokalen Code

Die Laufpose liest die dargestellte Positionsdifferenz und die verstrichene Grafikzeit. Sie verschiebt die physische Spielerposition nicht. Schrittphase und Bewegung bleiben an Strecke statt an die Zahl der Grafikbilder gekoppelt: `runPhase` wächst um `distance * 6.2`. Zusätzliche Bilder im Stillstand erzeugen keine neuen Schritte.

Die visuelle Geschwindigkeit nähert sich ihrem Ziel mit `1 - exp(-dt * rate)`: Rate 14 beim Anlaufen und 20 beim Bremsen. Die daraus ermittelte Beschleunigung wird mit Rate 12 geglättet und erzeugt eine kleine begrenzte Körperneigung. Diese Werte sind Raten pro Sekunde, keine Wartezeiten der Simulation.

Das Zustandslabel beginnt bei `idle`, wechselt oberhalb 0,22 Szenenmetern pro Sekunde zu `walk` und unterhalb 0,10 zurück zu `idle`. `walk` wechselt oberhalb 2,05 zu `run`; `run` kehrt unterhalb 1,65 zu `walk` zurück. Die sichtbaren Ganggewichte werden unabhängig davon kontinuierlich aus der geglätteten Geschwindigkeit berechnet. Die Hysterese verhindert flackernde Zustandslabels; die Gewichtung vermeidet harte Posensprünge. Gehen und Laufen unterscheiden sich in Fußreichweite, Schwunghöhe, Armschwung und Ellenbogenbeugung.

Richtungswechsel verwenden den kürzesten Winkelweg. Der Rumpf dreht gedämpft mit; Hals und Füße liefern kleinere Begleitbewegungen. Im Stillstand folgt ein begrenzter Blick dem dargestellten Ball. Eine geringe Atembewegung hält die Ruhepose lebendig. Bei reduzierter Bewegung entfallen Atembewegung und Beschleunigungsimpuls; Rumpf- und Halsdrehung werden abgeschwächt. Lauf- und Kontaktbewegungen bleiben lesbar.

## Aktionen, Vorbereitung und Ausschwingen

Eine vollständige Laufpose bildet weiterhin die Grundlage jedes Bildes. Die bestätigte Aktion überlagert betroffene Gelenke und Kontaktkorrekturen. Kopfball-/Volleykorrekturen teilen das Aktionsgewicht, sodass räumlicher Versatz und Gelenke gemeinsam zurückkehren. Die vorhandenen Ballflüge, Kontaktzeitpunkte und Aktionsuntertypen bleiben maßgeblich.

Nach dem Ende einer Geste wird die letzte vollständige Pose höchstens 0,14 Sekunden weich in die aktuelle Laufpose zurückgeführt. Eine neue Aktion beendet diesen Ausklang sofort. Pause hält auch den Ausklang an. Einwurf und Torwartabspiel übernehmen beim Eintritt direkt die bestätigte Pose, ebenso eine erfolgreiche Parade mit gehaltenem Ball. Das verhindert, dass ein noch festgehaltener oder gerade freigegebener Ball durch eine abgeschwächte Kontaktpose von den Händen getrennt wird.

Die neue Gewichtung ersetzt keine neue Ausholphase der Engine. Für bereits bestätigte sofortige Aktionen steht weiterhin nur der gemeinsame Puffer von einem Simulationsschritt für eine kurze sichtbare Vorbereitung zur Verfügung. Eine längere gerichtete Vorbereitung ohne bestätigte Aktion würde Vorhersage erfordern. Daher kommen Antizipation und Rückmeldung hier aus Gewichtsverlagerung, Blick, Rumpfbewegung und dem vorhandenen Ausschwingen. Spielgeschwindigkeit, Befehlsverarbeitung und Aktionszeiten werden nicht erweitert; es entsteht kein zusätzlicher Eingabepuffer. Neue gespeicherte Felder, Zufallsziehungen und rückwirkende Berechnungen sind nicht Teil dieses Ausbaus.

## Prüfbelege und Reichweite

| Prüfung | Ergebnis und Aussage |
| --- | --- |
| `node work/test-locomotion-v106.cjs` | Bei 30/60/120 Hz: Idle/Walk/Run, Bremsen und Drehen; unveränderte Wurzelposition, eingefrorener Pausenzustand, sofort unterbrechbarer Ausklang, reduzierte Bewegung und endliche Transformationen. Einwurf behält beim Wechsel von Halten zu Freigabe mit Fortschritt 0 dieselbe Überkopfpose. |
| `node work/test-stylized-player-motion.cjs` | 750 geprüfte Standkontakte bei 30/60/120 Hz, maximale Sohlenabweichung rund 0,00344 Szenenmeter; gleiche streckenabhängige Phase bei allen Bildraten. Pass, hoher Pass, Flanke, Schuss, Freistoß und Volley prüfen Standfuß, Ballnähe und endliche Posen. |
| `work/check-locomotion-v106.cjs` | Im tatsächlichen lokalen Match treten nach 300 Simulationsschritten alle drei Zustandslabels auf. Kontrollierte Aufnahmen zeigen Idle, Walk, Run, Bremsen, Drehen, Schuss und Ausklang. Die kontrollierten Poseprüfungen verändern den Matchzustand nicht; keine Browserfehler. Daten: `outputs/motion106/browser.json`. |
| Bestehende Browserregressionen | 28 Aktionsfälle, 20 Luftduellfälle, Standards, Torhüteraktionen, Torwiederholung und Offline-Build bestanden. Vollständige 2D/3D-Matchparität über 2.543 Schritte bleibt erhalten. Die Bodenprüfung liefert rund 0,00308 Szenenmeter maximale Abweichung bei 289 Kontakten. |
| Einwurf-Freigabe im Browser | Halten und Freigabe bei Fortschritt 0 verwenden denselben Armwinkel von rund −2,86159 rad. Belege: `outputs/motion106/throw.json`, `throw-held.png`, `throw-release.png`. |
| Bewegungsprobe | `work/generate-player-motion-preview.cjs` verwendet Produktionsgeometrie und Produktionsposen für `outputs/player-motion-preview.html` mit neun Modi einschließlich Gehen; `work/check-player-motion-preview.cjs` prüft Bedienung, Offline-Nutzung und reduzierte Bewegung. Sie ergänzt die Matchprüfung. |

Das frische, auf den Einwurf-Freigabefehler begrenzte Review bestätigt die Korrektur als auslieferbar. Die tatsächlichen Matchaufnahmen zeigen bei Halten und Freigabe denselben Überkopf-Armwinkel. Dieses Review ist keine gestalterische Freigabe der gesamten Spielansicht.

Die lokalen Standbilder `outputs/motion106/states.png` und `outputs/motion106/mobile.png` zeigen Pose und Bildaufbau im echten Renderer. Sie belegen keine durchgehend wahrgenommene Flüssigkeit. Ebenso sind 30/60/120 Hz in den Tests vorgegebene Grafikzeitschritte und keine gemessenen Geräte-FPS.

Echte Mobilhardware, subjektive Abnahme fortlaufender Bewegungen und die gestalterische Qualität der weiterhin segmentierten Figur bleiben offen. Der gemeinsame Puffer und die sofortige Unterbrechbarkeit sind im Code und den Tests abgesichert; eine gemessene Eingabe-zu-Bild-Latenz liegt nicht vor. Veröffentlichung und eine dazugehörige neue Fußzeilenversion stehen aus.
