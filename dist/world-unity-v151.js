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
  return {schema,session,sequence,clock:frame.clock,elapsed:frame.elapsed,phase,score:[...score],turned:Boolean(frame.turned),replay:Boolean(frame.review||frame.replay),owner:frame.owner||'',...(typeof frame.ballInFlight==='boolean'?{ballInFlight:frame.ballInFlight}:{}),ball:point(frame.ball),ballOpacity:frame.ball.opacity??1,camera:{position:point(camera.position),target:point(camera.target),fov:camera.fov},players:frame.players.map(p=>{
   // Foul reactions own the contact picture; otherwise an observed native
   // slide overrides the ordinary running/action pose. Both are read-only.
   const a=['foulVictim','foulOffender'].includes(p.action?.kind)?p.action:p.unityAction||p.action;
   const direction=a?.facing&&Math.hypot(a.facing.x,a.facing.z)>.00001?[a.facing.x,0,a.facing.z]:p.movement?.facing?[p.movement.facing.x-p.x,0,p.movement.facing.z-p.z]:[(p.team===0?1:-1)*(frame.turned?-1:1),0,0];
   const keeperFacts=Object.fromEntries(['saved','parry','goal','smother','held'].filter(k=>typeof a?.[k]==='boolean').map(k=>[k,a[k]]));
   return {id:p.id,position:[p.x,0,p.z],facing:direction,moving:!['idle','restart'].includes(p.movement?.mode),action:a?.kind||'idle',actionId:String(a?.id??a?.kind??'idle'),contactPoint:a?.contactWorld?point(a.contactWorld):null,recovery:a?.recovery||0,progress:a?.progress??0,duration:a?.duration||1,number:p.number,...keeperFacts,...(a?.kind==='goalKick'&&['waiting','follow'].includes(a.phase)?{phase:a.phase}:{}),...(typeof a?.holding==='boolean'?{holding:a.holding}:{}),...(Number.isFinite(a?.pickup)?{pickup:Math.max(0,Math.min(1,a.pickup))}:{}),...(a?.aerial===true?{aerial:true}:{}),...(Number.isFinite(p.freshness)?{freshness:p.freshness}:{})};
  }),netActive:Boolean(frame.net),net:frame.net?{...frame.net}:null,...celebration};
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
  return {...frame,ball:at(frame.ball),net:frame.net?{...frame.net,z:Math.max(-post,Math.min(post,frame.net.z*sz))}:frame.net,players:frame.players.map(p=>({...p,x:p.x*sx,z:p.z*sz,movement:p.movement?{...p.movement,facing:at(p.movement.facing)}:p.movement,action:p.action?.contactWorld?{...p.action,contactWorld:at(p.action.contactWorld)}:p.action,unityAction:p.unityAction?{...p.unityAction,contactWorld:at(p.unityAction.contactWorld),facing:{x:p.unityAction.facing.x*sx,z:p.unityAction.facing.z*sz}}:p.unityAction}))};
 }
 // The browser camera rules are authored for 68 x 44. On a larger pitch the
 // aim follows the same relative ball position; overview cameras also step back
 // by the pitch factor, so they show the same ball-led section as on 68 x 44
 // (not the whole pitch); the following cameras keep their player distance.
 function camera(aim,ball,g,mode){
  if(!g||g.length===legacy.length&&g.width===legacy.width)return aim(ball);
  const sx=g.length/legacy.length,sz=g.width/legacy.width,pose=aim({...ball,x:ball.x/sx,z:ball.z/sz}),k=['wide','goal'].includes(mode)?Math.max(sx,sz):1;
  const target={x:pose.target.x*sx,y:pose.target.y,z:pose.target.z*sz};
  return {position:{x:target.x+(pose.position.x-pose.target.x)*k,y:target.y+(pose.position.y-pose.target.y)*k,z:target.z+(pose.position.z-pose.target.z)*k},target,fov:pose.fov};
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
 root.D6WorldUnityContract={schema,kit,player,picture,geometry,scaled,camera,labelPosition,labelLeader,ballGuide};
 if(typeof module==='object'&&module.exports)module.exports=root.D6WorldUnityContract;
})(typeof window==='object'?window:globalThis);

if(typeof window==='object'&&typeof v98RenderScene==='function') (function(){
 const C=window.D6WorldUnityContract,channel=C.schema;
 const selected=new URLSearchParams(location.search).get('engine');
 const localFile=location.protocol==='file:';
 const enabled=selected==='unity'||selected!=='browser'&&(Boolean(window.D6UnityMatchUrl)||localFile);
 if(!enabled)return;
 const basePitchFrame=v98PitchFrame;v98PitchFrame=function(current){const frame=basePitchFrame(current);for(const p of frame.players){const action=p.action;if(!action)continue;const contact=action.contact||(action.kind==='save'?action.target:null)||(['pass','shot','highPass','cross','freeKick','goalKick'].includes(action.kind)&&action.target?v101KickPoint(p.person,action.target):null);if(contact){const spot=v98PitchPoint(contact,frame.turned);p.action={...action,contactWorld:{...spot,height:contact.elevation??action.height??.29}};}}if(frame.celebration){const goal=current.goals?.at(-1);frame.celebration={...frame.celebration,scorer:goal&&!goal.ownGoal&&goal.pid?goal.pid:''};}if(current.goalScene&&current.goalPause>0){const p=v83GoalPosition(current.goalScene),spot=v98PitchPoint(p,frame.turned);frame.net={sign:Math.sign(spot.x),z:spot.z,height:.8,age:current.goalScene.elapsed,bulge:p.bulge};}return frame;};
 let shownGeometry=null,host=null,iframe=null,labels=null,message=null,ballGuide=null,current=null,session='',sequence=0,ready=false,loaded=false,loading=false,pending=null,loop=0,lastSent=-Infinity,started=0,failed=false,cameraPose=null,cameraViewKey='',lastPicture=null,loadCount=0,lastProjection=null,suspendedAt=null;
 let ballGuideEnabled=true;try{ballGuideEnabled=localStorage.getItem('d6-ball-guide')!=='off'}catch{}
 const labelMap=new Map();
 const runtimeUrl=new URL(window.D6UnityMatchUrl||(localFile?'http://127.0.0.1:4300/source/unity-match/runtime.html':new URL('unity-match/runtime.html',document.baseURI).href),location.href);
 if(localFile)runtimeUrl.searchParams.set('parent','file');
 const origin=runtimeUrl.origin;
 const style=document.createElement('style');style.textContent=`
 #d6-unity-host{position:absolute;inset:0;z-index:1;overflow:hidden;background:#182b30}
 #d6-unity-host iframe{display:block;width:100%;height:100%;border:0}
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
  labels=document.createElement('div');labels.id='d6-unity-labels';ballGuide=document.createElement('div');ballGuide.id='d6-unity-ball-guide';ballGuide.hidden=true;ballGuide.setAttribute('aria-hidden','true');host.append(iframe,message,ballGuide,labels);$('#match-area .v42-pitch-stage').prepend(host);
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
  return {schema:channel,session,fixtureId:context.fixture.id,quality,geometry:{...C.geometry(match.geometry,base),fieldPlayers:match.people.filter(p=>p.t===0&&!p.keeper).length,attackDirection:1},teams:teams.map((club,team)=>({id:club.id,name:club.name,home:v65Side(team,context.ownSide)===0})),players:teams.flatMap((club,team)=>club.roster.map(p=>C.player(p,team,p.keeper?(team===0?match.kits.userKeeper:match.kits.opponentKeeper):(team===0?match.kits.user:match.kits.opponent)))),initial:frame};
 }
 function syncLabels(frame){
  const ids=new Set();
  for(const p of frame.players){
   ids.add(p.id);let label=labelMap.get(p.id);
   if(!label){label=document.createElement('button');label.type='button';label.dataset.player=p.id;label.hidden=true;const number=document.createElement('b'),name=document.createElement('span');label.append(number,name);labels.append(label);labelMap.set(p.id,label);}
   label.firstChild.textContent=p.number;label.lastChild.textContent=' '+p.person.name.split(' ').at(-1);label.setAttribute('aria-label',p.person.name+' · '+v98Text('Live-Spielerinfo','Live player information'));label.disabled=Boolean(frame.review||frame.replay);
   label.dataset.team=String(p.team);const clubKit=p.team===0?match.kits.user:match.kits.opponent;label.style.setProperty('--team-color',C.kit(clubKit).main);
  }
  for(const [id,label]of labelMap)if(!ids.has(id)){label.remove();labelMap.delete(id);}
 }
 function paintLabels(data){
  if(!Array.isArray(data.markers)||data.sequence<1||data.sequence<(lastProjection?.sequence||0)||data.width<=0||data.height<=0)return;
  if(data.markers.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)||typeof p.id!=='string'||typeof p.visible!=='boolean'))return;
  lastProjection=data;const placed=[],width=labels.clientWidth,height=labels.clientHeight;
  const guide=C.ballGuide(data.ballMarker,width,height,data.width,ballGuideEnabled);ballGuide.hidden=!guide;
  if(guide){ballGuide.style.left=guide.x+'px';ballGuide.style.top=guide.y+'px';ballGuide.style.width=ballGuide.style.height=guide.size+'px';ballGuide.style.opacity=String(guide.opacity);placed.push({x:guide.x,y:guide.y+guide.size/2,w:guide.size,h:guide.size});}
  // Keep every name, prioritising the ball area and then the nearer player.
  // Displaced names retain a fine leader to the actual Unity head projection.
  const order=data.markers.filter(m=>labelMap.has(m.id)).sort((a,b)=>Number(b.featured)-Number(a.featured)||(Number.isFinite(a.depth)&&Number.isFinite(b.depth)?a.depth-b.depth:b.y-a.y));
  for(const marker of order){
   const label=labelMap.get(marker.id);label.hidden=!marker.visible;label.classList.toggle('is-featured',Boolean(marker.featured));
   if(marker.visible&&width>0&&height>0){
    const size=label.getBoundingClientRect(),x=marker.x*width,y=marker.y*height,p=C.labelPosition({x,y,w:size.width||40,h:size.height||16,previous:{x:Number(label.dataset.offsetX)||0,y:Number(label.dataset.offsetY)||0}},placed,width,height);placed.push(p);
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
  const rect=host.getBoundingClientRect(),visible=!document.hidden&&rect.width>0&&rect.height>0&&!v65PauseView;
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
 const baseStep=step;step=function(...args){if(holdsClock()){heldStep=match;return;}heldStep=null;return baseStep.apply(this,args);};
 const baseAfterStep=v65AfterStep;v65AfterStep=function(...args){if(heldStep&&heldStep===match)return;return baseAfterStep.apply(this,args);};
 const baseRender=v98RenderScene;
 v98RenderScene=function(captureOnly=false){
  if(!v98IsWorld()){dispose();return baseRender(captureOnly);}
  if(v98View!=='3d'||!v98Orientation.matches||v98Failed){if(host){host.hidden=true;if(suspendedAt===null)suspendedAt=performance.now();}if(loop)cancelAnimationFrame(loop);loop=0;return baseRender(captureOnly);}
  if(failed){failed=false;v98Failed=false;}
  if(!loop)render();v98Toolbar();v98SyncAudio();
 };
 const baseToolbar=v98Toolbar;
 v98Toolbar=function(){const toolbar=baseToolbar();if(v98IsWorld()){toolbar.querySelector('[data-v98-view="3d"]').textContent='Unity · TV';const status=toolbar.querySelector('#v98-status');if(failed)status.textContent=window.D6UnityMatch.lastError;else if(!loaded&&v98View==='3d')status.textContent=v98Text('Unity wird geladen','Loading Unity');toolbar.dataset.status=String(Boolean(status.textContent));let button=toolbar.querySelector('#d6-ball-guide-toggle');if(!button){button=document.createElement('button');button.id='d6-ball-guide-toggle';button.type='button';toolbar.querySelector('#v98-sound').after(button);button.addEventListener('click',()=>{ballGuideEnabled=!ballGuideEnabled;try{localStorage.setItem('d6-ball-guide',ballGuideEnabled?'on':'off')}catch{}if(lastProjection)paintLabels(lastProjection);v98Toolbar();});}button.textContent=v98Text('Ballhilfe','Ball guide');button.setAttribute('aria-pressed',String(ballGuideEnabled));button.disabled=v98View!=='3d'||!v98Orientation.matches;}return toolbar;};
 // Camera changes and return from 2D must resume the picture loop immediately.
 document.addEventListener('visibilitychange',()=>{if(document.hidden){if(suspendedAt===null)suspendedAt=performance.now();if(v65Context()?.state.phase==='live')v65Pause();}else if(host&&!loop)render();});
 const baseLeave=v65Leave;v65Leave=async function(...args){const result=await baseLeave.apply(this,args);if(!v98IsWorld())dispose();return result;};
 window.D6UnityMatch={get ready(){return loaded;},get session(){return session;},get picture(){return lastPicture&&structuredClone(lastPicture);},get projection(){return lastProjection&&structuredClone(lastProjection);},get loads(){return loadCount;},get active(){return Boolean(host&&!host.hidden&&loaded);},get clockHeld(){return holdsClock();},lastError:null,lastAck:null};
})();
