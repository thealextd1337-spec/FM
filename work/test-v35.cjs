const fs=require('fs'),vm=require('vm'),assert=require('assert');
const prelude=fs.readFileSync('work/test-v31.cjs','utf8').split('const context=makeContext();')[0];
const makeContext=new Function('require',prelude+'return makeContext')(require),context=makeContext();
for(const file of['youth-v33.js','season-roster-v34.js','transfer-sections-v35.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);
const run=source=>vm.runInContext(source,context);

run("beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');for(const player of[activeSave.keeper,...activeSave.squad,homeKeeper,...players])player.age=18;for(let round=0;round<10;round++){start();match.score=[2,0];finishMatch()}v31SetStage('complete');selectSponsor('safe')");
const youthId=run('ensureYouth().candidates[0].id');
assert.equal(run(`scoutYouth('${youthId}')`),true);
assert.equal(run(`signYouth('${youthId}')`),true);
const youthName=run('activeSave.squad.find(player=>player.youthPotential).name');
const saleId=run("transferState().salesOffers.find(offer=>offer.status==='active').id"),soldName=run("transferState().salesOffers.find(offer=>offer.status==='active').name");
assert.equal(run(`acceptSaleOffer('${saleId}')`),true);
const roster=run('v35RosterHTML()');
assert(roster.includes(youthName)&&roster.includes('Jugendspieler'));
assert(!roster.includes(soldName),'Verkaufte Spieler fehlen im aktuellen Kader');
assert.equal(run('v35TransferUi().rosterOpen'),true);
run('v35TransferUi().rosterOpen=false;saveCurrent();openSlot(readSlots().find(item=>item.id===activeSave.id))');
assert.equal(run('v35TransferUi().rosterOpen'),false,'Klappzustand bleibt gespeichert');

run('forceTransferDeadline();saveCurrent();for(let round=0;round<10;round++){start();match.score=[2,0];finishMatch()}');
run("v31SetStage('retirements');v31SetStage('finance')");
const financeHtml=run('clubCenter.innerHTML');
assert(financeHtml.includes('data-finale-stage="complete"'),'Finanzabschluss führt direkt in neue Saison');
assert(!financeHtml.includes('Weiter: Kader'));
assert.equal((run("v31Progress('finance')").match(/<span /g)||[]).length,4);
run("activeSave.seasonFinale.stage='squad';saveCurrent();renderCenter()");
assert.equal(run('activeSave.seasonFinale.stage'),'finance','Spielstände aus Version 34 werden zurück zum Finanzabschluss geführt');
assert.equal(run("v31SetStage('complete')"),true);
assert.equal(run('activeSave.seasonNumber'),3);

console.log('PASS: einklappbarer aktueller Kader mit Jugendspieler, vier Abschlussseiten und Übernahme alter Kader-Stufen');
