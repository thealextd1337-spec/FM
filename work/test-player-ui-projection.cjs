'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ui = require('../dist/player-tactics-ui.js');
const source = fs.readFileSync(path.join(__dirname, '../dist/player-tactics-ui.js'), 'utf8');
let groups = 0;
function test(name, run) { run(); groups++; console.log('PASS ' + name); }
function freeze(value) { Object.values(value).forEach(item => { if (item && typeof item === 'object') freeze(item); }); return Object.freeze(value); }
const labelsDE = freeze({roles: 'Empfohlene Rollen', role: 'Rolle', orientation: 'Individuelle Ausrichtung', defensive: 'Defensiv', neutral: 'Neutral', offensive: 'Offensiv', importantSkills: 'Wichtige Fähigkeiten', suitability: 'Eignung', best: 'Beste Eignung', zone: 'Ungefähre Wirkungszone', zoneHint: 'Bewegung bleibt situationsabhängig.', empty: 'Noch nicht bewertet', skillHint: 'Wichtig für diese Rolle', positions: {gk: 'Torwart', def: 'Abwehr', mid: 'Mittelfeld', att: 'Angriff'}});
const labelsEN = freeze({roles: 'Recommended roles', role: 'Role', orientation: 'Individual orientation', defensive: 'Defensive', neutral: 'Neutral', offensive: 'Offensive', importantSkills: 'Important abilities', suitability: 'Suitability', best: 'Best suitability', zone: 'Approximate area of influence', zoneHint: 'Movement adapts to the situation.', empty: 'Not rated yet', skillHint: 'Important for this role', positions: {gk: 'Goalkeeper', def: 'Defence', mid: 'Midfield', att: 'Attack'}});
function projection() {
  return {pid: 'player-7', name: 'Tim Schäfer', skills: [{key: 'pas', label: 'Passspiel', band: 'orange', colorLabel: 'Orange', important: true}, {key: 'fin', label: 'Abschluss', band: 'pink', colorLabel: 'Pink', important: false}], recommendations: [{position: 'att', roleId: 'poacher', label: 'Torjäger', band: 'pink', colorLabel: 'Pink', best: true}, {position: 'mid', roleId: 'playmaker', label: 'Spielmacher', band: 'orange', colorLabel: 'Orange', best: false}], assignment: {position: 'mid', roleId: 'playmaker', label: 'Spielmacher', orientation: 0}, allowedRoles: [{id: 'playmaker', label: 'Spielmacher', band: 'orange', colorLabel: 'Orange'}, {id: 'ball-winner', label: 'Abräumer', band: 'bluegray', colorLabel: 'Blaugrau'}, {id: 'box-to-box', label: 'Box-to-Box', band: 'yellow', colorLabel: 'Gelb'}], zone: {x: .2, y: .3, width: .6, height: .4}};
}

test('every renderer reads an allowlist and excludes hidden raw values even in ARIA/title', () => {
  const input = projection(), secret = '9137.246801';
  input.talent = secret; input.caps = {pas: secret}; input.routine = secret; input.suitability = secret; input.rawSkills = {fin: secret}; input.playerModel = {secret};
  input.assignment.score = secret; input.assignment.routine = secret;
  input.skills.forEach(entry => { entry.value = secret; entry.cap = secret; });
  input.allowedRoles.forEach(entry => { entry.score = secret; entry.talent = secret; });
  input.recommendations.forEach(entry => { entry.suitability = secret; entry.raw = secret; });
  input.zone.talent = secret;
  const output = [ui.renderProfileRoles(input, labelsDE), ui.renderTacticRoleControl(input, labelsDE), ui.renderRoleZone(input.zone, labelsDE), ui.renderPitchRole(input, labelsDE)].join('');
  assert.ok(!output.includes(secret)); assert.ok(!output.includes('talent')); assert.ok(!output.includes('routine')); assert.ok(!output.includes('score='));
  const invalidColor = projection(); invalidColor.skills[0].colorLabel = secret; invalidColor.allowedRoles[0].colorLabel = secret; invalidColor.recommendations[0].colorLabel = secret;
  assert.ok(![ui.renderProfileRoles(invalidColor, labelsDE), ui.renderTacticRoleControl(invalidColor, labelsDE), ui.renderPitchRole(invalidColor, labelsDE)].join('').includes(secret));
});

test('profile recommendations stay fixed and grouped by their playable position with best highlight', () => {
  const input = freeze(projection()), before = JSON.stringify(input), html = ui.renderProfileRoles(input, labelsDE);
  assert.ok(html.includes('<h4>Mittelfeld</h4>')); assert.ok(html.includes('<h4>Angriff</h4>'));
  assert.equal((html.match(/class="d6-profile-role(?: is-best)?"/g) || []).length, 2);
  assert.equal((html.match(/class="d6-role-best"/g) || []).length, 1);
  assert.ok(html.includes('Beste Eignung')); assert.ok(!html.includes('Abräumer'));
  assert.equal(JSON.stringify(input), before);
});

test('all valid zone roles remain selectable independently of profile recommendation or low suitability', () => {
  const input = projection(); input.recommendations = [input.recommendations[0]];
  const html = ui.renderTacticRoleControl(input, labelsDE);
  for (const id of ['playmaker', 'ball-winner', 'box-to-box']) assert.ok(html.includes(`value="${id}"`));
  assert.ok(html.includes('data-d6-role="player-7"'));
  assert.ok(html.includes('value="playmaker" selected')); assert.ok(html.includes('Abräumer · Blaugrau'));
  assert.ok(!html.includes('value="poacher"'));
  assert.equal((html.match(/data-v64-orientation=/g) || []).length, 3);
  assert.ok(html.includes('data-v64-orientation="0" data-d6-orientation-player="player-7" aria-pressed="true"'));
});

test('keeper role selection has two real options and no orientation editor', () => {
  const input = projection(); input.assignment = {position: 'gk', roleId: 'sweeper-keeper', label: 'Mitspielender Tormann', orientation: 0};
  input.allowedRoles = [{id: 'line-keeper', label: 'Linientormann', band: 'orange', colorLabel: 'Orange'}, {id: 'sweeper-keeper', label: 'Mitspielender Tormann', band: 'yellow', colorLabel: 'Gelb'}];
  const html = ui.renderTacticRoleControl(input, labelsDE);
  assert.ok(html.includes('value="line-keeper"')); assert.ok(html.includes('value="sweeper-keeper" selected'));
  assert.ok(!html.includes('data-v64-orientation')); assert.ok(!html.includes('<fieldset'));
});

test('important abilities retain actual skill bands and the existing Flutlicht component contract', () => {
  const received = [], browser = {D6Flutlicht: {components: {skill: input => { received.push(input); return `<span class="fl-skill fl-band-${input.band}">${input.label}</span>`; }}}};
  vm.createContext(browser); vm.runInContext(source, browser);
  const input = projection(); input.skills[0].value = 17.891; input.skills[0].talent = 22;
  const html = browser.D6PlayerTacticsUI.renderTacticRoleControl(input, labelsDE);
  assert.equal(received.length, 1); assert.deepEqual(Object.keys(received[0]).sort(), ['band', 'colorLabel', 'label']);
  assert.equal(received[0].band, 'orange'); assert.ok(html.includes('fl-band-orange')); assert.ok(html.includes('Wichtig für diese Rolle'));
  assert.ok(html.includes('d6-role-important-icon')); assert.ok(!html.includes('17.891')); assert.ok(!html.includes('Abschluss'));
});

test('localized DE/EN controls, positions, color names and long role labels pass through safely', () => {
  const input = projection(); input.name = 'Alex'; input.skills[0].label = 'Passing';
  input.recommendations = [{position: 'def', roleId: 'ball-playing-defender', label: 'Ball-playing defender', band: 'bluegray', colorLabel: 'Blue grey', best: true}];
  input.assignment = {position: 'def', roleId: 'ball-playing-defender', label: 'Ball-playing defender', orientation: -1};
  input.allowedRoles = [{id: 'ball-playing-defender', label: 'Ball-playing defender', band: 'bluegray', colorLabel: 'Blue grey'}];
  const profile = ui.renderProfileRoles(input, labelsEN), control = ui.renderTacticRoleControl(input, labelsEN), token = ui.renderPitchRole(input, labelsEN);
  for (const word of ['Recommended roles', 'Defence', 'Best suitability', 'Blue grey']) assert.ok(profile.includes(word));
  for (const word of ['Individual orientation', 'Defensive', 'Neutral', 'Offensive', 'Ball-playing defender · Blue grey']) assert.ok(control.includes(word));
  assert.ok(token.includes('Role: Ball-playing defender. Suitability: Blue grey'));
  assert.ok(ui.renderRoleZone(input.zone, labelsEN).includes('Approximate area of influence'));
});

test('one approximate zone geometry is bounded, omits routes and exposes no exact limits in text', () => {
  const html = ui.renderRoleZone({x: .123456, y: .234567, width: .9, height: .9, rawRoute: 'SECRET_ROUTE'}, labelsDE);
  assert.equal((html.match(/<rect /g) || []).length, 1); assert.ok(!html.includes('<path')); assert.ok(!html.includes('SECRET_ROUTE'));
  assert.ok(html.includes('x="12" y="23" width="88" height="77"')); assert.ok(!html.includes('123456'));
  const accessibilityText = html.match(/aria-label="([^"]+)"/)[1]; assert.ok(!/\d/.test(accessibilityText));
  for (const invalid of [{x: -1, y: 0, width: .5, height: .5}, {x: .5, y: .5, width: NaN, height: .5}, {x: .5, y: .5, width: .5, height: 0}]) assert.equal(ui.renderRoleZone(invalid, labelsDE), '');
});

test('pitch role shows the actual chosen role above a token with only a band dot and safe tooltip', () => {
  const input = projection(), html = ui.renderPitchRole(input, labelsDE);
  assert.ok(html.includes('d6-pitch-role fl-band-orange')); assert.ok(html.includes('<span>Spielmacher</span>'));
  assert.ok(html.includes('Rolle: Spielmacher. Eignung: Orange')); assert.ok(!html.includes('Torjäger'));
  assert.equal(ui.renderPitchRole({...input, assignment: {roleId: 'invented'}}, labelsDE), '');
});

test('malformed input is empty/disabled and never introduces arbitrary classes or unsupported roles', () => {
  const input = projection(); input.allowedRoles = [{id: 'javascript:secret', label: 'Fake', band: 'pink'}, {...input.allowedRoles[0], band: 'secret-color'}]; input.skills.push({key: 'talent', label: 'Hidden', band: 'pink', important: true});
  const html = ui.renderTacticRoleControl(input, labelsDE);
  assert.ok(!html.includes('javascript:secret')); assert.ok(!html.includes('secret-color')); assert.ok(!html.includes('Hidden'));
  assert.ok(html.includes('fl-band-unknown'));
  assert.ok(ui.renderTacticRoleControl({}, labelsDE).includes(' disabled'));
  assert.ok(ui.renderProfileRoles({}, labelsDE).includes('d6-role-empty'));
});

test('text and identity escaping prevents executable markup and keeps inputs unchanged', () => {
  const input = projection(); input.pid = '\"><img src=x onerror=alert(1)>'; input.name = '<script>alert(1)</script>'; input.assignment.label = '<svg onload=alert(2)>'; input.allowedRoles[0].label = '<button onclick=alert(3)>'; input.skills[0].label = '<img src=x>';
  freeze(input); const before = JSON.stringify(input), html = ui.renderTacticRoleControl(input, labelsDE) + ui.renderPitchRole(input, labelsDE);
  assert.ok(!html.includes('<script>')); assert.ok(!html.includes('<img ')); assert.ok(!html.includes('<svg onload')); assert.ok(!html.includes('<button onclick'));
  assert.ok(html.includes('&lt;script&gt;')); assert.ok(html.includes('&quot;&gt;&lt;img'));
  assert.equal(JSON.stringify(input), before);
});

test('renderers have no storage, DOM, simulation, clock or random dependencies', () => {
  const browser = {Math: Object.create(Math), Date: class { constructor() { throw Error('No wall clock'); } }};
  browser.Math.random = () => { throw Error('No RNG'); };
  for (const name of ['document', 'localStorage', 'sessionStorage', 'career', 'match']) Object.defineProperty(browser, name, {get() { throw Error('No ' + name); }});
  vm.createContext(browser); vm.runInContext(source, browser);
  const input = freeze(projection()), before = JSON.stringify(input);
  for (const name of ['renderProfileRoles', 'renderTacticRoleControl', 'renderPitchRole']) assert.ok(browser.D6PlayerTacticsUI[name](input, labelsDE));
  assert.ok(browser.D6PlayerTacticsUI.renderRoleZone(input.zone, labelsDE));
  assert.equal(JSON.stringify(input), before);
});
console.log(`${groups} player UI projection groups passed`);
