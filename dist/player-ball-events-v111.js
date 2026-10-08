'use strict';
// Optional animation events. No owner, timer, RNG or saved-state changes.
const v111BaseFly=fly;
fly=function(target,duration,done){const current=match,release=v102Release;return v111BaseFly(target,duration,()=>{const before=current.owner,result=done();if(window.D6UserMeshyPlayer?.nativeBall&&v65WorldActive&&current.owner&&!current.owner.keeper&&current.owner!==before&&!current.flight&&!current.setPiece&&!current.kickoff&&!current.throwIn&&!current.rebound&&!['header','cross','highPass'].includes(release?.kind)){const owner=current.owner;v102Pose(current,owner,'receive',target,target)}return result})};
const v111BaseLooseChase=v50ChaseLooseBall;
v50ChaseLooseBall=function(...args){const current=match,hadLoose=Boolean(current?.rebound),point=current?.rebound&&{x:current.rebound.x,y:current.rebound.y},result=v111BaseLooseChase(...args);if(window.D6UserMeshyPlayer?.nativeBall&&v65WorldActive&&hadLoose&&current.owner&&!current.owner.keeper&&!current.rebound)v102Pose(current,current.owner,'receive',point,point);return result};
const v111BaseAction=v102PlayerAction;
v102PlayerAction=function(current,person){const foul=v113FoulAction(current,person);if(foul&&window.D6UserMeshyPlayer?.nativeBall)return foul;const action=v111BaseAction(current,person);if(!window.D6UserMeshyPlayer?.nativeBall)return action;if(action?.kind==='kickReady'){const forward=person.t===0?1-person.y:person.y;return forward>.73?action:{...action,kind:'passReady'}}return action};
const v113Fouls=new WeakMap();
function v113FoulContact(current,victim,offender){
 if(!v65WorldActive)return;
 v113Fouls.set(current,{at:v102Clock(current),victim,offender,positions:current.people.map(p=>({p,x:p.x,y:p.y})),target:{x:victim.x,y:victim.y},sliding:Boolean(offender.slideActive)});
}
function v113RestoreFoul(current){
 const foul=v113Fouls.get(current);if(!foul)return;
 for(const {p,x,y}of foul.positions){p.x=p.tx=x;p.y=p.ty=y;p.slideActive=false}
 foul.positions=null;foul.piece=current.setPiece;if(foul.piece)foul.piece.wait=Math.max(foul.piece.wait,3.8);
}
function v113FoulLocked(current,person){const f=v113Fouls.get(current);return f&&current.setPiece===f.piece&&v102Clock(current)-f.at<2.7&&(f.victim===person||f.offender===person)}
function v113FoulAction(current,person){
 const f=v113Fouls.get(current),age=f&&v102Clock(current)-f.at;if(!f||current.setPiece!==f.piece||age>=2.7||!['waiting','fading','postBanner'].includes(current.setPiece?.phase))return null;
 if(f.victim!==person&&f.offender!==person)return null;
 return {id:'foul:'+f.at,kind:f.victim===person?'foulVictim':'foulOffender',progress:Math.max(0,age/2.7),age,sliding:f.sliding,target:f.target};
}
