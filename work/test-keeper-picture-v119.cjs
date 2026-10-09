'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const C=require('../dist/world-unity-v151.js'),checks=[];
function check(name,fn){fn();checks.push(name)}
const camera={position:{x:0,z:25},target:{x:0,z:0},fov:42};
function frame(turned=false){return {clock:10,elapsed:10,turned,owner:'k',ballInFlight:false,ball:{x:4,z:3,height:1.35},players:[{id:'k',team:0,keeper:true,x:1,z:2,number:1,movement:{mode:'running',facing:{x:-7,z:-4}},action:{kind:'save',saved:true,parry:false,goal:false,progress:1,recovery:.2,contactWorld:{x:4,z:3,height:1.35}}}]};}
const picture=f=>C.picture(f,'qa',1,camera,'paused',[0,0]);
for(const turned of [false,true])for(const scale of [1,1.2]){
 const f=frame(turned),s=C.scaled(f,{length:68*scale,width:44*scale,goalWidth:7.32});
 check('Goal-kick target beats stale heading '+turned+'/'+scale,()=>{s.players[0].action={kind:'goalKick',phase:'waiting',targetWorld:{x:8*scale,z:9*scale}};const d=picture(s).players[0].facing;assert(d[0]>0&&d[2]>0)});
 check('Ordinary keeper watches ball '+turned+'/'+scale,()=>{s.players[0].action={kind:'idle'};const d=picture(s).players[0].facing;assert(d[0]>0&&d[2]>0)});
 check('Save watches existing contact '+turned+'/'+scale,()=>{const d=picture(C.scaled(f,{length:68*scale,width:44*scale,goalWidth:7.32})).players[0].facing;assert(d[0]>0&&d[2]>0)});
}
check('Scaling preserves actual outlet and input',()=>{const f=frame(),before=JSON.stringify(f);f.players[0].action.targetWorld={x:6,z:8};const input=JSON.stringify(f),s=C.scaled(f,{length:81.6,width:52.8,goalWidth:7.32});assert(Math.abs(s.players[0].action.targetWorld.x-7.2)<1e-9);assert(Math.abs(s.players[0].action.targetWorld.z-9.6)<1e-9);assert.equal(JSON.stringify(f),input);assert(before!==input)});
check('Completed confirmed owner catch explicitly anchors visible ball',()=>{const f=frame(),before=JSON.stringify(f);assert.equal(picture(f).players[0].ballHeld,true);assert.equal(JSON.stringify(f),before);assert.deepEqual(picture(f),picture(JSON.parse(before)))});
for(const [name,edit,expected] of [
 ['parry',f=>f.players[0].action.parry=true,false],['goal',f=>f.players[0].action.goal=true,false],['flight',f=>f.ballInFlight=true,false],['ownerchange',f=>f.owner='other',false],['incomplete',f=>{f.players[0].action.progress=.5;f.players[0].action.recovery=0},false],['follow',f=>f.players[0].action={kind:'goalKick',held:true,phase:'follow'},undefined],['unknownparry',f=>delete f.players[0].action.parry,undefined],['unknownflight',f=>delete f.ballInFlight,undefined],['outfield',f=>f.players[0].keeper=false,undefined]
])check('Release or reject visual hold: '+name,()=>{const f=frame();edit(f);assert.equal(picture(f).players[0].ballHeld,expected)});
const source=fs.readFileSync('dist/world-pitch-actions-v99.js','utf8'),start=source.indexOf('function v99PlayerAction('),end=source.indexOf('// Keep the goal view',start);
check('Real challenge producer states no parry without altering native event',()=>{const event={kind:'save',id:'pickup:10',saved:true,goal:false,progress:1},context=vm.createContext({v115KeeperChallengeAction:()=>event});vm.runInContext(source.slice(start,end),context);const before=JSON.stringify(event);const a=context.v99PlayerAction({finished:false},{});assert.equal(a.parry,false);assert.equal(JSON.stringify(event),before);assert.notEqual(a,event)});
check('Explicit action facing remains authoritative',()=>{const f=frame();f.players[0].action.facing={x:0,z:-1};assert.deepEqual(picture(f).players[0].facing,[0,0,-1])});
for(const turned of [false,true])check('Free kick follows projected goal rather than old running direction '+turned,()=>{const f=frame(turned);f.players[0].keeper=false;f.players[0].action={kind:'freeKick',targetWorld:{x:turned?-20:20,z:2}};const before=JSON.stringify(f),d=picture(f).players[0].facing;assert.equal(Math.sign(d[0]),turned?-1:1);assert.equal(d[2],0);assert.equal(JSON.stringify(f),before)});
const files=['dist/world-unity-v151.js','dist/world-pitch-actions-v99.js'];const out='outputs/3d-quality/iteration-119';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/bridge-tests.json',JSON.stringify({pass:true,checks,sourceHashes:Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]))},null,2)+'\n');console.log(JSON.stringify({pass:true,checks:checks.length}));
