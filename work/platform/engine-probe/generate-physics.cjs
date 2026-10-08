'use strict';
const fs=require('node:fs'),C=require('../../match-next/shared/contract.js');
const names={'physics-flight':'Ballphysik · Hoher Flug','physics-roll':'Ballphysik · Ausrollen','physics-bounce':'Ballphysik · Bodenaufprall','physics-post':'Ballphysik · Pfostenaufprall','physics-crossbar':'Ballphysik · Lattenaufprall','physics-net':'Ballphysik · Tor und Netz'};
const cases=[];
for(const large of [false,true])for(const players of [5,6])for(const sign of [1,-1])for(const [family,title]of Object.entries(names)){
 const g=C.geometry(large,players,sign),r=g.ballRadius,x=g.length/2,gw=g.goalWidth/2,gh=g.goalHeight;
 let p=[0,r,0],v=[sign*5.5,9,0],points=[[0,0,0],[sign*28,5,0]],expected={type:'ground-contact'};
 if(family==='physics-roll'){v=[sign*9,0,0];points=[[0,0,0],[sign*18,0,0]];expected={type:'result'};}
 if(family==='physics-bounce'){p=[0,3,0];v=[sign*6,-2,0];points=[[0,0,0],[sign*18,3,0]];}
 if(family==='physics-post'){p=[sign*(x-7),1,gw];v=[sign*30,9.81*7/30/2,0];points=[[sign*(x-12),0,-gw],[sign*(x+3),gh,gw]];expected={type:'frame-contact',reason:'Pfosten'};}
 if(family==='physics-crossbar'){p=[sign*(x-7),gh,0];v=[sign*30,9.81*7/30/2,0];points=[[sign*(x-10),0,-gw],[sign*(x+2),gh+1,gw]];expected={type:'frame-contact',reason:'Latte'};}
 if(family==='physics-net'){p=[sign*(x-7),1.4,0];v=[sign*24,1.6,0];points=[[sign*(x-8),0,-gw],[sign*(x+3),gh,gw]];expected={type:'goal'};}
 const actors=[];for(let team=0;team<2;team++)for(let n=0;n<=players;n++)actors.push({id:`team-${team}-${n}`,team,role:n?'field':'keeper',action:'none',position:[(team?1:-1)*(g.length*.32),(0),(n-players/2)*3+11],velocity:[0,0,0],radius:.35,reach:.75});
 cases.push({schemaVersion:C.VERSION,id:family+`-${large?'large':'current'}-${players}-${sign}`,title,kind:'physics',duration:4,geometry:g,ball:{position:p,velocity:v,radius:r},actors,provenance:{family},cameraPoints:points.map(position=>({position})),expected});
}
fs.writeFileSync(__dirname+'/web/physics-catalog.json',JSON.stringify(cases,null,2)+'\n');console.log(`${cases.length} physics probes`);
