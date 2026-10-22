'use strict';
// AI coach 185: runs work/measure-si-calibration-v183.cjs unchanged in this process and adds one read-only
// observer per match: AI coach marker, tactic changes, substitutions, the coach log and the goal minutes
// (world sides, state.events). All flags of the calibration harness apply.
// Usage: node work/measure-ai-coach-v185.cjs --clubs=96 --workers=6 --port=4260 --seedPrefix=p01r132 --traceLimit=40000 --label=aic-a
// Table: node work/table-ai-coach-v185.cjs <label>[,<label>...] <baseLabel>[,...]
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const file=path.join(__dirname,'measure-si-calibration-v183.cjs');let source=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
const hook='const patches=String.raw`';
if(source.split(hook).length!==2)throw Error('measure-si-calibration-v183.cjs: patch hook not found');
const observer=String.raw`
rep(\`crossProbe:window.__crossProbe?{...window.__crossProbe}:null,\`,\`crossProbe:window.__crossProbe?{...window.__crossProbe}:null,
   aiCoach:{revision:state.aiCoachRevision??null,changes:JSON.parse(JSON.stringify(state.tacticChanges||[])),subs:JSON.parse(JSON.stringify(state.substitutions||[])),log:JSON.parse(JSON.stringify(state.aiCoach?.log||[])),goals:(state.events||[]).filter(e=>e.type==='goal').map(e=>[e.minute,e.side]),ratings:state.playerPerformance&&typeof v155Rated==='function'?Object.keys(state.minutes).filter(pid=>state.minutes[pid]>=30).map(pid=>[pid,state.minutes[pid],+(v155Rated(c,fixture,state,pid)?.rating??-1).toFixed(2)]):null},\`);
`;
// The calibration turns \` into a backtick for the whole patch text, the observer included.
source=source.replace(hook,()=>'const patches='+JSON.stringify(observer)+'+String.raw`');
const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(__dirname);m._compile(source,file);
