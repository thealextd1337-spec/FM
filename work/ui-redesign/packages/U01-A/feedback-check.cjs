'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const base=path.resolve(__dirname,'../../../..'),runtime='C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node';
if(Number(process.versions.node.split('.')[0])<20){const r=require('node:child_process').spawnSync(path.join(runtime,'bin/node.exe'),[__filename],{stdio:'inherit'});process.exit(r.status??1);}
const {chromium}=require(path.join(runtime,'node_modules/playwright')),{createServer}=require('../../serve.cjs'),{fixture}=require('./fixtures.cjs');
const relevant=['tokens.css','components.css','components.js','shell.js','registry.js','views/overview.js','views/overview.css'].map(f=>'dist/ui-flutlicht/'+f);
const hashes=()=>Object.fromEntries(relevant.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(base,f))).digest('hex')]));
const labels={'Vereinskennzahlen':'Club key figures','Im Vereinsbüro':'At the club office','Ansehen':'View','Aktuell keine offenen Aufgaben.':'No open tasks at the moment.','Fristen und offene Entscheidungen bleiben hier sichtbar.':'Deadlines and open decisions remain visible here.','Dein finanzieller Spielraum':'Your financial room','Aktueller Kontostand':'Current balance','Finanzen':'Finances','Nicht erfasst':'Not recorded'};
function feedbackFixture(language,empty=false){
 const data=fixture(language),en=language==='en';
 Object.assign(data.translations,en?labels:{});
 data.overview.kpis=[{label:en?'League rank':'Ligaplatz',value:'2.',detail:en?'of 6':'von 6'},{label:en?'League points':'Ligapunkte',value:'13',detail:en?'from 6 games':'aus 6 Spielen'},{label:en?'Balance':'Kontostand',value:'2.840',detail:'Credits'},{label:en?'Professional squad':'Profikader',value:'11',detail:en?'of 14 places':'von 14 Plätzen'}];
 data.overview.office=empty?[]:[{id:'offers',title:en?'An offer needs your decision':'Ein Angebot wartet auf dich',detail:en?'Riverside FC offers 690 Credits.':'Beispielstadt bietet 690 Credits.',route:'transfers',section:'offers',actionLabel:en?'View offer':'Angebot ansehen'},{id:'contracts',title:en?'Two contracts expire':'Zwei Verträge laufen aus',detail:en?'Two players are contracted until the end of this season.':'Zwei Spieler sind bis zum Saisonende gebunden.',route:'squad',section:'contracts'},{id:'youth',title:en?'Youth candidates available':'Nachwuchs ist bereit',detail:en?'Three youth candidates are available.':'Drei Kandidaten stehen zur Auswahl.',route:'squad',section:'youth'}];
 data.overview.finance={balanceLabel:'2.840 Credits',rows:[{label:en?'Salaries at season end':'Gehälter zum Saisonende',valueLabel:'−1.380 Credits'},{label:en?'Unpaid secure income':'Noch sichere Einnahmen',valueLabel:'+450 Credits'},{label:en?'Secure closing forecast':'Sichere Schlussprognose',valueLabel:'1.910 Credits',tone:'total'},{label:en?'With possible sponsor bonuses':'Mit möglichen Sponsorboni',valueLabel:'2.260 Credits'}],note:en?'Future transfers and further sporting success are not included.':'Weitere Transfers und sportliche Erfolge sind noch nicht enthalten.'};
 const logo='<svg class="v66-sponsor-logo v97-sponsor-wordmark" data-v66-brand="relay-house" viewBox="0 0 340 110" style="color:#f7f4e9" aria-hidden="true"><rect width="340" height="110" rx="5" fill="#18302e"/><g fill="currentColor"><text x="94" y="46" font-size="32">RELAY</text><text x="94" y="79" font-size="28">HOUSE</text></g></svg>';
 data.html=data.html.replace(/<svg viewBox="0 0 200 60"[\s\S]*?<\/svg>/,logo);data.overview.sponsor.logoHTML=logo;
 return data;
}
(async()=>{
 const before=hashes(),out=path.join(base,'outputs/ui-redesign/U01-A','feedback-'+new Date().toISOString().replace(/[:.]/g,'-'));fs.mkdirSync(out,{recursive:true});
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const page=await browser.newPage(),errors=[],cases=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  for(const file of ['world-start-v61.css','world-economy-v66.css','world-youth-v67.css','world-views-v68.css','ui-flutlicht/tokens.css','ui-flutlicht/components.css','ui-flutlicht/views/overview.css'])await page.addStyleTag({path:path.join(base,'dist',file)});
  await page.addScriptTag({path:path.join(base,'dist/ui-flutlicht/registry.js')});await page.addScriptTag({path:path.join(base,'dist/ui-flutlicht/views/overview.js')});
  async function render(language,theme,empty=false){await page.evaluate(({data,theme})=>{
   D6Flutlicht.registry.dispose(fixtureShell.content);fixtureShell.content.innerHTML=data.html;fixtureShell.content.closest('.fl-shell').id='v61-world-screen';fixtureShell.update({...FL_FIXTURE.frame,themePreference:theme});
   window.testData=data;window.navigationCalls=[];window.testActions={t:text=>data.translations[text]||text,navigate:(route,options)=>navigationCalls.push({route,...options})};
   window.keptNodes=[...fixtureShell.content.querySelectorAll('[data-v68-club],[data-v67-review-next],[data-v124-budget],tbody tr')];
   const before=JSON.stringify(data);D6Flutlicht.registry.enhance(fixtureShell.content,{overview:data.overview},testActions);if(JSON.stringify(data)!==before)throw Error('Projection mutated');
  },{data:feedbackFixture(language,empty),theme});}
  for(const width of [320,390,768,1440])for(const theme of ['light','dark'])for(const language of ['de','en']){
   await page.setViewportSize({width,height:956});await render(language,theme);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${width}/${theme}/${language}`);
   assert.equal(await page.locator('.fl-overview-kpis>div').count(),4);assert.equal(await page.locator('.fl-overview-office li').count(),3);assert.equal(await page.locator('.fl-overview-finance dl>div').count(),4);
   assert.equal(await page.evaluate(()=>keptNodes.every(n=>n.isConnected)),true);
   assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('.fl-overview-sponsor svg>rect')).fill),'rgb(37, 47, 58)');
   for(let i=0;i<3;i++)await page.evaluate(()=>D6Flutlicht.registry.enhance(fixtureShell.content,{overview:testData.overview},testActions));
   assert.equal(await page.locator('.fl-overview-kpis').count(),1);assert.equal(await page.locator('.fl-overview-office').count(),1);assert.equal(await page.locator('.fl-overview-grid').count(),1);
   await page.locator('.fl-overview-office [data-fl-overview-route]').first().click();await page.locator('.fl-overview-section-head button').click();
   assert.deepEqual(await page.evaluate(()=>navigationCalls),[{route:'transfers',section:'offers'},{route:'club',section:'finances'}]);
   const arrangement=await page.evaluate(()=>{const node=document.querySelector('.fl-overview-main'),main=node.getBoundingClientRect(),aside=document.querySelector('.fl-overview-aside').getBoundingClientRect(),fixture=document.querySelector('.fl-overview-fixture').getBoundingClientRect();return{mainX:main.x,asideX:aside.x,mainY:main.y,asideY:aside.y,fixtureBottom:fixture.bottom,mainDisplay:getComputedStyle(node).display};});
   if(width===1440){assert.ok(arrangement.asideX>arrangement.mainX,JSON.stringify(arrangement));assert.ok(Math.abs(arrangement.mainY-arrangement.asideY)<1,JSON.stringify(arrangement));}else{assert.equal(arrangement.mainDisplay,'contents');assert.ok(arrangement.asideY>=arrangement.fixtureBottom,JSON.stringify(arrangement));}
   cases.push({width,theme,language,passed:true});if([390,1440].includes(width)&&language==='de')await page.screenshot({path:path.join(out,`overview-${width}-${theme}.png`),fullPage:true,animations:'disabled'});
  }
  await render('en','dark',true);assert.match(await page.locator('.fl-overview-office').textContent(),/No open tasks at the moment/);assert.equal(await page.locator('.fl-overview-office [data-fl-overview-route]').count(),0);
  await page.evaluate(()=>document.querySelector('.fl-overview').classList.add('v67-showing'));assert.equal(await page.locator('#v67-season-show').isVisible(),true);assert.equal(await page.locator('.fl-overview-grid').isVisible(),false);assert.equal(await page.locator('.fl-overview-kpis').isVisible(),false);
  await page.evaluate(()=>{const view=document.querySelector('.fl-overview');view.classList.remove('v67-showing');view.classList.add('v130-showing-close');});assert.equal(await page.locator('#v124-budget').isVisible(),true);assert.equal(await page.locator('.fl-overview-grid').isVisible(),false);
  assert.deepEqual(errors,[]);assert.deepEqual(hashes(),before,'Relevant source changed during run');
  fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify({target:'focused fixture',cases,checks:['4 projected KPIs','office then finance','desktop columns/mobile stack','real native nodes preserved','projection unchanged','idempotent navigation','neutral sponsor plate','empty office','review/budget phase visibility'],errors,hashes:before},null,2));console.log(out);
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
