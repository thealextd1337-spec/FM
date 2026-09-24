const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

let nextId=0;
const context=vm.createContext({crypto:{randomUUID:()=>`test-${++nextId}`}});
for(const file of ['world-catalog-v61.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
const foundation=fs.readFileSync('dist/world-foundation-v61.js','utf8');
vm.runInContext(foundation.slice(0,foundation.indexOf('const v61Panel=')),context);
const create=vm.runInContext('v61CreateCareer',context),advance=vm.runInContext('v62AdvanceDay',context),nextSeason=vm.runInContext('v62NextSeason',context),validate=vm.runInContext('v63Validate',context);

const career=create('GER-2','trainer-seed');
assert.strictEqual(career.world.coaches.length,57);
assert.strictEqual(career.world.clubs.find(club=>club.id==='GER-2').coachId,null);
assert.strictEqual(career.world.coaches.filter(coach=>coach.currentClubId).length,47);
assert.strictEqual(career.world.coaches.filter(coach=>!coach.currentClubId).length,10);
assert(validate(career));
const sameSeed=create('GER-2','trainer-seed');
assert.strictEqual(JSON.stringify(career.world.coaches),JSON.stringify(sameSeed.world.coaches));

advance(career);
const played=vm.runInContext('v62Fixtures',context)(career).filter(fixture=>fixture.result);
assert(played.length>0);
for(const fixture of played)for(const clubId of [fixture.homeId,fixture.awayId]){
 const entry=fixture.coachExpectations[clubId],club=career.world.clubs.find(item=>item.id===clubId);
 if(clubId==='GER-2')assert.strictEqual(entry,undefined);
 else assert(entry&&career.world.coaches.some(coach=>coach.id===entry.coachId&&coach.assessments.some(item=>item.fixtureId===fixture.id)));
}
const snapshot=JSON.stringify(career);
vm.runInContext('v63AfterFixture',context)(career,played[0]);
assert.strictEqual(JSON.stringify(career),snapshot,'wiederholtes Matchereignis bleibt einmalig');

const dismissal=create('GER-2','dismissal-seed'),club=dismissal.world.clubs.find(item=>item.id==='GER-3'),old=dismissal.world.coaches.find(item=>item.id===club.coachId);
old.assessments=Array.from({length:5},(_,index)=>({fixtureId:`forced-${index}`,clubId:club.id,season:1,day:index+1,expected:2.2,actual:0}));
vm.runInContext('v63Evaluate',context)(dismissal,club,old,30);
assert.notStrictEqual(club.coachId,old.id);
assert.strictEqual(old.currentClubId,null);
assert.strictEqual(old.history[0].endReason,'Längere Unterleistung gegenüber der Kadererwartung');
assert.strictEqual(old.lastDismissedClubId,club.id);
assert(validate(dismissal));
assert(dismissal.world.eventLog.visibleNews.some(item=>item.clubId===club.id));

const cupCareer=create('GER-2','cup-coach-seed'),cupClub=cupCareer.world.clubs.find(item=>item.id==='GER-C1'),cupCoach=cupCareer.world.coaches.find(item=>item.id===cupClub.coachId);
cupCoach.assessments=Array.from({length:5},(_,index)=>({fixtureId:`cup-${index}`,clubId:cupClub.id,season:index<2?1:index<4?2:3,day:95,expected:2.2,actual:0}));
cupCareer.world.season=3;
vm.runInContext('v63Evaluate',context)(cupCareer,cupClub,cupCoach,95);
assert.notStrictEqual(cupClub.coachId,cupCoach.id,'Pokalvereine werten Pflichtspiele über mehrere Saisons aus');
assert(validate(cupCareer));

const interimCareer=create('GER-2','interim-seed'),interimClub=interimCareer.world.clubs.find(item=>item.id==='GER-3');
for(const coach of interimCareer.world.coaches)if(!coach.currentClubId)coach.retiredSeason=1;
const fired=interimCareer.world.coaches.find(item=>item.id===interimClub.coachId);
vm.runInContext('v63Dismiss',context)(interimCareer,interimClub,fired,40,'Testunterleistung');
const interim=interimCareer.world.coaches.find(item=>item.id===interimClub.coachId);
assert(interim.interim);
assert(validate(interimCareer));
const newCandidate=vm.runInContext('v63Coach',context)(interimCareer,'available-coach','GER',1);
newCandidate.reputation=1;newCandidate.style.risk=interimClub.policy.risk;
interimCareer.world.coaches.push(newCandidate);
vm.runInContext('v63FillJob',context)(interimCareer,interimClub,41);
assert.strictEqual(interimClub.coachId,newCandidate.id);
assert.strictEqual(interim.retiredSeason,1);
assert.strictEqual(interim.history[0].endReason,'Reguläre Besetzung');
assert(validate(interimCareer));

while(!career.world.seasonFinished)advance(career);
nextSeason(career);
assert.strictEqual(career.world.season,2);
assert.strictEqual(career.world.coaches.filter(coach=>coach.id.startsWith('candidate:S2:')).length,10);
const seasonTwo=JSON.stringify(career.world.coaches);
assert(validate(career));
assert.strictEqual(JSON.stringify(career.world.coaches),seasonTwo);
career.world.season=4;
vm.runInContext('v63NextSeason',context)(career);
assert(career.world.coaches.filter(coach=>coach.id.startsWith('candidate:S1:')&&!coach.currentClubId).every(coach=>coach.retiredSeason===4));
assert.strictEqual(career.world.coaches.filter(coach=>coach.id.startsWith('candidate:S4:')).length,10);
assert(validate(career));

console.log('Trainerwelt: feste Starttrainer, Matcherwartungen, Entlassung, Interim, Neubesetzung und Kandidatenfristen geprüft.');
