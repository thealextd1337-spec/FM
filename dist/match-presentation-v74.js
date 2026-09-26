'use strict';

const v74MinuteSeconds=75/90;
function v74ClockLabel(m=match){
 if(!m)return'00′';
 const firstEnd=m.firstHalfEnd||37.5,firstAdded=m.addedMinutes?.[0]||0;
 if(m.halftimePause>0)return firstAdded?`45+${firstAdded}′`:'45′';
 if(!m.halftimeBreakDone){
  if(m.elapsed>=37.5&&firstAdded)return`45+${Math.min(firstAdded,Math.max(1,Math.ceil((m.elapsed-37.5)/v74MinuteSeconds)))}′`;
  return`${String(displayMatchMinute(m.elapsed)).padStart(2,'0')}′`;
 }
 const secondEnd=firstEnd+37.5,secondAdded=m.addedMinutes?.[1]||0;
 if(m.elapsed>=secondEnd&&secondAdded)return`90+${Math.min(secondAdded,Math.max(1,Math.ceil((m.elapsed-secondEnd)/v74MinuteSeconds)))}′`;
 return`${String(displayMatchMinute(m.elapsed)).padStart(2,'0')}′`;
}
v25ClockParts=function(){
 const m=match;if(!m)return['00','00'];
 const firstEnd=m.firstHalfEnd||37.5,secondBaseline=firstEnd+37.5;
 if(m.halftimePause>0||!m.halftimeBreakDone&&m.elapsed>=37.5&&(m.addedMinutes?.[0]||0)>0||m.halftimeBreakDone&&m.elapsed>=secondBaseline&&(m.addedMinutes?.[1]||0)>0){
  const added=v74ClockLabel(m).match(/\+(\d+)/)?.[1];
  return[m.halftimeBreakDone?'90':'45','00',added];
 }
 const playedSeconds=Math.max(0,Math.floor((m.halftimeBreakDone?37.5+Math.max(0,m.elapsed-firstEnd):m.elapsed)*72));
 return[String(Math.min(90,Math.floor(playedSeconds/60))).padStart(2,'0'),String(playedSeconds%60).padStart(2,'0')];
};
const v74BaseTeamStats=updateTeamStats;
updateTeamStats=function(){const result=v74BaseTeamStats();if(match)$('#clock').textContent=v74ClockLabel(match);return result};
const v74BaseNote=note;
note=function(text,kind){const result=v74BaseNote(text,kind);if(match&&kind&&kind!=='normal'){const time=$('#log time');if(time)time.textContent=v74ClockLabel(match)}return result};
const v74BaseStep=step;
step=function(delta,realDelta){
 const m=match;
 if(m&&!m.finished){
  m.stoppageLost??=[0,0];m.addedMinutes??=[0,0];m.stoppageAnnounced??=[false,false];
  const half=m.halftimeBreakDone?1:0;
  if(!m.halftimePause&&!m.fulltimePending){
   const paused=m.goalPause>0||Boolean(m.setPiece)||Boolean(m.postBanner?.kind==='goal')||Boolean(m.throwIn);
   const baseline=half?(m.firstHalfEnd||37.5)+37.5:37.5;
   if(paused&&m.elapsed<baseline){m.stoppageLost[half]+=Math.max(0,realDelta)*(m.throwIn?.82:1);m.addedMinutes[half]=Math.min(5,Math.round(m.stoppageLost[half]*.45))}
  }
  m.firstHalfEnd=37.5+m.addedMinutes[0]*v74MinuteSeconds;
  m.fullTimeEnd=m.whistleAttackUntil||75+(m.addedMinutes[0]+m.addedMinutes[1])*v74MinuteSeconds;
 }
 const result=v74BaseStep(delta,realDelta);
 if(m&&!m.finished){
  const half=m.halftimeBreakDone?1:0,baseline=half?(m.firstHalfEnd+37.5):37.5;
  if(m.addedMinutes?.[half]>0&&m.elapsed>=baseline&&!m.stoppageAnnounced[half]&&!m.halftimePause){m.stoppageAnnounced[half]=true;note(`Nachspielzeit: +${m.addedMinutes[half]} Minuten.`, 'major')}
 }
 return result;
};

// Die Engine behält ihre einheitlichen Spielfeldkoordinaten. Die Ansicht dreht
// zur zweiten Hälfte beide Mannschaften samt Ball und Markierungen um 180°.
let v74DrawingTurnedField=false;
const v74BaseVisualPositions=v44VisualPositions;
v44VisualPositions=function(people){
 const points=v74BaseVisualPositions(people);
 if(match?.halftimeBreakDone&&!v74DrawingTurnedField)for(const point of points){point.x=600-point.x;point.y=740-point.y}
 return points;
};
const v74BaseDraw=draw;
draw=function(){
 if(!match?.halftimeBreakDone)return v74BaseDraw();
 const saved=[],turn=point=>{if(!point||!Number.isFinite(point.x)||!Number.isFinite(point.y))return;saved.push([point,point.x,point.y]);point.x=1-point.x;point.y=1-point.y};
 for(const player of match.people)turn(player);
 turn(match.ball);
 if(match.offsideVisual){const scene=match.offsideVisual;turn(scene);saved.push([scene,'lineY',scene.lineY]);scene.lineY=1-scene.lineY}
 if(match.slide){turn(match.slide.from);turn(match.slide.target)}
 v74DrawingTurnedField=true;
 try{return v74BaseDraw()}finally{
  v74DrawingTurnedField=false;
  for(let index=saved.length-1;index>=0;index--){const [point,x,y]=saved[index];if(x==='lineY')point.lineY=y;else{point.x=x;point.y=y}}
 }
};
