'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createServer}=require('../../ui-redesign/serve.cjs');
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'outputs/3d-quality/calendar-colors-v119'),build=process.argv.includes('--build'),files=['dist/world-competition-v62.js','dist/ui-flutlicht/views/competitions.css'];
fs.mkdirSync(out,{recursive:true});const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const report={scope:'actual source/built calendar and victory dialog; controlled local fixture results, no natural match claim',checks:[],views:[],errors:[],sourceHashes:Object.fromEntries(files.map(p=>[p,sha(p)]))};let server,browser;
function check(name,ok){assert(ok,name);report.checks.push(name);}
(async()=>{
 const source=createServer(),htmlPath=path.join(root,'outputs/index.html');if(build){const html=fs.readFileSync(htmlPath,'utf8');for(const p of files){const current=fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n'),parts=p==='dist/world-competition-v62.js'?[current.slice(0,current.indexOf('const v62AwardSprites=')),current.slice(current.indexOf('function v62AwardIcon('))]:[current];check('build includes current '+p+' executable code',parts.every(s=>s.length>0&&html.includes(s)));}report.buildComparison='exact code; historical v62AwardSprites PNG registry is inlined by official build';report.buildSha256=sha('outputs/index.html');}
 server=http.createServer((req,res)=>{if(req.url.split('?')[0]==='/build/index.html'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fs.readFileSync(htmlPath));return;}source.emit('request',req,res);});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 for(const mode of build?['source','build']:['source']){
  const context=await browser.newContext(),page=await context.newPage();page.on('pageerror',e=>report.errors.push({mode,message:e.message}));await page.goto(`http://127.0.0.1:${server.address().port}/${mode}/index.html?engine=browser`);await page.waitForFunction(()=>v61StorageReady&&window.D6Flutlicht?.adapter);
  const cases=await page.evaluate(()=>{
   const career=v61CreateCareer('ITA-2','calendar119','Calendar QA'),own=v66Own(career);v66ChooseSponsor(career,own.id,own.sponsors[0].id);v124SetYouthBudget(career,0);
   const comp=v62Current(career).find(c=>c.type==='league'&&c.country==='ITA'),fixtures=comp.fixtures.filter(f=>f.homeId===own.id||f.awayId===own.id).slice(0,6),names=['homewin','awayloss','draw','upcoming','shootoutwin','shootoutloss'];
   const results=[{homeGoals:2,awayGoals:0},{homeGoals:3,awayGoals:1},{homeGoals:1,awayGoals:1},null,{homeGoals:2,awayGoals:2,penalties:[3,4],winnerId:own.id},{homeGoals:0,awayGoals:0,penalties:[3,4]}];
   const rows=fixtures.map((f,i)=>{const other=f.homeId===own.id?f.awayId:f.homeId,away=[1,4].includes(i);f.homeId=away?other:own.id;f.awayId=away?own.id:other;f.result=results[i];if(i===5)f.result.winnerId=other;return {name:names[i],id:f.id,date:v62Date(f.day),opponentId:other,expected:['win','loss','draw','','win','loss'][i]};});
   v61CurrentCareer=career;v61CareerTab='calendar';v61RenderCareer(career);return rows;
  });
  await page.locator('.fl-competitions .v62-calendar-list').waitFor();
  for(const width of [390,1366])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height:1000});await page.evaluate(t=>D6Flutlicht.theme.set(t),theme);
   const rows=await page.evaluate(cases=>cases.map(item=>{const game=[...document.querySelectorAll('.v62-calendar-list li')].find(n=>n.querySelector('[data-fl-report-open]')?.dataset.flReportOpen===item.id||(item.name==='upcoming'&&n.classList.contains('upcoming')&&n.querySelector('time')?.textContent===item.date&&n.querySelector('[data-v68-club]')?.dataset.v68Club===item.opponentId)),score=game?.querySelector('.v119-calendar-score'),result=game?.querySelector('.v62-calendar-result'),button=game?.querySelector('[data-fl-report-open]');return {...item,outcome:result?.dataset.v119Outcome,background:score&&getComputedStyle(score).backgroundColor,report:!!button,clubButton:!!game?.querySelector('[data-v68-club]'),scoreText:score?.textContent};}),cases);
   const key=mode+'/'+width+'/'+theme;for(const row of rows){check(key+' '+row.name+' actual outcome',row.outcome===row.expected);const desired=row.expected==='win'?'rgba(84, 173, 113, 0.16)':row.expected==='loss'?'rgba(218, 102, 102, 0.16)':'rgba(0, 0, 0, 0)';check(key+' '+row.name+' actual score color',row.background===desired);check(key+' '+row.name+' existing buttons preserved',row.clubButton&&(row.name==='upcoming'?!row.report:row.report));}
   report.views.push({mode,width,theme,rows});await page.locator('.v62-calendar-list').screenshot({path:path.join(out,`${mode}-${width}-${theme}.png`)});
  }
  await page.evaluate(()=>{const c=v61CurrentCareer,comp=v62Current(c).find(c=>c.type==='cup'&&c.country==='ITA');comp.winnerId=c.manager.managedClubId;v65ShowCelebration({career:c,fixture:{...comp.fixtures[0],round:'F'},state:{postMatchStep:'celebration'}});});
  for(const theme of ['light','dark']){
   await page.evaluate(t=>D6Flutlicht.theme.set(t),theme);const contrast=await page.locator('#v65-victory-dialog').evaluate(dialog=>{const bg=getComputedStyle(dialog).backgroundColor,parse=s=>s.match(/[\d.]+/g).slice(0,3).map(Number),lum=s=>parse(s).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0),b=lum(bg);return [...dialog.querySelectorAll('h2,.v65-victory-context')].map(n=>{const color=getComputedStyle(n).color,f=lum(color);return {text:n.textContent,color,background:bg,contrast:(Math.max(f,b)+.05)/(Math.min(f,b)+.05)};});});
   check(mode+'/'+theme+' victory heading/context contrast',contrast.length===2&&contrast.every(c=>c.contrast>=4.5));report.views.push({mode,theme,victoryContrast:contrast});await page.locator('#v65-victory-dialog').screenshot({path:path.join(out,`${mode}-victory-${theme}.png`)});
  }
  await context.close();
 }
 check('no app JavaScript errors',report.errors.length===0);check('reviewed calendar sources unchanged',files.every(p=>sha(p)===report.sourceHashes[p]));if(build)check('reviewed build unchanged',sha('outputs/index.html')===report.buildSha256);fs.writeFileSync(path.join(out,build?'source-build-report.json':'source-report.json'),JSON.stringify(report,null,2)+'\n');console.log('PASS '+report.checks.length+' calendar/victory DOM checks.');
})().catch(e=>{report.failure=e.stack;fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify(report,null,2)+'\n');console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();if(server)await new Promise(r=>server.close(r));});
