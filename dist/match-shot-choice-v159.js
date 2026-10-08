'use strict';
// Native choice/reach gate for future matches. Presentation cannot attract a
// shot to a keeper. Accuracy and actual defensive blocks remain in v55Shoot.
function v159ShotActive(m){return Boolean(typeof v157Active==='function'&&v157Active(m)&&m.attackFlow.flowVersion===159);}
function v159ShotLane(m,p,from,target){
 const keeper=m.people.find(q=>q.keeper&&q.t!==p.t),sx=v150Scale(m).x,sy=v150Scale(m).y,dx=(target.x-from.x)*sx,dy=(target.y-from.y)*sy,range=Math.hypot(dx,dy);
 if(!keeper)return {target,range,margin:0,reachable:true,blocked:false,contact:target};
 const q=clamp(((keeper.x-from.x)*sx*dx+(keeper.y-from.y)*sy*dy)/Math.max(.001,range*range),0,1),contact={x:from.x+(target.x-from.x)*q,y:from.y+(target.y-from.y)*q};
 const gap=Math.hypot((keeper.x-contact.x)*sx,(keeper.y-contact.y)*sy),reaction=Math.max(.12,.28-ability(keeper,'gk')*.005),time=range*q/27,reach=(typeof v160KeeperHands!=='function'||v160KeeperHands(m,keeper,contact)?.8:0)+Math.max(0,time-reaction)*(2.6+ability(keeper,'spd')*.065),margin=gap-reach;
 const blocked=m.people.some(r=>r.t!==p.t&&!r.keeper&&!r.slideActive&&(()=>{const lane=passLaneGeometry(r,from,target);return lane&&v122Metres(r,lane)<1.4;})());
 return {target:{...target},range,margin,reachable:margin<=0&&(typeof v160KeeperHands!=='function'||v160KeeperHands(m,keeper,contact)),blocked,contact};
}
function v159ShotWindow(m,p,from=p){
 const goalY=p.t===0?v55Field.top:v55Field.bottom;
 const options=[.43,.465,.5,.535,.57].map(baseX=>{const x=.5+(baseX-.5)*44/(v150Scale(m).x*(v55Field.right-v55Field.left));return v159ShotLane(m,p,from,{x,y:goalY});});
 options.sort((a,b)=>Number(a.blocked)-Number(b.blocked)||b.margin-a.margin||a.range-b.range);
 return options[0];
}
function v159ShotTarget(m,p,from,aim,roll,kind='shot'){
 // Reading an open sector does not grant perfect execution. Use the existing
 // placement draw before reach/block resolution, never a chosen save outcome.
 const quality=clamp((ability(p,'fin')*.7+ability(p,kind==='header'?'air':'tec')*.3)/20,0,1),range=v115GoalDistance(p);
 const pressure=m.people.filter(q=>q.t!==p.t&&!q.keeper&&!q.slideActive&&v122Metres(q,p)<2.5).length;
 const spread=(.018+(1-quality)*.13+Math.min(2,pressure)*.012+Math.max(0,range-16)*.001)*44/(v150Scale(m).x*(v55Field.right-v55Field.left));
 return{x:clamp(aim.x+(roll-.5)*2*spread,.3,.7),y:aim.y};
}
function v159WithinMouth(point){const half=(44*.1/(v55Field.right-v55Field.left)-.1764)/v150Scale().x;return Math.abs(point.x-.5)<half;}
