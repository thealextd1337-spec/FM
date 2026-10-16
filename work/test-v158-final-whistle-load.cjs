'use strict';
// Player load (P02, v158) at the deferred final whistle (Bugliste B21).
// While the final whistle waits for a flight, the finance-v15 step sets
// match.elapsed back by one clock unit so the ball can land; an air duel at the
// landing used to be dated 1.2 virtual minutes before the played clock. A
// substitute who came on in that window then failed the freshness check
// ("actual event must occur within played virtual minutes") in v65Finish.
// Scene with the actual dist modules in the native VM harness:
//   substitution shortly before the end (v64QueueSubstitution,
//   v64ExecutePending, v65PhysicalSwap), high ball in the air at the final
//   whistle (v119DeferFinalWhistle), air duel of the substitute at the landing,
//   then the final whistle with the load statement of v65Finish. The parts of
//   world-physical-v65.js outside the harness run verbatim.
// Runs without marker 183 (old path) and with the SI default, both pitch
// sizes; the legacy dating replays the RangeError in the same scene.
// Usage: node work/test-v158-final-whistle-load.cjs
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {create}=require('./native183-scenes.cjs'),{root}=require('./native130-harness.cjs');
const physical=fs.readFileSync(path.join(root,'dist/world-physical-v65.js'),'utf8');
const slice=(from,to)=>{const a=physical.indexOf(from),b=physical.indexOf(to,a);assert(a>=0&&b>a,'world-physical-v65 boundary '+from);return physical.slice(a,b);};
// v65PhysicalSwap is not part of the VM harness (UI part of world-physical-v65); its source runs verbatim.
const SWAP=slice('function v65PhysicalSwap(','function v65SwapInfoHTML(');
const DEFER=slice('function v119DeferFinalWhistle(','function v65FulltimeTitle(');
const FINISH_LOAD="if(context.state.playerLoad){v158EndNative(match);v158RecoverMatch(context.career,context.fixture,context.state,'final-whistle');}";
assert.equal(physical.split(FINISH_LOAD).length,2,'v65Finish load statement');
const LEGACY='function v158ActionMinute(current){return Math.max(0,current.elapsed*90/75);}';
let checks=0;const check=(name,fn)=>{fn();checks++;console.log('PASS '+name);};

function inContext(){
 const clean=m=>!m.flight&&!m.setPiece&&!m.throwIn&&!m.kickoff&&!m.slide&&!(m.goalPause>0)&&!(m.countdown>0)&&!m.postBanner;
 const place=(p,at)=>{p.x=p.tx=at.x;p.y=p.ty=at.y;};
 // Native183.constructed with the P02 load model switched on before the match
 // state exists (production order: v64MakeState -> v158Initialize).
 function constructed({club,seed,size,si}){
  let h=0;for(const ch of `${club}:${seed}:${size}`)h=(Math.imul(h,31)+ch.charCodeAt(0))>>>0;
  Native182.seedRandom(h||1);
  const career=v61CreateCareer(club,`native183-${seed}`);career.world.matchConfig={version:1,fieldSize:size,fieldPlayers:size==='large'?6:5};
  const fixture=v62Fixtures(career).find(f=>f.homeId===club||f.awayId===club);v64PrepareFixture(career,fixture);
  const foundation=career.world.playerFoundation||(career.world.playerFoundation={});foundation.loadParameters=D6LoadCandidate.createParameters();
  // v61 careers carry only the old skills (v183Personality falls back to 10); the P02 form context needs every skill key.
  for(const side of [0,1])for(const p of v64Side(career,fixture,side)){for(const k of D6PlayerGeneration.SKILL_KEYS)p[k]??=10;p.playerModel??={};v158Generate(p,foundation);}
  const state=v64MakeState(career,fixture);career.world.activeMatch={fixtureId:fixture.id,state};
  if(!state.playerLoad)throw Error('P02 load model not active');
  v61CurrentCareer=career;v65WorldActive={career,fixture,state,ownSide:fixture.homeId===club?0:1};state.phase='live';
  v65CreateMatch(v65WorldActive,si===undefined?undefined:{si});
  return match;
 }
 // Records every queued load action with the clock it saw.
 function observe(){
  const seen=[],base=v158QueueAction;
  v158QueueAction=function(career,fixture,state,player,type,causeId,minute,units){
   seen.push({pid:player.pid,type,minute,elapsed:match.elapsed,pending:!!match.fulltimePending,fullTimeEnd:match.fullTimeEnd||75});
   return base.apply(this,arguments);};
  return {seen,restore(){v158QueueAction=base;}};
 }
 function scene({club,seed,size,si,before=.6,distance=26}){
  constructed({club,seed,size,si});
  const ctx=v65WorldActive,m=match,end=()=>m.fullTimeEnd||75;
  // Ball in play after the kickoff, then a quiet moment late in the second half.
  Native183.run(200);for(let i=0;i<400&&!clean(m);i++)Native183.advance();
  if(!clean(m))throw Error('no quiet moment for the scene');
  m.halftimeBreakDone=true;m.elapsed=end()-before;Native183.advance();
  // Substitution (own side, physical team 0) in the order of v65AfterStep: queue, execute, physical swap.
  const side=ctx.ownSide,out=m.people.find(p=>p.t===0&&!p.keeper&&p!==m.owner);
  const inPid=v64Bench(ctx.state,side).find(pid=>!v64Player(ctx.career,ctx.fixture,side,pid).keeper);
  v64QueueSubstitution(ctx.career,ctx.fixture,ctx.state,side,out.pid,inPid);
  for(const change of v64ExecutePending(ctx.career,ctx.fixture,ctx.state,'Spielunterbrechung'))v65PhysicalSwap(ctx,change);
  const sub=m.people.find(p=>p.pid===inPid),entry=sub.matchEntryElapsed*90/75;
  Native183.advance();
  // High ball in the own half (no offside, no danger): passer -> substitute, one rival on the landing point.
  const passer=m.people.find(p=>p.t===0&&!p.keeper&&p!==sub),rival=m.people.find(p=>p.t===1&&!p.keeper);
  const mx=(v55Field.right-v55Field.left)/v160PitchWidth(),my=(v55Field.bottom-v55Field.top)/v160PitchLength();
  const from={x:.32,y:.86},to={x:from.x+distance*.45*mx,y:from.y-distance*.89*my};
  for(const p of m.people)if(p!==passer&&p!==sub&&p!==rival&&!p.keeper)place(p,{x:p.t===0?.15:.85,y:p.t===0?.95:.55});
  place(passer,from);place(sub,to);place(rival,to);
  m.owner=passer;m.ball={x:from.x,y:from.y};m.lastPass=null;m.lastTouch=0;
  // The passer faces the substitute, so no v157 turn is queued before the release.
  const s=v150Scale();v157Body(passer).heading=Math.atan2((to.x-from.x)*s.x,(to.y-from.y)*s.y);
  v55HighPass(passer,sub);
  for(let i=0;i<80&&!m.flight;i++){place(sub,to);place(rival,to);Native183.advance();}
  if(!m.flight?.aerial)throw Error('high ball not played');
  // Final whistle while the ball is in the air.
  m.elapsed=Math.max(m.elapsed,end()-.01);
  const log=observe();let whistle=null,ticks=0,error=null;
  try{
   while(!m.finished&&ticks++<600){
    const target=m.flight?.target;if(target){place(sub,target);place(rival,target);}
    Native183.advance();
    if(m.fulltimePending&&whistle===null)whistle={flight:!!m.flight,elapsed:m.elapsed};
   }
  }catch(e){error={name:e.name,message:e.message};}finally{log.restore();}
  const duel=log.seen.filter(e=>e.pid===sub.pid&&e.type==='intense-duel');
  const result={entry,whistle,end:end(),duel,ticks,finished:!!m.finished,error};
  const ledger=ctx.state.playerLoad.players[sub.pid].ledger.fixtures.find(f=>f.id===ctx.fixture.id);
  result.ranges=ledger?ledger.minuteRanges.map(r=>[r.startMinute,r.endMinute]):[];result.events=ledger?ledger.events.length:0;
  return JSON.stringify(result);
 }
 // Ordinary play: dating outside the deferred whistle is the legacy expression, bit for bit.
 // 1800 ticks: the SI default scene queued only 3 actions in 900 ticks at clock rate .385 (guard below needs >= 4).
 function ordinary({club,seed,size,si,ticks=1800}){
  constructed({club,seed,size,si});
  const log=observe();try{Native183.run(ticks);}finally{log.restore();}
  return JSON.stringify(log.seen.map(e=>({type:e.type,pending:e.pending,same:e.minute===Math.max(0,e.elapsed*90/75)})));
 }
 globalThis.V158Final={scene,ordinary};
}

function harness(legacy){
 const h=create({view:false});
 h.run(SWAP,'world-physical-v65.js#v65PhysicalSwap');
 h.run(DEFER,'world-physical-v65.js#v119DeferFinalWhistle');
 // v65Finish without its report/UI part: deferral, the verbatim load statement, end of the match.
 h.run(`finishMatch=function(){if(v119DeferFinalWhistle(match))return;const context=v65WorldActive;if(!context||match.finished)return;${FINISH_LOAD}match.finished=true;match.flight=null;};`,'world-physical-v65.js#v65Finish-load');
 if(legacy)h.run(LEGACY,'legacy-v158-dating');
 h.run('('+inContext.toString()+')()','v158-final-scene');
 return h;
}
const SCENES=[];
for(const size of ['large','standard'])for(const [club,seed,si] of [['POR-6','b',false],['GER-2','a',undefined],['ENG-4','c',false],['ESP-1','d',undefined]])SCENES.push({club,seed,size,si});
const run=(h,scene)=>JSON.parse(h.evaluate(`V158Final.scene(${JSON.stringify(scene)})`));
const label=s=>`${s.club}/${s.size}/${s.si===false?'ohne SI':'SI-Vorgabe'}`;

const current=harness(false),legacy=harness(true);
const found=[];
check('scene: substitute on shortly before the end, air duel at the landing after the deferred final whistle',()=>{
 for(const scene of SCENES){
  const r=run(current,scene);found.push([scene,r]);
  assert(r.whistle&&r.whistle.flight,`${label(scene)}: final whistle deferred with the ball in the air`);
  // The landing duel is queued while the step has set the clock back (elapsed fullTimeEnd - 1 + delta).
  r.landing=r.duel.filter(d=>d.pending&&d.elapsed<d.fullTimeEnd-.5);
  assert.equal(r.landing.length,1,`${label(scene)}: one air duel of the substitute at the landing, clock set back`);
  const d=r.landing[0];
  assert(d.elapsed*90/75<r.entry,`${label(scene)}: the set-back clock lies before the substitution (precondition of B21)`);
 }
});
check('fixed dating: the duel stands at the played clock (fullTimeEnd - .001) and v65Finish completes the load',()=>{
 for(const [scene,r] of found){
  const d=r.landing[0];
  assert.equal(d.minute,Math.max(0,(d.fullTimeEnd-.001)*90/75),`${label(scene)}: minute of the played clock`);
  assert(d.minute>=r.entry,`${label(scene)}: duel after the substitution`);
  assert.equal(r.error,null,`${label(scene)}: ${JSON.stringify(r.error)}`);
  assert(r.finished&&r.events>=1,`${label(scene)}: match finished, ledger records the duel`);
  for(const e of r.duel)assert(r.ranges.some(([a,b])=>e.minute>=a&&e.minute<=b),`${label(scene)}: duel ${e.minute} inside the played minutes`);
 }
});
check('legacy dating replays the abort (RangeError in v65Finish) in the same scenes',()=>{
 for(const scene of SCENES){
  const r=run(legacy,scene);
  assert.deepEqual(r.error,{name:'RangeError',message:'actual event must occur within played virtual minutes'},label(scene));
 }
});
check('ordinary play: every action outside the deferred whistle keeps the legacy minute exactly',()=>{
 for(const [scene,si] of [[{club:'GER-2',seed:'o1',size:'large'},false],[{club:'ESP-1',seed:'o2',size:'standard'},undefined]]){
  const seen=JSON.parse(current.evaluate(`V158Final.ordinary(${JSON.stringify({...scene,si})})`));
  assert(seen.length>=4,'actions queued: '+seen.length);
  assert(seen.every(e=>!e.pending&&e.same),JSON.stringify(seen.filter(e=>e.pending||!e.same).slice(0,3)));
 }
});
console.log(`OK ${checks} checks (v158 final-whistle load, B21)`);
