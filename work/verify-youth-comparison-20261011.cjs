'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'outputs/youth-comparison-20years-20261011'),read=p=>JSON.parse(fs.readFileSync(p,'utf8')),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const partial=process.argv.includes('--partial');
const source=path.join(root,'outputs/youth-20years-20261011/source'),manifest=read(path.join(root,'outputs/youth-20years-20261011/source-manifest.json'));
for(const [file,expected]of Object.entries(manifest.files))assert.equal(hash(fs.readFileSync(path.join(source,file))),expected,'frozen source changed '+file);
const proofs=[];
for(const variant of ['status','country'])for(const suffix of ['a','b','c']){
 const a=read(path.join(out,`${variant}20-${suffix}-audit.json`)),c=read(path.join(out,`${variant}20-${suffix}-checkpoint.json`)),b=read(path.join(root,`outputs/retirement-20years-20261011/retirement20-${suffix}-audit.json`)),bc=read(path.join(root,`outputs/retirement-20years-20261011/retirement20-${suffix}-checkpoint.json`));
 const seasons=a.seasonStats.length;if(!partial)assert.equal(seasons,20);assert.equal(c.world.season,seasons);assert(c.world.seasonFinished);
 const projection=r=>({clubId:r.clubId,quality:r.quality,startingQuality:r.startingQuality,rosterSize:r.rosterSize,meanAge:r.meanAge,balance:r.balance,budget:r.budget,poolSize:r.poolSize,origins:r.origins});
 for(const phase of ['initial','opening','before-retirement','closed'])assert.deepEqual(a.snapshots.filter(r=>!r.simulationOnly&&r.season<2&&r.phase===phase).map(projection),b.snapshots.filter(r=>!r.simulationOnly&&r.season<2&&r.phase===phase).map(projection),'first season league differs '+variant+suffix+phase);
 const resultProjection=x=>x.world.competitions.filter(p=>p.season===1).flatMap(p=>p.fixtures.map(f=>({id:f.id,result:f.result})));
 assert.deepEqual(resultProjection(c),resultProjection(bc),'season 1 football differs');
 let finances=0,promotions=0,decisions=0;
 const born=new Map(a.births.map(b=>[b.pid,b])),retired=new Map(a.retirements.map(r=>[r.pid,r]));assert.equal(born.size,a.births.length);assert.equal(retired.size,a.retirements.length);
 for(const annual of a.annual){
  assert.equal(annual.clubs.length,95);
  for(const row of annual.clubs){
   const expected=a.births.filter(b=>b.kind==='youth'&&b.clubId===row.clubId&&b.firstSeason===annual.season&&!b.pid.includes(':Y0:')).length;assert.equal(row.generated,expected);
   const events=c.world.careerEvents.events.filter(e=>e.type==='youth-promotion'&&e.season===annual.season&&e.clubId===row.clubId).length;assert.equal(row.promoted,events);promotions++;
   // Legacy ledger labels miss some purchases; authoritative transfer records are checked against total expenses.
   const transfers=c.world.transfers.filter(t=>t.season===annual.season&&t.buyerId===row.clubId).reduce((s,t)=>s+(t.price||0),0);
   assert(Math.abs(row.expenses-row.salaries-row.youthFunding-row.promotionFees-transfers)<1e-7,'expense decomposition mismatch');
   assert([row.balance,row.expenses,row.income].every(Number.isFinite));finances++;
   if(annual.season>=2){const status=a.statusRows.find(s=>s.season===annual.season&&s.clubId===row.clubId);assert(status);assert([0,500,1000,1500].includes(status.budget));assert(status.status>=0&&status.status<=100);assert.equal(status.budget,row.youthFunding);assert(status.leagueExpected>=1&&status.leagueExpected<=8);}
  }
  for(const d of annual.decisions){assert(d.decisionDay>=112&&d.decisionDay<=114);assert(Math.abs(d.chance-Math.min(1,.4+(d.age-33)*.1))<1e-12);if(d.retire)assert.equal(retired.get(d.pid)?.season,annual.season);decisions++;}
 }
 assert(a.seasonStats.every(s=>s.fixtures===991));assert.deepEqual(a.seasonStats.filter(s=>s.validated).map(s=>s.season),[1,10,20].filter(s=>s<=seasons));
 assert(a.snapshots.filter(r=>r.phase==='opening').every(r=>r.rosterSize>=10));assert(a.snapshots.every(r=>r.origins.unknown===0));
 const active=[...c.world.clubs.flatMap(c=>c.roster),...c.world.market.freePlayers];assert(active.every(p=>p.age<39));assert(active.every(p=>!retired.has(p.pid)));
 for(const p of active){assert(born.has(p.pid));for(const k of Object.keys(born.get(p.pid).skills)){assert(p[k]>=1&&p[k]<=20);assert(p.playerModel.caps[k]>=p[k]-1e-8);}}
 proofs.push({variant,seed:a.seed,seasons,fixtures:seasons*991,identicalFirstSeasonFixtures:991,identicalInitialLeagueAndFirstSeason:true,financesChecked:finances,promotionCountsChecked:promotions,retirementDecisionsChecked:decisions,nativeValidation:[1,10,20].filter(s=>s<=seasons),minimumOpeningPlayers:Math.min(...a.snapshots.filter(r=>r.phase==='opening').map(r=>r.rosterSize)),unknownOrigins:0});
}
const files=['audit-youth-comparison-20261011.cjs','youth-comparison-hooks-20261011.js','retirement-audit-hooks-20261011.js','youth-audit-native-harness.cjs'];
const current=Object.fromEntries(files.map(f=>[f,hash(fs.readFileSync(path.join(root,'work',f)))]));
const frozen=read(path.join(out,'experiment-manifest.json'));assert.deepEqual(current,frozen.instrumentation);
const totalNewFixtures=proofs.reduce((s,p)=>s+p.fixtures,0);
fs.writeFileSync(path.join(out,partial?'partial-validation.json':'validation.json'),JSON.stringify({pass:true,complete:!partial,createdAt:new Date().toISOString(),sourceFiles:Object.keys(manifest.files).length,unchangedInstrumentation:current,proofs,totalNewFixtures},null,2));
console.log(JSON.stringify({pass:true,complete:!partial,worlds:proofs.length,totalNewFixtures,firstSeasonIdentical:true}));
