'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const runtime=path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node');
if(Number(process.versions.node.split('.')[0])<20){const r=require('node:child_process').spawnSync(path.join(runtime,'bin/node.exe'),[__filename],{stdio:'inherit'});process.exit(r.status??1);}
const {chromium}=require(path.join(runtime,'node_modules/playwright')),{createServer}=require('./ui-redesign/serve.cjs');
const out='outputs/squad-planning-v179',results=[],digests=[];
const files=['world-squad-planning-v179.js','world-squad-ui-v179.js','world-match-v64.js','world-market-ui-v66.js','world-transfer-list-ui-v72.js','world-economy-v66.css','i18n-v75.js','ui-flutlicht/adapter.js','ui-flutlicht/views/squad.js','ui-flutlicht/views/market.js'];
const hashes=()=>Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync('dist/'+f)).digest('hex')]));
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true}),before=hashes();fs.mkdirSync(out,{recursive:true});
 try{
  for(const target of ['source','build']){
   console.log('START '+target);const context=await browser.newContext(),errors=[];let page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   await page.goto(target==='source'?`http://127.0.0.1:${server.address().port}/source/index.html`:require('node:url').pathToFileURL(path.resolve('outputs/index.html')).href);await page.waitForFunction(()=>v61StorageReady);
   await page.evaluate(async()=>{v61CurrentCareer=await v61StoreNewCareer(v167CreateCareer('GER-2','squad-ui-v179','Kader QA'));v61RenderCareer(v61CurrentCareer);v61SetCareerTab('squad',false);window.v179Frozen=JSON.stringify(v61CurrentCareer);});
   for(const width of [320,390,1280])for(const lang of ['de','en']){
    await page.setViewportSize({width,height:844});await page.evaluate(({lang,dark})=>{D6Flutlicht.theme.set(dark?'dark':'light');doppel6Language.set(lang);},{lang,dark:width===390});
    await page.locator('[data-fl-section-tab=roster]').click();
    assert.equal(await page.locator('.fl-squad-player-detail>.v179-role').count(),11);
    const depth=await page.locator('.v179-depth').innerText();assert.match(depth,lang==='de'?/Kaderrollen und Tiefe/:/Squad roles and depth/);assert.match(depth,lang==='de'?/Mit Ersatz besetzt/:/Backup available/);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${target} ${width} ${lang}: page overflow`);
    const skills=await page.locator('.fl-squad-skills').first().innerText();assert(!/\d/.test(skills),'Individual ability values stay qualitative');
    await page.locator('[data-fl-section-tab=contracts]').click();assert.equal(await page.locator('.v179-progress').count(),11);assert.match(await page.locator('.v179-progress').first().innerText(),lang==='de'?/Bewertung ab vier Spielen/:/Assessment after four matches/);
    const unchanged=await page.evaluate(()=>JSON.stringify(v61CurrentCareer)===window.v179Frozen);assert(unchanged,'Navigation and language must not mutate career');
    results.push({target,width,lang,theme:width===390?'dark':'light',roles:true,status:true,noOverflow:true,readOnly:true});
   }
   await page.evaluate(()=>doppel6Language.set('de'));await page.setViewportSize({width:390,height:844});await page.locator('[data-fl-section-tab=roster]').click();await page.locator('.v179-depth').screenshot({path:`${out}/${target}-depth-390.png`});
   const saved=await page.evaluate(()=>v61CurrentCareer.id);await page.reload();await page.locator(`[data-v61-open="${saved}"]`).click();
   assert(await page.evaluate(()=>v61ValidateCareer(v61CurrentCareer)));
   assert.deepEqual(await page.evaluate(()=>v179SquadDepth(v61CurrentCareer,v66Own(v61CurrentCareer)).counts),{starter:6,rotation:3,reserve:2});
   // Exercise the existing renewal form with the role-labelled numeric choices.
   await page.locator('[data-v66-sponsor]').first().click();if(await page.locator('[data-v124-budget]').count())await page.locator('[data-v124-budget]').click();
   await page.waitForFunction(()=>v61CurrentCareer.world.market.phase==='open');
   const pid=await page.evaluate(()=>{const c=v61CurrentCareer,p=v66Own(c).roster[2];v66Contract(c,p.pid).endSeason=1;v61RenderCareer(c);v61SetCareerTab('squad',false);D6Flutlicht.navigation.select('squad','contracts');return p.pid;});
   await page.locator('[data-fl-section-tab=contracts]').click();await page.locator(`[data-v66-renew-open="${pid}"]`).click();assert.equal(await page.locator('#v66-renew-promise optgroup').count(),3);await page.evaluate(()=>doppel6Language.set('en'));assert.equal(await page.locator('#v66-renew-promise optgroup').last().getAttribute('label'),'Regular starter');await page.evaluate(()=>doppel6Language.set('de'));await page.locator('#v66-renew-promise').selectOption('6');await page.locator('#v66-renew-salary').fill('10000');await page.locator('[data-v66-renew-submit]').click();await page.waitForFunction(pid=>v66Contract(v61CurrentCareer,pid).promise===6,pid);
   assert.equal(await page.evaluate(pid=>v179PromiseProgress(v61CurrentCareer,v66Player(v61CurrentCareer,pid)).role,pid),'rotation');
   await page.evaluate(()=>{const c=v61CurrentCareer,club=v66Own(c);for(const p of club.roster)v66Contract(c,p.pid).endSeason=3;const p=club.roster[2];v66Contract(c,p.pid).promise=14;const league=v62Current(c).find(k=>k.type==='league'&&k.country===club.countryId);for(const f of league.fixtures.filter(f=>f.homeId===club.id||f.awayId===club.id).slice(0,4))f.result={homeGoals:0,awayGoals:0};v61RenderCareer(c);v61SetCareerTab('squad',false);D6Flutlicht.navigation.select('squad','contracts');});
   await page.locator('[data-fl-section-tab=contracts]').click();await page.locator('[data-fl-contract-filter=attention]').click();assert.equal(await page.locator(`.v66-contract:has([data-v61-player="${pid}"])`).isVisible(),true);assert.match(await page.locator(`.v66-contract:has([data-v61-player="${pid}"])`).innerText(),/Zu wenig Spielzeit/);
   results.push({target,reload:true,renewal:true,attention:true});
   // Match parity starts in a clean profile, separately from deliberately altered UI fixtures.
   await context.close();const matchContext=await browser.newContext();page=await matchContext.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(target==='source'?`http://127.0.0.1:${server.address().port}/source/index.html`:require('node:url').pathToFileURL(path.resolve('outputs/index.html')).href);await page.waitForFunction(()=>v61StorageReady);
   // Complete real physical native 2D match, including halftime and JSON continuation.
   await page.evaluate(fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8').replace('saved=v65Snapshot(context)','saved=seeded(()=>v65Snapshot(context))').replace('const restored=v65Restore(context)','const restored=seeded(()=>v65Restore(context))'));
   console.log('PASS '+target+' UI and contract actions; starting native match');const setup=await page.evaluate(()=>D6QA160.setup({unity:false,expansion:true,replays:false,seed:179003}));assert.deepEqual(setup.perTeam,[6,6]);console.log('MATCH '+target+' ready');
   const drive=async options=>{let last;for(let i=0;i<40;i++){last=await page.evaluate(options=>D6QA160.run({...options,limit:500,sampleEvery:30}),options);console.log('STEP '+target+' '+last.minute+' '+last.phase+' '+last.finished);if(last.stopped||last.finished||!options.finished&&!options.stopAtHalftime&&last.minute>=options.minute)return last;const flags=await page.evaluate(()=>({running,phase:D6QA160.state.phase,error:document.querySelector('#v65-error')?.textContent,elapsed:match.elapsed,clock:MATCH_SPEED,halftime:match.halftimePause}));assert(!flags.error,JSON.stringify(flags));if(i>0&&last.minute===0)console.log('STATE '+JSON.stringify(flags));}throw Error('Match did not complete: '+JSON.stringify(last));};const half=await drive({stopAtHalftime:true});assert.equal(half.stopped,'halftime');console.log('MATCH '+target+' halftime');
   await drive({minute:60});const checkpoint=await page.evaluate(()=>D6QA160.checkpoint());assert(checkpoint.restored);
   const end=await drive({finished:true});console.log('MATCH '+target+' end '+JSON.stringify(end));assert(end.finished,'Native match must reach its final whistle');const digest=await page.evaluate(()=>D6QA160.digest());assert(digest.valid&&digest.booked&&digest.finished);digests.push({target,digest});fs.writeFileSync(`${out}/browser-partial.json`,JSON.stringify({results,digests,sourceHashes:before},null,2));
   assert.deepEqual(errors,[],`${target} page errors`);console.log('PASS '+target+' UI, native contracts, reload and complete match');await matchContext.close();
  }
  assert.deepEqual(digests[0].digest,digests[1].digest,'Source and build must complete the same native match');assert.deepEqual(hashes(),before,'Browser checks must not modify source files');
  fs.writeFileSync(`${out}/browser-checks.json`,JSON.stringify({results,digests,sourceHashes:before},null,2));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
