'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const runtimeRoot = path.join(require('node:os').homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node');
if (Number(process.versions.node.split('.')[0]) < 20) {
  const result = require('node:child_process').spawnSync(path.join(runtimeRoot, 'bin/node.exe'), [__filename, ...process.argv.slice(2)], {stdio: 'inherit'});
  process.exit(result.status ?? 1);
}
const out = path.resolve('outputs/platform/freshness-v158');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

async function installProbe(page) {
  await page.evaluate(() => {
    window.f158Q = {
      checks: [], recovery: [], actions: [], workloadCalls: 0, observeRecovery: true, recoveryObserverMilliseconds: 0, initializations: [],
      check(name, value, detail = null) { if (!value) throw Error(name + (detail ? ': ' + JSON.stringify(detail) : '')); this.checks.push(name); },
      near(a, b, tolerance = 1e-7) { return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tolerance; },
      all(career) { return [...career.world.clubs.flatMap(c => [...c.roster, ...(c.youthPool || [])]), ...(career.world.market?.freePlayers || [])]; },
      strip(career) {
        delete career.world.playerFoundation.loadParameters;
        for (const p of this.all(career)) { delete p.playerModel.loadParameterId; delete p.playerModel.freshnessState; }
        return career;
      },
      fixture(career) { return v62Fixtures(career).filter(f => !f.result && [f.homeId, f.awayId].includes(career.manager.managedClubId)).sort((a, b) => a.day - b.day)[0]; },
      loadPlayers(state) { return state.playerLoad?.players || {}; },
      fixtureLoad(state, pid) { return this.loadPlayers(state)[pid]?.ledger.fixtures.find(f => f.id === state.fixtureId); },
      events(state, pid) { return (this.fixtureLoad(state, pid)?.events || []).map(e => JSON.parse(e.signature)); },
      transitions(state, pid) { return (this.loadPlayers(state)[pid]?.ledger.transitions || []).map(t => JSON.parse(t.signature)); },
      played(state, pid) { return (this.fixtureLoad(state, pid)?.minuteRanges || []).reduce((n, r) => n + r.endMinute - r.startMinute, 0); },
      async career(seed, mode = 'candidate') {
        const c = v61CreateCareer('GER-2', seed, null, structuredClone(D6PlayerFoundationPreviewOptions));
        if (mode === 'baseline') this.strip(c);
        const own = v66Own(c); v66ChooseSponsor(c, own.id, own.sponsors[0].id); v124SetYouthBudget(c, 0);
        while (c.world.market.phase === 'open') await v66NextMarketDay(c);
        return c;
      },
      async native(career) {
        const fixture = this.fixture(career), state = v64MakeState(career, fixture);
        career.world.activeMatch = {fixtureId: fixture.id, state}; v61CurrentCareer = career; match = null; v65WorldActive = null; state.phase = 'paused'; v98View = '2d';
        v65Show(v65Context()); clearInterval(v65WorldFrame); v103CanReplay = () => false; v65Resume(); clearInterval(v65WorldFrame);
        return {career, fixture, state, ownSide: v65Context().ownSide};
      },
      summarize(state, career) {
        return Object.entries(this.loadPlayers(state)).map(([pid, value]) => {
          const p = this.all(career).find(p => p.pid === pid), fixture = this.fixtureLoad(state, pid);
          return {pid, keeper: p.keeper, initialFreshness: state.playerLoad.startFresh[pid], minutes: state.minutes[pid], actualMinutes: this.played(state, pid), freshness: value.freshness,
            modelFreshness: p.playerModel.freshnessState.freshness, consumed: fixture?.consumed || 0,
            events: this.events(state, pid), transitions: this.transitions(state, pid), ranges: fixture?.minuteRanges || []};
        });
      },
      verifyLoad(state, career) {
        const runtime = D6LoadCandidate.materializeParameters(career.world.playerFoundation.loadParameters);
        for (const [pid, value] of Object.entries(this.loadPlayers(state))) {
          const fixture = this.fixtureLoad(state, pid); if (!fixture) {
            this.check('Unused bank receives no fixture load or halftime/final recovery ' + pid, !value.ledger.loads.length && !value.ledger.transitions.length && this.near(value.freshness, state.playerLoad.startFresh[pid])); continue;
          }
          const factor = runtime.loadParameters.staminaFactor(fixture.stamina, fixture.keeper ? 'keeper' : 'field'), rates = runtime.loadParameters.actionRates;
          let expected = this.played(state, pid) * runtime.loadParameters.loadPartition[fixture.keeper ? 'keeper' : 'field'].basePerMinute * factor;
          const causes = new Map();
          for (const event of this.events(state, pid)) {
            const group = event.type === 'intense-duel' ? 'duel' : event.type === 'field-jump' ? 'field-air' : event.type.startsWith('keeper-') ? 'keeper-air' : 'movement';
            const cost = event.type === 'field-jump' ? 0 : event.type === 'keeper-jump' ? .5 * factor : event.type === 'keeper-dive' ? factor : event.units * rates[event.type === 'intense-duel' ? 'intenseDuel' : event.type] * factor;
            const key = JSON.stringify([group, event.causeId]); causes.set(key, Math.max(causes.get(key) || 0, cost));
          }
          expected += [...causes.values()].reduce((n, v) => n + v, 0);
          this.check('Ledger equals actual intervals plus maximum physical-cause costs ' + pid, this.near(fixture.consumed, expected), {actual: fixture.consumed, expected});
          this.check('State freshness is authoritative ' + pid, this.near(value.freshness, state.fresh[pid]));
          this.check('Fixture stores explicit initial freshness ' + pid, Number.isFinite(state.playerLoad.startFresh[pid]) && state.playerLoad.startFresh[pid] >= 0 && state.playerLoad.startFresh[pid] <= 100);
          this.check('Current appearance transport ledger contains only its own fixture ' + pid, value.ledger.fixtures.every(f => f.id === state.fixtureId));
          D6Freshness.restoreState(D6Freshness.serializeState(value));
        }
      }
    };
    const q = f158Q, baseWorkload = v64Workload;
    v64Workload = function (...args) { if (v158Active(v61CurrentCareer)) q.workloadCalls++; return baseWorkload.apply(this, args); };
    const baseInitialize = v158Initialize;
    v158Initialize = function (career, fixture, state) {
      const result = baseInitialize.apply(this, arguments); if (!state.playerLoad) return result;
      const roster = [...v64Side(career, fixture, 0), ...v64Side(career, fixture, 1)], values = Object.entries(state.playerLoad.players);
      q.check('New fixture captures actual persisted initial freshness ' + fixture.id, values.every(([pid, value]) => q.near(value.freshness, roster.find(p => p.pid === pid).playerModel.freshnessState.freshness) && q.near(value.freshness, state.playerLoad.startFresh[pid]) && !value.ledger.loads.length && !value.ledger.fixtures.length && !value.ledger.transitions.length));
      q.initializations.push({fixtureId: fixture.id, players: values.length, minimumInitialFreshness: Math.min(...values.map(([, value]) => value.freshness)), maximumInitialFreshness: Math.max(...values.map(([, value]) => value.freshness))}); return result;
    };
    const baseRecovery = v158RecoverMatch;
    v158RecoverMatch = function (career, fixture, state, type) {
      if (!q.observeRecovery) return baseRecovery.apply(this, arguments);
      const observerStart = performance.now(), before = structuredClone(q.loadPlayers(state)), cloneEnd = performance.now(), result = baseRecovery.apply(this, arguments), afterBase = performance.now();
      for (const [pid, after] of Object.entries(q.loadPlayers(state))) {
        const old = before[pid]; if (!old) continue;
        const added = after.ledger.transitions.filter(t => !old.ledger.transitions.some(o => o.id === t.id));
        const charged = added.some(t => JSON.parse(t.signature).type === type && !old.ledger.transitions.some(o => o.cause === t.cause));
        const oldCost = old.ledger.fixtures.find(f => f.id === fixture.id)?.consumed || 0, newCost = after.ledger.fixtures.find(f => f.id === fixture.id)?.consumed || 0;
        const afterLoad = Math.max(0, old.freshness - (newCost - oldCost));
        q.check('Recovery applies at most one capped +10 ' + type + '/' + pid, q.near(after.freshness, charged ? Math.min(100, afterLoad + 10) : afterLoad), {old: old.freshness, after: after.freshness, charged, committedCost: newCost - oldCost});
        q.recovery.push({fixtureId: fixture.id, pid, type, before: old.freshness, after: after.freshness, charged});
      }
      q.recoveryObserverMilliseconds += cloneEnd - observerStart + performance.now() - afterBase;
      return result;
    };
    const baseAction = v158LoadAction;
    v158LoadAction = function (m, p, type, causeId) { q.actions.push({playerId: p.pid, type, causeId, seconds: m.elapsed / MATCH_SPEED}); return baseAction.apply(this, arguments); };
  });
}

async function profiles(page) {
  return page.evaluate(async () => {
    const q = f158Q, start = q.checks.length, c = v61CreateCareer('GER-2', 'freshness-profiles-158', null, structuredClone(D6PlayerFoundationPreviewOptions)), all = q.all(c);
    q.check('New local wave3 world saves numeric load parameters', v158Active(c) && c.world.playerFoundation.loadParameters.parameterId === D6LoadCandidate.PARAMETER_ID && typeof c.world.playerFoundation.loadParameters.staminaFactor === 'undefined');
    q.check('All professional, youth, cup and free players receive explicit marker and freshness identity', all.length > 500 && all.every(p => p.playerModel.loadParameterId === D6LoadCandidate.PARAMETER_ID && p.playerModel.freshnessState.id === p.pid && p.playerModel.freshnessState.freshness === p.fresh));
    const restored = JSON.parse(JSON.stringify(c));
    q.check('JSON career restore preserves parameters and every freshness state', v61ValidateCareer(c) && v61ValidateCareer(restored) && JSON.stringify(c) === JSON.stringify(restored));
    const sameSeed = v61CreateCareer('GER-2', 'freshness-profiles-158', null, structuredClone(D6PlayerFoundationPreviewOptions)), ordinary = v61CreateCareer('GER-2', 'freshness-ordinary-profiles-158', null, null);
    for (const [name, value] of [['candidate', c], ['ordinary', ordinary]]) {
      const players = q.all(value);
      q.check('New ' + name + ' season starts all professional youth and free players at100 with bounded form and empty recent ratings', value.world.playerSeasonStart === 1 && players.every(p => p.fresh === 100 && Number.isInteger(p.form) && p.form >= -2 && p.form <= 2 && p.formRatings.length === 0));
      q.check('New ' + name + ' season contains varied starting forms', new Set(players.map(p => p.form)).size === 5);
      const before = JSON.stringify(value), oldRandom = Math.random; let randomCalls = 0;
      Math.random = () => { randomCalls++; return .8; }; let repeated;
      try { repeated = v158SeasonStart(value); } finally { Math.random = oldRandom; }
      q.check('Repeated ' + name + ' season hook is inert and consumes no ambient random draw', repeated === false && randomCalls === 0 && JSON.stringify(value) === before);
    }
    q.check('Same seed gives identical per-player starting form', JSON.stringify(all.map(p => [p.pid, p.form])) === JSON.stringify(q.all(sameSeed).map(p => [p.pid, p.form])));
    q.check('Ordinary new career keeps P02 load markers absent', !v158Active(ordinary) && q.all(ordinary).every(p => !p.playerModel?.loadParameterId && !p.playerModel?.freshnessState));
    const ordinaryNext = structuredClone(ordinary); ordinaryNext.world.season = 2;
    for (const p of q.all(ordinaryNext)) { p.fresh = 34; p.formRatings = [5, 7]; p.history = [...(p.history || []), {season: 0, marker: 'preserved-history'}]; }
    const ordinaryHistory = JSON.stringify(q.all(ordinaryNext).map(p => [p.pid, p.history])), ambientRandom = Math.random; let nextRandomCalls = 0;
    Math.random = () => { nextRandomCalls++; return .3; }; let ordinaryReached;
    try { ordinaryReached = v158SeasonStart(ordinaryNext); } finally { Math.random = ambientRandom; }
    q.check('Newly reached ordinary season resets current state without changing historical performance or consuming ambient randomness', ordinaryReached === true && nextRandomCalls === 0 && q.all(ordinaryNext).every(p => p.fresh === 100 && p.formRatings.length === 0) && JSON.stringify(q.all(ordinaryNext).map(p => [p.pid, p.history])) === ordinaryHistory);
    const free = v66NewFreeAgents(c), youth = v67Youth(c, v66Own(c), 2, 1);
    q.check('Later new free/youth generation keeps final identity and load marker', [...free, youth].every(p => p.playerModel.loadParameterId === D6LoadCandidate.PARAMETER_ID && p.playerModel.freshnessState.id === p.pid));
    const old = q.strip(structuredClone(c)), before = JSON.stringify(old), fixture = q.fixture(old), state = v64MakeState(old, fixture);
    const oldSeason = structuredClone(old); delete oldSeason.world.playerSeasonStart;
    for (const p of q.all(oldSeason)) { p.fresh = 43; p.form = 1; p.formRatings = [6]; }
    const existingSeasonValues = JSON.stringify(oldSeason); v61LoadStorageValues([JSON.parse(existingSeasonValues)], null, null);
    q.check('Loading an existing season cannot retrofit starting freshness or form reset', JSON.stringify(v61ReadCareers()[0]) === existingSeasonValues && !v61ReadCareers()[0].world.playerSeasonStart);
    const afterCreation = JSON.stringify(old), oldState = JSON.stringify(state);
    q.check('Existing wave3 without new saved parameters stays outside P02', !v158Active(old) && !state.playerLoad);
    v158Initialize(old, fixture, state); v158RecoverWorld(old, fixture.day); v158RecoverMatch(old, fixture, state, 'halftime');
    q.check('P02 calls cannot retrofit old career or match snapshot', JSON.stringify(old) === afterCreation && JSON.stringify(state) === oldState && q.all(old).every(p => !p.playerModel.freshnessState && !p.playerModel.loadParameterId));
    q.check('Preparing legacy fixture does not add new load parameters', !old.world.playerFoundation.loadParameters && before.includes('wave3-local-candidate-1'));
    old.world.activeMatch = {fixtureId: fixture.id, state}; v61CurrentCareer = old; state.phase = 'paused'; v65WorldActive = v65Context(); v65CreateMatch(v65WorldActive);
    q.check('Existing unmarked wave3 native match can create its ordinary checkpoint', v65Snapshot(v65WorldActive)); await v61WaitForStorage();
    const oldCheckpoint = JSON.stringify(state.physicalSnapshot), oldLoad = JSON.stringify([state.fresh, q.all(old).map(p => p.playerModel)]);
    v158Initialize(old, fixture, state); v158Commit(v65WorldActive); v158RecoverMatch(old, fixture, state, 'halftime');
    q.check('P02 cannot change existing ordinary native checkpoint or player data', !state.playerLoad && JSON.stringify(state.physicalSnapshot) === oldCheckpoint && JSON.stringify([state.fresh, q.all(old).map(p => p.playerModel)]) === oldLoad);
    const restoredOld = JSON.parse(JSON.stringify(old)); v61CurrentCareer = restoredOld; v65WorldActive = v65Context();
    q.check('Actual legacy checkpoint restore keeps load integration absent', v65Restore(v65WorldActive) && !v65WorldActive.state.playerLoad && q.all(restoredOld).every(p => !p.playerModel.freshnessState));
    v61CurrentCareer = c; const p = v66Own(c).roster.find(p => !p.keeper);
    v68OpenPlayerProfile(c, p.pid);
    const labels = [...v61ProfileDialog.querySelectorAll('.v55-skill-groups [role="listitem"]')].map(e => e.getAttribute('aria-label'));
    q.check('Actual profile accessibility labels expose only qualitative skill bands', labels.length === 12 && labels.every(v => !/[0-9]/.test(v)) && !/loadParameterId|freshnessState|Talent|Entwicklungspunkte/.test(v61ProfileDialog.textContent));
    v61ProfileDialog.close(); running = false; clearInterval(v65WorldFrame); v65WorldActive = null; match = null;
    return {checks: q.checks.slice(start), players: all.length, freePlayers: free.length, params: c.world.playerFoundation.loadParameters};
  });
}

async function nativeMatch(page, seed, mode, continuity = false, snapshotSchedule = null) {
  return page.evaluate(async ({seed, mode, continuity, snapshotSchedule}) => {
    const q = f158Q, start = q.checks.length; let rng = 12345;
    Math.random = () => { rng = (rng * 1664525 + 1013904223) >>> 0; return rng / 4294967296; };
    let context = await q.native(await q.career(seed, mode)), {career, fixture, state, ownSide} = context;
    q.check('Native fixture uses correct explicit load gate', mode === 'candidate' ? !!state.playerLoad : !state.playerLoad);
    const beforeActions = q.actions.length, workloadBefore = q.workloadCalls, started = performance.now();
    let ticks = 0, halftime = false, checkpoint = false, queued = false, nextSnapshot = 50, additionalSnapshots = 0; const pauseEvidence = [];
    while (!match.finished && ticks++ < 16000) {
      context = v65Context();
      if (state.phase === 'paused') {
        halftime ||= match.halftimePause > 0;
        if (mode === 'candidate') {
          const before = JSON.stringify(state.playerLoad); const minute = state.minute;
          for (let i = 0; i < 5; i++) { for (const p of match.people) { v157Movement(match, p); v123ControlDirection(p); } draw(); }
          q.check('Paused rendering leaves authoritative load and virtual minute unchanged', JSON.stringify(state.playerLoad) === before && state.minute === minute);
          const recovered = JSON.stringify(state.playerLoad); v158RecoverMatch(career, fixture, state, 'halftime');
          q.check('Opening halftime again cannot recover twice', JSON.stringify(state.playerLoad) === recovered);
          pauseEvidence.push({minute, playerLoad: structuredClone(state.playerLoad)});
        }
        v65Resume(); clearInterval(v65WorldFrame);
      }
      if (continuity && state.minute >= 27 && !queued) {
        const outPid = v64Active(state, ownSide).find(pid => state.roles[pid] !== 'gk'), inPid = v64Bench(state, ownSide).find(pid => !v64Player(career, fixture, ownSide, pid).keeper);
        v64QueueSubstitution(career, fixture, state, ownSide, outPid, inPid); queued = true;
      }
      if (continuity && state.minute >= 54 && !checkpoint && !match.flight && !match.slide) {
        q.check('Actual native source allows safe checkpoint', v65Snapshot(context)); await v61WaitForStorage();
        const load = JSON.stringify(state.playerLoad), fresh = JSON.stringify(state.fresh), params = JSON.stringify(career.world.playerFoundation.loadParameters);
        career = JSON.parse(JSON.stringify(career)); v61CurrentCareer = career; context = v65Context(); state = context.state; fixture = context.fixture;
        const restoreNative = v65Restore; let restoreCalls = 0; v65Restore = function (...args) { restoreCalls++; return restoreNative.apply(this, args); };
        match = null; v65WorldActive = null;
        try { v65Show(context); } finally { v65Restore = restoreNative; clearInterval(v65WorldFrame); }
        q.check('Actual native UI reopen restores fresh context and authoritative load, freshness map and numeric parameters', restoreCalls === 1 && v65WorldActive.state === state && v65WorldActive.career === career && JSON.stringify(state.playerLoad) === load && JSON.stringify(state.fresh) === fresh && JSON.stringify(career.world.playerFoundation.loadParameters) === params);
        for (const p of match.people) q.check('Restored live freshness reads state player map ' + p.pid, q.near(v51LiveFreshness(p), state.playerLoad.players[p.pid].freshness));
        checkpoint = true;
      }
      step(.05 * MATCH_SPEED, .05);
      if (snapshotSchedule) v65LastSaved = Infinity;
      if (v65Context().state.phase === 'live' && !match.finished) v65AfterStep(v65Context());
      // The actual native frame callback accepts a deferred pause after a
      // flight/slide has ended; accelerated stepping must execute that boundary.
      if (v65PauseRequested && !match.flight && !match.slide && state.phase === 'live') { v65PauseRequested = false; v65Pause(); clearInterval(v65WorldFrame); }
      if (snapshotSchedule === 'frequent' && ticks >= nextSnapshot && !match.finished && !match.flight && !match.slide) {
        const before = JSON.stringify([state.playerLoad, state.fresh]), values = match.people.map(p => v158Effective(p, state, false));
        q.check('Frequent actual snapshot is accepted ' + ticks, v65Snapshot(v65Context())); await v61WaitForStorage();
        q.check('Snapshot changes neither authoritative load/freshness nor effective values ' + ticks, JSON.stringify([state.playerLoad, state.fresh]) === before && JSON.stringify(match.people.map(p => v158Effective(p, state, false))) === JSON.stringify(values));
        additionalSnapshots++; nextSnapshot = ticks + 50;
      }
    }
    q.diagnostic = {stage: 'native-completion', seed, mode, ticks, elapsed: match.elapsed, exactVirtualMinutes: match.elapsed * 90 / 75, halftimeObserved: halftime, halfPause: match.halftimePause, halftime: match.halftime, halftimeDone: match.halftimeBreakDone, halftimeRecovery: state.halftimeAiDone, deferredPause: v65PauseRequested, statePhase: state.phase, minute: state.minute, finished: match.finished, record: Boolean(fixture.matchRecord), goalPause: match.goalPause, postBanner: match.postBanner || null, flight: match.flight && {progress: match.flight.progress, duration: match.flight.duration, target: match.flight.target}, kickoff: match.kickoff && {phase: match.kickoff.phase, team: match.kickoff.t, kicker: match.kickoff.kicker?.pid, countdown: match.countdown}, setPiece: match.setPiece && {type: match.setPiece.type, phase: match.setPiece.phase, wait: match.setPiece.wait, spot: match.setPiece.spot, taker: match.setPiece.taker?.pid, positionElapsed: match.setPiece.positionElapsed}, throwIn: match.throwIn && {ready: match.throwIn.ready, spot: match.throwIn.spot, taker: match.throwIn.taker?.pid}, people: match.people.map(p => ({pid: p.pid, keeper: p.keeper, x: p.x, y: p.y, tx: p.tx, ty: p.ty, bx: p.bx, by: p.by, fresh: state.fresh[p.pid]}))};
    q.check('Actual native complete match reaches full time and halftime', match.finished && halftime && state.minute >= 90 && fixture.matchRecord, q.diagnostic);
    await v61WaitForStorage();
    const total = key => [...match.people, ...match.exitedPeople].reduce((n, p) => n + (p.stats[key] || 0), 0);
    const stats = Object.fromEntries(['passes', 'passComplete', 'passLost', 'shots', 'onTarget', 'saves', 'tackleAttempts', 'tacklesWon'].map(k => [k, total(k)]));
    const record = structuredClone(fixture.matchRecord), recordedShots = record.players.reduce((n, p) => n + p.shots, 0);
    q.check('Saved native shot record equals actually executed native shots', recordedShots === stats.shots);
    if (mode === 'candidate') {
      q.check('Candidate native workload never uses old full/90 cost', q.workloadCalls === workloadBefore);
      q.verifyLoad(state, career);
      for (const row of q.summarize(state, career).filter(p => p.actualMinutes > 0)) {
        const transitions = row.transitions.filter(t => t.fixtureId === fixture.id);
        q.check('Each native appearance has one final recovery ' + row.pid, transitions.filter(t => t.type === 'final-whistle').length === 1);
        q.check('Native actual minutes respect substitution bounds and exact native clock ' + row.pid, row.actualMinutes <= match.elapsed * 90 / 75 + 1e-7 && Math.abs(row.actualMinutes - row.minutes) <= 1 + 1e-7, {...row, exactNativeVirtualMinutes: match.elapsed * 90 / 75, displayedWholeMinute: state.minute});
        q.check('Final model freshness matches authoritative map ' + row.pid, q.near(row.freshness, row.modelFreshness));
      }
      const savedLoad = JSON.stringify(state.playerLoad), players = JSON.stringify([...v64Side(career, fixture, 0), ...v64Side(career, fixture, 1)]);
      v158RecoverMatch(career, fixture, state, 'final-whistle'); v64FinishFixture(career, fixture, state);
      q.check('Repeated finalization cannot double recovery or appearance booking', savedLoad === JSON.stringify(state.playerLoad) && players === JSON.stringify([...v64Side(career, fixture, 0), ...v64Side(career, fixture, 1)]));
      let rejected = false; try { v158Initialize(career, fixture, state); } catch { rejected = true; }
      q.check('Completed native fixture rejects a new work ledger without changing current checkpoint', rejected && savedLoad === JSON.stringify(state.playerLoad));
    }
    if (continuity) q.check('Native continuity exercises actual substitution and reload', queued && checkpoint && state.substitutions.some(s => s.minute >= 27));
    const result = {seed, mode, continuity, snapshotSchedule, additionalSnapshots, checks: q.checks.slice(start), ticks, nativeSeconds: match.elapsed / MATCH_SPEED, wallMilliseconds: performance.now() - started,
      minute: state.minute, score: [...match.score], stats, record, actionCalls: q.actions.slice(beforeActions), playerLoad: mode === 'candidate' ? structuredClone(state.playerLoad) : null,
      loadSummary: mode === 'candidate' ? q.summarize(state, career) : [], pauseEvidence, substitutions: structuredClone(state.substitutions)};
    running = false; clearInterval(v65WorldFrame); v65WorldActive = null; match = null; return result;
  }, {seed, mode, continuity, snapshotSchedule});
}

async function pendingSnapshot(page) {
  return page.evaluate(async () => {
    const q = f158Q, start = q.checks.length; let context = await q.native(await q.career('freshness-pending-snapshot-158')), {career, state} = context;
    Object.assign(match, {kickoff: null, setPiece: null, throwIn: null, goalPause: 0, halftimePause: 0, postBanner: null, next: Infinity});
    step(.05 * MATCH_SPEED, .05); v65LastSaved = Infinity; v65AfterStep(context);
    const pending = structuredClone(state.playerLoad.pending), before = JSON.stringify([state.playerLoad, state.fresh]);
    q.check('Actual native interval leaves an open load buffer before next whole minute', Object.values(pending).some(p => p.intervals.some(i => i.endMinute > i.startMinute)));
    q.check('Pending native load can take actual safe checkpoint', v65Snapshot(context)); await v61WaitForStorage();
    q.check('Snapshot preserves entire open buffer, freshness and sequence exactly', JSON.stringify([state.playerLoad, state.fresh]) === before);
    career = JSON.parse(JSON.stringify(career)); v61CurrentCareer = career; context = v65Context(); state = context.state; match = null; v65WorldActive = null;
    const restoreNative = v65Restore; let calls = 0; v65Restore = function (...args) { calls++; return restoreNative.apply(this, args); };
    try { v65Show(context); } finally { v65Restore = restoreNative; clearInterval(v65WorldFrame); }
    q.check('Actual UI JSON reopen preserves still-open buffer and authoritative values', calls === 1 && v65WorldActive.state === state && JSON.stringify([state.playerLoad, state.fresh]) === before && JSON.stringify(state.playerLoad.pending) === JSON.stringify(pending));
    step(.05 * MATCH_SPEED, .05); v65LastSaved = Infinity; v65AfterStep(context); v158Commit(context); q.verifyLoad(state, career);
    q.check('Restored open buffer plus next actual interval commit once', !Object.keys(state.playerLoad.pending).length && Object.values(state.playerLoad.players).filter(p => p.ledger.fixtures.length).every(p => p.ledger.fixtures[0].minuteRanges[0].startMinute === 0));
    const result = {checks: q.checks.slice(start), pending, restoredAndCommitted: structuredClone(state.playerLoad)};
    running = false; clearInterval(v65WorldFrame); v65WorldActive = null; match = null; return result;
  });
}

async function compactMatch(page, seed, mode, continuity = false) {
  return page.evaluate(async ({seed, mode, continuity}) => {
    const q = f158Q, start = q.checks.length; let career = await q.career(seed, mode), fixture = q.fixture(career), state = v64MakeState(career, fixture);
    v61CurrentCareer = career; v65WorldActive = null; match = null;
    let steps = 0, checkpoint = false, queued = false; const workloadBefore = q.workloadCalls;
    while (state.phase !== 'finished' && steps++ < 120) {
      if (continuity && state.minute >= 27 && !queued) {
        const side = fixture.homeId === career.manager.managedClubId ? 0 : 1, outPid = v64Active(state, side).find(pid => state.roles[pid] !== 'gk'), inPid = v64Bench(state, side).find(pid => !v64Player(career, fixture, side, pid).keeper);
        v64QueueSubstitution(career, fixture, state, side, outPid, inPid); queued = true;
      }
      if (continuity && state.minute >= 54 && !checkpoint) {
        const encoded = JSON.stringify(state.playerLoad); career = JSON.parse(JSON.stringify(career)); fixture = v62Fixtures(career).find(f => f.id === fixture.id); state = JSON.parse(JSON.stringify(state)); v61CurrentCareer = career;
        q.check('Compact JSON restore preserves actual load intervals and causes', JSON.stringify(state.playerLoad) === encoded); checkpoint = true;
      }
      v64Step(career, fixture, state);
    }
    const record = v64FinishFixture(career, fixture, state);
    q.check('Actual compact controller completes full match', state.phase === 'finished' && state.minute >= 90 && steps < 120);
    const events = state.playerPerformance.events, stats = {passes: events.filter(e => e.type === 'pass').length, passComplete: events.filter(e => e.type === 'pass' && e.success).length, shots: events.filter(e => e.type === 'shot').length, saves: events.filter(e => e.type === 'save').length};
    q.check('Compact saved shots equal actual resolved shot events', stats.shots === record.players.reduce((n, p) => n + p.shots, 0));
    if (mode === 'candidate') {
      q.check('Candidate compact load excludes old full/90 workload', q.workloadCalls === workloadBefore); q.verifyLoad(state, career);
      for (const row of q.summarize(state, career).filter(p => p.actualMinutes > 0)) {
        q.check('Compact actual minutes exactly equal appearance minutes ' + row.pid, q.near(row.actualMinutes, row.minutes), row);
        q.check('Compact final recovery occurs once ' + row.pid, row.transitions.filter(t => t.type === 'final-whistle' && t.fixtureId === fixture.id).length === 1);
        q.check('Compact final model freshness matches map ' + row.pid, q.near(row.freshness, row.modelFreshness));
      }
      const before = JSON.stringify(state.playerLoad), all = JSON.stringify(q.all(career)); v158RecoverMatch(career, fixture, state, 'final-whistle'); v64FinishFixture(career, fixture, state);
      q.check('Compact finalization repeat is inert', JSON.stringify(state.playerLoad) === before && JSON.stringify(q.all(career)) === all);
      let rejected = false; try { v158Initialize(career, fixture, state); } catch { rejected = true; }
      q.check('Completed compact fixture rejects a new work ledger without changing evidence', rejected && JSON.stringify(state.playerLoad) === before);
    }
    if (continuity) q.check('Compact continuity exercises actual substitution and reload', checkpoint && queued && state.substitutions.some(s => s.minute >= 27));
    return {seed, mode, continuity, checks: q.checks.slice(start), minute: state.minute, score: [...state.score], stats, record: structuredClone(record), playerLoad: mode === 'candidate' ? structuredClone(state.playerLoad) : null, loadSummary: mode === 'candidate' ? q.summarize(state, career) : []};
  }, {seed, mode, continuity});
}

async function controlled(page) {
  return page.evaluate(async () => {
    const q = f158Q, start = q.checks.length, context = await q.native(await q.career('freshness-controlled-158'));
    const {career, fixture, state} = context, original = match, person = original.people.find(p => !p.keeper && p.t === 0), source = q.all(career).find(p => p.pid === person.pid);
    const base = Object.fromEntries(D6EffectiveAbilities.SKILL_KEYS.map(k => [k, person[k]])), modelBefore = JSON.stringify([source.playerModel.caps, source.playerModel.talent, source.heightCm]);
    function setFreshness(freshness) {
      state.playerLoad.players[person.pid].freshness = freshness; state.fresh[person.pid] = freshness;
      source.playerModel.freshnessState.freshness = freshness; source.fresh = freshness; person.fresh = freshness;
    }
    person.form = 2; person.assignedLine = person.line; original.aggression = [0, 0]; person.matchEntryElapsed = 37; original.elapsed = 70;
    setFreshness(0);
    const runtime = D6LoadCandidate.materializeParameters(career.world.playerFoundation.loadParameters), form = D6LoadCandidate.formContext(base, 2, runtime.formParameters), expected = D6EffectiveAbilities.effectiveAbilities(base, 0, form, {actualPressure: false}, runtime.effectParameters);
    const oldForm = v51EffectiveForm; let oldFormCalls = 0;
    v51EffectiveForm = function (...args) { oldFormCalls++; return oldForm.apply(this, args); };
    const effective = Object.fromEntries(D6EffectiveAbilities.SKILL_KEYS.map(key => [key, v158Ability(person, key, state, false)]));
    const actual = Object.fromEntries(D6EffectiveAbilities.SKILL_KEYS.map(key => [key, ability(person, key)])); v51EffectiveForm = oldForm;
    q.check('Native new ability path avoids old freshness-derived form cap', oldFormCalls === 0, {oldFormCalls});
    q.check('Explicit effective adapter applies approved fatigue and raw form once', D6EffectiveAbilities.SKILL_KEYS.every(key => q.near(effective[key], expected[key])), {effective, expected});
    for (const key of ['spd', 'sta', 'pos', 'str', 'pas']) q.check('Actual ability wrapper uses same single new derivation ' + key, q.near(actual[key], expected[key]), {actual: actual[key], expected: expected[key]});
    q.check('Effective ability reads leave caps, talent, height and base skills intact', JSON.stringify([source.playerModel.caps, source.playerModel.talent, source.heightCm]) === modelBefore && D6EffectiveAbilities.SKILL_KEYS.every(k => person[k] === base[k]));
    const savedContext = v65WorldActive, savedMatch = match, savedCareer = v61CurrentCareer; v65WorldActive = null; match = null; v61CurrentCareer = null;
    const isolatedPerson = structuredClone(person), isolated = Object.fromEntries(D6EffectiveAbilities.SKILL_KEYS.map(key => [key, v158Ability(isolatedPerson, key, state, false)]));
    v65WorldActive = savedContext; match = savedMatch; v61CurrentCareer = savedCareer;
    q.check('Saved match parameters derive identical effective abilities without ambient career or native match', D6EffectiveAbilities.SKILL_KEYS.every(key => q.near(isolated[key], expected[key])));
    for (const boundary of [{base: 20, form: 2}, {base: 1, form: -2}]) {
      person.ant = boundary.base; person.dec = boundary.base; person.form = boundary.form; setFreshness(100);
      q.check('Fresh native reaction timing has no form-clamp penalty or bonus at boundary ' + boundary.base, q.near(v158ReactionLoss(person), 0));
    }
    person.ant = base.ant; person.dec = base.dec;
    person.form = 0; source.form = 0; person.matchEntryElapsed = 0;
    const scale = v150Scale(), ramps = {};
    for (const freshness of [100, 0]) {
      setFreshness(freshness);
      const p = structuredClone(person); Object.assign(p, {x: .5, y: .65, tx: .5, ty: .2, role: 0, weightKg: 74, slideActive: null}); delete p.offenseMotion;
      const m = {...original, people: [p], exitedPeople: [], owner: null, flight: null, rebound: null, kickoff: null, setPiece: null, throwIn: null, goalPause: 0, halftimePause: 0, finished: false, elapsed: 0, ball: {x: .5, y: .5}, attackFlow: {version: 152, qualityVersion: 157, intents: {[p.pid]: {type: 'depth', team: 0, until: 100}}}};
      match = m; v157Body(p).heading = Math.PI;
      const pace = v157Pace(m, p), velocities = [];
      for (let i = 0; i < 20; i++) { v157Move(m, p, .05); velocities.push(Math.hypot(p.offenseMotion.vx, p.offenseMotion.vy)); }
      ramps[freshness] = {pace, velocities, firstAcceleration: velocities[0] / .05, metres: (.65 - p.y) * scale.y};
    }
    q.check('Actual v157 maximum speed loses at most approved15 percent', q.near(ramps[0].pace / ramps[100].pace, .85), ramps);
    q.check('Actual v157 first acceleration loses at most approved25 percent', q.near(ramps[0].firstAcceleration / ramps[100].firstAcceleration, .75), ramps);
    q.check('Fresh and tired physical motion retain a gradual native ramp', Object.values(ramps).every(r => r.velocities[0] > 0 && r.velocities[0] < r.velocities[9] && r.velocities.every((v, i) => !i || v >= r.velocities[i - 1] - 1e-7)), ramps);
    match = original; running = false; clearInterval(v65WorldFrame); v65WorldActive = null; match = null;
    const calendarCareer = await q.career('freshness-calendar-158'), calendarFixture = q.fixture(calendarCareer), ownSide = calendarFixture.homeId === calendarCareer.manager.managedClubId ? 0 : 1;
    let calendarState = null, openingAdvances = 0; const baseMakeState = v64MakeState;
    v64MakeState = function (c, f) { const s = baseMakeState.apply(this, arguments); if (f.id === calendarFixture.id) calendarState = s; return s; };
    v61CurrentCareer = calendarCareer;
    try { while (!calendarFixture.result && openingAdvances++ < 20) v62AdvanceDay(calendarCareer); } finally { v64MakeState = baseMakeState; }
    q.check('Actual world calendar completes the managed fixture', calendarFixture.result && calendarState?.phase === 'finished' && openingAdvances < 20);
    const appeared = v64Side(calendarCareer, calendarFixture, ownSide).find(p => !p.keeper && calendarState.minutes[p.pid] > 0), bank = v64Side(calendarCareer, calendarFixture, ownSide).find(p => !calendarState.minutes[p.pid]), free = calendarCareer.world.market.freePlayers[0];
    q.check('Calendar proof begins with actual completed appearance and unused roster player', appeared && bank && free && appeared.playerModel.loadPlayedDays.includes(v64AbsoluteDay(calendarCareer, calendarFixture.day)));
    for (const p of [appeared, bank, free]) { p.fresh = 50; p.playerModel.freshnessState.freshness = 50; }
    // Explicit boundary inputs reset freshness only; played-day facts come from the real compact fixture.
    v158RecoverWorld(calendarCareer, calendarFixture.day + 1);
    q.check('Played calendar day cannot become an extra rest day', q.near(appeared.fresh, 50));
    q.check('Unused player receives full match-free-day recovery on club match day', q.near(bank.fresh, 65.5));
    const beforeTransfer = JSON.stringify(appeared.playerModel), seller = v66Owner(calendarCareer, appeared.pid), buyer = calendarCareer.world.clubs.find(c => !c.simulationOnly && c.id !== seller.id && c.roster.length < 14 && v66CanAfford(calendarCareer, c.id, 0, v66Salary(appeared), appeared));
    q.check('Calendar transfer uses an executable existing native transfer', !!buyer);
    const bid = {id: 'freshness-calendar-transfer-158', pid: appeared.pid, sellerId: seller.id, buyerId: buyer.id, price: 0, annual: v66Salary(appeared), years: 1, promise: 0, placedDay: calendarFixture.day, status: 'pending'};
    v66Transfer(calendarCareer, bid);
    q.check('Transfer preserves player freshness state, cursor, identity and played days', v66Owner(calendarCareer, appeared.pid).id === buyer.id && JSON.stringify(appeared.playerModel) === beforeTransfer);
    v158RecoverWorld(calendarCareer, calendarFixture.day + 2);
    q.check('Transferred player receives next full rest day once', q.near(appeared.fresh, 65.5));
    const afterDay = JSON.stringify([appeared.playerModel, bank.playerModel, free.playerModel]); v158RecoverWorld(calendarCareer, calendarFixture.day + 2);
    q.check('Repeated calendar entry cannot recover any player twice', JSON.stringify([appeared.playerModel, bank.playerModel, free.playerModel]) === afterDay);
    const calendarRestored = JSON.parse(JSON.stringify(calendarCareer)), restoredPlayer = q.all(calendarRestored).find(p => p.pid === appeared.pid); v61CurrentCareer = calendarRestored; v158RecoverWorld(calendarRestored, calendarFixture.day + 3);
    q.check('Calendar JSON restore continues from player cursor', q.near(restoredPlayer.fresh, 77.125));
    const finalFree = calendarRestored.world.market.freePlayers[0];
    q.check('Free-agent state retains final reidentified pid', finalFree.playerModel.freshnessState.id === finalFree.pid);
    finalFree.fresh = 50; finalFree.playerModel.freshnessState.freshness = 50;
    const freeCursor = finalFree.playerModel.loadCursor;
    v158RecoverWorld(calendarRestored, calendarFixture.day + 4);
    const freeDays = v64AbsoluteDay(calendarRestored, calendarFixture.day + 4) - 1 - freeCursor;
    let expectedFree = 50; for (let i = 0; i < freeDays; i++) expectedFree = Math.min(100, expectedFree + 3 + .25 * (100 - expectedFree));
    q.check('Final free-agent identity receives only full days after its creation cursor', q.near(finalFree.fresh, expectedFree), {pid: finalFree.pid, freeCursor, freeDays, freshness: finalFree.fresh, expectedFree, copies: q.all(calendarRestored).filter(p => p.pid === finalFree.pid).length});
    // Complete the actual season and transition to exercise the calendar boundary through native controllers.
    const seasonStarted = performance.now(), observerBeforeSeason = q.recoveryObserverMilliseconds, seasonInitializations = q.initializations.length;
    q.observeRecovery = false;
    let advances = 0; try { while (!calendarRestored.world.seasonFinished && advances++ < 70) v62AdvanceDay(calendarRestored); } finally { q.observeRecovery = true; }
    const seasonMilliseconds = performance.now() - seasonStarted;
    q.check('Actual compact calendar reaches season boundary', calendarRestored.world.seasonFinished && advances < 70);
    const completedSeasonBytes = new TextEncoder().encode(JSON.stringify(calendarRestored)).length;
    q.check('Completed player calendar basis excludes historical fixture transport ledgers', q.all(calendarRestored).every(p => !p.playerModel.freshnessState.ledger.loads.length && !p.playerModel.freshnessState.ledger.fixtures.length));
    const saveStarted = performance.now(); await v61SaveCareers([calendarRestored]); await v61WaitForStorage();
    const storedCareers = v61StorageDb ? await new Promise((resolve, reject) => { const request = v61StorageDb.transaction('careers', 'readonly').objectStore('careers').get('worlds'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }) : JSON.parse(localStorage.getItem(v61WorldKey)).worlds;
    q.check('Real completed-season store successfully preserves full career', JSON.stringify(storedCareers[0]) === JSON.stringify(calendarRestored));
    const nativeSaveMilliseconds = performance.now() - saveStarted, savedDb = v61StorageDb;
    const equivalentOld = q.strip(structuredClone(calendarRestored));
    for (const p of q.all(equivalentOld)) { delete p.playerModel.loadCursor; delete p.playerModel.loadPlayedDays; }
    const candidateCharacters = JSON.stringify(calendarRestored).length, equivalentOldCharacters = JSON.stringify(equivalentOld).length;
    q.diagnostic = {stage: 'completed-season-storage', seasonMilliseconds, completedSeasonBytes, candidateCharacters, estimatedCandidateUTF16Bytes: candidateCharacters * 2, nativeSaveMilliseconds, nativeStorePassed: true, recoveryObserverMilliseconds: q.recoveryObserverMilliseconds, seasonRecoveryObserverMilliseconds: q.recoveryObserverMilliseconds - observerBeforeSeason, completedFixtures: v62Fixtures(calendarRestored).filter(f => f.matchRecord).length, candidatePlayers: q.all(calendarRestored).length, equivalentOldBytes: new TextEncoder().encode(JSON.stringify(equivalentOld)).length, equivalentOldCharacters, estimatedEquivalentOldUTF16Bytes: equivalentOldCharacters * 2, baselineDefinition: 'Same actual completed season cloned only for size/fallback comparison; load parameters and per-player P02 marker/state/cursor/played-days removed. No career migration or alternate season simulation.', storageEntries: Object.keys(localStorage).map(key => ({key, bytes: new TextEncoder().encode(localStorage.getItem(key)).length}))};
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) { try { return setItem.call(this, key, value); } catch (error) { q.diagnostic.storageException = {name: error.name, message: error.message, attemptedBytes: new TextEncoder().encode(value).length, attemptedCharacters: value.length, estimatedUTF16Bytes: value.length * 2, key}; throw error; } };
    try {
      v61StorageDb = null;
      const priorCareer = v61CreateCareer('GER-2', 'freshness-fallback-previous-158', null, null); await v61SaveCareers([priorCareer]); await v61WaitForStorage();
      const previousFallback = localStorage.getItem(v61WorldKey);
      for (const [name, value] of [['candidate', calendarRestored], ['sameSeasonWithoutP02', equivalentOld]]) {
        let errorMessage = null; q.diagnostic.storageException = null;
        try { await v61SaveCareers([value]); await v61WaitForStorage(); } catch (error) { errorMessage = error.message; }
        const failure = {saved: false, unsupported: true, errorMessage, exception: q.diagnostic.storageException, previousFallbackPreserved: localStorage.getItem(v61WorldKey) === previousFallback, visibleError: v64MatchMenu.dataset.storage === 'error' && v64MatchMenu.open && !v64MatchMenu.querySelector('[data-v64-storage-help]').hidden && v64MatchMenu.querySelector('[data-v64-storage-status]').textContent.length > 0};
        q.diagnostic[name + 'Fallback'] = failure;
        q.check('Existing quota failure keeps previous fallback and exposes visible recovery controls ' + name, errorMessage && failure.exception?.name === 'QuotaExceededError' && failure.previousFallbackPreserved && failure.visibleError, failure);
      }
    } finally { v61StorageDb = savedDb; Storage.prototype.setItem = setItem; }
    const fallbackBytes = q.diagnostic.candidateFallback.exception.attemptedBytes;
    await v61SaveCareers([calendarRestored]); await v61WaitForStorage();
    if (calendarRestored.world.transition.choice === null) v67ChooseOffer(calendarRestored);
    const previousHistory = new Map(q.all(calendarRestored).map(p => [p.pid, JSON.stringify(p.history)]));
    v62NextSeason(calendarRestored);
    const seasonPlayers = q.all(calendarRestored), historyAfterTransition = new Map(seasonPlayers.map(p => [p.pid, JSON.stringify(p.history)]));
    q.check('Actual next-season controller starts every retained and generated player at100 with bounded diverse form and empty recent ratings', calendarRestored.world.playerSeasonStart === 2 && seasonPlayers.every(p => p.fresh === 100 && p.playerModel.freshnessState.freshness === 100 && p.formRatings.length === 0 && Number.isInteger(p.form) && p.form >= -2 && p.form <= 2) && new Set(seasonPlayers.map(p => p.form)).size === 5);
    const seasonSnapshot = JSON.stringify(calendarRestored), oldRandom = Math.random; let hookRandomCalls = 0;
    Math.random = () => { hookRandomCalls++; return .9; }; let repeatedSeason;
    try { repeatedSeason = v158SeasonStart(calendarRestored); } finally { Math.random = oldRandom; }
    q.check('Repeated reached-season hook preserves all values and history with no random draws', repeatedSeason === false && hookRandomCalls === 0 && JSON.stringify(calendarRestored) === seasonSnapshot && seasonPlayers.every(p => JSON.stringify(p.history) === historyAfterTransition.get(p.pid)));
    const boundaryPlayer = q.all(calendarRestored).find(p => p.pid === finalFree.pid) || q.all(calendarRestored).find(p => p.pid === restoredPlayer.pid);
    q.check('Actual season transition retains a saved player load cursor', calendarRestored.world.season === 2 && boundaryPlayer && Number.isInteger(boundaryPlayer.playerModel.loadCursor));
    boundaryPlayer.fresh = 50; boundaryPlayer.playerModel.freshnessState.freshness = 50;
    const boundaryCursor = boundaryPlayer.playerModel.loadCursor; v158RecoverWorld(calendarRestored, 2);
    const through = v64AbsoluteDay(calendarRestored, 2) - 1;
    let expectedBoundary = 50;
    for (let day = boundaryCursor + 1; day <= through; day++) if (!boundaryPlayer.playerModel.loadPlayedDays.includes(day)) expectedBoundary = Math.min(100, expectedBoundary + 3 + .25 * (100 - expectedBoundary));
    q.check('Season boundary uses continuous player days and full-day recovery', q.near(boundaryPlayer.fresh, expectedBoundary) && boundaryPlayer.playerModel.loadCursor === through);
    return {checks: q.checks.slice(start), fixtureKind: 'Controlled native source cases use actual generated skills and explicit freshness0/100 inputs; calendar cases use real compact fixture, transfer and season controllers, with explicit freshness50 boundary inputs. No full-match consumption or render-performance claim.', effective, expected, actual, ramps,
      storage: q.diagnostic, calendar: {fixtureId: calendarFixture.id, actualPlayedDay: calendarFixture.day, bankPid: bank.pid, transferredPid: appeared.pid, freePid: finalFree.pid, freeCursor, seasonAdvances: advances, seasonMilliseconds, completedSeasonBytes, nativeSaveMilliseconds, fallbackBytes, recoveryObserverMilliseconds: q.recoveryObserverMilliseconds, seasonRecoveryObserverMilliseconds: q.diagnostic.seasonRecoveryObserverMilliseconds, seasonObserverDefinition: 'Recovery observer cloning/logging disabled during timed actual calendar completion; inexpensive initializer checks remain. Browser rendering is not benchmarked.', initializations: q.initializations.slice(seasonInitializations), boundaryCursor, through, expectedBoundary, retainedPreviousHistories: seasonPlayers.filter(p => previousHistory.has(p.pid)).length}};
  });
}

async function controlledActions(page) {
  return page.evaluate(async () => {
    const q = f158Q, start = q.checks.length, evidence = [];
    for (const kind of ['keeper-dive', 'keeper-jump', 'field-header']) {
      const context = await q.native(await q.career('freshness-action-' + kind)), {career, fixture, state} = context, m = match, scale = v150Scale();
      const shooter = m.people.find(p => p.t === 0 && !p.keeper && (kind !== 'keeper-jump' || (p.n + 1) % 3 === 2)), keeper = m.people.find(p => p.t === 1 && p.keeper);
      for (const p of m.people) { p.x = p.t === 0 ? .1 : .9; p.y = .65; p.tx = p.x; p.ty = p.y; p.recoverUntil = 0; delete p.offenseMotion; }
      Object.assign(shooter, {x: .5, y: v55Field.top + 8 / scale.y, tx: .5, ty: v55Field.top + 8 / scale.y});
      Object.assign(keeper, {x: .5, y: v55Field.top + 1 / scale.y, tx: .5, ty: v55Field.top + 1 / scale.y});
      Object.assign(m, {owner: shooter, ball: {x: shooter.x, y: shooter.y}, kickoff: null, setPiece: null, throwIn: null, goalPause: 0, halftimePause: 0, postBanner: null, pendingKickoff: null, flight: null, rebound: null, next: Infinity});
      m.attackFlow.intents = {}; m.attackFlow.pendingTurn = null; running = true;
      const goalsBefore = m.score[0], savesBefore = keeper.stats.saves, headersBefore = shooter.stats.headers;
      const originalRandom = Math.random; let draws = 0;
      Math.random = () => { draws++; return draws === 1 ? (kind === 'keeper-dive' ? .99 : .5) : 0; };
      try { v55Shoot(shooter, kind === 'field-header' ? 'header' : 'shot'); } finally { Math.random = originalRandom; }
      const flight = m.flight;
      q.check('Controlled case executes actual on-target native shot ' + kind, flight && shooter.stats.onTarget > 0);
      let frames = 0;
      while (m.flight && frames++ < 140) { step(.05 * MATCH_SPEED, .05); if (state.phase === 'live' && !m.finished) v65AfterStep(context); }
      v158Commit(context); q.verifyLoad(state, career);
      const keeperEvents = q.events(state, keeper.pid).filter(e => e.type.startsWith('keeper-')), shooterEvents = q.events(state, shooter.pid);
      if (kind !== 'field-header') {
        q.check('Executed keeper movement is charged on failed save ' + kind, m.score[0] === goalsBefore + 1 && keeper.stats.saves === savesBefore && keeperEvents.some(e => e.type === kind), {goals: m.score[0], saves: keeper.stats.saves, keeperEvents, motion: flight.shotMotion});
        const saved = JSON.stringify(state.playerLoad); v158KeeperLaunch(m, keeper, flight); v158KeeperLaunch(m, keeper, flight); v158Commit(context);
        q.check('Same already-executed keeper launch is charged once ' + kind, JSON.stringify(state.playerLoad) === saved);
        q.check('Keeper air ledger never sums jump and dive for same cause ' + kind, keeperEvents.every(e => keeperEvents.filter(o => o.causeId === e.causeId).length === 1));
      } else q.check('Actual field header has no extra field jump cost', shooter.stats.headers === headersBefore + 1 && shooterEvents.filter(e => e.type === 'field-jump').every(e => state.playerLoad.players[shooter.pid].ledger.fixtures.find(f => f.id === fixture.id).causes.find(c => c.key === JSON.stringify(['field-air', e.causeId])).cost === 0));
      evidence.push({kind, frames, goalsDelta: m.score[0] - goalsBefore, savesDelta: keeper.stats.saves - savesBefore, headerDelta: shooter.stats.headers - headersBefore, keeperEvents, shooterEvents, shotMotion: flight.shotMotion || null, keeperLoad: q.fixtureLoad(state, keeper.pid)});
      running = false; clearInterval(v65WorldFrame); v65WorldActive = null; match = null;
    }
    // Use the actual interval/contact adapter with explicit controlled native movements.
    const context = await q.native(await q.career('freshness-action-running')), {career, state} = context, m = match, scale = v150Scale();
    const p = m.people.find(p => p.t === 0 && !p.keeper), owner = m.people.find(p => p.t === 1 && !p.keeper);
    Object.assign(m, {owner, kickoff: null, setPiece: null, throwIn: null, goalPause: 0, halftimePause: 0, postBanner: null, flight: null, rebound: null, elapsed: 0});
    Object.assign(owner, {x: .5, y: .4}); Object.assign(p, {x: .5, y: .4 + 8 / scale.y});
    v158BeginNative(m, .05); const target = {x: .5, y: .4 + 7.65 / scale.y}; p.tx = target.x; p.ty = target.y; v157Body(p).heading = Math.PI;
    // Native movement starts with actual velocity; the interval adapter observes its displacement.
    p.offenseMotion.vy = -7; v157Move(m, p, .05); m.elapsed += .05 * MATCH_SPEED; v158EndNative(m); v158Commit(context);
    const events = q.events(state, p.pid), sprint = events.find(e => e.type === 'sprint'), pressing = events.find(e => e.type === 'pressing');
    q.check('Actual native movement emits active sprint and pressing virtual minutes', sprint && pressing && sprint.units > 0 && q.near(sprint.units, pressing.units), events);
    q.check('Overlapping sprint and pressing retain one physical cause', sprint.causeId === pressing.causeId, events); q.verifyLoad(state, career);
    const before = JSON.stringify(state.playerLoad), initial = q.fixtureLoad(state, p.pid).consumed; v158Commit(context);
    q.check('Recommitting delivered native movement has no extra cost', JSON.stringify(state.playerLoad) === before && q.near(q.fixtureLoad(state, p.pid).consumed, initial));
    const victim = owner; Object.assign(victim, {x: .5, y: .5, motionX: 0, motionY: 1}); Object.assign(p, {x: .5, y: .5 - .4 / scale.y}); m.owner = victim; m.ball = {x: victim.x, y: victim.y};
    const duelsBefore = p.stats.duels; const oldRandom = Math.random; Math.random = () => .99;
    try { v56StandingTackle(p, victim); } finally { Math.random = oldRandom; }
    v158Commit(context); const contacts = q.events(state, p.pid).filter(e => e.type === 'intense-duel');
    q.check('Native actually attempted legal standing contact creates one intense contact unit', p.stats.duels === duelsBefore + 1 && contacts.length === 1 && contacts[0].units === 1, {stats: p.stats, contacts}); q.verifyLoad(state, career);
    evidence.push({kind: 'actual-running-contact', movementEvents: events, contacts, actualVirtualMinutes: q.played(state, p.pid)});
    running = false; clearInterval(v65WorldFrame); v65WorldActive = null; match = null;
    {
      const compactCareer = await q.career('freshness-compact-budget-158'), compactFixture = q.fixture(compactCareer); let compactState = v64MakeState(compactCareer, compactFixture);
      v61CurrentCareer = compactCareer; compactState.minute = 1;
      const sides = [0, 1].map(side => v64Active(compactState, side).filter(pid => compactState.roles[pid] !== 'gk')), [receiver, passer] = sides[0], [opponentReceiver, opponentPasser] = sides[1];
      for (const side of [0, 1]) for (const pid of sides[side]) compactState.playerLoad.compactPositions[pid] = side ? {x: 44, y: 68} : {x: 0, y: 0};
      Object.assign(compactState.playerLoad.compactPositions, {[receiver]: {x: 20, y: 25}, [opponentReceiver]: {x: 20, y: 30}, [opponentPasser]: {x: 21, y: 30}});
      v158CompactMinute(compactCareer, compactFixture, compactState); v158CompactOffers(compactCareer, compactFixture, compactState, 0, receiver, passer);
      const firstUse = compactState.playerLoad.compactBudget.used[receiver];
      v158CompactOffers(compactCareer, compactFixture, compactState, 1, opponentReceiver, opponentPasser);
      const sharedUse = compactState.playerLoad.compactBudget.used[receiver], secondPosition = {...compactState.playerLoad.compactPositions[receiver]};
      q.check('Actual compact receiver then opponent presser share at most one active virtual minute', firstUse > 0 && firstUse < 1 && sharedUse > firstUse && q.near(sharedUse, 1), {firstUse, sharedUse});
      const budgetBeforeReload = JSON.stringify(compactState.playerLoad.compactBudget); compactState = JSON.parse(JSON.stringify(compactState));
      q.check('Compact reload preserves exhausted per-player minute budget', JSON.stringify(compactState.playerLoad.compactBudget) === budgetBeforeReload);
      v158CompactOffers(compactCareer, compactFixture, compactState, 1, opponentReceiver, opponentPasser);
      q.check('Another same-minute offer cannot add distance or load after budget exhaustion', q.near(compactState.playerLoad.compactBudget.used[receiver], 1) && JSON.stringify(compactState.playerLoad.compactPositions[receiver]) === JSON.stringify(secondPosition));
      v158Commit({career: compactCareer, fixture: compactFixture, state: compactState}); q.verifyLoad(compactState, compactCareer);
      const firstMinuteEvents = q.events(compactState, receiver), sprintUnits = firstMinuteEvents.filter(e => e.type === 'sprint').reduce((n, e) => n + e.units, 0);
      q.check('Committed compact sprint exposure stays at most one minute despite overlapping jobs', sprintUnits > 0 && sprintUnits <= 1 + 1e-7 && firstMinuteEvents.some(e => e.type === 'pressing'), firstMinuteEvents);
      compactState.minute = 2; v158CompactMinute(compactCareer, compactFixture, compactState); v158CompactOffers(compactCareer, compactFixture, compactState, 0, receiver, passer);
      q.check('Next actual compact minute receives its own bounded movement budget', compactState.playerLoad.compactBudget.minute === 2 && compactState.playerLoad.compactBudget.used[receiver] > 0 && compactState.playerLoad.compactBudget.used[receiver] <= 1);
      v158Commit({career: compactCareer, fixture: compactFixture, state: compactState}); q.verifyLoad(compactState, compactCareer);
      evidence.push({kind: 'compact-shared-minute-budget', receiver, firstUse, sharedUse, nextMinuteUse: compactState.playerLoad.compactBudget.used[receiver], firstMinuteEvents, load: q.fixtureLoad(compactState, receiver)});
    }
    {
      const penaltyContext = await q.native(await q.career('freshness-regular-penalty-158')), {career: penaltyCareer, fixture: penaltyFixture, state: penaltyState} = penaltyContext, penaltyMatch = match;
      Object.assign(penaltyMatch, {kickoff: null, setPiece: null, throwIn: null, goalPause: 0, halftimePause: 0, postBanner: null, flight: null, rebound: null, next: Infinity});
      step(.05 * MATCH_SPEED, .05); if (penaltyState.phase === 'live' && !penaltyMatch.finished) v65AfterStep(penaltyContext);
      const penaltyKeeper = penaltyMatch.people.find(p => p.t === 1 && p.keeper), initialGoals = penaltyMatch.score[0], initialSaves = penaltyKeeper.stats.saves, pieces = [];
      for (let i = 0; i < 2; i++) {
        v50Restart('penalty', 0, {x: .5, y: .17}, 'Controlled regular penalty'); const piece = penaltyMatch.setPiece, old = Math.random;
        step(.05 * MATCH_SPEED, .05); if (penaltyState.phase === 'live' && !penaltyMatch.finished) v65AfterStep(penaltyContext);
        v50TakePenalty(piece);
        q.check('Native penalty setup does not charge a predicted keeper dive ' + i, piece.penaltyReady && !piece.loadDiveId && piece.phase === 'waiting');
        Math.random = () => 0; try { v50TakePenalty(piece); } finally { Math.random = old; }
        q.check('Actual regular penalty accepts executed keeper dive even when save fails ' + i, piece.outcome === 'goal' && piece.loadDiveId && piece.diveSide === -piece.shotSide);
        q.diagnostic = {stage: 'actual-regular-penalty', elapsed: penaltyMatch.elapsed, phase: penaltyState.phase, keeper: penaltyKeeper.pid, pending: structuredClone(penaltyState.playerLoad.pending), ledger: q.fixtureLoad(penaltyState, penaltyKeeper.pid), piece: {outcome: piece.outcome, loadDiveId: piece.loadDiveId}};
        v158Commit(penaltyContext); const delivered = JSON.stringify(penaltyState.playerLoad);
        v158PenaltyDive(penaltyMatch, piece, penaltyKeeper); v158PenaltyDive(penaltyMatch, piece, penaltyKeeper); v158Commit(penaltyContext);
        q.check('Repeated accepted regular penalty dive is inert ' + i, JSON.stringify(penaltyState.playerLoad) === delivered);
        pieces.push({id: piece.loadDiveId, outcome: piece.outcome, diveSide: piece.diveSide, shotSide: piece.shotSide}); v50FinishPenalty(piece);
        penaltyMatch.goalPause = 0; penaltyMatch.pendingKickoff = null; penaltyMatch.kickoff = null; penaltyMatch.setPiece = null;
      }
      const penaltyEvents = q.events(penaltyState, penaltyKeeper.pid).filter(e => e.type === 'keeper-dive'); q.verifyLoad(penaltyState, penaltyCareer);
      q.check('Two actual separate failed penalty saves cost one dive each with separate causes', pieces[0].id !== pieces[1].id && penaltyEvents.length === 2 && penaltyEvents.every(e => e.units === 1) && penaltyMatch.score[0] === initialGoals + 2 && penaltyKeeper.stats.saves === initialSaves, {pieces, penaltyEvents});
      let ticks = 0; while (!penaltyMatch.finished && ticks++ < 16000) {
        if (penaltyState.phase === 'paused') { v65Resume(); clearInterval(v65WorldFrame); }
        step(.05 * MATCH_SPEED, .05); if (penaltyState.phase === 'live' && !penaltyMatch.finished) v65AfterStep(penaltyContext);
      }
      q.check('Penalty boundary case reaches actual final whistle through native controller', penaltyMatch.finished && penaltyFixture.matchRecord && penaltyState.minute >= 90 && ticks < 16000);
      await v61WaitForStorage();
      // Select a post-final shootout boundary without changing the completed native result.
      const finalLoad = JSON.stringify(penaltyState.playerLoad), finalModels = JSON.stringify(q.all(penaltyCareer).map(p => [p.pid, p.fresh, p.playerModel]));
      penaltyState.phase = 'penalties'; penaltyState.penaltySession = v65PenaltySession(penaltyContext); penaltyState.penaltySession.phase = 'shooting'; v42Session = penaltyState.penaltySession;
      v65ShowWorldPenalties(penaltyContext); const originalRandom = Math.random; Math.random = () => 0;
      try { v42NextKick(); v42NextKick(); } finally { Math.random = originalRandom; }
      const kicks = structuredClone(v42Session.kicks); v158PenaltyDive(penaltyMatch, pieces[0], penaltyKeeper); v158Commit(penaltyContext); await v61WaitForStorage();
      q.check('Actual post-final shootout kicks add neither native load nor recovery', kicks.length === 2 && kicks.every(k => k.goal && k.diveSide === -k.shotSide) && JSON.stringify(penaltyState.playerLoad) === finalLoad && JSON.stringify(q.all(penaltyCareer).map(p => [p.pid, p.fresh, p.playerModel])) === finalModels);
      evidence.push({kind: 'regular-penalty-and-postfinal-shootout', pieces, penaltyEvents, ticks, finalNativeScore: [...penaltyMatch.score], controlledPostfinalBoundary: 'Actual completed native fixture; explicit shootout-phase boundary exercises original v65PenaltySession/v42NextKick without changing match result or claiming shootout eligibility.', kicks});
      v42Screen.hidden = true; v42Session = null; delete penaltyState.penaltySession; penaltyState.phase = 'finished'; running = false; clearInterval(v65WorldFrame); v65WorldActive = null; match = null;
    }
    return {checks: q.checks.slice(start), fixtureKind: 'Controlled actual native movement, standing-contact and on-target failed-save cases. Explicit positioning, initial velocity and random draw inputs select the case; original action functions determine releases and outcomes.', evidence};
  });
}

async function run() {
  const {chromium} = require(path.join(runtimeRoot, 'node_modules/playwright'));
  const built = process.argv.includes('--build'), smoke = process.argv.includes('--smoke'), controlledOnly = process.argv.includes('--controlled-only'), actionsOnly = process.argv.includes('--actions-only'), continuityOnly = process.argv.includes('--continuity-only'), snapshotOnly = process.argv.includes('--snapshot-only'), nativeCase = process.argv.includes('--native-case') ? process.argv[process.argv.indexOf('--native-case') + 1] : null;
  fs.mkdirSync(out, {recursive: true});
  const sourceRoot = path.resolve('dist'), frozen = new Map(), html = fs.readFileSync(path.join(sourceRoot, 'index.html')); frozen.set('index.html', html);
  for (const entry of html.toString().matchAll(/(?:src|href)="([^"#]+)"/g)) {
    const rel = entry[1].split('?')[0]; if (/^(?:https?:|data:|\/)/.test(rel) || !/\.(js|css)$/.test(rel)) continue;
    const file = path.resolve(sourceRoot, rel); assert(file.startsWith(sourceRoot + path.sep)); frozen.set(rel.replaceAll('\\', '/'), fs.readFileSync(file));
  }
  const buildBytes = built ? fs.readFileSync('outputs/index.html') : null, buildHtml = built ? Buffer.from(buildBytes.toString().replace('<head>', '<head><base href="/source/">')) : null;
  const report = {built, smoke, controlledOnly, actionsOnly, continuityOnly, snapshotOnly, nativeCase, sourceHashes: Object.fromEntries([...frozen].map(([file, bytes]) => ['dist/' + file, hash(bytes)])), ...(built ? {buildHash: hash(buildBytes)} : {}),
    parameterHash: hash(fs.readFileSync('dist/player-load-candidate-v158.js')), harnessHash: hash(fs.readFileSync(__filename)), nativeMatches: [], compactMatches: [], errors: [],
    measurementDefinition: 'Frozen source/build in isolated browser contexts. Native matches execute fixed 0.05 real-second source steps in 2D using the same authoritative physical controller; compact matches execute the actual compact controller. Ledger costs independently reconstructed from delivered active virtual-minute ranges and maximum same-cause action costs. Local parameters are candidates; no guarantee that any actual match consumes70. No Unity/device frame performance claim.'};
  const server = require('../../ui-redesign/serve.cjs').createServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser = null; const origin = `http://127.0.0.1:${server.address().port}`;
  async function page() {
    const context = await browser.newContext(), p = await context.newPage(); p.on('pageerror', e => report.errors.push(e.message));
    await p.route('**/source/**', route => { const rel = decodeURIComponent(new URL(route.request().url()).pathname.slice(8)), bytes = rel === 'index.html' && built ? buildHtml : frozen.get(rel); return bytes ? route.fulfill({body: bytes, contentType: rel.endsWith('.js') ? 'text/javascript' : rel.endsWith('.css') ? 'text/css' : 'text/html'}) : route.continue(); });
    await p.goto(origin + '/source/index.html?engine=browser&players=wave3');
    await p.waitForFunction(() => window.D6LoadCandidate && window.D6PlayerFoundationPreviewOptions && window.userMeshyMatchReady && typeof v158Commit === 'function', null, {timeout: 60000});
    await installProbe(p); return {p, close: () => context.close()};
  }
  const name = nativeCase ? (built ? 'native-case-build-tests.json' : 'native-case-source-tests.json') : snapshotOnly ? (built ? 'snapshot-build-tests.json' : 'snapshot-source-tests.json') : continuityOnly ? (built ? 'continuity-build-tests.json' : 'continuity-source-tests.json') : actionsOnly ? (built ? 'actions-build-tests.json' : 'actions-source-tests.json') : controlledOnly ? (built ? 'controlled-build-tests.json' : 'controlled-source-tests.json') : smoke ? (built ? 'smoke-build-tests.json' : 'smoke-source-tests.json') : built ? 'build-tests.json' : 'source-tests.json';
  let session = null;
  try {
    browser = await chromium.launch({executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true});
    if (!actionsOnly && !continuityOnly && !snapshotOnly && !nativeCase) {
    session = await page(); report.profiles = await profiles(session.p); await session.close(); console.log(JSON.stringify({stage: 'profiles', checks: report.profiles.checks.length}));
    // Controlled lifecycle/action/effective-value cases are defined below before launch.
    session = await page(); report.controlled = await controlled(session.p); await session.close(); console.log(JSON.stringify({stage: 'controlled', checks: report.controlled.checks.length}));
    }
    if (!continuityOnly && !snapshotOnly && !nativeCase) { session = await page(); report.actions = await controlledActions(session.p); await session.close(); console.log(JSON.stringify({stage: 'actions', checks: report.actions.checks.length})); }
    if (!controlledOnly && !actionsOnly && !snapshotOnly) {
      for (const seed of nativeCase ? [nativeCase] : Array.from({length: continuityOnly ? 0 : smoke ? 1 : 4}, (_, i) => 'freshness-native-' + i)) for (const mode of nativeCase ? ['candidate'] : ['baseline', 'candidate']) {
        session = await page(); const result = await nativeMatch(session.p, seed, mode); await session.close(); report.nativeMatches.push(result); console.log(JSON.stringify({stage: 'native', seed, mode, score: result.score, stats: result.stats}));
      }
      if (!nativeCase) { session = await page(); report.nativeMatches.push(await nativeMatch(session.p, 'freshness-native-continuity', 'candidate', true)); await session.close();
      for (const mode of ['baseline', 'candidate']) { session = await page(); report.compactMatches.push(await compactMatch(session.p, 'freshness-compact-0', mode)); await session.close(); }
      session = await page(); report.compactMatches.push(await compactMatch(session.p, 'freshness-compact-continuity', 'candidate', true)); await session.close(); }
    }
    if (snapshotOnly || !smoke && !controlledOnly && !actionsOnly && !continuityOnly && !nativeCase) {
      session = await page(); const pending = await pendingSnapshot(session.p); await session.close();
      const matches = [];
      for (const schedule of ['none', 'frequent']) { session = await page(); matches.push(await nativeMatch(session.p, 'freshness-native-snapshot-inert', 'candidate', false, schedule)); await session.close(); }
      assert(matches[1].additionalSnapshots > 5);
      for (const key of ['score', 'stats', 'record', 'playerLoad']) assert.deepEqual(matches[0][key], matches[1][key], 'No-extra-save/frequent-save full native ' + key + ' parity');
      report.snapshotRegression = {pending, matches, fullNativeSaveScheduleParity: true}; console.log(JSON.stringify({stage: 'snapshot-regression', saves: matches[1].additionalSnapshots, pass: true}));
    }
    report.changedDuringRun = [...frozen].filter(([file, bytes]) => !fs.existsSync(path.join(sourceRoot, file)) || hash(fs.readFileSync(path.join(sourceRoot, file))) !== hash(bytes)).map(([file]) => 'dist/' + file);
    report.harnessChangedDuringRun = hash(fs.readFileSync(__filename)) !== report.harnessHash;
    if (built) report.buildChangedDuringRun = hash(fs.readFileSync('outputs/index.html')) !== report.buildHash;
    assert.deepEqual(report.errors, []); assert.deepEqual(report.changedDuringRun, []); assert.equal(report.harnessChangedDuringRun, false); if (built) assert.equal(report.buildChangedDuringRun, false);
    report.checkedAssertions = (report.profiles?.checks.length || 0) + (report.controlled?.checks.length || 0) + (report.actions?.checks.length || 0) + [...report.nativeMatches, ...report.compactMatches].reduce((n, m) => n + m.checks.length, 0) + (report.snapshotRegression ? report.snapshotRegression.pending.checks.length + report.snapshotRegression.matches.reduce((n, m) => n + m.checks.length, 0) : 0);
    if (built && !smoke && !controlledOnly && !actionsOnly && !continuityOnly && !snapshotOnly && !nativeCase) {
      const source = JSON.parse(fs.readFileSync(path.join(out, 'source-tests.json'))); assert.equal(source.pass, true); assert.deepEqual(report.sourceHashes, source.sourceHashes); assert.equal(report.harnessHash, source.harnessHash);
      for (const kind of ['nativeMatches', 'compactMatches']) for (const row of report[kind]) {
        const before = source[kind].find(m => m.seed === row.seed && m.mode === row.mode && m.continuity === row.continuity); assert(before);
        for (const key of ['score', 'stats', 'record', 'playerLoad']) assert.deepEqual(row[key], before[key], `${kind}/${row.seed}/${row.mode} source/build ${key} parity`);
      }
      for (const row of report.snapshotRegression.matches) {
        const before = source.snapshotRegression.matches.find(m => m.snapshotSchedule === row.snapshotSchedule); assert(before);
        for (const key of ['score', 'stats', 'record', 'playerLoad']) assert.deepEqual(row[key], before[key], 'Snapshot regression source/build ' + row.snapshotSchedule + '/' + key + ' parity');
      }
      report.sourceBuildParity = true;
    }
    report.pass = true; console.log(JSON.stringify({pass: true, built, checks: report.checkedAssertions, nativeMatches: report.nativeMatches.length, compactMatches: report.compactMatches.length}));
  } catch (error) { report.pass = false; report.failure = error.stack; if (session?.p && !session.p.isClosed()) report.diagnostic = await session.p.evaluate(() => f158Q.diagnostic || null).catch(() => null); throw error; }
  finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); fs.writeFileSync(path.join(out, name), JSON.stringify(report, null, 2) + '\n'); }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
