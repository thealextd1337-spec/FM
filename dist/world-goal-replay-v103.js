'use strict';

// Short-lived pictures of actual play. No saved replays or second simulation.
const v103Replays=new WeakMap();
let v103HeldStep=null;
function v103ReplayState(current){
 let state=v103Replays.get(current);if(!state){state={history:[],pending:null,active:null,penalty:null};v103Replays.set(current,state)}return state;
}
function v103CanReplay(){return v98IsWorld()&&v98View==='3d'&&v98Orientation.matches&&!v98Failed}
function v103Record(current){
 const state=v103ReplayState(current),frame=v98PitchFrame(current);
 state.history.push(frame);while(state.history.length>180||state.history[0].clock<frame.clock-7)state.history.shift();
}
function v103ReplaySample(frames,time){
 let index=0;while(index<frames.length-2&&frames[index+1].clock<time)index++;
 const a=frames[index],b=frames[index+1]||a,span=b.clock-a.clock;
 return v102Interpolate(a,b,span?Math.max(0,Math.min(1,(time-a.clock)/span)):1);
}
function v103EndReplay(current=match){
 const state=current&&v103Replays.get(current);if(!state)return;
 if(state.active?.penalty)v50ClearPenaltyScene();
 state.active=null;state.pending=null;v98CameraPose=null;
 $('#v103-replay-hud')?.remove();document.body.classList.remove('v103-replay-paused');
}
function v103ReplayUI(){
 const active=match&&v103Replays.get(match)?.active;
 if(!active){$('#v103-replay-hud')?.remove();return}
 let hud=$('#v103-replay-hud');
 if(!hud){
  hud=document.createElement('div');hud.id='v103-replay-hud';
  hud.innerHTML='<span role="status"></span><button type="button"></button>';
  hud.querySelector('button').addEventListener('click',()=>{v103EndReplay();draw();$('#v100-pitch-toggle')?.focus({preventScroll:true})});
  $('#match-area .v42-pitch-stage').append(hud);
 }
 hud.querySelector('span').textContent=v98Text('WIEDERHOLUNG','REPLAY');hud.querySelector('button').textContent=v98Text('Überspringen →','Skip replay →');
 const paused=!running||v47PlayerDialog.open||document.hidden;
 if(document.body.classList.contains('v103-replay-paused')!==paused)document.body.classList.toggle('v103-replay-paused',paused);
 hideOverlay();
}
function v103StartReplay(current,state){
 const pending=state.pending;if(!pending||!v103CanReplay())return false;
 const frames=state.history.filter(f=>f.clock>=pending.at-2.5&&f.clock<=pending.at+.85);
 if(!pending.penalty&&frames.length<2){state.pending=null;return false}
 state.active={frames,elapsed:0,at:performance.now(),duration:pending.penalty?2.2:(frames.at(-1).clock-frames[0].clock)/.72,penalty:pending.penalty,lastFrame:null};
 state.pending=null;v98CameraPose=null;
 if(state.active.penalty){const p=state.active.penalty;v50PenaltyVisual(p,{side:0,number:p.taker.n,name:p.taker.name,goal:true,outcome:'goal',shotSide:p.shotSide,diveSide:p.diveSide})}
 v103ReplayUI();return true;
}
function v103ReplayFrame(now,live){
 const state=match&&v103Replays.get(match),active=state?.active;if(!active||active.penalty)return null;
 if(!live&&active.lastFrame)return active.lastFrame;
 const extra=live&&!document.hidden?Math.min(.05,Math.max(0,(now-active.at)/1000)):0;
 const time=active.frames[0].clock+(active.elapsed+extra)*.72;
 return active.lastFrame=v103ReplaySample(active.frames,time);
}
const v103BasePenalty=v50TakePenalty;
v50TakePenalty=function(piece){
 const result=v103BasePenalty(piece);
 if(v65WorldActive&&piece.outcome==='goal')v103ReplayState(match).penalty={team:piece.team,taker:piece.taker,shotSide:piece.shotSide,diveSide:piece.diveSide};
 return result;
};
const v103BaseGoal=v50Goal;
v50Goal=function(scorer,keeper,penalty,...args){
 const result=v103BaseGoal(scorer,keeper,penalty,...args);
 if(v65WorldActive&&match){const state=v103ReplayState(match);state.pending={at:v102Clock(match),penalty:penalty?state.penalty:null};state.penalty=null;v103Record(match)}
 return result;
};
const v103BaseStep=step;
step=function(delta,realDelta){
 v103HeldStep=null;const current=match,state=current&&v103Replays.get(current);
 if(v65WorldActive&&current&&state){
  if(state.active){
   if(!v103CanReplay())v103EndReplay(current);
   else{
    v103HeldStep=current;
    if(running&&!v47PlayerDialog.open&&!document.hidden){state.active.elapsed+=Math.max(0,realDelta);state.active.at=performance.now();if(state.active.elapsed>=state.active.duration)v103EndReplay(current)}
    return;
   }
  }
  if(state.pending&&current.goalPause>0&&current.goalPause<=realDelta&&running&&!v47PlayerDialog.open&&v103StartReplay(current,state)){v103HeldStep=current;return}
 }
 const result=v103BaseStep(delta,realDelta);
 if(v65WorldActive&&current===match&&running&&!v47PlayerDialog.open&&!current.finished)v103Record(current);
 return result;
};
const v103BaseAfterStep=v65AfterStep;
v65AfterStep=function(context){if(v103HeldStep===match)return;return v103BaseAfterStep(context)};
const v103BaseDraw=draw;
draw=function(){
 if(match&&v103Replays.get(match)?.active&&!v103CanReplay())v103EndReplay();
 const result=v103BaseDraw();v103ReplayUI();return result;
};
const v103BaseDispose=v98Dispose;
v98Dispose=function(){if(v98Match)v103EndReplay(v98Match);return v103BaseDispose()};
document.addEventListener('visibilitychange',()=>{if(match&&v103Replays.get(match)?.active)v103ReplayUI()});
const v103BaseControls=v65UpdateControls;
v65UpdateControls=function(...args){const result=v103BaseControls(...args);v103ReplayUI();return result};
new MutationObserver(()=>{if(match&&v103Replays.get(match)?.active)v103ReplayUI()}).observe(v47PlayerDialog,{attributes:true,attributeFilter:['open']});
const v103Style=document.createElement('style');
v103Style.textContent=`#v103-replay-hud{position:absolute;top:8px;left:8px;z-index:12;display:flex;align-items:center;gap:8px;padding:4px 5px 4px 10px;border:1px solid #79978c;border-radius:7px;background:#142b30f2;color:#f4f8ed;font:800 11px/1.2 Arial}#v103-replay-hud span{letter-spacing:1px}#v103-replay-hud button{min-height:40px;padding:8px 12px;border:0;border-radius:4px;background:#c7f36b;color:#142629;font:700 12px Arial;cursor:pointer}#v103-replay-hud button:focus-visible{outline:2px solid white;outline-offset:2px}.v103-replay-paused #v50-penalty-scene *{animation-play-state:paused!important}@media(pointer:coarse){#v103-replay-hud button{min-height:44px}}`;
document.head.append(v103Style);
