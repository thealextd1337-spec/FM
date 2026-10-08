const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output=path.resolve('outputs/finance-close-v130');fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const evidence=[];
  for(const [name,url]of [['source',process.env.D6_TEST_URL||'http://127.0.0.1:4196/'],['offline',pathToFileURL(path.resolve('outputs/index.html')).href]]){
   const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.goto(url);await page.waitForFunction(()=>typeof v130SeasonAccounts==='function'&&typeof window.doppel6Language==='object');
   const id=await page.evaluate(async()=>{
    const career=await v61StoreNewCareer(v61CreateCareer('GER-2','finance-close-browser-v130')),club=v66Club(career,'GER-2');
    v61CurrentCareer=career;v61CareerTab='overview';v61RenderCareer(career);return career.id;
   });
   assert.equal(await page.locator('#v124-budget').count(),0,'Sponsor choice comes before finances');assert.equal(await page.locator('[data-v66-sponsor]').count(),3);
   await page.locator('[data-v66-sponsor]').first().click();await page.waitForFunction(()=>!v67Busy&&v61CurrentCareer.world.market.phase==='budget');
   assert.equal(await page.locator('#v124-budget h2').innerText(),'Finanzabschluss');assert.equal(await page.locator('#v124-budget input[type=range]').count(),0);
   assert((await page.locator('#v124-budget').innerText()).includes('Karrierestart'));
   await page.locator('#v67-budget').selectOption('400');
   const projection=await page.evaluate(()=>({balance:v66Own(v61CurrentCareer).balance,expected:v66Credits(v66Own(v61CurrentCareer).balance-400),salary:v66SalaryDue(v61CurrentCareer,'GER-2'),rendered:document.querySelector('#v130-transfer-balance').textContent}));assert.equal(projection.expected,projection.rendered);
   await page.evaluate(()=>window.doppel6Language.set('en'));await page.waitForFunction(()=>document.querySelector('#v124-budget h2').textContent==='Financial statement');assert((await page.locator('#v124-budget').innerText()).includes('Projected salary costs'));assert((await page.locator('#v67-budget').innerText()).includes('Intensive funding'));
   await page.evaluate(()=>window.doppel6Language.set('de'));await page.locator('[data-v124-budget]').click();await page.waitForFunction(()=>v61CurrentCareer.world.market.phase==='open'&&!v67Busy);
   assert.equal(await page.locator('[data-v46-view="overview"]').evaluate(element=>element.classList.contains('v130-showing-close')),false,'Normal overview returns after funding payment');
   const firstCount=await page.evaluate(()=>v66Own(v61CurrentCareer).ledger.filter(row=>row.season===1&&row.id.endsWith(':youth-budget')).length);assert.equal(firstCount,1);
   await page.evaluate(async()=>{while(v61CurrentCareer.world.market.phase==='open')v66NextMarketDay(v61CurrentCareer);while(!v61CurrentCareer.world.seasonFinished)v62AdvanceDay(v61CurrentCareer);const transition=v61CurrentCareer.world.transition;transition.reviewStep=4;if(transition.choice===null)v67ChooseOffer(v61CurrentCareer,null);await v64UiSave();v61CareerTab='overview';v61RenderCareer(v61CurrentCareer);});
   const closing=await page.evaluate(()=>v66Own(v61CurrentCareer).balance);
   await page.locator('[data-v124-next]').click();await page.waitForFunction(()=>v61CurrentCareer.world.season===2&&!v67Busy);
   assert.equal(await page.locator('#v124-budget').count(),0);await page.locator('[data-v66-sponsor]').first().click();await page.waitForFunction(()=>v61CurrentCareer.world.market.phase==='budget'&&!v67Busy);
   const ledger=await page.evaluate(()=>{const career=v61CurrentCareer,club=v66Own(career),data=v130SeasonAccounts(career,club.id,1);return{data,valid:v61ValidateCareer(JSON.parse(JSON.stringify(career))),salaryDue:v66SalaryDue(career,club.id),budgetCount:club.ledger.filter(row=>row.season===2&&row.id.endsWith(':youth-budget')).length};});assert.equal(ledger.data.closing,closing);assert(ledger.data.salaryPaid);assert(ledger.valid);assert.equal(ledger.budgetCount,0);
   assert((await page.locator('#v124-budget').innerText()).includes('Gehälter der abgelaufenen Saison vollständig bezahlt.'));
   for(const details of await page.locator('#v124-budget details').all())await details.locator('summary').click();assert((await page.locator('#v124-budget').innerText()).includes('Transfereinnahmen'));assert((await page.locator('#v124-budget').innerText()).includes('Jugendspielerübernahmen'));
   await page.screenshot({path:path.join(output,name+'-de-mobile.png'),fullPage:true});
   await page.reload();await page.waitForFunction(()=>typeof v130SeasonAccounts==='function');await page.evaluate(id=>v61OpenCareer(id),id);assert.equal(await page.locator('#v124-budget').count(),1);assert.equal(await page.locator('[data-v66-sponsor]').count(),0);
   await page.evaluate(()=>window.doppel6Language.set('en'));await page.waitForFunction(()=>document.querySelector('#v124-budget h2').textContent==='Financial statement');const english=await page.locator('#v124-budget').innerText();assert(english.includes("Last season's salaries have been paid in full."));assert(english.includes('Annual accounts'));assert(english.includes('Sponsor payment already received'));
   for(const width of [320,390,1280]){await page.setViewportSize({width,height:900});const fits=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);if(!fits){console.log(await page.evaluate(()=>Array.from(document.querySelectorAll('body *')).map(element=>({tag:element.tagName,id:element.id,className:typeof element.className==='string'?element.className:'',right:element.getBoundingClientRect().right,text:element.textContent.slice(0,90)})).filter(item=>item.right>innerWidth+1).slice(-12)));await page.screenshot({path:path.join(output,name+'-overflow.png'),fullPage:true});}assert(fits,`No overflow at ${width}px`);}
   await page.screenshot({path:path.join(output,name+'-en-desktop.png'),fullPage:true});
   await page.evaluate(()=>{v66Own(v61CurrentCareer).balance=150;v61RenderCareer(v61CurrentCareer);});assert.equal(await page.locator('#v67-budget option[value="400"]').evaluate(option=>option.disabled),true);assert.equal(await page.locator('#v67-budget').inputValue(),'0');
   assert.deepEqual(errors,[]);evidence.push({build:name,annualClosing:closing,paidSalaries:ledger.data.categories.salaries,projectedSalaries:ledger.salaryDue,source:true,offline:true,languages:['de','en'],reload:true,mobile:true});await context.close();console.log(name+': sponsor before accounts, two seasons, funding, salary projection, save/reload, DE/EN and mobile verified.');
  }
  fs.writeFileSync(path.join(output,'browser-check.json'),JSON.stringify({checkedAt:new Date().toISOString(),evidence,status:'passed'},null,2));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
