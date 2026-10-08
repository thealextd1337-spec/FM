'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),P=require('../engine-probe/web/physics.js'),N=require('../engine-probe/web/net.js'),catalog=require('../engine-probe/web/physics-catalog.json');
const cases=[];
for(const scene of catalog.filter(s=>s.provenance.family==='physics-net')){
 const sim=P.create({scenario:scene,followThroughSeconds:3});sim.state.running=true;let outwardAfterContact=false,peak=0,returned=false,captured;
 while(!sim.state.finished){sim.step();const s=sim.state,patch=s.netPatches[0];if(patch){peak=Math.max(peak,patch.displacement);outwardAfterContact||=s.ball.velocity[0]*scene.geometry.attackDirection>1&&patch.displacement>.02;returned||=patch.displacement<-.01;if(!captured&&patch.displacement>.4)captured=structuredClone(s);}}
 assert(outwardAfterContact,'Net must decelerate over time, not instantly reverse velocity');assert(peak>.5&&peak<1.6);assert(returned,'Net must visibly overshoot and settle');assert.equal(sim.state.score.reduce((a,b)=>a+b),1);assert.equal(sim.state.events.filter(e=>e.type==='net-contact').length,1);assert(Math.abs(sim.state.netPatches[0].displacement)<.005);
 const patch=captured.netPatches[0],g=scene.geometry,point=patch.position;assert(Math.abs(N.displacement(g,point,patch)-patch.displacement)<1e-12);assert.equal(N.displacement(g,[point[0],0,0],patch),0);assert.equal(N.displacement(g,[point[0],g.goalHeight,g.goalWidth/2],patch),0);assert(Math.abs(N.displacement(g,[point[0],point[1],g.goalWidth/2-.7],patch))<Math.abs(patch.displacement)*.02);
 cases.push({id:scene.id,peak,outwardAfterContact,returned,fixedAttachments:true,settled:true});
}
for(const [panel,axis,out,position]of [['left',2,-1,[35,1,-4.8]],['right',2,1,[35,1,4.8]],['roof',1,1,[35,3.2,0]]]){const g=catalog[0].geometry,s={geometry:g,goalSign:1,ball:{position,velocity:[0,0,0],radius:.1764},netPatches:[]};s.ball.velocity[axis]=out*6;N.step(s,1/480,()=>{});assert(s.netPatches.some(p=>p.panel===panel&&p.displacement>0));assert(s.ball.velocity[axis]*out<6);}
fs.mkdirSync('outputs/platform/soft-net',{recursive:true});fs.writeFileSync('outputs/platform/soft-net/js-tests.json',JSON.stringify({pass:true,cases,panelChecks:['back','left','right','roof']},null,2));console.log(JSON.stringify({pass:true,cases:cases.length,panelChecks:4,maxPeak:Math.max(...cases.map(c=>c.peak))}));
