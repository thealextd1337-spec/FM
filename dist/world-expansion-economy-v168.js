'use strict';

const v168LeaguePrizes=[700,550,430,340,270,210,165,130];
const v168BaseIncome=v66BaseIncome;
v66BaseIncome=function(club){const base=v168BaseIncome(club);return club.economyVersion===1?Math.round(base*1.08/10)*10:base;};
const v168BaseInit=v66Init;
v66Init=function(career){if(v167Active(career))for(const club of career.world.clubs)club.economyVersion=1;const result=v168BaseInit(career);if(v167Active(career))for(const contract of career.world.contracts)if(!contract.simulationOnly)contract.promise=Math.min(10,Math.round(contract.promise*14/10));return result;};
const v168BaseStart=v66StartSeason;
v66StartSeason=function(career){if(v167Active(career))for(const contract of career.world.contracts){contract.renewalOffers=0;delete contract.renewalRound;delete contract.renewalNextDay;delete contract.renewalNegotiation;}return v168BaseStart(career);};
const v168BaseSponsors=v66MakeSponsors;
v66MakeSponsors=function(career,club){const offers=v168BaseSponsors(career,club);if(!v167Active(career))return offers;const factor=v161EconomicFactors[club.expansionTier];for(const offer of offers){offer.fixed=Math.round(offer.fixed*1.1/10)*10;for(const goal of offer.goals){goal.bonus=Math.round(goal.bonus*1.15*factor/10)*10;if(goal.kind==='league'){goal.target=Math.ceil(goal.target*8/6);goal.label=`Liga: Platz ${goal.target} oder besser`;}if(goal.kind==='goals'&&club.leagueId){goal.target=Math.ceil(goal.target*14/10);goal.label=`Liga: mindestens ${goal.target} Tore`;}}}return offers;};
const v168BaseLeaguePrize=v66LeaguePrize;
v66LeaguePrize=function(career,rank){return v167Active(career)?v168LeaguePrizes[rank]:v168BaseLeaguePrize(career,rank);};
const v168BasePrize=v66Prize;
v66Prize=function(career,competition,kind){if(!v167Active(career))return v168BasePrize(career,competition,kind);if(competition.type==='europe')return kind==='match'?(competition.format==='crown'?55:40):competition.format==='crown'?400:280;return{R16:25,QF:45,SF:60,F:75,winner:150}[kind];};
function v168PromiseExpected(career,contract,club){const league=v62Current(career).find(c=>c.type==='league'&&c.country===club.countryId),games=league.fixtures.filter(f=>f.result&&f.day>=contract.startsAt&&(f.homeId===club.id||f.awayId===club.id)).length;return Math.floor(contract.promise*games/14);}
const v168BaseCredits=v66PromiseCredits;
v66PromiseCredits=function(career,player,season,fromDay=0){if(!v167Active(career))return v168BaseCredits(career,player,season,fromDay);const fixtures=new Map(v62Fixtures(career).map(f=>[f.id,f])),competitions=new Map(v62Current(career).map(c=>[c.id,c]));let full=0,short=0;for(const appearance of player.history.filter(a=>a.season===season&&(fixtures.get(a.fixtureId)?.day??-1)>=fromDay)){const fixture=fixtures.get(appearance.fixtureId),competition=competitions.get(fixture.competitionId),weight=competition.type==='europe'?1.5:competition.type==='cup'&&fixture.round!=='F'?.75:1,minutes=appearance.minutes*weight;if(minutes>=45)full++;else short+=minutes;}return full+Math.floor(short/45);};
// Native development continues to consume actual rated minutes. Only new
// AP07 careers receive the 14-match full-growth and 28-match reduced window.
const v168BaseDevelopment=v153ApplyAppearance;
v153ApplyAppearance=function(career,player,appearance,weights){return v168BaseDevelopment(career,player,v167Active(career)?{...appearance,fullSeasonMinutes:14*90}:appearance,weights);};
const v168BasePromote=v67Promote;
v67Promote=function(career,...args){if(v167Active(career)&&career.world.seasonFinished)throw Error('Nachwuchsübernahmen sind ab Beginn der neuen Saison wieder möglich.');return v168BasePromote(career,...args);};
if(typeof window==='object')Object.assign(window.D6Expansion,{economy:{version:1,leaguePrizes:[...v168LeaguePrizes],fullDevelopmentMinutes:1260,promiseLimit:14}});
