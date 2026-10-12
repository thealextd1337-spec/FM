(function(root){
 'use strict';
 if(root.D6ViewFramePump)return;
 // Picture pacing only. Match clocks, contacts and saved state have no reader
 // or writer here. Inactive views use the browser's native frame callbacks.
 const nativeRequest=root.requestAnimationFrame.bind(root),nativeCancel=root.cancelAnimationFrame.bind(root),pending=new Map(),period=1000/60;
 let enabled=false,away=false,sequence=0,raf=0,timer=0,generation=0,scheduled=false,dispatching=false,lastFrame=null,deadline=0,fallbacks=0;
 function eligible(){
  if(away||root.document.hidden)return false;
  if(enabled)return true;
  try{return root.parent!==root&&root.parent.location.origin===root.location.origin&&Boolean(root.document.getElementById('unity-canvas'))&&root.parent.D6ViewFramePump?.enabled;}catch{return false;}
 }
 function clear(){if(raf)nativeCancel(raf);root.clearTimeout(timer);raf=timer=0;scheduled=false;generation++;}
 function schedule(){if(away||scheduled||dispatching||!pending.size)return;scheduled=true;const token=++generation;raf=nativeRequest(t=>fire(t,false,token));if(!eligible())return;const now=root.performance.now();deadline=lastFrame===null?now+period:lastFrame+period;arm(token);}
 function arm(token){timer=root.setTimeout(()=>{if(!scheduled||token!==generation)return;if(!eligible()){timer=0;return;}const now=root.performance.now();if(now<deadline-2){arm(token);return;}fire(now,true,token);},Math.min(8,Math.max(0,deadline-root.performance.now())));}
 function fire(time,fallback,token){if(!scheduled||token!==generation)return;if(fallback&&!eligible())return;clear();lastFrame=time;if(fallback)fallbacks++;const ids=[...pending.keys()];dispatching=true;
  try{for(const id of ids){const callback=pending.get(id);if(!callback)continue;pending.delete(id);try{callback(time);}catch(error){if(typeof root.reportError==='function')root.reportError(error);else root.setTimeout(()=>{throw error;},0);}}}finally{dispatching=false;schedule();}
 }
 root.requestAnimationFrame=function(callback){if(typeof callback!=='function')throw new TypeError('Frame callback must be a function');const id=++sequence;pending.set(id,callback);schedule();return id;};
 root.cancelAnimationFrame=function(id){pending.delete(id);if(!pending.size&&!dispatching)clear();};
 root.document.addEventListener('visibilitychange',()=>{clear();lastFrame=null;schedule();});root.addEventListener('pagehide',()=>{away=true;clear();});root.addEventListener('pageshow',()=>{away=false;clear();lastFrame=null;schedule();});
 root.D6ViewFramePump={version:130,setEnabled(value){const next=Boolean(value);if(next===enabled)return;enabled=next;clear();lastFrame=null;schedule();},get enabled(){return enabled&&!away&&!root.document.hidden;},get fallbacks(){return fallbacks;},get pending(){return pending.size;}};
})(window);
