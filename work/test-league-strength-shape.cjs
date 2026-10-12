'use strict';
const assert = require('node:assert/strict');
const { analyze, compare } = require('./measure-league-strength-shape.cjs');
const world = (seed, offset) => ({ seed, clubs: ['A', 'A', 'A', 'A', 'A', 'B', 'B', 'C', 'C', 'C', 'D', 'D'].flatMap((tier, country) => Array.from({ length: 8 }, (_, rank) => ({
  clubId: country + '-' + rank, name: 'Club ' + country + '-' + rank, country: ['ENG','ESP','GER','ITA','FRA','POR','NED','AUT','BEL','TUR','SUI','GRE'][country], tier, kind: 'league',
  meanQuality: (rank < 2 ? { A: 16, B: 15, C: 14, D: 13 }[tier] - rank * .1 : 10 - rank * .1) + offset
}))).concat([{ clubId: 'cup', kind: 'cup', meanQuality: 20 }]) });
const result = analyze([world('one', 0), world('two', .2)]);
assert.equal(result.topTwo['A-C'].comparisons, 120);
assert.equal(result.topTwo['A-C'].shareStronger, 1);
assert.equal(result.topTwo['A-D'].comparisons, 80);
assert.equal(result.ranksThreeToEight['A-C'].comparisons, 1080);
assert(result.ranksThreeToEight['A-C'].shareStronger > 0 && result.ranksThreeToEight['A-C'].shareStronger < 1);
assert.equal(result.variation.measuredClubStarts, 192);
assert.equal(result.variation.withinFivePercent, 192);
assert.equal(result.variation.clubs.length, 96);
assert.equal(result.strictStartHierarchy.passed, true);
assert.equal(result.strictStartHierarchy.comparisons, 120);
assert.equal(result.strictStartHierarchy.violationCount, 0);
const tied = world('tied-top', 0);
tied.clubs.find(c => c.country === 'AUT').meanQuality = 16;
assert.equal(analyze([tied]).strictStartHierarchy.passed, false, 'Tied peaks also violate strictly stronger');
const reversed = world('reversed', 0);
reversed.clubs.filter(c => c.tier === 'A').forEach(c => c.meanQuality -= 4);
const wrong = analyze([reversed]).strictStartHierarchy;
assert.equal(wrong.passed, false);
assert.equal(wrong.failedWorlds, 1);
assert(wrong.violationCount > 0);
assert(wrong.worlds[0].violations.every(v => ['AUT', 'SUI', 'TUR'].includes(v.smallerCountry)));
assert(result.variation.clubs.every(c => c.bestRank === c.worstRank && c.starts === 2));
// A large common shift must never produce comparisons across different seeds.
const shifted = analyze([world('early', 0), world('late', 10)]);
assert.equal(shifted.topTwo['A-C'].shareStronger, 1);
assert.equal(shifted.topTwo['A-C'].worldMin, 1);
assert.equal(shifted.topTwo['A-C'].worldMax, 1);
assert.deepEqual(compare([{ meanQuality: 10 }], [{ meanQuality: 10 }]), { comparisons: 1, stronger: 0, tied: 1, shareStronger: 0 });
assert.throws(() => analyze([]), /At least one/);
assert.throws(() => analyze([world('same', 0), world('same', .1)]), /distinct/);
const bad = world('bad', 0); bad.clubs[0].meanQuality = NaN;
assert.throws(() => analyze([bad]));
console.log('PASS league shape: top-two ranking, middle overlap, same-seed comparisons, pool exclusion, variation and invalid input');
