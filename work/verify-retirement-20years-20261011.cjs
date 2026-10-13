'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),base=path.join(root,'outputs/youth-20years-20261011'),out=path.join(root,'outputs/retirement-20years-20261011');
const manifest=JSON.parse(fs.readFileSync(path.join(base,'source-manifest.json'))),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const [file,expected] of Object.entries(manifest.files))assert.equal(hash(fs.readFileSync(path.join(base,'source',file))),expected,'Frozen source changed: '+file);
const experiment=JSON.parse(fs.readFileSync(path.join(out,'experiment-manifest.json')));
for(const row of experiment.instrumentation){assert.equal(hash(fs.readFileSync(path.join(root,row.file))).toUpperCase(),row.sha256,'Instrumentation changed while running');assert.equal(hash(fs.readFileSync(path.join(out,'instrumentation',path.basename(row.file)))).toUpperCase(),row.sha256);}
const checks=[];
for(const suffix of ['a','b','c']){
 const a=JSON.parse(fs.readFileSync(path.join(out,`retirement20-${suffix}-audit.json`))),c=JSON.parse(fs.readFileSync(path.join(out,`retirement20-${suffix}-checkpoint.json`))),b=JSON.parse(fs.readFileSync(path.join(base,`youth20-${suffix}-audit.json`)));
 assert.equal(a.seasonStats.length,20);assert.equal(c.world.season,20);assert(c.world.seasonFinished);assert.equal(a.annual.length,20);
 const retired=new Set(a.retirements.map(r=>r.pid)),initial=new Set(a.initialIds),active=new Set([...c.world.clubs.flatMap(c=>c.roster),...c.world.market.freePlayers].map(p=>p.pid)),otherExits=c.world.careerEvents.events.filter(e=>initial.has(e.pid)&&['pool-exit','retirement'].includes(e.type));
 const unexplained=[...initial].filter(pid=>!retired.has(pid)&&!active.has(pid)&&!otherExits.some(e=>e.pid===pid));assert.equal(unexplained.length,0,'Unexplained initial-player disappearance');
 const cupBirths=a.births.filter(b=>b.kind==='cup'&&b.pid.includes(':replacement:'));
 assert(cupBirths.every(b=>b.age>=18&&b.age<=23),'Cup age profile shifted');
 for(const club of c.world.clubs.filter(club=>club.simulationOnly))for(const p of club.roster){const born=cupBirths.find(b=>b.pid===p.pid);if(born)assert.equal(p.age,born.age+Math.max(0,20-born.firstSeason-1),'Cup aged before first playing season');}
 const zero=a.snapshots.filter(r=>r.phase==='initial'),controlZero=b.snapshots.filter(r=>r.phase==='initial');assert.deepEqual(zero,controlZero,'different initial clubs');
 const before=a.snapshots.filter(r=>r.phase==='before-retirement'&&r.season===1),control=b.snapshots.filter(r=>r.phase==='closed'&&r.season===1);assert.equal(before.length,192);for(const r of before){const prior=control.find(x=>x.clubId===r.clubId);assert.equal(r.quality,prior.quality,'S1 football affected before retirement');assert.equal(r.rosterSize,prior.rosterSize);}
 const controlCareer=JSON.parse(fs.readFileSync(path.join(base,`youth20-${suffix}-checkpoint.json`)));
 const controlResults=new Map(controlCareer.world.competitions.filter(x=>x.season===1).flatMap(x=>x.fixtures).map(f=>[f.id,f.result]));
 for(const f of c.world.competitions.filter(x=>x.season===1).flatMap(x=>x.fixtures))assert.deepEqual(f.result,controlResults.get(f.id),'S1 native fixture changed');
 for(const yearly of a.annual){assert.equal(yearly.clubs.length,95);assert(new Set(yearly.decisions.map(d=>d.pid)).size===yearly.decisions.length);for(const d of yearly.decisions){assert(d.age>=33);assert.equal(d.chance,Math.min(1,.4+(d.age-33)*.1));assert(d.decisionDay>=112&&d.decisionDay<224);if(d.chance===1)assert(d.retire);assert.equal(a.retirements.some(r=>r.season===yearly.season&&r.pid===d.pid),d.retire,'decision not executed');}for(const r of yearly.clubs){assert(r.expenses>=r.salaries+r.youthFunding+r.promotionFees);const promotions=c.world.careerEvents.events.filter(e=>e.type==='youth-promotion'&&e.season===yearly.season&&e.clubId===r.clubId);assert.equal(r.promoted,promotions.length);}}
 assert.deepEqual(a.seasonStats.filter(s=>s.validated).map(s=>s.season),[1,10,20]);assert(a.seasonStats.every(s=>s.fixtures===991));assert(a.snapshots.filter(r=>r.phase==='opening').every(r=>r.rosterSize>=10));assert(!a.snapshots.some(r=>r.origins.unknown));
 checks.push({seed:a.seed,fixtures:a.seasonStats.reduce((n,s)=>n+s.fixtures,0),sourceFilesVerified:Object.keys(manifest.files).length,initialPlayers:initial.size,initialActive:[...initial].filter(pid=>active.has(pid)).length,initialRetired:a.retirements.filter(r=>initial.has(r.pid)).length,initialOtherExits:[...initial].filter(pid=>!active.has(pid)&&!retired.has(pid)).length,unexplainedInitialExits:0,annualFinancialAndPromotionChecks:20,midpointAndRetirementExecutionChecks:20,initialAndFirstSeasonControlEquality:true,fullNativeValidation:[1,10,20]});
}
fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify({checkedAt:new Date().toISOString(),passed:true,checks},null,2));console.log(JSON.stringify(checks,null,2));
