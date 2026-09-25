'use strict';

// Nachwuchs und Managerlaufbahn der neuen Vereinswelt. Alle Zufallswerte hängen an stabilen IDs.
const v67SkillKeys=['tec','pas','fin','tak','pos','spd','sta','air','gk'];
function v67Smooth(club){const history=club.youthInvestmentHistory||[];return(history.at(-1)?.amount||0)*.45+(history.at(-2)?.amount||0)*.35+(history.at(-3)?.amount||0)*.2}
function v67Youth(career,club,season,slot,start=false){
 const random=v61Random(`${career.world.seed}:${club.id}:youth:S${season}:${slot}`),line=slot===0&&(start||season%3===club.policy.youth%3)?'gk':['def','mid','att','mid','def'][slot%5];
 const nation=random()<.84?club.countryId:v61Countries[Math.floor(random()*v61Countries.length)][0],names=v61Names[nation],name=`${names[0][Math.floor(random()*names[0].length)]} ${names[1][Math.floor(random()*names[1].length)]}`;
 const smooth=v67Smooth(club);
 const investmentBonus=Math.min(5,Math.min(2,smooth/100)+Math.log1p(Math.max(0,smooth-200)/250)*1.5);
 const talentRoll=Math.pow(random(),Math.max(.75,2.4-smooth/900));
 const talent=talentRoll<.7?-2.2+talentRoll/.7*1.2:talentRoll<.94?-1+(talentRoll-.7)/.24*2.2:1.2+(talentRoll-.94)/.06*2.8;
 const quality=(club.policy.startingSquad-3)*.65+investmentBonus*.3+talent*1.15,age=16+Math.floor(random()*4);
 const player={pid:`${career.world.seed}:${club.id}:Y${season}:${slot}`,n:0,name,nation,age,line,assignedLine:line,keeper:line==='gk',type:v61PositionNames[line],foot:random()<.2?'Links':'Rechts',form:0,fresh:100,history:[],seasons:[],honours:[],discoveredSeason:season,expiresAfterSeason:start?2:season+2,compensationRate:Math.round((.2+random()*.1)*100)/100,developmentMinutes:0,potential:{}};
 for(const[key,base]of Object.entries(v61SkillBases[line])){
  player[key]=Math.max(1,Math.min(20,Math.round(base-2.8+quality+(random()-.5)*3)));
  player.potential[key]=Math.min(20,player[key]+1+Math.floor(random()*(smooth>1000?6:smooth>250?5:4)));
 }
 return player;
}
function v67Init(career){
 for(const club of career.world.clubs){
  const random=v61Random(`${career.world.seed}:${club.id}:starting-youth`),count=2+Math.floor(random()*3);
  club.youthPool=Array.from({length:count},(_,slot)=>v67Youth(career,club,0,slot,true));
  club.youthBudget=0;club.youthInvestmentHistory=[];
 }
 career.manager.reputation=2.5;career.manager.assessments=[];career.manager.seasonResults=[];
 career.world.youthProcessedFixtures=[];career.world.transition=null;
}
function v67BeforeFixture(career,fixture){
 const managed=career.manager.managedClubId;
 if(fixture.homeId!==managed&&fixture.awayId!==managed)return;
 const home=fixture.homeId===managed,opponentId=home?fixture.awayId:fixture.homeId;
 fixture.managerExpectation={clubId:managed,expected:v63Expected(career,managed,opponentId,home)};
}
function v67Grow(player,fixture,minutes){
 if(!player.potential||player.age>=24||minutes<=0)return;
 const factor=fixture.competitionId.endsWith(':EUROPE')?1.5:fixture.competitionId.endsWith(':CUP')?(fixture.round==='F'?1:.75):1;
 player.developmentMinutes=(player.developmentMinutes||0)+minutes*factor;
 const threshold=player.age<=19?180:player.age<=21?270:450;
 while(player.developmentMinutes>=threshold){
  player.developmentMinutes-=threshold;
  for(let point=0;point<2;point++){
   const key=v67SkillKeys.filter(skill=>player[skill]<player.potential[skill]).sort((a,b)=>(player.potential[b]-player[b])-(player.potential[a]-player[a])||a.localeCompare(b))[0];
   if(!key)break;
   player[key]++;
  }
 }
}
function v67AfterFixture(career,fixture){
 const processed=career.world.youthProcessedFixtures;
 if(processed.includes(fixture.id))return;
 const snapshot=fixture.managerExpectation;
 if(snapshot&&!career.manager.assessments.some(item=>item.fixtureId===fixture.id))career.manager.assessments.push({fixtureId:fixture.id,season:career.world.season,clubId:snapshot.clubId,expected:snapshot.expected,actual:v63Actual(fixture,snapshot.clubId)});
 for(const item of fixture.matchRecord?.players||[]){const club=v66Owner(career,item.pid),player=club?.roster.find(candidate=>candidate.pid===item.pid);if(player)v67Grow(player,fixture,item.minutes)}
 processed.push(fixture.id);
}
function v67Offers(career){
 const manager=career.manager,old=v66Club(career,manager.managedClubId),recent=manager.seasonResults.slice(-3),margin=recent.reduce((sum,item)=>sum+item.actual-item.expected,0)/Math.max(1,recent.reduce((sum,item)=>sum+item.games,0));
 return career.world.clubs.filter(club=>club.leagueId&&club.id!==old.id&&career.world.coaches.find(coach=>coach.id===club.coachId)?.interim)
  .map(club=>({id:club.id,fit:manager.reputation-club.policy.tradition*.35+margin+(club.countryId===old.countryId?.2:0)}))
  .filter(item=>item.fit>=1.35).sort((a,b)=>b.fit-a.fit||a.id.localeCompare(b.id)).slice(0,3).map(item=>item.id);
}
function v67SeasonEnd(career){
 const season=career.world.season;
 if(career.world.transition?.fromSeason===season)return;
 const retirees=career.world.market.freePlayers.filter(player=>player.youthReleasedSeason&&season-player.youthReleasedSeason>=1);
 if(retirees.length){
  career.world.retirements??=[];
  for(const player of retirees)career.world.retirements.push({season,pid:player.pid,name:player.name,clubId:player.youthReleasedClubId,reason:'Nachwuchsspieler ohne Verein'});
  const ids=new Set(retirees.map(player=>player.pid));career.world.market.freePlayers=career.world.market.freePlayers.filter(player=>!ids.has(player.pid));
 }
 for(const club of career.world.clubs){
  const expired=club.youthPool.filter(player=>player.expiresAfterSeason<=season);
  if(expired.length){career.world.retirements??=[];for(const player of expired)career.world.retirements.push({season,pid:player.pid,name:player.name,clubId:club.id,reason:'Nachwuchspool abgelaufen'})}
  club.youthPool=club.youthPool.filter(player=>player.expiresAfterSeason>season);
 }
 const manager=career.manager,played=manager.assessments.filter(item=>item.season===season),expected=played.reduce((sum,item)=>sum+item.expected,0),actual=played.reduce((sum,item)=>sum+item.actual,0);
 manager.seasonResults.push({season,clubId:manager.managedClubId,games:played.length,expected:Math.round(expected*100)/100,actual});
 manager.assessments=manager.assessments.filter(item=>item.season!==season);
 if(played.length)manager.reputation=Math.max(1,Math.min(5,Math.round((manager.reputation+(actual-expected)/played.length*.32)*100)/100));
 const offers=v67Offers(career);
 career.world.transition={fromSeason:season,offers,choice:offers.length?null:'stay',budget:null,reviewStep:0};
}
function v67ChooseOffer(career,clubId=null){
 const transition=career.world.transition;
 if(!career.world.seasonFinished||!transition||transition.choice!==null)throw Error('Es liegt keine offene Vereinsentscheidung vor.');
 if(clubId&&!transition.offers.includes(clubId))throw Error('Dieses Stellenangebot ist nicht verfügbar.');
 const old=v66Club(career,career.manager.managedClubId);
 if(clubId){
  const next=v66Club(career,clubId),interim=career.world.coaches.find(coach=>coach.id===next.coachId);
  if(!next?.leagueId||!interim?.interim)throw Error('Die Trainerstelle ist nicht mehr frei.');
  const job=interim.history.at(-1);job.toSeason=career.world.season;job.toDay=v62Days.seasonEnd;job.endReason='Übernahme durch Manager';interim.currentClubId=null;interim.retiredSeason=career.world.season;next.coachId=null;
  career.manager.stationHistory.at(-1).toSeason=career.world.season;
  career.manager.stationHistory.push({clubId,fromSeason:career.world.season+1});
  career.manager.managedClubId=clubId;
  old.history.push({type:'manager-departure',season:career.world.season,day:v62Days.seasonEnd});
  next.history.push({type:'manager-arrival',season:career.world.season+1,day:0});
  v63FillJob(career,old,v62Days.seasonEnd+1);
 }
 for(const offered of transition.offers){if(offered===clubId)continue;const club=v66Club(career,offered);if(club&&career.world.coaches.find(coach=>coach.id===club.coachId)?.interim)v63FillJob(career,club,v62Days.seasonEnd+1)}
 transition.choice=clubId||'stay';
 career.updated=new Date().toISOString();
 return transition.choice;
}
function v67BudgetLimit(club){return Math.max(0,Math.floor(club.balance/50)*50)}
function v67SetBudget(career,amount){
 const transition=career.world.transition,club=v66Club(career,career.manager.managedClubId);amount=Number(amount);
 if(!career.world.seasonFinished||!transition||transition.choice===null||transition.budget!==null||!Number.isInteger(amount)||amount<0||amount>v67BudgetLimit(club))throw Error('Das Jugendbudget ist nicht verfügbar oder nicht gedeckt.');
 transition.budget=amount;career.updated=new Date().toISOString();return amount;
}
function v67BeforeNextSeason(career){
 const transition=career.world.transition;
 if(!transition||transition.fromSeason!==career.world.season||transition.choice===null||transition.budget===null)throw Error('Zuerst Stellenangebote und Jugendbudget entscheiden.');
 for(const player of [...career.world.clubs.flatMap(club=>[...club.roster,...club.youthPool]),...career.world.market.freePlayers])player.age++;
}
function v67AiBudget(career,club){
 const free=Math.max(0,club.balance-v66SalaryDue(career,club.id)-450),profile=club.policy.youth;
 const step=club.leagueId?50:25,cap=club.leagueId?1500:profile*40;
 return Math.min(cap,Math.max(0,Math.floor(Math.min(free*.22,profile*170,cap)/step)*step));
}
function v67Fee(player){return Math.max(20,Math.round(v66Value(player)*player.compensationRate/10)*10)}
function v67ReleaseYouth(career,clubId,pid){
 const club=v66Club(career,clubId),player=club?.youthPool.find(item=>item.pid===pid);
 if(!player||clubId!==career.manager.managedClubId||career.world.seasonFinished)throw Error('Dieser Nachwuchsspieler kann nicht entlassen werden.');
 if(career.world.market.freePlayers.some(item=>item.pid===pid))throw Error('Dieser Spieler ist bereits vereinslos.');
 club.youthPool=club.youthPool.filter(item=>item.pid!==pid);
 player.freeSinceSeason=career.world.season;player.youthReleasedSeason=career.world.season;player.youthReleasedClubId=clubId;
 career.world.market.freePlayers.push(player);
 career.world.transfers.push({id:`S${career.world.season}:${pid}:youth-release`,season:career.world.season,day:career.world.calendarCursor,pid,playerName:player.name,sellerId:clubId,buyerId:null,price:0,reason:'Jugendfreigabe'});
 return player;
}
function v67Promote(career,clubId,pid){
 const club=v66Club(career,clubId),player=club?.youthPool.find(item=>item.pid===pid);
 if(!player||player.expiresAfterSeason<career.world.season)throw Error('Dieser Nachwuchsspieler steht nicht mehr zur Verfügung.');
 if(club.roster.length>=14)throw Error('Der Profikader hat bereits 14 Spieler.');
 const fee=v67Fee(player),annual=v66Salary(player);
 if(club.balance<fee)throw Error('Der Verein kann die Ausbildungsentschädigung nicht bezahlen.');
 if(clubId!==career.manager.managedClubId&&club.balance-fee+v66LeaguePrizes[5]-v66SalaryDue(career,clubId)-annual<0)throw Error('Der KI-Verein kann den Vertrag nicht finanzieren.');
 if(v66Owner(career,pid)||career.world.contracts.some(item=>item.pid===pid))throw Error('Der Spieler gehört bereits einem Profikader an.');
 v66Book(career,clubId,`S${career.world.season}:${pid}:youth-promotion`,-fee,`Ausbildungsentschädigung: ${player.name}`);
 club.youthPool=club.youthPool.filter(item=>item.pid!==pid);
 player.n=Math.max(0,...club.roster.map(item=>item.n))+1;club.roster.push(player);
 career.world.contracts.push({id:`S${career.world.season}:${pid}:youth-contract`,pid,clubId,annual,fromSeason:career.world.season,endSeason:career.world.season+1,startsAt:Math.max(0,career.world.calendarCursor),promise:0,promiseHits:0,promisePenalty:0,lastPromiseCheck:0,renewalOffers:0});
 return player;
}
function v67StartSeason(career){
 const season=career.world.season,transition=career.world.transition;
 career.world.youthProcessedFixtures=[];
 for(const club of career.world.clubs){
  const amount=club.id===career.manager.managedClubId?transition.budget:v67AiBudget(career,club);
  club.youthBudget=amount;club.youthInvestmentHistory.push({season,amount});
  if(amount)v66Book(career,club.id,`S${season}:${club.id}:youth-budget`,-amount,'Jahresbudget Nachwuchs');
  const smooth=v67Smooth(club),random=v61Random(`${career.world.seed}:${club.id}:youth-count:S${season}`),count=Math.min(6,1+Math.floor(random()*2)+Math.floor(smooth/110));
  for(let slot=0;slot<count;slot++)club.youthPool.push(v67Youth(career,club,season,slot));
 }
 for(const club of career.world.clubs){
  if(club.id===career.manager.managedClubId||club.roster.length>=12)continue;
  const candidates=[...club.youthPool].sort((a,b)=>v66Skill(b)-v66Skill(a));
  for(const player of candidates){if(club.roster.length>=12)break;try{v67Promote(career,club.id,player.pid)}catch{break}}
 }
 career.world.transition=null;
}
function v67Validate(career){
 const manager=career.manager,transition=career.world.transition,clubs=career.world.clubs;
 if(!Number.isFinite(manager.reputation)||!Array.isArray(manager.assessments)||!Array.isArray(manager.seasonResults)||!Array.isArray(career.world.youthProcessedFixtures))return false;
 if(clubs.some(club=>!Array.isArray(club.youthPool)||!Array.isArray(club.youthInvestmentHistory)||!Number.isInteger(club.youthBudget)))return false;
 const ids=clubs.flatMap(club=>club.youthPool.map(player=>player.pid)),roster=new Set(clubs.flatMap(club=>club.roster.map(player=>player.pid))),free=new Set(career.world.market.freePlayers.map(player=>player.pid));
 if(new Set(ids).size!==ids.length||ids.some(id=>roster.has(id)||free.has(id)))return false;
 if(transition&&(transition.fromSeason!==career.world.season||!career.world.seasonFinished&&career.world.calendarCursor!==v62Days.seasonEnd||!Array.isArray(transition.offers)))return false;
 return true;
}
