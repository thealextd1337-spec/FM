'use strict';

const v13Note=note;note=function(text,kind){if(text==='Halbzeit - der Matchplan bleibt unverändert.')return;v13Note(text,kind)};
function beginHalftimeBreak(){
 if(match.halftimeBreakDone)return;match.halftimeBreakDone=true;match.halftimePending=false;match.halftimePause=2;match.elapsed=37.5;match.owner=null;match.flight=null;match.kickoff=null;match.pendingKickoff=null;match.countdown=0;match.goalPause=0;match.ball={x:.5,y:.5};match.next=Infinity;$('#board-label').textContent='HALBZEIT';note('Halbzeitpfiff. Kurze Pause vor der zweiten Hälfte.','major');showOverlay('HALBZEIT','Kurze Pause · Der Gegner stößt danach an',false);updateTeamStats();
}
function startSecondHalf(){
 match.halftimePause=0;$('#board-label').textContent='LIVE';kickoff(1);beginKickoff();note('Anpfiff zur zweiten Halbzeit. Der Gegner spielt an.','restart');
}
const v13Step=step;step=function(delta,realDelta){
 if(!match||match.finished)return v13Step(delta,realDelta);
 if(match.halftimePause>0){match.halftimePause=Math.max(0,match.halftimePause-realDelta);if(match.halftimePause<=0)startSecondHalf();updateTeamStats();return}
 if(match.halftimePending){const held=match.elapsed;v13Step(delta,realDelta);match.elapsed=held;if(!match.flight&&match.goalPause<=0)beginHalftimeBreak();updateTeamStats();return}
 if(!match.halftime&&match.elapsed<37.5&&match.elapsed+delta>=37.5)match.next=Infinity;
 v13Step(delta,realDelta);
 if(match.halftime&&!match.halftimeBreakDone){match.elapsed=37.5;if(match.flight)match.halftimePending=true;else beginHalftimeBreak()}
};
document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='SECHSER / PROTOTYP 14');
