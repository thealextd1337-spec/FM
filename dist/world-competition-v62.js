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
 else{const random=v61Random(`${career.world.seed}:${fixture.id}:penalties`),home=3+Math.floor(random()*3),away=3+Math.floor(random()*3);result.penalties=home===away?(random()<.5?[home+1,away]:[home,away+1]):[home,away];result.winnerId=result.penalties[0]>result.penalties[1]?fixture.homeId:fixture.awayId}
}
function v62ResolveLeague(career,fixture){fixture.result=fixture.result||v62Score(career,fixture)}
function v62ResolveSecondLeg(career,fixture,competition){
 fixture.result=fixture.result||v62Score(career,fixture);
 const first=competition.fixtures.find(item=>item.pair===fixture.pair&&item.round===fixture.round&&item.leg===1);
 const homeTotal=fixture.result.homeGoals+first.result.awayGoals,awayTotal=fixture.result.awayGoals+first.result.homeGoals;
 fixture.result.aggregate=[homeTotal,awayTotal];
 if(homeTotal===awayTotal){const random=v61Random(`${career.world.seed}:${fixture.id}:penalties`),home=3+Math.floor(random()*3),away=3+Math.floor(random()*3);fixture.result.penalties=home===away?(random()<.5?[home+1,away]:[home,away+1]):[home,away]}
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
 if(day===v62Days.seasonEnd){if(typeof v66SeasonEnd==='function')v66SeasonEnd(career);v63SeasonEnd(career);if(typeof v67SeasonEnd==='function')v67SeasonEnd(career);world.seasonFinished=true}
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
 return`<section class="v49-match-preview v62-next-opponent"><p>Nächster Gegner · ${competition.type==='league'?v62LeagueLabel(competition.country):competition.type==='cup'?'Nationaler Pokal':'Europacup'} · ${v62Date(fixture.day)}</p><div class="v49-fixture">${side(fixture.homeId,'Heim')}<span>gegen</span>${side(fixture.awayId,'Auswärts')}</div>${duels.length?`<div class="v62-duels"><h4>Letzte Duelle</h4>${duels.map(({fixture:game,season})=>`<div><small>Saison ${season} · ${v62Date(game.day)}</small><span>${v62Name(career,game.homeId)} <b>${game.result.homeGoals}:${game.result.awayGoals}</b> ${v62Name(career,game.awayId)}</span></div>`).join('')}</div>`:''}</section>`;
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
function v62CareerViewsHTML(career){
 const competitions=v62Current(career),fixtures=v62Fixtures(career),managed=career.manager.managedClubId,ownClub=career.world.clubs.find(club=>club.id===managed),ownCountry=ownClub.countryId;
 const next=fixtures.filter(fixture=>!fixture.result&&(fixture.homeId===managed||fixture.awayId===managed)).sort((a,b)=>a.day-b.day)[0];
 const ownRecent=v62RecentGames(career,managed).slice(-5).reverse();
 const ownLeague=competitions.find(item=>item.type==='league'&&item.country===ownCountry),ownCup=competitions.find(item=>item.type==='cup'&&item.country===ownCountry);
 const europe=competitions.find(item=>item.type==='europe');
 const ownFixtures=item=>item.fixtures.filter(fixture=>fixture.homeId===managed||fixture.awayId===managed);
 const ownCompetitionHTML=(item,label)=>`<details><summary>${label}</summary>${ownFixtures(item).map(fixture=>v62ResultHTML(career,fixture)).join('')||'<p class="v62-explainer">Noch keine Partie angesetzt.</p>'}</details>`;
 const nextText=next?`Nächstes Spiel: ${v62Date(next.day)} · ${v62Name(career,next.homeId)} gegen ${v62Name(career,next.awayId)}`:career.world.seasonFinished?'Alle Wettbewerbe abgeschlossen.':'Für deinen Verein ist kein weiteres Spiel angesetzt.';
 const overview=`<section class="v62-season"><div class="v62-season-head"><div><p class="eyebrow">Saisonüberblick</p><h2>Saison ${career.world.season}</h2><p>${nextText}</p></div></div>${v62NextOpponentHTML(career,next)}<h3>Deine letzten fünf Spiele</h3>${ownRecent.length?`<div class="v62-recent v62-own-recent">${ownRecent.map(({fixture})=>v62ResultHTML(career,fixture)).join('')}</div>`:'<p class="v62-explainer">Noch kein Spiel absolviert.</p>'}<h3>Deine Wettbewerbe</h3><div class="v62-competitions v62-own-competitions"><details open><summary>${v62LeagueLabel(ownCountry)}</summary>${v62TableHTML(career,ownLeague)}</details>${ownCompetitionHTML(ownCup,`${v61FlagSVG(ownCountry)} ${escapeHTML(v61CountryNames[ownCountry])} · Nationaler Pokal`)}${europe.entrants.includes(managed)?ownCompetitionHTML(europe,'Europacup'):''}</div></section>`;
 const otherCountries=v61Countries.filter(([country])=>country!==ownCountry);
 const competition=`<section class="v62-season"><h2 class="v46-view-heading">Wettbewerbe · Saison ${career.world.season}</h2><div class="v62-competitions"><details open><summary>${v62LeagueLabel(ownCountry)}</summary>${v62TableHTML(career,ownLeague)}${ownLeague.fixtures.map(fixture=>v62ResultHTML(career,fixture)).join('')}</details><details><summary>${v61FlagSVG(ownCountry)} ${escapeHTML(v61CountryNames[ownCountry])} · Nationaler Pokal</summary>${ownCup.fixtures.map(fixture=>v62ResultHTML(career,fixture)).join('')}</details><details open><summary>Europacup</summary>${v62TableHTML(career,europe)}${europe.fixtures.map(fixture=>v62ResultHTML(career,fixture)).join('')}</details></div><details class="v62-other-countries"><summary>Andere Länder ansehen</summary><label>Land auswählen <select data-v62-country-choice>${otherCountries.map(([country,name])=>`<option value="${country}">${escapeHTML(name)}</option>`).join('')}</select></label>${otherCountries.map(([country,name],index)=>{const league=competitions.find(item=>item.type==='league'&&item.country===country),cup=competitions.find(item=>item.type==='cup'&&item.country===country);return`<div class="v62-country-panel" data-v62-country-panel="${country}" ${index?'hidden':''}><details open><summary>${v62LeagueLabel(country)}</summary>${v62TableHTML(career,league)}${league.fixtures.map(fixture=>v62ResultHTML(career,fixture)).join('')}</details><details><summary>${v61FlagSVG(country)} ${escapeHTML(name)} · Nationaler Pokal</summary>${cup.fixtures.map(fixture=>v62ResultHTML(career,fixture)).join('')}</details></div>`}).join('')}</details></section>`;
 const stats=competitions.map(item=>{const games=item.fixtures.filter(fixture=>fixture.result&&(fixture.homeId===managed||fixture.awayId===managed));if(!games.length)return null;const wins=games.filter(fixture=>fixture.result.homeGoals!==fixture.result.awayGoals&&(fixture.homeId===managed?fixture.result.homeGoals>fixture.result.awayGoals:fixture.result.awayGoals>fixture.result.homeGoals)).length,draws=games.filter(fixture=>fixture.result.homeGoals===fixture.result.awayGoals).length,goals=games.reduce((sum,fixture)=>sum+(fixture.homeId===managed?fixture.result.homeGoals:fixture.result.awayGoals),0),label=item.type==='league'?'Liga':item.type==='cup'?'Nationaler Pokal':'Europacup';return`<div class="v62-stat-card"><strong>${label}</strong><span>${games.length} ${games.length===1?'Spiel':'Spiele'}</span><span>${wins} Siege · ${draws} Remis</span><span>${goals} Tore</span></div>`}).filter(Boolean).join('');
 const statistics=`<section class="v62-season"><h2 class="v46-view-heading">Statistik · Saison ${career.world.season}</h2><div class="v62-stat-grid">${stats||'<p>Noch keine Partie gespielt.</p>'}</div></section>${v62StatBoardHTML(career,ownLeague,`${v62LeagueLabel(ownCountry)} · Ligastatistik`)}${v62StatBoardHTML(career,competitions.find(item=>item.type==='cup'&&item.country===ownCountry),'Nationaler Pokal · Pokalstatistik')}${v62StatBoardHTML(career,europe,'Europacup · Statistik')}`;
 return{overview,competition,statistics};
}
