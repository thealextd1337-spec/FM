'use strict';
// Marked high/falling-ball proxy near both touchlines, using the existing air
// scene and native ballistic/contact controllers. No B10 corner implementation.
const fs=require('node:fs'),cp=require('node:child_process'),{create}=require('./native182-scenes.cjs');
const before=cp.execFileSync('git',['show','094adb96:dist/world-football-flow-v159.js'],{encoding:'utf8'}),oldChase=before.slice(before.indexOf('function v182LooseChasing('),before.indexOf('// Defensive pursuit'));
const h=create({view:false}),newChase=h.evaluate('v182LooseChasing').toString();
const rows=[];for(const version of ['before','after']){h.run(version==='before'?oldChase:newChase);
 for(const size of ['standard','large'])for(const team of [0,1])for(let seed=0;seed<100;seed++)rows.push(h.copy(h.evaluate(`(()=>{
  const config=${JSON.stringify({size,team,seed,marker:true,kind:'air'})},s=Native182.looseScene(config).s,r=match.rebound,air=v124AirBalls.get(match),side=config.seed%2?1:-1,fall=(air.vh+Math.sqrt(air.vh*air.vh+19.6*(air.height-.29)))/9.8;
  // Aim the first bounce 0.5..4 m inside a touchline. Sideways residual
  // velocity 2..6 m/s can take an unclaimed second ball out of play.
  const speed=2+(config.seed%5),buffer=.5+(config.seed%8)*.5;r.x=(side>0?v55Field.right:v55Field.left)-side*(buffer+speed*fall)/s.x;r.y=.38+(config.seed%7)*.04;r.vx=side*speed/s.x/MATCH_SPEED;r.vy=0;match.ball={x:r.x,y:r.y};
  let ticks=0,unreached=null,firstDistance=null,firstPaces=null;while(ticks++<200&&!match.owner&&!match.throwIn&&!match.setPiece&&!match.kickoff){const impacts=air.impacts;Native182.advance();if(!firstPaces&&r.chase?.airPids){firstPaces=v132AirChasers.get(match)?.runners.map(p=>{const reads=match.attackFlow.defenseReads;match.attackFlow.defenseReads={};const pace=v157Pace(match,p);match.attackFlow.defenseReads=reads;return {pid:p.pid,pace,expected:v182ChasePace(p)};});}if(unreached===null&&air.impacts>impacts){firstDistance=Math.min(...match.people.filter(p=>!p.keeper).map(p=>v122Metres(p,r)));unreached=firstDistance>1;}}
  return {version:'${version}',...config,unreached,firstDistance,firstPaces,end:match.owner?'owner':match.throwIn||match.setPiece||match.kickoff?'out':'timeout',seconds:ticks*.05};})()`)));
}
const summary=['before','after'].map(version=>{const list=rows.filter(r=>r.version===version),landed=list.filter(r=>r.unreached!==null);return {version,n:list.length,landed:landed.length,unreached:landed.filter(r=>r.unreached).length,unreachedThenOut:list.filter(r=>r.unreached&&r.end==='out').length,out:list.filter(r=>r.end==='out').length,timeouts:list.filter(r=>r.end==='timeout').length,seconds:list.reduce((s,r)=>s+r.seconds,0)/list.length};});
const report={scope:'Paired sprint-factor attribution on 400 marked high/falling balls near touchlines. B10 corner code absent; not a direct measurement of its reported 16.5%.',summary,rows};fs.mkdirSync('outputs/match-v182/review',{recursive:true});fs.writeFileSync('outputs/match-v182/review/air-followups.json',JSON.stringify(report,null,1));console.log(JSON.stringify({summary,paceBefore:rows[0].firstPaces,paceAfter:rows[400].firstPaces}));if(summary.some(r=>r.timeouts))process.exitCode=1;
