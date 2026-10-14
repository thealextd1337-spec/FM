// Browserprüfung B16/B17 (Popups nach „Nächster Transfertag“, Angebot zurückziehen): Desktop + 390 px, DE/EN.
// Start: Node >= 20, Testserver auf Port 4212 (SECHSER_PORT=4212 node work/server.cjs).
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.D6_PLAYWRIGHT||'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const url=process.env.D6_TEST_URL||'http://127.0.0.1:4212/';
const output=path.resolve('outputs/offer-reply-r132');fs.mkdirSync(output,{recursive:true});
const combos=[{name:'desktop',width:1280,height:900,lang:'de'},{name:'desktop',width:1280,height:900,lang:'en'},{name:'mobile',width:390,height:844,lang:'de'},{name:'mobile',width:390,height:844,lang:'en'}];
const T={
 de:{next:'Nächster Transfertag',accept:'Spielervertrag verhandeln',counter:'Gegenangebot bearbeiten',contract:'Vertragsforderung bearbeiten',later:'Später',cont:'Weiter',retract:'Angebot zurückziehen',confirm:'Angebot endgültig zurückziehen',overview:'Zur Transferübersicht',titles:['Verein stimmt der Ablöse zu','Gegenangebot des Vereins','Transfer abgelehnt','Gegenforderung des Spielers'],reason:'Du hast das Angebot zurückgezogen.',confirmTitle:'Angebot zurückziehen?'},
 en:{next:'Next transfer day',accept:'Negotiate player contract',counter:'Edit counteroffer',contract:'Edit contract demand',later:'Later',cont:'Continue',retract:'Withdraw offer',confirm:'Withdraw offer permanently',overview:'Back to transfer overview',titles:['Club agrees to the transfer fee',"Club's counteroffer",'Transfer rejected',"Player's counteroffer"],reason:'You withdrew the offer.',confirmTitle:'Withdraw offer?'}
};
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.D6_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const errors=[];
 try{
  for(const combo of combos){
   const text=T[combo.lang],label=`${combo.name}-${combo.lang}`;
   const context=await browser.newContext({viewport:{width:combo.width,height:combo.height}}),page=await context.newPage();
   page.on('pageerror',error=>errors.push(`${label}: ${error.message}`));
   page.on('console',message=>{if(message.type()==='error')errors.push(`${label}: ${message.text()}`)});
   await page.goto(url);await page.waitForFunction(()=>typeof v72ShowResults==='function'&&typeof window.doppel6Language==='object');
   await page.evaluate(lang=>window.doppel6Language.set(lang),combo.lang);
   const names=await page.evaluate(()=>{
    const career=v61CreateCareer('GER-2','r132-browser'),own=v66Club(career,'GER-2');
    v61CurrentCareer=career;v61WorldScreen.hidden=false;v61CareerTab='transfers';
    v66ChooseSponsor(career,own.id,own.sponsors[0].id);if(career.world.market.phase==='budget')v124SetYouthBudget(career,0);own.balance=100000;
    const used=new Set(),picks=[];
    for(const club of career.world.clubs.filter(item=>item.id!==own.id&&!item.simulationOnly&&item.roster.length===11)){
     const player=club.roster.find(item=>!item.keeper&&!v72Listing(career,item.pid)&&v72Willingness(career,item.pid,own.id)!=='no');
     if(player&&!used.has(club.id)){used.add(club.id);picks.push({club,player})}
     if(picks.length===3)break;
    }
    const[a,b,c]=picks,floor=v72Floor({ask:v66Value(b.player),reason:'direct'});
    v72Start(career,a.player.pid,v66Value(a.player));
    const dealB=v72Start(career,b.player.pid,10);v72SubmitFee(career,dealB.id,floor-10);
    v72Start(career,c.player.pid,v66Value(c.player));c.club.roster=c.club.roster.filter(item=>item.pid===c.player.pid||item.keeper);
    const free=career.world.market.freePlayers.find(item=>v66Consent(career,{pid:item.pid,buyerId:own.id,sellerId:null,annual:60,years:2,promise:3}).minimum>60);v66MakeBid(career,own.id,free.pid,0,60,2,3);
    v61RenderCareer(career);
    window.__r132={freePid:free.pid,dealB:dealB.id,names:[a,b,c].map(item=>item.player.name),clubs:[a,b,c].map(item=>item.club.name),freeName:free.name};
    return window.__r132;
   });
   const dialog=page.locator('#v72-transfer-dialog');
   await page.getByRole('button',{name:text.next}).click();
   const seen=[];
   async function shot(name){await page.screenshot({path:path.join(output,`${label}-${name}.png`)})}
   async function overflow(){return page.evaluate(()=>{const d=document.querySelector('#v72-transfer-dialog');return d.scrollWidth<=d.clientWidth+1&&document.documentElement.scrollWidth<=window.innerWidth+1})}
   async function title(expected){await dialog.waitFor({state:'visible'});if(expected)await page.waitForFunction(value=>{const d=document.querySelector('#v72-transfer-dialog');return d?.open&&d.querySelector('h2')?.textContent.trim()===value},expected,{timeout:5000}).catch(()=>{});return(await dialog.locator('h2').first().textContent()).trim()}
   // 1) Annahme des Vereins
   assert.equal(await title(text.titles[0]),text.titles[0]);seen.push(1);
   let content=await dialog.textContent();assert(content.includes(names.names[0])&&content.includes(names.clubs[0]),'Annahme nennt Spieler und Verein');
   assert(await overflow(),'kein Überlauf (Annahme)');await shot('1-annahme');
   await dialog.getByRole('button',{name:text.accept}).click();
   await dialog.locator('#v72-salary').waitFor();await shot('1b-vertrag');
   assert.equal(await page.evaluate(()=>document.activeElement?.id),'v72-dialog-title','Fokus liegt nach „Spielervertrag verhandeln“ auf der Überschrift');
   await dialog.getByRole('button',{name:text.overview}).first().click();
   // 2) Gegenangebot
   assert.equal(await title(text.titles[1]),text.titles[1]);
   content=await dialog.textContent();assert(content.includes(names.names[1])&&content.includes(names.clubs[1]));
   assert(await overflow(),'kein Überlauf (Gegenangebot)');await shot('2-gegenangebot');
   await dialog.getByRole('button',{name:text.later}).click();
   // 3) Ablehnung
   assert.equal(await title(text.titles[2]),text.titles[2]);
   content=await dialog.textContent();assert(content.includes(names.names[2]));
   assert(await overflow());await shot('3-ablehnung');
   await dialog.getByRole('button',{name:text.cont}).click();
   // 4) Gegenforderung ablösefreier Spieler
   assert.equal(await title(text.titles[3]),text.titles[3]);
   content=await dialog.textContent();assert(content.includes(names.freeName));
   assert(await overflow());await shot('4-spieler');
   await dialog.getByRole('button',{name:text.contract}).click();
   await dialog.locator('[data-v72-free-improve]').waitFor();
   assert.equal(await page.evaluate(()=>document.activeElement?.id),'v72-dialog-title','Fokus nach „Bearbeiten“ auf der Überschrift');
   // Zurückziehen (ablösefrei): Bestätigung, Rückkehr, endgültig
   await dialog.getByRole('button',{name:text.retract}).click();
   assert.equal(await title(text.confirmTitle),text.confirmTitle);await shot('5-bestaetigung');
   await dialog.locator('[data-v72-retract-back]').click();
   await dialog.getByRole('button',{name:text.retract}).click();
   await dialog.locator('[data-v72-retract-confirm]').click();
   await dialog.locator('[data-v72-free-offer]').waitFor();
   assert.equal(await page.evaluate(()=>document.activeElement?.id),'v72-dialog-title','Fokus nach dem Zurückziehen auf der Überschrift');
   assert((await dialog.textContent()).includes(text.reason),'Rückzugsgrund sichtbar');
   assert.equal(await dialog.locator('[data-v72-free-offer]').isDisabled(),false,'neues Angebot sofort möglich');
   await shot('6-nach-rueckzug');
   await dialog.locator('[data-v72-close]').first().click();
   // Zurückziehen (Ablöse): Gegenangebot-Verhandlung öffnen
   await page.evaluate(()=>v72RenderDeal(v61CurrentCareer,window.__r132.dealB));
   await dialog.getByRole('button',{name:text.retract}).click();await dialog.locator('[data-v72-retract-confirm]').click();
   await dialog.locator('[data-v72-reopen]').waitFor();await shot('7-ablöse-zurückgezogen');
   await dialog.locator('[data-v72-reopen]').click();await dialog.locator('#v72-fee').waitFor();
   const state=await page.evaluate(()=>{const career=v61CurrentCareer,market=career.world.market;return{unseen:market.transferResults.filter(item=>!item.seen).length,decisions:market.decisions.filter(item=>item.negotiationId===window.__r132.dealB).length,roster:v66Own(career).roster.length}});
   assert.equal(state.decisions,0,'keine Sperre');
   // Reload-Stand: gespeicherte Karriere liefert keine ungesehenen Popups mehr
   assert.equal(state.unseen,0);
   await dialog.locator('[data-v72-close]').first().click();await page.waitForFunction(()=>!document.querySelector('#v72-transfer-dialog')?.open);
   // Altes Gebot an einen Verein: Zurückziehen über den Dialog in der Transferübersicht
   await page.evaluate(()=>{
    const career=v61CurrentCareer,own=v66Own(career),market=career.world.market;
    const club=career.world.clubs.find(item=>item.id!==own.id&&!item.simulationOnly&&item.roster.length===11&&item.roster.some(player=>!player.keeper&&!market.negotiations.some(entry=>entry.pid===player.pid)));
    const player=club.roster.find(item=>!item.keeper&&!market.negotiations.some(entry=>entry.pid===item.pid));
    window.__r132.legacy=v66MakeBid(career,own.id,player.pid,Math.round(v66Value(player)*1.3/10)*10,60,2,3).id;
    v61CareerTab='transfers';v61RenderCareer(career);v61SetCareerTab('transfers');
   });
   await page.locator('[data-fl-section-tab="offers"]:visible').first().click();
   await page.locator('[data-v72-legacy-open]').first().click();
   assert.equal(await title(text.confirmTitle),text.confirmTitle);await shot('8-altgebot');
   await dialog.locator('[data-v72-retract-confirm]').click();
   await page.waitForFunction(()=>!document.querySelector('#v72-transfer-dialog')?.open);
   assert.equal(await page.evaluate(()=>v61CurrentCareer.world.market.pendingBids.find(item=>item.id===window.__r132.legacy).status),'rejected');
   // Altgebot mit Gehaltsforderung: Popup beim Tageswechsel, „Vertragsforderung bearbeiten“ fokussiert das sichtbare Gehaltsfeld
   await page.evaluate(()=>{
    const career=v61CurrentCareer,own=v66Own(career),market=career.world.market;
    const club=career.world.clubs.find(item=>item.id!==own.id&&!item.simulationOnly&&item.roster.length===11&&!market.negotiations.some(entry=>entry.sellerId===item.id)&&!market.pendingBids.some(entry=>entry.sellerId===item.id||entry.buyerId===item.id)&&item.roster.some(player=>!player.keeper));
    const player=club.roster.find(item=>!item.keeper&&!market.negotiations.some(entry=>entry.pid===item.pid)&&!market.pendingBids.some(entry=>entry.pid===item.pid));
    window.__r132.counterBid=v66MakeBid(career,own.id,player.pid,Math.round(v66Value(player)*1.3/10)*10,60,2,3).id;
    window.__r132.counterName=player.name;window.__r132.counterClub=club.name;
    v61CareerTab='overview';v61RenderCareer(career);
   });
   assert.equal(await page.locator('#v72-transfer-dialog[open]').count(),0,'Abgeben des Gebots zeigt kein Popup');
   await page.getByRole('button',{name:text.next}).click();
   let reached=false;
   for(let round=0;round<8&&!reached;round++){
    await dialog.waitFor({state:'visible',timeout:5000}).catch(async error=>{console.log(label,'DEBUG',await page.evaluate(()=>JSON.stringify({day:v61CurrentCareer.world.market.day,phase:v61CurrentCareer.world.market.phase,results:v61CurrentCareer.world.market.transferResults.map(r=>[r.kind,r.released,r.seen,r.day,r.negotiationId]),bids:v61CurrentCareer.world.market.pendingBids.map(b=>[b.id,b.status,b.sellerId,b.reason,b.annual,b.price]),btn:document.querySelector('#career-progress-action')?.textContent})));throw error});
    const current=await title();
    if(current===text.titles[3]&&(await dialog.textContent()).includes(await page.evaluate(()=>window.__r132.counterName))){reached=true;break}
    const next=dialog.getByRole('button',{name:text.later}).or(dialog.getByRole('button',{name:text.cont}));
    await next.first().click();
    await page.waitForFunction(previous=>{const d=document.querySelector('#v72-transfer-dialog');return !d?.open||d.querySelector('h2')?.textContent.trim()!==previous},current,{timeout:5000}).catch(()=>{});
   }
   assert(reached,'Popup mit Gehaltsforderung zum Altgebot');
   assert((await dialog.textContent()).includes(await page.evaluate(()=>window.__r132.counterClub)),'Popup nennt den Verkäufer');
   await shot('9-altgebot-forderung');
   await dialog.getByRole('button',{name:text.contract}).click();
   await page.waitForFunction(()=>!document.querySelector('#v72-transfer-dialog')?.open);
   const focus=await page.evaluate(()=>{const el=document.activeElement;return{salary:el?.dataset?.v66CounterSalary||null,visible:!!el&&el.offsetParent!==null}});
   if(!focus.salary)console.log(label,'FOCUSDEBUG',await page.evaluate(()=>{const el=document.querySelector('[data-v66-counter-salary]');let hidden=null,n=el;while(n){if(getComputedStyle(n).display==='none'){hidden=n.tagName+'#'+n.id+'.'+n.className;break}n=n.parentElement}return JSON.stringify({active:document.activeElement?.tagName+'#'+document.activeElement?.id,exists:!!el,hidden,tab:v61CareerTab,wsHidden:v61WorldScreen.hidden})}));
   assert.equal(focus.salary,await page.evaluate(()=>window.__r132.counterBid),'Gehaltsfeld des Altgebots hat den Fokus');
   assert(focus.visible,'Gehaltsfeld ist sichtbar (Unterbereich Angebote gewählt)');
   await context.close();
   console.log('OK',label);
  }
  assert.deepEqual(errors,[],'keine Browserfehler');
  console.log('PASS Browserprüfung B16/B17 (Desktop + 390 px, DE/EN); Bilder in '+output);
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
