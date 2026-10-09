'use strict';
// Screenshots of a real club-world match rendered by a Unity WebGL build in
// every camera perspective. Usage:
//   node work/platform/qa/shot-unity-visuals.cjs <label> [unity build dir]
// Writes outputs/platform/unity-visuals/<label>/<camera>.png
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=path.resolve(__dirname,'../../..'),label=process.argv[2]||'current';
// Optional: D6_SHOT_MODES=follow,goal  D6_SHOT_NEAR=0..100 (default 55)
const modes=(process.env.D6_SHOT_MODES||'follow,wide,sideline,diagonal,goal').split(','),near=Number(process.env.D6_SHOT_NEAR||55);
const unityRoot=path.resolve(base,process.argv[3]||'outputs/platform/unity-web'),out=path.join(base,'outputs/platform/unity-visuals',label);fs.mkdirSync(out,{recursive:true});
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.glb':'model/gltf-binary','.wav':'audio/wav','.wasm':'application/wasm','.data':'application/octet-stream'};
const server=http.createServer((req,res)=>{
 const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname),unity=rel.startsWith('/unity/'),root=unity?unityRoot:path.join(base,'dist');
 const file=path.resolve(root,rel.slice(unity?7:8));
 if(!(unity||rel.startsWith('/source/'))||!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
 if(path.basename(file)==='index.html'&&!unity){res.end(fs.readFileSync(file,'utf8').replace('<head>','<head><script>window.D6UnityMatchUrl="/source/unity-match/runtime.html";</script>'));return;}
 fs.createReadStream(file).pipe(res);
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}/source/index.html?engine=unity`;
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=d3d11','--enable-gpu']});
 const errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950},deviceScaleFactor:Number(process.env.D6_SHOT_SCALE||1)});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  for(const mode of modes){
   await page.addInitScript(([m,n])=>localStorage.setItem('doppel6.camera.v159',JSON.stringify({mode:m,near:n})),[mode,near]);
   await page.goto(url);await page.waitForFunction(()=>window.userMeshyMatchReady&&window.D6UnityMatch,{},{timeout:60000});
   await page.evaluate(async()=>{const c=v61CreateCareer('GER-2','visual-iteration'),club=v66Own(c);v66ChooseSponsor(c,club.id,club.sponsors[0].id);v124SetYouthBudget(c,0);while(c.world.market.phase==='open')await v66NextMarketDay(c);const f=v62Fixtures(c).find(f=>!f.result&&f.homeId===club.id);c.world.activeMatch={fixtureId:f.id,state:v64MakeState(c,f)};v61CurrentCareer=c;c.world.activeMatch.state.phase='paused';v98View='3d';v65Show(v65Context());clearInterval(v65WorldFrame);});
   await page.waitForFunction(()=>D6UnityMatch.ready,{},{timeout:180000});
   // Play a few seconds of the real match so players spread out and move.
   await page.evaluate(()=>{v65Resume();clearInterval(v65WorldFrame);for(let i=0;i<200;i++){step(.05*MATCH_SPEED,.05);v65AfterStep(v65Context());}hideOverlay();draw();});
   await page.waitForTimeout(2500);
   const host=await page.$('#d6-unity-host');await (host||page).screenshot({path:path.join(out,mode+'.png')});console.log('shot',mode);
   // Optional close-ups below the first visible name labels (D6_SHOT_CLOSEUPS=n).
   const labels=await page.$$eval('#d6-unity-labels button:not([hidden])',list=>list.map(b=>{const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height,name:b.textContent.trim()};}));
   for(const [n,label] of labels.slice(0,Number(process.env.D6_SHOT_CLOSEUPS||0)).entries())await page.screenshot({path:path.join(out,mode+'-closeup-'+n+'.png'),clip:{x:Math.max(0,label.x-70),y:Math.max(0,label.y-4),width:140,height:190}});
  }
 }finally{await browser.close();server.close();fs.writeFileSync(path.join(out,'errors.json'),JSON.stringify(errors,null,1));console.log('errors',errors.length);}
})().catch(e=>{console.error(e);process.exit(1);});
