'use strict';
// Reuse the historical native gates (defensive line / offside trap, free-ball
// positioning) against the current build without overwriting historical
// evidence. Fixture-only repair: cloned fixture players receive their own P02
// freshness, start freshness and load metadata (current P02 resolves these by
// player id, as the native130 fixture does), and stepping
// fixtures use the 2D view: the later Unity bridge holds step() in an unloaded
// 3D view, while the native engine is view-independent. No assertion,
// scene or engine source is changed. Evidence: outputs/match-v182/regression/.
// Usage: node work/run-defensive-regression-v182.cjs work/check-defensive-line-v126.cjs|work/check-free-ball-positioning-v124.cjs [--baseline]
const fs=require('node:fs'),Module=require('node:module'),path=require('node:path');
const target=process.argv[2],allowed=['check-defensive-line-v126.cjs','check-free-ball-positioning-v124.cjs'];if(!allowed.includes(path.basename(target)))throw Error('Unknown gate');
const register="{const st=v65WorldActive?.state;if(st?.fresh)st.fresh[p.pid]=100;const l=st?.playerLoad;if(l?.players){l.players[p.pid]=D6Freshness.createState(p.pid,100);l.startFresh[p.pid]=100;l.meta[p.pid]={stamina:p.sta,keeper:p.keeper};}}";
const patchPerson=text=>{const before=text.split('v117Stats(p);return p').length-1;if(before<1)throw Error('Fixture person factory not found');return text.replaceAll('v117Stats(p);return p',`v117Stats(p);${register}return p`);};
let source=fs.readFileSync(target,'utf8');
fs.mkdirSync('outputs/match-v182/regression',{recursive:true});
source=source.replaceAll("'docs/spieler-nutzer-rig/defensive-line-'","'outputs/match-v182/regression/defensive-line-'").replaceAll("'docs/spieler-nutzer-rig/free-ball-positioning-'","'outputs/match-v182/regression/free-ball-positioning-'").replace(/-v12[46]\.json'/g,"-v182.json'");
if(source.includes("fs.readFileSync('work/check-positioning-v121.cjs','utf8')"))source=source.replace("fs.readFileSync('work/check-positioning-v121.cjs','utf8')","(t=>{const b=t.split('v117Stats(p);return p').length-1;if(b<1)throw Error('Fixture person factory not found');return t.replaceAll('v117Stats(p);return p',"+JSON.stringify('v117Stats(p);'+register+'return p')+");})(fs.readFileSync('work/check-positioning-v121.cjs','utf8'))");
else{source=patchPerson(source);const open='page.evaluate(()=>{';if(source.split(open).length!==2)throw Error('Fixture evaluate not found');source=source.replace(open,open+"v98View='2d';");}
if(source.includes('docs/spieler-nutzer-rig/'))throw Error('Historical evidence path left in adapted gate');
const test=new Module(path.resolve(target),module);test.filename=path.resolve(target);test.paths=module.paths;test._compile(source,test.filename);
