'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{harness}=require('./world-expansion-harness-v167.cjs');
const native=process.argv.includes('--native'),seasons=native?4:5,seeds=native?['ap07-native']:['ap07-a','ap07-b','ap07-c'];
(async()=>{const rows=[];
 for(const seed of seeds){const {call,copy,context}=harness(),career=call('v167CreateCareer','AUT-5',seed,'QA');context.v61CurrentCareer=career;
  if(!native)vm.runInContext(`v62Score=function(career,fixture){const random=v61Random(career.world.seed+fixture.id+':scenario-score'),homeGoals=Math.floor(random()*4),awayGoals=Math.floor(random()*4);fixture.matchRecord={score:[homeGoals,awayGoals],players:[],substitutions:[]};return{homeGoals,awayGoals,penalties:null,winnerId:null};};`,context);
  for(let season=1;season<=seasons;season++){
   const own=call('v66Club',career,career.manager.managedClubId);call('v66ChooseSponsor',career,own.id,own.sponsors[0].id);call('v124SetYouthBudget',career,50);
   // Exercise actual renewals so the managed club retains a playable squad.
   for(const contract of career.world.contracts.filter(c=>c.clubId===own.id&&c.endSeason===season)){const player=own.roster.find(p=>p.pid===contract.pid);try{call('v66Renew',career,player.pid,Math.ceil(Math.max(contract.annual,call('v66Salary',player))*1.25/10)*10,3,contract.promise);}catch(error){console.log('Renew context',JSON.stringify({seed,season,worldSeason:career.world.season,finished:career.world.seasonFinished,managed:career.manager.managedClubId,contract,found:call('v66Contract',career,player.pid),playerId:player.pid}));throw error;}}
   for(let day=0;day<5;day++)call('v66NextMarketDay',career);assert.equal(career.world.market.phase,'closed');assert(call('v61ValidateCareer',career),'invalid season opening '+seed+' S'+season);
   while(!career.world.seasonFinished)call('v62AdvanceDay',career);
   assert(call('v61ValidateCareer',career),'invalid closed season '+seed+' S'+season);assert.equal(call('v62Fixtures',career).length,991);assert.equal(career.world.countrySeasonValues.length,season);
   const record=career.world.countrySeasonValues.at(-1);assert.equal(record.countries.reduce((n,c)=>n+c.participants,0),58);assert(record.countries.every(c=>c.participants>=4&&c.participants<=8));
   const frozen=JSON.stringify(career);call('v167CloseRanking',career);call('v66SeasonEnd',career);call('v62AdvanceDay',career);assert.equal(JSON.stringify(career),frozen,'repeat closure mutates state');
   const balances=career.world.clubs.filter(c=>c.leagueId).map(c=>c.balance);assert(balances.every(Number.isFinite));assert(career.world.clubs.filter(c=>c.leagueId&&c.id!==own.id).every(c=>c.balance>=0),'AI insolvency');
   for(const club of career.world.clubs)assert.equal(new Set(club.ledger.map(row=>row.id)).size,club.ledger.length);
   assert(call('v61ValidateCareer',copy(career)),'reload invalid');
   rows.push({seed,season,mode:native?'native-compact':'synthetic-score-transactions',matches:991,ranking:[...career.world.countryRanking],minimumBalance:Math.min(...balances),maximumBalance:Math.max(...balances),offers:[...career.world.transition.offers],crownWinner:call('v62Current',career).find(c=>c.format==='crown').winnerId});
   console.log(seed,'season',season,'991 matches','min balance',Math.min(...balances));
   if(season<seasons){if(career.world.transition.choice===null)call('v67ChooseOffer',career);const age=own.roster[0]?.age,q=call('v62NextSeason',career);assert.equal(career.world.season,season+1);assert.equal(q.crown.length,26);assert.equal(q.horizon.length,32);assert.equal(new Set(q.horizon).size,32);assert.equal(career.world.qualifications.length,season+1);assert(call('v61ValidateCareer',career),'next season invalid '+seed+' S'+(season+1));if(age!==undefined)assert.equal(own.roster[0].age,age+1);}
  }
  await call('v61SaveCareers',[career]);const imported=await call('v61ImportCareerData',await call('v61ExportCareerData',career.id));assert.equal(JSON.stringify(imported.world),JSON.stringify(career.world));
  fs.mkdirSync('outputs/ligaexpansion-ap07',{recursive:true});fs.writeFileSync('outputs/ligaexpansion-ap07/'+(native?'native':'scenarios')+'.json',JSON.stringify({pass:true,rows},null,2)+'\n');
  if(native)fs.writeFileSync('outputs/ligaexpansion-ap07/closed-career.json',JSON.stringify(career));
 }
 console.log('AP07 multiyear passed:',rows.length,'seasons;',rows.length*991,'matches; export/import and all closures validated.');
})().catch(error=>{console.error(error);process.exitCode=1;});
