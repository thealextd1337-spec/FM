'use strict';
// Native v182 scenes for loose balls (B12) and defensive pursuit (B03).
// Runs the actual dist controllers in the native130 VM harness; only the
// scene construction and the measurement are fixture code.
const {harness}=require('./native130-harness.cjs');

function inContext(){
 let rng=1,draws=0,active=null;
 const seedRandom=seed=>{rng=seed>>>0||1;draws=0;Math.random=()=>{draws++;rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};};
 const jitter=seed=>{let s=(seed*2654435761)>>>0||7;return()=>{s=(Math.imul(s,22695477)+1)>>>0;return s/4294967296;};};
 function person(pid,t,x,y,line,skills={},keeper=false){
  const p={pid,n:skills.n??(keeper?1:2),name:pid,t,x,y,tx:x,ty:y,bx:x,by:y,initialBy:y,line,assignedLine:line,role:line==='def'?-1:line==='att'?1:0,keeper,instructions:[],heightCm:178,fresh:100,form:0,motionX:0,motionY:t===0?-1:1,recoverUntil:0,stats:emptyStats()};
  for(const key of D6PlayerGeneration.SKILL_KEYS)p[key]=12;
  for(const [key,value]of Object.entries(skills))if(key!=='n')p[key]=value;
  p.playerModel={loadParameterId:D6LoadCandidate.PARAMETER_ID,freshnessState:D6Freshness.createState(pid,p.fresh)};
  return p;
 }
 function install({people,size='standard',markers={},ball,lastTouch=0}){
  const geometry=v160WorldGeometry({world:{matchConfig:{version:1,fieldSize:size,fieldPlayers:5}}}),parameters=D6LoadCandidate.createParameters();
  const state={phase:'live',minute:20,fresh:{},playerLoad:{version:158,parameterId:D6LoadCandidate.PARAMETER_ID,parameters,startFresh:{},players:{},meta:{},pending:{},sequence:0,day:1,compactPositions:{}}};
  for(const p of people){state.fresh[p.pid]=p.fresh;state.playerLoad.startFresh[p.pid]=p.fresh;state.playerLoad.players[p.pid]=D6Freshness.createState(p.pid,p.fresh);state.playerLoad.meta[p.pid]={stamina:p.sta,keeper:p.keeper};}
  const career={world:{matchConfig:{version:1,fieldSize:size,fieldPlayers:5},playerFoundation:{loadParameters:parameters},clubs:[{id:'a',name:'A',roster:people.filter(p=>p.t===0)},{id:'b',name:'B',roster:people.filter(p=>p.t===1)}]}};
  active={career,fixture:{id:'native-182',day:1,homeId:'a',awayId:'b'},state,ownSide:0};v65WorldActive=active;
  match={geometry,people,exitedPeople:[],owner:null,flight:null,slide:null,breakawayCarrier:null,ball:{...ball},rebound:null,elapsed:20,firstHalfEnd:500,fullTimeEnd:1000,score:[0,0],shots:[0,0],possession:[0,0],goals:[],aggression:[0,0],defenseLines:[0,0],teamPress:[0,0],teamDirect:[0,0],lastTouch,next:Infinity,opponentName:"B",setPieceStats:{corners:[0,0],fouls:[0,0],freeKicks:[0,0],penalties:[0,0]},
   attackFlow:{version:152,qualityVersion:157,flowVersion:159,paceVersion:162,paceRevision:119,keeperChaseRevision:180,...markers,intents:{}},ballAccounting:{version:117,sequence:0,events:[]}};
  for(const p of people)v157Body(p);
  return match;
 }
 const scale=()=>v150Scale(match);
 const goalY=t=>t===0?v55Field.bottom:v55Field.top;
 // Position in metres from the own goal line (depth) and from the centre line
 // seen from that team (lateral); both teams are mirrored.
 function at(t,depth,lateral,s){return {x:.5+(t===0?1:-1)*lateral/s.x,y:goalY(t)+(t===0?-1:1)*depth/s.y};}
 function advance(dt=.05){const clock=v102Clock(match);step(dt*MATCH_SPEED,dt);if(Math.abs(v102Clock(match)-clock-dt)>1e-8)throw Error('Native clock did not advance once');
  for(const p of match.people)if(![p.x,p.y,p.tx,p.ty].every(Number.isFinite))throw Error('Nonfinite player');}
 function digest(){const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
  const {people,exitedPeople,owner,lastPass,breakawayCarrier,slide,nativeContactClock,...rest}=match,player=p=>{const{playerModel,...plain}=p;return plain};
  return JSON.stringify(canonical({...rest,people:people.map(player),owner:owner?.pid||null,slide:slide?{...slide,tackler:slide.tackler.pid,victim:slide.victim.pid}:null,continuation:v160SnapshotContinuation(match),clock:v102Clock(match),load:active.state.playerLoad,fresh:active.state.fresh,rng,draws}));}
 // ----- B12: loose balls -----
 const formation=[['d1','def',15,-7],['d2','def',15,7],['m1','mid',28,-9],['m2','mid',28,9],['a1','att',40,0]];
 function looseScene({kind='rolling',team=0,size='standard',seed=1,marker=false,spd=12}){
  seedRandom(15000+seed);
  const geometry=v160WorldGeometry({world:{matchConfig:{version:1,fieldSize:size,fieldPlayers:5}}}),s={x:geometry.width/(v55Field.right-v55Field.left),y:geometry.length/(v55Field.bottom-v55Field.top)},L=geometry.length,W=geometry.width,j=jitter(seed*31+(kind.length*7)+team*3+(size==='large'?1:0));
  // The attacking team is `team`; its ball sits at a seed-dependent depth.
  const ballDepth=[34,44,52,24,40,56][seed%6]*L/68,ballLateral=[0,-10,8,-4,13,-12][seed%6]*W/44;
  const shift=t=>t===team?ballDepth-30:L-ballDepth-38;
  const people=[];
  for(const t of [0,1]){people.push(person(`k${t}`,t,...Object.values(at(t,3,0,s)),'gk',{n:1},true));
   for(const [id,line,depth,lateral]of formation){const d=clamp(depth*L/68+shift(t)+(j()-.5)*6,6,L-6),l=clamp(lateral*W/44+(t===team?ballLateral:-ballLateral)*.35+(j()-.5)*5,-W/2+2,W/2-2),pos=at(t,d,l,s),q=person(`${id}${t}`,t,pos.x,pos.y,line,{n:formation.findIndex(f=>f[0]===id)+2,spd:spd+Math.round((j()-.5)*6),pos:10+Math.round(j()*8),tec:10+Math.round(j()*8)});const base=at(t,depth*L/68,lateral*W/44,s);q.bx=base.x;q.by=base.y;q.initialBy=base.y;people.push(q);}}
  const point=at(team,ballDepth,ballLateral,s),carrier=people.filter(p=>p.t===team&&!p.keeper).sort((a,b)=>v122MetresIn(a,point,s)-v122MetresIn(b,point,s))[0];
  carrier.x=point.x;carrier.y=point.y;
  install({people,size,ball:point,lastTouch:team,markers:marker?{looseBallRevision:182}:{}});
  // Natural momentum: one second of possession (no action is due).
  match.owner=carrier;match.ball={x:carrier.x,y:carrier.y};match.next=Infinity;
  for(let i=0;i<20;i++)advance();
  match.next=Infinity;
  const dir=team===0?-1:1,mps=(vx,vy)=>({vx:vx/s.x/MATCH_SPEED,vy:dir*vy/s.y/MATCH_SPEED});
  // A heavy touch, poke or block leaves the ball some metres from every body.
  const away={static:[1,.4],rolling:[.25,1],diagonal:[.7,.7],rebound:[.2,1],air:[.3,1]}[kind],side=(seed&1?-1:1),offset={x:side*away[0],y:away[1]},norm=Math.hypot(offset.x,offset.y),release={x:match.ball.x,y:match.ball.y};
  for(let metres=3.5;metres<14;metres+=.5){release.x=clamp(match.ball.x+offset.x/norm*metres/s.x,v55Field.left+2/s.x,v55Field.right-2/s.x);release.y=clamp(match.ball.y+dir*offset.y/norm*metres/s.y,v55Field.top+3/s.y,v55Field.bottom-3/s.y);if(match.people.every(p=>p.keeper||v122MetresIn(p,release,s)>=3+(seed%3)))break;}
  match.owner=null;match.lastTouch=team;v50LooseBall(release,'native-182');const r=match.rebound;
  const angle=(j()-.5)*.5;
  const velocity=kind==='static'?mps(0,0):kind==='rolling'?mps(Math.sin(angle)*7,Math.cos(angle)*7):kind==='diagonal'?mps((team?-1:1)*5.5,5.5):kind==='rebound'?mps(Math.sin(angle)*9,-Math.cos(angle)*9):mps(Math.sin(angle)*3.5,Math.cos(angle)*3.5);
  r.vx=velocity.vx;r.vy=velocity.vy;
  if(kind==='air'){const height=4.2,vh=2.5;v124AirBalls.set(match,{rebound:r,height,vh,impacts:0,settled:false});const fall=(vh+Math.sqrt(vh*vh+19.6*(height-.29)))/9.8;r.delay=Math.max(r.delay,fall*MATCH_SPEED);}
  return {s,release};
 }
 function v122MetresIn(a,b,s){return Math.hypot((a.x-b.x)*s.x,(a.y-b.y)*s.y);}
 function looseRun(config){
  const {s}=looseScene(config),rows=[],start=v102Clock(match);let winner=null,end='timeout',ticks=0,chaserChanges=0,lastChasers=null;
  while(ticks++<200){
   const r=match.rebound;if(match.throwIn||match.setPiece||match.kickoff){end='out';break;}if(!r||match.owner){end=match.owner?'owner':'other';winner=match.owner;break;}
   const ball={x:r.x,y:r.y},before=new Map(match.people.map(p=>[p,{x:p.x,y:p.y}])),air=v124AirBalls.get(match),airborne=Boolean(air&&air.rebound===r&&!air.settled),impacts=air?.impacts||0;
   const fall=airborne?clamp((air.vh+Math.sqrt(air.vh*air.vh+19.6*Math.max(0,air.height-.29)))/9.8,0,1.5):0,landing=airborne?{x:clamp(r.x+r.vx*MATCH_SPEED*fall,v55Field.left,v55Field.right),y:clamp(r.y+r.vy*MATCH_SPEED*fall,v55Field.top,v55Field.bottom)}:null;
   advance();
   const later=v124AirBalls.get(match),row={t:v102Clock(match)-start,airborne,impact:Boolean(airborne&&(!match.rebound||!later||later.impacts>impacts||later.settled)),delay:r.delay>0,players:[]};
   for(const p of match.people){if(p.keeper)continue;const b=before.get(p),dx=(p.x-b.x)*s.x,dy=(p.y-b.y)*s.y,step=Math.hypot(dx,dy),moved=step/.05,aim=landing||ball,tbx=(aim.x-b.x)*s.x,tby=(aim.y-b.y)*s.y,dist=Math.hypot(tbx,tby),body=p.offenseMotion||{vx:0,vy:0},bodySpeed=Math.hypot(body.vx,body.vy);
    row.players.push({pid:p.pid,t:p.t,dist,speed:moved,cosBall:step>1e-6&&dist>1e-6?(dx*tbx+dy*tby)/(step*dist):null,cosBody:step>1e-6&&bodySpeed>.2?(dx*body.vx+dy*body.vy)/(step*bodySpeed):null,bodyBall:bodySpeed>.2&&dist>1e-6?(body.vx*tbx+body.vy*tby)/(bodySpeed*dist):null,chaser:Array.isArray(r.chase?.pids)?r.chase.pids.includes(p.pid):null,cover:Array.isArray(r.chase?.cover)?r.chase.cover.includes(p.pid):null});}
   const old=[...match.people].sort((a,b)=>v122MetresIn(a,ball,s)-v122MetresIn(b,ball,s)).slice(0,3).map(p=>p.pid).sort().join();
   const set=airborne?null:config.marker?(Array.isArray(r.chase?.pids)?[...r.chase.pids].sort().join():null):r.delay>0?null:old;if(set!==null){if(lastChasers!==null&&set!==lastChasers)chaserChanges++;lastChasers=set;}
   rows.push(row);
  }
  return {seconds:v102Clock(match)-start,end,winner:winner?.pid||null,winnerTeam:winner?winner.t:null,rows,chaserChanges,draws};
 }
 function looseMetrics(run){
  // Ground ticks: the nearest field player of each team is the natural chaser.
  // Air ticks: distances and directions refer to the predicted landing point.
  const out={nearestTicks:0,awayTicks:0,brakingAwayTicks:0,activeAwayTicks:0,closeMovingTicks:0,misalignedTicks:0,misaligned45Ticks:0,nearestFlips:0,chaseQuits:0,airTicks:0,airMoving:0,airToward:0,landingSupport:0,landings:0,chaserChanges:run.chaserChanges,seconds:run.seconds,end:run.end,winnerTeam:run.winnerTeam};
  const previous=new Map(),approaching=new Map(),radial=[0,0];let landed=false;
  for(const row of run.rows){
   if(row.airborne){out.airTicks++;
    for(const t of [0,1])for(const p of row.players.filter(p=>p.t===t).sort((a,b)=>a.dist-b.dist).slice(0,2))if(p.speed>.5){out.airMoving++;if(p.cosBall>0)out.airToward++;}
    if(row.impact&&!landed){landed=true;out.landings++;out.landingSupport+=row.players.filter(p=>p.dist<6).length;}
   }else for(const t of [0,1]){const n=row.players.filter(p=>p.t===t).sort((a,b)=>a.dist-b.dist)[0];if(!n||n.dist<.9)continue;out.nearestTicks++;
    if(n.speed>.5&&n.cosBall<0){out.awayTicks++;const before=previous.get(n.pid);if(n.bodyBall!==null&&n.bodyBall<0&&!(before!==undefined&&n.speed<before-.1))out.activeAwayTicks++;else out.brakingAwayTicks++;}
    const sign=n.speed>.8&&n.cosBall!==null?(n.cosBall>.3?1:n.cosBall<-.3?-1:0):0;if(sign&&radial[t]&&sign!==radial[t])out.nearestFlips++;if(sign)radial[t]=sign;}
   for(const p of row.players){
    if((row.airborne||p.dist<20)&&p.speed>.5){out.closeMovingTicks++;if(p.cosBody!==null&&p.cosBody<0)out.misalignedTicks++;if(p.cosBody!==null&&p.cosBody<Math.SQRT1_2)out.misaligned45Ticks++;}
    previous.set(p.pid,p.speed);
    const going=!row.airborne&&p.speed>1&&p.cosBall>.5&&p.dist<12,was=approaching.get(p.pid);if(was&&!going&&p.dist>1)out.chaseQuits++;approaching.set(p.pid,going);
   }
  }
  return out;
 }
 // JSON checkpoint during a scene; the continuation must equal the uninterrupted run.
 function checkpoint(){if(!v65Snapshot(active))throw Error('Snapshot failed');active.state.physicalSnapshot=JSON.parse(JSON.stringify(active.state.physicalSnapshot));match=null;if(!v65Restore(active))throw Error('Restore failed');}
 function continuation(scene,at,total=60){
  if(scene.type==='loose')looseScene(scene.config);else pursuitScene(scene.config);
  for(let i=0;i<total;i++){if(at===i&&!match.flight&&!match.slide)checkpoint();if(match.setPiece||match.finished)break;advance();}
  return digest();}
 // The v182 planners themselves never draw random numbers.
 function plannerDraws(scene,ticks=40){
  if(scene.type==='loose')looseScene(scene.config);else pursuitScene(scene.config);let calls=0;
  const random=Math.random;
  for(let i=0;i<ticks&&!match.setPiece;i++){
   Math.random=()=>{throw Error('v182 planner drew a random number');};
   for(const p of match.people){if(typeof v182LooseTarget==='function'&&!p.keeper){v182LooseTarget(match,p);calls++;}if(typeof v182PursuitTarget==='function'&&!p.keeper){v182PursuitTarget(match,p);calls++;}}
   Math.random=random;advance();
  }
  return calls;}
 // Unmarked scene list for the base/current byte comparison.
 function oldScenes(){const list=[];
  for(const kind of ['static','rolling','diagonal','rebound','air'])for(const team of [0,1])for(const size of ['standard','large'])for(const seed of [0,3,4])list.push({id:`loose:${kind}:${team}:${size}:${seed}`,type:'loose',config:{kind,team,size,seed,marker:false}});
  if(typeof pursuitScene==='function')for(const scene of pursuitScenes(false))list.push({id:'pursuit:'+scene.id,type:'pursuit',config:scene});
  return list;}
 function oldDigest(scene){
  if(scene.type==='loose'){looseScene(scene.config);for(let i=0;i<70;i++)advance();}
  else{pursuitScene(scene.config);for(let i=0;i<70&&!match.setPiece&&!match.finished;i++)advance();}
  return digest();}
 globalThis.Native182={seedRandom,person,install,at,advance,digest,checkpoint,continuation,plannerDraws,looseScene,looseRun,looseMetrics,oldScenes,oldDigest,rng:()=>({value:rng,draws}),context:()=>active};
}
function create(options){const h=harness(options);h.run('('+inContext.toString()+')()','native182-scenes');return h;}
module.exports={create,inContext};
