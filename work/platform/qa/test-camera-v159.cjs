const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('dist/world-pitch3d-v98.js','utf8');
const context=vm.createContext({});vm.runInContext(source.slice(0,source.indexOf('const v98Style=')),context);
const aim=vm.runInContext('v98CameraAim',context),blend=vm.runInContext('v98BlendCamera',context);
let checks=0;function check(value,message){assert(value,message);checks++;}
const distance=pose=>Math.hypot(...['x','y','z'].map(axis=>pose.position[axis]-pose.target[axis]));
for(const mode of ['follow','wide','sideline','diagonal','goal'])for(const aspect of [16/9,1.3,2.3])for(const x of [-34,0,34])for(const z of [-22,0,22]){
 const ball={x,z,height:.29},far=aim(ball,mode,aspect,0),near=aim(ball,mode,aspect,100),standard=aim(ball,mode,aspect,60);
 check(distance(near)<distance(standard)&&distance(standard)<distance(far),`${mode}: range must change actual camera distance`);
 check(near.position.y>4&&far.position.y<70,`${mode}: camera stays above field`);
 check(Object.values(standard.position).every(Number.isFinite)&&standard.fov>15&&standard.fov<65,`${mode}: finite pose/fov`);
 const targetDelta=blend(standard,aim({...ball,x:x+.1},mode,aspect,60),.05);
 check(Math.abs(targetDelta.target.x-standard.target.x)<.1,`${mode}: continuous tracking`);
}
const poses=['follow','wide','sideline','diagonal','goal'].map(mode=>JSON.stringify(aim({x:0,z:0,height:.29},mode,16/9,60)));
check(new Set(poses).size===5,'five distinct selectable cameras');
check(distance(aim({x:0,z:0,height:.29},'follow',16/9,60))<Math.hypot(24,37),'default moves closer than previous camera');
console.log(JSON.stringify({passed:true,checks}));
