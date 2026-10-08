'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Generation = require('../dist/player-generation.js');
const { candidateParameters, createRng, measureCandidate } = require('./measure-player-generation.cjs');
let checks = 0;
function test(label, run) { run(); checks += 1; console.log('PASS ' + label); }
function close(actual, expected, epsilon = 1e-10) { assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} != ${expected}`); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function freezeDeep(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(freezeDeep); Object.freeze(value); }
  return value;
}
function allSkills(value) { return Object.fromEntries(Generation.SKILL_KEYS.map(key => [key, value])); }
function context(overrides = {}) { return { id: 'probe/1', age: 17, kind: 'youth', mainPosition: 'att', clubQuality: 'normal', youthQuality: 'normal', ...overrides }; }
function generate(ctx = context(), params = candidateParameters, seed = 8128) { return Generation.generatePlayer(ctx, params, createRng(seed)); }
function constantBand(value) { return { distribution: 'uniform', min: value, max: value, weight: 1 }; }
function fixedQualityParameters(value, mainPosition = 'att', sourceProfile = 0) {
  const params = clone(candidateParameters);
  const profile = params.profilesByPosition[mainPosition][sourceProfile];
  profile.weight = 1;
  params.profilesByPosition[mainPosition] = [profile];
  for (const key of Generation.SKILL_KEYS) profile.noiseBySkill[key] = { distribution: 'uniform', min: 0, max: 0 };
  for (const quality of ['weak', 'normal', 'strong']) params.qualityByKind.youth[0].byQuality[quality] = [constantBand(value)];
  return params;
}

test('13 canonical skills and all four exact weight maps sum to 100', () => {
  const expected = {
    gk: [4, 5, 0, 1, 12, 3, 3, 1, 40, 10, 10, 8, 3],
    def: [4, 5, 1, 20, 18, 8, 3, 7, 0, 2, 12, 10, 10],
    mid: [14, 18, 3, 8, 10, 6, 8, 2, 0, 5, 10, 12, 4],
    att: [9, 8, 20, 1, 12, 7, 2, 4, 0, 12, 12, 8, 5]
  };
  assert.equal(Generation.SKILL_KEYS.length, 13);
  for (const [pos, values] of Object.entries(expected)) {
    assert.deepEqual(Generation.SKILL_KEYS.map(key => Generation.POSITION_WEIGHTS[pos][key]), values);
    assert.equal(values.reduce((sum, value) => sum + value, 0), 100);
    close(Generation.positionQuality(allSkills(1), pos), 1);
    close(Generation.positionQuality(allSkills(20), pos), 20);
    close(Generation.positionQuality(allSkills(14), pos), 14);
  }
});
test('confirmed examples and no action/role/height contributions to quality', () => {
  close(Generation.positionQuality({ ...allSkills(8), fin: 20 }, 'att'), 10.4);
  close(Generation.positionQuality({ ...allSkills(14), calm: 5 }, 'att'), 12.92);
  close(Generation.positionQuality({ ...allSkills(14), calm: 15 }, 'att'), 14.12);
  close(Generation.positionQuality({ ...allSkills(14), gk: 1, heightCm: 205, talent: 22, form: 99, freshness: 100 }, 'att'), 14);
});
test('elite boundary is 16 without rounding or single-skill minima', () => {
  for (const pos of ['gk', 'def', 'mid', 'att']) {
    assert.equal(Generation.eliteQuality(allSkills(15.99), [pos]), false);
    assert.equal(Generation.eliteQuality(allSkills(16), [pos]), true);
  }
  const broadAttacker = { ...allSkills(17), gk: 1, tak: 1 };
  assert.ok(Generation.positionQuality(broadAttacker, 'att') >= 16);
  assert.equal(Generation.eliteQuality(broadAttacker, ['att']), true);
});
test('best playable side position counts; a foreign position does not', () => {
  const skills = { ...allSkills(15), tak: 20, pos: 20, ant: 20, dec: 20, str: 20, fin: 1 };
  assert.ok(Generation.positionQuality(skills, 'def') >= 16);
  assert.ok(Generation.positionQuality(skills, 'att') < 16);
  assert.equal(Generation.eliteQuality(skills, ['att']), false);
  assert.equal(Generation.eliteQuality(skills, ['mid', 'def']), true);
  assert.throws(() => Generation.eliteQuality(skills, []), /nonempty/);
});
test('UMD browser and CommonJS expose the same deterministic module', () => {
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(require.resolve('../dist/player-generation.js'), 'utf8'), sandbox);
  const browser = sandbox.D6PlayerGeneration;
  assert.ok(browser && typeof browser.generatePlayer === 'function');
  assert.deepEqual(JSON.parse(JSON.stringify(browser.generatePlayer(context(), candidateParameters, createRng(42)))), generate(context(), candidateParameters, 42));
});
test('deterministic per seed, changing seed changes profile, no input mutation', () => {
  const ctx = freezeDeep(context());
  const params = freezeDeep(clone(candidateParameters));
  const before = JSON.stringify({ ctx, params });
  assert.deepEqual(generate(ctx, params, 123), generate(ctx, params, 123));
  assert.notDeepEqual(generate(ctx, params, 123), generate(ctx, params, 124));
  assert.equal(JSON.stringify({ ctx, params }), before);
  const player = generate(ctx, params, 123);
  player.skills.fin = 1; player.caps.fin = 1; player.playablePositions.push('gk');
  assert.equal(JSON.stringify({ ctx, params }), before);
  assert.notDeepEqual(player, generate(ctx, params, 123));
});
test('quality target survives clipping, with coherent strengths and weaknesses', () => {
  for (const pos of ['gk', 'def', 'mid', 'att']) {
    for (const quality of [1, 7, 8.5, 10, 15.99, 16, 20]) {
      const player = generate(context({ mainPosition: pos }), fixedQualityParameters(quality, pos));
      close(Generation.positionQuality(player.skills, pos), quality, 2e-12);
      assert.ok(Object.values(player.skills).every(value => value >= 1 && value <= 20));
    }
  }
  const attacker = generate(context(), fixedQualityParameters(9));
  assert.ok(attacker.skills.fin > 10 && attacker.skills.tak < 7);
  assert.ok(attacker.skills.fin > attacker.skills.gk);
});
test('caps depend on the profile and start skill, never on talent', () => {
  const low = clone(candidateParameters), high = clone(candidateParameters);
  low.talentWeightsByKind.start = Object.fromEntries(Array.from({ length: 13 }, (_, i) => [10 + i, i === 0 ? 1 : 0]));
  high.talentWeightsByKind.start = Object.fromEntries(Array.from({ length: 13 }, (_, i) => [10 + i, i === 12 ? 1 : 0]));
  const ctx = context({ kind: 'start', age: 25 });
  for (let seed = 0; seed < 40; seed += 1) {
    const a = generate(ctx, low, seed), b = generate(ctx, high, seed);
    assert.equal(a.talent, 10); assert.equal(b.talent, 22);
    assert.deepEqual(a.skills, b.skills); assert.deepEqual(a.caps, b.caps);
    assert.deepEqual(a.playablePositions, b.playablePositions);
    assert.equal(a.heightCm, b.heightCm); assert.equal(a.preferredFoot, b.preferredFoot);
  }
  const player = generate(context(), fixedQualityParameters(8));
  assert.ok(player.caps.fin > player.caps.tak);
  assert.ok(Object.values(player.caps).some(value => value < 20));
});
test('one GK profile only; neighbors are skill-derived and all-rounders require a full profile', () => {
  for (let seed = 0; seed < 100; seed += 1) assert.deepEqual(generate(context({ mainPosition: 'gk' }), candidateParameters, seed).playablePositions, ['gk']);
  const plain = generate(context({ mainPosition: 'def' }), fixedQualityParameters(8, 'def', 0));
  assert.deepEqual(plain.playablePositions, ['def']);
  const builder = generate(context({ mainPosition: 'def' }), fixedQualityParameters(12, 'def', 1));
  assert.deepEqual(builder.playablePositions, ['def', 'mid']);
  const versatile = generate(context({ mainPosition: 'mid' }), fixedQualityParameters(12, 'mid', 3));
  assert.deepEqual(versatile.playablePositions, ['mid', 'def', 'att']);
  const tooWeak = generate(context({ mainPosition: 'mid' }), fixedQualityParameters(8, 'mid', 3));
  assert.deepEqual(tooWeak.playablePositions, ['mid']);
  const invalid = fixedQualityParameters(8, 'def');
  invalid.profilesByPosition.def[0].sidePositionRules = [{ position: 'att', minQuality: 7, maxQualityGap: 2, minimumSkills: { fin: 7, pas: 7 } }];
  assert.throws(() => generate(context({ mainPosition: 'def' }), invalid), /adjacent/);
});
test('height and foot are separate fixed properties without guaranteed skill bonuses', () => {
  const short = fixedQualityParameters(8), tall = fixedQualityParameters(8);
  short.profilesByPosition.att[0].height.core = [{ value: 170, weight: 1 }];
  tall.profilesByPosition.att[0].height.core = [{ value: 200, weight: 1 }];
  short.footWeights = { right: 1, left: 0, both: 0 };
  tall.footWeights = { right: 0, left: 0, both: 1 };
  const a = Generation.generatePlayer(context(), short, () => 0.25), b = Generation.generatePlayer(context(), tall, () => 0.25);
  assert.equal(a.heightCm, 170); assert.equal(b.heightCm, 200);
  assert.equal(a.preferredFoot, 'right'); assert.equal(b.preferredFoot, 'both');
  assert.deepEqual(a.skills, b.skills); assert.deepEqual(a.caps, b.caps);
  assert.deepEqual(Generation.generatePlayer(context(), short, () => 0.25), a);
});
test('P04 recommendations are injected, copied and deduplicated without a fabricated catalog', () => {
  assert.deepEqual(generate().recommendedRoles, []);
  const returned = [{ position: 'att', roleId: 'p04-stub' }, { position: 'att', roleId: 'p04-stub' }];
  const params = clone(candidateParameters);
  params.recommendRoles = snapshot => {
    assert.ok(Object.isFrozen(snapshot) && Object.isFrozen(snapshot.skills) && Object.isFrozen(snapshot.playablePositions));
    assert.equal(snapshot.talent, undefined); assert.equal(snapshot.caps, undefined);
    assert.throws(() => { snapshot.skills.fin = 20; }, TypeError);
    return returned;
  };
  const player = generate(context(), params);
  assert.deepEqual(player.recommendedRoles, [{ position: 'att', roleId: 'p04-stub' }]);
  returned[0].roleId = 'changed';
  assert.equal(player.recommendedRoles[0].roleId, 'p04-stub');
  params.recommendRoles = () => [{ position: 'gk', roleId: 'wrong-position' }];
  assert.throws(() => generate(context(), params), /playable/);
});
test('youth high-talent weights normalize globally over supplied volumes', () => {
  for (const population of [{ weak: 1, normal: 2, strong: 3 }, { weak: 16, normal: 3, strong: 1 }, { weak: 1, normal: 1, strong: 1 }]) {
    const total = Object.values(population).reduce((sum, value) => sum + value, 0);
    const probabilities = Object.fromEntries(['weak', 'normal', 'strong'].map(quality => [quality, Generation.youthTalentProbabilities(population, quality)]));
    for (const quality of ['weak', 'normal', 'strong']) close(Object.values(probabilities[quality]).reduce((sum, value) => sum + value, 0), 1);
    for (const band of Generation.TALENT_BANDS) close(['weak', 'normal', 'strong'].reduce((sum, quality) => sum + population[quality] / total * probabilities[quality][band.key], 0), band.share);
    for (const band of ['20', '21', '22']) {
      close(probabilities.normal[band] / probabilities.weak[band], 2);
      close(probabilities.strong[band] / probabilities.normal[band], 2);
    }
  }
  close(Generation.youthTalentProbabilities({ weak: 0, normal: 5, strong: 0 }, 'normal')['22'], 0.005);
  assert.throws(() => Generation.youthTalentProbabilities({ weak: 0, normal: 5, strong: 0 }, 'weak'), /represented/);
});
test('club and youth quality are separate inputs; talent never raises start skills', () => {
  assert.deepEqual(generate(context({ clubQuality: 'weak' }), candidateParameters, 42), generate(context({ clubQuality: 'strong' }), candidateParameters, 42));
  assert.deepEqual(generate(context({ kind: 'start', age: 25, youthQuality: 'weak' }), candidateParameters, 42), generate(context({ kind: 'start', age: 25, youthQuality: 'strong' }), candidateParameters, 42));
  const low = clone(candidateParameters), high = clone(candidateParameters);
  low.talentWithinBandWeights['10-13'] = { 10: 1, 11: 0, 12: 0, 13: 0 };
  high.talentWithinBandWeights['10-13'] = { 10: 0, 11: 0, 12: 0, 13: 1 };
  let observed = false;
  for (let seed = 1; seed < 100; seed += 1) {
    const a = generate(context(), low, seed), b = generate(context(), high, seed);
    assert.deepEqual(a.skills, b.skills); assert.deepEqual(a.caps, b.caps);
    if (a.talent === 10) { assert.equal(b.talent, 13); observed = true; }
  }
  assert.ok(observed);
});
test('missing, malformed and unconfirmed inputs fail instead of defaulting', () => {
  assert.throws(() => Generation.generatePlayer(context(), undefined, createRng(1)), /parameters/);
  assert.throws(() => Generation.generatePlayer(context(), candidateParameters), /rng/);
  assert.throws(() => Generation.generatePlayer(context(), candidateParameters, () => 1), /rng/);
  assert.throws(() => Generation.generatePlayer(context(), candidateParameters, () => NaN), /rng/);
  assert.throws(() => generate(context({ age: 18 })), /age/);
  assert.throws(() => generate(context({ id: '' })), /id/);
  assert.throws(() => Generation.positionQuality({ ...allSkills(8), calm: undefined }, 'att'), /calm/);
  assert.throws(() => Generation.positionQuality(allSkills(8), 'wing'), /position/);
  for (const key of ['footWeights', 'youthPopulationWeights', 'talentWithinBandWeights']) {
    const missing = clone(candidateParameters); delete missing[key];
    assert.throws(() => generate(context(), missing), TypeError);
  }
  const noDistribution = fixedQualityParameters(8); delete noDistribution.profilesByPosition.att[0].noiseBySkill.fin.distribution;
  assert.throws(() => generate(context(), noDistribution), /explicit uniform/);
  const negativeCap = fixedQualityParameters(8); negativeCap.profilesByPosition.att[0].capHeadroomBySkill.fin.min = -1;
  assert.throws(() => generate(context(), negativeCap), /headroom/);
  const zeroWeights = clone(candidateParameters); zeroWeights.footWeights = { right: 0, left: 0, both: 0 };
  assert.throws(() => generate(context(), zeroWeights), /positive sum/);
});
test('all four generation kinds keep scale, personal bounds, IDs and profile invariants', () => {
  const rng = createRng(887);
  const used = new Set();
  for (let i = 0; i < 2000; i += 1) {
    const kind = ['youth', 'start', 'free', 'cup'][i % 4], mainPosition = ['gk', 'def', 'mid', 'att'][Math.floor(i / 4) % 4];
    const age = kind === 'youth' ? 17 : [18, 25, 34][i % 3];
    const ctx = context({ id: `scale/${i}`, kind, age, mainPosition });
    const player = Generation.generatePlayer(ctx, candidateParameters, rng);
    assert.equal(player.id, ctx.id); assert.equal(player.age, age); assert.equal(player.mainPosition, mainPosition);
    assert.ok(!used.has(player.id)); used.add(player.id);
    assert.deepEqual(Object.keys(player.skills), Generation.SKILL_KEYS);
    assert.deepEqual(Object.keys(player.caps), Generation.SKILL_KEYS);
    for (const key of Generation.SKILL_KEYS) { assert.ok(player.skills[key] >= 1 && player.skills[key] <= 20); assert.ok(player.caps[key] >= player.skills[key] && player.caps[key] <= 20); }
    assert.ok(Number.isInteger(player.talent) && player.talent >= 10 && player.talent <= 22);
    assert.ok(Number.isInteger(player.heightCm) && player.heightCm >= 165 && player.heightCm <= 205);
    assert.ok(['right', 'left', 'both'].includes(player.preferredFoot));
    assert.equal(player.playablePositions[0], mainPosition);
    assert.equal(new Set(player.playablePositions).size, player.playablePositions.length);
    if (mainPosition === 'gk') assert.deepEqual(player.playablePositions, ['gk']);
    else {
      assert.ok(!player.playablePositions.includes('gk'));
      if (player.playablePositions.length === 2) assert.ok(player.playablePositions.includes('mid'));
    }
  }
});

test('ten-seed measured candidate meets confirmed broad patterns with sampling uncertainty', () => {
  const report = measureCandidate();
  assert.equal(report.youth.n, 60000); assert.equal(report.all.n, 82500);
  for (const band of Generation.TALENT_BANDS) {
    close(report.normalizedYouthExpectedShares[band.key], band.share);
    const observed = report.youth.talent[band.key];
    const standardError = Math.sqrt(band.share * (1 - band.share) / report.youth.n);
    assert.ok(Math.abs(observed.share - band.share) < 4 * standardError + 1 / report.youth.n, `talent ${band.key} outside four-SE sampling check`);
    assert.ok(observed.ci95[0] <= observed.share && observed.ci95[1] >= observed.share);
  }
  const heightError = Math.sqrt(0.95 * 0.05 / report.all.n);
  assert.ok(Math.abs(report.all.heightCore.share - 0.95) < 4 * heightError);
  assert.ok(report.youth.mainQuality7to10Share > 0.85);
  assert.ok(report.youth.elite.share < 0.005); // Candidate regression bound, not an approved production quota.
  for (const kind of ['youth', 'start', 'free', 'cup']) {
    const rows = ['weak', 'normal', 'strong'].map(quality => report.cohorts[kind + '/' + quality]);
    assert.ok(rows[0].mainQualityMean < rows[1].mainQualityMean && rows[1].mainQualityMean < rows[2].mainQualityMean);
    assert.ok(rows.every(row => row.mainQualitySd > 0.5));
    assert.ok(rows.every(row => row.capsBelow20Share > 0.70));
  }
  for (const quality of ['weak', 'normal', 'strong']) assert.ok(report.cohorts['youth/' + quality].mainQuality7to10Share > 0.80);
  for (const band of ['20', '21', '22']) assert.ok(report.cohorts['youth/strong'].talent[band].share > report.cohorts['youth/weak'].talent[band].share);
  assert.ok(report.all.positions.single > 0 && report.all.positions.adjacent > 0 && report.all.positions.allRounder > 0);
  assert.ok(report.all.positions.allRounder / report.all.n < 0.01);
  assert.ok(Object.values(report.all.feet).every(row => row.count > 0));
  for (const row of report.seedRows) {
    assert.ok(row.youthNormalShare > 0.80);
    for (const kind of ['start', 'free', 'cup']) assert.ok(row.adultQualityMeans[kind + '/strong'] > row.adultQualityMeans[kind + '/weak']);
  }
  console.log('EVIDENCE ' + JSON.stringify({ seeds: report.seeds, total: report.all.n, youth: report.youth.n, youthNormalShare: report.youth.mainQuality7to10Share, youthElite: report.youth.elite, height: report.all.heightCore, talent: report.youth.talent, fieldAllRounders: report.all.positions.allRounder }));
});
console.log(`Player generation: ${checks} checks passed. Candidate distributions remain unconfirmed.`);
