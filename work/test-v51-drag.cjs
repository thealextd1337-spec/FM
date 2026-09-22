const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {makeContext}=require('./test-v41.cjs');

const starters=fs.readFileSync('dist/player-status-v51.js','utf8');
const drag=fs.readFileSync('dist/lineup-ux-v24.js','utf8');

assert.match(starters,/class="v51-starter"[^>]*draggable="true"[^>]*data-drag-player="\$\{player\.n\}"[^>]*data-drag-kind="pitch"[^>]*data-drop-cell="\$\{player\.cell\}"/,'starter cards must be draggable pitch players and drop targets');
assert.match(drag,/data-drag-kind="bench"[^>]*data-bank-player="\$\{player\.n\}"/,'bench cards remain draggable drop targets');
const context=makeContext();
context.document.addEventListener=()=>{};
vm.runInContext(drag,context);
vm.runInContext("beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe')",context);
const swapped=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
 const starter=activeSave.lineup[0],bench=activeSave.squad.find(player=>!activeSave.lineup.includes(player.n)).n;
 const cell=players.find(player=>player.n===starter).cell;
 const starterTarget={closest:selector=>selector==='[data-drop-cell]'?{dataset:{dropCell:cell}}:null};
 const benchTarget={closest:selector=>selector==='[data-bank-player]'?{dataset:{bankPlayer:starter}}:null};
 const intoLineup=v24HandleDrop({number:bench,kind:'bench'},starterTarget);
 const intoBench=v24HandleDrop({number:bench,kind:'pitch'},benchTarget);
 return{intoLineup,intoBench,starterBack:activeSave.lineup.includes(starter),benchBack:!activeSave.lineup.includes(bench)};
})())`,context));
assert.deepEqual(swapped,{intoLineup:true,intoBench:true,starterBack:true,benchBack:true},'dropping a bench player onto a starter and back must swap the lineup both ways');
console.log('PASS: starter and bench cards expose both drag directions');
