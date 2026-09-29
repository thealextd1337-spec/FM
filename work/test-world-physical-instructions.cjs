const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {makeContext}=require('./test-v41.cjs');

const context=makeContext();
for(const file of ['youth-v33.js','penalties-v42.js','club-records-v43.js','club-identity-v44.js','keeper-logo-v45.js','match-report-v47.js','next-match-v49.js','set-pieces-v50.js','status-icons-v51.js','player-status-v51.js','strength-v55.js','opponent-profile-v54.js'])
 vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context,{filename:file});
vm.runInContext('var v24Validation=()=>[];var v25RoleBar=()=>{};var v24Remember=()=>{};var v24FatigueText=()=>"frisch";var v24TopSkills=()=>"Passspiel gut";',context);
vm.runInContext(fs.readFileSync('dist/pitch-v55.js','utf8'),context,{filename:'pitch-v55.js'});
vm.runInContext("beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');document.querySelector('#canvas').parentElement={append(){}};start();match.kickoff=null;match.countdown=0;match.elapsed=10;match.next=Infinity",context);

vm.runInContext(`(()=>{
 const own=match.people.filter(player=>player.t===0&&!player.keeper),carrier=own[0],wing=own[1],support=own[2],deep=own[3];
 match.owner=carrier;carrier.x=.5;carrier.y=.5;match.ball={x:.5,y:.5};
 wing.instructions=['wing','support'];wing.bx=.32;support.instructions=['support'];deep.instructions=['wing','deep','shoot'];deep.bx=.32;deep.assignedLine='att';
 for(const rival of match.people.filter(player=>player.t===1&&!player.keeper)){rival.x=.9;rival.y=.25}
 step(.05,.05);
 if(Math.abs(wing.tx-.16)>.001)throw Error('winger did not seek the touchline');
 if(Math.abs(wing.ty-(carrier.y+.08))>.03)throw Error('combined wing and support did not offer a short pass');
 if(Math.abs(support.tx-(carrier.x-.08))>.03)throw Error('support player did not offer a short pass');
 const offsideLine=v55OffsideLine(0,carrier);
 if(deep.ty<offsideLine+.024||deep.ty>offsideLine+.12)throw Error('deep runner did not approach the onside line: target='+deep.ty+', line='+offsideLine+', owner='+match.owner?.pid);
 if(Math.abs(deep.tx-.16)>.001)throw Error('combined wing and deep did not seek the touchline');
})()`,context);

vm.runInContext(`(()=>{
 const own=match.people.filter(player=>player.t===0&&!player.keeper),carrier=own[0],receiver=own[1];
 match.setPiece=null;match.flight=null;match.rebound=null;match.throwIn=null;match.kickoff=null;
 carrier.x=.16;carrier.y=.29;carrier.instructions=['wing','shoot'];receiver.x=.5;receiver.y=.2;
 for(const rival of match.people.filter(player=>player.t===1&&!player.keeper)){rival.x=.9;rival.y=.15}
 const blocker=match.people.find(player=>player.t===1&&!player.keeper);blocker.x=.16;blocker.y=.2;
 match.owner=carrier;match.ball={x:carrier.x,y:carrier.y};Math.random=()=>.7;
 const before=carrier.stats.crosses;action();
 if(carrier.stats.crosses!==before+1||!match.flight)throw Error('wing instruction did not favour a legal cross');
})()`,context);

vm.runInContext(`(()=>{
 const own=match.people.filter(player=>player.t===0&&!player.keeper),passer=own[0],receiver=own[1];
 match.setPiece=null;match.flight=null;match.rebound=null;passer.x=.5;passer.y=.6;receiver.x=.5;receiver.y=.4;
 receiver.instructions=['wing','deep'];receiver.assignedLine='att';
 for(const rival of match.people.filter(player=>player.t===1&&!player.keeper)){rival.x=.9;rival.y=.15}
 match.owner=passer;match.ball={x:.5,y:.6};Math.random=()=>.5;
 v55GroundPass(passer,receiver);
 if(Math.abs(match.flight.target.y-.325)>.001)throw Error('pass did not lead the onside runner into depth');
})()`,context);

vm.runInContext(`(()=>{
 const own=match.people.filter(player=>player.t===0&&!player.keeper),shooter=own[0];
 match.setPiece=null;match.flight=null;match.rebound=null;shooter.x=.5;shooter.y=.32;shooter.instructions=['wing','shoot'];
 for(const rival of match.people.filter(player=>player.t===1&&!player.keeper)){rival.x=.9;rival.y=.15}
 const blocker=match.people.find(player=>player.t===1&&!player.keeper);blocker.x=.5;blocker.y=.2;
 match.owner=shooter;match.ball={x:.5,y:.32};Math.random=()=>.99;
 const before=shooter.stats.shots;action();
 if(shooter.stats.shots!==before+1)throw Error('shoot instruction did not enable an earlier shot');
})()`,context);

vm.runInContext(`(()=>{
 const own=match.people.filter(player=>player.t===0&&!player.keeper),passer=own[0],central=own[1],wide=own[2];
 passer.x=.5;passer.y=.6;central.x=.5;central.y=.35;wide.x=.75;wide.y=.35;
 central.instructions=[];wide.instructions=[];central.pos=12;wide.pos=12;central.form=0;wide.form=0;central.fresh=100;wide.fresh=100;
 for(const rival of match.people.filter(player=>player.t===1&&!player.keeper)){rival.x=.9;rival.y=.1}
 match.ball={x:.5,y:.6};match.teamFocus=['Variabel','Variabel'];Math.random=()=>0;
 const baseline=v55ChooseTarget(passer,[central,wide],match.people.filter(player=>player.t===1));
 match.teamFocus[0]='Außen';const focused=v55ChooseTarget(passer,[central,wide],match.people.filter(player=>player.t===1));
 if(baseline!==central||focused!==wide)throw Error('attacking focus did not change the pass target: baseline='+baseline?.name+', focused='+focused?.name);
})()`,context);

assert.equal(vm.runInContext('match.people.filter(player=>player.t===0&&!player.keeper).length',context),5);
console.log('PASS: wide runs, support, onside depth, crosses, early shots and attacking focus');
