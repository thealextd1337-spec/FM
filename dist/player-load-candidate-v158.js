(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.D6LoadCandidate = factory();
}(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';

  // Explicit local calibration data. None of the open curves/rates is a product default.
  var SCHEMA = 'd6-load-candidate-158-1';
  var PARAMETER_ID = 'p02-local-candidate-158-1';
  var SKILL_KEYS = ['tec', 'pas', 'fin', 'tak', 'pos', 'spd', 'sta', 'air', 'gk', 'calm', 'ant', 'dec', 'str'];
  var EFFECT_CURVES = ['anticipationCurve', 'decisionCurve', 'maxSpeedCurve', 'accelerationCurve'];
  var prepared = new WeakSet();
  var cache = new WeakMap();

  function finite(value, name) {
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(name + ' must be finite');
    return value;
  }
  function nonnegative(value, name) {
    finite(value, name); if (value < 0) throw new RangeError(name + ' cannot be negative'); return value;
  }
  function object(value, name) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(name + ' must be an object');
    return value;
  }
  function near(a, b) { return Math.abs(a - b) <= 1e-9; }
  function clamp(value, low, high) { return Math.max(low, Math.min(high, value)); }
  function freeze(value) {
    Object.keys(value).forEach(function (key) {
      if (value[key] && typeof value[key] === 'object') freeze(value[key]);
    });
    return Object.freeze(value);
  }
  function immutable(value) {
    return Object.isFrozen(value) && Object.keys(value).every(function (key) {
      return !value[key] || typeof value[key] !== 'object' || immutable(value[key]);
    });
  }
  function copy(value) { return JSON.parse(JSON.stringify(value)); }
  function keys(value, expected, name) {
    object(value, name);
    var actual = Object.keys(value);
    if (actual.length !== expected.length || expected.some(function (key) { return !Object.prototype.hasOwnProperty.call(value, key); })) {
      throw new TypeError(name + ' contains missing or unsupported parameters');
    }
  }
  function interpolate(curve, value) {
    for (var i = 1; i < curve.length; i += 1) {
      if (value <= curve[i][0]) {
        var a = curve[i - 1], b = curve[i];
        return a[1] + (b[1] - a[1]) * (value - a[0]) / (b[0] - a[0]);
      }
    }
    return curve[curve.length - 1][1];
  }
  function validateCurve(curve, name, low, high, normalized) {
    if (!Array.isArray(curve) || curve.length < 2) throw new TypeError(name + ' requires explicit curve points');
    curve.forEach(function (point, index) {
      if (!Array.isArray(point) || point.length !== 2) throw new TypeError(name + ' point must contain two numbers');
      finite(point[0], name + ' input'); finite(point[1], name + ' factor');
      if (point[0] < low || point[0] > high || (normalized ? point[1] < 0 || point[1] > 1 : point[1] <= 0)) throw new RangeError(name + ' point out of bounds');
      if (index && (point[0] <= curve[index - 1][0] || point[1] > curve[index - 1][1])) throw new RangeError(name + ' must be monotone with increasing input');
    });
    if (curve[0][0] !== low || curve[curve.length - 1][0] !== high) throw new RangeError(name + ' must cover the complete input range');
    if (normalized && (curve[0][1] !== 1 || curve[curve.length - 1][1] !== 0)) throw new RangeError(name + ' endpoints must be [0,1] and [100,0]');
  }
  function validateForm(parameters) {
    keys(parameters, ['minStage', 'maxStage', 'additivePerStage'], 'formParameters');
    ['minStage', 'maxStage', 'additivePerStage'].forEach(function (key) { finite(parameters[key], 'formParameters.' + key); });
    if (parameters.minStage !== -2 || parameters.maxStage !== 2 || parameters.additivePerStage !== 0.5) {
      throw new RangeError('formParameters must preserve the existing bounded half-point form effect');
    }
  }
  function validateParameters(parameters) {
    keys(parameters, ['schema', 'parameterId', 'loadPartition', 'actionRates', 'staminaCurves', 'effectParameters', 'formParameters'], 'parameters');
    if (parameters.schema !== SCHEMA || parameters.parameterId !== PARAMETER_ID) throw new TypeError('unsupported local load candidate');
    keys(parameters.loadPartition, ['field', 'keeper'], 'loadPartition');
    keys(parameters.actionRates, ['sprint', 'pressing', 'intenseDuel'], 'actionRates');
    keys(parameters.staminaCurves, ['field', 'keeper'], 'staminaCurves');
    ['field', 'keeper'].forEach(function (kind) {
      var part = parameters.loadPartition[kind], curve = parameters.staminaCurves[kind];
      keys(part, ['basePerMinute', 'normalActionCost90'], 'loadPartition.' + kind);
      nonnegative(part.basePerMinute, kind + '.basePerMinute'); nonnegative(part.normalActionCost90, kind + '.normalActionCost90');
      if (!near(part.basePerMinute * 90 + part.normalActionCost90, kind === 'field' ? 70 : 40)) throw new RangeError(kind + ' partition must preserve its confirmed normal reference');
      validateCurve(curve, 'staminaCurves.' + kind, 1, 20, false);
      if (!near(interpolate(curve, 10), 1)) throw new RangeError(kind + ' stamina factor at 10 must equal 1');
    });
    if (!near(interpolate(parameters.staminaCurves.field, 6), 80 / 70) || !near(interpolate(parameters.staminaCurves.field, 14), 60 / 70)) {
      throw new RangeError('field stamina curve must preserve the 6/10/14 references');
    }
    ['sprint', 'pressing', 'intenseDuel'].forEach(function (key) { nonnegative(parameters.actionRates[key], 'actionRates.' + key); });
    keys(parameters.effectParameters, EFFECT_CURVES, 'effectParameters');
    EFFECT_CURVES.forEach(function (key) { validateCurve(parameters.effectParameters[key], key, 0, 100, true); });
    validateForm(parameters.formParameters);
  }

  function createParameters() {
    return freeze({
      schema: SCHEMA, parameterId: PARAMETER_ID,
      loadPartition: {field: {basePerMinute: 60 / 90, normalActionCost90: 10}, keeper: {basePerMinute: 30 / 90, normalActionCost90: 10}},
      actionRates: {sprint: 0.35, pressing: 0.35, intenseDuel: 0.35},
      staminaCurves: {
        field: [[1, 92.5 / 70], [6, 80 / 70], [10, 1], [14, 60 / 70], [20, 45 / 70]],
        keeper: [[1, 1.36], [10, 1], [20, 0.8]]
      },
      effectParameters: {
        anticipationCurve: [[0, 1], [100, 0]], decisionCurve: [[0, 1], [100, 0]],
        maxSpeedCurve: [[0, 1], [100, 0]], accelerationCurve: [[0, 1], [100, 0]]
      },
      formParameters: {minStage: -2, maxStage: 2, additivePerStage: 0.5}
    });
  }

  // Materialize once on setup/restore. Functions are runtime only; save .parameters.
  function materializeParameters(parameters) {
    object(parameters, 'parameters');
    if (prepared.has(parameters)) return parameters;
    if (cache.has(parameters)) return cache.get(parameters);
    validateParameters(parameters);
    var numeric = freeze(copy(parameters));
    var loadParameters = freeze({
      loadPartition: numeric.loadPartition, actionRates: numeric.actionRates,
      staminaFactor: function (stamina, kind) {
        finite(stamina, 'stamina');
        if (stamina < 1 || stamina > 20) throw new RangeError('stamina must be between 1 and 20');
        if (kind !== 'field' && kind !== 'keeper') throw new TypeError('kind must be field or keeper');
        return interpolate(numeric.staminaCurves[kind], stamina);
      }
    });
    var runtime = freeze({parameters: numeric, loadParameters: loadParameters, effectParameters: numeric.effectParameters, formParameters: numeric.formParameters});
    prepared.add(runtime);
    if (immutable(parameters)) cache.set(parameters, runtime);
    return runtime;
  }

  // Match the existing additive form effect, excluding its old freshness-derived cap.
  function formContext(skills, rawForm, parameters) {
    object(skills, 'base skills'); validateForm(parameters);
    var stage = clamp(finite(rawForm, 'raw form'), parameters.minStage, parameters.maxStage);
    var additive = stage * parameters.additivePerStage, multipliers = {};
    SKILL_KEYS.forEach(function (key) {
      var value = finite(skills[key], 'base.' + key);
      if (value < 1 || value > 20) throw new RangeError('base.' + key + ' must be between 1 and 20');
      multipliers[key] = key === 'str' ? 1 : (value + additive) / value;
    });
    return {multipliers: multipliers};
  }

  return Object.freeze({SCHEMA: SCHEMA, PARAMETER_ID: PARAMETER_ID, createParameters: createParameters, materializeParameters: materializeParameters, formContext: formContext});
}));
