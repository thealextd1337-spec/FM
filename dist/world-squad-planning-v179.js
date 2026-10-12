'use strict';
// Squad status is derived from the existing contractual appearance promise.
// No second morale ledger and no changes to saved promises on load.
function v179SquadRole(career,promise){
 const limit=v66PromiseLimit(career);
 return promise>=Math.ceil(limit*.6)?'starter':promise>=Math.ceil(limit*.3)?'rotation':'reserve';
}
function v179RoleLabel(role){return{starter:'Stammspieler',rotation:'Rotation',reserve:'Ersatz'}[role];}
function v179PromiseProgress(career,player){
 const contract=v66Contract(career,player.pid),club=contract&&v66Club(career,contract.clubId);
 if(!contract||contract.simulationOnly||!club?.leagueId)return null;
 const fixtures=v62Fixtures(career).filter(f=>f.day>=contract.startsAt&&(f.homeId===club.id||f.awayId===club.id)),games=fixtures.filter(f=>f.result).length;
 const league=v62Current(career).find(c=>c.type==='league'&&c.country===club.countryId),leagueGames=league?.fixtures.filter(f=>f.result&&f.day>=contract.startsAt&&(f.homeId===club.id||f.awayId===club.id)).length||0;
 const expected=v167Active(career)?v168PromiseExpected(career,contract,club):Math.floor(contract.promise*games/Math.max(games,fixtures.length,1));
 const remainingLeague=league?.fixtures.filter(f=>f.day>=contract.startsAt&&(f.homeId===club.id||f.awayId===club.id)).length||0;
 const target=v167Active(career)?Math.floor(contract.promise*remainingLeague/14):contract.promise;
 const credits=v66PromiseCredits(career,player,career.world.season,contract.startsAt),deficit=Math.max(0,expected-credits);
 const status=!contract.promise?'none':credits>=target?'fulfilled':games<4?'pending':deficit>=2?'behind':'on-track';
 return{role:v179SquadRole(career,contract.promise),promise:contract.promise,target,credits,expected,deficit,games,leagueGames,status,penalty:contract.promisePenalty};
}
function v179LineupBonus(career,player){
 if(!v167Active(career))return 0;
 const progress=v179PromiseProgress(career,player);
 if(!progress?.promise)return 0;
 const nextTarget=Math.ceil(progress.promise*Math.min(14,progress.leagueGames+1)/14);
 return Math.min(2,Math.max(0,nextTarget-progress.credits))*.6;
}
function v179SquadDepth(career,club){
 const coach=career.world.coaches.find(c=>c.id===club.coachId),formation=v64CoachTactics(coach,career).formation,roles=v64RoleList(formation),counts={starter:0,rotation:0,reserve:0};
 for(const player of club.roster){const contract=v66Contract(career,player.pid);if(contract&&!contract.simulationOnly)counts[v179SquadRole(career,contract.promise)]++;}
 const positions=['gk','def','mid','att'].map(line=>{const available=club.roster.filter(p=>p.line===line).length,required=roles.filter(r=>r===line).length;return{line,available,required,status:available<required?'missing':available===required?'thin':'covered'};});
 const starters=club.roster.filter(p=>v179SquadRole(career,v66Contract(career,p.pid)?.promise||0)==='starter');
 return{formation,counts,positions,overpromised:counts.starter>roles.length||starters.filter(p=>p.keeper).length>1||starters.filter(p=>!p.keeper).length>roles.length-1};
}
const v179BaseInit=v66Init;
v66Init=function(career){
 const result=v179BaseInit(career);
 if(!v167Active(career))return result;
 for(const club of career.world.clubs.filter(c=>c.leagueId&&!c.simulationOnly)){
  const coach=career.world.coaches.find(c=>c.id===club.coachId),side=v64BuildSide(club,v64CoachTactics(coach,career).formation),starters=new Set(side.starters);
  const rotation=new Set(club.roster.filter(p=>!starters.has(p.pid)&&!p.keeper).sort((a,b)=>v64Rating(b,b.line)-v64Rating(a,a.line)||a.pid.localeCompare(b.pid)).slice(0,3).map(p=>p.pid));
  for(const player of club.roster)v66Contract(career,player.pid).promise=starters.has(player.pid)?10:rotation.has(player.pid)?6:2;
 }
 return result;
};
