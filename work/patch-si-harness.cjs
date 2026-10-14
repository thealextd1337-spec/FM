'use strict';
// Builds work/measure-si-r132.cjs from work/measure-p01-r132.cjs by exact single-match
// replacements (Spielerintelligenz-Analyse, Release 132). Re-runnable: always starts from the P01 copy.
const fs=require('node:fs'),path=require('node:path');
const src=path.join(__dirname,'measure-p01-r132.cjs'),dst=path.join(__dirname,'measure-si-r132.cjs');
let t=fs.readFileSync(src,'utf8');
const rep=(a,b)=>{const n=t.split(a).length-1;if(n!==1)throw Error('expected 1 match, got '+n+': '+a.slice(0,90));t=t.replace(a,b);};
rep(`// P01 analysis (Release 132): complete native physical matches from real
// expansion12 careers (production player model, no \`players=\` test candidate).`,
`// Spielerintelligenz-Analyse (Release 132): generated from work/measure-p01-r132.cjs by
// work/patch-si-harness.cjs. Adds prototype variants (decision model, off-ball offers,
// keeper, set-piece teleport) and extra metrics (rebounds, corners, crosses, shot results).
// Complete native physical matches from real expansion12 careers (production player model).`);
rep(`//   node work/measure-p01-r132.cjs --variant=baseline --clubs=96 --sizes=standard,large --workers=4
//   node work/measure-p01-r132.cjs --variant=speed52 --clubs=48
//   node work/measure-p01-r132.cjs --variant=baseline --boost=fin:4 --clubs=48   (own team +4 Abschluss)`,
`//   node work/measure-si-r132.cjs --variant=baseline --clubs=96 --sizes=standard,large --workers=6 --port=4260
//   node work/measure-si-r132.cjs --variant=si-full50 --clubs=96 --port=4261
//   Ports 4260-4269; results in outputs/si-r132/<variant>.json`);
rep(`port=+arg('port','4250');`,`port=+arg('port','4260');`);
rep(`path.join(root,'outputs/p01-r132',`,`path.join(root,'outputs/si-r132',`);
rep(`assert(port>=4250&&port<=4259,'Port range 4250-4259');`,`assert(port>=4260&&port<=4269,'Port range 4260-4269');`);
rep(`variants['speed52-full']=[...variants.speed52,...variants.attack,...variants.aim,...variants.keeper,...variants.fastRestart,...variants.carrier145,...variants.turn];`,
`variants['speed52-full']=[...variants.speed52,...variants.attack,...variants.aim,...variants.keeper,...variants.fastRestart,...variants.carrier145,...variants.turn];
// ---------------------------------------------------------------------------
// Spielerintelligenz prototypes (copies of logic in the overlay; dist unchanged).
variants.speed50=[['game.js','const MATCH_SPEED=.78;','const MATCH_SPEED=.50;']];
variants.speed42=[['game.js','const MATCH_SPEED=.78;','const MATCH_SPEED=.42;']];
// runners2: two depth runners also with five field players (today 1 when allies<5).
variants.runners2=[['world-football-flow-v159.js',"for(const p of runners.slice(0,quick&&allies.length<5?1:2)){","for(const p of runners.slice(0,2)){"]];
// offers: every remaining non-cover ally without an intent gets a free-space target
// (far from rivals, open lane to the carrier, mild forward bias, spread from other offers).
variants.offers=[['world-football-flow-v159.js',"if(quick)flow.paceOffers=Object.entries(flow.intents).filter(([,i])=>i.type!=='follow').map(([id])=>id);",
 "for(const p of allies.filter(p=>!flow.intents[p.pid]&&!v159Cover(p)&&p.tacticalRole!=='target-player')){const side=p.bx<.5?-1:1,goalY=owner.t===0?v55Field.top:v55Field.bottom,wideBall=Math.abs(owner.x-.5)*s.x>6&&v115GoalDistance(owner)<30&&(p.assignedLine||p.line)!=='def',ballSide=owner.x<.5?-1:1,candidates=(wideBall?[[-ballSide*2.5,6],[ballSide*3,8.5],[0,11.5],[-ballSide*6,10]].map(([lx,ly])=>({x:.5+lx/s.x,y:goalY-dir*ly/s.y})):[[0,5],[side*4,4],[-side*4,4],[side*5,0],[-side*5,0],[0,-3]].map(([lx,ly])=>({x:p.x+lx/s.x,y:p.y+dir*ly/s.y}))).map(point=>v159Point(point,s));const score=point=>Math.min(10,...rivals.map(r=>v122Metres(r,point)))*1.1-Math.max(0,8-v122Metres(owner,point))*.4-Math.max(0,v122Metres(owner,point)-22)*.5+(v157Lane(m,owner,point,rivals,1.25)?1.5:0)+((point.y-p.y)*dir*s.y)*.08-occupied.reduce((n,i)=>n+Math.max(0,5-v122Metres(i,point))*1.5,0);candidates.sort((a,b)=>score(b)-score(a));flow.intents[p.pid]={...candidates[0],type:'depth',team:p.t,at:now,until:flow.offerUntil};occupied.push(candidates[0]);}if(quick)flow.paceOffers=Object.entries(flow.intents).filter(([,i])=>i.type!=='follow').map(([id])=>id);"]];
// decide: unified carrier evaluation. Shot quality = finishing-dependent range window
// (16 m + 0.7 m per finishing point), angle factor, one blocker allowed with penalty;
// the shot is compared with the best pass option; attackers probe a real window before carrying.
variants.decide=[
 ['world-offensive-quality-v157.js',"if(depth<1||range>22||lateral>depth*.85+1)return 0;","const fin=ability(p,'fin'),limit=16+fin*.7;if(depth<1||range>limit||lateral>depth*.95+1.5)return 0;"],
 ['world-offensive-quality-v157.js',"if(rivals.some(r=>!r.keeper&&!r.slideActive&&(()=>{const lane=passLaneGeometry(r,p,goal);return lane&&v122Metres(r,lane)<1.4;})()))return 0;","const blockers=rivals.filter(r=>!r.keeper&&!r.slideActive&&(()=>{const lane=passLaneGeometry(r,p,goal);return lane&&v122Metres(r,lane)<1.2;})()).length;if(blockers>1)return 0;"],
 ['world-offensive-quality-v157.js',"return clamp((22-range)/12,0,1)*(.55+(ability(p,'fin')+ability(p,'tec'))/80);","const angle=Math.atan2(depth,Math.max(.01,lateral))/(Math.PI/2);return clamp((limit-range)/(limit-6),0,1)*(.45+angle*.4)*(.55+(fin+ability(p,'tec'))/80)*(blockers?.5:1);"],
 ['world-offensive-quality-v157.js',"if(shot>0&&(range<=14||random()<Math.max(v145ShotChance(p,rivals),shot*.65))){v55Shoot(p);return true;}","const best=options[0],passValue=best?clamp(best.gain*.025+best.quality*.9+(best.returnRun?.1:0),0,1)*(rivals.some(r=>!r.keeper&&v122Metres(r,best.target)<2.5)?.6:1):0;if(shot>0&&(range<=14||shot>=passValue*.7&&random()<Math.min(.95,shot*2.2+(hasInstruction(p,'shoot')?.1:0)))){v55Shoot(p);return true;}"],
 ['world-offensive-quality-v157.js',"const shot=v157ShotQuality(p,rivals),square=options.find(o=>o.quality>shot+.22&&v115GoalDistance(o.q)<range-2);","const shot=v157ShotQuality(p,rivals),square=options.find(o=>o.quality>shot+.12&&v115GoalDistance(o.q)<range-2);"],
 ['world-football-flow-v159.js',"if(p===m.owner&&line==='att'&&!v159Cover(p)&&range>12&&range<30){","if(p===m.owner&&line==='att'&&!v159Cover(p)&&range>12&&range<30&&v157ShotQuality(p,rivals)<.18){"]];
// risk: playmakers / strong passers accept narrower lanes, longer passes and lower gain thresholds; space passes more often.
variants.risk=[
 ['world-offensive-quality-v157.js',"o.distance>=3&&o.distance<=(m.teamDirect?.[p.t]?25:20)&&v157Lane(m,p,o.target,rivals)","o.distance>=3&&o.distance<=(m.teamDirect?.[p.t]||p.tacticalRole==='playmaker'||ability(p,'pas')>=14?26:20)&&v157Lane(m,p,o.target,rivals,p.tacticalRole==='playmaker'||ability(p,'pas')>=14?1.0:1.4)"],
 ['world-offensive-quality-v157.js',"const useful=options.find(o=>o.returnRun||o.gain>=3&&o.score>.05);","const risky=p.tacticalRole==='playmaker'||ability(p,'pas')>=14,useful=options.find(o=>o.returnRun||o.gain>=(risky?2:3)&&o.score>(risky?-.05:.05));"],
 ['world-space-passes-v150.js',"if(blocked||margin<.10||rivals.some(r=>v122Metres(r,target)<2.2))continue;","if(blocked||margin<.02||rivals.some(r=>v122Metres(r,target)<1.8))continue;"],
 ['world-space-passes-v150.js',"if(!option||option.score<.14)return false;","if(!option||option.score<.10)return false;"],
 ['world-space-passes-v150.js',"const chance=clamp(.08+ability(p,'pas')*.012+ability(p,'pos')*.005+(match.teamDirect?.[p.t]?.10:0)+(hasInstruction(option.runner,'deep')?.10:0),.12,.58);","const chance=clamp(.10+ability(p,'pas')*.022+ability(p,'pos')*.005+(match.teamDirect?.[p.t]?.10:0)+(hasInstruction(option.runner,'deep')?.10:0)+(p.tacticalRole==='playmaker'?.15:0),.12,.80);"]];
// cross: wide carriers with an occupied box cross early (before the long carry chain); late cross chance higher.
variants.cross=[
 ['world-offensive-quality-v157.js',"if(v162TryHighPass(m,p,allies,rivals))return true;","const cp=window.__crossProbe||(window.__crossProbe={reached:0,wide:0,box:0,fired:0});cp.reached++;if(range<32&&range>9&&Math.abs(p.x-.5)*s.x>6){cp.wide++;const boxEarly=allies.filter(q=>!q.slideActive&&!offside.has(q)&&v115GoalDistance(q)<20&&Math.abs(q.x-.5)*s.x<12&&v122Metres(p,q)>=6);if(boxEarly.length){cp.box++;}if(boxEarly.length&&random()<v115DecisionChance(p,'cross',p.tacticalRole==='winger'?.85:.7)){cp.fired++;v55HighPass(p,boxEarly.sort((a,b)=>ability(b,'air')+ability(b,'pos')*.3-ability(a,'air')-ability(a,'pos')*.3)[0],{cross:true});return true;}}if(v162TryHighPass(m,p,allies,rivals))return true;"],
 ['world-offensive-quality-v157.js',"random()<v115DecisionChance(p,'cross',.55)","random()<v115DecisionChance(p,'cross',.75)"],
 ['world-football-flow-v159.js',"const dx=(goal.x-p.x)*s.x,dy=(goal.y-p.y)*s.y,gap=Math.hypot(dx,dy)||1,probe=v159Point({x:p.x+dx/gap*5/s.x,y:p.y+dy/gap*5/s.y},s,.5);","const wideRun=Math.abs(p.x-.5)*s.x>8&&range>14,aim=wideRun?{x:p.x+(.5-p.x)*.12,y:goal.y-(p.t===0?-1:1)*5/s.y}:goal,dx=(aim.x-p.x)*s.x,dy=(aim.y-p.y)*s.y,gap=Math.hypot(dx,dy)||1,probe=v159Point({x:p.x+dx/gap*5/s.x,y:p.y+dy/gap*5/s.y},s,.5);"],
 ['world-football-flow-v159.js',"if(!blocked&&!better){m.attackFlow.carry={playerId:p.pid,target:goal,until:v152Seconds(m)+.34};","if(!blocked&&!better){m.attackFlow.carry={playerId:p.pid,target:aim,until:v152Seconds(m)+.34};"]];
// gk: goalkeeping decides hand reach, reaction and lateral speed on the shot lane.
variants.gk=[['match-shot-choice-v159.js',"reaction=Math.max(.12,.28-ability(keeper,'gk')*.005),time=range*q/27,reach=(typeof v160KeeperHands!=='function'||v160KeeperHands(m,keeper,contact)?.8:0)+Math.max(0,time-reaction)*(2.6+ability(keeper,'spd')*.065),margin=gap-reach;","reaction=Math.max(.08,.30-ability(keeper,'gk')*.011),time=range*q/27,reach=(typeof v160KeeperHands!=='function'||v160KeeperHands(m,keeper,contact)?.55+ability(keeper,'gk')*.035:0)+Math.max(0,time-reaction)*(2.6+ability(keeper,'spd')*.065+ability(keeper,'gk')*.08),margin=gap-reach;"]];
// teleport: free-kick/offside formations snap to their destinations; shorter foul scene and lock.
variants.teleport=[
 ['pitch-v57.js',"if(world||foul)v55Approach(player,target,realDelta*(foul?.6:1));else{","if(world)v50Spot(player,target);else if(foul)v55Approach(player,target,realDelta*.6);else{"],
 ['player-ball-events-v111.js',"foul.piece.wait=Math.max(foul.piece.wait,3.8)","foul.piece.wait=Math.max(foul.piece.wait,2.2)"],
 ['player-ball-events-v111.js',"v102Clock(current)-f.at<2.7&&","v102Clock(current)-f.at<1.8&&"],
 ['player-ball-events-v111.js',"age>=2.7||","age>=1.8||"],
 ['player-ball-events-v111.js',"progress:Math.max(0,age/2.7)","progress:Math.max(0,age/1.8)"],
 ['pitch-v57.js',"const remaining=Math.max(...[...targets].map(([p,t])=>Math.hypot(","const remaining=Math.max(0,...[...targets].filter(([p])=>!(typeof v113FoulLocked==='function'&&v113FoulLocked(m,p))).map(([p,t])=>Math.hypot("]];
// b03soft: longer contact window between per-tick challenges and slower pressing pace.
variants.b03soft=[
 ['world-football-flow-v159.js',"v102Clock(m)-m.attackFlow.challengeAt<.25)return false;","v102Clock(m)-m.attackFlow.challengeAt<.40)return false;"],
 ['world-offensive-quality-v157.js',"purposeful?(revised?1.58:1.48)","purposeful?(revised?1.45:1.48)"]];
// rebound: blocks deflect more often toward the goal line, keeper parries go out more often, parries more frequent.
variants.rebound=[
 ['set-pieces-v50.js',"const endY=point.y+forward*(random()-.3)*.3;","const endY=point.y+forward*(random()-.2)*.3;"],
 ['world-ball-motion-v110.js',"out=random()<.28,","out=random()<.38,"],
 ['pitch-v55.js',"return clamp(.30+(20-ability(keeper,'gk'))*.013","return clamp(.38+(20-ability(keeper,'gk'))*.013"]];
variants['si-brain']=[...variants.decide,...variants.risk,...variants.runners2,...variants.offers,...variants.cross];
variants['si-move']=[...variants.carrier145,...variants.turn];
variants['si-attack']=[...variants['si-brain'],...variants['si-move']];
variants['si-attack-gk']=[...variants['si-attack'],...variants.gk,...variants.aim];
variants['si-full50']=[...variants['si-attack-gk'],...variants.speed50,...variants.teleport,...variants.rebound];
variants['si-full45']=[...variants['si-attack-gk'],...variants.speed45,...variants.teleport,...variants.rebound];
variants['si-full42']=[...variants['si-attack-gk'],...variants.speed42,...variants.teleport,...variants.rebound];
variants['si-full50-b03soft']=[...variants['si-full50'],...variants.b03soft];
variants['si-full50-c160']=[...variants['si-brain'],...variants.carrier160,...variants.turn,...variants.gk,...variants.aim,...variants.speed50,...variants.teleport,...variants.rebound];
variants['speed50-teleport']=[...variants.speed50,...variants.teleport];
// Nachserie: Maximalpaket, langsamere Uhr, großfeld-skalierte Reichweiten.
variants.speed40=[['game.js','const MATCH_SPEED=.78;','const MATCH_SPEED=.40;']];
variants['si-full40']=[...variants['si-attack-gk'],...variants.speed40,...variants.teleport,...variants.rebound];
variants['si-max42']=[...variants['si-brain'],...variants.carrier160,...variants.turn,...variants.gk,...variants.aim,...variants.speed42,...variants.teleport,...variants.rebound,...variants.b03soft];
// scale: pass reach and run leads grow with the field (44 m -> factor 1, 52.8 m -> 1.2); replaces risk[0] and adds the lead scaling.
variants.scalePass=[['world-offensive-quality-v157.js',"o.distance>=3&&o.distance<=(m.teamDirect?.[p.t]?25:20)&&v157Lane(m,p,o.target,rivals)","o.distance>=3&&o.distance<=(m.teamDirect?.[p.t]||p.tacticalRole==='playmaker'||ability(p,'pas')>=14?26:20)*(v150Scale().x/48.53)&&v157Lane(m,p,o.target,rivals,p.tacticalRole==='playmaker'||ability(p,'pas')>=14?1.0:1.4)"],
 ['world-football-flow-v159.js',"lead=(hasInstruction(p,'deep')?8:6.5)+ability(p,'pos')*.07;","lead=((hasInstruction(p,'deep')?8:6.5)+ability(p,'pos')*.07)*(v150Scale().x/48.53);"],
 ['world-space-passes-v150.js',"if(range<8||range>32||gain<3)continue;","if(range<8||range>32*(v150Scale().x/48.53)||gain<3)continue;"]];
variants['si-full45-scale']=[...variants['si-full45'].filter(r=>r[1]!==variants.risk[0][1]),...variants.scalePass];
variants['si-full42-b03soft']=[...variants['si-full42'],...variants.b03soft];
// skillgate: decision quality itself depends on abilities (applied after decide/risk): weak decision-makers accept
// worse shots relative to the best pass, weak passers need wider lanes.
variants.skillgate=[['world-offensive-quality-v157.js',"shot>=passValue*.7&&random()<Math.min(.95,shot*2.2+","shot>=passValue*(.5+ability(p,'dec')*.02)&&random()<Math.min(.95,shot*2.2+"],
 ['world-offensive-quality-v157.js',"v157Lane(m,p,o.target,rivals,p.tacticalRole==='playmaker'||ability(p,'pas')>=14?1.0:1.4)","v157Lane(m,p,o.target,rivals,clamp(1.4-(ability(p,'pas')-10)*.05-(p.tacticalRole==='playmaker'?.2:0),.9,1.7))"]];
variants['si-max42-skill']=[...variants['si-max42'],...variants.skillgate];
// norisk: the maximal package without the blanket risk lever (risk alone cost shots, goals and favourite wins).
variants['si-max42-norisk']=variants['si-max42'].filter(r=>!variants.risk.some(x=>x[1]===r[1]));`);
rep(`const frozen=Object.fromEntries(['game.js','world-offensive-quality-v157.js','world-football-flow-v159.js','pitch-v55.js','pitch-v56.js','set-pieces-v50.js','world-physical-v65.js'].map(`,
`const frozen=Object.fromEntries(['game.js','world-offensive-quality-v157.js','world-football-flow-v159.js','pitch-v55.js','pitch-v56.js','pitch-v57.js','set-pieces-v50.js','world-physical-v65.js','match-shot-choice-v159.js','player-ball-events-v111.js','world-space-passes-v150.js','world-ball-motion-v110.js'].map(`);
rep(`const statKeys=['shots','onTarget','goals','passes','passComplete','duels','duelsWon','tackleAttempts','tacklesWon','slideAttempts','slideWon','fouls','interceptions','saves','faced','headers','volleys','shotGoals','nonShotGoals','savesCaught','savesParried','shotsInterrupted'];`,
`const statKeys=['shots','onTarget','goals','passes','passComplete','duels','duelsWon','tackleAttempts','tacklesWon','slideAttempts','slideWon','fouls','interceptions','saves','faced','headers','volleys','shotGoals','nonShotGoals','savesCaught','savesParried','shotsInterrupted','crosses','crossComplete','highPasses','highComplete','headerPasses','aerialDuels','progressive','passLost'];`);
rep(`const goals=ledger.filter(e=>e.kind==='goal').map(e=>({team:e.team,result:e.result,source:e.source,at:e.at}));`,
`const goals=ledger.filter(e=>e.kind==='goal').map(e=>({team:e.team,result:e.result,source:e.source,at:e.at}));
  const byId=new Map(ledger.map(e=>[e.id,e])),fromShot=e=>{let x=byId.get(e.parentId);for(let i=0;i<3&&x;i++){if(x.shot)return true;x=byId.get(x.parentId);}return false;},rebounds=ledger.filter(e=>e.kind==='loose-ball'&&fromShot(e)).length,shotResults={};for(const e of ledger.filter(e=>e.shot)){shotResults[e.result||'?']=(shotResults[e.result||'?']||0)+1;}
  const extras={rebounds,shotResults,corners:m.setPieceStats.corners[0]+m.setPieceStats.corners[1],freeKicks:m.setPieceStats.freeKicks[0]+m.setPieceStats.freeKicks[1],penalties:m.setPieceStats.penalties[0]+m.setPieceStats.penalties[1],flights:Object.fromEntries(['pass','highPass','cross','header','shot','block','goalKick','throw'].map(k=>[k,ledger.filter(e=>e.kind===k&&e.intent!=='space').length])),spacePasses:ledger.filter(e=>e.intent==='space').length,spaceReceived:ledger.filter(e=>e.intent==='space'&&e.result==='received').length,crossComplete:ledger.filter(e=>e.kind==='cross'&&(e.result==='received'||e.result==='goal')).length,crossProbe:window.__crossProbe?{...window.__crossProbe}:null};if(window.__crossProbe)window.__crossProbe=null;`);
rep(`return{integrity,engineError,clubId,size,seed,fixtureId:fixture.id,`,`return{integrity,engineError,extras,clubId,size,seed,fixtureId:fixture.id,`);
// Umsetzungsplan-Nachmessung (docs/spielerintelligenz-umsetzungsplan-2026-10-14.md): placement-coupled
// shot outcome and rebound finishing on top of si-max42-norisk (same seeds, paired).
rep(`variants['si-max42-norisk']=variants['si-max42'].filter(r=>!variants.risk.some(x=>x[1]===r[1]));`,
`variants['si-max42-norisk']=variants['si-max42'].filter(r=>!variants.risk.some(x=>x[1]===r[1]));
// place: on target = actual placement inside the mouth and no height miss (quality, pressure and calm coupled);
// goal = placed point unreachable for the keeper (no blanket goal roll, no central-keeper rule); lateral scatter
// grows with range; keeper reach uses a shot speed of 21+0.4 fin+0.2 tec m/s (flight visuals unchanged).
variants.place=[
 ['match-shot-choice-v159.js',"reaction=Math.max(.08,.30-ability(keeper,'gk')*.011),time=range*q/27,","reaction=Math.max(.08,.30-ability(keeper,'gk')*.011),time=range*q/(p.keeper?27:21+ability(p,'fin')*.4+ability(p,'tec')*.2),"],
 ['match-shot-choice-v159.js',"const spread=(.012+(1-quality)*.085+Math.min(2,pressure)*.012+Math.max(0,range-16)*.001)*44/","const spread=(.012+(1-quality)*.085+Math.min(2,pressure)*.012*(1.4-(ability(p,'calm')||10)/20))*(.55+range/26)*44/"],
 ['pitch-v55.js',"const onTarget=random()<clamp((.36+fin*.019+tech*.004-pressure*.004)*rangeAccuracy,world?.08:.22,.82)&&(!advanced||v159WithinMouth(goalPoint));","const vRoll=random(),shotQ=clamp((fin*.7+tech*.3)/20,0,1),overP=clamp(.16+(1-shotQ)*.5*Math.max(.6,range/18)+pressure*.003*(1.4-(ability(shooter,'calm')||10)/20),.08,.7),onTarget=advanced?vRoll>=overP&&v159WithinMouth(goalPoint):vRoll<clamp((.36+fin*.019+tech*.004-pressure*.004)*rangeAccuracy,world?.08:.22,.82)&&(!advanced||v159WithinMouth(goalPoint));"],
 ['pitch-v55.js',"let goal=onTarget&&goalRoll<clamp(","let goal=!advanced&&onTarget&&goalRoll<clamp("]];
// follow: a field player who wins a loose ball last touched by the opponent (parry, block, clearance) within 18 m
// tries the native one-touch finish (shot or lay-off), not only with an open goal; keeper parries land wider and
// further from the keeper (less immediate re-collection).
variants.follow=[
 ['world-ball-motion-v110.js',"const result=v110BaseChase(delta,positions),winner=current?.owner;","const touchBefore=current?.lastTouch,result=v110BaseChase(delta,positions),winner=current?.owner;"],
 ['world-ball-motion-v110.js',"if(v65WorldActive&&r&&!current.rebound&&winner&&!winner.keeper&&!current.flight&&v131OpenGoal(winner,{x:r.x,y:r.y})){","if(v65WorldActive&&r&&!current.rebound&&winner&&!winner.keeper&&!current.flight&&(v131OpenGoal(winner,{x:r.x,y:r.y})||v115GoalDistance(winner)<18&&touchBefore!==undefined&&touchBefore!==winner.t)){"],
 ['world-ball-motion-v110.js',"spread=.055+random()*.07,","spread=.07+random()*.08,"],
 ['world-ball-motion-v110.js',"y:out?line:clamp(point.y+away*.075,","y:out?line:clamp(point.y+away*.10,"]];
variants['si-place']=[...variants['si-max42-norisk'],...variants.place];
variants['si-follow']=[...variants['si-max42-norisk'],...variants.follow];
variants['si-place-follow']=[...variants['si-max42-norisk'],...variants.place,...variants.follow];
// max36: si-max42-norisk with clock rate 0.36 (duration target about 5 min, same behaviour).
variants.speed36=[['game.js','const MATCH_SPEED=.78;','const MATCH_SPEED=.36;']];
variants['si-max36-norisk']=[...variants['si-max42-norisk'].filter(r=>r[2]!=='const MATCH_SPEED=.42;'),...variants.speed36];`);
fs.writeFileSync(dst+'.tmp',t);fs.renameSync(dst+'.tmp',dst);console.log('written',dst);
