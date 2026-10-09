'use strict';
// Independent source-catalog check of the profiles exported from compiled C#.
// Run from the worktree root: node outputs/3d-quality/stadiums/check-catalog.cjs
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const crypto = require('crypto');
const root = path.resolve(__dirname, '../../..');
const read = name => fs.readFileSync(path.join(root,name),'utf8').replace(/^\uFEFF/,'');
const catalog = vm.runInNewContext(read('dist/world-catalog-v61.js')+'; v61Catalog',{}, {timeout:1000});
const profiles = JSON.parse(read('outputs/3d-quality/stadiums/profile-catalog.json'));
const checks = [];
function requireCheck(condition, name) { if (!condition) throw new Error(name); checks.push(name); }
const expected = catalog.map(club=>club.id).sort();
const actual = profiles.map(profile=>profile.ClubId).sort();
requireCheck(catalog.length===48 && profiles.length===48 && JSON.stringify(actual)===JSON.stringify(expected),
  'compiled C# profiles match all actual 48 active catalog IDs');
requireCheck(new Set(actual).size===48,'no duplicate profiles');
const shape = p=>JSON.stringify([p.Archetype,p.FacadeMotif,p.TierCounts,p.RoofSides,p.StandDepth,p.MastHeight,p.RoofOverhang,p.CornerBuildings]);
requireCheck(new Set(profiles.map(shape)).size===48,'48 architecture combinations without club color, name or seed');
requireCheck(new Set(profiles.map(p=>p.Archetype)).size===8,'eight archetypes in exported compiled data');
requireCheck(new Set(profiles.map(p=>p.FacadeMotif)).size===8,'eight facade motifs in exported compiled data');
for (const p of profiles) {
  requireCheck(p.TierCounts.length===4 && p.RoofSides.length===4 && p.TierCounts.every(n=>Number.isInteger(n)&&n>=3&&n<=14),p.ClubId+' four valid rows');
  requireCheck(p.RoofSides.every(n=>typeof n==='boolean') && p.RoofSides.some(Boolean),p.ClubId+' roof data');
  requireCheck([p.StandDepth,p.MastHeight,p.RoofOverhang].every(Number.isFinite) && p.StandDepth>0 && p.MastHeight>0 && p.RoofOverhang>=0,p.ClubId+' finite dimensions');
  let seed=2166136261;
  for(let i=0;i<p.ClubId.length;i++) seed=Math.imul(seed^p.ClubId.charCodeAt(i),16777619);
  requireCheck(p.DetailSeed===(seed&0x7fffffff),p.ClubId+' independent FNV reference');
}
const digest = name=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex');
const report = {passed:checks.length,checks,sourceHashes:{
  catalog:digest('dist/world-catalog-v61.js'),
  profiles:digest('prototypes/match-engine-unity/ClubStadiumProfiles.cs'),
  tests:digest('prototypes/match-engine-unity/ClubStadiumProfilesTests.cs')},
  counts:{clubs:profiles.length,archetypes:8,facadeMotifs:8,uniqueArchitectures:48},
  limitation:'Pure profile data checked; rendered geometry and device performance require Unity integration.'};
fs.writeFileSync(path.join(__dirname,'catalog-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:checks.length,...report.counts}));
