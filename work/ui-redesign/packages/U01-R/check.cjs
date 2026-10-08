'use strict';
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'../../../..');
const files=['tokens.css','components.css','components.js','shell.js'].map(file=>path.join(base,'dist/ui-flutlicht',file));
const hashes=()=>Object.fromEntries(files.map(file=>[path.basename(file),crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
const output=path.join(base,'outputs/ui-redesign/U01-R/fixture-2026-10-07');fs.mkdirSync(output,{recursive:true});
(async()=>{
 const before=hashes(),browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const checks=[];
 try{
  const page=await browser.newPage();
  await page.setContent('<html><head></head><body style="margin:0"><main id="v61-world-screen"><div id="host"></div></main></body></html>');
  for(const file of files){if(file.endsWith('.css'))await page.addStyleTag({content:fs.readFileSync(file,'utf8')});else await page.addScriptTag({content:fs.readFileSync(file,'utf8')});}
  await page.evaluate(()=>{
   const C=D6Flutlicht.components;
   window.fixture={clubName:'Fußballverein Lange Vereinsnamen 1906',clubMeta:'Deutschland · Erste Liga',managerLabel:'Alex · Saison 4',titles:[{kind:'league',label:'Meister'},{kind:'cup',label:'Pokalsieger'},{kind:'europe',label:'Europacupsieger'}],navigation:['overview','squad','transfers','competition','calendar','statistics','club','settings'].map((id,i)=>({id,label:['Übersicht','Kader','Transfers','Wettbewerbe','Kalender','Statistiken','Verein','Hilfe & Einstellungen'][i]})),activeRoute:'overview',leadAction:{label:'Nächsten Transfertag beginnen'},themePreference:'system',labels:{brand:'Doppel 6',menu:'Menü',close:'Menü schließen',skip:'Zum Hauptinhalt',navigation:'Karrieremenü'},language:'de'};
   window.actions=[];window.shell=D6Flutlicht.shell.mount(document.querySelector('#host'),fixture,{navigate:id=>{actions.push(id);fixture={...fixture,activeRoute:id};shell.update(fixture);},lead:()=>actions.push('lead')});
   shell.content.innerHTML=`<h1>Deine Vereinszentrale</h1><section><h2>Gemeinsame Bausteine</h2><input id="preserve" aria-label="Suche" value="Erhaltener Filter"><p>${['violetgray','bluegray','yellow','orange','pink'].map((band,i)=>C.skill({label:['Tempo','Tackling','Passspiel','Technik','Abschluss'][i],band,colorLabel:['Violettgrau','Blaugrau','Gelb','Orange','Pink'][i]})).join(' ')}</p><p>${['violetgray','bluegray','yellow','orange','pink'].map((band,i)=>C.form({band,label:['Sehr schwach','Schwach','Normal','Gut','Sehr gut'][i]})).join(' ')}</p>${C.freshness({band:'orange',percent:84,label:'Frische'})}<p>${C.result({outcome:'win',label:'S',detail:'Heimspiel gegen Hafen, 3:1'})}</p><table class="fl-data-table"><thead><tr><th><button type="button">Name sortieren</button></th><th>Spiele</th><th>Tore</th></tr></thead><tbody><tr><th scope="row" data-fl-label="Name">Alexander außergewöhnlich langer Spielername</th><td data-fl-label="Spiele">6 (3)</td><td data-fl-label="Tore"><button type="button" data-fl-tooltip="Drei Tore in dieser Saison" aria-describedby="original-help">3</button></td></tr></tbody></table><p id="original-help">Erfasste Saisonwerte</p></section>`;
  });
  for(const width of [320,390,768,1440])for(const theme of ['light','dark'])for(const language of ['de','en']){
   await page.setViewportSize({width,height:844});await page.emulateMedia({colorScheme:theme,reducedMotion:'reduce'});
   await page.evaluate(language=>{fixture={...fixture,language,labels:{...fixture.labels,menu:language==='en'?'Menu':'Menü',navigation:language==='en'?'Career navigation':'Karrieremenü'}};shell.update(fixture);},language);
   const state=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,theme:document.querySelector('#host').dataset.flTheme,preserved:document.querySelector('#preserve').value,animation:getComputedStyle(document.querySelector('.fl-face')).animationName,sortVisible:!!document.querySelector('thead button').getClientRects().length}));
   assert.equal(state.overflow,false,`${width}/${theme}/${language} overflow`);assert.equal(state.theme,theme);assert.equal(state.preserved,'Erhaltener Filter');assert.equal(state.animation,'none');assert.equal(state.sortVisible,true);checks.push({width,theme,language,...state});
   if(language==='de'&&[390,1440].includes(width))await page.screenshot({path:path.join(output,`shell-${width}-${theme}.png`),fullPage:true});
  }
  await page.setViewportSize({width:390,height:844});
  await page.locator('[data-fl-menu]').click();assert.equal(await page.locator('.fl-menu-panel').evaluate(node=>node.open),true);
  await page.keyboard.press('Escape');assert.equal(await page.locator('[data-fl-menu]').evaluate(node=>node===document.activeElement),true);
  await page.locator('[data-fl-menu]').click();await page.locator('.fl-menu-panel [data-fl-route=settings]').click();assert.equal(await page.locator('.fl-content').evaluate(node=>node===document.activeElement),true);
  const tipButton=page.locator('td button[data-fl-tooltip]');await tipButton.click();assert.equal(await page.locator('.fl-tooltip').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await tipButton.getAttribute('aria-describedby'),'original-help');
  await tipButton.click();await page.locator('h1').click();assert.equal(await page.locator('.fl-tooltip').isVisible(),false);
  await tipButton.focus();assert.equal(await page.locator('.fl-tooltip').isVisible(),true);await page.evaluate(()=>document.dispatchEvent(new Event('scroll')));assert.equal(await page.locator('.fl-tooltip').isVisible(),false);
  await page.evaluate(()=>{fixture={...fixture,themePreference:'light'};shell.update(fixture)});await page.emulateMedia({colorScheme:'dark'});assert.equal(await page.locator('#host').getAttribute('data-fl-theme'),'light');
  const purity=await page.evaluate(()=>{const C=D6Flutlicht.components;return {escaped:C.skill({label:'<script>x</script>',band:'42',colorLabel:'Unbekannt'}),known:C.skill({label:'Tempo',band:'pink',colorLabel:'Pink'})}});assert.ok(!purity.escaped.includes('<script>'));assert.ok(purity.escaped.includes('fl-band-unknown'));assert.ok(!purity.known.includes('42'));
  await page.evaluate(()=>shell.unmount());assert.equal(await page.locator('.fl-tooltip').count(),0);assert.equal(await page.locator('#host').evaluate(node=>node.childElementCount),0);
  const after=hashes();assert.deepEqual(after,before);
  fs.writeFileSync(path.join(output,'checks.json'),JSON.stringify({passed:true,before,after,checks,interactionChecks:['native menu escape and return focus','route focus','tooltip click/escape/outside/focus/scroll and describedby restore','manual theme overrides device','content input preserved','escaped pure components','unmount cleanup'],limitations:['Synthetic sanitized fixture, not integrated game','No physical mobile device, Safari, or screen-reader evidence']},null,2));
  console.log(JSON.stringify({passed:true,cases:checks.length,output}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
