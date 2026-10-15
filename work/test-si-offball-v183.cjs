'use strict';
// SI-2 (player intelligence 183): off-ball offers, patterns, follow-up runs,
// rebound finish and pace. Actual dist controllers in the native VM harness
// (native183-scenes.cjs: constructor matches; native182-scenes.cjs: built
// scenes with a marker set by v183CreateSi). Checks the old path (no marker or
// package off: digest-identical to the 182 constructor), the new path, pattern
// and offside scenes, restore during a running intent and the B02 native body
// measurement in eight directions. Usage: node work/test-si-offball-v183.cjs
const assert=require('node:assert/strict'),{create}=require('./native183-scenes.cjs');
const h=create({view:false}),checks=[],measurements={};const check=(name,fn)=>{fn();checks.push(name);};
const ev=text=>h.evaluate(text),copy=value=>h.copy(value);
const PACKAGES=['clock','options','offball','finish','defence','setplay','field'],ALL_OFF=Object.fromEntries(PACKAGES.map(p=>[p,false]));
const close=(a,b,eps,msg)=>assert(Math.abs(a-b)<=eps,`${msg}: ${a} vs ${b}`);

// Built scenes: Native182.install with the 182 markers plus a frozen SI marker.
// Positions in metres: depth from the own goal line, lateral seen from the team.
h.run(`
function Si2Scene({size='standard',seed=1,params={},packages={offball:true},people,ball,owner=null,lastTouch=0,siParams={},clockRate}){
 Native182.seedRandom(90000+seed);
 const m=Native182.install({people,size,ball:ball||{x:.5,y:.5},lastTouch,markers:{keeperHoldRevision:182,setPieceRevision:182,looseBallRevision:182,pursuitRevision:182,motionRevision:182}});
 m.si=v183CreateSi({packages,params:{...siParams,offball:params},...(clockRate?{clockRate}:{})});m.penaltyRevision=182;
 if(owner){m.owner=owner;m.ball={x:owner.x,y:owner.y};m.lastTouch=owner.t;}
 m.next=Infinity;return m;
}
function Si2Person(pid,t,depth,lateral,line,skills={},keeper=false){const s=v160PitchScale({geometry:v160WorldGeometry({world:{matchConfig:{version:1,fieldSize:Si2Size,fieldPlayers:5}}})}),pos=Native182.at(t,depth,lateral,s);const p=Native182.person(pid,t,pos.x,pos.y,line,skills,keeper);p.bx=pos.x;p.by=pos.y;p.initialBy=pos.y;return p;}
var Si2Size='standard';
function Si2Intents(){return JSON.parse(JSON.stringify(match.attackFlow.intents));}
function Si2Find(pid){return match.people.find(p=>p.pid===pid);}
`,'si2-fixture');
const person=(pid,t,depth,lateral,line,skills,keeper)=>`Si2Person(${JSON.stringify(pid)},${t},${depth},${lateral},${JSON.stringify(line)},${JSON.stringify(skills||{})},${keeper?'true':'false'})`;

// ----- old path -----
check('marker without the package replays like the 182 constructor; package off equals si:false (digest without match.si)',()=>{
 for(const scene of copy(h.call('Native183.constructedScenes')).filter((s,i)=>i%4===0)){
  const off=h.call('Native183.constructedDigest',scene,{si:{packages:ALL_OFF},withoutSi:true,segments:[250,250]}),legacy=h.call('Native183.constructedDigest',scene,{si:false,segments:[250,250]});
  assert.equal(off,legacy,scene.id);
  const offball=h.call('Native183.constructedDigest',scene,{si:{packages:{...ALL_OFF}},withoutSi:true,segments:[250,250]});
  assert.equal(offball,legacy,scene.id+' explicit off');
 }
});
check('wrapped functions hand unmarked matches and the package off to the previous functions (pace legacy factor)',()=>{
 h.call('Native183.constructed',{si:{packages:{offball:false}}});h.call('Native183.run',80);
 assert.equal(ev("v183PaceFactor(match,match.people[1],'carrier',{factor:1.28*(.78+ability(match.people[1],'tec')*.009)})"),ev("1.28*(.78+ability(match.people[1],'tec')*.009)"));
 assert.equal(ev("v183PaceFactor(match,match.people[1],'purposeful',{factor:1.58})"),1.58);
 h.call('Native183.constructed',{si:false});h.call('Native183.run',80);
 assert.equal(ev("v183Active(match,'offball')"),false);assert.equal(ev("Object.hasOwn(match.attackFlow,'offball')"),false,'no SI-2 state without the package');
});
check('the package is on by default in new matches and registers its parameters',()=>{
 h.call('Native183.constructed',{});
 assert.equal(ev("v183Active(match,'offball')"),true);
 const params=copy(ev('match.si.params.offball'));
 for(const key of ['carrierPace','runPace','offerCycle','depthRunners','boxRange','counterSeconds','followers','reboundFinishRange','profiles'])assert(Object.hasOwn(params,key),key);
 assert.equal(params.carrierPace,1.5);assert.equal(params.carrierClosePace,1.28);assert.equal(params.depthRunners,2);
 assert.equal(ev("Object.isFrozen(match.si.params.offball.profiles.poacher)"),true);
});

// ----- new path: constructor matches -----
const runNew=(size,ticks)=>{
 h.call('Native183.constructed',{club:'GER-2',seed:'si2',size,roles:true,si:{packages:{offball:true,clock:true},clockRate:.42}});
 return copy(ev(`(()=>{const m=match,cats={},types={},errors=[],plainErrors=[],teamErrors=[],limitErrors=[],zone=[];let cycles=0,lastUntil=null,maxIntents=0,offsides=0,lastSetPiece=null,moved=[],phaseTeam=null,phaseMoved=null,phaseStart=0;
  for(let i=0;i<${ticks}&&!m.finished;i++){
   const stable=Boolean(m.owner&&!m.owner.keeper&&!m.rebound&&!m.flight&&!v121PositioningPaused(m));
   try{Native183.advance();}catch(e){errors.push(String(e.message));break;}
   const flow=m.attackFlow,possession=v123PossessionTeam(m);
   if(flow.offerUntil!==lastUntil&&m.owner&&!m.owner.keeper){lastUntil=flow.offerUntil;cycles++;const n=Object.keys(flow.intents).length;if(n>maxIntents)maxIntents=n;
    for(const [pid,it]of Object.entries(flow.intents)){cats[it.cat||it.type]=(cats[it.cat||it.type]||0)+1;types[it.type]=(types[it.type]||0)+1;if(flow.offerOwner===m.owner.pid&&it.team!==m.owner.t)teamErrors.push(pid);
     if(JSON.stringify(JSON.parse(JSON.stringify(it)))!==JSON.stringify(it))plainErrors.push(pid);
     const p=Si2Find(pid);if(p&&['depth','wide','support','hold','edge'].includes(it.cat))zone.push(v122Metres(v162Zone(m,p),it));}}
   if(stable&&m.owner&&!m.owner.keeper&&!m.rebound&&!m.flight&&!v121PositioningPaused(m))for(const p of m.people){if(p.t!==m.owner.t||p.keeper||p===m.owner||p.slideActive||v115RestartLocked(m,p)||p.interceptTarget)continue;const it=flow.intents[p.pid],limit=v121PositioningPlans.get(m)?.get(p)?.limit;
    if(it&&it.type==='depth'&&limit!=null&&(p.t===0?p.ty<limit-1e-9:p.ty>limit+1e-9))limitErrors.push({pid:p.pid,cat:it.cat,pattern:it.pattern||null,ty:+p.ty.toFixed(4),limit:+limit.toFixed(4),y:+p.y.toFixed(4),tick:i,rebound:Boolean(m.rebound),flight:Boolean(m.flight),space:Boolean(typeof v150SpacePasses!=='undefined'&&v150SpacePasses.get(m)),keeperReacting:Boolean(v113KeeperReacting(m,p))});}
   if(m.setPiece&&m.setPiece!==lastSetPiece){lastSetPiece=m.setPiece;if(m.setPiece.type==='offside')offsides++;}
   const o=m.owner;if(o&&!o.keeper){if(phaseTeam!==o.t){if(phaseMoved&&(i-phaseStart)*.05>=2)moved.push(Object.keys(phaseMoved).length);phaseTeam=o.t;phaseMoved={};phaseStart=i;}
    for(const p of m.people){if(p.t!==o.t||p.keeper||p===o)continue;const b=p.offenseMotion;if(b&&Math.hypot(b.vx,b.vy)>=2.5)phaseMoved[p.pid]=1;}}
  }
  const state=m.attackFlow.offball,plainState=JSON.stringify(JSON.parse(JSON.stringify(state)))===JSON.stringify(state);
  const sources={};for(const e of m.ballAccounting.events)for(const s of e.sources||[])sources[s]=(sources[s]||0)+1;
  return {errors,plainErrors:plainErrors.length,teamErrors:teamErrors.length,limitErrors:limitErrors.length,limitDetail:limitErrors.slice(0,4),cycles,cats,types,maxIntents,offsides,seconds:+v183Seconds(m).toFixed(1),movedMean:moved.length?+(moved.reduce((a,b)=>a+b,0)/moved.length).toFixed(2):null,movedN:moved.length,zoneMean:zone.length?+(zone.reduce((a,b)=>a+b,0)/zone.length).toFixed(2):null,zoneMax:zone.length?+Math.max(...zone).toFixed(2):null,plainState,sources,trace:v183TraceEntries(m).filter(e=>e.kind==='pattern').length};})()`));
};
for(const size of ['standard','large'])check(`new path ${size}: offers for several team-mates, plain intents of the possession team, offside limit kept, formation leash`,()=>{
 const r=runNew(size,3200);measurements['new-'+size]=r;
 assert.deepEqual(r.errors,[]);assert.equal(r.plainErrors,0);assert.equal(r.teamErrors,0);assert.equal(r.limitErrors,0,'depth targets respect the predicted offside limit while the ball is held: '+JSON.stringify(r.limitDetail));
 assert(r.cycles>20,'offer cycles');assert(r.maxIntents>=2,'at least two simultaneous offers');
 assert(Object.keys(r.cats).length>=4,'several offer categories: '+JSON.stringify(r.cats));
 assert(r.movedMean>=3,'moved team-mates per possession: '+r.movedMean);
 assert(r.zoneMax<=40,'no offer leaves the formation zone by more than 40 m: '+r.zoneMax);
 assert(r.plainState,'attackFlow.offball is plain JSON data');
 assert(r.trace>0,'pattern trace entries');
});
check('offer planning, follow-up planning and pace draw no random number',()=>{
 h.call('Native183.constructed',{club:'ENG-4',seed:'si2draw',size:'standard',roles:true,si:{packages:{offball:true}}});
 let found=false;for(let i=0;i<600&&!found;i++){h.call('Native183.advance');found=ev('Boolean(match.owner&&!match.owner.keeper&&!v121PositioningPaused(match))');}
 assert(found,'live possession');
 const r=copy(ev(`(()=>{const m=match,owner=m.owner,allies=m.people.filter(p=>p.t===owner.t&&!p.keeper&&p!==owner&&!p.slideActive),rivals=m.people.filter(p=>p.t!==owner.t&&!p.keeper),d0=Native182.rng().draws;
  m.attackFlow.offerUntil=0;v183OffballOffers(m,owner,allies,rivals);m.attackFlow.offerUntil=0;v183OffballOffers(m,owner,allies,rivals);
  for(const p of m.people)v157Pace(m,p);
  for(const p of allies)v183OffballFollow(m,p);
  return {draws:Native182.rng().draws-d0,intents:Object.keys(m.attackFlow.intents).length};})()`));
 assert.equal(r.draws,0);assert(r.intents>0);
});

// ----- built scenes -----
const standardPeople=`[${[
 person('k0',0,3,0,'gk',{n:1},true),person('d10',0,12,-6,'def',{spd:12}),person('d20',0,12,6,'def',{spd:12}),person('m10',0,24,-8,'mid',{spd:16,pas:14}),person('m20',0,24,8,'mid',{spd:15,pas:14}),person('a10',0,36,0,'att',{spd:18,fin:14}),
 person('k1',1,3,0,'gk',{n:1},true),person('d11',1,22,-7,'def',{spd:12}),person('d21',1,22,7,'def',{spd:12}),person('m11',1,40,-8,'mid',{spd:13}),person('m21',1,40,8,'mid',{spd:13}),person('a11',1,50,0,'att',{spd:14})].join(',')}]`;
check('counter: a live turnover in the own half opens a three-second window with two deep runners at run pace; the window ends with the ball',()=>{
 ev(`Si2Size='standard';(()=>{const people=${standardPeople};for(const p of people){p.role=p.line==='def'?0:1;p.tacticalRole=p.line==='att'?'striker':p.line==='mid'?'box-to-box':'cover-defender';}
  const m=Si2Scene({seed:1,people,owner:people.find(p=>p.pid==='a11')});for(let i=0;i<12;i++)Native182.advance();
  const d=Si2Find('d10');m.owner=d;m.ball={x:d.x,y:d.y};m.lastTouch=0;m.next=Infinity;Native182.advance();})()`);
 const r=copy(ev(`(()=>{const m=match,state=m.attackFlow.offball,now=v183Seconds(m),intents=Si2Intents(),runners=Object.entries(intents).filter(([,i])=>i.pattern==='counter');
  const s=v150Scale(m),owner=m.owner,ahead=runners.map(([pid,i])=>({pid,ahead:+((owner.y-i.y)*s.y).toFixed(1),type:i.type,limit:v121PositioningPlans.get(m)?.get(Si2Find(pid))?.limit,y:i.y,pace:v183PaceFactor(m,Si2Find(pid),'purposeful',{intent:i,now}),speed:ability(Si2Find(pid),'spd')}));
  return {counterTeam:state.counterTeam,open:state.counterUntil>now,runners:ahead,trace:v183TraceEntries(m).filter(e=>e.kind==='pattern'&&e.pattern==='counter').length,possessionTeam:state.team};})()`));
 assert.equal(r.counterTeam,0);assert(r.open);assert.equal(r.possessionTeam,0);
 assert.equal(r.runners.length,2,'two counter runners: '+JSON.stringify(r.runners));
 for(const run of r.runners){assert.equal(run.type,'depth');assert.equal(run.pace,1.58,'run pace');assert(run.ahead>=6||run.limit!=null&&Math.abs(run.y-run.limit)<1e-9,'runs deep or waits at the offside limit: '+JSON.stringify(run));}
 assert.equal(r.trace,1);
 measurements.counter=r;
 // Ball loss: the opponent owns the ball, our intents vanish, the window is not reported for them.
 ev(`(()=>{const m=match,q=Si2Find('m11');m.owner=q;m.ball={x:q.x,y:q.y};m.lastTouch=1;m.next=Infinity;Native182.advance();})()`);
 const after=copy(ev(`(()=>{const m=match,intents=Si2Intents();return {teams:[...new Set(Object.values(intents).map(i=>i.team))],state:m.attackFlow.offball.team,counterTeam:m.attackFlow.offball.counterTeam,counterNow:v183OffballPossession(m,m.owner,v183Seconds(m))};})()`));
 assert.deepEqual(after.teams.filter(t=>t===0),[]);assert.equal(after.state,1);assert.equal(after.counterNow,false,'no counter for the other team');
});
check('counter does not open after a restart gap (keeper hold, set piece): turnoverGap',()=>{
 ev(`(()=>{const people=${standardPeople};for(const p of people)p.role=1;const m=Si2Scene({seed:2,people,owner:people.find(p=>p.pid==='a11')});for(let i=0;i<10;i++)Native182.advance();
  const k=Si2Find('k0');m.owner=k;m.ball={x:k.x,y:k.y};m.lastTouch=0;m.next=Infinity;for(let i=0;i<60;i++)Native182.advance();
  const d=Si2Find('d10');m.owner=d;m.ball={x:d.x,y:d.y};m.next=Infinity;Native182.advance();})()`);
 const r=copy(ev('(()=>{const s=match.attackFlow.offball;return {counterTeam:s.counterTeam,team:s.team};})()'));
 assert.equal(r.team,0);assert.equal(r.counterTeam,null,'no counter after a three-second keeper spell');
});
const boxPeople=`[${[
 person('k0',0,3,0,'gk',{n:1},true),person('d10',0,20,-6,'def',{spd:12}),person('m20',0,44,-8,'mid',{spd:14,pos:13}),person('b20',0,40,2,'mid',{spd:15,pos:14}),person('p10',0,50,0,'att',{spd:16,pos:15}),person('w10',0,48,12,'att',{spd:17}),
 person('k1',1,2,0,'gk',{n:1},true),person('d11',1,13,-7,'def',{spd:12}),person('d21',1,13,7,'def',{spd:12}),person('m11',1,26,-8,'mid',{spd:13}),person('m21',1,26,8,'mid',{spd:13}),person('a11',1,45,0,'att',{spd:14})].join(',')}]`;
check('box occupation: a wide ball near the goal fills at least two box points (near post on the ball side, spot, far post)',()=>{
 ev(`(()=>{const people=${boxPeople};for(const p of people)p.role=p.line==='def'?0:1;const roles={b20:'box-to-box',m20:'striker',p10:'poacher',w10:'winger'};for(const p of people)if(roles[p.pid])p.tacticalRole=roles[p.pid];
  // SI-K: the scene keeps its design point (rate 0.78, SI-3 values before SI-K); there the striker's near-post box point beat his depth run by 0.03 and the calibrated values flip it.
  const m=Si2Scene({seed:3,people,owner:people.find(p=>p.pid==='w10'),clockRate:MATCH_SPEED,siParams:{finish:{spreadBase:.037,spreadSkill:.584,spreadFlat:2.22,reachBase:1.39,reachGk:.066}}});Native182.advance();})()`);
 const r=copy(ev(`(()=>{const m=match,s=v150Scale(m),intents=Si2Intents(),goal={x:.5,y:v55Field.top};
  const box=Object.entries(intents).filter(([,i])=>i.cat==='box').map(([pid,i])=>({pid,lateral:+((i.x-.5)*s.x).toFixed(1),depth:+((i.y-goal.y)*s.y).toFixed(1),type:i.type,limit:v121PositioningPlans.get(m)?.get(Si2Find(pid))?.limit!=null?+((v121PositioningPlans.get(m).get(Si2Find(pid)).limit-goal.y)*s.y).toFixed(1):null}));
  const p=Si2Find('m20'),owner=m.owner,rivals=m.people.filter(q=>q.t!==0&&!q.keeper),P=k=>v183Param(m,'offball.'+k),plans=v121PositioningPlans.get(m);
  const ctx={owner,rivals,s,dir:-1,goal,ballSide:1,ballRange:v115GoalDistance(owner),wide:true,counter:false,recovering:false,cover:false,occupied:[],zone:v162Zone(m,p),profile:v183OffballProfile(m,p),limit:plans?.get(p)?.limit,lastCats:{},P};
  const candidates=v183OffballCandidates(m,p,ctx).map(c=>v183OffballValue(m,p,c,ctx)).map(c=>({cat:c.cat,lateral:+((c.x-.5)*s.x).toFixed(1),depth:+((c.y-goal.y)*s.y).toFixed(1),value:+c.value.toFixed(2),clamped:+c.clamped.toFixed(1)})).sort((a,b)=>b.value-a.value);
  return {box,all:Object.fromEntries(Object.entries(intents).map(([pid,i])=>[pid,i.cat])),trace:v183TraceEntries(m).filter(e=>e.kind==='pattern'&&e.pattern==='box').length,wideBall:Math.abs(m.owner.x-.5)*s.x,candidatesM20:candidates};})()`));
 assert(r.box.length>=2,'box points: '+JSON.stringify(r));
 // Targets inside the box are held at the predicted offside limit while the ball is carried.
 for(const b of r.box){assert(b.depth>=5.5&&b.depth<=16,'box depth '+JSON.stringify(b));assert.equal(b.type,'depth');}
 assert(new Set(r.box.map(b=>b.lateral)).size===r.box.length,'distinct box points');
 assert(r.trace>=1);measurements.box=r;
});
check('overlap: a wide carrier gets an overlap candidate outside and ahead from a team-mate behind him',()=>{
 ev(`(()=>{const people=${boxPeople};for(const p of people)p.role=p.line==='def'?0:1;const roles={b20:'box-to-box',p10:'poacher',w10:'winger'};for(const p of people)if(roles[p.pid])p.tacticalRole=roles[p.pid];
  const m=Si2Scene({seed:4,people,owner:people.find(p=>p.pid==='w10')});const b=Si2Find('b20');b.x=m.owner.x-2/v150Scale(m).x;b.y=m.owner.y+8/v150Scale(m).y;Native182.advance();})()`);
 const r=copy(ev(`(()=>{const m=match,s=v150Scale(m),owner=m.owner,p=Si2Find('b20'),rivals=m.people.filter(q=>q.t!==0&&!q.keeper),P=k=>v183Param(m,'offball.'+k);
  const ctx={owner,rivals,s,dir:-1,goal:{x:.5,y:v55Field.top},ballSide:1,ballRange:v115GoalDistance(owner),wide:true,counter:false,recovering:false,cover:false,P};
  const c=v183OffballCandidates(m,p,ctx).find(c=>c.cat==='overlap');const intent=m.attackFlow.intents[p.pid];
  return {candidate:c?{outside:+((c.x-owner.x)*s.x).toFixed(1),ahead:+((owner.y-c.y)*s.y).toFixed(1),pattern:c.pattern}:null,intent:intent?{cat:intent.cat,pattern:intent.pattern||null}:null};})()`));
 assert(r.candidate,'overlap candidate');assert(r.candidate.outside>2.5&&r.candidate.ahead>6,JSON.stringify(r.candidate));assert.equal(r.candidate.pattern,'overlap');
 measurements.overlap=r;
});
check('follow-up: during an own shot, the team-mate with the highest follow weight near the goal runs into the rebound zone after an anticipation-based reaction',()=>{
 ev(`(()=>{const people=${boxPeople};for(const p of people)p.role=p.line==='def'?0:1;const roles={b20:'playmaker',m20:'ball-winner',p10:'poacher',w10:'striker'};for(const p of people)if(roles[p.pid])p.tacticalRole=roles[p.pid];
  const shooter=people.find(p=>p.pid==='w10'),s0=v160PitchScale({geometry:v160WorldGeometry({world:{matchConfig:{version:1,fieldSize:'standard',fieldPlayers:5}}})});
  const at=Native182.at(0,52,0,s0);shooter.x=at.x;shooter.y=at.y;shooter.fin=16;const p=people.find(q=>q.pid==='p10');const pa=Native182.at(0,48,7,s0);p.x=pa.x;p.y=pa.y;p.ant=16;
  const m=Si2Scene({seed:5,people,owner:shooter});v157Body(shooter).heading=Math.PI;Native182.advance();v55Shoot(shooter);})()`);
 assert.equal(ev('Boolean(match.flight)'),true,'shot in flight');
 const r=copy(ev(`(()=>{const m=match,out={ticks:0,assigned:null,state:null,shooterIntent:false};for(let i=0;i<14&&m.flight;i++){Native182.advance();out.ticks++;const it=m.attackFlow.intents['p10'];if(it&&it.pattern==='follow'&&out.assigned===null){const s=v150Scale(m);out.assigned={tick:out.ticks,depth:+((it.y-v55Field.top)*s.y).toFixed(1),lateral:+((it.x-.5)*s.x).toFixed(1),type:it.type,pace:v183PaceFactor(m,Si2Find('p10'),'purposeful',{intent:it,now:v183Seconds(m)})};}
  if(m.attackFlow.intents['w10']?.pattern==='follow')out.shooterIntent=true;}
  out.state=JSON.parse(JSON.stringify(m.attackFlow.offball.follow));return out;})()`));
 assert(r.assigned,'follower assigned: '+JSON.stringify(r));assert(r.assigned.depth>=5&&r.assigned.depth<=9,'rebound zone depth '+r.assigned.depth);
 assert.equal(r.assigned.type,'depth');assert.equal(r.assigned.pace,1.58);assert(r.assigned.tick>=4&&r.assigned.tick<=9,'reaction about 0.26 s for ant 16: tick '+r.assigned.tick);
 assert.deepEqual(r.state.pids,['p10']);assert.equal(r.shooterIntent,false);
 measurements.follow=r;
});
check('one-two: after the pass the passer\'s follow run is pointed past the rival who pressed him; the first pass is tagged on confirmation',()=>{
 const r=copy(ev(`(()=>{const people=${standardPeople};for(const p of people)p.role=1;
  const passer=people.find(p=>p.pid==='m10'),receiver=people.find(p=>p.pid==='a10'),presser=people.find(p=>p.pid==='m11');
  const s0=v160PitchScale({geometry:v160WorldGeometry({world:{matchConfig:{version:1,fieldSize:'standard',fieldPlayers:5}}})});
  let at=Native182.at(0,38,-4,s0);passer.x=at.x;passer.y=at.y;passer.pas=16;passer.tec=16;at=Native182.at(0,46,3,s0);receiver.x=at.x;receiver.y=at.y;receiver.tec=16;at=Native182.at(1,68-41.5,4,s0);presser.x=at.x;presser.y=at.y;
  const m=Si2Scene({seed:6,people,owner:passer});const s=v150Scale(m);v157Body(passer).heading=Math.atan2((receiver.x-passer.x)*s.x,(receiver.y-passer.y)*s.y);Native182.advance();
  v55GroundPass(passer,receiver);const out={flight:Boolean(m.flight),received:false,intent:null,combo:null,ticks:0,presserY:presser.y,passerY:passer.y};
  for(let i=0;i<60;i++){Native182.advance();out.ticks++;if(m.owner===receiver){out.received=true;Native182.advance();Native182.advance();break;}if(m.owner&&m.owner!==receiver)break;}
  const it=m.attackFlow.intents[passer.pid];out.intent=it?{type:it.type,pattern:it.pattern||null,aheadOfPresser:+((presser.y-it.y)*s.y).toFixed(1),aheadOfPasser:+((passer.y-it.y)*s.y).toFixed(1)}:null;
  const c=m.attackFlow.combination;out.combo=c?{passer:c.passerId,receiver:c.receiverId,confirmed:!!c.confirmed,releaseAt:c.releaseAt,now:v183Seconds(m)}:null;out.owner=m.owner?.pid||null;out.offerOwner=m.attackFlow.offerOwner;out.trace=v183TraceEntries(m).filter(e=>e.kind==='pattern').map(e=>e.pattern);
  out.sources=m.ballAccounting.events.filter(e=>(e.sources||[]).includes('one-two')).length;return out;})()`));
 assert(r.flight,'pass released');assert(r.received,'receiver controls the ball: '+JSON.stringify(r));
 assert(r.intent,'passer keeps a follow intent');assert.equal(r.intent.type,'follow');assert.equal(r.intent.pattern,'one-two','one-two pattern: '+JSON.stringify(r));
 // The run goes past the presser as far as the predicted offside limit (ball line) allows.
 assert(r.intent.aheadOfPresser>=3,'run past the presser: '+JSON.stringify(r.intent));
 measurements.oneTwo=r;
});
check('rebound finish: a loose ball from a shot within 18 m starts the one-touch try when a window exists; other loose balls and the package off keep the open-goal rule',()=>{
 const r=copy(ev(`(()=>{const out={};const s0=v160PitchScale({geometry:v160WorldGeometry({world:{matchConfig:{version:1,fieldSize:'standard',fieldPlayers:5}}})});
  const build=(kind,packages)=>{const people=${boxPeople};for(const p of people)p.role=1;const winner=people.find(p=>p.pid==='p10'),keeper=people.find(p=>p.pid==='k1');const at=Native182.at(0,51,2,s0);winner.x=at.x;winner.y=at.y;winner.fin=14;
   for(const pid of ['d11','d21']){const d=people.find(p=>p.pid===pid);const a=Native182.at(1,4,pid==='d11'?-9:9,s0);d.x=a.x;d.y=a.y;}
   const m=Si2Scene({seed:7,people,packages});m.ballAccounting={version:117,sequence:0,events:[]};
   const shooter=people.find(p=>p.pid==='w10'),e=v117Event(m,kind,shooter);if(kind==='shot')e.shot=true;m.ballEventId=e.id;m.lastTouch=1;
   const point={x:winner.x,y:winner.y};v50LooseBall(point,'fixture');const d0=Native182.rng().draws;const value=v183ReboundFinish(m,winner,point);
   return {value:value?{rebound:!!value.rebound,range:+value.range?.toFixed(1)}:null,draws:Native182.rng().draws-d0,tagged:m.ballAccounting.events.some(x=>(x.sources||[]).includes('rebound')),open:Boolean(v131OpenGoal(winner,point)),events:m.ballAccounting.events.map(x=>x.kind)};};
  out.shot=build('shot',{offball:true});out.pass=build('pass',{offball:true});out.off=build('shot',{offball:false});return out;})()`));
 assert.equal(r.shot.open,false,'keeper covers the open goal in the fixture');
 assert(r.shot.value&&r.shot.value.rebound,'rebound finish after a shot: '+JSON.stringify(r.shot));assert(r.shot.value.range<=18);assert.equal(r.shot.draws,0);assert.equal(r.shot.tagged,true);
 assert.equal(r.pass.value,null,'no rebound finish after an ordinary loose pass');assert.equal(r.pass.tagged,false);
 assert.equal(r.off.value,null,'package off: open-goal rule only');assert.equal(r.off.tagged,false);
 measurements.rebound=r;
});
check('pace: carrier parameter (0.78+tec*0.009), duel pace within the close radius, run pace for own runs, support and legacy unchanged',()=>{
 const r=copy(ev(`(()=>{const people=${boxPeople};for(const p of people)p.role=1;const m=Si2Scene({seed:8,people,owner:people.find(p=>p.pid==='b20')});Native182.advance();
  const o=m.owner,base=3+ability(o,'spd')*.14,expect=f=>v158Movement(o,base*f,1).maxSpeed,rival=Si2Find('m11'),s=v150Scale(m);
  const far=v157Pace(m,o);rival.x=o.x;rival.y=o.y-2/s.y;const near=v157Pace(m,o);rival.y=o.y-6/s.y;
  const runner=Si2Find('p10'),rb=3+ability(runner,'spd')*.14,now=v183Seconds(m);
  m.attackFlow.intents[runner.pid]={x:runner.x,y:runner.y,type:'depth',team:0,at:now,until:now+5};const run=v157Pace(m,runner);
  m.attackFlow.intents[runner.pid]={x:runner.x,y:runner.y,type:'support',team:0,at:now,until:now+5};const support=v157Pace(m,runner);
  delete m.attackFlow.intents[runner.pid];const plain=v157Pace(m,runner);
  const si=m.si;delete m.si;const legacy=v157Pace(m,o);m.si=si;
  return {far,near,expectFar:expect(v183Param(m,'offball.carrierPace')*(.78+ability(o,'tec')*.009)),expectNear:expect(v183Param(m,'offball.carrierClosePace')*(.78+ability(o,'tec')*.009)),carrierPace:v183Param(m,'offball.carrierPace'),closePace:v183Param(m,'offball.carrierClosePace'),run,expectRun:v158Movement(runner,rb*1.58,1).maxSpeed,support,expectSupport:v158Movement(runner,rb*1.35,1).maxSpeed,plain,expectPlain:v158Movement(runner,rb*1.15,1).maxSpeed,legacy,expectLegacy:expect(1.28*(.78+ability(o,'tec')*.009))};})()`));
 assert(r.closePace<r.carrierPace,'duel pace below the open pace');close(r.far,r.expectFar,1e-9,'carrier far');close(r.near,r.expectNear,1e-9,'carrier close');assert(r.near<r.far,'close rule lowers the pace');close(r.run,r.expectRun,1e-9,'run');close(r.support,r.expectSupport,1e-9,'support');close(r.plain,r.expectPlain,1e-9,'base');close(r.legacy,r.expectLegacy,1e-9,'legacy');
 measurements.pace={carrier:+r.far.toFixed(2),carrierClose:+r.near.toFixed(2),runner:+r.run.toFixed(2),support:+r.support.toFixed(2),base:+r.plain.toFixed(2),legacyCarrier:+r.legacy.toFixed(2)};
});

check('carrier target (SI-K): a running carry puts the target beyond the braking distance of the wanted pace; carrierBrakeLead 0 keeps the legacy 2 m; the package off keeps 2 m',()=>{
 const lead=(params,packages)=>copy(ev(`(()=>{const people=${boxPeople};const m=Si2Scene({seed:8,people,owner:people.find(p=>p.pid==='b20'),params:${JSON.stringify(params)},packages:${JSON.stringify(packages)}});
  const o=m.owner,s=v150Scale(m),goal=o.t===0?v55Field.top:v55Field.bottom;delete m.attackFlow.receipt;delete m.attackFlow.pendingTurn;
  m.attackFlow.carry={playerId:o.pid,target:{x:o.x,y:o.y+(goal-o.y)*.3},until:v152Seconds(m)+1};
  const before=JSON.stringify(m.attackFlow.carry),ok=v159CarrierTarget(m,o),d=Math.hypot((o.tx-o.x)*s.x,(o.ty-o.y)*s.y);
  const mass=(o.offenseMotion||v157InitialBody(o)).massKg/74,brake=10.5*1.25/mass,pace=v157Pace(m,o);
  return {ok,d,need:pace*pace/(2*brake)+.05,pace,brake,unchanged:JSON.stringify(m.attackFlow.carry)===before};})()`));
 const on=lead({},{offball:true}),legacy=lead({carrierBrakeLead:0},{offball:true}),off=lead({},{offball:false});
 assert(on.ok&&on.unchanged,'carry kept, nothing written besides the target');
 close(on.d,Math.max(2,on.need+.25),1e-6,'target beyond the braking distance plus 0.25 m');assert(on.d>2&&Math.sqrt(2*on.brake*(on.d-.05))>=on.pace,'braking cap no longer limits the wanted pace');
 close(legacy.d,2,1e-6,'carrierBrakeLead 0: legacy 2 m');close(off.d,2,1e-6,'package off: legacy 2 m');
 measurements.carrierLead={metres:+on.d.toFixed(2),pace:+on.pace.toFixed(2)};
});

// ----- restore during a running intent -----
check('restore during running intents keeps intents, SI-2 state and recovery windows; the match continues with them',()=>{
 h.call('Native183.constructed',{club:'ESP-1',seed:'si2restore',size:'large',roles:true,si:{packages:{offball:true,clock:true},clockRate:.42}});h.call('Native183.run',400);
 let saved=false,before=null;
 for(let i=0;i<4000&&!saved;i++){
  h.call('Native183.advance');
  const ready=ev("Boolean(match.owner&&!match.owner.keeper&&!match.flight&&!match.slide&&Object.values(match.attackFlow.intents).some(i=>i.type==='depth'&&i.until>v183Seconds(match)+.4))");
  if(!ready)continue;
  before=copy(ev('({intents:match.attackFlow.intents,offball:match.attackFlow.offball,recovery:match.attackFlow.paceRecovery||null,offerOwner:match.attackFlow.offerOwner,offerUntil:match.attackFlow.offerUntil,targets:Object.fromEntries(match.people.map(p=>[p.pid,[p.tx,p.ty]]))})'));
  saved=h.call('Native183.checkpoint');
 }
 assert(saved,'checkpoint during running intents');
 const after=copy(ev('({intents:match.attackFlow.intents,offball:match.attackFlow.offball,recovery:match.attackFlow.paceRecovery||null,offerOwner:match.attackFlow.offerOwner,offerUntil:match.attackFlow.offerUntil})'));
 assert.deepEqual(after.intents,before.intents);assert.deepEqual(after.offball,before.offball);assert.deepEqual(after.recovery,before.recovery);
 assert.equal(after.offerOwner,before.offerOwner);assert.equal(after.offerUntil,before.offerUntil);
 assert.equal(ev("v183Active(match,'offball')"),true);
 const savedMatch=copy(h.call('Native183.savedMatch'));assert.deepEqual(savedMatch.attackFlow.intents,before.intents,'snapshot carries the intents');assert.deepEqual(savedMatch.attackFlow.offball,before.offball);
 // One step after the restore the same intents still steer their runners.
 h.call('Native183.advance');
 const steer=copy(ev(`(()=>{const m=match,now=v183Seconds(m),out=[];for(const [pid,i]of Object.entries(m.attackFlow.intents)){if(i.type!=='depth'||i.until<now)continue;const p=m.people.find(q=>q.pid===pid);if(!p||p.slideActive||p===m.owner)continue;out.push({pid,toward:v122Metres({x:p.tx,y:p.ty},i)<=v122Metres({x:p.x,y:p.y},i)+.01});}return out;})()`));
 assert(steer.length>0&&steer.every(s=>s.toward),'targets move toward the saved intents: '+JSON.stringify(steer));
 h.call('Native183.run',300);assert.equal(ev('match.people.every(p=>[p.x,p.y,p.tx,p.ty].every(Number.isFinite))'),true);
 measurements.restore={intents:Object.keys(before.intents).length,pids:Object.keys(before.intents)};
});

// ----- B02 native body measurement (eight directions) -----
check('B02: speed, acceleration, braking and direction changes of the native body in eight directions at the new pace',()=>{
 h.call('Native183.constructed',{club:'GER-2',seed:'si2b02',size:'standard',roles:true,si:{packages:{offball:true,clock:true},clockRate:.42}});
 let live=false;for(let i=0;i<800&&!live;i++){h.call('Native183.advance');live=ev('Boolean(match.owner&&!match.owner.keeper&&!v121PositioningPaused(match)&&!match.flight)');}
 assert(live);
 const r=copy(ev(`(()=>{const m=match,s=v150Scale(m),dt=.05,p=m.people.filter(q=>!q.keeper&&q.t===0).sort((a,b)=>b.spd-a.spd)[0],mate=m.people.find(q=>!q.keeper&&q.t===0&&q!==p);
  const saved={owner:m.owner,ball:{...m.ball},flight:m.flight,intents:JSON.parse(JSON.stringify(m.attackFlow.intents)),pos:m.people.map(q=>[q.x,q.y,q.tx,q.ty])};
  const place=(heading=0)=>{p.x=.5;p.y=.5;const b=v157Body(p);b.vx=b.vy=0;b.heading=heading;for(const q of m.people)if(q!==p){q.x=q.t===0?.2:.8;q.y=q.t===0?.85:.15;}};
  const mode=kind=>{m.flight=null;m.attackFlow.intents={};if(kind==='carrier'){m.owner=p;m.ball={x:p.x,y:p.y};}else{m.owner=mate;m.ball={x:mate.x,y:mate.y};m.attackFlow.intents[p.pid]={x:p.x,y:p.y,type:kind==='runner'?'depth':'support',team:0,at:0,until:1e9};}};
  const speed=()=>{const b=v157Body(p);return Math.hypot(b.vx,b.vy);};
  const target=(angle,metres)=>{p.tx=p.x+Math.sin(angle)*metres/s.x;p.ty=p.y+Math.cos(angle)*metres/s.y;};
  const out={};
  for(const kind of ['carrier','runner','support']){
   place();mode(kind);const vmax=v157Pace(m,p),rows=[];
   for(let k=0;k<8;k++){const angle=k*Math.PI/4;place(angle);mode(kind);let t90=null,v05=null,dist=0;
    // 1.5 s of acceleration (about 10 m) keeps every direction clear of the touchlines.
    for(let i=1;i<=30;i++){const before={x:p.x,y:p.y};target(angle,40);v157Move(m,p,dt);dist+=v122Metres(before,p);const v=speed();if(i===10)v05=v;if(t90===null&&v>=.9*vmax)t90=i*dt;}
    // Braking: target at the current spot; stopped when the velocity along the run direction is gone (the body then turns back).
    const top=speed(),ux=Math.sin(angle),uy=Math.cos(angle);p.tx=p.x;p.ty=p.y;let brake=null,brakeDist=0;for(let i=1;i<=60;i++){const before={x:p.x,y:p.y};v157Move(m,p,dt);brakeDist+=v122Metres(before,p);const b=v157Body(p);if(b.vx*ux+b.vy*uy<=.2){brake=i*dt;break;}}
    rows.push({deg:k*45,t90,accel05:+(v05/.5).toFixed(2),top:+top.toFixed(2),brake,brakeDist:+brakeDist.toFixed(2)});}
   const turns=[];for(const delta of [45,90,135,180]){place();mode(kind);for(let i=0;i<40;i++){target(0,40);v157Move(m,p,dt);}
    const angle=delta*Math.PI/180;let done=null,minSpeed=speed();for(let i=1;i<=80;i++){target(angle,40);v157Move(m,p,dt);const b=v157Body(p),v=speed();if(v<minSpeed)minSpeed=v;const cos=v>1e-6?(b.vx*Math.sin(angle)+b.vy*Math.cos(angle))/v:0;if(cos>.95&&v>=.8*vmax){done=i*dt;break;}}
    turns.push({deltaDeg:delta,seconds:done,minSpeed:+minSpeed.toFixed(2)});}
   out[kind]={pace:+vmax.toFixed(2),stepPerTick:+(vmax*dt).toFixed(3),directions:rows,turns};}
  m.owner=saved.owner;m.ball=saved.ball;m.flight=saved.flight;m.attackFlow.intents=saved.intents;m.people.forEach((q,i)=>{[q.x,q.y,q.tx,q.ty]=saved.pos[i];});
  return {spd:p.spd,tec:p.tec,massKg:+v157Body(p).massKg.toFixed(1),...out};})()`));
 for(const kind of ['carrier','runner','support']){
  const k=r[kind];assert(k.pace>0);
  for(const row of k.directions){assert(row.t90!==null&&row.t90<=2,`${kind} reaches 90 % pace within 2 s at ${row.deg}°: ${JSON.stringify(row)} pace ${k.pace}`);assert(row.brake!==null&&row.brake<=1.2,`${kind} stops within 1.2 s: ${JSON.stringify(row)} pace ${k.pace}`);assert(Math.abs(row.top-k.pace)<.15,`${kind} top speed ${row.top} vs pace ${k.pace}`);}
  const t90=k.directions.map(x=>x.t90);assert(Math.max(...t90)-Math.min(...t90)<=.1,'isotropic acceleration in eight directions');
  for(const turn of k.turns)assert(turn.seconds!==null&&turn.seconds<=2.5,`${kind} turn ${turn.deltaDeg}° within 2.5 s`);
 }
 assert(r.runner.pace>r.carrier.pace&&r.carrier.pace>0,'own runs faster than the carrier');
 measurements.b02=r;
});

console.log(JSON.stringify({pass:true,suite:'si-offball-v183',checks:checks.length,cases:checks,measurements,scope:'Actual native dist controllers in the VM harness: constructor matches with marker 183 (package on/off), built scenes with v183CreateSi, restore round trip, eight-direction body measurement. No full-match balance claim; see measure-si-offball-v183.cjs.'}));
