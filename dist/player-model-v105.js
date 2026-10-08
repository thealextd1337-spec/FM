'use strict';
// Authored mobile sport figures. Joint lengths are read by the visual leg solver.
window.D6PlayerModel={create({THREE,team,number,x,z,keeper,kit,appearance,numberTexture}){
 const root=new THREE.Group(),body=new THREE.Group();root.add(body);root.position.set(x,0,z);root.scale.setScalar(1.12);
 const skins={fair:'#e9b996',light:'#d6a17c',warm:'#c28b60',medium:'#ad7550',brown:'#895638',deep:'#67442e'};
 const hairs={black:'#242329','dark-brown':'#332922',brown:'#58402d','light-brown':'#876445',blond:'#bca177',auburn:'#a25e35',gray:'#96918a'};
 const look={skinTone:appearance?.skinTone||['light','brown','warm'][(number+team)%3],hairColor:appearance?.hairColor||(number%3?'dark-brown':'light-brown'),hairstyle:appearance?.hairstyle||['textured_crop','side_part','buzz'][number%3],faceShape:appearance?.faceShape||'oval',facialHair:appearance?.facialHair||'none',nose:appearance?.nose||'straight',mouth:appearance?.mouth||'soft'};
 const skin=skins[look.skinTone]||skins.warm,hair=hairs[look.hairColor]||hairs['dark-brown'],main=kit?.main||(keeper?(team?'#d6bdd4':'#dfac72'):team?'#65b9f0':'#c7f36b'),trim=kit?.trim||(team?'#e7edf0':'#192d2a'),accent=kit?.accent||trim,shorts='#1b2931',boot='#263239';
 const solid=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.96,flatShading:true});
 const color=value=>new THREE.Color(value);
 function part(geometry,tint,parent,position=[0,0,0]){
  const c=color(tint),count=geometry.attributes.position.count,values=new Float32Array(count*3);for(let i=0;i<count;i++)values.set([c.r,c.g,c.b],i*3);
  geometry.setAttribute('color',new THREE.BufferAttribute(values,3));const object=new THREE.Mesh(geometry,solid);object.position.set(...position);object.castShadow=true;parent.add(object);return object;
 }
 function oval(rx,ry,rz,tint,parent,position,detail=8){const geo=new THREE.SphereGeometry(1,detail,detail<=8?4:6);geo.scale(rx,ry,rz);return part(geo,tint,parent,position)}
 // Elliptical contour rings describe chest, jaw and muscle volume, not cylinders.
 function contour(rings,sides=12){
  const positions=[],uv=[],indices=[],ascending=rings[0][0]<rings.at(-1)[0];
  for(let i=0;i<rings.length;i++){const [y,rx,rz,cz=0]=rings[i];for(let j=0;j<=sides;j++){const a=j/sides*Math.PI*2;positions.push(Math.sin(a)*rx,y,Math.cos(a)*rz+cz);uv.push(j/sides,i/(rings.length-1));}}
  for(let i=0;i<rings.length-1;i++)for(let j=0;j<sides;j++){const a=i*(sides+1)+j,b=a+sides+1;if(ascending)indices.push(a,a+1,b,b,a+1,b+1);else indices.push(a,b,a+1,b,b+1,a+1)}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
  const normals=geo.attributes.normal;for(let i=0;i<rings.length;i++){const a=i*(sides+1),b=a+sides,n=new THREE.Vector3().fromBufferAttribute(normals,a).add(new THREE.Vector3().fromBufferAttribute(normals,b)).normalize();normals.setXYZ(a,n.x,n.y,n.z);normals.setXYZ(b,n.x,n.y,n.z)}return geo;
 }
 function merge(parent){
  const objects=parent.children.filter(o=>o.isMesh&&o.material===solid);if(!objects.length)return;
  const lists={position:[],normal:[],color:[],uv:[]};
  for(const object of objects){object.updateMatrix();const geo=object.geometry.index?object.geometry.toNonIndexed():object.geometry.clone();geo.applyMatrix4(object.matrix);for(const name of Object.keys(lists))lists[name].push(...geo.attributes[name].array);geo.dispose();object.geometry.dispose();parent.remove(object)}
  const geo=new THREE.BufferGeometry();for(const [name,values]of Object.entries(lists))geo.setAttribute(name,new THREE.Float32BufferAttribute(values,name==='uv'?2:3));const object=new THREE.Mesh(geo,solid);object.castShadow=true;parent.add(object);
 }
 function shirtTexture(){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle=main;ctx.fillRect(0,0,128,128);ctx.fillStyle=trim;
  if(kit?.style==='stripe')for(const q of [-12,52,116])ctx.fillRect(q,0,24,128);
  if(kit?.style==='stripes')for(const q of [8,40,72,104])ctx.fillRect(q,0,12,128);
  if(kit?.style==='hoops')for(const q of [18,50,82,114])ctx.fillRect(0,q,128,10);
  if(kit?.style==='halves')ctx.fillRect(0,0,64,128);
  if(kit?.style==='pinstripes')for(const q of [16,40,64,88,112])ctx.fillRect(q,0,3,128);
  if(kit?.style==='diagonal'){ctx.beginPath();ctx.moveTo(0,92);ctx.lineTo(92,0);ctx.lineTo(120,0);ctx.lineTo(0,120);ctx.fill()}
  ctx.fillStyle=accent;ctx.fillRect(0,118,128,3);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
 }
 const torsoGeo=contour([[1.10,.245,.165],[1.22,.25,.172],[1.38,.275,.185],[1.59,.305,.192],[1.73,.32,.18],[1.80,.28,.15],[1.84,.105,.085]]);
 const shirt=new THREE.Mesh(torsoGeo,new THREE.MeshStandardMaterial({map:shirtTexture(),roughness:.96,flatShading:true}));shirt.castShadow=true;body.add(shirt);
 part(contour([[1.824,.108,.09],[1.847,.115,.095],[1.86,.096,.081]],12),trim,body);
 const shortsGeo=contour([[.84,.29,.166],[.98,.284,.17],[1.11,.25,.165],[1.135,.245,.165]],16),shortPositions=shortsGeo.attributes.position;
 for(let i=0;i<=16;i++)shortPositions.setY(i,.84+.10*Math.pow(1-Math.abs(shortPositions.getX(i)/.29),4));shortsGeo.computeVertexNormals();part(shortsGeo,shorts,body);
 const neck=new THREE.Group();neck.position.y=1.92;body.add(neck);
 part(contour([[-.07,.09,.09],[.03,.084,.083],[.075,.107,.10]],10),skin,neck);
 const faceWidth={round:1.05,square:1.04,long:.9,angular:.95,oval:1}[look.faceShape]||1;
 const jaw=look.faceShape==='square'?.128:look.faceShape==='angular'?.095:.112;
 part(contour([[0,.046,.068,.014],[.042,jaw,.102,.022],[.12,.176,.143,.014],[.22,.207,.17],[.34,.204,.17],[.44,.183,.155],[.505,.132,.117],[.535,.025,.028]].map(([y,rx,rz,cz])=>[y,rx*faceWidth,rz,cz]),14),skin,neck);
 for(const side of [-1,1]){
  oval(.037,.064,.03,skin,neck,[side*.204*faceWidth,.25,-.009]);
  oval(.028,.011,.012,'#ddd8c5',neck,[side*.073,.302,.164],6);
  oval(.009,.010,.005,'#39382e',neck,[side*.073,.301,.176],6);
  const brow=oval(.040,.008,.011,hair,neck,[side*.074,.328,.158],6);brow.rotation.z=side*.08;
 }
 const noseWidth=look.nose==='broad'?.039:look.nose==='narrow'?.024:.031;
 oval(noseWidth,.051,.045,skin,neck,[0,.253,.18],8);
 oval(look.mouth==='wide'?.060:look.mouth==='narrow'?.038:.048,.006,.011,color(skin).multiplyScalar(.57).getStyle(),neck,[0,.143,.156],6);
 const style=look.hairstyle;
 if(style!=='bald'){
  const thick=style==='round_afro'?1.35:style==='tight_curls'?1.15:style==='medium_waves'?1.12:1,geo=new THREE.SphereGeometry(1,14,7,0,Math.PI*2,0,Math.PI*.49);
  const positions=geo.attributes.position;
  for(let i=0;i<positions.count;i++){const px=positions.getX(i),py=positions.getY(i),pz=positions.getZ(i),texture=['tight_curls','round_afro','textured_crop'].includes(style)?1+.026*Math.sin(px*35+pz*29)*Math.sin(py*31):1;
   const slope=style==='side_part'?.027*px:0;positions.setXYZ(i,px*.221*faceWidth*thick*texture,.335+py*.235*thick*texture+slope,pz*.194*thick*texture)}geo.computeVertexNormals();part(geo,hair,neck);
  if(style==='long_tied')oval(.087,.087,.083,hair,neck,[0,.32,-.223],8);
  if(style==='short_locs')for(let i=0;i<7;i++){const a=.9+i*.72;oval(.032,.078,.035,hair,neck,[Math.sin(a)*.202,.337,Math.cos(a)*.172-.012],6)}
  if(style==='cornrows')for(let i=-2;i<=2;i++){const path=new THREE.CatmullRomCurve3([new THREE.Vector3(i*.06,.35,.154),new THREE.Vector3(i*.057,.53,.09),new THREE.Vector3(i*.052,.548,-.02),new THREE.Vector3(i*.057,.37,-.174)]);part(new THREE.TubeGeometry(path,6,.009,4,false),color(hair).multiplyScalar(1.5).getStyle(),neck)}
 }
 if(look.facialHair!=='none'){
  const beard=color(skin).lerp(color(hair),look.facialHair==='stubble'?.35:.8).getStyle();
  if(look.facialHair==='moustache')oval(.056,.011,.012,beard,neck,[0,.172,.161],6);
  else if(look.facialHair==='goatee')oval(.046,.024,.017,beard,neck,[0,.079,.12],6);
  else part(contour([[.027,.09,.09,.025],[.067,.133,.121,.02],[.103,.157,.136,.013]],12),beard,neck);
 }
 const limbs=[],knees=[],feet=[],elbows=[];
 for(const side of [-1,1]){
  const leg=new THREE.Group();leg.position.set(side*.165,1.02,0);body.add(leg);limbs.push(leg);
  part(contour([[-.025,.12,.108],[-.15,.12,.104],[-.29,.098,.092],[-.435,.077,.078],[-.475,.077,.078]],10),skin,leg);
  const knee=new THREE.Group();knee.position.y=-.47;leg.add(knee);knees.push(knee);
  part(contour([[.012,.078,.079],[-.065,.095,.088],[-.16,.099,.097],[-.29,.077,.076],[-.43,.058,.06],[-.45,.056,.058]],10),main,knee);
  part(contour([[.008,.079,.080],[-.025,.091,.085],[-.04,.093,.087]],10),trim,knee);
  const foot=new THREE.Group();foot.position.y=-.44;knee.add(foot);feet.push(foot);
  oval(.105,.057,.186,boot,foot,[0,-.005,.092],10);
  const sole=new THREE.CylinderGeometry(1,1,.025,12);sole.scale(.111,1,.20);part(sole,number%2?'#ece7d8':'#bfca7f',foot,[0,-.065,.10]);
  for(const q of [.075,.113,.15])oval(.047,.005,.006,'#c6c9c3',foot,[0,.046,q],6);
  const arm=new THREE.Group();arm.position.set(side*.35,1.77,0);body.add(arm);limbs.push(arm);
  part(contour([[.015,.065,.074],[-.045,.09,.082],[-.12,.089,.082],[-.20,.079,.074]],10),main,arm);
  part(contour([[-.17,.076,.073],[-.235,.073,.071],[-.275,.065,.064]],10),skin,arm);
  const elbow=new THREE.Group();elbow.position.y=-.27;arm.add(elbow);elbows.push(elbow);
  part(contour([[.015,.066,.062],[-.07,.072,.066],[-.17,.058,.055],[-.25,.04,.042]],10),skin,elbow);
  const handColour=keeper?'#dddeda':skin;
  oval(keeper?.091:.064,.093,keeper?.052:.039,handColour,elbow,[0,-.304,.009],8);
  oval(.024,.043,.026,handColour,elbow,[-side*.061,-.287,.023],6);
  if(keeper)part(contour([[-.238,.056,.053],[-.266,.060,.056]],8),trim,elbow);
 }
 const numberMaterial=new THREE.MeshBasicMaterial({map:numberTexture(number),transparent:true,depthWrite:false,side:THREE.DoubleSide});
 const back=new THREE.Mesh(new THREE.PlaneGeometry(.25,.29),numberMaterial);back.position.set(0,1.60,-.205);back.rotation.y=Math.PI;body.add(back);
 // Reduce the head as a coherent unit; identity and the neck joint stay separate.
 for(const object of neck.children){object.scale.multiply(new THREE.Vector3(.82,.72,.82));object.position.multiply(new THREE.Vector3(.82,.72,.82));}
 for(const group of [body,neck,...limbs,...knees,...feet,...elbows])merge(group);
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(.48,16),new THREE.MeshBasicMaterial({color:'#142b1c',transparent:true,opacity:.22,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.10;root.add(shadow);
 return {root,body,limbs,knees,feet,elbows,neck,team,number,keeper,appearance:{...look},base:{x,z},previous:{x,z},heading:team===0?Math.PI/2:-Math.PI/2};
}};
