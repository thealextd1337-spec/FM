const fs=require('fs'),vm=require('vm'),assert=require('assert');

let shown=null;
function element(tagName='div'){
 const buttons=new Map();
 return{tagName:tagName.toUpperCase(),innerHTML:'',id:'',className:'',open:false,removed:false,
  setAttribute(){},addEventListener(type,handler){this[`on${type}`]=handler},
  showModal(){this.open=true;shown=this},close(){this.open=false},remove(){this.removed=true},
  querySelector(selector){if(!buttons.has(selector))buttons.set(selector,{onclick:null,focus(){}});return buttons.get(selector)}};
}
const state={day:2,offers:[{id:'free',player:{name:'Mara Test',age:22,nation:'AT'}}],bids:[],pendingResult:null};
let saved=0;
const context={activeSave:{},document:{head:{append(){}},body:{append(value){shown=value}},createElement:element,querySelector(selector){return selector==='#transfer-result-modal'&&shown?.open&&!shown.removed?shown:null},querySelectorAll(){return[]}},clubCenter:{querySelectorAll(){return[]}},transferState:()=>state,saveCurrent(){saved++},advanceTransferDay(){return true},signFreeAgent(){return true},acceptCounter(){return false},renderCenter(){},drawSlots(){},escapeHTML:value=>String(value),flagSVG:()=>'',nationData:{AT:{name:'Österreich'}},console,structuredClone};
vm.createContext(context);
vm.runInContext(fs.readFileSync('dist/transfer-result-v28.js','utf8'),context);
vm.runInContext("v28ShowTransferResults([{name:'Mara Test',age:22,nation:'Österreich',inTeam:true,status:'accepted'}],2)",context);
assert.equal(shown.tagName,'DIALOG','Transferergebnis muss ein echter modaler Dialog sein');
assert.equal(shown.open,true,'Transferergebnis muss modal geöffnet werden');
assert.doesNotMatch(shown.innerHTML,/<header\b/i,'globale Kopfzeilenregeln dürfen den Dialogkopf nicht verzerren');
assert.doesNotMatch(shown.innerHTML,/transfer-result-close/,'Ergebnis darf nicht ohne Bestätigung geschlossen werden');
let prevented=false;shown.oncancel?.({preventDefault(){prevented=true}});
assert.equal(prevented,true,'Escape darf die Bestätigung nicht umgehen');
shown.onclick?.({target:shown});
assert.equal(shown.open,true,'Klick auf den Hintergrund darf die Bestätigung nicht umgehen');
shown.querySelector('.transfer-result-ok').onclick();
assert.equal(shown.open,false,'erst die Bestätigung schließt den Dialog');
shown=null;
assert.equal(vm.runInContext("signFreeAgent('free')",context),true);
assert.equal(shown.open,true,'direkte Verpflichtung zeigt ebenfalls den Dialog');
assert.equal(state.pendingResult.results[0].name,'Mara Test','offene Bestätigung wird gespeichert');
const original=shown;vm.runInContext('renderCenter()',context);
assert.equal(shown,original,'Neuzeichnen öffnet keinen zweiten Dialog');
shown.querySelector('.transfer-result-ok').onclick();
assert.equal(state.pendingResult,null,'Bestätigung wird erst nach Klick quittiert');
assert(saved>=2,'Anzeige und Bestätigung werden gespeichert');
console.log('PASS: Transferergebnis bleibt bis zur ausdrücklichen Bestätigung sichtbar');
