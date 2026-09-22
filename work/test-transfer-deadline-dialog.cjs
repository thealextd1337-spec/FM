const fs=require('fs'),vm=require('vm'),assert=require('assert');

const source=fs.readFileSync('dist/qol-v17.js','utf8');
const start=source.indexOf('function requestDeadline('),end=source.indexOf('/* Save status',start);
assert(start>=0&&end>start,'Transferschlussfunktion muss vorhanden sein');
let dialog=null,saved=0,rendered=0;
function element(tagName){const buttons=new Map();return{tagName:tagName.toUpperCase(),innerHTML:'',open:false,removed:false,
 setAttribute(){},addEventListener(type,handler){this[`on${type}`]=handler},showModal(){this.open=true},close(){this.open=false},remove(){this.removed=true},
 querySelector(selector){if(!buttons.has(selector))buttons.set(selector,{onclick:null,focus(){}});return buttons.get(selector)}}}
const state={open:true,bids:[]},context={activeSave:{},document:{body:{append(value){dialog=value}},createElement:element,querySelector(){return dialog&&!dialog.removed?dialog:null}},
 transferState:()=>state,selectedSponsor:()=>({id:'safe'}),validMatchSquad:()=>true,
 ensureFinance:()=>({balance:1200,reserved:0}),payroll:()=>650,
 forceTransferDeadline(){state.open=false},saveCurrent(){saved++},renderCenter(){rendered++},
 escapeHTML:value=>String(value),confirm(){throw Error('Browser-Dialog darf nicht verwendet werden')}};
vm.createContext(context);vm.runInContext(source.slice(start,end),context);
assert.equal(vm.runInContext('requestDeadline()',context),true);
assert.equal(dialog.tagName,'DIALOG','Bestätigung muss im Spieldesign erscheinen');
assert.equal(dialog.open,true);
assert.equal(state.open,true,'Öffnen darf das Transferfenster noch nicht schließen');
assert.match(dialog.innerHTML,/Gehälter.+Saisonende/s,'Zeitpunkt der Gehaltszahlung muss klar sein');
let prevented=false;dialog.oncancel?.({preventDefault(){prevented=true}});
assert.equal(prevented,true,'Escape darf die Entscheidung nicht bestätigen');
dialog.querySelector('[data-deadline-cancel]').onclick();
assert.equal(state.open,true,'Abbrechen lässt das Transferfenster offen');
assert.equal(vm.runInContext('requestDeadline()',context),true);
dialog.querySelector('[data-deadline-confirm]').onclick();
assert.equal(state.open,false,'erst die Bestätigung schließt das Transferfenster');
assert.equal(saved,1);assert.equal(rendered,1);
console.log('PASS: Transferschluss erklärt Gehälter und wartet auf ausdrückliche Bestätigung');
