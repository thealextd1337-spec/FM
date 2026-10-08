const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),THREE=require('../dist/camera-prototype/vendor/three-r160.min.js');
const drawing={fillRect(){},beginPath(){},moveTo(){},lineTo(){},fill(){}};
const context=vm.createContext({window:{},document:{createElement:()=>({getContext:()=>drawing})},v98PitchPoint:p=>({x:p.x,z:p.y})});
vm.runInContext(fs.readFileSync('dist/player-model-v105.js','utf8'),context);
const source=fs.readFileSync('dist/pitch-motion-v102.js','utf8');vm.runInContext(source.slice(source.indexOf('function v102LegPose(')),context);
const make=()=>context.window.D6PlayerModel.create({THREE,team:0,number:7,x:0,z:0,keeper:false,kit:{main:'#245b45',trim:'#ddd8b5'},numberTexture:()=>new THREE.Texture()});
let contacts=0,maxContactError=0;const phases=[];
for(const hz of [30,60,120]){
 const v=make();let lowestSwing=10;
 for(let i=1;i<=hz*3;i++){
  const p={x:0,z:i/hz*3,number:7};context.v102RunPose(v,p,1/hz,true);v.previous={x:p.x,z:p.z};v.root.updateMatrixWorld(true);
  for(let leg=0;leg<2;leg++){
   const phase=((v.runPhase/(2*Math.PI)+leg*.5)%1+1)%1,sole=v.feet[leg].localToWorld(new THREE.Vector3(0,-.0775,.1));
   if(phase<.6){maxContactError=Math.max(maxContactError,Math.abs(sole.y-.038));contacts++;}
   else if(i>hz&&phase>.72&&phase<.88)lowestSwing=Math.min(lowestSwing,sole.y);
  }
 }
 assert(lowestSwing>.15,'longer-leg swing clears grass');phases.push(v.runPhase);
 const speed=v.runSpeed,phase=v.runPhase;
 for(let i=0;i<hz;i++)context.v102RunPose(v,{x:0,z:9,number:7},1/hz,true);
 assert(v.runSpeed<speed*.001,'braking settles the pose without advancing steps');assert.equal(v.runPhase,phase);
}
assert(maxContactError<.018,'actual model soles meet grass throughout stance');assert(Math.max(...phases)-Math.min(...phases)<1e-8,'distance-driven steps stay identical across graphics rates');
const actions=[];
for(const kind of ['pass','highPass','cross','shot','freeKick','volley']){
 const v=make(),height=kind==='volley'?1.2:.29;v.heading=0;context.v102RunPose(v,{x:0,z:0,number:7},0,false);
 context.v102ActionPose(v,{kind,progress:0,duration:.48,target:{x:0,y:10}},{x:0,z:0},false);v.root.updateMatrixWorld(true);
 const support=v.feet[0].localToWorld(new THREE.Vector3(0,-.0775,.1)),toe=v.feet[1].localToWorld(new THREE.Vector3(0,.02,.19));
 const gap=toe.distanceTo(new THREE.Vector3(0,height,.65));
 assert(Math.abs(support.y-.038)<.018,`${kind}: weighted support boot contacts grass`);
 assert(gap<.26,`${kind}: boot meets ball at release, not at the knee`);
 for(const p of [-.08/.48,.1,.4,.7,1]){context.v102RunPose(v,{x:0,z:0,number:7},0,false);context.v102ActionPose(v,{kind,progress:p,duration:.48,target:{x:0,y:10}},{x:0,z:0},false);v.root.updateMatrixWorld(true);v.root.traverse(o=>assert(o.matrixWorld.elements.every(Number.isFinite),'finite poses from windup to recovery'));}
 actions.push({kind,gap,support: support.y});
}
console.log(JSON.stringify({contacts,maxContactError,graphicsRates:[30,60,120],actions}));
