'use strict';
// Actual 2D renderer and halftime wrapper, with a recording canvas. No physics stubs.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const read=f=>fs.readFileSync('dist/'+f,'utf8');
const arcs=[],context=new Proxy({arc:(...args)=>arcs.push(args)},{get:(o,k)=>k in o?o[k]:()=>{}});
const c=vm.createContext({console,Math,draw(){},v44VisualPositions:()=>[],v65WorldActive:true,
 document:{body:{classList:{contains:()=>true}}},$:()=>({getContext:()=>context}),
 v160DrawMarkings(){},v102Clock:m=>m.clock,v109CornerBalls:new WeakMap()});
c.window=c;
function actualFunction(file,name){const text=read(file),start=text.indexOf('function '+name+'(');assert(start>=0,name);let depth=0;for(let i=text.indexOf('{',start);i<text.length;i++){if(text[i]==='{')depth++;else if(text[i]==='}'&&!--depth)return text.slice(start,i+1);}throw Error(name);}
const identity=read('identity-v12.js');vm.runInContext(identity.slice(identity.indexOf('draw=function(){'),identity.indexOf('\ndocument.querySelectorAll')),c);
vm.runInContext(actualFunction('world-ball-motion-v110.js','v110RollingBallView'),c);
vm.runInContext(actualFunction('world-corner-ball-v109.js','v109CornerBallView'),c);
const presentation=read('match-presentation-v74.js');vm.runInContext(presentation.slice(presentation.indexOf('let v74DrawingTurnedField=')),c);
let cases=0;
for(const halftimeBreakDone of [false,true])for(const kind of ['rolling','owned','flight','corner']){
 const m={people:[],geometry:{width:44},ball:{x:.2,y:.3},clock:5,halftimeBreakDone};
 if(kind==='rolling')m.rebound={x:.2,y:.3,vx:.1,vy:.1};
 if(kind==='owned')m.owner={pid:'owner'};
 if(kind==='flight')m.flight={progress:.3};
 if(kind==='corner'){m.setPiece={type:'corner',spot:{x:.2,y:.3}};c.v109CornerBalls.set(m,{piece:m.setPiece,at:5,start:{x:.2,y:.3,elevation:.29},velocity:{x:0,y:0,height:0},duration:1});}
 c.match=m;const before=JSON.stringify(m);arcs.length=0;vm.runInContext('draw()',c);
 const ball=arcs.at(-1),x=(halftimeBreakDone?.8:.2)*600,y=(halftimeBreakDone?.7:.3)*740;
 assert.ok(Math.abs(ball[0]-x)<1e-8&&Math.abs(ball[1]-y)<1e-8,`${kind}, half ${halftimeBreakDone?2:1}: ${ball.slice(0,2)} expected ${x},${y}`);
 assert.equal(JSON.stringify(m),before,'Drawing restores every native coordinate');cases++;
}
console.log(`PASS ${cases} actual 2D ball projections: rolling, possession, flight, corner; both halves, native state unchanged`);
