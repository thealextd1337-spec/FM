'use strict';

const v13Note=note;note=function(text,kind){if(text==='Halbzeit - der Matchplan bleibt unverändert.')return;v13Note(text,kind)};
function beginHalftimeBreak(){
 if(match.halftimeBreakDone)return;match.halftimeBreakDone=true;match.halftimePending=false;match.halftimePause=2;match.elapsed=match.firstHalfEnd||37.5;match.owner=null;match.flight=null;match.kickoff=null;match.pendingKickoff=null;match.countdown=0;match.goalPause=0;match.ball={x:.5,y:.5};match.next=Infinity;$('#board-label').textContent='HALBZEIT';note('Halbzeitpfiff. Kurze Pause vor der zweiten Hälfte.','major');showOverlay('HALBZEIT','Kurze Pause · Der Gegner stößt danach an',false);updateTeamStats();
}
function startSecondHalf(){
 // A new half starts already in kickoff formation. Preserve the half-time
 // marker while arranging it, so the post-goal walk-back is not reused here.
 const world=typeof v65WorldActive!=='undefined'&&v65WorldActive;
 if(world){match.halftimePause=Math.max(.001,match.halftimePause);match.slide=null;for(const p of match.people){p.slideActive=false;p.recoverUntil=0;p.interceptTarget=null;p.motionX=0;p.motionY=p.t===0?-1:1;}v121PositioningSamples.delete(match);}
 $('#board-label').textContent='LIVE';kickoff(1);match.halftimePause=0;beginKickoff();note('Anpfiff zur zweiten Halbzeit. Der Gegner spielt an.','restart');
}
const v13Step=step;step=function(delta,realDelta){
 if(!match||match.finished)return v13Step(delta,realDelta);
 if(match.halftimePause>0){match.halftimePause=Math.max(0,match.halftimePause-realDelta);if(match.halftimePause<=0)startSecondHalf();updateTeamStats();return}
 if(match.halftimePending){const held=match.elapsed,attack=match.halftimeAttackTeam!==undefined;v13Step(delta,realDelta);if(attack){const extra=Math.max(0,match.elapsed-held);match.halftimeExtension=(match.halftimeExtension||0)+extra;match.firstHalfEnd=(match.firstHalfEnd||37.5)+extra;}else match.elapsed=held;if(!match.flight&&match.goalPause<=0&&(!attack||!v131AttackContinues(match,match.halftimeAttackTeam)||(match.halftimeExtension||0)>=20*MATCH_SPEED))beginHalftimeBreak();updateTeamStats();return}
 if(!match.halftime&&match.elapsed<(match.firstHalfEnd||37.5)&&match.elapsed+delta>=(match.firstHalfEnd||37.5)&&!(typeof v65WorldActive!=='undefined'&&v65WorldActive&&v15ClearChance(match)))match.next=Infinity;
 v13Step(delta,realDelta);
 if(match.halftime&&!match.halftimeBreakDone){match.elapsed=match.firstHalfEnd||37.5;if(match.flight)match.halftimePending=true;else beginHalftimeBreak()}
};
document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='Doppel 6 / PROTOTYP 39');
