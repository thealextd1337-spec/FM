'use strict';
// Spielerintelligenz-Analyse (Release 132): generated from work/measure-p01-r132.cjs by
// work/patch-si-harness.cjs. Adds prototype variants (decision model, off-ball offers,
// keeper, set-piece teleport) and extra metrics (rebounds, corners, crosses, shot results).
// Complete native physical matches from real expansion12 careers (production player model).
// dist/ is never written. Prototype variants patch an in-memory COPY of single
// dist files and serve it under /v/<variant>/ only for the measuring browser.
//
// Usage (Node >= 20, ports 4250-4259):
//   node work/measure-si-r132.cjs --variant=baseline --clubs=96 --sizes=standard,large --workers=6 --port=4260
//   node work/measure-si-r132.cjs --variant=si-full50 --clubs=96 --port=4261
//   Ports 4260-4269; results in outputs/si-r132/<variant>.json
//   --instrument=0 runs without observers (determinism check), --dt=0.04 uses 40 ms steps.
//   --seedPrefix=p01f1 new career seeds; --only=ENG-1|large,... job filter; --sequence=... ordered jobs.
//   Diagnosis of the first harness version (see doc 2.10): --legacyAsync=1 (await between market
//   days), --settle=0 (no wait after load), --recycle=1 (fresh page per match), --models=block,
//   --wallclock=never|every|ms:<n> (controls performance.now for the 700 ms autosave).
// Integrity fields per match: steps while not live, swapped Math.random/match, stall/error diagnosis.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
const arg=(name,fallback)=>{const hit=process.argv.find(a=>a.startsWith('--'+name+'='));return hit?hit.slice(name.length+3):fallback;};
const variantName=arg('variant','baseline'),clubCount=+arg('clubs','96'),sizes=arg('sizes','standard,large').split(','),workers=+arg('workers','4'),port=+arg('port','4260');
const recycle=+arg('recycle','12'),legacyAsync=arg('legacyAsync','0')==='1',sequence=arg('sequence','').split(',').filter(Boolean),clockMode=arg('wallclock','natural'),models=arg('models','normal'),settle=+arg('settle','1500'),only=arg('only','').split(',').filter(Boolean),seedPrefix=arg('seedPrefix','p01r132'),boostArg=arg('boost',''),instrument=arg('instrument','1')!=='0',dt=+arg('dt','0.05'),clubOffset=+arg('offset','0');
const out=arg('out',path.join(root,'outputs/si-r132',`${variantName}${boostArg?'-boost-'+boostArg.replace(/[:,]/g,'_'):''}${instrument?'':'-noinst'}${seedPrefix!=='p01r132'?'-'+seedPrefix:''}${models!=='normal'?'-models-'+models:''}${settle!==1500?'-settle'+settle:''}${clockMode!=='natural'?'-wall-'+clockMode.replace(':',''):''}${legacyAsync?'-legacyasync':''}${sequence.length?'-seq':''}${dt!==.05?'-dt'+dt:''}.json`));
assert(port>=4260&&port<=4269,'Port range 4260-4269');

// ---------------------------------------------------------------------------
// Prototype variants: exact single-occurrence string replacements in a copy.
// Every replacement is asserted to match exactly once in the current dist file.
const variants={
 baseline:[],
 // Slower match clock: same 2x45 virtual minutes, more real seconds per minute.
 speed60:[['game.js','const MATCH_SPEED=.78;','const MATCH_SPEED=.60;']],
 speed52:[['game.js','const MATCH_SPEED=.78;','const MATCH_SPEED=.52;']],
 speed45:[['game.js','const MATCH_SPEED=.78;','const MATCH_SPEED=.45;']],
 // Shot window: 22 m -> 26 m and a gentler quality falloff (open-play decision only).
 window26:[['world-offensive-quality-v157.js',"if(depth<1||range>22||lateral>depth*.85+1)return 0;","if(depth<1||range>26||lateral>depth*.85+1)return 0;"],
  ['world-offensive-quality-v157.js',"return clamp((22-range)/12,0,1)*(.55+(ability(p,'fin')+ability(p,'tec'))/80);","return clamp((26-range)/14,0,1)*(.55+(ability(p,'fin')+ability(p,'tec'))/80);"]],
 // Shot willingness: take a useful window more readily and let attackers
 // evaluate a real window before the forced carry toward goal.
 willing:[['world-offensive-quality-v157.js',"if(shot>0&&(range<=14||random()<Math.max(v145ShotChance(p,rivals),shot*.65))){v55Shoot(p);return true;}","if(shot>0&&(range<=16||random()<Math.max(v145ShotChance(p,rivals),shot*1.1))){v55Shoot(p);return true;}"],
  ['world-football-flow-v159.js',"if(p===m.owner&&line==='att'&&!v159Cover(p)&&range>12&&range<30){","if(p===m.owner&&line==='att'&&!v159Cover(p)&&range>12&&range<30&&!(typeof v157ShotQuality==='function'&&v157ShotQuality(p,rivals)>.18)){"]],
 // Narrower blocking test for the decision lane (actual blocks in v55Shoot unchanged).
 lane10:[['world-offensive-quality-v157.js',"if(rivals.some(r=>!r.keeper&&!r.slideActive&&(()=>{const lane=passLaneGeometry(r,p,goal);return lane&&v122Metres(r,lane)<1.4;})()))return 0;","if(rivals.some(r=>!r.keeper&&!r.slideActive&&(()=>{const lane=passLaneGeometry(r,p,goal);return lane&&v122Metres(r,lane)<1.0;})()))return 0;"]],
};
// Shot execution: smaller aiming spread (fewer wide misses, finishing still scales).
variants.aim=[['match-shot-choice-v159.js',"const spread=(.018+(1-quality)*.13+Math.min(2,pressure)*.012+Math.max(0,range-16)*.001)","const spread=(.012+(1-quality)*.085+Math.min(2,pressure)*.012+Math.max(0,range-16)*.001)"]];
// Keeper reach: larger hand reach and a goalkeeping-dependent lateral term (keeper skill matters more).
variants.keeper=[['match-shot-choice-v159.js',"v160KeeperHands(m,keeper,contact)?.8:0)+Math.max(0,time-reaction)*(2.6+ability(keeper,'spd')*.065)","v160KeeperHands(m,keeper,contact)?1.1:0)+Math.max(0,time-reaction)*(2.6+ability(keeper,'spd')*.065+ability(keeper,'gk')*.05)"]];
// Faster regular free kicks: shorter foul scene (lock 2.7 s stays) and quicker walk to the formation.
variants.fastRestart=[['player-ball-events-v111.js','foul.piece.wait=Math.max(foul.piece.wait,3.8)','foul.piece.wait=Math.max(foul.piece.wait,2.8)'],['pitch-v57.js',"/(3+ability(p,'spd')*.14)));if(remaining>.05)piece.wait=Math.max(piece.wait,remaining+.15)","/(4.5+ability(p,'spd')*.14)));if(remaining>.05)piece.wait=Math.max(piece.wait,remaining+.15)"]];
// Ball carrier pace (v162 path only): 1.28 -> 1.45 times base; pressing defenders keep 1.58.
variants.carrier145=[['world-offensive-quality-v157.js',"m.owner===p?1.28*(.78+ability(p,'tec')*.009)","m.owner===p?1.45*(.78+ability(p,'tec')*.009)"]];
// Pass preparation: release within 0.55 rad and up to 2.5 m/s instead of braking to 1.2 m/s at 0.30 rad.
variants.turn=[['world-offensive-quality-v157.js',"if(Math.abs(v157Angle(body.heading,angle))>.30||Math.hypot(body.vx,body.vy)>1.2){m.next=m.elapsed+.04*MATCH_SPEED;return true;}","if(Math.abs(v157Angle(body.heading,angle))>.55||Math.hypot(body.vx,body.vy)>2.5){m.next=m.elapsed+.04*MATCH_SPEED;return true;}"]];
variants.attack=[...variants.window26,...variants.willing,...variants.lane10];
variants['speed60-attack']=[...variants.speed60,...variants.attack];
variants['speed52-attack']=[...variants.speed52,...variants.attack];
variants['speed60-window26']=[...variants.speed60,...variants.window26];
variants['speed52-attack-aim-keeper']=[...variants.speed52,...variants.attack,...variants.aim,...variants.keeper];
variants['speed45-attack-aim-keeper-fast']=[...variants.speed45,...variants.attack,...variants.aim,...variants.keeper,...variants.fastRestart];
variants['speed52-attack-aim-keeper-fast']=[...variants.speed52,...variants.attack,...variants.aim,...variants.keeper,...variants.fastRestart];
variants['aim-keeper']=[...variants.aim,...variants.keeper];
variants['carrier-turn']=[...variants.carrier145,...variants.turn];
variants.carrier160=[['world-offensive-quality-v157.js',"m.owner===p?1.28*(.78+ability(p,'tec')*.009)","m.owner===p?1.6*(.78+ability(p,'tec')*.009)"]];
variants['speed45-full']=[...variants.speed45,...variants.attack,...variants.aim,...variants.keeper,...variants.carrier145,...variants.turn];
variants['speed45-full-c160-nob03']=[...variants.speed45,...variants.attack,...variants.aim,...variants.keeper,...variants.carrier160,...variants.turn];
variants['speed52-full']=[...variants.speed52,...variants.attack,...variants.aim,...variants.keeper,...variants.fastRestart,...variants.carrier145,...variants.turn];
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
// Setup-only variant: remove the B03 pursuit marker right after creation (pre-B03 defence).
const setupVariants={'speed45-full-c160-nob03':{deletePursuit:true},'no-b03':{deletePursuit:true},'no-b03-b12':{deletePursuit:true,deleteLoose:true}};
const replacements=variants[variantName]||(setupVariants[variantName]?[]:null);
assert(replacements,'Unknown variant '+variantName);
const overlay=new Map();
for(const [file,from,to] of replacements){
 const text=overlay.get(file)??fs.readFileSync(path.join(dist,file),'utf8'),count=text.split(from).length-1;
 assert.equal(count,1,`Replacement must match exactly once in ${file}: ${from.slice(0,80)}`);
 overlay.set(file,text.replace(from,to));
}
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const frozen=Object.fromEntries(['game.js','world-offensive-quality-v157.js','world-football-flow-v159.js','pitch-v55.js','pitch-v56.js','pitch-v57.js','set-pieces-v50.js','world-physical-v65.js','match-shot-choice-v159.js','player-ball-events-v111.js','world-space-passes-v150.js','world-ball-motion-v110.js'].map(f=>[f,sha(fs.readFileSync(path.join(dist,f)))]));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.glb':'model/gltf-binary','.wav':'audio/wav','.wasm':'application/wasm'};
const server=http.createServer((req,res)=>{
 const rel=decodeURIComponent(new URL(req.url,'http://x').pathname),m=/^\/v\/([^/]+)\/(.*)$/.exec(rel);
 if(!m){res.writeHead(404);res.end();return;}
 const file=path.resolve(dist,m[2]);if(!file.startsWith(dist+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');
 const name=path.relative(dist,file).replaceAll('\\','/');if(overlay.has(name)){res.end(overlay.get(name));return;}
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

const runMatch=async({clubId,size,seed,dt,instrument,boost,setup,clockMode,legacyAsync})=>{
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
  // legacyAsync reproduces the first harness version (await between market days).
  for(let i=0;i<40&&['open','deadline'].includes(c.world.market?.phase);i++){if(legacyAsync){const ret=v66NextMarketDay(c);if(integrity.setupYield===null)integrity.setupYield=ret&&typeof ret.then==='function'?'promise':typeof ret;await ret;}else v66NextMarketDay(c);}
  const fixture=v64AdvanceToOwnMatch(c);if(!fixture)throw Error('no own fixture');
  const state=c.world.activeMatch.state;
  const boosted={};if(boost){const club=c.world.clubs.find(x=>x.id===(boost.side==='own'?own.id:(fixture.homeId===own.id?fixture.awayId:fixture.homeId)));for(const p of club.roster){boosted[p.pid]=null;if(p.keeper&&boost.key!=='gk')continue;if(!p.keeper&&boost.key==='gk')continue;p[boost.key]=Math.min(20,p[boost.key]+boost.delta);boosted[p.pid]=p[boost.key];if(p.playerModel?.caps)p.playerModel.caps[boost.key]=Math.max(p.playerModel.caps[boost.key]||0,p[boost.key]);}}
  v61CurrentCareer=c;state.phase='paused';match=null;v65WorldActive=null;v98View='2d';v65Show(v65Context());clearInterval(v65WorldFrame);v103CanReplay=()=>false;draw=()=>{};
  const m=match,ctx0=v65Context(),ownSide=ctx0.ownSide,setupMs=realNow()-t0;
  if(setup?.deletePursuit)delete m.attackFlow.pursuitRevision;if(setup?.deleteLoose)delete m.attackFlow.looseBallRevision;
  const markers={looseBall:m.attackFlow.looseBallRevision??null,pursuit:m.attackFlow.pursuitRevision??null,pace:m.attackFlow.paceRevision??null,flow:m.attackFlow.flowVersion??null,shotBalance:state.playerPerformance?.shotBalanceRevision??null,matchSpeed:MATCH_SPEED};
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
   step(dt*MATCH_SPEED,dt);
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
   digest:JSON.stringify({score:m.score,ticks,draws,shots:teams.map(t=>t.stats.shots),passes:teams.map(t=>t.stats.passes),elapsed:m.elapsed})};
 }finally{performance.now=originalNow;Math.random=random;Date.now=dateNow;if(window.__p01)window.__p01.rec=null;running=false;clearInterval(v65WorldFrame);}
};

async function openPage(browser){
 const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 if(models==='block')await page.route('**/players/football-v130.glb',r=>r.fulfill({status:404,body:''}));
 await page.goto(`http://127.0.0.1:${port}/v/${variantName}/index.html?engine=2d`,{timeout:180000});
 await page.waitForFunction(()=>typeof D6Expansion?.createCareer==='function'&&typeof v65CreateMatch==='function'&&typeof v157Decide==='function',null,{timeout:180000});
 await page.evaluate(`window.__p01Install=${installObservers.toString()};`);if(settle>0)await page.waitForTimeout(settle);
 return{context,page,errors};
}

(async()=>{
 await new Promise(r=>server.listen(port,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--disable-gpu']});
 const report={legacyAsync,sequence,wallclock:clockMode,models,settle,harness:'sync-2',variant:variantName,boost:boostArg||null,instrument,dt,replacements:replacements.map(([f,a,b])=>({file:f,from:a,to:b})),setup:setupVariants[variantName]||null,distHashes:frozen,date:new Date().toISOString(),scope:'Real expansion12 careers (D6Expansion.createCareer), production player model, first own competitive fixture via v64AdvanceToOwnMatch; native browser engine, fixed dt steps, auto-resume at half-time (no tactic pauses).',matches:[],failures:[]};
 try{
  const catalog=await (async()=>{const {context,page}=await openPage(browser);const list=await page.evaluate(()=>D6Expansion.catalog().filter(c=>c.playable!==false&&!c.id.includes('-C')).map(c=>c.id));await context.close();return list;})();
  // Spread selection across countries: interleave club index within each country.
  const byCountry={};for(const id of catalog)(byCountry[id.slice(0,3)]??=[]).push(id);
  const order=[];for(let i=0;i<8;i++)for(const c of Object.keys(byCountry))if(byCountry[c][i])order.push(byCountry[c][i]);
  const clubs=order.slice(clubOffset,clubOffset+clubCount);
  const boost=boostArg?{side:'own',key:boostArg.split(':')[0],delta:+boostArg.split(':')[1]}:null;
  const jobs=[];if(sequence.length)for(const item of sequence){const [clubId,size]=item.split('|');jobs.push({clubId,size,seed:`${seedPrefix}-${clubId}`});}else for(const size of sizes)for(const clubId of clubs)if(!only.length||only.includes(clubId+'|'+size))jobs.push({clubId,size,seed:`${seedPrefix}-${clubId}`});
  console.log(JSON.stringify({variant:variantName,boost,jobs:jobs.length,workers}));
  let next=0,done=0;
  const worker=async(w)=>{let ctx=await openPage(browser),used=0;
   while(next<jobs.length){const job=jobs[next++];
    if(used>=recycle){await ctx.context.close();ctx=await openPage(browser);used=0;}
    try{const row=await ctx.page.evaluate(runMatch,{...job,dt,instrument,boost,setup:setupVariants[variantName]||null,clockMode,legacyAsync});row.errors=ctx.errors.splice(0);row.digestSha=sha(row.digest);delete row.digest;report.matches.push(row);used++;
     done++;console.log(`${row.engineError?'ENGINEERROR ':''}${row.stall?'STALL ':''}${done}/${jobs.length} w${w} ${job.size} ${job.clubId} ${row.score.join(':')} ${(row.realSeconds/60).toFixed(2)}min shots=${row.teams[0].stats.shots+row.teams[1].stats.shots} setup=${row.setupMs}ms sim=${row.computeMs}ms`);}
    catch(e){report.failures.push({...job,error:String(e.message||e).slice(0,500)});console.log('FAIL',job.clubId,job.size,String(e.message||e).slice(0,200));await ctx.context.close().catch(()=>{});ctx=await openPage(browser);used=0;}
   }
   await ctx.context.close();};
  await Promise.all(Array.from({length:workers},(_,i)=>worker(i)));
  report.matches.sort((a,b)=>a.size.localeCompare(b.size)||a.clubId.localeCompare(b.clubId));
  for(const [f,h]of Object.entries(frozen))assert.equal(sha(fs.readFileSync(path.join(dist,f))),h,'dist unchanged '+f);report.distUnchanged=true;
 }finally{await browser.close();await new Promise(r=>server.close(r));fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report)+'\n');}
 const n=report.matches.length,mean=f=>(report.matches.reduce((s,r)=>s+f(r),0)/n).toFixed(2);
 console.log(JSON.stringify({out,n,failures:report.failures.length,minutes:mean(r=>r.realSeconds/60),shots:mean(r=>r.teams[0].stats.shots+r.teams[1].stats.shots),onTarget:mean(r=>r.teams[0].stats.onTarget+r.teams[1].stats.onTarget),goals:mean(r=>r.score[0]+r.score[1])}));
})().catch(e=>{console.error(e);process.exitCode=1;});
