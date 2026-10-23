'use strict';
// B01 (fix/mobile-jank): complete matches with fixed 0.05 s native steps (D6QAScenario: 20', pause, return live,
// halftime, 60', JSON checkpoint, final whistle) on the frozen base tree and on this tree, each in native 2D and with
// Unity. All digests of a configuration (score, events, stats, P02, ratings, world, fixtures ...) must be equal.
//   node work/check-mobile-jank-parity.cjs <baseRoot> [configs=standard-5,large-6] [ports=4256,4257]
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=path.resolve(process.argv[2]),here=path.resolve(__dirname,'..');
const configs=(process.argv[3]||'standard-5,large-6').split(',').map(c=>{const [fieldSize,n]=c.split('-');return {fieldSize,fieldPlayers:Number(n)};});
const [portBase,portNew]=(process.argv[4]||'4256,4257').split(',').map(Number);
const helper=fs.readFileSync(path.join(__dirname,'platform/qa/unity-integration-v160.js'),'utf8');
const out=path.join(here,'outputs','diag-mobile-jank');fs.mkdirSync(out,{recursive:true});
const servers=[cp.spawn(process.execPath,[path.join(__dirname,'serve-tree.cjs'),base,String(portBase)],{stdio:'ignore'}),cp.spawn(process.execPath,[path.join(__dirname,'serve-tree.cjs'),here,String(portNew)],{stdio:'ignore'})];
(async()=>{
 await new Promise(r=>setTimeout(r,1500));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:false,args:['--window-size=1000,620']});
 const results=[];let failed=false;
 try{
  for(const config of configs)for(const [tree,port] of [['base',portBase],['new',portNew]])for(const unity of [false,true]){
   const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(`http://127.0.0.1:${port}/source/index.html?engine=unity`,{timeout:120000});
   await page.waitForFunction(()=>window.D6WorldUnityContract&&window.D6Flutlicht?.adapter&&typeof v61CreateCareer==='function',{},{timeout:120000});await page.waitForTimeout(500);
   await page.evaluate(helper);
   const r=await page.evaluate(async([config,unity])=>{try{const log=await D6QAScenario(config,unity);return {digest:log.digest,unityError:unity?window.D6UnityMatch?.lastError:null,end:log.end&&{ticks:log.end.ticks,minute:log.end.minute,score:log.end.score}};}catch(e){return {error:String(e.stack||e)};}},[config,unity]);
   const row={config:`${config.fieldSize}-${config.fieldPlayers}`,tree,unity,all:r.digest?.all,score:r.digest?.score,valid:r.digest?.valid,booked:r.digest?.booked,checkpoints:r.digest?.checkpoints,hashes:r.digest?.hashes,unityError:r.unityError??null,error:r.error??null,pageErrors:errors.slice(0,5)};
   results.push(row);console.log(JSON.stringify({config:row.config,tree,unity,all:row.all,score:row.score,unityError:row.unityError,error:row.error&&row.error.slice(0,200)}));
   await page.close();
  }
  for(const config of configs){const label=`${config.fieldSize}-${config.fieldPlayers}`,rows=results.filter(r=>r.config===label),digests=[...new Set(rows.map(r=>r.all))];
   const ok=digests.length===1&&rows.every(r=>r.all&&!r.error&&!r.unityError&&r.valid&&r.booked);failed||=!ok;
   console.log((ok?'PASS ':'FAIL ')+label+' digests '+digests.join(','));}
 }finally{fs.writeFileSync(path.join(out,'parity.json'),JSON.stringify({base,results},null,1));await browser.close();servers.forEach(s=>s.kill());process.exitCode=failed?1:0;}
})();
