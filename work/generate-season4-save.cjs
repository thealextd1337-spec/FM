const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

let id=0;
const context=vm.createContext({crypto:{randomUUID:()=>`season4-${++id}`},structuredClone});
for(const file of ['world-catalog-v61.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js'])
 vm.runInContext(fs.readFileSync(path.join(__dirname,'..','dist',file),'utf8'),context,{filename:file});
const foundation=fs.readFileSync(path.join(__dirname,'..','dist','world-foundation-v61.js'),'utf8');
vm.runInContext(foundation.slice(0,foundation.indexOf('const v61Panel=')),context,{filename:'world-foundation-v61.js'});
for(const file of ['world-economy-v66.js','world-transfer-list-v72.js','world-youth-manager-v67.js','world-honours-v74.js'])
 vm.runInContext(fs.readFileSync(path.join(__dirname,'..','dist',file),'utf8'),context,{filename:file});
const call=(name,...args)=>vm.runInContext(name,context)(...args);
const career=call('v61CreateCareer','GER-1','fc-muenchen-isar-season4-2026');
function startSeason(){
 const own=career.world.clubs.find(club=>club.id===career.manager.managedClubId);
 call('v66ChooseSponsor',career,own.id,own.sponsors[0].id);
 while(career.world.market.phase==='open'){
  if(career.world.market.day===5&&(own.roster.length<10||!own.roster.some(player=>player.keeper)))call('v66EmergencySign',career,own);
  call('v66NextMarketDay',career);
 }
 assert.equal(career.world.market.phase,'closed');
}
startSeason();
for(let season=1;season<=3;season++){
 while(!career.world.seasonFinished)call('v62AdvanceDay',career);
 assert.equal(career.world.season,season);
 assert(call('v62Current',career).every(competition=>competition.winnerId),'Saison hat alle Sieger');
 if(career.world.transition.choice===null)call('v67ChooseOffer',career,null);
 const own=career.world.clubs.find(club=>club.id===career.manager.managedClubId);
 call('v67SetBudget',career,Math.min(500,call('v67BudgetLimit',own)));
 call('v62NextSeason',career);
 startSeason();
}
assert.equal(career.world.season,4);
const lastDay=vm.runInContext('v62Days.league[9]',context);
while(Math.min(...call('v62Fixtures',career).filter(fixture=>!fixture.result).map(fixture=>fixture.day))<lastDay)
 call('v62AdvanceDay',career);
const last=call('v64AdvanceToOwnMatch',career);
assert(last&&last.round==='R10'&&last.day===lastDay,'letzter Ligaspieltag ist vorbereitet');
assert.equal(career.world.activeMatch.state.phase,'prematch');
const managed=career.manager.managedClubId;
const league=call('v62Current',career).find(item=>item.type==='league'&&item.country==='GER');
assert.equal(league.fixtures.filter(item=>(item.homeId===managed||item.awayId===managed)&&item.result).length,9);
assert.equal(league.fixtures.filter(item=>(item.homeId===managed||item.awayId===managed)&&!item.result).length,1);
assert(call('v61ValidateCareer',career),'Spielstand ist gültig');
const exportData={game:'Doppel 6',format:'world',schema:14,modelVersion:10,exported:new Date().toISOString(),save:career};
const output=path.join(__dirname,'..','outputs','spielstand-saison-4-vor-letztem-spieltag.json');
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify(exportData));
const parsed=JSON.parse(fs.readFileSync(output,'utf8'));
assert(call('v61ValidateCareer',parsed.save),'exportierter Spielstand ist wieder ladbar');
console.log(`${output}\nSaison ${career.world.season}, ${career.world.competitions.length} Wettbewerbe, nächstes Spiel ${last.id}, ${Math.round(fs.statSync(output).size/1024)} KiB`);
