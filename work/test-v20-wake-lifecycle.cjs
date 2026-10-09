'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('dist/screen-wake-v20.js','utf8'),checks=[];
class Events {constructor(){this.events=new Map()}addEventListener(k,f){const a=this.events.get(k)||[];a.push(f);this.events.set(k,a)}emit(k){for(const f of this.events.get(k)||[])f()}}
function rig(){
 const doc=new Events(),win=new Events(),classes=new Set(),timers=new Map(),locks=[];let context=null,requested=0,released=0,legacyStarts=0,mode='normal',resolvePending;
 doc.visibilityState='visible';doc.body={classList:{contains:k=>classes.has(k)}};doc.querySelectorAll=()=>[];const game={hidden:false};
 const sentinel=()=>{const l=new Events();l.released=false;l.release=async()=>{if(l.released)return;l.released=true;released++;l.emit('release')};locks.push(l);return l};
 const sandbox={document:doc,window:win,navigator:{wakeLock:{request:async type=>{assert.equal(type,'screen');requested++;if(mode==='deny')throw Error('policy');if(mode==='pending')return new Promise(r=>resolvePending=r);return sentinel()}}},running:false,match:{finished:false},v65Context:()=>context,$:()=>game,start:()=>{legacyStarts++;sandbox.running=!sandbox.running},finishMatch:()=>{sandbox.running=false},setTimeout:f=>{const id=timers.size+1;timers.set(id,f);return id},clearTimeout:id=>timers.delete(id)};
 vm.createContext(sandbox);vm.runInContext(source,sandbox);
 return {sandbox,doc,win,classes,timers,locks,game,call:s=>vm.runInContext(s,sandbox),setContext:p=>context=p?{state:{phase:p}}:null,setMode:m=>mode=m,resolve:alreadyReleased=>{const l=sentinel();l.released=Boolean(alreadyReleased);resolvePending(l)},counts:()=>({requested,released,legacyStarts})};
}
const flush=()=>new Promise(r=>setImmediate(r));async function sync(r){r.call('syncMatchWakeLock()');await flush()}function ok(name,fn){fn();checks.push(name)}
(async()=>{
 const r=rig();r.setContext('live');r.sandbox.running=true;await sync(r);ok('Vereinswelt entry acquires without old start',()=>assert.deepEqual(r.counts(),{requested:1,released:0,legacyStarts:0}));
 for(let i=0;i<10;i++)r.call('syncMatchWakeLock()');await flush();ok('Repeated UI updates share one sentinel',()=>assert.equal(r.counts().requested,1));
 r.setContext('paused');r.sandbox.running=false;await sync(r);ok('Windowed pause releases',()=>assert.equal(r.counts().released,1));
 r.classes.add('v132-fullscreen');await sync(r);ok('Viewport fullscreen acquires even paused/halftime',()=>assert.equal(r.counts().requested,2));
 r.doc.emit('fullscreenchange');await flush();ok('Native fullscreen does not duplicate lock',()=>assert.equal(r.counts().requested,2));
 r.doc.visibilityState='hidden';r.doc.emit('visibilitychange');await flush();ok('Background releases',()=>assert.equal(r.counts().released,2));
 r.doc.visibilityState='visible';r.doc.emit('visibilitychange');await flush();ok('Visible fullscreen reacquires while paused',()=>assert.equal(r.counts().requested,3));
 r.classes.clear();await sync(r);r.setContext('live');r.sandbox.running=true;await sync(r);ok('Resume reacquires',()=>assert.equal(r.counts().requested,4));
 await r.locks.at(-1).release();ok('Platform release schedules one bounded retry',()=>assert.equal(r.timers.size,1));for(const [id,f]of r.timers){r.timers.delete(id);f()}await flush();assert.equal(r.counts().requested,5);await r.locks.at(-1).release();ok('Repeated platform release does not loop',()=>assert.equal(r.timers.size,0));
 r.sandbox.match.finished=true;r.setContext('finished');await sync(r);ok('Finished fullscreen never reacquires',()=>assert.equal(r.call('matchNeedsWakeLock()'),false));
 r.sandbox.match.finished=false;r.setContext('live');r.setMode('deny');await sync(r);ok('Rejected API leaves no lock or retry',()=>{assert.equal(r.call('matchWakeLock'),null);assert.equal(r.timers.size,0)});
 const p=rig();p.setContext('live');p.sandbox.running=true;p.setMode('pending');p.call('syncMatchWakeLock()');p.call('syncMatchWakeLock()');assert.equal(p.counts().requested,1);p.setContext(null);p.sandbox.running=false;p.call('syncMatchWakeLock()');p.resolve(false);await flush();ok('Pending acquisition after leaving releases',()=>{assert.equal(p.counts().released,1);assert.equal(p.call('matchWakeLock'),null)});
 const a=rig();a.setContext('live');a.setMode('pending');a.call('syncMatchWakeLock()');a.resolve(true);await flush();ok('Already-released pending sentinel not retained',()=>assert.equal(a.call('matchWakeLock'),null));
 const u=rig();delete u.sandbox.navigator.wakeLock;u.setContext('live');await sync(u);ok('Unsupported API preserves playable lifecycle',()=>assert.equal(u.counts().requested,0));
 const legacy=rig();legacy.call('start()');await flush();assert.equal(legacy.counts().requested,1);legacy.call('start()');await flush();ok('Existing start/pause still works',()=>assert.equal(legacy.counts().released,1));
 const w=rig();w.setContext('live');await sync(w);w.win.emit('pagehide');await flush();ok('Pagehide releases',()=>assert.equal(w.counts().released,1));
 for(const [file,needle]of [['dist/world-physical-v65.js','function v65UpdateControls(context){\n syncMatchWakeLock();'],['dist/world-goal-replay-v103.js',"document.body.classList.toggle('v132-fullscreen',active);v132ScreenMatch=active?match:null;\n syncMatchWakeLock();"]])assert(fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n').includes(needle),'Actual owner hook absent: '+file);checks.push('Actual Vereinswelt/fullscreen owner hooks present');
 const report={passed:checks.length,checks,note:'API/lifecycle regression; physical Android screen-timeout remains a device check.'};if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
})().catch(e=>{console.error(e);process.exitCode=1});
