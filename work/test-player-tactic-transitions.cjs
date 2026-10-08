'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const transitions = require('../dist/player-tactic-transitions.js');
const params = transitions.candidateParameters;
let groups = 0;
function test(name, run) { run(); groups++; console.log('PASS ' + name); }
function freeze(value) { Object.values(value).forEach(item => { if (item && typeof item === 'object') freeze(item); }); return Object.freeze(value); }
function assignments() { return {a: {cell: 27, position: 'def', roleId: 'cover-defender', orientation: -1}, b: {cell: 17, position: 'mid', roleId: 'playmaker', orientation: 1}, c: {cell: 7, position: 'att', roleId: 'poacher', orientation: 1}, k: {cell: null, position: 'gk', roleId: 'line-keeper', orientation: 0}}; }
function zone(depth, width, keeper = false) { return transitions.zoneForPoint({depth, width, keeper}); }

test('half-open length boundaries and inclusive central width boundaries are exact', () => {
  for (const [depth, position] of [[0, 'def'], [.299999999, 'def'], [.30, 'mid'], [.699999999, 'mid'], [.70, 'att'], [1, 'att']]) assert.equal(zone(depth, .5).position, position);
  for (const [width, lane] of [[0, 'left'], [.24999999, 'left'], [.25, 'center'], [.75, 'center'], [.75000001, 'right'], [1, 'right']]) assert.equal(zone(.5, width).lane, lane);
  assert.deepEqual(zone(.9, .1, true), {position: 'gk', lane: 'center'});
});

test('full confirmed role/zone matrix never filters on profile recommendations or skills', () => {
  for (const width of [.1, .5, .9]) assert.deepEqual(transitions.allowedRoles(zone(.1, width)), ['cover-defender', 'stopper', 'ball-playing-defender']);
  assert.deepEqual(transitions.allowedRoles(zone(.5, .5)), ['playmaker', 'ball-winner', 'box-to-box']);
  for (const width of [.1, .9]) {
    assert.deepEqual(transitions.allowedRoles(zone(.5, width)), ['winger']);
    assert.deepEqual(transitions.allowedRoles(zone(.9, width)), ['winger', 'dribbler']);
  }
  assert.deepEqual(transitions.allowedRoles(zone(.9, .5)), ['poacher', 'striker', 'target-player', 'dribbler']);
  assert.deepEqual(transitions.allowedRoles(zone(.5, .5, true)), ['line-keeper', 'sweeper-keeper']);
  const eligible = transitions.allowedRoles(zone(.5, .5)); eligible.pop();
  assert.equal(transitions.allowedRoles(zone(.5, .5)).length, 3);
});

test('all four field/team configurations and mirrored directions share relative zones', () => {
  for (const widthMetres of [30, 40]) for (const players of [5, 6]) {
    const lengthMetres = widthMetres === 30 ? 45 : 60;
    for (const depth of [.1, .5, .9]) for (const width of [.1, .5, .9]) {
      const expected = zone(depth, width);
      const bottom = transitions.pointForPhysical({x: width * widthMetres, y: (1 - depth) * lengthMetres}, {widthMetres, lengthMetres, players, ownGoal: 'bottom'});
      const top = transitions.pointForPhysical({x: (1 - width) * widthMetres, y: depth * lengthMetres}, {widthMetres, lengthMetres, players, ownGoal: 'top'});
      assert.deepEqual(transitions.zoneForPoint(bottom), expected); assert.deepEqual(transitions.zoneForPoint(top), expected);
      assert.deepEqual(transitions.allowedRoles(transitions.zoneForPoint(top)), transitions.allowedRoles(expected));
    }
  }
  for (let cell = 0; cell < 35; cell++) assert.deepEqual(transitions.zoneForCell(34 - cell, {...params, ownGoal: 'top'}), transitions.zoneForCell(cell, params));
  assert.equal(transitions.zoneForCell(9, params).position, 'att'); assert.equal(transitions.zoneForCell(10, params).position, 'mid');
  assert.equal(transitions.zoneForCell(24, params).position, 'mid'); assert.equal(transitions.zoneForCell(25, params).position, 'def');
});

test('valid free move retains role, resets only orientation and does not draw RNG', () => {
  const old = freeze(assignments()), before = JSON.stringify(old);
  const moved = transitions.tacticTransition({type: 'free-move', playerId: 'a', toCell: 26}, old, params, () => { throw Error('No RNG'); });
  assert.deepEqual(moved.a, {cell: 26, position: 'def', roleId: 'cover-defender', orientation: 0});
  assert.deepEqual(moved.b, old.b); assert.equal(JSON.stringify(old), before);
  assert.notEqual(moved.b, old.b);
  const dribbler = {a: {cell: 7, position: 'att', roleId: 'dribbler', orientation: -1}};
  assert.equal(transitions.tacticTransition({type: 'free-move', playerId: 'a', toCell: 0}, dribbler, params).a.roleId, 'dribbler');
  assert.deepEqual(transitions.tacticTransition({type: 'free-move', playerId: 'a', toCell: 27}, old, params), old);
});

test('invalid free-move role uses precisely one uniform draw from every eligible role', () => {
  const old = freeze({a: assignments().a});
  for (const [cell, count] of [[17, 3], [7, 4], [0, 2], [15, 1]]) {
    const eligible = transitions.allowedRoles(transitions.zoneForCell(cell, params)), histogram = {};
    assert.equal(eligible.length, count);
    for (let i = 0; i < count * 100; i++) {
      let draws = 0;
      const moved = transitions.tacticTransition({type: 'free-move', playerId: 'a', toCell: cell}, old, params, () => { draws++; return i / (count * 100); });
      assert.equal(draws, 1); assert.equal(moved.a.orientation, 0);
      histogram[moved.a.roleId] = (histogram[moved.a.roleId] || 0) + 1;
    }
    for (const role of eligible) assert.equal(histogram[role], 100);
  }
});

test('swap keeps roles and orientations at their occupied places, without random selection', () => {
  const old = freeze(assignments()), before = JSON.stringify(old);
  const swapped = transitions.tacticTransition({type: 'swap', playerId: 'a', otherPlayerId: 'c'}, old, params, () => { throw Error('No RNG'); });
  assert.deepEqual(swapped.a, old.c); assert.deepEqual(swapped.c, old.a); assert.deepEqual(swapped.b, old.b);
  assert.equal(JSON.stringify(old), before);
  const swappedBack = transitions.tacticTransition({type: 'swap', playerId: 'a', otherPlayerId: 'c'}, swapped, params);
  assert.deepEqual(swappedBack, old);
});

test('substitution inherits place/role/orientation rather than incoming profile recommendations', () => {
  const old = freeze(assignments()), before = JSON.stringify(old);
  const next = transitions.tacticTransition({type: 'substitution', outPlayerId: 'b', inPlayerId: 'new'}, old, params, () => { throw Error('No RNG'); });
  assert.ok(!Object.hasOwn(next, 'b')); assert.deepEqual(next.new, old.b);
  assert.equal(JSON.stringify(old), before);
  const keeper = transitions.tacticTransition({type: 'substitution', outPlayerId: 'k', inPlayerId: 'newKeeper'}, old, params);
  assert.deepEqual(keeper.newKeeper, old.k);
});

test('serialization and injected seeded RNG reproduce every transition', () => {
  function rng(seed) { let value = seed; return () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; }; }
  const old = {a: assignments().a};
  const action = {type: 'free-move', playerId: 'a', toCell: 7};
  assert.deepEqual(transitions.tacticTransition(action, old, params, rng(42)), transitions.tacticTransition(JSON.parse(JSON.stringify(action)), JSON.parse(JSON.stringify(old)), JSON.parse(JSON.stringify(params)), rng(42)));
  const browser = {Math: Object.create(Math)}; browser.Math.random = () => { throw Error('Unexpected global RNG'); };
  vm.createContext(browser); vm.runInContext(fs.readFileSync(path.join(__dirname, '../dist/player-tactic-transitions.js'), 'utf8'), browser);
  assert.equal(browser.D6TacticTransitions.tacticTransition(action, old, params, () => .9).a.roleId, 'dribbler');
});

test('invalid operations reject without mutating source or extending keeper editing', () => {
  const old = freeze(assignments()), before = JSON.stringify(old);
  assert.throws(() => transitions.tacticTransition({type: 'free-move', playerId: 'k', toCell: 10}, old, params), /Keepers/);
  assert.throws(() => transitions.tacticTransition({type: 'swap', playerId: 'a', otherPlayerId: 'k'}, old, params), /Keeper/);
  assert.throws(() => transitions.tacticTransition({type: 'free-move', playerId: 'a', toCell: 17}, old, params), /Occupied/);
  assert.throws(() => transitions.tacticTransition({type: 'free-move', playerId: 'a', toCell: 10}, old, params), /RNG/);
  for (const random of [-.1, 1, NaN]) assert.throws(() => transitions.tacticTransition({type: 'free-move', playerId: 'a', toCell: 10}, old, params, () => random), /RNG|rng/);
  assert.throws(() => transitions.tacticTransition({type: 'substitution', outPlayerId: 'a', inPlayerId: 'b'}, old, params), /unassigned/);
  assert.throws(() => transitions.tacticTransition({type: 'invented'}, old, params), /Unknown/);
  assert.throws(() => transitions.zoneForPoint({depth: 1.1, width: .5}), /normalized/);
  assert.throws(() => transitions.zoneForPoint({depth: .5, width: .5, keeper: 'yes'}), /boolean/);
  assert.throws(() => transitions.tacticTransition({type: 'swap', playerId: 'a', otherPlayerId: 'c'}, old), /parameters/);
  assert.equal(JSON.stringify(old), before);
});
console.log(`${groups} player tactic transition groups passed`);
