'use strict';

// Rechenbeispiel für den Planungsstand, keine Simulation der Produktengine.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const dayMs = 86400000;
const day = iso => Date.parse(`${iso}T00:00:00Z`) / dayMs;
const iso = value => new Date(value * dayMs).toISOString().slice(0, 10);
const cap = value => Math.min(100, Math.max(0, value));
const assumptions = {
  initialFreshness: 100,
  halfConsumption: 35,
  halftimeRecovery: 10,
  postMatchRecovery: 15,
  dailyRestRecovery: 7.5,
  minutesPerMatch: 90,
  rotationThreshold: 70,
  confirmed: ['Halbzeiterholung +10, begrenzt auf 100'],
  unconfirmed: ['35 Verbrauch je Halbzeit', '+15 direkt nach Abpfiff', '+7,5 je vollem spielfreien Tag', 'Rotation unter 70 Frische'],
  interpretation: 'Ein frischer Referenzspieler verliert netto 45 Punkte je vollem Spiel einschließlich Halbzeit- und Nachspielannahme. Sechs volle Ruhetage gleichen dies mit 7,5 Punkten täglich aus. Keine Übertragung auf jede Kondition oder Belastung.',
};
const fixtures = [
  ['2027-08-14', 'Liga 1', 'league'], ['2027-08-28', 'Liga 2', 'league'],
  ['2027-09-08', 'Pokal Viertelfinale', 'cup'], ['2027-09-18', 'Liga 3', 'league'],
  ['2027-10-09', 'Liga 4', 'league'], ['2027-10-13', 'Europacup Ligaphase 1', 'europe'],
  ['2027-11-03', 'Pokal Halbfinale', 'cup'], ['2027-11-10', 'Europacup Ligaphase 2', 'europe'],
  ['2027-11-13', 'Liga 5', 'league'], ['2027-12-04', 'Liga 6', 'league'],
  ['2027-12-08', 'Europacup Ligaphase 3', 'europe'], ['2028-01-15', 'Liga 7', 'league'],
  ['2028-01-19', 'Europacup Ligaphase 4', 'europe'], ['2028-02-09', 'Europacup Viertelfinale Hinspiel', 'europe'],
  ['2028-02-12', 'Liga 8', 'league'], ['2028-02-23', 'Europacup Viertelfinale Rückspiel', 'europe'],
  ['2028-03-04', 'Liga 9', 'league'], ['2028-03-08', 'Europacup Halbfinale Hinspiel', 'europe'],
  ['2028-03-15', 'Europacup Halbfinale Rückspiel', 'europe'], ['2028-03-18', 'Liga 10', 'league'],
  ['2028-03-22', 'Pokal Finale', 'cup'], ['2028-03-29', 'Europacup Finale', 'europe'],
].map(([date, label, competition]) => ({ date, day: day(date), label, competition }));

const week = value => value - (new Date(value * dayMs).getUTCDay() + 6) % 7;
const nonLeagueWeeks = new Map();
for (let i = 0; i < fixtures.length; i++) {
  const f = fixtures[i];
  assert.equal(new Date(f.day * dayMs).getUTCDay(), f.competition === 'league' ? 6 : 3);
  if (i) assert.ok(f.day - fixtures[i - 1].day - 1 >= 2, 'Mindestens zwei volle Ruhetage zwischen Pflichtspielen');
  if (f.competition !== 'league') {
    const prior = nonLeagueWeeks.get(week(f.day));
    assert.ok(!prior || prior === f.competition, 'Kein nationaler Pokal und Europacup in derselben Woche');
    nonLeagueWeeks.set(week(f.day), f.competition);
  }
}
assert.deepEqual(['league', 'cup', 'europe'].map(c => fixtures.filter(f => f.competition === c).length), [10, 3, 9]);
assert.equal(cap(100 - 35 + 10 - 35 + 15 + 6 * 7.5), 100);

function simulate(id, title, withEurope, rotation) {
  const calendar = new Map(fixtures.filter(f => withEurope || f.competition !== 'europe').map(f => [f.day, f]));
  let fresh = assumptions.initialFreshness;
  const matches = [];
  const points = [];
  let previousFixture = null;
  for (let d = day('2027-08-01'); d <= day('2028-03-31'); d++) {
    const f = calendar.get(d);
    if (!f) {
      fresh = cap(fresh + assumptions.dailyRestRecovery);
      points.push({ x: d + .9, fresh, date: iso(d), phase: 'Ruhetag' });
      continue;
    }
    const start = fresh;
    const restedDays = previousFixture === null ? null : d - previousFixture - 1;
    const played = !rotation || start >= assumptions.rotationThreshold;
    previousFixture = d;
    const row = { ...f, restedDays, played, start };
    points.push({ x: d + .1, fresh, date: f.date, phase: `${f.label}: vor Anpfiff` });
    if (played) {
      row.beforeHalftime = cap(start - assumptions.halfConsumption);
      row.afterHalftime = cap(row.beforeHalftime + assumptions.halftimeRecovery);
      row.atFulltime = cap(row.afterHalftime - assumptions.halfConsumption);
      row.afterMatch = cap(row.atFulltime + assumptions.postMatchRecovery);
      for (const [offset, key, phase] of [[.35, 'beforeHalftime', 'vor Halbzeit'], [.45, 'afterHalftime', 'nach Halbzeit'], [.7, 'atFulltime', 'Abpfiff'], [.85, 'afterMatch', 'nach Erholung']]) {
        points.push({ x: d + offset, fresh: row[key], date: f.date, phase: `${f.label}: ${phase}` });
      }
      fresh = row.afterMatch;
    } else {
      fresh = cap(fresh + assumptions.dailyRestRecovery);
      row.afterMatch = fresh;
      row.restDayOnBenchAssumed = true;
      points.push({ x: d + .85, fresh, date: f.date, phase: `${f.label}: ohne Einsatz, Ruhetag angenommen` });
    }
    matches.push(row);
  }
  const played = matches.filter(m => m.played);
  const last = played.at(-1);
  const summary = {
    teamMatches: matches.length, playedMatches: played.length,
    playedMinutes: played.length * assumptions.minutesPerMatch,
    minAtKickoff: Math.min(...played.map(m => m.start)),
    minAtFulltime: Math.min(...played.map(m => m.atFulltime)),
    minAfterMatch: Math.min(...played.map(m => m.afterMatch)),
    startsBelow80: played.filter(m => m.start < 80).length,
    startsBelow70: played.filter(m => m.start < 70).length,
    gamesReachingZero: played.filter(m => m.atFulltime === 0).length,
    freshnessOnMarch31: fresh,
    lastMatchAfterRecovery: last.afterMatch,
    fullRestDaysTo100AfterLastMatch: Math.ceil((100 - last.afterMatch) / assumptions.dailyRestRecovery),
    restedFixtures: matches.filter(m => !m.played).map(m => m.label + ' ' + m.date),
  };
  return { id, title, matches, points, summary };
}
const scenarios = [
  simulate('without', 'Ohne Europacup', false, false),
  simulate('with', 'Mit Europacup, alle Spiele', true, false),
  simulate('rotation', 'Mit Europacup, Rotation unter 70', true, true),
];
for (const s of scenarios) {
  for (const p of s.points) assert.ok(Number.isFinite(p.fresh) && p.fresh >= 0 && p.fresh <= 100);
  for (const m of s.matches.filter(m => m.played)) assert.equal(m.afterHalftime, cap(m.beforeHalftime + 10));
}
const outputDir = path.join(root, 'outputs', 'freshness-season-proposal-2026-10-06');
fs.mkdirSync(outputDir, { recursive: true });
const result = { status: 'Illustratives Rechenmodell, keine Produktengine und keine Freigabe der offenen Verbrauchs-/Erholungswerte.', season: 'Beispielsaison August 2027 bis März 2028', calendar: 'Konstruierter regelkonformer Kalender, kein realer oder nativer Karrierekalender.', assumptions, fixtures, scenarios };
fs.writeFileSync(path.join(outputDir, 'results.json'), JSON.stringify(result, null, 2) + '\n');
const csv = [['Szenario', 'Datum', 'Wettbewerb', 'Einsatz', 'Volle Ruhetage seit Vereinsmatch', 'Anpfiff', 'Vor Halbzeit', 'Nach Halbzeit', 'Abpfiff', 'Nach Erholung'], ...scenarios.flatMap(s => s.matches.map(m => [s.title, m.date, m.label, m.played ? '90 Minuten' : 'ohne Einsatz', m.restedDays ?? '', m.start, m.beforeHalftime ?? '', m.afterHalftime ?? '', m.atFulltime ?? '', m.afterMatch]))].map(row => row.join(';')).join('\n');
fs.writeFileSync(path.join(outputDir, 'matches.csv'), '\ufeff' + csv + '\n');

const fmt = value => String(value).replace('.', ',');
const cell = (s, date) => {
  const m = s.matches.find(m => m.date === date);
  return !m ? '–' : m.played ? `${fmt(m.start)} / ${fmt(m.atFulltime)} / ${fmt(m.afterMatch)}` : `${fmt(m.start)} / kein Einsatz / ${fmt(m.afterMatch)}`;
};
const markdown = [
  '# Frische über eine Saison – Rechenbeispiel', '',
  'Stand: 6. Oktober 2026. Illustratives Rechenmodell des geplanten Müdigkeitssystems, keine Auswertung der aktuellen Produktengine und kein vorhandener Spielstand. Kalender und Spielerbelastung sind konstruiert. Offene Modellwerte werden durch diese Rechnung nicht bestätigt.', '',
  'Historische Referenz: Die hier angenommenen +15 nach Abpfiff und konstanten +7,5 pro Ruhetag wurden inzwischen durch einmalig +10 nach Abpfiff und +3 plus 25 Prozent der fehlenden Frische je vollem spielfreien Tag ersetzt. Die aktuelle Rechnung steht im [Erholungsvergleich](frische-erholung-vergleich.md); die ursprünglichen Vergleichswerte bleiben hier erhalten.', '',
  '## Modellannahmen', '',
  '- Derselbe Referenz-Feldspieler spielt jede ausgewählte Partie volle 90 Minuten mit gleicher Belastung. Keine Entwicklung der Kondition während dieses Vergleichs.',
  '- Verbrauch 35 Frischepunkte je Halbzeit ist eine Arbeitsannahme, keine allgemeine festgelegte Verbrauchsformel.',
  '- Halbzeiterholung einmalig +10, höchstens bis 100: bestätigt.',
  '- Direkte Nachspielerholung +15: bislang unbestätigter Vorschlag.',
  '- Jeder volle spielfreie Tag bringt +7,5, höchstens bis 100: Arbeitsannahme. Spieltage erhalten keinen zusätzlichen Tagesbonus. Aus 100 werden nach einem vollen Match 55; sechs volle Ruhetage stellen 100 wieder her. Bei bereits müdem Matchbeginn kann die gesamte Erholung länger dauern.',
  '- Kein Europacup: zehn Ligapartien und drei Pokalpartien bis ins Finale. Mit Europacup: zusätzlich vier Ligaphasen-, zwei Viertelfinal-, zwei Halbfinal- und eine Finalpartie, insgesamt 22. Beide Vereine erreichen das nationale Finale; das Europacupteam erreicht zusätzlich das Europacupfinale.',
  '- Liga am Samstag, Pokal und Europacup am Mittwoch, nie beide in derselben Kalenderwoche; mindestens zwei volle spielfreie Tage zwischen Vereinsmatchs. Saison August bis März.',
  '- Optionaler dritter Vergleich: der Spieler pausiert vor Anpfiff bei Frische unter 70. An einem ausgesetzten Spieltag wird einmal +7,5 als voller Ruhetag angenommen, keine Halbzeit- oder Nachspielgutschrift. Diese Schwelle und Bankregel sind nicht als Produktregel beschlossen.', '',
  '## Ergebnisse', '',
  '| Szenario | Einsätze / Minuten | Niedrigste Frische bei Anpfiff | Niedrigste Frische bei Abpfiff | Starts unter 70 | Frische am 31. März |',
  '| --- | ---: | ---: | ---: | ---: | ---: |',
  ...scenarios.map(s => `| ${s.title} | ${s.summary.playedMatches} / ${s.summary.playedMinutes} | ${fmt(s.summary.minAtKickoff)} | ${fmt(s.summary.minAtFulltime)} | ${s.summary.startsBelow70} | ${fmt(s.summary.freshnessOnMarch31)} |`), '',
  '## Jede Partie', '',
  'Zellen enthalten **Anpfiff / Abpfiff vor Nachspielerholung / nach angenommener +15-Erholung**. Der Halbzeitsprung beträgt bei jedem Einsatz einmal +10 bis maximal 100. Detaillierte Halbzeitwerte stehen in den verknüpften CSV-/JSON-Daten.', '',
  '| Datum | Partie | Ohne Europacup | Mit Europacup, alle Spiele | Mit Europacup, Rotation |',
  '| --- | --- | ---: | ---: | ---: |',
  ...fixtures.map(f => `| ${f.date} | ${f.label} | ${scenarios.map(s => cell(s, f.date)).join(' | ')} |`), '',
  '## Einordnung und Grenzen', '',
  'Ohne Europacup gleichen lange Abstände zwischen den meisten Partien den Verlust aus. Trotzdem startet der Spieler vor dem Pokalfinale nach einer engen Ligaspiel-/Pokalfolge mit weniger als 100. Mit Europacup entstehen mehrere belastete Wochen; im März führt jede Partie ohne Rotation zu deutlich schlechterem Zustand. Das Modell zeigt eine Belastungsspitze statt eines gleichmäßigen Abfalls während aller acht Monate.', '',
  'Ein volles Match aus 100 läuft als 100 beim Anpfiff, 65 vor Halbzeit, 75 nach Halbzeit, 40 bei Abpfiff und 55 nach angenommener erster Erholung. Bei Abpfiff mit Frische 40 beträgt der bestätigte technische Müdigkeitsabzug 6,4 Prozent, bei Zweikampf/Luftspiel 9,6 Prozent und bei Ruhe 12,8 Prozent unter tatsächlichem Druck. Ab Frische 30 gelten die bestätigten Maxima dieser Kurven. Diese Zahlen sind Abschwächungen wirksamer Werte, keine unmittelbaren Fehlerquoten.', '',
  'Verbrauch hängt in der späteren Umsetzung von Kondition, Einsatzzeit und abgestimmter Belastung ab. Hier bleibt er bewusst konstant, um ausschließlich den Kalendervergleich sichtbar zu machen. Die Untergrenze 0 begrenzt die rechnerische Belastung; eine Partie trotz Erschöpfung wird im Rechenmodell nicht automatisch abgebrochen. Kein medizinisches Modell, keine Verletzungs- oder Zwangsauswechselregel.', '',
  'Die Rotation unter 70 vermeidet im Beispiel einen Einsatz am 18. März; das ist eine illustrative Trainerentscheidung, kein Beweis für die optimale Rotationsstrategie. Anderer Verbrauch, andere Regeneration, andere Pokalverläufe und andere zulässige Kalender ändern das Ergebnis. +15 nach Abpfiff und +7,5 je vollem Ruhetag müssen noch abgestimmt werden.', '',
  '## Nachweise', '',
  '- [Vollständige Werte und Modellannahmen](../outputs/freshness-season-proposal-2026-10-06/results.json).',
  '- [Alle Match- und Halbzeitwerte als CSV](../outputs/freshness-season-proposal-2026-10-06/matches.csv).',
  '- [Reproduzierbare Rechnung](../work/simulate-freshness-season-proposal-2026-10-06.cjs).',
  '- [Müdigkeitsplan](muedigkeit-faehigkeiten-plan.md), [Produktregeln und Kalender](product.md).', '',
  'Die Rechnung prüft Wettbewerbsmengen, Wochentage, Mindestabstände, getrennte Pokal-/Europacupwochen, Frischegrenzen und Halbzeiterholung. Keine Laufzeitänderung, Veröffentlichung oder Anpassung alter Spielstände.', '',
].join('\n');
fs.writeFileSync(path.join(root, 'docs', 'frische-saison-beispiel.md'), markdown);
console.log(JSON.stringify(scenarios.map(s => ({ scenario: s.title, ...s.summary })), null, 2));
