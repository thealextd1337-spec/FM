'use strict';

// Vergleich der bestätigten neuen Tageserholung mit der früheren Arbeitsannahme; keine Produktengine.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const baseline = JSON.parse(fs.readFileSync(path.join(root, 'outputs/freshness-season-proposal-2026-10-06/results.json'), 'utf8'));
const dayMs = 86400000;
const day = date => Date.parse(`${date}T00:00:00Z`) / dayMs;
const cap = value => Math.max(0, Math.min(100, value));
const recoveries = {
  fixed: fresh => cap(fresh + 7.5),
  fasterEarly: fresh => cap(fresh + 3 + .25 * (100 - fresh)),
};
function simulate(mode, withEurope, postMatchRecovery = baseline.assumptions.postMatchRecovery) {
  const calendar = new Map(baseline.fixtures.filter(f => withEurope || f.competition !== 'europe').map(f => [f.day, f]));
  let fresh = 100;
  const matches = [];
  for (let d = day('2027-08-01'); d <= day('2028-03-31'); d++) {
    const fixture = calendar.get(d);
    if (!fixture) { fresh = recoveries[mode](fresh); continue; }
    const row = { date: fixture.date, label: fixture.label, start: fresh };
    row.beforeHalftime = cap(fresh - baseline.assumptions.halfConsumption);
    row.afterHalftime = cap(row.beforeHalftime + baseline.assumptions.halftimeRecovery);
    row.atFulltime = cap(row.afterHalftime - baseline.assumptions.halfConsumption);
    row.afterMatch = cap(row.atFulltime + postMatchRecovery);
    fresh = row.afterMatch;
    matches.push(row);
  }
  const summary = {
    mode, withEurope, postMatchRecovery, matches: matches.length,
    minStart: Math.min(...matches.map(m => m.start)),
    minAtFulltime: Math.min(...matches.map(m => m.atFulltime)),
    zeroAtFulltime: matches.filter(m => m.atFulltime === 0).length,
    startsBelow70: matches.filter(m => m.start < 70).length,
    freshnessOnMarch31: fresh,
  };
  return { mode, withEurope, postMatchRecovery, matches, summary };
}
const scenarios = [simulate('fixed', false), simulate('fasterEarly', false), simulate('fixed', true), simulate('fasterEarly', true)];
const currentScenarios = [simulate('fasterEarly', false, 10), simulate('fasterEarly', true, 10)];
for (const reference of baseline.scenarios.slice(0, 2)) {
  const reproduced = scenarios.find(s => s.mode === 'fixed' && s.withEurope === (reference.id === 'with'));
  assert.equal(reproduced.matches.length, reference.matches.length);
  reproduced.matches.forEach((m, i) => {
    assert.equal(m.date, reference.matches[i].date);
    for (const key of ['start', 'beforeHalftime', 'afterHalftime', 'atFulltime', 'afterMatch']) assert.equal(m[key], reference.matches[i][key]);
  });
}
const recoveryExamples = Object.entries(recoveries).map(([mode, recover]) => {
  let fresh = 55;
  const values = [fresh];
  for (let i = 0; i < 6; i++) { fresh = recover(fresh); values.push(fresh); }
  assert.equal(fresh, 100, 'Standardverlust nach sechs vollen Ruhetagen ausgeglichen');
  return { mode, initialFreshness: 55, values };
});
const currentRecoveryExample = { initialFreshness: 50, values: [50] };
for (let i = 0; i < 6; i++) currentRecoveryExample.values.push(recoveries.fasterEarly(currentRecoveryExample.values.at(-1)));
assert.equal(currentRecoveryExample.values[5] < 100, true);
assert.equal(currentRecoveryExample.values[6], 100, 'Aktuelles Beispiel nach sechs vollen Ruhetagen erholt');
for (const scenario of [...scenarios, ...currentScenarios]) for (const row of scenario.matches) for (const key of ['start', 'beforeHalftime', 'afterHalftime', 'atFulltime', 'afterMatch']) assert.ok(Number.isFinite(row[key]) && row[key] >= 0 && row[key] <= 100);
for (const scenario of currentScenarios) for (const row of scenario.matches) assert.equal(row.afterMatch, cap(row.atFulltime + 10));

const output = path.join(root, 'outputs/freshness-recovery-proposal-2026-10-06');
fs.mkdirSync(output, { recursive: true });
const acceptedNormalLoadTarget = { playerType: 'Feldspieler', condition: 10, playedMinutes: 90, load: 'normal', startFreshness: 100, beforeHalftime: 65, afterHalftime: 75, atFulltime: 40, afterMatch: 50, totalConsumption: 70, scope: 'Referenzziel; keine pauschale Verbrauchsformel für andere Spieler, Belastungen oder Startfrische.' };
acceptedNormalLoadTarget.conditionInfluenceReferences = [
  { condition: 6, totalConsumption: 80, atFulltime: 30, afterMatch: 40 },
  { condition: 10, totalConsumption: 70, atFulltime: 40, afterMatch: 50 },
  { condition: 14, totalConsumption: 60, atFulltime: 50, afterMatch: 60 },
];
acceptedNormalLoadTarget.conditionInfluenceScope = 'Bestätigte Referenzen bei gleicher normaler Belastung, Startfrische 100, vollen 90 Minuten und zweimal +10 Erholung. Keine lineare Gesamtkurve oder Halbzeitaufteilung für Kondition 6/14 beschlossen.';
acceptedNormalLoadTarget.actualLoadReferences = [
  { load: 'Ruhiges Positionsspiel', totalConsumption: 60, atFulltime: 50, afterMatch: 60 },
  { load: 'Normal', totalConsumption: 70, atFulltime: 40, afterMatch: 50 },
  { load: 'Intensives Pressing mit vielen Sprints', totalConsumption: 80, atFulltime: 30, afterMatch: 40 },
];
acceptedNormalLoadTarget.actualLoadScope = 'Bestätigte Referenzen bei Kondition 10, Startfrische 100, vollen 90 Minuten und zweimal +10 Erholung. Tatsächlich ausgeführte Belastung; keine festen Verbrauchsmodi durch Rollen oder Taktikanweisungen. Aktionsgewichte und Kombination mit anderen Konditionswerten offen.';
fs.writeFileSync(path.join(output, 'comparison.json'), JSON.stringify({ status: 'Tageserholung und einmalig +10 direkt nach Abpfiff als Planungsmodell bestätigt; Referenzziel für normale Belastung bei Kondition 10 bestätigt; allgemeine Verbrauchsformel offen, keine Produktengine.', planningDecisions: { normalLoadReferenceAccepted: acceptedNormalLoadTarget, dailyRecoveryAccepted: true, postMatchRecoveryAccepted: 10, productImplementation: false, halfConsumption35Accepted: false, postMatchRecovery15Accepted: false }, originalAssumptions: baseline.assumptions, currentAssumptions: { ...baseline.assumptions, postMatchRecovery: 10, dailyRecovery: '+3 plus 25 Prozent der fehlenden Frische je vollem spielfreien Kalendertag; höchstens 100' }, changedAssumption: 'Bestätigte tägliche Erholung: +3 Punkte plus 25 Prozent der aktuell zu 100 fehlenden Frische; Nachspielerholung einmalig +10 direkt nach Abpfiff. Jeweils begrenzt auf 100.', unchanged: ['Kalender', 'jede Partie 90 Minuten', '35 Verbrauch je Halbzeit als konstante Rechenannahme; Normalbelastungsziel bei Kondition 10 bestätigt', 'bestätigte +10 Halbzeit'], recoveryExamples, scenarios, currentRecoveryExample, currentScenarios }, null, 2) + '\n');
const f = value => value.toLocaleString('de-DE', { maximumFractionDigits: 1 });
const report = [
  '# Frischeerholung – aktueller Plan und Modellvergleich', '',
  'Stand: 6. Oktober 2026. Ergänzung zum [Saisonbeispiel](frische-saison-beispiel.md). Tageserholung, einmalig +10 in der Halbzeit und einmalig +10 direkt nach Abpfiff sind als Planungsmodell bestätigt; jeweils höchstens bis 100. Der Referenzverlauf für normale Belastung bei Kondition 10 ist ebenfalls bestätigt. Die allgemeine Verbrauchsformel bleibt offen; kein umgesetztes Müdigkeitsmodell.', '',
  '## Aktueller Plan mit +10 nach Abpfiff', '',
  'Die Nachspielerholung +10 ersetzt den früheren unbestätigten Vorschlag +15. Tageserholung bleibt +3 plus 25 Prozent der aktuell bis 100 fehlenden Frische je vollem spielfreien Kalendertag. Kalender, volle 90 Minuten und beispielhafter Verbrauch 35 je Halbzeit bleiben für diese Rechnung gleich. Kein Rotationswechsel.', '',
  '| Europacup | Partien | Niedrigste Startfrische | Niedrigste Frische bei Abpfiff | Partien mit 0 bei Abpfiff |',
  '| --- | ---: | ---: | ---: | ---: |',
  ...currentScenarios.map(s => `| ${s.withEurope ? 'Ja, bis Finale' : 'Nein, Pokal bis Finale'} | ${s.summary.matches} | ${f(s.summary.minStart)} | ${f(s.summary.minAtFulltime)} | ${s.summary.zeroAtFulltime} |`), '',
  'Bestätigtes Referenzziel für einen Feldspieler mit Kondition 10, normaler Belastung und vollen 90 Minuten: 100 bei Anpfiff → 65 vor Halbzeit → 75 nach Halbzeit → 40 bei Abpfiff → 50 nach Nachspielerholung. Gesamtverbrauch 70, davon 35 je Halbzeit, sowie zweimal +10 Erholung. Bei denselben Voraussetzungen sind auch die Konditionsreferenzen 6 und 14 bestätigt:', '',
  '| Kondition intern | Gesamtverbrauch | Frische bei Abpfiff | Frische nach Nachspielerholung |',
  '| ---: | ---: | ---: | ---: |',
  ...acceptedNormalLoadTarget.conditionInfluenceReferences.map(r => `| ${r.condition} | ${r.totalConsumption} | ${r.atFulltime} | ${r.afterMatch} |`), '',
  'Zusätzlich bestätigte Belastungsabstufung bei Kondition 10, Startfrische 100 und vollen 90 Minuten:', '',
  '| Tatsächliche Belastung | Gesamtverbrauch | Frische bei Abpfiff | Frische nach Nachspielerholung |',
  '| --- | ---: | ---: | ---: |',
  ...acceptedNormalLoadTarget.actualLoadReferences.map(r => `| ${r.load} | ${r.totalConsumption} | ${r.atFulltime} | ${r.afterMatch} |`), '',
  'Die Belastungsreferenzen sind Ziele für tatsächlich ausgeführte Aktionen; Rollenname oder Taktikanweisung allein erzeugen keinen festen Verbrauch. Aktionsgewichte und Kombination mit anderen Konditionswerten bleiben offen.', '',
  'Die konkrete Aufteilung in Grund- und Aktionsbelastung, Zwischenwerte, Randwerte und die allgemeine Konditionsformel bleiben offen; keine lineare Gesamtkurve beschlossen. Die Saisonrechnung verwendet weiterhin nur den konstanten Verbrauch der Kondition-10-Referenz und überträgt ihn auch auf müde gestartete Partien; diese Übertragung ist eine Rechenannahme.', '',
  '| Volle Ruhetage danach | Frische mit bestätigter Tageserholung |',
  '| ---: | ---: |',
  ...currentRecoveryExample.values.map((value, i) => `| ${i} | ${f(value)} |`), '',
  'Nach sechs vollen Ruhetagen ist dieser Referenzspieler wieder bei 100. Das garantiert keine vollständige Erholung nach sechs Tagen bei jeder aufgestauten Müdigkeit oder künftigen Belastungsformel.', '',
  '## Historischer Vergleich mit damals angenommenen +15 nach Abpfiff', '',
  'Die folgenden Werte bewahren den früheren Vergleich. +15 war dabei eine unbestätigte Arbeitsannahme und wurde durch die aktuelle Entscheidung +10 ersetzt.', '',
  '## Verglichene Annahmen', '',
  'Beide historischen Varianten verwenden denselben Kalender, dieselbe Belastung von 35 Frischepunkten je Halbzeit, die bestätigte Halbzeiterholung +10 und die damalige unbestätigte direkte Nachspielerholung +15. Jeder Spieler spielt jede Partie volle 90 Minuten, ohne Rotation und ohne Veränderung der Kondition.', '',
  '- Bisherige Arbeitsannahme: +7,5 je vollem spielfreien Kalendertag.',
  '- Bestätigtes neues Planungsmodell: täglich +3 plus 25 Prozent der aktuell bis 100 fehlenden Frische, begrenzt auf 100. Aus müdem Zustand erfolgt stärkere anfängliche Erholung, nahe 100 geringere Erholung. Ersetzt die frühere konstante Tageserholung, keine zusätzliche doppelte Tagesgutschrift.',
  '- Beide Varianten gleichen den Standardverlust einer ausgeruht begonnenen Partie von 100 auf 55 nach sechs vollen spielfreien Tagen aus. Stark aufgestaute Müdigkeit kann länger benötigen. Die neue Kurve für Tageserholung ändert keine bestätigte Fähigkeitskurve innerhalb des Matches.', '',
  '## Saisonvergleich', '',
  '| Europacup | Tageserholung | Partien | Niedrigste Startfrische | Niedrigste Frische bei Abpfiff | Partien mit 0 bei Abpfiff |',
  '| --- | --- | ---: | ---: | ---: | ---: |',
  ...scenarios.map(s => `| ${s.withEurope ? 'Ja, bis Finale' : 'Nein, Pokal bis Finale'} | ${s.mode === 'fixed' ? 'Konstant +7,5' : 'Schneller am Anfang'} | ${s.summary.matches} | ${f(s.summary.minStart)} | ${f(s.summary.minAtFulltime)} | ${s.summary.zeroAtFulltime} |`), '',
  '## Sechs Ruhetage nach einer ausgeruht begonnenen Partie', '',
  '| Volle Ruhetage | Konstante Erholung | Bestätigte Tageserholung |',
  '| ---: | ---: | ---: |',
  ...recoveryExamples[0].values.map((value, i) => `| ${i} | ${f(value)} | ${f(recoveryExamples[1].values[i])} |`), '',
  '## Bewertung und Grenzen', '',
  'Die bestätigte Tageserholung reduziert im konkreten Europacupkalender die aufgestaute Müdigkeit zwischen Partien deutlich. Mit aktuell +10 nach Abpfiff bleiben die Spieler etwas müder als im vorherigen +15-Vergleich. Bei engen Wochen erreichen sie weiterhin unter 30 Frische bei Abpfiff; die bestätigten stärkeren Müdigkeitswirkungen bleiben relevant. Rotation ist weiterhin eine mögliche Verbesserung und wird nicht als Pflicht bei einer bestimmten Schwelle beschlossen.', '',
  'Das Ergebnis hängt von der noch offenen Verbrauchsformel ab. Es ist keine allgemeine Balancefreigabe für jeden Konditionswert, Kalender, Einsatzumfang oder Belastungsstil. Insbesondere ist 35 je Halbzeit ein Referenzziel für die beschriebene Normalbelastung, keine festgelegte Formel für alle Spieler. Die tatsächliche Belastung und Kondition müssen vor Umsetzung zusätzlich kalibriert werden.', '',
  'Tageserholung, direkter Nachspielbonus +10 und Referenzverlauf einer normalen ausgeruht begonnenen Partie bei Kondition 10 sind als Planungsmodell übernommen. Dies bestätigt keinen pauschalen Verbrauch 35 je Halbzeit für alle Spieler. Die bestehenden bestätigten maximalen Fähigkeitsabzüge bleiben unverändert; keine Laufzeitimplementation.', '',
  '## Nachweise', '',
  '- [Alle Vergleichswerte und Annahmen](../outputs/freshness-recovery-proposal-2026-10-06/comparison.json).',
  '- [Reproduzierbare Rechnung](../work/compare-freshness-recovery-proposal-2026-10-06.cjs).',
  '- Originale Saisonrechnung exakt reproduziert; Frischegrenzen und Standarderholung über sechs volle Tage geprüft. Keine Laufzeitänderung oder Anpassung alter Spielstände.', '',
].join('\n');
fs.writeFileSync(path.join(root, 'docs/frische-erholung-vergleich.md'), report);
console.log(JSON.stringify({ currentSummaries: currentScenarios.map(s => s.summary), currentRecoveryExample, historicalSummaries: scenarios.map(s => s.summary) }, null, 2));
