// Squad identity, shared-resource lifetime and visible locomotion in the real scene.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{pathToFileURL}=require('url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950}}),errors=[],remote=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url())});
  await page.goto(pathToFileURL(path.resolve('outputs/meshy-match-preview.html')).href);await page.waitForFunction(()=>window.meshyMatchReady);assert.equal(await page.evaluate(()=>window.meshyMatchError||null),null);
  const squad=await page.evaluate(()=>{
   clearInterval(v65WorldFrame);running=false;hideOverlay();draw();const models=meshyMatchTrial.players,raw=JSON.stringify(match),geometries=new Set(),maps=new Set(),skeletons=new Set();
   let matching=true;for(const v of models){const p=v61CurrentCareer.world.clubs.flatMap(c=>c.roster).find(p=>p.pid===v.label.dataset.v98Player);matching&&=Boolean(p?.appearance)&&['skinTone','hairColor','hairstyle'].every(k=>p.appearance[k]===v.meshy.look[k]);for(const m of v.meshy.meshes){geometries.add(m.geometry);maps.add(m.material.map);skeletons.add(m.skeleton)}}
   return {count:models.length,teams:[0,1].map(t=>models.filter(v=>v.team===t).length),matching,geometries:geometries.size,maps:maps.size,skeletons:skeletons.size,resources:meshyMatchTrial.resources,unchanged:raw===JSON.stringify(match)};
  });assert.equal(squad.count,10);assert.deepEqual(squad.teams,[5,5]);assert(squad.matching&&squad.unchanged);assert.equal(squad.geometries,2);assert.equal(squad.maps,2);assert.equal(squad.skeletons,10);
  await page.locator('#v98-canvas').screenshot({path:'outputs/meshy-squad-tv.png'});
  const gallery=await page.evaluate(()=>{
   const raw=JSON.stringify(match);for(const v of v98Players.values()){v.root.visible=false;v.label.hidden=true}v98Scene.ballRoot.visible=false;v98Scene.ownerRing.visible=false;
   const styles=['buzz','side_part','medium_waves','round_afro','cornrows','textured_crop','tight_curls','short_locs','long_tied','bald'],skin=['fair','light','warm','medium','brown','deep'],hair=['black','dark-brown','brown','light-brown','blond','auburn','gray'],kits=['plain','stripe','stripes','hoops','halves','pinstripes','diagonal'];
   const temporary=styles.map((hairstyle,i)=>{const appearance={skinTone:skin[i%6],hairColor:hair[i%7],hairstyle};const copy=JSON.stringify(appearance),v=v98Scene.player(i%2,i+2,(i%5-2)*1.65,Math.floor(i/5)*2.6,false,{main:i%2?'#2247ac':'#ba3037',trim:'#f1e7ce',accent:'#e5b23c',style:kits[i%7]},appearance);v.heading=0;v.root.rotation.y=0;v102RunPose(v,{x:v.base.x,z:v.base.z,number:v.number},0,false);return {v,hairstyle,immutable:copy===JSON.stringify(appearance)}});
   window.squadGallery=temporary;const c=v98Scene.camera;c.position.set(0,5.4,13);c.fov=40;c.lookAt(0,1.4,1.3);c.updateProjectionMatrix();v98Scene.renderer.render(v98Scene.scene,c);
   return {styles:temporary.map(p=>p.hairstyle),immutable:temporary.every(p=>p.immutable)&&raw===JSON.stringify(match),geometryCount:v98Scene.renderer.info.memory.geometries};
  });assert(gallery.immutable);await page.locator('#v98-canvas').screenshot({path:'outputs/meshy-squad-identities.png'});
  await page.evaluate(()=>{for(const {v} of squadGallery)v.root.rotation.y=Math.PI;v98Scene.renderer.render(v98Scene.scene,v98Scene.camera)});await page.locator('#v98-canvas').screenshot({path:'outputs/meshy-squad-numbers.png'});
  const lifetime=await page.evaluate(()=>{
   for(const {v} of squadGallery)v98Scene.removePlayer(v);const survivor=meshyMatchTrial.selected,oldGeo=survivor.meshy.meshes[0].geometry;let disposed=0;const count=()=>disposed++;oldGeo.addEventListener('dispose',count);
   const extra=v98Scene.player(0,23,0,0,false,{main:'#345634'},{hairstyle:'buzz'});v98Scene.removePlayer(extra);const partial=disposed;const before=meshyMatchTrial.players.length;v98Dispose();const after=meshyMatchTrial.players.length,leases=meshyMatchTrial.resources.leases;oldGeo.removeEventListener('dispose',count);draw();return {partial,full:disposed,before,after,leases,recreated:meshyMatchTrial.players.length};
  });assert.equal(lifetime.partial,0);assert.equal(lifetime.full,1);assert.equal(lifetime.before,10);assert.equal(lifetime.after,0);assert.equal(lifetime.leases,0);assert.equal(lifetime.recreated,10);
  const motion=await page.evaluate(async()=>{
   running=false;hideOverlay();draw();v102StopPaint();const raw=JSON.stringify(match),v=meshyMatchTrial.selected;for(const p of v98Players.values()){p.root.visible=p===v;p.label.hidden=true}v98Scene.ballRoot.visible=false;v98Scene.ownerRing.visible=false;
   const c=v98Scene.camera;c.position.set(3.3,2.4,5.8);c.fov=32;c.lookAt(0,1.3,0);c.updateProjectionMatrix();v.heading=0;v.runPhase=0;v.runSpeed=0;v.locomotion=null;let phase=0,maxCadence=0;const states=new Set();const person={x:0,z:0,number:v.number};
   for(const speed of [0,.8,3,8,0])for(let i=0;i<60;i++){person.z+=speed/60;v.previous={x:0,z:person.z-speed/60};v102RunPose(v,person,1/60,true);v.root.position.set(0,0,0);v.root.rotation.y=v.heading;maxCadence=Math.max(maxCadence,(v.runPhase-phase)*60);phase=v.runPhase;states.add(v.movementState);v98Scene.renderer.render(v98Scene.scene,c);if(i%10===0)await new Promise(requestAnimationFrame)}
   return {states:[...states],maxCadence,root:v.root.position.toArray(),unchanged:raw===JSON.stringify(match)};
  });assert(motion.unchanged);assert(motion.maxCadence<=14.00001);assert.deepEqual(motion.states,['idle','walk','run']);
  // Real buffered renderer: all players, natural actions, no forced poses.
  const natural=await page.evaluate(async()=>{hideOverlay();running=true;match.kickoff=null;match.countdown=0;for(const p of v98Players.values()){p.root.visible=true;p.label.hidden=false}let count=0;const states=new Set(),actions=new Set();for(let i=0;i<220;i++){step(.04*MATCH_SPEED,.04);v65AfterStep(v65Context());draw();for(const v of meshyMatchTrial.players)states.add(v.movementState);for(const p of d6Pitch3D.getState().frame.players)if(p.action)actions.add(p.action.kind);count++;await new Promise(r=>setTimeout(r,16))}running=false;hideOverlay();draw();return {steps:count,states:[...states],actions:[...actions],models:meshyMatchTrial.players.length,render:v98Scene.renderer.info.render,memory:v98Scene.renderer.info.memory}});
  await page.locator('#v98-canvas').screenshot({path:'outputs/meshy-squad-play.png'});await page.setViewportSize({width:844,height:390});await page.waitForFunction(()=>d6Pitch3D.getState().view==='3d');await page.locator('#v98-canvas').screenshot({path:'outputs/meshy-squad-mobile.png'});
  await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>d6Pitch3D.getState().view==='2d');assert.equal(await page.evaluate(()=>v102Loop),0);
  const result={squad,gallery,lifetime,motion,natural,remoteRequests:remote.length,errors};fs.writeFileSync('outputs/meshy-squad-qa.json',JSON.stringify(result,null,2));assert.deepEqual(errors,[]);assert.equal(remote.length,0);console.log(JSON.stringify(result));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
