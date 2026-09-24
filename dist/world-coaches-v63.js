'use strict';

// Trainer gehören der Welt, nicht dem gerade betreuten Verein der spielenden Person.
const v63Formations=['1–1–3','1–2–2','1–3–1','2–1–2','2–2–1','3–1–1'];
const v63Pressing=['Abwartend','Ausgewogen','Früh'];
const v63Passing=['Kurz','Variabel','Direkt'];
const v63Defense=['Tief','Neutral','Hoch'];
const v63Rotation=['Konstant','Situativ','Rotierend'];
const v63Youth=['Behutsam','Offen','Fördernd'];

function v63Coach(career,id,nation,season,interim=false){
 const random=v61Random(`${career.world.seed}:coach:${id}`),names=v61Names[nation],pick=items=>items[Math.floor(random()*items.length)];
 return{id,name:`${pick(names[0])} ${pick(names[1])}`,nation,age:34+Math.floor(random()*25),style:{formation:pick(v63Formations),pressing:pick(v63Pressing),passing:pick(v63Passing),defense:pick(v63Defense),rotation:pick(v63Rotation),youth:pick(v63Youth),risk:1+Math.floor(random()*5)},judgment:{adaptation:1+Math.floor(random()*5),planning:1+Math.floor(random()*5),development:1+Math.floor(random()*5)},reputation:1+Math.floor(random()*5),currentClubId:null,unemployedSinceSeason:interim?null:season,retiredSeason:null,interim,history:[],assessments:[]};
}
function v63StartJob(career,coach,club,day,reason){
 if(coach.currentClubId||club.coachId)throw Error('Traineramt ist bereits besetzt.');
 coach.currentClubId=club.id;coach.unemployedSinceSeason=null;coach.history.push({clubId:club.id,fromSeason:career.world.season,fromDay:day,toSeason:null,toDay:null,endReason:null});club.coachId=coach.id;
 club.history.push({type:'coach-arrival',season:career.world.season,day,coachId:coach.id,reason});
}
function v63Init(career){
 if(career.world.coaches.length)throw Error('Trainerwelt ist bereits angelegt.');
 for(const club of career.world.clubs){
  if(club.id===career.manager.managedClubId)continue;
  const coach=v63Coach(career,`coach:${club.id}:S1`,club.countryId,1);
  career.world.coaches.push(coach);v63StartJob(career,coach,club,-1,'Karrierestart');
 }
 for(let index=0;index<10;index++)career.world.coaches.push(v63Coach(career,`candidate:S1:${index+1}`,v61Countries[index%6][0],1));
}
function v63Validate(career){
 const world=career.world,coaches=world.coaches,clubs=world.clubs,managed=career.manager.managedClubId;
 if(!Array.isArray(coaches)||new Set(coaches.map(coach=>coach.id)).size!==coaches.length||clubs.find(club=>club.id===managed)?.coachId!==null)return false;
 const employed=coaches.filter(coach=>coach.currentClubId),clubIds=employed.map(coach=>coach.currentClubId);
 if(new Set(clubIds).size!==clubIds.length||employed.length!==clubs.length-1)return false;
 return clubs.filter(club=>club.id!==managed).every(club=>coaches.find(coach=>coach.id===club.coachId)?.currentClubId===club.id)&&coaches.every(coach=>coach.currentClubId||coach.retiredSeason||Number.isInteger(coach.unemployedSinceSeason));
}
function v63Expected(career,clubId,opponentId,home){
 const club=career.world.clubs.find(item=>item.id===clubId),opponent=career.world.clubs.find(item=>item.id===opponentId);
 return Math.max(.55,Math.min(2.35,1.25+(v62Quality(club)-v62Quality(opponent))*.2+(home?.18:-.18)));
}
function v63BeforeFixture(career,fixture){
 fixture.coachExpectations={};
 for(const [clubId,opponentId,home]of [[fixture.homeId,fixture.awayId,true],[fixture.awayId,fixture.homeId,false]]){
  const club=career.world.clubs.find(item=>item.id===clubId),coachId=club.coachId;
  if(coachId)fixture.coachExpectations[clubId]={coachId,opponentId,competitionId:fixture.competitionId,home,squadQuality:v62Quality(club),expected:v63Expected(career,clubId,opponentId,home)};
 }
 if(typeof v67BeforeFixture==='function')v67BeforeFixture(career,fixture);
}
function v63Actual(fixture,clubId){
 const own=clubId===fixture.homeId?fixture.result.homeGoals:fixture.result.awayGoals,other=clubId===fixture.homeId?fixture.result.awayGoals:fixture.result.homeGoals;
 if(own!==other)return own>other?3:0;
 return fixture.result.winnerId?fixture.result.winnerId===clubId?2:0:1;
}
function v63Fit(coach,club){
 return 5-Math.abs(coach.style.risk-club.policy.risk)+((coach.style.youth==='Fördernd'&&club.policy.youth>=4)?1:0)+((coach.style.rotation==='Rotierend'&&club.roster.length>=13)?1:0);
}
function v63FindCoach(career,club){
 const candidates=career.world.coaches.filter(coach=>!coach.currentClubId&&!coach.retiredSeason&&!coach.interim&&!(coach.lastDismissedClubId===club.id&&coach.lastDismissedSeason===career.world.season))
  .map(coach=>({coach,fit:v63Fit(coach,club)})).filter(item=>item.fit>=3&&item.coach.reputation<=club.policy.tradition+1)
  .sort((a,b)=>b.fit-a.fit||b.coach.judgment.planning-a.coach.judgment.planning||a.coach.id.localeCompare(b.coach.id));
 return candidates[0]?.coach||null;
}
function v63News(career,club,day,text){
 const id=`coach-news:S${career.world.season}:${day}:${club.id}:${club.history.length}`;
 career.world.eventLog.visibleNews.push({id,season:career.world.season,day,clubId:club.id,text});
}
function v63FillJob(career,club,day){
 if(club.coachId){const current=career.world.coaches.find(coach=>coach.id===club.coachId);if(!current?.interim)return current;}
 const candidate=day===v62Days.seasonEnd&&club.leagueId?null:v63FindCoach(career,club);
 if(candidate){
  if(club.coachId){
   const interim=career.world.coaches.find(coach=>coach.id===club.coachId),job=interim.history.at(-1);
   job.toSeason=career.world.season;job.toDay=day;job.endReason='Reguläre Besetzung';interim.currentClubId=null;interim.retiredSeason=career.world.season;club.coachId=null;
  }
  v63StartJob(career,candidate,club,day,'Verpflichtung');v63News(career,club,day,`${candidate.name} übernimmt ${club.name}.`);return candidate;
 }
 if(club.coachId)return career.world.coaches.find(coach=>coach.id===club.coachId);
 const interim=v63Coach(career,`interim:${club.id}:S${career.world.season}:D${day}`,club.countryId,career.world.season,true);
 career.world.coaches.push(interim);v63StartJob(career,interim,club,day,'Interim');v63News(career,club,day,`${interim.name} übernimmt ${club.name} vorläufig.`);return interim;
}
function v63Dismiss(career,club,coach,day,reason){
 if(club.coachId!==coach.id)return;
 const job=coach.history.at(-1);job.toSeason=career.world.season;job.toDay=day;job.endReason=reason;
 coach.currentClubId=null;coach.unemployedSinceSeason=career.world.season;coach.lastDismissedClubId=club.id;coach.lastDismissedSeason=career.world.season;club.coachId=null;
 club.history.push({type:'coach-dismissal',season:career.world.season,day,coachId:coach.id,reason});
 v63News(career,club,day,`${club.name} trennt sich nach längerer Unterleistung von ${coach.name}.`);
 v63FillJob(career,club,day);
}
function v63Evaluate(career,club,coach,day,seasonEnd=false){
 if(coach.interim)return;
 const assessments=coach.assessments.filter(item=>item.clubId===club.id&&(!club.leagueId||item.season===career.world.season)),recent=assessments.slice(-5);
 if(assessments.length<3)return;
 const deficit=items=>items.reduce((sum,item)=>sum+item.expected-item.actual,0),patience=club.policy.patience;
 const shortLimit=3.7+patience*.4,longLimit=5.5+patience*.5;
 if(deficit(recent)>shortLimit&&deficit(assessments)>longLimit&&(assessments.length>=4||seasonEnd))v63Dismiss(career,club,coach,day,'Längere Unterleistung gegenüber der Kadererwartung');
}
function v63AfterFixture(career,fixture){
 for(const clubId of [fixture.homeId,fixture.awayId]){
  const snapshot=fixture.coachExpectations?.[clubId];if(!snapshot)continue;
  const club=career.world.clubs.find(item=>item.id===clubId),coach=career.world.coaches.find(item=>item.id===snapshot.coachId);
  if(!coach||coach.assessments.some(item=>item.fixtureId===fixture.id))continue;
  coach.assessments.push({fixtureId:fixture.id,clubId,competitionId:fixture.competitionId,season:career.world.season,day:fixture.day,expected:snapshot.expected,actual:v63Actual(fixture,clubId)});
  if(club.coachId===coach.id)v63Evaluate(career,club,coach,fixture.day);
  if(career.world.coaches.find(item=>item.id===club.coachId)?.interim)v63FillJob(career,club,fixture.day);
 }
 if(typeof v67AfterFixture==='function')v67AfterFixture(career,fixture);
}
function v63SeasonEnd(career){
 for(const club of career.world.clubs){
  if(!club.coachId)continue;
  const coach=career.world.coaches.find(item=>item.id===club.coachId);v63Evaluate(career,club,coach,v62Days.seasonEnd,true);
  if(club.coachId!==coach.id||coach.interim||coach.age<60)continue;
  const chance=Math.min(.5,.1+(coach.age-60)*.06),random=v61Random(`${career.world.seed}:S${career.world.season}:${coach.id}:retirement`);
  if(random()>=chance)continue;
  const job=coach.history.at(-1);job.toSeason=career.world.season;job.toDay=v62Days.seasonEnd;job.endReason='Karriereende';
  coach.currentClubId=null;coach.retiredSeason=career.world.season;coach.unemployedSinceSeason=null;club.coachId=null;
  club.history.push({type:'coach-retirement',season:career.world.season,day:v62Days.seasonEnd,coachId:coach.id});
  v63News(career,club,v62Days.seasonEnd,`${coach.name} beendet nach der Saison seine Trainerlaufbahn bei ${club.name}.`);
  v63FillJob(career,club,v62Days.seasonEnd);
 }
}
function v63NextSeason(career){
 const season=career.world.season;
 for(const coach of career.world.coaches){
  if(!coach.retiredSeason)coach.age++;
  if(!coach.currentClubId&&!coach.retiredSeason&&!coach.interim&&season-coach.unemployedSinceSeason>=3)coach.retiredSeason=season;
 }
 for(let index=0;index<10;index++)career.world.coaches.push(v63Coach(career,`candidate:S${season}:${index+1}`,v61Countries[(season+index-1)%6][0],season));
 for(const club of career.world.clubs)if(club.coachId&&career.world.coaches.find(coach=>coach.id===club.coachId)?.interim)v63FillJob(career,club,0);
}
function v63ArchiveSeason(career){
 const season=career.world.season;
 for(const coach of career.world.coaches){
  const old=coach.assessments.filter(item=>item.season===season&&career.world.clubs.find(club=>club.id===item.clubId)?.leagueId);
  if(!old.length)continue;
  coach.seasonResults=coach.seasonResults||[];
  for(const clubId of new Set(old.map(item=>item.clubId))){
   const games=old.filter(item=>item.clubId===clubId);
   coach.seasonResults.push({season,clubId,games:games.length,expected:Math.round(games.reduce((sum,item)=>sum+item.expected,0)*100)/100,actual:games.reduce((sum,item)=>sum+item.actual,0)});
  }
  coach.assessments=coach.assessments.filter(item=>!old.includes(item));
 }
}
function v63Grade(value){return value>=5?'Sehr gut':value>=4?'Gut':value>=3?'Solide':value>=2?'Entwicklungsfähig':'Unerfahren'}
function v63NewsHTML(career){
 const club=career.world.clubs.find(item=>item.id===career.manager.managedClubId),europe=v62Current(career).find(item=>item.type==='europe'),opponents=new Set(europe.fixtures.filter(item=>item.homeId===club.id||item.awayId===club.id).flatMap(item=>[item.homeId,item.awayId]));
 const news=career.world.eventLog.visibleNews.filter(item=>item.season===career.world.season&&(career.world.clubs.find(other=>other.id===item.clubId)?.countryId===club.countryId||opponents.has(item.clubId))).slice(-5).reverse();
 return news.length?`<section class="v62-season"><h2>Aus der Trainerwelt</h2><ul class="v63-news">${news.map(item=>`<li>${v62Date(item.day)} · ${escapeHTML(item.text)}</li>`).join('')}</ul></section>`:'';
}
function v63LeagueCoachesHTML(career){
 const managed=career.world.clubs.find(item=>item.id===career.manager.managedClubId),clubs=career.world.clubs.filter(club=>club.countryId===managed.countryId&&club.leagueId&&club.id!==managed.id);
 return`<section class="v62-season"><h3>Trainer in deiner Liga</h3><div class="v63-coach-list">${clubs.map(club=>{const coach=career.world.coaches.find(item=>item.id===club.coachId);return`<details><summary>${v61CrestSVG(club)}<span><strong>${escapeHTML(club.name)}</strong><small>${escapeHTML(coach.name)}${coach.interim?' · Interim':''}</small></span></summary><div class="v63-coach-detail"><p>${v61FlagSVG(coach.nation)} ${escapeHTML(coach.name)} · ${coach.age} Jahre</p><p>Spielidee: ${escapeHTML(coach.style.formation)} · Pressing: ${escapeHTML(coach.style.pressing)} · Pässe: ${escapeHTML(coach.style.passing)} · Abwehr: ${escapeHTML(coach.style.defense)}</p><p>Rotation: ${escapeHTML(coach.style.rotation)} · Nachwuchs: ${escapeHTML(coach.style.youth)}</p><p>Gegneranpassung: ${v63Grade(coach.judgment.adaptation)} · Kaderplanung: ${v63Grade(coach.judgment.planning)} · Nachwuchsförderung: ${v63Grade(coach.judgment.development)}</p>${club.history.filter(item=>item.type==='coach-dismissal').slice(-2).map(item=>`<p>Trainerwechsel in Saison ${item.season}: ${escapeHTML(item.reason)}</p>`).join('')}</div></details>`}).join('')}</div></section>`;
}
