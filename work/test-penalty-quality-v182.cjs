'use strict';
// B09: penalty and shootout quality. Uses the actual dist functions in Node
// (no retyped model): grid by colour band, real generated squads, old vs. new.
// Old = unmarked path (unchanged), new = penaltyRevision 182.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {harness}=require(path.resolve('work/youth-native-harness-v176.cjs'));
const {call,evaluate,context:g}=harness(),read=f=>fs.readFileSync('dist/'+f,'utf8');
const slice=(file,from,to)=>{const s=read(file),a=s.indexOf(from),b=s.indexOf(to,a);assert(a>=0&&b>a,`${file}: ${from}`);return s.slice(a,b);};
// Played shootout step and in-match penalty. Only UI transport is inert.
Object.assign(g,{v42Session:null,v42Save:()=>{},v42RenderScreen:()=>{},v42SettleCareer:()=>{},v50PenaltyVisual:()=>{},note:()=>{},escapeHTML:String,v65WorldActive:null});
evaluate(slice('penalties-v42.js','function v42NextKick(','function v42SettleCareer(').replace(/^function v42NextKick/,'globalThis.v42NextKick=function'));
evaluate(slice('penalties-v42.js','function v42OutcomeText(','function v42Shirt('));
evaluate(slice('set-pieces-v50.js','function v50TakePenalty(','function v50FinishPenalty('));
const checks=[],check=(name,fn)=>{fn();checks.push(name);};
let rngState=1,draws=0;const seed=s=>{let h=(s>>>0)^0x9e3779b9;h=Math.imul(h^h>>>16,0x45d9f3b);h=Math.imul(h^h>>>16,0x45d9f3b);rngState=(h^h>>>16)>>>0||1;draws=0;},lcg=()=>{draws++;rngState=(Math.imul(rngState,1664525)+1013904223)>>>0;return rngState/4294967296;};
const scripted=list=>{let i=0;return()=>{if(i>=list.length)throw Error('script exhausted');return list[i++];};};
const GOAL=[.1,0,.999,.5],MISS=[.1,.999,.999,.5],kicks=pattern=>pattern.flatMap(k=>k?GOAL:MISS);
const pct=x=>(100*x).toFixed(1);

// ---------- Rules ----------
check('v182ShootoutWinner: early decision within three kickers, then pairs',()=>{
 const w=(score,taken)=>g.v182ShootoutWinner(score,taken);
 assert.equal(w([2,0],[2,2]),0);assert.equal(w([0,2],[2,2]),1);assert.equal(w([2,0],[2,1]),null);assert.equal(w([1,0],[1,1]),null);
 assert.equal(w([3,1],[3,2]),0);assert.equal(w([2,1],[3,2]),null);assert.equal(w([1,3],[3,3]),1);assert.equal(w([3,3],[3,3]),null);
 assert.equal(w([3,2],[3,3]),0);assert.equal(w([4,3],[4,3]),null);assert.equal(w([4,3],[4,4]),0);assert.equal(w([4,4],[4,4]),null);assert.equal(w([3,4],[4,4]),1);
});
const ab=(fin,calm,extra={})=>({fin,calm,composure:calm,form:0,fresh:100,...extra});
function squad(prefix,{fin=12,calm=12,gk=12,size=6}={}){
 return Array.from({length:size},(_,i)=>({pid:`${prefix}-${i}`,n:i+1,name:`${prefix} ${i}`,keeper:i===size-1,line:i===size-1?'gk':'att',fin:i===size-1?Math.min(fin,4):fin,pas:12,calm,gk:i===size-1?gk:2,form:0,fresh:70,age:25}));
}
function playedSession(home,away,marker=true){
 const own=home.map(p=>g.v42Player(p)),opponent=away.map(p=>g.v42Player(p));
 return{mode:'world',own,opponent,order:g.v42Sorted(own).map(p=>p.n),opponentOrder:g.v42Sorted(opponent).map(p=>p.n),score:[0,0],kicks:[],phase:'shooting',...marker?{penaltyRevision:182}:{}};
}
function playShootout(session,random){const saved=Math.random;Math.random=random;try{g.v42Session=session;for(let i=0;i<400&&session.phase==='shooting';i++)g.v42NextKick();}finally{Math.random=saved;}return session;}
function compactSetup(home,away,id='future-final'){
 const club=(cid,roster)=>({id:cid,roster:roster.map(p=>({...p}))});
 const career={world:{seed:'v182',clubs:[club('home',home),club('away',away)]}};
 const fixture={id,homeId:'home',awayId:'away',round:'F',plan:{home:{starters:home.map(p=>p.pid)},away:{starters:away.map(p=>p.pid)}}};
 fixture.matchRecord={starters:{home:[...fixture.plan.home.starters],away:[...fixture.plan.away.starters]},substitutions:[]};
 return{career,fixture};
}
function compactWith(random,home,away){const base=g.v61Random;g.v61Random=()=>random;try{const {career,fixture}=compactSetup(home,away);return g.v182SimulateShootout(career,fixture);}finally{g.v61Random=base;}}
check('Played and compact shootouts end early at 2:0 after two pairs',()=>{
 const pattern=kicks([1,0,1,0]),s=playShootout(playedSession(squad('h'),squad('a')),scripted(pattern)),c=compactWith(scripted(pattern),squad('h'),squad('a'));
 assert.deepEqual(s.score,[2,0]);assert.equal(s.kicks.length,4);assert.equal(s.winner,0);assert.deepEqual(c.score,[2,0]);assert.equal(c.kicks.length,4);
});
check('Played and compact shootouts end early at 3:1 after the home third kick',()=>{
 const pattern=kicks([1,1,1,0,1]),s=playShootout(playedSession(squad('h'),squad('a')),scripted(pattern)),c=compactWith(scripted(pattern),squad('h'),squad('a'));
 assert.deepEqual(s.score,[3,1]);assert.equal(s.kicks.length,5);assert.deepEqual(c.score,[3,1]);assert.equal(c.kicks.length,5);
 const away=kicks([0,1,0,1]),t=playShootout(playedSession(squad('h'),squad('a')),scripted(away));assert.deepEqual(t.score,[0,2]);assert.equal(t.winner,1);assert.equal(t.kicks.length,4);
});
check('After 3:3 the shootout continues pair by pair (sudden death) and rotates shooters',()=>{
 const pattern=kicks([1,1,1,1,1,1,1,1,1,0]),s=playShootout(playedSession(squad('h'),squad('a')),scripted(pattern)),c=compactWith(scripted(pattern),squad('h'),squad('a'));
 assert.deepEqual(s.score,[5,4]);assert.equal(s.kicks.length,10);assert.deepEqual(c.score,[5,4]);assert.equal(c.kicks.length,10);
 const long=kicks(Array(16).fill(1).concat([0,1])),t=playShootout(playedSession(squad('h'),squad('a')),scripted(long));
 assert.deepEqual(t.score,[8,9]);assert.equal(t.winner,1);assert.equal(new Set(t.kicks.filter(k=>k.side===0).map(k=>k.number)).size,6);
 assert.equal(t.kicks[12].number,t.kicks[0].number,'the first shooter starts the second rotation');
});
check('Both paths apply identical rules to identical draws (500 seeded shootouts)',()=>{
 for(let s=1;s<=500;s++){
  const home=squad('h',{fin:4+s%15,calm:3+s%13,gk:5+s%11}),away=squad('a',{fin:5+s%12,calm:4+s%14,gk:3+s%15});
  seed(s);const played=playShootout(playedSession(home,away),lcg);seed(s);const compact=compactWith(lcg,home,away);
  assert.deepEqual(played.score,compact.score);assert.deepEqual(played.kicks.map(k=>k.goal),compact.kicks.map(k=>k.goal));assert.deepEqual(played.kicks.map(k=>k.outcome),compact.kicks.map(k=>k.outcome));
  assert.notEqual(played.score[0],played.score[1]);
 }
});
check('Unmarked played session keeps the former rule (no early end at 2:0 after two pairs)',()=>{
 seed(7);const s=playedSession(squad('h'),squad('a'),false);g.v42Session=s;const saved=Math.random;// Former draws: goal kick = chance, side; miss = chance, save, wide/high, side.
 Math.random=scripted([0,.1,.99,.99,.99,.99,0,.1,.99,.99,.99,.99]);
 try{for(let i=0;i<4;i++)g.v42NextKick();}finally{Math.random=saved;}
 assert.deepEqual(s.score,[2,0]);assert.equal(s.phase,'shooting');assert(!s.kicks.some(k=>'frame'in k));
});
check('Compact resolver: only a result created now uses 182 and is marked; saved results keep their path',()=>{
 const home=squad('h'),away=squad('a');
 let {career,fixture}=compactSetup(home,away);g.v62Score=()=>({homeGoals:1,awayGoals:1,penalties:null,winnerId:null});
 const expected=g.v182SimulateShootout(career,fixture).score;g.v62ResolveSingle(career,fixture);
 assert.equal(fixture.result.penaltyRevision,182);assert.deepEqual(fixture.result.penalties,expected);
 ({career,fixture}=compactSetup(home,away));fixture.result={homeGoals:0,awayGoals:0,penalties:null,winnerId:null};
 const legacy=g.v119SimulateShootout(career,fixture).score;g.v62ResolveSingle(career,fixture);
 assert.deepEqual(fixture.result.penalties,legacy);assert(!('penaltyRevision'in fixture.result));
 ({career,fixture}=compactSetup(home,away));fixture.leg=2;fixture.pair=0;fixture.round='QF';
 g.v62ResolveSecondLeg(career,fixture,{fixtures:[{pair:0,round:'QF',leg:1,result:{homeGoals:1,awayGoals:1}}]});
 assert.equal(fixture.result.penaltyRevision,182);assert.deepEqual(fixture.result.penalties,g.v182SimulateShootout(career,fixture).score);
 ({career,fixture}=compactSetup(home,away));fixture.result={homeGoals:2,awayGoals:2,penalties:[4,3],winnerId:null};g.v62ResolveSingle(career,fixture);assert.deepEqual(fixture.result.penalties,[4,3]);assert(!('penaltyRevision'in fixture.result));
});
check('Compact 182 shootout is deterministic and survives JSON continuation',()=>{
 const {career,fixture}=compactSetup(squad('h',{fin:7,calm:6,gk:8}),squad('a',{fin:9,calm:8,gk:6})),first=JSON.stringify(g.v182SimulateShootout(career,fixture));
 assert.equal(JSON.stringify(g.v182SimulateShootout(JSON.parse(JSON.stringify(career)),JSON.parse(JSON.stringify(fixture)))),first);
});
check('Outcome consistency: four draws, save only on the guessed side, woodwork only on misses',()=>{
 const shooter=ab(9,8),keeper={gk:9,calm:9,composure:9};
 for(let s=1;s<=4000;s++){seed(s);const r=g.v182PenaltyOutcome(shooter,keeper,lcg);assert.equal(draws,4);
  if(r.outcome==='save')assert.equal(r.diveSide,r.shotSide);if(r.frame)assert(!r.goal&&(r.frame==='post'?r.outcome==='wide':r.outcome==='high'));
  assert.equal(r.goal,r.outcome==='goal');assert([-1,1].includes(r.shotSide)&&[-1,1].includes(r.diveSide));}
 assert.equal(g.v42OutcomeText({frame:'post',outcome:'wide'}),'Pfosten!');assert.equal(g.v42OutcomeText({frame:'bar',outcome:'high'}),'Latte!');assert.equal(g.v42OutcomeText({outcome:'wide'}),'Vorbei!');
});
// In-match penalty: unmarked matches keep the old draws, marked use 182.
function inMatch(marker,shooter,keeper,s){
 const setPiece={team:0,taker:{n:9,name:'S',pid:'s',...shooter},phase:'waiting'};
 g.match=marker?{penaltyRevision:182}:{};g.v50Keeper=()=>({n:1,name:'K',pid:'k',keeper:true,...keeper});g.random=lcg;seed(s);g.v50TakePenalty(setPiece);return{...setPiece,draws};
}
check('In-match penalty: marker selects 182 (four draws), unmarked keeps the former path',()=>{
 const shooter=ab(10,9),keeper={gk:10,calm:10,composure:10};
 for(let s=1;s<=300;s++){const a=inMatch(true,shooter,keeper,s);seed(s);const r=g.v182PenaltyOutcome(g.v42Player({n:9,name:'S',pid:'s',...shooter}),g.v42Player({n:1,name:'K',pid:'k',keeper:true,...keeper}),lcg);
  assert.equal(a.draws,4);assert.equal(a.outcome,r.outcome);assert.equal(a.shotSide,r.shotSide);assert.equal(a.diveSide,r.diveSide);
  const b=inMatch(false,shooter,keeper,s);seed(s);const goal=lcg()<g.v42PenaltyChance(g.v42Player({...shooter}),g.v42Player({keeper:true,...keeper}));assert.equal(b.outcome==='goal',goal);assert(!('frame'in b));}
});

// ---------- Review round 1: preview, bound, woodwork picture, English texts ----------
evaluate(slice('penalties-v42.js','function v42UpcomingShooter(','function v42OutcomeText('));
evaluate(slice('set-pieces-v50.js','function v50FinishPenalty(','const v50BaseKickoff=').replace(/^function v50FinishPenalty/,'globalThis.v50FinishPenalty=function'));
evaluate(slice('world-pitch-actions-v99.js','function v182PenaltyFramePoint(','function v100PenaltyWidePoint('));
const squadOf=(prefix,size)=>squad(prefix,{size}).map((p,i)=>({...p,keeper:i===size-1,fin:i===size-1?3:12-i*.1}));
check('Seven shooters: marked preview and kick agree on the seventh, unmarked preview keeps the former rotation',()=>{
 const unmarked=playedSession(squadOf('h',7),squadOf('a',7),false);
 // The 13th kick (home, seventh shooter) is announced and then taken by the same player.
 const s=playedSession(squadOf('h',7),squadOf('a',7));const saved=Math.random;Math.random=scripted(kicks(Array(13).fill(1)));
 try{g.v42Session=s;for(let i=0;i<12;i++)g.v42NextKick();const announced=g.v42UpcomingShooter(s).player.n;g.v42NextKick();assert.equal(s.kicks.at(-1).number,announced);assert.equal(announced,s.order[6]);assert.equal(new Set(s.kicks.filter(k=>k.side===0).map(k=>k.number)).size,7,'all seven own players shot once');}finally{Math.random=saved;}
 const old={...unmarked,kicks:Array.from({length:12},(_,i)=>({side:i%2,number:1,goal:true}))};assert.equal(g.v42UpcomingShooter(old).player.n,old.order[0],'former sessions keep the %6 announcement');
});
check('Both new paths share the bound: after 103 tied pairs one conditioned deciding pair',()=>{
 for(const homeDraw of [0,.999]){
  const pattern=kicks(Array(206).fill(1)).concat([homeDraw,.2,.7]);
  const s=playShootout(playedSession(squad('h'),squad('a')),scripted(pattern)),c=compactWith(scripted(pattern),squad('h'),squad('a'));
  assert.equal(s.kicks.length,208);assert.equal(c.kicks.length,208);assert.equal(c.conditioned,true);
  assert.deepEqual(s.score,c.score);assert.deepEqual(s.kicks.map(k=>[k.goal,k.outcome].join()),c.kicks.map(k=>[k.goal,k.outcome].join()));
  assert.equal(s.winner,homeDraw===0?0:1);assert.equal(Math.abs(s.score[0]-s.score[1]),1);
  const last=s.kicks.slice(-2);for(const k of last){if(k.outcome==='save')assert.equal(k.diveSide,k.shotSide);else assert.equal(k.diveSide,-k.shotSide);}
 }
});
check('Deciding pair resumes from the recorded home kick without transient state or a second winner draw',()=>{
 for(const homeDraw of [0,.999]){
  const s=playedSession(squad('h'),squad('a')),saved=Math.random;Math.random=scripted(kicks(Array(206).fill(1)).concat([homeDraw,.2]));
  try{g.v42Session=s;for(let i=0;i<207;i++)g.v42NextKick();}finally{Math.random=saved;}
  assert.equal(s.phase,'shooting');assert(!('decidingHome'in s));
  const restored=JSON.parse(JSON.stringify(s)),before=s.kicks.at(-1).goal;playShootout(restored,scripted([.7]));
  assert.equal(restored.kicks.length,208);assert.equal(restored.kicks.at(-1).goal,!before);assert.equal(restored.winner,homeDraw===0?0:1);
 }
});
check('Woodwork picture: contact at the post/crossbar of the drawn goal, then a visible rebound',()=>{
 for(const [w,h] of [[570,300],[360,260],[700,310]])for(const side of [-1,1]){
  const post=Math.min(w*.36,180),edge=w/2+side*post,at=q=>g.v182PenaltyFramePoint(q,side,'post',w,h),bar=q=>g.v182PenaltyFramePoint(q,side,'bar',w,h);
  assert(Math.abs(at(.55).left-edge)<=5,'post contact on the post');assert(at(.55).bottom>h-205&&at(.55).bottom<h-79-20,'post contact between ground and crossbar');
  assert(side*(at(1).left-edge)>20&&at(1).bottom<at(.55).bottom,'post rebound away from goal and down');
  assert(Math.abs(bar(.55).left-(w/2+side*64))<1&&bar(.55).bottom>h-79-35&&bar(.55).bottom<h-79,'crossbar contact under the bar');
  assert(bar(1).bottom>bar(.55).bottom,'crossbar rebound goes up');
  assert.deepEqual(at(0),{left:w/2,bottom:26,scale:1});
 }
 const css=read('penalties-v42.js'),world=read('world-pitch3d-v98.js'),v50=read('set-pieces-v50.js');
 for(const text of ['@keyframes v182BallPost','@keyframes v182BallBar','#v50-penalty-scene .v42-goal-scene .v42-ball.post','#v50-penalty-scene .v42-goal-scene .v42-ball.bar','v182FrameScene(v42Screen.querySelector('])assert(css.includes(text),text);
 assert(world.includes('v182PenaltyFramePoint(progress,match.setPiece.shotSide,frame'));assert(world.includes(':is(.post,.bar){animation:none!important}'));
 assert(v50.includes('if(last.frame&&match?.penaltyRevision===182&&typeof v182FrameScene===\'function\')v182FrameScene('));
});
check('English: outcome texts, punctuation-free list variants and dynamic report texts via the actual translator',()=>{
 const vm=require('node:vm'),src=read('i18n-v75.js'),tctx=vm.createContext({});vm.runInContext(src.slice(src.indexOf('const labels='),src.indexOf("let language='de'"))+';globalThis.translate=translate',tctx);const t=tctx.translate;
 const expected={'goal':'Goal!','save':'Saved!','wide':'Wide!','high':'Over!','post':'Post!','bar':'Crossbar!'};
 for(const [kind,english] of Object.entries(expected)){
  const kick=kind==='post'?{outcome:'wide',frame:'post'}:kind==='bar'?{outcome:'high',frame:'bar'}:{outcome:kind,goal:kind==='goal'};const text=g.v42OutcomeText(kick);
  assert.equal(t(text),english);assert.equal(t(text.replace(/[!.]/g,'')),english.replace(/[!.]/g,''));assert.equal(t(`Lea Kurz: ${text}`),`Lea Kurz: ${english}`);assert.equal(t(`Lea Kurz: ${text.replace(/[!.]/g,'')}`),`Lea Kurz: ${english.replace(/[!.]/g,'')}`);
 }
 assert.equal(t('Kein Tor.'),'No goal.');
 // Actual end-of-penalty report texts from v50FinishPenalty for every miss kind.
 const said=[];Object.assign(g,{v50ClearPenaltyScene:()=>{},hideOverlay:()=>{},v50GoalKick:(k,text)=>said.push(text),v50Goal:()=>{},v50Deflect:()=>{}});
 for(const [outcome,frame] of [['wide',null],['high',null],['wide','post'],['high','bar']]){
  g.match={setPiece:{},shots:[0,0]};const shooter={name:'Mila Berg',t:0,stats:{shots:0,onTarget:0}},keeper={name:'K',keeper:true,stats:{faced:0,saves:0}};g.v50Keeper=()=>keeper;
  g.v50FinishPenalty({team:0,taker:shooter,outcome,...frame?{frame}:{}});
 }
 assert.deepEqual(said,['Mila Berg schießt den Elfmeter vorbei. Abstoß.','Mila Berg schießt den Elfmeter über das Tor. Abstoß.','Mila Berg schießt den Elfmeter an den Pfosten. Abstoß.','Mila Berg schießt den Elfmeter an die Latte. Abstoß.']);
 assert.deepEqual(said.map(t),['Mila Berg puts the penalty wide. Goal kick.','Mila Berg puts the penalty over the bar. Goal kick.','Mila Berg hits the post with the penalty. Goal kick.','Mila Berg hits the crossbar with the penalty. Goal kick.']);
 assert.deepEqual(said.map(s=>t(s.replace(/\./g,''))),said.map(t).map(s=>s.replace(/\./g,'')));
});

check('Woodwork reaches the shared THREE/Unity picture, mirrors both ends, and leaves native state and RNG untouched',()=>{
 evaluate(slice('world-pitch-actions-v99.js','function v99BallView(','function v99PlayerAction('));
 evaluate(slice('world-pitch3d-v98.js','function v98PitchPoint(','// Unity-only pose projection.'));
 evaluate(slice('world-pitch3d-v98.js','function v98PitchFrame(','function v98HomeSponsor('));
 Object.assign(g,{v99Actions:new WeakMap(),v99Flights:new WeakMap(),v115OffsideBalls:new WeakMap(),v119VisibleGoalView:()=>null,v119VisibleShotBall:()=>null,v55Field:{left:28/600,right:572/600,top:26/740,bottom:714/740},v160PitchWidth:m=>m.geometry.width,v160PitchLength:m=>m.geometry.length,v102Clock:()=>0});
 const saved=Math.random;Math.random=()=>{throw Error('picture consumed native randomness')};
 try{for(const geometry of [{width:44,length:68,goalWidth:9.705882352941176,goalHeight:3.2352941176470584},{width:32,length:48,goalWidth:7.32,goalHeight:2.44}])for(const team of [0,1])for(const shotSide of [-1,1])for(const frame of ['post','bar'])for(const turned of [false,true]){
  const line=team===0?g.v55Field.top:g.v55Field.bottom,direction=team===0?-1:1;
  const m={penaltyRevision:182,geometry,people:[],ball:{x:.5,y:line-direction*.12},setPiece:{type:'penalty',phase:'result',frame,team,shotSide,spot:{x:.5,y:line-direction*.12},wait:2.15-.9*.55},halftimeBreakDone:turned};
  const before=JSON.stringify(m),p=g.v99BallView(m);assert(p,'marked woodwork has a visible ball');
  const sx=geometry.width/(g.v55Field.right-g.v55Field.left),sy=geometry.length/(g.v55Field.bottom-g.v55Field.top),radius=.1764;
  assert(Math.abs((p.y-line)*sy+direction*radius)<1e-8,'contact at front face of goal');
  if(frame==='post')assert(Math.abs((p.x-.5)*sx-shotSide*(geometry.goalWidth/2-radius))<1e-8,'post contact');
  else assert(Math.abs(p.elevation-(geometry.goalHeight-radius))<1e-8,'crossbar contact');
  const projected=g.v98PitchFrame(m).ball,expected=g.v98PitchPoint(p,turned);assert(Math.abs(projected.x-expected.x)<1e-8);assert(Math.abs(projected.z-expected.z)<1e-8);assert.equal(projected.height,p.elevation);assert.equal(JSON.stringify(m),before);
  m.setPiece.wait=1.25;const rebound=g.v99BallView(m);assert(direction*(rebound.y-line)>0,'miss rebounds behind goal');assert(frame==='post'?shotSide*(rebound.x-.5)*sx>geometry.goalWidth/2:rebound.elevation>geometry.goalHeight,'rebound clears the frame');
  delete m.penaltyRevision;assert.equal(g.v99BallView(m),null,'old picture remains unchanged even with an unrelated frame field');
 }}finally{Math.random=saved;}
});

// ---------- Measurement ----------
const N=20000,bands=[['1–7',4],['8–10',9],['11–13',12],['14–16',15],['17–20',18.5]];
function newDist(shooter,keeper,n=N,s0=1){const out={goal:0,save:0,wide:0,high:0,post:0,bar:0};seed(s0);for(let i=0;i<n;i++){const r=g.v182PenaltyOutcome(shooter,keeper,lcg);if(r.frame)out[r.frame]++;else out[r.outcome]++;}for(const k in out)out[k]/=n;return out;}
function oldInMatch(shooter,keeper){const p=g.v42PenaltyChance(shooter,keeper),m=1-p;return{goal:p,save:m*.45,wide:m*.275,high:m*.275,post:0,bar:0};}
function oldPlayed(shooter,keeper){const p=g.v42PenaltyChance(shooter,keeper),m=1-p,save=Math.max(.2,Math.min(.75,.45+((keeper.gk??14)-12)*.02+(g.v42Composure(keeper)-12)*.01-((shooter.fin??12)-12)*.005));return{goal:p,save:m*save,wide:m*(1-save)/2,high:m*(1-save)/2,post:0,bar:0};}
const grid=[];
for(const fresh of [100,65])for(const [sb,sv] of bands)for(const [kb,kv] of bands){
 const shooter=ab(sv,sv,{fresh}),keeper={gk:kv,calm:kv,composure:kv};
 grid.push({fresh,shooter:sb,keeper:kb,old:{inMatch:oldInMatch(shooter,keeper),played:oldPlayed(shooter,keeper)},new:newDist(shooter,keeper,N/4)});
}
// Separate fin / calm / keeper-calm sweeps around the scale middle.
const sweeps={};
for(const [key,make] of [['fin',v=>[ab(v,12),{gk:12,calm:12,composure:12}]],['calm',v=>[ab(12,v),{gk:12,calm:12,composure:12}]],['gk',v=>[ab(12,12),{gk:v,calm:12,composure:12}]],['kcalm',v=>[ab(12,12),{gk:12,calm:v,composure:v}]]])
 sweeps[key]=bands.map(([b,v])=>{const [s,k]=make(v);return{band:b,old:g.v42PenaltyChance(s,k),new:g.v182PenaltyGoalChance(s,k)};});
const middle=grid.find(r=>r.fresh===100&&r.shooter==='11–13'&&r.keeper==='11–13'),weak=grid.find(r=>r.fresh===100&&r.shooter==='1–7'&&r.keeper==='11–13'),strong=grid.find(r=>r.fresh===100&&r.shooter==='17–20'&&r.keeper==='11–13');
check('Calibration: middle band about three quarters, moderate 15–20 point band spread, keeper-shooters do not collapse',()=>{
 assert(middle.new.goal>.70&&middle.new.goal<.80,pct(middle.new.goal));
 const spread=strong.new.goal-weak.new.goal;assert(spread>.13&&spread<.22,pct(spread));
 for(const key of ['fin','calm'])for(let i=1;i<bands.length;i++)assert(sweeps[key][i].new>sweeps[key][i-1].new);
 for(const key of ['gk','kcalm'])for(let i=1;i<bands.length;i++)assert(sweeps[key][i].new<sweeps[key][i-1].new);
 const keeperShooter=g.v182PenaltyGoalChance(ab(1,6,{fresh:65}),{gk:12,calm:12,composure:12});assert(keeperShooter>.55,pct(keeperShooter));
 const worst=g.v182PenaltyGoalChance(ab(1,1,{fresh:40,form:-2}),{gk:20,calm:20,composure:20});assert(worst>.45,pct(worst));
});

// Real generated squads: a fresh expansion world, actual starting sixes.
const career=call('v167CreateCareer','AUT-5','penalty-v182','Messung'),clubs=career.world.clubs.filter(c=>c.roster.length>=6);
const sides=new Map(clubs.map(c=>[c.id,call('v64BuildSide',c,'2–2–1').starters]));
const band=v=>v<7.5?'1–7':v<10.5?'8–10':v<13.5?'11–13':v<16.5?'14–16':'17–20';
const tally=()=>({kicks:0,goal:0,save:0,wide:0,high:0,post:0,bar:0});
const add=(t,o)=>{t.kicks++;t[o]++;};
const real={old:{compact:{},played:{}},new:{compact:{},played:{}},inMatch:{old:{},new:{}},order:{old:{},new:{}},team:{old:[tally(),tally()],new:[tally(),tally()]},shootouts:{old:{n:0,kicks:0,early:0},new:{n:0,kicks:0,early:0}}};
const bucket=(obj,key)=>obj[key]||(obj[key]=tally());
function realFixture(a,b,id){
 const fixture={id,homeId:a.id,awayId:b.id,round:'F',plan:{home:{starters:sides.get(a.id)},away:{starters:sides.get(b.id)}}};
 fixture.matchRecord={starters:{home:[...sides.get(a.id)],away:[...sides.get(b.id)]},substitutions:[]};return fixture;
}
// After 90 minutes: freshness 65 on independent copies only.
const tired=c=>{const copy={...c,roster:c.roster.map(p=>({...p,fresh:65}))};return copy;};
const pairs=[];for(let i=0;i+1<clubs.length;i+=2)pairs.push([clubs[i],clubs[i+1]]);
const shooterOf=(fixture,side,pid,squads)=>squads[side].find(p=>p.pid===pid);
for(let rep=0;rep<8;rep++)for(const [a,b] of pairs){
 const worldCareer={world:{seed:`v182-${rep}`,clubs:[tired(a),tired(b)]}},fixture=realFixture(a,b,`r${rep}-${a.id}-${b.id}`);
 const squads=[g.v119ShootoutSquad(worldCareer,fixture,0),g.v119ShootoutSquad(worldCareer,fixture,1)],keepers=squads.map(s=>s.find(p=>p.keeper));
 // Old compact: goals only; old played kick outcomes from v42NextKick.
 const oldCompact=g.v119SimulateShootout(worldCareer,fixture),newCompact=g.v182SimulateShootout(worldCareer,fixture);
 for(const [label,result] of [['old',oldCompact],['new',newCompact]]){const s=real.shootouts[label];s.n++;s.kicks+=result.kicks.length;if(label==='new'&&result.kicks.length<6||label==='old'&&result.kicks.length<10)s.early++;
  const taken=[0,0];for(const k of result.kicks){const p=shooterOf(fixture,k.side,k.pid,squads),o=label==='old'?(k.goal?'goal':'save'):(k.frame||k.outcome);taken[k.side]++;
   if(label==='new'){add(bucket(real.new.compact,band(p.fin)),o);add(bucket(real.order.new,Math.min(taken[k.side],6)),o);add(real.team.new[k.side],o);}
   else{const t=bucket(real.old.compact,band(p.fin));t.kicks++;if(k.goal)t.goal++;const q=bucket(real.order.old,Math.min(taken[k.side],6));q.kicks++;if(k.goal)q.goal++;real.team.old[k.side].kicks++;if(k.goal)real.team.old[k.side].goal++;}}}
 // Played shootouts with the actual step function, own order = recommendation.
 for(const marker of [false,true]){
  const session={mode:'world',own:squads[0].map(p=>({...p})),opponent:squads[1].map(p=>({...p})),order:squads[0].map(p=>p.n),opponentOrder:squads[1].map(p=>p.n),score:[0,0],kicks:[],phase:'shooting',...marker?{penaltyRevision:182}:{}};
  seed(1000+rep*997+pairs.findIndex(x=>x[0]===a));playShootout(session,lcg);
  for(const k of session.kicks){const p=(k.side===0?session.own:session.opponent).find(x=>x.n===k.number);add(bucket(real[marker?'new':'old'].played,band(p.fin)),k.frame||k.outcome);}
 }
 // In-match: the best regular finisher against the opposing keeper.
 for(const side of [0,1]){const taker=[...squads[side]].filter(p=>!p.keeper).sort((x,y)=>y.fin-x.fin)[0];const fresh={...taker,fresh:80};
  for(const marker of [false,true]){const t=bucket(real.inMatch[marker?'new':'old'],band(taker.fin));for(let i=0;i<25;i++){const r=inMatch(marker,fresh,keepers[1-side],rep*7919+i*31+side);add(t,r.frame||r.outcome);}}}
}
const rate=t=>t.kicks?Object.fromEntries(['goal','save','wide','high','post','bar'].map(k=>[k,+(t[k]/t.kicks).toFixed(3)]).concat([['kicks',t.kicks]])):null;
const mapRates=o=>Object.fromEntries(Object.entries(o).sort().map(([k,v])=>[k,rate(v)]));
const realOut={compact:{old:mapRates(real.old.compact),new:mapRates(real.new.compact)},played:{old:mapRates(real.old.played),new:mapRates(real.new.played)},inMatch:{old:mapRates(real.inMatch.old),new:mapRates(real.inMatch.new)},order:{old:mapRates(real.order.old),new:mapRates(real.order.new)},team:{old:real.team.old.map(rate),new:real.team.new.map(rate)},shootouts:real.shootouts};
const all=o=>Object.values(o).reduce((s,t)=>({kicks:s.kicks+t.kicks,goal:s.goal+t.goal}),{kicks:0,goal:0});
check('Real squads: shootout conversion rises to a plausible level, weak bands stay well above collapse',()=>{
 const before=all(real.old.compact),after=all(real.new.compact);
 assert(after.goal/after.kicks>.62&&after.goal/after.kicks<.82,pct(after.goal/after.kicks));assert(after.goal/after.kicks>before.goal/before.kicks+.1);
 for(const [b,t] of Object.entries(real.new.compact))if(t.kicks>200)assert(t.goal/t.kicks>.55,`${b} ${pct(t.goal/t.kicks)}`);
});
const output={pass:true,checks,grid:grid.map(r=>({fresh:r.fresh,shooter:r.shooter,keeper:r.keeper,oldGoal:+r.old.inMatch.goal.toFixed(3),newGoal:+r.new.goal.toFixed(3),old:{inMatch:Object.fromEntries(Object.entries(r.old.inMatch).map(([k,v])=>[k,+v.toFixed(3)])),played:Object.fromEntries(Object.entries(r.old.played).map(([k,v])=>[k,+v.toFixed(3)]))},new:Object.fromEntries(Object.entries(r.new).map(([k,v])=>[k,+v.toFixed(3)]))})),sweeps,real:realOut,clubs:clubs.length,pairs:pairs.length};
fs.mkdirSync('outputs/3d-quality/penalty-quality-v182',{recursive:true});fs.writeFileSync('outputs/3d-quality/penalty-quality-v182/native.json',JSON.stringify(output,null,2)+'\n');
if(process.argv.includes('--table')){
 console.log('\nRaster (Frische 100), Torquote alt (Spiel/Schießen) → neu; Zeile = Schütze (Abschluss=Ruhe), Spalte = Torwart (Torwartspiel=Ruhe)');
 console.log('Schütze \\ TW | '+bands.map(b=>b[0]).join(' | '));
 for(const [sb] of bands)console.log(sb+' | '+bands.map(([kb])=>{const r=grid.find(x=>x.fresh===100&&x.shooter===sb&&x.keeper===kb);return `${pct(r.old.inMatch.goal)} → ${pct(r.new.goal)}`;}).join(' | '));
 console.log('\nGegen Torwart 11–13, Frische 100 und 65: neu Tor/gehalten/daneben/drüber/Pfosten/Latte');
 for(const fresh of [100,65])for(const [sb] of bands){const r=grid.find(x=>x.fresh===fresh&&x.shooter===sb&&x.keeper==='11–13').new;console.log(`F${fresh} ${sb}: ${['goal','save','wide','high','post','bar'].map(k=>pct(r[k])).join(' / ')}`);}
 console.log('\nEchte Kader:',JSON.stringify(realOut,null,1));console.log('Sweeps:',JSON.stringify(sweeps));
}
process.stdout.write(JSON.stringify({pass:true,checks:checks.length,middle:+middle.new.goal.toFixed(3),spread:+(strong.new.goal-weak.new.goal).toFixed(3),realCompact:{old:+(all(real.old.compact).goal/all(real.old.compact).kicks).toFixed(3),new:+(all(real.new.compact).goal/all(real.new.compact).kicks).toFixed(3)}})+'\n');
