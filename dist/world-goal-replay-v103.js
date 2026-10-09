'use strict';

// Short-lived pictures of actual play. No saved replays or second simulation.
const v103Replays=new WeakMap();
let v103HeldStep=null,v132ReviewLoop=0;
function v103ReplayState(current){
 let state=v103Replays.get(current);if(!state){state={history:[],timeline:[],markers:[],review:null,pending:null,active:null,penalty:null};v103Replays.set(current,state)}return state;
}
function v103CanReplay(){return v98IsWorld()&&v98View==='3d'&&v98Orientation.matches&&!v98Failed}
function v103Record(current){
 const state=v103ReplayState(current),frame=v98PitchFrame(current);
 state.history.push(frame);while(state.history.length>180||state.history[0].clock<frame.clock-7)state.history.shift();
}
function v103ReplaySample(frames,time){
 let lo=0,hi=Math.max(0,frames.length-2);while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(frames[mid].clock<=time)lo=mid;else hi=mid-1;}const index=lo;
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
 const state=match&&v103Replays.get(match);if(state?.review&&state.timeline.length){const frames=state.timeline,time=state.review.time;let lo=0,hi=Math.max(0,frames.length-2);while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(frames[mid].clock<=time)lo=mid;else hi=mid-1;}const a=frames[lo],b=frames[lo+1]||a,q=clamp((time-a.clock)/Math.max(.00001,b.clock-a.clock),0,1);return {...v102Interpolate(a,b,q),review:{a,b,q}};}
 const active=state?.active;if(!active||active.penalty)return null;
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
 const current=match,before=current?.goals.length||0;
 const result=v103BaseGoal(scorer,keeper,penalty,...args);
 if(v65WorldActive&&match){const state=v103ReplayState(match);state.pending={at:v102Clock(match),penalty:penalty?state.penalty:null};state.penalty=null;v103Record(match);if(match===current&&current.goals.length>before)v132ReviewMarker(current,'goal',scorer.t,scorer.name)}
 return result;
};
const v132BaseRestart=v50Restart;
v50Restart=function(type,team,...args){
 const current=match,before=current?.setPiece,result=v132BaseRestart(type,team,...args);
 if(current===match&&current?.setPiece&&current.setPiece!==before&&current.setPiece.type===type)v132ReviewMarker(current,type,team,current.setPiece.taker?.name);
 return result;
};
const v103BaseStep=step;
step=function(delta,realDelta){
 v103HeldStep=null;const current=match,state=current&&v103Replays.get(current);
 if(v65WorldActive&&current&&state){
  if(state.review){v103HeldStep=current;return;}
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
 const result=v103BaseDraw();v103ReplayUI();v131ReviewUI();return result;
};
const v103BaseDispose=v98Dispose;
v98Dispose=function(){v132StopReview();if(!v98IsWorld()||v132HalfFullscreenMatch!==match)v132HalfFullscreenMatch=null;if(v98Match)v103EndReplay(v98Match);return v103BaseDispose()};
document.addEventListener('visibilitychange',()=>{if(document.hidden)v132StopReview();if(match&&v103Replays.get(match)?.active)v103ReplayUI();v131ReviewUI()});
const v103BaseControls=v65UpdateControls;
v65UpdateControls=function(...args){const result=v103BaseControls(...args);v103ReplayUI();v131ReviewUI();return result};
// Recorded render poses are separate from all live animation and simulation state.
// Six samples/second for this entire match. Float matrices avoid retaining rig objects.
function v131RecordRendered(frame){
 if(!match||!running||!v103CanReplay())return;
 const state=v103ReplayState(match);if(state.timeline.at(-1)?.clock>frame.clock){state.timeline=[];state.markers=[];}if(state.active||state.review||state.timeline.at(-1)?.clock>frame.clock-1/6)return;
 if(state.timeline.at(-1)?.clock>frame.clock)state.timeline=[];
 const poses=new Map(),T=THREE;
 for(const [id,v]of v98Players){v.root.updateMatrixWorld(true);const inverse=v.root.matrixWorld.clone().invert(),groups=[v.body,...v.limbs,...v.knees,...v.feet,...v.elbows,v.neck];poses.set(id,{root:v.root.position.toArray(),rotation:v.root.quaternion.toArray(),bones:v.meshy?new Float32Array(v.meshy.skeleton.bones.flatMap(b=>inverse.clone().multiply(b.matrixWorld).toArray())):null,groups:groups.map(g=>[...g.position.toArray(),...g.quaternion.toArray(),...g.scale.toArray()])});}
 const copy={...frame,ball:{...frame.ball},poses,players:frame.players.map(p=>({...p,action:p.action&&structuredClone(p.action),movement:p.movement&&structuredClone(p.movement),person:{pid:p.id,t:p.team,n:p.number,keeper:p.keeper,name:p.person.name,x:p.person.x,y:p.person.y,appearance:structuredClone(p.person.appearance)}}))};
 state.timeline.push(copy);
}
function v131ReviewPose(v,id,review){
 const a=review.a.poses.get(id),b=review.b.poses.get(id)||a;if(!a)return false;
 const T=THREE,q=review.q,groups=[v.body,...v.limbs,...v.knees,...v.feet,...v.elbows,v.neck];v.root.position.fromArray(a.root).lerp(new T.Vector3().fromArray(b.root),q);v.root.quaternion.fromArray(a.rotation).slerp(new T.Quaternion().fromArray(b.rotation),q);
 for(const [i,g]of groups.entries()){const x=a.groups[i],y=b.groups[i]||x;g.position.fromArray(x).lerp(new T.Vector3().fromArray(y),q);g.quaternion.fromArray(x,3).slerp(new T.Quaternion().fromArray(y,3),q);g.scale.fromArray(x,7).lerp(new T.Vector3().fromArray(y,7),q);}
 v.root.updateMatrixWorld(true);
 if(v.meshy&&a.bones&&b.bones){for(const [i,bone]of v.meshy.skeleton.bones.entries()){const x=new T.Matrix4().fromArray(a.bones,i*16),y=new T.Matrix4().fromArray(b.bones,i*16),p=new T.Vector3(),r=new T.Quaternion(),s=new T.Vector3(),p2=new T.Vector3(),r2=new T.Quaternion(),s2=new T.Vector3();x.decompose(p,r,s);y.decompose(p2,r2,s2);bone.matrixWorld.copy(v.root.matrixWorld).multiply(x.compose(p.lerp(p2,q),r.slerp(r2,q),s.lerp(s2,q)));}v.meshy.skeleton.update();}
 v.label.disabled=true;return true;
}
function v131PauseMatch(){
 const context=v65Context();if(!context||context.state.phase!=='live')return;
 context.state.phase='paused';running=false;clearInterval(v65WorldFrame);v65PauseRequested=false;v65PauseView=false;$('#board-label').textContent='PAUSE';v65Snapshot(context);v65UpdateControls(context);v58Refresh();
}
function v131Seek(time){
 const context=v65Context(),state=match&&v103ReplayState(match);if(!context||!state?.timeline.length)return;
 v132StopReview();
 v103EndReplay();state.review={time:clamp(Number(time),state.timeline[0].clock,state.timeline.at(-1).clock)};
 v131PauseMatch();
 v98CameraPose=null;draw();
}
function v131ReturnLive(resume=true){
 const state=match&&v103Replays.get(match);if(!state?.review)return;v132StopReview();state.review=null;v98CameraPose=null;if(v98Scene)v98Scene.controlBall=null;v102Frames=null;draw();if(resume&&!match.finished)v65Resume();
}
const v131BaseResume=v65Resume;v65Resume=function(){v131ReturnLive(false);return v131BaseResume();};
const v132MarkerKinds={goal:['⚽','Tor','Goal'],corner:['⚑','Eckball','Corner'],freeKick:['F','Freistoß','Free kick'],offside:['A','Abseits','Offside'],penalty:['11','Elfmeter','Penalty']};
function v132ReviewMarker(current,kind,team,name=''){
 if(!v65WorldActive||!v132MarkerKinds[kind])return;
 const state=v103ReplayState(current);state.markers.push({id:(state.markers.at(-1)?.id||0)+1,kind,team,name,clock:v102Clock(current),elapsed:current.elapsed,minute:v74ClockLabel(current)});
}
function v132StopReview(){
 if(v132ReviewLoop)cancelAnimationFrame(v132ReviewLoop);v132ReviewLoop=0;
 const review=match&&v103Replays.get(match)?.review;if(review)review.playing=false;
}
function v132ReviewTick(now){
 v132ReviewLoop=0;const state=match&&v103Replays.get(match),review=state?.review;
 if(!review?.playing)return;
 if(!v103CanReplay()||document.hidden||v47PlayerDialog.open){v132StopReview();v131ReviewUI();return;}
 review.time=Math.min(state.timeline.at(-1).clock,review.time+clamp((now-review.at)/1000,0,.1));review.at=now;
 if(review.time>=state.timeline.at(-1).clock)review.playing=false;
 const maxFps=v98Scene?.quality?.maxFps||0;
 if(!review.playing||!maxFps||now-v98LastTime>=1000/maxFps-.5)v98Render();
 v131ReviewUI();if(review.playing)v132ReviewLoop=requestAnimationFrame(v132ReviewTick);
}
function v132ToggleReview(){
 const state=match&&v103ReplayState(match);if(!state)return;
 if(!state.review||state.review.time>=state.timeline.at(-1)?.clock){
  if(match.finished)return;
  if(state.review)v131ReturnLive();else if(running)v131PauseMatch();else v65Resume();
  draw();return;
 }
 if(state.timeline.length<2)return;
 if(state.review?.playing){v132StopReview();v131ReviewUI();return;}
 state.review.playing=true;state.review.at=performance.now();v131ReviewUI();v132ReviewLoop=requestAnimationFrame(v132ReviewTick);
}
function v132MarkerUI(panel,state,frames){
 const track=panel.querySelector('.v132-markers'),events=panel.querySelector('.v132-events'),first=Number(frames[0]?.clock||0),last=Number(frames.at(-1)?.clock||0),markers=(state?.markers||[]).filter(marker=>frames.length&&marker.clock>=first-.2&&marker.clock<=last+.2);
 const menu=panel.querySelector('.v119-event-menu');menu.hidden=!markers.length;if(!markers.length)menu.open=false;const summary=menu.querySelector('summary');summary.textContent='⋮';summary.title=v98Text('Ereignisse','Events')+' ('+markers.length+')';summary.setAttribute('aria-label',summary.title);events.hidden=!markers.length;events.setAttribute('aria-label',v98Text('Ereignisse in der Rückschau','Recorded match events'));
 const language=v98Text('de','en'),key=language+':'+markers.map(marker=>marker.id).join('/');
 if(events.dataset.key!==key){events.dataset.key=key;events.replaceChildren();for(const marker of markers){const [symbol,de,en]=v132MarkerKinds[marker.kind],name=v98Text(de,en),minute=marker.minute||Math.max(1,Math.floor(marker.elapsed*90/75))+'′',button=document.createElement('button');button.type='button';button.dataset.kind=marker.kind;button.dataset.clock=marker.clock;button.textContent=`${symbol} ${minute}`;button.title=`${name} · ${minute}${marker.name?' · '+marker.name:''}`;button.setAttribute('aria-label',button.title);button.addEventListener('click',()=>{v131Seek(marker.clock-3);menu.open=false;summary.focus();});events.append(button);}}
 const rangeKey=key+':'+first+':'+last;if(track.dataset.key!==rangeKey){track.dataset.key=rangeKey;track.replaceChildren();for(const marker of markers){const pin=document.createElement('span');pin.dataset.kind=marker.kind;pin.textContent=v132MarkerKinds[marker.kind][0];pin.style.left=100*clamp((Math.max(first,marker.clock-3)-first)/Math.max(.001,last-first),0,1)+'%';track.append(pin);}}
}
function v131ReviewUI(){
 const state=match&&v103Replays.get(match),stage=$('#match-area .v42-pitch-stage');let panel=$('#v131-review');
 if(!stage||!v103CanReplay()){v132StopReview();panel?.remove();return;}
 if(!panel){panel=document.createElement('div');panel.id='v131-review';panel.innerHTML='<label><span></span><span class="v132-track"><input type="range" min="0" max="0" step="0.01"><span class="v132-markers" aria-hidden="true"></span></span></label><output></output><button type="button" data-v132-play></button><button type="button" data-v132-live></button><details class="v119-event-menu"><summary></summary><nav class="v132-events"></nav></details>';stage.append(panel);v132RevealControls(stage);panel.querySelector('input').addEventListener('input',e=>v131Seek(e.target.value));panel.querySelector('[data-v132-live]').addEventListener('click',()=>v131ReturnLive());panel.querySelector('[data-v132-play]').addEventListener('click',v132ToggleReview);panel.addEventListener('keydown',event=>{if(event.key==='Escape'){const menu=panel.querySelector('.v119-event-menu');if(menu.open){menu.open=false;menu.querySelector('summary').focus();event.stopPropagation();event.preventDefault();}}});panel.addEventListener('focusout',event=>{if(event.relatedTarget&&panel.contains(event.relatedTarget))return;requestAnimationFrame(()=>{if(!panel.contains(document.activeElement))panel.querySelector('.v119-event-menu').open=false;});});}
 const frames=state?.timeline||[],slider=panel.querySelector('input'),review=state?.review;panel.querySelector('span').textContent=v98Text('Rückschau','Match review');slider.setAttribute('aria-label',v98Text('Spielszene zurück- und vorspulen','Seek recorded match'));slider.min=frames[0]?.clock||0;slider.max=frames.at(-1)?.clock||0;slider.disabled=frames.length<2;slider.value=review?.time??slider.max;const recordedSince=v132Clock(frames[0]?.broadcast);slider.title=v98Text('Aufzeichnung dieser Sitzung seit ','This session recorded since ')+recordedSince+v98Text('; nach Neuladen beginnt die Aufzeichnung neu.','; recording starts again after reload.');slider.setAttribute('aria-description',slider.title);
 const sample=frames.length?v103ReplaySample(frames,Number(slider.value)):null,info=sample?.broadcast||v132Broadcast(match);panel.querySelector('output').textContent=(review?.playing?'▶ · ':review?'Ⅱ · ':'LIVE · ')+v132Clock(info);panel.querySelector('[data-v132-live]').disabled=!review;
 const play=panel.querySelector('[data-v132-play]'),historical=review&&review.time<Number(slider.max),playing=historical?review.playing:running,requested=!historical&&running&&v65PauseRequested,playLabel=historical?(playing?v98Text('Rückschau pausieren','Pause review'):v98Text('Rückschau abspielen','Play review')):playing?(requested?v98Text('Pause angefordert','Pause requested'):v98Text('Spiel pausieren','Pause match')):match.halftimePause>0?v98Text('2. Halbzeit starten','Start second half'):v98Text('Spiel fortsetzen','Resume match');play.textContent=requested?'…':playing?'Ⅱ':'▶';play.title=playLabel;play.setAttribute('aria-label',playLabel);play.setAttribute('aria-pressed',String(Boolean(playing)));play.disabled=historical?frames.length<2:match.finished;const live=panel.querySelector('[data-v132-live]');live.title=v98Text('Zurück zu Live','Return to live');live.setAttribute('aria-label',live.title);live.textContent='● Live';v132MarkerUI(panel,state,frames);stage.style.setProperty('--v132-review-height',panel.offsetHeight+'px');
}
new MutationObserver(()=>{if(match&&v103Replays.get(match)?.active)v103ReplayUI()}).observe(v47PlayerDialog,{attributes:true,attributeFilter:['open']});
// Broadcast snapshots travel with pictures, never with a second match simulation.
let v132ScreenMatch=null,v132ScreenScroll=0,v132NativeScreen=false,v132ControlsTimer=0;
let v132HalfFullscreenMatch=null;
const v136BasePause=v65Pause;
v65Pause=function(...args){
 // Leave before the tactics layout hides the native fullscreen element.
 if(v65Context()?.state.phase==='live'&&match?.halftimePause>0&&!match.flight&&!match.slide&&(document.body.classList.contains('v132-fullscreen')||document.fullscreenElement===$('#match-area'))){
  v132HalfFullscreenMatch=match;v132LeaveFullscreen();
 }
 return v136BasePause(...args);
};
const v136BaseResume=v65Resume;
v65Resume=function(...args){
 const current=match,restore=current&&v132HalfFullscreenMatch===current&&current.halftimePause>0&&v65Context()?.state.phase==='paused';
 const result=v136BaseResume(...args);
 if(restore&&match===current&&v65Context()?.state.phase==='live'){
  v132HalfFullscreenMatch=null;
  // The start button's gesture also authorizes the native fullscreen request.
  if(!document.body.classList.contains('v132-fullscreen'))v132ToggleFullscreen();
 }
 return result;
};
function v132RevealControls(stage=$('#match-area .v42-pitch-stage')){
 if(!stage)return;clearTimeout(v132ControlsTimer);stage.classList.add('v132-show-controls');v132ControlsTimer=setTimeout(()=>stage.classList.remove('v132-show-controls'),2500);
}
function v132Broadcast(current){
 const context=v65Context();if(!context)return null;
 const competition=v62Current(context.career).find(item=>item.id===context.fixture.competitionId),firstEnd=current.firstHalfEnd||37.5,period=current.halftimeBreakDone?1:0;
 const added=current.halftimePause>0?current.addedMinutes?.[0]||0:current.elapsed>=(period?firstEnd+37.5:37.5)?current.addedMinutes?.[period]||0:0;
 const seconds=current.halftimePause>0?2700:added?(period?5400:2700):Math.max(0,(period?37.5+Math.max(0,current.elapsed-firstEnd):current.elapsed)*72);
 return {score:[...current.score],aggregate:v64UiAggregateText(context.career,context.fixture,current.score,context.ownSide===1),seconds,added,period,type:competition?.type||'league',country:competition?.country||null,division:v119LeagueDivision(competition),round:context.fixture.round,names:[0,1].map(t=>v65Club(context,t)?.name||''),colours:[current.kits?.user?.main||'#c7f36b',current.kits?.opponent?.main||'#8cc4ec']};
}
// Presentation identity only. The current schedule has six canonical first divisions.
function v119LeagueDivision(competition){
 if(competition?.type!=='league')return null;
 if(Number.isInteger(competition.division)&&competition.division>0)return competition.division;
 return /^S\d+:(?:GER|ENG|ESP|ITA|FRA|POR):LEAGUE$/.test(competition.id||'')?1:null;
}
const v119TVIdentity={
 GER:{accent:'#f1c95b',ink:'#2d2510',base:'#20292e',motif:'rails',font:'Arial,sans-serif'},
 ENG:{accent:'#dfb5fa',ink:'#2d153b',base:'#291638',motif:'block',font:'Arial,sans-serif'},
 ESP:{accent:'#ffba91',ink:'#3a1f14',base:'#35201e',motif:'stripe',font:'Arial,sans-serif'},
 ITA:{accent:'#a8caff',ink:'#10263d',base:'#122944',motif:'line',font:'Arial,sans-serif'},
 FRA:{accent:'#e6f79b',ink:'#243010',base:'#202d36',motif:'step',font:'Arial,sans-serif'},
 POR:{accent:'#a6ebcc',ink:'#143b2c',base:'#16352d',motif:'double',font:'Georgia,serif'}
};
function v119TVTheme(info){
 if(info.type==='europe')return {key:'europe',accent:'#c6bcff',ink:'#201a40',base:'#1a2040',motif:'stars',font:'Arial,sans-serif'};
 const identity=v119TVIdentity[info.country];
 if(!identity||!['league','cup'].includes(info.type))return {key:'unknown',accent:'#d4e0df',ink:'#1c2b30',base:'#203037',motif:'plain',font:'Arial,sans-serif'};
 return {...identity,key:info.country+'-'+info.type+(info.type==='league'?'-'+(info.division||'unknown'):''),motif:info.type==='cup'?'cup':identity.motif};
}
function v132Clock(info){const seconds=Math.floor(info?.seconds||0);return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0')+(info?.added?' +'+info.added:'');}
function v132BroadcastUI(frame){
 const stage=$('#match-area .v42-pitch-stage');if(!stage||!v98IsWorld()){$('#v132-tv')?.remove();$('#v119-screen-tactics')?.remove();return;}
 let tv=$('#v132-tv');if(!tv){tv=document.createElement('aside');tv.id='v132-tv';tv.innerHTML='<div class="v132-tv-kind"></div><div class="v132-tv-board"><span data-tv-team="0"></span><div class="v141-tv-score"><strong></strong><span class="v141-tv-aggregate" hidden></span></div><span data-tv-team="1"></span><time></time></div><small></small>';stage.append(tv);}
 const state=v103Replays.get(match),sample=frame||(!state?.review&&!state?.active?v98PitchFrame(match):v103ReplayFrame(performance.now(),false)),info=sample?.broadcast||v132Broadcast(match);if(!info)return;
 const round=/^(?:R)?(\d+)$/.exec(info.round),roundLabel=round?v98Text('Spieltag ','Matchday ')+round[1]:({QF:v98Text('Viertelfinale','Quarter-final'),SF:v98Text('Halbfinale','Semi-final'),F:v98Text('Finale','Final')})[info.round];
 const kind=info.type==='league'?v98Text('Ligaspiel','League match'):info.type==='cup'?v98Text('Pokalspiel','Cup match'):v98Text('Europacup','European cup');
 const identity=v119TVTheme(info);tv.dataset.competition=identity.key;tv.dataset.motif=identity.motif;for(const name of ['accent','ink','base','font'])tv.style.setProperty('--tv-'+name,identity[name]);const country=info.country&&v61CountryNames[info.country];const competitionLabel=info.type==='league'&&country?v98Text(country,window.doppel6Language?.localize(country)||country)+' · '+v98Text('Liga','League')+(info.division?' '+info.division:''):info.type==='cup'&&country?v98Text(country,window.doppel6Language?.localize(country)||country)+' · '+v98Text('Pokal','Cup'):kind;const caption=competitionLabel+(roundLabel?' · '+roundLabel:'');tv.querySelector('.v132-tv-kind').textContent=caption;
 for(const t of [0,1]){const node=tv.querySelector(`[data-tv-team="${t}"]`);node.textContent=info.names[t].replace(/^(?:FC|CF|AC|SC|SV|AS)\s+/i,'').slice(0,3).toLocaleUpperCase();node.title=info.names[t];node.style.setProperty('--kit',info.colours[t]);}
 tv.querySelector('strong').textContent=info.score.join(' : ');
 const aggregate=tv.querySelector('.v141-tv-aggregate');aggregate.hidden=!info.aggregate;aggregate.textContent=info.aggregate||'';aggregate.setAttribute('aria-label',v98Text('Gesamt','Aggregate')+' '+(info.aggregate||''));
 const clock=v132Clock(info);tv.querySelector('time').textContent=clock;
 const status=state?.review?v98Text('Rückschau','Match review'):state?.active?v98Text('Wiederholung','Replay'):match.finished?v98Text('Abpfiff','Full time'):match.halftimePause>0?v98Text('Halbzeit','Half time'):running?'LIVE':v98Text('Pause','Paused');tv.querySelector('small').textContent=status;tv.setAttribute('aria-label',`${caption} · ${info.names[0]} ${info.score[0]} : ${info.score[1]} ${info.names[1]}${info.aggregate?' · '+v98Text('Gesamt','Aggregate')+' '+info.aggregate:''} · ${clock} · ${status}`);
}
function v132ScreenState(active){
 if(active&&!document.body.classList.contains('v132-fullscreen'))v132ScreenScroll=window.scrollY;
 document.body.classList.toggle('v132-fullscreen',active);v132ScreenMatch=active?match:null;
 syncMatchWakeLock();
 if(!active){v132NativeScreen=false;window.scrollTo(0,v132ScreenScroll);}
}
function v132LeaveFullscreen(){
 const active=document.body.classList.contains('v132-fullscreen');if(!active&&document.fullscreenElement!==$('#match-area'))return;v132ScreenState(false);
 if(document.fullscreenElement===$('#match-area'))document.exitFullscreen().catch(()=>{});
 if(active)requestAnimationFrame(()=>{if(v98IsWorld())draw()});
}
async function v132ToggleFullscreen(){
 if(document.body.classList.contains('v132-fullscreen')){v132LeaveFullscreen();return;}
 const area=$('#match-area');if(!area||!v98IsWorld())return;
 v132ScreenState(true);
 v132RevealControls();
 try{if(area.requestFullscreen){await area.requestFullscreen();v132NativeScreen=document.fullscreenElement===area;}}
 catch(error){/* iOS/embedded browsers use the same viewport-filling layout. */}
 if(v132ScreenMatch!==match||!v98IsWorld()){v132LeaveFullscreen();return;}
 draw();
}
function v133ToggleEnlarge(){
 if(!v98IsWorld()||document.body.classList.contains('v132-fullscreen'))return;
 v99Expanded=!v99Expanded;document.body.classList.toggle('v99-expanded',v99Expanded);v132RevealControls();draw();
}
function v132FullscreenUI(){
 const stage=$('#match-area .v42-pitch-stage');if(!stage)return;
 if(!v98IsWorld()){v132LeaveFullscreen();$('#v99-expand')?.remove();$('#v133-enlarge')?.remove();$('#v132-screen-pause')?.remove();$('#v132-tv')?.remove();return;}
 if(!stage.dataset.v132Controls){stage.dataset.v132Controls='true';stage.addEventListener('pointerdown',()=>v132RevealControls(stage));stage.addEventListener('pointerleave',event=>{if(event.pointerType==='mouse')stage.classList.remove('v132-show-controls')});v132RevealControls(stage);}
 let expand=$('#v99-expand');if(!expand){expand=document.createElement('button');expand.id='v99-expand';expand.type='button';expand.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M14 4h6v6m0-6-7 7M10 20H4v-6m0 6 7-7"/></svg>';expand.addEventListener('click',v132ToggleFullscreen);stage.append(expand);}
 const active=document.body.classList.contains('v132-fullscreen'),label=active?v98Text('Vollbild verlassen','Exit fullscreen'):v98Text('Vollbild öffnen','Enter fullscreen');expand.setAttribute('aria-label',label);expand.title=label;expand.setAttribute('aria-pressed',String(active));expand.querySelector('svg').style.transform=active?'rotate(180deg)':'';
 let enlarge=$('#v133-enlarge');if(!enlarge){enlarge=document.createElement('button');enlarge.id='v133-enlarge';enlarge.type='button';enlarge.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="9" r="5"/><path d="M13 13l7 7M6 9h6"/><path data-plus d="M9 6v6"/></svg>';enlarge.addEventListener('click',v133ToggleEnlarge);stage.append(enlarge);}
 enlarge.hidden=active;enlarge.title=v99Expanded?v98Text('Bild verkleinern','Shrink image'):v98Text('Bild vergrößern','Enlarge image');enlarge.setAttribute('aria-label',enlarge.title);enlarge.setAttribute('aria-pressed',String(v99Expanded));enlarge.querySelector('[data-plus]').style.display=v99Expanded?'none':'';
 let pause=$('#v132-screen-pause');if(!pause){pause=document.createElement('button');pause.id='v132-screen-pause';pause.type='button';pause.addEventListener('click',()=>{if(v103Replays.get(match)?.review){if(!v103CanReplay())v131ReturnLive();return;}if(running){v65PauseTargetTab='lineup';v65Pause();}else v65Resume();draw();});stage.append(pause);}
 pause.hidden=!active;pause.disabled=Boolean(v103Replays.get(match)?.review&&v103CanReplay()||match.finished||match.halftimePause>0);pause.title=v103Replays.get(match)?.review&&!v103CanReplay()?v98Text('Zurück zu Live','Return to live'):running?(v65PauseRequested?v98Text('Pause angefordert','Pause requested'):v98Text('Pause','Pause')):v98Text('Fortsetzen','Resume');pause.setAttribute('aria-label',pause.title);pause.textContent=running?(v65PauseRequested?'…':'Ⅱ'):'▶';
 if(active&&!document.body.classList.contains('v98-pitch3d')){const rect=stage.getBoundingClientRect();stage.style.setProperty('--v132-flat-width',(v92WidePitch.matches?Math.min(rect.height,rect.width*600/740):rect.width)+'px');}
 let tactics=$('#v119-screen-tactics');if(!tactics){tactics=document.createElement('button');tactics.id='v119-screen-tactics';tactics.type='button';tactics.addEventListener('click',()=>{const context=v65Context();if(!context||match.finished)return;v131ReturnLive(false);v132LeaveFullscreen();if(context.state.phase==='live'){v65PauseTargetTab='tactics';v65Pause();}else if(context.state.phase==='paused'){v65PauseView=true;v65PauseTab='tactics';v65UpdateControls(context);v58Refresh();$('#v65-pause-tabs')?.scrollIntoView({block:'start'});}draw();});stage.append(tactics);}tactics.hidden=!active;tactics.disabled=Boolean(match.finished);tactics.textContent=v98Text('Taktik','Tactics');tactics.title=v98Text('Taktikansicht öffnen','Open tactics');tactics.setAttribute('aria-label',tactics.title);
 v132BroadcastUI();
}
document.addEventListener('fullscreenchange',()=>{if(document.fullscreenElement===$('#match-area')){v132NativeScreen=true;v132ScreenState(true);}else if(v132NativeScreen)v132ScreenState(false);if(v98IsWorld())draw();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.body.classList.contains('v132-fullscreen')&&!document.fullscreenElement){v132LeaveFullscreen();event.preventDefault();}});
const v132ScreenStyle=document.createElement('style');
v132ScreenStyle.textContent=`
#v132-tv{position:absolute;z-index:6;top:12px;left:12px;max-width:calc(100% - 76px);color:#f1f7f1;font:700 12px/1.25 Arial;pointer-events:none;filter:drop-shadow(0 2px 4px #0005)}
#v132-tv .v132-tv-kind{display:table;padding:5px 10px;background:#143237f2;font-size:10px;text-transform:uppercase;letter-spacing:.8px;border-left:3px solid #c7f36b}
#v132-tv .v132-tv-board{display:flex;align-items:stretch;background:#142b30f5;overflow:hidden;border-radius:0 4px 4px 0}
#v132-tv [data-tv-team]{display:flex;align-items:center;max-width:170px;padding:9px 10px;border-bottom:4px solid var(--kit);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#v132-tv .v141-tv-score{display:flex;flex-direction:column;justify-content:center;background:#f0f6e9;color:#142b30}#v132-tv .v141-tv-aggregate{font-size:9px;line-height:12px;text-align:center;padding:0 4px 3px;font-variant-numeric:tabular-nums}
#v132-tv strong{display:grid;place-items:center;min-width:58px;padding:5px 9px;background:#f0f6e9;color:#142b30;font-size:19px;font-variant-numeric:tabular-nums;white-space:nowrap}
#v132-tv time{display:flex;align-items:center;white-space:nowrap;background:#c7f36b;color:#142b30;padding:5px 10px;font-size:15px;font-variant-numeric:tabular-nums}
#v132-tv small{display:table;background:#143237e8;padding:3px 8px;font-size:9px;letter-spacing:1px;text-transform:uppercase}
#v99-expand{display:grid!important}#v132-screen-pause{position:absolute;right:60px;bottom:8px;z-index:8;min-height:44px;border:1px solid #79978c;border-radius:6px;padding:8px 12px;background:#142b30ed;color:white;font:700 12px Arial;cursor:pointer}#v132-screen-pause[hidden]{display:none}#v132-screen-pause:focus-visible{outline:2px solid #c7f36b;outline-offset:2px}
body.v132-fullscreen{overflow:hidden}body.v132-fullscreen #match-area{position:fixed!important;inset:0!important;z-index:1000!important;width:100%!important;height:100dvh!important;max-width:none!important;margin:0!important;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)!important;box-sizing:border-box;display:flex!important;flex-direction:column!important;background:#10282c;border:0;border-radius:0;overflow:hidden}
body.v132-fullscreen #match-area>*:not(.v42-pitch-stage):not(#v131-review):not(#match-overlay){display:none!important}
body.v132-fullscreen #match-area .v42-pitch-stage{position:relative!important;width:100%!important;max-width:none!important;flex:1 1 0!important;min-height:0!important;height:auto!important;aspect-ratio:auto!important;margin:0!important;padding:0!important;overflow:hidden}
body.v132-fullscreen.v98-pitch3d #v98-canvas{width:100%!important;height:100%!important;max-width:none!important}body.v132-fullscreen #v131-review{flex:none;box-sizing:border-box;width:100%;padding:4px 10px;gap:6px 10px}body.v132-fullscreen #v131-review .v132-events{padding:2px 0}body.v132-fullscreen #v131-review button{min-height:44px}
body.v132-fullscreen:not(.v98-pitch3d) #canvas{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;object-fit:contain!important}body.v132-fullscreen #v103-replay-hud{top:96px}
@media(max-width:600px){#v132-tv{top:8px;left:8px;font-size:10px;max-width:calc(100% - 64px)}#v132-tv [data-tv-team]{max-width:100px;white-space:normal;padding:6px}#v132-tv strong{min-width:44px;font-size:17px;padding:4px}#v132-tv time{font-size:12px;padding:5px}#v132-tv .v132-tv-kind{font-size:9px;padding:4px 6px}}
@media(orientation:landscape) and (max-height:500px){#v132-tv{top:8px;left:8px}#v132-tv [data-tv-team]{padding:6px 8px}#v132-tv small{font-size:8px}body.v132-fullscreen #v131-review label{min-width:180px}body.v132-fullscreen #v131-review button{padding:6px 10px;font-size:11px}}
`;v132ScreenStyle.textContent+=`#v132-tv{font-size:11px}#v132-tv [data-tv-team]{padding:6px 8px;letter-spacing:.5px}#v132-tv strong{min-width:42px;font-size:17px;padding:4px 6px}#v132-tv time{font-size:13px;padding:4px 7px}#v132-tv .v132-tv-kind{font-size:9px;padding:4px 7px}#v99-expand svg{width:17px;height:17px}#v132-screen-pause{width:44px;padding:6px}#v131-review{font-size:11px;gap:6px 10px;padding:5px 10px}#v131-review [data-v132-play]{width:44px;padding:4px}#v131-review [data-v132-live]{padding:4px 9px}#v131-review .v132-events{gap:5px;padding:0}#v131-review .v132-events button{padding:4px 8px}#v131-review label{min-width:140px}#v131-review .v132-track{padding-bottom:17px}#v131-review .v132-markers{height:17px}body.v132-fullscreen #v103-replay-hud{top:84px}#v132-tv{pointer-events:auto}#v132-tv [data-tv-team]{cursor:default}body.v132-fullscreen:not(.v98-pitch3d) #canvas{inset:auto!important;top:50%!important;left:50%!important;width:var(--v132-flat-width,100%)!important;height:auto!important;transform:translate(-50%,-50%)}@media(min-width:900px),(min-width:600px) and (orientation:landscape){body.v132-fullscreen:not(.v98-pitch3d) #canvas{transform:translate(-50%,-50%) rotate(90deg)}}`;document.head.append(v132ScreenStyle);
const v103Style=document.createElement('style');
v103Style.textContent=`#v103-replay-hud{position:absolute;top:8px;left:8px;z-index:12;display:flex;align-items:center;gap:8px;padding:4px 5px 4px 10px;border:1px solid #79978c;border-radius:7px;background:#142b30f2;color:#f4f8ed;font:800 11px/1.2 Arial}#v103-replay-hud span{letter-spacing:1px}#v103-replay-hud button{min-height:40px;padding:8px 12px;border:0;border-radius:4px;background:#c7f36b;color:#142629;font:700 12px Arial;cursor:pointer}#v103-replay-hud button:focus-visible{outline:2px solid white;outline-offset:2px}.v103-replay-paused #v50-penalty-scene *{animation-play-state:paused!important}@media(pointer:coarse){#v103-replay-hud button{min-height:44px}}`;
document.head.append(v103Style);
v103Style.textContent+=`#v131-review{display:flex;align-items:center;gap:12px;padding:10px 12px;background:#142b30;color:#eaf4ef;font:700 12px Arial;flex-wrap:wrap}#v131-review label{display:flex;align-items:center;gap:10px;flex:1;min-width:180px}#v131-review input{width:100%;min-width:80px;accent-color:#c7f36b;min-height:32px}#v131-review output{font-variant-numeric:tabular-nums}#v131-review button{min-height:40px;border:1px solid #79978c;border-radius:6px;background:#c7f36b;color:#142629;padding:8px 12px;font:inherit}#v131-review button:disabled{opacity:.55}#v131-review input:focus-visible,#v131-review button:focus-visible{outline:2px solid #c7f36b;outline-offset:3px}`;
v103Style.textContent+=`#v131-review .v132-track{flex:1;min-width:80px;position:relative;padding-bottom:22px}#v131-review .v132-markers{position:absolute;left:10px;right:10px;bottom:0;height:22px;pointer-events:none}#v131-review .v132-markers span{position:absolute;transform:translateX(-50%);font-size:10px;line-height:17px;border-top:3px solid var(--event-color);color:var(--event-color)}#v131-review [data-kind="goal"]{--event-color:#e7da73}#v131-review [data-kind="corner"]{--event-color:#8cd6b7}#v131-review [data-kind="freeKick"]{--event-color:#99cbf3}#v131-review [data-kind="offside"]{--event-color:#f2b886}#v131-review [data-kind="penalty"]{--event-color:#e5aff0}#v131-review .v132-events{display:flex;gap:8px;width:100%;overflow-x:auto;padding:3px 0 5px}#v131-review .v132-events[hidden]{display:none}#v131-review .v132-events button{flex:none;min-height:44px;background:#203b40;color:var(--event-color);border-color:var(--event-color)}#v131-review [data-v132-play]{order:1}#v131-review [data-v132-live]{order:2}#v131-review .v132-events{order:3}`;

const v132FadeStyle=document.createElement("style");v132FadeStyle.textContent=`
#match-area .v42-pitch-stage{isolation:isolate}
#match-area .v42-pitch-stage #v131-review{position:absolute;bottom:0;left:0;right:0;z-index:15;width:100%;box-sizing:border-box;background:#142b30dd;border-top:1px solid #79978c55}
#match-area .v42-pitch-stage:has(#v131-review) #v99-expand,#match-area .v42-pitch-stage:has(#v131-review) #v132-screen-pause{bottom:calc(var(--v132-review-height,68px) + 6px)}
#match-area .v42-pitch-stage :is(#v131-review,#v99-expand,#v133-enlarge,#v132-screen-pause,#v98-view-controls){opacity:0;pointer-events:none;transition:opacity 180ms ease}
#match-area .v42-pitch-stage.v132-show-controls :is(#v131-review,#v99-expand,#v133-enlarge,#v132-screen-pause,#v98-view-controls),#match-area .v42-pitch-stage:has(:focus-visible) :is(#v131-review,#v99-expand,#v133-enlarge,#v132-screen-pause,#v98-view-controls){opacity:1;pointer-events:auto}
@media(hover:hover){#match-area .v42-pitch-stage:hover :is(#v131-review,#v99-expand,#v133-enlarge,#v132-screen-pause,#v98-view-controls){opacity:1;pointer-events:auto}}
@media(prefers-reduced-motion:reduce){#match-area .v42-pitch-stage :is(#v131-review,#v99-expand,#v133-enlarge,#v132-screen-pause,#v98-view-controls){transition:none}}
#v99-expand,#v133-enlarge,#v132-screen-pause{background:transparent;border:0;isolation:isolate}#v99-expand::before,#v133-enlarge::before,#v132-screen-pause::before{content:"";position:absolute;inset:6px;z-index:-1;background:#142b30e8;border:1px solid #79978c;border-radius:4px}#v99-expand:hover{background:transparent}#v99-expand:hover::before,#v133-enlarge:hover::before,#v132-screen-pause:hover::before{background:#2e504d}
`;document.head.append(v132FadeStyle);
v132FadeStyle.textContent+=`#v133-enlarge{position:absolute;right:60px;bottom:8px;z-index:8;display:grid;place-items:center;width:44px;height:44px;padding:10px;color:#f3f8ed;border-radius:6px;cursor:pointer}#v133-enlarge svg{width:17px;height:17px}#v133-enlarge[hidden]{display:none}#v133-enlarge:focus-visible{outline:2px solid #c7f36b;outline-offset:2px}#match-area .v42-pitch-stage:has(#v131-review) #v133-enlarge{bottom:calc(var(--v132-review-height,68px) + 6px)}body.v99-expanded main{max-width:1600px}body.v99-expanded #game-screen .workspace{grid-template-columns:minmax(0,1fr)}body.v99-expanded #match-area .v42-pitch-stage{width:min(100%,1280px)}`;

// Compact broadcast controls: the event list opens above the strip without resizing the pitch.
v132FadeStyle.textContent+=`
#match-area .v42-pitch-stage #v131-review{left:50%;right:auto;bottom:8px;transform:translateX(-50%);width:min(680px,calc(100% - 16px));display:flex;flex-wrap:nowrap;gap:4px;padding:4px 6px;border:1px solid #79978c70;border-radius:8px;background:#10282cea;font-size:11px}
#match-area .v42-pitch-stage #v131-review label{min-width:80px;gap:0;flex:1}
#v131-review label>span:first-child{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
#match-area .v42-pitch-stage #v131-review .v132-track{min-width:80px;padding:0;height:44px;display:flex;align-items:center}
#match-area .v42-pitch-stage #v131-review input{min-height:32px;height:32px;margin:0;min-width:80px}
#match-area .v42-pitch-stage #v131-review .v132-markers{bottom:0;height:12px;left:8px;right:8px}
#match-area .v42-pitch-stage #v131-review .v132-markers span{font-size:8px;line-height:9px;border-top-width:2px}
#match-area .v42-pitch-stage #v131-review output{flex:none;white-space:nowrap;font-size:10px}
#match-area .v42-pitch-stage #v131-review button{min-height:44px;padding:4px 8px}
#match-area .v42-pitch-stage #v131-review [data-v132-play]{width:44px;flex:none;padding:4px}
#match-area .v42-pitch-stage #v131-review [data-v132-live]{flex:none;white-space:nowrap}
#v131-review .v119-event-menu{order:3;flex:none}
#v131-review .v119-event-menu[hidden]{display:none}
#v131-review summary{display:grid;place-items:center;list-style:none;width:44px;height:44px;border-radius:6px;color:#eaf4ef;cursor:pointer;font-size:22px}
#v131-review summary::-webkit-details-marker{display:none}
#v131-review summary:hover,#v131-review .v119-event-menu[open] summary{background:#2e504d}
#v131-review summary:focus-visible{outline:2px solid #c7f36b;outline-offset:1px}
#match-area .v42-pitch-stage #v131-review .v132-events{position:absolute;bottom:calc(100% + 6px);right:0;display:flex;flex-wrap:wrap;align-content:flex-start;gap:6px;width:min(100%,420px);max-height:min(160px,45vh);overflow:auto;padding:8px;box-sizing:border-box;background:#10282cf5;border:1px solid #79978c;border-radius:8px;box-shadow:0 4px 15px #0005}
#v131-review .v119-event-menu:not([open]) .v132-events{display:none!important}
#match-area .v42-pitch-stage:has(.v119-event-menu[open]) #v131-review{opacity:1;pointer-events:auto}
@media(max-width:420px){#match-area .v42-pitch-stage #v131-review{display:grid;grid-template-columns:minmax(0,1fr) 44px auto 44px}#match-area .v42-pitch-stage #v131-review label{grid-column:1/-1}#match-area .v42-pitch-stage #v131-review output{order:0}}
#match-area #v132-tv{font-family:var(--tv-font,Arial,sans-serif)}
#match-area #v132-tv .v132-tv-kind{background:var(--tv-base,#203037);border-left-color:var(--tv-accent,#d4e0df)}
#match-area #v132-tv .v132-tv-board,#match-area #v132-tv small{background:var(--tv-base,#203037)}
#match-area #v132-tv time{background:var(--tv-accent,#d4e0df);color:var(--tv-ink,#1c2b30)}
#match-area #v132-tv[data-motif=rails] .v132-tv-kind{border-top:2px solid var(--tv-accent)}
#match-area #v132-tv[data-motif=block] .v132-tv-board{border-radius:0 8px 8px 0}#match-area #v132-tv[data-motif=block] strong{font-weight:900}
#match-area #v132-tv[data-motif=stripe] .v132-tv-kind{border-left-width:7px;font-style:italic}
#match-area #v132-tv[data-motif=line] .v132-tv-board{border-bottom:2px solid var(--tv-accent)}
#match-area #v132-tv[data-motif=step] .v132-tv-kind{margin-left:6px;border-left-width:0;border-bottom:2px solid var(--tv-accent)}
#match-area #v132-tv[data-motif=double] .v132-tv-kind{border-left:5px double var(--tv-accent)}
#match-area #v132-tv[data-motif=cup] .v132-tv-kind{border:1px solid var(--tv-accent);border-radius:6px 6px 0 0;letter-spacing:1.1px}#match-area #v132-tv[data-motif=cup] .v132-tv-board{border-radius:0 0 6px 6px}
#match-area #v132-tv[data-motif=stars] .v132-tv-kind{border:0;border-top:2px solid var(--tv-accent)}#match-area #v132-tv[data-motif=stars] .v132-tv-kind::before{content:'✦';margin-right:6px;color:var(--tv-accent)}#match-area #v132-tv[data-motif=stars] .v132-tv-board{border:1px solid #7f87c7;border-radius:0 0 6px 6px}
`;

v132FadeStyle.textContent+=`
#v119-screen-tactics{position:absolute;top:8px;right:56px;z-index:8;min-width:64px;height:44px;padding:6px;border:1px solid #79978c70;border-radius:6px;background:#10282cea;color:#f1f7f1;font:700 11px Arial,sans-serif;cursor:pointer}#v119-screen-tactics[hidden]{display:none}#v119-screen-tactics:focus-visible{outline:2px solid #c7f36b;outline-offset:2px}
body.v132-fullscreen #match-area #v132-tv{top:12px;left:12px;max-width:calc(100% - 144px);font-size:clamp(12px,1.1vw,16px)}
body.v132-fullscreen #match-area #v132-tv [data-tv-team]{padding:8px 10px}
body.v132-fullscreen #match-area #v132-tv strong{min-width:52px;font-size:clamp(21px,2vw,30px);padding:5px 8px}
body.v132-fullscreen #match-area #v132-tv time{font-size:clamp(15px,1.45vw,22px);padding:5px 9px}
body.v132-fullscreen #match-area #v132-tv .v132-tv-kind{font-size:clamp(10px,.9vw,13px);padding:5px 8px}
body.v132-fullscreen #match-area #v132-tv small{font-size:clamp(9px,.75vw,11px);padding:4px 8px}
body.v132-fullscreen #match-area #v132-tv .v141-tv-aggregate{font-size:clamp(10px,.85vw,12px)}
@media(max-width:600px){body.v132-fullscreen #match-area #v132-tv{left:8px;top:8px}body.v132-fullscreen #match-area #v132-tv [data-tv-team]{padding:6px}body.v132-fullscreen #match-area #v132-tv strong{min-width:44px;padding:4px}body.v132-fullscreen #match-area #v132-tv time{padding:5px 6px}}
`;
