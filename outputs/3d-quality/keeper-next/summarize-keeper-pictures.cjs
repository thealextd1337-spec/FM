'use strict';
// Summarises captured keeper picture windows into actual native sequences.
const fs=require('node:fs'),path=require('node:path');const dir=path.join(__dirname,'pictures');
const seqs=[];
for(const f of fs.readdirSync(dir).filter(f=>f.startsWith('windows-')).sort())for(const w of JSON.parse(fs.readFileSync(path.join(dir,f)))){
 const keepers=new Set();for(const e of w)for(const p of e.pic.players)if(['save','goalKick'].includes(p.action)||p.held!==undefined)keepers.add(p.id);
 for(const id of keepers){let cur=null;
  for(const e of w){const p=e.pic.players.find(p=>p.id===id);if(!p)continue;const k=p.action+'|'+p.actionId;
   if(!cur||cur.key!==k){if(cur)seqs.push(cur);cur=p.action==='idle'?null:{file:f,key:k,action:p.action,actionId:p.actionId,from:e.pic.sequence,steps:0,turned:e.pic.turned,facing:p.facing,position:p.position,contact:p.contactPoint,ownerSteps:0,flightSteps:0,saved:new Set(),parry:new Set(),goal:new Set(),smother:new Set(),held:new Set(),phase:new Set(),maxRecovery:0,ownedWithRecovery:0,minBallToContactAfter:Infinity};if(!cur)continue;}
   cur.steps++;if(e.pic.owner===id)cur.ownerSteps++;if(e.pic.ballInFlight)cur.flightSteps++;for(const k of ['saved','parry','goal','smother','held','phase'])cur[k].add(String(p[k]));cur.maxRecovery=Math.max(cur.maxRecovery,p.recovery);
   if(p.recovery>0&&e.pic.owner===id)cur.ownedWithRecovery++;
   if(p.recovery>0&&p.contactPoint)cur.minBallToContactAfter=Math.min(cur.minBallToContactAfter,Math.hypot(...e.pic.ball.map((v,i)=>v-p.contactPoint[i])));
  }if(cur)seqs.push(cur);}
}
const out=seqs.map(s=>({file:s.file,from:s.from,action:s.action,actionId:s.actionId,steps:s.steps,turned:s.turned,facing:s.facing.map(v=>+v.toFixed(2)),position:s.position.map(v=>+v.toFixed(2)),contact:s.contact&&s.contact.map(v=>+v.toFixed(2)),lateral:s.contact?+(()=>{const f=[s.facing[0],s.facing[2]],n=Math.hypot(...f)||1,r=[f[1]/n,-f[0]/n];return ((s.contact[0]-s.position[0])*r[0]+(s.contact[2]-s.position[2])*r[1]).toFixed(2)})():null,ownerSteps:s.ownerSteps,flightSteps:s.flightSteps,ownedWithRecovery:s.ownedWithRecovery,maxRecovery:+s.maxRecovery.toFixed(2),saved:[...s.saved],parry:[...s.parry],goal:[...s.goal],smother:[...s.smother],held:[...s.held],phase:[...s.phase]}));
fs.writeFileSync(path.join(__dirname,'keeper-sequences.json'),JSON.stringify(out,null,1));
for(const s of out)console.log([s.file.slice(8,20),s.from,s.action,s.actionId,'n'+s.steps,'own'+s.ownerSteps,'ownRec'+s.ownedWithRecovery,'fl'+s.flightSteps,'rec'+s.maxRecovery,'sv'+s.saved,'pa'+s.parry,'g'+s.goal,'sm'+s.smother,'held'+s.held,'ph'+s.phase,'cp'+(s.contact||'-'),'lat'+s.lateral,'turned'+s.turned].join(' '));
