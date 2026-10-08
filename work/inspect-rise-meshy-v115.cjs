const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const page=await browser.newPage({viewport:{width:1100,height:780}});await page.goto(pathToFileURL(path.resolve('outputs/spieler-nutzer-match.html')).href);await page.waitForFunction(()=>window.userMeshyMatchReady,null,{timeout:60000});
 await page.evaluate(()=>{clearInterval(v65WorldFrame);running=false;hideOverlay();draw();v102StopPaint();for(const v of v98Players.values()){v.root.visible=false;v.label.hidden=true}v98Scene.ballRoot.visible=false;v98Scene.ownerRing.visible=false;
  const original=D6UserLocomotion.create;window.rawBrakeTime=0;D6UserLocomotion.create=(...args)=>{const motion=original(...args);motion.drive=()=>({weights:{keeper_rise_meshy:1},times:{keeper_rise_meshy:rawBrakeTime},motion:'keeper_rise_meshy',phase:0,procedural:0});motion.apply=()=>{};return motion};
  const v=v98Scene.player(0,37,0,0,false,{main:'#ca3546',trim:'#fff1dc',style:'stripe'},{skinTone:'warm',hairColor:'brown'});window.rawActor=v;D6UserLocomotion.create=original;
  window.rawPaint=time=>{rawBrakeTime=time;v.root.rotation.y=0;v.renderMotion({person:{id:'raw',x:0,z:0},frame:{turned:false,ball:{x:0,z:20}},dt:1/60,live:true});v98Scene.camera.position.set(4,2.5,6);v98Scene.camera.fov=30;v98Scene.camera.lookAt(0,1.3,0);v98Scene.camera.updateProjectionMatrix();v98Scene.renderer.render(v98Scene.scene,v98Scene.camera)};
 });
 for(const time of [1.9,2.8,3.8,4.8,5.8,6.8]){await page.evaluate(t=>rawPaint(t),time);await page.locator('#v98-canvas').screenshot({path:`outputs/meshy-rise-source-${time}-v115.png`})}
 console.log('Six raw Meshy action 531 poses rendered on the user rig.');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
