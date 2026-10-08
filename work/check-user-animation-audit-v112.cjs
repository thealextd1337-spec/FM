// Isolated animation audit; uses the actual render pipeline and no user saves.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{pathToFileURL}=require('url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const baseline=process.argv.includes('--baseline');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const page=await browser.newPage({viewport:{width:1280,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve('outputs/spieler-nutzer-match.html')).href);await page.waitForFunction(()=>window.userMeshyMatchReady,null,{timeout:60000});
 const focused=await page.evaluate(()=>{
  clearInterval(v65WorldFrame);running=false;hideOverlay();draw();v102StopPaint();const engine=JSON.stringify(match),T=THREE;
  const cases=[];for(const fps of [30,60,120])for(const name of ['turn-with-ball','receive-after-retreat','slow-carrier','moving-u-turn']){
   const v=v98Scene.player(0,39,0,0,false,{main:'#c93848'},{}),p={id:'audit-carrier',team:0,number:39,x:0,z:0,action:null},frame={turned:false,celebration:null,owner:p.id,carrying:true,ballInFlight:false,ball:{x:0,z:.65,height:.29}},rows=[];v.heading=0;v.previous={x:0,z:0};
   const paint=(dz,owner,back=false,live=true)=>{if(live)p.z+=dz;frame.owner=owner?p.id:null;frame.ball={x:0,z:p.z+(name==='slow-carrier'?-.65:.65),height:.29};p.movement=back?{mode:'backpedal',facing:{x:0,z:p.z+5}}:null;v102RunPose(v,p,1/fps,live,frame.ball);v.root.position.set(p.x,0,p.z);v.root.rotation.y=v.heading;v.previous={x:p.x,z:p.z};v.renderMotion({person:p,frame,dt:1/fps,live});const point=v.meshy.ballPoint;return {alignment:Math.cos(v.root.rotation.y)*(dz<0?-1:1),heading:v.root.rotation.y,motion:v.meshy.motion,backWeight:Object.entries(v.meshy.weights).filter(([n])=>n.startsWith('back_')).reduce((s,[,w])=>s+w,0),ballAlignment:point?(point.z-p.z)*(dz<0?-1:1):null}};
   for(let i=0;i<fps;i++)paint(name==='receive-after-retreat'?-2.4/fps:name==='moving-u-turn'?2.4/fps:0,name!=='receive-after-retreat',name==='receive-after-retreat');
   for(let i=0;i<Math.round(fps*.6);i++)rows.push(paint(name==='slow-carrier'?-.15/fps:-2.4/fps,true));
   const paused=v.meshy.skeleton.bones.map(b=>b.matrixWorld.toArray());paint(0,true,false,false);const pauseStable=paused.every((m,i)=>m.every((x,k)=>Math.abs(x-v.meshy.skeleton.bones[i].matrixWorld.elements[k])<1e-7));
   cases.push({name,fps,rows,pauseStable});v98Scene.removePlayer(v);
  }return {cases,unchanged:engine===JSON.stringify(match)};
 });
 const live=await page.evaluate(async()=>{
  clearInterval(v65WorldFrame);v102StopPaint();v103EndReplay(match);let seed=12345;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  const career=v61CreateCareer('GER-2','animation-audit-v112'),club=career.world.clubs.find(c=>c.id==='GER-2');v66ChooseSponsor(career,club.id,club.sponsors[0].id);while(career.world.market.phase==='open')v66NextMarketDay(career);
  const fixture=v62Fixtures(career).find(f=>!f.result&&f.homeId==='GER-2');career.world.activeMatch={fixtureId:fixture.id,state:v64MakeState(career,fixture)};career.world.activeMatch.state.phase='live';v61CurrentCareer=career;v98View='3d';v65Show(v65Context());clearInterval(v65WorldFrame);v102StopPaint();running=true;hideOverlay();
  const T=THREE,previous=new Map(),rows=[],actions=new Set(),motions=new Set(),violations=[],renderer=v98Scene.renderer,render=renderer.render.bind(renderer);renderer.render=()=>{};let now=performance.now();Object.defineProperty(performance,'now',{configurable:true,value:()=>now});v98LastTime=now;let moving=0,defensive=0,frames=0,nonfinite=0,renderChanges=0,backwardCarrier=0,backClips=0,ballBehind=0,torsoBackward=0;const poseForward=(v)=>{const b=v.meshy.skeleton.bones.find(b=>/Spine2$/.test(b.name)),idx=v.meshy.skeleton.bones.indexOf(b),rest=new T.Quaternion(),current=new T.Quaternion(),p=new T.Vector3(),s=new T.Vector3();v.meshy.skeleton.boneInverses[idx].clone().invert().decompose(p,rest,s);b.matrixWorld.decompose(p,current,s);return new T.Vector3(0,0,1).applyQuaternion(rest.invert()).applyQuaternion(current)};
  for(let i=0;i<3600&&!match.finished;i++){
   if(v65Context().state.phase==='paused'){v65Resume();clearInterval(v65WorldFrame);running=true;hideOverlay()}
   v103EndReplay(match);step(1/30*MATCH_SPEED,1/30);if(v65Context().state.phase==='live'&&!match.finished)v65AfterStep(v65Context());now+=1000/30;const raw=v98PitchFrame(match);v102Capture(raw,now,true);v102Frames.at-=1000;v102Painting=true;
   const before=JSON.stringify(match);v98Render();if(before!==JSON.stringify(match))renderChanges++;frames++;
   for(const p of raw.players){const v=v98Players.get(p.id),old=previous.get(p.id);previous.set(p.id,{x:p.x,z:p.z});if(!v?.meshy)continue;motions.add(v.meshy.motion);if(p.action)actions.add(p.action.kind);if(v.meshy.skeleton.bones.some(b=>b.matrixWorld.elements.some(x=>!Number.isFinite(x))))nonfinite++;
    if(p.movement?.mode==='backpedal')defensive++;if(!old||!raw.carrying||p.id!==raw.owner||p.keeper||p.action||p.slideActive)continue;const dx=p.x-old.x,dz=p.z-old.z,d=Math.hypot(dx,dz);if(d<.003||d>4)continue;moving++;
    const alignment=(Math.sin(v.root.rotation.y)*dx+Math.cos(v.root.rotation.y)*dz)/d,bw=Object.entries(v.meshy.weights).filter(([n])=>n.startsWith('back_')).reduce((a,[,w])=>a+w,0),bp=v.meshy.ballPoint,ballAlignment=bp?((bp.x-p.x)*dx+(bp.z-p.z)*dz)/d:null,forward=poseForward(v),torsoAlignment=(forward.x*dx+forward.z*dz)/d;
    if(alignment<-.05)backwardCarrier++;if(bw>.1)backClips++;if(ballAlignment<-.02)ballBehind++;if(torsoAlignment<-.1)torsoBackward++;
    if((alignment<-.05||bw>.1||ballAlignment<-.02||torsoAlignment<-.1)&&violations.length<24)violations.push({frame:i,id:p.id,number:p.number,team:p.team,alignment,torsoAlignment,backWeight:bw,ballAlignment,motion:v.meshy.motion,movement:p.movement?.mode||null});
   }
   if(i%120===0)await new Promise(resolve=>setTimeout(resolve,0));
  }
  v102Painting=false;running=false;v102StopPaint();renderer.render=render;delete performance.now;v98LastTime=performance.now();render(v98Scene.scene,v98Scene.camera);return {frames,finished:match.finished,score:match.score,moving,defensive,backwardCarrier,backClips,ballBehind,torsoBackward,nonfinite,renderChanges,actions:[...actions],motions:[...motions],violations};
 });
 const report={baseline,focused,live,errors};fs.writeFileSync(`docs/spieler-nutzer-rig/animation-audit-${baseline?'baseline':'qa'}-v112.json`,JSON.stringify(report,null,2));await page.locator('#v98-canvas').screenshot({path:`outputs/animation-audit-${baseline?'baseline':'qa'}-v112.png`});
 assert(focused.unchanged);assert.deepEqual(errors,[]);assert.equal(live.nonfinite,0);assert.equal(live.renderChanges,0);assert(live.moving>100);if(!baseline){for(const c of focused.cases){assert(c.rows.every(r=>r.alignment>=-.001),c.name);assert(c.rows.every(r=>r.backWeight<.01),c.name);assert(c.rows.every(r=>r.ballAlignment===null||r.ballAlignment>=-.001),c.name);assert(c.pauseStable,c.name+' pause')}assert.equal(live.backwardCarrier,0);assert.equal(live.backClips,0);assert.equal(live.ballBehind,0);assert.equal(live.torsoBackward,0)}console.log(JSON.stringify({focused:focused.cases.map(c=>({name:c.name,fps:c.fps,minAlignment:Math.min(...c.rows.map(r=>r.alignment)),maxBackWeight:Math.max(...c.rows.map(r=>r.backWeight)),pauseStable:c.pauseStable})),live,errors}));
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
