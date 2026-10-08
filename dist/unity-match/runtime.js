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
  instance=await createUnityInstance(document.getElementById('unity-canvas'),{...manifest,devicePixelRatio:1,companyName:'Doppel 6',productName:'Vereinswelt',productVersion:'local-151',streamingAssetsUrl:'/unity/StreamingAssets',showBanner:(message,type)=>{if(type==='error')failure(message);}},progress=>send({kind:'progress',progress}));announce();
 }catch(error){failure(error);}
})();
