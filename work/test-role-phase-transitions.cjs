'use strict';
// Actual controller source, isolated data-only VM: no user browser/storage and no product hooks are mocked.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const roles = require('../dist/player-role-suitability.js');
const routine = require('../dist/player-position-routine.js');
const transitions = require('../dist/player-tactic-transitions.js');
const ratings = require('../dist/player-match-ratings.js');
let groups = 0;
function test(name, run) { run(); groups++; console.log('PASS ' + name); }
function read(file) { return fs.readFileSync(path.join(__dirname, '../dist', file), 'utf8'); }
const ctx = vm.createContext({structuredClone, crypto: {randomUUID: () => 'phase-test'}, D6PlayerRoles: roles, D6PositionRoutine: routine, D6TacticTransitions: transitions, D6MatchRatings: ratings, D6PlayerGeneration: {SKILL_KEYS: roles.SKILL_KEYS}, clamp: (n, lo, hi) => Math.max(lo, Math.min(hi, n))});
function load(file, source = read(file)) { vm.runInContext(source, ctx, {filename: file}); }
const foundation = read('world-foundation-v61.js');
load('world-foundation-v61.js', foundation.slice(foundation.indexOf('function v61Random('), foundation.indexOf('\nfunction ', foundation.indexOf('function v61Random(') + 1)));
load('world-match-v64.js'); load('world-player-roles-v154.js'); load('world-player-performance-v155.js');
const plan = read('world-career-plan-v64.js'); load('world-career-plan-v64.js', plan.slice(0, plan.indexOf('v61CareerTabs.splice')));
const physical = read('world-physical-v65.js'); load('world-physical-v65.js', physical.slice(physical.indexOf('function v65UndoSnapshot('), physical.indexOf('function v65SwapPositions(')));
// Only view/transport work after undo is replaced. All assignment and phase mutations above are the shipped functions.
vm.runInContext('let v65SelectedSlot=0; function v65ApplyTactics(){} function v65Snapshot(){} function v65UpdateControls(){} function draw(){} function v64UiOwnSide(){return 0;} const v63Pressing=["Ausgewogen","Früh","Abwartend"],v63Passing=["Variabel","Direkt"],v63Defense=["Neutral","Hoch","Tief"];', ctx);
function value(expression) { return vm.runInContext(expression, ctx); }
function call(name, ...args) { return ctx[name](...args); }
function player(prefix, index, position) {
  const skills = Object.fromEntries(roles.SKILL_KEYS.map(key => [key, 12]));
  return {...skills, pid: `${prefix}:${index}`, name: `${prefix} ${index}`, n: index + 1, line: position, keeper: position === 'gk', age: 20, fresh: 100, form: 0, playerModel: {roleModel: {routine: routine.createRoutine(position, [position], routine.candidateParameters)}}};
}
function setup() {
  const positions = ['gk', 'def', 'def', 'mid', 'mid', 'att', 'def', 'mid', 'att', 'def', 'mid'];
  const clubs = ['home', 'away'].map(id => ({id, name: id, roster: positions.map((position, i) => player(id, i, position))}));
  const side = club => ({clubId: club.id, starters: club.roster.slice(0, 6).map(p => p.pid), bench: club.roster.slice(6).map(p => p.pid), roles: Object.fromEntries(club.roster.slice(0, 6).map(p => [p.pid, p.line])), coachId: null, tactics: {formation: '2–2–1', pressing: 'Ausgewogen', passing: 'Variabel', defense: 'Neutral', aggression: 'Normal', focus: 'Variabel'}});
  const career = {manager: {managedClubId: 'home'}, world: {seed: 'phase-world', season: 1, coaches: [], clubs, playerFoundation: {parameterId: 'wave3-local-candidate-1', roles: {suitability: roles.candidateParameters, routine: routine.candidateParameters, transitions: transitions.candidateParameters}, ratings: ratings.candidateParameters}}};
  const fixture = {id: 'phase-fixture', homeId: 'home', awayId: 'away', plan: {home: side(clubs[0]), away: side(clubs[1])}};
  const state = call('v64MakeState', career, fixture);
  return {career, fixture, state};
}
function stepTo(c, f, state, minute) {
  state.phase = 'live';
  while (state.minute < minute) call('v64Step', c, f, state);
}
function assertExactPhases(c, f, state) {
  for (const [pid, minutes] of Object.entries(state.minutes)) {
    const phases = state.playerPerformance.phases[pid] || [];
    const sum = phases.reduce((total, phase) => total + phase.endMinute - phase.startMinute, 0);
    assert.equal(sum, minutes, `All actual minutes have exactly one role phase: ${pid}`);
    for (let i = 1; i < phases.length; i++) assert.ok(phases[i - 1].endMinute <= phases[i].startMinute, `Non-overlapping phases: ${pid}`);
    if (minutes) {
      const rated = call('v155Rated', c, f, state, pid);
      assert.equal(rated.minutes, minutes); assert.equal(rated.status, 'rated');
    }
  }
}

test('formation transitions close/open actual-source phases at the change minute on both sides', () => {
  for (const side of [0, 1]) {
    const {career, fixture, state} = setup(); stepTo(career, fixture, state, 12);
    const before = structuredClone(state.roleAssignments);
    call('v64SetFormation', career, fixture, state, side, '1–2–2');
    const changed = call('v64Active', state, side).filter(pid => before[pid].position !== state.roleAssignments[pid].position);
    assert.ok(changed.length);
    stepTo(career, fixture, state, 13); assertExactPhases(career, fixture, state);
    for (const pid of changed) {
      const last = state.playerPerformance.phases[pid].at(-1);
      assert.equal(last.startMinute, 12); assert.equal(last.endMinute, 13); assert.equal(last.position, state.roleAssignments[pid].position);
    }
  }
});

test('paused preset changes keep the new role/orientation from the exact paused minute', () => {
  const {career, fixture, state} = setup(); stepTo(career, fixture, state, 12);
  const presetState = structuredClone(state); call('v64SetFormation', career, fixture, presetState, 0, '1–2–2');
  const pid = presetState.active.find(id => presetState.roles[id] === 'mid');
  call('v154SetRole', presetState, pid, 'box-to-box'); call('v64SetOrientation', presetState, pid, 1);
  const preset = call('v140MatchPresetPlan', career, fixture, presetState, 0);
  state.phase = 'paused'; call('v140ApplyPausedPreset', career, fixture, state, preset);
  stepTo(career, fixture, state, 13); assertExactPhases(career, fixture, state);
  const last = state.playerPerformance.phases[pid].at(-1);
  assert.equal(last.startMinute, 12); assert.equal(last.roleId, 'box-to-box'); assert.equal(last.orientation, 1);
});

test('prematch replacements on both sides include their first actual minute and no unused appearance', () => {
  for (const side of [0, 1]) {
    const {career, fixture, state} = setup(), planSide = side ? fixture.plan.away : fixture.plan.home;
    const slot = planSide.starters.findIndex(pid => state.roles[pid] !== 'gk'), out = planSide.starters[slot], incoming = call('v64Bench', state, side)[0];
    call('v64SetPrematchSlot', career, fixture, state, side, slot, incoming);
    stepTo(career, fixture, state, 1); assertExactPhases(career, fixture, state);
    assert.equal(state.playerPerformance.phases[incoming][0].startMinute, 0);
    assert.equal(state.playerPerformance.phases[incoming][0].endMinute, 1);
    assert.equal(state.minutes[out], 0); assert.equal(call('v155Rated', career, fixture, state, out).status, 'no-appearance');
  }
});

test('same-minute role and orientation changes coalesce; undo restores assignment and phase ledger', () => {
  const {career, fixture, state} = setup(); stepTo(career, fixture, state, 40); state.phase = 'paused';
  const pid = state.active.find(id => state.roles[id] === 'mid'), priorAssignments = JSON.stringify(state.roleAssignments), priorPhases = JSON.stringify(state.playerPerformance.phases);
  const context = {career, fixture, state, ownSide: 0}; state.pauseUndo = call('v65UndoSnapshot', context);
  call('v154SetRole', state, pid, 'box-to-box'); call('v64SetOrientation', state, pid, 1);
  const temporary = state.playerPerformance.phases[pid].at(-1);
  assert.equal(temporary.startMinute, 40); assert.equal(temporary.endMinute, 40); assert.equal(temporary.orientation, 1);
  call('v65UndoLast', context);
  assert.equal(JSON.stringify(state.roleAssignments), priorAssignments); assert.equal(JSON.stringify(state.playerPerformance.phases), priorPhases);
  stepTo(career, fixture, state, 41); assertExactPhases(career, fixture, state);
  assert.equal(state.playerPerformance.phases[pid].at(-1).roleId, 'playmaker');
  assert.ok(!state.playerPerformance.phases[pid].some(phase => phase.roleId === 'box-to-box'));
});

test('substitutions on both sides inherit exact phases and do not collide across identical grid cells', () => {
  for (const side of [0, 1]) {
    const {career, fixture, state} = setup(); stepTo(career, fixture, state, 12);
    const outgoing = call('v64Active', state, side).find(id => state.roles[id] !== 'gk'), incoming = call('v64Bench', state, side)[0], inherited = structuredClone(state.roleAssignments[outgoing]);
    call('v64QueueSubstitution', career, fixture, state, side, outgoing, incoming); call('v64ExecutePending', career, fixture, state, 'targeted-test');
    assert.deepEqual(JSON.parse(JSON.stringify(state.roleAssignments[incoming])), JSON.parse(JSON.stringify(inherited)));
    stepTo(career, fixture, state, 13); assertExactPhases(career, fixture, state);
    assert.equal(state.minutes[outgoing], 12); assert.equal(state.minutes[incoming], 1);
    assert.equal(state.playerPerformance.phases[outgoing].at(-1).endMinute, 12);
    assert.equal(state.playerPerformance.phases[incoming][0].startMinute, 12);
    assert.equal(state.playerPerformance.phases[incoming][0].roleId, inherited.roleId);
  }
});

test('JSON checkpoint preserves exact phase boundaries and one context per actual event', () => {
  const {career, fixture, state} = setup(); stepTo(career, fixture, state, 12);
  const pid = state.active.find(id => state.roles[id] === 'mid'); call('v154SetRole', state, pid, 'box-to-box'); call('v64SetOrientation', state, pid, -1);
  const restored = JSON.parse(JSON.stringify(state)); stepTo(career, fixture, restored, 13); assertExactPhases(career, fixture, restored);
  assert.equal(restored.playerPerformance.phases[pid].at(-1).startMinute, 12);
  assert.equal(new Set(restored.playerPerformance.events.map(event => event.id)).size, restored.playerPerformance.events.length);
});
console.log(`${groups} actual-source role phase transition groups passed`);
