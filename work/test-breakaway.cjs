const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {makeContext}=require('./test-v41.cjs');

const context=makeContext();
for(const file of ['youth-v33.js','penalties-v42.js','club-records-v43.js','club-identity-v44.js','keeper-logo-v45.js','match-report-v47.js','next-match-v49.js','set-pieces-v50.js','status-icons-v51.js','player-status-v51.js','strength-v55.js','opponent-profile-v54.js'])
 vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context,{filename:file});
vm.runInContext('var v24Validation=()=>[];var v25RoleBar=()=>{};var v24Remember=()=>{};var v24FatigueText=()=>"frisch";var v24TopSkills=()=>"Passspiel gut";',context);
for(const file of ['pitch-v55.js','pitch-v56.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context,{filename:file});
vm.runInContext("beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');document.querySelector('#canvas').parentElement={append(){}};start();Math.random=()=>.5",context);

function scenario(code){return JSON.parse(vm.runInContext(`JSON.stringify((()=>{${code}})())`,context))}
const keeperHold=scenario(`
 match.kickoff=null;match.setPiece=null;match.throwIn=null;match.flight=null;match.rebound=null;match.slide=null;match.goalPause=0;match.elapsed=10;match.next=100;
 const keeper=match.people.find(p=>p.t===1&&p.keeper),attacker=match.people.find(p=>p.t===0&&!p.keeper&&p.line==='att');
 keeper.x=.5;keeper.y=.1;attacker.x=.5;attacker.y=.2;match.owner=keeper;match.ball={x:keeper.x,y:keeper.y};
 step(.05,.05);return{targetY:attacker.ty,keeperY:keeper.y};
`);
assert(keeperHold.targetY>keeperHold.keeperY+.1,'opponent must not chase a goalkeeper holding the ball');
for(const team of [0,1]){
 const clear=scenario(`
  match.kickoff=null;match.setPiece=null;match.throwIn=null;match.flight=null;match.rebound=null;match.slide=null;match.goalPause=0;match.elapsed=12;match.next=12;
  const carrier=match.people.find(p=>p.t===${team}&&!p.keeper),allies=match.people.filter(p=>p.t===${team}&&!p.keeper&&p!==carrier),rivals=match.people.filter(p=>p.t!==${team}&&!p.keeper);
  carrier.x=.5;carrier.y=${team===0?'.4':'.6'};for(const ally of allies){ally.x=.85;ally.y=${team===0?'.75':'.25'}}
  for(const rival of rivals){rival.x=.8;rival.y=${team===0?'.65':'.35'}}
  match.owner=carrier;match.ball={x:carrier.x,y:carrier.y};action();
  return{flight:Boolean(match.flight),owner:match.owner===carrier,next:match.next,shots:carrier.stats.shots};
 `);
 assert.equal(clear.flight,false,`team ${team}: a clear carrier should not pass backward`);
 assert.equal(clear.owner,true,`team ${team}: clear carrier should keep running`);
 assert(clear.next>12,`team ${team}: continuing run schedules another decision`);
}

const square=scenario(`
 match.kickoff=null;match.setPiece=null;match.throwIn=null;match.flight=null;match.rebound=null;match.slide=null;match.elapsed=15;match.next=15;
 const own=match.people.filter(p=>p.t===0&&!p.keeper),carrier=own[0],runner=own[1];
 carrier.x=.25;carrier.y=.3;runner.x=.48;runner.y=.31;
 for(const ally of own.slice(2)){ally.x=.85;ally.y=.75}for(const rival of match.people.filter(p=>p.t===1&&!p.keeper)){rival.x=.85;rival.y=.65}
 match.owner=carrier;match.ball={x:carrier.x,y:carrier.y};action();
 return{targetX:match.flight?.target.x,targetY:match.flight?.target.y,passes:carrier.stats.passes};
`);
assert(Math.abs(square.targetX-.48)<.05&&Math.abs(square.targetY-.31)<.05,'open onside co-runner receives a square pass');
const offsideRunner=scenario(`
 match.kickoff=null;match.setPiece=null;match.throwIn=null;match.flight=null;match.rebound=null;match.slide=null;match.elapsed=16;match.next=16;
 const own=match.people.filter(p=>p.t===0&&!p.keeper),carrier=own[0],runner=own[1];
 carrier.x=.25;carrier.y=.3;runner.x=.48;runner.y=.22;
 for(const ally of own.slice(2)){ally.x=.85;ally.y=.75}for(const rival of match.people.filter(p=>p.t===1&&!p.keeper)){rival.x=.85;rival.y=.65}
 match.owner=carrier;match.ball={x:carrier.x,y:carrier.y};action();return{flight:Boolean(match.flight),owner:match.owner===carrier};
`);
assert.equal(offsideRunner.flight,false,'offside co-runner is not selected for the square pass');
assert.equal(offsideRunner.owner,true,'carrier keeps the ball when the only co-runner is offside');
const finishRun=scenario(`
 match.kickoff=null;match.setPiece=null;match.throwIn=null;match.flight=null;match.rebound=null;match.slide=null;match.elapsed=18;match.next=18;
 const carrier=match.people.find(p=>p.t===1&&!p.keeper),allies=match.people.filter(p=>p.t===1&&!p.keeper&&p!==carrier);
 carrier.x=.5;carrier.y=.76;for(const ally of allies){ally.x=.85;ally.y=.2}for(const rival of match.people.filter(p=>p.t===0&&!p.keeper)){rival.x=.8;rival.y=.35}
 match.owner=carrier;match.ball={x:carrier.x,y:carrier.y};const before=carrier.stats.shots;action();return{shots:carrier.stats.shots-before,flight:Boolean(match.flight)};
`);
assert.equal(finishRun.shots,1,'clear run ends in a shot once the carrier is close enough');
assert.equal(finishRun.flight,true,'shot leaves the foot');
const blockedRun=scenario(`
 match.kickoff=null;match.setPiece=null;match.throwIn=null;match.flight=null;match.rebound=null;match.slide=null;match.elapsed=19;match.next=19;
 const carrier=match.people.find(p=>p.t===0&&!p.keeper),rival=match.people.find(p=>p.t===1&&!p.keeper);
 carrier.x=.5;carrier.y=.4;rival.x=.5;rival.y=.3;return v55HasClearRun(carrier,[rival],.6);
`);
assert.equal(blockedRun,false,'a defender ahead blocks the breakaway rule');
console.log('PASS: clear runs, onside square passes, and no chase of goalkeeper in possession');
