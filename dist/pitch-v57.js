// Free-kick players move into a visible restart shape while the banner is shown.
function v57PositionFreeKick(realDelta){
 const m=match,piece=m?.setPiece;
 if(!piece||!['freeKick','offside'].includes(piece.type)||!['waiting','fading'].includes(piece.phase))return;
 const previousElapsed=piece.positionElapsed||0;
 piece.positionElapsed=previousElapsed+realDelta;
 // Let the full offside snapshot remain still long enough to inspect before players move.
 if(piece.type==='offside'){
  if(piece.positionElapsed<v50OffsideFreezeSeconds)return;
  m.offsideVisual=null;
  realDelta=Math.max(0,piece.positionElapsed-Math.max(previousElapsed,v50OffsideFreezeSeconds));
 }
 const forward=piece.team===0?-1:1,spot=piece.spot;
 // A wide restart still develops toward the middle of the defended goal.
 const wide=clamp((Math.abs(spot.x-.5)-.16)/.3,0,1);
 const laneX=spot.x+(.5-spot.x)*wide*.85;
 const allies=m.people.filter(player=>player.t===piece.team&&!player.keeper&&player!==piece.taker);
 const rivals=m.people.filter(player=>player.t!==piece.team&&!player.keeper);
 const targets=new Map([[piece.taker,spot]]);
 const line=player=>player.assignedLine||player.line;
 allies.forEach((player,index)=>targets.set(player,{
  x:clamp(laneX+(player.bx-.5)*.65+(index%2?-.012:.012),.08,.92),
  y:clamp(spot.y+forward*{def:-.24,mid:.015,att:.16}[line(player)],.1,.9)
 }));
 rivals.forEach((player,index)=>targets.set(player,{
  x:clamp(laneX+(player.bx-.5)*.65+(index%2?-.012:.012),.08,.92),
  y:clamp(spot.y+forward*{def:.24,mid:.12,att:-.09}[line(player)],.1,.9)
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
