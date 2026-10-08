const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const field={left:28/600,right:572/600,top:26/740,bottom:714/740};
const src=fs.readFileSync('dist/pitch-v55.js','utf8');
let checks=0;
for(const team of [0,1])for(const direct of [false,true])for(const onTarget of [true,false]){
 const p={pid:'s',name:'Striker',t:team,n:9,x:.55,y:team===0?.13:.87,stats:{shots:0,onTarget:0}},k={pid:'k',name:'Keeper',t:1-team,n:1,keeper:true,x:.38,y:team===0?.16:.84,stats:{faced:0,saves:0}};
 const m={people:[p,k],attackFlow:{qualityVersion:157,flowVersion:159},ball:{x:p.x,y:p.y},shots:[0,0],score:[0,0]},rolls=[.5,onTarget?.01:.99,.99,.5];let flight,goals=0;
 const c=vm.createContext({match:m,v65WorldActive:true,v55Field:field,MATCH_SPEED:1,clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),random:()=>rolls.shift()??.5,ability:()=>10,distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),passLaneGeometry:()=>null,v157Active:()=>true,v127OneTouchRelease:direct?{person:p,target:{x:.56,y:team===0?field.top:field.bottom}}:null,v115GoalDistance:q=>Math.hypot((q.x-.5)*44/(field.right-field.left),(q.y-(team===0?field.top:field.bottom))*68/(field.bottom-field.top)),v101KickPoint:q=>({...q}),v115KeeperContact:()=>({x:k.x,y:k.y}),v115ParryChance:()=>.5,v115MissX:()=>.62,note(){},fly(target,duration,done){flight={target,duration,done};m.flight=flight;},v99Flights:new WeakMap(),v50Goal(){goals++;},v50GoalKick(){},v50Deflect(){}});
 const candidate='dist/match-shot-choice-v159.js';if(fs.existsSync(candidate))vm.runInContext(fs.readFileSync(candidate,'utf8'),c);
 vm.runInContext(src.slice(src.indexOf('function v55Shoot('),src.indexOf('function v115GoalCrossing(')),c);vm.runInContext('v55Shoot(match.people[0])',c);
 if(onTarget){assert.equal(flight.target.y,team===0?field.top:field.bottom,'unreachable keeper must not attract on-target flight');assert(Math.abs(flight.target.x-k.x)>.04,'flight stays away from stranded keeper');flight.done();assert.equal(goals,1,'unblocked on-target ball crosses actual goal');assert.equal(k.stats.saves,0,'unreachable keeper receives no save');checks+=4;}
 else{flight.done();assert.equal(goals,0,'inaccurate shot is still a miss');assert.equal(p.stats.onTarget,0);checks+=2;}
}
{
 const p={t:0,x:.5,y:.2,level:1},m={people:[p]},c=vm.createContext({v55Field:field,clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),ability:p=>p.level,v115GoalDistance:()=>10,v122Metres:()=>1});
 vm.runInContext(fs.readFileSync('dist/match-shot-choice-v159.js','utf8'),c);c.m=m;c.p=p;c.aim={x:.5,y:field.top};
 const weak=vm.runInContext('v159ShotTarget(m,p,p,aim,1)',c);p.level=20;const strong=vm.runInContext('v159ShotTarget(m,p,p,aim,1)',c);
 assert(Math.abs(weak.x-.5)>Math.abs(strong.x-.5)*4,'ability affects actual execution spread');checks++;
 assert(!vm.runInContext('v159WithinMouth(v159ShotTarget(m,{...p,level:1},p,aim,1))',c),'a poorly executed accurate aim can miss the real goal mouth');checks++;
 assert(vm.runInContext('v159WithinMouth(v159ShotTarget(m,p,p,aim,1))',c),'a well executed central attempt remains on target');checks++;
 assert.equal(vm.runInContext('v159ShotTarget(m,p,p,aim,.5).x',c),.5,'zero placement error preserves the selected shot line');checks++;
 for(const level of [1,10,20])for(const roll of [0,.25,.5,.75,1]){p.level=level;c.roll=roll;const point=vm.runInContext('v159ShotTarget(m,p,p,aim,roll)',c);assert(Number.isFinite(point.x)&&point.x>=.3&&point.x<=.7&&point.y===field.top);checks++;}
}
console.log(JSON.stringify({passed:true,checks}));
