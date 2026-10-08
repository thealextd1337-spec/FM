# Rollen, Leistungsnoten und nächste Unity-Iteration

Folgeiteration: [Offensivqualität, Körpermasse und dynamische Läufe](offensive-quality.md). Die nachstehenden Hashes und Vergleiche dokumentieren den erhaltenen Rollen-Ausgangsstand; aktuelle v157-Nachweise liegen separat.

Lokaler Stand vom 8. Oktober 2026 nach dem Umsetzungsauftrag. [Neue Prüfkarriere mit Unity](http://127.0.0.1:4200/source/index.html?engine=unity&players=wave3): eine neue Karriere erstellen. Die normale Adresse und bereits gespeicherte wave2-/ältere Karrieren erhalten keine nachträglichen Spielerfelder, Rollen oder historischen Noten. Offene Gewichte sind als vollständiger lokaler Kandidat in der neuen Welt gespeichert, keine Produktionsbalance.

## Gelieferte Funktionen

P04 liefert genau die 13 bestätigten Rollen, feste Empfehlungen bei der Spielererzeugung, dauerhafte Positionsroutine und Eignung aus Grundfähigkeiten/Routine. Hauptposition startet vollständig, bestätigte Nebenposition mit Grundroutine, fremde Position ohne Routine; tatsächliche kurze Einsatzminuten zählen. Form, Frische, Transfer und Nichtbenutzung verändern Empfehlungen oder Routine nicht. Die beste feste Empfehlung wechselt mit Hysterese; der Trainerauftrag bleibt erhalten.

Freies Verschieben behält eine gültige Rolle; eine ungültige wird gleichverteilt aus allen in der neuen Zone zulässigen Rollen gewählt, Ausrichtung neutral. Bei besetztem Tausch bleibt der Auftrag am Platz. Einwechslungen erben Auftrag und Ausrichtung des Platzes, einschließlich Torwartwechsel. Auswahlzonen verwenden den bestätigten 30/40/30- und 25/50/25-Vertrag; sie sind keine Laufgrenzen. Ein gespeicherter Entscheidungszähler bindet Rollenwahl an denselben Prüfstand.

Die gemeinsame Simulation verwendet Rollen für Tiefe, Breite, Anschluss, Abschirmung und kontrolliertes Herauslösen. Spielmacher und Zielspieler bieten Anschlüsse; Box-to-Box, Stoßstürmer, Torjäger und Dribbler nutzen Tiefe/Nachlaufen; Abräumer und Verteidiger halten Absicherung. Der Dribbler sucht freie Eins-gegen-eins-Ausgänge, nachdem bessere schnelle Pässe und Abschlussfenster geprüft wurden. Defensive Torjäger arbeiten stärker nach hinten und gegen nahe Gegner. Positionsroutine verändert die Koordination des gewünschten Laufziels, keine Grundfähigkeit oder zusätzliche Kontaktreichweite. Das schnelle v152-Passspiel bleibt erhalten. Der mitspielende Tormann antizipiert erreichbare beobachtete Bodenpässe und verzichtet bei früher erreichbaren gegnerischen Kontakten; bestehende legale Zugriffe, Rückkehr und Paraden bleiben zuständig. Die Rollen sind keine umfassend kalibrierte Fußball-KI.

P05 zeigt Rollen über den Spielern, eine einzige ungefähre Wirkungszone sowie Rollenwahl und defensiv/neutrale/offensive Ausrichtung. Die bisherigen individuellen Anweisungen entfallen ausschließlich für neue Rollenwelten; Teamtaktik bleibt. Profil, dauerhafter Matchplan, Voranpfiff und Pause verwenden dieselbe sichere Projektion und Controller. Vorlagen, Rückgängig, Rollen- und Ausrichtungswechsel werden gespeichert. Wichtige Fähigkeiten werden in ihren tatsächlichen bestehenden Farbstufen markiert. Keine Rohfähigkeiten, Eignungszahlen, Routinewerte, Grenzen oder verborgenes Talent gelangen in DOM/ARIA.

P06 bewertet tatsächlich erfasste Pässe, Annahmen, Abschlüsse, Paraden, Zugriffe und beobachtete Lauf-/Deckungsaktionen. Geplantes Abfangen zählt erst bei erreichtem Ballkontakt. Ein verlorener Dribbelzweikampf wird nicht als Fehlpass erfunden; bei hohen Pässen und Raumpässen zählt der tatsächliche Empfänger. Raumpässe erfassen auch bekannte Fehlschläge und die tatsächlich dosierte Fluggeometrie. Annahmedruck stammt vom erreichten Empfänger, Raumgewinn vom gespeicherten Abgabeort. Sichere Wiederholungen sind begrenzt; Spielausgang und Gegentore erzeugen keinen pauschalen Bonus oder persönlichen Fehler. Fehlender Kontext bleibt fehlend. Kurze Einsätze sind intern bewertet, sichtbar erst ab 20 Minuten.

Der kompakte Adapter löst eigene abstrakte Pass-/Annahme-/Abfang-/Schuss-/Paradenaktionen auf. Passdruck, Entfernung und Raumgewinn stammen aus seiner tatsächlichen Aufstellungsgeometrie. Er behauptet keine nicht simulierten 3D-Läufe oder Fußkontakte. Derselbe reine P06-Rechner verarbeitet beide Ereignisverträge; identische Eingaben ergeben identische Noten. Das ist keine vollständige Physikparität der beiden Matchadapter.

Tatsächliche Rollen-/Positionsphasen liefern Routine und Lerngewichte. Formation, Vorlagen, Startelftausch, Ausrichtung und Rückgängig schließen beziehungsweise restaurieren Phasen am tatsächlichen virtuellen Minutenpunkt; ungenutzte Nullphasen verdienen keine Einsatzbuchung. P03 verbucht Noten, Minuten, persönliche Grenzen und Saisonstaffel einmal je Einsatz; kurze Einsätze zählen mit. Fähigkeitenlernen, Routine und beste Empfehlung bleiben beim Laden erhalten. Das beste feste Rollenhighlight wird auch nach tatsächlichem Altersabbau mit derselben Hysterese neu geprüft. P02 wird weiterhin nicht auf die vorhandene Verbrauchskette gestapelt: Verbrauchseinheiten und offene Bewegungskurven müssen separat kalibriert werden.

## Unity

Vorhandene Bewegungsclips laufen unter kurzen Annahme-/Pass-/Schusskontakten weiter. Kontakt hat Vorrang; danach geht die Pose zügig in die tatsächlich beobachtete Bewegung über. Drehungen bewahren die Schrittphase. Ballführung nutzt kontrollierten Lauf und begrenzte Fußreichweite, ohne Ball-, Root-, Uhr- oder Matchentscheidungen zu verändern. Unity bleibt die bevorzugte 3D-Darstellung der gemeinsamen Simulation, keine zweite Match-KI.

Build `build_41820a01959b`, SourceID `965542b6a3027530004183d64a9647bf5a6d7783a2a00d306edca413b8e3cdb1`: erfolgreich in 94,886 Sekunden, keine Fehler und drei bestehende Warnungen. Ursprüngliche Szene, Windows-Ziel, Pipelines, Brotli, Auflösung und Hintergrundmodus exakt wiederhergestellt. [Gesamtbeleg](../../outputs/platform/action-iteration/evidence.json).

22 neue Aktions-/Rigfälle, 15 Bewegungsfälle, 23 bestehende Rigfälle und 24 Darstellungsverträge bestanden. Live 5 Aktionsfälle, 4 Pilotfälle, 9 normale und 11 vergrößerte Renderfälle mit langer Halbzeit, sowie 2 direkte Linkfälle bestanden. Tatsächlich beobachtet: bewegte Annahme-, Pass- und Schussmischbilder sowie ein erreichbarer Carrier-Fußkontakt. Linke Fußreichweite im echten Rigtest belegt, in diesem einen Live-Spiel nicht beobachtet. Unerreichbare Kontakte bleiben sichtbare Fehlkontakte; keine neuen Meshy-Jobs oder Credits.

## Nachweise und verbleibende Arbeit

- P04: 25 reine Prüfgruppen; [Vertrag](../player-contracts/roles-routine.md).
- P05: 11 Projektions-/Sicherheitsgruppen und 26 tatsächliche UI-Prüfungen bei 320, 390 und 1366 Pixel, Hell/Dunkel, DE/EN, Profil, Voranpfiff, Pause und Rückgängig. [UI-Protokoll und Aufnahmen](../../outputs/platform/tactics-wave4/report.json).
- P06: 23 reine Prüfgruppen einschließlich kurzer Serien und P03-Anbindung; [Vertrag](../player-contracts/match-ratings.md).
- 13 gezielte native Rollen-Verhaltensgruppen und 6 tatsächliche Controller-/Phasen-Lebenszyklusgruppen bestanden. Zusätzlich [24 native Kontext-/Checkpointfälle](../../outputs/platform/role-performance/native-context-tests.json) gegen die gelieferten Pass-/Kontakt-/Buchungsfunktionen; ihre isolierten Flug-/Ansichtsfixtures sind keine vollständige Physikabnahme.
- 53 Integrationsprüfungen und 21 vollständige native Partien am endgültig eingefrorenen Quellstand; 53 Prüfungen und drei vollständige Partien am daraus gebauten HTML. Dazu kompakte Partien, beide Seiten, Feld-/Keeperwechsel, Halbzeit, Rollenphasen, JSON-Fortsetzung, Altershighlight und einmalige Buchung: [Quellprotokoll](../../outputs/platform/role-performance/source-tests.json), [Buildprotokoll](../../outputs/platform/role-performance/build-tests.json). Alle erfassten Quell-/Buildhashes blieben während der finalen Läufe unverändert.
- Tatsächliche Unity-Parität am finalen HTML: [21 normale Fälle](../../outputs/platform/world-unity/runtime-tests.json) und [23 Rollenkarriere-Fälle](../../outputs/platform/world-unity/roles-wave4/runtime-tests.json). Je eine vollständige native/Unity-Vergleichspartie liefert identische Ereignisse, Statistiken, Halbzeit, Matchrecord und Finanzen; die neue Karriere zusätzlich identische beobachtete Rollenaktionen, Routine, Grundfähigkeiten und P03-Lernbuchungen. 21 Quell- und 21 Buildfälle bestätigen weiterhin die bisherigen Spielerkarrieren.
- Bestehende Match-, Anweisungs- und Matchplanprüfungen bestanden. Historische umfassende UI-Prüfserien bleiben historische Belege und werden hier nicht als erneut ausgeführt gezählt.

Der [abschließende Lieferabgleich](../../outputs/platform/role-football-delivery.json) bestätigt die aktuellen Dateihashes, beide lokalen Links, identisches Einzeldatei-HTML, Unity-Quellen/Buildassets und wiederhergestellte Editoreinstellungen. Ausführbar mit `work/platform/qa/verify-role-football-delivery.cjs`. Keine öffentliche Live-Seite aktualisiert.

Zehn identische Seedpaare mit denselben neuen Spielern und aktivem v152 auf beiden Seiten:

| Summe je zehn Partien | Schnelle v152-Basis | Rollenprüfstand |
| --- | ---: | ---: |
| Pässe | 587 | 534 |
| Angekommene Pässe | 467 | 378 |
| Progressive Pässe | 167 | 221 |
| Schüsse | 38 | 31 |
| Anschluss-Pässe unter 0,5 Sekunden | 249 | 215 |
| Tore beider Mannschaften | 2 | 4 |

Mehr Vorwärtsprogression steht weniger erfolgreichen Pässen, rund 14 Prozent weniger schnellen Anschlüssen und rund 18 Prozent weniger Schüssen gegenüber. Ein kleiner Vergleich, keine umfassende Balancefreigabe oder belastbare Aussage zur Torquote. Das weitere Feintuning konzentriert sich auf Passqualität, erreichte Abschlussräume und sinnvolle Schüsse.

Die drei zurückgestellten UI-Besichtigungspunkte bleiben offen: echter 200-%-Zoom, Smartphone/Screenreader sowie gemeinsame visuelle Besichtigung. Echte Android-Geräteabnahme und Produktionskalibrierung bleiben separat. Keine Veröffentlichung; lokaler Seitenfuß weiterhin 110.
