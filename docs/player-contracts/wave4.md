# Lokaler Rollen-, Taktik- und Bewertungsstand

Nutzerauftrag vom 8. Oktober 2026: P04, nächste Unity-Bewegungsiteration, P06 mit P03-Anbindung und P05 umsetzen. I02/I03 besitzen bestehende Hooks, Aufbau, Speicherung, Übersetzung und Gesamtprüfung. Fachagenten bearbeiten ausschließlich ihre unten benannten neuen Dateien. Bestehende Änderungen werden bewahrt.

## Aktivierung und Parameter

Nur neu erstellte lokale Karrieren mit `players=wave3` erhalten `playerFoundation.parameterId = wave3-local-candidate-1` und `playerFoundation.roles`/`ratings` als vollständige serialisierbare Parameter. Vorhandene wave2- oder ältere Karrieren werden nicht nachgerüstet. Alle offenen Zahlen sind lokale Testwerte, keine Produktionsfreigabe. Rechner verlangen explizite Parameter. P02 bleibt bis zur Verbrauchskalibrierung separat.

## P04 – reiner Vertrag

UMD/CommonJS `D6PlayerRoles`, `D6PositionRoutine`, `D6TacticTransitions`.

Rollenkennungen (genau 13): `line-keeper`, `sweeper-keeper`, `cover-defender`, `stopper`, `ball-playing-defender`, `playmaker`, `ball-winner`, `box-to-box`, `winger`, `poacher`, `striker`, `target-player`, `dribbler`.

Positionskennungen bleiben `gk`, `def`, `mid`, `att`. Rolle ist ein eigener Auftrag, nie Ersatz für `state.roles` (Positionsgruppen). Ausrichtung intern `-1/0/1`, neutral ist 0. Raster 5 Spalten × 7 Reihen; Tor unten. Zellenmitte ergibt Breite `(col+.5)/5`, Tiefe vom eigenen Tor `1-(row+.5)/7`. Längs [0;.30) Abwehr, [.30;.70) Mittelfeld, [.70;1] Angriff; Breite [.25;.75] zentral. `zoneForPoint({depth,width,keeper})` und `allowedRoles(zone)` müssen beide Spielrichtungen und alle vier Feld-/Mannschaftskonfigurationen unterstützen, ohne Laufgrenzen zu erzeugen.

`roleSuitability(skills,routine,roleId,parameters)` liefert eine interne Zahl auf Skala 1–20; `recommendRoles(snapshot,parameters)` liefert höchstens drei feste `{position,roleId}` für tatsächlich spielbare Profilpositionen. `bestRecommendedRole(recommendations,previousBest,skills,routine,parameters)` verwendet explizite Hysterese. `candidateParameters` ist öffentlich als eindeutig benannter Prüfstand exportiert; kein stiller Default.

Routine: `createRoutine(mainPosition,playablePositions,parameters)`, `routineTransition(routine,positionMinutes,parameters) -> nextRoutine`; main voller Wert, Nebenpositionen Grundwert, fremde 0, kurze tatsächliche Minuten zählen, keine Abnahme. Zahlenkonfiguration serialisierbar. Routine liefert nur Timing/Koordination, keine Fähigkeitsboni.

`tacticTransition(action,assignments,parameters,rng) -> nextAssignments`. Assignments `{[pid]:{cell,position,roleId,orientation}}`. Aktionen `{type:'free-move',playerId,toCell}`, `{type:'swap',playerId,otherPlayerId}`, `{type:'substitution',outPlayerId,inPlayerId}`. Freier Platz: gültige Rolle bleibt; sonst gleichverteilter RNG aus vollständiger erlaubter Liste, neutral. Tausch: Auftrag/Ausrichtung bleiben am Platz. Einwechslung erbt Platz/Auftrag/Ausrichtung. Keeper nicht frei verschieben; Keeperwechsel nur Keeper→Keeper prüft bestehender Controller. Kein eigener Storage oder globaler RNG.

Eigentum P04: `dist/player-role-suitability.js`, `dist/player-position-routine.js`, `dist/player-tactic-transitions.js`, `docs/player-contracts/roles-routine.md`, zugehörige drei `work/test-player-*.cjs`.

## P06 – reiner Vertrag

UMD/CommonJS `D6MatchRatings`. `rateAppearance(input,parameters)` mit `{playerId,fixtureId,worldId,seasonId,virtualMinutes,rolePositionPhases,actualEvents}`. Phase `{startMinute,endMinute,position,roleId,orientation}`. Tatsächliches Ereignis `{id,minute,playerId,type,success,context}`. Kontext nur beobachtet: `difficulty`/`usefulness` normiert 0–1, `progressMetres`, `pressure` 0–1, `repeatKey`, `errorAttribution` boolean. Fehlendes bleibt fehlend. Gültige Typen: `pass`, `receive`, `shot`, `save`, `tackle`, `interception`, `carry`, `support-run`, `cover`, `error`. Ein allein geplanter Lauf zählt nicht. Kein Score-/Talent-/Fähigkeits-/Frische-/Formbonus und keine perfekte Zukunftsinformation.

Ausgabe `{status,id,playerId,fixtureId,worldId,seasonId,minutes,rating,visibleRating,skillWeights,contributions}`. `id = fixtureId + ':' + playerId`, 0 Minuten `no-appearance`, unter 20 Minuten sichtbare Note null; intern kurze Einsätze bewertbar. Skillgewichte sparse, explizit aus tatsächlichen Phasen/Aktionen, P03-kompatibel. Eindeutige Ereignisse, Sättigung wiederholter sicherer Aktionen, ruhiger Keeper nicht automatisch Spitze. Fehlende Kontextdaten liefern vorsichtige Basis, keine erfundene Ursache. `candidateParameters` explizit exportieren, Baseline/Gewichte/Normierung dokumentieren.

I03 sammelt in beiden Matchwegen tatsächliche aufgelöste Aktionen nach derselben Struktur, verbucht Routine + P03 einmal in zeitlicher Reihenfolge und ersetzt ausschließlich neue markierte Matchnoten. Historie alter Partien unverändert.

Eigentum P06: `dist/player-match-ratings.js`, `docs/player-contracts/match-ratings.md`, `work/test-player-match-ratings.cjs`, `work/player-next/ratings/`.

## A02 und P05

A02 besitzt Unity-Probe-C# und eigene Präsentationsprüfungen; native JS und Unity-Spielregeln bleiben I03. Bestehende Clips, native Uhr, Ballkontakt und Rootposition bleiben maßgeblich. Verbesserte Ballführung, Annahme in Bewegung, Anschluss nach Doppelpass und Schussübergänge; keine bezahlten Generierungen. Unity-Editorzustand frisch erfassen und nach Build wiederherstellen.

P05 verwendet Flutlicht-Komponenten/-Farben, gemeinsame Vor-/Halbzeitcontroller, Rollen über Spielern, eine ungefähre gemeinsame Wirkungszone, Rollenwahl und Ausrichtung statt alter individueller Anweisungen. Sichere Projektion mit Feldliste: ausschließlich Farbstufen für Fähigkeiten/Eignung, kein verborgenes Talent oder Grenz-/Routine-Rohwert in DOM/ARIA. Die drei zurückgestellten UI-Besichtigungspunkte bleiben später offen.
