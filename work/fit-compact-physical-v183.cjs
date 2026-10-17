'use strict';
// Offline re-fit of the compact constants on a physical series (default sb2-f; k2-f gives the SI-6 fit). Node only, no browser.
// Per pitch size: Poisson fit of the team shots (shotBase, shotSlope, deepDefenceShots with the gap knee/plateau of dist), source mix per match,
// logit fits of on-target and goal-given-on-target (free fit and intercepts per source with the stored levers). Prints a proposal; nothing is written
// to dist. The proposal is the start of the replay calibration (work/measure-compact-physical-v183.cjs --variants=...).
// Usage: node work/fit-compact-physical-v183.cjs [series,series,series] [tag]   -> outputs/compact-balance-v183/fit-<tag>.json
const fs=require('fs'),path=require('path');process.chdir(path.resolve(__dirname,'..'));
const series=(process.argv[2]||'sb2-f-trace40000,sb2-f-si183b-trace40000,sb2-f-si183c-trace40000').split(',');
const ms=series.flatMap(n=>JSON.parse(fs.readFileSync(`outputs/si183/${n}.json`,'utf8')).matches.filter(r=>r.finished&&!r.engineError&&!r.stall&&r.rec&&r.extras?.sik));
const source=s=>s.penalty?'penalty':s.kind==='direct-free-kick'?'direct-free-kick':s.kind==='header'||s.kind==='volley'?'header-volley':s.restart?.type==='corner'&&s.restart.ago<=10&&s.restart.team===s.team?'corner':s.restart?.type==='freeKick'&&s.restart.ago<=10&&s.restart.team===s.team?'free-kick-follow':(s.rebound?s.rebound.ago<=5:s.lastLoose&&s.lastLoose.team===s.team&&s.lastLoose.ago<=5)?'rebound':(s.sources||[]).includes('counter')?'counter':s.range>22?'long':'open';
const SRC=['open','long','header-volley','rebound','corner','free-kick-follow','direct-free-kick'];
// constants of the current dist
const text=fs.readFileSync('dist/world-player-performance-v155.js','utf8');
const start=text.indexOf('const v183CompactBalance=')+'const v183CompactBalance='.length,end=text.indexOf('function v183CompactSnapshot');
const B0=eval('('+text.slice(start,end).trim().replace(/;$/,'').replace(/Object\.freeze/g,'')+')');
const out={};
const gapF=(B,gap)=>{const a=Math.abs(gap);return Math.sign(gap)*(a<=B.gapKnee?a:B.gapKnee+(a-B.gapKnee)*B.gapOver);};
function rateF(B,S,own,other,home,deep){const rate=S.shotBase*Math.exp(S.shotSlope*gapF(B,own-other))*(home?B.homeShotFactor:1)*(deep?S.deepDefenceShots:1);const fade=Math.min(1,Math.max(0,(Math.abs(own-other)-B.gapKnee)/B.gapFade));return rate>S.shotKnee&&fade>0?rate+(S.shotKnee+(rate-S.shotKnee)*B.shotOver-rate)*fade:rate;}
function nm(f,x0,step,iters=400){const n=x0.length;let P=[x0.slice()];for(let i=0;i<n;i++){const x=x0.slice();x[i]+=step[i];P.push(x);}let V=P.map(f);
 for(let it=0;it<iters;it++){const idx=[...V.keys()].sort((a,b)=>V[a]-V[b]);P=idx.map(i=>P[i]);V=idx.map(i=>V[i]);const c=P[0].map((_,j)=>P.slice(0,n).reduce((s,p)=>s+p[j],0)/n);const refl=c.map((v,j)=>v+(v-P[n][j])),fr=f(refl);
  if(fr<V[0]){const ex=c.map((v,j)=>v+2*(v-P[n][j])),fe=f(ex);if(fe<fr){P[n]=ex;V[n]=fe;}else{P[n]=refl;V[n]=fr;}}else if(fr<V[n-1]){P[n]=refl;V[n]=fr;}else{const con=c.map((v,j)=>v+.5*(P[n][j]-v)),fc=f(con);if(fc<V[n]){P[n]=con;V[n]=fc;}else{for(let i=1;i<=n;i++){P[i]=P[i].map((v,j)=>P[0][j]+.5*(v-P[0][j]));V[i]=f(P[i]);}}}}
 const i=V.indexOf(Math.min(...V));return{x:P[i],v:V[i]};}
function logit(rows,k){
 const b=new Array(k).fill(0);for(let it=0;it<40;it++){const g=new Array(k).fill(0),H=Array.from({length:k},()=>new Array(k).fill(0));for(const r of rows){let z=r.off||0;for(let j=0;j<k;j++)z+=b[j]*r.x[j];const q=1/(1+Math.exp(-z)),w=q*(1-q);for(let j=0;j<k;j++){g[j]+=(r.y-q)*r.x[j];for(let l=0;l<k;l++)H[j][l]+=w*r.x[j]*r.x[l];}}
  for(let j=0;j<k;j++)H[j][j]+=1e-6;
  const A=H.map((row,i)=>[...row,g[i]]);for(let i=0;i<k;i++){let p=i;for(let j=i+1;j<k;j++)if(Math.abs(A[j][i])>Math.abs(A[p][i]))p=j;[A[i],A[p]]=[A[p],A[i]];for(let j=i+1;j<k;j++){const f=A[j][i]/A[i][i];for(let l=i;l<=k;l++)A[j][l]-=f*A[i][l];}}
  const d=new Array(k).fill(0);for(let i=k-1;i>=0;i--){let s=A[i][k];for(let j=i+1;j<k;j++)s-=A[i][j]*d[j];d[i]=s/A[i][i];}
  for(let j=0;j<k;j++)b[j]+=d[j];}
 return b;}
for(const size of ['standard','large']){
 const S=B0.sizes[size],M=ms.filter(r=>r.size===size);
 const tm=[];for(const r of M)for(let i=0;i<2;i++){const t=r.teams[i],o=r.teams[1-i];tm.push({shots:t.stats.shots-r.rec.shots.filter(s=>s.team===i&&s.penalty).length,own:t.ovr,other:o.ovr,home:t.venue==='home',deep:o.tactics?.defense==='Tief'});}
 const nll=(logBase,slope,logDeep)=>{const S2={...S,shotBase:Math.exp(logBase),shotSlope:slope,deepDefenceShots:Math.exp(logDeep)};let v=0;for(const t of tm){const l=rateF(B0,S2,t.own,t.other,t.home,t.deep);v+=l-t.shots*Math.log(l);}return v;};
 const fit=nm(x=>nll(x[0],x[1],x[2]),[Math.log(S.shotBase),S.shotSlope,Math.log(S.deepDefenceShots)],[.05,.02,.1]);
 const shotsPerMatch=M.reduce((s,r)=>s+r.teams[0].stats.shots+r.teams[1].stats.shots,0)/M.length;
 console.log(`\n## ${size}: n=${M.length} team rows ${tm.length}; shots/match ${shotsPerMatch.toFixed(3)}`);
 console.log(`old shotBase ${S.shotBase} slope ${S.shotSlope} deep ${S.deepDefenceShots}  nll ${nll(Math.log(S.shotBase),S.shotSlope,Math.log(S.deepDefenceShots)).toFixed(1)}`);
 console.log(`new shotBase ${Math.exp(fit.x[0]).toFixed(3)} slope ${fit.x[1].toFixed(4)} deep ${Math.exp(fit.x[2]).toFixed(3)} nll ${fit.v.toFixed(1)}`);
 const fit2=nm(x=>nll(x[0],S.shotSlope,x[1]),[Math.log(S.shotBase),Math.log(S.deepDefenceShots)],[.05,.1]);
 console.log(`old slope fixed: shotBase ${Math.exp(fit2.x[0]).toFixed(3)} deep ${Math.exp(fit2.x[1]).toFixed(3)} nll ${fit2.v.toFixed(1)}`);
 const shots=M.flatMap(r=>r.rec.shots.filter(s=>!s.penalty).map(s=>({s,r})));
 const mix={};for(const {s} of shots){const k=source(s);mix[k]=(mix[k]||0)+1;}
 console.log('mix per match',Object.entries(mix).map(([k,v])=>`${k} ${(v/M.length).toFixed(3)}`).join(', '));
 const sh=shots.map(({s,r})=>{const i=s.team,gap=r.teams[i].ovr-r.teams[1-i].ovr;const on=['goal','caught','parried'].includes(s.result);return{src:source(s),on,goal:s.result==='goal',fin:s.skills.fin,gk:s.skills.gk,gap,gapT:gapF(B0,gap)};}).filter(x=>SRC.includes(x.src));
 const onRows=sh.map(x=>({y:x.on?1:0,x:[...SRC.map(n=>x.src===n?1:0),x.fin-10,x.gapT]}));
 const bOn=logit(onRows,SRC.length+2);
 console.log('on-target free fit: ',SRC.map((n,i)=>`${n} ${bOn[i].toFixed(3)}`).join(', '),`| onFin ${bOn[SRC.length].toFixed(3)} onGap ${bOn[SRC.length+1].toFixed(3)}`);
 const onShots=sh.filter(x=>x.on);
 const gRows=onShots.map(x=>({y:x.goal?1:0,x:[...SRC.map(n=>x.src===n?1:0),x.fin-10,x.gk-10]}));
 const bG=logit(gRows,SRC.length+2);
 console.log('goal|on free fit: ',SRC.map((n,i)=>`${n} ${bG[i].toFixed(3)}`).join(', '),`| goalFin ${bG[SRC.length].toFixed(3)} goalGk ${bG[SRC.length+1].toFixed(3)}`);
 const L=B0.levers;
 const onI=logit(sh.map(x=>({y:x.on?1:0,off:L.onFin*(x.fin-10)+L.onGap*x.gapT,x:SRC.map(n=>x.src===n?1:0)})),SRC.length);
 const gI=logit(onShots.map(x=>({y:x.goal?1:0,off:L.goalFin*(x.fin-10)+L.goalGk*(x.gk-10),x:SRC.map(n=>x.src===n?1:0)})),SRC.length);
 console.log('old slopes, intercepts on  :',SRC.map((n,i)=>`${n} ${onI[i].toFixed(3)} (was ${S.on[n]})`).join(', '));
 console.log('old slopes, intercepts goal:',SRC.map((n,i)=>`${n} ${gI[i].toFixed(3)} (was ${S.goal[n]})`).join(', '));
 console.log('n by source (shots/on)',SRC.map(n=>`${n} ${sh.filter(x=>x.src===n).length}/${onShots.filter(x=>x.src===n).length}`).join(', '));
 out[size]={shotBase:Math.exp(fit.x[0]),shotSlope:fit.x[1],deep:Math.exp(fit.x[2]),fit2:{shotBase:Math.exp(fit2.x[0]),deep:Math.exp(fit2.x[1])},mix:Object.fromEntries(Object.entries(mix).map(([k,v])=>[k,v/M.length])),on:Object.fromEntries(SRC.map((n,i)=>[n,onI[i]])),goal:Object.fromEntries(SRC.map((n,i)=>[n,gI[i]])),free:{on:bOn,goal:bG}};
}
fs.mkdirSync('outputs/compact-balance-v183',{recursive:true});fs.writeFileSync('outputs/compact-balance-v183/fit-'+(process.argv[3]||'sb2')+'.json',JSON.stringify(out,null,1));
