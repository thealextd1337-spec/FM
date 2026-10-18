'use strict';
const assert=require('node:assert/strict'),C=require('../dist/world-unity-v151.js');
const camera={position:{x:0,z:40,height:20},target:{x:0,z:0},fov:42};let cases=0;
for(const team of [0,1])for(const turned of [false,true])for(const offset of [0,.3,2,-2]){
 const forward=(team===0?1:-1)*(turned?-1:1),p={id:'keeper',team,number:1,keeper:true,x:0,z:0,movement:{mode:'idle',facing:{x:forward,z:0}},action:{kind:'save',progress:.5,contactWorld:{x:forward*.3,z:offset,height:1.2},saved:false,parry:true,goal:false}};
 const frame={clock:1,elapsed:1,turned,owner:'',ball:{x:forward*.3,z:offset,height:1.2},ballInFlight:true,players:[p]},before=JSON.stringify(frame);
 const pose=C.picture(frame,'keeper',1,camera,'live',[0,0]).players[0],f=pose.facing,len=Math.hypot(f[0],f[2]);
 // Same lateral projection as FootballKeeperTiming.SaveKind on the Unity side.
 const lateral=Math.abs((pose.contactPoint[0]-pose.position[0])*f[2]/len-(pose.contactPoint[2]-pose.position[2])*f[0]/len);
 assert.ok(Math.abs(lateral-Math.abs(offset))<1e-8,`Save turned itself toward contact, hiding lateral reach ${offset}: ${lateral}`);
 assert.equal(lateral>1.2,Math.abs(offset)>1.2,'Wide contact selects a dive; central contact stays upright');
 assert.equal(JSON.stringify(frame),before);cases++;
}
console.log(`PASS ${cases} keeper save facings preserve central/wide contacts on both sides and halves; input unchanged`);
