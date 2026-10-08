// Controlled moderate skill gaps; reuses the frozen live-engine experiment.
const fs=require('node:fs'),Module=require('node:module'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
assert(!process.argv.includes('--audit-accounting'),'Use the dedicated v117 anomaly runner');
const dir='docs/spieler-nutzer-rig/',hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'),verification=JSON.parse(fs.readFileSync(dir+'moderate-gaps-engine-v118.json'));
assert.equal(hash('outputs/Doppel-6-Fussballmanager.html'),verification.offline.sha256,'Use the verified halftime fix');
for(const [file,value] of Object.entries(verification.sourceHashes))assert.equal(hash('dist/'+file),value,'Unchanged engine '+file);
const protocol={version:118,recordedAt:new Date().toISOString(),gamesPerGroup:30,groups:[{id:'gap-0',label:'Gleich stark',a:14,b:14},{id:'gap-1',label:'Kleiner Abstand',a:14,b:13},{id:'gap-2',label:'Mittlerer Abstand',a:14,b:12},{id:'gap-4',label:'Größerer Abstand',a:14,b:10}],seeds:Array.from({length:30},(_,i)=>(20261004+i*104729)>>>0),controls:'Identical Team A, role specialization, tactics, form, age, freshness, roster, venue order and seed; all nine opposing abilities jointly reduced. Fresh career clone each game. 15 home/15 away per group.',criteria:[{id:'gap2-points',gap:2,metric:'pointsUplift',minimum:.20},{id:'gap2-goals',gap:2,metric:'goalDifferenceUplift',minimum:.20},{id:'gap4-points',gap:4,metric:'pointsUplift',minimum:.40},{id:'gap4-goals',gap:4,metric:'goalDifferenceUplift',minimum:.50}],uncertainty:'Paired bootstrap percentile intervals for point and goal difference uplift; 10000 resamples, fixed analysis RNG independent of game RNG. Point criteria and confidence evidence reported separately. No assertion of universal monotonicity from 30 matches.',balanceFlags:'Flag 90% or more wins at gaps 1/2, or no weaker wins/draws; flag non-monotone sample trend. No automatic tuning to this sample.',scope:'Moderate joint ability gaps only, not isolated attributes or tactics; no simulation/UI changes.',artifactSha256:verification.offline.sha256};
const protocolFile=dir+'moderate-gaps-protocol-v118.json';
if(fs.existsSync(protocolFile)){const saved=JSON.parse(fs.readFileSync(protocolFile));assert.deepEqual(saved.groups,protocol.groups);assert.deepEqual(saved.seeds,protocol.seeds);assert.deepEqual(saved.criteria,protocol.criteria);assert.equal(saved.artifactSha256,verification.previousBuildSha256)}else fs.writeFileSync(protocolFile,JSON.stringify({...protocol,artifactSha256:verification.previousBuildSha256},null,2)+'\n');
let code=fs.readFileSync('work/study-match-statistics-v115.cjs','utf8');
function replace(before,after){assert(code.includes(before),'Study seam changed: '+before);code=code.replace(before,after)}
replace("const pairs=[{id:'good-good',label:'Gut gegen gut',a:16,b:16},{id:'good-weak',label:'Gut gegen schwach',a:16,b:6},{id:'weak-weak',label:'Schwach gegen schwach',a:6,b:6}];",'const pairs='+JSON.stringify(protocol.groups)+';');
replace("engine:'v115; regular offline build; physical live engine'","engine:'v118 study; v117 accounting plus verified halftime throw-in fix'");
replace('goodBase:16,weakBase:6','baselineA:14,opposingBases:[14,13,12,10],groups:pairs,protocolFile:"moderate-gaps-protocol-v118.json"');
// Replace every historical destination/reference so --resume cannot load v115 data.
code=code.replaceAll("'match-study-v115.json'","'moderate-gaps-120-v118.json'").replaceAll("'match-study-accounting-v115.json'","'moderate-gaps-audit-unused-v118.json'").replaceAll('audit?auditCases.length:90','audit?auditCases.length:120');
replace('shots,goalTrace,terminalFlight:', 'shots,goalTrace,ballAccounting:match.ballAccounting,reportAccounting:state.postMatchReport.ballAccounting,bookedAccounting:fixture.matchRecord.ballAccounting,terminalFlight:');
replace('assert.equal(run.teams[t].goals,run.score[t]);',"assert.equal(run.teams[t].goals+run.goalTrace.filter(g=>g.team===t&&g.source==='own-goal').length,run.score[t],'Player goals plus own goals awarded equal scoreboard');");
replace('   assert(run.finished,',`   fs.writeFileSync(path.join(root,'moderate-gaps-last-run-v118.json'),JSON.stringify(run,null,2)+'\\n');
   if(run.goalTrace.some(g=>g.source==='own-goal')&&!fs.existsSync(path.join(root,'moderate-gaps-own-goal-example-v118.json')))fs.writeFileSync(path.join(root,'moderate-gaps-own-goal-example-v118.json'),JSON.stringify(run,null,2)+'\\n');
   assert(run.finished,`);
replace('    return {pair:pair.id,',`    if(!match.finished||!state.postMatchReport||!fixture.matchRecord)throw Error('Incomplete study match '+JSON.stringify({pair:pair.id,index,frames,elapsed:match.elapsed,phase:state.phase,running,finished:match.finished,score:match.score,kickoff:match.kickoff,halftime:match.halftime,halftimePending:match.halftimePending,halftimePause:match.halftimePause,setPiece:match.setPiece,throwIn:match.throwIn,next:match.next,flight:match.flight?{target:match.flight.target,progress:match.flight.progress}:null,rebound:match.rebound,report:!!state.postMatchReport,booked:!!fixture.matchRecord}));
    return {pair:pair.id,`);
replace('   report.profiles||={};',`
   const ledger=run.ballAccounting,byId=new Map(ledger.events.map(e=>[e.id,e]));
   assert.equal(ledger.version,117);assert.equal(byId.size,ledger.sequence);assert.deepEqual(run.reportAccounting,ledger);assert.deepEqual(run.bookedAccounting,ledger);
   for(const e of ledger.events){if(e.parentId!==null)assert(e.parentId<e.id&&byId.has(e.parentId));if(e.shot)assert(e.result);}
   assert.equal(ledger.events.filter(e=>e.shot).length,run.shots.length);
   for(const t of [0,1]){const stats=run.teams[t],other=run.teams[1-t];assert.equal(stats.faced,stats.saves+stats.shotConceded);assert.equal(stats.conceded,stats.shotConceded+stats.nonShotConceded);assert.equal(stats.saves,stats.savesCaught+stats.savesParried);assert.equal(stats.faced,other.onTarget);assert.equal(ledger.events.filter(e=>e.kind==='goal'&&e.team===t).length,run.score[t]);}
   delete run.reportAccounting;delete run.bookedAccounting;
   report.profiles||={};`);
replace('shotCountersMatch:true,noPageErrors:true','shotCountersMatch:true,noPageErrors:true,linkedEvents:true,keeperIdentities:true,reportAndBookedLedgerMatch:true');
const m=new Module(path.resolve('work/study-match-statistics-v115.cjs'),module);m.filename=path.resolve('work/study-match-statistics-v115.cjs');m.paths=module.paths;m._compile(code,m.filename);
