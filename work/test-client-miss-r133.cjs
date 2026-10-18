'use strict';
// Exercise production shot projection at/after the line; never alter the result.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function actual(file,name){const s=fs.readFileSync('dist/'+file,'utf8'),a=s.indexOf('function '+name+'(');assert(a>=0);let d=0;for(let i=s.indexOf('{',a);i<s.length;i++){if(s[i]==='{')d++;else if(s[i]==='}'&&!--d)return s.slice(a,i+1);}throw Error(name);}
const c=vm.createContext({Math,WeakMap,MATCH_SPEED:1,v183Rate:()=>1,v159ShotActive:()=>true,v99Flights:new WeakMap(),v99Actions:new WeakMap()});
vm.runInContext(actual('world-pitch-actions-v99.js','v101ShotPoint')+'\n'+actual('world-pitch3d-v98.js','v119VisibleShotBall'),c);
let cases=0;
for(const revision of [183,0])for(const team of [0,1])for(const over of [false,true])for(const phase of ['flight','tail']){
 const flight={x:.43,y:.5,duration:1,progress:1},height=over?4.2:1.8;
 const pose={kind:'shot',onTarget:false,blocked:false,over,endHeight:height,startHeight:.29,shooter:{n:3},target:{x:over?.5:.65,y:team?1:0},flight,age:.1};
 const m={...(revision?{si:{revision}}:{}),people:[],score:[0,0],goals:[],flight:phase==='flight'?flight:null};
 c.match=m;c.v99Flights.set(flight,pose);c.v99Actions.set(m,{miss:pose});const before=JSON.stringify({m,pose});
 const view=c.v119VisibleShotBall(m),expectedHeight=revision?height:1.35;
 const expected=c.v101ShotPoint({...pose,over:false,endHeight:expectedHeight},1);
 assert.equal(view.x,expected.x+(phase==='tail'?expected.vx*.1:0),'Native lateral target survives');
 if(phase==='flight')assert.ok(Math.abs(view.elevation-expectedHeight)<1e-8,`revision ${revision}, over ${over}: visible height ${view.elevation}, expected ${expectedHeight}`);
 else assert.ok(Math.abs(view.elevation-Math.max(.29,expected.elevation+expected.vh*.1-4.9*.01))<1e-8,'Miss tail continues the same native height');
 assert.equal(JSON.stringify({m,pose}),before,'Projection must not change native result or release');cases++;
}
console.log(`PASS ${cases} miss projections: high/wide, legacy/SI, both goals, flight/tail; native results unchanged`);
