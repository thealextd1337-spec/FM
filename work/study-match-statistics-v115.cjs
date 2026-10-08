// Controlled, isolated study of the real live engine. Never uses a user's save.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve('docs/spieler-nutzer-rig'),artifact=path.resolve('outputs/Doppel-6-Fussballmanager.html');
const seeds=Array.from({length:30},(_,i)=>(20261004+i*104729)>>>0);
const pairs=[{id:'good-good',label:'Gut gegen gut',a:16,b:16},{id:'good-weak',label:'Gut gegen schwach',a:16,b:6},{id:'weak-weak',label:'Schwach gegen schwach',a:6,b:6}];
const tactics={formation:'2–2–1',pressing:'Ausgewogen',passing:'Variabel',defense:'Neutral',aggression:'Normal',focus:'Variabel'};
const report={date:'2026-10-04',engine:'v115; regular offline build; physical live engine',artifact:{path:path.relative(process.cwd(),artifact),sha256:crypto.createHash('sha256').update(fs.readFileSync(artifact)).digest('hex')},method:{seeds,tactics,physicsHz:20,realDelta:.05,homeGamesA:15,awayGamesA:15,pairedSeeds:true,initialAge:25,initialFreshness:100,initialForm:0,adaptiveCoaches:false,substitutions:false,rendering:false,careerResetEveryGame:true,roles:['gk','def','def','mid','mid','att'],instructions:{gk:[],def:[],midLeft:['wing','support'],midRight:['support'],att:['deep','shoot']},specialization:{gk:{gk:2,pos:1,air:1},def:{tak:2,pos:2,air:1},mid:{pas:2,tec:2,sta:1},att:{fin:2,spd:2,pos:1,air:1}},goodBase:16,weakBase:6},profiles:null,runs:[],errors:[]};
if(process.argv.includes('--resume')){const saved=JSON.parse(fs.readFileSync(path.join(root,'match-study-v115.json')));assert.equal(saved.artifact.sha256,report.artifact.sha256,'Resume requires identical game build');report.runs=saved.runs;report.profiles=saved.profiles;report.errors=saved.errors;}
const audit=process.argv.includes('--audit-accounting'),baseline=audit?JSON.parse(fs.readFileSync(path.join(root,'match-study-v115.json'))):null;
const auditCases=baseline?.runs.filter(r=>r.teams.some(s=>s.saves+s.conceded!==s.faced))||[];
if(audit)report.auditOf='match-study-v115.json';
const save=()=>fs.writeFileSync(path.join(root,audit?'match-study-accounting-v115.json':'match-study-v115.json'),JSON.stringify(report,null,2)+'\n');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:850}});page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(pathToFileURL(artifact).href);await page.waitForFunction(()=>window.userMeshyMatchReady,null,{timeout:60000});
  await page.evaluate(()=>{
   clearInterval(v65WorldFrame);clearInterval(v64UiTimer);v102StopPaint();
   let s=7115;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};
   const c=v61CreateCareer('GER-2','isolated-statistics-v115'),club=c.world.clubs.find(x=>x.id==='GER-2');
   v66ChooseSponsor(c,club.id,club.sponsors[0].id);while(c.world.market.phase==='open')v66NextMarketDay(c);
   const leagueIds=new Set(v62Current(c).filter(x=>x.type==='league').map(x=>x.id));
   const f=v62Fixtures(c).find(x=>!x.result&&leagueIds.has(x.competitionId)&&(x.homeId===club.id||x.awayId===club.id));
   if(!f)throw Error('No league fixture');
   window.__matchStudy={base:JSON.stringify(c),fixtureId:f.id,otherId:f.homeId===club.id?f.awayId:f.homeId,first:true};
  });
  for(const pair of pairs)for(let index=0;index<seeds.length;index++){
   if(report.runs.some(r=>r.pair===pair.id&&r.game===index+1))continue;
   if(audit&&!auditCases.some(r=>r.pair===pair.id&&r.game===index+1))continue;
   const run=await page.evaluate(({pair,index,initialSeed,tactics,specialization})=>{
    const study=window.__matchStudy;clearInterval(v65WorldFrame);clearInterval(v64UiTimer);v102StopPaint();if(match)v103EndReplay(match);match=null;v65WorldActive=null;
    const career=JSON.parse(study.base),fixture=v62Fixtures(career).find(x=>x.id===study.fixtureId),a=career.world.clubs.find(x=>x.id==='GER-2'),b=career.world.clubs.find(x=>x.id===study.otherId);
    const roles=['gk','def','def','mid','mid','att','gk','def','mid','mid','att'],keys=['spd','tec','pas','fin','tak','pos','air','sta','gk'];
    const make=(club,base,team)=>{
     const original=club.roster;
     club.roster=roles.map((role,n)=>{
      const source=original.find(p=>p.line===role)||original.find(p=>!!p.keeper===(role==='gk'));
      const p={...source,pid:`study-${team}-${String(n).padStart(2,'0')}`,name:`Team ${team} ${role} ${n+1}`,line:role,keeper:role==='gk',n:n+1,age:25,fresh:100,form:0,formRatings:[],youthPotential:null};
      for(const k of keys)p[k]=base+(specialization[role][k]||0);
      return p;
     });
     return club.roster.map(p=>({pid:p.pid,line:p.line,age:p.age,fresh:p.fresh,form:p.form,...Object.fromEntries(keys.map(k=>[k,p[k]]))}));
    };
    const profiles=[make(a,pair.a,'A'),make(b,pair.b,'B')],aHome=index%2===0;
    fixture.homeId=aHome?a.id:b.id;fixture.awayId=aHome?b.id:a.id;fixture.result=null;
    const side=club=>({...v64BuildSide(club,tactics.formation),coachId:null,tactics:{...tactics}});
    fixture.plan={home:side(aHome?a:b),away:side(aHome?b:a)};
    const state=v64MakeState(career,fixture);state.phase='live';state.tactics=[{...tactics},{...tactics}];state.instructions={};state.orientation={};state.cells={};
    for(const t of [0,1]){
     v64ResetCells(state,t);let mid=0;
     for(const pid of v64Active(state,t)){const role=state.roles[pid];v64SetInstructions(state,pid,role==='att'?['deep','shoot']:role==='mid'?(mid++===0?['wing','support']:['support']):[]);}
    }
    career.world.activeMatch={fixtureId:fixture.id,state};v61CurrentCareer=career;v98View='2d';v65ProcessedGoals=0;v65PauseRequested=false;v65PendingExit=false;v65PauseView=false;
    let seed=initialSeed,draws=0;Math.random=()=>{draws++;seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
    if(study.first){v65Show(v65Context());study.first=false;}else{v65WorldActive=v65Context();v65CreateMatch(v65Context());}
    clearInterval(v65WorldFrame);v102StopPaint();running=true;hideOverlay();
    const counters=[{offsides:0,throwIns:0,parries:0,fieldBlocks:0,betterSquare:0,keeperChallenges:0},{offsides:0,throwIns:0,parries:0,fieldBlocks:0,betterSquare:0,keeperChallenges:0}],shots=[],goalTrace=[],restore=[];
    const wrap=(name,observe)=>{const base=window[name];restore.push([name,base]);window[name]=function(...args){return observe(base,this,args)}};
    wrap('v55WhistleOffside',(base,self,args)=>{counters[args[1].t].offsides++;return base.apply(self,args)});
    wrap('v55BeginThrow',(base,self,args)=>{counters[1-args[1]].throwIns++;return base.apply(self,args)});
    wrap('v50Deflect',(base,self,args)=>{const defender=args[2];counters[defender.t][defender.keeper?'parries':'fieldBlocks']++;return base.apply(self,args)});
    wrap('v115BetterSquare',(base,self,args)=>{const result=base.apply(self,args);if(result)counters[args[0].t].betterSquare++;return result});
    wrap('v55Shoot',(base,self,args)=>{const p=args[0],before=p.stats.shots,dist=v115GoalDistance(p),result=base.apply(self,args);if(p.stats.shots>before)shots.push({team:p.t,kind:args[1]||'shot',distance:dist});return result});
    wrap('v50FinishPenalty',(base,self,args)=>{const p=args[0].taker,before=p.stats.shots,dist=v115GoalDistance(p),result=base.apply(self,args);if(p.stats.shots>before)shots.push({team:p.t,kind:'penalty',distance:dist});return result});
    if(goalTrace&&typeof v50Goal==='function')wrap('v50Goal',(base,self,args)=>{const f=match.flight||(typeof v109IncomingFlight!=='undefined'&&v109IncomingFlight?.current===match?v109IncomingFlight.flight:null),meta=f&&v102Flights.get(f);goalTrace.push({team:args[0].t,source:args[3]||null,elapsed:match.elapsed,flightKind:meta?.kind||null,scoreBefore:[...match.score],shooterShots:args[0].stats.shots,shooterOnTarget:args[0].stats.onTarget});return base.apply(self,args)});
    let frames=0;const halves=new Set(),challenges=new WeakSet();
    while(!match.finished&&frames++<18000){
     if(state.phase==='paused'){v65Resume();clearInterval(v65WorldFrame);}
     step(.05*MATCH_SPEED,.05);if(state.phase==='live'&&!match.finished)v65AfterStep(v65Context());
     halves.add(!!match.halftimeBreakDone);
     if(typeof v115KeeperChallenges!=='undefined'){const ch=v115KeeperChallenges.get(match);if(ch&&!challenges.has(ch)){challenges.add(ch);counters[ch.keeper.t].keeperChallenges++;}}
    }
    running=false;clearInterval(v65WorldFrame);for(const [n,f]of restore)window[n]=f;
    const aggregate=team=>{const people=[...match.people,...(match.exitedPeople||[])].filter(p=>p.t===team),stats={};for(const p of people)for(const [k,v]of Object.entries(p.stats))if(Number.isFinite(v)&&k!=='rating')stats[k]=(stats[k]||0)+v;return {...stats,...counters[team],corners:match.setPieceStats.corners[team],freeKicks:match.setPieceStats.freeKicks[team],penalties:match.setPieceStats.penalties[team],possessionSeconds:match.possession[team]};};
    return {pair:pair.id,game:index+1,seed:initialSeed,aHome,score:[...match.score],teams:[aggregate(0),aggregate(1)],shots,goalTrace,terminalFlight:match.flight?{progress:match.flight.progress,kind:v102Flights.get(match.flight)?.kind||null}:null,profiles:index===0?profiles:null,finished:match.finished,halves:[...halves],steps:frames,elapsed:match.elapsed,minute:state.minute,addedMinutes:state.addedMinutes,substitutions:state.substitutions.length,tactics:state.tactics,result:fixture.result,events:state.events,draws};
   },{pair,index,initialSeed:seeds[index],tactics,specialization:report.method.specialization});
   assert(run.finished,`Unfinished ${pair.id}/${index+1}`);assert.equal(run.halves.length,2);assert.equal(run.substitutions,0);assert.deepEqual(run.tactics,[tactics,tactics]);
   assert(run.result,'Final result not booked');
   const homeScore=run.aHome?run.score:[run.score[1],run.score[0]];
   if(audit){const old=auditCases.find(r=>r.pair===run.pair&&r.game===run.game);assert.deepEqual(run.score,old.score,'Audit reproduces result');assert.deepEqual(run.teams,old.teams,'Audit reproduces all counters');assert.equal(run.draws,old.draws,'Audit does not consume extra random numbers');}
   assert.deepEqual([run.result.homeGoals,run.result.awayGoals],homeScore,'physical/home score mapping');
   for(const t of [0,1]){assert.equal(run.teams[t].goals,run.score[t]);assert(run.teams[t].onTarget<=run.teams[t].shots);assert(run.teams[t].passComplete<=run.teams[t].passes);assert.equal(run.teams[t].shots,run.shots.filter(s=>s.team===t).length,'observed shot counter');}
   report.profiles||={};if(run.profiles)report.profiles[pair.id]=run.profiles;delete run.profiles;
   report.runs.push(run);save();if(report.runs.length%5===0)console.log(`${report.runs.length}/${audit?auditCases.length:90}: ${pair.label}, game ${index+1}, ${run.score.join(':')}, ${run.steps} steps`);
  }
  assert.equal(report.runs.length,audit?auditCases.length:90);assert.deepEqual(report.errors,[]);report.validation={completeGames:report.runs.length,bothHalves:true,fixedTactics:true,noSubstitutions:true,bookedScoresMatch:true,shotCountersMatch:true,noPageErrors:true};save();console.log(`${report.runs.length} physical live matches completed and integrity checks passed.`);
 }finally{await browser.close();}
})().catch(e=>{save();console.error(e);process.exitCode=1});
