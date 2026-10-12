'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { measurePlayers, measureWorld, summarize, bands } = require('./measure-start-roster-strength.cjs');
const G = require('../dist/player-generation.js');
const code = fs.readFileSync(require.resolve('../dist/strength-v55.js'), 'utf8').match(/const v55SkillBand=value=>[^;]+;/)[0];
const skillBand = vm.runInNewContext(code + '\nv55SkillBand');
const player = (id, value, main = 'att', playable = [main]) => ({ pid: id, line: main, age: 25, ...Object.fromEntries(G.SKILL_KEYS.map(k => [k, value])), playerModel: { version: 2, playablePositions: playable, development: { processedAppearances: [] }, aging: { processedSeasons: [] } } });
let checks = 0;
function test(label, fn) { fn(); checks++; console.log('PASS ' + label); }
test('native color boundaries and elite boundary are distinct', () => {
  const values = [7, 7.01, 10, 10.01, 13, 13.01, 15.99, 16, 16.01, 20];
  const r = measurePlayers(values.map((v, i) => player('p' + i, v)), skillBand);
  assert.deepEqual(Object.values(r.bands), [1, 2, 2, 3, 2]);
  assert.equal(r.elite, 3);
  assert.equal(r.histogram.reduce((a, b) => a + b), values.length);
});
test('elite on a secondary playable position is counted once', () => {
  const p = player('side', 16, 'att', ['att', 'def']);
  p.fin = 1;
  assert(G.positionQuality(p, 'att') < 16);
  assert.equal(measurePlayers([p], skillBand).elite, 0);
  p.fin = 16; p.tec = 1;
  assert(G.positionQuality(p, 'att') < G.positionQuality(p, 'def'));
  p.tak = 20; p.pos = 20; p.str = 20;
  assert(G.positionQuality(p, 'att') < 16);
  assert(G.positionQuality(p, 'def') >= 16);
  assert.equal(measurePlayers([p], skillBand).elite, 1);
  p.playerModel.playablePositions = ['att'];
  assert.equal(measurePlayers([p], skillBand).elite, 0);
});
test('form, freshness, talent and caps never change measured strength', () => {
  const p = player('fixed', 12);
  const before = measurePlayers([p], skillBand);
  p.form = 1; p.freshness = 0; p.playerModel.talent = 22; p.playerModel.caps = Object.fromEntries(G.SKILL_KEYS.map(k => [k, 20]));
  assert.deepEqual(measurePlayers([p], skillBand), before);
});
function fixture() {
  return { world: { season: 1, market: { freePlayers: [player('free', 20)] }, competitions: [{ fixtures: [{}] }], clubs: Array.from({ length: 192 }, (_, i) => ({ id: 'club' + i, name: 'Club ' + i, countryId: 'AUT', expansionTier: 'C', simulationOnly: i >= 96, policy: { startingSquad: i % 6 }, roster: Array.from({ length: 10 }, (_, n) => player(`${i}:${n}`, 12)), youthPool: [player('youth' + i, 20)] })) } };
}
test('only rosters count, including contracted young players; pools and market excluded', () => {
  const c = fixture(); c.world.clubs[0].roster[0].age = 17;
  const before = JSON.stringify(c);
  const clubs = measureWorld(c, skillBand);
  assert.equal(JSON.stringify(c), before, 'Measurement must not mutate a world');
  const s = summarize([{ seed: 'fixture', clubs }]);
  assert.equal(s.all.players, 1920); assert.equal(s.all.elite, 0);
  assert.equal(s.ages.u20.players, 1);
  assert.equal(s.kinds.league.players, 960); assert.equal(s.kinds.cup.players, 960);
  for (const groups of [s.kinds, s.countries, s.tiers, s.profiles, s.positions, s.ages]) assert.equal(Object.values(groups).reduce((n, r) => n + r.players, 0), s.all.players);
  bands.forEach(b => assert.equal(s.all.bands[b], s.kinds.league.bands[b] + s.kinds.cup.bands[b]));
});
test('rejects played worlds, duplicate identities and pool overlap', () => {
  const c = fixture(); c.world.competitions[0].fixtures[0].result = {};
  assert.throws(() => measureWorld(c, skillBand), /unplayed/);
  delete c.world.competitions[0].fixtures[0].result;
  c.world.clubs[0].roster[0].pid = c.world.clubs[1].roster[0].pid;
  assert.throws(() => measureWorld(c, skillBand));
  c.world.clubs[0].roster[0].pid = c.world.clubs[0].youthPool[0].pid;
  assert.throws(() => measureWorld(c, skillBand), /excluded/);
});
console.log(`${checks} start-roster measurement checks passed`);
