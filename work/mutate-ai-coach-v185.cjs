'use strict';
// AI coach 185, review 2: mutation check of the revert and answer rules. Every listed mutation of dist/world-ai-coach-v185.js must
// make work/test-ai-coach-v185.cjs fail (ROT); the file is restored afterwards. Usage: node work/mutate-ai-coach-v185.cjs
const fs=require('fs'),cp=require('child_process'),f='dist/world-ai-coach-v185.js',orig=fs.readFileSync(f,'utf8');
const M=[
 ['a: 85-Sperre entfernt','if(back&&last.goals===goals&&(late||state.minute-last.minute<v185Coach.revertGap))continue;','if(back&&last.goals===goals&&(state.minute-last.minute<v185Coach.revertGap))continue;'],
 ['b: Grenze > statt >=','late=v185ClockMinute(state)>=v185Coach.lastRevert','late=v185ClockMinute(state)>v185Coach.lastRevert'],
 ['b: Zustandsminute statt angezeigter Minute','late=v185ClockMinute(state)>=v185Coach.lastRevert','late=state.minute>=v185Coach.lastRevert'],
 ['c: Antwortart nicht gespeichert',' const now=state.tactics[side];(ai.answer||=[null,null])[side]=keys.every(key=>decision.target[key]===now[key]||!reachable(key))?decision.answer:null;',''],
 ['c: Antwortart nach Tor nicht zurückgesetzt',"answer:reason==='Tor'?null:ai.answer?.[side]??null","answer:ai.answer?.[side]??null"],
 ['4: Antwortart auch bei verhinderter Umstellung gespeichert','?decision.answer:null;',' ? decision.answer:decision.answer;'],
 ['3: Sperre auch nach Tor','if(back&&last.goals===goals&&(late||state.minute-last.minute<v185Coach.revertGap))continue;','if(back&&(late||last.goals===goals&&state.minute-last.minute<v185Coach.revertGap))continue;'],
];
const out=[];
try{for(const [name,a,b] of M){if(orig.split(a).length!==2)throw Error('pattern: '+name);fs.writeFileSync(f,orig.replace(a,b));
 const r=cp.spawnSync(process.execPath,['work/test-ai-coach-v185.cjs'],{encoding:'utf8'});const msg=(r.stderr.match(/AssertionError[^\n]*/)||[''])[0];out.push(`${r.status?'ROT ':'GRÜN'} ${name}${msg?' – '+msg:''}`);}}
finally{fs.writeFileSync(f,orig);}
console.log(out.join('\n'));if(out.some(line=>line.startsWith('GRÜN')))process.exitCode=1;
