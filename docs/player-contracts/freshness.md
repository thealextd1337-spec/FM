# P02: Frischeverbrauch und Erholung

Die spätere [native lokale Integration v158](../platform/freshness-load-v158.md) verwendet dieses unveränderte Modul für neue Prüfkarrieren. Ihr gesonderter Deduplikationsvertrag behält die vollständige Ledger des laufenden Einsatzes einschließlich Checkpoints. Nach erfolgreicher Matchverbuchung ist `fixture.matchRecord` die Wiederholsperre; der dauerhafte Frische-Endwert beginnt eine neue Kalenderbasis. Kalendercursor und tatsächliche Einsatztage bleiben gespeichert. Die folgenden Schnittstellenregeln beziehen sich auf einen einzelnen noch verarbeitbaren P02-Zustand; dessen Ledger darf während des laufenden Einsatzes weiterhin nicht gekürzt werden.

Stand: 8. Oktober 2026. Reines Modul für Welle 2, lokal geprüft und noch ohne bestehende Match-/Kalender-/Speicherintegration. Grundlage: [Welle 2](wave2.md), [P02](../agentenauftraege/01-spieler-karriere-taktik.md#p02--effektive-fähigkeiten-frischeverbrauch-und-erholung), [Müdigkeitsplan](../muedigkeit-faehigkeiten-plan.md) und [Erholungsvergleich](../frische-erholung-vergleich.md). Verbrauchsgewichte, Konditionsverläufe und Keeper-Aufteilung bleiben ausdrücklich freizugebende Parameter.

Quelle: `dist/player-freshness.js`. Browserexport `D6Freshness`, Nodeexport `module.exports`. Keine Spiel-/Storage-Wrapper, Uhr, Zufallsziehung oder UI. Jeder Übergang gibt einen neuen serialisierbaren Zustand zurück und verändert keine Eingabe. Der Integrator allein persistiert ihn. Vollständiger Ledger wird mitgespeichert; Kürzen ohne gesonderten Deduplikationsvertrag ist nicht zulässig. Ledger und exakte Zahlen sind intern.

## Schnittstellen und Zustand

`createState(id, freshness) -> state` erstellt ausdrücklich einen neuen P02-Zustand. `id` ist die interne Spieler-ID, im Weltadapter vom bestehenden `pid` übersetzt. Frische wird auf 0–100 begrenzt; es gibt keinen fehlenden Frischedefault. Schema ist `d6-freshness-1`.

Zustand: `{schema, id, freshness, ledger: {loads, fixtures, transitions}}`. Jede Fixture hält Kondition, Keeperkennung, den numerisch wirksamen Parametersatz als `loadConfig`, Vereinigungsintervalle tatsächlicher Einsatzminuten, eindeutige Ereignisse, gruppierte physische Ursachen und gesamten angeforderten Verbrauch. `fixture.consumed` misst die Belastung auch dann weiter, wenn Frische bereits 0 erreicht; es ist keine zusätzliche Buchung unter 0.

`consumeFreshness(state, load, approvedParameters) -> nextState`

`load` enthält:

- `id`: stabile Transport-/Verarbeitung-ID; `fixtureId`: stabile Partie-ID.
- `stamina`: dauerhafte Kondition 1–20; `keeper`: Boolean. Beide bleiben innerhalb derselben Fixture unverändert.
- `intervals`: ausdrücklich tatsächliche Einsatzintervalle `{startMinute,endMinute}` in virtuellen Minuten, Beginn mindestens 0, Ende größer als Beginn. Bruchteile sind zulässig. Überlappende oder erneut gelieferte Intervalle werden vereinigt; nur neu abgedeckte Minuten verbrauchen Grundlast. Eine Einwechslung in Minute 85 liefert beispielsweise `[85,90]`, keine volle Partie.
- `events`: ausdrücklich tatsächlich ausgeführte Aktionen. Jedes Ereignis hat stabile `id`, `causeId`, virtuellen Zeitpunkt `minute`, `type` und bei lauf-/zweikampfbezogenen Aktionen beobachtete `units` mindestens 0. Zeitpunkt muss in einem tatsächlichen Einsatzintervall liegen, einschließlich Kontakt am Intervallende. Eine Anweisung, Rolle oder geplante Bewegung ist kein ausgeführtes Ereignis.

Unterstützte Ereignistypen: `sprint`, `pressing`, `intense-duel`, `keeper-jump`, `keeper-dive`, `field-jump`. Die Einheit für Sprint-/Pressing-/Zweikampfbelastung muss der Enginevertrag bestimmen; ohne diese Definition kann die Kostenkalibrierung nicht produktiv verwendet werden. Für tatsächlichen einfachen Keeperabsprung und volle Hechtaktion zählt jeweils eine Aktion; übergebene `units` ändern diese Kosten nicht. Ergebnis/Paradeerfolg verändert die Kosten nicht.

`serializeState(state) -> JSONText`, `restoreState(JSONText) -> state` bewahren Ledger und Frische. Diese Hilfen führen keine Spielmigration oder Rekonstruktion alter Aktionen aus.

## Explizite Belastungsparameter

Pflichtparameter:

```text
loadPartition.field  = {basePerMinute, normalActionCost90}
loadPartition.keeper = {basePerMinute, normalActionCost90}
actionRates         = {sprint, pressing, intenseDuel}
staminaFactor(stamina, kind) -> positiver Faktor
```

Alle Kosten sind endliche Zahlen mindestens 0; `kind` ist `field` oder `keeper`. Die Funktion muss rein, deterministisch und für Kondition 1–20 definiert sein. Der Zustand speichert keine Funktion; derselbe freigegebene Parametersatz wird nach Laden erneut vom Integrator geliefert. Änderungen der für den Einsatz wirksamen Grundrate, Aktionssätze oder Konditionsfaktoren werden auch nach Restore abgewiesen. Der Faktor muss mit steigender Kondition sinken oder gleich bleiben. Das Modul prüft die ganzzahligen Stufen und die bestätigten Referenzen. Der Verlauf dazwischen und außerhalb der drei Feldreferenzen ist eine ausdrücklich übergebene Kalibrierung, keine neu beschlossene Produktkurve.

Validierte Referenzen bei Kondition 10:

- `field.basePerMinute * 90 + field.normalActionCost90 = 70`.
- `keeper.basePerMinute * 90 + keeper.normalActionCost90 = 40`.
- `staminaFactor(10,'field') = staminaFactor(10,'keeper') = 1`.
- `staminaFactor(6,'field') = 80/70`, `staminaFactor(14,'field') = 60/70`.

`normalActionCost90` beschreibt den zur Normalreferenz gehörenden tatsächlichen Aktionsanteil und wird selbst nicht pauschal verbraucht. In der Partie werden allein die beobachteten Aktionen belastet. Damit sind Keeper-Grundlast plus sämtliche typischen Sprungkosten zusammen 40, keine Grundlast 40 mit Sprüngen zusätzlich. Andere Keeper-Konditionswerte verwenden den ausdrücklich gelieferten eigenen Konditionsfaktor; eine Übernahme der Feldspielerkurve ist keine implizite Regel.

Grundverbrauch = neu gespielte virtuelle Minuten × ausdrückliche Grundrate × Konditionsfaktor. Tatsächlicher Sprint/Pressing/intensiver Zweikampf = beobachtete Einheiten × ausdrücklicher Aktionssatz × Konditionsfaktor. Einfacher Keeperabsprung = 0,5 × Keeper-Konditionsfaktor; volle Hechtaktion = 1 × Keeper-Konditionsfaktor. Somit sind die bestätigten 0,5/1 bei Kondition 10 exakt. Kopfballsprünge von Feldspielern kosten 0; das beeinflusst deren andere tatsächliche Belastung nicht.

### Überschneidungen und Deduplikation

Ereignis-IDs sind je Spieler/Fixture eindeutig. Wiederholte IDs mit identischem normiertem Inhalt sind inert; widersprüchlicher Inhalt ist ein Fehler. Load-IDs gelten im gesamten Spielerledger und werden ebenso geprüft. Überlappende Minuten werden unabhängig von Load-ID und Aufteilung einmal belastet.

`causeId` identifiziert dieselbe physische Aktion auch bei mehreren Beschreibungen. Sprint und Pressing derselben Laufursache teilen eine Belastungsgruppe; es gilt der höhere einmalige Kostenbeitrag, keine Addition. Keeperabsprung und Hechten derselben Luftaktion teilen eine Gruppe; Hechten kostet einmal 1, nicht 1+0,5. Kommt die stärkere Beobachtung in einem späteren Batch, wird nur die noch nicht erfasste Differenz gebucht. Intensive Zweikampfbelastung ist eine getrennte physische Gruppe; dieselbe `causeId` kann zugleich einen Lauf und einen tatsächlich intensiven Kontakt beschreiben. Unabhängige Aktionen müssen verschiedene Ursachen erhalten. Stabile vollständige Aktionsursachen sind Pflicht; Animation/Replays erzeugen keine neuen Ursachen.

Die Simulation liefert Belastung und Erholungsübergänge in virtueller Reihenfolge. Zu einem abgeschlossenen Halbzeit-/Abpfiffübergang gehören zuvor alle tatsächlichen Belastungen dieses Abschnitts. Nachträgliche neue Beobachtungen aus einem bereits erholten Abschnitt sind kein freigegebener Rekonstruktionspfad; der Integrator muss sie vor dem Übergang vollständig liefern. Replays dürfen bereits bekannte Ereignisse erneut liefern.

## Bestätigte Erholung

`recoverFreshness(state, transition) -> nextState`.

- Halbzeit: `{id,type:'halftime',fixtureId}`, genau +10 bis 100.
- Abpfiff: `{id,type:'final-whistle',fixtureId}`, genau +10 bis 100.
- Voller spielfreier Kalendertag: `{id,type:'rest-day',dayId,fullMatchFreeDay:true}`, `min(100,F+3+0.25*(100-F))`.

Jeder Übergang benötigt eine stabile ID. Zusätzliche Sicherung: je Fixture nur einmal pro Halbzeit-/Abpfifftyp, je `dayId` nur einmal Tageserholung, selbst bei neuer Transport-ID. Dieselbe ID mit widersprüchlichem Inhalt ist ein Fehler. Mehrere volle Ruhetage werden in Kalenderreihenfolge einzeln verarbeitet, stets mit der aktuellen Frische. Weder echte Pausendauer noch Gerätegeschwindigkeit, Renderzeit, Training oder eine Zahl „vergangene Echtzeittage“ wird gelesen. Der Kalendercontroller bestimmt vollständige spielfreie Tage und die auf Spieler anzuwendenden Matchübergänge; das Modul entscheidet keine Bank-/Wechsel-/Kalenderregeln.

## Prüfungen und offene Produktgates

`work/test-player-freshness.cjs`: zehn bestandene Prüfgruppen am 8. Oktober 2026. Feldreferenz 100→65→75→40→50; Kondition 6/10/14 mit Verbrauch 80/70/60; tatsächliche Belastung ruhig/normal/intensiv mit 60/70/80; Keeper 100→80→90→70→80 inklusive normaler Aktionen. Identische Kosten bei verfehlter Keeperparade, Sprint-/Pressing- und Keeper-Deduplikation, keine Feldsprungkosten, Einwechslung/Kurzeinsatz/überlappende Bruchteilsminuten, eingefrorene Eingaben, doppelte IDs/Übergänge, Pause erneut öffnen, JSON-Restore, sechs iterierte Ruhetage von 50 auf 100, Frischegrenzen, Parameterfehler und UMD-Export geprüft.

Testkandidaten sind klar im Prüfskript markiert: Feldgrundlast 60/90, Keepergrundlast 30/90, normaler Aktionsanteil jeweils 10 und Aktionssätze/zusätzliche Konditionsverläufe. Diese Aufteilung dient ausschließlich dem reproduzierbaren Referenznachweis. Ruhig/normal/intensiv sind Testverläufe mit unterschiedlichen tatsächlichen Ereignissen, keine produktiven Belastungsmodi.

Vollständiger **Kandidat ausschließlich für lokale Referenzprüfungen**; nicht ohne ausdrückliche Freigabe in normale Vereinswelten übernehmen:

```javascript
const candidateLoadParameters = {
  loadPartition: {
    field: {basePerMinute: 60 / 90, normalActionCost90: 10},
    keeper: {basePerMinute: 30 / 90, normalActionCost90: 10}
  },
  actionRates: {sprint: 1, pressing: 1, intenseDuel: 1},
  staminaFactor(stamina, kind) {
    if (kind === 'field') return (95 - 2.5 * stamina) / 70;
    return stamina <= 10
      ? 1 + (10 - stamina) * 0.04
      : 1 - (stamina - 10) * 0.02;
  }
};
```

Die normale Feldreferenz des Tests beobachtet pro Halbzeit 2 Sprinteinheiten, 1 davon unabhängige Pressingeinheit und 2 intensive Zweikampfeinheiten, also 5 Aktionspunkte zusätzlich zu 30 Grundlast. Die ruhige Szene hat keine zusätzliche Aktionslast; die intensive Szene beobachtet 5 Sprint-/3 Pressing-/2 Zweikampfeinheiten. Die Keeperreferenz beobachtet pro Halbzeit vier einfache Absprünge und drei davon unabhängige volle Hechtaktionen, insgesamt 5 Aktionspunkte plus 15 Grundlast. Diese Häufigkeiten und Einheiten sind Referenzkandidaten, keine bestätigte reale Aktionsverteilung.

Produktaktivierung wartet auf tatsächlichen Ereignisvertrag für sichtbare und kompakte Simulation, bestätigte Einheiten/Gewichte, Keeper-Grund-/Aktionsaufteilung, allgemeine Feld-/Keeper-Konditionskurven, identische Speicherung und Kalender-/Matchübergänge. Nur ausdrücklich neue lokale Prüfwelten dürfen zusätzliche Zustände erhalten. Kein Nachberechnen, Umrechnen oder Ergänzen vorhandener Karrieren.

Lesend geprüfte Integrationsanker: `world-match-v64.js:44` erholt aktuell pauschal über absolute Tage; `:99` delegiert rollen-/taktikabhängige alte Grundlast an `v51Workload`, `:256` verbraucht `full/90`, `:288` übernimmt Endfrische. `strength-v55.js:89` ersetzt `v51Workload` wiederum mit alters-/form-/Pressinglabel-Einfluss. Diese alten Pfade sind kein tatsächlicher Aktionsvertrag. Der Integrator muss sie für neue Prüfwelten gemeinsam zuordnen; kein zusätzlicher Verbrauch neben den alten Abzügen. Dieses Paket ändert keine Bestandsdatei, Speicherintegration, Quellseite oder Buildliste.
