const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),THREE=require('../dist/camera-prototype/vendor/three-r160.min.js');
const drawing={fillRect(){},beginPath(){},moveTo(){},lineTo(){},fill(){}};
const context=vm.createContext({window:{},document:{createElement:()=>({getContext:()=>drawing})},Math:Object.assign(Object.create(Math),{random(){throw Error('Model consumed engine RNG')}})});
vm.runInContext(fs.readFileSync('dist/player-model-v105.js','utf8'),context);const build=context.window.D6PlayerModel.create;
const defaults={THREE,team:0,number:7,x:0,z:0,keeper:false,kit:{main:'#245b45',trim:'#ddd8b5',accent:'#b98b48',style:'pinstripes'},numberTexture:()=>new THREE.Texture()};
const appearance={skinTone:'deep',hairColor:'auburn',hairstyle:'cornrows',faceShape:'square',facialHair:'short-beard',nose:'broad',mouth:'wide'},saved=JSON.stringify(appearance),figure=build({...defaults,appearance});
assert.equal(JSON.stringify(appearance),saved);assert.equal(figure.appearance.skinTone,'deep');assert.equal(figure.appearance.hairColor,'auburn');
assert.equal(figure.limbs.length,4);assert.equal(figure.knees.length,2);assert.equal(figure.elbows[0].position.y,-.27);assert.equal(figure.root.scale.x,1.12);
const ankle=figure.limbs[0].position.y+figure.knees[0].position.y+figure.feet[0].position.y;
assert(Math.abs(ankle-.11)<1e-9,'longer legs preserve neutral ankle and turf contact height');
assert(-figure.knees[0].position.y-figure.feet[0].position.y>.9,'athletic leg length exceeds the old .78');
const head=new THREE.Box3().setFromObject(figure.neck),bodyBounds=new THREE.Box3().setFromObject(figure.root);
assert(head.max.y-head.min.y<(bodyBounds.max.y-bodyBounds.min.y)*.22,'head remains proportionate to an adult sports figure');
assert(figure.body.children.find(o=>o.material.map?.isCanvasTexture).material.flatShading,'authored faceted matte shirt');
function metrics(figure){let meshes=0,triangles=0;const values=[];figure.root.traverse(o=>{if(!o.isMesh)return;meshes++;const geo=o.geometry;triangles+=(geo.index?.count||geo.attributes.position.count)/3;for(const attribute of Object.values(geo.attributes)){assert([...attribute.array].every(Number.isFinite),'geometry has finite positions, normals and colours');values.push([...attribute.array])}});return {meshes,triangles,signature:JSON.stringify(values)}}
const one=metrics(figure),two=metrics(build({...defaults,appearance}));assert.equal(one.signature,two.signature,'identity and geometry are deterministic');assert(one.meshes<=16&&one.triangles<3500,'bounded geometry and batched body segments');
// Chest normals point outward even though its rings ascend in height.
const torso=figure.body.children.find(o=>o.material.map?.isCanvasTexture);const positions=torso.geometry.attributes.position,normals=torso.geometry.attributes.normal;let tested=0;for(let i=0;i<positions.count;i++)if(positions.getZ(i)>.15){assert(normals.getZ(i)>0);tested++}assert(tested>5);
for(const hairstyle of ['buzz','side_part','medium_waves','round_afro','cornrows','textured_crop','tight_curls','short_locs','long_tied','bald']){const p=build({...defaults,appearance:{...appearance,hairstyle},keeper:true});assert(metrics(p).triangles<3500);assert.equal(p.appearance.hairstyle,hairstyle)}
const without={number:9,...defaults,appearance:null};const p=build(without);assert.equal(without.appearance,null,'missing saved appearance is never backfilled');assert(p.appearance.hairstyle);
console.log(JSON.stringify({modelCases:12,meshes:one.meshes,triangles:one.triangles,immutable:true,deterministic:true,neutralContactPreserved:true}));
