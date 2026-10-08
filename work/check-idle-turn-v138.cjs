const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process'),{pathToFileURL}=require('node:url'),{chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const diagnose=process.argv.includes('--diagnose'),baseline=process.argv.includes('--baseline');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const page=await browser.newPage({viewport:{width:1100,height:780}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve('outputs/spieler-nutzer-match.html')).href,{timeout:120000});await page.waitForFunction(()=>window.userMeshyMatchReady,null,{timeout:60000});
 if(baseline)await page.addScriptTag({content:execFileSync('git',['show','1e48990:dist/player-user-motion-v108.js'],{encoding:'utf8',windowsHide:true})});
 const report=await page.evaluate(({diagnose})=>{
  clearInterval(v65WorldFrame);clearInterval(v64UiTimer);v132StopReview();v103EndReplay();v102StopPaint();running=false;hideOverlay();draw();v102StopPaint();for(const v of v98Players.values()){v.root.visible=false;v.label.hidden=true;}v98Scene.ballRoot.visible=false;v98Scene.ownerRing.visible=false;
  const T=THREE,original=JSON.stringify(match),factory=D6UserLocomotion.create,rows=[],images=[];
  for(const variant of diagnose?['original','no-lock','no-ik','no-idle-clip']:['original'])for(const fps of diagnose?[60]:[30,60,120])for(const target of [Math.PI/2,-Math.PI/2,Math.PI-.1,-Math.PI+.1]){
   const selected=variant==='no-idle-clip'?eval('(function '+factory.toString().replace("start(turn>0?'turn_idle_left':'turn_idle_right')","void 0")+')'):factory;
   let maxCorrectionAngle=0,maxCorrection=0,minFootSeparation=Infinity,crossFrames=0,separationSign=0,maxStep=0,maxHipsStep=0,lastFeet=null,lastHips=null,maxRootDelta=0,lastHeading=0;
   D6UserLocomotion.create=(...args)=>{const r=selected(...args),apply=r.apply;r.apply=opts=>{
    const before=r.state.feet.map(f=>{const p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();args[2].bones[f.foot].matrixWorld.decompose(p,q,s);return q;});
    if(variant==='no-lock')for(const f of r.state.feet){f.locked=false;f.strength=0;f.blocked=false;}
    if(variant==='no-ik')args[2].update();else apply(opts);
    r.state.feet.forEach((f,i)=>{const p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();args[2].bones[f.foot].matrixWorld.decompose(p,q,s);maxCorrectionAngle=Math.max(maxCorrectionAngle,before[i].angleTo(q));});
   };return r;};
   const v=v98Scene.player(0,37,0,0,false,{main:'#ca3546',trim:'#fff1dc',style:'stripe'},{skinTone:'warm',hairColor:'brown'}),p={id:'idle-turn',x:0,z:0,number:37,team:0,keeper:false},frame={turned:false,owner:null,ballInFlight:false,ball:{x:0,z:20,height:.29}},dt=1/fps,samples=[];v.heading=0;v.previous={x:0,z:0};
   const joint=n=>new T.Vector3().setFromMatrixPosition(v.meshy.skeleton.bones.find(b=>b.name.endsWith(n)).matrixWorld);
   for(let i=0;i<fps*4;i++){
    const t=i/fps;if(t>=1){frame.ball.x=Math.sin(target)*20;frame.ball.z=Math.cos(target)*20;}
    v102RunPose(v,p,dt,true,frame.ball);v.root.position.set(0,0,0);v.root.rotation.y=v.heading;v.renderMotion({person:p,frame,dt,live:true});v.previous={x:0,z:0};
    const feet=['LeftFoot','RightFoot'].map(joint),hips=joint('Hips'),hipBone=v.meshy.skeleton.bones.find(b=>b.name.endsWith('Hips')),hipQ=new T.Quaternion();hipBone.matrixWorld.decompose(new T.Vector3(),hipQ,new T.Vector3());
    const rawSeparation=feet[1].clone().sub(feet[0]).dot(new T.Vector3(1,0,0).applyQuaternion(hipQ));if(!separationSign)separationSign=Math.sign(rawSeparation)||1;const separation=rawSeparation*separationSign;minFootSeparation=Math.min(minFootSeparation,separation);if(separation<-.015)crossFrames++;
    if(lastFeet){maxStep=Math.max(maxStep,...feet.map((f,j)=>f.distanceTo(lastFeet[j])));maxHipsStep=Math.max(maxHipsStep,hips.distanceTo(lastHips));}lastFeet=feet;lastHips=hips;maxRootDelta=Math.max(maxRootDelta,Math.abs(Math.atan2(Math.sin(v.heading-lastHeading),Math.cos(v.heading-lastHeading))));lastHeading=v.heading;maxCorrection=Math.max(maxCorrection,v.meshy.ground.maxCorrection);
    samples.push({t,heading:v.heading,hips:hips.toArray(),feet:feet.map(f=>f.toArray()),separation,motion:v.meshy.motion,transition:v.meshy.ground.transition?.name||null,locks:v.meshy.ground.feet.map(f=>({locked:f.locked,blocked:f.blocked,strength:f.strength,height:f.height,contact:f.contact}))});
    if(fps===60&&variant==='original'&&target===Math.PI/2&&[1.25,1.5,1.75,2.2].some(at=>Math.abs(t-at)<dt/2)){v98Scene.camera.position.set(3.5,1.5,4.5);v98Scene.camera.fov=28;v98Scene.camera.lookAt(0,.9,0);v98Scene.camera.updateProjectionMatrix();v98Scene.renderer.render(v98Scene.scene,v98Scene.camera);images.push({name:t.toFixed(2),data:v98Scene.renderer.domElement.toDataURL('image/png')});}
   }
   const matrices=v.meshy.skeleton.bones.map(b=>b.matrixWorld.toArray());for(let i=0;i<3;i++)v.renderMotion({person:p,frame,dt,live:false});const paused=matrices.every((a,i)=>a.every((x,j)=>Math.abs(x-v.meshy.skeleton.bones[i].matrixWorld.elements[j])<1e-6));
   rows.push({variant,fps,target,maxCorrectionAngle,maxCorrection,minFootSeparation,crossFrames,maxStep,maxHipsStep,maxRootDelta,paused,samples});v98Scene.removePlayer(v);
  }
  D6UserLocomotion.create=factory;return {rows,images,unchanged:original===JSON.stringify(match)};
 },{diagnose});
 const tag=diagnose?'diagnose':baseline?'before':'after';for(const i of report.images)fs.writeFileSync('outputs/idle-turn-v138-'+tag+'-'+i.name+'.png',Buffer.from(i.data.split(',')[1],'base64'));delete report.images;fs.writeFileSync('outputs/idle-turn-v138-'+tag+'.json',JSON.stringify({...report,errors},null,2)+'\n');assert.deepEqual(errors,[]);assert(report.unchanged);assert(report.rows.every(r=>r.paused));if(!baseline&&!diagnose){assert(report.rows.every(r=>r.maxCorrectionAngle<.35&&r.maxCorrection<.15),"Standing turn must not retain the old planted-foot orientation");assert(report.rows.every(r=>r.samples.at(-1).locks.every(f=>f.locked&&f.height>-.015)),"Both feet settle back on the ground");}console.log(JSON.stringify(report.rows.map(({samples,...r})=>r)));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
