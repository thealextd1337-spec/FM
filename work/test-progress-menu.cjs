const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('dist/progress-v58.js','utf8');
const start=source.indexOf('function v58DockMenu(){'),end=source.indexOf('function v58ScrollTo(',start);
assert(start>=0&&end>start,'Das Karrieremenü muss in die feste Fortschrittsleiste verschoben werden');

function element(name){return{name,parent:null,children:[],onclick:null,querySelector(selector){return selector==='.v46-menu-row'?this.children.find(child=>child.name.includes('menu'))||null:null},append(child){child.remove();this.children.push(child);child.parent=this},remove(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}}}
const slot=element('progress-inner'),intro=element('intro');
let fresh=element('menu-1');fresh.onclick=()=>1;intro.append(fresh);
const old=element('old-menu');slot.append(old);
const clubCenter={hidden:false,classList:{contains:name=>name==='v46-has-menu'},querySelector:selector=>selector==='.intro > .v46-menu-row'?fresh:null};
const v58Bar={querySelector:selector=>selector==='.career-progress-controls'?slot:null};
const context={clubCenter,v58Bar};vm.createContext(context);vm.runInContext(source.slice(start,end),context);

context.v58DockMenu();
assert.equal(fresh.parent,slot,'Das Menü muss direkt neben der Leitaktion sitzen');
assert(!intro.children.includes(fresh),'Das Menü darf nicht mehr mit der Vereinskopfzeile wegscrollen');
assert.equal(old.parent,null,'Ein altes Menü darf nicht doppelt bleiben');
assert.equal(fresh.onclick(),1,'Die bestehende Menüaktion muss erhalten bleiben');

fresh=null;context.v58DockMenu();assert.equal(slot.children.length,1,'Ein Status-Refresh darf das Menü nicht entfernen');
clubCenter.hidden=true;context.v58DockMenu();assert.equal(slot.children.length,0,'Außerhalb der Karrierezentrale darf das Menü nicht sichtbar sein');
clubCenter.hidden=false;fresh=element('menu-2');intro.append(fresh);context.v58DockMenu();assert.equal(fresh.parent,slot,'Nach erneutem Rendern muss das neue Menü übernommen werden');
assert(fs.readFileSync('dist/main-menu-v46.js','utf8').includes('aria-label="Menü"'),'Das Symbolmenü braucht einen zugänglichen Namen');
console.log('PASS: Menü bleibt neben der Leitaktion fixiert, ohne Duplikate und mit zugänglichem Symbol');
