(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.D6Freshness = factory();
}(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  var SCHEMA = 'd6-freshness-1';
  var EVENT_TYPES = ['sprint', 'pressing', 'intense-duel', 'keeper-jump', 'keeper-dive', 'field-jump'];

  function finite(value, name) {
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(name + ' must be finite');
    return value;
  }
  function boundedFreshness(value) { return Math.max(0, Math.min(100, finite(value, 'freshness'))); }
  function identifier(value, name) {
    if (typeof value !== 'string' || !value.trim()) throw new TypeError(name + ' requires a stable nonempty string');
    return value;
  }
  function object(value, name) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(name + ' must be an object');
    return value;
  }
  function nonnegative(value, name) {
    finite(value, name); if (value < 0) throw new RangeError(name + ' cannot be negative'); return value;
  }
  function near(a, b) { return Math.abs(a - b) <= 1e-9; }
  function copy(value) { return JSON.parse(JSON.stringify(value)); }
  function entries(array, key, name, validate) {
    var seen = [];
    array.forEach(function (entry) {
      object(entry, name); identifier(entry[key], name + '.' + key);
      if (seen.indexOf(entry[key]) >= 0) throw new Error('duplicate ' + name + ' identity');
      seen.push(entry[key]); validate(entry);
    });
  }

  function createState(id, freshness) {
    return {schema: SCHEMA, id: identifier(id, 'player id'), freshness: boundedFreshness(freshness), ledger: {loads: [], fixtures: [], transitions: []}};
  }
  function cloneState(state) {
    object(state, 'state'); identifier(state.id, 'player id');
    if (state.schema !== SCHEMA) throw new TypeError('unsupported freshness schema');
    finite(state.freshness, 'state.freshness');
    if (state.freshness < 0 || state.freshness > 100) throw new RangeError('state.freshness out of bounds');
    var ledger = object(state.ledger, 'state.ledger');
    ['loads', 'fixtures', 'transitions'].forEach(function (key) { if (!Array.isArray(ledger[key])) throw new TypeError('ledger.' + key + ' must be an array'); });
    var cloned = copy(state);
    entries(cloned.ledger.fixtures, 'id', 'fixture', function (fixture) {
      if (!Array.isArray(fixture.minuteRanges) || !Array.isArray(fixture.events) || !Array.isArray(fixture.causes)) throw new TypeError('invalid fixture ledger');
      nonnegative(fixture.consumed, 'fixture.consumed');
      if (typeof fixture.keeper !== 'boolean') throw new TypeError('fixture.keeper must be boolean');
      finite(fixture.stamina, 'fixture.stamina');
      if (fixture.stamina < 1 || fixture.stamina > 20) throw new RangeError('fixture.stamina out of bounds');
      identifier(fixture.loadConfig, 'fixture.loadConfig');
      fixture.minuteRanges.forEach(function (range, index) {
        object(range, 'minute range'); nonnegative(range.startMinute, 'startMinute'); nonnegative(range.endMinute, 'endMinute');
        if (range.endMinute <= range.startMinute || (index && range.startMinute <= fixture.minuteRanges[index - 1].endMinute)) throw new RangeError('invalid merged minute ranges');
      });
      entries(fixture.events, 'id', 'event ledger', function (entry) { identifier(entry.signature, 'event signature'); });
      entries(fixture.causes, 'key', 'cause ledger', function (entry) { nonnegative(entry.cost, 'cause cost'); });
    });
    entries(cloned.ledger.loads, 'id', 'load ledger', function (entry) {
      identifier(entry.fixtureId, 'load fixtureId'); identifier(entry.signature, 'load signature');
      if (!cloned.ledger.fixtures.some(function (fixture) { return fixture.id === entry.fixtureId; })) throw new Error('load ledger references missing fixture');
    });
    entries(cloned.ledger.transitions, 'id', 'transition ledger', function (entry) { identifier(entry.signature, 'transition signature'); identifier(entry.cause, 'transition cause'); });
    return cloned;
  }
  function serializeState(state) { return JSON.stringify(cloneState(state)); }
  function restoreState(serialized) {
    if (typeof serialized !== 'string') throw new TypeError('serialized state must be JSON text');
    return cloneState(JSON.parse(serialized));
  }

  function normalizeLoad(load) {
    object(load, 'load'); identifier(load.id, 'load id'); identifier(load.fixtureId, 'fixtureId');
    var stamina = finite(load.stamina, 'load.stamina');
    if (stamina < 1 || stamina > 20) throw new RangeError('stamina must be between 1 and 20');
    if (typeof load.keeper !== 'boolean') throw new TypeError('load.keeper must be boolean');
    if (!Array.isArray(load.intervals) || !Array.isArray(load.events)) throw new TypeError('load requires actual intervals and events arrays');
    var intervals = load.intervals.map(function (range) {
      object(range, 'interval'); var start = nonnegative(range.startMinute, 'startMinute'), end = nonnegative(range.endMinute, 'endMinute');
      if (end <= start) throw new RangeError('actual interval must have positive duration');
      return {startMinute: start, endMinute: end};
    }).sort(function (a, b) { return a.startMinute - b.startMinute || a.endMinute - b.endMinute; });
    var events = load.events.map(function (event) {
      object(event, 'event'); identifier(event.id, 'event id'); identifier(event.causeId, 'event causeId');
      if (EVENT_TYPES.indexOf(event.type) < 0) throw new TypeError('unknown actual load event type');
      var minute = nonnegative(event.minute, 'event virtual minute');
      var units = ['sprint', 'pressing', 'intense-duel'].indexOf(event.type) >= 0 ? nonnegative(event.units, 'event.units') : 1;
      return {id: event.id, causeId: event.causeId, type: event.type, minute: minute, units: units};
    }).sort(function (a, b) { return a.minute - b.minute || a.id.localeCompare(b.id); });
    return {id: load.id, fixtureId: load.fixtureId, stamina: stamina, keeper: load.keeper, intervals: intervals, events: events};
  }

  function validateParameters(parameters) {
    object(parameters, 'approvedParameters'); var partitions = object(parameters.loadPartition, 'loadPartition');
    ['field', 'keeper'].forEach(function (kind) {
      var part = object(partitions[kind], 'loadPartition.' + kind);
      nonnegative(part.basePerMinute, kind + '.basePerMinute'); nonnegative(part.normalActionCost90, kind + '.normalActionCost90');
      if (!near(part.basePerMinute * 90 + part.normalActionCost90, kind === 'field' ? 70 : 40)) throw new RangeError(kind + ' partition must include normal actions inside the confirmed 90-minute total');
    });
    var rates = object(parameters.actionRates, 'actionRates');
    ['sprint', 'pressing', 'intenseDuel'].forEach(function (key) { nonnegative(rates[key], 'actionRates.' + key); });
    if (typeof parameters.staminaFactor !== 'function') throw new TypeError('explicit staminaFactor(stamina, kind) is required');
    ['field', 'keeper'].forEach(function (kind) {
      var previous = Infinity;
      for (var stamina = 1; stamina <= 20; stamina += 1) {
        var factor = finite(parameters.staminaFactor(stamina, kind), 'staminaFactor');
        if (factor <= 0 || factor > previous + 1e-9) throw new RangeError('staminaFactor must be positive and nonincreasing');
        previous = factor;
      }
      if (!near(parameters.staminaFactor(10, kind), 1)) throw new RangeError('staminaFactor(10,' + kind + ') must equal 1');
    });
    if (!near(parameters.staminaFactor(6, 'field'), 80 / 70) || !near(parameters.staminaFactor(14, 'field'), 60 / 70)) throw new RangeError('field staminaFactor must satisfy confirmed stamina 6/10/14 references');
    return parameters;
  }
  function mergedRanges(ranges) {
    var sorted = ranges.slice().sort(function (a, b) { return a.startMinute - b.startMinute || a.endMinute - b.endMinute; }), result = [];
    sorted.forEach(function (range) {
      var last = result[result.length - 1];
      if (last && range.startMinute <= last.endMinute) last.endMinute = Math.max(last.endMinute, range.endMinute);
      else result.push({startMinute: range.startMinute, endMinute: range.endMinute});
    });
    return result;
  }
  function minutes(ranges) { return ranges.reduce(function (sum, range) { return sum + range.endMinute - range.startMinute; }, 0); }
  function containsMinute(ranges, minute) { return ranges.some(function (range) { return minute >= range.startMinute && minute <= range.endMinute; }); }
  function eventCost(event, keeper, parameters, factor) {
    if (event.type === 'field-jump') return {group: 'field-air', cost: 0};
    if (event.type === 'keeper-jump' || event.type === 'keeper-dive') {
      if (!keeper) throw new TypeError('keeper air events cannot be charged to field players');
      return {group: 'keeper-air', cost: (event.type === 'keeper-dive' ? 1 : 0.5) * factor};
    }
    if (event.type === 'intense-duel') return {group: 'duel', cost: event.units * parameters.actionRates.intenseDuel * factor};
    return {group: 'movement', cost: event.units * parameters.actionRates[event.type] * factor};
  }

  function consumeFreshness(state, load, approvedParameters) {
    var next = cloneState(state), normalized = normalizeLoad(load), signature = JSON.stringify(normalized);
    var already = next.ledger.loads.find(function (entry) { return entry.id === normalized.id; });
    if (already) {
      if (already.signature !== signature) throw new Error('conflicting payload for a processed load id');
      return next;
    }
    var parameters = validateParameters(approvedParameters), kind = normalized.keeper ? 'keeper' : 'field';
    var factor = finite(parameters.staminaFactor(normalized.stamina, kind), 'staminaFactor');
    if (factor <= 0) throw new RangeError('staminaFactor must be positive');
    var loadConfig = JSON.stringify({basePerMinute: parameters.loadPartition[kind].basePerMinute, staminaFactor: factor,
      actionRates: {sprint: parameters.actionRates.sprint, pressing: parameters.actionRates.pressing, intenseDuel: parameters.actionRates.intenseDuel}});
    var fixture = next.ledger.fixtures.find(function (entry) { return entry.id === normalized.fixtureId; });
    if (!fixture) {
      fixture = {id: normalized.fixtureId, stamina: normalized.stamina, keeper: normalized.keeper, loadConfig: loadConfig, minuteRanges: [], events: [], causes: [], consumed: 0};
      next.ledger.fixtures.push(fixture);
    }
    if (fixture.stamina !== normalized.stamina || fixture.keeper !== normalized.keeper) throw new Error('fixture stamina and keeper identity cannot change during an appearance');
    if (fixture.loadConfig !== loadConfig) throw new Error('load parameters cannot change during an appearance or after restore');
    var ranges = mergedRanges(fixture.minuteRanges.concat(normalized.intervals));
    var cost = (minutes(ranges) - minutes(fixture.minuteRanges)) * parameters.loadPartition[kind].basePerMinute * factor;
    normalized.events.forEach(function (event) {
      var eventSignature = JSON.stringify(event), recorded = fixture.events.find(function (entry) { return entry.id === event.id; });
      if (recorded) {
        if (recorded.signature !== eventSignature) throw new Error('conflicting payload for a processed event id');
        return;
      }
      if (!containsMinute(ranges, event.minute)) throw new RangeError('actual event must occur within played virtual minutes');
      var action = eventCost(event, normalized.keeper, parameters, factor), causeKey = JSON.stringify([action.group, event.causeId]);
      var cause = fixture.causes.find(function (entry) { return entry.key === causeKey; });
      if (!cause) { cause = {key: causeKey, cost: 0}; fixture.causes.push(cause); }
      // Sprint+pressing and jump+dive describing one physical cause use max,
      // including incremental delivery of the stronger observation.
      cost += Math.max(0, action.cost - cause.cost);
      cause.cost = Math.max(cause.cost, action.cost);
      fixture.events.push({id: event.id, signature: eventSignature});
    });
    fixture.minuteRanges = ranges; fixture.consumed += cost;
    next.freshness = boundedFreshness(next.freshness - cost);
    next.ledger.loads.push({id: normalized.id, fixtureId: normalized.fixtureId, signature: signature});
    return next;
  }

  function recoverFreshness(state, transition) {
    var next = cloneState(state); object(transition, 'transition'); identifier(transition.id, 'transition id');
    if (['halftime', 'final-whistle', 'rest-day'].indexOf(transition.type) < 0) throw new TypeError('unknown recovery transition');
    var normalized = {id: transition.id, type: transition.type};
    if (transition.type === 'rest-day') {
      normalized.dayId = identifier(transition.dayId, 'full match-free calendar dayId');
      if (transition.fullMatchFreeDay !== true) throw new TypeError('rest-day must be a full match-free calendar day');
    } else normalized.fixtureId = identifier(transition.fixtureId, 'recovery fixtureId');
    var signature = JSON.stringify(normalized), repeated = next.ledger.transitions.find(function (entry) { return entry.id === normalized.id; });
    if (repeated) {
      if (repeated.signature !== signature) throw new Error('conflicting payload for a processed transition id');
      return next;
    }
    // Protect the underlying transition even if its transport id changes.
    var cause = JSON.stringify([normalized.type, normalized.dayId || normalized.fixtureId]);
    if (next.ledger.transitions.some(function (entry) { return entry.cause === cause; })) {
      next.ledger.transitions.push({id: normalized.id, signature: signature, cause: cause});
      return next;
    }
    next.freshness = boundedFreshness(next.freshness + (normalized.type === 'rest-day' ? 3 + 0.25 * (100 - next.freshness) : 10));
    next.ledger.transitions.push({id: normalized.id, signature: signature, cause: cause});
    return next;
  }

  return Object.freeze({SCHEMA: SCHEMA, createState: createState, consumeFreshness: consumeFreshness, recoverFreshness: recoverFreshness, serializeState: serializeState, restoreState: restoreState});
}));
