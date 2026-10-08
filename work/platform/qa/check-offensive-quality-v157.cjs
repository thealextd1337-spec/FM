'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const out = path.resolve('outputs/platform/offensive-quality'); fs.mkdirSync(out, { recursive: true });
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function archiveRolesDelivery() {
  const historical = path.join(out, 'historical/roles-wave3-v156'), manifestFile = path.join(historical, 'manifest.json');
  if (fs.existsSync(manifestFile)) return JSON.parse(fs.readFileSync(manifestFile));
  fs.mkdirSync(historical, { recursive: true });
  const evidence = path.resolve('outputs/platform/role-performance'), manifest = { label: 'Completed v156 roles delivery, before offensive-quality v157', copiedEvidence: [], copiedVerifiedSources: [], unavailableSourceBytes: [] };
  for (const name of ['source-tests.json', 'build-tests.json', 'native-interruptions.json', 'native-interruptions-build.json', 'native-context-tests.json', 'README.md']) {
    const file = path.join(evidence, name); if (!fs.existsSync(file)) continue;
    const bytes = fs.readFileSync(file); fs.writeFileSync(path.join(historical, name), bytes); manifest.copiedEvidence.push({ file: name, sha256: hash(bytes) });
  }
  const old = JSON.parse(fs.readFileSync(path.join(evidence, 'source-tests.json')));
  for (const [file, expected] of Object.entries(old.sourceHashes)) {
    const bytes = fs.existsSync(file) ? fs.readFileSync(file) : null;
    if (!bytes || hash(bytes) !== expected) { manifest.unavailableSourceBytes.push({ file, expectedHash: expected, currentHash: bytes ? hash(bytes) : null }); continue; }
    const destination = path.join(historical, file); fs.mkdirSync(path.dirname(destination), { recursive: true }); fs.writeFileSync(destination, bytes);
    manifest.copiedVerifiedSources.push({ file, sha256: expected });
  }
  const buildReport = JSON.parse(fs.readFileSync(path.join(evidence, 'build-tests.json'))), build = fs.readFileSync('outputs/index.html');
  if (hash(build) === buildReport.buildHash) { fs.writeFileSync(path.join(historical, 'index-built.html'), build); manifest.verifiedBuildHash = buildReport.buildHash; }
  else manifest.unavailableBuild = { expectedHash: buildReport.buildHash, currentHash: hash(build) };
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n'); return manifest;
}
const manifest = archiveRolesDelivery();
if (process.argv.includes('--archive-only')) { console.log(JSON.stringify({ archived: manifest.copiedEvidence.length, verifiedSources: manifest.copiedVerifiedSources.length, unavailableSources: manifest.unavailableSourceBytes, verifiedBuildHash: manifest.verifiedBuildHash })); }
else run().catch(error => { console.error(error); process.exitCode = 1; });

async function installRecorder(page) {
  await page.evaluate(() => {
    window.o157Install = () => {
      const d = window.o157 = { fixtureId: v65WorldActive.state.fixtureId, sequence: 0, passes: [], shots: [], offsides: [], action: null, resolving: null, lastResolvedPass: null, teleports: new Set(), contacts: new Set(), sourceMismatches: [] };
      const seconds = () => match.elapsed / MATCH_SPEED, point = p => ({ x: p.x, y: p.y });
      const actor = pid => [...match.people, ...match.exitedPeople].find(p => p.pid === pid);
      const wrap = (original, build) => function (...args) { const previous = d.action; d.action = build(...args); try { return original.apply(this, args); } finally { d.action = previous; } };
      v55GroundPass = wrap(v55GroundPass, (p, q, kind = 'pass') => ({ actor: p, kind: 'direct', passKind: kind, intendedReceiverId: q.pid }));
      v55HighPass = wrap(v55HighPass, (p, q, options = {}) => ({ actor: p, kind: options.cross ? 'cross' : 'high', intendedReceiverId: q.pid }));
      v150SpacePass = wrap(v150SpacePass, (p, { runner = null }) => ({ actor: p, kind: 'space', intendedReceiverId: runner?.pid || null }));
      v55Shoot = wrap(v55Shoot, (p, kind = 'shot') => ({ actor: p, kind: 'shot', shotKind: kind }));
      beginKickoff = wrap(beginKickoff, () => ({ actor: match.kickoff.kicker, kind: 'restart', intendedReceiverId: match.kickoff.support.pid }));
      if (typeof v157PassLead === 'function') { const baseLead = v157PassLead; v157PassLead = function (...args) { const lead = baseLead.apply(this, args); if (lead && d.action) d.action.nominalTarget = point(lead); return lead; }; }
      const baseFly = fly;
      fly = function (target, duration, done) {
        const action = d.action || (match.kickoff?.phase === 'rolling' && v102Release?.person === match.kickoff.kicker ? { actor: match.kickoff.kicker, kind: 'restart', intendedReceiverId: match.kickoff.support.pid } : null), p = action?.actor;
        if (!p) return baseFly.apply(this, arguments);
        const from = point(v102Release?.contact || match.ball), s = v150Scale();
        const row = { id: ++d.sequence, playerId: p.pid, team: p.t, kind: action.kind, shotKind: action.shotKind, passKind: action.passKind, intendedReceiverId: action.intendedReceiverId, minute: v65WorldActive.state.minute, releaseSeconds: seconds(), from, target: point(target), status: 'pending', actualReceiverId: null, directTouch: v127OneTouchRelease?.person === p };
        if (action.kind === 'shot') {
          const goal = { x: .5, y: p.t === 0 ? v55Field.top : v55Field.bottom }, rivals = match.people.filter(q => q.t !== p.t && !q.keeper);
          const longitudinal = Math.abs((goal.y - from.y) * s.y), lateral = Math.abs((goal.x - from.x) * s.x);
          row.distanceMetres = v122Metres(from, goal); row.angleDegrees = Math.atan2(lateral, Math.max(.001, longitudinal)) * 180 / Math.PI;
          row.laneClearanceMetres = Math.min(50, ...rivals.map(q => { const g = passLaneGeometry(q, from, goal); return g ? v122Metres(q, g) : 50; }));
          row.nearestOpponentMetres = Math.min(50, ...rivals.map(q => v122Metres(q, from)));
          row.usefulGeometry = row.distanceMetres <= 18 && row.angleDegrees <= 60 && row.laneClearanceMetres > 1.4;
          d.shots.push(row);
        } else {
          const q = actor(action.intendedReceiverId), attempt = match.performancePasses?.[p.pid];
          row.releaseRangeMetres = v122Metres(from, target); row.progressMetres = (target.y - from.y) * (p.t === 0 ? -1 : 1) * s.y;
          row.receiverPointAtRelease = q ? point(q) : null; row.receiverGapAtReleaseMetres = q ? v122Metres(q, target) : null;
          row.nominalTarget = action.nominalTarget ? point(action.nominalTarget) : null; row.receiverMotionAtRelease = q?.offenseMotion ? { ...q.offenseMotion } : null;
          row.actionContext = attempt ? structuredClone(attempt.context) : null;
          row.nearestOpponentAtPasserMetres = Math.min(50, ...match.people.filter(q => q.t !== p.t && !q.keeper).map(q => v122Metres(q, from)));
          d.passes.push(row);
        }
        const result = baseFly.call(this, target, duration, function (...args) {
          const previous = d.resolving; d.resolving = row;
          try { return done.apply(this, args); }
          finally {
            row.flightResolvedSeconds = seconds(); const q = actor(row.intendedReceiverId);
            row.receiverGapAtFlightEndMetres = q ? v122Metres(q, row.target) : null;
            row.ownerAtFlightEnd = match.owner ? { playerId: match.owner.pid, team: match.owner.t } : null;
            d.resolving = previous;
          }
        });
        row.flightSeconds = match.flight ? match.flight.duration / MATCH_SPEED : null;
        return result;
      };
      const baseReceive = v150Receive;
      v150Receive = function (m, plan, p, contact) {
        const row = d.passes.findLast(r => r.playerId === plan.passer.pid && r.kind === 'space' && r.status === 'pending');
        if (row) { row.observedContactId = p.pid; row.observedContactTeam = p.t; row.observedContactPoint = point(contact); }
        return baseReceive.apply(this, arguments);
      };
      const baseLose = v150Lose;
      v150Lose = function (m, plan, reason = 'unreached') {
        const row = d.passes.findLast(r => r.playerId === plan.passer.pid && r.kind === 'space' && r.status === 'pending');
        if (row && !plan.settled) row.observedSpaceLossReason = reason;
        return baseLose.apply(this, arguments);
      };
      const baseWhistle = v55WhistleOffside;
      v55WhistleOffside = function (snapshot, p) {
        const row = d.resolving || d.passes.findLast(r => r.status === 'pending');
        d.offsides.push({ playerId: p.pid, team: p.t, minute: v65WorldActive.state.minute, seconds: seconds(), passId: row?.kind !== 'shot' ? row?.id : null });
        if (row && row.kind !== 'shot') { row.status = 'offside'; row.resolvedSeconds = seconds(); row.offenderId = p.pid; }
        return baseWhistle.apply(this, arguments);
      };
      const baseOneTouch = v127TryOneTouch;
      v127TryOneTouch = function (p, contact, from) {
        const row = d.resolving;
        if (row && row.kind !== 'shot' && p.t === row.team) { row.observedContactId = p.pid; row.observedContactPoint = point(contact); }
        return baseOneTouch.apply(this, arguments);
      };
      const baseEvent = v155Event;
      v155Event = function (state, pid, type, success, context = {}) {
        const result = baseEvent.apply(this, arguments); if (state.fixtureId !== d.fixtureId) return result;
        const p = actor(pid);
        if (type === 'pass') {
          const row = d.passes.find(r => r.playerId === pid && !r.performanceEventId && ['pending', 'offside'].includes(r.status));
          if (row) {
            row.performanceEventId = state.playerPerformance.events.at(-1).id; row.resolvedSeconds = seconds(); row.resolutionContext = structuredClone(context);
            if (row.status !== 'offside') row.status = success ? 'complete' : 'failed';
            const receiver = row.observedContactId ? actor(row.observedContactId) : match.lastPass?.passer?.pid === pid ? match.lastPass.receiver : match.owner?.t === p.t && match.owner?.pid !== pid ? match.owner : null;
            if (success && receiver) { row.actualReceiverId = receiver.pid; row.receiverPoint = point(row.observedContactPoint || receiver); row.actualProgressMetres = (row.receiverPoint.y - row.from.y) * (p.t === 0 ? -1 : 1) * v150Scale().y; }
            d.lastResolvedPass = row;
          } else d.sourceMismatches.push({ type, pid, success, minute: state.minute, reason: 'No observed release for native pass event' });
        } else if (type === 'receive') {
          const row = d.lastResolvedPass;
          if (row?.status === 'complete') { row.actualReceiverId = pid; row.receiverPoint = point(row.observedContactPoint || p); row.receptionContext = structuredClone(context); row.actualProgressMetres = (row.receiverPoint.y - row.from.y) * (p.t === 0 ? -1 : 1) * v150Scale().y; }
        } else if (type === 'shot') {
          const row = d.shots.find(r => r.playerId === pid && r.status === 'pending');
          if (row) { row.status = 'resolved'; row.resolvedSeconds = seconds(); row.onTarget = success; row.resolutionContext = structuredClone(context); }
          else d.sourceMismatches.push({ type, pid, minute: state.minute, reason: 'No observed release for native shot event' });
        }
        return result;
      };
      const baseSpot = v50Spot;
      v50Spot = function (p, ...args) { d.teleports.add(p.pid); return baseSpot.call(this, p, ...args); };
      const baseSeparate = v56Separate;
      v56Separate = function (...args) { const before = new Map(match.people.map(p => [p.pid, point(p)])); d.beforeSeparation = before; const result = baseSeparate.apply(this, args); for (const p of match.people) { const b = before.get(p.pid); if (b && Math.hypot(p.x - b.x, p.y - b.y) > 1e-10) d.contacts.add(p.pid); } return result; };
    };
  });
}

async function fullMatch(page, seed, mode, interrupts = false) {
  return page.evaluate(async ({ seed, mode, interrupts }) => {
    const checks = [], check = (name, value) => { if (!value) throw Error(name); checks.push(name); };
    let rng = 12345; Math.random = () => { rng = (rng * 1664525 + 1013904223) >>> 0; return rng / 4294967296; };
    let career = v61CreateCareer('GER-2', seed, null, structuredClone(D6PlayerFoundationPreviewOptions)), club = v66Own(career);
    v66ChooseSponsor(career, club.id, club.sponsors[0].id); v124SetYouthBudget(career, 0);
    while (career.world.market.phase === 'open') await v66NextMarketDay(career);
    let fixture = v62Fixtures(career).filter(f => !f.result && [f.homeId, f.awayId].includes(career.manager.managedClubId)).sort((a, b) => a.day - b.day)[0], state = v64MakeState(career, fixture);
    const ownSide = fixture.homeId === career.manager.managedClubId ? 0 : 1;
    career.world.activeMatch = { fixtureId: fixture.id, state }; v61CurrentCareer = career; match = null; v65WorldActive = null; state.phase = 'paused'; v98View = '2d';
    v65Show(v65Context()); clearInterval(v65WorldFrame); v103CanReplay = () => false; v65Resume(); clearInterval(v65WorldFrame);
    if (mode === 'baseline') delete match.attackFlow.qualityVersion;
    check('Both variants retain actual wave3 roles, ratings and v152', !!state.roleAssignments && !!state.playerPerformance && match.attackFlow.version === 152);
    check('Only the candidate has quality marker157', mode === 'baseline' ? !Object.hasOwn(match.attackFlow, 'qualityVersion') : match.attackFlow.qualityVersion === 157);
    o157Install();
    const initialProfiles = Object.fromEntries([...v64Side(career, fixture, 0), ...v64Side(career, fixture, 1)].map(p => [p.pid, structuredClone(p.playerModel)]));
    const ticksCpu = [], runs = [], playerMotion = {}, displacementDiagnostics = [], wallStart = performance.now(); let ticks = 0, half = false, checkpoint = false, roleChanged = false, restartExcluded = 0, collisionExcluded = 0;
    while (!match.finished && ticks++ < 16000) {
      let context = v65Context();
      if (context.state.phase === 'paused') { half ||= match.halftimePause > 0; v65Resume(); clearInterval(v65WorldFrame); }
      if (interrupts && state.minute >= 27 && !roleChanged && !match.flight && !match.slide) {
        const pid = v64Active(state, ownSide).find(id => state.roles[id] !== 'gk' && v154Allowed(state, id).length > 1), role = v154Allowed(state, pid).find(id => id !== state.roleAssignments[pid].roleId);
        v154SetRole(state, pid, role); v64SetOrientation(state, pid, 1); v65ApplyTactics(context); roleChanged = true;
      }
      if (interrupts && state.minute >= 53 && !checkpoint && !match.flight && !match.slide) {
        check('New quality fixture permits native safe checkpoint', v65Snapshot(context)); await v61WaitForStorage();
        const flow = JSON.stringify(match.attackFlow), performanceLedger = JSON.stringify(state.playerPerformance), motion = JSON.stringify(match.people.map(p => [p.pid, p.offenseMotion]));
        career = JSON.parse(JSON.stringify(career)); v61CurrentCareer = career; context = v65Context(); state = context.state; fixture = context.fixture;
        check('Native JSON restore retains quality, combination, motion and actual ratings ledger', v65Restore(context) && JSON.stringify(match.attackFlow) === flow && JSON.stringify(state.playerPerformance) === performanceLedger && JSON.stringify(match.people.map(p => [p.pid, p.offenseMotion])) === motion);
        checkpoint = true;
      }
      const paused = v121PositioningPaused(match), owner = match.owner?.pid, beforePhase = { kickoff: match.kickoff?.phase, setPiece: match.setPiece?.type, throwIn: Boolean(match.throwIn), flight: Boolean(match.flight) }, before = new Map(match.people.map(p => [p.pid, { x: p.x, y: p.y, keeper: p.keeper, slide: p.slideActive, body: p.offenseMotion ? { ...p.offenseMotion } : null }]));
      o157.teleports.clear(); o157.contacts.clear(); o157.beforeSeparation = null; const start = performance.now(); step(.05 * MATCH_SPEED, .05); ticksCpu.push(performance.now() - start);
      if (v65Context().state.phase === 'live' && !match.finished) v65AfterStep(v65Context());
      if (!paused && !v121PositioningPaused(match)) for (const p of match.people) {
        const prev = before.get(p.pid); if (!prev || p.keeper || prev.slide || p.slideActive) continue;
        if (o157.teleports.has(p.pid)) { restartExcluded++; continue; }
        if (o157.contacts.has(p.pid)) collisionExcluded++;
        const observed = o157.beforeSeparation?.get(p.pid) || p, distance = v122Metres(prev, observed), pace = distance / .05; if (distance < .002) continue;
        if (pace > 10 && displacementDiagnostics.length < 40) displacementDiagnostics.push({ playerId: p.pid, tick: ticks, minute: state.minute, pace, before: prev, after: { ...observed, body: p.offenseMotion ? { ...p.offenseMotion } : null }, beforePhase, afterPhase: { kickoff: match.kickoff?.phase, setPiece: match.setPiece?.type, throwIn: Boolean(match.throwIn), flight: Boolean(match.flight) } });
        const kind = owner === p.pid && match.owner?.pid === p.pid ? 'carrier' : 'offball';
        runs.push({ kind, pace }); const row = playerMotion[p.pid] ||= { playerId: p.pid, skillSpeed: p.spd, samples: 0, distanceMetres: 0, maxPace: 0, sprintSamples: 0 };
        row.samples++; row.distanceMetres += distance; row.maxPace = Math.max(row.maxPace, pace); if (pace >= 5) row.sprintSamples++;
      }
    }
    check('Native full match completes with halftime and unchanged clock model', match.finished && half && state.minute >= 90 && match.elapsed / MATCH_SPEED < 240);
    if (displacementDiagnostics.length) throw Error('Unexpected native field-player displacement outside recorded restart/slide/contact adjustments: ' + JSON.stringify(displacementDiagnostics.slice(0, 4)));
    check('Actual native field-player movement has no unexplained boundary teleport', displacementDiagnostics.length === 0);
    await v61WaitForStorage(); const record = fixture.matchRecord;
    check('Actual minute phases and rating bookings remain native and bounded', record && Object.entries(state.minutes).every(([pid, n]) => !n || Math.abs(state.playerPerformance.phases[pid].reduce((sum, p) => sum + p.endMinute - p.startMinute, 0) - n) < 1e-8) && record.players.every(row => row.rating === v155Rated(career, fixture, state, row.pid).visibleRating));
    const allPlayers = [...v64Side(career, fixture, 0), ...v64Side(career, fixture, 1)], beforeBook = JSON.stringify(allPlayers); v64FinishFixture(career, fixture, state);
    check('Repeated finalization cannot duplicate learning or routine', JSON.stringify(allPlayers) === beforeBook && record.players.every(row => {
      const p = allPlayers.find(p => p.pid === row.pid); return p.playerModel.development.processedAppearances.filter(x => x.id === `${fixture.id}:${p.pid}`).length === 1 && JSON.stringify(p.playerModel.recommendedRoles) === JSON.stringify(initialProfiles[p.pid].recommendedRoles);
    }));
    if (interrupts) check('Actual role change and checkpoint were both exercised', roleChanged && checkpoint);
    const total = key => [...match.people, ...match.exitedPeople].reduce((sum, p) => sum + (p.stats[key] || 0), 0), completed = o157.passes.filter(p => p.status === 'complete');
    if (o157.passes.length !== total('passes')) throw Error('Recorder release diagnostic ' + JSON.stringify({ recorded: o157.passes.length, passes: total('passes'), kinds: o157.passes.map(p => [p.kind, p.playerId]), stats: match.people.map(p => [p.pid, p.stats.passes]), mismatches: o157.sourceMismatches.slice(0, 5) }));
    check('Recorder observes every actual native pass release', o157.passes.length === total('passes'));
    check('Recorder observes every actual completed native pass', completed.length === total('passComplete'));
    const combinations = []; let previous = null, quickAttempts = 0, quickCompleted = 0;
    for (const p of [...o157.passes].sort((a, b) => a.releaseSeconds - b.releaseSeconds || a.id - b.id)) {
      const prev = previous, gap = prev ? p.releaseSeconds - prev.resolvedSeconds : null;
      const connected = prev && prev.team === p.team && prev.actualReceiverId === p.playerId && gap >= -.051 && gap <= 1.5;
      if (connected && gap < .5) { quickAttempts++; if (p.status === 'complete') quickCompleted++; }
      if (connected && p.status === 'complete' && p.receiverPoint) {
        const progress = (p.receiverPoint.y - prev.from.y) * (p.team === 0 ? -1 : 1) * v150Scale().y;
        if (progress >= 3) combinations.push({ firstPassId: prev.id, secondPassId: p.id, team: p.team, progressMetres: progress, secondsToRelease: gap });
      }
      previous = p.status === 'complete' ? p : null;
    }
    const stats = { passes: total('passes'), complete: total('passComplete'), progressive: total('progressive'), nativePassLost: total('passLost'), shots: total('shots'), observedShotReleases: o157.shots.length, onTarget: total('onTarget'), goals: match.score[0] + match.score[1], offsides: o157.offsides.length, usefulCompletedCombinations: combinations.length, quickConnectedAttempts: quickAttempts, quickCompletedChains: quickCompleted, usefulShots: o157.shots.filter(s => s.usefulGeometry).length };
    const kinds = Object.fromEntries(['direct', 'space', 'high', 'cross', 'restart'].map(kind => [kind, Object.fromEntries(['pending', 'complete', 'failed', 'offside'].map(status => [status, o157.passes.filter(p => p.kind === kind && p.status === status).length]))]));
    const summarize = values => { const sorted = [...values].sort((a, b) => a - b); return { samples: values.length, mean: values.reduce((a, b) => a + b, 0) / Math.max(1, values.length), p95: sorted[Math.floor(sorted.length * .95)] || 0, max: sorted.at(-1) || 0 }; };
    return { seed, mode, interrupts, checks, stats, passKinds: kinds, minutes: state.minute, ticks, score: match.score, nativeSeconds: match.elapsed / MATCH_SPEED, wallMilliseconds: performance.now() - wallStart, nativeTickMilliseconds: summarize(ticksCpu), motion: { carrier: summarize(runs.filter(r => r.kind === 'carrier').map(r => r.pace)), offball: summarize(runs.filter(r => r.kind === 'offball').map(r => r.pace)), restartExcluded, collisionExcluded, players: Object.values(playerMotion) }, diagnostics: { passes: o157.passes, shots: o157.shots, offsides: o157.offsides, usefulCombinations: combinations, displacementDiagnostics, sourceMismatches: o157.sourceMismatches }, record };
  }, { seed, mode, interrupts });
}

async function controlledMotion(page) {
  return page.evaluate(async () => {
    const checks = [], evidence = {}, check = (name, value) => { if (!value) throw Error(name); checks.push(name); };
    const career = v61CreateCareer('GER-2', 'quality-controlled-motion', null, structuredClone(D6PlayerFoundationPreviewOptions)), fixture = v62Fixtures(career).filter(f => !f.result && [f.homeId, f.awayId].includes(career.manager.managedClubId)).sort((a, b) => a.day - b.day)[0], state = v64MakeState(career, fixture);
    career.world.activeMatch = { fixtureId: fixture.id, state }; v61CurrentCareer = career; v65WorldActive = v65Context(); v65CreateMatch(v65WorldActive);
    const original = match, originals = match.people.filter(p => !p.keeper && p.t === 0), scale = v150Scale();
    const beforeRender = JSON.stringify(match); for (const p of match.people) { v157Movement(match, p); v123ControlDirection(p); }
    check('Native rendering before the first tick cannot allocate body state or change match JSON', JSON.stringify(match) === beforeRender && match.people.every(p => !p.offenseMotion));
    const substituteCareer = structuredClone(career), substituteFixture = v62Fixtures(substituteCareer).find(f => f.id === fixture.id), substituteState = v64MakeState(substituteCareer, substituteFixture), side = v65Side(0, v65WorldActive.ownSide), plan = side === 0 ? substituteFixture.plan.home : substituteFixture.plan.away;
    const inPid = v64Bench(substituteState, side).find(pid => !v64Player(substituteCareer, substituteFixture, side, pid).keeper);
    v64SetPrematchSlot(substituteCareer, substituteFixture, substituteState, side, plan.starters.indexOf(originals[0].pid), inPid);
    const substitute = v65PhysicalPlayer({ career: substituteCareer, fixture: substituteFixture, state: substituteState, ownSide: v65WorldActive.ownSide }, 0, inPid), beforeSubstitute = JSON.stringify(substitute);
    v157Movement(match, substitute); v123ControlDirection(substitute);
    check('Rendering an actual newly substituted physical player factory result stays read-only', JSON.stringify(substitute) === beforeSubstitute && !substitute.offenseMotion);
    function fresh({ massKg = 74, speed = 12, heading = Math.PI, marked = true } = {}) {
      const p = structuredClone(originals[0]), q = structuredClone(originals[1]);
      Object.assign(p, { x: .5, y: .65, tx: .5, ty: .2, spd: speed, weightKg: massKg, slideActive: null }); delete p.offenseMotion;
      Object.assign(q, { x: .5, y: .4, tx: .5, ty: .2, assignedLine: 'att', tacticalRole: 'poacher', slideActive: null }); delete q.offenseMotion;
      const m = { ...original, people: [p, q], exitedPeople: [], owner: null, flight: null, rebound: null, kickoff: null, setPiece: null, throwIn: null, goalPause: 0, halftimePause: 0, finished: false, ball: { x: p.x, y: p.y }, elapsed: 0, attackFlow: { version: 152, ...(marked ? { qualityVersion: 157 } : {}), intents: { [p.pid]: { type: 'depth', team: 0, until: 100 } } } };
      match = m; if (marked) v157Body(p).heading = heading; return { m, p, q };
    }
    const velocity = p => Math.hypot(p.offenseMotion.vx, p.offenseMotion.vy);
    {
      const { m, p } = fresh(), samples = [];
      for (let i = 0; i < 20; i++) { v157Move(m, p, .05); samples.push(velocity(p)); }
      check('Actual native sprint accelerates through a bounded speed ramp', samples[0] > 0 && samples[0] < samples[9] && samples[9] <= samples[19] && samples[19] <= v157Pace(m, p) + 1e-8 && samples.every((v, i) => !i || v >= samples[i - 1] - 1e-8)); evidence.ramp = samples;
      function accelerate(massKg, speed = 12) { const { m, p } = fresh({ massKg, speed }); for (let i = 0; i < 4; i++) v157Move(m, p, .05); return { speed: velocity(p), distance: (.65 - p.y) * scale.y }; }
      const light = accelerate(60), heavy = accelerate(100), slow = accelerate(74, 4), fast = accelerate(74, 18);
      check('Same skills with heavier mass produce slower native acceleration', light.speed > heavy.speed && light.distance > heavy.distance);
      check('Scalar speed ability ordering survives identical native mass and targets', fast.speed > slow.speed && fast.distance > slow.distance); evidence.acceleration = { light, heavy, slow, fast };
      function stop(massKg) { const { m, p } = fresh({ massKg }); p.offenseMotion.vy = -5; const start = p.y; let frames = 0; while (velocity(p) > .0001 && frames++ < 80) { p.tx = p.x; p.ty = p.y; v157Move(m, p, .05); } return { frames, distance: (start - p.y) * scale.y, finalSpeed: velocity(p) }; }
      const lightStop = stop(60), heavyStop = stop(100);
      check('Native braking has nonzero stopping distance and heavier stopping response', lightStop.distance > 0 && heavyStop.distance > lightStop.distance && heavyStop.frames > lightStop.frames && heavyStop.finalSpeed < .0001); evidence.braking = { lightStop, heavyStop };
      const boundaryEntries = [];
      for (const [edge, axis, limit, sign, unit] of [['left', 'x', v55Field.left, -1, scale.x], ['right', 'x', v55Field.right, 1, scale.x], ['top', 'y', v55Field.top, -1, scale.y], ['bottom', 'y', v55Field.bottom, 1, scale.y]]) {
        const entry = fresh(); entry.p.x = entry.p.tx = .5; entry.p.y = entry.p.ty = .5; entry.p[axis] = limit + sign * 1.3 / unit; entry.p[axis === 'x' ? 'tx' : 'ty'] = limit - sign * 1.5 / unit;
        entry.p.offenseMotion.heading = Math.atan2((entry.p.tx - entry.p.x) * scale.x, (entry.p.ty - entry.p.y) * scale.y); const from = { x: entry.p.x, y: entry.p.y };
        v157Move(entry.m, entry.p, .05); const displacement = v122Metres(from, entry.p);
        check('Actual native restart actor outside ' + edge + ' reenters with bounded body movement, without a boundary teleport', displacement > 0 && displacement < .1 && Math.abs(entry.p[axis] - limit) * unit > 1);
        const bodySpeed = velocity(entry.p); Object.assign(entry.q, from); Object.assign(entry.p, { x: .5, y: .5 }); const receiverBody = v157Body(entry.q); receiverBody.vx = axis === 'x' ? -sign * .5 : 0; receiverBody.vy = axis === 'y' ? -sign * .5 : 0;
        const forecast = v157PassLead(entry.m, entry.p, entry.q, entry.p), forecastDisplacement = v122Metres(entry.q, forecast);
        check('Native moving-receiver forecast outside ' + edge + ' preserves actual restart position without an imagined field relocation', sign * (forecast[axis] - limit) > 0 && forecastDisplacement < 1);
        boundaryEntries.push({ edge, displacementMetres: displacement, bodySpeed, forecastDisplacementMetres: forecastDisplacement });
      }
      evidence.boundaryEntries = boundaryEntries;
    }
    {
      const { m, p } = fresh(); p.offenseMotion.vy = -5; p.tx = p.x + 10 / scale.x; p.ty = p.y - 10 / scale.y;
      const angles = [], deltas = [], positions = [];
      for (let i = 0; i < 12; i++) { const before = { ...p.offenseMotion }, from = { x: p.x, y: p.y }; v157Move(m, p, .05); angles.push(Math.abs(v157Angle(before.heading, p.offenseMotion.heading))); deltas.push(Math.hypot(p.offenseMotion.vx - before.vx, p.offenseMotion.vy - before.vy)); positions.push(v122Metres(from, p)); }
      const movement = v157Movement(m, p), facing = Math.atan2((movement.facing.x - p.x) * scale.x, (movement.facing.y - p.y) * scale.y);
      check('Diagonal native turn changes heading and velocity continuously', angles[0] > 0 && angles.every(a => a < .3) && deltas.every(d => d < .8) && positions.every(d => d < .5));
      check('Rendered movement facing follows the same native body heading', Math.abs(v157Angle(p.offenseMotion.heading, facing)) < 1e-8); evidence.turn = { angles, deltas, positions };
      const contact = fresh({ massKg: 60 }); contact.q.weightKg = 100; contact.p.x = .5 - .2 / scale.x; contact.q.x = .5 + .2 / scale.x; contact.q.y = contact.p.y; v157Body(contact.q); contact.p.offenseMotion.vx = 2; contact.q.offenseMotion.vx = -2;
      const ax = contact.p.x, bx = contact.q.x, momentum = contact.p.offenseMotion.vx * contact.p.offenseMotion.massKg + contact.q.offenseMotion.vx * contact.q.offenseMotion.massKg;
      const handled = v157Separate(contact.m, contact.p, contact.q, -.4, 0, .4, .1, scale.x, scale.y), after = contact.p.offenseMotion.vx * contact.p.offenseMotion.massKg + contact.q.offenseMotion.vx * contact.q.offenseMotion.massKg;
      check('Native player separation uses actual mass and preserves linear momentum', handled && (ax - contact.p.x) * scale.x > (contact.q.x - bx) * scale.x && Math.abs(after - momentum) < 1e-8); evidence.contact = { lightCorrection: (ax - contact.p.x) * scale.x, heavyCorrection: (contact.q.x - bx) * scale.x, momentum, after };
    }
    {
      const { m, p, q } = fresh(); m.owner = p; p.offenseMotion.vy = -4; q.y = p.y + 10 / scale.y;
      const passes = p.stats.passes, queued = v157QueueTurn(m, p, q, 'ground', { exempt: false });
      check('Backward native pass queues body preparation before any attempt statistic', queued && !!m.attackFlow.pendingTurn && p.stats.passes === passes && !m.flight && !m.performancePasses);
      const prepared = JSON.stringify(m.attackFlow.pendingTurn), body = JSON.stringify(p.offenseMotion);
      check('Prepared body turn uses actual safe snapshot', v65Snapshot(v65WorldActive)); await v61WaitForStorage();
      const restored = JSON.parse(JSON.stringify(career)); v61CurrentCareer = restored; v65WorldActive = v65Context();
      check('JSON checkpoint preserves native mass, velocity, heading and pending release', v65Restore(v65WorldActive) && match.attackFlow.qualityVersion === 157 && JSON.stringify(match.attackFlow.pendingTurn) === prepared && JSON.stringify(match.people.find(a => a.pid === p.pid).offenseMotion) === body);
      const current = match, a = current.people.find(x => x.pid === p.pid); let frames = 0, early = false;
      while (!current.flight && frames++ < 80) { a.tx = a.x; a.ty = a.y; v157Move(current, a, .05); current.elapsed += .05 * MATCH_SPEED; const before = a.stats.passes; const b = current.people.find(x => x.pid === q.pid), angle = Math.atan2((b.x - a.x) * scale.x, (b.y - a.y) * scale.y); v157ContinueTurn(current, a, []); if (a.stats.passes > before && (Math.abs(v157Angle(a.offenseMotion.heading, angle)) > .30 + 1e-8 || velocity(a) > 1.2 + 1e-8)) early = true; }
      check('Backward native pass releases once only after body alignment and braking', !early && !!current.flight && a.stats.passes === passes + 1 && !current.attackFlow.pendingTurn); evidence.backpass = { frames, speedAtRelease: velocity(a), passDelta: a.stats.passes - passes };
      const paused = fresh(); paused.p.offenseMotion.vy = -4; paused.m.owner = paused.p; paused.m.goalPause = 1; paused.m.attackFlow.pendingTurn = { playerId: paused.p.pid, receiverId: paused.q.pid }; paused.m.attackFlow.combination = { passerId: paused.p.pid, receiverId: paused.q.pid };
      const from = { x: paused.p.x, y: paused.p.y }; v157Move(paused.m, paused.p, .05); v157Prepare(paused.m);
      check('Native pause locks body displacement and clears stale preparations', paused.p.x === from.x && paused.p.y === from.y && velocity(paused.p) === 0 && !paused.m.attackFlow.pendingTurn && !paused.m.attackFlow.combination);
    }
    {
      const { m, p, q } = fresh(); const standing = v157PassLead(m, p, q, p); check('Standing receiver has no invented forward run', standing.x === q.x && standing.y === q.y);
      v157Body(q).vx = 5; m.attackFlow.intents[q.pid] = { type: 'depth' }; const lead = v157PassLead(m, p, q, p);
      check('Moving receiver nominal target is finite and ahead along actual observed motion; receipt is checked through native flights below', Number.isFinite(lead.x) && Number.isFinite(lead.y) && lead.x > q.x && lead.y === q.y);
      const old = fresh({ marked: false }), before = JSON.stringify(old.p); check('Ongoing fixture without quality marker does not allocate new motion or lead', v157Move(old.m, old.p, .05) === false && v157PassLead(old.m, old.p, old.q, old.p) === null && JSON.stringify(old.p) === before && !old.q.offenseMotion);
      old.m.owner = old.p; const originalRandom = Math.random; Math.random = () => .5; try { v55GroundPass(old.p, old.q); } finally { Math.random = originalRandom; }
      check('Ongoing fixture retains the old native fixed deep-pass lead', Math.abs(old.m.flight.target.y - (old.q.y - .075)) < 1e-8 && !old.p.offenseMotion && !old.q.offenseMotion);
    }
    {
      const { m, p, q } = fresh(), short = { x: p.x, y: p.y - 5 / scale.y }, long = { x: p.x, y: p.y - 20 / scale.y };
      const a = v157PassError(m, p, short, .03), b = v157PassError(m, p, long, .03), poor = v157PassError(m, p, short, .06);
      check('Native pass error grows with observed range and original skill/pressure spread', b.x > a.x && b.y > a.y && poor.x > a.x && poor.y > a.y);
      check('Native pass execution spread uses the same metre scale on both axes', Math.abs(a.x * scale.x - a.y * scale.y) < 1e-8);
      m.owner = p; m.ball = { x: p.x, y: p.y }; q.y = short.y; const initial = { attempts: p.stats.passes, complete: p.stats.passComplete }, originalRandom = Math.random; let draws = 0;
      Math.random = () => { draws++; return .75; }; try { v55GroundPass(p, q); } finally { Math.random = originalRandom; }
      check('Marked native ground release preserves two execution random draws and grants no completion at release', draws === 2 && p.stats.passes === initial.attempts + 1 && p.stats.passComplete === initial.complete && !!m.flight && m.owner === null);
      const old = fresh({ marked: false }); check('Legacy pass error helper is inactive with no quality marker', v157PassError(old.m, old.p, old.q, .03) === null);
      evidence.passError = { shortSpreadMetres: a.x * scale.x, longSpreadMetres: b.x * scale.x, poorerOriginalSpreadMetres: poor.x * scale.x, draws };
    }
    const receptionCases = [], backwardCases = [];
    for (const team of [0, 1]) for (const [intent, roleId, line] of [['support', 'playmaker', 'mid'], ['support', 'winger', 'mid'], ['depth', 'poacher', 'att']]) {
      const people = structuredClone(original.people), own = people.filter(p => p.t === team && !p.keeper), q = own.find(p => p.assignedLine === line), p = own.find(p => p !== q), dir = team === 0 ? -1 : 1;
      const m = { ...original, people, exitedPeople: [], owner: p, flight: null, rebound: null, kickoff: null, setPiece: null, throwIn: null, goalPause: 0, halftimePause: 0, finished: false, elapsed: 0, lastPass: null, lastTouch: team, attackFlow: { version: 152, qualityVersion: 157, team, intents: {} } }; match = m;
      for (const side of [0, 1]) for (const [i, a] of people.filter(a => a.t === side && !a.keeper).entries()) { a.x = .12 + i * .16; a.y = side === team ? (team === 0 ? .85 : .15) : (team === 0 ? .2 : .8); a.tx = a.x; a.ty = a.y; delete a.offenseMotion; }
      p.x = team === 0 ? .42 : .58; p.y = team === 0 ? .68 : .32; q.x = team === 0 ? .52 : .48; q.y = team === 0 ? .55 : .45; p.role = q.role = 0; q.tacticalRole = roleId; q.assignedLine = line;
      m.ball = { x: p.x, y: p.y }; v157Body(p).heading = Math.atan2((q.x - p.x) * scale.x, (q.y - p.y) * scale.y);
      const body = v157Body(q); body.vx = team === 0 ? 3 : -3; body.vy = dir; body.heading = Math.atan2(body.vx, body.vy);
      m.attackFlow.intents[q.pid] = { type: intent, team, x: q.x + body.vx / scale.x, y: q.y + dir * 6 / scale.y, until: 100 };
      const count = p.stats.passComplete, originalRandom = Math.random; Math.random = () => .5; let frames = 0;
      try { v55GroundPass(p, q); while (m.flight && frames++ < 80) step(.05 * MATCH_SPEED, .05); } finally { Math.random = originalRandom; }
      const row = { team, roleId, intent, frames, completeDelta: p.stats.passComplete - count, actualOwnerId: m.owner?.pid || null, actualBallGapMetres: v122Metres(q, m.ball), expectedReceiverId: q.pid };
      receptionCases.push(row);
      if (!(row.completeDelta === 1 && m.owner === q && row.actualBallGapMetres <= .8 + 1e-8)) throw Error('Actual moving reception diagnostic ' + JSON.stringify(row));
      check('Actual native moving receiver contact: team' + team + '/' + roleId, true);
      const turn = fresh({ heading: team === 0 ? Math.PI : 0 }); turn.p.t = turn.q.t = team; turn.m.owner = turn.p; turn.p.y = team === 0 ? .65 : .35; turn.q.y = turn.p.y - dir * 10 / scale.y; turn.q.tacticalRole = roleId; turn.p.offenseMotion.vy = dir * 4; turn.m.ball = { x: turn.p.x, y: turn.p.y };
      const before = turn.p.stats.passes; const queued = v157QueueTurn(turn.m, turn.p, turn.q, 'ground', {}); let turnFrames = 0;
      while (!turn.m.flight && turnFrames++ < 80) { turn.p.tx = turn.p.x; turn.p.ty = turn.p.y; v157Move(turn.m, turn.p, .05); turn.m.elapsed += .05 * MATCH_SPEED; v157ContinueTurn(turn.m, turn.p, []); }
      check('Actual backward native preparation: team' + team + '/' + roleId, queued && !!turn.m.flight && turn.p.stats.passes === before + 1); backwardCases.push({ team, roleId, frames: turnFrames, passDelta: turn.p.stats.passes - before });
    }
    evidence.receptionCases = receptionCases; evidence.backwardCases = backwardCases;
    v65WorldActive = null; match = null; return { fixtureKind: 'Controlled native source movement/action cases on a newly created marked world; explicit target/mass/heading inputs. Moving receptions use actual current44×68 native scene geometry and5field+keeper per team, both directions and support/wing/depth. No implemented product adapter exists for the four planned field/player combinations; those are not covered. No rendered-physics or fullmatch claim.', checks, evidence };
  });
}

async function run() {
  const { chromium } = require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
  const built = process.argv.includes('--build'), historical = process.argv.includes('--historical'), baselineOnly = process.argv.includes('--baseline-only'), smoke = process.argv.includes('--smoke'), controlledOnly = process.argv.includes('--controlled-only');
  assert(!built || !historical, 'Build and historical source modes are separate');
  const sourceRoot = historical ? path.join(out, 'historical/roles-wave3-v156/dist') : path.resolve('dist'), frozen = new Map(), html = fs.readFileSync(path.join(sourceRoot, 'index.html'));
  frozen.set('index.html', html);
  for (const m of html.toString().matchAll(/(?:src|href)="([^"#]+)"/g)) {
    const rel = m[1].split('?')[0]; if (/^(?:https?:|data:|\/)/.test(rel) || !/\.(js|css)$/.test(rel)) continue;
    const file = path.resolve(sourceRoot, rel); assert(file.startsWith(sourceRoot + path.sep)); frozen.set(rel.replaceAll('\\', '/'), fs.readFileSync(file));
  }
  const buildBytes = built ? fs.readFileSync('outputs/index.html') : null, buildHtml = built ? Buffer.from(buildBytes.toString().replace('<head>', '<head><base href="/source/">')) : null;
  const report = { built, historical, baselineOnly, smoke, sourceHashes: Object.fromEntries([...frozen].map(([f, b]) => ['dist/' + f, hash(b)])), ...(built ? { buildHash: hash(buildBytes) } : {}), matches: [], errors: [], measurementDefinition: { usefulCombination: 'Two consecutive actually completed, same-team connected passes; next passer is actual previous receiver, release within1.5 native seconds, observed net progress at least3 metres. Failed or opposing intervening pass breaks the chain.', usefulShot: 'Actual release geometry only: goal-center distance≤18m, angle≤60degrees, observed outfield goal-center lane clearance>1.4m. No outcome or goal bonus.', motion: 'Actual position delta per fixed0.05 real seconds measured immediately before native v56Separate positional corrections; live nonsliding field players only and native v50Spot restart relocations excluded. Remaining displacement>10m/s is retained as explicit diagnostic, not claimed as running. Synthetic instrumented native stepping in2D, not device frame performance.' } };
  const server = require('../../ui-redesign/serve.cjs').createServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true }), origin = `http://127.0.0.1:${server.address().port}`;
  async function page() {
    const p = await browser.newPage(); p.on('pageerror', e => report.errors.push(e.message));
    await p.route('**/source/**', route => { const rel = decodeURIComponent(new URL(route.request().url()).pathname.slice(8)), bytes = rel === 'index.html' && built ? buildHtml : frozen.get(rel); return bytes ? route.fulfill({ body: bytes, contentType: rel.endsWith('.js') ? 'text/javascript' : rel.endsWith('.css') ? 'text/css' : 'text/html' }) : route.continue(); });
    await p.goto(origin + '/source/index.html?engine=browser&players=wave3'); await p.waitForFunction(() => window.D6PlayerFoundationPreviewOptions && window.D6MatchRatings && window.userMeshyMatchReady, null, { timeout: 60000 });
    await installRecorder(p); return p;
  }
  const reportName = controlledOnly ? 'controlled-tests.json' : historical ? 'historical-baseline-diagnostics.json' : baselineOnly ? 'baseline-diagnostics.json' : built ? 'build-tests.json' : smoke ? 'smoke-tests.json' : 'source-tests.json';
  try {
    if (!historical && !baselineOnly) { const p = await page(); report.motionCases = await controlledMotion(p); await p.close(); console.log(JSON.stringify({ stage: 'controlled-motion', pass: true, checks: report.motionCases.checks.length })); }
    if (!baselineOnly && !controlledOnly) { const p = await page(); const r = await fullMatch(p, 'quality-native-continuity', 'quality', true); await p.close(); report.matches.push(r); console.log(JSON.stringify({ stage: 'continuity', checks: r.checks.length, pass: true })); }
    for (const seed of Array.from({ length: controlledOnly ? 0 : smoke ? 1 : 10 }, (_, i) => 'roles-balance-' + i)) for (const mode of baselineOnly ? ['baseline'] : ['baseline', 'quality']) {
      const p = await page(), r = await fullMatch(p, seed, mode); await p.close();
      if (historical) {
        const expected = JSON.parse(fs.readFileSync(path.join(out, 'historical/roles-wave3-v156/source-tests.json'))).matches.find(m => m.seed === seed && m.mode === 'roles');
        for (const [key, oldKey] of [['passes', 'passes'], ['complete', 'complete'], ['progressive', 'progressive'], ['shots', 'shots']]) assert.equal(r.stats[key], expected[oldKey], 'Recorder preserves exact historical ' + key);
        assert.deepEqual(r.score, expected.score); assert.equal(r.nativeSeconds, expected.simulationSeconds); r.checks.push('Recorder preserves exact historical pass/shot/score/time outcomes');
      }
      report.matches.push(r); console.log(JSON.stringify({ seed, mode, ...r.stats, passKinds: r.passKinds, sourceMismatches: r.diagnostics.sourceMismatches.length }));
    }
    const pairs = report.matches.filter(r => !r.interrupts), sum = (mode, key) => pairs.filter(r => r.mode === mode).reduce((n, r) => n + r.stats[key], 0);
    report.summary = pairs.length ? Object.fromEntries((baselineOnly ? ['baseline'] : ['baseline', 'quality']).map(mode => [mode, Object.fromEntries(Object.keys(pairs[0].stats).map(key => [key, sum(mode, key)]))])) : {};
    report.changedDuringRun = [...frozen].filter(([file, bytes]) => !fs.existsSync(path.join(sourceRoot, file)) || hash(fs.readFileSync(path.join(sourceRoot, file))) !== hash(bytes)).map(([file]) => 'dist/' + file);
    if (built) report.buildChangedDuringRun = hash(fs.readFileSync('outputs/index.html')) !== report.buildHash;
    assert.deepEqual(report.errors, []); assert.deepEqual(report.changedDuringRun, []); if (built) assert.equal(report.buildChangedDuringRun, false);
    report.checkedAssertions = (report.motionCases?.checks.length || 0) + report.matches.reduce((n, r) => n + r.checks.length, 0);
    report.pass = true; console.log(JSON.stringify({ pass: true, checks: report.checkedAssertions, games: report.matches.length, summary: report.summary, changedDuringRun: report.changedDuringRun }));
  } catch (error) { report.pass = false; report.failure = error.stack; throw error; }
  finally { await browser.close(); await new Promise(resolve => server.close(resolve)); fs.writeFileSync(path.join(out, reportName), JSON.stringify(report, null, 2) + '\n'); }
}
