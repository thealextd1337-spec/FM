'use strict';const fs=require('node:fs');function edit(f,pairs){let s=fs.readFileSync(f,'utf8');for(const[a,b]of pairs){if(!s.includes(a))throw Error(f+': '+a.slice(0,70));s=s.replace(a,b);}fs.writeFileSync(f,s);}
edit('dist/i18n-v75.js',[
 ['const labels=new Map(`','const labels=new Map(`\nUngefährer Wirkungsraum. Die Rolle und Ausrichtung lenken Laufangebote. Spieler reagieren frei auf die Spielsituation.\tApproximate operating area. The role and orientation guide runs. Players react freely to the match.'],
 ['const patterns=[',"const patterns=[\n  [/^Rolle: (.+)\\. Rolleneignung: (.+)$/,(_,role,color)=>`Role: ${translate(role)}. Role suitability: ${translate(color)}`],"]
]);
edit('dist/game.js',[
 ['function performanceRating(p){const s=p.stats;',"function performanceRating(p){if(typeof v65WorldActive!=='undefined'&&v65WorldActive?.state.playerPerformance)return v155Rated(v65WorldActive.career,v65WorldActive.fixture,v65WorldActive.state,p.pid)?.rating??6;const s=p.stats;"]
]);
edit('dist/world-physical-v65.js',[
 ["filter(person=>person.t===0).map(person=>[person.pid,performanceRating(person)])", "filter(person=>person.t===0&&(!state.playerPerformance||state.minutes[person.pid]>=20)).map(person=>[person.pid,performanceRating(person)])"]
]);
console.log('Actual ratings throughout live UI and English zone descriptions completed.');
