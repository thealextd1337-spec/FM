'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createServer}=require('../serve.cjs');
const round=process.argv[2]||'header-source',target=process.argv[3]||'source',out=path.resolve('outputs/ui-redesign/consistency-v157',round);
fs.mkdirSync(out,{recursive:true});
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const owned=()=>Object.fromEntries(fs.readdirSync('dist/ui-flutlicht',{recursive:true}).filter(f=>/\.(js|css)$/.test(f)).concat(['../player-tactics-ui.css','../world-tactics-layout-v156.css']).sort().map(f=>[f,hash(path.resolve('dist/ui-flutlicht',f))]));
const report={round,target,before:owned(),...(target==='build'?{buildHash:hash('outputs/index.html')}:{}),cases:[],checks:[],errors:[]};
const combos=[{width:390,lang:'de',theme:'light'},{width:320,lang:'en',theme:'dark'},{width:320,lang:'de',theme:'light'},{width:390,lang:'en',theme:'dark'}];
const settle=page=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function capture(page,combo,phase){
 const state=await page.evaluate(()=>{
  const header=document.querySelector('body>header'),action=document.querySelector('#career-progress-action'),box=e=>{const r=e.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
  const textRange=document.createRange();textRange.selectNodeContents(action);const text=box(textRange),style=getComputedStyle(action);
  const controls=[...header.querySelectorAll('#v65-quick-nav button,.v64-match-menu>summary,#career-progress-action')].filter(e=>e.getBoundingClientRect().width).map(e=>({id:e.id,label:e.getAttribute('aria-label')||e.textContent.trim(),...box(e)}));
  return {header:box(header),action:box(action),text,controls,actionText:action.textContent.trim(),whiteSpace:style.whiteSpace,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,quickLabel:header.querySelector('#v65-quick-nav button')?.getAttribute('aria-label'),quickTextVisible:header.querySelector('#v65-quick-nav button span')?getComputedStyle(header.querySelector('#v65-quick-nav button span')).display!=='none':false};
 });
 assert(state.scrollWidth<=combo.width+1,'page fits');assert(state.action.width>=160,'primary action has generous width');assert.equal(state.whiteSpace,'nowrap','primary label stays on one line');
 assert(state.text.left>=state.action.left-1&&state.text.right<=state.action.right+1,'label fits inside primary action');
 for(const control of state.controls){assert(control.width>=44&&control.height>=44,`44px control target ${JSON.stringify(control)}`);assert(control.left>=0&&control.right<=combo.width,'control fits viewport');assert(control.bottom<=state.header.bottom+1,'header encloses controls');}
 for(let i=1;i<state.controls.length;i++)assert(state.controls[i].left>=state.controls[i-1].right+6,'controls separated');
 if(phase!=='prematch'){assert(state.quickLabel,'icon control keeps accessible label');assert.equal(state.quickTextVisible,false,'compact control does not squeeze duplicate text');}
 report.cases.push({phase,...combo,...state});
 await page.screenshot({path:path.join(out,`${phase}-${combo.width}-${combo.lang}-${combo.theme}.png`),clip:{x:0,y:0,width:combo.width,height:Math.ceil(state.header.bottom+8)}});
}
let server,browser;
(async()=>{
 server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 for(const combo of combos){
  const context=await browser.newContext({viewport:{width:combo.width,height:956},colorScheme:combo.theme}),page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));
  await page.goto(target==='source'?`http://127.0.0.1:${server.address().port}/source/index.html?engine=browser&players=wave3`:require('node:url').pathToFileURL(path.resolve('outputs/index.html')).href+'?engine=browser&players=wave3');
  await page.waitForFunction(()=>v61StorageReady&&window.D6Flutlicht?.navigation);await page.evaluate(lang=>doppel6Language.set(lang),combo.lang);
  await page.evaluate(async()=>{const c=v61CreateCareer('GER-2','header-v157','UI'),club=v66Own(c);v66ChooseSponsor(c,club.id,club.sponsors[0].id);v124SetYouthBudget(c,0);v61CurrentCareer=c;while(c.world.market.phase==='open')await v66NextMarketDay(c);const f=v62Fixtures(c).find(f=>!f.result&&(f.homeId===club.id||f.awayId===club.id));c.world.activeMatch={fixtureId:f.id,state:v64MakeState(c,f)};v64UiRender(c);});
  await settle(page);await capture(page,combo,'prematch');
  await page.evaluate(()=>{const state=v65Context().state;state.phase='paused';v98View='2d';v65PauseView=true;v65PauseTab='lineup';v65Show(v65Context());clearInterval(v65WorldFrame);v65PauseView=true;v65UpdateControls(v65Context());});await settle(page);await capture(page,combo,'paused');
  await page.locator('.v64-match-menu>summary').click();await settle(page);
  const menu=await page.locator('.v64-match-menu-panel').evaluate(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,viewport:innerWidth};});assert(menu.left>=0&&menu.right<=menu.viewport,'opened native menu fits');report.checks.push(`${combo.width}/${combo.lang}/${combo.theme}: native menu visible and fits`);
  await page.locator('.v64-match-menu>summary').click();
  await page.evaluate(()=>{match.halftimePause=3;v65UpdateControls(v65Context());v58Refresh();});await settle(page);await capture(page,combo,'halftime');
  const halfLabel=await page.locator('#v65-quick-nav button').getAttribute('aria-label');assert(/Halbzeit|half/i.test(halfLabel),'half-time icon label retained');
  await context.close();
 }
 assert.equal(report.errors.length,0);assert.deepEqual(owned(),report.before,'presentation sources changed');if(target==='build')assert.equal(hash('outputs/index.html'),report.buildHash,'build changed');report.pass=true;
})().catch(error=>{report.failure=error.stack;process.exitCode=1;console.error(error);}).finally(async()=>{report.after=owned();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser?.close();server?.close();console.log(JSON.stringify({cases:report.cases.length,pass:report.pass,errors:report.errors,failure:report.failure}));});
