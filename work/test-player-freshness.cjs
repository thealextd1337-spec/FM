'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const freshness = require('../dist/player-freshness.js');
const source = fs.readFileSync(path.join(__dirname, '../dist/player-freshness.js'), 'utf8');
let groups = 0;
function test(name, run) { run(); groups++; console.log('PASS ' + name); }
function near(actual, expected) { assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`); }
function freeze(value) { Object.values(value).forEach(item => { if (item && typeof item === 'object') freeze(item); }); return Object.freeze(value); }
// CANDIDATE ONLY: partitions, units/rates, interpolation and keeper stamina curve
// serve reference proofs, not production defaults or role-driven load modes.
const candidateParameters = freeze({
  loadPartition: {field: {basePerMinute: 60 / 90, normalActionCost90: 10}, keeper: {basePerMinute: 30 / 90, normalActionCost90: 10}},
  actionRates: {sprint: 1, pressing: 1, intenseDuel: 1},
  staminaFactor(stamina, kind) { return kind === 'field' ? (95 - 2.5 * stamina) / 70 : stamina <= 10 ? 1 + (10 - stamina) * .04 : 1 - (stamina - 10) * .02; }
});
function load(id, start, end, events = [], extras = {}) { return {id, fixtureId: 'fixture-1', stamina: 10, keeper: false, intervals: [{startMinute: start, endMinute: end}], events, ...extras}; }
function event(id, type, minute, units = 1, causeId = id) { return {id, type, minute, units, causeId}; }
function transition(id, type, extras = {}) { return {id, type, fixtureId: 'fixture-1', ...extras}; }
function fieldEvents(half, intensity) {
  if (intensity === 'quiet') return [];
  const start = half === 1 ? 0 : 45;
  const units = intensity === 'intense' ? [5, 3, 2] : [2, 1, 2];
  return ['sprint', 'pressing', 'intense-duel'].map((type, i) => event('h' + half + '-' + type, type, start + 10 + i, units[i]));
}
function fullField(stamina, intensity) {
  let state = freshness.createState('p1', 100); const trail = [state.freshness];
  state = freshness.consumeFreshness(state, load('h1', 0, 45, fieldEvents(1, intensity), {stamina}), candidateParameters); trail.push(state.freshness);
  state = freshness.recoverFreshness(state, transition('half', 'halftime')); trail.push(state.freshness);
  state = freshness.consumeFreshness(state, load('h2', 45, 90, fieldEvents(2, intensity), {stamina}), candidateParameters); trail.push(state.freshness);
  state = freshness.recoverFreshness(state, transition('full', 'final-whistle')); trail.push(state.freshness);
  return {state, trail};
}

test('confirmed field 100→65→75→40→50 and stamina references', () => {
  const normal = fullField(10, 'normal'); normal.trail.forEach((value, i) => near(value, [100, 65, 75, 40, 50][i]));
  near(normal.state.ledger.fixtures[0].consumed, 70);
  for (const [stamina, total, final] of [[6, 80, 40], [14, 60, 60]]) {
    const result = fullField(stamina, 'normal'); near(result.state.ledger.fixtures[0].consumed, total); near(result.trail[3], final - 10); near(result.state.freshness, final);
  }
});

test('actual quiet/normal/intense load references without tactic or role charges', () => {
  for (const [intensity, total, final] of [['quiet', 60, 60], ['normal', 70, 50], ['intense', 80, 40]]) {
    const result = fullField(10, intensity); near(result.state.ledger.fixtures[0].consumed, total); near(result.state.freshness, final);
  }
  const state = freshness.createState('p1', 100);
  const quiet = freshness.consumeFreshness(state, load('quiet', 0, 45, [], {role: 'pressing', tactic: 'early'}), candidateParameters);
  near(quiet.freshness, 70);
  const busy = freshness.consumeFreshness(state, load('busy', 0, 45, fieldEvents(1, 'intense'), {role: 'position'}), candidateParameters);
  near(busy.freshness, 60);
});

test('keeper 100→80→90→70→80 includes typical actions in 40', () => {
  let state = freshness.createState('gk1', 100); const trail = [100];
  for (const half of [1, 2]) {
    const start = half === 1 ? 0 : 45;
    const events = [0, 1, 2, 3].map(i => event(`h${half}-jump${i}`, 'keeper-jump', start + 10 + i));
    events.push(...[0, 1, 2].map(i => ({...event(`h${half}-dive${i}`, 'keeper-dive', start + 20 + i), success: i > 0})));
    state = freshness.consumeFreshness(state, load('gk-h' + half, start, start + 45, events, {keeper: true}), candidateParameters); trail.push(state.freshness);
    state = freshness.recoverFreshness(state, transition('gk-' + half, half === 1 ? 'halftime' : 'final-whistle')); trail.push(state.freshness);
  }
  trail.forEach((value, i) => near(value, [100, 80, 90, 70, 80][i])); near(state.ledger.fixtures[0].consumed, 40);
});

test('sprint/pressing one cause, jump/dive one cause, and no field jump cost', () => {
  const start = freshness.createState('p1', 100);
  const one = freshness.consumeFreshness(start, load('one', 0, 10, [event('s', 'sprint', 5, 3, 'run')]), candidateParameters);
  const overlap = freshness.consumeFreshness(start, load('both', 0, 10, [event('s', 'sprint', 5, 3, 'run'), event('p', 'pressing', 5, 3, 'run')]), candidateParameters);
  near(one.freshness, overlap.freshness);
  const streamed = freshness.consumeFreshness(one, load('later', 0, 10, [event('p', 'pressing', 5, 3, 'run')]), candidateParameters);
  near(streamed.freshness, one.freshness);
  const keeper = freshness.createState('gk1', 100);
  const jump = freshness.consumeFreshness(keeper, load('jump', 0, 10, [event('j', 'keeper-jump', 5, 1, 'air')], {keeper: true}), candidateParameters);
  const diveLater = freshness.consumeFreshness(jump, load('dive', 0, 10, [event('d', 'keeper-dive', 5, 1, 'air')], {keeper: true}), candidateParameters);
  const diveFirst = freshness.consumeFreshness(keeper, load('dive-first', 0, 10, [event('d', 'keeper-dive', 5, 1, 'air'), event('j', 'keeper-jump', 5, 1, 'air')], {keeper: true}), candidateParameters);
  near(diveLater.freshness, 100 - 10 / 3 - 1); near(diveFirst.freshness, diveLater.freshness);
  const fieldJump = freshness.consumeFreshness(start, load('header', 0, 10, [event('head', 'field-jump', 5)]), candidateParameters);
  near(fieldJump.freshness, 100 - 10 * 60 / 90);
});

test('played intervals deduplicate overlaps and honor substitutions and fractional virtual minutes', () => {
  let state = freshness.createState('sub', 50);
  state = freshness.consumeFreshness(state, load('sub', 85, 90), candidateParameters); near(state.freshness, 50 - 5 * 60 / 90);
  state = freshness.consumeFreshness(state, load('overlap', 87, 90), candidateParameters); near(state.freshness, 50 - 5 * 60 / 90);
  let starter = freshness.createState('starter', 100);
  starter = freshness.consumeFreshness(starter, load('part1', 0, 20), candidateParameters);
  starter = freshness.consumeFreshness(starter, load('part2', 15, 30.5), candidateParameters); near(starter.freshness, 100 - 30.5 * 60 / 90);
  assert.throws(() => freshness.consumeFreshness(state, load('invalid', 85, 90, [event('not-playing', 'sprint', 70)]), candidateParameters), /played virtual minutes/);
});

test('load/event IDs survive JSON restore and conflicts fail without mutation', () => {
  const initial = freeze(freshness.createState('p1', 100)); const input = freeze(load('batch', 0, 45, fieldEvents(1, 'normal')));
  const before = JSON.stringify(initial), first = freshness.consumeFreshness(initial, input, candidateParameters);
  assert.equal(JSON.stringify(initial), before); assert.notEqual(first, initial);
  const restored = freeze(freshness.restoreState(freshness.serializeState(first)));
  assert.deepEqual(freshness.consumeFreshness(restored, input, candidateParameters), restored);
  const duplicateEvents = freshness.consumeFreshness(restored, load('new-batch', 0, 45, fieldEvents(1, 'normal')), candidateParameters); near(duplicateEvents.freshness, 65);
  assert.throws(() => freshness.consumeFreshness(restored, {...input, intervals: [{startMinute: 0, endMinute: 46}]}, candidateParameters), /conflicting payload/);
  assert.throws(() => freshness.consumeFreshness(restored, load('conflict', 0, 45, [event('h1-sprint', 'sprint', 10, 9)]), candidateParameters), /conflicting payload/);
  const changedRates = {...candidateParameters, actionRates: {...candidateParameters.actionRates, sprint: 2}};
  assert.throws(() => freshness.consumeFreshness(restored, load('changed-config', 45, 46), changedRates), /parameters cannot change/);
  const invalidRestore = JSON.parse(freshness.serializeState(first)); invalidRestore.ledger.fixtures[0].minuteRanges[0].endMinute = -1;
  assert.throws(() => freshness.restoreState(JSON.stringify(invalidRestore)), /negative/);
  assert.equal(JSON.stringify(restored), JSON.stringify(first));
});

test('halftime/final recover once across duplicate IDs, pause reopen and restore', () => {
  let state = freshness.createState('p1', 65);
  state = freshness.recoverFreshness(state, transition('half', 'halftime')); near(state.freshness, 75);
  assert.deepEqual(freshness.recoverFreshness(state, transition('half', 'halftime')), state);
  state = freshness.restoreState(freshness.serializeState(state));
  state = freshness.recoverFreshness(state, transition('reopened-pause', 'halftime')); near(state.freshness, 75);
  state = freshness.recoverFreshness(state, transition('full', 'final-whistle')); near(state.freshness, 85);
  state = freshness.recoverFreshness(state, transition('finish-again', 'final-whistle')); near(state.freshness, 85);
  assert.throws(() => freshness.recoverFreshness(state, transition('half', 'final-whistle')), /conflicting payload/);
  near(freshness.recoverFreshness(freshness.createState('p1', 96), transition('cap', 'halftime')).freshness, 100);
});

test('full calendar rest days iterate the current gap and never use wallclock', () => {
  let state = freeze(freshness.createState('p1', 50)); const values = [65.5, 77.125, 85.84375, 92.3828125, 97.287109375, 100];
  for (let day = 1; day <= 6; day++) {
    const rest = {id: 'rest-' + day, type: 'rest-day', dayId: 'season1-day' + day, fullMatchFreeDay: true};
    state = freshness.recoverFreshness(state, rest); near(state.freshness, values[day - 1]);
    assert.deepEqual(freshness.recoverFreshness(state, rest), state);
    const reidentified = freshness.recoverFreshness(state, {...rest, id: 'reopen-' + day}); near(reidentified.freshness, values[day - 1]);
    state = freshness.restoreState(freshness.serializeState(reidentified));
  }
  assert.throws(() => freshness.recoverFreshness(state, {id: 'partial', type: 'rest-day', dayId: 'day7', fullMatchFreeDay: false}), /full match-free/);
  const a = freshness.consumeFreshness(freshness.createState('p1', 100), load('virtual', 0, 10, [], {realElapsedMs: 50}), candidateParameters);
  const b = freshness.consumeFreshness(freshness.createState('p1', 100), load('virtual', 0, 10, [], {realElapsedMs: 900000}), candidateParameters);
  assert.deepEqual(a, b);
});

test('bounds, keeper isolation, open parameters and references are enforced', () => {
  near(freshness.consumeFreshness(freshness.createState('p1', 2), load('long', 0, 90), candidateParameters).freshness, 0);
  assert.throws(() => freshness.consumeFreshness(freshness.createState('p1', 100), load('missing', 0, 1), {}), /loadPartition/);
  const badKeeper = {...candidateParameters, loadPartition: {...candidateParameters.loadPartition, keeper: {basePerMinute: 40 / 90, normalActionCost90: 10}}};
  assert.throws(() => freshness.consumeFreshness(freshness.createState('p1', 100), load('double-base', 0, 1), badKeeper), /inside the confirmed/);
  assert.throws(() => freshness.consumeFreshness(freshness.createState('p1', 100), load('wrong-stamina', 0, 1), {...candidateParameters, staminaFactor: () => 1}), /6\/10\/14/);
  assert.throws(() => freshness.consumeFreshness(freshness.createState('p1', 100), load('field-dive', 0, 1, [event('d', 'keeper-dive', .5)]), candidateParameters), /field players/);
  assert.throws(() => freshness.consumeFreshness(freshness.createState('p1', 100), load('no-cause', 0, 1, [{id: 'e', type: 'sprint', minute: .5, units: 1}]), candidateParameters), /causeId/);
});

test('browser export needs no game, DOM, storage, timer or RNG', () => {
  const context = vm.createContext({}); vm.runInContext(source, context);
  assert.equal(typeof context.D6Freshness.consumeFreshness, 'function');
  assert.equal(context.D6Freshness.createState('p1', 100).freshness, 100);
  assert.deepEqual(Object.keys(context).sort(), ['D6Freshness']);
});
console.log(`Freshness: ${groups} groups passed; load/stamina/partition candidates remain unapproved.`);
