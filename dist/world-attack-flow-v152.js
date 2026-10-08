'use strict';

// New physical matches share one offensive flow in 2D and Unity. Intents are
// plain checkpoint data; choosing an offer never consumes random numbers.
function v152Active(m){return Boolean(v65WorldActive&&m?.attackFlow?.version===152);}
function v152Seconds(m){return m.elapsed/MATCH_SPEED;}
function v152PrepareAttack(m){
 if(!v152Active(m))return;
 const flow=m.attackFlow,now=v152Seconds(m);
 if(v121PositioningPaused(m)){flow.intents={};flow.ownerPid=null;flow.team=null;return;}
 const possession=v123PossessionTeam(m),owner=m.owner;
 if(possession!==flow.team){flow.intents={};flow.team=possession;flow.ownerPid=null;}
 for(const [id,intent]of Object.entries(flow.intents))if(intent.until<now||!m.people.some(p=>p.pid===id&&!p.slideActive))delete flow.intents[id];
 if(!owner||owner.keeper)return;
 const changed=flow.ownerPid!==owner.pid;flow.ownerPid=owner.pid;
 const s=v150Scale(),dir=owner.t===0?-1:1,allies=m.people.filter(p=>p.t===owner.t&&!p.keeper&&p!==owner&&!p.slideActive),rivals=m.people.filter(p=>p.t!==owner.t&&!p.keeper);
 if(changed){
  // Reconsider quickly after receiving or winning the ball, but retain the
  // native first-touch window. No skipped preparation or artificial possession.
  flow.decisionOwner=owner.pid;flow.decisionAt=now+.20+(20-ability(owner,'tec'))*.007;
  if(Number.isFinite(m.next))m.next=Math.min(m.next,flow.decisionAt*MATCH_SPEED);
 }
 if(typeof v159Offers==='function'&&v159Offers(m,owner,allies,rivals))return;
 if(flow.plannedOwner===owner.pid&&now<(flow.reconsiderAt||0))return;
 flow.plannedOwner=owner.pid;flow.reconsiderAt=now+.45;
 const reserved=Object.entries(flow.intents).filter(([,i])=>i.type==='follow'&&i.until>now);
 flow.intents=Object.fromEntries(reserved);
 const runners=allies.filter(p=>!hasInstruction(p,'support')&&(p.assignedLine||p.line)!=='def'&&p.role>=0)
  .sort((a,b)=>(hasInstruction(b,'deep')?4:0)+((b.assignedLine||b.line)==='att'?2:0)+b.role*.4-((hasInstruction(a,'deep')?4:0)+((a.assignedLine||a.line)==='att'?2:0)+a.role*.4)||a.n-b.n);
 const occupied=reserved.map(([,i])=>i);
 for(const p of runners.slice(0,2)){
  if(flow.intents[p.pid])continue;
  const lead=(hasInstruction(p,'deep')?8:6)+ability(p,'pos')*.10,side=p.bx<.5?-1:1;
  const options=[p.x,clamp(owner.x+side*6/s.x,v55Field.left+1/s.x,v55Field.right-1/s.x),clamp(p.x-side*4/s.x,v55Field.left+1/s.x,v55Field.right-1/s.x)]
   .map(x=>({x,y:clamp(owner.y+dir*lead/s.y,v55Field.top+1.4/s.y,v55Field.bottom-1.4/s.y)}));
  const score=point=>Math.min(12,...rivals.map(r=>v122Metres(r,point)))-v122Metres(p,point)*.12-occupied.reduce((penalty,i)=>penalty+Math.max(0,4-v122Metres(i,point))*2,0);
  options.sort((a,b)=>score(b)-score(a));const target=options[0];
  flow.intents[p.pid]={...target,type:'depth',team:p.t,until:now+1.25};occupied.push(target);
 }
 // A nearby diagonal outlet supports the forward pair; defenders keep their
 // existing cover instead of everybody chasing the same ball lane.
 const support=allies.filter(p=>!flow.intents[p.pid]&&(hasInstruction(p,'support')||(p.assignedLine||p.line)==='mid'))
  .sort((a,b)=>v122Metres(a,owner)-v122Metres(b,owner)||a.n-b.n)[0];
 if(support){const side=support.bx<.5?-1:1;flow.intents[support.pid]={x:clamp(owner.x+side*5/s.x,v55Field.left+1/s.x,v55Field.right-1/s.x),y:clamp(owner.y-dir*2.5/s.y,v55Field.top+1/s.y,v55Field.bottom-1/s.y),type:'support',team:support.t,until:now+.65};}
}
function v152AttackTarget(m,p){
 if(!v152Active(m)||v121PositioningPaused(m)||p.keeper||p.slideActive||p===m.owner)return;
 const intent=m.attackFlow.intents[p.pid];if(!intent||intent.team!==v123PossessionTeam(m)||intent.until<v152Seconds(m))return;
 p.tx=intent.x;p.ty=intent.y;
 // Hold the run at the current line before release. After release the actual
 // offside snapshot governs participation, so the run may continue beyond it.
 if(m.owner){const limit=v121PositioningPlans.get(m)?.get(p)?.limit;if(limit!=null)p.ty=p.t===0?Math.max(p.ty,limit):Math.min(p.ty,limit);}
}
function v152AfterPass(m,p,target){
 if(typeof v157AfterPass==='function')v157AfterPass(m,p,target);
 if(!v152Active(m)||p.keeper||v121PositioningPaused(m))return;
 const s=v150Scale(),dir=p.t===0?-1:1,side=p.x<target.x?-1:1;
 const defensive=(p.assignedLine||p.line)==='def'&&p.role<=0;
 if(defensive)return;
 m.attackFlow.intents[p.pid]={x:clamp(p.x+side*2.5/s.x,v55Field.left+1/s.x,v55Field.right-1/s.x),y:clamp(p.y+dir*6/s.y,v55Field.top+1.4/s.y,v55Field.bottom-1.4/s.y),type:'follow',team:p.t,until:v152Seconds(m)+1.55};
 if(typeof v159Follow==='function')v159Follow(m,p,target);
}
function v152ForwardPass(p,allies,rivals){
 const m=match;if(!v152Active(m))return false;
 const s=v150Scale(),dir=p.t===0?-1:1,quick=m.teamDirect?.[p.t],offside=v55OffsideSnapshot(p).offside;
 const options=allies.filter(q=>!offside.has(q)&&!q.slideActive).map(q=>{
  const gain=(q.y-p.y)*dir*s.y,range=v122Metres(p,q),laneSafe=rivals.every(r=>{if(r.keeper)return true;const lane=passLaneGeometry(r,m.ball,q);return v122Metres(r,q)>2&&(!lane||v122Metres(r,lane)>1.5);});
  return {q,gain,range,laneSafe,score:gain*.10-range*.025+(m.attackFlow.intents[q.pid]?.type==='depth'?.3:0)};
 }).filter(o=>o.laneSafe&&o.range>=3&&o.range<=(quick?25:18)&&o.gain>=(quick?3:5)).sort((a,b)=>b.score-a.score||a.q.n-b.q.n);
 const choice=options[0];if(!choice)return false;
 // Early progressive passes precede speculative crosses. Execution still uses
 // the shared actual-contact solver and skill-dependent error distribution.
 v55GroundPass(p,choice.q);return true;
}
