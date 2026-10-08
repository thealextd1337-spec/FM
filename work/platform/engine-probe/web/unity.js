(async function(){
'use strict';
let instance,ready=false,state={ready:false,engine:'unity'},sequence=0;
const pending=new Map(),message=document.getElementById('message');
window.D6UnityReceive=function(raw){
 try{
  const data=typeof raw==='string'?JSON.parse(raw):raw;
  if(data.state){state=data.state;if(state.ownerId==='')state.ownerId=null;}
  if(data.stats)state.stats=data.stats;
  const request=data.id&&pending.get(data.id);
  if(data.type==='error'){
   const failure=Error(data.error||data.message||'Unity-Fehler');
   message.textContent=failure.message;message.style.display='grid';
   if(request){clearTimeout(request.timer);pending.delete(data.id);request.reject(failure);}
   return;
  }
  if(data.type==='ready'){ready=true;state.ready=true;message.style.display='none';}
  if(request){
   clearTimeout(request.timer);pending.delete(data.id);message.style.display='none';
   request.resolve(data.type==='checkpoint'?data.checkpoint:structuredClone(state));
  }
 }catch(error){message.textContent=error.message;message.style.display='grid';console.error(error);}
};
function command(name,config){
 if(!instance||!ready)return Promise.reject(Error('Unity ist noch nicht bereit'));
 const id='web-'+(++sequence);
 return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{pending.delete(id);reject(Error('Unity antwortet nicht auf '+name));},10000);
  pending.set(id,{resolve,reject,timer});
  try{instance.SendMessage('ProbeBridge','Command',JSON.stringify({id,command:name,...(config===undefined?{}:{config})}));}
  catch(error){clearTimeout(timer);pending.delete(id);reject(error);}
 });
}
window.D6Probe={
 get ready(){return ready&&Boolean(instance);},
 load:config=>command('load',config),camera:mode=>command('camera',{mode}),
 start:()=>command('start'),pause:()=>command('pause'),resume:()=>command('resume'),reset:()=>command('reset'),
 snapshot:()=>structuredClone(state),checkpoint:()=>command('checkpoint'),restore:checkpoint=>command('restore',{checkpoint}),
 stats:()=>({...state.stats,engine:'unity',elapsed:state.elapsed,players:state.actors?.length})
};
try{
 const manifest=await fetch('/unity/probe-build.json').then(r=>{if(!r.ok)throw Error('Unity-Build wird noch vorbereitet');return r.json();});
 await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=manifest.loaderUrl;script.onload=resolve;script.onerror=()=>reject(Error('Unity-Lader fehlt'));document.head.appendChild(script);});
 instance=await createUnityInstance(document.getElementById('unity-canvas'),{...manifest,devicePixelRatio:1,companyName:'Doppel 6',productName:'Lokaler Enginevergleich',productVersion:'demo-1',streamingAssetsUrl:'/unity/StreamingAssets'},p=>{message.textContent='Unity lädt · '+Math.round(p*100)+' %';});
}catch(error){message.textContent=error.message;message.style.display='grid';console.error(error);}
})();
