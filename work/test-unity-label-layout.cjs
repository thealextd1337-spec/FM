'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {labelPosition,labelLeader}=require('../dist/world-unity-v151.js');
const cases=[];
const intersect=(a,b)=>Math.abs(a.x-b.x)<(a.w+b.w)/2&&Math.min(a.y,b.y)>Math.max(a.y-a.h,b.y-b.h);
function run(name,width,height,anchors){
 const before=JSON.stringify(anchors),placed=[];
 for(const a of anchors){const p=labelPosition(a,placed,width,height);assert(p.x-p.w/2>=0&&p.x+p.w/2<=width&&p.y-p.h>=0&&p.y<=height,name+' stays inside viewport');assert(!placed.some(r=>intersect(p,r)),name+' has no overlapping names');placed.push(p);}
 assert.equal(JSON.stringify(anchors),before,'Input anchors unchanged');
 const again=[];for(const a of anchors)again.push(labelPosition(a,again,width,height));assert.deepEqual(again,placed,'Deterministic result');
 cases.push({name,width,height,players:anchors.length,placed});return placed;
}
for(const [width,height]of [[844,390],[640,360],[390,250],[1280,800]]){
 for(const [x,y]of [[width/2,height/2],[0,0],[width,0],[0,height],[width,height]])run(`Fourteen crowded names at ${x},${y}`,width,height,Array.from({length:14},(_,i)=>({x,y,w:44+i%4*9,h:17})));
}
run('Crossing group with unequal label heights',844,390,Array.from({length:14},(_,i)=>({x:410+i%3*4,y:195+i%2*3,w:50+i%5*7,h:17+i%3})));
run('Subpixel browser sizes at viewport corner',844,390,Array.from({length:14},(_,i)=>({x:0,y:0,w:48.375+i%3*.25,h:16.6953125})));
const occupied=[{x:100,y:100,w:70,h:17}];
const previous={x:0,y:-40},old=labelPosition({x:100,y:100,w:70,h:17,previous},occupied,390,250);assert.equal(old.x,100);assert.equal(old.y,60);cases.push({name:'Available previous displacement retained',placed:[old]});
const free=labelPosition({x:200,y:150,w:70,h:17,previous},occupied,390,250);assert.equal(free.x,200);assert.equal(free.y,150);cases.push({name:'Free anchor returns to actual head',placed:[free]});
const box={x:100,y:100,w:70,h:20};
for(const [x,y]of [[100,50],[100,150],[20,90],[200,90],[20,20],[200,150],[100,90]]){
 const leader=labelLeader(box,x,y);assert(Object.values(leader).every(Number.isFinite));
 const start={x:box.x-box.w/2+leader.left,y:box.y-box.h+leader.top};
 assert(Math.abs(start.x+Math.cos(leader.angle)*leader.length-x)<1e-8);assert(Math.abs(start.y+Math.sin(leader.angle)*leader.length-y)<1e-8);
 if(leader.length){assert(leader.left===0||leader.left===box.w||leader.top===0||leader.top===box.h,'Leader starts at label edge');const middle={x:start.x+Math.cos(leader.angle)*leader.length/2,y:start.y+Math.sin(leader.angle)*leader.length/2};assert(middle.x<=65||middle.x>=135||middle.y<=80||middle.y>=100,'Leader does not run through its own text');}else assert(x===100&&y===90);
 cases.push({name:`Head leader to ${x},${y}`,leader});
}
const out=process.argv[2]||'outputs/3d-quality/label-readability';fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(out+'/layout-tests.json',JSON.stringify({pass:true,cases:cases.length,rows:cases,sourceSha256:crypto.createHash('sha256').update(fs.readFileSync('dist/world-unity-v151.js')).digest('hex')},null,2)+'\n');
console.log(JSON.stringify({pass:true,cases:cases.length}));
