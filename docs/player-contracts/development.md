# P03: reine Leistungsentwicklung und Alterung

Stand: 8. Oktober 2026. Isolierte Umsetzung der freigegebenen Welle 2 gegen den [gemeinsamen Modulvertrag](wave2.md). Die Berechnung ist geliefert; die Produktionsintegration wartet auf echte P01-Caps sowie den P06-Noten-/Rollen-/Aktionsvertrag. Die bisherigen Statusvermerke „geplant“ in älteren Aufträgen beschreiben den Stand vor der Welle-2-Freigabe.

Zuständige Dateien: `dist/player-development.js`, `dist/player-aging.js`, dieser Vertrag sowie `work/test-player-development.cjs` und `work/test-player-aging.cjs`. Keine Änderungen an Bestandshooks, Speicherung, Loadern, UI, Rücktritt oder `freekickdemo/`.

## Eingaben und Exporte

Browserexporte: `D6Development` und `D6Aging`. In Node jeweils `module.exports`. Kein Zugriff auf Spielglobals, Storage, Zufall, DOM oder Uhrzeit. Eingaben werden nicht verändert; Ausgaben enthalten eigene Ledgerobjekte und eigene Historieneinträge.

Fähigkeiten und Caps verwenden genau die gemeinsamen Schlüssel `tec,pas,fin,tak,pos,spd,sta,air,gk,calm,ant,dec,str`. Ein vollständiger Entwicklungsspieler enthält mindestens `{id,age,talent,skills,caps}`. Dauerhafte Fähigkeiten und persönliche Caps liegen intern bei 1–20, Caps mindestens auf dem aktuellen Grundwert; Talent ist eine unveränderte ganze Zahl 10–22. Alter ist eine nichtnegative ganze Zahl. Zusätzliche Profilfelder werden weder gelesen noch verändert.

Identitäten sind nichtleere Strings oder sichere ganze Zahlen. Ihre Typen sind Teil der Identität: `1` ist nicht `"1"`. `id` in einem Einsatz bezeichnet den stabilen Einsatz-/Fixturebezug für diesen Spieler. Der Weltadapter ordnet sein `pid` dem reinen Spieler-`id` zu.

Ein Einsatz enthält `{id,worldId,seasonId,minutes,rating,skillWeights}`. Minuten dürfen endliche nichtnegative Bruchteile sein. Die interne endgültige Note liegt auf der gemeinsamen Skala 1–10. Eine sichtbare Note, Wettbewerb oder Vereins-ID sind keine Berechnungseingaben; 1–19 Minuten verwenden dieselbe interne Note und denselben Minutenpfad wie längere Einsätze. Ein Nulleinsatz erzeugt keine Ledgerbuchung.

`skillWeights` ist eine dünn besetzte Abbildung der Fähigkeitsschlüssel auf endliche nichtnegative Gewichte mit positiver Gesamtsumme. Sie beschreibt die **beobachteten passenden Aufgaben des aktuellen Einsatzes**: bei positiver Entwicklung Lernempfänger, bei negativem Betrag tatsächlich beobachtete Schwächen. `approvedWeights` hat dieselbe Form und muss auf allen 13 Schlüsseln exakt übereinstimmen; fehlende Schlüssel entsprechen 0. Unterschiedliche Reihenfolge und zusätzliche explizite Nullen sind gleichwertig, bloß proportional skalierte Zahlen gelten nicht als dieselbe Freigabe. Erst nach dieser Prüfung werden Gewichte intern normalisiert. Keine eingebauten Rollenformeln, Potenzialabstandsgewichte oder als Produktionsstandard übernommenen Beispielgewichte.

Die Gewichte und Noten kommen von P06/P04 beziehungsweise einem vom Integrator freigegebenen synthetischen Prüfdatensatz. Die Zahlenübereinstimmung ersetzt keine fachliche P06-Freigabe: P03 kann ohne beobachtete Ereignisse die Eignung der Gewichte nicht selbst nachweisen.

## Entwicklungstransaktion

```js
D6Development.createLedger(playerId, worldId, seasonId)
D6Development.developmentDelta(player, ledger, appearance, approvedWeights)
// -> {status, reason, skillDelta, nextLedger, rejectedRemainder}
D6Development.resetSeason(ledger, nextSeasonId)
```

`skillDelta` enthält immer alle 13 Schlüssel. Beträge sind unmittelbare Bruchteilsänderungen der Grundfähigkeit, kein Punktebankkonto. `rejectedRemainder` ist der nicht gebuchte **positive Betrag** des rechnerischen positiven oder negativen Budgets; er wird verworfen und nie in spätere Einsätze übernommen. Für einen Einsatz ohne qualifizierten Betrag ist er 0. Bei einem Negativbetrag umfasst er auch Ablehnungen durch den Bruttodeckel oder die Untergrenze.

| Status | Bedeutung |
|---|---|
| `applied` | Mindestens eine Fähigkeit ändert sich; Einsatz und Zähler sind im neuen Ledger erfasst. |
| `no-change` | Bewerteter Einsatz ohne anwendbare Fähigkeitstransaktion; seine Minuten und Historie sind erfasst. Bei `reason: "no-minutes"` bleibt der Ledger vollständig unverändert. |
| `duplicate` | Der Welt-/Saison-/Einsatzbezug wurde bereits verarbeitet; keine weitere Änderung. |
| `unsupported` | Fehlende/ungültige Note, fehlende/ungültige Gewichte, nicht passende Freigabe oder falscher Welt-/Saisonbezug. Keine Teilbuchung und keine Änderung des Ledgers. |

Strukturell ungültige Spieler, Caps, Minuten, Identitäten oder Ledger werfen `TypeError`; sie sind Vertragsfehler. P06-Datenlücken werden dagegen mit `unsupported` und einem lesbaren `reason` offengelegt. Der Integrator hält einen solchen Einsatz vor der Buchung an und verarbeitet spätere Einsätze desselben Spielers erst nach Auflösung der Lücke. Dadurch können unbekannte Leistungen weder eine schwache Serie vortäuschen noch ihre tatsächlichen Minuten aus der Saisonstaffel verschwinden lassen. Es gibt keinen Rückgriff auf historische Noten-/Tor-/Assistformeln.

Der Integrator berechnet den neuen Spieler mit `skills[key] + skillDelta[key]` und speichert diese Fähigkeiten **atomar zusammen mit `nextLedger`**. Nur beide zusammen übernehmen; ein Ledger vor den Fähigkeiten zu speichern würde den Einsatz beim Wiederholen bereits als erledigt behandeln. Die reine Funktion schreibt selbst nichts. Der bisherige Wachstumspfad darf denselben Einsatz nicht parallel buchen.

### Ledger und Saisonwechsel

Der versionierte, JSON-speicherbare Spielerledger enthält:

```js
{
  version: 1, playerId, worldId, seasonId,
  seasonMinutes, weakSeriesMinutes, negativeApplied,
  seasonIds: [/* bereits eröffnete Saisons */],
  ratedWindow: [/* bis zu drei {id,worldId,seasonId,minutes,rating} */],
  processedAppearances: [/* {id,worldId,seasonId} */]
}
```

Ein Ledger gehört dauerhaft zu einem Spieler und einer Welt. Transfers, Laden und Gerätewechsel übernehmen ihn unverändert; Verein und Wettbewerb sind kein Ledgerumfang. Dedupliziert wird der volle Welt-/Saison-/Einsatzbezug. Derselbe Einsatzname darf in einer anderen Saison erneut vorkommen. Bereits erfasste historische Einsätze werden auch nach einem Saisonwechsel als Duplikate erkannt.

`resetSeason` wird ausschließlich beim regulären neuen Welt-Saisonwechsel aufgerufen. Es setzt `seasonMinutes` und die Bruttosumme `negativeApplied` auf 0 und merkt die neue Saison. Erneutes Liefern derselben aktuellen Saison setzt nichts zurück; eine schon früher eröffnete Saison kann nicht wieder geöffnet werden. Ein abweichender Welt-/Saisonbezug im Einsatz setzt Zähler **nicht** automatisch zurück.

Das Leistungsfenster und die schwache Serie bleiben erhalten: Sie sind durch die letzten bewerteten Einsätze beziehungsweise eine Note ab 5,5 definiert; ein zusätzlicher Reset durch die Saisonpause wurde nicht beschlossen. Für eine andere Welt wird ein eigener Ledger angelegt. Der Integrator liefert chronologisch neue Einsätze und reguläre Saisonübergänge, keine Nachberechnung alter Karrieren.

### Leistungsbedingungen und Beträge

Nach jedem vollständigen neuen Einsatz bildet P03 das Fenster der letzten bis zu drei internen Noten. Die Leistungsnote lautet ohne vorherige Rundung `Summe(rating * minutes) / Summe(minutes)`. Bereits die erste oder zweite gute Note kann Wachstum ermöglichen. Das Fenster löst keinen zweiten Lernbetrag für frühere Minuten aus.

Ab Fensterbewertung 6,5 beträgt das Gesamtbudget:

`0.5 * (talent / 19) * ageFactor * staffelgewichtete neue Minuten / 90`

| Alter | Faktor | Positive Empfänger |
|---|---:|---|
| Bis 19 | 1 | Alle tatsächlich passenden, injizierten Fähigkeiten |
| 20–21 | 0,8 | Dieselbe Jugendregel |
| 22–23 | 0,5 | Dieselbe Jugendregel |
| 24–29 | 0,2 | Ausschließlich `calm,ant,dec,pos` |
| Ab 30 | 0,1 | Ausschließlich `calm,ant,dec,pos` |

Die ersten 900 tatsächlichen Saisonminuten zählen mit voller Rate, die nächsten 900 mit einem Viertel, spätere Minuten mit 0. Ein Grenzübertritt innerhalb einer Partie wird geteilt. Auch schlechte, neutrale, sehr kurze oder vollständig durch Caps begrenzte bewertete Einsätze verbrauchen ihre gesamten tatsächlichen Minuten. Ein anderer Altersfaktor setzt den Zähler nicht zurück; Rückgänge geben keine Lernzeit zurück. Alle Wettbewerbe verwenden denselben Zähler und dieselbe Rate.

Die Gewichte werden innerhalb der passenden, alterszulässigen Empfänger normalisiert. Ein erreichter persönlicher Cap entfernt den Empfänger aus der weiteren Verteilung; Restanteile gehen nach denselben injizierten Gewichten nur an weitere passende Empfänger mit Spielraum. Ohne solche Empfänger verfällt der Rest. Es gibt keine zusätzliche Verlangsamung vor dem Cap, keine Capänderung und keine automatische Umleitung auf eine Fähigkeit mit großem Potenzialabstand.

Von 5,5 bis unter 6,5 entsteht kein positiver Betrag. Bis einschließlich 23 ist ein negativer Betrag erst möglich, wenn alle letzten drei Noten jeweils unter 5,5 liegen und die ununterbrochene schwache Serie nach diesem Einsatz mindestens 90 tatsächliche Minuten enthält. Diese Serienminuten können aus mehr als drei Kurzeinsätzen stammen. Eine interne Note ab 5,5 setzt sie auf 0.

Nur die aktuelle qualifizierte Partie trägt `0.1 * eigene Minuten / 90` zum Negativbudget bei. Kein Talent-, Alters- oder positiver Staffelfaktor; keine rückwirkende Belastung früherer schwacher Minuten. Der tatsächlich angewendete negative Gesamtbetrag über alle Fähigkeiten ist pro Spieler/Welt/Saison auf 1 begrenzt. Positive Wiederaufwertung senkt `negativeApplied` nicht. Negative Gewichtsanteile werden unmittelbar auf ihre Empfänger angewendet, höchstens bis Boden 1; ein dort nicht anwendbarer Anteil wird verworfen, ohne neue Verlustempfänger zu erfinden. Caps bleiben unverändert. Ab 24 entstehen aus Matchnoten keine dauerhaften negativen Transaktionen.

### Präzision

Berechnet und gespeichert wird mit JavaScript-Zahlen ohne feste Dezimalrundung oder Ganzpunkt-Schwelle. Die endgültigen Deltas entsprechen den im Zahlenformat darstellbaren Grundwertänderungen. Zähler erfassen tatsächlich angewendete negative Änderungen; die Bruttosumme wird gegen Rundungsreste auf maximal 1 begrenzt. Die Prüftoleranzen entsprechen normaler doppelter Gleitkommapräzision, nicht einer zusätzlichen Spielregel. Identische Eingaben erzeugen identische Ausgaben, auch nach JSON-Speichern/Laden.

## Alterungstransaktion

```js
D6Aging.agingDelta(baseSkills, newAge) // -> vollständiger skillDelta
D6Aging.createLedger(playerId, worldId)
D6Aging.agingTransition(baseSkills, ledger, {worldId,seasonId,newAge})
// -> {status, reason, skillDelta, nextLedger}
```

`agingDelta` berechnet ausschließlich den einmaligen körperlichen Abzug für das bereits erhöhte Alter der neuen Saison. Es bucht selbst keinen Saisonwechsel. `agingTransition` ergänzt die Idempotenz mit einem eigenen Spielerledger `{version:1,playerId,worldId,processedSeasons:[{worldId,seasonId,newAge}]}`. Derselbe Welt-/Saisonbezug erhält nie einen zweiten Abzug. Auch Übergänge unter 30 und Übergänge mit bereits ausgeschöpfter Untergrenze werden als verarbeitet gespeichert. Eine fremde Welt oder ein zuvor nicht erfasster Übergang mit Alter kleiner/gleich dem zuletzt gebuchten Alter liefert `unsupported` ohne Buchung.

| Alter der neuen Saison | `spd` | `str` | `sta` |
|---|---:|---:|---:|
| Bis 29 | 0 | 0 | 0 |
| 30–32 | −0,5 | −0,5 | −0,25 |
| Ab 33 | −1 | −1 | −0,5 |

Alle drei Abzüge sind auf Boden 1 begrenzt. Keeper und Feldspieler folgen demselben Rechner. Kein anderer Fähigkeitsabzug, kein zusätzlicher Qualitätsmultiplikator, keine Veränderung von Talent, Caps, Höhe, Fuß, Rollen, Positionen oder Karriereende.

Der Integrator ruft den Übergang einmal im regulären Saisonablauf nach der bestehenden Alterserhöhung auf und speichert Deltas und Ledger gemeinsam. Ein neu erzeugtes älteres Profil wird nicht für frühere Saisons nachgealtert. Die vorhandene Rücktrittsentscheidung bleibt im bestehenden Pfad; P03 lost keine Rücktritte aus.

## Nachweise und Produktionsgate

Ausgeführt mit dem gebündelten Node v24.19.0:

- `work/test-player-development.cjs`: 18 Szenariogruppen. Exakte Notengrenzen 6,5/5,5, Minutenfenster mit 1/2/5/19 Minuten, Staffel 899/900/1799/1800 und Übergang über beide Grenzen, schlechte Minuten, Wettbewerbsneutralität, Talent 10/19/22 und sämtliche Altersgruppen, 18 schwache Fünf-Minuten-Einsätze, ausschließlich aktuelle negative Partie, Bruttodeckel trotz Wiederaufbau, Caps/Überlauf/Boden, fehlende Daten und Gewichte, Doppelereignisse, Transfer/Laden/Saisonreset, eingefrorene Eingaben und unabhängige Ausgaben, Browser-/Nodegleichheit. 2.000 einzelne Minuten erreichen die Referenzsumme 6,25 ohne zusätzliche Gutschrift.
- Das [akzeptierte Sechs-Spiele-Stürmerbeispiel](../stuermer-sechs-spiele-entwicklung.md) wird mit den vorhandenen [JSON-Beispieldaten](../../outputs/stuermer-sechs-spiele-2026-10-07.json) über alle acht Saisons reproduziert: alle Jahres-/Gesamtmengen, individuellen Fähigkeiten und beispielhaften Positionsqualitäten stimmen innerhalb der dokumentierten Gleitkommapräzision. Nur im Test wird der historische Beispielschlüssel `ruhe` auf den gemeinsamen Schlüssel `calm` abgebildet. Die Beispielgewichte sind ausdrücklich illustrative Prüfparameter.
- `work/test-player-aging.cjs`: 8 Szenariogruppen. Altersgrenzen 29/30/32/33, Untergrenze, Keeper/Feldgleichheit, einmaliger Übergang, historische Wiederholung und rückwärts gelieferter neuer Übergang, falsche Welt, JSON-Laden/Transfer, reine Eingaben, Browser-/Nodegleichheit sowie ungültige Daten.

Diese Nachweise verwenden synthetische RatedAppearance-Daten. P06 muss weiterhin echte interne Noten auch für kurze Einsätze, beobachtete Rollen-/Aktionsbezüge und freigegebene Verteilungsgewichte liefern. P01 muss bestätigte persönliche Caps/Talentdaten für die ausdrücklich neuen lokalen Prüfwelten liefern. Die Produktionsfreigabe verlangt echte neue Fixture-Records aus sichtbaren und kompakten Partien sowie gemeinsame Speicherung/Replay-/Paritätsprüfung. P03 enthält keinen Ersatz für fehlende reale Matchdaten. Bestehende Karrieren werden weder ergänzt noch umgerechnet. Sämtliche Zahlen, Talentwerte, Caps und Ledger bleiben intern und gehen nicht an UI-Renderer.
