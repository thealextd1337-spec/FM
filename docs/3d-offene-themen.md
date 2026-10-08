# Offene Themen für das physische Match und die 3D-Darstellung

Stand: 5. Oktober 2026. Balleffet bleibt geplant; Raumpässe sind lokal in v150 umgesetzt und geprüft, noch nicht veröffentlicht. Die Regeln gelten für die gemeinsame physische Vereinswelt-Simulation in 2D und 3D.

## Balleffet

Schüsse, Flanken und geeignete Pässe sollen gezielt angeschnitten werden können. Seitlicher Drall krümmt die Flugbahn; Topspin und Rückwärtsdrall können später auch Flug und Aufspringen beeinflussen. Eine sichtbare Drehung des Ballmodells allein genügt dafür nicht.

- Technik beeinflusst die kontrollierte Drallerzeugung; Abschluss bestimmt die Schussausführung, Passspiel die Ausführung von Pässen und Flanken. Starker Effet darf nicht automatisch mehr Präzision oder höhere Torwahrscheinlichkeit bedeuten.
- Fuß, Körperstellung, tatsächlicher Kontakt, Tempo, Distanz und Gegnerdruck begrenzen, welcher Drall sinnvoll ausführbar ist. Taktik und Situation bestimmen, wann er versucht wird. Gute Spieler setzen ihn häufiger passend ein; schwache Spieler können ihn ebenfalls versuchen und ungenauer ausführen.
- Ballflug, Torwartprognose, Abfangwege, Tor-/Ausquerung und Rückschau müssen dieselbe gekrümmte Bahn verwenden. Die bisherigen geraden Passwegprüfungen benötigen dafür eine Anpassung.
- Drall nimmt im Flug beziehungsweise bei Boden- und Spielerkontakt ab oder verändert sich. Die Stärke und der Aufwand für Seiten-, Top- und Rückwärtsdrall sind vor Umsetzung getrennt festzulegen.

Abnahme: beide Angriffsrichtungen und Drallrichtungen, verschiedene Schuss-/Passdistanzen, plausible Energie nach Bodenkontakt, keine Richtungswechsel ohne Ursache, erreichbare Torwartkontakte und identische Ergebnisse/Zufallsfolgen in 2D, 3D und Offline. Anschließend Häufigkeit und Erfolg nach Spielerqualität vergleichen.

## Pässe in den freien Raum – lokal umgesetzt

[Umsetzung und Nachweise v150](raumpaesse-v150.md). Die folgenden Anforderungen beschreiben den vorgesehenen Umfang; freie Ziele, Balljagd, Kontaktentscheidung, Wertewirkung und Abseits sind implementiert. Weitere Balance- und Hardwareabnahme bleibt möglich.

Das Passziel soll ein sinnvoller freier Punkt oder Korridor sein: hinter die Abwehr, in die Außenbahn, zwischen Linien oder in den Lauf eines Mitspielers. Der Ball soll dort auch frei bleiben können, wenn niemand rechtzeitig ankommt.

Der vorhandene Bodenpass wird bereits für einen Empfänger geplant und kann bei Tiefenläufen Vorhalt erhalten. v150 ergänzt eine eigenständige Raumpassentscheidung mit separat bewertetem Raumziel und tatsächlichem Wettlauf um den Ball.

- Passgeber bewertet Passweg, verfügbaren Raum und Ankunftszeit. Ein bevorzugter Mitspieler kann zur Absicht gehören; seine Ballannahme ist nicht garantiert. Jeder erreichbare Spieler kann den Ball abfangen oder aufnehmen.
- Mitspieler beginnen passende Läufe vor der Ballankunft. Verteidiger und Torwart reagieren ebenfalls auf Bahn und voraussichtlichen Kontaktpunkt; bei Verzögerung oder Richtungswechsel wird neu bewertet.
- Passspiel beeinflusst Zielgenauigkeit und Dosierung, Technik die Ausführung unter Druck. Stellungsspiel beeinflusst Laufbeginn, freien Korridor und Abseitsvermeidung; Geschwindigkeit und Kondition begrenzen das tatsächliche Erreichen. Schlechte Werte dürfen verspätete Läufe, Überdosierung oder Abseits begünstigen.
- Die geplanten mentalen Werte Antizipation und Entscheidungen könnten später das Erkennen und Auswählen dieser Gelegenheit ergänzen. Bis zu ihrer Einführung bleiben sie Entwurf; dafür werden nicht stillschweigend neue Fähigkeiten eingeführt.
- Abseits wird beim Abspiel erfasst und erst bei regelrelevanter Beteiligung bewertet. Ballbesitz entsteht beim erreichbaren Kontakt, niemals allein wegen einer geplanten Empfängerkennung. Statistik unterscheidet beabsichtigtes Zuspiel, tatsächliche erfolgreiche Annahme und abgefangenen beziehungsweise unerreichten Ball.

Abnahme: freier Tiefenlauf, zugestellter Passweg, Überholduell, Abseitslauf, Torwartzugriff, kein erreichbarer Mitspieler, Ausquerung und beide Angriffsrichtungen. Starkes/schwaches Passspiel und Stellungsspiel getrennt prüfen; dieselbe Partie muss in 2D und 3D gleich ausgehen. Vorhalt bestehender Pässe, Direktaktionen und Abpraller dürfen dabei nicht verschlechtert werden.

## Weitere dokumentierte Prüfpunkte

- Echte Mobilhardware: Ladezeit, Bildrate und Speicherverbrauch, insbesondere bei vollständiger Rückschauaufnahme. Bisherige isolierte Browserprüfungen ersetzen diese Abnahme nicht.
- Visuelle Qualität: vorhandene Grundclips und extreme Richtungswechsel unter realen Spielsituationen weiter beurteilen.
- [Mentale Fähigkeiten](mentale-faehigkeiten-plan.md): Ruhe, Antizipation und Entscheidungen bleiben geplant; Einführung und Gewichtung benötigen eigene Szenen und Matchstudien.
- Rückschau: derzeit flüchtige Sitzungsaufnahme. Dauerhafte Speicherung und Videoexport sind mögliche Erweiterungen, keine bereits zugesagten Funktionen.

Die [Systemdokumentation](3d-system.md) beschreibt den implementierten Stand; diese Liste beschreibt die offenen Erweiterungen und Prüfungen sowie den markierten lokalen Raumpass-Abschluss. Bestehende Spielstände und historische Ereignisse werden bei einer späteren Einführung nicht nachberechnet.
