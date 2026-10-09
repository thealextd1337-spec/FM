'use strict';
// Read-only capture of actual Unity picture JSON around native keeper events.
// Current source page (/source/index.html, root's optional keeper fields), native
// stepping only (no Unity load, no render pacing). After each native step the
// picture is built exactly as the bridge does: v98PitchFrame -> scaled -> picture.
// No product file is written; RNG stays the seeded QA stream of the helper.
//   node capture-keeper-pictures.cjs [base url] [seed] [fieldSize] [fieldPlayers] [maxMinute]
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.argv[2]||'http://127.0.0.1:4591',seed=Number(process.argv[3]||160112),fieldSize=process.argv[4]||'standard',fieldPlayers=Number(process.argv[5]||5),maxMinute=Number(process.argv[6]||95);
const out=path.join(__dirname,'pictures');fs.mkdirSync(out,{recursive:true});
const files=['dist/world-unity-v151.js','dist/world-pitch-actions-v99.js','dist/pitch-motion-v102.js','dist/world-backpedal-v108.js'];
const hashes=()=>Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]));
const frozen=hashes(),helper=fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});const errors=[];
 try{
  const page=await (await browser.newContext({viewport:{width:844,height:390}})).newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/source/index.html?engine=unity&keeper-next=1');await page.evaluate(helper);
  const setup=await page.evaluate(async({seed,fieldSize,fieldPlayers})=>{
   const r=await D6QA160.setup({config:{fieldSize,fieldPlayers},unity:false,seed});
   const C=window.D6WorldUnityContract,keepers=new Set(match.people.filter(p=>p.keeper).map(p=>p.pid));
   const camera={position:{x:0,y:20,height:20,z:-30},target:{x:0,y:0,height:0,z:0},fov:40};
   let sequence=0,tail=0;const ring=[];window.KP={windows:[],current:null,counts:{}};
   // Interesting: any keeper action other than idle/run, or a keeper owner.
   window.KPStep=()=>{
    const raw=v98PitchFrame(match),shown=C.scaled(raw,C.geometry(match.geometry,{length:68,width:44}));
    const pic=C.picture(shown,'keeper-next',++sequence,camera,v65Context().state.phase,match.score);
    const kp=pic.players.filter(p=>keepers.has(p.id));
    const st=v99Actions.get(match);
    const entry={pic:{...pic,players:pic.players.filter(p=>keepers.has(p.id)||p.id===pic.owner)},native:{minute:D6QA160.state.minute,owner:match.owner?.pid||'',flight:Boolean(match.flight),rebound:Boolean(match.rebound),kicks:[...(st?.kicks||[])].map(([id,k])=>({id,phase:k.phase,held:Boolean(k.held)})),saves:[...(st?.keepers||[])].map(([id,k])=>({id,completed:Boolean(k.completed),saved:Boolean(k.saved),parry:Boolean(k.parry),goal:Boolean(k.goal),age:k.age}))}};
    const hot=kp.some(p=>!['idle','run','running',''].includes(p.action))||keepers.has(pic.owner);
    if(hot){if(!KP.current){KP.current=[...ring];}KP.current.push(entry);tail=12;for(const p of kp)if(p.action!=='idle')KP.counts[p.action+':'+(p.actionId||'').split(':')[0]]=(KP.counts[p.action+':'+(p.actionId||'').split(':')[0]]||0)+1;}
    else if(KP.current){KP.current.push(entry);if(--tail<=0){KP.windows.push(KP.current);KP.current=null;}}
    else{ring.push(entry);if(ring.length>6)ring.shift();}
    return false;
   };
   return r;
  },{seed,fieldSize,fieldPlayers});
  console.log(JSON.stringify({setup:{people:setup.people,geometry:setup.geometry}}));
  let part=0,windows=0;
  for(let minute=10;minute<=maxMinute;minute+=10){
   await page.evaluate(m=>QAJ('run',D6QA160.run({minute:m,sampleEvery:1e9,stopWhen:()=>KPStep()})),minute);await page.waitForFunction(()=>QAR.done,null,{timeout:600000});
   const r=await page.evaluate(()=>QAR);if(r.error)throw new Error(r.error);
   const chunk=await page.evaluate(()=>{const w=KP.windows;KP.windows=[];return {w,counts:KP.counts}});
   if(chunk.w.length){fs.writeFileSync(path.join(out,`windows-${seed}-${fieldSize}-${fieldPlayers}-${String(part++).padStart(2,'0')}.json`),JSON.stringify(chunk.w));windows+=chunk.w.length;}
   console.log(JSON.stringify({minute:r.v.minute,finished:r.v.finished,windows,counts:chunk.counts}));
   if(r.v.finished)break;
  }
  fs.writeFileSync(path.join(out,`capture-${seed}-${fieldSize}-${fieldPlayers}.json`),JSON.stringify({seed,fieldSize,fieldPlayers,page:base+'/source/index.html?engine=unity',windows,errors,hashesUnchanged:JSON.stringify(hashes())===JSON.stringify(frozen),hashes:frozen,note:'Pictures built per native step with the bridge contract functions; Unity not loaded. Display-only calls; seeded QA RNG.'},null,1));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
