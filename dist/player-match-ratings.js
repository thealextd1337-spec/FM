(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.D6MatchRatings = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var EVENT_TYPES = Object.freeze(['pass', 'receive', 'shot', 'save', 'tackle', 'interception', 'carry', 'support-run', 'cover', 'error']);
  var ROLE_IDS = Object.freeze(['line-keeper', 'sweeper-keeper', 'cover-defender', 'stopper', 'ball-playing-defender', 'playmaker', 'ball-winner', 'box-to-box', 'winger', 'poacher', 'striker', 'target-player', 'dribbler']);
  var SKILL_KEYS = Object.freeze(['tec', 'pas', 'fin', 'tak', 'pos', 'spd', 'sta', 'air', 'gk', 'calm', 'ant', 'dec', 'str']);
  var POSITION_IDS = ['gk', 'def', 'mid', 'att'];
  var DEFENSIVE_TYPES = ['save', 'tackle', 'interception', 'cover'];
  var ATTACK_TYPES = ['pass', 'receive', 'shot', 'carry', 'support-run'];
  function freeze(value) {
    if (value && typeof value === 'object') { Object.keys(value).forEach(function (key) { freeze(value[key]); }); Object.freeze(value); }
    return value;
  }
  function roleFactors(factors) {
    var result = {};
    EVENT_TYPES.forEach(function (type) { result[type] = factors[type] === undefined ? 1 : factors[type]; });
    return result;
  }

  // Every number here is an explicit local test candidate, not a production default.
  var candidateParameters = freeze({
    version: 1, id: 'wave3-rating-candidate-1', baseline: 6,
    minimumRating: 1, maximumRating: 10, visibleMinutes: 20,
    referenceMinutes: 90, minimumExposureMinutes: 20,
    positiveLimit: 3.5, negativeLimit: 5, safePositiveLimit: 0.15,
    safeDifficulty: 0.2, safeUsefulness: 0.2, safeProgressMetres: 3,
    repeatDecay: 0.55, repeatWindowMinutes: 5, progressiveDistanceMetres: 20, progressUsefulnessWeight: 0.25,
    successBase: 0.02, successDifficultyWeight: 0.2, successUsefulnessWeight: 0.78,
    usefulDecisionOnFailure: 0.18, ordinaryFailureCost: 0.2,
    attributedFailureCost: 1.25, pressureRelief: 0.35,
    missingDifficulty: 0, missingUsefulness: 0, missingPressure: 0,
    orientationTaskFactor: 0.12, phaseAllocationWeight: 0.2, eventAllocationWeight: 1,
    eventWeights: { pass: 0.3, receive: 0.12, shot: 0.65, save: 0.72, tackle: 0.43, interception: 0.46, carry: 0.32, 'support-run': 0.27, cover: 0.3, error: 1.05 },
    positiveTypeLimits: { pass: 1.15, receive: 0.4, shot: 1.8, save: 2.5, tackle: 1.6, interception: 1.6, carry: 1.1, 'support-run': 1.3, cover: 1.5, error: 0 },
    roleFactors: {
      'line-keeper': roleFactors({ save: 1.45, cover: 1.3, pass: 0.75, receive: 0.8, shot: 0.6, carry: 0.6, 'support-run': 0.6 }),
      'sweeper-keeper': roleFactors({ save: 1.35, cover: 1.35, interception: 1.35, pass: 1.15, receive: 1.1, shot: 0.6 }),
      'cover-defender': roleFactors({ cover: 1.5, interception: 1.35, tackle: 1.1, shot: 0.7, 'support-run': 0.8 }),
      stopper: roleFactors({ tackle: 1.5, interception: 1.25, cover: 1.2, shot: 0.7 }),
      'ball-playing-defender': roleFactors({ pass: 1.35, carry: 1.25, cover: 1.3, interception: 1.15, shot: 0.8 }),
      playmaker: roleFactors({ pass: 1.5, receive: 1.25, 'support-run': 1.35, carry: 1.1 }),
      'ball-winner': roleFactors({ cover: 1.45, interception: 1.5, tackle: 1.5, pass: 1.15, shot: 0.8 }),
      'box-to-box': roleFactors({ 'support-run': 1.4, cover: 1.3, pass: 1.15, carry: 1.15, tackle: 1.15 }),
      winger: roleFactors({ pass: 1.35, carry: 1.3, 'support-run': 1.4, receive: 1.2, cover: 1.1 }),
      poacher: roleFactors({ shot: 1.5, 'support-run': 1.4, receive: 1.25, cover: 0.8, tackle: 0.8 }),
      striker: roleFactors({ shot: 1.35, 'support-run': 1.5, receive: 1.25, tackle: 1.1 }),
      'target-player': roleFactors({ receive: 1.5, pass: 1.4, 'support-run': 1.1, shot: 1.2 }),
      dribbler: roleFactors({ carry: 1.5, receive: 1.3, pass: 1.2, shot: 1.2, 'support-run': 1.2 })
    },
    roleSkillWeights: {
      'line-keeper': { gk: 4, pos: 2, ant: 2, dec: 1, calm: 1 },
      'sweeper-keeper': { gk: 3, pos: 2, ant: 2, dec: 2, pas: 1, tec: 1, calm: 1 },
      'cover-defender': { pos: 3, ant: 3, dec: 2, tak: 1, spd: 1 },
      stopper: { tak: 3, str: 2, pos: 2, ant: 2, dec: 1 },
      'ball-playing-defender': { pas: 3, tec: 2, dec: 2, calm: 1, pos: 2 },
      playmaker: { pas: 3, tec: 2, ant: 2, dec: 2, calm: 1, pos: 1 },
      'ball-winner': { tak: 3, pos: 3, ant: 2, dec: 2, str: 1, sta: 1 },
      'box-to-box': { sta: 3, pos: 2, ant: 2, dec: 2, spd: 2, pas: 1, tec: 1 },
      winger: { pas: 3, tec: 2, spd: 2, pos: 2, dec: 2 },
      poacher: { fin: 4, pos: 3, tec: 2, ant: 1, air: 1 },
      striker: { spd: 3, pos: 3, tec: 2, fin: 3, ant: 2 },
      'target-player': { tec: 3, pas: 3, str: 3, pos: 2, calm: 2, air: 1 },
      dribbler: { tec: 4, spd: 3, dec: 3, pas: 1, fin: 1, pos: 1 }
    },
    eventSkillWeights: {
      pass: { pas: 4, dec: 2, tec: 1, calm: 1 }, receive: { tec: 4, pos: 2, ant: 1, calm: 1 },
      shot: { fin: 4, tec: 2, dec: 1, calm: 1 }, save: { gk: 4, ant: 2, pos: 2, dec: 1 },
      tackle: { tak: 4, str: 2, ant: 1, dec: 1 }, interception: { ant: 4, pos: 3, dec: 2, spd: 1 },
      carry: { tec: 4, spd: 2, dec: 2, str: 1 }, 'support-run': { pos: 4, ant: 3, spd: 2, dec: 2, sta: 1 },
      cover: { pos: 4, ant: 3, dec: 3, sta: 1 }, error: { dec: 3, calm: 2, tec: 1 }
    }
  });

  function id(value, name) {
    if (!(typeof value === 'string' && value.length > 0) && !Number.isSafeInteger(value)) throw new TypeError(name + ' must be a nonempty string or safe integer');
  }
  function nonnegative(value, name) { if (!Number.isFinite(value) || value < 0) throw new TypeError(name + ' must be finite and nonnegative'); }
  function positive(value, name) { nonnegative(value, name); if (value === 0) throw new TypeError(name + ' must be positive'); }
  function normalized(value, name) { nonnegative(value, name); if (value > 1) throw new TypeError(name + ' must be between 0 and 1'); }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function weights(value, name) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(name + ' is required');
    var sum = 0;
    Object.keys(value).forEach(function (key) {
      if (!SKILL_KEYS.includes(key)) throw new TypeError('Unknown skill in ' + name + ': ' + key);
      nonnegative(value[key], name + '.' + key); sum += value[key];
    });
    if (!(sum > 0) || !Number.isFinite(sum)) throw new TypeError(name + ' must have a finite positive sum');
  }
  function validateParameters(p) {
    if (!p || p.version !== 1) throw new TypeError('Explicit version 1 rating parameters are required');
    id(p.id, 'parameters.id');
    ['minimumRating', 'maximumRating', 'referenceMinutes', 'minimumExposureMinutes', 'positiveLimit', 'negativeLimit', 'repeatWindowMinutes', 'progressiveDistanceMetres'].forEach(function (key) { positive(p[key], 'parameters.' + key); });
    ['baseline', 'visibleMinutes', 'safePositiveLimit', 'safeProgressMetres', 'attributedFailureCost', 'phaseAllocationWeight', 'eventAllocationWeight'].forEach(function (key) { nonnegative(p[key], 'parameters.' + key); });
    ['safeDifficulty', 'safeUsefulness', 'repeatDecay', 'progressUsefulnessWeight', 'successBase', 'successDifficultyWeight', 'successUsefulnessWeight', 'usefulDecisionOnFailure', 'ordinaryFailureCost', 'pressureRelief', 'missingDifficulty', 'missingUsefulness', 'missingPressure', 'orientationTaskFactor'].forEach(function (key) { normalized(p[key], 'parameters.' + key); });
    if (p.minimumRating !== 1 || p.maximumRating !== 10 || p.baseline < 1 || p.baseline > 10 || p.visibleMinutes !== 20) throw new TypeError('Rating range 1–10 and visible threshold 20 are fixed by the contract');
    if (p.repeatDecay >= 1) throw new TypeError('Repeat decay must be less than 1');
    EVENT_TYPES.forEach(function (type) {
      nonnegative(p.eventWeights && p.eventWeights[type], 'eventWeights.' + type);
      nonnegative(p.positiveTypeLimits && p.positiveTypeLimits[type], 'positiveTypeLimits.' + type);
      weights(p.eventSkillWeights && p.eventSkillWeights[type], 'eventSkillWeights.' + type);
    });
    ROLE_IDS.forEach(function (role) {
      EVENT_TYPES.forEach(function (type) { nonnegative(p.roleFactors && p.roleFactors[role] && p.roleFactors[role][type], 'roleFactors.' + role + '.' + type); });
      weights(p.roleSkillWeights && p.roleSkillWeights[role], 'roleSkillWeights.' + role);
    });
  }
  function phasesFor(input) {
    if (!Array.isArray(input.rolePositionPhases)) throw new TypeError('rolePositionPhases must be an array');
    var phases = input.rolePositionPhases.map(function (phase) {
      if (!phase) throw new TypeError('Invalid role phase');
      nonnegative(phase.startMinute, 'phase.startMinute'); nonnegative(phase.endMinute, 'phase.endMinute');
      if (phase.endMinute <= phase.startMinute || !POSITION_IDS.includes(phase.position) || !ROLE_IDS.includes(phase.roleId) || ![-1, 0, 1].includes(phase.orientation)) throw new TypeError('Invalid phase time, position, role or orientation');
      if ((phase.position === 'gk') !== ['line-keeper', 'sweeper-keeper'].includes(phase.roleId)) throw new TypeError('Keeper phases must retain keeper roles');
      return { startMinute: phase.startMinute, endMinute: phase.endMinute, position: phase.position, roleId: phase.roleId, orientation: phase.orientation };
    }).sort(function (a, b) { return a.startMinute - b.startMinute; });
    var minutes = 0;
    phases.forEach(function (phase, index) {
      if (index && phases[index - 1].endMinute > phase.startMinute) throw new TypeError('Role phases cannot overlap');
      minutes += phase.endMinute - phase.startMinute;
    });
    if (minutes > input.virtualMinutes + 1e-8) throw new TypeError('Role phase duration exceeds actual appearance minutes');
    return { phases: phases, minutes: minutes };
  }
  function phaseAt(phases, minute) {
    for (var i = 0; i < phases.length; i++) {
      if (minute >= phases[i].startMinute && (minute < phases[i].endMinute || (i === phases.length - 1 && minute === phases[i].endMinute))) return i;
    }
    return -1;
  }
  function eventsFor(input, phases) {
    if (!Array.isArray(input.actualEvents)) throw new TypeError('actualEvents must be an array');
    var seen = new Map(), events = [], ignored = { foreign: 0, outsidePhases: 0, duplicate: 0 };
    input.actualEvents.forEach(function (event) {
      if (!event || event.playerId !== input.playerId) { ignored.foreign++; return; }
      id(event.id, 'event.id'); nonnegative(event.minute, 'event.minute');
      if (!EVENT_TYPES.includes(event.type) || typeof event.success !== 'boolean') throw new TypeError('Invalid event type or observed result');
      var context = event.context || {}, clean = {}, missing = [];
      if (typeof context !== 'object' || Array.isArray(context)) throw new TypeError('Event context must be an object');
      ['difficulty', 'usefulness', 'pressure'].forEach(function (key) {
        if (context[key] === undefined || context[key] === null) missing.push(key);
        else { normalized(context[key], 'context.' + key); clean[key] = context[key]; }
      });
      if (context.progressMetres !== undefined && context.progressMetres !== null) {
        if (!Number.isFinite(context.progressMetres)) throw new TypeError('progressMetres must be finite');
        clean.progressMetres = context.progressMetres;
      }
      if (context.repeatKey !== undefined && context.repeatKey !== null) { id(context.repeatKey, 'context.repeatKey'); clean.repeatKey = context.repeatKey; }
      if (context.errorAttribution !== undefined && typeof context.errorAttribution !== 'boolean') throw new TypeError('errorAttribution must be boolean');
      clean.errorAttribution = context.errorAttribution === true;
      var next = { id: event.id, minute: event.minute, playerId: event.playerId, type: event.type, success: event.success, context: clean };
      var identity = typeof event.id + ':' + event.id, signature = JSON.stringify(next);
      if (seen.has(identity)) {
        if (seen.get(identity) !== signature) throw new TypeError('Conflicting events share an ID: ' + event.id);
        ignored.duplicate++; return;
      }
      seen.set(identity, signature);
      var phaseIndex = phaseAt(phases, event.minute);
      if (phases.length && phaseIndex === -1) { ignored.outsidePhases++; return; }
      next.phaseIndex = phaseIndex; next.missingContext = missing; events.push(next);
    });
    events.sort(function (a, b) {
      var aId = typeof a.id + ':' + a.id, bId = typeof b.id + ':' + b.id;
      return a.minute - b.minute || (aId < bId ? -1 : aId > bId ? 1 : 0);
    });
    return { events: events, ignored: ignored };
  }
  function allocate(target, source, amount) {
    var sum = Object.keys(source).reduce(function (total, key) { return total + source[key]; }, 0);
    Object.keys(source).forEach(function (key) { if (source[key] > 0 && amount > 0) target[key] = (target[key] || 0) + source[key] / sum * amount; });
  }
  function normalizedWeights(source) {
    var sum = Object.keys(source).reduce(function (total, key) { return total + source[key]; }, 0), result = {};
    SKILL_KEYS.forEach(function (key) { if (source[key] > 0) result[key] = source[key] / sum; });
    return result;
  }
  function boundedPositive(total, limit) { return limit === 0 ? 0 : limit * (1 - Math.exp(-total / limit)); }

  function rateAppearance(input, parameters) {
    validateParameters(parameters);
    if (!input || typeof input !== 'object') throw new TypeError('Appearance input is required');
    ['playerId', 'fixtureId', 'worldId', 'seasonId'].forEach(function (key) { id(input[key], key); });
    nonnegative(input.virtualMinutes, 'virtualMinutes');
    var output = { status: input.virtualMinutes > 0 ? 'rated' : 'no-appearance', id: input.fixtureId + ':' + input.playerId,
      playerId: input.playerId, fixtureId: input.fixtureId, worldId: input.worldId, seasonId: input.seasonId,
      minutes: input.virtualMinutes, rating: null, visibleRating: null, skillWeights: {}, contributions: null };
    var captured = phasesFor(input), prepared = eventsFor(input, captured.phases), p = parameters;
    if (input.virtualMinutes === 0) return output;
    var allocations = {}, repeats = new Map(), positiveTypes = {}, negative = 0, safePositive = 0;
    var phaseContributions = captured.phases.map(function (phase) {
      var duration = phase.endMinute - phase.startMinute;
      allocate(allocations, p.roleSkillWeights[phase.roleId], p.phaseAllocationWeight * duration / input.virtualMinutes);
      return Object.assign({}, phase, { minutes: duration, events: 0, positive: 0, negative: 0 });
    });
    var eventContributions = [], missingContextEvents = 0;
    prepared.events.forEach(function (event) {
      var phase = event.phaseIndex === -1 ? null : captured.phases[event.phaseIndex], context = event.context;
      var difficulty = context.difficulty === undefined ? p.missingDifficulty : context.difficulty;
      var usefulness = context.usefulness === undefined ? p.missingUsefulness : context.usefulness;
      var pressure = context.pressure === undefined ? p.missingPressure : context.pressure;
      if (context.progressMetres !== undefined && ['pass', 'carry'].includes(event.type)) {
        usefulness = Math.max(usefulness, clamp(context.progressMetres / p.progressiveDistanceMetres, 0, 1) * p.progressUsefulnessWeight);
      }
      var factor = phase ? p.roleFactors[phase.roleId][event.type] : 1;
      if (phase && DEFENSIVE_TYPES.includes(event.type)) factor *= 1 - phase.orientation * p.orientationTaskFactor;
      if (phase && ATTACK_TYPES.includes(event.type)) factor *= 1 + phase.orientation * p.orientationTaskFactor;
      var weight = p.eventWeights[event.type] * factor, decision = 0, outcome = 0, penalty = 0;
      // A planned support run is not an observation. Without observed usefulness it earns no credit.
      var observedOffBall = !['support-run', 'cover'].includes(event.type) || context.usefulness !== undefined;
      if (event.type === 'error') {
        if (context.errorAttribution) penalty = weight * p.attributedFailureCost * (1 + usefulness);
      } else if (observedOffBall) {
        decision = weight * usefulness * (event.success ? p.successUsefulnessWeight : p.usefulDecisionOnFailure);
        if (event.success) outcome = weight * (p.successBase + p.successDifficultyWeight * difficulty);
        else if (context.errorAttribution) penalty = weight * p.attributedFailureCost * (1 + usefulness) * (1 - p.pressureRelief * pressure);
        else if (event.type !== 'save') penalty = weight * p.ordinaryFailureCost * (1 - difficulty) * (1 - p.pressureRelief * pressure);
      }
      var safe = difficulty <= p.safeDifficulty && usefulness <= p.safeUsefulness && (context.progressMetres === undefined || context.progressMetres <= p.safeProgressMetres);
      var repeatKey = event.type + ':' + (context.repeatKey === undefined ? 'event:' + typeof event.id + ':' + event.id : typeof context.repeatKey + ':' + context.repeatKey)
        + ':window:' + Math.floor(event.minute / p.repeatWindowMinutes);
      var repeated = repeats.get(repeatKey) || 0;
      repeats.set(repeatKey, repeated + 1);
      var repeatFactor = Math.pow(p.repeatDecay, repeated), positive = (decision + outcome) * repeatFactor;
      // A repeated attributed execution mistake remains a mistake; repeat filtering only prevents credit farming.
      negative += penalty;
      if (safe) safePositive += positive;
      else positiveTypes[event.type] = (positiveTypes[event.type] || 0) + positive;
      if (observedOffBall) {
        var actionExposure = event.type === 'error' && !context.errorAttribution ? 0 : (positive + penalty) * p.eventAllocationWeight;
        allocate(allocations, p.eventSkillWeights[event.type], actionExposure);
      }
      if (event.missingContext.length) missingContextEvents++;
      if (phase) {
        phaseContributions[event.phaseIndex].events++;
        phaseContributions[event.phaseIndex].positive += positive;
        phaseContributions[event.phaseIndex].negative += penalty;
      }
      eventContributions.push({ id: event.id, minute: event.minute, type: event.type, roleId: phase ? phase.roleId : null,
        decision: decision, outcome: outcome, penalty: penalty, repeatFactor: repeatFactor, positive: positive,
        missingContext: event.missingContext.slice() });
    });
    var positive = Math.min(safePositive, p.safePositiveLimit);
    EVENT_TYPES.forEach(function (type) { positive += boundedPositive(positiveTypes[type] || 0, p.positiveTypeLimits[type]); });
    var exposureFactor = Math.sqrt(p.referenceMinutes / Math.max(p.minimumExposureMinutes, input.virtualMinutes));
    var positiveDelta = Math.min(p.positiveLimit, positive * exposureFactor);
    var negativeDelta = Math.min(p.negativeLimit, negative * exposureFactor);
    output.rating = clamp(p.baseline + positiveDelta - negativeDelta, p.minimumRating, p.maximumRating);
    output.visibleRating = output.minutes >= p.visibleMinutes ? output.rating : null;
    output.skillWeights = normalizedWeights(allocations);
    output.contributions = { parameterId: p.id, baseline: p.baseline, positive: positiveDelta, negative: negativeDelta,
      exposureFactor: exposureFactor, capturedPhaseMinutes: captured.minutes, missingPhaseMinutes: Math.max(0, input.virtualMinutes - captured.minutes),
      missingContextEvents: missingContextEvents, observedEvents: prepared.events.length,
      ignoredEvents: prepared.ignored, phases: phaseContributions, events: eventContributions };
    return output;
  }

  return Object.freeze({ EVENT_TYPES: EVENT_TYPES, ROLE_IDS: ROLE_IDS, SKILL_KEYS: SKILL_KEYS, candidateParameters: candidateParameters, rateAppearance: rateAppearance });
}));
