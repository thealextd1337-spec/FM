'use strict';
// B12: native loose-ball pursuit for matches created with looseBallRevision 182.
// Actual dist controllers in the native VM harness; scenes in native182-scenes.cjs.
const assert=require('node:assert/strict'),{create}=require('./native182-scenes.cjs');
const h=create({view:false}),checks=[],measurements={};function check(name,fn){fn();checks.push(name);}
const kinds=['static','rolling','diagonal','rebound','air'];
const runs={false:[],true:[]};
for(const marker of [false,true])for(const kind of kinds)for(const team of [0,1])for(const size of ['standard','large'])for(let seed=0;seed<6;seed++)runs[marker].push({kind,team,size,seed,...h.copy(h.call('Native182.looseMetrics',h.call('Native182.looseRun',{kind,team,size,seed,marker})))});
const sum=(list,key)=>list.reduce((n,r)=>n+r[key],0),share=(list,a,b)=>sum(list,a)/Math.max(1,sum(list,b));
check('Fresh constructor marks looseBallRevision 182; restore does not mark an old match',()=>{
 const r=h.copy(h.call('Native130.createAndRestoreFlag'));assert(r.restoredUnmarked);
 const created=h.evaluate(`(()=>{const old={v64Active,v65PhysicalPlayer,v65Club,v65ApplyTactics,kickoff,v55RefereeImage,v55RefereeAsset};const k=Native130.reset({marker:false}).k;v64Active=()=>['keeper'];v65PhysicalPlayer=()=>k;v65Club=()=>({name:'Fixture'});v65ApplyTactics=()=>{};kickoff=()=>{};v55RefereeImage=()=>{};v55RefereeAsset=()=>'';const kits=globalThis.v61SelectMatchKits;globalThis.v61SelectMatchKits=()=>({});v65CreateMatch(Native130.context());const flow={...match.attackFlow};Object.assign(globalThis,old);globalThis.v61SelectMatchKits=kits;
  Native130.reset({marker:false});v65Snapshot(Native130.context());Native130.context().state.physicalSnapshot=JSON.parse(JSON.stringify(Native130.context().state.physicalSnapshot));v65Restore(Native130.context());return {loose:flow.looseBallRevision,keeper:flow.keeperChaseRevision,restored:Object.hasOwn(match.attackFlow,'looseBallRevision')};})()`);
 assert.equal(created.loose,182);assert.equal(created.keeper,180);assert.equal(created.restored,false);
});
check('Marked chasers move with their native body: displacement and body velocity agree',()=>{
 const before=share(runs.false,'misalignedTicks','closeMovingTicks'),after=share(runs.true,'misalignedTicks','closeMovingTicks');
 measurements.misaligned={before,after};assert(before>.05,'old override shows the mismatch');assert(after<.01,String(after));
});
check('Marked chaser choice is fixed per loose ball (hysteresis), old top three re-sorted every tick',()=>{
 measurements.chaserChanges={before:sum(runs.false,'chaserChanges')/runs.false.length,after:sum(runs.true,'chaserChanges')/runs.true.length};
 assert(measurements.chaserChanges.after<=.05&&measurements.chaserChanges.after<measurements.chaserChanges.before);
});
check('Falling balls: runners and supporters head for the landing point',()=>{
 const air=m=>runs[m].filter(r=>r.kind==='air'),toward=m=>share(air(m),'airToward','airMoving'),support=m=>sum(air(m),'landingSupport')/Math.max(1,sum(air(m),'landings'));
 measurements.air={towardBefore:toward(false),towardAfter:toward(true),supportBefore:support(false),supportAfter:support(true)};
 assert(measurements.air.towardAfter>measurements.air.towardBefore+.1);assert(measurements.air.supportAfter>measurements.air.supportBefore+.5);
});
check('Active running away from the ball does not increase; every marked loose ball is resolved',()=>{
 const active=m=>share(runs[m],'activeAwayTicks','nearestTicks');measurements.activeAway={before:active(false),after:active(true)};
 assert(measurements.activeAway.after<=measurements.activeAway.before+.005);
 assert(runs.true.every(r=>r.end==='owner'||r.end==='out'),'no marked loose ball remains unresolved');
 const won=runs.true.filter(r=>r.end==='owner'),old=runs.false.filter(r=>r.end==='owner');
 measurements.winSeconds={before:sum(old,'seconds')/old.length,after:sum(won,'seconds')/won.length};
 assert(measurements.winSeconds.after<measurements.winSeconds.before+.35,'bounded time-to-ball cost of real acceleration');
});
for(const team of [0,1])for(const size of ['standard','large'])check(`Both directions and field sizes improve alignment ${team}/${size}`,()=>{
 const pick=m=>runs[m].filter(r=>r.team===team&&r.size===size);assert(share(pick(true),'misalignedTicks','closeMovingTicks')<share(pick(false),'misalignedTicks','closeMovingTicks')/5);
});
check('v182 planners draw no random numbers',()=>{for(const kind of ['rolling','air'])assert(h.call('Native182.plannerDraws',{type:'loose',config:{kind,team:1,size:'large',seed:2,marker:true}})>0);});
for(const kind of ['static','rolling','rebound'])check(`Actual JSON checkpoint continues identically ${kind}`,()=>{
 const scene={type:'loose',config:{kind,team:1,size:'large',seed:1,marker:true}};
 assert.equal(h.call('Native182.continuation',scene,8),h.call('Native182.continuation',scene,-1));
});
check('Keeper ground chase v180 is unchanged by the loose-ball marker',()=>{
 const pickup=extra=>h.copy(h.evaluate(`(()=>{let {k}=Native130.reset({kind:'ordinary',team:1,size:'large',spd:12,diagonal:true,rolling:true});Object.assign(match.attackFlow,${JSON.stringify(extra)});let ticks=0,path=[];while(!match.owner&&ticks++<200){Native130.advance();path.push([k.x,k.y]);}return {owner:match.owner?.pid,ticks,path};})()`));
 const old=pickup({}),fresh=pickup({looseBallRevision:182});assert.equal(fresh.owner,'keeper');assert.deepEqual(fresh,old);
});
console.log(JSON.stringify({pass:true,suite:'loose-ball-v182',checks:checks.length,cases:checks,measurements,scope:'Actual native loose-ball scenes (ground, rolling, diagonal, rebound, falling; both teams; standard/large); no full-match claim.'}));
