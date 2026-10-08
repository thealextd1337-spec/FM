'use strict';
const fs=require('node:fs');
function edit(file,changes){let s=fs.readFileSync(file,'utf8');for(const [a,b]of changes){if(s.includes(b))continue;if(s.split(a).length!==2)throw Error('Ambiguous/missing integration anchor '+file+': '+a);s=s.replace(a,b);}fs.writeFileSync(file,s);}
edit('dist/game.js',[
 ["if(typeof v121PreparePositioning==='function')v121PreparePositioning(m);","if(typeof v121PreparePositioning==='function')v121PreparePositioning(m);\n if(typeof v152PrepareAttack==='function')v152PrepareAttack(m);"],
 ["if(typeof v121RunnerTarget==='function')v121RunnerTarget(m,p);","if(typeof v121RunnerTarget==='function')v121RunnerTarget(m,p);if(typeof v152AttackTarget==='function')v152AttackTarget(m,p);"],
]);
edit('dist/pitch-v55.js',[
 ["function v55GroundPass(passer,receiver,kind='pass',exempt=false){", "function v55GroundPass(passer,receiver,kind='pass',exempt=false){\n if(typeof v152AfterPass==='function'&&kind==='pass')v152AfterPass(match,passer,receiver);"],
 ["if(v55HasClearRun(p,rivals,progress)){","if(world&&typeof v152Active==='function'&&v152Active(m)){if(v150TrySpacePass(p,allies,rivals)||v152ForwardPass(p,allies,rivals))return;}\n if(v55HasClearRun(p,rivals,progress)){"],
 ["if(world&&typeof v150TrySpacePass==='function'&&v150TrySpacePass(p,allies,rivals))return;","if(world&&!(typeof v152Active==='function'&&v152Active(m))&&typeof v150TrySpacePass==='function'&&v150TrySpacePass(p,allies,rivals))return;"],
]);
edit('dist/world-space-passes-v150.js',[
 ["const m=match,s=v150Scale(),from={...m.ball}","if(typeof v152AfterPass==='function')v152AfterPass(match,p,target);\n const m=match,s=v150Scale(),from={...m.ball}"],
]);
edit('dist/world-physical-v65.js',[
 ["match={people,exitedPeople:[],refereeVariant:","match={people,exitedPeople:[],attackFlow:{version:152,intents:{},ownerPid:null,team:null},refereeVariant:"],
]);
edit('dist/index.html',[[ '<script src="world-space-passes-v150.js"></script>', '<script src="world-space-passes-v150.js"></script>\n<script src="world-attack-flow-v152.js"></script>' ]]);
edit('work/build.cjs',[["'world-space-passes-v150.js','match-ball-events-v117.js'","'world-space-passes-v150.js','world-attack-flow-v152.js','match-ball-events-v117.js'"]]);
console.log('Offensive flow integrated into source and offline build.');
