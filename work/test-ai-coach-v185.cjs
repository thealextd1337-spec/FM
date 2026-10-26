'use strict';
// AI coach 185 (dist/world-ai-coach-v185.js): decision function, a played-out scene in the native VM harness
// (real career, real constructor, real v65ApplyTactics) and the report section. Old states keep v64AiAdjust.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');process.chdir(path.resolve(__dirname,'..'));
const {create}=require('./native183-scenes.cjs');
const g=create({view:false}),run=g.run,ev=g.evaluate;
const physical=fs.readFileSync('dist/world-physical-v65.js','utf8'),applyAt=physical.indexOf('function v65ApplyTactics('),applyEnd=physical.indexOf('\n}\n',applyAt)+3;
run(physical.slice(applyAt,applyEnd),'v65ApplyTactics');
run('var v185Notes=[];note=(text,kind)=>v185Notes.push({text,kind});var v65WorldReport=()=>({});var v47ReportHTML=()=>"<div><table></table></div>";');
run(fs.readFileSync('dist/world-ai-coach-v185.js','utf8'),'world-ai-coach-v185.js');
const decide=input=>ev('v185Decide')({six:false,fresh:70,active:null,base:{formation:'2–2–1',pressing:'Ausgewogen',passing:'Variabel',defense:'Neutral',aggression:'Normal',focus:'Variabel'},...input});
const quiet={minutes:15,shotsFor:1,shotsAgainst:1,onFor:0,onAgainst:0,possession:.5,territory:.5};
const dominated={minutes:15,shotsFor:0,shotsAgainst:3,onFor:0,onAgainst:2,possession:.38,territory:.36};
const pinned={minutes:15,shotsFor:0,shotsAgainst:0,onFor:0,onAgainst:0,possession:.3,territory:.3};

// 1. Decision function.
{
 const d=decide({minute:65,score:-1,quality:4,window:{...quiet,possession:.45}});
 assert.equal(d.why,'trail');assert.equal(d.target.formation,'1–2–2');assert.equal(d.target.pressing,'Früh');assert.equal(d.target.passing,'Direkt','trailing with less of the ball: direct passing');
 assert.equal(decide({minute:85,score:-1,quality:4,window:quiet}).target.defense,'Hoch','trailing late: line pushed up');
 const weak=decide({minute:65,score:-1,quality:1,window:quiet});assert.equal(weak.target.formation,'2–2–1','weak coach is not yet at his formation change');assert.equal(weak.target.pressing,'Früh');
 assert.equal(decide({minute:72,score:-1,quality:1,window:quiet}).target.formation,'1–2–2','weak coach uses the fixed attacking shape');
}
{
 const fit=decide({minute:40,score:0,quality:4,window:dominated});assert.equal(fit.why,'pressure');assert.equal(fit.target.formation,'3–1–1','chances against: one more defender');assert.equal(fit.target.defense,'Neutral');
 const weak=decide({minute:40,score:0,quality:2,window:dominated});assert.equal(weak.why,'pressure');assert.equal(weak.target.defense,'Tief','weak coach: generic deep block');assert.equal(weak.target.formation,'2–2–1');
 const ball=decide({minute:40,score:0,quality:5,window:pinned});assert.equal(ball.target.pressing,'Früh','pinned back without shots against: press higher');assert.equal(ball.target.passing,'Kurz');
 assert.equal(decide({minute:40,score:0,quality:5,window:{...pinned,minutes:6}}).why,'calm','no judgement on a short window');
}
{
 const d=decide({minute:55,score:1,quality:5,window:dominated});assert.equal(d.why,'protect');assert.equal(d.target.formation,'3–1–1');assert.equal(d.target.aggression,'Vorsichtig');
 const late=decide({minute:80,score:1,quality:5,window:dominated});assert.equal(late.target.pressing,'Abwartend','late lead under pressure keeps the cautious pressing');
 const comfortable=decide({minute:80,score:2,quality:5,window:quiet});assert.equal(comfortable.target.formation,'2–2–1','fitting coach keeps the shape with a two-goal lead');assert.equal(comfortable.target.pressing,'Abwartend');
 assert.equal(decide({minute:80,score:2,quality:2,window:quiet}).target.formation,'3–1–1','weak coach closes up regardless');
 // The pressure answer stays while the pressure lasts (user, 23 Oct): a lead protected with one more defender does not switch
 // to keeping the ball when the window turns to possession only; a new answer is chosen only without a kept one.
 const kept=decide({minute:55,score:1,quality:5,window:pinned,active:'protect',answer:'block'});assert.equal(kept.target.formation,'3–1–1');assert.equal(kept.target.passing,'Variabel');assert.equal(kept.answer,'block');
 const fresh=decide({minute:55,score:1,quality:5,window:pinned,active:'protect'});assert.equal(fresh.target.passing,'Kurz');assert.equal(fresh.target.formation,'2–2–1');assert.equal(fresh.answer,'keep');
 assert.equal(decide({minute:40,score:0,quality:5,window:dominated,active:'pressure',answer:'keep'}).target.formation,'2–2–1','kept ball answer: no extra defender');
 assert.equal(decide({minute:40,score:0,quality:5,window:quiet}).answer,null,'no pressure, no answer');
}
{
 // Problem solved: the window is quiet again, the target is the coach's own plan (revert).
 const d=decide({minute:60,score:0,quality:4,window:quiet,active:'pressure'});assert.equal(d.why,'calm');assert.deepEqual(d.target,decide({minute:0,score:0,quality:4,window:quiet}).target);
 // Hysteresis: a pressure answer stays while the pressure has eased only a little.
 const easing={minutes:15,shotsFor:0,shotsAgainst:1,onFor:0,onAgainst:0,possession:.45,territory:.45};
 assert.equal(decide({minute:60,score:0,quality:4,window:easing,active:'pressure'}).why,'pressure');assert.equal(decide({minute:60,score:0,quality:4,window:easing}).why,'calm');
 // Tired team drops the high press unless it chases the game late.
 assert.equal(decide({minute:50,score:0,quality:5,window:pinned,fresh:50}).target.pressing,'Ausgewogen');assert.equal(decide({minute:50,score:0,quality:5,window:pinned,fresh:60}).target.pressing,'Früh');
 assert.equal(decide({minute:80,score:-1,quality:4,window:quiet,fresh:40}).target.pressing,'Früh');
}
{
 // Coach quality: better coaches react earlier to a deficit and at a lower pressure.
 const first=(q,f)=>{for(let minute=1;minute<=95;minute++)if(f(minute,q))return minute;return 99;};
 const press=q=>first(q,(minute,q)=>decide({minute,score:-1,quality:q,window:quiet}).target.pressing==='Früh');
 const shape=q=>first(q,(minute,q)=>decide({minute,score:-1,quality:q,window:quiet}).target.formation!=='2–2–1');
 assert(press(5)<press(3)&&press(3)<press(1),'pressing reaction order');assert(shape(5)<shape(3)&&shape(3)<shape(1),'formation reaction order');
 const threshold=q=>{for(let k=0;k<=40;k++){const p=k/10,w={...quiet,possession:.5-p/8,territory:.5-p/8};if(decide({minute:40,score:0,quality:q,window:w}).why==='pressure')return p;}return 99;};
 assert(threshold(5)<threshold(3)&&threshold(3)<threshold(1),'pressure threshold order');
 assert.equal(ev('v185Shift')('1–1–3',-1),'2–1–2');assert.equal(ev('v185Shift')('3–1–1',-1),'3–1–1');assert.equal(ev('v185Shift')('2–2–2',1),'1–2–3');
}

// 2. Played-out scene: real stamped career, real constructor, the computer side reacts and is announced; the user side never.
const scene=(club,seed,size='standard')=>{g.call('Native183.constructed',{club,seed,size});return ev('Native183.context()');};
{
 const ctx=scene('GER-2','ai185');const state=ctx.state,ai=1-ctx.ownSide,aiPhysical=1;
 assert.equal(state.aiCoachRevision,185,'new world state is marked');
 // Benchmark and example scenes use league clubs only (user, 22 Oct 2026: cup clubs are no yardstick).
 for(const id of [ctx.fixture.homeId,ctx.fixture.awayId]){const club=ctx.career.world.clubs.find(c=>c.id===id);assert(club.leagueId&&!club.simulationOnly&&/:LEAGUE$/.test(ctx.fixture.competitionId),`${id} is a league club in a league match`);}
 g.call('Native183.run',400);ev('v185Notes.length=0');
 for(let i=0;i<40;i++){g.call('Native183.advance');ev('v185Observe(Native183.context())');}
 const w=ev('v185Window')(state,ai);assert(w.possession>0&&w.possession<1&&w.territory>0&&w.territory<1,'window reads possession and territory');
 state.score[ai]=0;state.score[ctx.ownSide]=1;state.minute=61;state.lastAiChange=[-20,-20];state.lastAiCheck=[-1,-1];
 const coach=ctx.career.world.coaches.find(c=>c.id===(ai===0?ctx.fixture.plan.home:ctx.fixture.plan.away).coachId);coach.judgment.adaptation=4;
 const before={...state.tactics[ai]};ev('v185Notes.length=0');ev('v185AfterStep')(ctx,true,false);ev('v65ApplyTactics')(ctx);
 assert.notDeepEqual(state.tactics[ai],before,'computer side changed its tactics');assert.equal(state.tactics[ai].pressing,'Früh');
 assert.equal(ev('match.teamPress')[aiPhysical],1,'engine reads the new pressing');
 const notes=ev('v185Notes');assert.equal(notes.length,1);assert.match(notes[0].text,/ stellt um: .+ \(Rückstand aufholen\)\.$/);
 assert.equal(state.tacticChanges.at(-1).side,ai);assert.equal(state.aiCoach.log.at(-1).kind,'tactics');
 // User side: never coached, also when called directly.
 assert.equal(ev('v185AiCoach')(ctx,ctx.ownSide,'Tor'),null);
 // Report: section with the logged decisions.
 const report=ev('v65WorldReport')(ctx,[]);assert.equal(report.aiCoach.length,state.aiCoach.log.length);
 const html=ev('v47ReportHTML')(report);assert.match(html,/<h3>Umstellungen des Gegners<\/h3>.*61′.*stellt um/s);
 // A clearly weak performer is replaced from the half-time check on by a fitting coach, the best bench fit takes his role.
 const field=ev('v64Active')(state,ai).filter(pid=>state.roles[pid]!=='gk'),victim=field[0];
 for(const pid of field)state.minutes[pid]=61;
 // The VM harness loads no player-performance ledger: a stub ledger and rating stand in for v155.
 const ledger=state.playerPerformance;state.playerPerformance||={};
 run(`var v155Rated=(career,fixture,state,pid)=>({rating:pid===${JSON.stringify(victim)}?4.6:6.4});`);
 state.minute=45;const sub=ev('v185Substitution')(ctx.career,ctx.fixture,state,ai,4);state.playerPerformance=ledger;
 assert.equal(sub.outPid,victim);assert.equal(sub.why,'poor');assert.equal(JSON.stringify(state.pending[ai]),JSON.stringify([{outPid:victim,inPid:sub.inPid}]));
 assert.match(ev('v185Text')('X',{kind:'sub',...sub}),/^X wechselt: .+ für .+ \(schwache Leistung\)\.$/);
 // Report: a substitution shows the minute it was carried out; one that never came on is left out.
 state.aiCoach.log.push({minute:45,side:ai,kind:'sub',...sub});
 assert(!ev('v65WorldReport')(ctx,[]).aiCoach.some(e=>/wechselt/.test(e.text)),'pending substitution not reported');
 state.substitutions.push({minute:47,side:ai,outPid:sub.outPid,inPid:sub.inPid,reason:'Halbzeit'});
 assert.equal(JSON.stringify(ev("v65WorldReport")(ctx,[]).aiCoach.filter(e=>/wechselt/.test(e.text)).map(e=>e.minute)),"[47]");
 // A goal in a minute that was already checked still gets its reaction.
 const flat=minute=>{const last=state.aiCoach.samples.at(-1);state.aiCoach.samples=[{...structuredClone(last),minute:minute-15},{...structuredClone(last),minute}];};
 state.pending[ai]=[];state.minute=70;flat(70);state.lastAiCheck[ai]=70;state.lastAiChange[ai]=61;state.score[ai]=0;state.score[ctx.ownSide]=2;
 state.tactics[ai].pressing='Abwartend';
 assert.equal(ev('v185AiCoach')(ctx,ai,'Reguläre Prüfung'),null,'same minute, regular check: no second check');
 assert(ev('v185AiCoach')(ctx,ai,'Tor').length>=1,'same minute, goal: reaction');
 // Second leg: the first leg counts (AI won the first leg 2:0, trails 0:1 now: still ahead on aggregate, no chase).
 const plan=ai===0?ctx.fixture.plan.home:ctx.fixture.plan.away;
 for(const [key,value] of Object.entries(plan.tactics))state.tactics[ai][key]=value;
 state.score[ai]=0;state.score[ctx.ownSide]=1;state.minute=76;flat(76);state.lastAiChange[ai]=0;ctx.fixture.leg=2;
 run('var v64UiFirstLegScore=(career,fixture,reverse)=>[0,2];');
 assert(!(ev('v185AiCoach')(ctx,ai,'Reguläre Prüfung')||[]).some(e=>e.why==='trail'),'aggregate lead: no chase');
 run('v64UiFirstLegScore=undefined;');delete ctx.fixture.leg;
 // Territory: one sample per match minute, however many frames run in it.
 const territory=()=>state.aiCoach.territory[0]+state.aiCoach.territory[1];state.minute=81;ev('v185Observe')(ctx);const once=territory();
 for(let i=0;i<10;i++)ev('v185Observe')(ctx);assert.equal(territory(),once,'frames inside a minute add no territory');
 // Reverts (user, 23 Oct): a key returns to its previous value only after 15 minutes, earlier after a goal since the change, never after 85.
 const press=(minute,on)=>{const last=state.aiCoach.samples.at(-1),from={...structuredClone(last),minute:minute-15},now={...structuredClone(last),minute},own=ctx.ownSide;
  if(on){now.shots[own]+=3;now.on[own]+=2;now.poss[own]+=60;now.terr[own]+=12;}state.aiCoach.samples=[from,now];};
 const reset=()=>{for(const [key,value] of Object.entries(plan.tactics))state.tactics[ai][key]=value;Object.assign(state.aiCoach,{history:[{},{}],answer:[null,null],active:[null,null]});state.score[ai]=0;state.score[ctx.ownSide]=0;state.lastAiChange[ai]=-20;state.firstHalfEnd=45;state.addedMinutes=[0,0];};
 const check=(minute,on,reason='Reguläre Prüfung')=>{state.minute=minute;press(minute,on);state.lastAiCheck[ai]=-1;return(ev('v185AiCoach')(ctx,ai,reason)||[]).filter(e=>e.kind==='tactics');};
 reset();const shape=check(30,true);assert.equal(shape[0]?.why,'pressure');assert.equal(state.tactics[ai].formation,ev('v185Shift')(plan.tactics.formation,-1));
 assert.equal(check(40,false).length,0,'quiet after 10 minutes: no revert yet');assert.equal(check(45,false)[0]?.why,'calm','quiet after 15 minutes: revert');assert.equal(state.tactics[ai].formation,plan.tactics.formation);
 reset();check(30,true);state.score[ai]=1;assert.equal(check(36,false,'Tor')[0]?.changes.formation,plan.tactics.formation,'goal since the change: revert at once');
 const shifted=ev('v185Shift')(plan.tactics.formation,-1);
 // (a) No revert without a goal from the shown minute 85 on, although 15 minutes have passed (level score: no lead rule sets the shape).
 reset();check(70,true);assert.equal(state.tactics[ai].formation,shifted);assert.equal(check(88,false).filter(e=>'formation' in e.changes).length,0,'no revert at 88 without a goal');assert.equal(state.tactics[ai].formation,shifted);
 // (b) Boundary: shown 84 reverts, shown 85 does not; the added time of the first half does not count (87 with 3 added = 84).
 reset();check(68,true);assert.equal(check(84,false)[0]?.changes.formation,plan.tactics.formation,'revert at shown 84');
 reset();check(68,true);assert.equal(check(85,false).length,0,'no revert at shown 85');
 reset();state.addedMinutes=[3,0];state.firstHalfEnd=48;check(70,true);assert.equal(check(87,false)[0]?.changes.formation,plan.tactics.formation,'state minute 87 with 3 added = shown 84: revert');
 // (c) The answer is stored when the check reached the target, not when the 10-minute gap held the change back, and is chosen anew after a goal.
 reset();check(30,true);assert.equal(state.aiCoach.answer[ai],'block','applied answer stored');
 reset();state.lastAiChange[ai]=25;check(30,true);assert.equal(state.tactics[ai].formation,plan.tactics.formation);assert.equal(state.aiCoach.answer[ai],null,'held back by the gap: no stored answer');
 reset();state.aiCoach.answer[ai]='keep';check(30,true);assert.equal(state.tactics[ai].formation,plan.tactics.formation,'kept answer: no extra defender');assert.equal(state.aiCoach.answer[ai],'keep');
 reset();state.aiCoach.answer[ai]='keep';check(30,true,'Tor');assert.equal(state.tactics[ai].formation,shifted,'after a goal the answer is chosen anew');assert.equal(state.aiCoach.answer[ai],'block');
 // (d) A goal after the last change lifts the lock (review 2): 1:0 at 75 protected with one more defender and careful duels, conceded 86 and 89.
 reset();state.score[ai]=1;check(75,true);assert.equal(state.tactics[ai].aggression,'Vorsichtig');state.score[ctx.ownSide]=2;check(89,false,'Tor');
 assert.equal(state.tactics[ai].aggression,plan.tactics.aggression,'duels back to the plan after late goals');assert.equal(state.tactics[ai].pressing,'Früh','late deficit: high press');
 state.score[ai]=0;state.score[ctx.ownSide]=0;
}
{
 // Release-132 world (no stamp): no marker.
 g.call('Native183.constructed',{club:'ENG-4',seed:'ai185-old',stamp:false});
 assert.equal(ev('Native183.context()').state.aiCoachRevision,undefined);
}

// 3. Compact matches stay byte-identical: v64Step of a stamped world with and without the marker (same native hash).
{
 const {suite}=require('./compact-balance-harness-v178.cjs'),h=suite(),hashes=strip=>{
  h.evaluate(`globalThis.v185Strip=${strip}`);
  const c=h.call('v167CreateCareer','AUT-5','ai185-compact','QA'),day=Math.min(...c.world.competitions.filter(x=>x.type==='league').flatMap(x=>x.fixtures.map(f=>f.day))),snapshot=JSON.stringify(c);
  const clubs=c.world.clubs.filter(club=>club.leagueId&&club.coachId).map(club=>club.id).slice(0,8);
  return clubs.map((home,i)=>h.play(snapshot,{id:`QA:AIC185:${i}`,homeId:home,awayId:clubs[(i+3)%clubs.length]},undefined,{day}).nativeHash);
 };
 h.evaluate('const v185MakeStateBase=v64MakeState;v64MakeState=function(...args){const state=v185MakeStateBase(...args);if(globalThis.v185Strip)delete state.aiCoachRevision;return state;};');
 assert.deepEqual(hashes(false),hashes(true),'compact matches identical with and without marker 185');
}

// 4. Whole played-out matches through the real v65AfterStep chain (work/replay-ai-coach-v185.cjs): named league pairs of
// the browser reference (balanced AUT-2 - AUT-1, AI favourite BEL-8 - BEL-3), without the marker (v64AiAdjust) and with it.
{
 const {vmHarness,prepare,play}=require('./replay-ai-coach-v185.cjs'),r=vmHarness();
 for(const [managed,aiClub,kind,both] of [['AUT-2','AUT-1','a',true],['BEL-8','BEL-3','b-fav',false]]){
  const job={id:`standard:p:${managed}`,set:'p',kind,size:'standard',players:5,seed:'p01r132-'+managed,browser:true,managed,ai:aiClub},prepared=prepare(r,job);
  const on=play(r,job,true,prepared),aiTeam=on.teams.find(t=>t.side===on.aiSide);
  assert(on.finished&&on.minute>=89&&aiTeam.clubId===aiClub,`${managed}: match played to the end against ${aiClub}`);
  if(kind==='b-fav')assert(aiTeam.ovr>on.teams.find(t=>t.side!==on.aiSide).ovr,'AI is the favourite');
  assert(on.state.aiCoach.samples.length>=10&&on.log.length>=1,`${managed}: coach observed and acted`);
  for(const e of on.log.filter(e=>e.kind==='tactics'))assert(on.state.tacticChanges.some(c=>c.minute===e.minute&&c.side===on.aiSide),'logged change applied');
  if(both){const off=play(r,job,false,prepared);assert(off.finished&&off.log.length===0&&off.state===undefined,'without marker: v64AiAdjust only, no coach log');}
 }
}
console.log('AI-Trainer 185: Entscheidung, Szene, Bericht und Altstand geprüft.');
