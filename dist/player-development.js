(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.D6Development = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var SKILL_KEYS = Object.freeze(['tec', 'pas', 'fin', 'tak', 'pos', 'spd', 'sta', 'air', 'gk', 'calm', 'ant', 'dec', 'str']);
  var ADULT_KEYS = ['calm', 'ant', 'dec', 'pos'];

  function identifier(value) {
    return (typeof value === 'string' && value.length > 0) || Number.isSafeInteger(value);
  }
  function requireId(value, name) {
    if (!identifier(value)) throw new TypeError(name + ' must be a nonempty string or a safe integer');
  }
  function nonnegative(value) { return Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER; }
  function zeroDelta() {
    var delta = {};
    SKILL_KEYS.forEach(function (key) { delta[key] = 0; });
    return delta;
  }
  function validatePlayer(player) {
    if (!player || typeof player !== 'object') throw new TypeError('player is required');
    requireId(player.id, 'player.id');
    if (!Number.isSafeInteger(player.age) || player.age < 0) throw new TypeError('player.age must be a nonnegative integer');
    if (!Number.isInteger(player.talent) || player.talent < 10 || player.talent > 22) throw new TypeError('player.talent must be an integer from 10 to 22');
    SKILL_KEYS.forEach(function (key) {
      var skill = player.skills && player.skills[key];
      var cap = player.caps && player.caps[key];
      if (!Number.isFinite(skill) || skill < 1 || skill > 20) throw new TypeError('Invalid skill: ' + key);
      if (!Number.isFinite(cap) || cap < skill || cap > 20) throw new TypeError('Invalid personal cap: ' + key);
    });
  }
  function validRating(value) { return Number.isFinite(value) && value >= 1 && value <= 10; }
  function validateLedger(ledger) {
    if (!ledger || ledger.version !== 1) throw new TypeError('A version 1 development ledger is required');
    requireId(ledger.playerId, 'ledger.playerId');
    requireId(ledger.worldId, 'ledger.worldId');
    requireId(ledger.seasonId, 'ledger.seasonId');
    if (!nonnegative(ledger.seasonMinutes) || !nonnegative(ledger.weakSeriesMinutes)) throw new TypeError('Invalid ledger minutes');
    if (!Number.isFinite(ledger.negativeApplied) || ledger.negativeApplied < 0 || ledger.negativeApplied > 1) throw new TypeError('Invalid gross negative total');
    if (!Array.isArray(ledger.seasonIds) || !ledger.seasonIds.includes(ledger.seasonId)) throw new TypeError('Invalid season history');
    ledger.seasonIds.forEach(function (id) { requireId(id, 'ledger.seasonIds entry'); });
    if (!Array.isArray(ledger.processedAppearances) || !Array.isArray(ledger.ratedWindow) || ledger.ratedWindow.length > 3) throw new TypeError('Invalid appearance history');
    ledger.processedAppearances.concat(ledger.ratedWindow).forEach(function (entry) {
      if (!entry) throw new TypeError('Invalid appearance entry');
      requireId(entry.id, 'appearance entry id');
      if (entry.worldId !== ledger.worldId || !ledger.seasonIds.includes(entry.seasonId)) throw new TypeError('Invalid appearance scope');
    });
    ledger.ratedWindow.forEach(function (entry) {
      if (!nonnegative(entry.minutes) || entry.minutes === 0 || !validRating(entry.rating)) throw new TypeError('Invalid rated appearance');
    });
  }
  function cloneLedger(ledger) {
    return {
      version: 1, playerId: ledger.playerId, worldId: ledger.worldId, seasonId: ledger.seasonId,
      seasonMinutes: ledger.seasonMinutes, weakSeriesMinutes: ledger.weakSeriesMinutes,
      negativeApplied: ledger.negativeApplied, seasonIds: ledger.seasonIds.slice(),
      ratedWindow: ledger.ratedWindow.map(function (entry) { return Object.assign({}, entry); }),
      processedAppearances: ledger.processedAppearances.map(function (entry) { return Object.assign({}, entry); })
    };
  }
  function createLedger(playerId, worldId, seasonId) {
    requireId(playerId, 'playerId'); requireId(worldId, 'worldId'); requireId(seasonId, 'seasonId');
    return { version: 1, playerId: playerId, worldId: worldId, seasonId: seasonId,
      seasonMinutes: 0, weakSeriesMinutes: 0, negativeApplied: 0,
      seasonIds: [seasonId], ratedWindow: [], processedAppearances: [] };
  }
  function resetSeason(ledger, nextSeasonId) {
    validateLedger(ledger); requireId(nextSeasonId, 'nextSeasonId');
    var next = cloneLedger(ledger);
    if (nextSeasonId === ledger.seasonId) return next;
    if (ledger.seasonIds.includes(nextSeasonId)) throw new TypeError('Cannot reopen a processed season');
    next.seasonId = nextSeasonId;
    next.seasonIds.push(nextSeasonId);
    next.seasonMinutes = 0;
    next.negativeApplied = 0;
    return next;
  }
  function weightMap(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    if (Object.keys(value).some(function (key) { return !SKILL_KEYS.includes(key); })) return null;
    var weights = {}, sum = 0;
    for (var i = 0; i < SKILL_KEYS.length; i++) {
      var key = SKILL_KEYS[i], weight = Object.prototype.hasOwnProperty.call(value, key) ? value[key] : 0;
      if (!Number.isFinite(weight) || weight < 0) return null;
      weights[key] = weight; sum += weight;
    }
    return Number.isFinite(sum) && sum > 0 ? weights : null;
  }
  function ageFactor(age) {
    return age <= 19 ? 1 : age <= 21 ? 0.8 : age <= 23 ? 0.5 : age <= 29 ? 0.2 : 0.1;
  }
  function eligibleMinutes(alreadyPlayed, minutes) {
    var full = Math.min(minutes, Math.max(0, 900 - alreadyPlayed));
    var quarter = Math.min(minutes - full, Math.max(0, 1800 - Math.max(900, alreadyPlayed + full)));
    return full + quarter * 0.25;
  }
  function positiveDelta(player, weights, budget) {
    var delta = zeroDelta(), remaining = budget;
    var active = SKILL_KEYS.filter(function (key) {
      return weights[key] > 0 && (player.age < 24 || ADULT_KEYS.includes(key)) && player.caps[key] > player.skills[key];
    });
    // Repeatedly redistribute only within the injected, age-appropriate recipients.
    while (remaining > 0 && active.length) {
      var weightSum = active.reduce(function (sum, key) { return sum + weights[key]; }, 0);
      var distributed = 0, saturated = [];
      active.forEach(function (key) {
        var room = player.caps[key] - player.skills[key] - delta[key];
        var share = remaining * (weights[key] / weightSum);
        var applied = Math.min(room, share);
        delta[key] += applied; distributed += applied;
        if (share >= room) saturated.push(key);
      });
      remaining = Math.max(0, remaining - distributed);
      if (!saturated.length) break;
      active = active.filter(function (key) { return !saturated.includes(key); });
    }
    return delta;
  }
  function negativeDelta(player, weights, budget) {
    var delta = zeroDelta();
    var weightSum = SKILL_KEYS.reduce(function (sum, key) { return sum + weights[key]; }, 0);
    SKILL_KEYS.forEach(function (key) {
      delta[key] = -Math.min(player.skills[key] - 1, budget * (weights[key] / weightSum));
      if (delta[key] === 0) delta[key] = 0;
    });
    return delta;
  }
  function result(status, reason, ledger, delta, remainder) {
    return { status: status, reason: reason, skillDelta: delta || zeroDelta(),
      nextLedger: cloneLedger(ledger), rejectedRemainder: remainder || 0 };
  }
  function developmentDelta(player, ledger, appearance, approvedWeights) {
    validatePlayer(player); validateLedger(ledger);
    if (ledger.playerId !== player.id) throw new TypeError('Ledger belongs to another player');
    if (!appearance || typeof appearance !== 'object') throw new TypeError('appearance is required');
    requireId(appearance.id, 'appearance.id'); requireId(appearance.worldId, 'appearance.worldId'); requireId(appearance.seasonId, 'appearance.seasonId');
    if (!nonnegative(appearance.minutes) || !nonnegative(ledger.seasonMinutes + appearance.minutes) || !nonnegative(ledger.weakSeriesMinutes + appearance.minutes)) throw new TypeError('Invalid appearance minutes');
    if (ledger.processedAppearances.some(function (entry) {
      return entry.worldId === appearance.worldId && entry.seasonId === appearance.seasonId && entry.id === appearance.id;
    })) return result('duplicate', 'already-processed', ledger);
    if (appearance.worldId !== ledger.worldId || appearance.seasonId !== ledger.seasonId) return result('unsupported', 'scope-mismatch', ledger);
    if (appearance.minutes === 0) return result('no-change', 'no-minutes', ledger);
    if (!validRating(appearance.rating)) return result('unsupported', 'missing-or-invalid-rating', ledger);
    var weights = weightMap(appearance.skillWeights), approved = weightMap(approvedWeights);
    if (!weights || !approved) return result('unsupported', 'missing-or-invalid-weights', ledger);
    if (SKILL_KEYS.some(function (key) { return weights[key] !== approved[key]; })) return result('unsupported', 'unapproved-weights', ledger);

    var next = cloneLedger(ledger);
    next.seasonMinutes += appearance.minutes;
    next.weakSeriesMinutes = appearance.rating < 5.5 ? next.weakSeriesMinutes + appearance.minutes : 0;
    next.processedAppearances.push({ id: appearance.id, worldId: appearance.worldId, seasonId: appearance.seasonId });
    next.ratedWindow.push({ id: appearance.id, worldId: appearance.worldId, seasonId: appearance.seasonId, minutes: appearance.minutes, rating: appearance.rating });
    next.ratedWindow = next.ratedWindow.slice(-3);
    var minutes = next.ratedWindow.reduce(function (sum, entry) { return sum + entry.minutes; }, 0);
    var rating = next.ratedWindow.reduce(function (sum, entry) { return sum + entry.rating * entry.minutes; }, 0) / minutes;
    var delta = zeroDelta(), budget = 0;
    if (rating >= 6.5) {
      budget = 0.5 * (player.talent / 19) * ageFactor(player.age) * eligibleMinutes(ledger.seasonMinutes, appearance.minutes) / 90;
      delta = positiveDelta(player, weights, budget);
    } else if (player.age < 24 && next.ratedWindow.length === 3 && next.weakSeriesMinutes >= 90 && next.ratedWindow.every(function (entry) { return entry.rating < 5.5; })) {
      budget = 0.1 * appearance.minutes / 90;
      delta = negativeDelta(player, weights, Math.min(budget, 1 - ledger.negativeApplied));
    }
    // Use representable skill changes for both the transaction and the gross cap.
    SKILL_KEYS.forEach(function (key) {
      delta[key] = Math.max(1, Math.min(player.caps[key], player.skills[key] + delta[key])) - player.skills[key];
    });
    var applied = SKILL_KEYS.reduce(function (sum, key) { return sum + Math.abs(delta[key]); }, 0);
    if (SKILL_KEYS.some(function (key) { return delta[key] < 0; })) next.negativeApplied = Math.min(1, ledger.negativeApplied + applied);
    return result(applied > 0 ? 'applied' : 'no-change', null, next, delta, Math.max(0, budget - applied));
  }

  return Object.freeze({ SKILL_KEYS: SKILL_KEYS, createLedger: createLedger, resetSeason: resetSeason, developmentDelta: developmentDelta });
}));
