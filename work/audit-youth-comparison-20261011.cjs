'use strict';
// Analysis-only runner. Freeze sources; never changes product rules or real saves.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),source=path.join(root,'work/ligaexpansion-ap03');
const out=path.join(root,'outputs/youth-comparison-20years-20261011'),frozen=path.join(root,'outputs/youth-20years-20261011/source');fs.mkdirSync(out,{recursive:true});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
if(process.argv.includes('--freeze')){
 fs.mkdirSync(path.join(frozen,'dist'),{recursive:true});fs.mkdirSync(path.join(frozen,'work'),{recursive:true});
 const manifest={createdAt:new Date().toISOString(),source,files:{}};
 for(const f of fs.readdirSync(path.join(source,'dist')).filter(f=>f.endsWith('.js'))){const b=fs.readFileSync(path.join(source,'dist',f));fs.writeFileSync(path.join(frozen,'dist',f),b);manifest.files['dist/'+f]=hash(b);}
 for(const f of ['world-expansion-harness-v167.cjs','test-world-expansion-v161.cjs']){const b=fs.readFileSync(path.join(source,'work',f));fs.writeFileSync(path.join(frozen,'work',f),b);manifest.files['work/'+f]=hash(b);}
 fs.writeFileSync(path.join(out,'source-manifest.json'),JSON.stringify(manifest,null,2));console.log('Frozen',Object.keys(manifest.files).length,'files');process.exit(0);
}
process.chdir(frozen);
const seedArg=process.argv.find(a=>a.startsWith('--seed=')),seed=seedArg?seedArg.slice(7):'youth20-a';
const label=process.argv.find(a=>a.startsWith('--label='))?.slice(8)||seed;
const maxSeason=Number(process.argv.find(a=>a.startsWith('--seasons='))?.slice(10)||20);
const {harness}=require(process.argv.includes('--fast')?path.join(root,'work/youth-audit-native-harness.cjs'):path.join(frozen,'work/world-expansion-harness-v167.cjs'));
const api=harness(),{context,call,run}=api,evaluate=api.evaluate||((code)=>vm.runInContext(code,context));
run('world-expansion-stories-v170.js');
const Generation=evaluate('D6PlayerGeneration'),keys=[...Generation.SKILL_KEYS];
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const q=p=>Generation.positionQuality(p,p.line);
const band=x=>x<=7?'very-weak':x<=10?'weak':x<=13?'normal':x<=16?'good':'very-good';
const savedPath=path.join(out,label+'-audit.json'),checkpointPath=path.join(out,label+'-checkpoint.json');
const resumed=process.argv.includes('--resume')&&fs.existsSync(checkpointPath)?JSON.parse(fs.readFileSync(savedPath,'utf8')):null;
const resumedCareer=resumed?JSON.parse(fs.readFileSync(checkpointPath,'utf8')):null;
const births=new Map(),changes=resumed?.changes||{developmentCalls:0,positive:0,negative:0,ageLoss:0},birthRows=resumed?.births||[];
// Correct observer IDs from the initial pre-reidentification measurement.
if(resumed){for(const b of birthRows){const m=b.pid.match(/:([A-Z]{3})-FREE-S(\d+):(\d+)$/);if(!m)continue;const countryIndex=resumedCareer.world.countries.findIndex(c=>c.id===m[1]),season=Number(m[2]),oldIndex=Number(m[3])-1,slots=(season===1?[[0,2],[4,8],[1,5],[0,9],[2],[6]]:[[0,2,7],[0,4,8],[0,1,5],[0,3,9],[0,2,6],[0,1,6]])[countryIndex%6],slot=slots?.indexOf(oldIndex);if(slot>=0)b.pid=`${seed}:S${season}:${m[1]}:FREE${slot+1}`;}
 for(const row of resumed.snapshots){if(row.origins.unknown){row.origins.free+=row.origins.unknown;row.origins.unknown=0;if(row.originQuality.unknown){row.originQuality.free=row.originQuality.unknown;delete row.originQuality.unknown;}}}for(const s of resumed.seasonStats){s.minutes.free+=s.minutes.unknown;s.minutes.unknown=0;}}
for(const b of birthRows)births.set(b.pid,b);
context.auditBorn=(p,kind,clubId)=>{
 const b={pid:p.pid,kind,clubId,country:clubId?.split('-')[0]||p.pid.match(/:(\w+):FREE/)?.[1]||null,nation:p.nation,age:p.age,quality:q(p),skills:Object.fromEntries(keys.map(k=>[k,p[k]])),talent:p.playerModel.talent,firstSeason:context.auditSeason||1,latestQuality:q(p),latestAge:p.age,minutes:0,positive:0,negative:0,ageLoss:0,promoted:false};
 assert(!births.has(p.pid),'duplicate generated player '+p.pid);births.set(p.pid,b);birthRows.push(b);
};
context.auditDevelopment=(p,before,appearance)=>{const b=births.get(p.pid);changes.developmentCalls++;const delta=q(p)-before;if(delta>0)changes.positive+=delta;else changes.negative+=delta;if(b){b.minutes+=appearance.minutes;b.positive+=Math.max(0,delta);b.negative+=Math.min(0,delta);b.latestQuality=q(p);b.latestAge=p.age;}};
context.auditAge=(p,before)=>{const delta=q(p)-before;changes.ageLoss+=delta;const b=births.get(p.pid);if(b){b.ageLoss+=delta;b.latestQuality=q(p);b.latestAge=p.age;if(p.age===24)b.at24={quality:q(p),minutes:b.minutes,positive:b.positive,negative:b.negative};}};
context.auditQuality=q;context.auditReidentify=(oldPid,p)=>{const b=births.get(oldPid);if(!b)return;births.delete(oldPid);b.pid=p.pid;births.set(p.pid,b);};
evaluate(`const auditBaseGenerate=v153Generate;v153Generate=function(p,f,k,c,y,id){const r=auditBaseGenerate(p,f,k,c,y,id);auditBorn(p,k,id);return r;};
const auditBaseDevelopment=v153ApplyAppearance;v153ApplyAppearance=function(c,p,a,w){const before=auditQuality(p),r=auditBaseDevelopment(c,p,a,w);if(r.status!=='duplicate')auditDevelopment(p,before,a);return r;};
const auditBaseAge=v153AgePlayer;v153AgePlayer=function(c,p,s){const before=auditQuality(p),r=auditBaseAge(c,p,s);auditAge(p,before);return r;};
const auditBaseReidentify=v153ReidentifyNewPlayer;v153ReidentifyNewPlayer=function(p){const old=p.playerModel?.development?.playerId,r=auditBaseReidentify(p);auditReidentify(old,p);return r;};`);
const retirementRows=resumed?.retirements||[],annual=resumed?.annual||[];
context.auditRetirement=(p,clubId)=>retirementRows.push({season:context.auditSeason,pid:p.pid,name:p.name,age:p.age,clubId,kind:births.get(p.pid)?.kind||'unknown',initial:initialIds.has(p.pid)});
evaluate(fs.readFileSync(path.join(root,'work/retirement-audit-hooks-20261011.js'),'utf8'));
context.auditSeason=1;
const career=resumedCareer||call('v167CreateCareer','AUT-5',seed,'Nachwuchsanalyse');context.v61CurrentCareer=career;
const variant=process.argv.find(a=>a.startsWith('--variant='))?.slice(10)||'status';
assert(['status','country'].includes(variant));
const statusRows=resumed?.statusRows||[];context.auditStatusRows=statusRows;context.auditComparisonVariant=variant;
// Construction remains native and identical, including initial pools, budgets and AI promotions.
evaluate(fs.readFileSync(path.join(root,'work/youth-comparison-hooks-20261011.js'),'utf8'));
call('auditInitYouthStatus',career);
const initialIds=new Set(resumed?.initialIds||career.world.clubs.flatMap(c=>c.roster.map(p=>p.pid)));
context.auditInitialIds=[...initialIds];
const snapshots=resumed?.snapshots||[],cohorts=resumed?.cohorts||[],seasonStats=resumed?.seasonStats||[];
context.auditBeforeRetire=()=>snapshot(context.auditSeason,'before-retirement');
function snapshot(season,phase){
 const rows=career.world.clubs.map(club=>{
  const qualities=club.roster.map(q),formation=call('v160WorldConfig',career).fieldPlayers===6?'2–2–2':'2–2–1',side=phase==='closed'?{starters:[],roles:{}}:call('v64BuildSide',club,formation);
  const startingQuality=mean(side.starters.map(pid=>{const p=club.roster.find(p=>p.pid===pid);return Generation.positionQuality(p,side.roles[pid]);}));
  const origins={start:0,youth:0,free:0,cup:0,unknown:0},originQuality={};const ageGroups={u20:0,a20_23:0,a24_29:0,a30plus:0};
  for(const p of club.roster){const b=births.get(p.pid),kind=b?.kind||'unknown';origins[kind]++;(originQuality[kind]??=[]).push(q(p));ageGroups[p.age<20?'u20':p.age<24?'a20_23':p.age<30?'a24_29':'a30plus']++;if(b){b.latestAge=p.age;b.latestQuality=q(p);b.promoted ||= kind==='youth';b.latestClub=club.id;}}
  return{seed,season,phase,clubId:club.id,name:club.name,country:club.countryId,tier:club.expansionTier,simulationOnly:club.simulationOnly,managed:club.id===career.manager.managedClubId,youthProfile:club.policy.youth,startingProfile:club.policy.startingSquad,quality:mean(qualities),startingQuality,rosterSize:club.roster.length,meanAge:mean(club.roster.map(p=>p.age)),qualityBands:Object.fromEntries(['very-weak','weak','normal','good','very-good'].map(b=>[b,qualities.filter(x=>band(x)===b).length])),origins,originQuality:Object.fromEntries(Object.entries(originQuality).map(([k,v])=>[k,{n:v.length,mean:mean(v)}])),ageGroups,balance:club.balance,budget:club.youthBudget,youthStatus:club.auditYouthStatus??null,poolSize:club.youthPool.length,meanPoolQuality:mean(club.youthPool.map(q))};
 });snapshots.push(...rows);
 const roster=new Set(career.world.clubs.flatMap(c=>c.roster.map(p=>p.pid)));
 if(phase==='closed')for(const b of birthRows.filter(b=>b.kind==='youth'))if(b.latestAge>=23&&b.latestAge<=29&&roster.has(b.pid))cohorts.push({seed,season,pid:b.pid,birthCountry:b.country,birthSeason:b.firstSeason,age:b.latestAge,birthQuality:b.quality,quality:b.latestQuality,minutes:b.minutes,positive:b.positive,negative:b.negative,ageLoss:b.ageLoss,promoted:b.promoted,currentlyRostered:true});
}
function save(checkpoint=false){fs.writeFileSync(savedPath,JSON.stringify({seed,mode:'native-compact',managedPolicy:'AUT-5: stay, up to 200 affordable Credits youth, renew due contracts; minimally repair playable roster',maxSeason,variant,statusRows,retirementRule:'age 33: 40%; +10 percentage points/year; deterministic decision at calendar midpoint; season-end departure',initialIds:[...initialIds],retirements:retirementRows,annual,changes,snapshots,cohorts,seasonStats,births:birthRows},null,2));if(checkpoint){fs.writeFileSync(checkpointPath+'.tmp',JSON.stringify(career));fs.renameSync(checkpointPath+'.tmp',checkpointPath);}}
function repairManaged(){
 const own=call('v66Club',career,career.manager.managedClubId);
 for(const c of career.world.contracts.filter(c=>c.clubId===own.id&&c.endSeason===career.world.season)){const p=own.roster.find(p=>p.pid===c.pid);if(!p)continue;try{call('v66Renew',career,p.pid,Math.ceil(Math.max(c.annual,call('v66Salary',p))*1.25/10)*10,3,c.promise);}catch(e){console.log('managed-renewal',career.world.season,e.message);}}
 for(let day=0;day<5;day++){
  const enough=()=>own.roster.length>=10&&own.roster.some(p=>p.keeper)&&own.roster.filter(p=>!p.keeper).length>=5;
  while(!enough()){
   const needKeeper=!own.roster.some(p=>p.keeper),candidate=own.youthPool.filter(p=>needKeeper?p.keeper:!p.keeper).sort((a,b)=>q(b)-q(a))[0];
   if(candidate){try{call('v67Promote',career,own.id,candidate.pid);continue;}catch{}}
   const p=career.world.market.freePlayers.filter(p=>needKeeper?p.keeper:!p.keeper).sort((a,b)=>call('v66Salary',a)-call('v66Salary',b))[0];
   if(!p)throw Error('managed roster cannot be repaired');
   if(career.world.market.pendingBids.some(b=>b.pid===p.pid&&b.buyerId===own.id&&b.status==='pending'))break;
   call('v66MakeBid',career,own.id,p.pid,0,Math.ceil(call('v66Salary',p)*1.5/10)*10,2,0);break;
  }
  call('v66NextMarketDay',career);
 }
 assert.equal(career.world.market.phase,'closed');
}
if(!resumed){snapshot(0,'initial');save();}else{assert.equal(career.world.season,seasonStats.at(-1).season);assert(career.world.seasonFinished);if(career.world.season<maxSeason){if(career.world.transition.choice===null)call('v67ChooseOffer',career);context.auditSeason=career.world.season+1;call('v62NextSeason',career);}}
for(let season=resumed?seasonStats.at(-1).season+1:1;season<=maxSeason;season++){
 context.auditSeason=season;const started=performance.now(),own=call('v66Club',career,career.manager.managedClubId);
 call('v66ChooseSponsor',career,own.id,own.sponsors[0].id);const affordableBudget=Math.min(200,call('v67BudgetLimit',own));if(affordableBudget<200)console.log(JSON.stringify({seed,season,managedBudget:affordableBudget,balance:own.balance}));call('v124SetYouthBudget',career,affordableBudget);repairManaged();call('auditFreezeExpectations',career);snapshot(season,'opening');
 let lastHeartbeat=performance.now();while(!career.world.seasonFinished){call('v62AdvanceDay',career);if(performance.now()-lastHeartbeat>=45000){console.log(JSON.stringify({seed,season,calendarDay:career.world.calendarCursor,elapsedMs:Math.round(performance.now()-started)}));lastHeartbeat=performance.now();}}
 const fixtures=call('v62Fixtures',career);assert.equal(fixtures.length,991);assert(fixtures.every(f=>f.result&&f.matchRecord?.players?.length));
 const ids=career.world.clubs.flatMap(c=>c.roster.map(p=>p.pid));assert.equal(new Set(ids).size,ids.length);assert(career.world.clubs.filter(c=>c.leagueId&&!c.managed).every(c=>Number.isFinite(c.balance)));
 snapshot(season,'closed');
 const ai=career.world.clubs.filter(c=>!c.simulationOnly&&c.id!==career.manager.managedClubId),aiIds=new Set(ai.map(c=>c.id));
 const clubMetrics=ai.map(c=>{const ledger=c.ledger.filter(r=>r.season===season),expenses=ledger.filter(r=>r.amount<0),sum=rows=>rows.reduce((s,r)=>s+Math.abs(r.amount),0);return{clubId:c.id,country:c.countryId,expenses:sum(expenses),salaries:sum(expenses.filter(r=>r.id.endsWith(':salary'))),youthFunding:sum(expenses.filter(r=>r.id.endsWith(':youth-budget'))),promotionFees:sum(expenses.filter(r=>r.id.endsWith(':youth-promotion'))),transferFees:sum(expenses.filter(r=>r.id.includes(':transfer')||r.label.startsWith('Transfer'))),income:sum(ledger.filter(r=>r.amount>0)),balance:c.balance,generated:birthRows.filter(b=>b.kind==='youth'&&b.firstSeason===season&&b.clubId===c.id&&!b.pid.includes(':Y0:')).length,promoted:career.world.careerEvents.events.filter(e=>e.type==='youth-promotion'&&e.season===season&&e.clubId===c.id).length,retired:retirementRows.filter(r=>r.season===season&&r.clubId===c.id).length,initialRemaining:c.roster.filter(p=>initialIds.has(p.pid)).length};});
 annual.push({season,clubs:clubMetrics,initialRemainingAllClubs:career.world.clubs.flatMap(c=>c.roster).filter(p=>initialIds.has(p.pid)).length,initialRemainingIncludingFree:[...career.world.clubs.flatMap(c=>c.roster),...career.world.market.freePlayers].filter(p=>initialIds.has(p.pid)).length,decisions:career.world.auditRetirementDecisions});
 const minutes={youth:0,start:0,free:0,cup:0,unknown:0},ratings={};let allMinutes=0;
 for(const f of fixtures)for(const p of f.matchRecord.players){const b=births.get(p.pid),kind=b?.kind||'unknown';minutes[kind]+=p.minutes;allMinutes+=p.minutes;if(b?.kind==='youth'){const row=ratings[b.country]??={appearances:0,minutes:0,growthEligibleMinutes:0,negativeRatingMinutes:0};row.appearances++;row.minutes+=p.minutes;if(p.rating>=6.5)row.growthEligibleMinutes+=p.minutes;if(p.rating<5.5&&p.rating!==null)row.negativeRatingMinutes+=p.minutes;}}
 const validate=season===1||season===10||season===20;if(validate)assert(call('v61ValidateCareer',career),'invalid world S'+season);
 seasonStats.push({season,milliseconds:Math.round(performance.now()-started),fixtures:fixtures.length,minutes,allMinutes,ratings,validated:validate,ranking:[...career.world.countryRanking]});save(true);if(typeof globalThis.gc==='function')globalThis.gc();
 console.log(JSON.stringify({seed,season,milliseconds:seasonStats.at(-1).milliseconds,youthMinutesShare:minutes.youth/allMinutes,meanAiQuality:mean(snapshots.filter(s=>s.season===season&&s.phase==='closed'&&!s.simulationOnly&&!s.managed).map(s=>s.quality))}));
 if(season<maxSeason){if(career.world.transition.choice===null)call('v67ChooseOffer',career);context.auditSeason=season+1;call('v62NextSeason',career);}
}
save();console.log('Completed',seed,maxSeason,'native seasons');
