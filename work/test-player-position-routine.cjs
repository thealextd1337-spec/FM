'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const routine = require('../dist/player-position-routine.js');
const params = routine.candidateParameters;
let groups = 0;
function test(name, run) { run(); groups++; console.log('PASS ' + name); }
function near(actual, expected) { assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`); }
function freeze(value) { Object.values(value).forEach(item => { if (item && typeof item === 'object') freeze(item); }); return Object.freeze(value); }

test('main starts full for every position, sides start at an explicit ground value, foreign zero', () => {
  for (const main of routine.POSITIONS) {
    const playable = main === 'gk' ? ['gk'] : [main, main === 'mid' ? 'att' : 'mid'];
    const created = routine.createRoutine(main, playable, params);
    assert.equal(created[main], params.cap);
    for (const position of routine.POSITIONS.filter(position => position !== main)) assert.equal(created[position], playable.includes(position) ? params.secondaryStart : 0);
  }
  assert.deepEqual(routine.createRoutine('gk', ['gk'], params), {gk: 100, def: 0, mid: 0, att: 0});
});

test('actual short minutes and multiple positions grow independently without a role reset', () => {
  const created = freeze(routine.createRoutine('att', ['att', 'mid'], params));
  const one = routine.routineTransition(created, {mid: 1, def: 19}, params);
  near(one.mid, 25 + 1 / 18); near(one.def, 19 / 18); assert.equal(one.att, 100);
  const split = routine.routineTransition(routine.routineTransition(created, {mid: 7}, params), {mid: 12}, params);
  const combined = routine.routineTransition(created, {mid: 19}, params);
  for (const position of routine.POSITIONS) near(split[position], combined[position]);
});

test('zero/non-use/season/transfer has no decay and an old routine is immutable', () => {
  const old = freeze({gk: 0, def: 42.5, mid: 100, att: 25}), before = JSON.stringify(old);
  for (const minutes of [{}, {gk: 0, def: 0, mid: 0, att: 0}]) {
    const next = routine.routineTransition(old, minutes, params);
    assert.deepEqual(next, old); assert.notEqual(next, old);
  }
  assert.equal(JSON.stringify(old), before);
});

test('foreign routine can reach its cap without adding a profile position or skill value', () => {
  const profile = freeze({mainPosition: 'mid', playablePositions: ['mid'], skills: {pas: 10}});
  const stored = routine.createRoutine(profile.mainPosition, profile.playablePositions, params);
  const next = routine.routineTransition(stored, {att: params.minutesToFull, mid: 90000}, params);
  assert.equal(next.att, params.cap); assert.equal(next.mid, params.cap);
  assert.deepEqual(profile.playablePositions, ['mid']); assert.deepEqual(profile.skills, {pas: 10});
  assert.deepEqual(Object.keys(next).sort(), ['att', 'def', 'gk', 'mid']);
});

test('caller-provided scale/rate and save/load round trips are explicit and stable', () => {
  const custom = {id: 'test-only', cap: 20, secondaryStart: 5, minutesToFull: 900};
  const created = routine.createRoutine('def', ['def', 'mid'], custom);
  near(routine.routineTransition(created, {att: 450, mid: 900}, custom).att, 10);
  assert.equal(routine.routineTransition(created, {att: 450, mid: 900}, custom).mid, 20);
  assert.deepEqual(routine.routineTransition(JSON.parse(JSON.stringify(created)), {mid: 5}, JSON.parse(JSON.stringify(custom))), routine.routineTransition(created, {mid: 5}, custom));
});

test('missing approvals, unknown positions, negative or nonfinite minutes reject atomically', () => {
  const old = freeze({gk: 0, def: 0, mid: 100, att: 25}), before = JSON.stringify(old);
  assert.throws(() => routine.createRoutine('mid', ['mid']), /parameters/);
  assert.throws(() => routine.createRoutine('gk', ['gk', 'def'], params), /Keeper/);
  assert.throws(() => routine.createRoutine('mid', ['mid', 'mid'], params), /Distinct/);
  assert.throws(() => routine.routineTransition(old, {mid: -1}, params), /negative/);
  assert.throws(() => routine.routineTransition(old, {mid: NaN}, params), /finite/);
  assert.throws(() => routine.routineTransition(old, {wing: 20}, params), /Unknown/);
  assert.throws(() => routine.routineTransition(old, {}, {...params, cap: 0}), /positive/);
  assert.throws(() => routine.routineTransition({...old, att: 101}, {}, params), /cap/);
  assert.equal(JSON.stringify(old), before);
});

test('browser global and candidate configuration are serializable and independent of wall clocks', () => {
  const browser = {Math: Object.create(Math), Date: class { constructor() { throw Error('No wall clock'); } }};
  browser.Math.random = () => { throw Error('No RNG'); };
  vm.createContext(browser); vm.runInContext(fs.readFileSync(path.join(__dirname, '../dist/player-position-routine.js'), 'utf8'), browser);
  const saved = JSON.parse(JSON.stringify(browser.D6PositionRoutine.candidateParameters));
  assert.deepEqual(saved, params);
  const value = browser.D6PositionRoutine.routineTransition({gk: 0, def: 0, mid: 100, att: 25}, {att: 18}, saved);
  assert.equal(value.att, 26);
});
console.log(`${groups} player position routine groups passed`);
