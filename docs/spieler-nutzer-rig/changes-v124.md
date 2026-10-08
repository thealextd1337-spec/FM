# Laufziele, Abseits, Grätschen, Torwartbewegung und Ballaufsprung v124

Lokal im regulären [Offline-Spiel](../../outputs/Doppel-6-Fussballmanager.html) integriert, 4. Oktober 2026. Quellen in `dist/`; keine Veröffentlichung, Seitenfuß **PROTOTYP 105**. Vorhandenes Meshy-Rig und 32 Clips, keine neuen Credits. Ältere Partien und Statistiken werden nicht nachberechnet. Diese Matchkorrekturen sind unabhängig vom gleichzeitig gepflegten Finanzblock v124.

## Freier Ball und begleitende Läufe

Die Baseline reproduziert den Zielwechsel in beiden Spielrichtungen: Mit direktem Ballbesitzer läuft ein guter Stürmer aus dem Abseits; während Bodenpass, Luftpass, freiem Ball oder Torwartabpraller fehlt dieselbe Laufgrenze und er läuft wieder tiefer ins Abseits. `pitch-v55.js` und `world-backpedal-v108.js` verwenden nun auch ohne Besitzer die bestehende Zuordnung von Ballflug/letzter Berührung beziehungsweise Abprallergefahr. Die Ziele bleiben kontinuierlich, die Positionen werden nicht versetzt. Explizite Empfänger und Abfänger behalten ihr Kontaktziel: Ein beim Abspiel legaler Spieler darf nach dem Pass hinter die aktuelle Linie starten. Sieben Unterbrechungsarten sind ausgenommen.

Stürmer begleiten den Angriff auch dann, wenn ihr ursprünglicher Aufstellungsanker hinter dem Ball liegt. Offensiv ausgerichtete Mittelfeldspieler rücken nach, ausgeglichene Spieler unterstützen dahinter, defensive Spieler behalten ihre Absicherung. „Unterstützen“ bleibt hinter dem Ball, „Tiefe“ sucht den Raum davor; Stellungsspiel beeinflusst die Laufziele und weiterhin das Abseits-Timing. Abwehrspieler behalten ihre bereits vorhandenen gesonderten Aufbau-/Deckungsziele.

Ballführer nutzen einen freien Korridor in Metern, statt bereits ab einem festen Spielfeldfortschritt abzuschließen. Ein Verteidiger direkt daneben oder im nahen Laufkorridor sperrt den freien Vorstoß. Abschlüsse erfolgen aus ungefähr 10–13 m, abhängig von Abschluss/Stellungsspiel, oder früher bei einem nahen herauskommenden Keeper. Besser postierte Mitspieler bleiben mögliche Passziele. Die bereits vorhandenen Distanzfaktoren für Zielquote/Torchance bleiben unverändert: Torfaktor ab 12 m `exp(-(Distanz-12)/13)`, Zielquote ab 16 m `exp(-(Distanz-16)/45)`; weitere Fähigkeiten, Druck und Torwartwert wirken mit.

[Reproduktion](free-ball-positioning-baseline-v124.json), [freie Ballphasen](free-ball-positioning-qa-v124.json), [taktische Läufe und zwölf Entscheidungen](forward-runs-qa-v124.json), [Fähigkeits-/Stellungsspielregression](positioning-qa-v124.json). Der frühere Wahltest liegt außerhalb der neuen Abschlussnähe: Seine übrigen Aktionen sind nun ausdrücklich Vorstöße statt Schüsse. Die alte Evidenz bleibt erhalten.

## Abseitsgrenze

Die Grenze lag bisher in der Körpermitte. In der Vereinswelt verwenden Entscheidungsprüfung und beide Ansichten nun dieselbe torseitige Körpergrenze des vorletzten Gegenspielers und des Angreifers, ohne Arme/Hände. Auch der torseitige Ballrand zählt. Maßgeblich bleibt der Abspielmoment, einschließlich Ausnahmen für direkte Standards und der eingefrorenen Analysesituation. Die Regelrichtung entspricht [IFAB, Regel 11](https://theifab.com/laws/latest/offside/).

**Grenze der Umsetzung:** Die gemeinsame Simulation verwendet ein deterministisches vereinfachtes Körpermodell mit 0,28 m Ausdehnung; bei einer zum betreffenden Tor gerichteten Grätsche kommt der vorgestreckte Fuß hinzu. Es wird nicht jeder animierte Hautvertex vermessen. Dadurch hängen Abseitsentscheidungen nicht von Grafikansicht, Bildrate, kosmetischem Modell oder Handschuhen ab. Der Check prüft beide Richtungen, gleiche Höhe, knappen Vorsprung, Ballrand, gerichtete Grätsche, Standards, Abspiel-Snapshot, Seitenwechsel und unveränderte alte Liga. [Prüfbelege](offside-body-qa-v124.json).

## Grätsche und Übergang

Der alte Renderer kippte den gesamten Körper seitlich, während die Beine ihre Laufbewegung fortsetzten. Im Baseline-Fall drang die Haut bis etwa 0,19 m unter die Oberfläche. Die neue prozedurale Pose am bestehenden Meshy-Rig senkt das Becken, streckt ein Bein nach vorn und winkelt das andere an. Pose und Bodenkorrektur werden nach der endgültigen Mischung angewendet. Der Matchweg und Zweikampfkontakt bleiben in der Engine.

Während des Poseausklangs bleiben Lauf-Fußanker freigegeben. Der vollständige Matchtest fand sonst beim Wechsel Grätsche/Foul einen 0,92-m-Hüftsprung durch zu früh aktivierte Fuß-IK. Die Freigabe deckt jetzt auch diesen Ausklang ab. Sechs Sequenzen bei 30/60/120 Hz und zwei Richtungen prüfen Bodenkontakt, führendes Bein, Pause und kontinuierliche Rückkehr. Dies ist keine neu generierte Meshy-Grätsche. [Baseline](slide-visual-baseline-v124.json), [Korrektur](slide-visual-qa-v124.json), [Bild](../../outputs/slide-1.10-qa-v124.png).

## Seitliche Torwartparade

Der bisherige Fang-/Abwehrpunkt lag nur 0,35 beziehungsweise 0,85 m seitlich vom Keeper. `v115KeeperContact` berücksichtigt jetzt begrenzte Reichweite, Torwartfähigkeit und verfügbare Flugzeit. Die native Pose verschiebt sich beim Absprung zusätzlich seitlich, bis maximal 1,15 m, statt nur um die Hüfte zu rotieren. Die Handkorrektur reicht an denselben Ballpunkt und blendet kontinuierlich ein. Absprung bleibt an der aktuellen Keeperposition, die Engineposition wird durch den Renderer nicht verändert.

Die neue seitliche Verschiebung gilt für erreichbare Paraden; ein erfolgreicher Schuss zieht den Keeper nicht in die Torflugbahn. Sechs beidseitige 1,9-m-Kontaktszenen bei drei Bildraten zeigen etwa 0,88 m seitlichen Hüftweg und erreichten Handkontakt. Sieben tatsächliche Keeperabläufe prüfen Fangen, einhändige Abwehr, Bodenaufnahme, Rutschen, Aufstehen und Nachschuss. Sechs erfolgreiche Tore werden zusätzlich auf Freiraum gegenüber der sichtbaren Haut einschließlich Handschuhen geprüft. [Seitliche Reichweite](keeper-travel-qa-v124.json), [native Keepersequenzen](keeper-visual-qa-v124.json), [Torfreiraum](goal-clearance-qa-v124.json).

## Torwart-Nachstellschritte

Bei überwiegend seitlicher Bewegung bis 4,1 m/s bleibt der Torwart zum Ball ausgerichtet. Eine prozedurale Pose am vorhandenen Meshy-Rig verwendet gebeugte Knie, seitliches Umsetzen der Beine und bereite Hände. Die Fußkontaktphase folgt dem tatsächlichen Bewegungsweg; stehende Füße werden mit der vorhandenen IK gehalten. Ein- und Ausstieg werden geglättet. Vorwärtslaufen, Sprint und Ballaktionen behalten ihre eigene Bewegung. Es wurde kein neuer Meshy-Clip erzeugt.

24 native Sequenzen decken 1,5 und 3,9 m/s, beide Bewegungsrichtungen und Tororientierungen sowie 30/60/120 Hz ab. Geprüft sind Umkehr, Stillstand, Ballausrichtung, Sohlenkontakt, begrenzte Hüftschritte, Pause und unveränderte Simulationsdaten; vier Gegenproben schließen Feldspieler, Vorwärtslauf, Sprint und Parade aus. [Nachstellschrittprüfung](keeper-sidestep-qa-v124.json), [visuell geprüfte Nahansicht](../../outputs/keeper-sidestep-qa-v124.png).

## Hoher Ball: Landen und Aufspringen

Freie hohe Bälle behalten nun eine flüchtige vertikale Geschwindigkeit. Eine ballistische Flugphase mit 9,8 m/s² trifft den Boden am berechneten Kontaktzeitpunkt; 42 % der vertikalen Geschwindigkeit bleiben beim Rücksprung erhalten, horizontal bleiben 82 %. Weitere Rücksprünge verlieren Energie, kleine Sprünge enden im Rollen mit der vorhandenen Rollreibung. Der Ball wird während des Luftwegs nicht als Bodenball aufgenommen. Eckballnachlauf übernimmt Höhe und vertikale Geschwindigkeit.

Sechs analytisch geprüfte Fall-/Steigfälle bei 30/60/120 Hz bestätigen Aufprallzeit, Rücksprunghöhe, Energieverlust, Ausrollen und Pause. Eine native Kopfballklärung bestätigt denselben Ablauf durch die echte Matchschleife. Der alte Klärungstest erzwingt keine künstliche Landung mehr nach 0,30 s; die neue analytische Prüfung ersetzt diese Annahme. [Physikprüfung](air-bounce-qa-v124.json), [nativer Ablauf](restarts-bounce-qa-v124.json), [benachbarte Ballkontakte und Nachlauf](ball-motion-qa-v124.json). Noch kein Spin/Magnus-Effekt, Wind oder materialabhängiger Boden.

## Zweiter Anstoß und Abschlussprüfung

Zum zweiten Anstoß wird die Halbzeitaufstellung unmittelbar hergestellt, bevor das Spiel freigegeben wird. Der bisherige Rücklauf nach einem Tor wird dafür nicht mehr wiederverwendet; veraltete Grätschen-/Kontaktziele werden gelöscht. Manueller und automatischer Halbzeitstart sind sofort anstoßbereit, ohne Spieler in der falschen Hälfte. Nach Toren bleibt der sichtbare Rücklauf bestehen. [Direkte Aufstellung](restarts-bounce-qa-v124.json), [Einwurf-/Elfmeter-Halbzeitregression](half-time-throw-qa-v124.json).

Regulärer Build und Probe neu erzeugt. Vollständiger 2D-/3D-Vergleich einschließlich gebuchtem Ergebnis, Torbanner, Abseits, Wechseln, Elfmeter, Halbzeit, Abpfiff, Orientierung, WebGL-Ausfall, Speicherung und eingebettetem Offline-Audio bestanden. Zwei vollständige 3D-Partien prüfen Positionen, Root, Hüfte und Ball mit unveränderten Warping-Grenzen. [Matchvergleich](../../outputs/world3d-parity-v124.json), [Matchmessung](warping-qa-v124.json), [Abschlussmanifest](verification-v124.json).

Die Nachweise decken vorbereitete Szenen und ausgewählte Seeds ab. Sie ersetzen keine allgemeine Mesh-Kollision oder Hardware-Leistungsprüfung. Eine neue 90-Partien-Balancestudie wurde für diesen Block nicht erstellt; die v123-Studie beschreibt den damaligen Stand. Neue Lauf-/Abseits-/Ballregeln können zukünftige Ergebnisse verändern. Balleffet ist als nächster gemeinsamer Ausbau von Flugbahn, Abwehrkontakt und Torwartreaktion vorgeschlagen, noch nicht implementiert.
