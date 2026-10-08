// Reuse native gates without overwriting historical evidence.
const fs=require('node:fs'),Module=require('node:module'),path=require('node:path');
const target=process.argv[2],allowed=['check-user-ball-actions-v111.cjs','check-keeper-visual-v120.cjs','check-user-locomotion-v108.cjs','check-user-animation-audit-v112.cjs','check-live-air-v122.cjs','check-goal-keeper-clearance-v113.cjs','check-keeper-scenarios-v120.cjs'];if(!allowed.includes(path.basename(target)))throw Error('Unknown gate');
let source=fs.readFileSync(target,'utf8').replace(/-v(?:111|112|113|120|122)\.(json|png)/g,'-v123.$1');
if(target.endsWith('check-user-locomotion-v108.cjs'))source=source.replace("baseline?'baseline':'qa-v108'","baseline?'baseline-v123':'qa-v123'").replace("baseline?'baseline':'v108'","baseline?'baseline-v123':'v123'");
if(target.endsWith('check-user-animation-audit-v112.cjs'))source=source.replace('animation-audit-'+"${baseline?'baseline':'qa'}",'animation-audit-'+"${baseline?'baseline':'qa'}");
if(target.endsWith('check-goal-keeper-clearance-v113.cjs'))source=source.replace('assert(row.bodyGap>.1764,JSON.stringify(row))','assert(row.bodyGap>.1764&&row.gap>.1764,JSON.stringify(row))');
const test=new Module(path.resolve(target),module);test.filename=path.resolve(target);test.paths=module.paths;test._compile(source,test.filename);
