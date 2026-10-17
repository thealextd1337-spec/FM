'use strict';
// SI 183 only for new worlds (user decision 16 October 2026): the whole player-intelligence rollout (played-out marker
// match.si 183, compact marker 183, symmetric grid defaults of the lines of four and more, sponsor goal level) applies to
// careers created after the change. A career of release 132 has no stamp world.siRevision and keeps the old rules;
// the stamp is written only by v61CreateCareer and never on load, save, import or export.
// Usage: node work/test-si-newworld-v183.cjs
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');process.chdir(path.resolve(__dirname,'..'));
const checks=[];const check=(name,fn)=>{fn();checks.push(name);};
const LARGE={fieldSize:'large',fieldPlayers:6};

// ----- 1. world level: stamp, sponsors, compact (club-world harness) -----
const {suite}=require('./compact-balance-harness-v178.cjs'),h=suite();
const frozenSource=fs.readFileSync('outputs/compact-balance-v183/baseline-v178-controller.js','utf8');
const names=['v155Initialize','v178CompactShotChance','v155CompactActions','v64Step'];
globalThis.v183Current=Object.fromEntries(names.map(name=>[name,h.evaluate(name)]));
const useFrozen=()=>h.evaluate(frozenSource),useCurrent=()=>h.evaluate(names.map(name=>`${name}=v183Current.${name};`).join(''));
// A career of release 132: the same world without the stamp (the generation is unchanged by the rollout).
// The offers of the first season are made at creation, so they are made again without the stamp.
function unstamp(c){delete c.world.siRevision;for(const club of c.world.clubs)club.sponsors=h.call('v66MakeSponsors',c,club);return c;}
function career(seed,{stamp=true,options}={}){const c=h.call('v167CreateCareer','AUT-5',seed,'QA',options);if(!stamp)unstamp(c);return c;}
function initial(seed,{stamp=true,options}={}){
 const c=career(seed,{stamp,options}),day=Math.min(...c.world.competitions.filter(x=>x.type==='league').flatMap(x=>x.fixtures.map(f=>f.day))),f={id:'QA:SIW:'+seed,competitionId:'QA-START-LEAGUE',homeId:'GER-1',awayId:'GER-6',day,neutral:false,result:null};globalThis.v61CurrentCareer=c;
 return{c,f,s:h.call('v64MakeState',c,f)};
}
function finish(x,until=Infinity){globalThis.v61CurrentCareer=x.c;while(x.s.phase!=='finished'&&x.s.minute<until)h.call('v64Step',x.c,x.f,x.s);if(x.s.phase==='finished')h.call('v64FinishFixture',x.c,x.f,x.s);return x;}

check('every new-world creator writes the stamp 183 and the world validates',()=>{
 const creators={v61CreateCareer:['GER-2','siw-v61'],v161CreateCareer:['AUT-5','siw-v161'],v164CreateCareer:['AUT-5','siw-v164'],v165CreateCareer:['AUT-5','siw-v165'],v166CreateCareer:['AUT-5','siw-v166'],v167CreateCareer:['AUT-5','siw-v167']};
 for(const [name,args] of Object.entries(creators)){
  assert.equal(h.evaluate(`typeof ${name}`),'function',name);
  const c=h.call(name,...args);assert.equal(c.world.siRevision,183,`${name} stamps the world`);
  assert.equal(h.call('v61ValidateCareer',c),true,`${name}: stamped world validates`);
  assert.equal(h.call('v183WorldSi',c),true,name);
 }
});
check('stamp validation: absent (release 132) or 183, nothing else',()=>{
 const c=career('siw-valid');assert.equal(h.call('v61ValidateCareer',c),true);
 delete c.world.siRevision;assert.equal(h.call('v61ValidateCareer',c),true,'a world of release 132 stays valid and loadable');
 for(const bad of [0,1,182,184,'183',true,null]){c.world.siRevision=bad;assert.equal(h.call('v61ValidateCareer',c),false,`stamp ${String(bad)}`);}
 delete c.world.siRevision;assert.equal(h.call('v183WorldSi',c),false);assert.equal(h.call('v183WorldSi',{}),false);assert.equal(h.call('v183WorldSi',undefined),false);
});
check('JSON round trip keeps the stamp of a new world and never adds one to a world of release 132; validation does not write',()=>{
 const fresh=career('siw-rt-new'),old=career('siw-rt-old',{stamp:false});
 for(const c of [fresh,old]){
  const before=JSON.stringify(c);h.call('v61ValidateCareer',c);assert.equal(JSON.stringify(c),before,'validation is read-only');
  const copy=h.copy(c);assert.equal(h.call('v61ValidateCareer',copy),true);
 }
 assert.equal(h.copy(fresh).world.siRevision,183);assert.equal(Object.hasOwn(h.copy(old).world,'siRevision'),false);
});
check('playing a season day by day keeps the stamp of a new world and does not give one to an old world',()=>{
 for(const stamp of [true,false]){
  const c=career('siw-days-'+stamp,{stamp});globalThis.v61CurrentCareer=c;
  const own=c.world.clubs.find(x=>x.id===c.manager.managedClubId);h.call('v66ChooseSponsor',c,own.id,own.sponsors[0].id);h.call('v124SetYouthBudget',c,0);
  for(let i=0;i<20&&!c.world.seasonFinished&&c.world.market?.phase==='closed';i++)h.call('v62AdvanceDay',c);
  assert.equal(c.world.siRevision,stamp?183:undefined);assert.equal(Object.hasOwn(c.world,'siRevision'),stamp);
 }
});

// ----- 2. compact simulation -----
check('compact: a new world writes marker 183 with its snapshot; a world of release 132 writes marker 178 with the frozen parameters',()=>{
 const fresh=initial('siw-compact-new'),old=initial('siw-compact-old',{stamp:false});
 assert.equal(fresh.s.playerPerformance.shotBalanceRevision,183);assert.deepEqual(fresh.s.playerPerformance.compactBalance,h.call('v183CompactSnapshot',fresh.c));
 assert.equal(old.s.playerPerformance.shotBalanceRevision,178);assert.deepEqual(old.s.playerPerformance.compactBalance,h.evaluate('({...v178CompactBalance})'));
 assert.equal(fresh.s.siGrid,true);assert.equal(Object.hasOwn(old.s,'siGrid'),false,'no new state field in a world of release 132');
 assert.notEqual(old.s.playerPerformance.compactBalance,h.evaluate('v178CompactBalance'),'a copy, as in release 132');
});
check('compact: initialisation never re-marks an existing performance state, also not after the stamp was removed',()=>{
 const x=initial('siw-compact-keep'),before=JSON.stringify(x.s.playerPerformance);
 delete x.c.world.siRevision;h.call('v155Initialize',x.c,x.s);assert.equal(JSON.stringify(x.s.playerPerformance),before,'a stored 183 match keeps 183');
 const y=initial('siw-compact-keep-old',{stamp:false}),beforeOld=JSON.stringify(y.s.playerPerformance);
 y.c.world.siRevision=183;h.call('v155Initialize',y.c,y.s);assert.equal(JSON.stringify(y.s.playerPerformance),beforeOld,'a stored 178 match keeps 178');
});
check('compact: a full match of a world of release 132 equals the frozen controller of release 132 (also after a JSON resume)',()=>{
 for(const seed of ['siw-frozen-a','siw-frozen-b']){
  useFrozen();const reference=finish(initial(seed,{stamp:false}));useCurrent();
  const checkpoint=finish(initial(seed,{stamp:false}),27),saved=JSON.stringify(checkpoint),direct=finish(checkpoint),loaded=finish(JSON.parse(saved));
  assert.equal(JSON.stringify(direct),JSON.stringify(loaded),'JSON continuation exact');
  assert.deepEqual(direct.s,reference.s,'match equals the frozen controller');assert.deepEqual(direct.c.world.clubs,reference.c.world.clubs,'books, form and development equal the frozen controller');assert.deepEqual(direct.f.matchRecord,reference.f.matchRecord);
  assert.equal(direct.s.compactStats,undefined);assert.equal(direct.f.matchRecord.teamStats,undefined);
 }
});
check('compact: goal level of a world of release 132 stays low, a new world has the new level; the same seeds differ only by the stamp',()=>{
 const total=stamp=>{let goals=0,matches=0,counted=0;for(let i=0;i<14;i++){const x=finish(initial('siw-level-'+i,{stamp}));goals+=x.s.score[0]+x.s.score[1];matches++;counted+=x.s.playerPerformance.shotBalanceRevision===(stamp?183:178)?1:0;}assert.equal(counted,matches);return goals/matches;};
 const old=total(false),fresh=total(true);
 assert(old<2.6,'release 132 level (about 1.4 goals per match): '+old);assert(fresh>3.0,'new level (3 to 5 goals per match): '+fresh);
});
check('compact: a stored match keeps its marker when the career is loaded (no stamp is added, none is removed)',()=>{
 const x=finish(initial('siw-stored'),27),saved=JSON.stringify(x),back=JSON.parse(saved);
 assert.equal(back.s.playerPerformance.shotBalanceRevision,183);assert.equal(back.c.world.siRevision,183);
 const o=finish(initial('siw-stored-old',{stamp:false}),27),savedOld=JSON.stringify(o),backOld=JSON.parse(savedOld);
 assert.equal(backOld.s.playerPerformance.shotBalanceRevision,178);assert.equal(Object.hasOwn(backOld.c.world,'siRevision'),false);
 finish(backOld);assert.equal(backOld.s.playerPerformance.shotBalanceRevision,178);assert.equal(Object.hasOwn(backOld.c.world,'siRevision'),false,'finishing and booking does not stamp');
});

// ----- 3. grid defaults of the lines of four and more (SI-5) -----
check('grid defaults: a new world fills lines of four and more symmetrically, a world of release 132 keeps the old cells',()=>{
 const R132={def:[25,26,27,28,29,32],mid:[15,16,17,18,19,22],att:[5,6,7,8,9,2]};
 for(const role of ['def','mid','att'])for(const count of [4,5,6]){
  assert.deepEqual(h.call('v64GridDefaults',{},role,count),R132[role].slice(0,count),`${role} ${count}: release 132`);
  assert.deepEqual(h.call('v64GridDefaults',{siGrid:true},role,count),h.evaluate('v64GridCells')[role][count],`${role} ${count}: 183`);
 }
 for(const role of ['def','mid','att'])for(const count of [0,1,2,3])assert.deepEqual(h.call('v64GridDefaults',{},role,count),h.call('v64GridDefaults',{siGrid:true},role,count),`${role} ${count}: same up to three`);
 assert.deepEqual(h.call('v64GridDefaults',{siGrid:true},'att',6),[0,2,4,5,7,9],'six-player line in the new worlds');
 assert.deepEqual(h.call('v64GridDefaults',{},'att',6),[5,6,7,8,9,2],'six-player line in release 132');
 // the career plan of both worlds
 for(const [stamp,expect] of [[true,[0,2,4,5,7,9]],[false,[5,6,7,8,9,2]]]){
  const c=career('siw-grid-'+stamp,{stamp,options:LARGE});globalThis.v61CurrentCareer=c;
  const club=c.world.clubs.find(x=>x.id===c.manager.managedClubId),side=h.call('v64BuildSide',club,'0–0–6'),state={active:side.starters,roles:side.roles,cells:{},...(stamp?{siGrid:true}:{})};
  h.call('v64EnsureCells',state,0);
  assert.deepEqual(side.starters.filter(pid=>side.roles[pid]==='att').map(pid=>state.cells[pid]),expect,'v64EnsureCells follows the state flag');
 }
});
check('grid defaults: the match state of a new world carries the flag, a state of release 132 does not',()=>{
 const fresh=initial('siw-gridstate',{options:LARGE}),old=initial('siw-gridstate-old',{stamp:false,options:LARGE});
 assert.equal(fresh.s.siGrid,true);assert.equal(Object.hasOwn(old.s,'siGrid'),false);
});
check('grid defaults: the career plan editor (formation change outside a match) follows the stamp',()=>{
 for(const [stamp,expect] of [[true,[0,2,4,5,7,9]],[false,[5,6,7,8,9,2]]]){
  const c=career('siw-gridplan-'+stamp,{stamp,options:LARGE});globalThis.v61CurrentCareer=c;
  // The editor functions of world-career-plan-v64.js (before its UI part), scoped so that v64ApplyCareerPlan stays out of the other checks.
  const plan=fs.readFileSync('dist/world-career-plan-v64.js','utf8'),context=h.evaluate('(()=>{'+plan.slice(0,plan.indexOf('let v140MatchPresetName'))+';return v64CareerPlanContext;})()');
  const {state}=context(c);
  assert.equal(Object.hasOwn(state,'siGrid'),stamp,'editor state flag');
  const ids=state.active.slice(0,6);for(const pid of ids){state.roles[pid]='att';delete state.cells[pid];}
  state.active=ids;h.call('v64ResetCells',state,0);
  assert.deepEqual(ids.map(pid=>state.cells[pid]),expect,'v64ResetCells in the editor');
 }
});

// ----- 4. sponsor goal -----
check('sponsor: the league goal of a world of release 132 stays 11 + squad (scaled to 14 matches in the 12-country world)',()=>{
 for(const seed of ['siw-sp-a','siw-sp-b']){
  const c=career(seed,{stamp:false});let n=0;
  for(const club of c.world.clubs){
   const goal=club.sponsors[2].goals.find(g=>g.kind==='goals');
   if(club.leagueId){assert.equal(goal.target,Math.ceil((11+club.policy.startingSquad)*14/10),club.id);assert.equal(goal.label,`Liga: mindestens ${goal.target} Tore`);assert.equal(goal.competition,'S1:'+club.countryId+':LEAGUE');n++;}
   else{assert.equal(goal.target,4);assert.equal(goal.label,'Nationaler Pokal: mindestens 4 reguläre Tore');assert.equal(goal.competition,'S1:'+club.countryId+':CUP');}
  }
  assert.equal(n,96);
 }
});
const LEAGUE_GAMES=14;
const GOALS_183=[null,11,13,19,32,44];
check('sponsor: a new world asks for the goal count of its squad class (14 matches); the cup goal stays',()=>{
 const old=career('siw-sp-new',{stamp:false}),fresh=career('siw-sp-new');
 for(const [index,club] of fresh.world.clubs.entries()){
  const goal=club.sponsors[2].goals.find(g=>g.kind==='goals'),oldGoal=old.world.clubs[index].sponsors[2].goals.find(g=>g.kind==='goals');
  assert.equal(club.id,old.world.clubs[index].id);
  if(club.leagueId){
   assert.equal(goal.target,GOALS_183[club.policy.startingSquad],club.id);if(club.policy.startingSquad>=4)assert(goal.target>oldGoal.target,`${club.id}: league goal ${goal.target} above ${oldGoal.target}`);assert.equal(goal.label,`Liga: mindestens ${goal.target} Tore`);
   assert.equal(goal.target,h.call('v66SponsorGoalTarget',fresh,club),'one formula');
  }else{assert.equal(goal.target,4,club.id);assert.equal(goal.target,oldGoal.target);assert.equal(goal.label,'Nationaler Pokal: mindestens 4 reguläre Tore');}
  assert.equal(goal.bonus,oldGoal.bonus,'bonus unchanged');
 }
 // monotone in the squad strength
 const by={};for(const club of fresh.world.clubs.filter(x=>x.leagueId))by[club.policy.startingSquad]=club.sponsors[2].goals.find(g=>g.kind==='goals').target;
 const squads=Object.keys(by).map(Number).sort((a,b)=>a-b);for(let i=1;i<squads.length;i++)assert(by[squads[i]]>=by[squads[i-1]],'target does not fall with the squad strength '+JSON.stringify(by));
});
check('sponsor: later seasons of both worlds follow the same rule (formula by stamp, not by season)',()=>{
 for(const stamp of [true,false]){
  const c=career('siw-sp-season-'+stamp,{stamp});
  for(const season of [2,3,7]){
   c.world.season=season;
   for(const club of c.world.clubs.filter(x=>x.leagueId).slice(0,12)){
    const goal=h.call('v66MakeSponsors',c,club)[2].goals.find(g=>g.kind==='goals');
    assert.equal(goal.competition,`S${season}:${club.countryId}:LEAGUE`);
    assert.equal(goal.target,stamp?h.call('v66SponsorGoalTarget',c,club):Math.ceil((11+club.policy.startingSquad)*14/10));
   }
  }
 }
});
check('sponsor: the schema-14 world (6 teams per league, 10 matches) scales the new goal level with its matches',()=>{
 const old=unstamp(h.call('v61CreateCareer','GER-2','siw-sp-v61')),stamped=h.call('v61CreateCareer','GER-2','siw-sp-v61');
 const club=old.world.clubs.find(x=>x.leagueId&&x.policy.startingSquad===5);assert(club);
 const oldTarget=h.call('v66MakeSponsors',old,club)[2].goals.find(g=>g.kind==='goals').target,newTarget=h.call('v66MakeSponsors',stamped,stamped.world.clubs.find(x=>x.id===club.id))[2].goals.find(g=>g.kind==='goals').target;
 assert.equal(oldTarget,16);assert.equal(newTarget,Math.round(GOALS_183[5]*10/14),'scaled to the 10 matches of a six-team league');
});

// ----- 5. save games: storage, export and import (browser-free localStorage path) -----
function storageContext(){
 const stored=new Map();let nextId=0;
 const context=vm.createContext({crypto:{randomUUID:()=>`siw-${++nextId}`},localStorage:{getItem:key=>stored.get(key)||null,setItem:(key,value)=>stored.set(key,value)}});
 for(const file of ['world-catalog-v61.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
 vm.runInContext(fs.readFileSync('dist/world-nationalities-v79.js','utf8'),context);
 const foundation=fs.readFileSync('dist/world-foundation-v61.js','utf8');
 vm.runInContext(foundation.slice(0,foundation.indexOf('const v61Panel=')),context);
 for(const file of ['world-economy-v66.js','world-youth-manager-v67.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
 return{call:(symbol,...args)=>vm.runInContext(symbol,context)(...args),stored};
}
const asyncChecks=(async()=>{
 const world=storageContext(),call=world.call;
 const fresh=call('v61CreateCareer','GER-2','siw-store-new'),old=call('v61CreateCareer','GER-2','siw-store-old');delete old.world.siRevision;
 assert.equal(fresh.world.siRevision,183);
 await call('v61StoreNewCareer',fresh);await call('v61StoreNewCareer',old);
 const read=call('v61ReadCareers');
 assert.equal(read.find(c=>c.id===fresh.id).world.siRevision,183);assert.equal(Object.hasOwn(read.find(c=>c.id===old.id).world,'siRevision'),false,'storing does not stamp an old world');
 // export and import into a fresh browser profile
 const exportedNew=await call('v61ExportCareerData',fresh.id),exportedOld=await call('v61ExportCareerData',old.id);
 assert.equal(exportedNew.save.world.siRevision,183);assert.equal(Object.hasOwn(exportedOld.save.world,'siRevision'),false,'exporting does not stamp an old world');
 const target=storageContext();
 const importedNew=await target.call('v61ImportCareerData',JSON.parse(JSON.stringify(exportedNew))),importedOld=await target.call('v61ImportCareerData',JSON.parse(JSON.stringify(exportedOld)));
 assert.equal(importedNew.world.siRevision,183);assert.equal(Object.hasOwn(importedOld.world,'siRevision'),false,'importing does not stamp an old world');
 const reloaded=target.call('v61ReadCareers');
 assert.equal(reloaded.length,2);assert.equal(reloaded.filter(c=>c.world.siRevision===183).length,1);
 // a save of release 132 that carries an invalid stamp is rejected, not repaired
 const broken=JSON.parse(JSON.stringify(exportedOld));broken.save.world.siRevision=182;
 await assert.rejects(storageContext().call('v61ImportCareerData',broken),/unvollständig|beschädigt/);
 checks.push('storage, export and import keep the stamp of a new world and never add one to an old world');
})();

// ----- 6. played-out match (native VM harness) -----
const {create}=require('./native183-scenes.cjs');
function played(){
 const g=create({view:false}),made=(config)=>{g.call('Native183.constructed',config);return g;};
 check('played-out: a new world creates matches with marker 183 (clock rate, packages), a world of release 132 creates matches without marker',()=>{
  made({club:'GER-2',seed:'siw-new'});
  const si=g.copy(g.evaluate('match.si'));assert.equal(si.revision,183);assert(si.clockRate>0);assert(Object.values(si.packages).some(Boolean));assert.equal(g.evaluate('v183Marked(match)'),true);
  made({club:'GER-2',seed:'siw-old',stamp:false});
  assert.equal(g.evaluate('match.si'),undefined,'no match.si in a world of release 132');assert.equal(g.evaluate('v183Marked(match)'),false);
  for(const pkg of ['clock','options','offball','finish','defence','setplay','field'])assert.equal(g.evaluate(`v183Active(match,'${pkg}')`),false,pkg);
  assert.equal(g.evaluate('v183Rate(match)'),g.evaluate('MATCH_SPEED'),'old clock');
  const flow=g.copy(g.evaluate('match.attackFlow'));for(const key of ['keeperHoldRevision','setPieceRevision','looseBallRevision','pursuitRevision','motionRevision'])assert.equal(flow[key],182,key);assert.equal(g.evaluate('match.penaltyRevision'),182);
 });
 check('played-out: explicit harness overrides still decide (si:false without marker, object with marker) in either world',()=>{
  made({club:'GER-2',seed:'siw-ovr',si:false});assert.equal(g.evaluate('match.si'),undefined);
  made({club:'GER-2',seed:'siw-ovr',stamp:false,si:false});assert.equal(g.evaluate('match.si'),undefined);
  made({club:'GER-2',seed:'siw-ovr',stamp:false,si:{clockRate:.5}});assert.equal(g.evaluate('match.si.revision'),183);assert.equal(g.evaluate('match.si.clockRate'),.5);
  made({club:'GER-2',seed:'siw-ovr',si:{packages:{clock:false}}});assert.equal(g.evaluate("v183Active(match,'clock')"),false);
 });
 check('played-out: a match of a world of release 132 plays exactly like the constructor without marker (same draws, 900 ticks, large pitch too)',()=>{
  for(const size of ['standard','large'])for(const roles of [false,true]){
   const config={club:'ENG-4',seed:'siw-digest',size,roles},scene={config};
   const oldDefault=g.call('Native183.constructedDigest',{config:{...config,stamp:false}},{}),oldOff=g.call('Native183.constructedDigest',{config:{...config,stamp:true}},{si:false});
   assert.equal(oldDefault,oldOff,`${size}/${roles}: unstamped default equals si:false`);
   const fresh=g.call('Native183.constructedDigest',scene,{});assert.notEqual(fresh,oldOff,`${size}/${roles}: a new world plays differently`);
  }
 });
 check('played-out: a stored match keeps its marker through snapshot and restore in both worlds',()=>{
  for(const stamp of [true,false]){
   made({club:'GER-2',seed:'siw-restore-'+stamp,stamp});g.call('Native183.run',200);
   let guard=0;while(!g.call('Native183.checkpoint')&&guard++<400)g.call('Native183.advance');
   assert(guard<400,'checkpoint reached');
   assert.equal(g.evaluate('match.si?.revision'),stamp?183:undefined);
  }
 });
}
played();

asyncChecks.then(()=>{console.log('PASS '+checks.join('\nPASS '));},error=>{console.error(error);process.exit(1);});
