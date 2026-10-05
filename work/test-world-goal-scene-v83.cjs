const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

const source=fs.readFileSync('dist/world-goal-scene-v83.js','utf8');
const drawn=[];
const canvas=new Proxy({}, {get(_target,name){return(...args)=>{drawn.push([name,...args])}}});
const context=vm.createContext({
 v55Field:{top:26/740,bottom:714/740},v65WorldActive:{},
 match:{ball:{x:.53,y:26/740},elapsed:47,goalPause:0,goals:[]},
 document:{createElement:()=>({textContent:''}),head:{append:()=>{}}},
 $:()=>({getContext:()=>canvas}),
 v50Goal(scorer){context.match.goals.push({pid:scorer.pid,team:scorer.t});context.match.goalPause=2},
 step(_delta,realDelta){const match=context.match;if(match.goalPause>0){match.goalPause-=realDelta;if(match.goalPause<=0&&!match.fulltimePending)context.kickoff(1);return}match.elapsed+=realDelta},
 kickoff(){context.match.ball={x:.5,y:.5}},draw(){}
});
vm.runInContext(source,context);
function assertBothNets(message){
 for(const line of [26,714])assert(drawn.some(call=>call[0]==='lineTo'&&call[1]===360&&Math.abs(call[2]-line)<.001),`${message}: Netz an Torlinie ${line}`);
}
context.draw();
assertBothNets('Laufende Partie ohne Torszene');
assert(!drawn.some(call=>call[0]==='arc'),'ruhende Netze zeichnen keinen zusätzlichen Ball');
drawn.length=0;
const position=vm.runInContext('v83GoalPosition',context);
for(const team of [0,1]){
 const line=team===0?26/740:714/740;
 for(const elapsed of [0,.3,.6,.85,1.05,1.3,1.65,2,2.45]){
  const point=position({team,x:.53,elapsed});
  assert(team===0?point.y<=line:point.y>=line,'Ball bleibt nach Treffer hinter der Torlinie');
  assert(point.x>=.4&&point.x<=.6,'Ball bleibt zwischen den Pfosten');
  assert(point.y>=0&&point.y<=1,'Ball bleibt auf dem Spielfeldbild');
 }
 assert.strictEqual(position({team,x:.53,elapsed:2.45}).height,0,'Ball liegt am Ende auf dem Boden');
}
assert(position({team:0,x:.53,elapsed:.6}).bulge>position({team:0,x:.53,elapsed:1.3}).bulge,'Netz beult sich aus und entspannt');
context.v50Goal({pid:'scorer',t:0});
assert.strictEqual(context.match.goalPause,4.05,'Tor hält Spiel lange genug für vollständige Szene an');
context.step(1,.6);
assert.strictEqual(context.match.elapsed,47,'Matchzeit steht während Netzbewegung');
assert(context.match.ball.y<26/740,'Ball ist hinter der Linie');
const saved=JSON.parse(JSON.stringify(context.match));
context.match=saved;
context.step(1,.45);
assert(context.match.goalScene.elapsed>1,'gespeicherte Szene setzt an der richtigen Stelle fort');
const ballBeforeDraw={...context.match.ball};
context.draw();
assert(context.match.ball.x===ballBeforeDraw.x&&context.match.ball.y===ballBeforeDraw.y,'Zeichnen verändert den gespeicherten Ball nicht');
assert(drawn.some(call=>call[0]==='lineTo'&&call[1]===360&&Math.abs(call[2]-26)<.001),'Torpfosten stehen auf der oberen Torlinie');
assert(drawn.some(call=>call[0]==='arc'),'Ball wird im Netz sichtbar gezeichnet');
assert(drawn.every(call=>call.slice(1).every(value=>typeof value!=='number'||Number.isFinite(value))),'Netz und Ball haben gültige Koordinaten');
drawn.length=0;context.match.halftimeBreakDone=true;context.draw();
assert(drawn.some(call=>call[0]==='lineTo'&&call[1]===360&&Math.abs(call[2]-714)<.001),'Seitenwechsel spiegelt Netz und Ball zum unteren Tor');
context.match.halftimeBreakDone=false;
for(let index=0;index<82&&context.match.goalPause>0;index++)context.step(1,.05);
assert.strictEqual(context.match.elapsed,47,'Matchzeit steht bis zum Wiederanstoß');
assert.strictEqual(context.match.goalScene,null,'Anstoß entfernt die Torszene');
assert.strictEqual(context.match.ball.x,.5,'Ball liegt wieder am Anstoßpunkt');
drawn.length=0;context.draw();assertBothNets('Netze bleiben nach Wiederanstoß sichtbar');
context.match={ball:{x:.53,y:714/740},elapsed:74,goalPause:0,goals:[],fulltimePending:true};
context.v50Goal({pid:'last-minute',t:1});
context.draw();
assert(drawn.some(call=>call[0]==='lineTo'&&call[1]===360&&Math.abs(call[2]-714)<.001),'untere Torpfosten stehen auf der Torlinie');
for(let index=0;index<82&&context.match.goalPause>0;index++)context.step(1,.05);
assert.strictEqual(context.match.elapsed,74,'spätes Tor stoppt die Matchzeit bis zum Abpfiff');
assert.strictEqual(context.match.goalScene,null,'Torszene endet auch ohne weiteren Anstoß');
context.v65WorldActive=null;
drawn.length=0;context.draw();assert.equal(drawn.length,0,'alte Liga erhält keine zusätzlichen Netze');
context.match={ball:{x:.5,y:26/740},goalPause:0,goals:[]};
context.v50Goal({pid:'legacy',t:0});
assert(!context.match.goalScene,'alte Liga bleibt unverändert');
assert(source.includes('v83BallGoal 2.05s')&&source.includes('prefers-reduced-motion:reduce'),'Elfmeterszene endet am Boden und respektiert reduzierte Bewegung');
console.log('Torszene: Torlinie, Netzausbuchtung, Ballweg, Uhrstopp, Wiederaufnahme und Elfmeterszene geprüft.');
