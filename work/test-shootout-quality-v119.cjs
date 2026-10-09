'use strict';
// Pure native production functions; Node 20+, no browser or test-only model.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const paths=['dist/world-competition-v62.js','dist/penalties-v42.js','dist/world-foundation-v61.js'];
const sources=paths.map(path=>fs.readFileSync(path,'utf8')),checks=[];
const ctx=vm.createContext({clamp:(value,low,high)=>Math.max(low,Math.min(high,value)),structuredClone,v41PenaltyChance:null,v64SimulateFixture:()=>({homeGoals:0,awayGoals:0,penalties:null})});
vm.runInContext(sources[1].slice(sources[1].indexOf('function v42Composure('),sources[1].indexOf('function v42OrderHTML(')),ctx);
vm.runInContext(sources[2].slice(sources[2].indexOf('function v61Random('),sources[2].indexOf('const v61SkinTones')),ctx);
vm.runInContext(sources[0].slice(sources[0].indexOf('function v62Score('),sources[0].indexOf('function v62CupProgress(')),ctx);
const plain=value=>JSON.parse(JSON.stringify(value));
function check(name,fn){fn();checks.push(name);}
function setup(seed='shootout119',size=6){
 const club=id=>({id,roster:Array.from({length:size+2},(_,i)=>({pid:id+'-'+i,n:i+1,name:id+' '+i,keeper:i===0,line:i===0?'gk':'att',fin:i===0?8:12,pas:12,gk:12,composure:12,form:0,fresh:70,age:25}))});
 const career={world:{seed,clubs:[club('home'),club('away')]}};
 const fixture={id:'future-final',homeId:'home',awayId:'away',round:'F',result:{homeGoals:0,awayGoals:0,penalties:null},plan:{home:{starters:career.world.clubs[0].roster.slice(0,size).map(p=>p.pid)},away:{starters:career.world.clubs[1].roster.slice(0,size).map(p=>p.pid)}}};
 fixture.matchRecord={starters:plain({home:fixture.plan.home.starters,away:fixture.plan.away.starters}),substitutions:[]};
 return {career,fixture};
}
check('Uses actual full-time lineup including keeper swaps, excludes unused bench and departed starters',()=>{
 const {career,fixture}=setup();career.world.clubs[0].roster[6].keeper=true;
 fixture.matchRecord.substitutions=[{side:0,outPid:'home-1',inPid:'home-7'},{side:0,outPid:'home-0',inPid:'home-6'}];
 const ids=ctx.v119ShootoutSquad(career,fixture,0).map(p=>p.pid);
 assert(ids.includes('home-7')&&ids.includes('home-6'));assert(!ids.includes('home-1')&&!ids.includes('home-0'));assert.equal(ids.length,6);
});
check('Existing helper governs shooter, keeper, composure, form and freshness without modifying saved roster',()=>{
 const {career,fixture}=setup(),before=JSON.stringify(career),squad=ctx.v119ShootoutSquad(career,fixture,0),shooter=squad.find(p=>!p.keeper),keeper=ctx.v119ShootoutSquad(career,fixture,1).find(p=>p.keeper);
 const p=(s,k=keeper)=>ctx.v42PenaltyChance(s,k),base=p(shooter);
 assert(p({...shooter,fin:18})>base);assert(p({...shooter,fin:6})<base);
 assert(p(shooter,{...keeper,gk:18})<base);assert(p(shooter,{...keeper,gk:6})>base);
 assert(p({...shooter,composure:18})>base);assert(p(shooter,{...keeper,composure:18})<base);
 assert(p({...shooter,form:2})>base);assert(p({...shooter,fresh:100})>base);
 assert.equal(JSON.stringify(career),before);
});
check('Missing historical composure is derived on independent copies only',()=>{
 const {career,fixture}=setup();for(const club of career.world.clubs)for(const p of club.roster)delete p.composure;
 const before=JSON.stringify(career);ctx.v119SimulateShootout(career,fixture);assert.equal(JSON.stringify(career),before);
});
check('Actual saved calm influences both shared chance and copied world squad; missing calm retains legacy composure',()=>{
 const {career,fixture}=setup(),home=career.world.clubs[0].roster[1],away=career.world.clubs[1].roster[0];home.calm=18;away.calm=6;
 const before=JSON.stringify(career),shooter=ctx.v119ShootoutSquad(career,fixture,0).find(p=>p.pid===home.pid),keeper=ctx.v119ShootoutSquad(career,fixture,1).find(p=>p.keeper);
 assert.equal(shooter.composure,18);assert.equal(keeper.composure,6);assert.equal(ctx.v42Composure({...home,composure:3}),18);
 const high=ctx.v42PenaltyChance(shooter,keeper),low=ctx.v42PenaltyChance({...shooter,composure:6},keeper);assert(high>low);
 assert.equal(ctx.v42Composure({composure:12}),12);assert.equal(ctx.v42Composure({composure:12,calm:undefined}),12);assert.equal(JSON.stringify(career),before);
});
check('Replay and actual JSON continuation are deterministic for six and seven players',()=>{
 for(const size of [6,7]){const {career,fixture}=setup('json-'+size,size),first=plain(ctx.v119SimulateShootout(career,fixture));
  assert.deepEqual(plain(ctx.v119SimulateShootout(career,fixture)),first);assert.deepEqual(plain(ctx.v119SimulateShootout(plain(career),plain(fixture))),first);
  assert.notEqual(first.score[0],first.score[1]);assert(first.kicks.length<=212);
 }
});
check('Five rounds stop at an actual early clinch, not after a synthetic score draw',()=>{
 const original=ctx.v61Random;ctx.v61Random=()=>{let n=0;return()=>n++%2===0?0:.999;};
 try{const {career,fixture}=setup(),result=ctx.v119SimulateShootout(career,fixture);assert.deepEqual(plain(result.score),[3,0]);assert.equal(result.kicks.length,6);assert.equal(result.conditioned,false);}finally{ctx.v61Random=original;}
});
check('Sudden death evaluates paired real kicks and rotates all actual players',()=>{
 const original=ctx.v61Random;ctx.v61Random=()=>{let n=0;return()=>n++===11?.999:0;};
 try{const {career,fixture}=setup(),result=ctx.v119SimulateShootout(career,fixture);assert.deepEqual(plain(result.score),[6,5]);assert.equal(result.kicks.length,12);assert(result.kicks.some(k=>k.pid==='home-0'));}finally{ctx.v61Random=original;}
});
check('Pathological identical outcomes terminate in a symmetric conditional deciding pair',()=>{
 const original=ctx.v61Random;ctx.v61Random=()=>()=>0;
 try{const {career,fixture}=setup(),result=ctx.v119SimulateShootout(career,fixture);assert.equal(result.kicks.length,212);assert.equal(result.conditioned,true);assert.equal(result.score[0]-result.score[1],1);assert.equal(result.kicks.at(-2).goal,true);assert.equal(result.kicks.at(-1).goal,false);}finally{ctx.v61Random=original;}
 ctx.v61Random=()=>()=>.999;
 try{const {career,fixture}=setup(),result=ctx.v119SimulateShootout(career,fixture);assert.equal(result.kicks.length,212);assert.equal(result.conditioned,true);assert.equal(result.score[1]-result.score[0],1);assert.equal(result.kicks.at(-2).goal,false);assert.equal(result.kicks.at(-1).goal,true);}finally{ctx.v61Random=original;}
});
check('Both single final and second-leg aggregate routes use the same ability-aware shootout',()=>{
 for(const route of ['single','second']){const {career,fixture}=setup(route);const expected=plain(ctx.v119SimulateShootout(career,fixture).score);
  if(route==='single')ctx.v62ResolveSingle(career,fixture);else{fixture.leg=2;fixture.pair=0;fixture.round='QF';ctx.v62ResolveSecondLeg(career,fixture,{fixtures:[{pair:0,round:'QF',leg:1,result:{homeGoals:0,awayGoals:0}}]});}
  assert.deepEqual(plain(fixture.result.penalties),expected);assert.equal(fixture.result.winnerId,expected[0]>expected[1]?'home':'away');
 }
});
check('Previously booked and visible human shootout scores are preserved byte for byte',()=>{
 for(const route of ['single','second']){const {career,fixture}=setup();fixture.result.penalties=[4,3];delete fixture.plan;delete fixture.matchRecord;career.world.clubs=[];
  if(route==='single')ctx.v62ResolveSingle(career,fixture);else{fixture.leg=2;fixture.pair=0;ctx.v62ResolveSecondLeg(career,fixture,{fixtures:[{pair:0,round:'F',leg:1,result:{homeGoals:0,awayGoals:0}}]});}
  assert.deepEqual(plain(fixture.result.penalties),[4,3]);assert.equal(fixture.result.winnerId,'home');
 }
});
check('Untied regulation and aggregate outcomes do not request a shootout roster',()=>{
 const {career,fixture}=setup();career.world.clubs=[];fixture.result.homeGoals=1;ctx.v62ResolveSingle(career,fixture);assert.equal(fixture.result.penalties,null);assert.equal(fixture.result.winnerId,'home');
 fixture.leg=2;fixture.pair=0;fixture.result.homeGoals=0;ctx.v62ResolveSecondLeg(career,fixture,{fixtures:[{pair:0,round:'F',leg:1,result:{homeGoals:0,awayGoals:1}}]});assert.equal(fixture.result.winnerId,'home');assert.equal(fixture.result.penalties,null);
});
const metrics={};
check('Seeded actual resolver rewards better shooters and penalizes better opposing keepers across 1000 seeds',()=>{
 for(const setting of ['weakShooter','strongShooter','weakKeeper','strongKeeper']){let goals=0,kicks=0,wins=0;
  for(let seed=0;seed<1000;seed++){const {career,fixture}=setup('ability-'+seed);
   if(setting.endsWith('Shooter'))for(const player of career.world.clubs[0].roster)player.fin=setting==='strongShooter'?18:6;
   else career.world.clubs[1].roster[0].gk=setting==='strongKeeper'?18:6;
   const simulation=ctx.v119SimulateShootout(career,fixture);for(const kick of simulation.kicks)if(kick.side===0){kicks++;goals+=Number(kick.goal);}
   ctx.v62ResolveSingle(career,fixture);assert.deepEqual(plain(fixture.result.penalties),plain(simulation.score));wins+=Number(fixture.result.winnerId==='home');
  }metrics[setting]={goals,kicks,rate:goals/kicks,wins};
 }
 assert(metrics.strongShooter.rate>metrics.weakShooter.rate+.2);assert(metrics.weakKeeper.rate>metrics.strongKeeper.rate+.12);
 assert(metrics.strongShooter.wins>metrics.weakShooter.wins+200);assert(metrics.weakKeeper.wins>metrics.strongKeeper.wins+100);
});
const output={pass:true,checks,metrics,hashes:Object.fromEntries(paths.map((path,index)=>[path,crypto.createHash('sha256').update(sources[index]).digest('hex')]))};
fs.mkdirSync('outputs/3d-quality/shootout-quality-v119',{recursive:true});fs.writeFileSync('outputs/3d-quality/shootout-quality-v119/native.json',JSON.stringify(output,null,2)+'\n');
process.stdout.write(JSON.stringify({pass:true,checks:checks.length,metrics})+'\n');
