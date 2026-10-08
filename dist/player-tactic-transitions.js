(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.D6TacticTransitions = factory();
}(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';

  var candidateParameters = Object.freeze({id: 'tactic-transitions-local-candidate-1', columns: 5, rows: 7, ownGoal: 'bottom'});
  var ROLE_ZONES = Object.freeze({
    gk: Object.freeze(['line-keeper', 'sweeper-keeper']),
    def: Object.freeze(['cover-defender', 'stopper', 'ball-playing-defender']),
    midCenter: Object.freeze(['playmaker', 'ball-winner', 'box-to-box']),
    midSide: Object.freeze(['winger']),
    attCenter: Object.freeze(['poacher', 'striker', 'target-player', 'dribbler']),
    attSide: Object.freeze(['winger', 'dribbler'])
  });
  function object(value, name) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(name + ' must be an object');
    return value;
  }
  function finite(value, name) {
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(name + ' must be finite');
    return value;
  }
  function gridParameters(value) {
    var config = object(value, 'parameters');
    if (!Number.isInteger(config.columns) || config.columns <= 0 || !Number.isInteger(config.rows) || config.rows <= 0) throw new RangeError('Positive integer grid dimensions are required');
    if (config.ownGoal !== 'bottom' && config.ownGoal !== 'top') throw new RangeError('ownGoal must be bottom or top');
    return config;
  }
  function zoneForPoint(point) {
    var p = object(point, 'point'), depth = finite(p.depth, 'depth'), width = finite(p.width, 'width');
    if (depth < 0 || depth > 1 || width < 0 || width > 1) throw new RangeError('Start coordinates must be normalized to 0–1');
    if (p.keeper !== undefined && typeof p.keeper !== 'boolean') throw new TypeError('keeper must be boolean');
    return {position: p.keeper ? 'gk' : depth < 0.30 ? 'def' : depth < 0.70 ? 'mid' : 'att', lane: p.keeper ? 'center' : width < 0.25 ? 'left' : width > 0.75 ? 'right' : 'center'};
  }
  function allowedRoles(zone) {
    var input = object(zone, 'zone'), key;
    if (['gk', 'def', 'mid', 'att'].indexOf(input.position) < 0 || ['left', 'center', 'right'].indexOf(input.lane) < 0) throw new RangeError('Unknown start zone');
    key = input.position === 'gk' || input.position === 'def' ? input.position : input.position + (input.lane === 'center' ? 'Center' : 'Side');
    return ROLE_ZONES[key].slice();
  }
  function pointForCell(cell, approvedParameters) {
    var config = gridParameters(approvedParameters);
    if (!Number.isInteger(cell) || cell < 0 || cell >= config.columns * config.rows) throw new RangeError('cell is outside the grid');
    var width = (cell % config.columns + 0.5) / config.columns, fromTop = (Math.floor(cell / config.columns) + 0.5) / config.rows;
    return {depth: config.ownGoal === 'bottom' ? 1 - fromTop : fromTop, width: config.ownGoal === 'bottom' ? width : 1 - width, keeper: false};
  }
  function zoneForCell(cell, approvedParameters) { return zoneForPoint(pointForCell(cell, approvedParameters)); }
  function pointForPhysical(point, geometry) {
    var p = object(point, 'physical point'), config = object(geometry, 'geometry');
    var width = finite(config.widthMetres, 'widthMetres'), length = finite(config.lengthMetres, 'lengthMetres');
    if (width <= 0 || length <= 0 || (config.ownGoal !== 'bottom' && config.ownGoal !== 'top')) throw new RangeError('Positive physical geometry and an explicit own goal are required');
    var x = finite(p.x, 'x') / width, y = finite(p.y, 'y') / length;
    return {depth: config.ownGoal === 'bottom' ? 1 - y : y, width: config.ownGoal === 'bottom' ? x : 1 - x, keeper: p.keeper === undefined ? false : p.keeper};
  }
  function cloneAssignments(assignments, config) {
    object(assignments, 'assignments');
    var result = {}, cells = new Set();
    Object.keys(assignments).forEach(function (pid) {
      if (!pid) throw new RangeError('Player identities cannot be empty');
      var assignment = object(assignments[pid], 'assignment'), keeper = assignment.position === 'gk';
      var zone = keeper ? {position: 'gk', lane: 'center'} : zoneForCell(assignment.cell, config);
      if (!keeper && assignment.position !== zone.position) throw new RangeError('Assigned position must match the start zone');
      if (keeper && assignment.cell !== null && (!Number.isInteger(assignment.cell) || assignment.cell < 0 || assignment.cell >= config.columns * config.rows)) throw new RangeError('Keeper cell must be null or a valid grid cell');
      if (allowedRoles(zone).indexOf(assignment.roleId) < 0 || [-1, 0, 1].indexOf(assignment.orientation) < 0) throw new RangeError('Role or orientation is invalid for its place');
      if (assignment.cell !== null) {
        if (cells.has(assignment.cell)) throw new RangeError('Assignments cannot occupy the same cell');
        cells.add(assignment.cell);
      }
      Object.defineProperty(result, pid, {value: Object.assign({}, assignment), enumerable: true, writable: true, configurable: true});
    });
    return result;
  }
  function assigned(assignments, pid) {
    if (typeof pid !== 'string' || !Object.prototype.hasOwnProperty.call(assignments, pid)) throw new RangeError('Player is not assigned');
    return assignments[pid];
  }
  function tacticTransition(action, assignments, approvedParameters, rng) {
    var input = object(action, 'action'), config = gridParameters(approvedParameters), result = cloneAssignments(assignments, config);
    if (input.type === 'free-move') {
      var moving = assigned(result, input.playerId);
      if (moving.position === 'gk') throw new RangeError('Keepers cannot be freely moved');
      var target = zoneForCell(input.toCell, config);
      if (moving.cell === input.toCell) return result;
      if (Object.keys(result).some(function (pid) { return pid !== input.playerId && result[pid].cell === input.toCell; })) throw new RangeError('Occupied places require an explicit swap');
      var eligible = allowedRoles(target), roleId = moving.roleId;
      if (eligible.indexOf(roleId) < 0) {
        if (typeof rng !== 'function') throw new TypeError('An injected RNG is required for an invalid role after movement');
        var random = finite(rng(), 'rng');
        if (random < 0 || random >= 1) throw new RangeError('RNG must return a value in [0,1)');
        roleId = eligible[Math.floor(random * eligible.length)];
      }
      result[input.playerId] = Object.assign({}, moving, {cell: input.toCell, position: target.position, roleId: roleId, orientation: 0});
    } else if (input.type === 'swap') {
      var a = assigned(result, input.playerId), b = assigned(result, input.otherPlayerId);
      if (input.playerId === input.otherPlayerId) return result;
      if (a.position === 'gk' || b.position === 'gk') throw new RangeError('Keeper swaps are not supported');
      result[input.playerId] = Object.assign({}, a, {cell: b.cell, position: b.position, roleId: b.roleId, orientation: b.orientation});
      result[input.otherPlayerId] = Object.assign({}, b, {cell: a.cell, position: a.position, roleId: a.roleId, orientation: a.orientation});
    } else if (input.type === 'substitution') {
      var outgoing = assigned(result, input.outPlayerId);
      if (typeof input.inPlayerId !== 'string' || !input.inPlayerId || Object.prototype.hasOwnProperty.call(result, input.inPlayerId)) throw new RangeError('Incoming player must be an unassigned identity');
      Object.defineProperty(result, input.inPlayerId, {value: Object.assign({}, outgoing), enumerable: true, writable: true, configurable: true});
      delete result[input.outPlayerId];
    } else throw new RangeError('Unknown tactic action');
    return result;
  }

  return Object.freeze({candidateParameters: candidateParameters, zoneForPoint: zoneForPoint, allowedRoles: allowedRoles, pointForCell: pointForCell, zoneForCell: zoneForCell, pointForPhysical: pointForPhysical, tacticTransition: tacticTransition});
}));
