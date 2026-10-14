// B18: tactical plans change only by drag and drop (mouse/touch) or the keyboard. A pointer click never moves or swaps.
// Covers permanent match plan, match preparation and the pause lineup on desktop (mouse, 1280x900) and mobile (touch, 390x844).
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.D6_PLAYWRIGHT||'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const url=process.env.D6_TEST_URL||'http://127.0.0.1:4211/';
const output=path.resolve('outputs/tactics-pointer-r132');fs.mkdirSync(output,{recursive:true});
const only=process.argv.find(a=>a.startsWith('--view='))?.slice(7),report={startedAt:new Date().toISOString(),checks:[],errors:[]};
const check=(label,condition,detail)=>{assert(condition,label+(detail===undefined?'':' '+JSON.stringify(detail)));report.checks.push(label);};
const views={
 matchplan:{root:'[data-v46-view="matchplan"]',slot:'data-v64-career-slot',bench:'data-v64-career-bench-card'},
 prematch:{root:'#v61-world-screen',slot:'data-v64-pick-slot',bench:'data-v64-bench-card'},
 pause:{root:'#v65-plan-view',slot:'data-v65-pick-slot',bench:'data-v65-bench-card'}
};
// Page-side helpers shared by all views.
const helper=`window.T={
 ctx(view){
  if(view==='matchplan'){const c=v61CurrentCareer,{fixture,state}=v64CareerPlanContext(c);return{c,fixture,state,side:0};}
  if(view==='prematch'){const c=v61CurrentCareer,fixture=v64ActiveFixture(c),state=c.world.activeMatch.state;return{c,fixture,state,side:v64UiOwnSide(fixture)};}
  const x=v65Context();return{c:x.career,fixture:x.fixture,state:x.state,side:x.ownSide};
 },
 snap(view){const {state,side,c}=this.ctx(view);return JSON.stringify({starters:v64Active(state,side),bench:v64Bench(state,side),cells:state.cells,roles:state.roles,pending:state.pending,orientation:state.orientation,instructions:state.instructions,subs:state.substitutions,plan:c.manager.matchPlan});},
 stored(){const id=v61CurrentCareer.id,c=(v61StorageConfirmed||[]).find(item=>item.id===id);return c?JSON.stringify({plan:c.manager.matchPlan,active:c.world.activeMatch}):null;},
 info(view,selectors){
  const {state,side,c}=this.ctx(view),starters=v64Active(state,side),bench=v64Bench(state,side),roster=v64Side(c,this.ctx(view).fixture,side),cells=v64EnsureCells(state,side);
  const group=cell=>state.roleAssignments?(1-(Math.floor(cell/5)+.5)/7<.3?'def':1-(Math.floor(cell/5)+.5)/7<.7?'mid':'att'):v64GridRole(cell);
  const field=starters.map((pid,slot)=>({pid,slot})).filter(item=>state.roles[item.pid]!=='gk'),occupied=new Set(field.map(item=>cells[item.pid]));
  const first=field[0],second=field[1],freeSame=Array.from({length:35},(_,cell)=>cell).filter(cell=>!occupied.has(cell)&&group(cell)===group(cells[first.pid]));
  const eligible=bench.filter(pid=>{const p=roster.find(item=>item.pid===pid);return p&&!p.keeper&&v129RosterEligible(p);});
  const attackers=field.filter(item=>state.roles[item.pid]==='att');
  return{keeper:starters.find(pid=>state.roles[pid]==='gk'),keeperSlot:starters.findIndex(pid=>state.roles[pid]==='gk'),first,second,cellOf:Object.fromEntries(field.map(item=>[item.pid,cells[item.pid]])),free:freeSame[0],freeAny:Array.from({length:35},(_,cell)=>cell).filter(cell=>!occupied.has(cell)),reserve:eligible[0],reserve2:eligible[1],eligible,attackers:attackers.map(item=>item.pid),horizontal:matchMedia('(min-width:900px), (min-width:600px) and (orientation:landscape)').matches};
 },
 wait(){return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(()=>resolve(!window.v64CareerCommitPending),220))));}
};window.__saves=0;const baseSave=v61SaveCareers;v61SaveCareers=function(...args){window.__saves++;return baseSave.apply(this,args);};true`;
async function open(browser,view,mobile,lang){
 const viewport=mobile?{width:390,height:844}:{width:1280,height:900},context=await browser.newContext({viewport,hasTouch:mobile,isMobile:mobile}),page=await context.newPage();
 page.on('pageerror',error=>report.errors.push(`${view}/${mobile?'mobile':'desktop'}: ${error.message}`));
 await page.goto(url);await page.waitForFunction(()=>v61StorageReady&&typeof v64CareerKeyboardCell==='function'&&window.D6Flutlicht?.navigation);
 await page.evaluate(lang=>doppel6Language.set(lang),lang);await page.evaluate(helper);
 await page.evaluate(async view=>{
  const career=v61CreateCareer('GER-2','pointer-r132-'+view),club=v66Own(career);
  v66ChooseSponsor(career,club.id,club.sponsors[0].id);v124SetYouthBudget(career,0);
  if(view!=='matchplan'){
   while(career.world.market.phase==='open')v66NextMarketDay(career);
   const fixture=v62Fixtures(career).find(f=>!f.result&&(f.homeId===club.id||f.awayId===club.id));
   career.world.activeMatch={fixtureId:fixture.id,state:v64MakeState(career,fixture)};
  }
  v61CurrentCareer=await v61StoreNewCareer(career);
  if(view==='matchplan'){v61CareerTab='matchplan';v61RenderCareer(career);}
  else if(view==='prematch'){v61RenderCareer(career);}
  else{
   career.world.activeMatch.state.phase='live';v65Show(v65Context());clearInterval(v65WorldFrame);clearInterval(v64UiTimer);if(typeof v102StopPaint==='function')v102StopPaint();
   const c=v65Context();c.state.phase='paused';v65PauseView=true;v65PauseTab='lineup';v65SelectedSlot=v64Active(c.state,c.ownSide).findIndex(pid=>c.state.roles[pid]==='att');running=false;v65UpdateControls(c);v58Refresh();
  }
 },view);
 await page.evaluate(helper);await page.evaluate(()=>window.T.wait());
 return{context,page,viewport};
}
async function scrollBoth(page,a,b){
 await page.evaluate(([a,b])=>{const ra=document.querySelector(a).getBoundingClientRect(),rb=document.querySelector(b).getBoundingClientRect(),top=Math.min(ra.top,rb.top)+scrollY,bottom=Math.max(ra.bottom,rb.bottom)+scrollY,mid=(top+bottom)/2;window.scrollTo(0,Math.max(0,mid-innerHeight/2));},[a,b]);
 await page.waitForTimeout(150);
 const [ba,bb,height]=await page.evaluate(([a,b])=>[document.querySelector(a).getBoundingClientRect().toJSON(),document.querySelector(b).getBoundingClientRect().toJSON(),innerHeight],[a,b]);
 return ba.top>=0&&ba.bottom<=height&&bb.top>=0&&bb.bottom<=height;
}
async function touchDrag(context,page,from,to,{release='drop',cancel=false,escape=false}={}){
 const cdp=await context.newCDPSession(page),s={x:from.x+from.width/2,y:from.y+from.height/2},e={x:to.x+to.width/2,y:to.y+to.height/2};
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...s,id:1}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:s.x+(e.x>=s.x?30:-30),y:s.y,id:1}]});
 for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:s.x+(e.x-s.x)*i/6,y:s.y+(e.y-s.y)*i/6,id:1}]});
 await page.waitForTimeout(80);
 if(escape){await page.keyboard.press('Escape');}
 if(cancel)await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
 else{
  if(release==='outside')await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:5,y:5,id:1}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 }
 await cdp.detach();await page.waitForTimeout(250);
}
async function touchDragScroll(context,page,sourceLocator,targetLocator,{release='drop'}={}){
 await sourceLocator.evaluate(el=>el.scrollIntoView({block:'center'}));await page.waitForTimeout(150);
 const cdp=await context.newCDPSession(page),from=await sourceLocator.boundingBox(),s={x:from.x+from.width/2,y:from.y+from.height/2},send=(type,point)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:point?[{...point,id:1}]:[]});
 await send('touchStart',s);await send('touchMove',{x:s.x+30,y:s.y});
 let point={x:s.x+30,y:s.y};
 for(let i=0;i<160;i++){
  const box=await targetLocator.boundingBox(),vh=await page.evaluate(()=>innerHeight),cx=box.x+box.width/2,cy=box.y+box.height/2;
  const reachable=await page.evaluate(([x,y,sel])=>{if(y<150||y>innerHeight-110)return false;const hit=document.elementFromPoint(x,y);return Boolean(hit&&hit.closest(sel));},[cx,cy,await tagTarget(targetLocator)]);
  if(reachable){point={x:point.x,y:vh/2};await send('touchMove',point);await page.waitForTimeout(160);const settled=await targetLocator.boundingBox(),sx=settled.x+settled.width/2,sy=settled.y+settled.height/2;if(sy<150||sy>vh-110)continue;for(let step=1;step<=4;step++)await send('touchMove',{x:point.x+(sx-point.x)*step/4,y:point.y+(sy-point.y)*step/4});point={x:sx,y:sy};break;}
  if(false){for(let step=1;step<=4;step++)await send('touchMove',{x:point.x+(cx-point.x)*step/4,y:point.y+(cy-point.y)*step/4});point={x:cx,y:cy};break;}
  point={x:Math.min(Math.max(point.x,10),380),y:cy<150?20:vh-20};await send('touchMove',point);await page.waitForTimeout(40);
 }
 await page.waitForTimeout(80);
 if(release==='outside')await send('touchMove',{x:5,y:5});
 await send('touchEnd');await cdp.detach();await page.waitForTimeout(250);
}
async function tagTarget(locator){await locator.evaluate(el=>el.setAttribute('data-r132-t','1'));return '[data-r132-t]';}
async function mouseDragTo(page,source,target){await source.dragTo(target);await page.waitForTimeout(250);}
async function runView(browser,view,mobile,lang){
 const V=views[view],tag=`${view}/${mobile?'mobile touch 390':'desktop mouse 1280'}/${lang}`,{context,page}=await open(browser,view,mobile,lang);
 const slotSel=pid=>`${V.root} [${V.slot}="${pid}"]`,slotOf=async pid=>page.evaluate(([view,pid])=>{const {state,side}=T.ctx(view);return v64Active(state,side).indexOf(pid)},[view,pid]);
 const info=()=>page.evaluate(([view])=>T.info(view),[view]),snap=()=>page.evaluate(view=>T.snap(view),view),stored=async()=>{await page.evaluate(()=>v61WaitForStorage());return page.evaluate(()=>T.stored());};
 const field=async pid=>page.locator(`${V.root} [${V.slot}="${await slotOf(pid)}"]`).first(),cell=index=>page.locator(`${V.root} [data-v64-cell="${index}"]`).first(),benchCard=pid=>page.locator(`${V.root} [${V.bench}="${pid}"]`).first();
 let info0=await info();
 check(`${tag}: free pitch cells are not buttons`,await page.evaluate(root=>{const free=[...document.querySelectorAll(root+' [data-v64-cell]')].filter(el=>!el.hasAttribute('data-v64-career-slot')&&!el.hasAttribute('data-v64-pick-slot')&&!el.hasAttribute('data-v65-pick-slot'));return free.length>0&&free.every(el=>el.tagName!=='BUTTON'&&el.getAttribute('aria-hidden')==='true');},V.root));
 check(`${tag}: reserve selection button is not visible to pointer users`,await page.evaluate(root=>{const buttons=[...document.querySelectorAll(root+' [data-v129-roster-pick]'),...document.querySelectorAll('[data-v129-roster-pick]')];return buttons.length>0&&buttons.every(el=>{const r=el.getBoundingClientRect();return r.width<=1&&r.height<=1;});},V.root));
 // --- 1. Marking plus click never moves or swaps (memory and stored save) ---
 const before=await snap(),storedBefore=await stored(),savesBefore=await page.evaluate(()=>window.__saves);
 const tap=async(locator,corner)=>{const options=corner?{position:{x:5,y:5},timeout:5000}:{timeout:5000};if(mobile)await locator.tap(options);else await locator.click(options);await page.waitForTimeout(220);};
 const firstSlot=await field(info0.first.pid),secondSlot=await field(info0.second.pid);
 await firstSlot.scrollIntoViewIfNeeded();await tap(firstSlot,true);
 check(`${tag}: clicking a shirt only marks it`,await firstSlot.evaluate(el=>el.getAttribute('aria-pressed')==='true'));
 if(info0.free!==undefined){await cell(info0.free).scrollIntoViewIfNeeded();await tap(cell(info0.free));}
 assert.equal(await snap(),before,`${tag}: click on a free cell after marking must not move the player`);check(`${tag}: marked + click on free cell changes nothing`,true);
 await secondSlot.scrollIntoViewIfNeeded();await tap(secondSlot,true);
 assert.equal(await snap(),before,`${tag}: click on an occupied cell after marking must not swap`);check(`${tag}: marked + click on occupied cell changes nothing (selection only)`,true);
 await tap(await field(info0.first.pid),true);await (await benchCard(info0.reserve).locator('.bench-title,.bench-select').first()).scrollIntoViewIfNeeded();await tap(benchCard(info0.reserve).locator('.bench-title,.bench-select').first());
 assert.equal(await snap(),before,`${tag}: marked shirt + click on a bench card must not substitute`);check(`${tag}: marked + click on bench card changes nothing`,true);
 await tap(benchCard(info0.reserve).locator('.bench-title,.bench-select').first());await tap(await field(info0.second.pid),true);
 assert.equal(await snap(),before,`${tag}: bench card first, then field shirt must not substitute`);check(`${tag}: bench card + click on field shirt changes nothing`,true);
 const pickButton=page.locator(`${V.root} [data-v129-roster-pick="${info0.reserve}"]`).first();
 await pickButton.click({force:true});await tap(await field(info0.second.pid),true);
 assert.equal(await snap(),before,`${tag}: forced click on the reserve button then a shirt must not swap`);check(`${tag}: pointer click on the reserve selection button does nothing`,true);
 assert.equal(await stored(),storedBefore,`${tag}: stored game unchanged by clicks`);check(`${tag}: stored game unchanged by all clicks`,true);
 assert.equal(await page.evaluate(()=>window.__saves),savesBefore,`${tag}: clicks wrote nothing`);check(`${tag}: no save was triggered by clicks`,true);
 // --- 2. Cancelled drags change nothing ---
 info0=await info();
 if(!mobile){
  const events=await page.evaluate(([view,V,info])=>{
   const root=document.querySelector(V.root),source=root.querySelector(`[${V.slot}="${info.first.slot}"]`),target=root.querySelector(`[data-v64-cell="${info.free}"]`),dt=new DataTransfer(),fire=(el,type)=>el.dispatchEvent(new DragEvent(type,{bubbles:true,cancelable:true,dataTransfer:dt}));
   const snapshots=[T.snap(view)];
   fire(source,'dragstart');fire(target,'dragover');fire(source,'dragend');snapshots.push(T.snap(view));              // dragend without drop (Escape / cancelled)
   fire(source,'dragstart');fire(document.body,'dragover');fire(document.body,'drop');fire(source,'dragend');snapshots.push(T.snap(view)); // dropped outside any target
   return snapshots;
  },[view,V,{first:info0.first,free:info0.free}]);
  check(`${tag}: drag cancelled without drop and drop outside change nothing`,events.every(item=>item===events[0]));
 }
 // --- 3. Drag works: free cell, occupied swap, bench<->field ---
 const dragOnce=async(sourceLocator,targetLocator,options)=>{
  if(!mobile){const ok=await scrollBoth(page,await tagElement(sourceLocator,'a'),await tagElement(targetLocator,'b'));await untag(sourceLocator,'a');await untag(targetLocator,'b');check(tag+': drag source and target share the viewport',ok);}
  if(mobile){await touchDragScroll(context,page,sourceLocator,targetLocator,options);await page.evaluate(()=>document.querySelectorAll('[data-r132-t]').forEach(el=>el.removeAttribute('data-r132-t')));
  }else{await sourceLocator.scrollIntoViewIfNeeded();await mouseDragTo(page,sourceLocator,targetLocator);}
  await page.evaluate(()=>window.T.wait());
 };
 async function tagElement(locator,id){await locator.evaluate((el,id)=>el.setAttribute('data-r132-'+id,'1'),id);return `[data-r132-${id}]`;}
 async function untag(locator,id){await locator.evaluate((el,id)=>el.removeAttribute('data-r132-'+id),id);}
 // 3a free cell
 const freeCell=info0.free;
 await dragOnce(await field(info0.first.pid),cell(freeCell));
 let after=JSON.parse(await snap());check(`${tag}: drag moves a field player to a free cell`,after.cells[info0.first.pid]===freeCell,{cell:after.cells[info0.first.pid],freeCell});
 const savedMove=await stored();check(`${tag}: free-cell drag reached the stored game`,JSON.parse(savedMove)&&JSON.stringify(view==='matchplan'?JSON.parse(savedMove).plan.cells:JSON.parse(savedMove).active.state.cells).includes(`"${info0.first.pid}":${freeCell}`));
 // 3b occupied swap
 info0=await info();const firstCell=info0.cellOf[info0.first.pid],secondCell=info0.cellOf[info0.second.pid];
 await dragOnce(await field(info0.first.pid),await field(info0.second.pid));
 after=JSON.parse(await snap());check(`${tag}: drag onto an occupied shirt swaps both players`,after.cells[info0.first.pid]===secondCell&&after.cells[info0.second.pid]===firstCell,{after:after.cells[info0.first.pid],secondCell});
 // 3c bench -> field and back (pause queues a substitution instead)
 info0=await info();const beforeSwap=JSON.parse(await snap());
 let reserve=info0.reserve,outgoing=info0.second.pid,found=false;
 const outfield=Object.keys(info0.cellOf);
 for(const out of outfield){for(const pid of info0.eligible){const a=await tagElement(benchCard(pid),'a'),b=await tagElement(await field(out),'b'),fits=await scrollBoth(page,a,b);await untag(benchCard(pid),'a');await untag(await field(out),'b');if(fits){reserve=pid;outgoing=out;found=true;break;}}if(found)break;}
 await dragOnce(benchCard(reserve),await field(outgoing));
 after=JSON.parse(await snap());
 if(view==='pause'){check(`${tag}: reserve dragged onto a shirt queues the substitution`,after.pending.flat().some(item=>item.outPid===outgoing&&item.inPid===reserve),after.pending);}
 else{check(`${tag}: reserve dragged onto a shirt takes the place`,after.starters.includes(reserve)&&after.bench.includes(outgoing)&&!after.starters.includes(outgoing),{starters:after.starters,bench:after.bench});
  info0=await info();
  const dom=await page.evaluate(root=>[...document.querySelectorAll(root+' [data-v64-career-bench-card],'+root+' [data-v64-bench-card]')].map(e=>e.getAttribute('data-v64-career-bench-card')||e.getAttribute('data-v64-bench-card')),V.root);check(`${tag}: the replaced player is on the bench cards`,dom.includes(outgoing),{dom,outgoing,after});
  await dragOnce(await field(reserve),benchCard(outgoing));
  after=JSON.parse(await snap());check(`${tag}: shirt dragged onto a reserve card swaps back`,after.starters.includes(outgoing)&&after.bench.includes(reserve));}
 // --- 4. Goalkeeper and zone rules stay ---
 info0=await info();const rulesBefore=await snap();
 const keeperBox=await page.locator(`${V.root} [${V.slot}="${info0.keeperSlot}"]`).first();
 check(`${tag}: the goalkeeper shirt is not draggable on the grid`,await keeperBox.evaluate(el=>el.getAttribute('draggable')!=='true'));
 await dragOnce(await field(info0.first.pid),keeperBox);await page.waitForTimeout(150);
 assert.equal(await snap(),rulesBefore,`${tag}: field player dropped on the goalkeeper must not swap`);check(`${tag}: field player cannot take the goalkeeper's place`,true);
 await dragOnce(keeperBox,cell(info0.freeAny[0]));
 assert.equal(await snap(),rulesBefore,`${tag}: goalkeeper dragged to the grid must not move`);check(`${tag}: the goalkeeper cannot be dragged into the outfield`,true);
 if(view==='matchplan'){
  const last=await page.evaluate(()=>{const {state}=T.ctx('matchplan'),starters=v64Active(state,0),att=starters.filter(pid=>state.roles[pid]==='att'),group=c=>state.roleAssignments?(1-(Math.floor(c/5)+.5)/7<.3?'def':1-(Math.floor(c/5)+.5)/7<.7?'mid':'att'):v64GridRole(c),taken=Object.values(state.cells),defCell=Array.from({length:35},(_,c)=>c).find(c=>!taken.includes(c)&&group(c)==='def');return{att,defCell};});
  if(last.att.length===1&&last.defCell!==undefined){await dragOnce(await field(last.att[0]),cell(last.defCell));assert.equal(await snap(),rulesBefore,`${tag}: the last attacker must stay in the attack zone`);check(`${tag}: zone minimum is kept`,true);}
 }
 // --- 5. Keyboard path ---
 info0=await info();let pidK=info0.first.pid;
 const keyMove=await page.evaluate(([view,pid])=>{const {state,side}=T.ctx(view),horizontal=matchMedia('(min-width:900px), (min-width:600px) and (orientation:landscape)').matches,from=v64EnsureCells(state,side)[pid];
  for(const key of ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight']){const to=v64CareerKeyboardCell(from,key,horizontal);if(to!==null)return{key,to,from,occupant:v64Active(state,side).find(id=>id!==pid&&v64EnsureCells(state,side)[id]===to)||null};}return null;},[view,pidK]);
 assert(keyMove,tag+': a keyboard destination exists');
 await (await field(pidK)).focus();await page.keyboard.press('Alt+'+keyMove.key);await page.evaluate(()=>window.T.wait());
 after=JSON.parse(await snap());check(`${tag}: Alt+${keyMove.key} moves or swaps the focused shirt`,after.cells[pidK]===keyMove.to&&(!keyMove.occupant||after.cells[keyMove.occupant]===keyMove.from),{cells:after.cells[pidK],keyMove});
 check(`${tag}: keyboard focus stays on the moved shirt`,await (await field(pidK)).evaluate(el=>el===document.activeElement));
 // keyboard reserve swap: Enter on "Wählen", Enter on a shirt (keydown, never click)
 info0=await info();const kBefore=JSON.parse(await snap()),target=view==='pause'?Object.keys(info0.cellOf).find(pid=>pid!==outgoing):info0.second.pid,kReserve=view==='pause'?info0.eligible.find(pid=>pid!==reserve)||info0.reserve:info0.reserve;
 await page.keyboard.press('Shift');await page.locator(`${V.root} [data-v129-roster-pick="${kReserve}"]`).first().focus();
 check(`${tag}: the reserve selection button appears on keyboard focus`,await page.locator(`${V.root} [data-v129-roster-pick="${kReserve}"]`).first().evaluate(el=>{const r=el.getBoundingClientRect();return r.width>8&&r.height>8;}));
 await page.keyboard.press('Enter');check(`${tag}: Enter selects the reserve`,await page.locator(`${V.root} [data-v129-roster-pick="${kReserve}"]`).first().getAttribute('aria-pressed')==='true');
 await (await field(target)).focus();await page.keyboard.press('Enter');await page.evaluate(()=>window.T.wait());
 after=JSON.parse(await snap());
 if(view==='pause')check(`${tag}: keyboard queues the substitution`,after.pending.flat().some(item=>item.outPid===target&&item.inPid===kReserve),after.pending);
 else check(`${tag}: keyboard swaps reserve and field player`,after.starters.includes(kReserve)&&after.bench.includes(target)&&JSON.stringify(kBefore.starters)!==JSON.stringify(after.starters));
 await page.keyboard.press('Escape');
 // Escape cancels a keyboard selection
 const escBefore=await snap();info0=await info();
 const spare=info0.reserve2||info0.reserve;
 await page.keyboard.press('Shift');await page.locator(`${V.root} [data-v129-roster-pick="${spare}"]`).first().focus();await page.keyboard.press('Enter');await page.keyboard.press('Escape');
 await (await field((await info()).second.pid)).focus();await page.keyboard.press('Enter');await page.waitForTimeout(250);
 check(`${tag}: Escape cancels the keyboard selection`,(await snap())===escBefore);
 // --- 6. Touch: cancelled and released-outside drags change nothing ---
 if(mobile){
  info0=await info();const base=await snap(),from=await (await field(info0.first.pid)).boundingBox();
  await scrollBoth(page,await tagElement(await field(info0.first.pid),'a'),await tagElement(cell(info0.freeAny[0]),'b'));await untag(await field(info0.first.pid),'a');await untag(cell(info0.freeAny[0]),'b');
  const from2=await (await field(info0.first.pid)).boundingBox(),to2=await cell(info0.freeAny[0]).boundingBox();
  await touchDrag(context,page,from2,to2,{cancel:true});assert.equal(await snap(),base,`${tag}: pointercancel must not move`);check(`${tag}: pointercancel leaves the plan unchanged`,true);
  await touchDrag(context,page,from2,to2,{release:'outside'});assert.equal(await snap(),base,`${tag}: release outside must not move`);check(`${tag}: releasing outside any target leaves the plan unchanged`,true);
  await touchDrag(context,page,from2,to2,{escape:true});assert.equal(await snap(),base,`${tag}: Escape during a touch drag must not move`);check(`${tag}: Escape during a touch drag leaves the plan unchanged`,true);
 }
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);check(`${tag}: no horizontal overflow`,overflow);
 await page.screenshot({path:path.join(output,`${view}-${mobile?'mobile':'desktop'}-${lang}.png`)});
 await context.close();
}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.D6_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  for(const view of Object.keys(views).filter(name=>!only||name===only))for(const mobile of [false,true])await runView(browser,view,mobile,mobile?'en':'de');
  check('No uncaught browser exceptions',report.errors.length===0,report.errors);
  report.status='passed';
 }catch(error){report.status='failed';report.failure=error.stack;console.error(error);process.exitCode=1;}
 finally{await browser.close();fs.writeFileSync(path.join(output,'browser-check.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,checks:report.checks.length}));}
})();
