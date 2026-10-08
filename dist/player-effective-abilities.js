(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.D6EffectiveAbilities = factory();
}(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';

  var SKILL_KEYS = Object.freeze(['tec', 'pas', 'fin', 'tak', 'pos', 'spd', 'sta', 'air', 'gk', 'calm', 'ant', 'dec', 'str']);
  var QUADRATIC_LOSSES = Object.freeze({tec: 0.10, pas: 0.10, fin: 0.10, tak: 0.15, air: 0.15, gk: 0.10});

  function finite(value, name) {
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(name + ' must be finite');
    return value;
  }
  function clamp(value, low, high) { return Math.max(low, Math.min(high, value)); }
  function fresh(value) { return clamp(finite(value, 'freshness'), 0, 100); }
  function object(value, name) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(name + ' must be an object');
    return value;
  }

  // Each explicitly supplied curve is continuous, monotone and normalized.
  // No draft curve is selected by this module.
  function curveLoss(curve, freshness, name) {
    if (!Array.isArray(curve) || curve.length < 2) throw new TypeError(name + ' requires explicit [freshness, lossFraction] points');
    curve.forEach(function (point, index) {
      if (!Array.isArray(point) || point.length !== 2) throw new TypeError(name + ' point must contain two numbers');
      finite(point[0], name + ' freshness'); finite(point[1], name + ' lossFraction');
      if (point[0] < 0 || point[0] > 100 || point[1] < 0 || point[1] > 1) throw new RangeError(name + ' point out of bounds');
      if (index && (point[0] <= curve[index - 1][0] || point[1] > curve[index - 1][1])) throw new RangeError(name + ' must be monotone with increasing freshness');
    });
    var first = curve[0], last = curve[curve.length - 1];
    if (first[0] !== 0 || first[1] !== 1 || last[0] !== 100 || last[1] !== 0) throw new RangeError(name + ' endpoints must be [0,1] and [100,0]');
    for (var i = 1; i < curve.length; i += 1) {
      if (freshness <= curve[i][0]) {
        var a = curve[i - 1], b = curve[i], ratio = (freshness - a[0]) / (b[0] - a[0]);
        return a[1] + (b[1] - a[1]) * ratio;
      }
    }
    return 0;
  }

  function fatigueMultipliers(freshness, pressureContext, approvedParameters) {
    var f = fresh(freshness), pressure = object(pressureContext, 'pressureContext'), parameters = object(approvedParameters, 'approvedParameters');
    if (typeof pressure.actualPressure !== 'boolean') throw new TypeError('pressureContext.actualPressure must describe observed pressure');
    var t = clamp((80 - f) / 50, 0, 1), squared = t * t, result = {};
    SKILL_KEYS.forEach(function (key) { result[key] = 1; });
    Object.keys(QUADRATIC_LOSSES).forEach(function (key) { result[key] = 1 - QUADRATIC_LOSSES[key] * squared; });
    result.str = 1 - 0.20 * (100 - f) / 100;
    result.calm = pressure.actualPressure ? 1 - 0.20 * squared : 1;
    result.ant = 1 - 0.15 * curveLoss(parameters.anticipationCurve, f, 'anticipationCurve');
    result.dec = 1 - 0.15 * curveLoss(parameters.decisionCurve, f, 'decisionCurve');
    // spd stays intact: movementLimits applies the separate physical losses.
    return result;
  }

  function effectiveAbilities(base, freshness, formContext, pressureContext, approvedParameters) {
    var skills = object(base, 'base skills'), form = object(formContext, 'formContext');
    var multipliers = object(form.multipliers, 'formContext.multipliers');
    var fatigue = fatigueMultipliers(freshness, pressureContext, approvedParameters), result = {};
    SKILL_KEYS.forEach(function (key) {
      var value = finite(skills[key], 'base.' + key);
      if (value < 1 || value > 20) throw new RangeError('base.' + key + ' must be between 1 and 20');
      // Strength never gets any form effect, including a supplied multiplier.
      var formMultiplier = key === 'str' ? 1 : finite(multipliers[key], 'formContext.multipliers.' + key);
      if (formMultiplier < 0) throw new RangeError('form multiplier cannot be negative');
      result[key] = clamp(value * formMultiplier * fatigue[key], 1, 20);
    });
    return result;
  }

  function movementLimits(baseMovement, freshness, approvedParameters) {
    var base = object(baseMovement, 'baseMovement'), parameters = object(approvedParameters, 'approvedParameters'), f = fresh(freshness);
    var speed = finite(base.maxSpeed, 'baseMovement.maxSpeed'), acceleration = finite(base.acceleration, 'baseMovement.acceleration');
    if (speed < 0 || acceleration < 0) throw new RangeError('movement limits cannot be negative');
    var speedMultiplier = 1 - 0.15 * curveLoss(parameters.maxSpeedCurve, f, 'maxSpeedCurve');
    var accelerationMultiplier = 1 - 0.25 * curveLoss(parameters.accelerationCurve, f, 'accelerationCurve');
    return {maxSpeed: speed * speedMultiplier, acceleration: acceleration * accelerationMultiplier, maxSpeedMultiplier: speedMultiplier, accelerationMultiplier: accelerationMultiplier};
  }

  return Object.freeze({SKILL_KEYS: SKILL_KEYS, fatigueMultipliers: fatigueMultipliers, effectiveAbilities: effectiveAbilities, movementLimits: movementLimits});
}));
