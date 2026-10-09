'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve('dist'),output=path.resolve('outputs/season-close-119');fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(error,data)=>{if(error){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.end(data);});});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const rows=[];
 try{
  const seedContext=await browser.newContext(),seedPage=await seedContext.newPage();await seedPage.goto(url);await seedPage.waitForFunction(()=>typeof v119CloseSponsorHTML==='function'&&window.D6Flutlicht?.adapter);
  const seed=await seedPage.evaluate(()=>{
   const career=v61CreateCareer('GER-2','season-close-119'),club=v66Own(career);v66ChooseSponsor(career,club.id,club.sponsors[0].id);v124SetYouthBudget(career,200);
   while(career.world.market.phase==='open')v66NextMarketDay(career);
   while(!career.world.seasonFinished)v62AdvanceDay(career);
   if(career.world.transition.choice===null)v67ChooseOffer(career,null);
   career.world.transition.reviewStep=3;return JSON.parse(JSON.stringify(career));
  });await seedContext.close();
  for(const theme of ['light','dark'])for(const viewport of [{width:390,height:844},{width:931,height:430}]){
   const name=theme+'-'+viewport.width,context=await browser.newContext({viewport}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url);await page.waitForFunction(()=>typeof v119CloseSponsorHTML==='function'&&window.D6Flutlicht?.adapter);
   async function capture(file){await page.locator('.v119-season-close h2').first().evaluate(async node=>{await Promise.all(node.getAnimations().map(a=>a.finished.catch(()=>{})));});await page.screenshot({path:path.join(output,file),fullPage:true});}
   await page.evaluate(async({seed,theme})=>{const career=await v61StoreNewCareer(seed);v61CurrentCareer=career;v61CareerTab='overview';window.D6Flutlicht.theme.set(theme);v61RenderCareer(career);},{seed,theme});
   assert.equal(await page.locator('#v67-season-show').count(),1,'original fourth review page remains');
   await page.locator('[data-v67-review-next]').click();await page.waitForFunction(()=>!v67Busy&&v61CurrentCareer.world.transition.reviewStep===4);
   assert.equal(await page.locator('.v119-season-close').count(),1);assert.match(await page.locator('.v119-season-close').innerText(),/Jahresabrechnung · Saison 1/);
   const balanceBefore=await page.evaluate(()=>v66Own(v61CurrentCareer).balance);await capture(name+'-finance.png');
   await page.locator('[data-v124-next]').evaluate(button=>{button.click();button.click();});await page.waitForFunction(()=>!v67Busy&&v61CurrentCareer.world.season===2);
   assert.equal(await page.locator('#v119-season-close [data-v66-sponsor]').count(),3);assert.equal(await page.locator('.v119-season-close').count(),1);
   const sponsorGate=await page.evaluate(()=>{const c=v61CurrentCareer;let blocked=false;try{v124SetYouthBudget(c,200)}catch{blocked=true;}return{blocked,season:c.world.season,phase:c.world.market.phase,base:v66Own(c).ledger.filter(r=>r.season===2&&r.id.endsWith(':base')).length};});
   assert.equal(sponsorGate.blocked,true);assert.equal(sponsorGate.phase,'sponsor');assert.equal(sponsorGate.base,1,'new season base booked once');
   await capture(name+'-sponsor.png');
   await page.locator('#v119-season-close [data-v66-sponsor]').first().click();await page.waitForFunction(()=>v61CurrentCareer.world.market.phase==='budget');
   const resume=await page.evaluate(()=>JSON.parse(JSON.stringify(v61CurrentCareer)));await page.reload();await page.waitForFunction(()=>window.D6Flutlicht?.adapter&&typeof v119CloseSponsorHTML==='function');
   await page.evaluate(async({resume,theme})=>{v61CurrentCareer=await v61StoreNewCareer(resume);v61CareerTab='overview';window.D6Flutlicht.theme.set(theme);v61RenderCareer(v61CurrentCareer);},{resume,theme});
   assert.equal(await page.locator('#v124-budget.v119-season-close').count(),1,'native saved budget phase resumes in season close');assert.equal(await page.locator('#v67-season-show').count(),0,'does not replay previous review');
   assert.match(await page.locator('[data-v124-budget]').innerText(),/Saison 2 starten/);await page.locator('#v67-budget').selectOption('200');
   await capture(name+'-budget.png');
   const geometry=await page.evaluate(()=>{const p=document.querySelector('#v124-budget'),select=p.querySelector('select'),style=getComputedStyle(select),shell=document.querySelector('.fl-shell');return{overflow:document.documentElement.scrollWidth>innerWidth+1,panelWidth:p.getBoundingClientRect().width,theme:shell.dataset.flTheme,selectColor:style.color,selectBackground:style.backgroundColor,visibleDashboard:[...document.querySelectorAll('.fl-overview-kpis,.fl-overview-grid')].filter(n=>getComputedStyle(n).display!=='none').length};});
   assert.equal(geometry.overflow,false);assert.equal(geometry.visibleDashboard,0,'season close stays a dedicated screen');assert.equal(geometry.theme,theme);
   const before=await page.evaluate(()=>({salary:v66SalaryDue(v61CurrentCareer,v66Own(v61CurrentCareer).id),balance:v66Own(v61CurrentCareer).balance,books:v66Own(v61CurrentCareer).ledger.length}));
   await page.locator('[data-v124-budget]').evaluate(button=>{button.click();button.click();});await page.waitForFunction(()=>!v67Busy&&v61CurrentCareer.world.market.phase==='open');
   const after=await page.evaluate(()=>{const c=v61CurrentCareer,club=v66Own(c),books=club.ledger.filter(r=>r.season===2&&r.id.endsWith(':youth-budget'));let blocked=false;try{v124SetYouthBudget(c,200)}catch{blocked=true;}return{season:c.world.season,balance:club.balance,books:books.length,salary:v66SalaryDue(c,club.id),blocked,valid:v61ValidateCareer(JSON.parse(JSON.stringify(c)))};});
   assert.equal(after.season,2);assert.equal(after.books,1);assert.equal(after.balance,before.balance-200);assert.equal(after.salary,before.salary);assert.equal(after.blocked,true);assert.equal(after.valid,true);assert.equal(await page.locator('.v119-season-close').count(),0);
   // Future labels project the supplied native season, with no fixed season 2 copy.
   const labels=await page.evaluate(()=>{const c=JSON.parse(JSON.stringify(v61CurrentCareer));c.world.season=6;c.world.market.phase='budget';return{budget:v124BudgetHTML(c),sponsor:v119CloseSponsorHTML(c)};});assert.match(labels.budget,/Saison 6 starten/);assert.match(labels.sponsor,/Saison 6 vorbereiten/);
   assert.deepEqual(errors,[]);rows.push({name,geometry,balanceBefore,before,after,sponsorGate,errors});await context.close();
  }
  fs.writeFileSync(path.join(output,'browser-evidence.json'),JSON.stringify({passed:true,controlledFutureLabelProbe:true,nativeSeason2Flow:true,rows},null,2)+'\n');console.log('PASS: 4 small/landscape light/dark native season-close flows, JSON resume and repeated click/payment gates.');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
