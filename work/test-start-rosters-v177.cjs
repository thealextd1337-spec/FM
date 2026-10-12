'use strict';
const fs = require('node:fs'), assert = require('node:assert/strict');
const { harness } = require('./youth-native-harness-v176.cjs');
const { call, run, evaluate, context, copy } = harness();
run('world-expansion-stories-v170.js'); run('world-youth-legacy-v176.js');
const G = evaluate('D6PlayerGeneration'), q = p => G.positionQuality(p, p.line);
const count = Number(process.argv.find(a => a.startsWith('--worlds='))?.slice(9) || 60);
let career, elites = 0, players = 0;
const styles = new Set();
for (let i = 0; i < count; i++) {
  career = call('v167CreateCareer', 'AUT-5', 'start-v177-stress-' + i, 'Kaderprüfung');
  const plans = career.world.playerFoundation.expansionGeneration.startClubs;
  assert.equal(career.world.playerFoundation.expansionGeneration.version, 3);
  for (const club of career.world.clubs) {
    const plan = plans[club.id]; styles.add(plan.style);
    assert.equal(club.roster.length, 11);
    assert.equal(club.roster.filter(p => p.keeper).length, 2);
    for (const line of ['def', 'mid', 'att']) assert.equal(club.roster.filter(p => p.line === line).length, 3);
    assert.equal(club.roster.filter(p => p.age >= 18 && p.age <= 22).length, 3);
    assert.equal(club.roster.filter(p => p.age >= 24 && p.age <= 29).length, 6);
    assert.equal(club.roster.filter(p => p.age >= 30 && p.age <= 32).length, 2);
    const mean = club.roster.reduce((sum, p) => sum + call('v177Quality', p), 0) / 11;
    assert(Math.abs(mean - plan.target) < 1e-8);
    assert(Math.abs(mean / plan.base - 1) <= .025 + 1e-10);
    const n = club.roster.filter(p => G.eliteQuality(p, p.playerModel.playablePositions)).length;
    assert(n <= (plan.peak && club.expansionTier === 'A' && !club.simulationOnly ? 3 : 2));
    for (const p of club.roster) for (const key of G.SKILL_KEYS) assert(p[key] >= 1 && p[key] <= p.playerModel.caps[key] && p.playerModel.caps[key] <= 20);
    for (const f of evaluate('v63Formations')) assert(Number.isFinite(call('v177StartingQuality', club, f)));
    const coach = career.world.coaches.find(c => c.id === club.coachId);
    if (coach) assert.equal(coach.style.passing, { passing: 'Kurz', counter: 'Direkt', physical: 'Variabel' }[plan.style]);
    if (!club.simulationOnly) { elites += n; players += club.roster.length; }
  }
  const league = career.world.clubs.filter(c => !c.simulationOnly), cup = career.world.clubs.filter(c => c.simulationOnly);
  const mean = c => c.roster.reduce((s, p) => s + call('v177Quality', p), 0) / 11;
  const best = c => Math.max(...evaluate('v63Formations').map(f => call('v177StartingQuality', c, f)));
  assert(Math.max(...cup.map(mean)) <= .9 * Math.min(...league.map(mean)) + 1e-8);
  assert(Math.max(...cup.map(best)) <= .9 * Math.min(...league.map(best)) + 1e-8);
  assert(cup.every(c => c.roster.every(p => !G.eliteQuality(p, p.playerModel.playablePositions))));
  assert(call('v61ValidateCareer', career));
  assert(call('v61ValidateCareer', copy(career)), 'JSON roundtrip must preserve a valid world');
  if (i % 10 === 0) console.log('PASS stress world ' + (i + 1) + '/' + count);
}
assert.equal(styles.size, 3);
assert(elites > 0 && elites / players < .04, 'Elite should remain rare in the independent stress sample');

// Saved version-1 worlds retain their generator/transfer rules and are not upgraded.
evaluate('const v177TestPolicy=v161GenerationPolicy;v161GenerationPolicy=function(){return v177TestPolicy();};');
const legacy = call('v167CreateCareer', 'AUT-5', 'old-policy-v177-proof', 'Altbestand');
evaluate('v161GenerationPolicy=v177TestPolicy;');
const frozen = JSON.stringify(legacy);
assert.equal(legacy.world.playerFoundation.expansionGeneration.version, 1);
assert(call('v61ValidateCareer', copy(legacy)));
assert.equal(JSON.stringify(legacy), frozen);

// Previously created version-2 worlds remain valid without new cup limits.
evaluate('v161GenerationPolicy=function(seed){return v177TestPolicy(seed,2);};');
const previous = call('v167CreateCareer', 'AUT-5', 'cup-policy-preservation', 'Altbestand');
evaluate('v161GenerationPolicy=v177TestPolicy;');
const previousFrozen = JSON.stringify(previous);
assert.equal(previous.world.playerFoundation.expansionGeneration.version, 2);
assert(call('v61ValidateCareer', copy(previous)));
assert.equal(JSON.stringify(previous), previousFrozen);
const current = call('v167CreateCareer', 'AUT-5', 'cup-policy-preservation', 'Altbestand');
assert.deepEqual(current.world.clubs.filter(c => !c.simulationOnly).map(c => c.roster), previous.world.clubs.filter(c => !c.simulationOnly).map(c => c.roster), 'League generation stays identical');
const invalidCup = copy(current), testCup = invalidCup.world.clubs.find(c => c.simulationOnly), testLeague = invalidCup.world.clubs.find(c => !c.simulationOnly);
testCup.roster = copy(testLeague.roster);
const testPlan = invalidCup.world.playerFoundation.expansionGeneration.startClubs[testCup.id];
testPlan.target = testCup.roster.reduce((s,p) => s + call('v177Quality',p),0) / 11; testPlan.eliteLimit = 11;
assert.throws(() => call('v177CheckInitialRosters', invalidCup), /zehn Prozent/);
const unknown = copy(current); unknown.world.playerFoundation.expansionGeneration.version = 4;
assert.equal(call('v61ValidateCareer', unknown), false);

// Initial private forecasts/parameters must survive serialization unchanged.
assert.deepEqual(copy(career).world.playerFoundation.expansionGeneration, career.world.playerFoundation.expansionGeneration);
const changed = copy(career); changed.world.playerFoundation.expansionGeneration.startClubs['AUT-5'].target += .01;
assert.equal(call('v61ValidateCareer', changed), false);

// The second keeper must remain a keeper on the simulation-club replacement path.
const retiring = copy(career), cup = retiring.world.clubs.find(c => c.simulationOnly), old = cup.roster[1];
old.age = 39;
retiring.world.retirementDecisions = { season: 1, day: 112, players: [{ pid: old.pid, clubId: cup.id, retire: true, age: 39 }] };
call('v176CloseRetirements', retiring);
assert(cup.roster[1].keeper);
assert.equal(cup.roster.filter(p => p.keeper).length, 2);
assert.notEqual(cup.roster[1].pid, old.pid);
assert.equal(retiring.world.contracts.filter(c => c.clubId === cup.id).length, 11);
const preview = call('v161CreateCareer', 'AUT-5', 'preview-replacement-v177', 'Pokalersatz');
const previewCup = preview.world.clubs.find(c => c.simulationOnly), previewKeeper = previewCup.roster[1];
previewKeeper.age = previewKeeper.retirementAge;
call('v64ArchiveSeason', preview);
assert(previewCup.roster[1].keeper, 'Preview-world replacement must preserve the second keeper too');
assert.notEqual(previewCup.roster[1].pid, previewKeeper.pid);

function offers(c, paid) {
  c.world.market.phase = 'open'; c.world.market.day = 1; c.world.market.pendingBids = [];
  const buyerA = c.world.clubs.find(x => x.id === 'GER-1'), buyerC = c.world.clubs.find(x => x.id === 'AUT-1');
  for (const club of [buyerA, buyerC]) { club.balance = 100000; club.policy.tradition = 3; club.policy.risk = 2; }
  const seller = paid ? c.world.clubs.find(x => x.id === 'ITA-8') : null;
  const p = paid ? seller.roster.find(p => p.line === 'att') : c.world.market.freePlayers.find(p => p.line === 'att');
  for (const key of G.SKILL_KEYS) { p[key] = 17; p.playerModel.caps[key] = 20; }
  const annual = call('v66Salary', p) * 2, fee = paid ? Math.ceil(call('v66Value', p) * 1.5 / 10) * 10 : 0;
  const a = call('v66MakeBid', c, buyerA.id, p.pid, fee, annual, 3, 5);
  const b = call('v66MakeBid', c, buyerC.id, p.pid, Math.ceil(fee * 1.2 / 10) * 10, annual, 3, 5);
  assert(call('v66BidAppeal', c, a) > call('v66BidAppeal', c, b));
  assert(call('v66Consent', c, a).minimum < call('v66Consent', c, b).minimum);
  const appeal = call('v177TransferSport', c, a).appeal;
  p.playerModel.talent = 22;
  assert.equal(call('v177TransferSport', c, a).appeal, appeal, 'Hidden talent does not drive ambition');
  for (const key of G.SKILL_KEYS) p[key] = 10;
  assert.equal(call('v177TransferSport', c, a).appeal, 0, 'Actual quality drives ambition');
  for (const key of G.SKILL_KEYS) p[key] = 17;
  const compensation = { ...b, annual: annual + 1000 };
  assert(call('v66BidAppeal', c, compensation) > call('v66BidAppeal', c, a), 'Wages can outweigh the preference');
  call('v66ResolveDay', c);
  assert.equal(call('v66Owner', c, p.pid).id, buyerA.id, 'Free and paid transfers use the player preference');
  const events = c.world.transfers.length;
  call('v66ResolveDay', c);
  assert.equal(c.world.transfers.length, events, 'No duplicate transfer');
}
offers(copy(career), false); offers(copy(career), true);
const emptyBuyer = copy(career), emptyClub = emptyBuyer.world.clubs.find(c => c.id === 'GER-1'), emptyPlayer = emptyBuyer.world.market.freePlayers[0];
emptyClub.roster = [];
const repairBid = { pid: emptyPlayer.pid, buyerId: emptyClub.id, sellerId: null, annual: 300, years: 2, promise: 3 };
assert(Number.isFinite(call('v66BidAppeal', emptyBuyer, repairBid)));
assert(Number.isFinite(call('v66Consent', emptyBuyer, repairBid).minimum));
const oldFree = legacy.world.market.freePlayers[0], oldClub = legacy.world.clubs[0], oldBid = { pid: oldFree.pid, buyerId: oldClub.id, sellerId: null, annual: 300, years: 2, promise: 3 };
assert.deepEqual(call('v177TransferSport', legacy, oldBid), { appeal: 0, salaryFactor: 0 });
assert.equal(call('v66BidAppeal', legacy, oldBid), 300 + 24 + 12 + oldClub.policy.tradition * 5);
assert.equal(JSON.stringify(legacy), frozen);

fs.mkdirSync('outputs/start-rosters-v177', { recursive: true });
fs.writeFileSync('outputs/start-rosters-v177/checks.json', JSON.stringify({ passed: true, generationVersion: 3, stressWorlds: count, players, elitePlayers: elites, eliteShare: elites / players, constraints: ['elite cap', 'squad budget', 'seed variation', 'two keepers', 'position coverage', 'age mix', 'style', 'strict squad and optimal starting hierarchy', 'all cup squads and optimal lineups at least ten percent below every league club'], transfers: ['actual quality', 'wages', 'free offers', 'paid offers', 'idempotence'], legacyUnchanged: true, previousVersion2Unchanged: true, leagueGenerationUnchanged: true, serializedPolicyValid: true, replacementKeepsPosition: true }, null, 2));
console.log('PASS v177 start rosters, transfers, serialization and legacy preservation');
