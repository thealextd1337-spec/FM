const fs=require('fs');
function edit(file,from,to){const s=fs.readFileSync(file,'utf8');if(!s.includes(from))throw Error('Missing anchor '+file);fs.writeFileSync(file,s.replace(from,to));}
edit('dist/world-physical-v65.js','competition:{type:competition?.type,country:competition?.country},score:', 'fixtureId:context.fixture.id,competition:{id:competition?.id,type:competition?.type,country:competition?.country,round:context.fixture.round},score:');
edit('dist/ui-flutlicht/adapter.js', '   const switches=record?.substitutions', `   const tableFormat=competition.type==='league'||competition.type==='europe'&&/^R\\d+$/.test(fixture.round),current=v62Current(career).find(c=>c.type===competition.type&&(c.type==='europe'||c.country===competition.country));
   const rankIds=current?(current.type==='europe'?current.entrants:[...new Set(current.fixtures.flatMap(f=>[f.homeId,f.awayId]))]):[],ranks=tableFormat&&current?new Map(v62Table(current,rankIds).map((row,i)=>[row.clubId,i+1])):new Map();
   for(const team of teams){team.currentRank=ranks.get(team.id)||null;const actual=career.world.clubs.find(c=>c.id===team.id);team.crestHTML=actual?v61CrestSVG(actual):'';}
   const switches=record?.substitutions`);
edit('dist/i18n-v75.js','Spielbericht\tMatch report', 'Spielbericht\tMatch report\nAktueller Tabellenplatz\tCurrent table position\nTabellenplätze entsprechen dem aktuellen Stand.\tTable positions reflect the current standings.\nSpielerstatistik öffnen\tOpen player statistics');
edit('dist/i18n-v75.js','  [/^Ausgewechselt', '  [/^Aktueller Tabellenplatz (\\d+)$/,(_,rank)=>`Current table position ${rank}`],\n  [/^Ausgewechselt');
