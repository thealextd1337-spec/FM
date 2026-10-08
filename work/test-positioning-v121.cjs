const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context=vm.createContext({v65WorldActive:true,MATCH_SPEED:.78,v55Field:{left:28/600,right:572/600,top:26/740,bottom:714/740},clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),ability:(p,key)=>p[key]||12,v115OffsideMargin:()=>.02,v55OffsideLine:()=>.3});
vm.runInContext(fs.readFileSync('dist/world-backpedal-v108.js','utf8'),context);
// Use the actual shared offside rule now that marking checks idle offside runners.
const rules=fs.readFileSync('dist/pitch-v55.js','utf8');
vm.runInContext(rules.slice(rules.indexOf('function v124OffsideEdge('),rules.indexOf('function v55PrepareMovement('))+rules.slice(rules.indexOf('function v55OffsideSnapshot('),rules.indexOf('function v55WhistleOffside(')),context);
const p=(n,t,x,y,line='att')=>({n,t,x,y,tx:x,ty:y,bx:x,by:y,assignedLine:line,keeper:false,pos:12});
const defs=[p(1,0,.43,.77,'def'),p(2,0,.55,.77,'def'),p(3,0,.68,.77,'def')],owner=p(9,1,.7,.65),runners=[p(7,1,.49,.73),p(8,1,.18,.73)],m={people:[...defs,owner,...runners],owner,ball:{x:owner.x,y:owner.y},elapsed:10,defenseLines:[0,0]};
context.m=context.match=m;const positions=JSON.stringify(m.people.map(p=>[p.x,p.y]));context.v121PreparePositioning(m);defs.forEach(p=>context.v113DefenderTarget(m,p));const targets=defs.map(p=>[p.tx,p.ty]);assert.equal(JSON.stringify(m.people.map(p=>[p.x,p.y])),positions,'planning never changes physical positions');
m.people.reverse();context.v121PreparePositioning(m);defs.forEach(p=>context.v113DefenderTarget(m,p));assert.deepEqual(defs.map(p=>[p.tx,p.ty]),targets,'assignments do not depend on people iteration order');
for(const key of ['kickoff','setPiece','throwIn','postBanner','halftimePause','finished','goalPause']){m[key]=key==='goalPause'?1:true;context.v121PreparePositioning(m);for(const person of defs){person.tx=.22;person.ty=.44;context.v113DefenderTarget(m,person);assert.equal(person.tx,.22);assert.equal(person.ty,.44)}delete m[key]}
const d=defs[0];m.owner=owner;d.x=.5;d.y=.75;owner.x=.5;owner.y=.82;assert.equal(context.v108MoveFactor(m,d,0,.1),1);assert.equal(context.v108MovementMode(m,d).mode,'pursuit');m.kickoff={};context.v108MoveFactor(m,d,0,.1);assert.equal(context.v108MovementMode(m,d),null);delete m.kickoff;
context.v65WorldActive=false;d.tx=.24;d.ty=.4;context.v121PreparePositioning(m);context.v113DefenderTarget(m,d);context.v121RunnerTarget(m,d);assert.equal(d.tx,.24);assert.equal(d.ty,.4);assert.equal(context.v108MoveFactor(m,d,0,.1),1);assert.equal(context.v108MovementMode(m,d),null);
console.log('Positioning v121: order-independent assignments, planning without displacement, seven stoppages, pursuit and legacy guards passed.');
