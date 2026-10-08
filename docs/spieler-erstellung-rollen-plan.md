# Spielererstellung, Rollenrepertoire und Qualitätsverteilung – Entwurf

Stand: 7. Oktober 2026. Der Nutzer verlangt zusammenhängende Rollenrepertoires bei Spielererstellung, fein abgestimmte Fähigkeiten und eine anhand der Vereinsprofile neu erzeugte Spielerdatenbank. Keine Änderungen an alten Spielständen. Noch keine Produktimplementation oder neue Verteilung eingebaut.

## Bestätigte Anforderungen

- Zusätzliches internes Hintergrundtalent im Bereich 10–22 ist bestätigt; bei der Spielererstellung einmal festlegen und lebenslang unverändert speichern. Es ist keine reguläre Fähigkeit auf der Skala 1–20 und wird im Produkt weder numerisch noch als Farbstufe, Sterne oder Talentkategorie angezeigt. Nach Nutzerkorrektur variiert die Gesamtentwicklung nach Talenteinschätzung; die 19-Punkte-Referenz gilt nicht als allgemeiner Zielwert für alle Spieler. Direkte Zuordnung des Talentwerts zur Gesamtzuwachs-Zielsumme im Vier-Saison-Referenzfall, ganze Talentwerte und globale Häufigkeitsverteilung sind bestätigt: Talent 21–22 zusammen 2 Prozent, davon Talent 22 mit 0,5 Prozent. Vollständige Anteile stehen im Notenentwicklungsplan. Für Talent 20–22 sind relative Auswahlgewichte 0,5/1/2 bei schwacher/normaler/starker Jugendarbeit bestätigt; mit globalen Anteilen und Nachwuchsmengen kalibrieren, keine festen Quoten oder Änderung vorhandener Talentwerte. Positive Altersstaffel bestätigt: bis 19 Faktor 1,0, 20–21 Faktor 0,8, 22–23 Faktor 0,5; ab 24 separates Erwachsenenmodell. Talentabhängige Normalisierung mit Talent/19 bestätigt, bezogen auf die positive Referenzlernmenge von insgesamt 0,5 Punkten je qualifizierten 90 Minuten vor Altersfaktor. Saisonbegrenzung bestätigt: erste 900 tatsächliche Minuten mit voller Rate, nächste 900 mit 25 Prozent, danach kein zusätzlicher positiver Matchzuwachs; Wettbewerbe gemeinsam zählen. Auf Nutzerkorrektur alle Einsatzminuten kumulieren, auch Einwechslungen unter 20 Minuten ohne sichtbare Note; Interne Bewertung solcher Einsätze aus Spielaktionen und Rollenauftrag im minutengewichteten Dreierfenster bestätigt; konkrete Bewertungsregeln noch abstimmen. Einzelne Werte innerhalb der Bereiche und konkrete Vereinsprofilzuordnung bleiben offen. Ein zusätzlicher Einfluss auf individuelle Fähigkeitsobergrenzen ist nicht beschlossen. Erzeugung und Entwicklung mit seltenen Elite-Jugendspielern abstimmen; keine nachträgliche Zuweisung an Spieler alter Spielstände. [Notenentwicklungsplan](jugendentwicklung-noten-plan.md).
- Der Trainer wählt die taktische Rolle. Die Erstellung ermittelt, welche Rollen ein Spieler aufgrund seines zusammenhängenden Fähigkeitsprofils sinnvoll erfüllen kann; die Rollenauswahl ist keine zufällige dauerhafte Trainerzuweisung.
- Das Profil zeigt passende Rollen vorrangig für spielbare Positionen. Die Eignung kann vor dem ersten Einsatz sichtbar sein, aber es wird keine vollständige Liste aller theoretischen Rollen für jeden Spieler angezeigt.
- Ein hauptsächlich als Torjäger geeigneter Spieler kann bei passendem Profil auch Zielspieler sein. Rollen werden nicht unabhängig ausgelost; unzusammenhängende Kombinationen wie Stopper plus Dribbler sind kein reguläres Erzeugungsergebnis.
- Die neue Spielerdatenbank wird anhand der Vereinsprofile für neu erzeugte Vereinswelten erstellt. Bestehende Spielstände, Spieler, Ergebnisse, Statistiken und Potenziale werden weder geändert noch rückwirkend umgerechnet. Ein Neustart ist eine separate neue Welt; vorhandene Speicherstände werden nicht gelöscht.
- Die derzeitige Häufigkeit sehr hoher Fähigkeiten ist eine Nutzerbeobachtung und wird untersucht. Wirkliche Elite-Jugendspieler sollen nach bestätigtem Nutzerwunsch seltene Ausnahmen sein. Elitequalität ergibt sich auf Nutzerentscheidung aus der Gesamtheit der Fähigkeiten für eine Position, getrennt von taktischer Rolleneignung. Alle relevanten Fähigkeiten fließen mit positionsabhängigen Gewichten ein; Schwächen und Breite des Könnens werden berücksichtigt. Die Positionsgewichte, der gewichtete Mittelwert und die Elite-Mindestgrenze 16 sind bestätigt; Elitequalität ab 16 auf der besten im Profil spielbaren Position ohne zusätzliche Einzelfähigkeitsgrenzen ist bestätigt; Eliteanteil bleibt offen.
- Nach neuer Nutzerkorrektur gilt für beide Mannschaftsgrößen derselbe vollständige Positionskatalog: Tormann, Verteidiger, Mittelfeld und Stürmer. Das Mittelfeld ist eine gemeinsame Position; defensive, zentrale, offensive und seitliche Aufgaben entstehen durch Rollen und Taktik. Keine eigenen Positionen Defensives/Zentrales/Offensives Mittelfeld, Außenverteidiger oder Flügel. Beide Mannschaftsgrößen, fünf oder sechs Feldspieler plus Tormann, sollen wählbar sein und mit aktueller oder größerer Spielfläche kombiniert werden können. Positionsgewichte sind bestätigt; der Positionskatalog schreibt keine Pflichtformation vor.
- Keine eigene Flügelposition in beiden Mannschaftsvarianten. Flügelspieler ist eine taktische Rolle für geeignete Spieler aus Mittelfeld oder Angriff. Seitliche Aktionsräume werden über Taktik und Rollen bestimmt; Positionsqualität und gespeicherte spielbare Positionen bleiben davon getrennt. Bei Erzeugung kein zusätzliches unabhängiges Flügel-Positionsprofil anlegen.
- Fähigkeitswerte und Eignungspunkte bleiben intern. Die Produktoberfläche einschließlich zugänglicher Beschriftungen zeigt ausschließlich Farbstufen.
- Körperkraft ist als zusätzliche Fähigkeit bestätigt und wird in zusammenhängende neue Erzeugungs- und Potenzialprofile aufgenommen. Verteilung, konkrete Matchwirkung, Rollengewichte und Entwicklung bleiben offen; kein pauschaler Zusatz zum bestätigten Gesamtentwicklungstempo. [Körperkraftplan](koerperkraft-plan.md).
- Eine feste Körpergröße im bestätigten Bereich 165–205 cm mit Einfluss auf Match und Darstellung ist bestätigt. Sie wird als eigene Eigenschaft in das zusammenhängende Erzeugungsprofil aufgenommen; konkrete Verteilung und Wirkungsformeln bleiben offen. [Körpergrößenplan](koerpergroesse-plan.md).
- Die Größenverteilung berücksichtigt Position und Fähigkeitsprofil mit Ausnahmen, ohne feste Rollenmindestgrößen oder garantierte Körperkraft/Luftspielqualität. Auch Jugendspieler erhalten ihre endgültige unveränderliche Größe direkt bei Erstellung; kein späteres Wachstum. Profilabhängige Schwerpunkte und Wahrscheinlichkeiten bleiben offen.
- Global sind ungefähr 95 Prozent der neu erzeugten Spieler zwischen 170 und 200 cm sowie zusammen 5 Prozent zwischen 165–169 oder 201–205 cm bestätigt. Wahrscheinlichkeiten werden über alle Erzeugungsprofile gemeinsam kalibriert; keine festen Mannschafts-/Jahrgangsquoten. Aufteilung der Randbereiche und genaue profilabhängige Wahrscheinlichkeiten bleiben offen.
- Körpergröße wird als ganze Zentimeterzahl gespeichert und im Profil exakt angezeigt. Matchberechnung und Darstellung verwenden denselben Wert; keine abweichende versteckte Präzision. Die reine Farbstufenanzeige aller Fähigkeiten bleibt bestehen.

## Befund im aktuellen Quellstand

Die Vereinswelt erzeugt Startkader in `v61GenerateRoster()` mit einer einzigen Grundwerttabelle pro Positionsgruppe (`v61SkillBases`). Der Vereinsparameter `profile[5]` verschiebt nahezu alle Fähigkeiten gemeinsam. Die zufällige Variation beträgt nur ungefähr plus/minus 1,5 interne Punkte; zusammen mit hohen Grundwerten entstehen ähnliche und bereits starke Positionsprofile. Im aktuellen Weltgenerator werden noch keine differenzierten Archetypen für das Rollenrepertoire erzeugt. Die ältere Sechserliga-Profilgeneration in `strength-v55.js` ist dafür nicht maßgeblich.

Freie Spieler verwenden denselben Startgenerator mit einer eigenen Vereinsqualitätsvorgabe. Nachwuchs verwendet dieselben Positionsgrundlagen, ergänzt aber eine eigene Talent-/Investitionsverteilung und Potenziale. Alle drei Pfade müssen beim künftigen Umbau gemeinsam betrachtet werden; allein die Startkader abzusenken löst die dauerhafte Verteilung nicht.

Eine isolierte Stichprobe des aktuellen nativen Weltstarts mit zehn festen Seeds wurde ohne Browserzugriff oder Änderungen an realen Spielständen durchgeführt. Die Initialisierung enthält bereits die regulären Startaktionen, weshalb Liga-Kader nicht ausschließlich die ursprünglichen elf generierten Profis je Verein umfassen.

| Population | Untersuchte Spieler | Mindestens eine höchste Farbstufe | Mindestens drei höchste Farbstufen |
| --- | ---: | ---: | ---: |
| Ligakader nach Weltstart | 4.055 | 32,8 % | 11,1 % |
| Reine Pokal-Simulationsteams | 1.320 | 0 % | 0 % |
| Verbleibende Nachwuchspools nach Weltstart | 1.824 | 0,2 % | 0 % |
| Freie Spieler nach Weltstart | 100 | 37 % | 1 % |

Das sind Farbstufenhäufigkeiten, keine bereits vereinbarte Eliteklassifikation. Ein Spezialist mit einer höchsten Fähigkeit ist nicht automatisch ein Elite-Allrounder. Die Stichprobe belegt nicht den Zustand eines konkreten alten Nutzer-Spielstands oder die Verteilung nach vielen Saisons. [Messdaten und Methode](../outputs/player-generation-baseline-2026-10-06.json).

## Zusätzlicher Befund: Entwicklung durch Einsätze

Auf die Nutzerfrage, ob Spieler zu schnell besser werden, wurde der aktuelle native Wachstumspfad getrennt geprüft. `v67Grow()` wirkt ausschließlich auf Spieler mit gespeichertem `potential`, solange sie jünger als 24 sind und tatsächlich Einsatzminuten erhalten. Gewöhnliche Startprofis ohne Potenzialdatensatz wachsen in diesem Pfad nicht. Es handelt sich also nicht um einen allgemeinen Bonus für jeden Spieler nach jedem Match.

Für Spieler bis einschließlich 19 wird nach 180 gewichteten Einsatzminuten ein Wachstumsschritt ausgelöst, von 20 bis 21 nach 270 und von 22 bis 23 nach 450. Jeder Schritt verteilt bis zu zwei interne Fähigkeitspunkte auf die derzeit größten verbleibenden Potenzialabstände. Das sind zwei Punkte insgesamt, nicht zwei auf jede Fähigkeit. Europacupminuten zählen mit Faktor 1,5, normale Pokalrunden mit 0,75 und Pokalfinals beziehungsweise Liga mit 1. Das System richtet die Auswahl der verbesserten Fähigkeit bisher nicht nach dem taktischen Rollenauftrag aus.

Ein isolierter nativer Vergleich mit gleichem ausreichendem Potenzialspielraum bestätigt für zehn volle Ligaspiele insgesamt zehn interne Zuwachspunkte mit 18 Jahren, sechs mit 21, vier mit 23 und keinen mit 24; bei zehn Europacupspielen entstehen im kontrollierten Fall mit 18 Jahren vierzehn. Die Werte sind technische Diagnoseangaben und werden nicht in Spieleransichten veröffentlicht. Tests bestätigen außerdem die Potenzialgrenze, kein Wachstum ohne Potenzial und das Ignorieren einer wiederholt verarbeiteten Fixturekennung. [Messdaten und Grenzen](../outputs/player-development-baseline-2026-10-06.json).

Damit sind zwei getrennte Mechanismen belegt: Bereits beim Weltstart liegen viele hohe Fähigkeiten vor; junge Potenzialspieler entwickeln sich zusätzlich in kurzen Einsatzabständen. Die Geschwindigkeit kann langfristig zur Häufung starker Spieler beitragen, ist aber noch nicht durch eine Mehrsaisonstudie als alleinige oder dominante Ursache belegt. Potenzialgrenzen verhindern unbegrenztes Wachstum; der getestete Pfad zeigt keine doppelte Verbuchung derselben Partie.

Vorschlag für neue Welten: Startqualität, Potenzialprofile und Entwicklung gemeinsam abstimmen. Frühe Fortschritte sollen erkennbar sein; die inzwischen bestätigten Talent-, Alters- und Saisonfaktoren steuern das Tempo. Ein zusätzlicher Verlangsamungsfaktor allein wegen der Nähe zur persönlichen Potenzialgrenze entfällt bestätigt. Hohe Jugendinvestitionen verbessern Chancen auf geeignete Talente, garantieren keine regelmäßig neu entstehenden Elite-Allrounder. Fähigkeiten außerhalb des zusammenhängenden Profils werden nicht automatisch auf ein hohes Niveau entwickelt. Zieltempo, Rolleneinfluss und Entwicklungsdauer bleiben einzelne Nutzerentscheidungen; bestehende Spielstände behalten ihren bisherigen Entwicklungspfad.

## Vorgeschlagene neue Erzeugungsfolge

1. Vereinsprofil lesen: Kaderstärke beeinflusst die Chancen auf Qualitätsgruppen und ihre Verteilung im Kader; Jugendprofil beeinflusst den Nachwuchsweg. Einzelne Parameter dürfen nicht unterschiedslos alle Fähigkeiten jedes Spielers erhöhen. Altersstruktur und finanzierbarer Kader müssen zum Vereinsmodell passen; konkrete Gewichte bleiben offen.
2. Individuelle Qualitätsgruppe ziehen: breite Basis solider Spieler, eine kleinere Gruppe guter Spieler und seltene außergewöhnliche Spieler. Auch starke Vereine haben Abstufungen zwischen Stamm und Ergänzung; schwächere Vereine können einzelne Spezialisten besitzen. Keine Pflicht zu einem Spitzenkandidaten pro Verein.
3. Zusammenhängendes Fähigkeitsprofil erzeugen: beispielsweise Abschluss-/Tiefenprofil, Ballbehauptungs-/Ablageprofil oder defensives Zugriff-/Absicherungsprofil. Das ist eine Erzeugungsvorlage für Werte, kein vom Trainer unabhängiger Rollenauftrag. Stärken, unterstützende Fähigkeiten und nachvollziehbare Schwächen entstehen gemeinsam mit begrenzter Variation.
4. Spielbare Positionen und Rollenrepertoire ableiten: vorhandene Kernfähigkeiten und das zusammenhängende Profil bestimmen plausible Kombinationen. Eine Rolle wird nicht nur wegen eines hohen Durchschnitts oder einer einzelnen Spitzenfähigkeit hinzugefügt. Weitere unabhängige Rollenwürfe entfallen.
5. Eignung innerhalb des Repertoires berechnen und anzeigen: Eine automatische Änderung der bei Erstellung ermittelten Rollenempfehlungen durch spätere Entwicklung oder Alterung ist verworfen. Die Eignungsfarbstufen werden bestätigt anhand dauerhafter Fähigkeiten aktualisiert und müssen zusätzlich die Eingespieltheit auf der Position berücksichtigen. Genaue Gewichtung, Ausgangswerte und Lernrate der Eingespieltheit bleiben offen. Ihr Aufbau durch kumulierte tatsächliche Minuten je Einsatzposition und ihr Erhalt bei Rollenwechsel innerhalb derselben Position sind bestätigt. Grundfähigkeiten und Positionsqualität bleiben davon getrennt. Die hervorgehobene beste Rolle wird bestätigt innerhalb der festen Empfehlungen anhand dauerhafter Fähigkeiten und Positionseingespieltheit aktualisiert; genaue Gewichte bleiben offen. Bei annähernd gleicher Eignung bleibt bestätigt die bisher beste Rolle hervorgehoben; genaue Wechselgrenze und Auflösung gleicher Eignung bei Erstellung bleiben offen. Passende Rollen zuerst nach spielbaren Positionen ordnen, bestgeeignete hervorheben, andere geeignete Rollen zugänglich machen. Bestätigt sind pro spielbarer Position für gewöhnliche Profile meist eine beste Rolle und gegebenenfalls ein bis zwei sinnvolle Alternativen; seltene tatsächlich vielseitige Profile dürfen mehr besitzen. Keine Mindestzahl mit unpassenden Rollen auffüllen und keine starre Anzeigesperre für weitere echte Eignungen einführen. Ein Rollenname verleiht keinen Bonus auf Fähigkeiten oder die Matchausführung.
6. Alter und Entwicklung getrennt abstimmen: gegenwärtiges Können und Potenzial sind unterschiedliche Größen. Ein Talent mit hohem Potenzial muss noch kein starker aktueller Profi sein. Persönliche Entwicklung und Trainerrolle bleiben getrennt; konkrete neue Trainingsregeln sind noch offen.

Die Qualitätsgruppen und Profilvarianten benötigen eigene reproduzierbare Zufallsziehungen aus stabilen Kennungen. Neue Welten bekommen einen klaren Erzeugungsstand; alte Spieler erhalten weder neue Repertoires noch neue Fähigkeitserzeugung. Kein dauerhaftes Parallelmodell für nachberechnete alte Partien.

## Beispiele für zusammenhängende Rollenrepertoires

| Fähigkeitsprofil | Plausible Rollen im Entwurf | Erforderliche Abgrenzung |
| --- | --- | --- |
| Abschlussorientiert, gutes Stellungsspiel und ausreichende Ballbehauptung/Ablage | Torjäger; zusätzlich Zielspieler, wenn Technik und Passspiel dazu passen | Torjäger allein garantiert keine Ablagequalität; Luftspiel für geeignete hohe Zuspiele prüfen. |
| Abschlussorientiert, schnelle Raumwahrnehmung und passende Laufqualität | Stoßstürmer und Torjäger | Tiefenläufe benötigen Vorbereitung und Abseitsprüfung; keine Gratisgeschwindigkeit. |
| Defensiver Zugriff und sinnvolle Absicherung | Stopper; gegebenenfalls Ausputzer | Nicht automatisch Dribbler ergänzen; defensiver Zweikampf ersetzt keine Balltechnik. |
| Gutes Passspiel, Orientierung und passende Unterstützung | Spielmacher; gegebenenfalls ballspielender Verteidiger bei tatsächlich spielbarer Abwehrposition | Eine passende Nachbarposition und defensive Grundlagen müssen vorhanden sein. |

Nur das Prinzip zusammenhängender Rollen und die Nutzerbeispiele sind bestätigt. Die vollständige Kombinationsliste, Schwellen, Anzahl geeigneter Rollen und Behandlung außergewöhnlich vielseitiger Spieler bleiben offen.

## Qualität und langfristige Abnahme

### Positionsumfang und Mannschaftsgröße

Der bisherige Matchstand verwendet fünf Feldspieler und einen Tormann pro Team. Für den geplanten Ausbau sind fünf und sechs Feldspieler plus Tormann als wählbare Varianten bestätigt, unabhängig von aktueller oder größerer Spielfläche. Nach neuer Nutzerkorrektur verwenden beide vier Positionsprofile: Tormann, Verteidiger, Mittelfeld und Stürmer. Die früheren Kataloge mit acht beziehungsweise sechs Profilen sind damit ersetzt. Keine eigenständigen Positionen Defensives/Zentrales/Offensives Mittelfeld, Außenverteidiger oder Flügel; Positionsgewichte und Mittelwertberechnung sind inzwischen bestätigt, noch keine Laufzeitänderung.

Die Abwehrposition heißt im bestätigten Katalog Verteidiger. Flügelspieler bleibt eine taktische Rolle für geeignete Spieler aus Mittelfeld oder Angriff. Die Rollenzuweisung erzeugt keine neue Stammposition. Mittelfeldspieler können unterschiedliche defensive oder offensive Fähigkeitsprofile und passende Rollenrepertoires besitzen, behalten aber dieselbe Position Mittelfeld. Keine automatische Trainerrolle durch Erzeugung oder Stammposition. Position und taktische Rolle bleiben getrennt; nicht jede verfügbare Position muss in einer Aufstellung besetzt werden. Seitliche Einsatzräume sind unabhängig von der Zahl der Positionsprofile zu behandeln. Bestätigter Geltungsbereich: Mannschaftsgröße und Platzgröße werden vorerst beim Karrierestart für die ganze Welt festgelegt. Neue Kader werden nach diesen gemeinsamen Rahmenbedingungen erzeugt. Positionsgewichte und Mittelwertberechnung sind bestätigt. Als Nächstes Qualitätsgrenzen, mögliche zusätzliche Anforderungen und Zielhäufigkeiten abstimmen.

### Positionsqualität

Bestätigte Grundlage: Elitequalität ergibt sich aus der Gesamtheit der Fähigkeiten für eine Position. Das gesamte positionsbezogene Fähigkeitsprofil wird beurteilt; einzelne Spitzenwerte oder eine herausragende Eignung für nur eine taktische Rolle sind keine ausreichende Definition. Positionsqualität und Rolleneignung bleiben getrennt: Der Trainerauftrag kann wechseln, ohne dadurch die grundsätzliche Positionsqualität neu festzulegen. Der frühere Vorschlag einer rollenbezogenen Eliteklassifikation ist damit ersetzt.

Bestätigt ist die positionsabhängige Gewichtung aller relevanten Fähigkeiten. Beispielsweise zählt Abschluss beim Stürmer stärker als Zweikampf, beim Verteidiger zählt Zweikampf stärker als Abschluss. Technik, körperliche und geistige Fähigkeiten tragen zum jeweiligen Gesamtbild bei. Die Bewertung berücksichtigt Schwächen und die Breite des Könnens; eine einzelne Spitzenfähigkeit ersetzt kein starkes Gesamtprofil. Die Gewichte für Tormann, Verteidiger, Mittelfeld und Stürmer sind bestätigt. Der gewichtete arithmetische Mittelwert ist als Berechnungsformel bestätigt. Die Stärke der zusätzlichen Berücksichtigung von Schwächen und mögliche Mindestanforderungen bleiben offen.

Bestätigt ist die Trennung von dauerhafter Positionsqualität und aktueller Matchleistung. Die Positionsqualität wird aus den gespeicherten Grundfähigkeiten berechnet. Form und Frische verändern diese Bewertung nicht; sie wirken auf die aktuelle Leistung im Match. Ein müder Elite-Spieler behält damit seine grundsätzliche Qualitätsbewertung. Dauerhafte Entwicklung der Grundfähigkeiten kann die Positionsqualität verändern. Die Bewertung des möglichen späteren Potenzials bleibt davon getrennt.

#### Bestätigt: Gewichte für Tormann

Die folgende Gewichtung ist bestätigt. Sie beschreibt die allgemeine Positionsqualität, nicht die Erfolgschance einer einzelnen Aktion. Die Eignungen für Linientormann und mitspielenden Tormann werden gesondert bewertet; eine Trainerrolle verändert die allgemeine Positionsbewertung nicht.

| Grundfähigkeit | Bestätigtes Gewicht |
|---|---:|
| Tormannspiel | 40 % |
| Stellungsspiel | 12 % |
| Antizipation | 10 % |
| Ruhe | 10 % |
| Entscheidungen | 8 % |
| Passspiel | 5 % |
| Technik | 4 % |
| Geschwindigkeit | 3 % |
| Kondition | 3 % |
| Körperkraft | 3 % |
| Luftspiel | 1 % |
| Zweikampf | 1 % |
| Abschluss | 0 % |
| **Summe** | **100 %** |

Damit entfallen 40 Prozent auf Tormannspiel, 40 Prozent auf Stellungsspiel und geistige Fähigkeiten sowie 20 Prozent auf unterstützende Fähigkeiten. Tormannspiel umfasst die tormannspezifischen Parade-, Sprung- und Fangfähigkeiten. Luftspiel beschreibt hier tatsächliche Kopfballaktionen, etwa außerhalb des Strafraums; dieselbe Sprungfähigkeit wird nicht nochmals als Luftspiel belohnt. Abschluss hat für die allgemeine Tormannqualität kein Gewicht. Körpergröße bleibt eine getrennte Eigenschaft; ein direkter Qualitätsbonus dafür ist mit der Bestätigung der Fähigkeitsgewichte nicht beschlossen.

Als Berechnungsgrundlage ist der gewichtete arithmetische Mittelwert bestätigt. Ob und wie wichtige Schwächen zusätzlich berücksichtigt werden, bleibt offen; die Tabelle allein legt noch keine Elitegrenze oder Mindestanforderung fest. Exakte Werte und Berechnungen bleiben intern, im Produkt erscheinen weiterhin nur Farbstufen. Die geplante Berechnung gilt ausschließlich für neue Vereinswelten; keine Umrechnung vorhandener Spielstände.

#### Bestätigt: Gewichte für Verteidiger

Die folgende Gewichtung ist bestätigt. Sie beschreibt das allgemeine Verteidigerprofil unabhängig vom Trainerauftrag. Die Eignung für einzelne Rollen wie Stopper wird gesondert beurteilt.

| Grundfähigkeit | Bestätigtes Gewicht |
|---|---:|
| Zweikampf | 20 % |
| Stellungsspiel | 18 % |
| Antizipation | 12 % |
| Entscheidungen | 10 % |
| Körperkraft | 10 % |
| Geschwindigkeit | 8 % |
| Luftspiel | 7 % |
| Passspiel | 5 % |
| Technik | 4 % |
| Kondition | 3 % |
| Ruhe | 2 % |
| Abschluss | 1 % |
| Tormannspiel | 0 % |
| **Summe** | **100 %** |

Zweikampf, Stellungsspiel, Antizipation und Entscheidungen tragen zusammen 60 Prozent bei. Körperkraft und Geschwindigkeit unterstützen das Verteidigen von Kontakten und Tiefenläufen. Luftspiel, Ballbehandlung und Passspiel ergänzen das Gesamtprofil. Ein Verteidiger kann dadurch unterschiedliche Stärken haben, ohne allein durch Körperkraft oder Zweikampf als komplett zu gelten. Die Gewichte legen keine Aktionswahrscheinlichkeiten fest und ersetzen keine gesonderte Bewertung wichtiger Schwächen.

#### Bestätigt: Gewichte für Mittelfeld

Die folgende Gewichtung ist bestätigt. Sie beschreibt die gemeinsame Position Mittelfeld in beiden Mannschaftsvarianten. Defensive, zentrale, offensive und seitliche Aufgaben werden weiterhin durch Rollen und Taktik getrennt; die Tabelle führt keine zusätzlichen Stammpositionen ein.

| Grundfähigkeit | Bestätigtes Gewicht |
|---|---:|
| Passspiel | 18 % |
| Technik | 14 % |
| Entscheidungen | 12 % |
| Antizipation | 10 % |
| Stellungsspiel | 10 % |
| Kondition | 8 % |
| Zweikampf | 8 % |
| Geschwindigkeit | 6 % |
| Ruhe | 5 % |
| Körperkraft | 4 % |
| Abschluss | 3 % |
| Luftspiel | 2 % |
| Tormannspiel | 0 % |
| **Summe** | **100 %** |

Passspiel und Technik tragen zusammen 32 Prozent bei, Stellungsspiel und geistige Fähigkeiten 37 Prozent. Kondition und Zweikampf berücksichtigen Laufarbeit und Mitarbeit gegen den Ball. Die Bewertung beschreibt ein breites Mittelfeldprofil; ein offensiver oder defensiver Spezialist kann eine hohe Eignung für seine Trainerrolle haben, ohne in allen Bereichen dieselbe allgemeine Positionsqualität zu erreichen. Die Rolleneignungen benötigen eigene Gewichte. Die Tabelle legt keine Aktionswahrscheinlichkeiten fest; Form und Frische bleiben von der Positionsqualität getrennt.

#### Bestätigt: Gewichte für Stürmer

Die folgende Gewichtung ist bestätigt. Sie beschreibt die allgemeine Stürmerqualität, unabhängig von der zugewiesenen Trainerrolle. Torjäger, Stoßstürmer und Zielspieler behalten gesonderte Rolleneignungen.

Der Nutzer hat die Bedeutung von Passspiel und Ruhe zusätzlich hervorgehoben. Passspiel soll bei der allgemeinen Stürmerqualität spürbar zählen, etwa für Ablagen, Doppelpässe und das Auflegen von Chancen. Bestätigt sind 8 Prozent Passspiel und nach weiterer Abstimmung 12 Prozent Ruhe. Zum Ausgleich gegenüber der vorherigen Tabelle sinken Technik auf 9 Prozent, Geschwindigkeit auf 7 Prozent und Luftspiel auf 4 Prozent; Abschluss bleibt bei 20 Prozent. Die übrigen Gewichte bleiben unverändert.

| Grundfähigkeit | Bestätigtes Gewicht |
|---|---:|
| Abschluss | 20 % |
| Stellungsspiel | 12 % |
| Antizipation | 12 % |
| Ruhe | 12 % |
| Technik | 9 % |
| Entscheidungen | 8 % |
| Passspiel | 8 % |
| Geschwindigkeit | 7 % |
| Körperkraft | 5 % |
| Luftspiel | 4 % |
| Kondition | 2 % |
| Zweikampf | 1 % |
| Tormannspiel | 0 % |
| **Summe** | **100 %** |

Abschluss erhält mit 20 Prozent das größte Einzelgewicht. Stellungsspiel, Antizipation, Ruhe und Entscheidungen tragen zusammen 44 Prozent bei: Chancen erkennen, sich freilaufen und unter Druck sinnvoll abschließen zählen zum Gesamtprofil. Passspiel unterstützt das Zusammenspiel mit Mitspielern. Körperkraft und Luftspiel ergänzen Ballbehauptung und Kopfballaktionen; sie bestimmen nicht allein die allgemeine Stürmerqualität. Der Stoßstürmer soll entsprechend der bestätigten Rollenvorgabe auch Tiefenläufe antizipieren. Welche Gewichte diese Fähigkeit in seiner Rolleneignung erhält, bleibt gesondert abzustimmen. Die Positionsgewichte sind keine Aktionswahrscheinlichkeiten und ersetzen keine Prüfung wichtiger Schwächen oder der tatsächlichen Spielsituation.

#### Bestätigt: Ruhe beim Stürmer

Der Nutzer betont zusätzlich, dass Ruhe sehr wichtig ist, und bestätigt ihre Erhöhung auf 12 Prozent im Stürmerprofil einschließlich der oben ausgewiesenen Ausgleichsänderungen. Ruhe zählt damit ebenso stark wie Stellungsspiel und Antizipation. Ruhe beschreibt die Ausführung unter tatsächlichem Gegner- und Zeitdruck; Entscheidungen betreffen die Wahl der Aktion. Die Gewichte anderer Positionen werden dadurch nicht verändert.

Das Positionsgewicht beschreibt die Qualitätsbewertung, nicht einen zusätzlichen pauschalen Erfolgsfaktor im Match. Die geplante Wirkung von Ruhe unter Druck und ihr bestätigter nichtlinearer Müdigkeitseffekt bleiben getrennte Teile des Matchmodells; dieselbe Wirkung nicht mehrfach auf eine Aktion anwenden. Die gewichtete arithmetische Mittelwertformel ist inzwischen bestätigt.

#### Bestätigt: Berechnung der Positionsqualität

Die Gewichte aller vier Positionen sind bestätigt. Als gemeinsame Berechnungsgrundlage ist der gewichtete arithmetische Mittelwert bestätigt. Jeder gespeicherte Grundwert wird mit seinem Positionsgewicht multipliziert, anschließend werden die Beiträge addiert und durch 100 geteilt. Fähigkeiten mit Gewicht 0 leisten keinen Beitrag. Form und Frische werden nicht in diese Rechnung eingesetzt.

`Positionsqualität = Summe(Grundfähigkeit × Positionsgewicht in Prozent) / 100`

Die Rechnung behält intern Nachkommastellen. Bei Grundfähigkeiten auf der Skala 1–20 liegt auch der Mittelwert auf dieser Skala. Eine einzelne starke Fähigkeit verbessert die Bewertung entsprechend ihrem Gewicht; schwache relevante Fähigkeiten senken den Mittelwert. Beispiel für einen Stürmer: Sind alle berücksichtigten Grundfähigkeiten 8 und nur Abschluss 20, ergibt sich 10,4. Sind alle berücksichtigten Grundfähigkeiten 14, ergibt sich 14. Damit ersetzt ein einzelner Spitzenwert kein breites hohes Fähigkeitsprofil.

Beispiel für das bestätigte Ruhegewicht von 12 Prozent: Sind die übrigen berücksichtigten Stürmerfähigkeiten jeweils 14, ergibt Ruhe 5 eine Positionsqualität von 12,92 und Ruhe 15 eine Positionsqualität von 14,12. Das zeigt ausschließlich die Wirkung im bestätigten Qualitätsmittelwert; es ist keine Berechnung einer Abschlusserfolgsquote unter Druck.

Die interne Eliteklassifikation ist bestätigt: Mindestens 16 Positionsqualität auf der besten im Profil spielbaren Position reicht aus, ohne zusätzliche Mindestwerte einzelner Fähigkeiten. Zielhäufigkeiten bleiben offen. Aktuelles Können und mögliches späteres Potenzial werden weiterhin getrennt betrachtet. Im Produkt bleiben Fähigkeiten und Eignungen ausschließlich Farbstufen; die Farbstufen selbst werden nicht verändert, um hohe Werte bloß weniger auffällig darzustellen. Keine Laufzeitänderung oder Umrechnung vorhandener Spielstände.

#### Bestätigt: Mindestgrenze für Elitequalität

Bestätigt ist eine interne Positionsqualität von mindestens 16 auf der Skala 1–20 als notwendige Voraussetzung für Elitequalität. Sie bezieht sich auf den gewichteten Mittelwert der erreichten Grundfähigkeiten; nicht jede Einzelfähigkeit muss mindestens 16 betragen. Keine Rundung vor dem Vergleich: 15,99 unterschreitet die bestätigte Grenze.

Die Qualitätsgrenze 16 auf der besten im Profil spielbaren Position ist inzwischen als ausreichendes internes Elitekriterium bestätigt; zusätzliche Mindestwerte einzelner Fähigkeiten entfallen. Die angestrebte Elitehäufigkeit bleibt gesondert abzustimmen, ohne feste Erzeugungsquote durch diese Klassifikation. Erreichte Elitequalität und mögliches späteres Elitepotenzial werden getrennt betrachtet; ein talentierter Jugendspieler wird nicht allein wegen seines Potenzials als bereits elitestark eingeordnet. Die Grenze allein garantiert auch keine seltenen Elite-Jugendspieler; hierfür müssen Erzeugung und Entwicklung kalibriert und gemessen werden. Keine Änderungen an den Farbstufen oder vorhandenen Spielständen.

Vor Umsetzung die gegenwärtige Baseline mit einer breiteren Seedstichprobe ergänzen. Nach Umsetzung denselben Umfang vergleichen: Rolle, Position, Verein, Qualitätsgruppe, Fähigkeitsschwächen, Alter und aktuelle Qualität gegenüber Potenzial. Vereinsprofile müssen erkennbare Kaderunterschiede erzeugen, ohne alle Profis eines Vereins gleich stark zu machen. Unpassende Rollenpaare dürfen nicht als regulärer Zufall entstehen.

Startkader, freie Spieler, Nachwuchs und Ersatz der reinen Simulationsteams müssen gemeinsam geprüft werden. Mehrere simulierte Saisons untersuchen, ob Potenziale, Ersatzgenerierung und Einsatzentwicklung wieder zu einer wachsenden Häufung außergewöhnlicher Fähigkeiten führen. Vergleich der Matchbalance und Vereinswirtschaft gehört zur Freigabe; keine alten Werte oder Ergebnisse verändern, um Verteilungen anzugleichen.

Die Tests beweisen getrennt: identische Erstellung bei gleichen Seeds und Vereinsprofilen, unterschiedliche sinnvolle Kader bei verschiedenen Seeds, keine unabhängige Rollenzuteilung, passende Rollen vor erstem Einsatz sichtbar und unveränderte vorhandene Spielstände. Genaue Zielanteile werden erst nach Nutzerentscheidung und Messung festgelegt.

## Bestätigt: Normale Startqualität mit 17 Jahren

Neu erzeugte 17-jährige Jugendspieler starten bestätigt überwiegend mit interner Positionsqualität 7 bis 10 als normalem Startbereich. Die Referenz bezieht sich auf die primäre spielbare Position und deren bestätigten gewichteten Mittelwert der Grundfähigkeiten; sie gilt nicht als Wertebereich jeder einzelnen Fähigkeit.

Ein zusammenhängendes Spielerprofil darf deshalb ausgeprägte Einzelstärken oberhalb des Bereichs und Schwächen darunter haben. Beispielsweise kann Abschluss 12 zu einem insgesamt noch deutlich schwächeren jungen Stürmer passen. Konkrete Profile müssen anhand aller Positionsgewichte geprüft werden; der Einzelwert legt keine Gesamtqualität fest.

Die genaue Häufigkeit des Normalbereichs, die Verteilung innerhalb des Bereichs und seltene stärkere beziehungsweise schwächere Profile bleiben abzustimmen. Die bestätigte Elite-Mindestgrenze 16 und das Ziel seltener Elite-Jugendspieler werden dadurch nicht geändert. Die Übertragung auf andere Altersstufen und die genauen Gewichte der Vereins- und Jugendarbeitsabstufungen sind noch zu planen; die grundsätzliche Jugendarbeitswirkung auf die aktuelle Startqualität ist bestätigt.

Startqualität beschreibt das bereits vorhandene Können. Hintergrundtalent, individuelle Potenzialgrenzen und tatsächlich realisierte Entwicklung bleiben getrennte Bestandteile. Es werden weder neue automatische Rollen noch zusätzliche Talentwirkungen auf Fähigkeitsobergrenzen beschlossen. Produktansichten zeigen weiterhin nur Farbstufen. Keine Laufzeitänderung und keine Umrechnung alter Spielstände.

## Bestätigt: Jugendarbeit gewichtet die Startqualität

Die aktuelle Startqualität neuer Jugendspieler wird bestätigt anhand der Jugendarbeit im Vereinsprofil gewichtet. Schwache Jugendarbeit erzeugt häufiger Profile am unteren Ende des normalen Bereichs, durchschnittliche Jugendarbeit nutzt den Bereich ohne zusätzlichen Schwerpunkt und starke Jugendarbeit erreicht häufiger den oberen Bereich sowie etwas öfter seltene stärkere Startprofile.

Dies sind Wahrscheinlichkeiten, keine harten Mindest- oder Höchstwerte je Verein und keine Elitegarantie. Einzelne Ausnahmen bleiben bei jeder Jugendarbeitsstufe möglich; genaue Gewichte und Häufigkeiten sind später zu kalibrieren. Aktuelle Mannschaftsstärke und Jugendarbeit bleiben getrennte Merkmale. Der Beschluss betrifft das bereits vorhandene Können bei Erstellung; die bestätigte Hintergrundtalentverteilung und ihre Akademieauswahlfaktoren bleiben getrennt maßgeblich. Keine neuen Talentwirkungen auf Fähigkeitsobergrenzen und keine automatische neue Rollenvergabe. Keine Laufzeitänderung oder Anpassung alter Spielstände.

## Bestätigt: Beste spielbare Position für die Elite-Mindestgrenze

Bei Spielern mit mehreren im Profil als spielbar geführten Positionen zählt die höchste interne Positionsqualität dieser Positionen für die notwendige Elite-Mindestgrenze 16. Eine Nebenposition kann die Qualitätsgrenze erfüllen, auch wenn die Hauptposition darunterliegt. Nur für taktische Einsätze erlaubte fremde Positionen zählen für diese Einordnung nicht.

Die Positionsqualitäten bleiben gewichtete Mittelwerte der erreichten Grundfähigkeiten, unabhängig von Form, Frische, Routine, Trainerrolle und verborgenem Talent. Kein Mittelwert über verschiedene Positionen und keine Mindestqualität auf jeder Position. Hauptposition, empfohlene Rollen und Farbstufen ändern sich dadurch nicht automatisch. Die Qualitätsgrenze ist inzwischen als ausreichendes internes Elitekriterium ohne zusätzliche Einzelfähigkeitsgrenzen bestätigt. Zielhäufigkeiten bleiben getrennt offen. Keine Laufzeitänderung oder Anpassung alter Spielstände.

## Bestätigt: Elitequalität ohne zusätzliche Einzelfähigkeitsgrenzen

Positionsqualität von mindestens 16 auf der besten im Profil spielbaren Position ist das ausreichende Qualitätskriterium für die interne Eliteeinordnung. Keine zusätzlichen Mindestwerte für einzelne Fähigkeiten: Individuelle Stärken und Schwächen bleiben auch bei Eliteprofilen möglich. Zusammenhängende Fähigkeitsprofile werden weiterhin bei der Erzeugung sichergestellt; die Qualitätsklassifikation ersetzt diese Prüfung nicht.

Erreichte Elitequalität bleibt vom verborgenen Talent und künftigem Potenzial getrennt. Seltene Elite-Jugendspieler und die Häufigkeit in der gesamten Datenbank müssen weiterhin durch Erzeugungsverteilungen und Entwicklungstests abgesichert werden. Keine neue sichtbare Elitekennzeichnung, Laufzeitänderung oder Anpassung alter Spielstände durch diesen Beschluss.

## Bestätigt: Vereinsstärke gewichtet unterschiedliche Kaderqualitäten

Die Vereinsstärke gewichtet die Qualitätsverteilung neuer Startkader: Spitzenvereine erhalten häufiger gute und sehr gute Spieler, durchschnittliche Vereine überwiegend solide Spieler und schwächere Vereine überwiegend niedrigere Qualitäten. Jeder Kader behält individuelle Abstufungen, einschließlich schwächerer Ergänzungsspieler bei starken Vereinen. Auch schwächere Vereine können einzelne außergewöhnliche Spieler erhalten, ohne Pflicht zu einem Elitespieler je Verein.

Qualität wird pro Spieler in einem zusammenhängenden Fähigkeitsprofil erzeugt, statt sämtliche Fähigkeiten aller Spieler eines Vereins gemeinsam anzuheben. Vereinsspezifische Altersstruktur und finanzierbare Kadertiefe sind weiterhin zu berücksichtigen; genaue Verteilungen und Zahlen werden später kalibriert. Jugendarbeit steuert den gesonderten Nachwuchsweg. Dieser Beschluss betrifft neue Vereinswelten, keine bestehenden Kader oder Spielstände; noch keine Laufzeitänderung.

## Bestätigt: Begrenzte, plausible Positionsvielseitigkeit bei Feldspielern

Neu erzeugte Feldspieler erhalten gewöhnlich eine Hauptposition und höchstens eine passende Nebenposition. Seltene vielseitige Ausnahmen können alle drei Feldpositionen Verteidiger, Mittelfeld und Stürmer als spielbar führen. Eine Nebenposition ist keine Pflicht und wird aus dem zusammenhängenden Fähigkeitsprofil abgeleitet, ohne unabhängigen Zufallswurf oder automatisches Auffüllen.

Plausible typische Kombinationen sind Verteidiger/Mittelfeld und Mittelfeld/Stürmer. Die Vergabe muss anhand geeigneter Fähigkeiten erfolgen; eine einzelne Spitzenfähigkeit oder der Mittelwert allein genügt nicht. Genaue Häufigkeiten und Eignungsschwellen bleiben zum späteren Feintuning offen. Das betrifft Profilpositionen, nicht die weiterhin mögliche Trainerzuweisung auf fremden Einsatzpositionen mit Bewertung ihrer tatsächlichen Fähigkeitseignung und vorhandenen Routine. Tormänner erhalten bestätigt ausschließlich die Profilposition Tormann. Keine Tormann-/Feldspieler-Kombinationen bei Erstellung; mitspielender Tormann ist eine taktische Rolle und keine zusätzliche Feldposition. Das spätere Erlernen zusätzlicher Profilpositionen ist verworfen; die bei Erstellung festgelegten Haupt- und Nebenpositionen bleiben dauerhaft erhalten, unabhängig vom Routineaufbau auf fremden Einsatzpositionen. Keine Laufzeitänderung oder Anpassung alter Spielstände.

## Bestätigt: Tormann als einzige Profilposition

Neu erzeugte Tormänner erhalten ausschließlich die Profilposition Tormann, ohne Verteidiger, Mittelfeld oder Stürmer als Nebenposition. Tormann-/Feldspieler-Kombinationen werden nicht erzeugt. Mitspielender Tormann und Linientormann bleiben Trainerrollen derselben Position. Passspiel, Technik und Entscheidungen können den Aufbau eines mitspielenden Tormanns unterstützen, ohne ihm eine zusätzliche Profilposition zu geben. Die bereits bestätigte dauerhafte Festlegung der Profilpositionen bleibt maßgeblich; keine neue Regel zur taktischen Verschiebung oder zum Tormanntausch durch diesen Beschluss. Keine Laufzeitänderung oder Anpassung alter Spielstände.

## Bestätigt: Profilabhängige persönliche Fähigkeitsgrenzen

Persönliche Fähigkeitsgrenzen werden bei der Spielererstellung passend zum zusammenhängenden Spielerprofil erzeugt. Prägende Stärken können höhere Grenzen erhalten, schwächere oder profilferne Fähigkeiten niedrigere; nicht jeder Spieler kann jede Fähigkeit bis 20 entwickeln. Beispielsweise kann ein Torjäger hohe Grenzen für Abschluss, Antizipation und Ruhe und niedrigere für Zweikampf haben. Das Beispiel legt weder Pflichtstärken für jede Rolle noch konkrete Grenzwerte fest. Der Trainerauftrag selbst verändert die Grenzen nicht.

Erreichte Grundfähigkeiten, persönliche Grenzen und realisierter Zuwachs bleiben getrennt. Hintergrundtalent steuert weiterhin die bestätigte Entwicklungsmenge; eine zusätzliche direkte Erhöhung aller Fähigkeitsgrenzen durch Talent ist nicht beschlossen. Grenzen bleiben gemäß Entwicklungsplan fest, mindestens auf Höhe des jeweiligen Startwerts und innerhalb der Fähigkeitsskala. Ihre genauen Verteilungen und Zusammenhänge mit den Startprofilen werden später anhand von Erzeugungs- und Entwicklungstests abgestimmt, ohne Elitegarantie durch hohe Grenzen. Exakte Werte bleiben intern; keine neue Produktanzeige durch diesen Beschluss. Nur Planung für neue Vereinswelten, keine Laufzeitänderung oder Anpassung alter Spielstände.

## Rechenbeispiel zur Startqualität 10

Auf Nutzerfrage ist ein [Stürmerbeispiel mit sechs vollen Spielen je Saison](stuermer-sechs-spiele-entwicklung.md) berechnet: erstellt mit 17, gewichtete Positionsqualität 10, mittlerer Talentwert 16 und durchgehend gute Noten. Die bestätigten Raten ergeben bis zum Beginn der Saison mit 24 insgesamt 14,15 verteilte Fähigkeitspunkte; mit ausdrücklich illustrativer Lernverteilung steigt die Positionsqualität auf 11,76. Der Nutzer akzeptiert den gezeigten Verlauf inzwischen als vorläufige Arbeitsgrundlage; Feintuning erfolgt später. Dies legt keine neuen Rollenlerngewichte oder Häufigkeiten des vorgeschlagenen normalen Startbereichs 7–10 fest.

## Noch offene einzelne Entscheidungen

Das Entwicklungstempo des konkreten [Jugendspielerbeispiels](beispiel-jugendspieler-entwicklung.md) mit ungefähr 19 Gesamtpunkten über vier volle Saisons und zwölf Fähigkeiten ist als Planungsgrundlage bestätigt. Vier bis sechs Punkte pro früher Stammsaison bleiben ein Kalibrierungsvorschlag, keine garantierte Gutschrift. Individuelle Obergrenzen, konkrete Entwicklungsregeln und Rollenformeln bleiben Entwurf; Beispielstruktur und Summen wurden rechnerisch geprüft. Keine Änderung des bestehenden Wachstumswegs.

- Welche zusätzlichen Mindestanforderungen gelten für Elite und wie selten soll Elite in der neu erzeugten Vereinswelt sein? Die Gewichte aller vier Positionen, der gewichtete Mittelwert und die Mindestgrenze 16 für Elite sind bestätigt.
- Welche konkreten Verteilungsgewichte und weiteren Anpassungen beeinflussen die Jugendentwicklung? Bestätigt sind das minutengewichtete Dreierfenster, die Notengrenzen 6,5 für Wachstum und 5,5 für möglichen kleinen Rückgang sowie die positive Basislernmenge von insgesamt 0,5 Entwicklungspunkten je qualifiziertem 90-Minuten-Einsatz. Rückgang setzt drei einzeln schwache bewertete Einsätze voraus; der Basisrückgang von insgesamt 0,1 Punkten je qualifiziertem 90-Minuten-Einsatz ist ebenfalls bestätigt. Rolle und tatsächliche Spielaktionen bestimmen bestätigt die Fähigkeitsauswahl. Interne Fähigkeitsbruchteile sind ebenfalls bestätigt. Konkrete Verteilungsgewichte, Speicherpräzision, Alters-/Potenzialanpassungen und genaue Verrechnung im [Notenentwicklungsplan](jugendentwicklung-noten-plan.md) offen.
- Wie lange soll ein regelmäßig eingesetztes Talent bis zur Nähe seines persönlichen Potenzials brauchen, und wie stark darf der Europacup die Entwicklung beschleunigen?
- Welche Eignungsschwellen und Häufigkeiten erzeugen die bestätigte Größenordnung von meist einer besten Rolle mit bis zu zwei sinnvollen Alternativen pro spielbarer Position und seltenen vielseitigen Ausnahmen? Keine Mindestzahl mit unpassenden Rollen auffüllen; Anzahl aus dem zusammenhängenden Fähigkeitsprofil ableiten. Automatisch veränderte Rollenempfehlungen bei dauerhafter Entwicklung oder Alterung sind verworfen. Eignungsfarbstufen anhand dauerhafter Grundfähigkeiten aktualisieren und Positionseingespieltheit in die Farbe einbeziehen ist bestätigt; Form und Frische ändern diese grundsätzliche Eignungsanzeige nicht kurzfristig. Genaue Kombination und Ausgangswerte außerhalb der Hauptposition bleiben offen. Eingespieltheit je tatsächlicher Einsatzposition durch kumulierte Einsatzminuten aufbauen und bei Rollenwechsel innerhalb derselben Position erhalten ist bestätigt. Bei Positionswechsel innerhalb der Partie Minuten anteilig zuordnen; auch kurze Einsätze zählen. Lernrate, Skala und Ausgangswerte außerhalb der Hauptposition bleiben offen. Der vollständige Erhalt vorhandener Positionsroutine bei Vereinswechsel ist bestätigt. Positionseingespieltheit wirkt im Match auf Laufwege, Timing und Abstimmung mit Mitspielern, getrennt von den gespeicherten Grundfähigkeiten, ist bestätigt. Genaue Wirkung und Gewichtung bleiben offen. Vorhandene Positionsroutine bleibt bei Vereinswechsel bestätigt vollständig beim Spieler erhalten. Aufgebaute Routine auch bei längerer Nichtnutzung einer Position dauerhaft erhalten, ohne eigenen Abzug durch Pausen, andere Einsatzpositionen oder Saisonwechsel, ist bestätigt. Neu erzeugte Spieler sind auf ihrer Hauptposition bestätigt von Beginn an vollständig eingespielt, auch Jugendspieler; eine Alters- und Erfahrungsstaffelung dort ist verworfen. Der Startwert entspricht der Obergrenze und bleibt dauerhaft erhalten. Bereits spielbare Nebenpositionen starten bestätigt mit Grundroutine unterhalb der Hauptposition, fremde Einsatzpositionen ohne Routine. Beide können durch tatsächliche Minuten bis zur gemeinsamen Obergrenze eingespielt werden; daraus entstehen nicht automatisch neue spielbare Positionen oder Rollen. Numerische Skala, Höhe und Verteilung der Grundroutine bleiben offen; keine nachträgliche Ausstattung alter Spielstände. Kein automatischer Wechsel des Trainerauftrags. Die beste Rolle innerhalb der festen Empfehlungen anhand dauerhafter Fähigkeiten und Positionsroutine neu hervorheben, ohne Empfehlungen hinzuzufügen oder zu entfernen, ist bestätigt. Form und Frische lösen keinen kurzfristigen Wechsel aus. Reihenfolge der übrigen Empfehlungen bleibt gesondert zu klären. Bei annähernd gleicher Eignung die bisher beste Rolle beibehalten und erst bei deutlichem Vorteil einer anderen vorhandenen Empfehlung wechseln ist bestätigt; genaue Schwelle offen. Rollen außerhalb des empfohlenen Repertoires sind bestätigt zuweisbar, jedoch nur in einer passenden Aufstellungszone; geringe Eignung allein sperrt die Auswahl dort nicht. Bewertung aus tatsächlichen Fähigkeiten und Routine auf der Einsatzposition, ohne neue Profilposition oder Rollenempfehlung durch die Zuweisung. Genaue Zonengrenzen und vollständige Rollenzuordnung bleiben offen. Wird die bisherige Rolle durch einen Zonenwechsel unzulässig, wird bestätigt automatisch eine zufällige in der Zielzone zulässige Rolle gewählt, ohne verpflichtende manuelle Auswahl. Die Auswahl ist nicht auf Profil-Empfehlungen beschränkt und ändert das feste empfohlene Repertoire nicht. Beim freien Verschieben wird die individuelle Ausrichtung bestätigt auf den Standard neutral zurückgesetzt, unabhängig davon, ob die Rolle erhalten bleibt oder automatisch wechselt. Der Erhalt der bisherigen Ausrichtung dabei ist verworfen. Beim Tausch besetzter Plätze bleibt die Ausrichtung weiterhin am Platz. Flügelspieler ist bestätigt ausschließlich in seitlichen Mittelfeld- und Angriffszonen links und rechts auswählbar, ohne neue Profilposition; genaue Zonengrenzen offen. Spielmacher, Abräumer und Box-to-Box-Spieler sind bestätigt ausschließlich in der zentralen Mittelfeldzone auswählbar, ohne getrennte defensive oder offensive Mittelfeldpositionen im Profil. Torjäger, Stoßstürmer und Zielspieler sind bestätigt ausschließlich in der zentralen Angriffszone auswählbar. Dribbler ist bestätigt in zentralen und seitlichen Angriffszonen links und rechts auswählbar, ohne neue Profilposition oder automatische Rollenempfehlung; keine zusätzliche Mittelfeldfreigabe durch diesen Beschluss. Ausputzer, Stopper und ballspielender Verteidiger sind bestätigt in der gesamten Abwehrzone zentral sowie links und rechts auswählbar, ohne zusätzliche Außenverteidigerposition oder -rolle. Im Mittelfeld und Angriff sind die mittleren 50 Prozent der Feldbreite als zentrale Auswahlzone und die äußeren 25 Prozent je Seite als seitliche Auswahlzonen bestätigt; relativ für beide Feldgrößen und Mannschaftsvarianten. Die Längsaufteilung ist bestätigt: Abwehr erste 30 Prozent, Mittelfeld mittlere 40 Prozent, Angriff letzte 30 Prozent vom eigenen Tor aus. Die eindeutige technische Grenzpunktkonvention steht im Rollen- und Agentenplan; keine harten Laufgrenzen. Ein erster geeigneter Druckspieler mit Absicherung der übrigen Spieler nach Ballverlust ist im Rollenplan bestätigt; gemeinsames Pressing nach Teamtaktik bleibt möglich. Abgestimmte kurze Anspielstationen, Tiefenläufe und Absicherung im eigenen Ballbesitz sind bestätigt, verteilt nach Rolle, Ausrichtung, Teamtaktik und Situation. Orientierung von Tiefenläufen am erkennbaren Passvorlauf und an der aktuellen Abseitslinie ist bestätigt; keine garantierte Abseitsvermeidung. Das Ändern vorbereiteter Pässe oder Schüsse vor dem ausführenden Ballkontakt bei relevanter Situationsänderung ist bestätigt, mit zeitlichem Aufwand statt sofortigem Richtungswechsel. Das Bevorzugen eines Direktabschlusses bei guter Chance nach Querpass oder erreichbarem Abpraller ist bestätigt, sofern Vorbereitung und Körperstellung passen. Ein bei Erstellung festgelegter und dauerhaft unveränderlicher bevorzugter Fuß ist bestätigt: Rechtsfuß, Linksfuß oder beidfüßig, im Profil als Eigenschaft. Vorbereitung und Genauigkeit bei Pässen und Schüssen variieren dadurch; schwächerer Fuß kann ungenauer ausführen, Umlegen kostet Zeit. Keine zusätzliche numerische Fähigkeit und keine automatische Änderung von Empfehlungen oder Auswahlzonen. Verteilung und genaue Wirkung bleiben offen. Situations- und fähigkeitsabhängige Qualität der Ballannahme ist bestätigt, einschließlich tatsächlich freier Bälle bei misslungener Kontrolle und bewusstem Mitnehmen in den Lauf als gesonderter sinnvoller Aktion. Situationsabhängige Abwehrwahl zwischen Stellen, Zweikampf im Stehen und Grätsche ist bestätigt, mit tatsächlichen Kontakten und bindender Bewegung. Situationsabhängige Tormannwahl zwischen Fangen und Abwehren ist bestätigt, mit freien Abprallern und weiter gültigen Handaktionsgrenzen. Der Einfluss von Spielstand und Restzeit auf das situative Risiko innerhalb von Teamtaktik, Rollenauftrag und individueller Ausrichtung ist bestätigt, ohne automatischen Wechsel der taktischen Einstellungen. Situationsabhängige Wahl von Kopfballabschluss, Ablage oder Klärung bei tatsächlich erreichbaren hohen Bällen ist bestätigt; bestätigte Größen- und Luftspielwirkung bleibt getrennt maßgeblich. Die Rückpassregel für Handaktionen des Tormanns einschließlich Ausnahmen ist im Rollenplan bestätigt. Der normale Jugend-Startbereich mit 17 Jahren ist nun separat bestätigt: überwiegend interne Positionsqualität 7 bis 10. Gewichtung der aktuellen Startqualität nach Jugendarbeit im Vereinsprofil ist bestätigt. Die beste im Profil spielbare Position als Bezug der notwendigen Elite-Mindestgrenze ist bestätigt. Elitequalität anhand dieser Positionsqualität ohne zusätzliche Mindestwerte für einzelne Fähigkeiten ist bestätigt. Die Vereinsstärke als Gewicht für individuell unterschiedliche Kaderqualitäten ist bestätigt. Begrenzte, aus dem Fähigkeitsprofil abgeleitete Positionsvielseitigkeit bei Feldspielern ist bestätigt. Tormänner ausschließlich mit Profilposition Tormann und ohne Tormann-/Feldspieler-Kombinationen bei Erstellung sind bestätigt. Profilpositionen bleiben bestätigt dauerhaft fest; zusätzliche Positionen durch Einsätze oder Fähigkeitsentwicklung zu erlernen ist verworfen. [Rollenplan](spieler-archetypen-plan.md).
- Die Auswahl außerhalb der Empfehlungen ist bestätigt, sofern die Aufstellungszone zur Rolle passt; nomineller Stürmer als Abräumer bleibt in passender Mittelfeldzone möglich. Bei in der Zielzone unzulässigem Rollenauftrag ist die automatische zufällige Wahl einer dort zulässigen Rolle bestätigt. Genaue Zonengrenzen, Zuordnung der Rollen und technische Zufallsausgestaltung sind noch zu spezifizieren.
- Welche Positionswechsel sind frei, welche erfordern passende Voraussetzungen, und wie wirkt langfristige Entwicklung auf neue Eignungen?
- Welche konkrete Datenstruktur trägt Rollen in Vorlagen und beim freien Verschieben? Bei Auswechslungen übernimmt der eingewechselte Spieler bestätigt zunächst den bisherigen Rollenauftrag. Beim Tausch zweier besetzter Plätze bleiben Rolle und individuelle Ausrichtung bestätigt am jeweiligen Taktikplatz. Beim Verschieben auf eine freie Stelle bleiben Spieler und Rolle bestätigt zusammen, soweit die Rolle in der Zielzone zulässig ist; Ausgangsposition und Raumvorschau passen sich an. Die konkrete Datenspeicherung und Positionszulässigkeit bleiben offen.

Verknüpfte Pläne: [Taktische Rollen und Darstellung](spieler-archetypen-plan.md), [mentale Fähigkeiten und Absichten](mentale-faehigkeiten-plan.md), [Ausbau und Parallelbearbeitung](match-ausbau-plan.md).
