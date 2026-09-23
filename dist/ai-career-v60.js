'use strict';

// Keep the squad decision independent of the match copies used by the pitch.
function aiCareerQuality(player){
 const keys=player.keeper?['gk','pos','pas','sta']:player.line==='def'?['tak','pos','spd','air']:player.line==='mid'?['tec','pas','pos','sta']:['fin','tec','spd','air'];
 return keys.reduce((sum,key)=>sum+(player[key]||10),0)/keys.length;
}
function aiCareerForm(player){return typeof v51EffectiveForm==='function'?v51EffectiveForm(player):player.form||0}
function aiCareerScore(player){
 const fresh=clamp(player.fresh??100,0,100);
 return aiCareerQuality(player)+aiCareerForm(player)*.5-(100-fresh)*.06-(fresh<52?1.5:0);
}
function aiCareerChoose(roster,line,count){
 return roster.filter(player=>player.line===line&&!player.keeper)
  .sort((a,b)=>aiCareerScore(b)-aiCareerScore(a)||(b.fresh??100)-(a.fresh??100)||a.n-b.n).slice(0,count);
}
aiLineup=function(team){
 const roster=team.roster||[];
 return[roster.find(player=>player.keeper),...aiCareerChoose(roster,'def',2),...aiCareerChoose(roster,'mid',2),...aiCareerChoose(roster,'att',1)].filter(Boolean);
};
function aiCareerPrepare(team){
 if(!team?.pendingPlayedRecovery?.length)return;
 for(const number of team.pendingPlayedRecovery){
  const player=team.roster.find(item=>item.n===number);
  if(player)player.fresh=clamp((player.fresh??100)+16,0,100);
 }
 delete team.pendingPlayedRecovery;
}
function aiCareerFinish(team,lineup,ratings){
 const participants=new Map(lineup.map(player=>[player.n,player]));
 const workloads=new Map(lineup.map(player=>[player.n,v51Workload(player,false)]));
 for(const source of team.roster){
  if(!participants.has(source.n)){source.fresh=clamp((source.fresh??100)+24,0,100);continue}
  const rating=ratings.get(source.n);
  if(Number.isFinite(rating))updateForm(source,rating);
  source.fresh=clamp((source.fresh??100)-workloads.get(source.n),0,100);
 }
 team.lastLineup=lineup.map(player=>player.n);
 team.pendingPlayedRecovery=[...participants.keys()];
}
function aiTeamStrength(id,base){
 if(id==='user')return base;
 const team=worldTeam(id);if(!team)return base;
 aiCareerPrepare(team);
 const selected=aiLineup(team),ideal=[team.roster.find(player=>player.keeper),
  ...['def','mid','att'].flatMap((line,index)=>team.roster.filter(player=>player.line===line&&!player.keeper)
   .sort((a,b)=>aiCareerQuality(b)-aiCareerQuality(a)||a.n-b.n).slice(0,index===2?1:2))].filter(Boolean);
 const average=list=>list.reduce((sum,player)=>sum+aiCareerQuality(player),0)/(list.length||1);
 const form=selected.reduce((sum,player)=>sum+aiCareerForm(player),0)/(selected.length||1);
 const fatigue=selected.reduce((sum,player)=>sum+100-clamp(player.fresh??100,0,100),0)/(selected.length||1);
 return base+clamp((average(selected)-average(ideal))*3+form*.7-fatigue*.04,-6,2);
}

opponentPlayers=function(){
 const opponent=activeOpponent();aiCareerPrepare(opponent);
 const selection=aiLineup(opponent).filter(player=>!player.keeper),cells={def:[26,28],mid:[16,18],att:[7]},roles={def:-1,mid:0,att:1},used={def:0,mid:0,att:0},boost=(opponent.strength-70)*.13;
 return selection.map(player=>{const line=player.line,index=used[line]++,copy={...structuredClone(player),cell:cells[line][index],role:roles[line],assignedLine:line};for(const key of v55SkillKeys)if(Number.isFinite(copy[key]))copy[key]=v55Skill(copy[key]+boost);return copy});
};

const aiCareerAddSyntheticMatch=addSyntheticMatch;
addSyntheticMatch=function(team,goals,conceded){
 aiCareerPrepare(team);
 const lineup=aiLineup(team),before=new Map(lineup.map(player=>[player.n,{total:currentStats(player).ratingTotal,count:currentStats(player).ratingCount}]));
 const result=aiCareerAddSyntheticMatch(team,goals,conceded);
 const ratings=new Map(lineup.map(player=>{const stats=currentStats(player),previous=before.get(player.n);return[player.n,(stats.ratingTotal-previous.total)/(stats.ratingCount-previous.count)]}));
 aiCareerFinish(team,lineup,ratings);
 return result;
};

const aiCareerSimulateCupGame=v41SimulateGame;
v41SimulateGame=function(game){
 const teams=[worldTeam(game.home),worldTeam(game.away)];
 for(const team of teams)aiCareerPrepare(team);
 const lineups=teams.map(team=>aiLineup(team)),before=teams.map((team,index)=>new Map(lineups[index].map(player=>{const stats=v41CupStats(player);return[player.n,{total:stats.ratingTotal,count:stats.ratingCount}]})));
 const result=aiCareerSimulateCupGame(game);
 teams.forEach((team,index)=>{
  const ratings=new Map(lineups[index].map(player=>{const stats=v41CupStats(player),previous=before[index].get(player.n);return[player.n,(stats.ratingTotal-previous.total)/(stats.ratingCount-previous.count)]}));
  aiCareerFinish(team,lineups[index],ratings);
 });
 return result;
};

const aiCareerFinishMatch=finishMatch;
finishMatch=function(){
 const wasFinished=Boolean(match?.finished),opponent=!wasFinished&&activeSave?activeOpponent():null;
 const result=aiCareerFinishMatch();
 if(!wasFinished&&match?.finished&&opponent){
  const lineup=match.people.filter(player=>player.t===1);
  aiCareerFinish(opponent,lineup,new Map(lineup.map(player=>[player.n,player.stats.rating])));
  saveCurrent();
 }
 return result;
};
