'use strict';

// LOCAL MEASUREMENT CANDIDATE ONLY. These are unconfirmed balance values.
// Safe to import for an isolated new-world preview; never a production default.
const Generation = require('../dist/player-generation.js');
const SEEDS = Object.freeze([101, 211, 307, 401, 503, 601, 701, 809, 907, 1009]);
const QUALITY_IDS = ['weak', 'normal', 'strong'];
const POSITIONS = ['gk', 'def', 'mid', 'att'];
const LEGACY_SKILL_KEYS = ['tec', 'pas', 'fin', 'tak', 'pos', 'spd', 'sta', 'air', 'gk'];

function createRng(seed) {
  let state = seed >>> 0;
  return function () {
    state = (state + 0x6D2B79F5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
function uniform(min, max, weight) {
  const result = { distribution: 'uniform', min, max };
  if (weight !== undefined) result.weight = weight;
  return result;
}
function skillMap(values) {
  if (values.length !== Generation.SKILL_KEYS.length) throw new Error('Candidate must specify all 13 values');
  return Object.fromEntries(Generation.SKILL_KEYS.map((key, i) => [key, values[i]]));
}
function heightRows(min, max, mean, width) {
  return Array.from({ length: max - min + 1 }, (_, i) => ({ value: min + i, weight: Math.exp(-0.5 * ((min + i - mean) / width) ** 2) }));
}
function side(position, minimumSkills) {
  return { position, minQuality: 7, maxQualityGap: 2.5, minimumSkills };
}
function profile(id, weight, offsets, meanHeight, lowerEdgeShare, sidePositionRules, allRounderRule = null) {
  return {
    id, weight, offsets: skillMap(offsets),
    noiseBySkill: Object.fromEntries(Generation.SKILL_KEYS.map(key => [key, uniform(-0.6, 0.6)])),
    capHeadroomBySkill: Object.fromEntries(Generation.SKILL_KEYS.map((key, i) => [key,
      offsets[i] >= 1 ? uniform(4, 8) : offsets[i] >= -0.5 ? uniform(2.5, 5) : uniform(0.5, 3)
    ])),
    height: {
      lowerEdgeShare,
      lower: heightRows(165, 169, 167, 2),
      core: heightRows(170, 200, meanHeight, 6.5),
      upper: heightRows(201, 205, 203, 2)
    },
    sidePositionRules, allRounderRule
  };
}
const youthQuality = {
  weak: [uniform(7, 8.7, 0.90), uniform(5, 6.9, 0.075), uniform(10.2, 13.5, 0.0245), uniform(16, 17.5, 0.0005)],
  normal: [uniform(7, 10, 0.90), uniform(5, 6.9, 0.045), uniform(10.2, 13.5, 0.054), uniform(16, 17.5, 0.001)],
  strong: [uniform(8.3, 10, 0.88), uniform(5, 6.9, 0.035), uniform(10.2, 13.5, 0.083), uniform(16, 17.5, 0.002)]
};
function adultQuality(ageOffset, kindOffset) {
  const shift = ageOffset + kindOffset;
  return {
    weak: [uniform(5.5 + shift, 8 + shift, 0.22), uniform(8 + shift, 11.5 + shift, 0.65), uniform(11.5 + shift, 14.5 + shift, 0.12), uniform(16 + shift, 18 + shift, 0.01)],
    normal: [uniform(6 + shift, 8 + shift, 0.08), uniform(9 + shift, 12 + shift, 0.65), uniform(12.5 + shift, 15.5 + shift, 0.25), uniform(16 + shift, 18 + shift, 0.02)],
    strong: [uniform(6 + shift, 8 + shift, 0.04), uniform(9 + shift, 12 + shift, 0.32), uniform(12.5 + shift, 15.5 + shift, 0.57), uniform(16 + shift, 18 + shift, 0.07)]
  };
}
function adultAgeRanges(kindOffset) {
  return [
    { minAge: 17, maxAge: 19, byQuality: adultQuality(-2, kindOffset) },
    { minAge: 20, maxAge: 29, byQuality: adultQuality(0, kindOffset) },
    { minAge: 30, maxAge: 42, byQuality: adultQuality(-0.8, kindOffset) }
  ];
}
const talentWithinBandWeights = {
  '10-13': { 10: 1, 11: 1, 12: 1, 13: 1 },
  '14-17': { 14: 1, 15: 1, 16: 1, 17: 1 },
  '18-19': { 18: 1, 19: 1 }, '20': { 20: 1 }, '21': { 21: 1 }, '22': { 22: 1 }
};
const adultTalentWeights = Object.fromEntries(Generation.TALENT_BANDS.flatMap(band =>
  Array.from({ length: band.max - band.min + 1 }, (_, i) => [band.min + i, band.share / (band.max - band.min + 1)])
));
const candidateParameters = {
  // Profile IDs describe generation patterns; they are not P04 role IDs.
  profilesByPosition: {
    gk: [
      profile('keeper-line', 0.65, [-1, -2, -5, -4, 2, -0.5, -0.5, -3, 4, 1.5, 1.5, 1, 1], 188, 0.10, []),
      profile('keeper-build', 0.35, [1, 1.6, -5, -3.5, 1, 0.3, 0, -3, 3, 1, 1, 1.2, 0.5], 186, 0.15, [])
    ],
    def: [
      profile('defender-intercept', 0.65, [-1.4, -1.2, -3, 2.7, 2, 0.8, 0.3, 0.6, -7, -0.5, 1.8, 1.1, 1], 186, 0.30, []),
      profile('defender-build', 0.35, [1.8, 2, -2, 1, 1.5, 0.3, 0.5, -0.4, -7, 0.2, 1, 1.5, -0.3], 183, 0.45, [side('mid', { pas: 8, tec: 8, dec: 8, tak: 7 })])
    ],
    mid: [
      profile('midfielder-create', 0.37, [2, 2.5, -0.3, -1.7, 0.6, 0.2, 0.5, -2, -7, 1, 1, 1.5, -1.5], 180, 0.65, [side('att', { fin: 9, tec: 10, pos: 8 })]),
      profile('midfielder-anchor', 0.32, [-1, 0.2, -2, 2, 1.5, -0.3, 1, 0, -7, 0.5, 1.5, 1, 1], 185, 0.35, [side('def', { tak: 8, pos: 8, ant: 8, str: 7 })]),
      profile('midfielder-runner', 0.302, [0, 0, 0.5, 0, 0.8, 2, 2, -1, -7, -0.7, 0.8, 0, 0.2], 181, 0.60, [side('att', { fin: 9, tec: 8, pos: 9, spd: 9 })]),
      profile('midfielder-versatile', 0.008, [0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, -6, 0.7, 0.7, 0.7, 0.7], 183, 0.50, [], {
        minQualityByPosition: { def: 10, mid: 10, att: 10 }, minimumSkills: { pas: 10, tak: 10, fin: 10, tec: 10, dec: 10 }
      })
    ],
    att: [
      profile('attacker-finish', 0.40, [0.2, -0.8, 3, -4, 1.8, 0.8, -0.3, -0.5, -7, 1.5, 1.8, 0.4, 0.3], 183, 0.50, []),
      profile('attacker-link', 0.30, [1.7, 2, 1.8, -2.5, 1.3, -0.3, -0.5, 1, -7, 1, 1, 1, 1.6], 188, 0.25, [side('mid', { pas: 8, tec: 8, dec: 8 })]),
      profile('attacker-run', 0.30, [0.4, -0.5, 2, -3.5, 1.5, 3, 0.5, -2, -7, 0.8, 2, 0.1, -0.8], 179, 0.70, [])
    ]
  },
  qualityByKind: {
    youth: [{ minAge: 17, maxAge: 17, byQuality: youthQuality }],
    start: adultAgeRanges(0), free: adultAgeRanges(-0.7), cup: adultAgeRanges(-0.3)
  },
  // Generated youth VOLUMES, not a count of clubs. The measurement samples 1:2:3.
  youthPopulationWeights: { weak: 1, normal: 2, strong: 3 },
  talentWithinBandWeights,
  talentWeightsByKind: { start: { ...adultTalentWeights }, free: { ...adultTalentWeights }, cup: { ...adultTalentWeights } },
  footWeights: { right: 70, left: 23, both: 7 }
};

function wilson(successes, total, z = 1.959963984540054) {
  const p = successes / total;
  const denominator = 1 + z * z / total;
  const center = (p + z * z / (2 * total)) / denominator;
  const half = z * Math.sqrt(p * (1 - p) / total + z * z / (4 * total * total)) / denominator;
  return [center - half, center + half];
}
function accumulator() {
  return { n: 0, sum: 0, sumSquares: 0, normalYouth: 0, elite: 0, heightCore: 0, heightSum: 0, single: 0, adjacent: 0, allRounder: 0, below20Caps: 0, legacyAnyTop: 0, legacyThreeTop: 0, legacyFiveTop: 0, talentBands: Object.fromEntries(Generation.TALENT_BANDS.map(b => [b.key, 0])), feet: { right: 0, left: 0, both: 0 } };
}
function add(acc, player) {
  const quality = Generation.positionQuality(player.skills, player.mainPosition);
  acc.n += 1; acc.sum += quality; acc.sumSquares += quality * quality;
  acc.normalYouth += quality >= 7 && quality <= 10 ? 1 : 0;
  acc.elite += Generation.eliteQuality(player.skills, player.playablePositions) ? 1 : 0;
  acc.heightCore += player.heightCm >= 170 && player.heightCm <= 200 ? 1 : 0;
  acc.heightSum += player.heightCm;
  acc[player.playablePositions.length === 1 ? 'single' : player.playablePositions.length === 2 ? 'adjacent' : 'allRounder'] += 1;
  acc.below20Caps += Object.values(player.caps).filter(value => value < 20).length;
  acc.feet[player.preferredFoot] += 1;
  const topLegacySkills = LEGACY_SKILL_KEYS.filter(key => player.skills[key] >= 17).length;
  acc.legacyAnyTop += topLegacySkills >= 1 ? 1 : 0;
  acc.legacyThreeTop += topLegacySkills >= 3 ? 1 : 0;
  acc.legacyFiveTop += topLegacySkills >= 5 ? 1 : 0;
  const band = Generation.TALENT_BANDS.find(b => player.talent >= b.min && player.talent <= b.max);
  acc.talentBands[band.key] += 1;
}
function summary(acc, includeDistributions = true) {
  const result = {
    n: acc.n, mainQualityMean: acc.sum / acc.n,
    mainQualitySd: Math.sqrt(Math.max(0, acc.sumSquares / acc.n - (acc.sum / acc.n) ** 2)),
    mainQuality7to10Share: acc.normalYouth / acc.n,
    elite: { count: acc.elite, share: acc.elite / acc.n, ci95: wilson(acc.elite, acc.n) },
    heightCore: { count: acc.heightCore, share: acc.heightCore / acc.n, ci95: wilson(acc.heightCore, acc.n) },
    heightMeanCm: acc.heightSum / acc.n,
    positions: { single: acc.single, adjacent: acc.adjacent, allRounder: acc.allRounder },
    capsBelow20Share: acc.below20Caps / (acc.n * 13),
    legacyNineSkillTopBands: { threshold: 17, anyShare: acc.legacyAnyTop / acc.n, atLeastThreeShare: acc.legacyThreeTop / acc.n, atLeastFiveShare: acc.legacyFiveTop / acc.n }
  };
  if (includeDistributions) {
    result.talent = Object.fromEntries(Generation.TALENT_BANDS.map(b => [b.key, { count: acc.talentBands[b.key], share: acc.talentBands[b.key] / acc.n, ci95: wilson(acc.talentBands[b.key], acc.n) }]));
    result.feet = Object.fromEntries(Object.keys(acc.feet).map(key => [key, { count: acc.feet[key], share: acc.feet[key] / acc.n }]));
  }
  return result;
}
function measureCandidate(options = {}) {
  const seeds = options.seeds || SEEDS;
  const youthPerWeight = options.youthPerWeight === undefined ? 1000 : options.youthPerWeight;
  const adultsPerQuality = options.adultsPerQuality === undefined ? 250 : options.adultsPerQuality;
  const youth = accumulator(), all = accumulator();
  const cohorts = {}, byKind = {}, byPosition = {}, byAge = {}, seedRows = [];
  for (const seed of seeds) {
    const rng = createRng(seed), seedYouth = accumulator(), seedAdults = {};
    for (const kind of ['youth', 'start', 'free', 'cup']) {
      for (const quality of QUALITY_IDS) {
        const cohortKey = kind + '/' + quality;
        cohorts[cohortKey] ||= accumulator();
        const count = kind === 'youth' ? youthPerWeight * candidateParameters.youthPopulationWeights[quality] : adultsPerQuality;
        const local = accumulator();
        for (let i = 0; i < count; i += 1) {
          const age = kind === 'youth' ? 17 : [18, 25, 34][i % 3];
          const mainPosition = POSITIONS[i % POSITIONS.length];
          const player = Generation.generatePlayer({ id: `${seed}/${cohortKey}/${i}`, kind, age, mainPosition, clubQuality: quality, youthQuality: quality }, candidateParameters, rng);
          add(all, player); add(local, player); add(cohorts[cohortKey], player);
          byKind[kind] ||= accumulator(); add(byKind[kind], player);
          byPosition[kind + '/' + mainPosition] ||= accumulator();
          byAge[kind + '/' + age] ||= accumulator();
          add(byPosition[kind + '/' + mainPosition], player); add(byAge[kind + '/' + age], player);
          if (kind === 'youth') { add(youth, player); add(seedYouth, player); }
        }
        if (kind !== 'youth') seedAdults[cohortKey] = local.sum / local.n;
      }
    }
    seedRows.push({ seed, youthN: seedYouth.n, youthQualityMean: seedYouth.sum / seedYouth.n, youthNormalShare: seedYouth.normalYouth / seedYouth.n, youthElite: seedYouth.elite, adultQualityMeans: seedAdults });
  }
  const pop = candidateParameters.youthPopulationWeights;
  const popTotal = Object.values(pop).reduce((sum, value) => sum + value, 0);
  const normalizedExpected = Object.fromEntries(Generation.TALENT_BANDS.map(b => [b.key,
    QUALITY_IDS.reduce((sum, quality) => sum + pop[quality] / popTotal * Generation.youthTalentProbabilities(pop, quality)[b.key], 0)
  ]));
  return {
    status: 'UNCONFIRMED LOCAL BALANCE CANDIDATE; NOT A PRODUCTION DEFAULT',
    parameterVersion: 'p01-measurement-candidate-1', seeds: [...seeds],
    sample: { youthPerWeight, adultsPerQuality, youthPopulationWeights: { ...pop }, adultAges: [18, 25, 34], positions: [...POSITIONS] },
    normalizedYouthExpectedShares: normalizedExpected,
    youth: summary(youth), all: summary(all),
    cohorts: Object.fromEntries(Object.entries(cohorts).map(([key, value]) => [key, summary(value)])),
    byKind: Object.fromEntries(Object.entries(byKind).map(([key, value]) => [key, summary(value)])),
    byPosition: Object.fromEntries(Object.entries(byPosition).map(([key, value]) => [key, summary(value, false)])),
    byAge: Object.fromEntries(Object.entries(byAge).map(([key, value]) => [key, summary(value, false)])),
    seedRows,
    limits: [
      'The 1:2:3 youth population weighting must be replaced with actual generated youth volumes before any production calibration.',
      'Adult, cap, profile, side-position, height-within-region, within-talent-band and foot distributions are unconfirmed candidates.',
      'The role catalog/evaluator is not present: every recommendedRoles list is empty.',
      'Wilson 95% intervals describe seeded random sample uncertainty, not an approved production balance or per-team quota.',
      'No engine, historical save, browser rendering, finances or multi-season development is exercised.'
    ]
  };
}

module.exports = { candidateParameters, createRng, SEEDS, wilson, measureCandidate };
if (require.main === module) {
  const report = measureCandidate();
  if (process.argv.includes('--compare-historical')) {
    const fs = require('node:fs'), path = require('node:path');
    const referencePath = path.resolve(__dirname, '../outputs/player-generation-baseline-2026-10-06.json');
    const reference = JSON.parse(fs.readFileSync(referencePath, 'utf8'));
    report.historicalReference = {
      path: referencePath, date: reference.date, seeds: reference.seeds, method: reference.method,
      warning: 'Common nine-skill top-band metric only. Different ages, club weights and sample sizes; historical initialization also performs real market/youth actions. No reconstruction of missing mental/strength values and no historical elite estimate.',
      populations: Object.fromEntries([['league', 'start'], ['cupOnly', 'cup'], ['youth', 'youth'], ['free', 'free']].map(([oldKey, newKey]) => [oldKey, {
        historical: reference.populations[oldKey], candidateN: report.byKind[newKey].n,
        candidateNineSkillTopBands: report.byKind[newKey].legacyNineSkillTopBands
      }]))
    };
  }
  if (process.argv.includes('--json')) process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  else {
    const percent = value => (100 * value).toFixed(3) + '%';
    console.log(report.status);
    console.log(`Seeds: ${report.seeds.join(', ')}; total=${report.all.n}; youth=${report.youth.n}`);
    console.log(`Youth quality 7–10: ${percent(report.youth.mainQuality7to10Share)}; elite: ${percent(report.youth.elite.share)} (95% ${report.youth.elite.ci95.map(percent).join('–')})`);
    console.log(`Global height 170–200: ${percent(report.all.heightCore.share)} (95% ${report.all.heightCore.ci95.map(percent).join('–')})`);
    for (const band of Generation.TALENT_BANDS) {
      const found = report.youth.talent[band.key];
      console.log(`Youth talent ${band.key}: ${found.count}/${report.youth.n}, ${percent(found.share)}, expected=${percent(report.normalizedYouthExpectedShares[band.key])}, 95%=${found.ci95.map(percent).join('–')}`);
    }
    for (const [key, row] of Object.entries(report.cohorts)) console.log(`${key}: n=${row.n}, mean=${row.mainQualityMean.toFixed(3)}, sd=${row.mainQualitySd.toFixed(3)}, elite=${percent(row.elite.share)}, all-rounders=${row.positions.allRounder}`);
    for (const row of report.seedRows) console.log(`Seed ${row.seed}: youth mean=${row.youthQualityMean.toFixed(3)}, 7–10=${percent(row.youthNormalShare)}, elite=${row.youthElite}`);
    if (report.historicalReference) {
      console.log('Historical reference: ' + report.historicalReference.warning);
      for (const [key, row] of Object.entries(report.historicalReference.populations)) console.log(`${key} nine-skill any top band: historical=${row.historical.anyTopBandPercent.toFixed(3)}% (n=${row.historical.players}), candidate=${percent(row.candidateNineSkillTopBands.anyShare)} (n=${row.candidateN}); >=3 top bands historical=${row.historical.atLeastThreeTopBandPercent.toFixed(3)}%, candidate=${percent(row.candidateNineSkillTopBands.atLeastThreeShare)}`);
    }
  }
}
