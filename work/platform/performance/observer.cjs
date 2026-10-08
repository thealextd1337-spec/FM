'use strict';
// Synchronous wrappers preserve arguments, receiver, return values and exceptions.
// Timings are nested/inclusive, never an additive CPU breakdown or GPU timing.
function installObserver({native=true,detailed=true}={}){
 const data={rafMs:[],drawIntervalsMs:[],cpuMs:{},longTasks:[],visibility:[],started:performance.now()},undo=[];
 let previousRaf=null,previousDraw=null,raf=0,active=true;
 function loop(now){if(previousRaf!==null)data.rafMs.push(now-previousRaf);previousRaf=now;if(active)raf=requestAnimationFrame(loop)}
 raf=requestAnimationFrame(loop);
 const visibility=()=>data.visibility.push({at:performance.now(),hidden:document.hidden});document.addEventListener('visibilitychange',visibility);
 let observer;try{observer=new PerformanceObserver(list=>{for(const x of list.getEntries())data.longTasks.push({startTime:x.startTime,duration:x.duration})});observer.observe({type:'longtask',buffered:false})}catch{}
 function wrap(object,key,label,draw=false){const original=object[key];if(typeof original!=='function')return;data.cpuMs[label]=[];
  object[key]=function(...args){const start=performance.now();try{return original.apply(this,args)}finally{const end=performance.now();data.cpuMs[label].push(end-start);if(draw){if(previousDraw!==null)data.drawIntervalsMs.push(start-previousDraw);previousDraw=start}}};
  undo.push(()=>{object[key]=original});
 }
 if(native&&detailed){
  wrap(window,'step','simulationStepInclusive');wrap(window,'v65AfterStep','postSimulationInclusive');
  wrap(window,'v98RenderScene','sceneCaptureAndAnimationInclusive');
  if(typeof v98Scene!=='undefined'&&v98Scene?.renderer)wrap(v98Scene.renderer,'render','rendererSubmissionCpu',true);
 }
 window.__D6Measure={data,finish(){active=false;cancelAnimationFrame(raf);observer?.disconnect();document.removeEventListener('visibilitychange',visibility);for(const restore of undo)restore();data.ended=performance.now();return data}};
}
module.exports={installObserver};
