'use strict';
// Scene builder for the SI-4 tests and the scene benchmark: runs inside the native VM
// harness (create() of native183-scenes.cjs). NativeDef.build(cfg) makes a small match
// through Native182.install: a carrier of team 1-d, defenders and extra attackers placed
// in the frame of the defending team d (depth in metres from its goal line, lateral
// across, mirrored for team 1). cfg.on: null = no marker 183, false = package off, true =
// package on; cfg.si: constructor overrides (packages/params).
const source=String.raw`(()=>{
 const N=Native182,SI=v183CreateSi;
 function frame(size,d){const g=v160WorldGeometry({world:{matchConfig:{version:1,fieldSize:size,fieldPlayers:5}}});return {g,s:{x:g.width/(v55Field.right-v55Field.left),y:g.length/(v55Field.bottom-v55Field.top)}};}
 // cfg: size, d, on (package), si (overrides), carrier {depth,lateral,vx,vy,skills}, defs [{depth,lateral,line,role,skills}], atts [{depth,lateral}], press, ball
 function build(cfg={}){
  const {size='standard',d=0,on=true,si={},carrier={},defs=[{depth:26,lateral:-3,line:'def'},{depth:21,lateral:5,line:'mid'},{depth:17,lateral:-9,line:'def'}],atts=[{depth:40,lateral:12}],press=0}=cfg,a=1-d,{s}=frame(size,d);
  N.seedRandom(cfg.seed||4242);
  const c=N.at(d,carrier.depth??30,carrier.lateral??0,s),car=N.person('carrier',a,c.x,c.y,'att',{n:9,spd:12,tec:12,pos:12,fin:12,...(carrier.skills||{})});
  const dp=defs.map((q,i)=>{const p=N.at(d,q.depth,q.lateral,s),o=N.person('def'+i,d,p.x,p.y,q.line||'def',{n:3+i,pos:12,tak:12,spd:12,...(q.skills||{})});if(q.role)o.tacticalRole=q.role;const an=N.at(d,q.anchorDepth??q.depth,q.anchorLateral??q.lateral,s);o.bx=an.x;o.by=an.y;o.initialBy=an.y;return o;});
  const ap=atts.map((q,i)=>{const p=N.at(d,q.depth,q.lateral,s),o=N.person('att'+i,a,p.x,p.y,'att',{n:10+i});o.bx=p.x;o.by=p.y;o.initialBy=p.y;return o;});
  const keepers=[N.person('keeper-d',d,...Object.values(N.at(d,3,0,s)),'gk',{n:1},true),N.person('keeper-a',a,...Object.values(N.at(d,64,0,s)),'gk',{n:1},true)];
  const people=d===0?[keepers[0],...dp,keepers[1],car,...ap]:[keepers[1],car,...ap,keepers[0],...dp];
  N.install({people,size,markers:{looseBallRevision:182,pursuitRevision:182},ball:c,lastTouch:a});
  match.teamPress=[0,0];match.teamPress[d]=press;
  if(on!==null)match.si=SI(on===false?{packages:{defence:false},...si}:{...si,packages:{defence:true,...(si.packages||{})}});
  const b=v157Body(car);b.vx=carrier.vx||0;b.vy=carrier.vy||0;b.heading=Math.atan2(b.vx,b.vy);car.motionX=(carrier.vx||0)/s.x*.05;car.motionY=(carrier.vy||0)/s.y*.05||(a===0?-.01:.01);
  match.owner=car;match.ball={...c};match.next=match.elapsed+10;
  return {car,dp,ap,keepers,s,d,a,N};
 }
 globalThis.NativeDef={build,frame};
})()`;
module.exports={source};
