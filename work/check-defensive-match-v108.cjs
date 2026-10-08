const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{pathToFileURL}=require('url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve('outputs/spieler-nutzer-match.html')).href);await page.waitForFunction(()=>window.userMeshyMatchReady,null,{timeout:60000});
  const report=await page.evaluate(()=>{
   clearInterval(v65WorldFrame);running=false;hideOverlay();draw();v102StopPaint();const actor=match.people.find(p=>p.t===0&&!p.keeper&&(p.assignedLine||p.line)==='def'),owner=match.people.find(p=>p.t===1&&!p.keeper),chaser=match.people.find(p=>p.t===0&&!p.keeper&&p!==actor);
   match.kickoff=null;match.countdown=0;match.goalPause=0;match.flight=null;match.slide=null;match.next=Infinity;match.teamPress=[0,0];for(const key of ['throwIn','setPiece','rebound','halftimePause','postBanner'])match[key]=null;
   for(let i=0;i<match.people.length;i++){const p=match.people[i];p.x=p.bx=.12+(i%6)*.14;p.y=p.by=.25+(i%3)*.14;p.slideActive=false;p.recoverUntil=0}
   for(const p of match.people.filter(p=>p.t===1&&!p.keeper)){p.x=p.bx=.5;p.y=p.by=.75}
   actor.x=actor.bx=.5;actor.y=.802;actor.role=0;owner.x=owner.bx=.5;owner.y=.75;chaser.x=.54;chaser.y=.73;match.owner=owner;match.ball={x:owner.x,y:owner.y};
   const before={x:actor.x,y:actor.y},delta=.01,expected=(.07+ability(actor,'spd')*PLAYER_SPEED_FACTOR)*delta;step(delta,delta/MATCH_SPEED);const displacement=Math.hypot(actor.x-before.x,actor.y-before.y),mode=v108MovementMode(match,actor),frame=v98PitchFrame(match),projected=frame.players.find(p=>p.person===actor);
   const snapshot=JSON.stringify(match),canvas=document.querySelector('#canvas'),ctx=canvas.getContext('2d'),arc=ctx.arc,radii=[];ctx.arc=function(x,y,r,...args){radii.push(r);return arc.call(this,x,y,r,...args)};try{draw()}finally{ctx.arc=arc;v102StopPaint()}
   const drawUnchanged=snapshot===JSON.stringify(match);
   const ball={radius:v98Scene.ball.geometry.parameters.radius,scale:v98Scene.ball.scale.x,rootScale:v98Scene.ballRoot.scale.x,radius2D:radii.includes(3.78)};
   for(const v of v98Players.values()){v.root.visible=false;v.label.hidden=true}v98Scene.ownerRing.visible=false;v98Scene.ballRoot.visible=true;
   const keeper=v98Scene.player(0,38,0,0,true,{main:'#dab437',trim:'#fbf0da'},{skinTone:'warm',hairColor:'brown'}),p={x:0,z:0,team:0,number:38,keeper:true,action:null},cases=[];keeper.heading=0;keeper.previous={x:0,z:0};
   for(const target of [{x:0,z:6,height:.29},{x:4,z:0,height:.29},{x:-4,z:0,height:.29},{x:0,z:-6,height:.29},{x:0,z:4,height:4}]){
    for(let i=0;i<150;i++){v102RunPose(keeper,p,1/60,true,target);keeper.root.position.set(0,0,0);keeper.root.rotation.y=keeper.heading;v108KeeperLook(keeper,p,{ball:target},1/60,true)}keeper.root.updateMatrixWorld(true);
    const head=keeper.neck.getWorldPosition(new THREE.Vector3()),want=new THREE.Vector3(target.x,target.height,target.z).sub(head).normalize(),forward=new THREE.Vector3(0,0,1).applyQuaternion(keeper.neck.getWorldQuaternion(new THREE.Quaternion()));cases.push({target,alignment:forward.dot(want),heading:keeper.heading});
   }
   const neck=keeper.neck.rotation.toArray(),heading=keeper.heading;v102RunPose(keeper,p,.5,false,{x:9,z:9,height:5});v108KeeperLook(keeper,p,{ball:{x:9,z:9,height:5}},.5,false);const paused=heading===keeper.heading&&JSON.stringify(neck)===JSON.stringify(keeper.neck.rotation.toArray());
   const camera=v98Scene.camera;camera.position.set(3.6,2.5,6.5);camera.fov=36;camera.lookAt(0,1.2,0);camera.updateProjectionMatrix();v98Scene.ballRoot.position.set(0,4,4);v98Scene.renderer.render(v98Scene.scene,camera);
   return {engine:{displacement,forwardDisplacement:expected,ratio:displacement/expected,mode:mode?.mode,projectedMovement:projected.movement},ball,keeper:{cases,paused},drawUnchanged,poseUnchanged:snapshot===JSON.stringify(match)};
  });
  await page.locator('#v98-canvas').screenshot({path:'outputs/user-keeper-look-v108.png'});fs.writeFileSync('docs/spieler-nutzer-rig/defensive-match-v108.json',JSON.stringify({...report,errors},null,2));
  assert.equal(report.engine.mode,'backpedal');assert(Math.abs(report.engine.ratio-.6)<1e-5,JSON.stringify(report.engine));assert.equal(report.engine.projectedMovement.mode,'backpedal');assert(report.drawUnchanged&&report.poseUnchanged);assert.equal(report.ball.scale,.63);assert.equal(report.ball.rootScale,1);assert(report.ball.radius2D);assert(report.keeper.paused);assert(report.keeper.cases.every(c=>c.alignment>.97),JSON.stringify(report.keeper));assert.deepEqual(errors,[]);console.log(JSON.stringify(report));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
