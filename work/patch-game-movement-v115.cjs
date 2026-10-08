const fs=require('fs');const file='dist/game.js';let source=fs.readFileSync(file,'utf8');
function replace(from,to){if(source.split(from).length!==2)throw Error('Expected one seam: '+from.slice(0,80));source=source.replace(from,to)}
replace('fly(target,.72,()=>{if(world)restart.support.interceptTarget=null;',"const launch=()=>fly(target,.72,()=>{if(world)restart.support.interceptTarget=null;");
replace('match.next=match.elapsed+1.1})}',"match.next=match.elapsed+1.1});if(world&&typeof v102Scoped==='function')v102Scoped(restart.kicker,'pass',launch);else launch()}");
replace("if(typeof v113DefenderTarget==='function')v113DefenderTarget(m,p);","if(typeof v115KeeperTarget==='function')v115KeeperTarget(m,p);if(typeof v113DefenderTarget==='function')v113DefenderTarget(m,p);");
replace("if(waiting||(typeof v101KeeperWaiting", "if(waiting||(typeof v65WorldActive!=='undefined'&&v65WorldActive&&typeof v115RestartLocked==='function'&&v115RestartLocked(m,p))||(typeof v101KeeperWaiting");
replace('p.x+=dx*factor;p.y+=dy*factor}',"const world=typeof v65WorldActive!=='undefined'&&v65WorldActive,metres=world?Math.hypot(dx*44/(v55Field.right-v55Field.left),dy*68/(v55Field.bottom-v55Field.top)):0,pace=p.keeper?2.6+ability(p,'spd')*.065:3+ability(p,'spd')*.14,travel=world?Math.min(factor,pace*realDelta*(typeof v108MoveFactor==='function'?v108MoveFactor(m,p,dx,dy):1)/Math.max(.00001,metres)):factor;p.x+=dx*travel;p.y+=dy*travel}");
replace(' if(m.flight){const f=m.flight;'," if(typeof v115ResolveKeeperChallenge==='function')v115ResolveKeeperChallenge(m);if(m.flight){const f=m.flight;");
fs.writeFileSync(file,source);console.log('World-only pace, restart planting and kickoff contact installed.');
