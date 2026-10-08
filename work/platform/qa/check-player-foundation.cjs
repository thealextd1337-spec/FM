'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const built=process.argv.includes('--build'),out=path.resolve('outputs/platform/player-foundation');fs.mkdirSync(out,{recursive:true});
const files=['player-generation.js','player-effective-abilities.js','player-freshness.js','player-development.js','player-aging.js','world-player-foundation-v153.js','player-foundation-preview-v153.js','world-foundation-v61.js','world-economy-v66.js','world-youth-manager-v67.js','world-payments-v124.js','strength-v55.js','world-views-v68.js','i18n-v75.js'];
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
(async()=>{
 const server=require('../../ui-redesign/serve.cjs').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const report={built,checks:[],errors:[],sourceHashes:Object.fromEntries(files.map(f=>['dist/'+f,hash('dist/'+f)])),...(built?{buildHash:hash('outputs/index.html')}:{})};
 try{
  const page=await browser.newPage();page.on('pageerror',e=>report.errors.push(e.message));const origin=`http://127.0.0.1:${server.address().port}`,base=origin+`/${built?'built':'source'}/index.html`;
  if(built)await page.route('**/built/index.html?*',route=>route.fulfill({contentType:'text/html',body:fs.readFileSync('outputs/index.html','utf8').replace('<head>',`<head><base href="${origin}/source/">`)}));
  await page.goto(base+'?engine=browser');await page.waitForFunction(()=>window.D6PlayerFoundation&&typeof v61CreateCareer==='function');
  assert.equal(await page.evaluate(()=>Boolean(window.D6PlayerFoundationPreviewOptions)),false);
  report.checks.push('Normal local URL keeps generation unchanged');
  await page.goto(base+'?engine=browser&players=wave2');await page.waitForFunction(()=>window.D6PlayerFoundationPreviewOptions&&typeof v61CreateCareer==='function');
  const checks=await page.evaluate(async()=>{
   const rows=[],check=(name,value)=>{if(!value)throw Error(name);rows.push(name);},keys=D6PlayerGeneration.SKILL_KEYS;
   const old=v61CreateCareer('GER-2','foundation-preview',null,null),oldJson=JSON.stringify(old);
   const c=v61CreateCareer('GER-2','foundation-preview'),club=v66Own(c),all=[...c.world.clubs.flatMap(x=>[...x.roster,...x.youthPool]),...c.world.market.freePlayers];
   check('Candidate creates valid complete world with separate saved marker',v61ValidateCareer(c)&&v61ValidateCareer(old)&&c.world.playerFoundation.parameterId==='wave2-local-candidate-1'&&!old.world.playerFoundation);
   check('All new professional, youth, free and cup players get complete valid profiles',all.length>500&&all.every(p=>p.playerModel?.version===2&&keys.every(k=>Number.isFinite(p[k])&&p[k]>=1&&p[k]<=p.playerModel.caps[k]&&p.playerModel.caps[k]<=20)&&Number.isInteger(p.heightCm)&&p.heightCm>=165&&p.heightCm<=205&&['Rechts','Links','Beidfüßig'].includes(p.foot)&&p.playerModel.talent>=10&&p.playerModel.talent<=22&&(!p.keeper||JSON.stringify(p.playerModel.playablePositions)==='["gk"]')));
   check('New free player ledgers use final identity',c.world.market.freePlayers.every(p=>p.playerModel.development.playerId===p.pid&&p.playerModel.aging.playerId===p.pid));
   const counts={weak:0,normal:0,strong:0};for(const x of c.world.clubs)counts[c.world.playerFoundation.qualityMapping[x.policy.youth]]+=[...x.roster,...x.youthPool].filter(p=>p.discoveredSeason===0).length;
   check('High-talent normalization uses actual initial cohort, including promoted youth',JSON.stringify(counts)===JSON.stringify(c.world.playerFoundation.parameters.youthPopulationWeights));
   const restored=JSON.parse(JSON.stringify(c));check('JSON reload preserves all profiles, caps, talent and ledgers',v61ValidateCareer(restored)&&JSON.stringify(restored)===JSON.stringify(c));
   check('Existing careers receive no model, new skills or retroactive fields',JSON.stringify(old)===oldJson&&old.world.clubs.every(x=>[...x.roster,...x.youthPool].every(p=>!p.playerModel&&p.calm===undefined&&p.heightCm===undefined)));
   const youth=club.youthPool.find(p=>!p.keeper),before=JSON.stringify(youth);v67Grow(youth,{id:'legacy-learning',result:{home:3,away:0}},900);
   check('Legacy learning is disabled only on candidate players',JSON.stringify(youth)===before);
   const appearance={id:'synthetic-approved-test',worldId:c.world.seed,seasonId:1,minutes:90};const unsupported=v153ApplyAppearance(c,youth,appearance,{});
   check('Missing P06 data stays unsupported and cannot book fake development',unsupported.status==='unsupported'&&JSON.stringify(youth)===before);
   const weights={tec:1,pas:1,fin:1,pos:1,calm:1,ant:1,dec:1};appearance.rating=8;appearance.skillWeights=weights;
   const learned=v153ApplyAppearance(c,youth,appearance,weights),after=JSON.stringify(youth),copy=JSON.parse(after),duplicate=v153ApplyAppearance(c,copy,appearance,weights);
   check('Explicit test appearance applies once across JSON reload',learned.status==='applied'&&duplicate.status==='duplicate'&&JSON.stringify(copy)===after&&copy.playerModel.development.seasonMinutes===90);
   const aged=structuredClone(club.roster.find(p=>p.keeper));aged.age=29;const physical={spd:aged.spd,str:aged.str,sta:aged.sta},facts=JSON.stringify([aged.heightCm,aged.foot,aged.playerModel.caps,aged.playerModel.talent,aged.playerModel.playablePositions]);
   v153AgePlayer(c,aged,2);const first=JSON.stringify(aged);v153AgePlayer(c,aged,2);
   check('Age 30 books half-rate physical decline once for keeper, preserving fixed profile',aged.age===30&&aged.spd===Math.max(1,physical.spd-.5)&&aged.str===Math.max(1,physical.str-.5)&&aged.sta===Math.max(1,physical.sta-.25)&&JSON.stringify(aged)===first&&JSON.stringify([aged.heightCm,aged.foot,aged.playerModel.caps,aged.playerModel.talent,aged.playerModel.playablePositions])===facts&&aged.playerModel.development.seasonId===2);
   aged.age=32;const speed=aged.spd;v153AgePlayer(c,aged,3);check('Age 33 books full-rate decline',aged.age===33&&aged.spd===Math.max(1,speed-1));
   const legacy=structuredClone(old.world.clubs[0].roster[0]),legacyAge=legacy.age;v153AgePlayer(old,legacy,2);check('Unmarked player keeps existing age transition',legacy.age===legacyAge+1&&!legacy.playerModel);
   const freshCareer=structuredClone(c);freshCareer.world.season=2;const futureFree=v66NewFreeAgents(freshCareer),futureYouth=v67Youth(freshCareer,club,2,1);
   check('New seasonal cohorts receive correct ledger season and identity',futureFree.every(p=>p.playerModel.development.seasonId===2&&p.playerModel.development.playerId===p.pid)&&futureYouth.age===17&&futureYouth.playerModel.development.seasonId===2);
   const replacementCareer=structuredClone(c),cup=replacementCareer.world.clubs.find(x=>x.simulationOnly),retiring=cup.roster[0];retiring.retirementAge=retiring.age;for(const f of v62Fixtures(replacementCareer))f.result={homeGoals:0,awayGoals:0};v64ArchiveSeason(replacementCareer);const replacement=cup.roster.find(p=>p.n===retiring.n);
   check('Cup retirement replacement uses new candidate generation only in marked world',replacement.pid!==retiring.pid&&replacement.playerModel?.version===2&&replacement.playerModel.development.seasonId===2&&replacement.playerModel.development.worldId===c.world.seed&&replacement.age>=18&&replacement.age<=23);
   youth.playerModel.recommendedRoles=[{position:'mid',roleId:'probe',hiddenTalent:22}];const projection=v153UiPlayer(youth);
   check('UI projection contains bands only and no hidden fields, including roles',Object.values(projection.skills).every(b=>['very-weak','weak','normal','good','very-good'].includes(b))&&!/talent|caps|ledger|hiddenTalent|development/i.test(JSON.stringify(projection))&&JSON.stringify(projection.recommendedRoles)==='[{"position":"mid","roleId":"probe"}]');
   const profilePlayer=club.roster.find(p=>!p.keeper);v61CurrentCareer=c;v68OpenPlayerProfile(c,profilePlayer.pid);const dialog=v61ProfileDialog;
   const labels=[...dialog.querySelectorAll('.v55-skill-groups [role="listitem"]')].map(e=>e.getAttribute('aria-label'));
   const profileText=dialog.textContent;
   const safeProfile=labels.length===12&&labels.some(s=>s.startsWith('Antizipation:'))&&labels.every(s=>!/[0-9]/.test(s))&&!/Talent|Potenzial|Entwicklungspunkte/.test(profileText)&&profileText.includes(profilePlayer.heightCm+' cm')&&profileText.includes('Bevorzugter Fuß');
   if(!safeProfile)throw Error(JSON.stringify({labels,text:profileText,height:profilePlayer.heightCm,open:dialog.open,html:dialog.innerHTML.slice(-450)}));
   check('New profile shows mental/physical abilities as color bands without numeric ability labels',safeProfile);
   dialog.close();doppel6Language.set('en');v68OpenPlayerProfile(c,profilePlayer.pid);doppel6Language.set('en');
   check('Candidate profile height, foot and new abilities translate to English',dialog.textContent.includes('Preferred foot')&&dialog.textContent.includes('Anticipation')&&dialog.textContent.includes('Height'));dialog.close();
   const seasons=v61CreateCareer('GER-2','foundation-seasons');for(let season=1;season<=2;season++){
    const own=v66Own(seasons);v66ChooseSponsor(seasons,own.id,own.sponsors[0].id);v124SetYouthBudget(seasons,0);while(seasons.world.market.phase==='open')await v66NextMarketDay(seasons);
    let guard=0;while(!seasons.world.seasonFinished&&guard++<55)v62AdvanceDay(seasons);
    check('Candidate full compact season '+season+' completes with valid economy and saved profiles',seasons.world.seasonFinished&&v61ValidateCareer(seasons)&&seasons.world.clubs.flatMap(x=>[...x.roster,...x.youthPool]).every(p=>p.playerModel?.version===2));
    if(season===1){if(seasons.world.transition.choice===null)v67ChooseOffer(seasons);v62NextSeason(seasons);check('Actual season transition carries candidate marker and ages once',seasons.world.season===2&&v61ValidateCareer(seasons));}
   }
   return rows;
  });report.checks.push(...checks);assert.deepEqual(report.errors,[]);report.pass=true;console.log(JSON.stringify({pass:true,built,checks:report.checks.length}));
 }catch(e){report.pass=false;report.failure=e.stack;throw e;}
 finally{await browser.close();await new Promise(r=>server.close(r));fs.writeFileSync(path.join(out,built?'build-tests.json':'source-tests.json'),JSON.stringify(report,null,2));}
})().catch(e=>{console.error(e);process.exitCode=1;});
