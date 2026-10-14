'use strict';
// Summarises outputs/p01-r132/<variant>.json from work/measure-p01-r132.cjs.
// Usage: node work/analyze-p01-r132.cjs [baseline] [--compare=v1,v2,...]
const fs=require('node:fs'),path=require('node:path');
const dir=path.resolve(__dirname,'../outputs/p01-r132');
const main=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:'baseline';
const compare=(process.argv.find(a=>a.startsWith('--compare='))||'').slice(10).split(',').filter(Boolean);
const load=v=>{const r=JSON.parse(fs.readFileSync(path.join(dir,v+'.json'),'utf8'));r.unfinishedRows=r.matches.filter(m=>!m.finished).map(m=>({clubId:m.clubId,size:m.size,realSeconds:m.realSeconds,stall:m.stall?{type:m.stall.type,phase:m.stall.phase}:null}));r.matches=r.matches.filter(m=>m.finished);return r;};
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:NaN,sd=a=>{const m=mean(a);return Math.sqrt(mean(a.map(x=>(x-m)**2)));};
const r2=x=>Number.isFinite(x)?Math.round(x*100)/100:null,pct=(a,b)=>b?Math.round(a/b*1000)/10:null;
const q=(a,p)=>{const s=[...a].sort((x,y)=>x-y);return s[Math.min(s.length-1,Math.floor(p*(s.length-1)+.5))];};
const total=(r,k)=>r.teams[0].stats[k]+r.teams[1].stats[k];
const L=size=>size==='standard'?68:81.6;
const setPieceTypes=new Set(['freeKick','corner','throwIn','penalty','offside','goalKick','kickoff']);
function origin(s,size){
 if(s.penalty||s.kind==='penalty')return'Elfmeter';
 if(s.kind==='direct-free-kick')return'Direkter Freistoß';
 if(s.lastLoose&&s.lastLoose.ago<=5)return s.lastLoose.team===s.team?'Abpraller (eigener Schuss)':'Abpraller (gegn. Schuss)';
 const ph=s.phase;
 if(ph&&['freeKick','corner','throwIn','offside'].includes(ph.start)&&ph.secs<=10)return'Standard-Folge ('+ph.start+')';
 if(!ph&&s.restart&&s.restart.team===s.team&&['freeKick','corner','throwIn'].includes(s.restart.type)&&s.restart.ago<=15)return'Standard-Folge ('+s.restart.type+')';
 if(ph&&['zweikampf','abfangen','ballgewinn-frei','freier-ball','parade','abpraller'].includes(ph.start)&&ph.secs<=10&&ph.startDist>=L(size)*.45)return'Konter (Ballgewinn, ≤10 s)';
 if(ph&&['zweikampf','abfangen','ballgewinn-frei','freier-ball','parade','abpraller'].includes(ph.start)&&ph.secs<=10)return'Ballgewinn vorne (≤10 s)';
 return'Aufbau/Spielzug';
}
function summarize(rep){
 const ms=rep.matches,n=ms.length,out={variant:rep.variant,harness:rep.harness||'async-1',boost:rep.boost,n,excludedUnfinished:rep.unfinishedRows,failures:(rep.failures||[]).map(f=>({clubId:f.clubId,size:f.size,error:f.error.split(String.fromCharCode(10))[0]}))};
 const per=f=>r2(mean(ms.map(f)));
 const bySize=size=>ms.filter(r=>r.size===size);
 const core=rows=>({n:rows.length,minutes:r2(mean(rows.map(r=>r.realSeconds/60))),minutesSd:r2(sd(rows.map(r=>r.realSeconds/60))),minutesMin:r2(Math.min(...rows.map(r=>r.realSeconds/60))),minutesMax:r2(Math.max(...rows.map(r=>r.realSeconds/60))),shots:r2(mean(rows.map(r=>total(r,'shots')))),shotsSd:r2(sd(rows.map(r=>total(r,'shots')))),onTarget:r2(mean(rows.map(r=>total(r,'onTarget')))),goals:r2(mean(rows.map(r=>r.score[0]+r.score[1]))),shotGoals:r2(mean(rows.map(r=>total(r,'shotGoals')))),nilNil:pct(rows.filter(r=>r.score[0]+r.score[1]===0).length,rows.length),draws:pct(rows.filter(r=>r.score[0]===r.score[1]).length,rows.length),shots10to16:pct(rows.filter(r=>{const s=total(r,'shots');return s>=10&&s<=16;}).length,rows.length),shotsLe3:pct(rows.filter(r=>total(r,'shots')<=3).length,rows.length),passes:r2(mean(rows.map(r=>total(r,'passes')))),passPct:pct(rows.reduce((s,r)=>s+total(r,'passComplete'),0),rows.reduce((s,r)=>s+total(r,'passes'),0)),fouls:r2(mean(rows.map(r=>total(r,'fouls')))),tackleAttempts:r2(mean(rows.map(r=>total(r,'tackleAttempts')))),tacklesWon:r2(mean(rows.map(r=>total(r,'tacklesWon')))),slideAttempts:r2(mean(rows.map(r=>total(r,'slideAttempts')))),interceptions:r2(mean(rows.map(r=>total(r,'interceptions')))),corners:r2(mean(rows.map(r=>r.setPieces.corners[0]+r.setPieces.corners[1]))),freeKicks:r2(mean(rows.map(r=>r.setPieces.freeKicks[0]+r.setPieces.freeKicks[1]))),penalties:r2(mean(rows.map(r=>r.setPieces.penalties[0]+r.setPieces.penalties[1]))),clockEnd:r2(mean(rows.map(r=>r.elapsed))),shotsPerRunningMin:r2(mean(rows.map(r=>total(r,'shots')/(r.elapsed/r.markers.matchSpeed/60)))),shotsPerRealMin:r2(mean(rows.map(r=>total(r,'shots')/(r.realSeconds/60))))});
 out.overall=core(ms);out.standard=core(bySize('standard'));out.large=core(bySize('large'));
 out.shotHistogram={};for(const r of ms){const k=Math.min(10,total(r,'shots'));out.shotHistogram[k]=(out.shotHistogram[k]||0)+1;}out.minuteHistogram={};for(const r of ms){const k=(Math.floor(r.realSeconds/30)/2).toFixed(1);out.minuteHistogram[k]=(out.minuteHistogram[k]||0)+1;}
 out.errors=ms.filter(r=>r.errors?.length).length;out.unfinished=ms.filter(r=>!r.finished).length;
 if(!ms[0].rec)return out;
 // ---------------- time decomposition ----------------
 const cats={},clock={};for(const r of ms){for(const[k,v]of Object.entries(r.rec.time)){const key=k.startsWith('standard-')?k:k;cats[key]=(cats[key]||0)+v;}for(const[k,v]of Object.entries(r.rec.clock))clock[k]=(clock[k]||0)+v;}
 const group=k=>k.startsWith('standard-')?'Standard '+k.slice(9).split(':')[0]:k;
 const grouped={};for(const[k,v]of Object.entries(cats)){const g=group(k);grouped[g]=grouped[g]||{real:0,clock:0};grouped[g].real+=v/n;grouped[g].clock+=(clock[k]||0)/n;}
 out.time=Object.fromEntries(Object.entries(grouped).sort((a,b)=>b[1].real-a[1].real).map(([k,v])=>[k,{realSec:r2(v.real),clockSec:r2(v.clock),clockRate:r2(v.clock/v.real)}]));
 out.timeDetail=Object.fromEntries(Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([k,v])=>[k,r2(v/n)]));
 const running=ms.map(r=>Object.entries(r.rec.time).filter(([k])=>(r.rec.clock[k]||0)/r.rec.time[k]>.5*r.markers.matchSpeed).reduce((s,[,v])=>s+v,0)),stopped=ms.map((r,i)=>r.realSeconds-running[i]);
 out.timeSplit={realSec:per(r=>r.realSeconds),runningClockRealSec:r2(mean(running)),stoppedOrSlowRealSec:r2(mean(stopped)),clockElapsedEnd:per(r=>r.elapsed),theoreticalRunning:r2(75/ms[0].markers.matchSpeed)};
 // restart counts and seconds per restart
 const restartCount={};for(const r of ms)for(const x of r.rec.restarts){const t=x.split(':')[0];restartCount[t]=(restartCount[t]||0)+1;}
 out.restarts=Object.fromEntries(Object.entries(restartCount).map(([t,c])=>{const real=Object.entries(cats).filter(([k])=>k.startsWith('standard-'+t+':')||(t==='throwIn'&&k==='einwurf')||(t==='kickoff'&&k.startsWith('anstoss'))||(t==='goal'&&k==='torszene')).reduce((s,[,v])=>s+v,0);return[t,{perMatch:r2(c/n),secondsEach:r2(real/c),secondsPerMatch:r2(real/n)}];}));
 // ---------------- shots ----------------
 const shots=ms.flatMap(r=>r.rec.shots.map(s=>({...s,size:r.size,clubId:r.clubId})));out.shotCount=shots.length;
 const res={};for(const s of shots){const k=s.result||'?';res[k]=(res[k]||0)+1;}out.shotResults=Object.fromEntries(Object.entries(res).map(([k,v])=>[k,{n:v,pct:pct(v,shots.length)}]));
 const kinds={};for(const s of shots){const k=s.kind+(s.direct?'(direkt)':'');kinds[k]=(kinds[k]||0)+1;}out.shotKinds=Object.fromEntries(Object.entries(kinds).map(([k,v])=>[k,{n:v,pct:pct(v,shots.length)}]));
 const onT=s=>s.plannedOnTarget||s.actualOnTarget||s.result==='goal'||s.result==='caught'||s.result==='parried',isGoal=s=>s.result==='goal'||s.goal;
 const bucket=(arr,f,edges,label)=>{const o={};for(let i=0;i<edges.length;i++){const lo=i?edges[i-1]:-Infinity,hi=edges[i],rows=arr.filter(s=>f(s)>lo&&f(s)<=hi);o[label(lo,hi)]={n:rows.length,pct:pct(rows.length,arr.length),onTargetPct:pct(rows.filter(onT).length,rows.length),goalPct:pct(rows.filter(isGoal).length,rows.length),blockedPct:pct(rows.filter(s=>s.result==='blocked'||s.result==='unreached-block').length,rows.length)};}return o;};
 const open=shots.filter(s=>!s.penalty&&s.kind!=='direct-free-kick');
 out.shotDistance=bucket(open,s=>s.range,[10,14,18,22,26,Infinity],(lo,hi)=>hi===Infinity?`>${lo} m`:`${lo===-Infinity?0:lo}-${hi} m`);
 out.shotAngle=bucket(open,s=>s.angleDeg,[10,15,20,30,Infinity],(lo,hi)=>hi===Infinity?`>${lo}°`:`${lo===-Infinity?0:lo}-${hi}°`);
 out.shotPressure=bucket(open,s=>s.n25,[0,1,Infinity],(lo,hi)=>hi===0?'kein Gegner <2,5 m':hi===1?'1 Gegner <2,5 m':'≥2 Gegner <2,5 m');
 out.shotLane=bucket(open,s=>s.laneBlockers,[0,1,Infinity],(lo,hi)=>hi===0?'Linie frei':hi===1?'1 Verteidiger in Linie':'≥2 in Linie');
 out.shotMeans={range:r2(mean(open.map(s=>s.range))),rangeMedian:r2(q(open.map(s=>s.range),.5)),angle:r2(mean(open.map(s=>s.angleDeg))),nearestOpp:r2(mean(open.map(s=>Math.min(s.nearest,10)))),n25:r2(mean(open.map(s=>s.n25))),laneBlockers:r2(mean(open.map(s=>s.laneBlockers))),keeperDist:r2(mean(open.map(s=>s.keeperDist))),onTargetPct:pct(shots.filter(onT).length,shots.length),goalPct:pct(shots.filter(isGoal).length,shots.length),goalPerOnTarget:pct(shots.filter(isGoal).length,shots.filter(onT).length)};
 const orig={};for(const s of shots){const o=origin(s,s.size);orig[o]=orig[o]||[];orig[o].push(s);}
 out.shotOrigin=Object.fromEntries(Object.entries(orig).sort((a,b)=>b[1].length-a[1].length).map(([k,v])=>[k,{n:v.length,perMatch:r2(v.length/n),pct:pct(v.length,shots.length),range:r2(mean(v.map(s=>s.range))),onTargetPct:pct(v.filter(onT).length,v.length),goalPct:pct(v.filter(isGoal).length,v.length)}]));
 const withPhase=open.filter(s=>s.phase);out.shotTempo={withPhase:withPhase.length,secsFromWin:r2(mean(withPhase.map(s=>s.phase.secs))),secsMedian:r2(q(withPhase.map(s=>s.phase.secs),.5)),passesBefore:r2(mean(withPhase.map(s=>s.phase.passes))),passesMedian:q(withPhase.map(s=>s.phase.passes),.5)};
 const byLine={};for(const s of open){byLine[s.line]=(byLine[s.line]||0)+1;}out.shotsByLine=byLine;
 // ---------------- possession phases ----------------
 const phases=ms.flatMap(r=>r.rec.phases.map(p=>({...p,size:r.size})));
 out.phases={perMatch:r2(phases.length/n),secs:r2(mean(phases.map(p=>p.secs))),secsMedian:r2(q(phases.map(p=>p.secs),.5)),passes:r2(mean(phases.map(p=>p.passes))),final3Pct:pct(phases.filter(p=>p.final3).length,phases.length),zone22Pct:pct(phases.filter(p=>p.zone22).length,phases.length),shotPct:pct(phases.filter(p=>p.endReason==='schuss').length,phases.length),longPhases:pct(phases.filter(p=>p.secs>=8).length,phases.length)};
 const endR=rows=>{const o={};for(const p of rows){const k=p.endReason.replace(/^fehlpass-.*/,'fehlpass').replace(/^restart-(throwIn|goalKick)-gegner$/,'ball-ins-aus (gegn. Einwurf/Abstoß)').replace(/^restart-(freeKick|penalty)-eigen$/,'foul erlitten (eigener FS/11m)').replace(/^restart-(freeKick|penalty)-gegner$/,'foul begangen').replace(/^restart-offside-gegner$/,'abseits').replace(/^restart-corner-eigen$/,'ecke gewonnen').replace(/^restart-throwIn-eigen$/,'eigener einwurf');o[k]=(o[k]||0)+1;}return Object.fromEntries(Object.entries(o).sort((a,b)=>b[1]-a[1]).map(([k,v])=>[k,{n:v,pct:pct(v,rows.length),perMatch:r2(v/n)}]));};
 out.phaseEnd=endR(phases);out.phaseEndFinal3=endR(phases.filter(p=>p.final3));out.phaseEndZone22=endR(phases.filter(p=>p.zone22));
 const st={};for(const p of phases){st[p.startReason]=st[p.startReason]||[];st[p.startReason].push(p);}
 out.phaseStart=Object.fromEntries(Object.entries(st).sort((a,b)=>b[1].length-a[1].length).map(([k,v])=>[k,{n:v.length,perMatch:r2(v.length/n),secs:r2(mean(v.map(p=>p.secs))),final3Pct:pct(v.filter(p=>p.final3).length,v.length),zone22Pct:pct(v.filter(p=>p.zone22).length,v.length),shotPct:pct(v.filter(p=>p.endReason==='schuss').length,v.length)}]));
 const minD=bucket(phases.map(p=>({...p,range:p.minDist})),p=>p.range,[16,22,30,40,Infinity],(lo,hi)=>hi===Infinity?`>${lo} m`:`${lo===-Infinity?0:lo}-${hi} m`);
 out.phaseFurthest=Object.fromEntries(Object.entries(minD).map(([k,v])=>[k,{n:v.n,pct:v.pct}]));
 // ---------------- zone and decisions ----------------
 out.zone={ownerIn22SecPerTeam:r2(mean(ms.flatMap(r=>r.rec.zone22))),ownerIn30SecPerTeam:r2(mean(ms.flatMap(r=>r.rec.zone30))),ballIn22SecPerTeam:r2(mean(ms.flatMap(r=>r.rec.ballZone22||[]))),ownerHoldMean:per(r=>r.rec.ownerHoldMean||0),ownerHoldN:per(r=>r.rec.ownerHoldN||0)};
 const dec={};for(const r of ms)for(const[k,v]of Object.entries(r.rec.decisions)){const[b,ang,lane,outc]=k.split('|');const key=b;dec[key]=dec[key]||{total:0,outcomes:{},angleBad:0,laneBlocked:0};dec[key].total+=v;dec[key].outcomes[outc]=(dec[key].outcomes[outc]||0)+v;if(ang==='winkel-spitz')dec[key].angleBad+=v;if(lane==='lane-zu')dec[key].laneBlocked+=v;}
 out.decisions=Object.fromEntries(['<=14','14-18','18-22','22-26','26-32'].filter(k=>dec[k]).map(k=>{const d=dec[k];return[k,{perMatch:r2(d.total/n),angleBadPct:pct(d.angleBad,d.total),laneBlockedPct:pct(d.laneBlocked,d.total),outcomes:Object.fromEntries(Object.entries(d.outcomes).sort((a,b)=>b[1]-a[1]).map(([o,v])=>[o,pct(v,d.total)]))}];}));
 // ---------------- passes ----------------
 const fl=ms.flatMap(r=>r.rec.flights);const passKinds=['pass','highPass','cross','space','header'];
 const fk={};for(const f of fl){fk[f.kind]=(fk[f.kind]||0)+1;}out.flightKinds=Object.fromEntries(Object.entries(fk).map(([k,v])=>[k,r2(v/n)]));
 const passes=fl.filter(f=>passKinds.includes(f.kind));out.passDirection={forward:pct(passes.filter(f=>f.gain>=3).length,passes.length),lateral:pct(passes.filter(f=>Math.abs(f.gain)<3).length,passes.length),backward:pct(passes.filter(f=>f.gain<=-3).length,passes.length),meanLen:r2(mean(passes.map(f=>f.len))),meanGain:r2(mean(passes.map(f=>f.gain)))};
 // ---------------- strength ----------------
 const teams=ms.flatMap(r=>r.teams.map((t,i)=>({...t,opp:r.teams[1-i],size:r.size,r})));
 const diffB=t=>{const d=t.ovr-t.opp.ovr;return d<=-2?'≤-2':d<=-1?'-2..-1':d<-.4?'-1..-0,4':d<=.4?'±0,4':d<1?'0,4..1':d<2?'1..2':'≥2';};
 const sb={};for(const t of teams){const k=diffB(t);sb[k]=sb[k]||[];sb[k].push(t);}
 out.strength=Object.fromEntries(['≥2','1..2','0,4..1','±0,4','-1..-0,4','-2..-1','≤-2'].filter(k=>sb[k]).map(k=>{const v=sb[k];return[k,{teams:v.length,shots:r2(mean(v.map(t=>t.stats.shots))),onTarget:r2(mean(v.map(t=>t.stats.onTarget))),goals:r2(mean(v.map(t=>t.score))),conceded:r2(mean(v.map(t=>t.opp.score))),winPct:pct(v.filter(t=>t.score>t.opp.score).length,v.length),drawPct:pct(v.filter(t=>t.score===t.opp.score).length,v.length),possessionPct:r2(mean(v.map(t=>t.possession/(t.possession+t.opp.possession)*100)))}];}));
 const ovrs=teams.map(t=>t.ovr);out.strengthRange={ovrMin:r2(Math.min(...ovrs)),ovrMax:r2(Math.max(...ovrs)),ovrMean:r2(mean(ovrs)),absDiffMean:r2(mean(ms.map(r=>Math.abs(r.teams[0].ovr-r.teams[1].ovr)))),absDiffMax:r2(Math.max(...ms.map(r=>Math.abs(r.teams[0].ovr-r.teams[1].ovr))))};
 // linear slopes (team observation): shots/goals vs ovr difference
 const slope=(xs,ys)=>{const mx=mean(xs),my=mean(ys);let a=0,b=0;for(let i=0;i<xs.length;i++){a+=(xs[i]-mx)*(ys[i]-my);b+=(xs[i]-mx)**2;}return b?a/b:NaN;};
 const corr=(xs,ys)=>{const mx=mean(xs),my=mean(ys);let a=0,b=0,c=0;for(let i=0;i<xs.length;i++){a+=(xs[i]-mx)*(ys[i]-my);b+=(xs[i]-mx)**2;c+=(ys[i]-my)**2;}return a/Math.sqrt(b*c);};
 const dx=teams.map(t=>t.ovr-t.opp.ovr);
 out.strengthSlopes={shotsPerOvrPoint:r2(slope(dx,teams.map(t=>t.stats.shots))),goalsPerOvrPoint:r2(slope(dx,teams.map(t=>t.score))),goalDiffPerOvrPoint:r2(slope(dx,teams.map(t=>t.score-t.opp.score))),possessionPctPerOvrPoint:r2(slope(dx,teams.map(t=>t.possession/(t.possession+t.opp.possession)*100))),corrShots:r2(corr(dx,teams.map(t=>t.stats.shots))),corrGoalDiff:r2(corr(dx,teams.map(t=>t.score-t.opp.score)))};
 const strongerMatches=ms.filter(r=>Math.abs(r.teams[0].ovr-r.teams[1].ovr)>=1);const sw=strongerMatches.map(r=>{const s=r.teams[0].ovr>r.teams[1].ovr?0:1;return r.score[s]>r.score[1-s]?'win':r.score[s]===r.score[1-s]?'draw':'loss';});
 out.favourite={matchesGap1:strongerMatches.length,winPct:pct(sw.filter(x=>x==='win').length,sw.length),drawPct:pct(sw.filter(x=>x==='draw').length,sw.length),lossPct:pct(sw.filter(x=>x==='loss').length,sw.length)};
 const levels=ms.map(r=>({lvl:(r.teams[0].ovr+r.teams[1].ovr)/2,r}));const lv=k=>levels.filter(x=>k(x.lvl)).map(x=>x.r);
 out.levelBands=Object.fromEntries([['niedrig (<9)',x=>x<9],['mittel (9-11)',x=>x>=9&&x<11],['hoch (≥11)',x=>x>=11]].map(([k,f])=>{const rows=lv(f);return[k,rows.length?{n:rows.length,minutes:r2(mean(rows.map(r=>r.realSeconds/60))),shots:r2(mean(rows.map(r=>total(r,'shots')))),goals:r2(mean(rows.map(r=>r.score[0]+r.score[1]))),draws:pct(rows.filter(r=>r.score[0]===r.score[1]).length,rows.length),fouls:r2(mean(rows.map(r=>total(r,'fouls'))))}:null];}));
 // keeper
 const kb={};for(const t of teams){const k=t.gk<9?'<9':t.gk<12?'9-12':t.gk<15?'12-15':'≥15';kb[k]=kb[k]||{onT:0,shotGoals:0,saves:0,conceded:0,teams:0};kb[k].onT+=t.opp.stats.onTarget;kb[k].shotGoals+=t.opp.stats.shotGoals;kb[k].saves+=t.stats.saves;kb[k].conceded+=t.opp.score;kb[k].teams++;}
 out.keeper=Object.fromEntries(Object.entries(kb).map(([k,v])=>[k,{teams:v.teams,oppOnTargetPerMatch:r2(v.onT/v.teams),savesPerMatch:r2(v.saves/v.teams),goalsPerOnTargetPct:pct(v.shotGoals,v.onT),concededPerMatch:r2(v.conceded/v.teams)}]));
 // shooter skill vs outcome (open play)
 const fb={};for(const s of open){const k=s.skills.fin<9?'Abschluss <9':s.skills.fin<12?'Abschluss 9-12':s.skills.fin<15?'Abschluss 12-15':'Abschluss ≥15';fb[k]=fb[k]||[];fb[k].push(s);}
 out.finishing=Object.fromEntries(Object.entries(fb).map(([k,v])=>[k,{n:v.length,range:r2(mean(v.map(s=>s.range))),onTargetPct:pct(v.filter(onT).length,v.length),goalPct:pct(v.filter(isGoal).length,v.length)}]));
 return out;
}
function paired(base,other){
 const key=r=>r.clubId+'|'+r.size,bm=new Map(base.matches.map(r=>[key(r),r])),rows=other.matches.filter(r=>bm.has(key(r))).map(r=>[bm.get(key(r)),r]);
 const d=(f)=>{const xs=rows.map(([a,b])=>f(b)-f(a));const m=mean(xs),se=sd(xs)/Math.sqrt(xs.length);return{base:r2(mean(rows.map(([a])=>f(a)))),variant:r2(mean(rows.map(([,b])=>f(b)))),diff:r2(m),ci95:[r2(m-1.96*se),r2(m+1.96*se)]};};
 return{n:rows.length,minutes:d(r=>r.realSeconds/60),shots:d(r=>total(r,'shots')),onTarget:d(r=>total(r,'onTarget')),goals:d(r=>r.score[0]+r.score[1]),passes:d(r=>total(r,'passes')),fouls:d(r=>total(r,'fouls')),tacklesWon:d(r=>total(r,'tacklesWon')),ownShots:d(r=>r.teams[0].stats.shots),ownGoals:d(r=>r.teams[0].score),ownOnTarget:d(r=>r.teams[0].stats.onTarget),oppShots:d(r=>r.teams[1].stats.shots),goalDiffOwn:d(r=>r.teams[0].score-r.teams[1].score)};
}
const baseRep=load(main),summary={main:summarize(baseRep),variants:{}};
for(const v of compare){try{const rep=load(v);summary.variants[v]={summary:summarize(rep),paired:paired(baseRep,rep)};}catch(e){summary.variants[v]={error:e.message};}}
const outFile=path.join(dir,`summary-${main}${compare.length?'-vs':''}.json`);fs.writeFileSync(outFile,JSON.stringify(summary,null,1)+'\n');
console.log(JSON.stringify(summary,null,1));
