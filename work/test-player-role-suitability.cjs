'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const roles = require('../dist/player-role-suitability.js');
const routineModule = require('../dist/player-position-routine.js');
const params = roles.candidateParameters;
let groups = 0;
function test(name, run) { run(); groups++; console.log('PASS ' + name); }
function near(actual, expected) { assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`); }
function freeze(value) { Object.values(value).forEach(item => { if (item && typeof item === 'object') freeze(item); }); return Object.freeze(value); }
function skills(value = 12) { return Object.fromEntries(roles.SKILL_KEYS.map(key => [key, value])); }
function fullRoutine() { return {gk: 100, def: 100, mid: 100, att: 100}; }
function customParams() {
  const config = JSON.parse(JSON.stringify(params));
  config.roleWeights.playmaker = {pas: 1}; config.roleWeights['ball-winner'] = {tak: 1}; config.roleWeights['box-to-box'] = {sta: 1};
  return config;
}

test('exact thirteen-role catalog with confirmed skill keys and playable positions', () => {
  assert.equal(roles.ROLE_IDS.length, 13); assert.equal(new Set(roles.ROLE_IDS).size, 13);
  assert.equal(roles.ROLE_CATALOG.filter(role => role.positions.includes('gk')).length, 2);
  for (const role of roles.ROLE_CATALOG) {
    assert.deepEqual(Object.keys(params.roleWeights[role.id]).sort(), role.importantSkills.slice().sort());
    assert.equal(Object.values(params.roleWeights[role.id]).reduce((a, b) => a + b, 0), 100);
    assert.ok(role.importantSkills.every(key => roles.SKILL_KEYS.includes(key)));
  }
  assert.deepEqual(roles.ROLE_CATALOG.find(role => role.id === 'winger').positions, ['mid', 'att']);
  assert.ok(roles.ROLE_CATALOG.find(role => role.id === 'striker').importantSkills.includes('ant'));
});

test('suitability takes the actual position routine scalar and stays 1–20', () => {
  const base = freeze(skills()), before = JSON.stringify(base);
  for (const roleId of roles.ROLE_IDS) {
    near(roles.roleSuitability(base, 100, roleId, params), 12);
    near(roles.roleSuitability(base, 25, roleId, params), 10.2);
    near(roles.roleSuitability(base, 0, roleId, params), 9.6);
    assert.equal(roles.roleSuitability(skills(1), 0, roleId, params), 1);
    assert.equal(roles.roleSuitability(skills(20), 100, roleId, params), 20);
  }
  assert.equal(JSON.stringify(base), before);
  near(roles.roleSuitability(base, 0, 'ball-winner', params), 9.6);
});

test('permanent relevant skills affect suitability; form/freshness/talent do not', () => {
  const base = skills(), changed = {...base, fin: 20};
  assert.ok(roles.roleSuitability(changed, 100, 'poacher', params) > roles.roleSuitability(base, 100, 'poacher', params));
  near(roles.roleSuitability(changed, 100, 'playmaker', params), roles.roleSuitability(base, 100, 'playmaker', params));
  for (const extra of [{form: 2, fresh: 100, talent: 22}, {form: -2, fresh: 0, talent: 10}]) {
    near(roles.roleSuitability({...base, ...extra}, 100, 'playmaker', params), 12);
  }
});

test('generation recommendations are coherent, fixed, at most three and keeper-only', () => {
  for (const playable of [['gk'], ['def'], ['mid'], ['att'], ['def', 'mid'], ['mid', 'att']]) {
    const snapshot = freeze({mainPosition: playable[0], playablePositions: playable, skills: skills(), routine: routineModule.createRoutine(playable[0], playable, routineModule.candidateParameters)});
    const before = JSON.stringify(snapshot), recommendations = roles.recommendRoles(snapshot, params);
    assert.ok(recommendations.length >= 1 && recommendations.length <= 3);
    assert.equal(new Set(recommendations.map(entry => `${entry.position}:${entry.roleId}`)).size, recommendations.length);
    assert.ok(recommendations.every(entry => playable.includes(entry.position) && roles.ROLE_CATALOG.find(role => role.id === entry.roleId).positions.includes(entry.position)));
    assert.ok(recommendations.every(entry => Object.keys(entry).sort().join(',') === 'position,roleId'));
    if (playable[0] === 'gk') assert.deepEqual(recommendations, [{position: 'gk', roleId: 'line-keeper'}, {position: 'gk', roleId: 'sweeper-keeper'}]);
    assert.equal(JSON.stringify(snapshot), before);
  }
});

test('recommendation ranking responds to a coherent ability profile', () => {
  const technical = {...skills(5), pas: 18, tec: 18, ant: 15, dec: 15, calm: 15, pos: 15};
  const defensive = {...skills(5), tak: 19, pos: 17, ant: 17, dec: 14, str: 18, sta: 15};
  const a = roles.recommendRoles({mainPosition: 'mid', playablePositions: ['mid'], skills: technical, routine: fullRoutine()}, params);
  const b = roles.recommendRoles({mainPosition: 'mid', playablePositions: ['mid'], skills: defensive, routine: fullRoutine()}, params);
  assert.equal(a[0].roleId, 'playmaker'); assert.equal(b[0].roleId, 'ball-winner');
});

test('highlight hysteresis keeps a near tie and switches only beyond the explicit margin', () => {
  const recommendations = freeze([{position: 'mid', roleId: 'playmaker'}, {position: 'mid', roleId: 'ball-winner'}]);
  const previous = freeze({position: 'mid', roleId: 'ball-winner'}), config = customParams();
  assert.deepEqual(roles.bestRecommendedRole(recommendations, null, skills(), fullRoutine(), config), {position: 'mid', roleId: 'playmaker'});
  assert.deepEqual(roles.bestRecommendedRole(recommendations, previous, skills(), fullRoutine(), config), previous);
  assert.deepEqual(roles.bestRecommendedRole(recommendations, previous, {...skills(), pas: 12.34}, fullRoutine(), config), previous);
  assert.deepEqual(roles.bestRecommendedRole(recommendations, previous, {...skills(), pas: 12.36}, fullRoutine(), config), {position: 'mid', roleId: 'playmaker'});
  assert.deepEqual(roles.bestRecommendedRole(recommendations, {position: 'att', roleId: 'poacher'}, skills(), fullRoutine(), config), {position: 'mid', roleId: 'playmaker'});
  assert.equal(roles.bestRecommendedRole([], null, skills(), fullRoutine(), config), null);
});

test('best-highlight recomputation never adds recommendations or foreign profile positions', () => {
  const fixed = freeze([{position: 'mid', roleId: 'playmaker'}, {position: 'att', roleId: 'winger'}]);
  const before = JSON.stringify(fixed), routine = {gk: 0, def: 100, mid: 25, att: 100};
  const best = roles.bestRecommendedRole(fixed, null, skills(), routine, params);
  assert.deepEqual(best, {position: 'att', roleId: 'winger'});
  assert.equal(JSON.stringify(fixed), before);
  assert.ok(fixed.some(entry => entry.position === best.position && entry.roleId === best.roleId));
  assert.deepEqual(Object.keys(best).sort(), ['position', 'roleId']);
});

test('explicit first tie order is reproducible after save/load and never draws random', () => {
  const config = JSON.parse(JSON.stringify(params)); config.firstTieRoleOrder.reverse();
  const snapshot = {mainPosition: 'att', playablePositions: ['att'], skills: skills(), routine: fullRoutine()};
  assert.equal(roles.recommendRoles(snapshot, config)[0].roleId, 'dribbler');
  assert.deepEqual(roles.recommendRoles(JSON.parse(JSON.stringify(snapshot)), JSON.parse(JSON.stringify(config))), roles.recommendRoles(snapshot, config));
  const browser = {Math: Object.create(Math)}; browser.Math.random = () => { throw Error('Unexpected RNG'); };
  vm.createContext(browser); vm.runInContext(fs.readFileSync(path.join(__dirname, '../dist/player-role-suitability.js'), 'utf8'), browser);
  assert.equal(browser.D6PlayerRoles.recommendRoles(snapshot, config)[0].roleId, 'dribbler');
});

test('invalid or missing approvals, routine, roles and profile positions cannot choose defaults', () => {
  assert.throws(() => roles.roleSuitability(skills(), 100, 'playmaker'), /parameters/);
  assert.throws(() => roles.roleSuitability(skills(), 101, 'playmaker', params), /cap/);
  assert.throws(() => roles.roleSuitability(skills(), {}, 'playmaker', params), /finite/);
  assert.throws(() => roles.roleSuitability(skills(), 100, 'invented', params), /Unknown role/);
  assert.throws(() => roles.roleSuitability({...skills(), pas: NaN}, 100, 'playmaker', params), /finite/);
  assert.throws(() => roles.roleSuitability(skills(), 100, 'playmaker', {...params, routineWeight: -1}), /routineWeight/);
  assert.throws(() => roles.roleSuitability(skills(), 100, 'playmaker', {...params, firstTieRoleOrder: []}), /firstTie/);
  const config = JSON.parse(JSON.stringify(params)); config.roleWeights.playmaker = {gk: 100};
  assert.throws(() => roles.roleSuitability(skills(), 100, 'playmaker', config), /confirmed relevant/);
  assert.throws(() => roles.recommendRoles({mainPosition: 'gk', playablePositions: ['gk', 'att'], skills: skills(), routine: fullRoutine()}, params), /Keeper/);
  assert.throws(() => roles.recommendRoles({mainPosition: 'mid', playablePositions: ['att'], skills: skills(), routine: fullRoutine()}, params), /mainPosition/);
  assert.throws(() => roles.bestRecommendedRole([{position: 'att', roleId: 'playmaker'}], null, skills(), fullRoutine(), params), /position/);
});
console.log(`${groups} player role suitability groups passed`);
