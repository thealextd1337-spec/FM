'use strict';

// Assigned during construction only. Old worlds are never upgraded on load.
const v176Budgets=[0,500,1000,1500];
const v176CountryQuality={A:.04,B:.02,C:0,D:-.03};
function v176Active(career){return career?.world?.youthSystem?.version===1;}
function v176Interpolate(amount,values){const x=Math.max(0,Math.min(1500,amount)),i=Math.min(2,Math.floor(x/500));return values[i]+(values[i+1]-values[i])*(x-i*500)/500;}
function v176Count(career,club,amount){const h=club.youthInvestmentHistory||[],smooth=amount*.45+(h.at(-1)?.amount||0)*.35+(h.at(-2)?.amount||0)*.2,n=v176Interpolate(smooth,[1.5,3.5,5,6]);return Math.floor(n)+(v61Random(`${career.world.seed}:${club.id}:youth-count:S${career.world.season}`)()<n%1?1:0);}
function v176Quality(status){return Math.max(-.15,Math.min(.15,(status-50)*.003));}
function v176StatusStep(status,smooth,sport){const target=.65*v176Interpolate(smooth,[0,45,75,100])+.35*Math.max(0,Math.min(100,sport));return status+(target-status)*(target>status?.15:.05);}
function v176Retiring(career,pid){return v176Active(career)&&career.world.retirementDecisions?.season===career.world.season&&career.world.retirementDecisions.players.some(p=>p.pid===pid&&p.retire);}

const v176InitBase=v67Init;
v67Init=function(career){
 if(career.world.progressionVersion===167){career.world.youthSystem={version:1};career.world.retirementDecisions={season:0,day:0,players:[]};career.world.retiredFreePlayers=[];for(const club of career.world.clubs)if(!club.simulationOnly)club.youthLegacy={status:(club.policy.youth-.5)*20,change:0,closedSeason:0,expectation:null};}
 return v176InitBase(career);
};
const v176AiBudgetBase=v67AiBudget;
v67AiBudget=function(career,club){if(!v176Active(career)||club.simulationOnly)return v176AiBudgetBase(career,club);const preferred=[0,500,1000,1000,1500][club.policy.youth-1],limit=Math.min(preferred,Math.max(0,club.balance-v66SalaryDue(career,club.id)-450)*.22);return v176Budgets.filter(n=>n<=limit).at(-1);};

// Normalize high-talent weights against the actual planned AI candidate counts.
// The manager's later choice uses its own complete cohort as a separate batch;
// both batches therefore retain the globally confirmed high-talent share.
function v176Population(career,club,count){
 const weights={weak:0,normal:0,strong:0},mapping=career.world.playerFoundation.qualityMapping;
 const cohort=club.id===career.manager.managedClubId?[{club,count}]:career.world.clubs.filter(c=>!c.simulationOnly&&c.id!==career.manager.managedClubId).map(c=>({club:c,count:career.world.youthSystem.plannedCounts[c.id]}));
 for(const row of cohort)weights[mapping[row.club.policy.youth]]+=row.count;
 return weights;
}
const v176StartBase=v67StartSeason;
v67StartSeason=function(career){
 if(v176Active(career))career.world.youthSystem.plannedCounts=Object.fromEntries(career.world.clubs.filter(c=>!c.simulationOnly&&c.id!==career.manager.managedClubId).map(c=>[c.id,v176Count(career,c,v67AiBudget(career,c))]));
 return v176StartBase(career);
};
const v176FundBase=v67FundYouth;
v67FundYouth=function(career,club,amount){
 if(!v176Active(career))return v176FundBase(career,club,amount);
 if(club.simulationOnly)return;
 if(!v176Budgets.includes(amount)||amount>v67BudgetLimit(club))throw Error('Das Jugendbudget ist nicht verfügbar oder nicht gedeckt.');
 const season=career.world.season;if(club.youthInvestmentHistory.some(r=>r.season===season))throw Error('Das Jugendbudget wurde bereits gebucht.');
 const count=v176Count(career,club,amount),population=v176Population(career,club,count);
 club.youthBudget=amount;club.youthInvestmentHistory.push({season,amount});
 if(amount)v66Book(career,club.id,`S${season}:${club.id}:youth-budget`,-amount,'Jahresbudget Nachwuchs');
 for(let slot=0;slot<count;slot++)club.youthPool.push(v176WithGeneration(career,club,population,()=>v67Youth(career,club,season,slot)));
};
const v176SetBudgetBase=v124SetYouthBudget;
v124SetYouthBudget=function(career,amount){if(v176Active(career)&&!v176Budgets.includes(Number(amount)))throw Error('Das Jugendbudget ist nicht verfügbar oder nicht gedeckt.');return v176SetBudgetBase(career,amount);};

let v176Generation=null;
function v176WithGeneration(career,club,population,work){const old=v176Generation;v176Generation={career,club,population};try{return work();}finally{v176Generation=old;}}
const v176YouthBase=v67Youth;
v67Youth=function(career,club,season,slot,start=false){
 if(!v176Active(career)||start)return v176YouthBase(career,club,season,slot,start);
 const pid=`${career.world.seed}:${club.id}:Y${season}:${slot}`,r=v61Random(`${pid}:position`)(),line=r<.12?'gk':r<.47?'def':r<.82?'mid':'att';
 // Main position must be set BEFORE native skill/cap/role generation.
 return v176WithGeneration(career,club,v176Generation?.population||v176Population(career,club,1),()=>{
  const old=v176Generation;v176Generation={...old,line};try{return v176YouthBase(career,club,season,slot,start);}finally{v176Generation=old;}
 });
};
const v176GenerateBase=v153Generate;
v153Generate=function(player,foundation,kind,quality,youthQuality,clubId){
 if(kind==='youth'&&v176Generation?.line){player.line=v176Generation.line;player.assignedLine=player.line;player.keeper=player.line==='gk';player.type=v61PositionNames[player.line];}
 return v176GenerateBase(player,foundation,kind,quality,youthQuality,clubId);
};
const v176ParametersBase=v161GenerationParameters;
v161GenerationParameters=function(foundation,kind,clubId){
 const params=v176ParametersBase(foundation,kind,clubId),g=v176Generation;if(!g||!v176Active(g.career)||kind==='start')return params;
 const country=v161Countries.find(c=>c.id===clubId?.split('-')[0]),countryPct=v176CountryQuality[country?.tier]||0,youth=kind==='youth'&&g.line,statusPct=youth?v176Quality(g.club.youthLegacy.status):0,factor=1+statusPct+countryPct;
 const offset=kind==='cup'&&foundation.expansionGeneration?.clubOffsets?.[clubId]!==undefined?foundation.expansionGeneration.tierOffsets[country.tier]:0;
 const rows=params.qualityByKind[kind].map(row=>({...row,byQuality:Object.fromEntries(Object.entries(row.byQuality).map(([quality,bands])=>[quality,(youth?row.byQuality.normal:bands).map(b=>({...b,min:Math.max(1,Math.min(20,(b.min-offset)*factor)),max:Math.max(1,Math.min(20,(b.max-offset)*factor))}))]))}));
 return {...params,...(youth?{youthPopulationWeights:g.population}:{}),qualityByKind:{...params.qualityByKind,[kind]:rows}};
};
const v176FreeBase=v66NewFreeAgents;
v66NewFreeAgents=function(career){return v176Active(career)?v176WithGeneration(career,null,null,()=>v176FreeBase(career)):v176FreeBase(career);};

function v176FreezeExpectations(career){
 if(!v176Active(career))return;
 for(const comp of v62Current(career).filter(c=>c.type==='league')){
  const clubs=career.world.clubs.filter(c=>c.leagueId===comp.country+'-LEAGUE').sort((a,b)=>v62Quality(b)-v62Quality(a)||a.id.localeCompare(b.id));
  for(const [index,club]of clubs.entries())if(club.youthLegacy.expectation?.season!==career.world.season)club.youthLegacy.expectation={season:career.world.season,rank:index+1,international:v62Current(career).filter(c=>c.type==='europe'&&c.entrants.includes(club.id)).map(c=>c.format)};
 }
}
const v176MarketBase=v66NextMarketDay;
v66NextMarketDay=function(career){const r=v176MarketBase(career);if(career.world.market.phase==='closed')v176FreezeExpectations(career);return r;};
function v176CupPoints(comp,id){const games=comp?.fixtures.filter(f=>f.result&&(f.homeId===id||f.awayId===id))||[];if(!games.length)return 0;if(comp.winnerId===id)return 1;return games.some(f=>f.round==='F')?.7:games.some(f=>f.round==='SF')?.5:games.some(f=>f.round==='QF')?.3:games.some(f=>f.round==='R16')?.15:.05;}
function v176CloseLegacy(career){
 const season=career.world.season,comps=v62Current(career);
 for(const club of career.world.clubs.filter(c=>!c.simulationOnly)){
  const legacy=club.youthLegacy;if(legacy.closedSeason===season)continue;
  const league=comps.find(c=>c.type==='league'&&c.country===club.countryId),rank=v62Table(league,career.world.clubs.filter(c=>c.leagueId===club.leagueId).map(c=>c.id)).findIndex(r=>r.clubId===club.id)+1;
  if(legacy.expectation?.season!==season)throw Error('Die Saisonerwartung fehlt.');
  const leaguePoints=Math.max(-25,Math.min(25,(legacy.expectation.rank-rank)*25/7)),cup=5*v176CupPoints(comps.find(c=>c.type==='cup'&&c.country===club.countryId),club.id),international=Math.max(0,...comps.filter(c=>c.type==='europe').map(c=>(c.format==='crown'?15:10)*v176CupPoints(c,club.id))),title=league.winnerId===club.id?5:0,sport=Math.max(0,Math.min(100,50+leaguePoints+Math.min(25,cup+international+title))),before=legacy.status;
  legacy.status=v176StatusStep(before,v67Smooth(club),sport);legacy.change=legacy.status-before;legacy.closedSeason=season;legacy.sport=sport;
 }
}
function v176DecideRetirements(career){
 if(!v176Active(career)||career.world.calendarCursor<v62Days.seasonEnd/2)return;
 const world=career.world;if(world.retirementDecisions.season===world.season)return;
 world.retirementDecisions={season:world.season,day:world.calendarCursor,players:[...world.clubs.flatMap(c=>c.roster),...world.market.freePlayers].filter(p=>p.age>=33).map(p=>({pid:p.pid,age:p.age,clubId:v66Owner(career,p.pid)?.id||null,retire:v61Random(`${world.seed}:S${world.season}:${p.pid}:audit-retirement`)()<Math.min(1,.4+(p.age-33)*.1)}))};
}
const v176AdvanceBase=v62AdvanceDay;
v62AdvanceDay=function(career){v176DecideRetirements(career);const r=v176AdvanceBase(career);v176DecideRetirements(career);return r;};
const v176RenewBase=v66Renew;
v66Renew=function(career,pid,...args){if(v176Retiring(career,pid))throw Error('Der Spieler beendet seine Karriere am Saisonende.');return v176RenewBase(career,pid,...args);};
const v176BidBase=v66MakeBid;
v66MakeBid=function(career,buyerId,pid,price,annual,years,...args){if(v176Retiring(career,pid))years=1;return v176BidBase(career,buyerId,pid,price,annual,years,...args);};
const v176TryBidBase=v66TryBid;
v66TryBid=function(career,bid){if(v176Retiring(career,bid.pid))bid.years=1;return v176TryBidBase(career,bid);};
const v176SubmitContractBase=v72SubmitContract;
v72SubmitContract=function(career,id,annual,years,promise){const item=career.world.market.negotiations?.find(n=>n.id===id);if(item&&v176Retiring(career,item.pid)&&Number(years)!==1)throw Error('Der Spieler beendet seine Karriere am Saisonende.');return v176SubmitContractBase(career,id,annual,years,promise);};
function v176RetirementFacts(player){
 const rows=[...(player.seasons||[]),...(player.history||[])],stations=[...new Set(rows.map(r=>r.clubId).filter(Boolean))];
 return{games:rows.reduce((s,r)=>s+(r.games??1),0),goals:rows.reduce((s,r)=>s+(r.goals||0),0),assists:rows.reduce((s,r)=>s+(r.assists||0),0),titles:(player.honours||[]).filter(h=>h.kind==='title').length,stations};
}
function v176Retire(career,player,club){
 const world=career.world;if(player.retiredSeason)return;
 player.retiredSeason=world.season;player.retirementStory=v176RetirementFacts(player);
 (club?(club.retiredPlayers??=[]):world.retiredFreePlayers).push(player);
 world.retirements??=[];world.retirements.push({season:world.season,pid:player.pid,name:player.name,clubId:club?.id||null,reason:'Abschied vom Profifußball',kind:'age'});
 v66RecordCareerEvent(career,`S${world.season}:${player.pid}:retirement`,'retirement',player,{clubId:club?.id||null,reason:'age'});
 world.contracts=world.contracts.filter(c=>c.pid!==player.pid);
}
function v176CloseRetirements(career){
 const world=career.world,ids=new Set(world.retirementDecisions.players.filter(p=>p.retire).map(p=>p.pid));
 for(const club of world.clubs){
  const retired=club.roster.filter(p=>ids.has(p.pid));let replacements,names;
  if(club.simulationOnly&&retired.length){replacements=v61GenerateRoster(v161Catalog.find(c=>c.id===club.id),`${world.seed}:S${world.season+1}:replacement`);names=new Set([...club.roster,...club.retiredPlayers].map(p=>p.name));}
  for(const old of retired){const slot=club.roster.indexOf(old);v176Retire(career,old,club);
   if(!club.simulationOnly){club.roster.splice(slot,1);continue;}
   const p=replacements[slot];p.age=18+Math.floor(v61Random(`${p.pid}:age`)()*6);p.n=old.n;
   v176WithGeneration(career,club,null,()=>v153Generate(p,{...world.playerFoundation,season:world.season+1},'cup',club.policy.startingSquad,club.policy.youth,club.id));
   p.name=v79PlayerName(p.nation,p.pid,names);names.add(p.name);p.retirementAge=v124RetirementAge(career,p);p.appearance=v61GenerateAppearance(p.pid,p.nation,p.age,club.roster);p.entrySeason=world.season+1;
   club.roster[slot]=p;world.contracts.push(v124SimulationContract(career,club,p));
  }
 }
 for(const p of world.market.freePlayers.filter(p=>ids.has(p.pid))){const decision=world.retirementDecisions.players.find(d=>d.pid===p.pid);v176Retire(career,p,v66Club(career,decision.clubId));}
 world.market.freePlayers=world.market.freePlayers.filter(p=>!ids.has(p.pid));
}
const v176CloseBase=v67SeasonEnd;
v67SeasonEnd=function(career){if(!v176Active(career))return v176CloseBase(career);if(career.world.transition?.fromSeason===career.world.season)return;v176DecideRetirements(career);v176CloseLegacy(career);const r=v176CloseBase(career);v176CloseRetirements(career);return r;};
const v176ArchiveBase=v64ArchiveSeason;
v64ArchiveSeason=function(career){return v176Active(career)?v124BaseArchiveSeason(career):v176ArchiveBase(career);};
const v176AgeBase=v153AgePlayer;
v153AgePlayer=function(career,p,season){if(v176Active(career)&&p.entrySeason===season){delete p.entrySeason;return;}return v176AgeBase(career,p,season);};
const v176PlayerBase=v66Player;
v66Player=function(career,pid){return v176PlayerBase(career,pid)||career.world.retiredFreePlayers?.find(p=>p.pid===pid);};

const v176ValidateBase=v67Validate;
v67Validate=function(career){
 if(!v176ValidateBase(career))return false;
 if(career.world.youthSystem===undefined)return true;
 if(!v176Active(career)||career.world.progressionVersion!==167)return false;
 const world=career.world,d=world.retirementDecisions,retired=world.retiredFreePlayers;
 if(!d||!Number.isInteger(d.season)||d.season<0||d.season>world.season||!Number.isInteger(d.day)||d.day<0||d.day>224||!Array.isArray(d.players)||new Set(d.players.map(p=>p.pid)).size!==d.players.length||d.players.some(p=>typeof p.pid!=='string'||!Number.isInteger(p.age)||p.age<33||typeof p.retire!=='boolean'))return false;
 if(!Array.isArray(retired)||new Set(retired.map(p=>p.pid)).size!==retired.length||retired.some(p=>!Number.isInteger(p.retiredSeason)||p.retiredSeason>world.season||v66Owner(career,p.pid)||world.market.freePlayers.some(f=>f.pid===p.pid)))return false;
 return world.clubs.filter(c=>!c.simulationOnly).every(c=>{const l=c.youthLegacy;return l&&Number.isFinite(l.status)&&l.status>=0&&l.status<=100&&Number.isFinite(l.change)&&Number.isInteger(l.closedSeason)&&l.closedSeason>=0&&l.closedSeason<=world.season&&v176Budgets.includes(c.youthBudget)&&c.youthInvestmentHistory.every(r=>v176Budgets.includes(r.amount))&&(l.expectation===null||Number.isInteger(l.expectation?.rank)&&l.expectation.rank>=1&&l.expectation.rank<=8&&l.expectation.season<=world.season);});
};
