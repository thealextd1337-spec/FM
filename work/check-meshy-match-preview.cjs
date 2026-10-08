const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),{pathToFileURL}=require('url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const source=fs.readFileSync('work/check-world-pitch3d-browser.cjs','utf8'),url=pathToFileURL(require('path').resolve('outputs/meshy-match-preview.html')).href+'?qa=1';
const {setup,complete}=vm.runInNewContext(source.slice(source.indexOf('async function setup('),source.indexOf('(async()=>{'))+';({setup,complete})',{url});
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await setup(page,'3d');await page.waitForFunction(()=>window.meshyMatchReady||window.meshyMatchError);assert.equal(await page.evaluate(()=>window.meshyMatchError||null),null);
  const initial=await page.evaluate(()=>({players:v98Players.size,imported:[...v98Players.values()].filter(v=>v.meshy).length,kit:meshyMatchTrial.selected.meshy.kit}));assert.equal(initial.imported,10);
  await page.locator('#match-area .v42-pitch-stage').screenshot({path:'outputs/meshy-match-tv.png'});
  const poses=await page.evaluate(()=>{
   running=false;hideOverlay();draw();const v=meshyMatchTrial.selected;for(const p of v98Players.values()){p.root.visible=p===v;p.label.hidden=true}v98Scene.ballRoot.visible=false;v98Scene.ownerRing.visible=false;
   const results=[];v.root.position.set(0,0,0);v.heading=0;v.root.rotation.y=0;v.previous={x:0,z:0};
   const measure=(mode)=>{v98Scene.scene.updateMatrixWorld(true);v.meshy.skeleton.update();let min=Infinity,max=-Infinity,finite=true,gap=Infinity;
    const heading=v.root.rotation.y,ball=mode==='header'?new THREE.Vector3(0,2.65,0):new THREE.Vector3(Math.sin(heading)*.65,mode==='volley'?1.2:.29,Math.cos(heading)*.65);
    for(const mesh of v.meshy.meshes)for(let i=0;i<mesh.geometry.attributes.position.count;i++){const p=new THREE.Vector3().fromBufferAttribute(mesh.geometry.attributes.position,i);mesh.applyBoneTransform(i,p);p.applyMatrix4(mesh.matrixWorld);finite&&=[p.x,p.y,p.z].every(Number.isFinite);min=Math.min(min,p.y);max=Math.max(max,p.y);const y=mesh.geometry.attributes.d6Rest.getY(i);if(mode==='header'?y>1.52:y<.17)gap=Math.min(gap,p.distanceTo(ball))}return {minY:min,maxY:max,finite,contactGap:gap}};
   window.setMeshyQAPose=(mode,phase=.9,progress=0)=>{
    v.previous={x:0,z:0};v.runSpeed=mode==='run'?3:mode==='walk'?1:0;v.locomotion=null;v.runPhase=phase;
    const person={x:0,z:mode==='run'?.048:mode==='walk'?.016:0,number:v.number};v102RunPose(v,person,.016,true);v.root.position.set(0,0,0);v.root.rotation.y=0;
    if(mode==='turn'){v102RunPose(v,{x:.04,z:0,number:v.number},.016,true);v.root.rotation.y=v.heading}
    if(['pass','shot','header','volley'].includes(mode))v102ActionPose(v,{kind:mode,progress,duration:.48,target:{x:.5,y:.5+.15},contact:mode==='header'?{x:.5,y:.5}:null},{x:0,z:0},false);
    return {mode,...measure(mode)};
   };
   for(const mode of ['idle','walk','run','turn','pass','shot','header','volley'])results.push(setMeshyQAPose(mode));
   v102RunPose(v,{x:0,z:0,number:v.number},.016,false);v.root.position.set(0,0,0);v.root.rotation.y=0;
   const c=v98Scene.camera;c.position.set(0,2.2,6.5);c.fov=32;c.lookAt(0,1.4,0);c.updateProjectionMatrix();v98Scene.renderer.render(v98Scene.scene,c);return results;
  });
  for(const p of poses){assert(p.finite);assert(p.maxY<4&&p.maxY>1.5)}
  await page.locator('#match-area .v42-pitch-stage').screenshot({path:'outputs/meshy-match-close.png'});
  for(const mode of ['run','pass','shot','header']){
   await page.evaluate(mode=>{setMeshyQAPose(mode);v98Scene.renderer.render(v98Scene.scene,v98Scene.camera)},mode);
   await page.locator('#match-area .v42-pitch-stage').screenshot({path:'outputs/meshy-match-'+mode+'.png'});
  }
  const cycles=await page.evaluate(()=>{const samples=[];for(const mode of ['walk','run'])for(let i=0;i<60;i++)samples.push(setMeshyQAPose(mode,i/60*Math.PI*2));for(const mode of ['pass','shot','header','volley'])for(let i=0;i<=12;i++)samples.push(setMeshyQAPose(mode,.9,-.1+i/12*1.1));return {count:samples.length,finite:samples.every(p=>p.finite),minGround:Math.min(...samples.filter(p=>['walk','run'].includes(p.mode)).map(p=>p.minY)),maxY:Math.max(...samples.map(p=>p.maxY))}});
  assert(cycles.finite);assert(cycles.minGround>.06&&cycles.maxY<4);
  for(const p of poses.filter(p=>['pass','shot','header','volley'].includes(p.mode)))assert(p.contactGap<.34,`${p.mode} ball surface contact gap ${p.contactGap}`);
  await setup(page,'3d');await page.waitForFunction(()=>window.meshyMatchReady);
  const play=await page.evaluate(async()=>{const states=new Set(),actions=new Set();match.kickoff=null;match.countdown=0;hideOverlay();for(let i=0;i<350;i++){step(.04*MATCH_SPEED,.04);v65AfterStep(v65Context());draw();const v=meshyMatchTrial.selected;if(v?.movementState)states.add(v.movementState);for(const p of d6Pitch3D.getState().frame.players)if(p.action)actions.add(p.action.kind);if(i%14===0)await new Promise(requestAnimationFrame)}running=false;hideOverlay();draw();return {states:[...states],actions:[...actions],elapsed:match.elapsed}});
  await page.locator('#match-area .v42-pitch-stage').screenshot({path:'outputs/meshy-match-tv.png'});
  await page.setViewportSize({width:844,height:390});await page.waitForFunction(()=>d6Pitch3D.getState().view==='3d');await page.locator('#match-area .v42-pitch-stage').screenshot({path:'outputs/meshy-match-mobile.png'});
  const lifecycle=await page.evaluate(()=>{const old=meshyMatchTrial.selected;v98Dispose();draw();const next=meshyMatchTrial.selected;return {oldDisposed:Boolean(old.meshy.disposed),replaced:old!==next,imported:[...v98Players.values()].filter(v=>v.meshy).length}});assert(lifecycle.oldDisposed&&lifecycle.replaced);assert.equal(lifecycle.imported,10);
  const actions=await page.evaluate(()=>{
   const results=[];const v=meshyMatchTrial.selected,p=match.people.find(p=>p.pid===v.label.dataset.v98Player),r=match.people.find(q=>q.t===p.t&&!q.keeper&&q!==p);
   for(const kind of ['pass','shot','header']){v103EndReplay();running=true;Object.assign(match,{kickoff:null,countdown:0,postBanner:null,flight:null,setPiece:null,throwIn:null,goalPause:0,goalScene:null,rebound:null,halftimePause:0});p.x=.5;p.y=.3;r.x=.55;r.y=.18;match.owner=p;match.ball={x:p.x,y:p.y};
    if(kind==='shot')v55Shoot(p);else v55GroundPass(p,r,kind);draw();v102Frames.at-=1000;v98Render();const action=v102PlayerAction(match,p);results.push({expected:kind,kind:action?.kind,imported:Boolean(v98Players.get(p.pid)?.meshy),elevation:v99BallView(match)?.elevation});
   }running=false;draw();return results;
  });for(const a of actions){assert.equal(a.kind,a.expected);assert(a.imported)}
  await page.setViewportSize({width:1440,height:950});await page.goto(url.replace('?qa=1',''));await page.waitForFunction(()=>window.meshyMatchReady&&window.meshyMatchTrial?.selected&&window.d6Pitch3D?.getState().view==='3d');
  const automatic=await page.evaluate(()=>{clearInterval(v65WorldFrame);running=false;hideOverlay();draw();return {players:v98Players.size,imported:[...v98Players.values()].filter(v=>v.meshy).length,storage:v61WorldKey,careerId:v61CurrentCareer.id}});assert.equal(automatic.imported,10);assert.equal(automatic.storage,'sechser.world.meshy-squad-v6');
  await page.locator('#match-area .v42-pitch-stage').screenshot({path:'outputs/meshy-match-start.png'});
  fs.writeFileSync('outputs/meshy-match-qa.json',JSON.stringify({initial,poses,cycles,play,actions,lifecycle,automatic,errors},null,2));console.log(JSON.stringify({initial,poses,cycles,play,actions,lifecycle,automatic,errors}));assert.deepEqual(errors,[]);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
