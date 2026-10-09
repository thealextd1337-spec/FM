'use strict';
// Unity picture adapter against the native v160 geometry: all four pitch/player
// combinations, fixed body/ball/goal metres, camera framing and legacy pitch.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('../../../dist/world-unity-v151.js');
const native=size=>{const s=size==='large'?1.2:1;return {version:1,length:68*s,width:44*s,goalWidth:44*.2/(544/600),goalHeight:44*.2/(544/600)/3,penaltyDepth:68*(.18-26/740)/(688/740),penaltyWidth:44*.5/(544/600),ballRadius:.1764};};
const legacy={length:68,width:44},close=(a,b,e=1e-9)=>Math.abs(a-b)<e,results=[];
// Native normalized point -> 68 x 44 browser picture (v98PitchPoint).
const pitch=(x,y)=>({x:(.5-y)*68/(688/740),z:(x-.5)*44/(544/600)});
const metres=(x,y,g)=>({x:(.5-y)*g.length/(688/740),z:(x-.5)*g.width/(544/600)});
for(const size of ['standard','large'])for(const fieldPlayers of [5,6]){
 const g=C.geometry(native(size),legacy),count=fieldPlayers+1;
 assert.deepEqual(Object.keys(g),['length','width','goalWidth','goalHeight','penaltyDepth','penaltyWidth']);
 assert(close(g.goalWidth,9.705882352941176,1e-12)&&close(g.goalHeight,g.goalWidth/3)&&close(g.penaltyWidth,24.264705882352942,1e-12),'goal and box stay the same size');
 const players=[];for(let t=0;t<2;t++)for(let i=0;i<count;i++){const x=.2+.6*i/(count-1),y=t?.3:.7,p=pitch(x,y);players.push({id:`p${t}-${i}`,team:t,number:i+1,x:p.x,z:p.z,nx:x,ny:y,movement:{mode:'run',facing:{x:p.x+1,z:p.z}}});}
 // Native anchors in normalized coordinates (v101KickPoint, v98PitchFrame feet):
 // .65 physical metres for this pitch. The Unity map must keep exactly .65 m.
 const sxN=g.width/(544/600),syN=g.length/(688/740),owner=players[3],target={x:owner.nx+.1,y:owner.ny-.2};
 const dx=(target.x-owner.nx)*sxN,dy=(target.y-owner.ny)*syN,d=Math.hypot(dx,dy),kick={x:owner.nx+dx/d*.65/sxN,y:owner.ny+dy/d*.65/syN};
 const kickPicture=pitch(kick.x,kick.y),dir=Math.SQRT1_2,feet={x:owner.x+.65*dir*68/g.length,z:owner.z+.65*dir*44/g.width,height:.29};
 players[3].action={kind:'pass',contactWorld:{...kickPicture,height:.29}};
 const frame={clock:5,elapsed:5,turned:false,owner:owner.id,ball:feet,players};
 const shown=C.scaled(frame,g);
 for(const p of shown.players){const n=players.find(q=>q.id===p.id),m=metres(n.nx,n.ny,g);assert(close(p.x,m.x,1e-9)&&close(p.z,m.z,1e-9),'native metres '+p.id);}
 assert.equal(shown.players.length,2*count);
 const o=shown.players[3],contact=Math.hypot(o.action.contactWorld.x-o.x,o.action.contactWorld.z-o.z),atFeet=Math.hypot(shown.ball.x-o.x,shown.ball.z-o.z);
 assert(close(contact,.65,1e-9),'native kick contact stays .65 m: '+contact);
 assert(close(atFeet,.65,1e-9),'ball at the feet stays .65 m: '+atFeet);
 // Goal scene: native ball inside the post is mapped unchanged; only the net
 // bulge point from v83 drift (x up to .588) is kept between the fixed posts.
 const insideBall=metres(.5+(g.goalWidth/2-.3)/sxN,26/740-1.9/syN,g),sceneSpot=pitch(.588,26/740-12/740);
 const goal=C.scaled({...frame,owner:null,ball:{...pitch(.5+(g.goalWidth/2-.3)/sxN,26/740-1.9/syN),height:.5},net:{sign:1,z:sceneSpot.z,height:.8,age:2,bulge:0}},g);
 assert(close(goal.ball.z,insideBall.z,1e-9)&&close(goal.ball.x,insideBall.x,1e-9),'goal ball unchanged');
 const unclamped=sceneSpot.z*g.width/44;assert(Math.abs(goal.net.z)<=g.goalWidth/2,'net bulge between posts');
 // Cameras (stub aim; the real v98CameraAim framing is measured in the T3 build
 // run, outputs/platform/unity-native-v160/final-qa.json): relative aim, overview
 // distance scaled by the pitch factor, followers keep their distance.
 const cameras={};
 for(const mode of ['tv','wide','sideline','diagonal','goal']){
  const aim=b=>{const fov=mode==='wide'?46:42;let pose={position:{x:b.x*.28,y:21,z:31},target:{x:b.x*.6,y:0,z:b.z*.35},fov};if(mode==='wide')pose={position:{x:b.x*.56,y:32,z:49},target:{x:b.x*.56,y:0,z:-2},fov};if(mode==='goal')pose={position:{x:-49,y:19,z:9},target:{x:b.x*.65,y:0,z:b.z*.4},fov};return pose;};
  const ball68={x:30,z:10,height:.29},ballG={x:30*g.length/68,z:10*g.width/44,height:.29},pose=C.camera(aim,ballG,g,mode),base=aim(ball68);
  const offset=p=>Math.hypot(p.position.x-p.target.x,p.position.y-p.target.y,p.position.z-p.target.z),k=offset(pose)/offset(base);
  assert(close(pose.target.x,base.target.x*g.length/68,1e-9),'relative aim '+mode);
  assert(close(k,['wide','goal'].includes(mode)?g.length/68:1,1e-9),'camera distance '+mode);
  if(mode==='goal')assert(pose.position.x<-g.length/2,'goal camera behind the goal line');
  cameras[mode]={position:pose.position,target:pose.target,distanceFactor:+k.toFixed(4)};
 }
 results.push({size,fieldPlayers,players:2*count,geometry:g,kickContactMetres:+contact.toFixed(6),ballAtFeetMetres:+atFeet.toFixed(6),goalBallZ:+goal.ball.z.toFixed(4),v83NetDriftZ:+unclamped.toFixed(4),netZShown:+goal.net.z.toFixed(4),postZ:+(g.goalWidth/2).toFixed(4),cameras});
}
assert.equal(C.scaled({players:[]},legacy).players.length,0);
const out=path.join(__dirname,'../../../outputs/platform/unity-native-v160');fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'adapter-tests.json'),JSON.stringify({passed:true,reasoning:['Native contacts (v101KickPoint, v115ThrowPoint) and the 3D ball at the feet are physical metres inside normalized coordinates; v98PitchPoint maps to 68 x 44 and one uniform length/68, width/44 map restores the native metres exactly.','The only special clamp is the net bulge point: v83GoalPosition drifts up to x=.588, which is 4.27 m on the standard pitch but 5.12-5.55 m on 52.8 m and would exceed the fixed 4.853 m post and the C# frame validation. Ball and shot flights are not clamped.','Overview cameras (wide, goal) step back by the pitch factor and show the same ball-led section as on 68 x 44, not the whole pitch; following cameras keep their player distance.'],combinations:results},null,1));
console.log('Unity v160 adapter: 4 combinations, native metres, fixed body/goal sizes, goal scene and 5 cameras passed.');
