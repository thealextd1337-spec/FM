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
