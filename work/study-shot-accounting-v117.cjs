// Reuse the v115 experiment setup, keeping its archived evidence untouched.
const fs=require('node:fs'),Module=require('node:module'),path=require('node:path');
let code=fs.readFileSync('work/study-match-statistics-v115.cjs','utf8');
function replace(before,after){if(!code.includes(before))throw Error('Study seam changed: '+before);code=code.replace(before,after)}
replace("engine:'v115; regular offline build; physical live engine'","engine:'v117; shot accounting; regular offline build; physical live engine'");
replace("audit?'match-study-accounting-v115.json':'match-study-v115.json'","audit?'shot-accounting-five-v117.json':'shot-accounting-90-v117.json'");
replace("const auditCases=", "const comparison=JSON.parse(fs.readFileSync(path.join(root,'match-study-v115.json')));\nconst auditCases=");
replace('shots,goalTrace,terminalFlight:', 'shots,goalTrace,ballAccounting:match.ballAccounting,reportAccounting:state.postMatchReport.ballAccounting,bookedAccounting:fixture.matchRecord.ballAccounting,terminalFlight:');
replace("assert.deepEqual(run.teams,old.teams,'Audit reproduces all counters');", "");
replace("   report.profiles||={};", `
   const old=comparison.runs.find(r=>r.pair===run.pair&&r.game===run.game);
   assert.deepEqual(run.score,old.score,'Unchanged physical result');assert.equal(run.draws,old.draws,'Unchanged simulation random draws');assert.equal(run.steps,old.steps,'Unchanged match timing');
   const ledger=run.ballAccounting,byId=new Map(ledger.events.map(e=>[e.id,e]));
   assert.equal(ledger.version,117);assert.equal(byId.size,ledger.sequence);assert.deepEqual(run.reportAccounting,ledger);assert.deepEqual(run.bookedAccounting,ledger);
   for(const e of ledger.events){if(e.parentId!==null)assert(e.parentId<e.id&&byId.has(e.parentId),'Existing earlier parent');if(e.shot)assert(e.result,'Every shot resolved or interrupted');}
   assert.equal(ledger.events.filter(e=>e.shot).length,run.shots.length,'Every actual shot has one event');
   for(const t of [0,1]){
    const stats=run.teams[t],opponent=run.teams[1-t];
    assert.equal(stats.faced,stats.saves+stats.shotConceded,'Resolved target shots = saves + shot goals');
    assert.equal(stats.conceded,stats.shotConceded+stats.nonShotConceded,'All goals classified');
    assert.equal(stats.saves,stats.savesCaught+stats.savesParried,'All saves classified');
    assert.equal(stats.faced,opponent.onTarget,'Opposing shot and keeper target counts');
    assert.equal(ledger.events.filter(e=>e.kind==='goal'&&e.team===t).length,run.score[t],'All goals linked');
    for(const [key,value] of Object.entries(old.teams[t])){
     if(['onTarget','faced'].includes(key)){
      const team=key==='onTarget'?t:1-t,events=ledger.events.filter(e=>e.shot&&e.team===team);
      assert.equal(stats[key],value-events.filter(e=>e.result==='interrupted'&&e.plannedOnTarget).length+events.filter(e=>e.actualOnTarget).length,'Only unresolved or actual target corrections');
     }
     else assert.equal(stats[key],value,'Unchanged counter '+key);
    }
   }
   delete run.reportAccounting;delete run.bookedAccounting;
   report.profiles||={};`);
replace('shotCountersMatch:true,noPageErrors:true','shotCountersMatch:true,noPageErrors:true,linkedEvents:true,keeperIdentities:true,reportAndBookedLedgerMatch:true,unchangedScores:true,unchangedRandomDraws:true,unchangedMatchTiming:true');
const m=new Module(path.resolve('work/study-match-statistics-v115.cjs'),module);m.filename=path.resolve('work/study-match-statistics-v115.cjs');m.paths=module.paths;m._compile(code,m.filename);
