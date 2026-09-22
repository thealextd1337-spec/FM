const fs=require('fs'),vm=require('vm'),assert=require('assert');
const {makeContext}=require('./test-v41.cjs');
const context=makeContext();
for(const file of ['penalties-v42.js','club-records-v43.js','club-identity-v44.js','keeper-logo-v45.js','match-report-v47.js','set-pieces-v50.js'])
 vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);
vm.runInContext("beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');aggression=1;saveCurrent();const saved=structuredClone(activeSave);aggression=-1;openSlot(saved);start()",context);
assert.equal(vm.runInContext('aggression',context),1);
assert.equal(vm.runInContext('activeSave.aggression',context),1);
assert(vm.runInContext("ability(match.people.find(player=>player.t===0&&!player.keeper),'tak')>v50BaseAbility(match.people.find(player=>player.t===0&&!player.keeper),'tak')",context),'aggression strengthens own tackles');
assert.equal(vm.runInContext('match.aggression[1]===v50OpponentStyles[activeOpponent().id]',context),true);
const opponentFoulChances=vm.runInContext(`[-1,0,1].map(level=>{match.aggression[1]=level;return v50FoulChance(match.people.find(player=>player.t===1&&!player.keeper),match.people.find(player=>player.t===0&&!player.keeper))})`,context);
assert(opponentFoulChances[0]<opponentFoulChances[1]&&opponentFoulChances[1]<opponentFoulChances[2],'opponent style changes foul chance');
vm.runInContext('match.aggression[1]=1',context);
assert(vm.runInContext("ability(match.people.find(player=>player.t===1&&!player.keeper),'tak')>v50BaseAbility(match.people.find(player=>player.t===1&&!player.keeper),'tak')",context),'opponent aggression strengthens tackles');
assert.equal(vm.runInContext('match.setPieceStats.corners.length',context),2);
vm.runInContext('step(0,2)',context);
assert.equal(vm.runInContext('match.postBanner.kind',context),'kickoff','kickoff banner appears before play');
vm.runInContext('step(0,.65)',context);
assert(Math.abs(vm.runInContext('match.postBanner.wait',context)-1)<.001,'one second remains after kickoff banner');
vm.runInContext('step(0,1)',context);
assert(vm.runInContext('Boolean(match.flight)',context),'kickoff resumes after extra pause');

vm.runInContext(`{
 const victim=match.people.find(player=>player.t===0&&!player.keeper),offender=match.people.find(player=>player.t===1&&!player.keeper);
 victim.x=.5;victim.y=.5;v50Foul(victim,offender);
}`,context);
assert.equal(vm.runInContext('match.setPiece.type',context),'freeKick');
assert.equal(vm.runInContext('match.setPieceStats.fouls[1]',context),1);
assert.equal(vm.runInContext('match.people.find(player=>player.t===1&&!player.keeper).stats.fouls',context),1,'foul is credited to the offender');
assert.equal(vm.runInContext('match.setPieceStats.freeKicks[0]',context),1);
assert(vm.runInContext('v50Outfield(1).every(player=>distance(player,match.setPiece.spot)>=.129)',context),'defenders keep free-kick distance');
vm.runInContext('step(0,1)',context);
assert.equal(vm.runInContext('match.setPiece.type',context),'freeKick','free kick remains visible before execution');
vm.runInContext('step(0,.8)',context);
assert.equal(vm.runInContext('match.setPiece.phase',context),'fading','free kick banner fades before the extra pause');
vm.runInContext('step(0,.25)',context);
assert.equal(vm.runInContext('match.setPiece.phase',context),'postBanner','free kick pauses after its banner');
vm.runInContext('step(0,.49)',context);
assert.equal(vm.runInContext('match.setPiece.type',context),'freeKick','play stays stopped for half a second after the fade');
vm.runInContext('step(0,.02)',context);
assert.equal(vm.runInContext('match.setPiece',context),null);
assert(vm.runInContext('Boolean(match.flight)',context),'free kick resumes through a pass or shot');
vm.runInContext('step(2,.05)',context);

vm.runInContext("v50Corner(0,.2,'einem Block')",context);
assert.equal(vm.runInContext('match.setPiece.spot.x',context),.035);
assert.equal(vm.runInContext('match.setPieceStats.corners[0]',context),1);
vm.runInContext('step(0,1)',context);
assert.equal(vm.runInContext('match.setPiece.type',context),'corner','corner remains visible before execution');
vm.runInContext('step(0,1)',context);
assert.equal(vm.runInContext('match.setPiece.phase',context),'postBanner','corner pauses after its banner');
vm.runInContext('step(0,1)',context);
assert(vm.runInContext('Boolean(match.flight)',context),'corner cross is in flight');
vm.runInContext('step(2,.05)',context);
assert(vm.runInContext('Boolean(match.owner)',context),'corner has a recipient or clearance');

vm.runInContext(`{
 const shooter=match.people.find(player=>player.t===0&&!player.keeper),blocker=match.people.find(player=>player.t===1&&!player.keeper);
 shooter.x=.5;shooter.y=.36;blocker.x=.48;blocker.y=.22;match.owner=shooter;match.ball={x:shooter.x,y:shooter.y};
 for(const player of match.people.filter(player=>player.t===1&&!player.keeper&&player!==blocker)){player.x=.9;player.y=.8}
 Math.random=()=>0;shoot(shooter,match.people.filter(player=>player.t===1),[blocker],.64);
}`,context);
assert(vm.runInContext('Boolean(match.flight)',context));
vm.runInContext('step(2,.05)',context);
assert(vm.runInContext('Boolean(match.flight)',context),'blocked shot has a deflection flight');
vm.runInContext('step(2,.05)',context);
assert.equal(vm.runInContext('match.setPiece',context),null);
assert(vm.runInContext('Boolean(match.rebound)',context),'block short of goal line stays in play');
vm.runInContext(`{
 const shooter=match.people.find(player=>player.t===0&&!player.keeper),blocker=match.people.find(player=>player.t===1&&!player.keeper);
 shooter.x=.5;shooter.y=.25;blocker.x=.48;blocker.y=.12;match.rebound=null;match.owner=shooter;match.ball={x:shooter.x,y:shooter.y};
 let rolls=[.5,0,.99,.5];Math.random=()=>rolls.shift()??.5;
 shoot(shooter,match.people.filter(player=>player.t===1),[blocker],.75);
}`,context);
vm.runInContext('step(2,.05);step(2,.05)',context);
assert.equal(vm.runInContext('match.setPiece.type',context),'corner');
assert.equal(vm.runInContext('match.setPieceStats.corners[0]',context),2);
vm.runInContext('step(0,2);step(0,1);step(2,.05)',context);

vm.runInContext(`{
 const victim=match.people.find(player=>player.t===0&&!player.keeper),offender=match.people.find(player=>player.t===1&&!player.keeper);
 victim.x=.5;victim.y=.15;Math.random=()=>0;v50Foul(victim,offender);
}`,context);
assert.equal(vm.runInContext('match.setPiece.type',context),'penalty');
assert.equal(vm.runInContext('match.setPieceStats.penalties[0]',context),1);
vm.runInContext('step(0,2)',context);
assert.equal(vm.runInContext('match.setPiece.phase',context),'waiting','penalty scene waits before the kick');
vm.runInContext('step(0,.5)',context);
assert.equal(vm.runInContext('match.setPiece.phase',context),'result');
vm.runInContext('step(0,2)',context);
assert.equal(vm.runInContext('match.score[0]',context),1);
assert.equal(vm.runInContext('match.people.find(player=>player.t===0&&!player.keeper&&player.stats.penaltiesScored>0).stats.penaltiesScored',context),1,'converted penalty is credited to its shooter');
assert.equal(vm.runInContext('match.setPiece',context),null);
assert.equal(vm.runInContext('match.goals.at(-1).penalty',context),true,'penalty goal keeps its origin');
assert.match(vm.runInContext("document.querySelector('#event').textContent",context),/Elfmetertor/i,'live event names the penalty goal');
assert(vm.runInContext("v47ReportHTML(v47Snapshot('Gegner')).includes('Ecken')",context));
vm.runInContext('step(0,2)',context);
assert.equal(vm.runInContext('match.postBanner.kind',context),'goal','goal banner ends before extra pause');
vm.runInContext('step(0,1)',context);
assert.equal(vm.runInContext('match.kickoff.phase',context),'waiting','kickoff countdown follows goal pause');

vm.runInContext(`{
 match.goalPause=0;match.pendingKickoff=null;
 const victim=match.people.find(player=>player.t===0&&!player.keeper),offender=match.people.find(player=>player.t===1&&!player.keeper);
 victim.x=.5;victim.y=.5;v50Foul(victim,offender);beginHalftimeBreak();
}`,context);
assert.equal(vm.runInContext('match.setPiece.type',context),'freeKick');
assert.equal(vm.runInContext('match.halftimePending',context),true);
vm.runInContext('step(0,2);step(0,.25);step(0,.51);step(2,.05);step(.1,.05)',context);
assert(vm.runInContext('match.halftimeBreakDone',context), 'halftime follows completed restart');
vm.runInContext(`{
 match.halftimePause=0;match.halftimePending=false;match.fulltimePending=false;match.elapsed=74.9;
 const victim=match.people.find(player=>player.t===0&&!player.keeper),offender=match.people.find(player=>player.t===1&&!player.keeper);
 victim.x=.5;victim.y=.5;v50Foul(victim,offender);finishMatch();
}`,context);
assert.equal(vm.runInContext('match.finished',context),false);
vm.runInContext('step(0,2)',context);
vm.runInContext('step(0,.25);step(0,.51)',context);
for(let i=0;i<10&&!vm.runInContext('match.finished',context);i++)vm.runInContext('step(1,.05)',context);
assert(vm.runInContext('match.finished',context),'full-time whistle follows completed restart');

const parry=makeContext();
for(const file of ['penalties-v42.js','club-records-v43.js','club-identity-v44.js','keeper-logo-v45.js','match-report-v47.js','set-pieces-v50.js'])
 vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),parry);
vm.runInContext(`beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');start();
 const shooter=match.people.find(player=>player.t===0&&!player.keeper);
 shooter.x=.5;shooter.y=.25;match.owner=shooter;match.ball={x:.5,y:.25};
 for(const player of match.people.filter(player=>player.t===1&&!player.keeper)){player.x=.9;player.y=.75}
 let rolls=[.5,.1,.99,.5,.1,.99,.5];Math.random=()=>rolls.shift()??.5;
 shoot(shooter,match.people.filter(player=>player.t===1),[],.75);`,parry);
vm.runInContext('step(2,.05);step(2,.05)',parry);
assert.equal(vm.runInContext('v50Keeper(1).stats.saves',parry),1);
assert.equal(vm.runInContext('match.setPiece.type',parry),'corner');
assert.equal(vm.runInContext('match.setPieceStats.corners[0]',parry),1);
vm.runInContext(`match.setPiece=null;let awayRolls=[.99,.5];Math.random=()=>awayRolls.shift()??.5;
 v50Deflect({x:.5,y:.88},1,v50Outfield(0)[0],'Block');step(2,.05)`,parry);
assert.equal(vm.runInContext('match.setPiece.team',parry),1);
assert.equal(vm.runInContext('match.setPiece.spot.y',parry),.965);
assert.equal(vm.runInContext('match.setPiece.spot.x',parry),.965);
vm.runInContext("match.setPiece=null;v50LooseBall({x:.5,y:.105},'Abpraller')",parry);
let looseFrames=0;
while(!vm.runInContext('Boolean(match.owner)',parry)&&looseFrames++<100)vm.runInContext('step(.039,.05)',parry);
assert(looseFrames<100,'free rebound is recovered and play continues');

const wholeMatch=makeContext();
for(const file of ['penalties-v42.js','club-records-v43.js','club-identity-v44.js','keeper-logo-v45.js','match-report-v47.js','set-pieces-v50.js'])
 vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),wholeMatch);
vm.runInContext(`let seed=4373;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');start();`,wholeMatch);
let frames=0;
while(!vm.runInContext('match.finished',wholeMatch)&&frames++<4500)vm.runInContext('step(.039,.05)',wholeMatch);
assert(frames<4500,'whole match finishes');
assert.equal(vm.runInContext('match.halftimeBreakDone',wholeMatch),true);
assert(vm.runInContext('match.setPieceStats.corners.reduce((a,b)=>a+b,0)+match.setPieceStats.freeKicks.reduce((a,b)=>a+b,0)>0',wholeMatch),'set pieces occur in ordinary play');
assert(vm.runInContext("v47Dialog.innerHTML.includes('Freistöße')",wholeMatch),'final report contains set pieces');

const cup=makeContext();
for(const file of ['penalties-v42.js','club-records-v43.js','club-identity-v44.js','keeper-logo-v45.js','match-report-v47.js','set-pieces-v50.js'])
 vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),cup);
vm.runInContext("beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');v41CupEnsure()",cup);
let leagueBeforeCup=0;
while(!vm.runInContext('Boolean(v41CupGameForUser())',cup)&&leagueBeforeCup++<10)
 vm.runInContext('start();match.score=[2,0];finishMatch();renderCenter()',cup);
assert(leagueBeforeCup<10,'cup fixture reached');
vm.runInContext('start();match.score=[1,1];finishMatch()',cup);
assert.equal(vm.runInContext('activeSave.cup.pending.phase',cup),'choose');
assert.equal(vm.runInContext('activeSave.cup.pending.report.setPieceStats.corners[0]',cup),0);

console.log('PASS: fouls, free kicks, corners, blocked shots, automatic penalty, halftime and full-time');
