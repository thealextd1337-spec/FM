const fs=require('fs');
function edit(file,from,to){const s=fs.readFileSync(file,'utf8');if(!s.includes(from))throw Error('Missing anchor '+file+': '+from.slice(0,65));fs.writeFileSync(file,s.replace(from,to));}
edit('dist/world-physical-v65.js','attackFlow:{version:152,qualityVersion:157,intents:', 'attackFlow:{version:152,qualityVersion:157,flowVersion:159,intents:');
edit('dist/game.js',"if(typeof v157Prepare==='function')v157Prepare(m);", "if(typeof v157Prepare==='function')v157Prepare(m);\n if(typeof v159Prepare==='function')v159Prepare(m);");
edit('dist/pitch-v55.js','function v131OpenGoal(p,point=p){', `function v131OpenGoal(p,point=p){
 if(typeof v159ShotActive==='function'&&v159ShotActive(match)){const shot=v159ShotWindow(match,p,point);return shot&&!shot.blocked&&shot.range<=22&&shot.margin>1.5?shot:null;}`);
edit('dist/pitch-v55.js',' const m=match;if(!m||p.keeper||m.kickoff', " const m=match;if(typeof v159Active==='function'&&v159Active(m))return v159DirectOptions(m,p,point,from);if(!m||p.keeper||m.kickoff");
edit('dist/pitch-v55.js','function v127TryOneTouch(p,point,from){', "function v127TryOneTouch(p,point,from){\n if(typeof v159Contact==='function')v159Contact(match,p,point);");
edit('dist/pitch-v55.js',"const m=match,tec=ability(p,'tec'),pressure=", "const m=match,planned=typeof v159ReceivePlan==='function'&&v159ReceivePlan(m,p,point),tec=ability(p,'tec'),pressure=");
edit('dist/pitch-v55.js',"dir=v123ControlDirection(p),quality=", "dir=planned?.direction||v123ControlDirection(p),quality=");
edit('dist/pitch-v55.js',"lead=.42+(1-quality)*.55,at=", "lead=planned?.lead||.42+(1-quality)*.55,at=");
edit('dist/pitch-v55.js'," const c=v123GroundControls.get(m),dir=v123ControlDirection(p),quality=", " const planned=typeof v159OwnedBall==='function'&&v159OwnedBall(m,p);if(planned)return planned;\n const c=v123GroundControls.get(m),dir=v123ControlDirection(p),quality=");
edit('dist/pitch-v55.js',' const goalRollX=random(),goalPoint=', " const advanced=typeof v159ShotActive==='function'&&v159ShotActive(m),window=advanced?v159ShotWindow(m,shooter,m.ball):null;\n const goalRollX=random(),goalPoint=");
edit('dist/pitch-v55.js',"{...v127OneTouchRelease.target}:{x:.44+goalRollX*.12,y:team===0?v55Field.top:v55Field.bottom};", "{...v127OneTouchRelease.target}:window?.target||{x:.44+goalRollX*.12,y:team===0?v55Field.top:v55Field.bottom};\n const shotLane=advanced?v159ShotLane(m,shooter,m.ball,goalPoint):null;");
edit('dist/pitch-v55.js','if(onTarget){shooter.stats.onTarget++;keeper.stats.faced++}', 'if(onTarget){shooter.stats.onTarget++;if(!advanced||shotLane.reachable)keeper.stats.faced++}');
edit('dist/pitch-v55.js'," const parry=world&&onTarget&&!goal?", " // A save requires a reachable point on the selected flight, never a new\n // target at the keeper. An unblocked accurate ball crosses the goal line.\n if(advanced&&onTarget&&!shotLane.reachable)goal=true;\n const parry=world&&onTarget&&!goal?");
edit('dist/pitch-v55.js','?v115KeeperContact(keeper,shooter,parry):{x:goal?', '?advanced?shotLane.contact:v115KeeperContact(keeper,shooter,parry):{x:goal?');
for(const file of ['dist/index.html','work/build.cjs']){
 if(file.endsWith('index.html'))edit(file,'<script src="world-offensive-quality-v157.js"></script>', '<script src="world-offensive-quality-v157.js"></script>\n<script src="match-shot-choice-v159.js"></script>\n<script src="world-football-flow-v159.js"></script>');
 else edit(file,"'world-offensive-quality-v157.js',", "'world-offensive-quality-v157.js','match-shot-choice-v159.js','world-football-flow-v159.js',");
}
