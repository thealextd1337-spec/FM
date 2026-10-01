# Detailliertere Spieleranimationen in der 3D-Ansicht

Stand: 1. Oktober 2026. Grundblöcke als Prototyp 102 und die nächste Ausbaustufe als Prototyp 103/104 umgesetzt. Die ursprüngliche Planung ist unten als Referenz erhalten. Die Erweiterung betrifft die 3D-Spieldarstellung der Vereinswelt im Querformat. Der bestehende stilisierte Look und die nahe TV-Kamera bleiben Grundlage.

## Nächster Block: Laufkontakt und Übergänge (103)

Auf Nutzerwunsch umgesetzt: Der Laufzyklus erhält eine längere Standphase mit bodennahem Schuh und eine angehobene Rückführphase. Hüfte und Knie lösen die gewünschte Fußbahn gemeinsam; Version 104 stimmt die Unterschenkellänge und die Zielhöhe auf die tatsächliche Rasenoberkante ab; das Fußgelenk gleicht die Beindrehung aus. Schrittlänge und Strecke bleiben gekoppelt, der Rumpf federt dezent mit. Geschwindigkeit, Pause und Seitenwechsel verwenden weiterhin die bestehende Präsentationslogik.

Pass- und Schussbewegungen blenden aus der Laufpose ein. Ausholen erhält Kniebeugung; Ausschwingen und die Richtung des Körpers gehen mit einer glatten Kurve in die aktuelle Laufrichtung zurück. Kopf-/Ballkontakt und tatsächliche Aktionen bleiben synchron; Berechnung, Zufall, Taktik und Spielstände sind unverändert. Die vorhandene Geometrie wird verwendet, ohne zusätzliche Spieler-Polygone.

Die Gelenkprüfung deckt Bodennähe, angehobenen Fuß, waagerechten Schuh, Eintritt ohne Posensprung und Grafikbildraten von 30/60/120 Hz ab. Der Browser prüft weiterhin alle 28 Aktions- und 20 Luftduellfälle. Echte Mobilhardware und die subjektive Bewegungsabnahme bleiben offen.

## Umsetzung 102

- Ein eigener Grafikbildtakt zeichnet Spieler, Ball, Aktionsphasen und Kamera zwischen den unveränderten Simulationsschritten. Ein gemeinsamer Puffer von einem Simulationsschritt hält Kontakte zusammen. Pause, Dialog, 2D, Hochformat, verborgenes Tab, unsichtbares Matchfeld, Verlassen und WebGL-Ausfall stoppen die Zeichenschleife.
- Knie, Fußgelenke, Ellenbogen und Hals sind getrennte Drehpunkte. Statische Teile bleiben je Segment gebündelt. Schrittphasen folgen der zurückgelegten Strecke; Laufamplitude und Richtungswechsel werden geglättet. Zusätzliche Zeichnungen setzen die Laufbewegung nicht auf null.
- Flache Pässe, hohe Pässe/Flanken, Schüsse, direkte Freistöße, Volleys und Kopfbälle verwenden unterschiedliche Gesten. Das Ausschwingen geht weich in die Laufpose über. Bereits bestätigte Abspiele können im Bildpuffer kurz ausholen; die Simulation wartet dafür nicht.
- Luftduelle zeigen eine gemeinsame Bereitschaftsphase. Erst die bestehende Engine bestimmt Gewinner, Annahme, Kopfballpass, Kopfballschuss, Volley oder Klärung. Flüchtige Kontaktangaben verbinden ankommenden und ausgehenden Ball; Klärungen fliegen aus der Kopfhöhe, Annahmen sinken zu den Füßen. Es gibt keine neuen Wahrscheinlichkeiten, Matchfelder oder Spielstandumrechnungen.
- Paraden, Würfe, Torwartabspiel, Bannerreihenfolge und Taktiksteuerung verwenden weiterhin die vorhandenen Abläufe. Die wuchtigen Schusszeiten und der direkte Netzflug aus 101 bleiben erhalten.

`work/test-pitch-motion-v102.cjs` prüft Ereignisarten, Darstellung ohne Änderung des Matchzustands, Pause, Interpolation und streckenabhängige Laufposen bei 30/60/120 Grafikbildern pro Sekunde. `work/check-pitch-motion-v102.cjs` prüft Zwischenpositionen, beide Teams/Halbzeiten, bestätigte Luftduellkontakte, Aktionsgelenke und Schleifenlebenszyklus in einem isolierten Edge-Profil. Die bisherigen Browserprüfungen für 3D, Aktionen, Standards und Menü bestehen ebenfalls. Ein vollständiges 2D/3D-Testmatch liefert bei 2543 Schritten identischen Verlauf, Ereignisse, Wechsel, Statistiken und verbuchtes Ergebnis. Die zusätzliche Browserabnahme prüft 28 Aktionsfälle und 20 entschiedene Luftduellfälle, jeweils beide Teams und Halbzeiten. Pause, Orientierungswechsel, 2D-Umschaltung, Sichtbarkeit und WebGL-Ausfall bestanden ohne Browserfehler.

Die Taktmessung mit Software-WebGL verwendet reduzierte Rasterauflösung ohne Schatten, um Zeichentakt und Simulation getrennt zu prüfen. Sie ist keine Leistungszusage für Mobiltelefone. Ansicht und Bedienung werden zusätzlich in normaler Auflösung sowie in Handy-Bildschirmgrößen geprüft. Eine Laufzeitmessung auf echter Mobilhardware bleibt offen.

Ein zusätzlicher Paarvergleich (`work/measure-pitch-motion-v102.cjs`, Baseline-Commit `445457d`, gleiche Kamera, DPR 1, Schatten, 840×473 und 760×428) misst 284 statt 276 Zeichenaufrufe und 322 statt 311 Geometrien. Zwölf Software-WebGL-Zeitproben nach Aufwärmen schwanken deutlich: Median 1,0–1,9 ms, einzelne langsame Probe bis 61,6 ms. Diese kleine Messreihe eignet sich zum Vergleich der Geometriekosten, nicht zur Zusicherung stabiler Geräte-FPS. Das Skript benötigt den Baseline-Commit in der lokalen Git-Historie.

Veröffentlichung: [3D-Version 102](https://fussball.cakamper.at/3d/) und ZIP sind live geprüft. Gleicher Quell-/Build-/Live-Stand; 28 Aktions- und 20 Luftduellfälle auch im veröffentlichten Einzeldatei-Build ohne Browserfehler bestanden.


## Ziel

Pässe, Schüsse und Kopfbälle sollen an der Körperbewegung eindeutig erkennbar sein. Der Ball muss den sichtbaren Fuß beziehungsweise Kopf beim tatsächlichen Kontakt verlassen. Mehr Detail entsteht durch Gelenke, Gewichtsverlagerung und abgestimmte Bewegungsphasen; eine bloße Erhöhung der Polygonzahl genügt nicht.

Zusätzliche Nutzeranforderung: Laufen und sämtliche Aktionsanimationen sollen flüssiger und weniger abgehackt wirken. Das betrifft sowohl die Bewegung über den Rasen als auch Gelenke, Richtungswechsel und Übergänge zwischen Laufen und Aktion. Diese Grundlage wird im ersten Block umgesetzt.

Taktik, Spieleranweisungen, Pausen, Wechsel, Bannerfolge, Torbannerzeiten, Standards und Rückkehr aus dem Taktikscreen bleiben erhalten. Die bestehende Engine entscheidet weiterhin Aktion, Teilnehmer, Ziel, Flugzeit und Ergebnis. Für diesen Animationsblock werden weder Schuss-/Passwahrscheinlichkeiten noch die in Version 101 eingeführten Spielzeiten verändert.

## Ausgangslage im Code

- `pitch-scene-v98.js`, Funktion `player`: Körpergruppe und vier Gliedmaßengruppen. Arme und Beine drehen derzeit als jeweils ein Stück. Kopf und Haare werden mit den statischen Körperteilen zusammengefasst.
- `world-pitch3d-v98.js`: Laufbewegung, Paraden, Überkopfwürfe und Torwartabspiel überschreiben dieselben Körper-/Gliedmaßentransformationen. Es fehlt ein gemeinsamer Übergang zwischen Laufpose und Aktionspose.
- `world-physical-v65.js`, `v65StartLoop`: Simulation und `draw()` laufen derzeit gemeinsam im 40-ms-Intervall, nominell etwa 25 Bilder pro Sekunde. Zusätzliche Zeichnungen im gleichen Simulationsschritt können im 3D-Renderer eine Geschwindigkeit von null ergeben; dadurch kann die laufabhängige Gelenkbewegung ebenfalls abrupt wechseln.
- `world-pitch-actions-v99.js`: WeakMaps halten flüchtige Ereignis- und Animationsdaten. Der Abstoß hat bereits Warten, Ausholen und Ausschwingen. Schüsse sind für Flugkurve und Parade erfasst; ihre Körperanimation und der Untertyp fehlen.
- `pitch-v55.js`: `v55GroundPass` kennt normale Pässe und Kopfballpässe, `v55HighPass` hohe Bälle, Flanken und Ecken. `v55Shoot` kennt Schuss, Kopfball, Volley und direkten Freistoß. `v55ResolveAir` entscheidet erst bei Ankunft des hohen Balls über Luftduell, Kopfball, Volley, Annahme oder Klärung.

## Geplante Bewegungen

Die folgenden Zeitfenster sind Ausgangswerte für die visuelle Erprobung in der nahen TV-Kamera. Sie sind keine zusätzlichen Wartezeiten der Engine.

| Aktion | Sichtbare Bewegung | Kontakt und Ausklang |
| --- | --- | --- |
| Flacher Pass | Körper zum tatsächlichen Passziel drehen, Gewicht auf Standbein, kurzer Beinschwung mit leicht geöffneter Fußspitze | Innenseite am Ball; 0,20–0,35 s ruhiges Ausschwingen, dann in die aktuelle Laufpose übergehen |
| Hoher Pass / Flanke | Größeres Ausholen, Knie beugen, Oberkörper leicht zurück, Arme zum Ausgleich öffnen | Fuß unter dem Ball; längeres Ausschwingen von etwa 0,35–0,50 s, ohne die vorhandene Flugbahn zu ersetzen |
| Schuss | Deutliches Standbein, stärkeres Ausholen, Hüft-/Oberkörperdrehung und schneller Durchschwung | Spannkontakt am tatsächlichen Abspiel; 0,35–0,55 s Ausschwingen mit kleinem Ausgleichsschritt. Wuchtige Flugzeiten und durchgehender Torballweg aus Version 101 bleiben erhalten |
| Kopfballpass / Kopfballtor | Blick zum ankommenden Ball, Knie beugen, kleiner Absprung, Rumpf vorspannen und Kopf aus dem Halsgelenk nach vorn führen | Stirnkontakt; ausgehender Ball startet an der passenden Kopfhöhe. Anschließend Landung mit gebeugten Knien und Rückkehr zum Laufen |
| Volley | Bein zum ankommenden Ball heben, Rumpf seitlich stabilisieren, kurzer kräftiger Schwung | Kontakt auf der tatsächlichen Ballhöhe; eigener Abschluss statt Kopfball- oder Bodenpasspose |

Volleys sind ein notwendiger eigener Übergang, weil die Engine sie bereits anstelle eines Kopfballs wählen kann. Fallrückzieher, Flugkopfbälle und neue Jubelanimationen gehören zu einem späteren Ausbau.

## Beweglicheres Spielermodell

Das vorhandene Modell wird gezielt um Oberschenkel, Unterschenkel, Fuß, Oberarm, Unterarm und eine Hals-/Kopfgruppe ergänzt. Knie und Ellenbogen erhalten natürliche begrenzte Drehwinkel. Kopf, Haare und Gesichtsdetails bleiben als gemeinsame Gruppe verbunden. Die vorhandenen Trikotfarben, Muster, Nummern und Torwarthandschuhe bleiben erhalten.

Die Spielerwurzel bleibt für Feldposition und Orientierung verantwortlich. Becken, Rumpf und Gliedmaßen führen die Pose aus; Springen hebt den Körper, während Schatten und Spielfeldposition auf dem Boden bleiben. Die bisherige Geometriebündelung wird pro beweglichem Segment fortgesetzt. Es werden keine externen Charaktermodelle oder zusätzlichen Grafikbibliotheken eingeplant.

Für den ersten Block genügt ein gemeinsamer stilisierter Bewegungsstil. Der Schlagfuß kann anhand einer festen, darstellungsinternen Regel gespiegelt werden; dafür braucht es weder ein neues Spielermerkmal im Spielstand noch einen zusätzlichen Zufallswert.

## Flüssigeres Laufen und weichere Übergänge

1. **Bilddarstellung vom Simulationstakt trennen:** Die vorhandene Matchschleife behält ihren 40-ms-Takt. Die aktive 3D-Szene zeichnet über `requestAnimationFrame` passend zum Bildschirm. Dieser reine Darstellungsaufruf darf weder `step()` noch Matchverarbeitung oder Speicherung ausführen. Ziel sind gleichmäßige Bilder, auf geeigneten Geräten typischerweise 60 pro Sekunde; die tatsächliche mobile Leistung wird gemessen.
2. **Zwischen bekannten Positionen interpolieren:** Spieler, Ball und bestätigte Aktionsphasen verwenden dieselbe Darstellungszeit zwischen zwei Engine-Schnappschüssen. Ausgangspunkt ist ein kleiner Puffer von einem Simulationstakt, etwa 40 ms. Keine Vorhersage künftiger Tore, Ballgewinne oder Zweikämpfe. Kontakt, ausgehender Ballflug und Körperpose müssen denselben Puffer verwenden, damit kein Teil vorauseilt.
3. **Laufschritt an Strecke binden:** Die Schrittphase wächst mit der tatsächlich dargestellten Laufstrecke. Geschwindigkeit und Schrittlänge bestimmen das Tempo der Beine; im Stillstand kommt die Laufpose weich zur Ruhe. Ein zusätzlicher Renderaufruf ohne Simulationsfortschritt darf die Laufamplitude nicht auf null setzen. Die Bildrate verändert weder Schrittfrequenz noch Laufgeschwindigkeit.
4. **Anlaufen, Bremsen und Drehen glätten:** Die Laufamplitude erhält eine kurze Ein-/Ausblendung, zunächst etwa 100–180 ms. Richtungswechsel drehen zuerst den Körper und gehen dann in die neue Schrittrichtung über. Standfüße bleiben während ihrer Bodenkontaktphase möglichst ruhig; Knie, Hüfte und Arme gleichen den Schritt aus. Geglättet werden die Darstellung und Gelenke, nicht die taktischen Ziele oder physischen Spielerkoordinaten.
5. **Aktionen mit der Laufpose mischen:** Pass, Schuss, Kopfball, Parade und Einwurf übernehmen die aktuelle Pose. Kontaktphasen bleiben zeitlich exakt, Vorbereitung und Ausklang werden weich eingeblendet. Eine Folgeaktion darf den Ausklang ablösen, ohne Gelenke abrupt auf ihre Nullstellung zu setzen.
6. **Lifecycle sauber halten:** Nur eine aktive 3D-Zeichenschleife pro Match. Pause friert Darstellung und Schrittphase ein; Fortsetzen setzt die Zeitreferenz ohne Sprung neu an. Bei Anstoß, Seitenwechsel oder bewusstem Neuaufbau werden Positionspuffer zurückgesetzt statt über das Feld zu interpolieren. Bei Verlassen, 2D-Auswahl, Grafikkontextverlust oder unsichtbarer Seite endet die Zeichenschleife. Menü- und Bannerinhalte werden nicht unnötig pro Grafikbild neu geschrieben.

Der Puffer und die Mischzeiten sind visuelle Ausgangswerte. Sie werden bei schnellen Pässen und direkten Abschlüssen geprüft; Ballkontakt darf durch die Glättung nicht verzögert oder räumlich auseinandergezogen erscheinen.

## Ereignisbindung und Ballkontakt

1. **Bestätigte Aktion erfassen:** Die vorhandenen Funktionsaufrufe liefern Spieler-ID, Aktionsuntertyp und das tatsächlich erzeugte Flugziel. Metadaten werden in der bestehenden flüchtigen Ablage ergänzt. Logtexte werden nicht als Ereignisquelle verwendet.
2. **Vorbereitung ohne Vorhersage:** Solange die Engine noch nicht entschieden hat, welcher Pass oder Schuss folgt, ist nur eine neutrale Bereitschafts-/Gewichtsverlagerung zulässig. Ausgerichtetes Ausholen wird nur gezeigt, wenn die Aktion bereits feststeht und ein bestehendes Zeitfenster verfügbar ist. Bei sofortigem Abspiel beginnt die sichtbare Pose am Kontakt und geht ins Ausschwingen über; es wird kein neuer Engine-Aufschub eingeführt.
3. **Kontakt synchronisieren:** Fuß-/Kopfkontakt und Freigabe des sichtbaren Balls teilen denselben Ereigniszeitpunkt. Ein festgehaltener Ball folgt nur während des bestätigten Kontakts dem Körper. Danach gilt die vorhandene Flugkurve mit ihrem tatsächlichen Ziel und Ergebnis.
4. **Ausklang unabhängig von Ballannahme:** Die Aktionspose läuft bis zum kurzen Ausklang weiter, auch wenn der Empfänger den Ball bereits angenommen hat. Eine Annahme darf die Pose nicht zurücksetzen oder erneut auslösen.
5. **Posen vollständig zurücksetzen und mischen:** Jeder Bildaufbau beginnt mit einer vollständigen Grundpose. Eine bestätigte Aktion überlagert die betroffenen Gelenke und blendet anschließend in die aktuelle Laufpose über. So bleiben nach Pause, Parade oder einem schnellen Folgeereignis keine alten Gelenkwinkel stehen.

### Besonderheit beim Kopfball

Der größte Integrationspunkt ist die Ballankunft: Die heutige hohe Flugbahn endet visuell am Boden, während `v55ResolveAir` erst dort den tatsächlichen Kopfballspieler bestimmt. Die Erweiterung muss die letzte Flugphase, Absprunghöhe und Stirnkontakt gemeinsam abstimmen. Ein bloßes Kopfballwackeln nach dem Bodenkontakt reicht nicht.

Während der Annäherung dürfen erreichbare Spieler eine Bereitschaft zum Luftduell zeigen. Sieger, Kopfballtor, Kopfballpass und Klärung werden ausschließlich aus der bestätigten Engine-Aktion übernommen. Kein vorweggenommener Sieger und kein zusätzlicher Zufallswurf. Das visuelle Kontaktziel muss innerhalb der vorhandenen Kontaktgeometrie liegen; Sprünge des Balls oder sichtbare Teleports zum Kopf sind Abnahmefehler. Die konkrete Kurve wird zuerst anhand eines reproduzierbaren Kopfballpasses und eines Kopfballtors erprobt, bevor alle Luftduellzweige angebunden werden.

## Reihenfolge der Umsetzung

### Block 1: Flüssiges Laufen, Gelenke und Passanimation

Zuerst den reinen 3D-Zeichentakt und die gemeinsame Positionsinterpolation ergänzen. Dann das Spielermodell, streckenabhängiges Laufen und gemeinsame Posenübergänge ausbauen. Den bestehenden Abstoß auf die Gelenkstruktur übertragen; danach flachen Pass, hohen Pass und Flanke anbinden. Kontakt am Fuß, Ausrichtung zum tatsächlichen Ziel und Rückkehr zum Laufen prüfen. Der erste Block ist fertig, sobald Laufen, Stoppen und Drehen ohne sichtbare Taktsprünge funktionieren und diese Aktionen in echten Partien auf Desktop und mobilem Querformat klar lesbar sind. Paraden sowie Würfe müssen weiterhin funktionieren.

### Block 2: Schussanimation

Normale Schüsse und direkte Freistöße mit stärkerer Hüftbewegung und Durchschwung ergänzen; Volleys erhalten ihre passende Kontakthöhe. Tor, Parade, Block sowie hoher/seitlicher Fehlschuss teilen die Schussbewegung bis zum bestätigten Ballflug. Die vorhandene durchgehende Flugbahn über die Torlinie wird beibehalten.

### Block 3: Kopfball und Luftduell

Kopfballpass und Kopfballtor mit Absprung, Halsbewegung, Stirnkontakt und Landung ergänzen. Danach bestätigte Kopfballklärungen, Luftduelle und Übergänge zur Annahme anbinden. Hohe Bälle ohne erreichbaren Spieler behalten ihren tatsächlichen Landepunkt. Kopfball und Volley müssen visuell unterscheidbar bleiben.

Jeder Block wird zuerst als lokaler, überprüfbarer Stand umgesetzt. Veröffentlichungen folgen den bestehenden Regeln für die getrennte 3D-Vorschau und erhalten eine neue Versionsnummer.

## Abnahme

- **Flüssigkeit:** Derselbe Laufweg und dieselbe Aktionsfolge werden bei verschiedenen Grafikbildraten geprüft. Gleiches Tempo, keine stillstehenden Beine zwischen Engine-Schritten, kein sichtbares Rutschen beim Stoppen und kein Sprung nach Pause. Schneller Richtungswechsel und Pass aus dem Lauf bleiben klar lesbar. Gemeinsame Interpolation von Spieler, Ball und Kontaktpose prüfen.

- **Lesbarkeit:** Pass, Flanke, Schuss, Kopfball und Volley sind in der nahen TV-Kamera anhand der Körperbewegung unterscheidbar, auch im mobilen Querformat.
- **Kontakt:** Ball und Fuß beziehungsweise Stirn treffen zur Freigabe zusammen. Kein Sprung zwischen eingehender und ausgehender Flugbahn; keine schwebenden Standfüße oder im Rasen versenkten Knie.
- **Ablauf:** Je bestätigter Aktion genau eine Animation. Schnelle Folgeaktionen, abgefangene Pässe, geblockte Schüsse und Ballannahmen hinterlassen keine falsche Pose.
- **Pause und Ansichten:** Pause, Spielerinfo und Taktik halten Aktionsposen an. Fortsetzen führt wieder zum Feld. 2D-/3D-Wechsel, Gerätewechsel und Grafikkontextverlust lösen keine Aktion doppelt aus. Fehlende flüchtige Posen nach dem Laden führen zur normalen Grundpose, ohne historische Ereignisse nachzuberechnen.
- **Funktionserhalt:** Derselbe vollständige Matchlauf muss mit und ohne 3D identische Ereignisse, Tore, Wechsel, Statistiken und verbuchtes Ergebnis liefern. Taktikbefehle, Standards sowie Tor-vor-Wechsel-Bannerfolge bleiben erhalten.
- **Leistung:** Mehrkosten der Gelenke gegenüber Version 101 messen: Bildzeiten, Zeichenaufrufe und Geometrie auf identischen Desktop-/Handy-Testfällen. Anschließend auf einem echten Mobiltelefon prüfen; Browseremulation allein belegt keine Geräteleistung. Die erste Ausbaustufe bleibt bei einfachen prozeduralen Posen und gebündelter Geometrie.

Gezielte Tests erweitern die vorhandenen Aktions- und Projektionstests. Browserfixtures decken beide Spielrichtungen, beide Halbzeiten, kurze und hohe Pässe, Kopfballpass/-tor/-klärung, Volley, Parade, Block und Fehlschuss ab. Der bestehende vollständige 2D/3D-Vergleich sowie Offline-Build und SuperCollider-Audio bleiben Freigabebedingungen.
