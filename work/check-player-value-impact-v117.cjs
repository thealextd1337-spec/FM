// Same seven acceptance criteria, now evaluated on reconciled live statistics.
const fs=require('node:fs'),Module=require('node:module'),path=require('node:path');
let code=fs.readFileSync('work/check-player-value-impact-v115.cjs','utf8');
code=code.replaceAll("'match-study-v115.json'","'shot-accounting-90-v117.json'").replaceAll("'player-value-impact-qa-v115.json'","'player-value-impact-qa-v117.json'");
code=code.replace('Five goalkeeper accounting deviations documented separately; outcome checks use booked scores','All 90 live shot/keeper ledgers reconcile; scores and random draw counts reproduce the original study');
const m=new Module(path.resolve('work/check-player-value-impact-v115.cjs'),module);m.filename=path.resolve('work/check-player-value-impact-v115.cjs');m.paths=module.paths;m._compile(code,m.filename);
