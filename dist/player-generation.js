(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.D6PlayerGeneration = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Confirmed position weights, never role weights or action probabilities.
  var SKILL_KEYS = Object.freeze(['tec', 'pas', 'fin', 'tak', 'pos', 'spd', 'sta', 'air', 'gk', 'calm', 'ant', 'dec', 'str']);
  var POSITIONS = Object.freeze(['gk', 'def', 'mid', 'att']);
  var QUALITY_IDS = Object.freeze(['weak', 'normal', 'strong']);
  var POSITION_WEIGHTS = Object.freeze({
    gk: Object.freeze({ tec: 4, pas: 5, fin: 0, tak: 1, pos: 12, spd: 3, sta: 3, air: 1, gk: 40, calm: 10, ant: 10, dec: 8, str: 3 }),
    def: Object.freeze({ tec: 4, pas: 5, fin: 1, tak: 20, pos: 18, spd: 8, sta: 3, air: 7, gk: 0, calm: 2, ant: 12, dec: 10, str: 10 }),
    mid: Object.freeze({ tec: 14, pas: 18, fin: 3, tak: 8, pos: 10, spd: 6, sta: 8, air: 2, gk: 0, calm: 5, ant: 10, dec: 12, str: 4 }),
    att: Object.freeze({ tec: 9, pas: 8, fin: 20, tak: 1, pos: 12, spd: 7, sta: 2, air: 4, gk: 0, calm: 12, ant: 12, dec: 8, str: 5 })
  });
  var TALENT_BANDS = Object.freeze([
    Object.freeze({ key: '10-13', min: 10, max: 13, share: 0.20 }),
    Object.freeze({ key: '14-17', min: 14, max: 17, share: 0.60 }),
    Object.freeze({ key: '18-19', min: 18, max: 19, share: 0.15 }),
    Object.freeze({ key: '20', min: 20, max: 20, share: 0.03 }),
    Object.freeze({ key: '21', min: 21, max: 21, share: 0.015 }),
    Object.freeze({ key: '22', min: 22, max: 22, share: 0.005 })
  ]);
  var YOUTH_TALENT_WEIGHTS = Object.freeze({ weak: 0.5, normal: 1, strong: 2 });

  function fail(message) { throw new TypeError('D6PlayerGeneration: ' + message); }
  function object(value, label) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) fail(label + ' must be an object');
    return value;
  }
  function number(value, label, min, max) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) fail(label + ' outside ' + min + '..' + max);
    return value;
  }
  function integer(value, label, min, max) {
    number(value, label, min, max);
    if (!Number.isInteger(value)) fail(label + ' must be an integer');
    return value;
  }
  function position(value) {
    if (POSITIONS.indexOf(value) < 0) fail('unknown position ' + value);
    return value;
  }
  function qualityId(value) {
    if (QUALITY_IDS.indexOf(value) < 0) fail('quality must be weak, normal or strong');
    return value;
  }
  function skillsObject(skills, label) {
    object(skills, label);
    SKILL_KEYS.forEach(function (key) { number(skills[key], label + '.' + key, 1, 20); });
    return skills;
  }
  function rawQuality(skills, pos) {
    return SKILL_KEYS.reduce(function (sum, key) { return sum + skills[key] * POSITION_WEIGHTS[pos][key]; }, 0) / 100;
  }
  function positionQuality(baseSkills, pos) {
    return rawQuality(skillsObject(baseSkills, 'skills'), position(pos));
  }
  function eliteQuality(baseSkills, playablePositions) {
    skillsObject(baseSkills, 'skills');
    if (!Array.isArray(playablePositions) || !playablePositions.length) fail('playablePositions must be nonempty');
    playablePositions.forEach(position);
    return playablePositions.some(function (pos) { return rawQuality(baseSkills, pos) >= 16; });
  }
  function random(rng) {
    var value = rng();
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value >= 1) fail('rng must return a finite number in [0,1)');
    return value;
  }
  function weightedChoice(options, rng, label) {
    if (!Array.isArray(options) || !options.length) fail(label + ' must be a nonempty weighted array');
    var total = options.reduce(function (sum, row) {
      object(row, label + ' entry');
      return sum + number(row.weight, label + '.weight', 0, Number.MAX_VALUE);
    }, 0);
    if (!(total > 0) || !Number.isFinite(total)) fail(label + ' weights must have a finite positive sum');
    var ticket = random(rng) * total;
    var last;
    for (var i = 0; i < options.length; i += 1) {
      if (options[i].weight > 0) last = options[i];
      ticket -= options[i].weight;
      if (ticket < 0) return options[i];
    }
    return last; // Floating point endpoint; never choose a zero-weight option.
  }
  function uniformRange(range, label, min, max) {
    object(range, label);
    if (range.distribution !== 'uniform') fail(label + ' requires an explicit uniform distribution');
    number(range.min, label + '.min', min, max);
    number(range.max, label + '.max', range.min, max);
    return range;
  }
  function drawUniform(range, rng) { return range.min + random(rng) * (range.max - range.min); }
  function qualityBands(context, parameters) {
    var ranges = object(parameters.qualityByKind, 'qualityByKind')[context.kind];
    if (!Array.isArray(ranges) || !ranges.length) fail('missing quality age ranges for kind ' + context.kind);
    var matches = ranges.filter(function (row) {
      object(row, 'quality age range');
      integer(row.minAge, 'minAge', 1, Number.MAX_SAFE_INTEGER);
      integer(row.maxAge, 'maxAge', row.minAge, Number.MAX_SAFE_INTEGER);
      return context.age >= row.minAge && context.age <= row.maxAge;
    });
    if (matches.length !== 1) fail('age must match exactly one quality age range');
    var quality = qualityId(context.kind === 'youth' ? context.youthQuality : context.clubQuality);
    var bands = object(matches[0].byQuality, 'byQuality')[quality];
    if (!Array.isArray(bands) || !bands.length) fail('missing quality bands for ' + quality);
    bands.forEach(function (band) { uniformRange(band, 'quality band', 1, 20); });
    return bands;
  }
  function minimumSkills(requirements, label) {
    object(requirements, label);
    var keys = Object.keys(requirements);
    if (keys.length < 2) fail(label + ' requires at least two skill thresholds, not just a quality mean');
    keys.forEach(function (key) {
      if (SKILL_KEYS.indexOf(key) < 0) fail(label + ' has unknown skill ' + key);
      number(requirements[key], label + '.' + key, 1, 20);
    });
  }
  function meetsSkills(skills, requirements) {
    return Object.keys(requirements).every(function (key) { return skills[key] >= requirements[key]; });
  }
  function profileParameters(profile, mainPosition) {
    object(profile, 'profile');
    if (typeof profile.id !== 'string' || !profile.id.trim()) fail('profile.id must be nonempty');
    object(profile.offsets, 'profile.offsets');
    object(profile.noiseBySkill, 'profile.noiseBySkill');
    object(profile.capHeadroomBySkill, 'profile.capHeadroomBySkill');
    SKILL_KEYS.forEach(function (key) {
      number(profile.offsets[key], 'offset.' + key, -19, 19);
      uniformRange(profile.noiseBySkill[key], 'noise.' + key, -19, 19);
      uniformRange(profile.capHeadroomBySkill[key], 'headroom.' + key, 0, 19);
    });
    if (!Array.isArray(profile.sidePositionRules)) fail('sidePositionRules must be explicit, including []');
    profile.sidePositionRules.forEach(function (rule) {
      object(rule, 'side position rule');
      position(rule.position);
      var adjacent = mainPosition === 'def' || mainPosition === 'att' ? rule.position === 'mid' : mainPosition === 'mid' && (rule.position === 'def' || rule.position === 'att');
      if (!adjacent) fail('ordinary side positions must be adjacent field positions');
      number(rule.minQuality, 'side minQuality', 1, 20);
      number(rule.maxQualityGap, 'side maxQualityGap', 0, 19);
      minimumSkills(rule.minimumSkills, 'side minimumSkills');
    });
    if (profile.allRounderRule !== null) {
      if (mainPosition === 'gk') fail('keepers cannot have an allRounderRule');
      var all = object(profile.allRounderRule, 'allRounderRule (use null to disable)');
      object(all.minQualityByPosition, 'all-rounder qualities');
      ['def', 'mid', 'att'].forEach(function (pos) { number(all.minQualityByPosition[pos], 'all-rounder ' + pos, 1, 20); });
      minimumSkills(all.minimumSkills, 'all-rounder minimumSkills');
    }
    var height = object(profile.height, 'profile.height');
    number(height.lowerEdgeShare, 'height.lowerEdgeShare', 0, 1);
    [['lower', 165, 169], ['core', 170, 200], ['upper', 201, 205]].forEach(function (region) {
      if (!Array.isArray(height[region[0]]) || !height[region[0]].length) fail('height.' + region[0] + ' must be explicit');
      height[region[0]].forEach(function (row) { integer(row.value, 'height.' + region[0], region[1], region[2]); });
    });
    return profile;
  }
  function createSkills(targetQuality, profile, mainPosition, rng) {
    var offsets = {};
    SKILL_KEYS.forEach(function (key) { offsets[key] = profile.offsets[key] + drawUniform(profile.noiseBySkill[key], rng); });
    var center = rawQuality(offsets, mainPosition);
    var centered = {};
    SKILL_KEYS.forEach(function (key) { centered[key] = offsets[key] - center; });
    function atShift(shift) {
      var result = {};
      SKILL_KEYS.forEach(function (key) { result[key] = Math.max(1, Math.min(20, targetQuality + centered[key] + shift)); });
      return result;
    }
    var skills = atShift(0);
    if (Math.abs(rawQuality(skills, mainPosition) - targetQuality) > 1e-12) {
      // Preserve the requested weighted mean while clipping extreme single skills.
      var lo = -80, hi = 80;
      for (var i = 0; i < 52; i += 1) {
        var shift = (lo + hi) / 2;
        if (rawQuality(atShift(shift), mainPosition) < targetQuality) lo = shift;
        else hi = shift;
      }
      skills = atShift((lo + hi) / 2);
    }
    return skills;
  }
  function playableProfile(skills, mainPosition, profile) {
    if (mainPosition === 'gk') return ['gk'];
    var all = profile.allRounderRule;
    if (all && meetsSkills(skills, all.minimumSkills) && ['def', 'mid', 'att'].every(function (pos) { return rawQuality(skills, pos) >= all.minQualityByPosition[pos]; })) {
      return [mainPosition].concat(['def', 'mid', 'att'].filter(function (pos) { return pos !== mainPosition; }));
    }
    var primaryQuality = rawQuality(skills, mainPosition);
    var candidates = profile.sidePositionRules.filter(function (rule) {
      var quality = rawQuality(skills, rule.position);
      return quality >= rule.minQuality && primaryQuality - quality <= rule.maxQualityGap && meetsSkills(skills, rule.minimumSkills);
    }).map(function (rule) { return rule.position; });
    candidates.sort(function (a, b) { return rawQuality(skills, b) - rawQuality(skills, a) || POSITIONS.indexOf(a) - POSITIONS.indexOf(b); });
    return candidates.length ? [mainPosition, candidates[0]] : [mainPosition];
  }
  function youthTalentProbabilities(populationWeights, youthQuality) {
    object(populationWeights, 'youthPopulationWeights');
    qualityId(youthQuality);
    var total = 0, weighted = 0;
    QUALITY_IDS.forEach(function (key) {
      var count = number(populationWeights[key], 'youthPopulationWeights.' + key, 0, Number.MAX_SAFE_INTEGER);
      total += count;
      weighted += count * YOUTH_TALENT_WEIGHTS[key];
    });
    if (!(total > 0) || !Number.isFinite(total) || !Number.isFinite(weighted)) fail('youth population must have finite positive total weight');
    if (!(populationWeights[youthQuality] > 0)) fail('generated youth quality must be represented in population weights');
    var multiplier = YOUTH_TALENT_WEIGHTS[youthQuality] / (weighted / total);
    var highShare = 0.05 * multiplier;
    var probabilities = {};
    TALENT_BANDS.forEach(function (band) {
      probabilities[band.key] = band.min >= 20 ? band.share * multiplier : band.share * (1 - highShare) / 0.95;
    });
    return probabilities;
  }
  function talentRows(weights, min, max, label) {
    object(weights, label);
    var expectedKeys = [];
    for (var value = min; value <= max; value += 1) expectedKeys.push(String(value));
    if (Object.keys(weights).length !== expectedKeys.length || !expectedKeys.every(function (key) { return Object.prototype.hasOwnProperty.call(weights, key); })) fail(label + ' must specify exactly ' + min + '..' + max);
    return expectedKeys.map(function (key) { return { value: Number(key), weight: weights[key] }; });
  }
  function createTalent(context, parameters, rng) {
    if (context.kind !== 'youth') {
      var byKind = object(parameters.talentWeightsByKind, 'talentWeightsByKind');
      return weightedChoice(talentRows(byKind[context.kind], 10, 22, 'adult talent weights'), rng, 'adult talent').value;
    }
    var probabilities = youthTalentProbabilities(parameters.youthPopulationWeights, context.youthQuality);
    var band = weightedChoice(TALENT_BANDS.map(function (item) { return { value: item, weight: probabilities[item.key] }; }), rng, 'youth talent bands').value;
    var within = object(parameters.talentWithinBandWeights, 'talentWithinBandWeights');
    return weightedChoice(talentRows(within[band.key], band.min, band.max, 'talent band ' + band.key), rng, 'talent within band').value;
  }
  function recommendations(skills, playablePositions, mainPosition, evaluator) {
    if (evaluator === undefined) return [];
    if (typeof evaluator !== 'function') fail('recommendRoles must be a function when supplied');
    var snapshot = Object.freeze({ skills: Object.freeze(Object.assign({}, skills)), playablePositions: Object.freeze(playablePositions.slice()), mainPosition: mainPosition });
    var result = evaluator(snapshot);
    if (!Array.isArray(result)) fail('recommendRoles must return an array');
    var seen = {};
    return result.reduce(function (rows, row) {
      object(row, 'role recommendation');
      if (playablePositions.indexOf(row.position) < 0) fail('role recommendation must use a playable profile position');
      if (typeof row.roleId !== 'string' || !row.roleId.trim()) fail('roleId must be nonempty');
      var key = JSON.stringify([row.position, row.roleId]);
      if (!seen[key]) { rows.push({ position: row.position, roleId: row.roleId }); seen[key] = true; }
      return rows;
    }, []);
  }
  function generatePlayer(context, parameters, rng) {
    object(context, 'context');
    object(parameters, 'parameters (no production defaults)');
    if (typeof rng !== 'function') fail('an explicit rng function is required');
    if (!(typeof context.id === 'string' && context.id.trim()) && !(typeof context.id === 'number' && Number.isSafeInteger(context.id))) fail('id must be a nonempty string or safe integer');
    integer(context.age, 'age', 1, Number.MAX_SAFE_INTEGER);
    position(context.mainPosition);
    if (['youth', 'start', 'free', 'cup'].indexOf(context.kind) < 0) fail('kind must be youth, start, free or cup');
    var bands = qualityBands(context, parameters);
    var profiles = object(parameters.profilesByPosition, 'profilesByPosition')[context.mainPosition];
    if (!Array.isArray(profiles) || !profiles.length) fail('missing profiles for ' + context.mainPosition);
    profiles.forEach(function (profile) { profileParameters(profile, context.mainPosition); });
    var profile = weightedChoice(profiles, rng, 'profiles');
    var quality = drawUniform(weightedChoice(bands, rng, 'quality bands'), rng);
    var skills = createSkills(quality, profile, context.mainPosition, rng);
    var caps = {};
    SKILL_KEYS.forEach(function (key) { caps[key] = Math.min(20, skills[key] + drawUniform(profile.capHeadroomBySkill[key], rng)); });
    var playablePositions = playableProfile(skills, context.mainPosition, profile);
    var heightRegion = random(rng) < 0.95 ? 'core' : (random(rng) < profile.height.lowerEdgeShare ? 'lower' : 'upper');
    var heightCm = weightedChoice(profile.height[heightRegion], rng, 'height.' + heightRegion).value;
    var foot = object(parameters.footWeights, 'footWeights');
    if (Object.keys(foot).length !== 3) fail('footWeights must specify right, left and both');
    var preferredFoot = weightedChoice(['right', 'left', 'both'].map(function (value) { return { value: value, weight: foot[value] }; }), rng, 'foot').value;
    // Talent is drawn after skill/cap/profile construction and is never fed back.
    var talent = createTalent(context, parameters, rng);
    return {
      id: context.id, age: context.age, mainPosition: context.mainPosition,
      playablePositions: playablePositions, skills: skills, caps: caps,
      heightCm: heightCm, preferredFoot: preferredFoot, talent: talent,
      recommendedRoles: recommendations(skills, playablePositions, context.mainPosition, parameters.recommendRoles)
    };
  }

  return Object.freeze({
    SKILL_KEYS: SKILL_KEYS, POSITION_WEIGHTS: POSITION_WEIGHTS,
    TALENT_BANDS: TALENT_BANDS, YOUTH_TALENT_WEIGHTS: YOUTH_TALENT_WEIGHTS,
    positionQuality: positionQuality, eliteQuality: eliteQuality,
    youthTalentProbabilities: youthTalentProbabilities, generatePlayer: generatePlayer
  });
}));
