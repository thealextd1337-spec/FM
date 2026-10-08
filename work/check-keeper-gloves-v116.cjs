const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const inspect=process.argv.includes('--inspect');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const page=await browser.newPage({viewport:{width:1280,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve('outputs/spieler-nutzer-match.html')).href);await page.waitForFunction(()=>window.userMeshyMatchReady,null,{timeout:60000});
 const report=await page.evaluate(()=>{
  clearInterval(v65WorldFrame);running=false;hideOverlay();draw();v102StopPaint();const T=THREE,world=v98Scene;
  for(const v of v98Players.values()){v.root.visible=false;v.label.hidden=true;}world.ownerRing.visible=false;world.ballRoot.visible=false;
  const v=world.player(0,41,0,0,true,{main:'#eabb29',trim:'#172b29',style:'plain'},{skinTone:'warm',hairColor:'brown'}),p={id:'glove-keeper',number:41,team:0,keeper:true,x:0,z:0,action:null},f={turned:false,celebration:null,ball:{x:0,z:.65,height:.29},owner:null,ballInFlight:false};
  v.heading=0;v.previous={x:0,z:0};for(let i=0;i<100;i++){v102RunPose(v,p,1/60,true,f.ball);v.root.rotation.y=0;v.renderMotion({person:p,frame:f,dt:1/60,live:true});}
  window.gloveActor=v;window.glovePerson=p;window.gloveFrame=f;
  const mesh=v.meshy.meshes[0],skin=mesh.geometry.attributes.skinIndex,weight=mesh.geometry.attributes.skinWeight,pos=mesh.geometry.attributes.position;
  return {gloves:v.meshy.gloves.map(g=>({vertices:g.geometry.attributes.position.count,triangles:(g.geometry.index?.count||g.geometry.attributes.position.count)/3,detail:g.geometry.userData.d6Glove||null})),hands:['Left','Right'].map(side=>{
   const id=v.meshy.skeleton.bones.findIndex(b=>b.name.endsWith(side+'Hand')),tip=v.meshy.skeleton.bones.findIndex(b=>b.name.endsWith(side+'HandMiddle4')),rest=v.meshy.skeleton.boneInverses[id].clone().invert(),hand=new T.Vector3().setFromMatrixPosition(rest),finger=new T.Vector3().setFromMatrixPosition(v.meshy.skeleton.boneInverses[tip].clone().invert()),inverse=rest.clone().invert(),box=new T.Box3(),local=new T.Box3();let count=0;
   for(let i=0;i<pos.count;i++){let influence=0;for(let j=0;j<4;j++)if([id,tip].includes(skin.array[i*4+j]))influence+=weight.array[i*4+j];if(influence>.5){const pt=new T.Vector3().fromBufferAttribute(pos,i);box.expandByPoint(pt);local.expandByPoint(pt.clone().applyMatrix4(inverse));count++;}}
   return {side,hand:hand.toArray(),tip:finger.toArray(),tipLocal:finger.clone().applyMatrix4(inverse).toArray(),box:{min:box.min.toArray(),max:box.max.toArray()},local:{min:local.min.toArray(),max:local.max.toArray()},count};
  })};
 });
 console.log(JSON.stringify(report));
 if(inspect)return;
 const cases=[];
 for(const spec of [{name:'standing',kind:null,height:.29,lateral:0},{name:'holding',kind:'goalKick',height:.6,lateral:0},{name:'catch-high',kind:'save',height:2.7,lateral:0},{name:'dive-left',kind:'save',height:.65,lateral:-1.1},{name:'dive-right',kind:'save',height:.65,lateral:1.1},{name:'parry',kind:'save',height:.8,lateral:1.1,parry:true}]){
  const row=await page.evaluate(spec=>{
   const T=THREE,world=v98Scene;world.removePlayer(gloveActor);const v=world.player(0,41,0,0,true,{main:'#eabb29',trim:'#172b29',style:'plain'},{skinTone:'warm',hairColor:'brown'});window.gloveActor=v;
   const p={id:'glove-keeper',number:41,team:0,keeper:true,x:0,z:0,action:null},frame={turned:false,ball:{x:spec.lateral,z:.65,height:spec.height},owner:spec.kind==='goalKick'?'glove-keeper':null,ballInFlight:false};v.heading=0;v.previous={x:0,z:0};const original=JSON.stringify(match);
   for(let i=0;i<75;i++){const progress=Math.min(1,i/45);p.action=spec.kind?spec.kind==='goalKick'?{kind:'goalKick',held:true,phase:'waiting',progress:0,target:{x:.5,y:.5}}:{kind:'save',progress,recovery:0,height:spec.height,parry:!!spec.parry,saved:false,target:{x:.5+.65*(v55Field.right-v55Field.left)/44,y:.5-spec.lateral*(v55Field.bottom-v55Field.top)/68}}:null;v102RunPose(v,p,1/60,true,frame.ball);v.root.rotation.y=0;v.root.position.set(0,0,0);v.renderMotion({person:p,frame,dt:1/60,live:true});}
   v.root.updateMatrixWorld(true);const point=new T.Vector3(),ball=v.meshy.heldBallPoint||new T.Vector3(frame.ball.x,frame.ball.height,frame.ball.z),boxes=[],contacts=[],finite=[];
   for(const glove of v.meshy.gloves){let gap=Infinity;const box=new T.Box3();for(let i=0;i<glove.geometry.attributes.position.count;i++){glove.getVertexPosition(i,point).applyMatrix4(glove.matrixWorld);box.expandByPoint(point);finite.push(...point.toArray().map(Number.isFinite));gap=Math.min(gap,point.distanceTo(ball));}contacts.push(gap);boxes.push({min:box.min.toArray(),max:box.max.toArray()});}
   const frozen=v.meshy.skeleton.bones.map(b=>b.matrixWorld.toArray());v.renderMotion({person:p,frame,dt:1/60,live:false});const pause=frozen.every((m,i)=>m.every((x,k)=>Math.abs(x-v.meshy.skeleton.bones[i].matrixWorld.elements[k])<1e-7));
   world.ballRoot.visible=!!spec.kind;world.ballRoot.position.copy(ball);world.ball.material.opacity=1;world.ballShadow.visible=false;
   world.camera.position.set(3.3,2.2,5.8);world.camera.fov=35;world.camera.lookAt(0,1.5,0);world.camera.updateProjectionMatrix();world.renderer.render(world.scene,world.camera);
   window.gloveClose=()=>{const box=new T.Box3(new T.Vector3().fromArray(boxes[1].min),new T.Vector3().fromArray(boxes[1].max)),center=box.getCenter(new T.Vector3());world.camera.position.copy(center).add(new T.Vector3(.7,.25,1));world.camera.fov=28;world.camera.lookAt(center);world.camera.updateProjectionMatrix();world.renderer.render(world.scene,world.camera);};
   return {name:spec.name,contacts,boxes,finite:finite.every(Boolean),pause,unchanged:JSON.stringify(match)===original,handContact:v.meshy.handContact,glovesShareSkeleton:v.meshy.gloves.every(g=>g.skeleton===v.meshy.skeleton),motion:v.meshy.motion};
  },spec);
  cases.push(row);assert(row.finite&&row.pause&&row.unchanged&&row.glovesShareSkeleton,JSON.stringify(row));
  if(spec.kind==='save'&&!spec.parry)assert(row.contacts.every(x=>x<.1864),JSON.stringify(row));
  await page.locator('#v98-canvas').screenshot({path:`outputs/keeper-gloves-${spec.name}-v116.png`});
  if(spec.name==='standing'){await page.evaluate(()=>gloveClose());await page.locator('#v98-canvas').screenshot({path:'outputs/keeper-gloves-detail-v116.png'});}
 }
 assert(report.gloves.every(g=>g.detail?.anatomical&&g.detail.fingerWeights&&g.detail.cuff==='strap'));
 const isolation=await page.evaluate(()=>{const world=v98Scene,keepers=userMeshyMatch.players.filter(v=>v.keeper),field=world.player(0,42,0,0,false,{main:'#c83549',trim:'#fff',style:'stripe'},{skinTone:'warm',hairColor:'brown'}),same=keepers.every(k=>k.meshy.gloves.every((g,i)=>g.geometry===gloveActor.meshy.gloves[i].geometry));const noFieldGloves=field.meshy.gloves.length===0,leases=userMeshyMatch.resources.leases,removedTriangles=(field.meshy.meshes[0].geometry.index.count-gloveActor.meshy.meshes[0].geometry.index.count)/3,expectedRemoved=gloveActor.meshy.gloves.reduce((n,g)=>n+g.geometry.userData.d6Glove.shellVertices/3,0),keeperSkinShared=keepers.every(k=>k.meshy.meshes[0].geometry===gloveActor.meshy.meshes[0].geometry);world.removePlayer(field);return{keepers:keepers.filter(k=>k!==gloveActor).length,noFieldGloves,sharedGeometries:same,keeperSkinShared,removedTriangles,expectedRemoved,releasedFieldLease:leases===userMeshyMatch.resources.leases+1};});
 assert(isolation.noFieldGloves&&isolation.sharedGeometries&&isolation.keeperSkinShared&&isolation.releasedFieldLease);assert.equal(isolation.keepers,2);assert.equal(isolation.removedTriangles,isolation.expectedRemoved);
 assert.deepEqual(errors,[]);fs.writeFileSync('docs/spieler-nutzer-rig/gloves-qa-v116.json',JSON.stringify({...report,cases,isolation,errors},null,2));
 console.log(JSON.stringify({cases,isolation,errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
