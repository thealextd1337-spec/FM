'use strict';
// Optional local match adapter. Animation never advances or changes the match.
window.D6UserMeshyPlayer={install(template,clips,clothMask,calibration=null){
 window.D6UserMeshyPlayer.nativeShot=clips.some(c=>c.name==='shot_meshy');
 window.D6UserMeshyPlayer.nativeBall=clips.some(c=>c.name==='keeper_dive_meshy');
 const T=THREE,baseCreate=D6PlayerModel.create,scale=1.45,floor=.08,players=new Set(),leases=new Map(),numbers=new Map();
 let source;template.traverse(o=>{if(o.isSkinnedMesh){if(source)throw Error('Expected one user skin');source=o}});
 if(!source||source.skeleton.bones.length!==28)throw Error('Unexpected user character rig');
 source.skeleton.pose();template.updateMatrixWorld(true);
 const semantic=n=>n.replace(/^mixamorig:?/i,'').replace(/[^a-z0-9]/gi,'');
 const rest=Object.fromEntries(source.skeleton.bones.map(b=>[semantic(b.name),{p:b.getWorldPosition(new T.Vector3()),q:b.getWorldQuaternion(new T.Quaternion()),s:b.getWorldScale(new T.Vector3())}]));
 const geometry=source.geometry.clone();geometry.setAttribute('d6Rest',geometry.attributes.position.clone());
 const shared=r=>{r.userData.d6Shared=true;return r};shared(geometry);shared(clothMask);
 const textures=[...new Set([source.material.map,source.material.normalMap,source.material.roughnessMap,source.material.metalnessMap,clothMask].filter(Boolean))];textures.forEach(shared);
 const acquire=r=>{leases.set(r,(leases.get(r)||0)+1);return r};
 const release=r=>{const n=leases.get(r)-1;if(n){leases.set(r,n)}else{leases.delete(r);r.dispose()}};
 const skins={fair:'#e9b996',light:'#d6a17c',warm:'#c28b60',medium:'#ad7550',brown:'#895638',deep:'#67442e'},hairs={black:'#242329','dark-brown':'#332922',brown:'#58402d','light-brown':'#876445',blond:'#bca177',auburn:'#a25e35',gray:'#96918a'};
 function numberMap(n){if(!numbers.has(n)){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');ctx.font='bold 94px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=6;ctx.strokeStyle='#152329';ctx.strokeText(String(n),64,68);ctx.fillStyle='#f7f7ee';ctx.fillText(String(n),64,68);const map=shared(new T.CanvasTexture(c));map.colorSpace=T.SRGBColorSpace;numbers.set(n,map)}return numbers.get(n)}
 const point=n=>rest[n].p.clone().multiplyScalar(scale).add(new T.Vector3(0,floor,0)),length=(a,b)=>rest[a].p.distanceTo(rest[b].p)*scale;
 // The glove follows the actual hand/thumb/finger surface and its existing skin
 // weights. The old oval covered only the palm and left naked fingertips.
 const gloveCoveredTriangles=new Set(),gloveGeometries=['Left','Right'].map(side=>{
  const joint=source.skeleton.bones.findIndex(b=>semantic(b.name)===side+'Hand'),tip=source.skeleton.bones.findIndex(b=>semantic(b.name)===side+'HandMiddle4'),matrix=new T.Matrix4().compose(rest[side+'Hand'].p,rest[side+'Hand'].q,rest[side+'Hand'].s),inverse=matrix.clone().invert(),normalToLocal=new T.Matrix3().getNormalMatrix(inverse),normalToWorld=new T.Matrix3().getNormalMatrix(matrix),src=source.geometry,positions=[],normals=[],colors=[],indices=[],weights=[],point=new T.Vector3(),local=[],influence=[],bounds=new T.Box3();
  for(let i=0;i<src.attributes.position.count;i++){local[i]=new T.Vector3().fromBufferAttribute(src.attributes.position,i).applyMatrix4(inverse);influence[i]=0;for(let k=0;k<4;k++)if([joint,tip].includes(src.attributes.skinIndex.array[i*4+k]))influence[i]+=src.attributes.skinWeight.array[i*4+k];if(influence[i]>.5)bounds.expandByPoint(local[i]);}
  const palm=new T.Color('#f4f0df'),back=new T.Color('#213b46'),pad=new T.Color('#45606b'),accent=new T.Color('#c7f36b'),length=bounds.max.y,normal=side==='Left'?-1:1;
  const push=(p,n,color,skinIndex,skinWeight)=>{point.copy(p).applyMatrix4(matrix);positions.push(...point.toArray());normals.push(...n.clone().applyNormalMatrix(normalToWorld).toArray());colors.push(color.r,color.g,color.b);indices.push(...skinIndex);weights.push(...skinWeight);};
  const topology=src.index?.array||Array.from({length:src.attributes.position.count},(_,i)=>i);
  for(let i=0;i<topology.length;i+=3){const tri=[topology[i],topology[i+1],topology[i+2]];if(!tri.every(v=>influence[v]>.15&&local[v].y>-.026))continue;
   gloveCoveredTriangles.add(i/3);
   for(const v of tri){const p=local[v].clone(),n=new T.Vector3().fromBufferAttribute(src.attributes.normal,v).applyNormalMatrix(normalToLocal),backSide=n.x*normal>.12,band=p.y/length,channel=Math.abs(Math.sin((p.z+.047)*150))<.27;p.addScaledVector(n,backSide?.008:.006);
    const color=backSide?(band<.32?back:band<.48?accent:channel?back:pad):palm;
    push(p,n,color,Array.from(src.attributes.skinIndex.array.slice(v*4,v*4+4)),Array.from(src.attributes.skinWeight.array.slice(v*4,v*4+4)));
   }
  }
  const shellVertices=positions.length/3;
  const part=(g,color)=>{const flat=g.index?g.toNonIndexed():g;for(let i=0;i<flat.attributes.position.count;i++)push(new T.Vector3().fromBufferAttribute(flat.attributes.position,i),new T.Vector3().fromBufferAttribute(flat.attributes.normal,i),color,[joint,0,0,0],[1,0,0,0]);flat.dispose();if(flat!==g)g.dispose();};
  const cuff=new T.CylinderGeometry(1,1,1,16,1);cuff.scale(.048,.052,.044);cuff.translate(0,-.005,0);part(cuff,back);
  const strap=new T.CylinderGeometry(1,1,1,16,1,true);strap.scale(.049,.016,.045);strap.translate(0,-.006,0);part(strap,accent);
  const closure=new T.BoxGeometry(.009,.025,.047,1,1,1);closure.translate(normal*.049,-.006,0);part(closure,back);
  const badge=new T.BoxGeometry(.003,.013,.027);badge.translate(normal*.055,-.006,0);part(badge,accent);
  const g=shared(new T.BufferGeometry());g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));g.computeBoundingSphere();g.userData.d6Glove={side,shellVertices,anatomical:true,palm:'latex',back:'padded',cuff:'strap',fingerWeights:true};return g;
 });
 // Do not render a second bare hand inside the glove: small animated folds can
 // otherwise expose skin through the padding. Both variants keep the same rig.
 const keeperGeometry=shared(geometry.clone()),keeperIndices=[],bodyTopology=geometry.index?.array||Array.from({length:geometry.attributes.position.count},(_,i)=>i);
 for(let i=0;i<bodyTopology.length;i+=3)if(!gloveCoveredTriangles.has(i/3))keeperIndices.push(bodyTopology[i],bodyTopology[i+1],bodyTopology[i+2]);keeperGeometry.setIndex(keeperIndices);
 const align=(a,b)=>new T.Quaternion().setFromUnitVectors(rest[b].p.clone().sub(rest[a].p).normalize(),new T.Vector3(0,-1,0));
 function attach(v,options){
  const obsolete=[],materials=new Set(),maps=new Set();v.body.traverse(o=>{if(o.isMesh){obsolete.push(o);materials.add(o.material);if(o.material.map)maps.add(o.material.map)}});for(const o of obsolete){o.parent.remove(o);o.geometry.dispose()}materials.forEach(m=>m.dispose());maps.forEach(m=>m.dispose());
  // Clone the node tree once per player; geometry and PBR images stay shared.
  const model=template.clone(true),nodeMap=new Map();function pair(a,b){nodeMap.set(a,b);a.children.forEach((c,i)=>pair(c,b.children[i]))}pair(template,model);
  const mesh=nodeMap.get(source),animatedBones=source.skeleton.bones.map(b=>nodeMap.get(b));
  const animatedSkeleton=new T.Skeleton(animatedBones,source.skeleton.boneInverses.map(m=>m.clone()));mesh.skeleton=animatedSkeleton;mesh.geometry=acquire(options.keeper?keeperGeometry:geometry);textures.forEach(acquire);
  const material=source.material.clone(),numberTexture=acquire(numberMap(options.number)),kit=options.kit||{},look=v.appearance;
  material.onBeforeCompile=shader=>{
   const styles=['plain','stripe','stripes','hoops','halves','pinstripes','diagonal'];
   Object.assign(shader.uniforms,{d6Cloth:{value:clothMask},d6Number:{value:numberTexture},d6Main:{value:new T.Color(kit.main||'#22579a')},d6Trim:{value:new T.Color(kit.trim||'#f2f3ed')},d6Accent:{value:new T.Color(kit.accent||kit.trim||'#f2f3ed')},d6Style:{value:Math.max(0,styles.indexOf(kit.style))},d6Skin:{value:new T.Color(skins[look.skinTone]||skins.warm)},d6Hair:{value:new T.Color(hairs[look.hairColor]||hairs.brown)}});
   shader.vertexShader='attribute vec3 d6Rest; varying vec3 restPoint;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nrestPoint=d6Rest;');
   shader.fragmentShader='uniform sampler2D d6Cloth; uniform sampler2D d6Number; uniform vec3 d6Main; uniform vec3 d6Trim; uniform vec3 d6Accent; uniform vec3 d6Skin; uniform vec3 d6Hair; uniform float d6Style; varying vec3 restPoint;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
    vec3 cloth=texture2D(d6Cloth,vMapUv).rgb;float pigment=max(max(diffuseColor.r,diffuseColor.g),diffuseColor.b);
    if(cloth.r>.5||cloth.b>.5){float stripe=0.0;float u=(restPoint.x+.22)/.44;float h=(restPoint.y-.94)/.38;
     if(cloth.r>.5){if(d6Style==1.0)stripe=step(.37,u)*step(u,.63);if(d6Style==2.0)stripe=step(.55,fract(u*4.0));if(d6Style==3.0)stripe=step(.72,fract(h*4.0));if(d6Style==4.0)stripe=step(u,.5);if(d6Style==5.0)stripe=step(.88,fract(u*5.0));if(d6Style==6.0)stripe=step(abs(u+h-1.0),.12);if(restPoint.y>1.35&&abs(restPoint.x)<.12)stripe=1.0;}
     else stripe=step(.42,restPoint.y)*step(restPoint.y,.46);
     diffuseColor.rgb=mix(d6Main,d6Trim,stripe)*(.78+.22*pigment);
     if(cloth.r>.5&&restPoint.y<.916)diffuseColor.rgb=d6Accent;
     if(cloth.r>.5&&restPoint.z<-.065&&restPoint.y>1.06&&restPoint.y<1.28&&abs(restPoint.x)<.095){vec4 n=texture2D(d6Number,vec2(.5-restPoint.x/.19,(restPoint.y-1.06)/.22));diffuseColor.rgb=mix(diffuseColor.rgb,n.rgb,n.a);}
    }
    bool skinPixel=diffuseColor.r>diffuseColor.g*1.12&&diffuseColor.g>diffuseColor.b*1.12&&pigment>.18;
    bool eyeArea=restPoint.y>1.47&&restPoint.y<1.57&&restPoint.z>.065;
    if(max(max(cloth.r,cloth.g),cloth.b)<.5&&skinPixel&&!eyeArea&&restPoint.y>.5)diffuseColor.rgb=d6Skin*(.65+.65*pigment);
    bool hairPixel=restPoint.y>1.62||(restPoint.y>1.49&&restPoint.z<-.025&&pigment<.24);
    if(hairPixel&&pigment<.35)diffuseColor.rgb=d6Hair*(.7+pigment*2.0);`);
  };
  material.customProgramCacheKey=()=> 'd6-user-meshy-v107';mesh.material=material;mesh.castShadow=true;mesh.frustumCulled=false;
  model.scale.setScalar(scale);model.position.y=floor;v.root.add(model);
  v.neck.position.copy(point('Neck'));const spec={},footLifts=[];
  for(const [side,i] of [['Left',0],['Right',1]]){
   const leg=v.limbs[i*2],arm=v.limbs[i*2+1],knee=v.knees[i],foot=v.feet[i],elbow=v.elbows[i];leg.position.copy(point(side+'UpLeg'));leg.position.z=0;knee.position.set(0,-length(side+'UpLeg',side+'Leg'),0);foot.position.set(0,-length(side+'Leg',side+'Foot'),0);arm.position.copy(point(side+'Arm'));elbow.position.set(0,-length(side+'Arm',side+'ForeArm'),0);
   footLifts[i]=rest[side+'Foot'].p.y*scale+floor-.11;
   for(const [name,group,a,b] of [[side+'UpLeg',leg,side+'UpLeg',side+'Leg'],[side+'Leg',knee,side+'Leg',side+'Foot'],[side+'Arm',arm,side+'Arm',side+'ForeArm'],[side+'ForeArm',elbow,side+'ForeArm',side+'Hand']])spec[name]={group,q:align(a,b),offset:new T.Vector3()};
   spec[side+'Foot']={group:foot,q:new T.Quaternion(),offset:new T.Vector3()};
   for(const name of [side+'ToeBase',side+'ToeEnd'])spec[name]={group:foot,q:new T.Quaternion(),offset:rest[name].p.clone().sub(rest[side+'Foot'].p).multiplyScalar(scale)};
   for(const name of [side+'Hand',side+'HandMiddle4'])spec[name]={group:elbow,q:align(side+'ForeArm',side+'Hand'),offset:new T.Vector3(0,-rest[name].p.distanceTo(rest[side+'ForeArm'].p)*scale,0)};
  }
  const drivers=source.skeleton.bones.map(b=>{const name=semantic(b.name),head=['Neck','Head','HeadTopEnd','headfront'].includes(name);let s=spec[name];if(!s)s={group:head?v.neck:v.body,q:new T.Quaternion(),offset:head?point(name).sub(point('Neck')):point(name)};const bone=new T.Bone();bone.position.copy(s.offset);bone.quaternion.copy(s.q).multiply(rest[name].q);bone.scale.copy(rest[name].s).multiplyScalar(scale);s.group.add(bone);return bone});
  // Output bones have explicit world transforms and are not in the scene tree.
  const outputBones=animatedBones.map(b=>{const bone=new T.Bone();bone.name=b.name;return bone}),skeleton=new T.Skeleton(outputBones,source.skeleton.boneInverses.map(m=>m.clone()));mesh.skeleton=skeleton;
  const gloves=[];if(options.keeper){for(const g of gloveGeometries){const glove=new T.SkinnedMesh(acquire(g),new T.MeshStandardMaterial({vertexColors:true,roughness:.82}));glove.name='Goalkeeper glove '+g.userData.d6Glove.side;glove.bind(skeleton,mesh.bindMatrix);glove.frustumCulled=false;glove.castShadow=true;mesh.parent.add(glove);gloves.push(glove)}}
  const mixer=new T.AnimationMixer(model),actions={};for(const c of clips){if(c.name==='walking'||c.name.startsWith('run_')||c.name==='sprint_forward'||c.name.startsWith('celebrate_')||calibration?.clips[c.name]){const action=mixer.clipAction(c);action.play();action.paused=true;action.setEffectiveWeight(0);actions[c.name]=action}}
  for(const name of ['walking','run_fast4','run_fast6','sprint_forward','celebrate_fist','celebrate_arms','celebrate_victory'])if(!actions[name])throw Error('Missing Meshy clip '+name);
  const state={phase:0,weights:{},procedural:1,lastGoal:null,motion:'idle',meshes:[mesh],skeleton,ankleLift:footLifts,headerReach:.24,kit:{...kit},look:{...look},disposed:false,keeper:Boolean(options.keeper)};v.meshy=state;players.add(v);
  const locomotion=calibration?D6UserLocomotion.create(v,mesh,skeleton,calibration):null;if(locomotion){state.ground=locomotion.state;state.procedural=0;for(const name of ['idle_meshy','brake_meshy','turn_run_left','turn_run_right','turn_sharp_right','turn_walk_left','turn_walk_right','turn_idle_left','turn_idle_right','back_walk','back_left','back_right','back_step_meshy'])if(!actions[name])throw Error('Missing Meshy transition '+name)}
  const p1=new T.Vector3(),p2=new T.Vector3(),q1=new T.Quaternion(),q2=new T.Quaternion(),s1=new T.Vector3(),s2=new T.Vector3();
  const ballActions=window.D6UserMeshyPlayer.nativeBall&&window.D6UserBallActions?.create({visual:v,state,mesh,skeleton,locomotion,actions});
  let lastKick=null,kickExit=0,lastLocomotion=null,lastMotion=null,lastProcedural=0,stopEntry=null,stopAge=1;
  const keeperHipIndex=source.skeleton.bones.findIndex(b=>semantic(b.name)==='Hips'),keeperUpper=source.skeleton.bones.map((b,i)=>/^(Left|Right)(UpLeg|Leg|Foot|Toe)/.test(semantic(b.name))?-1:i).filter(i=>i>=0);
  const headIndices=source.skeleton.bones.map((b,i)=>['Neck','Head','HeadTopEnd','headfront'].includes(semantic(b.name))?i:-1).filter(i=>i>=0),neckIndex=source.skeleton.bones.findIndex(b=>semantic(b.name)==='Neck'),headIndex=source.skeleton.bones.findIndex(b=>semantic(b.name)==='Head'),headForward=new T.Vector3(0,0,1).applyQuaternion(rest.Head.q.clone().invert());let keeperAim=null;state.gloves=gloves;state.handPoint=()=>new T.Vector3().setFromMatrixPosition(outputBones[source.skeleton.bones.findIndex(b=>semantic(b.name)==='RightHand')].matrixWorld);
  v.renderKeeperLook=({ball},dt,live)=>{if(!options.keeper||!ball)return;const neck=new T.Vector3().setFromMatrixPosition(outputBones[neckIndex].matrixWorld),headQ=new T.Quaternion();outputBones[headIndex].matrixWorld.decompose(p1,headQ,s1);const forward=headForward.clone().applyQuaternion(headQ).normalize(),wanted=(state.heldBallPoint?.clone()||new T.Vector3(ball.x,ball.height,ball.z)).sub(neck).normalize();if(!keeperAim)keeperAim=forward.clone();if(live&&dt>0)keeperAim.lerp(wanted,1-Math.exp(-dt*18)).normalize();const turn=new T.Quaternion().setFromUnitVectors(forward,keeperAim),radians=forward.angleTo(keeperAim);if(radians>1.45)turn.identity().slerp(new T.Quaternion().setFromUnitVectors(forward,keeperAim),1.45/radians);for(const i of headIndices){outputBones[i].matrixWorld.decompose(p1,q1,s1);p1.sub(neck).applyQuaternion(turn).add(neck);q1.premultiply(turn);outputBones[i].matrixWorld.compose(p1,q1,s1)}state.lookDirection=forward.applyQuaternion(turn).toArray();skeleton.update()};
  v.renderMotion=({person,frame,dt,live})=>{
   if(locomotion){
    const drive=locomotion.drive({person,frame,dt,live}),plan=ballActions?.plan(person,frame),kick=!ballActions&&actions.shot_meshy&&['shot','freeKick','kickReady'].includes(person.action?.kind);state.phase=drive.phase;state.weights={...drive.weights};state.motion=plan?plan.mode:kick?person.action.kind==='kickReady'?'shot_ready':'shot_meshy':drive.motion;state.lastGoal=frame.celebration?.id||null;
    for(const [name,action]of Object.entries(actions)){const weight=plan?(name===plan.clip?plan.weight:0)+(drive.weights[name]||0)*(1-plan.weight):kick?(name==='shot_meshy'?1:0):(drive.weights[name]||0);action.setEffectiveWeight(weight);state.weights[name]=weight;action.time=plan&&name===plan.clip?Math.max(0,Math.min(action.getClip().duration-1e-6,plan.time)):kick&&name==='shot_meshy'?Math.max(0,Math.min(action.getClip().duration-1e-6,person.action.kind==='kickReady'?.14+person.action.progress*.35:.49+Math.max(-.08,person.action.progress)*(action.getClip().duration-.49))):name.startsWith('celebrate_')?Math.max(0,Math.min(frame.celebration?.time||0,action.getClip().duration-1e-6)):drive.times[name]||0;}
    mixer.update(0);const poseRate=person.slideActive||(v.locomotion?.slide||0)>.02?10:22;state.procedural=plan&&!plan.receive&&!plan.ready||kick?0:person.action?.kind==='block'?1:live?state.procedural+((!plan&&drive.procedural===1?1:0)-state.procedural)*(1-Math.exp(-dt*poseRate)):state.procedural;
    v.root.updateMatrixWorld(true);for(let i=0;i<outputBones.length;i++){animatedBones[i].matrixWorld.decompose(p1,q1,s1);drivers[i].matrixWorld.decompose(p2,q2,s2);p1.lerp(p2,state.procedural);q1.slerp(q2,state.procedural);s1.lerp(s2,state.procedural);outputBones[i].matrixWorld.compose(p1,q1,s1)}
    if(!kick&&lastKick&&!person.action&&!person.slideActive&&!frame.celebration){if(live)kickExit=Math.max(0,kickExit-dt);const w=kickExit/.22;for(let i=0;i<outputBones.length;i++){outputBones[i].matrixWorld.decompose(p1,q1,s1);lastKick[i].decompose(p2,q2,s2);p1.lerp(p2,w);q1.slerp(q2,w);s1.lerp(s2,w);outputBones[i].matrixWorld.compose(p1,q1,s1)}if(!kickExit)lastKick=null}else if(!kick&&(person.action||person.slideActive||frame.celebration))lastKick=null;
    if(live&&(locomotion.state.stopping||drive.motion==='brake_meshy'&&lastMotion!=='brake_meshy'||lastProcedural===1&&drive.procedural===0)&&!plan){stopEntry=lastLocomotion;stopAge=0;locomotion.release();}
    if(live)stopAge+=dt;
    if(plan||drive.procedural||locomotion.state.teleport)stopEntry=null;
    if(stopEntry&&stopAge<.32){const q=Math.min(1,stopAge/.32),w=1-q*q*(3-2*q);for(let i=0;i<outputBones.length;i++){outputBones[i].matrixWorld.decompose(p1,q1,s1);v.root.matrixWorld.clone().multiply(stopEntry[i]).decompose(p2,q2,s2);p1.lerp(p2,w);q1.slerp(q2,w);s1.lerp(s2,w);outputBones[i].matrixWorld.compose(p1,q1,s1)}}else stopEntry=null;
    // Meshy's quiet goalkeeper upper body follows the game's planted sidesteps.
    // Anchor it to the rendered pelvis, never to the provider's travelling root.
    if(options.keeper&&!plan&&!person.action&&!person.slideActive&&!frame.celebration&&actions.keeper_ready_meshy&&(v.locomotion?.keeperReady||0)>.001){
     const w=v.locomotion.keeperReady,nativeHip=new T.Vector3().setFromMatrixPosition(animatedBones[keeperHipIndex].matrixWorld),renderedHip=new T.Vector3().setFromMatrixPosition(outputBones[keeperHipIndex].matrixWorld);
     for(const i of keeperUpper){outputBones[i].matrixWorld.decompose(p1,q1,s1);animatedBones[i].matrixWorld.decompose(p2,q2,s2);p2.sub(nativeHip).add(renderedHip);p1.lerp(p2,w);q1.slerp(q2,w);outputBones[i].matrixWorld.compose(p1,q1,s1);}
    }
    skeleton.update();locomotion.apply({person,frame,dt,live});if(ballActions)ballActions.apply({person,frame,dt,live,plan,drive,entryPose:lastLocomotion});if(kick){locomotion.shotContact(person,person.action.kind==='kickReady'?1:person.action.progress);lastKick=outputBones.map(b=>b.matrixWorld.clone());kickExit=.22}lastMotion=drive.motion;lastProcedural=drive.procedural;const inverse=v.root.matrixWorld.clone().invert();lastLocomotion=outputBones.map(b=>inverse.clone().multiply(b.matrixWorld));return;
   }
   const m=v.locomotion||{idle:1,walk:0,run:0},speed=v.runSpeed||0,goal=frame.celebration,celebrating=goal&&goal.team===v.team,delta=live?dt:0;
   const fast=Math.max(0,Math.min(1,(speed-3.2)/1.6)),sprint=Math.max(0,Math.min(1,(speed-5.5)/1.3));
   const target={walking:m.walk,run_fast6:m.run*(1-fast),run_fast4:m.run*fast*(1-sprint),sprint_forward:m.run*fast*sprint};
   const goalClip=['celebrate_fist','celebrate_arms','celebrate_victory'][v.number%3];
   if(celebrating){for(const name of Object.keys(target))target[name]=0;target[goalClip]=1;state.motion=goalClip;state.lastGoal=goal.id;}else state.motion=m.idle>.8?'idle':m.walk>m.run?'walking':sprint>.5?'sprint_forward':fast>.5?'run_fast4':'run_fast6';
   const stride=1.9*(m.walk||0)+(2.57*(1-fast)+4.13*fast*(1-sprint)+3.56*fast*sprint)*(m.run||0);if(delta&&speed>.08)state.phase+=delta*speed/Math.max(1.4,stride);
   for(const [name,action] of Object.entries(actions)){const wanted=target[name]||0,current=state.weights[name]||0;state.weights[name]=delta?current+(wanted-current)*(1-Math.exp(-delta*15)):current;if(!live&&state.lastGoal===null&&wanted)state.weights[name]=wanted;action.setEffectiveWeight(state.weights[name]);action.time=name.startsWith('celebrate_')?Math.max(0,Math.min(goal?.time||0,action.getClip().duration-1e-6)):(state.phase%1)*action.getClip().duration;}
   mixer.update(0);
   const wantedProc=celebrating?0:person.action||person.slideActive?1:m.idle,previousProc=state.procedural;
   state.procedural=!celebrating&&person.action?1:delta?previousProc+(wantedProc-previousProc)*(1-Math.exp(-delta*20)):previousProc;
   v.root.updateMatrixWorld(true);
   for(let i=0;i<outputBones.length;i++){animatedBones[i].matrixWorld.decompose(p1,q1,s1);drivers[i].matrixWorld.decompose(p2,q2,s2);p1.lerp(p2,state.procedural);q1.slerp(q2,state.procedural);s1.lerp(s2,state.procedural);outputBones[i].matrixWorld.compose(p1,q1,s1);}
   skeleton.update();
  };
  v.root.userData.d6Release=()=>{if(state.disposed)return;state.disposed=true;players.delete(v);locomotion?.release();mixer.stopAllAction();mixer.uncacheRoot(model);animatedSkeleton.dispose();release(mesh.geometry);for(const glove of gloves)release(glove.geometry);textures.forEach(release);release(numberTexture);v.renderMotion=null;v.renderKeeperLook=null;};
  return v;
 }
 D6PlayerModel.create=options=>{const v=baseCreate(options);return options.number>0?attach(v,options):v};
 return {get players(){return [...players]},get resources(){return {leases:leases.size,geometry:geometry.uuid,numberMaps:numbers.size}},attach};
}};
