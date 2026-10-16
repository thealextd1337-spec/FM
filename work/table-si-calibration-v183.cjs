'use strict';
// SI-K evaluation of measure-si-calibration-v183 result files (outputs/si183/<label>.json).
// A run is a comma list of labels (e.g. the three seed sets of a series); the
// matches of all labels are pooled. With a second run the per-match
// differences are paired by seed set, club and pitch size (variant - base, ±95 %).
// Usage: node work/table-si-calibration-v183.cjs <run> [<baseRun>] [--json] [--strength]
//   <run> = label[,label...]; --strength adds the tables per strength gap (SI-6 handover).
// Definitions (plan 2.3, SI-K doc): open play = no penalty, no direct free kick;
// long shot = open-play shot from more than 22 m; finishing grade = shooter fin
// (stored skill); keeper grade = opposing keeper gk; cross arrived = engine
// stat crossComplete / crosses (attacker wins the landing: control, header
// shot or lay-off), open-play crosses exclude corners and free-kick crosses;
// rebound shot = shot of the same team within 5 s after a loose ball from a
// shot (parry, block, post); favourite = higher mean ovr with a gap >= 1.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),outDir=path.join(root,'outputs/si183');
const args=process.argv.slice(2),runs=args.filter(a=>!a.startsWith('--')),json=args.includes('--json'),withStrength=args.includes('--strength');
if(!runs.length){console.error('Usage: node work/table-si-calibration-v183.cjs <label[,label]> [<baseLabel[,label]>] [--json] [--strength]');process.exit(2);}
const load=run=>{const out={labels:run.split(','),matches:[],failures:0,unusable:0,notLive:0,distUnchanged:true};for(const label of out.labels){const rep=JSON.parse(fs.readFileSync(path.join(outDir,label+'.json'),'utf8'));out.failures+=rep.failures.length;out.distUnchanged=out.distUnchanged&&rep.distUnchanged===true;
 for(const r of rep.matches){if(!r.finished||r.engineError||r.stall||!r.rec||!r.extras?.sik){out.unusable++;continue;}if(r.integrity?.notLiveStepTicks>0)out.notLive++;r.seed0=r.seed.split('-')[0];out.matches.push(r);}}return out;};
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:NaN,sd=a=>{const m=mean(a);return a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):NaN;},pct=(a,b)=>b?100*a/b:NaN;
const total=(r,k)=>r.teams[0].stats[k]+r.teams[1].stats[k],goalsOf=r=>r.score[0]+r.score[1];
const isGoal=s=>s.result==='goal'||s.goal===true,onT=s=>s.plannedOnTarget||s.actualOnTarget||['goal','caught','parried'].includes(s.result);
const open=s=>!s.penalty&&s.kind!=='direct-free-kick',fin=s=>s.skills?.fin??NaN,gkOf=s=>s.skills?.gk??NaN;
const rate=(list,pred=isGoal)=>({n:list.length,pct:pct(list.filter(pred).length,list.length)});
// Shot source (first match wins): penalty, direct free kick, header/volley, corner (<=10 s after a corner),
// free-kick follow-up, rebound (<=5 s after a loose ball from a shot of the same team), counter, long shot, other open play.
const source=s=>s.penalty?'penalty':s.kind==='direct-free-kick'?'direct-free-kick':s.kind==='header'||s.kind==='volley'?'header-volley':s.restart?.type==='corner'&&s.restart.ago<=10&&s.restart.team===s.team?'corner':s.restart?.type==='freeKick'&&s.restart.ago<=10&&s.restart.team===s.team?'free-kick-follow':(s.rebound?s.rebound.ago<=5:s.lastLoose&&s.lastLoose.team===s.team&&s.lastLoose.ago<=5)?'rebound':(s.sources||[]).includes('counter')?'counter':s.range>22?'long':'open';
const SOURCES=['open','long','header-volley','rebound','corner','free-kick-follow','counter','direct-free-kick','penalty'];
const fav=(rows,gap,hi=99)=>{const g=rows.filter(r=>{const d=Math.abs(r.teams[0].ovr-r.teams[1].ovr);return d>=gap&&d<hi;});const res=g.map(r=>{const s=r.teams[0].ovr>r.teams[1].ovr?0:1;return Math.sign(r.score[s]-r.score[1-s]);});return{n:g.length,win:pct(res.filter(x=>x>0).length,g.length),draw:pct(res.filter(x=>x===0).length,g.length),loss:pct(res.filter(x=>x<0).length,g.length),goals:mean(g.map(goalsOf)),diff:mean(g.map(r=>{const s=r.teams[0].ovr>r.teams[1].ovr?0:1;return r.score[s]-r.score[1-s];})),shots:mean(g.map(r=>total(r,'shots')))};};
const slope=rows=>{const xs=[],ys=[];for(const r of rows)for(const i of [0,1]){xs.push(r.teams[i].ovr-r.teams[1-i].ovr);ys.push(r.teams[i].score-r.teams[1-i].score);}const mx=mean(xs),my=mean(ys);let a=0,b=0;for(let i=0;i<xs.length;i++){a+=(xs[i]-mx)*(ys[i]-my);b+=(xs[i]-mx)**2;}return b?a/b:NaN;};
const crossesOf=r=>r.extras.sik.crosses,openCross=c=>!c.corner&&!c.restart;
const perMatch={
 minutes:r=>r.realSeconds/60,replaySeconds:r=>Number.isFinite(r.extras.sik.replaySeconds)?r.extras.sik.replaySeconds:NaN,minutesAll:r=>Number.isFinite(r.extras.sik.replaySeconds)?(r.realSeconds+r.extras.sik.replaySeconds)/60:NaN,shots:r=>total(r,'shots'),onTarget:r=>total(r,'onTarget'),goals:goalsOf,saves:r=>total(r,'saves'),
 crossesAll:r=>total(r,'crosses'),crossesOpen:r=>crossesOf(r).filter(openCross).length,crossArrived:r=>total(r,'crossComplete'),crossArrivedOpen:r=>crossesOf(r).filter(c=>openCross(c)&&c.won).length,
 headerVolleyShots:r=>r.rec.shots.filter(s=>s.kind==='header'||s.kind==='volley').length,headerVolleyGoals:r=>r.rec.shots.filter(s=>(s.kind==='header'||s.kind==='volley')&&isGoal(s)).length,
 corners:r=>r.extras.corners,cornerShots10:r=>r.rec.shots.filter(s=>source(s)==='corner').length,freeKicks:r=>r.extras.freeKicks,fouls:r=>total(r,'fouls'),penalties:r=>r.extras.penalties,
 reboundShots:r=>r.rec.shots.some(s=>'rebound' in s)?r.rec.shots.filter(s=>s.rebound&&s.rebound.ago<=5).length:r.extras.offball.reboundShots,reboundShotsDirect:r=>r.extras.offball.reboundShots,rebounds:r=>r.extras.offball.rebounds,reboundWins:r=>r.extras.offball.reboundWins,
 spacePasses:r=>r.extras.spacePasses,spaceReceived:r=>r.extras.spaceReceived,passes:r=>total(r,'passes'),offsides:r=>r.extras.offball.offsides,
 directFk:r=>r.rec.shots.filter(s=>s.kind==='direct-free-kick').length,longShots:r=>r.rec.shots.filter(s=>open(s)&&s.range>22).length,
 carrierSpeed:r=>r.extras.offball.carrierSpeed,carrierMax:r=>r.extras.offball.carrierMax,zone22:r=>(r.rec.zone22[0]+r.rec.zone22[1])/2,
 freshField:r=>{const f=(r.extras.fresh||[]).filter(x=>!x[1]);return f.length?mean(f.map(x=>x[3])):NaN;},freshField911:r=>{const f=(r.extras.fresh||[]).filter(x=>!x[1]&&x[0]>=9&&x[0]<=11);return f.length?mean(f.map(x=>x[3])):NaN;},
 freshKeeper:r=>{const f=(r.extras.fresh||[]).filter(x=>x[1]);return f.length?mean(f.map(x=>x[3])):NaN;},keeperUse:r=>{const f=(r.extras.fresh||[]).filter(x=>x[1]);return f.length?mean(f.map(x=>x[2]-x[3])):NaN;},
 msPerTick:r=>r.computeMs/r.ticks,computeS:r=>r.computeMs/1000
};
function summary(rows){
 const shots=rows.flatMap(r=>r.rec.shots),play=shots.filter(open),stats={};
 for(const [k,f]of Object.entries(perMatch))stats[k]=mean(rows.map(f).filter(Number.isFinite));
 const goals=rows.map(goalsOf),minutes=rows.map(r=>r.realSeconds/60),minutesAll=rows.map(perMatch.minutesAll).filter(Number.isFinite),shotN=rows.map(r=>total(r,'shots'));
 const hist={};for(const g of goals)hist[g]=(hist[g]||0)+1;
 const band=(list,lo,hi)=>list.filter(s=>fin(s)>=lo&&fin(s)<hi);
 const far=play.filter(s=>s.range>22),onTarget=shots.filter(onT);
 const src={};for(const k of SOURCES){const l=shots.filter(s=>source(s)===k);src[k]={perMatch:l.length/rows.length,goalsPerShot:rate(l).pct,n:l.length};}
 const heads=shots.filter(s=>s.kind==='header'||s.kind==='volley'),air=s=>s.skills?.air??NaN;
 const ticks=rows.map(r=>r.computeMs/r.ticks).sort((a,b)=>a-b);
 return{n:rows.length,perMatch:stats,
  minutes:{mean:mean(minutes),in46:pct(minutes.filter(x=>x>=4&&x<=6).length,rows.length),min:Math.min(...minutes),max:Math.max(...minutes),below37:minutes.filter(x=>x<3.7).length},
  minutesAll:minutesAll.length===rows.length?{mean:mean(minutesAll),in46:pct(minutesAll.filter(x=>x>=4&&x<=6).length,rows.length),min:Math.min(...minutesAll),max:Math.max(...minutesAll),below37:minutesAll.filter(x=>x<3.7).length,replayPerGoal:mean(rows.flatMap(r=>r.extras.sik.replays))}:null,
  shotsBand:pct(shotN.filter(x=>x>=10&&x<=18).length,rows.length),onTargetPct:pct(onTarget.length,shots.length),goalsPerShot:pct(shots.filter(isGoal).length,shots.length),goalsPerOnTarget:pct(shots.filter(isGoal).length,onTarget.length),
  goals:{mean:mean(goals),sd:sd(goals),nil:pct(goals.filter(g=>g===0).length,rows.length),b35:pct(goals.filter(g=>g>=3&&g<=5).length,rows.length),ge7:pct(goals.filter(g=>g>=7).length,rows.length),max:Math.max(...goals),hist},
  favourites:fav(rows,1),favourites2:fav(rows,2),slope:slope(rows),
  finishing:{low:rate(band(play,0,10)),mid:rate(band(play,10,14)),high:rate(band(play,14,99)),ratio:rate(band(play,14,99)).pct/rate(band(play,0,10)).pct},
  keeper:{mid:rate(onTarget.filter(s=>gkOf(s)>=10&&gkOf(s)<14)),high:rate(onTarget.filter(s=>gkOf(s)>=14)),low:rate(onTarget.filter(s=>gkOf(s)<10))},
  long:{share:pct(far.length,play.length),fin13:pct(far.filter(s=>fin(s)>=13).length,far.length),high:rate(band(far,14,99)),highOnTarget:rate(band(far,14,99),onT),mid:rate(band(far,10,14)),low:rate(band(far,0,10))},
  aerial:{low:rate(heads.filter(s=>air(s)<10)),mid:rate(heads.filter(s=>air(s)>=10&&air(s)<14)),high:rate(heads.filter(s=>air(s)>=14)),shareHigh:pct(heads.filter(s=>air(s)>=14).length,heads.length)},
  crossArrivedPct:pct(stats.crossArrived*rows.length,stats.crossesAll*rows.length),crossArrivedOpenPct:pct(stats.crossArrivedOpen,stats.crossesOpen),crossLedgerReceivedPct:pct(rows.reduce((s,r)=>s+r.extras.crossComplete,0),rows.reduce((s,r)=>s+r.extras.offball.crosses.length,0)),
  reboundWinPct:pct(stats.reboundWins,stats.rebounds),
  sources:src,personality:personality(rows,shots),scorers:scorers(rows),draws:draws(rows),favFit:favFit(rows),leagueTop:leagueTop(rows),
  airOpenFree:(()=>{const l=shots.filter(s=>(s.kind==='header'||s.kind==='volley')&&s.n25===0&&!(s.restart?.type==='corner'&&s.restart.ago<=10&&s.restart.team===s.team)&&!(s.restart?.type==='freeKick'&&s.restart.ago<=10&&s.restart.team===s.team));return{n:l.length,perShot:pct(l.filter(isGoal).length,l.length),perOnTarget:pct(l.filter(isGoal).length,l.filter(onT).length),goalShare:pct(l.filter(isGoal).length,shots.filter(isGoal).length)};})(),
  airCorner:(()=>{const l=shots.filter(s=>(s.kind==='header'||s.kind==='volley')&&s.restart?.type==='corner'&&s.restart.ago<=10&&s.restart.team===s.team);return{n:l.length,perShot:pct(l.filter(isGoal).length,l.length),perOnTarget:pct(l.filter(isGoal).length,l.filter(onT).length)};})(),
  ticks:{median:ticks[Math.floor(ticks.length/2)],p95:ticks[Math.floor(ticks.length*.95)]}};
}
// Personality: field players with similar finishing, by role and by shoot weight (role x calm/dec).
function personality(rows,shots){
 const players=rows.flatMap(r=>r.extras.sik.players.filter(p=>!p.keeper).map(p=>({...p,longShots:r.rec.shots.filter(s=>s.pid===p.pid&&open(s)&&s.range>22).length})));
 const byRole={};for(const p of players){const k=p.role||'(keine)';(byRole[k]??=[]).push(p);}
 const roleRows=Object.fromEntries(Object.entries(byRole).map(([k,l])=>[k,{n:l.length,fin:mean(l.map(p=>p.fin)),shootWeight:mean(l.map(p=>p.shootWeight)),shots:mean(l.map(p=>p.shots)),longShots:mean(l.map(p=>p.longShots)),goals:mean(l.map(p=>p.goals))}]));
 // Same finishing band 11-14, attackers and midfielders: shots per match by shootWeight tercile.
 const band=players.filter(p=>p.fin>=11&&p.fin<14&&p.shootWeight!=null).sort((a,b)=>a.shootWeight-b.shootWeight),t=Math.floor(band.length/3);
 const terc=[band.slice(0,t),band.slice(t,2*t),band.slice(2*t)].map(l=>({n:l.length,shootWeight:mean(l.map(p=>p.shootWeight)),shots:mean(l.map(p=>p.shots)),longShots:mean(l.map(p=>p.longShots)),fin:mean(l.map(p=>p.fin))}));
 // Calm under pressure: goals per open-play shot with >=1 rival within 2.5 m, calm <10 vs >=12.
 const pressed=shots.filter(s=>open(s)&&s.n25>=1&&s.skills?.calm!=null),lowCalm=rate(pressed.filter(s=>s.skills.calm<10)),highCalm=rate(pressed.filter(s=>s.skills.calm>=12));
 return{byRole:roleRows,shootTerciles:terc,calmPressed:{low:lowCalm,high:highCalm}};
}
// Goal spread (Torjäger round, definitions of the SI-6 review): per team and
// match the field players who played (extras.sik.players); best finisher =
// highest stored fin; shares are pooled (sum of the best finisher's goals /
// sum of team goals from player stats); H = unbiased Herfindahl of a team's
// goals (teams with >=2 goals); top scorer = most goals of one player.
// Groups by the team's own gap (ovr - opponent ovr).
function scorers(rows){
 const groups={all:()=>true,'fav>=3':g=>g>=3,'fav1-2':g=>g>=1&&g<2,'|gap|<1':g=>Math.abs(g)<1},out={};
 for(const [name,pred]of Object.entries(groups)){
  const a={teams:0,shots:0,goals:0,bestShots:0,bestGoals:0,topGoals:0,brace:0,hat:0,hG:[]};
  for(const r of rows)for(const t of [0,1]){
   if(!pred(r.teams[t].ovr-r.teams[1-t].ovr))continue;
   const ps=r.extras.sik.players.filter(p=>p.t===t&&!p.keeper);if(!ps.length)continue;
   const N=ps.reduce((s,p)=>s+p.shots,0),G=ps.reduce((s,p)=>s+p.goals,0),best=ps.reduce((b,p)=>p.fin>b.fin?p:b,ps[0]),top=Math.max(...ps.map(p=>p.goals));
   a.teams++;a.shots+=N;a.goals+=G;a.bestShots+=best.shots;a.bestGoals+=best.goals;a.topGoals+=top;if(top>=2)a.brace++;if(top>=3)a.hat++;
   if(G>=2)a.hG.push(ps.reduce((s,p)=>s+p.goals*(p.goals-1),0)/(G*(G-1)));
  }
  out[name]={teams:a.teams,goals:a.goals/a.teams,bestShotShare:pct(a.bestShots,a.shots),bestGoalShare:pct(a.bestGoals,a.goals),topScorerShare:pct(a.topGoals,a.goals),topScorerGoals:a.topGoals/a.teams,brace:pct(a.brace,a.teams),hat:pct(a.hat,a.teams),H:mean(a.hG)};
 }
 return out;
}
// Draws overall and by gap class (favourite = higher mean ovr).
function draws(rows){const d=l=>pct(l.filter(r=>r.score[0]===r.score[1]).length,l.length),gap=r=>Math.abs(r.teams[0].ovr-r.teams[1].ovr);
 return{all:d(rows),close:d(rows.filter(r=>gap(r)<1)),gap12:d(rows.filter(r=>gap(r)>=1&&gap(r)<2)),gap23:d(rows.filter(r=>gap(r)>=2&&gap(r)<3)),gap3:d(rows.filter(r=>gap(r)>=3))};}
// Logistic fit of P(favourite wins) on the gap; value at 1.5 and 4 points with
// a bootstrap 95 % interval (300 draws, fixed LCG), as SI-K2.
function favFit(rows){
 const pts=rows.map(r=>{const f=r.teams[0].ovr>r.teams[1].ovr?0:1;return [Math.abs(r.teams[0].ovr-r.teams[1].ovr),r.score[f]>r.score[1-f]?1:0];});if(pts.length<20)return null;
 const fit=list=>{let a=0,b=0;for(let it=0;it<50;it++){let ga=0,gb=0,haa=0,hab=0,hbb=0;for(const [x,y]of list){const q=1/(1+Math.exp(-(a+b*x))),w=q*(1-q);ga+=y-q;gb+=(y-q)*x;haa+=w;hab+=w*x;hbb+=w*x*x;}const det=haa*hbb-hab*hab;if(!det)break;a+=(hbb*ga-hab*gb)/det;b+=(haa*gb-hab*ga)/det;}return [a,b];};
 const at=([a,b],x)=>100/(1+Math.exp(-(a+b*x)));let seed=12345;const rnd=()=>(seed=(Math.imul(seed,1103515245)+12345)>>>0)/4294967296;
 const f=fit(pts),b15=[],b4=[];for(let k=0;k<300;k++){const s=pts.map(()=>pts[Math.floor(rnd()*pts.length)]),g=fit(s);b15.push(at(g,1.5));b4.push(at(g,4));}
 b15.sort((x,y)=>x-y);b4.sort((x,y)=>x-y);return{at15:at(f,1.5),ci15:[b15[7],b15[292]],at4:at(f,4),ci4:[b4[7],b4[292]],n:pts.length};
}
// League top scorer estimate per pitch size: the series clubs form their
// leagues (country prefix of the club id, ovr of the own team record). A
// season is a double round robin; for each fixture of a club the goals of its
// three best finishers come from a team-match of the series with a similar gap
// (one of the 15 nearest by |gap - g|). League top scorer = most goals of one
// such player; mean over leagues and 200 seasons, and the season maximum over
// all leagues (mean). An estimate: club-specific finishers are not kept.
function leagueTop(rows){
 const own=new Map();for(const r of rows){const t=r.teams.find(x=>x.own);if(t)own.set(t.clubId,t.ovr);}
 const leagues={};for(const [id,ovr]of own)(leagues[id.split('-')[0]]??=[]).push({id,ovr});
 const pool=[];for(const r of rows)for(const t of [0,1]){const ps=r.extras.sik.players.filter(p=>p.t===t&&!p.keeper).sort((a,b)=>b.fin-a.fin);if(ps.length)pool.push({gap:r.teams[t].ovr-r.teams[1-t].ovr,goals:[0,1,2].map(i=>ps[i]?.goals||0)});}
 if(pool.length<30)return null;pool.sort((a,b)=>a.gap-b.gap);
 const near=g=>{let lo=0,hi=pool.length;while(lo<hi){const mid=(lo+hi)>>1;if(pool[mid].gap<g)lo=mid+1;else hi=mid;}let a=lo,b=lo;while(b-a<15){if(a>0&&(b>=pool.length||g-pool[a-1].gap<=pool[b].gap-g))a--;else b++;}return [a,b];};
 const cache=new Map();let seed=987654;const rnd=()=>(seed=(Math.imul(seed,1103515245)+12345)>>>0)/4294967296;
 const tops=[],maxima=[];
 for(let s=0;s<200;s++){let seasonMax=0;
  for(const clubs of Object.values(leagues)){if(clubs.length<4)continue;let top=0;
   for(const c of clubs){const tally=[0,0,0];for(const o of clubs){if(o===c)continue;const g=c.ovr-o.ovr,key=g.toFixed(3);let w=cache.get(key);if(!w)cache.set(key,w=near(g));for(let leg=0;leg<2;leg++){const rec=pool[w[0]+Math.floor(rnd()*(w[1]-w[0]))];for(let i=0;i<3;i++)tally[i]+=rec.goals[i];}}top=Math.max(top,...tally);}
   tops.push(top);seasonMax=Math.max(seasonMax,top);}
  maxima.push(seasonMax);}
 return{matches:2*(Math.max(...Object.values(leagues).map(l=>l.length))-1),leagues:Object.keys(leagues).length,mean:mean(tops),seasonMax:mean(maxima)};
}
function paired(A,B){
 const key=r=>r.seed0+'|'+r.clubId+'|'+r.size,mapB=new Map(B.map(r=>[key(r),r])),pairs=A.filter(r=>mapB.has(key(r))).map(r=>[r,mapB.get(key(r))]),out={pairs:pairs.length};
 for(const [k,f]of Object.entries(perMatch)){const d=pairs.map(([x,y])=>f(y)-f(x)).filter(Number.isFinite);out[k]={delta:mean(d),ci:1.96*sd(d)/Math.sqrt(d.length)};}
 return out;
}
const cur=load(runs[0]),base=runs[1]?load(runs[1]):null;
const sizes={all:r=>true,standard:r=>r.size==='standard',large:r=>r.size==='large'};
const result={run:runs[0],base:runs[1]||null,matches:cur.matches.length,failures:cur.failures,unusable:cur.unusable,notLive:cur.notLive,distUnchanged:cur.distUnchanged,groups:{},paired:{},ratio:null,strength:null};
for(const [g,pred]of Object.entries(sizes)){result.groups[g]=summary(cur.matches.filter(pred));if(base)result.paired[g]=paired(base.matches.filter(pred),cur.matches.filter(pred));}
// Large / standard per seed set (shots, goals, zone time) with the pooled ratio.
const ratioOf=rows=>{const s=rows.filter(sizes.standard),l=rows.filter(sizes.large),m=(l2,f)=>mean(l2.map(f));return{shots:m(l,perMatch.shots)/m(s,perMatch.shots),goals:m(l,goalsOf)/m(s,goalsOf),zone22:m(l,perMatch.zone22)/m(s,perMatch.zone22)};};
result.ratio={pooled:ratioOf(cur.matches),bySeed:Object.fromEntries([...new Set(cur.matches.map(r=>r.seed0))].map(sd0=>[sd0,ratioOf(cur.matches.filter(r=>r.seed0===sd0))]))};
if(withStrength){const bands=[[0,1],[1,2],[2,3],[3,99]];result.strength=Object.fromEntries(['standard','large'].map(sz=>[sz,bands.map(([lo,hi])=>({gap:hi===99?`>=${lo}`:`${lo}-${hi}`,...fav(cur.matches.filter(sizes[sz]),lo,hi)}))]));}
if(json){console.log(JSON.stringify(result,null,1));return;}
const f=(x,d=2)=>Number.isFinite(x)?x.toFixed(d).replace('.',','):'–',p=(x,d=0)=>Number.isFinite(x)?x.toFixed(d).replace('.',',')+' %':'–',g=r=>`${p(r.pct)} (${r.n})`;
const G=result.groups,cols=['all','standard','large'],line=(name,fn,target='')=>console.log(`| ${name} | ${cols.map(c=>fn(G[c],c)).join(' | ')} | ${target} |`);
console.log(`Lauf ${runs[0]}${base?' gegen '+runs[1]:''}: ${cur.matches.length} Partien, Ausfälle ${cur.failures}, unbrauchbar ${cur.unusable}, Pausenticks ${cur.notLive}, dist unverändert ${cur.distUnchanged}\n`);
console.log('| Kennzahl | beide | Standard | groß | Ziel |\n| --- | ---: | ---: | ---: | --- |');
line('Partien',s=>s.n);
line('Dauer ohne Wiederholungen (min) / 4–6 min / min',s=>`${f(s.minutes.mean)} / ${p(s.minutes.in46)} / ${f(s.minutes.min)}`,'–');
line('Dauer all-inclusive mit Torwiederholungen (min) / 4–6 min / min / max',s=>s.minutesAll?`${f(s.minutesAll.mean)} / ${p(s.minutesAll.in46)} / ${f(s.minutesAll.min)} / ${f(s.minutesAll.max)}`:'–','4,8–5,2; ≥85 %; ≥3,7');
line('Torwiederholung je Tor (s) / je Partie (s)',s=>s.minutesAll?`${f(s.minutesAll.replayPerGoal)} / ${f(s.perMatch.replaySeconds,1)}`:'–','');
line('Schüsse / Anteil 10–18',s=>`${f(s.perMatch.shots)} / ${p(s.shotsBand)}`,'12–16; ≥45 %');
line('aufs Tor',s=>p(s.onTargetPct),'≥38 %');
line('Tore (Streuung)',s=>`${f(s.goals.mean)} (${f(s.goals.sd)})`,'3–5, ≈4');
line('Tore je Schuss / je Schuss aufs Tor',s=>`${p(s.goalsPerShot,1)} / ${p(s.goalsPerOnTarget)}`,'25–32 %');
line('0:0 / 3–5 Tore / ≥7 Tore / max',s=>`${p(s.goals.nil,1)} / ${p(s.goals.b35)} / ${p(s.goals.ge7,1)} / ${s.goals.max}`,'≤6 %; –; 5–15 %');
line('Favoriten ≥1 (N) / ≥2',s=>`${p(s.favourites.win)} (${s.favourites.n}) / ${p(s.favourites2.win)}`,'≥62 % (groß ≥60 %)');
line('Favorit ≥1 Punkt: Sieg / Remis / Niederlage',s=>`${p(s.favourites.win)} / ${p(s.favourites.draw)} / ${p(s.favourites.loss)}`,'Sieg rund 65 %');
line('Favorit geglättet bei 1,5 / 4 Punkten [95 %]',s=>s.favFit?`${p(s.favFit.at15)} [${f(s.favFit.ci15[0],0)}–${f(s.favFit.ci15[1],0)}] / ${p(s.favFit.at4)} [${f(s.favFit.ci4[0],0)}–${f(s.favFit.ci4[1],0)}]`:'–','rund 65 % (60–70) / ≥90 %');
line('Remis gesamt / Abstand <1 / 1–2 / 2–3 / ≥3',s=>`${p(s.draws.all,1)} / ${p(s.draws.close)} / ${p(s.draws.gap12)} / ${p(s.draws.gap23)} / ${p(s.draws.gap3)}`,'≥20 %; eng 25–30 %');
line('Tordiff. je Stärkepunkt',s=>f(s.slope),'≥0,35');
line('Abschluss <10 / 10–14 / ≥14 (Spielzug)',s=>`${g(s.finishing.low)} / ${g(s.finishing.mid)} / ${g(s.finishing.high)}`,'');
line('Verhältnis Abschluss ≥14/<10',s=>f(s.finishing.ratio),'≥1,8');
line('Torwart 10–14 / ≥14 (Tore je Schuss aufs Tor)',s=>`${g(s.keeper.mid)} / ${g(s.keeper.high)}`,'');
line('Torwartabstand (Punkte)',s=>f(s.keeper.mid.pct-s.keeper.high.pct,1),'≥10');
line('Fernschüsse Anteil / von Abschluss ≥13',s=>`${p(s.long.share,1)} / ${p(s.long.fin13)}`,'Standard 12–20 %; ≥75 % (groß: Information, Entscheidung 16.10.)');
line('Fernschüsse Abschluss ≥14: Tore (aufs Tor)',s=>`${g(s.long.high)} (${p(s.long.highOnTarget.pct)})`,'15–25 %');
line('Luftspiel <10 / 10–14 / ≥14: Kopf-/Volley-Tore je Schuss',s=>`${g(s.aerial.low)} / ${g(s.aerial.mid)} / ${g(s.aerial.high)}`,'');
line('Flanken gesamt / Spiel',s=>`${f(s.perMatch.crossesAll)} / ${f(s.perMatch.crossesOpen)}`,'Spiel ≥2,0');
line('angekommen gesamt / Spiel (Messhülle alt)',s=>`${p(s.crossArrivedPct)} / ${p(s.crossArrivedOpenPct)} (${p(s.crossLedgerReceivedPct)})`,'≥45 %');
line('Kopf-/Volleyschüsse (Tore)',s=>`${f(s.perMatch.headerVolleyShots)} (${f(s.perMatch.headerVolleyGoals)})`,'≥0,6');
line('Luft unbedrängt Spielzug: Tore je Schuss / je Schuss aufs Tor (N)',s=>`${p(s.airOpenFree.perShot)} / ${p(s.airOpenFree.perOnTarget)} (${s.airOpenFree.n})`,'je Schuss aufs Tor 45–60 %');
line('Luft unbedrängt Spielzug: Anteil an allen Toren',s=>p(s.airOpenFree.goalShare,1),'≤5–6 % (Nutzer 16.10.)');
line('Luft nach Ecke: Tore je Schuss / je Schuss aufs Tor (N)',s=>`${p(s.airCorner.perShot)} / ${p(s.airCorner.perOnTarget)} (${s.airCorner.n})`,'je Schuss rund 29 %');
line('Ecken / Schüsse ≤10 s danach',s=>`${f(s.perMatch.corners)} / ${f(s.perMatch.cornerShots10)}`,'1,2–3,0');
line('Abpraller / Gewinn / Schüsse ≤5 s (Kette; nur direkte Eltern)',s=>`${f(s.perMatch.rebounds)} / ${p(s.reboundWinPct)} / ${f(s.perMatch.reboundShots)} (${f(s.perMatch.reboundShotsDirect)})`,'–; ≥35 %; ≥0,3');
line('Fouls / Freistöße / Elfmeter',s=>`${f(s.perMatch.fouls)} / ${f(s.perMatch.freeKicks)} / ${f(s.perMatch.penalties)}`,'≤4,5 Freistöße');
line('direkte Freistöße / Fernschüsse je Partie',s=>`${f(s.perMatch.directFk)} / ${f(s.perMatch.longShots)}`,'');
line('Raumpässe (angekommen) / Pässe',s=>`${f(s.perMatch.spacePasses)} (${f(s.perMatch.spaceReceived)}) / ${f(s.perMatch.passes,1)}`,'');
line('Ballführer Tempo Mittel / Max (m/s)',s=>`${f(s.perMatch.carrierSpeed)} / ${f(s.perMatch.carrierMax)}`,'');
line('Zone ≤22 m (s je Team)',s=>f(s.perMatch.zone22),'groß ≥2,7');
line('Frische Feld / Kondition 9–11 / Torwart (Verbrauch)',s=>`${f(s.perMatch.freshField,1)} / ${f(s.perMatch.freshField911,1)} / ${f(s.perMatch.freshKeeper,1)} (${f(s.perMatch.keeperUse,1)})`,'Feld 40 ± 5 (Produktreferenz)');
line('Rechenzeit je Tick Median / p95 (ms) / je Partie (s)',s=>`${f(s.ticks.median,3)} / ${f(s.ticks.p95,3)} / ${f(s.perMatch.computeS,1)}`,'');
console.log('\nTorschützen (Mannschaft je Partie; bester Abschlussspieler = höchster Abschluss der eingesetzten Feldspieler):\n\n| Gruppe | Feld | Teams | Tore | Toranteil bester Abschluss | Schussanteil bester Abschluss | Toranteil bester Torschütze | Tore bester Torschütze | ≥2 Tore eines Spielers | ≥3 Tore | H Tore |\n| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
for(const k of ['all','fav>=3','fav1-2','|gap|<1'])for(const c of cols){const v=G[c].scorers[k];console.log(`| ${k} | ${c} | ${v.teams} | ${f(v.goals)} | ${p(v.bestGoalShare,1)} | ${p(v.bestShotShare,1)} | ${p(v.topScorerShare,1)} | ${f(v.topScorerGoals)} | ${p(v.brace)} | ${p(v.hat)} | ${f(v.H,3)} |`);}
console.log(`\nLigatorschützenkönig (Schätzung aus der Reihe, ${G.standard.leagueTop?.matches??'–'} Ligaspiele): Standard ${f(G.standard.leagueTop?.mean,1)} (Saisonmaximum ${f(G.standard.leagueTop?.seasonMax,1)}), groß ${f(G.large.leagueTop?.mean,1)} (${f(G.large.leagueTop?.seasonMax,1)}); Ziel rund 14–20`);
console.log('\nSchussquellen (je Partie, Tore je Schuss):\n\n| Quelle | beide | Standard | groß |\n| --- | ---: | ---: | ---: |');
for(const k of SOURCES)console.log(`| ${k} | ${cols.map(c=>`${f(G[c].sources[k].perMatch)} (${p(G[c].sources[k].goalsPerShot)})`).join(' | ')} |`);
console.log('\nTorverteilung (Anteil der Partien):\n\n| Tore | '+cols.join(' | ')+' |\n| --- | ---: | ---: | ---: |');
const maxG=Math.max(...cols.map(c=>G[c].goals.max));for(let k=0;k<=maxG;k++)console.log(`| ${k} | ${cols.map(c=>p(pct(G[c].goals.hist[k]||0,G[c].n),1)).join(' | ')} |`);
const P=G.all.personality;
console.log('\nPersönlichkeit (beide Feldgrößen, Feldspieler):\n\n| Rolle | Spieler | Abschluss | shootWeight | Schüsse | Fernschüsse | Tore |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: |');
for(const [k,v]of Object.entries(P.byRole).sort((a,b)=>b[1].shots-a[1].shots))console.log(`| ${k} | ${v.n} | ${f(v.fin,1)} | ${f(v.shootWeight)} | ${f(v.shots)} | ${f(v.longShots)} | ${f(v.goals)} |`);
console.log('\n| Abschluss 11–14, shootWeight-Drittel | Spieler | shootWeight | Abschluss | Schüsse | Fernschüsse |\n| --- | ---: | ---: | ---: | ---: | ---: |');
P.shootTerciles.forEach((t,i)=>console.log(`| ${['unten','Mitte','oben'][i]} | ${t.n} | ${f(t.shootWeight)} | ${f(t.fin,1)} | ${f(t.shots)} | ${f(t.longShots)} |`));
console.log(`\nUnter Druck (Gegner ≤2,5 m), Tore je Spielzugschuss: Ruhe <10 ${g(P.calmPressed.low)}, Ruhe ≥12 ${g(P.calmPressed.high)}`);
const R=result.ratio;console.log(`\nGroß/Standard gesamt: Schüsse ${p(R.pooled.shots*100,1)}, Tore ${p(R.pooled.goals*100,1)}, Zone ${p(R.pooled.zone22*100,1)}; je Seed-Satz: ${Object.entries(R.bySeed).map(([k,v])=>`${k} ${p(v.shots*100,1)}/${p(v.goals*100,1)}/${p(v.zone22*100,1)}`).join(', ')}`);
if(base){console.log(`\nGepaart gegen ${runs[1]} (Differenz ±95 %):\n\n| Kennzahl | beide | Standard | groß |\n| --- | ---: | ---: | ---: |`);
 for(const k of ['minutes','minutesAll','shots','onTarget','goals','crossesOpen','crossArrived','headerVolleyShots','corners','reboundShots','freeKicks','fouls','longShots','carrierSpeed','carrierMax','zone22','freshField','msPerTick'])console.log(`| ${k} (${result.paired.all.pairs} Paare) | ${cols.map(c=>{const v=result.paired[c][k];return `${v.delta>=0?'+':''}${f(v.delta)} ±${f(v.ci)}`;}).join(' | ')} |`);}
if(withStrength){console.log('\nJe Stärkeabstand (SI-6):\n\n| Feld | Abstand | N | Sieg Favorit | Remis | Niederlage | Tore | Tordiff. Favorit | Schüsse |\n| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');for(const [sz,l]of Object.entries(result.strength))for(const b of l)console.log(`| ${sz} | ${b.gap} | ${b.n} | ${p(b.win)} | ${p(b.draw)} | ${p(b.loss)} | ${f(b.goals)} | ${f(b.diff)} | ${f(b.shots)} |`);}
