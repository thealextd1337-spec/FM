const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const page=await browser.newPage({viewport:{width:1100,height:780}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve('outputs/spieler-nutzer-match.html')).href,{timeout:120000});await page.waitForFunction(()=>window.userMeshyMatchReady,null,{timeout:60000});
 const rows=await page.evaluate(()=>{
  const rows=[];v102StopPaint();
  for(const passSkill of [6,18])for(const seed of [12457,77491,90123,234567]){
   let rng=seed;Math.random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
   const career=v61CreateCareer('GER-2','space-study-'+seed),club=career.world.clubs.find(c=>c.id==='GER-2');v66ChooseSponsor(career,club.id,club.sponsors[0].id);if(career.world.market.phase==='budget')v124SetYouthBudget(career,0);while(career.world.market.phase==='open')v66NextMarketDay(career);
   const fixture=v62Fixtures(career).find(f=>!f.result&&(f.homeId===club.id||f.awayId===club.id));career.world.activeMatch={fixtureId:fixture.id,state:v64MakeState(career,fixture)};v61CurrentCareer=career;v98View='2d';career.world.activeMatch.state.phase='live';v65WorldActive=null;v65Show(v65Context());clearInterval(v65WorldFrame);v102StopPaint();
   const side=v65Context().ownSide;for(const p of match.people)if(!p.keeper&&p.t===side)p.pas=passSkill;
   let frames=0;while(!match.finished&&frames++<18000){v103EndReplay(match);if(v65Context().state.phase==='paused'){v65Resume();clearInterval(v65WorldFrame);}step(.05*MATCH_SPEED,.05);if(v65Context().state.phase==='live'&&!match.finished)v65AfterStep(v65Context());if(match.people.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y))||!Number.isFinite(match.ball.x)||!Number.isFinite(match.ball.y))throw Error('Non-finite match');}
   if(!match.finished)throw Error('Incomplete match');const events=match.ballAccounting.events.filter(e=>e.intent==='space'),own=events.filter(e=>e.team===side),totals=match.people.filter(p=>p.t===side).reduce((a,p)=>({passes:a.passes+p.stats.passes,complete:a.complete+p.stats.passComplete}),{passes:0,complete:0});
   rows.push({passSkill,seed,frames,score:[...match.score],ownSpacePasses:own.length,ownReceived:own.filter(e=>e.result==='received').length,allSpacePasses:events.length,allReceived:events.filter(e=>e.result==='received').length,allIntercepted:events.filter(e=>e.result==='intercepted').length,allOffside:events.filter(e=>e.result==='offside').length,unsettled:events.filter(e=>!e.result||e.result==='loose').length,remainingIntent:!!match.spacePassIntent,totals,events});
  }
  return rows;
 });
 fs.writeFileSync('outputs/space-match-study-v150.json',JSON.stringify({rows,errors},null,2)+'\n');assert.deepEqual(errors,[]);assert(rows.every(r=>r.unsettled===0&&!r.remainingIntent));assert(rows.reduce((n,r)=>n+r.allSpacePasses,0)>0,'Raumpasses occur through the normal match decision');assert(rows.every(r=>r.totals.complete<=r.totals.passes));console.log(JSON.stringify(rows.map(({events,...r})=>r)));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
