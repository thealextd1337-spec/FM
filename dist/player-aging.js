(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.D6Aging = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var SKILL_KEYS = Object.freeze(['tec', 'pas', 'fin', 'tak', 'pos', 'spd', 'sta', 'air', 'gk', 'calm', 'ant', 'dec', 'str']);
  function requireId(value, name) {
    if (!((typeof value === 'string' && value.length > 0) || Number.isSafeInteger(value))) throw new TypeError(name + ' must be a nonempty string or a safe integer');
  }
  function zeroDelta() {
    var delta = {};
    SKILL_KEYS.forEach(function (key) { delta[key] = 0; });
    return delta;
  }
  function validateSkills(skills) {
    SKILL_KEYS.forEach(function (key) {
      if (!skills || !Number.isFinite(skills[key]) || skills[key] < 1 || skills[key] > 20) throw new TypeError('Invalid skill: ' + key);
    });
  }
  function validateAge(age) {
    if (!Number.isSafeInteger(age) || age < 0) throw new TypeError('newAge must be a nonnegative integer');
  }
  function agingDelta(baseSkills, newAge) {
    validateSkills(baseSkills); validateAge(newAge);
    var delta = zeroDelta();
    if (newAge < 30) return delta;
    var amount = newAge < 33 ? 0.5 : 1;
    ['spd', 'str', 'sta'].forEach(function (key) {
      var loss = key === 'sta' ? amount / 2 : amount;
      delta[key] = Math.max(1, baseSkills[key] - loss) - baseSkills[key];
    });
    return delta;
  }
  function createLedger(playerId, worldId) {
    requireId(playerId, 'playerId'); requireId(worldId, 'worldId');
    return { version: 1, playerId: playerId, worldId: worldId, processedSeasons: [] };
  }
  function cloneLedger(ledger) {
    return { version: 1, playerId: ledger.playerId, worldId: ledger.worldId,
      processedSeasons: ledger.processedSeasons.map(function (entry) { return Object.assign({}, entry); }) };
  }
  function validateLedger(ledger) {
    if (!ledger || ledger.version !== 1 || !Array.isArray(ledger.processedSeasons)) throw new TypeError('A version 1 aging ledger is required');
    requireId(ledger.playerId, 'ledger.playerId'); requireId(ledger.worldId, 'ledger.worldId');
    ledger.processedSeasons.forEach(function (entry) {
      if (!entry || entry.worldId !== ledger.worldId) throw new TypeError('Invalid aging scope');
      requireId(entry.seasonId, 'processed seasonId'); validateAge(entry.newAge);
    });
  }
  function agingTransition(baseSkills, ledger, transition) {
    validateSkills(baseSkills); validateLedger(ledger);
    if (!transition || typeof transition !== 'object') throw new TypeError('transition is required');
    requireId(transition.worldId, 'transition.worldId'); requireId(transition.seasonId, 'transition.seasonId'); validateAge(transition.newAge);
    var next = cloneLedger(ledger);
    if (transition.worldId !== ledger.worldId) return { status: 'unsupported', reason: 'scope-mismatch', skillDelta: zeroDelta(), nextLedger: next };
    if (ledger.processedSeasons.some(function (entry) { return entry.worldId === transition.worldId && entry.seasonId === transition.seasonId; })) {
      return { status: 'duplicate', reason: 'already-processed', skillDelta: zeroDelta(), nextLedger: next };
    }
    if (ledger.processedSeasons.length && transition.newAge <= ledger.processedSeasons[ledger.processedSeasons.length - 1].newAge) {
      return { status: 'unsupported', reason: 'out-of-order-transition', skillDelta: zeroDelta(), nextLedger: next };
    }
    var delta = agingDelta(baseSkills, transition.newAge);
    next.processedSeasons.push({ worldId: transition.worldId, seasonId: transition.seasonId, newAge: transition.newAge });
    return { status: SKILL_KEYS.some(function (key) { return delta[key] < 0; }) ? 'applied' : 'no-change', reason: null, skillDelta: delta, nextLedger: next };
  }
  return Object.freeze({ SKILL_KEYS: SKILL_KEYS, createLedger: createLedger, agingDelta: agingDelta, agingTransition: agingTransition });
}));
