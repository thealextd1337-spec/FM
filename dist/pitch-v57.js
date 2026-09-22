// Free-kick players move into a visible restart shape while the banner is shown.
function v57PositionFreeKick(realDelta){
 const m=match,piece=m?.setPiece;
 if(!piece||!['freeKick','offside'].includes(piece.type)||!['waiting','fading'].includes(piece.phase))return;
 piece.positionElapsed=(piece.positionElapsed||0)+realDelta;
 // Keep the frozen offside decision readable briefly before the restart forms.
 if(piece.type==='offside'&&piece.positionElapsed<.45)return;
 const forward=piece.team===0?-1:1,spot=piece.spot;
 const allies=m.people.filter(player=>player.t===piece.team&&!player.keeper&&player!==piece.taker);
 const rivals=m.people.filter(player=>player.t!==piece.team&&!player.keeper);
 const targets=new Map([[piece.taker,spot]]);
 allies.forEach((player,index)=>targets.set(player,{
  x:clamp(spot.x+[-.18,-.07,.09,.2][index],.08,.92),
  y:clamp(spot.y+forward*[.08,-.035,.13,-.11][index],.1,.9)
 }));
 rivals.forEach((player,index)=>targets.set(player,{
  x:clamp(spot.x+[-.05,.05,-.18,.18,0][index],.08,.92),
  y:clamp(spot.y+forward*[.14,.14,.23,.23,.3][index],.1,.9)
 }));
 const fraction=Math.min(1,realDelta*3.4);
 for(const[player,target]of targets){player.x+=(target.x-player.x)*fraction;player.y+=(target.y-player.y)*fraction;player.tx=player.x;player.ty=player.y}
 if(piece.type==='offside')m.ball={...spot};
}
const v57BaseStep=step;
step=function(delta,realDelta){v57PositionFreeKick(realDelta);return v57BaseStep(delta,realDelta)};

const v57BaseVersion=v50Version;
v50Version=function(){v57BaseVersion();document.querySelectorAll('footer span:first-child').forEach(label=>label.textContent='Doppel 6 / PROTOTYP 57');const footer=startScreen?.querySelector('footer');if(footer)footer.textContent='Doppel 6 / PROTOTYP 57'};
v50Version();
