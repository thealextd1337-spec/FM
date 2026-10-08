// Acceptance of a material outcome effect from the controlled 90-game study.
// Thresholds were specified after the exploratory run; not a preregistered study.
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const dir='docs/spieler-nutzer-rig/',data=JSON.parse(fs.readFileSync(dir+'match-study-v115.json')),verification=JSON.parse(fs.readFileSync(dir+'verification-v115.json'));
const keys=['spd','tec','pas','fin','tak','pos','air','sta','gk'];
// Only physical simulation modules are relevant; a later glove change is visual.
for(const name of ['game.js','set-pieces-v50.js','pitch-v55.js','pitch-v57.js','world-backpedal-v108.js','world-ball-motion-v110.js'])assert.equal(crypto.createHash('sha256').update(fs.readFileSync('dist/'+name)).digest('hex'),verification.sourceHashes[name],`Physical engine changed: rerun the study (${name})`);
assert.equal(data.runs.length,90);assert(data.validation?.bookedScoresMatch&&data.validation.shotCountersMatch&&data.validation.noPageErrors);
const equal=data.runs.filter(r=>r.pair==='good-good'),mixed=data.runs.filter(r=>r.pair==='good-weak'),weak=data.runs.filter(r=>r.pair==='weak-weak');
for(const runs of [equal,mixed,weak]){assert.equal(runs.length,30);assert.deepEqual(runs.map(r=>r.seed),data.method.seeds);assert.equal(runs.filter(r=>r.aHome).length,15);}
assert.deepEqual(data.profiles['good-good'][0],data.profiles['good-weak'][0],'Team A is held constant');
assert.deepEqual(data.profiles['good-weak'][1],data.profiles['weak-weak'][1],'Weak opponent is held constant');
for(let n=0;n<11;n++)for(const k of keys)assert.equal(data.profiles['good-good'][1][n][k]-data.profiles['good-weak'][1][n][k],10,'Only the controlled skill gap');
const total=t=>Object.fromEntries(Object.keys(mixed[0].teams[t]).map(k=>[k,mixed.reduce((v,r)=>v+r.teams[t][k],0)])),stats=[total(0),total(1)],wins=mixed.filter(r=>r.score[0]>r.score[1]).length,controlWins=equal.filter(r=>r.score[0]>r.score[1]).length,goalDifference=mixed.reduce((v,r)=>v+r.score[0]-r.score[1],0)/30;
const probability=wins/30,z=1.959963984540054,wilsonLower=(probability+z*z/60-z*Math.sqrt(probability*(1-probability)/30+z*z/(4*30*30)))/(1+z*z/30);
const checks=[
 {name:'Siege des stärkeren Teams',unit:'Anteil',minimum:.80,actual:probability},
 {name:'Untere Wilson-95%-Grenze der Siegquote',unit:'Anteil',minimum:.75,actual:wilsonLower},
 {name:'Siegquotenanstieg bei unverändertem Team A gegenüber gut/gut',unit:'Prozentpunkte',minimum:30,actual:100*(wins-controlWins)/30},
 {name:'Mittlerer Torvorsprung des stärkeren Teams',unit:'Tore/Partie',minimum:1,actual:goalDifference},
 {name:'Passquotenvorsprung',unit:'Prozentpunkte',minimum:10,actual:100*(stats[0].passComplete/stats[0].passes-stats[1].passComplete/stats[1].passes)},
 {name:'Zweikampfquotenvorsprung',unit:'Prozentpunkte',minimum:20,actual:100*(stats[0].duelsWon/stats[0].duels-stats[1].duelsWon/stats[1].duels)},
 {name:'Verhältnis registrierter Zielschüsse stark/schwach',unit:'Faktor',minimum:2,actual:stats[0].onTarget/stats[1].onTarget}
].map(c=>({...c,passed:c.actual>=c.minimum}));
const report={date:'2026-10-04',sourceStudy:'match-study-v115.json',thresholdsAddedAfterExploratoryRun:true,controlledAttributeGap:10,games:90,mixedWins:wins,controlWins,checks,passed:checks.every(c=>c.passed),scope:'Joint influence of all nine abilities at a large gap; no isolated attribute or medium-gap proof',statisticsAccountingLimit:'Five goalkeeper accounting deviations documented separately; outcome checks use booked scores'};
fs.writeFileSync(dir+'player-value-impact-qa-v115.json',JSON.stringify(report,null,2)+'\n');
for(const c of checks)assert(c.passed,`${c.name}: ${c.actual} < ${c.minimum}`);
console.log(JSON.stringify(report,null,2));
