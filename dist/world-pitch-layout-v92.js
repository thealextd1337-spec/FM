'use strict';

// Die Simulation behält ihre Hochformat-Koordinaten. Nur die Vereinswelt dreht
// die sichtbare Leinwand; Beschriftungen bleiben dabei aufrecht.
const v92WidePitch=window.matchMedia('(min-width:900px), (min-width:600px) and (orientation:landscape)');
const v92PreviousDraw=draw;
function v92PrepareCanvas(canvas,context,world){
 const cssWidth=canvas.offsetWidth||600;
 const scale=world?Math.min(2,Math.max(1,(window.devicePixelRatio||1)*cssWidth/600)):1;
 const width=Math.round(600*scale),height=Math.round(740*scale);
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}
 context.setTransform(canvas.width/600,0,0,canvas.height/740,0,0);
}
// Nur Schatten und Trikotmuster gegen die Leinwanddrehung ausrichten.
window.v92UprightSprite=(context,x,y)=>{
 if(!document.body.classList.contains('v65-world-match')||!v92WidePitch.matches)return;
 context.translate(x,y);context.rotate(-Math.PI/2);context.translate(-x,-y);
};
draw=function(){
 const canvas=$('#canvas'),context=canvas.getContext('2d'),world=document.body.classList.contains('v65-world-match');
 v92PrepareCanvas(canvas,context,world);
 if(!world||!v92WidePitch.matches)return v92PreviousDraw();
 const fill=context.fillText,stroke=context.strokeText;
 const upright=method=>function(value,x,y,...rest){
  // Leinwand und Spielfiguren drehen sich; Text bleibt aufrecht.
  const playerName=context.font==='12px Arial';
  if(playerName){x+=31;y-=33;rest=[58]}
  if(context.font==='bold 15px Arial'){x+=5;y-=6}
  context.save();context.translate(x,y);context.rotate(-Math.PI/2);
  try{return method.call(context,value,0,0,...rest)}finally{context.restore()}
 };
 context.fillText=upright(fill);context.strokeText=upright(stroke);
 try{return v92PreviousDraw()}
 finally{context.fillText=fill;context.strokeText=stroke}
};

// Trefferflächen folgen der gedrehten Ansicht, ohne Spielerpositionen zu ändern.
$('#canvas').addEventListener('click',event=>{
 if(!document.body.classList.contains('v65-world-match')||!v92WidePitch.matches||!running||!match?.people?.length)return;
 event.stopImmediatePropagation();
 const rect=event.currentTarget.getBoundingClientRect();
 const points=typeof v44VisualPositions==='function'?v44VisualPositions(match.people):match.people.map(person=>({x:person.x*600,y:person.y*740}));
 let closest=null,distance=28;
 for(let index=0;index<points.length;index++){
  const x=rect.left+(740-points[index].y)*rect.width/740;
  const y=rect.top+points[index].x*rect.height/600;
  const next=Math.hypot(event.clientX-x,event.clientY-y);
  if(next<distance){distance=next;closest=match.people[index]}
 }
 if(closest)v59OpenLivePlayer(closest);
},true);

v92WidePitch.addEventListener('change',()=>{
 if(match&&!$('#game-screen').hidden)draw();
});
window.addEventListener('resize',()=>{
 if(match&&!$('#game-screen').hidden)draw();
});
