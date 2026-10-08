# P06: beobachtete rollenbezogene Matchnoten

Stand: 8. Oktober 2026. Der reine Rechner ist gegen [Welle 4](wave4.md) implementiert. Die Zahlen sind ausdrücklich der lokale Prüfstand `wave3-rating-candidate-1`; keine Produktionskalibrierung. Bestehende Noten, Spielstände und historische Aktionen werden weder gelesen noch rekonstruiert. Der Integrator aktiviert den Rechner nur für neue markierte Partien der neuen lokalen Prüfkarriere und sammelt echte Ereignisse in sichtbaren und kompakten Partien.

## Schnittstelle und zeitlicher Umfang

`dist/player-match-ratings.js` exportiert CommonJS beziehungsweise `window.D6MatchRatings` mit `rateAppearance(input, parameters)`, `candidateParameters`, `EVENT_TYPES`, `ROLE_IDS` und `SKILL_KEYS`. Parameter sind vollständig JSON-speicherbar; ihr Weglassen ist ein Vertragsfehler. Der Rechner liest keine vollständigen Spieler, Spielglobals, Browserablage, Zufallszahlen, reale Uhr oder Darstellung.

```js
const result = D6MatchRatings.rateAppearance({
  playerId, fixtureId, worldId, seasonId,
  virtualMinutes: 15,
  rolePositionPhases: [
    {startMinute: 75, endMinute: 90, position: 'att', roleId: 'striker', orientation: 0}
  ],
  actualEvents: [
    {id: 'fixture-action-82', minute: 82, playerId, type: 'support-run', success: true,
      context: {difficulty: 0.6, usefulness: 0.8, pressure: 0.4, repeatKey: 'actual-gap-a'}}
  ]
}, explicitSavedParameters);
```

`virtualMinutes` sind tatsächlich gespielte Minuten, auch Bruchteile. Phasenzeitpunkte sind absolute virtuelle Matchminuten; ein Einsatz 75–90 dauert 15 Minuten. Phasen müssen positiv lang, überschneidungsfrei und zusammen höchstens so lang wie der Einsatz sein. Die Grenze gehört zur folgenden Phase; das Ende der letzten Phase ist enthalten. Rollen werden zum Ereigniszeitpunkt ausgewertet, nicht anhand der Schlussrolle. Nicht erfasste Minuten erscheinen als `missingPhaseMinutes`; sie werden nicht zu Rollenphasen ergänzt. Keeperposition und Keeperrolle müssen zusammenpassen. Alle 13 vereinbarten Rollen und die bestehenden vier Positionsgruppen bleiben getrennt.

Ausgabe ist `{status,id,playerId,fixtureId,worldId,seasonId,minutes,rating,visibleRating,skillWeights,contributions}`. `id` entspricht `fixtureId + ':' + playerId`. Null Minuten liefern `no-appearance` mit null Noten und leeren Gewichten. Positive Minuten liefern `rated`, eine ungerundete interne Note 1–10 und erst ab 20 tatsächlichen Minuten dieselbe sichtbare Note. Der Anzeiger darf runden; P03 verwendet die interne Note. Identitäten dürfen nichtleere Strings oder sichere Ganzzahlen sein; für Vergleiche bleibt der Typ Bestandteil der Identität.

## Tatsächliche Beobachtungen

Erlaubte Ereignisse sind `pass`, `receive`, `shot`, `save`, `tackle`, `interception`, `carry`, `support-run`, `cover`, `error`. Der Integrator liefert ein tatsächlich aufgelöstes Ergebnis und allein bereits beobachtete Schwierigkeit, Nützlichkeit, Druck, Raumgewinn oder persönliche Fehlerursache. Ein Laufplan ist kein Laufnutzen. Ohne erfasste `usefulness` erhalten Lauf-/Deckungsereignisse keinen positiven oder negativen Beitrag. Zukunftswissen, bloße Scorerstatistiken und erfundene Keeperfehler gehören nicht in diese Eingabe.

Fehlende Kontextwerte bleiben in `contributions.events[].missingContext` sichtbar und verwenden die ausdrücklich gespeicherte vorsichtige Kandidatenbasis 0. Ein erfolgreiches Ereignis ohne Kontext erhält daher nur minimale Ausführungsanerkennung. Nicht zugeordnete Keeperfehler und erfolglose Paraden erhalten keinen automatischen Schuldabzug. Bei fehlenden Phasen kann ein tatsächlich erfasstes Ereignis ohne Rollenfaktor bewertet werden; die Datenlücke wird ausgewiesen. Fehlen zugleich Phasen und Ereignisse, bleiben Lerngewichte leer und die P03-Buchung ist entsprechend nicht unterstützt.

Eindeutige IDs deduplizieren Replay und erneute Lieferung. Unterschiedliche Inhalte unter derselben ID werfen `TypeError`, damit Eingabereihenfolge keine widersprüchliche Wahrheit auswählt. Fremde Spieler und Ereignisse außerhalb ihrer erfassten Einsatzphasen werden ignoriert und gezählt. Ereignisse werden deterministisch nach virtueller Minute und ID sortiert. Zusätzliche Metadaten wie Talent, Caps, Fähigkeiten, Form, Frische, Routine, Mannschaftsergebnis, 2D/3D oder Wiedergabetempo werden nicht gelesen.

## Explizite lokale Bewertungsformel

Basis ist 6,0 für alle Aufgaben, auch einen wenig geprüften Tormann. Tatsächliche Rolle und defensive/neutrale/offensive Ausrichtung gewichten lediglich die passenden beobachteten Aufgaben. Ausrichtung verschiebt passende defensive/offensive Aktionsgewichte um 12 Prozent. Die vollständigen 13 Rollenmatrizen liegen in `candidateParameters.roleFactors`; sie sind kein versteckter Qualitätsbonus.

| Beobachtung | Kandidaten-Aktionsgewicht | Positives Typenmaximum vor Zeitskalierung |
|---|---:|---:|
| Pass | 0,30 | 1,15 |
| Annahme | 0,12 | 0,40 |
| Abschluss | 0,65 | 1,80 |
| Parade | 0,72 | 2,50 |
| Zweikampf | 0,43 | 1,60 |
| Abfangen | 0,46 | 1,60 |
| Ballführung | 0,32 | 1,10 |
| Anschluss-/Tiefenlauf | 0,27 | 1,30 |
| Absicherung | 0,30 | 1,50 |
| Persönlicher Fehler | 1,05 | 0 |

Erfolg erhält getrennte Beiträge für Ausführung (`0,02 + 0,20 × Schwierigkeit`) und nützliche Entscheidung (`0,78 × Nutzen`). Eine nützliche, erfolglose Entscheidung kann `0,18 × Nutzen` behalten. Normaler Misserfolg kostet `0,20 × (1 − Schwierigkeit)`, mit Druckentlastung bis 35 Prozent. Beobachtete persönliche Ausführungsfehler kosten dagegen `1,25 × (1 + Nutzen)` mit derselben Druckentlastung. Das eigenständige Fehlerereignis verlangt ausdrücklich persönliche Zuordnung; keine automatische Schuld bei einem Gegentor.

Beobachteter positiver Raumgewinn in Pass/Ballführung kann den Nutzen höchstens auf `0,25 × clamp(Meter/20, 0, 1)` anheben. Das interpretiert nur tatsächlich erfassten Raumgewinn und garantiert keinen späteren Torerfolg.

Gleiche semantische Aktionsoptionen im selben Fünf-Minuten-Abschnitt erhalten geometrisch weniger positive Anerkennung (`0,55^Wiederholungen`). Ohne semantischen Schlüssel gelten eindeutige Ereignisse als unterschiedliche Beobachtungen. Für leichte, wenig nützliche Aktionen (Schwierigkeit/Nutzen höchstens 0,2, Raumgewinn höchstens 3 Meter) gilt zusätzlich ein gemeinsamer positiver Deckel 0,15. Tausende sichere Wiederholungspässe führen bei 90 Minuten deshalb höchstens zu 6,15. Persönliche wiederholte Fehler werden durch die Anerkennungssättigung nicht gestrichen.

Andere positive Typensummen sättigen mit `Typenmaximum × (1 − exp(−Summe/Typenmaximum))`. Die virtuelle Einsatzdauer skaliert beide Summen mit `sqrt(90 / max(20, Minuten))`; die Untergrenze verhindert extreme Ein-Minuten-Hochrechnungen. Positiver Gesamtabstand ist höchstens 3,5, negativer höchstens 5,0. Die endgültige Note wird auf 1–10 begrenzt. Keine Punkte für Sieg, Niederlage, Zu-null, individuelles Talent oder das bloße Vorhandensein eines Rollenauftrags.

## Gewichte und P03-Übergabe

`skillWeights` verwendet ausschließlich die 13 vereinbarten internen Schlüssel. Die Kandidaten-Allokation besteht aus einem kleinen Anteil tatsächlicher Rollen-/Positionszeit (`phaseAllocationWeight: 0.2`) sowie den passenden beobachteten Aktionen (`eventAllocationWeight: 1`). Rollenzeit beschreibt Aufgabenexposition; sie erzeugt **keinen Notenbonus oder angenommenen erfolgreichen Lauf**. Aktionsgewichte folgen Ausführungs-/Entscheidungsanerkennung beziehungsweise beobachteter Fehlerschwere. Die vollständigen sparse Matrizen stehen in `roleSkillWeights` und `eventSkillWeights`; sie lesen keine Fähigkeitswerte oder Potenzialabstände. Positive Summe wird auf 1 normalisiert.

Diese Allokationsregel bleibt ausdrücklich ein lokaler Testwert. Ein ruhiger Einsatz kann so seine wirklichen Minuten im P03-Fenster buchen, ohne eine Spitzennote zu erhalten. Der Integrator reicht die Ausgabe und exakt dieselben `skillWeights` an P03 weiter und speichert Fähigkeiten und Ledger atomar. P06 führt kein Dreierfenster, bucht keine Lernpunkte und hat keine eigene Speicherlogik. Sichtbare und kompakte Spiele müssen denselben echten Ereignisvertrag liefern; die reine P06-Prüfung ersetzt keine Integration mit neuen Fixture-Records.

`contributions` ist ausschließlich internes Prüfmaterial: Parameter-ID, Basis, begrenzte Summen, Zeitskalierung, Phasenminuten, Lücken, ignorierte Ereignisse sowie individuelle Entscheidungs-/Ausführungs-/Fehlerbeiträge. Es ist keine neue Produktanzeige von Fähigkeiten oder verborgenem Talent.

## Nachweise und Grenzen

`work/test-player-match-ratings.cjs` prüft 23 Gruppen mit sechs festen Szenarien in `work/player-next/ratings/scenarios.json`. Nachgewiesen sind stille/geprüfte Keeper und eigene Fehler, gute erfolglose Entscheidung, begrenzte sichere Passserie, tatsächlich beobachtete Arbeit ohne Ball, Rollen-/Positionsphasen, Phasengrenzen, kurze 1/5/19/20-Minuten-Einsätze, Deduplikation, unabhängige Metadaten und Darstellung, unveränderte Inputs, Datenlücken, Parameterserialisierung und UMD-Export. P06→P03 ist für einen guten Kurzeinsatz und mehrere schwache Kurzeinsätze bis zur 90-Minuten-Schutzschwelle samt Unterbrechung geprüft.

Die festen Szenarien sind fachliche Rechnerprüfungen. Erfassung, historische Abgrenzung, native/kompakte Spielparität, tatsächliche Rollenwirkung und mehrere komplette Partien bleiben Abnahmeaufgaben des Integrators. Eine Produktionsbalance oder künstlich garantierte positive Entwicklung wird daraus nicht behauptet.
