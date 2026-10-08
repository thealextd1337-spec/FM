'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { SKILL_KEYS, createLedger, agingDelta, agingTransition } = require('../dist/player-aging.js');
let checks = 0;
function test(name, body) { body(); checks++; console.log('PASS ' + name); }
function all(value) { return Object.fromEntries(SKILL_KEYS.map(key => [key, value])); }
function apply(skills, delta) { return Object.fromEntries(SKILL_KEYS.map(key => [key, skills[key] + delta[key]])); }
function close(actual, expected) { assert.ok(Math.abs(actual - expected) < 1e-12, `${actual} differs from ${expected}`); }
function freeze(value) { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }

test('new-season ages 29/30/32/33 use the approved exact losses', () => {
  [[29, 0, 0], [30, 0.5, 0.25], [31, 0.5, 0.25], [32, 0.5, 0.25], [33, 1, 0.5], [45, 1, 0.5]].forEach(([age, body, stamina]) => {
    const delta = agingDelta(all(14), age);
    assert.equal(delta.spd, -body || 0); assert.equal(delta.str, -body || 0); assert.equal(delta.sta, -stamina || 0);
    SKILL_KEYS.filter(key => !['spd', 'str', 'sta'].includes(key)).forEach(key => assert.equal(delta[key], 0));
  });
});

test('physical floors clamp immediately at one with unchanged technical/mental/keeper values', () => {
  const skills = { ...all(10), spd: 1.1, str: 1, sta: 1.2 };
  const delta = agingDelta(skills, 33), next = apply(skills, delta);
  assert.equal(next.spd, 1); assert.equal(next.str, 1); assert.equal(next.sta, 1);
  close(delta.spd, -0.1); close(delta.sta, -0.2);
  SKILL_KEYS.filter(key => !['spd', 'str', 'sta'].includes(key)).forEach(key => assert.equal(next[key], skills[key]));
});

test('29→30 and 32→33 transition once; field player and keeper calculation identical', () => {
  let skills = all(14), ledger = createLedger('keeper', 'world');
  const first = agingTransition(skills, ledger, { worldId: 'world', seasonId: 'age30', newAge: 30 });
  assert.equal(first.status, 'applied'); skills = apply(skills, first.skillDelta); ledger = first.nextLedger;
  assert.equal(skills.spd, 13.5); assert.equal(skills.sta, 13.75); assert.equal(skills.str, 13.5);
  const replay = agingTransition(skills, ledger, { worldId: 'world', seasonId: 'age30', newAge: 30 });
  assert.equal(replay.status, 'duplicate'); assert.deepEqual(replay.skillDelta, all(0)); assert.deepEqual(replay.nextLedger, ledger);
  const older = agingTransition(skills, ledger, { worldId: 'world', seasonId: 'age33', newAge: 33 });
  assert.equal(older.skillDelta.spd, -1); assert.equal(older.skillDelta.sta, -0.5); assert.equal(older.skillDelta.str, -1);
  const field = agingTransition(all(14), createLedger('field', 'world'), { worldId: 'world', seasonId: 'age30', newAge: 30 });
  assert.deepEqual(field.skillDelta, first.skillDelta);
});

test('serialization, transfer and historical replay never age twice', () => {
  const first = agingTransition(all(14), createLedger('p', 'w'), { worldId: 'w', seasonId: 's1', newAge: 30 });
  let ledger = JSON.parse(JSON.stringify(first.nextLedger)), skills = apply(all(14), first.skillDelta);
  const later = agingTransition(skills, ledger, { worldId: 'w', seasonId: 's2', newAge: 31 });
  ledger = JSON.parse(JSON.stringify(later.nextLedger)); skills = apply(skills, later.skillDelta);
  const reloadedAtOtherClub = { id: 'p', clubId: 'other', skills };
  const historical = agingTransition(reloadedAtOtherClub.skills, ledger, { worldId: 'w', seasonId: 's1', newAge: 30 });
  assert.equal(historical.status, 'duplicate'); assert.deepEqual(historical.skillDelta, all(0));
  assert.equal(historical.nextLedger.processedSeasons.length, 2);
  const wrongWorld = agingTransition(skills, ledger, { worldId: 'other-world', seasonId: 's3', newAge: 33 });
  assert.equal(wrongWorld.status, 'unsupported'); assert.deepEqual(wrongWorld.nextLedger, ledger);
  const unrecordedHistory = agingTransition(skills, ledger, { worldId: 'w', seasonId: 'older-unrecorded', newAge: 29 });
  assert.equal(unrecordedHistory.reason, 'out-of-order-transition'); assert.deepEqual(unrecordedHistory.nextLedger, ledger);
});

test('under-30 and floor-only transitions are still recorded as completed', () => {
  [29, 33].forEach(age => {
    const first = agingTransition(all(1), createLedger('p', 'w'), { worldId: 'w', seasonId: 's', newAge: age });
    assert.equal(first.status, 'no-change'); assert.equal(first.nextLedger.processedSeasons.length, 1);
    const duplicate = agingTransition(all(14), first.nextLedger, { worldId: 'w', seasonId: 's', newAge: 33 });
    assert.equal(duplicate.status, 'duplicate'); assert.deepEqual(duplicate.skillDelta, all(0));
  });
});

test('pure immutable aging leaves height/foot/talent/caps and retirement decisions untouched', () => {
  const p = freeze({ id: 'p', age: 32, skills: all(14), caps: all(20), talent: 19, heightCm: 190, preferredFoot: 'left', retired: false });
  const ledger = freeze(createLedger(p.id, 'w'));
  const transition = freeze({ worldId: 'w', seasonId: 's', newAge: 33 });
  const before = JSON.stringify({ p, ledger, transition });
  const first = agingTransition(p.skills, ledger, transition), second = agingTransition(p.skills, ledger, transition);
  assert.deepEqual(first, second); assert.equal(JSON.stringify({ p, ledger, transition }), before);
  first.nextLedger.processedSeasons[0].newAge = 80;
  assert.equal(second.nextLedger.processedSeasons[0].newAge, 33);
});

test('browser UMD exports only D6Aging and agrees with Node', () => {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../dist/player-aging.js'), 'utf8'), context);
  assert.deepEqual(Object.keys(context), ['D6Aging']);
  assert.equal(JSON.stringify(context.D6Aging.agingDelta(all(10), 33)), JSON.stringify(agingDelta(all(10), 33)));
});

test('invalid permanent skills, age and ledger do not silently calculate', () => {
  assert.throws(() => agingDelta({ ...all(10), spd: 0 }, 33), /Invalid skill/);
  assert.throws(() => agingDelta(all(10), NaN), /newAge/);
  assert.throws(() => agingDelta(all(10), 32.5), /newAge/);
  assert.throws(() => agingTransition(all(10), {}, { worldId: 'w', seasonId: 's', newAge: 33 }), /ledger/);
});

console.log(`Aging: ${checks} scenario groups passed (pure season transitions; retirement logic untouched).`);
