const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {makeContext}=require('./test-v41.cjs');

function newMatch(){
 const context=makeContext();
 for(const file of ['youth-v33.js','penalties-v42.js','club-records-v43.js','club-identity-v44.js','keeper-logo-v45.js','match-report-v47.js','next-match-v49.js','set-pieces-v50.js','status-icons-v51.js','player-status-v51.js','strength-v55.js','opponent-profile-v54.js'])
  vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context,{filename:file});
 vm.runInContext('var v24Validation=()=>[];var v25RoleBar=()=>{};var v24Remember=()=>{};var v24FatigueText=()=>"frisch";var v24TopSkills=()=>"Passspiel gut";',context);
 for(const file of ['pitch-v55.js','pitch-v56.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context,{filename:file});
 vm.runInContext("beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');document.querySelector('#canvas').parentElement={append(){}};start();match.kickoff=null;match.postBanner=null;match.goalPause=0;match.next=Infinity;match.elapsed=10",context);
 return context;
}

const behind=newMatch();
assert.equal(vm.runInContext(`(()=>{const victim=match.people.find(player=>player.t===0&&!player.keeper),tackler=match.people.find(player=>player.t===1&&!player.keeper);victim.x=.5;victim.y=.5;victim.motionX=0;victim.motionY=-1;tackler.x=.5;tackler.y=.56;match.owner=victim;match.ball={x:.516,y:.478};return v56StandingTackle(tackler,victim)})()`,behind),false,'a defender behind the carrier cannot win a standing tackle');

const rearAttempt=newMatch();
const rearResult=JSON.parse(vm.runInContext(`JSON.stringify((()=>{const victim=match.people.find(player=>player.t===0&&!player.keeper),tackler=match.people.find(player=>player.t===1&&!player.keeper);for(const player of match.people){player.x=.9;player.y=.9}victim.x=.5;victim.y=.5;victim.motionX=0;victim.motionY=-1;tackler.x=.5;tackler.y=.59;match.owner=victim;match.ball={x:.516,y:.478};Math.random=()=>0;const attempted=v56MaybeChallenge(victim);let ticks=0;while(match.slide&&ticks++<30)step(.05,.05);return{attempted,piece:match.setPiece?.type,ticks,fouls:tackler.stats.fouls,cards:('yellowCards'in tackler.stats)||('redCards'in tackler.stats),players:match.people.length}})())`,rearAttempt));
assert.equal(rearResult.attempted,true,'a reachable defender may attempt a slide from behind');
assert(rearResult.ticks>1,'a rear slide is animated before the decision');
assert.equal(rearResult.piece,'freeKick','body contact from behind is a foul');
assert.equal(rearResult.fouls,1,'one rear foul is recorded once for the tackler');
assert.equal(rearResult.cards,false,'the rear foul has no personal punishment');
assert.equal(rearResult.players,12,'both teams remain complete after the rear foul');

const rearPenalty=newMatch();
const rearPenaltyResult=JSON.parse(vm.runInContext(`JSON.stringify((()=>{const victim=match.people.find(player=>player.t===0&&!player.keeper),tackler=match.people.find(player=>player.t===1&&!player.keeper);for(const player of match.people){player.x=.9;player.y=.9}victim.x=.5;victim.y=.13;victim.motionX=0;victim.motionY=-1;tackler.x=.5;tackler.y=.22;match.owner=victim;match.ball={x:.516,y:.108};Math.random=()=>0;const attempted=v56MaybeChallenge(victim);let ticks=0;while(match.slide&&ticks++<30)step(.05,.05);return{attempted,piece:match.setPiece?.type,ticks,players:match.people.length}})())`,rearPenalty));
assert.equal(rearPenaltyResult.attempted,true);
assert(rearPenaltyResult.ticks>1);
assert.equal(rearPenaltyResult.piece,'penalty','rear body contact in the penalty area awards a penalty');
assert.equal(rearPenaltyResult.players,12);

const cleanRear=newMatch();
const cleanRearResult=JSON.parse(vm.runInContext(`JSON.stringify((()=>{const victim=match.people.find(player=>player.t===0&&!player.keeper),tackler=match.people.find(player=>player.t===1&&!player.keeper);for(const player of match.people){player.x=.9;player.y=.9}victim.x=.5;victim.y=.5;victim.motionX=0;victim.motionY=-1;tackler.x=.56;tackler.y=.513;match.owner=victim;match.ball={x:.516,y:.478};Math.random=()=>0;const behind=v56ApproachInfo(tackler,victim).behind,attempted=v56MaybeChallenge(victim);let ticks=0;while(match.slide&&ticks++<30)step(.05,.05);return{behind,attempted,won:tackler.stats.slideWon,fouls:tackler.stats.fouls,ticks}})())`,cleanRear));
assert.equal(cleanRearResult.behind,true);
assert.equal(cleanRearResult.attempted,true);
assert(cleanRearResult.ticks>1);
assert.equal(cleanRearResult.won,1,'a rear-diagonal slide reaching the ball before the body can be legal');
assert.equal(cleanRearResult.fouls,0);

const side=newMatch();
const resisted=JSON.parse(vm.runInContext(`JSON.stringify((()=>{const victim=match.people.find(player=>player.t===0&&!player.keeper),tackler=match.people.find(player=>player.t===1&&!player.keeper);victim.x=.5;victim.y=.5;victim.motionX=0;victim.motionY=-1;tackler.x=.54;tackler.y=.48;match.owner=victim;match.ball={x:.516,y:.478};Math.random=()=>.9;return{consumed:v56StandingTackle(tackler,victim),duels:tackler.stats.duels,recovery:tackler.recoverUntil-match.elapsed}})())`,side));
assert.equal(resisted.duels,1,'a defender beside the ball may challenge');
assert.equal(resisted.consumed,false,'a resisted standing tackle must not consume the carrier action');
assert(resisted.recovery>0,'a beaten tackler cannot retry in the next simulation step');

const resistedAction=newMatch();
const resistedActionResult=JSON.parse(vm.runInContext(`JSON.stringify((()=>{const carrier=match.people.find(player=>player.t===0&&!player.keeper),rival=match.people.find(player=>player.t===1&&!player.keeper);for(const player of match.people){player.x=.9;player.y=.9}carrier.x=.5;carrier.y=.5;carrier.motionX=0;carrier.motionY=-1;rival.x=.54;rival.y=.48;match.owner=carrier;match.ball={x:.516,y:.478};Math.random=()=>.9;action();return{flight:!!match.flight,duels:rival.stats.duels,recovery:rival.recoverUntil-match.elapsed}})())`,resistedAction));
assert.equal(resistedActionResult.duels,1,'the nearby rival tries to win the ball');
assert(resistedActionResult.recovery>0,'a failed attempt gives the tackler a short pause');
assert(resistedActionResult.flight,'the carrier can pass after resisting the challenge');

const recovery=newMatch();
const recoveryResult=JSON.parse(vm.runInContext(`JSON.stringify((()=>{const carrier=match.people.find(player=>player.t===0&&!player.keeper),rival=match.people.find(player=>player.t===1&&!player.keeper);for(const player of match.people){player.x=.9;player.y=.9}carrier.x=.5;carrier.y=.5;carrier.motionX=0;carrier.motionY=-1;rival.x=.54;rival.y=.48;match.owner=carrier;match.ball={x:.516,y:.478};let draws=[.9,0];Math.random=()=>draws.shift()??0;v56StandingTackle(rival,carrier);const cooldown=carrier.recoverUntil-match.elapsed;action();return{cooldown,owner:match.owner?.name,flight:!!match.flight}})())`,recovery));
assert(recoveryResult.cooldown>0,'the dispossessed player needs a brief recovery');
assert(recoveryResult.flight,'the winner gets an actual ball action before the same rival can challenge again');

const slide=newMatch();
const slideResult=JSON.parse(vm.runInContext(`JSON.stringify((()=>{const victim=match.people.find(player=>player.t===0&&!player.keeper),tackler=match.people.find(player=>player.t===1&&!player.keeper);for(const player of match.people){player.x=.9;player.y=.9}victim.x=.5;victim.y=.5;victim.motionX=0;victim.motionY=-1;tackler.x=.5;tackler.y=.59;match.owner=victim;match.ball={x:.516,y:.478};Math.random=()=>0;v56StartSlide(tackler,victim);let ticks=0;while(match.slide&&ticks++<30)step(.05,.05);return{ticks,card:('yellowCards'in tackler.stats)||('redCards'in tackler.stats),slide:!!match.slide,removed:!match.people.includes(tackler),team:match.people.filter(player=>player.t===1&&!player.keeper).length,piece:match.setPiece?.type}})())`,slide));
assert.equal(slideResult.slide,false,'slide resolves over multiple frames');
assert(slideResult.ticks>1,'slide is visible before contact');
assert.equal(slideResult.removed,false,'a foul does not remove the player');
assert.equal(slideResult.team,5,'both teams remain at full strength');
assert.equal(slideResult.piece,'freeKick');

const cleanSlide=newMatch();
const cleanResult=JSON.parse(vm.runInContext(`JSON.stringify((()=>{const victim=match.people.find(player=>player.t===0&&!player.keeper),tackler=match.people.find(player=>player.t===1&&!player.keeper);for(const player of match.people){player.x=.9;player.y=.9}victim.x=.5;victim.y=.5;victim.motionX=0;victim.motionY=-1;tackler.x=.63;tackler.y=.478;match.owner=victim;match.ball={x:.516,y:.478};Math.random=()=>0;v56StartSlide(tackler,victim);let ticks=0;while(match.slide&&ticks++<30)step(.05,.05);return{won:tackler.stats.slideWon,foul:tackler.stats.fouls,loose:!!match.rebound,recovery:victim.recoverUntil-match.elapsed,ticks}})())`,cleanSlide));
assert.equal(cleanResult.won,1,'a slide that reaches the ball before the player can win it');
assert.equal(cleanResult.foul,0);
assert(cleanResult.recovery>0,'a clean sliding win also gives the dispossessed player a brief recovery');
assert(cleanResult.ticks>1);

assert.equal(slideResult.card,false,'there are no cards');
const foulReport=newMatch();
vm.runInContext('const offender=match.people.find(player=>player.t===0&&!player.keeper);const victim=match.people.find(player=>player.t===1&&!player.keeper);v50Foul(victim,offender);match.setPiece=null;finishMatch()',foulReport);
assert.match(vm.runInContext('v47PlayerStatsHTML(v47Snapshot().players.find(player=>player.stats.fouls),"Team")',foulReport),/Fouls/);

const lateGoal=newMatch();
vm.runInContext('match.elapsed=74.999;match.fulltimePending=true;match.kickoff={phase:"waiting"};match.countdown=2;step(.05,.05)',lateGoal);
assert.equal(vm.runInContext('match.finished',lateGoal),true,'a last-minute goal cannot strand the match in a frozen kickoff');

const crowd=newMatch();
const gap=vm.runInContext(`(()=>{const own=match.people.filter(player=>player.t===0&&!player.keeper),away=match.people.filter(player=>player.t===1&&!player.keeper),passer=own[0],receiver=own[1],players=[receiver,own[2],away[0],away[1]];for(const player of match.people){player.x=.9;player.y=.9}passer.x=.5;passer.y=.65;receiver.x=.5;receiver.y=.45;own[2].x=.54;own[2].y=.45;away[0].x=.46;away[0].y=.45;away[1].x=.5;away[1].y=.49;match.owner=passer;match.ball={x:.5,y:.65};Math.random=()=>.5;v55HighPass(passer,receiver);let minimum=1000;for(let tick=0;match.flight&&tick<100;tick++){step(.02,.02);for(let a=0;a<players.length;a++)for(let b=a+1;b<players.length;b++)minimum=Math.min(minimum,v56Pixels(players[a],players[b]))}return minimum})()`,crowd);
assert(gap>16,`aerial contenders visually overlapped (${gap.toFixed(1)} px)`);

const full=newMatch();
vm.runInContext('for(let tick=0;running&&tick<6500;tick++)step(.05,.05);if(running)throw Error("match did not finish "+JSON.stringify({elapsed:match.elapsed,slide:!!match.slide,throw:!!match.throwIn,piece:match.setPiece?.type,kickoff:match.kickoff?.phase,flight:!!match.flight,rebound:!!match.rebound,owner:match.owner?.name,next:match.next}))',full);
assert.equal(vm.runInContext('match.finished',full),true);
const totals={slides:0,fouls:0};
for(let seed=1;seed<=20;seed++){
 const game=newMatch();
 const sample=JSON.parse(vm.runInContext(`JSON.stringify((()=>{let seed=${seed};Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};for(let tick=0;running&&tick<6500;tick++)step(.05,.05);if(running)throw Error('seeded match did not finish '+JSON.stringify({elapsed:match.elapsed,slide:!!match.slide,throw:!!match.throwIn,piece:match.setPiece?.type,kickoff:match.kickoff?.phase,flight:!!match.flight,rebound:!!match.rebound,owner:match.owner?.name,next:match.next}));const all=match.people;return{slides:all.reduce((sum,player)=>sum+(player.stats.slideAttempts||0),0),fouls:all.reduce((sum,player)=>sum+(player.stats.fouls||0),0),players:all.length}})())`,game));
 assert.equal(sample.players,12,'teams remain at full strength');
 for(const key of Object.keys(totals))totals[key]+=sample[key];
}
assert(totals.slides>0&&totals.fouls>0,'match simulation exercises tackles and fouls');
console.log('PASS: physical tackles, visible slide, fouls, full teams, spacing and complete match');
console.log(`20 matches: ${JSON.stringify(totals)}`);
