const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {makeContext}=require('./test-v41.cjs');
const context=makeContext();
for(const file of ['penalties-v42.js','club-records-v43.js','club-identity-v44.js','keeper-logo-v45.js','match-report-v47.js','set-pieces-v50.js','status-icons-v51.js','player-status-v51.js'])
 vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);

const states=JSON.parse(vm.runInContext(`JSON.stringify([100,87,71,51,31].map(fresh=>v51EffectiveForm({form:2,fresh})))`,context));
assert.deepEqual(states,[2,1,0,-1,-2],'even excellent recent results must yield to severe fatigue');
assert(vm.runInContext('v51Workload({form:2,sta:70,age:25})<v51Workload({form:-2,sta:70,age:25})',context),'good form slows exhaustion');
assert(vm.runInContext('v51StatusHTML({form:2,fresh:100}).includes("v51-face")&&v51StatusHTML({form:2,fresh:100}).includes("v51-bar")',context),'combined badge contains both indicators');
const pitchBar=vm.runInContext('v51PitchBarHTML({form:2,fresh:25})',context);
assert.match(pitchBar,/v51-pitch-bar-fill/,'pitch players show a vertical fatigue bar');
assert.match(pitchBar,/scaleY\(0\.250\)/,'the pitch bar uses the player freshness');
assert.match(pitchBar,/#9865D6/,'the pitch bar shares the effective smiley color');
assert.deepEqual(JSON.parse(vm.runInContext("JSON.stringify(v51OrderedStarters([{line:'att',n:9},{line:'mid',n:7},{line:'def',n:2},{keeper:true,line:'gk',n:1},{line:'def',n:4}]).map(player=>player.n))",context)),[1,2,4,7,9],'starter list follows keeper, defenders, midfielders and attackers');

vm.runInContext("beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe')",context);
vm.runInContext('function v24FatigueText(){return "keine"} function v24TopSkills(){return ""}',context);
const keeperCard=vm.runInContext('v51LineupCardContent(homeKeeper,"TOR")',context);
const defenderCard=vm.runInContext('v51LineupCardContent(players.find(player=>player.line==="def"),"VER")',context);
assert.match(keeperCard,/<strong>TOR<\/strong> · \d+ J\. · Müdigkeit:/,'keeper card uses TOR and shows age');
assert.match(defenderCard,/<strong>VER<\/strong> · \d+ J\. · Müdigkeit:/,'outfield card shows age beside its position');
vm.runInContext('start()',context);
assert.equal(vm.runInContext('running',context),true);
const progress=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
 const player=match.people.find(person=>person.t===0&&!person.keeper);
 player.form=2;player.fresh=100;player.sta=60;
 return [0,37.5,75].map(elapsed=>{match.elapsed=elapsed;return{fresh:v51LiveFreshness(player),form:v51EffectiveForm(player),pace:ability(player,'spd')}});
})())`,context));
assert(progress[0].fresh>progress[1].fresh&&progress[1].fresh>progress[2].fresh,'freshness drops gradually');
assert(progress[0].form>progress[2].form,'smiley changes as the game advances');
assert(progress[0].pace>progress[2].pace,'effective performance follows the icon');

const end=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
 const player=match.people.find(person=>person.t===0&&!person.keeper);
 const expected=v51LiveFreshness(player),number=player.n;
 match.elapsed=75;finishMatch();
 return{expected,actual:players.find(person=>person.n===number).fresh};
})())`,context));
assert(Math.abs(end.expected-end.actual)<.001,'live bar and post-match freshness agree');

const fullMatch=makeContext();
for(const file of ['penalties-v42.js','club-records-v43.js','club-identity-v44.js','keeper-logo-v45.js','match-report-v47.js','set-pieces-v50.js','status-icons-v51.js','player-status-v51.js'])
 vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),fullMatch);
assert.equal(vm.runInContext(`(()=>{
 beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');start();
 let frames=0;while(!match.finished&&frames++<4500)step(.039,.05);
 return match.finished;
})()`,fullMatch),true,'the complete match still reaches full time');
console.log('PASS: combined icons, fatigue-bound form, gradual live change and post-match consistency');
