const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {makeContext}=require('./test-v41.cjs');

const context=makeContext(),listeners=new Map();
context.document.addEventListener=(type,listener)=>listeners.set(type,listener);
context.document.elementFromPoint=()=>null;
vm.runInContext(fs.readFileSync('dist/lineup-ux-v24.js','utf8'),context,{filename:'lineup-ux-v24.js'});

const source={dataset:{dragPlayer:'9',dragKind:'pitch'},classList:{add(){},remove(){}},querySelector:()=>({textContent:'Spieler'})};
const target={closest:selector=>selector==='[data-drag-player]'?source:null};
let prevented=0;
const pointer=(type,x,y,id=1)=>listeners.get(type)({target,pointerType:'touch',pointerId:id,clientX:x,clientY:y,preventDefault(){prevented++}});

pointer('pointerdown',80,200);
pointer('pointermove',83,240);
assert.equal(prevented,0,'a vertical swipe starting on a player must allow page scrolling');
assert.equal(vm.runInContext('v24Drag?.dragging||false',context),false,'vertical scroll must not lift the player');
pointer('pointercancel',83,240);

pointer('pointerdown',80,200,2);
pointer('pointermove',98,203,2);
assert.equal(vm.runInContext('v24Drag?.dragging||false',context),false,'small horizontal movement must not start dragging');
pointer('pointermove',103,204,2);
assert.equal(vm.runInContext('v24Drag?.dragging||false',context),true,'a deliberate horizontal gesture still drags the player');
pointer('pointercancel',103,204,2);

const lineupCSS=vm.runInContext('v24Style.textContent',context);
assert.match(lineupCSS,/\.cell\[draggable=true\],\.bench-chip\[draggable=true\]\{touch-action:pan-y\}/,'pitch and bench cards allow native vertical panning');
assert.match(fs.readFileSync('dist/player-status-v51.js','utf8'),/\.v51-starter\[draggable=true\]\{cursor:grab;touch-action:pan-y\}/,'starter cards allow native vertical panning');
console.log('PASS: mobile vertical swipes scroll; intentional horizontal drags remain available');
