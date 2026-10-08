const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const data=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64'),vendor='dist/camera-prototype/vendor/';
const loader=data(fs.readFileSync(vendor+'GLTFLoader.js','utf8').replace('./BufferGeometryUtils.js',data(fs.readFileSync(vendor+'BufferGeometryUtils.js','utf8'))));
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve('outputs/spieler-nutzer-match.html')).href);await page.waitForFunction(()=>window.userMeshyMatchReady,null,{timeout:60000});
 const report=await page.evaluate(async({loader,bytes})=>{
  clearInterval(v65WorldFrame);v102StopPaint();running=false;hideOverlay();draw();v102StopPaint();for(const v of v98Players.values()){v.root.visible=false;v.label.hidden=true}v98Scene.ballRoot.visible=false;v98Scene.ownerRing.visible=false;
  const {GLTFLoader}=await import(loader),gltf=await new GLTFLoader().parseAsync(Uint8Array.from(atob(bytes),c=>c.charCodeAt(0)).buffer,''),T=THREE,model=gltf.scene;
  v98Scene.scene.add(model);model.updateMatrixWorld(true);let skeleton,mesh;model.traverse(o=>{if(o.isSkinnedMesh&&!skeleton){skeleton=o.skeleton;mesh=o;}if(o.isMesh)o.material=new T.MeshStandardMaterial({color:0x77ba77,roughness:.85});});
  const bind=skeleton.bones.map((b,i)=>{const m=skeleton.boneInverses[i].clone().invert(),p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();m.decompose(p,q,s);return {name:b.name,parent:b.parent?.name,p:p.toArray(),q:q.toArray()};});
  const mixer=new T.AnimationMixer(model),clip=gltf.animations[0],action=mixer.clipAction(clip);action.play();const frames=[];
  for(let i=0;i<=119;i++){mixer.setTime(i/30);model.updateMatrixWorld(true);frames.push({time:i/30,bones:skeleton.bones.map(b=>{const p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();b.matrixWorld.decompose(p,q,s);return {name:b.name,p:p.toArray(),q:q.toArray()};})});}
  const images=[];model.scale.multiplyScalar(1.7);
  for(const time of [0,.5,1.5,2.5,3.5]){mixer.setTime(time);model.updateMatrixWorld(true);for(const view of ['front','side']){v98Scene.camera.position.set(view==='front'?0:5,1.8,view==='front'?5:0);v98Scene.camera.fov=40;v98Scene.camera.lookAt(0,1.5,0);v98Scene.camera.updateProjectionMatrix();v98Scene.renderer.render(v98Scene.scene,v98Scene.camera);images.push({time,view,data:v98Scene.renderer.domElement.toDataURL()});}}
  return {bind,frames,duration:clip.duration,images};
 },{loader,bytes:fs.readFileSync('meshy_output/keeper-reference-provider-v130.glb').toString('base64')});
 for(const image of report.images)fs.writeFileSync('outputs/keeper-provider-'+image.view+'-'+image.time+'-v130.png',Buffer.from(image.data.split(',')[1],'base64'));delete report.images;
 fs.writeFileSync('meshy_output/keeper-reference-samples-v130.json',JSON.stringify(report));console.log({frames:report.frames.length,bones:report.bind.length,duration:report.duration,errors});
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
