'use strict';
// Shared visual scene only. The prototype and real match adapter own their inputs.
window.D6PitchScene={create(canvas,{goalWidth=7.6,advertising}={}){
 let disposed=false,advertImage=null;
 const advertisingState={name:advertising?.name||null,ready:false,boards:[]};
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),mix=(a,b,q)=>a+(b-a)*q;
 const height=32,fov=46;
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.18;
 renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene();
 scene.background=new THREE.Color('#a6c2c4');
 scene.fog=new THREE.Fog('#a6c2c4',120,240);
 const camera=new THREE.PerspectiveCamera(fov,16/9,0.1,240);
 scene.add(new THREE.HemisphereLight('#e7f2ff','#263c32',1.6));
 const sun=new THREE.DirectionalLight('#fff0d4',2.8);
 sun.position.set(-25,55,18);sun.castShadow=true;
 sun.shadow.mapSize.set(1024,1024);
 Object.assign(sun.shadow.camera,{left:-55,right:55,top:45,bottom:-45,near:1,far:120});
 sun.shadow.bias=-0.001;sun.shadow.normalBias=0.03;scene.add(sun);
 const mat = (color,more={}) => new THREE.MeshStandardMaterial({color,roughness:0.9,...more});
 // Authored turf texture: subtle blade variation without extra scene geometry.
 const grassCanvas=document.createElement('canvas');grassCanvas.width=256;grassCanvas.height=256;
 const grassContext=grassCanvas.getContext('2d');grassContext.fillStyle='#aab69f';grassContext.fillRect(0,0,256,256);
 let grassSeed=61;const randomGrass=()=>{grassSeed=(grassSeed*1664525+1013904223)>>>0;return grassSeed/4294967296;};
 for(let i=0;i<7500;i++){const light=randomGrass()>.5;grassContext.fillStyle=light?'#d0d7c326':'#253b2420';grassContext.fillRect(randomGrass()*256,randomGrass()*256,1,1+randomGrass()*3);}
 const grassTexture=new THREE.CanvasTexture(grassCanvas);grassTexture.colorSpace=THREE.SRGBColorSpace;grassTexture.wrapS=grassTexture.wrapT=THREE.RepeatWrapping;grassTexture.repeat.set(2,14);grassTexture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
 const turf=[mat('#579450',{map:grassTexture}),mat('#4b8447',{map:grassTexture})], white=mat('#f4f3dc');
 const concrete=mat('#7b8c8c'),darkConcrete=mat('#31474c'), trim=mat('#e0e2d4');
 const ground=mat('#53694e'),steel=mat('#faf7e9',{roughness:.5});
 const dark=mat('#172b37'),lime=mat('#c7f36b'),blue=mat('#65b9f0');
 function mesh(geometry,material,parent=scene){const m=new THREE.Mesh(geometry,material);parent.add(m);return m;}
 function box(w,h,d,material,x,y,z,parent=scene){const m=mesh(new THREE.BoxGeometry(w,h,d),material,parent);m.position.set(x,y,z);m.receiveShadow=true;return m;}
 function cylinder(radius,h,material,x,y,z,parent=scene){const m=mesh(new THREE.CylinderGeometry(radius,radius,h,10),material,parent);m.position.set(x,y,z);m.castShadow=true;return m;}
 function line(points,color='#e8f0dd',parent=scene){const geometry=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p)));const m=new THREE.Line(geometry,new THREE.LineBasicMaterial({color}));parent.add(m);return m;}
 function turfLine(x1,z1,x2,z2,width=.14){const dx=x2-x1,dz=z2-z1;const m=box(Math.hypot(dx,dz),.035,width,white,(x1+x2)/2,.055,(z1+z2)/2);m.rotation.y=-Math.atan2(dz,dx);return m;}
 function rectangle(x1,z1,x2,z2){turfLine(x1,z1,x2,z1);turfLine(x2,z1,x2,z2);turfLine(x2,z2,x1,z2);turfLine(x1,z2,x1,z1);}
 function arc(cx,cz,r,start=0,end=Math.PI*2){const pts=[];for(let i=0;i<=80;i++){const a=mix(start,end,i/80);pts.push([cx+Math.cos(a)*r,.085,cz+Math.sin(a)*r]);}const curve=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)));return mesh(new THREE.TubeGeometry(curve,80,.065,4,false),white);}
 box(170,.3,130,ground,0,-.22,0);
 box(90,.1,64,mat('#6b7772'),0,-.13,0);
 box(77,.15,53,mat('#335f3b'),0,-.11,0);
 for(let i=0;i<12;i++)box(68/12,.06,44,turf[i%2],-34+(i+.5)*68/12,.008,0);
 rectangle(-34,-22,34,22);turfLine(0,-22,0,22);arc(0,0,5.4);
 for(const end of [-1,1]){
  rectangle(end*34,-10,end*24,10);rectangle(end*34,-5,end*30,5);
  const spot=mesh(new THREE.CircleGeometry(.16,16),white);spot.rotation.x=-Math.PI/2;spot.position.set(end*26,.095,0);
  arc(end*26,0,5,end===1?Math.acos(-.4):-Math.acos(.4),end===1?Math.PI*2-Math.acos(-.4):Math.acos(.4));
 }
 const centerSpot=mesh(new THREE.CircleGeometry(.16,16),white);centerSpot.rotation.x=-Math.PI/2;centerSpot.position.y=.095;
 for(const x of [-34,34])for(const z of [-22,22]){
  cylinder(.055,1.8,steel,x,.9,z);
  box(.035,.45,.58,lime,x,1.58,z+.25);
 }
 // Open wire nets make the ball visible behind the physical goal line.
 function goal(end){
  const x=end*34,back=x+end*2.2,h=goalWidth/3,w=goalWidth;
  const tube=(a,b)=>{const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b);const m=mesh(new THREE.CylinderGeometry(.095,.095,av.distanceTo(bv),8),steel);m.position.copy(av).add(bv).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),bv.sub(av).normalize());m.castShadow=true;};
  tube([x,0,-w/2],[x,h,-w/2]);tube([x,0,w/2],[x,h,w/2]);tube([x,h,-w/2],[x,h,w/2]);
  tube([back,0,-w/2],[back,h-.15,-w/2]);tube([back,0,w/2],[back,h-.15,w/2]);tube([back,h-.15,-w/2],[back,h-.15,w/2]);
  for(let z=-w/2;z<=w/2+.01;z+=.38)line([[x,h,z],[back,h-.15,z],[back,.05,z]],'#c9d3bd');
  for(let y=.05;y<=h;y+=.32){line([[x,y,-w/2],[back,y,-w/2],[back,y,w/2],[x,y,w/2]],'#c9d3bd');}
  for(let step=1;step<6;step++){
   const q=step/6;
   const depthX=mix(x,back,q),top=mix(h,h-.15,q);
   line([[depthX,top,-w/2],[depthX,top,w/2]],'#c9d3bd');
   for(const side of [-1,1])line([[depthX,.05,side*w/2],[depthX,top,side*w/2]],'#c9d3bd');
  }
 }
 goal(-1);goal(1);
 // Terraces and instanced spectators keep the stadium inexpensive to render.
 const crowdColors=['#dbe3db','#2c4350','#bdd35d','#65b3cc','#d4a27c','#e9d7b3'];
 const seatsPerRow=85,rows=6,crowdMesh=new THREE.InstancedMesh(new THREE.CylinderGeometry(.19,.23,.48,4),mat('#ffffff'),seatsPerRow*rows*2);
 const crowdHeads=new THREE.InstancedMesh(new THREE.OctahedronGeometry(.13),mat('#d5ae8b'),seatsPerRow*rows*2);
 const seats=new THREE.InstancedMesh(new THREE.PlaneGeometry(.7,.6),mat('#2c5c66',{side:THREE.DoubleSide}),seatsPerRow*rows*2);
 const dummy=new THREE.Object3D();let seat=0;
 for(const side of [-1,1]){
  for(let row=0;row<rows;row++){
   const z=side*(31+row*1.35),y=1.2+row*.85;
   box(94,.7,1.4,row%2?concrete:darkConcrete,0,y-.6,z);
   for(let i=0;i<seatsPerRow;i++){
    const seatX=-45+i*1.07,offset=((i*17+row*11)%7)*.025;
    dummy.position.set(seatX,y+.15+offset,z);dummy.updateMatrix();crowdMesh.setMatrixAt(seat,dummy.matrix);crowdMesh.setColorAt(seat,new THREE.Color(crowdColors[(i*7+row*3+(side+1))%crowdColors.length]));
    dummy.position.y=y+.52+offset;dummy.updateMatrix();crowdHeads.setMatrixAt(seat,dummy.matrix);
    dummy.position.set(seatX,y-.13,z+.12);dummy.updateMatrix();seats.setMatrixAt(seat,dummy.matrix);seat++;
   }
  }
  box(96,.2,.25,trim,0,6.05,side*39.2);
  // A light cantilever roof, aisles and rails give the stands an actual silhouette.
  // Keep the camera-side stand open so its canopy cannot obstruct the wide view.
  if(side===-1){
   const roof=box(97,.22,8.4,mat('#263e48'),0,8.25,side*37.4);roof.rotation.x=side*.07;
   box(97,.12,.16,trim,0,7.95,side*33.25);
  }
  for(const x of [-46,-23,0,23,46]){box(.24,7.8,.24,concrete,x,4,side*40.1);box(1.35,.18,8,concrete,x,3.1,side*35.3);}
 }
 scene.add(seats,crowdMesh,crowdHeads);
 for(const end of [-1,1])for(let row=0;row<4;row++)box(1.6,.8,59,row%2?concrete:darkConcrete,end*(43+row*1.5),row*.85+.5,0);
 // Corner floodlights and benches are kept outside the touchlines.
 const lamp=mat('#fff9d9',{emissive:'#fff4cf',emissiveIntensity:.25});
 for(const x of [-43,43])for(const z of [-31,31]){cylinder(.12,11,concrete,x,5.5,z);box(2.4,.8,.34,dark,x,10.8,z);for(const offset of [-.72,0,.72])box(.5,.45,.12,lamp,x+offset,10.8,z-.2);}
 for(const x of [-11,11]){box(7,.18,2.3,dark,x,.38,28.1);box(7,1.8,.12,mat('#638790',{transparent:true,opacity:.45}),x,1.4,29.15);box(7,.16,2.3,concrete,x,2.3,28.1);for(let i=0;i<7;i++)box(.58,.6,.54,blue,x-3+i,.65,28.1);}
 function textTexture(text,bg,fg,width=1024){const c=document.createElement('canvas');c.width=width;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,width,128);ctx.fillStyle=fg;ctx.font='bold 54px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,width/2,66,width-60);const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;return texture;}
 if(advertising===undefined){
  const ads=[['DOPPEL 6','#152b29','#c7f36b'],['DEINE FARBEN.','#c7f36b','#152b29'],['DEIN FUSSBALL.','#91c4e7','#152b29']];
  for(const side of [-1,1])for(let i=0;i<6;i++){
   const a=ads[i%3];box(11.9,1.25,.24,dark,-30+i*12,.63,side*25.8);
   const sign=mesh(new THREE.PlaneGeometry(11.65,1.16),new THREE.MeshBasicMaterial({map:textTexture(...a)}));sign.position.set(-30+i*12,.7,side*25.65);if(side===1)sign.rotation.y=Math.PI;
  }
 }else if(advertising){
  // Repeated full sponsor wordmark on the two long touchlines only.
  const texture=textTexture(advertising.name,'#f7f4e9','#202725',2048),ctx=texture.image.getContext('2d');
  texture.image.height=512;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const paintFallback=()=>{ctx.fillStyle='#f7f4e9';ctx.fillRect(0,0,2048,512);ctx.fillStyle='#202725';ctx.font='bold 112px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(advertising.name,1024,256,1920);};paintFallback();
  const material=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide,toneMapped:false});
  for(const side of [-1,1])for(const x of [-27,-16.2,-5.4,5.4,16.2,27]){
   const z=side*25.5;advertisingState.boards.push({x,z,width:10.4,height:1.32});
   box(10.6,1.5,.24,dark,x,.77,z);box(10.7,.07,.3,steel,x,1.53,z);
   for(const support of [-4.5,4.5])box(.12,.4,.4,dark,x+support,.2,z);
   // Broad wordmarks keep their aspect ratio; both faces stay readable on pans.
   const sign=mesh(new THREE.PlaneGeometry(10.4,1.32),material);sign.position.set(x,.81,z-side*.14);if(side===1)sign.rotation.y=Math.PI;
  }
  advertImage=new Image();advertImage.onload=()=>{
   if(disposed)return;
   ctx.clearRect(0,0,2048,512);ctx.fillStyle='#f7f4e9';ctx.fillRect(0,0,2048,512);
   // Texture and physical board proportions differ: fit using world dimensions.
   const ratio=advertImage.naturalWidth/advertImage.naturalHeight,worldHeight=Math.min(1.2,4.7/ratio),worldWidth=worldHeight*ratio;
   const w=worldWidth/10.4*2048,h=worldHeight/1.32*512;
   for(const centre of [512,1536])ctx.drawImage(advertImage,centre-w/2,(512-h)/2,w,h);texture.needsUpdate=true;advertisingState.ready=true;
  };
  const dimensions=/viewBox="[^"]*?([\d.]+) ([\d.]+)"/.exec(advertising.svg);
  advertImage.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(advertising.svg.replace('<svg',`<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions?.[1]||340}" height="${dimensions?.[2]||110}"`));
 }
 // Batch the static stadium by material, leaving every animated object separate.
 scene.updateMatrixWorld(true);
 const staticMeshes=new Map(),staticLines=new Map();
 for(const object of [...scene.children]){
  if(object.isMesh&&!object.isInstancedMesh){const key=object.material.id;const group=staticMeshes.get(key)||{material:object.material,positions:[],normals:[],uvs:[],cast:false};const geo=object.geometry.index?object.geometry.toNonIndexed():object.geometry.clone();geo.applyMatrix4(object.matrixWorld);group.positions.push(...geo.attributes.position.array);group.normals.push(...geo.attributes.normal.array);if(geo.attributes.uv)group.uvs.push(...geo.attributes.uv.array);group.cast||=object.castShadow;staticMeshes.set(key,group);geo.dispose();scene.remove(object);object.geometry.dispose();}
  else if(object.isLine){const key=object.material.color.getHex(),points=object.geometry.attributes.position,group=staticLines.get(key)||[];for(let i=1;i<points.count;i++){for(const j of [i-1,i]){const p=new THREE.Vector3().fromBufferAttribute(points,j).applyMatrix4(object.matrixWorld);group.push(p.x,p.y,p.z);}}staticLines.set(key,group);scene.remove(object);object.geometry.dispose();object.material.dispose();}
 }
 for(const group of staticMeshes.values()){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(group.positions,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(group.normals,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(group.uvs,2));const object=mesh(geo,group.material);object.castShadow=group.cast;object.receiveShadow=true;}
 for(const [color,points]of staticLines){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));scene.add(new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color})));}
 const numberTexture=n=>{const c=document.createElement('canvas');c.width=128;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#142735';ctx.font='bold 100px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(n),64,70);const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;return texture;};
 // Six players per team. Limb pivots animate the run rather than sliding discs.
 const people=[];
 function player(team,number,x,z,keeper=false,kitSpec=null,appearance=null){
  const p=D6PlayerModel.create({THREE,team,number,x,z,keeper,kit:kitSpec,appearance,numberTexture});scene.add(p.root);people.push(p);return p;
 }
 const ballRoot=new THREE.Group();scene.add(ballRoot);
 const ball=mesh(new THREE.IcosahedronGeometry(.28,2),mat('#fcfbec'),ballRoot);ball.castShadow=true;
 // Diameter 0.3528: approximately one eighth of the standing player height.
 ball.scale.setScalar(.63);
 // Small dark panels preserve a football silhouette at TV distance.
 for(let i=0;i<12;i++){const a=i*2.39996,y=1-2*(i+.5)/12,r=Math.sqrt(1-y*y);const direction=new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r);const panel=mesh(new THREE.CircleGeometry(.105,5),dark,ball);panel.position.copy(direction).multiplyScalar(.275);panel.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),direction);}
 const ballShadow=mesh(new THREE.CircleGeometry(.28,20),new THREE.MeshBasicMaterial({color:'#142b1c',transparent:true,opacity:.38,depthWrite:false}));ballShadow.rotation.x=-Math.PI/2;
 const ownerRing=mesh(new THREE.RingGeometry(.67,.76,40),new THREE.MeshBasicMaterial({color:'#eef9c2',transparent:true,opacity:.72,side:THREE.DoubleSide,depthWrite:false}));ownerRing.rotation.x=-Math.PI/2;ownerRing.position.y=.11;

 function disposeObject(root){
  const geometries=new Set(),materials=new Set(),textures=new Set(),skeletons=new Set();
  root.traverse(object=>{if(object.skeleton)skeletons.add(object.skeleton);if(object.geometry)geometries.add(object.geometry);for(const material of (Array.isArray(object.material)?object.material:[object.material]))if(material){materials.add(material);for(const value of Object.values(material))if(value?.isTexture)textures.add(value);}});
  for(const skeleton of skeletons)skeleton.dispose();
  for(const geometry of geometries)if(!geometry.userData?.d6Shared)geometry.dispose();for(const material of materials)material.dispose();for(const texture of textures)if(!texture.userData?.d6Shared)texture.dispose();
  // Imported player resources have per-player leases, also on substitutions.
  root.traverse(object=>object.userData?.d6Release?.());
 }
 return {renderer,scene,camera,people,player,ballRoot,ball,ballShadow,ownerRing,advertisingState,
  removePlayer(person){scene.remove(person.root);people.splice(people.indexOf(person),1);disposeObject(person.root);},
  dispose(){disposed=true;if(advertImage)advertImage.onload=null;disposeObject(scene);renderer.dispose();}
 };
}};
