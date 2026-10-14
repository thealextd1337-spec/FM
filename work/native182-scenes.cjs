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
  seedRandom(15000+seed);script=null;events=null;
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
 // ----- B03: defensive pursuit of a breaking carrier -----
 // The carrier follows a scripted run (straight or a cut); everything else,
 // including every defender decision, contact check, duel and foul, is native.
 let script=null,events=null;
 const baseCarrier=v159CarrierTarget,baseAction=action,baseStanding=v56StandingTackle,baseSlide=v56StartSlide,baseFoul=v50Foul;
 v159CarrierTarget=function(m,p){if(!script||p!==m.owner||p.pid!==script.carrier)return baseCarrier(m,p);const s=v150Scale(),t=v102Clock(m)-script.start,dir=t>=script.cutAt?script.after:script.before;p.tx=p.x+dir.x*2/s.x;p.ty=p.y+dir.y*2/s.y;return true;};
 action=function(){if(!script)return baseAction();const m=match;if(v56MaybeChallenge(m.owner))return;m.next=m.elapsed+.24*MATCH_SPEED;};
 const record=(kind,tackler,victim)=>{if(!events)return;const s=v150Scale(),f=victim.offenseMotion,len=Math.hypot(f?.vx||0,f?.vy||0),fw=len>.3?{x:f.vx/len,y:f.vy/len}:{x:Math.sin(f?.heading||0),y:Math.cos(f?.heading||0)},rel={x:(tackler.x-victim.x)*s.x,y:(tackler.y-victim.y)*s.y};events.push({kind,tackler:tackler.pid,at:v102Clock(match),along:rel.x*fw.x+rel.y*fw.y,behindFlag:kind==='slide'?Boolean(match.slide?.behind):null});};
 v56StandingTackle=function(tackler,victim){const info=events&&v56ApproachInfo(tackler,victim),eligible=info&&!info.behind&&info.ball<=30.4&&info.body<=40,r=baseStanding(tackler,victim);if(events)record(eligible?'standing':'standing-none',tackler,victim);return r;};
 v56StartSlide=function(tackler,victim){const r=baseSlide(tackler,victim);if(r!==false)record('slide',tackler,victim);return r;};
 v50Foul=function(victim,offender){const slide=match.slide||null,behind=events&&slide?.tackler===offender?slide.behind:null,r=baseFoul(victim,offender);if(events&&r!==false){record('foul',offender,victim);events[events.length-1].behindFlag=behind;}return r;};
 const offsets={behind1:[-1,0],behind3:[-3,0],behind5:[-5,0],sideL2:[0,-2],sideR2:[0,2],sideL4:[0,-4],sideR4:[0,4],diagL3:[-2.1,-2.1],diagR3:[-2.1,2.1],front6:[6,0],frontR5:[5,2.5]};
 function pursuitScenes(marker){const list=[];
  for(const offset of Object.keys(offsets))for(const path of [0,30,60,90])for(const quality of [8,12,18])for(const attack of [8,12,18])for(const team of [0,1])for(const size of ['standard','large'])
   if(size==='standard'||(quality===12&&attack===12))list.push({id:`${offset}:${path}:${quality}:${attack}:${team}:${size}`,offset,path,quality,attack,team,size,marker});
  return list;}
 function pursuitScene({offset='behind3',path=0,quality=12,attack=12,team=0,size='standard',marker=false,lateral=0}){
  seedRandom(23000+path*7+quality*3+attack+team*11+(size==='large'?5:0)+Object.keys(offsets).indexOf(offset)*13);
  const geometry=v160WorldGeometry({world:{matchConfig:{version:1,fieldSize:size,fieldPlayers:5}}}),s={x:geometry.width/(v55Field.right-v55Field.left),y:geometry.length/(v55Field.bottom-v55Field.top)},d=team,a=1-d;
  // Frame of the defending team: depth from its goal line, lateral across.
  const carrierPos=at(d,32,lateral,s),[back,side]=offsets[offset],defPos=at(d,32-back,lateral+side,s);
  const carrier=person('carrier',a,carrierPos.x,carrierPos.y,'att',{n:9,spd:attack,tec:12,pos:12,fin:12});
  const defender=person('defender',d,defPos.x,defPos.y,'def',{n:4,spd:quality,pos:quality,tak:12});const anchor=at(d,15,side<0?-7:7,s);defender.bx=anchor.x;defender.by=anchor.y;defender.initialBy=anchor.y;
  const far=person('cover',d,...Object.values(at(d,46,-12,s)),'mid',{n:6});const support=person('support',a,...Object.values(at(d,44,12,s)),'mid',{n:8});
  const keepers=[person('keeper-d',d,...Object.values(at(d,3,0,s)),'gk',{n:1},true),person('keeper-a',a,...Object.values(at(d,64,0,s)),'gk',{n:1},true)];
  const people=d===0?[keepers[0],defender,far,keepers[1],carrier,support]:[keepers[1],carrier,support,keepers[0],defender,far];
  for(const q of [carrier,support]){const base=q===carrier?at(d,26,lateral,s):at(d,36,12,s);q.bx=base.x;q.by=base.y;q.initialBy=base.y;}
  install({people,size,ball:carrierPos,lastTouch:a,markers:marker?{looseBallRevision:182,pursuitRevision:182}:{}});
  const toward=d===0?1:-1,fw={x:0,y:toward},rot=deg=>{const r=deg*Math.PI/180;return {x:fw.x*Math.cos(r)+fw.y*Math.sin(r),y:-fw.x*Math.sin(r)+fw.y*Math.cos(r)};};
  // Momentum of an actual break: carrier at dribbling pace, defender recovering.
  v157Body(carrier).vx=0;v157Body(carrier).vy=toward*5.5;v157Body(carrier).heading=Math.atan2(0,toward);
  v157Body(defender).vx=0;v157Body(defender).vy=back>0?-toward*3:toward*(back<0?4.5:2.5);v157Body(defender).heading=Math.atan2(0,toward);
  carrier.motionX=0;carrier.motionY=toward*.01;defender.motionX=0;defender.motionY=toward*.01;
  match.owner=carrier;match.ball={...carrierPos};match.next=match.elapsed+.24*MATCH_SPEED;
  script={carrier:'carrier',start:v102Clock(match),cutAt:.7,before:fw,after:rot(-path)};events=[];
  return {s,carrier,defender,d};
 }
 function pursuitRun(config){
  const {s,carrier,defender,d}=pursuitScene(config),goal={x:.5,y:goalY(d)},rows=[],start=v102Clock(match);let end='timeout';
  const depth=p=>Math.abs(p.y-goal.y)*s.y,lineGap=(p,c)=>{const gx=(goal.x-c.x)*s.x,gy=(goal.y-c.y)*s.y,g=Math.hypot(gx,gy)||1;return Math.abs(((p.x-c.x)*s.x)*gy-((p.y-c.y)*s.y)*gx)/g;};
  for(let i=0;i<80;i++){
   if(match.owner!==carrier){end=match.setPiece?'foul':match.owner?.t===d?'won':match.rebound?'loose':'other';break;}
   if(depth(carrier)<12){end='escaped';break;}
   advance();
   const gap=v122MetresIn(defender,carrier,s),goalSide=depth(defender)<depth(carrier)-.3&&lineGap(defender,carrier)<2,cv=carrier.offenseMotion,cs=Math.hypot(cv.vx,cv.vy),alongRun=cs>.5?((defender.x-carrier.x)*s.x*cv.vx+(defender.y-carrier.y)*s.y*cv.vy)/cs:0;
   rows.push({t:v102Clock(match)-start,gap,goalSide,alongRun,recovering:(defender.recoverUntil||0)>match.elapsed||defender.slideActive,dSpeed:Math.hypot(defender.offenseMotion.vx,defender.offenseMotion.vy),cSpeed:Math.hypot(carrier.offenseMotion.vx,carrier.offenseMotion.vy)});
  }
  if(end==='timeout'&&match.owner!==carrier)end=match.setPiece?'foul':match.owner?.t===d?'won':match.rebound?'loose':'other';
  const out={end,rows,events:events.slice(),draws};script=null;events=null;return out;
 }
 function pursuitMetrics(run){
  const goalSideAt=run.rows.find(r=>r.goalSide)?.t??null,attempts=run.events.filter(e=>e.tackler==='defender'&&['standing','slide'].includes(e.kind));
  // Vorbeilaufen: within 1.2 m without any challenge, then the carrier is past him
  // (more than 0.5 m behind along the carrier's actual run) although he was not before.
  let passBy=0,passByRecovering=0,closeNoCheck=0,inside=false,checked=false,recovering=false,episodeStart=0,startAlong=0;
  for(const r of run.rows){
   if(r.gap<1.2){if(!inside){inside=true;checked=false;recovering=false;episodeStart=r.t-.05;startAlong=r.alongRun;}if(r.recovering)recovering=true;if(attempts.some(e=>e.at>episodeStart-1e-9&&e.at<=r.t+1e-9))checked=true;}
   else if(inside){inside=false;if(!checked&&!r.goalSide)closeNoCheck++;if(!checked&&startAlong>=-.5&&r.alongRun<-.5){if(recovering)passByRecovering++;else passBy++;}}
  }
  const fouls=run.events.filter(e=>e.kind==='foul'&&e.tackler==='defender');
  return {end:run.end,goalSideAt,passBy,passByRecovering,closeNoCheck,foulsFront:fouls.filter(e=>!(e.behindFlag||e.along<-.5)).length,standing:attempts.filter(e=>e.kind==='standing').length,slides:attempts.filter(e=>e.kind==='slide').length,slidesBehind:attempts.filter(e=>e.kind==='slide'&&e.behindFlag).length,fouls:fouls.length,foulsBehind:fouls.filter(e=>e.behindFlag||e.along<-.5).length,minGap:Math.min(...run.rows.map(r=>r.gap),99),seconds:run.rows.at(-1)?.t||0};
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
   for(const p of match.people){if(typeof v182LooseTarget==='function'&&!p.keeper){v182LooseTarget(match,p);calls++;}if(typeof v182PursuitActive==='function'&&v182PursuitActive(match)&&!p.keeper){v159DefensiveTarget(match,p);calls++;}}
   Math.random=random;advance();
  }
  return calls;}
 // Unmarked scene list for the base/current byte comparison.
 function oldScenes(){const list=[];
  for(const kind of ['static','rolling','diagonal','rebound','air'])for(const team of [0,1])for(const size of ['standard','large'])for(const seed of [0,3,4])list.push({id:`loose:${kind}:${team}:${size}:${seed}`,type:'loose',config:{kind,team,size,seed,marker:false}});
  pursuitScenes(false).forEach((scene,i)=>{if(i%9===0)list.push({id:'pursuit:'+scene.id,type:'pursuit',config:scene});});
  return list;}
 function oldDigest(scene){
  if(scene.type==='loose'){looseScene(scene.config);for(let i=0;i<70;i++)advance();}
  else{pursuitScene(scene.config);for(let i=0;i<70&&!match.setPiece&&!match.finished;i++)advance();script=null;events=null;}
  return digest();}
 globalThis.Native182={seedRandom,person,install,at,advance,digest,checkpoint,continuation,plannerDraws,looseScene,looseRun,looseMetrics,pursuitScenes,pursuitScene,pursuitRun,pursuitMetrics,oldScenes,oldDigest,rng:()=>({value:rng,draws}),context:()=>active};
}
function create(options){const h=harness(options);h.run('('+inContext.toString()+')()','native182-scenes');return h;}
module.exports={create,inContext};
