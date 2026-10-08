'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const { chromium } = require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out = path.resolve('outputs/platform/role-performance'); fs.mkdirSync(out, { recursive: true });
const smoke = process.argv.includes('--smoke'), built = process.argv.includes('--build'), hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const source = path.resolve('dist'), frozen = new Map();
const html = fs.readFileSync(path.join(source, 'index.html'));
frozen.set('index.html', html);
for (const item of html.toString().matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const rel = item[1].split('?')[0];
  if (/^(?:https?:|data:|\/)/.test(rel) || !/\.(?:js|css)$/.test(rel)) continue;
  const file = path.resolve(source, rel);
  if (!file.startsWith(source + path.sep)) continue;
  if (!fs.existsSync(file)) throw Error('Required source is not ready: ' + rel);
  frozen.set(rel.replaceAll('\\', '/'), fs.readFileSync(file));
}
const buildBytes = built ? fs.readFileSync('outputs/index.html') : null;
const buildHtml = built ? Buffer.from(buildBytes.toString().replace('<head>', '<head><base href="/source/">')) : null;
const report = { smoke, built, ...(built ? { buildHash: hash(buildBytes) } : {}), sourceHashes: Object.fromEntries([...frozen].map(([file, bytes]) => ['dist/' + file, hash(bytes)])), checks: [], errors: [], matches: [] };

async function installHelpers(page) {
  await page.evaluate(() => {
    window.q01Check = (name, value) => { if (!value) throw Error(name); return name; };
    window.q01Options = model => {
      if (model === 'legacy') return null;
      const options = structuredClone(D6PlayerFoundationPreviewOptions);
      if (model === 'wave2') { options.parameterId = 'wave2-local-candidate-1'; delete options.roles; delete options.ratings; }
      return options;
    };
    window.q01Create = (seed, model = 'wave3') => v61CreateCareer('GER-2', seed, null, q01Options(model));
    window.q01Fixture = c => v62Fixtures(c).filter(f => !f.result && [f.homeId, f.awayId].includes(c.manager.managedClubId)).sort((a, b) => a.day - b.day)[0];
    window.q01BackupKeeper = (c, f, state, side) => {
      const oldPid = v64Active(state, side).find(pid => state.roles[pid] === 'gk'), existing = v64Player(c, f, side, oldPid);
      const backup = structuredClone(existing); backup.pid += ':q01-backup'; backup.history = []; backup.seasons = [];
      v153ReidentifyNewPlayer(backup);
      const club = c.world.clubs.find(x => x.id === (side === 0 ? f.homeId : f.awayId)); club.roster.push(backup);
      const plan = side === 0 ? f.plan.home : f.plan.away; plan.bench.push(backup.pid); v64Bench(state, side).push(backup.pid);
      state.minutes[backup.pid] = 0; state.fresh[backup.pid] = backup.fresh; state.stats[backup.pid] = { goals: 0, assists: 0, shots: 0 };
      return backup.pid;
    };
    window.q01State = (c, f) => { const state = v64MakeState(c, f); f.plan.home.coachId = null; f.plan.away.coachId = null; return state; };
  });
}

async function mainChecks(page) {
  return page.evaluate(() => {
    const checks = [], check = (name, value) => checks.push(q01Check(name, value));
    const c = q01Create('role-profiles'), all = [...c.world.clubs.flatMap(x => [...x.roster, ...x.youthPool]), ...c.world.market.freePlayers];
    const params = c.world.playerFoundation.roles;
    check('New marked world generates >500 valid role/routine/recommendation profiles', all.length > 500 && v61ValidateCareer(c) && all.every(p => {
      const model = p.playerModel, r = model?.roleModel;
      return model?.parameterId === 'wave3-local-candidate-1' && r?.version === 154 && r.routine[p.line] === params.routine.cap &&
        ['gk', 'def', 'mid', 'att'].every(pos => r.routine[pos] === (pos === p.line ? params.routine.cap : model.playablePositions.includes(pos) ? params.routine.secondaryStart : 0)) &&
        model.recommendedRoles.length >= 1 && model.recommendedRoles.length <= 3 && model.recommendedRoles.every(x => D6PlayerRoles.ROLE_IDS.includes(x.roleId) && model.playablePositions.includes(x.position));
    }));
    check('Candidate parameters and complete marked world survive JSON round trip', JSON.stringify(JSON.parse(JSON.stringify(c))) === JSON.stringify(c));
    const older = structuredClone(all.find(p => !p.keeper && p.age >= 33 && p.spd > 1));
    const olderSkills = v154Skills(older), previousBadge = structuredClone(older.playerModel.roleModel.bestRecommendedRole), fixedRecommendations = JSON.stringify(older.playerModel.recommendedRoles);
    const agingDelta = D6Aging.agingDelta(olderSkills, older.age + 1);
    v153AgePlayer(c, older, c.world.season + 1);
    const expectedBadge = D6PlayerRoles.bestRecommendedRole(older.playerModel.recommendedRoles, previousBadge, v154Skills(older), older.playerModel.roleModel.routine, params.suitability);
    check('Confirmed permanent aging updates physical skills and refreshes the best-role badge with existing hysteresis', older.spd < olderSkills.spd && D6Aging.SKILL_KEYS.every(key => older[key] === olderSkills[key] + agingDelta[key]) && JSON.stringify(older.playerModel.roleModel.bestRecommendedRole) === JSON.stringify(expectedBadge));
    check('Confirmed permanent aging leaves fixed recommendations byte-identical', JSON.stringify(older.playerModel.recommendedRoles) === fixedRecommendations);
    const agedOnce = JSON.stringify(older); v153AgePlayer(c, older, c.world.season + 1);
    check('Repeated aging season cannot change the ledger, skills or best-role badge', JSON.stringify(older) === agedOnce && older.playerModel.aging.processedSeasons.length === 1);
    for (const model of ['legacy', 'wave2']) {
      const old = q01Create('role-legacy-' + model, model), profiles = old.world.clubs.flatMap(x => [...x.roster, ...x.youthPool]), before = JSON.stringify(profiles);
      const f = q01Fixture(old), state = v64MakeState(old, f);
      v154Initialize(old, f, state); v155Initialize(old, state);
      check(model + ' profiles are not backfilled and matches keep the previous rating path', JSON.stringify(profiles) === before && !state.roleAssignments && !state.playerPerformance && profiles.every(p => !p.playerModel?.roleModel));
      const result = v64SimulateFixture(old, f);
      check(model + ' full compact fixture completes with no retroactive role record', result.homeGoals >= 0 && f.matchRecord.players.every(p => !p.roleRating) && profiles.every(p => !p.playerModel?.roleModel));
    }
    const f = q01Fixture(c), state = q01State(c, f);
    check('Native tactical roles remain separate from existing position groups and start neutral', Object.values(state.roles).every(x => ['gk', 'def', 'mid', 'att'].includes(x)) && Object.entries(state.roleAssignments).every(([pid, a]) => a.position === state.roles[pid] && a.orientation === 0 && v64PlayerInstructions(state, pid).length === 0));
    for (const side of [0, 1]) {
      const plan = side === 0 ? f.plan.home : f.plan.away;
      const fieldOut = v64Active(state, side).find(pid => state.roles[pid] !== 'gk'), fieldIn = v64Bench(state, side).find(pid => !v64Player(c, f, side, pid).keeper);
      v64SetOrientation(state, fieldOut, -1); const previous = structuredClone(state.roleAssignments[fieldOut]);
      v64SetPrematchSlot(c, f, state, side, plan.starters.indexOf(fieldOut), fieldIn);
      check('Prematch field replacement inherits place, role and orientation on side ' + side, !state.roleAssignments[fieldOut] && JSON.stringify(state.roleAssignments[fieldIn]) === JSON.stringify(previous));
      const keeperOut = v64Active(state, side).find(pid => state.roles[pid] === 'gk'), keeperIn = q01BackupKeeper(c, f, state, side), keeperPrevious = structuredClone(state.roleAssignments[keeperOut]);
      v64SetPrematchSlot(c, f, state, side, plan.starters.indexOf(keeperOut), keeperIn);
      check('Prematch keeper replacement inherits the keeper role on side ' + side, !state.roleAssignments[keeperOut] && JSON.stringify(state.roleAssignments[keeperIn]) === JSON.stringify(keeperPrevious));
    }
    for (let scene = 0; scene < 3; scene++) {
      const career = q01Create('compact-real-' + scene), fixture = q01Fixture(career), s = q01State(career, fixture);
      const before = Object.fromEntries([...v64Side(career, fixture, 0), ...v64Side(career, fixture, 1)].map(p => [p.pid, structuredClone(p.playerModel)]));
      const replacements = [];
      for (const side of [0, 1]) {
        const keeperIn = q01BackupKeeper(career, fixture, s, side), keeperOut = v64Active(s, side).find(pid => s.roles[pid] === 'gk');
        before[keeperIn] = structuredClone(v64Player(career, fixture, side, keeperIn).playerModel);
        const fieldOut = v64Active(s, side).find(pid => s.roles[pid] !== 'gk'), fieldIn = v64Bench(s, side).find(pid => !v64Player(career, fixture, side, pid).keeper);
        replacements.push({ side, fieldOut, fieldIn, keeperOut, keeperIn });
      }
      while (s.minute < 84) v64Step(career, fixture, s);
      for (const r of replacements) { v64QueueSubstitution(career, fixture, s, r.side, r.fieldOut, r.fieldIn); v64QueueSubstitution(career, fixture, s, r.side, r.keeperOut, r.keeperIn); }
      const assigned = Object.fromEntries(replacements.flatMap(r => [r.fieldOut, r.keeperOut]).map(pid => [pid, structuredClone(s.roleAssignments[pid])]));
      v64ExecutePending(career, fixture, s, 'Q01 actual controller interruption');
      check('Live both-side field and keeper replacements inherit assignments ' + scene, replacements.every(r => JSON.stringify(s.roleAssignments[r.fieldIn]) === JSON.stringify(assigned[r.fieldOut]) && JSON.stringify(s.roleAssignments[r.keeperIn]) === JSON.stringify(assigned[r.keeperOut])));
      while (s.phase !== 'finished') v64Step(career, fixture, s);
      const evidence = s.playerPerformance, actual = evidence.events;
      check('Compact fixture contains actual resolved actions and complete bounded phases ' + scene, actual.length > 100 && new Set(actual.map(e => e.id)).size === actual.length && actual.every(e => ['pass', 'receive', 'interception', 'shot', 'save'].includes(e.type) && typeof e.success === 'boolean') && Object.entries(s.minutes).every(([pid, n]) => n === 0 || Math.abs(evidence.phases[pid].reduce((sum, p) => sum + p.endMinute - p.startMinute, 0) - n) < 1e-8));
      const rated = Object.fromEntries(Object.keys(s.minutes).filter(pid => s.minutes[pid] > 0).map(pid => [pid, v155Rated(career, fixture, s, pid)]));
      const record = v64FinishFixture(career, fixture, s);
      check('Compact actual notes agree with calculator and short entries stay internal ' + scene, record.players.every(p => p.roleRating?.version === 155 && p.rating === rated[p.pid].visibleRating && (p.minutes < 20 ? p.rating === null : Number.isFinite(p.rating))) && replacements.every(r => s.minutes[r.fieldIn] > 0 && s.minutes[r.fieldIn] < 20));
      const booked = JSON.stringify(career), second = v64FinishFixture(career, fixture, s);
      check('Compact booking is exactly once, preserving fixed recommendations ' + scene, JSON.stringify(career) === booked && second === record && record.players.every(row => {
        const p = [...v64Side(career, fixture, 0), ...v64Side(career, fixture, 1)].find(x => x.pid === row.pid), development = p.playerModel.development;
        return development.processedAppearances.filter(a => a.id === rated[row.pid].id).length === 1 && development.seasonMinutes === row.minutes && p.playerModel.roleModel.processedFixtures.filter(id => id === fixture.id).length === 1 && (!before[p.pid] || JSON.stringify(before[p.pid].recommendedRoles) === JSON.stringify(p.playerModel.recommendedRoles));
      }));
      check('Compact routine books exactly the actual positional minutes without changing profile positions ' + scene, record.players.every(row => {
        const p = [...v64Side(career, fixture, 0), ...v64Side(career, fixture, 1)].find(x => x.pid === row.pid), minutes = {};
        for (const phase of evidence.phases[row.pid]) minutes[phase.position] = (minutes[phase.position] || 0) + phase.endMinute - phase.startMinute;
        return JSON.stringify(p.playerModel.roleModel.routine) === JSON.stringify(D6PositionRoutine.routineTransition(before[p.pid].roleModel.routine, minutes, career.world.playerFoundation.roles.routine)) && JSON.stringify(p.playerModel.playablePositions) === JSON.stringify(before[p.pid].playablePositions);
      }));
      const restored = JSON.parse(booked), savedFixture = v62Fixtures(restored).find(x => x.id === fixture.id), copyState = JSON.parse(JSON.stringify(s)), saveBefore = JSON.stringify(restored);
      v64FinishFixture(restored, savedFixture, copyState);
      check('Compact JSON restore/repeated finish leaves roles, learning, minutes and history unchanged ' + scene, JSON.stringify(restored) === saveBefore);
    }
    return checks;
  });
}

async function native(page, seed, mode, interrupts = false) {
  return page.evaluate(async ({ seed, mode, interrupts }) => {
    const checks = [], check = (name, value) => checks.push(q01Check(name, value));
    let rng = 12345; Math.random = () => { rng = (rng * 1664525 + 1013904223) >>> 0; return rng / 4294967296; };
    let career = q01Create(seed), club = v66Own(career); v66ChooseSponsor(career, club.id, club.sponsors[0].id); v124SetYouthBudget(career, 0);
    while (career.world.market.phase === 'open') await v66NextMarketDay(career);
    let fixture = q01Fixture(career), state = v64MakeState(career, fixture), ownSide = fixture.homeId === career.manager.managedClubId ? 0 : 1;
    if (mode === 'baseline') {
      delete state.roleAssignments; delete state.roleParameters; delete state.playerPerformance; state.orientation = {}; state.instructions = {};
      for (const side of [0, 1]) { const plan = side === 0 ? fixture.plan.home : fixture.plan.away; if (plan.coachId) for (const pid of v64Active(state, side)) v64SetInstructions(state, pid, v64AiInstruction(v64Player(career, fixture, side, pid), state.roles[pid], state.cells[pid])); }
    }
    if (interrupts) { fixture.plan.home.coachId = null; fixture.plan.away.coachId = null; q01BackupKeeper(career, fixture, state, ownSide); }
    career.world.activeMatch = { fixtureId: fixture.id, state }; v61CurrentCareer = career; match = null; v65WorldActive = null; state.phase = 'paused'; v98View = '2d';
    v65Show(v65Context()); clearInterval(v65WorldFrame); v103CanReplay = () => false; v65Resume(); clearInterval(v65WorldFrame);
    const initialProfiles = Object.fromEntries([...v64Side(career, fixture, 0), ...v64Side(career, fixture, 1)].map(p => [p.pid, structuredClone(p.playerModel)]));
    let ticks = 0, half = false, checkpoint = false, changedRole = false, fieldSub = null, keeperSub = null, quickChains = 0, receivedAt = null, completedBefore = 0;
    const roleStream = new Set();
    while (!match.finished && ticks++ < 16000) {
      let context = v65Context();
      if (context.state.phase === 'paused') { half ||= match.halftimePause > 0; v65Resume(); clearInterval(v65WorldFrame); }
      if (interrupts && state.minute >= 27 && !changedRole && !match.flight && !match.slide) {
        const pid = v64Active(state, ownSide).find(id => state.roles[id] !== 'gk' && v154Allowed(state, id).length > 1), choices = v154Allowed(state, pid), previous = state.roleAssignments[pid].roleId;
        v154SetRole(state, pid, choices.find(id => id !== previous)); v64SetOrientation(state, pid, 1); v65ApplyTactics(context); changedRole = pid;
      }
      if (interrupts && state.minute >= 53 && !checkpoint && !match.flight && !match.slide) {
        check('Native actual safe snapshot is available', v65Snapshot(context)); await v61WaitForStorage();
        const evidence = JSON.stringify(state.playerPerformance), snapshotStats = JSON.stringify(match.people.map(p => [p.pid, p.stats]));
        const restored = JSON.parse(JSON.stringify(career)); v61CurrentCareer = restored; career = restored; context = v65Context(); state = context.state; fixture = context.fixture;
        check('Native JSON restore preserves event IDs, phases and observed physical stats', v65Restore(context) && JSON.stringify(state.playerPerformance) === evidence && JSON.stringify(match.people.map(p => [p.pid, p.stats])) === snapshotStats);
        check('Native restored actors retain assigned role and coordination routine', match.people.every(p => p.tacticalRole === state.roleAssignments[p.pid].roleId && p.positionRoutine >= 0 && p.positionRoutine <= 1));
        checkpoint = true;
      }
      if (interrupts && state.minute >= 76 && !fieldSub) {
        const outPid = v64Active(state, ownSide).find(pid => state.roles[pid] !== 'gk'), inPid = v64Bench(state, ownSide).find(pid => !v64Player(career, fixture, ownSide, pid).keeper);
        fieldSub = { outPid, inPid, assignment: structuredClone(state.roleAssignments[outPid]) }; v64QueueSubstitution(career, fixture, state, ownSide, outPid, inPid);
      }
      if (interrupts && state.minute >= 84 && !keeperSub && !match.flight && !match.slide) {
        const outPid = v64Active(state, ownSide).find(pid => state.roles[pid] === 'gk'), inPid = v64Bench(state, ownSide).find(pid => v64Player(career, fixture, ownSide, pid).keeper);
        keeperSub = { outPid, inPid, assignment: structuredClone(state.roleAssignments[outPid]) }; v64QueueSubstitution(career, fixture, state, ownSide, outPid, inPid);
        // This controlled continuity scene supplies an actual native out-of-play
        // restart so queued changes have a legal interruption before full time.
        v55Out({ edge: 'right', x: v55Field.right, y: match.ball.y }, match.owner?.t ?? match.lastTouch ?? 0, 'Q01 controlled ball over the sideline');
      }
      const previousPasses = match.people.reduce((sum, p) => sum + p.stats.passes, 0);
      step(0.05 * MATCH_SPEED, 0.05); if (v65Context().state.phase === 'live' && !match.finished) v65AfterStep(v65Context());
      for (const p of match.people) if (p.tacticalRole) roleStream.add(p.tacticalRole);
      const completed = match.people.reduce((sum, p) => sum + p.stats.passComplete, 0), passes = match.people.reduce((sum, p) => sum + p.stats.passes, 0);
      if (completed > completedBefore) { receivedAt = match.elapsed / MATCH_SPEED; completedBefore = completed; }
      if (passes > previousPasses && receivedAt !== null) { if (match.elapsed / MATCH_SPEED - receivedAt < 0.5) quickChains++; receivedAt = null; }
    }
    if (!match.finished) throw Error('Native full match did not finish: ' + seed + '/' + mode);
    await v61WaitForStorage();
    const total = key => [...match.people, ...match.exitedPeople].reduce((sum, p) => sum + (p.stats[key] || 0), 0), record = fixture.matchRecord;
    check('Native full match finishes with actual halftime and recorded score', half && state.minute >= 90 && record && match.elapsed / MATCH_SPEED < 240);
    if (mode === 'roles') {
      check('Native actual roles remain attached to actors', roleStream.size >= 4 && match.people.every(p => p.tacticalRole === state.roleAssignments[p.pid]?.roleId));
      check('Native actual phase minutes equal played minutes', Object.entries(state.minutes).every(([pid, n]) => n === 0 || Math.abs((state.playerPerformance.phases[pid] || []).reduce((sum, p) => sum + p.endMinute - p.startMinute, 0) - n) < 1e-8));
      check('Native actual contacts and movement yield unique calculator notes', state.playerPerformance.events.length > 10 && new Set(state.playerPerformance.events.map(e => e.id)).size === state.playerPerformance.events.length && record.players.every(p => p.roleRating?.version === 155 && p.rating === v155Rated(career, fixture, state, p.pid).visibleRating));
      const before = JSON.stringify([...v64Side(career, fixture, 0), ...v64Side(career, fixture, 1)]); v64FinishFixture(career, fixture, state);
      check('Native repeated finish cannot double-book routine, development or historical note', JSON.stringify([...v64Side(career, fixture, 0), ...v64Side(career, fixture, 1)]) === before && record.players.every(row => {
        const p = [...v64Side(career, fixture, 0), ...v64Side(career, fixture, 1)].find(x => x.pid === row.pid), d = p.playerModel.development;
        return d.processedAppearances.filter(a => a.id === `${fixture.id}:${p.pid}`).length === 1 && JSON.stringify(p.playerModel.recommendedRoles) === JSON.stringify(initialProfiles[p.pid].recommendedRoles);
      }));
      const routineMismatch = record.players.map(row => {
        const p = [...v64Side(career, fixture, 0), ...v64Side(career, fixture, 1)].find(x => x.pid === row.pid), minutes = {};
        for (const phase of state.playerPerformance.phases[row.pid]) minutes[phase.position] = (minutes[phase.position] || 0) + phase.endMinute - phase.startMinute;
        const expected = D6PositionRoutine.routineTransition(initialProfiles[p.pid].roleModel.routine, minutes, career.world.playerFoundation.roles.routine);
        return { pid: p.pid, routine: p.playerModel.roleModel.routine, expected, positionMinutes: minutes, processed: p.playerModel.roleModel.processedFixtures, profileSame: JSON.stringify(p.playerModel.playablePositions) === JSON.stringify(initialProfiles[p.pid].playablePositions) };
      }).filter(p => JSON.stringify(p.routine) !== JSON.stringify(p.expected) || !p.profileSame);
      if (routineMismatch.length) throw Error('Native routine diagnostic ' + JSON.stringify(routineMismatch));
      check('Native routine books observed positional minutes while keeping fixed profiles', routineMismatch.length === 0);
      if (interrupts) {
        check('Native actual role change and checkpoint were exercised', changedRole && checkpoint && state.playerPerformance.phases[changedRole].length >= 2);
        const substitutionOkay = fieldSub && keeperSub && [fieldSub, keeperSub].every(r => state.substitutions.some(s => s.inPid === r.inPid) && state.roleAssignments[r.inPid]?.roleId === r.assignment.roleId && state.roleAssignments[r.inPid]?.orientation === r.assignment.orientation) && state.minutes[keeperSub.inPid] > 0 && state.minutes[keeperSub.inPid] < 20 && record.players.find(p => p.pid === keeperSub.inPid)?.rating === null && Number.isFinite(v155Rated(career, fixture, state, keeperSub.inPid).rating);
        if (!substitutionOkay) throw Error('Native substitution diagnostic ' + JSON.stringify({ fieldSub, keeperSub, substitutions: state.substitutions, assignments: state.roleAssignments, minutes: state.minutes, record: record.players }));
        check('Native field and keeper substitutions inherit role/orientation and preserve short internal rating', substitutionOkay);
      }
    }
    return { seed, mode, interrupts, checks, ticks, half, checkpoint, minutes: state.minute, simulationSeconds: match.elapsed / MATCH_SPEED, score: match.score,
      passes: total('passes'), complete: total('passComplete'), progressive: total('progressive'), shots: total('shots'), quickChains,
      roleCount: roleStream.size, eventTypes: state.playerPerformance ? Object.fromEntries(D6MatchRatings.EVENT_TYPES.map(type => [type, state.playerPerformance.events.filter(e => e.type === type).length])) : null,
      visibleRatings: record.players.filter(p => p.rating !== null).map(p => p.rating),
      evidence: interrupts ? { events: state.playerPerformance.events, phases: state.playerPerformance.phases, minutes: state.minutes, result: record } : undefined };
  }, { seed, mode, interrupts });
}

async function collectorChecks(page) {
  return page.evaluate(() => {
    const checks = [], check = (name, value) => checks.push(q01Check(name, value));
    const career = q01Create('collector-attribution'), fixture = q01Fixture(career), state = q01State(career, fixture);
    career.world.activeMatch = { fixtureId: fixture.id, state }; v61CurrentCareer = career;
    const context = v65Context(); v65WorldActive = context; v65CreateMatch(context); match.kickoff = null; state.minute = 1;
    for (const pid of [...state.active, ...state.awayActive]) state.minutes[pid] = 1;
    const own = match.people.filter(p => p.t === 0 && !p.keeper), passer = own[0], intended = own[1], actual = own[2], defender = match.people.find(p => p.t === 1 && !p.keeper), keeper = match.people.find(p => p.t === 1 && p.keeper);
    match.owner = passer; v155BeforeNative(match); passer.stats.passLost++; v155ObserveNative(context);
    check('Carried-ball loss without a real pass attempt cannot fabricate a failed pass', !state.playerPerformance.events.some(e => e.type === 'pass'));
    v155AttemptPass(match, passer, intended); passer.stats.passLost++; defender.stats.interceptions++; match.owner = null; match.flight = {};
    const before = state.playerPerformance.events.length; v155ObserveNative(context);
    check('Planned pass interception earns no pass/contact credit during unresolved flight', state.playerPerformance.events.length === before);
    match.flight = null; match.owner = defender; v155ObserveNative(context);
    check('Resolved pass loss and actually controlling interceptor are credited after contact', state.playerPerformance.events.some(e => e.playerId === passer.pid && e.type === 'pass' && e.success === false) && state.playerPerformance.events.some(e => e.playerId === defender.pid && e.type === 'interception' && e.success === true));
    v155AttemptPass(match, passer, intended); passer.stats.passComplete++; match.owner = actual; match.lastPass = { passer, receiver: actual, at: match.elapsed }; v155ObserveNative(context);
    check('Actual contact receiver replaces the intended receiver in high-ball credit', state.playerPerformance.events.some(e => e.type === 'receive' && e.playerId === actual.pid) && !state.playerPerformance.events.some(e => e.type === 'receive' && e.playerId === intended.pid));
    v155AttemptPass(match, passer, intended); passer.stats.passComplete++; match.owner = null; match.lastPass = null; const receives = state.playerPerformance.events.filter(e => e.type === 'receive').length; v155ObserveNative(context);
    check('Unknown actual receiver gets no invented receiving credit', state.playerPerformance.events.filter(e => e.type === 'receive').length === receives);
    passer.stats.shots++; match.flight = {}; const shots = state.playerPerformance.events.filter(e => e.type === 'shot').length; v155ObserveNative(context);
    check('Shot rating does not peek at the future before its actual flight resolves', state.playerPerformance.events.filter(e => e.type === 'shot').length === shots);
    match.flight = null; passer.stats.onTarget++; keeper.stats.saves++; match.owner = keeper; v155ObserveNative(context);
    const save = state.playerPerformance.events.find(e => e.type === 'save' && e.playerId === keeper.pid), shot = state.playerPerformance.events.filter(e => e.type === 'shot').at(-1);
    check('Resolved shot/save preserve missing pressure and keeper difficulty, with no automatic blame', shot?.success === true && save?.context.usefulness === 1 && save.context.difficulty === undefined && save.context.pressure === undefined && !state.playerPerformance.events.some(e => e.type === 'error'));
    const after = JSON.stringify(state.playerPerformance.events); v155ObserveNative(context);
    check('Repeated collector observations do not book the same native stat delta twice', JSON.stringify(state.playerPerformance.events) === after);
    const snapshots = [];
    for (const resolution of [0.1, 0.9]) {
      const fresh = q01State(career, structuredClone(fixture)); let calls = 0;
      v155CompactActions(career, fixture, fresh, 0, () => ++calls <= 3 ? 0.01 : resolution);
      snapshots.push(fresh.playerPerformance.events.find(e => e.type === 'pass').context);
    }
    check('Compact action context comes from the actual formation, independent of resolution RNG', JSON.stringify(snapshots[0]) === JSON.stringify(snapshots[1]) && Number.isFinite(snapshots[0].progressMetres));
    const shotScenes = [];
    for (const movedHelper of [false, true]) {
      const scenarioFixture = structuredClone(fixture), fresh = q01State(career, scenarioFixture);
      let calls = 0; const resolve = () => ++calls === 7 ? 0.99 : 0.01;
      if (movedHelper) {
        const attackers = v64Active(fresh, 0).filter(pid => fresh.roles[pid] !== 'gk');
        const scorer = v64PickAttacker(attackers, pid => 1 + (['poacher', 'striker'].includes(fresh.roleAssignments[pid].roleId) ? 1 : 0), () => 0.01);
        const helper = v64PickAttacker(attackers.filter(pid => pid !== scorer), pid => 1 + (['playmaker', 'winger', 'target-player'].includes(fresh.roleAssignments[pid].roleId) ? 1 : 0), () => 0.01);
        const fromCell = fresh.cells[helper], candidates = Array.from({ length: 35 }, (_, cell) => cell).filter(cell => !Object.values(fresh.cells).includes(cell) && D6TacticTransitions.allowedRoles(v154Zone(cell)).includes(fresh.roleAssignments[helper].roleId));
        const toCell = candidates.sort((a, b) => Math.abs(b - fromCell) - Math.abs(a - fromCell))[0];
        v64MoveCell(career, scenarioFixture, fresh, 0, helper, toCell);
      }
      v155CompactActions(career, scenarioFixture, fresh, 0, resolve);
      shotScenes.push({ pass: fresh.playerPerformance.events.find(e => e.type === 'pass'), shot: fresh.playerPerformance.events.find(e => e.type === 'shot'), save: fresh.playerPerformance.events.find(e => e.type === 'save') });
    }
    check('Compact shot/save context follows the actual scorer, not the preceding pass helper', shotScenes.every(s => s.shot && s.save) && shotScenes[0].shot.playerId === shotScenes[1].shot.playerId && JSON.stringify(shotScenes[0].pass.context) !== JSON.stringify(shotScenes[1].pass.context) && JSON.stringify(shotScenes[0].shot.context) === JSON.stringify(shotScenes[1].shot.context) && JSON.stringify(shotScenes[0].save.context) === JSON.stringify(shotScenes[1].save.context));
    v65WorldActive = null; match = null; return checks;
  });
}

(async () => {
  const server = require('../../ui-redesign/serve.cjs').createServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const origin = `http://127.0.0.1:${server.address().port}`;
  async function page() {
    const p = await browser.newPage(); p.on('pageerror', e => report.errors.push(e.message));
    await p.route('**/source/**', route => {
      const rel = decodeURIComponent(new URL(route.request().url()).pathname.slice(8));
      const bytes = rel === 'index.html' && built ? buildHtml : frozen.get(rel); if (!bytes) return route.continue();
      return route.fulfill({ body: bytes, contentType: rel.endsWith('.js') ? 'text/javascript' : rel.endsWith('.css') ? 'text/css' : 'text/html' });
    });
    await p.goto(origin + '/source/index.html?engine=browser&players=wave3');
    await p.waitForFunction(() => window.D6MatchRatings && window.D6PlayerRoles && window.D6PlayerFoundationPreviewOptions && window.userMeshyMatchReady, null, { timeout: 60000 });
    await installHelpers(p); return p;
  }
  try {
    const p = await page(); report.checks.push(...await mainChecks(p)); report.checks.push(...await collectorChecks(p)); await p.close();
    const sample = await page(); const sampleResult = await native(sample, 'roles-native-interruptions', 'roles', true); await sample.close();
    report.checks.push(...sampleResult.checks); fs.writeFileSync(path.join(out, built ? 'native-interruptions-build.json' : 'native-interruptions.json'), JSON.stringify(sampleResult, null, 2));
    report.matches.push({ ...sampleResult, evidence: undefined }); console.log(JSON.stringify({ stage: 'native-smoke', pass: true, checks: report.checks.length, eventTypes: sampleResult.eventTypes }));
    const seeds = Array.from({ length: smoke ? 1 : 10 }, (_, i) => 'roles-balance-' + i);
    for (const seed of seeds) for (const mode of ['baseline', 'roles']) {
      const p = await page(); const row = await native(p, seed, mode); await p.close(); report.matches.push(row); console.log(JSON.stringify({ seed, mode, passes: row.passes, quickChains: row.quickChains, shots: row.shots, score: row.score }));
    }
    const pairRows = report.matches.filter(x => !x.interrupts), sum = (mode, key) => pairRows.filter(x => x.mode === mode).reduce((n, r) => n + r[key], 0);
    report.balance = { samplePairs: seeds.length, baseline: Object.fromEntries(['passes', 'complete', 'progressive', 'shots', 'quickChains'].map(k => [k, sum('baseline', k)])), roles: Object.fromEntries(['passes', 'complete', 'progressive', 'shots', 'quickChains'].map(k => [k, sum('roles', k)])), caveat: 'Same generated players and seed; v152 remains active in baseline. Local sample only, no comprehensive balance claim.' };
    assert.deepEqual(report.errors, []); report.pass = true;
    report.changedDuringRun = Object.keys(report.sourceHashes).filter(f => !fs.existsSync(f) || hash(fs.readFileSync(f)) !== report.sourceHashes[f]);
    if (built) report.buildChangedDuringRun = hash(fs.readFileSync('outputs/index.html')) !== report.buildHash;
    console.log(JSON.stringify({ pass: true, smoke, checks: report.checks.length, matches: report.matches.length, balance: report.balance, changedDuringRun: report.changedDuringRun }));
  } catch (error) { report.pass = false; report.failure = error.stack; throw error; }
  finally { await browser.close(); await new Promise(resolve => server.close(resolve)); fs.writeFileSync(path.join(out, built ? 'build-tests.json' : smoke ? 'smoke-tests.json' : 'source-tests.json'), JSON.stringify(report, null, 2)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
