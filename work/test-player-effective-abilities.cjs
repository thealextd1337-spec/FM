'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const abilities = require('../dist/player-effective-abilities.js');
const source = fs.readFileSync(path.join(__dirname, '../dist/player-effective-abilities.js'), 'utf8');
let groups = 0;
function test(name, run) { run(); groups++; console.log('PASS ' + name); }
function near(actual, expected) { assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`); }
function freeze(value) { Object.values(value).forEach(item => { if (item && typeof item === 'object') freeze(item); }); return Object.freeze(value); }
function skills(value = 12) { return Object.fromEntries(abilities.SKILL_KEYS.map(key => [key, value])); }
function form(value = 1) { return {multipliers: skills(value)}; }
// CANDIDATE ONLY: linear normalized motion and mental curves are not product defaults.
const candidateCurves = freeze({anticipationCurve: [[0, 1], [100, 0]], decisionCurve: [[0, 1], [40, .8], [100, 0]], maxSpeedCurve: [[0, 1], [100, 0]], accelerationCurve: [[0, 1], [50, .65], [100, 0]]});
const base = freeze(skills());
const neutral = freeze(form());

test('confirmed quadratic references, strength and actual pressure', () => {
  const expectations = [[100, 0], [80, 0], [60, .16], [50, .36], [40, .64], [30, 1], [0, 1]];
  for (const [f, squared] of expectations) {
    const effective = abilities.effectiveAbilities(base, f, neutral, {actualPressure: true}, candidateCurves);
    for (const key of ['tec', 'pas', 'fin', 'gk']) near(effective[key], 12 * (1 - .1 * squared));
    for (const key of ['tak', 'air']) near(effective[key], 12 * (1 - .15 * squared));
    near(effective.calm, 12 * (1 - .2 * squared));
    near(effective.str, 12 * (1 - .2 * (100 - f) / 100));
    for (const key of ['pos', 'sta', 'spd']) near(effective[key], 12);
    const unpressured = abilities.effectiveAbilities(base, f, neutral, {actualPressure: false}, candidateCurves);
    near(unpressured.calm, 12);
  }
  near(abilities.effectiveAbilities(base, 50, neutral, {actualPressure: true}, candidateCurves).str, 10.8);
  near(abilities.effectiveAbilities(base, 0, neutral, {actualPressure: true}, candidateCurves).str, 9.6);
});

test('form is explicit, applied once, and never changes strength', () => {
  const positive = freeze(form(1.2)), negative = freeze(form(.8));
  const boosted = abilities.effectiveAbilities(base, 50, positive, {actualPressure: false}, candidateCurves);
  const reduced = abilities.effectiveAbilities(base, 50, negative, {actualPressure: false}, candidateCurves);
  near(boosted.pas, 12 * 1.2 * .964);
  near(boosted.str, 10.8); near(reduced.str, 10.8);
  near(boosted.pos, 14.4); near(boosted.sta, 14.4); near(boosted.spd, 14.4);
});

test('all curves are continuous, monotone and bounded over the full range', () => {
  let previousSkills, previousMovement;
  for (let f = 0; f <= 100; f += .25) {
    const effective = abilities.effectiveAbilities(base, f, neutral, {actualPressure: true}, candidateCurves);
    const movement = abilities.movementLimits({maxSpeed: 8, acceleration: 4}, f, candidateCurves);
    for (const key of abilities.SKILL_KEYS) {
      assert.ok(effective[key] >= 1 && effective[key] <= 20);
      if (previousSkills) assert.ok(effective[key] >= previousSkills[key] - 1e-10);
    }
    assert.ok(movement.maxSpeedMultiplier >= .85 && movement.maxSpeedMultiplier <= 1);
    assert.ok(movement.accelerationMultiplier >= .75 && movement.accelerationMultiplier <= 1);
    if (previousMovement) {
      assert.ok(movement.maxSpeed >= previousMovement.maxSpeed - 1e-10);
      assert.ok(movement.acceleration >= previousMovement.acceleration - 1e-10);
    }
    previousSkills = effective; previousMovement = movement;
  }
  for (const edge of [30, 40, 50, 80]) {
    const a = abilities.effectiveAbilities(base, edge - 1e-7, neutral, {actualPressure: true}, candidateCurves);
    const b = abilities.effectiveAbilities(base, edge + 1e-7, neutral, {actualPressure: true}, candidateCurves);
    for (const key of abilities.SKILL_KEYS) assert.ok(Math.abs(a[key] - b[key]) < 1e-6);
  }
});

test('separate movement limits avoid a second speed ability deduction', () => {
  const movement = abilities.movementLimits(freeze({maxSpeed: 8, acceleration: 4}), 0, candidateCurves);
  near(movement.maxSpeed, 6.8); near(movement.acceleration, 3);
  const fresh = abilities.movementLimits({maxSpeed: 8, acceleration: 4}, 100, candidateCurves);
  near(fresh.maxSpeed, 8); near(fresh.acceleration, 4);
  const effective = abilities.effectiveAbilities(base, 0, neutral, {actualPressure: true}, candidateCurves);
  near(effective.spd, base.spd); near(effective.ant, 12 * .85); near(effective.dec, 12 * .85);
});

test('outputs clamp to 1–20 and preserve permanent player fields and caps', () => {
  const player = freeze({skills: skills(1), caps: skills(20), heightCm: 193, talent: 22});
  const before = JSON.stringify(player);
  const exhausted = abilities.effectiveAbilities(player.skills, -5, form(.2), {actualPressure: true}, candidateCurves);
  for (const value of Object.values(exhausted)) near(value, 1);
  const boosted = abilities.effectiveAbilities(skills(20), 105, form(5), {actualPressure: false}, candidateCurves);
  for (const value of Object.values(boosted)) near(value, 20);
  assert.equal(JSON.stringify(player), before);
  assert.notEqual(exhausted, player.skills);
});

test('missing or invalid draft curves and form/pressure context cannot select defaults', () => {
  assert.throws(() => abilities.effectiveAbilities(base, 80, neutral, {actualPressure: false}, {}), /anticipationCurve/);
  assert.throws(() => abilities.movementLimits({maxSpeed: 8, acceleration: 4}, 80, {}), /maxSpeedCurve/);
  assert.throws(() => abilities.effectiveAbilities(base, 80, {multipliers: {}}, {actualPressure: true}, candidateCurves), /multipliers.tec/);
  assert.throws(() => abilities.effectiveAbilities(base, 80, neutral, {}, candidateCurves), /actualPressure/);
  assert.throws(() => abilities.effectiveAbilities(base, NaN, neutral, {actualPressure: true}, candidateCurves), /finite/);
  assert.throws(() => abilities.effectiveAbilities(base, 80, neutral, {actualPressure: true}, {...candidateCurves, anticipationCurve: [[0, 1], [50, .3], [70, .5], [100, 0]]}), /monotone/);
  assert.throws(() => abilities.movementLimits({maxSpeed: 8, acceleration: 4}, 80, {...candidateCurves, maxSpeedCurve: [[0, .5], [100, 0]]}), /endpoints/);
});

test('browser UMD export is independent of DOM, storage, clock and game globals', () => {
  const context = vm.createContext({}); vm.runInContext(source, context);
  assert.equal(typeof context.D6EffectiveAbilities.effectiveAbilities, 'function');
  assert.equal(context.D6EffectiveAbilities.effectiveAbilities(base, 50, neutral, {actualPressure: false}, candidateCurves).str, 10.8);
  assert.deepEqual(Object.keys(context).sort(), ['D6EffectiveAbilities']);
});
console.log(`Effective abilities: ${groups} groups passed; motion/mental candidates remain unapproved.`);
