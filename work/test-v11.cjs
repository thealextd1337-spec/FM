const fs=require('fs'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
const elements=new Map(),storage=new Map();
function element(){return{innerHTML:'',textContent:'',hidden:false,value:'FC Testliga',disabled:false,dataset:{},className:'',classList:{toggle(){},remove(){}},setAttribute(){},addEventListener(){},append(){},before(){},prepend(){},focus(){},scrollIntoView(){},querySelector(){return element()},querySelectorAll(){return[]},closest(){return null}}}
const scoreboard=[element(),element()];const document={querySelector:s=>{if(!elements.has(s))elements.set(s,element());return elements.get(s)},querySelectorAll:s=>s==='.scoreboard span'?scoreboard:[],createElement:element,createTextNode:t=>t};
const context={document,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},window:{scrollTo(){}},location:{protocol:'file:'},crypto,structuredClone,performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},alert:m=>{throw Error(m)},confirm:()=>true,fetch:async()=>({ok:true}),console,Math};vm.createContext(context);
for(const file of['game.js','manager-v11.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);
vm.runInContext(`$('#club-form').onsubmit({preventDefault(){}})`,context);
let state=vm.runInContext(`({squad:activeSave.squad.length,lineup:activeSave.lineup.length,rounds:activeSave.schedule.length,roundTeams:activeSave.schedule.map(r=>new Set(r.flatMap(g=>[g.home,g.away])).size),userGames:activeSave.schedule.flat().filter(g=>g.home==='user'||g.away==='user').length})`,context);
assert.deepEqual(JSON.parse(JSON.stringify(state)),{squad:8,lineup:5,rounds:10,roundTeams:Array(10).fill(6),userGames:10});
vm.runInContext(`replaceNumber=activeSave.lineup[0];rotatePlayer(activeSave.squad.find(p=>!activeSave.lineup.includes(p.n)).n)`,context);
assert.equal(vm.runInContext(`new Set(activeSave.lineup).size`,context),5);
vm.runInContext(`for(let game=0;game<10;game++){start();for(let i=0;i<10000&&running;i++)step(.05,.05);if(running)throw Error('Match hängt')} `,context);
state=vm.runInContext(`({round:activeSave.currentRound,played:activeSave.table.map(t=>t.played),userGames:currentStats(activeSave.squad.find(p=>activeSave.lineup.includes(p.n))).games,career:sumStats(activeSave.squad.find(p=>activeSave.lineup.includes(p.n))).games})`,context);
assert.equal(state.round,10);assert(state.played.every(n=>n===10));assert.equal(state.userGames,10);assert.equal(state.career,10);
vm.runInContext(`const ageBefore=activeSave.squad[0].age;startNextSeason();if(activeSave.squad[0].age!==ageBefore+1)throw Error('Alter');if(currentStats(activeSave.squad[0]).games!==0)throw Error('Neue Saison nicht leer')`,context);
state=vm.runInContext(`({season:activeSave.seasonNumber,round:activeSave.currentRound,archive:activeSave.seasonArchive.length,previous:activeSave.squad[0].seasons.some(s=>s.number===1),saved:readSlots()[0].schema})`,context);
assert.deepEqual(JSON.parse(JSON.stringify(state)),{season:2,round:0,archive:1,previous:true,saved:2});
console.log('PASS: 6er-Liga, 10 Spieltage, Rotation, Tabelle, Saisonarchiv, Alterung und Karrierewerte');
