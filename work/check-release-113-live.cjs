'use strict';
// Fallback only when T3 explicitly reports its preview host unavailable.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const out='outputs/release-113',url='https://fussball.cakamper.at/?verify=release113-headless';
const report={release:113,url,startedAt:new Date().toISOString(),method:'Isolated headless Edge after explicit T3 preview-host disconnection',checks:[],errors:[],pass:false};
function check(name,ok){assert(ok,name);report.checks.push(name);console.log('PASS '+name);}
function uiCode(){return fs.readFileSync('work/platform/qa/native-start-v160.js','utf8').trim()
 .replace('await turn();cancelAnimationFrame(frameId);','await new Promise(resolve=>setTimeout(resolve,500));cancelAnimationFrame(frameId);')
 .replace('if(!nativeFrame)window.requestAnimationFrame=fn=>setTimeout(()=>fn(performance.now()),0);',"if(!nativeFrame)throw Error('Live RAF unavailable');");}
async function open(browser,engine='unity'){
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 page.on('pageerror',e=>report.errors.push(e.message));
 const response=await page.goto(url+'&engine='+engine,{timeout:120000});assert(response.ok());
 await page.waitForFunction(()=>window.D6WorldUnityContract&&window.D6Flutlicht?.adapter&&window.D6PlayerGeneration,null,{timeout:120000});
 check('Actual live footer 113 ('+engine+')',await page.evaluate(()=>document.querySelector('footer')?.textContent.includes('PROTOTYP 113')));
 return page;
}
async function scenario(page,unity){
 await page.evaluate(fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8'));
 await page.evaluate(flag=>QAJ('live-full-match',D6QAScenario({fieldSize:'large',fieldPlayers:6},flag)),unity);
 if(unity){
  await page.waitForFunction(()=>D6QA160.state?.minute>=2||QAR.error,null,{timeout:150000});
  await page.screenshot({path:out+'/live-unity-14-players.png'});
 }
 await page.waitForFunction(()=>QAR.done,null,{timeout:240000});
 const r=await page.evaluate(()=>QAR);assert(!r.error,r.error);
 const result=r.v,parts=await page.evaluate(()=>D6QA160Parts);
 check('Full live match booked and valid ('+(unity?'Unity':'native')+')',result.digest.finished&&result.digest.booked&&result.digest.valid);
 check('Real JSON save/restore at 60 minutes ('+(unity?'Unity':'native')+')',result.cp.saved&&result.cp.restored&&result.digest.checkpoints===1);
 if(unity){
  check('Unity acknowledges fourteen genuine players',result.setup.unityReady&&result.setup.ack.players===14&&result.setup.ack.allReal&&!result.setup.error);
  check('Live Unity pause/resume and halftime work',result.pause.phase==='paused'&&result.live.phase==='live'&&result.half.stopped==='halftime');
  check('Live Unity reloaded the saved session',result.cp.unityReady&&result.cp.loadsAfter>result.cp.loadsBefore&&!result.cp.error);
  check('Live Unity pictures and fourteen labels match native positions',result.end.stats.labels===14&&result.end.stats.maxPositionError===0&&result.end.stats.playersOutside===0&&!result.end.unityError);
 }
 return {result,parts};
}
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  let page=await open(browser,'browser');
  const ui=await page.evaluate(uiCode());
  check('Normal DE/EN creation, preview, export/import and real animation frames',ui.checks.length===14&&ui.nativeAnimationFrames);
  report.ui=ui;
  await page.reload({timeout:120000});
  const reload=await page.evaluate(async id=>{await v61WaitForStorage();const c=v61ReadCareers().find(c=>c.id===id);if(!c)throw Error('Imported career missing after real reload');const r={reload:v61ValidateCareer(c),config:c.world.matchConfig,model:c.world.playerFoundation.parameterId};await v61DeleteCareer(id);return r;},ui.id);
  check('Actual live reload retains configuration and regular model',reload.reload&&reload.config.fieldSize==='large'&&reload.config.fieldPlayers===5&&reload.model==='native-player-v160-1');report.reload=reload;
  await page.close();page=await open(browser);
  const unity=await scenario(page,true);report.unity=unity.result;await page.close();
  page=await open(browser,'browser');const native=await scenario(page,false);report.native=native.result;
  assert.deepEqual(unity.parts,native.parts);check('Exact complete live Unity/native parity including world, reports, P02/P03 and finances',true);
  report.partNames=Object.keys(unity.parts);
  const previous=JSON.parse(fs.readFileSync('outputs/platform/unity-native-v160/final-qa.json','utf8')).parity.large6;
  check('All thirteen live parts and the complete world match Claudes local build',Object.entries(previous.parts).every(([key,value])=>unity.result.digest.hashes[key]===value)&&unity.result.digest.hashes.world===previous.unity.world);
  check('No browser script errors',report.errors.length===0);report.pass=true;
 }finally{await browser.close();}
 report.finishedAt=new Date().toISOString();fs.writeFileSync(out+'/live-browser.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({pass:true,checks:report.checks.length,digest:report.unity.digest.all}));
})().catch(e=>{report.failure=e.stack;fs.writeFileSync(out+'/live-browser.json',JSON.stringify(report,null,2)+'\n');console.error(e);process.exitCode=1;});
