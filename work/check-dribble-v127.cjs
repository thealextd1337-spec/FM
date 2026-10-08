// Actual Meshy feet, same paths, only the ball-contact layer varies.
const fs=require('fs'),Module=require('module'),path=require('path'),assert=require('node:assert/strict');
const baseline=process.argv.includes('--baseline');
let source=fs.readFileSync('work/check-running-turns-v125.cjs','utf8').replaceAll('-v125','-v127');
const a=source.indexOf('if(baseline){await page.addScriptTag'),b=source.indexOf('const report=await page.evaluate',a);
source=source.slice(0,a)+"if(baseline)await page.addScriptTag({path:path.resolve('work/baseline-ball-actions-v127.js')});"+source.slice(b);
source=source.replace("['run-3.5','run-4.5','run-6.5','curve-left','curve-right','cut-left','cut-right','reverse','start-stop']","['run-3.5','run-4.5','run-6.5','curve-left','cut-right','start-stop']");
source=source.replace("keeper:false},frame={turned:false,owner:null,ballInFlight:false,ball:{x:0,z:20,height:.29}}","keeper:false,person:{}},frame={turned:false,owner:'run-turn',carrying:true,ballInFlight:false,ball:{x:0,z:20,height:.29}}");
source=source.replace('v.renderMotion({person:p,frame,dt,live:true});','frame.ball={x:p.x+Math.sin(v.heading)*.6,z:p.z+Math.cos(v.heading)*.6,height:.29};v.renderMotion({person:p,frame,dt,live:true});');
source=source.replaceAll("running-turns-","dribble-");
const from=source.indexOf('if(!baseline){const before='),to=source.indexOf('console.log(JSON.stringify(report.rows.map',from);
source=source.slice(0,from)+`if(!baseline){const before=JSON.parse(fs.readFileSync('docs/spieler-nutzer-rig/dribble-baseline-v127.json'));for(const r of report.rows){const old=before.rows.find(c=>c.kind===r.kind&&c.fps===r.fps);assert(r.maxFootStep<.65&&r.maxHipsStep<.3);assert(r.samples.every(s=>s.locks.every(f=>f.height>.07)));assert(r.maxFootAcceleration<=old.maxFootAcceleration*1.01,r.kind+' peak');assert(r.meanFootAcceleration<=old.meanFootAcceleration*1.01,r.kind+' mean');if(r.kind.startsWith('run-'))assert(r.maxFootAcceleration<old.maxFootAcceleration*.75,r.kind+' straight improvement');for(let i=1;i<r.samples.length;i++)assert(r.samples[i].phase>=r.samples[i-1].phase);}}`+source.slice(to);
const test=new Module(path.resolve('work/check-running-turns-v125.cjs'),module);test.filename=path.resolve('work/check-running-turns-v125.cjs');test.paths=module.paths;test._compile(source,test.filename);
