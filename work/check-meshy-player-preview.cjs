const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url'),assert=require('assert');
const preview=process.argv[2]||'outputs/meshy-player-b-preview.html',prefix=process.argv[3]||'outputs/meshy-b';
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const page=await browser.newPage({viewport:{width:1050,height:920}}),errors=[],remote=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errors.push(m.text());});page.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url());});
 await page.goto(pathToFileURL(path.resolve(preview)).href);await page.waitForFunction(()=>window.meshyPreview?.ready||window.meshyPreview?.error);
 const qa=await page.evaluate(()=>{
  const p=window.meshyPreview;if(!p.ready)throw Error(p.error);const meshes=[];p.model.traverse(o=>{if(o.isSkinnedMesh)meshes.push(o);});const vec=p.camera.position.clone();const result={meshes:meshes.length,bones:meshes[0].skeleton.bones.map(b=>b.name),clips:{},samples:0,finite:true,weightMaxError:0};
  for(const mesh of meshes){const weights=mesh.geometry.attributes.skinWeight;for(let i=0;i<weights.count;i++){const sum=weights.getX(i)+weights.getY(i)+weights.getZ(i)+weights.getW(i);result.weightMaxError=Math.max(result.weightMaxError,Math.abs(1-sum));}}
  for(const [name,clip] of Object.entries(p.clips)){let minY=Infinity,maxY=-Infinity,maxXZ=0;for(let frame=0;frame<=32;frame++){p.seek(name,clip.duration*frame/32);for(const mesh of meshes){mesh.skeleton.update();for(let i=0;i<mesh.geometry.attributes.position.count;i++){mesh.getVertexPosition(i,vec);vec.applyMatrix4(mesh.matrixWorld);result.finite&&=[vec.x,vec.y,vec.z].every(Number.isFinite);minY=Math.min(minY,vec.y);maxY=Math.max(maxY,vec.y);maxXZ=Math.max(maxXZ,Math.hypot(vec.x,vec.z));}}result.samples++;}result.clips[name]={duration:clip.duration,minY,maxY,maxXZ,positionTracks:clip.tracks.filter(t=>t.name.endsWith('.position')).map(t=>t.name)};}
  p.seek('rigged',0);
  const bonePosition=name=>meshes[0].skeleton.bones.find(b=>b.name===name).getWorldPosition(vec.clone());
  const a=bonePosition('LeftArm'),b=bonePosition('LeftForeArm'),c=bonePosition('LeftHand');
  const axis=c.clone().sub(b),axisLength=axis.length();axis.normalize();const radii=[];
  const mesh=meshes[0],idx=mesh.skeleton.bones.findIndex(b=>b.name==='LeftForeArm'),skinI=mesh.geometry.attributes.skinIndex,skinW=mesh.geometry.attributes.skinWeight;
  mesh.skeleton.update();for(let i=0;i<skinI.count;i++){let weight=0;for(let k=0;k<4;k++)if(skinI.getComponent(i,k)===idx)weight+=skinW.getComponent(i,k);if(weight<.5)continue;mesh.getVertexPosition(i,vec);vec.applyMatrix4(mesh.matrixWorld);const delta=vec.clone().sub(b),along=delta.dot(axis);if(along/axisLength>.35&&along/axisLength<.65)radii.push(delta.sub(axis.clone().multiplyScalar(along)).length());}
  radii.sort((x,y)=>x-y);result.proportions={shoulderJointSpan:a.distanceTo(bonePosition('RightArm')),upperArmLength:a.distanceTo(b),forearmLength:b.distanceTo(c),forearmMidDiameterP90:2*radii[Math.floor((radii.length-1)*.9)],forearmSamples:radii.length};
  const headIdx=mesh.skeleton.bones.findIndex(b=>b.name==='Head'),lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];let headVertices=0;
  for(let i=0;i<skinI.count;i++){let weight=0;for(let k=0;k<4;k++)if(skinI.getComponent(i,k)===headIdx)weight+=skinW.getComponent(i,k);if(weight<.5)continue;mesh.getVertexPosition(i,vec);vec.applyMatrix4(mesh.matrixWorld);[vec.x,vec.y,vec.z].forEach((v,k)=>{lo[k]=Math.min(lo[k],v);hi[k]=Math.max(hi[k],v)});headVertices++;}
  result.proportions.neckJointSpan=bonePosition('Head').distanceTo(bonePosition('neck'));
  result.proportions.headWeightedBounds={width:hi[0]-lo[0],height:hi[1]-lo[1],depth:hi[2]-lo[2],vertices:headVertices};
  return result;
 });assert.equal(qa.meshes,Number(process.argv[4]||1));assert.equal(qa.bones.length,24);assert(qa.finite);assert(qa.weightMaxError<1e-4);assert.equal(remote.length,0);assert.deepEqual(errors,[]);
 for(const [name,time] of [['rigged',0],['walking',.35],['running',.25]]){await page.evaluate(({name,time})=>window.meshyPreview.seek(name,time),{name,time});await page.screenshot({path:prefix+'-'+name+'.png'});}
 await page.evaluate(()=>{window.meshyPreview.angle('back');window.meshyPreview.seek('running',.35)});await page.screenshot({path:prefix+'-running-back.png'});
 await page.evaluate(()=>{window.meshyPreview.angle('side');window.meshyPreview.seek('rigged',0)});await page.screenshot({path:prefix+'-side.png'});
 if(Number(process.argv[4]||1)>1){await page.getByLabel('Blickwinkel').selectOption('boots');await page.evaluate(()=>window.meshyPreview.seek('rigged',0));await page.screenshot({path:prefix+'-boots.png'});await page.evaluate(()=>window.meshyPreview.seek('running',.35));await page.screenshot({path:prefix+'-boots-running.png'});}
 await page.getByRole('button',{name:'Gehen',exact:true}).click();await page.waitForFunction(()=>window.meshyPreview.mode==='walking');await page.getByRole('button',{name:'Laufen',exact:true}).click();await page.waitForFunction(()=>window.meshyPreview.mode==='running');await page.getByLabel('Blickwinkel').selectOption('side');await page.getByRole('button',{name:'Weiter',exact:true}).click();await page.getByRole('button',{name:'Pause',exact:true}).click();await page.getByRole('button',{name:'Weiter',exact:true}).click();
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:prefix+'-mobile.png'});
 fs.writeFileSync(prefix+'-browser-qa.json',JSON.stringify({...qa,remoteRequests:remote.length,errors},null,2));console.log(JSON.stringify({...qa,bones:qa.bones.length,clips:Object.fromEntries(Object.entries(qa.clips).map(([k,v])=>[k,{duration:v.duration,minY:v.minY,maxY:v.maxY,maxXZ:v.maxXZ}]))},null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});


