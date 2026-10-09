'use strict';
// Pure protocol/parser checks: no ADB, socket connection, browser or build mutation.
const assert=require('node:assert/strict'),test=require('node:test'),fs=require('node:fs'),path=require('node:path');
const {CdpRpc,OwnedPage,displayState,parseOptions}=require('./android-3d-acceptance.cjs');
class Socket extends EventTarget {constructor(){super();this.sent=[];}send(raw){this.sent.push(JSON.parse(raw));}reply(value){this.dispatchEvent(new MessageEvent('message',{data:JSON.stringify(value)}));}close(){this.dispatchEvent(new Event('close'));}}
test('RPC correlates out-of-order responses, ignores events and rejects wrong session',async()=>{
 const s=new Socket(),r=new CdpRpc(s),a=r.send('Runtime.evaluate',{},'own'),b=r.send('Page.enable',{},'own');
 s.reply({method:'Target.attachedToTarget',params:{}});s.reply({id:2,sessionId:'own',result:{b:1}});s.reply({id:1,sessionId:'own',result:{a:1}});
 assert.deepEqual(await a,{a:1});assert.deepEqual(await b,{b:1});
 const wrong=r.send('Runtime.evaluate',{},'own');s.reply({id:3,sessionId:'foreign',result:{}});await assert.rejects(wrong,/session mismatch/);r.close();
});
test('RPC rejects CDP errors, bounded timeouts and all pending work on disconnect',async()=>{
 const s=new Socket(),r=new CdpRpc(s),error=r.send('Page.navigate',{},'own');s.reply({id:1,sessionId:'own',error:{code:-32000,message:'navigation refused'}});await assert.rejects(error,/navigation refused/);
 const timed=r.send('Runtime.evaluate',{},'own',10);await assert.rejects(timed,/method timeout/);s.reply({id:2,sessionId:'own',result:{late:true}});assert.equal(r.pending.size,0);
 const pending=r.send('Page.enable',{},'own');r.close();await assert.rejects(pending,/disconnected/);await assert.rejects(r.send('Page.enable'),/closed/);
});
test('Owned page attaches/closes only newly returned target; page commands use its session',async()=>{
 const calls=[],rpc={send:async(method,params,session)=>{calls.push({method,params,session});if(method==='Target.createTarget')return {targetId:'created-by-runner'};if(method==='Target.attachToTarget')return {sessionId:'own-session'};if(method==='Runtime.evaluate')return {result:{type:'number',value:14}};if(method==='Target.closeTarget')return {success:true};return {};}};
 const p=new OwnedPage(rpc,'http://localhost:4444');await p.init();assert.equal(await p.evaluate(()=>14),14);await p.close();
 assert.deepEqual(calls.filter(c=>c.method.startsWith('Target.')).map(c=>({method:c.method,target:c.params.targetId})),[{method:'Target.createTarget',target:undefined},{method:'Target.attachToTarget',target:'created-by-runner'},{method:'Target.closeTarget',target:'created-by-runner'}]);
 assert(calls.filter(c=>c.method==='Page.enable'||c.method==='Runtime.evaluate').every(c=>c.session==='own-session'));
 assert.throws(()=>p.send('Target.getTargets'),/outside/);assert.throws(()=>p.locator('body'),/Only/);await assert.rejects(p.goto('https://example.com'),/outside/);
 assert(!calls.some(c=>/setAutoAttach|getTargets|setDiscoverTargets|Browser.close/.test(c.method)));
});
test('Failed owned attach retains its own target for cleanup; evaluation exceptions are failures',async()=>{
 const calls=[],rpc={send:async(method,params)=>{calls.push({method,params});if(method==='Target.createTarget')return {targetId:'owned'};if(method==='Target.attachToTarget')throw Error('attach failed');if(method==='Target.closeTarget')return {success:true};if(method==='Runtime.evaluate')return {exceptionDetails:{text:'script failed'}};return {};}};
 const p=new OwnedPage(rpc,'http://localhost:4444');await assert.rejects(p.init(),/attach failed/);await p.close();assert.equal(calls.at(-1).params.targetId,'owned');p.sessionId='own';await assert.rejects(p.evaluate('bad()'),/script failed/);
});
test('Late target-creation response after timeout cannot claim verified cleanup',async()=>{
 const s=new Socket(),r=new CdpRpc(s),bounded={send:(method,params,session)=>r.send(method,params,session,10)},p=new OwnedPage(bounded,'http://localhost:4444');
 await assert.rejects(p.init(),/Target.createTarget/);s.reply({id:1,result:{targetId:'late-owned-target'}});assert.equal(p.targetId,null);assert.equal(p.creationUncertain,true);await p.close();assert.equal(p.creationUncertain,true);assert.equal(s.sent.length,1);r.close();
});
test('Screenshot uses only owned session and manual window is optional/bounded',async()=>{
 const calls=[],p=new OwnedPage({send:async(...args)=>{calls.push(args);return {data:'png'};}},'http://localhost:4444');p.sessionId='own-session';await p.send('Page.captureScreenshot',{format:'png'});assert.equal(calls[0][2],'own-session');assert.equal(parseOptions(['--run'])['manual-seconds'],0);assert.equal(parseOptions(['--run','--manual-seconds','180'])['manual-seconds'],180);for(const value of ['-1','181','1.5','NaN'])assert.throws(()=>parseOptions(['--run','--manual-seconds',value]),/manual-seconds/);
});
const controller=(id,state)=>`Display Power Controller:\n  mDisplayId=${id}\nDisplay Power Controller Locked State:\nDisplay Power Controller Configuration:\nDisplay Power Controller Thread State:\n  mDisplayId=${id}\nDisplay Power State:\n  mScreenState=${state}\nHistorical events:\n  state=ON\n`;
test('Display parser uses current default-display controller, rejects history/ambiguity',()=>{
 assert.equal(displayState(controller(1,'ON')+controller(0,'DOZE')),'DOZE');
 assert.equal(displayState(controller(0,'ON')+controller(1,'OFF')),'ON');
 assert.equal(displayState('Historical events:\n  mScreenState=ON\n'),null);
 assert.equal(displayState(controller(0,'ON')+controller(0,'OFF')),null);
 assert.equal(displayState(controller(0,'ON').replace('mScreenState=ON','state=ON')),null);
 assert.equal(displayState(controller(0,'ON').replace('  mScreenState=ON','  mScreenState=ON\n  mScreenState=OFF')),null);
});
test('Sanitized current physical-device display fixture decodes ON when present',()=>{
 const fixture=path.resolve(__dirname,'../../../outputs/3d-quality/android-device-prerequisites/display-current-fields.txt');
 if(fs.existsSync(fixture))assert.equal(displayState(fs.readFileSync(fixture,'utf8')),'ON');
});
