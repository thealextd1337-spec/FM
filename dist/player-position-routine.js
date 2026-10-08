(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.D6PositionRoutine = factory();
}(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';

  var POSITIONS = Object.freeze(['gk', 'def', 'mid', 'att']);
  var candidateParameters = Object.freeze({id: 'position-routine-local-candidate-1', cap: 100, secondaryStart: 25, minutesToFull: 1800});
  function object(value, name) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(name + ' must be an object');
    return value;
  }
  function finite(value, name) {
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(name + ' must be finite');
    return value;
  }
  function parameters(value) {
    var config = object(value, 'parameters');
    if (finite(config.cap, 'cap') <= 0 || finite(config.minutesToFull, 'minutesToFull') <= 0) throw new RangeError('cap and minutesToFull must be positive');
    if (finite(config.secondaryStart, 'secondaryStart') < 0 || config.secondaryStart > config.cap) throw new RangeError('secondaryStart is outside the cap');
    return config;
  }
  function createRoutine(mainPosition, playablePositions, approvedParameters) {
    var config = parameters(approvedParameters);
    if (POSITIONS.indexOf(mainPosition) < 0 || !Array.isArray(playablePositions) || playablePositions.indexOf(mainPosition) < 0 || new Set(playablePositions).size !== playablePositions.length || playablePositions.some(function (position) { return POSITIONS.indexOf(position) < 0; })) throw new RangeError('Distinct playable positions must include the main position');
    if (playablePositions.indexOf('gk') >= 0 && (mainPosition !== 'gk' || playablePositions.length !== 1)) throw new RangeError('Keeper profiles cannot contain field positions');
    var result = {};
    POSITIONS.forEach(function (position) { result[position] = position === mainPosition ? config.cap : playablePositions.indexOf(position) >= 0 ? config.secondaryStart : 0; });
    return result;
  }
  function routineTransition(routine, positionMinutes, approvedParameters) {
    var config = parameters(approvedParameters), stored = object(routine, 'routine'), minutes = object(positionMinutes, 'positionMinutes'), result = {};
    Object.keys(minutes).forEach(function (position) {
      if (POSITIONS.indexOf(position) < 0) throw new RangeError('Unknown position in actual minutes: ' + position);
      if (finite(minutes[position], 'minutes.' + position) < 0) throw new RangeError('Actual minutes cannot be negative');
    });
    POSITIONS.forEach(function (position) {
      var value = finite(stored[position], 'routine.' + position);
      if (value < 0 || value > config.cap) throw new RangeError('Stored routine is outside its cap');
      var actual = Object.prototype.hasOwnProperty.call(minutes, position) ? minutes[position] : 0;
      result[position] = Math.min(config.cap, value + actual * config.cap / config.minutesToFull);
    });
    return result;
  }
  return Object.freeze({POSITIONS: POSITIONS, candidateParameters: candidateParameters, createRoutine: createRoutine, routineTransition: routineTransition});
}));
