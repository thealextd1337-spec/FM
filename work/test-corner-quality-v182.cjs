'use strict';
// B10: high corners. Actual native steps through v50Restart -> v50TakeCorner
// -> v55HighPass with the native130 world fixture (current dist, Node 20+).
// Old = unmarked match, new = attackFlow.setPieceRevision 182.
const fs=require('node:fs'),assert=require('node:assert/strict'),{harness}=require('./native130-harness.cjs');
const h=harness({view:false});h.run('v50Name=t=>t===0?"Heim":"Gast";showOverlay=()=>{};hideOverlay=()=>{};var v83GoalSceneDuration=2;');const checks=[],failures=[],check=(name,fn)=>{try{fn();checks.push(name);}catch(error){failures.push(`${name}: ${error.message}`);}};
h.run(`globalThis.CornerProbe=(function(){
 let log=null;
 const highPass=v55HighPass;v55HighPass=function(passer,receiver,options){if(log&&options?.corner&&!log.pass){log.pass={passer:passer.pid,receiver:receiver.pid,intended:{x:receiver.x,y:receiver.y},from:{...match.ball},drawsBefore:Native130.rng().draws,events0:match.ballAccounting?.events.length||0};log.inHigh=true;}try{return highPass.apply(this,arguments);}finally{if(log?.inHigh){log.inHigh=false;log.pass.drawsAfter=Native130.rng().draws;}}};
 const exit=v55Exit;v55Exit=function(from,to){const hit=exit(from,to);if(log?.inHigh&&!log.land){log.land={...to};log.exit=hit?{edge:hit.edge,x:hit.x,y:hit.y}:null;}return hit;};
 const out=v55Out;v55Out=function(hit,lastTouch,description){if(log&&!log.first)log.first={kind:'out',edge:hit.edge,lastTouch};return out.apply(this,arguments);};
 function person(base,pid,t,x,y,keeper,level){const p=structuredClone(base);Object.assign(p,{pid,n:keeper?1:2+Number(pid.slice(-1)),name:pid,t,x,y,tx:x,ty:y,bx:x,by:y,initialBy:y,keeper,line:keeper?'gk':'mid',assignedLine:keeper?'gk':'mid',stats:emptyStats(),motionX:0,motionY:0});delete p.offenseMotion;
  for(const key of D6PlayerGeneration.SKILL_KEYS)p[key]=12;if(level!==undefined){p.pas=level;p.tec=level;}const s=Native130.context().state;s.fresh[pid]=100;s.playerLoad.startFresh[pid]=100;s.playerLoad.players[pid]=D6Freshness.createState(pid,100);s.playerLoad.meta[pid]={stamina:p.sta,keeper};p.playerModel={...p.playerModel,freshnessState:D6Freshness.createState(pid,100)};return p;}
 function run({team,right,level,marker,seed,secondHalf}){
  const {k}=Native130.reset({marker:true,team:0});let r=15432+seed*7919;Math.random=()=>{r=(Math.imul(r,1664525)+1013904223)>>>0;return r/4294967296;};
  const base=k,people=[];for(const t of [0,1]){const goal=t===0?v55Field.top:v55Field.bottom,dir=t===0?1:-1;people.push(person(base,'k'+t,t,.5,goal+dir*.02,true));for(let i=0;i<5;i++)people.push(person(base,(t===team?'a':'d')+t+i,t,.2+i*.15,t===team?(goal+dir*(.12+i*.04)):(goal+dir*(.05+i*.05)),false,t===team?level:undefined));}
  // Opponent keeper guards the goal of the attacking team.
  Object.assign(match,{people,owner:null,rebound:null,flight:null,ball:{x:.5,y:.5},elapsed:secondHalf?600:10,firstHalfEnd:500,fullTimeEnd:1000,lastTouch:1-team,setPiece:null,setPieceStats:{corners:[0,0],fouls:[0,0],freeKicks:[0,0],penalties:[0,0]},teamFocus:[null,null],cornerVariants:[null,null]});
  if(secondHalf)match.halftime=true;if(marker)match.attackFlow.setPieceRevision=182;else delete match.attackFlow.setPieceRevision;
  log={};const spot={x:right?.951:.049,y:team===0?.036:.964};v50Restart('corner',team,spot,'Eckballmessung');log.variant=match.setPiece?.cornerVariant;log.taker=match.setPiece?.taker?.pid;
  let i=0;for(;i<600&&!log.pass;i++)Native130.advance(.05);
  const flight=match.flight;log.target=flight?.target?{...flight.target}:null;
  const goals=match.goals.length;for(let j=0;j<400&&!log.first;j++){const before=match.owner;Native130.advance(.05);if(!log.first&&match.goals.length>goals)log.first={kind:'goal',team:match.goals.at(-1).team};if(!log.first&&match.owner&&match.owner!==before)log.first={kind:'owner',team:match.owner.t,pid:match.owner.pid,keeper:!!match.owner.keeper};if(!log.first&&match.setPiece&&match.setPiece.type!=='corner')log.first={kind:'restart',type:match.setPiece.type};}
  log.events=(match.ballAccounting?.events||[]).slice(log.pass?.events0||0).map(e=>[e.kind,e.actorPid,e.result].join(':'));const s={x:v160PitchWidth()/(v55Field.right-v55Field.left),y:v160PitchLength()/(v55Field.bottom-v55Field.top)},result={...log,metres:log.land?{inX:Math.min(log.land.x-v55Field.left,v55Field.right-log.land.x)*s.x,inY:Math.min(log.land.y-v55Field.top,v55Field.bottom-log.land.y)*s.y,error:Math.hypot((log.land.x-log.pass.intended.x)*s.x,(log.land.y-log.pass.intended.y)*s.y)}:null,draws:log.pass?log.pass.drawsAfter-log.pass.drawsBefore:null};log=null;return JSON.stringify(result);
 }
 return{run};
})();`,'corner-probe');
// Marker contract: only the fresh constructor marks; JSON restore of an unmarked
// match adds nothing; a played shootout session copies the match marker.
{const phys=fs.readFileSync(require("node:path").join(require("./native130-harness.cjs").root,"dist/world-physical-v65.js"),"utf8");h.run(phys.slice(phys.indexOf("function v65PenaltySession("),phys.indexOf("function v65BookWorldMatch(")),"v65PenaltySession");}
check("Fresh constructor marks penalty182/setPiece182; restore of an unmarked match does not; session copies marker",()=>{
 const r=JSON.parse(h.evaluate(`(()=>{const {k}=Native130.reset({marker:false}),keep={v64Active,v65PhysicalPlayer,v65Club,v65ApplyTactics,kickoff,v55RefereeImage,v55RefereeAsset,v62Current:globalThis.v62Current},kits=globalThis.v61SelectMatchKits;
  v64Active=()=>["keeper"];v65PhysicalPlayer=()=>k;v65Club=()=>({name:"Fixture"});v65ApplyTactics=()=>{};kickoff=()=>{};v55RefereeImage=()=>{};v55RefereeAsset=()=>"";globalThis.v61SelectMatchKits=()=>({});globalThis.v62Current=()=>[];
  const ctx=Native130.context();v65CreateMatch(ctx);const created={penalty:match.penaltyRevision,setPiece:match.attackFlow.setPieceRevision};match.kits={};const markedSession=v65PenaltySession(ctx).penaltyRevision;
  v65Snapshot(ctx);ctx.state.physicalSnapshot=JSON.parse(JSON.stringify(ctx.state.physicalSnapshot));v65Restore(ctx);const markedRestore={penalty:match.penaltyRevision,setPiece:match.attackFlow.setPieceRevision};
  Native130.reset({marker:false});v65Snapshot(ctx);ctx.state.physicalSnapshot=JSON.parse(JSON.stringify(ctx.state.physicalSnapshot));v65Restore(ctx);const old={penalty:Object.hasOwn(match,"penaltyRevision"),setPiece:Object.hasOwn(match.attackFlow,"setPieceRevision")};match.kits={};const oldSession=Object.hasOwn(v65PenaltySession(ctx),"penaltyRevision");
  Object.assign(globalThis,keep);if(kits)globalThis.v61SelectMatchKits=kits;return JSON.stringify({created,markedSession,markedRestore,old,oldSession});})()`));
 assert.deepEqual(r.created,{penalty:182,setPiece:182});assert.equal(r.markedSession,182);assert.deepEqual(r.markedRestore,{penalty:182,setPiece:182});
 assert.deepEqual(r.old,{penalty:false,setPiece:false});assert.equal(r.oldSession,false);
});
const cases=[];
const seeds=Number(process.env.CORNER_SEEDS||25);
for(const marker of [false,true])for(const team of [0,1])for(const right of [false,true])for(const secondHalf of [false,true])for(const level of [6,12,18])for(let seed=1;seed<=seeds;seed++){
 const r=JSON.parse(h.call('CornerProbe.run',{team,right,level,marker,seed,secondHalf}));cases.push({marker,team,right,secondHalf,level,seed,...r});
}
const high=cases.filter(c=>c.pass&&c.variant!=='short');
const group=(list,key)=>{const out={};for(const c of list){const k=key(c);(out[k]||(out[k]=[])).push(c);}return out;};
const summary=list=>({n:list.length,exit:+(list.filter(c=>c.exit).length/list.length).toFixed(3),exitEdges:Object.fromEntries(Object.entries(group(list.filter(c=>c.exit),c=>c.exit.edge)).map(([k,v])=>[k,v.length])),meanError:+(list.reduce((s,c)=>s+c.metres.error,0)/list.length).toFixed(2),insideBelow1m:+(list.filter(c=>!c.exit&&Math.min(c.metres.inX,c.metres.inY)<.99).length/list.length).toFixed(3),first:Object.fromEntries(Object.entries(group(list,c=>c.first?c.first.kind==='owner'?(c.first.team===c.team?'attack':c.first.keeper?'keeper':'defence'):c.first.kind+':'+(c.first.edge||c.first.type):'none')).map(([k,v])=>[k,v.length])),variants:Object.fromEntries(Object.entries(group(list,c=>c.variant)).map(([k,v])=>[k,v.length]))});
const table={};for(const marker of [false,true]){const m=marker?'new':'old';table[m]={all:summary(high.filter(c=>c.marker===marker)),byLevel:Object.fromEntries([6,12,18].map(l=>[l,summary(high.filter(c=>c.marker===marker&&c.level===l))])),byCorner:Object.fromEntries(Object.entries(group(high.filter(c=>c.marker===marker),c=>`team${c.team}-${c.right?'right':'left'}`)).map(([k,v])=>[k,summary(v)])),byHalf:Object.fromEntries(Object.entries(group(high.filter(c=>c.marker===marker),c=>c.secondHalf?'2':'1')).map(([k,v])=>[k,summary(v)]))};}
check('Every high-corner probe reached an actual corner kick',()=>{assert(cases.filter(c=>c.variant!=='short').every(c=>c.pass),'corner pass missing');assert(high.length>cases.length*.5);});
check('Same draw count for old and new corner landings',()=>{const twin=c=>cases.find(x=>x.marker!==c.marker&&x.team===c.team&&x.right===c.right&&x.level===c.level&&x.seed===c.seed&&x.secondHalf===c.secondHalf);for(const c of high){const t=twin(c);if(t?.pass)assert.equal(c.draws,t.draws);}assert(table.old.all.exit>.15,'old corners still show the former flat out variants');});
const exitRate=(m,l)=>table[m].byLevel[l].exit;
check('New corners: rare real outs, weaker takers more often, landing normally at least 1 m inside',()=>{
 assert(table.new.all.exit<.06,`exit ${table.new.all.exit}`);assert(exitRate('new',6)>=exitRate('new',18));
 assert(table.new.all.insideBelow1m<.02);for(const l of [6,12,18])assert(table.new.byLevel[l].meanError<=table.new.byLevel[6].meanError+1e-9);
 assert(table.new.byLevel[18].meanError<table.new.byLevel[6].meanError);
});
check('No corner exits next to the flag: out balls cross a far boundary',()=>{for(const c of high.filter(c=>c.marker&&c.exit)){const d=Math.hypot(c.exit.x-c.pass.from.x,(c.exit.y-c.pass.from.y)*1.5);assert(d>.25,JSON.stringify(c.exit));}});
const output={pass:!failures.length,checks,failures,table,seeds};
fs.mkdirSync('outputs/3d-quality/corner-quality-v182',{recursive:true});fs.writeFileSync('outputs/3d-quality/corner-quality-v182/native.json',JSON.stringify(output,null,1)+'\n');if(process.env.CORNER_CASES)fs.writeFileSync(process.env.CORNER_CASES,JSON.stringify(cases)+'\n');
console.log(JSON.stringify(output));if(failures.length)process.exitCode=1;
