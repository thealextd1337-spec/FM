'use strict';
// Double reload repro (parent hypothesis): v65Restore makes match the very
// object in state.physicalSnapshot.match and deletes its *Pid fields. A save
// before the next v65Snapshot (here the real "back to career start" path
// v61ShowStart) stores live objects without ownerPid/kickerPid/supportPid.
// usage: node repro-double-reload-114.cjs [state=kickoff|setPiece|open] [engine=browser|unity] [between=showStart|save|role|corrupt]
// between=corrupt: rewrite the stored snapshot into the pre-fix broken form (player object, no *Pid), as left by an in-place restore.
// between=save: any v64UiSave() after the restore and before the next v65Snapshot.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const kind=process.argv[2]||'kickoff',engine=process.argv[3]||'browser',between=process.argv[4]||'showStart';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await browser.newPage({viewport:{width:1280,height:800}}),errors=[],report={kind,engine,between};p.on('pageerror',e=>errors.push(e.message));
 const stored=id=>p.evaluate(id=>{const s=(v61StorageConfirmed||v61ReadCareers()).find(c=>c.id===id)?.world.activeMatch?.state,m=s?.physicalSnapshot?.match;return m&&{phase:s.phase,minute:s.minute,kickoff:m.kickoff&&{phase:m.kickoff.phase,kickerPid:m.kickoff.kickerPid??null,kickerObject:typeof m.kickoff.kicker==='object'&&m.kickoff.kicker!==null},setPiece:m.setPiece&&{type:m.setPiece.type,takerPid:m.setPiece.takerPid??null,takerObject:typeof m.setPiece.taker==='object'&&m.setPiece.taker!==null},ownerPid:m.ownerPid,ownerObject:typeof m.owner==='object'&&m.owner!==null}},id);
 const live=()=>p.evaluate(()=>{const c=v65Context();return{phase:c?.state.phase,elapsed:match?.elapsed,running,kicker:match?.kickoff?(match.kickoff.kicker?match.kickoff.kicker.pid:'MISSING'):null,taker:match?.setPiece?(match.setPiece.taker?match.setPiece.taker.pid:'MISSING'):null,owner:match?.owner?.pid||null,overlay:$('#match-overlay').hidden?null:$('#overlay-title').textContent+' | '+$('#overlay-copy').textContent,alias:Boolean(c&&match===c.state.physicalSnapshot?.match),tickErrors:window.__tickErrors||[]}});
 const open=async id=>{await p.reload();await p.evaluate(()=>v61WaitForStorage()).catch(()=>{});await p.evaluate(()=>{window.__tickErrors=[];const base=step;step=function(...a){try{return base.apply(this,a)}catch(e){__tickErrors.push(String(e.stack).split('\n').slice(0,3).join(' | '));throw e}}});await p.locator('[data-v61-open="'+id+'"]').first().click();};
 try{
  await p.goto('http://127.0.0.1:4521/source/index.html?engine='+engine);
  await p.evaluate(fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8'));
  await p.evaluate(u=>D6QA160.setup({config:{fieldSize:'large',fieldPlayers:6},unity:u,replays:true}),engine==='unity');
  report.id=await p.evaluate(async()=>{await v61StoreNewCareer(D6QA160.career);await v61WaitForStorage();return v61CurrentCareer.id});
  // reach the stopped state with native steps, then a genuine pause snapshot
  report.reached=await p.evaluate(async k=>{const c=v65Context(),tick=()=>{step(.05*MATCH_SPEED,.05);v65AfterStep(c)};for(let i=0;i<300;i++)tick();
   if(k==='kickoff'){while(match.flight||match.slide||match.kickoff||match.setPiece||match.throwIn||match.postBanner||match.goalPause>0)tick();kickoff(1);tick();}
   else if(k==='setPiece'){let n=0;while(!(match.setPiece&&match.setPiece.phase==='waiting'&&!match.flight)&&n++<20000)tick();}
   else{while(match.flight||match.slide||!match.owner)tick();}
   v65PauseTargetTab='lineup';const ok=v65Pause();clearInterval(v65WorldFrame);await v61WaitForStorage();return{ok,minute:c.state.minute,kickoff:match.kickoff?.phase??null,setPiece:match.setPiece?.type??null}},kind);
  report.storedFirst=await stored(report.id);
  await open(report.id);report.afterFirstOpen=await live();
  // real UI path: back to the career start (menu / "Karriere verwalten")
  if(between==='role'){report.roleChange=await p.evaluate(async()=>{
   // real pause UI: open tactics through the progress button, change a player role select
   v58Button.click();await new Promise(r=>setTimeout(r,300));
   // lineup tab with an outfield player selected, as when tapping a player in the pause view
   v65PauseTab='lineup';v65SelectedSlot=1;v65UpdateControls(v65Context());await new Promise(r=>setTimeout(r,200));
   const select=document.querySelector('[data-d6-role]');if(!select)return{select:false,v154:typeof v154Active==='function'&&v154Active(v61CurrentCareer)};
   const before=select.value,next=[...select.options].map(o=>o.value).find(v=>v!==before);select.value=next;select.dispatchEvent(new Event('change',{bubbles:true}));
   await new Promise(r=>setTimeout(r,300));await v61WaitForStorage();return{select:true,pid:select.dataset.d6Role,before,next};});}
  else if(between==='corrupt')report.corrupted=await p.evaluate(async()=>{const m=v65Context().state.physicalSnapshot.match,find=pid=>m.people.find(q=>q.pid===pid);const done=[];
   if(m.kickoff){m.kickoff.kicker=structuredClone(find(m.kickoff.kickerPid));m.kickoff.support=structuredClone(find(m.kickoff.supportPid));delete m.kickoff.kickerPid;delete m.kickoff.supportPid;done.push('kickoff')}
   if(m.setPiece){m.setPiece.taker=structuredClone(find(m.setPiece.takerPid));delete m.setPiece.takerPid;done.push('setPiece')}
   if(m.ownerPid){m.owner=structuredClone(find(m.ownerPid));delete m.ownerPid;done.push('owner')}
   await v61SaveCareers(v61ReadCareers());await v61WaitForStorage();return done;});
  else if(between==='save')await p.evaluate(async()=>{await v64UiSave();await v61WaitForStorage();});else{await p.evaluate(()=>v61ShowStart());await p.evaluate(()=>v61WaitForStorage());}
  report.storedAfterShowStart=await stored(report.id);
  await open(report.id);report.afterSecondOpen=await live();
  await p.locator('#v65-quick-nav [data-v65-quick]').first().click().catch(e=>report.clickError=String(e));
  report.afterResume=[];for(let i=0;i<10;i++){await wait(2000);report.afterResume.push(await live());}
  await p.screenshot({path:`outputs/release-114/double-reload-${kind}-${engine}-${between}.png`});
  report.v65Error=await p.evaluate(()=>document.querySelector('#v65-error')?.textContent??'(element missing)');
 }finally{report.errors=errors;fs.mkdirSync('outputs/release-114',{recursive:true});fs.writeFileSync(`outputs/release-114/double-reload-${kind}-${engine}-${between}.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,1));await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
