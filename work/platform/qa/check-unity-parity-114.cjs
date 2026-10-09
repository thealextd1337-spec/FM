'use strict';
// Release 114: complete native/Unity parity with the current native code
// (incl. the free-kick fix) and the Unity clock gate. Each configuration runs
// the fixed D6QAScenario sequence (20', pause, review return, halftime, 60',
// real JSON checkpoint, final whistle) once with Unity and once in native 2D;
// digests must be identical. Uses the unchanged 113 helper unity-integration-v160.js.
// usage: node check-unity-parity-114.cjs [base] [configs=all|legacy,large-5,...] [modes=unity,native] [out=unity-parity]
// modes native,native or unity,unity checks determinism of one side.
// D6_WAIT_MODEL=1 (diagnostic only) starts the scenario after the 3D player
// model install (D6UserModelStatus ready|failed). Before the 114 native fix the
// simulation read D6UserMeshyPlayer.nativeBall/nativeShot (v102/v99/v110/v111),
// so results depended on when the model finished loading. Matches with
// attackFlow.flowVersion===159 now use those rules unconditionally; unmarked
// legacy matches keep the optional path. Final release runs leave it unset.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const base=process.argv[2]||'http://127.0.0.1:4521/source/index.html',pick=(process.argv[3]||'all').split(','),modes=(process.argv[4]||'unity,native').split(',').map(m=>m==='unity'),outName=process.argv[5]||'unity-parity';
const label=c=>c?`${c.fieldSize}-${c.fieldPlayers}`:'legacy';
const allConfigs=[null,{fieldSize:'standard',fieldPlayers:5},{fieldSize:'standard',fieldPlayers:6},{fieldSize:'large',fieldPlayers:5},{fieldSize:'large',fieldPlayers:6}];
const configs=allConfigs.filter(c=>pick.includes('all')||pick.includes(label(c)));
const helper=fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8');
async function scenario(browser,config,unity){
 const p=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 try{
  await p.goto(base+'?engine='+(unity?'unity':'browser'));await p.evaluate(helper);
  if(process.env.D6_WAIT_MODEL)await p.waitForFunction(()=>['ready','failed'].includes(window.D6UserModelStatus),null,{timeout:120000,polling:100});
  const model=await p.evaluate(()=>({status:window.D6UserModelStatus??null,nativeBall:window.D6UserMeshyPlayer?.nativeBall??null,nativeShot:window.D6UserMeshyPlayer?.nativeShot??null}));
  await p.evaluate(([c,u])=>QAJ('parity',D6QAScenario(c,u)),[config,unity]);
  await p.waitForFunction(()=>window.QAR?.done,null,{timeout:1500000,polling:1000});
  const r=await p.evaluate(()=>window.QAR);
  return {...r,errors,model,clockHeldAtEnd:await p.evaluate(()=>window.D6UnityMatch?.clockHeld??null),lastFailure:await p.evaluate(()=>window.D6UnityMatch?.lastFailure??null),loads:await p.evaluate(()=>window.D6UnityMatch?.loads??null)};
 }finally{await p.close()}
}
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const results=[];let failures=0;
 try{
  for(const config of configs){
   const [u,n]=[await scenario(browser,config,modes[0]),await scenario(browser,config,modes[1])];
   const du=u.v?.digest,dn=n.v?.digest,same=JSON.stringify(du)===JSON.stringify(dn);
   const unityOk=r=>!r.v.setup.unity||r.v.setup.unityReady&&r.v.cp.unityReady&&!r.v.end.unityError;
   const ok=!u.error&&!n.error&&same&&u.v.end.finished&&n.v.end.finished&&!u.errors.length&&!n.errors.length&&u.v.cp.restored&&unityOk(u)&&unityOk(n);
   const diffParts=Object.keys({...du?.hashes,...dn?.hashes}).filter(k=>du?.hashes?.[k]!==dn?.hashes?.[k]);
   if(!ok)failures++;
   const name=label(config);
   results.push({config:name,modes:modes.map(m=>m?'unity':'native'),ok,sameDigest:same,diffParts,unityDigest:du,nativeDigest:dn,unity:{error:u.error||null,ms:u.ms,setup:u.v?.setup,checkpoint:u.v?.cp,end:u.v?.end&&{minute:u.v.end.minute,score:u.v.end.score,finished:u.v.end.finished,unityError:u.v.end.unityError,stats:u.v.end.stats},model:u.model,pageErrors:u.errors,lastFailure:u.lastFailure,loads:u.loads},native:{error:n.error||null,ms:n.ms,end:n.v?.end&&{minute:n.v.end.minute,score:n.v.end.score,finished:n.v.end.finished},model:n.model,pageErrors:n.errors,lastFailure:n.lastFailure,unityError:n.v?.end?.unityError??null}});
   console.log((ok?'PASS ':'FAIL ')+name+' ['+modes.map(m=>m?'unity':'native')+']'+(diffParts.length?' parts '+diffParts.join(','):'')+(u.lastFailure?' · unity failure '+u.lastFailure:'')+' digest '+(same?'equal':'DIFFERENT')+' · score '+JSON.stringify(u.v?.end?.score)+' / '+JSON.stringify(n.v?.end?.score)+(u.error?' · unity error '+u.error.split('\n')[0]:'')+(n.error?' · native error '+n.error.split('\n')[0]:''));
  }
 }finally{
  await browser.close();
  fs.mkdirSync('outputs/release-114',{recursive:true});
  fs.writeFileSync(`outputs/release-114/${outName}.json`,JSON.stringify({base,failures,results},null,2)+'\n');
  console.log(failures?`${failures} configuration(s) FAILED`:`ALL ${results.length} configurations PASSED`);process.exitCode=failures?1:0;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
