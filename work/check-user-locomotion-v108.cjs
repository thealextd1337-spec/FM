const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{pathToFileURL}=require('url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const baseline=process.argv.includes('--baseline'),calibration=JSON.parse(fs.readFileSync('meshy_output/user-character-2026-10-03/locomotion-v108/calibration.json'));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:850}}),errors=[],remote=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url())});
  await page.goto(pathToFileURL(path.resolve('outputs/spieler-nutzer-match.html')).href);await page.waitForFunction(()=>window.userMeshyMatchReady||window.userMeshyMatchError,null,{timeout:60000});assert.equal(await page.evaluate(()=>window.userMeshyMatchError||null),null);
  const report=await page.evaluate(async({calibration,baseline})=>{
   clearInterval(v65WorldFrame);running=false;hideOverlay();draw();v102StopPaint();for(const v of v98Players.values()){v.root.visible=false;v.label.hidden=true}v98Scene.ballRoot.visible=false;v98Scene.ownerRing.visible=false;
   const original=JSON.stringify(match),vec=new THREE.Vector3(),camera=v98Scene.camera,cases={},clips=new Set(),contact={};
   const sample=(v)=>{const mesh=v.meshy.meshes[0];v.root.updateMatrixWorld(true);mesh.skeleton.update();return calibration.soles.map(sole=>{let y=Infinity;for(const i of sole.sampleVertices){mesh.getVertexPosition(i,vec).applyMatrix4(mesh.matrixWorld);y=Math.min(y,vec.y)}const p=new THREE.Vector3().fromArray(sole.center).applyMatrix4(v.meshy.skeleton.bones[sole.joint].matrixWorld);return {y,p:p.toArray()}})};
   const scenarios=[['walk',4,t=>({speed:1.6,angle:0})],['run',4,t=>({speed:3.5,angle:0})],['sprint',3,t=>({speed:6.5,angle:0})],['start-stop',5,t=>({speed:t<.5?0:t<1.1?(t-.5)/.6*4:t<2.6?4:t<3.2?(3.2-t)/.6*4:0,angle:0})],['turn-left',4,t=>({speed:3.5,angle:t<1?0:t<1.5?(t-1)*Math.PI:Math.PI/2})],['turn-right',4,t=>({speed:3.5,angle:t<1?0:t<1.5?-(t-1)*Math.PI:-Math.PI/2})],['reverse',4,t=>({speed:4.5,angle:t<1?0:t<1.5?-(t-1)*Math.PI*2:-Math.PI})],['walk-left',4,t=>({speed:1.2,angle:t<1?0:t<1.8?(t-1)*Math.PI/1.6:Math.PI/2})],['walk-right',4,t=>({speed:1.2,angle:t<1?0:t<1.8?-(t-1)*Math.PI/1.6:-Math.PI/2})],['idle-left',3,t=>({speed:0,angle:0,look:t<.6?0:1.5})],['idle-right',3,t=>({speed:0,angle:0,look:t<.6?0:-1.5})]];
   const runCase=(name,duration,path,fps=60)=>{
    const v=v98Scene.player(0,37,0,0,false,{main:'#ca3546',trim:'#fff1dc',style:'stripe'},{skinTone:'warm',hairColor:'brown'}),p={x:0,z:0,number:37,team:0,action:null},frame={turned:false,celebration:null,ball:{x:0,z:20}},dt=1/fps,rows=[];v.heading=0;v.previous={x:0,z:0};
    let prev=null,maxSlip=0,sumSlip=0,stanceSamples=0,nearSlip=0,nearSamples=0,minY=Infinity,maxY=-Infinity,maxPoseStep=0,lastBones=null,maxCorrection=0,lockSamples=0;const modes=new Set();
    for(let k=0;k<Math.round(duration*fps);k++){
     const t=k*dt,input=path(t);p.x+=Math.sin(input.angle)*input.speed*dt;p.z+=Math.cos(input.angle)*input.speed*dt;frame.ball={x:p.x+Math.sin(input.look??input.angle)*20,z:p.z+Math.cos(input.look??input.angle)*20};
     p.movement=input.back?{mode:'backpedal',speedFactor:.6,facing:{x:p.x,z:p.z+20}}:null;
     v102RunPose(v,p,dt,true,frame.ball);v.root.position.set(p.x,0,p.z);v.root.rotation.y=v.heading;v.previous={x:p.x,z:p.z};v.renderMotion({person:p,frame,dt,live:true});
     const feet=sample(v),bones=v.meshy.skeleton.bones.map(b=>new THREE.Vector3().setFromMatrixPosition(b.matrixWorld)),m=v.meshy.motion;modes.add(m);clips.add(m);for(const [c,w]of Object.entries(v.meshy.weights))if(w>.035)clips.add(c);
     for(let i=0;i<2;i++){minY=Math.min(minY,feet[i].y);maxY=Math.max(maxY,feet[i].y);const planted=v.meshy.ground?.feet[i].locked;const stable=planted===undefined?feet[i].y<.15:planted;if(k>fps*.5&&prev){const slip=Math.hypot(feet[i].p[0]-prev[i].p[0],feet[i].p[2]-prev[i].p[2])*fps;if(prev[i].stable&&stable&&feet[i].y<.19&&prev[i].y<.19){maxSlip=Math.max(maxSlip,slip);sumSlip+=slip;stanceSamples++}if(feet[i].y<.15&&prev[i].y<.15){nearSlip+=slip;nearSamples++}}feet[i].stable=stable;if(planted)lockSamples++;}
     if(lastBones)maxPoseStep=Math.max(maxPoseStep,...bones.map((p,i)=>p.distanceTo(lastBones[i])));lastBones=bones;prev=feet;maxCorrection=Math.max(maxCorrection,v.meshy.ground?.maxCorrection||0);
     if(k%Math.round(fps/10)===0)rows.push({t,x:p.x,z:p.z,speed:input.speed,motion:m,phase:v.meshy.phase,feet:feet.map((f,i)=>({y:f.y,locked:f.stable,reachError:v.meshy.ground?.feet[i].reachError,contact:v.meshy.ground?.feet[i].contact,anchor:v.meshy.ground?.feet[i].anchor.toArray(),marker:f.p})),transition:v.meshy.ground?.transition||null});
    }
    const before=v.meshy.skeleton.bones.map(b=>b.matrixWorld.toArray()),phase=v.meshy.phase;for(let k=0;k<5;k++){v102RunPose(v,p,dt,false,frame.ball);v.root.position.set(p.x,0,p.z);v.root.rotation.y=v.heading;v.renderMotion({person:p,frame,dt,live:false})}const pauseStable=phase===v.meshy.phase&&v.meshy.skeleton.bones.every((b,i)=>b.matrixWorld.elements.every((x,k)=>Math.abs(x-before[i][k])<1e-8));
    camera.position.set(p.x+3.8,2.7,p.z+6.5);camera.fov=36;camera.lookAt(p.x,1.25,p.z);camera.updateProjectionMatrix();v98Scene.renderer.render(v98Scene.scene,camera);
    const result={fps,duration,minY,maxY,maxPoseStep,meanStanceSlip:sumSlip/Math.max(1,stanceSamples),maxStanceSlip:maxSlip,stanceSamples,lockSamples,nearGroundSlip:nearSlip/Math.max(1,nearSamples),nearGroundSamples:nearSamples,maxCorrection,pauseStable,modes:[...modes],rows};window.userLocomotionActor=v;return result;
   };
   // Save last actor for screenshots, remove previous actors without freeing shared assets.
   scenarios.push(['back-walk',4,t=>({speed:1.8,angle:Math.PI,back:true})],['back-left',4,t=>({speed:2,angle:Math.PI-.5,back:true})],['back-right',4,t=>({speed:2,angle:Math.PI+.5,back:true})],['back-step',3,t=>({speed:.65,angle:Math.PI,back:true})]);
   for(const [name,duration,path]of scenarios){if(window.userLocomotionActor)v98Scene.removePlayer(userLocomotionActor);cases[name]=runCase(name,duration,path)}
   const timing={};for(const fps of [30,120]){v98Scene.removePlayer(userLocomotionActor);timing[fps]=runCase('timing',3,t=>({speed:3.5,angle:0}),fps)}
   v98Scene.removePlayer(userLocomotionActor);cases.show=runCase('show',1.5,t=>({speed:2.8,angle:t<.7?0:Math.min(.9,(t-.7)*2)}));
   const v=userLocomotionActor,p={x:v.root.position.x,z:v.root.position.z,number:37,team:0,action:null};let release;
   if(v.meshy.ground){const frame={turned:true,celebration:null,ball:{x:p.x,z:p.z}};p.x+=30;v.root.position.set(p.x,0,p.z);v.renderMotion({person:p,frame,dt:1/60,live:true});release={teleport:v.meshy.ground.feet.every(f=>!f.locked),finite:v.meshy.skeleton.bones.every(b=>b.matrixWorld.elements.every(Number.isFinite))};p.action={kind:'pass'};v.renderMotion({person:p,frame,dt:1/60,live:true});release.action=v.meshy.ground.feet.every(f=>!f.locked)}
   return {baseline,cases,timing,release,clips:[...clips],unchanged:original===JSON.stringify(match)};
  },{calibration,baseline});
  await page.locator('#v98-canvas').screenshot({path:`outputs/user-locomotion-${baseline?'baseline':'v108'}.png`});
  const output=`docs/spieler-nutzer-rig/locomotion-${baseline?'baseline':'qa-v108'}.json`;fs.writeFileSync(output,JSON.stringify({...report,errors,remote:remote.length},null,2));
  assert.deepEqual(errors,[]);assert.equal(remote.length,0);assert(report.unchanged);if(!baseline){for(const c of Object.values(report.cases)){assert(c.minY>.07,'Below turf '+JSON.stringify({minY:c.minY}));assert(c.pauseStable,'Pause pose changed');assert(c.maxPoseStep<.7,'Pose jump '+c.maxPoseStep)}assert(report.release.teleport&&report.release.action&&report.release.finite);for(const name of ['walk','run','sprint']){const c=report.cases[name];assert(c.lockSamples>0,'No planted foot '+name);assert(c.meanStanceSlip<.45,'Sliding '+name+' '+c.meanStanceSlip)}}
  console.log(JSON.stringify({output,cases:Object.fromEntries(Object.entries(report.cases).map(([k,v])=>[k,{...v,rows:undefined}])),timing:Object.fromEntries(Object.entries(report.timing).map(([k,v])=>[k,{...v,rows:undefined}])),clips:report.clips,release:report.release,errors}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
