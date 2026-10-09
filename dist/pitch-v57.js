// Free-kick players move into a visible restart shape while the banner is shown.
function v119FreeKickWall(m,piece){
 const depth=piece.team===0?piece.spot.y:1-piece.spot.y;
 // The existing native direct-shot eligibility is a threat, not a predicted
 // random shot decision. Pass restarts and offside restarts keep their shape.
 if(piece.type!=='freeKick'||depth>=.38||piece.spot.x<=.18||piece.spot.x>=.82)return null;
 const s=v150Scale(m),dx=(.5-piece.spot.x)*s.x,dy=((piece.team===0?v55Field.top:v55Field.bottom)-piece.spot.y)*s.y,d=Math.hypot(dx,dy);
 if(d<9.8)return null; // A direct foul in this central penalty area is a penalty.
 const ux=dx/d,uy=dy/d,centre={x:piece.spot.x+ux*9.15/s.x,y:piece.spot.y+uy*9.15/s.y};
 const targets=[-.55,.55].map(offset=>({x:centre.x-uy*offset/s.x,y:centre.y+ux*offset/s.y}));
 if(targets.some(p=>p.x<v55Field.left||p.x>v55Field.right||p.y<v55Field.top||p.y>v55Field.bottom))return null;
 const rivals=m.people.filter(p=>p.t!==piece.team&&!p.keeper).sort((a,b)=>v122Metres(a,centre)-v122Metres(b,centre)||a.n-b.n);
 if(rivals.length<2)return null;
 return{version:119,players:rivals.slice(0,2).map((p,i)=>({pid:p.pid,...targets[i]}))};
}
function v57PositionFreeKick(realDelta){
 const m=match,piece=m?.setPiece;
 if(m&&typeof v114PositionRestart==='function')v114PositionRestart(m,realDelta);
 if(!piece||!['freeKick','offside'].includes(piece.type)||!['waiting','fading'].includes(piece.phase))return;
 const previousElapsed=piece.positionElapsed||0;
 piece.positionElapsed=previousElapsed+realDelta;
 // Let the full offside snapshot remain still long enough to inspect before players move.
 if(piece.type==='offside'){
  if(piece.positionElapsed<v50OffsideFreezeSeconds)return;
  if(m.offsideVisual&&typeof v65WorldActive!=='undefined'&&v65WorldActive)v115OffsideBalls.set(m,{piece,start:{...m.ball},at:v102Clock(m)});
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
 if(piece.wall?.version===119)for(const point of piece.wall.players){const player=rivals.find(p=>p.pid===point.pid);if(player)targets.set(player,{x:point.x,y:point.y});}
 const fraction=Math.min(1,realDelta*3.4);
 const world=typeof v65WorldActive!=='undefined'&&v65WorldActive;
 for(const[player,target]of targets){if(typeof v113FoulLocked==='function'&&v113FoulLocked(m,player))continue;const foul=typeof v113Fouls!=='undefined'&&v113Fouls.get(m)?.piece===piece;if(world||foul)v55Approach(player,target,realDelta*(foul?.6:1));else{player.x+=(target.x-player.x)*fraction;player.y+=(target.y-player.y)*fraction;player.tx=player.x;player.ty=player.y}}
 if(world){const remaining=Math.max(...[...targets].map(([p,t])=>Math.hypot((t.x-p.x)*v160PitchWidth()/(v55Field.right-v55Field.left),(t.y-p.y)*v160PitchLength()/(v55Field.bottom-v55Field.top))/(3+ability(p,'spd')*.14)));if(remaining>.05)piece.wait=Math.max(piece.wait,remaining+.15);}
 if(piece.type==='offside')m.ball={...spot};
}
const v57BaseStep=step;
step=function(delta,realDelta){v57PositionFreeKick(realDelta);return v57BaseStep(delta,realDelta)};

const v57BaseVersion=v50Version;
v50Version=function(){v57BaseVersion();document.querySelectorAll('footer span:first-child').forEach(label=>label.textContent='Doppel 6 / PROTOTYP 57');const footer=startScreen?.querySelector('footer');if(footer)footer.textContent='Doppel 6 / PROTOTYP 57'};
v50Version();
