'use strict';
// Selects actual captured keeper sequences (pictures/windows-*.json) into a
// compact fixture for the Unity keeper tests. Each step keeps the exact
// picture JSON of the keeper pose plus the frame facts Unity reads.
const fs=require('node:fs'),path=require('node:path');
const pick=[
 ['goalkick-out','windows-160112-standard-5','goalKick',841],['goalkick-out-turned','windows-160112-standard-5','goalKick',2439],
 ['parry-mid','windows-160112-standard-5','save',1664],['parry-high','windows-160112-standard-5','save',2177],
 ['parry-large','windows-160114-large-6','save',2540],['parry-central','windows-160115-large-6','save',1819],
 ['goal-dive','windows-160114-large-6','save',896],['goal-high','windows-160116-standard-5','save',263],['goal-central','windows-160115-large-6','save',2089]];
const dir=path.join(__dirname,'pictures'),windows={};
for(const f of fs.readdirSync(dir).filter(f=>f.startsWith('windows-'))){const k=f.replace(/-\d+\.json$/,'');(windows[k]??=[]).push(...JSON.parse(fs.readFileSync(path.join(dir,f))));}
const out=[];
for(const [name,file,action,from] of pick){
 const w=windows[file].find(w=>w.some(e=>e.pic.sequence===from));if(!w)throw new Error('missing '+name);
 const start=w.findIndex(e=>e.pic.sequence===from),keeper=w[start].pic.players.find(p=>p.action===action).id;
 const steps=[];for(const e of w.slice(start)){const p=e.pic.players.find(p=>p.id===keeper);if(p.action!==action)break;
  steps.push(JSON.stringify({sequence:e.pic.sequence,clock:e.pic.clock,owner:e.pic.owner===keeper?'@keeper':e.pic.owner?'@other':'',...('ballInFlight' in e.pic?{ballInFlight:e.pic.ballInFlight}:{}),ball:e.pic.ball,players:[p]}));}
 out.push({name,source:file+'.json',keeper,turned:w[start].pic.turned,steps});
}
const fixture={note:'Actual Unity picture JSON (keeper pose and frame facts) captured from the current source bridge per native step; see capture-keeper-pictures.cjs. Keeper ids are remapped to the contract fixture goalie in the tests.',sequences:out};
fs.writeFileSync(path.join(__dirname,'keeper-fixtures.json'),JSON.stringify(fixture,null,1));
for(const s of out)console.log(s.name,s.steps.length,'turned',s.turned);
