'use strict';
// Own loopback origin/private Edge contexts. Source app and optionally current built HTML.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createServer}=require('../../ui-redesign/serve.cjs');
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'outputs/3d-quality/trophy-art-v119'),useBuild=process.argv.includes('--build');
fs.mkdirSync(out,{recursive:true});const report={scope:'isolated source/built app SVG imagery; no Unity or hardware claim',checks:[],views:[],errors:[]};
const artSources=['dist/trophy-art-v119.js','dist/world-competition-v62.js','dist/ui-flutlicht/adapter.js'],sha=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
report.sourceHashes=Object.fromEntries(artSources.map(p=>[p,sha(p)]));
function check(name,ok){assert(ok,name);report.checks.push(name);}
let server,browser;
(async()=>{
 const source=createServer(),built=path.join(root,'outputs/index.html');
 if(useBuild){const html=fs.readFileSync(built,'utf8');for(const p of artSources){const source=fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n');
  // The official offline build embeds the unchanged historical PNG registry.
  // Compare all executable code on both sides of that registry exactly.
  const parts=p==='dist/world-competition-v62.js'?[source.slice(0,source.indexOf('const v62AwardSprites=')),source.slice(source.indexOf('function v62AwardIcon('))]:[source];check('built HTML contains current '+p+' executable code',parts.every(s=>s.length>0&&html.includes(s)));}
  report.buildComparison='exact code; historical v62AwardSprites PNG registry is inlined by official build';report.buildSha256=sha('outputs/index.html');}
 server=http.createServer((req,res)=>{if(req.url.split('?')[0]==='/build/index.html'){if(!fs.existsSync(built)){res.writeHead(404);res.end();return;}res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fs.readFileSync(built));return;}source.emit('request',req,res);});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 for(const mode of useBuild?['source','build']:['source']){
  const context=await browser.newContext({viewport:{width:1440,height:1200}}),page=await context.newPage();page.on('pageerror',e=>report.errors.push({mode,error:e.message}));
  await page.goto(`http://127.0.0.1:${server.address().port}/${mode}/index.html?engine=browser`);await page.waitForFunction(()=>v61StorageReady&&window.D6Flutlicht?.adapter&&typeof v119TrophyArt==='function');
  const actual=await page.evaluate(()=>{
   const career=v61CreateCareer('ITA-2','trophy-v119','Trophy QA');v61CurrentCareer=career;v61RenderCareer(career);const before=JSON.stringify(career);
   const identities=Object.entries(v62AwardSprites).flatMap(([country,items])=>Object.keys(items).map(kind=>({country,kind,key:v119TrophyArt(country,kind).key,html:v62AwardIcon(country,kind)})));
   const parser=new DOMParser(),xml=identities.map(item=>{const host=document.createElement('div');host.innerHTML=item.html;const image=host.firstElementChild,svg=decodeURIComponent(image.src.slice(image.src.indexOf(',')+1));return {key:item.key,valid:!parser.parseFromString(svg,'image/svg+xml').querySelector('parsererror'),source:image.getAttribute('src'),label:image.title};});
   const competition=v62Current(career).find(c=>c.country==='ITA'&&c.type==='cup'),final={...competition.fixtures[0],round:'F'};
   const finalHTML=v62NextOpponentHTML(career,final),honours=v62AwardOverviewHTML(career,career.world.season);
   return {identities,xml,nativeUnchanged:before===JSON.stringify(career),finalUses:finalHTML.includes('data-v119-award="ita-cup"'),personalUses:honours.includes('data-v119-award="ita-top-scorer"')&&honours.includes('data-v119-award="ita-player-of-season"')};
  });
  check(mode+' actual Flutlicht wrapper retains all 32 identities',actual.identities.length===32&&actual.identities.every(i=>i.html.includes(`data-v119-award="${i.key}"`)));
  check(mode+' all SVGs parse as valid XML',actual.xml.every(i=>i.valid));check(mode+' native career unchanged by art lookups',actual.nativeUnchanged);
  check(mode+' final and personal awards use shared imagery',actual.finalUses&&actual.personalUses);
  const surfaces=await page.evaluate(()=>{
   const display=structuredClone(v61CurrentCareer),comp=v62Current(display).find(c=>c.country==='ITA'&&c.type==='cup');comp.winnerId=display.manager.managedClubId;
   display.world.competitions.push({...structuredClone(comp),id:'trophy-qa-history',season:0});
   const profile=v68ClubDetailHTML(display,display.manager.managedClubId),archive=v68CompetitionSummaryHTML(display),fixture={...comp.fixtures[0],round:'F'};
   const context={career:display,fixture,state:{postMatchStep:'celebration'}};v65ShowCelebration(context);
   const image=v65CelebrationDialog.querySelector('img[data-v119-award]'),result={profile:profile.includes('data-v119-award="ita-cup"'),archive:archive.includes('data-v119-award="ita-cup"'),celebration:image?.dataset.v119Award==='ita-cup',smooth:image&&getComputedStyle(image).imageRendering==='auto'};
   return result;
  });
  check(mode+' real club profile, archive and celebration retain national identity',surfaces.profile&&surfaces.archive&&surfaces.celebration);
  check(mode+' celebration pixelated CSS is overridden by vector rendering',surfaces.smooth);
  await page.waitForFunction(()=>v65CelebrationDialog.querySelector('img[data-v119-award]').complete);await page.locator('#v65-victory-dialog').screenshot({path:path.join(out,mode+'-celebration.png')});await page.evaluate(()=>v65CelebrationDialog.close());
  // The contact sheet uses the actual installed v62AwardIcon, including the Flutlicht wrapper.
  await page.evaluate(()=>{
   const panel=document.createElement('main');panel.id='v119-art-preview';panel.style='position:relative;z-index:100000;padding:24px;background:#eef2f0;color:#13231e;font:14px Arial';
   const groups=Object.entries(v62AwardSprites).flatMap(([country,items])=>Object.keys(items).map(kind=>({country,kind})));
   for(const theme of ['light','dark']){const section=document.createElement('section');section.dataset.theme=theme;section.style=`padding:20px;margin-bottom:16px;background:${theme==='dark'?'#111f28':'#f5f6ef'};color:${theme==='dark'?'#eaf1ee':'#17241f'}`;section.innerHTML=`<h2>Doppel 6 · ${theme} · original vector awards</h2>`;
    const grid=document.createElement('div');grid.style='display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:10px';
    grid.innerHTML=groups.map(({country,kind})=>`<article style="text-align:center;padding:8px;border:1px solid #81908755;border-radius:12px"><div style="display:flex;align-items:end;justify-content:center;gap:8px">${[24,64].map(size=>v62AwardIcon(country,kind,size===24).replace('style="image-rendering:auto"',`style="image-rendering:auto;width:${size}px;height:${size}px;max-width:none;object-fit:contain"`)).join('')}</div><small>${country} · ${kind}</small></article>`).join('');section.append(grid);panel.append(section);
   }
   for(const theme of ['light','dark']){const large=document.createElement('section');large.dataset.large=theme;large.style=`display:grid;grid-template-columns:repeat(4,256px);justify-content:center;gap:12px;padding:20px;background:${theme==='dark'?'#20313a':'#f5f6ef'};color:${theme==='dark'?'#fff':'#17241f'}`;large.innerHTML=groups.map(({country,kind})=>`<article style="width:256px;text-align:center">${v62AwardIcon(country,kind).replace('style="image-rendering:auto"','style="image-rendering:auto;width:256px;height:256px;max-width:none;object-fit:contain"')}<p>${country} · ${kind}</p></article>`).join('');panel.append(large);}
   document.body.replaceChildren(panel);document.body.style='margin:0';
  });
  await page.waitForFunction(()=>[...document.querySelectorAll('#v119-art-preview img')].every(i=>i.complete&&i.naturalWidth>0));
  const metrics=await page.locator('#v119-art-preview').evaluate(panel=>[...panel.querySelectorAll('img')].map(i=>({key:i.dataset.v119Award,width:i.getBoundingClientRect().width,height:i.getBoundingClientRect().height,rendering:getComputedStyle(i).imageRendering,decoded:i.complete&&i.naturalWidth>0})));
  check(mode+' all 32 light/dark 24/64/256 SVG images decode smoothly',metrics.length===192&&metrics.every(i=>i.decoded&&i.rendering==='auto'&&[24,64,256].includes(i.width)&&i.width===i.height));
  for(const theme of ['light','dark']){await page.locator(`[data-theme="${theme}"]`).screenshot({path:path.join(out,mode+'-'+theme+'-24-64.png')});await page.locator(`[data-large="${theme}"]`).screenshot({path:path.join(out,mode+'-'+theme+'-256.png')});}
  report.views.push({mode,identities:32,images:metrics.length,sizes:[24,64,256],xmlValid:true});await context.close();
 }
 check('no app JavaScript errors',report.errors.length===0);check('reviewed art sources unchanged during proof',artSources.every(p=>sha(p)===report.sourceHashes[p]));if(useBuild)check('built HTML unchanged during proof',sha('outputs/index.html')===report.buildSha256);
 fs.writeFileSync(path.join(out,useBuild?'source-build-report.json':'source-report.json'),JSON.stringify(report,null,2)+'\n');console.log(`PASS ${report.checks.length} trophy browser checks (${useBuild?'source + build':'source'}).`);
})().catch(e=>{report.failure=e.stack;fs.writeFileSync(path.join(out,'failure-report.json'),JSON.stringify(report,null,2)+'\n');console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();if(server)await new Promise(r=>server.close(r));});
