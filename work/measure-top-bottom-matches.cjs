'use strict';
// Analysis only. Reuse the production compact match controller on fresh copies.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..'); process.chdir(root);
const sha = data => crypto.createHash('sha256').update(data).digest('hex');
const sourceHashes = Object.fromEntries(fs.readdirSync('dist').filter(f=>f.endsWith('.js')).map(f=>[f,sha(fs.readFileSync('dist/'+f))]));
const measured = JSON.parse(fs.readFileSync('outputs/start-roster-strength/measurement.json','utf8'));
assert.equal(measured.generationVersion,3); assert.equal(measured.worlds.length,30);
assert.deepEqual(sourceHashes,measured.sourceHashes,'Recreate the roster measurement for the current product source first');
const clubs = measured.worlds[0].clubs.filter(c=>c.kind==='league').map(c=>({clubId:c.clubId,name:c.name,country:c.country,mean:measured.worlds.reduce((s,w)=>s+w.clubs.find(x=>x.clubId===c.clubId).meanQuality,0)/30})).sort((a,b)=>b.mean-a.mean||a.clubId.localeCompare(b.clubId));
assert.equal(clubs.length,96);
const publicClub = c => ({clubId:c.clubId,name:c.name,country:c.country,leagueRank:clubs.indexOf(c)+1});
const top = clubs.slice(0,10).map(publicClub), bottom = clubs.slice(-10).map(publicClub);
const {harness} = require('./youth-native-harness-v176.cjs');
const {call,run,copy,evaluate} = harness(); run('world-expansion-stories-v170.js'); run('world-youth-legacy-v176.js');
const sample = [0,7,14,21,29].map(i=>measured.worlds[i]);
const matches = [], rounds = [], checks = [];
const summarize = list => ({games:list.length,topWins:list.filter(m=>m.topGoals>m.bottomGoals).length,draws:list.filter(m=>m.topGoals===m.bottomGoals).length,bottomWins:list.filter(m=>m.topGoals<m.bottomGoals).length,topGoals:list.reduce((s,m)=>s+m.topGoals,0),bottomGoals:list.reduce((s,m)=>s+m.bottomGoals,0),topShots:list.reduce((s,m)=>s+m.topShots,0),bottomShots:list.reduce((s,m)=>s+m.bottomShots,0)});
function play(base,fixture,round,seed,t,b,homeTop){
  const career=copy(base), initial=sha(JSON.stringify(base.world));
  globalThis.v61CurrentCareer=career;
  assert(career.world.clubs.every(c=>c.roster.every(p=>p.fresh===100&&p.history.length===0&&p.playerModel.development.processedAppearances.length===0)));
  const f=copy(fixture), s=call('v64MakeState',career,f); let steps=0;
  assert(s.playerLoad && s.playerPerformance && s.roleAssignments,'Use all native production adapters');
  assert([119,178].includes(s.playerPerformance.shotBalanceRevision));
  assert(f.plan.home.coachId&&f.plan.away.coachId,'Both teams must have native AI coaches');
  assert.equal(s.active.length,6); assert.equal(s.awayActive.length,6);
  while(s.phase!=='finished'&&steps++<110)call('v64Step',career,f,s);
  assert.equal(s.phase,'finished'); assert(s.minute>=90&&s.minute<=100);
  const record=call('v64FinishFixture',career,f,s);
  const stats=side=>record.players.filter(p=>p.side===side).reduce((sum,p)=>sum+p.shots,0);
  assert.deepEqual(record.score,[0,1].map(side=>record.players.filter(p=>p.side===side).reduce((sum,p)=>sum+p.goals,0)));
  assert.equal(sha(JSON.stringify(base.world)),initial,'The start world must not change');
  return {id:f.id,round,seed,topId:t.clubId,bottomId:b.clubId,homeId:f.homeId,awayId:f.awayId,homeGoals:s.score[0],awayGoals:s.score[1],topGoals:s.score[homeTop?0:1],bottomGoals:s.score[homeTop?1:0],topShots:stats(homeTop?0:1),bottomShots:stats(homeTop?1:0),minute:s.minute,initialFormations:[f.plan.home.tactics.formation,f.plan.away.tactics.formation],eventHash:sha(JSON.stringify(s.events))};
}
for(let k=0;k<5;k++){
  const w=sample[k], base=call('v167CreateCareer','AUT-5',w.seed,'Startkaderanalyse');
  assert(call('v61ValidateCareer',base));
  for(const c of base.world.clubs){
    const old=w.clubs.find(x=>x.clubId===c.id), actual=c.roster.reduce((s,p)=>s+call('v177Quality',p),0)/11;
    assert(Math.abs(actual-old.meanQuality)<1e-8,'Reproduced roster budget must match '+c.id);
  }
  assert(![...top,...bottom].some(c=>c.clubId===base.manager.managedClubId));
  const day=Math.min(...base.world.competitions.filter(c=>c.type==='league').flatMap(c=>c.fixtures.map(f=>f.day)));
  for(let i=0;i<10;i++)for(let j=0;j<10;j++){
    const t=top[i],b=bottom[j],homeTop=(i+j+k)%2===0;
    const fixture={id:`QA:TOP-BOTTOM:R${k+1}:${t.clubId}:${b.clubId}`,competitionId:'QA-START-LEAGUE',day,homeId:homeTop?t.clubId:b.clubId,awayId:homeTop?b.clubId:t.clubId,neutral:false,result:null};
    const result=play(base,fixture,k+1,w.seed,t,b,homeTop); matches.push(result);
    if(i===0&&j===0)assert.deepEqual(play(base,fixture,k+1,w.seed,t,b,homeTop),result,'Exact replay must reproduce native events and result');
  }
  rounds.push({round:k+1,seed:w.seed,...summarize(matches.filter(m=>m.round===k+1))});
  console.log('PASS round '+(k+1)+'/5: '+JSON.stringify(rounds.at(-1)));
}
assert.equal(matches.length,500); assert.equal(new Set(matches.map(m=>m.id)).size,500);
const teams=[...top.map(c=>({...c,group:'top'})),...bottom.map(c=>({...c,group:'bottom'}))].map(c=>{
  const list=matches.filter(m=>m.topId===c.clubId||m.bottomId===c.clubId),own=m=>c.group==='top'?m.topGoals:m.bottomGoals,other=m=>c.group==='top'?m.bottomGoals:m.topGoals;
  const wins=list.filter(m=>own(m)>other(m)).length,draws=list.filter(m=>own(m)===other(m)).length,losses=list.length-wins-draws;
  assert.equal(list.length,50); assert.equal(list.filter(m=>m.homeId===c.clubId).length,25);
  return {...c,games:50,wins,draws,losses,goalsFor:list.reduce((s,m)=>s+own(m),0),goalsAgainst:list.reduce((s,m)=>s+other(m),0),points:3*wins+draws,homeGames:25,awayGames:25};
});
const pairs=top.flatMap(t=>bottom.map(b=>{
  const list=matches.filter(m=>m.topId===t.clubId&&m.bottomId===b.clubId); assert.equal(list.length,5);
  return {topId:t.clubId,bottomId:b.clubId,...summarize(list)};
}));
const total=summarize(matches),byHome={topHome:summarize(matches.filter(m=>m.homeId===m.topId)),topAway:summarize(matches.filter(m=>m.awayId===m.topId))};
assert.equal(byHome.topHome.games,250); assert.equal(byHome.topAway.games,250);
assert.equal(total.topWins+total.draws+total.bottomWins,500);
assert.equal(teams.reduce((s,t)=>s+t.wins,0),total.topWins+total.bottomWins);
assert.equal(teams.reduce((s,t)=>s+t.draws,0),2*total.draws);
assert.equal(teams.reduce((s,t)=>s+t.goalsFor,0),total.topGoals+total.bottomGoals);
for(const [f,h]of Object.entries(sourceHashes))assert.equal(sha(fs.readFileSync('dist/'+f)),h);
checks.push('500 complete native compact games','100 distinct pairs, five starts per pair','each team 50 games, 25 home and 25 away','generation version 3','native roles, AI, freshness and match ratings','all start worlds unchanged','five exact deterministic replays','source hashes match measurement and stay unchanged','goals and aggregate accounting reconcile');
const report={createdAt:new Date().toISOString(),generationVersion:3,engine:'Native compact world-match-v64 / v155 actions / v158 load; no synthetic score generator, no physical/Unity matches',ranking:'Fixed top ten and last ten of the 96 league clubs by mean initial squad quality across thirty worlds. Cup-only clubs excluded.',design:'Each pair once in each of five different original measurement seeds. Independent JSON copy for every game, initial freshness 100, no transfers or development carried into another game. Native coach lineups, tactics, in-match substitutions and fatigue apply. Alternate home status by pair and round.',sourceHashes,checks,top,bottom,total,byHome,rounds,teams,pairs,matches,scorelines:Object.fromEntries([...new Set(matches.map(m=>m.topGoals+':'+m.bottomGoals))].sort().map(s=>[s,matches.filter(m=>m.topGoals+':'+m.bottomGoals===s).length]))};
const out='outputs/top-bottom-matches';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/results.json',JSON.stringify(report,null,2));
const quote=s=>'"'+String(s).replace(/"/g,'""')+'"',csv=(file,rows)=>fs.writeFileSync(out+'/'+file,'\ufeff'+rows.map(r=>r.map(quote).join(';')).join('\r\n')+'\r\n');
const names=new Map([...top,...bottom].map(c=>[c.clubId,c.name]));
csv('einzelspiele.csv',[['Lauf','Startwelt','Heimverein','Gastverein','Heimtore','Gasttore','Top-Verein','Schwacher Verein','Top-Tore','Schwache Tore','Top-Schüsse','Schwache Schüsse'],...matches.map(m=>[m.round,m.seed,names.get(m.homeId),names.get(m.awayId),m.homeGoals,m.awayGoals,names.get(m.topId),names.get(m.bottomId),m.topGoals,m.bottomGoals,m.topShots,m.bottomShots])]);
csv('vereine.csv',[['Gruppe','Ligarang','Verein','Spiele','Siege','Remis','Niederlagen','Tore','Gegentore','Punkte'],...teams.map(c=>[c.group==='top'?'Top 10':'Letzte 10',c.leagueRank,c.name,c.games,c.wins,c.draws,c.losses,c.goalsFor,c.goalsAgainst,c.points])]);
csv('paarungen.csv',[['Top-Verein','Schwacher Verein','Spiele','Top-Siege','Remis','Außenseitersiege','Top-Tore','Schwache Tore'],...pairs.map(p=>[names.get(p.topId),names.get(p.bottomId),p.games,p.topWins,p.draws,p.bottomWins,p.topGoals,p.bottomGoals])]);
console.log(JSON.stringify({passed:true,total,byHome,checks,scorelines:report.scorelines}));
