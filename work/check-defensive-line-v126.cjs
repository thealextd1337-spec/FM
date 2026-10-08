// Native shared match planner; isolated browser and new evidence paths only.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const baseline=process.argv.includes('--baseline');
const fixture=fs.readFileSync('work/check-positioning-v121.cjs','utf8');
const setup=fixture.slice(fixture.indexOf('  clearInterval(v65WorldFrame)'),fixture.indexOf('  const marking=[]'));
const scenarios=()=>{
 const rows=[];
 for(const team of [0,1])for(const tactic of [-1,0,1])for(const kind of ['turnover','far-onside','near-onside','near-offside','breakthrough','flight','loose','parry','keeper']){
  const base={[-1]:.21,0:.31,1:.41}[tactic],y=d=>team===0?1-d:d;
  const start=kind==='near-onside'||kind==='near-offside'||kind==='breakthrough'?base:base+.1;
  const defs=[person('left',team,.43,y(start),'def'),person('right',team,.57,y(start),'def')],keeper=person('keeper',team,.5,y(.06),'gk');
  const runner=person('runner',1-team,.51,y(kind.includes('onside')&&!kind.includes('offside')?start+.02:start-.04));
  const carrier=person('carrier',1-team,.24,y(kind.startsWith('near')?base+.06:kind==='breakthrough'?base-.05:.75),'mid');
  const own=person('own-carrier',team,.2,y(.65),'mid');reset([...defs,keeper,runner,carrier,own]);
  v121PositioningSamples.delete(m);v123DefensiveThreats.delete(m);m.defenseLines[team]=tactic;
  m.owner=own;m.ball={x:own.x,y:own.y};v121PreparePositioning(m);
  const attackingTargets=defs.map(p=>v121PositioningPlans.get(m).get(p).y);
  m.owner=kind==='keeper'?keeper:carrier;m.ball={x:m.owner.x,y:m.owner.y};m.lastTouch=1-team;
  const offsideBefore=v55OffsideSnapshot(carrier).offside.has(runner);
  if(kind==='flight'){m.owner=null;m.flight={team:1-team,target:{x:runner.x,y:y(start-.08)},duration:100,progress:0,done(){}};runner.interceptTarget={...m.flight.target};}
  if(kind==='loose'||kind==='parry'){m.owner=null;m.rebound={...m.ball,delay:100,vx:0,vy:0};if(kind==='parry'){m.lastTouch=team;v123DefensiveThreats.set(m,1-team);m.ball={x:.5,y:y(base-.04)};}}
  const positions=JSON.stringify(m.people.map(p=>[p.x,p.y]));v121PreparePositioning(m);defs.forEach(p=>v113DefenderTarget(m,p));
  const plans=defs.map(p=>({id:p.pid,depth:team===0?1-p.ty:p.ty,start:team===0?1-p.y:p.y,mark:v121PositioningPlans.get(m).get(p).mark?.pid||null,x:p.tx}));
  const unchanged=positions===JSON.stringify(m.people.map(p=>[p.x,p.y]));m.people.reverse();v121PreparePositioning(m);defs.forEach(p=>v113DefenderTarget(m,p));
  const sameOrder=JSON.stringify(plans)===JSON.stringify(defs.map(p=>({id:p.pid,depth:team===0?1-p.ty:p.ty,start:team===0?1-p.y:p.y,mark:v121PositioningPlans.get(m).get(p).mark?.pid||null,x:p.tx})));
  let maxStep=0;for(let tick=0;tick<40;tick++){for(const p of defs){const before={x:p.x,y:p.y};v55Approach(p,{x:p.tx,y:p.ty},.05);maxStep=Math.max(maxStep,metres(before,p));}m.elapsed+=.05*MATCH_SPEED;v121PreparePositioning(m);defs.forEach(p=>v113DefenderTarget(m,p));}
  const offsideAfter=v55OffsideSnapshot(carrier).offside.has(runner);
  rows.push({team,tactic,kind,base,attackingTargets,offsideBefore,offsideAfter,plans,unchanged,sameOrder,maxStep,finalDepths:defs.map(p=>team===0?1-p.y:p.y)});
 }
 running=false;return {rows};
};
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve('outputs/spieler-nutzer-match.html')).href);await page.waitForFunction(()=>window.userMeshyMatchReady,null,{timeout:60000});
 const body=scenarios.toString().slice(scenarios.toString().indexOf('{')+1,-1);const result=await page.evaluate('(()=>{'+setup+body+'})()');
 fs.writeFileSync('docs/spieler-nutzer-rig/defensive-line-'+(baseline?'baseline':'qa')+'-v126.json',JSON.stringify({version:126,date:new Date().toISOString(),baseline,...result,errors},null,2)+'\n');
 assert.deepEqual(errors,[]);if(!baseline){for(const r of result.rows){assert(r.unchanged&&r.sameOrder);assert(r.maxStep<.4);if(['turnover','near-offside','loose'].includes(r.kind)){assert(r.offsideBefore&&r.offsideAfter,JSON.stringify(r));assert(r.plans.every(p=>p.mark!=='v121-runner'&&p.depth>=r.base-1e-9),JSON.stringify(r));}if(r.kind==='far-onside')assert(r.plans.every(p=>!p.mark&&p.depth>r.base),JSON.stringify(r));if(['near-onside','breakthrough','flight'].includes(r.kind))assert(r.plans.some(p=>p.mark),JSON.stringify(r));if(r.kind==='parry')assert(r.plans.some(p=>p.mark==='v121-runner')&&r.plans.every(p=>p.depth<=p.start),JSON.stringify(r));if(r.kind==='keeper')assert(r.plans.every(p=>!p.mark),JSON.stringify(r));}}
 if(!baseline)for(const team of [0,1]){const lines=result.rows.filter(r=>r.team===team&&r.kind==='far-onside');assert(lines[0].plans[0].depth<lines[1].plans[0].depth&&lines[1].plans[0].depth<lines[2].plans[0].depth,'distant ball preserves low / neutral / high ordering');}
 console.log(JSON.stringify({baseline,cases:result.rows.length,turnovers:result.rows.filter(r=>r.kind==='turnover'),errors},null,2));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
