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
}
{
 // Problem solved: the window is quiet again, the target is the coach's own plan (revert).
 const d=decide({minute:60,score:0,quality:4,window:quiet,active:'pressure'});assert.equal(d.why,'calm');assert.deepEqual(d.target,decide({minute:0,score:0,quality:4,window:quiet}).target);
 // Hysteresis: a pressure answer stays while the pressure has eased only a little.
 const easing={minutes:15,shotsFor:0,shotsAgainst:1,onFor:0,onAgainst:0,possession:.45,territory:.45};
 assert.equal(decide({minute:60,score:0,quality:4,window:easing,active:'pressure'}).why,'pressure');assert.equal(decide({minute:60,score:0,quality:4,window:easing}).why,'calm');
 // Tired team drops the high press unless it chases the game late.
 assert.equal(decide({minute:50,score:0,quality:4,window:pinned,fresh:40}).target.pressing,'Ausgewogen');
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
 // A clearly weak performer is replaced from the second half on by a fitting coach, the best bench fit takes his role.
 const field=ev('v64Active')(state,ai).filter(pid=>state.roles[pid]!=='gk'),victim=field[0];
 for(const pid of field)state.minutes[pid]=61;
 // The VM harness loads no player-performance ledger: a stub ledger and rating stand in for v155.
 const ledger=state.playerPerformance;state.playerPerformance||={};
 run(`var v155Rated=(career,fixture,state,pid)=>({rating:pid===${JSON.stringify(victim)}?4.6:6.4});`);
 state.minute=63;const sub=ev('v185Substitution')(ctx.career,ctx.fixture,state,ai,4);state.playerPerformance=ledger;
 assert.equal(sub.outPid,victim);assert.equal(sub.why,'poor');assert.equal(JSON.stringify(state.pending[ai]),JSON.stringify([{outPid:victim,inPid:sub.inPid}]));
 assert.match(ev('v185Text')('X',{kind:'sub',...sub}),/^X wechselt: .+ für .+ \(schwache Leistung\)\.$/);
}
{
 // Release-132 world (no stamp): no marker, the physical step keeps v64AiAdjust.
 g.call('Native183.constructed',{club:'ENG-4',seed:'ai185-old',stamp:false});
 assert.equal(ev('Native183.context()').state.aiCoachRevision,undefined);
 assert(physical.includes("if(state.aiCoachRevision===185)v185AfterStep(context,goal,halftime);\n else if(goal||halftime"),'call site keeps v64AiAdjust for unmarked states');
}
console.log('AI-Trainer 185: Entscheidung, Szene, Bericht und Altstand geprüft.');
