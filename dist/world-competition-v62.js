'use strict';

// Gemeinsamer, deterministischer Wettbewerbslauf der neuen Vereinswelt.
const v62Days={league:Array.from({length:10},(_,index)=>7+21*index),europeLeague:[11,32,53,74],cupQuarter:95,europeQuarter:[116,123],cupSemi:144,europeSemi:[165,172],cupFinal:193,europeFinal:214,seasonEnd:224};
const v62OpeningEurope={ENG:['ENG-2','ENG-3'],ESP:['ESP-1','ESP-4'],ITA:['ITA-2','ITA-6'],GER:['GER-1','GER-2'],FRA:['FRA-1','FRA-5'],POR:['POR-1','POR-4']};
const v62EuropeanCountryPairs=[[[5,0],[1,4],[2,3]],[[5,1],[2,0],[3,4]],[[5,2],[3,1],[4,0]],[[5,3],[4,2],[0,1]]];

function v62Shuffle(items,seed){
 const result=[...items],random=v61Random(seed);
 for(let index=result.length-1;index>0;index--){const other=Math.floor(random()*(index+1));[result[index],result[other]]=[result[other],result[index]]}
 return result;
}
function v62Fixture(competition,round,day,homeId,awayId,leg=1,pair=null){return{id:`${competition.id}:${round}:${pair??homeId+'-'+awayId}:${leg}`,competitionId:competition.id,round,day,homeId,awayId,leg,pair,result:null}}
function v62Add(competition,...fixtures){competition.fixtures.push(...fixtures)}
function v62CountryLeague(country,clubs,season,seed){
 const competition={id:`S${season}:${country}:LEAGUE`,type:'league',country,season,fixtures:[],winnerId:null};
 let order=v62Shuffle(clubs.map(club=>club.id),`${seed}:${competition.id}:draw`),first=[];
 for(let round=0;round<5;round++){
  first[round]=[];
  for(let pair=0;pair<3;pair++){
   const a=order[pair],b=order[5-pair],home=(round+pair)%2?a:b,away=home===a?b:a;
   first[round].push([home,away]);
  }
  order=[order[0],order[5],...order.slice(1,5)];
 }
 for(let round=0;round<10;round++)for(const [a,b]of first[round%5])v62Add(competition,v62Fixture(competition,`R${round+1}`,v62Days.league[round],round<5?a:b,round<5?b:a));
 return competition;
}
function v62CountryCup(country,clubs,season,seed){
 const competition={id:`S${season}:${country}:CUP`,type:'cup',country,season,fixtures:[],winnerId:null,finalistId:null};
 const draw=v62Shuffle(clubs.map(club=>club.id),`${seed}:${competition.id}:QF`);
 for(let pair=0;pair<4;pair++)v62Add(competition,v62Fixture(competition,'QF',v62Days.cupQuarter,draw[pair*2],draw[pair*2+1],1,pair));
 return competition;
}
function v62EuropeHomeCountries(){
 const edges=v62EuropeanCountryPairs.flat(),used=new Set(),home=new Map();
 for(let start=0;start<6;start++)while(edges.some(([a,b],index)=>!used.has(index)&&(a===start||b===start))){
  let current=start;
  do{
   const index=edges.findIndex(([a,b],position)=>!used.has(position)&&(a===current||b===current));
   if(index<0)throw Error('Europacup-Heimrecht konnte nicht verteilt werden.');
   used.add(index);
   const[a,b]=edges[index],next=a===current?b:a;
   home.set([Math.min(a,b),Math.max(a,b)].join('-'),current);
   current=next;
  }while(current!==start);
 }
 return home;
}
function v62Europe(entrants,season,seed){
 const competition={id:`S${season}:EUROPE`,type:'europe',country:null,season,entrants,fixtures:[],winnerId:null,ranking:null,quarterPairs:null,semiPairs:null};
 const countries=v61Countries.map(([country])=>entrants.filter(id=>id.startsWith(`${country}-`)));
 if(countries.some(group=>group.length!==2)||new Set(entrants).size!==12)throw Error('Die Europacup-Qualifikation ist ungültig.');
 const homeCountries=v62EuropeHomeCountries(),countryOrder=v62Shuffle([0,1,2,3,4,5],`${seed}:${competition.id}:draw`);
 for(let round=0;round<4;round++){
  const pairs=v62EuropeanCountryPairs[round];
  for(const [a,b]of pairs)for(let slot=0;slot<2;slot++){
   const left=countries[countryOrder[a]][slot],right=countries[countryOrder[b]][slot],homeCountry=homeCountries.get([Math.min(a,b),Math.max(a,b)].join('-')),home=slot===0?(homeCountry===a?left:right):(homeCountry===a?right:left);
   v62Add(competition,v62Fixture(competition,`R${round+1}`,v62Days.europeLeague[round],home,home===left?right:left));
  }
 }
 return competition;
}
function v62PrepareSeason(career,entrants=null){
 const world=career.world,season=world.season,clubs=world.clubs,seed=world.seed;
 if(!Array.isArray(world.competitions))world.competitions=[];
 const current=[];
 for(const[country]of v61Countries){
  const members=clubs.filter(club=>club.countryId===country);
  current.push(v62CountryLeague(country,members.filter(club=>club.leagueId),season,seed));
  current.push(v62CountryCup(country,members,season,seed));
 }
 const entryIds=entrants??v61Countries.flatMap(([country])=>v62OpeningEurope[country]);
 current.push(v62Europe(entryIds,season,seed));
 world.competitions.push(...current);
 world.calendarCursor=-1;
 world.seasonFinished=false;
 world.europeEntrants=entryIds;
 v62ValidateSchedule(current,clubs);
 return current;
}
function v62Current(career){return career.world.competitions.filter(competition=>competition.season===career.world.season)}
function v62Fixtures(career){return v62Current(career).flatMap(competition=>competition.fixtures)}
function v62Table(competition,clubIds){
 const rows=new Map(clubIds.map(id=>[id,{clubId:id,played:0,wins:0,draws:0,losses:0,goalsFor:0,goalsAgainst:0,points:0}]));
 for(const fixture of competition.fixtures){if(!fixture.result||competition.type==='europe'&&!fixture.round.startsWith('R'))continue;
  const home=rows.get(fixture.homeId),away=rows.get(fixture.awayId);if(!home||!away)continue;
  const{homeGoals,awayGoals}=fixture.result;home.played++;away.played++;home.goalsFor+=homeGoals;home.goalsAgainst+=awayGoals;away.goalsFor+=awayGoals;away.goalsAgainst+=homeGoals;
  if(homeGoals>awayGoals){home.wins++;away.losses++;home.points+=3}else if(homeGoals<awayGoals){away.wins++;home.losses++;away.points+=3}else{home.draws++;away.draws++;home.points++;away.points++}
 }
 const lots=new Map(clubIds.map(id=>[id,v61Random(`${competition.id}:${id}:lot`)()]));
 return[...rows.values()].sort((a,b)=>b.points-a.points||(b.goalsFor-b.goalsAgainst)-(a.goalsFor-a.goalsAgainst)||b.goalsFor-a.goalsFor||b.wins-a.wins||lots.get(a.clubId)-lots.get(b.clubId));
}
function v62Quality(club){
 const skills=club.roster.map(player=>player.line==='gk'?(player.gk+player.pos+player.air)/3:(player.tec+player.pas+player.fin+player.tak+player.pos+player.spd+player.sta+player.air)/8);
 return skills.reduce((sum,value)=>sum+value,0)/skills.length;
}
function v62Score(career,fixture){
 return v64SimulateFixture(career,fixture);
}
function v62ResolveSingle(career,fixture){
 fixture.result=fixture.result||v62Score(career,fixture);
 const result=fixture.result;
 if(result.homeGoals!==result.awayGoals)result.winnerId=result.homeGoals>result.awayGoals?fixture.homeId:fixture.awayId;
 else{if(!result.penalties){const random=v61Random(`${career.world.seed}:${fixture.id}:penalties`),home=3+Math.floor(random()*3),away=3+Math.floor(random()*3);result.penalties=home===away?(random()<.5?[home+1,away]:[home,away+1]):[home,away]}result.winnerId=result.penalties[0]>result.penalties[1]?fixture.homeId:fixture.awayId}
}
function v62ResolveLeague(career,fixture){fixture.result=fixture.result||v62Score(career,fixture)}
function v62ResolveSecondLeg(career,fixture,competition){
 fixture.result=fixture.result||v62Score(career,fixture);
 const first=competition.fixtures.find(item=>item.pair===fixture.pair&&item.round===fixture.round&&item.leg===1);
 const homeTotal=fixture.result.homeGoals+first.result.awayGoals,awayTotal=fixture.result.awayGoals+first.result.homeGoals;
 fixture.result.aggregate=[homeTotal,awayTotal];
 if(homeTotal===awayTotal&&!fixture.result.penalties){const random=v61Random(`${career.world.seed}:${fixture.id}:penalties`),home=3+Math.floor(random()*3),away=3+Math.floor(random()*3);fixture.result.penalties=home===away?(random()<.5?[home+1,away]:[home,away+1]):[home,away]}
 fixture.result.winnerId=homeTotal>awayTotal?fixture.homeId:awayTotal>homeTotal?fixture.awayId:fixture.result.penalties[0]>fixture.result.penalties[1]?fixture.homeId:fixture.awayId;
}
function v62CupProgress(career,competition,day){
 const seed=career.world.seed;
 if(day===v62Days.cupQuarter){
  const winners=v62Shuffle(competition.fixtures.filter(fixture=>fixture.round==='QF').map(fixture=>fixture.result.winnerId),`${seed}:${competition.id}:SF`);
  for(let pair=0;pair<2;pair++)v62Add(competition,v62Fixture(competition,'SF',v62Days.cupSemi,winners[pair*2],winners[pair*2+1],1,pair));
 }else if(day===v62Days.cupSemi){
  const winners=competition.fixtures.filter(fixture=>fixture.round==='SF').map(fixture=>fixture.result.winnerId),draw=v62Shuffle(winners,`${seed}:${competition.id}:F`);
  v62Add(competition,v62Fixture(competition,'F',v62Days.cupFinal,draw[0],draw[1],1,0));
 }else if(day===v62Days.cupFinal){const final=competition.fixtures.find(fixture=>fixture.round==='F');competition.winnerId=final.result.winnerId;competition.finalistId=final.homeId===competition.winnerId?final.awayId:final.homeId}
}
function v62TwoLegPair(competition,round,days,a,b,pair,rank){
 const higher=rank.indexOf(a)<rank.indexOf(b)?a:b,lower=higher===a?b:a;
 v62Add(competition,v62Fixture(competition,round,days[0],lower,higher,1,pair),v62Fixture(competition,round,days[1],higher,lower,2,pair));
}
function v62EuropeProgress(career,competition,day){
 const seed=career.world.seed;
 if(day===v62Days.europeLeague[3]){
  const rank=v62Table(competition,competition.entrants).map(row=>row.clubId),lower=v62Shuffle(rank.slice(4,8),`${seed}:${competition.id}:QF`);
  competition.ranking=rank;competition.quarterPairs=rank.slice(0,4).map((id,index)=>[id,lower[index]]);
  competition.quarterPairs.forEach(([a,b],index)=>v62TwoLegPair(competition,'QF',v62Days.europeQuarter,a,b,index,rank));
 }else if(day===v62Days.europeQuarter[1]){
  const winners=competition.fixtures.filter(fixture=>fixture.round==='QF'&&fixture.leg===2).map(fixture=>fixture.result.winnerId);
  competition.semiPairs=[[winners[0],winners[1]],[winners[2],winners[3]]];
  competition.semiPairs.forEach(([a,b],index)=>v62TwoLegPair(competition,'SF',v62Days.europeSemi,a,b,index,competition.ranking));
 }else if(day===v62Days.europeSemi[1]){
  const winners=competition.fixtures.filter(fixture=>fixture.round==='SF'&&fixture.leg===2).map(fixture=>fixture.result.winnerId);
  v62Add(competition,v62Fixture(competition,'F',v62Days.europeFinal,winners[0],winners[1],1,0));
 }else if(day===v62Days.europeFinal){competition.winnerId=competition.fixtures.find(fixture=>fixture.round==='F').result.winnerId}
}
function v62AdvanceDay(career){
 const world=career.world,fixtures=v62Fixtures(career),freeDays=(world.market?.phase==='closed'?world.market.pendingBids.filter(bid=>bid.status==='pending'&&!bid.sellerId).map(bid=>bid.placedDay+1):[]),days=[...new Set([...fixtures.filter(fixture=>!fixture.result).map(fixture=>fixture.day),...freeDays,world.pendingMatchDay,v62Days.seasonEnd])].filter(day=>Number.isInteger(day)&&day>world.calendarCursor).sort((a,b)=>a-b);
 if(!days.length)return[];
 const day=days[0],todays=fixtures.filter(fixture=>fixture.day===day&&!fixture.result),playedToday=fixtures.filter(fixture=>fixture.day===day),byId=new Map(v62Current(career).map(competition=>[competition.id,competition]));
 if(typeof v66ResolveFreeDecisions==='function')v66ResolveFreeDecisions(career,day);
 for(const fixture of todays){
  const competition=byId.get(fixture.competitionId);
  v64PrepareFixture(career,fixture);
  v63BeforeFixture(career,fixture);
  if(competition.type==='league'||competition.type==='europe'&&fixture.round.startsWith('R'))v62ResolveLeague(career,fixture);
  else if(competition.type==='europe'&&fixture.leg===2)v62ResolveSecondLeg(career,fixture,competition);
  else if(competition.type==='europe'&&fixture.round==='F')v62ResolveSingle(career,fixture);
  else if(competition.type==='europe')fixture.result=v62Score(career,fixture);
  else v62ResolveSingle(career,fixture);
  world.eventLog.processedEventIds.push(fixture.id);
  v63AfterFixture(career,fixture);
  if(typeof v66AfterFixture==='function')v66AfterFixture(career,fixture);
 }
 world.calendarCursor=day;
 if(day>=112&&world.market&&typeof v66RefreshMarketValues==='function')v66RefreshMarketValues(career,'mid');
 if(world.pendingMatchDay===day)delete world.pendingMatchDay;
 for(const competition of v62Current(career)){
  if(competition.type==='cup'&&playedToday.some(fixture=>fixture.competitionId===competition.id))v62CupProgress(career,competition,day);
  if(competition.type==='europe'&&playedToday.some(fixture=>fixture.competitionId===competition.id))v62EuropeProgress(career,competition,day);
  if(competition.type==='league'&&day===v62Days.league[9])competition.winnerId=v62Table(competition,competition.fixtures.flatMap(fixture=>[fixture.homeId,fixture.awayId]).filter((id,index,array)=>array.indexOf(id)===index))[0].clubId;
 }
 if(day===v62Days.seasonEnd){if(typeof v74CloseSeason==='function')v74CloseSeason(career);if(typeof v66SeasonEnd==='function')v66SeasonEnd(career);v63SeasonEnd(career);if(typeof v67SeasonEnd==='function')v67SeasonEnd(career);world.seasonFinished=true}
 return todays;
}
function v62AdvanceToManaged(career){
 const managed=career.manager.managedClubId,results=[];
 while(!career.world.seasonFinished){const batch=v62AdvanceDay(career);results.push(...batch);if(batch.some(fixture=>fixture.homeId===managed||fixture.awayId===managed))break}
 career.updated=new Date().toISOString();
 return results;
}
function v62NextEntrants(career){
 return v61Countries.flatMap(([country])=>{
  const league=v62Current(career).find(item=>item.type==='league'&&item.country===country),cup=v62Current(career).find(item=>item.type==='cup'&&item.country===country);
  if(!league.winnerId||!cup.winnerId)throw Error('Ein Landeswettbewerb ist noch nicht abgeschlossen.');
  return[league.winnerId,league.winnerId===cup.winnerId?cup.finalistId:cup.winnerId];
 });
}
function v62NextSeason(career){
 if(!career.world.seasonFinished)throw Error('Die Saison ist noch nicht abgeschlossen.');
 if(typeof v67BeforeNextSeason==='function')v67BeforeNextSeason(career);
 const entrants=v62NextEntrants(career);
 v64ArchiveSeason(career);
 v63ArchiveSeason(career);
 career.world.season++;
 v63NextSeason(career);
 v62PrepareSeason(career,entrants);
 if(typeof v66StartSeason==='function')v66StartSeason(career);
 if(typeof v67StartSeason==='function')v67StartSeason(career);
 career.updated=new Date().toISOString();
}
function v62ValidateSchedule(competitions,clubs){
 const fixtures=competitions.flatMap(item=>item.fixtures),perClub=new Map(clubs.map(club=>[club.id,[]]));
 for(const fixture of fixtures){
  if(fixture.homeId===fixture.awayId||!perClub.has(fixture.homeId)||!perClub.has(fixture.awayId))throw Error('Ungültige Spielpaarung.');
  perClub.get(fixture.homeId).push(fixture.day);perClub.get(fixture.awayId).push(fixture.day);
 }
 for(const days of perClub.values()){days.sort((a,b)=>a-b);for(let index=1;index<days.length;index++)if(days[index]-days[index-1]<3)throw Error('Zu wenig spielfreie Tage.');}
 if(new Set(fixtures.map(fixture=>fixture.id)).size!==fixtures.length)throw Error('Doppelte Spiel-ID.');
}

function v62Date(day){return new Intl.DateTimeFormat('de-DE',{day:'numeric',month:'long',timeZone:'UTC'}).format(new Date(Date.UTC(2024,7,1+day)))}
function v62ShortDate(day){return new Intl.DateTimeFormat('de-DE',{day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(Date.UTC(2024,7,1+day)))}
function v62AwardIcon(country,kind){
 const colors={ENG:['#e7f0f3','#d84651'],ESP:['#ffdb63','#bb263a'],ITA:['#d8f0e4','#269569'],GER:['#ffda68','#d44d42'],FRA:['#dbe8ff','#4b73c7'],POR:['#dcf3de','#328658'],EU:['#d6e4ff','#d8ad54']};
 const [light,accent]=colors[country]||colors.EU;
 const shapes={
  league:'<path d="M10 21 15 25 22 15 29 25 34 21 31 33H13l-3-12ZM13 36h18"/>',
  cup:'<path d="M15 13h18v10a9 9 0 0 1-18 0V13ZM15 17H9v5a7 7 0 0 0 7 7m17-12h6v5a7 7 0 0 1-7 7M24 32v5m-8 2h16"/>',
  'top-scorer':'<circle cx="24" cy="23" r="11"/><path d="m24 17 5 4-2 6h-6l-2-6 5-4Zm-9 1 4 3m-1 10 3-4m12-9-4 3m1 10-3-4"/>',
  'player-of-season':'<path d="m24 11 3.6 8 8.8 1-6.5 5.9 1.8 8.7-7.7-4.4-7.7 4.4 1.8-8.7-6.5-5.9 8.8-1 3.6-8Z"/>',
  'man-of-the-match':'<circle cx="24" cy="23" r="12"/><path d="m24 15 2.5 5.5 6 .7-4.4 4 1.2 5.8-5.3-3-5.3 3 1.2-5.8-4.4-4 6-.7 2.5-5.5Z"/>',
  europe:'<circle cx="24" cy="23" r="11"/><path d="M13 23h22M24 12c-5 5-5 17 0 22 5-5 5-17 0-22M17 15l14 16"/>'
 };
 return`<svg class="v62-award-icon v62-award-icon-${kind}" viewBox="0 0 48 48" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="44" height="44" rx="11" fill="#132a30" stroke="${accent}" stroke-width="2"/><path d="M5 6h38v5H5z" fill="${accent}"/><path d="M8 40h32" stroke="${accent}" stroke-width="2" stroke-linecap="round"/><g stroke="${light}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${shapes[kind]||shapes.europe}</g></svg>`;
}
function v62LeagueLabel(country){return`${v61FlagSVG(country)} ${escapeHTML(v61CountryNames[country])} · Liga 1`}
function v62Name(career,id){return escapeHTML(career.world.clubs.find(club=>club.id===id)?.name||id)}
function v62ResultHTML(career,fixture){
 const score=fixture.result?`${fixture.result.homeGoals}:${fixture.result.awayGoals}${fixture.result.penalties?` <small>i. E. ${fixture.result.penalties.join(':')}</small>`:''}`:'–';
 return`<div class="v62-fixture"><span>${v62Date(fixture.day)} · ${escapeHTML(fixture.round)}</span><strong>${v62Name(career,fixture.homeId)} <b>${score}</b> ${v62Name(career,fixture.awayId)}</strong></div>`;
}
function v62RecentGames(career,clubId){
 return career.world.competitions.flatMap(competition=>competition.fixtures.filter(fixture=>fixture.result&&(fixture.homeId===clubId||fixture.awayId===clubId)).map(fixture=>({fixture,season:competition.season}))).sort((a,b)=>a.season-b.season||a.fixture.day-b.fixture.day);
}
function v62FormHTML(career,clubId){
 const games=v62RecentGames(career,clubId).slice(-5),results=games.map(({fixture})=>{const own=fixture.homeId===clubId?fixture.result.homeGoals:fixture.result.awayGoals,other=fixture.homeId===clubId?fixture.result.awayGoals:fixture.result.homeGoals;return own>other?'S':own<other?'N':'U'}),names={S:'Sieg',N:'Niederlage',U:'Unentschieden','–':'Noch kein Spiel'};
 return`<div class="v49-form" aria-label="Form der letzten fünf Spiele: ${escapeHTML(results.map(result=>names[result]).join(', ')||'Noch keine Spiele')}">${[...Array(5-results.length).fill('–'),...results].map(result=>`<b class="${{S:'win',N:'loss',U:'draw','–':'empty'}[result]}" title="${names[result]}">${result}</b>`).join('')}</div>`;
}
function v62NextOpponentHTML(career,fixture){
 if(!fixture)return'';
 const competition=v62Current(career).find(item=>item.id===fixture.competitionId),club=id=>career.world.clubs.find(item=>item.id===id);
 const managed=career.manager.managedClubId,opponent=fixture.homeId===managed?fixture.awayId:fixture.homeId;
 const duels=v62RecentGames(career,managed).filter(item=>item.fixture.homeId===opponent||item.fixture.awayId===opponent).slice(-3).reverse();
 const side=(id,label)=>{const team=club(id);return`<div class="v49-club"><span class="v49-side">${label}</span><strong>${v61FlagSVG(team.countryId)}<span>${escapeHTML(team.name)}</span></strong>${v62FormHTML(career,id)}</div>`};
 return`<section class="v49-match-preview v62-next-opponent"><p>Nächster Gegner · ${competition.type==='league'?v62LeagueLabel(competition.country):competition.type==='cup'?'Nationaler Pokal':'Europacup'} · ${v62Date(fixture.day)}</p><div class="v49-fixture">${side(fixture.homeId,'Heim')}<span>gegen</span>${side(fixture.awayId,'Auswärts')}</div>${duels.length?`<div class="v62-duels"><h4>Letzte Duelle</h4>${duels.map(({fixture:game,season})=>{const home=game.homeId===managed,ownGoals=home?game.result.homeGoals:game.result.awayGoals,otherGoals=home?game.result.awayGoals:game.result.homeGoals,outcome=ownGoals>otherGoals?'Sieg':ownGoals<otherGoals?'Niederlage':'Remis';return`<div class="${outcome==='Sieg'?'win':outcome==='Niederlage'?'loss':'draw'}"><small>S${season} · ${v62ShortDate(game.day)} · <abbr title="${home?'Heim':'Auswärts'}">${home?'H':'A'}</abbr></small><strong aria-label="${outcome} ${ownGoals} zu ${otherGoals}">${ownGoals}:${otherGoals}</strong></div>`}).join('')}</div>`:''}</section>`;
}
function v62StatLeaders(career,competition,key,keepersOnly=false){
 if(!competition)return[];
 const season=career.world.season,entries=[...career.world.clubs.flatMap(club=>club.roster.map(player=>({club,player}))),...(career.world.market?.freePlayers||[]).map(player=>({club:null,player}))];
 return entries.filter(({player})=>!keepersOnly||player.keeper).map(({club,player})=>({club,player,value:(player.history||[]).filter(item=>item.season===season&&item.competitionId===competition.id).reduce((total,item)=>total+(item[key]||0),0)})).filter(entry=>entry.value>0).sort((a,b)=>b.value-a.value||a.player.name.localeCompare(b.player.name,'de')).slice(0,10);
}
function v62StatBoardHTML(career,competition,title){
 const categories=[['Tore','goals',false],['Assists','assists',false],['Zu null','cleanSheet',true],['Fouls','fouls',false],['Elfmeter verwandelt','penaltiesScored',false],['Elfmeter verschossen','penaltiesMissed',false]];
 return`<section class="v62-season v62-stat-board"><h3>${title}</h3>${categories.map(([label,key,keepersOnly])=>{const rows=v62StatLeaders(career,competition,key,keepersOnly);return`<details class="v46-stat-category" open><summary><span>${label}</span><small>${rows.length?`Top ${rows.length}`:'Keine Einträge'}</small></summary>${rows.length?`<table class="v46-leader-table"><thead><tr><th scope="col">#</th><th scope="col">Spieler</th><th scope="col">Verein</th><th scope="col">Wert</th></tr></thead><tbody>${rows.map((entry,index)=>`<tr class="${entry.club?.id===career.manager.managedClubId?'own':''}"><td>${index+1}</td><th scope="row"><button type="button" class="player-link v46-leader-player" data-v61-player="${escapeHTML(entry.player.pid)}">${v61FlagSVG(entry.player.nation)}${escapeHTML(entry.player.name)}</button></th><td>${escapeHTML(entry.club?.name||'Vereinslos')}</td><td>${entry.value}</td></tr>`).join('')}</tbody></table>`:'<p class="help">In dieser Saison ist noch kein Wert erfasst.</p>'}</details>`}).join('')}</section>`;
}
function v62TableHTML(career,competition){
 const ids=competition.type==='europe'?competition.entrants:[...new Set(competition.fixtures.flatMap(fixture=>[fixture.homeId,fixture.awayId]))],rows=v62Table(competition,ids);
 return`<div class="v62-table-wrap"><table class="v62-table"><thead><tr><th>Pl.</th><th>Verein</th><th>Sp.</th><th>TD</th><th>Pkt.</th></tr></thead><tbody>${rows.map((row,index)=>`<tr class="${row.clubId===career.manager.managedClubId?'own':''}"><td>${index+1}</td><td>${v62Name(career,row.clubId)}</td><td>${row.played}</td><td>${row.goalsFor-row.goalsAgainst}</td><td>${row.points}</td></tr>`).join('')}</tbody></table></div>`;
}
function v62EuropeKnockoutHTML(career,europe){
 const rounds=[['QF','Viertelfinale'],['SF','Halbfinale'],['F','Finale']];
 const groups=rounds.map(([code,label])=>{
  const games=europe.fixtures.filter(fixture=>fixture.round===code).sort((a,b)=>a.day-b.day||a.id.localeCompare(b.id));
  return games.length?`<section class="v62-knockout-round"><h4>${label}</h4>${games.map(fixture=>v62ResultHTML(career,fixture)).join('')}</section>`:'';
 }).filter(Boolean);
 return groups.join('')||'<p class="v62-explainer">Die K.-o.-Duelle stehen nach der Ligaphase fest.</p>';
}
function v62EuropeDetailsHTML(career,europe){
 return`<h4>Ligaphase · Tabelle</h4>${v62TableHTML(career,europe)}<h4>K.-o.-Duelle</h4>${v62EuropeKnockoutHTML(career,europe)}`;
}
function v62CupBracketHTML(career,cup){
 const rounds=[['QF','Viertelfinale',4],['SF','Halbfinale',2],['F','Finale',1]];
 const current=rounds.findIndex(([code,,count])=>{const games=cup.fixtures.filter(item=>item.round===code);return games.length<count||games.some(item=>!item.result)});
 const selected=current<0?rounds.length-1:current;
 return`<div class="v62-cup-bracket-scroll" role="region" aria-label="Turnierbaum ${escapeHTML(v61CountryNames[cup.country])} · Saison ${cup.season}" data-v62-cup-bracket data-v62-cup-index="${selected}"><div class="v62-cup-slide-controls"><button type="button" data-v62-cup-slide="-1" aria-label="Vorherige Runde" ${selected===0?'disabled':''}>‹</button><span data-v62-cup-slide-label>${rounds[selected][1]}</span><button type="button" data-v62-cup-slide="1" aria-label="Nächste Runde" ${selected===rounds.length-1?'disabled':''}>›</button></div><div class="v62-cup-bracket">${rounds.map(([code,label,count],index)=>{const games=cup.fixtures.filter(item=>item.round===code).sort((a,b)=>(a.pair??0)-(b.pair??0)||a.id.localeCompare(b.id));return`<section class="v62-cup-round" data-v62-cup-round="${index}" ${index===selected?'':'hidden'}><h4>${label}</h4><div class="v62-cup-round-games">${Array.from({length:count},(_,position)=>games[position]?v62ResultHTML(career,games[position]):`<div class="v62-cup-pending">Paarung folgt nach ${code==='SF'?'dem Viertelfinale':'dem Halbfinale'}</div>`).join('')}</div></section>`}).join('')}</div></div>`;
}
let v62CompetitionArea='own';
let v62OtherCountry=null;
let v62CompetitionSeason=null;
let v62CalendarSeason=null;
function v62CalendarHTML(career){
 const season=Number.isInteger(v62CalendarSeason)&&v62CalendarSeason>=1&&v62CalendarSeason<=career.world.season?v62CalendarSeason:career.world.season,managed=career.manager.managedClubId;
 const games=career.world.competitions.filter(item=>item.season===season).flatMap(competition=>competition.fixtures.filter(fixture=>fixture.homeId===managed||fixture.awayId===managed).map(fixture=>({fixture,competition}))).sort((a,b)=>a.fixture.day-b.fixture.day||a.fixture.id.localeCompare(b.fixture.id));
 return`<section class="v62-season v62-calendar"><div class="v62-competition-heading"><div><p class="eyebrow">Dein Spielplan</p><h2>Kalender · Saison ${season}</h2></div><label>Saison auswählen <select data-v62-calendar-season-choice>${Array.from({length:career.world.season},(_,index)=>career.world.season-index).map(value=>`<option value="${value}" ${value===season?'selected':''}>Saison ${value}${value===career.world.season?' · aktuell':''}</option>`).join('')}</select></label></div>${games.length?`<div class="v62-calendar-columns" aria-hidden="true"><span>Datum</span><span>Wettbewerb</span><span>Gegner</span><span>Ergebnis</span></div><ol class="v62-calendar-list">${games.map(({fixture,competition})=>{const home=fixture.homeId===managed,opponent=career.world.clubs.find(club=>club.id===(home?fixture.awayId:fixture.homeId)),result=fixture.result,ownGoals=result?(home?result.homeGoals:result.awayGoals):null,otherGoals=result?(home?result.awayGoals:result.homeGoals):null,label=competition.type==='league'?`${v61CountryNames[competition.country]} · Liga 1`:competition.type==='cup'?`${v61CountryNames[competition.country]} · Nationaler Pokal`:'Europacup',shootout=result?.penalties?(home?result.penalties:[...result.penalties].reverse()):null;return`<li class="${result?'played':'upcoming'}"><time>${v62Date(fixture.day)}</time><span class="v62-calendar-competition">${escapeHTML(label)}<small>${escapeHTML(fixture.round)}</small></span><strong class="v62-calendar-opponent"><button type="button" class="v68-club-link" data-v68-club="${escapeHTML(opponent?.id||'')}" aria-label="Vereinsprofil ${escapeHTML(opponent?.name||'Gegner')} öffnen">${v61CrestSVG(opponent)}<span>${escapeHTML(opponent?.name||'Gegner')}</span></button><small>${home?'Heim':'Auswärts'}</small></strong><b class="v62-calendar-result">${result?`${ownGoals}:${otherGoals}${shootout?`<small>i. E. ${shootout[0]}:${shootout[1]}</small>`:''}`:'–'}</b></li>`}).join('')}</ol>`:'<p class="v62-explainer">Für diese Saison sind keine Spiele angesetzt.</p>'}</section>`;
}
function v62AwardOverviewHTML(career,season){
 const players=[...career.world.clubs.flatMap(club=>club.roster),...career.world.market.freePlayers];
 const awards=career.world.competitions.filter(item=>item.season===season&&item.type==='league');
 const winner=(competition,kind)=>players.find(player=>(player.honours||[]).some(item=>item.competitionId===competition.id&&item.kind===kind));
 return`<section class="v62-awards-overview"><h3>Persönliche Awards · Saison ${season}</h3><div class="v62-awards-grid">${awards.map(competition=>{const scorer=winner(competition,'top-scorer'),best=winner(competition,'player-of-season'),name=player=>player?`<button type="button" class="player-link" data-v68-player="${escapeHTML(player.pid)}">${escapeHTML(player.name)}</button>`:'<span>Noch nicht vergeben</span>';return`<article><h4>${v62LeagueLabel(competition.country)}</h4><p>${v62AwardIcon(competition.country,'top-scorer')}<span><small>Torschützenkönig</small>${name(scorer)}</span></p><p>${v62AwardIcon(competition.country,'player-of-season')}<span><small>Spieler der Saison</small>${name(best)}</span></p></article>`}).join('')}</div></section>`;
}
function v62CareerViewsHTML(career){
 const competitions=v62Current(career),fixtures=v62Fixtures(career),managed=career.manager.managedClubId,ownClub=career.world.clubs.find(club=>club.id===managed),ownCountry=ownClub.countryId;
 const next=fixtures.filter(fixture=>!fixture.result&&(fixture.homeId===managed||fixture.awayId===managed)).sort((a,b)=>a.day-b.day)[0];
 const ownRecent=v62RecentGames(career,managed).slice(-5).reverse();
 const ownLeague=competitions.find(item=>item.type==='league'&&item.country===ownCountry),ownCup=competitions.find(item=>item.type==='cup'&&item.country===ownCountry);
 const europe=competitions.find(item=>item.type==='europe');
 const ownFixtures=item=>item.fixtures.filter(fixture=>fixture.homeId===managed||fixture.awayId===managed);
 const ownCompetitionHTML=(item,label)=>`<details open><summary>${label}</summary>${ownFixtures(item).map(fixture=>v62ResultHTML(career,fixture)).join('')||'<p class="v62-explainer">Noch keine Partie angesetzt.</p>'}</details>`;
 const nextText=next?`Nächstes Spiel: ${v62Date(next.day)} · ${v62Name(career,next.homeId)} gegen ${v62Name(career,next.awayId)}`:career.world.seasonFinished?'Alle Wettbewerbe abgeschlossen.':'Für deinen Verein ist kein weiteres Spiel angesetzt.';
 const overview=`<section class="v62-season"><div class="v62-season-head"><div><p class="eyebrow">Saisonüberblick</p><h2>Saison ${career.world.season}</h2><p>${nextText}</p></div></div>${v62NextOpponentHTML(career,next)}<h3>Deine letzten fünf Spiele</h3>${ownRecent.length?`<div class="v62-recent v62-own-recent">${ownRecent.map(({fixture})=>v62ResultHTML(career,fixture)).join('')}</div>`:'<p class="v62-explainer">Noch kein Spiel absolviert.</p>'}<h3>Deine Wettbewerbe</h3><div class="v62-competitions v62-own-competitions"><details open><summary>${v62LeagueLabel(ownCountry)}</summary>${v62TableHTML(career,ownLeague)}</details>${ownCompetitionHTML(ownCup,`${v61FlagSVG(ownCountry)} ${escapeHTML(v61CountryNames[ownCountry])} · Nationaler Pokal`)}${europe.entrants.includes(managed)?`<details open><summary>Europacup</summary>${v62EuropeDetailsHTML(career,europe)}</details>`:''}</div></section>`;
 const otherCountries=v61Countries.filter(([country])=>country!==ownCountry);
 const shownSeason=Number.isInteger(v62CompetitionSeason)&&v62CompetitionSeason>=1&&v62CompetitionSeason<=career.world.season?v62CompetitionSeason:career.world.season;
 const shown=career.world.competitions.filter(item=>item.season===shownSeason),shownLeague=shown.find(item=>item.type==='league'&&item.country===ownCountry),shownCup=shown.find(item=>item.type==='cup'&&item.country===ownCountry),shownEurope=shown.find(item=>item.type==='europe');
 const selectedCountry=otherCountries.some(([country])=>country===v62OtherCountry)?v62OtherCountry:otherCountries[0][0];
 const ownCompetitionPanel=`<div id="v62-own-competitions" data-v62-competition-area="own" role="tabpanel" aria-labelledby="v62-tab-own" ${v62CompetitionArea==='own'?'':'hidden'}><h3>Deine Wettbewerbe</h3><div class="v62-competitions"><details open><summary>${v62LeagueLabel(ownCountry)}</summary>${v62TableHTML(career,shownLeague)}${shownLeague.fixtures.map(fixture=>v62ResultHTML(career,fixture)).join('')}</details><details class="v62-cup-details" open><summary>${v61FlagSVG(ownCountry)} ${escapeHTML(v61CountryNames[ownCountry])} · Nationaler Pokal</summary>${v62CupBracketHTML(career,shownCup)}</details><details open><summary>Europacup</summary>${v62EuropeDetailsHTML(career,shownEurope)}</details></div></div>`;
 const otherCompetitionPanel=`<div id="v62-other-competitions" class="v62-other-countries" data-v62-competition-area="other" role="tabpanel" aria-labelledby="v62-tab-other" ${v62CompetitionArea==='other'?'':'hidden'}><h3>Andere Länder</h3><label>Land auswählen <select data-v62-country-choice>${otherCountries.map(([country,name])=>`<option value="${country}" ${country===selectedCountry?'selected':''}>${escapeHTML(name)}</option>`).join('')}</select></label>${otherCountries.map(([country,name])=>{const league=shown.find(item=>item.type==='league'&&item.country===country),cup=shown.find(item=>item.type==='cup'&&item.country===country);return`<div class="v62-country-panel" data-v62-country-panel="${country}" ${country===selectedCountry?'':'hidden'}><details open><summary>${v62LeagueLabel(country)}</summary>${v62TableHTML(career,league)}${league.fixtures.map(fixture=>v62ResultHTML(career,fixture)).join('')}</details><details class="v62-cup-details" open><summary>${v61FlagSVG(country)} ${escapeHTML(name)} · Nationaler Pokal</summary>${v62CupBracketHTML(career,cup)}</details></div>`}).join('')}</div>`;
 const competition=`<section class="v62-season"><div class="v62-competition-heading"><h2 class="v46-view-heading">Wettbewerbe · Saison ${shownSeason}</h2><label>Saison auswählen <select data-v62-season-choice>${Array.from({length:career.world.season},(_,index)=>career.world.season-index).map(season=>`<option value="${season}" ${season===shownSeason?'selected':''}>Saison ${season}${season===career.world.season?' · aktuell':''}</option>`).join('')}</select></label></div><div class="v62-competition-tabs" role="tablist" aria-label="Wettbewerbe anzeigen"><button type="button" id="v62-tab-own" role="tab" data-v62-area="own" aria-controls="v62-own-competitions" aria-selected="${v62CompetitionArea==='own'}">Deine Wettbewerbe</button><button type="button" id="v62-tab-other" role="tab" data-v62-area="other" aria-controls="v62-other-competitions" aria-selected="${v62CompetitionArea==='other'}">Andere Länder</button></div>${ownCompetitionPanel}${otherCompetitionPanel}${v62AwardOverviewHTML(career,shownSeason)}</section>`;
 const stats=competitions.filter(item=>item.type==='europe'||item.country===ownCountry).map(item=>{const games=item.fixtures.filter(fixture=>fixture.result&&(fixture.homeId===managed||fixture.awayId===managed));if(!games.length&&item.type!=='cup')return null;const wins=games.filter(fixture=>fixture.result.homeGoals!==fixture.result.awayGoals&&(fixture.homeId===managed?fixture.result.homeGoals>fixture.result.awayGoals:fixture.result.awayGoals>fixture.result.homeGoals)).length,draws=games.filter(fixture=>fixture.result.homeGoals===fixture.result.awayGoals).length,losses=games.length-wins-draws,goals=games.reduce((sum,fixture)=>sum+(fixture.homeId===managed?fixture.result.homeGoals:fixture.result.awayGoals),0),conceded=games.reduce((sum,fixture)=>sum+(fixture.homeId===managed?fixture.result.awayGoals:fixture.result.homeGoals),0),label=item.type==='league'?'Liga':item.type==='cup'?'Nationaler Pokal':'Europacup',rank=item.type==='cup'?null:v62Table(item,item.type==='europe'?item.entrants:[...new Set(item.fixtures.flatMap(fixture=>[fixture.homeId,fixture.awayId]))]).findIndex(row=>row.clubId===managed)+1,round=item.type==='cup'?(['QF','SF','F'].find(code=>item.fixtures.filter(fixture=>fixture.round===code).length<[4,2,1][['QF','SF','F'].indexOf(code)]||item.fixtures.some(fixture=>fixture.round===code&&!fixture.result))||'F'):null,roundLabel={QF:'Viertelfinale',SF:'Halbfinale',F:'Finale'}[round];return`<div class="v62-stat-card"><strong>${label}</strong><span>${item.type==='cup'?`Runde: ${roundLabel}`:`Platz ${rank}`}</span><span>${games.length} ${games.length===1?'Spiel':'Spiele'}</span><span>${wins} S · ${draws} U · ${losses} N</span><span>Tore ${goals}:${conceded}</span></div>`}).filter(Boolean).join('');
 const statistics=`<section class="v62-season"><h2 class="v46-view-heading">Statistik · Saison ${career.world.season}</h2><div class="v62-stat-grid">${stats||'<p>Noch keine Partie gespielt.</p>'}</div></section>${v62StatBoardHTML(career,ownLeague,`${v62LeagueLabel(ownCountry)} · Ligastatistik`)}${v62StatBoardHTML(career,competitions.find(item=>item.type==='cup'&&item.country===ownCountry),'Nationaler Pokal · Pokalstatistik')}${v62StatBoardHTML(career,europe,'Europacup · Statistik')}`;
 return{overview,competition,calendar:v62CalendarHTML(career),statistics};
}
