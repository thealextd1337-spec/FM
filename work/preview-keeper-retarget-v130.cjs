const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const file='outputs/keeper-retarget-probe-v130.html';let html=fs.readFileSync('outputs/spieler-nutzer-match.html','utf8');
for(const [old,newFile]of [['dist/players/football-v130.glb','meshy_output/character-keeper-v130.glb'],['dist/players/calibration-v130.json','meshy_output/keeper-calibration-v130.json']]){const a=fs.readFileSync(old).toString('base64'),b=fs.readFileSync(newFile).toString('base64');if(!html.includes(a))throw Error('Embedded asset missing');html=html.replaceAll(a,b);}fs.writeFileSync(file,html);
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve(file)).href);await page.waitForFunction(()=>window.userMeshyMatchReady,null,{timeout:60000});
 await page.evaluate(()=>{
  clearInterval(v65WorldFrame);running=false;hideOverlay();draw();v102StopPaint();for(const v of v98Players.values()){v.root.visible=false;v.label.hidden=true}v98Scene.ballRoot.visible=false;v98Scene.ownerRing.visible=false;
  const original=D6UserLocomotion.create,ballApply=D6UserBallActions.create;D6UserLocomotion.create=(...args)=>{const m=original(...args);m.drive=()=>({weights:{keeper_shuffle_meshy:1},times:{keeper_shuffle_meshy:window.keeperProbeTime||0},motion:'keeper_shuffle_meshy',phase:0,procedural:0});m.apply=()=>{};return m};D6UserBallActions.create=()=>({plan:()=>null,apply:()=>{}});
  const v=v98Scene.player(0,37,0,0,true,{main:'#268a46',trim:'#fff',style:'plain'},{skinTone:'warm',hairColor:'brown'});D6UserLocomotion.create=original;D6UserBallActions.create=ballApply;
  window.keeperProbeActor=v;window.keeperProbePaint=(time,view)=>{window.keeperProbeTime=time;for(let i=0;i<25;i++)v.renderMotion({person:{id:'raw-keeper',x:0,z:0,keeper:true},frame:{turned:false,owner:null,ball:{x:0,z:10,height:.29}},dt:1/60,live:true});v98Scene.camera.position.set(view==='front'?0:5,1.8,view==='front'?5:0);v98Scene.camera.fov=40;v98Scene.camera.lookAt(0,1.4,0);v98Scene.camera.updateProjectionMatrix();v98Scene.renderer.render(v98Scene.scene,v98Scene.camera);};
 });
 for(const time of [0,.5,1.5,2.5,3.9])for(const view of ['front','side']){await page.evaluate(({time,view})=>keeperProbePaint(time,view),{time,view});await page.locator('#v98-canvas').screenshot({path:'outputs/keeper-retarget-'+view+'-'+time+'-v130.png'});}
 console.log({rawClipPreview:true,errors});
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
