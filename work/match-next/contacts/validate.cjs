'use strict';
function validate(catalog){
 const errors=[],ids=new Set(),families=new Map(),finite=n=>typeof n==='number'&&Number.isFinite(n),vec=p=>Array.isArray(p)&&p.length===3&&p.every(finite);
 if(!Array.isArray(catalog))return ['catalog must be an array'];
 for(const s of catalog){
  const err=message=>errors.push(`${s?.id||'<missing-id>'}: ${message}`);
  if(!s||s.schemaVersion!=='d6-probe-1'){err('schema version');continue;}
  if(typeof s.id!=='string'||ids.has(s.id))err('unique ID');ids.add(s.id);
  if(typeof s.title!=='string'||!['shot','contact','sequence','keeper-permission','boundary','offside'].includes(s.kind))err('title/kind');
  if(!finite(s.duration)||s.duration<=0)err('duration');
  const g=s.geometry||{};
  if(![5,6].includes(g.fieldPlayers)||![1,-1].includes(g.attackDirection))err('configuration');
  if(![68,81.6].some(v=>Math.abs(v-g.length)<1e-8)||Math.abs(g.width-g.length*44/68)>1e-8)err('provisional dimensions');
  if(Math.abs(g.goalWidth-44*.2/(544/600))>1e-8||Math.abs(g.goalHeight-g.goalWidth/3)>1e-8||g.penaltyDepth!==10||g.penaltyWidth!==20)err('fixed goal/penalty dimensions');
  const ball=b=>{if(!b||!vec(b.position)||!vec(b.velocity)||!finite(b.radius)||b.radius<=0)err('ball');};ball(s.ball);
  const actors=s.actors||[],actorIds=new Set();
  for(const a of actors){
   if(typeof a.id!=='string'||actorIds.has(a.id))err('actor ID');actorIds.add(a.id);
   if(![0,1].includes(a.team)||!['keeper','field'].includes(a.role)||!vec(a.position)||!vec(a.velocity)||!finite(a.radius)||a.radius<=0||!finite(a.reach)||a.reach<0||typeof a.action!=='string')err('actor shape');
  }
  for(const team of [0,1])if(actors.filter(a=>a.team===team&&a.role==='field').length!==g.fieldPlayers||actors.filter(a=>a.team===team&&a.role==='keeper').length!==1)err(`team ${team} roster`);
  if(!s.expected||!s.provenance?.family||s.provenance.status!=='provisional-test-assumptions')err('expectation/provenance');
  if(s.kind==='keeper-permission'&&!actorIds.has(s.provenance.subjectId))err('permission actor');
  if(['contact','shot','sequence','boundary'].includes(s.kind)&&!['contact','goal','free','out'].includes(s.expected.type))err('expected result');
  if(s.expected.actorId&&!actorIds.has(s.expected.actorId))err('expected actor');
  if(s.kind==='sequence'){if(!s.followup)err('followup');else{ball(s.followup.ball);ball(s.followup.shot);}}
  const key=`${g.length}/${g.fieldPlayers}/${g.attackDirection}`,family=s.provenance?.family;
  if(!families.has(family))families.set(family,new Set());
  if(families.get(family).has(key))err('duplicate family configuration');families.get(family).add(key);
 }
 for(const [family,matrix] of families)if(matrix.size!==8)errors.push(`${family}: incomplete four-config/two-direction matrix`);
 return errors;
}
module.exports={validate};
if(require.main===module){const catalog=require('./catalog.json'),errors=validate(catalog);if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`${catalog.length} fixtures valid`);}
