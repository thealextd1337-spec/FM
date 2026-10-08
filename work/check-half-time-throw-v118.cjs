const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const baseline=process.argv.includes('--baseline');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve('outputs/spieler-nutzer-match.html')).href);await page.waitForFunction(()=>window.userMeshyMatchReady,null,{timeout:60000});
  const cases=await page.evaluate(()=>{
   clearInterval(v65WorldFrame);v102StopPaint();const cases=[];
   for(const edge of ['left','right'])for(const ready of [0,.3]){
    const context=v65Context();context.state.phase='live';v65CreateMatch(context);running=true;hideOverlay();
    Object.assign(match,{kickoff:null,postBanner:null,countdown:0,owner:null,flight:null,halftime:true,halftimeBreakDone:false,halftimePause:0,elapsed:match.firstHalfEnd||37.5});
    v55BeginThrow({edge,x:edge==='left'?v55Field.left:v55Field.right,y:.55},1);match.throwIn.ready=ready;
    beginHalftimeBreak();const atWhistle={throwIn:!!match.throwIn,halfDone:match.halftimeBreakDone,halfPause:match.halftimePause};
    startSecondHalf();let frames=0;while(match.kickoff?.phase!=='rolling'&&!match.flight&&frames++<600)step(.05*MATCH_SPEED,.05);
    cases.push({edge,ready,atWhistle,frames,throwIn:!!match.throwIn,kickoff:match.kickoff?.phase,flight:!!match.flight});
   }
   const context=v65Context();v65CreateMatch(context);Object.assign(match,{kickoff:null,elapsed:37.5,halftime:true,halftimeBreakDone:false});
   match.setPiece={type:'penalty',team:0,taker:match.people.find(p=>p.t===0&&!p.keeper)};const piece=match.setPiece;beginHalftimeBreak();cases.push({kind:'penalty-deferred',samePiece:match.setPiece===piece,pending:match.halftimePending,halfDone:match.halftimeBreakDone});
   return cases;
  });
  fs.writeFileSync(`docs/spieler-nutzer-rig/half-time-throw-${baseline?'baseline':'qa'}-v118.json`,JSON.stringify({cases,errors},null,2)+'\n');
  assert.deepEqual(errors,[]);if(!baseline){for(const c of cases.filter(c=>c.edge)){assert(!c.atWhistle.throwIn);assert(c.atWhistle.halfDone);assert(!c.throwIn);assert(c.flight||c.kickoff==='rolling');assert(c.frames<600)}const p=cases.at(-1);assert(p.samePiece&&p.pending&&!p.halfDone)}
  console.log(JSON.stringify({baseline,cases,errors}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
