'use strict';
// Actual source market, own private Edge and loopback origin. No career persistence.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createServer}=require('../../ui-redesign/serve.cjs');
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'outputs/3d-quality/market-identity-v119'),baseline=process.argv.includes('--baseline');
fs.mkdirSync(out,{recursive:true});const report={scope:'actual source market first name line; no hardware or Unity claim',baseline,checks:[],measurements:[],errors:[]};let server,browser;
function check(name,ok){assert(ok,name);report.checks.push(name);}
(async()=>{
 server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const page=await browser.newPage();page.on('pageerror',e=>report.errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}/source/index.html?engine=browser`);await page.waitForFunction(()=>v61StorageReady&&window.D6Flutlicht?.adapter);
 await page.evaluate(()=>{const c=v61CreateCareer('ITA-2','identity119','Identity QA'),club=v66Own(c);v66ChooseSponsor(c,club.id,club.sponsors[0].id);v124SetYouthBudget(c,0);v61CurrentCareer=c;v61CareerTab='transfers';v61RenderCareer(c);});
 await page.locator('.fl-market .v66-player-identity').first().waitFor();
 for(const width of [320,390,844,1366])for(const theme of ['light','dark']){
  await page.setViewportSize({width,height:900});await page.evaluate(theme=>D6Flutlicht.theme.set(theme),theme);
  const rows=await page.evaluate(()=>{
   const all=[...document.querySelectorAll('.fl-market .v66-player-identity')];
   // Keep source player name unchanged: only the controlled display fixture wraps.
   all[0].querySelector('.v66-player-name').textContent='Alexandros Konstantinos van der Meer';all[1].querySelector('.v66-player-name').textContent='Leo';
   return all.slice(0,2).map(identity=>{
    const flag=identity.querySelector('.flag-icon'),name=identity.querySelector('.v66-player-name'),fr=flag.getBoundingClientRect(),nr=name.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(name);const first=range.getClientRects()[0];
    return {text:name.textContent,flagCenter:fr.top+fr.height/2,firstTextCenter:first.top+first.height/2,difference:Math.abs(fr.top+fr.height/2-first.top-first.height/2),lines:range.getClientRects().length,targetHeight:nr.height,flagHeight:fr.height,width:innerWidth,theme:document.documentElement.dataset.theme};
   });
  });
  report.measurements.push({width,theme,rows});if(!baseline){check(width+'/'+theme+' flag aligned to first name line',rows.every(r=>r.difference<=2));check(width+'/'+theme+' profile target remains at least44px',rows.every(r=>r.targetHeight>=44));}
  await page.locator('.fl-market .v66-player-card').first().screenshot({path:path.join(out,`${baseline?'before':'after'}-${width}-${theme}.png`)});
 }
 if(!baseline){check('actual mobile fixture wraps long name',report.measurements.filter(r=>r.width<=390).every(r=>r.rows[0].lines>1));check('no JavaScript errors',report.errors.length===0);}
 report.sourceHashes=Object.fromEntries(['dist/ui-flutlicht/views/market.css','dist/world-market-ui-v66.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex')]));fs.writeFileSync(path.join(out,baseline?'before.json':'after.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({baseline,checks:report.checks.length,maxOffset:Math.max(...report.measurements.flatMap(m=>m.rows.map(r=>r.difference)))}));
})().catch(e=>{report.failure=e.stack;fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify(report,null,2)+'\n');console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();if(server)await new Promise(r=>server.close(r));});
