'use strict';
// SI-K measurement: runs work/measure-si-offball-v183.cjs (and thereby
// work/measure-si183.cjs) unchanged in this process and adds read-only
// observers for the calibration (plan 10): per shot the shooter's role,
// mental values, personality weights, the opposing keeper and the ledger
// sources; per cross whether it was a corner or a free-kick cross and who won
// the landing; per player a compact summary (role, skills, shots, goals).
// The observers only read state and wrap functions; they never call
// Math.random and never write match state. All flags of the two harnesses
// apply (--packages=default,-pkg, --params, --clockRate, --seedPrefix, ...).
// Usage: node work/measure-si-calibration-v183.cjs --clockRate=0.42 --clubs=96 --workers=6 --port=4250 --seedPrefix=p01r132 --label=sik-a-p01r132
// Table: node work/table-si-calibration-v183.cjs <label>[,<label>...] [<baseLabel>[,...]]
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const file=path.join(__dirname,'measure-si-offball-v183.cjs');let outer=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
const marker='// Run the patched harness in place of measure-si183.cjs';
if(outer.split(marker).length!==2)throw Error('measure-si-offball-v183.cjs: run marker not found');
const patches=String.raw`
// ---- SI-K observers (measure-si-calibration-v183.cjs) ----
// Shot records: role, mental values, personality, opposing keeper.
rep(\`const skills=p=>({fin:p.fin,tec:p.tec,pas:p.pas,spd:p.spd,air:p.air,pos:p.pos,effFin:+ability(p,'fin').toFixed(2),effTec:+ability(p,'tec').toFixed(2)});\`,
\`const skills=p=>{const keeper=match.people.find(q=>q.t!==p.t&&q.keeper),pers=typeof v183Personality==='function'?v183Personality(p):null;
  return{fin:p.fin,tec:p.tec,pas:p.pas,spd:p.spd,air:p.air,pos:p.pos,effFin:+ability(p,'fin').toFixed(2),effTec:+ability(p,'tec').toFixed(2),effAir:+ability(p,'air').toFixed(2),
   role:p.tacticalRole||null,calm:p.calm??null,ant:p.ant??null,dec:p.dec??null,shootWeight:pers?+pers.shootWeight.toFixed(3):null,riskWeight:pers?+pers.riskWeight.toFixed(3):null,
   gk:keeper?keeper.gk:null,effGk:keeper?+ability(keeper,'gk').toFixed(2):null};};\`);
// Crosses: corner / free-kick flag per ledger event of the kicked cross.
rep(\`if(R&&cross&&p&&(p.stats.crosses||0)>before){\`,
\`if(R&&cross&&p&&(p.stats.crosses||0)>before){const ev=match.flight&&typeof v117Flights!=='undefined'?v117Flights.get(match.flight):null;R.sik.crosses.push({eventId:ev?.id??null,team:p.t,corner:!!args[2]?.corner,restart:!!args[2]?.restart,range:+toGoal(p,p.t).toFixed(1)});}
  if(R&&cross&&p&&(p.stats.crosses||0)>before){\`);
rep(\`si2:{crosses:[],\`,\`sik:{crosses:[],replays:[],replaySeen:new WeakSet(),zone:{decisions:0,wide30:0,wide30box:0,wide36:0,wide36box:0},ce:{n:0,pos:0,arr:0,hx:0,land:0,duel:0,block:0,hxMax:0}},si2:{crosses:[],\`);
// Cross estimates (read-only wrapper of a pure function): how often an eligible cross is valued.
rep(\`wrap('v183ReboundFinish',\`,\`wrap('v183CrossEstimate',(base,self,args)=>{const R=P.rec,v=base.apply(self,args);if(R&&v&&v.eligible){const c=R.sik.ce;c.n++;if(v.arrival>0){c.pos++;c.arr+=v.arrival;c.hx+=v.headerXg||0;c.land+=v.land||0;c.duel+=v.duel||0;c.block+=v.block||0;if((v.headerXg||0)>c.hxMax)c.hxMax=v.headerXg;}}return v;});
 // Goal replays: the harness turns them off (v103CanReplay false), so v103StartReplay returns early. It is still called at the
 // moment the game would start the replay; the duration is computed exactly as v103StartReplay does (frames from 2.5 clock
 // units before to 0.85 after the goal, divided by 0.72; 2.2 s for a penalty goal; no replay with fewer than two frames).
 wrap('v103StartReplay',(base,self,args)=>{const R=P.rec,[current,state]=args,pending=state?.pending;
  if(R&&pending&&!R.sik.replaySeen.has(pending)){R.sik.replaySeen.add(pending);const frames=state.history.filter(f=>f.clock>=pending.at-2.5&&f.clock<=pending.at+.85);
   R.sik.replays.push(pending.penalty?2.2:frames.length<2?0:+((frames.at(-1).clock-frames[0].clock)/.72).toFixed(3));}
  return base.apply(self,args);});
 wrap('v157Decide',(base,self,args)=>{const R=P.rec,[m,p]=args;if(R&&p&&!p.keeper&&m.owner===p){const range=toGoal(p,p.t),lat=Math.abs(p.x-.5)*W(),box=m.people.some(q=>q.t===p.t&&!q.keeper&&q!==p&&toGoal(q,p.t)<16),z=R.sik.zone;z.decisions++;if(range<30&&lat>8){z.wide30++;if(box)z.wide30box++;}if(range<36&&lat>6){z.wide36++;if(box)z.wide36box++;}}return base.apply(self,args);});
 wrap('v183ReboundFinish',\`);
// Extras: shot sources from the ledger, cross outcomes, player summary.
rep(\`crossProbe:window.__crossProbe?{...window.__crossProbe}:null,\`,
\`crossProbe:window.__crossProbe?{...window.__crossProbe}:null,
   sik:instrument?(()=>{const byIdL=new Map(ledger.map(e=>[e.id,e])),children=new Map();for(const e of ledger)if(e.parentId!=null)(children.get(e.parentId)||children.set(e.parentId,[]).get(e.parentId)).push(e);
    // Rebound shot: the shot's ball-event ancestry holds a loose ball that itself descends from a shot of the same team; ago in real seconds.
    const rateK=typeof v183Rate==='function'?v183Rate(m):MATCH_SPEED,rebOf=(s,e)=>{if(!e)return null;let x=byIdL.get(e.parentId);for(let i=0;i<4&&x;i++){if(x.kind==='loose-ball'){let y=byIdL.get(x.parentId);for(let j=0;j<3&&y;j++){if(y.shot)return y.team===s.team?{ago:+((e.at-x.at)/rateK).toFixed(2),from:y.result}:null;y=byIdL.get(y.parentId);}return null;}x=byIdL.get(x.parentId);}return null;};
    for(const s of R.shots){const e=byIdL.get(s.eventId);s.rebound=rebOf(s,e);s.sources=e?.sources?[...e.sources]:[];let x=e&&byIdL.get(e.parentId),chain=[];for(let i=0;i<4&&x;i++){chain.push(x.kind+(x.result?':'+x.result:''));x=byIdL.get(x.parentId);}s.chain=chain;}
    const crosses=R.sik.crosses.map(c=>{const e=byIdL.get(c.eventId),kids=(children.get(c.eventId)||[]).sort((a,b)=>a.id-b.id),first=kids[0]||null,recv=e?.receiverPid?people.find(q=>q.pid===e.receiverPid):null;
     const won=!!(e&&(e.result==='goal'||recv&&recv.t===c.team||first&&first.team===c.team&&first.kind!=='loose-ball'));
     return{...c,result:e?.result??null,receiverTeam:recv?recv.t:null,first:first?first.kind:null,firstTeam:first?first.team:null,won,headerShot:kids.some(k=>k.shot&&k.team===c.team)};});
    const players=people.map(p=>{const pers=typeof v183Personality==='function'?v183Personality(p):null;return{pid:p.pid,t:p.t,keeper:!!p.keeper,role:p.tacticalRole||null,line:p.assignedLine||p.line||null,fin:p.fin,tec:p.tec,pas:p.pas,air:p.air,gk:p.gk??null,calm:p.calm??null,ant:p.ant??null,dec:p.dec??null,shootWeight:pers?+pers.shootWeight.toFixed(3):null,riskWeight:pers?+pers.riskWeight.toFixed(3):null,shots:p.stats.shots||0,goals:p.stats.goals||0,passes:p.stats.passes||0,crosses:p.stats.crosses||0,headers:p.stats.headers||0,volleys:p.stats.volleys||0};});
    // Transient decision trace (needs --traceLimit large enough for a match): option choices, crosses among the best three, finish model per shot.
    const tr=typeof v183TraceEntries==='function'?v183TraceEntries(m):[],opts=tr.filter(e=>e.type==='options'),chosen={},crossTop=opts.filter(e=>(e.top||[]).some(x=>x.kind==='cross'));for(const e of opts)chosen[e.kind]=(chosen[e.kind]||0)+1;
    const finish=tr.filter(e=>e.type==='finish.shot').map(e=>[e.kind,e.range,e.xg,e.on,e.goal?1:0,e.onTarget?1:0,e.blocked?1:0,e.shooter]);
    return{crosses,players,replays:R.sik.replays,replaySeconds:+R.sik.replays.reduce((a,b)=>a+b,0).toFixed(2),ce:R.sik.ce,zone:R.sik.zone,trace:{entries:tr.length,first:tr[0]?.seq??null,options:opts.length,chosen,crossTop:crossTop.length,crossGap:crossTop.map(e=>{const c=e.top.find(x=>x.kind==='cross');return +(e.top[0].u-c.u).toFixed(4);}),finish},
     finishTrace:tr.filter(e=>e.type==='finish.shot'||e.type==='finish.parry')};})():null,\`);
`;
outer=outer.replace(marker,patches.split('\\`').join('`')+'\n'+marker);
// The offball wrapper compiles measure-si183.cjs with __dirname = work/; keep its module identity.
const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(__dirname);m._compile(outer,file);
