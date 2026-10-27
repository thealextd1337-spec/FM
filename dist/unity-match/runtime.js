/* D6_VIEW_FRAME_SCHEDULER_BEGIN */
(function(root){
 'use strict';
 if(root.D6ViewFramePump)return;
 // Picture pacing only. Match clocks, contacts and saved state have no reader
 // or writer here. Inactive views use the browser's native frame callbacks.
 const nativeRequest=root.requestAnimationFrame.bind(root),nativeCancel=root.cancelAnimationFrame.bind(root),pending=new Map(),period=1000/60;
 let enabled=false,away=false,sequence=0,raf=0,timer=0,generation=0,scheduled=false,dispatching=false,lastFrame=null,deadline=0,fallbacks=0,lastNative=null,nativeGap=null,skipped=0;
 function eligible(){
  if(away||root.document.hidden)return false;
  if(enabled)return true;
  try{return root.parent!==root&&root.parent.location.origin===root.location.origin&&Boolean(root.document.getElementById('unity-canvas'))&&root.parent.D6ViewFramePump?.enabled;}catch{return false;}
 }
 function clear(){if(raf)nativeCancel(raf);root.clearTimeout(timer);raf=timer=0;scheduled=false;generation++;}
 function schedule(){if(away||scheduled||dispatching||!pending.size)return;scheduled=true;const token=++generation;raf=nativeRequest(t=>fire(t,false,token));if(!eligible())return;const now=root.performance.now();deadline=lastFrame===null?now+period:lastFrame+period;arm(token);}
 function arm(token){timer=root.setTimeout(()=>{if(!scheduled||token!==generation)return;if(!eligible()){timer=0;return;}const now=root.performance.now();if(now<due()-2){arm(token);return;}fire(now,true,token);},Math.min(8,Math.max(0,due()-root.performance.now())));}
 // B01: regular native frames (at least ~48/s) are not overtaken; the fallback waits until one is really missing.
 function due(){return nativeGap!==null&&nativeGap<=period*1.25&&root.performance.now()-lastNative<100?Math.max(deadline,lastNative+period*1.5):deadline;}
 // B01: at most one callback per screen frame. A native frame sooner than the period after the last callback (the
 // fallback of the same screen frame, 120 Hz screens) waits for the next one.
 function fire(time,fallback,token){if(!scheduled||token!==generation)return;if(fallback&&!eligible())return;
  if(!fallback){if(lastNative!==null){const gap=time-lastNative;nativeGap=gap>0&&gap<100?gap:null;}lastNative=time;
   if(lastFrame!==null&&eligible()&&time-lastFrame<period-2){skipped++;raf=nativeRequest(t=>fire(t,false,token));return;}}
  clear();lastFrame=time;if(fallback)fallbacks++;const ids=[...pending.keys()];dispatching=true;
  try{for(const id of ids){const callback=pending.get(id);if(!callback)continue;pending.delete(id);try{callback(time);}catch(error){if(typeof root.reportError==='function')root.reportError(error);else root.setTimeout(()=>{throw error;},0);}}}finally{dispatching=false;schedule();}
 }
 root.requestAnimationFrame=function(callback){if(typeof callback!=='function')throw new TypeError('Frame callback must be a function');const id=++sequence;pending.set(id,callback);schedule();return id;};
 root.cancelAnimationFrame=function(id){pending.delete(id);if(!pending.size&&!dispatching)clear();};
 root.document.addEventListener('visibilitychange',()=>{clear();lastFrame=lastNative=nativeGap=null;schedule();});root.addEventListener('pagehide',()=>{away=true;clear();});root.addEventListener('pageshow',()=>{away=false;clear();lastFrame=null;schedule();});
 root.D6ViewFramePump={version:130,setEnabled(value){const next=Boolean(value);if(next===enabled)return;enabled=next;clear();lastFrame=null;schedule();},get enabled(){return enabled&&!away&&!root.document.hidden;},get fallbacks(){return fallbacks;},get skipped(){return skipped;},get pending(){return pending.size;}};
})(window);
/* D6_VIEW_FRAME_SCHEDULER_END */
(async function(){
 'use strict';
 const channel='d6-world-view-1',fileParent=new URLSearchParams(location.search).get('parent')==='file',origin=fileParent?'null':location.origin;
 let instance=null,ready=false,session='',loading=false;
 // file: parents have an opaque origin. A response still targets only this
 // iframe's parent, and the receiver also verifies its exact source window.
 const send=body=>parent.postMessage({channel,session,...body},fileParent?'*':origin);
 // Pointer events inside an iframe do not bubble to the pitch overlay. Let a
 // real tap reveal presentation controls without forwarding any match input.
 document.addEventListener('pointerdown',()=>{if(ready&&session)send({kind:'interaction'});},{passive:true});
 const failure=error=>send({kind:'error',message:error?.message||String(error)});
 window.addEventListener('error',event=>failure(event.error||event.message));
 function announce(){if(instance&&ready)send({kind:'ready'});}
 window.D6UnityReceive=function(raw){
  try{const data=typeof raw==='string'?JSON.parse(raw):raw;if(data.type==='ready'){ready=true;announce();}else if(data.channel===channel)send(data);else if(data.type==='error')failure(data.error);}catch(error){failure(error);}
 };
 window.addEventListener('message',event=>{
  if(event.origin!==origin||event.source!==parent||event.data?.channel!==channel)return;
  try{
   const data=event.data;if(!ready||!instance)return;
   if(data.kind==='load'){
    if(loading||session&&data.session!==session)return;
    if(data.session!==data.config?.session)throw Error('Invalid Unity match session');
    loading=true;session=data.session;
    instance.SendMessage('ProbeBridge','WorldCommand',JSON.stringify({kind:'load',config:data.config}));loading=false;
   }else if(data.kind==='frame'&&data.session===session&&data.frame?.session===session){instance.SendMessage('ProbeBridge','WorldCommand',JSON.stringify({kind:'frame',frame:data.frame}));}
  }catch(error){loading=false;failure(error);}
 });
 try{
  const response=await fetch('/unity/probe-build.json',{cache:'no-store'});if(!response.ok)throw Error('Unity-Build ist lokal nicht verfügbar');
  const manifest=await response.json();if(!manifest.worldView||manifest.worldView!==channel)throw Error('Unity-Build unterstützt diese Partie noch nicht');
  await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=manifest.loaderUrl;script.onload=resolve;script.onerror=()=>reject(Error('Unity-Lader fehlt'));document.head.append(script);});
  instance=await createUnityInstance(document.getElementById('unity-canvas'),{...manifest,devicePixelRatio:1,companyName:'Doppel 6',productName:'Vereinswelt',productVersion:'137',streamingAssetsUrl:'/unity/StreamingAssets',showBanner:(message,type)=>{if(type==='error')failure(message);}},progress=>send({kind:'progress',progress}));announce();
 }catch(error){failure(error);}
})();
