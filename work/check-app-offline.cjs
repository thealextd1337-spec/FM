'use strict';
// Installed-app check (Android TWA path) against the local build: web manifest and icons load, the service worker
// takes control, an offline reload still opens the game and a Unity match, and back online the page is fresh again
// (network-first, no stale release). A proxy marks each page response with a revision to tell cache from network.
//   node work/build.cjs && node work/check-app-offline.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http');
const runtime=path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node');
if(Number(process.versions.node.split('.')[0])<20){const result=require('node:child_process').spawnSync(path.join(runtime,'bin/node.exe'),[__filename,...process.argv.slice(2)],{stdio:'inherit'});process.exit(result.status??1);}
const {chromium}=require(path.join(runtime,'node_modules/playwright'));
const release=fs.readFileSync('dist/index.html','utf8').match(/data-d6-release="(\d+)"/)[1];
const treePort=4263,port=4264,site=`http://127.0.0.1:${port}/`;
let revision=1;
(async()=>{
 const tree=require('node:child_process').spawn(process.execPath,['work/serve-tree.cjs','.',String(treePort)],{stdio:['ignore','pipe','inherit']});
 await new Promise(resolve=>tree.stdout.once('data',resolve));
 const proxy=http.createServer(async(req,res)=>{
  const upstream=await fetch(`http://127.0.0.1:${treePort}${req.url}`);
  const headers=Object.fromEntries([...upstream.headers].filter(([name])=>!['content-length','content-encoding','transfer-encoding','connection'].includes(name)));
  let body=Buffer.from(await upstream.arrayBuffer());
  if(new URL(req.url,site).pathname==='/')body=Buffer.from(body.toString('utf8').replace('<head>',`<head><meta name="d6-revision" content="${revision}">`));
  res.writeHead(upstream.status,headers);res.end(body);
 }).listen(port,'127.0.0.1');
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:false,args:['--window-size=1000,620']});
 try{
  const context=await browser.newContext({viewport:{width:915,height:412},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'de-DE'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const ready=()=>page.waitForFunction(()=>typeof v61StorageReady!=='undefined'&&v61StorageReady&&window.D6WorldUnityContract&&typeof v61CreateCareer==='function',null,{timeout:180000});
  const state=()=>page.evaluate(()=>({release:document.documentElement.dataset.d6Release,revision:document.querySelector('meta[name=d6-revision]')?.content??null,controlled:!!navigator.serviceWorker.controller}));
  const unity=async()=>{await page.evaluate(fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8'));
   return page.evaluate(()=>D6QA160.setup({config:{fieldSize:'standard',fieldPlayers:5},unity:true,replays:false}));};
  await page.goto(site+'?d6sw=1',{timeout:180000});await ready();
  const app=await page.evaluate(async()=>{const link=document.querySelector('link[rel=manifest]');const manifest=await (await fetch(link.href)).json();
   const icons=[];for(const icon of manifest.icons){const response=await fetch(new URL(icon.src,link.href));const image=await createImageBitmap(await response.blob());icons.push({src:icon.src,size:image.width+'x'+image.height,declared:icon.sizes});}
   return {manifest,icons};});
  assert.equal(app.manifest.start_url,'/');assert.equal(app.manifest.display,'standalone');
  for(const icon of app.icons)assert.equal(icon.size,icon.declared,icon.src);
  assert.ok(app.icons.some(icon=>icon.size==='512x512'));console.log('PASS manifest and icons '+JSON.stringify(app.icons));
  for(const file of JSON.parse(fs.readFileSync('work/app-files.json','utf8'))){const response=await fetch(site+file);assert.equal(response.status,200,file);}
  console.log('PASS app files served');
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:60000});
  const online=await unity();assert.ok(online.unityReady,'Unity ready online');
  // Cache writes run in the worker's waitUntil; wait until the page and the four Unity build files are stored.
  const cached=()=>page.evaluate(async()=>{const keys=(await (await caches.open('doppel6-offline-1')).keys()).map(r=>new URL(r.url).pathname);
   return keys.includes('/')&&['loader.js','data','framework.js','wasm'].every(ext=>keys.includes('/unity/Build/unity-web.'+ext));});
  for(let i=0;!await cached();i++){assert.ok(i<120,'page and Unity build cached');await new Promise(r=>setTimeout(r,1000));}
  console.log('PASS worker controls the page and cached page and Unity build');
  await context.setOffline(true);revision=2;
  await page.reload({timeout:180000});await ready();
  const offline=await state();assert.deepEqual(offline,{release,revision:'1',controlled:true});
  const offlineUnity=await unity();assert.ok(offlineUnity.unityReady,'Unity ready offline');
  console.log('PASS offline start opens release '+release+' and a Unity match');
  await context.setOffline(false);revision=3;
  await page.reload({timeout:180000});await ready();
  assert.deepEqual(await state(),{release,revision:'3',controlled:true});console.log('PASS online again: the page comes from the network');
  assert.deepEqual(errors,[]);
 }finally{await browser.close();proxy.close();tree.kill();}
})().catch(error=>{console.error(error);process.exitCode=1;});
