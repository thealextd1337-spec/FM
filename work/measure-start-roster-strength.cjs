'use strict';

// Analysis only: construct fresh native worlds, observe their initial rosters.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const G = require('../dist/player-generation.js');
const positions = Object.keys(G.POSITION_WEIGHTS);
const root = path.resolve(__dirname, '..');
const bands = ['very-weak', 'weak', 'normal', 'good', 'very-good'];
const names = ['Sehr schwach', 'Schwach', 'Durchschnittlich', 'Gut', 'Sehr gut'];

function empty() {
  return { players: 0, elite: 0, bands: Object.fromEntries(bands.map(b => [b, 0])), histogram: Array(20).fill(0) };
}
function merge(target, source) {
  target.players += source.players;
  target.elite += source.elite;
  bands.forEach(b => target.bands[b] += source.bands[b]);
  source.histogram.forEach((n, i) => target.histogram[i] += n);
  return target;
}
function measurePlayers(players, skillBand) {
  const result = empty();
  for (const p of players) {
    assert(p.playerModel?.version === 2, 'Native player model missing');
    const positions = p.playerModel.playablePositions;
    assert(positions.includes(p.line), 'Main position must be playable');
    const best = Math.max(...positions.map(pos => G.positionQuality(p, pos)));
    assert(Number.isFinite(best) && best >= 1 && best <= 20);
    result.players++;
    result.elite += Number(G.eliteQuality(p, positions));
    result.bands[skillBand(best)]++;
    result.histogram[Math.min(19, Math.floor(best) - 1)]++;
  }
  assert.equal(Object.values(result.bands).reduce((a, b) => a + b, 0), result.players);
  assert.equal(result.histogram.reduce((a, b) => a + b, 0), result.players);
  return result;
}
function measureWorld(career, skillBand, startingQuality = null) {
  const w = career.world;
  assert.equal(w.season, 1);
  assert.equal(w.clubs.length, 192);
  assert.equal(w.clubs.filter(c => !c.simulationOnly).length, 96);
  assert.equal(w.clubs.filter(c => c.simulationOnly).length, 96);
  assert(w.competitions.every(c => c.fixtures.every(f => !f.result)), 'Only unplayed worlds');
  const ids = w.clubs.flatMap(c => c.roster.map(p => p.pid));
  assert.equal(new Set(ids).size, ids.length);
  const excluded = new Set([...w.clubs.flatMap(c => c.youthPool || []), ...w.market.freePlayers].map(p => p.pid));
  assert(ids.every(id => !excluded.has(id)), 'Youth pool and free market must be excluded');
  return w.clubs.map(c => {
    assert(c.roster.length >= 10 && c.roster.length <= 14);
    assert(c.roster.every(p => p.playerModel.development.processedAppearances.length === 0 && p.playerModel.aging.processedSeasons.length === 0));
    return {
      clubId: c.id, name: c.name, country: c.countryId, tier: c.expansionTier,
      kind: c.simulationOnly ? 'cup' : 'league', profile: c.policy.startingSquad,
      qualityProfile: w.playerFoundation?.qualityMapping[c.policy.startingSquad] || null,
      // Internal team aggregate for league hierarchy and seed-variation audits.
      meanQuality: c.roster.reduce((sum, p) => sum + Math.max(...p.playerModel.playablePositions.map(pos => G.positionQuality(p, pos))), 0) / c.roster.length,
      ...(startingQuality ? { startingQuality: startingQuality(c) } : {}),
      ...measurePlayers(c.roster, skillBand),
      positions: Object.fromEntries(positions.map(pos => [pos, measurePlayers(c.roster.filter(p => p.line === pos), skillBand)])),
      ages: Object.fromEntries([['u20', p => p.age < 20], ['20-29', p => p.age >= 20 && p.age < 30], ['30plus', p => p.age >= 30]].map(([id, filter]) => [id, measurePlayers(c.roster.filter(filter), skillBand)]))
    };
  });
}
function summarize(worlds) {
  const all = worlds.flatMap(w => w.clubs);
  const total = rows => rows.reduce((s, r) => merge(s, r), empty());
  const groups = key => Object.fromEntries([...new Set(all.map(c => c[key]))].sort().map(id => [id, total(all.filter(c => c[key] === id))]));
  return {
    all: total(all), kinds: groups('kind'), countries: groups('country'), tiers: groups('tier'), profiles: groups('profile'), qualityProfiles: groups('qualityProfile'),
    positions: Object.fromEntries(positions.map(pos => [pos, total(all.map(c => c.positions[pos]))])),
    ages: Object.fromEntries(['u20', '20-29', '30plus'].map(age => [age, total(all.map(c => c.ages[age]))])),
    clubs: [...new Set(all.map(c => c.clubId))].map(id => {
      const rows = all.filter(c => c.clubId === id);
      return { clubId: id, name: rows[0].name, kind: rows[0].kind, ...total(rows), eliteMin: Math.min(...rows.map(r => r.elite)), eliteMax: Math.max(...rows.map(r => r.elite)) };
    }),
    worlds: worlds.map(w => ({ seed: w.seed, ...total(w.clubs), kinds: Object.fromEntries(['league', 'cup'].map(kind => [kind, total(w.clubs.filter(c => c.kind === kind))])), clubsWithElite: w.clubs.filter(c => c.elite > 0).length })),
    clubEliteCounts: Object.fromEntries([...new Set(all.map(c => c.elite))].sort((a, b) => a - b).map(n => [n, all.filter(c => c.elite === n).length]))
  };
}
function run(count = 30) {
  assert(Number.isInteger(count) && count >= 1 && count <= 1000, 'World count must be 1..1000');
  process.chdir(root);
  const before = Object.fromEntries(fs.readdirSync(path.join(root, 'dist')).filter(f => f.endsWith('.js')).map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'dist', f))).digest('hex')]));
  const { harness } = require('./youth-native-harness-v176.cjs');
  const { call, run: load, evaluate } = harness();
  load('world-expansion-stories-v170.js');
  load('world-youth-legacy-v176.js');
  // Reuse the actual color classifier without loading UI dependencies.
  const source = fs.readFileSync(path.join(root, 'dist/strength-v55.js'), 'utf8');
  const classifier = source.match(/const v55SkillBand=value=>[^;]+;/)[0];
  evaluate(classifier);
  const skillBand = evaluate('v55SkillBand');
  const startingQuality = club => Math.max(...evaluate('v63Formations').map(f => call('v177StartingQuality', club, f)));
  const worlds = [];
  for (let i = 1; i <= count; i++) {
    const seed = `start-strength-20261012-${String(i).padStart(3, '0')}`;
    const career = call('v167CreateCareer', 'AUT-5', seed, 'Startkaderanalyse');
    const clubs = measureWorld(career, skillBand, startingQuality);
    assert(call('v61ValidateCareer', career), 'Invalid native world ' + seed);
    if (i === 1) {
      const replay = call('v167CreateCareer', 'AUT-5', seed, 'Startkaderanalyse');
      assert.deepEqual(replay.world.clubs.map(c => c.roster), career.world.clubs.map(c => c.roster), 'Same seed must reproduce the complete rosters');
      assert.deepEqual(measureWorld(replay, skillBand, startingQuality), clubs, 'Same seed must reproduce the same measurement');
    }
    worlds.push({ seed, clubs, generationVersion: career.world.playerFoundation.expansionGeneration.version });
    console.log(`PASS world ${i}/${count}: ${clubs.reduce((n, c) => n + c.players, 0)} starting players`);
  }
  for (const [f, hash] of Object.entries(before)) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'dist', f))).digest('hex'), hash, 'Product source changed: ' + f);
  const result = {
    schemaVersion: 1, measuredAt: new Date().toISOString(), source: root, sourceHashes: before,
    scope: 'Initial club rosters only; youth pools and free agents excluded. Young contracted starting players are included. No appearances, transfers, development or seasons simulated.',
    quality: 'Best positionQuality among saved playablePositions, using native base skills; no form, freshness, talent or potential. Elite uses native eliteQuality. Colors use native v55SkillBand.',
    generationVersion: worlds[0].generationVersion, targetCurve: null, bands, names, worldCount: count, summary: summarize(worlds), worlds
  };
  const out = path.join(root, 'outputs/start-roster-strength');
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'measurement.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ worlds: count, players: result.summary.all.players, elite: result.summary.all.elite, bands: result.summary.all.bands, kinds: result.summary.kinds }));
  return result;
}
module.exports = { bands, names, empty, merge, measurePlayers, measureWorld, summarize, run };
if (require.main === module) run(Number(process.argv.find(a => a.startsWith('--worlds='))?.slice(9) || 30));
