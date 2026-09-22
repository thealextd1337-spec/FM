const fs=require('fs'),vm=require('vm'),assert=require('assert');
const {makeContext}=require('./test-v41.cjs');
const context=makeContext();
vm.runInContext(fs.readFileSync('dist/next-match-v49.js','utf8'),context);
vm.runInContext("beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe')",context);

vm.runInContext(`for(const [index,outcome] of ['S','U','N'].entries()){const game=activeSave.schedule[index].find(item=>item.home==='user'||item.away==='user');game.result=outcome==='U'?[1,1]:game.home==='user'?(outcome==='S'?[2,0]:[0,2]):(outcome==='S'?[0,2]:[2,0])}activeSave.currentRound=3;activeSave.cupEnabled=false`,context);
assert.equal(vm.runInContext("v49RecentForm('user').join('')",context),'SUN');
assert(vm.runInContext("v49PreviewHTML().includes('<small>(')",context),'league table rank');
assert.equal(vm.runInContext("(v49FormHTML('user').match(/class=\"(win|draw|loss|empty)\"/g)||[]).length",context),5);
assert(fs.readFileSync('dist/next-match-v49.js','utf8').includes('grid-template-columns:repeat(5,minmax(0,1fr))'),'mobile form uses five equal cells per team');

vm.runInContext("activeSave.cupEnabled=true;activeSave.cup={season:activeSave.seasonNumber,stage:0,rounds:[[{home:'user',away:activeOpponent().id,result:null,winner:null}],[],[]]}",context);
assert(!vm.runInContext("v49PreviewHTML().includes('<small>(')",context),'cup has no league rank');
vm.runInContext("activeSave.cup.rounds[0][0].result=[1,1];activeSave.cup.rounds[0][0].winner='user'",context);
assert.equal(vm.runInContext("v49RecentForm('user').join('')",context),'SUSN');
console.log('PASS: last-five form, league ranks, cup without ranks, penalty winner and empty slots');
