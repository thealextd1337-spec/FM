'use strict';
// Isolated source-app UI fixture: real club/competition projection and existing
// replay controllers, with a recorded-picture fixture. This is not Unity/device QA.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createServer}=require('../../ui-redesign/serve.cjs');
const base=path.resolve(__dirname,'../../..'),out=path.join(base,'outputs/3d-quality/match-overlay-v119');
fs.mkdirSync(out,{recursive:true});
const report={scope:'isolated Edge source-app overlay fixture; no Unity/camera/device claim',checks:[],views:[],errors:[]};
function check(name,ok){assert(ok,name);report.checks.push(name);}
let server,browser;
(async()=>{
 server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:720}});page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/source/index.html?engine=browser`);
 await page.waitForFunction(()=>v61StorageReady&&window.D6Flutlicht?.adapter);
 const projection=await page.evaluate(()=>{
  const career=v61CreateCareer('ITA-2','overlay-v119','UI QA'),club=v66Own(career),league=v62Current(career).find(c=>c.type==='league'&&c.country===club.countryId);
  v66ChooseSponsor(career,club.id,club.sponsors[0].id);v124SetYouthBudget(career,0);
  v61CurrentCareer=career;const unchanged=JSON.stringify(career),first=D6Flutlicht.adapter.project(career).frame.clubMeta;
  league.division=2;const second=D6Flutlicht.adapter.project(career).frame.clubMeta;league.division=3;const third=D6Flutlicht.adapter.project(career).frame.clubMeta;delete league.division;
  const brand=document.createElement('div');brand.innerHTML=v66SponsorHTML(career);const name=club.sponsors.find(s=>s.id===club.sponsorId).name,node=brand.querySelector('.v66-sponsor-brand');
  const comps=v62Current(career),themes=comps.map(c=>v119TVTheme({...c,division:v119LeagueDivision(c)}));
  return {first,second,third,unchanged:unchanged===JSON.stringify(career),brand:{name,label:node.getAttribute('aria-label'),wordmark:!!node.querySelector('.v97-sponsor-wordmark'),duplicateText:!!node.querySelector('strong'),fixed:brand.textContent.includes(v66Credits(club.sponsors.find(s=>s.id===club.sponsorId).fixed))},competitions:comps.map(c=>({id:c.id,type:c.type,country:c.country,division:v119LeagueDivision(c)})),themes};
 });
 check('sidebar derives actual first league',projection.first==='Italien · Liga 1');check('explicit division follows current metadata',projection.second==='Italien · Liga 2'&&projection.third==='Italien · Liga 3');check('projection changes no career data',projection.unchanged);
 check('sponsor has accessible identity and financial detail',projection.brand.label===projection.brand.name&&projection.brand.fixed);check('wordmark has no duplicate displayed name',projection.brand.wordmark&&!projection.brand.duplicateText);
 check('all 13 actual competitions have distinct identities',projection.themes.length===13&&new Set(projection.themes.map(t=>t.key)).size===13);check('all 13 designs differ by palette/motif',new Set(projection.themes.map(t=>[t.accent,t.base,t.motif].join('/'))).size===13);report.projection=projection;
 await page.addScriptTag({path:path.join(base,'work/platform/qa/unity-integration-v160.js')});
 await page.evaluate(async()=>{await D6QA160.setup({unity:false,replays:true});running=false;clearInterval(v65WorldFrame);v102StopPaint();hideOverlay();
  // Fixture only: bypass the renderer/orientation gate to inspect the shared UI at narrow widths.
  v103CanReplay=()=>true;const state=v103ReplayState(match),frame=v98PitchFrame(match);state.timeline=[{...frame,clock:0},{...frame,clock:10},{...frame,clock:20},{...frame,clock:30}];
  state.markers=['goal','corner','freeKick','offside','penalty'].map((kind,i)=>({id:kind,kind,clock:5+i*4,elapsed:i+1,minute:(i+1)+'′',name:match.people[0].name}));
  v132ScreenState(true);v131ReviewUI();v132BroadcastUI({broadcast:frame.broadcast});v132RevealControls();
 });
 for(const size of [{width:1920,height:1080},{width:1280,height:720},{width:931,height:448},{width:844,height:390},{width:568,height:320},{width:320,height:700}])for(const language of ['de','en']){
  await page.setViewportSize(size);await page.evaluate(lang=>{doppel6Language.set(lang);v131ReviewUI();v132RevealControls();},language);
  const metrics=await page.locator('#v131-review').evaluate(panel=>{const r=panel.getBoundingClientRect();return {width:innerWidth,language:document.documentElement.lang,height:r.height,barWidth:r.width,overflow:panel.scrollWidth>panel.clientWidth,events:panel.querySelectorAll('.v132-events button').length,markers:panel.querySelectorAll('.v132-markers span').length,menu:panel.querySelector('summary').getAttribute('aria-label'),buttons:[...panel.querySelectorAll(':scope > button,summary')].map(b=>({label:b.getAttribute('aria-label'),height:b.getBoundingClientRect().height}))};});
  check(`${size.width}/${language} compact strip`,metrics.height<=(size.width<421?102:56));check(`${size.width}/${language} no overflow`,!metrics.overflow);check(`${size.width}/${language} all actions/markers retained`,metrics.events===5&&metrics.markers===5&&metrics.buttons.every(b=>b.label&&b.height>=44));report.views.push(metrics);
  if(size.width>=844&&language==='de'){
   const tv=await page.locator('#v132-tv').evaluate(n=>({width:n.getBoundingClientRect().width,right:n.getBoundingClientRect().right,score:Number.parseFloat(getComputedStyle(n.querySelector('strong')).fontSize),time:Number.parseFloat(getComputedStyle(n.querySelector('time')).fontSize)}));
   check(size.width+' fullscreen TV readable and clear of top controls',tv.score>=21&&tv.time>=15&&tv.right<=size.width-132);
   report.views.at(-1).tv=tv;await page.screenshot({path:path.join(out,'fullscreen-'+size.width+'.png')});
  }
 }
 await page.setViewportSize({width:844,height:390});await page.evaluate(()=>{doppel6Language.set('de');v131ReviewUI();});
 await page.locator('#v131-review summary').click();check('event menu opens on tap/click',await page.locator('.v119-event-menu').getAttribute('open')!==null);
 await page.screenshot({path:path.join(out,'compact-events-844.png')});
 await page.keyboard.press('Escape');check('Escape closes menu and preserves focus',await page.locator('.v119-event-menu').getAttribute('open')===null&&await page.locator('#v131-review summary').evaluate(n=>n===document.activeElement));
 await page.evaluate(()=>{const original=v131Seek;window.qaSeek=[];v131Seek=function(time){const state=v103ReplayState(match);qaSeek.push({time,before:state.timeline.length,context:!!v65Context()});const r=original(time);qaSeek.at(-1).review=state.review;return r;};});
 await page.locator('#v131-review summary').click();await page.locator('.v132-events [data-kind="goal"]').click();
 const selected=await page.evaluate(()=>({time:v103ReplayState(match).review?.time,running,phase:v65Context().state.phase,trace:qaSeek}));report.selected=selected;check('event seeks 3 seconds before and pauses native game '+JSON.stringify(selected),selected.time===2&&!selected.running&&selected.phase==='paused');
 const frozen=await page.evaluate(()=>JSON.stringify(match));await page.locator('[data-v132-play]').click();await page.waitForFunction(()=>v103ReplayState(match).review.time>2.1);await page.locator('[data-v132-play]').click();
 check('review play/pause keeps native match unchanged',frozen===await page.evaluate(()=>JSON.stringify(match)));await page.locator('[data-v132-live]').click();check('Live returns to current native state',await page.evaluate(()=>running&&!v103ReplayState(match).review));await page.evaluate(()=>{running=false;clearInterval(v65WorldFrame);v102StopPaint();});
 await page.screenshot({path:path.join(out,'compact-live-844.png')});
 const banner=await page.evaluate(()=>{const c=v65Context(),club=v65Club(c,0),player=v64Player(c.career,c.fixture,0,match.people.find(p=>p.t===0&&!p.keeper).pid),comp=v62Current(c.career).find(item=>item.id===c.fixture.competitionId),overlay=document.querySelector('#match-overlay');overlay.className='match-overlay goal v84-goal-banner v84-no-sprite';overlay.innerHTML=v84BannerHTML(player,club,comp,1,[1,0]);overlay.style.display='grid';overlay.hidden=false;return {club:club.name,shown:overlay.querySelector('.v119-goal-club').textContent,escaped:v84BannerHTML(player,{...club,name:'<club & name>'},comp,1,[1,0]).includes('&lt;club &amp; name&gt;')};});
 check('goal caption is actual club and safely escaped',banner.club===banner.shown&&banner.escaped);report.banner=banner;
 await page.evaluate(()=>{document.querySelector('#match-area .v42-pitch-stage').append(document.querySelector('#match-overlay'));});await page.waitForTimeout(450);
 check('goal club caption is visible below the actual badge',await page.locator('.v119-goal-club').evaluate(n=>{const r=n.getBoundingClientRect(),badge=n.previousElementSibling.getBoundingClientRect();return r.width>0&&r.height>0&&r.top>=badge.bottom-1&&Number(getComputedStyle(n.parentElement).opacity)>.9;}));
 await page.screenshot({path:path.join(out,'goal-club-844.png')});
 check('historical broadcast uses recorded competition identity',await page.evaluate(()=>{v132BroadcastUI({broadcast:{...v132Broadcast(match),type:'europe',country:null,division:null}});return document.querySelector('#v132-tv').dataset.competition==='europe';}));
 check('unknown competition gets neutral fallback',await page.evaluate(()=>v119TVTheme({type:'league',country:'unknown'}).key==='unknown'));
 check('replay explicitly describes available session recording',await page.locator('#v131-review input').evaluate(n=>n.title.includes('dieser Sitzung')&&n.getAttribute('aria-description')===n.title));
 await page.setViewportSize({width:1280,height:720});
 const designs=await page.evaluate(()=>{hideOverlay();const gallery=document.createElement('div');gallery.id='qa-tv-gallery';Object.assign(gallery.style,{position:'fixed',inset:'0',zIndex:'2000',padding:'24px',display:'grid',gridTemplateColumns:'repeat(3,1fr)',alignContent:'start',gap:'18px',background:'#eff3eb'});const rows=[];for(const c of v62Current(v61CurrentCareer)){v132BroadcastUI({broadcast:{...v132Broadcast(match),type:c.type,country:c.country,division:v119LeagueDivision(c),round:c.type==='league'?'R3':'F'}});const tv=document.querySelector('#v132-tv'),clone=tv.cloneNode(true);clone.removeAttribute('id');Object.assign(clone.style,{position:'relative',top:'0',left:'0',maxWidth:'100%'});const card=document.createElement('div');card.style.position='relative';card.style.height='100px';card.append(clone);gallery.append(card);rows.push({id:c.id,key:tv.dataset.competition,motif:tv.dataset.motif,clockBackground:getComputedStyle(tv.querySelector('time')).backgroundColor,caption:tv.querySelector('.v132-tv-kind').textContent});}document.body.append(gallery);return rows;});
 // Copies use the actual scoreboard stylesheet and render function for this visual contact sheet.
 await page.addStyleTag({content:await page.evaluate(()=>(v132ScreenStyle.textContent+v132FadeStyle.textContent).replaceAll('body.v132-fullscreen #match-area #v132-tv','#qa-tv-gallery aside').replaceAll('#match-area #v132-tv','#qa-tv-gallery aside').replaceAll('#v132-tv','#qa-tv-gallery aside'))});
 check('13 actual rendered scoreboard designs differ',new Set(designs.map(d=>d.clockBackground+'/'+d.motif)).size===13);report.designs=designs;await page.screenshot({path:path.join(out,'competition-designs.png')});await page.evaluate(()=>document.querySelector('#qa-tv-gallery').remove());
 await page.evaluate(()=>{v132ScreenState(true);v132FullscreenUI();running=true;v65Context().state.phase='live';match.flight={};});
 await page.locator('#v119-screen-tactics').click();check('Taktik exits fullscreen and preserves native in-flight pause deferral',await page.evaluate(()=>!document.body.classList.contains('v132-fullscreen')&&v65PauseRequested&&v65Context().state.phase==='live'));
 check('native pause completion opens existing tactics overview',await page.evaluate(()=>{match.flight=null;v65Pause();return v65Context().state.phase==='paused'&&v65PauseTab==='tactics'&&v65PauseView&&!!document.querySelector('#v65-pause-tabs');}));
 check('no page errors',report.errors.length===0);report.status='passed';
})().catch(e=>{report.status='failed';report.failure=e.stack;process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,checks:report.checks.length,failure:report.failure,views:report.views}));});
