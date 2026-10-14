'use strict';
// Player intelligence 183: native measurement harness without file copies.
// Derived from work/measure-si-r132.cjs (same observers, careers, seeds and
// per-match records). Instead of string replacements in copied dist files, the
// SI configuration of each new match is set through the constructor parameter
// of v65CreateMatch ({si:{packages,params,clockRate}}). dist/ is served
// unchanged and never written; its hashes are checked before and after.
//
// Usage (Node >= 20, ports 4250-4269, at most 6 pages per lane):
//   node work/measure-si183.cjs --packages=none --clubs=24 --workers=6 --port=4250
//   node work/measure-si183.cjs --packages=finish,clock --clockRate=0.42 --params=finish.spread=0.5
//   node work/measure-si183.cjs --params='{"defence":{"pressRadius":2.5}}' --label=defence-r25
//   node work/measure-si183.cjs --dist=work/tmp-base183 --label=base   (pre-183 base tree, no overrides)
//   node work/measure-si183.cjs --compare=base,si183-none [--expectIdentical]
// --packages: comma list switched on (others keep the constructor default),
//   "none" = every package off, "all" = every package on; omitted = default.
// --params: "pkg.name=value,..." (JSON values) or a JSON object per package.
// Results: outputs/si183/<label>.json; start/end lines in outputs/si183/queue.log.
// --traceLimit=N enlarges the transient decision trace (v183SetTraceLimit).
// Further flags as in measure-si-r132: --clubs --offset --sizes --seedPrefix
// --only --sequence --instrument --dt --boost --wallclock --models --settle --recycle;
// diagnostic flags (models, settle, wallclock, sequence) mark the file name.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),outDir=path.join(root,'outputs/si183');
const arg=(name,fallback)=>{const hit=process.argv.find(a=>a.startsWith('--'+name+'='));return hit?hit.slice(name.length+3):fallback;};
const PACKAGES=['clock','options','offball','finish','defence','setplay','field'];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');

// ---------------------------------------------------------------------------
// Paired comparison of two result files (per club and pitch size).
if(arg('compare','')){
 const [a,b]=arg('compare','').split(','),load=label=>JSON.parse(fs.readFileSync(path.join(outDir,label+'.json'),'utf8'));
 const A=load(a),B=load(b),key=r=>r.clubId+'|'+r.size,mapB=new Map(B.matches.map(r=>[key(r),r])),pairs=A.matches.filter(r=>mapB.has(key(r))).map(r=>[r,mapB.get(key(r))]);
 const total=(r,k)=>r.teams[0].stats[k]+r.teams[1].stats[k],mean=f=>side=>pairs.length?pairs.reduce((s,p)=>s+f(p[side]),0)/pairs.length:NaN;
 const metrics={minutes:r=>r.realSeconds/60,shots:r=>total(r,'shots'),onTarget:r=>total(r,'onTarget'),goals:r=>r.score[0]+r.score[1],passes:r=>total(r,'passes'),fouls:r=>total(r,'fouls'),saves:r=>total(r,'saves'),crosses:r=>total(r,'crosses'),corners:r=>r.extras.corners,freeKicks:r=>r.extras.freeKicks,rebounds:r=>r.extras.rebounds,ticks:r=>r.ticks,draws:r=>r.draws};
 const table=Object.fromEntries(Object.entries(metrics).map(([k,f])=>{const x=mean(f)(0),y=mean(f)(1);return[k,{[a]:+x.toFixed(4),[b]:+y.toFixed(4),delta:+(y-x).toFixed(4)}];}));
 const identical=pairs.filter(([x,y])=>x.digestSha===y.digestSha).length,identicalState=pairs.filter(([x,y])=>x.stateDigestSha&&x.stateDigestSha===y.stateDigestSha).length;
 const report={a,b,pairs:pairs.length,onlyA:A.matches.length-pairs.length,onlyB:B.matches.length-pairs.length,failures:[A.failures.length,B.failures.length],identicalDigest:identical,identicalStateDigest:identicalState,differing:pairs.filter(([x,y])=>x.stateDigestSha!==y.stateDigestSha).map(([x])=>key(x)),metrics:table};
 console.log(JSON.stringify(report,null,1));
 if(process.argv.includes('--expectIdentical')&&(identicalState!==pairs.length||!pairs.length||report.onlyA||report.onlyB||A.failures.length||B.failures.length))process.exitCode=1;
 return;
}

const distRoot=path.resolve(root,arg('dist','.')),dist=path.join(distRoot,'dist'),distLabel=(path.relative(root,distRoot)||'.').split(path.sep).join('/');
const clubCount=+arg('clubs','96'),sizes=arg('sizes','standard,large').split(','),workers=+arg('workers','6'),port=+arg('port','4250');
const recycle=+arg('recycle','12'),sequence=arg('sequence','').split(',').filter(Boolean),clockMode=arg('wallclock','natural'),models=arg('models','normal'),settle=+arg('settle','1500'),only=arg('only','').split(',').filter(Boolean),seedPrefix=arg('seedPrefix','p01r132'),boostArg=arg('boost',''),instrument=arg('instrument','1')!=='0',dt=+arg('dt','0.05'),clubOffset=+arg('offset','0'),traceLimit=arg('traceLimit',null);
assert(traceLimit===null||Number.isInteger(+traceLimit)&&+traceLimit>=1,'traceLimit: positive integer');
assert(port>=4250&&port<=4269,'Port range 4250-4269');assert(workers>=1&&workers<=6,'At most 6 pages per lane');
// SI constructor overrides.
const packagesArg=arg('packages',null),paramsArg=arg('params',null),clockArg=arg('clockRate',null);
const si={};
if(packagesArg!==null){
 const list=packagesArg==='none'?[]:packagesArg==='all'?PACKAGES:packagesArg.split(',').filter(Boolean);
 for(const p of list)assert(PACKAGES.includes(p),'Unknown SI package '+p);
 si.packages=packagesArg==='none'||packagesArg==='all'?Object.fromEntries(PACKAGES.map(p=>[p,list.includes(p)])):Object.fromEntries(list.map(p=>[p,true]));
}
if(paramsArg!==null){
 si.params={};
 if(paramsArg.trim().startsWith('{'))Object.assign(si.params,JSON.parse(paramsArg));
 else for(const item of paramsArg.split(',').filter(Boolean)){const [key,raw]=item.split('='),[pkg,...rest]=key.split('.');assert(PACKAGES.includes(pkg)&&rest.length&&raw!==undefined,'Parameter "pkg.name=value" expected: '+item);let value;try{value=JSON.parse(raw);}catch{value=raw;}(si.params[pkg]??={})[rest.join('.')]=value;}
}
if(clockArg!==null){si.clockRate=+clockArg;assert(Number.isFinite(si.clockRate)&&si.clockRate>0,'clockRate > 0');}
const siOverride=Object.keys(si).length?si:null;
const baseTree=!fs.existsSync(path.join(dist,'match-si-core-v183.js'));
assert(!(baseTree&&(siOverride||traceLimit)),'A pre-183 base tree takes no SI overrides');
const label=arg('label',baseTree?'base':'si183'+(packagesArg!==null?'-'+(packagesArg||'none').replaceAll(',','+'):'')+(paramsArg!==null?'-p'+sha(JSON.stringify(si.params)).slice(0,8):'')+(clockArg!==null?'-rate'+clockArg:''));
const out=arg('out',path.join(outDir,`${label}${boostArg?'-boost-'+boostArg.replace(/[:,]/g,'_'):''}${instrument?'':'-noinst'}${seedPrefix!=='p01r132'?'-'+seedPrefix:''}${models!=='normal'?'-models-'+models:''}${settle!==1500?'-settle'+settle:''}${clockMode!=='natural'?'-wall-'+clockMode.replace(':',''):''}${sequence.length?'-seq':''}${traceLimit?'-trace'+traceLimit:''}${dt!==.05?'-dt'+dt:''}.json`));

// dist hashes (all top-level and UI scripts/pages) before and after the run.
const distFiles=()=>[...fs.readdirSync(dist).filter(f=>/\.(js|html)$/.test(f)),...fs.readdirSync(path.join(dist,'ui-flutlicht')).filter(f=>/\.js$/.test(f)).map(f=>'ui-flutlicht/'+f),...fs.readdirSync(path.join(dist,'ui-flutlicht/views')).filter(f=>/\.js$/.test(f)).map(f=>'ui-flutlicht/views/'+f)].sort();
const hashDist=()=>Object.fromEntries(distFiles().map(f=>[f,sha(fs.readFileSync(path.join(dist,f)))]));
const frozen=hashDist();
const queue=event=>{fs.mkdirSync(outDir,{recursive:true});fs.appendFileSync(path.join(outDir,'queue.log'),JSON.stringify({at:new Date().toISOString(),event,label,port,pid:process.pid,dist:distLabel,si:siOverride,...(event==='start'?{clubs:clubCount,sizes,offset:clubOffset,seedPrefix}:{})})+'\n');};

const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.glb':'model/gltf-binary','.wav':'audio/wav','.wasm':'application/wasm'};
const server=http.createServer((req,res)=>{
 const rel=decodeURIComponent(new URL(req.url,'http://x').pathname),m=/^\/d\/(.*)$/.exec(rel);
 if(!m){res.writeHead(404);res.end();return;}
 const file=path.resolve(dist,m[1]);if(!file.startsWith(dist+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');
 fs.createReadStream(file).pipe(res);
});

// ---------------------------------------------------------------------------
// In-page observers. They only read state and wrap functions; they never call
// Math.random. The determinism check (--instrument=0) compares digests.
const installObservers=()=>{
 if(window.__p01)return;
 const P=window.__p01={rec:null};
 const W=()=>v160PitchWidth()/(v55Field.right-v55Field.left),L=()=>v160PitchLength()/(v55Field.bottom-v55Field.top);
 const goalY=t=>t===0?v55Field.top:v55Field.bottom;
 const toGoal=(pt,t)=>Math.hypot((pt.x-.5)*W(),(pt.y-goalY(t))*L());
 P.toGoal=toGoal;P.W=W;P.L=L;
 const geo=(p)=>{const t=p.t,depth=Math.abs(goalY(t)-p.y)*L(),lateral=Math.abs(p.x-.5)*W(),gw=match.geometry?.goalWidth||.2*v160PitchWidth(),a1=Math.atan2(lateral+gw/2,depth),a2=Math.atan2(lateral-gw/2,depth);return{range:Math.hypot(depth,lateral),depth,lateral,angleDeg:Math.abs(a1-a2)*180/Math.PI,goalWidth:gw};};
 const pressureOf=(p)=>{const rivals=match.people.filter(q=>q.t!==p.t&&!q.keeper);let nearest=99,n25=0,lane=0;const goal={x:.5,y:goalY(p.t)};for(const r of rivals){const d=v122Metres(r,p);nearest=Math.min(nearest,d);if(d<2.5)n25++;const g=passLaneGeometry(r,p,goal);if(g&&v122Metres(r,g)<1.4)lane++;}const keeper=match.people.find(q=>q.t!==p.t&&q.keeper);return{nearest,n25,laneBlockers:lane,keeperDist:keeper?v122Metres(keeper,p):null,keeperOffLine:keeper?Math.abs(keeper.y-goalY(p.t))*L():null};};
 P.geo=geo;P.pressureOf=pressureOf;
 const skills=p=>({fin:p.fin,tec:p.tec,pas:p.pas,spd:p.spd,air:p.air,pos:p.pos,effFin:+ability(p,'fin').toFixed(2),effTec:+ability(p,'tec').toFixed(2)});
 const shotRecord=(p,kind)=>{const R=P.rec;if(!R)return null;const g=geo(p),pr=pressureOf(p),ph=R.phase,now=R.tick;
  return{tick:now,elapsed:+match.elapsed.toFixed(3),team:p.t,pid:p.pid,line:p.assignedLine||p.line,kind:kind||'shot',direct:typeof v127OneTouchRelease!=='undefined'&&v127OneTouchRelease?.person===p,...g,...pr,skills:skills(p),
   phase:ph&&ph.team===p.t?{start:ph.startReason,secs:+((now-ph.startTick)*R.dt).toFixed(2),passes:R.teamStat(p.t,'passes')-ph.passes0,startDist:ph.startDist,restartAgo:R.lastRestart?+((now-R.lastRestart.tick)*R.dt).toFixed(2):null,restartType:R.lastRestart?.type??null,restartTeam:R.lastRestart?.team??null}:null,
   lastLoose:R.lastLooseShot&&now-R.lastLooseShot.tick<=Math.round(5/R.dt)?{team:R.lastLooseShot.team,ago:+((now-R.lastLooseShot.tick)*R.dt).toFixed(2)}:null,
   setPiece:match.setPiece?.type||null,restart:R.lastRestart?{type:R.lastRestart.type,team:R.lastRestart.team,ago:+((now-R.lastRestart.tick)*R.dt).toFixed(2)}:null,lastPhase:R.lastPhaseByTeam[p.t]?{start:R.lastPhaseByTeam[p.t].startReason,end:R.lastPhaseByTeam[p.t].endReason,endedAgo:+((now-R.lastPhaseByTeam[p.t].endTick)*R.dt).toFixed(2)}:null,ballZone:null};};
 const wrap=(name,fn)=>{const base=window[name];if(typeof base!=='function')return;window[name]=function(...args){return fn(base,this,args);};};
 wrap('v55Shoot',(base,self,args)=>{const R=P.rec,p=args[0],before=p.stats.shots,rec=R?shotRecord(p,args[1]):null,value=base.apply(self,args);
  if(R&&p.stats.shots>before){const ev=match.flight&&typeof v117Flights!=='undefined'?v117Flights.get(match.flight):null;rec.eventId=ev?.id??null;rec.blockedAtRelease=!!(match.flight&&v99Flights.get(match.flight)?.blocked);R.shots.push(rec);R.onShot(p);}return value;});
 wrap('v50FinishPenalty',(base,self,args)=>{const R=P.rec,p=args[0]?.taker,before=p?.stats.shots,rec=R&&p?shotRecord(p,'penalty'):null,value=base.apply(self,args);if(R&&p&&p.stats.shots>before){rec.penalty=true;R.shots.push(rec);R.onShot(p);}return value;});
 wrap('v55Approach',(base,self,args)=>{const R=P.rec;if(R&&R.watchApproach&&args[0]&&args[1])R.approach.set(args[0].pid,{x:args[1].x,y:args[1].y});return base.apply(self,args);});
 wrap('v50GoalKick',(base,self,args)=>{const R=P.rec;if(R&&args[0])R.restart('goalKick',args[0].t);return base.apply(self,args);});
 // Decisions of the ball carrier in the attacking half: what was chosen?
 wrap('v157Decide',(base,self,args)=>{const R=P.rec,[m,p]=args;if(!R||!p||p.keeper||m.owner!==p)return base.apply(self,args);
  const range=toGoal(p,p.t);if(range>32)return base.apply(self,args);
  const g=geo(p),pr=pressureOf(p),shots=p.stats.shots,passes=R.teamStat(p.t,'passes'),flight=m.flight,carry=m.attackFlow?.carry,turn=m.attackFlow?.pendingTurn,receipt=m.attackFlow?.receipt;
  const waiting=receipt?.playerId===p.pid&&v152Seconds(m)<receipt.readyAt;
  const value=base.apply(self,args);
  let outcome='halten';
  if(p.stats.shots>shots)outcome='schuss';
  else if(R.teamStat(p.t,'passes')>passes||m.flight&&m.flight!==flight){const meta=m.flight&&v102Flights.get(m.flight);outcome='pass-'+(meta?.kind||'?');}
  else if(waiting)outcome='annahme-warten';
  else if(m.attackFlow?.pendingTurn&&m.attackFlow.pendingTurn!==turn)outcome='pass-drehung';
  else if(turn&&m.attackFlow?.pendingTurn===turn)outcome='drehung-laeuft';
  else if(m.attackFlow?.carry?.playerId===p.pid&&m.attackFlow.carry!==carry)outcome='tragen';
  else if(m.breakawayCarrier===p)outcome='durchbruch';
  else if(m.owner!==p)outcome='ballverlust';
  const angleOk=g.lateral<=g.depth*.85+1,bucket=range<=14?'<=14':range<=18?'14-18':range<=22?'18-22':range<=26?'22-26':'26-32';
  const key=[bucket,angleOk?'winkel-ok':'winkel-spitz',pr.laneBlockers?'lane-zu':'lane-frei',outcome].join('|');R.decisions[key]=(R.decisions[key]||0)+1;
  return value;});
};

const runMatch=async({clubId,size,seed,dt,instrument,boost,clockMode,si})=>{
 // Optional control of performance.now (wall clock) to test snapshot neutrality:
 // natural = real clock, never = frozen, every = +1000 ms per call, ms:<n> = <n> ms wall time per native step.
 const realNow=performance.now.bind(performance),originalNow=performance.now;let fakeNow=realNow(),tickCounter=0;
 if(clockMode==='never')performance.now=()=>fakeNow;else if(clockMode==='every')performance.now=()=>(fakeNow+=1000);else if(String(clockMode).startsWith('ms:')){const per=+clockMode.slice(3);performance.now=()=>fakeNow+tickCounter*per;}
 if(instrument)(window.__p01Install||(()=>{}))();
 let rng=0;for(const ch of seed)rng=(Math.imul(rng,31)+ch.charCodeAt(0))>>>0;let draws=0;
 const random=Math.random,dateNow=Date.now,ours=()=>{draws++;rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296};Math.random=ours;
 const env=()=>({view:typeof v98View!=='undefined'?v98View:null,isWorld:typeof v98IsWorld==='function'?v98IsWorld():null,landscape:typeof v98Orientation!=='undefined'?v98Orientation.matches:null,unityReady:window.D6UnityMatch?.ready??null,v98Failed:typeof v98Failed!=='undefined'?v98Failed:null,replay:typeof v103Replays!=='undefined'&&match?Object.keys(v103Replays.get(match)||{}):null,heldStep:typeof v103HeldStep!=='undefined'?!!v103HeldStep:null,dialog:typeof v47PlayerDialog!=='undefined'?(v47PlayerDialog.open?v47PlayerDialog.className||'open':false):null,hidden:document.hidden,running:typeof running!=='undefined'?running:null,modelStatus:window.D6UserModelStatus??null});
 const integrity={envStart:null,envEnd:null,frozenTicks:0,contextMismatchAt:null,notLiveStepTicks:0,firstNotLiveStep:null,setupYield:null,randomSwappedAt:null,matchSwappedAt:null,hiddenTicks:0,dialogsAtStart:null,dialogsAtEnd:null,hiddenAtStart:document.hidden};Date.now=()=>1791540000000;
 const t0=realNow();
 try{
  const c=D6Expansion.createCareer(clubId,seed,'P01 Analyse',{fieldSize:size,fieldPlayers:size==='standard'?5:6});
  const own=v66Own(c);v66ChooseSponsor(c,own.id,own.sponsors[0].id);v124SetYouthBudget(c,0);
  // Synchronous on purpose: an await would let pending page promises consume the seeded stream.
  for(let i=0;i<40&&['open','deadline'].includes(c.world.market?.phase);i++)v66NextMarketDay(c);
  const fixture=v64AdvanceToOwnMatch(c);if(!fixture)throw Error('no own fixture');
  const state=c.world.activeMatch.state;
  const boosted={};if(boost){const club=c.world.clubs.find(x=>x.id===(boost.side==='own'?own.id:(fixture.homeId===own.id?fixture.awayId:fixture.homeId)));for(const p of club.roster){boosted[p.pid]=null;if(p.keeper&&boost.key!=='gk')continue;if(!p.keeper&&boost.key==='gk')continue;p[boost.key]=Math.min(20,p[boost.key]+boost.delta);boosted[p.pid]=p[boost.key];if(p.playerModel?.caps)p.playerModel.caps[boost.key]=Math.max(p.playerModel.caps[boost.key]||0,p[boost.key]);}}
  v61CurrentCareer=c;state.phase='paused';match=null;v65WorldActive=null;v98View='2d';{const createBase=v65CreateMatch;if(si)v65CreateMatch=function(context,options){return createBase.call(this,context,{...options,si});};try{v65Show(v65Context());}finally{v65CreateMatch=createBase;}}clearInterval(v65WorldFrame);v103CanReplay=()=>false;draw=()=>{};
  const m=match,ctx0=v65Context(),ownSide=ctx0.ownSide,setupMs=realNow()-t0;
  // The constructor override must be visible in the match (packages, rate, parameters).
  if(si){for(const [k,v]of Object.entries(si.packages||{}))if(m.si?.packages?.[k]!==v)throw Error('SI package override not applied: '+k);if(si.clockRate!==undefined&&m.si?.clockRate!==si.clockRate)throw Error('SI clock rate override not applied');for(const [pkg,values]of Object.entries(si.params||{}))for(const [k,v]of Object.entries(values))if(JSON.stringify(m.si?.params?.[pkg]?.[k])!==JSON.stringify(v))throw Error('SI parameter override not applied: '+pkg+'.'+k);}
  const markers={looseBall:m.attackFlow.looseBallRevision??null,pursuit:m.attackFlow.pursuitRevision??null,pace:m.attackFlow.paceRevision??null,flow:m.attackFlow.flowVersion??null,shotBalance:state.playerPerformance?.shotBalanceRevision??null,matchSpeed:MATCH_SPEED,si:m.si?JSON.parse(JSON.stringify(m.si)):null};
  const teamInfo=[0,1].map(t=>{const side=t===0?ownSide:1-ownSide,clubIdT=side===0?fixture.homeId:fixture.awayId,club=c.world.clubs.find(x=>x.id===clubIdT),people=m.people.filter(p=>p.t===t),field=people.filter(p=>!p.keeper),keeper=people.find(p=>p.keeper),keys=['spd','tec','pas','fin','tak','pos','air','sta'],mean=k=>+(field.reduce((s,p)=>s+(p[k]||0),0)/field.length).toFixed(2);
   return{physical:t,venue:side===0?'home':'away',own:t===0,clubId:clubIdT,country:club.countryId,league:!!club.leagueId,tactics:JSON.parse(JSON.stringify(state.tactics[side]||{})),direct:m.teamDirect?.[t]??null,press:m.teamPress?.[t]??null,defenseLine:m.defenseLines?.[t]??null,field:field.length,skills:Object.fromEntries(keys.map(k=>[k,mean(k)])),ovr:+(keys.reduce((s,k)=>s+mean(k),0)/keys.length).toFixed(2),attack:+((mean('fin')+mean('tec')+mean('pas')+mean('spd'))/4).toFixed(2),defence:+((mean('tak')+mean('pos')+mean('spd'))/3).toFixed(2),gk:keeper?.gk??null,keeperPid:keeper?.pid??null};});
  if(boost){const hit=m.people.filter(p=>boosted[p.pid]!=null);if(!hit.length||!hit.every(p=>p[boost.key]===boosted[p.pid]))throw Error('boost not visible in match');}
  // ---------------- per-tick recorder ----------------
  const R={approach:new Map(),watchApproach:false,stall:null,lastPhaseByTeam:[null,null],ballZone22:[0,0],dt,tick:0,shots:[],phases:[],decisions:{},time:{},clock:{},zone:[[0,0],[0,0]],zone30:[[0,0],[0,0]],restarts:[],lastRestart:null,phase:null,lastLooseShot:null,ownerHold:[],
   teamStat(t,k){let n=0;for(const p of m.people)if(p.t===t)n+=p.stats[k]||0;for(const p of m.exitedPeople||[])if(p.t===t)n+=p.stats[k]||0;return n;},
   restart(type,team){const ev={type,team,tick:R.tick,elapsed:+m.elapsed.toFixed(3)};R.restarts.push(ev);R.lastRestart=ev;R.pendingRestart=ev;if(R.phase)R.endPhase('restart-'+type+(team===R.phase.team?'-eigen':'-gegner'));},
   onShot(p){if(R.phase&&R.phase.team===p.t)R.endPhase('schuss');else R.endPhase('schuss-gegner?');R.shotTick=R.tick;},
   endPhase(reason){const ph=R.phase;if(!ph)return;ph.endReason=reason;ph.endTick=R.tick;ph.secs=+((R.tick-ph.startTick)*dt).toFixed(2);ph.clockSecs=+(m.elapsed-ph.startElapsed).toFixed(3);ph.passes=R.teamStat(ph.team,'passes')-ph.passes0;ph.passOk=R.teamStat(ph.team,'passComplete')-ph.passOk0;delete ph.passes0;delete ph.passOk0;R.phases.push(ph);R.lastPhaseByTeam[ph.team]=ph;R.phase=null;},
  };
  if(instrument)window.__p01.rec=R;
  const keysT=['tacklesWon','interceptions','saves','slideWon','fouls'];
  const snap=()=>[0,1].map(t=>Object.fromEntries(keysT.map(k=>[k,R.teamStat(t,k)])));
  let prev=snap(),lastSP=null,lastThrow=null,lastKick=null,lastGoalPause=0,lastOwner=null,ownerSince=0,ticks=0,lastLedger=0,lostKind=null;
  const category=()=>{if(m.halftimePause>0)return'halbzeitpause';if(m.goalPause>0)return'torszene';if(m.postBanner)return m.postBanner.kind==='goal'?'torszene':'anstoss';if(m.kickoff&&m.kickoff.phase!=='rolling')return'anstoss';if(m.kickoff)return'anstoss-rollt';if(m.setPiece)return'standard-'+m.setPiece.type+':'+(m.setPiece.phase||'?');if(m.throwIn)return'einwurf';if(m.halftimePending||m.fulltimePending)return'pfiff-wartet';if(m.owner?.keeper)return'torwart-am-ball';if(!m.owner&&m.flight)return'ball-im-flug';if(!m.owner)return'freier-ball';return'ballfuehrung';};
  const phaseLog=[];let phaseVal=state.phase,traceTick=0;Object.defineProperty(state,'phase',{configurable:true,enumerable:true,get(){return phaseVal;},set(v){if(v!=='live'&&traceTick>0&&phaseLog.length<8)phaseLog.push({to:v,from:phaseVal,tick:traceTick,stack:String(new Error().stack).split(String.fromCharCode(10)).slice(2,9).map(x=>x.trim().replace(location.origin,'')).join(' | ')});phaseVal=v;}});integrity.phaseLog=phaseLog;
  integrity.envStart=env();integrity.dialogsAtStart=[...document.querySelectorAll('dialog[open]')].map(d=>d.id||d.className||'dialog');
  const tStart=realNow();let engineError=null;
  try{
  while(!m.finished&&ticks++<40000){
   R.tick=ticks;tickCounter=ticks;traceTick=ticks;if(integrity.randomSwappedAt===null&&Math.random!==ours)integrity.randomSwappedAt=ticks;if(integrity.matchSwappedAt===null&&match!==m)integrity.matchSwappedAt=ticks;if(document.hidden)integrity.hiddenTicks++;const ctx=v65Context();if(state.phase==='paused'){v65Resume();clearInterval(v65WorldFrame);}
   if(integrity.contextMismatchAt===null&&(v65WorldActive?.state!==state||ctx?.state!==state))integrity.contextMismatchAt=ticks;if(v65WorldActive?.state?.phase!=='live'&&!m.finished){integrity.notLiveStepTicks++;if(integrity.firstNotLiveStep===null)integrity.firstNotLiveStep={tick:ticks,phase:v65WorldActive?.state?.phase??null,statePhase:state.phase,elapsed:m.elapsed,halftimePause:m.halftimePause||0,pauseRequested:!!v65PauseRequested};}
   const cat=instrument?category():'x',e0=m.elapsed;
   const frozenProbe=m.elapsed+'|'+(m.setPiece?.wait??'-')+'|'+(m.goalPause||0)+'|'+(m.countdown||0)+'|'+(m.postBanner?.wait??'-')+'|'+(m.halftimePause||0);
   // Clock units per real step from the match rate (MATCH_SPEED without SI).
   step(dt*(typeof v183Rate==='function'?v183Rate(m):MATCH_SPEED),dt);
   if(frozenProbe===m.elapsed+'|'+(m.setPiece?.wait??'-')+'|'+(m.goalPause||0)+'|'+(m.countdown||0)+'|'+(m.postBanner?.wait??'-')+'|'+(m.halftimePause||0))integrity.frozenTicks++;
   if(state.phase==='live'&&!m.finished)v65AfterStep(ctx);
   if(v65PauseRequested&&!m.flight&&!m.slide&&state.phase==='live'){v65PauseRequested=false;v65Pause();clearInterval(v65WorldFrame);}
   if(!instrument)continue;
   if(m.setPiece){if(m.setPiece!==R.spObj){R.spObj=m.setPiece;R.spTick=ticks;}const waited=(ticks-R.spTick)*dt;R.watchApproach=waited>60;if(waited>120){const W=window.__p01.W(),Lm=window.__p01.L();R.stall={env:env(),type:m.setPiece.type,phase:m.setPiece.phase,wait:m.setPiece.wait,spot:m.setPiece.spot,wall:m.setPiece.wall||null,elapsed:m.elapsed,people:m.people.map(p=>{const t=R.approach.get(p.pid);return{pid:p.pid,t:p.t,keeper:!!p.keeper,line:p.assignedLine||p.line,bx:p.bx,x:+p.x.toFixed(4),y:+p.y.toFixed(4),target:t?{x:+t.x.toFixed(4),y:+t.y.toFixed(4)}:null,metres:t?+Math.hypot((t.x-p.x)*W,(t.y-p.y)*Lm).toFixed(2):null,taker:m.setPiece.taker===p};})};break;}}else R.spObj=null;
   R.time[cat]=(R.time[cat]||0)+dt;R.clock[cat]=(R.clock[cat]||0)+Math.max(0,m.elapsed-e0);
   // restarts (state polling)
   if(m.setPiece&&m.setPiece!==lastSP)R.restart(m.setPiece.type,m.setPiece.team);lastSP=m.setPiece||null;
   if(m.throwIn&&m.throwIn!==lastThrow)R.restart('throwIn',m.throwIn.team);lastThrow=m.throwIn||null;
   if(m.kickoff&&m.kickoff!==lastKick)R.restart('kickoff',m.kickoff.kicker?.t??null);lastKick=m.kickoff||null;
   if(m.goalPause>0&&lastGoalPause<=0)R.restart('goal',null);lastGoalPause=m.goalPause;
   // loose balls created by shots (rebound marker)
   const led=m.ballAccounting?.events;if(led&&led.length>lastLedger){for(let i=lastLedger;i<led.length;i++){const e=led[i];if(e.kind==='loose-ball'){const parent=led.find(x=>x.id===e.parentId);if(parent?.shot)R.lastLooseShot={team:parent.team,tick:ticks};}}lastLedger=led.length;}
   const now=snap();
   // zone presence of a controlling field player
   const o=m.owner;
   for(const t of [0,1])if(window.__p01.toGoal(m.ball,t)<=22)R.ballZone22[t]+=dt;
   if(o&&!o.keeper){const d=window.__p01.toGoal(o,o.t);if(d<=22)R.zone[o.t][0]+=dt;if(d<=30)R.zone30[o.t][0]+=dt;}
   // owner releases: remember kind of release for loss classification
   if(lastOwner&&o!==lastOwner){R.ownerHold.push(+((ticks-ownerSince)*dt).toFixed(2));if(!o){const meta=m.flight&&v102Flights.get(m.flight);lostKind=meta?.kind||'frei';}else lostKind=null;}
   if(o!==lastOwner)ownerSince=ticks;
   // phase logic
   if(o){
    const t=o.t;
    if(!R.phase||R.phase.team!==t){
     let reason=null;if(R.phase){const opp=t;const d=k=>now[opp][k]-prev[opp][k];reason=d('tacklesWon')>0||d('slideWon')>0?'zweikampf-verloren':d('interceptions')>0?'abgefangen':lostKind&&lostKind!=='frei'?'fehlpass-'+lostKind:'ballverlust-frei';R.endPhase(reason);}
     const pend=R.pendingRestart&&ticks-R.pendingRestart.tick<Math.round(12/dt)?R.pendingRestart:null;
     const d=k=>now[t][k]-prev[t][k];
     const start=pend&&(pend.team===t||pend.type==='goal'||pend.type==='kickoff')?pend.type:o.keeper?(d('saves')>0?'parade':'torwart'):d('tacklesWon')>0||d('slideWon')>0?'zweikampf':d('interceptions')>0?'abfangen':R.lastLooseShot&&ticks-R.lastLooseShot.tick<Math.round(4/dt)?'abpraller':(reason?'ballgewinn-frei':'freier-ball');
     R.pendingRestart=null;
     R.phase={team:t,startReason:start,startTick:ticks,startElapsed:+m.elapsed.toFixed(3),startDist:+window.__p01.toGoal(m.ball,t).toFixed(1),minDist:99,passes0:R.teamStat(t,'passes'),passOk0:R.teamStat(t,'passComplete'),final3:false,zone22:false};
    }
   }
   if(R.phase){const d=window.__p01.toGoal(m.ball,R.phase.team);if(d<R.phase.minDist)R.phase.minDist=+d.toFixed(1);if(d<=v160PitchLength()/3)R.phase.final3=true;if(o&&o.t===R.phase.team&&!o.keeper&&d<=22)R.phase.zone22=true;}
   prev=now;lastOwner=o;
  }
  }catch(error){
   // Diagnose an engine exception without hiding it: clock, half-time state and P02 ledger.
   const load=state.playerLoad,ranges=pid=>load?.players?.[pid]?.ledger?.fixtures?.find(x=>x.id===fixture.id)?.minuteRanges||[];
   engineError={env:env(),message:String(error.message),stack:String(error.stack).split(String.fromCharCode(10)).slice(0,8),ticks,elapsed:m.elapsed,minuteFromElapsed:m.elapsed*90/75,stateMinute:state.minute,addedMinutes:state.addedMinutes??null,firstHalfEnd:m.firstHalfEnd??null,fullTimeEnd:m.fullTimeEnd??null,halftime:!!m.halftime,halftimeBreakDone:!!m.halftimeBreakDone,halftimePending:!!m.halftimePending,halftimePause:m.halftimePause||0,halftimeExtension:m.halftimeExtension||0,fulltimePending:!!m.fulltimePending,whistleAttack:m.whistleAttackLimit??null,setPiece:m.setPiece?{type:m.setPiece.type,phase:m.setPiece.phase}:null,flight:!!m.flight,slide:!!m.slide,goalPause:m.goalPause||0,
    pending:load?Object.entries(load.pending||{}).filter(([,p])=>p.events.length||p.intervals.length).map(([pid,p])=>({pid,intervals:p.intervals.map(i=>[+i.startMinute.toFixed(4),+i.endMinute.toFixed(4)]),events:p.events.map(e=>({type:e.type,minute:+e.minute.toFixed(4),id:e.id})),playedRanges:ranges(pid).map(r=>[+r.startMinute.toFixed(4),+r.endMinute.toFixed(4)])})):null};
  }
  integrity.envEnd=env();integrity.dialogsAtEnd=[...document.querySelectorAll('dialog[open]')].map(d=>d.id||d.className||'dialog');
  if(instrument){R.endPhase(m.finished?'abpfiff':engineError?'fehler':'abbruch');}
  const computeMs=realNow()-tStart;
  const people=[...m.people,...(m.exitedPeople||[])],stat=(t,k)=>people.filter(p=>t===null||p.t===t).reduce((n,p)=>n+(p.stats[k]||0),0);
  const statKeys=['shots','onTarget','goals','passes','passComplete','duels','duelsWon','tackleAttempts','tacklesWon','slideAttempts','slideWon','fouls','interceptions','saves','faced','headers','volleys','shotGoals','nonShotGoals','savesCaught','savesParried','shotsInterrupted','crosses','crossComplete','highPasses','highComplete','headerPasses','aerialDuels','progressive','passLost'];
  const teams=[0,1].map(t=>({...teamInfo[t],score:m.score[t],possession:+m.possession[t].toFixed(2),stats:Object.fromEntries(statKeys.map(k=>[k,stat(t,k)]))}));
  const ledger=m.ballAccounting?.events||[];
  for(const s of R.shots){const e=ledger.find(x=>x.id===s.eventId);if(e){s.result=e.result;s.plannedOnTarget=!!e.plannedOnTarget;s.actualOnTarget=!!e.actualOnTarget;s.goal=e.result==='goal'||!!e.goal;}else if(s.penalty){s.result='penalty';}}
  const flights=!instrument?[]:ledger.filter(e=>e.start&&e.target&&!e.shot).map(e=>{const t=e.team,dir=t===0?-1:1,gain=(e.target.y-e.start.y)*dir*window.__p01.L(),len=Math.hypot((e.target.x-e.start.x)*window.__p01.W(),(e.target.y-e.start.y)*window.__p01.L());return{kind:e.kind,team:t,gain:+gain.toFixed(1),len:+len.toFixed(1),result:e.result};});
  const goals=ledger.filter(e=>e.kind==='goal').map(e=>({team:e.team,result:e.result,source:e.source,at:e.at}));
  const byId=new Map(ledger.map(e=>[e.id,e])),fromShot=e=>{let x=byId.get(e.parentId);for(let i=0;i<3&&x;i++){if(x.shot)return true;x=byId.get(x.parentId);}return false;},rebounds=ledger.filter(e=>e.kind==='loose-ball'&&fromShot(e)).length,shotResults={};for(const e of ledger.filter(e=>e.shot)){shotResults[e.result||'?']=(shotResults[e.result||'?']||0)+1;}
  const extras={rebounds,shotResults,corners:m.setPieceStats.corners[0]+m.setPieceStats.corners[1],freeKicks:m.setPieceStats.freeKicks[0]+m.setPieceStats.freeKicks[1],penalties:m.setPieceStats.penalties[0]+m.setPieceStats.penalties[1],flights:Object.fromEntries(['pass','highPass','cross','header','shot','block','goalKick','throw'].map(k=>[k,ledger.filter(e=>e.kind===k&&e.intent!=='space').length])),spacePasses:ledger.filter(e=>e.intent==='space').length,spaceReceived:ledger.filter(e=>e.intent==='space'&&e.result==='received').length,crossComplete:ledger.filter(e=>e.kind==='cross'&&(e.result==='received'||e.result==='goal')).length,crossProbe:window.__crossProbe?{...window.__crossProbe}:null};if(window.__crossProbe)window.__crossProbe=null;
  {const v=state.phase;delete state.phase;state.phase=v;}
  return{integrity,engineError,extras,clubId,size,seed,fixtureId:fixture.id,competition:fixture.competitionId,ownSide,markers,finished:!!m.finished,ticks,realSeconds:+(ticks*dt).toFixed(2),elapsed:+m.elapsed.toFixed(3),firstHalfEnd:m.firstHalfEnd??null,halftimeExtension:m.halftimeExtension??0,score:[...m.score],setPieces:m.setPieceStats,teams,draws,setupMs:Math.round(setupMs),computeMs:Math.round(computeMs),
   stall:instrument?R.stall:null,rec:instrument?{time:Object.fromEntries(Object.entries(R.time).map(([k,v])=>[k,+v.toFixed(2)])),clock:Object.fromEntries(Object.entries(R.clock).map(([k,v])=>[k,+v.toFixed(3)])),zone22:R.zone.map(z=>+z[0].toFixed(2)),zone30:R.zone30.map(z=>+z[0].toFixed(2)),ballZone22:R.ballZone22.map(z=>+z.toFixed(2)),shots:R.shots,phases:R.phases,decisions:R.decisions,restarts:R.restarts.map(r=>r.type+':'+r.team),ownerHoldMean:R.ownerHold.length?+(R.ownerHold.reduce((a,b)=>a+b,0)/R.ownerHold.length).toFixed(3):null,ownerHoldN:R.ownerHold.length,flights,goals}:null,
   digest:JSON.stringify({score:m.score,ticks,draws,shots:teams.map(t=>t.stats.shots),passes:teams.map(t=>t.stats.passes),elapsed:m.elapsed}),
   // Wider state digest for paired identity checks (marker field match.si excluded).
   stateDigest:JSON.stringify({score:m.score,ticks,draws,elapsed:m.elapsed,possession:m.possession,setPieces:m.setPieceStats,teams:teams.map(t=>t.stats),ledger:(m.ballAccounting?.events||[]).map(e=>[e.kind,e.result,e.team,e.at]),goals:m.goals.map(g=>[g.team,g.pid??null,g.minute,g.source??null])})};
 }finally{performance.now=originalNow;Math.random=random;Date.now=dateNow;if(window.__p01)window.__p01.rec=null;running=false;clearInterval(v65WorldFrame);}
};
async function openPage(browser){
 const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 if(models==='block')await page.route('**/players/football-v130.glb',r=>r.fulfill({status:404,body:''}));
 await page.goto(`http://127.0.0.1:${port}/d/index.html?engine=2d`,{timeout:180000});
 await page.waitForFunction(()=>typeof D6Expansion?.createCareer==='function'&&typeof v65CreateMatch==='function'&&typeof v157Decide==='function',null,{timeout:180000});
 await page.evaluate(`window.__p01Install=${installObservers.toString()};`);if(traceLimit)await page.evaluate(n=>v183SetTraceLimit(n),+traceLimit);if(settle>0)await page.waitForTimeout(settle);
 return{context,page,errors};
}

(async()=>{
 await new Promise(r=>server.listen(port,'127.0.0.1',r));queue('start');
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--disable-gpu']});
 const report={harness:'si183-1',label,dist:distLabel,baseTree,si:siOverride,traceLimit:traceLimit?+traceLimit:null,wallclock:clockMode,models,settle,sequence,boost:boostArg||null,instrument,dt,distHashes:frozen,date:new Date().toISOString(),scope:'Real expansion12 careers (D6Expansion.createCareer), production player model, first own competitive fixture via v64AdvanceToOwnMatch; native browser engine, fixed dt steps, auto-resume at half-time (no tactic pauses); SI configuration via the v65CreateMatch constructor parameter, no file copies.',matches:[],failures:[]};
 try{
  const catalog=await (async()=>{const {context,page}=await openPage(browser);const list=await page.evaluate(()=>D6Expansion.catalog().filter(c=>c.playable!==false&&!c.id.includes('-C')).map(c=>c.id));await context.close();return list;})();
  // Spread selection across countries: interleave club index within each country.
  const byCountry={};for(const id of catalog)(byCountry[id.slice(0,3)]??=[]).push(id);
  const order=[];for(let i=0;i<8;i++)for(const c of Object.keys(byCountry))if(byCountry[c][i])order.push(byCountry[c][i]);
  const clubs=order.slice(clubOffset,clubOffset+clubCount);
  const boost=boostArg?{side:'own',key:boostArg.split(':')[0],delta:+boostArg.split(':')[1]}:null;
  const jobs=[];if(sequence.length)for(const item of sequence){const [clubId,size]=item.split('|');jobs.push({clubId,size,seed:`${seedPrefix}-${clubId}`});}else for(const size of sizes)for(const clubId of clubs)if(!only.length||only.includes(clubId+'|'+size))jobs.push({clubId,size,seed:`${seedPrefix}-${clubId}`});
  console.log(JSON.stringify({label,si:siOverride,dist:report.dist,jobs:jobs.length,workers}));
  let next=0,done=0;
  const worker=async(w)=>{let ctx=await openPage(browser),used=0;
   while(next<jobs.length){const job=jobs[next++];
    if(used>=recycle){await ctx.context.close();ctx=await openPage(browser);used=0;}
    try{const row=await ctx.page.evaluate(runMatch,{...job,dt,instrument,boost,clockMode,si:siOverride});row.errors=ctx.errors.splice(0);row.digestSha=sha(row.digest);row.stateDigestSha=sha(row.stateDigest);delete row.digest;delete row.stateDigest;report.matches.push(row);used++;
     done++;console.log(`${row.engineError?'ENGINEERROR ':''}${row.stall?'STALL ':''}${done}/${jobs.length} w${w} ${job.size} ${job.clubId} ${row.score.join(':')} ${(row.realSeconds/60).toFixed(2)}min shots=${row.teams[0].stats.shots+row.teams[1].stats.shots} sim=${row.computeMs}ms`);}
    catch(e){report.failures.push({...job,error:String(e.message||e).slice(0,500)});console.log('FAIL',job.clubId,job.size,String(e.message||e).slice(0,200));await ctx.context.close().catch(()=>{});ctx=await openPage(browser);used=0;}
   }
   await ctx.context.close();};
  await Promise.all(Array.from({length:workers},(_,i)=>worker(i)));
  report.matches.sort((a,b)=>a.size.localeCompare(b.size)||a.clubId.localeCompare(b.clubId));
  assert.deepEqual(hashDist(),frozen,'dist unchanged during the measurement');report.distUnchanged=true;
 }finally{await browser.close();await new Promise(r=>server.close(r));fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report)+'\n');queue('end');}
 const n=report.matches.length,mean=f=>(report.matches.reduce((s,r)=>s+f(r),0)/n).toFixed(2);
 console.log(JSON.stringify({out,n,failures:report.failures.length,minutes:mean(r=>r.realSeconds/60),shots:mean(r=>r.teams[0].stats.shots+r.teams[1].stats.shots),onTarget:mean(r=>r.teams[0].stats.onTarget+r.teams[1].stats.onTarget),goals:mean(r=>r.score[0]+r.score[1])}));
})().catch(e=>{console.error(e);process.exitCode=1;});
