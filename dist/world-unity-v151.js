'use strict';
// Unity consumes pictures of the authoritative match. It cannot book a result,
// advance the clock, change a player, or write a career checkpoint.
(function(root){
 const schema='d6-world-view-1';
 const point=p=>[p.x,p.height??0,p.z];
 function kit(value={}){return {main:value.main||'#22579a',trim:value.pattern||value.trim||'#f2f3ed',accent:value.accent||value.pattern||'#f2f3ed',style:value.style||'plain'};}
 function player(p,team,shirt){return {id:p.pid||p.id,team,number:p.n||p.number||0,name:p.name,keeper:Boolean(p.keeper),kit:kit(shirt),skin:p.appearance?.skinTone||'warm',hair:p.appearance?.hairColor||'brown'};}
 function picture(frame,session,sequence,camera,phase,score){
  // A booked native goal scene; older pictures simply omit these fields.
  const celebration=frame.celebration&&Number.isFinite(frame.celebration.time)?{celebrating:true,celebrationTeam:frame.celebration.team,celebrationTime:Math.max(0,frame.celebration.time),celebrationScorer:frame.celebration.scorer||''}:{};
  // U-1 (183): siRevision marks pictures of a match with the SI marker (presentation of the 183 tempi); older pictures omit it.
  return {schema,session,sequence,clock:frame.clock,elapsed:frame.elapsed,phase,score:[...score],turned:Boolean(frame.turned),replay:Boolean(frame.review||frame.replay),owner:frame.owner||'',...(frame.siRevision===183?{siRevision:183}:{}),...(typeof frame.ballInFlight==='boolean'?{ballInFlight:frame.ballInFlight}:{}),ball:point(frame.ball),ballOpacity:frame.ball.opacity??1,camera:{position:point(camera.position),target:point(camera.target),fov:camera.fov},players:frame.players.map(p=>{
   // Foul reactions own the contact picture; otherwise an observed native
   // slide overrides the ordinary running/action pose. Both are read-only.
   const a=['foulVictim','foulOffender'].includes(p.action?.kind)?p.action:p.unityAction||p.action;
   // Keeper attention belongs to the received action/ball, never a stale
   // outfield running heading. Targets are projected with the same pitch map.
   // The generic pass countdown carries the opposing goal as a placeholder,
   // while the native body turns toward the actual receiver. It is no aim.
   const aimedKick=['freeKick','shot','volley','kickReady','passReady'].includes(a?.kind)&&!(a?.kind==='passReady'&&a?.id==='kick-ready');
   const focus=p.keeper?(a?.kind==='goalKick'?a.targetWorld:a?.kind==='save'?null:frame.ball):aimedKick?a.targetWorld:null;
   const focusDirection=focus&&[focus.x-p.x,0,focus.z-p.z];
   const travel=p.movement?.travelFacing;
   // A released foot pass can leave a small velocity in the old direction.
   // Keep the observed body facing when it already agrees with the actual
   // release target; sample speed in the frame so replay never reads live state.
   const bodyDirection=p.movement?.facing&&[p.movement.facing.x-p.x,0,p.movement.facing.z-p.z],passTarget=a?.targetWorld&&[a.targetWorld.x-p.x,0,a.targetWorld.z-p.z];
   const bodyLength=bodyDirection&&Math.hypot(bodyDirection[0],bodyDirection[2]),passLength=passTarget&&Math.hypot(passTarget[0],passTarget[2]);
   const settledPass=!p.keeper&&['pass','highPass','cross'].includes(a?.kind)&&Number.isFinite(p.movement?.bodySpeed)&&p.movement.bodySpeed<1.5&&Number.isFinite(p.movement?.positionSpeed)&&p.movement.positionSpeed<1.2&&bodyLength>.00001&&passLength>.00001&&(bodyDirection[0]*passTarget[0]+bodyDirection[2]*passTarget[2])/(bodyLength*passLength)>=Math.cos(Math.PI/6);
   // Restart attention points at the ball while the native body is locked.
   // Preserve that observed body heading for outfield players at the restart.
   const restartHeading=!p.keeper&&p.movement?.mode==='restart'&&Number.isFinite(p.person?.offenseMotion?.heading)?p.person.offenseMotion.heading:null;
   const flip=frame.turned?-1:1;
   const restartDirection=restartHeading!==null?[-Math.cos(restartHeading)*flip,0,Math.sin(restartHeading)*flip]:null;
   // B06 (r132): the observed travel of a running field player (bridge wrapper, display only) replaces a body velocity or
   // body heading pointing more than 90 degrees away from it: the stride follows where the player actually goes.
   const observed=!p.keeper&&p.movement?.mode==='run'&&p.movement.observedFacing&&[p.movement.observedFacing.x-p.x,0,p.movement.observedFacing.z-p.z];
   const sourceDirection=travel?[travel.x-p.x,0,travel.z-p.z]:bodyDirection;
   const staleTravel=Boolean(observed&&sourceDirection&&Math.hypot(observed[0],observed[2])>.00001&&Math.hypot(sourceDirection[0],sourceDirection[2])>.00001&&observed[0]*sourceDirection[0]+observed[2]*sourceDirection[2]<0);
   // B04 (r132): free-kick attention of a standing player (bridge wrapper) and the preparation facing a kick turns away from.
   const attention=!p.keeper&&p.movement?.restartAttention&&p.movement.mode!=='run'?[p.movement.restartAttention.x-p.x,0,p.movement.restartAttention.z-p.z]:null;
   // A save stays square to the goal. Facing the contact itself made its
   // lateral component zero, so Unity classified every wide save as upright.
   const saveDirection=p.keeper&&a?.kind==='save'?[(p.team===0?1:-1)*flip,0,0]:null;
   const chosen=a?.facing&&Math.hypot(a.facing.x,a.facing.z)>.00001?[a.facing.x,0,a.facing.z]:saveDirection||(focusDirection&&Math.hypot(focusDirection[0],focusDirection[2])>.00001?focusDirection:settledPass?bodyDirection:(attention&&Math.hypot(attention[0],attention[2])>.00001?attention:null)||restartDirection||(staleTravel?observed:travel?[travel.x-p.x,0,travel.z-p.z]:p.movement?.facing?[p.movement.facing.x-p.x,0,p.movement.facing.z-p.z]:[(p.team===0?1:-1)*(frame.turned?-1:1),0,0]));
   // The kick after a free-kick preparation turns from the preparation facing into the chosen one over the native
   // contact time (0.09 s of the received progress), a turn instead of a one-picture jump. Progress-based: a paused or
   // replayed picture gives the same facing.
   const direction=(()=>{const prep=a?.prepareWorld;if(!prep)return chosen;const age=Math.max(0,a.progress??0)*(Number.isFinite(a.duration)&&a.duration>0?a.duration:1);if(!(age<.09))return chosen;const from=[prep.x-p.x,0,prep.z-p.z],fl=Math.hypot(from[0],from[2]),cl=Math.hypot(chosen[0],chosen[2]);if(fl<.00001||cl<.00001)return chosen;
    const t=age/.09,w=t*t*(3-2*t),a0=Math.atan2(from[2],from[0]),a1=Math.atan2(chosen[2],chosen[0]);let d=a1-a0;while(d>Math.PI)d-=2*Math.PI;while(d<=-Math.PI)d+=2*Math.PI;if(Math.abs(Math.abs(d)-Math.PI)<1e-9)d=Math.PI;if(Math.abs(d)<1e-9)return chosen;const angle=a0+w*d;return [Math.cos(angle),0,Math.sin(angle)];})();
   const keeperFacts=Object.fromEntries(['saved','parry','goal','smother','held'].filter(k=>typeof a?.[k]==='boolean').map(k=>[k,a[k]]));
   const holdingKnown=p.keeper&&a?.kind==='save'&&['saved','parry','goal'].every(k=>typeof a[k]==='boolean')&&typeof frame.ballInFlight==='boolean';
   const ballHeld=holdingKnown?{ballHeld:a.saved&&!a.parry&&!a.goal&&frame.owner===p.id&&!frame.ballInFlight&&(a.progress??0)>=1}:{};
   // Preserve an observed native action time and a real duration when present.
   // The legacy duration fallback is not evidence of an action's start time.
   const timing={...(Number.isFinite(a?.at)&&a.at>=0&&a.at<=frame.clock+1e-6?{actionAt:a.at,actionAtKnown:true}:{}),...(Number.isFinite(a?.duration)&&a.duration>0?{durationKnown:true}:{})};
   return {id:p.id,position:[p.x,0,p.z],facing:direction,moving:!['idle','restart'].includes(p.movement?.mode),action:a?.kind||'idle',actionId:String(a?.id??a?.kind??'idle'),contactPoint:a?.contactWorld?point(a.contactWorld):null,recovery:a?.recovery||0,progress:a?.progress??0,duration:a?.duration||1,number:p.number,...timing,...keeperFacts,...ballHeld,...(a?.kind==='goalKick'&&['waiting','follow'].includes(a.phase)?{phase:a.phase}:{}),...(typeof a?.holding==='boolean'?{holding:a.holding}:{}),...(Number.isFinite(a?.pickup)?{pickup:Math.max(0,Math.min(1,a.pickup))}:{}),...(a?.aerial===true?{aerial:true}:{}),...(Number.isFinite(p.freshness)?{freshness:p.freshness}:{})};
  }),netActive:Boolean(frame.net),net:frame.net?{...frame.net}:null,...(frame.offside&&Number.isFinite(frame.offside.lineX)?{offside:{lineX:frame.offside.lineX}}:{}),...celebration};
 }
 const legacy={length:68,width:44};
 // Optional native match geometry (version 1) is used 1:1; without it the
 // previous 68 x 44 configuration stays exactly as before.
 function geometry(native,fallback){
  const keys=['length','width','goalWidth','goalHeight','penaltyDepth','penaltyWidth'];
  return native?.version===1&&keys.every(k=>Number.isFinite(native[k])&&native[k]>0)?Object.fromEntries(keys.map(k=>[k,native[k]])):fallback;
 }
 // The shared picture keeps the native 68 x 44 projection (2D/THREE). Only the
 // Unity copy is stretched into the actual metres of a larger geometry. Native
 // contacts and the ball at the feet are already physical metres in normalized
 // coordinates, so one uniform map keeps them exact. Only the net bulge point
 // stays between the fixed posts: the native goal-scene drift (v83, up to
 // +.012 of the width) would otherwise reach 5.55 m on a 52.8 m pitch.
 function scaled(frame,g){
  if(!g||g.length===legacy.length&&g.width===legacy.width)return frame;
  const sx=g.length/legacy.length,sz=g.width/legacy.width,at=p=>p&&{...p,x:p.x*sx,z:p.z*sz},post=g.goalWidth/2-.1764;
  return {...frame,ball:at(frame.ball),offside:frame.offside?{...frame.offside,lineX:frame.offside.lineX*sx}:frame.offside,net:frame.net?{...frame.net,z:Math.max(-post,Math.min(post,frame.net.z*sz))}:frame.net,players:frame.players.map(p=>({...p,x:p.x*sx,z:p.z*sz,movement:p.movement?{...p.movement,facing:at(p.movement.facing),travelFacing:at(p.movement.travelFacing),...(p.movement.observedFacing?{observedFacing:at(p.movement.observedFacing)}:{}),...(p.movement.restartAttention?{restartAttention:at(p.movement.restartAttention)}:{})}:p.movement,action:p.action?{...p.action,...(p.action.contactWorld?{contactWorld:at(p.action.contactWorld)}:{}),...(p.action.targetWorld?{targetWorld:at(p.action.targetWorld)}:{}),...(p.action.prepareWorld?{prepareWorld:at(p.action.prepareWorld)}:{})}:p.action,unityAction:p.unityAction?{...p.unityAction,contactWorld:at(p.unityAction.contactWorld),facing:{x:p.unityAction.facing.x*sx,z:p.unityAction.facing.z*sz}}:p.unityAction}))};
 }
 // The browser camera rules are authored for 68 x 44. On a larger pitch the
 // aim follows the same relative ball position; overview cameras also step back
 // by the pitch factor, so they show the same ball-led section as on 68 x 44
 // (not the whole pitch); the following cameras keep their player distance.
 function camera(aim,ball,g,mode){
  if(!g||g.length===legacy.length&&g.width===legacy.width)return aim(ball);
  const sx=g.length/legacy.length,sz=g.width/legacy.width,pose=aim({...ball,x:ball.x/sx,z:ball.z/sz}),k=['wide','goal'].includes(mode)?Math.max(sx,sz):1;
  const target={x:pose.target.x*sx,y:pose.target.y,z:pose.target.z*sz};
  const position={x:target.x+(pose.position.x-pose.target.x)*k,y:target.y+(pose.position.y-pose.target.y)*k,z:target.z+(pose.position.z-pose.target.z)*k};
  // Following cameras keep their viewing distance on a larger field. Keep
  // the near-side ball-to-focus gap at the authored size as well, otherwise
  // scaling that gap pushes the ball back into the bottom controls.
   if((mode==='follow'||mode==='sideline'||mode==='wide')&&ball.z/sz>13){
   const ramp=Math.min(1,(ball.z/sz-13)/3),weight=ramp*ramp*(3-2*ramp);
   const pan=Math.max(0,sz-1)*Math.max(0,ball.z/sz-pose.target.z)*weight;
   position.z+=pan;target.z+=pan;
  }
  return {position,target,fov:pose.fov};
 }
 // Screen-space decoration only. Keep the whole name inside the viewport and
 // find room for crowded groups without changing any received player position.
 function labelPosition(anchor,placed,width,height){
  const w=Math.min(anchor.w,width),h=Math.min(anchor.h,height),gap=3;
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const insetX=Math.min(2,(width-w)/2),insetY=Math.min(2,(height-h)/2);
  const at=(x,y)=>({x:clamp(x,w/2+insetX,width-w/2-insetX),y:clamp(y,h+insetY,height-insetY),w,h});
  const overlap=p=>placed.reduce((sum,r)=>sum+Math.max(0,(p.w+r.w)/2+gap-Math.abs(p.x-r.x))*Math.max(0,Math.min(p.y,r.y)-Math.max(p.y-p.h,r.y-r.h)+gap),0);
  const base=at(anchor.x,anchor.y);if(!overlap(base))return base;
  if(anchor.previous&&Math.hypot(anchor.previous.x,anchor.previous.y)<=Math.max(w,h*3)){const old=at(anchor.x+anchor.previous.x,anchor.y+anchor.previous.y);if(!overlap(old))return old;}
  let best=base,bestOverlap=overlap(base),distance=Infinity;
  // At most fourteen on-field players today. More rows are only needed when
  // several heads share the same screen point; horizontal offsets stay short.
  for(let row=-placed.length-1;row<=placed.length+1;row++)for(let col=-2;col<=2;col++){
   const p=at(anchor.x+col*(w+gap),anchor.y+row*(h+gap)),area=overlap(p),d=(p.x-anchor.x)**2+(p.y-anchor.y)**2;
   if(area<bestOverlap||area===bestOverlap&&d<distance){best=p;bestOverlap=area;distance=d;}
  }
  return best;
 }
 function labelLeader(p,x,y){
  const dx=x-p.x,dy=y-(p.y-p.h/2),factor=Math.min(1,p.w/2/Math.abs(dx),p.h/2/Math.abs(dy));
  return {left:p.w/2+dx*factor,top:p.h/2+dy*factor,length:Math.hypot(dx,dy)*(1-factor),angle:Math.atan2(dy,dx)};
 }
 function ballGuide(marker,width,height,renderWidth,enabled=true){
  if(!enabled||!marker||marker.visible!==true||![marker.x,marker.y,marker.depth,marker.diameter,width,height,renderWidth].every(Number.isFinite)||marker.depth<=0||marker.x<0||marker.x>1||marker.y<0||marker.y>1||marker.diameter<=0||width<=0||height<=0||renderWidth<=0)return null;
  const diameter=marker.diameter*width/renderWidth;if(diameter>=9)return null;
  return {x:marker.x*width,y:marker.y*height,size:Math.max(12,Math.min(16,diameter+8)),opacity:Math.min(1,(9-diameter)/4)};
 }
 
 function presentation(context,teams){
  const fixture=context.fixture,competitionId=String(fixture.competitionId||'');
  const current=typeof root.v62Current==='function'?root.v62Current(context.career):[];
  const info=(current||[]).find(c=>c.id===fixture.competitionId);
  const suffix=competitionId.split(':').at(-1),fallback={LEAGUE:'league',CUP:'cup',EUROPE:'europe',CROWN:'europe',HORIZON:'europe'}[suffix];
  const competition=['league','cup','europe'].includes(info?.type)?info.type:fallback||'other';
  let hash=0x811c9dc5;const key='d6-light-1|'+fixture.id;for(let i=0;i<key.length;i++){hash^=key.charCodeAt(i);hash=Math.imul(hash,0x01000193)>>>0;}const bucket=hash%100;
  const lighting=competition==='europe'?'night':competition==='league'?(bucket<60?'day':'night'):competition==='cup'?(bucket<40?'day':'night'):'night';
  const isFinal=fixture.round==='F'&&(competition==='cup'||competition==='europe');
  return {schema:'d6-presentation-1',competition,round:fixture.round||'',format:info?.format||'',venue:fixture.neutral===true||isFinal?'neutral':'home',lighting,lightRule:competition==='europe'?'europe-night':competition==='league'?'league-mix-60':competition==='cup'?'cup-mix-40':'fallback-night',lightBucket:bucket,venueCountry:info?.country||(competition==='cup'||competition==='league'?teams[0].id.split('-')[0]:''),clubs:teams.map(club=>{const colors=typeof root.v61ClubColors==='function'?root.v61ClubColors(club):['#22579a','#f2f3ed'];return {id:club.id,country:club.id.split('-')[0],kind:/-C\d+$/.test(club.id)?'cup':'league',primary:colors[0],secondary:colors[1]};})};
 }
 root.D6WorldUnityContract={schema,kit,player,picture,geometry,scaled,camera,labelPosition,labelLeader,ballGuide,presentation};
 if(typeof module==='object'&&module.exports)module.exports=root.D6WorldUnityContract;
})(typeof window==='object'?window:globalThis);

if(typeof window==='object'&&typeof v98RenderScene==='function') (function(){
 const C=window.D6WorldUnityContract,channel=C.schema;
 const selected=new URLSearchParams(location.search).get('engine');
 const localFile=location.protocol==='file:';
 const enabled=selected==='unity'||selected!=='browser'&&(Boolean(window.D6UnityMatchUrl)||localFile);
 if(!enabled)return;
 // B06 (r132): observed travel of each field player from the last completed native step (the step wrapper below records
 // every person's displacement with the clock and the pitch mirroring; nothing is stored in the match or a checkpoint). A
 // native position moved by something other than the body physics (a loose-ball chase: 4.7 m/s of travel while the body
 // velocity ran 2.2 m/s 127 deg away, seed 22222 at 32.1-33.6 s) otherwise showed a stride against the actual travel.
 // The projection depends on the match state alone: every picture of the same clock gets the same observation; a step
 // across the halftime mirroring, a reposition (over 0.6 m within one step), a seek or a restore leaves none.
 const basePitchFrame=v98PitchFrame;
 const v151Steps=new WeakMap(),v151Pending=new WeakMap();
 // The positions before the step are kept while it runs (v151Pending): a picture taken inside the step after the native
 // advance, e.g. the goal-replay recorder (world-goal-replay-v103.js v103Record), already compares them with the advanced
 // positions, so a replayed picture carries the same observation as the live one of that clock.
 function v151Settle(current){const pending=v151Pending.get(current);if(!pending)return null;const after=v102Clock(current),turned=Boolean(current.halftimeBreakDone);
  if(match!==current||!(after>pending.clockBefore)||after-pending.clockBefore>.2||turned!==pending.turnedBefore)return null;
  const moves=new Map();for(const p of current.people){const old=pending.before.get(p);if(old)moves.set(p,{dx:p.x-old.x,dy:p.y-old.y,dt:after-pending.clockBefore});}
  const entry={clock:after,turned,moves};v151Steps.set(current,entry);return entry;}
 function v151WrapStep(base,thisArg,args){const current=match;if(current)v151Pending.set(current,{before:new Map(current.people.map(p=>[p,{x:p.x,y:p.y}])),clockBefore:v102Clock(current),turnedBefore:Boolean(current.halftimeBreakDone)});
  const result=base.apply(thisArg,args);
  if(current){if(!v151Settle(current))v151Steps.delete(current);v151Pending.delete(current);}return result;}
 function v151Observe(current,frame){let st=v151Steps.get(current);if(!st||Math.abs(st.clock-frame.clock)>1e-9)st=v151Settle(current);if(!st||Math.abs(st.clock-frame.clock)>1e-9||st.turned!==Boolean(frame.turned))return;const s=v150Scale(current);
  for(const p of frame.players){const person=p.person;if(!person||person.keeper||person.slideActive||!p.movement||p.movement.mode!=='run')continue;const mv=st.moves.get(person);if(!mv||!(mv.dt>0))continue;
   const travel=Math.hypot(mv.dx*s.x,mv.dy*s.y),speed=travel/mv.dt;if(speed<1.2||travel>.6)continue;
   if(typeof v108MovementMode==='function'&&v108MovementMode(current,person)?.mode==='backpedal')continue;
   const facing=v98PitchPoint({x:person.x+mv.dx,y:person.y+mv.dy},frame.turned);p.movement={...p.movement,observedFacing:{x:facing.x,z:facing.z},observedSpeed:speed};}}
 // B04 (r132): free-kick preparation from native facts only. A free kick of a new match (attackFlow.motionRevision 182)
 // decides direct shot or pass target when the set piece is created (set-pieces-v50.js, setPiece.plan); while it waits the
 // taker looks toward that decided target (the goal centre of a direct kick, the planned receiver of a pass). Nobody else
 // gets an invented facing; older matches without a plan keep their projection. The kick that executes this set piece
 // (same taker, within 0.6 s of its last waiting picture) carries the preparation facing (prepareWorld) so the contract
 // turns it into the received target over the contact time instead of snapping. Display state only, never saved.
 const v151Prepared=new WeakMap();
 function v151Attention(current,frame){const piece=current.setPiece;const waiting=Boolean(piece&&piece.type==='freeKick'&&piece.plan&&piece.spot&&['waiting','fading','postBanner'].includes(piece.phase));
  for(const p of frame.players){const person=p.person;if(!person||person.keeper)continue;
   if(waiting){if(piece.taker!==person)continue;const plan=piece.plan;const aim=plan.direct?{x:.5,y:piece.team===0?v55Field.top:v55Field.bottom}:(()=>{const t=plan.targetPid?current.people.find(q=>q.pid===plan.targetPid):null;return t?{x:t.x,y:t.y}:null;})();if(!aim)continue;
    const point=v98PitchPoint(aim,frame.turned);if(Math.hypot(point.x-p.x,point.z-p.z)<.05)continue;
    v151Prepared.set(person,{piece,clock:frame.clock,direction:{x:point.x-p.x,z:point.z-p.z}});
    if(p.movement&&p.movement.mode!=='run')p.movement={...p.movement,restartAttention:{x:point.x,z:point.z,taker:true}};}
   else{const prep=v151Prepared.get(person);if(!prep)continue;if(current.setPiece===prep.piece||frame.clock<prep.clock||frame.clock-prep.clock>.6){v151Prepared.delete(person);continue;}
    if(p.action&&['freeKick','shot','pass','highPass','cross'].includes(p.action.kind))p.action={...p.action,prepareWorld:{x:p.x+prep.direction.x,z:p.z+prep.direction.z}};}}}
 // U-1 (183): a match with the SI marker (match.si.revision 183, new matches) marks its pictures; matches without it keep them unchanged.
 v98PitchFrame=function(current){const frame=basePitchFrame(current);if(current?.si?.revision===183)frame.siRevision=183;v151Observe(current,frame);v151Attention(current,frame);for(const p of frame.players){const action=p.action;if(!action)continue;if(action.target){const targetWorld=v98PitchPoint(action.target,frame.turned);p.action={...action,targetWorld};}const contact=action.contact||(action.kind==='save'?action.target:null)||(['pass','shot','highPass','cross','freeKick','goalKick'].includes(action.kind)&&action.target?v101KickPoint(p.person,action.target):null);if(contact){const spot=v98PitchPoint(contact,frame.turned);p.action={...p.action,contactWorld:{...spot,height:contact.elevation??action.height??.29}};}}if(frame.celebration){const goal=current.goals?.at(-1);frame.celebration={...frame.celebration,scorer:goal&&!goal.ownGoal&&goal.pid?goal.pid:''};}if(current.goalScene&&current.goalPause>0){const view=typeof v119VisibleGoalView==='function'?v119VisibleGoalView(current):null,p=view?.contact||v83GoalPosition(current.goalScene),spot=v98PitchPoint(p,frame.turned);if(!view||view.hit==='rear')frame.net={sign:Math.sign(spot.x),z:spot.z,height:view?.height??.8,age:view?.age??current.goalScene.elapsed,bulge:view?.bulge??p.bulge,...(view?{flowing:true}:{})};}return frame;};
 let shownGeometry=null,host=null,iframe=null,labels=null,message=null,ballGuide=null,current=null,session='',sequence=0,ready=false,loaded=false,loading=false,pending=null,loop=0,lastSent=-Infinity,started=0,failed=false,cameraPose=null,cameraViewKey='',lastPicture=null,loadCount=0,lastProjection=null,suspendedAt=null;
 let ballGuideEnabled=true;try{ballGuideEnabled=localStorage.getItem('d6-ball-guide')!=='off'}catch{}
 const labelMap=new Map();
 const runtimeUrl=new URL(window.D6UnityMatchUrl||(localFile?'http://127.0.0.1:4300/source/unity-match/runtime.html':new URL('unity-match/runtime.html',document.baseURI).href),location.href);
 if(localFile)runtimeUrl.searchParams.set('parent','file');
 const origin=runtimeUrl.origin;
 const style=document.createElement('style');style.textContent=`
 #d6-unity-host{position:absolute;inset:0;z-index:1;overflow:hidden;background:#182b30}
 #d6-unity-host iframe{display:block;width:100%;height:100%;border:0}
 /* The hidden 2D canvas can exceed the fullscreen height. overflow:hidden
    still allows focus/scrollIntoView to scroll it and lift the Unity iframe;
    clip keeps this presentation surface at its actual viewport origin. */
 body.v98-pitch3d #match-area .v42-pitch-stage:has(#d6-unity-host){overflow:clip!important}
 #d6-unity-message{position:absolute;inset:0;display:grid;place-content:center;gap:12px;background:#18232eea;color:#f1c56e;text-align:center;font:700 16px/1.4 var(--fl-font,system-ui);padding:24px;z-index:2}
 #d6-unity-message::before{content:'';width:30px;height:30px;border:3px solid #53616d;border-top-color:#f1c56e;border-radius:50%;animation:d6-unity-spin .8s linear infinite;justify-self:center}
 #d6-unity-message[hidden]{display:none}#d6-unity-labels{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:3}
 #d6-unity-labels button{position:absolute;transform:translate(-50%,-100%);pointer-events:auto;white-space:nowrap;border:1px solid transparent;background:#17272d88;color:#eeeede;border-radius:3px;min-height:16px;padding:1px 3px;font:500 9px/1.3 var(--fl-font,system-ui);text-shadow:0 1px 2px #0008}
 #d6-unity-labels button span{display:inline}#d6-unity-labels button:hover,#d6-unity-labels button:focus-visible{background:#17272dbd}
 #d6-unity-labels button:focus-visible{outline:2px solid #f1c56e}
 #d6-unity-labels button{border-bottom:2px solid var(--team-color,#eeeede);box-shadow:0 1px 0 #071014}
 #d6-unity-labels button[data-team="1"]{border-bottom-style:dashed}
 #d6-unity-labels button.is-featured{background:#17272de0;color:#fff}
 #d6-unity-labels button::after{content:'';position:absolute;left:var(--leader-left,50%);top:var(--leader-top,100%);width:var(--leader-length,0px);height:1px;background:#eeeede88;box-shadow:0 1px 0 #07101488;transform:rotate(var(--leader-angle,0rad));transform-origin:0 50%;pointer-events:none}
 #d6-unity-ball-guide{position:absolute;transform:translate(-50%,-50%);box-sizing:border-box;border:1.5px solid #f6f7e1;border-radius:50%;box-shadow:0 0 0 1px #091216cf;pointer-events:none;z-index:2}
 #d6-unity-ball-guide[hidden]{display:none}
 @keyframes d6-unity-spin{to{transform:rotate(360deg)}}
 @media(prefers-reduced-motion:reduce){#d6-unity-message::before{animation:none}}
 `;document.head.append(style);
 function post(kind,body){iframe.contentWindow.postMessage({channel,session,kind,...body},origin);}
 function dispose(){
  window.D6ViewFramePump?.setEnabled(false);
  v100PitchMenu(false);
  if(loop)cancelAnimationFrame(loop);loop=0;
  host?.remove();host=iframe=labels=message=ballGuide=null;current=null;session='';ready=loaded=loading=false;pending=null;lastPicture=null;lastProjection=null;suspendedAt=null;cameraPose=null;labelMap.clear();
 }
 function fail(reason){
  failed=true;window.D6UnityMatch.lastFailure=String(reason);window.D6UnityMatch.lastError=v98Text('Unity ist nicht verfügbar · 2D ist aktiv','Unity is unavailable · using 2D');dispose();v98Failed=true;v98View='2d';v102StopPaint();document.body.classList.remove('v98-pitch3d');draw();
 }
 function create(){
  dispose();shownGeometry=null;v98Scene?.dispose();v98Scene=null;v98Players.clear();$('#v98-canvas')?.remove();$('#v98-player-labels')?.remove();v98Match=null;v102StopPaint();v102Frames=null;
  current=match;session=v65Context().fixture.id+':'+crypto.randomUUID();sequence=0;started=performance.now();lastSent=-Infinity;
  window.D6UnityMatch.lastError=null;
  host=document.createElement('div');host.id='d6-unity-host';
  iframe=document.createElement('iframe');iframe.title=v98Text('Unity-Spielfelddarstellung','Unity pitch view');iframe.src=runtimeUrl.href;iframe.setAttribute('tabindex','-1');iframe.addEventListener('error',()=>fail('Unity runtime unavailable'));
  message=document.createElement('div');message.id='d6-unity-message';message.setAttribute('role','status');message.textContent=v98Text('Unity wird vorbereitet …','Preparing Unity …');
  labels=document.createElement('div');labels.id='d6-unity-labels';ballGuide=document.createElement('div');ballGuide.id='d6-unity-ball-guide';ballGuide.hidden=true;ballGuide.setAttribute('aria-hidden','true');host.append(iframe,message,ballGuide,labels);$('#match-area .v42-pitch-stage').prepend(host);window.D6ViewFramePump?.setEnabled(true);
  labels.addEventListener('click',event=>{const id=event.target.closest('[data-player]')?.dataset.player,person=match?.people.find(p=>p.pid===id);if(person)v59OpenLivePlayer(person);});
  loadCount++;
 }
 function configuration(frame){
  const context=v65Context(),teams=[v65Club(context,0),v65Club(context,1)];
  // Unmarked careers read as the previous pitch; show the boxes and goal the
  // native rules actually use there (x .25-.75, y .18, goal height width/3).
  const goalWidth=44*.2/(v55Field.right-v55Field.left),base={length:68,width:44,goalWidth,goalHeight:goalWidth/3,penaltyDepth:68*(.18-v55Field.top)/(v55Field.bottom-v55Field.top),penaltyWidth:44*.5/(v55Field.right-v55Field.left)};
  // Touch devices start with the conservative Unity quality (no MSAA, smaller
  // hard shadows, no bloom), like the browser renderer since v135. ?quality= overrides.
  const requested=new URLSearchParams(location.search).get('quality'),quality=['standard','reduced'].includes(requested)?requested:matchMedia('(pointer:coarse)').matches?'reduced':'standard';
  return {schema:channel,session,fixtureId:context.fixture.id,quality,presentation:C.presentation(context,teams),geometry:{...C.geometry(match.geometry,base),fieldPlayers:match.people.filter(p=>p.t===0&&!p.keeper).length,attackDirection:1},teams:teams.map((club,team)=>({id:club.id,name:club.name,home:v65Side(team,context.ownSide)===0})),players:teams.flatMap((club,team)=>club.roster.map(p=>C.player(p,team,p.keeper?(team===0?match.kits.userKeeper:match.kits.opponentKeeper):(team===0?match.kits.user:match.kits.opponent)))),initial:frame};
 }
 function syncLabels(frame){
  const ids=new Set();
  for(const p of frame.players){
   ids.add(p.id);let label=labelMap.get(p.id);
   if(!label){label=document.createElement('button');label.type='button';label.dataset.player=p.id;label.hidden=true;const number=document.createElement('b'),name=document.createElement('span');label.append(number,name);labels.append(label);labelMap.set(p.id,label);}
   v98Put(label.firstChild,'textContent',String(p.number??''));v98Put(label.lastChild,'textContent',' '+p.person.name.split(' ').at(-1));v98Attr(label,'aria-label',p.person.name+' · '+v98Text('Live-Spielerinfo','Live player information'));v98Put(label,'disabled',Boolean(frame.review||frame.replay));
   v98Put(label.dataset,'team',String(p.team));const clubKit=p.team===0?match.kits.user:match.kits.opponent;v98Prop(label,'--team-color',C.kit(clubKit).main);
  }
  for(const [id,label]of labelMap)if(!ids.has(id)){label.remove();labelMap.delete(id);}
 }
 function paintLabels(data){
  if(!Array.isArray(data.markers)||data.sequence<1||data.sequence<(lastProjection?.sequence||0)||data.width<=0||data.height<=0)return;
  if(data.markers.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)||typeof p.id!=='string'||typeof p.visible!=='boolean'))return;
  lastProjection=data;const placed=[];
  // B01: label states first, then one layout read for every size, then the positions (no read after each write).
  const order=data.markers.filter(m=>labelMap.has(m.id)).sort((a,b)=>Number(b.featured)-Number(a.featured)||(Number.isFinite(a.depth)&&Number.isFinite(b.depth)?a.depth-b.depth:b.y-a.y));
  for(const marker of order){const label=labelMap.get(marker.id);v98Put(label,'hidden',!marker.visible);label.classList.toggle('is-featured',Boolean(marker.featured));}
  const width=labels.clientWidth,height=labels.clientHeight,sizes=order.map(marker=>marker.visible&&width>0&&height>0?labelMap.get(marker.id).getBoundingClientRect():null);
  const guide=C.ballGuide(data.ballMarker,width,height,data.width,ballGuideEnabled);v98Put(ballGuide,'hidden',!guide);
  if(guide){ballGuide.style.left=guide.x+'px';ballGuide.style.top=guide.y+'px';ballGuide.style.width=ballGuide.style.height=guide.size+'px';ballGuide.style.opacity=String(guide.opacity);placed.push({x:guide.x,y:guide.y+guide.size/2,w:guide.size,h:guide.size});}
  // Keep every name, prioritising the ball area and then the nearer player.
  // Displaced names retain a fine leader to the actual Unity head projection.
  for(const [index,marker]of order.entries()){
   const label=labelMap.get(marker.id);
   if(sizes[index]){
    const size=sizes[index],x=marker.x*width,y=marker.y*height,p=C.labelPosition({x,y,w:size.width||40,h:size.height||16,previous:{x:Number(label.dataset.offsetX)||0,y:Number(label.dataset.offsetY)||0}},placed,width,height);placed.push(p);
    const dx=x-p.x,dy=y-p.y,leader=C.labelLeader(p,x,y);label.style.left=p.x+'px';label.style.top=p.y+'px';
    label.style.setProperty('--leader-left',leader.left+'px');label.style.setProperty('--leader-top',leader.top+'px');label.style.setProperty('--leader-length',leader.length>4?leader.length+'px':'0px');label.style.setProperty('--leader-angle',leader.angle+'rad');
    label.dataset.offsetX=String(-dx);label.dataset.offsetY=String(-dy);
   }
  }
 }
 function render(now=performance.now()){
  // The scheduled picture loop needs the same separate random stream as the
  // original renderer. Clip preparation may choose a visual gesture.
  const random=Math.random;Math.random=()=>{v98VisualSeed=(v98VisualSeed*1664525+1013904223)>>>0;return v98VisualSeed/4294967296;};
  try{return paint(now);}finally{Math.random=random;}
 }
 function paint(now){
  loop=0;if(!v98IsWorld()){dispose();return;}if(v98View!=='3d'||!v98Orientation.matches||failed){if(host){host.hidden=true;if(suspendedAt===null)suspendedAt=now;}return;}
  if(current!==match||!host)create();host.hidden=false;document.body.classList.add('v98-pitch3d');
  const rect=host.getBoundingClientRect(),visible=!document.hidden&&rect.width>0&&rect.height>0&&!v65PauseView;window.D6ViewFramePump?.setEnabled(visible);
  // A hidden tactical/halftime view suspends the iframe. Its waiting time must
  // not count as an unresponsive renderer or consume the startup deadline.
  if(!visible){if(suspendedAt===null)suspendedAt=now;if(!document.hidden)loop=requestAnimationFrame(render);return;}
  if(suspendedAt!==null){const gap=now-suspendedAt;started+=gap;if(pending)pending.at+=gap;suspendedAt=null;}
  if(now-started>120000&&!loaded){fail(v98Text('Unity konnte nicht geladen werden · 2D ist aktiv','Unity could not load · using 2D'));return;}
  if(pending&&now-pending.at>10000){fail(v98Text('Unity antwortet nicht · 2D ist aktiv','Unity is not responding · using 2D'));return;}
  if(!document.hidden&&ready&&!pending&&now-lastSent>=50){
   if(rect.width&&rect.height){
    const live=running&&!v47PlayerDialog.open&&contextPhaseLive(),raw=v98PitchFrame(match);
    // The existing replay clock pauses the simulation and supplies recorded pictures.
    const replay=v103ReplayFrame(now,live),frame=replay||raw;if(replay)frame.replay=true;
    v98Frame=frame;v131RecordRendered(frame);
    if(!shownGeometry)shownGeometry=C.geometry(match.geometry,{length:68,width:44});const shown=C.scaled(frame,shownGeometry);
    const viewKey=v98CameraMode+':'+v98CameraNear+':'+Math.round(rect.width/rect.height*1000000),aim=C.camera(ball=>v98CameraAim(ball,v98CameraMode,rect.width/rect.height,v98CameraNear),shown.ball,shownGeometry,v98CameraMode);
    if(!cameraPose||!live&&!replay&&viewKey!==cameraViewKey)cameraPose=aim;
    else if(live||replay)cameraPose=v98BlendCamera(cameraPose,aim,Math.min(.15,Math.max(0,(now-lastSent)/1000)));
    cameraViewKey=viewKey;
    const camera={position:{...cameraPose.position,height:cameraPose.position.y},target:{...cameraPose.target,height:cameraPose.target.y},fov:cameraPose.fov};
    const state=v65Context().state,picture=C.picture(shown,session,++sequence,camera,match.finished?'finished':replay?'replay':state.phase,match.score);
    pending={sequence,at:now};lastSent=now;lastPicture=picture;
    if(!loaded){loading=true;post('load',{config:configuration(picture)});}else post('frame',{frame:picture});
    syncLabels(frame);v103ReplayUI();v131ReviewUI();v132FullscreenUI();
   }
  }
  if(!document.hidden)loop=requestAnimationFrame(render);
 }
 window.addEventListener('message',event=>{
  if(event.origin!==origin||event.source!==iframe?.contentWindow||event.data?.channel!==channel)return;
  const data=event.data;
  if(data.kind==='ready'){if(!ready){ready=true;started=performance.now();}return;}
  if(data.kind==='progress'){if(message&&!loaded)message.textContent=v98Text('Unity lädt · ','Unity loading · ')+Math.round(data.progress*100)+' %';return;}
  if(data.session&&data.session!==session)return;
  if(data.kind==='interaction'&&data.session===session){v132RevealControls();return;}
  if(data.kind==='projection'&&data.session===session){paintLabels(data);return;}
  if(data.kind==='error'){fail(data.message);return;}
  if(data.kind==='ack'&&pending?.sequence===data.sequence){
   // The first acknowledged picture must carry every sent player; otherwise the
   // held native clock would wait for an incomplete scene, so drop to 2D.
   if(loading&&Number.isFinite(data.players)&&(data.players!==lastPicture.players.length||Array.isArray(data.ids)&&!lastPicture.players.every(p=>data.ids.includes(p.id)))){fail(v98Text('Unity hat nicht alle Spieler geladen · 2D ist aktiv','Unity did not load all players · using 2D'));return;}
   pending=null;if(loading){loaded=true;loading=false;message.hidden=true;}window.D6UnityMatch.lastAck=data;
  }
 });
 // While the selected Unity view of this match is still loading (first start,
 // reload, restored checkpoint), native steps wait like during a replay: the
 // clock, phase and pause state stay untouched and continue with the first
 // acknowledged picture. 2D, a failure or another view never wait.
 function holdsClock(){return Boolean(match)&&!failed&&!v98Failed&&v98IsWorld()&&v98View==='3d'&&v98Orientation.matches&&(!loaded||current!==match);}
 let heldStep=null;
 const baseStep=step;step=function(...args){if(holdsClock()){heldStep=match;return;}heldStep=null;return v151WrapStep(baseStep,this,args);};
 const baseAfterStep=v65AfterStep;v65AfterStep=function(...args){if(heldStep&&heldStep===match)return;return baseAfterStep.apply(this,args);};
 const baseRender=v98RenderScene;
 v98RenderScene=function(captureOnly=false){
  if(!v98IsWorld()){dispose();return baseRender(captureOnly);}
  if(v98View!=='3d'||!v98Orientation.matches||v98Failed){window.D6ViewFramePump?.setEnabled(false);if(host){host.hidden=true;if(suspendedAt===null)suspendedAt=performance.now();}if(loop)cancelAnimationFrame(loop);loop=0;return baseRender(captureOnly);}
  if(failed){failed=false;v98Failed=false;}
  window.D6ViewFramePump?.setEnabled(true);if(!loop)render();v98Toolbar();v98SyncAudio();
 };
 const baseToolbar=v98Toolbar;
 v98Toolbar=function(){const toolbar=baseToolbar();if(v98IsWorld()){v98Put(toolbar.querySelector('[data-v98-view="3d"]'),'textContent','Unity · TV');const status=toolbar.querySelector('#v98-status');if(failed)v98Put(status,'textContent',String(window.D6UnityMatch.lastError??''));else if(!loaded&&v98View==='3d')v98Put(status,'textContent',v98Text('Unity wird geladen','Loading Unity'));v98Put(toolbar.dataset,'status',String(Boolean(status.textContent)));let button=toolbar.querySelector('#d6-ball-guide-toggle');if(!button){button=document.createElement('button');button.id='d6-ball-guide-toggle';button.type='button';toolbar.querySelector('#v98-sound').after(button);button.addEventListener('click',()=>{ballGuideEnabled=!ballGuideEnabled;try{localStorage.setItem('d6-ball-guide',ballGuideEnabled?'on':'off')}catch{}if(lastProjection)paintLabels(lastProjection);v98Toolbar();});}v98Put(button,'textContent',v98Text('Ballhilfe','Ball guide'));v98Attr(button,'aria-pressed',String(ballGuideEnabled));v98Put(button,'disabled',v98View!=='3d'||!v98Orientation.matches);}return toolbar;};
 // Camera changes and return from 2D must resume the picture loop immediately.
 document.addEventListener('visibilitychange',()=>{if(document.hidden){if(suspendedAt===null)suspendedAt=performance.now();if(v65Context()?.state.phase==='live')v65Pause();}else if(host&&!loop)render();});
 const baseLeave=v65Leave;v65Leave=async function(...args){const result=await baseLeave.apply(this,args);if(!v98IsWorld())dispose();return result;};
 window.D6UnityMatch={get ready(){return loaded;},get session(){return session;},get picture(){return lastPicture&&structuredClone(lastPicture);},get projection(){return lastProjection&&structuredClone(lastProjection);},get loads(){return loadCount;},get active(){return Boolean(host&&!host.hidden&&loaded);},get clockHeld(){return holdsClock();},lastError:null,lastAck:null};
})();
