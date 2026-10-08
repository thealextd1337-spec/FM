const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('dist/match-ball-events-v117.js','utf8'),cases=[];
const context=vm.createContext({structuredClone,console});
vm.runInContext(`
let match,mode='caught',kind='shot';const v102Flights=new WeakMap(),v99Flights=new WeakMap();
function stats(){return {shots:0,onTarget:0,goals:0,saves:0,faced:0,conceded:0}}
function v65CreateMatch(){match={people:[{pid:'striker',t:0,stats:stats()},{pid:'keeper',t:1,keeper:true,stats:stats()}],score:[0,0],goals:[],ball:{x:.5,y:.5},elapsed:10,owner:null,rebound:null,flight:null}}
function v50Keeper(){return match.people[1]}
function fly(target,duration,done){const f={x:.5,y:.5,target,duration,done};match.flight=f;v102Flights.set(f,{kind,person:match.people[0]});v99Flights.set(f,{blocked:mode==='blocked'||mode==='unreached-block'});match.owner=null}
function v50Goal(p,k){p.stats.goals++;k.stats.conceded++;match.score[p.t]++;match.goals.push({pid:p.pid});match.owner=null;match.rebound=null}
function v50LooseBall(point){match.flight=null;match.owner=null;match.rebound={...point};match.ball={...point}}
function v50Deflect(point,t,p){kind='block';fly(point,1,()=>v50LooseBall(point))}
function v50GoalKick(k){match.owner=k}
function v55Shoot(p){
 kind=mode==='converted-pass'?'pass':'shot';
 if(mode!=='converted-pass'){p.stats.shots++;if(!['miss','blocked','unreached-block'].includes(mode)){p.stats.onTarget++;v50Keeper().stats.faced++}}
 fly({x:.5,y:.03},1,()=>{const k=v50Keeper();if(mode==='goal')v50Goal(p,k);else if(mode==='parried'){k.stats.saves++;v50Deflect(match.ball,0,k)}else if(mode==='caught'){k.stats.saves++;v50GoalKick(k)}else if(mode==='blocked')v50Deflect(match.ball,0,{pid:'defender',t:1});else if(mode==='unreached-block')v50LooseBall(match.ball);else v50GoalKick(k)});
}
function v50FinishPenalty(sp){const p=sp.taker,k=v50Keeper();p.stats.shots++;if(['goal','save'].includes(sp.outcome)){p.stats.onTarget++;k.stats.faced++}if(sp.outcome==='goal')v50Goal(p,k,true);else if(sp.outcome==='save'){k.stats.saves++;if(mode==='parried')v50Deflect(match.ball,0,k);else v50GoalKick(k)}else v50GoalKick(k)}
function v65Context(){return {}}
function v65Finish(){if(match.finished)return;match.finished=true;match.flight=null;match.report=v65WorldReport()}
function v65WorldReport(){return {score:[...match.score],players:match.people.map(p=>({pid:p.pid,stats:{...p.stats}}))}}
function beginHalftimeBreak(){match.flight=null}
function complete(){const f=match.flight;match.flight=null;f.done()}
`,context);
vm.runInContext(source,context);
function run(name,body,check){vm.runInContext('v65CreateMatch();mode="caught";kind="shot";',context);vm.runInContext(body,context);const data=JSON.parse(vm.runInContext('JSON.stringify(match)',context));check(data);cases.push({name,passed:true});}
const striker=m=>m.people[0].stats,keeper=m=>m.people[1].stats,shot=m=>m.ballAccounting.events.find(e=>e.shot);
for(const mode of ['caught','parried','goal','miss','blocked','unreached-block'])run(mode,`mode='${mode}';v55Shoot(match.people[0]);complete();`,m=>{
 assert.equal(shot(m).result,mode==='miss'?'off-target':mode);assert.equal(keeper(m).savesCaught,mode==='caught'?1:0);assert.equal(keeper(m).savesParried,mode==='parried'?1:0);assert.equal(keeper(m).shotConceded,mode==='goal'?1:0);
});
run('final whistle, repeated finish',"v55Shoot(match.people[0]);v65Finish();v65Finish();",m=>{assert.equal(striker(m).shots,1);assert.equal(striker(m).onTarget,0);assert.equal(keeper(m).faced,0);assert.equal(striker(m).shotsInterrupted,1);assert.equal(shot(m).result,'interrupted');assert.deepEqual(m.report.ballAccounting,m.ballAccounting);assert.equal(m.report.players[0].stats.onTarget,0)});
run('off-target interruption',"mode='miss';v55Shoot(match.people[0]);beginHalftimeBreak();",m=>{assert.equal(striker(m).shotsInterrupted,1);assert.equal(striker(m).onTarget,0);assert.equal(keeper(m).faced,0);assert.equal(shot(m).reason,'half-time')});
run('long header becomes pass',"mode='converted-pass';v55Shoot(match.people[0]);complete();",m=>{assert.equal(striker(m).shots,0);assert.equal(m.ballAccounting.events.filter(e=>e.shot).length,0);assert.equal(m.ballAccounting.events[0].kind,'pass')});
run('shot goal without a predicted target booking',"mode='unreached-block';v55Shoot(match.people[0]);mode='goal';complete();",m=>{assert.equal(striker(m).onTarget,1);assert.equal(keeper(m).faced,1);assert.equal(keeper(m).shotConceded,1);assert.equal(shot(m).plannedOnTarget,false);assert.equal(shot(m).actualOnTarget,true)});
for(const kind of ['pass','cross'])run('goal from '+kind,`kind='${kind}';fly(match.ball,1,()=>v50Goal(match.people[0],v50Keeper()));complete();`,m=>{assert.equal(keeper(m).shotConceded,0);assert.equal(keeper(m).nonShotConceded,1);assert.equal(striker(m).nonShotGoals,1);assert.equal(m.ballAccounting.events.at(-1).parentId,1)});
run('rolling cross, snapshot restore',"kind='cross';fly(match.ball,1,()=>v50LooseBall(match.ball));complete();match=JSON.parse(JSON.stringify(match));v50Goal(match.people[0],v50Keeper());",m=>{assert.equal(keeper(m).nonShotConceded,1);const e=m.ballAccounting.events;assert.equal(e[2].parentId,e[1].id);assert.equal(e[1].parentId,e[0].id);assert.equal(e[0].kind,'cross');assert.equal(e[2].result,'non-shot-goal')});
run('parry and intentional follow-up shot',"mode='parried';v55Shoot(match.people[0]);complete();complete();match.owner=match.people[0];mode='goal';v55Shoot(match.people[0]);complete();",m=>{const e=m.ballAccounting.events;assert.equal(e[0].result,'parried');assert.equal(e[1].parentId,e[0].id);assert.equal(e[2].parentId,e[1].id);assert.equal(e[3].parentId,e[2].id);assert.equal(keeper(m).faced,2);assert.equal(keeper(m).savesParried,1);assert.equal(keeper(m).shotConceded,1);assert.equal(keeper(m).nonShotConceded,0)});
run('parry rolls into goal, no new shot',"mode='parried';v55Shoot(match.people[0]);complete();complete();v50Goal(match.people[0],v50Keeper());",m=>{assert.equal(keeper(m).faced,1);assert.equal(keeper(m).saves,1);assert.equal(keeper(m).shotConceded,0);assert.equal(keeper(m).nonShotConceded,1)});
run('own goal',"kind='cross';fly(match.ball,1,()=>v50Goal({pid:null,t:0,stats:stats()},v50Keeper(),false,'own-goal'));complete();",m=>{assert.equal(keeper(m).nonShotConceded,1);assert.equal(striker(m).goals,0);assert.equal(striker(m).nonShotGoals,0);assert.equal(m.ballAccounting.events.at(-1).source,'own-goal')});
for(const outcome of ['goal','save','wide'])for(const mode of outcome==='save'?['caught','parried']:['caught'])run('penalty '+outcome+' '+mode,`mode='${mode}';v50FinishPenalty({taker:match.people[0],team:0,outcome:'${outcome}'});`,m=>{assert.equal(striker(m).shots,1);assert.equal(keeper(m).faced,outcome==='wide'?0:1);assert.equal(keeper(m).savesCaught,outcome==='save'&&mode==='caught'?1:0);assert.equal(keeper(m).savesParried,outcome==='save'&&mode==='parried'?1:0);assert.equal(keeper(m).shotConceded,outcome==='goal'?1:0)});
run('old ongoing match stays untracked',"delete match.ballAccounting;for(const p of match.people)p.stats=stats();v55Shoot(match.people[0]);complete();v65Finish();",m=>{assert(!m.ballAccounting);assert(!m.report.ballAccounting);assert(!('shotsInterrupted' in striker(m)));assert.equal(keeper(m).saves,1)});
assert(!/Math\.random|\brandom\(/.test(source),'No simulation random draws');
const report={date:new Date().toISOString(),cases,passed:true,scope:'Accounting state transitions with deterministic callback stubs; physical behavior checked separately in real live matches.'};
fs.writeFileSync('docs/spieler-nutzer-rig/shot-accounting-focused-v117.json',JSON.stringify(report,null,2)+'\n');console.log(cases.length+' focused accounting cases passed.');
