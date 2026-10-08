'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ratings = require('../dist/player-match-ratings.js');
const development = require('../dist/player-development.js');
const params = ratings.candidateParameters;
const scenes = require('./player-next/ratings/scenarios.json').scenarios;
let checks = 0;
function test(name, body) { body(); checks++; console.log('PASS ' + name); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function close(actual, expected, epsilon = 1e-11) { assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} != ${expected}`); }
function phase(roleId = 'playmaker', position = 'mid', startMinute = 0, endMinute = 90, orientation = 0) { return { startMinute, endMinute, position, roleId, orientation }; }
function appearance(events = [], overrides = {}) {
  return { playerId: 'p1', fixtureId: 'f1', worldId: 'w1', seasonId: 1, virtualMinutes: 90, rolePositionPhases: [phase()], actualEvents: events, ...overrides };
}
function event(id, type = 'pass', minute = 10, context = {}, success = true) { return { id, playerId: 'p1', minute, type, success, context }; }
function rate(input, p = params) { return ratings.rateAppearance(input, p); }
function scene(name) { return rate(scenes.find(s => s.name === name).input); }
function freeze(value) { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }

test('explicit JSON-safe candidate parameters and UMD export', () => {
  assert.throws(() => ratings.rateAppearance(appearance(), undefined), TypeError);
  assert.throws(() => ratings.rateAppearance(appearance()), TypeError);
  assert.deepEqual(rate(appearance(), clone(params)), rate(appearance()));
  const sandbox = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../dist/player-match-ratings.js'), 'utf8'), sandbox);
  assert.equal(sandbox.D6MatchRatings.candidateParameters.id, params.id);
  assert.equal(sandbox.D6MatchRatings.rateAppearance(clone(appearance()), clone(params)).rating, 6);
  assert.equal(ratings.ROLE_IDS.length, 13);
});

test('no appearance has no rating or learning allocation', () => {
  const result = rate(appearance([], { virtualMinutes: 0, rolePositionPhases: [] }));
  assert.equal(result.status, 'no-appearance');
  assert.equal(result.rating, null);
  assert.equal(result.visibleRating, null);
  assert.deepEqual(result.skillWeights, {});
});

test('1, 5 and 19 minutes retain internal notes; 20 minutes makes the same note visible', () => {
  [1, 5, 19, 20].forEach(minutes => {
    const result = rate(appearance([event('late', 'support-run', 90 - minutes / 2, { difficulty: 0.6, usefulness: 0.9, pressure: 0.4 })], {
      virtualMinutes: minutes, rolePositionPhases: [phase('striker', 'att', 90 - minutes, 90)]
    }));
    assert.ok(result.rating > 6 && result.rating < 10);
    assert.equal(result.minutes, minutes);
    assert.equal(result.visibleRating, minutes >= 20 ? result.rating : null);
    close(result.contributions.capturedPhaseMinutes, minutes);
  });
});

test('quiet keeper has a conservative baseline, not an automatic top rating', () => {
  const result = scene('quiet-keeper');
  close(result.rating, 6);
  assert.equal(result.contributions.observedEvents, 0);
  assert.ok(result.skillWeights.gk > 0);
});

test('hard actual saves exceed a quiet keeper while own errors are individually penalized', () => {
  assert.ok(scene('difficult-saves').rating > 7.5);
  assert.ok(scene('keeper-own-error').rating < 5.5);
  const unassignedError = clone(scenes.find(s => s.name === 'keeper-own-error').input);
  unassignedError.actualEvents[0].context.errorAttribution = false;
  close(rate(unassignedError).rating, 6);
});

test('an unsuccessful save is not automatically a goalkeeper error', () => {
  const result = rate(appearance([event('unsaved', 'save', 20, {}, false)], { rolePositionPhases: [phase('line-keeper', 'gk')] }));
  close(result.rating, 6);
  assert.equal(result.contributions.events[0].penalty, 0);
});

test('useful decisions and failed execution are represented separately', () => {
  const result = scene('useful-failed-pass');
  assert.ok(result.rating > 6);
  assert.ok(result.contributions.events[0].decision > 0);
  assert.equal(result.contributions.events[0].outcome, 0);
  const wrongExecution = clone(scenes.find(s => s.name === 'useful-failed-pass').input);
  wrongExecution.actualEvents[0].context.errorAttribution = true;
  assert.ok(rate(wrongExecution).rating < result.rating);
  assert.ok(rate(wrongExecution).contributions.events[0].penalty > 0);
});

test('many safe passes cannot farm an elite rating, even with different IDs and repeat keys', () => {
  const safe = Array.from({ length: 2000 }, (_, i) => event('safe-' + i, 'pass', (i + 1) / 23, { difficulty: 0, usefulness: 0, pressure: 0, repeatKey: 'option-' + i }));
  const safeResult = rate(appearance(safe));
  assert.ok(safeResult.rating <= 6.15 + 1e-11);
  const useful = [10, 30, 55].map((minute, i) => event('useful-' + i, 'pass', minute, { difficulty: 0.8, usefulness: 0.95, pressure: 0.7, progressMetres: 15 }));
  assert.ok(rate(appearance(useful)).rating > safeResult.rating + 0.5);
});

test('semantic repeat saturation is local to its actual five-minute passage', () => {
  const first = event('first', 'pass', 10, { difficulty: 0.6, usefulness: 0.6, repeatKey: 'lane-a' });
  const repeated = event('second', 'pass', 11, { difficulty: 0.6, usefulness: 0.6, repeatKey: 'lane-a' });
  const renewed = event('third', 'pass', 20, { difficulty: 0.6, usefulness: 0.6, repeatKey: 'lane-a' });
  const result = rate(appearance([first, repeated, renewed]));
  assert.deepEqual(result.contributions.events.map(e => e.repeatFactor), [1, params.repeatDecay, 1]);
});

test('actual off-ball work contributes; missing observed usefulness never grants run/cover credit', () => {
  assert.ok(scene('observed-cover').rating > 6.5);
  const planned = rate(appearance([event('plan', 'support-run', 10, { difficulty: 0.9, pressure: 1 })]));
  close(planned.rating, 6);
  assert.equal(planned.contributions.events[0].positive, 0);
  const actual = rate(appearance([event('observed', 'support-run', 10, { difficulty: 0.9, usefulness: 0.9, pressure: 1 })]));
  assert.ok(actual.rating > planned.rating);
});

test('role change and exact phase boundary use the actual role at the event', () => {
  const result = scene('role-change');
  assert.deepEqual(result.contributions.events.map(e => e.roleId), ['playmaker', 'poacher']);
  assert.deepEqual(result.contributions.phases.map(p => p.minutes), [45, 45]);
  assert.deepEqual(result.contributions.phases.map(p => p.events), [1, 1]);
  assert.ok(result.skillWeights.pas > 0 && result.skillWeights.fin > 0);
});

test('phase exposure is minute weighted and does not grant a performance bonus', () => {
  const phases = [phase('playmaker', 'mid', 0, 30), phase('poacher', 'att', 30, 90)];
  const result = rate(appearance([], { rolePositionPhases: phases }));
  close(result.rating, 6);
  close(result.skillWeights.pas, (params.roleSkillWeights.playmaker.pas / 11) / 3);
  close(result.skillWeights.fin, (params.roleSkillWeights.poacher.fin / 11) * 2 / 3);
});

test('orientation changes only task emphasis, without changing base skills or quiet rating', () => {
  const cover = event('cover', 'cover', 20, { difficulty: 0.7, usefulness: 0.9, pressure: 0.5 });
  const defensive = rate(appearance([cover], { rolePositionPhases: [phase('ball-winner', 'mid', 0, 90, -1)] }));
  const offensive = rate(appearance([cover], { rolePositionPhases: [phase('ball-winner', 'mid', 0, 90, 1)] }));
  assert.ok(defensive.rating > offensive.rating);
  close(rate(appearance([], { rolePositionPhases: [phase('playmaker', 'mid', 0, 90, 1)] })).rating, 6);
});

test('event replay and JSON round trip preserve unique contributions and allocations', () => {
  const input = clone(scenes.find(s => s.name === 'observed-cover').input);
  const expected = rate(input);
  input.actualEvents = input.actualEvents.concat(clone(input.actualEvents), clone(input.actualEvents));
  const repeated = rate(input);
  close(repeated.rating, expected.rating);
  assert.deepEqual(repeated.skillWeights, expected.skillWeights);
  assert.equal(repeated.contributions.observedEvents, 3);
  assert.equal(repeated.contributions.ignoredEvents.duplicate, 6);
  assert.deepEqual(rate(clone(input)), repeated);
});

test('conflicting duplicate IDs are rejected instead of choosing a replay-dependent result', () => {
  assert.throws(() => rate(appearance([event('same', 'pass', 10, { usefulness: 1 }), event('same', 'pass', 10, { usefulness: 0 })])), /Conflicting/);
});

test('input order and unrelated presentation or generation metadata cannot change the note', () => {
  const input = clone(scenes.find(s => s.name === 'observed-cover').input), expected = rate(input);
  input.actualEvents.reverse();
  input.talent = 22; input.skills = { tak: 20 }; input.caps = { tak: 20 }; input.form = 1; input.freshness = 100;
  input.teamResult = '9:0'; input.view = '3d'; input.playbackSpeed = 8; input.routine = 100;
  assert.deepEqual(rate(input), expected);
  input.talent = 10; input.teamResult = '0:9'; input.view = '2d'; input.playbackSpeed = 0.5;
  assert.deepEqual(rate(input), expected);
});

test('events of another player and events outside actual appearance phases are ignored', () => {
  const input = appearance([event('before', 'shot', 10, { usefulness: 1 }), { ...event('other', 'shot', 82, { usefulness: 1 }), playerId: 'p2' }], {
    virtualMinutes: 15, rolePositionPhases: [phase('striker', 'att', 75, 90)]
  });
  const result = rate(input);
  close(result.rating, 6);
  assert.deepEqual(result.contributions.ignoredEvents, { foreign: 1, outsidePhases: 1, duplicate: 0 });
});

test('missing data stays exposed; no future or prior fixture reconstruction occurs', () => {
  const result = rate(appearance([event('missing')]));
  assert.equal(result.contributions.missingContextEvents, 1);
  assert.deepEqual(result.contributions.events[0].missingContext, ['difficulty', 'usefulness', 'pressure']);
  assert.ok(result.rating < 6.1);
  const partial = rate(appearance([], { rolePositionPhases: [phase('playmaker', 'mid', 30, 90)] }));
  close(partial.contributions.missingPhaseMinutes, 30);
  const absent = rate(appearance([], { rolePositionPhases: [] }));
  assert.deepEqual(absent.skillWeights, {});
  close(absent.contributions.missingPhaseMinutes, 90);
});

test('inputs and parameters remain immutable; no storage, RNG, or wall clock required', () => {
  const input = freeze(clone(scenes.find(s => s.name === 'difficult-saves').input));
  const before = JSON.stringify(input), beforeParams = JSON.stringify(params);
  const result = rate(input);
  assert.equal(JSON.stringify(input), before);
  assert.equal(JSON.stringify(params), beforeParams);
  assert.notEqual(result.contributions.phases[0], input.rolePositionPhases[0]);
  assert.ok(Object.values(result.skillWeights).every(w => Number.isFinite(w) && w > 0));
  close(Object.values(result.skillWeights).reduce((sum, w) => sum + w, 0), 1);
});

test('invalid context, overlapping phases, excess minutes and hidden skill keys are rejected', () => {
  assert.throws(() => rate(appearance([event('bad', 'pass', 2, { usefulness: 2 })])), TypeError);
  assert.throws(() => rate(appearance([], { virtualMinutes: 19 })), /exceeds/);
  assert.throws(() => rate(appearance([], { rolePositionPhases: [phase(), phase('striker', 'att', 40, 90)] })), /overlap/);
  assert.throws(() => rate(appearance([], { rolePositionPhases: [phase('striker', 'gk')] })), /Keeper/);
  const wrong = clone(params); wrong.eventSkillWeights.pass.talent = 1;
  assert.throws(() => rate(appearance(), wrong), /Unknown skill/);
});

test('bounded rating range survives extreme good and bad event streams', () => {
  const good = Array.from({ length: 500 }, (_, i) => event('good-' + i, ratings.EVENT_TYPES[i % 9], i / 6, { difficulty: 1, usefulness: 1, pressure: 1, repeatKey: 'unique-' + i }));
  const bad = Array.from({ length: 500 }, (_, i) => event('bad-' + i, 'error', i / 6, { difficulty: 0, usefulness: 1, pressure: 0, errorAttribution: true }, false));
  assert.ok(rate(appearance(good)).rating <= 9.5);
  close(rate(appearance(bad)).rating, 1);
});

test('P06 rated appearance feeds P03 exactly once, including a real short internal score', () => {
  const input = appearance([event('shot', 'shot', 85, { difficulty: 0.8, usefulness: 1, pressure: 0.5 })], { virtualMinutes: 10, rolePositionPhases: [phase('poacher', 'att', 80, 90)] });
  const rated = rate(input);
  const all = Object.fromEntries(ratings.SKILL_KEYS.map(key => [key, 10]));
  const player = { id: 'p1', age: 19, talent: 19, skills: all, caps: Object.fromEntries(ratings.SKILL_KEYS.map(key => [key, 20])) };
  const result = development.developmentDelta(player, development.createLedger('p1', 'w1', 1), rated, rated.skillWeights);
  assert.equal(rated.visibleRating, null);
  assert.equal(result.status, 'applied');
  assert.equal(result.nextLedger.seasonMinutes, 10);
  close(Object.values(result.skillDelta).reduce((sum, v) => sum + v, 0), 0.5 * 10 / 90);
  const updated = { ...player, skills: Object.fromEntries(ratings.SKILL_KEYS.map(key => [key, player.skills[key] + result.skillDelta[key]])) };
  assert.equal(development.developmentDelta(updated, result.nextLedger, rated, rated.skillWeights).status, 'duplicate');
});

test('actual rated weak short appearances preserve the P03 90-minute protection and recovery break', () => {
  let player = { id: 'p1', age: 19, talent: 19, skills: Object.fromEntries(ratings.SKILL_KEYS.map(key => [key, 10])), caps: Object.fromEntries(ratings.SKILL_KEYS.map(key => [key, 20])) };
  let ledger = development.createLedger('p1', 'w1', 1);
  [19, 19, 19, 34].forEach((minutes, i) => {
    const input = appearance([event('failure-' + i, 'error', 89, { difficulty: 0, usefulness: 1, pressure: 0, errorAttribution: true }, false)], {
      fixtureId: 'weak-' + i, virtualMinutes: minutes, rolePositionPhases: [phase('playmaker', 'mid', 90 - minutes, 90)]
    });
    const rated = rate(input), result = development.developmentDelta(player, ledger, rated, rated.skillWeights);
    assert.ok(rated.rating < 5.5);
    if (i < 3) assert.equal(result.status, 'no-change');
    else { assert.equal(result.status, 'applied'); close(Object.values(result.skillDelta).reduce((sum, v) => sum + v, 0), -0.1 * minutes / 90); }
    player = { ...player, skills: Object.fromEntries(ratings.SKILL_KEYS.map(key => [key, player.skills[key] + result.skillDelta[key]])) };
    ledger = result.nextLedger;
  });
  assert.equal(ledger.seasonMinutes, 91);
  const recovered = rate(appearance([event('actual-shot', 'shot', 89.5, { difficulty: 0.9, usefulness: 1, pressure: 0.5 })], {
    fixtureId: 'recovery', virtualMinutes: 1, rolePositionPhases: [phase('poacher', 'att', 89, 90)]
  }));
  assert.ok(recovered.rating >= 5.5);
  const result = development.developmentDelta(player, ledger, recovered, recovered.skillWeights);
  assert.equal(result.nextLedger.weakSeriesMinutes, 0);
  assert.equal(result.nextLedger.seasonMinutes, 92);
});

console.log(JSON.stringify({ status: 'passed', checks, scenarios: scenes.length, parameterId: params.id }));
