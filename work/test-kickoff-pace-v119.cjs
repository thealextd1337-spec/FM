'use strict';
// Repository's documented isolated Edge/native-controller QA workflow. No user
// profiles, tabs, Android device, Unity editor or shared build are operated.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process'),vm=require('node:vm');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'outputs/3d-quality/kickoff-pace-v119/native.json'),files=['set-pieces-v50.js','pitch-v57.js','world-offensive-quality-v157.js','world-football-flow-v159.js'],baselineCommit='1b2c3c8e18e6a0e8ea39e8de40251ee54a6eb114';
const hash=s=>crypto.createHash('sha256').update(s).digest('hex'),before=Object.fromEntries(files.map(f=>[f,cp.execFileSync('git',['show',baselineCommit+':dist/'+f],{cwd:root,encoding:'utf8'})]));
const report={baselineCommit,scope:'Actual native restart/formation/controller tests. Intentional fresh match outcomes; no old digest parity or hardware performance claim.',sourceHashes:Object.fromEntries(files.map(f=>[f,hash(fs.readFileSync(path.join(root,'dist',f)))])),baselineHashes:Object.fromEntries(files.map(f=>[f,hash(before[f])])),errors:[],components:[],kickoffs:[],defence:[],walls:[],wallGuards:[],matches:[]};
const dependencies=['world-physical-v65.js','world-pitch-actions-v99.js','match-ball-events-v117.js','penalties-v42.js','world-competition-v62.js'];report.dependencyHashes=Object.fromEntries(dependencies.map(f=>[f,hash(fs.readFileSync(path.join(root,'dist',f)))]));report.runnerSha256=hash(fs.readFileSync(__filename));
const competitionNative=()=>{const source=fs.readFileSync(path.join(root,'dist/world-competition-v62.js'),'utf8');return source.slice(source.indexOf('function v62Score('),source.indexOf('function v62CupProgress('));};report.competitionNativeHash=hash(competitionNative());
function testWallSwap(){
 const source=fs.readFileSync(path.join(root,'dist/world-physical-v65.js'),'utf8'),start=source.indexOf('function v65PhysicalSwap('),end=source.indexOf('\nfunction v65SwapInfoHTML',start);assert(start>=0&&end>start);
 const checks=[];for(const wall of [true,false]){
  const out={pid:'old-wall',t:1,name:'Outgoing',x:.4,y:.3,tx:.5,ty:.4},incoming={pid:'new-wall',t:1,name:'Incoming'},point={x:.6,y:.4},piece={type:'freeKick',taker:out,...wall?{wall:{version:119,players:[{pid:out.pid,...point},{pid:'other-wall',x:.62,y:.4}]}}:{}},match={people:[out],exitedPeople:[],setPiece:piece,elapsed:24,owner:null,lastPass:null},moves=new WeakMap(),targets=new Map([[out,point]]);moves.set(piece,targets);
  const context=vm.createContext({match,v114RestartMoves:moves,v65PhysicalPlayer:()=>incoming,v158Commit:()=>{throw Error('Unexpected second fatigue commit')},note:()=>{},$:()=>null,updateTeamStats:()=>{},v51LastLiveStep:0});vm.runInContext(source.slice(start,end),context);context.v65PhysicalSwap({ownSide:0,state:{}},{side:1,outPid:out.pid,inPid:incoming.pid});
  assert.equal(match.people[0],incoming);assert.equal(targets.get(incoming),point);assert.equal(targets.has(out),false);if(wall){assert.equal(piece.wall.players[0].pid,incoming.pid);assert.equal(piece.wall.players[0].x,point.x);assert.equal(piece.wall.players[0].y,point.y);assert.equal(piece.wall.players[1].pid,'other-wall');}else assert.equal(piece.wall,undefined);checks.push({wall,targetInherited:true,otherMemberPreserved:true});
 }return checks;
}
async function main(){
 const server=require('./ui-redesign/serve.cjs').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--disable-gpu']});
 async function page(baseline){
  const context=await browser.newContext(),p=await context.newPage();p.on('pageerror',e=>report.errors.push(e.message));
  if(baseline)for(const f of files)await p.route('**/'+f+'*',r=>r.fulfill({body:before[f],contentType:'text/javascript'}));
  await p.goto(`http://127.0.0.1:${server.address().port}/source/index.html?engine=browser&players=wave3`);await p.waitForFunction(()=>window.userMeshyMatchReady&&typeof v162Active==='function',null,{timeout:60000});
  return{p,close:()=>context.close()};
 }
 try{
  report.wallSwap=testWallSwap();
  for(const baseline of [true,false]){
   const {p,close}=await page(baseline);
   const result=await p.evaluate(baseline=>{
    const result={components:[],kickoffs:[],defence:[],walls:[],wallGuards:[]};let draws=0;Math.random=()=>{draws++;return .5};updateTeamStats=()=>{};draw=()=>{};v50Name=t=>'Team '+t;note=()=>{};v65WorldActive={state:{},career:{world:{}},fixture:{id:'controlled'}};
    const person=(pid,t,cell,line='mid')=>({...team({pid,n:cell+1,name:pid,cell,assignedLine:line,line,role:line==='def'?-1:line==='att'?1:0,positionRoutine:1,tacticalRole:line==='def'?'ball-playing-defender':line==='att'?'striker':'playmaker',instructions:[],spd:16,tec:16,pos:16,pas:16,fin:16,air:16,str:14,sta:16,gk:16,heightCm:178,fresh:100},t)});
    function make(geometry,revision){return {people:[],geometry,owner:null,ball:{x:.5,y:.5},elapsed:0,score:[0,0],shots:[0,0],possession:[0,0],goals:[],attackFlow:{version:152,qualityVersion:157,flowVersion:159,paceVersion:162,...revision?{paceRevision:119}:{},intents:{}},teamDirect:[0,0],defenseLines:[0,0]};}
    for(const size of ['standard','large'])for(const count of [5,6]){
     const geometry={version:1,fieldSize:size,fieldPlayers:count,width:44*(size==='large'?1.2:1),length:68*(size==='large'?1.2:1)};
     const presets=[...(count===5?v64Formations:v160SixFormations),'custom-column'];
     // Both sides use every actual preset, including asymmetric pairings.
     for(const formation of presets)for(const opponent of presets)for(const t of [0,1])for(const phase of ['initial','half','afterGoal']){
      const m=make(geometry,true);match=m;
      for(const side of [0,1]){const selected=side===0?formation:opponent;if(selected==='custom-column')for(const cell of [2,7,12,17,22,27].slice(0,count))m.people.push(person(`${side}-custom-${cell}`,side,cell,v64GridRole(cell)));else{const parts=selected.split('–').map(Number);for(const [i,line]of ['def','mid','att'].entries())for(const cell of v64GridCells[line][parts[i]])m.people.push(person(`${side}-${line}-${cell}`,side,cell,line));}const k=person('k'+side,side,27,'gk');k.keeper=true;k.bx=k.x=.5;k.by=k.y=side===0?.94:.06;m.people.push(k);}
      const anchors=JSON.stringify(m.people.map(q=>[q.pid,q.bx,q.by])),rng=draws;
      if(phase==='half'){m.elapsed=37.5;m.halftimePause=1;}
      if(phase==='afterGoal'){m.elapsed=20;m.pendingKickoff=t;for(const q of m.people){q.x=.2+.025*q.n;q.y=q.t===0?.7:.3;}}
      const old=m.people.map(q=>({x:q.x,y:q.y}));kickoff(t);const targets=v114RestartMoves.get(m.kickoff),points=m.people.map(q=>targets?.get(q)||q),s=v150Scale();let minimum=Infinity;
      for(let i=0;i<m.people.length;i++)for(let j=i+1;j<m.people.length;j++)minimum=Math.min(minimum,Math.hypot((points[i].x-points[j].x)*s.x,(points[i].y-points[j].y)*s.y));
      const row={baseline,size,count,formation,opponent,t,phase,minimum,draws:draws-rng,anchorsUnchanged:JSON.stringify(m.people.map(q=>[q.pid,q.bx,q.by]))===anchors,ownHalf:points.every((q,i)=>m.people[i].t===0?q.y>=.5:q.y<=.5),travelPreserved:phase!=='afterGoal'||m.people.every((q,i)=>q.x===old[i].x&&q.y===old[i].y)};
      if(phase==='afterGoal')for(let i=0;i<1000&&!v115KickoffReady(m);i++)v114PositionRestart(m,.05);
      row.ready=v115KickoffReady(m);result.kickoffs.push(row);
     }
    }
    for(const revision of [false,true])for(const t of [0,1])for(const diagonal of [false,true])for(const kind of ['depth','support','passive']){
     const m=make({version:1,fieldSize:'standard',fieldPlayers:5,width:44,length:68},revision);match=m;const p=person('runner',t,17),owner=person('carrier',t,27);m.people=[p,owner];m.owner=owner;m.ball={x:owner.x,y:owner.y};const s=v150Scale(),dir=t===0?-1:1;p.x=.35;p.y=t===0?.75:.25;p.tx=p.x+(diagonal?10:0)/s.x;p.ty=p.y+dir*15/s.y;
     if(kind!=='passive')m.attackFlow.intents[p.pid]={x:p.tx,y:p.ty,team:t,type:kind,until:5};const heading=Math.atan2((p.tx-p.x)*s.x,(p.ty-p.y)*s.y);v157Body(p).heading=heading;const start={x:p.x,y:p.y},rng=draws;
     for(let i=0;i<10;i++){v157Move(m,p,.05);m.elapsed+=.05*MATCH_SPEED;}
     const row={baseline,revision,t,diagonal,kind,firstHalfSecondMetres:v122Metres(p,start),speed:Math.hypot(p.offenseMotion.vx,p.offenseMotion.vy),draws:draws-rng};
     const first=JSON.stringify({x:p.x,y:p.y,body:p.offenseMotion});for(let i=0;i<20;i++){m.kickoff={phase:'waiting'};v157Move(m,p,.05);}row.pausedPositionUnchanged=p.x===JSON.parse(first).x&&p.y===JSON.parse(first).y;result.components.push(row);
    }
    for(const size of ['standard','large'])for(const t of [0,1]){
     const m=make({version:1,fieldSize:size,fieldPlayers:5,width:44*(size==='large'?1.2:1),length:68*(size==='large'?1.2:1)},true);match=m;const s=v150Scale(),dir=t===0?-1:1,p=person('carrier',t,17,'att');p.x=.55;p.y=.45;p.motionX=0;p.motionY=dir;m.owner=p;m.ball={x:p.x,y:p.y+dir*.52/s.y};
     const defenders=[person('recovering',1-t,27,'def'),person('ready-a',1-t,27,'def'),person('ready-b',1-t,27,'def')];for(const [i,q]of defenders.entries()){q.x=p.x+[.2,.7,-2][i]/s.x;q.y=p.y-dir*[.2,1.5,2][i]/s.y;q.tx=q.x;q.ty=q.y;q.bx=.2;q.by=t===0?.05:.95;v157Body(q).heading=Math.atan2((m.ball.x-q.x)*s.x,(m.ball.y-q.y)*s.y);}defenders[0].recoverUntil=100;m.people=[p,...defenders];m.attackFlow.defenseReads={};for(const q of defenders.slice(1))m.attackFlow.defenseReads[q.pid]={team:t,nextAt:10,target:{x:q.x,y:q.y},purpose:'receiver'};
     const rng=draws;const targets=defenders.slice(1).map(q=>{v159DefensiveTarget(m,q);return{pid:q.pid,purpose:m.attackFlow.defenseReads[q.pid]?.purpose,gap:v122Metres({x:q.tx,y:q.ty},m.ball)}});const planningDraws=draws-rng;
     for(let i=0;i<20;i++){for(const q of defenders.slice(1)){v159DefensiveTarget(m,q);v157Move(m,q,.025);}m.elapsed+=.025*MATCH_SPEED;}
     // Exercise actual standing contact with failed existing foul/success draws;
     // an attempt is required, possession is deliberately not guaranteed.
     Math.random=()=>{draws++;return .99};v56MaybeChallenge(p);Math.random=()=>{draws++;return .5};
     result.defence.push({baseline,size,t,targets,planningDraws,attempts:defenders.reduce((n,q)=>n+(q.stats.tackleAttempts||0),0),recoveryAttempts:defenders[0].stats.tackleAttempts||0,ownerUnchanged:m.owner===p,readyBallGap:Math.min(...defenders.slice(1).map(q=>v122Metres(q,m.ball)))});
    }
    for(const size of ['standard','large'])for(const t of [0,1])for(const half of [1,2]){
     const m=make({version:1,fieldSize:size,fieldPlayers:5,width:44*(size==='large'?1.2:1),length:68*(size==='large'?1.2:1)},true);match=m;m.elapsed=half===1?10:50;const s=v150Scale(),spot={x:.5,y:(t===0?v55Field.top:v55Field.bottom)+(t===0?1:-1)*22/s.y};
     for(const side of [0,1]){for(const [i,cell]of [26,28,16,18,7].entries())m.people.push(person(`${side}-wall-${i}`,side,cell,i<2?'def':i<4?'mid':'att'));const k=person('wall-gk'+side,side,27,'gk');k.keeper=true;k.bx=k.x=.5;k.by=k.y=side===0?.94:.06;m.people.push(k);}
     const rng=draws;v50Restart('freeKick',t,spot,'Controlled free kick');const piece=m.setPiece,creationDraws=draws-rng,wall=piece.wall;let taken=0,takenGap=null,roundTripUnchanged=true;const original=v50TakeFreeKick;v50TakeFreeKick=p=>{taken++;if(p.wall)takenGap=Math.max(...p.wall.players.map(point=>v122Metres(m.people.find(q=>q.pid===point.pid),point)));};
     const initialGap=wall?Math.max(...wall.players.map(point=>v122Metres(m.people.find(q=>q.pid===point.pid),point))):null;
     step(.05*MATCH_SPEED,.05);const noEarlyTake=taken===0;
     if(wall){const encoded=JSON.stringify(wall),{taker,...plain}=m.setPiece;m.setPiece={...JSON.parse(JSON.stringify(plain)),taker};roundTripUnchanged=JSON.stringify(m.setPiece.wall)===encoded;}
     let ticks=1;while(m.setPiece&&ticks++<1200)step(.05*MATCH_SPEED,.05);v50TakeFreeKick=original;
     result.walls.push({baseline,size,t,half,wall:wall||null,creationDraws,initialGap,noEarlyTake,taken,takenGap,roundTripUnchanged,ticks,minimumWallDistance:wall?Math.min(...wall.players.map(point=>v122Metres(point,spot))):null,wallSeparation:wall?v122Metres(wall.players[0],wall.players[1]):null});
    }
    if(!baseline){
     const m=make({version:1,fieldSize:'standard',fieldPlayers:5,width:44,length:68},true);match=m;m.people=[person('taker',0,17),person('wall-a',1,26,'def'),person('wall-b',1,28,'def')];
     for(const [label,type,spot]of [['offside','offside',{x:.5,y:.30}],['wide-pass','freeKick',{x:.9,y:.3}],['distant-pass','freeKick',{x:.5,y:.6}]]){const rng=draws,wall=v119FreeKickWall(m,{type,team:0,spot,taker:m.people[0]});result.wallGuards.push({label,noWall:wall===null,draws:draws-rng});}
     delete m.attackFlow.paceRevision;v50Restart('freeKick',0,{x:.5,y:.3},'Legacy restart');result.wallGuards.push({label:'legacy-creation',noWall:!m.setPiece.wall,draws:0});
     m.attackFlow.paceRevision=119;v57PositionFreeKick(.05);result.wallGuards.push({label:'existing-piece-not-retrofitted',noWall:!m.setPiece.wall,draws:0});
    }
    return result;
   },baseline);report.components.push(...result.components);report.kickoffs.push(...result.kickoffs);report.defence.push(...result.defence);report.walls.push(...result.walls);report.wallGuards.push(...result.wallGuards);await close();
  }
  for(const config of [{seed:'pace119-a',size:'standard',count:5},{seed:'pace119-b',size:'standard',count:6},{seed:'pace119-c',size:'large',count:5},{seed:'pace119-d',size:'large',count:6}].filter(c=>!process.env.D6_QA_CASE||process.env.D6_QA_CASE===c.seed))for(const mode of ['before','after','after-json']){
   const {p,close}=await page(mode==='before');
   const row=await p.evaluate(async({config,mode,trace})=>{
    let rng=169032,draws=0,traceActive=false,traceTick=0;const traceRows=[],traceDraws=[];Math.random=()=>{draws++;rng=(Math.imul(rng,1664525)+1013904223)>>>0;if(traceActive&&traceDraws.length<100)traceDraws.push({tick:traceTick,draws,rng,stack:new Error().stack.split('\n').slice(2,7)});return rng/4294967296};Date.now=()=>1791540000000;
    const c=v61CreateCareer('GER-2',config.seed,'Pace QA',undefined,{fieldSize:config.size,fieldPlayers:config.count}),club=v66Own(c);v66ChooseSponsor(c,club.id,club.sponsors[0].id);v124SetYouthBudget(c,0);while(c.world.market.phase==='open')await v66NextMarketDay(c);
    const f=v62Fixtures(c).filter(f=>!f.result&&[f.homeId,f.awayId].includes(club.id)).sort((a,b)=>a.day-b.day)[0],state=v64MakeState(c,f);c.world.activeMatch={fixtureId:f.id,state};v61CurrentCareer=c;state.phase='paused';match=null;v65WorldActive=null;v98View='2d';v65Show(v65Context());clearInterval(v65WorldFrame);v103CanReplay=()=>false;draw=()=>{};
    if(mode==='before')delete match.attackFlow.paceRevision;else if(match.attackFlow.paceRevision!==119)throw Error('Root fresh creation seam missing paceRevision119');
    let ticks=0,half=false,checkpoint=false;const metrics={activeSeconds:0,offBallMetres:0,burstMetres:0,supportMetres:0,diagonalMetres:0,actions:0,passTypes:{},spaceOpportunities:0,spacePasses:0,spaceComplete:0,passes:0,completed:0,shots:0,ownerDwells:[]},baseAction=action,baseFly=fly;action=function(...args){metrics.actions++;const p=match.owner;if(p&&!p.keeper&&!v121PositioningPaused(match)&&v150Candidates(p,match.people.filter(q=>q.t===p.t&&q!==p),match.people.filter(q=>q.t!==p.t)).length)metrics.spaceOpportunities++;return baseAction.apply(this,args)};
    fly=function(target,duration,done){const a=v102Release;if(a?.person){metrics.passTypes[a.kind]=(metrics.passTypes[a.kind]||0)+1;}return baseFly.call(this,target,duration,done)};
    let ownerId=null,ownerAt=0,checkpointFacts=null,keeperCheckpoint=null;
    // Physical players are shallow copies before JSON and detached copies after
    // JSON. Career metadata is compared from the authoritative roster below.
    const runtime=m=>{const {people,exitedPeople,owner,lastPass,breakawayCarrier,nativeContactClock,...rest}=m;const player=p=>{const {playerModel,history,honours,...physical}=p;return physical};return{...rest,people:people.map(player),exitedPeople:(exitedPeople||[]).map(player),ownerPid:owner?.pid||null,lastPass:lastPass?{passerPid:lastPass.passer?.pid,receiverPid:lastPass.receiver?.pid,at:lastPass.at}:null,breakawayCarrierPid:breakawayCarrier?.pid||null}};
    const traceState=()=>({tick:ticks,rng,draws,owner:match.owner?.pid||null,clock:v102Clock(match),next:match.next,people:match.people.map(p=>({pid:p.pid,x:p.x,y:p.y,tx:p.tx,ty:p.ty,motion:structuredClone(p.offenseMotion),mode:v108MovementMode(match,p)&&{mode:v108MovementMode(match,p).mode,facing:v108MovementMode(match,p).facing&&{x:v108MovementMode(match,p).facing.x,y:v108MovementMode(match,p).facing.y}}})),continuation:v160SnapshotContinuation(match)});
    while(!match.finished&&ticks++<18000){
     traceTick=ticks;
     const context=v65Context();if(context.state.phase==='paused'){half||=match.halftimePause>0;v65Resume();clearInterval(v65WorldFrame)}
     if(!checkpoint&&state.minute>=20&&!match.flight&&!match.slide&&!v121PositioningPaused(match)){
      if(trace){traceActive=true;traceRows.push({when:'checkpoint-before',...traceState()});}
      checkpointFacts={tick:ticks,minute:state.minute,ownerPid:match.owner?.pid||null,keeper:!!match.owner?.keeper,keeperWaiting:!!(match.owner&&v101KeeperWaiting(match,match.owner)),rebound:!!match.rebound,spaceIntent:!!match.spacePassIntent};
      if(mode==='after-json'){const before=runtime(match);if(v65Snapshot(context)===false)throw Error('Native safe snapshot missing');state.physicalSnapshot=JSON.parse(JSON.stringify(state.physicalSnapshot));match=null;if(!v65Restore(context))throw Error('Actual JSON restore failed');if(match.attackFlow.paceRevision!==119)throw Error('Revision lost after JSON');const after=runtime(match);checkpointFacts.immediateDifferences=[];const readable=v=>typeof v==='number'&&!Number.isFinite(v)?String(v):v;const compare=(a,b,path)=>{if(checkpointFacts.immediateDifferences.length>=15||Object.is(a,b))return;if(a&&b&&typeof a==='object'&&typeof b==='object'){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))compare(a[k],b[k],path+'.'+k)}else checkpointFacts.immediateDifferences.push({path,before:readable(a),after:readable(b)})};compare(before,after,'match');checkpointFacts.keeperWaitingRestored=!!(match.owner&&v101KeeperWaiting(match,match.owner));}
      checkpoint=true;
      if(trace)traceRows.push({when:'checkpoint-after',...traceState()});
     }
     if(!keeperCheckpoint&&state.minute>=20&&match.owner?.keeper&&v101KeeperWaiting(match,match.owner)&&!match.flight&&!match.slide&&!v121PositioningPaused(match)){
      keeperCheckpoint={tick:ticks,minute:state.minute,ownerPid:match.owner.pid,waitingBefore:true};
      if(mode==='after-json'){if(v65Snapshot(context)===false)throw Error('Keeper checkpoint missing');state.physicalSnapshot=JSON.parse(JSON.stringify(state.physicalSnapshot));match=null;if(!v65Restore(context))throw Error('Keeper JSON restore failed');keeperCheckpoint.waitingRestored=!!v101KeeperWaiting(match,match.owner);if(!keeperCheckpoint.waitingRestored)throw Error('Existing native keeper-wait lock missing after JSON');}
     }
     const positions=new Map(match.people.map(q=>[q.pid,{x:q.x,y:q.y}])),owner=match.owner?.pid;
     step(.05*MATCH_SPEED,.05);if(context.state.phase==='live'&&!match.finished)v65AfterStep(context);
     if(v65PauseRequested&&!match.flight&&!match.slide&&context.state.phase==='live'){v65PauseRequested=false;v65Pause();clearInterval(v65WorldFrame)}
     if(!v121PositioningPaused(match)){
      metrics.activeSeconds+=.05;const s=v150Scale();for(const q of match.people)if(!q.keeper&&q.pid!==owner){const old=positions.get(q.pid)||q,dx=(q.x-old.x)*s.x,dy=(q.y-old.y)*s.y,metres=Math.hypot(dx,dy);metrics.offBallMetres+=metres;const intent=match.attackFlow.intents[q.pid];if(intent&&['depth','follow'].includes(intent.type))metrics.burstMetres+=metres;if(intent?.type==='support')metrics.supportMetres+=metres;if(Math.min(Math.abs(dx),Math.abs(dy))>.25*Math.max(Math.abs(dx),Math.abs(dy)))metrics.diagonalMetres+=metres;}
     }
     const seconds=match.elapsed/MATCH_SPEED,current=match.owner&&!match.owner.keeper&&!v121PositioningPaused(match)?match.owner.pid:null;if(current!==ownerId){if(ownerId)metrics.ownerDwells.push(seconds-ownerAt);ownerId=current;ownerAt=seconds;}
     if(traceActive&&traceRows.length<180)traceRows.push({when:'step',...traceState()});
    }
    metrics.ownerDwellMean=metrics.ownerDwells.reduce((s,v)=>s+v,0)/Math.max(1,metrics.ownerDwells.length);delete metrics.ownerDwells;for(const q of match.people){metrics.passes+=q.stats.passes||0;metrics.completed+=q.stats.passComplete||0;metrics.shots+=q.stats.shots||0;}const spaceEvents=(match.ballAccounting?.events||[]).filter(e=>e.intent==='space');metrics.spacePasses=spaceEvents.length;metrics.spaceComplete=spaceEvents.filter(e=>e.result==='received').length;metrics.spaceResults=spaceEvents.map(e=>({result:e.result||'unresolved',receiverPid:e.receiverPid||null}));
    const load=state.playerLoad;if(load&&Object.values(load.players).some(p=>!Number.isFinite(p.freshness)||p.freshness<0||p.freshness>100))throw Error('Invalid authoritative P02 freshness');
    const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
    const digest=JSON.stringify(canonical({rng,draws,score:state.score,events:state.events,stats:state.stats,fresh:state.fresh,minutes:state.minutes,report:state.postMatchReport,match:runtime(match),continuation:v160SnapshotContinuation(match),clock:v102Clock(match),load:state.playerLoad,model:c.world.clubs.flatMap(club=>club.roster).map(p=>({pid:p.pid,skills:D6PlayerGeneration.SKILL_KEYS.map(k=>p[k]),development:p.playerModel?.development,routine:p.playerModel?.roleModel?.routine,history:p.history,honours:p.honours}))}));
    const result={config,mode,ticks,half,checkpoint,checkpointFacts,keeperCheckpoint,...trace?{traceRows,traceDraws}:{},finished:match.finished,phase:state.phase,validCareer:v61ValidateCareer(c),counts:[0,1].map(t=>match.people.filter(p=>p.t===t&&!p.keeper).length),metrics,score:state.score,rng,draws,p02:load?{version:load.version,finiteFreshness:true,playerCount:Object.keys(load.players).length,players:Object.fromEntries(Object.entries(load.players).map(([pid,p])=>[pid,p.freshness]))}:null,digest};running=false;clearInterval(v65WorldFrame);v65WorldActive=null;v61CurrentCareer=null;match=null;return result;
   },{config,mode,trace:Boolean(process.env.D6_QA_TRACE)});console.log(JSON.stringify({config,mode,finished:row.finished,score:row.score,ticks:row.ticks,space:row.metrics.spacePasses}));report.matches.push(row);await close();
  }
  assert(report.kickoffs.some(r=>r.baseline&&r.minimum<.01),'Old real kickoff stacking reproduced');
  for(const row of report.kickoffs.filter(r=>!r.baseline)){assert(row.minimum>=2.2-1e-8,JSON.stringify(row));assert(row.ownHalf&&row.anchorsUnchanged&&row.travelPreserved&&row.ready,JSON.stringify(row));assert.equal(row.draws,0);}
  for(const row of report.components.filter(r=>!r.baseline)){const prior=report.components.find(r=>r.baseline&&r.revision===row.revision&&r.t===row.t&&r.diagonal===row.diagonal&&r.kind===row.kind);assert.equal(row.draws,0);assert(row.pausedPositionUnchanged);if(row.revision)assert(row.firstHalfSecondMetres>prior.firstHalfSecondMetres);else assert.equal(row.firstHalfSecondMetres,prior.firstHalfSecondMetres,'Existing162 pace unchanged');}
  for(const row of report.defence.filter(r=>!r.baseline)){assert.equal(row.planningDraws,0);assert(row.targets.every(q=>q.purpose==='press'&&q.gap<1e-9));assert(row.attempts>0&&row.recoveryAttempts===0&&row.ownerUnchanged,JSON.stringify(row));}
  for(const row of report.walls.filter(r=>!r.baseline)){assert.equal(row.creationDraws,0);assert(row.wall?.players.length===2&&row.minimumWallDistance>=9.15&&row.wallSeparation>=1.09);assert(row.noEarlyTake&&row.taken===1&&row.takenGap<=.3&&row.roundTripUnchanged,JSON.stringify(row));}
  assert(report.wallGuards.length===5&&report.wallGuards.every(r=>r.noWall&&r.draws===0),'Offside/pass/legacy/existing restart wall guards');
  for(const row of report.matches){assert(row.finished&&row.half&&row.checkpoint&&row.phase==='finished'&&row.validCareer);assert(row.counts.every(n=>n===row.config.count));assert(row.p02?.finiteFreshness);if(row.mode==='after-json'&&row.keeperCheckpoint)assert(row.keeperCheckpoint.waitingRestored,'Observed native keeper waiting checkpoint must restore');}
  assert(report.matches.some(row=>row.mode==='after-json'&&row.keeperCheckpoint?.waitingRestored),'At least one actual natural keeper waiting JSON checkpoint required');
  for(const row of report.matches.filter(r=>r.mode==='after')){const continued=report.matches.find(r=>r.mode==='after-json'&&r.config.seed===row.config.seed);assert.equal(hash(continued.digest),hash(row.digest),'Full native JSON continuation including P02 and random stream: '+row.config.seed);}
  report.matches=report.matches.map(({digest,...r})=>({...r,digestSha256:hash(digest)}));assert.deepEqual(report.errors,[]);for(const [f,sha]of Object.entries({...report.sourceHashes,...report.dependencyHashes}))if(f!=='world-competition-v62.js')assert.equal(hash(fs.readFileSync(path.join(root,'dist',f))),sha,'Native source changed during measurement: '+f);assert.equal(hash(competitionNative()),report.competitionNativeHash,'Native competition controller changed during measurement');report.competitionWholeFileHashAfter=hash(fs.readFileSync(path.join(root,'dist/world-competition-v62.js')));report.nativeSourcesFrozen=true;report.pass=true;
 }catch(e){report.pass=false;report.failure=e.stack;throw e;}
 finally{await browser.close();await new Promise(r=>server.close(r));fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
