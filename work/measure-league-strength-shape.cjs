'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const average = xs => xs.reduce((a, b) => a + b, 0) / xs.length;
function checkTopHierarchy(topClubs, seed) {
  const large = topClubs.filter(c => c.tier === 'A');
  const targets = ['AUT', 'SUI', 'TUR'];
  const smaller = topClubs.filter(c => targets.includes(c.country));
  assert.equal(large.length, 10, 'Two leading clubs in each of the five large leagues are required');
  for (const country of targets) assert.equal(smaller.filter(c => c.country === country).length, 2, 'Two leading clubs required: ' + country);
  const violations = [];
  for (const a of large) for (const b of smaller) {
    // Strictly stronger: equality also violates the confirmed start rule.
    if (!(a.meanQuality > b.meanQuality)) violations.push({ largeClubId: a.clubId, smallerClubId: b.clubId, smallerCountry: b.country, reason: 'squad' });
    if (Number.isFinite(a.startingQuality) && Number.isFinite(b.startingQuality) && !(a.startingQuality > b.startingQuality)) violations.push({ largeClubId: a.clubId, smallerClubId: b.clubId, smallerCountry: b.country, reason: 'starting' });
  }
  return { seed, comparisons: large.length * smaller.length, passed: violations.length === 0, violations };
}
function compare(left, right) {
  let stronger = 0, tied = 0, comparisons = 0;
  for (const a of left) for (const b of right) {
    comparisons++; stronger += Number(a.meanQuality > b.meanQuality);
    tied += Number(a.meanQuality === b.meanQuality);
  }
  assert(comparisons > 0);
  return { comparisons, stronger, tied, shareStronger: stronger / comparisons };
}
function analyze(worlds) {
  assert(worlds.length > 0, 'At least one world is required');
  assert.equal(new Set(worlds.map(w => w.seed)).size, worlds.length, 'Seeds must be distinct');
  const pairs = Object.fromEntries(['A-B', 'A-C', 'A-D', 'B-C', 'C-D'].map(key => [key, []]));
  const middle = Object.fromEntries(['A-C', 'A-D'].map(key => [key, []]));
  const clubs = new Map(), topCounts = new Map();
  const hierarchyChecks = [];
  for (const world of worlds) {
    const league = world.clubs.filter(c => c.kind === 'league');
    assert.equal(league.length, 96);
    const tiers = Object.fromEntries(['A', 'B', 'C', 'D'].map(t => [t, { top: [], middle: [] }]));
    for (const country of new Set(league.map(c => c.country))) {
      const ranked = league.filter(c => c.country === country).sort((a, b) => b.meanQuality - a.meanQuality || a.clubId.localeCompare(b.clubId));
      assert.equal(ranked.length, 8);
      assert(ranked.every(c => Number.isFinite(c.meanQuality)));
      ranked.forEach((c, index) => {
        const rows = clubs.get(c.clubId) || []; rows.push({ ...c, rank: index + 1, seed: world.seed }); clubs.set(c.clubId, rows);
        if (index < 2) { tiers[c.tier].top.push(c); topCounts.set(c.clubId, (topCounts.get(c.clubId) || 0) + 1); }
        else tiers[c.tier].middle.push(c);
      });
    }
    // Compare within each world; do not mix teams from different career seeds.
    hierarchyChecks.push(checkTopHierarchy(Object.values(tiers).flatMap(t => t.top), world.seed));
    for (const [key, result] of Object.entries(pairs)) { const [a, b] = key.split('-'); result.push(compare(tiers[a].top, tiers[b].top)); }
    for (const [key, result] of Object.entries(middle)) { const [a, b] = key.split('-'); result.push(compare(tiers[a].middle, tiers[b].middle)); }
  }
  const pool = groups => Object.fromEntries(Object.entries(groups).map(([key, rows]) => {
    const comparisons = rows.reduce((s, r) => s + r.comparisons, 0), stronger = rows.reduce((s, r) => s + r.stronger, 0);
    return [key, { comparisons, stronger, shareStronger: stronger / comparisons, worldMin: Math.min(...rows.map(r => r.shareStronger)), worldMax: Math.max(...rows.map(r => r.shareStronger)) }];
  }));
  const variation = [...clubs.entries()].map(([clubId, rows]) => {
    const mean = average(rows.map(r => r.meanQuality));
    const deviations = rows.map(r => r.meanQuality / mean - 1);
    return { clubId, name: rows[0].name, country: rows[0].country, tier: rows[0].tier, starts: rows.length,
      withinFivePercent: deviations.filter(d => Math.abs(d) <= .05).length,
      standardDeviationPct: 100 * Math.sqrt(average(deviations.map(d => d * d))),
      minDeviationPct: 100 * Math.min(...deviations), maxDeviationPct: 100 * Math.max(...deviations),
      bestRank: Math.min(...rows.map(r => r.rank)), worstRank: Math.max(...rows.map(r => r.rank)), topTwoStarts: topCounts.get(clubId) || 0 };
  });
  const violationCount = hierarchyChecks.reduce((n, w) => n + w.violations.length, 0);
  return { worldCount: worlds.length, topTwo: pool(pairs), ranksThreeToEight: pool(middle),
    strictStartHierarchy: { targetCountries: ['AUT', 'SUI', 'TUR'], passed: violationCount === 0, comparisons: hierarchyChecks.reduce((n, w) => n + w.comparisons, 0), violationCount, failedWorlds: hierarchyChecks.filter(w => !w.passed).length, worlds: hierarchyChecks },
    variation: { measuredClubStarts: variation.reduce((n, c) => n + c.starts, 0), withinFivePercent: variation.reduce((n, c) => n + c.withinFivePercent, 0), meanStandardDeviationPct: average(variation.map(c => c.standardDeviationPct)), clubs: variation } };
}
module.exports = { analyze, compare };
if (require.main === module) {
  const file = path.join(root, 'outputs/start-roster-strength/measurement.json');
  const measurement = JSON.parse(fs.readFileSync(file, 'utf8'));
  const result = analyze(measurement.worlds);
  fs.writeFileSync(path.join(root, 'outputs/start-roster-strength/league-shape.json'), JSON.stringify(result, null, 2) + '\n');
  const { worlds, ...strictStartHierarchy } = result.strictStartHierarchy;
  console.log(JSON.stringify({ strictStartHierarchy, topTwo: result.topTwo, middle: result.ranksThreeToEight, variation: { measuredClubStarts: result.variation.measuredClubStarts, withinFivePercent: result.variation.withinFivePercent, meanStandardDeviationPct: result.variation.meanStandardDeviationPct } }));
  if (process.argv.includes('--check-hierarchy') && !strictStartHierarchy.passed) {
    console.error('FAIL strict start hierarchy: ' + strictStartHierarchy.violationCount + ' violations in ' + strictStartHierarchy.failedWorlds + ' worlds');
    process.exitCode = 1;
  }
}
