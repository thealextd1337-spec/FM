(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.D6PlayerRoles = factory();
}(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';

  function freeze(value) {
    Object.keys(value).forEach(function (key) {
      if (value[key] && typeof value[key] === 'object') freeze(value[key]);
    });
    return Object.freeze(value);
  }
  var SKILL_KEYS = freeze(['tec', 'pas', 'fin', 'tak', 'pos', 'spd', 'sta', 'air', 'gk', 'calm', 'ant', 'dec', 'str']);
  var POSITIONS = freeze(['gk', 'def', 'mid', 'att']);
  var ROLE_CATALOG = freeze([
    {id: 'line-keeper', positions: ['gk'], importantSkills: ['gk', 'pos', 'ant', 'dec', 'calm']},
    {id: 'sweeper-keeper', positions: ['gk'], importantSkills: ['gk', 'pos', 'ant', 'dec', 'pas', 'tec', 'calm', 'spd']},
    {id: 'cover-defender', positions: ['def'], importantSkills: ['pos', 'ant', 'dec', 'tak', 'spd']},
    {id: 'stopper', positions: ['def'], importantSkills: ['tak', 'str', 'pos', 'ant', 'dec', 'spd']},
    {id: 'ball-playing-defender', positions: ['def'], importantSkills: ['pas', 'tec', 'dec', 'calm', 'pos']},
    {id: 'playmaker', positions: ['mid'], importantSkills: ['pas', 'tec', 'ant', 'dec', 'calm', 'pos']},
    {id: 'ball-winner', positions: ['mid'], importantSkills: ['tak', 'pos', 'ant', 'dec', 'str', 'sta', 'pas']},
    {id: 'box-to-box', positions: ['mid'], importantSkills: ['sta', 'pos', 'ant', 'dec', 'spd', 'pas', 'tec']},
    {id: 'winger', positions: ['mid', 'att'], importantSkills: ['pas', 'tec', 'spd', 'pos', 'dec']},
    {id: 'poacher', positions: ['att'], importantSkills: ['fin', 'pos', 'tec', 'air']},
    {id: 'striker', positions: ['att'], importantSkills: ['spd', 'pos', 'tec', 'fin', 'ant']},
    {id: 'target-player', positions: ['att'], importantSkills: ['tec', 'pas', 'str', 'pos', 'calm', 'air']},
    {id: 'dribbler', positions: ['att'], importantSkills: ['tec', 'spd', 'dec', 'pas', 'fin', 'pos']}
  ]);
  var ROLE_IDS = freeze(ROLE_CATALOG.map(function (role) { return role.id; }));
  var candidateParameters = freeze({
    id: 'roles-suitability-local-candidate-1',
    routineCap: 100,
    routineWeight: 0.20,
    maxRecommendations: 3,
    hysteresisMargin: 0.35,
    firstTieRoleOrder: ROLE_IDS.slice(),
    roleWeights: {
      'line-keeper': {gk: 35, pos: 20, ant: 20, dec: 15, calm: 10},
      'sweeper-keeper': {gk: 25, pos: 15, ant: 15, dec: 15, pas: 10, tec: 5, calm: 5, spd: 10},
      'cover-defender': {pos: 30, ant: 25, dec: 15, tak: 15, spd: 15},
      'stopper': {tak: 30, str: 20, pos: 15, ant: 15, dec: 10, spd: 10},
      'ball-playing-defender': {pas: 30, tec: 20, dec: 20, calm: 15, pos: 15},
      'playmaker': {pas: 30, tec: 20, ant: 15, dec: 15, calm: 10, pos: 10},
      'ball-winner': {tak: 25, pos: 25, ant: 20, dec: 10, str: 10, sta: 5, pas: 5},
      'box-to-box': {sta: 25, pos: 20, ant: 15, dec: 15, spd: 15, pas: 5, tec: 5},
      'winger': {pas: 25, tec: 25, spd: 20, pos: 15, dec: 15},
      'poacher': {fin: 40, pos: 30, tec: 20, air: 10},
      'striker': {spd: 25, pos: 20, tec: 15, fin: 25, ant: 15},
      'target-player': {tec: 25, pas: 20, str: 20, pos: 15, calm: 15, air: 5},
      'dribbler': {tec: 30, spd: 25, dec: 20, pas: 10, fin: 10, pos: 5}
    }
  });

  function object(value, name) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(name + ' must be an object');
    return value;
  }
  function finite(value, name) {
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(name + ' must be finite');
    return value;
  }
  function catalogRole(id) {
    var role = ROLE_CATALOG.find(function (item) { return item.id === id; });
    if (!role) throw new RangeError('Unknown role: ' + id);
    return role;
  }
  function parameters(value) {
    var result = object(value, 'parameters');
    if (finite(result.routineCap, 'routineCap') <= 0) throw new RangeError('routineCap must be positive');
    if (finite(result.routineWeight, 'routineWeight') < 0 || result.routineWeight > 1) throw new RangeError('routineWeight must be between 0 and 1');
    if (!Number.isInteger(result.maxRecommendations) || result.maxRecommendations < 1 || result.maxRecommendations > 3) throw new RangeError('maxRecommendations must be 1–3');
    if (finite(result.hysteresisMargin, 'hysteresisMargin') < 0) throw new RangeError('hysteresisMargin cannot be negative');
    if (!Array.isArray(result.firstTieRoleOrder) || result.firstTieRoleOrder.length !== ROLE_IDS.length || new Set(result.firstTieRoleOrder).size !== ROLE_IDS.length || result.firstTieRoleOrder.some(function (id) { return ROLE_IDS.indexOf(id) < 0; })) throw new RangeError('firstTieRoleOrder must contain each role once');
    object(result.roleWeights, 'roleWeights');
    ROLE_CATALOG.forEach(function (role) {
      var weights = object(result.roleWeights[role.id], 'roleWeights.' + role.id), total = 0;
      Object.keys(weights).forEach(function (key) {
        if (role.importantSkills.indexOf(key) < 0) throw new RangeError('Weight is not a confirmed relevant skill: ' + role.id + '.' + key);
        var weight = finite(weights[key], 'weight.' + key);
        if (weight < 0) throw new RangeError('Weights cannot be negative');
        total += weight;
      });
      if (total <= 0) throw new RangeError('Each role requires positive total skill weight');
    });
    return result;
  }
  function skillScore(skills, routineValue, roleId, config) {
    var weights = config.roleWeights[roleId], total = 0, weighted = 0;
    Object.keys(weights).forEach(function (key) {
      var skill = finite(skills[key], 'skills.' + key);
      if (skill < 1 || skill > 20) throw new RangeError('Permanent skills must be 1–20');
      total += weights[key]; weighted += skill * weights[key];
    });
    var routine = finite(routineValue, 'positionRoutine');
    if (routine < 0 || routine > config.routineCap) throw new RangeError('positionRoutine is outside its cap');
    return Math.max(1, Math.min(20, weighted / total * (1 - config.routineWeight * (1 - routine / config.routineCap))));
  }
  function roleSuitability(skills, positionRoutine, roleId, approvedParameters) {
    object(skills, 'skills'); catalogRole(roleId);
    return skillScore(skills, positionRoutine, roleId, parameters(approvedParameters));
  }
  function positionList(snapshot) {
    if (!Array.isArray(snapshot.playablePositions) || !snapshot.playablePositions.length || new Set(snapshot.playablePositions).size !== snapshot.playablePositions.length || snapshot.playablePositions.some(function (position) { return POSITIONS.indexOf(position) < 0; })) throw new RangeError('playablePositions must contain distinct known positions');
    if (snapshot.playablePositions.indexOf(snapshot.mainPosition) < 0) throw new RangeError('mainPosition must be playable');
    if (snapshot.playablePositions.indexOf('gk') >= 0 && (snapshot.mainPosition !== 'gk' || snapshot.playablePositions.length !== 1)) throw new RangeError('Keeper profiles cannot contain field positions');
    return snapshot.playablePositions;
  }
  function rank(entries, config) {
    return entries.sort(function (a, b) {
      return b.score - a.score || config.firstTieRoleOrder.indexOf(a.roleId) - config.firstTieRoleOrder.indexOf(b.roleId) || POSITIONS.indexOf(a.position) - POSITIONS.indexOf(b.position);
    });
  }
  function recommendRoles(snapshot, approvedParameters) {
    var player = object(snapshot, 'snapshot'), config = parameters(approvedParameters), playable = positionList(player);
    object(player.skills, 'snapshot.skills'); object(player.routine, 'snapshot.routine');
    var entries = [];
    playable.forEach(function (position) {
      ROLE_CATALOG.forEach(function (role) {
        if (role.positions.indexOf(position) >= 0) entries.push({position: position, roleId: role.id, score: skillScore(player.skills, player.routine[position], role.id, config)});
      });
    });
    return rank(entries, config).slice(0, config.maxRecommendations).map(function (entry) { return {position: entry.position, roleId: entry.roleId}; });
  }
  function bestRecommendedRole(recommendations, previousBest, skills, routine, approvedParameters) {
    var config = parameters(approvedParameters);
    if (!Array.isArray(recommendations)) throw new TypeError('recommendations must be an array');
    object(skills, 'skills'); object(routine, 'routine');
    var seen = new Set(), entries = recommendations.map(function (entry) {
      object(entry, 'recommendation');
      if (catalogRole(entry.roleId).positions.indexOf(entry.position) < 0) throw new RangeError('Recommendation position does not match its role');
      var key = entry.position + ':' + entry.roleId;
      if (seen.has(key)) throw new RangeError('Duplicate recommendation');
      seen.add(key);
      return {position: entry.position, roleId: entry.roleId, score: skillScore(skills, routine[entry.position], entry.roleId, config)};
    });
    if (!entries.length) return null;
    var winner = rank(entries, config)[0], prior = null;
    if (previousBest && typeof previousBest === 'object') prior = entries.find(function (entry) { return entry.position === previousBest.position && entry.roleId === previousBest.roleId; });
    if (prior && winner.score <= prior.score + config.hysteresisMargin) winner = prior;
    return {position: winner.position, roleId: winner.roleId};
  }

  return Object.freeze({SKILL_KEYS: SKILL_KEYS, POSITIONS: POSITIONS, ROLE_IDS: ROLE_IDS, ROLE_CATALOG: ROLE_CATALOG, candidateParameters: candidateParameters, roleSuitability: roleSuitability, recommendRoles: recommendRoles, bestRecommendedRole: bestRecommendedRole});
}));
