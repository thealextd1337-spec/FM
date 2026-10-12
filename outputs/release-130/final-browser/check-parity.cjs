'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const helper=fs.readFileSync(path.resolve('work/platform/qa/unity-integration-v160.js'),'utf8'),results=[];
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl']});try{
 for(const unity of [false,true]){const page=await browser.newPage({viewport:{width:1280,height:800}});await page.goto('http://127.0.0.1:4548/?engine='+(unity?'unity':'browser'));await page.waitForFunction(()=>v61StorageReady&&window.userMeshyMatchReady);await page.evaluate(helper);
 const setup=await page.evaluate(unity=>D6QA160.setup({expansion:true,unity,replays:false,seed:160112,config:{fieldSize:'standard',fieldPlayers:5}}),unity);if(unity)assert(setup.unityReady&&!setup.error);
 const flags=await page.evaluate(()=>({keeper:match.attackFlow.keeperChaseRevision,pace:match.attackFlow.paceRevision}));assert.equal(flags.keeper,180);assert.equal(flags.pace,119);
 const end=await page.evaluate(()=>D6QA160.run({finished:true,sampleEvery:10}));assert(end.finished&&!end.unityError);const digest=await page.evaluate(()=>D6QA160.digest()),parts=await page.evaluate(()=>D6QA160Parts);assert(digest.valid===true||digest.valid?.ok===true,'Actual completed native career must validate');
 results.push({unity,setup,flags,end,digest,partsSha256:crypto.createHash('sha256').update(JSON.stringify(parts)).digest('hex')});await page.close();
 }
 assert.deepEqual(results[0].digest,results[1].digest,'Full native/P02/RNG/roles/world digest differs with production picture scheduling');assert.equal(results[0].partsSha256,results[1].partsSha256,'Full native payload differs');
 const report={checkedAt:new Date().toISOString(),pass:true,scope:'Final release130 package, complete fixed-native-tick 2D versus Unity native/P02/RNG parity. No FPS/Android/live claim.',results};fs.writeFileSync(path.join(__dirname,'parity.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({pass:true,ticks:results.map(r=>r.end.ticks),score:results[0].digest.score,digest:results[0].digest.all,payloadSHA:results[0].partsSha256}));
 }finally{await browser.close();}})().catch(e=>{fs.writeFileSync(path.join(__dirname,'parity-failure.json'),JSON.stringify({pass:false,error:String(e),results},null,2));console.error(e);process.exitCode=1;});
