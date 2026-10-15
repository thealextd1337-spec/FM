'use strict';
// SI-2 measurement: runs work/measure-si183.cjs unchanged in this process with
// additional in-page observers for the SI-2 criteria (plan 7, "SI-2"):
// moved team-mates per possession, offsides, attackers' rebound wins after a
// parry/block, box occupation at cross release, follow-up/rebound shots,
// pattern counts, ledger sources and carrier/runner speeds. The observers only
// read state and wrap functions; they never call Math.random. Results carry the
// standard per-match record plus `extras.offball`.
// --packages: as in measure-si183 (comma list switched on, "none", "all") plus
// "-pkg" to switch a package off and "default" as a no-op, so a package that is
// on by default can be switched off: --packages=default,-offball. Packages not
// named keep the constructor default (v183CreateSi).
// Usage: node work/measure-si-offball-v183.cjs --clockRate=0.42 --clubs=24 --workers=6 --port=4262 --label=si2-on
//        node work/measure-si-offball-v183.cjs --packages=default,-offball --clockRate=0.42 --clubs=24 --workers=6 --port=4262 --label=si2-off
// Paired evaluation: node work/table-si-offball-v183.cjs <baseLabel> <label>
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const file=path.join(__dirname,'measure-si183.cjs');let text=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
const rep=(a,b)=>{const n=text.split(a).length-1;if(n!==1)throw Error(`expected one match, got ${n}: ${a.slice(0,90)}`);text=text.replace(a,b);};

// 0) Package switches: "-pkg" switches a package off, "default" is a no-op
// (packages not named keep the constructor default from v183CreateSi).
rep(` const list=packagesArg==='none'?[]:packagesArg==='all'?PACKAGES:packagesArg.split(',').filter(Boolean);
 for(const p of list)assert(PACKAGES.includes(p),'Unknown SI package '+p);
 si.packages=packagesArg==='none'||packagesArg==='all'?Object.fromEntries(PACKAGES.map(p=>[p,list.includes(p)])):Object.fromEntries(list.map(p=>[p,true]));`,
` const items=packagesArg==='none'?[]:packagesArg==='all'?PACKAGES:packagesArg.split(',').filter(Boolean).filter(p=>p!=='default');
 const list=items.map(p=>p.replace(/^-/,''));for(const p of list)assert(PACKAGES.includes(p),'Unknown SI package '+p);
 si.packages=packagesArg==='none'||packagesArg==='all'?Object.fromEntries(PACKAGES.map(p=>[p,list.includes(p)])):Object.fromEntries(items.map(p=>[p.replace(/^-/,''),!p.startsWith('-')]));`);

// 1) Function wraps inside installObservers (page context).
rep(`wrap('v50GoalKick',(base,self,args)=>{`,
`// SI-2: cross release with box occupation (allies within 16 m of the goal and 12 m of the centre line), only when the cross is actually kicked.
 wrap('v55HighPass',(base,self,args)=>{const R=P.rec,p=args[0],cross=!!args[2]?.cross,before=p?.stats?.crosses||0,value=base.apply(self,args);
  if(R&&cross&&p&&(p.stats.crosses||0)>before){const box=match.people.filter(q=>q.t===p.t&&q!==p&&!q.keeper&&toGoal(q,p.t)<16&&Math.abs(q.x-.5)*W()<12).length;R.si2.crosses.push({tick:R.tick,team:p.t,box,wide:+(Math.abs(p.x-.5)*W()).toFixed(1),range:+toGoal(p,p.t).toFixed(1)});}return value;});
 wrap('v183OffballPattern',(base,self,args)=>{const R=P.rec,kind=args[1];if(R)R.si2.patterns[kind]=(R.si2.patterns[kind]||0)+1;return base.apply(self,args);});
 wrap('v183ReboundFinish',(base,self,args)=>{const R=P.rec,value=base.apply(self,args);if(R&&value){R.si2.reboundFinish++;if(value.rebound)R.si2.reboundFinishNew++;}return value;});
 wrap('v183OffballOffers',(base,self,args)=>{const R=P.rec,m=args[0],until=m.attackFlow.offerUntil,value=base.apply(self,args);
  if(R&&m.attackFlow.offerUntil!==until){R.si2.cycles++;for(const it of Object.values(m.attackFlow.intents)){const k=it.cat||it.type;R.si2.cats[k]=(R.si2.cats[k]||0)+1;}R.si2.intentSum+=Object.keys(m.attackFlow.intents).length;}return value;});
 wrap('v50GoalKick',(base,self,args)=>{`);

// 2) Recorder fields.
rep(`teamStat(t,k){let n=0;for(const p of m.people)if(p.t===t)n+=p.stats[k]||0;`,
`si2:{crosses:[],patterns:{},reboundFinish:0,reboundFinishNew:0,cycles:0,cats:{},intentSum:0,rebounds:[],carrier:{sum:0,n:0,max:0},runner:{sum:0,n:0,fast:0},moved:[],offsides:0},
   teamStat(t,k){let n=0;for(const p of m.people)if(p.t===t)n+=p.stats[k]||0;`);

// 3) Loose balls from shots: next owner within 3 s decides the rebound win.
rep(`if(e.kind==='loose-ball'){const parent=led.find(x=>x.id===e.parentId);if(parent?.shot)R.lastLooseShot={team:parent.team,tick:ticks};}`,
`if(e.kind==='loose-ball'){const parent=led.find(x=>x.id===e.parentId);if(parent?.shot)R.lastLooseShot={team:parent.team,tick:ticks};
     let chain=parent;for(let k=0;k<3&&chain&&!chain.shot;k++)chain=led.find(x=>x.id===chain.parentId);
     if(chain?.shot)R.si2.rebounds.push({tick:ticks,team:chain.team,kind:parent?.kind||null,result:null,owner:null,after:null});}`);
rep(`const now=snap();
   // zone presence of a controlling field player
   const o=m.owner;`,
`const now=snap();
   // zone presence of a controlling field player
   const o=m.owner;
   // SI-2: rebound resolution, moved team-mates, carrier and runner speeds, offsides.
   for(const rb of R.si2.rebounds){if(rb.result!==null)continue;if(o){rb.result=o.t===rb.team?'attack':'defence';rb.owner=o.keeper?'keeper':'field';rb.after=+((ticks-rb.tick)*dt).toFixed(2);}else if((ticks-rb.tick)*dt>3){rb.result='none';rb.after=3;}}
   if(o&&!o.keeper){const body=o.offenseMotion;if(body){const v=Math.hypot(body.vx,body.vy);R.si2.carrier.sum+=v;R.si2.carrier.n++;if(v>R.si2.carrier.max)R.si2.carrier.max=v;}
    for(const p of m.people){if(p.t!==o.t||p.keeper||p===o)continue;const b=p.offenseMotion;if(!b)continue;const v=Math.hypot(b.vx,b.vy);R.si2.runner.sum+=v;R.si2.runner.n++;if(v>=2.5){R.si2.runner.fast++;if(R.phase&&R.phase.team===o.t)(R.phase.movedSet||(R.phase.movedSet={}))[p.pid]=1;}}}
   if(m.setPiece&&m.setPiece!==R.si2.lastSetPiece){R.si2.lastSetPiece=m.setPiece;if(m.setPiece.type==='offside')R.si2.offsides++;}`);

// 4) Moved team-mates per possession phase.
rep(`ph.passOk=R.teamStat(ph.team,'passComplete')-ph.passOk0;delete ph.passes0;delete ph.passOk0;`,
`ph.passOk=R.teamStat(ph.team,'passComplete')-ph.passOk0;delete ph.passes0;delete ph.passOk0;ph.moved=Object.keys(ph.movedSet||{}).length;delete ph.movedSet;if(ph.secs>=2)R.si2.moved.push(ph.moved);`);

// 5) Extras.
rep(`crossProbe:window.__crossProbe?{...window.__crossProbe}:null};`,
`crossProbe:window.__crossProbe?{...window.__crossProbe}:null,
   offball:instrument?(()=>{const S=R.si2,sources={};for(const e of ledger)for(const s of e.sources||[])sources[s]=(sources[s]||0)+1;
    const resolved=S.rebounds.filter(r=>r.result!==null),wins=resolved.filter(r=>r.result==='attack').length;
    const reboundShots=R.shots.filter(s=>s.lastLoose&&s.lastLoose.team===s.team&&s.lastLoose.ago<=5).length;
    return{offsides:S.offsides,moved:S.moved,movedMean:S.moved.length?+(S.moved.reduce((a,b)=>a+b,0)/S.moved.length).toFixed(3):null,rebounds:resolved.length,reboundWins:wins,reboundNone:resolved.filter(r=>r.result==='none').length,reboundShots,crosses:S.crosses,crossBox2:S.crosses.filter(c=>c.box>=2).length,patterns:S.patterns,reboundFinish:S.reboundFinish,reboundFinishNew:S.reboundFinishNew,cycles:S.cycles,cats:S.cats,intentsPerCycle:S.cycles?+(S.intentSum/S.cycles).toFixed(2):null,carrierSpeed:S.carrier.n?+(S.carrier.sum/S.carrier.n).toFixed(3):null,carrierMax:+S.carrier.max.toFixed(2),runnerSpeed:S.runner.n?+(S.runner.sum/S.runner.n).toFixed(3):null,runnerFastShare:S.runner.n?+(S.runner.fast/S.runner.n).toFixed(3):null,sources};})():null};`);

// Run the patched harness in place of measure-si183.cjs (same __dirname, flags and outputs).
const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(__dirname);m._compile(text,file);
