'use strict';
// Twelve real stock fixtures. No candidate, extra controller queries or tuning.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),output=path.join(root,'outputs/3d-quality/shot-volume-v119/world-sample.json');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const frozen=new Map([['index.html',fs.readFileSync(path.join(root,'dist/index.html'))]]);
for(const item of frozen.get('index.html').toString().matchAll(/(?:src|href)="([^"#]+)"/g)){
 const rel=item[1].split('?')[0];if(/^(https?:|data:|\/)/.test(rel)||!/\.(js|css)$/.test(rel))continue;
 frozen.set(rel.replaceAll('\\','/'),fs.readFileSync(path.join(root,'dist',rel)));
}
const report={scope:'One actual first own league fixture per six native catalog countries, standard5 and large6. Stock production; no stages6-9 or parameter/tactic changes. Country sample is diagnostic, not a population target guarantee.',rngSeed:169032,fixedDateNow:1791540000000,sourceHashes:Object.fromEntries([...frozen].map(([f,b])=>['dist/'+f,hash(b)])),rows:[],errors:[]};
async function main(){
 const server=require('./ui-redesign/serve.cjs').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--disable-gpu']});
  const open=async()=>{const context=await browser.newContext(),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));await page.route('**/source/**',r=>{const rel=decodeURIComponent(new URL(r.request().url()).pathname.slice(8)),bytes=frozen.get(rel);return bytes?r.fulfill({body:bytes,contentType:rel.endsWith('.js')?'text/javascript':rel.endsWith('.css')?'text/css':'text/html'}):r.continue();});await page.goto('http://127.0.0.1:'+server.address().port+'/source/index.html?engine=browser&players=wave3');await page.waitForFunction(()=>window.userMeshyMatchReady,null,{timeout:60000});return{context,page};};
  const inventory=await open();
  report.selection=await inventory.page.evaluate(()=>v61Countries.map(([countryId,countryName])=>{const entries=v61Catalog.filter(c=>c.id.slice(0,3)===countryId&&!c.id.includes('-C')),careerSeed='worldsample119-'+countryId,competition=v62CountryLeague(countryId,entries,1,careerSeed),initialTable=v62Table(competition,entries.map(c=>c.id)),selected=initialTable[1]||initialTable[0];if(!selected)throw Error('No actual catalog league club');return{countryId,countryName,careerSeed,ownClubId:selected.clubId,selectedInitialRank:initialTable.findIndex(c=>c.clubId===selected.clubId)+1,leagueClubIds:entries.map(c=>c.id),initialRanking:initialTable.map(c=>c.clubId)};}));
  await inventory.context.close();assert.equal(report.selection.length,6);
  for(const selected of report.selection)for(const config of [{fieldSize:'standard',fieldPlayers:5},{fieldSize:'large',fieldPlayers:6}]){
   const {context,page}=await open();
   const row=await page.evaluate(async({selected,config})=>{
    const check=(v,m)=>{if(!v)throw Error(m);},clone=v=>JSON.parse(JSON.stringify(v)),random=Math.random,dateNow=Date.now,originalDraw=draw,originalReplay=v103CanReplay;
    let rng=169032,draws=0,ticks=0;Math.random=()=>{draws++;rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};Date.now=()=>1791540000000;
    try{
     const career=v61CreateCareer(selected.ownClubId,selected.careerSeed,'World sample QA',undefined,config),club=v66Own(career),league=v62Current(career).find(c=>c.type==='league'&&c.country===selected.countryId);
     const rank=v62Table(league,career.world.clubs.filter(c=>c.countryId===selected.countryId&&c.leagueId).map(c=>c.id)).findIndex(c=>c.clubId===club.id)+1;check(rank===selected.selectedInitialRank,'actual career initial rank agrees');
     v66ChooseSponsor(career,club.id,club.sponsors[0].id);v124SetYouthBudget(career,0);while(career.world.market.phase==='open')await v66NextMarketDay(career);
     const fixture=league.fixtures.filter(f=>!f.result&&[f.homeId,f.awayId].includes(club.id)).sort((a,b)=>a.day-b.day||a.id.localeCompare(b.id))[0];check(fixture,'actual first own league fixture');
     const state=v64MakeState(career,fixture),squadIds=[0,1].map(side=>v64Side(career,fixture,side).map(p=>p.pid));career.world.activeMatch={fixtureId:fixture.id,state};v61CurrentCareer=career;state.phase='paused';match=null;v65WorldActive=null;v98View='2d';v65Show(v65Context());clearInterval(v65WorldFrame);draw=()=>{};v103CanReplay=()=>false;
     const ctx=v65Context(),ownSide=ctx.ownSide,physicalSide=side=>side===ownSide?0:1;
     const facts=()=>[0,1].map(side=>{const id=side===0?fixture.homeId:fixture.awayId,c=career.world.clubs.find(c=>c.id===id),physical=physicalSide(side);return{side:side===0?'home':'away',clubId:id,clubName:c.name,tactics:clone(state.tactics[side]),physicalDirect:match.teamDirect[physical],physicalPress:match.teamPress[physical],physicalDefense:match.defenseLines[physical]};});
     const initialTeams=facts(),initialMarkers={attackFlow:clone({version:match.attackFlow.version,qualityVersion:match.attackFlow.qualityVersion,flowVersion:match.attackFlow.flowVersion,paceVersion:match.attackFlow.paceVersion,paceRevision:match.attackFlow.paceRevision}),shotBalanceRevision:state.playerPerformance?.shotBalanceRevision,loadParameterId:state.playerLoad?.parameterId},geometry=clone(match.geometry);
     check(state.playerLoad,'actual native P02 ledger active');
     while(!match.finished&&ticks++<10000){const active=v65Context();if(state.phase==='paused'){v65Resume();clearInterval(v65WorldFrame);}step(.05*MATCH_SPEED,.05);if(state.phase==='live'&&!match.finished)v65AfterStep(active);if(v65PauseRequested&&!match.flight&&!match.slide&&state.phase==='live'){v65PauseRequested=false;v65Pause();clearInterval(v65WorldFrame);}}
     check(match.finished&&state.phase==='finished'&&fixture.result&&fixture.matchRecord,'finished actual native league fixture booked');
     const everyone=[...match.people,...match.exitedPeople],keys=['shots','onTarget','goals','passes','passComplete','saves'],aggregate=(people,stats)=>Object.fromEntries(keys.map(key=>[key,people.reduce((n,p)=>n+(stats(p)?.[key]||0),0)]));
     const teams=[0,1].map(side=>{const physical=physicalSide(side),people=everyone.filter(p=>p.t===physical),native=aggregate(people,p=>p.stats),stateStats=aggregate(squadIds[side],pid=>state.stats[pid]),book=fixture.matchRecord.players.filter(p=>p.side===side),bookShots=book.reduce((n,p)=>n+(p.shots||0),0),bookGoals=book.reduce((n,p)=>n+(p.goals||0),0);check(native.shots===match.shots[physical]&&native.shots===stateStats.shots&&native.shots===bookShots,'shots coherent native/state/book side'+side);check(native.onTarget===stateStats.onTarget,'onTarget coherent native/state side'+side);check(native.goals===stateStats.goals&&native.goals===bookGoals,'player goals coherent native/state/book side'+side);check(match.score[physical]===state.score[side]&&fixture.matchRecord.score[side]===state.score[side]&&(side===0?fixture.result.homeGoals:fixture.result.awayGoals)===state.score[side],'authoritative goals coherent side'+side);return{...facts()[side],physicalSide:physical,physicalStats:native,stateStats,bookStats:{shots:bookShots,playerGoals:bookGoals},scoreGoals:match.score[physical]};});
     const p02={players:0,events:0,minuteRanges:0,outOfRange:[],pendingAtWhistle:Object.entries(state.playerLoad.pending).filter(([,p])=>p.events.length||p.intervals.length).length};
     for(const[pid,player]of Object.entries(state.playerLoad.players)){const ledger=player.ledger.fixtures.find(f=>f.id===fixture.id);if(!ledger)continue;p02.players++;p02.minuteRanges+=ledger.minuteRanges.length;for(const e of ledger.events){const event=JSON.parse(e.signature);p02.events++;if(!ledger.minuteRanges.some(r=>event.minute>=r.startMinute-1e-7&&event.minute<=r.endMinute+1e-7))p02.outOfRange.push({pid,event});}}
     check(p02.players>0&&p02.events>0&&p02.outOfRange.length===0&&p02.pendingAtWhistle===0,'actual P02 consume complete and in real played ranges');
     return{...selected,config,fixtureId:fixture.id,homeId:fixture.homeId,awayId:fixture.awayId,ownSide,initialTeams,finalTeams:teams,geometry,initialMarkers,finished:true,actualBooked:true,errorFreeP02:true,p02,ticks,totalSimulatedStepSeconds:ticks*.05,clockElapsed:match.elapsed,stateMinute:state.minute,score:[...state.score],totalShots:teams.reduce((n,t)=>n+t.physicalStats.shots,0),totalOnTarget:teams.reduce((n,t)=>n+t.physicalStats.onTarget,0),rng,draws,tacticChanges:clone(state.tacticChanges),substitutions:clone(state.substitutions),coherence:true};
    }finally{Math.random=random;Date.now=dateNow;draw=originalDraw;v103CanReplay=originalReplay;running=false;clearInterval(v65WorldFrame);}
   },{selected,config});
   report.rows.push(row);console.log(JSON.stringify({country:selected.countryId,config,fixture:row.fixtureId,shots:row.totalShots,onTarget:row.totalOnTarget,score:row.score,initialFormations:row.initialTeams.map(t=>t.tactics.formation),finished:row.finished}));await context.close();
  }
  assert.equal(report.rows.length,12);assert.deepEqual(report.errors,[]);
  const stats=rows=>{const values=rows.map(r=>r.totalShots);return{matches:rows.length,meanShots:values.reduce((s,n)=>s+n,0)/values.length,minShots:Math.min(...values),maxShots:Math.max(...values),meanOnTarget:rows.reduce((s,r)=>s+r.totalOnTarget,0)/rows.length,meanGoals:rows.reduce((s,r)=>s+r.score[0]+r.score[1],0)/rows.length,formations:Object.fromEntries([...new Set(rows.flatMap(r=>r.initialTeams.map(t=>t.tactics.formation)))].map(f=>[f,rows.flatMap(r=>r.initialTeams).filter(t=>t.tactics.formation===f).length]))};};
  report.summary={overall:stats(report.rows),configs:['standard','large'].map(size=>({fieldSize:size,fieldPlayers:size==='standard'?5:6,...stats(report.rows.filter(r=>r.config.fieldSize===size))})),scope:'Balanced6country sample, only one selected initial-rank2 club and first own league fixture each, two configs. No population-average guarantee or target calibration.'};
  for(const[f,b]of frozen)assert.equal(hash(fs.readFileSync(path.join(root,'dist',f))),hash(b),'production source unchanged '+f);report.sourceUnchanged=true;report.pass=true;
 }catch(e){report.pass=false;report.failure=e.stack;process.exitCode=1;}
 finally{if(browser)await browser.close();await new Promise(r=>server.close(r));report.runnerSha256=hash(fs.readFileSync(__filename));fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({pass:report.pass,summary:report.summary,failure:report.failure}));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
