const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {makeContext}=require('./test-v41.cjs');

const context=makeContext();
for(const file of ['youth-v33.js','penalties-v42.js','club-records-v43.js','club-identity-v44.js','keeper-logo-v45.js','match-report-v47.js','set-pieces-v50.js','status-icons-v51.js','player-status-v51.js','strength-v53.js'])
 vm.runInContext(fs.readFileSync(path.join('dist',file),'utf8'),context);
vm.runInContext("beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');v41CupEnsure()",context);
const skills=JSON.parse(vm.runInContext("JSON.stringify([activeSave.keeper,...activeSave.squad,...activeSave.world.teams.flatMap(team=>team.roster)].flatMap(player=>v53SkillKeys.map(key=>player[key]).filter(Number.isFinite)))",context));
assert(skills.length>100&&skills.every(value=>Number.isInteger(value)&&value>=0&&value<=20));
assert.equal(vm.runInContext("activeSave.schema",context),4);
assert.equal(vm.runInContext("readSlots().length",context),1);
assert.equal(vm.runInContext("v53SkillBand(7)+'/'+v53SkillBand(8)+'/'+v53SkillBand(11)+'/'+v53SkillBand(14)+'/'+v53SkillBand(17)",context),'very-weak/weak/normal/good/very-good');
assert.equal(vm.runInContext("importSaveObject({save:{schema:3,world:{},squad:[1,2,3,4,5]}})",context),false);
vm.runInContext("start();match.elapsed=75;match.score=[2,0];finishMatch();renderCenter()",context);
assert.equal(vm.runInContext("activeSave.currentRound",context),1);
assert.equal(vm.runInContext("activeSave.squad.every(player=>v53SkillKeys.every(key=>player[key]===undefined||player[key]<=20))",context),true);

// A separate new career starts directly before the final. It is exported in
// the same format as the game's existing save export action.
const finalContext=makeContext();
for(const file of ['youth-v33.js','penalties-v42.js','club-records-v43.js','club-identity-v44.js','keeper-logo-v45.js','match-report-v47.js','set-pieces-v50.js','status-icons-v51.js','player-status-v51.js','strength-v53.js'])
 vm.runInContext(fs.readFileSync(path.join('dist',file),'utf8'),finalContext);
vm.runInContext("beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');v41CupEnsure();activeSave.club='Finale FC';for(let round=0;round<8;round++)for(const game of activeSave.schedule[round]){game.result=game.home==='user'?[2,1]:game.away==='user'?[1,2]:[1,0];updateTable(game.home,game.away,...game.result)}activeSave.currentRound=8;activeSave.cup.stage=2;activeSave.cup.rounds[0]=[{home:'user',away:'nord',result:[2,1],winner:'user'},{home:'hafen',away:'union',result:[1,0],winner:'hafen'}];activeSave.cup.rounds[1]=[{home:'user',away:'nord',result:[1,0],winner:'user'},{home:'hafen',away:'athletik',result:[2,1],winner:'hafen'}];activeSave.cup.rounds[2]=[{home:'user',away:'hafen',result:null,winner:null}];saveCurrent()",finalContext);
assert.equal(vm.runInContext("v41CupGameForUser()?.away",finalContext),'hafen');
const save=JSON.parse(vm.runInContext('JSON.stringify(activeSave)',finalContext));
assert.equal(save.schema,4);
finalContext.importCandidate={game:'Doppel 6',save};
assert.equal(vm.runInContext('importSaveObject(importCandidate)',finalContext),true);
assert.equal(vm.runInContext('readSlots().length',finalContext),2);
const output=path.join('outputs','pokalfinale-staerke-0-20.json');
fs.mkdirSync('outputs',{recursive:true});
fs.writeFileSync(output,JSON.stringify({game:'Doppel 6',version:53,exported:new Date().toISOString(),save},null,2));
vm.runInContext("document.querySelector('#canvas').parentElement={append(){}};showTactics();start();if(!running||match.cup?.stage!==2)throw Error('Pokalfinale startet nicht');match.score=[2,1];finishMatch()",finalContext);
assert.equal(vm.runInContext("activeSave.cup.winner",finalContext),'user');
console.log('Stärkeskala, neuer Spielstand und Pokalfinale geprüft:',output);
