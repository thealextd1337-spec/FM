'use strict';
// SI-6 / P02: evaluation of work/measure-compact-physical-v183.cjs (compact replicas of the physical series SI-K2)
// against the played-out reference outputs/si183/k2-f*-trace40000.json. Same fixtures, same teams.
// Usage: node work/table-compact-physical-v183.cjs <label> [--series=k2-...] [--json]
// Fixtures whose rebuilt team strength differs from the physical record (opposing AI lineup, about 1.5 %) are left out on both sides.
// Gap classes and favourite as in table-si-calibration-v183 (--strength): favourite = higher mean outfield strength ovr.
const fs=require('node:fs'),path=require('node:path');process.chdir(path.resolve(__dirname,'..'));
const args=process.argv.slice(2),label=args.find(a=>!a.startsWith('--'));if(!label){console.error('Usage: node work/table-compact-physical-v183.cjs <label> [--json]');process.exit(2);}
const series=(args.find(a=>a.startsWith('--series='))?.slice(9)||'k2-f-trace40000,k2-f-si183b-trace40000,k2-f-si183c-trace40000').split(',');
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:NaN,sd=a=>{const m=mean(a);return a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):NaN;};
const f=(x,d=2)=>Number.isFinite(x)?x.toFixed(d).replace('.',','):'–',p=(x,d=0)=>Number.isFinite(x)?(100*x).toFixed(d).replace('.',',')+' %':'–',pt=x=>Number.isFinite(x)?(x>=0?'+':'')+(100*x).toFixed(1).replace('.',',')+' P.':'–',rel=(a,b)=>Number.isFinite(a/b)?((a/b-1)*100>=0?'+':'')+((a/b-1)*100).toFixed(1).replace('.',',')+' %':'–';
const physical=series.flatMap(name=>JSON.parse(fs.readFileSync(`outputs/si183/${name}.json`,'utf8')).matches.filter(r=>r.finished&&!r.engineError&&!r.stall&&r.rec&&r.extras?.sik));
const files=fs.readdirSync('outputs/si6').filter(n=>n.startsWith(label+'-')&&/of\d+\.json$/.test(n));if(!files.length)throw Error('no result files for '+label);
const jobs=files.flatMap(n=>JSON.parse(fs.readFileSync('outputs/si6/'+n,'utf8')).jobs).sort((a,b)=>a.index-b.index).filter(j=>j.ovrOk);
const okIndex=new Set(jobs.map(j=>j.index)),K=jobs[0].matches.length;
// ---- physical rows (same fields as the compact rows) ----
const source=s=>s.penalty?'penalty':s.kind==='direct-free-kick'?'direct-free-kick':s.kind==='header'||s.kind==='volley'?'header-volley':s.restart?.type==='corner'&&s.restart.ago<=10&&s.restart.team===s.team?'corner':s.restart?.type==='freeKick'&&s.restart.ago<=10&&s.restart.team===s.team?'free-kick-follow':(s.rebound?s.rebound.ago<=5:s.lastLoose&&s.lastLoose.team===s.team&&s.lastLoose.ago<=5)?'rebound':(s.sources||[]).includes('counter')?'counter':s.range>22?'long':'open';
const SOURCES=['open','long','header-volley','rebound','corner','free-kick-follow','direct-free-kick'];
const physRows=[],physShots=[],physPlayers=[],physLoad=[];
physical.forEach((r,index)=>{
 if(!okIndex.has(index))return;
 const sp=r.setPieces||{};
 physRows.push({index,size:r.size,ovr:r.teams.map(t=>t.ovr),score:r.score,shots:r.teams.map(t=>t.stats.shots),on:r.teams.map(t=>t.stats.onTarget),corners:sp.corners||[0,0],crosses:r.teams.map(t=>t.stats.crosses),fouls:r.teams.map(t=>t.stats.fouls),freeKicks:sp.freeKicks||[0,0]});
 for(const s of r.rec.shots)if(!s.penalty)physShots.push({size:r.size,src:source(s),goal:s.goal===true||s.result==='goal',fin:s.skills?.fin,air:s.skills?.air});
 const players=r.extras.sik.players,fresh=r.extras.fresh||[];
 players.forEach((pl,i)=>{if(!pl.keeper)physPlayers.push({size:r.size,role:pl.role,shots:pl.shots,goals:pl.goals});if(fresh.length===players.length&&r.teams.length===2)physLoad.push({size:r.size,team:pl.t,line:pl.keeper?'gk':pl.line,sta:fresh[i][0],used:fresh[i][2]-fresh[i][3]});});
});
// ---- compact rows ----
const compRows=[];
for(const j of jobs){const ref=physical[j.index];
 for(const m of j.matches){const side=i=>ref.teams[i].clubId===j.homeId?0:1,s=[side(0),side(1)],st=(i,k)=>m.stats[s[i]]?.[k]??0;
  compRows.push({index:j.index,size:j.size,ovr:ref.teams.map(t=>t.ovr),score:[m.score[s[0]],m.score[s[1]]],shots:[st(0,'shots'),st(1,'shots')],on:[st(0,'onTarget'),st(1,'onTarget')],corners:[st(0,'corners'),st(1,'corners')],crosses:[st(0,'crosses'),st(1,'crosses')],fouls:[st(0,'fouls'),st(1,'fouls')],freeKicks:[st(0,'freeKicks'),st(1,'freeKicks')],raw:m});}}
// ---- favourites per gap ----
const fav=(rows,lo,hi)=>{const g=rows.filter(r=>{const d=Math.abs(r.ovr[0]-r.ovr[1]);return d>=lo&&d<hi;}),favIdx=r=>r.ovr[0]>r.ovr[1]?0:1,res=g.map(r=>Math.sign(r.score[favIdx(r)]-r.score[1-favIdx(r)]));
 return{n:g.length,win:res.filter(x=>x>0).length/g.length,draw:res.filter(x=>x===0).length/g.length,loss:res.filter(x=>x<0).length/g.length,goals:mean(g.map(r=>r.score[0]+r.score[1])),shots:mean(g.map(r=>r.shots[0]+r.shots[1])),favShots:mean(g.map(r=>r.shots[favIdx(r)])),dogShots:mean(g.map(r=>r.shots[1-favIdx(r)])),favGoals:mean(g.map(r=>r.score[favIdx(r)])),dogGoals:mean(g.map(r=>r.score[1-favIdx(r)]))};};
// logistic smoothing of P(favourite wins) over the gap (as in the SI-K2 report), Newton steps
function logistic(rows){const xs=[],ys=[];for(const r of rows){const d=Math.abs(r.ovr[0]-r.ovr[1]);if(d<.05)continue;const fi=r.ovr[0]>r.ovr[1]?0:1;xs.push(d);ys.push(r.score[fi]>r.score[1-fi]?1:0);}
 let a=0,b=.5;for(let it=0;it<60;it++){let g0=0,g1=0,h00=0,h01=0,h11=0;for(let i=0;i<xs.length;i++){const z=a+b*xs[i],q=1/(1+Math.exp(-z)),w=q*(1-q);g0+=ys[i]-q;g1+=(ys[i]-q)*xs[i];h00+=w;h01+=w*xs[i];h11+=w*xs[i]*xs[i];}const det=h00*h11-h01*h01;a+=(h11*g0-h01*g1)/det;b+=(-h01*g0+h00*g1)/det;}
 return gap=>1/(1+Math.exp(-(a+b*gap)));}
const summary=rows=>({n:rows.length,shots:mean(rows.map(r=>r.shots[0]+r.shots[1])),on:mean(rows.map(r=>r.on[0]+r.on[1])),goals:mean(rows.map(r=>r.score[0]+r.score[1])),goalSd:sd(rows.map(r=>r.score[0]+r.score[1])),nil:rows.filter(r=>r.score[0]+r.score[1]===0).length/rows.length,ge7:rows.filter(r=>r.score[0]+r.score[1]>=7).length/rows.length,corners:mean(rows.map(r=>r.corners[0]+r.corners[1])),crosses:mean(rows.map(r=>r.crosses[0]+r.crosses[1])),fouls:mean(rows.map(r=>r.fouls[0]+r.fouls[1])),freeKicks:mean(rows.map(r=>r.freeKicks[0]+r.freeKicks[1]))});
const bands=[[0,1],[1,2],[2,3],[3,99]],result={label,K,fixtures:jobs.length,matches:compRows.length,series,sizes:{}};
console.log(`Lauf ${label}: ${jobs.length} Fixtures (${physical.length-jobs.length} wegen abweichender Stärke ausgelassen), je ${K} Wiederholungen = ${compRows.length} kompakte Partien\n`);
for(const size of ['standard','large']){
 const A=physRows.filter(r=>r.size===size),B=compRows.filter(r=>r.size===size),sa=summary(A),sb=summary(B),fa=logistic(A),fb=logistic(B);
 const out=result.sizes[size]={summary:{phys:sa,comp:sb},bands:bands.map(([lo,hi])=>({gap:hi===99?`>=${lo}`:`${lo}-${hi}`,phys:fav(A,lo,hi),comp:fav(B,lo,hi)})),smooth:{phys:{g15:fa(1.5),g4:fa(4)},comp:{g15:fb(1.5),g4:fb(4)}}};
 console.log(`### ${size==='standard'?'Standardfeld':'großes Feld'} (physisch ${A.length}, kompakt ${B.length})\n`);
 console.log('| Kennzahl | physisch | kompakt | Abweichung |\n| --- | ---: | ---: | ---: |');
 for(const [name,key,kind] of [['Schüsse je Partie','shots'],['aufs Tor','on'],['Tore je Partie','goals'],['Streuung der Tore','goalSd'],['0:0','nil','p'],['≥ 7 Tore','ge7','p'],['Ecken','corners'],['Flanken','crosses'],['Fouls','fouls'],['Freistöße','freeKicks']])console.log(`| ${name} | ${kind==='p'?p(sa[key],1):f(sa[key])} | ${kind==='p'?p(sb[key],1):f(sb[key])} | ${kind==='p'?pt(sb[key]-sa[key]):rel(sb[key],sa[key])} |`);
 console.log(`| Tore je Schuss | ${p(sa.goals/sa.shots,1)} | ${p(sb.goals/sb.shots,1)} | ${pt(sb.goals/sb.shots-sa.goals/sa.shots)} |`);
 console.log(`| aufs Tor je Schuss | ${p(sa.on/sa.shots,1)} | ${p(sb.on/sb.shots,1)} | ${pt(sb.on/sb.shots-sa.on/sa.shots)} |`);
 console.log('\n| Abstand | Partien phys / komp | Sieg Favorit phys → komp | Remis phys → komp | Niederlage phys → komp | Tore phys → komp | Schüsse Favorit/Außenseiter phys → komp | Tore Favorit/Außenseiter phys → komp |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
 for(const b of out.bands)console.log(`| ${b.gap} | ${b.phys.n} / ${b.comp.n} | ${p(b.phys.win)} → ${p(b.comp.win)} (${pt(b.comp.win-b.phys.win)}) | ${p(b.phys.draw)} → ${p(b.comp.draw)} (${pt(b.comp.draw-b.phys.draw)}) | ${p(b.phys.loss)} → ${p(b.comp.loss)} | ${f(b.phys.goals)} → ${f(b.comp.goals)} | ${f(b.phys.favShots,1)}/${f(b.phys.dogShots,1)} → ${f(b.comp.favShots,1)}/${f(b.comp.dogShots,1)} | ${f(b.phys.favGoals)}/${f(b.phys.dogGoals)} → ${f(b.comp.favGoals)}/${f(b.comp.dogGoals)} |`);
 console.log(`\nGeglättet (logistische Anpassung): Favorit bei 1,5 Punkten ${p(out.smooth.phys.g15)} → ${p(out.smooth.comp.g15)} (${pt(out.smooth.comp.g15-out.smooth.phys.g15)}), bei 4 Punkten ${p(out.smooth.phys.g4)} → ${p(out.smooth.comp.g4)} (${pt(out.smooth.comp.g4-out.smooth.phys.g4)})`);
 // sources
 const compSource={},physSource={};let nA=0,nB=0;
 for(const s of physShots.filter(s=>s.size===size)){(physSource[s.src]??={n:0,g:0,fin:0,air:0});const e=physSource[s.src];e.n++;e.g+=s.goal?1:0;e.fin+=s.fin??0;e.air+=s.air??10;}
 nA=A.length;
 for(const j of jobs.filter(j=>j.size===size)){for(const m of j.matches){nB++;for(const src of SOURCES){const a=m.sources?.shots[src]||[0,0],g=m.sources?.goals[src]||[0,0];(compSource[src]??={n:0,g:0,fin:0,air:0});compSource[src].n+=a[0]+a[1];compSource[src].g+=g[0]+g[1];}}
  for(const [src,v] of Object.entries(j.shooters||{})){(compSource[src]??={n:0,g:0,fin:0,air:0});compSource[src].fin+=v[1];compSource[src].air+=v[2];compSource[src].picks=(compSource[src].picks||0)+v[0];}}
 console.log('\n| Schussquelle | je Partie phys | je Partie komp | Tore je Schuss phys | Tore je Schuss komp | Schützenwert Abschluss phys | Abschluss komp |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: |');
 out.sources={};
 for(const src of SOURCES){const a=physSource[src]||{n:0,g:0,fin:0},b=compSource[src]||{n:0,g:0,fin:0,picks:0};out.sources[src]={phys:{perMatch:a.n/nA,goalsPerShot:a.g/a.n},comp:{perMatch:b.n/nB,goalsPerShot:b.g/Math.max(1,b.n)}};
  console.log(`| ${src} | ${f(a.n/nA)} | ${f(b.n/nB)} | ${p(a.g/Math.max(1,a.n))} | ${p(b.g/Math.max(1,b.n))} | ${f(a.fin/Math.max(1,a.n))} | ${f(b.fin/Math.max(1,b.picks||1))} |`);}
 // roles
 const roles={},rc={};for(const pl of physPlayers.filter(x=>x.size===size)){const r=roles[pl.role]??={shots:0,goals:0};r.shots+=pl.shots;r.goals+=pl.goals;}
 let ca=0;for(const j of jobs.filter(j=>j.size===size))for(const m of j.matches)for(const [role,sh,go,as] of m.roles){if(!role||role.includes('keeper'))continue;const r=rc[role]??={shots:0,goals:0,assists:0};r.shots+=sh;r.goals+=go;r.assists+=as;ca+=as;}
 const ts=Object.values(roles).reduce((s,r)=>s+r.shots,0),tg=Object.values(roles).reduce((s,r)=>s+r.goals,0),cs=Object.values(rc).reduce((s,r)=>s+r.shots,0),cg=Object.values(rc).reduce((s,r)=>s+r.goals,0);
 console.log('\n| Rolle | Schüsse-Anteil phys | komp | Tor-Anteil phys | komp | Assist-Anteil komp |\n| --- | ---: | ---: | ---: | ---: | ---: |');out.roles={};
 for(const role of Object.keys(roles).sort((x,y)=>roles[y].shots-roles[x].shots)){const a=roles[role],b=rc[role]||{shots:0,goals:0,assists:0};out.roles[role]={shotShare:[a.shots/ts,b.shots/cs],goalShare:[a.goals/tg,b.goals/cg],assistShare:b.assists/ca};console.log(`| ${role} | ${p(a.shots/ts,1)} | ${p(b.shots/cs,1)} | ${p(a.goals/tg,1)} | ${p(b.goals/cg,1)} | ${p(b.assists/ca,1)} |`);}
 console.log(`\nAssists je Tor (komp): ${f(ca/cg)}; im ausgespielten Spiel werden keine Vorlagen gezählt.`);
 // load
 const LINE={'ball-playing-defender':'def','cover-defender':'def',stopper:'def','ball-winner':'mid','box-to-box':'mid',playmaker:'mid',dribbler:'att',poacher:'att',striker:'att','target-player':'att',winger:'att'};
 const compLoad=[];for(const j of jobs.filter(j=>j.size===size))for(const m of j.matches)for(const x of m.load||[])if(x[4]>=95)compLoad.push({sta:x[0],line:x[1]?'gk':LINE[x[5]]||'?',used:x[2]-x[3]});
 const pl=physLoad.filter(x=>x.size===size&&x.team===0);
 console.log('\n| Verbrauch (Frischepunkte, volle Partie) | physisch | kompakt |\n| --- | ---: | ---: |');out.load={};
 for(const line of ['def','mid','att','gk']){const a=pl.filter(x=>x.line===line),b=compLoad.filter(x=>x.line===line);out.load[line]=[mean(a.map(x=>x.used)),mean(b.map(x=>x.used))];console.log(`| ${{def:'Abwehr',mid:'Mittelfeld',att:'Angriff',gk:'Torwart'}[line]} | ${f(mean(a.map(x=>x.used)),1)} | ${f(mean(b.map(x=>x.used)),1)} |`);}
 const pf=pl.filter(x=>x.line!=='gk'),cf=compLoad.filter(x=>x.line!=='gk');
 for(const [lo,hi] of [[0,8],[8,10],[10,12],[12,14],[14,21]])console.log(`| Ausdauer ${lo}–${hi} | ${f(mean(pf.filter(x=>x.sta>=lo&&x.sta<hi).map(x=>x.used)),1)} | ${f(mean(cf.filter(x=>x.sta>=lo&&x.sta<hi).map(x=>x.used)),1)} |`);
 console.log('');
}
if(args.includes('--json'))fs.writeFileSync(`outputs/si6/table-${label}.json`,JSON.stringify(result,null,1));
