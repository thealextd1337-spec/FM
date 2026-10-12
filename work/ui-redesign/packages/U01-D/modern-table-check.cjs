'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const base=path.resolve(__dirname,'../../../..'),runtime='C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node';
if(Number(process.versions.node.split('.')[0])<20){const r=require('node:child_process').spawnSync(path.join(runtime,'bin/node.exe'),[__filename],{stdio:'inherit'});process.exit(r.status??1);}
const {chromium}=require(path.join(runtime,'node_modules/playwright')),{createServer}=require('../../serve.cjs'),{fixture}=require('./fixtures.cjs');
const targets=['ui-flutlicht/views/competitions.js','ui-flutlicht/views/competitions.css'];
const hashes=()=>Object.fromEntries(targets.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(base,'dist',f))).digest('hex')]));
const en={'Platz':'Position','Verein':'Club','Spiele':'Matches','Siege':'Wins','Unentschieden':'Draw','Niederlagen':'Losses','Tore':'Goals','Tordifferenz':'Goal difference','Punkte':'Points'};
(async()=>{
 const before=hashes(),out=path.join(base,'outputs/ui-redesign/U01-D','modern-tables-'+new Date().toISOString().replace(/[:.]/g,'-'));fs.mkdirSync(out,{recursive:true});
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});const page=await browser.newPage(),errors=[],cases=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  for(const file of ['world-start-v61.css','world-economy-v66.css','world-youth-v67.css','world-views-v68.css','ui-flutlicht/views/competitions.css'])await page.addStyleTag({path:path.join(base,'dist',file)});
  await page.addScriptTag({path:path.join(base,'dist/ui-flutlicht/views/competitions.js')});
  for(const width of [320,360,390,768,1280])for(const lang of ['de','en'])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height:900});const data=fixture(lang);
   if(lang==='en')Object.assign(data.translations,en);
   data.html+='<div data-v46-view="competition"><table class="fl-statistic-test"><thead><tr><th>Player</th><th>Rating</th></tr></thead><tbody><tr><td>Player</td><td>7.3</td></tr></tbody></table></div>';
   await page.evaluate(({data,theme})=>{
    D6Flutlicht.registry.dispose(fixtureShell.content);fixtureShell.content.innerHTML=data.html;fixtureShell.content.closest('.fl-shell').id='v61-world-screen';fixtureShell.update({...FL_FIXTURE.frame,themePreference:theme});
    window.testData=data;window.testActions={t:text=>data.translations[text]||text};window.links=[...fixtureShell.content.querySelectorAll('[data-v68-club]')];window.testClubCalls=0;
    links.forEach(link=>link.addEventListener('click',()=>testClubCalls++));D6Flutlicht.registry.enhance(fixtureShell.content,data,testActions);
   },{data,theme});
   const table=page.locator('[data-v46-view="competition"] .fl-competition-table').first();
   assert.equal(await table.locator('thead th').count(),9);assert.equal(await table.getAttribute('role'),'table');
   assert.equal(await table.locator('[role=rowheader]').count(),6);
   assert.equal(await page.locator('.fl-statistic-test [data-fl-standing-field]').count(),0);
   assert.equal(await page.locator('[data-v46-view=overview] [data-fl-standing-field]').count(),0);
   const dimensions=await table.evaluate(table=>{
    const row=table.tBodies[0].rows[0],wrap=table.closest('.v62-table-wrap'),point=row.querySelector('[data-fl-standing-field=points]'),club=row.querySelector('[data-fl-standing-field=club]');
    return {display:getComputedStyle(table).display,overflow:wrap.scrollWidth>wrap.clientWidth+1,fields:[...row.cells].map(cell=>cell.dataset.flStandingField),labels:[...row.cells].map(cell=>cell.dataset.flLabel),pointRow:getComputedStyle(point).gridRowStart,clubRow:getComputedStyle(club).gridRowStart,pointRight:point.getBoundingClientRect().right,tableRight:table.getBoundingClientRect().right,clubText:club.textContent,clubTarget:club.querySelector('button').getBoundingClientRect().height};
   });
   assert.deepEqual(dimensions.fields,['rank','club','played','wins','draws','losses','goals','difference','points']);
   assert.equal(dimensions.labels.at(-1),lang==='en'?'Points':'Punkte');
   assert.match(dimensions.clubText,lang==='en'?/Football Club With A Long Name 1/:/Fußballclub mit einem langen Namen 1/);
   if(width<=900){assert.equal(dimensions.display,'block');assert.equal(dimensions.overflow,false,`standing overflow ${width}/${lang}/${theme}`);assert.equal(dimensions.pointRow,'1');assert.equal(dimensions.clubRow,'1');assert.equal(dimensions.pointRight<=dimensions.tableRight+1,true);assert.equal(dimensions.clubTarget>=44,true);}else assert.equal(dimensions.display,'table');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.evaluate(()=>D6Flutlicht.registry.enhance(fixtureShell.content,testData,testActions));assert.equal(await table.locator('thead th').count(),9);assert.equal(await page.evaluate(()=>links.every(n=>n.isConnected)),true);
   await table.locator('[data-v68-club]').first().click();assert.equal(await page.evaluate(()=>testClubCalls),1);
   if([360,1280].includes(width)&&lang==='en')await page.screenshot({path:path.join(out,`fixture-${width}-${theme}.png`),fullPage:true,animations:'disabled'});
   cases.push({width,lang,theme,...dimensions});
  }
  // Native league and Crown rows, profile actions, and adjacent country ranking
  // come from the actual expansion page. No simulation or fabricated results.
  await page.goto(`http://127.0.0.1:${server.address().port}/source/index.html`);await page.waitForFunction(()=>v61StorageReady);
  await page.evaluate(async()=>{v61CurrentCareer=await v61StoreNewCareer(v167CreateCareer('GER-2','modern-table-source','Tabellentest'));v61RenderCareer(v61CurrentCareer);v61SetCareerTab('competition',false);});
  await page.locator('.fl-competition-table').first().waitFor();
  const source=await page.evaluate(()=>({tables:[...document.querySelectorAll('[data-v46-view=competition] .fl-competition-table')].map(table=>({id:table.dataset.flCompetitionId,rows:table.tBodies[0].rows.length,columns:table.tHead.rows[0].cells.length})),original:JSON.stringify(v61CurrentCareer)}));
  assert.equal(source.tables.some(t=>t.id.includes('CROWN')&&t.rows===26&&t.columns===9),true);
  assert.equal(source.tables.some(t=>t.id.includes('GER')&&t.rows===8&&t.columns===9),true);
  for(const width of [320,390,1280])for(const section of ['league','crown','countries']){
   await page.setViewportSize({width,height:900});
   assert.equal(await page.evaluate(section=>D6Flutlicht.navigation.select('competition',section),section),true);
   assert.equal(await page.locator('.fl-competition-table-wrap:visible').evaluateAll(nodes=>nodes.length>0&&nodes.every(node=>node.scrollWidth<=node.clientWidth+1)),true,`native ${section} table overflow ${width}`);
   if(width!==320||section==='league')await page.screenshot({path:path.join(out,`native-${section}-${width}.png`),fullPage:true,animations:'disabled'});
  }
  assert.equal(await page.locator('[data-fl-expansion-section=ranking] [data-fl-standing-field]').count(),0);
  await page.evaluate(()=>D6Flutlicht.navigation.select('competition','league'));
  await page.locator('[data-v46-view=competition] .fl-competition-table').first().locator('[data-v68-club]').first().click();await page.locator('[data-v68-detail]').waitFor();await page.locator('[data-v68-detail] [data-v68-back]').click();
  assert.equal(await page.evaluate(original=>original===JSON.stringify(v61CurrentCareer),source.original),true);
  assert.deepEqual(errors,[]);assert.deepEqual(hashes(),before,'owned source changed during test');fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify({target:'fixture/source',cases,source:{tables:source.tables},checks:['mobile rank/full club/points in first row','six labelled secondary statistics','desktop table/explicit roles','original links preserved/idempotency','native league/Crown and club profile','country rating not relabelled','career unchanged/no simulation','stable owned hashes'],errors,hashes:before},null,2));console.log(out);
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
