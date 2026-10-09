'use strict';
// Isolated balance experiment: actual source page/controllers, fresh QA saves.
// The only runtime substitution is the copied compact shot probability gate.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'outputs/3d-quality/shot-volume-v119');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const frozen=new Map(),html=fs.readFileSync(path.join(root,'dist/index.html'));
frozen.set('index.html',html);
for(const item of html.toString().matchAll(/(?:src|href)="([^"#]+)"/g)){
 const rel=item[1].split('?')[0];if(/^(?:https?:|data:|\/)/.test(rel)||!/\.(?:js|css)$/.test(rel))continue;
 const file=path.resolve(root,'dist',rel);if(!file.startsWith(path.join(root,'dist')+path.sep))continue;
 frozen.set(rel.replaceAll('\\','/'),fs.readFileSync(file));
}
const experiment=process.argv.includes('--experiment');
const report={scope:'Actual final compact production QA with marked/unmarked JSON checkpoints; --experiment keeps isolated probability comparisons. No production edits or physical/device claim.',mode:experiment?'isolated-experiment':'final-production',probabilities:experiment?[.22,.07,.08,.09]:[.09],seedsPerConfiguration:12,sourceHashes:Object.fromEntries([...frozen].map(([f,b])=>['dist/'+f,hash(b)])),errors:[],rows:[],summaries:[]};
const gate='const shotChance=state.playerPerformance?.shotBalanceRevision===119 ? .09 : .22;\n if(random()>shotChance)return false;';
async function checkpointChecks(page,options){
 return page.evaluate(async({fieldSize,fieldPlayers,index,gate})=>{
  const check=(v,m)=>{if(!v)throw Error(m);},clone=x=>JSON.parse(JSON.stringify(x));
  const original=v155CompactActions,rng=v61Random,reference=(0,eval)('('+original.toString().replaceAll('\r\n','\n').replace(gate,'if(random()>.22)return false;')+')');
  const country=v61Countries[index%v61Countries.length][0],career=v61CreateCareer(country+'-2','compact-shot-volume-119-'+index,'QA',undefined,{fieldSize,fieldPlayers});
  const league=v62Current(career).find(c=>c.type==='league'&&c.country===country),fixtures=league.fixtures.filter(f=>f.homeId!==career.manager.managedClubId&&f.awayId!==career.manager.managedClubId),fixtureId=fixtures[(index*3)%fixtures.length].id,initial=JSON.stringify(career);
  const initialize=marked=>{const c=JSON.parse(initial),f=v62Fixtures(c).find(f=>f.id===fixtureId),s=v64MakeState(c,f);check(s.playerPerformance.shotBalanceRevision===119,'actual initializer marks new match');if(!marked)delete s.playerPerformance.shotBalanceRevision;return{career:c,state:s};};
  const run=(saved,fn,until)=>{
   const {career:c,state:s}=saved,f=v62Fixtures(c).find(f=>f.id===fixtureId),draws=[];let recorded;
   try{
    v155CompactActions=fn;
    v61Random=function(seed){const next=rng(seed);return()=>{const value=next();draws.push([seed,value]);return value;};};
    while(s.phase!=='finished'&&(until===undefined||s.minute<until))v64Step(c,f,s);
    if(s.phase==='finished'){const record=v64FinishFixture(c,f,s);check(record.players.some(p=>p.roleRating),'actual ratings booked');}
    recorded=JSON.stringify(draws);
   }finally{v155CompactActions=original;v61Random=rng;}
   return{saved,draws:recorded,drawCount:draws.length};
  };
  try{
   const marked=run(initialize(true),original,27),markedCheckpoint=JSON.stringify(marked.saved);
   check(clone(marked.saved).state.playerPerformance.shotBalanceRevision===119,'marker survives JSON at minute 27');
   const live=run(marked.saved,original),resume=run(JSON.parse(markedCheckpoint),original);
   check(JSON.stringify(live.saved)===JSON.stringify(resume.saved),'marked JSON continuation exact state/events/score/books');
   check(live.draws===resume.draws,'marked JSON continuation exact random draws');
   const old=run(initialize(false),reference,27),oldCheckpoint=JSON.stringify(old.saved);
   check(!Object.hasOwn(JSON.parse(oldCheckpoint).state.playerPerformance,'shotBalanceRevision'),'old checkpoint remains unmarked');
   const actualOld=run(JSON.parse(oldCheckpoint),original),referenceOld=run(JSON.parse(oldCheckpoint),reference);
   check(JSON.stringify(actualOld.saved)===JSON.stringify(referenceOld.saved),'unmarked production exact old .22 state/events/score/books');
   check(actualOld.draws===referenceOld.draws,'unmarked production exact old .22 random draws');
   check(!Object.hasOwn(actualOld.saved.state.playerPerformance,'shotBalanceRevision'),'old checkpoint not backfilled');
   const digest=async x=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(x)))].map(n=>n.toString(16).padStart(2,'0')).join('');
   return{fieldSize,fieldPlayers,index,fixtureId,checkpointMinute:27,markedJsonExact:true,unmarkedOldExact:true,noMarkerBackfill:true,markedDrawCount:live.drawCount,oldDrawCount:actualOld.drawCount,markedDrawSha256:await digest(live.draws),oldDrawSha256:await digest(actualOld.draws),markedFinalSha256:await digest(JSON.stringify(live.saved)),oldFinalSha256:await digest(JSON.stringify(actualOld.saved))};
  }finally{v155CompactActions=original;v61Random=rng;check(v155CompactActions===original&&v61Random===rng,'exact function objects restored');}
 },{...options,gate});
}
async function main(){
 fs.mkdirSync(out,{recursive:true});
 const server=require('./ui-redesign/serve.cjs').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let browser;
 try{
  browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const context=await browser.newContext(),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.route('**/source/**',route=>{
   const rel=decodeURIComponent(new URL(route.request().url()).pathname.slice(8)),bytes=frozen.get(rel);
   return bytes?route.fulfill({body:bytes,contentType:rel.endsWith('.js')?'text/javascript':rel.endsWith('.css')?'text/css':'text/html'}):route.continue();
  });
  await page.goto('http://127.0.0.1:'+server.address().port+'/source/index.html?engine=browser');
  await page.waitForFunction(()=>window.userMeshyMatchReady&&window.D6MatchRatings&&typeof v155CompactActions==='function',null,{timeout:60000});
  report.loadedFunction=await page.evaluate(()=>v155CompactActions.toString());
  assert.equal(report.loadedFunction.replaceAll('\r\n','\n').split(gate).length,2,'exact single versioned shot gate');
  report.loadedFunctionSha256=hash(report.loadedFunction);
  for(const fieldSize of ['standard','large'])for(const fieldPlayers of [5,6])for(let index=0;index<12;index++){
   const result=await page.evaluate(async({fieldSize,fieldPlayers,index,probabilities,gate,experiment})=>{
    const check=(value,message)=>{if(!value)throw Error(message);};
    const original=v155CompactActions,originalText=original.toString(),country=v61Countries[index%v61Countries.length][0];
    const seed='compact-shot-volume-119-'+index,career=v61CreateCareer(country+'-2',seed,'QA',undefined,{fieldSize,fieldPlayers});
    check(career.world.playerFoundation.parameterId==='native-player-v160-1','actual current native player parameters');
    const league=v62Current(career).find(c=>c.type==='league'&&c.country===country);
    check(Boolean(league),'legitimate league exists');
    const candidates=league.fixtures.filter(f=>f.homeId!==career.manager.managedClubId&&f.awayId!==career.manager.managedClubId);
    const chosen=candidates[(index*3)%candidates.length];check(Boolean(chosen),'legitimate fixture');
    const initial=JSON.stringify(career),initialSha256=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(initial)))].map(x=>x.toString(16).padStart(2,'0')).join('');
    const rows=[];
    try{
     for(const probability of probabilities){
      // Function body differs by exactly one probability literal in this private tab.
      const text=originalText.replaceAll('\r\n','\n').replace(gate,`if(random()>${probability})return false;`);
      v155CompactActions=experiment?(0,eval)('('+text+')'):original;
      const c=JSON.parse(initial),fixture=v62Fixtures(c).find(f=>f.id===chosen.id),state=v64MakeState(c,fixture);
      check(fixture.plan.home.coachId&&fixture.plan.away.coachId,'both native AI coaches retained');
      check(state.playerPerformance&&state.playerLoad&&state.roleAssignments,'actual P02/P03/roles initialized');
      check(state.playerPerformance.shotBalanceRevision===119,'new actual match marker');
      let steps=0;while(state.phase!=='finished'){v64Step(c,fixture,state);check(++steps<=110,'bounded normal full time');}
      check(state.minute===state.fullTimeEnd&&state.minute>=90,'actual full time');
      check(state.events.filter(e=>e.type==='halftime').length===1,'one native halftime');
      const shots=[0,0],onTarget=[0,0],saves=[0,0],homePlayers=new Set(v64Side(c,fixture,0).map(p=>p.pid)),sideFor=pid=>homePlayers.has(pid)?0:1;
      for(const [pid,stats]of Object.entries(state.stats))shots[sideFor(pid)]+=stats.shots||0;
      const shotEvents=state.playerPerformance.events.filter(e=>e.type==='shot');
      for(const e of shotEvents)if(e.success)onTarget[sideFor(e.playerId)]++;
      for(const e of state.playerPerformance.events)if(e.type==='save'&&e.success)saves[sideFor(e.playerId)]++;
      check(shotEvents.length===shots[0]+shots[1],'shots equal actual resolved P03 events');
      check(onTarget.every((n,i)=>n<=shots[i]&&state.score[i]<=n),'goals <= on target <= shots');
      check(state.events.filter(e=>e.type==='goal').length===state.score[0]+state.score[1],'native goal events reconcile score');
      for(const side of [0,1]){
       check(v64Side(c,fixture,side).reduce((s,p)=>s+(state.minutes[p.pid]||0),0)===(fieldPlayers+1)*state.minute,'complete team appearance minutes');
       check(onTarget[side]===state.score[side]+saves[1-side],'on-target outcomes reconcile goals and keeper saves');
      }
      check(state.playerLoad.finalFresh&&Object.keys(state.playerLoad.pending).length===0,'native load committed at final whistle');
      const record=v64FinishFixture(c,fixture,state),after=JSON.stringify(c);
      check(record.players.reduce((s,p)=>s+p.shots,0)===shots[0]+shots[1],'finished record shots reconcile');
      check(record.players.filter(p=>p.minutes>=20).every(p=>Number.isFinite(p.rating)&&p.roleRating?.version===155),'actual P03 role ratings retained');
      check(record.players.every(p=>p.roleRating?.phases.length),'actual role phase ledger retained');
      check(v64FinishFixture(c,fixture,state)===record&&JSON.stringify(c)===after,'existing booking idempotence');
      check(v61ValidateCareer(JSON.parse(after)),'actual JSON save validator');
      rows.push({fieldSize,fieldPlayers,index,seed,initialSha256,country,fixtureId:fixture.id,homeId:fixture.homeId,awayId:fixture.awayId,probability,shots,onTarget,score:[...state.score],saves,fullTime:state.minute,addedMinutes:[...state.addedMinutes],p03Events:state.playerPerformance.events.length,shotEvents:shotEvents.length,appearances:record.players.length,aiChanges:record.tacticChanges.length,substitutions:record.substitutions.length,loadFinalized:true,rolesAndRatings:true,idempotent:true,validSave:true});
     }
     check(JSON.stringify(career)===initial,'initial shared pair snapshot remains unchanged');
    }finally{v155CompactActions=original;}
    check(v155CompactActions===original&&v155CompactActions.toString()===originalText,'exact original function restored');
    return{rows,restored:true};
   },{fieldSize,fieldPlayers,index,probabilities:report.probabilities,gate,experiment});
   report.rows.push(...result.rows);assert(result.restored);
   if(!experiment){report.checkpoints||=[];report.checkpoints.push(await checkpointChecks(page,{fieldSize,fieldPlayers,index}));}
   if(index===11)console.log('PASS compact '+report.mode+' '+fieldSize+'/'+fieldPlayers+': 12 seeds');
  }
  for(const fieldSize of ['standard','large'])for(const fieldPlayers of [5,6])for(const probability of report.probabilities){
   const rows=report.rows.filter(r=>r.fieldSize===fieldSize&&r.fieldPlayers===fieldPlayers&&r.probability===probability);
   const values=key=>rows.map(r=>Array.isArray(r[key])?r[key].reduce((s,n)=>s+n,0):r[key]);
   const stats=key=>{const a=values(key),mean=a.reduce((s,n)=>s+n,0)/a.length,sd=Math.sqrt(a.reduce((s,n)=>s+(n-mean)**2,0)/(a.length-1));return{average:mean,min:Math.min(...a),max:Math.max(...a),sampleSd:sd,mean95Ci:[mean-2.201*sd/Math.sqrt(a.length),mean+2.201*sd/Math.sqrt(a.length)]};};
   report.summaries.push({fieldSize,fieldPlayers,probability,matches:rows.length,shots:stats('shots'),onTarget:stats('onTarget'),goals:stats('score'),fullTime:stats('fullTime'),meanInTarget:stats('shots').average>=10&&stats('shots').average<=16});
  }
  report.candidates=report.probabilities.filter(p=>p!==.22).map(probability=>{const rows=report.summaries.filter(s=>s.probability===probability);return{probability,allFourMeansInTarget:rows.every(r=>r.meanInTarget),averageAcrossConfigurations:rows.reduce((s,r)=>s+r.shots.average,0)/rows.length};});
  for(const [f,b]of frozen)assert.equal(hash(fs.readFileSync(path.join(root,'dist',f))),hash(b),'production source unchanged: '+f);
  if(!experiment){
   const candidate=JSON.parse(fs.readFileSync(path.join(out,'compact-matrix.json'),'utf8')).rows.filter(r=>r.probability===.09);
   for(const row of report.rows){const old=candidate.find(r=>r.fieldSize===row.fieldSize&&r.fieldPlayers===row.fieldPlayers&&r.index===row.index);assert(old,'existing paired candidate result');for(const key of ['fixtureId','shots','onTarget','score','saves','fullTime','addedMinutes','p03Events','shotEvents','appearances','aiChanges','substitutions'])assert.deepEqual(row[key],old[key],'actual production equals isolated candidate: '+key);}
   report.candidateMatchesExact=true;assert.equal(report.checkpoints.length,48);
  }
  assert.deepEqual(report.errors,[]);assert.equal(report.rows.length,experiment?192:48);
  report.originalRestored=true;report.productionUnchanged=true;report.passed=true;
  delete report.loadedFunction;
  await context.close();
 }catch(e){report.passed=false;report.failure=e.stack;process.exitCode=1;}
 finally{if(browser)await browser.close();await new Promise(r=>server.close(r));report.runnerSha256=hash(fs.readFileSync(__filename));fs.writeFileSync(path.join(out,experiment?'compact-versioned-experiment.json':'compact-production.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,matches:report.rows.length,checkpoints:report.checkpoints?.length,candidateMatchesExact:report.candidateMatchesExact,candidates:report.candidates,failure:report.failure}));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
