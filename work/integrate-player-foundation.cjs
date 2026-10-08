'use strict';
const fs=require('node:fs');const edits=[];
function edit(file,changes){let s=fs.readFileSync(file,'utf8');for(const [a,b]of changes){if(s.includes(b))continue;if(s.split(a).length!==2)throw Error('Ambiguous/missing anchor '+file+': '+a);s=s.replace(a,b);}edits.push([file,s]);}
edit('dist/world-foundation-v61.js',[
 ['function v61GenerateRoster(entry,seed){','function v61GenerateRoster(entry,seed,foundation=null){'],
 ['player.appearance=v61GenerateAppearance(pid,nation,player.age,roster);roster.push(player);',"if(foundation)v153Generate(player,foundation,entry.id.includes('FREE')?'free':entry.id.includes('-C')?'cup':'start',entry.profile[5],entry.profile[2]);\n  player.appearance=v61GenerateAppearance(pid,nation,player.age,roster);roster.push(player);"],
 ['function v61ClubRecord(entry,seed){','function v61ClubRecord(entry,seed,foundation=null){'],
 ['roster:v61GenerateRoster(entry,seed),youthPool:', 'roster:v61GenerateRoster(entry,seed,foundation),youthPool:'],
 ['function v61CreateCareer(clubId,seed=crypto.randomUUID(),managerName=null){','function v61CreateCareer(clubId,seed=crypto.randomUUID(),managerName=null,playerOptions=undefined){\n const foundation=typeof v153Options===\'function\'?v153Options(playerOptions===undefined?v153PreviewOptions():playerOptions,seed):null;'],
 ['world:{season:1,calendarCursor:null,seed,countries:', 'world:{season:1,calendarCursor:null,seed,...(foundation?{playerFoundation:foundation}:{}),countries:'],
 ['clubs:v61Catalog.map(entry=>v61ClubRecord(entry,seed)),', 'clubs:v61Catalog.map(entry=>v61ClubRecord(entry,seed,foundation)),'],
]);
edit('dist/world-economy-v66.js',[
 ['const roster=v61GenerateRoster(entry,career.world.seed);','const roster=v61GenerateRoster(entry,career.world.seed,career.world.playerFoundation?{...career.world.playerFoundation,season:career.world.season}:null);'],
 ['player.nation=v79ProfessionalNation(country,player.pid,\'free\');',"if(typeof v153ReidentifyNewPlayer==='function')v153ReidentifyNewPlayer(player);\n   player.nation=v79ProfessionalNation(country,player.pid,'free');"],
]);
edit('dist/world-youth-manager-v67.js',[
 ['player.appearance=v61GenerateAppearance(pid,nation,player.age,[...(club.roster||[]),...(club.youthPool||[])]);',"if(career.world.playerFoundation)v153Generate(player,{...career.world.playerFoundation,season:career.world.season},'youth',club.policy.startingSquad,club.policy.youth);\n player.appearance=v61GenerateAppearance(pid,nation,player.age,[...(club.roster||[]),...(club.youthPool||[])]);"],
 ['function v67Grow(player,fixture,minutes){',"function v67Grow(player,fixture,minutes){\n // New foundation candidates wait for the actual P06 rating/role contract; no\n // second legacy growth transaction or invented short-appearance rating.\n if(player.playerModel?.version===2)return;"],
 ['for(const player of [...career.world.clubs.flatMap(club=>[...club.roster,...club.youthPool]),...career.world.market.freePlayers])player.age++;',"for(const player of [...career.world.clubs.flatMap(club=>[...club.roster,...club.youthPool]),...career.world.market.freePlayers]){if(typeof v153AgePlayer==='function')v153AgePlayer(career,player,career.world.season+1);else player.age++;}"],
]);
const files=['player-generation.js','player-effective-abilities.js','player-freshness.js','player-development.js','player-aging.js','world-player-foundation-v153.js','player-foundation-preview-v153.js'];
edit('dist/index.html',[[ '<script src="world-foundation-v61.js"></script>', files.map(f=>`<script src="${f}"></script>`).join('\n')+'\n<script src="world-foundation-v61.js"></script>' ]]);
edit('work/build.cjs',[["'world-foundation-v61.js','world-match-ui-v64.js'",files.map(f=>`'${f}'`).join(',')+",'world-foundation-v61.js','world-match-ui-v64.js'"]]);
for(const [file,s]of edits)fs.writeFileSync(file,s);console.log('New local candidate creation paths integrated; old saves remain unmarked.');
