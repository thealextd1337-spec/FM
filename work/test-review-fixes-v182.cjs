'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),{create}=require('./native182-scenes.cjs');
const h=create({view:false}),checks=[],failures=[],measurements={};
function check(name,fn){try{fn();checks.push(name);}catch(e){failures.push({name,error:e.message.slice(0,240)});}}
for(const tick of [20,21,22])check('Air JSON checkpoint before landing '+tick,()=>{
 const scene={type:'loose',config:{kind:'air',team:1,size:'large',seed:2,marker:true}};
 const airborne=h.evaluate(`(()=>{Native182.looseScene(${JSON.stringify(scene.config)});for(let i=0;i<${tick};i++)Native182.advance();return !v124AirBalls.get(match)?.settled&&v124AirBalls.get(match)?.height>.29;})()`);assert(airborne);
 assert.equal(h.call('Native182.continuation',scene,tick),h.call('Native182.continuation',scene,-1));
});
check('Air runners are persisted, disjoint from supporters and sprint at native chase pace',()=>{
 const r=h.copy(h.evaluate(`(()=>{Native182.looseScene({kind:'air',team:1,size:'large',seed:2,marker:true});Native182.advance();match.attackFlow.defenseReads={};match.attackFlow.intents={};const chase=match.rebound.chase,runners=v132AirChasers.get(match).runners;return {chase,players:runners.map(p=>({id:p.pid,pace:v157Pace(match,p),expected:v182ChasePace(p)}))};})()`));measurements.airPace=r.players;
 assert.equal(r.chase.airPids.filter(Boolean).length,2);assert(r.chase.support.every(id=>!id||!r.chase.airPids.includes(id)));for(const p of r.players)assert.equal(p.pace,p.expected);
});
check('One actual duel attempt for two defenders across action and contact paths in one native tick',()=>{
 const r=h.copy(h.evaluate(`(()=>{Native182.pursuitScene({offset:'front6',marker:true});const c=match.owner,d=match.people.find(p=>p.pid==='defender'),q=match.people.find(p=>p.pid==='cover'),s=v150Scale();for(const p of [d,q]){p.x=c.x+(p===d?.1:-.1)/s.x;p.y=c.y+.6/s.y;p.recoverUntil=0;}match.ball={x:c.x,y:c.y+.6/s.y};match.next=match.elapsed;const random=Math.random;Math.random=()=>.99;const before=d.stats.tackleAttempts+q.stats.tackleAttempts;action();v182ContactCheck(match);Native182.checkpoint();v182ContactCheck(match);const attempts=match.people.filter(p=>p.pid==='defender'||p.pid==='cover').reduce((n,p)=>n+p.stats.tackleAttempts,0)-before;Math.random=random;return {attempts,owner:match.owner.pid};})()`));assert.equal(r.attempts,1);assert.equal(r.owner,'carrier');
});
check('Native step shares one attempt across two defenders, action and end-of-tick contact',()=>{
 const r=h.copy(h.evaluate(`(()=>{Native182.pursuitScene({offset:'front6',marker:true});const c=match.owner,d=match.people.find(p=>p.pid==='defender'),q=match.people.find(p=>p.pid==='cover'),s=v150Scale();for(const p of [d,q]){p.x=c.x+(p===d?.1:-.1)/s.x;p.y=c.y+.6/s.y;p.recoverUntil=0;const b=v157Body(p);b.vx=b.vy=0;}match.ball={x:c.x,y:c.y+.6/s.y};match.next=match.elapsed;const random=Math.random;Math.random=()=>.99;Native182.advance();Math.random=random;return {attempts:d.stats.tackleAttempts+q.stats.tackleAttempts,clock:v102Clock(match)};})()`));assert.equal(r.attempts,1);assert.equal(r.clock,.05);
});
for(const angle of [30,60,90])check('Smoothed cut reacts later for weak defender '+angle,()=>{
 const reaction=pos=>h.copy(h.evaluate(`(()=>{Native182.pursuitScene({marker:true});const c=match.owner,d=match.people.find(p=>p.pid==='defender'),b=v157Body(c);d.pos=${pos};b.vx=0;b.vy=5;v182PursuitRead(match,d,c,[d]);const start=v152Seconds(match);let first=null,adoptions=0;for(let i=1;i<=60;i++){match.elapsed+=.025*MATCH_SPEED;const angle=Math.min(1,i/12)*${angle}*Math.PI/180;b.vx=Math.sin(angle)*5;b.vy=Math.cos(angle)*5;const r=v182PursuitRead(match,d,c,[d]);if(r.changed){adoptions++;if(first===null)first=v152Seconds(match)-start;}}return {first,adoptions};})()`));const slow=reaction(6),quick=reaction(18);measurements['cut'+angle]={slow,quick};assert(slow.adoptions>0&&quick.adoptions>0);assert(quick.first<slow.first);
});
for(const angle of [30,60,90])check('Native carrier movement smooths cut; stronger defender adopts earlier '+angle,()=>{
 const run=pos=>h.copy(h.evaluate(`(()=>{const original=v182PursuitRead,changes=[];v182PursuitRead=function(m,p,c,ready){if(p.pid==='defender')p.pos=${pos};const at=m.attackFlow.pursuitReads?.[p.pid]?.turnAt,result=original(m,p,c,ready);if(p.pid==='defender'&&result.changed)changes.push({at:v102Clock(m),reaction:v152Seconds(m)-at});return result;};Native182.pursuitRun({offset:'behind5',path:${angle},quality:12,attack:18,marker:true});v182PursuitRead=original;return changes;})()`));
 const slow=run(6),quick=run(18);measurements['nativeCut'+angle]={slow,quick};assert(slow.length&&quick.length);assert(quick[0].at<slow[0].at&&quick[0].reaction<slow[0].reaction);
});
check('Slide starting from front becomes foul when a cut puts body contact behind (marked only)',()=>{
 const run=marker=>h.copy(h.evaluate(`(()=>{Native182.pursuitScene({marker:${marker}});const c=match.owner,d=match.people.find(p=>p.pid==='defender'),s=v150Scale(),b=v157Body(c);b.vx=5;b.vy=0;c.motionX=.01;c.motionY=0;d.x=c.x-.6/s.x;d.y=c.y;match.ball={x:d.x,y:d.y};match.slide={tackler:d,victim:c,from:{x:d.x,y:d.y},target:{x:d.x,y:d.y},progress:0,behind:false};d.slideActive=true;const random=Math.random;Math.random=()=>0;v56AdvanceSlide(.05*MATCH_SPEED);Math.random=random;return {fouls:match.setPieceStats.fouls.reduce((a,b)=>a+b,0),won:d.stats.slideWon};})()`));assert.equal(run(true).fouls,1);assert.equal(run(false).fouls,0);assert.equal(run(false).won,1);
});
const report={pass:!failures.length,checks,failures,measurements};fs.mkdirSync('outputs/match-v182/review',{recursive:true});fs.writeFileSync('outputs/match-v182/review/focused.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(failures.length)process.exitCode=1;
