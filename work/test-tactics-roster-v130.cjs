'use strict';
// Run from the repository root; transferable to work/ without changing paths.
// Uses the established native harness and actual production controllers only.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {harness}=require(path.resolve('work/youth-native-harness-v176.cjs'));
const h=harness(),{call,copy,evaluate}=h,checks=[];
const feature=fs.readFileSync('dist/world-career-plan-v64.js','utf8'),end=feature.indexOf('v61CareerTabs.splice');
assert(end>0,'Expected native match-plan definition boundary');evaluate(feature.slice(0,end));
const test=(name,fn)=>{fn();checks.push(name);};
function fixture(fieldPlayers,count){
 const career=call('v167CreateCareer','ITA-2',`roster-ci-${fieldPlayers}-${count}`,'Roster CI',{fieldSize:fieldPlayers===6?'large':'standard',fieldPlayers});
 const club=career.world.clubs.find(c=>c.id===career.manager.managedClubId);
 while(club.roster.length<count){const player=career.world.market.freePlayers.find(p=>!p.keeper);assert(player,'Real generated transfer candidate');call('v66Transfer',career,{id:`roster-ci-${player.pid}`,buyerId:club.id,sellerId:null,pid:player.pid,price:0,annual:call('v66Salary',player),years:1,promise:0,placedDay:0,status:'pending'});}
 assert.equal(club.roster.length,count);assert(call('v61ValidateCareer',copy(career)),'Actual transferred career is valid');
 const f=call('v62Fixtures',career).find(f=>!f.result&&(f.homeId===club.id||f.awayId===club.id));assert(f);
 const state=call('v64MakeState',career,f),side=f.homeId===club.id?0:1;career.world.activeMatch={fixtureId:f.id,state};
 return {career,club,fixture:f,state,side};
}
function restored(x){const career=copy(x.career),club=career.world.clubs.find(c=>c.id===career.manager.managedClubId),fixture=call('v62Fixtures',career).find(f=>f.id===x.fixture.id);return {career,club,fixture,state:career.world.activeMatch.state,side:x.side};}
const plan=x=>x.fixture.plan[x.side===0?'home':'away'];
const outside=x=>x.club.roster.filter(p=>![...plan(x).starters,...plan(x).bench].includes(p.pid));
const stateBytes=x=>JSON.stringify({state:x.state,plan:x.fixture.plan});
function invariant(x,original){assert.equal(plan(x).starters.length,original.start);assert.equal(plan(x).bench.length,original.bank);assert.deepEqual(x.club.roster.map(p=>p.pid),original.roster);const selected=[...plan(x).starters,...plan(x).bench];assert.equal(new Set(selected).size,selected.length);assert.equal(plan(x).starters.filter(pid=>x.club.roster.find(p=>p.pid===pid).keeper).length,1);assert.deepEqual(call('v64Active',x.state,x.side),plan(x).starters);assert.deepEqual(call('v64Bench',x.state,x.side),plan(x).bench);assert.equal(new Set([...selected,...outside(x).map(p=>p.pid)]).size,original.roster.length);}
function ledgerSnapshot(state){return copy(state.playerLoad);}
function assertOldLedger(state,before){const now=state.playerLoad;for(const pid of Object.keys(before.players)){assert.deepEqual(now.players[pid],before.players[pid]);assert.deepEqual(now.meta[pid],before.meta[pid]);assert.equal(now.startFresh[pid],before.startFresh[pid]);}for(const key of ['sequence','pending','parameters','day','compactPositions','parameterId','version'])assert.deepEqual(now[key],before[key]);}
function addPending(x){const pid=plan(x).starters.find(pid=>!x.club.roster.find(p=>p.pid===pid).keeper);call('v158Pending',x.state,pid);assert(Object.keys(x.state.playerLoad.pending).length>0);
 // Controlled nonzero transport-cursor sentinel: no fabricated played minutes
 // or consumption event is executed before kickoff. Admission must retain it.
 x.state.playerLoad.sequence=7;
}
function admission(x,pid){const expected={fresh:{[pid]:x.club.roster.find(p=>p.pid===pid).fresh}};call('v158Initialize',x.career,x.fixture,expected);return expected;}
function assertAdmission(x,pid,expected){assert.equal(x.state.minutes[pid],0);assert.deepEqual(x.state.stats[pid],{goals:0,assists:0,shots:0});assert.equal(x.state.fresh[pid],expected.fresh[pid]);assert.deepEqual(x.state.playerLoad.players[pid],expected.playerLoad.players[pid]);assert.deepEqual(x.state.playerLoad.meta[pid],expected.playerLoad.meta[pid]);assert.equal(x.state.playerLoad.startFresh[pid],expected.playerLoad.startFresh[pid]);}
for(const fieldPlayers of [5,6])for(const count of [13,14]){
 const initial=fixture(fieldPlayers,count),prefix=`${fieldPlayers}/${count}`,base={start:fieldPlayers+1,bank:plan(initial).bench.length,roster:initial.club.roster.map(p=>p.pid)};
 test(prefix+' real valid transferred roster has surplus',()=>{assert(outside(initial).some(p=>!p.keeper));assert.equal(base.bank,5);invariant(initial,base);assert(initial.state.playerLoad);});
 test(prefix+' outside to field transfers slot role/orientation/cell and preserves load',()=>{
  const x=restored(initial),incoming=outside(x).find(p=>!p.keeper),slot=plan(x).starters.findIndex(pid=>!x.club.roster.find(p=>p.pid===pid).keeper),outPid=plan(x).starters[slot];
  call('v64SetOrientation',x.state,outPid,1);addPending(x);const role=copy(x.state.roleAssignments[outPid]),legacyRole=x.state.roles[outPid],cell=x.state.cells[outPid],bank=[...plan(x).bench],old=ledgerSnapshot(x.state),expected=admission(x,incoming.pid);
  assert.equal(x.state.fresh[incoming.pid],undefined);call('v64SetPrematchSlot',x.career,x.fixture,x.state,x.side,slot,incoming.pid);
  assert.equal(plan(x).starters[slot],incoming.pid);assert.deepEqual(plan(x).bench,bank);assert(outside(x).some(p=>p.pid===outPid));assert.deepEqual(x.state.roleAssignments[incoming.pid],role);assert.equal(x.state.roles[incoming.pid],legacyRole);assert.equal(x.state.orientation[incoming.pid],1);assert.equal(x.state.cells[incoming.pid],cell);assert.equal(x.state.roleAssignments[outPid],undefined);assertAdmission(x,incoming.pid,expected);assertOldLedger(x.state,old);invariant(x,base);
 });
 test(prefix+' outside to bank then field preserves native bench boundary',()=>{
  const x=restored(initial),incoming=outside(x).find(p=>!p.keeper),benchPid=plan(x).bench.find(pid=>!x.club.roster.find(p=>p.pid===pid).keeper),index=plan(x).bench.indexOf(benchPid),start=[...plan(x).starters];addPending(x);const old=ledgerSnapshot(x.state),expected=admission(x,incoming.pid);
  call('v129RosterBench',x.career,x.fixture,x.state,x.side,benchPid,incoming.pid);assert.equal(plan(x).bench[index],incoming.pid);assert.deepEqual(plan(x).starters,start);assert(outside(x).some(p=>p.pid===benchPid));assertAdmission(x,incoming.pid,expected);assertOldLedger(x.state,old);invariant(x,base);
  const slot=start.findIndex(pid=>!x.club.roster.find(p=>p.pid===pid).keeper),outPid=start[slot],role=copy(x.state.roleAssignments[outPid]);call('v64SetPrematchSlot',x.career,x.fixture,x.state,x.side,slot,incoming.pid);assert.equal(plan(x).bench[index],outPid);assert.deepEqual(x.state.roleAssignments[incoming.pid],role);assertOldLedger(x.state,old);invariant(x,base);
 });
 test(prefix+' keeper can replace keeper; field player cannot replace keeper',()=>{
  const x=restored(initial),slot=plan(x).starters.findIndex(pid=>x.club.roster.find(p=>p.pid===pid).keeper),outPid=plan(x).starters[slot],reserve=x.club.roster.find(p=>p.keeper&&p.pid!==outPid),role=copy(x.state.roleAssignments[outPid]);assert(reserve);call('v64SetPrematchSlot',x.career,x.fixture,x.state,x.side,slot,reserve.pid);assert.deepEqual(x.state.roleAssignments[reserve.pid],role);invariant(x,base);
  const y=restored(initial),incoming=outside(y).find(p=>!p.keeper),before=stateBytes(y);assert.throws(()=>call('v64SetPrematchSlot',y.career,y.fixture,y.state,y.side,slot,incoming.pid));assert.equal(stateBytes(y),before);
 });
 for(const api of ['field','bank'])for(const reason of ['live','paused','finished','minute','injured','suspended','matchEligible','active','foreign'])test(prefix+' '+api+' refuses '+reason+' without mutation',()=>{
  const x=restored(initial),slot=plan(x).starters.findIndex(pid=>!x.club.roster.find(p=>p.pid===pid).keeper);let incoming=outside(x).find(p=>!p.keeper);
  if(['live','paused','finished'].includes(reason))x.state.phase=reason;
  if(reason==='minute')x.state.minute=.01;
  if(['injured','suspended','matchEligible'].includes(reason))incoming[reason]=reason==='matchEligible'?false:true;
  if(reason==='active')incoming=x.club.roster.find(p=>p.pid===plan(x).starters.find((pid,i)=>i!==slot&&!x.club.roster.find(p=>p.pid===pid).keeper));
  if(reason==='foreign')incoming=x.career.world.clubs.find(c=>c.id!==x.club.id&&!c.simulationOnly).roster.find(p=>!p.keeper);
  const before=stateBytes(x);assert.throws(()=>api==='field'?call('v64SetPrematchSlot',x.career,x.fixture,x.state,x.side,slot,incoming.pid):call('v129RosterBench',x.career,x.fixture,x.state,x.side,plan(x).bench[0],incoming.pid));assert.equal(stateBytes(x),before);
 });
 test(prefix+' exact JSON restore and saved plan reach next native match',()=>{
  const x=restored(initial),incoming=outside(x).find(p=>!p.keeper),slot=plan(x).starters.findIndex(pid=>!x.club.roster.find(p=>p.pid===pid).keeper);call('v64SetOrientation',x.state,plan(x).starters[slot],-1);call('v64SetPrematchSlot',x.career,x.fixture,x.state,x.side,slot,incoming.pid);
  const json=JSON.stringify(x.career),loaded=JSON.parse(json);assert.equal(JSON.stringify(loaded),json);assert.equal(stateBytes(restored(x)),stateBytes(x));
  x.career.manager.matchPlan=call('v140MatchPresetPlan',x.career,x.fixture,x.state,x.side);const saved=copy(x.career.manager.matchPlan);assert.equal(saved.starters[slot],incoming.pid);
  const next=call('v62Fixtures',x.career).find(f=>f.id!==x.fixture.id&&!f.result&&(f.homeId===x.club.id||f.awayId===x.club.id));assert(next);const state=call('v64MakeState',x.career,next),side=next.homeId===x.club.id?0:1;assert.deepEqual(call('v64Active',state,side),saved.starters);assert.deepEqual(call('v64Bench',state,side),saved.bench);assert.deepEqual(state.roleAssignments[incoming.pid],saved.roleAssignments[incoming.pid]);assert.equal(state.orientation[incoming.pid],-1);
  const current=JSON.stringify(x.career);call('v64CareerPlanNormalize',x.career,x.career.manager.matchPlan);assert.equal(JSON.stringify(x.career),current,'Reading/restoring must not migrate a career');
 });
 test(prefix+' legacy instruction transfer uses actual legacy branch',()=>{
  const x=restored(initial);delete x.state.roleAssignments;delete x.state.playerPerformance;const incoming=outside(x).find(p=>!p.keeper),slot=plan(x).starters.findIndex(pid=>['mid','att'].includes(x.state.roles[pid])),outPid=plan(x).starters[slot],values=evaluate('v64Instructions')[x.state.roles[outPid]].slice(0,2);assert(values.length);call('v64SetInstructions',x.state,outPid,values);call('v64SetOrientation',x.state,outPid,1);call('v64SetPrematchSlot',x.career,x.fixture,x.state,x.side,slot,incoming.pid);assert.deepEqual(call('v64PlayerInstructions',x.state,incoming.pid),values);assert.equal(x.state.instructions[outPid],undefined);assert.equal(x.state.orientation[incoming.pid],1);invariant(x,base);
 });
}
const sourceFiles=['world-match-v64.js','world-career-plan-v64.js','world-player-load-v158.js','player-load-candidate-v158.js','player-freshness.js','world-player-roles-v154.js','world-player-performance-v155.js','world-economy-v66.js'];
const report={pass:true,checks,cases:4,sourceHashes:Object.fromEntries(sourceFiles.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync('dist/'+f)).digest('hex')])),scope:'Real generated 13/14 roster careers; existing production VM harness; no browser, build, live or hardware claim'};
if(process.argv.includes('--report')){const output=path.resolve('outputs/release-130/roster-tests/checks.json');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');}
console.log(`PASS tactics roster v130: ${checks.length} checks, ${report.cases} configurations`);
