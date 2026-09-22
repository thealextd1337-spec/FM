const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {makeContext}=require('./test-v41.cjs');

function newMatch(){
 const context=makeContext();
 for(const file of ['youth-v33.js','penalties-v42.js','club-records-v43.js','club-identity-v44.js','keeper-logo-v45.js','match-report-v47.js','next-match-v49.js','set-pieces-v50.js','status-icons-v51.js','player-status-v51.js','strength-v55.js','opponent-profile-v54.js'])
  vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context,{filename:file});
 vm.runInContext('var v24Validation=()=>[];var v25RoleBar=()=>{};var v24Remember=()=>{};var v24FatigueText=()=>"frisch";var v24TopSkills=()=>"Passspiel gut";',context);
 for(const file of ['pitch-v55.js','pitch-v56.js','pitch-v57.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context,{filename:file});
 vm.runInContext("beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');document.querySelector('#canvas').parentElement={append(){}};start();match.kickoff=null;match.postBanner=null;match.goalPause=0;match.next=Infinity;match.elapsed=10",context);
 return context;
}

const foul=newMatch();
const positions=JSON.parse(vm.runInContext(`JSON.stringify((()=>{const victim=match.people.find(player=>player.t===0&&!player.keeper),offender=match.people.find(player=>player.t===1&&!player.keeper);victim.x=.5;victim.y=.5;for(const player of match.people.filter(player=>!player.keeper&&player!==victim&&player!==offender)){player.x=.8;player.y=.8}v50Foul(victim,offender);const ally=match.people.find(player=>player.t===0&&!player.keeper&&player!==match.setPiece.taker);const rival=match.people.find(player=>player.t===1&&!player.keeper&&player!==offender);const before={ally:{x:ally.x,y:ally.y},rival:{x:rival.x,y:rival.y},elapsed:match.elapsed};step(.1,.1);return{before,after:{ally:{x:ally.x,y:ally.y},rival:{x:rival.x,y:rival.y},elapsed:match.elapsed},spot:match.setPiece.spot}})())`,foul));
assert.notDeepEqual(positions.after.ally,positions.before.ally,'free-kick team forms passing options');
assert.notDeepEqual(positions.after.rival,positions.before.rival,'defending team forms its restart shape');
assert.equal(positions.after.elapsed,positions.before.elapsed,'the clock stays paused during positioning');
vm.runInContext('step(0,1.7)',foul);
assert.equal(vm.runInContext('match.setPiece.phase',foul),'fading');
vm.runInContext('step(0,.25)',foul);
assert.equal(vm.runInContext('match.setPiece.phase',foul),'postBanner');
vm.runInContext('step(0,.49)',foul);
assert.equal(vm.runInContext('match.setPiece.type',foul),'freeKick','half-second pause remains after fade');
vm.runInContext('step(0,.02)',foul);
assert.equal(vm.runInContext('match.setPiece',foul),null);

const offside=newMatch();
const offsidePositions=JSON.parse(vm.runInContext(`JSON.stringify((()=>{match.owner=match.people.find(player=>player.t===0&&!player.keeper);match.ball={x:.5,y:.5};const attacker=match.people.find(player=>player.t===0&&!player.keeper&&player!==match.owner);attacker.x=.5;attacker.y=.2;const defenders=match.people.filter(player=>player.t===1);defenders.forEach((player,index)=>{player.x=.7;player.y=.3+index*.02});const snapshot=v55OffsideSnapshot(match.owner);v55WhistleOffside(snapshot,attacker);const taker=match.setPiece.taker,original={x:taker.x,y:taker.y};step(.2,.2);const frozen={x:taker.x,y:taker.y};step(.35,.35);return{original,frozen,moving:{x:taker.x,y:taker.y},spot:match.setPiece.spot,ball:match.ball,visual:!!match.offsideVisual}})())`,offside));
assert.deepEqual(offsidePositions.frozen,offsidePositions.original,'offside line is readable before players move');
assert.notDeepEqual(offsidePositions.moving,offsidePositions.frozen,'teams reposition for offside free kick');
assert.equal(offsidePositions.ball.x,offsidePositions.spot.x);
assert.equal(offsidePositions.ball.y,offsidePositions.spot.y);
assert.equal(offsidePositions.visual,true,'offside line remains visible during positioning');

for(const {team,spot,direction} of [
 {team:0,spot:{x:.07,y:.1},direction:1},
 {team:1,spot:{x:.93,y:.9},direction:-1},
 {team:0,spot:{x:.07,y:.88},direction:1}
]){
 const wide=newMatch();
 const shape=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
  v50Restart('freeKick',${team},${JSON.stringify(spot)},'Wide free kick');
  for(let tick=0;tick<20;tick++)v57PositionFreeKick(.1);
  const groups=[0,1].map(side=>match.people.filter(player=>player.t===side&&!player.keeper&&player!==match.setPiece.taker));
  return groups.map(group=>group.reduce((sum,player)=>sum+player.x,0)/group.length);
 })())`,wide));
 for(const mean of shape)assert(direction===1?mean>.25:mean<.75,`wide free kick at ${JSON.stringify(spot)} must draw both teams toward goal, not the corner (${shape})`);
}

for(const {team,spot} of [
 {team:0,spot:{x:.14,y:.27}},
 {team:1,spot:{x:.86,y:.73}},
 {team:0,spot:{x:.12,y:.84}}
]){
 const restart=newMatch();
 const depths=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
  v50Restart('freeKick',${team},${JSON.stringify(spot)},'Position-aware free kick');
  for(let tick=0;tick<20;tick++)v57PositionFreeKick(.1);
  return [0,1].map(side=>{
   const groups={def:[],mid:[],att:[]};
   for(const player of match.people.filter(player=>player.t===side&&!player.keeper&&player!==match.setPiece.taker))
    groups[player.assignedLine||player.line].push(side===0?-player.y:player.y);
   return Object.fromEntries(Object.entries(groups).map(([line,values])=>[line,values.reduce((sum,value)=>sum+value,0)/values.length]));
  });
 })())`,restart));
 for(const [side,group] of depths.entries())for(const [front,back] of [['att','mid'],['mid','def']])
  if(Number.isFinite(group[front])&&Number.isFinite(group[back]))
   assert(group[front]>group[back],`team ${side} must keep ${front} ahead of ${back} at ${JSON.stringify(spot)}: ${JSON.stringify(group)}`);
}

const direct=newMatch();
const directResult=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
 Math.random=()=>0;
 v50Restart('freeKick',0,{x:.5,y:.25},'Direct free kick');
 for(const player of match.people.filter(player=>player.t===1&&!player.keeper)){player.x=.9;player.y=.85}
 const piece=match.setPiece;match.setPiece=null;
 v50TakeFreeKick(piece);
 const shot=piece.taker.stats.shots;
 step(1,.05);
 return{shot,score:match.score[0],penalty:match.goals.at(-1)?.penalty};
})())`,direct));
assert.equal(directResult.shot,1,'a central free kick near goal can be taken directly');
assert.equal(directResult.score,1,'a direct free kick can score');
assert.equal(directResult.penalty,false,'the direct free-kick goal is not a penalty');

const complete=newMatch();
vm.runInContext('for(let tick=0;running&&tick<6500;tick++)step(.05,.05);if(running)throw Error("match did not finish after restart positioning")',complete);
assert.equal(vm.runInContext('match.finished',complete),true);

console.log('PASS: free-kick and offside positioning, fade, and half-second pause');
