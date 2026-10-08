'use strict';
const fs=require('node:fs'),path=require('node:path');
const geometries=require('./web/physics-catalog.json').filter(s=>s.provenance.family==='physics-net').map(s=>s.geometry),cases=[];
for(const geometry of geometries)for(const [family,title] of [['play-goal','Spielzug · Pass, Annahme und Tor'],['play-interception','Spielzug · Pass wird abgefangen'],['play-parry','Spielzug · Parade und freier Abpraller']]){
 const g=structuredClone(geometry),sign=g.attackDirection,attack=sign>0?0:1,goal=g.length/2;
 function a(id,team,x,z,action='none',role='field',facing=[sign,0,0]){return {id,team,role,action,position:[x*sign,0,z],velocity:[0,0,0],radius:.32,reach:role==='keeper'?.22:.12,facing,pose:'idle',poseStarted:0};}
 const passer=a('passer',attack,goal-18,-4,'pass'),receiver=a('receiver',attack,goal-9,1,'receive'),defender=a('defender',1-attack,goal-6,3,'intercept'),keeper=a('keeper',1-attack,goal-2,family==='play-parry'?1:-3.6,'parry','keeper',[-sign,0,0]);
 const dx=receiver.position[0]-passer.position[0],dz=receiver.position[2]-passer.position[2],len=Math.hypot(dx,dz);passer.facing=[dx/len,0,dz/len];
 if(family==='play-interception'){defender.position=[(goal-13.5)*sign,0,0];defender.facing=[-sign,0,0];const start=[passer.position[0]+passer.facing[0]*.54+passer.facing[2]*.25,passer.position[2]+passer.facing[2]*.54-passer.facing[0]*.25],target=[receiver.position[0]+sign*.3,receiver.position[2]-sign*.25],footX=defender.position[0]-sign*.3,t=(footX-start[0])/(target[0]-start[0]);defender.position[2]=start[1]+(target[1]-start[1])*t-sign*.25;}
 const actors=[passer,receiver,defender,keeper,a('own-keeper',attack,-goal+2,0,'none','keeper')];
 for(let i=actors.length;i<(g.fieldPlayers+1)*2;i++)actors.push(a('support-'+i,i%2,(i%4-2)*4,(i%2?1:-1)*(g.width*.34)));
 const id=family+'-'+(g.length>70?'large':'current')+'-'+g.fieldPlayers+'-'+(sign>0?'positive':'negative');
 cases.push({schemaVersion:'d6-probe-1',id,title,kind:'play',duration:6,geometry:g,ball:{position:[...passer.position],velocity:[0,0,0],radius:.1764},actors,provenance:{family},play:{passerId:'passer',receiverId:'receiver',targetZ:1},cameraPoints:[passer.position,receiver.position,[(goal+2.4)*sign,3.5,-g.goalWidth/2],[(goal+2.4)*sign,0,g.goalWidth/2]].map(position=>({position})),expected:{type:family==='play-goal'?'goal':family==='play-interception'?'interception':'possession'}});
}
fs.writeFileSync(path.join(__dirname,'web/play-catalog.json'),JSON.stringify(cases,null,2)+'\n');console.log(JSON.stringify({cases:cases.length,families:3}));
