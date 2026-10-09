'use strict';
// Focused real-source decisions/geometry in an isolated VM; no user browser or storage.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = file => fs.readFileSync(path.join(__dirname, '../dist', file), 'utf8');
const pitch = read('pitch-v55.js'), game = read('game.js'), positioning = read('world-backpedal-v108.js'), space = read('world-space-passes-v150.js');
function fn(source, name) {
  const start = source.indexOf('function ' + name + '(');
  assert.ok(start >= 0, 'Actual source function exists: ' + name);
  let depth = 0, began = false, quote = null, escaped = false;
  for (let i = start; i < source.length; i++) {
    const c = source[i];
    if (quote) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') { depth++; began = true; }
    if (c === '}' && --depth === 0 && began) return source.slice(start, i + 1);
  }
  throw Error('Unclosed actual source function: ' + name);
}
const field = {left: 28 / 600, right: 572 / 600, top: 26 / 740, bottom: 714 / 740};
let groups = 0;
const test = (label, run) => { run(); groups++; console.log('PASS ' + label); };
const plain = input => JSON.parse(JSON.stringify(input));
function setup({world = true, baseline = false} = {}) {
  const ctx = vm.createContext({structuredClone, v55Field: field, MATCH_SPEED: 1.8, v65WorldActive: world, direct: false, ability: (p, key) => p[key] ?? 12, clamp: (n, lo, hi) => Math.max(lo, Math.min(hi, n))});
  const load = source => vm.runInContext(source, ctx);
  load('let match=null,calls=[],rngCalls=0;const v99Flights=new WeakMap(),v99Actions=new WeakMap(),v102Flights=new WeakMap(),v123DefensiveThreats=new WeakMap(),v121PositioningPlans=new WeakMap(),v123GroundControls=new WeakMap();function v131KeeperSetting(){return false;}function random(){rngCalls++;return .999;}function note(){}function v115DecisionChance(p,kind,value){return value;}function v55Shoot(){calls.push("shot");}function v55GroundPass(p,q){calls.push("pass:"+q.pid);}function v55HighPass(p,q){calls.push("high:"+q.pid);}function v55ChooseTarget(p,allies){calls.push("choose");return allies[0]||p;}function v115BetterSquare(){return null;}function v131OpenGoal(){return false;}function v150TrySpacePass(){return false;}');
  load('const ' + game.slice(game.indexOf('distance='), game.indexOf(',random=', game.indexOf('distance='))) + ';');
  for (const name of ['passLaneGeometry', 'hasInstruction']) load(fn(game, name));
  for (const name of ['v160PitchWidth', 'v160PitchLength', 'v160PitchScale', 'v122Metres', 'v115GoalDistance', 'v124OffsideEdge', 'v55OffsideLine', 'v55OffsideSnapshot', 'v123ControlDirection', 'v123DribbleTarget', 'v55HasClearRun', 'v145ShotChance']) load(fn(pitch, name));
  for (const name of ['v121PositioningPaused', 'v123PossessionTeam']) load(fn(positioning, name));
  for (const name of ['v150Scale', 'v150Pace', 'v150Delay', 'v150KeeperArea']) load(fn(space, name));
  load(fn(read('world-pitch-actions-v99.js'), 'v113KeeperReacting'));
  load(read('world-attack-flow-v152.js'));
  load(read('world-player-roles-v154.js'));
  let action = pitch.slice(pitch.indexOf('action=function(){'), pitch.indexOf('\nconst v55BaseCorner='));
  if (baseline) { action = action.replace(/ if\(world&&typeof v154TryDribble==='function'&&v154TryDribble\(m,p,allies,rivals\)\)return;\r?\n/, ''); assert.ok(!action.includes('v154TryDribble'), 'Baseline excludes only the new decision hook'); }
  load(action);
  return {ctx, load, get: expression => vm.runInContext(expression, ctx), call: (name, ...args) => ctx[name](...args), set: m => { ctx.fixtureMatch = m; load('match=fixtureMatch;calls=[];rngCalls=0;'); }};
}
function player(pid, t, x, y, role = 'dribbler', orientation = 0) {
  return {pid, name: pid, n: 2, t, x, y, bx: x, by: y, tx: x, ty: y, tacticalRole: role, role: orientation, positionRoutine: 1, keeper: false, assignedLine: 'att', line: 'att', instructions: [], pos: 16, tec: 16, spd: 16, fin: 16, pas: 16, motionX: 0, motionY: 0, stats: {passes: 0, passComplete: 0}};
}
function matchOf(people, owner) {
  return {people, owner, ball: {x: owner?.x ?? .5, y: owner?.y ?? .5}, lastTouch: owner?.t ?? 0, elapsed: 18, next: 999, attackFlow: {version: 152, intents: {}}, flight: null, rebound: null, score: [0, 0]};
}
function duel(team = 0) {
  const s = {x: 44 / (field.right - field.left), y: 68 / (field.bottom - field.top)}, dir = team === 0 ? -1 : 1;
  const p = player('carrier', team, .5, .5), rival = player('rival', 1 - team, .5, p.y + dir * 3 / s.y, 'stopper');
  const k = player('opponent-keeper', 1 - team, .5, team === 0 ? field.top + 1 / s.y : field.bottom - 1 / s.y, 'line-keeper'); k.keeper = true;
  const cover = player('cover', 1 - team, p.x - 12 / s.x, p.y + dir * 12 / s.y, 'cover-defender');
  return {s, dir, p, rival, k, m: matchOf([p, rival, k, cover], p)};
}
test('both directions choose a useful isolated 1v1 exit without RNG, skills, statistics or ball movement', () => {
  for (const team of [0, 1]) {
    const h = setup(), {m, p, rival, k, dir, s} = duel(team), before = plain(m); h.set(m);
    assert.equal(h.call('v154TryDribble', m, p, [], [rival, k]), true);
    assert.ok((p.roleDribble.y - p.y) * dir * s.y > 0); assert.ok(h.call('v154DribbleLane', m, p, p.roleDribble));
    assert.ok(Math.abs(m.next - m.elapsed - .32 * h.ctx.MATCH_SPEED) < 1e-9); assert.equal(h.get('rngCalls'), 0);
    assert.deepEqual(m.ball, before.ball); assert.deepEqual(p.stats, before.people[0].stats);
    for (const key of ['x', 'y', 'spd', 'tec', 'pos', 'pas', 'fin']) assert.equal(p[key], before.people[0][key]);
    assert.deepEqual(plain(p.roleDribble), {...p.roleDribble}); assert.ok(p.roleDribble.until > m.elapsed / h.ctx.MATCH_SPEED);
  }
});
test('closed multiple marking, too-close contact, own-side opponents and boundary exits refuse a forced dribble', () => {
  for (const kind of ['multiple', 'contact', 'behind', 'closed-exits', 'touchline']) {
    const h = setup(), {m, p, rival, k, s, dir} = duel();
    if (kind === 'multiple') m.people.push(player('second', 1, p.x + 3 / s.x, p.y));
    if (kind === 'contact') rival.y = p.y + dir * 1 / s.y;
    if (kind === 'behind') rival.y = p.y - dir * 3 / s.y;
    if (kind === 'closed-exits') m.people.push(player('left', 1, p.x - 3 / s.x, p.y + dir * 4 / s.y), player('right', 1, p.x + 3 / s.x, p.y + dir * 4 / s.y));
    if (kind === 'touchline') { p.x = field.left + .5 / s.x; rival.x = p.x; k.x = p.x + 3 / s.x; k.y = p.y + dir * 4 / s.y; }
    h.set(m); const before = plain(m);
    assert.equal(h.call('v154TryDribble', m, p, [], m.people.filter(q => q.t !== p.t)), false, kind);
    assert.deepEqual(plain(m), before); assert.equal(h.get('rngCalls'), 0);
  }
});
test('a clearly better safe onside pass has priority; an offside or closed pass does not suppress the duel', () => {
  for (const team of [0, 1]) for (const kind of ['better', 'offside', 'blocked']) {
    const h = setup(), {m, p, rival, k, s, dir} = duel(team), q = player('mate', team, .5 + 8 / s.x, p.y + dir * (kind === 'offside' ? 34 : 8) / s.y);
    m.people.push(q);
    if (kind === 'blocked') m.people.push(player('pass-blocker', 1 - team, p.x + 6 / s.x, p.y + dir * 6 / s.y));
    h.set(m);
    assert.equal(h.call('v154TryDribble', m, p, [q], m.people.filter(r => r.t !== p.t)), kind !== 'better', `${team}:${kind}`);
  }
});
test('native action keeps v152 early forward passes and shot/square windows ahead of the dribbler preference', () => {
  for (const team of [0, 1]) for (const kind of ['forward', 'space', 'open-goal', 'square']) {
    const h = setup(), {m, p, rival, k, s, dir} = duel(team), q = player('mate', team, p.x + 8 / s.x, p.y + dir * 8 / s.y); m.people.push(q); h.set(m);
    if (kind === 'space') h.load('v150TrySpacePass=function(){calls.push("space");return true;};');
    if (kind === 'open-goal') h.load('v131OpenGoal=function(){return {target:{x:.5,y:.03}};};');
    if (kind === 'square') { p.y = team === 0 ? .35 : .65; m.ball.y = p.y; h.load('v115BetterSquare=function(p,allies){return allies[0];};'); }
    h.ctx.action();
    assert.equal(h.get('calls[0]'), kind === 'space' ? 'space' : kind === 'open-goal' ? 'shot' : 'pass:mate');
    assert.equal(p.roleDribble, undefined);
  }
});
test('native action picks the bounded duel only after better rapid actions fail', () => {
  const h = setup(), {m, p} = duel(); h.set(m); h.ctx.action();
  assert.deepEqual(plain(h.get('calls')), []); assert.ok(p.roleDribble);
  assert.ok(m.next <= m.elapsed + .32 * h.ctx.MATCH_SPEED + 1e-9);
});
test('the real ground-control solver still limits turning by technique without moving the owner or ball', () => {
  for (const team of [0, 1]) {
    const h = setup(), {m, p, rival, k} = duel(team); h.set(m);
    h.call('v154TryDribble', m, p, [], [rival, k]); const before = plain(m);
    h.call('v154RoleTarget', m, p, .01); h.call('v123DribbleTarget', m, p, .01);
    const desired = h.get('v123GroundControls.get(match).heading'), original = team === 0 ? Math.PI : 0;
    const turn = Math.abs(Math.atan2(Math.sin(desired - original), Math.cos(desired - original)));
    assert.ok(turn <= (2.8 + p.tec * .12) * .01 + 1e-9);
    assert.deepEqual(m.ball, before.ball); assert.equal(p.x, before.people[0].x); assert.equal(p.y, before.people[0].y);
  }
});
test('dribble plans cancel on expired time, closed exits, lost possession, role change and restart', () => {
  for (const kind of ['expired', 'closed', 'lost', 'role', 'restart']) {
    const h = setup(), {m, p, rival, k} = duel(); h.set(m); h.call('v154TryDribble', m, p, [], [rival, k]);
    if (kind === 'expired') m.elapsed += h.ctx.MATCH_SPEED;
    if (kind === 'closed') { rival.x = p.roleDribble.x; rival.y = p.roleDribble.y; }
    if (kind === 'lost') m.owner = rival;
    if (kind === 'role') p.tacticalRole = 'striker';
    if (kind === 'restart') m.setPiece = {type: 'freeKick'};
    h.call('v154RoleTarget', m, p, .1); assert.equal(p.roleDribble, undefined, kind);
  }
});
function depthBall(team = 0) {
  const h = setup(), s = h.call('v150Scale'), dir = team === 0 ? -1 : 1, goal = team === 0 ? field.bottom : field.top;
  const p = player('keeper', team, .5, goal + dir * 2 / s.y, 'sweeper-keeper'); p.keeper = true; p.pos = p.spd = 20;
  const rival = player('runner', 1 - team, .5 + 8 / s.x, goal + dir * 12 / s.y, 'striker');
  const m = matchOf([p, rival], null); m.lastTouch = 1 - team;
  m.flight = {x: .5, y: goal + dir * 10 / s.y, progress: .25, duration: 1.8, team: 1 - team};
  m.ball = {x: .5, y: goal + dir * 8 / s.y}; h.set(m); h.ctx.depthFlight = m.flight;
  h.load('v102Flights.set(depthFlight,{kind:"pass",high:false});');
  return {h, m, p, rival, s, dir, goal};
}
test('sweeper keeper anticipates an actually reachable observed depth ball in both directions; line keeper holds its native target', () => {
  for (const team of [0, 1]) {
    const {h, m, p, dir, s} = depthBall(team), before = plain(m), point = h.call('v154KeeperDepthTarget', m, p);
    assert.ok(point, 'Reachable observed ground ball'); assert.ok((point.y - p.y) * dir * s.y > .8);
    h.call('v154RoleTarget', m, p, .1); assert.equal(p.ty, point.y); assert.equal(p.tx, point.x);
    assert.equal(p.x, before.people[0].x); assert.equal(p.y, before.people[0].y); assert.deepEqual(m.ball, before.ball); assert.deepEqual(p.stats, before.people[0].stats); assert.equal(h.get('rngCalls'), 0);
    p.tacticalRole = 'line-keeper'; p.tx = p.bx; p.ty = p.by;
    h.call('v154RoleTarget', m, p, .1); assert.equal(p.ty, p.by);
  }
});
test('keeper gives up unreachable, covered, reversed, aerial, shot and high-risk windows and retains native return targets', () => {
  for (const kind of ['unreachable', 'covered', 'away', 'aerial', 'shot', 'wide', 'own-pass']) {
    const {h, m, p, rival, s, dir, goal} = depthBall();
    if (kind === 'unreachable') { p.x = .5 - 12 / s.x; p.spd = p.pos = 1; }
    if (kind === 'covered') { rival.x = .5; rival.y = goal + dir * 5 / s.y; }
    if (kind === 'away') m.ball.y = m.flight.y + dir * 2 / s.y;
    if (kind === 'aerial') h.load('v102Flights.set(depthFlight,{kind:"highPass",high:true});');
    if (kind === 'shot') h.load('v102Flights.set(depthFlight,{kind:"shot",high:false});');
    if (kind === 'wide') m.ball.x = m.flight.x = .5 + 15 / s.x;
    if (kind === 'own-pass') m.flight.team = p.t;
    assert.equal(h.call('v154KeeperDepthTarget', m, p), null, kind);
    const target = {x: p.tx, y: p.ty}; h.call('v154RoleTarget', m, p, .1); assert.deepEqual({x: p.tx, y: p.ty}, target, kind);
  }
});
test('keeper anticipation never reads planned receiver, goal result or fixed future endpoint', () => {
  const {h, m, p} = depthBall();
  for (const key of ['target', 'receiver', 'goal', 'done']) Object.defineProperty(m.flight, key, {get() { throw Error('Future outcome read: ' + key); }});
  assert.ok(h.call('v154KeeperDepthTarget', m, p));
});
test('poacher orientation strengthens backward work while neutral/offensive retain attacking availability in both directions', () => {
  for (const team of [0, 1]) {
    const h = setup(), s = h.call('v150Scale'), dir = team === 0 ? -1 : 1, targets = [];
    for (const orientation of [-1, 0, 1]) {
      const p = player('poacher', team, .5, .5, 'poacher', orientation), owner = player('opponent', 1 - team, .5, p.by - dir * 20 / s.y, 'playmaker'), m = matchOf([p, owner], owner); h.set(m);
      h.call('v154RoleTarget', m, p, .5); targets.push((p.ty - p.by) * dir * s.y);
      assert.ok(Math.abs(targets.at(-1)) <= 6 + 1e-9); assert.equal(p.x, p.bx); assert.equal(p.y, p.by);
    }
    assert.ok(targets[0] < targets[1] && targets[1] < targets[2]); assert.ok(Math.abs(targets[1] + 2) < 1e-9); assert.ok(Math.abs(targets[2]) < 1e-9);
  }
});
test('neutral poacher still pressures an actual nearby opponent without becoming a deep permanent chaser', () => {
  for (const team of [0, 1]) {
    const h = setup(), s = h.call('v150Scale'), dir = team === 0 ? -1 : 1, p = player('poacher', team, .5, .5, 'poacher'), owner = player('opponent', 1 - team, .5 + 1 / s.x, .5 - dir * 4 / s.y, 'playmaker'), m = matchOf([p, owner], owner); h.set(m);
    h.call('v154RoleTarget', m, p, .5); assert.equal(p.tx, owner.x); assert.ok(h.call('v122Metres', {x: p.tx, y: p.ty}, owner) < 1);
    owner.y = p.by - dir * 20 / s.y; h.call('v154RoleTarget', m, p, .5); assert.equal(p.tx, p.bx); assert.ok(Math.abs((p.ty - p.by) * s.y) <= 2 + 1e-9);
  }
});
test('legacy/unmarked and non-dribbler native decisions remain byte-for-byte equivalent to the old action hook', () => {
  for (const world of [false, true]) for (const role of [undefined, 'striker', 'line-keeper']) {
    const results = [];
    for (const baseline of [true, false]) {
      const h = setup({world, baseline}), {m, p, rival, k} = duel(); p.tacticalRole = role; h.set(m); h.ctx.action(); h.call('v154RoleTarget', m, p, .1);
      results.push({m: plain(m), calls: plain(h.get('calls')), rng: h.get('rngCalls')});
      assert.equal(p.roleDribble, undefined);
    }
    assert.deepEqual(results[1], results[0], `${world}:${role}`);
  }
});
console.log(`${groups} actual-source native role behavior groups passed`);
