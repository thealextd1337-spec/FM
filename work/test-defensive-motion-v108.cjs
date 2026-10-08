const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const context=vm.createContext({v55Field:{left:28/600,right:572/600,top:26/740,bottom:714/740},v65WorldActive:'test'});vm.runInContext(fs.readFileSync('dist/world-backpedal-v108.js','utf8'),context);
function fixture(team=0){const p={n:4,t:team,x:.5,y:team?.25:.75,assignedLine:'def',keeper:false},att={n:9,t:1-team,x:.5,y:team?.32:.68,keeper:false};return{p,att,m:{owner:att,people:[p,att]}}}
for(const team of [0,1]){
 const {m,p,att}=fixture(team),dy=team?-.08:.08,before=JSON.stringify(m),mode=context.v108DefensiveMovement(m,p,0,dy);assert.equal(mode.mode,'backpedal');assert.equal(mode.speedFactor,.6);assert.equal(mode.focus,att);assert.equal(JSON.stringify(m),before);
 assert.equal(context.v108MoveFactor(m,p,0,dy),.6);assert.equal(context.v108MovementMode(m,p).mode,'backpedal');assert.equal(context.v108MoveFactor(m,p,0,-dy),1);assert.equal(context.v108MovementMode(m,p),null);
 assert.equal(context.v108DefensiveMovement(m,p,.04,dy).mode,'backpedal');assert.equal(context.v108DefensiveMovement(m,p,.08,0),null);
 for(const flag of ['setPiece','kickoff','throwIn','rebound','postBanner']){m[flag]={};assert.equal(context.v108DefensiveMovement(m,p,0,dy),null,flag);delete m[flag]}
 for(const flag of ['keeper','slideActive','interceptTarget']){p[flag]=true;assert.equal(context.v108DefensiveMovement(m,p,0,dy),null,flag);p[flag]=false}
 p.assignedLine='att';assert.equal(context.v108DefensiveMovement(m,p,0,dy),null);p.assignedLine='def';m.owner=p;assert.equal(context.v108DefensiveMovement(m,p,0,dy),null);m.owner=att;
 att.y=team?.2:.8;assert.equal(context.v108DefensiveMovement(m,p,0,dy),null,'Turn and chase once overtaken');
}
const f=fixture();context.v65WorldActive=null;assert.equal(context.v108MoveFactor(f.m,f.p,0,.08),1,'Legacy league unchanged');
console.log('Defensive backpedal: both teams, goal-side retreat at 60% speed, diagonal movement, forward/sideways chase, overtaken threat, stoppages and ephemeral metadata passed.');
