'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c=vm.createContext({crypto:require('node:crypto').webcrypto,structuredClone,clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),v61CurrentCareer:null,location:{protocol:'http:',hostname:'test.invalid',search:''},URLSearchParams});c.window=c;
const read=f=>fs.readFileSync('dist/'+f,'utf8'),run=f=>vm.runInContext(read(f),c,{filename:f}),call=(n,...args)=>vm.runInContext(n,c)(...args),copy=o=>JSON.parse(JSON.stringify(o));
for(const f of ['world-catalog-v61.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js','world-nationalities-v79.js','player-generation.js','player-effective-abilities.js','player-freshness.js','player-load-candidate-v158.js','player-development.js','player-aging.js','player-role-suitability.js','player-position-routine.js','player-tactic-transitions.js','player-match-ratings.js','player-foundation-preview-v153.js','world-player-foundation-v153.js','world-player-roles-v154.js','world-player-performance-v155.js','world-player-load-v158.js'])run(f);
const source=read('world-foundation-v61.js');vm.runInContext(source.slice(0,source.indexOf('const v61Panel=')),c);
for(const f of ['world-economy-v66.js','world-youth-manager-v67.js'])run(f);
const rows=[];
for(const fieldPlayers of process.argv.includes('--six-only')?[6]:[5,6]){
 let career=call('v61CreateCareer','GER-2',`native-seasons-${fieldPlayers}`,'QA',undefined,{fieldSize:'large',fieldPlayers}),geometry=copy(career.world.matchConfig);
 for(let season=1;season<=3;season++){
  const managed=call('v66Club',career,career.manager.managedClubId);call('v66ChooseSponsor',career,managed.id,managed.sponsors[0].id);
  let guard=0;
  while(career.world.market.phase==='open'&&guard++<20){
   if(!call('v66PlayableRoster',managed,career))call('v66EmergencySign',career,managed);
   call('v66NextMarketDay',career);
  }
  assert.equal(career.world.market.phase,'closed');
  let days=0;while(!career.world.seasonFinished&&days++<60)call('v62AdvanceDay',career);
  assert(career.world.seasonFinished);assert(call('v61ValidateCareer',career));assert.deepEqual(copy(career.world.matchConfig),geometry);
  const players=career.world.clubs.flatMap(club=>club.roster);
  assert(players.every(p=>p.playerModel?.parameterId==='native-player-v160-1'&&p.playerModel.roleModel&&Number.isFinite(p.fresh)&&p.fresh>=0&&p.fresh<=100));
  assert(players.every(p=>p.playerModel.development.processedAppearances.length===new Set(p.playerModel.development.processedAppearances.map(x=>x.id)).size));
  const before=JSON.stringify(career);call('v66SeasonEnd',career);assert.equal(JSON.stringify(career),before,'no duplicate season finances');
  rows.push({fieldPlayers,season,players:players.length,bytes:Buffer.byteLength(JSON.stringify(career)),matches:call('v62Fixtures',career).filter(f=>f.result).length});
  console.log(`PASS ${fieldPlayers} Feldspieler, Saison ${season}: ${rows.at(-1).matches} Partien, JSON und einmalige Buchungen`);
  career=copy(career);assert(call('v61ValidateCareer',career));
  if(season<3){call('v67SeasonEnd',career);if(career.world.transition.choice===null)call('v67ChooseOffer',career);call('v67SetBudget',career,0);call('v62NextSeason',career);assert(career.world.clubs.flatMap(club=>club.roster).every(p=>p.fresh===100&&p.formRatings.length===0));const next=JSON.stringify(career);call('v158SeasonStart',career);assert.equal(JSON.stringify(career),next,'no repeat season reset on load');}
 }
}
fs.mkdirSync('outputs/platform/native-integration-v160',{recursive:true});fs.writeFileSync(`outputs/platform/native-integration-v160/${process.argv.includes('--six-only')?'multiseason-six-final':'multiseason'}.json`,JSON.stringify({pass:true,rows},null,2)+'\n');console.log(JSON.stringify({pass:true,rows}));
