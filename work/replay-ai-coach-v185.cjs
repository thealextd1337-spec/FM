'use strict';
// AI coach 185: Node replay of whole played-out matches in new SI-183 expansion worlds, paired without and with
// the marker (off: state.aiCoachRevision removed, the step keeps v64AiAdjust; on: marker 185). Runs the actual dist
// engine in the native VM harness plus the production career modules (player foundation, performance ledger,
// expansion world) and the real v65AfterStep chain (minute sync, goals, half time, AI checks, tactics, substitutions);
// only UI transport (swap banner, report, snapshot, pause) and the final whistle UI are inert.
// Set p: the 192 fixtures of the browser reference bp-h / bp-hl (every league club as own club in its p01r132 world,
// both pitch sizes, its real first league fixture, random stream seeded as the browser harness does), to compare the
// replay without marker with the browser series. Its named part (review 1, standard pitch, own club - AI club):
// balanced AUT-2 - AUT-1, ESP-6 - ESP-5; AI favourite BEL-8 - BEL-3, ENG-5 - ENG-2; AI outsider AUT-3 - AUT-8, BEL-1 - BEL-7.
// Benchmark set per pitch size and league (12 countries x 8 clubs, ranked by the outfield skill mean of the best
// starters): (a) similar strength: ranks 1-2, 3-4, 5-6, 7-8 of the same league; (b) favourite vs. outsider: ranks
// 1-8 and 2-7 in both directions (AI as favourite and as outsider); (c) cup: a mid-table league club against two
// cup clubs (simulationOnly) of its country, AI = cup club, reported separately.
// Usage: node work/replay-ai-coach-v185.cjs --label=rp-a [--workers=6] [--only=a,b,c] [--limit=n]
// Table: node work/table-ai-coach-replay-v185.cjs <label>
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(`--${k}=`));return a?a.slice(k.length+3):d;};
const hash=text=>{let h=0;for(const ch of text)h=(Math.imul(h,31)+ch.charCodeAt(0))>>>0;return Math.imul(h+1,2654435761)>>>0||1;};
const SIZES=[['standard',5,'aic185-std'],['large',6,'aic185-lrg']];

function vmHarness(){
 process.chdir(root);
 const {create}=require('./native183-scenes.cjs'),g=create({view:false}),read=f=>fs.readFileSync(path.join(root,'dist',f),'utf8');
 for(const f of ['player-foundation-preview-v153.js','world-player-foundation-v153.js','world-player-performance-v155.js','world-economy-v66.js','world-youth-manager-v67.js','world-transfer-list-v72.js','world-honours-v74.js','world-payments-v124.js','world-expansion-catalog-v161.js','world-expansion-v161.js','world-expansion-domestic-v164.js','world-expansion-crown-v165.js','world-expansion-horizon-v166.js','world-expansion-progression-v167.js','world-expansion-economy-v168.js','world-squad-planning-v179.js','world-expansion-stories-v170.js','world-youth-legacy-v176.js'])g.run(read(f),f);
 const phys=read('world-physical-v65.js'),a=phys.indexOf('function v65ApplyTactics('),b=phys.indexOf('\n}\n',a)+3;
 g.run(phys.slice(a,b),'v65ApplyTactics');
 g.run(phys.slice(phys.indexOf('function v65SyncMinute('),phys.indexOf('function v65NeedsPenalties(')),'v65AfterStep-chain');
 const pres=read('match-presentation-v74.js'),c0=pres.indexOf('function v74ClockLabel(');g.run(pres.slice(c0,pres.indexOf('\n}\n',c0)+3),'v74ClockLabel');
 g.run(read('world-ai-coach-v185.js'),'world-ai-coach-v185.js');
 g.run('v65ShowSwapInfo=()=>{};v65RenderReport=()=>{};v65Snapshot=()=>true;v65Pause=()=>{};finishMatch=function(){match.finished=true;running=false;match.flight=null;};if(typeof performance==="undefined")globalThis.performance={now:()=>0};','inert-ui');
 return g;
}
// Career of the managed club as the browser harness builds it (sponsor, no youth budget, transfer market played out).
// The transfer market depends on the managed club, so pairs are chosen on the preseason ranking (market=false), which
// is identical for every managed club (checked in the plan); every match records the strength of its actual starters.
// browser: seed the random stream exactly as work/measure-si183.cjs does (named benchmark set n in the p01r132 worlds).
const h31=text=>{let h=0;for(const ch of text)h=(Math.imul(h,31)+ch.charCodeAt(0))>>>0;return h;};
function careerFor(g,managed,size,players,seed,market=true,browser=false){
 g.call('Native182.seedRandom',browser?h31(seed):hash('world:'+seed));
 const c=g.call('v167CreateCareer',managed,seed,'QA',{fieldSize:size,fieldPlayers:players});if(!market)return c;
 const own=g.call('v66Club',c,c.manager.managedClubId);g.call('v66ChooseSponsor',c,own.id,own.sponsors[0].id);g.call('v124SetYouthBudget',c,0);
 for(let i=0;i<40&&['open','deadline'].includes(c.world.market?.phase);i++)g.call('v66NextMarketDay',c);
 return c;
}
// Same strength scale as the browser harness (teams[].ovr): mean of the eight stored outfield skills.
const skillMean=(g,p)=>(p.spd+p.tec+p.pas+p.fin+p.tak+p.pos+p.air+p.sta)/8;
function plan(g){
 const jobs=[],worlds={};
 for(const [size,players,seed] of SIZES){
  const c=careerFor(g,'GER-1',size,players,seed,false),check=careerFor(g,'ENG-8',size,players,seed,false);
  const rosters=x=>JSON.stringify(x.world.clubs.map(cl=>cl.roster.map(p=>[p.pid,p.fin,p.tak,p.spd])));
  if(rosters(c)!==rosters(check))throw Error('rosters depend on the managed club');
  const strength=club=>{const field=club.roster.filter(p=>!p.keeper).map(p=>skillMean(g,p)).sort((x,y)=>y-x).slice(0,players);return field.reduce((s,x)=>s+x,0)/field.length;};
  const leagues=c.world.competitions.filter(x=>x.type==='league'),day=Math.min(...leagues.flatMap(x=>x.fixtures.map(f=>f.day)));
  worlds[size]={day,leagues:{}};
  for(const league of leagues){
   const clubs=c.world.clubs.filter(cl=>cl.leagueId===league.id||league.fixtures.some(f=>f.homeId===cl.id)).map(cl=>({id:cl.id,s:strength(cl)})).sort((x,y)=>y.s-x.s);
   if(clubs.length!==8)throw Error(`league ${league.id}: ${clubs.length} clubs`);
   const country=league.country||clubs[0].id.split('-')[0];worlds[size].leagues[league.id]=clubs.map(x=>[x.id,+x.s.toFixed(2)]);
   const add=(set,managed,ai,home)=>jobs.push({id:`${size}:${set}:${managed}-${ai}`,set,size,players,seed,managed,ai,home:home?managed:ai,away:home?ai:managed,competitionId:league.id,day});
   const r=i=>clubs[i].id;
   add('a',r(0),r(1),true);add('a',r(3),r(2),false);add('a',r(4),r(5),true);add('a',r(7),r(6),false);
   add('b-fav',r(7),r(0),true);add('b-fav',r(6),r(1),false);add('b-out',r(0),r(7),false);add('b-out',r(1),r(6),true);
   const cup=c.world.competitions.find(x=>x.type==='cup'&&(x.country===country||x.id.includes(`:${country}:`)));
   const cupClubs=c.world.clubs.filter(cl=>cl.simulationOnly&&cl.countryId===country).slice(0,2);
   for(const [i,cl] of cupClubs.entries())if(cup)jobs.push({id:`${size}:c:${r(3+i)}-${cl.id}`,set:'c',size,players,seed,managed:r(3+i),ai:cl.id,home:r(3+i),away:cl.id,competitionId:cup.id,day});
  }
 }
 const clubs=Object.values(worlds.standard.leagues).flat().map(x=>x[0]).sort();
 for(const [size,players] of SIZES)for(const managed of clubs){const named=size==='standard'&&NAMED.find(x=>x[0]===managed);jobs.push({id:`${size}:p:${managed}`,set:'p',kind:named?named[2]:null,size,players,seed:'p01r132-'+managed,browser:true,managed,ai:named?named[1]:null});}
 return{jobs,worlds};
}
const NAMED=[['AUT-2','AUT-1','a'],['ESP-6','ESP-5','a'],['BEL-8','BEL-3','b-fav'],['ENG-5','ENG-2','b-fav'],['AUT-3','AUT-8','b-out'],['BEL-1','BEL-7','b-out']];
// Career and fixture of a job, prepared once and cloned for the runs without and with the marker. Set n takes the
// real first own fixture (v64AdvanceToOwnMatch) and keeps the random stream; the other sets use a constructed fixture.
function prepare(g,job){
 const c=careerFor(g,job.managed,job.size,job.players,job.seed,true,!!job.browser);let fixtureId=null;
 if(job.set==='p'){const f=g.call('v64AdvanceToOwnMatch',c);if(!f||job.ai&&![f.homeId,f.awayId].includes(job.ai))throw Error(`${job.id}: first fixture is ${f?.homeId}-${f?.awayId}`);fixtureId=f.id;}
 return{snapshot:g.call('JSON.stringify',c),fixtureId,rng:g.call('Native182.rng').value};
}
function play(g,job,on,prepared=prepare(g,job)){
 const c=g.call('JSON.parse',prepared.snapshot);let fixture,state;
 if(prepared.fixtureId){fixture=g.call('v62Fixtures',c).find(x=>x.id===prepared.fixtureId);state=c.world.activeMatch.state;}
 else{fixture={id:`QA:AIC185:${job.id}`,competitionId:job.competitionId,homeId:job.home,awayId:job.away,day:job.day,neutral:false,result:null};g.call('v64PrepareFixture',c,fixture);state=g.call('v64MakeState',c,fixture);}
 if(!on)delete state.aiCoachRevision;else if(state.aiCoachRevision!==185)throw Error('no marker in a stamped world');
 const ownSide=fixture.homeId===job.managed?0:1,ctx={career:c,fixture,state,ownSide},aiPlan=ownSide===0?fixture.plan.away:fixture.plan.home;
 const coach=c.world.coaches.find(x=>x.id===aiPlan.coachId);
 c.world.activeMatch={fixtureId:fixture.id,state};g.evaluate('(x=>{v61CurrentCareer=x.career;v65WorldActive=x;v65ProcessedGoals=0;running=true;})')(ctx);state.phase='live';
 g.call('Native182.seedRandom',prepared.fixtureId?prepared.rng:hash('match:'+job.id));g.call('v65CreateMatch',ctx);
 const step=g.evaluate('(dt)=>{step(dt*(match.si?v183Rate(match):MATCH_SPEED),dt);const x=v65WorldActive;if(x.state.phase==="live"&&!match.finished)v65AfterStep(x);return match.finished;}');
 let ticks=0;while(ticks++<40000&&!step(.05));
 const m=g.evaluate('match'),people=[...m.people,...(m.exitedPeople||[])],team=t=>{const side=t===0?ownSide:1-ownSide;
  const starters=(side===0?fixture.plan.home:fixture.plan.away).starters.map(pid=>g.call('v64Player',c,fixture,side,pid)).filter(p=>!p.keeper);
  return{side,clubId:side===0?fixture.homeId:fixture.awayId,ovr:+(starters.reduce((s,p)=>s+skillMean(g,p),0)/starters.length).toFixed(2),score:m.score[t],shots:m.shots[t],onTarget:people.filter(p=>p.t===t).reduce((n,p)=>n+(p.stats.onTarget||0),0)};};
 const json=x=>JSON.parse(JSON.stringify(x));
 return{id:job.id,set:job.set,kind:job.kind||job.set,size:job.size,on,state:on?json({aiCoach:state.aiCoach,tacticChanges:state.tacticChanges}):undefined,finished:!!m.finished,ticks,ownSide,aiSide:1-ownSide,adaptation:coach?.judgment?.adaptation??null,teams:[team(0),team(1)],
  goals:json(state.events.filter(e=>e.type==='goal').map(e=>[e.minute,e.side])),changes:json(state.tacticChanges.filter(x=>x.side===1-ownSide).map(x=>[x.minute,x.tactics,x.reason])),
  base:json(aiPlan.tactics),subs:json(state.substitutions.map(s=>[s.minute,s.side])),log:json(state.aiCoach?.log||[]),minute:state.minute};
}
if(process.env.D6_AIC185_WORKER){
 const {jobs}=JSON.parse(fs.readFileSync(process.env.D6_AIC185_WORKER,'utf8')),g=vmHarness(),out=[];
 for(const job of jobs){const prepared=prepare(g,job);for(const on of [false,true]){const t=Date.now();const r=play(g,job,on,prepared);r.ms=Date.now()-t;delete r.state;process.stdout.write(JSON.stringify(r)+'\n');}}
}else if(require.main===module){
 const label=arg('label','rp'),workers=+arg('workers','6'),only=arg('only','a,b-fav,b-out,c,p').split(','),limit=+arg('limit','0');
 const g=vmHarness(),{jobs:all,worlds}=plan(g),jobs=all.filter(j=>only.includes(j.set)).slice(0,limit||undefined);
 const dir=path.join(root,'outputs/ai-coach-v185');fs.mkdirSync(dir,{recursive:true});
 console.log(JSON.stringify({label,jobs:jobs.length,sets:Object.fromEntries(only.map(s=>[s,jobs.filter(j=>j.set===s).length])),workers}));
 const rows=[];let done=0,running=0;const t0=Date.now();
 const chunks=Array.from({length:workers},(_,w)=>jobs.filter((_,i)=>i%workers===w)).filter(x=>x.length);
 const finish=()=>{rows.sort((x,y)=>x.id.localeCompare(y.id)||Number(x.on)-Number(y.on));fs.writeFileSync(path.join(dir,label+'.json'),JSON.stringify({label,date:new Date().toISOString(),worlds,jobs:jobs.length,rows}));console.log(JSON.stringify({out:path.join(dir,label+'.json'),rows:rows.length,minutes:+((Date.now()-t0)/60000).toFixed(1)}));};
 for(const [w,chunk] of chunks.entries()){
  const file=path.join(dir,`${label}-w${w}.jobs.json`);fs.writeFileSync(file,JSON.stringify({jobs:chunk}));running++;
  const child=cp.spawn(process.execPath,[__filename],{cwd:root,env:{...process.env,D6_AIC185_WORKER:file}});let buf='',err='';
  child.stdout.on('data',d=>{buf+=d;let i;while((i=buf.indexOf('\n'))>=0){const r=JSON.parse(buf.slice(0,i));buf=buf.slice(i+1);rows.push(r);done++;if(done%20===0||!r.finished)console.log(`${done}/${jobs.length*2} ${r.id} ${r.on?'on':'off'} ${r.teams[0].score}:${r.teams[1].score} ${r.ms}ms${r.finished?'':' UNFINISHED'}`);}});
  child.stderr.on('data',d=>err+=d);
  child.on('close',code=>{if(code)console.error(`worker ${w} exit ${code}\n${err.slice(-2000)}`);fs.rmSync(file,{force:true});if(--running===0)finish();});
 }
}
module.exports={vmHarness,careerFor,prepare,play,NAMED};
