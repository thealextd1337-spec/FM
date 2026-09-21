const fs=require('fs'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');

function makeContext(){
 const elements=new Map(),storage=new Map(),scoreboard=[];
 function element(){return{innerHTML:'',textContent:'',hidden:false,value:'',disabled:false,dataset:{},className:'',style:{setProperty(){}},classList:{toggle(){},remove(){}},firstChild:null,setAttribute(){},addEventListener(){},append(){},before(){},prepend(){},focus(){},scrollIntoView(){},insertAdjacentElement(){},insertAdjacentHTML(){},querySelector(){return element()},querySelectorAll(){return[]},closest(){return null},getContext(){return{clearRect(){},fillRect(){},strokeRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},arc(){},fill(){},ellipse(){},save(){},clip(){},restore(){},fillText(){}}}}}
 scoreboard.push(element(),element());
 const document={documentElement:element(),head:element(),querySelector(selector){if(!elements.has(selector))elements.set(selector,element());return elements.get(selector)},querySelectorAll(selector){return selector==='.scoreboard span'?scoreboard:[]},createElement:element,createTextNode:text=>text};
 elements.set('#club-name',Object.assign(element(),{value:'FC Sponsortest'}));elements.set('#club-primary',Object.assign(element(),{value:'#2244aa'}));elements.set('#club-secondary',Object.assign(element(),{value:'#ffcc22'}));
 const context={document,localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},window:{scrollTo(){}},location:{protocol:'file:'},crypto,structuredClone,performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},alert:message=>{throw Error(message)},confirm:()=>true,fetch:async()=>({ok:true}),console,Math};
 vm.createContext(context);for(const file of['game.js','manager-v11.js','identity-v12.js','season-v13.js','halftime-v14.js','finance-v15.js','sponsor-fix-v26.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);vm.runInContext(`$('#club-form').onsubmit({preventDefault(){}})`,context);return context
}

let context=makeContext();
vm.runInContext(`selectSponsor('attack')`,context);
let state=JSON.parse(JSON.stringify(vm.runInContext(`({balance:activeSave.finance.balance,paid:activeSave.finance.sponsor.paid,fixedPaid:activeSave.finance.sponsor.fixedPaid,paidAmount:activeSave.finance.sponsor.paidAmount,entries:activeSave.finance.ledger.filter(e=>e.type==='sponsor')})`,context)));
assert.equal(state.balance,1300,'Bergquell-Fixum muss sofort zum Startbudget addiert werden');assert.equal(state.paid,false);assert.equal(state.fixedPaid,true);assert.equal(state.paidAmount,650);assert.equal(state.entries.length,1);assert.equal(state.entries[0].label,'Bergquell · Fixum');
vm.runInContext(`activeSave.table.find(t=>t.id==='user').gf=12;settleSponsor();settleSponsor()`,context);
state=JSON.parse(JSON.stringify(vm.runInContext(`({balance:activeSave.finance.balance,paidAmount:activeSave.finance.sponsor.paidAmount,entries:activeSave.finance.ledger.filter(e=>e.type==='sponsor')})`,context)));
assert.equal(state.balance,1700);assert.equal(state.paidAmount,1050);assert.equal(state.entries.length,2,'Bonus darf nur einmal gebucht werden');

context=makeContext();vm.runInContext(`activeSave.finance.sponsor.selectedId='attack';activeSave.finance.sponsor.paid=false;activeSave.finance.sponsor.paidAmount=0;renderCenter()`,context);
state=JSON.parse(JSON.stringify(vm.runInContext(`({balance:activeSave.finance.balance,paidAmount:activeSave.finance.sponsor.paidAmount,fixedPaid:activeSave.finance.sponsor.fixedPaid})`,context)));
assert.deepEqual(state,{balance:1300,paidAmount:650,fixedPaid:true},'Laufende Spielstände müssen das fehlende Fixum automatisch erhalten');

context=makeContext();vm.runInContext(`selectSponsor('attack');activeSave.table.find(t=>t.id==='user').gf=0;settleSponsor()`,context);
state=JSON.parse(JSON.stringify(vm.runInContext(`({balance:activeSave.finance.balance,paidAmount:activeSave.finance.sponsor.paidAmount,success:activeSave.finance.sponsor.success})`,context)));
assert.equal(state.balance,1300);assert.equal(state.paidAmount,650);assert.equal(state.success,false);

console.log('PASS: Sponsorfixum sofort, Erfolgsbonus am Saisonende, laufende Spielstände repariert');
