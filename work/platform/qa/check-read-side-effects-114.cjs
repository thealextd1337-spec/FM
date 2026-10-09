'use strict';
// Which read-only looking call changes the native match? Native 2D, seeded
// D6QAScenario; one candidate read is called after every 3rd native step.
// usage: node check-read-side-effects-114.cjs [config=large-5] [candidates]
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const name=process.argv[2]||'large-5',[size,players]=name.split('-'),config=size==='legacy'?null:{fieldSize:size,fieldPlayers:Number(players)};
const candidates=(process.argv[3]||'none,context,fixtures,activeFixture,worldJson,people').split(',');
const helper=fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8');
async function run(browser,mode){
 const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4521/source/index.html?engine=browser');await p.evaluate(helper);
 await p.evaluate(m=>{let n=0;const reads={context:()=>v65Context(),fixtures:()=>v62Fixtures(D6QA160.career).filter(f=>f.result).length,activeFixture:()=>v64ActiveFixture(D6QA160.career),worldJson:()=>JSON.stringify(D6QA160.career.world).length,people:()=>match.people.map(p=>p.pid).length};
  const outer=step;step=function(...a){const r=outer.apply(this,a);if(m!=='none'&&match&&++n%3===0){const random=Math.random;Math.random=()=>0.5;try{reads[m]()}finally{Math.random=random}}return r;};},mode);
 await p.evaluate(c=>QAJ('s',D6QAScenario(c,false)),config);
 await p.waitForFunction(()=>window.QAR?.done,null,{timeout:900000,polling:500});
 const r=await p.evaluate(()=>window.QAR);await p.close();if(r.error)throw Error(mode+': '+r.error);
 return {mode,digest:r.v.digest,errors};
}
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{const runs=[];for(const m of candidates){const r=await run(browser,m);runs.push(r);const ref=runs[0].digest,diff=Object.keys(ref.hashes).filter(k=>ref.hashes[k]!==r.digest.hashes[k]);console.log(m.padEnd(13),'all',r.digest.all,'score',JSON.stringify(r.digest.score),diff.length?'DIFF: '+diff.join(','):'equal',r.errors.length?r.errors:'');}
  fs.writeFileSync(`outputs/release-114/read-side-effects-${name}.json`,JSON.stringify({config:name,runs},null,1)+'\n');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
