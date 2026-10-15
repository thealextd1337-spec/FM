'use strict';
// SI-4 scene benchmark (no browser): controlled turnovers in the loser's final third
// on the actual dist controllers in the native VM harness. Repeats a seeded scene with
// random positions and skills and reports how often the loser regains the ball within
// 3 s, fouls and challenges per condition. Gives effect sizes with a 95 % interval that
// the 192-match series cannot resolve (about 2.6 such turnovers per match).
// Usage: node work/measure-si-defence-scenes-v183.cjs [--reps=400] [--size=standard|large]
//        [--variant=name:key=value,key=value ...]   (extra conditions on top of off/windows-off/default)
const assert=require('node:assert/strict');
const {create}=require('./native183-scenes.cjs'),{source}=require('./si-defence-scenes-v183.cjs');
const arg=(name,fallback)=>{const hit=process.argv.find(a=>a.startsWith('--'+name+'='));return hit?hit.slice(name.length+3):fallback;};
const reps=+arg('reps','400'),size=arg('size','standard');
const h=create({view:false});h.run(source,'native-defence-scenes');
const variants=[{name:'package-off',cfg:{on:false}},{name:'windows-off',cfg:{on:true,si:{params:{defence:{counterWindow:0,counterWindowPress:0}}}}},{name:'default',cfg:{on:true}}];
for(const raw of process.argv.filter(a=>a.startsWith('--variant=')).map(a=>a.slice(10))){const [name,rest]=raw.split(':'),defence={};for(const item of (rest||'').split(',').filter(Boolean)){const [k,v]=item.split('=');defence[k]=+v;}variants.push({name,cfg:{on:true,si:{params:{defence}}}});}
// Deterministic jitter, independent of the engine's random stream.
const jitter=seed=>{let s=(seed*2654435761)>>>0||7;return ()=>{s=(Math.imul(s,22695477)+1)>>>0;return s/4294967296;};};
function scene(rep,variant){
 const j=jitter(rep+1),pick=(a,b)=>a+(b-a)*j(),skill=()=>Math.round(pick(8,16));
 const carrierDepth=pick(50,58),press=j()<.5?1:0;
 const cfg={...variant.cfg,size,press,seed:9000+rep,carrier:{depth:carrierDepth,lateral:pick(-8,8),vy:pick(-1,3),skills:{spd:skill(),tec:skill(),pas:skill()}},
  defs:[{depth:carrierDepth-pick(1,4),lateral:pick(-5,5),line:'att',skills:{tak:skill(),pos:skill(),spd:skill()}},{depth:carrierDepth-pick(3,9),lateral:pick(-10,10),line:'mid',skills:{tak:skill(),pos:skill(),spd:skill()}},{depth:carrierDepth-pick(8,15),lateral:pick(-12,12),line:'mid',skills:{tak:skill(),pos:skill(),spd:skill()}},{depth:pick(26,34),lateral:pick(-8,8),line:'def',skills:{tak:skill(),pos:skill(),spd:skill()}}],
  atts:[{depth:carrierDepth-pick(8,14),lateral:pick(-10,10)},{depth:carrierDepth-pick(12,20),lateral:pick(-12,12)}]};
 h.evaluate(`NativeDef.build(${JSON.stringify(cfg)})`);
 // The loser's player held the ball a moment ago: prime the possession bookkeeping, then the opponent has it.
 h.evaluate(`(()=>{const m=match,carrier=m.owner,mine=m.people.find(x=>x.pid==='def0'),probe=m.people.find(x=>x.pid==='att0');m.owner=mine;m.ball={x:mine.x,y:mine.y};v102State(m).clock+=.05;if(typeof v183Active==='function'&&v183Active(m,'defence'))v159DefensiveTarget(m,probe);m.owner=carrier;m.ball={x:carrier.x,y:carrier.y};m.next=m.elapsed+.7*MATCH_SPEED;mine.recoverUntil=m.elapsed+1.5*MATCH_SPEED;})()`);
 return h.evaluate(`(()=>{const m=match,start=v102Clock(m),out={regain:null,foul:false,fouls:0,challenges:0,windows:0};Math.random=(()=>{let s=${12345+rep};return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};})();
  const attempts=()=>m.people.reduce((n,p)=>n+(p.stats.tackleAttempts||0),0);const a0=attempts();
  for(let i=0;i<70&&!m.setPiece;i++){Native182.advance();if(out.regain===null&&m.owner&&m.owner.t===0&&!m.owner.keeper)out.regain=+(v102Clock(m)-start).toFixed(2);if(m.attackFlow.defence?.counter)out.windows=1;}
  out.foul=!!(m.setPiece&&m.setPiece.type!=='kickoff');out.challenges=attempts()-a0;const sum=k=>m.people.filter(p=>p.t===0).reduce((n,p)=>n+(p.stats[k]||0),0);out.via={tackle:sum('tacklesWon'),slide:sum('slideWon'),intercept:sum('interceptions')};out.passes=m.people.filter(p=>p.t===1).reduce((n,p)=>n+(p.stats.passes||0),0);out.final=m.setPiece?.type||null;return out;})()`);
}
const result={};
for(const variant of variants){
 let regain=0,foul=0,challenges=0,time=0,windows=0,tackle=0,slide=0,intercept=0,passes=0;
 for(let rep=0;rep<reps;rep++){const r=h.copy(scene(rep,variant));if(r.regain!==null&&r.regain<=3){regain++;time+=r.regain;}if(r.foul)foul++;challenges+=r.challenges;windows+=r.windows;tackle+=r.via.tackle;slide+=r.via.slide;intercept+=r.via.intercept;passes+=r.passes;}
 const p=regain/reps;result[variant.name]={reps,regain3s:+p.toFixed(3),ci95:+(1.96*Math.sqrt(p*(1-p)/reps)).toFixed(3),meanSecondsToRegain:regain?+(time/regain).toFixed(2):null,foulShare:+(foul/reps).toFixed(3),challengesPerScene:+(challenges/reps).toFixed(2),windowShare:+(windows/reps).toFixed(2),perScene:{tacklesWon:+(tackle/reps).toFixed(3),slidesWon:+(slide/reps).toFixed(3),interceptions:+(intercept/reps).toFixed(3),opponentPasses:+(passes/reps).toFixed(2)}};
}
console.log(JSON.stringify({size,result},null,1));
