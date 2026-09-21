const fs=require('fs'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
const elements=new Map(),storage=new Map(),scoreboard=[];
function element(){return{innerHTML:'',textContent:'',hidden:false,value:'',disabled:false,dataset:{},className:'',style:{setProperty(){}},classList:{toggle(){},remove(){}},setAttribute(){},addEventListener(){},append(){},before(){},prepend(){},focus(){},scrollIntoView(){},insertAdjacentElement(){},insertAdjacentHTML(){},querySelector(){return element()},querySelectorAll(){return[]},closest(){return null}}}
scoreboard.push(element(),element());
const document={documentElement:element(),querySelector:s=>{if(!elements.has(s))elements.set(s,element());return elements.get(s)},querySelectorAll:s=>s==='.scoreboard span'?scoreboard:[],createElement:element,createTextNode:t=>t};
elements.set('#club-name',Object.assign(element(),{value:'FC Farbenstadt'}));elements.set('#club-primary',Object.assign(element(),{value:'#2244aa'}));elements.set('#club-secondary',Object.assign(element(),{value:'#ffcc22'}));
const context={document,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},window:{scrollTo(){}},location:{protocol:'file:'},crypto,structuredClone,performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},alert:m=>{throw Error(m)},confirm:()=>true,fetch:async()=>({ok:true}),console,Math};vm.createContext(context);
for(const file of['game.js','manager-v11.js','identity-v12.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);
vm.runInContext(`$('#club-form').onsubmit({preventDefault(){}})`,context);
let state=vm.runInContext(`(()=>{const all=[activeSave.keeper,...activeSave.squad,...activeSave.world.teams.flatMap(t=>t.roster)];return{schema:activeSave.schema,history:activeSave.completeHistory,teams:activeSave.world.teams.length,teamSizes:activeSave.world.teams.map(t=>t.roster.length),people:all.length,names:new Set(all.map(p=>p.name)).size,nations:all.every(p=>nationData[p.nation]),feet:all.every(p=>['Links','Rechts','Beidfüßig'].includes(p.foot)),primary:activeSave.world.kits.primary,secondary:activeSave.world.kits.secondary,awayMain:activeSave.world.kits.away.main,keeper:getAwayKeeper().name,opponents:opponentPlayers().length,saved:readSlots()[0].schema}})()`,context);
assert.deepEqual(JSON.parse(JSON.stringify(state)),{schema:3,history:true,teams:5,teamSizes:[9,9,9,9,9],people:54,names:54,nations:true,feet:true,primary:'#2244aa',secondary:'#ffcc22',awayMain:'#ffcc22',keeper:vm.runInContext('activeOpponent().roster[0].name',context),opponents:5,saved:3});
vm.runInContext(`start()`,context);
assert.deepEqual(JSON.parse(JSON.stringify(vm.runInContext(`({total:match.people.length,home:match.people.filter(p=>p.t===0).length,away:match.people.filter(p=>p.t===1).length,awayOutfield:match.people.filter(p=>p.t===1&&!p.keeper).length})`,context))),{total:12,home:6,away:6,awayOutfield:5});
storage.set('sechser.saves.v1',JSON.stringify([{schema:2,id:'legacy',club:'Altverein'}]));
assert.equal(vm.runInContext(`readSlots().length`,context),1);
assert.equal(storage.has('sechser.saves.v1'),true);
assert.equal(storage.has('sechser.saves.v3'),true);
assert(vm.runInContext(`flagSVG('AT').includes('aria-label="Österreich"')&&flagSVG('DE').includes('#ffce00')`,context));
console.log('PASS: 54 eindeutige Identitäten, Flaggen, Heim/Auswärts-Trikots, Gegnerkader und isolierte Version-12-Spielstände');
