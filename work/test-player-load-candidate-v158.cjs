'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const candidate = require('../dist/player-load-candidate-v158.js');
const freshness = require('../dist/player-freshness.js');
const abilities = require('../dist/player-effective-abilities.js');
const source = fs.readFileSync(path.join(__dirname, '../dist/player-load-candidate-v158.js'), 'utf8');
let groups = 0;
function test(name, run) { run(); groups++; console.log('PASS ' + name); }
function near(actual, expected) { assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`); }
function freeze(value) { Object.values(value).forEach(item => { if (item && typeof item === 'object') freeze(item); }); return Object.freeze(value); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function skills(value = 12) { return Object.fromEntries(abilities.SKILL_KEYS.map(key => [key, value])); }
const saved = candidate.createParameters();
const runtime = candidate.materializeParameters(saved);
function load(id, start, end, events = [], extras = {}) { return {id, fixtureId: 'fixture-158', stamina: 10, keeper: false, intervals: [{startMinute: start, endMinute: end}], events, ...extras}; }
function event(id, type, minute, units = 1, causeId = id) { return {id, type, minute, units, causeId}; }
function recover(state, type, id = type) { return freshness.recoverFreshness(state, {id, type, fixtureId: 'fixture-158'}); }
// Controlled reference workloads: sprint/pressing units are active virtual minutes;
// intense-duel units are actually executed contact counts. These are not match quotas.
function fieldEvents(half, intensity) {
  if (intensity === 'quiet') return [];
  const start = (half - 1) * 45;
  const movement = intensity === 'intense' ? [15, 67 / 7] : [5, 37 / 7];
  return [event('h' + half + '-sprint', 'sprint', start + 10, movement[0]), event('h' + half + '-press', 'pressing', start + 20, movement[1]),
    ...[1, 2, 3, 4].map(i => event('h' + half + '-contact-' + i, 'intense-duel', start + 30 + i))];
}
function fullField(stamina, intensity) {
  let state = freshness.createState('field-158', 100); const trail = [100];
  for (const half of [1, 2]) {
    state = freshness.consumeFreshness(state, load('half-' + half, (half - 1) * 45, half * 45, fieldEvents(half, intensity), {stamina}), runtime.loadParameters); trail.push(state.freshness);
    state = recover(state, half === 1 ? 'halftime' : 'final-whistle'); trail.push(state.freshness);
  }
  return {state, trail};
}

test('numeric candidate survives JSON and materializes without saved functions', () => {
  const restored = clone(saved), rebuilt = candidate.materializeParameters(restored);
  assert.deepEqual(rebuilt.parameters, saved);
  assert.deepEqual(clone(rebuilt.parameters), restored);
  function numbers(value, key = '') {
    if (value && typeof value === 'object') Object.entries(value).forEach(([name, item]) => numbers(item, name));
    else if (!['schema', 'parameterId'].includes(key)) assert.equal(typeof value, 'number');
  }
  numbers(saved);
  assert.equal(typeof rebuilt.loadParameters.staminaFactor, 'function');
  assert.equal(JSON.stringify(rebuilt.parameters).includes('staminaFactor'), false);
  assert.ok(Object.isFrozen(saved) && Object.isFrozen(saved.staminaCurves.field[0]) && Object.isFrozen(rebuilt.loadParameters));
  assert.equal(candidate.materializeParameters(saved), runtime);
  assert.equal(candidate.materializeParameters(runtime), runtime);
});

test('continuous positive field/keeper stamina factors preserve all references', () => {
  for (const kind of ['field', 'keeper']) {
    let previous = Infinity;
    for (let sta = 1; sta <= 20; sta += .125) {
      const factor = runtime.loadParameters.staminaFactor(sta, kind);
      assert.ok(factor > 0 && factor <= previous + 1e-10); previous = factor;
    }
    near(runtime.loadParameters.staminaFactor(10, kind), 1);
  }
  near(runtime.loadParameters.staminaFactor(6, 'field'), 80 / 70);
  near(runtime.loadParameters.staminaFactor(14, 'field'), 60 / 70);
  near(runtime.loadParameters.staminaFactor(8, 'field'), 75 / 70);
  near(runtime.loadParameters.staminaFactor(12, 'field'), 65 / 70);
  near(runtime.loadParameters.staminaFactor(1, 'keeper'), 1.36);
  near(runtime.loadParameters.staminaFactor(20, 'keeper'), .8);
});

test('controlled normal field workload reproduces 70/80/60 and half-time references', () => {
  const normal = fullField(10, 'normal');
  normal.trail.forEach((value, i) => near(value, [100, 65, 75, 40, 50][i]));
  for (const [stamina, total, final] of [[6, 80, 40], [10, 70, 50], [14, 60, 60]]) {
    const result = fullField(stamina, 'normal'); near(result.state.ledger.fixtures[0].consumed, total); near(result.state.freshness, final);
  }
});

test('observed quiet/intense load changes cost; no automatic normal action quota', () => {
  for (const [intensity, total, final] of [['quiet', 60, 60], ['normal', 70, 50], ['intense', 80, 40]]) {
    const result = fullField(10, intensity); near(result.state.ledger.fixtures[0].consumed, total); near(result.state.freshness, final);
  }
  const state = freshness.consumeFreshness(freshness.createState('quiet', 100), load('quiet', 0, 90, [], {role: 'pressing', tactic: 'intense'}), runtime.loadParameters);
  near(state.ledger.fixtures[0].consumed, 60);
  const activeMinute = freshness.consumeFreshness(freshness.createState('unit', 100), load('unit', 0, 1, [event('s', 'sprint', .5), event('p', 'pressing', .5), event('d', 'intense-duel', .5)]), runtime.loadParameters);
  near(activeMinute.ledger.fixtures[0].consumed, 60 / 90 + 3 * .35);
});

test('keeper normal reference includes actual jump/dive costs inside 40', () => {
  let state = freshness.createState('keeper-158', 100); const trail = [100];
  for (const half of [1, 2]) {
    const start = (half - 1) * 45;
    const events = [1, 2, 3, 4].map(i => event('h' + half + '-jump-' + i, 'keeper-jump', start + 10 + i));
    events.push(...[1, 2, 3].map(i => ({...event('h' + half + '-dive-' + i, 'keeper-dive', start + 20 + i), success: false})));
    state = freshness.consumeFreshness(state, load('keeper-' + half, start, start + 45, events, {keeper: true}), runtime.loadParameters); trail.push(state.freshness);
    state = recover(state, half === 1 ? 'halftime' : 'final-whistle'); trail.push(state.freshness);
  }
  trail.forEach((value, i) => near(value, [100, 80, 90, 70, 80][i])); near(state.ledger.fixtures[0].consumed, 40);
  const quiet = freshness.consumeFreshness(freshness.createState('quiet-keeper', 100), load('no-jump', 0, 90, [], {keeper: true}), runtime.loadParameters);
  near(quiet.ledger.fixtures[0].consumed, 30);
});

test('overlapping active minutes/actions deduplicate causes and partial delivery', () => {
  const initial = freshness.createState('field-overlap', 100);
  const sprint = event('s', 'sprint', 5, .5, 'run-player-minute');
  const pressing = event('p', 'pressing', 5, 1, 'run-player-minute');
  const first = freshness.consumeFreshness(initial, load('first', 0, 10, [sprint]), runtime.loadParameters);
  const later = freshness.consumeFreshness(first, load('later', 5, 15, [pressing]), runtime.loadParameters);
  const together = freshness.consumeFreshness(initial, load('together', 0, 15, [sprint, pressing]), runtime.loadParameters);
  near(later.freshness, together.freshness); near(later.ledger.fixtures[0].consumed, 15 * 60 / 90 + .35);
  const keep = freshness.createState('keeper-overlap', 100);
  const jump = event('j', 'keeper-jump', 5, 1, 'same-air'); const dive = event('d', 'keeper-dive', 5, 1, 'same-air');
  const partial = freshness.consumeFreshness(keep, load('jump', 0, 10, [jump], {keeper: true}), runtime.loadParameters);
  const complete = freshness.consumeFreshness(partial, load('dive', 0, 10, [dive], {keeper: true}), runtime.loadParameters);
  near(complete.ledger.fixtures[0].consumed, 10 / 3 + 1);
  const fieldAir = freshness.consumeFreshness(initial, load('header', 0, 10, [event('head', 'field-jump', 5)]), runtime.loadParameters);
  near(fieldAir.ledger.fixtures[0].consumed, 10 * 60 / 90);
});

test('save/restore and repeated delivery preserve cost and recovery exactly', () => {
  const batch = freeze(load('h1', 0, 45, fieldEvents(1, 'normal')));
  const original = freeze(freshness.createState('saved-player', 100)); const before = JSON.stringify(original);
  const used = freshness.consumeFreshness(original, batch, runtime.loadParameters);
  const restored = freshness.restoreState(freshness.serializeState(used));
  const rebuilt = candidate.materializeParameters(clone(saved));
  assert.deepEqual(freshness.consumeFreshness(restored, batch, rebuilt.loadParameters), restored);
  const half = recover(restored, 'halftime');
  assert.deepEqual(recover(half, 'halftime'), half);
  const retransport = recover(half, 'halftime', 'different-transport'); near(retransport.freshness, 75);
  near(freshness.recoverFreshness(retransport, {id: 'day1', type: 'rest-day', dayId: '2030-10-10', fullMatchFreeDay: true}).freshness, 84.25);
  assert.equal(JSON.stringify(original), before); assert.deepEqual(batch, load('h1', 0, 45, fieldEvents(1, 'normal')));
});

test('explicit linear fatigue curves preserve approved maxima and base skill exemptions', () => {
  const base = freeze(skills()), before = JSON.stringify(base), neutral = candidate.formContext(base, 0, runtime.formParameters);
  for (const [fresh, expected] of [[100, [1, 1, 1, 1, 1]], [0, [.9, .85, .8, .85, .85]]]) {
    const result = abilities.effectiveAbilities(base, fresh, neutral, {actualPressure: true}, runtime.effectParameters);
    for (const key of ['tec', 'pas', 'fin', 'gk']) near(result[key], 12 * expected[0]);
    for (const key of ['tak', 'air']) near(result[key], 12 * expected[1]);
    near(result.calm, 12 * expected[2]); near(result.str, 12 * expected[2]); near(result.ant, 12 * expected[3]); near(result.dec, 12 * expected[4]);
    for (const key of ['spd', 'sta', 'pos']) near(result[key], 12);
    near(abilities.effectiveAbilities(base, fresh, neutral, {actualPressure: false}, runtime.effectParameters).calm, 12);
  }
  let prior;
  for (let fresh = 0; fresh <= 100; fresh += .25) {
    const movement = abilities.movementLimits({maxSpeed: 8, acceleration: 4}, fresh, runtime.effectParameters);
    near(movement.maxSpeedMultiplier, 1 - .15 * (100 - fresh) / 100);
    near(movement.accelerationMultiplier, 1 - .25 * (100 - fresh) / 100);
    assert.ok(movement.maxSpeedMultiplier >= .85 && movement.accelerationMultiplier >= .75);
    if (prior) assert.ok(movement.maxSpeed >= prior.maxSpeed && movement.acceleration >= prior.acceleration);
    prior = movement;
  }
  assert.equal(JSON.stringify(base), before);
});

test('raw bounded form matches existing half-point impact without fatigue-derived form loss', () => {
  const base = freeze(skills());
  for (const raw of [-100, -2, -1, 0, 1, 2, 100]) {
    const stage = Math.max(-2, Math.min(2, raw)), form = candidate.formContext(base, raw, runtime.formParameters);
    const result = abilities.effectiveAbilities(base, 100, form, {actualPressure: false}, runtime.effectParameters);
    for (const key of abilities.SKILL_KEYS) near(result[key], key === 'str' ? 12 : 12 + stage * .5);
    near(form.multipliers.str, 1);
  }
  const positive = candidate.formContext(base, 2, runtime.formParameters);
  const tired = abilities.effectiveAbilities(base, 0, positive, {actualPressure: false}, runtime.effectParameters);
  near(tired.pas, 13 * .9); near(tired.pos, 13); near(tired.str, 12 * .8);
  for (const value of [1, 20]) for (const raw of [-2, 2]) {
    const form = candidate.formContext(skills(value), raw, runtime.formParameters);
    Object.values(form.multipliers).forEach(multiplier => assert.ok(multiplier >= 0 && multiplier <= 2));
    Object.values(abilities.effectiveAbilities(skills(value), 0, form, {actualPressure: true}, runtime.effectParameters)).forEach(result => assert.ok(result >= 1 && result <= 20));
  }
});

test('materialization is deterministic, isolates mutable restore input and rejects invalid parameters', () => {
  const restored = clone(saved), before = JSON.stringify(restored), first = candidate.materializeParameters(restored);
  assert.equal(JSON.stringify(restored), before);
  restored.actionRates.sprint = .7;
  near(first.loadParameters.actionRates.sprint, .35);
  near(candidate.materializeParameters(restored).loadParameters.actionRates.sprint, .7);
  for (const mutate of [p => { p.schema = 'old'; }, p => { p.loadPartition.field.basePerMinute = 1; }, p => { p.actionRates.sprint = -1; },
    p => { p.actionRates.pressing = NaN; }, p => { p.staminaCurves.field[1][1] = 1; }, p => { p.staminaCurves.keeper[1][1] = 2; },
    p => { p.effectParameters.anticipationCurve = [[0, .5], [100, 0]]; }, p => { delete p.effectParameters.accelerationCurve; },
    p => { p.formParameters.additivePerStage = 1; }, p => { p.actionRates.sprint = () => .35; }, p => { p.extra = 1; }]) {
    const invalid = clone(saved); mutate(invalid); assert.throws(() => candidate.materializeParameters(invalid));
  }
  assert.throws(() => runtime.loadParameters.staminaFactor(0, 'field'), /between 1 and 20/);
  assert.throws(() => runtime.loadParameters.staminaFactor(10, 'unknown'), /kind/);
  assert.throws(() => candidate.formContext(skills(), NaN, runtime.formParameters), /finite/);
  assert.throws(() => candidate.formContext({...skills(), spd: 21}, 1, runtime.formParameters), /between 1 and 20/);
  assert.throws(() => candidate.formContext(skills(), 1), /object/);
});

test('UMD browser export has no DOM/clock/random dependency and matches Node', () => {
  const context = vm.createContext({}); vm.runInContext(source, context);
  assert.equal(context.D6LoadCandidate.PARAMETER_ID, candidate.PARAMETER_ID);
  assert.deepEqual(clone(context.D6LoadCandidate.createParameters()), clone(saved));
  const browserRuntime = context.D6LoadCandidate.materializeParameters(context.D6LoadCandidate.createParameters());
  near(browserRuntime.loadParameters.staminaFactor(8.5, 'field'), runtime.loadParameters.staminaFactor(8.5, 'field'));
  assert.deepEqual(clone(context.D6LoadCandidate.formContext(skills(), 1, browserRuntime.formParameters)), candidate.formContext(skills(), 1, runtime.formParameters));
});

console.log(`${groups} player load candidate v158 groups passed`);
