'use strict';
// B03: native defensive pursuit for matches created with pursuitRevision 182.
// Actual dist controllers in the native VM harness; scenes in native182-scenes.cjs.
const assert=require('node:assert/strict'),{create}=require('./native182-scenes.cjs');
const h=create({view:false}),checks=[],measurements={};function check(name,fn){fn();checks.push(name);}
const rows={false:[],true:[]};
for(const marker of [false,true])for(const scene of h.copy(h.call('Native182.pursuitScenes',marker)))rows[marker].push({...scene,...h.copy(h.call('Native182.pursuitMetrics',h.call('Native182.pursuitRun',scene)))});
const sum=(list,key)=>list.reduce((n,r)=>n+(r[key]||0),0),per100=(list,key)=>sum(list,key)/list.length*100,pick=(m,f)=>rows[m].filter(f);
const escaped=list=>list.filter(r=>r.end==='escaped').length/list.length;
check('Fresh constructor marks pursuitRevision 182; restore does not mark an old match',()=>{
 const created=h.evaluate(`(()=>{const old={v64Active,v65PhysicalPlayer,v65Club,v65ApplyTactics,kickoff,v55RefereeImage,v55RefereeAsset};const k=Native130.reset({marker:false}).k;v64Active=()=>['keeper'];v65PhysicalPlayer=()=>k;v65Club=()=>({name:'Fixture'});v65ApplyTactics=()=>{};kickoff=()=>{};v55RefereeImage=()=>{};v55RefereeAsset=()=>'';const kits=globalThis.v61SelectMatchKits;globalThis.v61SelectMatchKits=()=>({});v65CreateMatch(Native130.context());const flow={...match.attackFlow};Object.assign(globalThis,old);globalThis.v61SelectMatchKits=kits;
  Native130.reset({marker:false});v65Snapshot(Native130.context());Native130.context().state.physicalSnapshot=JSON.parse(JSON.stringify(Native130.context().state.physicalSnapshot));v65Restore(Native130.context());return {pursuit:flow.pursuitRevision,loose:flow.looseBallRevision,keeper:flow.keeperChaseRevision,restored:Object.hasOwn(match.attackFlow,'pursuitRevision')};})()`);
 assert.equal(created.pursuit,182);assert.equal(created.loose,182);assert.equal(created.keeper,180);assert.equal(created.restored,false);
});
check('Defenders reach a goal-side position more often and sooner',()=>{
 const reach=m=>rows[m].filter(r=>r.goalSideAt!=null),share=m=>reach(m).length/rows[m].length,time=m=>sum(reach(m),'goalSideAt')/reach(m).length;
 measurements.goalSide={before:share(false),after:share(true),secondsBefore:time(false),secondsAfter:time(true)};
 assert(share(true)>share(false)+.4);
 const behindStraight=m=>pick(m,r=>r.offset.startsWith('behind')&&r.path===0);measurements.goalSideFromBehindStraight={before:behindStraight(false).filter(r=>r.goalSideAt!=null).length/behindStraight(false).length,after:behindStraight(true).filter(r=>r.goalSideAt!=null).length/behindStraight(true).length};
 assert(measurements.goalSideFromBehindStraight.after>.5&&measurements.goalSideFromBehindStraight.before===0);
});
for(const path of [0,30,60,90])check(`Cut ${path} degrees: fewer fouls from behind, goal-side more often`,()=>{
 const b=pick(false,r=>r.path===path),a=pick(true,r=>r.path===path);
 assert(per100(a,'foulsBehind')<=Math.max(2.5,per100(b,'foulsBehind')/4),String(per100(a,'foulsBehind')));
 assert(a.filter(r=>r.goalSideAt!=null).length>b.filter(r=>r.goalSideAt!=null).length);
});
check('Fouls and slides from behind drop; the remaining behind slides are fouls on body contact',()=>{
 measurements.foulsBehindPer100={before:per100(rows.false,'foulsBehind'),after:per100(rows.true,'foulsBehind')};measurements.slidesBehindPer100={before:per100(rows.false,'slidesBehind'),after:per100(rows.true,'slidesBehind')};
 measurements.foulsPer100={before:per100(rows.false,'fouls'),after:per100(rows.true,'fouls')};
 assert(measurements.foulsBehindPer100.after<1.5&&measurements.foulsBehindPer100.after<measurements.foulsBehindPer100.before/10);
 assert(measurements.slidesBehindPer100.after<measurements.slidesBehindPer100.before/4);assert(measurements.foulsPer100.after<measurements.foulsPer100.before);
});
check('Running past a carrier without any contact check does not increase',()=>{
 measurements.passByPer100={before:per100(rows.false,'passBy'),after:per100(rows.true,'passBy'),afterLostDuel:per100(rows.true,'passByRecovering')};
 assert(measurements.passByPer100.after<=measurements.passByPer100.before);
 const front=m=>per100(pick(m,r=>r.offset.startsWith('front')),'passBy');measurements.frontPassByPer100={before:front(false),after:front(true)};assert(front(true)<front(false));
});
check('Quality differences remain: fast strikers stay ahead of slow defenders, not vice versa',()=>{
 const fast=pick(true,r=>r.attack===18&&r.quality===8),slow=pick(true,r=>r.attack===8&&r.quality===18);
 measurements.escaped={fastVsSlowBefore:escaped(pick(false,r=>r.attack===18&&r.quality===8)),fastVsSlowAfter:escaped(fast),slowVsFastBefore:escaped(pick(false,r=>r.attack===8&&r.quality===18)),slowVsFastAfter:escaped(slow)};
 assert(escaped(fast)>=.35&&escaped(slow)<.05&&escaped(fast)>escaped(slow)+.3);
 const won=(m,q)=>pick(m,r=>r.quality===q&&r.size==='standard').filter(r=>r.end==='won'||r.end==='loose').length;assert(won(true,18)>won(true,8));
});
for(const team of [0,1])check(`Both attacking directions improve ${team}`,()=>{
 const b=pick(false,r=>r.team===team),a=pick(true,r=>r.team===team);assert(a.filter(r=>r.goalSideAt!=null).length>b.filter(r=>r.goalSideAt!=null).length*2);assert(per100(a,'foulsBehind')<per100(b,'foulsBehind')/5);
});
check('Behind is measured in metres along the carrier\'s actual run (marked only)',()=>{
 const r=h.copy(h.evaluate(`(()=>{const out={};for(const marker of [false,true]){Native182.pursuitScene({offset:'behind3',marker});const s=v150Scale(),c=match.people.find(p=>p.pid==='carrier'),d=match.people.find(p=>p.pid==='defender'),b=v157Body(c);b.vx=5;b.vy=0;
  const place=(along,lateral)=>{d.x=c.x+along/s.x;d.y=c.y+lateral/s.y;return v56ApproachInfo(d,c).behind;};
  out[marker]={metres:v182Behind(d,c),behind06:place(-.6,0),behind04:place(-.4,0),beside:place(0,2),ahead:place(1,0)};}return out;})()`));
 assert.equal(r.false.metres,null);assert.deepEqual({...r.true,metres:undefined},{metres:undefined,behind06:true,behind04:false,beside:false,ahead:false});
});
check('A slide from behind with body contact remains a foul',()=>{
 const r=h.copy(h.evaluate(`(()=>{Native182.pursuitScene({offset:'behind1',marker:true});const c=match.people.find(p=>p.pid==='carrier'),d=match.people.find(p=>p.pid==='defender');d.x=c.x;d.y=c.y+(c.t===0?.012:-.012);
  match.slide={tackler:d,victim:c,from:{x:d.x,y:d.y},target:{x:c.x,y:c.y},progress:0,behind:true};d.slideActive=true;const fouls=match.setPieceStats.fouls.slice();v56AdvanceSlide(.05*MATCH_SPEED);return {before:fouls,after:match.setPieceStats.fouls,setPiece:!!match.setPiece};})()`));
 assert(r.setPiece);assert.equal(r.after[0]+r.after[1],r.before[0]+r.before[1]+1);
});
check('Perceived carrier direction updates after a skill-dependent reaction',()=>{
 const reaction=pos=>h.evaluate(`(()=>{Native182.pursuitScene({offset:'behind3',marker:true});const c=match.people.find(p=>p.pid==='carrier'),d=match.people.find(p=>p.pid==='defender');d.pos=${pos};const ready=[d],b=v157Body(c);b.vx=0;b.vy=5;v182PursuitRead(match,d,c,ready);
  b.vx=5;b.vy=0;const start=v152Seconds(match);for(let i=0;i<40;i++){if(v182PursuitRead(match,d,c,ready).changed)return v152Seconds(match)-start;match.elapsed+=.025*MATCH_SPEED;}return null;})()`);
 const slow=reaction(6),quick=reaction(18);measurements.reactionSeconds={pos6:slow,pos18:quick};assert(quick!==null&&slow!==null&&quick<slow&&quick>=.1&&slow<=.33);
});
check('Pursuers keep pace instead of braking to a stop behind the carrier',()=>{
 const r=h.copy(h.evaluate(`(()=>{const out={};for(const marker of [false,true]){Native182.pursuitScene({offset:'behind1',marker,quality:12,attack:12});const d=match.people.find(p=>p.pid==='defender'),c=match.people.find(p=>p.pid==='carrier');let speeds=[];for(let i=0;i<14;i++){Native182.advance();speeds.push(Math.hypot(d.offenseMotion.vx,d.offenseMotion.vy)-Math.hypot(c.offenseMotion.vx,c.offenseMotion.vy));}out[marker]=Math.min(...speeds.slice(4));}return out;})()`));
 measurements.paceGapBehind=r;assert(r.true>-1);
});
check('v182 planners draw no random numbers',()=>{for(const offset of ['behind3','front6'])assert(h.call('Native182.plannerDraws',{type:'pursuit',config:{offset,path:60,marker:true}})>0);});
for(const offset of ['behind3','sideR2','front6'])check(`Actual JSON checkpoint continues identically ${offset}`,()=>{
 const scene={type:'pursuit',config:{offset,path:60,quality:12,attack:12,team:1,size:'large',marker:true}};
 assert.equal(h.call('Native182.continuation',scene,10),h.call('Native182.continuation',scene,-1));
});
console.log(JSON.stringify({pass:true,suite:'defensive-pursuit-v182',checks:checks.length,cases:checks,measurements,scope:'Actual native breakaway scenes (defender 1-5 m behind/beside/diagonal/in front; straight and 30/60/90 degree cuts; skill 8/12/18; both teams; standard/large). Carrier path scripted; no full-match claim.'}));
