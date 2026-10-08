'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const development = require('../dist/player-development.js');
const { SKILL_KEYS, createLedger, resetSeason, developmentDelta } = development;
let checks = 0;
function test(name, body) { body(); checks++; console.log('PASS ' + name); }
function close(actual, expected, tolerance = 1e-11) { assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`); }
function total(delta) { return Object.values(delta).reduce((sum, value) => sum + value, 0); }
function all(value) { return Object.fromEntries(SKILL_KEYS.map(key => [key, value])); }
function player(overrides = {}) { return { id: 'p1', age: 19, talent: 19, skills: all(10), caps: all(20), ...overrides }; }
function appearance(id, minutes = 90, rating = 7, skillWeights = { fin: 1 }, overrides = {}) {
  return { id, worldId: 'w1', seasonId: 's1', minutes, rating, skillWeights, ...overrides };
}
function ledger() { return createLedger('p1', 'w1', 's1'); }
function apply(p, result) { return { ...p, skills: Object.fromEntries(SKILL_KEYS.map(key => [key, p.skills[key] + result.skillDelta[key]])) }; }
function step(p, l, a, approved = a.skillWeights) {
  const r = developmentDelta(p, l, a, approved);
  return { p: apply(p, r), l: r.nextLedger, r };
}
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}

test('one and two appearances develop immediately, exact 6.5 threshold, no rating bonus', () => {
  let state = step(player(), ledger(), appearance('a', 1, 6.5));
  close(total(state.r.skillDelta), 0.5 / 90);
  state = step(state.p, state.l, appearance('b', 2, 6.5));
  close(total(state.r.skillDelta), 0.5 * 2 / 90);
  close(state.l.seasonMinutes, 3);
  close(total(developmentDelta(player(), ledger(), appearance('low', 90, 6.5 - 1e-10), { fin: 1 }).skillDelta), 0);
  close(total(developmentDelta(player(), ledger(), appearance('high', 90, 10), { fin: 1 }).skillDelta), 0.5);
});

test('last three appearances are minute weighted, including 19 minutes and hidden visible note', () => {
  let state = step(player(), ledger(), appearance('long', 90, 7));
  state = step(state.p, state.l, appearance('short', 19, 4, { fin: 1 }, { visibleRating: null }));
  close(total(state.r.skillDelta), 0);
  state = step(state.p, state.l, appearance('third', 90, 7));
  close(total(state.r.skillDelta), 0.5);
  state = step(state.p, state.l, appearance('fourth', 1, 4));
  close(total(state.r.skillDelta), 0);
  assert.deepEqual(state.l.ratedWindow.map(a => a.id), ['short', 'third', 'fourth']);
  let short = { p: player(), l: ledger() };
  let gain = 0;
  [5, 8, 12].forEach((minutes, i) => { short = step(short.p, short.l, appearance('short-' + i, minutes)); gain += total(short.r.skillDelta); });
  close(gain, 0.5 * 25 / 90);
  assert.equal(short.l.seasonMinutes, 25);
});

test('899/900 and 1799/1800 split the current appearance minutes', () => {
  const cases = [[899, 2, 1.25], [900, 90, 22.5], [1799, 2, 0.25], [1800, 90, 0], [899, 1000, 226]];
  cases.forEach(([minutesBefore, newMinutes, eligible]) => {
    const l = { ...ledger(), seasonMinutes: minutesBefore };
    const r = developmentDelta(player(), l, appearance('boundary-' + minutesBefore, newMinutes), { fin: 1 });
    close(total(r.skillDelta), 0.5 * eligible / 90);
    assert.equal(r.nextLedger.seasonMinutes, minutesBefore + newMinutes);
  });
});

test('bad and neutral minutes consume the common season staffel; competitions do not modify it', () => {
  let state = step(player(), ledger(), appearance('bad', 899, 5));
  assert.equal(state.l.seasonMinutes, 899);
  state = step(state.p, state.l, appearance('neutral', 1, 6));
  assert.equal(state.l.seasonMinutes, 900);
  state = step(state.p, state.l, appearance('good', 90, 10, { fin: 1 }, { competition: 'europe' }));
  close(total(state.r.skillDelta), 0);
  state = step(state.p, state.l, appearance('good-next', 90, 10, { fin: 1 }, { competition: 'cup' }));
  close(total(state.r.skillDelta), 0.125);
  ['league', 'cup', 'europe'].forEach(competition => {
    close(total(developmentDelta(player(), ledger(), appearance(competition, 90, 7, { fin: 1 }, { competition }), { fin: 1 }).skillDelta), 0.5);
  });
});

test('talent 19 reference, talent 10/22 scaling and every age band', () => {
  [[19, 1], [20, 0.8], [21, 0.8], [22, 0.5], [23, 0.5], [24, 0.2], [29, 0.2], [30, 0.1], [42, 0.1]].forEach(([age, factor]) => {
    [10, 19, 22].forEach(talent => {
      const r = developmentDelta(player({ age, talent }), ledger(), appearance('age', 90, 7, { pos: 1 }), { pos: 1 });
      close(total(r.skillDelta), 0.5 * talent / 19 * factor);
    });
  });
  let sum = 0;
  [17, 18, 19, 20].forEach((age, seasonIndex) => {
    let state = { p: player({ age, talent: 22 }), l: createLedger('p1', 'w1', seasonIndex) };
    for (let i = 0; i < 10; i++) {
      state = step(state.p, state.l, appearance(i, 90, 7, { fin: 1 }, { seasonId: seasonIndex }));
      sum += total(state.r.skillDelta);
    }
  });
  close(sum, 22);
});

test('adult positive recipients remain calm/ant/dec/pos; factor changes retain minutes', () => {
  const weights = all(1);
  const r = developmentDelta(player({ age: 24 }), ledger(), appearance('adult', 90, 7, weights), weights);
  SKILL_KEYS.forEach(key => close(r.skillDelta[key], ['calm', 'ant', 'dec', 'pos'].includes(key) ? 0.025 : 0));
  const discard = developmentDelta(player({ age: 30 }), ledger(), appearance('technical', 90, 7), { fin: 1 });
  close(total(discard.skillDelta), 0); close(discard.rejectedRemainder, 0.05);
  const l = { ...ledger(), seasonMinutes: 900 };
  close(total(developmentDelta(player({ age: 24 }), l, appearance('age-change', 90, 7, { pos: 1 }), { pos: 1 }).skillDelta), 0.025);
});

test('three individual weak notes plus uninterrupted 90 minutes; current match only', () => {
  let state = { p: player(), l: ledger() };
  for (let i = 1; i <= 18; i++) {
    state = step(state.p, state.l, appearance('weak-' + i, 5, 5));
    close(total(state.r.skillDelta), i === 18 ? -0.1 * 5 / 90 : 0);
  }
  assert.equal(state.l.weakSeriesMinutes, 90);
  close(state.l.negativeApplied, 0.1 * 5 / 90);
  let three = { p: player(), l: ledger() };
  [30, 30, 30].forEach((minutes, i) => { three = step(three.p, three.l, appearance('third-' + i, minutes, 5.49)); close(total(three.r.skillDelta), i === 2 ? -0.1 / 3 : 0); });
  let full = step(player(), ledger(), appearance('one-long', 90, 1));
  close(total(full.r.skillDelta), 0);
  const short = [1, 5, 19].reduce((s, minutes, i) => step(s.p, s.l, appearance('tiny-' + i, minutes, 5)), { p: player(), l: ledger() });
  close(total(short.r.skillDelta), 0); assert.equal(short.l.weakSeriesMinutes, 25);
});

test('5.5 resets the weak series; mixed last-three notes never cause a decline', () => {
  let state = { p: player(), l: ledger() };
  [5, 5, 5.5, 5, 5].forEach((rating, i) => { state = step(state.p, state.l, appearance('mixed-' + i, 90, rating)); close(total(state.r.skillDelta), 0); if (rating === 5.5) assert.equal(state.l.weakSeriesMinutes, 0); });
  assert.equal(state.l.weakSeriesMinutes, 180);
  state = step(state.p, state.l, appearance('new-third', 90, 5)); close(total(state.r.skillDelta), -0.1);
  [24, 30].forEach(age => {
    let adult = { p: player({ age }), l: ledger() };
    for (let i = 0; i < 4; i++) { adult = step(adult.p, adult.l, appearance('adult-weak-' + i, 90, 1)); close(total(adult.r.skillDelta), 0); }
  });
});

test('negative cap is one gross applied point, unaffected by positive rebuild or staffel', () => {
  let state = { p: player(), l: ledger() };
  for (let i = 0; i < 12; i++) state = step(state.p, state.l, appearance('cap-' + i, 90, 5));
  close(state.l.negativeApplied, 1); close(state.p.skills.fin, 9);
  state = step(state.p, state.l, appearance('blocked', 90, 5)); close(total(state.r.skillDelta), 0); close(state.r.rejectedRemainder, 0.1);
  for (let i = 0; i < 3; i++) state = step(state.p, state.l, appearance('rebuild-' + i, 90, 10));
  assert.ok(total(state.r.skillDelta) > 0); close(state.l.negativeApplied, 1);
  for (let i = 0; i < 3; i++) state = step(state.p, state.l, appearance('still-capped-' + i, 90, 1));
  close(total(state.r.skillDelta), 0); close(state.l.negativeApplied, 1);
  const exhausted = { ...ledger(), seasonMinutes: 1800, weakSeriesMinutes: 180,
    ratedWindow: [{ id: 'prior1', worldId: 'w1', seasonId: 's1', minutes: 90, rating: 5 }, { id: 'prior2', worldId: 'w1', seasonId: 's1', minutes: 90, rating: 5 }] };
  close(total(developmentDelta(player(), exhausted, appearance('after-1800', 90, 5), { fin: 1 }).skillDelta), -0.1);
});

test('caps redistribute only to appropriate recipients, no near-cap slowing or saved bank', () => {
  const p = player(); p.skills.fin = 13.9; p.caps.fin = 14;
  const weights = { fin: 3, ant: 1 };
  const r = developmentDelta(p, ledger(), appearance('overflow', 90, 7, weights), weights);
  close(r.skillDelta.fin, 0.1); close(r.skillDelta.ant, 0.4); close(total(r.skillDelta), 0.5);
  assert.equal(r.skillDelta.tec, 0); close(r.rejectedRemainder, 0);
  p.skills.fin = 13.8;
  const near = developmentDelta(p, ledger(), appearance('near', 36), { fin: 1 }); close(near.skillDelta.fin, 0.2);
  p.skills.fin = 14;
  const blocked = developmentDelta(p, ledger(), appearance('full'), { fin: 1 }); close(total(blocked.skillDelta), 0); close(blocked.rejectedRemainder, 0.5);
  assert.equal(blocked.nextLedger.seasonMinutes, 90); assert.ok(!Object.hasOwn(blocked.nextLedger, 'bank'));
  const adult = player({ age: 24 }); adult.caps.pos = 10;
  const adultWeights = { pos: 1, fin: 100, ant: 1 };
  const adultResult = developmentDelta(adult, ledger(), appearance('adult-overflow', 90, 7, adultWeights), adultWeights);
  close(adultResult.skillDelta.ant, 0.1); assert.equal(adultResult.skillDelta.fin, 0);
});

test('negative shares clamp at floor 1, no cap change and only actual loss uses gross cap', () => {
  let state = { p: player(), l: ledger() };
  state.p.skills.fin = 1; state.p.skills.tec = 1.02;
  const beforeCaps = structuredClone(state.p.caps);
  const weights = { fin: 1, tec: 1 };
  for (let i = 0; i < 3; i++) state = step(state.p, state.l, appearance('floor-' + i, 90, 5, weights));
  assert.equal(state.p.skills.fin, 1); assert.equal(state.p.skills.tec, 1);
  close(total(state.r.skillDelta), -0.02); close(state.r.rejectedRemainder, 0.08); close(state.l.negativeApplied, 0.02);
  assert.deepEqual(state.p.caps, beforeCaps);
});

test('missing P06 data and unapproved weights are explicitly unsupported and unbooked', () => {
  [null, undefined, NaN, Infinity, 0, 11].forEach(rating => {
    const a = appearance('missing', 19); a.rating = rating;
    const r = developmentDelta(player(), ledger(), a, { fin: 1 });
    assert.equal(r.status, 'unsupported'); assert.equal(r.reason, 'missing-or-invalid-rating'); assert.deepEqual(r.nextLedger, ledger());
  });
  [undefined, null, {}, { fin: -1 }, { fin: Infinity }, { unknown: 1 }].forEach(weights => {
    const a = appearance('weights'); a.skillWeights = weights;
    const r = developmentDelta(player(), ledger(), a, weights);
    assert.equal(r.status, 'unsupported'); assert.deepEqual(r.nextLedger, ledger());
  });
  const r = developmentDelta(player(), ledger(), appearance('not-approved'), { fin: 2 });
  assert.equal(r.reason, 'unapproved-weights'); assert.equal(r.nextLedger.seasonMinutes, 0);
  const noApproval = developmentDelta(player(), ledger(), appearance('no-approval'));
  assert.equal(noApproval.status, 'unsupported');
  const zero = appearance('bench', 0); zero.rating = null; zero.skillWeights = null;
  assert.equal(developmentDelta(player(), ledger(), zero).status, 'no-change');
});

test('serialize/load/transfer and duplicate appearance IDs preserve exactly-once booking', () => {
  const state = step(player(), ledger(), appearance('stable', 19));
  const restoredPlayer = JSON.parse(JSON.stringify({ ...state.p, clubId: 'new-club' }));
  const restoredLedger = JSON.parse(JSON.stringify(state.l));
  const duplicate = developmentDelta(restoredPlayer, restoredLedger, appearance('stable', 19), { fin: 1 });
  assert.equal(duplicate.status, 'duplicate'); close(total(duplicate.skillDelta), 0); assert.deepEqual(duplicate.nextLedger, state.l);
  const next = step(restoredPlayer, restoredLedger, appearance('next', 19));
  assert.equal(next.l.seasonMinutes, 38); close(total(next.r.skillDelta), 0.5 * 19 / 90);
});

test('explicit season transition resets only seasonal totals and cannot be replayed backwards', () => {
  let state = { p: player(), l: ledger() };
  for (let i = 0; i < 3; i++) state = step(state.p, state.l, appearance('weak-season-' + i, 90, 5));
  const next = resetSeason(state.l, 's2');
  assert.equal(next.seasonMinutes, 0); assert.equal(next.negativeApplied, 0); assert.equal(next.weakSeriesMinutes, 270);
  assert.deepEqual(next.ratedWindow, state.l.ratedWindow); assert.equal(next.processedAppearances.length, 3);
  const sameIdNewSeason = developmentDelta(state.p, next, appearance('weak-season-2', 90, 5, { fin: 1 }, { seasonId: 's2' }), { fin: 1 });
  close(total(sameIdNewSeason.skillDelta), -0.1); assert.equal(sameIdNewSeason.nextLedger.seasonMinutes, 90);
  const again = resetSeason(sameIdNewSeason.nextLedger, 's2'); assert.equal(again.seasonMinutes, 90);
  assert.throws(() => resetSeason(again, 's1'), /Cannot reopen/);
  const historic = developmentDelta(state.p, again, appearance('weak-season-2', 90, 5), { fin: 1 }); assert.equal(historic.status, 'duplicate');
  const wrongScope = developmentDelta(state.p, again, appearance('new-historic'), { fin: 1 }); assert.equal(wrongScope.reason, 'scope-mismatch');
  const wrongWorld = developmentDelta(state.p, again, appearance('world', 90, 7, { fin: 1 }, { worldId: 'w2', seasonId: 's2' }), { fin: 1 }); assert.equal(wrongWorld.reason, 'scope-mismatch');
});

test('accepted six-game striker example reproduces all eight illustrative seasons', () => {
  const example = JSON.parse(fs.readFileSync(path.join(__dirname, '../outputs/stuermer-sechs-spiele-2026-10-07.json'), 'utf8'));
  function canonical(source) { return Object.fromEntries(SKILL_KEYS.map(key => [key, source[key === 'calm' ? 'ruhe' : key]])); }
  let p = player({ age: 17, talent: 16, skills: canonical(example.illustrative_initial_attributes), caps: canonical(example.illustrative_caps) });
  let l = createLedger(p.id, 'w1', 17), cumulative = 0;
  example.seasons.forEach(season => {
    p = { ...p, age: season.season_age }; l = resetSeason(l, p.age);
    const weights = canonical(p.age < 24 ? example.illustrative_youth_learning_shares_percent : example.illustrative_adult_learning_shares_percent);
    let gain = 0;
    for (let i = 0; i < 6; i++) { const s = step(p, l, appearance(i, 90, 7, weights, { seasonId: p.age })); p = s.p; l = s.l; gain += total(s.r.skillDelta); }
    cumulative += gain; close(gain, season.gain); close(cumulative, season.cumulative_gain);
    SKILL_KEYS.forEach(key => close(p.skills[key], canonical(season.attributes_after)[key], 6e-10));
    const positionWeights = canonical(example.confirmed_position_weights_percent);
    close(SKILL_KEYS.reduce((sum, key) => sum + p.skills[key] * positionWeights[key] / 100, 0), season.quality_after_season);
    assert.equal(l.seasonMinutes, 540);
  });
});

test('frozen inputs, independent output history and fractional arithmetic remain deterministic', () => {
  const p = freeze(player()), l = freeze(ledger()), a = freeze(appearance('immutable', 19, 7, { fin: 3, ant: 2, calm: 1 }));
  const approved = freeze({ fin: 3, ant: 2, calm: 1 });
  const before = JSON.stringify({ p, l, a, approved });
  const first = developmentDelta(p, l, a, approved), second = developmentDelta(p, l, a, approved);
  assert.deepEqual(first, second); assert.equal(JSON.stringify({ p, l, a, approved }), before);
  first.nextLedger.ratedWindow[0].rating = 1; assert.equal(second.nextLedger.ratedWindow[0].rating, 7);
  let state = { p: player(), l: ledger() }, gain = 0;
  for (let i = 0; i < 2000; i++) { state = step(state.p, state.l, appearance('minute-' + i, 1, 6.5, { fin: 3, ant: 2, calm: 1 })); gain += total(state.r.skillDelta); }
  close(gain, 6.25, 2e-10); assert.equal(state.l.seasonMinutes, 2000);
  SKILL_KEYS.forEach(key => assert.ok(state.p.skills[key] <= state.p.caps[key] && state.p.skills[key] >= 1));
});

test('browser UMD export shares Node calculations without game or storage globals', () => {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../dist/player-development.js'), 'utf8'), context);
  assert.deepEqual(Object.keys(context), ['D6Development']);
  const browser = context.D6Development.developmentDelta(player(), ledger(), appearance('umd'), { fin: 1 });
  assert.equal(JSON.stringify(browser), JSON.stringify(developmentDelta(player(), ledger(), appearance('umd'), { fin: 1 })));
});

test('invalid permanent player data and another player ledger fail loudly', () => {
  const p = player(); p.caps.fin = 9;
  assert.throws(() => developmentDelta(p, ledger(), appearance('invalid'), { fin: 1 }), /personal cap/);
  assert.throws(() => developmentDelta(player({ id: 'p2' }), ledger(), appearance('another'), { fin: 1 }), /another player/);
  assert.throws(() => developmentDelta(player(), ledger(), appearance('minutes', -1), { fin: 1 }), /minutes/);
});

console.log(`Development: ${checks} scenario groups passed (synthetic inputs; P06 production gate remains open).`);
