'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('dist/club-identity-v44.js','utf8'),start=source.indexOf('function v44VisualPositions('),end=source.indexOf('\nconst v44KitDraw=',start);
let world=true;const c=vm.createContext({Math,document:{body:{classList:{contains:()=>world}}},clamp:(x,a,b)=>Math.max(a,Math.min(b,x))});
vm.runInContext(source.slice(start,end),c);let cases=0;
for(const dx of [-.002,-.00001,0,.00001,.002])for(const count of [2,3]){
 const people=[{pid:'a',x:.5+dx,y:.5},{pid:'b',x:.5-dx,y:.5},...(count===3?[{pid:'c',x:.5,y:.501}]:[])];
 const before=JSON.stringify(people),points=c.v44VisualPositions(people);
 points.forEach((p,i)=>assert.ok(Math.hypot(p.x-people[i].x*600,p.y-people[i].y*740)<1e-8,`Physical-world body ${people[i].pid} displaced by marker layout at dx=${dx}`));
 assert.equal(JSON.stringify(people),before);cases++;
}
world=false;const legacy=c.v44VisualPositions([{x:.5,y:.5},{x:.5,y:.5}]);
assert.ok(Math.hypot(legacy[0].x-legacy[1].x,legacy[0].y-legacy[1].y)>=49.99,'Legacy marker layout retained');
console.log(`PASS ${cases} close/crossing world groups remain on native positions; legacy separation retained`);
