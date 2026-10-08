'use strict';
// Local squad preview: the match's existing joints drive each imported skin.
window.D6MeshyPlayer={install(template){
 const T=THREE,baseCreate=D6PlayerModel.create,scale=1.22,floor=.08,flip=new T.Quaternion();
 template.updateMatrixWorld(true);
 const sourceMeshes=[],rest={};template.traverse(o=>{if(o.isSkinnedMesh)sourceMeshes.push(o);if(o.isBone)rest[o.name]={position:o.getWorldPosition(new T.Vector3()),quaternion:o.getWorldQuaternion(new T.Quaternion()),scale:o.getWorldScale(new T.Vector3())}});
 if(sourceMeshes.length!==2||Object.keys(rest).length!==24)throw Error('Unexpected Meshy trial rig');
 let selected=null;const players=new Set(),leases=new Map(),hairCache=new Map(),numberCache=new Map();
 const skins={fair:'#e9b996',light:'#d6a17c',warm:'#c28b60',medium:'#ad7550',brown:'#895638',deep:'#67442e'},hairs={black:'#242329','dark-brown':'#332922',brown:'#58402d','light-brown':'#876445',blond:'#bca177',auburn:'#a25e35',gray:'#96918a'};
 const shared=resource=>{resource.userData.d6Shared=true;return resource};
 const acquire=resource=>{leases.set(resource,(leases.get(resource)||0)+1);return resource};
 const release=resource=>{const count=(leases.get(resource)||0)-1;if(count<=0){leases.delete(resource);resource.dispose()}else leases.set(resource,count)};
 const prepared=sourceMeshes.map(original=>{
  original.skeleton.update();const geometry=shared(original.geometry.clone()),positions=geometry.attributes.position,local=new Float32Array(positions.count*3),scalp=new Float32Array(positions.count);
  const image=original.material.map?.image,canvas=document.createElement('canvas');let pixels=null;if(image){canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data}
  for(let i=0;i<positions.count;i++){
   const p=new T.Vector3().fromBufferAttribute(positions,i);original.applyBoneTransform(i,p);p.applyMatrix4(original.matrixWorld);
   const uv=geometry.attributes.uv,u=Math.max(0,Math.min(canvas.width-1,Math.floor(uv.getX(i)*canvas.width))),v=Math.max(0,Math.min(canvas.height-1,Math.floor((original.material.map?.flipY?1-uv.getY(i):uv.getY(i))*canvas.height))),k=(v*canvas.width+u)*4,dark=pixels&&Math.max(pixels[k],pixels[k+1],pixels[k+2])<120;
   scalp[i]=p.y>1.728||dark&&(p.y>1.665&&p.z<.095||p.y>1.60&&p.z<-.035)?1:0;
   // Remove the baked quiff from the shared base scalp, so bald/buzz are real silhouettes.
   if(scalp[i]&&p.y>1.728){
    const direction=new T.Vector3((p.x+.008)/.090,(p.y-1.685)/.100,(p.z-.017)/.108).normalize();p.set(direction.x*.090-.008,direction.y*.100+1.685,direction.z*.108+.017);
    const matrix=new T.Matrix4();matrix.elements.fill(0);for(let j=0;j<4;j++){const weight=geometry.attributes.skinWeight.getComponent(i,j),index=geometry.attributes.skinIndex.getComponent(i,j),bone=new T.Matrix4().multiplyMatrices(original.skeleton.bones[index].matrixWorld,original.skeleton.boneInverses[index]);for(let n=0;n<16;n++)matrix.elements[n]+=bone.elements[n]*weight}
    matrix.premultiply(original.bindMatrixInverse).multiply(original.bindMatrix).premultiply(original.matrixWorld).invert();const localPoint=p.clone().applyMatrix4(matrix);positions.setXYZ(i,localPoint.x,localPoint.y,localPoint.z);
   }
   local.set([p.x,p.y,p.z],i*3);
  }
  geometry.computeVertexNormals();geometry.setAttribute('d6Rest',new T.BufferAttribute(local,3));geometry.setAttribute('d6Scalp',new T.BufferAttribute(scalp,1));return {original,geometry,map:original.material.map&&shared(original.material.map.clone())};
 });
 function numberMap(number){
  if(!numberCache.has(number)){const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d');ctx.font='bold 94px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.lineWidth=7;ctx.strokeStyle='#132126';ctx.strokeText(String(number),64,68);ctx.fillStyle='#f5f5e8';ctx.fillText(String(number),64,68);const texture=shared(new T.CanvasTexture(canvas));texture.colorSpace=T.SRGBColorSpace;numberCache.set(number,texture)}return numberCache.get(number);
 }
 function hairstyle(style){
  if(hairCache.has(style))return hairCache.get(style);
  const parts=[],rx=.092,rz=.112,cy=.220,cz=.086;
  function oval(x,y,z,a,b,c){const g=new T.SphereGeometry(1,12,6);g.scale(a,b,c);g.translate(x,y,z);parts.push(g)}
  if(style!=='bald'){
   const volume=style==='round_afro'?1.40:style==='tight_curls'?1.18:style==='medium_waves'?1.13:1;
   const g=new T.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI*.50),p=g.attributes.position;
   for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),bump=['tight_curls','round_afro','textured_crop'].includes(style)?1+.045*Math.sin(x*29+z*33)*Math.sin(y*31):1,height=style==='buzz'?.066:style==='cornrows'?.079:.093;
    p.setXYZ(i,x*rx*volume*bump-.010,cy+y*height*volume*bump+(style==='side_part'?x*.016:style==='medium_waves'?.006*Math.sin(z*13):0),z*rz*volume+cz)}g.computeVertexNormals();parts.push(g);
   if(style==='long_tied')oval(-.01,.22,cz-.145,.044,.042,.043);
   if(style==='short_locs')for(let i=0;i<9;i++){const a=i/9*Math.PI*2;oval(Math.sin(a)*.081-.010,.263,Math.cos(a)*.093+cz,.017,.045,.018)}
   if(style==='cornrows')for(let i=-2;i<=2;i++){const x=i*.026-.010,path=new T.CatmullRomCurve3([new T.Vector3(x,.23,cz+.108),new T.Vector3(x,.30,cz+.053),new T.Vector3(x,.31,cz-.033),new T.Vector3(x,.23,cz-.11)]);parts.push(new T.TubeGeometry(path,9,.0055,5,false))}
  }
  const positions=[],normals=[];for(const part of parts){const flat=part.toNonIndexed();positions.push(...flat.attributes.position.array);normals.push(...flat.attributes.normal.array);flat.dispose();part.dispose()}
  const geometry=shared(new T.BufferGeometry());geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geometry.scale(scale,scale,scale);hairCache.set(style,geometry);return geometry;
 }
 const point=name=>rest[name].position.clone().applyQuaternion(flip).multiplyScalar(scale).add(new T.Vector3(0,floor,0));
 const length=(a,b)=>rest[a].position.distanceTo(rest[b].position)*scale;
 const align=(a,b)=>new T.Quaternion().setFromUnitVectors(rest[b].position.clone().sub(rest[a].position).applyQuaternion(flip).normalize(),new T.Vector3(0,-1,0)).multiply(flip);
 function attach(v,options){
  // Keep pose groups, discard the superseded body and floating number plane.
  const obsolete=[],oldMaterials=new Set(),oldTextures=new Set();v.body.traverse(o=>{if(o.isMesh)obsolete.push(o)});
  for(const o of obsolete){o.parent.remove(o);o.geometry.dispose();oldMaterials.add(o.material);if(o.material.map)oldTextures.add(o.material.map)}for(const material of oldMaterials)material.dispose();for(const texture of oldTextures)texture.dispose();
  const owned=[],use=r=>{owned.push(r);return acquire(r)},look=v.appearance;
  v.neck.position.copy(point('neck'));
  const footLifts=[],spec={};
  for(const [side,i]of [['Left',0],['Right',1]]){
   const leg=v.limbs[i*2],arm=v.limbs[i*2+1],knee=v.knees[i],foot=v.feet[i],elbow=v.elbows[i];
   leg.position.copy(point(side+'UpLeg'));leg.position.z=0;
   knee.position.set(0,-length(side+'UpLeg',side+'Leg'),0);foot.position.set(0,-length(side+'Leg',side+'Foot'),0);
   arm.position.copy(point(side+'Arm'));elbow.position.set(0,-length(side+'Arm',side+'ForeArm'),0);
   footLifts[i]=rest[side+'Foot'].position.y*scale+floor-.11;
   spec[side+'UpLeg']={group:leg,rotation:align(side+'UpLeg',side+'Leg')};
   spec[side+'Leg']={group:knee,rotation:align(side+'Leg',side+'Foot')};
   spec[side+'Foot']={group:foot,rotation:flip};
   spec[side+'ToeBase']={group:foot,rotation:flip,offset:rest[side+'ToeBase'].position.clone().sub(rest[side+'Foot'].position).applyQuaternion(flip).multiplyScalar(scale)};
   spec[side+'Arm']={group:arm,rotation:align(side+'Arm',side+'ForeArm')};
   spec[side+'ForeArm']={group:elbow,rotation:align(side+'ForeArm',side+'Hand')};
   spec[side+'Hand']={group:elbow,rotation:align(side+'ForeArm',side+'Hand'),offset:new T.Vector3(0,-length(side+'ForeArm',side+'Hand'),0)};
  }
  const bones=sourceMeshes[0].skeleton.bones.map(b=>{
   let s=spec[b.name];
   if(!s){const head=['neck','Head','head_end','headfront'].includes(b.name);s={group:head?v.neck:v.body,rotation:flip,offset:head?point(b.name).sub(point('neck')):point(b.name)}}
   const driver=new T.Bone();driver.name='D6_'+b.name;driver.position.copy(s.offset||new T.Vector3());driver.quaternion.copy(s.rotation).multiply(rest[b.name].quaternion);driver.scale.copy(rest[b.name].scale).multiplyScalar(scale);s.group.add(driver);return driver;
  });
  const skeleton=new T.Skeleton(bones,sourceMeshes[0].skeleton.boneInverses.map(m=>m.clone())),meshes=[];
  const disposeSkeleton=skeleton.dispose.bind(skeleton);skeleton.dispose=()=>{if(v.meshy)v.meshy.disposed=true;disposeSkeleton()};
  for(const {original,geometry:cached,map} of prepared){
   const geometry=use(cached),material=original.material.clone();material.map=map&&use(map);const numbers=use(numberMap(options.number));
   const kit=options.kit||{},styles=['plain','stripe','stripes','hoops','halves','pinstripes','diagonal'];
   material.onBeforeCompile=shader=>{
    shader.uniforms.d6Main={value:new T.Color(kit.main||'#204944')};shader.uniforms.d6Trim={value:new T.Color(kit.trim||'#e7eee2')};shader.uniforms.d6Accent={value:new T.Color(kit.accent||kit.trim||'#e7eee2')};shader.uniforms.d6Style={value:Math.max(0,styles.indexOf(kit.style))};
    shader.uniforms.d6Skin={value:new T.Color(skins[look.skinTone]||skins.warm)};shader.uniforms.d6Hair={value:new T.Color(hairs[look.hairColor]||hairs['dark-brown'])};shader.uniforms.d6Bald={value:look.hairstyle==='bald'?1:0};shader.uniforms.d6Number={value:numbers};
    shader.vertexShader='attribute vec3 d6Rest; attribute float d6Scalp; varying vec3 restPoint; varying float scalpMask;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nrestPoint=d6Rest;scalpMask=d6Scalp;');
    shader.fragmentShader='uniform vec3 d6Main; uniform vec3 d6Trim; uniform vec3 d6Accent; uniform vec3 d6Skin; uniform vec3 d6Hair; uniform float d6Bald; uniform sampler2D d6Number; uniform float d6Style; varying vec3 restPoint; varying float scalpMask;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
     bool skinPixel=diffuseColor.r>diffuseColor.g*1.12&&diffuseColor.g>diffuseColor.b*1.12&&diffuseColor.r>.12;
     bool greenPixel=diffuseColor.g>diffuseColor.r*1.2&&diffuseColor.g>diffuseColor.b*1.1;
     bool shirt=(restPoint.y>1.005&&restPoint.y<1.50&&abs(restPoint.x)<.34)||(greenPixel&&restPoint.y>.90&&restPoint.y<1.50);
     bool sock=restPoint.y>.17&&restPoint.y<.60&&abs(restPoint.x)<.28;
     float pigment=dot(diffuseColor.rgb,vec3(.21,.72,.07));
     if(skinPixel&&restPoint.y>.54)diffuseColor.rgb=d6Skin*(.72+pigment*.65);
     if(scalpMask>.35)diffuseColor.rgb=mix(d6Hair,d6Skin,d6Bald)*(.84+pigment*.35);
     if((shirt||sock)&&!skinPixel){float stripe=0.0;float u=(restPoint.x+.24)/.48;float h=(restPoint.y-1.035)/.43;
      if(shirt){
       if(d6Style==1.0)stripe=step(.37,u)*step(u,.63);
       if(d6Style==2.0)stripe=step(.55,fract(u*4.0));
       if(d6Style==3.0)stripe=step(.72,fract(h*4.0));
       if(d6Style==4.0)stripe=step(u,.5);
       if(d6Style==5.0)stripe=step(.88,fract(u*5.0));
       if(d6Style==6.0)stripe=step(abs(u+h-1.0),.12);
       if(restPoint.y>1.435)stripe=1.0;
      }else{stripe=step(.51,restPoint.y)*step(restPoint.y,.56);}
      diffuseColor.rgb=mix(d6Main,d6Trim,stripe)*(.84+.16*diffuseColor.g);
      if(shirt&&restPoint.y>.998&&restPoint.y<1.012)diffuseColor.rgb=d6Accent;
      if(shirt&&restPoint.z<-.075&&restPoint.y>1.17&&restPoint.y<1.405&&abs(restPoint.x)<.10){vec4 n=texture2D(d6Number,vec2(.5-restPoint.x/.20,(restPoint.y-1.17)/.235));diffuseColor.rgb=mix(diffuseColor.rgb,n.rgb,n.a);}
     }`);
   };
   material.customProgramCacheKey=()=> 'd6-meshy-squad-v3';
   // The number uniform participates in texture ownership even before compilation.
   material.userData.numberTexture=numbers;
   const mesh=new T.SkinnedMesh(geometry,material);mesh.matrix.copy(original.matrixWorld);mesh.matrix.decompose(mesh.position,mesh.quaternion,mesh.scale);mesh.castShadow=true;mesh.frustumCulled=false;
   mesh.bind(skeleton,original.bindMatrix.clone());v.root.add(mesh);meshes.push(mesh);
  }
  const hairGeometry=use(hairstyle(look.hairstyle));if(hairGeometry.attributes.position.count){const hair=new T.Mesh(hairGeometry,new T.MeshStandardMaterial({color:hairs[look.hairColor]||hairs['dark-brown'],roughness:.95}));hair.castShadow=true;v.neck.add(hair)}
  v.meshy={meshes,skeleton,ankleLift:footLifts,headerReach:.42,kit:{...options.kit},look:{...look}};players.add(v);
  v.root.userData.d6Release=()=>{if(v.meshy.released)return;v.meshy.released=true;v.meshy.disposed=true;players.delete(v);for(const resource of owned)release(resource)};
  if(!selected||selected.meshy.disposed)selected=v;return v;
 }
 D6PlayerModel.create=function(options){const v=baseCreate(options);if(!options.keeper&&options.number>0)attach(v,options);return v};
 return {get selected(){return selected},get players(){return [...players]},get resources(){return {leases:leases.size,geometries:prepared.length,hairStyles:hairCache.size,numberTextures:numberCache.size}},attach};
}};
