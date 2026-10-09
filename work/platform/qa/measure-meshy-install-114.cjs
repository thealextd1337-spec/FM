'use strict';
// When do the native-relevant flags D6UserMeshyPlayer.nativeBall/nativeShot appear after page load?
const path=require('node:path'),os=require('node:os');
const {chromium}=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 for(const engine of ['browser','unity']){const p=await b.newPage();const t0=Date.now();await p.goto('http://127.0.0.1:4521/source/index.html?engine='+engine);const dom=Date.now()-t0;
  const at=await p.evaluate(()=>new Promise(r=>{const s=performance.now();const t=setInterval(()=>{if(window.D6UserMeshyPlayer?.nativeBall!==undefined){clearInterval(t);r({ms:Math.round(performance.now()),flags:{nativeBall:D6UserMeshyPlayer.nativeBall,nativeShot:D6UserMeshyPlayer.nativeShot}})}else if(performance.now()-s>30000){clearInterval(t);r({ms:null,flags:null})}},20)}));
  console.log(engine,'load event',dom,'ms; install at',at.ms,'ms after navigation start',JSON.stringify(at.flags));await p.close();}
 await b.close();})();
