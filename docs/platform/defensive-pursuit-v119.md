# Verfolgung bei tatsächlichem Durchbruch, Releasekandidat 119

Lokaler nativer Eingriff in `dist/world-football-flow-v159.js`, noch kein Live-Nachweis. Die Korrektur gilt ausschließlich für neu markierte physische Partien mit `attackFlow.paceRevision===119`. Bestehende gespeicherte Ziele/Ergebnisse werden beim Laden nicht umgerechnet.

## Bestätigte Ursache

Die vorherige lokale Pressingausnahme umging die gespeicherte defensive Lesepause und die Positionsbegrenzung nur bis sechs Meter Abstand. Bei acht Metern Abstand wurde wieder ein veraltetes Empfängerziel verwendet. Nach Ablauf dieser Lesepause blieb auch das neu berechnete Pressingziel innerhalb des zwölf Meter großen Radius um den Formationsanker. Wenn der Verteidiger selbst bereits außerhalb dieses Radius stand, zog das Ziel ihn vom durchgebrochenen Ballführer zurück.

Reproduzierbares Beispiel mit tatsächlichem Controller: Ballführer 14 Meter vor dem verteidigten Tor, nächster bereiter Verteidiger 22 Meter davor, Formationsanker 36 Meter davor. Das gespeicherte Empfängerziel lag bei 36 Metern; das frisch berechnete, aber begrenzte Pressingziel lag bei 24 Metern. Beide Richtungen führen vom Ball weg. Auch die nächste Abwehrgruppe bei einem bereits abgegebenen Zuspiel konnte durch diesen Anker zurückgezogen werden.

## Begrenzte Korrektur

`v119DefensiveThreat` erkennt ausschließlich öffentliche aktuelle Torgefahr: gegnerischer tatsächlicher Ballführer oder sichtbares abgegebenes Zuspiel zu einem erreichbaren Empfänger. Das Ziel liegt höchstens 30 Meter vor dem verteidigten Tor und höchstens 18 Meter seitlich von der Tormitte; nur die nächsten zwei bereiten Feldspieler mit höchstens 14 Metern Abstand zum Gefahrenpunkt dürfen die Positionsbegrenzung überwinden. Grätschende und noch erholende Spieler belegen diese Verfolgerplätze nicht.

Beim Ballführer bleibt das vorhandene, auf 0,12 Sekunden und beobachtete Geschwindigkeit begrenzte Ballziel maßgeblich. Beim Zuspiel wird das tatsächlich abgegebene Ziel abgefangen; höchstens 1,1 Sekunden Restflugzeit und ein tatsächlich dort erreichbarer Empfänger sind erforderlich. Die vorhandene Abseitsinformation eines Bodenpasses beziehungsweise Raumpasses verhindert die neue dringliche Verfolgung eines illegalen Empfängers. Ein entfernter, nicht angespielter Läufer erzeugt keine solche Ausnahme. Die übrige Formation, die vorhandene Rückkehr in die Position und der defensive Lesetakt bleiben bestehen.

Der eigentliche Controller `v157Target` bevorzugt das defensive Ziel vor `v162RecoverTarget`; diese Reihenfolge bleibt erhalten. `v157Move` führt die Bewegung mit vorhandener Beschleunigung, Körperausrichtung und Frische aus. Keine Teleports, neuen Zufallsziehungen, zusätzlichen Müdigkeitskosten oder garantierten Balleroberungen. Die neue Auswahl betrifft weder Zweikampf-Erfolg noch Schuss-Ergebnisse.

## Nachweis und Grenzen

`node work/test-defensive-pursuit-v119.cjs` verwendet den dokumentierten isolierten Edge-/Loopback-Prüfweg und die tatsächlich geladenen Produktionscontroller `v157Target → v159DefensiveTarget → v157Move`. Keine Unity-/Editor-/Gerätebedienung oder bestehende Browserprofile. Der unveränderte unmittelbar vorherige Zielcontroller ist unter `outputs/3d-quality/defensive-pursuit-v119/before-controller.js` eingefroren; er wird ausschließlich in der separaten Vergleichsseite eingesetzt.

56 Vergleichsszenen prüfen beide Mannschaften und beide Feldgrößen, jeweils vorher/nachher: Ballführer knapp außerhalb der bisherigen Ausnahme, gefährlicher Empfänger mit legalem Zuspiel, Abseits-Empfänger, nicht angespielter Läufer, entfernter Ballführer, erholender nächster Verteidiger und bestehender unmarkierter v162-Stand. Die negativen Fälle behalten den zwölf Meter großen Formationsradius; die tatsächlich bereiten Verfolger erhalten Vorrang vor Erholung. Während 0,75 Sekunden kontrollierter Bewegung gab es keine Zufallsziehung, Frischeänderung oder Teleports.

Im Standardfeld-Beispiel zog der alte Controller den Verteidiger von 22 auf 24,58 Meter Tordistanz zurück; der korrigierte Controller bewegt ihn auf 19,13 Meter. Der Abstand zum Ball sinkt dadurch von acht auf 5,13 Meter. Beim gefährlichen Zuspiel richtet er sich auf den tatsächlichen Gefahrenpunkt zehn Meter vor dem Tor aus; der vorhandene Laufcontroller verkürzt den Abstand zum aktuell fliegenden Ball von vier auf 1,13 Meter. Diese Bewegungsmessung garantiert keine spätere Balleroberung.

Ergebnisse und eingefrorene Quell-/Abhängigkeitshashes stehen in `outputs/3d-quality/defensive-pursuit-v119/native.json`. Syntax- und CRLF-bewusste Diffprüfung bestehen. Der frühere vollständige native v119-Nachweis muss nach dieser absichtlichen Änderung und der getrennten Halbzeitkorrektur erneut laufen; keine Behauptung unveränderter alter Matchdigests oder einer bereits erfolgten Geräte-/Live-Abnahme.
