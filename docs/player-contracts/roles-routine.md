# Rollen und Positionsroutine – lokaler Prüfstand

P04 ist als drei reine UMD/CommonJS-Rechner geliefert. Die Aktivierung und Integration erfolgen ausschließlich durch I02/I03 für neue lokale `players=wave3`-Karrieren nach [wave4.md](wave4.md). Alte Karrieren, gespeicherte Aufträge und historische Minuten werden nicht ergänzt. Die öffentlich exportierten `candidateParameters` sind serialisierbare, ausdrücklich zu übergebende Testwerte. Keine Funktion wählt sie automatisch.

## Eignung und feste Empfehlungen

`D6PlayerRoles` exportiert `ROLE_CATALOG`, `ROLE_IDS`, `SKILL_KEYS`, `POSITIONS`, `candidateParameters` und drei Funktionen:

- `roleSuitability(skills, positionRoutine, roleId, parameters)` erhält permanente Fähigkeitswerte und **einen Routinewert für die tatsächliche Einsatzposition**. Beispiel: `routine[assignment.position]`. Damit sind Flügelspieler im Mittelfeld/Angriff und nominelle Stürmer als Abräumer eindeutig. Das Ergebnis ist intern numerisch 1–20; Anzeige und zugängliche Beschriftung verwenden ausschließlich bestehende Farbstufen.
- `recommendRoles({mainPosition,playablePositions,skills,routine}, parameters)` liefert maximal drei `{position,roleId}` ohne interne Scores. Nur bestätigte Rollen für tatsächliche Profilpositionen sind Kandidaten. Der Integrator ruft diese Funktion bei Erzeugung auf und speichert die Liste dauerhaft. Tormannprofile bleiben ausschließlich `gk`.
- `bestRecommendedRole(fixedRecommendations, previousBest, skills, routine, parameters)` wählt ausschließlich innerhalb der festen Liste. `previousBest` ist `{position,roleId}` oder `null`. Ein Wechsel erfolgt erst bei einem Vorsprung **größer** als die explizite Hysteresemarge; bei knappen Unterschieden bleibt die vorige Rolle hervorgehoben. Erstgleichstände verwenden die explizite `firstTieRoleOrder`, danach die stabile Positionsreihenfolge. Eine leere Liste liefert `null`.

Der Katalog enthält genau die 13 vereinbarten Rollenkennungen. Jedes Element enthält `{id,positions,importantSkills}`. Das sind Relevanzangaben, keine neuen Fähigkeitswerte oder frei erfundenen Profileigenschaften. `winger` darf im Profil zu `mid` oder `att` gehören; die taktische Freigabe ist enger und berücksichtigt die seitliche Startzone.

Lokale Eignungsparameter `roles-suitability-local-candidate-1`:

- Fähigkeitsgewichte pro Rolle summieren im exportierten Kandidaten auf 100; sie verwenden ausschließlich bestätigte relevante Fähigkeiten aus dem Archetypenplan. Die genaue Tabelle steht unmittelbar in `candidateParameters.roleWeights`.
- `routineCap = 100`, `routineWeight = 0.20`. Die gewichtete permanente Fähigkeitsmitte wird mit `1 - 0.20 × (1 - routine / 100)` multipliziert und auf 1–20 begrenzt. Volle Routine gibt keinen Bonus über die Fähigkeitsmitte; fremde Routine 0 ergibt maximal 20 Prozent Eignungsreduktion. Dies ist **nur Eignungsrechnung**, kein Fähigkeitsmultiplikator für den Matchsolver.
- `maxRecommendations = 3`, `hysteresisMargin = 0.35`, `firstTieRoleOrder` entspricht der gespeicherten 13er-Katalogfolge. Diese Zahlen sind noch keine Produktionsbalance.

Form, Frische, Talent, Ergebnis und Alter gehen nicht unmittelbar in die Rechnung ein. Keine Empfehlungen entstehen allein durch wachsende Routine oder Fähigkeiten. Fehlende/ungültige Parameter, unzulässige Fähigkeitsgewichte und Routine außerhalb des Caps werden abgewiesen.

## Routine anhand tatsächlicher Minuten

`D6PositionRoutine.createRoutine(mainPosition, playablePositions, parameters)` liefert die flache Karte `{gk,def,mid,att}`. Auch Jugendliche starten auf der Hauptposition am Cap; Nebenpositionen erhalten den expliziten Grundwert, fremde Positionen 0.

`routineTransition(routine, actualPositionMinutes, parameters)` liefert eine neue Karte. Minuten sind eine sparse Karte, etwa `{mid:19,att:1}`. Jede tatsächliche Minute zählt. Der lokale Kandidat `position-routine-local-candidate-1` verwendet `cap = 100`, `secondaryStart = 25`, `minutesToFull = 1800`; daher wächst eine Position um `minutes × 100 / 1800`, höchstens bis 100. Rollenwechsel innerhalb einer Position ändern das nicht. Nichtnutzung, Transfer, Pause und Saison erzeugen keine Abnahme. Eine leere Minutenkarte lässt alle Werte unverändert.

Der reine Rechner führt kein eigenes Fixture-Ledger. Der Integrator liefert die tatsächlichen Minuten je Position **einmal je abgeschlossener Partie**, hält Reihenfolge/Deduplikation beim Rating- und Entwicklungsabschluss und speichert das Ergebnis. Der Matchadapter nutzt Routine ausschließlich für Timing, Laufkoordination und Abstimmung; Basisfähigkeiten bleiben unangetastet. Routineerwerb auf fremden Positionen erweitert weder Profilpositionen noch Empfehlungen.

## Zonen und Trainerübergänge

`D6TacticTransitions.zoneForPoint({depth,width,keeper})` erwartet normalisierte relative Startkoordinaten vom eigenen Tor. Längs: `[0;.30)` Abwehr, `[.30;.70)` Mittelfeld, `[.70;1]` Angriff. Breit: `< .25` links, `.25` bis `.75` einschließlich zentral, `> .75` rechts. Keeper liefert `{position:'gk',lane:'center'}`. `allowedRoles(zone)` liefert eine unabhängige Kopie der vollständigen erlaubten Liste:

| Startzone | Zulässige Rollenkennungen |
| --- | --- |
| Keeper | `line-keeper`, `sweeper-keeper` |
| Ganze Abwehrbreite | `cover-defender`, `stopper`, `ball-playing-defender` |
| Mittelfeld zentral | `playmaker`, `ball-winner`, `box-to-box` |
| Mittelfeld seitlich | `winger` |
| Angriff zentral | `poacher`, `striker`, `target-player`, `dribbler` |
| Angriff seitlich | `winger`, `dribbler` |

Die Freigabe hat keine Fähigkeits-/Empfehlungsschwelle. Zonen sind Startpunkte für die Rollenwahl, keine Laufgrenzen. `pointForCell` und `zoneForCell` erhalten explizite `{columns,rows,ownGoal}`. Kandidat `tactic-transitions-local-candidate-1` ist `{columns:5,rows:7,ownGoal:'bottom'}`. Bei Tor oben werden die physischen Rasterachsen gedreht. `pointForPhysical({x,y,keeper},{widthMetres,lengthMetres,ownGoal})` normalisiert physische Startpunkte für beide Richtungen unabhängig von Feldgröße und Mannschaftsgröße. Feld-/Mannschaftskonfigurationen ändern die relative Freigabe nicht.

`tacticTransition(action, assignments, parameters, rng)` erhält `{[pid]:{cell,position,roleId,orientation}}` und liefert unabhängige Aufträge:

- `free-move`: freie Zielzelle; gültige Rolle bleibt, ansonsten eine gleichverteilte RNG-Ziehung aus **allen** zulässigen Rollen. Ausrichtung wird neutral 0. Gleiche Zelle ist unveränderter Zustand. Besetzte Zellen verlangen die separate Tauschaktion.
- `swap`: beide Spieler erben Rolle und Ausrichtung des jeweils anderen Platzes. Keine Zufallsziehung oder Zurücksetzung.
- `substitution`: der Einwechselspieler erbt den vollständigen Platzauftrag des ausgewechselten Spielers. Der bestehende Controller prüft vorher Keeper→Keeper. Die Funktion bewertet kein Profil und wählt keine Empfehlung aus.

Keeper können nicht frei bewegt oder getauscht werden. `cell:null` ist für den bestehenden separaten Keeperplatz zulässig. Feldzellen müssen zur angegebenen Positionsgruppe und Rolle passen; doppelte belegte Zellen werden abgewiesen. RNG wird nur bei ungültiger Rolle nach freiem Verschieben genau einmal verwendet und muss `[0;1)` liefern. Keine globale Zufallsquelle und kein Storagezugriff.

## Prüfung

Bundled Node: `work/test-player-role-suitability.cjs` **9 Gruppen**, `work/test-player-position-routine.cjs` **7 Gruppen**, `work/test-player-tactic-transitions.cjs` **9 Gruppen**, insgesamt **25 bestanden**. Geprüft wurden Katalog/Relevanzgewichte, permanentenbasierte Eignung, feste Empfehlungen, Hysterese, Haupt-/Neben-/Fremdroutine einschließlich Kurzminuten, Cap/kein Verfall, unveränderte Eingaben, sämtliche Zonen und Grenzpunkte, beide Richtungen in allen vier Feld-/Mannschaftskonfigurationen, die vollständige gleichverteilte Rollenmenge, Verschieben/Tausch/Wechsel, Keepergrenzen, explizite Parameter und JSON-/Browser-UMD-Parität. Reale Match-, Speicher- und UI-Abnahme bleiben Integratoraufgabe.

## Begrenzte native Verhaltensprüfung

`work/test-role-phase-transitions.cjs` prüft **6 Gruppen** am tatsächlichen Controllerquelltext: Formation, Pausenvorlage, erste Einsatzminute bei Vorabwechsel, Rollen-/Ausrichtungswechsel derselben Minute mit Undo, Wechsel beider Seiten bei identischen Rasterzellen sowie JSON-Fortsetzung. Jede Einsatzminute gehört genau einer tatsächlichen Rollenphase.

Die ergänzten nativen Unterschiede in `world-player-roles-v154.js` bleiben auf drei zuvor fehlende Aufgaben begrenzt. Der mitspielende Tormann extrapoliert einen bereits beobachteten gegnerischen Bodenpass und sucht ein mit vorhandener Geschwindigkeit/Reaktionszeit erreichbares Kontaktfenster im eigenen Strafraum. Ein früher erreichbarer anderer Spieler, geschlossene Reichweite oder gefährliche Bahn beendet diesen Vorschlag; normale Keeper-/Schussreaktionen und die tatsächlichen Kontaktregeln bleiben maßgeblich. Flugziel, geplanter Empfänger und zukünftiges Ergebnis werden nicht gelesen.

Der Dribbler erhält nach vorhandenen schnellen Vorwärts-/Raumpässen und guten Abschlussfenstern ein kurzes seitliches Eins-gegen-eins-Angebot, wenn ein einzelner Gegner und ein freier Ausgang vorhanden sind. Ein deutlich besserer legaler Pass hat Vorrang. Die reale Technik begrenzt weiterhin die Richtungsänderung, native Geschwindigkeit und Ballkontakte entscheiden den Erfolg. Der flüchtige Auftrag `roleDribble={x,y,until}` ist gewöhnliches JSON-Matchcheckpoint-Datum und endet bei Zeitablauf, geschlossenem Weg, Besitz-/Rollenwechsel oder Standard. Der Torjäger bleibt neutral vorne, arbeitet gegen nahe Gegner und zieht sich bei defensiver Ausrichtung stärker zurück. Es entstehen keine neuen Fähigkeitsboni, Ballversetzungen oder Zufallsziehungen.

`work/test-native-role-behavior-v154.cjs` prüft **13 Gruppen** am tatsächlichen Rollen-, Entscheidungs-, Geometrie- und Ballführungsquelltext, darunter beide Richtungen, erreichbare/unerreichbare Tiefenbälle, frühe gegnerische Kontaktfenster, gesperrte Zukunftsinformation, isolierte/geschlossene Duelle, bessere Pässe/Abseits, erhaltene schnelle Vorwärtsaktionen, Technik-Turnlimit, Abbruch, Torjäger-Ausrichtung und unveränderte alte Entscheidungs-/RNG-Folgen. Diese gezielten Nachweise sind keine vollständige Balanceabnahme aller 13 Rollen; die Gesamtpartien und 2D-/Unity-Parität übernimmt der Integrator.
